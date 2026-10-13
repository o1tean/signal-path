/* Stripe Checkout + webhook logic. Server only. The webhook handler takes a small store so tests can run it
   without a database; the route passes supabaseStore(admin). */
import Stripe from 'stripe';
import type { SupabaseClient } from '@supabase/supabase-js';
import { STRIPE_PRICE_COMPLETE, STRIPE_SECRET_KEY } from 'astro:env/server';
import { tiers, type ProductId } from '@/data/offer';

export const stripeConfigured = () => Boolean(STRIPE_SECRET_KEY);
export const getStripe = () => (STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null);

/* ---------- checkout ---------- */

/** Stripe price id per sellable product; a product without a price env var cannot be bought. */
export const priceIds = (env: Record<string, string | undefined> = { STRIPE_PRICE_COMPLETE }): Partial<Record<ProductId, string>> => ({
  'course-complete': env.STRIPE_PRICE_COMPLETE || undefined,
});

export type CheckoutCheck =
  | { ok: true; productId: ProductId; price: string }
  | { ok: false; status: 400 | 409 | 503; error: string; message: string };

export function validateCheckout(
  productId: unknown,
  owned: readonly string[],
  prices: Partial<Record<ProductId, string>> = priceIds(),
): CheckoutCheck {
  const tier = tiers.find((t) => t.productId && t.productId === productId);
  if (!tier || !tier.available || !tier.productId)
    return { ok: false, status: 400, error: 'unknown-product', message: 'That product cannot be bought.' };
  const price = prices[tier.productId];
  if (!price)
    return { ok: false, status: 503, error: 'not-configured', message: 'Checkout is not configured yet.' };
  if (owned.includes(tier.productId))
    return { ok: false, status: 409, error: 'already-owned', message: 'You already have this course.' };
  return { ok: true, productId: tier.productId, price };
}

/** Stable per user, product and 10-minute window: two tabs or a double click reuse one Checkout Session
    instead of opening two payments for the same course. */
export const checkoutIdempotencyKey = (userId: string, productId: ProductId, now = Date.now()) =>
  `checkout:${userId}:${productId}:${Math.floor(now / 600_000)}`;

