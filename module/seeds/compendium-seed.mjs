import { POKROLE } from "../constants.mjs";
import { MOVE_COMPENDIUM_ENTRIES } from "./generated/move-seeds.mjs";
import { POKEDEX_COMPENDIUM_ENTRIES } from "./generated/pokedex-seeds.mjs";
import { ABILITY_COMPENDIUM_ENTRIES } from "./generated/ability-seeds.mjs";
import { POKEMON_ACTOR_COMPENDIUM_ENTRIES } from "./generated/pokemon-actor-seeds.mjs";
import { HELD_ITEM_COMPENDIUM_ENTRIES } from "./generated/held-item-seeds.mjs";

export const COMPENDIUM_SEED_VERSION = "2026-04-02-ability-dedup";
const VALID_ITEM_TYPES = new Set(["move", "gear", "ability", "weather", "status", "pokedex"]);
const VALID_ACTOR_TYPES = new Set(["trainer", "pokemon"]);
const LEGACY_SYSTEM_FLAG_KEYS = Object.freeze(["pok-role-module", "pok-role-system"]);
const RAW_ITEM_SPRITES_BASE = "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites";
const ITEM_SPRITE_FALLBACK_BY_FILENAME = Object.freeze({
  "old-pokeball.png": "pokeball.png",
  "dusk-ball.png": "pokeball.png",
  "fast-ball.png": "pokeball.png",
  "quick-ball.png": "greatball.png",
  "luxury-ball.png": "pokeball.png",
  "heavy-ball.png": "greatball.png",
  "heal-ball.png": "pokeball.png"
});

function getUpstreamItemSpritePath(filename, fallbackFilename = "pokeball.png") {
  const normalizedFilename = `${filename ?? ""}`.trim() || fallbackFilename;
  const resolvedFilename = ITEM_SPRITE_FALLBACK_BY_FILENAME[normalizedFilename] ?? normalizedFilename;
  return `${RAW_ITEM_SPRITES_BASE}/${resolvedFilename}`;
}

function getSystemRootPath() {
  return `${game.system?.path ?? `systems/${POKROLE.ID}`}`.replace(/\/+$/, "");
}

function normalizeSystemPathInString(value) {
  if (typeof value !== "string") return value;
  return value.replace(/^systems\/[^/]+/i, getSystemRootPath());
}

function normalizeSeedValue(value) {
  if (typeof value === "string") {
    return normalizeSystemPathInString(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeSeedValue(entry));
  }

  if (value && typeof value === "object") {
    const normalizedEntries = Object.entries(value).map(([key, entryValue]) => [
      key,
      normalizeSeedValue(entryValue)
    ]);
    return Object.fromEntries(normalizedEntries);
  }

  return value;
}

function normalizeSeedFlags(flags) {
  const normalizedFlags = flags && typeof flags === "object"
    ? foundry.utils.deepClone(flags)
    : {};

  const legacySeedId = [POKROLE.ID, ...LEGACY_SYSTEM_FLAG_KEYS]
    .map((flagKey) => normalizedFlags?.[flagKey]?.seedId)
    .find((seedId) => typeof seedId === "string" && seedId.length > 0);

  if (legacySeedId) {
    normalizedFlags[POKROLE.ID] = {
      ...(normalizedFlags[POKROLE.ID] ?? {}),
      seedId: legacySeedId
    };
  }

  for (const legacyKey of LEGACY_SYSTEM_FLAG_KEYS) {
    if (legacyKey !== POKROLE.ID) {
      delete normalizedFlags[legacyKey];
    }
  }

  return normalizedFlags;
}

function normalizeSeedDocument(seed) {
  const normalizedSeed = normalizeSeedValue(foundry.utils.deepClone(seed));
  normalizedSeed.flags = normalizeSeedFlags(normalizedSeed.flags);
  return normalizedSeed;
}

function baseStatus() {
  return {
    all: false,
    poison: false,
    sleep: false,
    burn: false,
    frozen: false,
    paralysis: false,
    confusion: false
  };
}

