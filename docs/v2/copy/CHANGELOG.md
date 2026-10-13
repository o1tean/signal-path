# Copy changelog: editorial pass on Critiques A and B

Date: 12 October 2026. Every file was edited in place, with the same filenames and section ids. There is one new section, `pricing.md` `which-one`. Afterwards I ran the self-check from the copywriting skill's `references/ai-tells.md` on all 12 files. That meant searching for banned patterns, reading every sentence over 20 words, counting caps per section, reading the copy aloud and applying the swap test. Results:

- No em dashes and no exclamation marks.
- No contrast reveals, negation lists, colon reveals or self-answered questions in customer copy.
- Some prose sentences still run over 25 words. They are in three places only: the terms outline, which is left for the lawyer; meta descriptions, which are limited by characters rather than words; and rendered lesson-title lists.

## Changes by file

### home.md
- `hero`: the subheadline now gives one concrete outcome with a time: "By week 3 you can name a remote's frequency, modulation and protocol, and say why a replay worked or failed." This replaces the five-topic list (A3, B10).
- `problem`: the forum line is hedged to "Many forum answers…". The trailing "and Signal Path teaches you…" clause is cut (A6, B22).
- `method`:
  - The subheadline no longer repeats "seven parts", which is stated once on the course page (B22).
  - The card heads are now claims ("See the mechanism", "Test your prediction", "Compile your own app") instead of the generic "Understand / Experiment / Build" (B21).
  - The Experiment card now gives the real Module 1 "you've got it when" check and names one troubleshooting tree (B8).
  - The long sentences are split.
- `tools`: "practise on a train" is replaced with "use them before your Flipper arrives" (A10).
- `path`: "nothing expires" is cut until the owner sets the access term (A12, B20).
- `wifi`: the 31-word body is split into short sentences, and the "for the day" flourish is replaced by what the worksheet does (A13, B22).
- `lab-rules`:
  - The subheadline is now active voice ("how people defend them") (A17).
  - The three-check sentence is split (A15).
  - "the date we last checked its sources" is now active voice.
- `pricing-preview`:
  - The headline is now "The first two lessons are free. The other 17 cost {currency}{price}, once." (B21).
  - The subheadline now carries the refund.
  - The Starter card names the three free tools (B13).
  - The Complete card names three bonuses instead of "every bonus listed" (A20).
- `final-cta`: the headline is now "Start with Module 0 tonight." The untimed 20-minute line moves to Alternative A until someone times it (A21, B9). Alternative B is replaced (B21).

### pricing.md
- Added a top note: one shared buy-button microcopy line, "30-day refund, no reason needed.", added under every buy CTA in `hero`, `founding-price`, `which-one`, `compare`, `bonus-stack` and `final-cta` (B1).
- `hero`:
  - The headline now states the price and counts (B21).
  - The subheadline no longer trails into an extra clause (A1).
  - The wrong "nine words" note is fixed (A2).
- `tier-starter`:
  - The subheadline now says where the free part stops (B12, B21).
  - The tools are named (B13).
  - Alternative B is replaced.
- `tier-complete`:
  - "no questions asked" becomes "no reason needed" (B4).
  - Added a one-line Stage 1 promise (B2).
  - Flagged the "authorized" spelling in `offer.ts` (B19).
- `tier-mentored`: replaced the "second pair of eyes" alternative (A11).
- `founding-price`: added a note that the build should fail if the founding price is enabled with no end date and no seat cap (B15).
- New `which-one` section above `compare`, with "Pick Starter if…", "Pick Complete if…" and the disqualifier from `course.md` `fit` (B11, B12).
- `compare`:
  - The tools row names the free three.
  - The first locked row says what the trees are for (B12).
  - The updates row is clarified (A14).
- `bonus-stack`:
  - The headline is shorter and honest: "what we'd charge for each part alone" (A15).
  - The subheadline now calls the values our estimate rather than market prices, and says the course itself is not counted (A16, B6).
  - The "For…" bullet openers are rewritten in varied shapes, each leading with the problem (A17, B7).
  - The tools item says seven tools are Complete-only (B6).
  - The checklist is valued as the fillable version (B6).
  - The cheat sheet is removed from the priced stack (B5).
  - The total renders from `{bonusTotal}`, now 193.
  - The miscounted "Nine parts" alternative is fixed (A18).
