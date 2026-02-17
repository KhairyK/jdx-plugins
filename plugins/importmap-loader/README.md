# 🚀 Import Map Loader

![npm](https://img.shields.io/npm/v/importmap-loader)
![license](https://img.shields.io/npm/l/importmap-loader)
![downloads](https://img.shields.io/npm/dw/importmap-loader)
![size](https://img.shields.io/bundlephobia/min/importmap-loader)

A tiny utility to **load, merge, cache, and extend Import Maps** at runtime.

Supports:

- ✅ Multiple import maps
- ✅ LocalStorage caching
- ✅ Versioned cache invalidation
- ✅ Wildcard (`*`) import support
- ✅ Automatic DOM injection

---

# 📦 Installation

### Using NPM

```bash
npm install importmap-loader
```

### Or use directly in browser

```html
<script type="module" src="./loadImportMaps.js"></script>
```

---

# 🚀 Quick Start

## 1. Import the loader

```js
import { loadImportMaps } from "importmap-loader";
```

---

## 2. Load your import maps

```js
await loadImportMaps({
  maps: [
    "/importmap.json",
    "/vendor.importmap.json"
  ],
  version: "1"
});
```

---

# 📂 Example Import Map

### `importmap.json`

```json
{
  "imports": {
    "react": "https://esm.sh/react",
    "lib/*": "/js/lib/*"
  }
}
```

---

# ✨ Wildcard Support

You can define wildcard paths:

```json
{
  "imports": {
    "utils/*": "/src/utils/*"
  }
}
```

Then this works:

```js
import { helper } from "utils/helper.js";
```

Automatically resolves to:

```
/src/utils/helper.js
```

---

# 💾 Cache System

Import maps are cached inside:

```
localStorage
```

Key format:

```
__importmap_cache__:<url>:<version>
```

---

## 🔄 Force Cache Refresh

Just bump the version:

```js
await loadImportMaps({
  maps: ["/importmap.json"],
  version: "2"
});
```

---

# ⚙️ How It Works

1. Fetch all import map files
2. Merge imports & scopes
3. Resolve wildcard rules
4. Inject `<script type="importmap">`
5. Cache results

---

# 🧩 Full Example

```html
<script type="module">
  import { loadImportMaps } from "./loadImportMaps.js";

  await loadImportMaps({
    maps: ["/importmap.json"]
  });

  const { default: app } = await import("app/main.js");
</script>
```

---

# ⚠️ Important Notes

- Must be called **before any module imports**
- Requires browser with Import Maps support
- Works best in modern Chromium browsers

---

# 📜 License

Apache 2.0 License

---

# ❤️ Why This Exists

Managing multiple import maps and cache invalidation manually is painful.

This loader makes it:

- simple
- fast
- scalable
- production-ready

---

# ⭐ Contributing

PRs are welcome!

If you find a bug or want a feature:

1. Open an issue
2. Fork the repo
3. Submit a PR 🚀
