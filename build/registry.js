import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = "plugins";
const OUT_DIR = "../metadata";
const REGISTRY = "https://jdx-registry.opendnf.cloud/t/";
const TARBALL_DIR = "t";

function walk(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file === "package.json") {
      results.push(full);
    }
  }
  return results;
}

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

  const name = pkg.name.includes("/")
    ? pkg.name.split("/")[1]
    : pkg.name;

  const tarballName = `${name}.tgz`;
  const tarballPath = path.join(TARBALL_DIR, tarballName);
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

  return { pkg, name };
}

function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const files = walk(ROOT);

  for (const file of files) {
    const pkg = JSON.parse(fs.readFileSync(file, "utf8"));

    const { pkg: cleaned, name } = cleanPackage(pkg);

    const outPath = path.join(OUT_DIR, `${name}.json`);
    fs.writeFileSync(outPath, JSON.stringify(cleaned, null, 2));
    
    console.info("ℹ️ Info: Generating", name);
    console.log("✔ Generated:", outPath);
  }
}

main();