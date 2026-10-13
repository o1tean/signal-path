# Legacy core JS map: site.js, learning.js, course.js

Sources (read-only): `legacy/assets/js/site.js` (435 lines), `legacy/assets/js/learning.js` (342 lines), `legacy/assets/js/data/course.js` (100 lines). Related readers: `legacy/assets/js/presentation.js`, `legacy/assets/js/widgets/*.js`, `legacy/quiz.html` (inline script).

## 1. Load order and page contract

Script order (index.html): `data/course.js` -> `site.js` -> `learning.js` -> `presentation.js`. Pages that need quizzes add `data/quiz-bank.js` after site.js (read lazily at `boot()`, which runs on DOMContentLoaded). Module pages load course.js, site.js, quiz-bank.js, widgets, presentation.js (no learning.js). `quiz.html` loads course, site, quiz-bank, an inline script, presentation (no learning.js). `learning.js` does `if (!window.SP) return` and is only needed on pages with resume links, stage hosts or the notebook (index, roadmap, notebook).

Inline head script on each page (pre-paint, duplicated from site.js): reads `localStorage["signalpath.theme"]`, sets `<html data-theme>` if `light|dark`. A port must keep a no-flash equivalent.

Body attributes (required):
- `data-root`: relative prefix to site root ("" at root, "../" in `modules/`). Used by `SP.root` for every generated href and the favicon.
- `data-page`: `home`, `primer`, `quiz`, ... or a module id `m00`..`m18`. Nav logic uses `SP.page.indexOf("m") === 0`, so any page id starting with "m" is treated as a module page there; `buildModuleChrome` matches exact module ids.

Boot (`boot()`, on DOMContentLoaded or immediately if already loaded), in order:
1. Inject `<link rel=icon type=image/svg+xml href=root+assets/favicon.svg>` if no `link[rel=icon]`.
2. Find `main` or `body > .wrap`; give id `main-content` if none; if not a `<main>` set `role=main`; set `tabindex=-1`; prepend `<a class="skip-link" href="#id">Skip to content</a>` to body.
3. `buildNav()`; 4. `buildModuleChrome()`; 5. `tocSpy()`; 6. `mountQuizzes()`; 7. `mountWidgets()`; 8. `renderProgressUI()`.
9. Bind `[data-reset-progress]` click -> `confirm("Reset completion marks, quiz scores and badges? Your atlas and notebook will be kept.")` -> `SP.resetAll()` + toast "Progress reset".
10. Bind `[data-theme-toggle]` click -> `SP.toggleTheme`.

## 2. Global namespace `window.SP` (site.js)

Data (from `window.SP_COURSE`, set by course.js; site.js throws if missing):
- `SP.MODULES` = `SP_COURSE.modules`; `SP.BADGES` = `SP_COURSE.badges`.
- `SP.root`, `SP.page` (body attrs above), `SP.reducedMotion` (initial `prefers-reduced-motion: reduce`; presentation.js overwrites it with `reduced.matches` on every sync).
- `SP.state`: live reference to the persisted object (section 3). `resetAll` reassigns it; learning.js and widgets always read `SP.state.*` fresh.

Functions:
- `SP.cssVar(name, el?)`: trimmed computed CSS custom property (default on `documentElement`).
- `SP.el(tag, attrs?, children?)`: element builder. attrs: `class`, `html` (innerHTML), `text` (textContent), `on<event>` function -> addEventListener, otherwise setAttribute. children: strings become text nodes; falsy skipped.
- `SP.save()`: writes `state` to localStorage, dispatches `document` CustomEvent `sp:state`, returns boolean stored. On failure toasts "Browser storage is unavailable or full. Export a backup before leaving." (event still fires).
- `SP.resetAll()`: state = `{done:{}, quiz:{}, badges:{}, atlas:<kept>, notes:<kept>}`; reassigns `SP.state`; saves; dispatches `sp:state`. Side effect: drops `flashIndex` and `tuneIn`.
- `SP.effectiveTheme()`: `data-theme` attr if set else OS `prefers-color-scheme`.
- `SP.toggleTheme()`: apply opposite of effective theme, persist to `signalpath.theme`.
- `SP.isDone(id)`, `SP.doneCount()` (modules in `SP.MODULES` with truthy `state.done[id]`).
- `SP.markDone(id, done)`: section 6.
- `SP.award(badgeId, quiet?)`: returns false if already earned; else sets `state.badges[id]=true`, `SP.save()`, and (unless `quiet`, and if the badge exists) toast "Badge earned: <ic> <name>" + confetti. Returns true.
- `SP.quiz(host, questions, opts)`: section 5.
- `SP.registerWidget(name, fn)`: store and re-run `mountWidgets()` (so late-loaded widget scripts still mount).
- `SP.widgetShell(host, title, sub?)`: adds class `widget`, builds `.widget-head` (`.widget-title` with `.dot` + title, optional `.widget-sub`, `.spacer`) and `.widget-body`; returns `{head, body, foot(html)}`; `foot` appends `.widget-foot` (innerHTML).
- `SP.fitCanvas(canvas, draw?)`: hi-DPI canvas; sets `canvas.width/height = css size * dpr`, `setTransform(dpr)`, calls `draw(ctx, w, h)`; ResizeObserver (fallback window resize); default size 600 x (height attr or 200); returns `{ctx, redraw}`.
- `SP.toast(msg)`: single lazily-created `div.toast[role=status][aria-live=polite]` on body; class `show` for 2600 ms.
- `SP.confetti()`: no-op if `SP.reducedMotion`; lazily creates `canvas#sp-confetti` on body; 90 particles in colors `--orange --cyan --yellow --green`, ~2.4 s, alpha fade 2.2 s.

