/**
 * Build the abilities compendium LevelDB from the generated seed entries.
 * Run with: node scripts/build-ability-pack.mjs
 */
import { ClassicLevel } from "classic-level";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { rmSync, mkdirSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packDir = resolve(__dirname, "../packs/abilities");

// Dynamic import of the seed file
const { ABILITY_COMPENDIUM_ENTRIES } = await import(
  "file://" + resolve(__dirname, "../module/seeds/generated/ability-seeds.mjs").replace(/\\/g, "/")
);

// Clear and recreate the pack directory
rmSync(packDir, { recursive: true, force: true });
mkdirSync(packDir, { recursive: true });

const db = new ClassicLevel(packDir, { valueEncoding: "json" });

let count = 0;
for (const entry of ABILITY_COMPENDIUM_ENTRIES) {
  const id = entry.flags?.["pok-role-system"]?.seedId ?? `ability-${count}`;
  // Foundry VTT uses !items!<id> as the key format for Item compendium packs
  const doc = {
    ...entry,
    _id: id,
    _stats: {
      coreVersion: "13",
      systemId: "pok-role-system",
      systemVersion: "0.22.2",
      createdTime: Date.now(),
      modifiedTime: Date.now(),
      lastModifiedBy: "build-script"
    }
  };
  await db.put(`!items!${id}`, doc);
  count++;
}

await db.close();
console.log(`Built abilities pack with ${count} entries in ${packDir}`);
