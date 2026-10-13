# Legacy map: presentation layer, pixel art, 3D scenes, design system

Source tree: `legacy/` (do not modify). Scope: `legacy/assets/js/presentation.js` (405 lines), `legacy/assets/js/scene3d.js` (454), `legacy/assets/css/presentation.css` (1431), `legacy/assets/css/site.css` (563), `legacy/assets/models/`, `legacy/assets/images/`, plus the vendored three.js bundle that scene3d depends on.

Load order on every page (31 HTML files): `site.css` -> inline theme bootstrap script -> `presentation.css` -> body scripts `data/course.js`, `site.js`, (module-specific data/widgets), `presentation.js` last. `presentation.css` overrides `site.css` tokens (same names, later in cascade). `body` carries `data-root` (relative path prefix to site root, `""` on index, `"../"` in `modules/`) and `data-page` (`home`, `m00`..`m18`, `quiz`, `roadmap`, `notebook`, `playground`, `primer`, `reference`, `glossary`, `sources`, `legal`, `case-studies`, `404`). Both attributes are read by presentation.js: a port must supply equivalents (base URL and page id) to every component below.

## 1. presentation.js: structure

File contains two IIFEs.

### 1a. IIFE 1: `initPresentation()` (runs on DOMContentLoaded or immediately)
Reads `document.body[data-root]`, `matchMedia("(prefers-reduced-motion: reduce)")` as `reduced`.

1. Brand logo swap: finds `.brand`; replaces its `.dot` child (created by site.js topbar builder) with `<img class="brand-logo" src="{root}assets/images/signal-path-logo.png" alt="" width=29 height=32>`; if no `.dot`, prepends the img. CSS `.brand-logo` is 29x32 (26x29 under 480px), `object-fit: contain`.
2. Theme button restyle: `.theme-btn` text forced to `"◐"`, `title="Toggle color theme"`. (Created by site.js with text `"◐ theme"`; click handler lives in site.js calling `SP.toggleTheme`.)
3. Motion button: creates `<button type="button" class="motion-btn">` containing `<span aria-hidden="true">`, appended to `.topbar-inner`.
4. `syncMotion()` logic (details in section 3).
5. Hero interface selector (section 4).
6. Firmware connection explorer (section 5).
7. Scroll reveal + offscreen visibility observers (section 3).

### 1b. IIFE 2: pixel art + 3D loader
Defines `window.SP` (merge: `window.SP = window.SP || {}`) and `SP.pixel`. Has its own `init()`:
- Module header LCD: if `.mod-header` with an `h1` exists, creates `<canvas class="lcd-art" width=128 height=64 aria-hidden="true">`, appended to `.mod-header`. Spec: `{title: "MODULE " + data-page.replace(/^m/,""), icon: ICONS[data-page] || "logo", lines: wrap(h1.textContent, 14).slice(0,3), anim: "scan", foot: first segment of `.mod-week` text split on "·" trimmed, right: "OK >"}`. Draws once (`lcd(c, spec, 0)`), then `setInterval` every 333 ms redraws with `performance.now()/1000` only if `animating()` (no `.motion-off` class on `<html>` and `!document.hidden`) and the canvas bottom is on-screen (`getBoundingClientRect().bottom > 0`). Note: `page` "m00" gives title "MODULE 00". Pages without `data-page` of the `mNN` pattern but with `.mod-header` fall back to icon "logo".
- ASCII art: every `[data-ascii="<spritename>"]` element gets `textContent = SP.pixel.ascii(name)`. Only usage: `index.html:552` `<pre class="ascii-art" data-ascii="flipper" aria-hidden="true">`.
- 3D loader: if any `[data-scene3d]` exists, injects `<script type="module" src="{root}assets/js/scene3d.js">` into `<head>` (section 6). This is the lazy-load gate: pages without scenes never download three.js.

## 2. SP.pixel: 5x7 font and sprite system

Exposed object: `window.SP.pixel = { FONT, SPRITES, MODES, text, sprite, arc, lcd, ascii, measure }`. Constants: `BG = "#f6a03a"`, `INK = "#1b1509"` (same as `--lcd-bg`/`--lcd-ink` in site.css). Canvas logical size always 128x64 (Flipper LCD). Rendering is `ctx.fillRect` per lit pixel, no smoothing needed; canvases are displayed with `image-rendering: pixelated`.

### Font (`FONT`)
- Glyph table is an inline string literal in presentation.js (not a separate file): entries separated by `|`, each entry `<char> <35 cells>` where cells are `#` (ink) or `.` row-major, 5 columns x 7 rows. `FONT[ch] = g.slice(2, 37)`.
- Characters defined: `0-9`, `A-Z`, and `. : - / % + < > ' , ! ? = ( ) *`. Lowercase is not defined; `text()` upper-cases input. Unknown chars render as blank but still advance the cursor (6 px per char at scale 1: 5 wide + 1 gap).
- A port must reproduce the glyph table byte-for-byte (copy the literal; the TypeScript port should keep it as a `const GLYPHS: Record<string,string>` or the same packed string and unit-test the 35-char length of every glyph).

