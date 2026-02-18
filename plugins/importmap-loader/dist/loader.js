const CACHE_PREFIX = "__importmap_cache__";

function resolveWildcards(imports) {
  const resolved = {};

  for (const [key, value] of Object.entries(imports)) {
    if (key.includes("*")) {
      const prefix = key.replace("*", "");

      resolved[prefix] = {
        wildcard: true,
        target: value.replace("*", ""),
      };
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

function expandWildcardImports(imports) {
  const final = {};

  const wildcards = [];

  for (const [key, val] of Object.entries(imports)) {
    if (typeof val === "object" && val.wildcard) {
      wildcards.push({ prefix: key, target: val.target });
    } else {
      final[key] = val;
    }
  }

  // create runtime resolver proxy
  if (wildcards.length) {
    final.__wildcards = wildcards;
  }

  return final;
}

async function fetchWithCache(url, version = "1") {
  const key = `${CACHE_PREFIX}:${url}:${version}`;

  const cached = localStorage.getItem(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const res = await fetch(url);
  const json = await res.json();

  localStorage.setItem(key, JSON.stringify(json));

  return json;
}

async function loadImportMaps(options = {}) {
  const { maps = [], version = "1" } = options;

  const merged = { imports: {}, scopes: {} };

  for (const url of maps) {
    const map = await fetchWithCache(url, version);

    Object.assign(merged.imports, map.imports || {});
    Object.assign(merged.scopes, map.scopes || {});
  }

  // wildcard support
  const wildResolved = resolveWildcards(merged.imports);
  merged.imports = expandWildcardImports(wildResolved);

  const script = document.createElement("script");
  script.type = "importmap";
  script.textContent = JSON.stringify(merged, null, 2);

  document.currentScript.after(script);

  return merged;
}

export { loadImportMaps };
