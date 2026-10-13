# Platform track report

Signal Path v2, 12 October 2026. Auth, paywall, Stripe, learner sync, deploy docs. Architecture: `docs/v2/architecture.md`; how to run and launch: `docs/v2/deploy.md`.

## What was built

| Area | Files | Behaviour |
|---|---|---|
| Session | `src/middleware.ts`, `src/lib/supabase/{server,client,admin,auth}.ts` | `@supabase/ssr` server client per request (cookie `getAll`/`setAll`), `auth.getClaims()` once in middleware, `locals.user`, `locals.entitlements`, `locals.suspended`. Skipped on prerendered routes. |
| Access | `src/lib/access.ts`, `src/pages/learn/[slug].astro`, `src/layouts/Lesson.astro`, `src/components/learn/Paywall.astro` | Paid bodies are rendered only after `hasAccess()`; locked pages get frontmatter plus the paywall (`signed-out`, `signed-in`, `suspended`) and `Cache-Control: private, no-store`. `SP_DEV_BYPASS=1` works under `astro dev` only. |
| Sign-in | `src/pages/login.astro`, `src/pages/auth/{callback,signout}.ts`, `src/components/learn/AuthButtons.astro` | Magic link (PKCE) with `next` round-trip; callback accepts `code` or `token_hash`+`type`; errors `expired`, `other-browser`, `rate-limit`, `other`. Optional Google button behind `PUBLIC_AUTH_GOOGLE=1`. |
| Checkout | `src/lib/stripe.ts`, `src/pages/api/checkout.ts`, `src/pages/checkout/{index,success,cancel}.astro` | Stripe Checkout session with `metadata.product_id`; JSON for `fetch`, 303 for form posts; 503 "Checkout is not configured yet." without keys. `/checkout/success` polls `/api/entitlements` until the webhook lands. |
| Webhook | `src/pages/api/stripe/webhook.ts`, `src/lib/stripe.ts` | Signature on the raw body, `webhook_events` idempotency, 500 on processing error so Stripe retries. `checkout.session.completed` and `async_payment_succeeded` grant; `charge.refunded` revokes; `charge.dispute.created` suspends; `closed` won restores, lost stays suspended. Events in any order. |
| Entitlement APIs | `src/pages/api/entitlements.ts`, `src/pages/api/downloads/[name].ts` | 401 anonymous, 403 unentitled, 404 outside the allowlist (no path traversal), `private, no-store`. Files read from `private/downloads` at request time. |
| Learner sync | `src/lib/learner.ts`, `src/pages/api/learner-state.ts` | Last write wins by `updatedAt` (409 on stale, 413 over 256 KB). Push on quiet, pull on load, only when `<html data-signed-in="true">`. |
| Account | `src/pages/account.astro` | Purchases, access status, 30-day refund window (mailto), data export, sign-out dialog. Copy from `docs/v2/copy/auth.md`. |
| Database | `supabase/migrations/0001_init.sql`, `supabase/config.toml` | `profiles`, `purchases` (keyed by PaymentIntent id), `entitlements`, `webhook_events`, `learner_state`; RLS on all; profile trigger on new users. |
| Tests | `tests/unit/{webhook,access,checkout,learner}.test.ts`, `tests/e2e/{paywall,platform,signin}.spec.ts`, `tests/e2e/{env,global-setup}.ts`, `playwright.config.ts` | Unit: signature, duplicate, refund, dispute, out-of-order, access matrix, checkout handler, sync merge. E2E against the shared dev server and the local Supabase stack with Mailpit. |
| Ops | `.github/workflows/ci.yml`, `.env.example`, `docs/v2/deploy.md`, `CLAUDE.md` (Verified APIs), `docs/v2/architecture.md` (deviations) | CI runs `npm run verify` (astro check, content check, vitest, build). |

## Verification (final run, 23:47)

- `npx astro check`: 0 errors, 0 warnings, 0 hints.
- `npx vitest run tests/unit`: 7 files, 40 tests passed (webhook suite also hits the local database).
- `npx playwright test tests/e2e/paywall.spec.ts tests/e2e/platform.spec.ts tests/e2e/signin.spec.ts`: 11 passed in 19 s (paywall 4, platform 6, sign-in 1), including real magic-link sign-in from Mailpit, entitlement grant, download, learner sync and the 409/413 paths.
- `npm run check:content`: PASS (77 warnings, all content-track quiz shape).
- Account page checked signed in at 360 and 1280, light and dark: `docs/v2/screenshots/account-{light,dark}-{360,1280}.png`.

## Changes in this last session

- `src/lib/learner.ts`: dropped `keepalive: true` from the sync PUT. It caps request bodies at 64 KB (state may be 256 KB) and Playwright cannot observe such requests. A change made just before leaving the page is pushed on the next load instead, because its stamp is newer.
- E2E specs: the paid-body marker moved from `AM650` to `FuriHalSubGhzPresetOok650Async` after the content track put `AM650` in the lesson's public description (meta and lede). `paywall.spec.ts` additionally asserts `.lesson-prose` has count 0 on locked pages, which does not depend on content. `signin.spec.ts` now stubs the HMR socket like `platform.spec.ts`, so other agents' edits cannot reload the page mid-test.
- `src/pages/account.astro`: `break-all` on the two email spans so long addresses wrap at 360 px.
- Deleted `tests/e2e/zz-debug.spec.ts` (scratch).
- `.env.example` rewritten as the env contract; `docs/v2/deploy.md` written (env table, local dev, hosted migration, Supabase Auth settings, Stripe product/webhook/test walkthrough, Node hosting and the Vercel Pro switch, Pages shutdown, launch checklist).
- `CLAUDE.md` Verified APIs: `@supabase/ssr` 0.12.7 cookie contract and PKCE callback, Astro 7.3.8 `isPrerendered` and the `.env` reload caveat, Stripe 23 static webhook helpers, Supabase CLI 2.120 keys and Mailpit API, the `keepalive` cap.
- `docs/v2/architecture.md`: recorded deviations (purchases keyed by PaymentIntent, extra webhook event, `/checkout` hop after sign-in because `/pricing` is prerendered, sync always on while signed in).

## Open items for the owner

1. 57 `[NEED: ...]` tokens remain in `src` (support email, legal entity, VAT, response times). `grep -rn "\[NEED" src docs/v2/copy`.
2. Supabase dashboard work before launch: Site URL and redirect URL, custom SMTP, magic-link template, optionally Google. Hosted migration via `npx supabase db push` (`docs/v2/deploy.md` sections 3 and 4).
3. Stripe live product, price and webhook with the five events; one full test-mode purchase, refund and dispute (section 5).
4. GitHub Pages is still serving the old open site until disabled (section 7).

## Deliberate simplifications

- Refund request is a `mailto:` on the account page, not a self-serve refund endpoint. Add `POST /api/refund` calling `stripe.refunds.create` when volume justifies it; the webhook already handles the resulting `charge.refunded`.
- No "Receipt" link on purchase rows: `purchases` has no `receipt_url` column. Add the column and copy `charge.receipt_url` in the webhook when wanted.
- `signin.spec.ts` and `platform.spec.ts` overlap (both sign in by emailed link and check the paywall). Fold the extra checks of `signin.spec.ts` (checkout 503/400, `/account` status text) into `platform.spec.ts` when the suite is next touched.
- Learner sync has no conflict merge; the newer stamp wins whole. Fine for one learner on a few devices.

## Concurrency notes

The three E2E specs were edited at 23:44:42 by another writer during this session (new body marker); those edits were kept and built on. `astro.config.mjs` was not touched. The shared dev server on :4321 was never stopped or restarted.
