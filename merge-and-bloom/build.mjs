// Build a SINGLE self-contained index.html (no module imports) so the game works
// when opened directly from a file:// path, a zip, any static host, and every portal.
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");
const stripExport = (s) => s.replace(/^\s*export\s+/gm, "");

const config = stripExport(read("./js/config.js"));
const model = stripExport(read("./js/model.js"))
  .replace(/^\s*import \* as C from "\.\/config\.js";\s*$/m, "").replace(/\bC\./g, "");
const platform = stripExport(read("./js/platform.js"));
const game = read("./js/game.js")
  .replace(/^\s*import \* as C from "\.\/config\.js";\s*$/m, "")
  .replace(/^\s*import \{ GameModel \} from "\.\/model\.js";\s*$/m, "")
  .replace(/^\s*import \{ Platform \} from "\.\/platform\.js";\s*$/m, "")
  .replace(/\bC\./g, "");

const bundle = `(function(){\n"use strict";\n${config}\n${model}\n${platform}\n${game}\n})();`;
// Guard: a literal "</script" anywhere in the JS would terminate the inline script early.
const safeBundle = bundle.replace(/<\/script/gi, "<\\/script");
const css = read("./css/style.css");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0f3d2e">
<title>Merge &amp; Bloom</title>
<!-- ADS ARE OFF for local playtesting so the game always boots instantly and works offline.
     When you are ready to publish and earn, add the Playgama Bridge SDK here (or use the
     portal's native SDK). The game auto-detects window.bridge and uses it; without it,
     ads are simulated and saves use localStorage.  See PUBLISHING.md for the exact tag. -->
<style>
${css}
</style>
</head>
<body>
<div id="app">
  <header class="topbar">
    <div class="brand">\u{1F33F} Merge &amp; Bloom</div>
    <button id="settingsBtn" class="icon-btn" aria-label="Settings">\u2699\uFE0F</button>
  </header>

  <div class="hud">
    <div class="stat"><span class="k">\u{1F4B0}</span><span id="coins">0</span></div>
    <div class="stat"><span class="k">\u26A1</span><span id="energy">50</span><span class="dim">/<span id="energyCap">50</span></span></div>
    <div class="stat"><span class="k">\u2B50</span><span id="level">1</span></div>
  </div>

  <div class="bloom">
    <div class="bloom-label">Bloom Meter \u00B7 <span id="plotsCount">2</span> plots</div>
    <div class="bloom-bar"><div id="bloomFill" class="bloom-fill"></div></div>
  </div>

  <div id="comboWrap" class="combo-wrap" style="visibility:hidden">
    <span id="comboVal" class="combo-val">COMBO \u00D71</span>
    <div class="combo-bar"><div id="comboFill" class="combo-fill"></div></div>
  </div>
  <div id="frenzyBanner" class="frenzy" style="display:none">\u{1F525} MERGE FRENZY \u00B7 <span id="frenzyTime">15s</span></div>
  <div id="rushBanner" class="rush" style="display:none">\u26A1 RUSH HOUR \u00B7 double coins \u00B7 <span id="rushTime">45s</span></div>

  <nav class="tabs">
    <button id="tabMerge" class="tab active">Merge</button>
    <button id="tabGarden" class="tab">Garden</button>
    <button id="tabLevels" class="tab">Levels</button>
    <button id="tabTasks" class="tab">Tasks</button>
    <button id="tabUpgrades" class="tab">Upgrades</button>
  </nav>

  <main class="panels">
    <section id="panelMerge" class="panel">
      <div class="board-wrap"><canvas id="board"></canvas></div>
      <div id="orders" class="orders"></div>
      <div class="actionbar">
        <div id="boosters" class="boosters"></div>
        <button id="podBtn" class="btn pod"><span id="podLabel">Tap Seed Pod</span></button>
      </div>
    </section>

    <section id="panelGarden" class="panel" style="display:none">
      <div class="panel-head">Garden <span id="gardenRate" class="dim">0 coins/hour</span></div>
      <div id="gardenGrid" class="garden"></div>
      <button id="collectBtn" class="btn primary">Collect</button>
      <p class="hint">Plants keep producing coins while you're away (offline cap applies). Tap an empty plot to plant your highest-tier item.</p>
    </section>

    <section id="panelLevels" class="panel" style="display:none">
      <div id="campaignCard" class="upg campaign"></div>
      <div class="panel-head">Leaderboard</div>
      <div id="leaderboardList" class="lb"></div>
      <div class="panel-head">Garden themes</div>
      <div id="themesGrid" class="themes"></div>
    </section>

    <section id="panelTasks" class="panel" style="display:none">
      <div class="panel-head">Daily missions</div>
      <div id="missionsList" class="upgrades"></div>
      <p class="hint">Missions refresh every day. Claim them for bonus coins.</p>
    </section>

    <section id="panelUpgrades" class="panel" style="display:none">
      <div class="panel-head">Upgrades</div>
      <div id="upgradesList" class="upgrades"></div>
    </section>
  </main>

  <button id="chestBtn" class="chest-btn" aria-label="Reward chest">\u{1F381}</button>
  <button id="giftBtn" class="chest-btn gift" aria-label="Daily gift">\u{1F381}\u2728</button>
  <button id="wheelBtn" class="chest-btn wheel" aria-label="Fortune wheel">\u{1F3A1}</button>
  <div id="toast" class="toast"></div>
  <div id="modalRoot"></div>
</div>
<script>
${safeBundle}
</script>
</body>
</html>
`;
fs.writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("built index.html:", html.length, "bytes (self-contained, no imports)");
