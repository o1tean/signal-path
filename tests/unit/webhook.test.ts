// @vitest-environment node
import { afterAll, describe, expect, it, beforeAll } from 'vitest';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';
import { handleStripeWebhook, supabaseStore, type EntitlementStatus, type Purchase, type PurchaseInput, type WebhookStore } from '@/lib/stripe';

const SECRET = 'whsec_test_secret';
const USER = '6f1c1c3e-2b51-4c1e-9d55-0a4b9f3c1e01';
const PI = 'pi_test_1';
const PRICES = { 'course-complete': 'price_test_complete' };

/** In-memory twin of supabaseStore(): same upsert-by-key semantics. */
function memoryStore() {
  const events = new Map<string, { processed: boolean; error: string | null }>();
  const purchases = new Map<string, Purchase & PurchaseInput>();
  const entitlements = new Map<string, { status: EntitlementStatus; source: string }>();
  let n = 0;
  const store: WebhookStore = {
    async claimEvent(id) {
      const e = events.get(id);
      if (e?.processed) return 'duplicate';
      events.set(id, { processed: false, error: null });
      return 'new';
    },
    async finishEvent(id, error) {
      events.set(id, { processed: !error, error });
    },
    async findPurchase(pi) {
      return purchases.get(pi) ?? null;
    },
    async savePurchase(p) {
      const prev = purchases.get(p.provider_payment_id);
      const row = { user_id: null, product_id: null, ...prev, ...p, id: prev?.id ?? `pur_${++n}` } as Purchase & PurchaseInput;
      purchases.set(p.provider_payment_id, row);
      return row;
    },
    async purchasesFor(userId, productId) {
      return [...purchases.values()].filter((p) => p.user_id === userId && p.product_id === productId);
    },
    async setEntitlement(userId, productId, purchaseId, status) {
      const key = `${userId}:${productId}`;
      if (status === 'revoked' && !entitlements.has(key)) return;
      entitlements.set(key, { status, source: purchaseId });
    },
  };
  return { store, events, purchases, entitlement: () => entitlements.get(`${USER}:course-complete`)?.status };
}

let seq = 0;
const run = Date.now().toString(36); // event ids must be unique across runs for the local-DB test
function send(store: WebhookStore, type: string, object: Record<string, unknown>, opts: { id?: string; secret?: string } = {}) {
  const payload = JSON.stringify({ id: opts.id ?? `evt_${run}_${++seq}`, object: 'event', type, data: { object } });
  const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: opts.secret ?? SECRET });
  return handleStripeWebhook(payload, header, SECRET, store, PRICES);
}
const session = (over: Record<string, unknown> = {}) => ({
  id: 'cs_test_1',
  object: 'checkout.session',
  payment_status: 'paid',
  payment_intent: PI,
  client_reference_id: USER,
  customer: 'cus_1',
  mode: 'payment',
  amount_total: 14900,
  currency: 'eur',
  metadata: { product_id: 'course-complete', price_id: 'price_test_complete' },
  ...over,
});
const refund = (refunded = true) => ({ id: 'ch_1', object: 'charge', payment_intent: PI, refunded });
const dispute = (status: string) => ({ id: 'dp_1', object: 'dispute', payment_intent: PI, status });