DOM events on `document`: `sp:state` (no detail) after every save/reset; `sp:theme` (`detail.theme` = effective theme) on every `applyTheme`.

Internals (not exported): `load/save`, `applyTheme`, `renderProgressUI`, `buildNav`, `buildModuleChrome`, `tocSpy`, `mountQuizzes`, `mountWidgets`.

## 3. localStorage keys and schemas

| Key | Owner | Value |
|---|---|---|
| `signalpath.v2` | site.js `KEY` | JSON object, the whole app state (below) |
| `signalpath.theme` | site.js | `"light"` or `"dark"`; absent = follow OS (never written as "system") |
| `signalpath.motion` | presentation.js | `"paused"` or `"playing"`; paused adds `motion-off` class on `<html>` |

Completion, quiz best scores, badges, atlas and notes all live inside `signalpath.v2`. No backups are stored in localStorage; a backup is a downloaded JSON file.

`signalpath.v2` shape (normalised on load: non-object/array/parse error -> `{}`; then `done, quiz, badges, notes` forced to plain objects and `atlas` forced to an array of objects):
```
{
  done:   { "<moduleId>": boolean },
  quiz:   { "<quizId>": { score:int, total:int } },   // best score; quizId = module id | "primer" | "mixed"
  badges: { "<badgeId>": true },
  atlas:  [ { name, category, frequency, modulation, protocol, codeType, notes: string, sample?: true } ],
  notes:  { "<moduleId>": { setup, prediction, observation, explanation: string,
                            review: "YYYY-MM-DD" | "", retrieved: "YYYY-MM-DD" | "", updated: ISO-8601 } },
  // unvalidated extras written by widgets (NOT imported from backup, wiped by resetAll):
  flashIndex?: number,       // flashcards.js
  tuneIn?: { best: number }  // tune-in.js
}
```
`notes` entries are written by learning.js `saveEntry`; `review` comes from `#note-review` (date input) along with the four text fields, all `.trim()`ed.

## 4. Backup / restore format (learning.js, notebook page only)

Export (`#export-backup` click): if `dirty`, first `saveEntry(false)`. Payload:
```
{ "format": "signal-path-backup", "version": 1, "exportedAt": "<ISO>", "state": SP.state }
```
`JSON.stringify(payload, null, 2)`; Blob `application/json`; filename `signal-path-<YYYY-MM-DD local>.json` via temporary `<a download>` appended, clicked, removed; object URL revoked after 1000 ms; `#backup-status` = "Backup download requested. Keep the file private." The export writes `SP.state` raw, so it also contains `flashIndex`/`tuneIn` when present; import ignores them.

Import (`#import-backup` `change`, `accept="application/json,.json"`):
- file > 1 MB (1024*1024): "Backup is larger than 1 MB. Your data was not changed."
- `JSON.parse` failure: "Invalid JSON. Your data was not changed."
- validation failure: "This file is not a valid Signal Path backup. Your data was not changed."
- then `confirm("Replace this browser’s progress, atlas and notebook with this backup? Download a backup first if needed.")`; cancel -> "Restore cancelled. Your data was not changed."
- success: writes only `done, quiz, badges, atlas, notes` into the existing `SP.state` object in place (leaves `flashIndex/tuneIn`), `SP.save()`, `showEntry()`, `renderReviews()`, status "Backup restored." or "Restored in this tab only. Browser storage failed; retain your backup."; `finally` clears the input value. Wholesale replace, no merge.

