// Merge & Bloom — configuration (all tunables in one place)
export const GRID = 6;                 // 6x6 board
export const MAX_TIER = 12;

// 12-tier merge chain: name, coin value, colour, glyph
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
export const ENERGY_REGEN_SECONDS   = 40;   // +1 energy every 40s (web-friendly)
export const ENERGY_REWARDED_AMOUNT = 25;
export const ENERGY_REWARDED_DAILY  = 3;

export const POD_CHARGE_START     = 30;     // taps before cooldown
export const POD_COOLDOWN_SECONDS = 60;

// Pod drop tables: [ [tier, probability], ... ]
export const POD_TABLES = {
  1: [[1, 1.0]],
  2: [[1, 0.90], [2, 0.10]],
  3: [[1, 0.80], [2, 0.18], [3, 0.02]],
  4: [[1, 0.70], [2, 0.24], [3, 0.05], [4, 0.01]],
};
export const POD_MAX_LEVEL = 4;

export const ORDER_SLOTS = 4;
export const BLOOM_PER_MERGE = 1;
export const BLOOM_THRESHOLD = 20;          // merges to unlock the next plot
export const OFFLINE_CAP_HOURS_START = 4;
export const OFFLINE_CAP_MAX = 24;

// Garden: coins per hour for a planted item of a given tier
export const gardenRate = (tier) => 10 * Math.pow(2, Math.max(0, tier - 2));

export const UPGRADE_BASE = 250;
export const UPGRADE_MULT = 1.55;           // cost = base * mult^(level-1)

export const REWARDED = {
  energy:      { cap: ENERGY_REWARDED_DAILY, coinsAlt: 100 },
  cooldown:    { cap: 2, coinsAlt: 50 },
  luckyBloom:  { cap: 2, coinsAlt: 150 },
  refreshOrders: { cap: 1, coinsAlt: 40 },
  doubleHarvest: { cap: 1, coinsAlt: 0 },
};
