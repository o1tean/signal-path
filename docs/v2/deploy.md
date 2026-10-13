# Deploying Signal Path v2

How to run the platform locally, configure Supabase and Stripe, and launch. Architecture: `docs/v2/architecture.md`.

## 1. Environment variables

`.env.example` is the contract. Locally the values live in `.env` (gitignored). In production, set them in the host's environment.

| Variable | Where | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | build + server | `https://<domain>`, no trailing slash. Used for canonical links, auth email links and Stripe redirect URLs in production. Required: without it, sign-in and checkout fail with an error instead of trusting the request's Host header. |
| `PUBLIC_SUPABASE_URL` | build + server | Production: `https://pnjftkravosrcgjymxlu.supabase.co` |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build + server | Production publishable key (`sb_publishable_...`). Safe for clients. |
| `SUPABASE_SECRET_KEY` | server only | Supabase secret key (`sb_secret_...`). Only `/api/stripe/webhook` uses it. |
| `PUBLIC_AUTH_GOOGLE` | build | `1` shows "Continue with Google" on `/login`. Leave `0` until the Google provider is set up. |
| `STRIPE_SECRET_KEY` | server only | `sk_live_...` in production, `sk_test_...` for testing. Empty: `/api/checkout` answers 503 and `/checkout` shows "Checkout is not configured yet." |
| `STRIPE_WEBHOOK_SECRET` | server only | `whsec_...` of the webhook endpoint (live and test mode have different secrets). |
| `STRIPE_PRICE_COMPLETE` | server only | `price_...` for Signal Path Complete. |
| `SP_DEV_BYPASS` | dev only | Ignored by builds. Never set it on a server. |

The four server-only variables are declared in `env.schema` in `astro.config.mjs` and read through `astro:env/server` when the server runs, so they are never written into `dist/` (`npm run check:bundle` fails if a key shape or a configured secret value appears there). Change them in the host environment and restart the server; no rebuild. The `PUBLIC_*` variables are still replaced at build time, so changing one needs a rebuild and redeploy. In dev, the server reads `.env` when it starts; restart it after editing `.env`.

## 2. Local development

```sh
npx supabase start          # Docker; applies supabase/migrations, prints URL + keys (Mailpit inbox at :54324)
# put PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY into .env
npm run dev                  # http://localhost:4321
npx supabase db reset        # re-apply migrations from scratch (deletes local users)
```