`validateBackup` rules (strict; unknown keys dropped; any violation throws):
- payload is an object, `format === "signal-path-backup"`, `version === 1` (strict; a v2 format must still accept v1), `state` is an object.
- `state.done/quiz/badges/notes` objects; `state.atlas` array, length <= 500.
- `done`: only ids in `SP.MODULES`; value must be boolean.
- `notes`: only module ids; object; `setup, prediction, observation, explanation` strings <= 6000; `review` and `retrieved` must be "" or `YYYY-MM-DD` that `Date.parse`s (so both keys are REQUIRED; undefined fails); `updated` string <= 40 chars and parseable.
- `quiz`: only ids = module ids + `"primer"` + `"mixed"`; `score`,`total` integers, `1 <= total <= 1000`, `0 <= score <= total`.
- `badges`: only ids in `SP.BADGES`; value boolean.
- `atlas` rows: objects; `name, category, frequency, modulation, protocol, codeType, notes` required strings <= 10000; `sample: true` kept only if exactly `true`.

## 5. Quiz contract

DOM: element with `data-quiz="<id>"` (e.g. `<div data-quiz="m03"></div>`, `primer`). Optional: `data-limit="<int>"` (truncate after optional shuffle; 0/NaN = all), `data-shuffle` (presence = shuffle). `mountQuizzes()` looks up `window.SP_QUIZ_BANK[id]`; missing/empty -> `<p class='faint'>Quiz coming soon.</p>`. Legacy pages: every module page m00-m18 and primer.html has one `data-quiz` host (no limit/shuffle attrs).

Question shape: `{ q: string, opts: string[], a: number (index of correct option), why: string }`. Bank keys in `quiz-bank.js`: `primer, m00..m18`.

`SP.quiz(host, questions, {id?, shuffle?, limit?})`: id = `opts.id` -> `data-quiz` -> `"quiz"`. Copies array; Fisher-Yates shuffle if `shuffle`; `slice(0, limit)`; adds class `quiz`; clears host.

Markup (CSS contract):
- per question `div.q` > `div.q-num` ("Question i of n") + `div.q-text#spq-<id>-<i>` + `div.opts[role=group][aria-labelledby=spq-<id>-<i>]` of `button.opt[type=button]` (`span.letter` A,B,C... + `span` text) + `div.explain[role=status][aria-live=polite]` (inline `display:none` until answered).
- On click: all options disabled; clicked gets `.correct` or `.wrong`; if wrong the right one also gets `.correct`; explain = ("Correct. " | "Not quite. ") + `why`; className `explain ok` | `explain bad`; shown. One attempt per question.
- Footer `div.quiz-foot`: `span` "Score: <b>c</b> / n" (innerHTML), `span.faint` "Best: s / t" (empty if none), `button.btn.small` "Retry" (re-runs `SP.quiz` with the original `questions` and opts, so reshuffles).

Scoring/best-score (`finish()` when `answered === qs.length`): set `state.quiz[id] = {score: correct, total: qs.length}` if no previous, OR new ratio > previous ratio, OR ratios equal and `qs.length >= previous.total`. Then `SP.save()`, update Best label. If `correct === qs.length`: `SP.award("perfect-quiz")` (non-quiet toast + confetti) AND toast "Perfect score on this quiz!" + confetti (second toast overwrites the first). Else toast "Quiz done: c / n". Quiz completion never marks a module done. Module cards show "quiz s/t" in `.mc-status` when not done.

`quiz.html` inline script (not in site.js; port separately): `<select id=quizScope>` options = modules with bank entries + "Primer" + `all`; `#quizCount` limit; `#quizStart`; `#quizHost`; `#scoreRows` table of per-module best scores with `pill green|grey` ("complete"/"in progress"); listens to `sp:state`; auto-starts on load; scrolls host into view (instant if reduced motion). `all` concatenates every bank array and runs with `id: "mixed"`, `shuffle: true`, `limit: n`; a single scope runs with `id: <scope>` (shares the best-score slot with the page-level quiz).

## 6. Progress, completion and badge rules

