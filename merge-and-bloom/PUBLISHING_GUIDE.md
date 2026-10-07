# Merge & Bloom — Where & How to Upload (short guide)

This is the one-page "what do I do now" guide. Deep detail lives in `PUBLISHING.md`.

---

## 1. Which files do you upload?

**One file matters: `index.html`.** It is fully self-contained (all CSS + JS inside it, no imports).
Everything else (`js/`, `css/`, `docs/`, tests, tools) is source you keep in the repo — the portals
only need the built game.

You upload **either**:

| Option | What to send | When |
|---|---|---|
| **A. The single file** | just `index.html` | fastest; works on every portal |
| **B. The whole folder, zipped** | `merge-and-bloom.zip` (index.html at the **root** of the zip) | when a portal asks for a `.zip` |

**Rule on every portal:** `index.html` must be at the **root** of the archive — not inside a
sub-folder. `merge-and-bloom.zip` already does this.

To rebuild the zip yourself at any time:
```
cd merge-and-bloom
node build.mjs            # regenerates the self-contained index.html
cd ..
zip -r merge-and-bloom.zip merge-and-bloom -x "*/node_modules/*"
```

---

## 2. Where to upload (in the order I recommend)

| # | Portal | Go to | What you upload | Notes |
|---|---|---|---|---|
| 1 | **Playgama** | developer.playgama.com | the **zip** | Easiest first stop — one upload, distributes to partner portals; test feedback in ~24h. Revenue tiers 70/80/90%. |
| 2 | **CrazyGames** | developer.crazygames.com | the **zip** | Start with **Basic Launch** (no SDK, no ads, 7–21 days) → if metrics are good you're invited to **Full Launch** (SDK + ads). Limits: initial ≤ 50 MB, total ≤ 250 MB, ≤ 1500 files. |
| 3 | **Poki** | developers.poki.com | the **zip** | Biggest audience. Target initial download **< 8 MB** (this build is ~85 KB — fine). Upload → content moderation → request a playtest. |
| 4 | **GameDistribution** | gamedistribution.com | the **zip** | Make account → upload → tick the **Checklist** → **Request Activation**. Needs their SDK for ads. |
| 5 | **GameMonetize** | gamemonetize.com | the **zip** | Upload the zip → wait ~2 min on first open → test the ads. |
| 6 | **Yandex Games** | yandex.com/games (console) | the **zip** | Big RU/CIS audience; unified licensing. |
| 7 | **itch.io** | itch.io | the **zip** | Great for **playtesting / portfolio**. Note: itch serves **no ads**, so it earns $0 — don't use it to monetise. |

For each, the dashboard will also ask for **metadata**: title, short description, controls,
a **cover image** (usually 512×384 or 16:9) and sometimes a short trailer. Have these ready.

---

## 3. Ads — already wired

This build **ships the Playgama Bridge SDK** (one line in `index.html`):

```html
<script id="pg-bridge" async src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>
```

- It loads **async**, so the game never hangs; if it isn't available (offline / a portal without a
  Bridge adapter) the game falls back to a safe standalone mode.
- **All ads are served by the platform.** The game never ships its own ad network (no AdMob/AdSense).
- **Ad placements** (all opt-in, each with a non-ad alternative): double an order reward, extra
  Fortune-Wheel spins, open the Reward Chest, extra Mystery-Box opens, double the daily gift,
  refresh energy, "free coins" in the shop.
- **To turn ads OFF** for a local playtest, delete that one `<script>` line and rebuild.

> Poki and CrazyGames **Full Launch** may require *their own* SDK instead of Bridge. If a portal
> rejects Bridge, swap the one script tag for that portal's SDK and keep the same calls — the game
> talks to a single `Platform` adapter (`js/platform.js`), so only that file changes.

---

## 4. Pre-upload checklist

- [ ] `node build.mjs` run — `index.html` is the latest build.
- [ ] `node test.mjs` → all tests pass.
- [ ] `node smoke.mjs` → "SMOKE OK".
- [ ] `index.html` opens and plays from a `file://` path (double-click it).
- [ ] Zip has `index.html` at its **root**.
- [ ] No dev tools / debug code shipped (only `index.html` goes up).
- [ ] Title, description, controls, cover image ready.
- [ ] Ads ON (the `pg-bridge` line is present) — or OFF if you're only playtesting.

---

## 5. Honest expectations

- **No portal has a public upload API** — you upload through each **web dashboard** by hand.
- Revenue is **ad revenue-share**, paid by the portal (typically ~30–55% to you; Poki is 100% of
  ads on your page). You need real traffic before it's meaningful — publishing on 5–7 portals is
  what compounds it.
- Poki/CrazyGames/GameDistribution **forbid** your own IAP and external ad networks. This build
  already complies.
