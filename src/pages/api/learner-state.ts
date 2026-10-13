/* GET/PUT /api/learner-state: the signed-in user's synced learner store. Last write wins by updatedAt. */
import type { APIRoute } from 'astro';
import { NO_STORE } from '@/lib/access';

const MAX_BYTES = 256 * 1024;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: NO_STORE });

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || !locals.supabase) return json({ error: 'sign-in-required' }, 401);
  const { data, error } = await locals.supabase.from('learner_state').select('state, updated_at').maybeSingle();
  if (error) return json({ error: 'read-failed' }, 500);
  return json(data ? { state: data.state, updatedAt: data.updated_at } : { state: null, updatedAt: null });
};

export const PUT: APIRoute = async ({ locals, request }) => {
  if (!locals.user || !locals.supabase) return json({ error: 'sign-in-required' }, 401);
  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_BYTES) return json({ error: 'too-large', max: MAX_BYTES }, 413);
  let body: { state?: unknown; updatedAt?: unknown };
  try {
    body = JSON.parse(text);
  } catch {
    return json({ error: 'invalid-json' }, 400);
  }
  const sent = typeof body.updatedAt === 'string' ? new Date(body.updatedAt) : null;
  if (!body.state || typeof body.state !== 'object' || Array.isArray(body.state) || !sent || isNaN(+sent))
    return json({ error: 'invalid-state' }, 400);
  // A device whose clock runs ahead must not stamp a future time that every later save would lose to.
  const updatedAt = new Date(Math.min(+sent, Date.now()));

  const db = locals.supabase;
  const { data: current } = await db.from('learner_state').select('state, updated_at').maybeSingle();
  // ponytail: read-then-write, so two devices saving in the same instant can both "win"; fine for one learner.
  if (current && new Date(current.updated_at) > updatedAt) return json({ state: current.state, updatedAt: current.updated_at }, 409);

  const { error } = await db
    .from('learner_state')
    .upsert({ user_id: locals.user.id, state: body.state, updated_at: updatedAt.toISOString() });
  if (error) return json({ error: 'write-failed' }, 500);
  return json({ ok: true, updatedAt: updatedAt.toISOString() });
};
