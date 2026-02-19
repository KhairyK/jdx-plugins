/**
 * JDX Registry Builder
 * Auto pack tarball + generate metadata JSON
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

/* =========================
   FIX __dirname (ESM)
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   PATH CONFIG
========================= */
const PLUGINS_DIR = path.join(__dirname, "../plugins");
const METADATA_DIR = path.join(__dirname, "../metadata");
const TARBALL_DIR = path.join(__dirname, "../t");

const REGISTRY = "https://jdx-registry.opendnf.cloud/t/";

/* =========================
   HELPERS
========================= */

function sha512File(filePath) {
  const data = fs.readFileSync(filePath);

  return {
    integrity:
      "sha512-" +
      crypto.createHash("sha512").update(data).digest("base64"),
    shasum: crypto.createHash("sha1").update(data).digest("hex")
  };
}

function fixLicense(license) {
  if (!license) return license;
  return license.replace(/-/g, " ");
}

function cleanPackage(pkg) {
  delete pkg.keywords;
  delete pkg.scripts;
  delete pkg.devDependencies;
  delete pkg.engines;
  delete pkg.type;

  pkg.license = fixLicense(pkg.license);

  return pkg;
}

/* =========================
   AUTO PACK TARBALL
========================= */
function packPlugin(dir) {
  const pkgFile = path.join(dir, "package.json");
  if (!fs.existsSync(pkgFile)) return null;

  const pkg = JSON.parse(fs.readFileSync(pkgFile));
  const name = pkg.name.includes("/")
    ? pkg.name.split("/")[1]
    : pkg.name;

  console.log(`📦 Packing ${name}...`);

  const result = execSync("npm pack", {
    cwd: dir,
    encoding: "utf8"
  }).trim();

  const src = path.join(dir, result);
  const dest = path.join(TARBALL_DIR, `${name}.tgz`);

  fs.renameSync(src, dest);

  console.log(`✔ Packed: ${name}.tgz`);

  return { pkg, name, tarballPath: dest };
}

/* =========================
   GENERATE METADATA
========================= */
function generateMetadata(pkg, name, tarballPath) {
  pkg = cleanPackage(pkg);

  const tarballName = `${name}.tgz`;
  const tarballURL = `${REGISTRY}${tarballName}`;

  pkg.download = tarballURL;

  if (fs.existsSync(tarballPath)) {
    const hashes = sha512File(tarballPath);

    pkg.dist = {
      tarball: tarballURL,
      shasum: hashes.shasum,
      integrity: hashes.integrity
    };
  }

  const outPath = path.join(METADATA_DIR, `${name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(pkg, null, 2));

  console.log(`📝 Metadata: ${name}.json`);
}

/* =========================
   MAIN
========================= */
function main() {
  console.log("🚀 JDX Registry Builder Starting...\n");

  // Ensure folders
  if (!fs.existsSync(METADATA_DIR)) fs.mkdirSync(METADATA_DIR, { recursive: true });
  if (!fs.existsSync(TARBALL_DIR)) fs.mkdirSync(TARBALL_DIR, { recursive: true });

  const plugins = fs.readdirSync(PLUGINS_DIR);

  let count = 0;

  for (const dirName of plugins) {
    const full = path.join(PLUGINS_DIR, dirName);
    const stat = fs.statSync(full);

    if (!stat.isDirectory()) continue;

    const packed = packPlugin(full);
    if (!packed) continue;

    generateMetadata(packed.pkg, packed.name, packed.tarballPath);
    count++;
  }

  console.log("\n✅ Done!");
  console.log(`📦 Total plugins processed: ${count}`);
}

main();
