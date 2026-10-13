# Paid downloads

Files here are served only through `GET /api/downloads/<file name>` after `hasAccess(locals, 'paid')`.
Never move them into `public/` and never import them from client code.

- `lab-notebook.md`: lab notebook template (from the legacy site)
- `wifi-devboard-notebook.md`: Wi-Fi Devboard recovery notebook (from the legacy site)

This README is not served. The production server must run with the project root as its working directory, or copy this folder next to the server entry (see `docs/v2/deploy.md`).
