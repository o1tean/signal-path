# Legacy widget map B: signal-atlas, spectrum-scope, tool-picker, tune-in, wave-lab

Source: `legacy/assets/js/widgets/*.js` (read in full, unmodified). Runtime: `legacy/assets/js/site.js`. CSS: `legacy/assets/css/site.css` (base) + `presentation.css` (overrides). Port target: Astro + React.

## 0. Shared runtime contract (applies to all five)

### Mount
- Markup: `<div data-widget="NAME"></div>` plus optional `data-opts='{"mode":"compact"}'` (JSON, parsed in `mountWidgets`, `site.js` ~L321; parse failure silently gives `{}`). No page in legacy passes `data-opts` to these five; the only option any of them read is `opts.mode === "compact"` (shorter canvas, omits intro callout/paragraph).
- `SP.registerWidget(name, fn(host, opts))` stores fn and calls `mountWidgets()`. Each script is a plain IIFE `<script>` loaded after site.js; mounting is idempotent via `data-mounted="1"`. A thrown error is caught and replaced with `.callout.warn` "This interactive couldn't load." Port: React error boundary with the same message.
- `SP.widgetShell(host, title, sub)` adds `.widget` to host, empties it, builds `.widget-head` (`.widget-title` with `.dot`, `.widget-sub`, `.spacer`), `.widget-body`, and `ui.foot(html)` appends `.widget-foot` (HTML string, set via innerHTML; all foot strings are static).
- Pages (data-widget occurrences): `playground.html` (all five, sections `#spectrum-scope #tune-in #wave-lab #tool-picker #signal-atlas`), `modules/01-frequency.html` (spectrum-scope L57, tune-in L134), `modules/02-modulation.html` (wave-lab L154), `modules/05-raw-and-rolling.html` (tool-picker L164, in `#toolkit`), `modules/09-troubleshooting.html` (tool-picker L157), `modules/10-capstone.html` (signal-atlas L108, in `#atlas`). Each page lists its own `<script src=".../widgets/X.js">`.
- Two signal-atlas instances on one page would share `SP.state.atlas` but not re-render each other (no `sp:state` listener). Not currently used (capstone has one; playground is a separate page).

### SP globals consumed (all five)
| Global | Defined | Used by |
|---|---|---|
| `SP.registerWidget`, `SP.widgetShell`, `SP.el(tag, attrs, children)` (attrs: `class`, `html`, `text`, `onX` fn, else setAttribute; children strings become text nodes) | site.js | all |
| `SP.fitCanvas(canvas, draw)` -> `{ctx, redraw}`; DPR scaling, ResizeObserver (fallback window resize) calling `draw(ctx,w,h)`; observer is never disconnected | site.js ~L350 | spectrum-scope, tune-in, wave-lab |
| `SP.cssVar(name)` (computed style on `<html>`) | site.js | the three canvases; tune-in buttons |
| `SP.reducedMotion` (bool; set at load from media query and kept in sync by presentation.js `syncMotion`, which sets it to `reduced.matches` only, NOT the manual motion-pause toggle) | site.js / presentation.js L35 | spectrum-scope only |
| `SP.toast(msg)` | site.js | atlas (guarded `SP.toast &&`), tool-picker, tune-in (unguarded) |
| `SP.award(id)` (adds to `SP.state.badges`, saves, toast + confetti) | site.js | tune-in `"tuned-in"`, wave-lab `"wave-rider"`. Badge defs in `legacy/assets/js/data/course.js` L44-45: `tuned-in` (icon ◉, "Score 5 in the Tune In game"), `wave-rider` (icon ≈, "Encode a message in the Wave Lab") |
| `SP.state`, `SP.save()` (writes localStorage key `signalpath.v2`, dispatches `sp:state`) | site.js | atlas (`atlas`), tune-in (`tuneIn`) |
| `document` event `sp:theme` (dispatched on theme change, `detail.theme`) | site.js L62 | the three canvases re-render |

Not used by any of the five: `SP.pixel` / presentation.js pixel font, `SP.MODULES`, `SP.isDone`, quiz engine, glossary, `SP_COURSE` data directly (badges only indirectly via `SP.award`). Confirmed by grep: no references to `pixel`.

