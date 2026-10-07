// Merge & Bloom — view / controller (vanilla, no build step)
import * as C from "./config.js";
import { GameModel } from "./model.js";
import { Platform } from "./platform.js";

const $ = (id) => document.getElementById(id);
const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(2) + "M" : n >= 10000 ? (n / 1000).toFixed(1) + "k" : "" + n;

const app = {
  model: new GameModel(),
  canvas: null, ctx: null,
  dpr: 1, cell: 0, pad: 0, boardPx: 0,
  drag: null,               // {from, x, y}
  tab: "merge",
  autoTimer: 0,
};

// ---------------------------------------------------------------- bootstrap
async function init() {
  await Platform.init();
  const env = Platform.getSave();
  if (env) app.model = GameModel.deserialize(env);

  app.canvas = $("board");
  app.ctx = app.canvas.getContext("2d");

  window.addEventListener("resize", resize);
  resize();

  // input
  app.canvas.addEventListener("pointerdown", onDown);
  app.canvas.addEventListener("pointermove", onMove);
  app.canvas.addEventListener("pointerup", onUp);
  app.canvas.addEventListener("pointercancel", () => { app.drag = null; render(); });

  // buttons
  $("podBtn").addEventListener("click", doTapPod);
  $("tabMerge").addEventListener("click", () => setTab("merge"));
  $("tabGarden").addEventListener("click", () => setTab("garden"));
  $("tabUpgrades").addEventListener("click", () => setTab("upgrades"));
  $("collectBtn").addEventListener("click", () => doCollect(1));
  $("settingsBtn").addEventListener("click", showSettings);

  // welcome-back (offline earnings)
  const pending = app.model.pendingOffline();
  if (pending > 0) showWelcomeBack(pending);

  buildOrders(); buildGarden(); buildUpgrades();
  setTab("merge");
  requestAnimationFrame(loop);
  Platform.sendMessage("game_ready");
}

// ---------------------------------------------------------------- layout
function resize() {
  const wrap = app.canvas.parentElement;
  const size = Math.min(wrap.clientWidth, wrap.clientHeight);
  app.dpr = Math.min(window.devicePixelRatio || 1, 2);
  app.canvas.style.width = size + "px";
  app.canvas.style.height = size + "px";
  app.canvas.width = Math.round(size * app.dpr);
  app.canvas.height = Math.round(size * app.dpr);
  app.pad = size * 0.03;
  app.boardPx = size - app.pad * 2;
  app.cell = app.boardPx / C.GRID;
  render();
}

function cellAt(x, y) {
  const col = Math.floor((x - app.pad) / app.cell);
  const row = Math.floor((y - app.pad) / app.cell);
  if (col < 0 || row < 0 || col >= C.GRID || row >= C.GRID) return -1;
  return row * C.GRID + col;
}
function cellCenter(idx) {
  const row = Math.floor(idx / C.GRID), col = idx % C.GRID;
  return { x: app.pad + col * app.cell + app.cell / 2, y: app.pad + row * app.cell + app.cell / 2 };
}

