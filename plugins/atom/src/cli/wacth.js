import chokidar from "chokidar";
import pc from "picocolors";

export function watchCommand(program) {
  program
    .command("watch")
    .description("Watch files and auto transform")
    .argument("<pattern>", "Glob pattern")
    .action((pattern) => {
      console.log(pc.cyan("👀 Watching:"), pattern);

      const watcher = chokidar.watch(pattern, {
        ignoreInitial: false
      });

      watcher.on("change", (file) => {
        console.log(pc.yellow("Changed:"), file);
      });
    });
}