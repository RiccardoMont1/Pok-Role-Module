import { POKROLE } from "../constants.mjs";

export const COMPENDIUM_SEED_VERSION = "2026-03-08-corebook-items-v2";

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
    img = "icons/svg/item-bag.svg"
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
        restoreAwareness: Boolean(heal.restoreAwareness ?? false)
      },
      status: {
        ...baseStatus(),
        ...status
      },
      description
    },
    flags: {
      [POKROLE.ID]: {
        seedId
      }
    }
  };
}

function makeJournal(seedId, name, html) {
  return {
    name,
    pages: [
      {
        name: "Overview",
        type: "text",
        text: {
          content: html,
          format: 1
        }
      }
    ],
    flags: {
      [POKROLE.ID]: {
        seedId
      }
    }
  };
}

const ITEM_SEEDS = Object.freeze({
  "trainer-items": [
    makeGear("trainer-big-camping-tent", "Big Camping Tent", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Spacious tent for a group. Wild-Pokemon repellent treated."
    }),
    makeGear("trainer-small-camping-tent", "Small Camping Tent", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Compact tent for one person (or two tightly)."
    }),
    makeGear("trainer-sleeping-bag", "Sleeping Bag", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Keeps you warm and dry while camping."
    }),
    makeGear("trainer-camping-stove-cookware", "Camping Stove & Cookware", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Portable setup for cooking warm meals while traveling."
    }),
    makeGear("trainer-pokedex", "Pokedex", {
      category: "key",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Digital encyclopedia with regional Pokemon information."
    }),
    makeGear("trainer-pokedex-upgrade", "Pokedex Upgrade", {
      category: "key",
      pocket: "main",
      consumable: true,
      target: "trainer",
      description: "Corebook p.76. Adds a new region dataset to your Pokedex."
    }),
    makeGear("trainer-compass", "Compass", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Navigation aid for overland routes."
    }),
    makeGear("trainer-regional-map", "Regional Map", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.76. Marked routes, cities and Pokemon Centers."
    }),
    makeGear("trainer-canned-meal", "Canned Meal", {
      category: "travel",
      pocket: "main",
      consumable: true,
      target: "trainer",
      description: "Corebook p.76. One can feeds one person for one day."
    }),
    makeGear("trainer-mountain-bike", "Mountain Bike", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.77. All-terrain transport."
    }),
    makeGear("trainer-inflatable-boat", "Inflatable Boat", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.77. Small single-person boat."
    }),
    makeGear("trainer-fishing-rod", "Fishing Rod", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.77. Used to fish and encounter water Pokemon."
    }),
    makeGear("trainer-saddle", "Saddle", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.77. Riding harness for mounted Pokemon travel."
    }),
    makeGear("trainer-sled", "Sled", {
      category: "travel",
      pocket: "main",
      consumable: false,
      target: "trainer",
      description: "Corebook p.77. Useful on snow, sand, and smooth terrain."
    }),
    makeGear("trainer-pokedolls", "Pokedolls", {
      category: "protective",
      pocket: "main",
      consumable: true,
      target: "trainer",
      description: "Corebook p.77. Life-size decoy used to escape wild Pokemon."
    }),
    makeGear("trainer-pokemon-repel", "Pokemon Repel", {
      category: "protective",
      pocket: "main",
      consumable: true,
      target: "trainer",
      description: "Corebook p.77. Repels most Pokemon for a full day."
    }),
    makeGear("trainer-pepper-spray-can", "Pepper Spray Can", {
      category: "protective",
      pocket: "main",
      target: "trainer",
      units: { value: 5, max: 5 },
      description: "Corebook p.77. Scares small Pokemon away. Good for 5 uses."
    }),
    makeGear("trainer-pokeball", "Pokeball", {
      category: "pokeball",
      pocket: "main",
      canUseInBattle: true,
      description: "Corebook p.80. Basic capture ball (Seal Potency 4 Dice)."
    }),
    makeGear("trainer-great-ball", "Great Ball", {
      category: "pokeball",
      pocket: "main",
      canUseInBattle: true,
      description: "Corebook p.80. Improved capture ball (Seal Potency 6 Dice)."
    }),
    makeGear("trainer-ultra-ball", "Ultra Ball", {
      category: "pokeball",
      pocket: "main",
      canUseInBattle: true,
      description: "Corebook p.80. Advanced capture ball (Seal Potency 8 Dice)."
    }),
    makeGear("trainer-master-ball", "Master Ball", {
      category: "pokeball",
      pocket: "main",
      consumable: false,
      canUseInBattle: true,
      description: "Corebook p.80. Not for sale. Legendary capture ball prototype."
    }),
    makeGear("trainer-revive", "Revive", {
      category: "revive",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { hp: 1, restoreAwareness: true },
      description: "Corebook p.79. Recover 1 HP and restore awareness."
    }),
    makeGear("trainer-max-revive", "Max Revive", {
      category: "revive",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true, restoreAwareness: true },
      description: "Corebook p.79. Not for sale. Recover full HP and restore awareness."
    })
  ],

  "healing-items": [
    makeGear("heal-potion", "Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 2, max: 2 },
      heal: { hp: 1 },
      description: "Corebook p.77. Basic spray. 2 units, each use heals 1 HP."
    }),
    makeGear("heal-super-potion", "Super Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 4, max: 4 },
      heal: { hp: 1 },
      description: "Corebook p.77. Concentrated spray. 4 units, each use heals 1 HP."
    }),
    makeGear("heal-hyper-potion", "Hyper Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      units: { value: 14, max: 14 },
      heal: { hp: 1 },
      description: "Corebook p.77. Value pack spray. 14 units, each use heals 1 HP."
    }),
    makeGear("heal-max-potion", "Max Potion", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true },
      description: "Corebook p.77. Single-use capsule. Recover full HP."
    }),
    makeGear("heal-full-restore", "Full Restore", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      target: "any",
      heal: { fullHp: true },
      status: { all: true },
      description: "Corebook p.77. Single-use capsule. Recover full HP and heal status."
    }),
    makeGear("heal-antidote", "Antidote", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { poison: true },
      description: "Corebook p.78. Heals Poison and Poison+."
    }),
    makeGear("heal-awakening", "Awakening", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { sleep: true },
      description: "Corebook p.78. Heals Sleep."
    }),
    makeGear("heal-burn-heal", "Burn Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { burn: true },
      description: "Corebook p.78. Heals Burn 1, Burn 2, Burn 3."
    }),
    makeGear("heal-ice-heal", "Ice Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { frozen: true },
      description: "Corebook p.78. Heals Frozen Solid."
    }),
    makeGear("heal-paralyze-heal", "Paralyze Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { paralysis: true },
      description: "Corebook p.78. Heals Paralysis."
    }),
    makeGear("heal-full-heal", "Full Heal", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      description: "Corebook p.78. Heals all status ailments."
    }),

    makeGear("berry-oran", "Oran Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 1 },
      description: "Corebook p.78. Heals 1 damage."
    }),
    makeGear("berry-sitrus", "Sitrus Berry", {
      category: "healing",
      pocket: "small",
      canUseInBattle: true,
      heal: { hp: 3, lethal: 1 },
      description: "Corebook p.78. Heals 3 damage or 1 lethal damage."
    }),
    makeGear("berry-pecha", "Pecha Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { poison: true },
      description: "Corebook p.78. Heals Poison."
    }),
    makeGear("berry-cheri", "Cheri Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { paralysis: true },
      description: "Corebook p.78. Heals Paralysis."
    }),
    makeGear("berry-chesto", "Chesto Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { sleep: true },
      description: "Corebook p.78. Heals Sleep."
    }),
    makeGear("berry-rawst", "Rawst Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { burn: true },
      description: "Corebook p.78. Heals Burn 1 and Burn 2."
    }),
    makeGear("berry-aspear", "Aspear Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { frozen: true },
      description: "Corebook p.78. Heals Frozen Solid."
    }),
    makeGear("berry-persim", "Persim Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { confusion: true },
      description: "Corebook p.78. Heals Confusion."
    }),
    makeGear("berry-lum", "Lum Berry", {
      category: "status",
      pocket: "small",
      canUseInBattle: true,
      status: { all: true },
      description: "Corebook p.78. Heals all status ailments."
    }),

    makeGear("herb-energy-root", "Energy Root", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      heal: { hp: 14 },
      description: "Corebook p.79. Equals 14 units of potion."
    }),
    makeGear("herb-energy-powder", "Energy Powder", {
      category: "healing",
      pocket: "potions",
      canUseInBattle: true,
      heal: { hp: 4 },
      description: "Corebook p.79. Equals 4 units of potion."
    }),
    makeGear("herb-heal-powder", "Heal Powder", {
      category: "status",
      pocket: "potions",
      canUseInBattle: true,
      status: { all: true },
      description: "Corebook p.79. Heals any status ailment."
    }),
    makeGear("herb-revival-herb", "Revival Herb", {
      category: "revive",
      pocket: "potions",
      canUseInBattle: true,
      heal: { fullHp: true, restoreAwareness: true },
      description: "Corebook p.79. Recover full HP and restore awareness."
    }),

    makeGear("drink-berry-juice", "Berry Juice", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 2 },
      description: "Corebook p.80. Restores up to 2 HP. Not usable in battle."
    }),
    makeGear("drink-fresh-water", "Fresh Water", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 4 },
      description: "Corebook p.80. Restores up to 4 HP. Not usable in battle."
    }),
    makeGear("drink-sodapop", "Sodapop", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 5 },
      description: "Corebook p.80. Restores up to 5 HP. Not usable in battle."
    }),
    makeGear("drink-lemonade", "Lemonade", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 6 },
      description: "Corebook p.80. Restores up to 6 HP. Not usable in battle."
    }),
    makeGear("drink-moomoo-milk", "MooMoo Milk", {
      category: "drink",
      pocket: "main",
      canUseInBattle: false,
      heal: { hp: 7 },
      description: "Corebook p.80. Restores up to 7 HP. Not usable in battle."
    })
  ],

  "pokemon-care-items": [
    makeGear("care-dry-food", "Pokemon Dry Food Pack", {
      category: "care",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Feed one small/medium Pokemon for one day."
    }),
    makeGear("care-gourmet-can", "Gourmet Food Can", {
      category: "care",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Premium ingredients to improve bonding."
    }),
    makeGear("care-high-performance-sack", "High Performance Food Sack", {
      category: "care",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Add 1 die to the next Training Roll."
    }),

    makeGear("vitamin-protein", "Protein", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Temporary +1 Strength for one month (within limits)."
    }),
    makeGear("vitamin-iron", "Iron", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Temporary +1 Vitality for one month (within limits)."
    }),
    makeGear("vitamin-calcium", "Calcium", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Temporary +1 Special for one month (within limits)."
    }),
    makeGear("vitamin-zinc", "Zinc", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Temporary +1 Insight for one month (within limits)."
    }),
    makeGear("vitamin-carbos", "Carbos", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Temporary +1 Dexterity for one month (within limits)."
    }),
    makeGear("vitamin-pp-up", "PP Up", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.81. Increase Will by 2."
    }),
    makeGear("vitamin-hp-up", "HP Up", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.82. Increase Base HP by 2."
    }),
    makeGear("vitamin-rare-candy", "Rare Candy", {
      category: "vitamin",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.82. Boost one attribute (non-stacking)."
    }),

    makeGear("grooming-kit", "Grooming Kit", {
      category: "grooming",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.82. Improves care and presentation."
    }),
    makeGear("grooming-costume", "Pokemon Costume", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      canUseInBattle: false,
      description: "Corebook p.82. Cosmetic outfit for Pokemon."
    }),
    makeGear("grooming-accessory-piece", "Piece of Accessory", {
      category: "grooming",
      pocket: "main",
      consumable: false,
      canUseInBattle: false,
      description: "Corebook p.82. Ribbons, hats, collars, and similar accessories."
    })
  ],

  "evolutionary-items": [
    makeGear("evo-fire-stone", "Fire Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone. Becomes a regular rock after use."
    }),
    makeGear("evo-thunder-stone", "Thunder Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-water-stone", "Water Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-leaf-stone", "Leaf Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-moon-stone", "Moon Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-sun-stone", "Sun Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-shiny-stone", "Shiny Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-dusk-stone", "Dusk Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    }),
    makeGear("evo-dawn-stone", "Dawn Stone", {
      category: "evolution",
      pocket: "main",
      canUseInBattle: false,
      description: "Corebook p.83. Evolutionary stone."
    })
  ],

  "held-items": [
    makeGear("held-black-belt", "Black Belt", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-black-glasses", "Black Glasses", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-charcoal", "Charcoal", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-dragon-fang", "Dragon Fang", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-hard-stone", "Hard Stone", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-magnet", "Magnet", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-metal-coat", "Metal Coat", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-miracle-seed", "Miracle Seed", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-mystic-water", "Mystic Water", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-never-melt-ice", "Never-Melt Ice", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-poison-barb", "Poison Barb", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-sharp-beak", "Sharp Beak", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-silk-scarf", "Silk Scarf", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-silver-powder", "Silver Powder", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-soft-sand", "Soft Sand", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-spell-tag", "Spell Tag", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.84. Type damage booster." }),
    makeGear("held-twisted-spoon", "Twisted Spoon", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Psychic-type damage booster." }),

    makeGear("held-light-ball", "Light Ball", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Signature held item." }),
    makeGear("held-lucky-punch", "Lucky Punch", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Signature held item." }),
    makeGear("held-stick", "Stick", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Signature held item." }),
    makeGear("held-thick-club", "Thick Club", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Signature held item." }),

    makeGear("held-amulet-coin", "Amulet Coin", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Doubles money prize." }),
    makeGear("held-eviolite", "Eviolite", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Boosts defenses of unevolved Pokemon." }),
    makeGear("held-expert-belt", "Expert Belt", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Adds damage to super-effective moves." }),
    makeGear("held-life-orb", "Life Orb", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Adds damage and recoil to attacks." }),
    makeGear("held-kings-rock", "King's Rock", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Special held item effects by move/species." }),
    makeGear("held-lucky-egg", "Lucky Egg", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Counts as two victories for evolution purposes." }),
    makeGear("held-quick-claw", "Quick Claw", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Initiative bonus item." }),
    makeGear("held-razor-claw", "Razor Claw", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Critical/combat support item." }),
    makeGear("held-razor-fang", "Razor Fang", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Combat support item." }),
    makeGear("held-rocky-helmet", "Rocky Helmet", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Reflect damage on non-ranged physical attacks." }),
    makeGear("held-wide-lens", "Wide Lens", { category: "held", pocket: "held", consumable: false, canUseInBattle: true, description: "Corebook p.85. Accuracy bonus item." })
  ]
});

const JOURNAL_SEEDS = Object.freeze({
  pokedex: [
    makeJournal(
      "pokedex-window-reference",
      "Pokedex Window Reference",
      "<h2>Pokedex Window</h2><p><strong>Source:</strong> Corebook p.22</p><ul><li>Pokemon picture and Dex Number.</li><li>Species/Nickname and Ability.</li><li>Quick references: HP, Will, Held Item, Status, Initiative, Accuracy, Damage, Evasion, Clash, DEF/S.DEF, Rank.</li><li>Move windows and Attributes/Skills area.</li></ul>"
    )
  ],
  "weather-conditions": [
    makeJournal(
      "weather-sunny",
      "Sunny Weather",
      "<p><strong>Source:</strong> Corebook p.56</p><ul><li>Fire moves gain +1 damage die.</li><li>Water moves total damage -1.</li><li>Frozen status cannot be inflicted.</li></ul>"
    ),
    makeJournal(
      "weather-rain",
      "Rain Weather",
      "<p><strong>Source:</strong> Corebook p.56</p><ul><li>Water moves gain +1 damage die.</li><li>Fire moves total damage -1.</li></ul>"
    ),
    makeJournal(
      "weather-sandstorm",
      "Sandstorm Weather",
      "<p><strong>Source:</strong> Corebook p.56</p><ul><li>End of round: non Rock/Ground/Steel Pokemon take 1 damage.</li><li>Rock Pokemon gain +1 Special Defense.</li></ul>"
    ),
    makeJournal(
      "weather-hail",
      "Hail Weather",
      "<p><strong>Source:</strong> Corebook p.57</p><ul><li>End of round: non Ice Pokemon take 1 damage.</li><li>Ice Pokemon gain +1 Defense.</li></ul>"
    ),
    makeJournal(
      "weather-fog-darkness",
      "Fog / Darkness",
      "<p><strong>Source:</strong> Corebook p.57</p><p>All Pokemon get extra Reduced Accuracy on moves.</p>"
    ),
    makeJournal(
      "weather-muddy",
      "Muddy",
      "<p><strong>Source:</strong> Corebook p.57</p><p>Mobility is reduced; Pokemon cannot get out of range.</p>"
    ),
    makeJournal(
      "weather-on-fire",
      "On Fire!",
      "<p><strong>Source:</strong> Corebook p.57</p><p>Environmental challenge that inflicts end-of-round damage.</p>"
    )
  ],
  "pokemon-status": [
    makeJournal("status-burn-1", "Burn 1", "<p><strong>Source:</strong> Corebook p.58</p><p>End of round: 1 damage. Fire-type immune.</p>"),
    makeJournal("status-burn-2", "Burn 2", "<p><strong>Source:</strong> Corebook p.58</p><p>End of round: 2 lethal damage. Fire-type immune.</p>"),
    makeJournal("status-burn-3", "Burn 3", "<p><strong>Source:</strong> Corebook p.58</p><p>End of round: 3 lethal damage. Fire-type immune.</p>"),
    makeJournal("status-frozen-solid", "Frozen Solid", "<p><strong>Source:</strong> Corebook p.58</p><p>Target cannot act until thawed by rules/effects.</p>"),
    makeJournal("status-paralysis", "Paralysis", "<p><strong>Source:</strong> Corebook p.58</p><p>Muscle cramps and reduced performance until cured.</p>"),
    makeJournal("status-poison", "Poison / Poison+", "<p><strong>Source:</strong> Corebook p.58</p><p>Poisoned target takes recurring damage by severity.</p>"),
    makeJournal("status-sleep", "Sleep", "<p><strong>Source:</strong> Corebook p.59</p><p>Cannot act while asleep; may wake with Insight checks under stress.</p>"),
    makeJournal("status-confused", "Confused", "<p><strong>Source:</strong> Corebook p.59</p><p>Removes 1 success from action rolls; on failed action, self-damage.</p>"),
    makeJournal("status-flinched", "Flinched", "<p><strong>Source:</strong> Corebook p.59</p><p>Target hesitates and loses immediate action flow.</p>")
  ],
  abilities: [
    makeJournal(
      "abilities-reference",
      "Abilities Reference",
      "<p><strong>Source:</strong> Corebook p.22 and species entries.</p><p>Pokemon abilities are selected from each species Pokedex entry and applied on the Pokemon sheet.</p>"
    ),
    makeJournal(
      "abilities-hidden",
      "Hidden Abilities",
      "<p><strong>Source:</strong> Corebook p.69</p><p>Some Pokemon may present hidden/rare abilities and moves at storyteller discretion.</p>"
    )
  ]
});

function getSeedCollection(packName, documentName) {
  if (documentName === "Item") return ITEM_SEEDS[packName] ?? [];
  if (documentName === "JournalEntry") return JOURNAL_SEEDS[packName] ?? [];
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

export async function seedCompendia({ force = false, notify = true } = {}) {
  if (!game.user?.isGM) {
    if (notify) ui.notifications?.warn("Only a GM can seed compendia.");
    return { totalCreated: 0, createdByPack: {} };
  }

  const createdByPack = {};
  let totalCreated = 0;

  for (const pack of game.packs.values()) {
    if (pack.metadata?.packageName !== POKROLE.ID) continue;
    const seeds = getSeedCollection(pack.metadata.name, pack.documentName);
    if (!seeds.length) continue;

    const shouldRelock = await ensureUnlocked(pack);
    try {
      const index = await pack.getIndex({ fields: ["flags"] });
      if (force && index.length > 0) {
        const ids = index.map((entry) => entry._id).filter(Boolean);
        if (ids.length > 0) {
          await pack.documentClass.deleteDocuments(ids, { pack: pack.collection });
        }
      }

      const freshIndex = force ? [] : await pack.getIndex({ fields: ["flags"] });
      const existingSeedIds = new Set(
        freshIndex
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