### Persistence (localStorage)
- `signalpath.v2` JSON object: `{done, quiz, badges, notes, atlas[], tuneIn?}`. `site.js` load normalizes only `done/quiz/badges/notes` to objects and `atlas` to an array of objects. `tuneIn` is lazily created by tune-in.
- `signalpath.theme` (theme), `signalpath.motion` (presentation.js manual pause): not touched by these widgets.
- Backup/restore (`learning.js` ~L218-330, `version: 1` payload): whitelist is `done, quiz, badges, atlas, notes`. **`tuneIn` is NOT exported/imported** (best streak is lost on restore, and `resetAll()` in site.js rebuilds state as `{done,quiz,badges,atlas,notes}` which also drops `tuneIn`). Atlas rows are validated: max 500 rows, each of the 7 string fields required (`string(x, 10000)`), `sample:true` kept, everything else dropped. Port decision needed: keep `tuneIn.best` in a v2 store and add it to the backup schema.
- `resetAll()` keeps `atlas` and `notes`, clears done/quiz/badges (and tuneIn by omission).

### Design tokens relied on (site.css :root, dark-mode variants exist)
`--scope-bg #0B1220`, `--scope-grid #1B2A44`, `--scope-trace #3FD8D2`, `--scope-peak #FF8A34`, `--scope-text #9BB3D1` (site.css L37-41; "instrument screens stay dark in both themes"; the JS has the same hexes as fallbacks). Also `--green --green-soft --red --red-soft` (tune-in buttons), `--line-strong --surface --text --muted --faint --font-mono --orange --cyan` and pill color tokens. Port: keep the five `--scope-*` tokens and expose them to canvas drawing code (read once per draw via getComputedStyle, re-draw on theme change).

### Shared CSS classes (site.css unless noted)
`.widget .widget-head .widget-title .dot .widget-sub .spacer .widget-body .widget-foot` (L378-392); `.widget-controls` flex row (L393) with descendant rules for `label`, `input[type=range]` (accent orange, width 150px), `select`, `input[type=text|number]` (L394-399); `.widget .readout` mono 13px muted, `.widget .readout b` orange (L400-401); `.seg` segmented control with `button[aria-pressed="true"]` styling (L402-408); `.scope` canvas style: block, width 100%, bg `--scope-bg`, radius 8, 1px `--scope-grid` border (L409); `.btn`, `.btn.primary|ghost|small`, `.btn-row` flex wrap gap 10 (L211-218); `.callout` + `.note|tip|warn|legal` variants with `.ic` badge and `.callout-title` (L298-315; presentation.css L294 overrides radius 18 / no shadow); `.pill` + color variants (L186-193); `.table-scroll` (L161; presentation.css L259 radius 18, no shadow) with `.table-scroll table{min-width:520px}`; `details > .d-body` (L370); `.faint`, `.mono` utilities (L145, L179); `.toast` (L468). presentation.css `.motion-off *` kills animation/transition globally (L960-); it does not stop the spectrum-scope rAF loop (JS-driven).

## 1. spectrum-scope

File: `legacy/assets/js/widgets/spectrum-scope.js` (276 lines). Title "Spectrum scope", sub "watch the band, press a remote". Mounted at module 01 and playground.

**Mount contract**: `data-widget="spectrum-scope"`; option `mode:"compact"` -> canvas CSS height 170px instead of 240px (set inline `style="height:..px; margin-top:12px"`).

**Static data**
- `BANDS` (MHz): `low 300-348 ("300–348")`, `mid 387-464 ("387–464")`, `high 779-928 ("779–928")`, `full 300-928 ("Full 300–928")`. Order `["low","mid","high","full"]`. Note labels use en dash, and the Flipper CC1101 bands are 300-348 / 387-464 / 779-928.
- `REMOTES`: `{433.92,"Garage",band mid}`, `{315.00,"Fob",low}`, `{868.00,"Sensor",high}`.
- Constants: noise buffer `NOISE_N=200`, noise regenerated every 70 ms, signal lifetime 1500 ms (hold 1100 ms then linear fade over 400 ms: `env=(1500-elapsed)/400` after 1100), RSSI model `round(-38 - dist/100*57)` dBm (-38 near ... -95 far), peak height fraction `0.9 - dist/100*0.72`, noise floor text "approx -100 dBm", gaussian `sigma=max(plotW*0.011,5)` px drawn over +-4 sigma.

