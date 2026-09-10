# Signal Path visual identity

The visual direction uses generous space, system typography, graphite/white surfaces and warm orange signal accents. It takes inspiration from the clarity of premium product pages while using original course branding and illustrations. The course is independent of Apple and Flipper Devices.

## Assets

- `assets/images/signal-path-logo.png`: original generated brand mark, used in navigation, the homepage and favicon. Transparent PNG, 1254 × 1254 pixels. Generated with the built-in image-generation tool, then copied into this repository; no API/CLI fallback was used.
- `assets/images/device.svg`: original code-authored stylized handheld illustration.
- `assets/images/wifi-board.svg`: original code-authored board illustration. It is a concept graphic, not an authoritative pinout or assembly drawing.
- `assets/css/presentation.css`: shared visual and motion tokens, layouts and animations.
- `assets/js/presentation.js`: interface selector, firmware connection explorer, logo mounting, reveal behavior and motion controls.

The site references the committed repository assets; it does not depend on the original generation directory.

## Final generation prompt

> Create an original premium technology education logo symbol for a brand named Signal Path, a Flipper Zero and radio signals learning course. Generate ONLY the symbol, no typography and no mockup. Design an elegant continuous S-shaped signal path with two perfectly rounded terminal dots, geometric parallel wave curves suggesting radio propagation, simple memorable silhouette. Warm vivid orange #ff7a2f material, refined very subtle dimensional bevel and satin highlights, flat front-on orientation, crisp precise edges, sophisticated industrial design. Center the symbol large with 12 percent safe margin in a square composition. A genuinely transparent background with alpha, no background rectangle, no drop shadow outside the symbol. Must remain legible at favicon size. No Apple logo, no dolphin, no copied logos, no extra text. Intended as a polished standalone website brand asset.

## Motion behavior

Ambient device motion and signal rings use transform and opacity. Scroll reveals run once; content is available without JavaScript and is revealed immediately on keyboard focus. Animations pause outside the viewport and when the tab is hidden. A persistent control pauses decorative animations; the system reduced-motion preference takes priority. Interactive learning tools retain their own controls.

No scroll interception, external font service, animation framework or runtime dependency was added.
