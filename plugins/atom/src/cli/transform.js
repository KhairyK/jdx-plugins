import pc from 'picocolors';
import fg from 'fast-glob';
import ora from 'ora';
import fs from 'fs/promises';
import { transformAMD } from '../core/transformAMD.js';
import { detectAMD } from '../core/detectAMD.js';
import { analyzeAMD } from '../core/analyzeAMD.js';

export function transformCommand(program) {
  program
    .command('transform')
    .description('Transform AMD modules to ESM')
    .argument('<pattern>', 'Glob pattern of files')
    .action(async (pattern) => {
      const spinner = ora('Scanning files...').start();

      const files = await fg(pattern);

      spinner.succeed(`${files.length} files found`);

      for (const file of files) {
        const code = await fs.readFile(file, 'utf8');

        const output = transformAMD(code);

        if (output !== code) {
          await fs.writeFile(file, output);
          console.log(pc.green('✔ Transformed:'), file);
        } else {
          console.log(pc.dim('Skip:'), file);
        }
      }

      console.log(pc.green('\n✔ Transform complete'));
    });
}