- `guarantee`:
  - New headline (B21).
  - "two clicks" is cut (A21).
  - The EU comparison is now "longer than the 14-day EU right of withdrawal" (A22, B3).
  - The Stage 1 promise is rewritten as "if X within Y, we Z". The test comes from Stage 1's outcomes, and the window and reply time are left as `[NEED]` (A23, B2).
- `faq-legal`: the long colon list is split into three questions (A25).
- `faq-hardware`: split (A27).
- `faq-time`: "as you like" is cut (A29, B21).
- `faq-firmware`: shortened (A30).
- `faq-refund`: now active voice and split (A32).
- `faq-updates`: now active voice (A33).
- `faq-account`: "somewhere to live" is replaced (A36).
- `final-cta`:
  - New headline with the price (B21).
  - Refund microcopy added.
  - Alternative A now names Module 2 (A39).

### course.md
- `hero`: added the 30-day refund to the price line (B1).
- `stage-starter`, `stage-signals`, `stage-atlas`, `stage-build`, `stage-research` and `stage-wifi`:
  - Every body sentence over 25 words is split (A7, A10, A17, A22, A24).
  - Every "after this stage you can" line is now a bullet list (A9, A11, A14, A23).
- `stage-signals`: the subheadline is reduced to the stage's outcome (A12).
- `stage-atlas`: "every owner meets" becomes "three common failures" (A13, B17).
- `stage-build`: the hold note now covers the whole stage block, and `stage-research` as well (A20, B20).
- `stage-research`: Module 16 is quoted as "Authorised", and `course.ts` is flagged for the retitle (B19).
- `stage-wifi`: the "without fear of bricking it" alternative is replaced (A25).
- `gear`: new headline and subheadline (B21). The headline no longer implies that Module 1 needs no hardware.
- `session-routine`:
  - The headline is now "A one-hour study session, in five steps." (A28, B22).
  - The "stick" alternative is replaced (A29).
  - The one-hour figure is flagged until someone times a session (A30).
- `fit`: the body is tightened (B21), and the disqualifier is now one plain absence (A32, adapted; see the rejected findings).
- `final-cta`: the "If the method suits you" subheadline is replaced (B21).

### auth.md
- `login-before-purchase`: added a refund line (B1). Replaced the misleading "Where should we send your course?" alternative (A2).
- `login-errors`: the expired-link and wrong-browser messages are now active and shorter (A3, A4, A5).
- `account-refund`: removed the line duplicated between the body and the dialog, and made it active voice (A8).
- `account-sync`: rewrote the subheadline (A12).
- `account-export`: cut the trailing legal clause and moved its reason to Notes (A11).
- `signed-out`: replaced the filler alternative "See you next time" (A13).

### checkout.md
- `success-pending`: the eyebrow is now "Payment submitted". The headline is now "Waiting for Stripe to confirm.", so it no longer promises an outcome before Stripe confirms (A1, A2).
- `success-slow`: the trailing "without you doing anything" is cut (A3).
- `cancel`: the body now names exactly what the FAQ covers (A8).

### chrome.md
- `navbar`: the Resources descriptions are now "Six ideas to read before Module 0", "Every term in the course, defined" and "Five beginner problems, traced to the cause" (A1, B17).
- `footer`: replaced the fragment alternative (A4).
- `not-found`: the subheadline is now active voice (A7).

### emails.md
- `magic-link`: cut the absolute claim "Nobody can sign in without the link" (A1).
- `welcome-free`: the preheader and body both now say "in your account" (A6).
- `purchase-confirmation`: removed the colon reveal "A suggestion for this week:" (A7).

### paywall.md
- `paywall-signed-out` and `paywall-signed-in`:
  - `{outcome}` now renders under a separate "Lesson outcome" label, which fixes the "you can: State…" grammar (A1).
  - The primary CTA is now "Open all 19 lessons" (B16).
