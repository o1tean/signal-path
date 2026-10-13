# Verification (integration pass, 13 October 2026)

Branch `v2`, nothing committed, `legacy/` untouched. Local Docker Supabase stack running and a shared `astro dev` server on :4321.

## Commands and results

| Command | Result |
|---|---|
| `npm run check` (astro check) | 206 files, 0 errors, 0 warnings, 0 hints |
| `npm run check:content` | PASS: 19/19 lessons, 199 quiz questions, 10 widgets, 29 legacy redirects, 0 warnings |
| `npm test` (vitest) | 12 files, 58 tests passed |
| `npm run build` | Complete; prerendered marketing pages, sitemap written. The "file not created" lines are the legacy `.html` redirects, which the Node server serves as 301s |
| `npm run check:bundle` (new) | PASS: 169 paid question texts checked against 58 files in `dist/client`, 0 found. A free primer question is the positive control; planting "What is modulation?" (a paid question) in `dist/client` made it fail as expected |
| `npm run verify` (all of the above) | exit 0 |
| `npx playwright test` (whole suite, one dev server) | 42 passed in 2.3 min, 0 flaky, before `seams.spec.ts` was added; `seams.spec.ts` alone: 4 passed. 46 tests in total |

Production build probed on a side port (`PORT=4399 node dist/server/entry.mjs`):

| Path | Status |
|---|---|
| `/dev/scenes`, `/dev/widgets/rf-calc`, `/dev/widgets/tune-in` | 404 |
| `/`, `/tools`, `/learn/quiz` | 200 |
| `/learn/02-modulation` signed out | 200, `Cache-Control: private, no-store`, paywall, no body text (a body-only string is absent; "AM650" appears only in the public frontmatter description) |
| `/learn/99-nope` | 404 |
| `/modules/02-modulation.html` | 301 |
| `/api/downloads/x` anonymous | 401 |

Fonts: 12 `.woff2` files in `dist/client/_astro`, no Google or other font host referenced, so the privacy notice's "[NEED: confirm fonts are self-hosted]" marker was resolved.

## Pages checked in the browser (dev server, 1280 px, light)

