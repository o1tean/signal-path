/* Shared helpers for /login and /auth/callback. */
import { safeNext } from './server';

/** Buy intents go to /checkout, which is on-demand and can POST to Stripe once the visitor is signed in. */
export function afterLogin(next: string | null | undefined): string {
  const to = safeNext(next);
  return /^\/(pricing|checkout)(\/|\?|#|$)/.test(to) && (to.includes('#buy') || to.startsWith('/checkout')) ? '/checkout' : to;
}

export type LoginError = 'invalid-email' | 'rate-limit' | 'expired' | 'other-browser' | 'failed';

/** Map a Supabase auth error to one of the copy's login errors (docs/v2/copy/auth.md#login-errors). */
export function loginError(err: { status?: number; code?: string; message?: string } | null | undefined): LoginError {
  const code = err?.code ?? '';
  const msg = (err?.message ?? '').toLowerCase();
  if (err?.status === 429 || code.includes('rate_limit')) return 'rate-limit';
  if (code === 'validation_failed' || code === 'email_address_invalid' || msg.includes('invalid') && msg.includes('email')) return 'invalid-email';
  if (code === 'bad_code_verifier' || msg.includes('code verifier')) return 'other-browser';
  if (code === 'otp_expired' || code === 'flow_state_expired' || code === 'flow_state_not_found' || msg.includes('expired')) return 'expired';
  return 'failed';
}
