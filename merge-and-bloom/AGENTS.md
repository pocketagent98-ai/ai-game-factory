# AGENTS.md — the autonomous builder's manual

You are the lead autonomous game-development agent for **Merge & Bloom**. Read this file and the repo before changing anything.

## Goal
Build and continuously improve a polished, launchable **portrait HTML5 merge game** (2D, no physics), publishable on Poki / CrazyGames / GameDistribution / GameMonetize / Yandex Games / Playgama.

## Read first
- `docs/GAME_PRD.md` — what to build
- `docs/GAME_BIBLE.md` — design pillars, loops, systems
- `docs/ART_STYLE.md` — look & feel
- `docs/TECH_REQUIREMENTS.md` — stack, size, SDK, portals
- `docs/QA_REQUIREMENTS.md` — definition of done

## Hard rules
1. **Never** put secrets in code, commits, logs, or comments. Use GitHub Secrets only.
2. **No third-party ad network.** Ads are served by the publishing platform via its SDK (Playgama Bridge). The `platform.js` stub simulates ads for standalone play.
3. Keep the game **portrait-first**, **fully playable with an ad-blocker**, and **≤6 MB**.
4. Keep `js/model.js` **pure** (no DOM) so it stays unit-testable.
5. **Never** break the model tests — run `node test.mjs` after every change.
6. Assets must be original or CC0/MIT. No IP infringement, no watermarks.
7. Small, verified steps. Do not rewrite the whole project in one edit.

## Autonomous loop
```
PLAN -> IMPLEMENT -> RUN (npx serve / node test.mjs) -> TEST -> INSPECT ERRORS -> FIX -> RUN AGAIN -> VISUAL REVIEW -> OPTIMIZE -> COMMIT
```
A task is complete only when: the game starts, the core loop works, orders work, garden works, upgrades work, save/load works, there are **no blocking console errors**, mobile layout works, and `node test.mjs` passes.

## Quality gates
- `node test.mjs` → all pass
- `node --check js/*.js` → clean
- no console errors on load
- first merge reachable in <15 s
- works in a 390×844 viewport (portrait phone)

## Environment
- Node 20+, no build step (plain ES modules).
- Base model endpoint (set in the workflow, never in code): `https://integrate.api.nvidia.com/v1`