- Sign-in emails go to Mailpit at http://127.0.0.1:54324. `supabase/config.toml` points auth at `http://localhost:4321` and allows `/auth/callback`.
- Grant yourself the course locally (Studio at http://127.0.0.1:54323, or SQL):
  `insert into entitlements (user_id, product_id, status) select id, 'course-complete', 'active' from auth.users where email = 'you@example.com';`
- Tests: `npx vitest run tests/unit` (the webhook suite also runs against the local database when `.env` points at the local stack). `npx playwright test tests/e2e/paywall.spec.ts tests/e2e/signin.spec.ts tests/e2e/platform.spec.ts` uses the running dev server and creates a local test learner on first run (credentials in `.e2e-user.json`, gitignored).

## 3. Database (hosted Supabase project `pnjftkravosrcgjymxlu`)

The schema is `supabase/migrations/0001_init.sql`: `profiles`, `purchases`, `entitlements`, `webhook_events`, `learner_state`, RLS, `updated_at` triggers and a trigger that creates a profile for every new auth user. `0002_harden_functions.sql` takes the trigger helpers out of the RPC surface. `0003_purchase_hardening.sql` (13 October 2026, security review) makes a refund final at the database level and limits what a buyer can read from `purchases` to the columns the account page shows. Apply all three, in order, to the hosted project.

Option A, CLI (preferred, keeps migration history):

```sh
npx supabase login
npx supabase link --project-ref pnjftkravosrcgjymxlu
npx supabase db push --dry-run   # shows what will run
npx supabase db push
```

Option B, dashboard: SQL Editor, paste the whole of `0001_init.sql`, run once. Later migrations must then also be applied by hand, in order.

Check afterwards: Database, Tables shows the five tables with RLS enabled; Advisors shows no security warnings for them.

## 4. Supabase Auth settings (dashboard, Authentication)

1. **URL Configuration.** Site URL: `https://<domain>`. Redirect URLs: `https://<domain>/auth/callback` (add `http://localhost:4321/auth/callback` only on a separate dev project).
2. **Sign In / Providers, Email.** Enabled, "Confirm email" on. Email OTP expiry 3600 s (the login copy says the link expires after an hour; change both together).
3. **SMTP.** The built-in sender only delivers to project team members and is heavily rate limited. Set up custom SMTP (Authentication, Emails, SMTP Settings) before launch, with the From address from `docs/v2/copy/emails.md`. Then raise "Rate limits, emails sent per hour" to fit expected sign-ups.
4. **Email templates, Magic Link** (and "Confirm signup", which a first sign-in can use). Keep `{{ .ConfirmationURL }}` as the link: it returns to `/auth/callback?code=...` and works with the PKCE flow the server uses. Subject and body come from `docs/v2/copy/emails.md#magic-link`. Do not switch the template to a `token_hash` link: production `/auth/callback` accepts only the PKCE `code` (a `token_hash` link can be minted for one account and opened by someone else, which signs them in to the wrong account), and refuses `token_hash` with "expired".
5. **Google (optional).** Providers, Google: add the OAuth client id and secret from Google Cloud (authorised redirect URI `https://pnjftkravosrcgjymxlu.supabase.co/auth/v1/callback`). Then set `PUBLIC_AUTH_GOOGLE=1` and redeploy.

Sign-in links use PKCE: the link must be opened in the browser that asked for it. `/login?error=other-browser` explains this to the learner.

## 5. Stripe

1. **Product and price.** Products, Add product "Signal Path Complete", one-time price in EUR (the amount in `src/data/offer.ts`). Copy the `price_...` id into `STRIPE_PRICE_COMPLETE`.
2. **Checkout settings.** Payment methods: cards, plus any instalment or BNPL methods you want (Klarna etc.); the code needs no change. Decide on tax ID collection and invoices ([NEED] in `docs/v2/copy/pricing.md`).
3. **Webhook endpoint.** Developers, Webhooks, Add endpoint `https://<domain>/api/stripe/webhook`, with exactly these events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `charge.refunded`
   - `charge.dispute.created`
   - `charge.dispute.closed`

   Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.
4. **How the webhook behaves.** It verifies the signature on the raw body (400 if wrong), records the event id in `webhook_events` (a repeat of a processed event is a no-op), and returns 500 on a processing error so Stripe retries. A paid one-time (`mode = payment`) session with `metadata.product_id = course-complete` and `metadata.price_id` equal to `STRIPE_PRICE_COMPLETE` creates the purchase and an active entitlement; `/api/checkout` sets both fields. Sessions from payment links or other integrations on the same account are ignored, and so is any product not on sale. A full refund revokes access, a dispute suspends it, a won dispute restores it, a lost dispute leaves it suspended. The entitlement is recomputed from all of the buyer's purchases of that product after every event, so refunding an accidental second payment leaves access in place. Events can arrive in any order: a refund recorded before the session event is never re-granted.
5. **Test mode walkthrough** (test keys in `.env`, dev server running):

   ```sh
   stripe login
   stripe listen --forward-to localhost:4321/api/stripe/webhook   # prints whsec_..., put it in .env and restart dev
   ```

   - Sign in at `/login`, open `/pricing`, buy with card `4242 4242 4242 4242`, any future date, any CVC. `/checkout/success` turns from "Waiting for Stripe to confirm." to "All 19 lessons are open." within seconds; `/learn/02-modulation` shows the lesson.
   - Refund the payment in the dashboard: the entitlement becomes `revoked` and the paywall returns.
   - Buy again with `4000 0000 0000 0259` (creates a dispute): access is paused (`suspended`); submit winning evidence in the dashboard (test text `winning_evidence`) to see it restored.
   - `stripe trigger checkout.session.completed` only tests delivery: its session has no `product_id`, so it is logged and ignored.
6. **Go live.** Repeat steps 1 and 3 in live mode (live price id and live webhook secret) and switch the keys.

## 6. Hosting

The app is `output: 'server'` with `@astrojs/node` (standalone). Any Node 22.12+ host works.

```sh
npm ci && npm run build
HOST=0.0.0.0 PORT=8080 node dist/server/entry.mjs
```

Run it with the project root as the working directory: paid downloads are read from `./private/downloads` at request time, so that folder must ship with the server (it is never in `dist/client`). Put the site behind HTTPS. Every on-demand response sends `Cache-Control: private, no-store` unless the route set its own policy (middleware); do not override that in a CDN.

### Reverse proxy: compression and static caching

`@astrojs/node` standalone does not compress responses. Measured on the production build (13 October 2026), the home page is about 1.8 MB uncompressed and about 0.5 MB with brotli (three.js chunk 666 KB to 140 KB, CSS 123 KB to 17 KB, `flipper-zero.glb` 558 KB to 272 KB). Put a proxy or CDN in front that compresses and leaves the server's cache headers alone. Caddy example:

```
signalpath.example {
  encode zstd gzip
  @static path /models/* /images/* /og.png /favicon.svg
  header @static Cache-Control "public, max-age=604800"
  reverse_proxy 127.0.0.1:8080
}
```

The Node server already sends `Cache-Control: public, max-age=31536000, immutable` for hashed files under `/_astro/` on GET (a HEAD request does not get it, which is why a `curl -I` shows `max-age=0`). Other files in `public/` are sent with `max-age=0`, hence the `@static` rule. nginx: `gzip on; gzip_types text/css application/javascript application/json image/svg+xml model/gltf-binary;` plus `brotli` if the module is installed.

The server caps request bodies at 1 MB (`bodySizeLimit` in `astro.config.mjs`); a proxy limit of the same size is fine.

### Switching to Vercel Pro

1. `npm i @astrojs/vercel` and remove `@astrojs/node`.
2. In `astro.config.mjs`: `import vercel from '@astrojs/vercel'` and `adapter: vercel({ includeFiles: ['./private/downloads/lab-notebook.md', './private/downloads/wifi-devboard-notebook.md'] })` (list every paid file, or downloads 404).
3. Check that `process.cwd()` resolves `private/downloads` inside the function (`/api/downloads/lab-notebook.md` with an entitled account); if not, change the `DIR` constant in `src/pages/api/downloads/[name].ts`.
4. Set the environment variables in the Vercel project (Production and Preview separately; Preview should use Stripe test keys).

## 7. GitHub Pages shutdown

The old Pages site published every lesson. `.github/workflows/pages.yml` is already deleted on `v2`, but the last deployment stays online until Pages is disabled:

- Repository Settings, Pages, Source "None" (or "Unpublish site"), or `gh api -X DELETE repos/<owner>/signal-path/pages`.
- Confirm the old URL (`https://<owner>.github.io/signal-path/modules/02-modulation.html`) returns 404.
- Point the old URL's traffic at the new domain if possible (a custom domain moved to the new host keeps the legacy paths, which redirect with 301).

## 8. Launch checklist

Mirrors the verification gates in `docs/v2/architecture.md`.

- [ ] `npm run check`, `npm test`, `npm run build` green; CI green.
- [ ] `npm run check:content -- --strict` green: 19 lessons, 7-part shape, ids resolve, no broken links, every legacy URL redirects.
- [ ] Playwright smoke: home, course, pricing, primer render; `/learn/02-modulation` signed out shows the paywall and no body text; a free lesson renders with its widget; legacy URL returns 301; `/api/downloads/*` denies anonymous requests (401).
- [ ] Manual pass at 360 / 768 / 1280, light and dark, reduced motion, including `/login`, `/account`, `/checkout/success`.
- [ ] Webhook unit tests green (valid, bad signature, duplicate, refund, dispute, out of order).
- [ ] Hosted database migrated with 0001, 0002 and 0003 (section 3); RLS on all five tables.
- [ ] Proxy compresses responses and caches `/models`, `/images` (section 6).
- [ ] Supabase Site URL, redirect URL, custom SMTP and the magic-link template set (section 4); a real sign-in email arrives from the production sender.
- [ ] Stripe live product, price, webhook endpoint with the five events; env vars set; one test-mode purchase, refund and dispute done end to end (section 5).
- [ ] `PUBLIC_SITE_URL` is the real domain; `SP_DEV_BYPASS` is unset on the server.
- [ ] `private/downloads` is present on the server and `/api/downloads/lab-notebook.md` works for an entitled account.
- [ ] Every `[NEED: ...]` token is resolved: `grep -rn "\[NEED" src docs/v2/copy` (support email, response times, legal entity, VAT).
- [ ] GitHub Pages disabled and the old URL returns 404 (section 7).
