// Merge & Bloom — configuration (all tunables in one place)
export const GRID = 6;
export const MAX_TIER = 12;

export const TIERS = [
  { n: 1,  name: "Sprout",         value: 1,    color: "#8bc34a", glyph: "\u{1F331}" },
  { n: 2,  name: "Seedling",       value: 3,    color: "#7cb342", glyph: "\u{1F33F}" },
  { n: 3,  name: "Bud",            value: 8,    color: "#9ccc65", glyph: "\u{1F337}" },
  { n: 4,  name: "Bloom",          value: 20,   color: "#f06292", glyph: "\u{1F338}" },
  { n: 5,  name: "Berry Bush",     value: 50,   color: "#ba68c8", glyph: "\u{1FAD0}" },
  { n: 6,  name: "Fruit Tree",     value: 120,  color: "#ff7043", glyph: "\u{1F34E}" },
  { n: 7,  name: "Glow Vine",      value: 300,  color: "#ffca28", glyph: "\u{1F347}" },
  { n: 8,  name: "Crystal Bloom",  value: 750,  color: "#4dd0e1", glyph: "\u{1F48E}" },
  { n: 9,  name: "Golden Tree",    value: 1800, color: "#ffd54f", glyph: "\u{1F333}" },
  { n: 10, name: "Sunflower Crown",value: 3500, color: "#ffb300", glyph: "\u{1F33B}" },
  { n: 11, name: "Aurora Tree",    value: 4000, color: "#9575cd", glyph: "\u{2728}" },
  { n: 12, name: "World Tree",     value: 6000, color: "#26a69a", glyph: "\u{1F30D}" },
];

export const ENERGY_CAP_START       = 50;
export const ENERGY_REGEN_SECONDS   = 40;
export const ENERGY_REWARDED_AMOUNT = 25;
export const ENERGY_REWARDED_DAILY  = 5;

export const POD_CHARGE_START     = 30;
export const POD_COOLDOWN_SECONDS = 60;
export const POD_TABLES = {
  1: [[1, 1.0]],
  2: [[1, 0.90], [2, 0.10]],
  3: [[1, 0.80], [2, 0.18], [3, 0.02]],
  4: [[1, 0.70], [2, 0.24], [3, 0.05], [4, 0.01]],
  5: [[1, 0.60], [2, 0.28], [3, 0.09], [4, 0.03]],
};
export const POD_MAX_LEVEL = 5;

export const ORDER_SLOTS = 4;
export const BLOOM_PER_MERGE = 1;
export const BLOOM_THRESHOLD = 20;
export const OFFLINE_CAP_HOURS_START = 4;
export const OFFLINE_CAP_MAX = 24;

export const gardenRate = (tier) => 10 * Math.pow(2, Math.max(0, tier - 2));

export const UPGRADE_MULT = 1.55;

// -------- fun systems -----------------------------------------------------
export const COMBO_WINDOW_MS = 1600;   // merge again within this to keep the combo alive
export const COMBO_MAX = 8;            // combo multiplier cap
export const FRENZY_COMBO = 5;         // reaching this combo triggers Merge Frenzy
export const FRENZY_MS = 15000;        // frenzy duration
export const CHEST_INTERVAL_MS = 75000;// a reward chest appears about this often
export const CHEST_FIRST_MS = 20000;   // first chest soon after start

// Upgrade catalogue: key, title, sub, base cost, max level
export const UPGRADES = [
  { key: "energyCap",    title: "Energy capacity",     sub: "+25 max energy",          base: 250, max: 6 },
  { key: "regen",        title: "Energy regen",        sub: "faster refill",           base: 200, max: 6 },
  { key: "podLevel",     title: "Seed Pod",            sub: "better drops",            base: 400, max: POD_MAX_LEVEL },
  { key: "mergeValue",   title: "Merge value",         sub: "+15% coins per merge",    base: 350, max: 8 },
  { key: "comboWindow",  title: "Combo window",        sub: "+0.3s to chain combos",   base: 300, max: 6 },
  { key: "orderSlots",   title: "Order slots",         sub: "+1 visitor order",        base: 800, max: 3 },
  { key: "luckyDrop",    title: "Lucky drop",          sub: "+5% higher-tier spawns",  base: 500, max: 5 },
  { key: "gardenEff",    title: "Garden efficiency",   sub: "+10% offline output",     base: 450, max: 5 },
  { key: "offlineCap",   title: "Garden offline cap",  sub: "+4h offline",             base: 300, max: 6 },
  { key: "autoProducer", title: "Auto-Producer",       sub: "free plants over time",   base: 600, max: 7 },
];

// Reward chest contents (granted after the rewarded ad completes)
export const CHEST = {
  coinsMin: 120, coinsMax: 400,
  energy: 30,
  boosterChance: 0.35,
};

// Daily missions (rotate through this pool; 3 active per day)
export const MISSION_POOL = [
  { id: "merge25",  text: "Make 25 merges",            type: "merge", target: 25, reward: 300 },
  { id: "order5",   text: "Complete 5 visitor orders",  type: "order", target: 5,  reward: 400 },
  { id: "combo4",   text: "Reach a x4 combo",           type: "combo", target: 4,  reward: 350 },
  { id: "tier6",    text: "Merge up to a Fruit Tree",   type: "tier",  target: 6,  reward: 450 },
  { id: "chest2",   text: "Open 2 reward chests",       type: "chest", target: 2,  reward: 350 },
  { id: "spawn30",  text: "Tap the Seed Pod 30 times",  type: "spawn", target: 30, reward: 300 },
];

export const REWARDED = {
  energy:        { cap: ENERGY_REWARDED_DAILY, coinsAlt: 100 },
  cooldown:      { cap: 3, coinsAlt: 50 },
  luckyBloom:    { cap: 3, coinsAlt: 150 },
  refreshOrders: { cap: 2, coinsAlt: 40 },
  chest:         { cap: 6, coinsAlt: 250 },
  doubleHarvest: { cap: 1, coinsAlt: 0 },
};
