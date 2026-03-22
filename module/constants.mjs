const DEFAULT_SYSTEM_ID = "pok-role-system";
const DEFAULT_SYSTEM_TITLE = "Pok\u00E9 Role System";

export const POKROLE = Object.freeze({
  ID: globalThis.game?.system?.id ?? DEFAULT_SYSTEM_ID,
  TITLE: globalThis.game?.system?.title ?? DEFAULT_SYSTEM_TITLE,
  SUCCESS_TARGET: 4,
  INITIATIVE_FORMULA: "1d6 + @dexterity + @alert"
});

function getSystemRootPath() {
  const gamePath = `${globalThis.game?.system?.path ?? ""}`.trim();
  if (gamePath) return gamePath.replace(/\/+$/, "");

  try {
    const importPath = `${new URL("../", import.meta.url).pathname ?? ""}`.trim();
    if (importPath) {
      return importPath.replace(/\/+$/, "").replace(/^\/(?=systems\/)/, "");
    }
  } catch (_error) {
    // Fallback below
  }

  return `systems/${POKROLE.ID}`;
}

export function getSystemAssetPath(relativePath = "") {
  const normalized = `${relativePath ?? ""}`.replace(/^\/+/, "");
  const rootPath = getSystemRootPath();
  if (!normalized) return rootPath;
  return `${rootPath}/${normalized}`;
}

export const COMBAT_FLAG_KEYS = Object.freeze({
  LAST_EVASION_ROUND: "combat.lastEvasionRound",
  LAST_CLASH_ROUND: "combat.lastClashRound",
  LAST_ACTION_ROUND: "combat.lastActionRound",
  MOVE_QUEUE: "combat.moveQueue",
  DELAYED_EFFECT_QUEUE: "combat.delayedEffects"
});

export const CORE_ATTRIBUTE_DEFINITIONS = Object.freeze([
  { key: "strength", label: "POKROLE.Attributes.Strength" },
  { key: "dexterity", label: "POKROLE.Attributes.Dexterity" },
  { key: "vitality", label: "POKROLE.Attributes.Vitality" },
  { key: "special", label: "POKROLE.Attributes.Special" },
  { key: "insight", label: "POKROLE.Attributes.Insight" }
]);

export const SOCIAL_ATTRIBUTE_DEFINITIONS = Object.freeze([
  { key: "tough", label: "POKROLE.Attributes.Tough" },
  { key: "beauty", label: "POKROLE.Attributes.Beauty" },
  { key: "cool", label: "POKROLE.Attributes.Cool" },
  { key: "cute", label: "POKROLE.Attributes.Cute" },
  { key: "clever", label: "POKROLE.Attributes.Clever" },
  { key: "allure", label: "POKROLE.Attributes.Allure" }
]);

export const SOCIAL_ATTRIBUTE_KEYS = Object.freeze(
  SOCIAL_ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key)
);

export const SKILL_DEFINITIONS = Object.freeze([
  { key: "alert", label: "POKROLE.Skills.Alert" },
  { key: "athletic", label: "POKROLE.Skills.Athletic" },
  { key: "brawl", label: "POKROLE.Skills.Brawl" },
  { key: "channel", label: "POKROLE.Skills.Channel" },
  { key: "clash", label: "POKROLE.Skills.Clash" },
  { key: "crafts", label: "POKROLE.Skills.Crafts" },
  { key: "empathy", label: "POKROLE.Skills.Empathy" },
  { key: "etiquette", label: "POKROLE.Skills.Etiquette" },
  { key: "evasion", label: "POKROLE.Skills.Evasion" },
  { key: "intimidate", label: "POKROLE.Skills.Intimidate" },
  { key: "lore", label: "POKROLE.Skills.Lore" },
  { key: "medicine", label: "POKROLE.Skills.Medicine" },
  { key: "nature", label: "POKROLE.Skills.Nature" },
  { key: "perform", label: "POKROLE.Skills.Perform" },
  { key: "science", label: "POKROLE.Skills.Science" },
  { key: "stealth", label: "POKROLE.Skills.Stealth" },
  { key: "throw", label: "POKROLE.Skills.Throw" },
  { key: "weapons", label: "POKROLE.Skills.Weapons" }
]);