`SP.markDone(id, done)`: sets `state.done[id] = !!done`. On false->true:
1. If module has `badge`: `SP.award(mod.badge, true)` (quiet).
2. If `doneCount() === MODULES.length`: `SP.award("all-clear", true)` (quiet).
3. Toast "Module <n> complete — <title>"; confetti.
Then `SP.save()` always. Un-marking does NOT remove badges; the All Clear badge displays earned only while `doneCount() === total`. `markDone` is only called from the module-page complete box.

All badge triggers (24 badges in `SP_COURSE.badges`):
- 19 module badges: earned when that module is marked complete. Module -> badge id: m00 signal-seeker, m01 frequency-finder, m02 modulation-master, m03 protocol-reader, m04 clean-transmitter, m05 code-breaker, m06 tag-whisperer, m07 nfc-explorer, m08 momentum-pilot, m09 field-medic, m10 atlas-builder, m11 infrared, m12 gpio, m13 usb-bluetooth, m14 contact-and-authentication, m15 app-development, m16 security-lab, m17 mastery, m18 wifi-devboard.
- `all-clear`: every module complete (above).
- `perfect-quiz`: any quiz finished at 100% (`SP.quiz.finish`).
- `tuned-in`: tune-in.js (~line 218) `if (streak === 5) SP.award("tuned-in")`, non-quiet. Also stores `SP.state.tuneIn.best` when a streak beats it.
- `wave-rider`: wave-lab.js `maybeAward()`: once per widget instance when `state.bits.length >= 1 && state.bits !== DEFAULT_BITS`, then `SP.award("wave-rider")`.
- `out-of-sync`: rolling-sim.js `firstFail()`: first replay failure in that widget instance, `SP.award("out-of-sync")`.
`award` is idempotent via `state.badges`.

`renderProgressUI()` (idempotent; boot and every `sp:state`), DOM hooks:
- `[data-progress-text]`: `"<n> / <total>"` (static HTML hardcodes "0 / 19").
- `[data-progress-bar]`: `style.width = n/total*100 + "%"`.
- `[data-badges]`: cleared and rebuilt; each badge `span.badge[.earned][title]` > `span.b-ic` (icon) + `span` (name). Earned = `state.badges[id]` (plus all-modules-done for `all-clear`). title = "Earned — <how>" or `how`.
- `[data-mod-card="<id>"]`: toggle class `done`; `.mc-status` text = "✓ complete" if done, else "quiz s/t" if best exists, else "".
- `[data-complete-module="<id>"]`: toggle `done`; its `button` text "Mark incomplete" / "Mark module complete", className `btn` / `btn primary`; `.txt` innerHTML = done ? `<b>Done.</b> Nice work — on to the next one.` : `<b>Can you explain and repeat the result?</b> Record your evidence in the notebook. Completion is self-reported.`

## 7. Resume link and stage rendering (learning.js)

Resume (`renderResume`, on load + `sp:state`): `next` = first module in `SP.MODULES` array order with `!SP.isDone(id)`. For each `[data-resume]` anchor: `href = SP.root + (next ? next.href : "notebook.html#review")`; text = `"<n> · <title> →"` or `"All modules marked complete. Review your evidence →"`. Present on index.html and roadmap.html with static fallback href `modules/00-setup.html`.

Stages: for each `[data-course-stages]` host (roadmap.html `div.route-grid`), for each `SP_COURSE.stages` entry append `div.card#<stage.id>` containing `p.eyebrow` (label), `h3` (title), `p` (description), `ol.route-links` of `li > a[href=root+module.href]` "<n> · <title>", and `p > b "Checkpoint: "` + `stage.evidence`. Stage ids (anchor targets): `starter, signals, atlas, build, research, wifi`. Stages are navigation only (course.js comment), no gating. Stage cards show no per-module completion state.

## 8. Topbar / nav (site.js `buildNav`)

