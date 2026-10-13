# Legacy widget map A: flashcards, flipper-sim, pulse-decoder, rf-calc, rolling-sim

Source: `legacy/assets/js/widgets/*.js` (read in full, nothing under `legacy/` modified). Core runtime: `legacy/assets/js/site.js`. Styles: `legacy/assets/css/site.css` (presentation.css has no `.widget`, `.lcd`, `.scope`, `.seg`, `.kv`, `.pill`, `.callout` overrides; it only overrides `.btn`, `.card`, `.eyebrow`, `.callout` generically and defines `.lcd-art`, unused by these widgets). None of the five widgets use `SP.pixel` / the presentation.js pixel font. All are ES5 IIFEs with `"use strict"`, no imports.

## 0. Shared platform contract (all five)

### Mount contract (site.js ~L318-336)
- Host: any element `[data-widget="<name>"]`. Names: `flashcards`, `flipper-sim`, `pulse-decoder`, `rf-calc`, `rolling-sim`.
- Options: `data-opts='<JSON>'` parsed with try/catch (invalid JSON gives `{}`). The only key any of these five read is `mode`: `"compact"` (string compare `opts.mode === "compact"`). Widgets never pass `compact` via HTML in the legacy pages (no page sets it for these five); it is dead-but-supported. `modules/00-setup.html:139` passes `{"start":"subghz"}` to flipper-sim; **flipper-sim ignores it** (it always starts inside Sub-GHz). Port may keep it as an accepted no-op or implement properly.
- Registration: `SP.registerWidget(name, fn)` stores `fn` then calls `mountWidgets()` (scans all `[data-widget]` without `data-mounted`). Scripts therefore may load before or after the markup; each page includes only the widget scripts it needs after `site.js`. Mount sets `data-mounted="1"` BEFORE calling `fn(host, opts)`; a thrown error renders `.callout.warn` "This interactive couldn't load." into the host and `console.error("widget " + name, e)`.
- Guard at top of each: `if (!window.SP || !SP.registerWidget) return;` (rf-calc: `var SP = window.SP`).
- `SP.widgetShell(host, title, sub)`: adds class `widget` to host, clears it, appends `.widget-head` (`.widget-title` with `span.dot` + title text, optional `.widget-sub`, `.spacer`) and `.widget-body`. Returns `{head, body, foot(html)}`; `foot(html)` appends `.widget-foot` with `innerHTML` (so foot strings may contain `<b>`).
- Host pages (where used):

| Widget | Pages |
|---|---|
| flashcards | `glossary.html:51`, `playground.html:89` |
| flipper-sim | `playground.html:41`, `modules/00-setup.html:139` (with `data-opts`) |
| pulse-decoder | `playground.html:71`, `modules/03-protocols.html:92` |
| rf-calc | `primer.html:126`, `playground.html:65`, `modules/01-frequency.html:161` |
| rolling-sim | `case-studies.html:36`, `playground.html:77`, `modules/05-raw-and-rolling.html:153` |

### SP helpers used
- `SP.el(tag, attrs, children)`: attrs keys `class`, `html`, `text`, `on*` function, else `setAttribute`; children strings become text nodes, falsy skipped.
- `SP.reducedMotion` (boolean, snapshot of `(prefers-reduced-motion: reduce)` at load, not live).
- `SP.cssVar(name)`: `getComputedStyle(documentElement).getPropertyValue(name).trim()`.
- `SP.fitCanvas(canvas, draw)` (pulse-decoder): DPR-scaled, `ResizeObserver` (fallback `window resize`) on the canvas, calls `draw(ctx, cssW, cssH)`; returns `{ctx, redraw}`. The observer is never disconnected (no teardown in legacy at all).
- `SP.toast(msg)`, `SP.award(badgeId, quiet)`, `SP.state`, `SP.save()` (flashcards / rolling-sim only, see below).
- Events: `document` `sp:theme` (dispatched by theme toggle, `detail.theme`), `sp:state` (dispatched by `SP.save`).

### Storage (all in one localStorage key)
- `signalpath.v2` = JSON of `SP.state` = `{done, quiz, badges, notes, atlas, ...}`. Theme is separate: `signalpath.theme`.
- Widgets in this set write exactly two things: `SP.state.flashIndex` (number, flashcards) and `SP.state.badges["out-of-sync"] = true` (via `SP.award`, rolling-sim). `resetAll()` rebuilds state as `{done,quiz,badges,atlas,notes}` so **flashIndex is wiped by "Reset progress"**.
- flipper-sim, pulse-decoder, rf-calc store nothing.