export const ATTRIBUTE_DEFINITIONS = Object.freeze([
  ...CORE_ATTRIBUTE_DEFINITIONS,
  ...SOCIAL_ATTRIBUTE_DEFINITIONS
]);

export const ATTRIBUTE_LABEL_BY_KEY = Object.freeze(Object.fromEntries(
  ATTRIBUTE_DEFINITIONS.map((attribute) => [attribute.key, attribute.label])
));

export const SKILL_LABEL_BY_KEY = Object.freeze(Object.fromEntries(
  SKILL_DEFINITIONS.map((skill) => [skill.key, skill.label])
));

export const TRAIT_LABEL_BY_KEY = Object.freeze({
  strength: "POKROLE.Attributes.Strength",
  dexterity: "POKROLE.Attributes.Dexterity",
  vitality: "POKROLE.Attributes.Vitality",
  special: "POKROLE.Attributes.Special",
  insight: "POKROLE.Attributes.Insight",
  tough: "POKROLE.Attributes.Tough",
  beauty: "POKROLE.Attributes.Beauty",
  cool: "POKROLE.Attributes.Cool",
  cute: "POKROLE.Attributes.Cute",
  clever: "POKROLE.Attributes.Clever",
  allure: "POKROLE.Attributes.Allure",
  alert: "POKROLE.Skills.Alert",
  athletic: "POKROLE.Skills.Athletic",
  brawl: "POKROLE.Skills.Brawl",
  channel: "POKROLE.Skills.Channel",
  clash: "POKROLE.Skills.Clash",
  crafts: "POKROLE.Skills.Crafts",
  empathy: "POKROLE.Skills.Empathy",
  etiquette: "POKROLE.Skills.Etiquette",
  evasion: "POKROLE.Skills.Evasion",
  intimidate: "POKROLE.Skills.Intimidate",
  lore: "POKROLE.Skills.Lore",
  medicine: "POKROLE.Skills.Medicine",
  nature: "POKROLE.Skills.Nature",
  perform: "POKROLE.Skills.Perform",
  science: "POKROLE.Skills.Science",
  stealth: "POKROLE.Skills.Stealth",
  throw: "POKROLE.Skills.Throw",
  weapons: "POKROLE.Skills.Weapons",
  auto: "POKROLE.Move.DamageAttributeAuto",
  none: "POKROLE.Move.NoStat",
  normal: "POKROLE.Types.Normal",
  bug: "POKROLE.Types.Bug",
  dark: "POKROLE.Types.Dark",
  dragon: "POKROLE.Types.Dragon",
  electric: "POKROLE.Types.Electric",
  fairy: "POKROLE.Types.Fairy",
  fighting: "POKROLE.Types.Fighting",
  fire: "POKROLE.Types.Fire",
  flying: "POKROLE.Types.Flying",
  ghost: "POKROLE.Types.Ghost",
  grass: "POKROLE.Types.Grass",
  ground: "POKROLE.Types.Ground",
  ice: "POKROLE.Types.Ice",
  poison: "POKROLE.Types.Poison",
  psychic: "POKROLE.Types.Psychic",
  rock: "POKROLE.Types.Rock",
  steel: "POKROLE.Types.Steel",
  water: "POKROLE.Types.Water"
});

export const MOVE_CATEGORY_LABEL_BY_KEY = Object.freeze({
  physical: "POKROLE.Move.Category.Physical",
  special: "POKROLE.Move.Category.Special",
  support: "POKROLE.Move.Category.Support"
});

export const MOVE_PRIMARY_MODE_KEYS = Object.freeze([
  "damage",
  "effect-only"
]);

export const MOVE_TARGET_KEYS = Object.freeze([
  "foe",
  "random-foe",
  "all-foes",
  "self",
  "ally",
  "all-allies",
  "area",
  "battlefield",
  "foe-battlefield",
  "ally-battlefield",
  "battlefield-area"
]);

