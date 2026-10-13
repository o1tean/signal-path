/* Service-role client: bypasses RLS. Server only (webhook, tests). Never import from a component or island. */
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_SECRET_KEY } from 'astro:env/server';

if (typeof window !== 'undefined') throw new Error('lib/supabase/admin must not run in the browser');

export function supabaseAdmin() {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
