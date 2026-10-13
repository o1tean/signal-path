# Resources copy

Intro blurbs for the public resource pages and the resources index (if one is built; otherwise the navbar's Resources menu uses the one-line descriptions). Routes: `/primer`, `/reference`, `/glossary`, `/sources`, `/case-studies`, `/romania-lab-guide`.

### resources-index
- **Eyebrow:** Resources
- **Headline:** The primer, tables, glossary and rules you use during the labs.
- **Subheadline:** All of them are free to read, with or without an account.
- **Body:** None
- **CTA:** None (cards link to each page).
- **Alternatives:**
  - Headline A: "Free reading for Flipper Zero owners." Rationale: plainer; weaker on use.
  - Headline B: "Keep these open while you work." Rationale: describes how they are used; short.
  - CTA A/B: None.
- **Notes:** Menu one-liners (kept in step with `chrome.md`): Primer "Six ideas to read before Module 0"; Reference "Frequencies, presets and file fields"; Glossary "Every term in the course, defined"; Sources "Where each claim comes from"; Case studies "Five beginner problems, traced to the cause"; Romanian lab guide "What to check before a hardware lab". [NEED: confirm the reference page is public, as `pricing.md` `tier-starter` also asks]

### primer
- **Eyebrow:** Primer · Free · Start here
- **Headline:** Six ideas behind frequency, modulation, protocols and rolling codes.
- **Subheadline:** Signal, channel, modulation, protocol, fixed versus rolling code, and why listening differs from transmitting.
- **Body:** Read it before Module 0. It ends with six check questions, each with an explanation.
- **CTA:** "Read the primer" → `/primer`
- **Alternatives:**
  - Headline A: "The big picture of radio, in one sitting." Rationale: from the legacy page's own line; less specific, and usable only once the reading time is known.
  - Headline B: "Read this before you press Read." Rationale: ties the primer to the first button owners press; slightly playful.
  - CTA A: "Start with the primer". Rationale: positions it as step zero.
  - CTA B: "Read the six ideas". Rationale: echoes the headline.
- **Notes:** The legacy primer tells readers to confirm Momentum is installed and counts "nine simulators". Both contradict v2 (official firmware, ten tools) and must change in the port. "In one sitting" is cut until the reading time is known; once it is, add it to the eyebrow ("Primer · Free · {n} minutes"). [NEED: primer reading time in minutes]

### reference
- **Eyebrow:** Reference
- **Headline:** Frequencies, presets and .sub fields on one page.
- **Subheadline:** Regional frequency bands, the four stock presets, protocol families, .sub and RAW fields, RFID and NFC facts, and unit conversions.
- **Body:** Keep it open in a second tab while you run a lab.
- **CTA:** "Open the reference" → `/reference`
- **Alternatives:**
  - Headline A: "The numbers you look up mid-lab." Rationale: describes the moment of use.
  - Headline B: "AM650, 433.92 MHz and the rest, in tables." Rationale: concrete; a little cryptic for new owners.
  - CTA A: "See the tables". Rationale: short.
  - CTA B: "Look up a preset". Rationale: most common lookup.
- **Notes:** The earlier "a number here always matches the lesson" line is cut because it depends on the planned single source of truth (inventory section 3), which does not exist yet. Add "The tables read from the same data as the lessons" back once that ships.

### glossary
- **Eyebrow:** Glossary
- **Headline:** Every term in the course, defined in a sentence or two.
- **Subheadline:** Search the A–Z list, or review the terms as flashcards.
- **Body:** Lessons link a term to this page the first time it appears.
- **CTA:** "Browse the glossary" → `/glossary`
- **Alternatives:**
  - Headline A: "Look up TE, OOK or T5577 in one place." Rationale: real terms a beginner meets in the first weeks; concrete.
  - Headline B: "Look up any term without leaving the lab." Rationale: use-focused.
  - CTA A: "Search the glossary". Rationale: matches the search field.
  - CTA B: "Review with flashcards". Rationale: points at the retrieval habit.
- **Notes:** The legacy glossary has 58 terms. Render the count from data if you add one.

### sources
- **Eyebrow:** Sources and corrections
- **Headline:** Where each claim in the course comes from.
- **Subheadline:** The primary documents behind every lesson, the date we last checked each one, and a log of corrections.
- **Body:** Flipper's user and developer documentation, chip datasheets such as Microchip's HCS301, ANCOM's radio interfaces and the Romanian Criminal Code. Before a hardware lab, recheck the sources it cites; firmware and rules change.
- **CTA:** "See the sources" → `/sources`
- **Alternatives:**
  - Headline A: "Every source, dated." Rationale: short; a fragment.
  - Headline B: "Every source we cite, with the date we checked it." Rationale: leads with the review dates, which most courses don't show.
  - CTA A: "Read the corrections log" → `/sources#corrections`. Rationale: shows the course admits errors.
  - CTA B: "See what each lesson cites". Rationale: specific.
- **Notes:** A corrections log is a trust asset for a paid course; keep it visible.

### case-studies
- **Eyebrow:** Case studies
- **Headline:** Five beginner problems, worked through to the cause.
- **Subheadline:** Why a copied gate remote seems to work once, why a car fob won't clone, and three more problems new owners run into.
- **Body:** Each case is a hypothetical example built from documented behaviour, and it is labelled as one. Each explains a cause. None is a procedure for a real system.
  - A gate remote you own that seems to accept a replay
  - A car fob that won't clone
  - A garage remote you own that copied and still works
  - The Frequency Analyzer showing 433.92 MHz while Read shows nothing
  - A training badge copy that won't open a training reader
- **CTA:** "Read the case studies" → `/case-studies`
- **Alternatives:**
  - Headline A: "Why the copy worked once, and four other beginner problems." Rationale: leads with the most common one.
  - Headline B: "Five Flipper problems, traced from symptom to cause." Rationale: names the method of each case; plainer.
  - CTA A: "Start with the gate case". Rationale: the best-known case.
  - CTA B: "Read the five cases". Rationale: exact.
- **Notes:** The disclaimer comes before the list, and the list frames each case around equipment the learner owns or a training setup. Check that each case page matches this framing; the car fob case should stay about why cloning fails, with no owner implied. The inventory recommends one public case with the rest inside lessons. If so, change the headline to "One beginner problem, worked through to the cause" and point the CTA at that case. [NEED: confirm public case count]

### romania-lab-guide
- **Eyebrow:** Romania · Read before your first hardware lab
- **Headline:** What to check before you test anything on real hardware.
- **Subheadline:** Three checks: who can authorise the test, which radio conditions apply, and what the test could affect.
- **Body:** The guide points to ANCOM's current radio interface for non-specific short-range devices (RO-IR SRD-01, edition 5/2025) and to Criminal Code articles 360–365. It includes a scope note you can copy into your notebook and covers what to do if you find a weakness. It is a learning guide and is not individual legal advice.
- **CTA:** "Read the lab guide" → `/romania-lab-guide`
- **Alternatives:**
  - Headline A: "Curiosity, with a clear scope." Rationale: the legacy headline; calm and on-voice, less concrete.
  - Headline B: "The three checks before a hardware lab." Rationale: number-led; plain.
  - CTA A: "Copy the scope note". Rationale: the most reusable item.
  - CTA B: "Check the rules for Romania". Rationale: geographic clarity.
- **Notes:** Legacy review date is 10 September 2026; re-review before launch and update the date on the page. The ANCOM document name and edition are specific claims outside the brief's fact list; check them against ANCOM's site at that review. [NEED: confirm RO-IR SRD-01 edition 5/2025 is still current] Learners outside Romania should be pointed to their own regulator in the page intro. [NEED: decide whether to add an "other countries" note]
