# Signal Path: course and paid-launch plan

Updated 16 September 2026. **Confirmed:** custom interactive course, one-time purchase. **Proposed:** audience, free/paid boundary, provider and access terms below. No checkout or access control is implemented yet; the current GitHub Pages build publishes the entire course.

## The course promise

Go from a new Flipper Zero owner to someone who can explain signals, run controlled experiments, build a small app, and present a reproducible project on authorized equipment.

Working audience: curious beginners and technical hobbyists. No RF background required; the app-development stage introduces a steeper programming/toolchain step. Browser simulations allow an initial start without hardware. The core practical work needs a Flipper and suitable training equipment; the Wi-Fi board is optional. Keep the existing Romanian lab guide, but do not assume the selling business or every learner is in Romania.

## One course, six clear groups

Keep the existing module IDs and URLs. They already anchor progress, quiz scores, notebooks and incoming links. Group lessons without renumbering them.

| Group | Existing modules | Learner outcome / checkpoint | Proposed access |
|---|---|---|---|
| Start here | 00–01 | Set up the lab, record scope, explain a synthetic signal observation | Free |
| 1. Read and reason about signals | 02–05 | Annotate a capture and explain the limits of replay | Paid |
| 2. Build your signal atlas | 06–10 | Classify training tags, document observations and recover a known setup | Paid |
| 3. Build across interfaces | 11–15 | Document an interface experiment and build/test a small app | Paid |
| 4. Demonstrate independent work | 16–17 | Test a bounded claim and assemble a reproducible portfolio | Paid |
| Optional Wi-Fi extension | 18, after 08/12/15 | Record firmware/recovery and repeat a controlled AP test | Included with paid course |

The suggested schedule stays around 12 weeks at 2–4 hours a week, with 3–4 additional sessions for Wi-Fi. These are planning estimates; validate them with pilot learners. Module 11 (IR) can remain an early hardware exercise after setup.

### A consistent lesson shape

1. **Outcome:** one concrete thing the learner can explain or demonstrate.
2. **Before starting:** prerequisites, equipment, time estimate and scope.
3. **Understand:** concise explanation and diagram/simulator where useful.
4. **Predict and practise:** one bounded lab with an expected observation.
5. **Check:** quiz explanations, troubleshooting and a negative/control case.
6. **Keep evidence:** notebook prompt and an example of adequate evidence.
7. **Continue:** next lesson and a later retrieval/review prompt.

Use this as the editorial checklist for the existing lessons, not a reason to split every page into more files. Preserve text-first teaching; add short hardware demonstrations only where movement or device interaction is hard to explain with existing material.

### Assessment and product boundaries

Retain quizzes for practice and notebook evidence for practical learning. Learners should explain wrong answers and repeat the lab before moving on. Foundation and final projects provide the main evidence of capability. Completion marks and badges remain self-reported; do not sell them as accredited certification or imply instructor review.

Initial offer: one purchase for the published course and Wi-Fi extension. Define the actual access duration, included updates and support scope before checkout copy is published. Do not promise indefinite support, future courses, coaching, or a community as part of this purchase. Keep the price and currency undecided until audience, costs and access terms are set.

## Payment choice

Payment processing, tax administration and protecting course files are separate responsibilities. A merchant of record (MoR) acts as the seller for the customer transaction and handles the covered sales-tax collection/remittance; it does not remove the creator's own business accounting obligations or implement our course authorization.

| Option | Current published terms / fit | Recommendation |
|---|---|---|
| **Lemon Squeezy** | Lists courses as supported digital products; base 5% + US$0.50 per transaction, with sales-tax/VAT handling as MoR. Additional transaction and payout fees apply. | First candidate when reducing international sales-tax administration matters most. Confirm business and product eligibility. |
| **Stripe Checkout** | Hosted checkout included with standard Payments pricing. The Romanian pricing page lists 1.5% + 1 leu for standard EEA cards; other card classes/currency conversion differ. Standard Checkout does not itself make Stripe the MoR. | Good when you want direct payment control and will arrange tax/accounting responsibilities. Country-specific fees depend on the actual business location. |
| **Stripe Managed Payments** | Separate MoR offering; the Romanian pricing page lists 3.5% in addition to Payments fees. | Compare if the account and course qualify; availability must be verified for the actual business. |
| **Thinkific** | Hosted course delivery with one-time payments and built-in learning tools; plan and payment costs apply. | A practical alternative if minimizing platform maintenance becomes more important than keeping the custom experience. |
| **Paddle** | Describes its focus as software businesses; onboarding/product fit needs confirmation. | Not the first choice for this course; do not assume a course is approved because it contains interactive JavaScript. |

For Lemon Squeezy, the fee documentation currently adds 1.5% for international transactions outside the US, 1.5% for PayPal, and 0.5% for subscriptions. It also lists a 1% bank payout fee outside the US. Compare effective costs for the actual buyer mix and payout country rather than just the headline fee.

**Provisional recommendation:** shortlist Lemon Squeezy first for the one-time custom course; choose Stripe Checkout if tax administration is already covered and its effective fees/control are preferable. Provider selection remains open until the business country and product acceptance are known. Do not build multiple payment integrations.

Sources checked 15 September 2026:

