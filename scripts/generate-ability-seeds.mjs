/**
 * Script to generate ability-seeds.mjs from all_abilities.json
 * Run with: node scripts/generate-ability-seeds.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const abilitiesPath = resolve(__dirname, "../../all_abilities.json");
const outputPath = resolve(__dirname, "../module/seeds/generated/ability-seeds.mjs");

const abilities = JSON.parse(readFileSync(abilitiesPath, "utf-8"));

// ---- AUTOMATION DEFINITIONS for Category A (fully automatable) ----

const AUTOMATIONS = {
  // --- Condition immunities (runtime immunity handled by _getAbilityConditionImmunityDetail) ---
  "insomnia": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: sleep"
  },
  "vital-spirit": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: sleep"
  },
  "limber": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: paralyzed"
  },
  "magma-armor": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: frozen"
  },
  "own-tempo": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: confused"
  },
  "water-veil": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: burn"
  },
  "oblivious": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: infatuated"
  },
  "immunity": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: poisoned, badly-poisoned"
  },
  "inner-focus": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: flinch. Intimidate has no effect."
  },

  // --- Stat boost with HP ≤ 50% ---
  "anger-shell": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [
      { effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self" },
      { effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self" },
      { effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" },
      { effectType: "combat-stat", stat: "defense", amount: -1, trigger: "always", target: "self" },
      { effectType: "combat-stat", stat: "specialDefense", amount: -1, trigger: "always", target: "self" }
    ]
  },
  "berserk": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [{ effectType: "stat", stat: "special", amount: 2, trigger: "always", target: "self" }]
  },

  // --- Stat boost with condition ---
  "flare-boost": {
    type: "passive", trigger: "self-has-condition", target: "self",
    triggerConditionType: "burn",
    effects: [{ effectType: "stat", stat: "special", amount: 2, trigger: "always", target: "self" }]
  },
  "guts": {
    type: "passive", trigger: "self-has-condition", target: "self",
    triggerConditionType: "burn,frozen,paralyzed,poisoned,sleep",
    effects: [{ effectType: "stat", stat: "strength", amount: 2, trigger: "always", target: "self" }]
  },
  "marvel-scale": {
    type: "passive", trigger: "self-has-condition", target: "self",
    triggerConditionType: "burn,frozen,paralyzed,poisoned,sleep",
    effects: [{ effectType: "stat", stat: "defense", amount: 2, trigger: "always", target: "self" }]
  },
  "quick-feet": {
    type: "passive", trigger: "self-has-condition", target: "self",
    triggerConditionType: "burn,frozen,paralyzed,poisoned,sleep",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 2, trigger: "always", target: "self" }]
  },
  "toxic-boost": {
    type: "passive", trigger: "self-has-condition", target: "self",
    triggerConditionType: "poisoned,badly-poisoned",
    effects: [{ effectType: "stat", stat: "strength", amount: 2, trigger: "always", target: "self" }]
  },

  // --- Always-on stat boosts ---
  "huge-power": {
    type: "passive", trigger: "always", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", notes: "rank-expert-double" }]
  },
  "pure-power": {
    type: "passive", trigger: "always", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", notes: "rank-expert-double" }]
  },

  // --- Weather on entry ---
  "drizzle": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "rain", trigger: "always", target: "self" }]
  },
  "drought": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "sunny", trigger: "always", target: "self" }]
  },
  "sand-stream": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "sandstorm", trigger: "always", target: "self" }]
  },
  "snow-warning": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "hail", trigger: "always", target: "self" }]
  },
  "delta-stream": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "strong-winds", trigger: "always", target: "self" }]
  },
  "desolate-land": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "harsh-sunlight", trigger: "always", target: "self" }]
  },
  "primordial-sea": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "weather", weather: "typhoon", trigger: "always", target: "self" }]
  },

  // --- Terrain on entry ---
  "electric-surge": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "terrain", terrain: "electric", trigger: "always", target: "self" }]
  },
  "grassy-surge": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "terrain", terrain: "grassy", trigger: "always", target: "self" }]
  },
  "misty-surge": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "terrain", terrain: "misty", trigger: "always", target: "self" }]
  },
  "psychic-surge": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "terrain", terrain: "psychic", trigger: "always", target: "self" }]
  },

  // --- Weather + stat combos on entry ---
  "orichalcum-pulse": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [
      { effectType: "weather", weather: "sunny", trigger: "always", target: "self" },
      { effectType: "stat", stat: "strength", amount: 2, trigger: "always", target: "self", notes: "While Sunny Weather is active" }
    ]
  },
  "hadron-engine": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [
      { effectType: "terrain", terrain: "electric", trigger: "always", target: "self" },
      { effectType: "stat", stat: "special", amount: 2, trigger: "always", target: "self", notes: "While Electric Terrain is active" }
    ]
  },

  // --- Stat changes on entry (on foes or self) ---
  "intimidate": {
    type: "passive", trigger: "enter-battle", target: "all-foes",
    effects: [{ effectType: "stat", stat: "strength", amount: -1, trigger: "always", target: "all-foes", durationMode: "combat" }]
  },
  "intrepid-sword": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 2, trigger: "always", target: "self" }]
  },
  "dauntless-shield": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "stat", stat: "defense", amount: 2, trigger: "always", target: "self" }]
  },

  // --- Stat change when stat is lowered by foe ---
  "competitive": {
    type: "passive", trigger: "on-stat-lowered", target: "self",
    effects: [{ effectType: "stat", stat: "special", amount: 2, trigger: "always", target: "self" }],
    notes: "When an Attribute is reduced by a foe"
  },
  "defiant": {
    type: "passive", trigger: "on-stat-lowered", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 2, trigger: "always", target: "self" }],
    notes: "When an Attribute is reduced by a foe"
  },
  "anger-point": {
    type: "passive", trigger: "on-critical-hit-received", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 3, trigger: "always", target: "self" }]
  },
  "stamina": {
    type: "passive", trigger: "on-hit-by-any", target: "self",
    effects: [
      { effectType: "stat", stat: "defense", amount: 1, trigger: "always", target: "self" },
      { effectType: "stat", stat: "specialDefense", amount: 1, trigger: "always", target: "self" }
    ],
    notes: "First time this Pokemon receives damage"
  },
  "weak-armor": {
    type: "passive", trigger: "on-hit-by-physical", target: "self",
    effects: [
      { effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" },
      { effectType: "stat", stat: "defense", amount: -1, trigger: "always", target: "self" }
    ],
    notes: "First time hit by any Physical Move"
  },
  "steadfast": {
    type: "passive", trigger: "on-hit-by-any", target: "self",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" }],
    notes: "First time affected by Flinch"
  },
  "gooey": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "stat", stat: "dexterity", amount: -1, trigger: "always", target: "target" }],
    notes: "First time foe hits with Non-Ranged Physical"
  },
  "tangling-hair": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "stat", stat: "dexterity", amount: -1, trigger: "always", target: "target" }],
    notes: "First time foe hits with Non-Ranged Physical"
  },

  // --- Stat change on hit by type ---
  "justified": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "dark",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points"
  },
  "rattled": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "bug,dark,ghost",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" }],
    notes: "Also triggers when Intimidate lowers stats"
  },
  "steam-engine": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "fire,water",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 3, trigger: "always", target: "self" }],
    notes: "First time hit by Fire or Water"
  },
  "thermal-exchange": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "fire",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self" }],
    notes: "IMMUNE: burn. First time hit by Fire"
  },

  // --- Condition application on contact (with chance dice) ---
  "flame-body": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "burn2", chance: 3, trigger: "always", target: "target" }]
  },
  "static": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "paralyzed", chance: 3, trigger: "always", target: "target" }]
  },
  "poison-point": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "poisoned", chance: 3, trigger: "always", target: "target" }]
  },
  "poison-touch": {
    type: "passive", trigger: "on-deal-damage", target: "foe",
    effects: [{ effectType: "condition", condition: "poisoned", chance: 2, trigger: "on-hit", target: "target" }],
    notes: "When hitting with Non-Ranged Physical Move"
  },
  "cute-charm": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "infatuated", chance: 3, trigger: "always", target: "target" }]
  },
  "effect-spore": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "poisoned", chance: 3, trigger: "always", target: "target" }],
    notes: "Random: Poison, Paralyze, or Sleep"
  },
  "stench": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "condition", condition: "flinch", chance: 1, trigger: "always", target: "target" }]
  },
  "toxic-chain": {
    type: "passive", trigger: "on-deal-damage", target: "foe",
    effects: [{ effectType: "condition", condition: "badly-poisoned", chance: 3, trigger: "on-hit", target: "target" }],
    notes: "When hitting with Non-Ranged Physical Move"
  },
  "synchronize": {
    type: "passive", trigger: "on-hit-by-any", target: "attacker",
    effects: [],
    notes: "Mirror any status inflicted by foe onto foe"
  },
  "cursed-body": {
    type: "passive", trigger: "on-hit-by-any", target: "attacker",
    effects: [{ effectType: "condition", condition: "disabled", chance: 3, trigger: "always", target: "target" }],
    notes: "Up to 3 Moves may be disabled"
  },
  "poison-puppeteer": {
    type: "passive", trigger: "on-deal-damage", target: "foe",
    effects: [{ effectType: "condition", condition: "confused", trigger: "always", target: "target" }],
    notes: "Only if move caused Poison or Badly Poison"
  },

  // --- Heal/Damage effects ---
  "rain-dish": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "heal", amount: 1, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "While Rain Weather is active"
  },
  "ice-body": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "heal", amount: 1, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "While Hail/Snow Weather is active. IMMUNE: hail weather damage"
  },
  "solar-power": {
    type: "passive", trigger: "round-end", target: "self",
    triggerConditionWeather: "sunny",
    effects: [
      { effectType: "stat", stat: "special", amount: 2, trigger: "always", target: "self" },
      { effectType: "damage", amount: 1, trigger: "always", target: "self" }
    ],
    notes: "While Sunny Weather is active"
  },
  "bad-dreams": {
    type: "passive", trigger: "round-end", target: "all-foes",
    effects: [{ effectType: "damage", amount: 1, trigger: "always", target: "all-foes" }],
    notes: "Only targets with Sleep Status Condition"
  },
  "aftermath": {
    type: "passive", trigger: "on-self-faint", target: "attacker",
    effects: [{ effectType: "damage", amount: 2, trigger: "always", target: "target" }],
    notes: "Only if fainted due to Non-Ranged Physical Move"
  },
  "innards-out": {
    type: "passive", trigger: "on-self-faint", target: "attacker",
    effects: [{ effectType: "damage", amount: 0, trigger: "always", target: "target" }],
    notes: "Damage = remaining HP before fainting"
  },
  "pressure": {
    type: "passive", trigger: "enter-battle", target: "all-foes",
    effects: [{ effectType: "will", amount: -50, trigger: "always", target: "all-foes" }],
    notes: "Foes spend half (rounded up) of remaining Will"
  },
  "hospitality": {
    type: "passive", trigger: "enter-battle", target: "ally",
    effects: [{ effectType: "heal", amount: 3, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "Heal up to 3 HP to a damaged Ally. Costs 1 Will. No Lethal healing"
  },

  // --- Cleanse effects ---
  "hydration": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "cleanse", trigger: "always", target: "self", notes: "all" }],
    notes: "While Rain Weather is active"
  },
  "natural-cure": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "cleanse", trigger: "always", target: "self", chance: 3, notes: "all" }],
    notes: "Roll 3 Chance Dice to heal"
  },
  "shed-skin": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "cleanse", trigger: "always", target: "self", chance: 3, notes: "random one" }],
    notes: "Roll 3 Chance Dice. One ailment healed at random"
  },
  "healer": {
    type: "passive", trigger: "round-end", target: "ally",
    effects: [{ effectType: "cleanse", trigger: "always", target: "self", chance: 3, notes: "ally ailment" }],
    notes: "3 Chance Dice to heal ally's Status Ailment"
  },

  // --- Stat on foe faint ---
  "moxie": {
    type: "passive", trigger: "on-foe-faint", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points"
  },
  "chilling-neigh": {
    type: "passive", trigger: "on-foe-faint", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points"
  },
  "grim-neigh": {
    type: "passive", trigger: "on-foe-faint", target: "self",
    effects: [{ effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points"
  },
  "soul-heart": {
    type: "passive", trigger: "on-foe-faint", target: "self",
    effects: [{ effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points"
  },
  "beast-boost": {
    type: "passive", trigger: "on-foe-faint", target: "self",
    effects: [{ effectType: "stat", stat: "none", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Increase highest Attribute by 1. Up to 3 points"
  },
  "supreme-overlord": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [
      { effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self", maxStacks: 3 },
      { effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self", maxStacks: 3 }
    ],
    notes: "+1 STR and SPC per fainted ally. Up to 3 points"
  },

  // --- Round-end stat boost ---
  "speed-boost": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self", maxStacks: 3 }],
    notes: "Up to 3 points may be added"
  },
  "moody": {
    type: "passive", trigger: "round-end", target: "self",
    effects: [
      { effectType: "stat", stat: "none", amount: -1, trigger: "always", target: "self" },
      { effectType: "stat", stat: "none", amount: 1, trigger: "always", target: "self" }
    ],
    notes: "Reset previous Moody changes, then random -1 and +1"
  },

  // --- Field-wide stat reductions (Ruin abilities) ---
  "beads-of-ruin": {
    type: "passive", trigger: "enter-battle", target: "all-in-range",
    effects: [{ effectType: "stat", stat: "specialDefense", amount: -2, trigger: "always", target: "all-foes", durationMode: "combat" }],
    notes: "Reduce SpDEF of everyone except self. Immune to other Ruin abilities"
  },
  "sword-of-ruin": {
    type: "passive", trigger: "enter-battle", target: "all-in-range",
    effects: [{ effectType: "stat", stat: "defense", amount: -2, trigger: "always", target: "all-foes", durationMode: "combat" }],
    notes: "Reduce DEF of everyone except self. Immune to other Ruin abilities"
  },
  "tablets-of-ruin": {
    type: "passive", trigger: "enter-battle", target: "all-in-range",
    effects: [{ effectType: "stat", stat: "strength", amount: -2, trigger: "always", target: "all-foes", durationMode: "combat" }],
    notes: "Reduce STR of everyone except self. Immune to other Ruin abilities"
  },
  "vessel-of-ruin": {
    type: "passive", trigger: "enter-battle", target: "all-in-range",
    effects: [{ effectType: "stat", stat: "special", amount: -2, trigger: "always", target: "all-foes", durationMode: "combat" }],
    notes: "Reduce SPC of everyone except self. Immune to other Ruin abilities"
  },

  // --- Condition immunity + additional effect combos ---
  "pastel-veil": {
    type: "passive", trigger: "always", target: "self",
    effects: [], notes: "IMMUNE: poisoned, badly-poisoned (self + allies in range)"
  },
  "sweet-veil": {
    type: "passive", trigger: "always", target: "self",
    effects: [], notes: "IMMUNE: sleep (self + allies in range)"
  },
  "comatose": {
    type: "passive", trigger: "always", target: "self",
    effects: [{ effectType: "condition", condition: "sleep", trigger: "always", target: "self", chance: 0 }],
    notes: "Permanent Sleep but immune to its effects. Can't have other ailments"
  },

  // --- Misc entry effects ---
  "gorilla-tactics": {
    type: "active", trigger: "enter-battle", target: "self",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self" }],
    notes: "Choose one Move; can only use that Move in battle (up to 5x/round)"
  },
  "unburden": {
    type: "passive", trigger: "custom", target: "self",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 2, trigger: "always", target: "self" }],
    notes: "First time this Pokemon spends or loses its held item"
  },

  // --- Damage survival ---
  "sturdy": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Survives lethal damage at 1 HP when at full HP. Automated in damage calculation."
  },

  // --- On-hit-by-contact damage to attacker ---
  "rough-skin": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "damage", amount: 1, trigger: "always", target: "target" }],
    notes: "Deal 1 damage to attacker when hit by Non-Ranged Physical Move"
  },
  "iron-barbs": {
    type: "passive", trigger: "on-hit-by-contact", target: "attacker",
    effects: [{ effectType: "damage", amount: 1, trigger: "always", target: "target" }],
    notes: "Deal 1 damage to attacker when hit by Non-Ranged Physical Move"
  },

  // --- Weather/Terrain set on hit ---
  "sand-spit": {
    type: "passive", trigger: "on-hit-by-contact", target: "self",
    effects: [{ effectType: "weather", weather: "sandstorm", trigger: "always", target: "self" }],
    notes: "Start Sandstorm when hit by Non-Ranged Physical Move"
  },
  "seed-sower": {
    type: "passive", trigger: "on-hit-by-any", target: "self",
    effects: [{ effectType: "terrain", terrain: "grassy", trigger: "always", target: "self" }],
    notes: "Start Grassy Terrain when hit by Physical or Special Move"
  },

  // --- Weather-active stat boosts ---
  "chlorophyll": {
    type: "passive", trigger: "weather-active", target: "self",
    triggerConditionWeather: "sunny,harsh-sunlight",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 2, trigger: "always", target: "self" }],
    notes: "While Sunny Weather is active: +2 Dexterity"
  },
  "swift-swim": {
    type: "passive", trigger: "weather-active", target: "self",
    triggerConditionWeather: "rain,typhoon",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 2, trigger: "always", target: "self" }],
    notes: "While Rain Weather is active: +2 Dexterity"
  },
  "sand-rush": {
    type: "passive", trigger: "weather-active", target: "self",
    triggerConditionWeather: "sandstorm",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" }],
    notes: "While Sandstorm is active: +1 Dexterity. Immune to Sandstorm damage"
  },
  "slush-rush": {
    type: "passive", trigger: "weather-active", target: "self",
    triggerConditionWeather: "hail,snow",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" }],
    notes: "While Hail/Snow is active: +1 Dexterity. Immune to Hail damage"
  },

  // --- Terrain-active stat boosts ---
  "surge-surfer": {
    type: "passive", trigger: "terrain-active", target: "self",
    triggerConditionTerrain: "electric",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 2, trigger: "always", target: "self" }],
    notes: "While Electric Terrain is active: +2 Dexterity"
  },
  "grass-pelt": {
    type: "passive", trigger: "terrain-active", target: "self",
    triggerConditionTerrain: "grassy",
    effects: [{ effectType: "stat", stat: "defense", amount: 2, trigger: "always", target: "self" }],
    notes: "While Grassy Terrain is active: +2 Defense"
  },

  // --- HP threshold debuff ---
  "defeatist": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [
      { effectType: "stat", stat: "strength", amount: -2, trigger: "always", target: "self" },
      { effectType: "stat", stat: "special", amount: -2, trigger: "always", target: "self" }
    ],
    notes: "At half or less HP: -2 Strength and -2 Special"
  },

  // --- Type-absorb abilities (stat boost/heal on hit by type; type immunity noted) ---
  "water-compaction": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "water",
    effects: [{ effectType: "stat", stat: "defense", amount: 2, trigger: "always", target: "self" }],
    notes: "IMMUNE: Water-type damage. First time hit by Water: +2 Defense"
  },
  "well-baked-body": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "fire",
    effects: [{ effectType: "stat", stat: "defense", amount: 2, trigger: "always", target: "self" }],
    notes: "IMMUNE: Fire-type damage. First time hit by Fire: +2 Defense"
  },
  "sap-sipper": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "grass",
    effects: [{ effectType: "stat", stat: "strength", amount: 1, trigger: "always", target: "self" }],
    notes: "IMMUNE: Grass-type damage. First time hit by Grass: +1 Strength"
  },
  "motor-drive": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "electric",
    effects: [{ effectType: "stat", stat: "dexterity", amount: 1, trigger: "always", target: "self" }],
    notes: "IMMUNE: Electric-type damage. First time hit by Electric: +1 Dexterity"
  },
  "lightning-rod": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "electric",
    effects: [{ effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self" }],
    notes: "IMMUNE: Electric-type damage. Redirects single-target Electric moves. First hit by Electric: +1 Special"
  },
  "storm-drain": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "water",
    effects: [{ effectType: "stat", stat: "special", amount: 1, trigger: "always", target: "self" }],
    notes: "IMMUNE: Water-type damage. Redirects single-target Water moves. First hit by Water: +1 Special"
  },
  "volt-absorb": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "electric",
    effects: [{ effectType: "heal", amount: 1, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "IMMUNE: Electric-type damage. Heal 1 HP when hit by Electric"
  },
  "water-absorb": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "water",
    effects: [{ effectType: "heal", amount: 1, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "IMMUNE: Water-type damage. Heal 1 HP when hit by Water"
  },
  "earth-eater": {
    type: "passive", trigger: "on-hit-by-type", target: "self",
    triggerConditionType: "ground",
    effects: [{ effectType: "heal", amount: 1, healType: "basic-numeric", healMode: "fixed", trigger: "always", target: "self" }],
    notes: "IMMUNE: Ground-type damage. Heal 1 HP when hit by Ground"
  },

  // --- Stat prevention abilities (runtime prevention in _applyTemporaryTrackedModifier) ---
  "big-pecks": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "PREVENT: defense reduction. Cannot have Defense reduced."
  },
  "hyper-cutter": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "PREVENT: strength reduction. Cannot have Strength reduced by others."
  },
  "clear-body": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "PREVENT: all stat changes by others. Cannot have Attributes changed by others."
  },
  "full-metal-body": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "PREVENT: all stat reduction by others. Cannot have Attributes reduced by others."
  },
  "white-smoke": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "PREVENT: all stat reduction by others. Cannot have Attributes reduced by others."
  },

  // --- Damage survival / passive flags ---
  "battle-armor": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Critical Hits don't grant bonus dice to foe's damage pool. Automated in damage calculation."
  },
  "shell-armor": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Critical Hits don't grant bonus dice to foe's damage pool. Automated in damage calculation."
  },
  "overcoat": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: weather damage. This Pokemon won't receive damage from active weather."
  },
  "rock-head": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "IMMUNE: recoil damage. This Pokemon will not receive damage from Recoil."
  },

  // --- Damage calc abilities (hardcoded in damage resolution) ---
  "wonder-guard": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Only super-effective moves can deal damage to this Pokemon. Automated in damage calculation."
  },
  "thick-fat": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces damage from Fire and Ice-type moves. Automated in damage calculation."
  },
  "ice-scales": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces damage from Special moves. Automated in damage calculation."
  },
  "filter": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces super-effective damage. Automated in damage calculation."
  },
  "solid-rock": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces super-effective damage. Automated in damage calculation."
  },
  "prism-armor": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces super-effective damage. Automated in damage calculation."
  },
  "multiscale": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Halves damage when at full HP. Automated in damage calculation."
  },
  "shadow-shield": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Halves damage when at full HP. Automated in damage calculation."
  },
  "fur-coat": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces damage from Physical moves. Automated in damage calculation."
  },
  "fluffy": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Reduces damage from contact moves, but takes extra damage from Fire moves. Automated in damage calculation."
  },
  "blaze": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [],
    notes: "When HP ≤ half: +1 damage die for Fire-type moves. Automated in damage calculation."
  },
  "overgrow": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [],
    notes: "When HP ≤ half: +1 damage die for Grass-type moves. Automated in damage calculation."
  },
  "swarm": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [],
    notes: "When HP ≤ half: +1 damage die for Bug-type moves. Automated in damage calculation."
  },
  "torrent": {
    type: "passive", trigger: "self-hp-half-or-less", target: "self",
    effects: [],
    notes: "When HP ≤ half: +1 damage die for Water-type moves. Automated in damage calculation."
  },

  // --- Special mechanics (hardcoded) ---
  "download": {
    type: "passive", trigger: "enter-battle", target: "self",
    effects: [],
    notes: "On entry: scans foes and grants +1 to Strength or Special based on foe's lower defensive stat. Automated in enter-battle processing."
  },
  "poison-heal": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "If poisoned or badly poisoned: heals 1 HP per round instead of taking damage. Automated in poison damage processing."
  },
  "regenerator": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "Heals 1 HP when switching out. Automated in switch-out processing."
  },

  // --- Weather/Terrain conditional immunity ---
  "leaf-guard": {
    type: "passive", trigger: "always", target: "self",
    effects: [],
    notes: "While Sunny Weather is active: IMMUNE to all Status Ailments and Conditions. Automated in condition immunity check."
  },

  // --- On-hit-by-contact debuff to ALL foes ---
  "cotton-down": {
    type: "passive", trigger: "on-hit-by-contact", target: "all-foes",
    effects: [{ effectType: "stat", stat: "dexterity", amount: -1, trigger: "always", target: "all-foes", durationMode: "combat" }],
    notes: "When hit by Non-Ranged Physical: reduce Dexterity of all nearby Pokemon"
  },

  // --- Highest-stat weather/terrain boosts ---
  "protosynthesis": {
    type: "passive", trigger: "weather-active", target: "self",
    triggerConditionWeather: "sunny,harsh-sunlight",
    effects: [{ effectType: "stat", stat: "highest", amount: 1, trigger: "always", target: "self", maxStacks: 1, durationMode: "combat", durationRounds: 0 }],
    notes: "While Sunny Weather is active: +1 to highest Attribute (+2 if Dexterity)"
  },
  "quark-drive": {
    type: "passive", trigger: "terrain-active", target: "self",
    triggerConditionTerrain: "electric",
    effects: [{ effectType: "stat", stat: "highest", amount: 1, trigger: "always", target: "self", maxStacks: 1, durationMode: "combat", durationRounds: 0 }],
    notes: "While Electric Terrain is active: +1 to highest Attribute (+2 if Dexterity)"
  },
};

// ---- BUILD ENTRIES ----

function buildSecondaryEffect(e) {
  return {
    section: 0,
    label: e.label ?? "",
    trigger: e.trigger ?? "always",
    chance: e.chance ?? 0,
    target: e.target ?? "self",
    effectType: e.effectType ?? "custom",
    durationMode: e.durationMode ?? "combat",
    durationRounds: e.durationRounds ?? 1,
    specialDuration: e.specialDuration ?? [],
    conditional: e.conditional ?? false,
    activationCondition: e.activationCondition ?? "",
    condition: e.condition ?? "none",
    weather: e.weather ?? "none",
    terrain: e.terrain ?? "none",
    stat: e.stat ?? "none",
    amount: e.amount ?? 0,
    healType: e.healType ?? "basic",
    healMode: e.healMode ?? "fixed",
    healProfile: e.healProfile ?? "standard",
    healingCategory: e.healingCategory ?? "standard",
    notes: e.notes ?? "",
    maxStacks: e.maxStacks ?? 0,
    linkedEffectId: ""
  };
}

const entries = abilities.map((ability) => {
  const id = ability._id;
  const auto = AUTOMATIONS[id];

  const system = {
    abilityType: auto?.type ?? "passive",
    abilityTrigger: auto?.trigger ?? "always",
    abilityTarget: auto?.target ?? "self",
    triggerConditionType: auto?.triggerConditionType ?? "",
    triggerConditionWeather: auto?.triggerConditionWeather ?? "",
    triggerConditionTerrain: auto?.triggerConditionTerrain ?? "",
    frequency: "",
    effect: ability.Effect,
    secondaryEffects: auto?.effects?.length ? auto.effects.map(buildSecondaryEffect) : [],
    description: ability.Description
  };

  return {
    name: ability.Name,
    type: "ability",
    img: "icons/svg/aura.svg",
    system,
    flags: {
      "pok-role-system": {
        seedId: `ability-${id}`,
        automationStatus: auto ? (auto.effects?.length ? "full" : "partial") : "none",
        automationNotes: auto?.notes ?? ""
      }
    }
  };
});

// ---- WRITE ----
const output = `export const ABILITY_COMPENDIUM_ENTRIES = Object.freeze(${JSON.stringify(entries, null, 2)});\n`;
writeFileSync(outputPath, output, "utf-8");
console.log(`Generated ${entries.length} ability entries to ${outputPath}`);