- `/`: hero mounts the real `flipper` scene (`data-scene-state="ready"`, the GLB renders, `device.svg` fades out); Tune In and Wave Lab mount live; the proof strip reads 19 / 12 / 199 / 10.
- `/tools`: Tune In, Wave Lab and Spectrum Scope mount (`data-mounted="ready"`); the seven others show still previews with their lesson or pricing link; no horizontal overflow; the closing band reads "every tool, 19 lessons and 199 quiz questions".
- `/learn/02-modulation` signed out: paywall with computed counts, shared button styles, sidebar from the collection (stage counts 2/4/5/5/2/1, Module 9 under "Build your signal atlas").
- `/login?next=/pricing#buy` and `/checkout/cancel`: marketing layout, shared buttons.
- Not re-checked by hand in this pass: 360/768 widths, dark theme and reduced motion for every page (the marketing track's 90 screenshots and the widget specs at 320–1280 px cover them), `/account` and `/checkout/success` signed in (covered by `signin.spec.ts` for account status text only).

## What changed to get here

- **Single source for lesson facts.** New `src/lib/lessons.ts` reads the content collection. `course.ts` lost `title`, `week`, stage module lists and `freeModuleIds`. Sidebar, mobile lesson sheet, course page, dashboard, stage timeline, pager, TOC, paywall, quiz labels, checkout success and JSON-LD read the collection. This surfaced two drifts: Module 9 sat in `atlas` in `course.ts` but `signals` in frontmatter (frontmatter fixed to `atlas`), and Module 5's title differed ("&" vs "and"; frontmatter wins).
- **Computed counts.** `facts` in `site.ts` counts lessons from the collection. The paywall ("19 lessons, 10 browser tools and 116 quiz questions"), checkout success, account status, the FAQ answer and the course hero now render from data. Unused `tagline`/`includes` in `offer.ts` (stale "116") removed.
- **Real widgets on /tools and home.** The "widget not ported yet" fallbacks, `widgetExists`, the lesson "being moved" stub, `PENDING_WIDGETS` and the registry's pending notice were removed. `check:content` now fails if `tools.ts` and `src/widgets/*.ts` disagree, if a course module has no lesson, or if a free lesson's quiz is not in the free bank.
- **Quiz practice** merges the paid banks on the server after `hasAccess()`.
- **Design consistency.** `src/components/marketing/button.ts` holds the one button style used by `LinkButton`, `BuyButton` and the buttons on login, account, checkout and paywall. Support-email placeholders on those pages go through `need(owner.supportEmail, …)`, so filling `owner.supportEmail` in `site.ts` fixes them all.
- **Specs.**
  - `platform.spec.ts`: signed in by emailing a link twice per run. The second email hit the local stack's per-hour email limit (`over_email_send_rate_limit`). It now signs in through `/auth/callback?token_hash=` from `auth.admin.generateLink`; the emailed path stays covered by `signin.spec.ts`.
  - `signin.spec.ts`: resubmits once if the page shows its rate-limit notice (the per-address 1 s limit after the platform spec).
  - `supabase/config.toml`: `email_sent` raised from 2 to 30 per hour for the local stack (its comment already said it was raised); the stack was restarted.
  - `scenes.spec.ts`: clicking the motion toggle at the top of `/dev/scenes` scrolled the `gpio` scene offscreen, so the "loop on again" check waited on an offscreen scene. The test now scrolls `gpio` back after each toggle.
  - `rolling-sim.spec.ts` failed once while I was editing source files during the run (HMR reloads). It passed 3/3 with `--repeat-each=3` and in the clean full run, so no change.
  - New `seams.spec.ts`: /tools and home mount the real widgets and hero scene, course page and sidebar list 19 lessons from the collection, an unknown slug is 404.
- **Docs.** README rewritten for v2; `docs/course-plan.md` marked superseded for implementation; `lesson-brief.md` quiz paths and MDX comment syntax corrected; architecture deviations and a verified Supabase API entry added.

## What remains for the owner

1. **Secrets** in the host environment, never the repo: `PUBLIC_SITE_URL`, `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_COMPLETE` (`docs/v2/deploy.md` section 1). Rebuild after any change.
2. **Stripe**: create the product and price, the webhook endpoint for `/api/stripe/webhook` with the events in `deploy.md`, enable tax ID collection/invoices if wanted, then one test-mode purchase end to end (refund and dispute too). No Stripe keys were available, so checkout was only verified in its "not configured" state.
3. **Supabase auth URLs** on the hosted project: Site URL, `https://<domain>/auth/callback` in the redirect allowlist, custom SMTP and the magic-link template (`deploy.md` section 4).
4. **Price decisions**: the three `// [decide]` prices in `src/data/offer.ts` (Complete €149, founding €99, Mentored €699), plus the founding offer's end date or seat cap if it is switched on.
5. **Owner facts** shown as visible `[NEED: …]` markers: support email (set `owner.supportEmail` in `src/components/marketing/site.ts`; the FAQ, sources page and legal Markdown still carry literal markers), legal entity, address, VAT status, reply and processing times, promise window, minimum age, governing law, and the legal pages that need a lawyer. `grep -rn "NEED:" src` lists them all (53 lines).
6. **Licences**: decide the licence note for the GPL-3.0 Flipper model in the terms (`_terms.md`) and the Lab Companion app source licence.
7. **GitHub Pages shutdown**: the old deployment still serves every lesson until Pages is disabled (`deploy.md` section 7). Also delete `legacy/` in the final launch commit as planned.

## Known gaps

- `fa.c` at the repository root is an untracked copy of Flipper firmware source (the Sub-GHz frequency analyzer), apparently left by a research step. It is not referenced anywhere. Delete it or move it out of the repo before committing.
- Scenes visual items from the scenes track remain: in the `nearfield` card variant the "13.56 MHZ" and "CARD" pixel labels overlap; check whether the site controls bleed into narrow scene frames (seen only in screenshots).
- The widget specs do not stub the HMR socket (the platform, sign-in, scenes and seams specs do), so editing source files during a run can reload a widget page mid-test.
- The scenes spec needs a quiet machine: SwiftShader shader compilation took up to a minute per first scene under load averages above 50.
- Prerendered marketing pages always show "Sign in", even to a signed-in visitor (by design: they are static).
- The client bundle has one chunk over 500 kB (three.js, lazy-loaded with the scenes); acceptable, but worth splitting if the hero's first paint suffers.
- Manual pass at 360/768 widths, dark theme and reduced motion was not repeated for every page after the integration changes; the changes were data and class-string swaps, not layout changes.

# Audit fixes (13 October 2026)

Five audits ran against the integrated build: security, accessibility/responsive, content integrity, performance and design. Their full reports were handed to this pass; the numbering below follows each report. Nothing is committed and `legacy/` is untouched.

## Findings by severity

| Audit | Blocker | Should-fix | Nit / minor | Total |
|---|---|---|---|---|
| Security | 0 | 8 (1, 2, 3, 4, 5, 7, 8, 9) | 5 (6, 10, 11, 12, 13) | 13 |
| Accessibility (Serious = should-fix) | 0 | 8 (1–8) | 4 (9, 10, 11, 12) | 12 |
| Content (High/Medium = should-fix) | 0 | 7 (1–7) | 9 (8–16) | 16 |
| Performance (High/Medium = should-fix) | 0 | 4 (1–4) | 6 (5–10) | 10 |
| Design (P1 = should-fix; #6 flagged "release blocker") | 1 (6) | 5 (1–5) | 28 (P2 7–21, P3 22–34) | 34 |
| **Total** | **1** | **32** | **52** | **85** |

## Results after the fixes

| Check | Result |
|---|---|
| `npm run verify` | exit 0: astro check 199 files, 0 errors, 0 warnings, 0 hints; `check:content` PASS (19/19 lessons, 199 questions, 10 widgets, 29 redirects, 0 warnings; new length rule passes); vitest 12 files, 64 tests; build complete; `check:bundle` PASS (0 of 169 paid questions in `dist/client`, 167 `dist` files scanned for secrets, 0 hits) |
| `npx playwright test` (whole suite, shared dev server) | 50 passed in 2.8 min (46 existing + 4 in the new `tests/e2e/audit.spec.ts`) |
| axe (WCAG 2.2 AA tags) on 20 pages at 360 and 1280 px, light and dark (dev server) | Before: link-name, color-contrast and scrollable-region-focusable on many pages. First recheck: one contrast hit (`/learn` badge captions) and one aria-hidden-focus (home code sample), both fixed. Final recheck: 0 violations and 0 px horizontal overflow over 80 page runs |
| Production build on a side port | webhook with a bad signature answers 400 (secret read at runtime, not 503); `/auth/callback?token_hash=…` redirects to `/login?error=expired`; on-demand pages send `private, no-store`; `/_astro/*` GET sends `immutable` |
| Screenshots | `docs/v2/screenshots/final/{home,pricing,learn-00-setup}-{390,1440}-{light,dark}.png`, full page, production build, motion paused; 0 px overflow and 0 page errors in all 12 |

Found during verification: `astro build` and `astro check` pre-bundled production React into the dev server's `node_modules/.vite`, so after any `npm run verify` every island on the dev server threw "_jsxDEV is not a function" (22 Playwright failures). `astro.config.mjs` now gives every command except `astro dev` its own `cacheDir`; the suite then passed after a full verify.

## What was fixed

**Security (all 13).**
1. Open redirect: `safeNext` refuses control characters and backslashes, then resolves against a dummy origin and keeps only same-origin path, query and hash. Unit cases for `/\t/`, `/\n/`, `/\r/`, decoded `%09`, `//`, `/\`, absolute URLs; e2e check through `/auth/callback`.
2. Login CSRF: `token_hash` is accepted only under `astro dev`; production uses the PKCE `code`. `deploy.md` now says not to switch the email template to `token_hash`.
3. Secrets in the build: four server secrets moved to `env.schema` + `astro:env/server` (runtime). `check:bundle` fails on `sb_secret_`/`sk_*_`/`rk_*_`/`whsec_` shapes or any configured secret value anywhere in `dist/`. `admin.ts`'s dead `process.env` fallback removed.
4. Webhook: only available products are sellable; the session must be `mode: payment` and its `metadata.price_id` must equal the configured price (`/api/checkout` sets it). Unit test covers Mentored, a foreign price, a missing price and a subscription session.
5. Duplicate purchases: entitlement is recomputed from all of the buyer's purchases of the product after every event. Unit test: two paid purchases, refund one, access stays. Checkout uses a 10-minute idempotency key per user and product.
6. Concurrent refund vs completion: migration `0003` trigger keeps `refunded` final, and the reconcile step reads current state. A narrow window remains between reconcile's read and write (ponytail note in the report; acceptable for one buyer).
7. Body size: adapter `bodySizeLimit` 1 MB; `/api/checkout` rejects signed-out callers before reading the body.
8. Cache-Control: middleware sets `private, no-store` on every on-demand response without its own policy (e2e check on `/learn`, `/learn/00-setup`, `/learn/quiz`).
9. Cookies: `HttpOnly`, `SameSite=Lax`, `Secure` in production; unused `lib/supabase/client.ts` removed.
10. Future `updatedAt`: clamped to server time.
11. Dotfiles in `private/downloads` are never served.
12. `appOrigin` throws in production without `PUBLIC_SITE_URL` (request time, so CI builds without it still work).
13. Migration `0003` limits buyer reads of `purchases` to `id, product_id, amount_cents, currency, status, created_at`. Applied to the local stack; the account page still lists purchases (sign-in spec passes).

**Accessibility.**
1–2. Learn header: logo link named "Signal Path home"; "/" and "My course" hidden under `sm` (the lesson sheet now has My course, Notebook and Quiz links); Sign in no longer wraps; nav `min-w-0`; header 64 px like the marketing navbar. Notebook select no longer overflows (grid `minmax(0,1fr)`, select `w-full min-w-0`). e2e: no sideways scroll at 360 px on four learner pages.
3–5. Light-mode text tokens darkened: success `#076941`, info `#006a66`, warning `#825b0c`, danger `#b22c44` (all ≥ 5.1:1 on their own tint over the page). Soft tints unchanged. Lesson and resource-page links use `accent-foreground` (≥ 5.1:1 on tinted rows).
6. Inline text links on login, `/learn` and lessons are underlined by default.
7. `Base.astro` makes every sideways-scrolling table, code block, figure or `.overflow-x-auto` region focusable with `role="region"` and a label (skips decorative `aria-hidden` blocks).
8. Quiz: after an answer, focus moves to that question's feedback (e2e check).
10. Quiz: per-question live regions removed (feedback is read on focus); the score is the only live region; the visible legend replaces the sr-only + aria-hidden pair; the score shows only after the first answer and Retry appears after the first answer (design 29).
11. Glossary term links and learn sidebar rows are 44 px tall.
12. Inter and JetBrains Mono latin are preloaded; an Arial-based "Inter Fallback" with Inter's metrics avoids the swap shift; widget placeholders reserve 18 rem and name the tool while loading. CLS was not re-measured on a production build.
- Also: `/learn` badge captions lost `opacity-80` (3.65:1).

**Content.**
1. Length tell: 100 distractors rewritten across all 20 banks so a distractor is longer than the correct answer; the correct option is the single longest in 58 of 199 questions (was 158), at most 3 per bank. `check:content` now fails a bank above 30% (numeric options of 15 characters or fewer are exempt).
2. Lessons render their frontmatter `sources` as "Sources for this lesson" above the review date.
7. Prediction steps added to Labs 3.2, 10.2 and 17.2; Lab 11.2 step 1 now asks for a written prediction.
8. Module 13 Keep evidence has an example entry.
10. `/robots.txt` is generated from `site` with the sitemap URL.
12. Stale "116" in `copy-brief.md`, `offer.md`, the copy files and the architecture note updated to 199.
13. Four redirected URLs replaced with their final targets (Flipper NFC and Sub-GHz docs, FCC title 47, TI SLLA544).
14. Primer "Think of it as…" rewritten; the Romania guide's "Region-bypass settings" is now "Settings that unlock frequencies outside your region's allowed bands".
16. Module 3 lists m01 and Module 5 lists m02 as prerequisites.

**Performance.**
1. Compression and static caching documented in `deploy.md` section 6 (Caddy and nginx examples). The host must do it.
3. The home hero scene now waits for `requestIdleCallback` (1.5 s timeout) before loading three.js and the GLB; the static device drawing shows until then.
4. Font preloads and metric fallback (see accessibility 12).
6. The 10 unused shadcn components were moved out of `src/components/ui` (kept in the session scratchpad; regenerate with `npx shadcn add`).

**Design.**
1–2. Learn header and notebook (see accessibility 1–2).
3. Bonus names render `{tools}` and `{questions}` from `facts`, so pricing says "199-question bank".
4. Paywall: title moved to a screen-reader heading (the lesson header shows it); "You finish with" shows the lesson's `evidence`; Gear removed (it is in the header); tools shown with `ToolPreview` thumbnails; price at `text-2xl` with "paid once"; CTA "Open all 19 lessons for €149". `docs/v2/copy/paywall.md` notes the change.
5. TOC scroll-spy recomputes on each scroll frame (last heading above 25% of the viewport, first by default).
7. Gear is a muted line under the lesson facts, not a pill.
8. One 40 rem reading column at 17 px / 1.7; figures, tools, scenes, tables and code use the 48 rem article width.
9. Callouts are muted panels with a coloured icon; only warn and legal keep a tint, both in the warning hue; green belongs to `.win`.
10. `.lab` has a header strip with an LCD-style kicker chip instead of a side stripe; blockquote border is 2 px neutral.
11. Eyebrows are muted; `.flip` menu paths are neutral chips; the orange glow is gone from the primary button and the pricing card (now a 2 px primary border).
12. Tier badges: Free is a grey pill everywhere, Complete is orange everywhere.
13 (partly). Learn header height matches the marketing navbar; both shells call the dashboard "My course", the name `docs/v2/copy/chrome.md` chose (the audit suggested "Dashboard").
14. Learner pages share one left edge (`lg:ml-0 lg:pl-4`).
15 (partly). Paid lessons show a lock in the sidebar until the visitor owns the course; finished lessons already fill their number dot green.
16 (partly). Widget hosts show a labelled placeholder while loading.
18. Pricing fine print moved to one row under both cards; both CTAs align at the bottom.
19 (partly). Locked tool links on `/tools` get distinct accessible names ("Pulse Decoder: See what Complete includes").
20–21 (partly), 25. App pages (login, My course, notebook, quiz, account) use a 30–36 px h1; account email wraps with `overflow-wrap: anywhere`.

## What was rejected, and why

- **Accessibility 9 (quiz as a radio group).** Native radios select on arrow keys, which would submit an answer in a one-attempt quiz by accident; a "Check" button per question adds a step for everyone. The buttons stay; answered questions are disabled and drop out of the tab order, and focus now lands on the feedback, which removes the reported keyboard dead end.
- **Accessibility 11 (sources, primer, reference list links).** These are links inside running list text, which WCAG 2.5.8 exempts as inline; the measured rows also pass through the spacing exception. Standalone controls (glossary terms, sidebar rows, lesson sources) were enlarged.
- **Content 3 (NXP and Analog links "dead").** NXP returns 404 to `curl` from this network for every PDF, including `PN7150.pdf`, which the audit saw as 200; fetching `NTAG213_215_216.pdf` through a browser-like client returned the 1.6 MB data sheet. These are bot blocks, not moved files. Analog Dialogue timed out the same way. Listed for a browser spot-check by the owner.
- **Content 6 (word counts over target).** Without table rows only m13 (+353) and m16 (+93) exceed the brief; tables are reference figures. Cutting lesson text is an editorial decision for the owner, not a defect fix. This pass added the requested prediction steps and an example entry, which add a little.
- **Content 9 (m06 missing "What transmits").** False positive: `06-rfid.mdx` has a "What transmits" bullet in Before you start (the heuristic looked for "Transmits").
- **Content 11 (`/index.html` returns 200).** The Node server serves the prerendered file before redirects run, and every page's canonical link already points at `/`. Extensionless `/modules/*` aliases were never public URLs.
- **Performance 2 (hashed assets `max-age=0`).** Measured with `curl -I`: a HEAD request skips the adapter's stream hook. A GET to `/_astro/*` returns `public, max-age=31536000, immutable`. Other `public/` files do get `max-age=0`; `deploy.md` adds a proxy rule.
- **Design 6 (`need()` should print nothing in production).** The markers stand for legally required facts (seller identity, VAT status, address, support contact). Hiding them would ship legal pages that silently omit what the law requires. They stay visible and are a launch gate in `deploy.md` section 8.

## Deferred (nits, not done in this pass)

- Security: rate limits on `/login`, `/api/checkout`, `/api/learner-state` and downloads (noted by the audit, not built); custom SMTP covers the email side.
- Accessibility 12: re-measure CLS on a production build.
- Performance 3 (GLB): compressing `flipper-zero.glb` with meshopt needs the decoder wired into `GLTFLoader`; 5 (greek font subsets, 9–19 KB on two pages); 7 (SiteToaster island on every page: the learner store raises toasts wherever widgets run); 10 (`og.png` recompression).
- Design: 9 (lucide icons for callout glyphs), 11 (hero and timeline orange), 13 (shared container width, `/account` in the learn shell), 15 (dashboard stage-card ticks), 16 (disabled-button style, duplicated tool list on home), 17 (hero redesign), 19 (fewer pricing CTAs; the copy file sets them), 20 (login card frame), 21 (account anchor row), 22–24, 26–28 and 30–34 (P3 spacing, type scale, radius, badges, bento, course page, LCD reuse, Flipper Sim D-pad, dark-mode bands, motion label, refund band).

## What remains for the owner

1. **Secrets** in the host environment. The four server secrets are now read at runtime: change them and restart, no rebuild. `PUBLIC_*` values still need a rebuild. `PUBLIC_SITE_URL` is now required in production (sign-in and checkout error without it).
2. **Hosted database:** apply `supabase/migrations/0003_purchase_hardening.sql` to project `pnjftkravosrcgjymxlu` (and confirm 0001 and 0002 are there).
3. **Stripe:** product, price, webhook endpoint; one test-mode purchase end to end, including a refund and a dispute. The webhook now ignores sessions without the `price_id` metadata `/api/checkout` sets, so test through the site, not `stripe trigger`.
4. **Hosting proxy:** compression and caching for `/models`, `/images` (`deploy.md` section 6).
5. **Supabase auth:** Site URL, the exact `https://<domain>/auth/callback` redirect (no wildcards), custom SMTP, and keep the magic-link template on `{{ .ConfirmationURL }}`.
6. **Prices:** the three `[decide]` values in `src/data/offer.ts`.
7. **Owner facts:** 53 `[NEED: …]` lines (`grep -rn "NEED:" src`): support email, legal entity, address, VAT status, response times, Mentored seats and booking, and lawyer review of the legal pages.
8. **Licences:** the GPL-3.0 Flipper model note in the terms and the Lab Companion app source licence.
9. **Links to check in a browser:** the 7 NXP and 2 Analog Dialogue URLs, the HID PDF (m06), and the JAMA and SAGE links (m17); they block scripted clients.
10. **Editorial:** decide whether m13 and m16 should be cut to the word budget.
11. **GitHub Pages** off, and delete `legacy/` in the launch commit.
12. **Local test data** from the security review (`secreview-a@example.test`, `secreview-csrf@example.test`) can be removed with `npx supabase db reset` when convenient.

`fa.c` is no longer at the repository root.

> Screenshots referenced in this report live in `docs/v2/screenshots/` on the machine that ran the checks; the folder is gitignored because the 350 PNGs weigh 120 MB. Regenerate with the Playwright specs described above.
