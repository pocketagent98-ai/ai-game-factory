// Platform adapter.
// On a real portal build this wraps the Playgama Bridge SDK (one integration for
// Poki / CrazyGames / GameDistribution / Yandex / Playgama). All ads are served by
// the platform - this game never ships its own ad network.
//
// This standalone build keeps the SAME interface but uses localStorage for saves and
// simulates ad completion, so the game is fully playable on GitHub Pages today.
// To go live: replace the bodies below with bridge.* calls (see docs/TECH_REQUIREMENTS.md).
export const Platform = {
  name: "standalone",
  _bridge: null,

  async init() {
    // Real build:
    //   await bridge.initialize();
    //   this._bridge = bridge;
    //   this.name = bridge.platform.id;
  },

  getSave() {
    try { return JSON.parse(localStorage.getItem("mb_save") || "null"); } catch { return null; }
  },
  setSave(env) {
    try { localStorage.setItem("mb_save", JSON.stringify(env)); } catch { /* incognito */ }
  },

  sendMessage(_m) { /* bridge.platform.sendMessage(m) */ },

  isRewardedSupported() { return true; },
  // Returns true when the player completed the ad. Standalone: simulated.
  async showRewarded() { return true; },
  async showInterstitial() { /* bridge.advertisement.showInterstitial() */ },

  getLang() { return (navigator.language || "en").slice(0, 2); },
  isAudioEnabled() { return true; },
};
