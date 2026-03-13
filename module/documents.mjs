import {
  COMBAT_FLAG_KEYS,
  getSystemAssetPath,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
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

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function successPoolFormula(dicePool) {
  const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
  return `${normalizedDicePool}d6cs>=${POKROLE.SUCCESS_TARGET}`;
}

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
  ...MOVE_SECONDARY_CONDITION_KEYS.filter((conditionKey) => conditionKey !== "none"),
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
  "badly-poisoned": "icons/svg/skull.svg"
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
const WEATHER_FLAG_KEY = "combat.weather";
const TRAINER_STATE_FLAG_KEY = "combat.trainerState";
const HEALING_TRACK_FLAG_KEY = "combat.healingTrack";
const TREATMENT_BLOCK_FLAG_KEY = "combat.treatmentBlockedRound";
const SHIELD_STREAK_FLAG_KEY = "combat.shieldStreak";
const SLEEP_RESIST_TRACK_FLAG_KEY = "combat.sleepResistTrack";
const SPECIAL_WEATHER_KEYS = Object.freeze(["harsh-sunlight", "typhoon", "strong-winds"]);
const BASIC_WEATHER_KEYS = Object.freeze(["sunny", "rain", "sandstorm", "hail"]);

export class PokRoleActor extends Actor {
  getRollData() {
    const rollData = super.getRollData();
    rollData.system = foundry.utils.deepClone(this.system);
    return rollData;
  }

  getTraitValue(traitKey) {
    if (!traitKey || traitKey === "none") return 0;
    return toNumber(this.system.attributes?.[traitKey], Number.NaN);
  }

  getInitiativeScore() {
    const dexterity = this.getTraitValue("dexterity");
    const alert = this.getSkillValue("alert");
    return Math.max(toNumber(dexterity, 0) + toNumber(alert, 0), 0);
  }

  getDefense(category = "physical") {
    if (category === "special") {
      return Math.max(this.getTraitValue("insight"), 0);
    }
    return Math.max(this.getTraitValue("vitality"), 0);
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

  getActiveWeatherKey() {
    const combat = game.combat;
    if (!combat) return "none";
    const weatherData = combat.getFlag(POKROLE.ID, WEATHER_FLAG_KEY) ?? {};
    return this._normalizeWeatherKey(weatherData?.condition);
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
    if (weather === "sunny" || weather === "harsh-sunlight") {
      return moveType === "fire" ? 1 : 0;
    }
    if (weather === "rain" || weather === "typhoon") {
      return moveType === "water" ? 1 : 0;
    }
    if (weather === "strong-winds") {
      return moveType === "flying" ? 1 : 0;
    }
    return 0;
  }

  _getWeatherFlatDamageReduction(moveType, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    if (weather === "sunny" && moveType === "water") return 1;
    if (weather === "rain" && moveType === "fire") return 1;
    return 0;
  }

  _getWeatherDefenseBonus(targetActor, category, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    if (!targetActor || weather === "none") return 0;
    if (weather === "sandstorm" && category === "special" && targetActor.hasType?.("rock")) {
      return 1;
    }
    if (weather === "hail" && category !== "special" && targetActor.hasType?.("ice")) {
      return 1;
    }
    return 0;
  }

  _isMoveRanged(move) {
    const rangeMode = this._normalizeMoveRangeMode(move?.system?.rangeMode);
    return ["meters", "scene", "battlefield", "custom"].includes(rangeMode);
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

  async processTurnStartStatusAutomation() {
    if (!game.combat) return { processed: false, results: [] };

    const results = [];
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
      const frozenResist = await this._attemptConditionResistThisRound("frozen", 2);
      if (frozenResist?.resisted) {
        await clearConditionWithNotice("frozen");
      }
      results.push({ condition: "frozen", resolved: Boolean(frozenResist?.resisted) });
    }

    if (this._isConditionActive("infatuated")) {
      const infatuatedResist = await this._attemptConditionResistThisRound("infatuated", 2);
      if (infatuatedResist?.resisted) {
        await clearConditionWithNotice("infatuated");
      }
      results.push({ condition: "infatuated", resolved: Boolean(infatuatedResist?.resisted) });
    }

    if (this._isConditionActive("confused")) {
      const confusedResist = await this._attemptConditionResistThisRound("confused", 2);
      if (confusedResist?.resisted) {
        await clearConditionWithNotice("confused");
      }
      results.push({ condition: "confused", resolved: Boolean(confusedResist?.resisted) });
    }

    return { processed: true, results };
  }

  async _assertCanAct(actionType = "generic") {
    if (!game.combat) return { allowed: true, reason: "" };

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
      const frozenResist = await this._attemptConditionResistThisRound("frozen", 2);
      if (frozenResist?.resisted) {
        await this.toggleQuickCondition("frozen", { active: false });
        ui.notifications.info(
          game.i18n.format("POKROLE.Chat.ConditionCleared", {
            condition: this._localizeConditionName("frozen")
          })
        );
      } else {
        return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFrozen") };
      }
    }

    if (this._isConditionActive("infatuated")) {
      const infatuatedResist = await this._attemptConditionResistThisRound("infatuated", 2);
      if (infatuatedResist?.resisted) {
        await this.toggleQuickCondition("infatuated", { active: false });
        ui.notifications.info(
          game.i18n.format("POKROLE.Chat.ConditionCleared", {
            condition: this._localizeConditionName("infatuated")
          })
        );
      }
    }

    if (this._isConditionActive("confused")) {
      const confusedResist = await this._attemptConditionResistThisRound("confused", 2);
      if (confusedResist?.resisted) {
        await this.toggleQuickCondition("confused", { active: false });
        ui.notifications.info(
          game.i18n.format("POKROLE.Chat.ConditionCleared", {
            condition: this._localizeConditionName("confused")
          })
        );
      }
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

    if (actionType === "move" && this._isConditionActive("disabled")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorMoveDisabled") };
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
    const rolledInitiative = Math.max(toNumber(roll.total, 0), 0);
    await this.update({ "system.combat.initiative": rolledInitiative });

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
    if (!this._moveUsesPrimaryDamage(move)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashNeedsDamagingMove"));
      return null;
    }

    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const removedSuccesses = hasPainPenaltyException(damageAttributeKey, "clash")
      ? 0
      : this.getPainPenalty();

    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue(damageAttributeKey) + this.getSkillValue("clash"),
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

    return {
      ...result,
      move
    };
  }

  async rollMove(moveId, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const actionCheck = await this._assertCanAct("move");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    let holdingBackMode = await this._resolveHoldingBackChoice(move, options);
    if (holdingBackMode === null) return null;
    const infatuated = this._isConditionActive("infatuated");
    if (infatuated && holdingBackMode === "none") {
      holdingBackMode = "half";
    }
    const isHoldingBackHalf = holdingBackMode === "half";
    const isHoldingBackNonLethal = holdingBackMode === "nonlethal" && Boolean(move.system.lethal);
    const canInflictDeathOnKo =
      Boolean(move.system?.lethal) && !isHoldingBackHalf && !isHoldingBackNonLethal;
    const actionNumber = await this._resolveActionRequirement(options.actionNumber, roundKey);
    const activeWeather = this.getActiveWeatherKey();
    const moveType = move.system.type || "normal";
    const weatherBlocksMove =
      (activeWeather === "harsh-sunlight" && moveType === "water") ||
      (activeWeather === "typhoon" && moveType === "fire");
    if (weatherBlocksMove) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.MoveBlockedByWeather", { weather: activeWeather })
      );
      return null;
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
    const accuracyAttributeKey = move.system.accuracyAttribute || "dexterity";
    const accuracySkillKey = move.system.accuracySkill || "brawl";
    const accuracyDicePoolBase =
      this.getTraitValue(accuracyAttributeKey) + this.getSkillValue(accuracySkillKey);
    const accuracyDiceModifier = clamp(Math.floor(toNumber(move.system?.accuracyDiceModifier, 0)), -99, 99);
    const accuracyFlatModifier = clamp(Math.floor(toNumber(move.system?.accuracyFlatModifier, 0)), -99, 99);
    const accuracyDicePool = Math.max(accuracyDicePoolBase + accuracyDiceModifier, 1);

    if (Number.isNaN(accuracyDicePoolBase)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMoveTraits"));
      return null;
    }
    const moveTargetKey = this._normalizeMoveTargetKey(move.system?.target);
    const selectedTargetActors = this._getSelectedTargetActors();
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
    const rangeValidation = this._validateMoveRangeTargets(move, moveTargetKey, targetActors);
    if (!rangeValidation.valid) {
      ui.notifications.warn(rangeValidation.message);
      return null;
    }
    if (willCost > 0) {
      willAfter = Math.max(currentWill - willCost, 0);
      await this.update({ "system.resources.will.value": willAfter });
    }

    const confusionPenalty = this._isConditionActive("confused") ? 1 : 0;
    const reducedAccuracy = Math.max(toNumber(move.system.reducedAccuracy, 0), 0) + shieldPenalty;
    const accuracyRoll = await new Roll(successPoolFormula(accuracyDicePool)).evaluate({
      async: true
    });
    const rawAccuracySuccesses = toNumber(accuracyRoll.total, 0);
    const modifiedAccuracySuccesses = rawAccuracySuccesses + accuracyFlatModifier;
    const removedAccuracySuccesses = reducedAccuracy + painPenalty + confusionPenalty;
    const netAccuracySuccesses = modifiedAccuracySuccesses - removedAccuracySuccesses;
    const requiredSuccesses = actionNumber;
    let hit = netAccuracySuccesses >= requiredSuccesses;
    const criticalThreshold = requiredSuccesses + (move.system.highCritical ? 2 : 3);
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
    let typeInteraction = {
      immune: false,
      weaknessBonus: 0,
      resistancePenalty: 0,
      label: "POKROLE.Chat.TypeEffect.Neutral"
    };
    let stabDice = 0;
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
          canInflictDeathOnKo
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
        typeInteraction = firstDamageResult.typeInteraction;
        stabDice = firstDamageResult.stabDice;
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
      finalDamage
    });
    const abilitySecondaryEffectResults = await this._applyAbilityAutomationEffects({
      move,
      moveTargetKey,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage
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
        accuracyAttributeLabel: this.localizeTrait(accuracyAttributeKey),
        accuracySkillLabel: this.localizeTrait(accuracySkillKey),
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
            : holdingBackMode === "nonlethal"
              ? game.i18n.localize("POKROLE.Chat.HoldingBack.NonLethal")
              : game.i18n.localize("POKROLE.Chat.HoldingBack.None"),
        holdingBackNonLethalApplied: isHoldingBackNonLethal,
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
        criticalDice,
        typeLabel: game.i18n.localize(typeInteraction.label),
        finalDamage,
        targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        additionalTargetResults: damageTargetResults.slice(1).map((entry) => ({
          targetName: entry.targetName,
          finalDamage: entry.finalDamage,
          hpBefore: entry.hpBefore,
          hpAfter: entry.hpAfter,
          hasHpUpdate: entry.hpBefore !== null && entry.hpAfter !== null
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
      await this._activateShieldProtectionForRound(roundKey);
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

  _normalizeMoveRangeMode(value) {
    const normalized = `${value ?? "melee"}`.trim().toLowerCase();
    const allowedModes = new Set(["self", "melee", "meters", "scene", "battlefield", "custom"]);
    return allowedModes.has(normalized) ? normalized : "melee";
  }

  _normalizeMoveRangeValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 1;
    return Math.min(Math.max(Math.floor(numericValue), 0), 999);
  }

  _getMoveRangeConfig(moveSystem = {}) {
    const rangeMode = this._normalizeMoveRangeMode(moveSystem.rangeMode);
    const rangeValue = this._normalizeMoveRangeValue(moveSystem.rangeValue);
    const rangeText = `${moveSystem.rangeText ?? moveSystem.range ?? ""}`.trim();
    return {
      rangeMode,
      rangeValue,
      rangeText,
      label: this._buildMoveRangeLabel({ rangeMode, rangeValue, rangeText })
    };
  }

  _buildMoveRangeLabel({ rangeMode = "melee", rangeValue = 1, rangeText = "" } = {}) {
    const normalizedMode = this._normalizeMoveRangeMode(rangeMode);
    const normalizedValue = this._normalizeMoveRangeValue(rangeValue);
    const normalizedText = `${rangeText ?? ""}`.trim();
    if (normalizedMode === "meters") return `${normalizedValue}m`;
    if (normalizedMode === "custom") return normalizedText || game.i18n.localize("POKROLE.Move.RangeMode.Custom");
    const labelByMode = {
      self: "POKROLE.Move.RangeMode.Self",
      melee: "POKROLE.Move.RangeMode.Melee",
      scene: "POKROLE.Move.RangeMode.Scene",
      battlefield: "POKROLE.Move.RangeMode.Battlefield"
    };
    return game.i18n.localize(labelByMode[normalizedMode] ?? "POKROLE.Common.Unknown");
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

  _getActorTokensOnCanvas(actor) {
    if (!actor || !canvas?.tokens) return [];
    const placeables = canvas.tokens.placeables ?? [];
    return placeables.filter((tokenDocument) => tokenDocument?.actor?.id === actor.id);
  }

  _measureTokenDistance(tokenA, tokenB) {
    if (!tokenA || !tokenB || !canvas?.grid) return null;
    const ax = Number(tokenA.center?.x ?? 0);
    const ay = Number(tokenA.center?.y ?? 0);
    const bx = Number(tokenB.center?.x ?? 0);
    const by = Number(tokenB.center?.y ?? 0);
    const pixelDistance = Math.hypot(ax - bx, ay - by);
    const gridSize = Math.max(Number(canvas.grid.size ?? 100), 1);
    const sceneDistance = Math.max(Number(canvas.scene?.grid?.distance ?? 1), 1);
    return (pixelDistance / gridSize) * sceneDistance;
  }

  _getClosestActorDistance(sourceActor, targetActor) {
    const sourceTokens = this._getActorTokensOnCanvas(sourceActor);
    const targetTokens = this._getActorTokensOnCanvas(targetActor);
    if (!sourceTokens.length || !targetTokens.length) return null;
    let minDistance = Number.POSITIVE_INFINITY;
    for (const sourceToken of sourceTokens) {
      for (const targetToken of targetTokens) {
        const distance = this._measureTokenDistance(sourceToken, targetToken);
        if (!Number.isFinite(distance)) continue;
        if (distance < minDistance) minDistance = distance;
      }
    }
    return Number.isFinite(minDistance) ? minDistance : null;
  }

  _validateMoveRangeTargets(move, moveTargetKey, targetActors = []) {
    if (!game.combat?.active && !game.combat?.started) {
      return { valid: true, message: "" };
    }
    const rangeConfig = this._getMoveRangeConfig(move?.system ?? {});
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const rangeMode = rangeConfig.rangeMode;
    const targets = Array.isArray(targetActors) ? targetActors.filter(Boolean) : [];

    if (rangeMode === "scene" || rangeMode === "battlefield" || rangeMode === "custom") {
      return { valid: true, message: "" };
    }
    if (rangeMode === "self") {
      const hasInvalidTarget = targets.some((actor) => actor.id !== this.id);
      if (!hasInvalidTarget) return { valid: true, message: "" };
      return {
        valid: false,
        message: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
      };
    }
    if (!targets.length && ["foe", "random-foe", "ally", "all-foes", "all-allies", "area", "battlefield-area"].includes(normalizedTarget)) {
      return {
        valid: false,
        message: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
      };
    }

    const maxRange = rangeMode === "meters" ? rangeConfig.rangeValue : 1;
    for (const targetActor of targets) {
      if (!targetActor || targetActor.id === this.id) continue;
      const distance = this._getClosestActorDistance(this, targetActor);
      if (distance === null) {
        return {
          valid: false,
          message: game.i18n.localize("POKROLE.Errors.MoveRangeCheckNeedsToken")
        };
      }
      if (distance > maxRange) {
        return {
          valid: false,
          message: game.i18n.format("POKROLE.Errors.MoveTargetOutOfRange", {
            target: targetActor.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
            distance: distance.toFixed(1),
            range: maxRange
          })
        };
      }
    }
    return { valid: true, message: "" };
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
    canInflictDeathOnKo = false
  }) {
    const category = move.system.category || "physical";
    const moveType = move.system.type || "normal";
    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    const damageAttributeLabel = this.localizeTrait(damageAttributeKey);
    const damageAttributeValue = Math.max(this.getTraitValue(damageAttributeKey), 0);
    const power = Math.max(toNumber(move.system.power, 0), 0);
    const damagePainPenalty = damageAttributeKey === "vitality" ? 0 : painPenalty;
    const criticalDice = critical ? 2 : 0;
    const stabDice = this.hasType(moveType) ? 1 : 0;
    const activeWeather = this.getActiveWeatherKey();
    const weatherBonusDice = this._getWeatherDamageBonusDice(moveType, activeWeather);
    const weatherFlatReduction = this._getWeatherFlatDamageReduction(moveType, activeWeather);
    const coverDefenseBonus = targetActor ? this._getCoverDefenseBonus(targetActor, move) : 0;
    const weatherDefenseBonus = targetActor
      ? this._getWeatherDefenseBonus(targetActor, category, activeWeather)
      : 0;
    const defense = targetActor
      ? this._getTargetDefense(targetActor, category) + coverDefenseBonus + weatherDefenseBonus
      : 0;
    const poolBeforeDefense =
      damageAttributeValue +
      power +
      stabDice +
      criticalDice +
      weatherBonusDice -
      damagePainPenalty;
    const damagePool = Math.max(poolBeforeDefense - defense, 0);
    const typeInteraction = targetActor
      ? this._evaluateTypeInteraction(moveType, targetActor)
      : {
          immune: false,
          weaknessBonus: 0,
          resistancePenalty: 0,
          label: "POKROLE.Chat.TypeEffect.Neutral"
        };

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
    let coverAbsorbedDamage = false;
    if (!typeInteraction.immune) {
      const weaknessBonus = damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
      const resolvedDamage = Math.max(
        baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
        1
      );
      finalDamage = isHoldingBackHalf
        ? Math.max(Math.floor(resolvedDamage / 2), 1)
        : resolvedDamage;
      finalDamage = Math.max(finalDamage - weatherFlatReduction, 0);
    }

    const rangedAttack = this._isMoveRanged(move);
    const targetCover = `${targetActor?.getTrainerCover?.() ?? "none"}`.trim().toLowerCase();
    if (rangedAttack && targetCover === "full" && finalDamage > 0) {
      finalDamage = 0;
      coverAbsorbedDamage = true;
      await this._degradeCoverOnHit(targetActor);
    }

    if (finalDamage > 0 && targetActor && typeof targetActor._consumeShieldProtectionIfAny === "function") {
      const shieldProtected = await targetActor._consumeShieldProtectionIfAny();
      if (shieldProtected) {
        finalDamage = 0;
        shieldPreventedDamage = true;
      }
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
      coverAbsorbedDamage,
      weatherBonusDice,
      weatherFlatReduction,
      coverDefenseBonus,
      weatherDefenseBonus,
      stabDice,
      criticalDice,
      damageAttributeLabel
    };
  }

  _collectMoveSecondaryEffects(move) {
    const explicitEffects = this._normalizeSecondaryEffectDefinitions(move.system?.secondaryEffects);
    if (explicitEffects.length > 0) return explicitEffects;

    const legacyEffects = this._convertLegacyEffectGroupsToSecondaryEffects(
      move.system?.effectGroups,
      move.system?.target
    );
    if (legacyEffects.length > 0) return legacyEffects;

    return this._inferSecondaryEffectsFromDescription(move.system?.description, move.system?.target);
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
    const condition = this._normalizeConditionKey(rawEffect.condition);
    const weather = this._normalizeSecondaryWeatherKey(rawEffect.weather);
    const stat = this._normalizeSecondaryStatKey(rawEffect.stat);
    const chance = clamp(Math.floor(toNumber(rawEffect.chance, 100)), 0, 100);
    const amount = clamp(Math.floor(toNumber(rawEffect.amount, 0)), -99, 99);

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
      condition,
      weather,
      stat,
      amount,
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

  _normalizeSecondaryDurationMode(durationMode, effectType = "custom") {
    const normalized = `${durationMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalized)) {
      return normalized;
    }
    return "manual";
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

  _isConditionImmune(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return false;

    const weather = this.getActiveWeatherKey();
    if ((weather === "sunny" || weather === "harsh-sunlight") && normalizedCondition === "frozen") {
      return true;
    }
    if (weather === "typhoon" && normalizedCondition === "burn") {
      return true;
    }

    if (normalizedCondition === "burn" && targetActor.hasType?.("fire")) return true;
    if (normalizedCondition === "frozen" && targetActor.hasType?.("ice")) return true;
    if (normalizedCondition === "paralyzed" && targetActor.hasType?.("electric")) return true;
    if (
      ["poisoned", "badly-poisoned"].includes(normalizedCondition) &&
      (targetActor.hasType?.("poison") || targetActor.hasType?.("steel"))
    ) {
      return true;
    }
    return false;
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

  _inferSecondaryEffectsFromDescription(description, moveTargetKey) {
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
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: 100,
        target,
        effectType: "heal",
        condition: "none",
        stat: "none",
        amount: -50,
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
    moveTargetKey,
    secondaryEffects,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage
  }) {
    if (!Array.isArray(secondaryEffects) || secondaryEffects.length === 0) {
      return [];
    }

    const results = [];
    for (const effect of secondaryEffects) {
      const normalizedEffectType = this._normalizeSecondaryEffectType(effect.effectType);
      if (!this._secondaryTriggerMatches(effect.trigger, { hit, isDamagingMove, finalDamage })) {
        continue;
      }

      let chanceRollTotal = null;
      let chanceSucceeded = true;
      if (effect.chance < 100) {
        const chanceRoll = await new Roll("1d100").evaluate({ async: true });
        chanceRollTotal = toNumber(chanceRoll.total, 101);
        chanceSucceeded = chanceRollTotal <= effect.chance;
      }

      if (!chanceSucceeded) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Common.None"),
          applied: false,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
            roll: chanceRollTotal,
            chance: effect.chance
          })
        });
        continue;
      }

      if (normalizedEffectType === "weather") {
        const applyResult = await this._applySecondaryEffectToActor(
          { ...effect, effectType: "weather" },
          this,
          move
        );
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: this._localizeMoveTarget("battlefield"),
          applied: applyResult.applied,
          detail: applyResult.detail
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
        const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, move);
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: targetActor.name,
          applied: applyResult.applied,
          detail: applyResult.detail
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
    finalDamage
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
        moveTargetKey,
        secondaryEffects: normalizedEffects,
        targetActors,
        hit,
        isDamagingMove,
        finalDamage
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
      return `${effectTypeLabel}: ${this._localizeConditionName(effect.condition)}`;
    }
    if (normalizedType === "weather") {
      return `${effectTypeLabel}: ${this._localizeSecondaryWeatherName(effect.weather)}`;
    }
    if (normalizedType === "stat" && effect.stat !== "none" && effect.amount !== 0) {
      const amountText = effect.amount > 0 ? `+${effect.amount}` : `${effect.amount}`;
      return `${effectTypeLabel}: ${this._localizeSecondaryStatName(effect.stat)} ${amountText}`;
    }
    if (["damage", "heal", "will"].includes(normalizedType)) {
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
      damage: "Damage",
      heal: "Heal",
      will: "Will",
      custom: "Custom"
    };
    return suffixByType[effectType] ?? "Custom";
  }

  _localizeConditionName(conditionKey) {
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

  async _applySecondaryEffectToActor(effect, targetActor, sourceMove = null) {
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
        const healValue = this._resolveEffectAmountValue(
          toNumber(targetActor.system?.resources?.hp?.max, 1),
          effect.amount
        );
        if (healValue <= 0) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
        }
        const hpChange = await this._safeApplyHeal(targetActor, healValue);
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
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
            before: hpChange.hpBefore,
            after: hpChange.hpAfter
          })
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

  async _applyConditionEffectToActor(effect, targetActor, sourceMove = null) {
    const conditionKey = this._normalizeConditionKey(effect.condition);
    if (conditionKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }
    if (this._isConditionImmune(targetActor, conditionKey)) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.ConditionImmune")
      };
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
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    const normalizedDurationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "condition");
    const normalizedDurationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(effect.specialDuration);
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "condition",
      conditionKey,
      durationMode: normalizedDurationMode,
      durationRounds: normalizedDurationRounds,
      specialDuration: normalizedSpecialDuration,
      sourceMove
    });
    const effectLabel = this._formatSecondaryEffectLabel(effect) || this._localizeConditionName(conditionKey);
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
    if (conditionKey === "sleep" && typeof targetActor._initializeSleepResistanceTrack === "function") {
      await targetActor._initializeSleepResistanceTrack();
    }
    return {
      applied: true,
      detail: `${this._localizeConditionName(conditionKey)} (${this._localizeTemporaryDuration(
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

    if (Object.prototype.hasOwnProperty.call(targetActor.system.attributes ?? {}, resolvedKey)) {
      const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
        resolvedKey
      );
      const configuredMax = this._resolveAttributeMaximum(targetActor, resolvedKey);
      const maxValue = isCoreAttribute ? Math.min(configuredMax, 10) : configuredMax;
      const minValue = isCoreAttribute ? 1 : 0;
      return this._applyTemporaryTrackedModifier({
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
    }

    if (Object.prototype.hasOwnProperty.call(targetActor.system.skills ?? {}, resolvedKey)) {
      return this._applyTemporaryTrackedModifier({
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
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const shouldBeFainted = hpValue <= 0;
    const isFainted = this._isConditionActive("fainted");
    if (shouldBeFainted === isFainted) return false;
    await this.toggleQuickCondition("fainted", { active: shouldBeFainted });
    return true;
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
      await this._setConditionFlagState(this, normalizedCondition, true);
      if (normalizedCondition === "sleep") {
        await this._initializeSleepResistanceTrack();
      }
      return this._ensureConditionEffectFromFlag(this, normalizedCondition);
    }

    await this._setConditionFlagState(this, normalizedCondition, false);
    if (normalizedCondition === "sleep") {
      await this._clearSleepResistanceTrack();
    }
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

  _buildConditionFlagEffectConfig(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
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
      label: this._localizeConditionName(normalizedCondition),
      trigger: "always",
      chance: 100,
      target: "self",
      effectType: "condition",
      durationMode: "manual",
      durationRounds: 1,
      specialDuration: [],
      condition: normalizedCondition,
      stat: "none",
      amount: 0,
      notes: conditionNotes[normalizedCondition] ?? ""
    };
  }

  async _ensureConditionEffectFromFlag(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
    if (systemField && !targetActor.system?.conditions?.[systemField]) {
      await targetActor.update({ [`system.conditions.${systemField}`]: true });
    }

    if (!systemField) {
      await targetActor.setFlag(POKROLE.ID, `automation.conditions.${normalizedCondition}`, true);
    }

    if (!this._hasTrackedConditionEffect(targetActor, normalizedCondition)) {
      const effectConfig = this._buildConditionFlagEffectConfig(normalizedCondition);
      return this._applyConditionEffectToActor(effectConfig, targetActor, null);
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
    if (normalizedCondition === "sleep") {
      await targetActor.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
    }

    return removedCount + effectIdsToDelete.length;
  }

  async _synchronizeConditionFlagsFromTemporaryEffects(targetActor) {
    const activeConditionKeys = new Set();
    for (const effectDocument of targetActor?.effects?.contents ?? []) {
      if (effectDocument?.disabled) continue;
      const conditionFromEffect = this._extractConditionKeyFromEffect(effectDocument);
      if (conditionFromEffect !== "none") activeConditionKeys.add(conditionFromEffect);
    }
    const entries = this._getTemporaryEffectEntries(targetActor);
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      for (const change of changes) {
        const normalizedCondition = this._normalizeConditionKey(change?.conditionKey);
        if (normalizedCondition !== "none") {
          activeConditionKeys.add(normalizedCondition);
        }
      }
    }

    const nextFlags = this._getConditionFlagEntries(targetActor);
    let hasChanges = false;
    for (const conditionKey of CONDITION_KEYS) {
      const shouldBeActive = activeConditionKeys.has(conditionKey);
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

      if (conditionKey === "sleep" && !shouldBeActive) {
        await targetActor.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
      }
    }

    if (hasChanges) {
      await targetActor.setFlag(POKROLE.ID, CONDITION_FLAGS_FLAG, nextFlags);
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
    if (statusDamage.totalDamage <= 0 && weatherDamage.totalDamage <= 0) {
      return { totalDamage: 0, statusDamage, weatherDamage };
    }

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card">
          <h3>${game.i18n.localize("POKROLE.Chat.RoundEndAutomation")}</h3>
          <p><strong>${this.name}</strong></p>
          <p>${statusDamage.label}</p>
          <p>${weatherDamage.label}</p>
        </div>
      `
    });
    return {
      totalDamage: statusDamage.totalDamage + weatherDamage.totalDamage,
      statusDamage,
      weatherDamage
    };
  }

  async _applyRoundEndStatusDamage() {
    const conditionFlags = this.getConditionFlags();
    let totalDamage = 0;
    const statusParts = [];

    const applyDamage = async (conditionKey, amount) => {
      if (!conditionFlags?.[conditionKey]) return;
      const hpResult = await this._safeApplyDamage(this, amount);
      if (!hpResult) return;
      totalDamage += amount;
      statusParts.push(`${this._localizeConditionName(conditionKey)} -${amount}`);
    };

    await applyDamage("burn", 1);
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
    const sameDirectionModifiers = existingPathModifiers.filter((effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const applied = Math.floor(toNumber(flags?.amountApplied, 0));
      if (applied === 0) return false;
      return Math.sign(applied) === Math.sign(numericAmount);
    });
    const strongestSameDirection = sameDirectionModifiers.reduce((maxAmount, effectDocument) => {
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
    const weakerSameDirectionIds = sameDirectionModifiers
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

  async _safeApplyHeal(targetActor, healAmount, options = {}) {
    const normalizedHeal = Math.max(toNumber(healAmount, 0), 0);
    if (!targetActor || normalizedHeal <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healingCategory = `${options?.healingCategory ?? "standard"}`.trim().toLowerCase();
    let allowedHeal = normalizedHeal;
    if (game.combat && targetActor instanceof PokRoleActor) {
      const track = targetActor._getHealingTrack();
      const perRoundLimit =
        healingCategory === "full" ? 9_999 : healingCategory === "complete" ? 5 : 3;
      const remainingHeal = Math.max(perRoundLimit - track.healedThisRound, 0);
      allowedHeal = Math.min(allowedHeal, remainingHeal);
      if (allowedHeal > 0) {
        track.healedThisRound += allowedHeal;
        if (healingCategory !== "standard") {
          track.completeHealedThisRound += allowedHeal;
        }
        await targetActor._setHealingTrack(track);
      }
    }

    const hpAfter = Math.min(hpValue + allowedHeal, hpMax);
    if (hpAfter === hpValue) {
      return { hpBefore: hpValue, hpAfter, healedApplied: 0 };
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
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
      healedApplied: Math.max(hpAfter - hpValue, 0)
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
    const healingCategory = healsFullHp
      ? "full"
      : healHpValue >= 5 || Number(gearItem.system.heal?.lethal ?? 0) > 0
        ? "complete"
        : "standard";
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
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("insight") + this.getSkillValue("alert"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.TrainerSearchCoverRoll", { actor: this.name })
    });
    if (!result?.success) return result;
    await this.setTrainerCover("full");
    ui.notifications.info(game.i18n.localize("POKROLE.Chat.CoverSetFull"));
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
      await combat.update({ active: false });
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
    const primary = this.system.types?.primary || "none";
    const secondary = this.system.types?.secondary || "none";
    return typeKey === primary || typeKey === secondary;
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

    const choice = await this._promptDefensiveReaction({
      targetActor,
      move,
      roundKey,
      moveCanBeEvaded,
      moveCanBeClashed
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
        roundKey
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
    moveCanBeClashed
  }) {
    const canUseEvasion =
      moveCanBeEvaded && targetActor._canUseReactionThisRound("evasion", roundKey);
    const clashMoves = targetActor.items
      .filter((item) => item.type === "move" && item.system.category !== "support");
    const canUseClash =
      moveCanBeClashed &&
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
    if (!move || move.type !== "move" || move.system.category === "support") {
      return "none";
    }

    const normalizedOption = `${options.holdingBack ?? ""}`.trim().toLowerCase();
    if (normalizedOption === "none" || normalizedOption === "half") {
      return normalizedOption;
    }
    if (normalizedOption === "nonlethal") {
      return move.system.lethal ? "nonlethal" : "none";
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
        }
      };

      if (move.system.lethal) {
        buttons.nonlethal = {
          icon: "<i class='fas fa-shield-heart'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackNonLethal"),
          callback: () => resolve("nonlethal")
        };
      }

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

  async _activateShieldProtectionForRound(roundKey = null) {
    const currentRoundKey = roundKey ?? this._getCurrentRoundKey(0);
    if (!currentRoundKey) return;
    await this.setFlag(POKROLE.ID, "combat.shieldActiveRound", currentRoundKey);
  }

  async _consumeShieldProtectionIfAny() {
    const currentRoundKey = this._getCurrentRoundKey(0);
    if (!currentRoundKey) return false;
    const activeRound = `${this.getFlag(POKROLE.ID, "combat.shieldActiveRound") ?? ""}`.trim();
    if (!activeRound || activeRound !== currentRoundKey) return false;
    await this.setFlag(POKROLE.ID, "combat.shieldActiveRound", "");
    return true;
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
    const isLethalKo = applyDeadOnZero && hpValue > 0 && hpAfter <= 0;
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
      if (hpAfter <= 0 && typeof targetActor.toggleQuickCondition === "function") {
        await targetActor.toggleQuickCondition("fainted", { active: true });
        if (isLethalKo) {
          await targetActor.toggleQuickCondition("dead", { active: true });
        }
      }
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply damage`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    }

    return {
      hpBefore: hpValue,
      hpAfter
    };
  }

  _evaluateTypeInteraction(moveType, targetActor) {
    if (!moveType || moveType === "none") {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const table = TYPE_EFFECTIVENESS[moveType];
    if (!table) {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const defenderTypes = [
      targetActor.system.types?.primary,
      targetActor.system.types?.secondary
    ].filter((typeKey) => typeKey && typeKey !== "none");

    let weaknessBonus = 0;
    let resistancePenalty = 0;
    let immune = false;

    for (const defenderType of defenderTypes) {
      if (table.immune.includes(defenderType)) immune = true;
      if (table.double.includes(defenderType)) weaknessBonus += 1;
      if (table.half.includes(defenderType)) resistancePenalty += 1;
    }

    const activeWeather = this.getActiveWeatherKey();
    if (
      activeWeather === "strong-winds" &&
      defenderTypes.includes("flying") &&
      ["electric", "ice", "rock"].includes(`${moveType ?? ""}`.trim().toLowerCase())
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