**State** `{band:"mid", distance:20 (0 near..100 far), signal:null | {freq,name,born}}`; plus `noise[]`, `clearTimer`, `raf`, `lastNoise`.

**Inputs**: `<select aria-label="Frequency band">` (inside `<label>Band`), `<input type=range 0-100 aria-label="Distance to transmitter">` with `.readout` showing `<b>NN%</b>`, three `.btn.small` buttons (text e.g. "433.92 Garage"; `title="Transmit a burst at X MHz"`) inside `.btn-row` preceded by `<span.readout>Remotes:`.

**Behavior**
- `fire(remote)`: if the remote's freq is outside the selected band, `setBand(remote.band)` (so e.g. 868 on "mid" hops to "high"; "full" contains all three so no hop). Sets `signal` with `born=now()`, renders immediately.
- `setBand` updates select and, if reduced motion, re-renders (otherwise the loop does).
- Distance input: updates readout; re-renders only if reduced motion.
- Render: clears, fills bg, 5 horizontal grid lines, 6 vertical ticks (5 intervals) with integer MHz labels (`toFixed(0)`), "MHz" label top right, noise polyline (alpha .85, baseline at 7% from bottom, amplitude 12% of plotH), then if `signal` is within band: gaussian peak (orange, 2px) with two labels above ("433.92 MHz" and "-NN dBm · Name", clamped inside plot). Pads: L8 R8 T12, axis 22.
- Readout `div.readout[aria-live=polite]`: with signal "Receiving **f MHz** (Name) · RSSI **x dBm** — strong, close by (<40) / usable (<75) / weak, far away"; else "Noise floor only (≈ **-100 dBm**). Press a remote to transmit a burst."
- Canvas: `class="scope" role="img" aria-label="Simulated spectrum analyzer display"`.

**Animation lifecycle**
- If `!SP.reducedMotion` at mount: `requestAnimationFrame(loop)` runs forever (every frame: expires signal after 1500 ms, regenerates noise each 70 ms, renders). **No cleanup**: never cancelled, `raf` handle is stored but unused; keeps running when widget is off-screen/tab hidden (browser throttles rAF when hidden only). Port: IntersectionObserver gating + cancel on unmount.
- If reduced motion: no loop; one static render; `fire` sets a 1500 ms `setTimeout` to clear signal and re-render (clears prior timer). Peak shows at full envelope with no decay. Reduced-motion is evaluated once at mount (not live), though presentation.js updates `SP.reducedMotion` later.
- `document.addEventListener("sp:theme", render)` never removed. ResizeObserver from `fitCanvas` never disconnected.
- Boot order quirk: `fitCanvas` runs its first `draw` before `ctx` is assigned (so first paint is skipped), hence an explicit `render()` right after.

**A11y**: labelled select/range, `aria-live` readout, canvas `role=img` + label (but label is static: it does not describe the current peak; the live readout carries that). Buttons are real `<button>`. No keyboard-specific handlers needed.

**Sub-GHz band/units to preserve**: MHz, dBm. Educational framing: simulated; noise floor around -100 dBm; "fuzz" is the noise floor (foot text).

## 2. tune-in

File: `tune-in.js` (265 lines). Title "Tune In", sub "read the peak, name the frequency". Mounted in module 01 and playground.

**Mount**: `data-widget="tune-in"`; `mode:"compact"` -> canvas height 150px (else 200px).

**Data**: `FREQS = [315, 390, 433.92, 868, 915]` MHz (note 390 and 915 here vs scope remotes 315/433.92/868). Axis fixed 300-928 (`AXIS_SPAN=628`), 6 tick intervals (labels are `toFixed(0)` of `300+628*i/6`: 300, 405, 509, 614, 719, 823, 928; not round MHz numbers, keep or improve). `fmt(f)`: integer -> `String(f)`, else `toFixed(2)`.

**State**: `correctCount, attempts, streak, answered, lastSecret`, `cur={secret, opts[4]}` (module-local, per-mount), persisted `SP.state.tuneIn = {best:int}` (created if missing; saved via `SP.save()` only when streak exceeds best).

