// Merge & Bloom — pure game model (no DOM, unit-testable)
import * as C from "./config.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const UPG = Object.fromEntries(C.UPGRADES.map(u => [u.key, u]));

export class GameModel {
  constructor() { this.reset(); }

  reset() {
    this.grid = new Array(C.GRID * C.GRID).fill(0);
    this.coins = 0;
    this.energy = C.ENERGY_CAP_START;
    this.xp = 0;
    this.level = 1;
    this.bloom = 0;
    this.orders = [];
    this.plots = new Array(12).fill(0);
    this.upgrades = {
      energyCap: 1, regen: 1, podLevel: 1, mergeValue: 1, comboWindow: 1,
      orderSlots: 1, luckyDrop: 1, gardenEff: 1, offlineCap: 1, autoProducer: 1,
    };
    this.podCharge = C.POD_CHARGE_START;
    this.podCooldownEnds = 0;
    this.energyCarry = 0;
    this.autoCarry = 0;
    this.lastTick = Date.now();
    this.lastCollect = Date.now();

    // fun systems
    this.combo = 0;
    this.comboExpires = 0;
    this.bestCombo = 0;
    this.frenzyUntil = 0;
    this.chestReady = false;
    this.nextChestAt = Date.now() + C.CHEST_FIRST_MS;
    this.boosters = { shovel: 1, mixer: 1, lucky: 1 };

    // v3 systems
    this.totalMerges = 0;
    this.totalOrders = 0;
    this.maxTier = 1;
    this.achievements = {};
    this.campaign = { level: 1, progress: 0, done: false, boss: C.levelGoal(1).boss };
    this.themes = { owned: ["meadow"], selected: "meadow" };
    this.streak = { day: 0, lastClaimDay: -1 };
    this.wheel = { spins: 0, nextFreeAt: 0, lastFreeDay: -1 };
    this.box = { lastFreeDay: -1 };
    this.rushUntil = 0;
    this.rushNextAt = Date.now() + C.RUSH_EVERY_MS;

    const day = this._dayKey();
    this.daily = { rewardedCounts: {}, dayKey: day, missionDay: day };
    this.missions = [];
    this.genOrders(true);
    this._rollMissions();
  }

  // ---- helpers ----------------------------------------------------------
  _dayKey(now = Date.now()) { return Math.floor(now / 86400000); }
  _roll() { return Math.random(); }

  get energyCap() { return C.ENERGY_CAP_START + (this.upgrades.energyCap - 1) * 25; }
  get regenSeconds() { return Math.max(15, C.ENERGY_REGEN_SECONDS - (this.upgrades.regen - 1) * 5); }
  get podLevel() { return clamp(this.upgrades.podLevel, 1, C.POD_MAX_LEVEL); }
  get offlineCapHours() { return Math.min(C.OFFLINE_CAP_MAX, C.OFFLINE_CAP_HOURS_START + (this.upgrades.offlineCap - 1) * 4); }
  get plotsUnlocked() { return clamp(2 + Math.floor(this.level / 2) + Math.floor(this.bloom / C.BLOOM_THRESHOLD), 2, 12); }
  get mergeValueMult() { return 1 + 0.15 * (this.upgrades.mergeValue - 1); }
  get comboWindowMs() { return C.COMBO_WINDOW_MS + (this.upgrades.comboWindow - 1) * 300; }
  get orderSlotCount() { return C.ORDER_SLOTS + (this.upgrades.orderSlots - 1); }
  get luckyChance() { return 0.05 * (this.upgrades.luckyDrop - 1); }
  get gardenEfficiency() { return Math.min(1.3, 0.8 + (this.upgrades.gardenEff - 1) * 0.1); }
  get frenzyActive() { return Date.now() < this.frenzyUntil; }
  get comboActive() { return Date.now() < this.comboExpires && this.combo > 0; }

  emptyCells() { const out = []; for (let i = 0; i < this.grid.length; i++) if (this.grid[i] === 0) out.push(i); return out; }
  isFull() { return this.emptyCells().length === 0; }
  countTier(t) { let c = 0; for (const v of this.grid) if (v === t) c++; return c; }
  totalItems() { let c = 0; for (const v of this.grid) if (v) c++; return c; }

