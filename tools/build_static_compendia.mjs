import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import {
  STATIC_ACTOR_SEEDS_BY_PACK,
  STATIC_ITEM_SEEDS_BY_PACK
} from "../module/seeds/compendium-seed.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(ROOT_DIR, "system.json");
const TEMP_SOURCE_ROOT = path.join(ROOT_DIR, ".tmp-compendium-src");
const PACKS_ROOT = path.join(ROOT_DIR, "packs");
const LEGACY_SYSTEM_IDS = Object.freeze(["pok-role-module", "pok-role-system"]);

function makeStableId(seedId, fallback) {
  const source = `${seedId ?? fallback ?? "seed"}`;
  return crypto.createHash("sha1").update(source).digest("hex").slice(0, 16);
}

function sanitizeFilename(value) {
  return `${value ?? "entry"}`
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .slice(0, 80) || "entry";
}

function getSeedEntries(packName, documentType) {
  if (documentType === "Item") return STATIC_ITEM_SEEDS_BY_PACK[packName] ?? [];
  if (documentType === "Actor") return STATIC_ACTOR_SEEDS_BY_PACK[packName] ?? [];
  return [];
}

function getCollectionName(documentType) {
  if (documentType === "Item") return "items";
  if (documentType === "Actor") return "actors";
  return null;
}

function normalizeSystemAssetPathString(value, packageId) {
  if (typeof value !== "string") return value;
  return value.replace(/systems\/[^/]+\/assets/gi, `systems/${packageId}/assets`);
}

function normalizeEntryValue(value, packageId) {
  if (typeof value === "string") {
    return normalizeSystemAssetPathString(value, packageId);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeEntryValue(entry, packageId));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entryValue]) => [key, normalizeEntryValue(entryValue, packageId)])
    );
  }

  return value;
}

function normalizeEntryFlags(flags, packageId) {
  const normalizedFlags = flags && typeof flags === "object"
    ? JSON.parse(JSON.stringify(flags))
    : {};

  const flagKeys = new Set([packageId, ...LEGACY_SYSTEM_IDS]);
  const seedId = [...flagKeys]
    .map((flagKey) => normalizedFlags?.[flagKey]?.seedId)
    .find((value) => typeof value === "string" && value.length > 0);

  if (seedId) {
    normalizedFlags[packageId] = {
      ...(normalizedFlags[packageId] ?? {}),
      seedId
    };
  }

  for (const legacyId of LEGACY_SYSTEM_IDS) {
    if (legacyId !== packageId) {
      delete normalizedFlags[legacyId];
    }
  }

  return normalizedFlags;
}

function getSeedIdFromFlags(flags, packageId) {
  const flagKeys = [packageId, ...LEGACY_SYSTEM_IDS];
  for (const key of flagKeys) {
    const seedId = flags?.[key]?.seedId;
    if (typeof seedId === "string" && seedId.length > 0) {
      return seedId;
    }
  }
  return undefined;
}

function ensureEmbeddedDocumentKeys(document, collectionName, fallbackPrefix) {
  if (!Array.isArray(document)) return;

  let index = 0;
  for (const embedded of document) {
    if (!embedded || typeof embedded !== "object") continue;
    index += 1;

    const seedId = embedded.flags?.seedId ?? embedded.flags?.["pok-role-system"]?.seedId;
    embedded._id = embedded._id || makeStableId(seedId, `${fallbackPrefix}-${collectionName}-${index}`);
    embedded._key = embedded._key || `!${collectionName}!${embedded._id}`;

    if (Array.isArray(embedded.effects)) {
      ensureEmbeddedDocumentKeys(embedded.effects, "effects", `${fallbackPrefix}-${embedded._id}`);
    }
  }
}

