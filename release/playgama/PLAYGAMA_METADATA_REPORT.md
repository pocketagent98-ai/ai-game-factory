# PLAYGAMA METADATA REPORT — Merge & Bloom

Prepared from the actual repository (`pocketagent98-ai/ai-game-factory`, folder `merge-and-bloom/`),
its Git history, GitHub Actions runs, and source files. Nothing below is inferred where it could
not be proven; unprovable items are marked **NOT PROVEN FROM REPOSITORY**.

## 1. Metadata table

| Field | Final value | Evidence | Confidence |
|---|---|---|---|
| Title | **Merge & Bloom** | `package.json` name `merge-and-bloom`; `index.html` `<title>`; `README.md` | High |
| Engine | **None (no game engine)** — hand-written HTML5 | `docs/TECH_REQUIREMENTS.md`: "Vanilla JS + Canvas, ES modules, no build step" | High |
| Technology / framework | **Vanilla JavaScript (ES modules) + Canvas 2D**; shipped as one self-contained `index.html` | `js/*.js`, `build.mjs`, built `index.html` | High |
| Orientation | **Portrait** | `package.json` description "portrait HTML5 merge-2 puzzle…"; `AGENTS.md` "keep the game portrait-first"; CSS `#app{max-width:520px}` | High |
| Genre | **Merge-2 hybridcasual puzzle with a light idle "grow-a-garden" meta** | `package.json` description; `docs/GAME_PRD.md`, `docs/GAME_BIBLE.md` | High |
| Main gameplay | Tap the Seed Pod to drop plants onto a 6×6 grid; drag one plant onto an identical plant to merge into the next of 12 tiers (Sprout → World Tree). Fulfil visitor orders, grow Garden plots for offline coins, upgrade, and spin the Fortune Wheel. | `js/model.js`, `js/config.js` (`TIERS` 12 entries), `js/game.js` | High |
| Multiplayer | **No** | no networking/websocket/room code anywhere in `js/` | High |
| Leaderboards | **Local/simulated only** (no server) | `js/config.js` `LB_NAMES`; `buildLevels()` builds a local list | High |
| In-game purchases | **No** (and Poki/GameDistribution forbid them) | no IAP code in `js/`; `PUBLISHING.md` | High |
| Social features | **No** | no share/login/chat code | High |
| Ads integrated | **Yes** — via the Playgama Bridge SDK | `index.html` contains `<script id="pg-bridge" … playgama-bridge.js>`; `js/platform.js` calls `bridge.advertisement.showRewarded/showInterstitial` | High |
| Playgama Bridge integrated | **Yes** | `js/platform.js` (`bridge.initialize`, `bridge.storage`, `bridge.advertisement`, lifecycle events); `PUBLISHING.md` | High |
| AI agent used to create the game | **NOT PROVEN FROM REPOSITORY** | see §2 | High |
| AI model used to create the game | **NOT PROVEN FROM REPOSITORY** | see §2 | High |

## 2. AI agent / model — exact evidence (no guessing)

- **Commit authorship:** every commit touching `merge-and-bloom/` is authored and committed by
  `pocketagent98-ai <pocketagent98@gmail.com>` — a human account. There is **no** commit authored by
  an AI/bot identity, and **no** `merge-and-bloom-bot` commit (the identity the AI workflow would use).
- **GitHub Actions:** the repository has **10 workflow runs**, all of them either
  "Deploy Merge & Bloom (GitHub Pages)" (`web-pages.yml`) or "Export Game (APK)" (`export.yml`).
  The workflow **"Merge & Bloom - AI builder (NVIDIA)"** (`web-ai-builder.yml`) has **never run**
  (0 runs).
- **What the repo *does* contain:** `AGENTS.md` is titled "the autonomous builder's manual" and names
  a base-model endpoint `https://integrate.api.nvidia.com/v1`; `tools/nvidia_build.py` and
  `workflows/web-ai-builder.yml` are configured to use the model id
  **`meta/llama-3.3-70b-instruct`** (NVIDIA NIM).

**Interpretation (kept strictly separate, as required):**
1. *Primary development agent* — **NOT PROVEN FROM REPOSITORY.** The commits are attributed to the
   human account; the repo proves nothing about which tool/agent wrote the code.
2. *Autonomous build/improvement agent* — a mechanism **exists in the repo** (`web-ai-builder.yml`),
   but it has **never executed**, so it produced **no** game code.
3. *Model used by a helper script* — **`meta/llama-3.3-70b-instruct`** is *configured* in
   `tools/nvidia_build.py` / `web-ai-builder.yml`. This is a *configured* helper model, **not** proof
   of the model that created the game. The script itself was never run by CI.

