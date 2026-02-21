export function log(message, level = "info") {
    const prefix = `[${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
}