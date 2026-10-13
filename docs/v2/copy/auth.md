# Sign-in and account copy

Routes: `/login` (magic link via Supabase), `/auth/callback`, `/auth/signout`, `/account` (on-demand). Tokens: `{email}`, `{date}` (purchase date), `{amount}`, `{currency}`, `{refundDeadline}`, `{product}`.

### login
- **Eyebrow:** None
- **Headline:** Sign in with your email.
- **Subheadline:** We'll send you a link. Open it on this device and you're signed in.
- **Body:**
  - Field label: "Email address". Placeholder: "you@example.com".
  - Helper under the field: "New here? The same link creates your free account."
  - Line under the button: "By continuing you agree to the [terms of use](/legal/terms) and the [privacy notice](/legal/privacy)."
- **CTA:** "Email me a sign-in link" → submits the form.
- **Alternatives:**
  - Headline A: "Sign in or create a free account." Rationale: names both cases in the headline; longer.
  - Headline B: "Your email is all you need." Rationale: friendlier; less clear about what happens next.
  - CTA A: "Send sign-in link". Rationale: shorter for small screens.
  - CTA B: "Continue with email". Rationale: familiar pattern; vaguer about the email step.
- **Notes:** No password field, so the copy explains the link once and moves on.

### login-before-purchase
- **Eyebrow:** One step before checkout
- **Headline:** Sign in to buy Signal Path Complete.
- **Subheadline:** The course is tied to your email, so you can open it on any device.
- **Body:** Same fields and helper text as `login`, plus one line under the button: "Signal Path Complete comes with a 30-day refund, no reason needed."
- **CTA:** "Email me a sign-in link". After sign-in, the callback returns to `/pricing#buy`.
- **Alternatives:**
  - Headline A: "First, your email." Rationale: short; reads as a step.
  - Headline B: "Sign in, then pay with Stripe." Rationale: shows both steps; useful if testing shows buyers expect to pay first.
  - CTA A/B: as in `login`.
- **Notes:** Shown when `next=/pricing#buy`. Explains why sign-in comes before payment. The refund line keeps the guarantee in view on the last page before Stripe.

### login-errors
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:**
  - Invalid email: "Enter an email address in the form name@example.com."
  - Too many requests: "You've asked for several links in a row. Wait [NEED: rate-limit window; Supabase default is 60 seconds] and try again."
  - Link expired or already used: "That link has expired or you've already used it. Enter your email and we'll send a new one."
  - Link opened on another device or browser: "You opened this link in a different browser from the one that asked for it. Open the original link in that browser, or request a new one here." [NEED: confirm whether the auth flow is PKCE, which causes this case]
  - Generic failure: "We couldn't send the link. Check your connection and try again. If it keeps happening, email [NEED: support email]."
- **CTA:** None
- **Alternatives:** None (system messages).
- **Notes:** Each error says what happened and what to do next.

### magic-link-sent
- **Eyebrow:** None
- **Headline:** Check your inbox.
- **Subheadline:** We sent a sign-in link to {email}.
- **Body:** The link works once and expires after [NEED: link lifetime; Supabase default is 1 hour]. If it hasn't arrived within a minute, check your spam folder or send another.
- **CTA:** Primary "Send another link" (disabled for the rate-limit window, with "Available in {seconds} s"). Secondary text link "Use a different email" → `/login`.
- **Alternatives:**
  - Headline A: "Link sent to {email}." Rationale: confirms the address in the headline, which catches typos.
  - Headline B: "Open the link we just emailed you." Rationale: an instruction instead of a status.
  - CTA A: "Resend the link". Rationale: shorter.
  - CTA B: "Change email". Rationale: shorter.
- **Notes:** Showing `{email}` lets the reader spot a typo before waiting.

### signout-confirm
- **Eyebrow:** None
- **Headline:** Sign out on this device?
- **Subheadline:** Your synced progress stays on your account and comes back when you sign in again.
- **Body:** None
- **CTA:** Primary "Sign out" → `POST /auth/signout`. Secondary "Stay signed in" → closes the dialog.
- **Alternatives:**
  - Headline A: "Sign out of Signal Path?" Rationale: names the product; less precise about scope.
  - Headline B: "Leaving this device?" Rationale: friendly; ambiguous.
  - CTA A: "Yes, sign out". Rationale: explicit confirmation.
  - CTA B: "Cancel". Rationale: standard; less clear than "Stay signed in".
- **Notes:** If sync is off, replace the subheadline with "Progress stays in this browser. Sign in again to see it on other devices."

### signed-out
- **Eyebrow:** None
- **Headline:** You're signed out.
- **Subheadline:** Free lessons still work without an account.
- **Body:** None
- **CTA:** Primary "Sign in again" → `/login`. Secondary "Go to the free lessons" → `/learn`.
- **Alternatives:**
  - Headline A: "Signed out." Rationale: shortest; fine as a toast instead of a page.
  - Headline B: "Signed out of this device." Rationale: states the scope; useful if learners use several devices.
  - CTA A: "Back to home" → `/`. Rationale: neutral exit.
  - CTA B: "Sign in". Rationale: shorter.
- **Notes:** Can be a toast on the home page instead of a full page.