Target: `.topbar` element; its innerHTML is replaced with one `div.topbar-inner` containing, in order:
1. `a.brand[href=root+index.html]` > `span.dot` + "Signal Path" (presentation.js swaps `.dot` for `img.brand-logo`, `assets/images/signal-path-logo.png`, 29x32, alt "").
2. `span.nav-progress` > `span[data-progress-text]` + `span.mini-bar > i[data-progress-bar]`.
3. `nav.topnav#site-nav[aria-label=Site]` links (href = root + path): `index.html#course` Course; `roadmap.html` Learning path; `notebook.html` Notebook; `playground.html` Playground; `quiz.html` Quiz; `reference.html` Reference; `sources.html` Sources; `legal.html` Legal. `aria-current="page"` when link file (before `#`) equals current filename (empty -> `index.html`); the Course link is additionally marked on any page whose `data-page` starts with "m" (and not double-marked on index in that case). Primer, glossary, case-studies, downloads have no nav entry.
4. `button.icon-btn.nav-toggle[type=button][aria-label=Menu][aria-expanded][aria-controls=site-nav]` text "☰": toggles class `open` on the nav and syncs `aria-expanded`. Escape inside `.topbar` closes the open nav and refocuses the toggle. No outside-click or link-click close.
5. `button.theme-btn[aria-label="Toggle color theme"]` "◐ theme" (presentation.js shortens to "◐" with a title) calling `SP.toggleTheme`.
presentation.js then appends `button.motion-btn` (aria-pressed; labels "Animations paused by system preference" / "Resume decorative animations" / "Pause decorative animations"; glyph Ⅱ or ▷; disabled under OS reduced-motion) to `.topbar-inner`, toggles `<html class="motion-off">`, and `motion-suspended` while the document is hidden.

Theme: `applyTheme(t)`: `light|dark` sets `<html data-theme>`, anything else removes it (system). Initial `applyTheme(readTheme())`; a `prefers-color-scheme` change listener re-applies only when no stored preference. `sp:theme` fires each time (widgets/canvases recolor from it).

## 9. Module-page chrome (`buildModuleChrome`)

Active only when `SP.page` equals a module id and a `.content` element exists. Appends to `.content`, in order:
1. `<p><a href=root+notebook.html?module=<id>>Record this module in your learning notebook →</a></p>`.
2. `div.mod-complete[data-complete-module=<id>]` > `div.txt` + `button.btn.primary[type=button]`; click -> `SP.markDone(id, !SP.isDone(id))`.
3. `div.pager`: `a.prev` (`.pg-k` "← Module <n>", `.pg-t` title; for m00: "← Before you start" / "The primer" -> `primer.html`) and `a.next` (`.pg-k` "Module <n> →"; for m18: "Keep playing →" / "The playground" -> `playground.html`). Order follows `SP.MODULES`.
4. If `.toc` exists and a next module exists: `.toc` gets `div.toc-next` > `span.eyebrow` "Up next" + `a` "<n> · <title>".
Module pages must provide `.content`, optional `.toc`, and headings with ids.

`tocSpy`: `.toc a[href^='#']`; targets by id; `IntersectionObserver` rootMargin `-20% 0px -70% 0px`; keeps last-intersected id and toggles class `active` on the matching link. No-op without IO.

## 10. Widget registry contract

`mountWidgets()` iterates `[data-widget]`; skips hosts with `data-mounted`; looks up the registered fn by name; parses `data-opts` JSON (silent `{}` on error); sets `data-mounted="1"`; calls `fn(host, opts)` in try/catch; on error renders `div.callout.warn > span.ic "!" + div > span.callout-title "This interactive couldn't load." + message` and `console.error("widget <name>", e)`. Widgets in use (host tags in legacy HTML): `flashcards, flipper-sim, pulse-decoder, rf-calc, rolling-sim, signal-atlas, spectrum-scope, tool-picker, tune-in, wave-lab`. Each widget file calls `SP.registerWidget(name, fn)`. Widgets that touch state: flashcards (`state.flashIndex`), signal-atlas (`state.atlas` push/splice/edit, sample rows flagged `sample:true`, dedupes samples by name), tune-in (`state.tuneIn.best`).

## 11. Notebook (learning.js; runs only if `#notebook-form` exists)

DOM contract (notebook.html): `form#notebook-form`; `select#note-module`; `a#note-lesson`; `textarea#note-setup` ("Equipment, firmware, scope and recovery"), `#note-prediction` ("My prediction and why"), `#note-observation` ("What I observed (including failures)"), `#note-explanation` ("My explanation, limits, and next experiment"), each `rows 3-4`, `maxlength=6000`; `input#note-review[type=date]` ("Review date"; helper text: choose tomorrow for the first retrieval check, then move the date after reviewing; blank = no scheduled review); `button[type=submit]` "Save entry"; `button#note-retrieved[type=button]` "I explained it without notes"; `p#note-status[role=status][aria-live=polite]`; `section#review > div#review-queue.card`; `section#backup` with `#export-backup`, `#import-backup`, `#backup-status`. `<noscript>` fallback links `downloads/lab-notebook.md`.

