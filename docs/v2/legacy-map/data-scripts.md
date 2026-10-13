# Legacy map: data, scripts, CI, SEO and examples

Scope: `legacy/assets/js/data/*`, `legacy/scripts/*`, `.github/workflows/pages.yml`, `legacy/{sitemap.xml,robots.txt,404.html}`, `legacy/downloads/*`, `legacy/examples/lab-companion/*`. Nothing under `legacy/` was modified.

## 1. Data files (all are classic scripts attaching to `window`, no modules)

| File | Global | Shape | Lines |
|---|---|---|---|
| `legacy/assets/js/data/course.js` | `window.SP_COURSE` | `{modules[], badges[], stages[]}` | 100 |
| `legacy/assets/js/data/quiz-bank.js` | `window.SP_QUIZ_BANK` | `{ [moduleId|"primer"]: Question[] }` | 1285 |
| `legacy/assets/js/data/glossary.js` | `window.SP_GLOSSARY` | `GlossaryEntry[]` | 358 |

Load-order contract: `course.js` must precede `site.js` (site.js reads `window.SP_COURSE` at top level and exposes `SP.MODULES = course.modules`, `SP.BADGES = course.badges`). `quiz-bank.js` is read lazily (`window.SP_QUIZ_BANK || {}`) in `site.js` `mountQuizzes()` and `quiz.html`. `glossary.js` is loaded only by `glossary.html` and pages hosting the flashcards widget. `check-course.cjs` enforces catalog-before-runtime on every html page including `404.html`.

### 1.1 Module (`SP_COURSE.modules[]`, 19 entries, order = learning order)

```
{ id: "m00".."m18" (string, unique), n: number (0..18),
  week: string (display only, e.g. "Week 1", "Week 11–12", "Hardware extension"),
  title: string, href: "modules/NN-slug.html" (relative to site root, unique),
  badge: string (id in badges[]) }
```
`SP.root` (body `data-root`, `""` or `"/signal-path/"`) is prefixed to `href` by consumers (`learning.js`). Each module page must carry `data-page="<id>"` and a `data-quiz="<id>"` host (check-course asserts both).

| id | n | week | title | href | badge |
|---|---|---|---|---|---|
| m00 | 0 | Week 0 | Meet your radio lab | modules/00-setup.html | signal-seeker |
| m01 | 1 | Week 1 | Find the frequency | modules/01-frequency.html | frequency-finder |
| m02 | 2 | Week 1 | Hear the signal: AM vs FM | modules/02-modulation.html | modulation-master |
| m03 | 3 | Week 2 | Decode a real protocol | modules/03-protocols.html | protocol-reader |
| m04 | 4 | Week 2 | Your first legal replay | modules/04-transmit.html | clean-transmitter |
| m05 | 5 | Week 3 | Raw signals & rolling codes | modules/05-raw-and-rolling.html | code-breaker |
| m06 | 6 | Week 4 | 125 kHz RFID | modules/06-rfid.html | tag-whisperer |
| m07 | 7 | Week 4 | NFC at 13.56 MHz | modules/07-nfc.html | nfc-explorer |
| m08 | 8 | Week 5 | Firmware, apps & Momentum | modules/08-momentum.html | momentum-pilot |
| m09 | 9 | Week 5 | Troubleshooting field guide | modules/09-troubleshooting.html | field-medic |
| m10 | 10 | Week 6 | Foundation project: your signal atlas | modules/10-capstone.html | atlas-builder |
| m11 | 11 | Week 7 | Infrared: build your own remote | modules/11-infrared.html | infrared |
| m12 | 12 | Week 8 | GPIO: signals you can touch | modules/12-gpio.html | gpio |
| m13 | 13 | Week 8 | USB and Bluetooth: understand trust | modules/13-usb-bluetooth.html | usb-bluetooth |
| m14 | 14 | Week 9 | iButton and U2F: identity is not authentication | modules/14-contact-and-authentication.html | contact-and-authentication |
| m15 | 15 | Week 10 | Build your first Flipper app | modules/15-app-development.html | app-development |
| m16 | 16 | Week 11 | Authorized security research: test the claim | modules/16-security-lab.html | security-lab |
| m17 | 17 | Week 11–12 | Mastery project: explain, measure, teach | modules/17-mastery.html | mastery |
| m18 | 18 | Hardware extension | Wi-Fi Devboard & firmware | modules/18-wifi-devboard.html | wifi-devboard |