### API
| Function | Signature | Behavior |
|---|---|---|
| `text` | `(ctx, str, x, y, s=1) -> endX` | Uppercases, draws each glyph with scale `s` using current `ctx.fillStyle`; advance `6*s`; returns x after last char. |
| `sprite` | `(ctx, name, x, y, s=1)` | Draws `SPRITES[name]` rows; missing name draws nothing. Rows may be ragged (different lengths); renderer iterates each row's own length. |
| `arc` | `(ctx, cx, cy, r, a0, a1)` | Plots 1x1 pixels along a circle, step `0.5/r` rad, rounded coordinates. Used for the "scan" radio-wave arcs. |
| `lcd` | `(canvas, spec, t)` | Draws one 128x64 frame (below). `t` in seconds; frame index `f = floor(t*3)` (3 fps animation). |
| `ascii` | `(name) -> string` | Converts a sprite to half-block Unicode: pairs of rows -> `█` (both), `▀` (top), `▄` (bottom), space; trailing whitespace trimmed per line, `\n` terminated. |
| `measure` | `(str) -> px` | `str.length*6 - 1` (text width at scale 1). Used by scene3d `label()`. |

### `lcd(canvas, spec, t)` frame layout (all coordinates in 128x64 px)
1. Fill BG; ink title text at (2,1); battery icon: ink rect (112,1,13x7), nub (125,3,1x3), BG interior (113,2,11x5), ink fill (114,3,8x3). Title rule: ink `fillRect(0,9,128,1)`.
2. Icon: `spec.icon` (default `"logo"`) sprite centred at x=15, y=30 (`15 - floor(w/2)`, `30 - floor(h/2)`).
3. Animation by `spec.anim`: `"scan"` draws up to 3 arcs radius `4+k*3` around `(15+iw/2, 30)` angles -0.9..0.9, hiding arc `k` when `(f+k)%3 === 2`; `"bars"` draws signal bars at x `28+k*3`, `k <= f%4`, heights `3+k*3`; no `anim` draws nothing (the loop condition still runs but arcs only draw when anim is not "bars"; note: with `anim` undefined arcs still draw—the non-bars branch is the default).
4. Content: if `spec.big`, draw big value at (38,15) scale 2 then `spec.unit` at `x+2, 22`; `spec.lines[]` each at x=38, y = `(big ? 34 : 17) + i*9`.
5. Footer bar: ink `fillRect(0,54,128,10)`; BG-coloured text `spec.foot` (+ animated "..." of length `f%4` when `spec.anim`) at (3,56); `spec.right` right-aligned at `128-3-6*len`.

### Sprites (`SPRITES`, strings of `#`/`.` rows joined by `|`, split to arrays at load)
17 sprites, size WxH: `logo 12x13`, `antenna 15x15`, `wave 16x5`, `pulses 16x5`, `key 9x12`, `tag 13x13`, `card 16x10`, `chip 13x11`, `ir 14x9`, `pins 17x5`, `usb 10x13`, `lock 11x11`, `flag 10x10`, `ibutton 13x11`, `tool 12x12`, `wifi 13x7`, `flipper 35x15`. (Widths are first-row widths; some sprites have ragged rows, preserve exact strings.)

`MODES` (hero/Flipper-screen presets, used by scene3d): 
- `subghz`: title SUB-GHZ, icon antenna, big 433.92 MHz, lines ["AM650  READ"], anim scan, foot SCANNING, right "OK >"
- `nfc`: NFC, card, 13.56 MHz, ["ISO 14443-A"], scan, READING
- `wifi`: WIFI, wifi, 2.4 GHz, ["ESP32-S2  CH 6"], anim bars, SCANNING

`ICONS` map (module page id -> sprite, internal to presentation.js IIFE 2, not exported): m00 logo, m01 antenna, m02 wave, m03 pulses, m04 antenna, m05 key, m06 tag, m07 card, m08 chip, m09 tool, m10 flag, m11 ir, m12 pins, m13 usb, m14 ibutton, m15 chip, m16 lock, m17 flag, m18 wifi.

### Who uses it
- Every module page `m00..m18` (all have `.mod-header` and `data-page="mNN"`): LCD header canvas via `init()`. Hidden under 720px (`.lcd-art {display:none}`).
- `index.html` ASCII flipper (`data-ascii="flipper"`).
- scene3d.js: `SP.pixel.text`, `.measure`, `.lcd`, `.MODES` (read at module top-level as `PX = window.SP && window.SP.pixel || null`; scene3d degrades to a default font width and skips LCD drawing if absent. Order requirement: presentation.js must have run before scene3d.js, guaranteed because presentation injects scene3d).
- Other legacy scripts that reference `window.SP` (site.js defines `SP.el`, `SP.toast`, `SP.state`, etc.) are out of scope here; presentation.js only sets `SP.reducedMotion` and `SP.pixel`.

## 3. Reveal and motion controls

