# IMAGE LICENSE REPORT — Merge & Bloom Playgama covers

## What was actually used (and what was NOT)

The three covers were **not** produced by a generative image model. They were authored as
**original vector (SVG) art inside this repository** and rasterised to the exact pixel sizes with
**CairoSVG**. This is stated plainly because the brief asked not to claim anything that did not
actually happen, and because **no text-to-image model (Qwen-Image-2512, FLUX, etc.) or ComfyUI is
available in this environment** — so they were not used.

| Asset | Author | Method | License / rights |
|---|---|---|---|
| `assets/merge-bloom-square-800x800.png` | Original work, this repo | SVG authored in-repo → CairoSVG | Original work of the repo owner (AGENTS.md rule 6: original or CC0/MIT). No third-party IP. |
| `assets/merge-bloom-portrait-1080x1920.png` | Original work, this repo | SVG authored in-repo → CairoSVG | Same as above |
| `assets/merge-bloom-landscape-1920x1080.png` | Original work, this repo | SVG authored in-repo → CairoSVG | Same as above |
| `assets/_reference-board.png` | Original work, this repo | Pillow (derived from `js/config.js`) | Same as above |

## Tooling licences

| Tool | Version (this environment) | Licence | Commercial use |
|---|---|---|---|
| CairoSVG | 2.9.1 | LGPL-3.0 | Yes (library use; no linking restrictions for output PNGs) |
| Pillow (PIL) | 12.3.0 | HPND / MIT-CMU | Yes |
| Python | 3.12 | PSF | Yes |

The artwork itself is hand-authored vector geometry (circles, paths, gradients) written in
`gen_art.py`; the tools only rasterise it, so the output images carry **no** model or font licence
obligations. **No fonts were embedded** and **no text is present** in the covers.

## Palette provenance

Colours are taken from the game's own configuration (`js/config.js`), so the art matches the game:
meadow theme background `#0f3d2e` / `#124b39`, panel `#173e33`, accent `#7ef0b0`, gold `#ffd54f`,
plus tier colours (pink `#f06292`, purple `#ba68c8`, orange `#ff7043`, teal `#26a69a` — the World
Tree, tier 12).

## If you later want photoreal/generative key art

The recommended path in the brief was **Qwen-Image-2512** (text-to-image) and
**Qwen-Image-Edit-2511** (editing) via **ComfyUI**. Those were **not run here**. Before using them
for a commercial cover you must verify, yourself, each model's licence and commercial-use terms
from its official repository — this report does **not** assert their licence status, because it
could not be verified in this environment.

> Status of the recommended models: **LICENCE NOT VERIFIED IN THIS ENVIRONMENT.**
