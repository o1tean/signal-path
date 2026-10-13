# Signal Path — offer and money model

Applied from *$100M Offers* and *$100M Money Models* (both read in full on 12 October 2026). Everything here is educational-product honest: no accreditation claims, no "hack anything" promises, no fake scarcity. Numbers marked **[decide]** are placeholders the owner sets in `src/data/offer.ts`; nothing customer-facing ships with a placeholder.

## 1. Market (starving crowd check)

- **Avatar:** someone who owns (or is about to buy) a Flipper Zero, is curious and technical-ish, and is frustrated that the device "does things" they cannot explain. English-speaking, EU-first. They have money (the device costs about €200) and are easy to find (Flipper forums, Discord, Reddit r/flipperzero, YouTube, Lab401/Joom shoppers).
- **Pain:** "I pressed Read and nothing happened." "The copied remote worked once." "I don't understand what I'm looking at, and half the internet tells me to flash a fork." Fear of doing something illegal by accident. Tutorials that show a button press but not the mechanism.
- **Growing:** yes (the device keeps selling; the Wi-Fi board and app ecosystem expand).
- **Niche pricing lever:** "RF course" ($19 territory) → "Flipper Zero course" → "Flipper Zero signals course for owners who want to run authorized experiments and prove it" (premium territory). We commit to the Flipper Zero owner niche.

## 2. Dream outcome

Go from pressing buttons to understanding every signal your Flipper touches, running controlled experiments on your own equipment, building a small app, and finishing with a portfolio another person can follow. Status payoff: the person in the group who can explain *why*.

## 3. Value equation, applied

| Driver | What the product does about it |
|---|---|
| Dream outcome ↑ | A 12-week path from first setup to an independent, reproducible project; app build; Wi-Fi Devboard extension |
| Likelihood ↑ | Every lab has a predicted observation and a "you've got it when" criterion; troubleshooting decision trees; quiz explanations; a notebook that forces evidence; primary-source citations with review dates |
| Time delay ↓ | First win in the browser in under 20 minutes without hardware (Tune In, Wave Lab, Spectrum Scope); lessons sized 30–60 min; resume where you left off |
| Effort & sacrifice ↓ | Simulators before hardware; gear lists per lesson; preset cheat sheet; worksheets; no fork required (official firmware supported) |

## 4. Problems → solutions → delivery (trim & stack)

Problems were listed per learner step (setup, first capture, replay, rolling codes, RFID/NFC, firmware choice, troubleshooting, IR, GPIO, USB/BLE, auth tokens, app build, security research, portfolio, Wi-Fi board). Delivery vehicles are all one-to-many assets that exist or are cheap to maintain:

| Named asset | Solves | Value anchor (realistic) |
|---|---|---|
| The 12-Week Signal Path (19 lessons, 6 stages) | the whole path | core |
| 10 interactive learning tools (Tune In, Wave Lab, Pulse Decoder, Rolling Code Sim, Spectrum Scope, RF Calculator, Flipper Sim, Signal Atlas, Flashcards, Tool Picker) | "I can't see it" | €49 |
| 199-question retrieval bank with explanations (count rendered from data) | "did I actually learn it" | €19 |
| Field Troubleshooting Trees (Module 9, printable) | "nothing decodes" | €19 |
| Lab Notebook System (templates + evidence rubric + retrieval schedule) | "I forget everything" | €19 |
| Lab Companion app source + build guide (uFBT) | "I can't code for it" | €29 |
| Wi-Fi Devboard lesson + recovery worksheet | "I bricked the board" | €39 |
| Permission & Scope Checklist (EU/RO lab guide) | "is this legal" | €19 |
| Preset & Frequency Cheat Sheet | "which preset" | €9 |

Total stated value ≈ €200+ against a core price well below it. Values are anchored to what comparable standalone guides sell for; keep them believable and never inflate.

## 5. Offer structure (money model, stage by stage)

**Stage I — Attraction: Decoy offer.** Free Starter (Modules 0–1, primer, glossary, the three browser tools used in those lessons, starter quiz) versus **Signal Path Complete** (everything above). Free content is genuinely useful and ends at the moment the learner wants to capture their first real signal. The free account is the lead (sign-in saves progress and unlocks the cheat sheet).

**Stage II — Upsell / downsell.**
- Anchor tier **Mentored Path** (Complete + written review of the final portfolio + two 45-minute sessions, capped seats per quarter) at 4–6× the Complete price. Ships `available: false` until the owner decides to deliver it; the pricing page shows two tiers until then. Only enable with real capacity.
- Downsell: pay in instalments through Stripe's BNPL methods; copy frames the one-time price as the reward ("€X today, or spread it").
- Classic upsell after purchase (later): a curated lab kit via affiliate links (training tags, a 433 MHz remote, the official Wi-Fi Devboard). Affiliate products fill the gap without fulfilment.

**Stage III — Continuity (later, not built):** "New labs & updates" membership after the first 12 months, or lifetime updates included — the owner decides; default copy promises updates to the purchased course only.

## 6. Pricing (placeholders)

- Complete: **€149 [decide]** one-time, VAT handling per provider setup. Founding-learner price **€99 [decide]** with a real end date or seat count set in config; off by default.
- Mentored Path: **€699 [decide]**, hidden by default.
- Free Starter: €0, no card.
- Decoy logic: the comparison table makes Complete the obvious choice; Starter exists to be compared against.

## 7. Guarantee stack

1. Unconditional: **30-day refund, no questions**, through the account page or by email (longer than the EU 14-day right of withdrawal; simpler to explain).
2. Conditional "Stage 1 promise": finish Stage 1 labs with notebook entries; if you still cannot explain your own first capture, email the entries and get a refund plus you keep the notebook templates. (Costs nothing extra and signals conviction.)

## 8. Scarcity and urgency (honest only)

- Founding price with a real deadline/seat cap (config-driven, auto-expires).
- Mentored seats per quarter (real capacity).
- Cohort start dates if the owner runs guided cohorts.
- Never a fake countdown. Never "only 3 left" without a real counter.

## 9. Naming (MAGIC)

Product: **Signal Path Complete** — subtitle "The 12-week Flipper Zero course, from first setup to your own authorized experiments."
Free tier: **Signal Path Starter**. Lead magnet: **Flipper Preset & Frequency Cheat Sheet**. Anchor: **Signal Path Mentored**.

## 10. Copy guardrails

- Educational purpose everywhere; labs on equipment you own or have written permission for; the Romanian lab guide stays prominent.
- No "certification" language; completion badges are self-reported.
- Proof points must be real: 19 lessons, 199 questions, 10 tools, 9 3D concept scenes, 12-week path, primary sources with review dates, official firmware supported. Testimonials: none until real ones exist (`src/data/testimonials.ts` stays empty and the section stays hidden).

## 11. Owner decisions still open

Price and currency; founding-price window; whether to enable Mentored; selling entity country (affects Stripe account type and VAT); support email; refund email; domain; whether to run Vercel Pro or another host.
