# GAME_PRD — Merge & Bloom

**Platform:** Browser / Mobile Web (HTML5) · **Orientation:** portrait-first (9:16) · **Engine:** vanilla JS + Canvas (ES modules, no build step)

## One-liner
A portrait merge-2 puzzle where merging plants grows a living garden that keeps producing while you're away.

## Core loop
Tap Seed Pod (costs 1 energy) → drag identical plants together to merge up a **12-tier chain** → fulfil **visitor orders** for coins → every merge fills the **Bloom Meter** → unlock **Garden plots** → spend coins on **upgrades**.

## Systems
1. **Board** — 6×6 grid; drag-and-drop merge; no physics; no auto-merge; one consume per tile per pass.
2. **Seed Pod (producer)** — charge 30 taps → 60 s cooldown; pod levels raise the drop table (L1→L4).
3. **Energy** — cap 50 (→100 via upgrades); +1 per 40 s, pauses at cap; soft pacing, never a hard wall.
4. **Orders** — 4 concurrent, difficulty-spread (easy / medium ×2 / hard); reward = item values × 1.5.
5. **Bloom Meter** — merges → unlocks plots / levels.
6. **Garden (idle meta)** — 12 plots; planted tier ≥2 produces `10 × 2^(tier−2)` coins/hour; offline capped (4 h → 24 h); collect on return, optional rewarded ×2.
7. **Upgrades** — energy cap, regen, seed pod, offline cap, auto-producer; cost `base × 1.55^(level−1)`.
8. **Boosters** — Shovel, Mixer, Lucky Bloom, Time Bloom, Golden Tap, Double Harvest.
9. **Monetisation** — rewarded video (opt-in, with coin alternatives) + interstitials at breaks (platform-paced).

## Merge chain (12 tiers)
Sprout → Seedling → Bud → Bloom → Berry Bush → Fruit Tree → Glow Vine → Crystal Bloom → Golden Tree → Sunflower Crown → Aurora Tree → **World Tree**.

## Success metrics
- Conversion-to-play ≥65%; average playtime ≥5 min; first merge <15 s; load <3 s; build ≤6 MB.

## Out of scope (v1)
Multiplayer, IAP UI (hidden at launch), leaderboards, cloud accounts, 3D.