  // ---- energy / pod -----------------------------------------------------
  regenEnergy(now) {
    const dt = (now - this.lastTick) / 1000;
    this.lastTick = now;
    if (this.energy < this.energyCap) {
      this.energyCarry += dt;
      const gain = Math.floor(this.energyCarry / this.regenSeconds);
      if (gain > 0) { this.energyCarry -= gain * this.regenSeconds; this.energy = Math.min(this.energyCap, this.energy + gain); }
    } else { this.energyCarry = 0; }
    if (this.podCooldownEnds && now >= this.podCooldownEnds) { this.podCooldownEnds = 0; this.podCharge = C.POD_CHARGE_START; }
  }

  podReady(now = Date.now()) {
    if (this.podCooldownEnds && now >= this.podCooldownEnds) { this.podCooldownEnds = 0; this.podCharge = C.POD_CHARGE_START; }
    return now >= this.podCooldownEnds && this.podCharge > 0;
  }

  rollPodTier() {
    const table = C.POD_TABLES[this.podLevel] || C.POD_TABLES[1];
    let r = this._roll(), acc = 0, tier = table[0][0];
    for (const [t, p] of table) { acc += p; if (r <= acc) { tier = t; break; } }
    if (this.luckyChance > 0 && this._roll() < this.luckyChance) tier = Math.min(C.MAX_TIER, tier + 1);
    return tier;
  }

  tapPod(now = Date.now()) {
    const free = this.frenzyActive;
    if (!free && this.energy < 1) return { ok: false, reason: "energy" };
    if (!this.podReady(now)) return { ok: false, reason: "cooldown" };
    const cells = this.emptyCells();
    if (!cells.length) return { ok: false, reason: "full" };
    const tier = this.rollPodTier();
    const idx = cells[Math.floor(this._roll() * cells.length)];
    this.grid[idx] = tier;
    if (!free) this.energy -= 1;
    this.podCharge -= 1;
    if (this.podCharge <= 0) this.podCooldownEnds = now + C.POD_COOLDOWN_SECONDS * 1000;
    this._progress("spawn", 1);
    return { ok: true, cell: idx, tier, free };
  }

  // ---- merge + combo ----------------------------------------------------
  canMerge(from, to) {
    if (from === to) return false;
    const a = this.grid[from], b = this.grid[to];
    return a > 0 && a === b && a < C.MAX_TIER;
  }

  comboMultiplier() { return clamp(this.combo, 1, C.COMBO_MAX); }

  tryMerge(from, to, now = Date.now()) {
    if (!this.canMerge(from, to)) return { ok: false };
    const tier = this.grid[from];
    // combo
    if (now < this.comboExpires) this.combo += 1; else this.combo = 1;
    this.comboExpires = now + this.comboWindowMs;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const frenzyJust = this.combo >= C.FRENZY_COMBO && now >= this.frenzyUntil;
    if (frenzyJust) this.frenzyUntil = now + C.FRENZY_MS;

    this.totalMerges = (this.totalMerges || 0) + 1;
    this.maxTier = Math.max(this.maxTier || 1, tier + 1);
    const mult = this.comboMultiplier() * (this.frenzyActive ? 2 : 1) * (this.rushActive ? 2 : 1) * this.mergeValueMult;
    const coins = Math.round(C.TIERS[tier].value * mult);

    this.grid[to] = tier + 1;
    this.grid[from] = 0;
    this.bloom += C.BLOOM_PER_MERGE;
    this.coins += coins;
    this.addXp(1);
    while (this.bloom >= this.level * C.BLOOM_THRESHOLD) { this.level += 1; }

    this._progress("merge", 1);
    this._progress("tier", tier + 1);
    this._progress("combo", this.combo);

    return { ok: true, to, newTier: tier + 1, coins, combo: this.combo, frenzy: this.frenzyActive, frenzyJust };
  }

  addXp(n) { this.xp += n; const need = this.level * 10; if (this.xp >= need) { this.xp -= need; this.level += 1; } }

  // ---- orders -----------------------------------------------------------
  currentBand() { return clamp(Math.ceil(this.level / 2), 1, 6); }

