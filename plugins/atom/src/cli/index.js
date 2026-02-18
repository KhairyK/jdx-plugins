import { Command } from 'commander';
import pc from 'picocolors';
import { readFileSync } from 'fs';

const pkg = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url))
);

import { transformCommand } from './transform.js';
import { watchCommand } from './watch.js';

export function runCLI() {
  const program = new Command();

  program
    .name('atom')
    .description(pc.cyan('⚛️ ATOM — AMD → ESM Transformer'))
    .version(pkg.version);

  transformCommand(program);
  watchCommand(program);

  program.parse();
}
