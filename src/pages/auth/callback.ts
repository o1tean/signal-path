/* GET /auth/callback: finish an email link or OAuth sign-in, then go to `next`.
   Production accepts only the PKCE `code`, whose verifier lives in the browser that asked for the link, so a link
   minted for someone else's account cannot sign a visitor in (login CSRF). `token_hash` is accepted under
   `astro dev` only, where the e2e specs sign in with admin-generated links. */
import type { APIRoute } from 'astro';
import type { EmailOtpType } from '@supabase/supabase-js';
import { afterLogin, loginError } from '@/lib/supabase/auth';

export const GET: APIRoute = async ({ url, locals, redirect }) => {
  const next = afterLogin(url.searchParams.get('next'));
  const back = (reason: string) => redirect(`/login?error=${reason}&next=${encodeURIComponent(next)}`, 303);
  if (!locals.supabase) return back('failed');
  if (url.searchParams.get('error')) return back(loginError({ code: url.searchParams.get('error_code') ?? '', message: url.searchParams.get('error_description') ?? '' }));

  const code = url.searchParams.get('code');
  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const { error } = code
    ? await locals.supabase.auth.exchangeCodeForSession(code)
    : import.meta.env.DEV && tokenHash && type
      ? await locals.supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: { code: 'otp_expired' } };
  return error ? back(loginError(error)) : redirect(next, 303);
};