Note: `week` strings contain an en dash (`11–12`). Module titles are also shown in `<title>` as `Module N · <title> · Signal Path`.

### 1.2 Badge (`SP_COURSE.badges[]`, 24 entries)

```
{ id: string (unique), ic: string (single glyph, not an image), name: string, how: string (unlock hint) }
```
- 19 module badges (one per module, ids = `modules[].badge`). Note the id/name mismatches that persisted state depends on: `code-breaker` is named "Rolling-Code Realist"; `momentum-pilot` is "Firmware Pilot"; `wifi-devboard` is "Wi-Fi Explorer". m00-m10 use distinct glyphs, m11-m17 all use `◇`, m18 uses `◉`.
- 5 non-module badges: `tuned-in` (◉, "Score 5 in the Tune In game", widget `tune-in.js`), `wave-rider` (≈, "Encode a message in the Wave Lab", `wave-lab.js`), `out-of-sync` (⊘, "Watch a replay fail in the Rolling Code Sim", `rolling-sim.js`), `perfect-quiz` (✓, "Score 100% on any quiz", awarded by `SP.quiz` in `site.js` when `correct === qs.length`), `all-clear` (◆, "Complete every module").
- Awarding is by `SP.award(id)` (site.js); ids are stored in persisted state, so v2 must keep ids stable or migrate.

### 1.3 Stage (`SP_COURSE.stages[]`, 6 entries)

```
{ id: string, label: string (eyebrow), title: string, modules: string[] (module ids), description: string, evidence: string (checkpoint) }
```
| id | label | title | modules |
|---|---|---|---|
| starter | Start here · Weeks 0–1 | Set up your lab | m00, m01 |
| signals | Stage 1 · Weeks 1–3 | Read and reason about signals | m02-m05 |
| atlas | Stage 2 · Weeks 4–6 | Build your signal atlas | m06-m10 |
| build | Stage 3 · Weeks 7–10 | Build across interfaces | m11-m15 |
| research | Stage 4 · Weeks 11–12 | Demonstrate independent work | m16, m17 |
| wifi | Optional extension · After Modules 8, 12 & 15 | Take the Wi-Fi path | m18 |

Invariant: `stages.flatMap(s => s.modules)` equals `modules.map(m => m.id)` exactly (each module once, in order). Header comment: "Stage grouping is navigation, not access control" (relevant to the paywall: stages are not gates). Rendered by `learning.js` into any `[data-course-stages]` host as `div.card#<stage.id>` containing `p.eyebrow`, `h3`, `p`, `ol.route-links` of links, and `p > b "Checkpoint: "` + evidence.

### 1.4 Quiz question (`SP_QUIZ_BANK[id][]`)

```
{ q: string, opts: string[] (3 or 4, unique within question), a: integer index into opts, why: string (explanation) }
```
No other keys exist (verified). Keys of the bank: `primer` plus `m00`..`m18` (20 keys). **Total 116 questions.**

| key | questions | option count | correct-index distribution (0/1/2/3) |
|---|---|---|---|
| primer | 6 | 4 | 2/4/0/0 |
| m00 | 6 | 4 | 0/6/0/0 |
| m01 | 8 | 4 | 1/6/1/0 |
| m02 | 9 | 4 | 3/6/0/0 |
| m03 | 8 | 4 | 2/6/0/0 |
| m04 | 8 | 4 (some 3) | 2/6/0/0 |
| m05 | 9 | 4 (some 3) | 0/9/0/0 |
| m06 | 7 | 4 | 2/5/0/0 |
| m07 | 6 | 4 | 1/5/0/0 |
| m08 | 7 | 4 (some 3) | 2/5/0/0 |
| m09 | 7 | 4 | 5/2/0/0 |
| m10 | 5 | 4 | 0/4/1/0 |
| m11 | 3 | 3 | 1/1/1/0 |
| m12 | 3 | 3 | 1/1/1/0 |
| m13 | 3 | 3 | 1/1/1/0 |
| m14 | 3 | 3 | 1/1/1/0 |
| m15 | 3 | 3 | 1/1/1/0 |
| m16 | 4 | 3 | 1/1/2/0 |
| m17 | 3 | 3 | 1/1/1/0 |
| m18 | 8 | 3 | 2/3/3/0 |

