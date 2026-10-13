# Lesson paywall copy (template)

> Audit update, 13 October 2026: the lesson header above the paywall already shows `{title}`, so the paywall's heading is screen-reader only; a "You finish with" line shows the lesson's `evidence`; Gear moved to the lesson header; the price is set at `text-2xl` beside the CTA; the CTA uses alternative B with the price ("Open all {lessons} lessons for {currency}{price}"); tool thumbnails reuse `ToolPreview`.

Route: `/learn/[slug]` when the lesson is `access: 'paid'` and the visitor has no active entitlement. Rendered on the server with `Cache-Control: private, no-store`. Only frontmatter fields reach this view.

Tokens: `{title}`, `{outcome}`, `{minutes}` from lesson frontmatter; `{price}`, `{currency}` from `offer.ts`. `{outcome}` is a full sentence that starts with a verb ("State one device's frequency and modulation pair and explain why both must be right."), so the template shows it as its own line under a separate label element, never after a colon or mid-sentence.

The paywall says what the lesson teaches and what the learner will have at the end, then the price and the guarantee. It does not guilt, count down, or hint that the learner is falling behind.

### paywall-signed-out
- **Eyebrow:** Signal Path Complete · {minutes} minutes
- **Headline:** {title}
- **Subheadline:** A small label "Lesson outcome", then `{outcome}` on its own line.
- **Body:** This lesson is part of Signal Path Complete: all {lessons} lessons, {tools} browser tools and {questions} quiz questions, with the price {currency}{price} "paid once" set large above it. If it isn't for you, ask for a refund within 30 days.

  Line under the buttons: "Already bought it? Sign in to open this lesson."
- **CTA:** Primary "Open all 19 lessons" → `/login?next=/pricing#buy`. Secondary "Sign in" → `/login?next=/learn/{slug}`. Tertiary text link "Back to the free lessons" → `/learn`.
- **Alternatives:**
  - Headline A: keep `{title}` as the headline in every variant. Rationale: the learner clicked a lesson; the page should confirm which one before it asks for money.
  - Headline B: "{title} is in Signal Path Complete". Rationale: states the lock up front; longer, and it makes the lesson title less prominent.
  - CTA A: "Get Signal Path Complete". Rationale: the product name, consistent with the pricing page; says less about what the click gets.
  - CTA B: "Buy the course for {currency}{price}". Rationale: price on the button; good for returning visitors.
- **Notes:** The subheadline is the lesson's real outcome, so the reader sees exactly what they would get. A label element avoids the broken grammar of "you can: State…". The button names the result of paying, and the count does not change from lesson to lesson. The secondary sign-in link catches buyers on a new device, which is the most common false paywall.

### paywall-signed-in
- **Eyebrow:** Signal Path Complete · {minutes} minutes
- **Headline:** {title}
- **Subheadline:** As in `paywall-signed-out`: the label "Lesson outcome", then `{outcome}`.
- **Body:** Signal Path Complete opens this lesson and every other one for {currency}{price}, paid once. Your progress and notes carry over. Refunds are open for 30 days after you buy.

  Instalment line: "Or split the payment into instalments at checkout where available."
- **CTA:** Primary "Open all 19 lessons" → `POST /api/checkout`. Secondary text link "See what's included" → `/pricing`.
- **Alternatives:**
  - Headline A/B: as in `paywall-signed-out`.
  - CTA A: "Continue to payment". Rationale: says what the click does (Stripe Checkout opens next).
  - CTA B: "Buy for {currency}{price}". Rationale: price on the button.
- **Notes:** "Your progress and notes carry over" answers the worry that buying resets anything.

### paywall-suspended
- **Eyebrow:** Access paused
- **Headline:** {title}
- **Subheadline:** We've paused your access to the paid lessons while a payment dispute is open.
- **Body:** This happens when a bank reports a dispute on the payment for Signal Path Complete. Access comes back automatically if the dispute closes in our favour. If you didn't mean to open a dispute, or you want a refund instead, email [NEED: support email]. We reply within [NEED: response time, e.g. 2 working days].
- **CTA:** "Go to your account" → `/account`
- **Alternatives:**
  - Headline B: "Your access is paused". Rationale: use instead of `{title}` if the lesson title confuses the message.
  - CTA A: "Email support" → `mailto:[NEED: support email]`. Rationale: the only action that changes the state.
  - CTA B: "See your purchases" → `/account#purchases`. Rationale: shows the payment status.
- **Notes:** Matches the webhook rule: `charge.dispute.created` suspends, a won dispute restores. Keep the tone neutral; many disputes are bank errors.

### paywall-teaser
- **Eyebrow:** None
- **Headline:** What this lesson covers
- **Subheadline:** None
- **Body:** Renders from frontmatter only: "Gear: {gear}", "Transmits: {transmits label}", "Builds on: {prerequisites}", "Tools in this lesson: {tools}". Transmit labels: `none` → "Nothing transmits", `own-device` → "Transmits to your own device only", `lab-only` → "Transmits in a controlled lab setup only".
- **CTA:** None
- **Alternatives:** None (data labels).
- **Notes:** Gives the reader the same "Before you start" facts a buyer would see, without any body content.
