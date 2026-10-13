/* POST /api/checkout: create a Stripe Checkout Session for the signed-in user.
   JSON callers get JSON (401/400/409/503). HTML form posts (BuyButton) get redirects instead. */
import type { APIRoute } from 'astro';
import { NO_STORE } from '@/lib/access';
import { appOrigin } from '@/lib/supabase/server';
import { checkoutIdempotencyKey, checkoutSessionParams, getStripe, stripeConfigured, validateCheckout } from '@/lib/stripe';

const BUY_LOGIN = '/login?next=%2Fpricing%23buy';

export const POST: APIRoute = async ({ request, locals, url, redirect }) => {
  const isForm = /application\/x-www-form-urlencoded|multipart\/form-data/.test(request.headers.get('content-type') ?? '');
  const fail = (status: number, error: string, message: string, to: string) =>
    isForm ? redirect(to, 303) : Response.json({ error, message }, { status, headers: NO_STORE });
  // Signed-out callers are turned away before their body is read.
  if (!locals.user) return fail(401, 'sign-in-required', 'Sign in before you buy.', BUY_LOGIN);

  let productId: unknown = 'course-complete';
  try {
    if (isForm) productId = (await request.formData()).get('product_id') ?? productId;
    else if (request.headers.get('content-length') !== '0') productId = ((await request.json()) as { product_id?: unknown }).product_id ?? productId;
  } catch {
    /* empty or invalid body: default product */
  }

  if (!stripeConfigured()) return fail(503, 'not-configured', 'Checkout is not configured yet.', '/checkout?error=not-configured');
  const check = validateCheckout(productId, locals.entitlements);
  if (!check.ok) return fail(check.status, check.error, check.message, check.status === 409 ? '/account' : `/checkout?error=${check.error}`);

  try {
    const session = await getStripe()!.checkout.sessions.create(
      checkoutSessionParams(locals.user, check.productId, check.price, appOrigin(url)),
      { idempotencyKey: checkoutIdempotencyKey(locals.user.id, check.productId) },
    );
    return isForm ? redirect(session.url!, 303) : Response.json({ url: session.url }, { headers: NO_STORE });
  } catch (err) {
    console.error('[checkout] stripe error', err);
    return fail(502, 'stripe-error', 'We could not reach the payment page. Try again in a minute.', '/checkout?error=stripe-error');
  }
};
