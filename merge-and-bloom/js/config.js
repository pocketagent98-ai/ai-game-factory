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
  coins:         { cap: 6, coinsAlt: 0 },   // "free coins" ad (shop placement)
  wheel:         { cap: 3, coinsAlt: 120 },
  streak:        { cap: 1, coinsAlt: 0 },   // ad to double the daily-streak reward
  cooldown:      { cap: 3, coinsAlt: 50 },
  luckyBloom:    { cap: 3, coinsAlt: 150 },
  refreshOrders: { cap: 2, coinsAlt: 40 },
  chest:         { cap: 6, coinsAlt: 250 },
  doubleHarvest: { cap: 1, coinsAlt: 0 },
  box:           { cap: 3, coinsAlt: 80 },   // mystery-box extra opens
};

// ================= v3: campaign (levels + bosses), themes, leaderboard, =====
// ================= streak, fortune wheel, double-reward offers =============

// --- Campaign: numbered levels; every 5th is a BOSS with a harder goal ---
export const BOSS_EVERY = 5;
export function levelGoal(n) {
  if (n % BOSS_EVERY === 0) return { type: "tier", target: Math.min(12, 4 + Math.floor(n / BOSS_EVERY)), boss: true };
  const cycle = n % 3;
  if (cycle === 1) return { type: "merge", target: 10 + n * 5, boss: false };
  if (cycle === 2) return { type: "order", target: 2 + Math.floor(n / 2), boss: false };
  return { type: "spawn", target: 15 + n * 4, boss: false };
}
export const LEVEL_REWARD_BASE = 150;

// --- Garden themes (cosmetic; unlocked by campaign level, bought with coins) ---
export const THEMES = [
  { id: "meadow",   name: "Meadow",   req: 1,  cost: 0,    bg1: "#0f3d2e", bg2: "#124b39", panel: "#173e33", accent: "#7ef0b0" },
  { id: "sunset",   name: "Sunset",   req: 3,  cost: 600,  bg1: "#3a1d2e", bg2: "#5a2a3a", panel: "#4a2333", accent: "#ffb37e" },
  { id: "ocean",    name: "Ocean",    req: 5,  cost: 1200, bg1: "#0d2b3e", bg2: "#12415a", panel: "#123448", accent: "#7ecbff" },
  { id: "lavender", name: "Lavender", req: 8,  cost: 2000, bg1: "#241a3a", bg2: "#352a55", panel: "#2b2145", accent: "#c9a7ff" },
  { id: "autumn",   name: "Autumn",   req: 11, cost: 3200, bg1: "#3a2410", bg2: "#5a3a18", panel: "#4a2f14", accent: "#ffcf7e" },
  { id: "midnight", name: "Midnight", req: 15, cost: 5000, bg1: "#10131f", bg2: "#1b2033", panel: "#171c2c", accent: "#9fb8ff" },
];

// --- Daily login streak (7-day cycle) ---
export const STREAK_REWARDS = [120, 180, 250, 320, 400, 500, 800];

// --- Fortune wheel (decide the segment first, then animate to it) ---
export const WHEEL = [
  { label: "120",     coins: 120,  rarity: "common",  glyph: "\u{1F4B0}" },
  { label: "25\u26A1", energy: 25,  rarity: "common",  glyph: "\u26A1" },
  { label: "250",     coins: 250,  rarity: "common",  glyph: "\u{1F4B0}" },
  { label: "Shovel",  booster: "shovel", rarity: "rare", glyph: "\u{1FAA3}" },
  { label: "400",     coins: 400,  rarity: "rare",    glyph: "\u{1F4B0}" },
  { label: "Mixer",   booster: "mixer",  rarity: "rare", glyph: "\u{1F500}" },
  { label: "700",     coins: 700,  rarity: "epic",    glyph: "\u{1F48E}" },
  { label: "JACKPOT", coins: 1500, rarity: "jackpot", glyph: "\u{1F3C6}" },
];
export const WHEEL_COLORS = ["#2ea36b", "#3a5c8a", "#b8860b", "#7a4b8a", "#2e8ba3", "#a35c3a", "#8a3a5c", "#c9a227"];
export const WHEEL_FREE_PER_DAY = 1;
export const WHEEL_AD_SPINS = 3;
export const WHEEL_FREE_COOLDOWN_MS = 5 * 60 * 1000;   // after the free spin, a new free one every 5 min

// --- Mystery Box (a surprise prize; free once a day, more via ad/coins) ---
export const MYSTERY_BOX = { coinsAlt: 80 };
export const BOX_PRIZES = [
  { id: "coins",   label: "Coins",      glyph: "\u{1F4B0}", coins: 250,  weight: 34 },
  { id: "energy",  label: "Energy",     glyph: "\u26A1",     energy: 30,  weight: 24 },
  { id: "booster", label: "Booster",    glyph: "\u{1F381}", booster: "random", weight: 20 },
  { id: "big",     label: "Big coins",  glyph: "\u{1F48E}", coins: 800,  weight: 14 },
  { id: "mega",    label: "MEGA prize", glyph: "\u{1F3C6}", coins: 2000, energy: 50, weight: 8 },
];

// --- Achievements (unlock + reward) ---
export const ACHIEVEMENTS = [
  { id: "first",    text: "Make your first merge",        reward: 100, check: (m) => m.totalMerges >= 1 },
  { id: "combo5",   text: "Reach a x5 combo",             reward: 250, check: (m) => m.bestCombo >= 5 },
  { id: "tier8",    text: "Merge a Crystal Bloom (T8)",   reward: 400, check: (m) => m.maxTier >= 8 },
  { id: "orders25", text: "Complete 25 visitor orders",    reward: 350, check: (m) => m.totalOrders >= 25 },
  { id: "level5",   text: "Reach campaign level 5",       reward: 500, check: (m) => m.campaign.level >= 5 },
  { id: "wheel5",   text: "Spin the wheel 5 times",        reward: 300, check: (m) => m.wheel.spins >= 5 },
  { id: "gardener", text: "Plant 6 Garden plots",          reward: 450, check: (m) => m.plots.filter((t) => t > 0).length >= 6 },
];

// --- Leaderboard (local simulated rivals; a real build can use Bridge leaderboards) ---
export const LB_NAMES = ["BloomMaster", "Petal", "VineKing", "SunnyBee", "RootRunner", "Pixie", "Fern", "Mossy", "Tulip", "Willow", "Sage", "Clover"];

// --- Rush hour: a periodic double-coins window (keeps players playing) ---
export const RUSH_EVERY_MS = 6 * 60 * 1000;
export const RUSH_MS = 45 * 1000;
