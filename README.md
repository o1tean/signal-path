# Signal Path

[Open the course](https://o1tean.github.io/signal-path/) · [Learning path](https://o1tean.github.io/signal-path/roadmap.html) · [Romanian lab guide](https://o1tean.github.io/signal-path/legal.html)

A self-paced Flipper Zero course from first setup to independent projects and authorized security research. Plain HTML, CSS and JavaScript; no application backend or runtime packages. System fonts keep pages fast and independent of external font services. Course progress and notebook entries stay in the browser; GitHub Pages serves the site.

- **19 modules** with a suggested twelve-week core path and optional Wi-Fi extension, concrete labs, explanations and evidence criteria.
- **116 quiz questions** with explanations and per-module best scores.
- **10 interactive learning tools** using synthetic signals, plus an atlas for lab observations.
- **A learning notebook** for predictions, findings, review dates and retrieval practice. JSON backup/restore moves progress, scores, badges, atlas and notes between browsers.
- **A small C application** in `examples/lab-companion`, built with the official uFBT toolchain.
- **Romanian references** from ANCOM and the Criminal Code, alongside primary Flipper and Microchip sources. Reviewed 10 September 2026; recheck changing requirements before a hardware lab.

The first eleven modules cover RF fundamentals, Sub-GHz, rolling codes, RFID/NFC, firmware literacy and an initial signal atlas. Modules 11–17 add infrared, GPIO, USB/BLE, iButton/U2F, app development, controlled security research and a reproducible final portfolio. Module 18 adds the optional official Wi-Fi Devboard: Black Magic/CMSIS-DAP, Marauder, captive portals, custom ESP-IDF development, recovery and a controlled AP lab. Official firmware is a supported starting point; community forks are optional.

The course explains dual-use mechanisms and defenses. Practical exercises use controlled, authorized equipment. Educational intent or device ownership does not replace permission, applicable radio conditions or data/privacy obligations. Completion badges are self-reported progress, not certification.

## Course product plan

The next version is a custom course sold through one-time access. The learning path groups the material into a starter, four core stages and an optional Wi-Fi extension. See [course structure and paid-launch plan](docs/course-plan.md) for outcomes, payment-provider comparisons, delivery boundaries and remaining decisions. **The current site is public; no paywall is active.**

## Visual design

An original Signal Path logo, graphite/white surfaces, warm orange accents, interactive 3D scenes (the official Flipper Zero body model, a procedural Wi-Fi Devboard and animated RF concepts, rendered with a vendored three.js module) and Flipper-style pixel art screens with an original 5×7 font. Motion respects system reduced-motion settings, has a persistent pause control, and pauses offscreen. No scroll hijacking or animation dependency. See [brand notes](docs/brand.md) for the generated logo prompt and asset paths.

## Run locally

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000/`. To check the actual project subpath, serve the parent directory and open `/signal-path/`.

## Validate and stage

Python 3.9+ and Node.js are sufficient; there are no site dependencies to install.

```sh
python3 scripts/check-site.py
node scripts/check-course.cjs
python3 scripts/build-site.py
```

The checks cover local links and fragments, duplicate IDs, JavaScript syntax, module routes and quiz integrity. `_site/` contains only public site files. Browser-based checks are described in [verification.md](docs/verification.md).

## GitHub Pages

The production URL is **https://o1tean.github.io/signal-path/**. The `Check and deploy course` workflow validates changes, stages the static files, and deploys from `main`. Pull requests run checks without deploying. Repository **Settings → Pages → Source** must be **GitHub Actions**. HTTPS is enabled; no custom domain is required.

A failed validation prevents deployment. The workflow can also be started with **Actions → Check and deploy course → Run workflow**. The 404 page uses `/signal-path/` asset and navigation paths, so it works for missing nested project URLs.

## Editing

- Course order, badges and stage checkpoints: `assets/js/data/course.js` (load before `site.js`).
- Questions and explanations: `assets/js/data/quiz-bank.js`.
- Lessons: `modules/`; add new modules to the catalog, its stage list, the static home map, sitemap and quiz bank. Roadmap links render from the catalog.
- Notebook, backups and resume links: `assets/js/learning.js`.
- Shared design tokens and responsive styles: `assets/css/site.css`.
- 3D scenes: `assets/js/scene3d.js` (add `<div class="scene3d" data-scene3d="name">` to a page); body model and licence in `assets/models/`; pixel font and sprites in `assets/js/presentation.js`.
- Primary sources and corrections: `sources.html`.
- Printable lab template: `downloads/lab-notebook.md`.

Do not commit credential dumps, actual key values, learner backups or personal captures. Course examples and screenshots should use synthetic identifiers and training aliases.
