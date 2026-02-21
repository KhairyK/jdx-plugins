import fs from "fs";
import path from "path";
import https from "https";
import * as tar from "tar";
import crypto from "crypto";

/* =============================
   CONFIG
============================= */
const REGISTRY = "https://jdx-registry.opendnf.cloud";

/* =============================
   UTILITY: SAFE URL JOIN
============================= */
function joinURL(base, p) {
  if (typeof base !== "string" || typeof p !== "string") {
    throw new Error(`joinURL expects strings. Got base=${base}, path=${p}`);
  }
  return `${base.replace(/\/+$/, '')}/${p.replace(/^\/+/, '')}`;
}

/* =============================
   FETCH JSON FROM REGISTRY
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
   INSTALL PACKAGE DENGAN SAFE HASH
============================= */
export async function installPackage(pkgSpec) {
  if (!pkgSpec || !pkgSpec.includes("@")) {
    throw new Error("Invalid package spec. Use 'name@version' or 'name@latest'");
  }

  const [name, ver] = pkgSpec.split("@");

  console.log("📡 Fetching registry...");
  const index = await fetchJSON(joinURL(REGISTRY, "index.json"));

  if (!index[name]) throw new Error(`Package not found in registry: ${name}`);

  const meta = index[name];
  const version = !ver || ver === "latest" ? meta.latest : ver;

  if (!meta.versions[version]) throw new Error(`Version not found: ${version}`);

  // Ambil file & integrity dari object
  const versionMeta = meta.versions[version];
  let tgz, integrity;
  if (typeof versionMeta === "string") {
    tgz = versionMeta;
    integrity = meta.integrity || null;
  } else if (typeof versionMeta === "object" && versionMeta.file) {
    tgz = versionMeta.file;
    integrity = versionMeta.integrity || null;
  } else {
    throw new Error(`Invalid version entry for ${name}@${version}`);
  }

  const url = joinURL(REGISTRY, tgz);
  console.log(`📦 Installing ${name}@${version}...`);
  console.log("⬇ Downloading:", url);

  const tmp = `.jdx-${name}.tgz`;
  await download(url, tmp);

  // =============================
  // CHECK INTEGRITY
  // =============================
  if (integrity) {
    try {
      const hash = crypto.createHash("sha512");
      const data = fs.readFileSync(tmp);
      hash.update(data);
      const digest = hash.digest("base64");

      if (digest !== integrity.replace(/^sha512-/, '')) {
        console.warn(`❌ Integrity mismatch for ${name}@${version}`);
        console.warn(`   Expected: ${integrity}`);
        console.warn(`   Actual  : sha512-${digest}`);
      } else {
        console.log("✔ Integrity check passed!");
      }
    } catch (err) {
      console.warn("⚠ Failed to check integrity:", err.message);
    }
  } else {
    console.log("⚠ No integrity field, skipping check");
  }

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

  if (fs.rmSync) {
    fs.rmSync(dir, { recursive: true, force: true });
  } else {
    fs.rmdirSync(dir, { recursive: true });
  }

  console.log("✔ Removed!");
}

/* =============================
   EXPORT
============================= */
export default {
  installPackage,
  removePackage
};