describe('stripe webhook', () => {
  it('grants once for a paid session', async () => {
    const m = memoryStore();
    const res = await send(m.store, 'checkout.session.completed', session());
    expect(res.status).toBe(200);
    expect(m.entitlement()).toBe('active');
    expect(m.purchases.get(PI)).toMatchObject({ status: 'paid', user_id: USER, amount_cents: 14900, provider_order_id: 'cs_test_1' });
  });

  it('treats a repeated event id as a no-op', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session(), { id: 'evt_dup' });
    await m.store.setEntitlement(USER, 'course-complete', m.purchases.get(PI)!.id, 'revoked'); // change state behind its back
    const res = await send(m.store, 'checkout.session.completed', session(), { id: 'evt_dup' });
    expect(res.body).toMatchObject({ duplicate: true });
    expect(m.entitlement()).toBe('revoked');
  });

  it('rejects a bad signature with 400 and records nothing', async () => {
    const m = memoryStore();
    const res = await send(m.store, 'checkout.session.completed', session(), { secret: 'whsec_wrong' });
    expect(res.status).toBe(400);
    expect(m.events.size).toBe(0);
    expect(m.entitlement()).toBeUndefined();
  });

  it('ignores unpaid sessions and unknown products', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session({ payment_status: 'unpaid' }));
    await send(m.store, 'checkout.session.completed', session({ metadata: { product_id: 'something-else' } }));
    expect(m.entitlement()).toBeUndefined();
  });

  it('ignores products not on sale, foreign prices and non-payment sessions', async () => {
    const m = memoryStore();
    const mentored = await send(m.store, 'checkout.session.completed', session({ metadata: { product_id: 'mentored-path', price_id: 'price_test_complete' } }));
    expect(mentored.body).toMatchObject({ result: 'ignored: unknown product' });
    const foreign = await send(m.store, 'checkout.session.completed', session({ amount_total: 1, metadata: { product_id: 'course-complete', price_id: 'price_other' } }));
    expect(foreign.body).toMatchObject({ result: 'ignored: price mismatch' });
    const noPrice = await send(m.store, 'checkout.session.completed', session({ metadata: { product_id: 'course-complete' } }));
    expect(noPrice.body).toMatchObject({ result: 'ignored: price mismatch' });
    const sub = await send(m.store, 'checkout.session.completed', session({ mode: 'subscription' }));
    expect(sub.body).toMatchObject({ result: 'ignored: not a one-time payment' });
    expect(m.entitlement()).toBeUndefined();
    expect(m.purchases.size).toBe(0);
  });

  it('keeps access when a duplicate purchase is refunded and the other is still paid', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session());
    await send(m.store, 'checkout.session.completed', session({ id: 'cs_test_2', payment_intent: 'pi_test_2' }));
    await send(m.store, 'charge.refunded', { ...refund(true), payment_intent: 'pi_test_2' });
    expect(m.entitlement()).toBe('active');
    await send(m.store, 'charge.dispute.created', dispute('needs_response'));
    expect(m.entitlement()).toBe('suspended');
    await send(m.store, 'charge.refunded', refund(true));
    expect(m.entitlement()).toBe('revoked');
  });

  it('revokes on a full refund and ignores a partial one', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session());
    await send(m.store, 'charge.refunded', refund(false));
    expect(m.entitlement()).toBe('active');
    await send(m.store, 'charge.refunded', refund(true));
    expect(m.entitlement()).toBe('revoked');
    expect(m.purchases.get(PI)!.status).toBe('refunded');
  });

  it('suspends on a dispute and restores when it is won', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session());
    await send(m.store, 'charge.dispute.created', dispute('needs_response'));
    expect(m.entitlement()).toBe('suspended');
    await send(m.store, 'charge.dispute.closed', dispute('won'));
    expect(m.entitlement()).toBe('active');
    expect(m.purchases.get(PI)!.status).toBe('paid');
  });

  it('keeps access suspended when a dispute is lost', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session());
    await send(m.store, 'charge.dispute.created', dispute('needs_response'));
    await send(m.store, 'charge.dispute.closed', dispute('lost'));
    expect(m.entitlement()).toBe('suspended');
  });

  it('does not grant when the refund arrives before the session event', async () => {
    const m = memoryStore();
    await send(m.store, 'charge.refunded', refund(true));
    await send(m.store, 'checkout.session.completed', session());
    expect(m.entitlement()).toBeUndefined();
    expect(m.purchases.get(PI)).toMatchObject({ status: 'refunded', user_id: USER });
  });

  it('grants suspended when the dispute arrives before the session event', async () => {
    const m = memoryStore();
    await send(m.store, 'charge.dispute.created', dispute('needs_response'));
    await send(m.store, 'checkout.session.completed', session());
    expect(m.entitlement()).toBe('suspended');
  });

  it('does not restore a refunded purchase from a late dispute win', async () => {
    const m = memoryStore();
    await send(m.store, 'checkout.session.completed', session());
    await send(m.store, 'charge.refunded', refund(true));
    await send(m.store, 'charge.dispute.created', dispute('needs_response'));
    await send(m.store, 'charge.dispute.closed', dispute('won'));
    expect(m.entitlement()).toBe('revoked');
    expect(m.purchases.get(PI)!.status).toBe('refunded');
  });

  it('returns 500 and leaves the event retryable when the store fails', async () => {
    const m = memoryStore();
    m.store.setEntitlement = async () => {
      throw new Error('db down');
    };
    const res = await send(m.store, 'checkout.session.completed', session(), { id: 'evt_fail' });
    expect(res.status).toBe(500);
    expect(m.events.get('evt_fail')).toEqual({ processed: false, error: 'db down' });
  });
});

