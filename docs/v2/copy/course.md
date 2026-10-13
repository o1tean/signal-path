# Course page copy

Route: `/course` (prerendered; replaces legacy `roadmap.html`). Stage rows and lesson titles render from `src/data/course.ts` and lesson frontmatter; the copy below gives the stage-level text and the "after this stage you can" lists. Lesson titles are quoted as they stand in the legacy catalogue, with two retitles flagged in Notes.

### hero
- **Eyebrow:** Signal Path Complete · 19 lessons
- **Headline:** Go from first setup to an experiment someone else can repeat.
- **Subheadline:** Twelve weeks at 2–4 hours a week, in six stages. Each stage ends with evidence you keep in your lab notebook.
- **Body:** Modules 0 and 1 are free. The rest is in Signal Path Complete, {currency}{price} once, with a 30-day refund.
- **CTA:** Primary "Start the free starter" → `/learn/00-setup`. Secondary text link "See the price" → `/pricing`.
- **Alternatives:**
  - Headline A: "Nineteen lessons, from the menu tree to your own app." Rationale: concrete start and end points; leaves out the research stage.
  - Headline B: "What you will be able to do after each stage." Rationale: describes the page plainly; weak as a promise.
  - CTA A: "Open Module 0 free". Rationale: exact first step.
  - CTA B: "Get Signal Path Complete" → `/pricing#buy`. Rationale: for visitors arriving from pricing who came to check the syllabus.
- **Notes:** "Now you can go from first setup to an experiment someone else can repeat" is true of Stage 4's portfolio and specific to this course's evidence model.

### lesson-shape
- **Eyebrow:** How a lesson works
- **Headline:** Every lesson has the same seven parts.
- **Subheadline:** Most take 30–60 minutes, and you can stop between parts.
- **Body:**
  1. **Outcome.** One thing you will be able to do, in one sentence.
  2. **Before you start.** Earlier lessons it builds on, the gear, the time, and whether anything transmits.
  3. **Understand.** The mechanism from first principles, with a figure, a table or a tool, plus the misconceptions people bring to it.
  4. **Predict and practise.** One or two labs. You write the prediction first, then compare it with what the Flipper shows. Each lab has a control case and a "you've got it when" check.
  5. **Check yourself.** A quiz where every answer has an explanation, plus two reflection questions.
  6. **Keep evidence.** What to record in your notebook and an example of an adequate entry.
  7. **Continue.** What the next lesson builds on, a question to answer from memory a week later, and the sources with the date they were checked.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Read it, predict it, test it, write it down." Rationale: the loop as verbs; a four-item list, so check rhythm against the section.
  - Headline B: "One shape for all 19 lessons." Rationale: shorter; states consistency, which buyers of uneven tutorials value.
  - CTA A/B: None.
- **Notes:** The seven parts are the H2s enforced by `scripts/check-content.ts`, so this list stays true by construction. Bold labels are acceptable here because the list mirrors real headings.

### stage-starter
- **Eyebrow:** Start here · Weeks 0–1 · Free
- **Headline:** Set up your lab and find your first frequency.
- **Subheadline:** Two lessons that need only a browser to begin.
- **Body:** You learn the Flipper's menus on a simulated screen. Before any hardware lab, you record your firmware version and region and write a scope note. Then you use the Frequency Analyzer, Spectrum Scope and Tune In to turn "frequency" into a number you can read.
  - Lessons: 0 Meet your radio lab · 1 Find the frequency
  - After this stage you can:
    - move through the Sub-GHz menus without guessing
    - state the frequency of one device you own, and how you measured it
  - Evidence: a setup record and one explained observation of a synthetic signal.
- **CTA:** "Start Module 0" → `/learn/00-setup`
- **Alternatives:**
  - Headline A: "Meet the device and read your first frequency." Rationale: friendlier verb; "meet" is softer than "set up".
  - Headline B: "Two free lessons to find out if the method suits you." Rationale: frames the stage as the trial it is.
  - CTA A: "Open the first lesson". Rationale: plain.
  - CTA B: "Read the primer first" → `/primer`. Rationale: for readers who want theory before the device.
- **Notes:** Free stage, so its CTA goes straight to the lesson with no sign-in.

### stage-signals
- **Eyebrow:** Stage 1 · Weeks 1–3
- **Headline:** Decode a fixed-code remote and explain when replay fails.
- **Subheadline:** Modulation, protocols, one controlled replay and why rolling codes defeat replay.
- **Body:** You choose the preset that makes a signal appear and turn a pulse train into bits. Reading a saved `.sub` file line by line shows what the Flipper stored. You send a saved signal to your own device in your own space. The Rolling Code Sim then shows why a copied rolling code is accepted once at most.
  - Lessons: 2 Hear the signal: AM vs FM · 3 Decode a real protocol · 4 Your first replay, on your own device · 5 Raw signals and rolling codes
  - After this stage you can:
    - name a remote's frequency and modulation, and explain why both must match
    - name a fixed-code protocol from a capture
    - explain, with the counter, why replaying a rolling code fails
  - Evidence: an annotated capture and a written explanation of when replay fails.