### Badge catalog dependency
- `SP.BADGES` from `legacy/assets/js/data/course.js`. rolling-sim needs badge id `out-of-sync`: `{ id:"out-of-sync", ic:"⊘", name:"Out of Sync", how:"Watch a replay fail in the Rolling Code Sim" }`. `SP.award` flow: if already earned returns false (no toast); else sets, `SP.save()`, and if not quiet toasts "Badge earned: ⊘ Out of Sync" + `SP.confetti()` (confetti is skipped when `SP.reducedMotion`).

### Theme tokens consumed (site.css `:root`, dark overrides under prefers-color-scheme / theme attr)
`--surface --surface-2 --surface-3 --line --line-strong --text --muted --faint --radius(14px) --radius-sm(9px) --font-display("Archivo") --font-mono("IBM Plex Mono") --orange --cyan --green --red --yellow --purple (+ `-soft` variants) --btn-primary-bg --btn-primary-ink --shadow`, plus instrument tokens that stay dark/LCD-colored in both themes: `--lcd-bg:#F6A03A --lcd-ink:#1B1509 --scope-bg:#0B1220 --scope-grid:#1B2A44 --scope-trace:#3FD8D2 --scope-peak:#FF8A34 --scope-text:#9BB3D1`.

### Shared CSS classes (site.css line refs) a port must keep or replace 1:1
`.widget` (379, card, `overflow:hidden`), `.widget-head/-title/-sub/.spacer` (383-390), `.widget-body` 391, `.widget-foot` 392, `.widget-controls` (393-399; styles `label`, `input[type=range|text|number]`, `select`), `.widget .readout` + `b` (400-401, orange bold), `.seg` + `button[aria-pressed="true"]` (402-408), `.scope` (409, block, 100% wide, dark bg), `.lcd` (412-417, orange backlit box, mono 12px, `image-rendering:pixelated`), `.btn` (+`.primary .ghost .small .mono`, disabled at 217; min-height 40px at 548), `.btn-row` 218, `.pill` + colors `orange cyan green red yellow purple grey` (186-193; `.am .fm .fixed .rolling` are aliases), `.callout` + `.note .tip .warn .legal` + `> .ic` + `.callout-title` (294-315), `.card` + `.flat .tight` (287-292), `.eyebrow` (174), `.grid3` (294-296; collapses to 1 col at <=760px, 2 cols 761-980px), `.kv` dl grid (356-359), `.tabular` (514), `.mono` (145), `.faint` (179). Global rule `prefers-reduced-motion` (site.css 517) kills all transitions/animations with `!important` (this also neutralises the flashcards flip transition even without `.reduced`).

---

## 1. flashcards  (`flashcards.js`, 191 lines)

**Purpose**: flip-card study tool over the glossary.

**Mount**: `data-widget="flashcards"`; opts: `mode:"compact"` only (min height 150px vs 200px). Title "Glossary flashcards", sub "flip to check yourself". No foot.

**Dependencies**
- `window.SP_GLOSSARY` from `legacy/assets/js/data/glossary.js`, loaded before the widget (`glossary.html:76` order). Shape `[{term, short, long, tags:[...]}]`, 58 entries, sorted A-Z. Entries without `term` are filtered. Tag vocabulary actually used: `sub-ghz`(38) `units`(18) `protocol`(17) `security`(11) `modulation`(8) `nfc`(8) `rfid`(8) `flipper`(6) `legal`(5) `hardware`(4). Missing/empty glossary renders `.callout.note` "Glossary not loaded" and returns (no controls).
- `SP.state.flashIndex` (read at mount, written on `go()`), `SP.save`, `SP.toast`, `SP.reducedMotion`.
- No badges. No presentation.js.

**Injected CSS**: `ensureCSS()` appends `<style id="sp-flashcards-css">` once to `<head>` (id guard). Rules: `.sp-fc` (perspective 1200px), `.sp-fc-card` (relative, pointer), `.sp-fc-inner` (preserve-3d, .5s `cubic-bezier(.2,.7,.2,1)` transform), `.sp-fc-card.flipped .sp-fc-inner{rotateY(180deg)}`, `.sp-fc.reduced .sp-fc-inner{transition:none}`, `.sp-fc-face` (absolute inset 0, backface hidden, flex column, `var(--surface-2)`, 22/22/30 padding, overflow auto), `.sp-fc-back` (rotateY 180), `.sp-fc-eyebrow`, `.sp-fc-term` (Archivo 800 26px), `.sp-fc-short`, `.sp-fc-long`, `.sp-fc-tags`, `.sp-fc-hint` (abs bottom-right mono 10px). Port: move to component CSS/tokens, keep 3D flip; the front/back faces are `position:absolute` so the container height comes from inline `min-height` (150/200px) on BOTH `.sp-fc-card` and `.sp-fc-inner`. Long definitions scroll inside the face (`overflow:auto`).

