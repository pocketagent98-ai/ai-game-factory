# GAME_BIBLE — Merge & Bloom

## Design pillars
1. **Instant play** — no splash, no menu, first merge within ~15 s.
2. **Constant satisfying action** — every merge pops (particles + rising chime).
3. **Web-first loops** — ~3-minute core loop; 5–15 minute sessions; leaving is never punished.
4. **Polite ads** — opt-in extras + breaks only; playable with an ad-blocker and without ever watching an ad.
5. **Return reason** — the Garden keeps producing while away.
6. **Original** — a merge + idle-garden hybrid with a plant theme (not a fruit/2048 clone).

## Loops
- **Core:** tap pod → merge → order → coins → bloom.
- **Meta:** coins → garden upgrades; garden → passive coins; daily gift/goal.
- **Long-term:** all 12 plots, Golden Pod, World Tree, cosmetic themes.

## Systems detail
- **Merge:** drag a plant onto an identical plant → next tier. Only identical tiers merge. Free to merge; energy is spent producing.
- **Energy:** soft pacing only. At 0, offer rewarded +25, or 100 coins, or wait. Never block.
- **Orders:** 4 slots, difficulty-spread so a player never has only long orders left (prevents the mid-game stall).
- **Garden:** the “home” between sessions; production scales with planted tier; offline accrual uses epoch time with clock-cheat guards (negative→0, sub-minute→0, cap applied).
- **Retention:** 7-day looping daily gift (soft reset), daily goal, comeback = offline harvest.

## Economy (starting values — tune)
- Merge chain: item at tier T = 2^(T−1) base items (World Tree = 2,048).
- Order reward = sum(item order values) × 1.5. Merge itself grants the item's coin value.
- Energy/day ≈ 2,160 (regen) + 75 (rewarded) ≈ 2,235.
- Garden: `10 × 2^(tier−2)` coins/hour per plot; offline efficiency 80%.
- Upgrades: `base × 1.55^(level−1)`.

## Ads (platform-served)
- **Rewarded (opt-in, daily-capped):** +25 energy (×3), double offline harvest (×1), clear cooldown (×2), Lucky Bloom (×2), refresh orders (×1). Each has a coin alternative except double-harvest.
- **Interstitials:** at breaks only (order set complete, board-rest, return to garden, session end). Platform paces them; never implement your own timer.

## Tone
Cozy, wholesome, all-ages (PEGI 12). Bright and calming. No violence, gambling, or adult themes.
