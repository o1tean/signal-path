# Verification — 10 September 2026

The course was tested as a GitHub project site under `/signal-path/`, not only at a domain root.

## Automated site checks

- `python3 scripts/check-site.py`: 31 HTML pages; local targets and fragments, duplicate IDs, one page heading, and inline/external JavaScript syntax.
- `node scripts/check-course.cjs`: 19 module routes, quiz mounting declarations and 116 valid questions/answer indexes.
- `python3 scripts/build-site.py`: stages only public content; excludes repository metadata, browser artifacts, local notebooks and app build caches.
- `git diff --check`: no whitespace errors.

## Browser checks

Playwright Chromium opened all 30 pages with no page-level JavaScript errors. Every declared widget mounted, and every module displayed its quiz.

The notebook was exercised through its visible form: save/reload, module switching, retrieval recording, JSON download and restore, and an invalid import that preserved existing notes. Quiz scoring and completion survived reload. Mobile navigation opened, Escape closed it, and theme selection survived reload.

Ten representative pages (home, roadmap, notebook, legal, IR, GPIO, app development, security lab, final project, playground) were checked at 320, 390, 768 and 1280 CSS pixels. None produced document-level horizontal overflow. Desktop home and light/dark mobile roadmap screenshots were visually inspected.

These checks do not constitute a complete accessibility audit or validation of every physical lab.

## Flipper example

`examples/lab-companion` compiled with uFBT **0.2.6**, official release SDK **1.4.3**, target **7**, API **87.1**. The build produced a `.fap` and passed the SDK's application check.

No physical Flipper was connected for this work. On-device launch, Back-button behaviour, electrical circuits, radio experiments and access-reader behaviour remain hardware checks for the learner. The course explicitly separates a successful build from runtime evidence.

## Content review

Primary Flipper documentation was used to correct firmware assumptions, frequency/preset descriptions, RAW representation and interface behaviour. Microchip's HCS301 documentation supports the explanation of forward synchronization windows. The legal page links ANCOM's current interface index, the linked RO-IR SRD-01 edition 5/2025, and the Romanian Criminal Code. Some legislative portal requests were intermittently unavailable; the course provides the canonical act link and asks readers to check the current consolidated text.

This is a course-content review, not a legal opinion or certification of a particular hardware setup.

## Wi-Fi module and visual redesign — 10 September 2026

Added the official ESP32-S2 board lesson, firmware comparisons, eight questions, a printable worksheet and a connection explorer. Primary documentation was checked for board targets, the three software layers, bootloader/recovery, UART/debugging, Marauder commands and security mechanisms. Board flashing and radio exercises remain untested on physical hardware.

The homepage and shared presentation layer were redesigned with an original generated logo, original SVG hardware illustrations, system fonts, dark/light themes and motion controls. The source and generation prompt are recorded in `docs/brand.md`.

- All 31 pages loaded in Chromium. No page-level JavaScript errors were observed; module quizzes and declared learning widgets mounted.
- Responsive layout was checked at 320, 390, 768 and 1280 CSS pixels on all 31 pages (124 page/width combinations). The quiz selector initially overflowed at small widths; it was fixed and rechecked at all four widths. No remaining document-level horizontal overflow was found.
- Twenty-two browser interaction checks passed: homepage interface selection; logo loading; pause/resume persistence; system reduced motion; all firmware-diagram modes; 8/8 Wi-Fi quiz scoring and saved best score; completion persistence; Module 18 notebook save/reload; roadmap inclusion; mobile menu/Escape; theme persistence; JavaScript errors.
- The standalone quiz page also loaded all eight Module 18 questions through its scope selector.
- Desktop home in both themes, mobile home/module, and the complete desktop firmware explorer were visually inspected. The mobile diagram's rotated-arrow hit area was corrected and its controls retested successfully.
- The 404 page was checked separately at all four widths and its logo loaded through the absolute GitHub project path.

Browser artifacts and test scripts remain in ignored `output/playwright/`; learner test entries remain in the isolated local browser storage. Neither is included in the public site artifact.

## Course structure and catalog cleanup — 15 September 2026

- Existing checks pass for 31 pages and 116 quiz questions. Course checks now validate stage coverage/order, module and badge references, and catalog-before-runtime loading on every HTML entry point.
- Compared the extracted module and badge metadata with the previous Git version: all values, IDs and ordering are identical.
- The six-stage learning path rendered with all 19 lesson links and evidence checkpoints. Desktop and 390 px mobile stage cards were visually inspected; the mobile page had no horizontal overflow.
- All 19 module pages loaded in the in-app browser with navigation, both pager links and mounted quiz options. No browser console errors were reported during this check.
- Static staging and `git diff --check` pass. No runtime dependency was added.

This pass did not exercise payment, authentication, refunds, hardware labs or every notebook/quiz interaction. Payment and protected delivery remain planned work; the current build still publishes all course content.
