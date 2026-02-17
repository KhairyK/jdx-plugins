# 🚀 CTOM — CommonJS → ESM Converter CLI

![npm](https://img.shields.io/npm/v/@jdx-plugins/ctom?color=blue)
![downloads](https://img.shields.io/npm/dm/@jdx-plugins/ctom)
![license](https://img.shields.io/npm/l/@jdx-plugins/ctom)
![node](https://img.shields.io/node/v/@jdx-plugins/ctom)
![build](https://img.shields.io/badge/build-passing-brightgreen)

> ⚡ A powerful CLI tool to convert **CommonJS (CJS)** to **ES Modules (ESM)** automatically using Babel AST.

---

## ✨ Features

- 🧠 AST-based conversion (safe & accurate)
- 📦 Converts `require()` → `import`
- 🧩 Supports destructuring require
- 📤 Converts `module.exports` & `exports`
- ⚡ Ultra-fast file scanning with fast-glob
- 📁 Preserve folder structure
- 👀 Watch mode (auto convert on change)
- ⏭ Auto-skip files already using ESM
- ⚙️ Config file support

---

## 📦 Installation

### Install globally

```bash
npm install -g @jdx-plugins/ctom
# run
ctom
```

---

### Install locally

```bash
npm install @jdx-plugins/ctom
# run
npx ctom
```

---

## 🚀 Usage

### Convert single file

```bash
ctom app.js
```

---

### Convert folder recursively

```bash
ctom "src/**/*.js" -o dist
```

---

### Watch mode (auto convert on save)

```bash
ctom "src/**/*.js" -o dist --watch
```

---

### Print result only (no output file)

```bash
ctom app.js --stdout
```

---

## ⚙️ CLI Options

| Flag | Description |
|------|-------------|
| `-o, --output` | Output directory |
| `-w, --watch` | Watch mode |
| `--stdout` | Print result instead of writing file |

---

## 🧠 Supported Conversions

### Default require

```js
const fs = require("fs");
```

➡️

```js
import fs from "fs";
```

---

### Destructuring require

```js
const { readFile } = require("fs");
```

➡️

```js
import { readFile } from "fs";
```

---

### Named exports

```js
exports.foo = 123;
```

➡️

```js
export const foo = 123;
```

---

### Default export

```js
module.exports = value;
```

➡️

```js
export default value;
```

---

## ⏭ Auto Skip ESM

Files that already use `import` or `export` will be skipped automatically.

Example output:

```
⏭ Skipped (already ESM): src/app.js
```

---

## ⚙️ Configuration

You can customize behavior with a config file.

### Create:

```
ctom.config.js
```

### Example:

```js
module.exports = {
  skipESM: true
};
```

---

## 📁 Preserve Folder Structure

Input:

```
src/
 ├ utils/a.js
 └ core/b.js
```

Command:

```bash
ctom "src/**/*.js" -o dist
```

Output:

```
dist/
 ├ utils/a.mjs
 └ core/b.mjs
```

---

## 🛠️ Built With

- Babel Parser (AST)
- Fast-Glob
- Commander CLI
- Chokidar

---

## 🧩 Why CTOM?

Unlike regex-based converters, CTOM uses **AST parsing** which means:

✅ Accurate conversion  
✅ Safe for complex code  
✅ No false matches  
✅ Production-ready reliability  

---

## 📜 License

Apache 2.0 License

---

## ⭐ Support

If you find this project useful:

⭐ Star the repo  
🐛 Report issues  
🚀 Contribute improvements  

---

## 🔥 Future Roadmap

- Parallel processing mode
- Interactive CLI wizard
- Plugin system
- TypeScript support

---

**CTOM — Making CJS → ESM migration effortless ⚡**