- localStorage key: **`signalpath.motion`**, values `"paused"` | `"playing"` (anything else = playing). Read in try/catch at init; written in try/catch on button click.
- Effective `paused = motionPaused || reduced.matches`. `syncMotion()`: sets `SP.reducedMotion = reduced.matches`; toggles class **`motion-off`** on `<html>`; sets `.motion-btn` `aria-pressed=String(paused)`, `aria-label`/`title` (`"Animations paused by system preference"` if OS reduced motion, else `"Resume decorative animations"` when paused, else `"Pause decorative animations"`); `disabled = reduced.matches` (user cannot override the OS preference); glyph text `▷` when paused, `Ⅱ` when playing (initial markup glyph `◌`); when paused removes `.reveal-pending` from all elements so nothing stays hidden.
- Listens to `reduced` `change` event (guarded by `addEventListener` existence) to re-sync.
- `visibilitychange`: toggles class **`motion-suspended`** on `<html>` when `document.hidden`. CSS then pauses animations (`.motion-suspended *, .is-offscreen * { animation-play-state: paused !important }`).
- Reveal-on-scroll: `IntersectionObserver` (`threshold 0.08`, `rootMargin "0px 0px 35px 0px"`) over `.section-heading, .experience-card, .wifi-feature-inner, .mod-card, .closing-section, .firmware-explorer`. An element gets `.reveal-pending` (opacity 0, translateY(var(--motion-distance)=24px)) only if motion is on and its `getBoundingClientRect().top > window.innerHeight` at init (so above-the-fold content is never hidden); upon intersecting it gets `.reveal-visible` (transition opacity/transform `--motion-slow` 800ms `--motion-ease`) and `.reveal-pending` is removed, then unobserved. Elements added after init (e.g. mod-cards rendered by site.js later) are not observed (legacy limitation; a port should observe on mount).
- Accessibility rule: a document-level `focusin` handler removes `.reveal-pending` from the focused element's closest pending ancestor, so keyboard focus never lands on an invisible element.
- Offscreen pause: second `IntersectionObserver` (`rootMargin 100px`) toggles class **`is-offscreen`** on `.signal-stage, .board-scene, .experience-wave, .firmware-visual` (CSS pauses their animations).
- CSS motion tokens: `--motion-fast 180ms`, `--motion-normal 360ms`, `--motion-slow 800ms`, `--motion-ambient 6s`, `--motion-ease cubic-bezier(0.22,1,0.36,1)`, `--motion-distance 24px`.
- `.motion-off` CSS: kills all animation/transition (`!important`), reveal-pending forced visible, hover transforms removed on `.btn`, `.mod-card`, `.experience-card`. `@media (prefers-reduced-motion: reduce)` repeats the same plus `scroll-behavior:auto`. Print forces reveals visible and hides `.signal-orbit, .motion-btn, .signal-controls, .firmware-controls`.
- Keyframes: `device-float` (translateY 0 to -9px), `signal-radiate` (rotate(-10deg) scale .9 -> 1.15, opacity .1/.8/.05), `wave-breathe` (scaleY .65 <-> 1, opacity .7 <-> 1).
- scene3d.js integrates via `html.classList.contains("motion-off")` plus its own `reduced` media query, and a MutationObserver on `<html>` class changes (section 6).

## 4. Hero interface selector (home page only)

DOM contract (`index.html` lines ~49-115). A port must keep these hooks or reproduce the behavior in React state:
- Container `[data-signal-stage]` with attribute **`data-mode`** (`subghz` default | `nfc` | `wifi`), class `.signal-stage`, containing: three `.signal-orbit.orbit-one|two|three` (aria-hidden), `img.hero-device` (device.svg 920x460, `fetchpriority=high`), `.scene3d.hero-scene[data-scene3d="flipper"][data-opts='{"hero":true,"mode":"subghz"}']` with child `span.scene3d-caption "Drag to rotate"`, `.signal-readout[aria-live=polite]` containing `[data-signal-label]`, `[data-signal-frequency]` (inside `<b>`), `[data-signal-unit]`, `[data-signal-caption]`, `.signal-tag` ("Curiosity, connected." with `.status-dot`), `img.hero-board` (wifi-board.svg 600x460, `hidden` by default).
- Controls: `div.signal-controls[role=group][aria-label="Explore a device interface"]` with three `button[data-signal-mode="subghz|nfc|wifi"][aria-pressed]`; and `a[data-signal-link]` inside `p.visual-caption`.
- Mode data (exact copy, in presentation.js `signalModes`):
  - `subghz`: label "Sub-GHz · fixed-code lab", frequency "433.92", unit "MHz", caption "Discover what a remote is saying.", link `modules/01-frequency.html`, link text "Explore Sub-GHz →"
  - `nfc`: "NFC · contactless lab", "13.56", "MHz", "Understand identity and authentication.", `modules/07-nfc.html`, "Explore NFC →"
  - `wifi`: "Wi-Fi · optional ESP32-S2 board", "2.4", "GHz", "A separate radio. A new set of skills.", `modules/18-wifi-devboard.html`, "Explore the Wi-Fi Devboard →"
- Click behavior: sets `stage[data-mode]`; writes the four text fields; `stage.querySelector(".hero-board").hidden = mode !== "wifi"`; link `href = root + link`, text = title; sets `aria-pressed` on all three buttons.
- Cross-file coupling: scene3d.js `flipper` scene observes `stage[data-mode]` via MutationObserver (attributeFilter `data-mode`) and swaps the LCD preset and attaches/detaches the 3D devboard. The static `img.hero-device`/`img.hero-board` are hidden by CSS once the 3D model loads (`.signal-stage.has-scene3d .hero-device, .hero-board`) -> they are the no-WebGL / loading fallback (keep them in the port). If the 3D model fails, `.scene3d-failed {display:none}` hides the canvas host and the SVG remains.
- CSS: `.signal-stage` is 400px tall (330 <=760px, 285 <=480px), `max-width:960px`, `overflow:clip`, grid centered; `.signal-readout` absolute top-right glass card; `.signal-controls` pill segmented control (also styles `.firmware-controls`); `[aria-pressed="true"]` = raised surface.

## 5. Firmware connection explorer (module 18 only)

