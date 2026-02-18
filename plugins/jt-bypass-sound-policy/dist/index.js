/**
 * JDX Sound Engine Plugin
 * Enterprise Audio System for JuiceToast
 */

export function JDXSoundEngine(options = {}) {
  const config = {
    volume: 0.6,
    cooldown: 120,
    preload: true,

    sounds: {
      success: "/sounds/success.mp3",
      error: "/sounds/error.mp3",
      info: "/sounds/info.mp3",
      warning: "/sounds/warning.mp3",
    },

    ...options,
  };

  let ctx = null;
  let unlocked = false;
  let muted = false;
  let lastPlay = {};
  const buffers = {};

  /* ================= AUDIO UNLOCK ================= */

  function unlock() {
    if (unlocked) return;

    ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();

    unlocked = true;

    if (config.preload) preloadAll();

    events.forEach((e) => document.removeEventListener(e, unlock));
  }

  const events = ["click", "touchstart", "keydown"];
  events.forEach((e) =>
    document.addEventListener(e, unlock, { passive: true }),
  );

  /* ================= PRELOAD ================= */

  async function preloadAll() {
    for (const [type, url] of Object.entries(config.sounds)) {
      if (!url) continue;

      try {
        const res = await fetch(url);
        const arr = await res.arrayBuffer();
        buffers[type] = await ctx.decodeAudioData(arr);
      } catch {}
    }
  }

  /* ================= PLAY ================= */

  function play(type) {
    if (!unlocked || muted) return;

    const now = Date.now();
    if (lastPlay[type] && now - lastPlay[type] < config.cooldown) return;

    lastPlay[type] = now;

    const buffer = buffers[type];
    if (!buffer) return;

    const source = ctx.createBufferSource();
    const gain = ctx.createGain();

    gain.gain.value = config.volume;

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  }

  /* ================= PUBLIC API ================= */

  const engine = {
    mute() {
      muted = true;
    },

    unmute() {
      muted = false;
    },

    toggle() {
      muted = !muted;
    },

    setVolume(v) {
      config.volume = Math.max(0, Math.min(1, v));
    },

    play,
  };

  /* ================= PLUGIN HOOK ================= */

  const plugin = ({ type }) => {
    play(type);
  };

  plugin.engine = engine;

  return plugin;
}