**Round logic** (`newRound`): pick random secret from FREQS; if equal to `lastSecret`, advance to next index (no immediate repeat); options = secret + 3 random distinct others, shuffled (Fisher-Yates). So always 4 buttons, exactly one correct. Resets `answered`, feedback to note "?" ("Read the peak against the MHz scale, then choose."), disables Next, `fit.redraw()` (or `render()` on first call).

**Answer** (`answer(f, btn)`): guarded by `answered`; attempts++; all option buttons disabled; the correct one gets inline `background: var(--green-soft)`, `borderColor: var(--green)`; a wrong click gets `--red-soft` / `--red`. Correct: correctCount++, streak++, update best, feedback `tip` "✓ Correct — that peak sits at X MHz. Streak: n."; **if streak === 5 -> `SP.award("tuned-in")`** (award shows toast+confetti), else `SP.toast("Correct — X MHz")`. Note: award fires only on exactly 5 (a streak reaching 5 in a later session after already holding the badge is a no-op via award's guard). Wrong: streak=0, feedback `warn` "! Not quite — that peak was at X MHz. Streak reset." + toast. Then Next enabled and focused, stats updated, canvas re-rendered with the exact value label revealed above the peak (`answered` true). Round counters (`correctCount/attempts/streak`) are NOT persisted; only `best`.

**Stats bar**: `.widget-controls` with three `.readout` spans: "Correct: **n** / attempts", "Streak: **n**", "Best streak: **n**". `updateStats()` called at boot and after each answer.

**Canvas render**: same scope palette; 5 horizontal grid lines; vertical ticks; deterministic noise `noiseAt(k)=0.25+frac(sin(k*12.9898)*43758.5453)*0.6` over N=160 points (no flicker; static, no animation loop); orange gaussian peak at fixed height 82% of plotH; label only after answering. Canvas `class="scope" role=img aria-label="Spectrum reading with one peak to identify"`. The canvas label does not state the answer (correct: it is a quiz). Port a11y note: the peak position is visual-only, so there is no non-visual path to the answer; consider an accessible alternative (e.g. reveal hint after N attempts or a described tolerance).

**DOM**: question `div.readout` "What frequency is this device transmitting on?"; options container `div.btn-row[role=group][aria-label="Frequency choices"]` with `button.btn[aria-label="Choice N: F megahertz"]` containing `<span.readout style=opacity:.6>N </span>` + "F MHz" (JS expando `b._freq`); feedback `div.callout.note[aria-live=polite]` with `span.ic` and `div.fb-text` (class swapped to `callout tip|warn|note`, ic text `?`/`✓`/`!`); `Next round →` `button.btn.primary` in `.btn-row`.

**Keyboard**: `keydown` on host: keys `1`-`4` click the n-th option (ignored once answered; `preventDefault`). Number keys fire even while focus is in other controls inside the host; there is no other text input in this widget.

**Lifecycle**: no timers/rAF. `sp:theme` listener never removed; ResizeObserver never disconnected. Boot: `updateStats(); newRound(); fit=fitCanvas(...); ctx=fit.ctx; render();`. (`newRound` first call runs before `fit` exists: handled by `if (fit) ... else render()` where `ctx` unset so render is a no-op.)

**CSS dependencies**: `.widget-controls`, `.readout`, `.scope`, `.btn-row`, `.btn`, `.callout.note/tip/warn`, inline green/red tokens.

## 3. wave-lab

File: `wave-lab.js` (271 lines). Title "Wave Lab", sub "turn bits into a radio wave". Mounted in module 02 and playground.

**Mount**: `data-widget="wave-lab"`; `mode:"compact"` -> canvas height 190px (else 250px).

**Constants/state**: `DEFAULT_BITS="10110001"`, `MAX_BITS=16`; `state={bits, mod:"OOK"|"FSK", cpb:4}` (cpb = carrier cycles per bit, slider 2-10). `awarded` flag (per mount).

**Controls** (`.widget-controls`):
- `<label>Bits<input type=text value="10110001" size=18 inputmode=numeric spellcheck=false aria-label="Bit string (0 and 1 only)">`. On `input`: strips non-[01], truncates to 16, restores caret position (try/catch `setSelectionRange`), sets `state.bits`, redraws, calls `maybeAward()`.
- `.seg[role=group][aria-label=Modulation]` with two `button[type=button][aria-pressed]`: "OOK (AM)" and "FSK (FM)"; `setMod` toggles `aria-pressed` and redraws.
- `<label>Carrier<input type=range min=2 max=10 style=width:120px aria-label="Carrier cycles per bit">` + `.readout` "**n** cyc/bit".

**Badge rule**: `SP.award("wave-rider")` fires on first input event where `bits.length>=1` and `bits !== DEFAULT_BITS` (once per mount via `awarded`; `award` itself is also idempotent). Note it triggers even for an intermediate edit (e.g. deleting one char), not "encode a message" in a strong sense. Preserve or tighten deliberately.

**Rendering** (single `draw()`, no animation): three stacked lanes of height `(h-12)/3` (pad T6 B6, L/R 8): lane 0 DATA (square wave, color `--scope-trace`), lane 1 CARRIER (continuous sine at `cpb` cycles per bit, color `--scope-text`, lw 1.3), lane 2 modulated output (color `--scope-peak`, label "OOK (AM)" or "FSK (FM)"). Per-lane center baseline in grid color, lane labels top-left (10px mono), faint vertical bit boundaries (alpha .6) across plot, bit digit labels below the data trace only when `bitW>12`. Amplitude `laneH*0.34`.
- OOK: phase accumulates `2*pi*cpb/bitW` per px; stroke only where bit is 1 (pen lifts on 0); flat grid-colored baseline segments over 0 bits (lw 1.4).
- FSK: `loF = cpb*0.75` for 0, `hiF = cpb*1.6` for 1; phase-continuous.
- Empty bits: draws centered "Type some 0s and 1s above." and readout "Waiting for bits…" (returns early, no lanes).
- Readout `div.readout[aria-live=polite]`: "**n** bits · OOK — carrier on for the X one-bit(s), silent for the Y zero(s)." or "**n** bits · FSK — carrier always on, pitch shifting between X high and Y low bits." (singular/plural handled).
- Canvas `.scope role=img aria-label="Three stacked waveform traces: data, carrier, and modulated output"`.
- Foot: OOK = AM on/off keying, FSK = FM, higher pitch for 1.
- Physics caveat for content accuracy: the carrier lane uses `cpb` for the whole width, while the FSK 0/1 frequencies are derived factors (0.75x / 1.6x), purely illustrative, not to scale with real deviation (e.g. Flipper presets AM650/AM270/FM238/FM476 are bandwidth/deviation names, not drawn here).

**Lifecycle**: no timers, no rAF; `fitCanvas` ResizeObserver redraw; `sp:theme` listener never removed. Boot: `fit=fitCanvas(canvas, draw); ctx=fit.ctx; draw();`.

**A11y**: labelled inputs; `aria-pressed` toggle buttons; `aria-live` readout; canvas label static. Input `inputmode="numeric"` on a text field (shows numeric keypad; keypad may lack 0/1 restrictions but sanitize handles it).

## 4. tool-picker

File: `tool-picker.js` (166 lines). Title "Which tool?", sub "Pick the right Sub-GHz move". Mounted in modules 05 (`#toolkit`) and 09 and playground.

**Mount**: `data-widget="tool-picker"`; `mode:"compact"` hides the intro callout.

**Data tables** (content to port verbatim, educational/ownership framing "a device you own")
- `TOOLS` (always the same four options, letters A-D): 0 "Frequency Analyzer", 1 "Read", 2 "Read RAW", 3 "Stop — likely rolling code, don't bother replaying".
- `SCENARIOS` (8): each `{q, a (index into TOOLS), why}`:
  1. Unknown frequency on an owned remote -> 0.
  2. Known garage frequency, want protocol name + decoded key -> 1.
  3. Owned sensor, Read shows nothing, record/replay to own receiver -> 2.
  4. Clone car key fob to unlock car -> 3 (rolling code; use pairing/dealer).
  5. Gate remote shows "Nice FloR-S" with changing Cnt -> 3.
  6. Only need 315 vs 433 MHz -> 0.
  7. Owned cheap wireless doorbell, Read can't ID, trigger chime -> 2.
  8. Own garage remote reads "Princeton, 24-bit" fixed Key, save and open -> 1.
  Answer distribution 0:2, 1:2, 2:2, 3:2. Each `why` is an explanation shown after answering. Moving the scenarios to a typed data file (id, prompt, correctIndex, rationale, optional source/review date) is recommended; the legacy has no sources attached to this widget (other pages cite primary sources).
- `order` = identity indices `[0..7]`; **no shuffle** (named `order` but never shuffled), so scenarios always appear in the same sequence.

**State**: `pos` (current index in `order`), `score`, `answered`. In-memory only; no persistence, no badge, no `SP.state` use. Completion calls `SP.toast("Tool picker: S / 8")` (unguarded).

**Flow**: `showQuestion()` renders progress "Scenario **n** / 8 · Score **s**" in `div.readout`; question text in `.q-text`; options as `button.opt[type=button]` containing `span.letter` (A-D) + `span` label; Next disabled until answered. `answer(j, sc, btn)`: locks all `.opt` (`disabled`), adds `.correct` or `.wrong` to the clicked one, adds `.correct` to the right one if wrong, increments score, shows `.explain` ("Right. " + why, or "Not quite — the move is " + tool name before " —" + why) with class `explain ok|bad`, updates progress, enables Next (label "See score ▸" on last). `finish()`: question text "Done.", clears options, explain shows tiered message (perfect: "Perfect — you know exactly which tool each job wants."; score >= n-2: "Solid. The rolling-code stops are the ones worth re-reading."; else "Run it again — the pattern is: find, decode, record, or stop."), progress "Final score **s** / n", Next disabled and text reset. "Start over" button resets pos/score and shows question 1. Hmm: after `finish()`, Next stays disabled and only "Start over" proceeds.

**DOM/CSS contract (important porting trap)**
- Emits `div.q > div.q-text + div.opts[role=group][aria-label="Tool choices"] + div.explain[role=status][aria-live=polite]`, `button.opt`, `span.letter`, optional `div.callout.note` containing `span.ic` ("i"), `.btn-row` with `.btn.primary.small` and `.btn.ghost.small`.
- In `site.css`, the quiz styles are scoped to `.quiz`: `.quiz .q` (L421), `.quiz .q-text` (L423), `.quiz .opts` (L424), `.quiz .opt` + `:hover` + `.letter` + `.correct` + `.wrong` + `[disabled]` (L425-434), `.quiz .explain` + `.ok/.bad` (L435-437). **The tool-picker host is a `.widget`, not inside `.quiz` (grep of playground, module 05, module 09 shows no `.quiz` wrapper), so those scoped rules do not match.** Only the unscoped `presentation.css` rules `.q {border-radius:20px; box-shadow:none}` and `.opt {border-radius:12px; min-height:46px}` (L308-315) apply. Net effect in legacy: option buttons and `.explain` render with mostly browser/default styling (a latent styling bug or at best partially styled). The port should deliberately style these (reuse the quiz component styles) rather than copying legacy appearance. Verify visually in the legacy site before deciding the target look.
- Also uses `.readout` (inside `.widget`, so `.widget .readout` applies) and inline styles (`margin-top:0`, `margin-bottom:8px|12px`, `display:none` toggled on `.explain`).

**A11y**: options container `role=group` labelled; explanation `role=status aria-live=polite`; buttons real `<button>`; disabled after answer; letters aria-visible (not aria-hidden). No keyboard shortcuts. Focus is not moved to Next after answering (tune-in does move it).

**Lifecycle**: none (no timers, no global listeners).

## 5. signal-atlas (capstone)

File: `signal-atlas.js` (326 lines). Title "Signal Atlas", sub "your personal RF-device log". Mounted at `modules/10-capstone.html#atlas`, and playground (and mentioned in capstone prose). Registered with `if (!window.SP || !SP.registerWidget) return;` guard.

**Mount**: `data-widget="signal-atlas"`; `mode:"compact"` omits the intro `p.readout`. It guarantees `SP.state` and `SP.state.atlas` (array) exist.

**Data model** (row = plain object, persisted in `SP.state.atlas`, inside `signalpath.v2`):
```
{ name: string (required, non-empty after trim),
  category: "Sub-GHz"|"125 kHz RFID"|"NFC"|"Infrared"|"iButton"|"GPIO"|"USB/BLE",
  frequency: string (free text, optional; must contain a digit if non-empty),
  modulation: "n/a"|"AM650"|"AM270"|"FM238"|"FM476"|"FSK"|"other",
  protocol: string, codeType: "Fixed"|"Rolling"|"Unknown",
  notes: string,
  sample?: true }   // only on sample rows
```
Constants: `CATS`, `MODS`, `CODES`, `COLS = [name, category, frequency, modulation, protocol, codeType, notes]` (export column order). Row identity is array index (no id field); the backup validator (learning.js L281-295) requires all 7 fields as strings <= 10000 chars, max 500 rows, preserves `sample:true`. Existing rows missing a field are tolerated at render (`||"—"`), and `editRow` falls back to defaults for unknown enum values (category -> first, modulation -> first, codeType -> "Unknown").

**Form** (`<form novalidate>` CSS grid `repeat(auto-fit,minmax(150px,1fr))`, gap 12): inputs with `aria-label` and placeholders: Name ("Front doorbell"), Category select, Frequency ("433.92 MHz"), Modulation select ("Modulation / preset"), Protocol ("Princeton"), Code type select, Notes textarea (rows 2, full width, "Anything worth remembering…"). Each wrapped in a `<label>` with uppercase mono 11.5px caption (`field()`), so labels are both visible label and aria-label. All control styling is inline `INPUT_CSS` (mono 13px, border `--line-strong`, bg `--surface`) and layout is inline `style.cssText`; no stylesheet classes except `.btn-row`, `.btn.primary`, `.btn.ghost`.
- Buttons: submit `button.btn.primary` "Add device" (becomes "Save changes" while editing); `button.btn.ghost` "Cancel edit" (hidden by `display:none` unless editing).
- Submit: `preventDefault`; empty name -> toast "Give the device a name first" + focus name; invalid frequency (non-empty without any digit) -> toast "Frequency should include a number, e.g. 433.92 MHz" + focus frequency; edit mode (`editIndex` in range) replaces row at index, toast "Updated <name>"; else push + toast "Logged <name>". Then `SP.save()`, `resetForm()`, `renderTable()`.
- No duplicate detection for user rows; no max-length enforcement in the form (backup validator caps at 10000/500).

**Utility row** (`.widget-controls`): `button.btn.small` "Add sample entries", flex spacer, `span.readout` summary "**N** device(s) · **R** rolling" (rolling = count of `codeType === "Rolling"`).

**Sample data** (synthetic; all flagged `sample:true`, notes prefixed "(sample)"):
1. Front doorbell | Sub-GHz | 433.92 MHz | AM650 | Princeton | Fixed | "(sample) fixed 24-bit code"
2. Simulated rolling remote | Sub-GHz | 433.92 MHz | FSK | KeeLoq | Rolling | "(sample) counter changes every press"
3. Unenrolled training tag | 125 kHz RFID | 125 kHz | n/a | EM4100 | Fixed | "(sample) 40-bit EM-Marin ID"
4. Practice NFC card | NFC | 13.56 MHz | n/a | Mifare Classic | Unknown | "(sample) 13.56 MHz ISO 14443"
`addSamples()` skips a sample whose `name` already exists among rows with `sample===true`; toasts "Added N sample device(s)" or "Samples are already in your atlas". Content flag for review: sample 1 pairs AM650 with Princeton, sample 2 pairs FSK with KeeLoq (both illustrative; verify against Flipper presets before shipping).

**Table**: `div.table-scroll > table > thead + tbody`. Headers: Name, Category, Freq, Mod, Protocol, Code, Notes, "" (empty actions header; a11y: should be visually hidden text in the port). Row cells: `<b>name</b>`, category `span.pill` (Sub-GHz -> `.orange`, NFC -> `.purple`, else `.cyan`), freq and mod in `span.mono`, protocol text, code `span.pill` (`.rolling` for Rolling, `.fixed` for Fixed, else `.grey`), notes `td.faint`, actions cell (nowrap) with `button.btn.small.ghost` "Edit" (`aria-label="Edit <name>"`) and `button.btn.small.ghost` "✕" (`aria-label="Delete <name>"`, margin-left 4px). Empty state: single `td.faint[colspan=8]` "No devices yet — add one above, or load a few samples to see how it works." Full re-render on every change. Delete has **no confirmation and no undo**; it splices by index, resets the form if the deleted row was being edited, and decrements `editIndex` if a lower row was removed.
- Edit: loads row into form, sets `editIndex`, focuses name, `scrollIntoView({block:"nearest"})`.

**Export** (`<details>` "Export data" with `.d-body`): buttons "Export JSON", "Export CSV", ghost "Copy"; `textarea[readonly][rows=8][aria-label="Exported atlas data — select and copy"]` (inline mono 12px, `white-space:pre`), initial placeholder text "Choose Export JSON or Export CSV to fill this box, then Copy." Export sets value, opens the details, focuses and selects. No file download (by design: copy-paste portability).
- JSON schema: `JSON.stringify(atlas.map(clean), null, 2)` where `clean` emits exactly the 7 `COLS` keys in order with null/undefined -> `""`; the `sample` flag is dropped from exports.
- CSV: header `name,category,frequency,modulation,protocol,codeType,notes`, rows joined with `\n` (no trailing newline, LF not CRLF). `csvCell`: **CSV/formula-injection guard**: values starting with `= + @ - \t \r` are prefixed with `'`; then values containing `, " \n \r` are quoted with `""` escaping. Note `-` is caught, so a note like "-40 dBm" exports as `'-40 dBm` (intended). Keep this guard in the port (and it is not applied to JSON).
- Copy: `navigator.clipboard.writeText` with fallback to select + `document.execCommand("copy")`; toasts "Copied to clipboard" / "Copied" / "Text selected — press Ctrl/Cmd+C to copy". Copies whatever is currently in the textarea (may be the placeholder text if nothing exported yet; minor bug).
- Foot: "Stays on this device (localStorage). Log only authorized training equipment. Export to keep a copy elsewhere." Intro text: "Log authorized training devices with aliases; do not store credentials or private captures here. This is your reference — and the capstone deliverable." Preserve the safety/ethics copy.

**Cross-file dependencies**: `learning.js` backup/restore (schema above, restore replaces `SP.state` keys and calls `SP.save`), `SP.resetAll` preserves `atlas`, the badge/progress system does not read the atlas (no badge tied to it; capstone module `10-capstone` completion is separate via `SP.markDone`). Atlas does not listen for `sp:state`, so a restore performed on the same page would not refresh an already-mounted table until reload. Port: subscribe to store changes.

**Lifecycle**: no timers/rAF/global listeners.

**A11y**: native form controls with aria-labels, visible labels; buttons labelled per row; toasts are `role=status aria-live=polite` (shared). Issues to fix in port: empty actions `<th>`, no `scope` attributes, validation errors only via toast (should be inline `aria-describedby`), delete without confirm.

## 6. Port notes / checklist (all five)

1. Replace `window.SP` global with a typed store module (progress, badges, atlas, tuneIn) + event hooks; keep storage key `signalpath.v2` and the `{done, quiz, badges, notes, atlas}` shape for backward-compatible import of v1 backups; add `tuneIn` to the schema deliberately.
2. Canvas components: one shared `<ScopeCanvas>` (DPR scaling via ResizeObserver, theme tokens `--scope-*`, redraw on theme change). spectrum-scope, tune-in, wave-lab duplicate the grid/axis/gaussian-peak drawing code (identical padL/padR/padT/axisH, peak sigma, palette fallbacks). Extract helpers: `drawGrid`, `drawGaussianPeak`, `clamp`.
3. Hydration: Astro islands, `client:visible` for all five; spectrum-scope must start/stop its rAF with visibility and unmount; honor reduced motion live (matchMedia listener) and the site's manual motion-pause (`signalpath.motion`, class `motion-off`), which the legacy loop ignores.
4. Preserve exact numbers: bands, remote frequencies, RSSI model, 1500 ms/1100 ms/400 ms timings, 70 ms noise refresh, tune-in FREQS and badge threshold (5 streak), wave-lab MAX_BITS 16, cpb 2-10 default 4, FSK 0.75x/1.6x, OOK pen-lift rendering, atlas enums and export schema/CSV guard.
5. Badge ids `tuned-in` and `wave-rider` must exist in the v2 course data.
6. Tool-picker styling gap (section 4) and the missing `sp:state` sync in atlas are legacy defects, not contracts.
7. Accessibility upgrades worth doing: non-visual path for tune-in, tool-picker focus management, atlas inline validation, descriptive canvas labels updated with state.