function makeGear(seedId, name, config = {}) {
  const {
    category = "other",
    pocket = "main",
    consumable = true,
    canUseInBattle = false,
    target = "pokemon",
    quantity = 1,
    units = { value: 0, max: 0 },
    heal = {},
    status = {},
    description = "",
    img = "icons/svg/item-bag.svg",
    pokeball = { sealPower: 0, specialEffect: "none", healsOnCapture: false },
    held = { passiveEffect: "", compatiblePokemon: "", isZCrystal: false, zMoveType: "none", isMegaStone: false, damageBonusType: "none", damageBonusDice: 0, damageBonusCategory: "", highCritical: false, highCriticalCategory: "", statBonuses: { strength: 0, dexterity: 0, vitality: 0, special: 0, insight: 0, def: 0, spDef: 0, initiative: 0 }, accuracyBonusDice: 0, accuracyPenaltyToAttacker: 0, reducedLowAccuracy: 0, superEffectiveBonusDice: 0, lifeOrb: false, loadedDice: false, metronomeBonus: false, focusSash: false, choiceType: "", choicePowerBonus: 0, choicePowerPenalty: 0, choiceInitiativeBonus: 0, choicePriorityBonus: 0, onEnterBattleStatus: "", immuneToStatReduction: false, destinyKnot: false, ejectButton: false, redCard: false, removeTypeImmunities: false, immuneToHazards: false, immuneToWeather: false, immuneToSpore: false, rockyHelmet: false, stickyBarb: false, powerHerb: false, throatSpray: false, weaknessPolicy: false, whiteHerb: false, flinchOnHit: false, endOfRoundHeal: 0, endOfRoundMaxUses: 0, endOfRoundDamage: 0 },
    vitamin = { stat: "none" },
    evolution = { compatiblePokemon: "" }
  } = config;

  return {
    name,
    type: "gear",
    img,
    system: {
      category,
      pocket,
      consumable,
      canUseInBattle,
      target,
      quantity,
      units: {
        value: Number(units.value ?? 0),
        max: Number(units.max ?? 0)
      },
      heal: {
        hp: Number(heal.hp ?? 0),
        lethal: Number(heal.lethal ?? 0),
        fullHp: Boolean(heal.fullHp ?? false),
        restoreAwareness: Boolean(heal.restoreAwareness ?? false),
        battleHealingCategory: `${heal.battleHealingCategory ?? "standard"}`.trim().toLowerCase()
      },
      status: {
        ...baseStatus(),
        ...status
      },
      description,
      pokeball: {
        sealPower: Number(pokeball.sealPower ?? 0),
        specialEffect: `${pokeball.specialEffect ?? "none"}`.trim().toLowerCase(),
        healsOnCapture: Boolean(pokeball.healsOnCapture ?? false)
      },
      held: {
        passiveEffect: `${held.passiveEffect ?? ""}`,
        compatiblePokemon: `${held.compatiblePokemon ?? ""}`,
        isZCrystal: Boolean(held.isZCrystal ?? false),
        zMoveType: `${held.zMoveType ?? "none"}`.trim().toLowerCase(),
        isMegaStone: Boolean(held.isMegaStone ?? false),
        damageBonusType: `${held.damageBonusType ?? "none"}`.trim().toLowerCase(),
        damageBonusDice: Number(held.damageBonusDice ?? 0),
        damageBonusCategory: `${held.damageBonusCategory ?? ""}`.trim().toLowerCase(),
        highCritical: Boolean(held.highCritical ?? false),
        highCriticalCategory: `${held.highCriticalCategory ?? ""}`.trim().toLowerCase(),
        statBonuses: {
          strength: Number(held.statBonuses?.strength ?? 0),
          dexterity: Number(held.statBonuses?.dexterity ?? 0),
          vitality: Number(held.statBonuses?.vitality ?? 0),
          special: Number(held.statBonuses?.special ?? 0),
          insight: Number(held.statBonuses?.insight ?? 0),
          def: Number(held.statBonuses?.def ?? 0),
          spDef: Number(held.statBonuses?.spDef ?? 0),
          initiative: Number(held.statBonuses?.initiative ?? 0)
        },
        accuracyBonusDice: Number(held.accuracyBonusDice ?? 0),
        accuracyPenaltyToAttacker: Number(held.accuracyPenaltyToAttacker ?? 0),
        reducedLowAccuracy: Number(held.reducedLowAccuracy ?? 0),
        superEffectiveBonusDice: Number(held.superEffectiveBonusDice ?? 0),
        lifeOrb: Boolean(held.lifeOrb ?? false),
        loadedDice: Boolean(held.loadedDice ?? false),
        metronomeBonus: Boolean(held.metronomeBonus ?? false),
        focusSash: Boolean(held.focusSash ?? false),
        choiceType: `${held.choiceType ?? ""}`.trim().toLowerCase(),
        choicePowerBonus: Number(held.choicePowerBonus ?? 0),
        choicePowerPenalty: Number(held.choicePowerPenalty ?? 0),
        choiceInitiativeBonus: Number(held.choiceInitiativeBonus ?? 0),
        choicePriorityBonus: Number(held.choicePriorityBonus ?? 0),
        onEnterBattleStatus: `${held.onEnterBattleStatus ?? ""}`.trim().toLowerCase(),
        immuneToStatReduction: Boolean(held.immuneToStatReduction ?? false),
        destinyKnot: Boolean(held.destinyKnot ?? false),
        ejectButton: Boolean(held.ejectButton ?? false),
        redCard: Boolean(held.redCard ?? false),
        removeTypeImmunities: Boolean(held.removeTypeImmunities ?? false),
        immuneToHazards: Boolean(held.immuneToHazards ?? false),
        immuneToWeather: Boolean(held.immuneToWeather ?? false),
        immuneToSpore: Boolean(held.immuneToSpore ?? false),
        rockyHelmet: Boolean(held.rockyHelmet ?? false),
        stickyBarb: Boolean(held.stickyBarb ?? false),
        powerHerb: Boolean(held.powerHerb ?? false),
        throatSpray: Boolean(held.throatSpray ?? false),
        weaknessPolicy: Boolean(held.weaknessPolicy ?? false),
        whiteHerb: Boolean(held.whiteHerb ?? false),
        flinchOnHit: Boolean(held.flinchOnHit ?? false),
        endOfRoundHeal: Number(held.endOfRoundHeal ?? 0),
        endOfRoundMaxUses: Number(held.endOfRoundMaxUses ?? 0),
        endOfRoundDamage: Number(held.endOfRoundDamage ?? 0)
      },
      vitamin: {
        stat: `${vitamin.stat ?? "none"}`.trim().toLowerCase()
      },
      evolution: {
        compatiblePokemon: `${evolution.compatiblePokemon ?? ""}`
      }
    },
    flags: {
      [POKROLE.ID]: {
        seedId
      }
    }
  };
}

function makePlayableItem(seedId, name, type, system, img = "icons/svg/book.svg") {
  return {
    name,
    type,
    img,
    system,
    flags: {
      [POKROLE.ID]: {
        seedId
      }
    }
  };
}

// ---------------------------------------------------------------------------
// ITEM SEEDS
// ---------------------------------------------------------------------------