export const MOVE_TARGET_LABEL_BY_KEY = Object.freeze({
  foe: "POKROLE.Move.TargetValues.Foe",
  "random-foe": "POKROLE.Move.TargetValues.RandomFoe",
  "all-foes": "POKROLE.Move.TargetValues.AllFoes",
  self: "POKROLE.Move.TargetValues.Self",
  ally: "POKROLE.Move.TargetValues.Ally",
  "all-allies": "POKROLE.Move.TargetValues.AllAllies",
  area: "POKROLE.Move.TargetValues.Area",
  battlefield: "POKROLE.Move.TargetValues.Battlefield",
  "foe-battlefield": "POKROLE.Move.TargetValues.FoeBattlefield",
  "ally-battlefield": "POKROLE.Move.TargetValues.AllyBattlefield",
  "battlefield-area": "POKROLE.Move.TargetValues.BattlefieldArea"
});

export const MOVE_SECONDARY_TRIGGER_KEYS = Object.freeze([
  "on-hit",
  "on-hit-damage",
  "on-miss",
  "always"
]);

export const MOVE_SECONDARY_TARGET_KEYS = Object.freeze([
  "target",
  "self",
  "all-targets",
  "all-allies",
  "all-foes"
]);

export const MOVE_SECONDARY_EFFECT_TYPE_KEYS = Object.freeze([
  "condition",
  "active-effect",
  "stat",
  "combat-stat",
  "weather",
  "terrain",
  "damage",
  "heal",
  "will",
  "custom"
]);

export const MOVE_SECONDARY_HEAL_MODE_KEYS = Object.freeze([
  "fixed",
  "max-hp-percent",
  "damage-percent"
]);

export const MOVE_SECONDARY_HEAL_TYPE_KEYS = Object.freeze([
  "basic",
  "complete",
  "basic-numeric",
  "complete-numeric"
]);

export const MOVE_SECONDARY_HEAL_PROFILE_KEYS = Object.freeze([
  "standard",
  "sunlight-restoration",
  "sand-restoration"
]);

export const HEALING_CATEGORY_KEYS = Object.freeze([
  "standard",
  "complete",
  "unlimited"
]);

export const MOVE_SECONDARY_WEATHER_KEYS = Object.freeze([
  "none",
  "sunny",
  "harsh-sunlight",
  "rain",
  "typhoon",
  "sandstorm",
  "strong-winds",
  "hail"
]);

export const MOVE_SECONDARY_TERRAIN_KEYS = Object.freeze([
  "none",
  "electric",
  "grassy",
  "misty",
  "psychic"
]);

export const MOVE_SECONDARY_DURATION_MODE_KEYS = Object.freeze([
  "manual",
  "rounds",
  "combat"
]);

// DAE-inspired event-based expiration hooks for temporary effects.
// Multiple values can be selected on one effect.
export const MOVE_SECONDARY_SPECIAL_DURATION_KEYS = Object.freeze([
  "none",
  "turn-start",
  "turn-end",
  "round-end",
  "combat-end",
  "next-action",
  "next-attack",
  "next-hit",
  "is-attacked",
  "is-damaged",
  "is-hit"
]);

export const EFFECT_PASSIVE_TRIGGER_KEYS = Object.freeze([
  "always",
  "in-combat",
  "out-of-combat",
  "self-hp-half-or-less",
  "self-hp-quarter-or-less",
  "self-hp-below-threshold",
  "target-hp-half-or-less",
  "target-hp-quarter-or-less",
  "target-hp-below-threshold",
  "self-has-condition",
  "self-missing-condition",
  "target-has-condition",
  "target-missing-condition"
]);

export const MOVE_SECONDARY_CONDITION_KEYS = Object.freeze([
  "none",
  "sleep",
  "burn",
  "burn2",
  "burn3",
  "frozen",
  "paralyzed",
  "poisoned",
  "fainted",
  "confused",
  "flinch",
  "disabled",
  "infatuated",
  "badly-poisoned"
]);

export const MOVE_SECONDARY_STAT_KEYS = Object.freeze([
  "none",
  ...ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key),
  ...SKILL_DEFINITIONS.map((skill) => skill.key),
  "defense",
  "specialDefense",
  "accuracy",
  "damage",
  "evasion",
  "clash"
]);

