# Signal Path v2: 3D scenes track report

The nine legacy three.js scenes are ported to npm `three@0.186` under `src/widgets/scene3d/`, lazy-loaded by the widget registry, and wired into the home page hero and the three migrated lessons. The Flipper body is the official GPL-3.0 model as a GLB with its licence and `NOTICE` next to it. A dev-only gallery and a Playwright spec cover every scene and option.

__RESULT__

## Files

Created:

```
src/widgets/scene3d/index.ts      runtime: renderer per host, loop, input, fallback, cleanup; exports SCENES and mount
src/widgets/scene3d/scenes.ts     nine scene builders
src/widgets/scene3d/kit.ts        shared pieces: pixel labels, tubes, rings, LCD plane, GLB loader, devboard, studio env, disposeTree
src/widgets/scene3d/README.md     usage, options, behaviour contract, licence, how to check
src/pages/dev/scenes.astro        /dev/scenes gallery (404 outside astro dev): hero mode + 13 scene/option combinations
tests/e2e/scenes.spec.ts          gallery spec against the shared dev server
public/models/flipper-zero.glb    official body (558 KB)
public/models/LICENSE-flipperzero-3d-models, public/models/NOTICE
docs/v2/screenshots/scenes/*.png  one per gallery item, two hero modes, two fallbacks
```

Changed: `src/components/mdx/Scene3D.astro` (hero variant, `data-scene-stage`, `label`/`opts` props), `src/components/marketing/Hero.astro` (hero scene follows `data-mode` on `[data-signal-stage]`), `docs/v2/architecture.md` (the "3D scenes" open item now points here).

## What is ported

| Scene | Used by | Options |
|---|---|---|
| `flipper` | home hero (`hero: true`), `00-setup` | `mode: subghz / nfc / wifi`, `hero` |
| `devboard` | (Wi-Fi Devboard lessons, not yet migrated) | `attach: true` |
| `carrier` | `01-frequency` | `bands: [[MHz, label], ...]` |
| `modulation` | `02-modulation` | none |
| `pulses`, `rolling`, `nearfield` (`kind: 'card'`), `infrared`, `gpio` | lessons still to migrate | see README |

`scripts/check-content.ts` reads `SCENES` from `index.ts`, so an unknown `<Scene3D name>` or a name missing from a lesson's `scenes` frontmatter fails the content check.

## Behaviour contract (tested)

- Lazy: the registry mounts a host within 200 px of the viewport; three.js and the scene module load on demand.
- Pausing: the loop stops offscreen, on hidden tabs, under the site motion toggle and under `prefers-reduced-motion`. Drag and arrow keys still rotate while paused; the loop runs only until the easing settles.
- Input: pointer drag, arrow keys on the focusable canvas (only those four keys `preventDefault`), `touch-action: pan-y` so vertical page scroll survives on touch. No wheel handler.
- Fallback: no WebGL, or a GLB load failure, shows a static view (`device.svg`, `wifi-board.svg`, or a pixel LCD card) with `data-scene-state="fallback"`.
- Cleanup: the unmount function stops the loop, removes listeners and observers, disposes geometries, materials, textures, the environment and the renderer, and loses the GL context.
- Accessibility: the canvas has `role="img"` and the lesson-supplied `aria-label`; visible focus ring; captions in `<figcaption>`.

Host attributes: `data-scene-state` = `loading | ready | fallback`, `data-scene-loop` = `on | off`.

## Licence

`public/models/flipper-zero.glb` derives from flipperdevices/flipperzero-3d-models (GPL-3.0). `public/models/NOTICE` names the source, the licence file next to it, the changes made (STL to GLB in Blender, three flat materials) and states that the model is a public asset served to every visitor, never behind the paywall. The rest of the site is not a derivative of the model.

## Fixes made while verifying

- `index.ts`: `data-scene-loop` now flips to `on` as soon as a frame is scheduled (`kick`), not after the first frame renders. Under SwiftShader on a loaded machine the first frame of a scene can take seconds, during which the attribute read `off` and the loop spec failed.
- `scenes.spec.ts`: the first (hero) scene gets a 90 s ready timeout; it pays for the three.js import, the GLB and shader compilation. All other scenes keep 30 s.

## Notes for the orchestrator

- The spec runs against the shared dev server and never starts or stops it. It mocks the HMR WebSocket so other agents' file edits do not reload the page mid-run.
- Runs are slow and can time out when the machine is heavily loaded (load average 36 to 100 during this session); the failures seen were all timeouts, not scene errors. Re-run when load is lower.
- `test-results/` is shared between agents and gets cleaned on every run; the screenshots in `docs/v2/screenshots/scenes/` are the durable artifacts.
- Lessons not yet migrated (devboard, pulses, rolling, nearfield, infrared, gpio users) need `scenes:` frontmatter and a `<Scene3D>` when they are ported; the gallery already shows every option they will use.