### account-overview
- **Eyebrow:** Account
- **Headline:** Your account
- **Subheadline:** Signed in as {email}.
- **Body:** Section navigation: "Purchases", "Refunds", "Progress sync", "Your data", "Sign out".
- **CTA:** None
- **Alternatives:**
  - Headline A: "Account and purchases". Rationale: names the two things people come here for.
  - Headline B: "Signed in as {email}". Rationale: merges headline and subheadline.
  - CTA A/B: None.
- **Notes:** Utility page; labels stay literal.

### account-purchases
- **Eyebrow:** None
- **Headline:** Purchases
- **Subheadline:** None
- **Body:**
  - Row format: "{product} · {currency}{amount} · {date} · {status}" with a link "Receipt" to the Stripe receipt.
  - Status labels: `paid` → "Paid", `refunded` → "Refunded", `disputed` → "Disputed, access paused", `canceled` → "Cancelled".
  - Empty state: "You haven't bought anything yet. Modules 0 and 1 are free on this account."
- **CTA:** Empty state only: "See Signal Path Complete" → `/pricing`.
- **Alternatives:**
  - Empty-state CTA A: "Get Signal Path Complete" → `/pricing#buy`. Rationale: direct; slightly pushy on an account page.
  - Empty-state CTA B: "Continue with the free lessons" → `/learn`. Rationale: no sales on a utility page.
- **Notes:** Status strings map to the `purchases.status` values in architecture.md.

### account-refund
- **Eyebrow:** None
- **Headline:** Refunds
- **Subheadline (inside the 30 days):** You bought Signal Path Complete on {date}. You can get a full refund until {refundDeadline}.
- **Body (inside the 30 days):** The {currency}{amount} goes back to the card or account you paid with. Your notes and progress stay in your account.
  - Confirm dialog headline: "Refund {currency}{amount}?"
  - Confirm dialog body: "We close the paid lessons when we issue the refund. You can buy the course again later."
  - Confirm dialog buttons: "Yes, refund me" / "Keep the course"
  - Done state: "Refund requested. We'll confirm by email within [NEED: processing time, e.g. 2 working days]. Your bank usually shows the money 5–10 working days after that."
- **Subheadline (after 30 days):** The 30-day refund window closed on {refundDeadline}.
- **Body (after 30 days):** If something in the course is wrong or not working, email [NEED: support email] and tell us what happened. If you finished the Stage 1 labs and still can't explain your first capture, the Stage 1 promise applies until [NEED: promise window end date].
- **CTA:** Inside the window: "Request a refund" → opens the confirm dialog. After: "Read the Stage 1 promise" → `/legal/refunds#stage-1-promise`.
- **Alternatives:**
  - Headline A: "Request a refund". Rationale: action as heading; reads oddly after the window closes.
  - Headline B: "Your 30-day refund". Rationale: names the policy; same issue after day 30.
  - CTA A: "Refund my purchase". Rationale: first person, clear.
  - CTA B: "Start a refund". Rationale: suggests more steps than there are.
- **Notes:** No retention offer, no exit survey before the refund. An optional one-line "What made you decide?" field may follow the done state and must not block it. [NEED: confirm whether refunds are issued automatically via the Stripe API or reviewed by hand]

### account-sync
- **Eyebrow:** None
- **Headline:** Progress sync
- **Subheadline:** Your progress, quiz scores, notebook and signal atlas follow you to every device you sign in on.
- **Body:** Toggle label: "Sync to my account". Helper when off: "Everything stays in this browser only. Export a backup before you clear your browser data."
- **CTA:** None (toggle)
- **Alternatives:**
  - Headline A: "Sync across devices". Rationale: describes the benefit.
  - Headline B: "Where your progress is stored". Rationale: privacy framing.
  - CTA A/B: None.
- **Notes:** The privacy notice calls sync optional. [NEED: confirm the toggle ships; if sync is always on when signed in, drop this section and edit the privacy notice]

### account-export
- **Eyebrow:** None
- **Headline:** Your data
- **Subheadline:** Download everything the course stores about your learning as one JSON file.
- **Body:** The file holds your progress, quiz scores, badges, signal atlas and notebook entries. You can import it in another browser from the notebook page. To get a copy of your account and purchase records, or to delete your account, email [NEED: support email]. We reply within one month.
- **CTA:** "Download my data" → downloads `signal-path-YYYY-MM-DD.json`.
- **Alternatives:**
  - Headline A: "Export your data". Rationale: the action as heading.
  - Headline B: "Take your notes with you". Rationale: warmer; undersells the full export.
  - CTA A: "Export as JSON". Rationale: names the format for technical learners.
  - CTA B: "Download a backup". Rationale: frames it as safety.
- **Notes:** The one-month reply time is the GDPR limit; the legal reason lives in the privacy notice, not here. The file keeps the legacy backup format `{format: "signal-path-backup", version: 1, state}` so old backups still import.

### account-signout
- **Eyebrow:** None
- **Headline:** Sign out
- **Subheadline:** Signed in as {email} on this device.
- **Body:** None
- **CTA:** "Sign out" → opens `signout-confirm`.
- **Alternatives:** None (utility).
- **Notes:** None.