async function writePackSource(packName, documentType, entries, packageId) {
  const sourceDir = path.join(TEMP_SOURCE_ROOT, packName);
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.mkdir(sourceDir, { recursive: true });

  let index = 0;
  for (const raw of entries) {
    index += 1;
    const entry = normalizeEntryValue(JSON.parse(JSON.stringify(raw)), packageId);
    entry.flags = normalizeEntryFlags(entry.flags, packageId);
    const seedId = getSeedIdFromFlags(entry.flags, packageId);
    entry._id = entry._id || makeStableId(seedId, `${packName}-${index}`);
    const collectionName = getCollectionName(documentType);
    if (!collectionName) {
      throw new Error(`Unsupported document type "${documentType}" for pack "${packName}"`);
    }
    entry._key = entry._key || `!${collectionName}!${entry._id}`;

    if (documentType === "Actor" && !entry.type) {
      entry.type = "pokemon";
    }

    if (documentType === "Actor") {
      ensureEmbeddedDocumentKeys(entry.items, "items", entry._id);
      ensureEmbeddedDocumentKeys(entry.effects, "effects", entry._id);
    }

    const filename = `${String(index).padStart(4, "0")}-${sanitizeFilename(entry.name)}-${entry._id}.json`;
    const filepath = path.join(sourceDir, filename);
    await fs.writeFile(filepath, JSON.stringify(entry, null, 2), "utf8");
  }

  return sourceDir;
}

function resolvePackSubpath(packPath) {
  const normalized = `${packPath ?? ""}`.replaceAll("\\", "/").replace(/^\.?\//, "");
  if (normalized.startsWith("packs/")) return normalized.slice("packs/".length);
  return normalized;
}

function runPackCompile({ packageId, packPath, sourceDir }) {
  const compendiumName = resolvePackSubpath(packPath);
  if (!compendiumName) {
    throw new Error(`Cannot resolve compendium path for "${packPath}"`);
  }

  const destinationDir = path.join(PACKS_ROOT, compendiumName);
  const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";
  const args = [
    "--yes",
    "@foundryvtt/foundryvtt-cli",
    "package",
    "pack",
    "--id",
    packageId,
    "--type",
    "System",
    "--compendiumName",
    compendiumName,
    "--inputDirectory",
    sourceDir,
    "--outputDirectory",
    PACKS_ROOT,
    "--verbose"
  ];

  return { destinationDir, npxCommand, args };
}

async function main() {
  const manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  const packageId = manifest.id;
  const packs = Array.isArray(manifest.packs) ? manifest.packs : [];

  if (process.env.KEEP_COMPENDIUM_SRC !== "1") {
    await fs.rm(TEMP_SOURCE_ROOT, { recursive: true, force: true });
  }
  await fs.mkdir(TEMP_SOURCE_ROOT, { recursive: true });

  const summaries = [];

  for (const pack of packs) {
    const packName = pack.name;
    const packType = pack.type;
    const entries = getSeedEntries(packName, packType);
    const sourceDir = await writePackSource(packName, packType, entries, packageId);
    const { destinationDir, npxCommand, args } = runPackCompile({
      packageId,
      packPath: pack.path,
      sourceDir
    });

    await fs.rm(destinationDir, { recursive: true, force: true });
    const env = {
      ...process.env,
      PATH: `${process.env.PATH ?? ""}${path.delimiter}C:\\Program Files\\nodejs`
    };
    const result = process.platform === "win32"
      ? spawnSync(
        "node",
        [
          "C:\\Program Files\\nodejs\\node_modules\\npm\\bin\\npx-cli.js",
          ...args
        ],
        { cwd: ROOT_DIR, stdio: "inherit", env }
      )
      : spawnSync(npxCommand, args, {
        cwd: ROOT_DIR,
        stdio: "inherit",
        env
      });

    if (result.error) {
      throw result.error;
    }
    if (result.status !== 0) {
      throw new Error(`Failed compiling pack "${packName}"`);
    }

    summaries.push({ packName, packType, count: entries.length, destinationDir });
  }

  if (process.env.KEEP_COMPENDIUM_SRC !== "1") {
    await fs.rm(TEMP_SOURCE_ROOT, { recursive: true, force: true });
  }

  const total = summaries.reduce((sum, row) => sum + row.count, 0);
  console.log(`Compiled ${summaries.length} packs with ${total} total entries.`);
  for (const row of summaries) {
    console.log(` - ${row.packName} (${row.packType}): ${row.count}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
