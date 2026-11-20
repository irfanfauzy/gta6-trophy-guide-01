# Leonida Platinum — GTA VI trophy guide & tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/irfanfauzy/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/irfanfauzy/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

Entry for the [make.fun](https://make.fun/bounty/gta6-trophy-guide-01) GTA 6 trophy-guide
bounty: a complete guide and tracker for all 55 GTA VI PlayStation 5 trophies, with
official names, descriptions and grades, own-words guides with sources, a checklist
that saves in the browser, filters, a spoiler setting, a platinum roadmap, and
missable-trophy warnings (1 confirmed, 22 to watch).

## Try it

```sh
node serve.ts   # serves app/ on http://localhost:8080
```

Node 22, standard library only, fully offline — no network at runtime.

## This repository

- `main.ts` — the entry program (Node 22, standard library only).
- `app/` — the offline guide app (`index.html`, `app.js`, `views.js`, `store.js`,
  `filters.js`, `style.css`).
- `app/data/trophies.json` — all 55 trophies with official names, descriptions,
  grades and guides.
- `serve.ts` — a tiny static server for local testing only.
- `screenshots/` — captures of the app running.
- `vendor/` — vendored make.fun harness code, unchanged.
