import {
  COMBAT_FLAG_KEYS,
  getSystemAssetPath,
  HEALING_CATEGORY_KEYS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_MODE_KEYS,
  MOVE_SECONDARY_HEAL_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_PROFILE_KEYS,
  MOVE_SECONDARY_TERRAIN_KEYS,
  MOVE_SECONDARY_WEATHER_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_TARGET_KEYS,
  EFFECT_PASSIVE_TRIGGER_KEYS,
  POKROLE,
  SOCIAL_ATTRIBUTE_KEYS,
  TRAIT_LABEL_BY_KEY,
  TYPE_EFFECTIVENESS
} from "./constants.mjs";
import { evaluateNumericFormula } from "./formula-engine.mjs";

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function legacyChancePercentToDiceCount(percent, maxDice = 20) {
  const normalizedPercent = clamp(Math.floor(toNumber(percent, 0)), 1, 99);
  const probability = normalizedPercent / 100;
  const estimatedDice = Math.round(Math.log(1 - probability) / Math.log(5 / 6));
  return clamp(Number.isFinite(estimatedDice) ? estimatedDice : 1, 1, maxDice);
}

function successPoolFormula(dicePool) {
  const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
  return `${normalizedDicePool}d6cs>=${POKROLE.SUCCESS_TARGET}`;
}

const TYPE_KEY_ALIASES = Object.freeze({
  normale: "normal",
  normal: "normal",
  lotta: "fighting",
  fighting: "fighting",
  volante: "flying",
  flying: "flying",
  veleno: "poison",
  poison: "poison",
  terra: "ground",
  ground: "ground",
  roccia: "rock",
  rock: "rock",
  coleottero: "bug",
  bug: "bug",
  spettro: "ghost",
  ghost: "ghost",
  acciaio: "steel",
  steel: "steel",
  fuoco: "fire",
  fire: "fire",
  acqua: "water",
  water: "water",
  erba: "grass",
  grass: "grass",
  elettrico: "electric",
  electric: "electric",
  psico: "psychic",
  psychic: "psychic",
  ghiaccio: "ice",
  ice: "ice",
  drago: "dragon",
  dragon: "dragon",
  buio: "dark",
  dark: "dark",
  folletto: "fairy",
  fairy: "fairy",
  none: "none",
  nessuno: "none"
});

function hasPainPenaltyException(primaryTraitKey, secondaryTraitKey) {
  return primaryTraitKey === "vitality" || secondaryTraitKey === "vitality";
}

function getTargetActorFromUserSelection() {
  const targets = [...(game.user?.targets ?? [])];
  if (targets.length !== 1) return null;
  return targets[0].actor ?? null;
}

function getCurrentCombatRoundKey() {
  const combat = game.combat;
  if (!combat) return null;
  return `${combat.id}:${combat.round ?? 0}`;
}

const LEGACY_MOVE_TARGET_MAP = Object.freeze({
  foe: "foe",
  "random foe": "random-foe",
  "all foes": "all-foes",
  self: "self",
  user: "self",
  ally: "ally",
  "one ally": "ally",
  "all allies": "all-allies",
  "user and allies": "all-allies",
  area: "area",
  battlefield: "battlefield",
  "foe's battlefield": "foe-battlefield",
  "ally's battlefield": "ally-battlefield",
  "battlefield and area": "battlefield-area",
  "battlefield (foes)": "foe-battlefield"
});

const LEGACY_EFFECT_STAT_MAP = Object.freeze({
  def: "defense",
  defense: "defense",
  spdef: "specialDefense",
  "sp def": "specialDefense",
  "special defense": "specialDefense",
  spec: "special",
  dex: "dexterity",
  attack: "strength",
  "special attack": "special",
  speed: "dexterity",
  accuracy: "accuracy",
  evasion: "evasion",
  clash: "clash"
});

const CONDITION_ALIASES = Object.freeze({
  burn1: "burn",
  burn2: "burn",
  burn3: "burn",
  paralysis: "paralyzed",
  poison: "poisoned",
  badlypoisoned: "badly-poisoned",
  badly_poisoned: "badly-poisoned",
  freeze: "frozen",
  frozen: "frozen",
  confused: "confused",
  dead: "dead",
  morto: "dead"
});

const TEMPORARY_EFFECTS_FLAG = "automation.temporaryEffects";
const CONFIGURED_EFFECTS_FLAG = "automation.configuredEffects";
const CONDITION_FLAGS_FLAG = "automation.conditionFlags";
const CONDITION_KEYS = Object.freeze([
  ...MOVE_SECONDARY_CONDITION_KEYS.filter(
    (conditionKey) => !["none", "burn2", "burn3"].includes(conditionKey)
  ),
  "dead"
]);
const CONDITION_FIELD_BY_KEY = Object.freeze({
  sleep: "sleep",
  burn: "burn",
  frozen: "frozen",
  paralyzed: "paralyzed",
  poisoned: "poisoned",
  fainted: "fainted"
});
const CONDITION_ICON_BY_KEY = Object.freeze({
  sleep: getSystemAssetPath("assets/ailments/asleep.svg"),
  burn: getSystemAssetPath("assets/ailments/burn.svg"),
  frozen: getSystemAssetPath("assets/ailments/frozen.svg"),
  paralyzed: getSystemAssetPath("assets/ailments/paralyzed.svg"),
  poisoned: getSystemAssetPath("assets/ailments/poisoned.svg"),
  fainted: getSystemAssetPath("assets/ailments/fainted.svg"),
  dead: "icons/svg/skull.svg",
  confused: "icons/svg/daze.svg",
  flinch: "icons/svg/falling.svg",
  disabled: "icons/svg/cancel.svg",
  infatuated: "icons/svg/heal.svg",
  "badly-poisoned": getSystemAssetPath("assets/ailments/poisoned.svg")
});
const ACTIVE_EFFECT_STACK_MODE_KEYS = Object.freeze([
  "name-origin",
  "name",
  "origin",
  "multiple"
]);
const WEATHER_KEYS = Object.freeze([
  "none",
  "sunny",
  "harsh-sunlight",
  "rain",
  "typhoon",
  "sandstorm",
  "strong-winds",
  "hail"
]);
const TERRAIN_KEYS = Object.freeze([
  "none",
  "electric",
  "grassy",
  "misty",
  "psychic"
]);
const WEATHER_FLAG_KEY = "combat.weather";
const TERRAIN_FLAG_KEY = "combat.terrain";
const TRAINER_STATE_FLAG_KEY = "combat.trainerState";
const HEALING_TRACK_FLAG_KEY = "combat.healingTrack";
const TREATMENT_BLOCK_FLAG_KEY = "combat.treatmentBlockedRound";
const SHIELD_STREAK_FLAG_KEY = "combat.shieldStreak";
const ACTIVE_SHIELDS_FLAG_KEY = "combat.activeShields";
const SLEEP_RESIST_TRACK_FLAG_KEY = "combat.sleepResistTrack";
const BURN_TRACK_FLAG_KEY = "combat.burnTrack";
const PARALYSIS_TURN_CHECK_FLAG_KEY = "combat.paralysisTurnCheck";
const CONFUSION_BYPASS_FLAG_KEY = "combat.confusionBypassRound";
const INFATUATION_BYPASS_FLAG_KEY = "combat.infatuationBypassRound";
const FROZEN_SHELL_FLAG_KEY = "combat.frozenShell";
const LAST_USED_MOVE_FLAG_KEY = "combat.lastUsedMove";
const CHOICE_LOCKED_MOVE_FLAG = "combat.choiceLockedMove";
const SPECIAL_WEATHER_KEYS = Object.freeze(["harsh-sunlight", "typhoon", "strong-winds"]);
const BASIC_WEATHER_KEYS = Object.freeze(["sunny", "rain", "sandstorm", "hail"]);
const FROZEN_SHELL_DEFAULTS = Object.freeze({
  hp: 5,
  defense: 2,
  specialDefense: 2
});
const SECONDARY_EFFECT_CHANCE_DICE_MAX = 20;
const SHIELD_MOVE_PROFILE_OVERRIDES = Object.freeze({
  "move-baneful-bunker": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "condition", condition: "poisoned" }
  },
  "move-burning-bulwark": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "condition", condition: "burn" }
  },
  "move-crafty-shield": {
    damageReduction: 0,
    protectsCategories: [],
    blocksAddedEffects: true
  },
  "move-detect": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-endure": {
    damageReduction: 0,
    protectsCategories: ["physical", "special"],
    endureAtOne: true
  },
  "move-king-s-shield": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "strength", amount: -2 }
  },
  "move-mat-block": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"]
  },
  "move-max-guard": {
    damageReduction: 5,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-obstruct": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "defense", amount: -2 }
  },
  "move-protect": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-quick-guard": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    requiresPriority: true,
    blocksAddedEffects: true,
    blockEffectsRequiresPriority: true
  },
  "move-silk-trap": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "dexterity", amount: -2 }
  },
  "move-spiky-shield": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "damage", amount: 2, ignoreDefenses: true }
  },
  "move-wide-guard": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  }
});

export class PokRoleActor extends Actor {
  getRollData() {
    const rollData = super.getRollData();
    rollData.system = foundry.utils.deepClone(this.system);
    return rollData;
  }

  getTraitValue(traitKey) {
    if (!traitKey || traitKey === "none") return 0;
    const base = toNumber(this.system.attributes?.[traitKey], Number.NaN);
    const heldBonus = this._getHeldItemStatBonus(traitKey);
    return isNaN(base) ? base : base + heldBonus;
  }

  getInitiativeScore() {
    const dexterity = this.getTraitValue("dexterity");
    const alert = this.getSkillValue("alert");
    return Math.max(toNumber(dexterity, 0) + toNumber(alert, 0), 0);
  }

  getDefense(category = "physical") {
    const base = category === "special"
      ? Math.max(this.getTraitValue("insight"), 0)
      : Math.max(this.getTraitValue("vitality"), 0);
    const weather = this.getActiveWeatherKey?.() ?? "none";
    const weatherBonus = this._getWeatherDefenseBonusForStat(category, weather);
    const defKey = category === "special" ? "spDef" : "def";
    const heldDefBonus = this._getHeldItemStatBonus(defKey);
    return base + weatherBonus + heldDefBonus;
  }

  _getWeatherDefenseBonusForStat(category, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    if (weather === "none" || this.type !== "pokemon") return 0;
    if (weather === "sandstorm" && category === "special" && this.hasType?.("rock")) {
      return 1;
    }
    if (weather === "hail" && category !== "special" && this.hasType?.("ice")) {
      return 1;
    }
    return 0;
  }