- `paywall-suspended`: the subheadline is now active voice (A6). "we'll sort it out" is replaced with a reply-time `[NEED]` (A9).

### legal.md
- `refunds`:
  - The access sentence is now active voice (A2).
  - The withdrawal sentence is shorter (A3).
  - The unbacked "faster" comparison is replaced with our processing time against typical dispute length (A4).
  - The Stage 1 promise now uses the same test as the pricing page (B2).
- `privacy`:
  - The local-storage paragraph is now active and split (A6).
  - The fonts claim has its own paragraph, with a verification `[NEED]` (A7, A12).
  - The rights are now a bullet list (A9).
  - A row-level security `[NEED]` is added (A10).
  - "no password to steal" becomes "we store no passwords" (A11).
- `terms`: sections 5 and 7 are flagged for the lawyer (A12).

### meta.md
- `home`: the title is now "The 12-week Flipper Zero course · Signal Path", which follows the suffix rule (A1).
- Rewritten descriptions:
  - `course`: 151 characters (A4).
  - `pricing`: 145 characters rendered with €149, with "no reason needed" (A5, B4).
  - `tools`: 149 characters, with three free tools (A7).
  - `primer`: 145 characters (A9).
  - `sources`: 150 characters (A12).
  - `romania-lab-guide`: 150 characters (A14).
  - `legal-terms`: 154 characters (A15).
- The `pricing` title now ends with the suffix.
- The `tools` Alternative A no longer overstates "free" (A8).
- `case-studies`: the title says "problems" (B17).

### resources.md
- `resources-index`: rewrote the headline (A1, B21). The subheadline no longer repeats the list.
- `primer`:
  - The headline no longer says "most of what" (A3).
  - "one sitting" is cut (A5).
  - Replaced the overclaiming alternative (A6).
- `reference`:
  - Shortened the subheadline (A7).
  - Cut the "always matches" body, with a note on when to restore it (A8).
- `sources`: the subheadline is now active and shorter (A11). Replaced the "Check our work" alternative (A12).
- `case-studies`:
  - "write in about" becomes "run into" (A13).
  - The disclaimer moves before the list, which is now bullets (A14, A15, B18).
  - The cases are reframed around equipment the learner owns or training setups (B18).
  - "mysteries" becomes "problems" (B17).
  - Replaced the overclaiming alternative (A16).
- `romania-lab-guide`: the body is split (A18). Added a `[NEED]` to check the ANCOM edition (A20).

### tools.md
- The free list now follows `src/data/tools.ts`: Tune In, Wave Lab and Spectrum Scope, matching offer.md (B13).
- `tools-hero`: "Five/five" becomes "Three/seven" (A3). Added the 3D scenes line with a model-licence `[NEED]` (A17).
- `wave-lab`: the label is now "Free demo · Used in Module 2" (B13).
- `rf-calculator` and `flipper-sim`: these are labelled as open in the free lesson, with a locked-state CTA to that lesson and a `[NEED]` for the owner.
- `spectrum-scope`: "live" becomes "animated" (A6).
- `pulse-decoder`: replaced the "find the key" alternative (A9).
- `flashcards`: replaced the untested "five minutes a day" alternative (A12).
- `tools-cta`: added refund microcopy (B1), and the "other five" alternative now says seven.

## Rejected or partly accepted findings