> Therefore, in the Playgama submission, leave the "AI agent/model" fields blank or write
> "human-developed; not disclosed" rather than naming an agent or model. Naming one would be false.

## 3. Current ZIP issue found, and the exact fix

- **Issue:** the previously produced `merge-and-bloom.zip` had the game inside a folder
  (`merge-and-bloom/index.html`), i.e. `index.html` was **not** at the ZIP root — which portals reject.
- **Fix:** rebuilt the upload package so it contains **only** `index.html`, at the **root**:
  `release/playgama/merge-and-bloom-playgama.zip`.
- **Final ZIP structure:**
  ```
  merge-and-bloom-playgama.zip
  └── index.html        (the entire self-contained game)
  ```
- **Sizes:** ZIP = 24,307 bytes · `index.html` = 85,003 bytes (well under every portal limit).
- **SHA-256:**
  - `merge-and-bloom-playgama.zip` → `ac0cb680aa7cfbcd6fdff8768cec0a238d4c4cb0ea80c78d98c5ad14aef055bb`
  - `index.html` → `40f01981cc833da2e616299a434e5b10381ab5eacf867ecf166267545e9b82f0`
- **Checks:** index.html exists ✓ · self-contained (0 module imports, exactly 1 inline `<script>` +
  the one Bridge ad tag) ✓ · no broken imports ✓ · secret scan for api-key/secret/token/bearer/nvidia/
  password → **0 hits** ✓ · no debug or dev files in the package ✓.

## 4. Test results (actually run)

| Command | Result |
|---|---|
| `node --check js/config.js` / `model.js` / `platform.js` / `game.js` | all clean |
| `node test.mjs` | **30 passed, 0 failed** |
| `node build.mjs` | built `index.html` (self-contained, no imports) |
| `node smoke.mjs` | **SMOKE OK** — boots, draws the board, builds orders/tasks/upgrades/boosters, and completes a full Fortune-Wheel spin → **Claim** flow, with no runtime errors |

## 5. Image assets + licence

See `IMAGE_LICENSE_REPORT.md`. Summary: the three covers are **AI-generated promo artwork** made
with the **Runway** image generator on the connected workspace, then centre-cropped and resized
locally to the exact pixel sizes. The game's **in-game art is NOT AI-generated** — it is drawn
procedurally by the game code. Note: the Runway workspace is on the **free plan**, so confirm
commercial-use terms before publishing (see the licence report).

| File | Dimensions | SHA-256 |
|---|---|---|
| `assets/merge-bloom-square-800x800.png` | 800 × 800 | `66dd9a326765591057f14a80a6f8ce7698c87c9f0aac4d7778f7be4246517210` |
| `assets/merge-bloom-portrait-1080x1920.png` | 1080 × 1920 | `9b73a7dba59477d7d2fe2d7ab3b49582bba3c1cb4f413e262ce1a6e5476f13f9` |
| `assets/merge-bloom-landscape-1920x1080.png` | 1920 × 1080 | `3ad5c7c0f486e40af2c4ea872c0f1a0e9fb1ade43ede95a63908c3a5685bc181` |
| `assets/_reference-board.png` (reference only) | 1280 × 860 | — |

**Reference note (Phase 6):** no browser is available in this environment, so the covers were built
against the game's **own configuration** (`js/config.js`: meadow palette + the 12-tier ladder whose
top tier is the World Tree) rather than live screenshots. `_reference-board.png` documents that
reference.

## 6. Exact paths to every final file

```
release/playgama/merge-and-bloom-playgama.zip        <- upload this to Playgama
release/playgama/assets/merge-bloom-square-800x800.png
release/playgama/assets/merge-bloom-portrait-1080x1920.png
release/playgama/assets/merge-bloom-landscape-1920x1080.png
release/playgama/assets/_reference-board.png          <- internal reference, not an upload
release/playgama/IMAGE_LICENSE_REPORT.md
release/playgama/PLAYGAMA_METADATA_REPORT.md
release/playgama/gen_art.py                           <- reproducible art source
```

## 7. Suggested Playgama form values

- **Title:** Merge & Bloom
- **Genre / category:** Puzzle · Merge
- **Orientation:** Portrait
- **Controls:** "Tap to drop a plant. Drag a plant onto an identical plant to merge them."
- **Description:** "Drop plants, merge matching ones into bigger blooms, and grow a magical garden.
  Fulfil visitor orders, upgrade your plot, and spin the Fortune Wheel for rewards."
- **Ads:** Yes (Playgama Bridge). **IAP:** No. **Multiplayer:** No.
