#!/usr/bin/env node
import fg from "fast-glob";
import fs from "fs/promises";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const ROOT = process.argv[2] || process.cwd();

const CONCURRENCY = 20;

let totalFound = 0;

function detectCommonJS(ast) {
  let found = [];

  traverse.default(ast, {
    CallExpression(path) {
      if (path.node.callee.name === "require") {
        found.push("require()");
      }
    },

    AssignmentExpression(path) {
      const left = path.node.left;

      if (
        left.type === "MemberExpression" &&
        left.object.name === "module" &&
        left.property.name === "exports"
      ) {
        found.push("module.exports");
      }

      if (
        left.type === "MemberExpression" &&
        left.object.name === "exports"
      ) {
        found.push("exports.*");
      }
    }
  });

  return [...new Set(found)];
}

async function scanFile(file) {
  try {
    const code = await fs.readFile(file, "utf8");

    const ast = parse(code, {
      sourceType: "unambiguous",
      plugins: ["jsx", "typescript"]
    });

    const found = detectCommonJS(ast);

    if (found.length) {
      totalFound++;
      console.log("⚠️  CommonJS detected!");
      console.log("📄", file);
      console.log("🔎", found.join(", "));
      console.log("──────────────────────");
    }
  } catch {
    // ignore parse errors silently
  }
}

async function run() {
  console.log("🔍 Scanning:", ROOT);

  const files = await fg(
    ["**/*.{js,cjs,mjs,ts}"],
    {
      cwd: ROOT,
      ignore: ["**/node_modules/**"],
      absolute: true
    }
  );

  // Parallel pool
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const i = index++;
      await scanFile(files[i]);
    }
  }

  await Promise.all(
    Array.from({ length: CONCURRENCY }, worker)
  );

  console.log("✅ Scan complete");
  console.log("📊 Files scanned:", files.length);
  console.log("⚠️ CommonJS found:", totalFound);
}

run();