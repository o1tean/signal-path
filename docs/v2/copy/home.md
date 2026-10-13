# Home page copy

Route: `/` (prerendered). Prices come from `src/data/offer.ts`: `{price}`, `{priceFounding}`, `{currency}`. Counts (19, 6, 199, 10, 12) should render from `src/data/course.ts` and the quiz data so the copy cannot drift. Spelling: British (practise, analyser, licence).

Page order: hero, proof-strip, problem, method, tools, path, wifi, lab-rules, instructor (hidden until supplied), pricing-preview, final-cta. The testimonials component stays hidden while `src/data/testimonials.ts` is empty.

### hero
- **Eyebrow:** Pressed Read and the screen stayed empty?
- **Headline:** Explain what your Flipper Zero just captured.
- **Subheadline:** By week 3 you can name a remote's frequency, modulation and protocol, and say why a replay worked or failed. Modules 0 and 1 are free.
- **Body:** Microcopy under the buttons: "Complete is {currency}{price}, paid once, with a 30-day refund."
- **CTA:** Primary "Start the free starter" → `/learn/00-setup`. Secondary text link "See all 19 lessons" → `/course`.
- **Alternatives:**
  - Headline A: "Find out why the copied remote worked once." Rationale: names the most common beginner surprise (rolling codes, Module 5); a sharper hook, but it promises one lesson's insight rather than the whole course.
  - Headline B: "Read the frequency, name the protocol, explain the result." Rationale: shows the three skills of Stage 1 in order; more concrete, slightly mechanical in rhythm.
  - CTA A: "Open Module 0 free". Rationale: names the exact first step and its cost.
  - CTA B: "Try the first two lessons". Rationale: sets the size of the free part, useful if "starter" reads as jargon in testing.
- **Notes:** Human Action Model. Discomfort sits in the eyebrow as the reader's own question (the failed Read is the pain owners describe first). Vision is the headline: "Now you can explain what your Flipper Zero just captured" is compelling and true for anyone who finishes Stage 1. The subheadline says when that becomes true (end of Stage 1, week 3) and what the explanation contains, taken from Stage 1's "after this stage you can" list. Its frequency, modulation and protocol list is the hero's one list of three. The 12-week length is in the proof strip directly below, so the subheadline no longer lists topics. Path is the CTA: the course starts free. "Explain" was chosen over "understand" because the course measures understanding by a written explanation in the notebook. The price line answers "how much" in the hero without adding a second button.

### proof-strip
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:** Four items, number first:
  - 19 lessons in 6 stages
  - 12 weeks at 2–4 hours a week
  - 199 quiz questions, each with an explanation
  - 10 browser tools running on synthetic signals
- **CTA:** None
- **Alternatives:** None (facts, not claims).
- **Notes:** The only proof the course has today is its own contents, so the strip states counts and nothing else. No learner numbers, ratings or logos until they are real.

### problem
- **Eyebrow:** Where owners get stuck
- **Headline:** The capture failed, and the tutorial only showed which button to press.
- **Subheadline:** None
- **Body:** Maybe the remote transmits at 868.35 MHz and you were listening at 433.92. Maybe it uses FSK and the preset was AM650. Maybe it uses a rolling code, so the copy you saved will be accepted once at most. Many forum answers say to flash a different firmware. Each of these failures has a cause you can measure on your own devices.
- **CTA:** None
- **Alternatives:**
  - Headline A: "You pressed Read and the screen stayed empty." Rationale: shorter and closer to how owners phrase it; repeats the hero eyebrow, so use only if the eyebrow changes.
  - Headline B: "Your copied remote worked once, then stopped." Rationale: the rolling-code version of the same pain; strong for traffic from r/flipperzero threads about gates.
  - CTA A/B: None (section has no button).
- **Notes:** Three "Maybe" sentences are the section's one list of three, and each is a real failure mode taught in Modules 1, 2 and 5. The frequencies and preset names are from the reference tables, so the section passes the swap test. The forum line is hedged to "many" because we have no count; it matches the avatar pain in offer.md section 1.

### method
- **Eyebrow:** How each lesson works
- **Headline:** Write the prediction before you press Read.
- **Subheadline:** Each lab asks you to write your prediction, then what the Flipper showed.
- **Body:** Three cards.
  - **See the mechanism.** Each mechanism comes with a figure or a tool. Wave Lab turns the bits you type into an OOK or FSK waveform. The Rolling Code Sim shows a receiver rejecting a counter it has already seen.
  - **Test your prediction.** You change one thing at a time and compare the result with what you wrote down. Every lab ends with a "you've got it when" check. In Module 1 the check is stating the frequency of one device you own and how you measured it. When a lab fails, Module 9's decision trees start from the symptom you saw, such as "nothing decodes".
  - **Compile your own app.** In week 10 you build a small Flipper app in C with uFBT. Your notebook records the toolchain and firmware versions that built it.
