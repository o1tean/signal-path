# Tools page copy

Route: `/tools` (prerendered; replaces legacy `playground.html`). Each tool line has an access label. The labels follow `src/data/tools.ts`, which marks three tools `free: true`: Tune In, Wave Lab and Spectrum Scope. That matches offer.md ("the three browser tools") and the pricing and home copy. Render every free-tool count and name from `freeTools()` so no page can drift.

Flipper Sim (Module 0) and RF Calculator (Module 1) are `free: false` in the data but mount inside free lessons. On this page they show as locked, with a label pointing to the free lesson that contains them. [NEED: owner to confirm the free lessons may mount these two tools while `/tools` keeps them locked]

Free tools mount on the page. Locked tools show a still image, the line below and "In Signal Path Complete".

### tools-hero
- **Eyebrow:** Interactive tools
- **Headline:** See a signal before you capture one.
- **Subheadline:** Ten tools that run in your browser on synthetic signals. None of them connects to a radio, and each one also appears inside the lesson that teaches it.
- **Body:** Three are free to use here. The other seven come with Signal Path Complete. Its lessons also use nine 3D concept scenes and a 3D model of the Flipper Zero.
- **CTA:** Primary "Try Tune In" → `#tune-in`. Secondary "Start the free starter" → `/learn/00-setup`.
- **Alternatives:**
  - Headline A: "Ten tools for seeing what the Flipper hears." Rationale: ties the tools to the device; "hears" is a loose metaphor for receiving.
  - Headline B: "Practise radio without a radio." Rationale: short; slightly clever.
  - CTA A: "Open Wave Lab". Rationale: the most visual tool for first contact.
  - CTA B: "Get all 10 tools" → `/pricing#buy`. Rationale: for visitors who already decided.
- **Notes:** "Now you can see a signal before you capture one" is true: Spectrum Scope and Wave Lab show the simulated signal first. The 3D line uses the brief's fact. The Flipper Zero model is derived from GPL-3.0 CAD files (see `legal.md` terms, section 10); cut "and a 3D model of the Flipper Zero" if the licence question is not settled before launch. [NEED: model licence decision]

### tune-in
- **Eyebrow:** Module 1 · Free
- **Headline:** Tune In
- **Subheadline:** A mystery device transmits. Read the peak and name its frequency; five right in a row earns the Tuned In badge.
- **Body:** None
- **CTA:** None (tool mounts in place).
- **Alternatives:** Subheadline B: "Name the frequency from the peak, five times in a row." Rationale: shorter for small cards.
- **Notes:** None.

### wave-lab
- **Eyebrow:** Free demo · Used in Module 2
- **Headline:** Wave Lab
- **Subheadline:** Type bits, choose OOK or FSK, and watch the data change the carrier.
- **Body:** None
- **CTA:** None
- **Alternatives:** Subheadline B: "See the same bits as AM and as FM." Rationale: uses the words owners see in preset names.
- **Notes:** None.

### spectrum-scope
- **Eyebrow:** Module 1 · Free
- **Headline:** Spectrum Scope
- **Subheadline:** A simulated spectrum analyser with an animated noise floor. Press a remote and watch its peak rise.
- **Body:** None
- **CTA:** None
- **Alternatives:** Subheadline B: "Find a transmission in the noise, the way the Frequency Analyzer does." Rationale: links to the Flipper feature by name.
- **Notes:** None.

### rf-calculator
- **Eyebrow:** Module 1 and the primer · Open in the free Module 1
- **Headline:** RF Calculator
- **Subheadline:** Wavelength and quarter-wave antenna length from a frequency, and dBm to milliwatts in both directions.
- **Body:** None
- **CTA:** Locked state: "Use it in Module 1, free" → `/learn/01-frequency`.
- **Alternatives:** Subheadline B: "Why a 433 MHz antenna is about 17 cm, worked out for any frequency." Rationale: leads with a fact from the primer.
- **Notes:** None.