**DOM emitted**
```
.widget
  .widget-head / .widget-body
    .widget-controls
      label > span "Tag" + select[aria-label="Filter cards by tag"] (option value "all" "all tags", then sorted tags)
      button.btn.small "Shuffle"
      span (inline style flex:1 spacer)
      span.readout "N / total"
    .sp-fc[.reduced]
      .sp-fc-card[role=button][tabindex=0][aria-pressed][aria-label="Flashcard. Activate to flip between term and definition."][.flipped]
        .sp-fc-inner
          .sp-fc-face (front): .sp-fc-eyebrow "Term", .sp-fc-term, [.sp-fc-tags > span.pill.grey*], .sp-fc-hint "flip →"
          .sp-fc-face.sp-fc-back: .sp-fc-eyebrow (term), [.sp-fc-short], [.sp-fc-long], fallback "No definition on file.", .sp-fc-hint "← flip"
    .btn-row: button.btn.small "‹ Prev" [aria-label], button.btn.small.primary "Flip", button.btn.small "Next ›" [aria-label]
```
All text via `textContent` (safe). Quirk: both faces are always in the accessibility tree (no `aria-hidden` on the hidden face) and `aria-pressed` on the card is the only state signal.

**State machine** (vars `list, i, flipped`)
- `list` starts as all valid entries (original A-Z order); `i` = `SP.state.flashIndex` if a number within `[0, list.length)` else 0.
- `flip()` toggles `flipped` (class `.flipped` + `aria-pressed`). `renderCard()` always calls `setFlipped(false)` (new card shows front) and updates `pos` text.
- `go(d)`: wraparound `i=(i+d+len)%len`, renders, then `SP.state.flashIndex = i; SP.save()` (dispatches `sp:state`, which re-renders progress UI sitewide; each card advance writes localStorage).
- `applyFilter(tag)`: `"all"` -> copy of all; else entries whose `tags` contain tag; empty result falls back to all; sets `i=0`, re-render, **does not persist** index. Note `flashIndex` is an index into whatever list was active, but restore always applies it to the unfiltered list (harmless quirk; port should store the term instead).
- `shuffle()`: in-place Fisher-Yates over the current (filtered) `list`, `i=0`, toast "Shuffled N cards". Does not persist; shuffle order is lost on reload. Selecting a tag after shuffle restores sorted order.
- Timers/animation loops: none (CSS transition only). No cleanup needed.

**Inputs/outputs**: input = glossary + saved index; output = visual only plus `flashIndex`.

**Accessibility/keyboard**
- Card is `role=button`, focusable, `aria-pressed`. Click on card flips. `host` keydown handler (only fires when focus is inside widget): ArrowLeft/ArrowRight prev/next (ignored if target is INPUT/TEXTAREA/SELECT), Space/Enter flip (ignored when typing or when target is a BUTTON/SELECT so native activation runs). Arrow keys on a focused `<select>` stay native.
- Native `<button>`s for Prev/Flip/Next; select has aria-label. The `pos` readout has no live region (position changes are silent). `SP.reducedMotion` adds `.reduced` class (transition none).

**Embedded data tables**: none (consumes SP_GLOSSARY).

---

## 2. flipper-sim  (`flipper-sim.js`, 194 lines)

**Purpose**: simulated Flipper Zero screen + D-pad that walks the Sub-GHz menu tree (teaching approximation).

**Mount**: `data-widget="flipper-sim"`; opts: `mode:"compact"` (LCD max-width 260px vs 320px, font 13px vs 15px, min-height 148 vs 184, hides intro paragraph and breadcrumb, small buttons). `{"start":"subghz"}` in `00-setup.html` is **ignored** (start state is hard-coded). Title "Flipper Sub-GHz sim", sub "walk the menu with the D-pad". Foot (html): "Teaching approximation — Momentum may reorder or add items (extra presets, tools). Learn the shape, then trust the real menu."

**Dependencies**: only `SP.el`, `SP.widgetShell`. No storage, badges, glossary, course data or timers. Colors via `--lcd-bg/--lcd-ink` (inline styles).