/* Same flow against the local Supabase stack (npx supabase start), to cover supabaseStore and the SQL constraints.
   Skipped unless .env points at a local stack, so it never touches a hosted project. */
const env = loadEnv('development', process.cwd(), '');
const localDb = /^http:\/\/(127\.0\.0\.1|localhost):/.test(env.PUBLIC_SUPABASE_URL ?? '') && Boolean(env.SUPABASE_SECRET_KEY);
const reachable = localDb && (await fetch(`${env.PUBLIC_SUPABASE_URL}/auth/v1/health`).then((r) => r.ok, () => false));

describe.runIf(reachable)('stripe webhook against the local database', () => {
  // Created in beforeAll: vitest still collects a skipped suite's body, and createClient throws without a URL (CI).
  let db: SupabaseClient;
  let store: ReturnType<typeof supabaseStore>;
  beforeAll(() => {
    db = createClient(env.PUBLIC_SUPABASE_URL!, env.SUPABASE_SECRET_KEY!, { auth: { persistSession: false } });
    store = supabaseStore(db);
  });
  const pi = `pi_local_${Date.now()}`;
  let userId = '';
  const status = async () =>
    (await db.from('entitlements').select('status').eq('user_id', userId).eq('product_id', 'course-complete').maybeSingle()).data?.status;

  afterAll(async () => {
    if (userId) await db.auth.admin.deleteUser(userId);
    await db.from('purchases').delete().eq('provider_payment_id', pi);
  });

  it('grants, ignores a duplicate, refunds, and keeps the refund on a late session event', async () => {
    const { data, error } = await db.auth.admin.createUser({ email: `webhook-${Date.now()}@example.test`, email_confirm: true });
    expect(error).toBeNull();
    userId = data.user!.id;
    const profile = await db.from('profiles').select('id').eq('id', userId).single();
    expect(profile.data?.id).toBe(userId); // trigger created the profile

    const evt = `evt_local_${Date.now()}`;
    const s = session({ payment_intent: pi, client_reference_id: userId, id: `cs_${pi}` });
    expect((await send(store, 'checkout.session.completed', s, { id: evt })).status).toBe(200);
    expect(await status()).toBe('active');
    expect((await send(store, 'checkout.session.completed', s, { id: evt })).body).toMatchObject({ duplicate: true });

    await send(store, 'charge.refunded', { ...refund(true), payment_intent: pi });
    expect(await status()).toBe('revoked');
    await send(store, 'checkout.session.completed', s);
    expect(await status()).toBe('revoked');

    const events = await db.from('webhook_events').select('processed_at').eq('id', evt).single();
    expect(events.data?.processed_at).toBeTruthy();
  });
});
