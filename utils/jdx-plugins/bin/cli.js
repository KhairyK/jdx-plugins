#!/usr/bin/env node

import { installPackage, removePackage } from "../core/installer.js";
import fs from "fs";
import { execSync } from "child_process";

/* =========================
   ARGS
========================= */
const args = process.argv.slice(2);
const cmd = args[0];
const pkg = args[1];

switch (cmd) {
  case "add":
    await add(pkg);
    break;

  case "rm":
    rm(pkg);
    break;

  case "update":
    await add(pkg);
    break;

  case "publish":
    publish();
    break;

  default:
    help();
}

/* =========================
   COMMANDS
========================= */

async function add(pkg) {
  if (!pkg) return console.log("Missing package");

  try {
    await installPackage(pkg);
  } catch (err) {
    console.log("❌", err.message);
  }
}

function rm(pkg) {
  if (!pkg) return console.log("Missing package");

  try {
    removePackage(pkg);
  } catch (err) {
    console.log("❌", err.message);
  }
}

function publish() {
  if (!fs.existsSync("package.json")) {
    return console.log("No package.json");
  }

  const tgz = execSync("npm pack", { encoding: "utf8" }).trim();

  console.log("Packed:", tgz);
  console.info("ℹ️ INFO: Go to https://github.com/KhairyK/jdx-plugins/issues to submit a plugins submission.");
}

/* =========================
   HELP
========================= */
function help() {
  console.log(`
  𝐖𝐞𝐥𝐜𝐨𝐦𝐞 𝐓𝐨 𝐉𝐃𝐗 𝐏𝐥𝐮𝐠𝐢𝐧𝐬! 
  ________________________

Commands:
  add <pkg>         Install plugin
  rm <pkg>          Remove plugin
  update <pkg>      Update plugin
  publish           Pack plugin

Supports:
  jdx-plugins add stringfyr
  jdx-plugins add stringfyr@1.2.0
`);
}
