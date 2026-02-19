#!/usr/bin/env node

import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

/* =========================
   FIX __dirname
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   HELPER
========================= */
function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

/* =========================
   ARGUMENTS
========================= */
const args = process.argv.slice(2);
const cmd = args[0];
const sub = args[1];

/* =========================
   ENTRY
========================= */
if (!cmd) {
  help();
  process.exit(0);
}

switch (cmd) {
  case "build":
    build(sub);
    break;

  case "help":
  case "--help":
  case "-h":
    help();
    break;

  default:
    console.log("❌ Unknown command:", cmd);
    help();
}

/* =========================
   BUILD HANDLER
========================= */
function build(target) {
  if (!target) {
    console.log("❌ Missing build target");
    return;
  }

  if (target === "registry") {
    const script = path.join(__dirname, "../build/registry.js");

    console.log("🚀 Running Registry Build...\n");
    run(`node "${script}"`);
    return;
  }

  console.log("❌ Unknown build target:", target);
}

/* =========================
   HELP
========================= */
function help() {
  console.log(`
JDX CLI v1.0 🚀

Usage:
  jdx <command>

Commands:
  build registry    Build tarballs + metadata

Example:
  jdx build registry
`);
}