- **CTA:** Text link "How a lesson is laid out" → `/course#lesson-shape`
- **Alternatives:**
  - Headline A: "Predict, test, write it down." Rationale: names the loop in four words; reads as a slogan, so weaker on the swap test.
  - Headline B: "Each lab starts with a guess you can check." Rationale: plainer for readers who don't think of themselves as technical.
  - CTA A: "See the seven parts of a lesson". Rationale: concrete count.
  - CTA B: "Read a free lesson" → `/learn/00-setup`. Rationale: shows the shape instead of describing it.
- **Notes:** The headline is the habit the course is built on (the notebook asks for the prediction first). The card heads are now claims rather than the legacy "Understand / Experiment / Build" labels, which would fit any course. The seven-part lesson shape is stated once, on the course page; this section links to it instead of repeating it. The middle card carries the likelihood proof from offer.md section 3: a real "you've got it when" example and one named troubleshooting tree.

### tools
- **Eyebrow:** Try it in the browser
- **Headline:** Watch bits turn into a waveform before you touch the device.
- **Subheadline:** Ten tools run in your browser on synthetic signals. None of them connects to a radio, so you can use them before your Flipper arrives.
- **Body:** Four featured tools, one line each (full list on `/tools`):
  - **Tune In.** A mystery device transmits. Read the peak and name the frequency.
  - **Wave Lab.** Type bits, choose OOK or FSK, and watch the carrier change.
  - **Spectrum Scope.** Press a simulated remote and see its peak rise out of the noise floor.
  - **Rolling Code Sim.** See why a copied rolling code is accepted once at most.
- **CTA:** "Open the tools" → `/tools`
- **Alternatives:**
  - Headline A: "See the signal your Flipper is listening for." Rationale: ties the tools to the device; less concrete than "bits into a waveform".
  - Headline B: "Practise radio without a radio." Rationale: short and true; slightly clever, so test it against the main line.
  - CTA A: "Try Tune In now". Rationale: one specific tool, one click to a first result.
  - CTA B: "See all 10 tools". Rationale: states the count.
- **Notes:** "Now you can watch bits turn into a waveform" passes: concrete and true (Wave Lab). The earlier "practise on a train" line implied offline use, which nobody has tested, so the subheadline now states the checkable fact (no Flipper needed). The 3D scenes (9 concept scenes plus the official Flipper Zero body model) belong in this section's visual; the tools page names them in its copy.

### path
- **Eyebrow:** The 12-week path
- **Headline:** Six stages, from first setup to a project someone else can repeat.
- **Subheadline:** Plan for 2–4 hours a week. The weeks are a suggested order, and your progress is saved if you take longer.
- **Body:** One row per stage (render from `course.ts`):
  - **Start here, weeks 0–1 (free).** Set up your lab and find your first frequency.
  - **Stage 1, weeks 1–3.** Decode a fixed-code remote and explain when replay fails.
  - **Stage 2, weeks 4–6.** Classify RFID and NFC training tags and build your signal atlas.
  - **Stage 3, weeks 7–10.** Work with IR, GPIO, USB and Bluetooth, then compile your own app.
  - **Stage 4, weeks 11–12.** Test one security claim and write it up so others can repeat it.
  - **Optional extension.** Flash, debug and recover the official Wi-Fi Devboard (3–4 sessions).
- **CTA:** "See every lesson" → `/course`
- **Alternatives:**
  - Headline A: "From your first frequency to your own Flipper app in 12 weeks." Rationale: two concrete end points; drops the portfolio outcome.
  - Headline B: "Nineteen lessons in the order that makes them easier." Rationale: speaks to readers who tried random tutorials; weaker on outcome.
  - CTA A: "See what each stage teaches". Rationale: matches the course page's job.
  - CTA B: "Read the full syllabus". Rationale: familiar word for course buyers.
- **Notes:** The earlier "nothing expires" line is cut until the owner sets the access term. Once it is set, it can go back in if true. [NEED: access term for Complete, e.g. lifetime of the product]

### wifi
- **Eyebrow:** Optional extension, Module 18
- **Headline:** Add the official Wi-Fi Devboard when you have one.
- **Subheadline:** One lesson on the ESP32-S2 board, taken after Modules 8, 12 and 15.
- **Body:** You flash the board's firmware and debug your own Flipper app over the Black Magic probe. Measurements run on a 2.4 GHz access point you own. If a flash fails, the recovery worksheet takes the board back to a known firmware. Allow 3–4 extra sessions.
- **CTA:** Text link "What Module 18 covers" → `/course#stage-wifi`
- **Alternatives:**
  - Headline A: "Your Wi-Fi Devboard, flashed, debugged and recoverable." Rationale: outcome-first; a list of three, so it uses the section's cap.
  - Headline B: "Got the Wi-Fi Devboard? There's a lesson for it." Rationale: reader's own question, casual; good for owners who bought the board and never used it.
  - CTA A: "See the Wi-Fi lesson". Rationale: plain.
  - CTA B: "Check what the board needs". Rationale: leads to prerequisites.
- **Notes:** The legacy page named Marauder and captive portals here. They are left out of marketing copy because the lab rules exclude deauthentication and disruption tests. The inventory notes Module 18 was documentation-reviewed and not tested on a physical board; if that is still true at launch, add "Procedures checked against the official documentation" to the body. [NEED: confirm Module 18 tested on hardware]

