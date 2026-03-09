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

async function writePackSource(packName, documentType, entries) {
  const sourceDir = path.join(TEMP_SOURCE_ROOT, packName);
  await fs.rm(sourceDir, { recursive: true, force: true });
  await fs.mkdir(sourceDir, { recursive: true });

  let index = 0;
  for (const raw of entries) {
    index += 1;
    const entry = JSON.parse(JSON.stringify(raw));
    const seedId = entry.flags?.["pok-role-module"]?.seedId;
    entry._id = entry._id || makeStableId(seedId, `${packName}-${index}`);
    const collectionName = getCollectionName(documentType);
    if (!collectionName) {
      throw new Error(`Unsupported document type "${documentType}" for pack "${packName}"`);
    }
    entry._key = entry._key || `!${collectionName}!${entry._id}`;

    if (documentType === "Actor" && !entry.type) {
      entry.type = "pokemon";
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
    const sourceDir = await writePackSource(packName, packType, entries);
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