Behaviour:
- Select options: all modules, value `m.id`, text "<n> · <title>" (primer has no notebook entry). Preselect from `?module=<id>` if valid; `notebook.html#review` anchors the queue.
- `showEntry()`: loads `SP.state.notes[id]` into 5 controls (non-strings -> ""); sets `#note-lesson` href to `mod.href` (root-relative, only valid since notebook.html is at site root); status "Last saved: <toLocaleString(updated)>" + (". Explained without notes: <retrieved>" if set) or "No saved entry for this module yet."; `dirty=false`.
- `saveEntry(retrieved)`: trimmed setup/prediction/observation/explanation/review; `updated = new Date().toISOString()`; `retrieved = today()` (local `YYYY-MM-DD`) if triggered by the retrieval button else previous value or ""; store; `SP.save()`; `dirty = !stored`; status "Entry saved. " / "Retrieval recorded. " + "Export a backup to keep a separate copy." or "Kept in this tab, but browser storage failed. Download a backup before leaving."; re-render queue.
- `dirty` set on any form `input` except from the select; module change while dirty -> `confirm("Discard unsaved edits and switch modules?")` (cancel reverts); `beforeunload` guard while dirty.
- Review queue: modules with a note, sorted ascending by `review` string ("" sorted last via "9999" sentinel); each `li` = link `notebook.html?module=<id>` (hardcoded, ignores `SP.root`) + " — " + ("Review due: " if `review <= today()` else "Review: ") + date, or "No review date". Empty: "No saved entries yet. Start with one prediction." Spaced retrieval is manual (no scheduler).

## 12. How course.js is consumed

`window.SP_COURSE = { modules[], badges[], stages[] }`.
- `modules[]`: `{ id "m00".."m18", n int, week (display string: "Week 0".."Week 10", "Week 11–12", "Hardware extension"), title, href (site-root-relative `modules/NN-slug.html`), badge (badge id) }`. 19 modules; array order drives progress, resume, pager, notebook select, quiz.html table.
- `badges[]`: `{ id, ic (glyph), name, how }`; 24 entries (19 module + tuned-in, wave-rider, out-of-sync, perfect-quiz, all-clear). `how` is the tooltip. Array order = render order. Name/id mismatches to preserve: `code-breaker` = "Rolling-Code Realist"; `momentum-pilot` = "Firmware Pilot"; `wifi-devboard` = "Wi-Fi Explorer".
- `stages[]`: `{ id, label, title, modules[ids], description, evidence }`; 6 stages: starter [m00,m01], signals [m02-m05], atlas [m06-m10], build [m11-m15], research [m16,m17], wifi [m18] (optional extension, "After Modules 8, 12 & 15", 3-4 extra sessions).
- Consumers: site.js (`MODULES`, `BADGES`), learning.js (`SP_COURSE.stages`, `SP.MODULES`), quiz.html (`SP.MODULES`). index.html duplicates module data as static `.mod-card` markup (`a.mod-card[data-mod-card=mNN]`, with `.mc-status`) and hardcodes "0 / 19"; quiz-bank keys mirror module ids.

## 13. Port checklist and gotchas

Must preserve: storage key `signalpath.v2` and its schema (existing learners keep progress), `signalpath.theme`, `signalpath.motion`; backup `format`/`version: 1` import compatibility and the validator limits; best-score tie rule; badge triggers and idempotency/quiet flags; All Clear display rule; resume = first incomplete in array order; module/stage/badge ids; notebook fields and 6000 limit; `?module=` deep link; `sp:state`/`sp:theme` semantics (map to a store subscription); storage try/catch resilience (private mode, quota).

Quirks to decide on rather than copy blindly:
1. `resetAll` wipes `flashIndex` and `tuneIn.best` (also not in backups).
2. Perfect quiz fires the award toast and a second "Perfect score" toast/confetti.
3. Un-completing a module keeps its badge; only `all-clear` is hidden.
4. `wave-rider` check uses reference inequality against `DEFAULT_BITS` (fragile).
5. Import ignores `exportedAt`, requires `version === 1`, and requires `review`/`retrieved` keys on every note.
6. Nav active-state matches any `data-page` beginning with "m".
7. Review-queue links and `#note-lesson` ignore `SP.root` (fine only at site root).
8. quiz.html and module pages do not load learning.js; only module ids, `primer` and `mixed` are valid quiz keys on import.
9. Static HTML hardcodes module cards and "0 / 19"; generate from the catalog in the port.