`modules/18-wifi-devboard.html` lines 60-120.
- Root `.firmware-explorer[data-firmware-explorer]` (reveal-observed). Children: `p.eyebrow` "Follow the connection", `h2` "Same board. Different roles.", `.firmware-visual` (`.signal-orbit` + `img wifi-board.svg`), `.firmware-controls[role=group][aria-label="Choose the board’s role"]` with `button[data-firmware-mode="debug|marauder|custom"][aria-pressed]` labelled "Debugging", "Marauder", "Your firmware"; `.firmware-flow` with three `.firmware-node` (each `<span>` kicker, `<b>` title, `<small>` mono detail) separated by two `span.flow-arrow` "→" (aria-hidden); `p.firmware-explanation[aria-live=polite]`; `p.visual-caption` "Concept diagram · Illustrations are not a wiring reference."
- Behavior: click replaces the 3 nodes' `span/b/small` text and the explanation; sets `aria-pressed`. Data (`firmwareModes`, exact):
  - `debug`: nodes [HOST | Computer | Debugger / USB or Wi-Fi], [BOARD | Black Magic probe | ESP32-S2 / SWD], [TARGET | Flipper Zero | Firmware under test]; explanation: "The computer controls the debugger. The board translates that connection into SWD, so you can pause the Flipper, inspect state and step through code. CMSIS-DAP is the USB-only alternative."
  - `marauder`: [CONTROLLER | Flipper companion | .fap app / UART], [BOARD | Marauder firmware | ESP32-S2 / 2.4 GHz], [LAB TARGET | Your access point | Wi-Fi frames]; "The Flipper app sends commands over UART. Marauder on the board operates the Wi-Fi radio. Installing the app alone does not install the board firmware, and the S2 has no Bluetooth radio."
  - `custom`: [BUILD HOST | ESP-IDF tools | Build / USB flash], [BOARD | Your program | ESP32-S2 firmware], [YOUR INTERFACE | Lab service | Define its protocol]; "Compile an ESP32-S2 application and flash it to the board. You define its network or serial behavior. A Flipper client needs a matching protocol; it does not appear automatically."
- Always dark panel (`#141416` bg, `#f5f5f7` text, accent `#ffab73`) regardless of theme; `.firmware-explanation min-height:4.8em` (0 under 480px) to prevent layout shift; flow becomes 1 column with arrows rotated 90deg under 480px. Print: white bg, black text.

## 6. scene3d.js

Single ES module (`type="module"`), `import * as THREE from "./vendor/three.module.min.js"`. Vendored bundle: three.js r186 (`var yp="186"`), MIT (`vendor/three.LICENSE`, (c) 2010-2026 three.js authors), 787 KB minified, **custom build that also exports `GLTFLoader`** (minified export alias `Ed as GLTFLoader`; the code calls `new THREE.GLTFLoader()`). A port using npm `three` must import `GLTFLoader` from `three/examples/jsm/loaders/GLTFLoader.js` and tree-shake.

### Lazy loading
- presentation.js injects the module only when `[data-scene3d]` exists. Inside, an `IntersectionObserver` (`rootMargin 120px`) over all `[data-scene3d]`: first time a host intersects, `mount(host)` creates the WebGL renderer and stores `host.spScene`; subsequently `inst.visible` toggles and `inst.kick()` restarts the rAF loop. The render loop stops when offscreen, `document.hidden`, or (motion off AND no pending drag easing).
- GLB is loaded once and cached (`flipperPromise`), cloned per scene instance via `src.clone()` (materials cloned too).
- Global listeners: `visibilitychange` -> kick all visible; `MutationObserver` on `<html>` `class` -> kick all (reacts to `motion-off` toggles); `reduced` change -> kick all.

### Host DOM contract
`<div class="scene3d [hero-scene]" data-scene3d="<name>" data-label="<aria-label>" data-opts='<JSON>'><span class="scene3d-caption">…</span></div>`
- `data-opts` JSON parsed in try/catch (invalid = `{}`).
- Canvas appended to host with `tabIndex=0`, `role="img"`, `aria-label = data-label` (default "Interactive 3D illustration. Drag or use arrow keys to rotate.").
- Classes added to the host: `scene3d-ready` (renderer created), `scene3d-model` (GLB loaded), `scene3d-failed` (no WebGL or GLB error; CSS `display:none`). Parent gets `has-scene3d` (hides the fallback `<img>` in `.signal-stage` and `.board-scene`).
- WebGL failure is caught (`try { new THREE.WebGLRenderer(...) } catch`) -> `scene3d-failed`.

### Renderer / scene setup (per mount)
`WebGLRenderer({antialias:true, alpha:true, powerPreference:"low-power"})`, pixel ratio `min(devicePixelRatio,2)`, `outputColorSpace=SRGB`, `ACESFilmicToneMapping`. `PerspectiveCamera(fov 30, near .05, far 60)`. Lights: `HemisphereLight(0xffffff,0x38414f,0.7)`, key `DirectionalLight(0xffffff,1.8)` at (3,5,6), rim `0xff8a34` 0.9 at (-5,2,-4), fill `0xbfd7ff` 0.7 at (-4,-2,5). Environment: `studioEnv()` builds a small PMREM scene (4 emissive planes on `0x1c232c`) with `environmentIntensity 0.55`. Scene units: 1 = 20 mm (`MM = 0.05`).
Per-scene API object: `{rig, scene, camera, host, opts, fitWidth, elev, tilt, sway(0.22), kick, resize}`; scene factory returns `update(t, animate)`.
Camera: `resize()` sets size from host client box (fallbacks 320x180), distance `max(fitWidth/2/tan(fov/2)/aspect, 2.5)`, height `elev`, looks at origin. ResizeObserver on host.
Frame: `dt` capped 0.05; time advances only when animating; yaw/pitch easing factor 0.15; `rig.rotation = (pitch + tilt, yaw + sin(t*0.45)*sway when animating, 0)`.