  _makeOrder(band) {
    const bands = {
      1: [[1, 3], [2, 1]], 2: [[2, 3], [3, 1]], 3: [[3, 3], [4, 1]],
      4: [[4, 3], [5, 1]], 5: [[5, 3], [6, 1]], 6: [[6, 2], [7, 1]],
    };
    const items = (bands[band] || bands[1]).map(([tier, qty]) => ({ tier, qty }));
    const reward = Math.round(items.reduce((s, it) => s + C.TIERS[it.tier - 1].value * it.qty, 0) * 1.5);
    return { items, reward };
  }

  genOrders() {
    const band = this.currentBand();
    const offsets = [Math.max(1, band - 1), band, band, Math.min(6, band + 1)];
    this.orders = [];
    for (let i = 0; i < this.orderSlotCount; i++) this.orders.push(this._makeOrder(offsets[i % offsets.length]));
  }

  canDeliver(idx) {
    const o = this.orders[idx]; if (!o) return false;
    return o.items.every(it => this.countTier(it.tier) >= it.qty);
  }

  deliver(idx, now = Date.now()) {
    if (!this.canDeliver(idx)) return { ok: false };
    const o = this.orders[idx];
    for (const it of o.items) {
      let need = it.qty;
      for (let i = 0; i < this.grid.length && need > 0; i++) { if (this.grid[i] === it.tier) { this.grid[i] = 0; need--; } }
    }
    const bonus = (this.frenzyActive ? 2 : 1) * (this.rushActive ? 2 : 1);
    const reward = o.reward * bonus;
    this.coins += reward;
    this.addXp(3);
    this.orders[idx] = this._makeOrder(this.currentBand());
    this.totalOrders = (this.totalOrders || 0) + 1;
    this._progress("order", 1);
    return { ok: true, reward };
  }

  // ---- garden -----------------------------------------------------------
  plant(plotIdx, tier) {
    if (plotIdx >= this.plotsUnlocked) return { ok: false, reason: "locked" };
    if (this.plots[plotIdx] !== 0) return { ok: false, reason: "occupied" };
    if (tier < 2) return { ok: false, reason: "tooLow" };
    this.plots[plotIdx] = tier;
    return { ok: true };
  }

  gardenRatePerHour() { return this.plots.reduce((s, t) => s + (t ? C.gardenRate(t) : 0), 0); }

  pendingOffline(now = Date.now()) {
    const hrs = Math.min((now - this.lastCollect) / 3600000, this.offlineCapHours);
    if (hrs <= 0) return 0;
    return Math.floor(this.gardenRatePerHour() * hrs * this.gardenEfficiency);
  }

  collectGarden(now = Date.now(), mult = 1) {
    const amt = Math.floor(this.pendingOffline(now) * mult);
    this.coins += amt;
    this.lastCollect = now;
    return amt;
  }

  // ---- reward chest (rewarded-ad gated) --------------------------------
  chestReadyNow(now = Date.now()) { return this.chestReady; }

  openChest(now = Date.now()) {
    if (!this.chestReady) return { ok: false, reason: "notReady" };
    this.chestReady = false;
    this.nextChestAt = now + C.CHEST_INTERVAL_MS;
    const coins = Math.round(C.CHEST.coinsMin + this._roll() * (C.CHEST.coinsMax - C.CHEST.coinsMin)) * (1 + (this.level - 1) * 0.15);
    this.coins += Math.round(coins);
    this.energy = Math.min(this.energyCap, this.energy + C.CHEST.energy);
    let booster = null;
    if (this._roll() < C.CHEST.boosterChance) {
      booster = ["shovel", "mixer", "lucky"][Math.floor(this._roll() * 3)];
      this.boosters[booster] = (this.boosters[booster] || 0) + 1;
    }
    this._progress("chest", 1);
    return { ok: true, coins: Math.round(coins), energy: C.CHEST.energy, booster };
  }

  useBooster(kind) {
    if ((this.boosters[kind] || 0) <= 0) return { ok: false };
    this.boosters[kind] -= 1;
    if (kind === "shovel") { let low = -1, lt = 99; this.grid.forEach((t, i) => { if (t && t < lt) { lt = t; low = i; } }); if (low >= 0) this.grid[low] = 0; }
    if (kind === "mixer") { const items = this.grid.filter(t => t); for (let i = items.length - 1; i > 0; i--) { const j = Math.floor(this._roll() * (i + 1)); [items[i], items[j]] = [items[j], items[i]]; } this.grid = new Array(C.GRID * C.GRID).fill(0); items.forEach((t, i) => this.grid[i] = t); }
    if (kind === "lucky") { const cells = this.emptyCells(); if (cells.length) this.grid[cells[Math.floor(this._roll() * cells.length)]] = 4; }
    return { ok: true };
  }