**Embedded menu model** (must be ported verbatim; helpers `menu(title,items)` -> `{type:"menu"}`, `leaf(title,lines,note)` -> `{type:"leaf"}`)
- `root` "Flipper": Sub-GHz (-> subghz), "125 kHz RFID", "NFC", "Infrared", "GPIO", "iButton", "Settings" (each -> `notCovered(name)` leaf with lines `["This teaching sim","only walks the","Sub-GHz menu.","","Press Back and","choose Sub-GHz."]`, note `"(a real Flipper opens the <name> app here)"`).
- `subghz` "Sub-GHz" items and leaves (title; lines; note):
  - Read: `["433.92   AM650","","Scanning . . .","(quiet air)"]`; note = DECODE_NOTE "(on a real Flipper, a decoded signal — protocol, key, and a Save option — appears here)"
  - Read RAW: `["433.92   AM650","","Records raw on/off","timing to a .sub"]`; "(RAW capture stores microsecond timings, not a decoded protocol)"
  - Frequency Analyzer (leaf title "Freq Analyzer"): `["Hold a remote's","button nearby...","","433.920 MHz","-64 dBm"]`; "(finds the strongest signal across 300-928 MHz — handy for an unknown remote)"
  - Test: `["433.92 MHz","","RSSI  -92 dBm","level: quiet"]`; "(a live signal-strength meter on the current frequency)"
  - Add Manually: `["Pick a known","protocol, then type","its code by hand.","","e.g. Princeton,","Nice FLO, CAME"]`; "(builds a .sub from a protocol template; the real list is long)"
  - Saved -> menu `saved` "Saved": `Doorbell_front` (lines `["Freq  433.92 MHz","Preset  AM650","Protocol Princeton","Bit 24   TE 400"]`, note "(a stored .sub key file; the real screen offers Emulate / Send / Rename / Delete)") and `LED_strip` (lines `["Freq  433.92 MHz","Preset  AM650","Protocol Princeton","Bit 24"]`, note "(your own saved capture — the course only ever stores devices you own)").
- Content guard for the port: all data is synthetic; "Momentum" firmware mention is educational.

**State machine**: `stack = [{node:root,sel:0},{node:subghz,sel:0}]` (starts inside Sub-GHz; Back reaches root; stack length 1 = root, Back disabled). `cur()` = top. 
- `move(d)`: only on `menu` nodes; clamps `sel` to `[0,n-1]` (no wrap).
- `doOK()`: only on menu nodes; pushes `{node:item.node, sel:0}`.
- `doBack()`: pops unless length<=1. Leaves have no cursor; OK/arrows do nothing on a leaf.
- Selection memory: each frame keeps its own `sel`, so returning to a menu restores the cursor.
- `render()` rebuilds `titleBar` (title + "((•))"), `screen` rows, the breadcrumb `crumb` (titles joined with " ▸ "), and `backBtn.disabled = stack.length<=1`.
- Timers: none.

**DOM / styles emitted**
```
.widget-body
  p.readout (non-compact): "Move with the D-pad or arrow keys. <b>OK</b> opens an item, <b>Back</b> goes up a level."
  .lcd[tabindex=0][role=group][aria-label="Simulated Flipper screen. Arrow keys move the cursor, Enter selects, Backspace goes back."]  (inline: max-width, margin auto, font-size, min-height, user-select none)
    div (titleBar, inline flex: ink background, lcd-bg text) > span title + span "((•))"
    div[aria-live=polite] (screen): menu rows div "» label" / "  label" with inline padding, white-space:pre, selected row inverted (background var(--lcd-ink), color var(--lcd-bg)); leaf lines div (white-space:pre, min-height 1.2em); note div (italic .82em, opacity .8)
  div.readout (breadcrumb, non-compact only; inline centered 12px faint)
  div (D-pad: inline grid 3 cols minmax(52px,1fr), gap 8, max 280px, grid-template-areas '. up .' '. ok .' '. down back')
    button.btn[.small][aria-label="Up"] "▲" (gridArea up); button.btn.primary "OK" aria-label "Select or open"; "▼" Down; "Back" aria-label "Back — up one level"
```
Almost all of the styling is inline `style`; only `.lcd/.btn/.readout/.widget*` come from CSS. The `.lcd` font is IBM Plex Mono (not a pixel font); no use of `SP.pixel`.

**Accessibility/keyboard**: `host` keydown (focus must be inside widget; ignored in INPUT/TEXTAREA/SELECT): ArrowUp/Down move (preventDefault), Enter opens (unless target is a BUTTON, so a focused button does its own click), Backspace goes back (preventDefault, also on buttons). The LCD is `tabindex=0` so keys work after clicking/tabbing into it. Screen region is `aria-live="polite"` (rebuilt on every move, so whole screen is re-announced). Buttons have aria-labels. Gap: no `aria-selected`/listbox semantics for the cursor row; the selected row is only conveyed by the `»` glyph text.

---

## 3. pulse-decoder  (`pulse-decoder.js`, 276 lines)

**Purpose**: step/auto-play OOK pulse-train decode, bit by bit, canvas scope + LCD readout.

**Mount**: `data-widget="pulse-decoder"`; opts: `mode:"compact"` (canvas height 150px vs 190px, hides legend callout). Title "Pulse decoder", sub "How a pulse train becomes bits". Foot: "Highlighted pulse = the bit being read. Bits accumulate MSB-first into the key."

