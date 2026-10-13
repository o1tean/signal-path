/* POST /api/stripe/webhook. Raw body + signature check, then lib/stripe does the rest. */
import type { APIRoute } from 'astro';
import { STRIPE_WEBHOOK_SECRET } from 'astro:env/server';
import { handleStripeWebhook, supabaseStore } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const POST: APIRoute = async ({ request }) => {
  const secret = STRIPE_WEBHOOK_SECRET;
  const db = supabaseAdmin();
  if (!secret || !db) return Response.json({ error: 'not-configured' }, { status: 503 });
  const { status, body } = await handleStripeWebhook(
    await request.text(),
    request.headers.get('stripe-signature'),
    secret,
    supabaseStore(db),
  );
  return Response.json(body, { status });
};
