# Signal Path legacy content inventory

Generated from a full read of `legacy/` (HTML parsed programmatically, JS and CSS read by hand) on 2026-10-12. Nothing under `legacy/` was modified. Source tree: `/Users/o1tean/Documents/work/signal-path/legacy/`.

Counting conventions: **words** = approximate visible text inside `<main>` (scripts and inline SVG removed; JS-rendered quiz questions, widgets and the runtime-injected pager/complete-box are NOT included). **Callouts** = elements `.callout.{note|tip|warn|story|legal}`. **Time/gear/transmit** chips are the `.chip` elements in `.mod-header`. All section ids are the `id` attributes of `<section>` elements (headings themselves carry no ids anywhere in the legacy site).

## 0. Headline findings (read first)

- **Two content generations coexist.** Modules 00-07, 09, 10 are rich hand-authored lessons (1,186-2,881 words, `aside.toc`, `.mod-meta` chips, inline SVG diagrams, widgets, labs with `.lab` / `.win` boxes). Modules 08 and 11-17 are short template-generated pages (369-690 words, no TOC, `.chips` instead of `.mod-meta`, `ol.steps` labs, "Show that you can do it" lists, no callouts, no diagrams, 3-4 quiz questions). Module 18 is rich (2,363 words) but in the newer markup (no TOC, `.chips`). A v2 content model must normalise both.
- **Depth gap is the main product risk for a paid course.** Median of modules 11-17 is about 450 words versus about 1,900 for modules 00-10. These seven lessons (IR, GPIO, USB/BLE, iButton/U2F, app dev, security lab, mastery) are outlines, not lessons: one "Understand it" section each, no predict step, no worked example, no figure.
- **The 7-part lesson shape is not encoded anywhere.** Only the runtime (`site.js buildModuleChrome`) adds the notebook link, "Mark module complete" box and prev/next pager to every lesson; everything else is free-form HTML. See section 4 for the per-lesson gap table.
- **All learner state is `localStorage` only** (`signalpath.v2`, `signalpath.theme`, `signalpath.motion`). Two state keys (`flashIndex`, `tuneIn`) are written by widgets but are dropped by `SP.resetAll()` and by the backup validator. A server-synced account model must define these explicitly.
- **Counts are hand-maintained in `index.html`** ("19 modules", "10 interactive tools", "116 questions") and happen to match today (quiz bank = 116 questions incl. 6 primer; 10 widgets; 19 modules), but the module cards on `index.html`, the route on `roadmap.html` (JS-rendered) and `assets/js/data/course.js` are three separate sources of truth.
- **Review freshness:** every page that claims a review says "10 September 2026" (about 5 weeks old at generation). Modules 18 claims procedures were "documentation-reviewed, not tested on a physical Wi-Fi board" - a v2 paid launch should either test them or keep that disclaimer.
- **Asset licensing flag:** `assets/models/flipper-zero.glb` is derived from Flipper Devices CAD under GPL-3.0 (`LICENSE-flipperzero-3d-models`); `three.module.min.js` is MIT. Shipping a GPL-3.0 derived model inside a paid product needs a licence decision before launch.
- **Fonts are declared but never loaded:** `site.css` names Archivo / Public Sans / IBM Plex Mono but there is no `@font-face` and no web-font link, so every visitor sees system-font fallbacks. The SVG formula in module 01 also hard-codes `IBM Plex Mono`.
- **The task said "10 top-level pages"; there are 11 content pages plus `404.html`** (index, primer, reference, roadmap, notebook, quiz, playground, glossary, legal, case-studies, sources). All 12 files are covered below.
- **Possibly stale external links to verify before port:** `reference.html` links `https://docs.flipper.net/nfc` and `https://docs.flipper.net/sub-ghz` (no `/zero/` segment, unlike every other docs link). Not network-checked in this pass.

## 1. Lesson pages: summary table (19 files)

| # | File | Title (`<title>`) | Week / track | Words | Sections (h2) | Widgets | 3D scenes | Quiz id (Qs) | Labs | Callouts | SVG diagrams | Ext. links in sources | Layout generation |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 | `modules/00-setup.html` | Module 0 · Meet your radio lab · Signal Path | Week 0 · Getting oriented | 1972 | 10 | flipper-sim | flipper | m00 (6) | Lab 0.1, Lab 0.2 | tip 2, note 2, legal 1, warn 1, story 1 | 0 | 3 | A (toc + .mod-meta) |
| 1 | `modules/01-frequency.html` | Module 1 · Find the frequency · Signal Path | Week 1 · Tuning in | 1705 | 8 | spectrum-scope, tune-in, rf-calc | carrier | m01 (8) | Lab 1.1 | note 2, tip 2, warn 1 | 1 | 2 | A (toc + .mod-meta) |
| 2 | `modules/02-modulation.html` | Module 2 · Hear the signal: AM vs FM · Signal Path | Week 1 · Tuning in | 1650 | 8 | wave-lab | modulation | m02 (9) | Lab 2.1 | note 2, warn 1, tip 1, story 1 | 1 | 1 | A (toc + .mod-meta) |
| 3 | `modules/03-protocols.html` | Module 3 · Decode a real protocol · Signal Path | Week 2 · Decoding | 2110 | 9 | pulse-decoder | pulses | m03 (8) | Lab 3.1 | tip 1, note 1, warn 1, legal 1 | 1 | 2 | A (toc + .mod-meta) |
| 4 | `modules/04-transmit.html` | Module 4 · Your first legal replay · Signal Path | Week 2 · Transmitting | 1519 | 8 | - | - | m04 (8) | Lab 4.1, Lab 4.2 · simulation | legal 1, note 2, tip 1 | 0 | 2 | A (toc + .mod-meta) |
| 5 | `modules/05-raw-and-rolling.html` | Module 5 · Raw signals & rolling codes · Signal Path | Week 3 · The keystone | 1825 | 9 | rolling-sim, tool-picker | rolling | m05 (9) | ol.steps lab | note 1, tip 1, legal 1 | 1 | 2 | A (toc + .mod-meta) |
| 6 | `modules/06-rfid.html` | Module 6 · 125 kHz RFID · Signal Path | Week 4 · Access control | 2392 | 9 | - | nearfield | m06 (7) | Lab 6.1 | legal 1, note 1, warn 1, tip 1 | 1 | 1 | A (toc + .mod-meta) |
| 7 | `modules/07-nfc.html` | Module 7 · NFC at 13.56 MHz · Signal Path | Week 4 · Access control | 1962 | 9 | - | nearfield | m07 (6) | Lab 7.1 | note 1, warn 1, tip 1, legal 1 | 1 | 1 | A (toc + .mod-meta) |
| 8 | `modules/08-momentum.html` | Module 8 · Firmware, apps & Momentum · Signal Path | Week 5 · Firmware literacy | 690 | 8 | - | - | m08 (7) | ol.steps lab | 0 | 0 | 3 | B (no toc, no chips) |
| 9 | `modules/09-troubleshooting.html` | Module 9 · Troubleshooting field guide · Signal Path | Week 5 · Fixing what goes wrong | 2881 | 11 | tool-picker | - | m09 (7) | Lab 9.1 | note 2, tip 1, legal 1, warn 1 | 1 | 2 | A (toc + .mod-meta) |
| 10 | `modules/10-capstone.html` | Module 10 · Foundation project: your signal atlas · Signal Path | Week 6 · RF foundation milestone | 1186 | 7 | signal-atlas | - | m10 (5) | ol.steps lab | story 2, tip 1, legal 1 | 1 | 3 | A (toc + .mod-meta) |
| 11 | `modules/11-infrared.html` | Module 11 · Infrared: build your own remote · Signal Path | Week 7 · Beyond the RF foundation | 369 | 5 | - | infrared | m11 (3) | ol.steps lab | 0 | 0 | 1 | B (no toc, .chips) |
| 12 | `modules/12-gpio.html` | Module 12 · GPIO: signals you can touch · Signal Path | Week 8 · Beyond the RF foundation | 454 | 5 | - | gpio | m12 (3) | ol.steps lab | 0 | 0 | 1 | B (no toc, .chips) |
| 13 | `modules/13-usb-bluetooth.html` | Module 13 · USB and Bluetooth: understand trust · Signal Path | Week 8 · Beyond the RF foundation | 450 | 5 | - | - | m13 (3) | ol.steps lab | 0 | 0 | 2 | B (no toc, .chips) |
| 14 | `modules/14-contact-and-authentication.html` | Module 14 · iButton and U2F: identity is not authentication · Signal Path | Week 9 · Beyond the RF foundation | 402 | 5 | - | - | m14 (3) | ol.steps lab | 0 | 0 | 2 | B (no toc, .chips) |
| 15 | `modules/15-app-development.html` | Module 15 · Build your first Flipper app · Signal Path | Week 10 · Beyond the RF foundation | 481 | 5 | - | - | m15 (3) | ol.steps lab | 0 | 0 | 2 | B (no toc, .chips) |
| 16 | `modules/16-security-lab.html` | Module 16 · Authorized security research: test the claim · Signal Path | Week 11 · Beyond the RF foundation | 675 | 5 | - | - | m16 (4) | ol.steps lab | 0 | 0 | 4 | B (no toc, .chips) |
| 17 | `modules/17-mastery.html` | Module 17 · Mastery project: explain, measure, teach · Signal Path | Week 11–12 · Beyond the RF foundation | 485 | 5 | - | - | m17 (3) | ol.steps lab | 0 | 0 | 4 | B (no toc, .chips) |
| 18 | `modules/18-wifi-devboard.html` | Module 18 · Wi-Fi Devboard & firmware · Signal Path | Hardware extension · After Modules 8, 12 & 15 | 2363 | 12 | - | devboard | m18 (8) | ol.steps lab | note 1 | 0 | 27 | B (no toc, .chips) |

Generation A = `<main class="page">` + `aside.toc` + `.mod-meta` chips. Generation B = `<main id="main-content" class="page wrap">`, no `aside.toc`, `.chips` (08 has none).

## 2. Per-lesson detail

### Module 0 - `modules/00-setup.html`

