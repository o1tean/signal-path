# Title tags and meta descriptions

One entry per public route. Titles stay under 60 characters and use "· Signal Path" as the suffix. Descriptions run 140–160 characters, contain no em dashes and no exclamation marks, and state a fact a searcher can use. Counts render from data where the template allows.

Routes that must not be indexed (`noindex`): `/learn` (dashboard), `/learn/notebook`, `/learn/quiz`, `/learn/atlas`, `/account`, `/login`, `/checkout/success`, `/checkout/cancel`, `/auth/*`, `/api/*`. They still get a title.

### home
- **Headline (title):** The 12-week Flipper Zero course · Signal Path
- **Body (description):** A 12-week Flipper Zero course: 19 lessons, 10 browser tools and 199 quiz questions, with labs on equipment you own. The first two lessons are free.
- **Alternatives:**
  - Title A: "Flipper Zero course: learn what your device is doing · Signal Path". Rationale: keyword first; over 60 characters, so it would truncate.
  - Title B: "Learn how your Flipper Zero works · Signal Path". Rationale: plain intent match.
- **Notes:** Description is 147 characters. The title now follows the file's suffix rule; the old one led with the brand and used the stock "from first principles".

### course
- **Headline (title):** Course syllabus: 19 lessons in 12 weeks · Signal Path
- **Body (description):** 19 lessons in six stages over 12 weeks: setup, decoding protocols, RFID and NFC, building a Flipper app, and a final project another person can repeat.
- **Alternatives:**
  - Title A: "Flipper Zero course syllabus · Signal Path". Rationale: keyword-led.
  - Title B: "The 12-week path · Signal Path". Rationale: short; less searchable.
- **Notes:** None.

### pricing
- **Headline (title):** Pricing: Complete for {currency}{price} · Signal Path
- **Body (description):** Two lessons free. Signal Path Complete is {currency}{price} once: all 19 lessons, 10 tools, 199 quiz questions, updates and a 30-day refund, no reason needed.
- **Alternatives:**
  - Title A: "Pricing and refunds · Signal Path". Rationale: no price in the title, for when the price changes often.
  - Title B: "Signal Path pricing: free starter or Complete". Rationale: names both options.
- **Notes:** The title now ends with the "· Signal Path" suffix like every other route. Rendered with "€149" the description is 145 characters; check again if the price or currency changes. "No reason needed" matches the guarantee copy on the pricing page.

### tools
- **Headline (title):** Interactive RF tools for Flipper Zero owners · Signal Path
- **Body (description):** Ten browser tools on synthetic signals. Name a frequency, watch OOK and FSK waves, decode pulses and test a rolling code. Three are free to try here.
- **Alternatives:**
  - Title A: "Radio simulators for Flipper Zero, three free · Signal Path". Rationale: puts "free" in the title without overstating it; count renders from `freeTools()`.
  - Title B: "Tools · Signal Path". Rationale: minimal; poor for search.
- **Notes:** None.

### primer
- **Headline (title):** Radio primer for Flipper Zero owners · Signal Path
- **Body (description):** Six ideas behind remotes and key fobs: frequency, channels, modulation, protocols, fixed versus rolling codes, and listening versus transmitting.
- **Alternatives:**
  - Title A: "How radio works, in six ideas · Signal Path". Rationale: broader search intent.
  - Title B: "Primer · Signal Path". Rationale: legacy title; weak for search.
- **Notes:** None.

### reference
- **Headline (title):** Flipper Zero Sub-GHz reference tables · Signal Path
- **Body (description):** Common frequencies by region, the AM270, AM650, FM238 and FM476 presets, protocol families, .sub and RAW file fields, RFID and NFC facts, and unit conversions.
- **Alternatives:**
  - Title A: "Flipper Zero frequencies and presets · Signal Path". Rationale: matches the two most searched tables.
  - Title B: "Reference · Signal Path". Rationale: minimal.
- **Notes:** None.

### glossary
- **Headline (title):** Flipper Zero and RF glossary · Signal Path
- **Body (description):** Every term in the Signal Path course, including OOK, TE, T5577 and NTAG, defined in a sentence or two. Search the A to Z list or review them as flashcards.
- **Alternatives:**
  - Title A: "RF terms explained plainly · Signal Path". Rationale: plainer intent.
  - Title B: "Glossary · Signal Path". Rationale: minimal.
- **Notes:** Per-term pages (`/glossary/{slug}`), if built: title "{term}: meaning on the Flipper Zero · Signal Path", description = the term's short definition, trimmed to 155 characters.

