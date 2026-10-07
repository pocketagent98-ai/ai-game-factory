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
  drag: null, tab: "merge", started: false,
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
  Platform.onPause = (paused) => { if (paused) Platform.setSave(app.model.serialize()); };
  Platform.onAudio = () => {};
  // never let a missing/hanging platform SDK block the game from booting
  try { await Promise.race([Platform.init(), new Promise((r) => setTimeout(r, 1500))]); } catch (e) {}
  let env = null;
  try { env = Platform.getSave(); } catch (e) {}
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
  $("tabLevels").addEventListener("click", () => setTab("levels"));
  $("tabUpgrades").addEventListener("click", () => setTab("upgrades"));
  $("collectBtn").addEventListener("click", () => doCollect(1));
  $("settingsBtn").addEventListener("click", showSettings);
  $("chestBtn").addEventListener("click", onChest);
  $("giftBtn").addEventListener("click", onGift);
  $("wheelBtn").addEventListener("click", onWheel);

  const pending = app.model.pendingOffline();
  if (pending > 0) showWelcomeBack(pending);

  applyTheme();
  buildOrders(); buildGarden(); buildLevels(); buildTasks(); buildUpgrades(); buildBoosters();
  setTab("merge");
  requestAnimationFrame(loop);
  // late layout passes (mobile browsers can report 0 size before layout settles)
  setTimeout(resize, 250); setTimeout(resize, 900);
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
  if (!app.started) { app.started = true; Platform.gameplayStart(); }
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
  $("giftBtn").classList.toggle("ready", m.streakClaimable());
  $("wheelBtn").classList.toggle("ready", m.wheelFreeAvailable());
  $("rushBanner").style.display = m.rushActive ? "" : "none";
  if (m.rushActive) $("rushTime").textContent = Math.ceil((m.rushUntil - Date.now()) / 1000) + "s";
}

function refresh() { buildOrders(); buildGarden(); buildLevels(); buildTasks(); buildUpgrades(); buildBoosters(); updateHUD(); render(); }

