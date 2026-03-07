export const POKROLE = Object.freeze({
  ID: "pok-role-module",
  TITLE: "Poke Role Module",
  SUCCESS_TARGET: 4,
  INITIATIVE_FORMULA: "1d6 + @dexterity + @alert"
});

export const COMBAT_FLAG_KEYS = Object.freeze({
  ROUND_USAGE: "combat.roundUsage",
  LAST_EVASION_ROUND: "combat.lastEvasionRound",
  LAST_CLASH_ROUND: "combat.lastClashRound"
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
  "starter",
  "beginner",
  "amateur",
  "ace",
  "pro",
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