export function checkoutSessionParams(
  user: { id: string; email: string },
  productId: ProductId,
  price: string,
  origin: string,
): Stripe.Checkout.SessionCreateParams {
  return {
    mode: 'payment',
    line_items: [{ price, quantity: 1 }],
    client_reference_id: user.id,
    customer_email: user.email || undefined,
    // price_id lets the webhook check that the session sold this product at its configured price
    metadata: { product_id: productId, user_id: user.id, price_id: price },
    payment_intent_data: { metadata: { product_id: productId, user_id: user.id } },
    success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout/cancel`,
  };
}

/* ---------- webhook ---------- */

export type PurchaseStatus = 'paid' | 'refunded' | 'disputed' | 'canceled';
export type EntitlementStatus = 'active' | 'suspended' | 'revoked';
export interface Purchase {
  id: string;
  status: PurchaseStatus;
  user_id: string | null;
  product_id: string | null;
}
export interface PurchaseInput {
  provider_payment_id: string;
  status: PurchaseStatus;
  user_id?: string;
  product_id?: string;
  provider_order_id?: string;
  provider_customer_id?: string | null;
  amount_cents?: number | null;
  currency?: string | null;
  raw?: unknown;
}
export interface WebhookStore {
  /** Record the event. 'duplicate' when it was already processed successfully. */
  claimEvent(id: string, type: string): Promise<'new' | 'duplicate'>;
  finishEvent(id: string, error: string | null): Promise<void>;
  findPurchase(paymentId: string): Promise<Purchase | null>;
  /** Upsert on provider_payment_id, writing only the given fields. */
  savePurchase(p: PurchaseInput): Promise<Purchase>;
  /** Every purchase of one product by one user (a buyer can pay twice from two tabs). */
  purchasesFor(userId: string, productId: string): Promise<Pick<Purchase, 'id' | 'status'>[]>;
  /** Upsert on (user_id, product_id). 'revoked' only updates an existing row and never creates one. */
  setEntitlement(userId: string, productId: string, purchaseId: string, status: EntitlementStatus): Promise<void>;
}

const idOf = (x: string | { id: string } | null | undefined) => (typeof x === 'string' ? x : (x?.id ?? null));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Only products that are on sale can be granted, whatever a session's metadata says. */
const SELLABLE = new Set(tiers.filter((t) => t.available && t.productId).map((t) => t.productId));

/** Recompute one user's entitlement from all their purchases of that product, so refunding a duplicate payment
    never removes access that another, still-paid purchase pays for. */
async function reconcile(store: WebhookStore, p: Purchase): Promise<EntitlementStatus | null> {
  if (!p.user_id || !p.product_id) return null; // refund or dispute seen before checkout completed: nothing to grant
  const all = await store.purchasesFor(p.user_id, p.product_id);
  const paid = all.find((x) => x.status === 'paid');
  const disputed = all.find((x) => x.status === 'disputed');
  const status: EntitlementStatus = paid ? 'active' : disputed ? 'suspended' : 'revoked';
  await store.setEntitlement(p.user_id, p.product_id, (paid ?? disputed ?? p).id, status);
  return status;
}

/** Apply one verified event. Every branch is idempotent and safe in any arrival order:
    a refund or dispute that lands before checkout.session.completed leaves a purchase row whose status wins. */
export async function applyStripeEvent(
  event: Stripe.Event,
  store: WebhookStore,
  prices: Partial<Record<ProductId, string>> = priceIds(),
): Promise<string> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const s = event.data.object as Stripe.Checkout.Session;
      const productId = s.metadata?.product_id ?? '';
      const userId = s.client_reference_id ?? '';
      const paymentId = idOf(s.payment_intent);
      if (s.payment_status !== 'paid') return 'ignored: not paid';
      if (s.mode !== 'payment') return 'ignored: not a one-time payment';
      if (!SELLABLE.has(productId as ProductId)) return 'ignored: unknown product';
      // A session from a payment link or another integration on the same Stripe account carries no matching price.
      if (!s.metadata?.price_id || s.metadata.price_id !== prices[productId as ProductId]) return 'ignored: price mismatch';
      if (!UUID.test(userId) || !paymentId) return 'ignored: missing user or payment';
      const prior = await store.findPurchase(paymentId);
      const status: PurchaseStatus = prior && prior.status !== 'paid' ? prior.status : 'paid';
      const purchase = await store.savePurchase({
        provider_payment_id: paymentId,
        provider_order_id: s.id,
        provider_customer_id: idOf(s.customer),
        user_id: userId,
        product_id: productId,
        amount_cents: s.amount_total,
        currency: s.currency,
        status,
        raw: s,
      });
      await reconcile(store, purchase);
      return `purchase ${status}`;
    }
    case 'charge.refunded': {
      const c = event.data.object as Stripe.Charge;
      const paymentId = idOf(c.payment_intent);
      if (!paymentId) return 'ignored: no payment intent';
      if (!c.refunded) return 'ignored: partial refund';
      await reconcile(store, await store.savePurchase({ provider_payment_id: paymentId, status: 'refunded' }));
      return 'refunded';
    }
    case 'charge.dispute.created': {
      const d = event.data.object as Stripe.Dispute;
      const paymentId = idOf(d.payment_intent);
      if (!paymentId) return 'ignored: no payment intent';
      const prior = await store.findPurchase(paymentId);
      if (prior?.status === 'refunded') return 'ignored: already refunded';
      await reconcile(store, await store.savePurchase({ provider_payment_id: paymentId, status: 'disputed' }));
      return 'suspended';
    }
    case 'charge.dispute.closed': {
      const d = event.data.object as Stripe.Dispute;
      const paymentId = idOf(d.payment_intent);
      if (!paymentId || d.status !== 'won') return `ignored: dispute ${d.status}`;
      const prior = await store.findPurchase(paymentId);
      if (prior?.status !== 'disputed') return 'ignored: not disputed';
      await reconcile(store, await store.savePurchase({ provider_payment_id: paymentId, status: 'paid' }));
      return 'restored';
    }
    default:
      return `ignored: ${event.type}`;
  }
}

/** Whole webhook request: signature check, idempotency, dispatch. Returns the HTTP status and a JSON body. */
export async function handleStripeWebhook(
  rawBody: string,
  signature: string | null,
  secret: string,
  store: WebhookStore,
  prices?: Partial<Record<ProductId, string>>,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature ?? '', secret);
  } catch {
    return { status: 400, body: { error: 'bad-signature' } };
  }
  if ((await store.claimEvent(event.id, event.type)) === 'duplicate') return { status: 200, body: { received: true, duplicate: true } };
  try {
    const result = await applyStripeEvent(event, store, prices);
    await store.finishEvent(event.id, null);
    return { status: 200, body: { received: true, result } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await store.finishEvent(event.id, message).catch(() => {});
    return { status: 500, body: { error: 'processing-failed' } }; // Stripe retries
  }
}

/** WebhookStore over the service-role Supabase client. */
export function supabaseStore(db: SupabaseClient): WebhookStore {
  const must = <T>({ data, error }: { data: T; error: { message: string } | null }) => {
    if (error) throw new Error(error.message);
    return data;
  };
  return {
    async claimEvent(id, type) {
      const { error } = await db.from('webhook_events').insert({ id, type, provider: 'stripe' });
      if (!error) return 'new';
      if (error.code !== '23505') throw new Error(error.message);
      const row = must(await db.from('webhook_events').select('processed_at').eq('id', id).single());
      return row?.processed_at ? 'duplicate' : 'new'; // a failed attempt is retried
    },
    async finishEvent(id, error) {
      must(await db.from('webhook_events').update({ processed_at: error ? null : new Date().toISOString(), error }).eq('id', id));
    },
    async findPurchase(paymentId) {
      return must(
        await db.from('purchases').select('id, status, user_id, product_id').eq('provider_payment_id', paymentId).maybeSingle(),
      );
    },
    async savePurchase(p) {
      return must(
        await db
          .from('purchases')
          .upsert({ provider: 'stripe', ...p }, { onConflict: 'provider_payment_id' })
          .select('id, status, user_id, product_id')
          .single(),
      )!;
    },
    async purchasesFor(userId, productId) {
      return must(await db.from('purchases').select('id, status').eq('user_id', userId).eq('product_id', productId)) ?? [];
    },
    async setEntitlement(userId, productId, purchaseId, status) {
      if (status === 'revoked') {
        must(await db.from('entitlements').update({ status, source_purchase_id: purchaseId }).eq('user_id', userId).eq('product_id', productId));
        return;
      }
      must(
        await db
          .from('entitlements')
          .upsert(
            { user_id: userId, product_id: productId, status, source_purchase_id: purchaseId, granted_at: new Date().toISOString() },
            { onConflict: 'user_id,product_id' },
          ),
      );
    },
  };
}