### Input rules (never captures vertical scroll)
- CSS: `.scene3d canvas { touch-action: pan-y; cursor: grab }` so vertical touch scroll passes to the page and only horizontal drags rotate on touch.
- Pointer: `pointerdown` records start and `setPointerCapture`; `pointermove` while down: `tYaw += dx*0.008`, `tPitch = clamp(tPitch + dy*0.006, -0.7, 0.7)`; release on `pointerup/pointercancel/lostpointercapture`. No wheel handler (page scroll never hijacked).
- Keyboard (canvas focusable): Arrow keys only: Left/Right yaw ∓/±0.25, Up/Down pitch ∓/±0.2 (clamped ±0.7); `preventDefault` only for those four keys, so Tab/Space/PageUp/PageDown still scroll/move focus.
- Reduced motion / motion-off: ambient sway/bob stop but drag and key rotation still work (loop runs while easing).

### Shared helpers
`canvasTex(c,pixel)` (SRGB; `pixel` -> Nearest mag filter, no mipmaps), `label(text,{scale,size,bg,color})` camera-facing `Sprite` rendering text with `SP.pixel.text` into a canvas (default bg `rgba(9,15,26,0.82)`, ink `#ff8a34`, `depthTest:false`, `renderOrder 5`), `tube(n,radius,color,glow)` dynamic 6-sided tube geometry with `.set(points)` updated per frame, `rings(count,{color,max,period,alpha,thick,flat})` expanding fading torus rings with `.tick(t)`, `shadow(w,h)` radial-gradient blob, `lcd(w,h,spec)` 128x64 canvas-textured plane (`MeshBasicMaterial`, `toneMapped:false`) with `.tick(t,force)` redrawing via `SP.pixel.lcd` at 3 fps and `.spec` mutable. Palette consts: `ORANGE 0xff7a2f`, `CYAN 0x3fd8d2`, `GREEN 0x55d08d`, `RED 0xff6a86`; materials GOLD (0xd9a441 metal), SILVER (0xc9ced2), BLACK (0x1a1c20).

### GLB model: `assets/models/flipper-zero.glb` (558,328 bytes)
- glTF 2.0 from Blender I/O v5.2.40; one node/mesh `flipper-zero-body-3d`, 3 primitives/materials: `body` (0.92,0.92,0.90; rough .55), `accent` (1.0,0.35,0.05 orange), `glass` (0.08,0.06,0.04; rough .25); vertex count 15,220 + 1,576 + 576; all `doubleSided`. Geometry bounds in file: x -33.6..6.5, y -23.0..2.55, z -76.3..24.0 (units mm).
- License: `LICENSE-flipperzero-3d-models` is GPL-3.0 (35 KB full text), derived from the official Flipper Devices STL body models. **Legal flag for the commercial port**: a paid course that ships this GLB must comply with GPL-3.0 for the model asset (source/attribution) or replace it with an original model. Document in the licensing decision log.
- Orientation: STL frame (y = length, x = width, z = front) -> Y-up GLB -> screen frame via quaternion from matrix `[0,0,-1; -1,0,0; 0,1,0]`; recentred with `position.set(-26.14,-13.55,10.2)`; group scaled by `MM`. Materials cloned; `roughness` set to 0.25 for `glass`, else 0.5.
- LCD texture: `flipperLcd(spec)` is the 128x64 canvas plane sized 36.7 x 18.35 mm at `(-6.64, 3.95, 12.5)` in the model's local frame (2:1, 1 mm inset in the screen window), parented to the model wrapper so it rotates with it. Contents come from `SP.pixel.lcd(canvas, spec, t)` (spec = copy of `SP.pixel.MODES[opts.mode || "subghz"]`), 3 fps animation, pixel-art crisp.
- Load failure -> `.catch(() => host.classList.add("scene3d-failed"))`.

### Scenes (`data-scene3d` names; 9 scenes)
All procedural except `flipper`/`devboard{attach}` which load the GLB. `fitWidth/elev/tilt` = camera framing.