### pulse-decoder
- **Eyebrow:** Module 3 · In Signal Path Complete
- **Headline:** Pulse Decoder
- **Subheadline:** Turn a pulse train into bits the way the Flipper's Read mode does.
- **Body:** None
- **CTA:** Locked state: "See what Complete includes" → `/pricing`.
  - Alternatives:** Subheadline B: "Measure the pulse widths and read the bits they encode." Rationale: the two steps the tool walks through.
- **Notes:** None.

### rolling-code-sim
- **Eyebrow:** Module 5 · In Signal Path Complete
- **Headline:** Rolling Code Sim
- **Subheadline:** A remote, a receiver with an acceptance window and a Flipper that captures and replays. See why a copied code is accepted once at most.
- **Body:** None
- **CTA:** Locked state: "See what Complete includes" → `/pricing`.
- **Alternatives:** Subheadline B: "Watch the receiver's counter reject a code it has already seen." Rationale: names the mechanism.
- **Notes:** The case studies page embeds this tool; if that page stays public, consider making the sim free too.

### flipper-sim
- **Eyebrow:** Module 0 · Open in the free Module 0
- **Headline:** Flipper Sim
- **Subheadline:** Drive the Sub-GHz menus with an on-screen D-pad and learn the menu tree before you hold the device.
- **Body:** None
- **CTA:** Locked state: "Use it in Module 0, free" → `/learn/00-setup`.
- **Alternatives:** Subheadline B: "The Flipper's screen and buttons, in your browser." Rationale: shorter; less specific about Sub-GHz.
- **Notes:** None.

### signal-atlas
- **Eyebrow:** Module 10 · In Signal Path Complete
- **Headline:** Signal Atlas
- **Subheadline:** Log the devices you own by frequency, modulation, protocol and code type, then export the list as JSON or CSV.
- **Body:** None
- **CTA:** Locked state: "See what Complete includes" → `/pricing`.
- **Alternatives:** Subheadline B: "A record of every remote and tag you've tested, and what you found." Rationale: outcome framing.
- **Notes:** None.

### flashcards
- **Eyebrow:** Glossary · In Signal Path Complete
- **Headline:** Flashcards
- **Subheadline:** The glossary as flip cards. Space flips a card and the arrow keys move between them.
- **Body:** None
- **CTA:** Locked state: "See what Complete includes" → `/pricing`.
- **Alternatives:** Subheadline B: "Review the 58 course terms a few at a time." Rationale: ties it to the retrieval routine without an untested time claim; count renders from the glossary data.
- **Notes:** The glossary page itself is free. If its flashcards are free there, change this label to "Free". [NEED: confirm]

### tool-picker
- **Eyebrow:** Modules 5 and 9 · In Signal Path Complete
- **Headline:** Tool Picker
- **Subheadline:** Read a scenario and choose Read, Read RAW, the Frequency Analyzer, or stop because it's a rolling code.
- **Body:** None
- **CTA:** Locked state: "See what Complete includes" → `/pricing`.
- **Alternatives:** Subheadline B: "Pick the right Flipper feature for the job, and learn when the answer is to stop." Rationale: makes the restraint part of the skill.
- **Notes:** None.

### tools-cta
- **Eyebrow:** None
- **Headline:** Use all ten inside the lessons that teach them.
- **Subheadline:** Signal Path Complete includes every tool, 19 lessons and 199 quiz questions for {currency}{price}.
- **Body:** None
- **CTA:** Primary "Get Signal Path Complete" → `/pricing#buy`, with microcopy "30-day refund, no reason needed." Secondary "Start the free starter" → `/learn/00-setup`.
- **Alternatives:**
  - Headline A: "Each tool comes with the lesson that explains it." Rationale: states why the tools are better inside the course.
  - Headline B: "The other seven tools are in Complete." Rationale: plain; the count renders from `freeTools()`.
  - CTA A: "See what Complete includes" → `/pricing`. Rationale: lower commitment.
  - CTA B: "Buy for {currency}{price}". Rationale: price on the button.
- **Notes:** None.
