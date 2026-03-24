import { POKROLE } from "../constants.mjs";
import { MOVE_COMPENDIUM_ENTRIES } from "./generated/move-seeds.mjs";
import { POKEDEX_COMPENDIUM_ENTRIES } from "./generated/pokedex-seeds.mjs";
import { ABILITY_COMPENDIUM_ENTRIES } from "./generated/ability-seeds.mjs";
import { POKEMON_ACTOR_COMPENDIUM_ENTRIES } from "./generated/pokemon-actor-seeds.mjs";

export const COMPENDIUM_SEED_VERSION = "2026-03-25-abilities-v2";
const VALID_ITEM_TYPES = new Set(["move", "gear", "ability", "weather", "status", "pokedex"]);
const VALID_ACTOR_TYPES = new Set(["trainer", "pokemon"]);
const LEGACY_SYSTEM_FLAG_KEYS = Object.freeze(["pok-role-module", "pok-role-system"]);

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
      description: "A spacious tent for a group to spend a cozy night. Made with repellent materials against wild Pokemon."
    }),
    makeGear("trainer-small-camping-tent", "Small Camping Tent", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A comfortable space for one or two people. Made with repellent materials against wild Pokemon."
    }),
    makeGear("trainer-sleeping-bag", "Sleeping Bag", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "Not too comfortable. You'll be able to sleep warm and dry but after a few nights your back may hurt."
    }),
    makeGear("trainer-camping-stove-cookware", "Camping Stove & Cookware", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "Forget about hunting and eating roots like a savage. With this luxury set you'll always have a gourmet meal."
    }),
    makeGear("trainer-compass", "Compass", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A useful compass to point you in the right direction. Warning: Keep away from magnets."
    }),
    makeGear("trainer-regional-map", "Regional Map", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A map with the marked routes, cities and Pokemon Centers of the region you are in."
    }),
    makeGear("trainer-mountain-bike", "Mountain Bike", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "You will travel twice as fast with this awesome all-terrain bike. Now at an insane price!"
    }),
    makeGear("trainer-inflatable-boat", "Inflatable Boat", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A small boat for two persons. Your Pokemon can pull you through the water or you can use the oars."
    }),
    makeGear("trainer-fishing-rod", "Fishing Rod", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A fishing rod to catch Pokemon living underwater. Make sure to get the right bait or they won't bite."
    }),
    makeGear("trainer-saddle", "Saddle", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "A secure seat to strap on a Pokemon large enough to carry you. Riding a Pokemon sure is exciting!"
    }),
    makeGear("trainer-sled", "Sled", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "Strap one large Pokemon or several small ones to pull you through snow, sand or any smooth surface!"
    }),
    makeGear("trainer-hang-glider", "Hang Glider", {
      category: "travel",
      consumable: false,
      target: "trainer",
      description: "You will catch more Pokemon with honey than with vinegar. Wild Pokemon will come in hordes tracking it's scent, or you can enjoy it as a sweet treat!"
    }),

    // --- Key items ---
    makeGear("trainer-pokedex", "Pokedex", {
      category: "key",
      consumable: false,
      target: "trainer",
      description: "A digital encyclopedia with basic information about regional Pokemon. You may add your own research."
    }),
    makeGear("trainer-pokedex-upgrade", "Pokedex Upgrade", {
      category: "key",
      consumable: true,
      target: "trainer",
      description: "Upgrade your Pokedex with the information of the Pokemon on a new region."
    }),

    // --- Other items ---
    makeGear("trainer-meal-rations", "Meal Rations", {
      category: "other",
      consumable: true,
      target: "trainer",
      description: "Nothing fancy but there's no need to travel on an empty stomach. One ration is enough for one day."
    }),
    makeGear("trainer-pokedoll", "PokeDoll", {
      category: "other",
      consumable: true,
      target: "trainer",
      description: "Life-size decoy used to escape wild Pokemon. Some people like to collect them."
    }),
    makeGear("trainer-pokemon-repel", "Pokémon Repel", {
      category: "other",
      consumable: true,
      target: "trainer",
      description: "Most Pokemon won't come near you for about eight hours. The smell is now machine-washable."
    }),
    makeGear("trainer-pepper-spray-can", "Pepper Spray Can", {
      category: "other",
      consumable: true,
      target: "trainer",
      units: { value: 5, max: 5 },
      description: "Scares away small Pokemon, but it may enrage the bigger ones. Good for 5 uses."
    }),
    makeGear("trainer-honey", "Honey", {
      category: "other",
      consumable: true,
      description: "A sweet treat to gain the affection of someone special. It melts in your mouth with each bite. Cannot be used in Battle."
    }),

    // --- Pokeball items ---
    makeGear("trainer-pokeball", "Pokeball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "none" },
      description: "Seal potency of 4 dice. A basic ball used for catching Pokemon and carrying heavy items."
    }),
    makeGear("trainer-greatball", "Greatball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 6, specialEffect: "none" },
      description: "Seal potency of 6 dice. A sturdier barrier protects the seal so you have an easier time catching Pokemon."
    }),
    makeGear("trainer-ultraball", "Ultraball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 8, specialEffect: "none" },
      description: "Seal potency of 8 dice. The best seal in the market to ensure the catch of stronger Pokemon."
    }),
    makeGear("trainer-masterball", "Masterball", {
      category: "pokeball",
      consumable: false,
      canUseInBattle: true,
      pokeball: { sealPower: 20, specialEffect: "none" },
      description: "It's been long rumored that a mighty pokeball with the strongest seal in existance is in development. But no one has truly seen it in action."
    }),
    makeGear("trainer-old-pokeball", "Old Pokeball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 3, specialEffect: "old" },
      description: "Rare. An old model of Pokeball, now a collector's item."
    }),
    makeGear("trainer-dusk-ball", "Dusk Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 6, specialEffect: "dusk" },
      description: "Uncommon. The seal on this ball gets stronger the darker it gets. Increase seal potency by 4 if you are in a cave and/or by 5 if it's night time."
    }),
    makeGear("trainer-fast-ball", "Fast Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 5, specialEffect: "fast" },
      description: "Uncommon. This seal potency is equal to the Dexterity Score of the Pokemon you are trying to catch. Up to 9 dice."
    }),
    makeGear("trainer-heavy-ball", "Heavy Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 6, specialEffect: "heavy" },
      description: "Uncommon. Increase seal potency by 1 for every 50 lbs/25kg, on the Pokemon you are trying to catch. Up to 5 dice may be added this way."
    }),
    makeGear("trainer-luxury-ball", "Luxury Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "luxury" },
      description: "Very Rare. Any Pokemon caught with this ball will have their Happiness Score increased by 1."
    }),
    makeGear("trainer-quick-ball", "Quick Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 9, specialEffect: "quick" },
      description: "Uncommon. The seal on this ball works on a timer. Starting with a max potency of 9 dice on the first Round of battle and reducing the seal potency by 2 each Round that passes."
    }),
    makeGear("trainer-net-ball", "Net Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "net" },
      description: "Uncommon. Normally has the seal potency of a Pokeball (4 dice), but against Water-type Pokemon it has the seal potency of a Greatball (6 dice)."
    }),
    makeGear("trainer-heal-ball", "Heal Ball", {
      category: "pokeball",
      canUseInBattle: true,
      pokeball: { sealPower: 4, specialEffect: "heal", healsOnCapture: true },
      description: "Uncommon. Has the seal potency of a Pokeball (4 dice) but fully heals the Pokemon once captured."
    }),

    // --- Revive items ---
    makeGear("trainer-revive", "Revive", {
      category: "revive",
      canUseInBattle: true,
      target: "any",
      heal: { hp: 1, restoreAwareness: true },
      description: "A small energy shard that brings a fainted Human or Pokemon back into conciousness and stabilizes all their wounds. Restore conciousness & 1 HP."
    }),
    makeGear("trainer-max-revive", "Max Revive", {
      category: "revive",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, restoreAwareness: true },
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
      description: "A pocket sized spray potion to relieve the pain and heal bruises."
    }),
    makeGear("heal-super-potion", "Super Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 4, max: 4 },
      heal: { hp: 1 },
      description: "A regular can of concentrated formula spray. This potion can close open wounds and even heal a cracked bone."
    }),
    makeGear("heal-hyper-potion", "Hyper Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 14, max: 14 },
      heal: { hp: 1 },
      description: "Best value pack. It can be rationed for smaller injuries on the team, or used all at once on a serious wound."
    }),
    makeGear("heal-max-potion", "Max Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, battleHealingCategory: "unlimited" },
      description: "A single-use capsule of formula. The Pokemon won't be able to restore health further until the next day."
    }),
    makeGear("heal-full-restore", "Full Restore", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, battleHealingCategory: "unlimited" },
      status: { all: true },
      description: "A single-use capsule of deluxe formula. The Pokemon won't be able to restore health further until the next day. Restore Full HP & Heal Status."
    }),

    // --- Status healers ---
    makeGear("heal-antidote", "Antidote", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { poison: true },
      description: "A shot that quickly eliminates toxins, reduces fever, and relieves the pain. Heal Poison & Badly Poison."
    }),
    makeGear("heal-awakening", "Awakening", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { sleep: true },
      description: "Sprays a water-based solution to awake a drowsy pokemon. Heal Sleep."
    }),
    makeGear("heal-burn-heal", "Burn Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { burn: true },
      description: "A powder that extinguishes the fire and aids with the healing of the burnt area. Heal all Burn degrees."
    }),
    makeGear("heal-ice-heal", "Ice Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { frozen: true },
      description: "A heat-inducing device that recovers the normal temperature of the Pokemon and heals frost biting. Heal Frozen Solid."
    }),
    makeGear("heal-paralyze-heal", "Paralyze Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { paralysis: true },
      description: "This ointment relaxes the muscles and stops the cramping. Heal Paralysis."
    }),
    makeGear("heal-full-heal", "Full Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      description: "A superior spray formula that can heal any and all Status Ailments in a second. Heal all Status Ailments."
    }),
    makeGear("heal-remedy", "Remedy", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      description: "This powder leaves a horrid aftertaste. Pokemon will only eat it if they are injured, and even so, they'll resent you for days."
    }),

    // --- Berries ---
    makeGear("berry-oran", "Oran Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 1 },
      description: "A delicious citric berry that numbs pain away."
    }),
    makeGear("berry-sitrus", "Sitrus Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 3, lethal: 1 },
      description: "A bigger berry from the Oran family but scarcer in the wild. It can also heal up to 1 Lethal Damage."
    }),
    makeGear("berry-pecha", "Pecha Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { poison: true },
      description: "This berry's sweet pulp will absorb simple poison out of the bloodstream. Heal Poison."
    }),
    makeGear("berry-cheri", "Cheri Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { paralysis: true },
      description: "Its spicy flavor reinvigorates the muscles and stops the cramping. Heal Paralysis."
    }),
    makeGear("berry-chesto", "Chesto Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { sleep: true },
      description: "It is difficult to eat, so tough and dry that it will heal the drowsiness. Heal Sleep."
    }),
    makeGear("berry-rawst", "Rawst Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { burn: true },
      description: "Its liquid pulp is ideal to stop fire from spreading and numbs the pain on the area. It is quite bitter, though. Heal 1st & 2nd Degree Burn."
    }),
    makeGear("berry-aspear", "Aspear Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { frozen: true },
      description: "This sour berry shakes the body and rises its temperature, thawing any ice surrounding it. Heal Frozen Solid."
    }),
    makeGear("berry-persim", "Persim Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { confusion: true },
      description: "A multi-flavored berry to snap out of confusion. Heal Confusion."
    }),
    makeGear("berry-lum", "Lum Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { all: true },
      description: "This berry is said to cure everything; however it's very rare to find. Heal all Status Ailments."
    }),

    // --- Herbs ---
    makeGear("herb-energy-root", "Energy Root", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      heal: { hp: 14 },
      description: "A nasty-tasting root with healing properties. It can be eaten whole or turned into up to 4 batches of Remedy. (Requires Medicine Skill check)"
    }),
    makeGear("herb-heal-powder", "Heal Powder", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      description: "A mix of the most foul-tasting herbs you can find can make this cure-all powder. Heal all Status Ailments."
    }),
    makeGear("herb-revival-herb", "Revival Herb", {
      category: "revive",
      pocket: "potions",
      canUseInBattle: true,
      heal: { fullHp: true, restoreAwareness: true },
      description: "It may be its magical properties or just its awful flavor, but this herb will get you back into consciousness numbing all the pain away. Very rare to find. Restore conciousness & Full HP."
    }),

    // --- Drinks ---
    makeGear("drink-berry-juice", "Berry Juice", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      description: "This mixed drink of various berries is also quite refreshing. Some Pokemon produce it naturally. Cannot be used in Battle."
    }),
    makeGear("drink-fresh-water", "Fresh Water", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 4 },
      description: "Pure H2O and just the right amount of sodium. Remember to drink 8 glasses daily! Cannot be used in Battle."
    }),
    makeGear("drink-soda-pop", "Soda Pop", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 5 },
      description: "This sugary drink gives you a quick shot of energy. Enjoy the fizz on a hot day. Cannot be used in Battle."
    }),
    makeGear("drink-lemonade", "Lemonade", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 6 },
      description: "The citric boost and added vitamins make this a favorite after exercise. Cannot be used in Battle."
    }),
    makeGear("drink-moomoo-milk", "Moomoo Milk", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 7 },
      description: "Right out of the Miltank! Fresh and organic. Excellent to grow healthy! Cannot be used in Battle."
    }),
    makeGear("drink-max-honey", "Max Honey", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 10 },
      description: "An exquisite honey made by a Vespiquen. It's unbelievably healthy and said to grant true happiness. But the only way to obtain it is to defeat the whole swarm in battle. Cannot be used in Battle."
    }),
    makeGear("drink-ice-cream", "Ice Cream", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 3 },
      description: "A delicious vanilla cone that looks just like a Vanillish. Perfect for a sunny day at the park. Cannot be used in Battle."
    }),
    makeGear("drink-chocolate", "Chocolate", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      description: "A sweet treat to gain the affection of someone special. It melts in your mouth with each bite. Cannot be used in Battle."
    }),
    makeGear("drink-baked-goods", "Baked Goods", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      description: "Malasadas, Lava Cookies, Lumiose Galette, Jubilife Muffins, Pewter Crunchies, and More! Right out of the oven! Cannot be used in Battle."
    })
  ],

  "pokemon-care-items": [
    // --- Food ---
    makeGear("care-dry-food", "Dry Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      description: "Dry kibble for your Pokemon. Nothing special. Enough for one day."
    }),
    makeGear("care-gourmet-food", "Gourmet Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      description: "Made with Premium ingredients. If you feed this on a regular basis the Pokemon's happiness will increase faster."
    }),
    makeGear("care-high-performance-food", "High-Performance Food", {
      category: "other",
      pocket: "main",
      consumable: true,
      description: "High-protein kibble, made for athletes! Add 2 dice to the next Training Roll of the Pokemon."
    }),

    // --- Vitamins ---
    makeGear("vitamin-protein", "Protein", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "strength" },
      description: "A tasty milkshake that aids in the growth of bigger and stronger muscles."
    }),
    makeGear("vitamin-iron", "Iron", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "vitality" },
      description: "An iron capsule that reduces feebleness and gives you a healthy glow."
    }),
    makeGear("vitamin-calcium", "Calcium", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "special" },
      description: "Add this effervescent pills in a drink to help grow stronger bones."
    }),
    makeGear("vitamin-zinc", "Zinc", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "insight" },
      description: "Zinc capsules aid on brain development."
    }),
    makeGear("vitamin-carbos", "Carbos", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "dexterity" },
      description: "A healthy syrup that fills you with energy!"
    }),
    makeGear("vitamin-hp-up", "HP Up", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "hp" },
      description: "A compendium of vitamins and minerals to help your Pokemon grow as big and healthy as it can be."
    }),
    makeGear("vitamin-pp-up", "PP Up", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "will" },
      description: "It is rumored they are just sugar pills. Who really knows?"
    }),
    makeGear("vitamin-rare-candy", "Rare Candy", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "none" },
      description: "You should never accept candy from strangers. ...but maybe just this once."
    }),
    makeGear("vitamin-power-increasers", "Power Increasers", {
      category: "vitamin",
      pocket: "main",
      vitamin: { stat: "none" },
      description: "Weighted gear, that Reduce Dexterity by 1 but grant an Increase of 2 on another Attribute/Trait of your choice."
    }),

    // --- Grooming ---
    makeGear("grooming-kit", "Grooming Kit", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      description: "No more matted hair, unruly leaves, flaky scales, rough rocks, unpolished steel ...you get the idea."
    }),
    makeGear("grooming-costume", "Pokemon Costume", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      description: "Fashionable clothes. Your companions will look amazing in these costumes and they will love it too!"
    }),
    makeGear("grooming-accessory-piece", "Piece of Accessory", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      description: "Ribbons, hats, collars and everything you need to make your companion look super special."
    })
  ],

  "evolutionary-items": [
    makeGear("evo-fire-stone", "Fire Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "This Stone has a flame inside, it's hot to the touch. Usually found at the base of volcanoes."
    }),
    makeGear("evo-thunder-stone", "Thunder Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "It glows in the dark and can be used to power small electronics. They are created after thunder strikes."
    }),
    makeGear("evo-water-stone", "Water Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "Sparkly fresh water is trapped inside. This stone can be found at the bottom of the sea and some lakes."
    }),
    makeGear("evo-leaf-stone", "Leaf Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "It is said that the leaf encrusted into it came from a tree of life. Relatively common in forests and jungles."
    }),
    makeGear("evo-moon-stone", "Moon Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "Looks like a common rock until the moon shines upon it, giving it a aether glow. Commonly found in caves."
    }),
    makeGear("evo-sun-stone", "Sun Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "A red stone, that becomes extra bright when the sun shines on it. Can be found at deserts and plains."
    }),
    makeGear("evo-shiny-stone", "Shiny Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "Its polished surface allows you to see a ball of light inside. Rare to find, considered a good luck charm."
    }),
    makeGear("evo-dusk-stone", "Dusk Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "This stone seems to suck the light and happiness off a room like a small dark hole. Very rare to find."
    }),
    makeGear("evo-dawn-stone", "Dawn Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "This cerulean stone shines with blinding light for a minute during sunrise. Very rare to find."
    }),
    makeGear("evo-ice-stone", "Ice Stone", {
      category: "evolution",
      pocket: "main",
      evolution: { compatiblePokemon: "" },
      description: "Looks like a piece of ice that won't melt, very cold to the touch. Only found near artic regions."
    })
  ],

  "held-items": [
    // --- Type Boosters ---
    makeGear("held-black-belt", "Black Belt", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Fighting-type moves", damageBonusType: "fighting", damageBonusDice: 1 },
      description: "The symbol of an outstanding martial artist. Add 1 Extra die to the Damage pool of Fight-Type Moves."
    }),
    makeGear("held-black-glasses", "Black Glasses", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Dark-type moves", damageBonusType: "dark", damageBonusDice: 1 },
      description: "No self-respecting ruffian can go without these. Add 1 Extra die to the Damage pool of Dark-Type Moves."
    }),
    makeGear("held-charcoal", "Charcoal", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Fire-type moves", damageBonusType: "fire", damageBonusDice: 1 },
      description: "Special charcoal to keep a flame strong. Add 1 Extra die to the Damage pool of Fire-Type Moves."
    }),
    makeGear("held-dragon-fang", "Dragon Fang", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Dragon-type moves", damageBonusType: "dragon", damageBonusDice: 1 },
      description: "The fang of a fierce dragon fuels your inner rage. Add 1 Extra die to the Damage pool of Dragon-Type Moves."
    }),
    makeGear("held-hard-stone", "Hard Stone", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Rock-type moves", damageBonusType: "rock", damageBonusDice: 1 },
      description: "Good ol' rock! Nothing beats that! Add 1 Extra die to the Damage pool of Rock-Type Moves."
    }),
    makeGear("held-magnet", "Magnet", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Electric-type moves", damageBonusType: "electric", damageBonusDice: 1 },
      description: "These magnets... how do they work? Add 1 Extra die to the Damage pool of Electric-Type Moves."
    }),
    makeGear("held-metal-coat", "Metal Coat", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Steel-type moves", damageBonusType: "steel", damageBonusDice: 1 },
      description: "Leave any surface coated in a shiny chrome. Add 1 Extra die to the Damage pool of Steel-Type Moves."
    }),
    makeGear("held-miracle-seed", "Miracle Seed", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Grass-type moves", damageBonusType: "grass", damageBonusDice: 1 },
      description: "A seed that is said to flourish into a tree of life. Add 1 Extra die to the Damage pool of Grass-Type Moves."
    }),
    makeGear("held-mystic-water", "Mystic Water", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Water-type moves", damageBonusType: "water", damageBonusDice: 1 },
      description: "Water that emits a mysterious glow. Add 1 Extra die to the Damage pool of Water-Type Moves."
    }),
    makeGear("held-never-melt-ice", "Never-Melt Ice", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Ice-type moves", damageBonusType: "ice", damageBonusDice: 1 },
      description: "This magical piece of ice never melts. Add 1 Extra die to the Damage pool of Ice-Type Moves."
    }),
    makeGear("held-poison-barb", "Poison Barb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Poison-type moves", damageBonusType: "poison", damageBonusDice: 1 },
      description: "A toxin-infused barb to ensure complete saturation. Add 1 Extra die to the Damage pool of Poison-Type Moves."
    }),
    makeGear("held-sharp-beak", "Sharp Beak", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Flying-type moves", damageBonusType: "flying", damageBonusDice: 1 },
      description: "A sharp metal cover to reinforce beaks. Add 1 Extra die to the Damage pool of Flying-Type Moves."
    }),
    makeGear("held-silk-scarf", "Silk Scarf", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Normal-type moves", damageBonusType: "normal", damageBonusDice: 1 },
      description: "A basic scarf, simple, but fashionable. Add 1 Extra die to the Damage pool of Normal-Type Moves."
    }),
    makeGear("held-silver-powder", "Silver Powder", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Bug-type moves", damageBonusType: "bug", damageBonusDice: 1 },
      description: "An itchy powder that induces allergies. Add 1 Extra die to the Damage pool of Bug-Type Moves."
    }),
    makeGear("held-soft-sand", "Soft Sand", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Ground-type moves", damageBonusType: "ground", damageBonusDice: 1 },
      description: "Finely grounded sand, soft to the touch. Add 1 Extra die to the Damage pool of Ground-Type Moves."
    }),
    makeGear("held-spell-tag", "Spell Tag", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Ghost-type moves", damageBonusType: "ghost", damageBonusDice: 1 },
      description: "An old piece of paper used to seal evil spirits. Add 1 Extra die to the Damage pool of Ghost-Type Moves."
    }),
    makeGear("held-twisted-spoon", "Twisted Spoon", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Psychic-type moves", damageBonusType: "psychic", damageBonusDice: 1 },
      description: "A spoon used to practice one's mind prowess. Add 1 Extra die to the Damage pool of Psychic-Type Moves."
    }),
    makeGear("held-fairy-wings", "Fairy Wings", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 damage die to Fairy-type moves", damageBonusType: "fairy", damageBonusDice: 1 },
      description: "Frolic like a fae through an enchanted forest. Add 1 Extra die to the Damage pool of Fairy-Type Moves."
    }),

    // --- Signature items ---
    makeGear("held-light-ball", "Light Ball", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { compatiblePokemon: "Pikachu", passiveEffect: "Pikachu gets Strength and Special Attributes increased by 1", statBonuses: { strength: 1, special: 1 } },
      description: "A bright ball that harnesses electricity. Pikachu loves it and they get their Strength and Special Attributes increased by 1."
    }),
    makeGear("held-lucky-punch", "Lucky Punch", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { compatiblePokemon: "Chansey", passiveEffect: "Chansey gets High Critical Effect to all Physical Moves and Strength increased by 2", highCritical: true, highCriticalCategory: "physical", statBonuses: { strength: 2 } },
      description: "Boxing gloves. Chansey loves them and gets the High Critical Effect to all Physical Moves and Strength increased by 2."
    }),
    makeGear("held-leek", "Leek", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { compatiblePokemon: "Farfetch'd", passiveEffect: "Farfetch'd gets High Critical Effect to all Physical and Special Moves", highCritical: true },
      description: "A common leek. It is loved by Farfetch'd and gives the High Critical Effect to all their Physical and Special Moves."
    }),
    makeGear("held-thick-club", "Thick Club", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { compatiblePokemon: "Cubone, Marowak", passiveEffect: "Cubone & Marowak get Strength Increased by 2", statBonuses: { strength: 2 } },
      description: "A strong club made with dried bone. Cubone & Marowak love it and get their Strength Increased by 2."
    }),

    // --- Battle items ---
    makeGear("held-amulet-coin", "Amulet Coin", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Doubles prize money from battles" },
      description: "Doubles prize money from battles."
    }),
    makeGear("held-choice-band", "Choice Band", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Choose a Physical Move, increase its Power by 3. All other Moves get their Power reduced by 3", choiceType: "physical", choicePowerBonus: 3, choicePowerPenalty: 3 },
      description: "Hit hard! Choose a Physical Move, increase its Power by 3. All other Moves get their Power reduced by 3."
    }),
    makeGear("held-choice-scarf", "Choice Scarf", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Increase initiative by 3. Choose a Move, it gets Reaction 5. All other Moves get Power reduced by 3", statBonuses: { initiative: 3 }, choiceType: "any", choicePowerPenalty: 3, choiceInitiativeBonus: 3, choicePriorityBonus: 5 },
      description: "Hit fast! Increase initiative by 3. Choose a Move, it gets the effect Reaction 5. All other Moves get their Power reduced by 3."
    }),
    makeGear("held-choice-specs", "Choice Specs", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Choose a Special Move, increase its Power by 3. All other Moves get their Power reduced by 3", choiceType: "special", choicePowerBonus: 3, choicePowerPenalty: 3 },
      description: "Hit fabulously! Choose a Special Move, increase its Power by 3. All other Moves get their Power reduced by 3."
    }),
    makeGear("held-clear-amulet", "Clear Amulet", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Attributes and traits of the user can't be lowered by other Pokemon", immuneToStatReduction: true },
      description: "An amulet of protection against evil. Attributes and traits of the user can't be lowered by other Pokemon."
    }),
    makeGear("held-destiny-knot", "Destiny Knot", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "If this Pokemon falls in love the foe will fall in love with them in return", destinyKnot: true },
      description: "The red string of fate may never break. If this Pokemon falls in love the foe will fall in love with them in return."
    }),
    makeGear("held-eject-button", "Eject Button", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "After receiving damage, activate the Switcher effect for the user. Effect activates only once per Round", ejectButton: true },
      description: "A tempting big red button. Do not push. After receiving damage, activate the Switcher effect for the user. Effect activates only once per Round."
    }),
    makeGear("held-eviolite", "Eviolite", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Increase by 1 the Defense and Sp. Defense of a 1st or 2nd stage Pokemon" },
      description: "A mineral that reacts to raw potential. Increase by 1 the Defense and Sp. Defense of a 1st or 2nd stage Pokemon."
    }),
    makeGear("held-expert-belt", "Expert Belt", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Super-Effective Moves used by this Pokemon deal 1 extra damage", superEffectiveBonusDice: 1 },
      description: "The symbol of a true martial artist. Super-Effective Moves used by this Pokemon deal 1 extra damage."
    }),
    makeGear("held-focus-sash", "Focus Sash", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "The first time the user would faint due to damage from a move, remain at 1 HP instead", focusSash: true },
      description: "Remain concious until the end. The first time the user would faint due to damage from a move, remain at 1 HP instead."
    }),
    makeGear("held-flame-orb", "Flame Orb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "User gets a 1st degree burn when they come out", onEnterBattleStatus: "burn" },
      description: "A magical orb that casts a small fire. Warning: keep away from children & pets. User gets a 1st degree burn when they come out."
    }),
    makeGear("held-heavy-duty-boots", "Heavy-Duty Boots", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "The user is immune to Entry Hazards", immuneToHazards: true },
      description: "These metal-plated boots will protect your feet even from a bear trap. The user is immune to Entry Hazards."
    }),
    makeGear("held-iron-ball", "Iron Ball", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Reduce Dexterity by 1, remove immunity to Ground-Type", statBonuses: { dexterity: -1 } },
      description: "A heavy ball chain that drags you down. Reduce the user's Dexterity by 1, and remove immunity to Ground-Type."
    }),
    makeGear("held-kings-rock", "King's Rock", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 Chance dice to Flinch on all Special Moves. May trigger Evolution on certain Pokemon", flinchOnHit: true },
      description: "A crown-shaped rock. May trigger Evolution on certain Pokemon. Add 1 Chance dice to Flinch on all Special Moves."
    }),
    makeGear("held-leftovers", "Leftovers", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Heal 1 Damage at the end of the Round. Consumed after healing 3 Damage", endOfRoundHeal: 1, endOfRoundMaxUses: 3 },
      description: "Don't waste food. Heal 1 Damage at the end of the Round. Consumed after healing 3 Damage."
    }),
    makeGear("held-life-orb", "Life Orb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add the Recoil effect and 2 Extra dice to the damage pool of Physical and Special Moves", lifeOrb: true, damageBonusDice: 2, damageBonusType: "none" },
      description: "A cursed item that promises power. Add the Recoil effect and 2 Extra dice to the damage pool of Physical and Special Moves."
    }),
    makeGear("held-loaded-dice", "Loaded Dice", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Moves with Chance Dice effects get 2 Extra Chance dice on each effect", loadedDice: true },
      description: "Sometimes you have to coax lady luck. Moves with Chance Dice effects get 2 Extra Chance dice on each effect."
    }),
    makeGear("held-metronome", "Metronome", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 Extra die to the damage pool of Double, Triple, and Successive Actions", metronomeBonus: true },
      description: "Follow the rhythm to attack in succession. Add 1 Extra die to the damage pool of Double, Triple, and Successive Actions."
    }),
    makeGear("held-power-herb", "Power Herb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Remove the need to charge from a Charge Move. Single use", powerHerb: true },
      description: "This Herb infuses a red energy. Remove the need to charge from a Charge Move. Single use."
    }),
    makeGear("held-protective-pads", "Protective Pads", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Moves and Abilities that activate due to a Non-Ranged Physical Move do not trigger for the user" },
      description: "With this pads on you won't come into direct contact with the foe during close-range combat. Moves and Abilities that activate due to a Non-Ranged Physical Move do not trigger for the user."
    }),
    makeGear("held-quick-claw", "Quick Claw", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Increase user's Initiative roll by 2", statBonuses: { initiative: 2 } },
      description: "These light and sharp claws make you excited to test them out in combat. Increase user's Initiative roll by 2."
    }),
    makeGear("held-razor-claw", "Razor Claw", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "All Physical and Special Moves get the High Critical Effect. Triggers Evolution on certain Pokemon", highCritical: true },
      description: "Deadly claws that trigger Evolution on certain Pokemon. All Physical and Special Moves get the High Critical Effect."
    }),
    makeGear("held-razor-fang", "Razor Fang", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add 1 Chance dice to Flinch on all Physical Moves. Triggers Evolution on certain Pokemon" },
      description: "Sharp fangs that trigger Evolution on certain Pokemon. Add 1 Chance dice to Flinch on all Physical Moves."
    }),
    makeGear("held-red-card", "Red Card", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "After receiving damage, activate the Switcher effect for the foe. Effect activates only once per Round", redCard: true },
      description: "Send an offending Pokemon to the bench! After receiving damage, activate the Switcher effect for the foe. Effect activates only once per Round."
    }),
    makeGear("held-ring-target", "Ring Target", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Remove all immunities of the user", removeTypeImmunities: true },
      description: "There is no escaping harm when you have a target on your back. Remove all immunities of the user."
    }),
    makeGear("held-rocky-helmet", "Rocky Helmet", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Deal 1 damage to a foe hitting the user with a Non-Ranged Physical Move", rockyHelmet: true },
      description: "The best defense is a good offense. Deal 1 damage to a foe hitting the user with a Non-Ranged Physical Move."
    }),
    makeGear("held-safety-goggles", "Safety Goggles", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "The user is immune to the Added Effects of Moves with the words Spore, Powder & Pollen", immuneToSpore: true },
      description: "No more pesky allergies. The user is immune to the Added Effects of Moves with the words Spore, Powder & Pollen."
    }),
    makeGear("held-sticky-barb", "Sticky Barb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Deal 1 Damage to the user at end of Round. If hit with Non-Ranged Physical Move, transfer the Sticky Barb", stickyBarb: true, endOfRoundDamage: 1 },
      description: "Deal 1 Damage to the user at the end of the Round. If hit with a Non-Ranged Physical Move, transfer the sticky Barb."
    }),
    makeGear("held-throat-spray", "Throat Spray", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Increase Special by 1 after using a Sound-Based Move", throatSpray: true },
      description: "This spray relaxes vocal cords. Increase Special by 1 after using a Sound-Based Move."
    }),
    makeGear("held-toxic-orb", "Toxic Orb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "User gets poisoned when they come out", onEnterBattleStatus: "poison" },
      description: "A magical orb that oozes venom. Warning: keep away from children & pets. User gets poisoned when they come out."
    }),
    makeGear("held-umbrella", "Umbrella", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "The user ignores the effects of Sunny, Rain and Hail weather", immuneToWeather: true },
      description: "Rain or shine, you should be prepared. The user ignores the effects of Sunny, Rain and Hail weather."
    }),
    makeGear("held-weakness-policy", "Weakness Policy", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Increase user's Strength and Special by 1 after being hit with a Super-Effective Move", weaknessPolicy: true },
      description: "A policy of compensation for damages. Increase user's Strength and Special by 1 after being hit with a Super-Effective Move."
    }),
    makeGear("held-white-herb", "White Herb", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Restore any lowered Attribute/Trait. Single use", whiteHerb: true },
      description: "This Herb infuses a glowing energy. Restore any lowered Attribute/Trait. Single use."
    }),
    makeGear("held-wide-lens", "Wide Lens", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "The user adds 2 Dice to the Accuracy Roll of their Moves", accuracyBonusDice: 2 },
      description: "These lenses enhace vision so it's easier to see your targets. The user adds 2 Dice to the Accuracy Roll of their Moves."
    }),
    makeGear("held-zoom-lens", "Zoom Lens", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Reduce Low Accuracy on Moves up to 2 points", reducedLowAccuracy: 2 },
      description: "No more suffering from short-sight. Reduce Low Accuracy on Moves up to 2 points. (i.e. Low Accuracy 5 becomes 3)"
    }),
    makeGear("held-bright-powder", "Bright Powder", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Add an Extra Low Accuracy 1 on the Moves targeting this Pokemon", accuracyPenaltyToAttacker: 1 },
      description: "A glitter powder that hurts the foe's eyes. Add an Extra Low Accuracy 1 on the Moves targeting this Pokemon."
    }),
    makeGear("held-air-balloon", "Air Balloon", {
      category: "held",
      pocket: "main",
      consumable: false,
      held: { passiveEffect: "Grants immunity to Ground. Pops upon the user receiving damage" },
      description: "A helium balloon that grants immunity to Ground. Careful as it is very fragile and will pop upon the user receiving damage."
    }),

    // --- Mega Stones ---
    makeGear("held-venusaurite", "Venusaurite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Venusaur" }, description: "Makes Venusaur Mega-evolve into Mega-Venusaur." }),
    makeGear("held-charizardite-x", "Charizardite X", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Charizard" }, description: "Makes Charizard Mega-Evolve into Mega-Charizard X." }),
    makeGear("held-charizardite-y", "Charizardite Y", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Charizard" }, description: "Makes Charizard Mega-Evolve into Mega-Charizard Y." }),
    makeGear("held-blastoisinite", "Blastoisinite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Blastoise" }, description: "Makes Blastoise Mega-evolve into Mega-Blastoise." }),
    makeGear("held-beedrillite", "Beedrillite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Beedrill" }, description: "Makes Beedrill Mega-evolve into Mega-Beedrill." }),
    makeGear("held-pidgeotite", "Pidgeotite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Pidgeot" }, description: "Makes Pidgeot Mega-evolve into Mega-Pidgeot." }),
    makeGear("held-alakazite", "Alakazite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Alakazam" }, description: "Makes Alakazam Mega-evolve into Mega-Alakazam." }),
    makeGear("held-slowbronite", "Slowbronite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Slowbro" }, description: "Makes Slowbro Mega-evolve into Mega-Slowbro." }),
    makeGear("held-gengarite", "Gengarite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Gengar" }, description: "Makes Gengar Mega-evolve into Mega-Gengar." }),
    makeGear("held-kangaskhanite", "Kangaskhanite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Kangaskhan" }, description: "Makes Kangaskhan Mega-evolve into Mega-Kangaskhan." }),
    makeGear("held-pinsirite", "Pinsirite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Pinsir" }, description: "Makes Pinsir Mega-evolve into Mega-Pinsir." }),
    makeGear("held-gyaradosite", "Gyaradosite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Gyarados" }, description: "Makes Gyarados Mega-evolve into Mega-Gyarados." }),
    makeGear("held-aerodactylite", "Aerodactylite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Aerodactyl" }, description: "Makes Aerodactyl Mega-evolve into Mega-Aerodactyl." }),
    makeGear("held-mewtwonite-x", "Mewtwonite X", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Mewtwo" }, description: "Makes Mewtwo Mega-Evolve into Mega-Mewtwo X." }),
    makeGear("held-mewtwonite-y", "Mewtwonite Y", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Mewtwo" }, description: "Makes Mewtwo Mega-Evolve into Mega-Mewtwo Y." }),
    makeGear("held-ampharosite", "Ampharosite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Ampharos" }, description: "Makes Ampharos Mega-evolve into Mega-Ampharos." }),
    makeGear("held-steelixite", "Steelixite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Steelix" }, description: "Makes Steelix Mega-evolve into Mega-Steelix." }),
    makeGear("held-scizorite", "Scizorite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Scizor" }, description: "Makes Scizor Mega-evolve into Mega-Scizor." }),
    makeGear("held-heracronite", "Heracronite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Heracross" }, description: "Makes Heracross Mega-evolve into Mega-Heracross." }),
    makeGear("held-houndoominite", "Houndoominite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Houndoom" }, description: "Makes Houndoom Mega-evolve into Mega-Houndoom." }),
    makeGear("held-tyranitarite", "Tyranitarite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Tyranitar" }, description: "Makes Tyranitar Mega-evolve into Mega-Tyranitar." }),
    makeGear("held-blazikenite", "Blazikenite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Blaziken" }, description: "Makes Blaziken Mega-evolve into Mega-Blaziken." }),
    makeGear("held-gardevoirite", "Gardevoirite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Gardevoir" }, description: "Makes Gardevoir Mega-evolve into Mega-Gardevoir." }),
    makeGear("held-sablenite", "Sablenite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Sableye" }, description: "Makes Sableye Mega-evolve into Mega-Sableye." }),
    makeGear("held-mawilite", "Mawilite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Mawile" }, description: "Makes Mawile Mega-evolve into Mega-Mawile." }),
    makeGear("held-aggronite", "Aggronite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Aggron" }, description: "Makes Aggron Mega-evolve into Mega-Aggron." }),
    makeGear("held-medichamite", "Medichamite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Medicham" }, description: "Makes Medicham Mega-evolve into Mega-Medicham." }),
    makeGear("held-manectite", "Manectite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Manectric" }, description: "Makes Manectric Mega-evolve into Mega-Manectric." }),
    makeGear("held-sharpedonite", "Sharpedonite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Sharpedo" }, description: "Makes Sharpedo Mega-evolve into Mega-Sharpedo." }),
    makeGear("held-cameruptite", "Cameruptite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Camerupt" }, description: "Makes Camerupt Mega-evolve into Mega-Camerupt." }),
    makeGear("held-altarianite", "Altarianite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Altaria" }, description: "Makes Altaria Mega-evolve into Mega-Altaria." }),
    makeGear("held-banettite", "Banettite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Banette" }, description: "Makes Banette Mega-evolve into Mega-Banette." }),
    makeGear("held-absolite", "Absolite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Absol" }, description: "Makes Absol Mega-evolve into Mega-Absol." }),
    makeGear("held-glalitite", "Glalitite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Glalie" }, description: "Makes Glalie Mega-evolve into Mega-Glalie." }),
    makeGear("held-salamencite", "Salamencite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Salamence" }, description: "Makes Salamence Mega-evolve into Mega-Salamence." }),
    makeGear("held-metagrossite", "Metagrossite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Metagross" }, description: "Makes Metagross Mega-evolve into Mega-Metagross." }),
    makeGear("held-latiasite", "Latiasite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Latias" }, description: "Makes Latias Mega-evolve into Mega-Latias." }),
    makeGear("held-latiosite", "Latiosite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Latios" }, description: "Makes Latios Mega-evolve into Mega-Latios." }),
    makeGear("held-sceptilite", "Sceptilite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Sceptile" }, description: "Makes Sceptile Mega-evolve into Mega-Sceptile." }),
    makeGear("held-swampertite", "Swampertite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Swampert" }, description: "Makes Swampert Mega-evolve into Mega-Swampert." }),
    makeGear("held-lopunnite", "Lopunnite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Lopunny" }, description: "Makes Lopunny Mega-evolve into Mega-Lopunny." }),
    makeGear("held-garchompite", "Garchompite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Garchomp" }, description: "Makes Garchomp Mega-evolve into Mega-Garchomp." }),
    makeGear("held-lucarionite", "Lucarionite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Lucario" }, description: "Makes Lucario Mega-evolve into Mega-Lucario." }),
    makeGear("held-abomasite", "Abomasite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Abomasnow" }, description: "Makes Abomasnow Mega-evolve into Mega-Abomasnow." }),
    makeGear("held-galladite", "Galladite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Gallade" }, description: "Makes Gallade Mega-evolve into Mega-Gallade." }),
    makeGear("held-audinite", "Audinite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Audino" }, description: "Makes Audino Mega-evolve into Mega-Audino." }),
    makeGear("held-diancite", "Diancite", { category: "held", pocket: "main", consumable: false, held: { isMegaStone: true, compatiblePokemon: "Diancie" }, description: "Makes Diancie Mega-evolve into Mega-Diancie." }),

    // --- Generic Z-Crystals ---
    makeGear("held-buginium-z", "Buginium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "bug" }, description: "It converts Z-Power into crystals that upgrade Bug-type moves to Bug-type Z-Moves." }),
    makeGear("held-darkinium-z", "Darkinium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "dark" }, description: "It converts Z-Power into crystals that upgrade Dark-type moves to Dark-type Z-Moves." }),
    makeGear("held-dragonium-z", "Dragonium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "dragon" }, description: "It converts Z-Power into crystals that upgrade Dragon-type moves to Dragon-type Z-Moves." }),
    makeGear("held-electrium-z", "Electrium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "electric" }, description: "It converts Z-Power into crystals that upgrade Electric-type moves to Electric-type Z-Moves." }),
    makeGear("held-fairium-z", "Fairium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "fairy" }, description: "It converts Z-Power into crystals that upgrade Fairy-type moves to Fairy-type Z-Moves." }),
    makeGear("held-fightinium-z", "Fightinium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "fighting" }, description: "It converts Z-Power into crystals that upgrade Fighting-type moves to Fighting-type Z-Moves." }),
    makeGear("held-firium-z", "Firium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "fire" }, description: "It converts Z-Power into crystals that upgrade Fire-type moves to Fire-type Z-Moves." }),
    makeGear("held-flyinium-z", "Flyinium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "flying" }, description: "It converts Z-Power into crystals that upgrade Flying-type moves to Flying-type Z-Moves." }),
    makeGear("held-ghostium-z", "Ghostium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "ghost" }, description: "It converts Z-Power into crystals that upgrade Ghost-type moves to Ghost-type Z-Moves." }),
    makeGear("held-grassium-z", "Grassium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "grass" }, description: "It converts Z-Power into crystals that upgrade Grass-type moves to Grass-type Z-Moves." }),
    makeGear("held-groundium-z", "Groundium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "ground" }, description: "It converts Z-Power into crystals that upgrade Ground-type moves to Ground-type Z-Moves." }),
    makeGear("held-icium-z", "Icium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "ice" }, description: "It converts Z-Power into crystals that upgrade Ice-type moves to Ice-type Z-Moves." }),
    makeGear("held-normalium-z", "Normalium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "normal" }, description: "It converts Z-Power into crystals that upgrade Normal-type moves to Normal-type Z-Moves." }),
    makeGear("held-poisonium-z", "Poisonium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "poison" }, description: "It converts Z-Power into crystals that upgrade Poison-type moves to Poison-type Z-Moves." }),
    makeGear("held-psychium-z", "Psychium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "psychic" }, description: "It converts Z-Power into crystals that upgrade Psychic-type moves to Psychic-type Z-Moves." }),
    makeGear("held-rockium-z", "Rockium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "rock" }, description: "It converts Z-Power into crystals that upgrade Rock-type moves to Rock-type Z-Moves." }),
    makeGear("held-steelium-z", "Steelium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "steel" }, description: "It converts Z-Power into crystals that upgrade Steel-type moves to Steel-type Z-Moves." }),
    makeGear("held-waterium-z", "Waterium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "water" }, description: "It converts Z-Power into crystals that upgrade Water-type moves to Water-type Z-Moves." }),

    // --- Special Z-Crystals ---
    makeGear("held-aloraichium-z", "Aloraichium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Alolan Raichu" }, description: "This is a crystallized form of Z-Power. It upgrades Alolan Raichu's Thunderbolt to a Z-Move." }),
    makeGear("held-decidium-z", "Decidium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Decidueye" }, description: "This is a crystallized form of Z-Power. It upgrades Decidueye's Spirit Shackle to a Z-Move." }),
    makeGear("held-eevium-z", "Eevium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Eevee" }, description: "This is a crystallized form of Z-Power. It upgrades Eevee's Last Resort to a Z-Move." }),
    makeGear("held-incinium-z", "Incinium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Incineroar" }, description: "This is a crystallized form of Z-Power. It upgrades Incineroar's Darkest Lariat to a Z-Move." }),
    makeGear("held-kommonium-z", "Kommonium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Kommo-o" }, description: "This is a crystallized form of Z-Power. It upgrades Kommo-o's Clanging Scales to a Z-Move." }),
    makeGear("held-lunalium-z", "Lunalium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Lunala" }, description: "This is a crystallized form of Z-Power. It upgrades Lunala's Moongeist Beam to a Z-Move." }),
    makeGear("held-lycanium-z", "Lycanium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Lycanroc" }, description: "This is a crystallized form of Z-Power. It upgrades Lycanroc's Stone Edge to a Z-Move." }),
    makeGear("held-marshadium-z", "Marshadium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Marshadow" }, description: "This is a crystallized form of Z-Power. It upgrades Marshadow's Spectral Thief to a Z-Move." }),
    makeGear("held-mewnium-z", "Mewnium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Mew" }, description: "This is a crystallized form of Z-Power. It upgrades Mew's Psychic to a Z-Move." }),
    makeGear("held-mimikium-z", "Mimikium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Mimikyu" }, description: "This is a crystallized form of Z-Power. It upgrades Mimikyu's Play Rough to a Z-Move." }),
    makeGear("held-pikanium-z", "Pikanium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Pikachu" }, description: "This is a crystallized form of Z-Power. It upgrades Pikachu's Volt Tackle to a Z-Move." }),
    makeGear("held-pikashunium-z", "Pikashunium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Pikachu (Ash's)" }, description: "This is a crystallized form of Z-Power. It upgrades Pikachu's Thunderbolt to a Z-Move." }),
    makeGear("held-primarium-z", "Primarium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Primarina" }, description: "This is a crystallized form of Z-Power. It upgrades Primarina's Sparkling Aria to a Z-Move." }),
    makeGear("held-snorlium-z", "Snorlium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Snorlax" }, description: "This is a crystallized form of Z-Power. It upgrades Snorlax's Giga Impact to a Z-Move." }),
    makeGear("held-solganium-z", "Solganium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Solgaleo" }, description: "This is a crystallized form of Z-Power. It upgrades Solgaleo's Sunsteel Strike to a Z-Move." }),
    makeGear("held-tapunium-z", "Tapunium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Tapu" }, description: "This is a crystallized form of Z-Power. It upgrades the tapu's Nature's Madness to a Z-Move." }),
    makeGear("held-ultranecrozium-z", "Ultranecrozium Z", { category: "held", pocket: "main", consumable: false, held: { isZCrystal: true, zMoveType: "none", compatiblePokemon: "Necrozma" }, description: "This is a crystallized form of Z-Power. It upgrades Necrozma's Photon Geyser to a Z-Move." })
  ],

  moves: MOVE_COMPENDIUM_ENTRIES,

  pokedex: POKEDEX_COMPENDIUM_ENTRIES,

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
