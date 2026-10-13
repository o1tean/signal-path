# Widget contract

Widgets are vanilla TypeScript modules, one file per tool: `src/widgets/<id>.ts`. `wave-lab.ts` is the reference port.

## The module

```ts
import type { WidgetMount } from './types';

export const mount: WidgetMount = (el, opts) => {
  // build UI inside `el`, start listeners, observers, timers
  return () => {
    // cleanup: disconnect observers, clear timers, remove listeners, empty `el`
  };
};
```

- `el` is the host element. Replace its children; do not touch anything outside it.
- `opts` is the parsed `data-opts` JSON (`{}` when absent or invalid). The only legacy option is `mode: 'compact'`.
- Return a cleanup function. The registry stores it per host, and `unmountAll()` in `registry.ts` runs every cleanup.
- Throwing from `mount` is allowed. The registry catches it and shows "This interactive could not load." with the message.

## Mounting

- In MDX: `<Widget name="wave-lab" />` or `<Widget name="tune-in" opts={{ mode: 'compact' }} />`. The id must also be listed in the lesson's `tools` frontmatter (`npm run check:content` enforces both directions).
- In `.astro` pages: import `@/components/mdx/Widget.astro` and use it the same way.
- `Widget.astro` renders `<div data-widget="<id>" data-opts="…">` and a processed `<script>` that imports `registry.ts`. Astro bundles that script once per page, so any number of widgets per page share one registry. Hosts mount lazily when they come within 200px of the viewport.
- The registry discovers widgets with `import.meta.glob('./*.ts')`, so a new file is picked up without registration. Helpers belong in `lib/`, never at the top level of this folder.

## Rules

- Learner state only through `@/lib/learner` (`award`, `updateLearner`, `setAtlas`, the `$learner` store). No direct `localStorage`.
- Colours only from tokens via `cssVar('--scope-bg')` and friends in `lib/dom.ts`, or Tailwind token classes (`bg-scope-bg`, `text-muted-foreground`). Instrument screens use the `--scope-*` tokens, which are dark in both themes.
- Redraw on theme change with `onThemeChange(fn)` and include its cleanup.
- Canvas: use `fitCanvas(canvas, draw)` for hi-DPI sizing; call its `cleanup`.
- Keyboard: every control is a native `button`, `input` or `select` with a visible label or `aria-label`. Toggle groups use `aria-pressed`. Put the changing readout in an `aria-live="polite"` element and keep the canvas `role="img"` with an `aria-label` that describes the current state.
- Touch targets at least 44px (`min-h-11`).
- Motion: check `animationAllowed()` from `@/lib/learner` before running decorative animation loops, and stop loops when the host is off screen or the tab is hidden.
- Copy follows `docs/v2/copy-brief.md`: no em dashes, no exclamation marks.
- A widget with branching logic gets a unit test in `tests/unit/` for its pure helpers (see `wave-lab.test.ts`).

## Badges

Badges awarded by widgets (ids from `src/data/course.ts`): `tuned-in` (tune-in, streak of 5), `wave-rider` (wave-lab, first edit away from the default bits), `out-of-sync` (rolling-sim, first replay failure). Call `award(id)`; it is idempotent and fires the toast.

## Status

All ten tools are ported, one module each: flashcards, flipper-sim, pulse-decoder, rf-calc, rolling-sim, signal-atlas, spectrum-scope, tool-picker, tune-in, wave-lab. Every module must also be listed in `src/data/tools.ts` (`npm run check:content` enforces both directions). The 3D scenes live in `scene3d/` (see its README).
