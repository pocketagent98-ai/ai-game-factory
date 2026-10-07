// Build a SINGLE self-contained index.html (no module imports) so the game works
// when opened directly from a file:// path, a zip, any static host, and every portal.
import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), "utf8");

// --- transform the ES modules into one classic script -----------------------
const stripExport = (s) => s.replace(/^\s*export\s+/gm, "");

let config = stripExport(read("./js/config.js"));

let model = stripExport(read("./js/model.js"))
  .replace(/^\s*import \* as C from "\.\/config\.js";\s*$/m, "")
  .replace(/\bC\./g, "");

let platform = stripExport(read("./js/platform.js"));

let game = read("./js/game.js")
  .replace(/^\s*import \* as C from "\.\/config\.js";\s*$/m, "")
  .replace(/^\s*import \{ GameModel \} from "\.\/model\.js";\s*$/m, "")
  .replace(/^\s*import \{ Platform \} from "\.\/platform\.js";\s*$/m, "")
  .replace(/\bC\./g, "");           // C.TIERS -> TIERS, C.GRID -> GRID, ...

const bundle = `(function(){\n"use strict";\n${config}\n${model}\n${platform}\n${game}\n})();`;

const css = read("./css/style.css");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<meta name="theme-color" content="#0f3d2e">
<title>Merge &amp; Bloom</title>
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

  <nav class="tabs">
    <button id="tabMerge" class="tab active">Merge</button>
    <button id="tabGarden" class="tab">Garden</button>
    <button id="tabUpgrades" class="tab">Upgrades</button>
  </nav>

  <main class="panels">
    <section id="panelMerge" class="panel">
      <div class="board-wrap"><canvas id="board"></canvas></div>
      <div id="orders" class="orders"></div>
      <button id="podBtn" class="btn pod"><span id="podLabel">Tap Seed Pod</span></button>
    </section>

    <section id="panelGarden" class="panel" style="display:none">
      <div class="panel-head">Garden <span id="gardenRate" class="dim">0 coins/hour</span></div>
      <div id="gardenGrid" class="garden"></div>
      <button id="collectBtn" class="btn primary">Collect</button>
      <p class="hint">Plants keep producing coins while you're away (offline cap applies). Tap an empty plot to plant your highest-tier item.</p>
    </section>

    <section id="panelUpgrades" class="panel" style="display:none">
      <div class="panel-head">Upgrades</div>
      <div id="upgradesList" class="upgrades"></div>
    </section>
  </main>

  <div id="toast" class="toast"></div>
  <div id="modalRoot"></div>
</div>
<script>
${bundle}
</script>
</body>
</html>
`;

fs.writeFileSync(new URL("./index.html", import.meta.url), html);
console.log("built index.html:", html.length, "bytes (self-contained, no imports)");