- **CTA:** None (locked stages link to the lesson, which shows the paywall).
- **Alternatives:**
  - Headline A: "Turn a capture into a protocol name and a key." Rationale: describes what the Read screen shows once you understand it.
  - Headline B: "Find out why the copied remote worked once." Rationale: the strongest hook in the course; use it if the home hero does not.
  - CTA A/B: None.
- **Notes:** The legacy title for Module 4 is "Your first legal replay". "Legal" reads as a promise the course cannot make in every country, so the copy uses "Your first replay, on your own device". [NEED: owner to confirm the retitle in Module 4 frontmatter]

### stage-atlas
- **Eyebrow:** Stage 2 · Weeks 4–6
- **Headline:** Classify training tags and fix a setup that won't decode.
- **Subheadline:** 125 kHz RFID, NFC at 13.56 MHz, firmware choices and a troubleshooting method.
- **Body:** You read, save and emulate an unenrolled training tag, then learn what the Flipper can and cannot do with each NFC card family. You make a documented firmware choice with a backup and a way back. Module 9's decision trees start from three common failures: nothing decodes, replay does nothing, and range is poor. Module 10 pulls it together into your signal atlas.
  - Lessons: 6 125 kHz RFID · 7 NFC at 13.56 MHz · 8 Firmware, apps and Momentum · 9 Troubleshooting field guide · 10 Foundation project: your signal atlas
  - After this stage you can:
    - tell LF RFID from NFC by how the reader powers the tag
    - choose and record a firmware setup you can restore
    - diagnose a failed capture step by step
  - Evidence: a signal atlas of your training devices, with observations, limits and a recovery procedure.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Build a signal atlas of every training device you own." Rationale: names the stage's deliverable.
  - Headline B: "Know what your firmware does before you change it." Rationale: speaks to owners being told to flash a fork; covers one lesson of five.
  - CTA A/B: None.
- **Notes:** "won't decode" keeps the troubleshooting pain in the headline. Module 8 keeps "Momentum" in its title because owners search for it; the lesson treats forks as optional.

### stage-build
- **Eyebrow:** Stage 3 · Weeks 7–10
- **Headline:** Work with IR, GPIO, USB and Bluetooth, then compile your own app.
- **Subheadline:** Five interfaces in four weeks, ending with a small C app built with uFBT.
- **Body:** You build a two-button infrared remote for your own TV. On a breadboard, you wire an LED and estimate its current. You type visible text into your own computer to see why a host trusts a keyboard. Comparing an iButton ID with a U2F key shows where identification ends and authentication begins. In week 10 you compile a Flipper app and record the toolchain and firmware versions.
  - Lessons: 11 Infrared: build your own remote · 12 GPIO: signals you can touch · 13 USB and Bluetooth: understand trust · 14 iButton and U2F: identity is not authentication · 15 Build your first Flipper app
  - After this stage you can:
    - read a pinout and estimate the current through a resistor
    - explain what a USB host trusts and why
    - build and install a small app from source
  - Evidence: a documented interface experiment and an app build with its test results.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Build your first Flipper app in week 10." Rationale: the most wanted outcome of the stage, with a time.
  - Headline B: "Signals you can touch, and code you wrote." Rationale: shorter and warmer; less exact.
  - CTA A/B: None.
- **Notes:** Modules 11–17 are being rewritten from outlines into full lessons (inventory section 0). Hold this whole stage block, not only the "after this stage you can" list, until the rewritten lessons contain these labs; the body describes them too. The same hold applies to `stage-research`. [NEED: confirm after lesson rewrite]

### stage-research
- **Eyebrow:** Stage 4 · Weeks 11–12
- **Headline:** Test one security claim and write it up so others can repeat it.
- **Subheadline:** A bounded test with controls, then a final project you can explain, measure and teach.
- **Body:** You write a threat model that names the access, capability, target and security property at stake. Then you test one claim inside a written scope. The final project is a repeatable experiment with a prediction, one controlled variable and the failures you recorded on the way.
  - Lessons: 16 Authorised security research: test the claim · 17 Mastery project: explain, measure, teach
  - After this stage you can:
    - scope a test so someone else could approve it
    - report a result in enough detail for another learner to reproduce it
  - Evidence: a final portfolio another learner can follow and critique.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Finish with a portfolio another learner can follow." Rationale: the deliverable as the headline.
  - Headline B: "Run an authorised test from scope note to write-up." Rationale: shows the process; "authorised" signals the guardrail.
  - CTA A/B: None.
- **Notes:** "Mastery" stays in the Module 17 title only. It is never used as a verb in headlines. Module 16's title is spelled "Authorized" in `src/data/course.ts`; this page is British, so change the title there to "Authorised security research: test the claim" to match. [NEED: owner to confirm the Module 16 retitle]

