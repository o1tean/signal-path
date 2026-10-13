/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** signed-in user, set by src/middleware.ts */
    user: null | { id: string; email: string };
    /** active product ids, e.g. "course-complete" */
    entitlements: string[];
    /** true when a paid entitlement is paused by an open dispute */
    suspended: boolean;
    /** per-request Supabase client (RLS as the signed-in user); null on prerendered routes or when unconfigured */
    supabase: import('@supabase/supabase-js').SupabaseClient | null;
  }
}

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly PUBLIC_AUTH_GOOGLE?: string;
  readonly SUPABASE_SECRET_KEY?: string;
  readonly STRIPE_SECRET_KEY?: string;
  readonly STRIPE_WEBHOOK_SECRET?: string;
  readonly STRIPE_PRICE_COMPLETE?: string;
  readonly SP_DEV_BYPASS?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