export const MOVE_TYPE_KEYS = Object.freeze([
  "normal",
  "bug",
  "dark",
  "dragon",
  "electric",
  "fairy",
  "fighting",
  "fire",
  "flying",
  "ghost",
  "grass",
  "ground",
  "ice",
  "poison",
  "psychic",
  "rock",
  "steel",
  "water"
]);

export const POKEMON_TIER_KEYS = Object.freeze([
  "none",
  "starter",
  "rookie",
  "standard",
  "advanced",
  "expert",
  "ace",
  "master",
  "champion"
]);

export const POKEMON_TIER_LABEL_BY_KEY = Object.freeze(
  Object.fromEntries(
    POKEMON_TIER_KEYS.map((tierKey) => [
      tierKey,
      `POKROLE.Pokemon.TierValues.${tierKey[0].toUpperCase()}${tierKey.slice(1)}`
    ])
  )
);

export const TRAINER_CARD_RANK_KEYS = Object.freeze([
  "none",
  "starter",
  "rookie",
  "standard",
  "advanced",
  "expert",
  "ace",
  "master",
  "champion"
]);

export const TRAINER_CARD_RANK_LABEL_BY_KEY = Object.freeze(
  Object.fromEntries(
    TRAINER_CARD_RANK_KEYS.map((rankKey) => [
      rankKey,
      `POKROLE.Trainer.RankValues.${rankKey[0].toUpperCase()}${rankKey.slice(1)}`
    ])
  )
);

export const MOVE_TYPE_LABEL_BY_KEY = Object.freeze(Object.fromEntries(
  MOVE_TYPE_KEYS.map((typeKey) => [typeKey, `POKROLE.Types.${typeKey[0].toUpperCase()}${typeKey.slice(1)}`])
));

export const TYPE_OPTIONS = Object.freeze(["none", ...MOVE_TYPE_KEYS]);

export const TYPE_EFFECTIVENESS = Object.freeze({
  normal: { double: [], half: ["rock", "steel"], immune: ["ghost"] },
  bug: {
    double: ["grass", "psychic", "dark"],
    half: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"],
    immune: []
  },
  dark: {
    double: ["psychic", "ghost"],
    half: ["fighting", "dark", "fairy"],
    immune: []
  },
  dragon: { double: ["dragon"], half: ["steel"], immune: ["fairy"] },
  electric: {
    double: ["water", "flying"],
    half: ["electric", "grass", "dragon"],
    immune: ["ground"]
  },
  fairy: {
    double: ["fighting", "dragon", "dark"],
    half: ["fire", "poison", "steel"],
    immune: []
  },
  fighting: {
    double: ["normal", "rock", "steel", "ice", "dark"],
    half: ["poison", "flying", "psychic", "bug", "fairy"],
    immune: ["ghost"]
  },
  fire: {
    double: ["bug", "steel", "grass", "ice"],
    half: ["rock", "fire", "water", "dragon"],
    immune: []
  },
  flying: {
    double: ["grass", "fighting", "bug"],
    half: ["electric", "rock", "steel"],
    immune: []
  },
  ghost: {
    double: ["psychic", "ghost"],
    half: ["dark"],
    immune: ["normal"]
  },
  grass: {
    double: ["water", "ground", "rock"],
    half: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"],
    immune: []
  },
  ground: {
    double: ["fire", "electric", "poison", "rock", "steel"],
    half: ["grass", "bug"],
    immune: ["flying"]
  },
  ice: {
    double: ["grass", "ground", "flying", "dragon"],
    half: ["fire", "water", "ice", "steel"],
    immune: []
  },
  poison: {
    double: ["grass", "fairy"],
    half: ["poison", "ground", "rock", "ghost"],
    immune: ["steel"]
  },
  psychic: {
    double: ["fighting", "poison"],
    half: ["psychic", "steel"],
    immune: ["dark"]
  },
  rock: {
    double: ["fire", "ice", "flying", "bug"],
    half: ["fighting", "ground", "steel"],
    immune: []
  },
  steel: {
    double: ["ice", "rock", "fairy"],
    half: ["fire", "water", "electric", "steel"],
    immune: []
  },
  water: {
    double: ["fire", "ground", "rock"],
    half: ["water", "grass", "dragon"],
    immune: []
  }
});