### stage-wifi
- **Eyebrow:** Optional extension · After Modules 8, 12 and 15
- **Headline:** Flash, debug and recover the official Wi-Fi Devboard.
- **Subheadline:** One lesson and a recovery worksheet. Allow 3–4 extra sessions.
- **Body:** You debug your own Flipper app over the board's Black Magic firmware and compare what different firmwares can do. If a flash goes wrong, you recover the ESP32-S2. Measurements run on a 2.4 GHz access point you own.
  - Lesson: 18 Wi-Fi Devboard and firmware
  - After this lesson you can: put the board back to a known firmware; take a repeatable measurement on your own test access point.
  - Evidence: a firmware and recovery record, and a repeatable test on your own lab access point.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Put your Wi-Fi Devboard back to a known firmware, every time." Rationale: names what the recovery worksheet does; "every time" depends on the hardware test in Notes.
  - Headline B: "The official Devboard, from first flash to recovery." Rationale: a range with real end points.
  - CTA A/B: None.
- **Notes:** Same hardware-testing caveat as on the home page. [NEED: confirm Module 18 tested on a physical board]

### gear
- **Eyebrow:** What you need
- **Headline:** Modules 0 and 1 start in the browser. Each lesson lists the gear it needs.
- **Subheadline:** You can buy each part in the week its lesson starts.
- **Body:**
  - **To begin:** a browser. Then your Flipper Zero, a microSD card, a USB cable, and an infrared remote and TV you own. For radio practice, a fixed-code training doorbell or chime that is legal to use where you live.
  - **Later:** unenrolled EM4100 or T5577 tags and NFC practice tags, a standalone training reader, a breadboard, an LED, a 1 kΩ resistor and jumper wires.
  - **Optional:** an iButton key, and for Module 18 the official Wi-Fi Devboard with your own 2.4 GHz test access point.
  - The core course needs no external radio module.
- **CTA:** None
- **Alternatives:**
  - Headline A: "The gear list, in the order you need it." Rationale: plain and useful; no promise.
  - Headline B: "Start with a browser. Add hardware when a lesson asks for it." Rationale: the previous line; fits most hardware courses, so it is a fallback.
  - CTA A/B: None.
- **Notes:** If affiliate links are added later, label them as affiliate links next to the item.

### session-routine
- **Eyebrow:** How to study
- **Headline:** A one-hour study session, in five steps.
- **Subheadline:** Repeat it for each block of your 2–4 hours a week.
- **Body:**
  1. **Retrieve, 5 minutes.** Explain the last mechanism without notes and note the gaps.
  2. **Predict.** Write down what the lab should do and why, with the scope and equipment.
  3. **Practise, 20–40 minutes.** Run a short controlled experiment and change one thing at a time.
  4. **Explain.** Answer the quiz, read its reasoning, and log one observation and one open question.
  5. **Revisit.** Review after a day, then again a few days later.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Retrieve, predict, practise, explain, revisit." Rationale: the five steps as verbs; works as a heading only beside the list.
  - Headline B: "How to spend your 2–4 hours a week." Rationale: practical framing tied to the time budget.
  - CTA A/B: None.
- **Notes:** "One hour" adds the step times (5 + 20–40 + short write-ups), which sum to 25–45 minutes before the write-ups. Time a real session and change the headline if it runs well over an hour. [NEED: time one full session after the lesson rewrite]

### fit
- **Eyebrow:** Is it for you
- **Headline:** For Flipper Zero owners who want to know why it behaves the way it does.
- **Subheadline:** None
- **Body:** You should be comfortable following step-by-step instructions and writing a few lines in your notebook after each lab. You don't need a radio or electronics background; the primer and Module 1 start from what a frequency is. If you want ready-made files to run against other people's gates, cars or badges, this course has none.
- **CTA:** None
- **Alternatives:**
  - Headline A: "Who gets the most out of Signal Path." Rationale: neutral label; less specific.
  - Headline B: "Curious, a bit technical, and holding a Flipper." Rationale: describes the reader in their terms; a fragment list.
  - CTA A/B: None.
- **Notes:** The disqualifying sentence states one real absence once and stops there. Following it with "it teaches X instead" would make a contrast reveal; what the course teaches is on the rest of the page. It protects the refund rate and the guardrails in offer.md section 10.

### final-cta
- **Eyebrow:** None
- **Headline:** Start with the two free lessons.
- **Subheadline:** After Module 1, Signal Path Complete opens the other 17 lessons for {currency}{price}, with 30 days to change your mind.
- **Body:** Microcopy: "Free. No card required."
- **CTA:** Primary "Start the free starter" → `/learn/00-setup`. Secondary "Get Signal Path Complete" → `/pricing#buy`.
- **Alternatives:**
  - Headline A: "Module 0 is free. Open it now." Rationale: exact; imperative.
  - Headline B: "Try the method on two lessons first." Rationale: frames the free stage as a test of fit.
  - CTA A: "Open Module 0". Rationale: exact.
  - CTA B: "Compare Starter and Complete" → `/pricing`. Rationale: for readers deciding between tiers.
- **Notes:** None.
