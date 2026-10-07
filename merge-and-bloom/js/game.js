// Merge & Bloom — view / controller (vanilla, no build step)
import * as C from "./config.js";
import { GameModel } from "./model.js";
import { Platform } from "./platform.js";

const $ = (id) => document.getElementById(id);
const fmt = (n) => n >= 1000000 ? (n / 1000000).toFixed(2) + "M" : n >= 10000 ? (n / 1000).toFixed(1) + "k" : "" + n;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const app = {
  model: new GameModel(),
  canvas: null, ctx: null, dpr: 1, cell: 0, pad: 0,
  drag: null, tab: "merge",
  particles: [], floats: [], shakeUntil: 0, shakeMag: 0,
};

// ---------------------------------------------------------------- audio
let actx = null;
function blip(freq, dur = 0.09, type = "sine", gain = 0.05) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!actx) actx = new AC();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; o.connect(g); g.connect(actx.destination);
    g.gain.value = gain;
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.stop(actx.currentTime + dur);
  } catch (e) { /* audio blocked until first tap */ }
}

// ---------------------------------------------------------------- bootstrap
async function init() {
  await Platform.init();
  const env = Platform.getSave();
  if (env) app.model = GameModel.deserialize(env);

  app.canvas = $("board");
  app.ctx = app.canvas.getContext("2d");

  window.addEventListener("resize", resize);
  resize();

  app.canvas.addEventListener("pointerdown", onDown);
  app.canvas.addEventListener("pointermove", onMove);
  app.canvas.addEventListener("pointerup", onUp);
  app.canvas.addEventListener("pointercancel", () => { app.drag = null; render(); });

  $("podBtn").addEventListener("click", doTapPod);
  $("tabMerge").addEventListener("click", () => setTab("merge"));
  $("tabGarden").addEventListener("click", () => setTab("garden"));
  $("tabTasks").addEventListener("click", () => setTab("tasks"));
  $("tabUpgrades").addEventListener("click", () => setTab("upgrades"));
  $("collectBtn").addEventListener("click", () => doCollect(1));
  $("settingsBtn").addEventListener("click", showSettings);
  $("chestBtn").addEventListener("click", onChest);

  const pending = app.model.pendingOffline();
  if (pending > 0) showWelcomeBack(pending);

  buildOrders(); buildGarden(); buildTasks(); buildUpgrades(); buildBoosters();
  setTab("merge");
  requestAnimationFrame(loop);
  Platform.sendMessage("game_ready");
}

