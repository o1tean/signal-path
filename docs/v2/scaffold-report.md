# Signal Path v2 foundation: build report

The foundation is built on branch `v2` with nothing committed, and `npm run verify` passes. On the dev server every route in step 14 returned the expected status. `/learn/02-modulation` contains "AM650" 0 times with the bypass off and 14 times with `SP_DEV_BYPASS=1`. Wave Lab mounted and awarded `wave-rider` in the browser. `legacy/` is untouched.

The user's relayed request was applied to all customer-facing text, using the copywriting and copy-editing skills:
- **New copy:** home, course, pricing, tools, legal, paywall, dashboard, notebook, quiz and 404 pages, plus `offer.ts`, `faq.ts` and `tools.ts`, written to `docs/v2/copy-brief.md`.
- **Ported pages and the two lessons:** 58 em dashes removed, plus contrast reveals, a negation list and stale claims ("Momentum is assumed", "playground", "nine simulators", repo paths).
- **Missing facts** are marked `[NEED: …]` rather than invented.
- **Final scan** found no em dashes, exclamation marks or banned phrases in the new copy.
- **Not edited:** quiz and glossary text, which stays exactly as in the legacy files.

## (a) Files created

```
scripts/check-content.ts
tests/unit/{learner,pixel,wave-lab}.test.ts
src/content.config.ts  src/env.d.ts
src/styles/global.css
src/lib/{utils,learner,pixel,access}.ts
src/data/{course,offer,faq,glossary,nav,tools,testimonials}.ts
src/data/quiz/{types,free}.ts  src/data/quiz/paid/index.ts
src/content/lessons/{00-setup,02-modulation}.mdx
src/content/pages/{primer,reference,sources,case-studies,romania-lab-guide}.html
src/layouts/{Base,Marketing,Learn,Lesson}.astro
src/components/{SiteControls.astro,SiteToaster.tsx,MobileNav.tsx}
src/components/ui/{accordion,badge,button,card,dialog,input,label,navigation-menu,progress,separator,sheet,skeleton,sonner,tabs,tooltip}.tsx
src/components/mdx/{Callout,Lab,Win,Checklist,Figure,Flip,Term,Widget,Scene3D,Quiz}.astro  index.ts
src/components/marketing/{Section,Hero,HowItWorks,StageTimeline,ToolShowcase,PricingTable,BonusStack,Guarantee,Faq,Cta,Navbar,Footer}.astro
src/components/learn/{LearnSidebar,LessonToc,PrevNext,Paywall,LessonLcd}.astro
src/components/learn/{ProgressRing,ResumeLink,LearnNavSheet,MarkComplete,QuizIsland,QuizPractice,NotebookIsland,BadgeGrid}.tsx
src/components/content/{ResourcePage,HtmlFragment,LegalPage}.astro
src/pages/{index,course,pricing,primer,reference,glossary,sources,case-studies,romania-lab-guide,tools,404}.astro
src/pages/legal/{terms,privacy,refunds,imprint}.astro
src/pages/learn/{index,[slug],notebook,quiz,atlas}.astro
src/widgets/{types,registry,wave-lab}.ts  src/widgets/lib/dom.ts  src/widgets/scene3d/index.ts  src/widgets/README.md
```

Root files:
- **New:** `astro.config.mjs`, `tsconfig.json`, `package.json`, `components.json`, `vitest.config.ts`, `.env.example`, `.github/workflows/ci.yml`, `public/{favicon.svg, images/signal-path-logo.png (10 KB), images/device.svg, images/wifi-board.svg}`.
- **Removed:** `.github/workflows/pages.yml`.
- **Edited:** `.gitignore` (entries merged in, plus `.env.local`). There is no `supabase/` folder.

## (b) npm scripts

| Script | Command | Result |
|---|---|---|
| dev / build / preview | `astro dev` / `astro build` / `astro preview` | build passes |
| check | `astro check` | 0 errors, 0 warnings |
| check:content | `node scripts/check-content.ts` (add `-- --strict` to fail on warnings) | PASS: 2/19 lessons, 116 questions, 1 widget ported, 29 legacy redirects, 31 warnings |
| test | `vitest run` | 15/15 pass |
| verify | check, then check:content, then test, then build | pass |

