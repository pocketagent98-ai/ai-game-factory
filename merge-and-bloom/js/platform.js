// Platform adapter — Playgama Bridge integration with a safe standalone fallback.
//
// On a real portal the Playgama Bridge SDK is loaded in index.html
// (<script src="https://bridge.playgama.com/v2/stable/playgama-bridge.js"></script>).
// Bridge is ONE integration that covers Poki, CrazyGames, GameDistribution, Yandex,
// Playgama and 25+ platforms: it loads the platform's native SDK and routes calls.
//
// ALL ADS ARE SERVED BY THE PLATFORM. This game never ships its own ad network.
// If Bridge is not present (local dev, file://, GitHub Pages), we fall back to
// localStorage saves and simulated ads so the game is fully playable.
export const Platform = {
  name: "standalone",
  bridge: null,
  _cache: null,
  onPause: null,
  onAudio: null,

  async init() {
    const b = (typeof window !== "undefined") && window.bridge;
    if (b) {
      try {
        await b.initialize();
        this.bridge = b;
        try { this.name = b.platform.id; } catch (e) {}
        // one central handler for pause + audio (fires for ads, tab switches, etc.)
        try {
          b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED, (paused) => { if (this.onPause) this.onPause(paused); });
          b.platform.on(b.EVENT_NAME.AUDIO_STATE_CHANGED, (enabled) => { if (this.onAudio) this.onAudio(enabled); });
        } catch (e) {}
      } catch (e) { this.bridge = null; }
    }
    await this._preload();
  },

  // ---- saves ------------------------------------------------------------
  async _preload() {
    let env = null;
    if (this.bridge) {
      try {
        const data = await this.bridge.storage.get(["mb_save"]);
        if (data && data[0]) env = JSON.parse(data[0]);
      } catch (e) {}
    }
    if (!env) {
      try { env = JSON.parse(localStorage.getItem("mb_save") || "null"); } catch (e) {}
    }
    this._cache = env;
  },
  getSave() { return this._cache; },
  setSave(env) {
    this._cache = env;
    const s = JSON.stringify(env);
    if (this.bridge) { try { this.bridge.storage.set(["mb_save"], [s]); } catch (e) {} }
    try { localStorage.setItem("mb_save", s); } catch (e) {}
  },

  // ---- lifecycle --------------------------------------------------------
  sendMessage(m) { if (this.bridge) { try { this.bridge.platform.sendMessage(m); } catch (e) {} } },
  gameplayStart() { this.sendMessage("level_started"); },
  gameplayStop() { this.sendMessage("level_paused"); },

  // ---- ads (all served by the platform) --------------------------------
  isRewardedSupported() {
    if (!this.bridge) return true;                     // standalone: simulated
    try { return this.bridge.advertisement.isRewardedSupported(); } catch (e) { return true; }
  },
  async showRewarded() {
    if (!this.bridge) return true;                     // standalone: simulated reward
    try {
      const ad = this.bridge.advertisement;
      if (ad.isRewardedSupported && !ad.isRewardedSupported()) return false;
      await ad.showRewarded();
      return ad.rewardedState === "rewarded";
    } catch (e) { return false; }
  },
  async showInterstitial() {
    if (!this.bridge) return;
    try { await this.bridge.advertisement.showInterstitial(); } catch (e) {}
  },

  // ---- misc -------------------------------------------------------------
  getLang() {
    if (this.bridge) { try { return this.bridge.platform.language; } catch (e) {} }
    return (typeof navigator !== "undefined" && navigator.language || "en").slice(0, 2);
  },
  isAudioEnabled() { return true; },
};
