// Merge & Bloom — pure game model (no DOM, unit-testable)
import * as C from "./config.js";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
    this.plots = new Array(12).fill(0);   // 0 = empty, else planted tier
    this.upgrades = { energyCap: 1, regen: 1, podLevel: 1, offlineCap: 1, autoProducer: 0 };
    this.podCharge = C.POD_CHARGE_START;
    this.podCooldownEnds = 0;
    this.energyCarry = 0;                 // fractional seconds toward next energy
    this.autoCarry = 0;
    this.lastTick = Date.now();
    this.lastCollect = Date.now();
    this.daily = { rewardedCounts: {}, dayKey: this._dayKey() };
    this.genOrders(true);
  }

  // ---- helpers ----------------------------------------------------------
  _dayKey(now = Date.now()) { return Math.floor(now / 86400000); }
  _roll() { return Math.random(); }

  get energyCap() { return C.ENERGY_CAP_START + (this.upgrades.energyCap - 1) * 25; }
  get regenSeconds() { return Math.max(15, C.ENERGY_REGEN_SECONDS - (this.upgrades.regen - 1) * 5); }
  get podLevel() { return clamp(this.upgrades.podLevel, 1, C.POD_MAX_LEVEL); }
  get offlineCapHours() { return Math.min(C.OFFLINE_CAP_MAX, C.OFFLINE_CAP_HOURS_START + (this.upgrades.offlineCap - 1) * 4); }
  get plotsUnlocked() { return clamp(2 + Math.floor(this.level / 2) + Math.floor(this.bloom / C.BLOOM_THRESHOLD), 2, 12); }

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
    let r = this._roll(), acc = 0;
    for (const [tier, p] of table) { acc += p; if (r <= acc) return tier; }
    return table[0][0];
  }

  tapPod(now = Date.now()) {
    if (this.energy < 1) return { ok: false, reason: "energy" };
    if (!this.podReady(now)) return { ok: false, reason: "cooldown" };
    const cells = this.emptyCells();
    if (!cells.length) return { ok: false, reason: "full" };
    const tier = this.rollPodTier();
    // prefer centre-biased empty cell
    const idx = cells[Math.floor(this._roll() * cells.length)];
    this.grid[idx] = tier;
    this.energy -= 1;
    this.podCharge -= 1;
    if (this.podCharge <= 0) { this.podCooldownEnds = now + C.POD_COOLDOWN_SECONDS * 1000; }
    return { ok: true, cell: idx, tier };
  }

  // ---- merge ------------------------------------------------------------
  canMerge(from, to) {
    if (from === to) return false;
    const a = this.grid[from], b = this.grid[to];
    return a > 0 && a === b && a < C.MAX_TIER;
  }

  tryMerge(from, to) {
    if (!this.canMerge(from, to)) return { ok: false };
    const tier = this.grid[from];
    this.grid[to] = tier + 1;
    this.grid[from] = 0;
    this.bloom += C.BLOOM_PER_MERGE;
    const coins = C.TIERS[tier].value;      // small coin for the merge itself
    this.coins += coins;
    this.addXp(1);
    // level-up on bloom thresholds
    while (this.bloom >= this.level * C.BLOOM_THRESHOLD) { this.level += 1; }
    return { ok: true, to, newTier: tier + 1, coins };
  }

  addXp(n) { this.xp += n; const need = this.level * 10; if (this.xp >= need) { this.xp -= need; this.level += 1; } }

  // ---- orders -----------------------------------------------------------
  currentBand() { return clamp(Math.ceil(this.level / 2), 1, 6); }

  _makeOrder(band) {
    const bands = {
      1: [[1, 3], [2, 1]],
      2: [[2, 3], [3, 1]],
      3: [[3, 3], [4, 1]],
      4: [[4, 3], [5, 1]],
      5: [[5, 3], [6, 1]],
      6: [[6, 2], [7, 1]],
    };
    const items = (bands[band] || bands[1]).map(([tier, qty]) => ({ tier, qty }));
    const reward = Math.round(items.reduce((s, it) => s + C.TIERS[it.tier - 1].value * it.qty, 0) * 1.5);
    return { items, reward };
  }

  genOrders(full = false) {
    const band = this.currentBand();
    const offsets = [Math.max(1, band - 1), band, band, Math.min(6, band + 1)];
    const need = full ? C.ORDER_SLOTS : C.ORDER_SLOTS;
    this.orders = [];
    for (let i = 0; i < need; i++) this.orders.push(this._makeOrder(offsets[i % offsets.length]));
  }

  canDeliver(idx) {
    const o = this.orders[idx]; if (!o) return false;
    return o.items.every(it => this.countTier(it.tier) >= it.qty);
  }

  deliver(idx) {
    if (!this.canDeliver(idx)) return { ok: false };
    const o = this.orders[idx];
    // remove items
    for (const it of o.items) {
      let need = it.qty;
      for (let i = 0; i < this.grid.length && need > 0; i++) { if (this.grid[i] === it.tier) { this.grid[i] = 0; need--; } }
    }
    this.coins += o.reward;
    this.addXp(3);
    this.orders[idx] = this._makeOrder(this.currentBand());
    return { ok: true, reward: o.reward };
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
    return Math.floor(this.gardenRatePerHour() * hrs * 0.8);
  }

  collectGarden(now = Date.now(), mult = 1) {
    const amt = Math.floor(this.pendingOffline(now) * mult);
    this.coins += amt;
    this.lastCollect = now;
    return amt;
  }

  // ---- upgrades ---------------------------------------------------------
  upgradeCost(kind) {
    const lvl = kind === "autoProducer" ? this.upgrades.autoProducer + 1 : this.upgrades[kind];
    const base = { energyCap: 250, regen: 200, podLevel: 400, offlineCap: 300, autoProducer: 600 }[kind] || C.UPGRADE_BASE;
    return Math.round(base * Math.pow(C.UPGRADE_MULT, lvl - 1));
  }

  buyUpgrade(kind) {
    const cost = this.upgradeCost(kind);
    if (this.coins < cost) return { ok: false, reason: "coins", cost };
    if (kind === "podLevel" && this.upgrades.podLevel >= C.POD_MAX_LEVEL) return { ok: false, reason: "max" };
    this.coins -= cost;
    this.upgrades[kind] += 1;
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
      case "refreshOrders": this.genOrders(true); break;
      case "doubleHarvest": break; // handled by caller via collectGarden(mult=2)
    }
    return { ok: true };
  }

  // ---- serialisation ----------------------------------------------------
  serialize() {
    return {
      v: 1,
      savedAt: Date.now(),
      state: {
        grid: this.grid, coins: this.coins, energy: this.energy, xp: this.xp, level: this.level,
        bloom: this.bloom, plots: this.plots, upgrades: this.upgrades, podCharge: this.podCharge,
        podCooldownEnds: this.podCooldownEnds, lastCollect: this.lastCollect, orders: this.orders,
        daily: this.daily,
      },
    };
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
    });
    m.lastTick = Date.now();
    return m;
  }
}
