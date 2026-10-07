// Headless smoke test with a tiny hand-rolled DOM (jsdom is unavailable in this sandbox).
import fs from "node:fs";
const html = fs.readFileSync(new URL("./index.html", import.meta.url), "utf8");
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
// regression guard: exactly one inline script; the ONLY external script allowed is the
// Playgama Bridge ad SDK (ads ON). Any other external script would break offline/file://.
const ext = html.match(/<script[^>]*\ssrc=[^>]*>/gi) || [];
if (ext.length > 1 || (ext.length === 1 && !/id="pg-bridge"/.test(ext[0]))) { console.log("FAIL: unexpected external <script src> present"); process.exit(1); }
if ((html.match(/<script>/g) || []).length !== 1) { console.log("FAIL: expected exactly one inline <script>"); process.exit(1); }
if (!/function init/.test(script)) { console.log("FAIL: game code missing from the inline script (premature </script>?)"); process.exit(1); }

let CALLS = { fill: 0, fillText: 0, stroke: 0, clearRect: 0 };
const ctx = new Proxy({}, { get: (t, p) => (p in CALLS ? (() => { CALLS[p]++; }) : (p in t ? t[p] : () => {})), set: (t, p, v) => { t[p] = v; return true; } });

class El {
  constructor(id = "") {
    this.id = id; this.style = {}; this._c = []; this._h = ""; this.textContent = ""; this.disabled = false;
    this.classList = { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) this._s.has(c) ? this._s.delete(c) : this._s.add(c); else f ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); } };
    this.clientWidth = 400; this.clientHeight = 400; this.parentElement = null;
  }
  set innerHTML(v) { this._h = v; this._c = []; }
  get innerHTML() { return this._h; }
  get children() { return this._c; }
  appendChild(c) { this._c.push(c); return c; }
  addEventListener(t, f) { (this._l = this._l || {}); (this._l[t] = this._l[t] || []).push(f); }
  click() { (this._l && this._l.click || []).forEach((f) => f({})); }
  querySelector() { return new El(); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 400 }; }
  getContext() { return ctx; }
}
const store = {};
const doc = { getElementById(id) { if (id === "pg-bridge") return null; return store[id] || (store[id] = new El(id)); }, createElement() { return new El(); }, addEventListener() {}, visibilityState: "visible", documentElement: { style: { setProperty() {} } } };
doc.getElementById("board").parentElement = new El();

const winL = {};
global.window = { addEventListener(t, f) { (winL[t] = winL[t] || []).push(f); }, devicePixelRatio: 1, innerWidth: 400, innerHeight: 800 };
global.document = doc; global.navigator = { language: "en", onLine: true };
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
let fr = 0; global.requestAnimationFrame = (cb) => { if (fr++ < 2) queueMicrotask(() => cb(0)); return fr; };
global.cancelAnimationFrame = () => {}; global.setInterval = () => 0; global.confirm = () => false;

let errs = []; const oe = console.error; console.error = (...a) => errs.push(a.join(" "));
try { new Function(script)(); } catch (e) { errs.push("script threw: " + (e.stack || e)); }
for (const fn of (winL["load"] || [])) { try { fn(); } catch (e) { errs.push("init threw: " + (e.stack || e)); } }
await new Promise(r => setTimeout(r, 30));
console.error = oe;

const n = (id) => doc.getElementById(id).children.length;
// exercise the Fortune Wheel: tap it and confirm the wheel canvas is drawn + buttons appear
const fillsBefore = CALLS.fill;
doc.getElementById("wheelBtn").click();
const wheelFills = CALLS.fill - fillsBefore;
const wheelBtns = n("wheelBtns");
console.log(`wheel draw calls=${wheelFills} wheel buttons=${wheelBtns}`);
// complete a full spin + claim on a fast-forward clock (the spin uses Date.now() + rAF)
const realNow = Date.now; let clock = realNow(); let fr2 = 0;
Date.now = () => (clock += 1500);
global.requestAnimationFrame = (cb) => { if (fr2++ < 300) queueMicrotask(() => cb(0)); return fr2; };
doc.getElementById("wheelBtns").children[0].click();          // tap "Free spin"
for (let i = 0; i < 60; i++) await new Promise((r) => setTimeout(r, 0));
const labels = doc.getElementById("wheelBtns").children.map((c) => c.textContent).join(" | ");
if (!/Claim/.test(labels)) { console.log("FAIL: no Claim button after spin -> " + labels); process.exit(1); }
const coinsBefore = Number(doc.getElementById("coins").textContent) || 0;
doc.getElementById("wheelBtns").children[0].click();          // tap "Claim"
Date.now = realNow;
const afterClaim = doc.getElementById("wheelBtns").children.map((c) => c.textContent).join(" | ");
if (/Claim/.test(afterClaim)) { console.log("FAIL: claim did not clear -> " + afterClaim); process.exit(1); }
console.log(`wheel claim flow OK (prize granted, coins ${coinsBefore} -> ${doc.getElementById("coins").textContent})`);
const orders = n("orders"), plots = n("gardenGrid"), ups = n("upgradesList"), missions = n("missionsList"), boosters = n("boosters");
console.log(`orders=${orders} plots=${plots} upgrades=${ups} missions=${missions} boosters=${boosters}`);
console.log("draw calls:", JSON.stringify(CALLS));
if (errs.length) { console.log("ERRORS:\n" + errs.join("\n")); process.exit(1); }
const campaign = n("campaignCard"), lb = n("leaderboardList"), themes = n("themesGrid"), ach = n("achievementsList");
console.log(`campaign=${campaign} leaderboard=${lb} themes=${themes} achievements=${ach}`);
if (orders !== 4 || plots !== 12 || ups !== 10 || missions !== 3 || boosters !== 3 || lb < 5 || themes !== 6 || ach !== 7) { console.log("FAIL: DOM not built as expected"); process.exit(1); }
if (CALLS.fill < 36) { console.log("FAIL: board did not draw its cells"); process.exit(1); }
if (wheelFills < 8 || wheelBtns < 3) { console.log("FAIL: fortune wheel did not draw/populate"); process.exit(1); }
console.log("SMOKE OK — v2 boots, draws the board, and builds orders/tasks/upgrades/boosters with no runtime errors");
process.exit(0);
