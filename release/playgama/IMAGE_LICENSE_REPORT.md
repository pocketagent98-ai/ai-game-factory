# IMAGE LICENSE REPORT — Merge & Bloom Playgama covers

## What was used — stated plainly

The three final covers are **AI-generated promotional artwork**, produced with the **Runway**
image generator on the connected Runway workspace, then **cropped/resized locally** to Playgama's
exact pixel sizes. The generation metadata recorded by the service was `taskType: gemini_image`
(`gemini-3-pro-image`) at 2K, aspect ratios 1:1, 9:16 and 16:9.

| Asset | Source | Method | Final size |
|---|---|---|---|
| `assets/merge-bloom-square-800x800.png` | Runway image generation (1:1, 2K) | centre-crop + LANCZOS resize | 800 × 800 |
| `assets/merge-bloom-portrait-1080x1920.png` | Runway image generation (9:16, 2K, master used as reference) | centre-crop + LANCZOS resize | 1080 × 1920 |
| `assets/merge-bloom-landscape-1920x1080.png` | Runway image generation (16:9, 2K, master used as reference) | centre-crop + LANCZOS resize | 1920 × 1080 |

The three come from **one master key art**; the portrait and landscape were generated with the
master passed as a reference image, so all three share the same tree, palette and merge motif.

## ⚠️ Commercial-use check you must do (important)

**The connected Runway workspace is on the FREE plan.** Free-plan terms often differ from paid-plan
terms for commercial use of generated media. Before you publish the game commercially on Playgama
and its partner platforms:

1. Read Runway's current Terms / content-usage terms and confirm that **outputs generated on a free
   workspace may be used commercially**, or
2. Upgrade the Runway workspace to a paid plan and regenerate (the prompts are in
   `gen_art_prompts.md`), or
3. Fall back to the earlier hand-authored vector covers if you prefer zero third-party dependencies.

This report does **not** assert Runway's licence terms on your behalf — verify them yourself.

## Playgama's AI-content rule (relevant to covers vs game art)

Playgama accepts AI-generated assets but will reject **games built entirely from generative AI**
with no human refinement, and notes such titles underperform on metrics. That rule concerns the
**game's own visuals**, not promo art:

- **The game's in-game art is NOT AI-generated.** Every sprite/tile is drawn procedurally by the
  game's own code (`js/game.js`, `js/config.js`) — original vector shapes, no generative model.
- **Only the three promo covers are AI-generated**, which is normal for store artwork.

So the submission is not a "100% AI-generated game". If you want to be maximally safe, you can also
swap in the vector covers (kept in this repo) which are fully hand-authored.

## Local tooling used for the deterministic steps

| Tool | Version | Licence | Purpose |
|---|---|---|---|
| Pillow (PIL) | 12.3.0 | HPND / MIT-CMU | centre-crop + resize to exact pixels, verification |
| Python | 3.12 | PSF | orchestration |

## Prompts used (for reproducibility / regeneration)

The exact prompts are recorded in `gen_art_prompts.md`. They contain no artist or studio names, no
brand names, no copyrighted characters, and explicitly forbid text, logos and watermarks.