// ---------------------------------------------------------------- layout
function resize() {
  const wrap = app.canvas.parentElement;
  let w = wrap.clientWidth, h = wrap.clientHeight;
  if (!w || !h) { w = window.innerWidth || 360; h = Math.round((window.innerHeight || 640) * 0.5); }
  const size = Math.max(180, Math.min(w, h));
  app.dpr = Math.min(window.devicePixelRatio || 1, 2);
  app.canvas.style.width = size + "px";
  app.canvas.style.height = size + "px";
  app.canvas.width = Math.round(size * app.dpr);
  app.canvas.height = Math.round(size * app.dpr);
  app.pad = size * 0.03;
  app.cell = (size - app.pad * 2) / C.GRID;
  render();
}
function cellAt(x, y) {
  const col = Math.floor((x - app.pad) / app.cell), row = Math.floor((y - app.pad) / app.cell);
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
  let ox = 0, oy = 0;
  if (Date.now() < app.shakeUntil) { const m = app.shakeMag; ox = (Math.random() - 0.5) * m; oy = (Math.random() - 0.5) * m; }
  ctx.scale(app.dpr, app.dpr);
  ctx.translate(ox, oy);

  const g = app.model.grid, r = app.cell * 0.16;
  for (let i = 0; i < g.length; i++) {
    const c = cellCenter(i);
    const x = c.x - app.cell / 2 + app.cell * 0.06, y = c.y - app.cell / 2 + app.cell * 0.06, s = app.cell * 0.88;
    roundRect(ctx, x, y, s, s, r * 0.8);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
    if (g[i] > 0) {
      const t = C.TIERS[g[i] - 1];
      roundRect(ctx, x, y, s, s, r);
      ctx.fillStyle = t.color; ctx.fill();
      ctx.lineWidth = Math.max(1, s * 0.03); ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.stroke();
      ctx.font = `${s * 0.5}px system-ui, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(t.glyph, c.x, c.y - s * 0.04);
      ctx.font = `600 ${s * 0.2}px system-ui, sans-serif`; ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText("T" + g[i], c.x, c.y + s * 0.32);
    }
  }

  // particles
  for (const p of app.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // floating text
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  for (const f of app.floats) {
    ctx.globalAlpha = Math.max(0, f.life / f.max);
    ctx.font = `800 ${f.size}px system-ui, sans-serif`;
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;

  // drag ghost
  if (app.drag && app.drag.tier) {
    ctx.globalAlpha = 0.85;
    ctx.font = `${app.cell * 0.5}px system-ui, sans-serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(C.TIERS[app.drag.tier - 1].glyph, app.drag.x, app.drag.y);
    ctx.globalAlpha = 1;
  }
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function burst(idx, tier) {
  const c = cellCenter(idx), col = C.TIERS[Math.min(tier, C.MAX_TIER) - 1].color;
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2, sp = 1 + Math.random() * 3;
    app.particles.push({ x: c.x, y: c.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1, life: 32, max: 32, size: 2 + Math.random() * 3, color: col });
  }
}
function floatText(idx, text, color) {
  const c = cellCenter(idx);
  app.floats.push({ x: c.x, y: c.y - app.cell * 0.2, text, color, life: 46, max: 46, size: Math.round(app.cell * 0.26) });
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
  app.drag.x = e.clientX - rect.left; app.drag.y = e.clientY - rect.top; render();
}
function onUp(e) {
  if (!app.drag) return;
  const rect = app.canvas.getBoundingClientRect();
  const to = cellAt(e.clientX - rect.left, e.clientY - rect.top);
  const from = app.drag.from, tier = app.drag.tier; app.drag = null;

  if (to < 0 || to === from) { render(); return; }
  if (app.model.canMerge(from, to)) {
    const res = app.model.tryMerge(from, to);
    if (res.ok) {
      burst(to, res.newTier);
      floatText(to, "+" + res.coins, "#ffe066");
      app.shakeUntil = Date.now() + 120; app.shakeMag = Math.min(10, 3 + res.combo);
      blip(320 + res.newTier * 40, 0.09, "triangle", 0.06);
      if (res.frenzyJust) { toast("\u{1F525} MERGE FRENZY! Double coins"); blip(660, 0.25, "sawtooth", 0.05); }
      refresh();
    }
  } else if (app.model.grid[to] === 0) {
    app.model.grid[to] = tier; app.model.grid[from] = 0; refresh();
  } else render();
  checkBoardRest();
}

function doTapPod() {
  const r = app.model.tapPod();
  if (!r.ok) {
    if (r.reason === "energy") toast("Out of energy \u2014 wait, or use a boost");
    else if (r.reason === "cooldown") toast("Seed Pod is recharging\u2026");
    else if (r.reason === "full") { toast("Board is full"); checkBoardRest(); }
    refresh(); return;
  }
  blip(220, 0.05, "square", 0.04);
  refresh();
}

// ---------------------------------------------------------------- loop
function loop() {
  const now = Date.now();
  app.model.tick(now);
  // advance effects
  app.particles = app.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life--; return p.life > 0; });
  app.floats = app.floats.filter(f => { f.y -= 0.7; f.life--; return f.life > 0; });
  updateHUD(); render();
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- HUD
function updateHUD() {
  const m = app.model;
  $("coins").textContent = fmt(m.coins);
  $("energy").textContent = m.energy;
  $("energyCap").textContent = m.energyCap;
  $("level").textContent = m.level;
  $("bloomFill").style.width = Math.min(100, (m.bloom / (m.level * C.BLOOM_THRESHOLD)) * 100) + "%";
  $("plotsCount").textContent = m.plotsUnlocked;

  // combo
  const comboOn = m.comboActive;
  $("comboWrap").style.visibility = comboOn ? "visible" : "hidden";
  if (comboOn) {
    $("comboVal").textContent = "COMBO \u00D7" + m.comboMultiplier();
    const pct = Math.max(0, (m.comboExpires - Date.now()) / m.comboWindowMs) * 100;
    $("comboFill").style.width = pct + "%";
  }
  // frenzy
  $("frenzyBanner").style.display = m.frenzyActive ? "" : "none";
  if (m.frenzyActive) $("frenzyTime").textContent = Math.ceil((m.frenzyUntil - Date.now()) / 1000) + "s";

  // pod
  const ready = m.podReady(Date.now());
  $("podBtn").disabled = (!m.frenzyActive && m.energy < 1) || !ready;
  if (ready) $("podLabel").textContent = (m.frenzyActive ? "FREE TAP \u2014 Frenzy! " : "Tap Seed Pod  ") + "(" + m.podCharge + ")";
  else { const s = Math.max(0, Math.ceil((m.podCooldownEnds - Date.now()) / 1000)); $("podLabel").textContent = "Recharging\u2026 " + s + "s"; }

  // chest badge
  $("chestBtn").classList.toggle("ready", m.chestReady);
}

