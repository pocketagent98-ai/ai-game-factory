# PUBLISHING — how to ship Merge & Bloom to every portal

The game is a **static HTML5 build** (no build step). Everything you need to publish is in this folder.

## 1. What to submit (assets to prepare once)
- **The build:** `index.html` is a **single self-contained file** (all CSS + JS inlined). Submit just that one file (or the whole folder) — no separate `js/`/`css/` needed. Rebuild it from source any time with `node build.mjs`.
- **Thumbnails:** 512×512, 512×384, 200×120, plus a 16:9 cover. **Bright, text-free** — the thumbnail is the #1 driver of click-through.
- **Animated thumbnail / hover video** (required for Poki global release; recommended elsewhere).
- **Short trailer** (10–20 s).
- **Description + controls text** (English mandatory).
- **Privacy-policy URL** (required if anything links externally).

## 2. Integrate the platform ads (already wired — verify per portal)
`js/platform.js` **already integrates Playgama Bridge** (LGPL-3.0): it calls `bridge.initialize()`, uses `bridge.storage` for saves, `bridge.advertisement.showInterstitial()` / `showRewarded()`, and the platform pause/audio events — with a **standalone fallback** (localStorage + simulated ads) when Bridge is absent.

The Bridge SDK is loaded in `index.html`:
```html
<script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>
```
Bridge is the single integration for Poki, CrazyGames, GameDistribution, Yandex, Playgama, YouTube Playables, MSN, Discord and more. **Ads are served by the platform — never bundle your own ad network (no AdMob/AdSense).** If a portal blocks external scripts, bundle the Bridge file locally or use that portal's native SDK in the same `Platform` interface.

## 3. Per-portal checklist

| Portal | How to submit | Key requirements |
|---|---|---|
| **Poki** | developers.poki.com (curated) | <8 MB; portrait; **no IAP**; no external requests; SDK events correct; originality |
| **CrazyGames** | developer.crazygames.com | Basic Launch first (SDK optional, no monetisation) → Full Launch (SDK required); ≤50 MB; PEGI-12; AdBlock-safe |
| **GameDistribution** | gamedistribution.com/developers | SDK mandatory; **pre-roll + mid-roll mandatory**; English; approval ≤3 weeks |
| **GameMonetize** | gamemonetize.com | `.zip` with `index.html` at root; SDK mandatory; 45% share |
| **Yandex Games** | Yandex Developer Console | SDK mandatory; ≤100 MB uncompressed; auto language detection; RU+EN |
| **Playgama** | playgama.com/developers | Bridge SDK mandatory; ~24 h review; pushes to 100+ partners |
| **itch.io** | itch.io dashboard | Showcase only (no ads → no ad revenue; donations possible) |

## 4. Recommended launch order
1. **CrazyGames Basic Launch** → gather metrics.
2. **GameDistribution + GameMonetize** → fast monetised distribution.
3. **Playgama** → syndicates to 100+ partners.
4. **Poki** (apply with the polished build; use free Playtesting).
5. **Yandex Games** (SDK + Game Ready).
6. **CrazyGames Full Launch** (SDK + monetisation).
7. **itch.io** showcase.

> **Exclusivity:** Poki's default deal is web-exclusive (5 yr). CrazyGames offers +50% for 2-month exclusivity. You **cannot** take both — choose syndication (recommended for a first title) or one exclusive.

## 5. Before you submit (QA)
- [ ] Works in portrait on a phone; loads in <3 s; build ≤6 MB
- [ ] Playable **with an ad-blocker** and **without** watching any ad
- [ ] No console errors; no external requests; no IAP UI (Poki/GD)
- [ ] English text + auto language detection (Yandex)
- [ ] Thumbnails + trailer + description ready; privacy-policy URL ready

## 6. Automation in this repo
- `.github/workflows/web-pages.yml` — deploys the game to GitHub Pages on every push.
- `.github/workflows/web-ai-builder.yml` — NVIDIA-powered loop (uses the `NVIDIA_API_KEY` secret) that improves the game and opens a PR only if the tests pass.
