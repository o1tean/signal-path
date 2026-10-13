# 3D scenes (`<Scene3D>`)

Ported from `legacy/assets/js/scene3d.js` to npm `three@0.186`. Files:

- `index.ts`: runtime. One WebGL renderer per host, render loop, input, fallback, cleanup. Exports `SCENES` (read by `scripts/check-content.ts`, keep it a one-line array) and `mount`.
- `scenes.ts`: the nine scene builders. Each adds objects to `api.rig` and returns `update(t, animate)`.
- `kit.ts`: shared pieces (pixel labels, tubes, rings, LCD plane drawn with `src/lib/pixel.ts`, GLB loader, devboard, studio lighting, `disposeTree`).

## Usage

```mdx
<Scene3D name="nearfield" opts={{ kind: 'card' }} caption="Concept animation · drag to rotate" label="Reader coil powering an NFC card." />
```

The name must also be listed in the lesson's `scenes` frontmatter. `label` becomes the canvas `aria-label` (default: "Interactive 3D illustration. Drag or use arrow keys to rotate."). `caption=""` hides the caption.

## Behaviour

- **Lazy:** `src/widgets/registry.ts` mounts a host within 200px of the viewport and imports this folder (and three.js) on demand.
- **Pausing:** the loop stops when the host is offscreen (IntersectionObserver), when the tab is hidden, and while animation is not allowed (`animationAllowed()` from `@/lib/learner`: the site motion toggle or `prefers-reduced-motion`). Dragging and arrow keys still rotate while paused; the loop runs only until the easing settles.
- **Input:** pointer drag rotates (yaw, pitch clamped to ±0.7). The canvas is focusable; arrow keys rotate and only those four keys call `preventDefault`. `touch-action: pan-y` keeps vertical page scroll on touch. No wheel handler.
- **Fallback:** if WebGL cannot start, or the GLB fails to load, the stage shows a static view: `public/images/device.svg` for `flipper`, `public/images/wifi-board.svg` for `devboard`, a pixel LCD card for the rest.
- **Cleanup:** the function returned by `mount` stops the loop, removes listeners and observers, disposes geometries, materials, textures and the renderer, and loses the context.

Host attributes, for styling and tests:

| Attribute | Values |
|---|---|
| `data-scene-state` | `loading` (renderer up, model pending), `ready`, `fallback` |
| `data-scene-loop` | `on` while frames are being drawn, `off` when paused |

The parent of a ready host gets the class `has-scene3d` (legacy contract: hide a fallback image next to the scene).

## Scenes and options (`opts`)

| Name | Shows | Options |
|---|---|---|
| `flipper` | Official Flipper Zero body (GLB) with a live 128x64 LCD, signal rings, shadow | `mode`: `'subghz'` (default), `'nfc'`, `'wifi'` picks the LCD screen from `MODES` in `src/lib/pixel.ts`. `hero: true`: wider framing, the Wi-Fi Devboard is attached, and the scene follows `data-mode` on the closest `[data-signal-stage]` ancestor (wifi shows the board and hides the rings). `<Scene3D>` also renders a frameless 2:1 stage for `hero`. |
| `devboard` | Procedural ESP32-S2 Wi-Fi Devboard (official outline, can, LEDs, buttons, USB-C, 8 + 10 pins) | `attach: true`: the board stands on the GPIO edge of the GLB Flipper showing the Wi-Fi screen. |
| `carrier` | Travelling carriers with masts and wavelength bars (length proportional to 300/f) | `bands`: `[[freqMHz, 'LABEL'], ...]`, default 315 and 433.92 MHz. `λ` and `≈` in labels become `WAVELENGTH` and `=`. |
| `modulation` | OOK and FSK waveforms driven by the same scrolling bits | none |
| `pulses` | Pulse train (1 = long-short, 0 = short-long) with bit blocks | none |
| `rolling` | Remote and receiver, 8 s loop: 0042 accepted, 0043 accepted, replay of 0042 rejected | none |
| `nearfield` | Reader coil, tag moving in and out of range, field lines | `kind: 'card'`: 13.56 MHz ISO 14443 card. Anything else: 125 kHz EM4100 fob. |
| `infrared` | IR LED, 38 kHz burst dots, receiver with output LED | none |
| `gpio` | 18-pin GPIO edge, PA7 -> 1 kOhm -> LED -> GND with moving charge | none |

Home page hero:

```astro
<div data-signal-stage data-mode="subghz">
  <!-- buttons set data-mode to subghz | nfc | wifi -->
  <Scene3D name="flipper" opts={{ hero: true, mode: 'subghz' }} caption="Drag to rotate" label="3D model of the Flipper Zero. Drag or use arrow keys to rotate." />
</div>
```

## Model licence

`public/models/flipper-zero.glb` derives from flipperdevices/flipperzero-3d-models (GPL-3.0). The licence and a `NOTICE` sit next to it. It is a public asset and must never move behind the paywall.

## Checking

`/dev/scenes` (dev server only, 404 otherwise) shows every scene and option. `npx playwright test tests/e2e/scenes.spec.ts` runs against the shared dev server and saves screenshots to `docs/v2/screenshots/scenes/`.