function setTab(tab) {
  app.tab = tab;
  for (const t of ["merge", "garden", "levels", "tasks", "upgrades"]) {
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
      if (r.ok) { blip(520, 0.12, "triangle", 0.06); Platform.showInterstitial(); refresh(); checkBoardRest(); offerDouble(r.reward); }
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
    d.innerHTML = `<div style="flex:1"><div class="upg-title">${def.title} <span class="lvl">Lv${lvl}</span></div>
        <div class="upg-sub">${def.sub}</div></div><div class="upg-btns"></div>`;
    const btns = d.querySelector(".upg-btns");
    const buy = document.createElement("button");
    buy.className = "btn buy " + (afford && !maxed ? "ok" : "");
    buy.disabled = maxed || !afford;
    buy.textContent = maxed ? "MAX" : fmt(cost) + " \u{1F4B0}";
    buy.addEventListener("click", () => { const r = app.model.buyUpgrade(def.key); if (r.ok) { toast(def.title + " upgraded"); blip(560, 0.1, "sine", 0.05); refresh(); } else toast("Not enough coins"); });
    btns.appendChild(buy);
    if (!maxed && !afford && app.model.rewardedLeft("coins") > 0) {
      const ad = document.createElement("button");
      ad.className = "btn ad";
      ad.textContent = "+150 \u{1F4B0} ad";
      ad.addEventListener("click", async () => { const ok = await Platform.showRewarded(); if (ok) { app.model.rewardedUse("coins"); app.model.coins += 150; toast("+150 \u{1F4B0}"); refresh(); } });
      btns.appendChild(ad);
    }
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

// ---------------------------------------------------------------- levels / themes / leaderboard
function applyTheme() {
  const t = C.THEMES.find(x => x.id === app.model.themes.selected) || C.THEMES[0];
  const r = document.documentElement.style;
  r.setProperty("--bg1", t.bg1); r.setProperty("--bg2", t.bg2);
  r.setProperty("--panel", t.panel); r.setProperty("--accent", t.accent);
}
function buildLevels() {
  const m = app.model, g = m.levelGoalDef;
  const label = { merge: "Make merges", order: "Complete orders", spawn: "Tap the Seed Pod", tier: "Merge up to tier" }[g.type] || g.type;
  const pct = Math.min(100, (m.campaign.progress / g.target) * 100);
  const card = $("campaignCard"); card.innerHTML = "";
  const head = document.createElement("div");
  head.innerHTML = `<div class="upg-title">${g.boss ? "\u{1F451} BOSS \u00B7 " : ""}Level ${m.campaign.level}</div>
    <div class="upg-sub">${label} ${m.campaign.progress}/${g.target}${g.type === "tier" ? " (T" + g.target + ")" : ""}</div>
    <div class="mbar"><div class="mfill" style="width:${pct}%"></div></div>`;
  card.appendChild(head);
  const btn = document.createElement("button");
  btn.className = "btn " + (m.campaign.done ? "ok" : "");
  btn.textContent = m.campaign.done ? "Claim reward" : (g.boss ? "Boss in progress\u2026" : "In progress");
  btn.disabled = !m.campaign.done;
  btn.addEventListener("click", () => { const r = m.claimLevel(); if (r.ok) { toast("Level " + (r.level - 1) + " done! +" + r.reward + " \u{1F4B0}"); blip(720, 0.16, "triangle", 0.06); refresh(); } });
  card.appendChild(btn);

  const lb = $("leaderboardList"); lb.innerHTML = "";
  m.leaderboard().slice(0, 10).forEach((row, i) => {
    const d = document.createElement("div");
    d.className = "lbrow" + (row.me ? " me" : "");
    d.innerHTML = `<span class="rank">${i + 1}</span><span class="nm">${row.name}</span><span class="sc">${fmt(row.score)}</span>`;
    lb.appendChild(d);
  });

  const tg = $("themesGrid"); tg.innerHTML = "";
  for (const t of C.THEMES) {
    const owned = m.themeOwned(t.id), sel = m.themes.selected === t.id, locked = m.campaign.level < t.req;
    const d = document.createElement("div");
    d.className = "theme" + (sel ? " sel" : "") + (locked && !owned ? " locked" : "");
    d.style.background = `linear-gradient(160deg, ${t.bg2}, ${t.bg1})`;
    d.innerHTML = `<span class="tname">${t.name}</span><span class="tstate">${sel ? "Selected" : owned ? "Owned" : locked ? "Lv" + t.req : fmt(t.cost) + " \u{1F4B0}"}</span>`;
    d.addEventListener("click", () => {
      if (owned) { m.selectTheme(t.id); applyTheme(); refresh(); }
      else { const r = m.buyTheme(t.id); if (r.ok) { applyTheme(); toast(t.name + " unlocked!"); } else toast(r.reason === "locked" ? "Reach level " + t.req : "Not enough coins"); refresh(); }
    });
    tg.appendChild(d);
  }
}

// ---------------------------------------------------------------- daily gift / fortune wheel
function onGift() {
  const m = app.model;
  if (!m.streakClaimable()) { toast("Come back tomorrow for day " + ((m.streak.day % 7) + 1)); return; }
  const day = (m.streak.lastClaimDay === m._dayKey() - 1) ? (m.streak.day % 7) + 1 : 1;
  const reward = C.STREAK_REWARDS[day - 1];
  modal("Daily gift \u{1F381}", `Day ${day} of 7 \u2014 claim ${reward} coins, or watch a short ad to double it.`, [
    { label: "Claim +" + reward + " \u{1F4B0}", primary: true, onClick: () => { const r = m.claimStreak(); if (r.ok) { toast("+" + r.reward + " \u{1F4B0} (day " + r.day + ")"); blip(640, 0.14, "triangle", 0.06); } closeModal(); refresh(); } },
    { label: "Claim + double (watch ad)", onClick: async () => { const ok = await Platform.showRewarded(); const r = m.claimStreak(); if (r.ok) { if (ok && m.rewardedLeft("streak") > 0) { m.rewardedUse("streak"); m.coins += r.reward; } toast("+" + (ok ? r.reward * 2 : r.reward) + " \u{1F4B0}"); } closeModal(); refresh(); } },
    { label: "Later", onClick: closeModal },
  ]);
}
function onWheel() {
  const m = app.model;
  const free = m.wheelFreeAvailable();
  const adLeft = m.rewardedLeft("wheel");
  const alt = C.REWARDED.wheel.coinsAlt;
  modal("Fortune Wheel \u{1F3A1}", "Spin for coins, energy or a booster.", [
    { label: free ? "Free spin" : (adLeft > 0 ? "Spin \u2014 watch a short ad" : "Ad spins used up today"), primary: free || adLeft > 0,
      onClick: async () => {
        if (free) m.consumeFreeSpin();
        else if (adLeft > 0) { const ok = await Platform.showRewarded(); if (!ok) { closeModal(); return; } m.rewardedUse("wheel"); }
        else return;
        const r = m.spinWheel(); toast("Wheel: " + r.segment.label); blip(700, 0.16, "triangle", 0.06); closeModal(); refresh();
      } },
    { label: `Spin for ${alt} \u{1F4B0}`, onClick: () => { if (m.coins < alt) { toast("Not enough coins"); return; } m.coins -= alt; const r = m.spinWheel(); toast("Wheel: " + r.segment.label); closeModal(); refresh(); } },
    { label: "Close", onClick: closeModal },
  ]);
}
function offerDouble(amount) {
  modal("Nice order! \u{1F389}", `Double your reward \u2014 ${amount} more coins.`, [
    { label: `Double it (+${amount} \u{1F4B0}) \u2014 watch ad`, primary: true, onClick: async () => { const ok = await Platform.showRewarded(); if (ok) { app.model.coins += amount; toast("+" + amount + " \u{1F4B0}"); blip(600, 0.12, "triangle", 0.05); } closeModal(); refresh(); } },
    { label: "No thanks", onClick: closeModal },
  ]);
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
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") { Platform.setSave(app.model.serialize()); Platform.gameplayStop(); }
  else Platform.gameplayStart();
});

window.addEventListener("load", init);