  // ---- missions ---------------------------------------------------------
  _rollMissions(now = Date.now()) {
    const day = this._dayKey(now);
    this.daily.missionDay = day;
    const seed = day % C.MISSION_POOL.length;
    const picks = [0, 1, 2].map(k => C.MISSION_POOL[(seed + k * 2) % C.MISSION_POOL.length]);
    this.missions = picks.map(m => ({ ...m, progress: 0, done: false, claimed: false }));
  }

  _progress(type, value) {
    if (this.daily.missionDay !== this._dayKey()) this._rollMissions();
    for (const m of this.missions) {
      if (m.done || m.type !== type) continue;
      if (type === "tier" || type === "combo") m.progress = Math.max(m.progress, value);
      else m.progress += value;
      if (m.progress >= m.target) { m.progress = m.target; m.done = true; }
    }
    this._campaignProgress(type, value);
  }

  // ---- campaign (levels + bosses) --------------------------------------
  get rushActive() { return Date.now() < this.rushUntil; }
  get levelGoalDef() { return C.levelGoal(this.campaign.level); }

  _campaignProgress(type, value) {
    const g = this.levelGoalDef;
    if (g.type !== type) return;
    if (type === "tier") this.campaign.progress = Math.max(this.campaign.progress, value);
    else this.campaign.progress += value;
    if (this.campaign.progress >= g.target) this.campaign.done = true;
  }

  claimLevel() {
    if (!this.campaign.done) return { ok: false };
    const lvl = this.campaign.level;
    const reward = Math.round(C.LEVEL_REWARD_BASE * (1 + lvl * 0.25) * (this.campaign.boss ? 2 : 1));
    this.coins += reward;
    if (this.campaign.boss) this.boosters.lucky = (this.boosters.lucky || 0) + 1;
    this.campaign = { level: lvl + 1, progress: 0, done: false, boss: C.levelGoal(lvl + 1).boss };
    return { ok: true, reward, level: lvl + 1 };
  }

  // ---- themes -----------------------------------------------------------
  themeOwned(id) { return this.themes.owned.includes(id); }
  buyTheme(id) {
    const t = C.THEMES.find(x => x.id === id); if (!t) return { ok: false };
    if (this.themeOwned(id)) { this.themes.selected = id; return { ok: true }; }
    if (this.campaign.level < t.req) return { ok: false, reason: "locked" };
    if (this.coins < t.cost) return { ok: false, reason: "coins" };
    this.coins -= t.cost; this.themes.owned.push(id); this.themes.selected = id;
    return { ok: true };
  }
  selectTheme(id) { if (!this.themeOwned(id)) return { ok: false }; this.themes.selected = id; return { ok: true }; }

  // ---- leaderboard ------------------------------------------------------
  score() { return this.coins + this.level * 500 + this.bestCombo * 200 + (this.campaign.level - 1) * 1500 + (this.totalMerges || 0) * 10; }
  leaderboard(now = Date.now()) {
    const seed = Math.floor(now / 86400000);
    const rows = C.LB_NAMES.map((n, i) => ({ name: n, score: Math.round(600 + ((seed * (i + 3)) % 97) * 130 + i * 450) }));
    rows.push({ name: "You", score: this.score(), me: true });
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }

  // ---- daily login streak ----------------------------------------------
  streakClaimable(now = Date.now()) { return this.streak.lastClaimDay !== this._dayKey(now); }
  claimStreak(now = Date.now()) {
    if (!this.streakClaimable(now)) return { ok: false, reason: "claimed" };
    const y = this._dayKey(now);
    if (this.streak.lastClaimDay === y - 1) this.streak.day = (this.streak.day % 7) + 1; else this.streak.day = 1;
    this.streak.lastClaimDay = y;
    const reward = C.STREAK_REWARDS[this.streak.day - 1];
    this.coins += reward;
    return { ok: true, day: this.streak.day, reward };
  }

