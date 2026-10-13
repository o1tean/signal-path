/* Per-request Supabase client bound to Astro cookies. Created in src/middleware.ts; read it from Astro.locals.supabase. */
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = () => Boolean(url && key);

/** `headers` collects the no-cache headers the library asks for whenever it writes auth cookies. */
export function createSupabaseServer(request: Request, cookies: AstroCookies, headers: Headers) {
  return createServerClient(url!, key!, {
    // Nothing in the browser reads the session (sync goes through /api/learner-state), so keep it out of JS.
    cookieOptions: { httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax', path: '/' },
    cookies: {
      getAll: () =>
        parseCookieHeader(request.headers.get('Cookie') ?? '').map((c) => ({ name: c.name, value: c.value ?? '' })),
      setAll(list, extra) {
        for (const { name, value, options } of list) cookies.set(name, value, options as Parameters<AstroCookies['set']>[2]);
        for (const [k, v] of Object.entries(extra ?? {})) headers.set(k, v);
      },
    },
  });
}

/** Public base URL for links that leave the site (auth emails, Stripe redirects). In production it never comes
    from the request's Host header, so a missing PUBLIC_SITE_URL fails loudly instead. */
export function appOrigin(url: URL): string {
  if (!import.meta.env.PROD) return url.origin;
  if (!import.meta.env.PUBLIC_SITE_URL) throw new Error('PUBLIC_SITE_URL must be set in production');
  return import.meta.env.PUBLIC_SITE_URL;
}

/** Only same-site paths are allowed as post-login destinations. Control characters and backslashes are refused
    outright (browsers strip tabs/newlines, so "/\t/evil" would become "//evil"); the rest must resolve to our origin. */
export function safeNext(next: string | null | undefined, fallback = '/learn'): string {
  if (!next || !next.startsWith('/') || /[\x00-\x1f\x7f\\]/.test(next)) return fallback;
  try {
    const u = new URL(next, 'http://x.invalid');
    return u.origin === 'http://x.invalid' ? u.pathname + u.search + u.hash : fallback;
  } catch {
    return fallback;
  }
}
