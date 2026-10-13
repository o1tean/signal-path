# Pricing page copy

Route: `/pricing` (prerendered; the buy button's behaviour depends on sign-in state at runtime). Tokens: `{price}`, `{priceFounding}`, `{currency}` from `src/data/offer.ts`. Two extra tokens are introduced and should live in the same file: `{foundingEnds}` (a real date, shown only when the founding price is on) and `{priceMentored}` (shown only when Mentored is `available: true`). Bonus values below are the anchors from offer.md, written in the course currency; store them as `bonuses[].value` in `offer.ts` and compute the total.

The FAQ entries also feed `src/data/faq.ts`, so their ids are stable.

Every buy button on this page, and on any page that links to `#buy`, carries the same microcopy line: "30-day refund, no reason needed." Put it in the buy-button component so no section can drop it. Sections below that show a buy button repeat the line so the copy stays checkable.

### hero
- **Eyebrow:** Pricing
- **Headline:** Pay {currency}{price} once for 19 lessons, 10 tools and 199 quiz questions.
- **Subheadline:** Try Modules 0 and 1 free first. After you buy Signal Path Complete, you have 30 days to ask for a full refund.
- **Body:** None
- **CTA:** "Get Signal Path Complete" → `#buy`. Microcopy: "30-day refund, no reason needed."
- **Alternatives:**
  - Headline A: "Pay once for the full 12-week course." Rationale: the previous line; shorter, but it would fit any course, so keep it as a fallback.
  - Headline B: "Start free and upgrade when you reach the first capture." Rationale: places the upgrade at the moment the free part ends (Module 1 into Module 2).
  - CTA A: "Buy Complete for {currency}{price}". Rationale: price on the button removes a surprise at checkout.
  - CTA B: "Compare the two options" → `#compare`. Rationale: for readers who arrived undecided.
- **Notes:** The pricing hero's job is to answer "how much and how often". The headline now does that with the price and the three counts buyers check, which is the section's one list of three. The subheadline puts the free lessons and the refund in the order a buyer meets them.

### tier-starter
- **Eyebrow:** Signal Path Starter
- **Headline:** {currency}0
- **Subheadline:** Modules 0 and 1 in full, up to your first real capture.
- **Body:**
  - Modules 0 and 1
  - The primer, the glossary and the reference tables
  - Tune In, Wave Lab and Spectrum Scope in the browser
  - The starter quiz
  - With a free account: progress saved across devices, and the Preset & Frequency Cheat Sheet
- **CTA:** "Start the free starter" → `/learn/00-setup`. Microcopy: "No card required."
- **Alternatives:**
  - Headline/subheadline A: "Free · The first two lessons, in full". Rationale: states that the free lessons are complete lessons.
  - Headline/subheadline B: "Free · Try the method before you pay". Rationale: the previous subheadline; fits any course, so it is a fallback only.
  - CTA A: "Open Module 0". Rationale: exact.
  - CTA B: "Create a free account" → `/login`. Rationale: leads to the cheat sheet and sync; one step more than opening the lesson.
- **Notes:** The reference tables are listed as free because the inventory recommends a public subset for search; confirm. [NEED: confirm reference is public] The subheadline names where the free part ends (Module 2, the first real capture), which is the natural upgrade point. The tool names render from `freeTools()` in `src/data/tools.ts`.

### tier-complete
- **Eyebrow:** Signal Path Complete · Full course
- **Headline:** {currency}{price}, paid once
- **Subheadline:** The 12-week Flipper Zero course, from first setup to your own authorised experiments.
- **Body:**
  - All 19 lessons in 6 stages, including the Wi-Fi Devboard extension
  - All 10 browser tools
  - 199 quiz questions with explanations
  - Field Troubleshooting Trees (printable)
  - The Lab Notebook System: templates, an evidence rubric and a review schedule
  - Lab Companion app source and a uFBT build guide
  - The Permission & Scope Checklist
  - The Preset & Frequency Cheat Sheet
  - Updates to the course, included
  - Line under the button: "30-day refund, no reason needed."
  - Line under the refund line: "After day 30, the Stage 1 promise still refunds you if Stage 1 doesn't let you explain your first capture."
- **CTA:** "Get Signal Path Complete". Signed in → `POST /api/checkout`. Signed out → `/login?next=/pricing#buy`, with microcopy "You'll sign in with your email first so the course is tied to your account."
- **Alternatives:**
  - Headline/subheadline A: "{currency}{price} · Every lesson, tool and update". Rationale: summary for narrow cards.
  - Headline/subheadline B: "{currency}{price} · Everything in Starter, plus 17 lessons". Rationale: makes the comparison with Starter explicit.
  - CTA A: "Buy for {currency}{price}". Rationale: price on the button.
  - CTA B: "Get the full course". Rationale: shorter for mobile.
- **Notes:** This card carries the visual emphasis. "Authorised experiments" is the offer's subtitle and doubles as a guardrail; `offer.ts` spells it "authorized", so change the subtitle there to match this page's British spelling. [NEED: access term, e.g. "access for the life of the course"] "No reason needed" replaces "no questions asked" because the account page offers an optional "What made you decide?" field after the refund.

### tier-mentored
- **Eyebrow:** Signal Path Mentored · [NEED: seats] places per quarter
- **Headline:** {currency}{priceMentored}
- **Subheadline:** Complete, plus a written review of your final portfolio and two 45-minute sessions.
- **Body:**
  - Everything in Signal Path Complete
  - A written review of your Stage 4 portfolio
  - Two 45-minute video sessions, booked when you choose [NEED: booking method and session window]
  - Places this quarter: {seatsLeft} of [NEED: seats]
- **CTA:** "Apply for a Mentored place" → [NEED: application or checkout route]
- **Alternatives:**
  - Headline/subheadline A: "{currency}{priceMentored} · With feedback on your final project". Rationale: leads with the main difference.
  - Headline/subheadline B: "{currency}{priceMentored} · Two sessions and a written portfolio review". Rationale: names both extras.
  - CTA A: "Reserve a place". Rationale: matches limited capacity.
  - CTA B: "Ask about Mentored" → [NEED: support email]. Rationale: for an early, manual version.
- **Notes:** Hidden while `available: false`. The seat count must come from a real counter. Do not show this card as a decoy without real capacity.

### founding-price
- **Eyebrow:** Founding price
- **Headline:** {currency}{priceFounding} until {foundingEnds}
- **Subheadline:** After that date, Signal Path Complete costs {currency}{price}. Founding learners get the same updates as everyone else.
- **Body:** None
- **CTA:** "Get Complete for {currency}{priceFounding}" → `#buy`. Microcopy: "30-day refund, no reason needed."
- **Alternatives:**
  - Headline A: "The first learners pay {currency}{priceFounding}". Rationale: explains why the price is lower; needs the end date in the subheadline.
  - Headline B: "{currency}{priceFounding} for the first [NEED: seat count] learners". Rationale: use if the window is a seat cap rather than a date.
  - CTA A: "Buy at the founding price". Rationale: names the reason.
  - CTA B: "Get Signal Path Complete". Rationale: the standard label, with the price shown on the card.
- **Notes:** Render only when `offer.ts` has a real end date or seat cap. No countdown timer. Make the build fail if `foundingOffer.enabled` is true while both `endsAt` and `seats` are null, so the section can't ship without a real limit.

### which-one
- **Eyebrow:** Choosing
- **Headline:** Starter ends where your first real capture begins.
- **Subheadline:** Module 2, the first paid lesson, is where you capture a signal from a device you own.
- **Body:**
  - **Pick Starter** if you don't own a Flipper yet, or you want to see how a lesson works before you pay. You get Modules 0 and 1 in full.
  - **Pick Complete** if you already own a Flipper and a capture has failed or a copy worked only once. Pick it too if you want the stages after Module 1, from protocols to RFID, NFC and your own app.
  - If you want ready-made files to run against other people's gates, cars or badges, neither option has them.
- **CTA:** Primary "Get Signal Path Complete" → `#buy`, with microcopy "30-day refund, no reason needed." Secondary "Start the free starter" → `/learn/00-setup`.
- **Alternatives:**
  - Headline A: "Which one is right for you". Rationale: the plain label; fails the swap test.
  - Headline B: "Start free if you're still deciding. Buy Complete if a capture just failed." Rationale: maps each tier to a situation; long for a heading.
  - CTA A/B: as in `compare`.
- **Notes:** Placed above `compare`, to answer "which is right for me" before the table. The disqualifier comes from `course.md` `fit` and is the section's one stated absence.

### compare
- **Eyebrow:** Side by side
- **Headline:** What each option includes
- **Subheadline:** None
- **Body:** Table, Starter vs Complete:
  | | Starter | Complete |
  |---|---|---|
  | Lessons | Modules 0 and 1 | All 19 |
  | Browser tools | Tune In, Wave Lab and Spectrum Scope | All 10 |
  | Quiz questions | Starter quiz | 199, with explanations |
  | Lab notebook | Notebook and export | Notebook, templates, evidence rubric and review schedule |
  | Troubleshooting trees, for when a capture shows nothing | Not included | Included |
  | App source and build guide | Not included | Included |
  | Wi-Fi Devboard lesson | Not included | Included |
  | Permission & Scope Checklist | Not included | Included |
  | Preset & Frequency Cheat Sheet | With a free account | Included |
  | Progress sync | With a free account | Included |
  | Course updates | Updates to Modules 0 and 1 | Updates to all 19 lessons |
  | Price | {currency}0 | {currency}{price} once |
- **CTA:** "Get Signal Path Complete" → `#buy`. Microcopy: "30-day refund, no reason needed."
- **Alternatives:**
  - Headline A: "Starter and Complete, row by row". Rationale: describes the table.
  - Headline B: "Where the free part stops". Rationale: more pointed; good if the table starts at the first locked row.
  - CTA A: "Buy Complete". Rationale: short.
  - CTA B: "Start with Starter". Rationale: secondary for the undecided.
- **Notes:** Words in cells instead of tick and cross glyphs, for screen readers and to keep the table plain. The first locked row says what it is for, so "Not included" has a reason next to it.

### bonus-stack
- **Eyebrow:** Included with Complete
- **Headline:** What's in Complete, and what we'd charge for each part alone.
- **Subheadline:** The values are our estimate of a fair standalone price for each part. The course itself is not counted.
- **Body:**
  - **The 12-week Signal Path.** 19 lessons in 6 stages. This is the course, and everything below comes with it.
  - **10 interactive tools.** Seven of them open only in Complete. They show what the radio is doing, using synthetic signals. Value {currency}49.
  - **199-question bank with explanations.** Take it a week after a lesson to find out what stuck. Value {currency}19.
  - **Field Troubleshooting Trees.** Printable decision trees that start from the symptom: nothing decodes, replay does nothing, or range is poor. Value {currency}19.
  - **Lab Notebook System.** Templates, an evidence rubric and a review schedule. A lab you logged in week 2 still makes sense in week 12. Value {currency}19.
  - **Lab Companion app source and build guide.** A working Flipper app in C and the uFBT steps to build it. Value {currency}29.
  - **Wi-Fi Devboard lesson and recovery worksheet.** If a flash leaves the board unresponsive, the worksheet takes it back to a known firmware. Value {currency}39.
  - **Permission & Scope Checklist.** The Romanian lab guide is free to read. This is the fillable version you complete before each hardware session. Value {currency}19.
  - Line after the list: "The Preset & Frequency Cheat Sheet comes with Complete too. It is free with any account, so it isn't in the total."
  - Total line: "Listed value {currency}{bonusTotal}. You pay {currency}{price}."
- **CTA:** "Get Signal Path Complete" → `#buy`. Microcopy: "30-day refund, no reason needed."
- **Alternatives:**
  - Headline A: "Everything in Complete, with what it replaces". Rationale: softer on value, stronger on use.
  - Headline B: "Eight parts and the course, for one price". Rationale: short; the count must match the rendered list.
  - CTA A: "Get all of it for {currency}{price}". Rationale: ties the button to the total line.
  - CTA B: "Buy Signal Path Complete". Rationale: plain.
- **Notes:** Values are from offer.md section 4 and must stay believable. If the currency is not EUR, convert the values in `offer.ts`; do not reuse the numbers with a different symbol. The cheat sheet is the free-account lead magnet, so it is out of the priced stack: remove it from `bonuses` in `offer.ts` (or flag it unpriced). The total is then 49 + 19 + 19 + 19 + 29 + 39 + 19 = 193, rendered as `{bonusTotal}` from `bonusTotal`, never typed. The bullets lead with the learner's problem in different sentence shapes instead of a repeated "For…" opener. [NEED: two named comparable guides with prices, if the owner wants the subheadline to claim market comparables instead of an estimate]

### guarantee
- **Eyebrow:** Refunds
- **Headline:** Ask for a refund any time in the first 30 days.
- **Subheadline:** You get the full {currency}{price} back. We don't ask why.
- **Body:** Request it from your account page, or by email to [NEED: support email]. The money goes back to the card or account you paid with. Thirty days is longer than the 14-day EU right of withdrawal.

  **The Stage 1 promise.** Finish the four Stage 1 labs (Modules 2 to 5) with a notebook entry for each. The entries should name your capture's frequency, modulation and protocol, and say why your replay worked or failed. If they still can't, send them to us within [NEED: window, e.g. 60 days] of buying. We refund the full price within [NEED: reply time, e.g. 3 working days], and you keep the notebook templates.
- **CTA:** "Read the refund policy" → `/legal/refunds`
- **Alternatives:**
  - Headline A: "Take 30 days to decide." Rationale: the previous line; shorter, but it would fit any course.
  - Headline B: "If it isn't for you, you get your money back." Rationale: plain; lacks the number, so use with the subheadline.
  - CTA A: "How refunds work". Rationale: friendlier label.
  - CTA B: "See the Stage 1 promise". Rationale: highlights the stronger promise.
- **Notes:** The Stage 1 promise only means something if its window is longer than 30 days; the owner sets it and the reply time. Its test is Stage 1's own "after this stage you can" list, so the learner can check it without us judging. The owner should confirm this wording, since it defines a promise offer.md left open. The EU 14-day figure is the right of withdrawal under Directive 2011/83/EU. The old "more than twice" comparison is cut: for digital content that right can end when access starts, so the comparison overstated it. "Two clicks" is cut too, because the refund flow has a confirm dialog.

### instalments
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:** "Pay {currency}{price} today, or split it into instalments at checkout where your country and card allow it."
- **CTA:** None
- **Alternatives:**
  - A: "{currency}{price} once, or in instalments at checkout." Rationale: shorter for the card footer.
  - B: "Prefer to spread it? Instalment options appear at checkout where available." Rationale: reader's own question; friendlier.
- **Notes:** Show below the Complete button. Instalment methods are enabled in the Stripe dashboard. [NEED: confirm which instalment methods are on and in which countries]

### faq-legal
- **Headline:** Is this legal?
- **Body:** Signal Path is made of lessons, browser simulators that never touch a radio, and labs on your own equipment. Whether a hardware test is lawful depends on three things. Do you have authority over the equipment and data? Which radio conditions apply where you are? What could your test affect? Every lab in Signal Path uses equipment you own or have written permission to test, and lessons that transmit say so at the top. The Romanian lab guide covers ANCOM's radio interfaces and the relevant Criminal Code articles. Outside Romania, check your national regulator. The course is a learning guide and is not legal advice.
- **CTA:** Text link "Read the Romanian lab guide" → `/romania-lab-guide`
- **Alternatives:** None (factual answer).
- **Notes:** Keep "is not legal advice" in this answer.

### faq-hardware
- **Headline:** What hardware do I need?
- **Body:** To start, a browser. For the hardware labs: a Flipper Zero, a microSD card, a USB cable, and an infrared remote and TV you own. For radio practice, a fixed-code training doorbell or chime that is legal to use where you live. Later lessons add unenrolled RFID and NFC practice tags and a standalone training reader. Stage 3 adds a breadboard, an LED, a 1 kΩ resistor and jumper wires. Module 18 needs the official Wi-Fi Devboard. The core course needs no external radio module, and each lesson lists its gear at the top.
- **CTA:** Text link "Full gear list" → `/course#gear`
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-time
- **Headline:** How long does it take?
- **Body:** The core path is 12 weeks at 2–4 hours a week. Most lessons take 30–60 minutes, plus practice. The Wi-Fi Devboard extension adds 3–4 sessions. The weeks are a suggested order. Take longer if you need to; your progress is saved.
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-firmware
- **Headline:** Do I need Momentum or another firmware fork?
- **Body:** No. Every lesson works on the official firmware, with its region restrictions left on. Module 8 covers what forks such as Momentum add and how to choose one with a backup and a way back. Installing one is optional.
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-certification
- **Headline:** Is this a certification?
- **Body:** No. Signal Path does not issue a certificate or an accredited qualification, and completion badges are self-reported. You finish with a lab notebook and a final portfolio, which is a repeatable experiment another person can follow and check.
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** Required by offer.md section 10.

### faq-refund
- **Headline:** What is the refund policy?
- **Body:** Ask within 30 days of buying and you get a full refund, no reason needed. Request it from your account page or by email to [NEED: support email]. We close the paid lessons when we issue the refund; your notes and progress stay in your account. After day 30, the Stage 1 promise still applies. Finish the Stage 1 labs with a notebook entry for each. If the entries still can't explain your first capture, send them within [NEED: window] of buying for a full refund.
- **CTA:** Text link "Refund policy" → `/legal/refunds`
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-updates
- **Headline:** Do I get updates?
- **Body:** Yes. When we correct or rewrite a lesson, or re-check it against new firmware, you get the update at no extra cost. Each lesson shows the date its sources were last reviewed, and the sources page lists corrections. Updates cover the course you bought; any new courses would be sold separately.
- **CTA:** Text link "Sources and corrections" → `/sources`
- **Alternatives:** None (factual answer).
- **Notes:** Matches offer.md section 5, Stage III default. Change the last sentence if the owner later adds a membership.

### faq-invoice
- **Headline:** Can I get an invoice with VAT?
- **Body:** Every purchase gets a receipt by email from Stripe. To buy as a business, enter your company name and VAT number at checkout and they will appear on the invoice. [NEED: VAT status of the selling entity, e.g. "Prices include VAT where it applies" or "The seller is not VAT-registered"] [NEED: confirm tax ID collection and invoice creation are enabled in Stripe Checkout] If you need a corrected invoice, email [NEED: support email].
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** Cannot be finalised until the selling entity and its country are decided (offer.md section 11).

### faq-no-flipper
- **Headline:** Can I start without a Flipper?
- **Body:** Yes. Modules 0 and 1 begin with browser tools that run on synthetic signals, including a Flipper screen you can drive with an on-screen D-pad. You can learn the menus and read your first frequency before you own the device. The hardware labs need a Flipper Zero, so plan to have one by Stage 1.
- **CTA:** Text link "Start Module 0" → `/learn/00-setup`
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-account
- **Headline:** Do I need an account?
- **Body:** Not for the free lessons. Progress is saved in your browser. A free account, using only your email, saves progress across devices and gets you the cheat sheet. Buying Complete needs an account so we can attach the purchase to your email.
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** None.

### faq-after-paying
- **Headline:** What happens after I pay?
- **Body:** Stripe confirms the payment, usually within a few seconds, and all 19 lessons open on your account. You get a receipt from Stripe and a confirmation email from us. Some payment methods take longer to confirm; the lessons open as soon as they do.
- **CTA:** None
- **Alternatives:** None (factual answer).
- **Notes:** Matches the webhook-first flow in architecture.md: nothing is granted from the success URL.

### final-cta
- **Eyebrow:** None
- **Headline:** Open Module 0 free, or all 19 lessons for {currency}{price}.
- **Subheadline:** If you buy, you have 30 days to change your mind.
- **Body:** Microcopy under the primary button: "30-day refund, no reason needed."
- **CTA:** Primary "Get Signal Path Complete" → `#buy`. Secondary "Start the free starter" → `/learn/00-setup`.
- **Alternatives:**
  - Headline A: "Your first real capture is in Module 2." Rationale: points at the upgrade moment with the exact lesson.
  - Headline B: "All 19 lessons for {currency}{price}." Rationale: plain recap of the offer.
  - CTA A: "Buy for {currency}{price}". Rationale: price on the button.
  - CTA B: "Try the free lessons first". Rationale: for the undecided.
- **Notes:** None.