const ITEM_SEEDS = Object.freeze({
  "trainer-items": [
    // --- Travel items ---
    makeGear("trainer-big-camping-tent", "Big Camping Tent", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/big-camping-tent.png",
      description: "A spacious tent for a group to spend a cozy night. Made with repellent materials against wild Pokemon."
    }),
    makeGear("trainer-small-camping-tent", "Small Camping Tent", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/small-camping-tent.png",
      description: "A comfortable space for one or two people. Made with repellent materials against wild Pokemon."
    }),
    makeGear("trainer-sleeping-bag", "Sleeping Bag", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/sleeping-bag.png",
      description: "Not too comfortable. You'll be able to sleep warm and dry but after a few nights your back may hurt."
    }),
    makeGear("trainer-camping-stove-cookware", "Camping Stove & Cookware", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/camping-stove.png",
      description: "Forget about hunting and eating roots like a savage. With this luxury set you'll always have a gourmet meal."
    }),
    makeGear("trainer-compass", "Compass", {
      category: "travel",
      consumable: false,
      img: "systems/pok-role-system/assets/items/gear/compass.png",
      target: "trainer",
      description: "A useful compass to point you in the right direction. Warning: Keep away from magnets."
    }),
    makeGear("trainer-regional-map", "Regional Map", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/regional-map.png",
      description: "A map with the marked routes, cities and Pokemon Centers of the region you are in."
    }),
    makeGear("trainer-mountain-bike", "Mountain Bike", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/mountain-bike.png",
      description: "You will travel twice as fast with this awesome all-terrain bike. Now at an insane price!"
    }),
    makeGear("trainer-inflatable-boat", "Inflatable Boat", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/inflatable-boat.png",
      description: "A small boat for two persons. Your Pokemon can pull you through the water or you can use the oars."
    }),
    makeGear("trainer-fishing-rod", "Fishing Rod", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/fishing-rod.png",
      description: "A fishing rod to catch Pokemon living underwater. Make sure to get the right bait or they won't bite."
    }),
    makeGear("trainer-saddle", "Saddle", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/saddle.png",
      description: "A secure seat to strap on a Pokemon large enough to carry you. Riding a Pokemon sure is exciting!"
    }),
    makeGear("trainer-sled", "Sled", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/sled.png",
      description: "Strap one large Pokemon or several small ones to pull you through snow, sand or any smooth surface!"
    }),
    makeGear("trainer-hang-glider", "Hang Glider", {
      category: "travel",
      consumable: false,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/hang-glider.png",
      description: "You will catch more Pokemon with honey than with vinegar. Wild Pokemon will come in hordes tracking it's scent, or you can enjoy it as a sweet treat!"
    }),

    // --- Key items ---
    makeGear("trainer-pokedex", "Pokedex", {
      category: "key",
      consumable: false,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/pokedex.png",
      description: "A digital encyclopedia with basic information about regional Pokemon. You may add your own research."
    }),
    makeGear("trainer-pokedex-upgrade", "Pokedex Upgrade", {
      category: "key",
      consumable: true,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/pokedex.png",
      description: "Upgrade your Pokedex with the information of the Pokemon on a new region."
    }),

    // --- Other items ---
    makeGear("trainer-meal-rations", "Meal Rations", {
      category: "other",
      consumable: true,
      target: "trainer",
      img: "systems/pok-role-system/assets/items/gear/meal-rations.png",
      description: "Nothing fancy but there's no need to travel on an empty stomach. One ration is enough for one day."
    }),
    makeGear("trainer-pokedoll", "PokeDoll", {
      category: "other",
      consumable: true,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/pokedolls.png",
      description: "Life-size decoy used to escape wild Pokemon. Some people like to collect them."
    }),
    makeGear("trainer-pokemon-repel", "Pokémon Repel", {
      category: "other",
      consumable: true,
      target: "trainer",
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/repel.png",
      description: "Most Pokemon won't come near you for about eight hours. The smell is now machine-washable."
    }),
    makeGear("trainer-pepper-spray-can", "Pepper Spray Can", {
      category: "other",
      consumable: true,
      target: "trainer",
      units: { value: 5, max: 5 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/smoke-bomb.png",
      description: "Scares away small Pokemon, but it may enrage the bigger ones. Good for 5 uses."
    }),
    makeGear("trainer-honey", "Honey", {
      category: "other",
      consumable: true,
      img: "systems/pok-role-system/assets/items/gear/honey.png",
      description: "You will catch more Pokemon with honey than with vinegar. Wild Pokemon will come in hordes tracking it's scent, or you can enjoy it as a sweet treat!"
    }),

    // --- Pokeball items ---
    makeGear("trainer-pokeball", "Pokeball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "none" },
      img: getUpstreamItemSpritePath("pokeball.png"),
      description: "Seal potency of 4 dice. A basic ball used for catching Pokemon and carrying heavy items."
    }),
    makeGear("trainer-greatball", "Greatball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 6, specialEffect: "none" },
      img: getUpstreamItemSpritePath("greatball.png"),
      description: "Seal potency of 6 dice. A sturdier barrier protects the seal so you have an easier time catching Pokemon."
    }),
    makeGear("trainer-ultraball", "Ultraball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 8, specialEffect: "none" },
      img: getUpstreamItemSpritePath("ultraball.png"),
      description: "Seal potency of 8 dice. The best seal in the market to ensure the catch of stronger Pokemon."
    }),
    makeGear("trainer-masterball", "Masterball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 0, specialEffect: "master" },
      img: getUpstreamItemSpritePath("masterball.png"),
      description: "It's been long rumored that a mighty pokeball with the strongest seal in existance is in development. But no one has truly seen it in action."
    }),
    makeGear("trainer-old-pokeball", "Old Pokeball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 3, specialEffect: "old" },
      img: "systems/pok-role-system/assets/items/pokeballs/old-poke-ball.png",
      description: "Rare. An old model of Pokeball, now a collector's item."
    }),
    makeGear("trainer-dusk-ball", "Dusk Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "dusk" },
      img: "systems/pok-role-system/assets/items/pokeballs/dusk-ball.png",
      description: "Uncommon. The seal on this ball gets stronger the darker it gets. Increase seal potency by 4 if you are in a cave and/or by 5 if it's night time."
    }),
    makeGear("trainer-fast-ball", "Fast Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 5, specialEffect: "fast" },
      img: "systems/pok-role-system/assets/items/pokeballs/fast-ball.png",
      description: "Uncommon. This seal potency is equal to the Dexterity Score of the Pokemon you are trying to catch. Up to 9 dice."
    }),
    makeGear("trainer-heavy-ball", "Heavy Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "heavy" },
      img: "systems/pok-role-system/assets/items/pokeballs/heavy-ball.png",
      description: "Uncommon. Increase seal potency by 1 for every 50 lbs/25kg, on the Pokemon you are trying to catch. Up to 5 dice may be added this way."
    }),
    makeGear("trainer-luxury-ball", "Luxury Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "luxury" },
      img: "systems/pok-role-system/assets/items/pokeballs/luxury-ball.png",
      description: "Very Rare. Any Pokemon caught with this ball will have their Happiness Score increased by 1."
    }),
    makeGear("trainer-quick-ball", "Quick Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 9, specialEffect: "quick" },
      img: "systems/pok-role-system/assets/items/pokeballs/quick-ball.png",
      description: "Uncommon. The seal on this ball works on a timer. Starting with a max potency of 9 dice on the first Round of battle and reducing the seal potency by 2 each Round that passes."
    }),
    makeGear("trainer-net-ball", "Sub Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "net" },
      img: "systems/pok-role-system/assets/items/pokeballs/sub-ball.png",
      description: "Uncommon. Normally has the seal potency of a Pokeball (4 dice), but against Water-type Pokemon it has the seal potency of a Greatball (6 dice)."
    }),
    makeGear("trainer-heal-ball", "Heal Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "heal", healsOnCapture: true },
      img: "systems/pok-role-system/assets/items/pokeballs/heal-ball.png",
      description: "Uncommon. Has the seal potency of a Pokeball (4 dice) but fully heals the Pokemon once captured."
    }),

    // --- Revive items ---
    makeGear("trainer-revive", "Revive", {
      category: "revive",
      canUseInBattle: true,
      target: "any",
      heal: { hp: 1, restoreAwareness: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/revive.png",
      description: "A small energy shard that brings a fainted Human or Pokemon back into conciousness and stabilizes all their wounds. Restore conciousness & 1 HP."
    }),
    makeGear("trainer-max-revive", "Max Revive", {
      category: "revive",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, restoreAwareness: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/max-revive.png",
      description: "A bigger rock shard with enhaced effects. Found raw in deep caves. Very rare to find. Not available in stores. Restore conciousness & Full HP."
    })
  ],

  "healing-items": [
    // --- Healing potions ---
    makeGear("heal-potion", "Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 2, max: 2 },
      heal: { hp: 1 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/potion.png",
      description: "A pocket sized spray potion to relieve the pain and heal bruises."
    }),
    makeGear("heal-super-potion", "Super Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 4, max: 4 },
      heal: { hp: 1 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/super-potion.png",
      description: "A regular can of concentrated formula spray. This potion can close open wounds and even heal a cracked bone."
    }),
    makeGear("heal-hyper-potion", "Hyper Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 14, max: 14 },
      heal: { hp: 1 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/hyper-potion.png",
      description: "Best value pack. It can be rationed for smaller injuries on the team, or used all at once on a serious wound."
    }),
    makeGear("heal-max-potion", "Max Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, battleHealingCategory: "unlimited" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/max-potion.png",
      description: "A single-use capsule of formula. The Pokemon won't be able to restore health further until the next day."
    }),
    makeGear("heal-full-restore", "Full Restore", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, battleHealingCategory: "unlimited" },
      status: { all: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/full-restore.png",
      description: "A single-use capsule of deluxe formula. The Pokemon won't be able to restore health further until the next day. Restore Full HP & Heal Status."
    }),

    // --- Status healers ---
    makeGear("heal-antidote", "Antidote", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { poison: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/antidote.png",
      description: "A shot that quickly eliminates toxins, reduces fever, and relieves the pain. Heal Poison & Badly Poison."
    }),
    makeGear("heal-awakening", "Awakening", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { sleep: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/awakening.png",
      description: "Sprays a water-based solution to awake a drowsy pokemon. Heal Sleep."
    }),
    makeGear("heal-burn-heal", "Burn Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { burn: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/burn-heal.png",
      description: "A powder that extinguishes the fire and aids with the healing of the burnt area. Heal all Burn degrees."
    }),
    makeGear("heal-ice-heal", "Ice Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { frozen: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/ice-heal.png",
      description: "A heat-inducing device that recovers the normal temperature of the Pokemon and heals frost biting. Heal Frozen Solid."
    }),
    makeGear("heal-paralyze-heal", "Paralyze Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { paralysis: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/paralyze-heal.png",
      description: "This ointment relaxes the muscles and stops the cramping. Heal Paralysis."
    }),
    makeGear("heal-full-heal", "Full Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/full-heal.png",
      description: "A superior spray formula that can heal any and all Status Ailments in a second. Heal all Status Ailments."
    }),
    makeGear("heal-remedy", "Remedy", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/heal-powder.png",
      description: "This powder leaves a horrid aftertaste. Pokemon will only eat it if they are injured, and even so, they'll resent you for days."
    }),

    // --- Berries ---
    makeGear("berry-oran", "Oran Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 1 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/oran-berry.png",
      description: "A delicious citric berry that numbs pain away."
    }),
    makeGear("berry-sitrus", "Sitrus Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 3, lethal: 1 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/sitrus-berry.png",
      description: "A bigger berry from the Oran family but scarcer in the wild. It can also heal up to 1 Lethal Damage."
    }),
    makeGear("berry-pecha", "Pecha Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { poison: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/pecha-berry.png",
      description: "This berry's sweet pulp will absorb simple poison out of the bloodstream. Heal Poison."
    }),
    makeGear("berry-cheri", "Cheri Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { paralysis: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/cheri-berry.png",
      description: "Its spicy flavor reinvigorates the muscles and stops the cramping. Heal Paralysis."
    }),
    makeGear("berry-chesto", "Chesto Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { sleep: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/chesto-berry.png",
      description: "It is difficult to eat, so tough and dry that it will heal the drowsiness. Heal Sleep."
    }),
    makeGear("berry-rawst", "Rawst Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { burn: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/rawst-berry.png",
      description: "Its liquid pulp is ideal to stop fire from spreading and numbs the pain on the area. It is quite bitter, though. Heal 1st & 2nd Degree Burn."
    }),
    makeGear("berry-aspear", "Aspear Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { frozen: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/aspear-berry.png",
      description: "This sour berry shakes the body and rises its temperature, thawing any ice surrounding it. Heal Frozen Solid."
    }),
    makeGear("berry-persim", "Persim Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { confusion: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/persim-berry.png",
      description: "A multi-flavored berry to snap out of confusion. Heal Confusion."
    }),
    makeGear("berry-lum", "Lum Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { all: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/lum-berry.png",
      description: "This berry is said to cure everything; however it's very rare to find. Heal all Status Ailments."
    }),

    // --- Herbs ---
    makeGear("herb-energy-root", "Energy Root", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      heal: { hp: 14 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/energy-root.png",
      description: "A nasty-tasting root with healing properties. It can be eaten whole or turned into up to 4 batches of Remedy. (Requires Medicine Skill check)"
    }),
    makeGear("herb-heal-powder", "Heal Powder", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/heal-powder.png",
      description: "A mix of the most foul-tasting herbs you can find can make this cure-all powder. Heal all Status Ailments."
    }),
    makeGear("herb-revival-herb", "Revival Herb", {
      category: "revive",
      pocket: "potions",
      canUseInBattle: true,
      heal: { fullHp: true, restoreAwareness: true },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/revival-herb.png",
      description: "It may be its magical properties or just its awful flavor, but this herb will get you back into consciousness numbing all the pain away. Very rare to find. Restore conciousness & Full HP."
    }),

    // --- Drinks ---
    makeGear("drink-berry-juice", "Berry Juice", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/berry-juice.png",
      description: "This mixed drink of various berries is also quite refreshing. Some Pokemon produce it naturally. Cannot be used in Battle."
    }),
    makeGear("drink-fresh-water", "Fresh Water", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 4 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/fresh-water.png",
      description: "Pure H2O and just the right amount of sodium. Remember to drink 8 glasses daily! Cannot be used in Battle."
    }),
    makeGear("drink-soda-pop", "Soda Pop", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 5 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/sodapop.png",
      description: "This sugary drink gives you a quick shot of energy. Enjoy the fizz on a hot day. Cannot be used in Battle."
    }),
    makeGear("drink-lemonade", "Lemonade", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 6 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/lemonade.png",
      description: "The citric boost and added vitamins make this a favorite after exercise. Cannot be used in Battle."
    }),
    makeGear("drink-moomoo-milk", "Moomoo Milk", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 7 },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/moomoo-milk.png",
      description: "Right out of the Miltank! Fresh and organic. Excellent to grow healthy! Cannot be used in Battle."
    }),
    makeGear("drink-max-honey", "Max Honey", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 10 },
      img: "systems/pok-role-system/assets/items/gear/max-honey.png",
      description: "An exquisite honey made by a Vespiquen. It's unbelievably healthy and said to grant true happiness. But the only way to obtain it is to defeat the whole swarm in battle. Cannot be used in Battle."
    }),
    makeGear("drink-ice-cream", "Ice Cream", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 3 },
      img: "systems/pok-role-system/assets/items/gear/ice-cream.png",
      description: "A delicious vanilla cone that looks just like a Vanillish. Perfect for a sunny day at the park. Cannot be used in Battle."
    }),
    makeGear("drink-chocolate", "Chocolate", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      img: "systems/pok-role-system/assets/items/gear/chocolate.png",
      description: "A sweet treat to gain the affection of someone special. It melts in your mouth with each bite. Cannot be used in Battle."
    }),
    makeGear("drink-baked-goods", "Baked Goods", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      img: "systems/pok-role-system/assets/items/gear/baked-goods.png",
      description: "Malasadas, Lava Cookies, Lumiose Galette, Jubilife Muffins, Pewter Crunchies, and More! Right out of the oven! Cannot be used in Battle."
    })
  ],

  "pokemon-care-items": [
    // --- Food ---
    makeGear("care-dry-food", "Dry Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      img: "systems/pok-role-system/assets/items/gear/dry-food.png",
      description: "Dry kibble for your Pokemon. Nothing special. Enough for one day."
    }),
    makeGear("care-gourmet-food", "Gourmet Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      img: "systems/pok-role-system/assets/items/gear/gourmet-food.png",
      description: "Made with Premium ingredients. If you feed this on a regular basis the Pokemon's happiness will increase faster."
    }),
    makeGear("care-high-performance-food", "High-Performance Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      img: "systems/pok-role-system/assets/items/gear/high-performance-food.png",
      description: "High-protein kibble, made for athletes! Add 2 dice to the next Training Roll of the Pokemon."
    }),

    // --- Vitamins ---
    makeGear("vitamin-protein", "Protein", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "strength" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/protein.png",
      description: "A tasty milkshake that aids in the growth of bigger and stronger muscles."
    }),
    makeGear("vitamin-iron", "Iron", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "vitality" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/iron.png",
      description: "An iron capsule that reduces feebleness and gives you a healthy glow."
    }),
    makeGear("vitamin-calcium", "Calcium", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "special" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/calcium.png",
      description: "Add this effervescent pills in a drink to help grow stronger bones."
    }),
    makeGear("vitamin-zinc", "Zinc", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "insight" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/zinc.png",
      description: "Zinc capsules aid on brain development."
    }),
    makeGear("vitamin-carbos", "Carbos", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "dexterity" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/carbos.png",
      description: "A healthy syrup that fills you with energy!"
    }),
    makeGear("vitamin-hp-up", "HP Up", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "hp" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/hp-up.png",
      description: "A compendium of vitamins and minerals to help your Pokemon grow as big and healthy as it can be."
    }),
    makeGear("vitamin-pp-up", "PP Up", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "will" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/pp-up.png",
      description: "It is rumored they are just sugar pills. Who really knows?"
    }),
    makeGear("vitamin-rare-candy", "Rare Candy", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "none" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/rare-candy.png",
      description: "You should never accept candy from strangers. ...but maybe just this once."
    }),
    makeGear("vitamin-power-increasers", "Power Increasers", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "none" },
      img: "systems/pok-role-system/assets/items/gear/power-increasers.png",
      description: "Weighted gear, that Reduce Dexterity by 1 but grant an Increase of 2 on another Attribute/Trait of your choice."
    }),

    // --- Grooming ---
    makeGear("grooming-kit", "Grooming Kit", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      img: "systems/pok-role-system/assets/items/gear/grooming-kit.png",
      description: "No more matted hair, unruly leaves, flaky scales, rough rocks, unpolished steel ...you get the idea."
    }),
    makeGear("grooming-costume", "Pokemon Costume", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      img: "systems/pok-role-system/assets/items/gear/pokemon-costume.png",
      description: "Fashionable clothes. Your companions will look amazing in these costumes and they will love it too!"
    }),
    makeGear("grooming-accessory-piece", "Piece of Accessory", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      img: "systems/pok-role-system/assets/items/gear/piece-of-accessory.png",
      description: "Ribbons, hats, collars and everything you need to make your companion look super special."
    })
  ],

  "evolutionary-items": [
    makeGear("evo-fire-stone", "Fire Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/fire-stone.png",
      description: "This Stone has a flame inside, it's hot to the touch. Usually found at the base of volcanoes."
    }),
    makeGear("evo-thunder-stone", "Thunder Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/thunder-stone.png",
      description: "It glows in the dark and can be used to power small electronics. They are created after thunder strikes."
    }),
    makeGear("evo-water-stone", "Water Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/water-stone.png",
      description: "Sparkly fresh water is trapped inside. This stone can be found at the bottom of the sea and some lakes."
    }),
    makeGear("evo-leaf-stone", "Leaf Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/leaf-stone.png",
      description: "It is said that the leaf encrusted into it came from a tree of life. Relatively common in forests and jungles."
    }),
    makeGear("evo-moon-stone", "Moon Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/moon-stone.png",
      description: "Looks like a common rock until the moon shines upon it, giving it a aether glow. Commonly found in caves."
    }),
    makeGear("evo-sun-stone", "Sun Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/sun-stone.png",
      description: "A red stone, that becomes extra bright when the sun shines on it. Can be found at deserts and plains."
    }),
    makeGear("evo-shiny-stone", "Shiny Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/shiny-stone.png",
      description: "Its polished surface allows you to see a ball of light inside. Rare to find, considered a good luck charm."
    }),
    makeGear("evo-dusk-stone", "Dusk Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/dusk-stone.png",
      description: "This stone seems to suck the light and happiness off a room like a small dark hole. Very rare to find."
    }),
    makeGear("evo-dawn-stone", "Dawn Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/dawn-stone.png",
      description: "This cerulean stone shines with blinding light for a minute during sunrise. Very rare to find."
    }),
    makeGear("evo-ice-stone", "Ice Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      img: "https://raw.githubusercontent.com/Pokerole-Software-Development/Pokerole-Data/master/images/ItemSprites/ice-stone.png",
      description: "Looks like a piece of ice that won't melt, very cold to the touch. Only found near artic regions."
    })
  ],

  "held-items": HELD_ITEM_COMPENDIUM_ENTRIES,
  "weather-conditions": [
    makePlayableItem("item-weather-sunny", "Sunny Weather", "weather", {
      category: "climate",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 0,
      affectedTypes: "Fire (+1 damage die), Water (-1 total damage)",
      effect: "Frozen cannot be inflicted while sunny weather is active.",
      description: "Corebook p.56."
    }, "icons/magic/time/day-night-sun-cloud.webp"),
    makePlayableItem("item-weather-rain", "Rain Weather", "weather", {
      category: "climate",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 0,
      affectedTypes: "Water (+1 damage die), Fire (-1 total damage)",
      effect: "Rain boosts water output and dampens fire moves.",
      description: "Corebook p.56."
    }, "icons/magic/time/day-night-rain.webp"),
    makePlayableItem("item-weather-sandstorm", "Sandstorm Weather", "weather", {
      category: "hazard",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 1,
      affectedTypes: "Rock/Ground/Steel ignore sandstorm chip damage",
      effect: "Rock Pokemon gain +1 Special Defense.",
      description: "Corebook p.56."
    }, "icons/magic/air/wind-swirl-sand.webp"),
    makePlayableItem("item-weather-hail", "Hail Weather", "weather", {
      category: "hazard",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 1,
      affectedTypes: "Ice ignores hail chip damage",
      effect: "Ice Pokemon gain +1 Defense.",
      description: "Corebook p.57."
    }, "icons/magic/water/projectile-ice-shard.webp"),
    makePlayableItem("item-weather-fog-darkness", "Fog / Darkness", "weather", {
      category: "climate",
      duration: 0,
      accuracyModifier: -1,
      damageModifier: 0,
      endOfRoundDamage: 0,
      affectedTypes: "All",
      effect: "All Pokemon receive extra Reduced Accuracy on moves.",
      description: "Corebook p.57."
    }, "icons/magic/perception/eye-ringed-glow-angry-red.webp"),
    makePlayableItem("item-weather-muddy", "Muddy", "weather", {
      category: "terrain",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 0,
      affectedTypes: "Ground mobility",
      effect: "Mobility is reduced and Pokemon cannot get out of range.",
      description: "Corebook p.57."
    }, "icons/environment/wilderness/terrain-rocky-ground.webp"),
    makePlayableItem("item-weather-on-fire", "On Fire!", "weather", {
      category: "hazard",
      duration: 0,
      accuracyModifier: 0,
      damageModifier: 0,
      endOfRoundDamage: 1,
      affectedTypes: "Area hazard",
      effect: "Environmental hazard that inflicts recurring damage each round.",
      description: "Corebook p.57."
    }, "icons/magic/fire/projectile-fireball-orange-yellow.webp")
  ],

  "pokemon-status": [
    makePlayableItem("item-status-burn-1", "Burn 1", "status", {
      severity: "minor",
      target: "pokemon",
      endOfRoundDamage: 1,
      removedSuccesses: 0,
      blocksAction: false,
      recovery: "Burn Heal / Full Heal / relevant effects",
      effect: "End of round: 1 damage. Fire-type Pokemon are immune.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-burn-2", "Burn 2", "status", {
      severity: "major",
      target: "pokemon",
      endOfRoundDamage: 2,
      removedSuccesses: 0,
      blocksAction: false,
      recovery: "Burn Heal / Full Heal / relevant effects",
      effect: "End of round: 2 lethal damage. Fire-type Pokemon are immune.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-burn-3", "Burn 3", "status", {
      severity: "critical",
      target: "pokemon",
      endOfRoundDamage: 3,
      removedSuccesses: 0,
      blocksAction: false,
      recovery: "Burn Heal / Full Heal / relevant effects",
      effect: "End of round: 3 lethal damage. Fire-type Pokemon are immune.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-frozen-solid", "Frozen Solid", "status", {
      severity: "critical",
      target: "pokemon",
      endOfRoundDamage: 0,
      removedSuccesses: 0,
      blocksAction: true,
      recovery: "Ice Heal / specific thawing effects",
      effect: "The target cannot act until thawed by effects or scene conditions.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-paralysis", "Paralysis", "status", {
      severity: "major",
      target: "pokemon",
      endOfRoundDamage: 0,
      removedSuccesses: 0,
      blocksAction: false,
      recovery: "Paralyze Heal / Full Heal / relevant effects",
      effect: "Muscle cramps and reduced performance until cured.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-poison", "Poison / Poison+", "status", {
      severity: "major",
      target: "pokemon",
      endOfRoundDamage: 1,
      removedSuccesses: 0,
      blocksAction: false,
      recovery: "Antidote / Full Heal / relevant effects",
      effect: "Poisoned targets take recurring damage according to severity.",
      description: "Corebook p.58."
    }),
    makePlayableItem("item-status-sleep", "Sleep", "status", {
      severity: "major",
      target: "pokemon",
      endOfRoundDamage: 0,
      removedSuccesses: 0,
      blocksAction: true,
      recovery: "Awakening / Chesto Berry / relevant effects",
      effect: "Sleeping targets cannot act until they wake up by rule/effect.",
      description: "Corebook p.59."
    }),
    makePlayableItem("item-status-confused", "Confused", "status", {
      severity: "minor",
      target: "pokemon",
      endOfRoundDamage: 0,
      removedSuccesses: 1,
      blocksAction: false,
      recovery: "Persim Berry / Lum Berry / relevant effects",
      effect: "Removes 1 success from action rolls; failed actions can self-damage.",
      description: "Corebook p.59."
    }),
    makePlayableItem("item-status-flinched", "Flinched", "status", {
      severity: "minor",
      target: "pokemon",
      endOfRoundDamage: 0,
      removedSuccesses: 0,
      blocksAction: true,
      recovery: "Ends on the immediate next action opportunity.",
      effect: "The target hesitates and loses immediate action flow.",
      description: "Corebook p.59."
    })
  ],

  abilities: ABILITY_COMPENDIUM_ENTRIES
});

// ---------------------------------------------------------------------------
// ACTOR SEEDS
// ---------------------------------------------------------------------------

const ACTOR_SEEDS = Object.freeze({
  "pokemon-actors": POKEMON_ACTOR_COMPENDIUM_ENTRIES
});

export const STATIC_ITEM_SEEDS_BY_PACK = ITEM_SEEDS;
export const STATIC_ACTOR_SEEDS_BY_PACK = ACTOR_SEEDS;

// ---------------------------------------------------------------------------
// seedCompendia
// ---------------------------------------------------------------------------

function getSeedCollection(packName, documentName) {
  if (documentName === "Item") {
    return ITEM_SEEDS[packName] ?? [];
  }
  if (documentName === "Actor") {
    return ACTOR_SEEDS[packName] ?? [];
  }
  return [];
}

async function ensureUnlocked(pack) {
  if (!pack.locked) return false;
  try {
    await pack.configure({ locked: false });
    return true;
  } catch (error) {
    console.warn(`${POKROLE.ID} | Unable to unlock compendium ${pack.collection}`, error);
    return false;
  }
}

async function restoreLock(pack, shouldRelock) {
  if (!shouldRelock) return;
  try {
    await pack.configure({ locked: true });
  } catch (error) {
    console.warn(`${POKROLE.ID} | Unable to relock compendium ${pack.collection}`, error);
  }
}

export async function seedCompendia({ force = false, forcePacks = null, notify = true } = {}) {
  if (!game.user?.isGM) {
    if (notify) ui.notifications?.warn("Only a GM can seed compendia.");
    return { totalCreated: 0, createdByPack: {} };
  }

  const forcePackSet = Array.isArray(forcePacks) ? new Set(forcePacks) : null;
  const createdByPack = {};
  let totalCreated = 0;

  for (const pack of game.packs.values()) {
    if (pack.metadata?.packageName !== POKROLE.ID) continue;
    const packName = pack.metadata.name;
    const forceThisPack = force || (forcePackSet?.has(packName) ?? false);
    const seeds = getSeedCollection(packName, pack.documentName).map((seed) =>
      normalizeSeedDocument(seed)
    );
    if (!seeds.length) continue;

    const shouldRelock = await ensureUnlocked(pack);
    try {
      const index = await pack.getIndex({ fields: ["flags", "type"] });
      if (forceThisPack && index.length > 0) {
        const ids = index.map((entry) => entry._id).filter(Boolean);
        if (ids.length > 0) {
          await pack.documentClass.deleteDocuments(ids, { pack: pack.collection });
        }
      }

      if (!forceThisPack && pack.documentName === "Item") {
        const incompatibleIds = index
          .filter((entry) => !VALID_ITEM_TYPES.has(`${entry.type ?? ""}`))
          .map((entry) => entry._id)
          .filter(Boolean);
        if (incompatibleIds.length > 0) {
          await pack.documentClass.deleteDocuments(incompatibleIds, { pack: pack.collection });
        }
      }

      if (!forceThisPack && pack.documentName === "Actor") {
        const incompatibleIds = index
          .filter((entry) => !VALID_ACTOR_TYPES.has(`${entry.type ?? ""}`))
          .map((entry) => entry._id)
          .filter(Boolean);
        if (incompatibleIds.length > 0) {
          await pack.documentClass.deleteDocuments(incompatibleIds, { pack: pack.collection });
        }
      }

      const freshIndex = forceThisPack ? [] : await pack.getIndex({ fields: ["flags", "type"] });
      const seedIdsInCode = new Set(
        seeds
          .map((seed) => seed.flags?.[POKROLE.ID]?.seedId)
          .filter((value) => typeof value === "string" && value.length > 0)
      );

      if (!forceThisPack) {
        const staleSeededDocumentIds = freshIndex
          .filter((entry) => {
            const seedId = entry.flags?.[POKROLE.ID]?.seedId;
            return typeof seedId === "string" && seedId.length > 0 && !seedIdsInCode.has(seedId);
          })
          .map((entry) => entry._id)
          .filter(Boolean);

        if (staleSeededDocumentIds.length > 0) {
          await pack.documentClass.deleteDocuments(staleSeededDocumentIds, { pack: pack.collection });
        }
      }

      const existingSeedIds = new Set(
        (forceThisPack ? [] : await pack.getIndex({ fields: ["flags"] }))
          .map((entry) => entry.flags?.[POKROLE.ID]?.seedId)
          .filter((value) => typeof value === "string" && value.length > 0)
      );

      const toCreate = seeds.filter((seed) => {
        const seedId = seed.flags?.[POKROLE.ID]?.seedId;
        return !existingSeedIds.has(seedId);
      });

      if (toCreate.length > 0) {
        await pack.documentClass.createDocuments(toCreate, { pack: pack.collection });
      }

      // Update existing items with new seed data (images, system data, etc.)
      if (!forceThisPack) {
        const currentIndex = await pack.getIndex({ fields: ["flags"] });
        const seedBySeedId = new Map(
          seeds.map((s) => [s.flags?.[POKROLE.ID]?.seedId, s]).filter(([k]) => k)
        );
        for (const entry of currentIndex) {
          const entrySeedId = entry.flags?.[POKROLE.ID]?.seedId;
          if (!entrySeedId) continue;
          const seedData = seedBySeedId.get(entrySeedId);
          if (!seedData) continue;
          const doc = await pack.getDocument(entry._id);
          if (!doc) continue;
          const updates = {};
          // Update image if changed
          const seedImg = `${seedData.img ?? ""}`.trim();
          if (seedImg && seedImg !== "icons/svg/item-bag.svg") {
            const currentImg = `${doc.img ?? ""}`.trim();
            if (currentImg !== seedImg) {
              updates.img = seedImg;
            }
          }
          // Update system data if the seed provides it
          if (seedData.system && typeof seedData.system === "object") {
            for (const [key, value] of Object.entries(seedData.system)) {
              const currentValue = doc.system?.[key];
              if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                // Deep compare for nested objects (e.g. pokeball: { sealPower, specialEffect })
                for (const [subKey, subValue] of Object.entries(value)) {
                  if (currentValue?.[subKey] !== subValue) {
                    updates[`system.${key}.${subKey}`] = subValue;
                  }
                }
              } else if (currentValue !== value) {
                updates[`system.${key}`] = value;
              }
            }
          }
          if (Object.keys(updates).length > 0) {
            await doc.update(updates);
          }

          // Sync embedded items (e.g. ability items on pokemon actors)
          if (pack.documentName === "Actor" && Array.isArray(seedData.items)) {
            const seedAbilities = seedData.items.filter(i => i.type === "ability");
            if (seedAbilities.length > 0) {
              const existingAbilities = doc.items.filter(i => i.type === "ability");

              // Remove duplicate abilities (same name appearing more than once)
              const nameCounts = new Map();
              for (const ab of existingAbilities) {
                const key = ab.name.toLowerCase();
                nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
              }
              const dupeIdsToRemove = [];
              const seenForDedup = new Set();
              for (const ab of existingAbilities) {
                const key = ab.name.toLowerCase();
                if (nameCounts.get(key) > 1) {
                  if (seenForDedup.has(key)) {
                    dupeIdsToRemove.push(ab.id);
                  } else {
                    seenForDedup.add(key);
                  }
                }
              }
              if (dupeIdsToRemove.length > 0) {
                await doc.deleteEmbeddedDocuments("Item", dupeIdsToRemove, { pack: pack.collection });
              }

              // Add missing abilities
              const remainingAbilities = doc.items.filter(i => i.type === "ability");
              const existingNames = new Set(remainingAbilities.map(i => i.name.toLowerCase()));
              const toAdd = seedAbilities.filter(i => !existingNames.has(i.name.toLowerCase()));
              if (toAdd.length > 0) {
                const normalized = toAdd.map(i => {
                  const obj = foundry.utils.deepClone(i);
                  delete obj._id;
                  return obj;
                });
                await doc.createEmbeddedDocuments("Item", normalized, { pack: pack.collection });
              }
            }
          }
        }
      }

      createdByPack[pack.metadata.name] = toCreate.length;
      totalCreated += toCreate.length;
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to seed compendium ${pack.collection}`, error);
      createdByPack[pack.metadata.name] = 0;
    } finally {
      await restoreLock(pack, shouldRelock);
    }
  }

  if (notify) {
    if (totalCreated > 0) {
      ui.notifications?.info(`PokeRole compendia seeded: ${totalCreated} entries created.`);
    } else {
      ui.notifications?.info("PokeRole compendia are already seeded.");
    }
  }

  return { totalCreated, createdByPack };
}

