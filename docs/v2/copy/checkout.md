# Checkout copy

Routes: `/checkout/success?session_id=…` (on-demand; polls `/api/entitlements`) and `/checkout/cancel`. Access is granted by the Stripe webhook, never by the success URL, so the success page has three states: pending, slow (after 60 seconds), granted.

Extra tokens: `{email}` (signed-in user), `{refundDeadline}` (purchase date + 30 days, formatted "12 November 2026"), `{nextLesson}` (title of the learner's next unfinished paid lesson, falling back to Module 2).

Architecture note: `architecture.md` sets Stripe's `cancel_url` to `/pricing`, while the route list includes `checkout/cancel.astro`. The cancel copy below assumes `cancel_url=/checkout/cancel`. [NEED: pick one; if `/pricing`, show the cancel text as a dismissible notice there]

### success-pending
- **Eyebrow:** Payment submitted
- **Headline:** Waiting for Stripe to confirm.
- **Subheadline:** This usually takes a few seconds.
- **Body:** Keep this page open. It updates by itself.
- **CTA:** None (status indicator with `aria-live="polite"`).
- **Alternatives:**
  - Headline A: "Confirming your payment." Rationale: describes the system state; less warm.
  - Headline B: "Opening your lessons." Rationale: warmer, but it promises an outcome before Stripe confirms; use only if testing shows the main line worries buyers.
  - CTA A/B: None.
- **Notes:** Plain status. No celebration until access is real. The eyebrow says "submitted" because the payment is not confirmed yet.

### success-slow
- **Eyebrow:** Still waiting
- **Headline:** Your payment is still processing.
- **Subheadline:** Some payment methods take longer to confirm. You don't need to pay again.
- **Body:** We'll email {email} when the lessons open. They then appear on your account. If nothing has changed within [NEED: e.g. 24 hours], email [NEED: support email] with the address you paid with.
- **CTA:** Primary "Check again" → reloads the status check. Secondary "Go to your account" → `/account`.
- **Alternatives:**
  - Headline A: "This is taking longer than usual." Rationale: honest, but makes the delay sound like a fault.
  - Headline B: "Stripe hasn't confirmed the payment yet." Rationale: exact; names the party we are waiting on.
  - CTA A: "Refresh status". Rationale: says what the button does.
  - CTA B: "Continue with the free lessons" → `/learn`. Rationale: gives the learner something to do while they wait.
- **Notes:** Shown after 60 seconds of polling, per architecture.md. "You don't need to pay again" prevents double purchases, the most expensive mistake on this page.

### success-granted
- **Eyebrow:** Signal Path Complete
- **Headline:** All 19 lessons are open.
- **Subheadline:** They are on the account for {email}. A receipt from Stripe is on its way.
- **Body:** Your progress and notes from the free lessons are still there. If the course isn't right for you, you can request a refund from your account until {refundDeadline}.
- **CTA:** Primary "Continue with {nextLesson}" → resume link. Secondary text link "See what's included" → `/learn`.
- **Alternatives:**
  - Headline A: "You have Signal Path Complete." Rationale: names the product; less concrete than the lesson count.
  - Headline B: "Your next lab is ready." Rationale: points forward; works for learners mid-course.
  - CTA A: "Open the next lesson". Rationale: works when `{nextLesson}` is unavailable.
  - CTA B: "Go to the course" → `/learn`. Rationale: neutral fallback.
- **Notes:** "Now you can open all 19 lessons" is true at this moment. Mentioning the refund date here builds trust at the point of highest doubt.

### cancel
- **Eyebrow:** Checkout cancelled
- **Headline:** You haven't been charged.
- **Subheadline:** Your free lessons and your progress are where you left them.
- **Body:** The pricing FAQ covers hardware, time, refunds and VAT. You can come back to checkout whenever you like.
- **CTA:** Primary "Back to pricing" → `/pricing#faq`. Secondary "Continue with the free lessons" → `/learn`.
- **Alternatives:**
  - Headline A: "Checkout cancelled. Nothing was charged." Rationale: states both facts; slightly flatter.
  - Headline B: "No payment was taken." Rationale: exact; "taken" may read as British-formal.
  - CTA A: "Read the FAQ" → `/pricing#faq`. Rationale: points at the likely reason.
  - CTA B: "Return to the course" → `/learn`. Rationale: neutral.
- **Notes:** No guilt and no discount. The reader may have cancelled to ask a colleague or to wait for payday.