- **A home 15, A faq-legal 25 (three checks as questions).** I accepted the questions in the FAQ, where a question form fits. On the home page I split the sentence instead. Three questions in a row inside a trust section would read as a device.
- **A chrome 1 (primer nav: "Six ideas that explain most of what the Flipper does").** Rejected. A resources 3 calls "most of what" unbacked, so the nav uses "Six ideas to read before Module 0".
- **A course 11 and 19 (length of the Lessons lines).** Rejected. These lines are rendered lists of lesson titles, not prose sentences.
- **A course 32 (fit rewrite "doesn't give you X. It teaches Y").** Rejected as worded, because it is a contrast reveal. I kept the absence as one plain sentence with no "instead" clause.
- **A meta 10 (reference description over 25 words).** Rejected. It is 159 characters, and a list of the table names is what a searcher scans for. Meta descriptions are limited by characters, not words.
- **A meta 14 (Romania description wording).** Partly accepted. Its suggested text was 137 characters, under the file's 140 floor, so I rephrased it to 150 characters.
- **A paywall 9 ("and, if you prefer, refund you").** Partly accepted. The vague promise is gone, but I did not add the refund offer: refunding a charge with an open dispute needs a Stripe-side decision first.
- **A resources 9 and B21 (glossary headline "Every term… in a sentence or two").** Kept. It states the scope and the definition length, both true by construction. Alternative A already carries the concrete terms.
- **A resources 2.** The critique called the index subheadline fine. I changed it anyway, because the new headline carries the list and repeating it would be redundant.
- **B2 (60-day window and 3-day reply in the example).** Partly accepted. I used the criterion structure but left both numbers as `[NEED]`, because they are owner decisions.
- **B6 (value the core course and price only the locked tools).** Partly accepted. I gave the core no value, because putting a number on it would inflate the anchor; the core line and the subheadline say it is not counted. The tools value stays at offer.md's €49, with the line saying seven tools are Complete-only. Changing anchors is an owner decision.
- **B12 ("Starter ends…" inside the compare table).** Placed in the new `which-one` section directly above the table instead. Repeating it in the table subheadline read as filler.
- **B16 (stronger CTAs on `checkout.md` `success-slow` and pricing `compare`).** Rejected for checkout: "Check again" and "Go to your account" are status-page actions, and sales wording there is wrong. On `compare` I kept "Get Signal Path Complete" so the page has one buy label; "Buy for {price}" stays an alternative.
- **B22 (trim the home `wifi` list to two).** Partly accepted. All three items are what the lesson does, so I split them into short sentences instead of dropping one.
- **B22 (session headline "One hour, five steps.").** I used A's full sentence instead, because the section's fragment allowance is better kept for elsewhere.
- **Findings A marked "none", "fine" or "allowed"** (for example A auth 1, 6, 7, 9; A checkout 4–7, 10; A chrome 2, 3, 5, 6, 8–12; A pricing 3, 4, 6, 8, 12, 13, 19, 24, 26, 28, 31, 34, 35, 37, 38). No change needed.

## Follow-ups outside docs/v2/copy (not edited in this pass)

- `src/data/offer.ts`:
  - Remove the cheat sheet from `bonuses` so `bonusTotal` renders 193.
  - Change `product.subtitle` to "authorised".
  - Update `guarantees.stageOne.body` and the `tier.includes` for Starter and Complete to match the copy.
- `src/data/course.ts`: retitle Module 16 to "Authorised security research: test the claim". The Module 4 retitle is still pending owner confirmation.
- `src/data/faq.ts`: sync its answers with the `pricing.md` FAQ entries, which feed it by id.
- The buy-button component should carry the shared refund microcopy, and the build should fail on a founding price that has no end date and no seat cap.
- `src/data/tools.ts`: confirm that Flipper Sim and RF Calculator mount in the free Modules 0 and 1 while `free: false`.

## Launch blockers (claims that would be false if shipped unresolved)

- The access term for Complete (home `path`, pricing `tier-complete`, terms section 5).
- Modules 11–17 rewritten. Until then, hold `course.md` `stage-build` and `stage-research`.
- Module 18 tested on a physical board (home `wifi`, course `stage-wifi`).
- The Stage 1 promise window and reply time.
- The support email, the legal entity and the VAT status, which appear across all files.
- The 3D Flipper model's GPL-3.0 licence decision (tools `tools-hero`, terms section 10).
- Self-hosted fonts and Supabase row-level security confirmed (privacy notice).
- The ANCOM RO-IR SRD-01 edition re-checked (Romanian lab guide).
- The under-20-minute first win timed before the home `final-cta` uses it.
- The one-hour study session timed (course `session-routine`).
