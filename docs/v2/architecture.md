# Signal Path v2 — architecture and stack

Decided 12 October 2026. This document is the source of truth for the rebuild on branch `v2`. The legacy static site is preserved under `legacy/` until the final QA pass and is deleted in the last commit; it is also intact on `main`.

## Why rebuild

The course is sold as one-time access with a free starter. Selling needs a server boundary (sign-in, purchase record, entitlement check before protected bytes are returned). GitHub Pages cannot do that, and 31 hand-written HTML pages with duplicated chrome cannot hold a professional product. The teaching content, the ten interactive tools, the 3D scenes and the learner notebook are kept and ported.

## Stack (pinned)

| Layer | Choice | Version | Why |
|---|---|---|---|
| Framework | Astro | ^7.3 | Content-first, MDX-native, ships little JS, React islands where needed, on-demand rendering for protected routes |
| Islands | React | ^19.3 via `@astrojs/react` ^7 | 21st.dev / shadcn components |
| Styling | Tailwind CSS | ^4.3 via `@tailwindcss/vite` | Tokens as CSS variables, shadcn compatible |
| Components | shadcn/ui (new-york, CSS vars) + lucide-react | shadcn CLI ^4 | Accessible primitives |
| Motion | `motion` (motion/react) | ^14 | Only where an effect earns it; respects reduced motion |
| Fonts | `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono` | ^5 | Self-hosted; no third-party font service (keeps the legacy privacy property) |
| Content | `@astrojs/mdx` + content collections (`glob` loader, zod schema) | mdx ^8 | Lesson shape enforced by schema |
| 3D | `three` | ^0.186 | Same scenes as legacy, lazy-loaded |
| Shared client state | `nanostores` | ^1 | Learner store shared between islands and vanilla widgets |
| Auth + DB | Supabase (`@supabase/ssr` ^0.12, `@supabase/supabase-js` ^2) | fresh project, EU region | Managed sign-in, Postgres with RLS |
| Payments | Stripe Checkout (hosted) + webhooks (`stripe` ^23) | | One integration; works with Stripe standard or Managed Payments |
| Adapter | `@astrojs/node` (standalone) | ^11 | Portable (Docker, Railway, Fly, Render). Switch to `@astrojs/vercel` is one line if Vercel Pro is chosen |
| Tests | vitest ^5, @playwright/test ^1.64 | | Unit: entitlements, webhook, quiz scoring, store migration. E2E: smoke + paywall |
| Tooling | npm, TypeScript strict, `astro check`, GitHub Actions CI | | No Pages deploy from this branch |

Agents must not downgrade these to older major versions from memory. If an API is uncertain, read https://docs.astro.build/llms-small.txt (or the specific docs page) first and record the verified API in `CLAUDE.md` under "Verified APIs".

## Rendering and access boundary

- `output: 'server'`. Marketing and resource pages set `export const prerender = true` (static HTML). Everything under `/learn`, `/account`, `/checkout`, `/api` is on-demand.
- `src/middleware.ts` creates the Supabase server client from cookies, sets `locals.user`, `locals.entitlements` (array of active product ids) and `locals.supabase`.
- Lesson route `/learn/[slug]` loads the collection entry, calls `hasAccess(locals, entry.data.access)`; unentitled paid lessons return the paywall view (HTTP 200 with `Cache-Control: private, no-store`, a teaser from frontmatter only, never the MDX body). Signed-out visitors to paid lessons get the same paywall (not a redirect loop).
- Paid quiz questions live in `src/data/quiz/paid/*.ts`, imported only by server code; free questions in `src/data/quiz/free.ts`. The Quiz island receives its questions as props from the server render, so no paid question ships in a public bundle.
- Paid downloads live in `private/downloads/` (outside `public/`) and stream through `/api/downloads/[name]` after the entitlement check.
- `astro.config.mjs` `redirects` map every legacy URL (`/modules/02-modulation.html` → `/learn/02-modulation`, `/roadmap.html` → `/course`, `/legal.html` → `/romania-lab-guide`, `/notebook.html` → `/learn/notebook`, `/quiz.html` → `/learn/quiz`, `/playground.html` → `/tools`, `/primer.html` → `/primer`, `/reference.html` → `/reference`, `/glossary.html` → `/glossary`, `/sources.html` → `/sources`, `/case-studies.html` → `/case-studies`) with 301.

