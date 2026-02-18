# 🎧 JDX Sound Plugin

**JDX Sound Plugin** is an official plugin for **JuiceToast** that unlocks browser audio and provides a powerful, enterprise-grade sound engine for toast notifications.

It solves modern browser autoplay restrictions (like Chrome’s sound policy) and enables smooth, low-latency audio playback for your notifications.

---

## ✨ Features

### 🔓 Audio Unlock System
- Automatically bypasses browser autoplay restrictions
- Activates after first user interaction (click, touch, keypress)
- Works across modern browsers

---

### ⚡ Enterprise Sound Engine
- Web Audio API powered
- Ultra-low latency playback
- No overlapping audio lag

---

### 🎚️ Global Audio Controls
- Adjustable volume
- Mute / unmute toggle
- Programmatic sound control API

---

### 🚀 Sound Preloading
- Preloads audio buffers for instant playback
- Eliminates network delays

---

### 🛡️ Anti-Spam Protection
- Built-in cooldown system
- Prevents rapid sound overlap

---

## 📦 Installation

```bash
npm install @jdx-plugins/jt-sound-plugin
```

---

## 🧃 Requirements

This plugin requires:

```
juice-toast >= 1.3.2
```

Install if you haven't:

```bash
npm install juice-toast
```

---

## 🚀 Usage

### Basic Setup

```js
import juiceToast from "juice-toast";
import { JDXSoundEngine } from "@jdx-plugins/jt-sound-plugin";

const soundPlugin = JDXSoundEngine();

juiceToast.use(soundPlugin);
```

That's it — audio will automatically unlock after the user's first interaction.

---

## 🎛️ Custom Sound Configuration

```js
juiceToast.use(
  JDXSoundEngine({
    volume: 0.5,
    sounds: {
      success: "/audio/ding.mp3",
      error: "/audio/error.mp3",
      warning: "/audio/warn.mp3",
      info: "/audio/info.mp3"
    }
  })
);
```

---

## 🎚️ Engine API

You can access the engine directly:

```js
const plugin = JDXSoundEngine();
juiceToast.use(plugin);

const engine = plugin.engine;
```

### Available Controls

#### Mute Audio

```js
engine.mute();
```

#### Unmute Audio

```js
engine.unmute();
```

#### Toggle Mute

```js
engine.toggle();
```

#### Set Volume

```js
engine.setVolume(0.3);
```

#### Play Sound Manually

```js
engine.play("success");
```

---

## ⚙️ Configuration Options

| Option | Type | Default | Description |
|-------|------|--------|-------------|
| `volume` | number | `0.6` | Global audio volume |
| `cooldown` | number | `120` | Minimum delay between sound plays (ms) |
| `preload` | boolean | `true` | Preload audio buffers |
| `sounds` | object | built-in map | Sound URLs per toast type |

---

## 🧠 How It Works

1. Plugin listens for first user interaction.
2. Creates an unlocked Web Audio context.
3. Preloads audio buffers.
4. Plays sounds instantly when toast appears.

---

## 📁 Default Sound Types

Supported toast types:

- `success`
- `error`
- `warning`
- `info`

You can override any of them.

---

## 🏗️ Designed For

- JuiceToast plugin ecosystem
- Production web apps
- High-performance notification systems

---

## 🤝 Contributing

Pull requests are welcome.

If you want to add features:

- Sound themes
- Spatial audio
- Persistent user preferences

Feel free to open an issue.

---

## 📜 License

MIT License © OpenDN Foundation

---

## 🍹 Part of JDX Plugin Ecosystem

Official plugin collection for JuiceToast.