| Name | Draws | Options (`data-opts`) | Used on |
|---|---|---|---|
| `flipper` | GLB body + animated LCD (+ expanding orange signal rings, soft shadow, gentle bob). Hero variant adds Wi-Fi devboard standing on the GPIO edge when mode=wifi | `hero` (bool: wider framing 8, attaches devboard, binds to `[data-signal-stage] data-mode`), `mode` ("subghz"/"nfc"/"wifi", default subghz) | `index.html` (hero), `modules/00-setup.html` |
| `devboard` | Procedural ESP32-S2 Wi-Fi Devboard (official 67.34x20 mm outline extrude, WROVER can, antenna, LEDs (orange blinks), BOOT/RESET buttons, USB-C, 8+10 gold pins at 2.54 mm, cyan wave rings) with pixel labels "ESP32-S2 · 2.4 GHZ", "USB-C", "8 + 10 PINS · 2.54 MM", floating + sway | `attach` (bool: shows the board standing on the GLB Flipper's GPIO edge with Wi-Fi LCD and label "STANDS ON THE 18-PIN GPIO EDGE · PINS GO 6 MM IN") | `index.html` (`.board-scene`, standalone), `modules/18-wifi-devboard.html` (`{"attach":true}`) |
| `carrier` | Two (or `opts.bands`) travelling sine carriers as tubes, masts, wavelength bars proportional to 300/f, rings; labels "315 MHZ · λ ≈ 95 CM" style (λ replaced by "WAVELENGTH", ≈ by "=") | `bands`: `[[freqMHz,"LABEL"],…]` (default 315 and 433.92) | `modules/01-frequency.html` |
| `modulation` | OOK vs FSK waveforms driven by the same scrolling bit blocks (bits 10110010) | none | `modules/02-modulation.html` |
| `pulses` | Pulse-train tube (long/short highs) with bit blocks and labels "HIGH (CARRIER ON)", "LOW (SILENCE)", "1 = LONG-SHORT 0 = SHORT-LONG TE = 400 US" | none | `modules/03-protocols.html` |
| `rolling` | Remote and receiver boxes; 8 s loop of three events: counters 0042 accepted, 0043 accepted, replay of 0042 rejected (green/red LED, flying packet label, status text) | none | `modules/05-raw-and-rolling.html` |
| `nearfield` | Reader coil torus, tag moving in/out of range with dashed field lines, labels change between "FIELD POWERS THE TAG…" and "OUT OF RANGE · NO POWER, NO ID" | `kind`: `"card"` (13.56 MHz ISO 14443 card) or anything else = 125 kHz EM4100 key fob | `modules/06-rfid.html` (fob), `modules/07-nfc.html` (card) |
| `infrared` | IR LED remote, 38 kHz burst dots (InstancedMesh, 96 spheres, pattern "1101001110100101"), receiver with output LED, cone, labels "IR LED · 940 NM", "38 KHZ BURSTS = MARK · GAPS = SPACE" | none | `modules/11-infrared.html` |
| `gpio` | 18-pin GPIO edge (8+10) with 5V/PA7/GND/3V3 labels, teaching circuit PA7 -> 1 kΩ -> LED -> GND with moving charge particles, LED glow toggling each 1 s, label "I = (3.3 V - 2 V) / 1 KOHM = 1.3 MA" | none | `modules/12-gpio.html` |

Scene registry keys: `flipper, devboard, carrier, modulation, pulses, rolling, nearfield, infrared, gpio` (9). Unknown names are ignored.

Note: `tilt`/`sway` defaults: tilt 0, sway 0.22; per-scene overrides: devboard standalone sway 0.35.

### Page captions / ARIA
Each host carries a `.scene3d-caption` (e.g. "Concept animation · drag to rotate", "Official body model · drag to rotate", "Concept model · drag to rotate") and a descriptive `data-label`. Port: keep both as props (`caption`, `label`).

## 7. Images (`legacy/assets/images/`)
- `signal-path-logo.png`: 1254x1254 RGBA, 698,618 bytes, displayed at 29x32 in the topbar (via JS swap), 96x96 in the closing section, favicon alternative `assets/favicon.svg` (64x64 rounded dark square with orange wave strokes, `#0D1119` / `#FF8A34`). Port: ship an optimized WebP/AVIF plus SVG, never serve 700 KB for a 29 px logo.
- `device.svg` (920x460): stylized Flipper illustration, orange LCD reading "SIGNAL PATH / LAB READY", used as hero fallback (`.hero-device`, `fetchpriority=high`) and loaded eagerly.
- `wifi-board.svg` (600x460): concept ESP32-S2 board illustration (title: "not a pinout"), used in hero (`.hero-board`, hidden unless wifi mode), index `.board-scene` (lazy), and module 18 explorer. 
- Both SVGs include inline `<title>`; alt texts are set in HTML.

## 8. Design tokens (effective values)

Fonts: legacy `site.css` declares Archivo / Public Sans / IBM Plex Mono but **no @font-face or font link is loaded**; `presentation.css` overrides to system stacks: `--font-display/--font-body: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`; `--font-mono: "SFMono-Regular", Consolas, "Liberation Mono", monospace`. Effective rendering = system fonts ("No external font dependency").

Theme mechanism: `<html data-theme="light|dark">` set by an inline head script from localStorage key **`signalpath.theme`** (`light`/`dark`; absent = follow OS `prefers-color-scheme`); site.js `SP.toggleTheme`, `SP.effectiveTheme`, dispatches `sp:theme` event. Dark applies via `:root[data-theme="dark"]` or `@media (prefers-color-scheme: dark){:root:not([data-theme="light"])}`. `color-scheme` set to light/dark. Port: keep the key name to preserve user preference, plus the pre-paint inline script to avoid flash.

### Effective colour tokens (presentation.css value wins; site.css value shown when presentation does not override)
| Token | Light | Dark |
|---|---|---|
| `--bg` | #f5f5f7 | #080809 |
| `--surface` | #ffffff | #151517 |
| `--surface-2` | #f5f5f7 | #1b1b1e |
| `--surface-3` | #ebebed | #242427 |
| `--line` | #e0e0e4 | #303034 |
| `--line-strong` | #c9c9ce | #48484e |
| `--text` | #1d1d1f | #f5f5f7 |
| `--muted` | #626267 | #aaaab0 |
| `--faint` | #707076 | #9b9ba3 |
| `--orange` | #bf4800 | #ff934f |
| `--orange-ink` | #a63e00 | #ffab73 |
| `--orange-soft` | #fff0e6 | #392116 |
| `--btn-primary-bg` | #bb4400 | #ff8a42 |
| `--btn-primary-ink` | #fff | #221309 |
| `--cyan` | #0C8F8A | #3FD8D2 |
| `--cyan-soft` | rgba(12,143,138,.10) | rgba(63,216,210,.12) |
| `--red` | #C7364F | #FF6A86 |
| `--red-soft` | rgba(199,54,79,.09) | rgba(255,106,134,.11) |
| `--green` | #23875A | #55D08D |
| `--green-soft` | rgba(35,135,90,.10) | rgba(85,208,141,.12) |
| `--yellow` | #B4801A | #F0C25A |
| `--yellow-soft` | rgba(180,128,26,.12) | rgba(240,194,90,.13) |
| `--purple` | #6B4FBB | #A48CF0 |
| `--purple-soft` | rgba(107,79,187,.10) | rgba(164,140,240,.13) |
| `--shadow` | 0 4px 24px #00000004 (presentation) | 0 1px 2px rgba(0,0,0,.4), 0 10px 30px rgba(0,0,0,.35) (site; presentation's light value is NOT overridden in dark) |
| `--shadow-lift` | 0 16px 42px #0000000c | 0 2px 8px rgba(0,0,0,.45), 0 20px 50px rgba(0,0,0,.5) |

Note the cascade quirk: in dark mode `presentation.css` does not reset `--shadow*`, but `site.css` dark block defines them with the same selectors and loads earlier; because `presentation.css` `:root {--shadow}` has lower specificity than `:root[data-theme="dark"]` the site.css dark shadows win in explicit dark mode, but in OS-dark (`:root:not([data-theme="light"])`, specificity higher than plain `:root`) they also win. Preserve by defining dark shadows once.
The same applies to the light-theme `site.css` originals that presentation replaced (old light values for reference: bg #EFF1ED, surface-2 #F6F7F3, surface-3 #E9EBE5, line #DCDFD8, line-strong #C7CBC1, text #191E24, muted #565F6B, faint #6E7682, orange #D9540A, orange-ink #B84406, orange-soft rgba(217,84,10,.10), btn #B84406; dark: bg #0D1119, surface #141A25, surface-2 #1B2331, surface-3 #232D3D, line #29323F, line-strong #3A4657, text #E8EDF4, muted #9BA8B9, faint #8794A6, orange #FF8A34, orange-ink #FFA45C, orange-soft rgba(255,138,52,.13), btn #FF8A34 with ink #1B1509). These are superseded by the Apple-like neutral palette above.

Theme-independent tokens (site.css only): `--lcd-bg #F6A03A`, `--lcd-ink #1B1509`, `--scope-bg #0B1220`, `--scope-grid #1B2A44`, `--scope-trace #3FD8D2`, `--scope-peak #FF8A34`, `--scope-text #9BB3D1` (instrument screens dark in both themes).
Shape/space: `--radius 22px` (site.css 14px), `--radius-sm 14px` (site.css 9px); motion tokens in section 3.
Hard-coded dark-panel colours (not tokens, should become tokens): `#141416` (dark feature/explorer/wave cards), `#f5f5f7`, `#aaaab0`, `#ffa467`, `#ffab73`, `#ff8a42`, `#221309`, `#29292d`, `#3b3b40`, `#efeff3`, `#37373d`, `#bdbdc5`, code blocks `pre {background:#17171b;color:#ececf1}`, scene3d bg `radial-gradient(120% 90% at 50% 0%, #17233a, #0b1220 70%)`, caption `#9bb3d1`, status green `#25865a`/`#2c8558`.
Type scale: h1 `clamp(34px,6vw,56px)` w800 (presentation: weight 650, tracking -0.045em, line-height 1.04); landing h1 `clamp(44px,6.5vw,86px)` w700; h2 `clamp(24px,4vw,32px)` (content h2 `clamp(27px,4vw,38px)`, section-heading h2 `clamp(38px,5vw,60px)`); h3 20px; body 16px/1.62 (content 1.75), base tracking -0.012em; `.lede clamp(17px,2.2vw,20px)` (module lede 21px/1.45); `.eyebrow` 12px w600 tracking .055em (site: mono 11.5px uppercase .18em, overridden); `p` max-width 68ch (content 72ch). Breakpoints in use: 1100, 980, 900 (page grid), 860/760/720/640/600/480.

## 9. Layout primitives and component mapping

| Class | Definition / intent | Suggested port (Astro/React + Tailwind + shadcn) |
|---|---|---|
| `.wrap` | Centered container, max 1200px (site 1080), inline padding 32px (22 <=760, 18 <=480). `.wrap-narrow` 820px. | `Container` component / `mx-auto max-w-[1200px] px-8` |
| `.topbar` / `.topbar-inner` / `.brand` / `.topnav` / `.nav-toggle` / `.theme-btn` / `.motion-btn` / `.nav-progress` | Sticky blurred header (blur 22px, saturate 160%, z 40). Built at runtime by site.js (`header.topbar` is empty in HTML). Circular 40px icon buttons. Nav collapses to dropdown (`.topnav.open`) <=980px; `.nav-progress` mini progress bar currently `display:none`. Skip link `.skip-link` injected before `<main id>`. | `SiteHeader` (React island for theme/motion/menu); shadcn `Button size="icon"`, `Sheet` or `DropdownMenu` for mobile nav |
| `.page` | Two-column grid `220px minmax(0,1fr)`, gap 44px, max 1080px, collapses to 1 column <=900px. `main.page:has(> .content:only-child)` becomes single column max 850/930px, padding-top 64px. | `CourseLayout` (grid) with `Toc` + `Content` slots |
| `.toc` | `aside[aria-label="On this page"]`, sticky top 72px; `ol` of anchor links; active link `.active` (orange left border, orange-soft bg) set by site.js scrollspy; `.toc-next` footer; on <=900px becomes bordered static card. | `TableOfContents` with IntersectionObserver scrollspy; shadcn `ScrollArea` optional |
| `.content` | `article`, `min-width:0`, line-height 1.75, `section` scroll-margin-top 76px, `section + section` top border, h2 margin-bottom 20px; `> nav.card` is the in-page quick-link row (transparent, top/bottom hairlines, line-height 2.2). Prose width 72ch. | MDX prose wrapper (`@tailwindcss/typography` customized) |
| `.mod-header` | Module hero: flex row, `.mod-index` 60px rounded square (orange-soft, 48px <=480), `.mod-titles` (`.mod-week` kicker, `h1`, `.lede`, `.mod-meta` chips), plus JS-appended `canvas.lcd-art` (192x96, pushed right, hidden <=720px). | `ModuleHeader` React component rendering `<PixelLcd/>` |
| `.callout` + `.note` `.tip` `.warn` `.legal` `.story` | Grid `auto 1fr`, radius 18px, tinted bg + border from the semantic colour (note=cyan, tip=green, warn=yellow, legal=red, story=purple). Markup: `<span class="ic">` glyph + `<div><span class="callout-title">Title</span>body</div>`. Usage counts: note 18, tip 14, legal 10, warn 8, story 5. | `Callout variant="note|tip|warn|legal|story"` (shadcn `Alert` variants, mapped to MDX `<Callout>`) |
| `.lab` | Hands-on lab block: surface card with 4px orange left border, `.lab-kicker` (mono uppercase), `h3`, `.lab-gear` line, ordered steps, inline `.flip` menu-path tokens (orange mono, `white-space:nowrap`, wraps <=600px). | `Lab` MDX component (`gear`, `steps`) |
| `.win` | "You've got it when" success box: green-soft flex with `✓` `.ic`. | `Checkpoint` / `SuccessCriteria` component |
| `.card` (`.flat`, `.tight`) | Surface, 1px line border, radius 22px, padding 20x22, shadow removed by presentation. | shadcn `Card` |
| `.grid2` / `.grid3` | 2/3-column grids gap 16px, margin-bottom 1.4em; 1 column <=760, grid3 -> 2 col 761-980. | Tailwind `grid md:grid-cols-2` / `lg:grid-cols-3` |
| `.pill` + `.am/.orange .fm/.cyan .fixed/.green .rolling/.red .yellow .purple .grey` | Mono 11px tag, radius 6px, semantic tint. Domain aliases: am=orange, fm=cyan, fixed=green, rolling=red. Usage counts: grey 29, am 14, rolling 12, fm 10, fixed 10. | shadcn `Badge` with `variant` incl. domain aliases |
| `.chip` / `.chips` | Rounded-full pill, border line, 12px body font, `b` strong value (module meta: time, gear, transmit status). | `Chip`/`Badge variant="outline"` |
| `.table-scroll` | Wrapper `overflow-x:auto`, border, radius 18px, `table min-width:520px`; thead mono-ish uppercase 11px; zebra rows; `caption` styled; `tbody th` row headers min-width 140px. | `DataTable` / shadcn `Table` inside scroll container |
| `figure.diagram` | `role="img"` + `aria-label` on figure holding inline SVG; surface card, padding 16, `overflow-x:auto`; `figcaption` mono 12.5px faint. 9 uses. | `Diagram` component wrapping SVG + caption |
| `.btn` (`.primary .ghost .small .mono`) | Pill buttons (radius 999, min-height 44, press scale .98, hover lift 1px). | shadcn `Button` variants |
| `.seg` | Segmented control `aria-pressed`. `.signal-controls`/`.firmware-controls` pill-shaped variants. | shadcn `ToggleGroup type="single"` |
| `.widget`, `.widget-head/body/foot/controls`, `.scope`, `.lcd` | Interactive lab widget shell, dark scope canvas (`--scope-*` tokens), orange LCD block. | `WidgetShell` React component |
| `.mod-map` / `.mod-card` / `.experience-*` / `.wifi-feature-*` / `.course-facts` / `.story-section` / `.closing-section` | Home page sections; mod-map 3 cols (2 <=760, 1 <=480); cards radius 24-32px, hover lift, `.done` state green. Revealed on scroll. | Astro home sections + `ModuleCard` |
| `.quiz` `.q` `.opt` | Quiz question card and options (`.correct/.wrong`); `[data-page="quiz"] .btn-row` special grid. | Quiz island |
| `.pager`, `.site-footer`, `.toast`, `#sp-confetti`, `.progress-card`, `.bar`, `.badge(s)`, `details/summary`, `.steps`, `.kv`, `.facts/.fact` | Supporting primitives defined in site.css (see file). | respective shadcn components |

Print styles: site.css hides `.topbar, .toc, .pager, .mod-complete, .site-footer, .theme-btn`, single-column, white bg; presentation.css adds reveal/orbit/controls handling above.

## 10. Must-preserve checklist for the port
1. Keys: `signalpath.motion` (paused|playing), `signalpath.theme` (light|dark|absent). (`signalpath.v2` progress state belongs to site.js.)
2. `<html>` classes `motion-off` and `motion-suspended`, `is-offscreen` on animated blocks; `SP.reducedMotion` flag.
3. The 5x7 glyph table, 17 sprites, `MODES`, `ICONS`, LCD layout coordinates and 3 fps animation.
4. Hero selector data and the `data-mode` link to the 3D scene; static SVG fallbacks.
5. Firmware explorer data strings and aria-live behaviors.
6. 3D: lazy mount via IntersectionObserver (120px), render only when visible and tab visible, `touch-action: pan-y`, no wheel capture, arrow-key rotation only, WebGL failure fallback to static content, GLB loaded once.
7. Reveal rule: never hide above-the-fold or focused elements; honour OS reduced-motion with a disabled toggle.
8. Accessible names: canvas `role=img` + `data-label`; LCD canvases and ASCII art are `aria-hidden`.
9. GPL-3.0 model licence (`legacy/assets/models/LICENSE-flipperzero-3d-models`) and MIT three.js notice must ship with any build that includes those assets.
10. Fix-ups worth making in the port (not present in legacy): load real webfonts or keep system stack deliberately; observe dynamically added reveal targets; replace 700 KB logo PNG; convert hard-coded dark-panel colours to tokens.
