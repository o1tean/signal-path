/* Vitest stand-in for Astro's `astro:env/server` virtual module (see the `env.schema` in astro.config.mjs). */
export const { SUPABASE_SECRET_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_COMPLETE } = process.env;