  _localizeWeatherName(weatherKey) {
    const normalized = this._normalizeWeatherKey(weatherKey);
    const labelByKey = {
      none: "POKROLE.Common.None",
      sunny: "POKROLE.Combat.WeatherValues.Sunny",
      "harsh-sunlight": "POKROLE.Combat.WeatherValues.HarshSunlight",
      rain: "POKROLE.Combat.WeatherValues.Rain",
      typhoon: "POKROLE.Combat.WeatherValues.Typhoon",
      sandstorm: "POKROLE.Combat.WeatherValues.Sandstorm",
      "strong-winds": "POKROLE.Combat.WeatherValues.StrongWinds",
      hail: "POKROLE.Combat.WeatherValues.Hail"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  _localizeTerrainName(terrainKey) {
    const normalized = this._normalizeTerrainKey(terrainKey);
    const labelByKey = {
      none: "POKROLE.Common.None",
      electric: "POKROLE.Combat.TerrainValues.Electric",
      grassy: "POKROLE.Combat.TerrainValues.Grassy",
      misty: "POKROLE.Combat.TerrainValues.Misty",
      psychic: "POKROLE.Combat.TerrainValues.Psychic"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  _localizeCoverLevel(levelKey) {
    const normalized = `${levelKey ?? "none"}`.trim().toLowerCase();
    const labelByKey = {
      none: "POKROLE.Common.None",
      quarter: "POKROLE.Combat.CoverQuarter",
      half: "POKROLE.Combat.CoverHalf",
      full: "POKROLE.Combat.CoverFull"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  async restPokemon() {
    if (this.type !== "pokemon") return null;
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system.resources?.hp?.max, 1), 1);
    const willValue = Math.max(toNumber(this.system.resources?.will?.value, 0), 0);
    const willMax = Math.max(toNumber(this.system.resources?.will?.max, 1), 1);
    const updatePayload = {};
    if (hpValue !== hpMax) updatePayload["system.resources.hp.value"] = hpMax;
    if (willValue !== willMax) updatePayload["system.resources.will.value"] = willMax;
    if (Object.keys(updatePayload).length > 0) {
      await this.update(updatePayload);
    }
    await this.resetTurnState({ resetInitiative: true });
    await this.toggleQuickCondition("fainted", { active: false });
    await this.toggleQuickCondition("flinch", { active: false });
    await this.toggleQuickCondition("sleep", { active: false });
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.PokemonRested", { actor: this.name })
    );
    return {
      hpBefore: hpValue,
      hpAfter: hpMax,
      willBefore: willValue,
      willAfter: willMax
    };
  }

  _normalizeWeatherKey(weatherKey) {
    const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
    return WEATHER_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeTerrainKey(terrainKey) {
    const normalized = `${terrainKey ?? "none"}`.trim().toLowerCase();
    return TERRAIN_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeTypeKey(typeKey) {
    const normalized = `${typeKey ?? "none"}`.trim().toLowerCase();
    return TYPE_KEY_ALIASES[normalized] ?? normalized;
  }

  getActiveWeatherKey() {
    const combat = game.combat;
    if (!combat) return "none";
    const weatherData = combat.getFlag(POKROLE.ID, WEATHER_FLAG_KEY) ?? {};
    return this._normalizeWeatherKey(weatherData?.condition);
  }

  getActiveTerrainKey() {
    const combat = game.combat;
    if (!combat) return "none";
    const terrainData = combat.getFlag(POKROLE.ID, TERRAIN_FLAG_KEY) ?? {};
    return this._normalizeTerrainKey(terrainData?.condition);
  }

  async setActiveWeather(weatherKey = "none", options = {}) {
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const normalized = this._normalizeWeatherKey(weatherKey);
    const currentWeather = this._normalizeWeatherKey(
      (combat.getFlag(POKROLE.ID, WEATHER_FLAG_KEY) ?? {})?.condition
    );
    if (
      BASIC_WEATHER_KEYS.includes(normalized) &&
      SPECIAL_WEATHER_KEYS.includes(currentWeather) &&
      normalized !== currentWeather
    ) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.WeatherBlockedByExtreme", {
          weather: this._localizeWeatherName(currentWeather)
        })
      );
      return null;
    }
    const durationRounds = Math.max(Math.floor(toNumber(options.durationRounds, 0)), 0);
    const payload = {
      condition: normalized,
      durationRounds,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    };
    await combat.setFlag(POKROLE.ID, WEATHER_FLAG_KEY, payload);
    return payload;
  }

  async clearActiveWeather() {
    const combat = game.combat;
    if (!combat) return false;
    await combat.setFlag(POKROLE.ID, WEATHER_FLAG_KEY, {
      condition: "none",
      durationRounds: 0,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  async setActiveTerrain(terrainKey = "none", options = {}) {
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const normalized = this._normalizeTerrainKey(terrainKey);
    const durationRounds = Math.max(Math.floor(toNumber(options.durationRounds, 0)), 0);
    const payload = {
      condition: normalized,
      durationRounds,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    };
    await combat.setFlag(POKROLE.ID, TERRAIN_FLAG_KEY, payload);
    return payload;
  }

  async clearActiveTerrain() {
    const combat = game.combat;
    if (!combat) return false;
    await combat.setFlag(POKROLE.ID, TERRAIN_FLAG_KEY, {
      condition: "none",
      durationRounds: 0,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  _getTrainerState() {
    const rawState = this.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    return {
      inFray: Boolean(rawState?.inFray),
      cover: ["none", "quarter", "half", "full"].includes(`${rawState?.cover ?? "none"}`.trim().toLowerCase())
        ? `${rawState.cover}`.trim().toLowerCase()
        : "none"
    };
  }

  async setTrainerCover(cover = "none") {
    const normalizedCover = ["none", "quarter", "half", "full"].includes(`${cover ?? "none"}`.trim().toLowerCase())
      ? `${cover}`.trim().toLowerCase()
      : "none";
    const state = this._getTrainerState();
    state.cover = normalizedCover;
    await this.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, state);
    return normalizedCover;
  }

  async takeCover(level = "half") {
    const normalizedLevel = ["none", "quarter", "half", "full"].includes(`${level ?? "half"}`.trim().toLowerCase())
      ? `${level}`.trim().toLowerCase()
      : "half";
    const appliedLevel = await this.setTrainerCover(normalizedLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(appliedLevel)
      })
    );
    return appliedLevel;
  }

  getTrainerCover() {
    return this._getTrainerState().cover;
  }

  async _degradeCoverOnHit(targetActor) {
    if (!targetActor) return "none";
    const state = targetActor.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    const cover = `${state?.cover ?? "none"}`.trim().toLowerCase();
    let nextCover = cover;
    if (cover === "full") nextCover = "half";
    else if (cover === "half" || cover === "quarter") nextCover = "none";
    else return cover;
    const nextState = {
      inFray: Boolean(state?.inFray),
      cover: nextCover
    };
    await targetActor.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, nextState);
    return nextCover;
  }

  async setTrainerInFray(active) {
    const state = this._getTrainerState();
    state.inFray = Boolean(active);
    await this.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, state);
    return state.inFray;
  }

  isTrainerInFray() {
    return this._getTrainerState().inFray;
  }

  _getCoverDefenseBonus(actor, move = null) {
    if (!actor || !move) return 0;
    if (!this._isMoveRanged(move)) return 0;

    const state = actor.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    const cover = `${state?.cover ?? "none"}`.trim().toLowerCase();
    if (cover === "quarter") return 1;
    if (cover === "half") return 2;
    return 0;
  }

  _getWeatherDamageBonusDice(moveType, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    if (weather === "sunny" || weather === "harsh-sunlight") {
      return normalizedMoveType === "fire" ? 1 : 0;
    }
    if (weather === "rain" || weather === "typhoon") {
      return normalizedMoveType === "water" ? 1 : 0;
    }
    if (weather === "strong-winds") {
      return normalizedMoveType === "flying" ? 1 : 0;
    }
    return 0;
  }

  /**
   * Get a stat bonus from the held battle item (e.g. Light Ball gives +1 Str/Spe to Pikachu).
   */
  _getHeldItemStatBonus(statKey) {
    if (this.type !== "pokemon") return 0;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return 0;
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return 0;
    const held = item.system.held ?? {};
    // Check compatible pokemon
    const compatiblePokemon = (held.compatiblePokemon || "").toLowerCase().trim();
    if (compatiblePokemon) {
      const species = (this.system.species || this.name || "").toLowerCase().trim();
      if (!species.includes(compatiblePokemon) && !compatiblePokemon.includes(species)) return 0;
    }
    const bonuses = held.statBonuses ?? {};
    return toNumber(bonuses[statKey], 0);
  }

  /**
   * Get held item damage bonus dice for the attacking pokemon.
   * Checks the pokemon's equipped battle item and returns bonus dice
   * if the move type/category matches the item's conditions.
   */
  _getHeldItemDamageBonus(moveType, moveCategory) {
    if (this.type !== "pokemon") return 0;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return 0;
    // Try world items first, then actor's owned items
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return 0;
    const held = item.system.held ?? {};
    const bonusDice = held.damageBonusDice ?? 0;
    if (bonusDice <= 0) return 0;
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    // Check type condition
    const requiredType = this._normalizeTypeKey(held.damageBonusType || "none");
    if (requiredType && requiredType !== "none" && requiredType !== normalizedMoveType) return 0;
    // Check category condition (if specified)
    const requiredCategory = (held.damageBonusCategory || "").toLowerCase();
    if (requiredCategory && requiredCategory !== moveCategory.toLowerCase()) return 0;
    // Check compatible pokemon (if specified)
    const compatiblePokemon = (held.compatiblePokemon || "").toLowerCase().trim();
    if (compatiblePokemon) {
      const species = (this.system.species || this.name || "").toLowerCase().trim();
      if (!species.includes(compatiblePokemon) && !compatiblePokemon.includes(species)) return 0;
    }
    return bonusDice;
  }

  /**
   * Get the held item data object for this pokemon's equipped battle item.
   * Returns null if no valid held item is equipped.
   */
  _getHeldItemData() {
    if (this.type !== "pokemon") return null;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return null;
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return null;
    return item.system.held ?? null;
  }

  /**
   * Check if the held item grants High Critical for the given move.
   */
  _checkHeldItemHighCritical(move) {
    const held = this._getHeldItemData();
    if (!held?.highCritical) return false;
    const category = (move.system?.category || "physical").toLowerCase();
    const requiredCategory = (held.highCriticalCategory || "").toLowerCase();
    if (requiredCategory && requiredCategory !== category) return false;
    return true;
  }

  _getWeatherFlatDamageReduction(moveType, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    if ((weather === "sunny" || weather === "harsh-sunlight") && normalizedMoveType === "water") return 1;
    if ((weather === "rain" || weather === "typhoon") && normalizedMoveType === "fire") return 1;
    return 0;
  }

  _applyWeatherDamageReduction(finalDamage, weatherFlatReduction, options = {}) {
    const normalizedDamage = Math.max(toNumber(finalDamage, 0), 0);
    const normalizedReduction = Math.max(toNumber(weatherFlatReduction, 0), 0);
    const immune = Boolean(options?.immune);
    if (immune || normalizedDamage <= 0 || normalizedReduction <= 0) {
      return normalizedDamage;
    }
    return Math.max(normalizedDamage - normalizedReduction, 1);
  }


  _getMoveSourceAttributes(move) {
    return (
      move?.getFlag?.(POKROLE.ID, "sourceAttributes") ??
      foundry.utils.getProperty(move, `flags.${POKROLE.ID}.sourceAttributes`) ??
      {}
    );
  }

  _getMoveSeedId(move) {
    return `${move?.getFlag?.(POKROLE.ID, "seedId") ?? foundry.utils.getProperty(move, `flags.${POKROLE.ID}.seedId`) ?? ""}`
      .trim()
      .toLowerCase();
  }

  _isMoveRanged(move) {
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    return Boolean(moveSourceAttributes?.physicalRanged);
  }

  _normalizeMoveCombatCategory(value) {
    const normalized = `${value ?? ""}`.trim().toLowerCase();
    if (normalized === "physical" || normalized === "special" || normalized === "support") {
      return normalized;
    }
    return "support";
  }

  _isConditionActive(conditionKey) {
    const normalized = this._normalizeConditionKey(conditionKey);
    if (normalized === "none") return false;
    const flags = this._getConditionFlagEntries(this);
    return Boolean(flags?.[normalized]);
  }

  _getCurrentRoundKey(roundOffset = 0) {
    const combat = game.combat;
    if (!combat?.id) return null;
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    return `${combat.id}:${Math.max(currentRound + roundOffset, 0)}`;
  }

  _getCurrentTurnKey() {
    const combat = game.combat;
    if (!combat?.id || !Number.isInteger(combat.turn)) return null;
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    return `${combat.id}:${currentRound}:${combat.turn}`;
  }

  _isCurrentCombatTurn() {
    const combat = game.combat;
    if (!combat || !Number.isInteger(combat.turn)) return false;
    const currentActor = combat.turns?.[combat.turn]?.actor ?? null;
    return Boolean(currentActor && currentActor.id === this.id);
  }

  _getConditionResistFlagKey(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    return `combat.conditionResist.${normalizedCondition}`;
  }

  async _attemptConditionResistThisRound(conditionKey, threshold = 2) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none" || !game.combat) {
      return { resisted: false, rolled: false, netSuccesses: 0 };
    }

    const roundKey = this._getCurrentRoundKey(0);
    const flagKey = this._getConditionResistFlagKey(normalizedCondition);
    const currentFlag = this.getFlag(POKROLE.ID, flagKey) ?? {};
    if (`${currentFlag?.roundKey ?? ""}`.trim() === `${roundKey ?? ""}`.trim()) {
      return {
        resisted: Boolean(currentFlag?.resisted),
        rolled: false,
        netSuccesses: Math.max(Math.floor(toNumber(currentFlag?.netSuccesses, 0)), 0)
      };
    }

    const dicePool = Math.max(this.getTraitValue("insight"), 1);
    const roll = await new Roll(successPoolFormula(dicePool)).evaluate({ async: true });
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const removedSuccesses = this.getPainPenalty();
    const netSuccesses = Math.max(rawSuccesses - removedSuccesses, 0);
    const resisted = netSuccesses >= Math.max(Math.floor(toNumber(threshold, 2)), 1);

    await this.setFlag(POKROLE.ID, flagKey, {
      roundKey: `${roundKey ?? ""}`.trim(),
      resisted,
      netSuccesses
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.ConditionResistRoll", {
        actor: this.name,
        condition: this._localizeConditionName(normalizedCondition),
        required: threshold
      })
    });

    return { resisted, rolled: true, netSuccesses };
  }

  _getParalysisTurnCheckState() {
    const state = this.getFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY) ?? {};
    return {
      turnKey: `${state?.turnKey ?? ""}`.trim(),
      rawSuccesses: Math.max(Math.floor(toNumber(state?.rawSuccesses, 0)), 0),
      canAct: Boolean(state?.canAct)
    };
  }

  async _clearParalysisTurnCheck() {
    await this.unsetFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY);
  }

  async _resolveParalysisTurnCheckThisTurn() {
    if (!game.combat || !this._isConditionActive("paralyzed") || !this._isCurrentCombatTurn()) {
      return { canAct: true, rolled: false, rawSuccesses: 1 };
    }

    const currentTurnKey = this._getCurrentTurnKey();
    const currentState = this._getParalysisTurnCheckState();
    if (currentTurnKey && currentState.turnKey === currentTurnKey) {
      return {
        canAct: currentState.canAct,
        rolled: false,
        rawSuccesses: currentState.rawSuccesses
      };
    }

    const roll = await new Roll(successPoolFormula(2)).evaluate({ async: true });
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const canAct = rawSuccesses > 0;

    await this.setFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY, {
      turnKey: `${currentTurnKey ?? ""}`.trim(),
      rawSuccesses,
      canAct
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.ParalysisTurnRoll", {
        actor: this.name
      })
    });

    ui.notifications[canAct ? "info" : "warn"](
      game.i18n.format(
        canAct ? "POKROLE.Chat.ParalysisTurnPassed" : "POKROLE.Chat.ParalysisTurnFailed",
        { actor: this.name }
      )
    );

    return { canAct, rolled: true, rawSuccesses };
  }

  _getConfusionBypassRoundKey() {
    return `${this.getFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY) ?? ""}`.trim();
  }

  _isConfusionSuppressedThisRound() {
    const currentRoundKey = this._getCurrentRoundKey(0);
    return Boolean(currentRoundKey && this._getConfusionBypassRoundKey() === currentRoundKey);
  }

  async _clearConfusionSuppression() {
    await this.unsetFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY);
  }

  async _resolveConfusionSuppressionThisRound() {
    if (!game.combat || !this._isConditionActive("confused") || !this._isCurrentCombatTurn()) {
      return { suppressed: false, rolled: false, netSuccesses: 0 };
    }

    const currentRoundKey = this._getCurrentRoundKey(0);
    if (currentRoundKey && this._getConfusionBypassRoundKey() === currentRoundKey) {
      return { suppressed: true, rolled: false, netSuccesses: 0 };
    }

    const resistResult = await this._attemptConditionResistThisRound("confused", 2);
    if (resistResult?.resisted && currentRoundKey) {
      await this.setFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY, currentRoundKey);
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.ConfusionSuppressedRound", {
          actor: this.name
        })
      );
    }

    return {
      suppressed: Boolean(resistResult?.resisted),
      rolled: Boolean(resistResult?.rolled),
      netSuccesses: Math.max(Math.floor(toNumber(resistResult?.netSuccesses, 0)), 0)
    };
  }

  _hasConfusionPenaltyThisRound() {
    return this._isConditionActive("confused") && !this._isConfusionSuppressedThisRound();
  }

  _getInfatuationBypassRoundKey() {
    return `${this.getFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY) ?? ""}`.trim();
  }

  _isInfatuationSuppressedThisRound() {
    const currentRoundKey = this._getCurrentRoundKey(0);
    return Boolean(currentRoundKey && this._getInfatuationBypassRoundKey() === currentRoundKey);
  }

  async _clearInfatuationSuppression() {
    await this.unsetFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY);
  }

  async _resolveInfatuationSuppressionThisRound() {
    if (!game.combat || !this._isConditionActive("infatuated") || !this._isCurrentCombatTurn()) {
      return { suppressed: false, rolled: false, netSuccesses: 0 };
    }

    const currentRoundKey = this._getCurrentRoundKey(0);
    if (currentRoundKey && this._getInfatuationBypassRoundKey() === currentRoundKey) {
      return { suppressed: true, rolled: false, netSuccesses: 0 };
    }

    const resistResult = await this._attemptConditionResistThisRound("infatuated", 2);
    if (resistResult?.resisted && currentRoundKey) {
      await this.setFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY, currentRoundKey);
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.InfatuationSuppressedRound", {
          actor: this.name
        })
      );
    }

    return {
      suppressed: Boolean(resistResult?.resisted),
      rolled: Boolean(resistResult?.rolled),
      netSuccesses: Math.max(Math.floor(toNumber(resistResult?.netSuccesses, 0)), 0)
    };
  }

  _hasInfatuationPenaltyThisRound() {
    return this._isConditionActive("infatuated") && !this._isInfatuationSuppressedThisRound();
  }

  async _attemptSleepWakeResistance() {
    if (!game.combat) return { wokeUp: false, totalSuccesses: 0, gainedSuccesses: 0 };

    const currentTrack = this.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY) ?? {};
    const previousTotal = Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0);
    const currentRoundKey = this._getCurrentRoundKey(0);
    if (`${currentTrack?.roundKey ?? ""}`.trim() === `${currentRoundKey ?? ""}`.trim()) {
      return { wokeUp: previousTotal >= 5, totalSuccesses: previousTotal, gainedSuccesses: 0 };
    }
    const dicePool = Math.max(this.getTraitValue("insight"), 1);
    const roll = await new Roll(successPoolFormula(dicePool)).evaluate({ async: true });
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const removedSuccesses = this.getPainPenalty();
    const gainedSuccesses = Math.max(rawSuccesses - removedSuccesses, 0);
    const totalSuccesses = previousTotal + gainedSuccesses;

    await this.setFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY, {
      totalSuccesses,
      roundKey: currentRoundKey
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.SleepResistanceRoll", {
        actor: this.name,
        gained: gainedSuccesses,
        total: totalSuccesses
      })
    });

    if (totalSuccesses >= 5) {
      await this.toggleQuickCondition("sleep", { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.SleepWokeUp", { actor: this.name })
      );
      return { wokeUp: true, totalSuccesses, gainedSuccesses };
    }

    return { wokeUp: false, totalSuccesses, gainedSuccesses };
  }

  async _clearSleepResistanceTrack() {
    await this.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
  }

  async _initializeSleepResistanceTrack() {
    const currentTrack = this.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY) ?? {};
    const totalSuccesses = Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0);
    if (totalSuccesses <= 0) {
      await this.setFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY, {
        totalSuccesses: 0,
        roundKey: this._getCurrentRoundKey(0)
      });
    }
  }

  _getFrozenShellState() {
    const state = this.getFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY) ?? {};
    return {
      hp: clamp(
        Math.floor(toNumber(state?.hp, FROZEN_SHELL_DEFAULTS.hp)),
        0,
        FROZEN_SHELL_DEFAULTS.hp
      ),
      defense: FROZEN_SHELL_DEFAULTS.defense,
      specialDefense: FROZEN_SHELL_DEFAULTS.specialDefense
    };
  }

  async _setFrozenShellState(state = {}) {
    const normalizedState = {
      hp: clamp(
        Math.floor(toNumber(state?.hp, FROZEN_SHELL_DEFAULTS.hp)),
        0,
        FROZEN_SHELL_DEFAULTS.hp
      ),
      defense: FROZEN_SHELL_DEFAULTS.defense,
      specialDefense: FROZEN_SHELL_DEFAULTS.specialDefense
    };
    await this.setFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY, normalizedState);
    return normalizedState;
  }

  async _initializeFrozenShell(force = false) {
    const currentState = this._getFrozenShellState();
    if (!force && currentState.hp > 0) return currentState;
    return this._setFrozenShellState(FROZEN_SHELL_DEFAULTS);
  }

  async _clearFrozenShellState() {
    await this.unsetFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY);
  }

  _normalizeBurnStage(stage, fallback = 1) {
    const numericStage = Math.floor(toNumber(stage, fallback));
    return clamp(numericStage, 1, 3);
  }

  _getBurnRemovalThreshold(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    return {
      1: 4,
      2: 6,
      3: 8
    }[normalizedStage] ?? 4;
  }

  _getBurnRoundDamage(stage = 1) {
    return this._normalizeBurnStage(stage, 1);
  }

  _getBurnConditionVariant(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    if (normalizedStage === 3) return "burn3";
    if (normalizedStage === 2) return "burn2";
    return "burn";
  }

  _statusDamageCanKill(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "burn") {
      return this._normalizeBurnStage(this._getBurnTrack().stage, 1) >= 3;
    }
    return false;
  }

  _localizeBurnStageName(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    const localizationKey = {
      1: "POKROLE.Move.Secondary.Condition.Burn1",
      2: "POKROLE.Move.Secondary.Condition.Burn2",
      3: "POKROLE.Move.Secondary.Condition.Burn3"
    }[normalizedStage] ?? "POKROLE.Conditions.Burn";
    return game.i18n.localize(localizationKey);
  }

  _normalizeBurnConditionVariant(conditionKey) {
    const normalized = `${conditionKey ?? "burn"}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (normalized === "burn3") return "burn3";
    if (normalized === "burn2") return "burn2";
    return "burn";
  }

  _resolveBurnStageFromCondition(conditionKey) {
    const variantKey = this._normalizeBurnConditionVariant(conditionKey);
    if (variantKey === "burn3") return 3;
    if (variantKey === "burn2") return 2;
    return 1;
  }

  _getCurrentCombatTurnKey() {
    const combat = game.combat;
    if (!combat) return null;
    return `${combat.id}:${combat.round ?? 0}:${combat.turn ?? 0}`;
  }

  _getBurnTrack() {
    const rawTrack = this.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY) ?? {};
    return {
      stage: this._normalizeBurnStage(rawTrack?.stage, 1),
      totalSuccesses: Math.max(Math.floor(toNumber(rawTrack?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey: `${rawTrack?.lastAttemptTurnKey ?? ""}`.trim()
    };
  }

  async _setBurnTrack(track = {}) {
    await this.setFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY, {
      stage: this._normalizeBurnStage(track?.stage, 1),
      totalSuccesses: Math.max(Math.floor(toNumber(track?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey: `${track?.lastAttemptTurnKey ?? ""}`.trim()
    });
  }

  async _clearBurnTrack() {
    await this.unsetFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY);
  }

  _extractBurnStageFromEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    if (automationFlags?.conditionKey && this._normalizeConditionKey(automationFlags.conditionKey) === "burn") {
      return this._normalizeBurnStage(automationFlags?.burnStage, 1);
    }
    const name = `${effectDocument?.name ?? ""}`.trim().toLowerCase();
    if (/\bburn\s*3\b/.test(name)) return 3;
    if (/\bburn\s*2\b/.test(name)) return 2;
    return 1;
  }

  async _applyBurnStage(stage = 1, options = {}) {
    const currentTrack = this.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY) ?? {};
    const nextStage = Math.max(
      this._normalizeBurnStage(currentTrack?.stage, 1),
      this._normalizeBurnStage(stage, 1)
    );
    await this.setFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY, {
      stage: nextStage,
      totalSuccesses: Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey:
        options.resetAttempt === true ? "" : `${currentTrack?.lastAttemptTurnKey ?? ""}`.trim()
    });
    return nextStage;
  }

  async _synchronizeManagedBurnConditionEffect(targetActor, stage = 1) {
    if (!targetActor) return false;
    const managedBurnEffect = (targetActor.effects?.contents ?? []).find(
      (effectDocument) =>
        !effectDocument?.disabled &&
        this._isManagedAutomationEffect(effectDocument) &&
        this._extractConditionKeyFromEffect(effectDocument) === "burn"
    );
    if (!managedBurnEffect) return false;

    const normalizedStage = this._normalizeBurnStage(stage, 1);
    const desiredName = this._localizeBurnStageName(normalizedStage);
    const automationFlags = foundry.utils.deepClone(
      managedBurnEffect.getFlag(POKROLE.ID, "automation") ?? {}
    );
    const needsUpdate =
      this._normalizeBurnStage(automationFlags?.burnStage, 1) !== normalizedStage ||
      this._normalizeConditionKey(automationFlags?.conditionKey) !== "burn" ||
      `${managedBurnEffect.name ?? ""}`.trim() !== desiredName;
    if (!needsUpdate) return false;

    automationFlags.conditionKey = "burn";
    automationFlags.burnStage = normalizedStage;
    await managedBurnEffect.update({
      name: desiredName,
      [`flags.${POKROLE.ID}.automation`]: automationFlags
    });
    return true;
  }

  async _promptBurnStageSelection() {
    return new Promise((resolve) => {
      new Dialog(
        {
          title: game.i18n.localize("POKROLE.Chat.BurnSelection.Title"),
          content: `
            <div class="pok-role-dialog-content">
              <p>${game.i18n.localize("POKROLE.Chat.BurnSelection.Prompt")}</p>
            </div>
          `,
          buttons: {
            burn1: {
              label: this._localizeBurnStageName(1),
              callback: () => resolve(1)
            },
            burn2: {
              label: this._localizeBurnStageName(2),
              callback: () => resolve(2)
            },
            burn3: {
              label: this._localizeBurnStageName(3),
              callback: () => resolve(3)
            },
            cancel: {
              label: game.i18n.localize("POKROLE.Common.Cancel"),
              callback: () => resolve(null)
            }
          },
          default: "burn1",
          close: () => resolve(null)
        },
        { classes: ["pok-role-dialog"] }
      ).render(true);
    });
  }

  async _attemptBurnRecovery() {
    if (!game.combat || this.type !== "pokemon" || !this._isConditionActive("burn")) {
      return { attempted: false, recovered: false, totalSuccesses: 0, stage: 1 };
    }

    const turnKey = this._getCurrentCombatTurnKey();
    const burnTrack = this._getBurnTrack();
    if (burnTrack.lastAttemptTurnKey && burnTrack.lastAttemptTurnKey === `${turnKey ?? ""}`.trim()) {
      return {
        attempted: false,
        recovered: false,
        totalSuccesses: burnTrack.totalSuccesses,
        stage: burnTrack.stage
      };
    }

    const threshold = this._getBurnRemovalThreshold(burnTrack.stage);
    const spendAction = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Chat.BurnRecovery.Title"),
        content: `
          <div class="pok-role-dialog-content">
            <p>${game.i18n.format("POKROLE.Chat.BurnRecovery.Prompt", {
              actor: this.name,
              stage: this._localizeBurnStageName(burnTrack.stage),
              current: burnTrack.totalSuccesses,
              required: threshold
            })}</p>
          </div>
        `,
        buttons: {
          yes: {
            icon: "<i class='fas fa-fire-extinguisher'></i>",
            label: game.i18n.localize("POKROLE.Chat.BurnRecovery.UseAction"),
            callback: () => resolve(true)
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(false)
          }
        },
        default: "yes",
        close: () => resolve(false)
      }, { classes: ["pok-role-dialog"] }).render(true);
    });

    if (!spendAction) {
      await this._setBurnTrack({
        ...burnTrack,
        lastAttemptTurnKey: `${turnKey ?? ""}`.trim()
      });
      return {
        attempted: false,
        recovered: false,
        totalSuccesses: burnTrack.totalSuccesses,
        stage: burnTrack.stage
      };
    }

    const roundKey = this._getCurrentRoundKey(0);
    const currentActionNumber = await this._resolveActionRequirement(null, roundKey);
    const rollResult = await this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("athletic"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.BurnRecovery.Flavor", {
        actor: this.name,
        stage: this._localizeBurnStageName(burnTrack.stage)
      })
    });
    await this._advanceActionCounter(currentActionNumber, roundKey);

    const gainedSuccesses = Math.max(Math.floor(toNumber(rollResult?.netSuccesses, 0)), 0);
    const totalSuccesses = burnTrack.totalSuccesses + gainedSuccesses;
    const recovered = totalSuccesses >= threshold;

    if (recovered) {
      await this.toggleQuickCondition("burn", { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.BurnRecovery.Cleared", {
          actor: this.name,
          condition: this._localizeBurnStageName(burnTrack.stage)
        })
      );
      return {
        attempted: true,
        recovered: true,
        gainedSuccesses,
        totalSuccesses,
        stage: burnTrack.stage
      };
    }

    await this._setBurnTrack({
      stage: burnTrack.stage,
      totalSuccesses,
      lastAttemptTurnKey: `${turnKey ?? ""}`.trim()
    });
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.BurnRecovery.Progress", {
        actor: this.name,
        stage: this._localizeBurnStageName(burnTrack.stage),
        gained: gainedSuccesses,
        total: totalSuccesses,
        required: threshold
      })
    );
    return {
      attempted: true,
      recovered: false,
      gainedSuccesses,
      totalSuccesses,
      stage: burnTrack.stage
    };
  }

  async processTurnStartStatusAutomation() {
    if (!game.combat) return { processed: false, results: [] };

    const results = [];
    let paralysisBlocksTurn = false;
    const clearConditionWithNotice = async (conditionKey) => {
      await this.toggleQuickCondition(conditionKey, { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.ConditionCleared", {
          condition: this._localizeConditionName(conditionKey)
        })
      );
    };

    if (this._isConditionActive("sleep")) {
      const sleepResist = await this._attemptSleepWakeResistance();
      if (sleepResist?.wokeUp && this._isConditionActive("sleep")) {
        await clearConditionWithNotice("sleep");
      }
      results.push({ condition: "sleep", resolved: Boolean(sleepResist?.wokeUp) });
    }

    if (this._isConditionActive("frozen")) {
      const frozenShell = await this._initializeFrozenShell();
      results.push({
        condition: "frozen",
        resolved: false,
        shellHp: frozenShell.hp
      });
    }

    if (this._isConditionActive("paralyzed")) {
      const paralysisCheck = await this._resolveParalysisTurnCheckThisTurn();
      paralysisBlocksTurn = !Boolean(paralysisCheck?.canAct);
      results.push({
        condition: "paralyzed",
        resolved: Boolean(paralysisCheck?.canAct),
        blocked: paralysisBlocksTurn
      });
    }

    if (this._isConditionActive("infatuated")) {
      const infatuationResult = await this._resolveInfatuationSuppressionThisRound();
      results.push({
        condition: "infatuated",
        resolved: Boolean(infatuationResult?.suppressed)
      });
    }

    if (this._isConditionActive("confused")) {
      const confusionResult = await this._resolveConfusionSuppressionThisRound();
      results.push({
        condition: "confused",
        resolved: Boolean(confusionResult?.suppressed)
      });
    }

    if (
      this._isConditionActive("burn") &&
      !paralysisBlocksTurn &&
      !this._isConditionActive("dead") &&
      !this._isConditionActive("fainted") &&
      !this._isConditionActive("sleep") &&
      !this._isConditionActive("frozen")
    ) {
      const burnRecovery = await this._attemptBurnRecovery();
      results.push({
        condition: "burn",
        attempted: Boolean(burnRecovery?.attempted),
        resolved: Boolean(burnRecovery?.recovered),
        stage: burnRecovery?.stage ?? this._getBurnTrack().stage,
        totalSuccesses: burnRecovery?.totalSuccesses ?? this._getBurnTrack().totalSuccesses
      });
    }

    return { processed: true, results };
  }

  async _assertCanAct(actionType = "generic", options = {}) {
    if (!game.combat) {
      if (actionType === "move") {
        const moveId = `${options?.moveId ?? ""}`.trim();
        const disabledMoveLock = this._getDisabledMoveRestriction();
        if (moveId && disabledMoveLock?.moveId === moveId) {
          return {
            allowed: false,
            reason: game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
              move:
                disabledMoveLock.moveName ||
                options?.moveName ||
                game.i18n.localize("POKROLE.Common.Unknown")
            })
          };
        }
      }
      return { allowed: true, reason: "" };
    }

    if (this._isConditionActive("dead")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorDead") };
    }

    if (this._isConditionActive("fainted")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFainted") };
    }

    if (this._isConditionActive("sleep")) {
      const sleepResist = await this._attemptSleepWakeResistance();
      if (sleepResist?.wokeUp) {
        if (this._isConditionActive("sleep")) {
          await this.toggleQuickCondition("sleep", { active: false });
        }
      } else {
        return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorSleeping") };
      }
    }

    if (this._isConditionActive("frozen")) {
      if (actionType === "move") {
        await this._initializeFrozenShell();
      } else {
        return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFrozen") };
      }
    }

    if (this._isConditionActive("infatuated")) {
      await this._resolveInfatuationSuppressionThisRound();
    }

    if (this._isConditionActive("confused")) {
      await this._resolveConfusionSuppressionThisRound();
    }

    if (this._isConditionActive("sleep")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorSleeping") };
    }

    if (this._isConditionActive("flinch")) {
      await this.toggleQuickCondition("flinch", { active: false });
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFlinched") };
    }

    const blockedRound = `${this.getFlag(POKROLE.ID, TREATMENT_BLOCK_FLAG_KEY) ?? ""}`.trim();
    const currentRoundKey = this._getCurrentRoundKey(0);
    if (blockedRound && currentRoundKey && blockedRound === currentRoundKey) {
      return {
        allowed: false,
        reason: game.i18n.localize("POKROLE.Errors.ActorBusyWithItemTreatment")
      };
    }

    if (actionType !== "initiative" && this._isConditionActive("paralyzed") && this._isCurrentCombatTurn()) {
      const paralysisCheck = await this._resolveParalysisTurnCheckThisTurn();
      if (!paralysisCheck?.canAct) {
        return {
          allowed: false,
          reason: game.i18n.localize("POKROLE.Errors.ActorParalyzedTurn")
        };
      }
    }

    if (actionType === "move") {
      const moveId = `${options?.moveId ?? ""}`.trim();
      const disabledMoveLock = this._getDisabledMoveRestriction();
      if (moveId && disabledMoveLock?.moveId === moveId) {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
            move:
              disabledMoveLock.moveName ||
              options?.moveName ||
              game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
    }

    return { allowed: true, reason: "" };
  }

  _getHealingTrack() {
    const combat = game.combat;
    const currentRoundKey = this._getCurrentRoundKey(0);
    const track = this.getFlag(POKROLE.ID, HEALING_TRACK_FLAG_KEY) ?? {};
    if (!combat || !currentRoundKey) {
      return {
        roundKey: "",
        healedThisRound: 0,
        completeHealedThisRound: 0
      };
    }
    if (`${track?.roundKey ?? ""}`.trim() !== currentRoundKey) {
      return {
        roundKey: currentRoundKey,
        healedThisRound: 0,
        completeHealedThisRound: 0
      };
    }
    return {
      roundKey: currentRoundKey,
      healedThisRound: Math.max(Math.floor(toNumber(track?.healedThisRound, 0)), 0),
      completeHealedThisRound: Math.max(Math.floor(toNumber(track?.completeHealedThisRound, 0)), 0)
    };
  }

  async _setHealingTrack(track) {
    await this.setFlag(POKROLE.ID, HEALING_TRACK_FLAG_KEY, {
      roundKey: `${track?.roundKey ?? ""}`.trim(),
      healedThisRound: Math.max(Math.floor(toNumber(track?.healedThisRound, 0)), 0),
      completeHealedThisRound: Math.max(
        Math.floor(toNumber(track?.completeHealedThisRound, 0)),
        0
      )
    });
  }

  _normalizeHealingCategory(value) {
    const normalized = `${value ?? "standard"}`.trim().toLowerCase();
    return HEALING_CATEGORY_KEYS.includes(normalized) ? normalized : "standard";
  }

  _getHealingRoundLimit(healingCategory = "standard") {
    const normalizedCategory = this._normalizeHealingCategory(healingCategory);
    if (normalizedCategory === "unlimited") return Number.POSITIVE_INFINITY;
    if (normalizedCategory === "complete") return 5;
    return 3;
  }

  _resolveGearHealingCategory(gearItem) {
    const sourceValue = gearItem?._source?.system?.heal?.battleHealingCategory;
    if (`${sourceValue ?? ""}`.trim()) {
      return this._normalizeHealingCategory(sourceValue);
    }

    const itemName = `${gearItem?.name ?? ""}`.trim().toLowerCase();
    if (itemName === "max potion" || itemName === "full restore") {
      return "unlimited";
    }
    return "standard";
  }

  getPainPenalty() {
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system.resources?.hp?.max, 1), 1);

    if (hpValue <= 1) return 2;
    if (hpValue <= Math.floor(hpMax / 2)) return 1;
    return 0;
  }

  getSkillValue(skillKey) {
    if (!skillKey || skillKey === "none") return 0;
    return toNumber(this.system.skills?.[skillKey], Number.NaN);
  }

  getTraitOrSkillValue(traitKey) {
    const attributeValue = this.getTraitValue(traitKey);
    if (!Number.isNaN(attributeValue)) return attributeValue;

    const skillValue = this.getSkillValue(traitKey);
    if (!Number.isNaN(skillValue)) return skillValue;

    return Number.NaN;
  }

  async rollCombinedDialog() {
    await this.synchronizeConditionalActiveEffects();
    const attributes = Object.keys(this.system.attributes ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getTraitValue(key)
    }));
    const physicalMentalAttributes = attributes.filter(
      (trait) => !SOCIAL_ATTRIBUTE_KEYS.includes(trait.key)
    );
    const socialAttributes = attributes.filter((trait) =>
      SOCIAL_ATTRIBUTE_KEYS.includes(trait.key)
    );
    const skills = Object.keys(this.system.skills ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getSkillValue(key)
    }));
    const renderTraitOptions = (traits) =>
      traits
        .map(
          (trait) => `
            <label class="trait-option">
              <input type="checkbox" name="trait" value="${trait.key}" />
              <span>${trait.label} (${trait.value})</span>
            </label>
          `
        )
        .join("");

    const content = `
      <form class="pok-role-combined-roll">
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.CustomLabel")}</label>
          <input type="text" name="label" value="" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RequiredSuccesses")}</label>
          <input type="number" name="requiredSuccesses" min="1" max="5" value="${clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5)}" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RemovedSuccesses")}</label>
          <input type="number" name="manualRemovedSuccesses" min="0" value="0" />
        </div>
        <label class="form-group trait-option compact">
            <input type="checkbox" name="applyPainPenalty" checked />
            <span>${game.i18n.localize("POKROLE.CombinedRoll.ApplyPainPenalty")}</span>
        </label>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.PhysicalMental")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(physicalMentalAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.Social")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(socialAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Skills.Title")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(skills)}
          </div>
        </fieldset>
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.CombinedRoll.Title"),
        content,
        buttons: {
          roll: {
            icon: "<i class='fas fa-dice-d20'></i>",
            label: game.i18n.localize("POKROLE.CombinedRoll.Roll"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          cancel: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-combined-dialog"] }).render(true);
    });

    if (!html) return null;

    const form = html[0]?.querySelector("form");
    if (!form) return null;

    const selectedTraits = [...form.querySelectorAll("input[name='trait']:checked")].map(
      (checkbox) => checkbox.value
    );
    if (!selectedTraits.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.NoTraitsSelected"));
      return null;
    }

    const requiredSuccesses = clamp(
      toNumber(form.querySelector("input[name='requiredSuccesses']")?.value, 1),
      1,
      5
    );
    const manualRemovedSuccesses = Math.max(
      toNumber(form.querySelector("input[name='manualRemovedSuccesses']")?.value, 0),
      0
    );
    const applyPainPenalty =
      form.querySelector("input[name='applyPainPenalty']")?.checked ?? true;
    const removedSuccesses =
      manualRemovedSuccesses + (applyPainPenalty ? this.getPainPenalty() : 0);

    const breakdown = selectedTraits.map((traitKey) => {
      const value = this.getTraitOrSkillValue(traitKey);
      return {
        key: traitKey,
        value: Number.isNaN(value) ? 0 : value
      };
    });
    const dicePool = breakdown.reduce((total, entry) => total + entry.value, 0);
    const customLabel =
      form.querySelector("input[name='label']")?.value?.trim() ?? "";
    const breakdownLabel = breakdown
      .map((entry) => `${this.localizeTrait(entry.key)} ${entry.value}`)
      .join(" + ");

    return this._rollSuccessPool({
      dicePool,
      removedSuccesses,
      requiredSuccesses,
      flavor: game.i18n.format("POKROLE.Chat.CombinedFlavor", {
        actor: this.name,
        label: customLabel || game.i18n.localize("POKROLE.CombinedRoll.DefaultLabel"),
        breakdown: breakdownLabel
      })
    });
  }

  async rollAttribute(attributeKey) {
    await this.synchronizeConditionalActiveEffects();
    const traitValue = this.getTraitValue(attributeKey);
    if (Number.isNaN(traitValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownAttribute"));
      return null;
    }

    const painPenalty = attributeKey === "vitality" ? 0 : this.getPainPenalty();
    return this._rollSuccessPool({
      dicePool: traitValue,
      removedSuccesses: painPenalty,
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.AttributeFlavor", {
        actor: this.name,
        trait: this.localizeTrait(attributeKey)
      })
    });
  }

  async rollSkill(skillKey) {
    await this.synchronizeConditionalActiveEffects();
    const skillValue = this.getSkillValue(skillKey);
    if (Number.isNaN(skillValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownSkill"));
      return null;
    }

    return this._rollSuccessPool({
      dicePool: skillValue,
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.SkillFlavor", {
        actor: this.name,
        trait: this.localizeTrait(skillKey)
      })
    });
  }

  _getLastUsedMoveRecord() {
    const record = this.getFlag(POKROLE.ID, LAST_USED_MOVE_FLAG_KEY) ?? {};
    return {
      moveId: `${record?.moveId ?? ""}`.trim(),
      moveName: `${record?.moveName ?? ""}`.trim(),
      moveUuid: `${record?.moveUuid ?? ""}`.trim(),
      sceneId: `${record?.sceneId ?? ""}`.trim(),
      roundKey: `${record?.roundKey ?? ""}`.trim(),
      usedAt: Math.max(toNumber(record?.usedAt, 0), 0)
    };
  }

  async _recordLastUsedMove(move) {
    if (!move?.id) return;
    await this.setFlag(POKROLE.ID, LAST_USED_MOVE_FLAG_KEY, {
      moveId: move.id,
      moveName: move.name ?? "",
      moveUuid: move.uuid ?? "",
      sceneId: canvas?.scene?.id ?? "",
      roundKey: this._getCurrentRoundKey(0) ?? "",
      usedAt: Date.now()
    });
  }

  _getDisabledMoveRestriction(targetActor = this) {
    const actor = targetActor ?? this;
    const effectDocument = (actor?.effects?.contents ?? []).find((activeEffect) => {
      if (!activeEffect || activeEffect.disabled) return false;
      const automationFlags = activeEffect.getFlag?.(POKROLE.ID, "automation") ?? {};
      const effectType = `${automationFlags?.effectType ?? ""}`.trim().toLowerCase();
      const conditionKey = this._normalizeConditionKey(automationFlags?.conditionKey);
      return effectType === "move-disabled" || conditionKey === "disabled";
    });
    if (!effectDocument) return null;

    const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
    return {
      effectDocument,
      moveId: `${automationFlags?.disabledMoveId ?? ""}`.trim(),
      moveName:
        `${automationFlags?.disabledMoveName ?? ""}`.trim() || `${effectDocument?.name ?? ""}`.trim()
    };
  }

  async rollInitiative(options = {}) {
    await this.synchronizeConditionalActiveEffects();
    const actionCheck = await this._assertCanAct("initiative");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }
    const roll = await new Roll(POKROLE.INITIATIVE_FORMULA, {
      dexterity: this.getTraitValue("dexterity"),
      alert: this.getSkillValue("alert")
    }).evaluate({ async: true });
    const baseInitiative = Math.max(toNumber(roll.total, 0), 0);
    const rolledInitiative = this._isConditionActive("paralyzed")
      ? Math.floor(baseInitiative / 2)
      : baseInitiative;
    await this.update({ "system.combat.initiative": rolledInitiative });

    const combat = game.combat ?? null;
    const combatant = combat?.combatants?.find?.((entry) => entry.actor?.id === this.id) ?? null;
    if (combatant && options.updateCombatant !== false) {
      await combatant.update({ initiative: rolledInitiative });
      if (typeof combat?.setupTurns === "function") {
        await combat.setupTurns();
      }
      if (options.setTurnOnRoll !== false) {
        const rankedTurns = Array.from(combat?.turns ?? []);
        let highestTurnIndex = rankedTurns.findIndex(
          (entry) => Boolean(entry) && !entry.defeated
        );
        if (highestTurnIndex < 0 && rankedTurns.length > 0) {
          highestTurnIndex = 0;
        }
        if (highestTurnIndex >= 0 && combat.turn !== highestTurnIndex) {
          await combat.update({ turn: highestTurnIndex });
        }
      }
    }

    if (!options.silent) {
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: game.i18n.format("POKROLE.Chat.InitiativeFlavor", {
          actor: this.name,
          score: rolledInitiative
        })
      });
    }

    return roll;
  }

  async rollEvasion(actionNumber = null, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    const actionCheck = await this._assertCanAct("evasion");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("evasion", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.EvasionAlreadyUsedThisRound"));
      return null;
    }

    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("evasion"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.EvasionFlavor", {
        actor: this.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("evasion", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    return result;
  }

  async rollClash(moveId, actionNumber = null, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const actionCheck = await this._assertCanAct("clash");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }

    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("clash", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashAlreadyUsedThisRound"));
      return null;
    }

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    const disabledMoveLock = this._getDisabledMoveRestriction();
    if (disabledMoveLock?.moveId && disabledMoveLock.moveId === move.id) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
          move: disabledMoveLock.moveName || move.name
        })
      );
      return null;
    }
    if (!this._moveUsesPrimaryDamage(move)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashNeedsDamagingMove"));
      return null;
    }
    const expectedCategory = this._normalizeMoveCombatCategory(options.expectedCategory);
    const moveCategory = this._normalizeMoveCombatCategory(move.system?.category);
    if (
      expectedCategory !== "support" &&
      moveCategory !== expectedCategory
    ) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.ClashNeedsMatchingCategory", {
          expected: game.i18n.localize(
            expectedCategory === "physical"
              ? "POKROLE.Move.Category.Physical"
              : "POKROLE.Move.Category.Special"
          ),
          actual: game.i18n.localize(
            moveCategory === "physical"
              ? "POKROLE.Move.Category.Physical"
              : moveCategory === "special"
                ? "POKROLE.Move.Category.Special"
                : "POKROLE.Move.Category.Support"
          )
        })
      );
      return null;
    }

    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const damageBaseSetup = this._resolveMoveDamageBase(move, null, normalizedAction);
    const removedSuccesses = damageBaseSetup.ignoresPainPenalty ? 0 : this.getPainPenalty();

    const result = await this._rollSuccessPool({
      dicePool: damageBaseSetup.value + this.getSkillValue("clash"),
      removedSuccesses,
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.ClashFlavor", {
        actor: this.name,
        move: move.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("clash", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    await this._recordLastUsedMove(move);

    return {
      ...result,
      move
    };
  }

  async queueMove(moveId, options = {}) {
    const combat = game.combat ?? null;
    if (!combat) {
      return this.rollMove(moveId, options);
    }

    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }

    const actionCheck = await this._assertCanAct("move", {
      moveId: move.id,
      moveName: move.name
    });
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }

    const currentCombatantActorId = `${combat.combatant?.actor?.id ?? ""}`.trim();
    if (currentCombatantActorId && currentCombatantActorId !== this.id) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.MoveQueueOnlyCurrentTurn"));
      return null;
    }

    const combatant = combat.combatants.find((entry) => entry.actor?.id === this.id) ?? null;
    if (!combatant) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }

    const selectedTargetActors = Array.isArray(options.targetActorIds)
      ? this._resolveActorsFromIds(options.targetActorIds)
      : this._getSelectedTargetActors();
    const moveTargetKey = this._normalizeMoveTargetKey(move.system?.target);
    const targetActors = this._resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors);
    const targetValidation = this._validateMoveTargetSelection(
      moveTargetKey,
      selectedTargetActors,
      targetActors
    );
    if (!targetValidation.valid) {
      ui.notifications.warn(targetValidation.message);
      return null;
    }

    const enqueueMove = game.pokrole?.enqueueCombatMoveDeclaration;
    if (typeof enqueueMove !== "function") {
      return this.rollMove(moveId, options);
    }

    const priority = Math.min(Math.max(Math.floor(toNumber(move.system?.priority, 0)), -3), 5);
    const initiative = Math.max(
      toNumber(combatant.initiative, toNumber(this.system?.combat?.initiative, 0)),
      0
    );

    const queueEntry = await enqueueMove(
      {
        actorId: this.id,
        combatantId: `${combatant.id ?? ""}`.trim(),
        userId: `${game.user?.id ?? ""}`.trim(),
        moveId: move.id,
        moveName: `${move.name ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim(),
        moveImg: `${move.img ?? ""}`.trim(),
        priority,
        initiative,
        targetActorIds: targetActors.map((actor) => actor.id).filter(Boolean),
        targetMode: moveTargetKey,
        declaredAt: Date.now(),
        declaredRound: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
        declaredTurn: Number.isInteger(combat.turn) ? combat.turn : 0
      },
      combat
    );

    ui.notifications.info(
      game.i18n.format("POKROLE.Combat.MoveQueued", {
        actor: this.name,
        move: move.name
      })
    );

    return {
      queued: true,
      move,
      queueEntry
    };
  }

  async rollMove(moveId, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    const actionCheck = await this._assertCanAct("move", {
      moveId: move.id,
      moveName: move.name
    });
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const frozenBreakoutActive = this._isConditionActive("frozen");
    const moveTargetKey = this._normalizeMoveTargetKey(move.system?.target);
    const infatuated =
      !frozenBreakoutActive &&
      this._hasInfatuationPenaltyThisRound() &&
      this._moveUsesPrimaryDamage(move) &&
      this._moveShouldAutoHoldBackFromInfatuation(moveTargetKey);
    let holdingBackMode = "none";
    if (frozenBreakoutActive) {
      holdingBackMode = "none";
    } else if (infatuated) {
      holdingBackMode = "half";
    } else {
      holdingBackMode = await this._resolveHoldingBackChoice(move, options);
      if (holdingBackMode === null) return null;
    }
    const isHoldingBackHalf = holdingBackMode === "half";
    const inflictLethalDamage = holdingBackMode === "lethal";
    const canInflictDeathOnKo = inflictLethalDamage && !isHoldingBackHalf;
    const actionNumber = await this._resolveActionRequirement(options.actionNumber, roundKey);
    const activeWeather = this.getActiveWeatherKey();
    const moveType = this._normalizeTypeKey(move.system.type || "normal");
    const weatherBlocksMove =
      (activeWeather === "harsh-sunlight" && moveType === "water") ||
      (activeWeather === "typhoon" && moveType === "fire");
    if (weatherBlocksMove) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.MoveBlockedByWeather", {
          weather: this._localizeWeatherName(activeWeather)
        })
      );
      return null;
    }
    // Choice Band / Choice Specs / Choice Scarf: lock to one move
    const choiceHeldData = this._getHeldItemData();
    if (choiceHeldData?.choiceType) {
      const lockedMoveId = this.getFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG) ?? null;
      if (lockedMoveId && lockedMoveId !== move.id) {
        const lockedMove = this.items.get(lockedMoveId);
        const lockedMoveName = lockedMove?.name ?? "a locked move";
        ui.notifications.warn(`${this.name} is locked to ${lockedMoveName} by its Choice item!`);
        return null;
      }
      if (!lockedMoveId) {
        await this.setFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG, move.id);
      }
    }
    const isShieldMove = Boolean(move.system?.shieldMove);
    if (isShieldMove && roundKey) {
      const shieldState = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
      const lastShieldRound = `${shieldState?.lastRoundKey ?? ""}`.trim();
      if (lastShieldRound && lastShieldRound === `${roundKey}`.trim()) {
        ui.notifications.warn(
          game.i18n.localize("POKROLE.Errors.ShieldMoveAlreadyUsedThisRound")
        );
        return null;
      }
    }
    const shieldPenalty = isShieldMove ? this._getShieldMoveAccuracyPenalty(roundKey) : 0;
    const willCost = Math.max(Math.floor(toNumber(move.system?.willCost, 0)), 0);
    const currentWill = Math.max(Math.floor(toNumber(this.system?.resources?.will?.value, 0)), 0);
    if (willCost > currentWill) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.NotEnoughWill", { current: currentWill, required: willCost })
      );
      return null;
    }
    let willBefore = currentWill;
    let willAfter = currentWill;
    const painPenalty = this.getPainPenalty();
    const selectedTargetActors = Array.isArray(options.targetActorIds)
      ? this._resolveActorsFromIds(options.targetActorIds)
      : this._getSelectedTargetActors();
    const targetActors = this._resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors);
    const targetValidation = this._validateMoveTargetSelection(
      moveTargetKey,
      selectedTargetActors,
      targetActors
    );
    if (!targetValidation.valid) {
      ui.notifications.warn(targetValidation.message);
      return null;
    }
    const formulaTargetActor = targetActors[0] ?? null;
    const accuracySetup = this._resolveMoveAccuracySetup(move, formulaTargetActor, actionNumber);
    const accuracyDicePoolBase = accuracySetup.accuracyDicePoolBase;
    const accuracyAttributeKey = accuracySetup.accuracyAttributeKey;
    const accuracySkillKey = accuracySetup.accuracySkillKey;
    const accuracyDiceModifier = clamp(
      Math.floor(toNumber(move.system?.accuracyDiceModifier, 0)),
      -99,
      99
    );
    const accuracyFlatModifier = clamp(
      Math.floor(toNumber(move.system?.accuracyFlatModifier, 0)),
      -99,
      99
    );
    const heldAccuracyBonus = this._getHeldItemData()?.accuracyBonusDice ?? 0;
    const accuracyDicePool = Math.max(accuracyDicePoolBase + accuracyDiceModifier + heldAccuracyBonus, 1);

    if (!Number.isFinite(accuracyDicePoolBase)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMoveTraits"));
      return null;
    }
    if (willCost > 0) {
      willAfter = Math.max(currentWill - willCost, 0);
      await this.update({ "system.resources.will.value": willAfter });
    }

    if (this._isConditionActive("frozen")) {
      return this._resolveFrozenBreakoutMove(move, {
        roundKey,
        actionNumber,
        willCost,
        willBefore,
        willAfter,
        advanceAction: options.advanceAction !== false
      });
    }

    const confusionPenalty = this._hasConfusionPenaltyThisRound() ? 1 : 0;
    const heldReducedLowAccuracy = this._getHeldItemData()?.reducedLowAccuracy ?? 0;
    const reducedAccuracy = Math.max(toNumber(move.system.reducedAccuracy, 0) - heldReducedLowAccuracy, 0) + shieldPenalty;
    const targetBrightPowder = targetActors[0]?._getHeldItemData?.()?.accuracyPenaltyToAttacker ?? 0;
    const accuracyRoll = await new Roll(successPoolFormula(accuracyDicePool)).evaluate({
      async: true
    });
    const rawAccuracySuccesses = toNumber(accuracyRoll.total, 0);
    const modifiedAccuracySuccesses = rawAccuracySuccesses + accuracyFlatModifier;
    const removedAccuracySuccesses = reducedAccuracy + painPenalty + confusionPenalty + targetBrightPowder;
    const netAccuracySuccesses = modifiedAccuracySuccesses - removedAccuracySuccesses;
    const requiredSuccesses = actionNumber;
    let hit = netAccuracySuccesses >= requiredSuccesses;
    const heldHighCritical = this._checkHeldItemHighCritical(move);
    const criticalThreshold = requiredSuccesses + ((move.system.highCritical || heldHighCritical) ? 2 : 3);
    const critical = hit && netAccuracySuccesses >= criticalThreshold;

    await accuracyRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.MoveAccuracyFlavor", {
        actor: this.name,
        move: move.name,
        required: requiredSuccesses
      })
    });

    const targetActor = targetActors[0] ?? null;
    const category = move.system.category || "physical";
    const isDamagingMove = this._moveUsesPrimaryDamage(move);
    let reaction = {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };

    const canUseDefensiveReaction =
      hit &&
      isDamagingMove &&
      targetActor &&
      targetActor !== this &&
      targetActors.length === 1;

    if (canUseDefensiveReaction) {
      reaction = await this._resolveDefensiveReaction({
        targetActor,
        move,
        roundKey,
        netAccuracySuccesses
      });

      if (reaction.evaded) {
        hit = false;
      }
    }

    let damageRoll = null;
    let damageSuccesses = 0;
    let finalDamage = reaction.targetDamage ?? 0;
    let hpAfter = null;
    let hpBefore = null;
    let defense = 0;
    let poolBeforeDefense = 0;
    let damagePool = 0;
    let shieldDetail = "";
    let typeInteraction = {
      immune: false,
      weaknessBonus: 0,
      resistancePenalty: 0,
      label: "POKROLE.Chat.TypeEffect.Neutral"
    };
    let stabDice = 0;
    let heldItemBonus = 0;
    let criticalDice = critical ? 2 : 0;
    let damageAttributeLabel = this.localizeTrait("none");
    const damageTargetResults = [];

    if (hit && isDamagingMove && !reaction.clashResolved) {
      const damageTargets = this._resolveDamageTargets(moveTargetKey, targetActors);
      const targetsToDamage = damageTargets.length > 0 ? damageTargets : targetActor ? [targetActor] : [];

      for (const actorTarget of targetsToDamage) {
        const damageResult = await this._resolveMoveDamageAgainstTarget({
          move,
          targetActor: actorTarget,
          painPenalty,
          critical,
          isHoldingBackHalf,
          canInflictDeathOnKo,
          actionNumber,
          roundKey
        });
        damageTargetResults.push(damageResult);
      }

      const firstDamageResult = damageTargetResults[0];
      if (firstDamageResult) {
        damageRoll = firstDamageResult.damageRoll;
        damageSuccesses = firstDamageResult.damageSuccesses;
        finalDamage = firstDamageResult.finalDamage;
        hpBefore = firstDamageResult.hpBefore;
        hpAfter = firstDamageResult.hpAfter;
        defense = firstDamageResult.defense;
        poolBeforeDefense = firstDamageResult.poolBeforeDefense;
        damagePool = firstDamageResult.damagePool;
        shieldDetail = firstDamageResult.shieldDetail ?? "";
        typeInteraction = firstDamageResult.typeInteraction;
        stabDice = firstDamageResult.stabDice;
        heldItemBonus = firstDamageResult.heldItemBonus ?? 0;
        criticalDice = firstDamageResult.criticalDice;
        damageAttributeLabel = firstDamageResult.damageAttributeLabel;
      }
    }

    let confusionSelfDamage = null;
    if (confusionPenalty > 0 && !hit) {
      confusionSelfDamage = await this._safeApplyDamage(this, 1);
    }

    const secondaryEffects = this._collectMoveSecondaryEffects(move);
    const moveSecondaryEffectResults = await this._applyMoveSecondaryEffects({
      move,
      moveTargetKey,
      secondaryEffects,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage,
      damageTargetResults,
      roundKey
    });
    const abilitySecondaryEffectResults = await this._applyAbilityAutomationEffects({
      move,
      moveTargetKey,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage,
      damageTargetResults,
      roundKey
    });
    const secondaryEffectResults = [
      ...moveSecondaryEffectResults,
      ...abilitySecondaryEffectResults
    ];
    const accuracyDiceModifierLabel =
      accuracyDiceModifier > 0 ? `+${accuracyDiceModifier}` : `${accuracyDiceModifier}`;
    const accuracyFlatModifierLabel =
      accuracyFlatModifier > 0 ? `+${accuracyFlatModifier}` : `${accuracyFlatModifier}`;

    const summaryHtml = await renderTemplate(
      getSystemAssetPath("templates/chat/move-roll.hbs"),
      {
        actorName: this.name,
        moveName: move.name,
        moveTypeLabel: this.localizeTrait(moveType),
        moveTargetLabel: this._localizeMoveTarget(moveTargetKey),
        categoryLabel: game.i18n.localize(
          MOVE_CATEGORY_LABEL_BY_KEY[category] ?? "POKROLE.Common.Unknown"
        ),
        willCost,
        willBefore,
        willAfter,
        accuracyDicePoolBase,
        accuracyDiceModifier,
        accuracyDiceModifierLabel,
        accuracyFlatModifier,
        accuracyFlatModifierLabel,
        accuracyAttributeLabel: accuracySetup.accuracyAttributeLabel,
        accuracySkillLabel: accuracySetup.accuracySkillLabel,
        accuracySummaryLabel: accuracySetup.accuracySummaryLabel,
        actionNumber,
        requiredSuccesses,
        rawAccuracySuccesses,
        modifiedAccuracySuccesses,
        removedAccuracySuccesses,
        netAccuracySuccesses,
        hit,
        critical,
        reactionAttempted: reaction.attempted,
        reactionTypeLabel: game.i18n.localize(reaction.label),
        reactionSuccess: reaction.success,
        reactionNetSuccesses: reaction.netSuccesses,
        reactionClashMoveName: reaction.clashMoveName,
        reactionAttackerDamage: reaction.attackerDamage,
        reactionTargetDamage: reaction.targetDamage,
        holdingBackActive: holdingBackMode !== "none",
        holdingBackLabel:
          holdingBackMode === "half"
            ? game.i18n.localize("POKROLE.Chat.HoldingBack.HalfDamage")
            : holdingBackMode === "lethal"
              ? game.i18n.localize("POKROLE.Chat.HoldingBack.Lethal")
              : game.i18n.localize("POKROLE.Chat.HoldingBack.None"),
        infatuated,
        activeWeather,
        isDamagingMove,
        showDamageSection: hit && isDamagingMove && !reaction.clashResolved,
        damageAttributeLabel,
        poolBeforeDefense,
        defense,
        damagePool,
        damageSuccesses,
        stabDice,
        heldItemBonus,
        criticalDice,
        typeLabel: game.i18n.localize(typeInteraction.label),
        finalDamage,
        shieldDetail,
        targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        additionalTargetResults: damageTargetResults.slice(1).map((entry) => ({
          targetName: entry.targetName,
          finalDamage: entry.finalDamage,
          hpBefore: entry.hpBefore,
          hpAfter: entry.hpAfter,
          hasHpUpdate: entry.hpBefore !== null && entry.hpAfter !== null,
          shieldDetail: entry.shieldDetail ?? ""
        })),
        secondaryEffectResults,
        hasSecondaryEffects: secondaryEffectResults.length > 0,
        hasHpUpdate: hpAfter !== null && hpBefore !== null,
        hpBefore,
        hpAfter,
        confusionPenalty,
        confusionSelfDamage
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: summaryHtml
    });

    await this._recordLastUsedMove(move);

    // Throat Spray: +1 special after using a sound-based move
    const postMoveHeldData = this._getHeldItemData();
    if (postMoveHeldData?.throatSpray && hit) {
      const SOUND_KEYWORDS = ["sound", "cry", "voice", "sing", "roar", "screech", "growl", "howl",
        "chatter", "echo", "hyper voice", "boomburst", "uproar", "snore", "round", "relic song",
        "snarl", "disarming voice", "bug buzz", "grass whistle", "metal sound", "perish song",
        "noble roar", "parting shot", "sparkling aria", "clangorous", "overdrive", "eerie spell"];
      const moveDesc = `${move.system?.description ?? ""}`.toLowerCase();
      const moveName = `${move.name ?? ""}`.toLowerCase();
      const isSoundMove = SOUND_KEYWORDS.some((kw) => moveDesc.includes(kw) || moveName.includes(kw));
      if (isSoundMove) {
        await this._applyStatEffectToActor(
          { stat: "special", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
          this,
          move
        );
        await this.update({ "system.battleItem": "" });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: `<strong>${this.name}'s</strong> Throat Spray activated! Special increased by 1.`
        });
      }
    }

    const result = {
      accuracyRoll,
      damageRoll,
      hit,
      critical,
      reaction,
      finalDamage,
      secondaryEffectResults,
      damageTargetResults
    };

    await this.processTemporaryEffectSpecialDuration("next-attack", {
      combatId: game.combat?.id ?? null
    });
    if (hit) {
      await this.processTemporaryEffectSpecialDuration("next-hit", {
        combatId: game.combat?.id ?? null
      });
    }
    if (hit) {
      const hitTargets =
        damageTargetResults.length > 0
          ? damageTargetResults
          : targetActors.map((actor) => ({ targetActor: actor, finalDamage: 0 }));
      for (const targetEntry of hitTargets) {
        const target = targetEntry?.targetActor ?? null;
        if (!target || typeof target.processTemporaryEffectSpecialDuration !== "function") continue;
        await target.processTemporaryEffectSpecialDuration("is-hit", {
          combatId: game.combat?.id ?? null
        });
        await target.processTemporaryEffectSpecialDuration("is-attacked", {
          combatId: game.combat?.id ?? null
        });
        if (toNumber(targetEntry?.finalDamage, 0) > 0) {
          await target.processTemporaryEffectSpecialDuration("is-damaged", {
            combatId: game.combat?.id ?? null
          });
        }
      }
    }

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(actionNumber, roundKey);
    }
    if (isShieldMove) {
      await this._registerShieldMoveUsage(roundKey);
      await this._registerShieldProtectionFromMove(move, targetActors, roundKey);
    }

    return result;
  }

  _normalizeMoveTargetKey(targetKey) {
    const normalized = `${targetKey ?? "foe"}`.trim().toLowerCase();
    if (MOVE_TARGET_KEYS.includes(normalized)) return normalized;
    return LEGACY_MOVE_TARGET_MAP[normalized] ?? "foe";
  }

  _localizeMoveTarget(targetKey) {
    const normalized = this._normalizeMoveTargetKey(targetKey);
    const labelByTarget = {
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
    };
    return game.i18n.localize(labelByTarget[normalized] ?? "POKROLE.Common.Unknown");
  }

  _getSelectedTargetActors() {
    return [...(game.user?.targets ?? [])].map((token) => token.actor).filter(Boolean);
  }

  _resolveActorsFromIds(actorIds = []) {
    const ids = Array.isArray(actorIds) ? actorIds : [];
    const uniqueActors = new Map();
    for (const actorId of ids) {
      const normalizedId = `${actorId ?? ""}`.trim();
      if (!normalizedId) continue;
      const actor = game.actors?.get(normalizedId) ?? null;
      if (!actor) continue;
      uniqueActors.set(actor.id, actor);
    }
    return [...uniqueActors.values()];
  }

  _resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors = []) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const actorKey = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(actorKey)) uniqueActors.set(actorKey, actor);
    };

    if (normalizedTarget === "self") {
      addActor(this);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "all-allies") {
      addActor(this);
      for (const actor of selectedTargetActors) addActor(actor);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "ally") {
      if (selectedTargetActors.length > 0) addActor(selectedTargetActors[0]);
      else addActor(this);
      return [...uniqueActors.values()];
    }

    for (const actor of selectedTargetActors) addActor(actor);
    return [...uniqueActors.values()];
  }

  _validateMoveTargetSelection(moveTargetKey, selectedTargetActors = [], resolvedTargetActors = []) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const requiresSelection = new Set([
      "foe",
      "random-foe",
      "ally",
      "all-foes",
      "all-allies",
      "area",
      "battlefield-area"
    ]);
    if (!requiresSelection.has(normalizedTarget)) {
      return { valid: true, message: "" };
    }
    if ((selectedTargetActors ?? []).length > 0 || (resolvedTargetActors ?? []).length > 0) {
      return { valid: true, message: "" };
    }
    return {
      valid: false,
      message: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
    };
  }

  _resolveDamageTargets(moveTargetKey, targetActors) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    if (!Array.isArray(targetActors) || targetActors.length === 0) {
      if (normalizedTarget === "self") return [this];
      return [];
    }

    if (["all-foes", "area", "battlefield-area"].includes(normalizedTarget)) {
      return targetActors;
    }
    return [targetActors[0]];
  }

  async _resolveMoveDamageAgainstTarget({
    move,
    targetActor,
    painPenalty,
    critical,
    isHoldingBackHalf,
    canInflictDeathOnKo = false,
    actionNumber = 1,
    roundKey = null
  }) {
    const category = move.system.category || "physical";
    const moveType = this._normalizeTypeKey(move.system.type || "normal");
    const damageBaseSetup = this._resolveMoveDamageBase(move, targetActor, actionNumber);
    const damageAttributeLabel = damageBaseSetup.label;
    const damageAttributeValue = damageBaseSetup.value;
    const power = this._resolveMovePower(move, targetActor, actionNumber);
    const damagePainPenalty = damageBaseSetup.ignoresPainPenalty ? 0 : painPenalty;
    const criticalDice = critical ? 2 : 0;
    const stabDice = this.hasType(moveType) ? 1 : 0;
    const heldItemBonus = this._getHeldItemDamageBonus(moveType, category);
    const activeWeather = this.getActiveWeatherKey();
    const weatherBonusDice = this._getWeatherDamageBonusDice(moveType, activeWeather);
    const weatherFlatReduction = this._getWeatherFlatDamageReduction(moveType, activeWeather);
    const coverDefenseBonus = targetActor ? this._getCoverDefenseBonus(targetActor, move) : 0;
    const weatherDefenseBonus = targetActor?.type === "pokemon"
      ? targetActor._getWeatherDefenseBonusForStat(category, activeWeather)
      : 0;
    const defense = targetActor
      ? this._getTargetDefense(targetActor, category) + coverDefenseBonus
      : 0;
    const typeInteraction = targetActor
      ? this._evaluateTypeInteraction(moveType, targetActor)
      : {
          immune: false,
          weaknessBonus: 0,
          resistancePenalty: 0,
          label: "POKROLE.Chat.TypeEffect.Neutral"
        };
    const expertBeltBonus = (!typeInteraction.immune && typeInteraction.weaknessBonus > 0)
      ? (this._getHeldItemData()?.superEffectiveBonusDice ?? 0)
      : 0;
    const metronomeBonus = (this._getHeldItemData()?.metronomeBonus && actionNumber > 1) ? 1 : 0;
    const poolBeforeDefense =
      damageAttributeValue +
      power +
      stabDice +
      criticalDice +
      heldItemBonus +
      weatherBonusDice +
      expertBeltBonus +
      metronomeBonus -
      damagePainPenalty;
    const damagePool = Math.max(poolBeforeDefense - defense, 0);

    let damageRoll = null;
    let damageSuccesses = 0;
    if (damagePool > 0) {
      damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate({ async: true });
      damageSuccesses = toNumber(damageRoll.total, 0);
      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${game.i18n.format("POKROLE.Chat.MoveDamageFlavor", {
          actor: this.name,
          move: move.name
        })} (${targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget")})`
      });
    }

    const baseDamage = Math.max(damageSuccesses, 1);
    let finalDamage = 0;
    let shieldPreventedDamage = false;
    let shieldDamageReduction = 0;
    let shieldAddedEffectsBlocked = false;
    let shieldDetail = "";
    let coverAbsorbedDamage = false;
    const shieldResponse =
      targetActor instanceof PokRoleActor
        ? await targetActor._resolveShieldResponseForAttack(
            this._buildShieldAttackContext(move, this, roundKey, true)
          )
        : {
            entries: [],
            damageReduction: 0,
            blocksAddedEffects: false,
            endureEntry: null,
            retaliationEntries: [],
            shieldRemoved: false
          };
    shieldAddedEffectsBlocked = Boolean(shieldResponse?.blocksAddedEffects);
    if (!typeInteraction.immune) {
      const weaknessBonus = damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
      const resolvedDamage = Math.max(
        baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
        1
      );
      finalDamage = isHoldingBackHalf
        ? Math.max(Math.floor(resolvedDamage / 2), 1)
        : resolvedDamage;
      finalDamage = this._applyWeatherDamageReduction(finalDamage, weatherFlatReduction, {
        immune: typeInteraction.immune
      });
    }

    const rangedAttack = this._isMoveRanged(move);
    const targetCover = `${targetActor?.getTrainerCover?.() ?? "none"}`.trim().toLowerCase();
    if (rangedAttack && targetCover === "full" && finalDamage > 0) {
      finalDamage = 0;
      coverAbsorbedDamage = true;
      await this._degradeCoverOnHit(targetActor);
    }

    const hpValue = Math.max(toNumber(targetActor?.system?.resources?.hp?.value, 0), 0);
    if (finalDamage > 0 && shieldResponse?.damageReduction > 0) {
      const reducedDamage = Math.max(finalDamage - shieldResponse.damageReduction, 0);
      shieldDamageReduction = Math.max(finalDamage - reducedDamage, 0);
      finalDamage = reducedDamage;
      shieldPreventedDamage = shieldDamageReduction > 0;
    }
    if (finalDamage > 0 && shieldResponse?.endureEntry && hpValue > 0 && finalDamage >= hpValue) {
      finalDamage = Math.max(hpValue - 1, 0);
      shieldPreventedDamage = true;
      await targetActor._markShieldEndureSpent(shieldResponse.endureEntry.id, roundKey);
      shieldDetail = game.i18n.format("POKROLE.Chat.ShieldMoveEndureTriggered", {
        shield: shieldResponse.endureEntry.moveName,
        target: targetActor.name
      });
    }

    // Focus Sash: survive lethal damage at 1 HP (once)
    const targetHeldData = targetActor?._getHeldItemData?.() ?? null;
    if (finalDamage > 0 && targetHeldData?.focusSash && hpValue > 0 && finalDamage >= hpValue) {
      finalDamage = Math.max(hpValue - 1, 0);
      // Consume the Focus Sash
      const targetBattleItemId = targetActor.system.battleItem || "";
      if (targetBattleItemId) {
        let sashItem = game.items.get(targetBattleItemId);
        if (!sashItem) sashItem = targetActor.items.get(targetBattleItemId);
        if (sashItem) {
          const currentQty = toNumber(sashItem.system?.quantity, 1);
          if (currentQty > 1) {
            await sashItem.update({ "system.quantity": currentQty - 1 });
          } else {
            await targetActor.update({ "system.battleItem": "" });
          }
        }
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}</strong> held on with Focus Sash!`
      });
    }

    let hpBefore = null;
    let hpAfter = null;
    if (targetActor && finalDamage > 0) {
      const hpChange = await this._safeApplyDamage(targetActor, finalDamage, {
        applyDeadOnZero: Boolean(canInflictDeathOnKo),
        sourceMove: move
      });
      hpBefore = hpChange?.hpBefore ?? null;
      hpAfter = hpChange?.hpAfter ?? null;
      if (rangedAttack) {
        await this._degradeCoverOnHit(targetActor);
      }
    }

    // Life Orb recoil: deal recoil damage to attacker after dealing damage
    const attackerHeldData = this._getHeldItemData();
    if (attackerHeldData?.lifeOrb && damageSuccesses > 0) {
      const recoilRoll = await new Roll(successPoolFormula(damageSuccesses)).evaluate({ async: true });
      const recoilDamage = toNumber(recoilRoll.total, 0);
      if (recoilDamage > 0) {
        await this._safeApplyDamage(this, recoilDamage, { applyDeadOnZero: false });
        await recoilRoll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: `${this.name} took ${recoilDamage} recoil damage from Life Orb!`
        });
      }
    }

    // Rocky Helmet: deal 1 damage to attacker on non-ranged physical contact
    if (targetHeldData?.rockyHelmet && finalDamage > 0 && !this._isMoveRanged(move) && category === "physical") {
      await this._safeApplyDamage(this, 1, { applyDeadOnZero: false });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Rocky Helmet dealt 1 damage to <strong>${this.name}</strong>!`
      });
    }

    // Sticky Barb: transfer to attacker on non-ranged physical contact
    if (targetHeldData?.stickyBarb && finalDamage > 0 && !this._isMoveRanged(move) && category === "physical") {
      const targetBattleItemId = targetActor.system.battleItem || "";
      if (targetBattleItemId) {
        await targetActor.update({ "system.battleItem": "" });
        await this.update({ "system.battleItem": targetBattleItemId });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> Sticky Barb transferred to <strong>${this.name}</strong>!`
        });
      }
    }

    // King's Rock: chance to flinch on any damaging hit
    if (attackerHeldData?.flinchOnHit && finalDamage > 0 && targetActor) {
      const flinchRoll = await new Roll("1d6").evaluate({ async: true });
      const flinchResult = toNumber(flinchRoll.total, 0);
      if (flinchResult >= 6) {
        await targetActor.toggleQuickCondition("flinch", { active: true });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: `<strong>${this.name}'s</strong> King's Rock caused <strong>${targetActor.name}</strong> to flinch! (rolled ${flinchResult})`
        });
      }
    }

    // Weakness Policy: +1 strength and +1 special after taking super-effective damage
    if (targetHeldData?.weaknessPolicy && finalDamage > 0 && typeInteraction.weaknessBonus > 0 && targetActor) {
      await this._applyStatEffectToActor(
        { stat: "strength", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
        targetActor,
        move
      );
      await this._applyStatEffectToActor(
        { stat: "special", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
        targetActor,
        move
      );
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Weakness Policy activated! Strength and Special increased by 1.`
      });
    }

    // Eject Button: notify trainer to switch after taking damage
    if (targetHeldData?.ejectButton && finalDamage > 0 && targetActor) {
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Eject Button activated! The trainer should switch ${targetActor.name} out.`
      });
    }

    // Red Card: notify that attacker should be switched after damage
    if (targetHeldData?.redCard && finalDamage > 0 && targetActor) {
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Red Card activated! <strong>${this.name}</strong> should be switched out by its trainer.`
      });
    }

    const retaliationResults =
      shieldResponse?.retaliationEntries?.length > 0
        ? await targetActor._applyShieldRetaliations(shieldResponse, {
            ...this._buildShieldAttackContext(move, this, roundKey, true),
            targetActor
          })
        : [];
    const retaliationDetail = retaliationResults
      .map((entry) =>
        game.i18n.format("POKROLE.Chat.ShieldMoveRetaliation", {
          shield: entry.shieldName,
          target: entry.targetName,
          detail: entry.detail
        })
      )
      .join(" | ");
    if (!shieldDetail && shieldDamageReduction > 0) {
      shieldDetail = game.i18n.format("POKROLE.Chat.ShieldMoveDamageReduced", {
        shield: this._formatShieldEntryNameList(shieldResponse?.entries),
        amount: shieldDamageReduction
      });
    }
    if (retaliationDetail) {
      shieldDetail = [shieldDetail, retaliationDetail].filter(Boolean).join(" | ");
    }

    return {
      targetActor,
      targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
      damageRoll,
      damageSuccesses,
      finalDamage,
      hpBefore,
      hpAfter,
      defense,
      poolBeforeDefense,
      damagePool,
      typeInteraction,
      shieldPreventedDamage,
      shieldDamageReduction,
      shieldAddedEffectsBlocked,
      shieldDetail,
      shieldRemoved: Boolean(shieldResponse?.shieldRemoved),
      coverAbsorbedDamage,
      weatherBonusDice,
      weatherFlatReduction,
      coverDefenseBonus,
      weatherDefenseBonus,
      stabDice,
      criticalDice,
      heldItemBonus,
      expertBeltBonus,
      metronomeBonus,
      damageAttributeLabel
    };
  }

  _collectMoveSecondaryEffects(move) {
    const explicitEffects = this._normalizeSecondaryEffectDefinitions(move.system?.secondaryEffects);
    const legacyEffects = this._convertLegacyEffectGroupsToSecondaryEffects(
      move.system?.effectGroups,
      move.system?.target
    );
    const inferredEffects = this._inferSecondaryEffectsFromDescription(
      move.system?.description,
      move.system?.target,
      move
    );

    const combined = [];
    const signatures = new Set();
    const makeSignature = (effect) =>
      JSON.stringify([
        effect?.section ?? 0,
        effect?.trigger ?? "on-hit",
        effect?.chance ?? 0,
        effect?.target ?? "target",
        effect?.effectType ?? "custom",
        effect?.condition ?? "none",
        effect?.weather ?? "none",
        effect?.terrain ?? "none",
        effect?.stat ?? "none",
        effect?.amount ?? 0,
        effect?.healType ?? "basic",
        effect?.healMode ?? "fixed",
        effect?.conditional ?? false,
        `${effect?.activationCondition ?? ""}`.trim().toLowerCase(),
        `${effect?.linkedEffectId ?? ""}`.trim()
      ]);

    for (const effect of [...explicitEffects, ...legacyEffects, ...inferredEffects]) {
      const normalizedEffect = this._normalizeSecondaryEffectDefinition(effect);
      const signature = makeSignature(normalizedEffect);
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      combined.push(normalizedEffect);
    }

    return this._sanitizeShieldMoveSecondaryEffects(move, combined);
  }

  _normalizeSecondaryEffectDefinitions(effectList) {
    const rawList = Array.isArray(effectList)
      ? effectList
      : effectList && typeof effectList === "object"
        ? Object.values(effectList)
        : [];
    return rawList.map((effect) => this._normalizeSecondaryEffectDefinition(effect));
  }

  _normalizeSecondaryEffectDefinition(effect) {
    const rawEffect = effect && typeof effect === "object" ? effect : {};
    const section = Math.max(Math.floor(toNumber(rawEffect.section, 0)), 0);
    const trigger = MOVE_SECONDARY_TRIGGER_KEYS.includes(rawEffect.trigger)
      ? rawEffect.trigger
      : "on-hit";
    const target = MOVE_SECONDARY_TARGET_KEYS.includes(rawEffect.target)
      ? rawEffect.target
      : "target";
    const effectType = this._normalizeSecondaryEffectType(rawEffect.effectType);
    const normalizedEffectType =
      section > 0 && ["condition", "stat"].includes(effectType) ? "active-effect" : effectType;
    const durationMode = this._normalizeSecondaryDurationMode(
      rawEffect.durationMode,
      normalizedEffectType
    );
    const durationRounds = this._normalizeSecondaryDurationRounds(rawEffect.durationRounds);
    const specialDuration = this._normalizeSpecialDurationList(rawEffect.specialDuration);
    const condition =
      normalizedEffectType === "condition"
        ? this._normalizeConditionVariantKey(rawEffect.condition)
        : this._normalizeConditionKey(rawEffect.condition);
    const weather = this._normalizeSecondaryWeatherKey(rawEffect.weather);
    const terrain = this._normalizeSecondaryTerrainKey(rawEffect.terrain);
    const stat = this._normalizeSecondaryStatKey(rawEffect.stat);
    const chance = this._normalizeSecondaryChanceDice(rawEffect.chance);
    const healMode = this._normalizeSecondaryHealMode(
      rawEffect.healMode,
      normalizedEffectType,
      rawEffect.amount
    );
    const healType = this._normalizeSecondaryHealType(rawEffect.healType, normalizedEffectType, {
      healMode: rawEffect.healMode,
      healingCategory: rawEffect.healingCategory,
      amount: rawEffect.amount
    });
    const healProfile = this._normalizeSecondaryHealProfile(rawEffect.healProfile);
    const healingCategory = this._normalizeHealingCategory(rawEffect.healingCategory);
    const rawAmount = clamp(Math.floor(toNumber(rawEffect.amount, 0)), -999, 999);
    const amount =
      normalizedEffectType === "heal" && healMode !== "fixed"
        ? Math.abs(rawAmount)
        : rawAmount;
    const normalizedHealConfiguration = this._coerceSecondaryHealConfiguration({
      effectType: normalizedEffectType,
      healType,
      healMode,
      healingCategory,
      amount
    });

    return {
      label: `${rawEffect.label ?? ""}`.trim(),
      section,
      trigger,
      chance,
      target,
      effectType: normalizedEffectType,
      durationMode,
      durationRounds,
      specialDuration,
      conditional: Boolean(rawEffect.conditional),
      activationCondition: `${rawEffect.activationCondition ?? ""}`.trim(),
      condition,
      weather,
      terrain,
      stat,
      amount: normalizedHealConfiguration.amount,
      healType: normalizedHealConfiguration.healType,
      healMode: normalizedHealConfiguration.healMode,
      healProfile,
      healingCategory: normalizedHealConfiguration.healingCategory,
      notes: `${rawEffect.notes ?? ""}`.trim(),
      linkedEffectId: `${rawEffect.linkedEffectId ?? ""}`.trim()
    };
  }

  _normalizeSecondaryEffectType(effectType) {
    const normalizedType = `${effectType ?? "condition"}`.trim().toLowerCase();
    if (normalizedType === "activeeffect" || normalizedType === "active_effect") {
      return "active-effect";
    }
    if (normalizedType === "combat-stat") return "stat";
    if (MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(normalizedType)) return normalizedType;
    return "condition";
  }

  _normalizeSecondaryHealMode(healMode, effectType = "custom", amount = 0) {
    const normalizedType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedType !== "heal") return "fixed";
    const normalizedMode = `${healMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_HEAL_MODE_KEYS.includes(normalizedMode)) return normalizedMode;
    return Number(amount) < 0 ? "max-hp-percent" : "fixed";
  }

  _normalizeSecondaryHealType(healType, effectType = "custom", effect = {}) {
    const normalizedType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedType !== "heal") return "basic";
    const normalized = `${healType ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_HEAL_TYPE_KEYS.includes(normalized)) return normalized;
    if (this._normalizeSecondaryHealProfile(effect?.healProfile) !== "standard") return "basic";

    const inferredCategory = this._normalizeHealingCategory(effect?.healingCategory);
    const inferredMode = this._normalizeSecondaryHealMode(
      effect?.healMode,
      normalizedType,
      effect?.amount
    );
    const inferredAmount = Math.abs(Math.floor(toNumber(effect?.amount, 0)));

    if (inferredCategory === "complete") {
      if (inferredMode === "fixed" && inferredAmount === 5) return "complete";
      return "complete-numeric";
    }

    if (inferredMode === "fixed" && inferredAmount === 3) return "basic";
    return "basic-numeric";
  }

  _normalizeSecondaryHealProfile(healProfile) {
    const normalized = `${healProfile ?? "standard"}`.trim().toLowerCase();
    return MOVE_SECONDARY_HEAL_PROFILE_KEYS.includes(normalized) ? normalized : "standard";
  }

  _coerceSecondaryHealConfiguration({ effectType, healType, healMode, healingCategory, amount }) {
    const normalizedEffectType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedEffectType !== "heal") {
      return {
        healType: "basic",
        healMode: "fixed",
        healingCategory: "standard",
        amount: Math.floor(toNumber(amount, 0))
      };
    }

    const normalizedHealType = this._normalizeSecondaryHealType(healType, normalizedEffectType, {
      healMode,
      healingCategory,
      amount
    });
    const normalizedHealMode = this._normalizeSecondaryHealMode(
      healMode,
      normalizedEffectType,
      amount
    );
    const normalizedHealingCategory = this._normalizeHealingCategory(healingCategory);
    const normalizedAmount = Math.abs(Math.floor(toNumber(amount, 0)));

    switch (normalizedHealType) {
      case "basic":
        return {
          healType: normalizedHealType,
          healMode: "fixed",
          healingCategory: "standard",
          amount: 3
        };
      case "complete":
        return {
          healType: normalizedHealType,
          healMode: "fixed",
          healingCategory: "complete",
          amount: 5
        };
      case "complete-numeric":
        return {
          healType: normalizedHealType,
          healMode: normalizedHealMode,
          healingCategory: "complete",
          amount: normalizedAmount
        };
      case "basic-numeric":
      default:
        return {
          healType: "basic-numeric",
          healMode: normalizedHealMode,
          healingCategory:
            normalizedHealingCategory === "complete" ? "standard" : normalizedHealingCategory,
          amount: normalizedAmount
        };
    }
  }

  _inferHealProfileFromMove(move, descriptionText = "") {
    return "standard";
  }

  _getSceneHealingContext() {
    const scene = canvas?.scene ?? null;
    const rawContext = scene?.getFlag?.(POKROLE.ID, "healingContext") ?? {};
    const rawTimeOfDay = `${rawContext?.timeOfDay ?? ""}`.trim().toLowerCase();
    const darkness = Number(scene?.darkness ?? 0);
    const timeOfDay = ["day", "night"].includes(rawTimeOfDay)
      ? rawTimeOfDay
      : darkness >= 0.75
        ? "night"
        : "day";

    const rawLocation = `${rawContext?.location ?? ""}`.trim().toLowerCase();
    const location = ["outdoors", "indoors", "underground"].includes(rawLocation)
      ? rawLocation
      : "outdoors";
    const activeTerrain = this.getActiveTerrainKey();
    const rawTerrain = `${rawContext?.terrain ?? activeTerrain ?? scene?.getFlag?.(POKROLE.ID, "terrain") ?? ""}`
      .trim()
      .toLowerCase();
    const terrain = this._normalizeTerrainKey(rawTerrain);

    return {
      timeOfDay,
      location,
      terrain
    };
  }

  _localizeHealingContextReason(reasonKey) {
    const labelByReason = {
      night: "POKROLE.Chat.SecondaryEffectHealReason.Night",
      indoors: "POKROLE.Chat.SecondaryEffectHealReason.Indoors",
      underground: "POKROLE.Chat.SecondaryEffectHealReason.Underground"
    };
    return game.i18n.localize(labelByReason[reasonKey] ?? "POKROLE.Common.Unknown");
  }

  _getSecondaryConditionActorContext(actor) {
    const normalizedActor = actor ?? null;
    const primaryType = this._normalizeTypeKey(normalizedActor?.system?.types?.primary || "none");
    const secondaryType = this._normalizeTypeKey(normalizedActor?.system?.types?.secondary || "none");
    return {
      name: `${normalizedActor?.name ?? ""}`.trim().toLowerCase(),
      gender: `${normalizedActor?.system?.gender ?? "unknown"}`.trim().toLowerCase(),
      primaryType,
      secondaryType,
      types: [primaryType, secondaryType].filter((typeKey) => typeKey && typeKey !== "none")
    };
  }

  _buildSecondaryActivationContext(effect, targetActor = null, sourceMove = null, context = {}) {
    const sceneContext = this._getSceneHealingContext();
    return {
      weather: this.getActiveWeatherKey(),
      timeOfDay: sceneContext.timeOfDay,
      location: sceneContext.location,
      terrain: this.getActiveTerrainKey() !== "none" ? this.getActiveTerrainKey() : sceneContext.terrain,
      combat: Boolean(game.combat),
      hit: Boolean(context?.hit),
      damagingMove: Boolean(context?.isDamagingMove),
      finalDamage: Math.max(toNumber(context?.finalDamage, 0), 0),
      totalDamageDealt: Math.max(toNumber(context?.totalDamageDealt, 0), 0),
      source: this._getSecondaryConditionActorContext(this),
      target: this._getSecondaryConditionActorContext(targetActor),
      move: {
        name: `${sourceMove?.name ?? ""}`.trim().toLowerCase(),
        type: this._normalizeTypeKey(sourceMove?.system?.type || "none"),
        category: `${sourceMove?.system?.category ?? "support"}`.trim().toLowerCase(),
        target: this._normalizeMoveTargetKey(context?.moveTargetKey ?? sourceMove?.system?.target),
        actionTag: `${sourceMove?.system?.actionTag ?? ""}`.trim().toLowerCase()
      },
      effect: {
        type: this._normalizeSecondaryEffectType(effect?.effectType),
        target: `${effect?.target ?? ""}`.trim().toLowerCase(),
        condition: this._normalizeConditionKey(effect?.condition ?? "none")
      }
    };
  }

  _resolveSecondaryActivationOperand(activationContext, rawKey) {
    const normalizedKey = `${rawKey ?? ""}`.trim();
    if (!normalizedKey) return undefined;

    const aliasKey = {
      time: "timeOfDay",
      timeofday: "timeOfDay",
      "source.type": "source.types",
      "target.type": "target.types"
    }[normalizedKey.toLowerCase()] ?? normalizedKey;

    return foundry.utils.getProperty(activationContext, aliasKey);
  }

  _normalizeSecondaryActivationValue(value) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => `${entry ?? ""}`.trim().toLowerCase())
        .filter(Boolean);
    }
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return `${value}`;
    return `${value ?? ""}`.trim().toLowerCase();
  }

  _evaluateSecondaryActivationClause(rawClause, activationContext) {
    const clause = `${rawClause ?? ""}`.trim();
    if (!clause) return { valid: false, matched: false };

    const comparisonMatch = clause.match(/^([a-z0-9._-]+)\s*(==|=|!=)\s*(.+)$/i);
    if (!comparisonMatch) {
      return { valid: false, matched: false };
    }

    const operandKey = comparisonMatch[1];
    const operator = comparisonMatch[2];
    const expectedRaw = comparisonMatch[3]
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .toLowerCase();
    const actualValue = this._resolveSecondaryActivationOperand(activationContext, operandKey);
    if (typeof actualValue === "undefined") {
      return { valid: false, matched: false };
    }

    const normalizedActual = this._normalizeSecondaryActivationValue(actualValue);
    const matches =
      Array.isArray(normalizedActual)
        ? normalizedActual.includes(expectedRaw)
        : normalizedActual === expectedRaw;

    return {
      valid: true,
      matched: operator === "!=" ? !matches : matches
    };
  }

  _evaluateSecondaryActivationCondition(effect, targetActor = null, sourceMove = null, context = {}) {
    const isConditional = Boolean(effect?.conditional);
    const expression = `${effect?.activationCondition ?? ""}`.trim();
    if (!isConditional) {
      return { passed: true, detail: "" };
    }
    if (!expression) {
      return {
        passed: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionInvalid")
      };
    }

    const activationContext = this._buildSecondaryActivationContext(
      effect,
      targetActor,
      sourceMove,
      context
    );
    const orClauses = expression
      .split(/\s+or\s+/i)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!orClauses.length) {
      return {
        passed: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionInvalid")
      };
    }

    let hasInvalidClause = false;
    for (const orClause of orClauses) {
      const andClauses = orClause
        .split(/\s+and\s+/i)
        .map((entry) => entry.trim().replace(/^\(+|\)+$/g, ""))
        .filter(Boolean);
      if (!andClauses.length) continue;

      let branchValid = true;
      let branchMatched = true;
      for (const andClause of andClauses) {
        const clauseResult = this._evaluateSecondaryActivationClause(andClause, activationContext);
        if (!clauseResult.valid) {
          branchValid = false;
          branchMatched = false;
          hasInvalidClause = true;
          break;
        }
        if (!clauseResult.matched) {
          branchMatched = false;
          break;
        }
      }

      if (branchValid && branchMatched) {
        return { passed: true, detail: "" };
      }
    }

    if (hasInvalidClause) {
      return {
        passed: false,
        detail: game.i18n.format("POKROLE.Chat.SecondaryEffectConditionInvalidExpression", {
          condition: expression
        })
      };
    }

    return {
      passed: false,
      detail: game.i18n.format("POKROLE.Chat.SecondaryEffectConditionNotMet", {
        condition: expression
      })
    };
  }

  _resolveSecondaryHealConfiguration(effect, sourceMove = null) {
    const healType = this._normalizeSecondaryHealType(effect?.healType, effect?.effectType, effect);
    const healConfiguration = this._coerceSecondaryHealConfiguration({
      effectType: effect?.effectType,
      healType,
      healMode: effect?.healMode,
      healingCategory: effect?.healingCategory,
      amount: effect?.amount
    });
    const healProfile = this._normalizeSecondaryHealProfile(effect?.healProfile);

    const resolved = {
      effectType: "heal",
      healType: healConfiguration.healType,
      healMode: healConfiguration.healMode,
      healProfile,
      healingCategory: healConfiguration.healingCategory,
      amount: healConfiguration.amount,
      adjustmentDetail: ""
    };
    return resolved;
  }

  _normalizeSecondaryDurationMode(durationMode, effectType = "custom") {
    const normalized = `${durationMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalized)) {
      return normalized;
    }
    return "manual";
  }

  _normalizeSecondaryChanceDice(chanceValue, fallback = 0) {
    const numericChance = Number(chanceValue);
    if (!Number.isFinite(numericChance)) return fallback;
    const normalizedChance = Math.floor(numericChance);
    if (normalizedChance <= 0) return 0;
    if (normalizedChance >= 100) return 0;
    if (normalizedChance <= SECONDARY_EFFECT_CHANCE_DICE_MAX) {
      return normalizedChance;
    }
    return legacyChancePercentToDiceCount(normalizedChance, SECONDARY_EFFECT_CHANCE_DICE_MAX);
  }

  _getWeatherSecondaryChanceDiceBonus(effect, move, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const moveType = this._normalizeTypeKey(move?.system?.type ?? "none");
    const normalizedEffectType = this._normalizeSecondaryEffectType(effect?.effectType);
    const conditionVariant = this._normalizeConditionVariantKey(effect?.condition);
    const isBurnEffect = conditionVariant === "burn" || conditionVariant === "burn2" || conditionVariant === "burn3";

    if (
      weather === "harsh-sunlight" &&
      moveType === "fire" &&
      normalizedEffectType === "condition" &&
      isBurnEffect
    ) {
      return 2;
    }

    return 0;
  }

  _normalizeSecondaryDurationRounds(durationRounds) {
    return clamp(Math.floor(toNumber(durationRounds, 1)), 1, 99);
  }

  _normalizeSpecialDurationList(value) {
    const rawValues = Array.isArray(value)
      ? value
      : typeof value === "string" && value.trim()
        ? value.split(",")
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
    const normalized = [];
    for (const rawEntry of rawValues) {
      const durationKey = `${rawEntry ?? ""}`.trim().toLowerCase();
      if (!durationKey || durationKey === "none") continue;
      if (!MOVE_SECONDARY_SPECIAL_DURATION_KEYS.includes(durationKey)) continue;
      if (!normalized.includes(durationKey)) normalized.push(durationKey);
    }
    return normalized;
  }

  _normalizeConditionVariantKey(conditionKey) {
    const normalized = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (!normalized) return "none";
    if (normalized === "burn3") return "burn3";
    if (normalized === "burn2") return "burn2";
    if (normalized === "burn1" || normalized === "burn") return "burn";
    const alias = CONDITION_ALIASES[normalized] ?? normalized;
    if (alias === "dead") return "dead";
    return MOVE_SECONDARY_CONDITION_KEYS.includes(alias) ? alias : "none";
  }

  _normalizeConditionKey(conditionKey) {
    const normalized = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    const alias = CONDITION_ALIASES[normalized] ?? normalized;
    if (MOVE_SECONDARY_CONDITION_KEYS.includes(alias)) return alias;
    if (alias.includes("paraly")) return "paralyzed";
    if (alias.includes("poison")) return "poisoned";
    if (alias.includes("sleep")) return "sleep";
    if (alias.includes("burn")) return "burn";
    if (alias.includes("freez")) return "frozen";
    if (alias.includes("confus")) return "confused";
    if (alias.includes("flinch")) return "flinch";
    if (alias.includes("disable")) return "disabled";
    if (alias.includes("infatuat")) return "infatuated";
    if (alias.includes("faint")) return "fainted";
    if (alias.includes("dead") || alias.includes("mort")) return "dead";
    return "none";
  }

  _normalizeSecondaryWeatherKey(weatherKey) {
    const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
    return MOVE_SECONDARY_WEATHER_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeSecondaryTerrainKey(terrainKey) {
    const normalized = `${terrainKey ?? "none"}`.trim().toLowerCase();
    return MOVE_SECONDARY_TERRAIN_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizePokemonGenderKey(actor) {
    const rawGender = `${actor?.system?.gender ?? "unknown"}`.trim().toLowerCase();
    return ["male", "female", "genderless", "unknown"].includes(rawGender)
      ? rawGender
      : "unknown";
  }

  _validateInfatuationGenderRule(sourceActor, targetActor, options = {}) {
    if (options.allowManualOverride === true) {
      return { valid: true, detail: "" };
    }
    if (!targetActor || targetActor.type !== "pokemon") {
      return { valid: true, detail: "" };
    }

    const targetGender = this._normalizePokemonGenderKey(targetActor);
    if (!["male", "female"].includes(targetGender)) {
      return {
        valid: false,
        detail: game.i18n.localize("POKROLE.Chat.InfatuationInvalidTargetGender")
      };
    }

    if (!sourceActor || sourceActor.id === targetActor.id || sourceActor.type !== "pokemon") {
      return { valid: true, detail: "" };
    }

    const sourceGender = this._normalizePokemonGenderKey(sourceActor);
    if (!["male", "female"].includes(sourceGender) || sourceGender === targetGender) {
      return {
        valid: false,
        detail: game.i18n.localize("POKROLE.Chat.InfatuationRequiresOppositeGender")
      };
    }

    return { valid: true, detail: "" };
  }

  _getConditionBlockedDetail(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return "";

    const weather = this.getActiveWeatherKey();
    const localizedCondition = `${this._localizeConditionName(normalizedCondition)}`.toLowerCase();
    if ((weather === "sunny" || weather === "harsh-sunlight") && normalizedCondition === "frozen") {
      return game.i18n.format("POKROLE.Chat.ConditionBlockedByWeather", {
        condition: localizedCondition,
        weather: this._localizeWeatherName(weather)
      });
    }
    if (weather === "typhoon" && normalizedCondition === "burn") {
      return game.i18n.format("POKROLE.Chat.ConditionBlockedByWeather", {
        condition: localizedCondition,
        weather: this._localizeWeatherName(weather)
      });
    }

    if (normalizedCondition === "burn" && targetActor.hasType?.("fire")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "frozen" && targetActor.hasType?.("ice")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "paralyzed" && targetActor.hasType?.("electric")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (
      ["poisoned", "badly-poisoned"].includes(normalizedCondition) &&
      (targetActor.hasType?.("poison") || targetActor.hasType?.("steel"))
    ) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "infatuated" && targetActor.type === "pokemon") {
      const gender = `${targetActor.system?.gender ?? "unknown"}`.trim().toLowerCase();
      if (["genderless", "unknown", "none", "null", ""].includes(gender)) {
        return game.i18n.localize("POKROLE.Chat.ConditionImmune");
      }
    }

    return "";
  }

  _isConditionImmune(targetActor, conditionKey) {
    return Boolean(this._getConditionBlockedDetail(targetActor, conditionKey));
  }

  _normalizeSecondaryStatKey(statKey) {
    const normalized = `${statKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "")
      .replace(/[^a-z0-9]+/g, "");
    const mapped = LEGACY_EFFECT_STAT_MAP[normalized] ?? normalized;
    if (MOVE_SECONDARY_STAT_KEYS.includes(mapped)) return mapped;
    if (mapped.includes("specialdef")) return "specialDefense";
    if (mapped.includes("def")) return "defense";
    if (mapped.includes("attack")) return "strength";
    if (mapped.includes("speed")) return "dexterity";
    if (mapped.includes("accuracy")) return "accuracy";
    if (mapped.includes("evasion")) return "evasion";
    if (mapped.includes("clash")) return "clash";
    if (mapped.includes("special")) return "special";
    return "none";
  }

  _convertLegacyEffectGroupsToSecondaryEffects(effectGroups, moveTargetKey) {
    if (!Array.isArray(effectGroups) || effectGroups.length === 0) return [];
    const normalizedMoveTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const secondaryEffects = [];

    for (const group of effectGroups) {
      if (!group || typeof group !== "object") continue;
      let chance = 100;
      const conditionType = `${group.condition?.type ?? "none"}`.trim().toLowerCase();
      if (conditionType === "chancedice") {
        const chanceDice = Math.max(toNumber(group.condition?.amount, 1), 1);
        chance = clamp(Math.round((1 - Math.pow(2 / 3, chanceDice)) * 100), 1, 100);
      }

      const effects = Array.isArray(group.effects) ? group.effects : [];
      for (const effect of effects) {
        if (!effect || typeof effect !== "object") continue;
        const type = `${effect.type ?? "custom"}`.trim().toLowerCase();
        const target =
          effect.affects === "user"
            ? "self"
            : ["all-foes", "area", "battlefield-area"].includes(normalizedMoveTarget)
              ? "all-targets"
              : "target";
        secondaryEffects.push(
          this._normalizeSecondaryEffectDefinition({
            label: "",
            trigger: "on-hit",
            chance,
            target,
            effectType:
              type === "ailment"
                ? "condition"
                : type === "statchange"
                  ? "stat"
                  : "custom",
            condition: effect.ailment ?? "none",
            stat: effect.stat ?? "none",
            amount: toNumber(effect.amount, 0),
            notes: ""
          })
        );
      }
    }

    return secondaryEffects;
  }

  _inferSecondaryEffectsFromDescription(description, moveTargetKey, move = null) {
    const descriptionText = `${description ?? ""}`.replace(/\s+/g, " ").trim();
    if (!descriptionText) return [];
    const lowerDescription = descriptionText.toLowerCase();
    const inferredEffects = [];
    const signatures = new Set();
    const defaultTarget =
      this._normalizeMoveTargetKey(moveTargetKey) === "self" ? "self" : "target";

    const addEffect = (effect) => {
      const normalized = this._normalizeSecondaryEffectDefinition(effect);
      const signature = JSON.stringify([
        normalized.trigger,
        normalized.chance,
        normalized.target,
        normalized.effectType,
        normalized.condition,
        normalized.stat,
        normalized.amount
      ]);
      if (signatures.has(signature)) return;
      signatures.add(signature);
      inferredEffects.push(normalized);
    };

    const mechanicPattern = /\{mechanic:([a-z-]+)\}/gi;
    let mechanicMatch = mechanicPattern.exec(descriptionText);
    while (mechanicMatch) {
      const conditionKey = this._normalizeConditionKey(mechanicMatch[1]);
      if (conditionKey !== "none") {
        const chance = this._extractChanceBeforeIndex(lowerDescription, mechanicMatch.index);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target: defaultTarget,
          effectType: "condition",
          condition: conditionKey,
          stat: "none",
          amount: 0,
          notes: ""
        });
      }
      mechanicMatch = mechanicPattern.exec(descriptionText);
    }

    const statusMatchers = [
      { condition: "burn", regex: /(\d{1,3})%\s+chance[^.]*\bburn/i },
      { condition: "frozen", regex: /(\d{1,3})%\s+chance[^.]*\bfreez/i },
      { condition: "paralyzed", regex: /(\d{1,3})%\s+chance[^.]*\bparaly/i },
      { condition: "poisoned", regex: /(\d{1,3})%\s+chance[^.]*\bpoison/i },
      { condition: "sleep", regex: /(\d{1,3})%\s+chance[^.]*\bsleep/i },
      { condition: "confused", regex: /(\d{1,3})%\s+chance[^.]*\bconfus/i },
      { condition: "flinch", regex: /(\d{1,3})%\s+chance[^.]*\bflinch/i }
    ];
    for (const matcher of statusMatchers) {
      const match = matcher.regex.exec(descriptionText);
      if (!match) continue;
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: clamp(toNumber(match[1], 100), 0, 100),
        target: defaultTarget,
        effectType: "condition",
        condition: matcher.condition,
        stat: "none",
        amount: 0,
        notes: ""
      });
    }

    const stageRegex =
      /(?:(\d{1,3})%\s+chance\s+to\s+)?(raise|raises|increase|increases|lower|lowers|decrease|decreases)\s+(?:the\s+)?(user|target|foe|ally|its|their)(?:'s)?\s+([a-z\/\.\s-]+?)\s+by\s+(one|two|three|four|five|six|\d+)\s+stages?/gi;
    let stageMatch = stageRegex.exec(descriptionText);
    while (stageMatch) {
      const chance = stageMatch[1] ? clamp(toNumber(stageMatch[1], 100), 0, 100) : 100;
      const directionWord = `${stageMatch[2] ?? ""}`.toLowerCase();
      const targetWord = `${stageMatch[3] ?? ""}`.toLowerCase();
      const statWord = `${stageMatch[4] ?? ""}`.toLowerCase();
      const amount = this._parseStageAmount(stageMatch[5], directionWord);
      const target = ["user", "its", "their"].includes(targetWord) ? "self" : "target";
      const stat = this._normalizeSecondaryStatKey(statWord);
      if (stat !== "none" && amount !== 0) {
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target,
          effectType: "stat",
          condition: "none",
          stat,
          amount,
          notes: ""
        });
      }
      stageMatch = stageRegex.exec(descriptionText);
    }

    const halfHealRegex =
      /heals?\s+(?:the\s+)?(user|itself|self|target|ally)?[^.]*half[^.]*max hp/i;
    const halfHealMatch = halfHealRegex.exec(descriptionText);
    if (halfHealMatch) {
      const targetWord = `${halfHealMatch[1] ?? ""}`.toLowerCase();
      const target = ["user", "itself", "self"].includes(targetWord) ? "self" : "target";
      const healProfile = this._inferHealProfileFromMove(move, descriptionText);
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: 100,
        target,
        effectType: "heal",
        condition: "none",
        stat: "none",
        amount: -50,
        healProfile,
        notes: ""
      });
    }

    const fractionDamageRegex = /(\d+)\s*\/\s*(\d+)\s+(?:of\s+)?(?:the\s+)?target'?s?\s+max hp/i;
    const fractionDamageMatch = fractionDamageRegex.exec(descriptionText);
    if (fractionDamageMatch) {
      const numerator = Math.max(toNumber(fractionDamageMatch[1], 0), 0);
      const denominator = Math.max(toNumber(fractionDamageMatch[2], 1), 1);
      if (numerator > 0) {
        const percent = clamp(Math.round((numerator / denominator) * 100), 1, 100);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance: 100,
          target: defaultTarget,
          effectType: "damage",
          condition: "none",
          stat: "none",
          amount: -percent,
          notes: ""
        });
      }
    }

    return inferredEffects;
  }

  _extractChanceBeforeIndex(text, index) {
    const start = Math.max(index - 140, 0);
    const window = text.slice(start, index + 1);
    const pattern = /(\d{1,3})%\s+chance/gi;
    let chance = null;
    let match = pattern.exec(window);
    while (match) {
      chance = clamp(toNumber(match[1], 100), 0, 100);
      match = pattern.exec(window);
    }
    return chance ?? 100;
  }

  _parseStageAmount(value, directionWord) {
    const text = `${value ?? ""}`.trim().toLowerCase();
    const numberMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const numericValue = numberMap[text] ?? toNumber(text, 0);
    const sign = ["lower", "lowers", "decrease", "decreases"].includes(directionWord) ? -1 : 1;
    return clamp(sign * Math.max(Math.floor(numericValue), 0), -6, 6);
  }

  async _applyMoveSecondaryEffects({
    move,
    sourceItem = null,
    moveTargetKey,
    secondaryEffects,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage,
    damageTargetResults = [],
    roundKey = null
  }) {
    if (!Array.isArray(secondaryEffects) || secondaryEffects.length === 0) {
      return [];
    }

    const effectSourceItem = sourceItem ?? move ?? null;
    const activeWeather = this.getActiveWeatherKey();
    const results = [];
    const totalDamageDealt = (Array.isArray(damageTargetResults) ? damageTargetResults : []).reduce(
      (sum, result) => sum + Math.max(toNumber(result?.finalDamage, 0), 0),
      0
    );
    for (const effect of secondaryEffects) {
      const normalizedEffectType = this._normalizeSecondaryEffectType(effect.effectType);
      if (!this._secondaryTriggerMatches(effect.trigger, { hit, isDamagingMove, finalDamage })) {
        continue;
      }

      const baseChanceDice = this._normalizeSecondaryChanceDice(effect.chance);
      const weatherChanceBonusDice = this._getWeatherSecondaryChanceDiceBonus(
        effect,
        move,
        activeWeather
      );
      // Loaded Dice: +2 chance dice for secondary effects
      const loadedDiceBonus = this._getHeldItemData()?.loadedDice ? 2 : 0;
      const chanceDice = Math.max(baseChanceDice + weatherChanceBonusDice + loadedDiceBonus, 0);
      let chanceRollResults = [];
      let chanceSucceeded = true;
      if (chanceDice > 0 && baseChanceDice > 0) {
        const chanceRoll = await new Roll(`${chanceDice}d6`).evaluate({ async: true });
        chanceRollResults = chanceRoll.dice.flatMap((die) =>
          Array.isArray(die?.results)
            ? die.results.map((result) => Math.floor(toNumber(result?.result, 0)))
            : []
        );
        chanceSucceeded = chanceRollResults.some((result) => result === 6);
      }

      if (!chanceSucceeded) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Common.None"),
          applied: false,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
            rolls: chanceRollResults.join(", "),
            dice: chanceDice
          })
        });
        continue;
      }

      if (normalizedEffectType === "weather") {
        const applyResult = await this._applySecondaryEffectToActor(
          { ...effect, effectType: "weather" },
          this,
          effectSourceItem,
          { moveTargetKey, hit, isDamagingMove, finalDamage, totalDamageDealt, damageTargetResults }
        );
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: this._localizeMoveTarget("battlefield"),
          applied: applyResult.applied,
          detail: applyResult.applied
            ? applyResult.detail
            : this._resolveSecondaryEffectFailureDetail(effect, this, applyResult, {
                finalDamage,
                totalDamageDealt,
                damageTargetResults
              })
        });
        continue;
      }

      const effectTargets = this._resolveActorsForSecondaryTarget(effect.target, {
        moveTargetKey,
        targetActors
      });
      if (!effectTargets.length) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
          applied: false,
          detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoTarget")
        });
        continue;
      }

      for (const targetActor of effectTargets) {
        const shieldResponse =
          targetActor instanceof PokRoleActor
            ? await targetActor._resolveShieldResponseForAttack(
                this._buildShieldAttackContext(move, this, roundKey, isDamagingMove)
              )
            : null;
        if (shieldResponse?.blocksAddedEffects) {
          results.push({
            label: this._formatSecondaryEffectLabel(effect),
            targetName: targetActor.name,
            applied: false,
            detail: game.i18n.format("POKROLE.Chat.SecondaryEffectBlockedByShield", {
              shield: this._formatShieldEntryNameList(shieldResponse.entries)
            })
          });
          continue;
        }

        const hasConditionalTrigger =
          Boolean(effect?.passive) ||
          `${effect?.passiveTrigger ?? ""}`.trim().length > 0;
        if (hasConditionalTrigger) {
          const triggerCheckEffect = {
            ...effect,
            passive: true
          };
          if (!this._checkPassiveTrigger(triggerCheckEffect, targetActor)) {
            results.push({
              label: this._formatSecondaryEffectLabel(effect),
              targetName: targetActor.name,
              applied: false,
              detail: game.i18n.localize("POKROLE.Chat.PassiveTriggerNotMet")
            });
            continue;
          }
        }
        const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, effectSourceItem, {
          moveTargetKey,
          hit,
          isDamagingMove,
          finalDamage,
          totalDamageDealt,
          damageTargetResults
        });
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: targetActor.name,
          applied: applyResult.applied,
          detail: applyResult.applied
            ? applyResult.detail
            : this._resolveSecondaryEffectFailureDetail(effect, targetActor, applyResult, {
                finalDamage,
                totalDamageDealt,
                damageTargetResults
              })
        });
      }
    }

    return results;
  }

  async _applyAbilityAutomationEffects({
    move,
    moveTargetKey,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage,
    damageTargetResults = [],
    roundKey = null
  }) {
    const abilityItems = this.items.filter((item) => item.type === "ability");
    if (!abilityItems.length) return [];

    const results = [];
    for (const abilityItem of abilityItems) {
      const triggerText = `${abilityItem.system?.trigger ?? ""}`.trim().toLowerCase();
      const triggerAllows =
        !triggerText ||
        triggerText.includes("always") ||
        (hit && triggerText.includes("hit")) ||
        (!hit && triggerText.includes("miss"));
      if (!triggerAllows) continue;

      const payloadEffects = this._parseAbilityAutomationPayload(abilityItem.system?.effect);
      if (!payloadEffects.length) continue;

      const normalizedEffects = payloadEffects.map((effect) =>
        this._normalizeSecondaryEffectDefinition({
          ...effect,
          label: `${effect?.label ?? ""}`.trim() || abilityItem.name
        })
      );

      const effectResults = await this._applyMoveSecondaryEffects({
        move,
        sourceItem: abilityItem,
        moveTargetKey,
        secondaryEffects: normalizedEffects,
        targetActors,
        hit,
        isDamagingMove,
        finalDamage,
        damageTargetResults,
        roundKey
      });
      results.push(...effectResults);
    }

    return results;
  }

  _parseAbilityAutomationPayload(effectText) {
    const text = `${effectText ?? ""}`.trim();
    if (!text) return [];
    if (!(text.startsWith("{") || text.startsWith("["))) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch (error) {
      console.warn(`${POKROLE.ID} | Invalid ability automation JSON payload`, error);
    }
    return [];
  }

  _secondaryTriggerMatches(trigger, { hit, isDamagingMove, finalDamage }) {
    switch (`${trigger ?? "on-hit"}`.toLowerCase()) {
      case "always":
        return true;
      case "on-miss":
        return !hit;
      case "on-hit-damage":
        return hit && isDamagingMove && toNumber(finalDamage, 0) > 0;
      case "on-hit":
      default:
        return hit;
    }
  }

  _resolveActorsForSecondaryTarget(targetMode, context) {
    const { moveTargetKey, targetActors } = context;
    const normalizedTarget =
      MOVE_SECONDARY_TARGET_KEYS.includes(targetMode) ? targetMode : "target";
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const key = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(key)) uniqueActors.set(key, actor);
    };

    switch (normalizedTarget) {
      case "self":
        addActor(this);
        break;
      case "all-targets":
      case "all-foes":
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "all-allies":
        addActor(this);
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "target":
      default:
        if ((targetActors ?? []).length > 0) {
          addActor(targetActors[0]);
        } else if (this._normalizeMoveTargetKey(moveTargetKey) === "self") {
          addActor(this);
        }
        break;
    }

    return [...uniqueActors.values()];
  }

  _formatSecondaryEffectLabel(effect) {
    if (effect.label) return effect.label;
    const normalizedType = this._normalizeSecondaryEffectType(effect.effectType);

    const effectTypeLabel = game.i18n.localize(
      `POKROLE.Move.Secondary.Type.${this._toSecondaryTypeLabelSuffix(normalizedType)}`
    );
    if (normalizedType === "condition" && effect.condition !== "none") {
      const conditionLabel =
        this._normalizeConditionKey(effect.condition) === "burn"
          ? this._localizeBurnStageName(this._resolveBurnStageFromCondition(effect.condition))
          : this._localizeConditionName(effect.condition);
      return `${effectTypeLabel}: ${conditionLabel}`;
    }
    if (normalizedType === "weather") {
      return `${effectTypeLabel}: ${this._localizeSecondaryWeatherName(effect.weather)}`;
    }
    if (normalizedType === "terrain") {
      return `${effectTypeLabel}: ${this._localizeSecondaryTerrainName(effect.terrain)}`;
    }
    if (normalizedType === "stat" && effect.stat !== "none" && effect.amount !== 0) {
      const amountText = effect.amount > 0 ? `+${effect.amount}` : `${effect.amount}`;
      return `${effectTypeLabel}: ${this._localizeSecondaryStatName(effect.stat)} ${amountText}`;
    }
    if (normalizedType === "heal") {
      const healMode = this._normalizeSecondaryHealMode(
        effect.healMode,
        normalizedType,
        effect.amount
      );
      if (healMode === "damage-percent") {
        return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}% ${game.i18n.localize("POKROLE.Move.Secondary.HealMode.OfDamageDealt")}`;
      }
      if (healMode === "max-hp-percent") {
        return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}% ${game.i18n.localize("POKROLE.Move.Secondary.HealMode.OfMaxHp")}`;
      }
      return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}`;
    }
    if (["damage", "will"].includes(normalizedType)) {
      return `${effectTypeLabel}: ${effect.amount}`;
    }
    return effectTypeLabel;
  }

  _toSecondaryTypeLabelSuffix(effectType) {
    const suffixByType = {
      condition: "Condition",
      "active-effect": "ActiveEffect",
      stat: "Stat",
      weather: "Weather",
      terrain: "Terrain",
      damage: "Damage",
      heal: "Heal",
      will: "Will",
      custom: "Custom"
    };
    return suffixByType[effectType] ?? "Custom";
  }

  _localizeConditionName(conditionKey) {
    const normalizedCondition = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (normalizedCondition === "burn1") return this._localizeBurnStageName(1);
    if (normalizedCondition === "burn2") return this._localizeBurnStageName(2);
    if (normalizedCondition === "burn3") return this._localizeBurnStageName(3);
    const knownConditionLabels = {
      sleep: "POKROLE.Conditions.Sleep",
      burn: "POKROLE.Conditions.Burn",
      frozen: "POKROLE.Conditions.Frozen",
      paralyzed: "POKROLE.Conditions.Paralyzed",
      poisoned: "POKROLE.Conditions.Poisoned",
      fainted: "POKROLE.Conditions.Fainted",
      dead: "POKROLE.Conditions.Dead",
      confused: "POKROLE.Move.Secondary.Condition.Confused",
      flinch: "POKROLE.Move.Secondary.Condition.Flinch",
      disabled: "POKROLE.Move.Secondary.Condition.Disabled",
      infatuated: "POKROLE.Move.Secondary.Condition.Infatuated",
      "badly-poisoned": "POKROLE.Move.Secondary.Condition.BadlyPoisoned"
    };
    return game.i18n.localize(knownConditionLabels[conditionKey] ?? "POKROLE.Common.Unknown");
  }

  _localizeSecondaryStatName(statKey) {
    const combatStatLabels = {
      accuracy: "POKROLE.Pokemon.Accuracy",
      damage: "POKROLE.Pokemon.Damage",
      evasion: "POKROLE.Pokemon.Evasion",
      clash: "POKROLE.Pokemon.Clash",
      defense: "POKROLE.Combat.Defense",
      specialDefense: "POKROLE.Combat.SpecialDefense"
    };
    if (combatStatLabels[statKey]) {
      return game.i18n.localize(combatStatLabels[statKey]);
    }
    return this.localizeTrait(statKey);
  }

  _localizeSecondaryWeatherName(weatherKey) {
    const labelByWeather = {
      none: "POKROLE.Common.None",
      sunny: "POKROLE.Combat.WeatherValues.Sunny",
      "harsh-sunlight": "POKROLE.Combat.WeatherValues.HarshSunlight",
      rain: "POKROLE.Combat.WeatherValues.Rain",
      typhoon: "POKROLE.Combat.WeatherValues.Typhoon",
      sandstorm: "POKROLE.Combat.WeatherValues.Sandstorm",
      "strong-winds": "POKROLE.Combat.WeatherValues.StrongWinds",
      hail: "POKROLE.Combat.WeatherValues.Hail"
    };
    const normalizedWeather = this._normalizeSecondaryWeatherKey(weatherKey);
    return game.i18n.localize(labelByWeather[normalizedWeather] ?? "POKROLE.Common.None");
  }

  _localizeSecondaryTerrainName(terrainKey) {
    const labelByTerrain = {
      none: "POKROLE.Common.None",
      electric: "POKROLE.Combat.TerrainValues.Electric",
      grassy: "POKROLE.Combat.TerrainValues.Grassy",
      misty: "POKROLE.Combat.TerrainValues.Misty",
      psychic: "POKROLE.Combat.TerrainValues.Psychic"
    };
    const normalizedTerrain = this._normalizeSecondaryTerrainKey(terrainKey);
    return game.i18n.localize(labelByTerrain[normalizedTerrain] ?? "POKROLE.Common.None");
  }

  _resolveSecondaryEffectFailureDetail(effect, targetActor = null, applyResult = {}, context = {}) {
    const rawDetail = `${applyResult?.detail ?? ""}`.trim();
    const noneLabel = game.i18n.localize("POKROLE.Common.None");
    const unknownLabel = game.i18n.localize("POKROLE.Common.Unknown");
    if (rawDetail && ![noneLabel, unknownLabel].includes(rawDetail)) return rawDetail;

    const normalizedType = this._normalizeSecondaryEffectType(effect?.effectType);
    switch (normalizedType) {
      case "heal": {
        const resolvedHeal = this._resolveSecondaryHealConfiguration(effect, context?.sourceMove ?? null);
        const healMode = resolvedHeal.healMode;
        if (resolvedHeal.adjustmentDetail && Math.max(toNumber(resolvedHeal.amount, 0), 0) <= 0) {
          return resolvedHeal.adjustmentDetail;
        }
        if (healMode === "damage-percent" && Math.max(toNumber(context?.totalDamageDealt, 0), 0) <= 0) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoDamageToDrain");
        }
        if (targetActor) {
          const hpValue = Math.max(toNumber(targetActor.system?.resources?.hp?.value, 0), 0);
          const hpMax = Math.max(toNumber(targetActor.system?.resources?.hp?.max, 1), 1);
          if (hpValue >= hpMax) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyFullHp");
          }
          if (game.combat && targetActor instanceof PokRoleActor) {
            const limit = this._getHealingRoundLimit(resolvedHeal.healingCategory);
            if (Number.isFinite(limit)) {
              const track = targetActor._getHealingTrack();
              if (Math.max(toNumber(track?.healedThisRound, 0), 0) >= limit) {
                return game.i18n.format("POKROLE.Chat.SecondaryEffectHealingLimitReached", { limit });
              }
            }
          }
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoHealConfigured");
      }
      case "damage":
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoDamageConfigured");
      case "stat": {
        const statKey = this._normalizeSecondaryStatKey(effect?.stat);
        if (statKey === "none" || rawDetail === unknownLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectInvalidStat");
        }
        if (Math.floor(toNumber(effect?.amount, 0)) === 0 || rawDetail === noneLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatConfigured");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange");
      }
      case "will": {
        const amount = Math.floor(toNumber(effect?.amount, 0));
        if (amount === 0 || rawDetail === noneLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWillConfigured");
        }
        if (targetActor) {
          const currentWill = Math.max(toNumber(targetActor.system?.resources?.will?.value, 0), 0);
          const maxWill = Math.max(toNumber(targetActor.system?.resources?.will?.max, 1), 1);
          if (amount > 0 && currentWill >= maxWill) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyFullWill");
          }
          if (amount < 0 && currentWill <= 0) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyEmptyWill");
          }
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWillChange");
      }
      case "condition":
        if (this._normalizeConditionKey(effect?.condition) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoConditionConfigured");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "weather":
        if (this._normalizeSecondaryWeatherKey(effect?.weather) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWeatherConfigured");
        }
        if (!game.combat) {
          return game.i18n.localize("POKROLE.Errors.CombatRequired");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "terrain":
        if (this._normalizeSecondaryTerrainKey(effect?.terrain) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoTerrainConfigured");
        }
        if (!game.combat) {
          return game.i18n.localize("POKROLE.Errors.CombatRequired");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "active-effect":
        return game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration");
      case "custom":
        return `${effect?.notes ?? ""}`.trim() || game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      default:
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
    }
  }

  async _applySecondaryEffectToActor(effect, targetActor, sourceMove = null, context = {}) {
    const activationCheck = this._evaluateSecondaryActivationCondition(
      effect,
      targetActor,
      sourceMove,
      context
    );
    if (!activationCheck.passed) {
      return {
        applied: false,
        detail: activationCheck.detail || game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionNotMet")
      };
    }

    const normalizedType = this._normalizeSecondaryEffectType(effect.effectType);
    switch (normalizedType) {
      case "condition":
        return this._applyConditionEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "active-effect":
        return this._applySecondaryActiveEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "stat":
        return this._applyStatEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "weather":
        return this._applyWeatherEffect({ ...effect, effectType: normalizedType }, sourceMove);
      case "terrain":
        return this._applyTerrainEffect({ ...effect, effectType: normalizedType }, sourceMove);
      case "damage": {
        const damageValue = this._resolveEffectAmountValue(
          toNumber(targetActor.system?.resources?.hp?.max, 1),
          effect.amount
        );
        if (damageValue <= 0) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
        }
        const hpChange = await this._safeApplyDamage(targetActor, damageValue);
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        return {
          applied: true,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
            before: hpChange.hpBefore,
            after: hpChange.hpAfter
          })
        };
      }
      case "heal": {
        const resolvedHeal = this._resolveSecondaryHealConfiguration(effect, sourceMove);
        const healValue = this._resolveHealEffectAmountValue(resolvedHeal, targetActor, context);
        if (healValue <= 0) {
          return {
            applied: false,
            detail: resolvedHeal.adjustmentDetail || game.i18n.localize("POKROLE.Common.None")
          };
        }
        const hpChange = await this._safeApplyHeal(targetActor, healValue, {
          healingCategory: resolvedHeal.healingCategory
        });
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        if (toNumber(hpChange?.hpAfter, 0) === toNumber(hpChange?.hpBefore, 0)) {
          return {
            applied: false,
            detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
          };
        }
        return {
          applied: true,
          detail: [
            game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
              before: hpChange.hpBefore,
              after: hpChange.hpAfter
            }),
            `${resolvedHeal.adjustmentDetail ?? ""}`.trim()
          ].filter(Boolean).join(" | ")
        };
      }
      case "will":
        return this._applyWillEffectToActor(effect, targetActor);
      case "custom":
      default:
        return {
          applied: true,
          detail: effect.notes || game.i18n.localize("POKROLE.Chat.SecondaryEffectApplied")
        };
    }
  }

  _resolveEffectAmountValue(maxValue, amount) {
    const numericAmount = toNumber(amount, 0);
    if (numericAmount === 0) return 0;
    if (numericAmount > 0) return Math.floor(numericAmount);
    return Math.max(Math.floor((Math.max(maxValue, 1) * Math.abs(numericAmount)) / 100), 1);
  }

  _resolveHealEffectAmountValue(effect, targetActor, context = {}) {
    const healMode = this._normalizeSecondaryHealMode(
      effect?.healMode,
      effect?.effectType,
      effect?.amount
    );
    const numericAmount = Math.abs(Math.floor(toNumber(effect?.amount, 0)));
    if (numericAmount <= 0) return 0;

    if (healMode === "damage-percent") {
      const totalDamageDealt = Math.max(Math.floor(toNumber(context?.totalDamageDealt, 0)), 0);
      if (totalDamageDealt <= 0) return 0;
      return Math.max(Math.floor((totalDamageDealt * numericAmount) / 100), 1);
    }

    if (healMode === "max-hp-percent") {
      const maxHp = Math.max(toNumber(targetActor?.system?.resources?.hp?.max, 1), 1);
      return Math.max(Math.floor((maxHp * numericAmount) / 100), 1);
    }

    return Math.max(numericAmount, 0);
  }

  async _resolveFrozenBreakoutMove(move, options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const normalizedAction = clamp(toNumber(options.actionNumber, 1), 1, 5);
    const frozenShellBefore = await this._initializeFrozenShell();
    const shellDefense =
      move.system.category === "special"
        ? frozenShellBefore.specialDefense
        : frozenShellBefore.defense;
    const typeInteraction = this._evaluateTypeInteractionAgainstTypes(move.system.type || "normal", [
      "ice"
    ]);
    const superEffective = !typeInteraction.immune && typeInteraction.weaknessBonus > 0;
    const isDamagingMove = this._moveUsesPrimaryDamage(move);
    const damageBaseSetup = this._resolveMoveDamageBase(move, this, normalizedAction);
    const damageAttributeValue = damageBaseSetup.value;
    const movePower = this._resolveMovePower(move, this, normalizedAction);
    const stabDice = this.hasType(move.system.type) ? 1 : 0;
    const poolBeforeDefense = Math.max(movePower + damageAttributeValue + stabDice, 0);
    const damagePool = Math.max(poolBeforeDefense - shellDefense, 0);

    let damageSuccesses = 0;
    let shellDamage = 0;
    let shellDestroyed = superEffective;

    if (!shellDestroyed && isDamagingMove && !typeInteraction.immune) {
      if (damagePool > 0) {
        const damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate({ async: true });
        damageSuccesses = Math.max(Math.floor(toNumber(damageRoll.total, 0)), 0);
        await damageRoll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: game.i18n.format("POKROLE.Chat.FrozenShellDamageRoll", {
            actor: this.name,
            move: move.name
          })
        });
      }
      shellDamage = Math.max(damageSuccesses, 1);
      shellDestroyed = shellDamage >= frozenShellBefore.hp;
    }

    const shellHpAfter = shellDestroyed
      ? 0
      : Math.max(frozenShellBefore.hp - Math.max(shellDamage, 0), 0);

    if (shellDestroyed) {
      await this.toggleQuickCondition("frozen", { active: false });
    } else {
      await this._setFrozenShellState({
        ...frozenShellBefore,
        hp: shellHpAfter
      });
    }

    const resultLabel = shellDestroyed
      ? game.i18n.format("POKROLE.Chat.FrozenShellBroken", {
          actor: this.name,
          move: move.name
        })
      : shellDamage > 0
        ? game.i18n.format("POKROLE.Chat.FrozenShellDamaged", {
            actor: this.name,
            move: move.name,
            damage: shellDamage,
            hp: shellHpAfter
          })
        : game.i18n.format("POKROLE.Chat.FrozenShellHeld", {
            actor: this.name,
            move: move.name,
            hp: shellHpAfter
          });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card arcade-red">
          <header class="chat-card-header">
            <h3>${game.i18n.localize("POKROLE.Conditions.Frozen")}</h3>
          </header>
          <section class="chat-card-section">
            <p><strong>${this.name}</strong></p>
            <p>${resultLabel}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.TypeEffect.Label")}:</strong> ${game.i18n.localize(typeInteraction.label)}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.PoolBeforeDefense")}:</strong> ${poolBeforeDefense}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.TargetDefense")}:</strong> ${shellDefense}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.FinalPool")}:</strong> ${damagePool}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.FinalDamage")}:</strong> ${shellDamage}</p>
          </section>
        </div>
      `
    });

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    await this._recordLastUsedMove(move);

    return {
      frozenBreakout: true,
      shellDestroyed,
      shellDamage,
      shellHpBefore: frozenShellBefore.hp,
      shellHpAfter,
      move
    };
  }

  async _applyDisabledMoveEffectToActor(targetActor, sourceMove = null) {
    const lastUsedMove = targetActor?._getLastUsedMoveRecord?.() ?? {};
    const disabledMoveId = `${lastUsedMove?.moveId ?? ""}`.trim();
    const moveDocument =
      disabledMoveId && targetActor?.items ? targetActor.items.get(disabledMoveId) ?? null : null;
    if (!targetActor || !moveDocument || moveDocument.type !== "move") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.DisabledMoveNoLastMove")
      };
    }

    const existingRestriction = this._getDisabledMoveRestriction(targetActor);
    if (existingRestriction?.moveId && existingRestriction.moveId === moveDocument.id) {
      await this._setConditionFlagState(targetActor, "disabled", true);
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    await this._removeTrackedConditionEffects(targetActor, "disabled", { revert: false });

    const inCombat = Boolean(game.combat);
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "move-disabled",
      conditionKey: "disabled",
      durationMode: inCombat ? "rounds" : "manual",
      durationRounds: 5,
      specialDuration: [],
      sourceMove
    });
    automationFlags.disabledMoveId = moveDocument.id;
    automationFlags.disabledMoveName = moveDocument.name ?? "";
    automationFlags.sceneScoped = !inCombat;
    automationFlags.sceneId = !inCombat ? canvas?.scene?.id ?? null : null;

    const durationData = this._buildManagedEffectDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds
    );
    const durationLabel = inCombat
      ? this._localizeTemporaryDuration("rounds", 5, [])
      : game.i18n.localize("POKROLE.Chat.DisabledMoveSceneDuration");

    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: game.i18n.format("POKROLE.Chat.DisabledMoveLabel", {
          move: moveDocument.name
        }),
        img: this._getConditionIconPath("disabled") || sourceMove?.img || "icons/svg/cancel.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: ["pokrole-condition-disabled"],
        changes: [],
        duration: durationData,
        flags: {
          [POKROLE.ID]: {
            automation: automationFlags
          }
        }
      }
    ]);

    await this._setConditionFlagState(targetActor, "disabled", true);
    return {
      applied: true,
      detail: `${moveDocument.name} (${durationLabel})`
    };
  }

  async _applyConditionEffectToActor(effect, targetActor, sourceMove = null, options = {}) {
    const conditionVariant = this._normalizeConditionVariantKey(effect.condition);
    const conditionKey = this._normalizeConditionKey(conditionVariant);
    const burnStage =
      conditionKey === "burn" ? this._resolveBurnStageFromCondition(conditionVariant) : 1;
    if (conditionKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }
    if (conditionKey === "infatuated") {
      const genderRule = this._validateInfatuationGenderRule(
        options?.sourceActor ?? this,
        targetActor,
        { allowManualOverride: options?.allowManualOverride === true }
      );
      if (!genderRule.valid) {
        return {
          applied: false,
          detail: genderRule.detail || game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
        };
      }
    }
    if (this._isConditionImmune(targetActor, conditionKey)) {
      return {
        applied: false,
        detail: this._getConditionBlockedDetail(targetActor, conditionKey)
      };
    }
    if (conditionKey === "disabled") {
      return this._applyDisabledMoveEffectToActor(targetActor, sourceMove);
    }

    const statusId = `pokrole-condition-${conditionKey}`;
    const existingConditionEffect = (targetActor?.effects?.contents ?? []).find((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
        `${entry ?? ""}`.trim().toLowerCase()
      );
      if (statusEntries.includes(statusId)) return true;
      return this._extractConditionKeyFromEffect(effectDocument) === conditionKey;
    });
    if (existingConditionEffect) {
      await this._setConditionFlagState(targetActor, conditionKey, true);
      if (conditionKey === "burn") {
        if (typeof targetActor._applyBurnStage === "function") {
          const resolvedStage = await targetActor._applyBurnStage(burnStage);
          await this._synchronizeManagedBurnConditionEffect(targetActor, resolvedStage);
          return {
            applied: true,
            detail: this._localizeBurnStageName(resolvedStage)
          };
        }
        return {
          applied: false,
          detail: this._localizeBurnStageName(burnStage)
        };
      }
      if (conditionKey === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
        await targetActor._initializeFrozenShell();
      }
      if (conditionKey === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
        await targetActor._clearConfusionSuppression();
      }
      if (conditionKey === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
        await targetActor._clearInfatuationSuppression();
      }
      if (conditionKey === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
        await targetActor._clearParalysisTurnCheck();
      }
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    let normalizedDurationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "condition");
    let normalizedDurationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    let normalizedSpecialDuration = this._normalizeSpecialDurationList(effect.specialDuration);
    if (["confused", "infatuated"].includes(conditionKey)) {
      normalizedDurationMode = "rounds";
      normalizedDurationRounds = 5;
      normalizedSpecialDuration = [];
    }
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "condition",
      conditionKey,
      durationMode: normalizedDurationMode,
      durationRounds: normalizedDurationRounds,
      specialDuration: normalizedSpecialDuration,
      sourceMove
    });
    if (conditionKey === "burn") {
      automationFlags.burnStage = burnStage;
    }
    const effectLabel =
      conditionKey === "burn"
        ? this._localizeBurnStageName(burnStage)
        : this._formatSecondaryEffectLabel(effect) || this._localizeConditionName(conditionKey);
    const conditionPath = CONDITION_FIELD_BY_KEY[conditionKey]
      ? `system.conditions.${CONDITION_FIELD_BY_KEY[conditionKey]}`
      : null;
    const effectChanges = [];
    if (conditionPath) {
      effectChanges.push({
        key: conditionPath,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: "true",
        priority: 50
      });
    }
    if (conditionKey === "paralyzed") {
      effectChanges.push({
        key: "system.attributes.dexterity",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-2",
        priority: 60
      });
    }

    const durationData = this._buildManagedEffectDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds
    );
    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: effectLabel,
        img: this._getConditionIconPath(conditionKey) || sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: [statusId],
        changes: effectChanges,
        duration: durationData,
        flags: {
          [POKROLE.ID]: {
            automation: automationFlags
          }
        }
      }
    ]);

    await this._setConditionFlagState(targetActor, conditionKey, true);
    if (conditionKey === "burn" && typeof targetActor._applyBurnStage === "function") {
      await targetActor._applyBurnStage(burnStage);
    }
    if (conditionKey === "sleep" && typeof targetActor._initializeSleepResistanceTrack === "function") {
      await targetActor._initializeSleepResistanceTrack();
    }
    if (conditionKey === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
      await targetActor._initializeFrozenShell(true);
    }
    if (conditionKey === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
      await targetActor._clearConfusionSuppression();
    }
    if (conditionKey === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
      await targetActor._clearInfatuationSuppression();
    }
    if (conditionKey === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
      await targetActor._clearParalysisTurnCheck();
    }
    // Destiny Knot: if infatuation was applied and target has Destiny Knot, mirror infatuation back to attacker
    if (conditionKey === "infatuated" && targetActor?._getHeldItemData?.()?.destinyKnot) {
      const sourceActor = options?.sourceActor ?? this;
      if (sourceActor && sourceActor !== targetActor && !sourceActor._isConditionActive?.("infatuated")) {
        await sourceActor.toggleQuickCondition("infatuated", { active: true });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> Destiny Knot infatuated <strong>${sourceActor.name}</strong> in return!`
        });
      }
    }
    const conditionLabel =
      conditionKey === "burn"
        ? this._localizeBurnStageName(burnStage)
        : this._localizeConditionName(conditionKey);
    return {
      applied: true,
      detail: `${conditionLabel} (${this._localizeTemporaryDuration(
        automationFlags.durationMode,
        automationFlags.durationRounds,
        automationFlags.specialDuration
      )})`
    };
  }

  _getConditionIconPath(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    return CONDITION_ICON_BY_KEY[normalizedCondition] ?? null;
  }

  _normalizeActiveEffectStackMode(value) {
    const normalized = `${value ?? "name-origin"}`.trim().toLowerCase();
    return ACTIVE_EFFECT_STACK_MODE_KEYS.includes(normalized) ? normalized : "name-origin";
  }

  _findStackConflictActiveEffect(targetActor, effectData) {
    if (!targetActor || !effectData) return null;
    const effectName = `${effectData.name ?? ""}`.trim().toLowerCase();
    const effectOrigin = `${effectData.origin ?? ""}`.trim().toLowerCase();
    const automationFlags = effectData.flags?.[POKROLE.ID]?.automation ?? {};
    const stackMode = this._normalizeActiveEffectStackMode(automationFlags?.stackMode);
    if (stackMode === "multiple") return null;

    return (targetActor.effects?.contents ?? []).find((existingEffect) => {
      const existingName = `${existingEffect?.name ?? ""}`.trim().toLowerCase();
      const existingOrigin = `${existingEffect?.origin ?? ""}`.trim().toLowerCase();
      if (stackMode === "name") {
        return Boolean(effectName) && existingName === effectName;
      }
      if (stackMode === "origin") {
        return Boolean(effectOrigin) && existingOrigin === effectOrigin;
      }
      return Boolean(effectName) && existingName === effectName && effectOrigin === existingOrigin;
    }) ?? null;
  }

  async _applySecondaryActiveEffectToActor(effect, targetActor, sourceMove = null) {
    const linkedEffectId = `${effect?.linkedEffectId ?? ""}`.trim();
    if (!linkedEffectId || sourceMove?.type !== "move") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }

    const templateEffect = sourceMove.effects?.get(linkedEffectId) ?? null;
    if (!templateEffect) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }

    const templateData = templateEffect.toObject();
    const conflictEffect = this._findStackConflictActiveEffect(targetActor, templateData);
    if (conflictEffect) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    const [createdEffect] = await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `${templateData?.name ?? ""}`.trim() || this._formatSecondaryEffectLabel(effect),
        img: templateData?.img || sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? templateData?.origin ?? null,
        transfer: false,
        disabled: false,
        statuses: Array.isArray(templateData?.statuses) ? templateData.statuses : [],
        tint: templateData?.tint ?? null,
        description: templateData?.description ?? "",
        duration: templateData?.duration ?? {},
        changes: Array.isArray(templateData?.changes) ? templateData.changes : [],
        flags: templateData?.flags ?? {}
      }
    ]);

    if (createdEffect && typeof targetActor.synchronizeConditionFlags === "function") {
      await targetActor.synchronizeConditionFlags();
    }

    return {
      applied: true,
      detail: `${createdEffect?.name ?? this._formatSecondaryEffectLabel(effect)}`
    };
  }

  async _applyStatEffectToActor(effect, targetActor, sourceMove = null) {
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    // Clear Amulet: immune to stat reduction from enemies
    if (amount < 0 && targetActor !== this && targetActor?._getHeldItemData?.()?.immuneToStatReduction) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Clear Amulet prevented a stat reduction!`
      });
      return { applied: false, detail: `${targetActor.name}'s Clear Amulet blocked the stat reduction.` };
    }

    const statKey = this._normalizeSecondaryStatKey(effect.stat);
    if (statKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    if (["accuracy", "damage", "evasion", "clash"].includes(statKey)) {
      return this._applyCombatStatEffectToActor(
        { ...effect, effectType: "stat", stat: statKey, amount },
        targetActor,
        sourceMove
      );
    }

    let resolvedKey = statKey;
    if (statKey === "defense") resolvedKey = "vitality";
    if (statKey === "specialDefense") resolvedKey = "insight";

    let statResult = null;
    if (Object.prototype.hasOwnProperty.call(targetActor.system.attributes ?? {}, resolvedKey)) {
      const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
        resolvedKey
      );
      const configuredMax = this._resolveAttributeMaximum(targetActor, resolvedKey);
      const maxValue = isCoreAttribute ? Math.min(configuredMax, 10) : configuredMax;
      const minValue = isCoreAttribute ? 1 : 0;
      statResult = await this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.attributes.${resolvedKey}`,
        amount,
        min: minValue,
        max: maxValue,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds,
        specialDuration: effect.specialDuration
      });
    } else if (Object.prototype.hasOwnProperty.call(targetActor.system.skills ?? {}, resolvedKey)) {
      statResult = await this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.skills.${resolvedKey}`,
        amount,
        min: 0,
        max: 5,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds,
        specialDuration: effect.specialDuration
      });
    }

    // White Herb: restore all negative stat modifiers after a stat reduction is applied
    if (statResult?.applied && amount < 0 && targetActor?._getHeldItemData?.()?.whiteHerb) {
      const negativeEffects = this._getManagedModifierEffectsForPath(targetActor, `system.attributes.${resolvedKey}`)
        .concat(this._getManagedModifierEffectsForPath(targetActor, `system.skills.${resolvedKey}`))
        .filter((effectDocument) => {
          const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
          return Math.floor(toNumber(flags?.amountApplied, 0)) < 0;
        });
      if (negativeEffects.length > 0) {
        const effectIds = negativeEffects.map((e) => e.id).filter(Boolean);
        if (effectIds.length > 0) {
          await targetActor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
        }
        await targetActor.update({ "system.battleItem": "" });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> White Herb restored its lowered stats!`
        });
      }
      return statResult;
    }

    if (statResult) return statResult;

    return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
  }

  _resolveAttributeMaximum(targetActor, attributeKey) {
    const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
      attributeKey
    );
    if (targetActor.type === "pokemon" && isCoreAttribute) {
      return clamp(
        toNumber(targetActor.system.sheetSettings?.trackMax?.attributes?.[attributeKey], 12),
        1,
        12
      );
    }
    return 5;
  }

  getConditionFlags() {
    return this._getConditionFlagEntries(this);
  }

  getTemporaryEffects() {
    return this._getTemporaryEffectEntries(this);
  }

  getConfiguredEffects() {
    return this._getConfiguredEffectEntries(this);
  }

  async synchronizeConditionFlags() {
    await this._synchronizeConditionFlagsFromTemporaryEffects(this);
  }

  async synchronizeFaintedFromHp() {
    if (this.type !== "pokemon") return false;
    if (this.__pokrolePendingDeadSync) return false;
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const shouldBeFainted = hpValue <= 0 && !this._isConditionActive("dead");
    const isFainted = this._isConditionActive("fainted");
    if (shouldBeFainted === isFainted) return false;
    await this.toggleQuickCondition("fainted", { active: shouldBeFainted });
    return true;
  }

  async clearSceneScopedMoveDisableEffects(currentSceneId = null) {
    const normalizedSceneId = `${currentSceneId ?? canvas?.scene?.id ?? ""}`.trim();
    if (!normalizedSceneId) return 0;
    const effectIds = (this.effects?.contents ?? [])
      .filter((effectDocument) => {
        const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
        if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "move-disabled") return false;
        if (!automationFlags?.sceneScoped) return false;
        const effectSceneId = `${automationFlags?.sceneId ?? ""}`.trim();
        return Boolean(effectSceneId) && effectSceneId !== normalizedSceneId;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (effectIds.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", effectIds);
    }
    return effectIds.length;
  }

  async _clearConditionAuxiliaryState(targetActor, conditionKey) {
    const actor = targetActor ?? this;
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!actor || normalizedCondition === "none") return;

    if (normalizedCondition === "sleep") {
      await actor.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
    }
    if (normalizedCondition === "burn" && typeof actor._clearBurnTrack === "function") {
      await actor._clearBurnTrack();
    }
    if (normalizedCondition === "frozen" && typeof actor._clearFrozenShellState === "function") {
      await actor._clearFrozenShellState();
    }
    if (normalizedCondition === "paralyzed" && typeof actor._clearParalysisTurnCheck === "function") {
      await actor._clearParalysisTurnCheck();
    }
    if (normalizedCondition === "confused" && typeof actor._clearConfusionSuppression === "function") {
      await actor._clearConfusionSuppression();
    }
    if (normalizedCondition === "infatuated" && typeof actor._clearInfatuationSuppression === "function") {
      await actor._clearInfatuationSuppression();
    }
  }

  _hasConditionAuxiliaryState(targetActor, conditionKey) {
    const actor = targetActor ?? this;
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!actor || normalizedCondition === "none") return false;

    if (normalizedCondition === "sleep") {
      return Boolean(actor.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY));
    }
    if (normalizedCondition === "burn") {
      return Boolean(actor.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY));
    }
    if (normalizedCondition === "frozen") {
      return Boolean(actor.getFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY));
    }
    if (normalizedCondition === "paralyzed") {
      return Boolean(actor.getFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY));
    }
    if (normalizedCondition === "confused") {
      return Boolean(actor.getFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY));
    }
    if (normalizedCondition === "infatuated") {
      return Boolean(actor.getFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY));
    }
    return false;
  }

  _isConditionalAutomationEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    const hasPassiveToggle = automationFlags?.passive === true;
    const passiveTriggerKey = `${automationFlags?.passiveTrigger ?? ""}`.trim().toLowerCase();
    return hasPassiveToggle || passiveTriggerKey.length > 0;
  }

  _isConditionalAutomationEffectActive(effectDocument, targetActor = this) {
    if (!this._isConditionalAutomationEffect(effectDocument)) return true;
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${automationFlags?.passiveTrigger ?? ""}`)
      ? `${automationFlags.passiveTrigger}`
      : "always";
    const passiveCondition = this._normalizeConditionKey(automationFlags?.passiveCondition);
    const passiveThreshold = clamp(Math.floor(toNumber(automationFlags?.passiveThreshold, 50)), 1, 99);
    return this._checkPassiveTrigger(
      {
        passive: true,
        passiveTrigger,
        passiveCondition,
        passiveThreshold
      },
      targetActor ?? this
    );
  }

  async synchronizeConditionalActiveEffects(options = {}) {
    const targetActor = options.targetActor ?? this;
    const updates = [];

    for (const effectDocument of this.effects?.contents ?? []) {
      if (!this._isConditionalAutomationEffect(effectDocument)) continue;

      const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const autoDisabledByCondition = Boolean(automationFlags?.autoDisabledByCondition);
      const shouldBeActive = this._isConditionalAutomationEffectActive(effectDocument, targetActor);

      if (!shouldBeActive && !effectDocument.disabled) {
        const updatePayload = { _id: effectDocument.id, disabled: true };
        updatePayload[`flags.${POKROLE.ID}.automation.autoDisabledByCondition`] = true;
        updates.push(updatePayload);
        continue;
      }

      if (shouldBeActive && effectDocument.disabled && autoDisabledByCondition) {
        const updatePayload = { _id: effectDocument.id, disabled: false };
        updatePayload[`flags.${POKROLE.ID}.automation.autoDisabledByCondition`] = false;
        updates.push(updatePayload);
      }
    }

    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("ActiveEffect", updates);
    }
    return updates.length;
  }

  async setConfiguredEffects(effects = []) {
    await this._setConfiguredEffectEntries(this, effects);
    return this.getConfiguredEffects();
  }

  async addConfiguredEffect(initialEffect = {}) {
    const currentEffects = this.getConfiguredEffects();
    currentEffects.push(this._normalizeConfiguredEffect(initialEffect));
    await this._setConfiguredEffectEntries(this, currentEffects);
    return currentEffects[currentEffects.length - 1] ?? null;
  }

  async updateConfiguredEffect(effectId, updates = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return null;

    const currentEffects = this.getConfiguredEffects();
    const effectIndex = currentEffects.findIndex((entry) => entry.id === normalizedEffectId);
    if (effectIndex < 0) return null;

    const nextEffect = this._normalizeConfiguredEffect({
      ...currentEffects[effectIndex],
      ...updates,
      id: normalizedEffectId
    });
    currentEffects.splice(effectIndex, 1, nextEffect);
    await this._setConfiguredEffectEntries(this, currentEffects);
    return nextEffect;
  }

  async deleteConfiguredEffect(effectId) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return false;

    const currentEffects = this.getConfiguredEffects();
    const nextEffects = currentEffects.filter((entry) => entry.id !== normalizedEffectId);
    if (nextEffects.length === currentEffects.length) return false;
    await this._setConfiguredEffectEntries(this, nextEffects);
    return true;
  }

  async applyConfiguredEffect(effectId, options = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const configuredEffect = this.getConfiguredEffects().find(
      (entry) => entry.id === normalizedEffectId
    );
    if (!configuredEffect) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    return this._applyConfiguredEffectData(configuredEffect, options);
  }

  async toggleQuickCondition(conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const currentFlags = this._getConditionFlagEntries(this);
    const currentState = Boolean(currentFlags[normalizedCondition]);
    const nextState = options.active === undefined ? !currentState : Boolean(options.active);

    if (nextState) {
      if (normalizedCondition === "fainted" && this._isConditionActive("dead")) {
        return {
          applied: false,
          detail: this._localizeConditionName("dead")
        };
      }
      if (normalizedCondition === "dead" && this._isConditionActive("fainted")) {
        await this.toggleQuickCondition("fainted", { active: false });
      }
      if (normalizedCondition === "disabled") {
        return this._applyDisabledMoveEffectToActor(this, null);
      }
      let burnStage = 1;
      if (normalizedCondition === "burn") {
        const hasExplicitBurnStage = Object.prototype.hasOwnProperty.call(options, "burnStage");
        if (hasExplicitBurnStage) {
          burnStage = this._normalizeBurnStage(options.burnStage, 1);
        } else {
          const selectedStage = await this._promptBurnStageSelection();
          if (!selectedStage) {
            return { applied: false, detail: game.i18n.localize("POKROLE.Common.Cancel") };
          }
          burnStage = this._normalizeBurnStage(selectedStage, 1);
        }
      }
      if (this._isConditionImmune(this, normalizedCondition)) {
        await this._purgeImmuneConditionState(this, normalizedCondition);
        return {
          applied: false,
          detail: this._getConditionBlockedDetail(this, normalizedCondition)
        };
      }
      await this._setConditionFlagState(this, normalizedCondition, true);
      if (normalizedCondition === "sleep") {
        await this._initializeSleepResistanceTrack();
      }
      return this._ensureConditionEffectFromFlag(this, normalizedCondition, { burnStage });
    }

    await this._setConditionFlagState(this, normalizedCondition, false);
    await this._clearConditionAuxiliaryState(this, normalizedCondition);
    await this._removeTrackedConditionEffects(this, normalizedCondition, { revert: false });
    return {
      applied: true,
      detail: game.i18n.format("POKROLE.Chat.ConditionCleared", {
        condition: this._localizeConditionName(normalizedCondition)
      })
    };
  }

  async removeTemporaryEffect(effectId, options = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return false;

    const embeddedEffect = this.effects?.get(normalizedEffectId);
    if (embeddedEffect && this._isManagedAutomationEffect(embeddedEffect)) {
      await embeddedEffect.delete();
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      return true;
    }

    const shouldRevert = options.revert !== false;
    const currentEntries = this._getTemporaryEffectEntries(this);
    const effectIndex = currentEntries.findIndex(
      (entry) => `${entry?.id ?? ""}`.trim() === normalizedEffectId
    );
    if (effectIndex < 0) return false;

    const [entryToRemove] = currentEntries.splice(effectIndex, 1);
    if (shouldRevert) {
      await this._revertTemporaryEffectEntry(entryToRemove);
    }
    await this._setTemporaryEffectEntries(this, currentEntries);
    await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    return true;
  }

  _getConditionFlagEntries(targetActor) {
    const rawFlags = targetActor?.getFlag(POKROLE.ID, CONDITION_FLAGS_FLAG);
    const normalizedFlags = {};

    for (const conditionKey of CONDITION_KEYS) {
      let isActive = false;

      if (rawFlags && typeof rawFlags === "object" && Object.prototype.hasOwnProperty.call(rawFlags, conditionKey)) {
        isActive = Boolean(rawFlags[conditionKey]);
      } else {
        const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
        if (systemField) {
          isActive = Boolean(targetActor?.system?.conditions?.[systemField]);
        } else {
          isActive = Boolean(targetActor?.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`));
        }
      }

      normalizedFlags[conditionKey] = isActive;
    }

    return normalizedFlags;
  }

  async _setConditionFlagState(targetActor, conditionKey, isActive) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return;

    const nextFlags = this._getConditionFlagEntries(targetActor);
    nextFlags[normalizedCondition] = Boolean(isActive);
    await targetActor.setFlag(POKROLE.ID, CONDITION_FLAGS_FLAG, nextFlags);

    const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
    if (systemField) {
      await targetActor.update({ [`system.conditions.${systemField}`]: Boolean(isActive) });
    } else {
      await targetActor.setFlag(
        POKROLE.ID,
        `automation.conditions.${normalizedCondition}`,
        Boolean(isActive)
      );
    }
  }

  async _disableConditionEffectForImmunity(targetActor, effectDocument, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || !effectDocument || normalizedCondition === "none") return false;

    const statusId = `pokrole-condition-${normalizedCondition}`;
    const currentStatuses = [...(effectDocument.statuses ?? [])]
      .map((entry) => `${entry ?? ""}`.trim())
      .filter(Boolean);
    const nextStatuses = currentStatuses.filter(
      (entry) => entry.toLowerCase() !== statusId
    );
    const updateData = {};
    if (!effectDocument.disabled) updateData.disabled = true;
    if (nextStatuses.length !== currentStatuses.length) {
      updateData.statuses = nextStatuses;
    }
    if (Object.keys(updateData).length === 0) return false;
    await effectDocument.update(updateData);
    return true;
  }

  async _purgeImmuneConditionTemporaryEntries(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return false;

    const currentEntries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = currentEntries.filter((entry) => {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      return !changes.some(
        (change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition
      );
    });
    if (remainingEntries.length === currentEntries.length) return false;
    await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    return true;
  }

  async _purgeImmuneConditionState(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return false;

    let changed = false;
    const effects = [...(targetActor.effects?.contents ?? [])];
    for (const effectDocument of effects) {
      if (this._extractConditionKeyFromEffect(effectDocument) !== normalizedCondition) continue;
      const wasChanged = await this._disableConditionEffectForImmunity(
        targetActor,
        effectDocument,
        normalizedCondition
      );
      changed ||= wasChanged;
    }

    const removedTemporaryEntries = await this._purgeImmuneConditionTemporaryEntries(
      targetActor,
      normalizedCondition
    );
    changed ||= removedTemporaryEntries;

    const currentFlags = this._getConditionFlagEntries(targetActor);
    if (currentFlags[normalizedCondition]) {
      await this._setConditionFlagState(targetActor, normalizedCondition, false);
      changed = true;
    } else {
      const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
      if (systemField && targetActor.system?.conditions?.[systemField]) {
        await targetActor.update({ [`system.conditions.${systemField}`]: false });
        changed = true;
      }
      if (!systemField) {
        const currentState = Boolean(
          targetActor.getFlag(POKROLE.ID, `automation.conditions.${normalizedCondition}`)
        );
        if (currentState) {
          await targetActor.setFlag(
            POKROLE.ID,
            `automation.conditions.${normalizedCondition}`,
            false
          );
          changed = true;
        }
      }
    }

    await this._clearConditionAuxiliaryState(targetActor, normalizedCondition);

    return changed;
  }

  _hasTrackedConditionEffect(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return false;
    const statusId = `pokrole-condition-${normalizedCondition}`;
    const hasManagedActiveEffect = (targetActor?.effects?.contents ?? []).some((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
        `${entry ?? ""}`.trim().toLowerCase()
      );
      if (statusEntries.includes(statusId)) return true;
      return this._extractConditionKeyFromEffect(effectDocument) === normalizedCondition;
    });
    if (hasManagedActiveEffect) return true;
    return this._getTemporaryEffectEntries(targetActor).some((entry) => {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      return changes.some((change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition);
    });
  }

  _buildConditionFlagEffectConfig(conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    const burnStage =
      normalizedCondition === "burn" ? this._normalizeBurnStage(options?.burnStage, 1) : 1;
    const conditionNotes = {
      sleep: "Sleep: cannot act until awakened according to the CoreBook.",
      burn: "Burn: apply burn penalties/effects according to the CoreBook.",
      frozen: "Frozen: follow thaw and action restrictions from the CoreBook.",
      paralyzed: "Paralyzed: apply action/speed penalties according to the CoreBook.",
      poisoned: "Poisoned: apply poison progression according to the CoreBook.",
      fainted: "Fainted: actor is unable to act until recovered.",
      dead: "Dead: actor is dead and cannot act until manually restored by the table.",
      confused: "Confused: apply confusion behavior from the CoreBook.",
      flinch: "Flinch: actor may lose action per CoreBook timing.",
      disabled: "Disabled: selected move/action cannot be used as per CoreBook.",
      infatuated: "Infatuated: apply infatuation checks per CoreBook.",
      "badly-poisoned": "Badly Poisoned: escalating poison effects per CoreBook."
    };

    return {
      label:
        normalizedCondition === "burn"
          ? this._localizeBurnStageName(burnStage)
          : this._localizeConditionName(normalizedCondition),
      trigger: "always",
      chance: 100,
      target: "self",
      effectType: "condition",
      durationMode: ["confused", "infatuated"].includes(normalizedCondition) ? "rounds" : "manual",
      durationRounds: ["confused", "infatuated"].includes(normalizedCondition) ? 5 : 1,
      specialDuration: [],
      condition:
        normalizedCondition === "burn"
          ? this._getBurnConditionVariant(burnStage)
          : normalizedCondition,
      stat: "none",
      amount: 0,
      notes: conditionNotes[normalizedCondition] ?? ""
    };
  }

  async _ensureConditionEffectFromFlag(targetActor, conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }
    const burnStage =
      normalizedCondition === "burn" ? this._normalizeBurnStage(options?.burnStage, 1) : 1;

    if (normalizedCondition === "disabled") {
      return this._applyDisabledMoveEffectToActor(targetActor, null);
    }
    if (normalizedCondition === "dead" && targetActor?._isConditionActive?.("fainted")) {
      await targetActor.toggleQuickCondition("fainted", { active: false });
    }

    if (this._isConditionImmune(targetActor, normalizedCondition)) {
      await this._purgeImmuneConditionState(targetActor, normalizedCondition);
      return {
        applied: false,
        detail: this._getConditionBlockedDetail(targetActor, normalizedCondition)
      };
    }

    const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
    if (systemField && !targetActor.system?.conditions?.[systemField]) {
      await targetActor.update({ [`system.conditions.${systemField}`]: true });
    }

    if (!systemField) {
      await targetActor.setFlag(POKROLE.ID, `automation.conditions.${normalizedCondition}`, true);
    }

    if (!this._hasTrackedConditionEffect(targetActor, normalizedCondition)) {
      const effectConfig = this._buildConditionFlagEffectConfig(normalizedCondition, { burnStage });
      return this._applyConditionEffectToActor(effectConfig, targetActor, null);
    }

    if (normalizedCondition === "burn") {
      if (typeof targetActor._applyBurnStage === "function") {
        const resolvedStage = await targetActor._applyBurnStage(burnStage);
        await this._synchronizeManagedBurnConditionEffect(targetActor, resolvedStage);
        return {
          applied: true,
          detail: this._localizeBurnStageName(resolvedStage)
        };
      }
      return {
        applied: true,
        detail: this._localizeBurnStageName(burnStage)
      };
    }

    if (normalizedCondition === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
      await targetActor._initializeFrozenShell();
    }
    if (normalizedCondition === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
      await targetActor._clearConfusionSuppression();
    }
    if (normalizedCondition === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
      await targetActor._clearInfatuationSuppression();
    }
    if (normalizedCondition === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
      await targetActor._clearParalysisTurnCheck();
    }

    return {
      applied: true,
      detail: this._localizeConditionName(normalizedCondition)
    };
  }

  async _removeTrackedConditionEffects(targetActor, conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return 0;

    const shouldRevert = options.revert !== false;
    const statusId = `pokrole-condition-${normalizedCondition}`;
    const effectIdsToDelete = (targetActor?.effects?.contents ?? [])
      .filter((effectDocument) => {
        const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
          `${entry ?? ""}`.trim().toLowerCase()
        );
        if (statusEntries.includes(statusId)) return true;
        return this._extractConditionKeyFromEffect(effectDocument) === normalizedCondition;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (effectIdsToDelete.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", effectIdsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = [];
    let removedCount = 0;

    for (const entry of currentEntries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      const isConditionMatch = changes.some(
        (change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition
      );
      if (!isConditionMatch) {
        remainingEntries.push(entry);
        continue;
      }

      if (shouldRevert) {
        await this._revertTemporaryEffectEntry(entry);
      }
      removedCount += 1;
    }

    if (removedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    }
    await this._clearConditionAuxiliaryState(targetActor, normalizedCondition);

    return removedCount + effectIdsToDelete.length;
  }

  async _synchronizeConditionFlagsFromTemporaryEffects(targetActor) {
    const activeConditionKeys = new Set();
    let activeBurnStage = 1;
    for (const effectDocument of [...(targetActor?.effects?.contents ?? [])]) {
      const conditionFromEffect = this._extractConditionKeyFromEffect(effectDocument);
      if (conditionFromEffect === "none") continue;
      if (this._isConditionImmune(targetActor, conditionFromEffect)) {
        await this._disableConditionEffectForImmunity(
          targetActor,
          effectDocument,
          conditionFromEffect
        );
        continue;
      }
      if (effectDocument?.disabled) continue;
      if (conditionFromEffect === "burn") {
        activeBurnStage = Math.max(activeBurnStage, this._extractBurnStageFromEffect(effectDocument));
      }
      activeConditionKeys.add(conditionFromEffect);
    }
    const entries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = [];
    let entriesChanged = false;
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      let keepEntry = true;
      for (const change of changes) {
        const normalizedCondition = this._normalizeConditionKey(change?.conditionKey);
        if (normalizedCondition !== "none") {
          if (this._isConditionImmune(targetActor, normalizedCondition)) {
            keepEntry = false;
            entriesChanged = true;
            continue;
          }
          if (normalizedCondition === "burn") {
            activeBurnStage = Math.max(
              activeBurnStage,
              this._resolveBurnStageFromCondition(change?.conditionKey)
            );
          }
          activeConditionKeys.add(normalizedCondition);
        }
      }
      if (keepEntry) remainingEntries.push(entry);
    }

    if (entriesChanged) {
      await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    }

    const nextFlags = this._getConditionFlagEntries(targetActor);
    let hasChanges = false;
    for (const conditionKey of CONDITION_KEYS) {
      const shouldBeActive =
        activeConditionKeys.has(conditionKey) &&
        !this._isConditionImmune(targetActor, conditionKey);
      if (nextFlags[conditionKey] !== shouldBeActive) {
        nextFlags[conditionKey] = shouldBeActive;
        hasChanges = true;
      }

      const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
      if (systemField && Boolean(targetActor.system?.conditions?.[systemField]) !== shouldBeActive) {
        await targetActor.update({ [`system.conditions.${systemField}`]: shouldBeActive });
      }
      if (!systemField) {
        const currentState = Boolean(
          targetActor.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`)
        );
        if (currentState !== shouldBeActive) {
          await targetActor.setFlag(
            POKROLE.ID,
            `automation.conditions.${conditionKey}`,
            shouldBeActive
          );
        }
      }

      if (!shouldBeActive && (nextFlags[conditionKey] !== shouldBeActive || this._hasConditionAuxiliaryState(targetActor, conditionKey))) {
        await this._clearConditionAuxiliaryState(targetActor, conditionKey);
      }
    }

    if (hasChanges) {
      await targetActor.setFlag(POKROLE.ID, CONDITION_FLAGS_FLAG, nextFlags);
    }
    if (activeConditionKeys.has("burn") && !this._isConditionImmune(targetActor, "burn")) {
      if (typeof targetActor._applyBurnStage === "function") {
        await targetActor._applyBurnStage(activeBurnStage);
      }
    } else if (this._hasConditionAuxiliaryState(targetActor, "burn") && typeof targetActor._clearBurnTrack === "function") {
      await targetActor._clearBurnTrack();
    }
    if (!activeConditionKeys.has("frozen") && this._hasConditionAuxiliaryState(targetActor, "frozen")) {
      await targetActor._clearFrozenShellState();
    }
    if (!activeConditionKeys.has("paralyzed") && this._hasConditionAuxiliaryState(targetActor, "paralyzed")) {
      await targetActor._clearParalysisTurnCheck();
    }
    if (!activeConditionKeys.has("confused") && this._hasConditionAuxiliaryState(targetActor, "confused")) {
      await targetActor._clearConfusionSuppression();
    }
    if (!activeConditionKeys.has("infatuated") && this._hasConditionAuxiliaryState(targetActor, "infatuated")) {
      await targetActor._clearInfatuationSuppression();
    }
  }

  _normalizeConfiguredEffect(effect) {
    const normalizedBase = this._normalizeSecondaryEffectDefinition(effect);
    const normalizedId = `${effect?.id ?? foundry.utils.randomID?.() ?? `${Date.now()}`}`.trim();
    const passive = Boolean(effect?.passive ?? false);
    const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${effect?.passiveTrigger ?? ""}`)
      ? `${effect.passiveTrigger}`
      : "always";
    const passiveCondition = this._normalizeConditionKey(effect?.passiveCondition);
    const passiveThreshold = clamp(Math.floor(toNumber(effect?.passiveThreshold, 50)), 1, 99);

    return {
      ...normalizedBase,
      id: normalizedId,
      passive,
      passiveTrigger,
      passiveCondition,
      passiveThreshold
    };
  }

  _normalizeConfiguredEffects(effectList) {
    const rawList = Array.isArray(effectList)
      ? effectList
      : effectList && typeof effectList === "object"
        ? Object.values(effectList)
        : [];
    return rawList.map((effect) => this._normalizeConfiguredEffect(effect));
  }

  _getConfiguredEffectEntries(targetActor) {
    const rawEntries = targetActor?.getFlag(POKROLE.ID, CONFIGURED_EFFECTS_FLAG);
    return this._normalizeConfiguredEffects(rawEntries);
  }

  async _setConfiguredEffectEntries(targetActor, entries) {
    const normalizedEntries = this._normalizeConfiguredEffects(entries);
    await targetActor.setFlag(POKROLE.ID, CONFIGURED_EFFECTS_FLAG, normalizedEntries);
  }

  _checkPassiveTrigger(effect, targetActor) {
    if (!effect.passive) return true;

    const triggerKey = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${effect.passiveTrigger ?? ""}`)
      ? `${effect.passiveTrigger}`
      : "always";
    const normalizedCondition = this._normalizeConditionKey(effect?.passiveCondition);
    const hpThresholdPercent = clamp(Math.floor(toNumber(effect?.passiveThreshold, 50)), 1, 99);
    const resolveHpPercent = (actor) => {
      const currentHp = Math.max(toNumber(actor?.system?.resources?.hp?.value, 0), 0);
      const maxHp = Math.max(toNumber(actor?.system?.resources?.hp?.max, 1), 1);
      return Math.floor((currentHp / maxHp) * 100);
    };
    const hasCondition = (actor, conditionKey) => {
      if (conditionKey === "none") return false;
      const conditionFlags =
        typeof actor?.getConditionFlags === "function" ? actor.getConditionFlags() : {};
      if (Object.prototype.hasOwnProperty.call(conditionFlags, conditionKey)) {
        return Boolean(conditionFlags[conditionKey]);
      }
      const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
      if (systemField) {
        return Boolean(actor?.system?.conditions?.[systemField]);
      }
      return Boolean(actor?.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`));
    };

    switch (triggerKey) {
      case "always":
        return true;
      case "in-combat":
        return Boolean(game.combat);
      case "out-of-combat":
        return !game.combat;
      case "self-hp-half-or-less":
        return resolveHpPercent(this) <= 50;
      case "self-hp-quarter-or-less":
        return resolveHpPercent(this) <= 25;
      case "self-hp-below-threshold":
        return resolveHpPercent(this) <= hpThresholdPercent;
      case "target-hp-half-or-less":
        return resolveHpPercent(targetActor) <= 50;
      case "target-hp-quarter-or-less":
        return resolveHpPercent(targetActor) <= 25;
      case "target-hp-below-threshold":
        return resolveHpPercent(targetActor) <= hpThresholdPercent;
      case "self-has-condition":
        return hasCondition(this, normalizedCondition);
      case "self-missing-condition":
        return !hasCondition(this, normalizedCondition);
      case "target-has-condition":
        return hasCondition(targetActor, normalizedCondition);
      case "target-missing-condition":
        return !hasCondition(targetActor, normalizedCondition);
      default:
        return true;
    }
  }

  async _applyConfiguredEffectData(effect, options = {}) {
    const targetActor = options.targetActor ?? this;
    if (!targetActor) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const normalizedEffect = this._normalizeConfiguredEffect(effect);
    const normalizedType = this._normalizeSecondaryEffectType(normalizedEffect.effectType);
    if (normalizedType === "condition" && this._normalizeConditionKey(normalizedEffect.condition) === "none") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (normalizedType === "stat" && this._normalizeSecondaryStatKey(normalizedEffect.stat) === "none") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (normalizedType === "active-effect" && !`${normalizedEffect.linkedEffectId ?? ""}`.trim()) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (!this._checkPassiveTrigger(normalizedEffect, targetActor)) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.PassiveTriggerNotMet")
      };
    }

    return this._applySecondaryEffectToActor(normalizedEffect, targetActor, null);
  }

  async clearCombatTemporaryEffects(combatId = null) {
    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const managedEffectsToDelete = this._getManagedAutomationEffects(this)
      .filter((effectDocument) => {
        const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
        const isCombatScoped = Boolean(automationFlags?.expiresWithCombat);
        if (!isCombatScoped) return false;
        const effectCombatId = `${automationFlags?.combatId ?? ""}`.trim();
        const matchesCombat =
          !normalizedCombatId || !effectCombatId || effectCombatId === normalizedCombatId;
        return matchesCombat;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (managedEffectsToDelete.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", managedEffectsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) {
      if (managedEffectsToDelete.length > 0) {
        await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      }
      return managedEffectsToDelete.length;
    }
    const remainingEntries = [];
    let clearedCount = 0;

    for (const entry of currentEntries) {
      const isCombatScoped = Boolean(entry?.expiresWithCombat);
      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!isCombatScoped || !matchesCombat) {
        remainingEntries.push(entry);
        continue;
      }

      await this._revertTemporaryEffectEntry(entry);
      clearedCount += 1;
    }

    if (clearedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, remainingEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    return clearedCount + managedEffectsToDelete.length;
  }

  async advanceTemporaryEffectsRound(combatId = null) {
    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) return 0;

    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const nextEntries = [];
    let expiredCount = 0;
    let changed = false;

    for (const entry of currentEntries) {
      const durationMode = `${entry?.durationMode ?? "manual"}`.trim().toLowerCase();
      if (durationMode !== "rounds") {
        nextEntries.push(entry);
        continue;
      }

      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!matchesCombat) {
        nextEntries.push(entry);
        continue;
      }

      const remainingRounds = this._normalizeSecondaryDurationRounds(entry?.remainingRounds ?? 1);
      const nextRounds = remainingRounds - 1;
      if (nextRounds <= 0) {
        await this._revertTemporaryEffectEntry(entry);
        expiredCount += 1;
        changed = true;
        continue;
      }

      nextEntries.push({
        ...entry,
        remainingRounds: nextRounds
      });
      changed = changed || nextRounds !== remainingRounds;
    }

    if (changed || nextEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, nextEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    return expiredCount;
  }

  async processTemporaryEffectSpecialDuration(eventKey, options = {}) {
    const normalizedEventKey = `${eventKey ?? ""}`.trim().toLowerCase();
    if (!normalizedEventKey) return 0;

    const eventAliases = {
      turnstart: "turn-start",
      "turn-start": "turn-start",
      turnend: "turn-end",
      "turn-end": "turn-end",
      roundend: "round-end",
      "round-end": "round-end",
      combatend: "combat-end",
      "combat-end": "combat-end",
      nextaction: "next-action",
      "next-action": "next-action",
      nextattack: "next-attack",
      "next-attack": "next-attack",
      nexthit: "next-hit",
      "next-hit": "next-hit",
      isattacked: "is-attacked",
      "is-attacked": "is-attacked",
      isdamaged: "is-damaged",
      "is-damaged": "is-damaged",
      ishit: "is-hit",
      "is-hit": "is-hit"
    };
    const resolvedEvent = eventAliases[normalizedEventKey] ?? normalizedEventKey;

    const normalizedCombatId = `${options.combatId ?? game.combat?.id ?? ""}`.trim();
    const managedEffectsToDelete = this._getManagedAutomationEffects(this)
      .filter((effectDocument) => {
        const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
        const specialDurationList = this._normalizeSpecialDurationList(automationFlags?.specialDuration);
        if (!specialDurationList.length || !specialDurationList.includes(resolvedEvent)) {
          return false;
        }
        const effectCombatId = `${automationFlags?.combatId ?? ""}`.trim();
        const requiresCombatMatch = ["turn-start", "turn-end", "round-end", "combat-end"].includes(resolvedEvent);
        if (!requiresCombatMatch) return true;
        return !normalizedCombatId || !effectCombatId || effectCombatId === normalizedCombatId;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (managedEffectsToDelete.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", managedEffectsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) {
      if (managedEffectsToDelete.length > 0) {
        await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      }
      return managedEffectsToDelete.length;
    }

    const remainingEntries = [];
    let removedCount = managedEffectsToDelete.length;

    for (const entry of currentEntries) {
      const specialDurationList = this._normalizeSpecialDurationList(entry?.specialDuration);
      if (!specialDurationList.length || !specialDurationList.includes(resolvedEvent)) {
        remainingEntries.push(entry);
        continue;
      }

      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const requiresCombatMatch = ["turn-start", "turn-end", "round-end", "combat-end"].includes(resolvedEvent);
      const matchesCombat =
        !requiresCombatMatch ||
        !normalizedCombatId ||
        !entryCombatId ||
        entryCombatId === normalizedCombatId;
      if (!matchesCombat) {
        remainingEntries.push(entry);
        continue;
      }

      await this._revertTemporaryEffectEntry(entry);
      removedCount += 1;
    }

    if (removedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, remainingEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    return removedCount;
  }

  async processRoundEndCombatAutomation(options = {}) {
    const weatherKey = this._normalizeWeatherKey(options.weatherKey ?? this.getActiveWeatherKey());
    const statusDamage = await this._applyRoundEndStatusDamage();
    const weatherDamage = await this._applyRoundEndWeatherDamage(weatherKey);
    const heldItemResult = await this._applyRoundEndHeldItemEffects();
    const hasAnyEffect = statusDamage.totalDamage > 0 || weatherDamage.totalDamage > 0 || heldItemResult.label;
    if (!hasAnyEffect) {
      return { totalDamage: 0, statusDamage, weatherDamage };
    }

    const sections = [statusDamage.label, weatherDamage.label, heldItemResult.label]
      .filter((label) => label && label !== game.i18n.localize("POKROLE.Common.None"))
      .map((label) => `<p>${label}</p>`)
      .join("");
    if (sections) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <div class="pok-role-chat-card arcade-red">
            <header class="chat-card-header">
              <h3>${game.i18n.localize("POKROLE.Chat.RoundEndAutomation")}</h3>
            </header>
            <section class="chat-card-section">
              <p><strong>${this.name}</strong></p>
              ${sections}
            </section>
          </div>
        `
      });
    }
    return {
      totalDamage: statusDamage.totalDamage + weatherDamage.totalDamage + (heldItemResult.totalDamage ?? 0),
      statusDamage,
      weatherDamage
    };
  }

  async _applyRoundEndHeldItemEffects() {
    const held = this._getHeldItemData();
    if (!held) return { label: "", totalDamage: 0 };
    const parts = [];
    let totalDamage = 0;

    // Leftovers: heal HP at end of round (limited uses)
    if (held.endOfRoundHeal > 0) {
      const flagKey = "combat.leftoversUses";
      const currentUses = toNumber(this.getFlag(POKROLE.ID, flagKey), 0);
      const maxUses = toNumber(held.endOfRoundMaxUses, 3);
      if (currentUses < maxUses) {
        const hpValue = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
        const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 1), 1);
        if (hpValue < hpMax) {
          const healAmount = Math.min(held.endOfRoundHeal, hpMax - hpValue);
          await this.update({ "system.resources.hp.value": hpValue + healAmount });
          await this.setFlag(POKROLE.ID, flagKey, currentUses + 1);
          parts.push(`Leftovers healed ${healAmount} HP (use ${currentUses + 1}/${maxUses})`);
        }
        if (currentUses + 1 >= maxUses) {
          await this.update({ "system.battleItem": "" });
          parts.push("Leftovers consumed!");
        }
      }
    }

    // Sticky Barb: deal damage to self at end of round
    if (held.stickyBarb && held.endOfRoundDamage > 0) {
      const damage = held.endOfRoundDamage;
      await this._safeApplyDamage(this, damage, { applyDeadOnZero: false });
      totalDamage += damage;
      parts.push(`Sticky Barb dealt ${damage} damage`);
    }

    // Flame Orb / Toxic Orb: apply status on first round
    if (held.onEnterBattleStatus) {
      const flagKey = "combat.orbStatusApplied";
      const alreadyApplied = this.getFlag(POKROLE.ID, flagKey);
      if (!alreadyApplied) {
        await this.setFlag(POKROLE.ID, flagKey, true);
        const statusToApply = held.onEnterBattleStatus.toLowerCase().trim();
        if (statusToApply === "burn" && !this._isConditionActive("burn")) {
          await this.toggleQuickCondition("burn", { active: true });
          parts.push("Flame Orb inflicted burn!");
        } else if (statusToApply === "poison" && !this._isConditionActive("poisoned")) {
          await this.toggleQuickCondition("poisoned", { active: true });
          parts.push("Toxic Orb inflicted poison!");
        }
      }
    }

    return {
      label: parts.length > 0 ? parts.join(" | ") : "",
      totalDamage
    };
  }

  async _applyRoundEndStatusDamage() {
    const conditionFlags = this.getConditionFlags();
    let totalDamage = 0;
    const statusParts = [];

    const applyDamage = async (conditionKey, amount) => {
      if (!conditionFlags?.[conditionKey]) return;
      const hpResult = await this._safeApplyDamage(this, amount, {
        applyDeadOnZero: this._statusDamageCanKill(conditionKey)
      });
      if (!hpResult) return;
      totalDamage += amount;
      const label =
        conditionKey === "burn"
          ? this._localizeBurnStageName(this._getBurnTrack().stage)
          : this._localizeConditionName(conditionKey);
      statusParts.push(`${label} -${amount}`);
    };

    await applyDamage("burn", this._getBurnRoundDamage(this._getBurnTrack().stage));
    await applyDamage("poisoned", 1);
    await applyDamage("badly-poisoned", 1);

    if (!statusParts.length) {
      return { totalDamage: 0, label: game.i18n.localize("POKROLE.Common.None") };
    }
    return { totalDamage, label: statusParts.join(" | ") };
  }

  async _applyRoundEndWeatherDamage(weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const localizedWeather = this._localizeWeatherName(weather);
    if (weather === "none") {
      return { totalDamage: 0, label: game.i18n.localize("POKROLE.Common.None") };
    }
    // Umbrella: immune to weather damage
    if (this._getHeldItemData()?.immuneToWeather) {
      return {
        totalDamage: 0,
        label: game.i18n.format("POKROLE.Chat.WeatherNoDamage", { weather: localizedWeather })
      };
    }
    const isPokemon = this.type === "pokemon";
    let damage = 0;
    if (weather === "sandstorm" && isPokemon && !this.hasType("rock") && !this.hasType("ground") && !this.hasType("steel")) {
      damage = 1;
    }
    if (weather === "hail" && isPokemon && !this.hasType("ice")) {
      damage = 1;
    }
    if (damage <= 0) {
      return {
        totalDamage: 0,
        label: game.i18n.format("POKROLE.Chat.WeatherNoDamage", { weather: localizedWeather })
      };
    }
    await this._safeApplyDamage(this, damage);
    return {
      totalDamage: damage,
      label: game.i18n.format("POKROLE.Chat.WeatherRoundDamage", {
        weather: localizedWeather,
        damage
      })
    };
  }

  _getTemporaryEffectEntries(targetActor) {
    const rawEntries = targetActor?.getFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG);
    if (!Array.isArray(rawEntries)) return [];
    return rawEntries.filter((entry) => entry && typeof entry === "object");
  }

  async _setTemporaryEffectEntries(targetActor, entries) {
    const normalizedEntries = Array.isArray(entries)
      ? entries.filter((entry) => entry && typeof entry === "object")
      : [];
    await targetActor.setFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG, normalizedEntries);
  }

  async _trackTemporaryConditionEffect({
    targetActor,
    conditionKey = "none",
    conditionPath,
    label = "",
    sourceMove = null,
    durationMode = "manual",
    durationRounds = 1,
    specialDuration = []
  }) {
    if (!targetActor) {
      return { durationMode: "manual", durationRounds: 1 };
    }

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "condition");
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const combatId = game.combat?.id ?? null;
    const combatRound = game.combat?.round ?? null;
    const effectiveMode =
      (requestedMode === "combat" || requestedMode === "rounds") && !combatId
        ? "manual"
        : requestedMode;
    const isCombatScoped = effectiveMode === "combat" || effectiveMode === "rounds";

    const effectEntries = this._getTemporaryEffectEntries(targetActor);
    const effectId =
      foundry.utils.randomID?.() ??
      `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    effectEntries.push({
      id: effectId,
      label: `${label ?? ""}`.trim() || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
      effectType: "condition",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      durationMode: effectiveMode,
      remainingRounds: effectiveMode === "rounds" ? normalizedRounds : null,
      specialDuration: normalizedSpecialDuration,
      expiresWithCombat: isCombatScoped,
      combatId: isCombatScoped ? combatId : null,
      appliedRound: isCombatScoped ? combatRound : null,
      createdAt: Date.now(),
      changes: [
        {
          kind: "boolean",
          path: conditionPath ?? "",
          conditionKey: this._normalizeConditionKey(conditionKey),
          previousValue: false
        }
      ]
    });
    await this._setTemporaryEffectEntries(targetActor, effectEntries);
    return {
      durationMode: effectiveMode,
      durationRounds: normalizedRounds,
      specialDuration: normalizedSpecialDuration
    };
  }

  _getManagedModifierEffectsForPath(targetActor, path) {
    const normalizedPath = `${path ?? ""}`.trim();
    if (!targetActor || !normalizedPath) return [];
    const effects = targetActor.effects?.contents ?? [];
    return effects.filter((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (!automationFlags?.managed) return false;
      if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "modifier") return false;
      if (`${automationFlags?.path ?? ""}`.trim() !== normalizedPath) return false;
      const amountApplied = Math.floor(toNumber(automationFlags?.amountApplied, 0));
      return amountApplied !== 0;
    });
  }

  async _applyTemporaryTrackedModifier({
    targetActor,
    path,
    amount,
    min = 0,
    max = 99,
    label = "",
    sourceMove = null,
    detailLabel = "",
    durationMode = "combat",
    durationRounds = 1,
    specialDuration = []
  }) {
    const numericAmount = Math.floor(toNumber(amount, 0));
    if (!targetActor || !path || numericAmount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const existingPathModifiers = this._getManagedModifierEffectsForPath(targetActor, path);
    const incomingSourceType = this._getAutomationSourceItemType({
      sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase(),
      sourceMoveId: sourceMove?.type === "move" ? sourceMove?.id ?? null : null
    });
    const sameDirectionModifiers = existingPathModifiers.filter((effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const applied = Math.floor(toNumber(flags?.amountApplied, 0));
      if (applied === 0) return false;
      return Math.sign(applied) === Math.sign(numericAmount);
    });
    const nonStackableSameDirectionModifiers = sameDirectionModifiers.filter((effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const existingSourceType = this._getAutomationSourceItemType(flags);
      return !this._canStackTrackedModifierSources(incomingSourceType, existingSourceType);
    });
    const strongestSameDirection = nonStackableSameDirectionModifiers.reduce((maxAmount, effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const applied = Math.floor(toNumber(flags?.amountApplied, 0));
      return Math.max(maxAmount, Math.abs(applied));
    }, 0);
    if (strongestSameDirection >= Math.abs(numericAmount)) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }
    const weakerSameDirectionIds = nonStackableSameDirectionModifiers
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (weakerSameDirectionIds.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", weakerSameDirectionIds);
    }

    const currentValue = toNumber(foundry.utils.getProperty(targetActor, path), 0);
    const nextValue = clamp(currentValue + numericAmount, min, max);
    const appliedAmount = nextValue - currentValue;
    if (appliedAmount === 0) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "stat");
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "modifier",
      conditionKey: "none",
      durationMode: requestedMode,
      durationRounds: normalizedRounds,
      specialDuration: normalizedSpecialDuration,
      sourceMove
    });
    const durationData = this._buildManagedEffectDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds
    );
    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `${label ?? ""}`.trim() || detailLabel || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
        img: sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: [],
        duration: durationData,
        changes: [
          {
            key: path,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: `${appliedAmount}`,
            priority: 20
          }
        ],
        flags: {
          [POKROLE.ID]: {
            automation: {
              ...automationFlags,
              path,
              amountApplied: appliedAmount,
              sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase() || null,
              sourceItemId: sourceMove?.id ?? null,
              sourceItemName: sourceMove?.name ?? "",
              min,
              max
            }
          }
        }
      }
    ]);

    const durationLabel = this._localizeTemporaryDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds,
      automationFlags.specialDuration
    );
    return {
      applied: true,
      detail: `${detailLabel || path} ${currentValue} -> ${nextValue} (${durationLabel})`
    };
  }

  _getAutomationSourceItemType(automationFlags = {}) {
    const explicitType = `${automationFlags?.sourceItemType ?? ""}`.trim().toLowerCase();
    if (["move", "ability"].includes(explicitType)) return explicitType;
    const legacyMoveId = `${automationFlags?.sourceMoveId ?? ""}`.trim();
    if (legacyMoveId) return "move";
    return "";
  }

  _canStackTrackedModifierSources(leftSourceType, rightSourceType) {
    return (
      (leftSourceType === "move" && rightSourceType === "ability") ||
      (leftSourceType === "ability" && rightSourceType === "move")
    );
  }

  _localizeTemporaryDuration(durationMode, rounds = 1, specialDuration = []) {
    const normalizedMode = `${durationMode ?? "manual"}`.trim().toLowerCase();
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const specialDurationLabel = this._localizeSpecialDurationList(normalizedSpecialDuration);
    if (normalizedMode === "combat") {
      const baseLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationCombat");
      return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
    }
    if (normalizedMode === "rounds") {
      const normalizedRounds = this._normalizeSecondaryDurationRounds(rounds);
      const baseLabel = game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
        rounds: normalizedRounds
      });
      return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
    }
    const baseLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
  }

  _localizeSpecialDurationList(specialDurationList = []) {
    if (!Array.isArray(specialDurationList) || specialDurationList.length === 0) return "";
    const labelByKey = {
      "turn-start": "POKROLE.Move.Secondary.Duration.Special.TurnStart",
      "turn-end": "POKROLE.Move.Secondary.Duration.Special.TurnEnd",
      "round-end": "POKROLE.Move.Secondary.Duration.Special.RoundEnd",
      "combat-end": "POKROLE.Move.Secondary.Duration.Special.CombatEnd",
      "next-action": "POKROLE.Move.Secondary.Duration.Special.NextAction",
      "next-attack": "POKROLE.Move.Secondary.Duration.Special.NextAttack",
      "next-hit": "POKROLE.Move.Secondary.Duration.Special.NextHit",
      "is-attacked": "POKROLE.Move.Secondary.Duration.Special.IsAttacked",
      "is-damaged": "POKROLE.Move.Secondary.Duration.Special.IsDamaged",
      "is-hit": "POKROLE.Move.Secondary.Duration.Special.IsHit"
    };
    const labels = specialDurationList.map((durationKey) =>
      game.i18n.localize(labelByKey[durationKey] ?? "POKROLE.Common.Unknown")
    );
    return labels.join(", ");
  }

  _buildManagedEffectDuration(durationMode, durationRounds) {
    const normalizedMode = `${durationMode ?? "manual"}`.trim().toLowerCase();
    if (normalizedMode !== "rounds") return {};
    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const combat = game.combat;
    const duration = { rounds: normalizedRounds };
    if (combat) {
      duration.startRound = Number.isFinite(Number(combat.round)) ? Number(combat.round) : 0;
      duration.startTurn = Number.isFinite(Number(combat.turn)) ? Number(combat.turn) : 0;
      duration.combat = combat.id ?? null;
    }
    return duration;
  }

  _buildManagedAutomationFlagPayload({
    effectType = "custom",
    conditionKey = "none",
    durationMode = "manual",
    durationRounds = 1,
    specialDuration = [],
    sourceMove = null
  } = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    const normalizedDurationMode = this._normalizeSecondaryDurationMode(durationMode, effectType);
    const normalizedDurationRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const combatId = game.combat?.id ?? null;
    const effectiveMode =
      (normalizedDurationMode === "combat" || normalizedDurationMode === "rounds") && !combatId
        ? "manual"
        : normalizedDurationMode;
    const expiresWithCombat = effectiveMode === "combat" || effectiveMode === "rounds";

    return {
      managed: true,
      sourceType: "automation",
      effectType,
      conditionKey: normalizedCondition,
      durationMode: effectiveMode,
      durationRounds: normalizedDurationRounds,
      specialDuration: normalizedSpecialDuration,
      expiresWithCombat,
      combatId: expiresWithCombat ? combatId : null,
      sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase() || null,
      sourceItemId: sourceMove?.id ?? null,
      sourceItemName: sourceMove?.name ?? "",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      createdAt: Date.now()
    };
  }

  _isManagedAutomationEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation");
    return Boolean(automationFlags?.managed);
  }

  _extractConditionKeyFromEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation");
    const fromFlags = this._normalizeConditionKey(automationFlags?.conditionKey);
    if (fromFlags !== "none") return fromFlags;
    const statusEntries = [...(effectDocument?.statuses ?? [])];
    for (const statusEntry of statusEntries) {
      const normalizedStatus = `${statusEntry ?? ""}`.trim().toLowerCase();
      if (!normalizedStatus.startsWith("pokrole-condition-")) continue;
      const conditionKey = this._normalizeConditionKey(
        normalizedStatus.replace(/^pokrole-condition-/, "")
      );
      if (conditionKey !== "none") return conditionKey;
    }
    return "none";
  }

  _getManagedAutomationEffects(targetActor) {
    const actor = targetActor ?? this;
    const effects = actor?.effects?.contents ?? [];
    return effects.filter((effectDocument) => this._isManagedAutomationEffect(effectDocument));
  }

  async _revertTemporaryEffectEntry(entry) {
    const effectChanges = Array.isArray(entry?.changes) ? entry.changes : [];
    if (!effectChanges.length) return;

    const updates = {};
    for (const change of effectChanges) {
      const path = `${change?.path ?? ""}`.trim();
      if (!path.startsWith("system.")) continue;

      const changeKind = `${change?.kind ?? "number"}`.trim().toLowerCase();
      if (changeKind === "boolean") {
        updates[path] = Boolean(change?.previousValue);
        continue;
      }

      const amountApplied = toNumber(change?.amountApplied, 0);
      if (amountApplied === 0) continue;

      const minValue = Number(change?.min);
      const maxValue = Number(change?.max);
      const min = Number.isFinite(minValue) ? minValue : 0;
      const max = Number.isFinite(maxValue) ? maxValue : 999;
      const currentValue = toNumber(foundry.utils.getProperty(this, path), 0);
      const nextValue = clamp(currentValue - amountApplied, min, max);
      if (nextValue === currentValue) continue;
      updates[path] = nextValue;
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
  }

  async _applyCombatStatEffectToActor(effect, targetActor, sourceMove = null) {
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const validCombatStats = ["accuracy", "damage", "evasion", "clash"];
    const statKey = `${effect.stat ?? ""}`.trim();
    if (!validCombatStats.includes(statKey)) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    return this._applyTemporaryTrackedModifier({
      targetActor,
      path: `system.combatProfile.${statKey}`,
      amount,
      min: 0,
      max: 99,
      label: this._formatSecondaryEffectLabel(effect),
      sourceMove,
      detailLabel: this._localizeSecondaryStatName(statKey),
      durationMode: effect.durationMode,
      durationRounds: effect.durationRounds,
      specialDuration: effect.specialDuration
    });
  }

  async _applyWillEffectToActor(effect, targetActor) {
    const maxWill = Math.max(toNumber(targetActor.system.resources?.will?.max, 1), 1);
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const currentWill = Math.max(toNumber(targetActor.system.resources?.will?.value, 0), 0);
    const nextWill = clamp(currentWill + amount, 0, maxWill);
    if (nextWill === currentWill) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }
    await targetActor.update({ "system.resources.will.value": nextWill });
    return {
      applied: true,
      detail: `${currentWill} -> ${nextWill}`
    };
  }

  async _applyWeatherEffect(effect, sourceMove = null) {
    const weatherKey = this._normalizeSecondaryWeatherKey(effect.weather);
    if (!game.combat) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.CombatRequired")
      };
    }

    const durationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "weather");
    const durationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    const weatherDurationRounds = durationMode === "rounds" ? durationRounds : 0;
    const payload = await this.setActiveWeather(weatherKey, {
      durationRounds: weatherDurationRounds,
      sourceMoveId: sourceMove?.id ?? null
    });
    if (!payload) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    const durationLabel =
      durationMode === "rounds"
        ? game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: weatherDurationRounds
          })
        : game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return {
      applied: true,
      detail: `${this._localizeSecondaryWeatherName(weatherKey)} (${durationLabel})`
    };
  }

  async _applyTerrainEffect(effect, sourceMove = null) {
    const terrainKey = this._normalizeSecondaryTerrainKey(effect.terrain);
    if (!game.combat) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.CombatRequired")
      };
    }

    const durationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "terrain");
    const durationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    const terrainDurationRounds = durationMode === "rounds" ? durationRounds : 0;
    const payload = await this.setActiveTerrain(terrainKey, {
      durationRounds: terrainDurationRounds,
      sourceMoveId: sourceMove?.id ?? null
    });
    if (!payload) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    const durationLabel =
      durationMode === "rounds"
        ? game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: terrainDurationRounds
          })
        : game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return {
      applied: true,
      detail: `${this._localizeSecondaryTerrainName(terrainKey)} (${durationLabel})`
    };
  }

  async _safeApplyHeal(targetActor, healAmount, options = {}) {
    const normalizedHeal = Math.max(toNumber(healAmount, 0), 0);
    if (!targetActor || normalizedHeal <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healingCategory = this._normalizeHealingCategory(options?.healingCategory);
    let allowedHeal = normalizedHeal;
    let track = null;
    if (game.combat && targetActor instanceof PokRoleActor) {
      track = targetActor._getHealingTrack();
      const perRoundLimit = this._getHealingRoundLimit(healingCategory);
      const remainingHeal = Math.max(perRoundLimit - track.healedThisRound, 0);
      allowedHeal = Number.isFinite(perRoundLimit)
        ? Math.min(allowedHeal, remainingHeal)
        : allowedHeal;
    }

    const hpAfter = Math.min(hpValue + allowedHeal, hpMax);
    const healedApplied = Math.max(hpAfter - hpValue, 0);
    if (hpAfter === hpValue) {
      return { hpBefore: hpValue, hpAfter, healedApplied: 0 };
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
      if (track && healedApplied > 0) {
        track.healedThisRound += healedApplied;
        if (healingCategory !== "standard") {
          track.completeHealedThisRound += healedApplied;
        }
        await targetActor._setHealingTrack(track);
      }
      if (options?.restoreAwareness && hpAfter > 0 && typeof targetActor.toggleQuickCondition === "function") {
        await targetActor.toggleQuickCondition("fainted", { active: false });
      }
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply heal`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    }

    return {
      hpBefore: hpValue,
      hpAfter,
      healedApplied
    };
  }

  async useGearItem(itemId, options = {}) {
    const gearItem = this.items.get(itemId);
    if (!gearItem || gearItem.type !== "gear") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownGear"));
      return null;
    }

    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const pocket = `${gearItem.system.pocket ?? "main"}`.toLowerCase();
    const pocketUsableInBattle = pocket === "potions" || pocket === "small";
    if (game.combat && (!pocketUsableInBattle || !gearItem.system.canUseInBattle)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearNotUsableInBattle"));
      return null;
    }

    const targetActor = options.targetActor ?? getTargetActorFromUserSelection() ?? this;
    if (gearItem.system.target === "trainer" && targetActor.type !== "trainer") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }
    if (gearItem.system.target === "pokemon" && targetActor.type !== "pokemon") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }

    const hpBefore = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healsFullHp = gearItem.system.heal?.fullHp ?? false;
    const healHpValue = Math.max(toNumber(gearItem.system.heal?.hp, 0), 0);
    const healingAmount = healsFullHp ? Math.max(hpMax - hpBefore, 0) : healHpValue;
    const healingCategory = this._resolveGearHealingCategory(gearItem);
    const healResult = await this._safeApplyHeal(targetActor, healingAmount, {
      healingCategory,
      restoreAwareness: Boolean(gearItem.system.heal?.restoreAwareness)
    });
    const hpAfter = Math.max(toNumber(healResult?.hpAfter, hpBefore), hpBefore);
    const healedAmount = Math.max(toNumber(healResult?.healedApplied, hpAfter - hpBefore), 0);

    const statusCures = [];
    const clearCondition = async (conditionKey) => {
      if (typeof targetActor.toggleQuickCondition !== "function") return;
      if (!targetActor._isConditionActive?.(conditionKey)) return;
      await targetActor.toggleQuickCondition(conditionKey, { active: false });
      statusCures.push(conditionKey);
    };
    if (gearItem.system.status?.all) {
      for (const conditionKey of CONDITION_KEYS) {
        await clearCondition(conditionKey);
      }
    } else {
      const statusMap = [
        ["poison", "poisoned"],
        ["sleep", "sleep"],
        ["burn", "burn"],
        ["frozen", "frozen"],
        ["paralysis", "paralyzed"],
        ["confusion", "confused"]
      ];
      for (const [fieldKey, conditionKey] of statusMap) {
        if (!gearItem.system.status?.[fieldKey]) continue;
        await clearCondition(conditionKey);
      }
    }

    const consumeResult = gearItem.system.consumable ? await this._consumeGearItem(gearItem) : null;
    const statusEffects = this._getGearStatusEffects(gearItem).map((statusKey) =>
      game.i18n.localize(`POKROLE.Gear.Status.${statusKey}`)
    );

    const notes = [];
    const healLethalValue = Math.max(toNumber(gearItem.system.heal?.lethal, 0), 0);
    if (healLethalValue > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearLethalHealNote", {
          value: healLethalValue
        })
      );
    }
    if (gearItem.system.heal?.restoreAwareness) {
      notes.push(game.i18n.localize("POKROLE.Chat.GearAwarenessNote"));
    }
    if (statusEffects.length > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearStatusNote", {
          value: statusEffects.join(", ")
        })
      );
    }
    if (statusCures.length > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearStatusCured", {
          value: statusCures.map((key) => this._localizeConditionName(key)).join(", ")
        })
      );
    }

    const stockLabel = consumeResult
      ? consumeResult.unitsMax > 0
        ? `${consumeResult.quantity} x (${consumeResult.unitsValue}/${consumeResult.unitsMax})`
        : `${consumeResult.quantity}`
      : game.i18n.localize("POKROLE.Common.None");

    const content = `
      <div class="pok-role-chat-card">
        <h3>${game.i18n.localize("POKROLE.Chat.GearUsed")}: ${gearItem.name}</h3>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Actor")}:</strong> ${this.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Target")}:</strong> ${targetActor.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Gear.HealHp")}:</strong> +${healedAmount}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.TargetHP")}:</strong> ${hpBefore} -> ${hpAfter}</p>
        ${
          consumeResult
            ? `<p><strong>${game.i18n.localize("POKROLE.Gear.Stock")}:</strong> ${stockLabel}</p>`
            : ""
        }
        ${
          notes.length > 0
            ? `<hr /><p>${notes.join("<br />")}</p>`
            : ""
        }
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content
    });

    return {
      targetActor,
      hpBefore,
      hpAfter,
      healedAmount,
      consumeResult
    };
  }

  async trainerUseItemOnPokemon(options = {}) {
    if (this.type !== "trainer") return null;
    const targetActor = options.targetActor ?? getTargetActorFromUserSelection();
    if (!targetActor || targetActor.type !== "pokemon") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerItemNeedsPokemonTarget"));
      return null;
    }

    const candidateItems = this.items
      .filter((item) => item.type === "gear")
      .filter((item) => Boolean(item.system?.canUseInBattle))
      .filter((item) => Math.max(toNumber(item.system?.quantity, 0), 0) > 0);
    if (!candidateItems.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerNoBattleItems"));
      return null;
    }

    let selectedItemId = `${options.itemId ?? ""}`.trim();
    if (!selectedItemId) {
      const chosen = await new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("POKROLE.Combat.TrainerActions.UseItemOnPokemon"),
          content: `
            <form class="pok-role-combined-roll">
              <div class="form-group">
                <label>${game.i18n.localize("POKROLE.Fields.Name")}</label>
                <select name="itemId">
                  ${candidateItems
                    .map((item) => `<option value="${item.id}">${item.name}</option>`)
                    .join("")}
                </select>
              </div>
            </form>
          `,
          buttons: {
            confirm: {
              icon: "<i class='fas fa-check'></i>",
              label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
              callback: (dialogHtml) => resolve(dialogHtml?.[0]?.querySelector("select[name='itemId']")?.value ?? "")
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: game.i18n.localize("POKROLE.Common.Cancel"),
              callback: () => resolve("")
            }
          },
          default: "confirm",
          close: () => resolve("")
        }, { classes: ["pok-role-dialog"] }).render(true);
      });
      selectedItemId = `${chosen ?? ""}`.trim();
    }
    if (!selectedItemId) return null;

    const medicineRoll = await this._rollSuccessPool({
      dicePool: this.getTraitValue("clever") + this.getSkillValue("medicine"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.TrainerUseItemRoll", { actor: this.name })
    });
    if (!medicineRoll?.success) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerItemCheckFailed"));
      return null;
    }

    const result = await this.useGearItem(selectedItemId, { targetActor });
    if (!result) return null;

    if (game.combat && !this.isTrainerInFray()) {
      const blockedRoundKey = this._getCurrentRoundKey(1);
      if (blockedRoundKey) {
        await targetActor.setFlag(POKROLE.ID, TREATMENT_BLOCK_FLAG_KEY, blockedRoundKey);
      }
    }
    return result;
  }

  async trainerSearchForCover() {
    if (this.type !== "trainer") return null;
    if (this.isTrainerInFray()) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerCannotSearchCoverInFray"));
      return null;
    }

    // Step 1: Roll Insight + Alert with 1 required success to find cover
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("insight") + this.getSkillValue("alert"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.TrainerSearchCoverRoll", { actor: this.name })
    });
    if (!result?.success) return result;

    // Step 2: If roll succeeded, show dialog to choose cover level
    const coverLevel = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.TrainerActions.SearchForCover"),
        content: `
          <form class="pok-role-combined-roll">
            <div class="form-group">
              <label>${game.i18n.localize("POKROLE.Combat.SearchCoverLevel")}</label>
              <select name="coverLevel">
                <option value="quarter">${game.i18n.localize("POKROLE.Combat.CoverQuarter")} (+1 DEF/SDEF vs ranged)</option>
                <option value="half">${game.i18n.localize("POKROLE.Combat.CoverHalf")} (+2 DEF/SDEF vs ranged)</option>
                <option value="full">${game.i18n.localize("POKROLE.Combat.CoverFull")} (${game.i18n.localize("POKROLE.Combat.CoverFullDesc")})</option>
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("POKROLE.Common.Confirm"),
            callback: (html) => resolve(html.find("[name='coverLevel']").val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "ok"
      }).render(true);
    });

    if (!coverLevel) return null;

    await this.setTrainerCover(coverLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(coverLevel)
      })
    );
    return result;
  }

  async trainerTakeCover(level = "half") {
    if (this.type !== "trainer") return null;
    const resolvedLevel = `${level ?? "half"}`.trim().toLowerCase();
    const targetLevel = ["full", "half", "quarter", "none"].includes(resolvedLevel)
      ? resolvedLevel
      : "half";
    await this.setTrainerCover(targetLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(targetLevel)
      })
    );
    return targetLevel;
  }

  async trainerEnterFray(options = {}) {
    if (this.type !== "trainer") return null;
    const active = options.active === undefined ? !this.isTrainerInFray() : Boolean(options.active);
    await this.setTrainerInFray(active);

    if (active) {
      const combat = game.combat;
      if (combat) {
        const existingCombatant = combat.combatants.find((c) => c.actor?.id === this.id);
        if (!existingCombatant) {
          const tokenDoc = this.getActiveTokens(true)?.[0]?.document ?? null;
          const combatantData = tokenDoc
            ? { tokenId: tokenDoc.id, sceneId: tokenDoc.parent?.id, actorId: this.id }
            : { actorId: this.id };
          await combat.createEmbeddedDocuments("Combatant", [combatantData]);
        }
        await this.rollInitiative();
      }
    } else {
      const combat = game.combat;
      if (combat) {
        const existingCombatant = combat.combatants.find((c) => c.actor?.id === this.id);
        if (existingCombatant) {
          await combat.deleteEmbeddedDocuments("Combatant", [existingCombatant.id]);
        }
      }
    }

    ui.notifications.info(
      game.i18n.localize(
        active ? "POKROLE.Chat.TrainerEnteredFray" : "POKROLE.Chat.TrainerLeftFray"
      )
    );
    return active;
  }

  async trainerRunAwayFromBattle(options = {}) {
    if (this.type !== "trainer") return null;
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const foeActor = options.foeActor ?? this._resolveRunAwayFoeActor();
    if (!foeActor) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.NoRunAwayOpponent"));
      return null;
    }

    const selfRoll = await new Roll(
      successPoolFormula(this.getTraitValue("dexterity") + this.getSkillValue("athletic"))
    ).evaluate({ async: true });
    const foeRoll = await new Roll(
      successPoolFormula(foeActor.getTraitValue("dexterity") + foeActor.getSkillValue("athletic"))
    ).evaluate({ async: true });
    const selfNet = toNumber(selfRoll.total, 0) - this.getPainPenalty();
    const foeNet = toNumber(foeRoll.total, 0) - foeActor.getPainPenalty();
    const escaped = selfNet > foeNet;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card">
          <h3>${game.i18n.localize("POKROLE.Combat.TrainerActions.RunAway")}</h3>
          <p><strong>${this.name}</strong>: ${selfNet}</p>
          <p><strong>${foeActor.name}</strong>: ${foeNet}</p>
          <p><strong>${game.i18n.localize("POKROLE.Chat.Result")}:</strong> ${
            escaped
              ? game.i18n.localize("POKROLE.Chat.RunAwaySuccess")
              : game.i18n.localize("POKROLE.Chat.RunAwayFailed")
          }</p>
        </div>
      `
    });

    if (escaped && game.user?.isGM) {
      const partyPokemonIds = this.system.party ?? [];
      const combatantIdsToRemove = [];
      for (const combatant of combat.combatants) {
        if (!combatant.actor) continue;
        if (combatant.actor.id === this.id || partyPokemonIds.includes(combatant.actor.id)) {
          combatantIdsToRemove.push(combatant.id);
        }
      }
      if (combatantIdsToRemove.length > 0) {
        await combat.deleteEmbeddedDocuments("Combatant", combatantIdsToRemove);
      }

      const remainingCombatants = combat.combatants.size;
      if (remainingCombatants <= 1) {
        await combat.update({ active: false });
      }
    }

    return { escaped, selfNet, foeNet, foeActor };
  }

  _resolveRunAwayFoeActor() {
    const target = getTargetActorFromUserSelection();
    if (target && target.id !== this.id) return target;
    const combatants = game.combat?.combatants ?? [];
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (!actor || actor.id === this.id) continue;
      return actor;
    }
    return null;
  }

  hasType(typeKey) {
    const normalizedType = this._normalizeTypeKey(typeKey);
    const primary = this._normalizeTypeKey(this.system.types?.primary || "none");
    const secondary = this._normalizeTypeKey(this.system.types?.secondary || "none");
    return normalizedType === primary || normalizedType === secondary;
  }

  localizeTrait(traitKey) {
    const labelPath = TRAIT_LABEL_BY_KEY[traitKey] || "POKROLE.Common.Unknown";
    return game.i18n.localize(labelPath);
  }

  async _resolveDefensiveReaction({
    targetActor,
    move,
    roundKey,
    netAccuracySuccesses
  }) {
    const socialAccuracyMove = this._isSocialAccuracyMove(move);
    const moveCanBeEvaded = !socialAccuracyMove && !move.system.neverFail;
    const moveCanBeClashed = !socialAccuracyMove;
    const incomingMoveCategory = this._normalizeMoveCombatCategory(move?.system?.category);

    const choice = await this._promptDefensiveReaction({
      targetActor,
      move,
      roundKey,
      moveCanBeEvaded,
      moveCanBeClashed,
      incomingMoveCategory
    });

    if (!choice || choice.type === "none") {
      return {
        attempted: false,
        type: "none",
        success: false,
        evaded: false,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: 0,
        attackerDamage: 0,
        targetDamage: 0,
        label: "POKROLE.Chat.Reaction.None"
      };
    }

    if (choice.type === "evasion") {
      const evasionResult = await targetActor.rollEvasion(null, { roundKey });
      if (!evasionResult) {
        return {
          attempted: true,
          type: "evasion",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.EvasionFailed"
        };
      }

      const success = evasionResult.netSuccesses >= netAccuracySuccesses;
      return {
        attempted: true,
        type: "evasion",
        success,
        evaded: success,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: evasionResult.netSuccesses,
        attackerDamage: 0,
        targetDamage: 0,
        label: success
          ? "POKROLE.Chat.Reaction.EvasionSuccess"
          : "POKROLE.Chat.Reaction.EvasionFailed"
      };
    }

    if (choice.type === "clash") {
      const clashResult = await targetActor.rollClash(choice.clashMoveId, null, {
        roundKey,
        expectedCategory: incomingMoveCategory
      });
      if (!clashResult) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const success = clashResult.netSuccesses >= netAccuracySuccesses;
      if (!success) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: clashResult.move?.name ?? "",
          netSuccesses: clashResult.netSuccesses,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const defenderDamage = this._computeClashDamage(move.system.type, targetActor);
      const attackerDamage = this._computeClashDamage(
        clashResult.move?.system?.type ?? "normal",
        this
      );
      await this._safeApplyDamage(targetActor, defenderDamage);
      await this._safeApplyDamage(this, attackerDamage);

      return {
        attempted: true,
        type: "clash",
        success: true,
        evaded: false,
        clashResolved: true,
        clashMoveName: clashResult.move?.name ?? "",
        netSuccesses: clashResult.netSuccesses,
        attackerDamage,
        targetDamage: defenderDamage,
        label: "POKROLE.Chat.Reaction.ClashSuccess"
      };
    }

    return {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };
  }

  async _promptDefensiveReaction({
    targetActor,
    move,
    roundKey,
    moveCanBeEvaded,
    moveCanBeClashed,
    incomingMoveCategory = "support"
  }) {
    const canUseEvasion =
      moveCanBeEvaded && targetActor._canUseReactionThisRound("evasion", roundKey);
    const requiredClashCategory = this._normalizeMoveCombatCategory(incomingMoveCategory);
    const clashMoves = targetActor.items
      .filter((item) => {
        if (item.type !== "move") return false;
        if (!targetActor._moveUsesPrimaryDamage(item)) return false;
        return this._normalizeMoveCombatCategory(item.system?.category) === requiredClashCategory;
      });
    const canUseClash =
      moveCanBeClashed &&
      (requiredClashCategory === "physical" || requiredClashCategory === "special") &&
      targetActor._canUseReactionThisRound("clash", roundKey) &&
      clashMoves.length > 0;

    if (!canUseEvasion && !canUseClash) {
      return { type: "none" };
    }

    const content = `
      <form class="pok-role-reaction-dialog">
        <p class="dialog-intro">
          ${game.i18n.format("POKROLE.Combat.ReactionPrompt", {
            target: targetActor.name,
            move: move.name
          })}
        </p>
        <label class="trait-option compact">
          <input type="radio" name="reactionType" value="none" checked />
          <span>${game.i18n.localize("POKROLE.Chat.Reaction.None")}</span>
        </label>
        ${
          canUseEvasion
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="evasion" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseEvasion")}</span>
          </label>
        `
            : ""
        }
        ${
          canUseClash
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="clash" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseClash")}</span>
          </label>
          <div class="form-group nested">
            <label>${game.i18n.localize("POKROLE.Combat.ClashMove")}</label>
            <select name="clashMoveId">
              ${clashMoves
                .map((clashMove) => `<option value="${clashMove.id}">${clashMove.name}</option>`)
                .join("")}
            </select>
          </div>
        `
            : ""
        }
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.ReactionTitle"),
        content,
        buttons: {
          confirm: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          skip: {
            icon: "<i class='fas fa-forward'></i>",
            label: game.i18n.localize("POKROLE.Combat.SkipReaction"),
            callback: () => resolve(null)
          }
        },
        default: "confirm",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-reaction-app"] }).render(true);
    });

    if (!html) return { type: "none" };
    const form = html[0]?.querySelector("form");
    if (!form) return { type: "none" };

    const type = form.querySelector("input[name='reactionType']:checked")?.value ?? "none";
    const clashMoveId = form.querySelector("select[name='clashMoveId']")?.value ?? "";
    return { type, clashMoveId };
  }

  async _resolveHoldingBackChoice(move, options = {}) {
    if (!move || move.type !== "move" || !this._moveUsesPrimaryDamage(move)) {
      return "none";
    }

    const normalizedOption = `${options.holdingBack ?? ""}`.trim().toLowerCase();
    if (normalizedOption === "none" || normalizedOption === "half" || normalizedOption === "lethal") {
      return normalizedOption;
    }

    if (options.promptHoldingBack === false) {
      return "none";
    }

    return new Promise((resolve) => {
      const buttons = {
        normal: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackNormal"),
          callback: () => resolve("none")
        },
        half: {
          icon: "<i class='fas fa-hand-paper'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackHalf"),
          callback: () => resolve("half")
        },
        lethal: {
          icon: "<i class='fas fa-skull'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackLethal"),
          callback: () => resolve("lethal")
        }
      };

      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.HoldingBackTitle"),
        content: `
          <div class="pok-role-holding-back-dialog">
            <p class="dialog-intro">${game.i18n.format("POKROLE.Combat.HoldingBackPrompt", {
              move: move.name
            })}</p>
          </div>
        `,
        buttons,
        default: "normal",
        close: () => resolve("none")
      }, { classes: ["pok-role-dialog", "pok-role-holding-back-app"] }).render(true);
    });
  }

  _getShieldMoveAccuracyPenalty(roundKey = null) {
    const state = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
    const currentRoundKey = roundKey ?? this._getCurrentRoundKey(0);
    if (!currentRoundKey) return 0;
    const lastRoundKey = `${state?.lastRoundKey ?? ""}`.trim();
    const streak = Math.max(Math.floor(toNumber(state?.streak, 0)), 0);
    if (!lastRoundKey || !streak) return 0;
    const [combatId, roundText] = currentRoundKey.split(":");
    const [lastCombatId, lastRoundText] = lastRoundKey.split(":");
    if (!combatId || !lastCombatId || combatId !== lastCombatId) return 0;
    const currentRound = Math.floor(toNumber(roundText, 0));
    const lastRound = Math.floor(toNumber(lastRoundText, 0));
    if (currentRound - lastRound !== 1) return 0;
    return Math.max(streak, 0) * 2;
  }

  async _registerShieldMoveUsage(roundKey = null) {
    const currentRoundKey = roundKey ?? this._getCurrentRoundKey(0);
    if (!currentRoundKey) return;
    const state = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
    const lastRoundKey = `${state?.lastRoundKey ?? ""}`.trim();
    let nextStreak = 1;
    const [combatId, roundText] = currentRoundKey.split(":");
    const [lastCombatId, lastRoundText] = lastRoundKey.split(":");
    if (combatId && lastCombatId && combatId === lastCombatId) {
      const currentRound = Math.floor(toNumber(roundText, 0));
      const lastRound = Math.floor(toNumber(lastRoundText, 0));
      if (currentRound - lastRound === 1) {
        nextStreak = Math.max(Math.floor(toNumber(state?.streak, 0)), 0) + 1;
      }
    }
    await this.setFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY, {
      lastRoundKey: currentRoundKey,
      streak: nextStreak
    });
  }

  _normalizeShieldMoveProfile(profile = {}) {
    const normalizedCategories = Array.isArray(profile?.protectsCategories)
      ? profile.protectsCategories
          .map((entry) => this._normalizeMoveCombatCategory(entry))
          .filter((entry) => entry === "physical" || entry === "special")
      : [];
    const retaliation = profile?.retaliation && typeof profile.retaliation === "object"
      ? {
          mode: ["condition", "stat", "damage"].includes(`${profile.retaliation.mode ?? ""}`.trim().toLowerCase())
            ? `${profile.retaliation.mode}`.trim().toLowerCase()
            : "damage",
          condition: this._normalizeConditionVariantKey(profile.retaliation.condition),
          stat: this._normalizeSecondaryStatKey(profile.retaliation.stat),
          amount: Math.floor(toNumber(profile.retaliation.amount, 0)),
          ignoreDefenses: Boolean(profile.retaliation.ignoreDefenses)
        }
      : null;
    return {
      damageReduction: Math.max(Math.floor(toNumber(profile?.damageReduction, 0)), 0),
      protectsCategories: [...new Set(normalizedCategories)],
      requiresPriority: Boolean(profile?.requiresPriority),
      blocksAddedEffects: Boolean(profile?.blocksAddedEffects),
      blockEffectsRequiresPriority: Boolean(profile?.blockEffectsRequiresPriority),
      endureAtOne: Boolean(profile?.endureAtOne),
      retaliation
    };
  }

  _buildShieldMoveProfile(move) {
    if (!move || !move.system?.shieldMove) return null;

    const seedId = this._getMoveSeedId(move);
    const rawDescription = `${move.system?.description ?? ""}`.trim();
    const lowerDescription = rawDescription.toLowerCase();
    const overrideProfile = seedId ? SHIELD_MOVE_PROFILE_OVERRIDES[seedId] ?? null : null;
    const genericProfile = {
      damageReduction: 0,
      protectsCategories: [],
      requiresPriority: false,
      blocksAddedEffects: false,
      blockEffectsRequiresPriority: false,
      endureAtOne: false,
      retaliation: null
    };

    const reductionMatch = /reduce\s+(\d+)\s+damage/i.exec(rawDescription);
    if (reductionMatch) {
      genericProfile.damageReduction = Math.max(Math.floor(toNumber(reductionMatch[1], 0)), 0);
    } else if (lowerDescription.includes("shield move")) {
      genericProfile.damageReduction = 3;
    }

    if (
      lowerDescription.includes("physical or special move") ||
      lowerDescription.includes("damaging move")
    ) {
      genericProfile.protectsCategories = ["physical", "special"];
    }

    if (lowerDescription.includes("with priority")) {
      genericProfile.requiresPriority = true;
    }

    if (lowerDescription.includes("negate the added effects")) {
      genericProfile.blocksAddedEffects = true;
      genericProfile.blockEffectsRequiresPriority = lowerDescription.includes("reaction and late reaction");
    }

    if (lowerDescription.includes("remain at 1 hp")) {
      genericProfile.endureAtOne = true;
    }

    return this._normalizeShieldMoveProfile({
      ...genericProfile,
      ...(overrideProfile ?? {})
    });
  }

  _normalizeShieldEntry(entry = {}) {
    const roundKey = `${entry?.roundKey ?? ""}`.trim();
    return {
      id: `${entry?.id ?? foundry.utils.randomID()}`.trim(),
      roundKey,
      sourceActorId: `${entry?.sourceActorId ?? ""}`.trim(),
      sourceActorName: `${entry?.sourceActorName ?? ""}`.trim(),
      moveId: `${entry?.moveId ?? ""}`.trim(),
      moveName: `${entry?.moveName ?? ""}`.trim(),
      moveSeedId: `${entry?.moveSeedId ?? ""}`.trim().toLowerCase(),
      damageReduction: Math.max(Math.floor(toNumber(entry?.damageReduction, 0)), 0),
      protectsCategories: Array.isArray(entry?.protectsCategories)
        ? [...new Set(entry.protectsCategories
            .map((value) => this._normalizeMoveCombatCategory(value))
            .filter((value) => value === "physical" || value === "special"))]
        : [],
      requiresPriority: Boolean(entry?.requiresPriority),
      blocksAddedEffects: Boolean(entry?.blocksAddedEffects),
      blockEffectsRequiresPriority: Boolean(entry?.blockEffectsRequiresPriority),
      endureAtOne: Boolean(entry?.endureAtOne),
      endureSpent: Boolean(entry?.endureSpent),
      retaliation:
        entry?.retaliation && typeof entry.retaliation === "object"
          ? {
              mode: ["condition", "stat", "damage"].includes(`${entry.retaliation.mode ?? ""}`.trim().toLowerCase())
                ? `${entry.retaliation.mode}`.trim().toLowerCase()
                : "damage",
              condition: this._normalizeConditionVariantKey(entry.retaliation.condition),
              stat: this._normalizeSecondaryStatKey(entry.retaliation.stat),
              amount: Math.floor(toNumber(entry.retaliation.amount, 0)),
              ignoreDefenses: Boolean(entry.retaliation.ignoreDefenses)
            }
          : null
    };
  }

  _getActiveShieldEntries(roundKey = null) {
    const targetRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    const rawEntries = this.getFlag(POKROLE.ID, ACTIVE_SHIELDS_FLAG_KEY) ?? [];
    const normalizedEntries = (Array.isArray(rawEntries) ? rawEntries : [])
      .map((entry) => this._normalizeShieldEntry(entry))
      .filter((entry) => entry.roundKey);
    if (!targetRoundKey) return normalizedEntries;
    return normalizedEntries.filter((entry) => entry.roundKey === targetRoundKey);
  }

  async _setActiveShieldEntries(entries = []) {
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
      .map((entry) => this._normalizeShieldEntry(entry))
      .filter((entry) => entry.roundKey);
    await this.setFlag(POKROLE.ID, ACTIVE_SHIELDS_FLAG_KEY, normalizedEntries);
  }

  async _registerShieldProtectionFromMove(move, protectedActors = [], roundKey = null) {
    const currentRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey || !move?.system?.shieldMove) return null;

    const shieldProfile = this._buildShieldMoveProfile(move);
    const hasProtection =
      shieldProfile &&
      (shieldProfile.damageReduction > 0 ||
        shieldProfile.blocksAddedEffects ||
        shieldProfile.endureAtOne ||
        shieldProfile.retaliation);
    if (!hasProtection) return shieldProfile;

    const uniqueTargets = new Map();
    for (const actor of protectedActors ?? []) {
      const actorId = `${actor?.id ?? ""}`.trim();
      if (!actorId) continue;
      if (!uniqueTargets.has(actorId)) uniqueTargets.set(actorId, actor);
    }

    const entryPayload = {
      roundKey: currentRoundKey,
      sourceActorId: this.id,
      sourceActorName: this.name ?? "",
      moveId: move.id ?? "",
      moveName: move.name ?? "",
      moveSeedId: this._getMoveSeedId(move),
      damageReduction: shieldProfile.damageReduction,
      protectsCategories: shieldProfile.protectsCategories,
      requiresPriority: shieldProfile.requiresPriority,
      blocksAddedEffects: shieldProfile.blocksAddedEffects,
      blockEffectsRequiresPriority: shieldProfile.blockEffectsRequiresPriority,
      endureAtOne: shieldProfile.endureAtOne,
      retaliation: shieldProfile.retaliation
    };

    for (const protectedActor of uniqueTargets.values()) {
      if (!(protectedActor instanceof PokRoleActor)) continue;
      const currentEntries = protectedActor._getActiveShieldEntries(currentRoundKey).filter((entry) => {
        if (entry.moveId !== entryPayload.moveId) return true;
        return entry.sourceActorId !== entryPayload.sourceActorId;
      });
      currentEntries.push({
        ...entryPayload,
        id: foundry.utils.randomID()
      });
      await protectedActor._setActiveShieldEntries(currentEntries);
    }

    await this.unsetFlag(POKROLE.ID, "combat.shieldActiveRound");
    return shieldProfile;
  }

  _buildShieldAttackContext(move, attackerActor, roundKey = null, isDamagingMove = false) {
    const moveCategory = this._normalizeMoveCombatCategory(move?.system?.category);
    const movePriority = Math.floor(toNumber(move?.system?.priority, 0));
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    return {
      move,
      attackerActor,
      roundKey: `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim(),
      category: moveCategory,
      isDamagingMove: Boolean(isDamagingMove),
      isRanged: this._isMoveRanged(move),
      priority: movePriority,
      hasPriority: movePriority !== 0,
      destroysShield: Boolean(moveSourceAttributes?.destroyShield)
    };
  }

  _shieldEntryMatchesDamage(entry, attackContext) {
    if (!entry || !attackContext?.isDamagingMove) return false;
    if (!(attackContext.category === "physical" || attackContext.category === "special")) return false;
    if (!entry.protectsCategories.includes(attackContext.category)) return false;
    if (entry.requiresPriority && !attackContext.hasPriority) return false;
    return true;
  }

  _shieldEntryBlocksEffects(entry, attackContext) {
    if (!entry?.blocksAddedEffects) return false;
    if (entry.blockEffectsRequiresPriority && !attackContext?.hasPriority) return false;
    return true;
  }

  _shieldEntryCanRetaliate(entry, attackContext) {
    if (!entry?.retaliation) return false;
    if (!attackContext?.isDamagingMove) return false;
    if (attackContext.category !== "physical") return false;
    return !attackContext.isRanged;
  }

  async _resolveShieldResponseForAttack(attackContext = {}) {
    const currentRoundKey = `${attackContext?.roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey) {
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }

    const activeEntries = this._getActiveShieldEntries(currentRoundKey);
    if (!activeEntries.length) {
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }

    if (attackContext?.destroysShield) {
      await this._setActiveShieldEntries([]);
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: true
      };
    }

    const damageEntries = activeEntries.filter((entry) => this._shieldEntryMatchesDamage(entry, attackContext));
    const effectEntries = activeEntries.filter((entry) => this._shieldEntryBlocksEffects(entry, attackContext));
    const endureEntry =
      damageEntries.find((entry) => entry.endureAtOne && !entry.endureSpent) ?? null;
    const retaliationEntries = damageEntries.filter((entry) => this._shieldEntryCanRetaliate(entry, attackContext));
    return {
      entries: [...new Set([...damageEntries, ...effectEntries])],
      damageReduction: damageEntries.reduce(
        (highest, entry) => Math.max(highest, Math.max(toNumber(entry.damageReduction, 0), 0)),
        0
      ),
      blocksAddedEffects: effectEntries.length > 0,
      endureEntry,
      retaliationEntries,
      shieldRemoved: false
    };
  }

  async _markShieldEndureSpent(entryId, roundKey = null) {
    const currentRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey || !entryId) return;
    const activeEntries = this._getActiveShieldEntries(currentRoundKey);
    const nextEntries = activeEntries.map((entry) =>
      entry.id === entryId ? { ...entry, endureSpent: true } : entry
    );
    await this._setActiveShieldEntries(nextEntries);
  }

  async _applyShieldRetaliations(response = {}, attackContext = {}) {
    const retaliationEntries = Array.isArray(response?.retaliationEntries)
      ? response.retaliationEntries
      : [];
    if (!retaliationEntries.length) return [];

    const attackerActor = attackContext?.attackerActor ?? null;
    if (!(attackerActor instanceof PokRoleActor)) return [];

    const retaliationDetails = [];
    for (const entry of retaliationEntries) {
      const retaliation = entry?.retaliation ?? null;
      if (!retaliation) continue;
      const shieldMoveDocument =
        entry.sourceActorId === this.id && this.items
          ? this.items.get(entry.moveId) ?? attackContext?.move
          : attackContext?.move;

      let applyResult = { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
      if (retaliation.mode === "condition") {
        applyResult = await this._applyConditionEffectToActor(
          {
            effectType: "condition",
            condition: retaliation.condition,
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          attackerActor,
          shieldMoveDocument,
          {
            sourceActor: this
          }
        );
      } else if (retaliation.mode === "stat") {
        applyResult = await this._applyStatEffectToActor(
          {
            effectType: "stat",
            stat: retaliation.stat,
            amount: retaliation.amount,
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          attackerActor,
          shieldMoveDocument
        );
      } else if (retaliation.mode === "damage") {
        const hpChange = await this._safeApplyDamage(
          attackerActor,
          Math.max(Math.floor(toNumber(retaliation.amount, 0)), 0)
        );
        applyResult = hpChange
          ? {
              applied: true,
              detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
                before: hpChange.hpBefore,
                after: hpChange.hpAfter
              })
            }
          : { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
      }

      retaliationDetails.push({
        shieldName: entry.moveName,
        targetName: attackerActor.name,
        applied: applyResult.applied,
        detail: applyResult.detail
      });
    }
    return retaliationDetails;
  }

  _sanitizeShieldMoveSecondaryEffects(move, effectList = []) {
    if (!move?.system?.shieldMove || !Array.isArray(effectList) || effectList.length === 0) {
      return effectList;
    }
    const shieldProfile = this._buildShieldMoveProfile(move);
    const retaliation = shieldProfile?.retaliation ?? null;
    if (!retaliation) return effectList;

    return effectList.filter((effect) => {
      const targetMode = `${effect?.target ?? "target"}`.trim().toLowerCase();
      if (targetMode !== "self") return true;
      const effectType = this._normalizeSecondaryEffectType(effect?.effectType);
      if (retaliation.mode === "condition") {
        return !(effectType === "condition" && this._normalizeConditionVariantKey(effect?.condition) === retaliation.condition);
      }
      if (retaliation.mode === "stat") {
        return !(
          effectType === "stat" &&
          this._normalizeSecondaryStatKey(effect?.stat) === retaliation.stat &&
          Math.floor(toNumber(effect?.amount, 0)) === retaliation.amount
        );
      }
      if (retaliation.mode === "damage") {
        return !(effectType === "damage" && Math.floor(toNumber(effect?.amount, 0)) === retaliation.amount);
      }
      return true;
    });
  }

  _formatShieldEntryNameList(entries = []) {
    const names = [...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => `${entry?.moveName ?? ""}`.trim())
        .filter(Boolean)
    )];
    return names.join(", ");
  }

  _computeClashDamage(moveType, targetActor) {
    const interaction = this._evaluateTypeInteraction(moveType, targetActor);
    if (interaction.immune) return 0;
    return Math.max(1 + interaction.weaknessBonus - interaction.resistancePenalty, 1);
  }

  _isSocialAccuracyMove(move) {
    return SOCIAL_ATTRIBUTE_KEYS.includes(move.system.accuracyAttribute);
  }

  _getGearStatusEffects(gearItem) {
    if (gearItem.system.status?.all) {
      return ["All"];
    }

    const statusKeys = [
      ["poison", "Poison"],
      ["sleep", "Sleep"],
      ["burn", "Burn"],
      ["frozen", "Frozen"],
      ["paralysis", "Paralysis"],
      ["confusion", "Confusion"]
    ];
    return statusKeys
      .filter(([statusKey]) => gearItem.system.status?.[statusKey])
      .map(([, labelKey]) => labelKey);
  }

  async _consumeGearItem(gearItem) {
    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    const unitsMax = Math.max(toNumber(gearItem.system.units?.max, 0), 0);
    let unitsValue = Math.max(toNumber(gearItem.system.units?.value, 0), 0);

    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const updates = {};
    let nextQuantity = quantity;
    let nextUnitsValue = unitsValue;

    if (unitsMax > 0) {
      if (nextUnitsValue <= 0 && nextQuantity > 0) {
        nextUnitsValue = unitsMax;
      }
      nextUnitsValue = Math.max(nextUnitsValue - 1, 0);
      if (nextUnitsValue === 0) {
        nextQuantity = Math.max(nextQuantity - 1, 0);
        if (nextQuantity > 0) {
          nextUnitsValue = unitsMax;
        }
      }
      updates["system.units.value"] = nextUnitsValue;
      updates["system.quantity"] = nextQuantity;
    } else {
      nextQuantity = Math.max(nextQuantity - 1, 0);
      updates["system.quantity"] = nextQuantity;
    }

    await gearItem.update(updates);

    return {
      quantity: nextQuantity,
      unitsValue: nextUnitsValue,
      unitsMax
    };
  }

  async resetActionCounter(options = {}) {
    await this.resetTurnState({ ...options, resetInitiative: false });
  }

  async resetTurnState(options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const updates = {};
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      updates["system.combat.actionNumber"] = 1;
    }
    if (options.resetInitiative !== false) {
      const currentInitiative = Math.max(toNumber(this.system.combat?.initiative, 0), 0);
      if (currentInitiative !== 0) {
        updates["system.combat.initiative"] = 0;
      }
    }
    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
  }

  async _resolveActionRequirement(actionNumber, roundKey) {
    await this._resetActionCounterForRound(roundKey);
    if (actionNumber !== null && actionNumber !== undefined) {
      return clamp(toNumber(actionNumber, 1), 1, 5);
    }
    return clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
  }

  async _resetActionCounterForRound(roundKey) {
    if (!roundKey) return;
    const lastActionRound = this.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND);
    if (lastActionRound === roundKey) return;

    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      await this.update({ "system.combat.actionNumber": 1 });
    }
    await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
  }

  async _advanceActionCounter(actionNumber, roundKey) {
    const nextActionNumber = clamp(toNumber(actionNumber, 1) + 1, 1, 5);
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (nextActionNumber !== currentActionNumber) {
      await this.update({ "system.combat.actionNumber": nextActionNumber });
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
    await this.processTemporaryEffectSpecialDuration("next-action", {
      combatId: game.combat?.id ?? null
    });
  }

  _canUseReactionThisRound(reactionType, roundKey) {
    if (!roundKey) return true;
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    const usedRound = this.getFlag(POKROLE.ID, flagKey);
    return usedRound !== roundKey;
  }

  async _markReactionUsedThisRound(reactionType, roundKey) {
    if (!roundKey) return;
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    await this.setFlag(POKROLE.ID, flagKey, roundKey);
  }

  async _safeApplyDamage(targetActor, damage, options = {}) {
    const normalizedDamage = Math.max(toNumber(damage, 0), 0);
    if (!targetActor || normalizedDamage <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpAfter = Math.max(hpValue - normalizedDamage, 0);
    const applyDeadOnZero = Boolean(options?.applyDeadOnZero);
    const isLethalKo = applyDeadOnZero && hpAfter <= 0;
    if (isLethalKo) {
      targetActor.__pokrolePendingDeadSync = true;
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
      if (isLethalKo) {
        if (
          typeof targetActor._setConditionFlagState === "function" &&
          typeof targetActor._ensureConditionEffectFromFlag === "function"
        ) {
          await targetActor._setConditionFlagState(targetActor, "dead", true);
          await targetActor._ensureConditionEffectFromFlag(targetActor, "dead");
        } else if (typeof targetActor.toggleQuickCondition === "function") {
          await targetActor.toggleQuickCondition("dead", { active: true });
        }
        if (typeof targetActor.toggleQuickCondition === "function" && targetActor._isConditionActive?.("fainted")) {
          await targetActor.toggleQuickCondition("fainted", { active: false });
        }
      }
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply damage`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    } finally {
      if (isLethalKo) {
        delete targetActor.__pokrolePendingDeadSync;
      }
    }

    return {
      hpBefore: hpValue,
      hpAfter
    };
  }

  _evaluateTypeInteractionAgainstTypes(moveType, defenderTypes = []) {
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    const normalizedDefenderTypes = defenderTypes.map((entry) => this._normalizeTypeKey(entry));
    if (!normalizedMoveType || normalizedMoveType === "none") {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const table = TYPE_EFFECTIVENESS[normalizedMoveType];
    if (!table) {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    let weaknessBonus = 0;
    let resistancePenalty = 0;
    let immune = false;

    for (const defenderType of normalizedDefenderTypes) {
      if (table.immune.includes(defenderType)) immune = true;
      if (table.double.includes(defenderType)) weaknessBonus += 1;
      if (table.half.includes(defenderType)) resistancePenalty += 1;
    }

    const activeWeather = this.getActiveWeatherKey();
    if (
      activeWeather === "strong-winds" &&
      normalizedDefenderTypes.includes("flying") &&
      ["electric", "ice", "rock"].includes(normalizedMoveType)
    ) {
      weaknessBonus = Math.max(weaknessBonus - 1, 0);
      resistancePenalty = Math.max(resistancePenalty - 1, 0);
    }

    let label = "POKROLE.Chat.TypeEffect.Neutral";
    if (immune) {
      label = "POKROLE.Chat.TypeEffect.Immune";
    } else if (weaknessBonus > resistancePenalty) {
      label = "POKROLE.Chat.TypeEffect.Super";
    } else if (resistancePenalty > weaknessBonus) {
      label = "POKROLE.Chat.TypeEffect.Resisted";
    }

    return {
      immune,
      weaknessBonus,
      resistancePenalty,
      label
    };
  }

  _evaluateTypeInteraction(moveType, targetActor) {
    const defenderTypes = [
      targetActor?.system?.types?.primary,
      targetActor?.system?.types?.secondary
    ].filter((typeKey) => typeKey && typeKey !== "none");
    const interaction = this._evaluateTypeInteractionAgainstTypes(moveType, defenderTypes);
    // Ring Target: remove type immunities from the defender
    if (interaction.immune && targetActor?._getHeldItemData?.()?.removeTypeImmunities) {
      interaction.immune = false;
      interaction.label = interaction.weaknessBonus > interaction.resistancePenalty
        ? "POKROLE.Chat.TypeEffect.Super"
        : interaction.resistancePenalty > interaction.weaknessBonus
          ? "POKROLE.Chat.TypeEffect.Resisted"
          : "POKROLE.Chat.TypeEffect.Neutral";
    }
    return interaction;
  }

  _getTargetDefense(targetActor, category) {
    if (targetActor instanceof PokRoleActor) {
      return targetActor.getDefense(category);
    }

    const fallbackDefense =
      category === "special"
        ? toNumber(targetActor.system?.attributes?.insight, 0)
        : toNumber(targetActor.system?.attributes?.vitality, 0);
    return Math.max(fallbackDefense, 0);
  }

  _normalizeMovePrimaryMode(value) {
    const normalized = `${value ?? "damage"}`.trim().toLowerCase();
    return normalized === "effect-only" ? "effect-only" : "damage";
  }

  _moveUsesPrimaryDamage(move) {
    const moveSystem = move?.system ?? move ?? {};
    const normalizedCategory = `${moveSystem?.category ?? "physical"}`.trim().toLowerCase();
    if (normalizedCategory === "support") return false;
    return this._normalizeMovePrimaryMode(moveSystem?.primaryMode) === "damage";
  }

  _moveShouldAutoHoldBackFromInfatuation(moveTargetKey) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    return [
      "foe",
      "random-foe",
      "all-foes",
      "area",
      "foe-battlefield",
      "battlefield-area"
    ].includes(normalizedTarget);
  }

  _buildFormulaEntityContext(actor = null) {
    const entity = actor ?? null;
    const context = {
      hpCurrent: Math.max(toNumber(entity?.system?.resources?.hp?.value, 0), 0),
      hpMax: Math.max(toNumber(entity?.system?.resources?.hp?.max, 0), 0),
      willCurrent: Math.max(toNumber(entity?.system?.resources?.will?.value, 0), 0),
      willMax: Math.max(toNumber(entity?.system?.resources?.will?.max, 0), 0),
      hp: Math.max(toNumber(entity?.system?.resources?.hp?.value, 0), 0),
      will: Math.max(toNumber(entity?.system?.resources?.will?.value, 0), 0),
      happiness: Math.max(toNumber(entity?.system?.happiness, 0), 0),
      loyalty: Math.max(toNumber(entity?.system?.loyalty, 0), 0),
      confidence: Math.max(toNumber(entity?.system?.confidence, 0), 0),
      battles: Math.max(toNumber(entity?.system?.battles, 0), 0),
      victories: Math.max(toNumber(entity?.system?.victories, 0), 0),
      primaryType: this._normalizeTypeKey(entity?.system?.types?.primary || "none"),
      secondaryType: this._normalizeTypeKey(entity?.system?.types?.secondary || "none")
    };

    for (const [key, value] of Object.entries(entity?.system?.attributes ?? {})) {
      context[key] = Math.max(toNumber(value, 0), 0);
    }
    for (const [key, value] of Object.entries(entity?.system?.skills ?? {})) {
      context[key] = Math.max(toNumber(value, 0), 0);
    }

    return context;
  }

  _buildMoveFormulaContext(move, targetActor = null, extras = {}) {
    const combat = game.combat ?? null;
    return {
      source: this._buildFormulaEntityContext(this),
      target: this._buildFormulaEntityContext(targetActor),
      move: {
        power: Math.max(toNumber(move?.system?.power, 0), 0),
        willCost: Math.max(toNumber(move?.system?.willCost, 0), 0),
        priority: toNumber(move?.system?.priority, 0),
        category: `${move?.system?.category ?? ""}`.trim().toLowerCase(),
        type: this._normalizeTypeKey(move?.system?.type || "none")
      },
      action: {
        number: Math.max(toNumber(extras?.actionNumber, 1), 1)
      },
      combat: {
        round: Math.max(toNumber(combat?.round, 0), 0),
        turn: Math.max(toNumber(combat?.turn, 0), 0)
      }
    };
  }

  _resolveMoveAccuracySetup(move, targetActor = null, actionNumber = 1) {
    const accuracyFormula = `${move?.system?.accuracyFormula ?? ""}`.trim();
    if (accuracyFormula) {
      const accuracyDicePoolBase = Math.max(
        Math.floor(
          evaluateNumericFormula(
            accuracyFormula,
            this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
            0
          )
        ),
        0
      );
      return {
        accuracyAttributeKey: "",
        accuracySkillKey: "",
        accuracyDicePoolBase,
        accuracyAttributeLabel: game.i18n.localize("POKROLE.Move.Formula.Label"),
        accuracySkillLabel: accuracyFormula,
        accuracySummaryLabel: accuracyFormula
      };
    }

    const accuracyAttributeKey = move?.system?.accuracyAttribute || "dexterity";
    const accuracySkillKey = move?.system?.accuracySkill || "brawl";
    return {
      accuracyAttributeKey,
      accuracySkillKey,
      accuracyDicePoolBase:
        this.getTraitValue(accuracyAttributeKey) + this.getSkillValue(accuracySkillKey),
      accuracyAttributeLabel: this.localizeTrait(accuracyAttributeKey),
      accuracySkillLabel: this.localizeTrait(accuracySkillKey),
      accuracySummaryLabel: `${this.localizeTrait(accuracyAttributeKey)} + ${this.localizeTrait(
        accuracySkillKey
      )}`
    };
  }

  _resolveMovePower(move, targetActor = null, actionNumber = 1) {
    let basePower;
    const powerFormula = `${move?.system?.powerFormula ?? ""}`.trim();
    if (powerFormula) {
      basePower = Math.max(
        Math.floor(
          evaluateNumericFormula(
            powerFormula,
            this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
            move?.system?.power ?? 0
          )
        ),
        0
      );
    } else {
      basePower = Math.max(toNumber(move?.system?.power, 0), 0);
    }
    // Choice Band / Choice Specs / Choice Scarf: power bonus/penalty
    const choiceHeld = this._getHeldItemData();
    if (choiceHeld?.choiceType) {
      const lockedMoveId = this.getFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG) ?? null;
      if (lockedMoveId === move?.id) {
        basePower += toNumber(choiceHeld.choicePowerBonus, 3);
      } else if (lockedMoveId) {
        basePower = Math.max(basePower + toNumber(choiceHeld.choicePowerPenalty, -3), 0);
      }
    }
    return basePower;
  }

  _resolveMoveDamageBase(move, targetActor = null, actionNumber = 1) {
    const damageBaseFormula = `${move?.system?.damageBaseFormula ?? ""}`.trim();
    if (damageBaseFormula) {
      return {
        value: Math.max(
          Math.floor(
            evaluateNumericFormula(
              damageBaseFormula,
              this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
              0
            )
          ),
          0
        ),
        label: game.i18n.localize("POKROLE.Move.Formula.Label"),
        ignoresPainPenalty: false
      };
    }

    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    return {
      value: Math.max(this.getTraitValue(damageAttributeKey), 0),
      label: this.localizeTrait(damageAttributeKey),
      ignoresPainPenalty: damageAttributeKey === "vitality"
    };
  }

  _resolveDamageAttributeKey(move) {
    const configuredAttribute = move.system.damageAttribute || "auto";
    if (configuredAttribute !== "auto") return configuredAttribute;
    return move.system.category === "special" ? "special" : "strength";
  }

  async _rollSuccessPool({
    dicePool,
    removedSuccesses = 0,
    requiredSuccesses = 1,
    flavor
  }) {
    const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
    const roll = await new Roll(successPoolFormula(normalizedDicePool)).evaluate({
      async: true
    });
    const rawSuccesses = toNumber(roll.total, 0);
    const netSuccesses = rawSuccesses - Math.max(toNumber(removedSuccesses, 0), 0);
    const success = netSuccesses >= Math.max(toNumber(requiredSuccesses, 1), 1);
    const resolvedFlavor =
      flavor ??
      game.i18n.format("POKROLE.Chat.GenericRollFlavor", {
        actor: this.name
      });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${resolvedFlavor}<br><small>${game.i18n.format(
        "POKROLE.Chat.RollBreakdown",
        {
          raw: rawSuccesses,
          removed: removedSuccesses,
          net: netSuccesses,
          required: requiredSuccesses
        }
      )} (${success ? game.i18n.localize("POKROLE.Common.Hit") : game.i18n.localize("POKROLE.Common.Miss")})</small>`
    });

    return {
      roll,
      rawSuccesses,
      netSuccesses,
      requiredSuccesses,
      success
    };
  }
}

export class PokRoleItem extends Item {}
