# 🌿 Merge & Bloom

A **portrait HTML5 merge-2 puzzle with an idle “grow-a-garden” meta** — built to be published on the big web game portals (Poki, CrazyGames, GameDistribution, GameMonetize, Yandex Games, Playgama) and monetised with **ads only, served entirely by the platforms** (no external ad network).

> **Play it:** open `index.html` (or the GitHub Pages URL once deployed). Fully playable on phone and desktop, portrait-first.

---

## What it is

- **Core loop (~3 min):** tap the **Seed Pod** to spawn plants onto a **6×6 grid**, drag one plant onto an identical one to **merge up a 12-tier chain** (Sprout → World Tree), fulfil **visitor orders** for coins.
- **Meta:** every merge fills the **Bloom Meter**, unlocking **Garden plots** — a persistent idle world that produces coins **even while you're away** (offline earnings, capped).
- **Economy:** energy (regenerates, soft-paced), coins (orders + garden), and upgrades (energy cap, regen, seed pod, offline cap, auto-producer).
- **Ads:** rewarded video (opt-in boosts) + interstitials (at natural breaks, platform-paced). The standalone build simulates ads; the portal build swaps in the **Playgama Bridge** SDK (one integration for all six portals).

## Why this concept

Chosen from a deep market study of the seven portals: **merge is the fastest-growing casual mechanic**, web demand is proven but high-quality web merge supply is thin, and the merge + idle-garden hybrid fits the web rewarded-ad economy perfectly. Full evidence in the companion research repo (see below).

## Run / develop

No build step — plain ES modules.

```bash
# serve locally (any static server)
npx serve .          # or: python3 -m http.server
# run the model unit tests
node test.mjs
```

## Project layout

```
merge-and-bloom/
  index.html            # the game page (portrait shell)
  css/style.css
  js/config.js          # all tunables (tiers, economy, drop tables)
  js/model.js           # pure game model (no DOM) — unit-tested
  js/platform.js        # platform/ad adapter (localStorage + simulated ads; swap for Playgama Bridge)
  js/game.js            # view + controller
  test.mjs              # model tests (node test.mjs)
  docs/                 # GAME_PRD, GAME_BIBLE, ART_STYLE, TECH_REQUIREMENTS, QA_REQUIREMENTS
  AGENTS.md             # the autonomous builder's manual
```

## Going live (ads from the platforms)

1. Integrate **Playgama Bridge** in `js/platform.js` (replace the stub bodies) — ads/saves/payments in one SDK.
2. Keep the build **≤6 MB**, portrait, and free of external requests.
3. Submit via each portal's developer console (see `docs/TECH_REQUIREMENTS.md`).

## Companion research

The full market report + GDD live in the separate public repo:
**`html5-game-opportunity-report`** → `README.md` (deep research), `GDD_FINAL.md` (build-ready design doc).

---

*Ads-first, IAP-ready. No third-party ad network is ever bundled — every ad comes from the platform you publish on.*
