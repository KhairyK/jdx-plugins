import fs from "fs";
import path from "path";
import https from "https";
import * as tar from "tar";

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
      res.on("end", () => resolve(JSON.parse(data)));
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
      res.pipe(file);

      file.on("finish", () => {
        file.close(resolve);
      });
    }).on("error", reject);
  });
}

/* =============================
   VERSION RESOLVER
============================= */
function resolveVersion(meta, version) {
  if (!version || version === "latest") {
    return meta.latest;
  }

  if (!meta.versions[version]) {
    throw new Error("Version not found");
  }

  return version;
}

/* =============================
   INSTALL PACKAGE
============================= */
export async function installPackage(pkgSpec) {
  const [name, ver] = pkgSpec.split("@");

  console.log("📡 Fetching registry...");

  const index = await fetchJSON(`${REGISTRY}/index.json`);

  if (!index[name]) {
    throw new Error("Package not found");
  }

  const meta = index[name];
  const version = resolveVersion(meta, ver);

  const tgz = meta.versions[version];
  const url = `${REGISTRY}/${tgz}`;
  const integrity = info.intergrity;

  console.log(`📦 Installing ${name}@${version}`);

  const tmp = `.jdx-${name}.tgz`;

  await download(url, tmp);

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
  const dir = path.join("jdx_plugins", name);

  if (!fs.existsSync(dir)) {
    throw new Error("Package not installed");
  }

  fs.rmSync(dir, { recursive: true });

  console.log("✔ Removed!");
}
