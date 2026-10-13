# Site chrome copy

Navbar, footer, 404, cookie line and toast messages. Labels are short, literal and in sentence case. No em dashes, no exclamation marks.

### navbar
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:**
  - Logo text: "Signal Path" (links to `/`)
  - Links: "Course" → `/course` · "Tools" → `/tools` · "Pricing" → `/pricing` · "Resources" (menu)
  - Resources menu, label and one-line description:
    - "Primer" · Six ideas to read before Module 0 → `/primer`
    - "Reference" · Frequencies, presets and file fields → `/reference`
    - "Glossary" · Every term in the course, defined → `/glossary`
    - "Case studies" · Five beginner problems, traced to the cause → `/case-studies`
    - "Sources" · Where each claim comes from → `/sources`
    - "Romanian lab guide" · What to check before a hardware lab → `/romania-lab-guide`
  - Signed out: "Sign in" → `/login`
  - Signed in: "My course" → `/learn` · "Account" → `/account`
  - Button, signed out or free: "Start free" → `/learn/00-setup`
  - Button, owners of Complete: hidden (the "My course" link replaces it)
  - Mobile menu toggle, accessible label: "Open menu" / "Close menu"
  - Skip link: "Skip to content"
  - Theme toggle, accessible label: "Switch to dark theme" / "Switch to light theme"
- **CTA:** "Start free" → `/learn/00-setup`
- **Alternatives:**
  - CTA A: "Start the free starter". Rationale: matches the hero; may be too long for the bar.
  - CTA B: "Try Module 0". Rationale: exact; less clear that it is free.
- **Notes:** "My course" instead of "Dashboard" because learners think in lessons. The button hides for owners so it never asks a buyer to start.

### footer
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:**
  - Line under the logo: "A 12-week Flipper Zero course. Every lab runs on equipment you own or have permission to test."
  - Column "Course": Course · Tools · Pricing · Primer
  - Column "Reference": Reference · Glossary · Case studies · Sources
  - Column "Rules and help": Romanian lab guide · Refund policy · Privacy · Terms · Imprint · Contact ([NEED: support email])
  - Independence line: "Signal Path is an independent course and is not affiliated with or endorsed by Flipper Devices Inc. Flipper Zero is a trademark of its owner."
  - Cookie line: see `cookie-line`.
  - Copyright: "© {year} [NEED: legal entity name]"
- **CTA:** None
- **Alternatives:**
  - Line A: "Learn how your Flipper Zero works, on equipment you're allowed to test." Rationale: puts the outcome first.
  - Line B: "An independent Flipper Zero course. Each lesson shows the date we last checked its sources." Rationale: leads with the dated sources for sceptical readers.
- **Notes:** The legacy footer also named Apple in the non-affiliation line. Nothing in v2 refers to Apple, so it is dropped. [NEED: confirm no Apple trademark is used]

### cookie-line
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:** Footer text: "We set only the cookies that keep you signed in. Details in the [privacy notice](/legal/privacy)."
- **CTA:** None
- **Alternatives:**
  - A: "Cookies: sign-in only. See the privacy notice." Rationale: shorter; label style.
  - B: Show nothing. Rationale: strictly necessary cookies need no notice; keep the line only as a trust signal.
- **Notes:** No consent banner is needed while the site sets only strictly necessary cookies. If analytics or any third-party embed is added, a consent mechanism must ship first.

### not-found
- **Eyebrow:** 404
- **Headline:** This frequency is dead air.
- **Subheadline:** The page you asked for isn't here. It may have moved when we rebuilt the course.
- **Body:** Old links to lessons such as `/modules/02-modulation.html` redirect automatically. If you followed a link from inside Signal Path, tell us at [NEED: support email] and we'll fix it.
- **CTA:** Primary "Go to the course" → `/course`. Secondary links: "Tools" → `/tools` · "Glossary" → `/glossary` · "Home" → `/`.
- **Alternatives:**
  - Headline A: "Nothing on this channel." Rationale: same joke, shorter.
  - Headline B: "Page not found." Rationale: plain; use if the joke tests badly.
  - CTA A: "Back to home" → `/`. Rationale: universal fallback.
  - CTA B: "Find a lesson" → `/course`. Rationale: most 404 visitors are looking for a lesson.
- **Notes:** Keeps the legacy headline, which is on-voice and dry. The ASCII Flipper from the legacy page can stay as the visual.

### toasts
- **Eyebrow:** None
- **Headline:** None
- **Subheadline:** None
- **Body:**
  - Mark complete: "Module {number} marked complete. {done} of 19 done."
  - Undo mark complete: "Module {number} marked not complete." Action: "Undo"
  - Badge earned: "Badge earned: {badgeName}." Action: "See your badges"
  - Notebook saved: "Saved."
  - Notebook saved and synced: "Saved to your account."
  - Saved offline (signed in, no connection): "Saved in this browser. It will sync when you're back online."
  - Storage error: "Your browser blocked saving, so this change will be lost when you close the tab. Private windows often do this. Export a backup to keep your work." Action: "Export backup"
  - Storage full: "Your browser's storage is full. Export a backup, then clear old data." Action: "Export backup"
  - Sync error: "Couldn't sync to your account. Your work is saved in this browser, and we'll try again in a minute."
  - Import success: "Backup imported. {count} lessons and {notes} notebook entries restored."
  - Import error: "That file isn't a Signal Path backup, or it's damaged. Nothing was changed."
  - Copied: "Copied."
  - Signed out: "Signed out."
  - Quiz finished: "{score} of {total}. Read the explanations for the ones you missed."
- **CTA:** None
- **Alternatives:**
  - Mark complete A: "Module {number} done. {done} of 19." Rationale: shorter for mobile.
  - Badge earned A: "New badge: {badgeName}." Rationale: shorter.
- **Notes:** Completion is self-reported, so the toast says "marked complete" rather than congratulating. Toasts that report a problem say what happened, whether work is safe, and what to do.