- **Warnings:** the 31 warnings are only lessons not yet migrated, links to them, and widgets not yet ported. `--strict` turns them into failures.
- **Dev server:** in Astro 7, `astro dev` runs in the background. Stop it with `npx astro dev stop`; `pkill` does not.
- **Browser pass:**
  - `/learn/00-setup`: the quiz, toast, mark-complete and store writes all worked.
  - Unported widgets now show a neutral notice instead of logging an error. A forced-mount run confirmed zero `console.error` calls.
  - The console still shows one old `flipper-sim` error from before that fix.
  - The Browser pane was hidden part of the time, which pauses IntersectionObserver, so I sometimes forced a mount to check.
  - Mobile at 375px has no horizontal scroll, and light theme renders correctly.

## (c) MDX components and widget contract

All of these work in lesson MDX without imports, because `[slug].astro` passes `mdxComponents` to the rendered content.

- **`<Callout variant="note|tip|warn|story|legal" title?>`**: children are the body. Optional `slot="icon"` replaces the default glyph.
- **`<Lab kicker title gear?>`**: children are the steps, as an ordered Markdown list.
- **`<Win criterion?>`** or **`<Win>text</Win>`**: rendered as "You've got it when: …".
- **`<Checklist title? items?: string[]>`**: or pass a Markdown list as children.
- **`<Figure caption? label?>`**: wraps inline SVG. `label` makes the figure read as one image (`role="img"`).
- **`<Flip>Sub-GHz → Read</Flip>`**: inline device-menu token.
- **`<Term id="glossary-slug">text?</Term>`**: links to `/glossary#id`. An unknown id fails the build.
- **`<Widget name="wave-lab" opts?={{...}} />`**: the name must also be in frontmatter `tools`. `check:content` checks both directions.
- **`<Scene3D name caption? label? opts?>`**: the name must be in `scenes` and be one of: flipper, devboard, carrier, modulation, pulses, rolling, nearfield, infrared, gpio.
- **`<Quiz id="m02" limit? shuffle? />`**: runs on the server and passes only that module's questions to the browser. A free lesson cannot use a paid bank.

Every lesson needs these H2s in this order: Outcome · Before you start · Understand · Predict and practise · Check yourself · Keep evidence · Continue.

**Widget contract** (full version in `src/widgets/README.md`):
- Each widget is `src/widgets/<id>.ts` exporting `mount(el, opts) => cleanup`. It is found automatically, with no registration step.
- Widgets mount lazily within 200px of the viewport, and any number can share one page. `unmountAll()` runs all cleanups.
- State changes go only through `@/lib/learner`. Colours come from tokens via `cssVar('--scope-*')` or token classes.
- Use `onThemeChange` and `fitCanvas` from `lib/dom.ts`, native labelled controls, an `aria-live` readout, a canvas with `role="img"`, and 44px touch targets.

## (d) Learner store API (`src/lib/learner.ts`)

- **Storage keys:** `STATE_KEY='signalpath.v2'`, `THEME_KEY='signalpath.theme'`, `MOTION_KEY='signalpath.motion'`. The stored shape is the legacy one.
- **Stores:** `$learner`, plus read-only slices `$done`, `$quizBests`, `$badges`, `$atlas`, `$notes`, `$doneCount`, `$nextModule`. Also `$theme` (`'light' | 'dark' | null`) and `$motion` (`'paused' | 'playing'`).
- **Progress:** `markDone(id, done)` awards the module badge (and All Clear) quietly; un-marking keeps badges. `award(badgeId, quiet?)` returns a boolean and does nothing if already earned. `recordQuiz(id, score, total)` returns `{best, perfect}`, keeps the legacy tie rule, and awards `perfect-quiz`. `isDone`, `doneCount`, `nextModule`, `badgeEarned(id, s?)` (All Clear shows only while every module is still done). `resetProgress()` keeps atlas and notes.
- **Notebook:** `saveNote(moduleId, fields, retrieved?)`, `today()`, `setAtlas(rows)`.
- **Low level:** `updateLearner(fn)` and `commit(state)` return `false` if browser storage failed. `reloadLearner()` re-reads storage; changes from other tabs are picked up automatically.
- **Backup:** `createBackup()` writes format `"signal-path-backup"` version 1. `backupFilename()`, `parseBackup(text, bytes)`, `migrateLegacyBackup(payload)` (the legacy validator, unchanged), `applyBackup(restored)`, `BackupError`, `BACKUP_MAX_BYTES`.
- **Events:** `onLearnerEvent(fn)` receives `badge`, `complete` or `storage-error`. `SiteToaster` turns these into toasts.
- **Theme and motion:** `effectiveTheme`, `setTheme`, `toggleTheme`, `setMotion`, `prefersReducedMotion`, `animationAllowed`.
- **Types:** `LearnerState`, `NoteEntry`, `AtlasRow`, `QuizBest`, `BackupFile`.
- **Access helper (`src/lib/access.ts`):** `hasAccess(locals, access)`. Free lessons always pass. Paid lessons pass on a `course-complete` or `mentored-path` entitlement, or under `astro dev` with `SP_DEV_BYPASS=1`; production builds ignore the bypass.