- **Title:** Module 0 · Meet your radio lab · Signal Path
- **H1:** Meet your radio lab   |   **Week/track label (`.mod-week`):** Week 0 · Getting oriented   |   **`body[data-page]`:** `m00`
- **Meta description:** Get comfortable holding the Flipper Zero, learn what Momentum firmware adds, and watch live radio energy for the first time — before any theory.
- **Lede:** Before a single word of theory: hold the device, learn where things live, and watch real radio energy move on the screen. By the end of this module the Flipper will feel like a tool, not a mystery.
- **Approx. words:** 1972
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 30 min ; Gear: Flipper + SD card ; Transmit: none yet
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `flipper-sim.js`, `presentation.js`
- **Section ids (`<section id>`):** `first-start`, `goal`, `what-it-is`, `momentum`, `sd-card`, `getting-around`, `what-you-need`, `lab`, `quiz`, `sources`
- **Headings in order:** h2:Unbox, update, and keep a lab record > h2:Goal > h2:What the Flipper actually is > h2:Choose a documented starting point > h2:The SD card & your first file format > h2:Getting around: buttons and menus > h3:Inside the Sub-GHz app > h3:Practice the menus without the risk > h2:What you'll need > h2:Lab 0: the tour > h3:Watch live radio energy > h3:Round up your props > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#what-it-is` What the Flipper is, `#momentum` What Momentum adds, `#sd-card` The SD card & .sub files, `#getting-around` Getting around, `#what-you-need` What you'll need, `#lab` Lab 0: the tour, `#quiz` Check yourself
- **Widgets (`data-widget`):** `flipper-sim`
- **3D scenes (`data-scene3d`):** `flipper`
- **Quiz (`data-quiz`):** `m00` - 6 questions in `SP_QUIZ_BANK`
- **Callouts by type:** tip=2, note=2, legal=1, warn=1, story=1
- **Labs (`.lab-kicker`):** Lab 0.1 (Watch live radio energy), Lab 0.2 (Round up your props)
- **`.win` criteria:** "✓ You've got it when: pressing a remote makes the Test reading jump above the resting noise floor, and drop back when you let go — and you have a small box of your own remotes ready for Module 1. You just watched invisible radio become a number on a screen. That's the whole job."
- **Primary-source links (`#sources`):** [Flipper: first start](https://docs.flipper.net/zero/basics/first-start); [Flipper: firmware update](https://docs.flipper.net/zero/basics/firmware-update); [Flipper: Sub-GHz hardware and menus](https://docs.flipper.net/zero/sub-ghz)
- **Internal cross-links:** `../legal.html`
- **Inline SVG diagrams (0):** No inline SVG. The 3D Flipper model and the flipper-sim widget carry the visuals.
- **Structural notes:** Section order quirk: `first-start` (h2 "Unbox, update, and keep a lab record", an add-on block) comes BEFORE `goal`. TOC lists sections from `goal` on. Mounts `flipper-sim` with `data-opts='{"start":"subghz"}'` and a 3D scene `flipper` with `data-opts='{"mode":"subghz"}'`. Contains the legal callout that introduces the course rule.

### Module 1 - `modules/01-frequency.html`

- **Title:** Module 1 · Find the frequency · Signal Path
- **H1:** Find the frequency   |   **Week/track label (`.mod-week`):** Week 1 · Tuning in   |   **`body[data-page]`:** `m01`
- **Meta description:** Turn the word 'frequency' into a real number you read off the Flipper's screen — meet the four workhorse bands and use the Frequency Analyzer on your own remotes.
- **Lede:** "Frequency" sounds like physics homework. It's actually just a channel number — a place on the dial where a device shouts. This module turns it into a real number you read off your own remote in about ten seconds.
- **Approx. words:** 1705
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 45 min ; Gear: Flipper + 3 remotes ; Transmit: none
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `spectrum-scope.js`, `tune-in.js`, `rf-calc.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `seeing-signals`, `the-four-bands`, `finding-it`, `wavelength`, `lab`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:Seeing a signal for what it is > h2:The four bands you'll actually meet > h2:Two ways to find it: Analyzer vs Test > h3:Frequency Analyzer measures > h3:Spectrum simulator models > h3:Practice the reflex > h2:The gentle math: frequency and wavelength > h2:Lab 1: read three frequencies > h3:Analyze your own remotes > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#seeing-signals` Seeing a signal, `#the-four-bands` The four bands, `#finding-it` Analyzer vs Test, `#wavelength` Frequency & wavelength, `#lab` Lab 1: read three frequencies, `#quiz` Check yourself
- **Widgets (`data-widget`):** `spectrum-scope`, `tune-in`, `rf-calc`
- **3D scenes (`data-scene3d`):** `carrier`
- **Quiz (`data-quiz`):** `m01` - 8 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=2, tip=2, warn=1
- **Labs (`.lab-kicker`):** Lab 1.1 (Analyze your own remotes)
- **`.win` criteria:** "✓ You've got it when: you can name the frequency of at least two of your own remotes from memory of your notes — and you're unbothered when a third shows nothing, because you can say why in one sentence."
- **Primary-source links (`#sources`):** [Flipper: regional frequencies](https://docs.flipper.net/zero/sub-ghz/frequencies); [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read)
- **Internal cross-links:** `../playground.html`
- **Inline SVG diagrams (1):** 1 SVG (figure.diagram): the formula lambda = c / f drawn as text glyphs; uses `fill="var(--cyan)"`, `var(--orange)`, hard-coded `IBM Plex Mono`.
- **Structural notes:** Links to `../playground.html` (spectrum simulator vs real Analyzer). Includes `<details>` "Why should a beginner care about wavelength at all?". Table of four bands + `.facts` stat grid.

### Module 2 - `modules/02-modulation.html`

- **Title:** Module 2 · Hear the signal: AM vs FM · Signal Path
- **H1:** Hear the signal: AM vs FM   |   **Week/track label (`.mod-week`):** Week 1 · Tuning in   |   **`body[data-page]`:** `m02`
- **Meta description:** Understand modulation by choosing it: OOK/AM versus 2-FSK/FM, what the AM270/AM650/FM238/FM476 presets mean, and why frequency and modulation are two separate dials.
- **Lede:** You found where a signal lives. Now for how it's shaped. Modulation is the second dial — get it wrong and a signal that's right in front of you turns to silence. Get it right and it snaps into view.
- **Approx. words:** 1650
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 45 min ; Gear: Flipper + a known remote ; Transmit: none
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `wave-lab.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `carrier`, `am-vs-fm`, `presets`, `two-dials`, `lab`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:The carrier wave > h2:AM vs FM, plainly > h3:AM On-Off Keying (OOK) > h3:FM Frequency-Shift Keying (2-FSK) > h2:The four presets > h3:Watch modulation happen > h2:Two independent dials > h3:Dial 1 · Frequency where > h3:Dial 2 · Modulation how > h2:Lab 2: sweep the presets > h3:Find the winning combo > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#carrier` The carrier wave, `#am-vs-fm` AM vs FM, plainly, `#presets` The four presets, `#two-dials` Two independent dials, `#lab` Lab 2: sweep the presets, `#quiz` Check yourself
- **Widgets (`data-widget`):** `wave-lab`
- **3D scenes (`data-scene3d`):** `modulation`
- **Quiz (`data-quiz`):** `m02` - 9 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=2, warn=1, tip=1, story=1
- **Labs (`.lab-kicker`):** Lab 2.1 (Find the winning combo)
- **`.win` criteria:** "✓ You've got it when: for at least one remote you can state its full combo out loud — "this doorbell is 433.92 MHz, AM650 " — and you understand that if either half were wrong, you'd have seen nothing."
- **Primary-source links (`#sources`):** [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read)
- **Internal cross-links:** none
- **Inline SVG diagrams (1):** 1 SVG: OOK vs 2-FSK waveform comparison (figure aria-label: "Two waveforms compared: OOK switches the carrier fully on and off in bursts, while 2-FSK keeps a continuous wave that alternates between a lower and a higher pitch.").
- **Structural notes:** `wave-lab` widget awards badge `wave-rider`. Preset table: AM270, AM650, FM238, FM476. `.grid2` AM vs FM cards; "Two independent dials" section.

### Module 3 - `modules/03-protocols.html`

- **Title:** Module 3 · Decode a real protocol · Signal Path
- **H1:** Decode a real protocol   |   **Week/track label (`.mod-week`):** Week 2 · Decoding   |   **`body[data-page]`:** `m03`
- **Meta description:** Capture a fixed-code remote you own, let the Flipper name its protocol, and save your first .sub file — then learn to read every line of it.
- **Lede:** In Module 1 you found a frequency; in Module 2 you chose a modulation. Now you'll press a remote, watch the Flipper turn its flashes of radio into a named protocol and a key, and save your very first .sub file.
- **Approx. words:** 2110
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 45 min ; Gear: a fixed-code remote you own ; Firmware: Momentum
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `pulse-decoder.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `pulses`, `anatomy`, `read`, `subfile`, `lab`, `deeper`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:From pulses to bits to meaning > h2:What a protocol actually contains > h3:Preamble > h3:Serial / ID > h3:Button / command > h3:Families the Flipper recognises > h2:What the Read screen shows you > h2:Anatomy of a .sub file > h2:Lab > h3:Capture, name, and save a real protocol > h2:Going deeper > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#pulses` From pulses to bits to meaning, `#anatomy` What a protocol is, `#read` What Read shows you, `#subfile` Anatomy of a .sub file, `#lab` Lab, `#deeper` Going deeper, `#quiz` Check yourself
- **Widgets (`data-widget`):** `pulse-decoder`
- **3D scenes (`data-scene3d`):** `pulses`
- **Quiz (`data-quiz`):** `m03` - 8 questions in `SP_QUIZ_BANK`
- **Callouts by type:** tip=1, note=1, warn=1, legal=1
- **Labs (`.lab-kicker`):** Lab 3.1 (Capture, name, and save a real protocol)
- **`.win` criteria:** "✓ You've got it when: you have one saved .sub in Saved with a real protocol name (Princeton, CAME, Nice FLO, Holtek…), a clear filename, and you can point to its Key and Bit count and say out loud why the key is the same every time you press."
- **Primary-source links (`#sources`):** [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read); [Flipper: static and dynamic protocol support](https://docs.flipper.net/zero/sub-ghz/supported-vendors)
- **Internal cross-links:** none
- **Inline SVG diagrams (1):** 1 SVG: pulse train measured into short/long durations mapping to 0/1.
- **Structural notes:** Two `<details>` (preamble / deeper). Anatomy-of-a-.sub-file code block. Win criteria names protocols Princeton, CAME, Nice FLO, Holtek. `pulse-decoder` widget.

### Module 4 - `modules/04-transmit.html`

- **Title:** Module 4 · Your first legal replay · Signal Path
- **H1:** Your first legal replay   |   **Week/track label (`.mod-week`):** Week 2 · Transmitting   |   **`body[data-page]`:** `m04`
- **Meta description:** Cross from listening to transmitting by replaying your own saved signal to your own device — with the ground rules front and centre and a guide to why replays sometimes do nothing.
- **Lede:** Everything so far has been listening — passive, invisible, harmless. This module is the moment you push a button and put energy on the air. That changes what's at stake, so we start with the rules, then make your own doorbell ring.
- **Approx. words:** 1519
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 40 min ; Gear: your saved .sub + its device ; Firmware: Official or Momentum
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `line`, `send`, `range`, `fails`, `lab`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:The transmit line > h3:Fine, on your own gear > h3:Never > h2:What replay really does > h2:Range and antenna reality > h2:When a replay does nothing > h2:Lab > h3:Replay your fixed code to your own device > h3:Predict a replay result > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#line` The transmit line, `#send` What replay really does, `#range` Range & antenna reality, `#fails` When a replay does nothing, `#lab` Lab, `#quiz` Check yourself
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m04` - 8 questions in `SP_QUIZ_BANK`
- **Callouts by type:** legal=1, note=2, tip=1
- **Labs (`.lab-kicker`):** Lab 4.1 (Replay your fixed code to your own device), Lab 4.2 · simulation (Predict a replay result)
- **`.win` criteria:** "✓ You've got it when: your own fixed-code device reliably responds to a replay from Saved → Send , and you can explain — in one sentence using the word "rolling" — why the simulated receiver rejects a used counter. If the fixed replay is weak, you fixed it by moving closer and reorienting, not by changing settings."
- **Primary-source links (`#sources`):** [Flipper: regional frequencies](https://docs.flipper.net/zero/sub-ghz/frequencies); [ANCOM: current Romanian radio interfaces](https://www.ancom.ro/category/reglementare-ro/echipamente-ro-10006/echipamente-radio/reglementari-cu-privire-la-interfete/)
- **Internal cross-links:** `../legal.html`, `05-raw-and-rolling.html`, `08-momentum.html`
- **Inline SVG diagrams (0):** No inline SVG.
- **Structural notes:** Legal-heavy lesson (9 mentions of legal/permission/authoriz). Two labs: 4.1 real fixed-code replay, 4.2 simulation ("Predict a replay result" uses the rolling-sim widget on module 05). Links `../legal.html`, `05-raw-and-rolling.html`, `08-momentum.html`. Lab 4.1 is conditional on locally-compliant radio checks. No widget or 3D scene mounted on this page itself.

### Module 5 - `modules/05-raw-and-rolling.html`

- **Title:** Module 5 · Raw signals & rolling codes · Signal Path
- **H1:** Raw signals & rolling codes   |   **Week/track label (`.mod-week`):** Week 3 · The keystone   |   **`body[data-page]`:** `m05`
- **Meta description:** Capture signals the Flipper can't name with Read RAW, and understand rolling codes deeply — why a copied gate remote works once and then dies, and why that's the security working.
- **Lede:** This is the module that makes sense of everything you found strange so far. You'll capture signals the Flipper refuses to name, and you'll finally understand why a copied gate remote works exactly once and then dies — and why that failure is the system doing its job perfectly.
- **Approx. words:** 1825
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 55 min ; Gear: your own remotes, one rolling ; Firmware: Momentum
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `rolling-sim.js`, `tool-picker.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `raw`, `recap`, `how`, `case`, `lab`, `toolkit`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:Read RAW: capturing the un-nameable > h2:Fixed vs rolling, side by side > h3:fixed Fixed code > h3:rolling Rolling code > h2:How a rolling code actually works > h3:The acceptance window > h2:Case: a replay appears to work once > h2:Lab: RAW is a representation > h2:Which tool for the job > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#raw` Read RAW, `#recap` Fixed vs rolling, `#how` How rolling codes work, `#case` Case: the Nice gate, `#lab` Lab, `#toolkit` Which tool for the job, `#quiz` Check yourself
- **Widgets (`data-widget`):** `rolling-sim`, `tool-picker`
- **3D scenes (`data-scene3d`):** `rolling`
- **Quiz (`data-quiz`):** `m05` - 9 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=1, tip=1, legal=1
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none
- **Primary-source links (`#sources`):** [Flipper: demodulated RAW recordings](https://docs.flipper.net/zero/sub-ghz/read-raw); [Microchip HCS301: synchronization model (PDF)](https://ww1.microchip.com/downloads/aemDocuments/documents/MCU08/ProductDocuments/DataSheets/21143C.pdf)
- **Internal cross-links:** none
- **Inline SVG diagrams (1):** 1 SVG: counter number line with last-seen marker, forward acceptance window and far-future resync zone.
- **Structural notes:** Mounts `rolling-sim` (awards `out-of-sync` when a replay fails) and `tool-picker`. The lab section uses `ol.steps` (no `.lab-kicker`, no `.win`). A "toolkit" section (Which tool for the job) follows the lab. 3D scene `rolling`.

### Module 6 - `modules/06-rfid.html`

- **Title:** Module 6 · 125 kHz RFID · Signal Path
- **H1:** 125 kHz RFID   |   **Week/track label (`.mod-week`):** Week 4 · Access control   |   **`body[data-page]`:** `m06`
- **Meta description:** Read, save and emulate your own 125 kHz access fob, and learn why low-frequency RFID is a near-field world, not radio the way Sub-GHz is.
- **Lede:** Your building fob isn't a tiny radio remote. It's a coil of wire that wakes up only when your reader feeds it power. This module reads, saves and emulates a fob you own — and shows why "RFID" and "Sub-GHz" live in completely different worlds.
- **Approx. words:** 2392
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 45 min ; Gear: a 125 kHz fob or card you own ; App: 125 kHz RFID
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `different-world`, `how-it-works`, `protocols`, `flow`, `lab`, `going-deeper`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:A different kind of radio > h3:Why the range is centimetres, not metres > h2:How a passive tag answers > h2:What's actually on the tag > h3:UID vs "facility code + card number" > h2:Read, Save, Emulate, Write > h3:The T5577: a blank that can pretend to be anything > h2:Lab > h3:Read, save and emulate your own fob > h3:The three RF worlds, side by side > h2:Going deeper > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#different-world` A different kind of radio, `#how-it-works` How a passive tag answers, `#protocols` What's actually on the tag, `#flow` Read, Save, Emulate, Write, `#lab` Lab, `#going-deeper` Going deeper, `#quiz` Check yourself
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** `nearfield`
- **Quiz (`data-quiz`):** `m06` - 7 questions in `SP_QUIZ_BANK`
- **Callouts by type:** legal=1, note=1, warn=1, tip=1
- **Labs (`.lab-kicker`):** Lab 6.1 (Read, save and emulate your own fob)
- **`.win` criteria:** "✓ You've got it when: you can read your fob, see its protocol and ID on screen, save it, and emulate it back to your own reader — and you can say in one sentence why you had to hold everything almost touching."
- **Primary-source links (`#sources`):** [Flipper: LF RFID](https://docs.flipper.net/zero/rfid)
- **Internal cross-links:** `07-nfc.html`
- **Inline SVG diagrams (1):** 1 SVG: reader coil + passive tag coil, magnetic coupling, load modulation, few-cm gap.
- **Structural notes:** Three `<details>`. 3D scene `nearfield` with `{"kind":"fob"}`. Table of LF tag families (EM4100 etc.) and T5577 write section. Links `07-nfc.html`.

### Module 7 - `modules/07-nfc.html`

- **Title:** Module 7 · NFC at 13.56 MHz · Signal Path
- **H1:** NFC at 13.56 MHz   |   **Week/track label (`.mod-week`):** Week 4 · Access control   |   **`body[data-page]`:** `m07`
- **Meta description:** Understand NFC as its own 13.56 MHz world: card types, what the Flipper can and can't clone, and why your bank card can be read but never used to pay.
- **Lede:** Contactless cards, tags and toys all share one frequency: 13.56 MHz. This module maps the NFC world, shows what the Flipper genuinely reads and copies, and quietly kills the "it can clone my credit card" myth.
- **Approx. words:** 1962
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 50 min ; Gear: an NFC tag or card you own ; App: NFC
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `hf-world`, `card-types`, `flipper-nfc`, `bank-cards`, `lab`, `going-deeper`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:HF: the 13.56 MHz world > h2:Cards you'll meet > h3:UID, keys, and why "read" isn't "clone" > h2:What the Flipper can do > h3:Writing NTAG: the friendly end of NFC > h2:The bank-card myth > h2:Lab > h3:Read your own tag, then note what really copied > h2:Going deeper > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#hf-world` HF: the 13.56 MHz world, `#card-types` Cards you'll meet, `#flipper-nfc` What the Flipper can do, `#bank-cards` The bank-card myth, `#lab` Lab, `#going-deeper` Going deeper, `#quiz` Check yourself
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** `nearfield`
- **Quiz (`data-quiz`):** `m07` - 6 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=1, warn=1, tip=1, legal=1
- **Labs (`.lab-kicker`):** Lab 7.1 (Read your own tag, then note what really copied)
- **`.win` criteria:** "✓ You've got it when: you've read at least two of your own NFC items, emulated a simple NTAG, and can point at one card and say "the Flipper only saw its UID — the rest is behind keys it doesn't have," and at another and say "that one copied end to end because it has no crypto.""
- **Primary-source links (`#sources`):** [Flipper: NFC](https://docs.flipper.net/zero/nfc)
- **Internal cross-links:** `06-rfid.html`
- **Inline SVG diagrams (1):** 1 SVG: log frequency scale 100 kHz-1 GHz placing LF 125 kHz, HF 13.56 MHz, Sub-GHz 300-928 MHz.
- **Structural notes:** 3D scene `nearfield` with `{"kind":"card"}`. Three `<details>`. "The bank-card myth" section. Links `06-rfid.html`.

### Module 8 - `modules/08-momentum.html`

- **Title:** Module 8 · Firmware, apps & Momentum · Signal Path
- **H1:** Firmware, apps & Momentum   |   **Week/track label (`.mod-week`):** Week 5 · Firmware literacy   |   **`body[data-page]`:** `m08`
- **Meta description:** Choose and maintain Flipper firmware using documented capabilities and recovery steps.
- **Lede:** Know which capabilities come from the hardware, which come from firmware, and how to recover a working setup.
- **Approx. words:** 690
- **Header chips (time / gear / transmit-or-firmware):** none
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `forks`, `board-firmware`, `hardware`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:Official firmware and community forks > h2:Board firmware is a separate choice > h2:Hardware and legal limits > h2:Lab: make your setup reproducible > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m08` - 7 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: firmware update](https://docs.flipper.net/zero/basics/firmware-update); [Momentum: upstream project](https://github.com/Next-Flip/Momentum-Firmware); [Flipper: application catalog](https://docs.flipper.net/zero/apps)
- **Internal cross-links:** `18-wifi-devboard.html`
- **Inline SVG diagrams (0):** No SVG. Handheld firmware comparison table (Official / Momentum / Unleashed / RogueMaster).
- **Structural notes:** Gen-B markup but has `#goal`, no chips, no time/gear/transmit meta. An inline `p.source-note` with 4 primary links appears mid-page (after the forks table) AND the closing `#sources` repeats a shorter list; port should deduplicate. "Course review: 10 September 2026". Links `18-wifi-devboard.html`.

### Module 9 - `modules/09-troubleshooting.html`

- **Title:** Module 9 · Troubleshooting field guide · Signal Path
- **H1:** Troubleshooting field guide   |   **Week/track label (`.mod-week`):** Week 5 · Fixing what goes wrong   |   **`body[data-page]`:** `m09`
- **Meta description:** A diagnostic toolkit for the handful of things that actually go wrong for beginners: nothing decodes, replay does nothing, the analyzer is blank, and range is terrible.
- **Lede:** Almost every "it doesn't work" moment on the Flipper is one of about six problems. Here is how to tell them apart fast, and what actually fixes each one.
- **Approx. words:** 2881
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 45 min ; Gear: Flipper + a remote that's misbehaving
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `tool-picker.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `method`, `no-decode`, `analyzer`, `replay`, `range`, `sd`, `lab`, `field-notes`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:How to diagnose: change one thing at a time > h2:Problem: nothing decodes in Read > h3:1 · Wrong frequency > h3:2 · Wrong modulation > h3:3 · Too far, or too weak > h3:4 · It's a protocol the Flipper can't decode > h3:5 · It's rolling, and that's not a bug > h3:6 · A noisy band > h2:Problem: Frequency Analyzer shows nothing, or jumps around > h3:It shows nothing > h3:It jumps around > h2:Problem: you captured it, but replay does nothing (or works once) > h3:Replay works once, then stops > h3:Replay does nothing at all — even on a fixed-code device you own > h2:Problem: terrible range on transmit > h2:Problem: the .sub won't load, or the SD card acts up > h2:Lab > h3:Take a stubborn device all the way down the tree > h2:Field notes: the one-glance table > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#method` How to diagnose, `#no-decode` Nothing decodes in Read, `#analyzer` Frequency Analyzer is blank, `#replay` Replay does nothing (or once), `#range` Terrible range on transmit, `#sd` The .sub won't load, `#lab` Lab, `#field-notes` Field notes, `#quiz` Check yourself
- **Widgets (`data-widget`):** `tool-picker`
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m09` - 7 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=2, tip=1, legal=1, warn=1
- **Labs (`.lab-kicker`):** Lab 9.1 (Take a stubborn device all the way down the tree)
- **`.win` criteria:** "✓ You've got it when: you can state, in one sentence, why your stubborn device did what it did — wrong frequency, wrong preset, too weak, unnamed protocol, or a rolling code doing exactly its job — and you have a note you could hand to someone else to reproduce."
- **Primary-source links (`#sources`):** [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read); [Flipper: demodulated RAW recordings](https://docs.flipper.net/zero/sub-ghz/read-raw)
- **Internal cross-links:** `../case-studies.html`, `05-raw-and-rolling.html`, `08-momentum.html`
- **Inline SVG diagrams (1):** 1 SVG: decision flowchart "signal will not decode" (aria-label has the full text description).
- **Structural notes:** Three `ol.steps`, one `<details>`, two tables (incl. "one-glance" field-notes table). `tool-picker` widget. Problem-organised (nothing decodes / analyzer blank / replay does nothing / terrible range / SD card). Links `../case-studies.html`, `05-raw-and-rolling.html`, `08-momentum.html`. Has `#field-notes` after the lab.

### Module 10 - `modules/10-capstone.html`

- **Title:** Module 10 · Foundation project: your signal atlas · Signal Path
- **H1:** Foundation project: your signal atlas   |   **Week/track label (`.mod-week`):** Week 6 · RF foundation milestone   |   **`body[data-page]`:** `m10`
- **Meta description:** The real test of the course: walk your home, catalog every RF device you own, and prove you can identify, decode and classify any unknown remote.
- **Lede:** No new tricks this week. Instead, you turn the whole course loose on the real world: your authorized training remotes and tags, identified and catalogued in one place.
- **Approx. words:** 1186
- **Header chips (time / gear / transmit-or-firmware):** ⏱ 60 min+ ; Gear: Flipper + your documented lab targets
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `signal-atlas.js`, `presentation.js`
- **Section ids (`<section id>`):** `goal`, `workflow`, `atlas`, `lab`, `next`, `quiz`, `sources`
- **Headings in order:** h2:Goal > h2:The workflow you now own > h2:Build your signal atlas > h2:Lab: catalog your training devices > h2:Where to go next > h3:Read the real docs > h3:Pick a next skill > h2:Check yourself > h2:Verify the details
- **`aside.toc` entries:** `#goal` Goal, `#workflow` The workflow you now own, `#atlas` Build your signal atlas, `#lab` Lab: catalog your home, `#next` Where to go next, `#quiz` Check yourself
- **Widgets (`data-widget`):** `signal-atlas`
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m10` - 5 questions in `SP_QUIZ_BANK`
- **Callouts by type:** story=2, tip=1, legal=1
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none
- **Primary-source links (`#sources`):** [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read); [Flipper: LF RFID](https://docs.flipper.net/zero/rfid); [Flipper: NFC](https://docs.flipper.net/zero/nfc)
- **Internal cross-links:** `../reference.html`, `../roadmap.html`, `11-infrared.html`
- **Inline SVG diagrams (1):** 1 SVG: six-step pipeline (frequency, modulation, decode/raw, fixed vs rolling, save+label, note replay).
- **Structural notes:** Capstone for the RF foundation. Mounts `signal-atlas` (writes `SP.state.atlas`). Lab uses `ol.steps` (2), no `.lab-kicker`/`.win`. Contains `#next` ("Where to go next", Read the real docs / Pick a next skill) and two `story` callouts. Links `../reference.html`, `../roadmap.html`, `11-infrared.html`. Only 5 quiz questions.

### Module 11 - `modules/11-infrared.html`

- **Title:** Module 11 · Infrared: build your own remote · Signal Path
- **H1:** Infrared: build your own remote   |   **Week/track label (`.mod-week`):** Week 7 · Beyond the RF foundation   |   **`body[data-page]`:** `m11`
- **Meta description:** Learn a harmless command from your own remote, explain how infrared differs from radio, and build a small, well-labelled remote library.
- **Lede:** Learn a harmless command from your own remote, explain how infrared differs from radio, and build a small, well-labelled remote library.
- **Approx. words:** 369
- **Header chips (time / gear / transmit-or-firmware):** 45–60 min ; Your TV + its IR remote
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:Make one small, observable change > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** `infrared`
- **Quiz (`data-quiz`):** `m11` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: learning infrared remotes](https://docs.flipper.net/zero/infrared/read)
- **Internal cross-links:** `../notebook.html`
- **Inline SVG diagrams (0):** No SVG; 3D scene `infrared` (38 kHz bursts across a beam to a receiver).
- **Structural notes:** Text outline. Section ids `concepts, lab, evidence, quiz, sources`. Links `../notebook.html`. Single source link.

### Module 12 - `modules/12-gpio.html`

- **Title:** Module 12 · GPIO: signals you can touch · Signal Path
- **H1:** GPIO: signals you can touch   |   **Week/track label (`.mod-week`):** Week 8 · Beyond the RF foundation   |   **`body[data-page]`:** `m12`
- **Meta description:** Build a low-current LED circuit and learn to check a pinout before connecting hardware.
- **Lede:** Build a low-current LED circuit and learn to check a pinout before connecting hardware.
- **Approx. words:** 454
- **Header chips (time / gear / transmit-or-firmware):** 60–90 min ; Breadboard, LED, 1 kΩ resistor, jumpers
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:UART, SPI and I²C > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** `gpio`
- **Quiz (`data-quiz`):** `m12` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: GPIO pinout and electrical limits](https://docs.flipper.net/zero/gpio-and-modules)
- **Internal cross-links:** `../notebook.html`
- **Inline SVG diagrams (0):** No SVG; 3D scene `gpio`.
- **Structural notes:** LED-on-PA7 circuit, estimated 1.3 mA, UART/SPI/I2C h3. Same 5-section template.

### Module 13 - `modules/13-usb-bluetooth.html`

- **Title:** Module 13 · USB and Bluetooth: understand trust · Signal Path
- **H1:** USB and Bluetooth: understand trust   |   **Week/track label (`.mod-week`):** Week 8 · Beyond the RF foundation   |   **`body[data-page]`:** `m13`
- **Meta description:** Use a tiny, visible keyboard script to understand why input devices must be trusted, then review your own Bluetooth pairing.
- **Lede:** Use a tiny, visible keyboard script to understand why input devices must be trusted, then review your own Bluetooth pairing.
- **Approx. words:** 450
- **Header chips (time / gear / transmit-or-firmware):** 45 min ; Your computer + USB cable
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:Bluetooth is a separate interface > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m13` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: USB and BLE keyboard emulation](https://docs.flipper.net/zero/bad-usb); [Flipper: first start](https://docs.flipper.net/zero/basics/first-start)
- **Internal cross-links:** `../notebook.html`, `18-wifi-devboard.html`
- **Inline SVG diagrams (0):** No SVG, no scene.
- **Structural notes:** Text-only Bad-USB-style lab framed as a trust-boundary demonstration (visible, harmless keystrokes). Links `18-wifi-devboard.html`.

### Module 14 - `modules/14-contact-and-authentication.html`

- **Title:** Module 14 · iButton and U2F: identity is not authentication · Signal Path
- **H1:** iButton and U2F: identity is not authentication   |   **Week/track label (`.mod-week`):** Week 9 · Beyond the RF foundation   |   **`body[data-page]`:** `m14`
- **Meta description:** Compare a contact key that presents an identifier with a security key that participates in authentication.
- **Lede:** Compare a contact key that presents an identifier with a security key that participates in authentication.
- **Approx. words:** 402
- **Header chips (time / gear / transmit-or-firmware):** 45–60 min ; Training iButton; optional test account
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m14` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: reading iButton keys](https://docs.flipper.net/zero/ibutton/read); [Flipper: U2F authentication](https://docs.flipper.net/zero/u2f)
- **Internal cross-links:** `../notebook.html`
- **Inline SVG diagrams (0):** No SVG, no scene.
- **Structural notes:** Single `h2` "Understand it" with no sub-headings (shortest lesson, 402 words).

### Module 15 - `modules/15-app-development.html`

- **Title:** Module 15 · Build your first Flipper app · Signal Path
- **H1:** Build your first Flipper app   |   **Week/track label (`.mod-week`):** Week 10 · Beyond the RF foundation   |   **`body[data-page]`:** `m15`
- **Meta description:** Build a small on-screen lab companion, inspect its source, and learn the difference between an app and firmware.
- **Lede:** Build a small on-screen lab companion, inspect its source, and learn the difference between an app and firmware.
- **Approx. words:** 481
- **Header chips (time / gear / transmit-or-firmware):** 2–3 sessions ; Computer, USB cable; basic C helps
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:Build in an isolated Python environment > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m15` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: uFBT build tool](https://github.com/flipperdevices/flipperzero-ufbt); [Flipper: development documentation](https://docs.flipper.net/zero/development)
- **Internal cross-links:** `../notebook.html`, `18-wifi-devboard.html`
- **Inline SVG diagrams (0):** No SVG, no scene.
- **Structural notes:** uFBT build in isolated Python environment; lesson references the example source shipped in `legacy/examples/lab-companion/` (`application.fam`, `lab_companion.c`). Links `18-wifi-devboard.html`.

### Module 16 - `modules/16-security-lab.html`

- **Title:** Module 16 · Authorized security research: test the claim · Signal Path
- **H1:** Authorized security research: test the claim   |   **Week/track label (`.mod-week`):** Week 11 · Beyond the RF foundation   |   **`body[data-page]`:** `m16`
- **Meta description:** Study how replay, credential copying, relay, and interference attacks differ, then test one bounded security claim on a training system.
- **Lede:** Study how replay, credential copying, relay, and interference attacks differ, then test one bounded security claim on a training system.
- **Approx. words:** 675
- **Header chips (time / gear / transmit-or-firmware):** 2–3 sessions ; Standalone training receiver and tags
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:Separate the attacker’s capabilities > h3:What the Flipper actually establishes > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m16` - 4 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: static and dynamic protocol support](https://docs.flipper.net/zero/sub-ghz/supported-vendors); [Flipper: LF RFID](https://docs.flipper.net/zero/rfid); [Flipper: NFC](https://docs.flipper.net/zero/nfc); [Flipper: USB and BLE keyboard emulation](https://docs.flipper.net/zero/bad-usb)
- **Internal cross-links:** `../notebook.html`
- **Inline SVG diagrams (0):** No SVG, no scene.
- **Structural notes:** Contains 4 source links (largest of 11-17). Positive/negative control lab design. Strong legal framing (9 legal mentions). Only module of 11-17 with 4 quiz questions.

### Module 17 - `modules/17-mastery.html`

- **Title:** Module 17 · Mastery project: explain, measure, teach · Signal Path
- **H1:** Mastery project: explain, measure, teach   |   **Week/track label (`.mod-week`):** Week 11–12 · Beyond the RF foundation   |   **`body[data-page]`:** `m17`
- **Meta description:** Demonstrate repeatable skill across interfaces and produce an honest portfolio that someone else can reproduce.
- **Lede:** Demonstrate repeatable skill across interfaces and produce an honest portfolio that someone else can reproduce.
- **Approx. words:** 485
- **Header chips (time / gear / transmit-or-firmware):** 3–5 sessions ; Your authorized lab + notebook
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `concepts`, `lab`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Understand it > h3:Measurements need limits > h3:Four-part portfolio > h2:Lab: build the evidence > h2:Show that you can do it > h2:Check yourself > h2:Sources
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** none
- **Quiz (`data-quiz`):** `m17` - 3 questions in `SP_QUIZ_BANK`
- **Callouts by type:** none (0 total)
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; lab is an `ol.steps` under `#lab`
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links (`#sources`):** [Flipper: reading signals and presets](https://docs.flipper.net/zero/sub-ghz/read); [Flipper: demodulated RAW recordings](https://docs.flipper.net/zero/sub-ghz/read-raw); [Flipper: GPIO pinout and electrical limits](https://docs.flipper.net/zero/gpio-and-modules); [Flipper: development documentation](https://docs.flipper.net/zero/development)
- **Internal cross-links:** `../notebook.html`, `18-wifi-devboard.html`
- **Inline SVG diagrams (0):** No SVG, no scene.
- **Structural notes:** Four-part portfolio brief. Retrieval step ("wait at least a day, then explain without notes"). Links `18-wifi-devboard.html`.

### Module 18 - `modules/18-wifi-devboard.html`

- **Title:** Module 18 · Wi-Fi Devboard & firmware · Signal Path
- **H1:** Wi-Fi Devboard & firmware   |   **Week/track label (`.mod-week`):** Hardware extension · After Modules 8, 12 & 15   |   **`body[data-page]`:** `m18`
- **Meta description:** Understand the official ESP32-S2 Wi-Fi Devboard, Black Magic debugging, Marauder, captive portals, firmware installation and recovery, with controlled labs.
- **Lede:** One accessory, several very different jobs. Learn which software runs where, recover a known setup, and turn Wi-Fi observations into evidence.
- **Approx. words:** 2363
- **Header chips (time / gear / transmit-or-firmware):** 3–4 sessions ; Optional official ESP32-S2 board ; Own 2.4 GHz lab access point
- **Scripts loaded:** `course.js`, `site.js`, `quiz-bank.js`, `presentation.js`
- **Section ids (`<section id>`):** `hardware`, `layers`, `firmwares`, `capabilities`, `restore`, `marauder-lab`, `extensions`, `troubleshooting`, `evidence`, `quiz`, `sources`
- **Headings in order:** h2:Same board. Different roles. > h2:Meet the official board > h2:Three software layers to keep separate > h2:Choose the board’s job > h2:What the security features actually do > h2:Lab A: establish a recovery path and read logs > h2:Lab B: install Marauder and measure your AP > h3:Optional CLI route > h2:Build toward independent work > h3:Portal experiment: separate association from trust > h3:Write your own board firmware > h2:Diagnose the layer that failed > h2:Show that you can do it > h2:Check yourself > h2:Research and version notes
- **Widgets (`data-widget`):** none
- **3D scenes (`data-scene3d`):** `devboard`
- **Quiz (`data-quiz`):** `m18` - 8 questions in `SP_QUIZ_BANK`
- **Callouts by type:** note=1
- **Labs (`.lab-kicker`):** no `.lab-kicker` boxes; none
- **`.win` criteria:** none (uses a "Show that you can do it" `#evidence` list)
- **Primary-source links:** <https://developer.flipper.net/flipperzero/doxygen/dev_board.html>; <https://developer.flipper.net/flipperzero/doxygen/dev_board_debugging_guide.html>; <https://developer.flipper.net/flipperzero/doxygen/dev_board_fw_update.html>; <https://developer.flipper.net/flipperzero/doxygen/dev_board_reading_logs.html>; <https://developer.flipper.net/flipperzero/doxygen/dev_board_usb_connection.html>; <https://docs.espressif.com/projects/esp-idf/en/stable/esp32s2/api-guides/wifi-driver/station-scenarios.html>; <https://docs.espressif.com/projects/esp-idf/en/stable/esp32s2/api-guides/wifi-security.html>; <https://docs.espressif.com/projects/esp-idf/en/stable/esp32s2/get-started/index.html>; <https://docs.flipper.net/zero/development/hardware/devboard-schematics>; <https://documentation.espressif.com/esp32-s2_datasheet_en.html>; <https://flipper.net/products/wifi-devboard>; <https://github.com/0xchocolate/flipperzero-wifi-marauder>; <https://github.com/bigbrodude6119/flipper-zero-evil-portal>; <https://github.com/flipperdevices/flipperzero-ufbt>; <https://github.com/justcallmekoko/ESP32Marauder>; <https://github.com/justcallmekoko/ESP32Marauder/releases>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/Beacon-Spam-List>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/CLI>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/Deauth-Flood>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/EAPOL-PMKID-Scan>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/Evil-Portal>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/flipper-zero>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/list>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/scanap>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/stopscan>; <https://github.com/justcallmekoko/ESP32Marauder/wiki/update-firmware>; <https://www.ancom.ro/category/reglementare-ro/echipamente-ro-10006/echipamente-radio/reglementari-cu-privire-la-interfete/>
- **Internal cross-links:** `../legal.html`, `../notebook.html`, `../sources.html`, `08-momentum.html`, `12-gpio.html`, `15-app-development.html`, `17-mastery.html`
- **Inline SVG diagrams (0):** No SVG. Interactive HTML "firmware explorer" (`[data-firmware-explorer]` with three `[data-firmware-mode]` buttons and `.firmware-node` x3 + `.firmware-explanation`), driven by presentation.js (not a data-widget). 3D scene `devboard` with `{"attach":true}`.
- **Structural notes:** Rich lesson, 3 tables, 1 note callout. Section ids: hardware, layers, firmwares, capabilities, restore, marauder-lab, extensions, troubleshooting, evidence, quiz, sources. Closing section is titled "Research and version notes" (id `sources`). Links `../legal.html`, `../notebook.html`, `../sources.html`, `08-momentum.html`, `12-gpio.html`, `15-app-development.html`, `17-mastery.html`. 27 unique external hrefs in body (Flipper dev docs, Espressif, Marauder wiki, Evil Portal, ANCOM). Companion download: `downloads/wifi-devboard-notebook.md`.

## 3. Top-level pages: detail and v2 recommendation

Summary table (11 content pages + 404):

| File | Title | Words | `body[data-page]` | Widgets / scenes / quizzes | Scripts | v2 recommendation |
|---|---|---|---|---|---|---|
| `index.html` | Signal Path · Understand your Flipper Zero | 846 | `home` | scenes: flipper, devboard | course.js, site.js, learning.js, presentation.js | Keep as marketing page |
| `primer.html` | Primer · Signal Path | 2394 | `primer` | widgets: rf-calc quizzes: primer | course.js, site.js, quiz-bank.js, rf-calc.js, presentation.js | Move into app (free preview lesson, also public lead magnet) |
| `reference.html` | Reference · Signal Path | 1259 | `reference` | - | course.js, site.js, presentation.js | Move into app (public subset for SEO) |
| `roadmap.html` | Learning path · Signal Path | 432 | `roadmap` | - | course.js, site.js, learning.js, presentation.js | Merge (into landing page curriculum section + app dashboard) |
| `notebook.html` | Learning notebook · Signal Path | 164 | `notebook` | - | course.js, site.js, learning.js, presentation.js | Move into app (core feature, server-synced) |
| `quiz.html` | Quiz · Signal Path | 42 | `quiz` | - | course.js, site.js, quiz-bank.js, presentation.js | Merge (into app practice/review hub) |
| `playground.html` | Playground · Signal Path | 238 | `playground` | widgets: flipper-sim, spectrum-scope, tune-in, wave-lab, rf-calc, pulse-decoder, rolling-sim, tool-picker, flashcards, signal-atlas | course.js, site.js, glossary.js, flipper-sim.js, spectrum-scope.js, tune-in.js, wave-lab.js, rf-calc.js, pulse-decoder.js, rolling-sim.js, tool-picker.js, flashcards.js, signal-atlas.js, presentation.js | Keep public demo subset as marketing; full set moves into app |
| `glossary.html` | Glossary · Signal Path | 94 | `glossary` | widgets: flashcards | course.js, site.js, glossary.js, flashcards.js, presentation.js | Move into app (+ public glossary term pages for SEO) |
| `legal.html` | Romania, permission & responsible labs · Signal Path | 862 | `legal` | - | course.js, site.js, presentation.js | Keep as public trust/legal page (extend with Terms, Privacy, refund) |
| `case-studies.html` | Case Studies · Signal Path | 1077 | `case-studies` | widgets: rolling-sim | course.js, site.js, rolling-sim.js, presentation.js | Merge (into app as lesson-linked case files; one teaser public) |
| `sources.html` | Sources & corrections · Signal Path | 411 | `sources` | - | course.js, site.js, presentation.js | Keep public (credibility + corrections log) |
| `404.html` | Lost signal · Signal Path | 28 | `404` | - | course.js, site.js, presentation.js | Keep (rebuild as framework 404) |

### `index.html`

- **Title:** Signal Path · Understand your Flipper Zero
- **Meta description:** Learn Flipper Zero from first principles to independent projects. 19 modules, interactive labs, Wi-Fi Devboard and firmware guides.
- **Approx. words:** 846   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="home"`
- **Headings:** h2:Go beyond the button. > h3:Make the invisible visible. > h3:A theory. Then a test. > h3:From using it to creating it. > h2:Small board. New possibilities. > h2:Every skill. A step forward. > h3:Meet your radio lab > h3:Find the frequency > h3:Hear the signal: AM vs FM > h3:Decode a real protocol > h3:Your first legal replay > h3:Raw signals & rolling codes > h3:125 kHz RFID > h3:NFC at 13.56 MHz > h3:Firmware, apps & Momentum > h3:Troubleshooting field guide > h3:Foundation project: your signal atlas > h3:Infrared: build your own remote > h3:GPIO: signals you can touch > h3:USB and Bluetooth: understand trust > h3:iButton and U2F: identity is not authentication > h3:Build your first Flipper app > h3:Authorized security research: test the claim > h3:Mastery project: explain, measure, teach > h3:Wi-Fi Devboard & firmware > h2:Understanding is the real upgrade.
- **(headings above include the 19 module card titles as h3.)**
- **Callouts:** none
- **Internal links:** `legal.html`, `modules/00-setup.html`, `modules/01-frequency.html`, `modules/02-modulation.html`, `modules/03-protocols.html`, `modules/04-transmit.html`, `modules/05-raw-and-rolling.html`, `modules/06-rfid.html`, `modules/07-nfc.html`, `modules/08-momentum.html`, `modules/09-troubleshooting.html`, `modules/10-capstone.html`, `modules/11-infrared.html`, `modules/12-gpio.html`, `modules/13-usb-bluetooth.html`, `modules/14-contact-and-authentication.html`, `modules/15-app-development.html`, `modules/16-security-lab.html`, `modules/17-mastery.html`, `modules/18-wifi-devboard.html`, `notebook.html`, `playground.html`, `roadmap.html`
- **External links:** 0
- **Purpose:** Marketing landing page and course catalogue. Hero with an interactive 3D Flipper (`data-opts={"hero":true,"mode":"subghz"}`) and three mode buttons (`[data-signal-mode]` = subghz/nfc/wifi) that retitle the readout (`[data-signal-label|frequency|unit|caption|link]`) and reveal the Devboard art/board; three "experience" cards (Understand/Experiment/Build); a Wi-Fi Devboard feature band with a `devboard` scene; the 19 `a.mod-card[data-mod-card=mNN]` cards (hand-copied from course.js with a `.mc-status` span and `.mc-foot` tool list); progress bar via `[data-progress-text]` and a `[data-resume]` link; course-facts strip with hard-coded 19 / 10 / 116; closing CTA. Uses `learning.js` (resume link) but not the quiz bank.
- **Anchors / structure:** Sections: `#how`, `#course` (plus `wifi-feature-title`, `hero-title`). Inline SVG: 1 decorative wave (`.wave-art`). Images: `device.svg`, `wifi-board.svg`. Reveal-on-scroll classes: `.section-heading,.experience-card,.wifi-feature-inner,.mod-card,.closing-section,.firmware-explorer`.
- **v2 recommendation:** Rebuild as the marketing home in Astro (static, fast, SEO). Replace hand-copied cards and counts with data from the single course catalogue. Add what a seller needs and the legacy lacks: pricing/enrol CTA, syllabus preview, free-preview lesson, instructor/credibility, testimonials/outcomes, FAQ, refund and legal links.

### `primer.html`

- **Title:** Primer · Signal Path
- **Meta description:** The friendly big-picture intro to radio: what a signal is, how devices agree on a channel, how data rides the wave, and why some codes can be replayed and others can't.
- **Approx. words:** 2394   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="primer"`
- **Headings:** h2:Six ideas that explain almost everything > h3:1 A signal is a wiggle in the air > h3:2 Devices agree on a channel > h3:3 Modulation carries the data > h3:4 A protocol is the grammar > h3:5 Fixed code vs rolling code > h3:6 Listening isn't transmitting > h2:1 · A radio signal is a wiggle in the air > h2:2 · Devices agree on a channel (a frequency) > h2:3 · Modulation: how the data rides the wave > h3:Blink it on and off AM / OOK > h3:Wobble its colour FM / FSK > h2:4 · A protocol is the grammar of the message > h2:5 · Fixed code vs rolling code — the big fork > h3:Fixed code same every time > h3:Rolling code changes every press > h2:6 · Listening is not transmitting > h2:How to use this course > h3:Module 0 · Meet your radio lab > h3:The playground > h2:Check yourself
- **Callouts:** note=1, tip=1, story=1, legal=1
- **Internal links:** `case-studies.html`, `glossary.html`, `legal.html`, `modules/00-setup.html`, `modules/01-frequency.html`, `modules/03-protocols.html`, `modules/05-raw-and-rolling.html`, `playground.html`, `reference.html`
- **External links:** 0
- **Purpose:** Free, plain-language orientation to radio ("Six ideas that explain almost everything"): signal, channel, modulation, protocol, fixed vs rolling code, listening vs transmitting. Doubles as the pre-course reading in the pager (module 0 "previous" link goes to primer). Has its own 6-question quiz (`data-quiz="primer"`) and an `rf-calc` widget, no 3D scene, 1 SVG sine-wave figure, 4 callouts (note/tip/story/legal).
- **Anchors / structure:** Sections: `#ideas, #wiggle, #channels, #modulation, #protocols, #fixed-rolling, #listening, #how-to-use, #quiz`. SVG: sine wave with one cycle and one wavelength labelled.
- **v2 recommendation:** Move into the app as a free preview "Lesson 0" and expose it publicly as the lead magnet. Its structure (six numbered ideas) is the strongest teaching on the site; keep it and let it link into paid modules.

### `reference.html`

- **Title:** Reference · Signal Path
- **Meta description:** Quick-reference tables for RF on the Flipper Zero: frequencies, modulation presets, protocol families, .sub file fields, RFID/NFC facts, and unit conversions.
- **Approx. words:** 1259   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="reference"`
- **Headings:** h2:Common frequencies > h2:Modulation presets > h2:The Flipper's Sub-GHz radio > h2:Protocol families the Flipper decodes > h3:Fixed code replayable > h3:Rolling code shows a counter > h2:.sub file fields, and RAW > h2:RFID & NFC quick facts > h2:Wi-Fi Devboard: three software layers > h2:Unit cheats > h3:Wavelength > h3:Power: dBm ↔ mW > h2:Trusted resources > h3:Flipper Zero docs > h3:Momentum firmware > h3:FCC rules (US) > h3:Know your local law
- **Callouts:** note=2, warn=1
- **Internal links:** `case-studies.html`, `legal.html`, `modules/05-raw-and-rolling.html`, `modules/18-wifi-devboard.html`, `playground.html`
- **External links:** 6
- **Purpose:** Quick-reference tables: common frequencies, modulation presets, the Sub-GHz radio, protocol families (fixed vs rolling), .sub/RAW fields, RFID and NFC facts, Wi-Fi Devboard three software layers, unit cheat-sheet (wavelength, dBm to mW), trusted resources. Sticky TOC. 2 note + 1 warn callout, 6 outbound links.
- **Anchors / structure:** Sections: `#frequencies, #presets, #radio, #protocols, #sub-files, #rfid-nfc, #wifi-devboard, #units, #resources`.
- **v2 recommendation:** Move into the app as a persistent reference drawer / page; expose frequencies+presets tables publicly for SEO. Convert the tables to structured data so lessons can embed the same rows (single source of truth). Verify the two `docs.flipper.net` links lacking `/zero/`.

### `roadmap.html`

- **Title:** Learning path · Signal Path
- **Meta description:** A nineteen-module Flipper Zero course from first setup to independent security research.
- **Approx. words:** 432   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="roadmap"`
- **Headings:** h2:Your first session > h2:Build the lab in stages > h3:Start with what you have > h3:Add when the lesson needs it > h2:The route > h2:A session that makes knowledge stick > h2:What proficiency looks like
- **Callouts:** none
- **Internal links:** `index.html`, `legal.html`, `modules/00-setup.html`, `modules/17-mastery.html`, `notebook.html`, `playground.html`, `primer.html`
- **External links:** 0
- **Purpose:** Learning path: first-session checklist, kit in stages ("start with what you have" / "add when the lesson needs it"), the route (JS-rendered stage cards from `SP_COURSE.stages` into `[data-course-stages]`, each `.card#<stageId>` with eyebrow label, title, description, ordered links, "Checkpoint" evidence), a retrieval-practice session recipe (Retrieve, Predict, Practise, Explain, Revisit), and proficiency milestones. `[data-resume]` link and `[data-progress-text]`.
- **Anchors / structure:** Sections: `#start, #kit, #route, #routine, #milestones`; stage cards get ids `starter, signals, atlas, build, research, wifi`.
- **v2 recommendation:** Merge: the stage list and checkpoints become the curriculum section of the landing page and the "Your path" panel on the app dashboard (both generated from the catalogue). The session recipe and kit list move to a "How this course works" page or the pre-course onboarding.

### `notebook.html`

- **Title:** Learning notebook · Signal Path
- **Meta description:** A local notebook for predictions, findings, retrieval practice and course progress backups.
- **Approx. words:** 164   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="notebook"`
- **Headings:** h2:Your review queue > h2:Back up or move your progress
- **Callouts:** none
- **Internal links:** `modules/00-setup.html`
- **External links:** 0
- **Purpose:** Private learning notebook per module: form `#notebook-form` with module select `#note-module`, `#note-lesson` (open-lesson link), textareas `#note-setup`, `#note-prediction`, `#note-observation`, `#note-explanation`, date `#note-review`, `#note-status`, buttons submit + `#note-retrieved` ("I explained it without notes"); review queue `#review-queue`; backup `#export-backup` (JSON download `signal-path-YYYY-MM-DD.json`) and `#import-backup` (file input, 1 MB cap, strict `validateBackup`). `?module=mNN` query preselects. `beforeunload` warns on dirty edit. `<noscript>` points to `downloads/lab-notebook.md`.
- **Anchors / structure:** Sections: `#review, #backup`. This is the app-side surface of lesson part "Keep evidence".
- **v2 recommendation:** Move into the app as the signature feature (predict / observe / explain / revisit with review dates). Persist server-side per user with the same five fields + `review`, `retrieved`, `updated`; keep export/import as a data-portability feature. Preserve the 6000-char field cap and the backup schema `{format:"signal-path-backup", version:1, state}` for importing legacy backups.

### `quiz.html`

- **Title:** Quiz · Signal Path
- **Meta description:** Mixed quiz across every Signal Path module, plus per-module quizzes.
- **Approx. words:** 42   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="quiz"`
- **Headings:** h2:Your module scores
- **Callouts:** none
- **Internal links:** none
- **External links:** 0
- **Purpose:** Mixed quiz runner and score table. Selects `#quizCount` (10/15/25/All), `#quizScope` (Every module + each module with a bank + Primer), `#quizStart`; host `#quizHost`; score rows `#scoreRows` per module (best score + complete/in progress pill). Mixed quiz stores under id `mixed`. All inline JS (no shared module).
- **Anchors / structure:** No sections with ids. Table `Your module scores`.
- **v2 recommendation:** Merge into an app-level "Practice" hub with spaced-retrieval (reuse the same question schema `{q, opts[], a, why}`); per-lesson quizzes stay in the lesson. Note the score table omits the primer row.

### `playground.html`

- **Title:** Playground · Signal Path
- **Meta description:** Interactive RF simulators: modulation, spectrum, rolling codes, pulse decoding, and a Flipper screen you can drive.
- **Approx. words:** 238   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="playground"`
- **Headings:** h2:Flipper Screen > h2:Spectrum Scope > h2:Tune In > h2:Wave Lab > h2:RF Calculator > h2:Pulse Decoder > h2:Rolling Code Sim > h2:Tool Picker > h2:Flashcards > h2:Signal Atlas
- **Callouts:** none
- **Internal links:** none
- **External links:** 0
- **Purpose:** Gallery of all 10 interactive widgets each in a section whose id equals the widget name: flipper-sim, spectrum-scope, tune-in, wave-lab, rf-calc, pulse-decoder, rolling-sim, tool-picker, flashcards, signal-atlas. Sticky pill TOC.
- **Anchors / structure:** Sections: ten ids as listed. Widgets mount with default opts (no `compact` mode used on this page).
- **v2 recommendation:** Keep a public subset (spectrum-scope, wave-lab, rf-calc, tune-in) as a marketing demo to prove quality; ship the full set inside the app as "Lab tools". Rebuild as React islands.

### `glossary.html`

- **Title:** Glossary · Signal Path
- **Meta description:** Every RF term in the course, defined plainly — as flip cards and as a searchable A-Z list.
- **Approx. words:** 94   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="glossary"`
- **Headings:** h2:Flashcards > h2:All terms
- **Callouts:** none
- **Internal links:** none
- **External links:** 0
- **Purpose:** Flashcards (`data-widget="flashcards"`, reading `SP_GLOSSARY`) plus a searchable A-Z list (`#gl-search`, `#gl-list`, `#gl-count`; each item `.gl-item#<slug(term)>`, supports `#hash` deep links). 58 terms with `{term, short, long, tags[]}`; tags drawn from sub-ghz, modulation, protocol, security, rfid, nfc, hardware, units, legal, flipper. Inline script normalises field names defensively (`term|t|name`, `def|long|d|definition|desc`).
- **Anchors / structure:** Sections: `#flashcards, #all-terms`.
- **v2 recommendation:** Move into the app (and generate public `/glossary/<slug>` pages for SEO). Slugs must stay identical to `slug(term)` to keep legacy deep links working. Validate the dataset with a schema (Zod) instead of defensive field-guessing.

### `legal.html`

- **Title:** Romania, permission & responsible labs · Signal Path
- **Meta description:** Practical Romanian learning boundaries with ANCOM and Criminal Code sources.
- **Approx. words:** 862   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="legal"`
- **Headings:** h2:Three separate checks > h2:Romania: where to check > h2:Receiving is not blanket permission > h2:Choose an appropriate exercise > h3:Course lab targets > h3:Keep out of these labs > h2:Learn rolling codes in simulation > h2:Permission covers the system, not just the badge > h2:A reusable scope note > h2:If you find a weakness > h2:A useful default
- **Callouts:** none
- **Internal links:** `modules/05-raw-and-rolling.html`, `roadmap.html`
- **External links:** 6
- **Purpose:** Romania-specific permission and responsible-lab guide, reviewed 10 September 2026: three separate checks (authority, radio conditions, effect and data), where to check (ANCOM RO-IR SRD-01 ed. 5/2025), receiving vs transmitting, green/red exercise lists, rolling codes in simulation only, RFID policy, scope note template, vulnerability disclosure, default stance. 6 outbound sources (ANCOM, legislatie.just.ro, Flipper, Microchip).
- **Anchors / structure:** Sections: `#one-rule, #romania, #listening-transmitting, #green-red, #rolling, #rfid-policy, #scope, #disclosure, #stance`.
- **v2 recommendation:** Keep as a public trust page (it is a differentiator). Add the commercial legal set the site lacks: Terms of sale, Privacy/GDPR (Romania/EU), refund policy, cookie notice, disclaimer of non-legal-advice, and an other-jurisdictions note if selling beyond Romania. Have a qualified lawyer review before launch.

### `case-studies.html`

- **Title:** Case Studies · Signal Path
- **Meta description:** The beginner RF mysteries everyone hits, explained plainly: the Nice gate that copies once, the car fob that won't clone, and more.
- **Approx. words:** 1077   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="case-studies"`
- **Headings:** h2:The gate that appears to accept a replay > h2:The car fob that won't clone > h2:The garage remote that copied perfectly — and still works > h2:Frequency Analyzer says 433.92, but Read shows nothing > h2:I read my office badge fine, but the clone won't open the door
- **Callouts:** tip=1, legal=1
- **Internal links:** `legal.html`, `modules/03-protocols.html`, `modules/06-rfid.html`, `modules/09-troubleshooting.html`, `reference.html`
- **External links:** 3
- **Purpose:** Five "beginner RF mysteries" explained as hypothetical diagnostic examples: the gate that appears to accept a replay (embeds the `rolling-sim` widget), the car fob that will not clone, garage remote that copies and still works, Analyzer sees it but Read does not, badge clone that fails. Explicitly labelled hypothetical, not verified incidents. 1 tip + 1 legal callout; 3 outbound sources.
- **Anchors / structure:** Sections: `#nice-gate, #car-fob, #garage-fixed, #analyzer-no-read, #badge-clone`; a "The mysteries" jump list at top.
- **v2 recommendation:** Merge: turn each case into a short lesson-linked "case file" (module 03/05/06/09) shown in the app; keep one as a public teaser article. Preserve the hypothetical-example disclaimer.

### `sources.html`

- **Title:** Sources & corrections · Signal Path
- **Meta description:** Primary sources, review date, and technical corrections for Signal Path.
- **Approx. words:** 411   |   **`body[data-root]`/`data-page`:** `data-root="" data-page="sources"`
- **Headings:** h2:Setup and radio > h2:Other interfaces and development > h2:Wi-Fi Devboard and firmware > h2:Romania > h2:Corrections in this edition
- **Callouts:** none
- **Internal links:** `modules/18-wifi-devboard.html`
- **External links:** 39
- **Purpose:** Source register: primary documentation grouped in four sections with 39 outbound links (Setup and radio 8, Other interfaces and development 13, Wi-Fi Devboard and firmware 14, Romania 3) plus "Corrections in this edition" (1 external link). States review date 10 September 2026 and the rule to recheck sources before a hardware lab.
- **Anchors / structure:** Sections: `#setup-and-radio, #other-interfaces-and-development, #wifi-devboard, #romania, #corrections`.
- **v2 recommendation:** Keep public and generate it from the per-lesson sources data so it never drifts; add a dated changelog/corrections log and per-lesson "last reviewed" stamps. This page is a trust asset for a paid course.

### `404.html`

- **Title:** Lost signal · Signal Path
- **Meta description:** MISSING
- **Approx. words:** 28   |   **`body[data-root]`/`data-page`:** `data-root="/signal-path/" data-page="404"`
- **Headings:** none
- **Callouts:** none
- **Internal links:** `glossary.html`, `index.html`, `playground.html`
- **External links:** 0
- **Purpose:** Custom not-found page: "This frequency is dead air." Uses `data-ascii="flipper"` on a `<pre>` (rendered to half-block characters by `SP.pixel.ascii`) and links to course, playground, glossary using hard-coded `/signal-path/` absolute URLs (`body[data-root="/signal-path/"]`). No meta description. Loads course.js, site.js, presentation.js only.
- **Anchors / structure:** No sections.
- **v2 recommendation:** Rebuild with the framework 404; drop the `/signal-path/` GitHub-Pages base path assumption.

## 4. Lesson-shape gap analysis

Target shape (7 parts): **Outcome** (explicit, measurable goal), **Before you start** (prerequisites, gear, time, permission/safety), **Understand** (concept with figure), **Predict & practise** (a prediction prompt then a hands-on or simulated task), **Check** (quiz), **Keep evidence** (a deliverable and a notebook entry), **Continue** (what next and why).

Legend: **P** present and adequate, **W** weak (exists but implicit, thin or generic), **M** missing. Runtime-injected elements (notebook link, "Mark module complete" box, prev/next pager, TOC "Up next") exist on every lesson regardless of the HTML and are credited as W, never P, because they are generic and carry no lesson-specific content.

| Module | Lesson | Outcome | Before you start | Understand | Predict & practise | Check | Keep evidence | Continue | Notes |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Meet your radio lab | P | P | P | W | P (6) | W | W | Goal + win box; setup/legal/what-you-need sections; flipper-sim is practise but no "predict" prompt; evidence is a firmware/setup record only in an add-on block. |
| 1 | Find the frequency | P | W | P | P | P (8) | W | W | Gear chip only, no stated prerequisite (assumes Module 0). Tune In + scope + calculator then lab. "Keep the map" tip is a prompt but not a deliverable. |
| 2 | Hear the signal: AM vs FM | P | W | P | P | P (9) | W | W | Wave Lab before lab; lab is a preset sweep ("winning combo"). Evidence = say the combo aloud. |
| 3 | Decode a real protocol | P | W | P | W | P (8) | W | W | Pulse decoder good, but the lab starts with capture; no explicit prediction. Deliverable is a saved .sub (physical, not notebook). |
| 4 | Your first legal replay | P | P | P | P | P (8) | W | W | Strongest prerequisite/permission handling and the only explicit "Predict a replay result" lab (4.2). Evidence implicit in win box. |
| 5 | Raw signals & rolling codes | P | W | P | P | P (9) | M | W | Lab says "predict each result" and uses rolling-sim + tool-picker. No `.win` box and no stated deliverable; keystone lesson lacks a evidence step. |
| 6 | 125 kHz RFID | P | W | P | W | P (7) | W | W | 3D near-field scene and diagram, but lab has no prediction; win box only. |
| 7 | NFC at 13.56 MHz | P | W | P | W | P (6) | W | W | Same as 6; strong "what really copied" win criterion; quiz only 6 questions for a dense lesson. |
| 8 | Firmware, apps & Momentum | P | W | P | M | P (7) | P | W | No chips (no time/gear), no widget, no prediction. Good "Show that you can do it" list. Source list duplicated mid-page. |
| 9 | Troubleshooting field guide | P | W | P | P | P (7) | W | W | Decision flowchart + tool-picker + "change one thing at a time"; lab walks a stubborn device down the tree. Evidence = note you could hand to someone. |
| 10 | Foundation project: signal atlas | P | W | P | W | W (5) | P | P | Only lesson with a real "Continue" section; atlas export is the deliverable; quiz thin for a capstone. |
| 11 | Infrared | W | W | W | W | W (3) | P | W | Outcome only in lede; one 300-word concept section; lab says note what you expect (a prediction seed) but no structure. Needs figure, worked example, safety/neighbour-device note. |
| 12 | GPIO | W | W | W | M | W (3) | P | W | Calculation worked once (1.3 mA); no predict step; safety in lab text but no up-front "Before you start" box (voltage warning belongs there). |
| 13 | USB and Bluetooth | W | W | W | M | W (3) | P | W | Conceptually valuable trust-boundary framing, very short; no diagram. |
| 14 | iButton and U2F | W | W | W | M | W (3) | P | W | Shortest lesson (402 words). Needs comparison table/diagram of identifier vs authentication. |
| 15 | Build your first Flipper app | W | W | W | M | W (3) | P | W | Build lab only; references the shipped example in `examples/lab-companion/`; needs toolchain prerequisites listed up-front. |
| 16 | Authorized security research | W | W | W | W | W (4) | P | W | Excellent method (claim, positive/negative control, mitigation) but compressed; prediction is implicit in "write the claim". |
| 17 | Mastery project | W | W | W | W | W (3) | P | W | Project brief is strong; needs rubric, example portfolio, scoring; "predict outcome" appears in lab as step 1. |
| 18 | Wi-Fi Devboard & firmware | W | P | P | P | P (8) | P | W | No goal/outcome section (starts at "Same board. Different roles."), but prerequisites, hardware table, two labs with predictions, firmware explorer and recovery. Procedures documentation-reviewed only. |

Totals across 19 lessons (P / W / M): Outcome 11/8/0; Before 3/16/0; Understand 12/7/0; Predict 6/8/5; Check 11/8/0; Evidence 10/8/1; Continue 1/18/0.

Cross-cutting gaps for the v2 lesson schema:

- **Continue** is weak everywhere except Module 10: no lesson-authored "what you can now do / what next / why" block; only the injected pager. v2 should author a `next` frontmatter field (with a one-sentence bridge) per lesson.
- **Before you start** is a free-text gear chip in Generation A and a time+gear chip in Generation B. v2 needs structured fields: `duration`, `gear[]`, `prerequisites[]` (lesson ids), `transmit` (none / simulated / own-device / lab-AP), `permissionNote`, `safety[]`.
- **Predict**: the word appears in only 7 lessons (02, 03, 04, 05, 10, 17, 18) and is a dedicated lab step only in 04, 05 and 18. v2 should make a `predict` block mandatory before every lab/widget interaction and wire its answer into the notebook `prediction` field.
- **Keep evidence**: the notebook has fields `setup / prediction / observation / explanation / review` but no lesson tells the learner which field maps to which step. Lessons 08, 11-18 already phrase deliverables as 3-4 bullet "Show that you can do it" lists, which is the right shape to generalise into a typed `deliverables[]`.
- **Check**: quiz sizes 3-9 questions; 11-15 and 17 have only 3. A paid course should have at least 8-10 per lesson with distractor rationale (`why` exists for all items already).
- **Figures**: only 8 inline SVGs across 19 lessons (01, 02, 03, 05, 06, 07, 09, 10) plus 9 distinct 3D scenes (used by 00, 01, 02, 03, 05, 06, 07, 11, 12, 18). Lessons 04, 08, 13-17 have no visual at all.

## 5. Runtime contracts a port must preserve

### 5.1 File map (legacy/assets)

| File | Lines | Role |
|---|---|---|
| assets/js/data/course.js | 100 | `window.SP_COURSE = {modules[19], badges[24], stages[6]}`. Must load before `site.js` (enforced by `scripts/check-course.cjs` on every HTML entry point). modules item: `{id:"mNN", n, week, title, href:"modules/NN-slug.html", badge}`. badges item: `{id, ic (glyph), name, how}`. stages item: `{id, label, title, modules[ids], description, evidence}`; stages must list every module exactly once, in order. |
| assets/js/site.js | 435 | Runtime `window.SP`: state, theme, progress/badges, nav, module chrome, quiz engine, widget registry, toast, confetti, boot. |
| assets/js/learning.js | 342 | Resume links, stage cards (`[data-course-stages]`), notebook form logic, review queue, backup export/import + validator. Loaded on index, roadmap, notebook only. |
| assets/js/presentation.js | 405 | Brand logo swap, motion toggle, hero signal-mode buttons, firmware explorer, scroll-reveal, offscreen pausing; second IIFE: 1-bit pixel art engine `SP.pixel`, module-header LCD canvas, `[data-ascii]` renderer, on-demand loader for `scene3d.js`. |
| assets/js/scene3d.js | 454 | ES module (three.js vendored). Registers scenes: flipper, devboard, carrier, modulation, pulses, rolling, nearfield, infrared, gpio. IntersectionObserver lazy-mount; one WebGL renderer per scene. |
| assets/js/widgets/*.js | 136-383 each | 10 widgets, each `SP.registerWidget(name, (host, opts) => ...)`. |
| assets/js/data/quiz-bank.js | 1285 | `window.SP_QUIZ_BANK = { primer, m00...m18 }`, each an array of `{q, opts[], a (index), why}`. 116 questions total (counts in section 1 per lesson). |
| assets/js/data/glossary.js | 358 | `window.SP_GLOSSARY = [{term, short, long, tags[]}]`, 58 terms, sorted A-Z. |
| assets/css/site.css / presentation.css | 563 / 1431 | Design tokens on `:root` (light) with `@media (prefers-color-scheme: dark)` on `:root:not([data-theme="light"])` and `[data-theme="dark"]`. Tokens: --bg --surface --surface-2/3 --line(-strong) --text --muted --faint --orange(-ink/-soft) --btn-primary-bg/ink --cyan --red --green --yellow --purple (+ -soft) --shadow(-lift) --lcd-bg #F6A03A --lcd-ink #1B1509 --scope-* --radius 14px --radius-sm 9px --font-display/body/mono. |
| assets/models/flipper-zero.glb | 558 KB | GPL-3.0 derived Flipper body model with LICENSE file. See headline finding. |
| assets/images/signal-path-logo.png | 699 KB | Brand logo (oversized for a 29x32 render in `.brand-logo`). `device.svg`, `wifi-board.svg`, `favicon.svg` are small. |
| downloads/lab-notebook.md, wifi-devboard-notebook.md | 18 / 48 lines | Plain-text templates linked from notebook `<noscript>` and Module 18. |
| examples/lab-companion/ | 2 files | Flipper app source (`application.fam`, `lab_companion.c`) for Module 15. |
| scripts/ | 4 files | `build-site.py` (stage public files into `_site/`), `check-site.py` (links, fragments, duplicate ids, inline script syntax), `check-course.cjs` (course/quiz integrity), `build-flipper-glb.py`. Replace with CI checks in v2 (see 6.2). |
| robots.txt, sitemap.xml | - | `Allow: /signal-path/`; sitemap has 30 `<url>` entries on `https://o1tean.github.io/signal-path/`. Both hard-code the GitHub Pages subpath. |

### 5.2 Persistence (localStorage) and state shape

| Key | Written by | Value |
|---|---|---|
| `signalpath.v2` | `site.js` `save()` | JSON object, see below. |
| `signalpath.theme` | `site.js` toggleTheme; read by an inline `<head>` script on EVERY page to avoid flash | `"light"` or `"dark"`; absent = follow `prefers-color-scheme`. |
| `signalpath.motion` | `presentation.js` motion button | `"paused"` or `"playing"`. |

`signalpath.v2` JSON: `{ done: {mNN: bool}, quiz: {<quizId>: {score, total}}, badges: {<badgeId>: true}, notes: {mNN: {setup, prediction, observation, explanation, review (YYYY-MM-DD or ""), retrieved (YYYY-MM-DD or ""), updated (ISO)}}, atlas: [{name, category, frequency, modulation, protocol, codeType, notes, sample?:true}], flashIndex?: number, tuneIn?: {best: number} }`. quizId is a module id, `primer` or `mixed`.

- `flashIndex` (flashcards.js) and `tuneIn.best` (tune-in.js) are undeclared extras: they are removed by `SP.resetAll()` (it rebuilds state with only done/quiz/badges/atlas/notes, keeping atlas+notes) and silently dropped by `validateBackup()` on restore. Decide explicitly in v2.
- `SP.save()` fires `document` CustomEvent `sp:state`; theme changes fire `sp:theme` with `detail.theme`. Widgets and pages redraw on these.
- Quiz best-score rule: replace the stored result only if the ratio is higher, or equal with `total >=` the previous total. Perfect score awards `perfect-quiz`.
- `SP.markDone(id, bool)`: on first completion awards the module badge (quietly), awards `all-clear` when `doneCount === MODULES.length` (19, including optional Module 18), toasts, fires confetti (skipped under reduced motion). "Completion is self-reported" is stated in UI copy.
- Backup file: `{format:"signal-path-backup", version:1, exportedAt, state}`; validator caps: 1 MB file, atlas <= 500 rows, text fields <= 6000 (notes) / 10000 (atlas), dates `YYYY-MM-DD`, quiz ids restricted to module ids + `primer` + `mixed`, badges restricted to catalogue ids. Download name `signal-path-YYYY-MM-DD.json`. Restore replaces done/quiz/badges/atlas/notes after `confirm()`.
- Badges: 24 defined (19 module badges, `tuned-in`, `wave-rider`, `out-of-sync`, `perfect-quiz`, `all-clear`). Module badge ids differ from module slugs for 00-10 (e.g. m05 awards `code-breaker` named "Rolling-Code Realist") and equal the slug for 11-18. `all-clear` displays as earned only if all 19 are done.

### 5.3 Shared DOM and attribute contracts

| Contract | Used by | Behaviour |
|---|---|---|
| `body[data-root]` | site.js, presentation.js, scene3d.js | Relative prefix to site root: `""` top level, `"../"` in modules, `"/signal-path/"` in 404. |
| `body[data-page]` | site.js, presentation.js | `home, primer, reference, roadmap, notebook, quiz, playground, glossary, legal, case-studies, sources, 404, m00..m18`. `m*` pages trigger module chrome and nav highlight of "Course"; `mNN` drives the header LCD icon (`ICONS` map) and pager. |
| `header.topbar` (empty) | site.js `buildNav` | Replaced at runtime with brand, progress mini-bar, 8 nav links (Course `index.html#course`, Learning path, Notebook, Playground, Quiz, Reference, Sources, Legal), menu toggle, theme button; presentation.js appends a motion button and swaps the brand dot for the logo. `aria-current="page"` set from pathname. |
| `main` / `body > .wrap` | site.js boot | Gets `id="main-content"`, `tabindex=-1`, and a "Skip to content" link is prepended to `<body>`. |
| `.content` in module pages | site.js `buildModuleChrome` | Appends: notebook link (`notebook.html?module=mNN`), `.mod-complete[data-complete-module]` box with button, `.pager` (prev defaults to `primer.html` for m00; next defaults to `playground.html` after m18). Appends `.toc-next` ("Up next") to `.toc` when present. |
| `.toc a[href^="#"]` | site.js `tocSpy` | IntersectionObserver (rootMargin -20% 0 -70% 0) toggles `.active`. Requires section ids to match TOC hrefs. |
| `[data-progress-text]`, `[data-progress-bar]`, `[data-badges]`, `[data-mod-card="mNN"]` (+ `.mc-status`), `[data-complete-module]`, `[data-reset-progress]`, `[data-theme-toggle]` | site.js `renderProgressUI`, boot | Progress count text `n / 19`, bar width %, badge chips (`.badge`, `.earned`, `.b-ic`), card `.done` class and status text ("✓ complete" or "quiz s/t"), reset button with `confirm()`. |
| `[data-resume]`, `[data-course-stages]` | learning.js | Resume link = first module not done (else notebook `#review`); stage cards generated from `SP_COURSE.stages`. |
| `[data-quiz="id"]` (+ `data-limit`, `data-shuffle`) | site.js `mountQuizzes` | Renders `.q`, `.q-num`, `.q-text#spq-<id>-<i>`, `.opts[role=group]`, `.opt` (`.letter`, `.correct`, `.wrong`), `.explain[role=status]` ("Correct./Not quite." + `why`), `.quiz-foot` (score, best, Retry). Fallback "Quiz coming soon." if no bank entry. One answer per question, locked after click, no partial credit. |
| `[data-widget="name"]` (+ `data-opts` JSON, `data-mounted`) | site.js `mountWidgets` | Widgets register late; `SP.registerWidget` re-runs mounting. Error fallback renders a `.callout.warn` "This interactive couldn't load." Opt used everywhere: `{"mode":"compact"}`; flipper-sim also `{"start":"subghz"}`. |
| `[data-scene3d="name"]` (+ `data-label`, `data-opts`) | presentation.js loader, scene3d.js | Host `.scene3d` with `.scene3d-caption` child. `data-label` becomes canvas `aria-label`. Classes set: `scene3d-ready`, `scene3d-failed` (no WebGL), `scene3d-model`. Canvas is focusable; arrow keys rotate. Pauses offscreen / hidden / `motion-off`. Loader script only injected when any `[data-scene3d]` exists. Opts: flipper `{mode:"subghz"\|"nfc"\|"wifi", hero:bool}`, devboard-attached `{attach:true}`, nearfield `{kind:"fob"\|"card"}`. |
| `.mod-header` + `h1` + `.mod-week` | presentation.js | Generates `canvas.lcd-art` (128x64, 1-bit orange LCD) from page id icon, h1 text (wrapped, 14 chars x 3 lines), week text before "·". Re-renders every 333 ms when visible and motion allowed. Deleting `.mod-header` removes it. |
| `[data-ascii="name"]` | presentation.js | `<pre>` filled with half-block ASCII of a sprite (used on 404). |
| `[data-signal-stage]`, `[data-signal-mode]`, `[data-signal-label\|frequency\|unit\|caption\|link]`, `.hero-board` | presentation.js (index only) | Three modes (subghz 433.92 MHz, nfc 13.56 MHz, wifi 2.4 GHz) update text, link target and board visibility, and a MutationObserver in scene3d watches `data-mode` on the stage. |
| `[data-firmware-explorer]`, `[data-firmware-mode="debug\|marauder\|custom"]`, `.firmware-node` (span/b/small), `.firmware-explanation` | presentation.js (module 18) | Buttons use `aria-pressed`; three fixed node/explanation datasets in JS (content lives in code, must move to data). |
| Reveal classes | presentation.js | `.reveal-pending` / `.reveal-visible` on `.section-heading,.experience-card,.wifi-feature-inner,.mod-card,.closing-section,.firmware-explorer`; `.is-offscreen` on `.signal-stage,.board-scene,.experience-wave,.firmware-visual`; `html.motion-off` (user or system), `html.motion-suspended` (tab hidden). Keyboard focus removes `.reveal-pending`. |
| Content component classes | CSS | `.mod-header .mod-index .mod-titles .mod-week .lede .mod-meta .chip` / `.chips`; `.callout.{note\|tip\|warn\|story\|legal}` > `.ic` + `.callout-title`; `.lab > .lab-kicker + h3 + .lab-gear + ol`; `.win`; `.facts > .fact > .v + .k`; `.kv` (dl); `figure.diagram[role=img][aria-label]` > svg + figcaption; `.grid2/.grid3 > .card`; `.pill.{green\|orange\|cyan\|red\|yellow\|grey\|am\|fm\|fixed\|rolling}`; `.table-scroll > table`; `details > summary + .d-body`; `ol.steps`; `.flip` (inline Flipper menu path); `.mono`; `.source-note`; `.faint/.muted`. |

### 5.4 Widgets (10)

| `data-widget` | Shell title / subtitle | Mounted in lesson(s) | Reads / writes state | Badges | Notes |
|---|---|---|---|---|---|
| flipper-sim | Flipper Sub-GHz sim / walk the menu with the D-pad | 00, playground | - | - | DOM (no canvas) simulated Flipper screen + D-pad for the Sub-GHz menu tree; teaching approximation; opts `start`, `mode`. |
| spectrum-scope | Spectrum scope / watch the band, press a remote | 01, playground | - | - | Canvas; animates with rAF; dark scope palette tokens `--scope-*` stay dark in both themes. |
| tune-in | Tune In / read the peak, name the frequency | 01, playground | `SP.state.tuneIn.best` (extra key) | `tuned-in` at streak 5 | Game, streak counter. |
| rf-calc | RF calculator / wavelength & power, worked out | 01, primer, playground | - | - | DOM only (no canvas): (A) wavelength and quarter-wave from MHz, (B) dBm to mW converter. |
| wave-lab | Wave Lab / turn bits into a radio wave | 02, playground | - | `wave-rider` | Type bits, OOK or FSK waveform on canvas via fitCanvas. |
| pulse-decoder | Pulse decoder / How a pulse train becomes bits | 03, playground | - | - | Canvas; Princeton-style TE model (bit 0 = 1xTE high + 3xTE low, bit 1 = 3xTE high + 1xTE low, TE e.g. 400 us). |
| rolling-sim | Rolling-code sim / Why a replay works once, then never again | 05, case-studies, playground | - | `out-of-sync` when a replay fails | Builds `.callout` result with `.rc-reason`; stray-click guard with Reset escape hatch; synthetic, no real crypto. |
| tool-picker | Which tool? / Pick the right Sub-GHz move | 05, 09, playground | - | - | Scenario quiz using `.opt` buttons. |
| signal-atlas | Signal Atlas / your personal RF-device log | 10, playground | `SP.state.atlas[]` via `SP.save()` | - | CRUD + sample rows (`sample:true`, deduped by name) + JSON export/clear; footer states data stays on device. |
| flashcards | Glossary flashcards / flip to check yourself | glossary, playground | `SP.state.flashIndex` (extra key) | - | Reads `window.SP_GLOSSARY`; injects `<style id="sp-flashcards-css">` itself. |

Shared helpers widgets use: `SP.el`, `SP.widgetShell(host,title,sub)` (returns `{head, body, foot(html)}`), `SP.fitCanvas(canvas, draw)` (DPR-aware, ResizeObserver), `SP.cssVar`, `SP.award`, `SP.save`, `SP.toast`, `SP.reducedMotion`. Widgets read colours from CSS custom properties so they must be re-themed on `sp:theme`.

### 5.5 3D scenes (9 registered names)

| Scene | Used on | Notes |
|---|---|---|
| flipper | index (hero, `{hero:true,mode}`), 00 (`{mode:"subghz"}`) | Loads `assets/models/flipper-zero.glb` via GLTFLoader; LCD texture from `SP.pixel.lcd`; hero mode attaches a toggleable Devboard. |
| devboard | index (wifi band), 18 (`{attach:true}`) | Procedural board; `attach` mounts it on the Flipper GPIO edge. |
| carrier | 01 | Two carriers, same speed, different wavelength. |
| modulation | 02 | AM/FM. |
| pulses | 03 | Pulse train. |
| rolling | 05 | Counter/window. |
| nearfield | 06 `{kind:"fob"}`, 07 `{kind:"card"}` | Reader/tag coupling. |
| infrared | 11 | 38 kHz bursts to receiver. |
| gpio | 12 | Pins/LED. |

All scenes: scale unit 1 = 20 mm, ACES tone mapping, PMREM studio environment, three lights, `low-power` renderer, pixel ratio capped at 2, orbit via pointer/keyboard. Failure mode: class `scene3d-failed` (page must still read without them). Concept scenes are labelled "Concept animation" in captions - keep that honesty label.

### 5.6 Content data in code that should become content

- Course catalogue, badges, stages: `course.js` (becomes the single content-collection index).
- Quiz bank: `quiz-bank.js` (116 questions, schema above).
- Glossary: `glossary.js` (58 terms).
- Hero signal modes and firmware explorer datasets: hard-coded in `presentation.js`.
- Tool-picker scenarios and tune-in/atlas sample data: hard-coded inside each widget file.
- Index page counts and card copy: hard-coded in `index.html` (duplicates `course.js` titles; descriptions and `.mc-foot` tool lists exist only in HTML).
- Lesson sources: per-lesson `#sources` HTML plus a separate manual `sources.html` register (can drift: Module 18 body cites 27 links, `sources.html` Wi-Fi section lists 14).

## 6. Porting checklist (Astro + React)

### 6.1 Must preserve

- URL/slug stability: 19 lesson slugs (`00-setup` ... `18-wifi-devboard`) and the 12 top-level slugs, with redirects from legacy `.html` URLs; update sitemap/robots base path off `/signal-path/`.
- Section ids inside lessons (deep links, TOC, `#sources`, `#quiz`, `#lab`) and glossary term slugs (`slug(term)`).
- The state schema and key names for importing legacy `signalpath.v2` backups; the backup format `signal-path-backup` v1.
- Badge ids and the module-to-badge mapping; stage ids; quiz ids (`primer`, `m00-m18`, `mixed`).
- Accessibility behaviours: skip link, `aria-current`, `aria-live` toasts and explanations, `aria-pressed` toggles, keyboard-rotatable 3D canvas, reduced-motion + user motion pause, focus never trapped in `.reveal-pending`, no flash of wrong theme (inline head script).
- Honesty labels: "Concept animation", "hypothetical diagnostic example", "Completion is self-reported", simulator disclaimers, review date + "documentation-reviewed, not tested" on Module 18, and the legal/permission callouts (8 `callout legal` blocks in modules 00, 03, 04, 05, 06, 07, 09, 10, plus one each on primer and case-studies).
- Offline-resilient behaviours: all widgets work without network; storage failures are caught and surfaced via toast ("Browser storage is unavailable or full").

### 6.2 Replace or fix

- Replace the three-way duplication (course.js, index cards, roadmap) with one typed content collection (Zod-validated frontmatter) and generate counts.
- Normalise the two markup generations into one lesson schema (frontmatter: id, n, slug, title, week, stage, duration, gear[], prerequisites[], transmit, outcome, predict, deliverables[], next, sources[{title,url,reviewed}], quizId, widgets[], scenes[]).
- Deepen modules 11-17 (target 1,200+ words each, figure, worked example, predict prompt, 8-10 quiz items) before charging for them.
- Replace ad-hoc `scripts/` checks with CI: link/fragment check, duplicate ids, quiz schema, catalogue-vs-files integrity, external-link health (with the two suspect `docs.flipper.net` URLs).
- Load web fonts (self-hosted) or drop the unused font names; resize the 699 KB logo PNG; ship the GLB only where used (lazy per scene).
- Resolve the GPL-3.0 model licence question; keep the three.js MIT notice.
- Add missing meta description on `404.html`; add per-page Open Graph/JSON-LD (Course schema) on marketing pages.
- Move `flashIndex`/`tuneIn` into the declared state schema (or deliberately drop them).
- Any server-synced progress needs auth, a migration path for local data, and a privacy notice; legacy copy repeatedly promises "does not upload your entries" and "saved in this browser only" - those promises must be rewritten if sync is introduced.

