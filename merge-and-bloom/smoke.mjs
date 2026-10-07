// Headless smoke test with a tiny hand-rolled DOM (jsdom is unavailable in this sandbox).
const ctx = new Proxy({}, { get: (t, p) => (p in t ? t[p] : () => {}), set: (t, p, v) => { t[p] = v; return true; } });

class El {
  constructor(id = "") {
    this.id = id; this.style = {}; this._children = []; this._html = "";
    this.textContent = ""; this.disabled = false;
    this.classList = { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined) this._s.has(c) ? this._s.delete(c) : this._s.add(c); else f ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); } };
    this.clientWidth = 400; this.clientHeight = 400; this.parentElement = null;
  }
  set innerHTML(v) { this._html = v; this._children = []; }
  get innerHTML() { return this._html; }
  get children() { return this._children; }
  appendChild(c) { this._children.push(c); return c; }
  addEventListener() {}
  querySelector() { return new El(); }
  getBoundingClientRect() { return { left: 0, top: 0, width: 400, height: 400 }; }
  getContext() { return ctx; }
}

const store = {};
const doc = {
  getElementById(id) { return store[id] || (store[id] = new El(id)); },
  createElement() { return new El(); },
  addEventListener() {},
  visibilityState: "visible",
};
doc.getElementById("board").parentElement = new El();

const winListeners = {};
global.window = {
  addEventListener(t, fn) { (winListeners[t] = winListeners[t] || []).push(fn); },
  devicePixelRatio: 1, innerWidth: 400, innerHeight: 800,
};
global.document = doc;
global.navigator = { language: "en" };
global.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; }, removeItem(k) { delete this._d[k]; } };
let __frames = 0; global.requestAnimationFrame = (cb) => { if (__frames++ < 2) queueMicrotask(() => cb(0)); return __frames; };
global.cancelAnimationFrame = () => {};
global.setInterval = () => 0;
global.confirm = () => false;

let errors = [];
const origErr = console.error; console.error = (...a) => { errors.push(a.join(" ")); };

await import("./js/game.js");
for (const fn of (winListeners["load"] || [])) { try { await fn(); } catch (e) { errors.push("init threw: " + (e && e.stack || e)); } }
await new Promise(r => setTimeout(r, 30));

console.error = origErr;

const orders = doc.getElementById("orders").children.length;
const plots = doc.getElementById("gardenGrid").children.length;
const ups = doc.getElementById("upgradesList").children.length;
const coins = doc.getElementById("coins").textContent;
const energy = doc.getElementById("energy").textContent;

console.log(`coins=${coins} energy=${energy} orders=${orders} plots=${plots} upgrades=${ups}`);
if (errors.length) { console.log("ERRORS:\n" + errors.join("\n")); process.exit(1); }
if (orders !== 4 || plots !== 12 || ups !== 5) { console.log("FAIL: DOM not built as expected"); process.exit(1); }
console.log("SMOKE OK — game boots and builds the UI with no runtime errors");
process.exit(0);
