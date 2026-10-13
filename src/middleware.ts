/* Sets locals.user, locals.entitlements, locals.suspended and locals.supabase for on-demand routes.
   Prerendered pages skip all of it, so static HTML never depends on a visitor. */
import { defineMiddleware } from 'astro:middleware';
import { createSupabaseServer, supabaseConfigured } from '@/lib/supabase/server';

export const onRequest = defineMiddleware(async (ctx, next) => {
  ctx.locals.user = null;
  ctx.locals.entitlements = [];
  ctx.locals.suspended = false;
  ctx.locals.supabase = null;
  if (ctx.isPrerendered) return next();
  if (!supabaseConfigured()) return privateByDefault(await next());

  const authHeaders = new Headers();
  const supabase = createSupabaseServer(ctx.request, ctx.cookies, authHeaders);
  ctx.locals.supabase = supabase;
  try {
    const { data } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (claims?.sub) {
      ctx.locals.user = { id: claims.sub, email: typeof claims.email === 'string' ? claims.email : '' };
      const { data: rows } = await supabase.from('entitlements').select('product_id, status');
      ctx.locals.entitlements = (rows ?? []).filter((r) => r.status === 'active').map((r) => r.product_id);
      ctx.locals.suspended = (rows ?? []).some((r) => r.status === 'suspended');
    }
  } catch (err) {
    // Auth outage: treat the visitor as signed out rather than failing every page.
    console.error('[middleware] supabase auth failed', err);
  }

  const res = await next();
  authHeaders.forEach((v, k) => {
    try {
      res.headers.set(k, v);
    } catch {
      /* immutable headers (redirect responses) */
    }
  });
  return privateByDefault(res);
});

/** On-demand pages can carry who is signed in (data-signed-in, account details), so a shared cache must never keep
    them unless the route chose a policy itself. */
function privateByDefault(res: Response): Response {
  try {
    if (!res.headers.has('Cache-Control')) res.headers.set('Cache-Control', 'private, no-store');
  } catch {
    /* immutable headers (redirect responses) */
  }
  return res;
}