  // ---- fortune wheel ----------------------------------------------------
  wheelFreeAvailable(now = Date.now()) { return now >= (this.wheel.nextFreeAt || 0); }
  wheelFreeIn(now = Date.now()) { return Math.max(0, Math.ceil(((this.wheel.nextFreeAt || 0) - now) / 1000)); }
  pickWheel() { const i = Math.floor(this._roll() * C.WHEEL.length); return { index: i, segment: C.WHEEL[i] }; }
  applyWheel(seg) {
    if (seg.coins) this.coins += seg.coins;
    if (seg.energy) this.energy = Math.min(this.energyCap, this.energy + seg.energy);
    if (seg.booster) this.boosters[seg.booster] = (this.boosters[seg.booster] || 0) + 1;
    this.wheel.spins = (this.wheel.spins || 0) + 1;
  }
  spinWheel() { const p = this.pickWheel(); this.applyWheel(p.segment); return { ok: true, segment: p.segment, index: p.index }; }
  consumeFreeSpin(now = Date.now()) { this.wheel.nextFreeAt = now + C.WHEEL_FREE_COOLDOWN_MS; }

  // ---- mystery box ------------------------------------------------------
  boxFreeAvailable(now = Date.now()) { return this.box.lastFreeDay !== this._dayKey(now); }
  consumeBoxFree(now = Date.now()) { this.box.lastFreeDay = this._dayKey(now); }
  openBox() {
    const total = C.BOX_PRIZES.reduce((a, p) => a + p.weight, 0);
    let r = this._roll() * total, pick = C.BOX_PRIZES[0];
    for (const p of C.BOX_PRIZES) { if ((r -= p.weight) <= 0) { pick = p; break; } }
    if (pick.coins) this.coins += pick.coins;
    if (pick.energy) this.energy = Math.min(this.energyCap, this.energy + pick.energy);
    if (pick.booster) { const keys = Object.keys(this.boosters); const k = keys[Math.floor(this._roll() * keys.length)]; this.boosters[k] = (this.boosters[k] || 0) + 1; }
    return { ok: true, prize: pick };
  }

  // ---- achievements -----------------------------------------------------
  checkAchievements() {
    const unlocked = [];
    for (const a of C.ACHIEVEMENTS) {
      if (!this.achievements[a.id] && a.check(this)) { this.achievements[a.id] = true; this.coins += a.reward; unlocked.push(a); }
    }
    return unlocked;
  }

  claimMission(i) {
    const m = this.missions[i];
    if (!m || !m.done || m.claimed) return { ok: false };
    m.claimed = true;
    this.coins += m.reward;
    return { ok: true, reward: m.reward };
  }

  // ---- upgrades ---------------------------------------------------------
  upgradeCost(kind) {
    const def = UPG[kind]; if (!def) return Infinity;
    return Math.round(def.base * Math.pow(C.UPGRADE_MULT, this.upgrades[kind] - 1));
  }
  isMaxed(kind) { const def = UPG[kind]; return def ? this.upgrades[kind] >= def.max : true; }

  buyUpgrade(kind) {
    const def = UPG[kind]; if (!def) return { ok: false };
    if (this.isMaxed(kind)) return { ok: false, reason: "max" };
    const cost = this.upgradeCost(kind);
    if (this.coins < cost) return { ok: false, reason: "coins", cost };
    this.coins -= cost;
    this.upgrades[kind] += 1;
    if (kind === "orderSlots") this.genOrders();
    return { ok: true, cost };
  }

  // ---- rewarded ads (daily caps) ---------------------------------------
  rewardedUsed(kind, now = Date.now()) {
    if (this.daily.dayKey !== this._dayKey(now)) { this.daily.dayKey = this._dayKey(now); this.daily.rewardedCounts = {}; }
    return this.daily.rewardedCounts[kind] || 0;
  }
  rewardedLeft(kind, now = Date.now()) { const cfg = C.REWARDED[kind]; return cfg ? Math.max(0, cfg.cap - this.rewardedUsed(kind, now)) : 0; }
  rewardedUse(kind, now = Date.now()) { if (this.rewardedLeft(kind, now) <= 0) return false; this.daily.rewardedCounts[kind] = this.rewardedUsed(kind, now) + 1; return true; }

