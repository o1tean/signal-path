# Signal Path

A hands-on, self-paced **RF course for total beginners**, built around the **Flipper Zero** (Momentum firmware). Plain HTML/CSS/JS — no build step, no dependencies, no tracking. Everything (progress, quiz scores, badges, your signal atlas) is stored in your own browser.

- **11 modules** (Week 0 → Week 6), each with concepts, a hands-on lab, and a quiz.
- **10 interactive simulators**: spectrum scope, a Tune-In game, a modulation Wave Lab, an RF calculator, a pulse decoder, a rolling-code simulator, a tool picker, a Flipper-screen navigator, glossary flashcards, and a personal Signal Atlas.
- **Primer, legal ground rules, reference tables, glossary, and case studies** (including the classic "my Nice gate copies once, then barely works").

## Run it locally

Because pages load JS via relative paths, open it through a tiny local server (not `file://`):

```bash
cd signal-path
python3 -m http.server 8000
```

Then visit http://localhost:8000/ .

## Host it free on GitHub Pages

1. Create a new GitHub repository (public), e.g. `signal-path`.
2. Put the **contents of this `signal-path/` folder** at the repository root (so `index.html` is at the top level of the repo). The included `.nojekyll` file tells Pages to serve the `assets/` folder as-is.
3. Commit and push:

```bash
git init
git add .
git commit -m "Signal Path: RF course for the Flipper Zero"
git branch -M main
git remote add origin https://github.com/<your-username>/signal-path.git
git push -u origin main
```

4. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, pick `main` / `/ (root)`, save.
5. Wait a minute; your site appears at `https://<your-username>.github.io/signal-path/`.

### Note on the 404 page
`404.html` uses absolute (`/…`) links, which resolve correctly on a **user/organization site** (`<user>.github.io`) or a custom domain. On a **project site** served under `/signal-path/`, the 404's nav links will point at the domain root — the rest of the site is fully relative and works under any subpath. If you want a perfect 404 under a project subpath, either use a custom domain or change the four `/…` links in `404.html` to `/signal-path/…`.

## Structure

```
signal-path/
  index.html            course home + module map + progress
  primer.html           the friendly big-picture intro
  playground.html       all 10 simulators on one page
  quiz.html             mixed + per-module quizzes
  reference.html        frequency/preset/.sub cheat-sheets
  glossary.html         flashcards + searchable A–Z
  legal.html            the ground rules
  case-studies.html     real beginner mysteries explained
  404.html
  .nojekyll
  modules/00-setup.html … 10-capstone.html
  assets/
    css/site.css        the whole design system
    js/site.js          shared runtime (window.SP)
    js/data/            quiz-bank.js, glossary.js
    js/widgets/         one file per simulator
    favicon.svg
```

## Editing

- The **course map** (module list, order, badges) lives in one place: `SP.MODULES` and `SP.BADGES` at the top of `assets/js/site.js`.
- **Quiz questions**: `assets/js/data/quiz-bank.js`, keyed by module id (`m00`…`m10`, `primer`).
- **Glossary terms**: `assets/js/data/glossary.js`.
- All colors and type are CSS custom properties at the top of `assets/css/site.css`; it supports light, dark, and system themes.

## A note on responsibility

Signal Path teaches RF using **devices you own**, for learning and legitimate testing. Radio transmission is regulated where you live, and interfering with other people's devices is illegal and harmful. When in doubt: listen, don't transmit. See `legal.html`.
