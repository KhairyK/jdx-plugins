#!/usr/bin/env node

import fs from "fs";
import path from "path";
import fg from "fast-glob";
import chokidar from "chokidar";
import ora from "ora";
import chalk from "chalk";
import cliProgress from "cli-progress";
import { Command } from "commander";
import { convert } from "../lib/converter.js";

const program = new Command();

/* ================= CONFIG LOADER ================= */

function loadConfig() {
  const configPath = path.resolve("ctom.config.js");
  if (fs.existsSync(configPath)) {
    return require(configPath);
  }
  return {};
}

/* ================= ESM DETECTOR ================= */

function isESM(code) {
  return (
    code.includes("import ") ||
    code.includes("export ")
  );
}

/* ================= FILE PROCESSOR ================= */

function processFile(file, pattern, options, config) {
  const code = fs.readFileSync(file, "utf8");

  if (config.skipESM !== false && isESM(code)) {
    console.log(chalk.gray("⏭ Skipped (already ESM):"), file);
    return;
  }

  const result = convert(code);

  const baseDir = pattern.includes("/")
    ? pattern.split("*")[0]
    : ".";

  let outputFile;

  if (options.output) {
    const relative = path.relative(baseDir, file);
    const newPath = relative.replace(".js", ".mjs");

    outputFile = path.join(options.output, newPath);
    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  } else {
    outputFile = file.replace(".js", ".mjs");
  }

  fs.writeFileSync(outputFile, result);
}

/* ================= CLI ================= */

program
  .name("ctom")
  .description("Convert CommonJS to ESM")
  .version("1.0.0");

program
  .argument("[pattern]", "file glob pattern")
  .option("-o, --output <dir>", "output directory")
  .option("-w, --watch", "watch mode")
  .option("--stdout", "print result only")
  .action(async (pattern, options) => {
    const config = loadConfig();

    const spinner = ora(chalk.cyan("🔍 Scanning files...")).start();

    const files = await fg(pattern);

    if (!files.length) {
      spinner.fail(chalk.red("No files matched"));
      return;
    }

    spinner.succeed(chalk.green(`✔ Found ${files.length} files`));

    const bar = new cliProgress.SingleBar({
      format:
        "Converting |{bar}| {percentage}% || {value}/{total} files"
    });

    bar.start(files.length, 0);

    for (const file of files) {
      const code = fs.readFileSync(file, "utf8");

      if (options.stdout) {
        console.log(convert(code));
      } else {
        processFile(file, pattern, options, config);
      }

      bar.increment();
    }

    bar.stop();

    console.log(chalk.magenta("✨ Conversion complete!"));

    /* ================= WATCH MODE ================= */

    if (options.watch) {
      console.log(chalk.blue("\n👀 Watching for changes...\n"));

      const watcher = chokidar.watch(pattern, {
        ignoreInitial: true
      });

      watcher.on("change", file => {
        const spin = ora(
          chalk.yellow(`Updating ${file}`)
        ).start();

        processFile(file, pattern, options, config);

        spin.succeed(chalk.green(`Updated ${file}`));
      });

      watcher.on("add", file => {
        const spin = ora(
          chalk.yellow(`New file ${file}`)
        ).start();

        processFile(file, pattern, options, config);

        spin.succeed(chalk.green(`Converted ${file}`));
      });
    }
  });

program.parse();