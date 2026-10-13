/* POST /auth/signout: end the session on this device. */
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ locals, redirect }) => {
  await locals.supabase?.auth.signOut({ scope: 'local' });
  return redirect('/login?signed_out=1', 303);
};