## (e) Deviations and open issues

The full list is in `docs/v2/architecture.md` under "Deviations". The main ones:
- **Quiz split:** `free.ts` holds `primer` as well as m00 and m01, because the primer is a public page (20 free, 96 paid, 116 total).
- **Extra component:** `<Quiz>` was added to the MDX set.
- **Callout:** gained a `legal` variant.
- **No `Diagram` component:** `Figure` covers diagrams.
- **Resource pages:** stored as cleaned HTML fragments in `src/content/pages`, rendered with `set:html`, with marker comments turned into live widgets and quizzes.
- **Dev bypass:** works under `astro dev` only.
- **Lesson stubs:** unmigrated `/learn/<slug>` pages show a "being moved" stub with HTTP 200.
- **Pending widgets:** listed in `PENDING_WIDGETS`, reported as warnings.
- **TypeScript:** 6.0.3, as resolved by npm.
- **New dev dependency:** `yaml`.
- **No `/index.html` redirect:** the Node server serves the home page at that path.

Open issues for later agents:
1. 17 lessons still to migrate, and 9 widgets still to port: flashcards, flipper-sim, pulse-decoder, rf-calc, rolling-sim, signal-atlas, spectrum-scope, tool-picker, tune-in.
2. `scene3d` is a pixel-LCD placeholder. three.js is installed but unused. The 3D model's GPL-3.0 licence must ship with it when it is ported.
3. Paywall and pricing buttons point at `/pricing#buy`, and the paywall has no sign-in link. The platform agent wires `/login?next=` and checkout.
4. Prices are placeholders marked `[decide]` (€149 Complete, €99 founding, €699 Mentored).
5. Gaps marked `[NEED]` are in the FAQ invoice answer, all four legal pages, and the support email on `/sources`.
6. Quiz answer options are now shuffled per run (the legacy answer key was mostly "B"). Question text is unchanged.
7. Links in the legacy fragments to `downloads/*.md` now point to `/learn/notebook`.
8. The `<meta name="theme-color">` tags use hex values.
9. CI uses Node 22, so `check:content` needs Node 22.18 or later for built-in TypeScript stripping.

## (f) Verified APIs appended to `CLAUDE.md`

`https://docs.astro.build/llms-small.txt` returns 404, so I checked the individual doc pages instead. Each entry carries its URL and the date 2026-10-12. They cover astro@7.3.8:
- content collections with the glob loader and `astro/zod` (Zod 4)
- `render()` returning Content and headings, and passing MDX components
- `redirects` serving real 301s with an adapter
- `output: 'server'` with the Node adapter in standalone mode, and `prerender = true`
- middleware and `App.Locals` typing
- `loadEnv` in the config file, and `import.meta.env` in server code
- v7 breaking changes: Rust compiler, `compressHTML: 'jsx'`, Sätteri for Markdown, `src/fetch.ts` reserved
- Tailwind 4 through `@tailwindcss/vite`
- processed scripts bundled once per page
- client directives, including `client:only="react"`

Two more entries come from CLI behaviour rather than docs: `astro dev` running in the background, and the shadcn@4.21.4 `cn` / `next-themes` import problem that had to be fixed by hand.