## Repository layout

```
astro.config.mjs  tsconfig.json  package.json  components.json  .env.example
CLAUDE.md                     agent conventions (short)
docs/v2/                      architecture, offer, copy brief, workplan, legacy map, verification
src/
  content.config.ts           collections: lessons (MDX), pages? (no), with zod schemas
  content/lessons/NN-slug.mdx 19 lessons, frontmatter = lesson schema below
  data/course.ts              stages, modules order, badges (ported from legacy course.js)
  data/offer.ts               product, tiers, bonuses, guarantee, urgency flags (single source for pricing copy)
  data/quiz/free.ts  data/quiz/paid/*.ts  data/glossary.ts  data/faq.ts  data/testimonials.ts (empty until real)
  layouts/Base.astro  Marketing.astro  Learn.astro  Lesson.astro
  pages/  index.astro course.astro pricing.astro primer.astro reference.astro glossary.astro sources.astro
          case-studies.astro romania-lab-guide.astro tools.astro login.astro account.astro
          legal/{terms,privacy,refunds,imprint}.astro
          checkout/{success,cancel}.astro
          learn/index.astro learn/[slug].astro learn/notebook.astro learn/quiz.astro learn/atlas.astro
          auth/callback.ts auth/signout.ts
          api/checkout.ts api/stripe/webhook.ts api/downloads/[name].ts api/learner-state.ts
  components/ui/              shadcn primitives in use (button, sheet, input, label, sonner); add others with `npx shadcn add` when a page needs them
  components/marketing/       Navbar, Footer, Hero, StageTimeline, ModuleGrid, FeatureBento, ToolShowcase, PricingTable, Guarantee, BonusStack, Faq, Cta, ProofStrip
  components/learn/           LearnSidebar, LessonHeader, LessonToc, LessonMeta, PrevNext, ProgressRing, Badges, NotebookForm, QuizIsland, Paywall
  components/mdx/             Callout, Lab, Win, Checklist, Figure, Diagram, Flip (device UI token), Term (glossary link), Widget, Scene3D
  widgets/                    vanilla TS modules: flashcards, flipper-sim, pulse-decoder, rf-calc, rolling-sim, signal-atlas, spectrum-scope, tool-picker, tune-in, wave-lab, each `export function mount(el, opts): () => void`
  widgets/scene3d/            three.js scenes (flipper, devboard, carrier, modulation, pulses, rolling, nearfield, infrared, gpio), lazy
  lib/learner.ts              local-first learner store (progress, completion, quiz bests, badges, atlas, notebook, theme, motion) with legacy-key migration + JSON backup/restore + optional Supabase sync
  lib/access.ts  lib/supabase/{server,client,admin}.ts  lib/stripe.ts  lib/utils.ts  lib/pixel.ts (5×7 font + sprites)
  styles/global.css           @import tailwindcss; @theme tokens; shadcn vars; prose; widget layer
public/                       logo, favicon, og images, models/flipper-zero.glb (+ licence), images
private/downloads/            paid worksheets/notebook templates (served via API only)
supabase/migrations/*.sql     schema + RLS (also applied to the hosted project)
tests/unit/*.test.ts  tests/e2e/*.spec.ts
scripts/check-content.ts      lesson schema/links/widget-id/quiz-id consistency (replaces legacy check scripts)
.github/workflows/ci.yml      install, astro check, vitest, build, playwright smoke
```

## Lesson schema (frontmatter)

