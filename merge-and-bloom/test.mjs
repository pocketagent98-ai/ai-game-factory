// Minimal unit tests for the pure model (run: node test.mjs)
import assert from "node:assert";
import { GameModel } from "./js/model.js";
import * as C from "./js/config.js";

let pass = 0, fail = 0;
function t(name, fn) { try { fn(); console.log("PASS " + name); pass++; } catch (e) { console.log("FAIL " + name + " :: " + e.message); fail++; } }

t("grid starts empty 6x6", () => { const m = new GameModel(); assert.equal(m.grid.length, 36); assert.ok(m.grid.every(v => v === 0)); });

t("tapPod spawns and costs 1 energy", () => {
  const m = new GameModel(); const e0 = m.energy;
  const r = m.tapPod(Date.now());
  assert.ok(r.ok); assert.equal(m.energy, e0 - 1); assert.equal(m.totalItems(), 1);
});

t("merge identical tiers -> next tier", () => {
  const m = new GameModel(); m.grid[0] = 3; m.grid[1] = 3;
  const r = m.tryMerge(0, 1);
  assert.ok(r.ok); assert.equal(m.grid[1], 4); assert.equal(m.grid[0], 0);
});

t("cannot merge different tiers", () => {
  const m = new GameModel(); m.grid[0] = 2; m.grid[1] = 3;
  assert.equal(m.tryMerge(0, 1).ok, false);
});

t("cannot merge at max tier", () => {
  const m = new GameModel(); m.grid[0] = C.MAX_TIER; m.grid[1] = C.MAX_TIER;
  assert.equal(m.tryMerge(0, 1).ok, false);
});

t("pod goes on cooldown after charge exhausted", () => {
  const m = new GameModel(); m.podCharge = 1; const now = Date.now();
  m.tapPod(now);
  assert.equal(m.podReady(now), false);
  assert.equal(m.podReady(now + C.POD_COOLDOWN_SECONDS * 1000 + 1), true);
});

t("energy regenerates over time", () => {
  const m = new GameModel(); m.energy = 0; m.lastTick = 0;
  m.regenEnergy(m.regenSeconds * 3 * 1000);
  assert.ok(m.energy >= 3);
});

t("order deliver consumes items and pays coins", () => {
  const m = new GameModel();
  // place exactly the band-1 order items
  const o = m.orders[0];
  for (const it of o.items) for (let k = 0; k < it.qty; k++) m.grid[m.emptyCells()[0]] = it.tier;
  assert.ok(m.canDeliver(0));
  const c0 = m.coins; const r = m.deliver(0);
  assert.ok(r.ok); assert.ok(m.coins > c0);
});

t("garden offline accrual is capped", () => {
  const m = new GameModel(); m.plots[0] = 6; m.lastCollect = 0;
  const huge = m.pendingOffline(m.offlineCapHours * 3600000 * 10);
  const capped = m.pendingOffline(m.offlineCapHours * 3600000);
  assert.equal(huge, capped);
});

t("offline accrual ignores negative/short gaps", () => {
  const m = new GameModel(); m.plots[0] = 6; m.lastCollect = 1000000;
  assert.equal(m.pendingOffline(999000), 0);
});

t("upgrade costs rise and are gated by coins", () => {
  const m = new GameModel(); m.coins = 0;
  assert.equal(m.buyUpgrade("energyCap").ok, false);
  m.coins = 100000; const c1 = m.upgradeCost("energyCap"); m.buyUpgrade("energyCap");
  const c2 = m.upgradeCost("energyCap");
  assert.ok(c2 > c1);
});

t("save round-trips", () => {
  const m = new GameModel(); m.grid[5] = 7; m.coins = 1234; m.level = 4;
  const env = JSON.parse(JSON.stringify(m.serialize()));
  const m2 = GameModel.deserialize(env);
  assert.equal(m2.grid[5], 7); assert.equal(m2.coins, 1234); assert.equal(m2.level, 4);
});

t("rewarded daily caps enforced", () => {
  const m = new GameModel(); const now = Date.now();
  let ok = 0; for (let i = 0; i < 10; i++) if (m.grantRewarded("energy", now).ok) ok++;
  assert.equal(ok, C.REWARDED.energy.cap);
});

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
