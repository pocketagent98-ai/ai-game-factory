# Playgama upload form — exactly what to fill

Paste-ready values for the form in your screenshots. Nothing here is guessed.

## Why you saw the red "danger" error on the ZIP  ← read this first

You uploaded a zip whose contents were:

```
merge-and-bloom/          <-- a FOLDER at the top level
    index.html            <-- index.html is INSIDE the folder
    css/  js/  docs/  tools/  tests...
```

Playgama's form says: *"Your ZIP archive should include a single **index.html file at the root**."*
Because `index.html` sat inside `merge-and-bloom/` (and the archive also carried dev files), the
check rejected it — that is the red triangle.

**Fix:** upload **`merge-and-bloom-playgama.zip`** instead. It contains exactly one file, at the root:

```
index.html
```

Verified: 1 entry, `index.html` at the root, 24,464 bytes total, 0 secrets, `bridge.initialize()` +
`game_ready` + `bridge.storage` + rewarded/interstitial all present.

## Field-by-field

| Field | Value to enter |
|---|---|
| **Title** | `Merge & Bloom` |
| **Game engine** | **Plain JS** (the game is vanilla JS + Canvas 2D — no engine) |
| **What agent and model did you use** | See the honest note below |
| **Game Archive** | upload **`merge-and-bloom-playgama.zip`** |
| **Game description** | `Merge & Bloom is a relaxing merge-2 puzzle with an idle garden. Drop plants on a 6x6 board and drag two identical plants together to merge them into the next of 12 tiers, from a tiny Sprout up to the glowing World Tree. Fulfil visitor orders, grow Garden plots that earn coins while you are away, spend coins on upgrades, and spin the Fortune Wheel for extra rewards.` |
| **How to play** | `Tap the Seed Pod to drop a plant onto the board. Drag one plant onto an identical plant to merge them into a higher tier. Complete visitor orders to earn coins, plant your Garden for offline income, and buy upgrades to grow faster. Clear campaign levels (with a boss every 5th level) and unlock new garden themes. On mobile, tap and drag with your finger; on desktop, use the mouse.` |
| **Supported Devices** | **Desktop ✓  iOS ✓  Android ✓** (all three — the game is fully responsive) |
| **Screen Orientation** | **Portrait** |
| **Game Features** | Leave **all four unchecked** — see note below |
| **Game Languages** | `English` |
| **Cover Images → Square 1:1 (800x800)** | `merge-bloom-square-800x800.png` |
| **Cover Images → Portrait 9:16 (1080x1920)** | `merge-bloom-portrait-1080x1920.png` |
| **Cover Images → Landscape 16:9 (1920x1080)** | `merge-bloom-landscape-1920x1080.png` |
| **Other Assets** | optional — skip, or add gameplay screenshots later |
| **Distribution** | tick **"I agree that Playgama may distribute my game…"** (leave the exclude box unticked) |
| **If your game is published elsewhere** | optional — you may paste `https://pocketagent98-ai.github.io/ai-game-factory/` |

Then click **Test and Publish** (the QA Tool opens first — run it, then Submit).

### The three covers — exact specs (already produced for you)

| File | Required | Yours |
|---|---|---|
| Square 1:1 | 800 × 800 | ✅ 800 × 800 PNG |
| Portrait 9:16 | 1080 × 1920 | ✅ 1080 × 1920 PNG |
| Landscape 16:9 | 1920 × 1080 | ✅ 1920 × 1080 PNG |

Playgama accepts `.png`/`.jpg`, max **10 MB** per cover, and the pixels must be **exactly** those
sizes (a cover that is not the exact size of its slot is rejected with a 422). Yours match exactly.

### "Game Features" — why leave them unchecked

- **In-Game Purchases:** the game has none (and Playgama only allows purchases via Bridge).
- **Multiplayer:** none.
- **Social Sharing:** none.
- **Leaderboards:** the in-game leaderboard is **local/simulated only** (no server, no Bridge
  leaderboard). Ticking it would overstate the game, so leave it unticked. If you later wire the
  real Playgama Bridge leaderboard, come back and tick it.

### "What agent and model did you use" — the honest answer

The repository cannot prove which agent or model wrote the game: every commit is authored by your
own account, and the NVIDIA AI-builder workflow in the repo **has never run**. So do **not** pick a
named tool you did not use. The truthful choice is:

- Select **"Other"**, and if a text box appears, name the assistant you actually used.

If you prefer not to name it at all, **"No AI agent"** would be inaccurate given how it was made —
"Other" is the correct honest option.

## Before you click Publish — 30-second self-check

- [ ] Archive = `merge-and-bloom-playgama.zip` (one `index.html` at the root).
- [ ] All three covers uploaded, each the exact size of its slot.
- [ ] Orientation = Portrait; Devices = Desktop + iOS + Android.
- [ ] Language = English (matches the game's UI).
- [ ] Distribution box ticked.
