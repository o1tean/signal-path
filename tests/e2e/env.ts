/* Test-only helpers for the local Supabase stack. Refuses anything that is not a local URL. */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { loadEnv } from 'vite';

export const env = loadEnv('development', process.cwd(), '');
export const MAILPIT = env.E2E_MAILPIT_URL || 'http://127.0.0.1:54324';
export const isLocal = /^http:\/\/(127\.0\.0\.1|localhost):/.test(env.PUBLIC_SUPABASE_URL ?? '') && Boolean(env.SUPABASE_SECRET_KEY);

export async function localStackUp(): Promise<boolean> {
  if (!isLocal) return false;
  return fetch(`${env.PUBLIC_SUPABASE_URL}/auth/v1/health`).then((r) => r.ok, () => false);
}

export const admin = () => {
  if (!isLocal) throw new Error('e2e admin client only runs against a local Supabase stack');
  return createClient(env.PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false } });
};

export async function userId(email: string): Promise<string> {
  const { data } = await admin().from('profiles').select('id').eq('email', email).single();
  if (!data) throw new Error('e2e user has no profile');
  return data.id;
}

/** Local test learner, written once by global-setup.ts. */
export const E2E_USER_FILE = '.e2e-user.json';
export interface E2EUser {
  email: string;
  password: string;
}
export const e2eUser = (): E2EUser => JSON.parse(readFileSync(E2E_USER_FILE, 'utf8'));