**Dependencies**: `SP.el`, `SP.widgetShell`, `SP.fitCanvas`, `SP.cssVar` (`--scope-bg --scope-grid --scope-trace --scope-peak --scope-text --font-mono`, each with hard-coded fallbacks `#0B1220 #1B2A44 #3FD8D2 #FF8A34 #9BB3D1 monospace`), `SP.reducedMotion`, `document` event `sp:theme` (redraw on theme change; listener added to `document`, never removed). No storage, no badges, no glossary.

**Embedded data** (`SAMPLES`; bits MSB-first via `hexToBits(hex,n)`)

| id | label | proto | TE (us) | hex | bits (n) | binary |
|---|---|---|---|---|---|---|
| garage | "Garage (Princeton 24-bit)" | Princeton | 400 | 8C5A3B | 24 | 100011000101101000111011 |
| flo | "Nice FLO (fixed 12-bit)" | Nice FLO | 700 | 5C3 | 12 | 010111000011 |

Encoding rule (documented in the legend callout "The rule (OOK, TE-based)"): bit 0 = 1xTE high + 3xTE low; bit 1 = 3xTE high + 1xTE low; every bit spans 4 TE (`totalTE = bits.length*4`). This is a simplified teaching model, not real Princeton framing (no sync gap).
Pure helpers to port/test: `hexToBits`, `bitsValue` (note: `v*2+bit`, safe to 53 bits; `hexToBits` uses 32-bit shifts so n<=31 is the safe limit, 24 used), `bitsHex` (uppercase, zero-padded to `ceil(n/4)` digits), `groupBits` (space every 4 bits).

**State machine**: `sample` (current), `i` = number of bits decoded (0..len, also index of the bit being read), `playing`, `timer`.
- `pickSample(idx)`: `stopAuto()`, set sample, `i=0`, update seg `aria-pressed`, `render()`. Called once at mount with 0.
- `step()`: `if (i<len) {i++; render()}`; if now `i>=len` -> `stopAuto()`. Step button click calls `stopAuto()` then `step()`.
- `toggleAuto()`: if playing -> stop; else if `i>=len` restart at 0; `playing=true`, button text "Pause", `aria-pressed=true`, `setInterval(..., 650)` calling `step()` (self-stops at end).
- `stopAuto()`: clears interval, `playing=false`, button text "Auto play", `aria-pressed=false`. Reset button: `stopAuto(); i=0; render()`.
- `render()`: Step button text "Done" + `disabled` when `i>=len`, else "Step ▸"; rewrites LCD text (4 lines: `"<proto>  TE <te>us"`, `"Bit i/len  reading..." or "  DECODED"`, `"BIN ..."`, `"HEX ..."`, using "-" when empty); rewrites `dl.kv` values via `innerHTML` (static strings built from trusted data); `fit.redraw()`.
- Timer cleanup: only via `stopAuto()` (on sample change, step, reset, completion). There is NO teardown on host removal/unmount: the interval and the `sp:theme` document listener and the ResizeObserver leak if the DOM node is destroyed (legacy never destroys). A React port must clear them in effect cleanup.
- Reduced motion: Auto play button is `disabled` with title "Auto play is off while your system requests reduced motion — use Step."; no click handler attached.

**Canvas drawing (`draw(ctx,w,h)`)**: background fill; pads L/R 8, top 16, bottom 22; `yHigh=padTop`, `yLow=h-padBottom`; `unit=(w-16)/totalTE`, `quad=unit*4`; two horizontal gridlines; current-bit window highlight `fillRect(padL+i*quad, yHigh-4, quad, ...)` in peak colour at alpha .16 (`hexA` converts `#rgb/#rrggbb` to rgba, passes other colour strings through unchanged, so alpha is lost for non-hex custom properties); each bit rendered as rise/plateau/fall/low-plateau polyline: done = trace colour, current = peak colour (2.5px), future = grid colour; bit digit labels under each quad for `k<=i` only when `quad>=16` (current in peak colour, else text colour, 11px mono); "on"/"off" labels at left. Colours re-read from CSS vars on every draw, so theme changes work after `sp:theme` redraw (instrument tokens are the same in both themes anyway).

