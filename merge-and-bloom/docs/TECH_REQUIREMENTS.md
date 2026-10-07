# TECH_REQUIREMENTS — Merge & Bloom

## Stack (current)
- **Vanilla JS + Canvas, ES modules, no build step.** Chosen so the game runs instantly on GitHub Pages and is trivially iterable by an agent.
- No physics engine (grid merge) — the single biggest mobile-CPU saving.
- `js/model.js` is pure (no DOM) and unit-tested.

> Upgrade path: if the game grows, migrate the view to **Phaser 3.90 + TypeScript + Vite** (still ≤6 MB gzip). Keep the model pure either way.

## Performance budget
- Initial load ≤6 MB total; first gameplay <3 s on a mid-range Android.
- Cap `devicePixelRatio` at 2. Cap draw calls; use atlases if raster art is added.
- No steady-state allocation in hot paths.

## Platform / SDK
- **Playgama Bridge** is the single integration layer (LGPL-3.0) covering Poki, CrazyGames, GameDistribution, Yandex, Playgama (+25 platforms).
- Required calls (via Bridge): `initialize()` → `sendMessage('game_ready')` on first playable frame → `gameplayStart()` / `gameplayStop()` → interstitial at natural breaks → rewarded on explicit action. Mute + pause during any ad.
- **Saves:** Bridge `Storage` (never raw `localStorage` in the portal build). Versioned JSON envelope; keep <1 MB (CrazyGames JSON / Poki gzip limits).

## Portal budgets
| Portal | Initial size | Notes |
|---|---|---|
| Poki | **<8 MB** | no external requests; portrait; no IAP; SDK ads only |
| CrazyGames | ≤50 MB (≤20 MB mobile home) | ≤1500 files; SDK required for Full Launch; AdBlock-safe |
| GameDistribution | — | pre-roll + mid-roll mandatory; English required |
| GameMonetize | — | `.zip`, `index.html` at root; SDK mandatory |
| Yandex | ≤100 MB uncompressed | SDK mandatory; auto language detection |
| Playgama | ≤300 MB zip | Bridge mandatory; 24 h review |

## Compliance
- PEGI 12 / all-ages. No third-party ads, no IAP UI on Poki/GD, no external requests, no external accounts, no chat. Playable with an ad-blocker. Provide a privacy-policy URL if anything links out.

## Security
- **Never** commit API keys or secrets. All keys live in GitHub Secrets (e.g. `NVIDIA_API_KEY`) and are referenced by name only.
