// Platform adapter — Playgama Bridge integration with a safe standalone fallback.
//
// ADS ARE OFF BY DEFAULT so the game always boots instantly and works offline for
// playtesting. When you publish, load the Playgama Bridge SDK in index.html (a script
// tag is provided, commented out, in the built file) — Bridge is ONE integration that
// covers Poki, CrazyGames, GameDistribution, Yandex, Playgama and 25+ platforms: it
// loads the platform's native SDK and routes calls. See PUBLISHING.md.
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
    // The game must ALWAYS boot, even if a portal SDK is missing or hangs.
    // Ads are OFF by default for local playtesting; a portal (or a script tag)
    // can inject window.bridge and it will be used automatically.
    let b = (typeof window !== "undefined") && window.bridge;
    // If the Bridge SDK is loaded via a <script id="pg-bridge"> tag (ads ON), give it a
    // moment to arrive — but never block the boot for more than ~1.8 s.
    if (!b) b = await this._waitForBridge(1200);
    if (b) {
      try {
        await Promise.race([
          b.initialize(),
          new Promise((_, rej) => setTimeout(() => rej(new Error("bridge init timeout")), 1500)),
        ]);
        this.bridge = b;
        try { this.name = b.platform.id; } catch (e) {}
        try {
          b.platform.on(b.EVENT_NAME.PAUSE_STATE_CHANGED, (paused) => { if (this.onPause) this.onPause(paused); });
          b.platform.on(b.EVENT_NAME.AUDIO_STATE_CHANGED, (enabled) => { if (this.onAudio) this.onAudio(enabled); });
        } catch (e) {}
      } catch (e) { this.bridge = null; }
    }
    // preload the save, but never block the boot for more than ~600 ms
    try {
      await Promise.race([
        this._preload(),
        new Promise((r) => setTimeout(r, 600)),
      ]);
    } catch (e) {}
  },

  // Wait for the async Bridge SDK script (id="pg-bridge") to finish loading, so ads
  // work on a portal but the game still boots instantly offline / on file://.
  _waitForBridge(ms) {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.bridge) return resolve(window.bridge);
      // offline (or a browser with no network): don't stall the boot, go straight to standalone
      if (typeof navigator !== "undefined" && navigator.onLine === false) return resolve(null);
      if (typeof document === "undefined" || !document.getElementById) return resolve(null);
      const el = document.getElementById("pg-bridge");
      if (!el) return resolve(null);
      let done = false;
      const finish = () => { if (!done) { done = true; resolve((typeof window !== "undefined" && window.bridge) || null); } };
      try { el.addEventListener("load", finish); el.addEventListener("error", finish); } catch (e) {}
      setTimeout(finish, ms);
    });
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
