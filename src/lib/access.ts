/* Access boundary for paid material. locals come from src/middleware.ts. */
import type { ProductId } from '@/data/offer';

export type Access = 'free' | 'paid';

/** Products that unlock paid lessons. */
export const PAID_PRODUCTS: readonly ProductId[] = ['course-complete', 'mentored-path'];

/** Dev-only escape hatch: `import.meta.env.DEV` is false in builds, so a stray env var can never unlock paid lessons. */
export const devBypass = (env: { DEV?: boolean; SP_DEV_BYPASS?: string } = import.meta.env): boolean =>
  Boolean(env.DEV) && env.SP_DEV_BYPASS === '1';

export function hasAccess(locals: Partial<App.Locals>, access: Access, env?: Parameters<typeof devBypass>[0]): boolean {
  if (access === 'free') return true;
  if (devBypass(env)) return true;
  return (locals.entitlements ?? []).some((p) => PAID_PRODUCTS.includes(p as ProductId));
}

/** Headers for any response that depends on who is asking. */
export const NO_STORE = { 'Cache-Control': 'private, no-store' } as const;
