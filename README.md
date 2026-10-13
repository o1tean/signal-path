# Signal Path

A self-paced Flipper Zero course, from first setup to a project someone else can repeat. Version 2 is a server-rendered Astro app that sells one-time access with a free starter.

- **19 lessons in 6 stages**: a 12-week core path at 2–4 hours a week and an optional Wi-Fi Devboard extension. Modules 0 and 1 are free; the rest needs Signal Path Complete.
- **Quiz questions with explanations** for every lesson and the primer (199 at the time of writing; the site counts them at build time).
- **10 browser tools** on synthetic signals and **9 three.js concept scenes**, plus the official Flipper Zero body model.
- **A lab notebook** with spaced review and JSON backup/restore. Progress lives in the browser and syncs to the account when signed in.
- **Primary sources** (Flipper docs, Microchip HCS301, ANCOM, the Romanian Criminal Code) with review dates on every lesson.

The previous static site is kept under `legacy/` until launch QA and is still live on `main`.

## Educational scope

The course explains how radio, access and identification systems work and how they are defended. Every lab runs on equipment the learner owns or has written permission to test, in a scope the learner writes down first. Lessons teach mechanisms, measurement and defence, never procedures against other people's systems. Owning the device or having an educational purpose does not replace permission, the radio conditions that apply where you are, or data and privacy obligations. Badges are self-reported progress, not certification.

## Local setup

Requirements: Node 22.18 or later (the content check uses Node's built-in TypeScript stripping), npm, and Docker for the local Supabase stack.

```sh
npm ci
cp .env.example .env
npx supabase start            # Docker; applies supabase/migrations and prints the local URL and keys
```

Put the printed `API_URL`, `PUBLISHABLE_KEY` and `SECRET_KEY` into `.env` as `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. Leave the Stripe variables empty unless you are testing checkout; `/api/checkout` then answers "not configured". Then:

```sh
npm run dev                   # http://localhost:4321 (Astro 7 runs it in the background: npx astro dev status|logs|stop)
```

- Sign-in emails land in Mailpit at http://127.0.0.1:54324.
- To read paid lessons locally without buying, set `SP_DEV_BYPASS=1` and restart the dev server. Builds ignore it.
- To grant a local account the course, see `docs/v2/deploy.md` (one SQL insert).
- The dev server reads `.env` only when it starts, so restart it after editing `.env`.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server on :4321 |
| `npm run build` / `npm run preview` | Production build into `dist/` (Node standalone server) / serve it |
| `npm run check` | `astro check` (TypeScript and Astro diagnostics) |
| `npm run check:content` | Lesson schema and shape, widget, scene, quiz and glossary ids, `tools.ts` against `src/widgets`, internal links, legacy redirects. `-- --strict` also fails on warnings |
| `npm test` | Vitest unit tests (entitlements, webhook, checkout, learner store, widget logic) |
| `npm run check:bundle` | After a build: fails if any paid quiz question appears in `dist/client` |
| `npm run verify` | check, check:content, test, build, check:bundle. CI runs this |
| `npm run test:e2e` | Playwright against the dev server on :4321 (starts it if needed). Sign-in, paywall and platform specs need the local Supabase stack |

Run Playwright on a quiet machine: the scenes spec compiles WebGL shaders in software and times out under heavy load.

## Structure

```
src/
  content/lessons/NN-slug.mdx   the 19 lessons; frontmatter schema in src/content.config.ts
  content/pages/*.html          primer, reference, sources, case studies, Romanian lab guide (rendered by ResourcePage)
  data/course.ts                module ids, order, slugs, badges and stage descriptions (client store keys)
  data/quiz/free/*.ts           primer, m00, m01 questions (public)
  data/quiz/paid/*.ts           m02–m18 questions, server only
  data/offer.ts tools.ts faq.ts glossary.ts
  lib/lessons.ts                lesson catalogue from the content collection (titles, minutes, access, stage)
  lib/access.ts                 hasAccess(), the paid-content boundary
  lib/learner.ts                local-first learner store, backup/restore, sync
  lib/supabase/ lib/stripe.ts   auth clients and Stripe
  middleware.ts                 session, entitlements on every on-demand request
  pages/                        marketing pages (prerendered), /learn, /account, /checkout, /api (on demand)
  pages/dev/                    widget and scene test pages, 404 outside `astro dev`
  widgets/*.ts                  the 10 browser tools, `mount(el, opts) => cleanup`
  widgets/scene3d/              three.js scenes
  components/{ui,marketing,learn,mdx,content}/
private/downloads/              paid files, streamed by /api/downloads/[name] after the entitlement check
public/                         static assets, models/flipper-zero.glb with its licence
supabase/migrations/            schema and row-level security
scripts/                        check-content.ts, check-bundle.ts, og.mjs
tests/unit tests/e2e            Vitest and Playwright
docs/v2/                        architecture, offer, copy brief, lesson brief, deploy, verification
```

Lesson titles, weeks, minutes, access and stage come only from lesson frontmatter. Counts in the copy (lessons, questions, tools) are computed from the data at build time in `src/components/marketing/site.ts`.

## Writing a lesson

Read `docs/v2/lesson-brief.md` and `docs/v2/copy-brief.md` first. In short:

1. The file is `src/content/lessons/NN-slug.mdx`; every frontmatter field in `src/content.config.ts` is required.
2. H2s in this order: Outcome · Before you start · Understand · Predict and practise · Check yourself · Keep evidence · Continue.
3. MDX components need no import: `<Callout>`, `<Lab>`, `<Win>`, `<Checklist>`, `<Figure>`, `<Flip>`, `<Term id>`, `<Widget name>`, `<Scene3D name>`, `<Quiz id>`. Every `<Widget>` and `<Scene3D>` must also be listed in frontmatter `tools` / `scenes`.
4. Questions go in `src/data/quiz/paid/<id>.ts` (or `free/` for free lessons): four options each, explanations that teach, answers spread across positions.
5. No HTML comments in MDX (`{/* … */}` instead). Run `npm run check:content`.

## Deploy

See `docs/v2/deploy.md` for environment variables, the hosted Supabase project, Stripe setup and the launch checklist. Any Node 22 host works. Turn off GitHub Pages before launch: the old deployment publishes every lesson.

## Licences

- Course text, code and illustrations: the repository has no licence file, so they stay under the owner's copyright.
- three.js: MIT.
- `public/models/flipper-zero.glb`: derived from the official Flipper Devices 3D models, GPL-3.0. The full licence and a notice of changes are in `public/models/` and ship with the model. It is a public asset and never part of paid content.
- Inter and JetBrains Mono (via Fontsource, self-hosted): SIL Open Font License 1.1.
- Other npm dependencies keep their own licences (see `node_modules/*/package.json`).

Signal Path is independent and not affiliated with or endorsed by Flipper Devices Inc. Flipper Zero is a trademark of its owner.