**DOM emitted**
```
.widget-controls > label > span "Capture" + .seg[role=group][aria-label="Sample capture"] > button[type=button][aria-pressed] x2
canvas.scope[role=img][aria-label="OOK pulse train being decoded"] (inline height)
.btn-row (inline margin-top) > button.btn.primary.small "Step ▸", button.btn.small[aria-pressed] "Auto play", button.btn.ghost.small "Reset"
.lcd[role=status][aria-live=polite] (white-space:pre inline)
dl.kv > dt "TE" dd, dt "Bits" dd, dt "Binary" dd (span.mono / span.faint), dt "Hex" dd (span.mono > b)
.callout.note (non-compact) > span.ic "?" + div(.callout-title "The rule (OOK, TE-based)" + div html)
```
**Accessibility**: canvas has role=img + static label (does not describe progress; the `role=status` LCD carries the textual state, which re-announces every step), seg buttons use `aria-pressed`, no keyboard shortcuts. Auto-play button name changes text, `aria-pressed` also toggled (double-signalling: both "Pause" label and pressed state).

---

## 4. rf-calc  (`rf-calc.js`, 136 lines)

**Purpose**: wavelength/antenna calculator and dBm<->mW converter. Pure client math, no state.

**Mount**: `data-widget="rf-calc"`; opts: `mode:"compact"` (hides the "worked" line). Title "RF calculator", sub "wavelength & power, worked out". Foot (html): `Wavelength: <b>λ = c ÷ f</b>, with c = 299,792,458 m/s. A quarter-wave whip (λ/4) is the classic "rubber duck" antenna length.`

**Dependencies**: `SP.el`, `SP.widgetShell` only (note: grabs `var SP = window.SP` itself). No storage/badges/timers/events/canvas. Constant `C = 299792458`.

**Inputs/defaults** (all `<input type=number>` with `input` event listeners; computed once at mount too)
- A: Frequency (MHz): value `433.92`, `min=0`, `step=0.01`, width 120px, `aria-label="Frequency in megahertz"`.
- B1: dBm: value `10`, step 1, width 100, `aria-label="Power in dBm"`.
- B2: mW: value `1`, `min=0`, `step=0.1`, width 100, `aria-label="Power in milliwatts"`.

**Math / outputs**
- `calcA`: `f` in MHz must be finite and `>0` else all three dd = "—" and worked line "Enter a frequency above 0." Else `λ(m)=C/(f*1e6)`; displays λ, λ/4, λ/2 with `fmtCm(cm)`: `>=100 cm` -> 1 decimal cm; `>=1` -> 2 decimals cm; else mm with 2 decimals (`cm*10`); non-finite -> "—". Worked line (monospace 12px faint): `"λ = 299,792,458 ÷ <Hz with toLocaleString()> Hz = <m 4dp> m = <cm 2dp> cm"` (`toLocaleString()` is locale-dependent separators in the legacy; pin the locale in the port for deterministic tests). Sanity: 433.92 MHz gives λ ≈ 69.09 cm, λ/4 ≈ 17.27 cm, λ/2 ≈ 34.55 cm.
- `calcB1`: `mW = 10^(dBm/10)`; output `"= <b>sig(mW) mW</b>"`; non-finite input -> "= —".
- `calcB2`: `dBm = 10*log10(mW)`; output `"= <b>sig(dBm) dBm</b>"`; for `mW<=0` or non-finite -> "= —", and when exactly 0 appends " (0 mW = -∞ dBm)". Negative inputs show plain "—" (no explanation).
- `sig(n,digits=4)`: 0 -> "0"; for `0.001<=n<1e7` fixed formatting with 2/3/4 decimals by magnitude (>=100, >=1, else) via `parseFloat(toFixed).toString()` (trims trailing zeros); otherwise `toExponential(digits-1)`. Known quirk: the range test uses `n` (not `abs`), so negative dBm results (e.g. 0.5 mW = -3.01 dBm) fall to the exponential branch and show "-3.010e+0". Port should use `Math.abs(n)` for the range check (decide intentionally; this is a legacy bug, not a contract).
- Reference line (html): `Reference: <b>0 dBm = 1 mW</b> · +10 dB = ×10 · +3 dB ≈ ×2`.

**DOM emitted**
```
.card.flat.tight (inline margin-bottom 14px) [A]
  .eyebrow "A · Wavelength & antenna"
  .widget-controls > label "Frequency (MHz)" > input[type=number]
  dl.kv.tabular > dt "λ (full)" dd(b), dt "λ/4" dd(b), dt "λ/2" dd(b), [dt "worked" dd.faint mono]
.card.flat.tight [B]
  .eyebrow "B · Power (dBm ⇄ mW)"
  .widget-controls > label "dBm" > input + span.readout.tabular
  .widget-controls > label "mW"  > input + span.readout.tabular
  div.readout.faint reference line
```
Labels wrap their inputs (implicit labelling) plus redundant `aria-label`s. Output spans are not live regions (results update silently for screen readers). Results use `innerHTML` with trusted generated strings only.

---

## 5. rolling-sim  (`rolling-sim.js`, 383 lines)

