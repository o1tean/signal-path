# Legal pages copy

Routes: `/legal/refunds`, `/legal/privacy`, `/legal/terms`, `/legal/imprint`. The refund policy and privacy notice are written in full. The terms of use are an outline.

**Have a qualified lawyer in the selling entity's country review all four pages before launch.** Nothing here has been reviewed by a lawyer. Every `[NEED: …]` must be resolved before the pages go live.

Spelling: British. Tone: plain and short. These pages use headings and paragraphs; the section fields below are kept for consistency, with the page text in **Body**.

### refunds
- **Eyebrow:** Legal
- **Headline:** Refund policy
- **Subheadline:** Last updated [NEED: date]. This policy applies to Signal Path Complete and any other paid Signal Path product.
- **Body:**

  **The 30-day refund**

  If you ask within 30 days of the date you bought Signal Path Complete, we refund the full price. You don't need to give a reason.

  **How to ask**

  Sign in, go to your account page, open Refunds and choose "Request a refund". Or email [NEED: support email] from the address you bought with, and include the purchase date.

  **What happens next**

  We confirm the refund by email within [NEED: processing time, e.g. 2 working days]. The money goes back to the card or account you paid with, through Stripe. Your bank usually shows it within 5–10 working days after we issue it. If you paid in instalments, the instalment provider cancels or refunds the remaining payments under its own terms.

  When we issue the refund, your access to the paid lessons, tools and downloads ends. Your free account stays open, along with your progress and your notebook entries. You can export them from your account page at any time.

  **The Stage 1 promise** {#stage-1-promise}

  This applies after the 30 days as well. Finish the four Stage 1 labs (Modules 2 to 5) and write a notebook entry for each. The entries should name your capture's frequency, modulation and protocol, and say why your replay worked or failed. If they still can't, email them to [NEED: support email] within [NEED: window, e.g. 60 days] of buying. We refund the full price within [NEED: reply time, e.g. 3 working days], and you keep the notebook templates you downloaded.

  **Your statutory right of withdrawal**

  If you are a consumer in the European Union, the law gives you 14 days to withdraw from an online purchase. For digital content, the right ends when access starts, if you asked for immediate access and confirmed you understood you would lose the right. [NEED: confirm checkout collects this consent] Our 30-day refund applies either way. It is in addition to your statutory rights.

  **Payment disputes**

  If your bank opens a dispute (a chargeback) on the payment, we pause access to the paid lessons until the dispute closes. If it closes in our favour, access comes back automatically. If you want your money back, ask us for a refund instead. We confirm refunds within [NEED: processing time], and bank disputes often take weeks to close.

  **Buying again**

  You can buy the course again after a refund. Your progress and notes will still be there.

  **Contact**

  [NEED: support email] · [NEED: legal entity name and registered address]
- **CTA:** None
- **Alternatives:** None (policy text).
- **Notes:** The 14-day rule is Directive 2011/83/EU, articles 9 and 16(m). Confirm with the lawyer that the 30-day refund is offered to every buyer, including businesses. The anchor `{#stage-1-promise}` is used by the account page.

### privacy
- **Eyebrow:** Legal
- **Headline:** Privacy notice
- **Subheadline:** Last updated [NEED: date]. What Signal Path collects, why, who else handles it, and how to get it back or deleted.
- **Body:**

  **Who we are**

  Signal Path is run by [NEED: legal entity name], [NEED: registered address], [NEED: company registration number]. We are the controller for the personal data described here. Contact: [NEED: privacy or support email].

  **The short version**

  We collect your email address so you can sign in and a record of what you bought. If you turn on sync, we also store your course progress and notes. Stripe handles your card details; we never see them. The site sets only the cookies needed to keep you signed in. We use no advertising trackers and sell no data.

  **What we collect and why**

  | Data | When | Why | Legal basis (GDPR art. 6) |
  |---|---|---|---|
  | Email address | When you create an account | To send sign-in links and course emails, and to tie purchases to you | Contract (art. 6(1)(b)) |
  | Display name, if you add one | When you set it | To show it in your account | Contract |
  | Sign-in records: time, IP address, browser type | Each sign-in | To keep accounts secure and investigate abuse | Legitimate interest in security (art. 6(1)(f)) |
  | Purchase records: Stripe customer and order IDs, product, amount, currency, status, date, and the payment event Stripe sends us | When you buy, get a refund or a dispute is opened | To give you access, handle refunds and disputes, and keep accounting records | Contract, and legal obligation for accounting (art. 6(1)(c)) |
  | Learner state: progress, quiz scores, badges, signal atlas, notebook entries | Only when you are signed in with sync on | To keep your progress the same on every device | Contract, at your request |
  | Emails you send us | When you write to us | To answer you | Contract or legitimate interest, depending on the request |

  We don't ask for your name, address or phone number. Card and bank details go to Stripe directly. We receive only the order details listed above, plus any billing name, country and VAT number you enter at checkout for an invoice.

  **What stays on your device**

  If you use the course signed out, or with sync off, your browser keeps your progress, quiz scores, notebook and preferences (theme and reduced motion). They sit in its local storage under keys that start with `signalpath.`. They never leave your device unless you export them or turn on sync. Clearing your browser data deletes them, so export a backup first.

  **Cookies**

  We set only the cookies our sign-in system needs to keep you signed in. They are strictly necessary, so the site does not ask for cookie consent. [NEED: confirm no analytics; if privacy-respecting analytics is added later, update this section first]

  We serve fonts from our own server, so loading a page does not contact a font service. [NEED: confirm fonts are self-hosted in the build]

  **Who else handles your data**

  These providers process data for us under data processing agreements:

  - **Supabase** stores accounts, purchase records and synced learner state, in the [NEED: region, e.g. EU (Frankfurt)] region, and sends sign-in emails [NEED: confirm, or name the email provider].
  - **Stripe** processes payments. For fraud prevention and its own legal obligations, Stripe acts as an independent controller; see Stripe's privacy policy.
  - **[NEED: hosting provider]** hosts the website and keeps short-lived server logs (IP address, requested page, time) for security and debugging.

  Some providers are based in the United States or use sub-processors there. Those transfers rely on [NEED: transfer mechanism per provider, e.g. the EU–US Data Privacy Framework or Standard Contractual Clauses].

  We don't sell personal data, and we share it with authorities only when the law requires it.

  **How long we keep it**

  - Account and learner state: until you delete your account. If you turn sync off, synced learner state is deleted from our database within [NEED: e.g. 30 days].
  - Purchase records: for [NEED: period required by accounting law in the seller's country], even after account deletion, because the law requires it.
  - Sign-in records and server logs: [NEED: e.g. 30 to 90 days].
  - Emails with us: [NEED: e.g. 2 years after the conversation ends].

  **Your rights**

  You can ask us to:

  - give you a copy of your data
  - correct it
  - delete it
  - restrict how we use it
  - send it to you in a portable format

  You can also object to processing based on legitimate interest. You can download your learner data yourself from your account page at any time. For anything else, email [NEED: privacy or support email] from your account address. We answer within one month.

  If you think we have handled your data wrongly, you can complain to a data protection authority, for example the one where you live. In Romania that is ANSPDCP (dataprotection.ro). [NEED: confirm the lead authority for the selling entity]

  **Age**

  Signal Path is intended for people aged [NEED: minimum age, e.g. 16] and over.

  **Security**

  Database rules limit each record to its owner's account. [NEED: confirm against the Supabase row-level security policies] Payment data stays with Stripe. Sign-in uses one-time links, so we store no passwords. If a breach affects your data, we will tell you and the authority as the law requires.

  **Changes**

  If we change this notice in a way that affects you, we will email you before the change takes effect. The date at the top shows the latest version.
- **CTA:** None
- **Alternatives:** None (policy text).
- **Notes:** "Sell no data" and "no advertising trackers" are the two absences stated, once each, because they are what readers check for. The rights are a bullet list because five rights in one sentence ran to 30 words. The local-storage paragraph matters because the legacy course was browser-only and existing learners will ask where their progress went. Confirm with the lawyer whether storing learner state at the user's request counts as contract or consent.

### terms
- **Eyebrow:** Legal
- **Headline:** Terms of use
- **Subheadline:** Last updated [NEED: date]. Outline for the lawyer; each heading lists the points the final text must cover.
- **Body:**

  > Have a qualified lawyer in [NEED: country of the selling entity] review and complete these terms before launch.

  1. **Who we are.** [NEED: legal entity name, registered address, registration number, VAT number if any, contact email]. These terms form the contract between you and [NEED: entity].
  2. **What Signal Path is.** An online course about how the Flipper Zero and the signals it handles work. It is for education. It is not legal advice and does not issue a certification or qualification. Completion badges are self-reported.
  3. **Your account.** One person per account. Sign-in by emailed link, so keep your email account secure. You must be [NEED: minimum age] or older. Tell us if you think someone else has used your account.
  4. **Buying the course.** Prices are shown in {currency} and [NEED: include VAT where it applies / VAT status]. Payment is handled by Stripe. The contract is formed when the payment is confirmed and access is granted. Instalment payments are a separate agreement with the instalment provider.
  5. **Your licence.** A personal, non-transferable licence to use the course content for your own learning, for [NEED: access term, e.g. as long as the course is offered, with notice before any shutdown and an export of your data]. The licence excludes sharing logins, reselling, republishing lessons or quiz banks, and using the content to run a commercial course. Downloads are for your personal use. App source code is licensed separately under [NEED: licence for the Lab Companion app source].
  6. **Refunds and withdrawal.** The 30-day refund and the Stage 1 promise, as set out in the refund policy. The EU right of withdrawal and how it ends for digital content.
  7. **Lab rules and acceptable use.** Use what you learn only on equipment you own or have written permission to test, and follow the radio, privacy and criminal law where you are. Do not use the course, its tools or its downloads to access, interfere with or intercept systems, credentials or communications you are not authorised to test. We may suspend or close an account used for that, and refund the unused part where the law requires it.
  8. **Hardware and risk.** You are responsible for your own devices. Flashing firmware, wiring circuits and transmitting can damage hardware or break local rules. Lessons give recovery steps but cannot guarantee a result.
  9. **Accuracy and changes to the course.** We check lessons against primary sources and date each review. Firmware and law change, so we can't guarantee every detail is current. We may update, reorder or replace lessons; the course you bought will not lose its core coverage [NEED: lawyer to define what counts as a material change and what the remedy is].
  10. **Independence and trademarks.** Signal Path is independent and is not affiliated with or endorsed by Flipper Devices Inc. Flipper Zero is a trademark of its owner. Third-party names are used to identify products only. The 3D Flipper Zero model is derived from Flipper Devices' CAD files under GPL-3.0 [NEED: licence decision from the inventory before shipping it in a paid product].
  11. **Liability.** [NEED: lawyer to draft limits that are valid for consumers in the EU; liability for intent, gross negligence and personal injury cannot be excluded].
  12. **Ending the contract.** You can delete your account at any time. What happens to access and data when you do. When we can end it (breach of section 7, non-payment, a dispute decided against you).
  13. **Changes to these terms.** Email notice at least [NEED: e.g. 30 days] before changes that affect you; the right to stop using the service and the effect on refunds.
  14. **Law and disputes.** [NEED: governing law and courts; consumer protection rules of the buyer's country of residence still apply; name the consumer authority or alternative dispute resolution body if required].
  15. **Contact.** [NEED: support email and postal address].
- **CTA:** None
- **Alternatives:** None (legal outline).
- **Notes:** Sections 5 and 7 have sentences over 25 words; leave them for the lawyer, who will redraft both. Section 7 restates the lab rules in contractual form. Section 10 carries the GPL-3.0 model flag from the content inventory, which must be resolved before launch.

### imprint
- **Eyebrow:** Legal
- **Headline:** Imprint
- **Subheadline:** Who runs Signal Path.
- **Body:** [NEED: legal entity name] · [NEED: legal form] · [NEED: registered address] · [NEED: trade register and number] · [NEED: VAT ID, if any] · [NEED: person responsible for content] · Email: [NEED: support email]. Signal Path is an independent course and is not affiliated with Flipper Devices Inc.
- **CTA:** None
- **Alternatives:** None.
- **Notes:** Which fields are required depends on the seller's country; the lawyer should confirm.
