import fs from "fs";
import path from "path";
import https from "https";
import * as tar from "tar";
import crypto from "crypto";

const REGISTRY = "https://jdx-registry.opendnf.cloud/";

/* =============================
   FETCH JSON
============================= */
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = "";

      if (res.statusCode !== 200) {
        reject(new Error(`Registry error: ${res.statusCode}`));
        return;
      }

      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(new Error("Invalid JSON from registry"));
        }
      });
    }).on("error", reject);
  });
}

/* =============================
   DOWNLOAD FILE
============================= */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`Download failed: ${res.statusCode}`));
        return;
      }

      res.pipe(file);

      file.on("finish", () => file.close(resolve));
      file.on("error", err => {
        file.close();
        fs.existsSync(dest) && fs.unlinkSync(dest);
        reject(err);
      });
    }).on("error", err => {
      fs.existsSync(dest) && fs.unlinkSync(dest);
      reject(err);
    });
  });
}

/* =============================
   CHECK INTEGRITY (SHA-512)
============================= */
function checkIntegrity(file, expected) {
  if (!expected) return true; // skip if no integrity provided

  const hash = crypto.createHash("sha512");
  const data = fs.readFileSync(file);
  hash.update(data);
  const digest = hash.digest("base64");

  if (digest !== expected) {
    throw new Error("Integrity check failed! (SHA-512)");
  }

  return true;
}

/* =============================
   VERSION RESOLVER
============================= */
function resolveVersion(meta, version) {
  if (!version || version === "latest") return meta.latest;
  if (!meta.versions[version]) throw new Error("Version not found");
  return version;
}

/* =============================
   INSTALL PACKAGE
============================= */
export async function installPackage(pkgSpec) {
  if (!pkgSpec || !pkgSpec.includes("@")) {
    throw new Error("Invalid package spec. Use 'name@version' or 'name@latest'");
  }

  const [name, ver] = pkgSpec.split("@");

  console.log("📡 Fetching registry...");
  const index = await fetchJSON(`${REGISTRY}/index.json`);

  if (!index[name]) throw new Error("Package not found in registry");

  const meta = index[name];
  const version = resolveVersion(meta, ver);
  const tgz = meta.versions[version];
  const integrity = meta.integrity || null;

  console.log(`📦 Installing ${name}@${version}...`);

  const tmp = `.jdx-${name}.tgz`;
  await download(`${REGISTRY}/${tgz}`, tmp);

  // optional integrity check
  checkIntegrity(tmp, integrity);

  const dest = path.join("jdx_plugins", name);
  fs.mkdirSync(dest, { recursive: true });

  await tar.x({
    file: tmp,
    cwd: dest,
    strip: 1
  });

  fs.unlinkSync(tmp);

  console.log("✔ Installed!");
}

/* =============================
   REMOVE PACKAGE
============================= */
export function removePackage(name) {
  if (!name) throw new Error("Provide package name to remove");

  const dir = path.join("jdx_plugins", name);

  if (!fs.existsSync(dir)) throw new Error("Package not installed");

  // Node >=14
  if (fs.rmSync) {
    fs.rmSync(dir, { recursive: true, force: true });
  } else {
    // fallback Node <14
    fs.rmdirSync(dir, { recursive: true });
  }

  console.log("✔ Removed!");
}