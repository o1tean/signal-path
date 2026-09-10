# Verification — 10 September 2026

The course was tested as a GitHub project site under `/signal-path/`, not only at a domain root.

## Automated site checks

- `python3 scripts/check-site.py`: 30 HTML pages; local targets and fragments, duplicate IDs, one page heading, and inline/external JavaScript syntax.
- `node scripts/check-course.cjs`: 18 module routes, quiz mounting declarations and 108 valid questions/answer indexes.
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