Content-quality flags for v2 (do not silently preserve): the answer key is heavily biased to index 1 in m00-m10 (e.g. m00 6/6, m05 9/9) and the primer is never index 2 or 3, so a learner can guess "B". The bank has no module-level difficulty, tags or ids per question; there is no stable question id (identity is `(moduleId, array index)`). Scores are stored per quiz id as `{score,total}`; `quiz.html` uses id `"mixed"` for the all-scope run and the module id otherwise. v2 should add stable question ids, shuffle option order at render time, and rebalance keys. Modules m11-m17 have only 3-4 questions each, below the 5-9 of earlier modules.

Consumers: `SP.quiz(host, qs, {id, shuffle, limit})` in `site.js` (lines ~270-305), `mountQuizzes()` reads `data-quiz="<id>"`, optional `data-limit="<int>"`, boolean `data-shuffle`; falls back to `<p class='faint'>Quiz coming soon.</p>` when empty. `quiz.html` builds a scope `<select id="quizScope">` from modules that have a bank entry plus "Primer", values `all|<id>|primer`; controls `#quizCount`, `#quizStart`, `#quizHost`, `#scoreRows`; a score table with pill classes `pill green|grey`. `primer.html` hosts `data-quiz="primer"` (and `data-page="primer"`). Quiz-page-specific: `SP.state.quiz[id]` shape `{score,total}`; `SP.isDone(id)`.

### 1.5 Glossary entry (`SP_GLOSSARY[]`)

```
{ term: string, short: string (one line), long: string (definition), tags: string[] }
```
- **58 entries**, sorted A-Z case-insensitively by `term` (verified; header says it must stay sorted). Only keys: `term, short, long, tags`.
- Tag vocabulary (10) with counts: sub-ghz 38, units 18, protocol 17, security 11, modulation 8, rfid 8, nfc 8, flipper 6, legal 5, hardware 4.
- Terms: .sub file, AM (Amplitude Modulation), Antenna, Bandwidth, Bit length, Brute force, CAME, Carrier, CC1101, Counter (Cnt), dBm, Duty cycle, EM4100, Emulate, Fixed code, FM (Frequency Modulation), Frequency, Frequency Analyzer, FSK (Frequency-Shift Keying), GHz, HF (13.56 MHz), HID Prox, Holtek, Hz, Indala, ISM band, ISO 14443, Jamming, KeeLoq, Key, kHz, LF (125 kHz), MHz, Mifare Classic, Modulation, mW (milliwatt), NFC, NICE FLO, Noise floor, NTAG, OOK (On-Off Keying), Preamble, Preset, Princeton, Protocol, RAW capture, Region / regulatory, Replay, RF, RFID, Rolling code, RSSI, Security+ 2.0, Sub-GHz, T5577, TE (timing element), UID, Wavelength.
- Consumers: `glossary.html` (inline script; ids `gl-list`, `gl-search`, `gl-count`; normalises field aliases `term|t|name`, `short|s|abbr`, `def|long|d|definition|desc`; anchor ids via `slug()` = lowercase, non-alphanumerics to `-`, trimmed; HTML-escapes) and `widgets/flashcards.js` (`[data-widget="flashcards"]`, filters by `e.term`, builds union of tags for a filter). No glossary entry links to modules; no cross-references between terms.

Observed text that v2 must re-verify (it is prose, not code): numeric claims such as quarter-wave 17.3 cm at 433.92 MHz (c/f = 69.1 cm, /4 = 17.3 cm: correct) and Flipper ranges "300-348, 387-464, 779-928 MHz".

## 2. Scripts (`legacy/scripts/`)

| Script | Purpose | Runs in CI |
|---|---|---|
| `check-site.py` | Static link/structure checker | yes |
| `check-course.cjs` | Catalog and quiz integrity | yes |
| `build-site.py` | Stages `_site/` for Pages | yes |
| `build-flipper-glb.py` | One-off Blender asset build | no |