**Purpose**: counter-based rolling-code model: remote, Flipper (capture/replay), receiver with forward window. Explicitly a concept demo, not an attack recipe; keep the "synthetic counter model, no radio hardware" framing and the case-study disclaimer (case-studies.html says the gate scenario is hypothetical).

**Mount**: `data-widget="rolling-sim"`; opts: `mode:"compact"` (hides intro callout; log max-height 84px vs 132px). Title "Rolling-code sim", sub "Why a replay works once, then never again". Foot: "Cnt = the remote's counter. The receiver only ever moves forward, which is what makes an old capture worthless."

**Dependencies**: `SP.el`, `SP.widgetShell`, `SP.reducedMotion`, `SP.award("out-of-sync")` (badge catalog in `course.js`; toast + confetti side effects), badge-driven progress UI via `sp:state`. No glossary/course module data, no `SP.state` field of its own (the badge is stored in `state.badges`). Constants: `SERIAL="1A2B3C4D"`, `START=5`, initial window 16 (slider 1-256).

**Synthetic data**: `blobFor(cnt)` = 32-bit hash `s=(s*131+charCode)>>>0` over the string `"1A2B3C4D:"+cnt`, rendered as 4 uppercase hex bytes from LSB first, space-separated. Fixtures: cnt5 "CB B0 DE 8B", 6 "CC B0 DE 8B", 7 "CD B0 DE 8B", 8 "CE B0 DE 8B", 9 "CF B0 DE 8B" (only the first byte changes, so it looks like an incrementing counter, not a cipher; acceptable, the intro says crypto is not implemented).

**Model rules** (`evaluate(cnt)`): `cnt <= recvLast` -> "replay" (gate closed); `cnt > recvLast + win` -> "ahead" (gate closed); else `recvLast = cnt`, gate open, "accept". Rejected packets never advance `recvLast`. Note `gateOpen` is only updated by `evaluate`, so after a captured-press (which skips evaluate) the previous gate state persists visually; `reset()` closes it.

**State** (closure vars): `remoteCnt`, `recvLast`, `win`, `captured {cnt,blob}|null`, `captureArmed`, `gateOpen`, `running` (scripted preset in progress), `sawReplayFail` (once-per-mount guard for the badge), `logLines` (capped at 40), preset: `presetTimer`, `stepIdx`, `awaitingFinish`.