### lab-rules
- **Eyebrow:** Scope and sources
- **Headline:** Every lab runs on equipment you own or have written permission to test.
- **Subheadline:** The course teaches how signals and access systems work, and how people defend them.
- **Body:** Lessons that transmit say so at the top, next to the time and gear. Before your first hardware session, the Romanian lab guide takes you through three checks. They cover who can authorise the test, which radio conditions apply and what the test could affect. Technical claims link to primary sources, such as the Flipper documentation, Microchip's HCS301 datasheet and ANCOM's radio interfaces. Each lesson shows the date we last checked its sources. Official firmware is enough for every lesson.
- **CTA:** "Read the Romanian lab guide" → `/romania-lab-guide`. Secondary text link "See the sources" → `/sources`.
- **Alternatives:**
  - Headline A: "Your devices, your space, written scope." Rationale: compressed; a fragment list, so weaker for a trust section.
  - Headline B: "Learn the mechanism, then test it where you're allowed to." Rationale: softer; links learning and permission in one line.
  - CTA A: "Check the rules before your first lab". Rationale: action-first.
  - CTA B: "See where each claim comes from". Rationale: leads with sources for sceptical readers.
- **Notes:** This section answers the fear of doing something illegal by accident (offer.md section 1). It avoids "legal" as a promise and states what the course does instead. The lab guide is Romania-specific; if the course sells widely outside Romania, add one line pointing others to their national regulator.

### instructor
- **Eyebrow:** Who wrote it
- **Headline:** [NEED: instructor name]
- **Subheadline:** [NEED: one sentence of relevant, checkable background, e.g. role and years working with radio or embedded hardware]
- **Body:** [NEED: two or three sentences in the first person on why the course exists and how it is maintained. A photo. A link to a public profile or repository.]
- **CTA:** None
- **Alternatives:** None until the facts exist.
- **Notes:** Hide this section until the owner supplies the facts. Do not write a biography from guesses.

### pricing-preview
- **Eyebrow:** Price
- **Headline:** The first two lessons are free. The other 17 cost {currency}{price}, once.
- **Subheadline:** Complete comes with a 30-day refund, and you don't need to give a reason.
- **Body:** Two cards.
  - **Signal Path Starter, {currency}0.** Modules 0 and 1, the primer, the glossary and the starter quiz. Tune In, Wave Lab and Spectrum Scope run in your browser. Create a free account to save your progress and get the Preset & Frequency Cheat Sheet.
  - **Signal Path Complete, {currency}{price} once.** All 19 lessons, all 10 tools and the 199-question bank. It also includes the troubleshooting trees, the lab notebook system and the source of the app you build in week 10. Course updates are included.
  - Line under the cards: "Pay {currency}{price} today, or split it into instalments at checkout where available."
- **CTA:** "Get Signal Path Complete" → `/pricing#buy`. Secondary "Start the free starter" → `/learn/00-setup`.
- **Alternatives:**
  - Headline A: "Start free, then pay once for the full path." Rationale: the previous main line; fails the swap test, so keep it only as a fallback.
  - Headline B: "Pay once for all 19 lessons and every update." Rationale: shorter; leads with the payment model.
  - CTA A: "Buy Signal Path Complete". Rationale: plainer verb for readers ready to pay.
  - CTA B: "See what Complete includes" → `/pricing`. Rationale: lower commitment for first-time visitors.
- **Notes:** If the founding price is active, show "{currency}{priceFounding} until {foundingEnds}, then {currency}{price}" on the Complete card. Never show it without a real end date in config. The free tool names come from `freeTools()` in `src/data/tools.ts` (currently Tune In, Wave Lab and Spectrum Scope). The headline puts the price in the section because the swap test failed on the old line; render 17 as total lessons minus free lessons.

### final-cta
- **Eyebrow:** None
- **Headline:** Start with Module 0 tonight.
- **Subheadline:** Modules 0 and 1 are free and start in the browser. Bring the Flipper when the first hardware lab asks for it.
- **Body:** Microcopy: "Free. No card required."
- **CTA:** "Start the free starter" → `/learn/00-setup`
- **Alternatives:**
  - Headline A: "Find your first frequency in the browser in under 20 minutes." Rationale: the stronger line, with a number; switch to it only after someone has timed a new learner (see Notes).
  - Headline B: "Read your first frequency before your Flipper arrives." Rationale: true of Tune In in Module 1; speaks to readers still waiting for the device.
  - CTA A: "Open Module 0". Rationale: exact.
  - CTA B: "Start learning free". Rationale: generic; keep only as a fallback.
- **Notes:** The 20-minute headline is held back as Alternative A because nobody has timed it. The figure comes from offer.md ("first win in the browser in under 20 minutes"). Time a new learner through Module 1's Tune In before launch, and promote it if it holds. [NEED: verify under-20-minute first result] "No card required" is the page's single stated absence, placed next to the CTA.
