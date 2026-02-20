# 🧩 JavaScript Development eXtensions (JDX) Store

> Official plugin registry and ecosystem hub for the **JDX development toolchain**.

![license](https://img.shields.io/badge/license-BSD--2--Clause-blue)
![registry](https://img.shields.io/badge/registry-JDX-orange)
![status](https://img.shields.io/badge/status-active-success)
![maintained](https://img.shields.io/badge/maintained-yes-green)
![plugins](https://img.shields.io/badge/plugins-5-brightgreen)
![version](https://img.shields.io/badge/version-1.0.0-blue)
![GitHub stars](https://img.shields.io/github/stars/KhairyK/jdx-plugins?style=social)
![GitHub forks](https://img.shields.io/github/forks/KhairyK/jdx-plugins?style=social)
![GitHub issues](https://img.shields.io/github/issues/KhairyK/jdx-plugins)
![GitHub last commit](https://img.shields.io/github/last-commit/KhairyK/jdx-plugins)

---

## 📦 About

**JDX Plugins Store** is a centralized registry designed to host, distribute, and manage plugins for the **JDX ecosystem**.

It serves as the official hub where developers can discover, publish, and maintain extensions that enhance the JDX toolchain.

---

## ✨ Features

- 📚 Centralized plugin registry
- ⚡ Fast metadata lookup
- 🔍 Plugin search and filtering
- 📦 Version management system
- 🛡️ Secure plugin distribution
- 🧩 Seamless integration with JDX CLI tools

---

## 🎯 Purpose

This project exists to make the JDX ecosystem:

- More modular
- More scalable
- Easier to extend
- Simpler to maintain long-term

It provides a structured system for managing third-party extensions while keeping the ecosystem lightweight and developer-friendly.

---

## 🏗️ How It Works

The store maintains a structured index of plugin metadata, including:

- Plugin name
- Version information
- Description
- Author details
- Download source
- Compatibility data

JDX CLI tools can fetch this registry index to install plugins automatically.

---

## 🚀 Usage

### For Users

Install plugins using the JDX CLI:

```bash
jdx-plugins install <plugin-name>
```

Example:

```bash
jdx-plugins install stringfyr
```

> [!NOTE]
> This CLI is currently under active development. Features, commands, and behaviors may change as the JDX ecosystem evolves.

> [!WARNING]
> Not recommended for production use yet.

---

### For Developers

To publish a plugin, submit its metadata to the store registry.

Typical plugin structure:

```
my-plugin/
 ├ package.json
 ├ index.js
 └ README.md
```

---

## 📁 Repository Structure

```
jdx-plugins
├── build/          # Registry generator
├── cli/            # CLI commands
├── metadata/       # Plugin metadata index
├── plugins/        # Source of official plugins
├── utils/          # Internal tooling core
├── t/              # Cached plugin tarballs
└── runner.sh       # Automation script
```

---

## 🧠 Philosophy

JDX Plugins Store is built on these core principles:

- Open contribution
- Lightweight tooling
- Developer freedom
- Sustainable ecosystem growth
- Simplicity over complexity

---

## 📜 License

This project is licensed under the **BSD 2-Clause License**.

---

## ❤️ Maintainer

Created and maintained by:

**Sholehuddin Khairy** and contributors from the open-source community.

---

## ⭐ Contributing

Contributions are welcome!

You can help by:

- Adding new plugins
- Improving documentation
- Reporting issues
- Suggesting new features
- Enhancing security and stability

---

## 🔮 Future Plans

Planned improvements for the ecosystem:

- ⭐ Plugin rating and review system
- 📦 Dependency resolution engine
- 🛡️ Verified publisher badges
- 🌐 Web-based plugin browser
- 🔍 Automatic compatibility checks
- ⚡ Faster registry indexing

---

## ⚡ Vision

JDX aims to evolve into a complete plugin ecosystem that empowers developers to build, share, and extend tools with minimal friction.

---

**JDX Plugins Store — Powering extensible development ecosystems.**