```ts
{
  id: 'm02',                 // stable, matches legacy progress keys
  number: 2,
  slug: '02-modulation',     // URL and file name; legacy names kept
  title: 'Hear the signal: AM vs FM',
  description: '…',          // meta description, 150–160 chars
  stage: 'signals',          // starter | signals | atlas | build | research | wifi
  week: 'Week 1',
  access: 'paid',            // free | paid  (m00, m01 free)
  minutes: 45,
  gear: ['Flipper Zero', 'a known 433 MHz remote'],
  transmits: 'none',         // none | own-device | lab-only
  outcome: 'State one device\'s frequency + modulation pair and explain why both must be right.',
  prerequisites: ['m01'],
  tools: ['wave-lab'],       // widget ids mounted in the body
  scenes: ['modulation'],
  evidence: 'A notebook entry with the winning preset for one remote and the sweep order you used.',
  sources: [{ title: 'Flipper: reading signals and presets', url: 'https://docs.flipper.net/zero/sub-ghz/read' }],
  reviewed: '2026-10-12',
  badge: 'modulation-master'
}
```

Every lesson body follows the lesson shape with these H2s in order: Outcome · Before you start · Understand · Predict and practise · Check yourself · Keep evidence · Continue. `scripts/check-content.ts` fails CI if an H2 is missing, a `tools` id has no widget, a quiz id has no questions, or an internal link 404s.

## Database (Supabase)

```sql
profiles        (id uuid pk references auth.users, email text, display_name text, created_at)
purchases       (id uuid pk, user_id uuid, provider text, provider_customer_id text, provider_order_id text unique,
                 product_id text, amount_cents int, currency text, status text  -- paid|refunded|disputed|canceled
                 raw jsonb, created_at, updated_at)
entitlements    (id uuid pk, user_id uuid, product_id text, status text, -- active|suspended|revoked
                 source_purchase_id uuid, granted_at, updated_at, unique(user_id, product_id))
webhook_events  (id text pk  -- provider event id, provider text, type text, received_at, processed_at, error text)
learner_state   (user_id uuid pk, state jsonb, updated_at)
```

RLS: `profiles`, `entitlements`, `purchases`, `learner_state` readable by the owning user; writes only through the service role (server) except `learner_state` upsert by owner. No table is readable anonymously.

## Payment flow (Stripe Checkout)

1. Signed-in user clicks Buy → `POST /api/checkout` → server picks the price from `src/data/offer.ts` + env, creates a Checkout Session with `client_reference_id = user.id`, `customer_email`, `metadata.product_id`, `success_url=/checkout/success?session_id={CHECKOUT_SESSION_ID}`, `cancel_url=/pricing`.
2. `/checkout/success` shows a pending state and polls `/api/entitlements` until the webhook has granted access (or shows "payment is still processing" after 60 s with a resume link). Nothing is granted from the success URL itself.
3. `POST /api/stripe/webhook`: verify signature → insert `webhook_events` (ignore duplicates) → handle `checkout.session.completed` with `payment_status = 'paid'` and a matching product → upsert `purchases` + `entitlements(active)`; `charge.refunded` (full) → revoke; `charge.dispute.created` → suspend; `charge.dispute.closed` with `status = 'won'` → restore. Out-of-order events reconcile against the stored purchase status. Mark `processed_at` or `error`.
4. Signed-out visitors can only start checkout after signing in (the checkout button links to `/login?next=/pricing#buy`).

Installments or BNPL (Klarna etc.) are enabled in the Stripe dashboard payment-method settings; the code does not special-case them.

## Learner state

Local-first in `localStorage` under the legacy keys so existing learners keep progress, with an importer for the legacy JSON backup. When signed in, `learner_state` is synced (debounced, last-write-wins by `updatedAt`). Export/import JSON stays available from `/learn/notebook`.

## Hosting

Any Node 22+ host. Recommended: Vercel Pro (swap adapter) or a container host. GitHub Pages must be disabled before launch because the previous deployment published every lesson. Environment variables are listed in `.env.example`; secrets never enter the repo.