- [Lemon Squeezy pricing and course support](https://www.lemonsqueezy.com/pricing), [additional fees](https://docs.lemonsqueezy.com/help/getting-started/fees), [product eligibility](https://docs.lemonsqueezy.com/help/getting-started/prohibited-products).
- [Stripe Romanian pricing](https://stripe.com/en-ro/pricing), [Managed Payments](https://docs.stripe.com/payments/managed-payments).
- [Thinkific plans and delivery features](https://www.thinkific.com/pricing/).
- [Paddle product policy](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle).

## The smallest real paywall

Hosting constraints checked 16 September 2026: no course project exists on the connected Vercel team, and that team is on the Hobby plan, which Vercel restricts to non-commercial use, so selling requires Pro or another host. The connected Supabase project serves a different product; the course needs its own project rather than a shared database.

Keep the HTML/CSS/JavaScript course. Add one server application with managed sign-in, the selected provider's hosted checkout, a purchase record and request-time access checks. Choose the hosting/auth service once the provider and operating constraints are known. There is no reason yet for a framework rewrite, custom card form, subscription engine, CMS or separate microservices.

### Learner flow

Public outline → free starter → sign in → hosted one-time checkout → payment confirmation → course access → resume learning.

The return screen must show pending confirmation when appropriate, survive reload, and offer a route back to the course. A successful redirect, browser flag, email address entered into a form, or possession of a checkout URL is not proof of payment.

### Delivery boundary

- Public: landing/outline, primer, setup/frequency lessons, glossary, sources, legal information and selected synthetic demos. Publish only starter quiz questions in the public quiz bundle.
- Protected: Modules 02–18 and their lesson-specific quiz answers, paid worksheets, example source downloads and any paid case-study/reference material. Review shared playground, reference and case-study pages for overlapping paid explanations before deciding their final access category.
- Check a verified session and active course entitlement **before returning protected bytes**, including direct asset/download requests. Keep protected content out of public static directories, CDN caches, source maps, preview deployments and public build artifacts. Use private/no-store caching for authenticated responses until a correctly partitioned cache is needed.
- GitHub Pages cannot run this application boundary. Its current build script copies all lessons, downloads and the complete quiz bank. Replace that deployment with protected hosting or restrict Pages to an explicit public allowlist as part of the paywall implementation.
- Check repository visibility and existing published artifacts before launch. Moving the site behind login cannot retract content previously downloaded, forked or cached. Private delivery controls future access, not copying by an authorized learner.

### Payment and account handling

Use managed sign-in and server-verified sessions. Create checkout from the signed-in account; choose the product/price on the server and bind the purchase to an internal user ID. Keep provider secrets on the server.

Verify provider webhook signatures, store the provider order/event identity, and process retries idempotently. Grant the single course entitlement only after verified successful payment for the correct product/account. Handle delayed payment success/failure and reconcile event ordering against the provider's authoritative order state. Never grant from client-supplied price, email or payment status.

Define refund/dispute handling before selling: for example, revoke after a full refund and suspend during an open dispute, with restoration when appropriate. Handle duplicate/out-of-order events without accidentally restoring a refunded purchase. Partial-refund rules and support overrides need explicit decisions. A small user/purchase table plus processed event IDs is sufficient; no billing abstraction is needed.

Stripe documents why webhooks are required for reliable [fulfillment](https://docs.stripe.com/checkout/fulfillment). Lemon Squeezy provides [signed webhooks](https://docs.lemonsqueezy.com/help/webhooks/signing-requests) for its corresponding flow.

Keep the local learning notebook and JSON export initially. An account does not imply cloud-synced progress. If the origin changes during migration, offer export on the old site and import on the new one; browser storage does not transfer automatically.

## Work order before marketing

1. **Course structure and maintenance — this change:** six stages/checkpoints, separate catalog data, retained routes/IDs, catalog/loading checks and this decision record.
2. **Editorial readiness:** apply the lesson checklist, fill missing example evidence, verify hardware labs and timing with pilot learners. The previous verification report does not claim physical lab testing.
3. **Resolve commercial inputs:** selling business country, target learner/market, provider, price/currency, access duration, update/support scope and refund terms.
4. **Implement protected delivery:** choose one host/auth/provider combination, create the product in test mode, move protected content out of public delivery and migrate learner backups.
5. **Verify before taking payment:** anonymous direct lesson/download requests denied; starter works without login; paid user succeeds; unpaid user denied; fake/duplicate/delayed/reordered webhooks handled; cancellation/failure recoverable; refund/dispute changes access; logout/expired sessions denied; quiz bundles and public artifacts leak no protected lessons; test checkout through account recovery and returning learner access.
6. **Launch review, then marketing:** verify live configuration and customer-facing offer/support/refund pages. Marketing begins with an honest, usable paid product and evidence from pilot learners.

## File ownership

- `assets/js/data/course.js`: ordered module metadata, badges and stage/checkpoint definitions; loaded before `site.js` on every page.
- `modules/`: stable lesson URLs. Keep existing names even where a newer title is clearer.
- `assets/js/site.js`: shared rendering, navigation, quizzes and local progress.
- `assets/js/learning.js`: stage rendering, resume links, notebook and backups.
- `assets/js/data/quiz-bank.js`: existing quiz content; must be partitioned at the protected-delivery step.
- `assets/js/widgets/`: interactive learning tools; `assets/css/` and `assets/images/`: shared presentation.
- `downloads/` and `examples/`: learner resources; currently public.
- `docs/`: project plans, brand and verification records; excluded from the site artifact.
- `scripts/`: dependency-free checks and staging. `_site/` is generated and ignored.

Do not rename URL-bearing pages merely to tidy folders. Do not introduce a package manager or build framework for this cleanup. The static homepage remains a readable module index without JavaScript; update it when titles/routes change and check it against the catalog.