function refresh() { buildOrders(); buildGarden(); buildTasks(); buildUpgrades(); buildBoosters(); updateHUD(); render(); }

function setTab(tab) {
  app.tab = tab;
  for (const t of ["merge", "garden", "tasks", "upgrades"]) {
    $("panel" + cap(t)).style.display = t === tab ? "" : "none";
    $("tab" + cap(t)).classList.toggle("active", t === tab);
  }
  if (tab === "garden") buildGarden();
  if (tab === "tasks") buildTasks();
  if (tab === "upgrades") buildUpgrades();
}

// ---------------------------------------------------------------- orders
function buildOrders() {
  const el = $("orders"); el.innerHTML = "";
  app.model.orders.forEach((o, i) => {
    const can = app.model.canDeliver(i);
    const div = document.createElement("div");
    div.className = "order" + (can ? " ready" : "");
    const items = o.items.map(it => {
      const have = app.model.countTier(it.tier);
      const ok = have >= it.qty;
      return `<span class="chip ${ok ? "ok" : ""}">${C.TIERS[it.tier - 1].glyph}<b>${Math.min(have, it.qty)}/${it.qty}</b></span>`;
    }).join("");
    div.innerHTML = `<div class="order-items">${items}</div>
      <button class="btn deliver" ${can ? "" : "disabled"}>${can ? "Deliver" : "…"} +${o.reward}</button>`;
    div.querySelector(".deliver").addEventListener("click", () => {
      const r = app.model.deliver(i);
      if (r.ok) { toast("Order done! +" + r.reward + " \u{1F4B0}"); blip(520, 0.12, "triangle", 0.06); Platform.showInterstitial(); refresh(); checkBoardRest(); }
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
    else d.innerHTML = `<span class="plus">+</span>`;
    d.addEventListener("click", () => onPlot(i));
    el.appendChild(d);
  }
  $("gardenRate").textContent = fmt(app.model.gardenRatePerHour()) + " coins/hour";
  $("collectBtn").disabled = app.model.pendingOffline() <= 0;
}
function onPlot(i) {
  if (i >= app.model.plotsUnlocked) { toast("Locked \u2014 keep merging to unlock"); return; }
  if (app.model.plots[i] !== 0) { toast("Already planted"); return; }
  let best = -1, bestTier = 1;
  app.model.grid.forEach((t, idx) => { if (t >= 2 && t > bestTier) { bestTier = t; best = idx; } });
  if (best < 0) { toast("Merge up to tier 2+ to plant"); return; }
  app.model.grid[best] = 0;
  const r = app.model.plant(i, bestTier);
  if (r.ok) { toast("Planted " + C.TIERS[bestTier - 1].name); blip(440, 0.1, "sine", 0.05); } else toast("Can't plant");
  refresh();
}
function doCollect(mult) {
  const amt = app.model.collectGarden(Date.now(), mult);
  if (amt > 0) { toast("+" + fmt(amt) + " \u{1F4B0}"); blip(600, 0.12, "triangle", 0.05); }
  refresh();
}

// ---------------------------------------------------------------- tasks
function buildTasks() {
  const el = $("missionsList"); el.innerHTML = "";
  app.model.missions.forEach((m, i) => {
    const pct = Math.min(100, (m.progress / m.target) * 100);
    const d = document.createElement("div");
    d.className = "upg mission" + (m.done && !m.claimed ? " ready" : "");
    d.innerHTML = `<div style="flex:1">
        <div class="upg-title">${m.text}</div>
        <div class="mbar"><div class="mfill" style="width:${pct}%"></div></div>
        <div class="upg-sub">${m.progress}/${m.target} \u00B7 +${m.reward} \u{1F4B0}</div>
      </div>
      <button class="btn buy" ${m.done && !m.claimed ? "" : "disabled"}>${m.claimed ? "Done" : m.done ? "Claim" : "\u2026"}</button>`;
    d.querySelector(".buy").addEventListener("click", () => {
      const r = app.model.claimMission(i);
      if (r.ok) { toast("Mission complete! +" + r.reward + " \u{1F4B0}"); blip(700, 0.14, "triangle", 0.06); refresh(); }
    });
    el.appendChild(d);
  });
}

// ---------------------------------------------------------------- upgrades
function buildUpgrades() {
  const el = $("upgradesList"); el.innerHTML = "";
  for (const def of C.UPGRADES) {
    const cost = app.model.upgradeCost(def.key);
    const maxed = app.model.isMaxed(def.key);
    const afford = app.model.coins >= cost;
    const lvl = app.model.upgrades[def.key];
    const d = document.createElement("div");
    d.className = "upg";
    d.innerHTML = `<div><div class="upg-title">${def.title} <span class="lvl">Lv${lvl}</span></div>
        <div class="upg-sub">${def.sub}</div></div>
      <button class="btn buy ${afford && !maxed ? "ok" : ""}" ${maxed || !afford ? "disabled" : ""}>${maxed ? "MAX" : fmt(cost) + " \u{1F4B0}"}</button>`;
    d.querySelector(".buy").addEventListener("click", () => {
      const r = app.model.buyUpgrade(def.key);
      if (r.ok) { toast(def.title + " upgraded"); blip(560, 0.1, "sine", 0.05); refresh(); } else toast("Not enough coins");
    });
    el.appendChild(d);
  }
}

// ---------------------------------------------------------------- boosters
function buildBoosters() {
  const el = $("boosters"); if (!el) return; el.innerHTML = "";
  const defs = [["shovel", "\u{1FAA3}", "Shovel"], ["mixer", "\u{1F500}", "Mixer"], ["lucky", "\u{1F31F}", "Lucky"]];
  for (const [k, icon, name] of defs) {
    const n = app.model.boosters[k] || 0;
    const b = document.createElement("button");
    b.className = "booster"; b.disabled = n <= 0;
    b.innerHTML = `${icon}<span class="cnt">${n}</span>`;
    b.title = name;
    b.addEventListener("click", () => { const r = app.model.useBooster(k); if (r.ok) { toast(name + " used"); refresh(); } });
    el.appendChild(b);
  }
}

// ---------------------------------------------------------------- chest
function onChest() {
  const m = app.model;
  if (!m.chestReady) { toast("No chest right now \u2014 keep playing"); return; }
  const left = m.rewardedLeft("chest");
  const alt = C.REWARDED.chest.coinsAlt;
  modal("Reward Chest \u{1F381}", "Open it for coins, energy and maybe a booster.", [
    { label: left > 0 ? "Open \u2014 watch a short ad" : "Ad limit reached today", primary: left > 0, onClick: async () => {
        if (m.rewardedLeft("chest") <= 0) return;
        const ok = await Platform.showRewarded();
        if (ok) { m.rewardedUse("chest"); const r = m.openChest(); if (r.ok) chestRewardToast(r); }
        closeModal(); refresh();
      } },
    { label: `Open with ${alt} \u{1F4B0}`, onClick: () => {
        if (m.coins < alt) { toast("Not enough coins"); return; }
        m.coins -= alt; const r = m.openChest(); if (r.ok) chestRewardToast(r); closeModal(); refresh();
      } },
    { label: "Later", onClick: closeModal },
  ]);
}
function chestRewardToast(r) {
  blip(760, 0.16, "triangle", 0.06);
  toast(`Chest: +${fmt(r.coins)} \u{1F4B0}, +${r.energy} \u26A1${r.booster ? ", +1 " + r.booster : ""}`);
}

// ---------------------------------------------------------------- board-rest
function hasMerge() {
  const seen = {};
  for (const t of app.model.grid) { if (!t || t >= C.MAX_TIER) continue; if (seen[t]) return true; seen[t] = true; }
  return false;
}
function checkBoardRest() {
  const m = app.model;
  if (!m.isFull() || hasMerge()) return;
  modal("The garden is resting", "No merges left. Clear some space to keep going.", [
    { label: "Shovel \u2014 remove one (" + (m.boosters.shovel > 0 ? "free" : "60 \u{1F4B0}") + ")", primary: true, onClick: () => {
        if (m.boosters.shovel > 0) m.useBooster("shovel"); else if (m.coins >= 60) { m.coins -= 60; m.useBooster("shovel"); }
        refresh(); closeModal();
      } },
    { label: "Mixer \u2014 shuffle the board", onClick: () => {
        if (m.boosters.mixer > 0) m.useBooster("mixer"); else if (m.coins >= 60) { m.coins -= 60; m.boosters.mixer = 1; m.useBooster("mixer"); }
        refresh(); closeModal();
      } },
    { label: "Watch a boost (rewarded)", onClick: async () => { const ok = await Platform.showRewarded(); if (ok) { m.grantRewarded("luckyBloom"); refresh(); } closeModal(); } },
    { label: "Later", onClick: closeModal },
  ]);
}

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
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
}
function showSettings() {
  modal("Settings", "Merge & Bloom v2 \u2014 best combo \u00D7" + (app.model.bestCombo || 0), [
    { label: "Reset progress", onClick: () => { if (confirm("Erase all progress?")) { localStorage.removeItem("mb_save"); location.reload(); } } },
    { label: "Close", primary: true, onClick: closeModal },
  ]);
}

// ---------------------------------------------------------------- persistence
setInterval(() => Platform.setSave(app.model.serialize()), 15000);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") Platform.setSave(app.model.serialize()); });

window.addEventListener("load", init);