## Verification gates (must pass before merge)

1. `npm run check` (astro check + tsc), `npm test`, `npm run build` green; CI green.
2. `scripts/check-content.ts` green: 19 lessons, 7-part shape, all widget/quiz/scene ids resolve, no broken internal links, legacy redirects cover every legacy URL.
3. Playwright smoke: home, course, pricing, primer render; `/learn/02-modulation` signed-out shows paywall with no lesson body text; free lesson renders with its widget mounted; legacy URL redirects; downloads API denies anonymous.
4. Manual browser pass at 360 / 768 / 1280, light and dark, reduced motion.
5. Payments: webhook unit tests (valid, bad signature, duplicate event, refund, dispute, out-of-order); a Stripe test-mode end-to-end purchase once keys exist.

## Deviations

Recorded by the foundation build on 12 October 2026.

- **Quiz split.** `src/data/quiz/free.ts` holds `primer`, `m00` and `m01` (20 questions). The primer quiz is on a public page that belongs to the free starter, so it cannot be server-only. `src/data/quiz/paid/index.ts` holds the other 17 banks (96 questions). Total stays 116. (Superseded: the content track grew the banks to 199, 30 free and 169 paid; counts render from data.)
- **Quiz in lessons.** Lessons mount quizzes with an extra MDX component, `<Quiz id="m02" />` (`src/components/mdx/Quiz.astro`). It runs on the server, so paid questions only reach the HTML of a lesson body that already passed `hasAccess()`.
- **Callout variants.** `Callout` accepts `legal` in addition to `note | tip | warn | story`, because 10 legacy callouts are legal notices.
- **No `Diagram` component.** `Figure` with a `label` prop covers diagrams (`role="img"` + `aria-label` around inline SVG).
- **Resource pages.** Primer, reference, sources, case studies and the Romania guide are cleaned HTML fragments in `src/content/pages/*.html`, rendered by `ResourcePage.astro` with `set:html`. Marker comments (`<!--WIDGET:id:{}-->`, `<!--QUIZ:id-->`) become live components. This avoids hand-porting 70 KB of markup into JSX whitespace rules while keeping one design system (`.lesson-prose` styles the legacy content classes).
- **Dev bypass.** `SP_DEV_BYPASS=1` unlocks paid lessons only under `astro dev` (`import.meta.env.DEV`). A production build ignores it, so a stray variable on a server cannot leak paid content.
- **Unmigrated lessons.** `/learn/<slug>` for a course module without an MDX file renders a "being moved" stub (HTTP 200) instead of a 404, so sidebar links work during migration. `check:content` warns about these; `check:content -- --strict` fails on them.
- **Unported widgets.** A `<Widget>` whose module does not exist yet shows a neutral notice. `scripts/check-content.ts` keeps a `PENDING_WIDGETS` allowlist that turns these into warnings.
- **3D scenes.** Ported to `three@0.186` in `src/widgets/scene3d/` (runtime, nine scene builders, shared kit); the Flipper body is `public/models/flipper-zero.glb` (GPL-3.0, `NOTICE` next to it, public asset). Details in `src/widgets/scene3d/README.md` and `docs/v2/scenes-report.md`.
- **TypeScript 6.** `npm install` resolved `typescript@^6.0.3` (the peer range `@astrojs/check` accepts), not 7.
- **`yaml` dev dependency.** Added for `scripts/check-content.ts` frontmatter parsing.
- **Legacy `/index.html`.** Not redirected; the Node server serves the prerendered home page at that path.

Recorded by the platform build on 12 October 2026.