### sources
- **Headline (title):** Sources and corrections · Signal Path
- **Body (description):** The primary sources behind each Signal Path lesson: Flipper docs, chip datasheets and ANCOM rules. Each has a review date, and corrections are logged.
- **Alternatives:**
  - Title A: "Where our claims come from · Signal Path". Rationale: plain-language.
  - Title B: "Sources · Signal Path". Rationale: minimal.
- **Notes:** None.

### case-studies
- **Headline (title):** Flipper Zero beginner problems, explained · Signal Path
- **Body (description):** Why a copied gate remote works once, why a car fob won't clone, and why Read shows nothing at 433.92 MHz. Five hypothetical cases traced to the cause.
- **Alternatives:**
  - Title A: "Why your Flipper copy worked once · Signal Path". Rationale: targets the most common search.
  - Title B: "Case studies · Signal Path". Rationale: minimal.
- **Notes:** Adjust if only one case stays public.

### romania-lab-guide
- **Headline (title):** Romanian lab guide: permission and radio rules · Signal Path
- **Body (description):** Before a hardware lab in Romania, check who can authorise the test, which ANCOM radio conditions apply and what Criminal Code articles 360 to 365 say.
- **Alternatives:**
  - Title A: "Flipper Zero in Romania: what to check first · Signal Path". Rationale: question-shaped search intent; long.
  - Title B: "Romania and permission · Signal Path". Rationale: legacy label; short.
- **Notes:** Description is 150 characters.

### learn-lesson
- **Headline (title):** {title} · Signal Path
- **Body (description):** The lesson's frontmatter `description` (150–160 characters, written per the lesson brief).
- **Alternatives:** None (template).
- **Notes:** Free lessons (Modules 0 and 1) are indexed. Paid lessons are indexed with the paywall view, which shows only frontmatter, so the description must make sense to someone who has not bought the course.

### legal-refunds
- **Headline (title):** Refund policy · Signal Path
- **Body (description):** Full refund within 30 days of buying Signal Path Complete, no reason needed. How to ask, how long the money takes to arrive, and the Stage 1 promise.
- **Alternatives:** Title A: "30-day refund policy · Signal Path". Title B: "Refunds · Signal Path". Rationale: A puts the number in search results; B is minimal.
- **Notes:** None.

### legal-privacy
- **Headline (title):** Privacy notice · Signal Path
- **Body (description):** What Signal Path collects: your email, your purchases through Stripe, and your progress if you turn on sync. Sign-in cookies only, and no ad trackers.
- **Alternatives:** Title A: "Privacy · Signal Path". Title B: "How we handle your data · Signal Path". Rationale: A is minimal; B is plain-language.
- **Notes:** None.

### legal-terms
- **Headline (title):** Terms of use · Signal Path
- **Body (description):** The terms for using Signal Path and buying Signal Path Complete: your licence, the lab rules, refunds, liability and how either side can end the contract.
- **Alternatives:** Title A: "Terms · Signal Path". Title B: "Terms of use and sale · Signal Path". Rationale: A is minimal; B signals the purchase terms.
- **Notes:** Update once the lawyer finalises the terms.

### legal-imprint
- **Headline (title):** Imprint · Signal Path
- **Body (description):** Who runs Signal Path: legal entity, registered address and contact details.
- **Alternatives:** Title A: "Legal notice · Signal Path". Title B: "About the publisher · Signal Path". Rationale: A uses the common English term; B is plainer.
- **Notes:** Short description is fine; this page is rarely searched.

### login
- **Headline (title):** Sign in · Signal Path
- **Body (description):** Sign in to Signal Path with a one-time email link. New here? The same link creates your free account.
- **Alternatives:** None.
- **Notes:** `noindex`.

### account
- **Headline (title):** Your account · Signal Path
- **Body (description):** None (`noindex`).
- **Alternatives:** None.
- **Notes:** None.

### learn-dashboard
- **Headline (title):** My course · Signal Path
- **Body (description):** None (`noindex`).
- **Alternatives:** None.
- **Notes:** Sub-pages: "Lab notebook · Signal Path", "Practice quiz · Signal Path", "Signal atlas · Signal Path".

### checkout
- **Headline (title):** Success: "Payment · Signal Path". Cancel: "Checkout cancelled · Signal Path".
- **Body (description):** None (`noindex`).
- **Alternatives:** None.
- **Notes:** The success title stays neutral because the page starts in the pending state.

### not-found
- **Headline (title):** Page not found · Signal Path
- **Body (description):** None.
- **Alternatives:** Title A: "Dead air · Signal Path". Rationale: matches the page joke; less clear in a browser tab.
- **Notes:** None.