### 2.1 `check-site.py` (Python 3, stdlib + `node` on PATH)
Parses every `*.html` in root and `modules/` with `html.parser`. Validates, per page:
1. Exactly one `<h1>`.
2. No duplicate `id` attributes.
3. Every local `href`/`src` (no scheme/netloc) resolves to an existing file; directories resolve to `index.html`; `/signal-path/...` absolute links are mapped to the repo root; any other root-absolute `/...` link is an error ("will escape project path"); targets must stay inside ROOT.
4. If a link has a `#fragment` and the target is a checked page, the fragment must exist as an `id` there.
5. Every inline `<script>` (no `src`, type JS/module) passes `node --check`.
Plus: every `assets/js/**/*.js` passes `node --check`. Prints `PASS: N pages; ...`. Gaps v2 should close: no `<title>`/meta description/canonical/alt-text/heading-order checks, no external-link checking, only links in `href`/`src` (not `srcset`, CSS `url()`, or `data-*` URLs), `ROOT` hard-codes `parents[1]` so it breaks after the move to `legacy/` only if run from a different layout (it still works inside `legacy/`).

### 2.2 `check-course.cjs` (Node, `vm` sandbox)
Loads `course.js` and `quiz-bank.js` into a VM context and asserts:
- ids unique for modules, hrefs unique, badge ids unique, stage ids unique; `modules.length === 19`.
- stage module lists concatenated deep-equal module id order (each exactly once); each stage has `title,label,description,evidence` and non-empty `modules`.
- Every html in root and `modules/` loads `assets/js/data/course.js` before `assets/js/site.js` (regex on `<script src=...>`).
- For each module: page file exists; contains `data-page="<id>"` and `data-quiz="<id>"`; bank has at least 3 questions; its `badge` exists in `badges`.
- Quiz bank: every key is `primer` or a module id; each question has `q`, `why`, `opts.length >= 2`; `a` is an integer in range; options unique.
Prints `PASS: 6 stages, 19 module routes, catalog loading and 116 quiz questions.` Hard-coded `19` must change when modules are added. Not checked: badges referenced by widgets exist; glossary schema/sort/tag vocabulary; module `n` sequence; every badge `how`; answer-key distribution.

### 2.3 `build-site.py`
Deletes and recreates `_site/`; copies root `*.html`; copies `.nojekyll`, `sitemap.xml`, `robots.txt` if present; copies whole dirs `assets`, `modules`, `downloads`; copies only `application.fam` and `lab_companion.c` into `_site/examples/lab-companion/`. Excludes notebooks (`.ipynb`), caches, repo metadata. `_site/` is in `.gitignore`.