// ---------------------------------------------------------------- render
function render() {
  const ctx = app.ctx, S = app.canvas.width;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, S, S);
  ctx.scale(app.dpr, app.dpr);

  const g = app.model.grid;
  const r = app.cell * 0.16;

  for (let i = 0; i < g.length; i++) {
    const c = cellCenter(i);
    const x = c.x - app.cell / 2 + app.cell * 0.06;
    const y = c.y - app.cell / 2 + app.cell * 0.06;
    const s = app.cell * 0.88;
    // cell background
    roundRect(ctx, x, y, s, s, r * 0.8);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fill();

    if (g[i] > 0) {
      const tier = C.TIERS[g[i] - 1];
      roundRect(ctx, x, y, s, s, r);
      ctx.fillStyle = tier.color;
      ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.03);
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();
      ctx.font = `${s * 0.5}px system-ui, sans-serif`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(tier.glyph, c.x, c.y - s * 0.04);
      ctx.font = `600 ${s * 0.2}px system-ui, sans-serif`;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText("T" + g[i], c.x, c.y + s * 0.32);
    }
  }

  // drag ghost
  if (app.drag && app.drag.tier) {
    const tier = C.TIERS[app.drag.tier - 1];
    ctx.globalAlpha = 0.85;
    ctx.font = `${app.cell * 0.5}px system-ui, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(tier.glyph, app.drag.x, app.drag.y);
    ctx.globalAlpha = 1;
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ---------------------------------------------------------------- input
function onDown(e) {
  const rect = app.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const idx = cellAt(x, y);
  if (idx < 0 || app.model.grid[idx] === 0) return;
  app.drag = { from: idx, x, y, tier: app.model.grid[idx] };
  render();
}
function onMove(e) {
  if (!app.drag) return;
  const rect = app.canvas.getBoundingClientRect();
  app.drag.x = e.clientX - rect.left; app.drag.y = e.clientY - rect.top;
  render();
}
function onUp(e) {
  if (!app.drag) return;
  const rect = app.canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const to = cellAt(x, y);
  const from = app.drag.from;
  const tier = app.drag.tier;
  app.drag = null;

  if (to < 0 || to === from) { render(); return; }
  if (app.model.canMerge(from, to)) {
    const res = app.model.tryMerge(from, to);
    if (res.ok) { toast("+" + res.coins + " \u{1F4B0}"); refresh(); }
  } else if (app.model.grid[to] === 0) {
    // move to an empty cell
    app.model.grid[to] = tier; app.model.grid[from] = 0; refresh();
  } else {
    render();
  }
  checkBoardRest();
}

function doTapPod() {
  const r = app.model.tapPod();
  if (!r.ok) {
    if (r.reason === "energy") toast("Out of energy \u2014 wait or use a boost");
    else if (r.reason === "cooldown") toast("Seed Pod is recharging\u2026");
    else if (r.reason === "full") { toast("Board is full"); checkBoardRest(); }
    refresh();
    return;
  }
  refresh();
}

// ---------------------------------------------------------------- loop
function loop(ts) {
  const now = Date.now();
  app.model.regenEnergy(now);

  // auto-producer
  if (app.model.upgrades.autoProducer > 0) {
    app.autoTimer += 1;
    const interval = Math.max(10, 30 - app.model.upgrades.autoProducer * 4);
    if (app.autoTimer >= interval * 60) {
      app.autoTimer = 0;
      const cells = app.model.emptyCells();
      if (cells.length) { app.model.grid[cells[Math.floor(Math.random() * cells.length)]] = 1; refresh(); }
    }
  }
  updateHUD();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- HUD / tabs
function updateHUD() {
  const m = app.model;
  $("coins").textContent = fmt(m.coins);
  $("energy").textContent = m.energy;
  $("energyCap").textContent = m.energyCap;
  $("level").textContent = m.level;
  const bloomPct = Math.min(100, (m.bloom / (m.level * C.BLOOM_THRESHOLD)) * 100);
  $("bloomFill").style.width = bloomPct + "%";
  $("plotsCount").textContent = m.plotsUnlocked;
  // pod state
  const ready = m.podReady(Date.now());
  const podBtn = $("podBtn");
  podBtn.disabled = m.energy < 1 || !ready;
  if (ready) { $("podLabel").textContent = "Tap Seed Pod  (" + m.podCharge + ")"; }
  else { const s = Math.max(0, Math.ceil((m.podCooldownEnds - Date.now()) / 1000)); $("podLabel").textContent = "Recharging\u2026 " + s + "s"; }
}

function refresh() { buildOrders(); buildGarden(); buildUpgrades(); updateHUD(); render(); }

function setTab(tab) {
  app.tab = tab;
  for (const t of ["merge", "garden", "upgrades"]) {
    $("panel" + cap(t)).style.display = t === tab ? "" : "none";
    $("tab" + cap(t)).classList.toggle("active", t === tab);
  }
  if (tab === "garden") buildGarden();
  if (tab === "upgrades") buildUpgrades();
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- orders
function buildOrders() {
  const el = $("orders"); el.innerHTML = "";
  app.model.orders.forEach((o, i) => {
    const can = app.model.canDeliver(i);
    const div = document.createElement("div");
    div.className = "order" + (can ? " ready" : "");
    div.innerHTML =
      `<div class="order-items">${o.items.map(it =>
        `<span class="chip">${C.TIERS[it.tier - 1].glyph} <b>${it.qty}</b></span>`).join("")}</div>
       <button class="btn deliver" ${can ? "" : "disabled"}>${can ? "Deliver" : "\u2026"} +${o.reward}</button>`;
    div.querySelector(".deliver").addEventListener("click", () => {
      const r = app.model.deliver(i);
      if (r.ok) { toast("Order done! +" + r.reward + " \u{1F4B0}"); Platform.showInterstitial(); refresh(); checkBoardRest(); }
    });
    el.appendChild(div);
  });
}

// ---------------------------------------------------------------- garden
function buildGarden() {
  const el = $("gardenGrid"); el.innerHTML = "";
  const unlocked = app.model.plotsUnlocked;
  for (let i = 0; i < 12; i++) {
    const tier = app.model.plots[i];
    const d = document.createElement("div");
    d.className = "plot" + (i >= unlocked ? " locked" : "") + (tier ? " planted" : "");
    if (i >= unlocked) d.innerHTML = "\u{1F512}";
    else if (tier) d.innerHTML = `<span class="glyph">${C.TIERS[tier - 1].glyph}</span><span class="rate">${fmt(C.gardenRate(tier))}/h</span>`;
    else d.innerHTML = "<span class=\"plus\">+</span>";
    d.addEventListener("click", () => onPlot(i));
    el.appendChild(d);
  }
  $("gardenRate").textContent = fmt(app.model.gardenRatePerHour()) + " coins/hour";
  $("collectBtn").disabled = app.model.pendingOffline() <= 0;
}
function onPlot(i) {
  if (i >= app.model.plotsUnlocked) { toast("Locked \u2014 keep merging to unlock"); return; }
  if (app.model.plots[i] !== 0) { toast("Already planted"); return; }
  // plant the highest-tier item currently on the board (tier >= 2)
  let best = -1, bestTier = 1;
  app.model.grid.forEach((t, idx) => { if (t >= 2 && t > bestTier) { bestTier = t; best = idx; } });
  if (best < 0) { toast("Merge up to tier 2+ to plant"); return; }
  app.model.grid[best] = 0;
  const r = app.model.plant(i, bestTier);
  if (r.ok) toast("Planted " + C.TIERS[bestTier - 1].name); else { toast("Can't plant"); }
  refresh();
}
function doCollect(mult) {
  const amt = app.model.collectGarden(Date.now(), mult);
  if (amt > 0) toast("+" + fmt(amt) + " \u{1F4B0}");
  refresh();
}

// ---------------------------------------------------------------- upgrades
function buildUpgrades() {
  const el = $("upgradesList"); el.innerHTML = "";
  const defs = [
    ["energyCap", "Energy capacity", "+25 max energy"],
    ["regen", "Energy regen", "faster refill"],
    ["podLevel", "Seed Pod", "better drops"],
    ["offlineCap", "Garden offline cap", "+4h offline"],
    ["autoProducer", "Auto-Producer", "free plants over time"],
  ];
  for (const [kind, title, sub] of defs) {
    const cost = app.model.upgradeCost(kind);
    const maxed = kind === "podLevel" && app.model.upgrades.podLevel >= C.POD_MAX_LEVEL;
    const d = document.createElement("div");
    d.className = "upg";
    d.innerHTML = `<div><div class="upg-title">${title}</div><div class="upg-sub">${sub}</div></div>
      <button class="btn buy" ${maxed || app.model.coins < cost ? "disabled" : ""}>${maxed ? "MAX" : fmt(cost) + " \u{1F4B0}"}</button>`;
    d.querySelector(".buy").addEventListener("click", () => {
      const r = app.model.buyUpgrade(kind);
      if (r.ok) { toast(title + " upgraded"); refresh(); } else toast("Not enough coins");
    });
    el.appendChild(d);
  }
}

// ---------------------------------------------------------------- board-rest
function hasMerge() {
  const seen = {};
  for (const t of app.model.grid) { if (!t || t >= C.MAX_TIER) continue; if (seen[t]) return true; seen[t] = true; }
  return false;
}
function checkBoardRest() {
  const m = app.model;
  if (!m.isFull()) return;
  if (hasMerge()) return;
  showRestPanel();
}
function showRestPanel() {
  modal("The garden is resting", "No merges left. Clear space to keep going.", [
    { label: "Shovel \u2013 remove one (60 \u{1F4B0})", primary: true, onClick: () => {
        let low = -1, lt = 99; m_gridForEach((t, i) => { if (t && t < lt) { lt = t; low = i; } });
        if (low >= 0) app.model.grid[low] = 0; refresh(); closeModal();
      } },
    { label: "Mixer \u2013 shuffle the board", onClick: () => {
        const items = app.model.grid.filter(t => t); shuffle(items);
        app.model.grid = new Array(36).fill(0);
        for (let i = 0; i < items.length; i++) app.model.grid[i] = items[i];
        refresh(); closeModal();
      } },
    { label: "Watch a boost (rewarded)", onClick: async () => {
        const ok = await Platform.showRewarded();
        if (ok) { app.model.grantRewarded("luckyBloom"); refresh(); }
        closeModal();
      } },
    { label: "Later", onClick: closeModal },
  ]);
}
const m_gridForEach = (fn) => app.model.grid.forEach((t, i) => fn(t, i));
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } }

// ---------------------------------------------------------------- welcome back
function showWelcomeBack(pending) {
  modal("Welcome back \u{1F331}", "Your garden grew " + fmt(pending) + " coins while you were away.", [
    { label: "Collect", primary: true, onClick: () => { doCollect(1); closeModal(); } },
    { label: "Double it (rewarded)", onClick: async () => { const ok = await Platform.showRewarded(); doCollect(ok ? 2 : 1); closeModal(); } },
  ]);
}

// ---------------------------------------------------------------- modals / toast
function modal(title, body, buttons) {
  closeModal();
  const root = $("modalRoot");
  const m = document.createElement("div");
  m.className = "modal-back";
  m.innerHTML = `<div class="modal"><h3>${title}</h3><p>${body}</p><div class="modal-btns"></div></div>`;
  const btns = m.querySelector(".modal-btns");
  buttons.forEach(b => {
    const btn = document.createElement("button");
    btn.className = "btn " + (b.primary ? "primary" : "");
    btn.textContent = b.label;
    btn.addEventListener("click", b.onClick);
    btns.appendChild(btn);
  });
  root.appendChild(m);
}
function closeModal() { $("modalRoot").innerHTML = ""; }
let toastTimer = null;
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1400);
}
function showSettings() {
  modal("Settings", "Merge & Bloom \u2014 v1.0", [
    { label: "Reset progress", onClick: () => { if (confirm("Erase all progress?")) { localStorage.removeItem("mb_save"); location.reload(); } } },
    { label: "Close", primary: true, onClick: closeModal },
  ]);
}

// ---------------------------------------------------------------- persistence
setInterval(() => Platform.setSave(app.model.serialize()), 15000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") Platform.setSave(app.model.serialize());
});

window.addEventListener("load", init);
