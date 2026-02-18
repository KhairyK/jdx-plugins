import { Command } from "commander";
import pc from "picocolors";
import pkg from "../../package.json" assert { type: "json" };

import { transformCommand } from "./commands/transform.js";
import { watchCommand } from "./commands/watch.js";

export function runCLI() {
  const program = new Command();

  program
    .name("atom")
    .description(pc.cyan("⚛️ ATOM — AMD → ESM Transformer"))
    .version(pkg.version);

  transformCommand(program);
  watchCommand(program);

  program.parse();
}