- **Purchases key.** `purchases.provider_payment_id` (PaymentIntent id, unique, not null) is the upsert key, because session, charge and dispute events all carry it. `provider_order_id` holds the Checkout Session id. Other purchase columns are nullable so a refund or dispute that arrives before `checkout.session.completed` can be recorded first; its status then wins.
- **Extra webhook event.** `checkout.session.async_payment_succeeded` is handled like `checkout.session.completed` (delayed payment methods). A lost dispute leaves the entitlement `suspended`.
- **Buy flow after sign-in.** `/pricing` is prerendered and cannot know who is signed in, so sign-in with `next=/pricing#buy` lands on `/checkout` (on-demand), which posts to `/api/checkout`. `/api/checkout` answers JSON for `fetch` callers and redirects (303) for HTML form posts. `cancel_url` is `/checkout/cancel`.
- **Sync.** Learner sync runs only when `<html data-signed-in="true">` and is always on while signed in (no toggle; the account page says so). The local clock lives in `localStorage` under `signalpath.v2.updatedAt`.

Recorded by the integration pass on 13 October 2026.

- **Lesson facts live in frontmatter only.** `src/data/course.ts` keeps module ids, order, slugs, badges and stage descriptions (the client learner store needs them). Titles, weeks, minutes, access and each lesson's stage come from the content collection through `src/lib/lessons.ts`; the sidebar, lesson sheet, course page, dashboard, pager, paywall, quiz labels and JSON-LD read it there. Islands that label modules on the client (`ResumeLink`, `NotebookIsland`, `LearnNavSheet`) receive titles as props. Module 9's frontmatter stage was corrected from `signals` to `atlas` to match the stage plan.
- **Counts are computed.** Lessons, questions, tools and stages in the copy come from `src/components/marketing/site.ts` (`facts`), which counts the collection, both quiz barrels and `tools.ts` at build time. The unused `tagline`/`includes` strings in `offer.ts` (which held a stale "116") were removed; the FAQ's lesson count is filled from `facts`.
- **Quiz practice merges paid banks** server side after `hasAccess()` (page sends `Cache-Control: private, no-store` when it does).
- **Bundle check.** `scripts/check-bundle.ts` (`npm run check:bundle`, last step of `verify`) fails if any paid question text appears in `dist/client`, with a free primer question as a positive control.
- **No stubs.** The "being moved" lesson stub and the pending-widget notice are gone: an unknown slug is a 404 and `check:content` errors on an unknown widget id, a missing lesson file, or a `tools.ts` entry without a widget module (and the reverse).
- **One button style.** `src/components/marketing/button.ts` is shared by `LinkButton`, `BuyButton` and the plain `<button>`s on login, account and checkout pages.

Recorded by the audit fix pass on 13 October 2026 (details in `docs/v2/verification.md`, "Audit fixes").

- **Secrets at runtime.** `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` and `STRIPE_PRICE_COMPLETE` are declared in `env.schema` and read from `astro:env/server`, so they are never inlined into `dist/`. `check:bundle` also fails on secret-shaped strings or configured secret values anywhere in `dist/`.
- **Webhook grants only what is on sale, at its price.** A session must be `mode: payment`, carry `metadata.price_id` equal to the configured price, and name an available product. After every event the entitlement is recomputed from all of the buyer's purchases of that product (active if any is paid, suspended if any is disputed, else revoked). Migration `0003` makes `refunded` final in the database and limits `purchases` to the account page's columns for buyers. Checkout sessions use a 10-minute idempotency key.
- **Auth hardening.** `/auth/callback` accepts `token_hash` only under `astro dev` (e2e); production uses the PKCE `code` only. `safeNext` resolves the target against a dummy origin and refuses control characters and backslashes. Auth cookies are `HttpOnly`, `Secure` in production. `lib/supabase/client.ts` was removed (unused). `appOrigin` throws in production without `PUBLIC_SITE_URL`.
- **Response policy.** Middleware sets `Cache-Control: private, no-store` on every on-demand response that did not set its own. Request bodies are capped at 1 MB by the adapter.
- **Shared Vite cache split.** Every command except `astro dev` uses `node_modules/.vite-build`, because `astro build`/`astro check` pre-bundled production React into the dev server's cache.
- **Quiz bank length rule.** `check:content` fails a bank where the correct option is the single longest in more than 30% of questions.