  grantRewarded(kind, now = Date.now()) {
    if (!this.rewardedUse(kind, now)) return { ok: false, reason: "cap" };
    switch (kind) {
      case "energy": this.energy = Math.min(this.energyCap, this.energy + C.ENERGY_REWARDED_AMOUNT); break;
      case "cooldown": this.podCooldownEnds = 0; this.podCharge = C.POD_CHARGE_START; break;
      case "luckyBloom": { const cells = this.emptyCells(); if (cells.length) this.grid[cells[Math.floor(this._roll() * cells.length)]] = 4; break; }
      case "refreshOrders": this.genOrders(); break;
      case "doubleHarvest": break;
      case "coins": this.coins += 150; break;
    }
    return { ok: true };
  }

  // ---- tick (call each frame) ------------------------------------------
  tick(now = Date.now()) {
    this.regenEnergy(now);
    if (this.combo > 0 && now >= this.comboExpires) this.combo = 0;
    if (!this.chestReady && now >= this.nextChestAt) this.chestReady = true;
    if (now >= this.rushNextAt) { this.rushUntil = now + C.RUSH_MS; this.rushNextAt = now + C.RUSH_EVERY_MS; }
    if (this.upgrades.autoProducer > 1) {
      const interval = Math.max(10, 40 - this.upgrades.autoProducer * 4);
      this.autoCarry += 1;
      if (this.autoCarry >= interval * 60) {
        this.autoCarry = 0;
        const cells = this.emptyCells();
        if (cells.length) this.grid[cells[Math.floor(this._roll() * cells.length)]] = 1;
      }
    }
  }

  // ---- serialisation ----------------------------------------------------
  serialize() {
    return { v: 2, savedAt: Date.now(), state: {
      grid: this.grid, coins: this.coins, energy: this.energy, xp: this.xp, level: this.level,
      bloom: this.bloom, plots: this.plots, upgrades: this.upgrades, podCharge: this.podCharge,
      podCooldownEnds: this.podCooldownEnds, lastCollect: this.lastCollect, orders: this.orders,
      daily: this.daily, missions: this.missions, boosters: this.boosters, bestCombo: this.bestCombo,
      nextChestAt: this.nextChestAt, totalMerges: this.totalMerges, totalOrders: this.totalOrders, maxTier: this.maxTier,
      achievements: this.achievements, campaign: this.campaign,
      themes: this.themes, streak: this.streak, wheel: this.wheel, box: this.box, rushNextAt: this.rushNextAt,
    } };
  }

  static deserialize(env) {
    const m = new GameModel();
    if (!env || !env.state) return m;
    const s = env.state;
    Object.assign(m, {
      grid: s.grid || m.grid, coins: s.coins ?? 0, energy: s.energy ?? m.energy, xp: s.xp ?? 0,
      level: s.level ?? 1, bloom: s.bloom ?? 0, plots: s.plots || m.plots,
      upgrades: Object.assign(m.upgrades, s.upgrades || {}), podCharge: s.podCharge ?? C.POD_CHARGE_START,
      podCooldownEnds: s.podCooldownEnds ?? 0, lastCollect: s.lastCollect ?? Date.now(),
      orders: (s.orders && s.orders.length) ? s.orders : m.orders, daily: s.daily || m.daily,
      missions: (s.missions && s.missions.length) ? s.missions : m.missions,
      boosters: s.boosters || m.boosters, bestCombo: s.bestCombo || 0, nextChestAt: s.nextChestAt || (Date.now() + C.CHEST_FIRST_MS),
      totalMerges: s.totalMerges || 0, totalOrders: s.totalOrders || 0, maxTier: s.maxTier || 1,
      achievements: s.achievements || {}, campaign: s.campaign || m.campaign, themes: s.themes || m.themes,
      streak: s.streak || m.streak, wheel: s.wheel || m.wheel, box: s.box || m.box, rushNextAt: s.rushNextAt || (Date.now() + C.RUSH_EVERY_MS),
    });
    m.lastTick = Date.now();
    if (m.daily.missionDay !== m._dayKey()) m._rollMissions();
    return m;
  }
}
