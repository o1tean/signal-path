# Transactional email copy

Three emails, one job each. Plain text first; the HTML version uses the same words with one button. Sender name: "Signal Path". From address: [NEED: sending address, e.g. hello@<domain>]. Reply-to: [NEED: support email]. Field mapping: **Headline** is the subject line, **Subheadline** is the preheader.

Tokens: `{email}`, `{link}`, `{expiry}` (link lifetime, e.g. "1 hour"), `{currency}`, `{amount}`, `{date}`, `{refundDeadline}`, `{receiptUrl}`.

### magic-link
- **Eyebrow:** None
- **Headline (subject):** Your Signal Path sign-in link
- **Subheadline (preheader):** It works once and expires in {expiry}.
- **Body:**

  Here is your link to sign in to Signal Path:

  [button] Sign in to Signal Path → `{link}`

  It works once and expires in {expiry}. Open it in the same browser you asked from.

  If you didn't ask for this, you can ignore this email.

  Signal Path · [NEED: legal entity name and postal address]
- **CTA:** "Sign in to Signal Path" → `{link}`
- **Alternatives:**
  - Subject A: "Sign in to Signal Path". Rationale: shortest; matches the button.
  - Subject B: "Your link for {email}". Rationale: confirms the account; reads oddly on a lock screen.
  - CTA A: "Sign in". Rationale: shorter.
  - CTA B: "Open Signal Path". Rationale: vaguer about what happens.
- **Notes:** No marketing in this email. It's the one most likely to be opened in a hurry. The old second line ("Nobody can sign in without the link") was an absolute security claim we can't back, so it is cut. The plain-text version must include the full URL. [NEED: link lifetime from Supabase settings; default is 1 hour]

### welcome-free
- **Eyebrow:** None
- **Headline (subject):** Your free Signal Path account, and where to start
- **Subheadline (preheader):** Module 0 starts in the browser. Your cheat sheet is in your account.
- **Body:**

  Your free account is set up for {email}. Progress you make while signed in is saved to it, so you can switch devices.

  Start with Module 0, Meet your radio lab. You'll learn the Flipper's menus on a simulated screen and record your firmware version and region before any hardware lab.

  [button] Open Module 0 → `/learn/00-setup`

  Your Preset & Frequency Cheat Sheet is in your account [NEED: attachment or download link]. It lists which preset to try first, by frequency and device type.

  If you're in Romania, read the lab guide before your first hardware session: `/romania-lab-guide`. Elsewhere, check your national radio regulator.

  Questions? Reply to this email.

  Signal Path · [NEED: legal entity name and postal address]
- **CTA:** "Open Module 0" → `/learn/00-setup`
- **Alternatives:**
  - Subject A: "Start here: Module 0 and your cheat sheet". Rationale: leads with the two things inside; the colon is a label.
  - Subject B: "Your Signal Path account is ready". Rationale: plain status; less reason to open.
  - CTA A: "Start the first lesson". Rationale: works if Module 0 is renamed.
  - CTA B: "Continue where you left off". Rationale: for learners who already started signed out.
- **Notes:** Sent once, after the first sign-in creates the account. One link to the course, one to the cheat sheet. The preheader and body both say "in your account"; if the owner chooses an attachment instead, change both together. No upsell; the paywall does that job at the right moment. If marketing emails are added later, they need separate consent.

### purchase-confirmation
- **Eyebrow:** None
- **Headline (subject):** Signal Path Complete is open on your account
- **Subheadline (preheader):** All 19 lessons, ready now. Refunds are open until {refundDeadline}.
- **Body:**

  Thanks for buying Signal Path Complete. All 19 lessons, the 10 tools and the downloads are now open for {email}.

  [button] Continue the course → `/learn`

  Your purchase: Signal Path Complete · {currency}{amount} · {date}. Stripe has sent a separate receipt [link: View receipt → `{receiptUrl}`].

  If the course isn't right for you, request a refund from your account page until {refundDeadline}, or reply to this email. You'll get the full amount back.

  If you haven't finished Module 1, do that first. Stage 1 starts with Module 2, Hear the signal: AM vs FM, and needs your Flipper and a remote you own.

  Signal Path · [NEED: legal entity name and postal address] · [NEED: VAT number, if any]
- **CTA:** "Continue the course" → `/learn`
- **Alternatives:**
  - Subject A: "You have Signal Path Complete". Rationale: shorter; less concrete.
  - Subject B: "Receipt and access: Signal Path Complete". Rationale: helps people who file receipts by subject.
  - CTA A: "Open Module 2". Rationale: exact next step for most buyers.
  - CTA B: "Go to your account". Rationale: neutral.
- **Notes:** Sent by the webhook handler after the entitlement is written, so access is real when the email lands. The refund line appears in the email because a buyer who knows the way out is less likely to open a dispute.
