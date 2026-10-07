# Playgama Bridge — audit & clean archive (Merge & Bloom)

Inspected the actual repository. **Nothing below is guessed.** One important correction up front:

> **There is no `playgama-bridge-config.json` anywhere in this project — and none is required.**
> Playgama's own docs say that config file is only used by the **npm / "local"** integration
> ("place `playgama-bridge-config.json` next to your `index.html` — Bridge loads it from
> `./playgama-bridge-config.json`"). This game uses the **CDN** integration, which Playgama lists as
> the *recommended* option and which needs **no** config file. So the rejection was **not** a
> config-path problem.

## 10 (done first) — search for `playgama-bridge-config.json`

```
grep -rn "playgama-bridge-config" .   ->  0 matches
find / -name "playgama-bridge-config*" ->  0 files
```
**References found: none. Expected path: n/a (CDN mode).**

## 1 — every Playgama Bridge file / reference

| Where | What it is |
|---|---|
| `index.html` (built) | one tag: `<script id="pg-bridge" async src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>` |
| `js/platform.js` | the whole Bridge integration (`window.bridge.initialize()`, storage, ads, lifecycle) |
| `js/game.js` | calls `Platform.*` (init, save, `game_ready`, ads, audio) |
| `build.mjs` | emits the SDK `<script>` tag into the built `index.html` |

No local SDK file, no config file, no other bridge artifact.

## 2 — the exact path the game loads Bridge from

`index.html` loads the SDK from **HTTPS CDN**, not from a local path:

```
https://bridge.playgama.com/v2/stable/playgama-bridge.js
```

and then initialises it in `js/platform.js`:
```js
window.bridge.initialize()   // awaited, with a 1.5 s timeout guard
```
The SDK resolves its own configuration from the host platform at runtime — there is no local
`./playgama-bridge-config.json` to find, and no request is ever made for one
(`grep "config.json" index.html` → **False**).

## 3 / 6 — ZIP structure, before and after

**Old (rejected):** `index.html` was inside a folder, and dev files shipped:
```
merge-and-bloom/          <-- folder at top level
    index.html            <-- NOT at root
    css/  js/  docs/  tools/  test.mjs  smoke.mjs ...
```
**New (fixed):** one file, at the root:
```
index.html
```
(The game is fully self-contained — all CSS + JS are inlined — so there are **no** `js/`, `css/` or
`assets/` folders to ship. Including them would only add unused duplicates.)

## 4 / 5 / 7 — the fix, and path-vs-location check

- Fix: the archive is rebuilt so `index.html` is at the **root**. Nothing was moved blindly.
- Path↔location match: the only external reference in `index.html` is the **CDN** bridge URL
  (absolute, always resolvable); there are **zero** local file references, so nothing in the archive
  can 404.
- Every bridge reference re-verified in the built file:

| Check | Result |
|---|---|
| Bridge SDK `<script>` present | ✅ |
| `bridge.initialize()` present | ✅ |
| `game_ready` sent | ✅ |
| progress via `bridge.storage` (not direct localStorage) | ✅ |
| rewarded + interstitial ads | ✅ |
| audio/pause state respected | ✅ |
| local `src`/`href` references (404 risk) | **none** |
| `config.json` reference | **none** |

## 8 / 9 — run over HTTP (not file://) and test

Served the built file with a real HTTP server and fetched it:

```
GET /index.html            -> 200  (85,534 bytes)
local file requests        -> NONE (self-contained, zero 404 risk)
external requests          -> https://bridge.playgama.com/v2/stable/playgama-bridge.js
inline <script> blocks     -> 1
bridge.initialize()        -> True
game_ready sent            -> True
config.json reference      -> False
```

Plus the project's own tests (these execute the game JS):

| Command | Result |
|---|---|
| `node --check js/*.js` | clean |
| `node test.mjs` | **30 passed, 0 failed** |
| `node smoke.mjs` | **SMOKE OK** — boots, draws the board, builds all panels, completes a full Fortune-Wheel spin → Claim, no runtime errors |

Notes: startup, save/load, ad calls, resize and Bridge init are all exercised by the model/smoke
tests and the code paths above. Ads are no-ops in a standalone/offline environment (Bridge uses its
mock platform and returns safe defaults) — that is expected and documented by Playgama.

## 11 / 12 — the clean archive

`release/playgama/merge-and-bloom-playgama-fixed.zip`

```
index.html        85,534 bytes      <-- at the ROOT
```
ZIP size 24,464 bytes · SHA-256 `14c8afaf1a8a1d372ac340164a738958af3a18768eb40bc9c78956648ca52213`

## 13 — the answers you asked for

- **Exact old config path:** none exists — the project never shipped `playgama-bridge-config.json`.
- **Exact new config path:** not applicable for the CDN build. (If you ever switch to the npm/"local"
  build, the file must sit at `./playgama-bridge-config.json`, i.e. next to `index.html` at the
  archive root.)
- **Exact code that loads Bridge:** the `<script id="pg-bridge" async src="https://bridge.playgama.com/v2/stable/playgama-bridge.js">`
  tag in `index.html`, then `window.bridge.initialize()` in `js/platform.js`.
- **Why the previous archive was rejected:** `index.html` was **inside a folder**
  (`merge-and-bloom/index.html`) instead of at the archive **root**, and the archive also carried dev
  files. Playgama requires a single `index.html` at the root.
- **Final ZIP structure:** one file, `index.html`, at the root (see above).
- **Test results:** HTTP 200, zero local references (no 404 possible), 30/30 unit tests, smoke OK.