**Actions**
- `pressRemote()`: `remoteCnt++`. If `captureArmed`: stores `captured={cnt,blob}`, disarms, callout kind `note` "Recorded, out of range", log "Press #N recorded by Flipper (gate out of range)." (gate never hears it; `recvLast` unchanged). Else evaluate: accept -> callout `tip` "Gate opens"; ahead -> `warn` "Too far ahead"; replay(not ahead) -> `legal` "Already used". Logs `Press #N -> ACCEPT. Gate opens. Receiver last = X.` / `REJECT (out of sync, > window).` / `REJECT (not ahead).` (Honest presses after the receiver has moved past can't normally hit "not ahead" since remoteCnt is monotonic, but out-of-order after window changes can.)
- `armCapture()`: if `captured` already exists -> note "Flipper already holds a capture" (no toggle). Else toggles `captureArmed`; callouts "Flipper armed"/"Capture cancelled"; log lines.
- `replay()`: requires `captured`. Does NOT clear the capture. accept -> `tip` "Replay worked — this time" (receiver advances: the capture is spent, but remains stored); ahead -> `warn` "Replay refused — too far ahead" + `firstFail()`; replay -> `legal` "Replay is dead" + `firstFail()`.
- `firstFail()`: once per mount, `SP.award("out-of-sync")` (non-quiet: toast "Badge earned: ⊘ Out of Sync" + confetti unless reduced motion; no-op if previously earned).
- `reset()`: `stopPreset()`, remote/receiver back to `START` (5), `win=16`, clears capture/arm/gate, slider back to 16 and label, clears log, callout `note` "Reset", log "Reset. Remote Cnt 5, receiver last 5." Always allowed (even mid-preset; clears `presetTimer`).
- Slider `input`: sets `win` (>=1), updates label and receiver panel (does not re-render).
- Button enable rules in `render()`: Replay disabled when no capture; with capture, `disabled = running`. Capture button gets `aria-pressed` = armed. Manual Press/Capture/Replay handlers are no-ops while `running` (and `setButtons(false)` disables them plus the slider). Reset and the preset button remain clickable.

**Scripted preset "Reproduce the gate mystery"** (`STEPS`, 6 steps): armCapture -> pressRemote (captures Cnt 6, gate not told) -> log "— now you drive to the gate —" + replay (accepted, 6>5, receiver now 6) -> pressRemote (#7 accepted) -> pressRemote (#8 accepted) -> log "— you try the old capture again —" + replay (6<=8 rejected, awards badge). Then `finishSummary()` (callout `legal` "That is the whole mystery", log "Done. The one-time capture is now worthless.") and `stopPreset()`.
- Normal motion: `runPreset()` ignores clicks while `running`; else `reset()`, `running=true`, `setButtons(false)`, `setTimeout(tick,300)` then each step 900 ms apart via recursive `setTimeout` (`presetTimer`). `stopPreset()` clears the timer, restores button text and enables controls. The slider is disabled during the run, so window stays 16 in the demo.
- Reduced motion (`SP.reducedMotion`): `runPreset` delegates to `stepPreset()`, a click-per-step stepper: first click resets and starts (`running=true`, `stepIdx=0`), each click runs `STEPS[stepIdx++]` and relabels the button "Next step (k / 6) ▸"; after the last step label becomes "See the summary ▸" (`awaitingFinish`); the next click shows the summary and stops. Manual controls stay disabled meanwhile (only Reset or the stepper). Note reduced-motion is read once at load, not live.
- Timer cleanup: only `stopPreset()`/`reset()`; no teardown on unmount (port must clear `presetTimer` in cleanup).

**DOM emitted**
```
.callout.note (non-compact) intro, "A synthetic counter model — no radio hardware"
.grid3 (inline margin-bottom 14px)
  .card.tight "Remote" (◉): dl.kv rows Serial(span.mono), Cnt(b), Last blob(span.mono)
  .card.tight "Flipper" (▸): Status (span.pill grey|yellow|purple), Captured Cnt (span.faint|mono), Blob
  .card.tight "Receiver" (⛨): Last accepted(b), Window(b), Gate (span.pill red|green "GATE CLOSED/OPEN") + div.rc-gate[aria-hidden] (8px bar, inline style red .55 opacity / green, NO css rule exists for .rc-gate in site.css or presentation.css; styling is entirely inline)
.widget-controls > label > span "Accept window" + input[type=range min=1 max=256][aria-label="Receiver acceptance window"] + span.readout "window <b>N</b>"
.btn-row: Press real remote (primary), Capture next press [aria-pressed], Replay capture, Reproduce the gate mystery, Reset (ghost); all .btn.small
.callout[role=status][aria-live=polite] (class set to "callout <note|tip|warn|legal>" by setReason) > span.ic (note "»", tip "✓", legal "✕", warn "!") + div(.callout-title + .rc-reason)  (.rc-reason has no CSS rule)
.lcd log (white-space:pre, overflow:auto, max-height inline); auto-scrolls to bottom; max 40 lines
```
Panel title uses `.widget-title` inline-styled with a cyan icon glyph (`aria-hidden`). The `.callout.legal` class is semantically reused as the red "rejected" state (not a legal notice).

**Accessibility**: decision callout is a polite live region (primary feedback channel); log not live; buttons native with `aria-pressed` on Capture; slider labelled; gate bar `aria-hidden` while pill text carries state. Colour alone is not relied on (text pills + icons).

---

## 6. Port checklist (cross-cutting)

1. Replace `SP` globals with explicit modules: `registerWidget`/`data-widget` becomes an Astro island registry keyed by the five names; `data-opts` JSON becomes props (`mode`, ignore-or-implement `start`).
2. Preserve storage keys/shape if data should carry over from the legacy site: `localStorage["signalpath.v2"].flashIndex` (number) and `.badges["out-of-sync"]`; add schema versioning; `resetAll()` semantics currently drop `flashIndex`.
3. Preserve the badge id `out-of-sync` and its award timing (first rejected replay, not on accepted replay).
4. Synthetic data to keep verbatim: flipper menu tree (sec. 2), pulse SAMPLES (sec. 3), rolling-sim SERIAL/START/window defaults/`blobFor`/preset script (sec. 5), glossary (separate data file, 58 entries, tag list in sec. 1).
5. Cleanup obligations (legacy leaks): pulse-decoder `setInterval` + `document` `sp:theme` listener + ResizeObserver; rolling-sim `setTimeout` chain; flashcards none; flipper-sim none (listeners on host only).
6. Reduced-motion behaviour (pulse-decoder auto-play disabled; rolling-sim click-stepper; flashcards no flip transition) should become reactive to `matchMedia` changes instead of a load-time snapshot.
7. Known legacy defects worth fixing intentionally: rf-calc `sig()` negative-number formatting; flashcards filter/shuffle not persisted and saved index applies to unfiltered list; flipper-sim ignores `start` opt and re-announces whole screen on each move; both flashcard faces exposed to AT; flashcards position counter not announced; `toLocaleString()` locale dependence in rf-calc worked line.
8. All keyboard handlers are on the host element and require focus inside it (no global key capture); keep that, it prevents hijacking page arrows.
