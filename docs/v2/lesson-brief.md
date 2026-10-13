# Lesson editorial brief (v2)

Every lesson in `src/content/lessons/` is rewritten to this standard. The legacy lesson under `legacy/modules/` is the source of facts, labs, diagrams and tone; the inventory in `docs/v2/legacy-map/content-inventory.md` tells you how deep it currently is. The course is strictly educational: labs run only on equipment the learner owns or has written permission to test, and the lessons teach mechanisms, measurement and defence, never procedures against other people's systems.

## Targets per lesson
- Length: 1,800–2,800 words of body text for modules 00–10 and 18 (keep what is good, tighten what is loose); 1,800–2,400 for modules 08 and 11–17, which are currently outlines and must become full lessons.
- Shape, as H2s in this exact order: `Outcome`, `Before you start`, `Understand`, `Predict and practise`, `Check yourself`, `Keep evidence`, `Continue`. H3s are free inside each.
- `Outcome`: one concrete capability in one sentence, then two or three "by the end you can…" bullets.
- `Before you start`: prerequisites (link previous lessons), gear list, time, what transmits (if anything), the scope line ("your own device, your own space"), and a short legal/safety note where the topic needs one.
- `Understand`: the mechanism, explained from first principles with correct vocabulary; at least one figure (inline SVG diagram, timing table, register/field table or worked numeric example) per major idea; a "what the screen is actually showing you" passage where the Flipper UI is involved; one `<Callout variant="story">` at most; a misconceptions list.
- `Predict and practise`: one or two labs using `<Lab>`; each lab states the prediction the learner writes down first, the steps, the expected observation, a control or negative case, and a `<Win>` criterion ("you've got it when…"). Browser tools (`<Widget>`) come before hardware where a tool exists.
- `Check yourself`: the quiz mount plus two short reflection questions.
- `Keep evidence`: the notebook prompt (what to record, what counts as adequate evidence, an example entry) and the retrieval date suggestion.
- `Continue`: what the next lesson builds on, one retrieval question for a week later, and the primary sources with the date you verified them.

## Fact-check protocol
Before writing, list every technical claim in the legacy lesson. Verify each against an official source (docs.flipper.net, developer.flipper.net, the chip or standard documentation, the regulator). To fetch pages, load tools with ToolSearch ("select:WebFetch,WebSearch"). Correct what is wrong, make vague claims precise with numbers and the firmware/SDK version they apply to, and cite in `Continue` and in frontmatter `sources`. If a claim cannot be verified, either remove it or mark the sentence with `[VERIFY: …]` so the review pass can decide. Never invent numbers.

## Quiz
Questions live in `src/data/quiz/free/<id>.ts` (m00, m01, primer) and `src/data/quiz/paid/<id>.ts` (others); both folders are loaded by `import.meta.glob` barrels, so add a file, not an import. Each question: `{ id: 'm02-q01', q, options: [4 strings], answer: index, why: explanation }`. Target 8–10 questions per module (keep the legacy ones that are good, fix weak ones, add new ones that test understanding rather than recall). Distribute correct answers evenly across indices 0–3 within a module. Explanations teach, in one or two sentences.

## Writing rules
Follow `docs/v2/copy-brief.md` (no AI tells, no em dashes in headings, no exclamation marks, no buzzwords). Second person, plain, exact. Keep the legacy lesson's good analogies when they are physically honest. Use `<Flip>` for on-device UI paths, `<Term id="…">` for glossary terms the first time they appear, `<Callout variant="warn">` for anything that can damage hardware or break a rule, `<Callout variant="legal">` only when a rule applies (keep the Romanian lab guide link in lessons that transmit or read other people's tags).

## Frontmatter
Complete every field in the schema (`src/content.config.ts`): `minutes` realistic, `gear` specific, `transmits` honest, `tools` and `scenes` matching what the body mounts, `evidence` one sentence, `sources` with titles, `reviewed` set to today's date, `badge` from `src/data/course.ts`.

## Out of scope
No new widgets or scenes (reference existing ids only; list wished-for tools in a `{/* TODO: tool */}` comment, since HTML comments break the MDX compiler). No changes to layouts, components or data files other than the quiz file for your module. Do not edit other lessons.
