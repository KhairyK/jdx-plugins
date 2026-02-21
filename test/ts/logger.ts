export type LogLevel = "info" | "warn" | "error";

export function log(message: string, level: LogLevel = "info"): void {
  const prefix = `[${level.toUpperCase()}]`;
  console.log(`${prefix} ${message}`);
}