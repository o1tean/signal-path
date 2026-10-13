/* GET /api/entitlements: what the signed-in user owns. Polled by /checkout/success. */
import type { APIRoute } from 'astro';
import { NO_STORE } from '@/lib/access';

export const GET: APIRoute = ({ locals }) =>
  Response.json(
    { signedIn: Boolean(locals.user), entitlements: locals.entitlements, suspended: locals.suspended },
    { status: locals.user ? 200 : 401, headers: NO_STORE },
  );