### 2.4 `build-flipper-glb.py` (Blender `bpy`, NOT portable)
One-off script that produced `assets/models/flipper-zero.glb` from `flipper-zero-body-3d.stl`: bisects the mesh on planes, assigns 4 materials (body, accent #ff590d-ish orange for d-pad ring and back button, glass for screen recess, dark), planar-dissolve decimate (2.5 degrees, delimit by material), smooth shade (35 degrees), exports GLB with no textures/animation/cameras/lights, and renders a Workbench preview. **Hard-coded absolute scratchpad path `S=/private/tmp/claude-501/-Users-o1tean-Documents-work-signal-path/f79163cf-.../scratchpad`** and an STL input that is not in the repo (so it is not reproducible). Port: keep the committed `.glb` (licence file `assets/models/LICENSE-flipperzero-3d-models` must travel with it); archive the script under `tools/` with the path parameterised or drop it.

## 3. CI / deploy (`.github/workflows/pages.yml`, repo root)
Name "Check and deploy course". Triggers: push to `main`, any `pull_request`, `workflow_dispatch`. `permissions: contents: read`; concurrency group `pages-${{ github.ref }}`, `cancel-in-progress: false`.
- Job `check` (ubuntu-latest): checkout pinned by SHA (`actions/checkout@11d5960a... # v4`); `python3 scripts/check-site.py`; `node scripts/check-course.cjs`; `python3 scripts/build-site.py`; upload Pages artifact (`actions/upload-pages-artifact@v4`, path `_site`) only when not a PR.
- Job `deploy`: only non-PR; `needs: check`; permissions `pages: write`, `id-token: write`; environment `github-pages`; `actions/deploy-pages@v4`.
- **Stale after the restructure**: the workflow still calls `scripts/*` at repo root, but those files now live in `legacy/scripts/` (root `scripts/` does not exist; git status shows renames into `legacy/`). It would fail on push to `main` today. v2 must replace it (Astro build, typecheck, content/quiz validation, link check) and decide the host: the Pages subpath `/signal-path/` base (legacy `data-root`, 404.html absolute `/signal-path/` links) goes away with a custom domain or Vercel/Cloudflare. Only `actions/checkout` is SHA-pinned; the Pages actions use tags.

## 4. SEO files
- `legacy/robots.txt`: `User-agent: *`, `Allow: /signal-path/`, `Sitemap: https://o1tean.github.io/signal-path/sitemap.xml`.
- `legacy/sitemap.xml`: **30** `<loc>` entries (verified), no `lastmod`/`priority`. Base `https://o1tean.github.io/signal-path/`. URLs:
  - 11 top-level: `case-studies.html`, `glossary.html`, `index.html`, `legal.html`, `notebook.html`, `playground.html`, `primer.html`, `quiz.html`, `reference.html`, `roadmap.html`, `sources.html`.
  - 19 modules: `modules/00-setup.html` through `modules/18-wifi-devboard.html` (hrefs in section 1.1).
  - On disk there are 12 top-level html files; the extra one is `404.html`, correctly excluded.
  - v2 must emit redirects or keep URLs: legacy used `.html` suffixes and `index.html`.
- `legacy/404.html`: `body[data-root="/signal-path/" data-page="404"]`; absolute `/signal-path/assets/...` links; sets theme before paint from `localStorage["signalpath.theme"]` (`"light"|"dark"` -> `html[data-theme]`); `header.topbar` is empty and filled by `site.js`; `<pre class="ascii-art" data-ascii="flipper" aria-hidden="true">` filled by `presentation.js`; CTAs to index, playground, glossary; copy "404 · no carrier / This frequency is dead air." Loads `course.js`, `site.js`, `presentation.js` (in that order) and CSS `site.css` + `presentation.css`.

## 5. localStorage keys referenced by these files' consumers
- `signalpath.v2`: main progress state (`SP.state`: includes `quiz[id]={score,total}`, done modules, badges, notebook; see site.js `load()/save()`; `sp:state` custom event fired on change).
- `signalpath.theme`: `"light"` or `"dark"`; read inline in every page `<head>` to avoid flash; `THEME_KEY` in site.js.
- `signalpath.motion`: reduced-motion preference override read in site.js/presentation code.
(Full state-schema mapping belongs to the site.js map; keys listed here only because the data files' ids feed them: module ids, badge ids, quiz ids incl. `"mixed"`.)

## 6. Downloads (`legacy/downloads/`)
Plain Markdown lab templates, no licence header, no build step, copied verbatim to `_site/downloads/`.
- `lab-notebook.md` (598 bytes): "Signal Path lab notebook" with 14 blank bullet fields (Date/module; Objective and hypothesis; Equipment, firmware and SDK versions; Authority, permitted actions, location and time; RF interface reference; Expected result; Positive control/baseline; Changed variable/negative control; Observations incl. failures; Explanation and alternatives; Limitations and untested claims; Cleanup/recovery; Next experiment; Review date/explanation without notes). Instruction: use aliases, no credentials or personal info. Linked from `notebook.html` inside a `<noscript>` fallback: `href="downloads/lab-notebook.md"`. The JS notebook (`notebook.html`, form with `#note-status` live region and `#review-queue`) is the primary UI and mirrors these fields.
- `wifi-devboard-notebook.md` (1366 bytes): "Wi-Fi Devboard lab record" with sections Inventory (7 fields), Scope and setup (6), Prediction and observations (prediction/variable/fixed factors + 7-row trial table: trials 1-3 position A, 4-6 position B, plus "Control: AP off, fresh scan"; columns Trial, Position/orientation, AP alias, Channel, RSSI (dBm), Observation), Recovery and explanation (7). Linked from `modules/18-wifi-devboard.html:501` as `../downloads/wifi-devboard-notebook.md` ("board worksheet").
- v2 note: both should become downloadable, versioned assets (and possibly a purchased-only bonus pack); no PDF/printable form exists.

## 7. Example app (`legacy/examples/lab-companion/`)
A minimal Flipper Zero external app (FAP) used by Module 15; it draws text and exits on Back, no radio, credentials or network access.
- `application.fam`: `appid="signal_path_companion"`, `name="Signal Path"`, `apptype=FlipperAppType.EXTERNAL`, `entry_point="signal_path_app"`, `stack_size=2048`, `fap_category="Tools"`, `fap_version=(1, 0)`, `fap_description="A minimal on-screen companion for the Signal Path learning lab"`. No `fap_icon`, `fap_author`, or `sources` (defaults to `*.c`).
- `lab_companion.c` (45 lines, C, uses `furi.h`, `gui/gui.h`, `input/input.h`): draw callback `signal_path_draw` (clears canvas; "Signal Path" in FontPrimary at 4,20; "Predict. Test. Explain." and "Press Back to exit" in FontSecondary); input callback `signal_path_input` pushes `InputEvent` into an 8-slot `FuriMessageQueue` with 0 timeout (does not block the input service); entry `int32_t signal_path_app(void*)` allocates queue, ViewPort and GUI record, adds a fullscreen view port, blocks on the queue until `InputKeyBack` + `InputTypeShort`, then disables/removes/frees view port, frees queue, closes `RECORD_GUI`. Compiles against firmware-API headers; API compatibility depends on SDK release (the module warns about Momentum vs official).
- **Licence: none declared** in the example, `legacy/`, or repo root (README has no licence section, only a 3D-model licence note). Needs a decision (e.g. MIT for code; course text proprietary) before selling. The Flipper SDK headers themselves are GPLv3 (firmware), which affects distributed binaries; do not ship a built `.fap` without a licence review.
- Build (from `modules/15-app-development.html`, run from the repo root):
  ```
  python3 -m venv .venv
  source .venv/bin/activate
  python -m pip install ufbt
  cd examples/lab-companion
  ufbt
  # Flipper connected, qFlipper closed:
  ufbt launch
  ```
  Windows: `py -m venv .venv`, `.venv\Scripts\Activate.ps1`. Learners are told to record `python -m pip show ufbt`, the SDK release printed during the build and device firmware. `.gitignore` already excludes `examples/**/dist/`, `.vscode/`, `.ufbt/`, `.venv/`.
- Page contract: module 15 links `../examples/lab-companion/lab_companion.c` and `.../application.fam`. After the move the path `examples/lab-companion` is repeated in prose commands (`cd examples/lab-companion`) and must be kept in sync with wherever v2 publishes the example (build-site.py ships only those two files).

## 8. Port checklist (what v2 must preserve or consciously change)
1. Keep module ids `m00`-`m18`, badge ids, quiz ids, and glossary slugs stable (progress in `signalpath.v2` keys off them) or ship a migration.
2. Convert the three globals to typed content (Zod/Astro content collections): module, badge, stage, question (add stable id), glossary entry; keep the invariants in section 2.2 as build-time checks, plus: glossary sorted + tag vocabulary closed, `n` consecutive, every module has `quiz >= 3`, answer-index spread, no duplicate options, every badge awarded somewhere, all stage modules covered once.
3. Keep equivalents of the check-site checks (single h1, unique ids, internal links/fragments resolve) in the Astro build or CI (e.g. `astro check` + a link checker), and a JS syntax check becomes `tsc`/ESLint.
4. Replace `pages.yml` (stale paths, subpath base) and the sitemap/robots with generated ones (`@astrojs/sitemap`), adding `lastmod`, canonical URLs and a redirect map from legacy `*.html` URLs.
5. Preserve `404.html` behaviour (theme pre-paint, ascii Flipper art, three CTAs) in the Astro 404 page.
6. Decide licence for example code and downloads; the stage "evidence" strings are the course checkpoints and should map to deliverables/certificate logic if the paid tier is built (stages are navigation only, not gating, in legacy).
