import {
  ATTRIBUTE_DEFINITIONS,
  CORE_ATTRIBUTE_DEFINITIONS,
  SOCIAL_ATTRIBUTE_DEFINITIONS,
  getSystemAssetPath,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  EFFECT_PASSIVE_TRIGGER_KEYS,
  MOVE_TARGET_LABEL_BY_KEY,
  MOVE_TYPE_LABEL_BY_KEY,
  POKROLE,
  POKEMON_TIER_KEYS,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
  TRAINER_CARD_RANK_KEYS,
  TRAINER_CARD_RANK_LABEL_BY_KEY,
  TRAIT_LABEL_BY_KEY,
  TYPE_EFFECTIVENESS,
  TYPE_OPTIONS
} from "../constants.mjs";
import { getMoveTypeIcon } from "../move-type-icons.mjs";

const TEMPLATE_BY_TYPE = Object.freeze({
  trainer: getSystemAssetPath("templates/actor/trainer-sheet.hbs"),
  pokemon: getSystemAssetPath("templates/actor/pokemon-sheet.hbs")
});
const CORE_ATTRIBUTE_KEYS = Object.freeze(
  CORE_ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key)
);
const CORE_ATTRIBUTE_KEY_SET = new Set(CORE_ATTRIBUTE_KEYS);

const AILMENT_DEFINITIONS = Object.freeze([
  {
    key: "sleep",
    labelPath: "POKROLE.Conditions.Sleep",
    icon: getSystemAssetPath("assets/ailments/asleep.svg")
  },
  {
    key: "burn",
    labelPath: "POKROLE.Conditions.Burn",
    icon: getSystemAssetPath("assets/ailments/burn.svg")
  },
  {
    key: "frozen",
    labelPath: "POKROLE.Conditions.Frozen",
    icon: getSystemAssetPath("assets/ailments/frozen.svg")
  },
  {
    key: "paralyzed",
    labelPath: "POKROLE.Conditions.Paralyzed",
    icon: getSystemAssetPath("assets/ailments/paralyzed.svg")
  },
  {
    key: "poisoned",
    labelPath: "POKROLE.Conditions.Poisoned",
    icon: getSystemAssetPath("assets/ailments/poisoned.svg")
  },
  {
    key: "fainted",
    labelPath: "POKROLE.Conditions.Fainted",
    icon: getSystemAssetPath("assets/ailments/fainted.svg")
  },
  {
    key: "dead",
    labelPath: "POKROLE.Conditions.Dead",
    icon: "icons/svg/skull.svg"
  },
  {
    key: "confused",
    labelPath: "POKROLE.Move.Secondary.Condition.Confused",
    icon: "icons/svg/daze.svg"
  },
  {
    key: "flinch",
    labelPath: "POKROLE.Move.Secondary.Condition.Flinch",
    icon: "icons/svg/falling.svg"
  },
  {
    key: "disabled",
    labelPath: "POKROLE.Move.Secondary.Condition.Disabled",
    icon: "icons/svg/cancel.svg"
  },
  {
    key: "infatuated",
    labelPath: "POKROLE.Move.Secondary.Condition.Infatuated",
    icon: "icons/svg/heal.svg"
  },
  {
    key: "badly-poisoned",
    labelPath: "POKROLE.Move.Secondary.Condition.BadlyPoisoned",
    icon: getSystemAssetPath("assets/ailments/poisoned.svg")
  }
]);

const MATCHUP_GROUP_DEFINITIONS = Object.freeze([
  {
    key: "resistHalf",
    labelPath: "POKROLE.Pokemon.ResistancesHalf",
    multiplier: 0.5,
    multiplierIcon: getSystemAssetPath("assets/icons/matchups/1-2.svg")
  },
  {
    key: "resistQuarter",
    labelPath: "POKROLE.Pokemon.ResistancesQuarter",
    multiplier: 0.25,
    multiplierIcon: getSystemAssetPath("assets/icons/matchups/1-4.svg")
  },
  {
    key: "weakDouble",
    labelPath: "POKROLE.Pokemon.VulnerabilitiesDouble",
    multiplier: 2,
    multiplierIcon: getSystemAssetPath("assets/icons/matchups/X2.svg")
  },
  {
    key: "weakQuad",
    labelPath: "POKROLE.Pokemon.VulnerabilitiesQuad",
    multiplier: 4,
    multiplierIcon: getSystemAssetPath("assets/icons/matchups/X4.svg")
  },
  {
    key: "immune",
    labelPath: "POKROLE.Pokemon.Immunities",
    multiplier: 0,
    multiplierIcon: getSystemAssetPath("assets/icons/matchups/X0.svg")
  }
]);

function resolveConditionKeyFromStatusId(statusId) {
  const normalizedStatusId = `${statusId ?? ""}`.trim().toLowerCase();
  if (!normalizedStatusId.startsWith("pokrole-condition-")) return null;
  return normalizedStatusId.replace(/^pokrole-condition-/, "");
}

export class PokRoleActorSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pok-role", "sheet", "actor"],
      width: 1000,
      height: 860,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });
  }

  setPosition(options = {}) {
    if (this.actor?.type === "trainer") {
      const currentPosition = this.position ?? {};
      const baseWidth = Number(options.width ?? currentPosition.width ?? this.options.width ?? 1000);
      const baseHeight = Number(options.height ?? currentPosition.height ?? this.options.height ?? 860);
      options.width = Math.min(Math.max(baseWidth, 680), 1000);
      options.height = Math.max(baseHeight, 600);
    }
    return super.setPosition(options);
  }

  get template() {
    return TEMPLATE_BY_TYPE[this.actor.type] || TEMPLATE_BY_TYPE.trainer;
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.actor.system;
    context.attributeDefinitions = ATTRIBUTE_DEFINITIONS.map((attribute) => ({
      ...attribute,
      value: Number(this.actor.system.attributes?.[attribute.key] ?? 0),
      track: this._buildTrack(this.actor.system.attributes?.[attribute.key], 5, 0)
    }));
    context.skillDefinitions = SKILL_DEFINITIONS.map((skill) => ({
      ...skill,
      value: Number(this.actor.system.skills?.[skill.key] ?? 0),
      track: this._buildTrack(this.actor.system.skills?.[skill.key], 5, 0)
    }));
    if (this.actor.type === "trainer") {
      const trainerSkillOrder = [
        "brawl", "channel", "clash", "evasion",
        "alert", "athletic", "nature", "stealth",
        "empathy", "etiquette", "intimidate", "perform",
        "crafts", "lore", "medicine", "science"
      ];
      context.skillDefinitions = trainerSkillOrder.map((key) => {
        const def = SKILL_DEFINITIONS.find((s) => s.key === key);
        return {
          key,
          label: def?.label ?? key,
          value: Number(this.actor.system.skills?.[key] ?? 0),
          track: this._buildTrack(this.actor.system.skills?.[key], 5, 0)
        };
      });
    }
    context.initiativeScore = Number(this.actor.system.combat?.initiative ?? 0);
    context.baseInitiativeScore = this.actor.getInitiativeScore();
    context.defense = this.actor.getDefense("physical");
    context.specialDefense = this.actor.getDefense("special");
    context.painPenalty = this.actor.getPainPenalty();
    context.actionTrack = this._buildTrack(this.actor.system.combat?.actionNumber, 5, 1);
    context.badgesTrack = this._buildTrack(this.actor.system.badges, 8, 0);
    context.trainerRankOptions = TRAINER_CARD_RANK_LABEL_BY_KEY;
    const trainerGenderValue = `${this.actor.system.gender ?? "male"}`.trim().toLowerCase();
    const trainerGender = trainerGenderValue === "female" ? "female" : "male";
    context.trainerGender = trainerGender;
    context.trainerGenderClass = trainerGender;
    context.trainerGenderOptions = {
      male: "POKROLE.Trainer.GenderValues.Male",
      female: "POKROLE.Trainer.GenderValues.Female"
    };
    context.trainerGenderIcons = {
      male: getSystemAssetPath("assets/icons/msymbol2.png"),
      female: getSystemAssetPath("assets/icons/fsymbol2.png")
    };
    context.trainerGenderSymbolPath = context.trainerGenderIcons[trainerGender];
    context.trainerGenderLabelPath =
      trainerGender === "female"
        ? "POKROLE.Trainer.GenderValues.Female"
        : "POKROLE.Trainer.GenderValues.Male";
    const extraSkills = Array.isArray(this.actor.system.extraSkills)
      ? this.actor.system.extraSkills
      : [];
    context.extraSkills = extraSkills.map((extraSkill, index) => ({
      index,
      name: `${extraSkill?.name ?? ""}`,
      value: Number(extraSkill?.value ?? 0),
      track: this._buildTrack(extraSkill?.value, 5, 0)
    }));
    context.typeOptions = Object.fromEntries(
      TYPE_OPTIONS.map((typeKey) => [
        typeKey,
        typeKey === "none"
          ? "POKROLE.Types.None"
          : MOVE_TYPE_LABEL_BY_KEY[typeKey] ?? "POKROLE.Common.Unknown"
      ])
    );
    context.pokemonTierOptions = POKEMON_TIER_LABEL_BY_KEY;
    context.conditionChips = this._buildConditionChips();
    context.temporaryEffects = this._buildTemporaryEffects();
    context.actorConfiguredEffects = this._buildActorConfiguredEffects();
    context.effectTriggerOptions = {
      "on-hit": "POKROLE.Move.Secondary.Trigger.OnHit",
      "on-hit-damage": "POKROLE.Move.Secondary.Trigger.OnHitDamage",
      "on-miss": "POKROLE.Move.Secondary.Trigger.OnMiss",
      always: "POKROLE.Move.Secondary.Trigger.Always"
    };
    context.effectTargetOptions = {
      target: "POKROLE.Move.Secondary.Target.Target",
      self: "POKROLE.Move.Secondary.Target.Self",
      "all-targets": "POKROLE.Move.Secondary.Target.AllTargets",
      "all-allies": "POKROLE.Move.Secondary.Target.AllAllies",
      "all-foes": "POKROLE.Move.Secondary.Target.AllFoes"
    };
    context.effectTypeOptions = {
      condition: "POKROLE.Move.Secondary.Type.Condition",
      stat: "POKROLE.Move.Secondary.Type.Stat",
      cleanse: "POKROLE.Move.Secondary.Type.Cleanse",
      damage: "POKROLE.Move.Secondary.Type.Damage",
      heal: "POKROLE.Move.Secondary.Type.Heal",
      will: "POKROLE.Move.Secondary.Type.Will",
      custom: "POKROLE.Move.Secondary.Type.Custom"
    };
    context.effectDurationModeOptions = {
      manual: "POKROLE.Move.Secondary.Duration.Mode.Manual",
      rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds"
    };
    context.effectSpecialDurationOptions = {
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
    context.effectConditionOptions = Object.fromEntries(
      MOVE_SECONDARY_CONDITION_KEYS.map((conditionKey) => [
        conditionKey,
        this._getSecondaryConditionLabelPath(conditionKey)
      ])
    );
    context.effectStatOptions = Object.fromEntries(
      MOVE_SECONDARY_STAT_KEYS.map((statKey) => [statKey, this._getSecondaryStatLabelPath(statKey)])
    );
    context.effectPassiveTriggerOptions = {
      always: "POKROLE.Effects.PassiveTrigger.Always",
      "in-combat": "POKROLE.Effects.PassiveTrigger.InCombat",
      "out-of-combat": "POKROLE.Effects.PassiveTrigger.OutOfCombat",
      "self-hp-half-or-less": "POKROLE.Effects.PassiveTrigger.SelfHpHalfOrLess",
      "self-hp-quarter-or-less": "POKROLE.Effects.PassiveTrigger.SelfHpQuarterOrLess",
      "self-hp-below-threshold": "POKROLE.Effects.PassiveTrigger.SelfHpBelowThreshold",
      "target-hp-half-or-less": "POKROLE.Effects.PassiveTrigger.TargetHpHalfOrLess",
      "target-hp-quarter-or-less": "POKROLE.Effects.PassiveTrigger.TargetHpQuarterOrLess",
      "target-hp-below-threshold": "POKROLE.Effects.PassiveTrigger.TargetHpBelowThreshold",
      "self-has-condition": "POKROLE.Effects.PassiveTrigger.SelfHasCondition",
      "self-missing-condition": "POKROLE.Effects.PassiveTrigger.SelfMissingCondition",
      "target-has-condition": "POKROLE.Effects.PassiveTrigger.TargetHasCondition",
      "target-missing-condition": "POKROLE.Effects.PassiveTrigger.TargetMissingCondition"
    };
    if (this.actor.type === "trainer") {
      context.trainerView = this._normalizeTrainerView(this._trainerActiveView ?? "main");
      context.trainerInFray = typeof this.actor.isTrainerInFray === "function"
        ? this.actor.isTrainerInFray()
        : false;
      context.trainerCover = typeof this.actor.getTrainerCover === "function"
        ? this.actor.getTrainerCover()
        : "none";
      context.trainerCoverLabel = this._localizeCoverLabel(context.trainerCover);
      context.activeWeather = typeof this.actor.getActiveWeatherKey === "function"
        ? this.actor.getActiveWeatherKey()
        : "none";
      context.activeWeatherLabel = this._localizeWeatherLabel(context.activeWeather);
      context.trainerPhysicalMentalAttributes = this._buildAttributeRows([
        "strength",
        "vitality",
        "dexterity",
        "insight"
      ]);
      context.trainerSocialAttributes = this._buildAttributeRows([
        "tough",
        "beauty",
        "cool",
        "cute",
        "clever"
      ]);
      context.partyMembers = this._buildPartyMembers();
      context.canAddToParty = (this.actor.system.party?.length ?? 0) < 6;
    }
    if (this.actor.type === "pokemon") {
      const pokemonGenderValue = `${this.actor.system.gender ?? "unknown"}`.trim().toLowerCase();
      context.pokemonGender = ["male", "female", "genderless", "unknown"].includes(pokemonGenderValue)
        ? pokemonGenderValue
        : "unknown";
      context.pokemonGenderOptions = {
        male: "POKROLE.Pokemon.GenderValues.Male",
        female: "POKROLE.Pokemon.GenderValues.Female",
        genderless: "POKROLE.Pokemon.GenderValues.Genderless",
        unknown: "POKROLE.Pokemon.GenderValues.Unknown"
      };
      context.pokemonGenderIcons = {
        male: getSystemAssetPath("assets/icons/msymbol2.png"),
        female: getSystemAssetPath("assets/icons/fsymbol2.png"),
        genderless: getSystemAssetPath("assets/icons/osymbol2.png"),
        unknown: getSystemAssetPath("assets/icons/null.png")
      };
      context.pokemonGenderSymbolPath = context.pokemonGenderIcons[context.pokemonGender];
      context.pokemonGenderLabelPath = context.pokemonGenderOptions[context.pokemonGender];
      const trackMax = this._getPokemonTrackMaxConfig();
      const pokemonSkillKeys = [
        "brawl",
        "channel",
        "clash",
        "evasion",
        "alert",
        "athletic",
        "nature",
        "stealth",
        "charm",
        "etiquette",
        "intimidate",
        "perform"
      ];
      context.pokemonPhysicalMentalRows = this._buildAttributeRows([
        "strength",
        "vitality",
        "dexterity",
        "insight",
        "special"
      ], trackMax.attributes, 1);
      context.pokemonSocialRows = this._buildAttributeRows([
        "tough",
        "beauty",
        "cool",
        "cute",
        "clever"
      ], trackMax.attributes, 1);
      context.pokemonSkillRows = this._buildSkillRows(pokemonSkillKeys, trackMax.skills, 0);
      context.pokemonExtraTrack = this._buildTrack(this.actor.system.extra, trackMax.extra, 0);
      context.pokemonAbilityOptions = this._buildPokemonAbilityOptions();
      context.pokemonRegularAbilityList = `${this.actor.system.availableAbilities?.regular ?? ""}`.trim();
      context.pokemonHiddenAbilityList = `${this.actor.system.availableAbilities?.hidden ?? ""}`.trim();
      const pokemonExtraSkills = Array.isArray(this.actor.system.extraSkills)
        ? this.actor.system.extraSkills
        : [];
      context.pokemonExtraSkills = pokemonExtraSkills.map((extraSkill, index) => ({
        index,
        name: `${extraSkill?.name ?? ""}`,
        value: Number(extraSkill?.value ?? 0),
        track: this._buildTrack(extraSkill?.value, 5, 0)
      }));
      context.pokemonMatchups = this._buildPokemonMatchups();
      context.pokemonTrackSettingCoreAttributes = context.pokemonPhysicalMentalRows.map((row) => ({
        key: row.key,
        label: row.label,
        fieldPath: `system.sheetSettings.trackMax.attributes.${row.key}`,
        value: trackMax.attributes?.[row.key] ?? 12
      }));
      context.pokemonCoreBaseAttributes = CORE_ATTRIBUTE_DEFINITIONS.map((attribute) => ({
        key: attribute.key,
        label: attribute.label,
        fieldPath: `system.manualCoreBase.${attribute.key}`,
        value: this._resolveTrackMax(this.actor.system.manualCoreBase?.[attribute.key], 1)
      }));
      context.pokemonLearnsetByRankRows = POKEMON_TIER_KEYS.map((rankKey) => {
        const raw = `${this.actor.system.learnsetByRank?.[rankKey] ?? ""}`;
        const moves = raw.split(",").map((s) => s.trim()).filter(Boolean);
        return {
          key: rankKey,
          label: POKEMON_TIER_LABEL_BY_KEY[rankKey] ?? "POKROLE.Common.Unknown",
          fieldPath: `system.learnsetByRank.${rankKey}`,
          value: raw,
          moves
        };
      });
      context.evolutionTimeOptions = {
        fast: "POKROLE.Pokemon.EvolutionFast",
        medium: "POKROLE.Pokemon.EvolutionMedium",
        slow: "POKROLE.Pokemon.EvolutionSlow"
      };
      const evolutionThresholdByTime = { fast: 5, medium: 15, slow: 45 };
      const evolutionTimeKey = `${this.actor.system.evolutionTime ?? "medium"}`.toLowerCase();
      context.evolutionThreshold = evolutionThresholdByTime[evolutionTimeKey] ?? 15;
      context.evolutionProgressValue = Math.max(Number(this.actor.system.victories ?? 0), 0);
      context.evolutionReady = context.evolutionProgressValue >= context.evolutionThreshold;
      const caughtById = this.actor.system.caughtBy || "";
      const currentTrainerId = this.actor.system.currentTrainer || "";
      const caughtByActor = caughtById ? game.actors.get(caughtById) : null;
      const currentTrainerActor = currentTrainerId ? game.actors.get(currentTrainerId) : null;
      context.caughtByName = caughtByActor?.name ?? "";
      context.currentTrainerName = currentTrainerActor?.name ?? "";
      context.isGM = game.user.isGM;

      // Battle Item (held item drop zone)
      const battleItemId = this.actor.system.battleItem || "";
      if (battleItemId) {
        // Try world items first, then compendium packs
        let battleItem = game.items.get(battleItemId);
        if (!battleItem) {
          // Search in actor's owned items
          battleItem = this.actor.items.get(battleItemId);
        }
        if (battleItem) {
          context.battleItemData = { id: battleItem.id, name: battleItem.name, img: battleItem.img };
        }
      }
    }
    if (this.actor.type === "pokemon") {
      await this._syncLearnsetMovesToItems();
    }
    const moves = this.actor.items
      .filter((item) => item.type === "move")
      .sort((a, b) => a.sort - b.sort)
      .map((move) => this._prepareMoveData(move));
    context.moves = moves;
    if (this.actor.type === "pokemon") {
      const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
      context.maxUsableMoves = insightValue + 3;
      context.usableMoves = moves.filter((move) => move.isUsable);
      context.learnedMoves = moves;
      context.usableMovesCount = context.usableMoves.length;
      context.pokemonView = this._normalizePokemonView(this._pokemonActiveView ?? "main");

      // Group moves by rank for the learned tab
      const moveNameToRank = {};
      for (const rankKey of POKEMON_TIER_KEYS) {
        const raw = `${this.actor.system.learnsetByRank?.[rankKey] ?? ""}`;
        const names = raw.split(",").map((s) => s.trim()).filter(Boolean);
        for (const name of names) {
          if (!moveNameToRank[name]) moveNameToRank[name] = rankKey;
        }
      }
      const grouped = {};
      for (const rankKey of POKEMON_TIER_KEYS) {
        grouped[rankKey] = [];
      }
      grouped["other"] = [];
      for (const move of moves) {
        const rank = moveNameToRank[move.name];
        if (rank) {
          grouped[rank].push(move);
        } else {
          grouped["other"].push(move);
        }
      }
      context.movesByRank = POKEMON_TIER_KEYS
        .filter((rankKey) => grouped[rankKey].length > 0)
        .map((rankKey) => ({
          key: rankKey,
          label: POKEMON_TIER_LABEL_BY_KEY[rankKey] ?? rankKey,
          moves: grouped[rankKey]
        }));
      if (grouped["other"].length > 0) {
        context.movesByRank.push({
          key: "other",
          label: "POKROLE.Common.Other",
          moves: grouped["other"]
        });
      }
    }
    const pocketOrder = {
      potions: 0,
      small: 1,
      main: 2,
      held: 2,
      badge: 3
    };
    const gearItems = this.actor.items
      .filter((item) => item.type === "gear")
      .sort((a, b) => {
        const aPocketOrder = pocketOrder[a.system.pocket] ?? 99;
        const bPocketOrder = pocketOrder[b.system.pocket] ?? 99;
        if (aPocketOrder !== bPocketOrder) return aPocketOrder - bPocketOrder;
        if (a.sort !== b.sort) return a.sort - b.sort;
        return `${a.name}`.localeCompare(`${b.name}`);
      })
      .map((gear) => this._prepareGearData(gear));
    context.gearItems = gearItems;
    context.gearBattleItems = gearItems.filter((gear) => gear.usableInBattle);
    context.gearFieldItems = gearItems.filter((gear) => !gear.usableInBattle);
    context.gearPocketPotions = gearItems.filter((gear) => gear.pocketKey === "potions");
    context.gearPocketSmall = gearItems.filter((gear) => gear.pocketKey === "small");
    context.gearPocketMain = gearItems.filter((gear) => gear.pocketKey === "main");
    context.gearPocketBadge = gearItems.filter((gear) => gear.pocketKey === "badge");
    context.embeddedEffects = this._buildEmbeddedEffects();
    context.embeddedTemporaryEffects = context.embeddedEffects.filter(
      (effect) => effect.group === "temporary"
    );
    context.embeddedPassiveEffects = context.embeddedEffects.filter(
      (effect) => effect.group === "passive"
    );
    context.embeddedDisabledEffects = context.embeddedEffects.filter(
      (effect) => effect.group === "disabled"
    );
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const appElement = html.closest(".app");
    if (appElement?.length) {
      appElement.toggleClass("pok-role-pokemon-window", this.actor.type === "pokemon");
      appElement.toggleClass("pok-role-trainer-window", this.actor.type === "trainer");
    }

    html.find("[data-action='roll-attribute']").on("click", (event) =>
      this._onRollAttribute(event)
    );
    html.find("[data-action='roll-skill']").on("click", (event) =>
      this._onRollSkill(event)
    );
    html.find("[data-action='roll-initiative']").on("click", () =>
      this.actor.rollInitiative()
    );
    html.find("[data-action='roll-combined']").on("click", () =>
      this.actor.rollCombinedDialog()
    );
    html.find("[data-action='reset-action-counter']").on("click", () =>
      this.actor.resetActionCounter()
    );
    html.find("[data-action='trainer-use-item-on-pokemon']").on("click", (event) =>
      this._onTrainerUseItemOnPokemon(event)
    );
    html.find("[data-action='trainer-search-cover']").on("click", (event) =>
      this._onTrainerSearchCover(event)
    );
    html.find("[data-action='trainer-take-cover']").on("click", (event) =>
      this._onTrainerTakeCover(event)
    );
    html.find("[data-action='trainer-toggle-fray']").on("click", (event) =>
      this._onTrainerToggleFray(event)
    );
    html.find("[data-action='trainer-run-away']").on("click", (event) =>
      this._onTrainerRunAway(event)
    );
    html.find("[data-action='trainer-set-weather']").on("click", (event) =>
      this._onTrainerSetWeather(event)
    );
    html.find("[data-action='roll-evasion']").on("click", () => this.actor.rollEvasion());
    html.find("[data-action='pokemon-rest']").on("click", (event) =>
      this._onPokemonRest(event)
    );
    html.find("[data-action='take-cover']").on("click", (event) =>
      this._onTakeCover(event)
    );
    html.find("[data-action='set-track']").on("click", (event) => this._onSetTrack(event));
    html.find("[data-action='toggle-condition-chip']").on("click", (event) =>
      this._onToggleConditionChip(event)
    );
    html.find("[data-action='remove-temporary-effect']").on("click", (event) =>
      this._onRemoveTemporaryEffect(event)
    );
    html.find("[data-action='add-actor-effect']").on("click", (event) =>
      this._onAddActorEffect(event)
    );
    html.find("[data-action='delete-actor-effect']").on("click", (event) =>
      this._onDeleteActorEffect(event)
    );
    html.find("[data-action='apply-actor-effect']").on("click", (event) =>
      this._onApplyActorEffect(event)
    );
    html.find("[data-action='save-actor-effects']").on("click", (event) =>
      this._onSaveActorEffects(event, html)
    );
    html.find("[data-effect-field='effectType']").on("change", (event) =>
      this._onActorEffectTypeChanged(event)
    );
    html.find("[data-effect-field='passiveTrigger']").on("change", (event) =>
      this._onActorEffectPassiveTriggerChanged(event)
    );
    html.find("[data-action='edit-embedded-effect']").on("click", (event) =>
      this._onEditEmbeddedEffect(event)
    );
    html.find("[data-action='toggle-embedded-effect-disabled']").on("click", (event) =>
      this._onToggleEmbeddedEffectDisabled(event)
    );
    html.find("[data-action='delete-embedded-effect']").on("click", (event) =>
      this._onDeleteEmbeddedEffect(event)
    );
    html.find("[data-action='add-extra-skill']").on("click", (event) =>
      this._onAddExtraSkill(event)
    );
    html.find("[data-action='delete-extra-skill']").on("click", (event) =>
      this._onDeleteExtraSkill(event)
    );
    html.find("[data-action='add-party-member']").on("click", (event) =>
      this._onAddPartyMember(event)
    );
    html.find("[data-action='remove-party-member']").on("click", (event) =>
      this._onRemovePartyMember(event)
    );
    html.find("[data-action='open-party-member']").on("click", (event) =>
      this._onOpenPartyMember(event)
    );
    html.find("[data-action='clear-trainer-field']").on("click", (event) =>
      this._onClearTrainerField(event)
    );
    html.find("[data-action='clear-battle-item']").on("click", (event) =>
      this._onClearBattleItem(event)
    );

    html.find("[data-action='create-move']").on("click", (event) =>
      this._onCreateMove(event)
    );
    html.find("[data-action='edit-move']").on("click", (event) =>
      this._onEditMove(event)
    );
    html.find("[data-action='roll-move']").on("click", (event) =>
      this._onRollMove(event)
    );
    html.find("[data-action='roll-clash']").on("click", (event) =>
      this._onRollClash(event)
    );
    html.find("[data-action='delete-move']").on("click", (event) =>
      this._onDeleteMove(event)
    );
    html.find("[data-action='create-gear']").on("click", (event) =>
      this._onCreateGear(event)
    );
    html.find("[data-action='edit-gear']").on("click", (event) =>
      this._onEditGear(event)
    );
    html.find("[data-action='use-gear']").on("click", (event) =>
      this._onUseGear(event)
    );
    html.find("[data-action='delete-gear']").on("click", (event) =>
      this._onDeleteGear(event)
    );
    html.find("[data-action='toggle-move-usable']").on("change", (event) =>
      this._onToggleMoveUsable(event)
    );
    html.find("[data-action='toggle-learnset-panel']").on("click", (event) =>
      this._onToggleLearnsetPanel(event, html)
    );
    html.find(".learnset-move-remove").on("click", (event) =>
      this._onRemoveLearnsetMove(event)
    );
    html.find(".learnset-rank-drop-zone").each((_i, el) => {
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("drag-over");
      });
      el.addEventListener("dragleave", () => {
        el.classList.remove("drag-over");
      });
      el.addEventListener("drop", (e) => this._onDropLearnsetMove(e));
    });
    html.find("[data-action='switch-pokemon-tab']").on("click", (event) =>
      this._onSwitchPokemonTab(event, html)
    );
    html.find("[data-action='switch-trainer-tab']").on("click", (event) =>
      this._onSwitchTrainerTab(event, html)
    );
    html.find("[data-action='evolution-available']").on("click", (event) =>
      this._onEvolutionAvailable(event)
    );
    html.find(".actor-effect-row").each((_index, row) => this._refreshActorEffectRowVisibility(row));

    if (this.actor.type === "pokemon") {
      this._applyPokemonTabState(html, this._pokemonActiveView ?? "main");
      if (this._learnsetPanelOpen) {
        html.find(".learnset-collapsible").show();
        html.find("[data-action='toggle-learnset-panel'] i")
          .removeClass("fa-chevron-down").addClass("fa-chevron-up");
      }
    }
    if (this.actor.type === "trainer") {
      this._applyTrainerTabState(html, this._trainerActiveView ?? "main");
    }
  }

  async _onRollAttribute(event) {
    event.preventDefault();
    const { attribute } = event.currentTarget.dataset;
    if (!attribute) return;
    await this.actor.rollAttribute(attribute);
  }

  async _onRollSkill(event) {
    event.preventDefault();
    const { skill } = event.currentTarget.dataset;
    if (!skill) return;
    await this.actor.rollSkill(skill);
  }

  async _onTrainerUseItemOnPokemon(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer" || typeof this.actor.trainerUseItemOnPokemon !== "function") {
      return;
    }
    await this.actor.trainerUseItemOnPokemon();
    this.render(false);
  }

  async _onTrainerSearchCover(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer" || typeof this.actor.trainerSearchForCover !== "function") {
      return;
    }
    await this.actor.trainerSearchForCover();
    this.render(false);
  }

  async _onTrainerTakeCover(event) {
    event.preventDefault();
    if (typeof this.actor.takeCover !== "function" && typeof this.actor.trainerTakeCover !== "function") {
      return;
    }
    const level = `${event.currentTarget.dataset.cover ?? "half"}`.trim().toLowerCase();
    if (typeof this.actor.takeCover === "function") await this.actor.takeCover(level);
    else await this.actor.trainerTakeCover(level);
    this.render(false);
  }

  async _onTakeCover(event) {
    event.preventDefault();
    if (typeof this.actor.takeCover !== "function") return;
    const level = `${event.currentTarget.dataset.cover ?? "half"}`.trim().toLowerCase();
    await this.actor.takeCover(level);
    this.render(false);
  }

  async _onPokemonRest(event) {
    event.preventDefault();
    if (this.actor.type !== "pokemon" || typeof this.actor.restPokemon !== "function") return;
    await this.actor.restPokemon();
    this.render(false);
  }

  async _onTrainerToggleFray(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer" || typeof this.actor.trainerEnterFray !== "function") {
      return;
    }
    await this.actor.trainerEnterFray();
    this.render(false);
  }

  async _onTrainerRunAway(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer" || typeof this.actor.trainerRunAwayFromBattle !== "function") {
      return;
    }
    await this.actor.trainerRunAwayFromBattle();
    this.render(false);
  }

  async _onTrainerSetWeather(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer" || typeof this.actor.setActiveWeather !== "function") return;
    const weatherOptions = [
      "none",
      "sunny",
      "harsh-sunlight",
      "rain",
      "typhoon",
      "sandstorm",
      "strong-winds",
      "hail"
    ];
    const weatherOptionsMarkup = weatherOptions
      .map(
        (weatherKey) =>
          `<option value="${weatherKey}">${this._localizeWeatherLabel(weatherKey)}</option>`
      )
      .join("");
    const selectedWeather = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.WeatherSetTitle"),
        content: `
          <form class="pok-role-combined-roll">
            <div class="form-group">
              <label>${game.i18n.localize("POKROLE.Combat.WeatherLabel")}</label>
              <select name="weather">
                ${weatherOptionsMarkup}
              </select>
            </div>
          </form>
        `,
        buttons: {
          confirm: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
            callback: (dialogHtml) => resolve(dialogHtml?.[0]?.querySelector("select[name='weather']")?.value ?? "none")
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
    if (!selectedWeather) return;
    await this.actor.setActiveWeather(selectedWeather);
    this.render(false);
  }

  async _onCreateMove(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "pokemon") return;
    const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
    const maxUsableMoves = insightValue + 3;
    const usableMovesCount = this.actor.items.filter(
      (item) => item.type === "move" && item.system?.isUsable !== false
    ).length;
    const canMarkUsable = usableMovesCount < maxUsableMoves;

    await this.actor.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("POKROLE.Move.New"),
        type: "move",
        img: getMoveTypeIcon("normal"),
        system: {
          type: "normal",
          category: "physical",
          target: "foe",
          accuracyAttribute: "dexterity",
          accuracySkill: "brawl",
          primaryMode: "damage",
          reducedAccuracy: 0,
          accuracyDiceModifier: 0,
          accuracyFlatModifier: 0,
          power: 2,
          damageAttribute: "auto",
          willCost: 0,
          durationType: "instant",
          durationValue: 1,
          priority: 0,
          highCritical: false,
          neverFail: false,
          lethal: false,
          shieldMove: false,
          actionTag: "1A",
          isUsable: canMarkUsable,
          secondaryEffects: []
        }
      }
    ]);
  }

  async _onEditMove(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;

    const move = this.actor.items.get(itemId);
    move?.sheet.render(true);
  }

  async _onRollMove(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.queueMove(itemId);
  }

  async _onRollClash(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.rollClash(itemId);
  }

  async _onDeleteMove(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onToggleMoveUsable(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "pokemon") return;

    const checkbox = event.currentTarget;
    const { itemId } = checkbox.dataset;
    if (!itemId) return;

    const move = this.actor.items.get(itemId);
    if (!move || move.type !== "move") return;

    const nextValue = Boolean(checkbox.checked);
    const currentValue = move.system?.isUsable !== false;
    if (nextValue === currentValue) return;

    if (nextValue) {
      const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
      const maxUsableMoves = insightValue + 3;
      const usableMovesCount = this.actor.items.filter(
        (item) => item.type === "move" && item.system?.isUsable !== false
      ).length;

      if (usableMovesCount >= maxUsableMoves) {
        checkbox.checked = false;
        ui.notifications.warn(
          game.i18n.format("POKROLE.Errors.MaxUsableMovesReached", { max: maxUsableMoves })
        );
        return;
      }
    }

    await move.update({ "system.isUsable": nextValue });
  }

  async _syncLearnsetMovesToItems() {
    if (this.actor.type !== "pokemon" || !this.isEditable) return;
    const currentTier = this.actor.system.tier ?? "starter";
    const tierIndex = POKEMON_TIER_KEYS.indexOf(currentTier);
    if (tierIndex < 0) return;

    const ranksUpToCurrent = POKEMON_TIER_KEYS.slice(0, tierIndex + 1);
    const moveNamesToAdd = [];
    for (const rank of ranksUpToCurrent) {
      const raw = `${this.actor.system.learnsetByRank?.[rank] ?? ""}`;
      const names = raw.split(",").map((s) => s.trim()).filter(Boolean);
      moveNamesToAdd.push(...names);
    }

    const existingNames = new Set(
      this.actor.items.filter((i) => i.type === "move").map((i) => i.name)
    );
    const COMMON_MOVE_NAMES = new Set([
      "Struggle (Physical)", "Struggle (Special)", "Grapple",
      "Help Another", "Cover An Ally", "Run Away",
      "Ambush", "Clash", "Evasion", "Stabilize An Ally"
    ]);
    const namesToCreate = [];
    const seen = new Set();
    for (const name of moveNamesToAdd) {
      if (existingNames.has(name) || seen.has(name) || COMMON_MOVE_NAMES.has(name)) continue;
      seen.add(name);
      namesToCreate.push(name);
    }
    if (namesToCreate.length === 0) return;

    // Look up moves from the Moves compendium
    const pack = game.packs.get("pok-role-system.moves");
    if (!pack) return;
    const index = await pack.getIndex({ fields: ["name"] });
    const newMoves = [];
    for (const name of namesToCreate) {
      const entry = index.find((e) => e.name === name);
      if (entry) {
        const doc = await pack.getDocument(entry._id);
        if (doc) {
          const moveData = doc.toObject();
          moveData.system.isUsable = false;
          delete moveData._id;
          newMoves.push(moveData);
        }
      }
    }
    if (newMoves.length > 0) {
      await this.actor.createEmbeddedDocuments("Item", newMoves);
    }
  }

  _onToggleLearnsetPanel(event, html) {
    event.preventDefault();
    this._learnsetPanelOpen = !this._learnsetPanelOpen;
    const panel = html.find(".learnset-collapsible");
    const icon = $(event.currentTarget).find("i");
    panel.slideToggle(200);
    icon.toggleClass("fa-chevron-down fa-chevron-up");
  }

  async _onRemoveLearnsetMove(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const btn = event.currentTarget;
    const rank = btn.dataset.rank;
    const moveName = btn.dataset.moveName;
    if (!rank || !moveName) return;

    const raw = `${this.actor.system.learnsetByRank?.[rank] ?? ""}`;
    const moves = raw.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = moves.filter((m) => m !== moveName);
    await this.actor.update({ [`system.learnsetByRank.${rank}`]: updated.join(", ") });
  }

  async _onDropLearnsetMove(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const zone = event.currentTarget;
    zone.classList.remove("drag-over");
    const rank = zone.dataset.rank;
    if (!rank) return;

    let data;
    try {
      data = JSON.parse(event.dataTransfer.getData("text/plain"));
    } catch {
      return;
    }

    if (data.type !== "Item") return;
    const item = await Item.implementation.fromDropData(data);
    if (!item || item.type !== "move") return;

    const moveName = item.name;
    const raw = `${this.actor.system.learnsetByRank?.[rank] ?? ""}`;
    const moves = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (moves.includes(moveName)) return;
    moves.push(moveName);
    await this.actor.update({ [`system.learnsetByRank.${rank}`]: moves.join(", ") });
  }

  _onSwitchPokemonTab(event, html) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;

    const tab = event.currentTarget.dataset.tab;
    if (!tab) return;
    this._pokemonActiveView = this._normalizePokemonView(tab);
    this._applyPokemonTabState(html, this._pokemonActiveView);
  }

  _onSwitchTrainerTab(event, html) {
    event.preventDefault();
    if (this.actor.type !== "trainer") return;

    const tab = event.currentTarget.dataset.tab;
    if (!tab) return;
    this._trainerActiveView = this._normalizeTrainerView(tab);
    this._applyTrainerTabState(html, this._trainerActiveView);
  }

  _onEvolutionAvailable(event) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;
    ui.notifications.info(
      game.i18n.format("POKROLE.Pokemon.EvolutionAvailableNotice", { name: this.actor.name })
    );
  }

  async _onCreateGear(event) {
    event.preventDefault();
    if (!this.isEditable || !["trainer", "pokemon"].includes(this.actor.type)) return;

    await this.actor.createEmbeddedDocuments("Item", [
      {
        name: game.i18n.localize("POKROLE.Gear.New"),
        type: "gear",
        img: "icons/svg/item-bag.svg",
        system: {
          category: "healing",
          pocket: "potions",
          consumable: true,
          canUseInBattle: true,
          target: "pokemon",
          quantity: 1,
          units: {
            value: 2,
            max: 2
          },
          heal: {
            hp: 1,
            lethal: 0,
            fullHp: false,
            restoreAwareness: false,
            battleHealingCategory: "standard"
          },
          status: {
            all: false,
            poison: false,
            sleep: false,
            burn: false,
            frozen: false,
            paralysis: false,
            confusion: false
          },
          description: ""
        }
      }
    ]);
  }

  async _onEditGear(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    const gear = this.actor.items.get(itemId);
    gear?.sheet.render(true);
  }

  async _onUseGear(event) {
    event.preventDefault();
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.useGearItem(itemId);
  }

  async _onDeleteGear(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const { itemId } = event.currentTarget.dataset;
    if (!itemId) return;
    await this.actor.deleteEmbeddedDocuments("Item", [itemId]);
  }

  async _onAddExtraSkill(event) {
    event.preventDefault();
    if (!this.isEditable || !["trainer", "pokemon"].includes(this.actor.type)) return;
    const current = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills)
      : [];
    current.push({ name: "", value: 0 });
    await this.actor.update({ "system.extraSkills": current });
  }

  async _onDeleteExtraSkill(event) {
    event.preventDefault();
    if (!this.isEditable || !["trainer", "pokemon"].includes(this.actor.type)) return;
    const extraIndex = Number(event.currentTarget.dataset.extraIndex);
    if (!Number.isInteger(extraIndex) || extraIndex < 0) return;
    const current = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills)
      : [];
    if (extraIndex >= current.length) return;
    current.splice(extraIndex, 1);
    await this.actor.update({ "system.extraSkills": current });
  }

  async _onSetTrack(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const button = event.currentTarget;
    const field = button.dataset.trackField;
    const value = Number(button.dataset.trackValue);
    const min = Number(button.dataset.trackMin ?? 1);
    const max = Number(button.dataset.trackMax ?? 5);
    if (!field || !Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
      return;
    }

    const systemPath = field.startsWith("system.") ? field.slice(7) : field;
    const currentValue = Number(foundry.utils.getProperty(this.actor.system, systemPath) ?? min);
    let nextValue = value;

    if (min === 0 && currentValue === value) {
      nextValue = value - 1;
    }

    nextValue = Math.min(Math.max(nextValue, min), max);
    await this.actor.update({ [field]: nextValue });
  }

  async _onToggleConditionChip(event) {
    event.preventDefault();
    if (!this.isEditable || typeof this.actor.toggleQuickCondition !== "function") return;
    const conditionKey = `${event.currentTarget.dataset.conditionKey ?? ""}`.trim();
    if (!conditionKey) return;
    const result = await this.actor.toggleQuickCondition(conditionKey);
    if (result?.detail) {
      if (result.applied) ui.notifications.info(result.detail);
      else ui.notifications.warn(result.detail);
    }
    this.render(false);
  }

  async _onRemoveTemporaryEffect(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    if (typeof this.actor.removeTemporaryEffect !== "function") return;

    await this.actor.removeTemporaryEffect(effectId);
  }

  async _onAddActorEffect(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const [createdEffect] = await this.actor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: game.i18n.localize("POKROLE.Effects.New"),
        img: "icons/svg/aura.svg",
        transfer: false,
        disabled: false,
        changes: []
      }
    ]);
    createdEffect?.sheet?.render(true);
    this.render(false);
  }

  async _onDeleteActorEffect(event) {
    event.preventDefault();
    if (!this.isEditable || typeof this.actor.deleteConfiguredEffect !== "function") return;
    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    await this.actor.deleteConfiguredEffect(effectId);
    this.render(false);
  }

  async _onApplyActorEffect(event) {
    event.preventDefault();
    if (typeof this.actor.applyConfiguredEffect !== "function") return;
    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    const result = await this.actor.applyConfiguredEffect(effectId, { targetActor: this.actor });
    if (result?.applied) {
      ui.notifications.info(game.i18n.localize("POKROLE.Effects.ApplySuccess"));
    } else {
      ui.notifications.warn(result?.detail || game.i18n.localize("POKROLE.Effects.ApplyFailed"));
    }
    this.render(false);
  }

  async _onSaveActorEffects(event, html) {
    event.preventDefault();
    if (!this.isEditable) return;
    ui.notifications.info(game.i18n.localize("POKROLE.Effects.NativeHint"));
    this.render(false);
  }

  _onActorEffectTypeChanged(event) {
    const row = event.currentTarget.closest(".actor-effect-row");
    if (!row) return;
    this._refreshActorEffectRowVisibility(row);
  }

  _onActorEffectPassiveTriggerChanged(event) {
    const row = event.currentTarget.closest(".actor-effect-row");
    if (!row) return;
    this._refreshActorEffectRowVisibility(row);
  }

  _onEditEmbeddedEffect(event) {
    event.preventDefault();
    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    const effect = this.actor.effects.get(effectId);
    effect?.sheet?.render(true);
  }

  async _onToggleEmbeddedEffectDisabled(event) {
    event.preventDefault();
    if (!this.isEditable) return;

    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    const effect = this.actor.effects.get(effectId);
    if (!effect) return;

    const nextDisabled = !Boolean(effect.disabled);
    await effect.update({ disabled: nextDisabled });
    if (typeof this.actor.synchronizeConditionFlags === "function") {
      await this.actor.synchronizeConditionFlags();
    }
    this.render(false);
  }

  async _onDeleteEmbeddedEffect(event) {
    event.preventDefault();
    if (!this.isEditable) return;
    const effectId = `${event.currentTarget.dataset.effectId ?? ""}`.trim();
    if (!effectId) return;
    const effect = this.actor.effects.get(effectId);
    if (!effect) return;
    const conditionKeys = [...(effect.statuses ?? [])]
      .map((statusId) => resolveConditionKeyFromStatusId(statusId))
      .filter((statusKey) => statusKey);
    let handledByConditionToggle = false;
    for (const conditionKey of conditionKeys) {
      if (typeof this.actor.toggleQuickCondition === "function") {
        await this.actor.toggleQuickCondition(conditionKey, { active: false });
        handledByConditionToggle = true;
      }
    }
    if (!handledByConditionToggle) {
      const latestEffect = this.actor.effects.get(effectId);
      if (latestEffect) await latestEffect.delete();
    }
  }

  _buildEmbeddedEffects() {
    const effects = this.actor.effects?.contents ?? [];
    return effects
      .slice()
      .sort((left, right) => `${left.name ?? ""}`.localeCompare(`${right.name ?? ""}`))
      .map((effect) => {
        const durationInfo = this._resolveEmbeddedEffectDurationInfo(effect);
        const statusList = [...(effect.statuses ?? [])];
        const statusLabel =
          statusList.length > 0
            ? statusList.join(", ")
            : game.i18n.localize("POKROLE.Common.None");
        const disabled = Boolean(effect.disabled);
        const group = disabled
          ? "disabled"
          : durationInfo.isTemporary
            ? "temporary"
            : "passive";

        return {
          id: effect.id,
          name: effect.name || game.i18n.localize("POKROLE.Common.Unknown"),
          icon: effect.img || "icons/svg/aura.svg",
          disabled,
          group,
          origin: `${effect.origin ?? ""}`.trim() || game.i18n.localize("POKROLE.Common.None"),
          statuses: statusLabel,
          durationLabel: durationInfo.label
        };
      });
  }

  _resolveEmbeddedEffectDurationInfo(effect) {
    const automationFlags = effect?.getFlag(POKROLE.ID, "automation") ?? {};
    const durationMode = `${automationFlags?.durationMode ?? ""}`.trim().toLowerCase();
    const specialDurationList = this._normalizeSpecialDurationList(automationFlags?.specialDuration);
    if (durationMode === "combat") {
      const label = game.i18n.localize("POKROLE.TemporaryEffects.DurationCombat");
      return {
        isTemporary: true,
        label: this._appendSpecialDurationLabel(label, specialDurationList)
      };
    }
    if (durationMode === "rounds") {
      const rounds = Math.max(
        Math.floor(
          Number(
            automationFlags?.remainingRounds ??
            effect?.duration?.remaining ??
            automationFlags?.durationRounds ??
            1
          ) || 1
        ),
        0
      );
      const label = game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
        rounds
      });
      return {
        isTemporary: true,
        label: this._appendSpecialDurationLabel(label, specialDurationList)
      };
    }
    if (durationMode === "manual") {
      const label = game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
      const hasSpecialDuration = specialDurationList.length > 0;
      return {
        isTemporary: hasSpecialDuration,
        label: this._appendSpecialDurationLabel(label, specialDurationList)
      };
    }

    const nativeDuration = effect?.duration ?? {};
    const nativeLabel = `${nativeDuration.label ?? ""}`.trim();
    const remaining = Number(nativeDuration.remaining ?? Number.NaN);
    const rounds = Number(nativeDuration.rounds ?? Number.NaN);
    const turns = Number(nativeDuration.turns ?? Number.NaN);
    const seconds = Number(nativeDuration.seconds ?? Number.NaN);
    const hasFiniteDuration =
      Number.isFinite(remaining) ||
      (Number.isFinite(rounds) && rounds > 0) ||
      (Number.isFinite(turns) && turns > 0) ||
      (Number.isFinite(seconds) && seconds > 0);

    if (hasFiniteDuration) {
      if (nativeLabel) {
        return { isTemporary: true, label: nativeLabel };
      }
      if (Number.isFinite(remaining)) {
        return {
          isTemporary: true,
          label: game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: Math.max(Math.floor(remaining), 0)
          })
        };
      }
      if (Number.isFinite(rounds) && rounds > 0) {
        return {
          isTemporary: true,
          label: game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: Math.max(Math.floor(rounds), 0)
          })
        };
      }
      if (Number.isFinite(turns) && turns > 0) {
        return {
          isTemporary: true,
          label: game.i18n.format("POKROLE.Effects.DurationTurnsWithValue", {
            turns: Math.max(Math.floor(turns), 0)
          })
        };
      }
      if (Number.isFinite(seconds) && seconds > 0) {
        return {
          isTemporary: true,
          label: game.i18n.format("POKROLE.Effects.DurationSecondsWithValue", {
            seconds: Math.max(Math.floor(seconds), 0)
          })
        };
      }
    }

    return {
      isTemporary: false,
      label: game.i18n.localize("POKROLE.TemporaryEffects.DurationManual")
    };
  }

  _appendSpecialDurationLabel(baseLabel, specialDurationList = []) {
    if (!Array.isArray(specialDurationList) || specialDurationList.length === 0) {
      return baseLabel;
    }
    const specialDurationLabelByKey = {
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
    const label = specialDurationList
      .map((durationKey) =>
        game.i18n.localize(specialDurationLabelByKey[durationKey] ?? "POKROLE.Common.Unknown")
      )
      .join(", ");
    return `${baseLabel} + ${label}`;
  }

  _buildPokemonAbilityOptions() {
    const regularAbilityNames = this._parsePokemonAbilityList(
      this.actor.system?.availableAbilities?.regular
    );
    const hiddenAbilityNames = this._parsePokemonAbilityList(
      this.actor.system?.availableAbilities?.hidden
    );
    const embeddedAbilityNames = this.actor.items
      .filter((item) => item.type === "ability")
      .map((item) => `${item.name ?? ""}`.trim())
      .filter(Boolean);
    const currentAbility = `${this.actor.system?.ability ?? ""}`.trim();
    const seen = new Set();
    const options = [];

    const appendOption = (abilityName, labelSuffix = "") => {
      const normalizedName = `${abilityName ?? ""}`.trim();
      if (!normalizedName || seen.has(normalizedName)) return;
      seen.add(normalizedName);
      options.push({
        value: normalizedName,
        label: labelSuffix ? `${normalizedName} ${labelSuffix}` : normalizedName,
        selected: normalizedName === currentAbility
      });
    };

    const hiddenLabelSuffix = `(${game.i18n.localize("POKROLE.Pokemon.HiddenAbilityShort")})`;

    for (const abilityName of regularAbilityNames) appendOption(abilityName);
    for (const abilityName of hiddenAbilityNames) appendOption(abilityName, hiddenLabelSuffix);
    for (const abilityName of embeddedAbilityNames) appendOption(abilityName);
    appendOption(currentAbility);

    return options;
  }

  _parsePokemonAbilityList(rawValue) {
    const normalizedValue = `${rawValue ?? ""}`;
    if (!normalizedValue.trim()) return [];
    const seen = new Set();
    return normalizedValue
      .split(/[\r\n,;]+/)
      .map((entry) => `${entry ?? ""}`.trim())
      .filter((entry) => {
        if (!entry || seen.has(entry)) return false;
        seen.add(entry);
        return true;
      });
  }

  _prepareMoveData(move) {
    const category = move.system.category || "physical";
    const moveType = move.system.type || "normal";
    const reducedAccuracy = Number(move.system.reducedAccuracy ?? 0);
    const categoryLabel = game.i18n.localize(
      MOVE_CATEGORY_LABEL_BY_KEY[category] ?? "POKROLE.Common.Unknown"
    );
    const typeLabel = game.i18n.localize(
      MOVE_TYPE_LABEL_BY_KEY[moveType] ?? "POKROLE.Common.Unknown"
    );
    const accuracyLabel = [
      this._localizeTrait(move.system.accuracyAttribute),
      this._localizeTrait(move.system.accuracySkill)
    ].join(" + ");
    const accuracySummary =
      reducedAccuracy > 0 ? `${accuracyLabel} (-${reducedAccuracy})` : accuracyLabel;

    const usesPrimaryDamage = this._moveUsesPrimaryDamage(move.system);
    const damageAttribute = this._resolveDamageAttributeForDisplay(move.system);
    const damageSummary = usesPrimaryDamage
      ? `${this._localizeTrait(damageAttribute)} + ${Number(move.system.power ?? 0)}`
      : game.i18n.localize("POKROLE.Move.NoDirectDamage");

    const flags = [];
    if (move.system.highCritical) flags.push(game.i18n.localize("POKROLE.Move.HighCritical"));
    if (move.system.neverFail) flags.push(game.i18n.localize("POKROLE.Move.NeverFail"));
    const isRanged = move.system.isRanged || category === "special";
    if (isRanged) flags.push(game.i18n.localize("POKROLE.Move.IsRanged"));
    const priority = Number(move.system.priority ?? 0);
    if (priority !== 0) {
      flags.push(
        game.i18n.format("POKROLE.Move.PriorityWithValue", {
          value: priority > 0 ? `+${priority}` : `${priority}`
        })
      );
    }
    const isUsable = move.system?.isUsable !== false;
    const actionTag = this._normalizeMoveActionTag(move.system?.actionTag);
    const actionTagLabel = game.i18n.localize(
      `POKROLE.Move.ActionTagValues.${actionTag}`
    );
    const targetKey = this._normalizeMoveTarget(move.system?.target);
    const targetLabel = game.i18n.localize(
      MOVE_TARGET_LABEL_BY_KEY[targetKey] ?? "POKROLE.Common.Unknown"
    );
    const secondaryEffects = Array.isArray(move.system?.secondaryEffects)
      ? move.system.secondaryEffects
      : [];
    const secondarySummary = this._summarizeMoveSecondaryEffects(secondaryEffects);

    return {
      id: move.id,
      name: move.name,
      img: getMoveTypeIcon(moveType),
      isUsable,
      isRanged,
      actionTag,
      actionTagShort: actionTag,
      actionTagLabel,
      targetKey,
      targetLabel,
      categoryLabel,
      typeLabel,
      accuracySummary,
      damageSummary,
      secondarySummary,
      flagsSummary:
        flags.length > 0
          ? flags.join(", ")
          : game.i18n.localize("POKROLE.Common.None"),
      system: move.system
    };
  }

  _localizeTrait(traitKey) {
    const path = TRAIT_LABEL_BY_KEY[traitKey] ?? "POKROLE.Common.Unknown";
    return game.i18n.localize(path);
  }

  _resolveDamageAttributeForDisplay(moveSystem) {
    const damageAttribute = moveSystem.damageAttribute || "auto";
    if (damageAttribute !== "auto") return damageAttribute;
    return moveSystem.category === "special" ? "special" : "strength";
  }

  _normalizeMovePrimaryMode(primaryMode) {
    const normalized = `${primaryMode ?? "damage"}`.trim().toLowerCase();
    return normalized === "effect-only" ? "effect-only" : "damage";
  }

  _moveUsesPrimaryDamage(moveSystem) {
    const normalizedCategory = `${moveSystem?.category ?? "physical"}`.trim().toLowerCase();
    if (normalizedCategory === "support") return false;
    return this._normalizeMovePrimaryMode(moveSystem?.primaryMode) === "damage";
  }

  _prepareGearData(gear) {
    const rawPocketKey = `${gear.system.pocket ?? "main"}`.toLowerCase();
    const pocketKey = rawPocketKey === "held" ? "main" : rawPocketKey;
    const categoryLabel = game.i18n.localize(
      `POKROLE.Gear.Category.${this._toTitleCaseKey(gear.system.category)}`
    );
    const pocketLabel = game.i18n.localize(
      `POKROLE.Gear.Pocket.${this._toTitleCaseKey(pocketKey)}`
    );
    const pocketAllowsBattle = pocketKey === "potions" || pocketKey === "small";
    const usableInBattle = pocketAllowsBattle && Boolean(gear.system.canUseInBattle);

    const quantity = Number(gear.system.quantity ?? 0);
    const unitsValue = Number(gear.system.units?.value ?? 0);
    const unitsMax = Number(gear.system.units?.max ?? 0);
    const stockLabel =
      unitsMax > 0 ? `${quantity} x (${unitsValue}/${unitsMax})` : `${quantity}`;

    const effects = [];
    if (gear.system.heal?.fullHp) {
      effects.push(game.i18n.localize("POKROLE.Gear.FullHp"));
    } else if (Number(gear.system.heal?.hp ?? 0) > 0) {
      effects.push(
        game.i18n.format("POKROLE.Gear.HealHpShort", {
          value: Number(gear.system.heal.hp ?? 0)
        })
      );
    }
    if (Number(gear.system.heal?.lethal ?? 0) > 0) {
      effects.push(
        game.i18n.format("POKROLE.Gear.HealLethalShort", {
          value: Number(gear.system.heal.lethal ?? 0)
        })
      );
    }
    if (gear.system.heal?.restoreAwareness) {
      effects.push(game.i18n.localize("POKROLE.Gear.RestoreAwareness"));
    }
    if (gear.system.status?.all) {
      effects.push(game.i18n.localize("POKROLE.Gear.Status.All"));
    }

    const statusKeys = ["poison", "sleep", "burn", "frozen", "paralysis", "confusion"];
    const statusLabels = statusKeys
      .filter((statusKey) => gear.system.status?.[statusKey])
      .map((statusKey) =>
        game.i18n.localize(`POKROLE.Gear.Status.${this._toTitleCaseKey(statusKey)}`)
      );
    if (statusLabels.length > 0) {
      effects.push(statusLabels.join(", "));
    }

    return {
      id: gear.id,
      name: gear.name,
      img: gear.img,
      categoryLabel,
      pocketLabel,
      pocketKey,
      stockLabel,
      canUseInBattle: gear.system.canUseInBattle,
      usableInBattle,
      consumable: gear.system.consumable,
      effectsSummary:
        effects.length > 0 ? effects.join(" | ") : game.i18n.localize("POKROLE.Common.None")
    };
  }

  _normalizeMoveActionTag(actionTag) {
    const normalized = `${actionTag ?? "1A"}`.trim().toUpperCase();
    if (normalized === "2A" || normalized === "5A") return normalized;
    return "1A";
  }

  _normalizeMoveTarget(targetKey) {
    const normalized = `${targetKey ?? "foe"}`.trim().toLowerCase();
    if (MOVE_TARGET_LABEL_BY_KEY[normalized]) return normalized;
    return "foe";
  }

  _summarizeMoveSecondaryEffects(secondaryEffects) {
    if (!Array.isArray(secondaryEffects) || secondaryEffects.length === 0) {
      return game.i18n.localize("POKROLE.Common.None");
    }
    const entries = secondaryEffects
      .slice(0, 2)
      .map((effect) => {
        const label = `${effect?.label ?? ""}`.trim();
        if (label) return label;
        const effectType = `${effect?.effectType ?? "custom"}`.trim();
        const chance = Number(effect?.chance ?? 100);
      const suffixByType = {
        condition: "Condition",
        "active-effect": "ActiveEffect",
        stat: "Stat",
        cleanse: "Cleanse",
        weather: "Weather",
        damage: "Damage",
        heal: "Heal",
        will: "Will",
          custom: "Custom"
        };
        const typeLabel = game.i18n.localize(
          `POKROLE.Move.Secondary.Type.${suffixByType[effectType] ?? "Custom"}`
        );
        if (Number.isFinite(chance) && chance >= 0 && chance < 100) {
          return `${typeLabel} (${chance}%)`;
        }
        return typeLabel;
      })
      .filter((entry) => entry);
    if (!entries.length) {
      return game.i18n.localize("POKROLE.Common.None");
    }
    if (secondaryEffects.length > 2) {
      entries.push(`+${secondaryEffects.length - 2}`);
    }
    return entries.join(" | ");
  }

  _normalizeSheetEffectType(effectType) {
    const normalizedType = `${effectType ?? "condition"}`.trim().toLowerCase();
    if (normalizedType === "combat-stat") return "stat";
    if (MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(normalizedType)) return normalizedType;
    return "condition";
  }

  _buildActorConfiguredEffects() {
    return [];
  }

  _collectActorEffectsFromSheet(html) {
    const rows = html.find(".actor-effect-row").toArray();
    return rows.map((rowElement) => {
      const row = rowElement;
      const readValue = (field, fallback = "") =>
        `${row.querySelector(`[data-effect-field='${field}']`)?.value ?? fallback}`.trim();
      const readNumber = (field, fallback = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) => {
        const numeric = Number(readValue(field, fallback));
        if (!Number.isFinite(numeric)) return fallback;
        return Math.min(Math.max(Math.floor(numeric), min), max);
      };

      const effectType = this._normalizeSheetEffectType(readValue("effectType", "condition"));
      const durationMode = MOVE_SECONDARY_DURATION_MODE_KEYS.includes(readValue("durationMode", "manual"))
        ? readValue("durationMode", "manual")
        : "manual";
      const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(readValue("passiveTrigger", "always"))
        ? readValue("passiveTrigger", "always")
        : "always";
      const specialDurationSelect = row.querySelector("[data-effect-field='specialDuration']");
      const specialDuration = this._normalizeSpecialDurationList(
        [...(specialDurationSelect?.selectedOptions ?? [])].map((option) => option.value)
      );

      return {
        id: `${row.dataset.effectId ?? ""}`.trim(),
        label: readValue("label", ""),
        trigger: MOVE_SECONDARY_TRIGGER_KEYS.includes(readValue("trigger", "always"))
          ? readValue("trigger", "always")
          : "always",
        chance: readNumber("chance", 100, 0, 100),
        target: MOVE_SECONDARY_TARGET_KEYS.includes(readValue("target", "self"))
          ? readValue("target", "self")
          : "self",
        effectType,
        durationMode,
        durationRounds: readNumber("durationRounds", 1, 1, 99),
        specialDuration,
        condition: MOVE_SECONDARY_CONDITION_KEYS.includes(readValue("condition", "none"))
          ? readValue("condition", "none")
          : "none",
        stat: MOVE_SECONDARY_STAT_KEYS.includes(readValue("stat", "none"))
          ? readValue("stat", "none")
          : "none",
        amount: readNumber("amount", 0, -99, 99),
        notes: readValue("notes", ""),
        passive: Boolean(row.querySelector("[data-effect-field='passive']")?.checked),
        passiveTrigger,
        passiveCondition: MOVE_SECONDARY_CONDITION_KEYS.includes(readValue("passiveCondition", "none"))
          ? readValue("passiveCondition", "none")
          : "none",
        passiveThreshold: readNumber("passiveThreshold", 50, 1, 99)
      };
    });
  }

  _refreshActorEffectRowVisibility(row) {
    const effectTypeSelect = row.querySelector("[data-effect-field='effectType']");
    const effectType = this._normalizeSheetEffectType(effectTypeSelect?.value ?? "condition");
    const passiveTriggerSelect = row.querySelector("[data-effect-field='passiveTrigger']");
    const passiveTrigger = `${passiveTriggerSelect?.value ?? "always"}`.trim().toLowerCase();

    const toggleSection = (sectionKey, visible) => {
      const sectionElement = row.querySelector(`[data-effect-visible='${sectionKey}']`);
      if (!sectionElement) return;
      sectionElement.classList.toggle("is-hidden", !visible);
    };

    toggleSection("condition", effectType === "condition");
    toggleSection("stat", effectType === "stat");
    toggleSection("amount", ["stat", "damage", "heal", "will"].includes(effectType));
    toggleSection("duration", effectType === "condition" || effectType === "stat");
    toggleSection("specialDuration", effectType === "condition" || effectType === "stat");
    toggleSection("notes", effectType === "custom" || effectType === "cleanse");
    toggleSection(
      "passiveCondition",
      ["self-has-condition", "self-missing-condition", "target-has-condition", "target-missing-condition"].includes(passiveTrigger)
    );
    toggleSection(
      "passiveThreshold",
      ["self-hp-below-threshold", "target-hp-below-threshold"].includes(passiveTrigger)
    );
  }

  _getSecondaryConditionLabelPath(conditionKey) {
    const labelByCondition = {
      none: "POKROLE.Common.None",
      sleep: "POKROLE.Conditions.Sleep",
      burn: "POKROLE.Move.Secondary.Condition.Burn1",
      burn2: "POKROLE.Move.Secondary.Condition.Burn2",
      burn3: "POKROLE.Move.Secondary.Condition.Burn3",
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
    return labelByCondition[conditionKey] ?? "POKROLE.Common.Unknown";
  }

  _getSecondaryStatLabelPath(statKey) {
    const labelByStat = {
      none: "POKROLE.Common.None",
      defense: "POKROLE.Combat.Defense",
      specialDefense: "POKROLE.Combat.SpecialDefense",
      accuracy: "POKROLE.Pokemon.Accuracy",
      damage: "POKROLE.Pokemon.Damage",
      evasion: "POKROLE.Pokemon.Evasion",
      clash: "POKROLE.Pokemon.Clash"
    };
    return labelByStat[statKey] ?? TRAIT_LABEL_BY_KEY[statKey] ?? "POKROLE.Common.Unknown";
  }

  _normalizeSpecialDurationList(value) {
    const rawList = Array.isArray(value)
      ? value
      : typeof value === "string" && value.trim()
        ? value.split(",")
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
    const normalized = [];
    for (const entry of rawList) {
      const key = `${entry ?? ""}`.trim().toLowerCase();
      if (!key || key === "none") continue;
      if (!MOVE_SECONDARY_SPECIAL_DURATION_KEYS.includes(key)) continue;
      if (!normalized.includes(key)) normalized.push(key);
    }
    return normalized;
  }

  _buildAttributeRows(attributeKeys, trackMaxByKey = null, minValue = 0) {
    return attributeKeys.map((attributeKey) => {
      const value = Number(this.actor.system.attributes?.[attributeKey] ?? 0);
      const maxValue = this._resolveTrackMax(trackMaxByKey?.[attributeKey], 5);
      const track = this._buildTrack(value, maxValue, minValue);
      return {
        key: attributeKey,
        label: TRAIT_LABEL_BY_KEY[attributeKey] ?? "POKROLE.Common.Unknown",
        value: track.value,
        fieldPath: `system.attributes.${attributeKey}`,
        track
      };
    });
  }

  _buildSkillRows(skillKeys, trackMaxByKey = null, minValue = 0) {
    return skillKeys.map((skillKey) => {
      const value = Number(this.actor.system.skills?.[skillKey] ?? 0);
      const maxValue = this._resolveTrackMax(trackMaxByKey?.[skillKey], 5);
      const track = this._buildTrack(value, maxValue, minValue);
      return {
        key: skillKey,
        label: TRAIT_LABEL_BY_KEY[skillKey] ?? "POKROLE.Common.Unknown",
        value: track.value,
        fieldPath: `system.skills.${skillKey}`,
        track
      };
    });
  }

  _buildTrack(currentValue, maxValue, minValue = 1) {
    const numericCurrent = Number(currentValue);
    const normalizedCurrent = Number.isFinite(numericCurrent) ? numericCurrent : minValue;
    const clampedCurrent = Math.min(Math.max(normalizedCurrent, minValue), maxValue);
    const slots = [];
    for (let slotValue = 1; slotValue <= maxValue; slotValue += 1) {
      slots.push({
        value: slotValue,
        active: slotValue <= clampedCurrent
      });
    }
    return {
      min: minValue,
      max: maxValue,
      value: clampedCurrent,
      slots,
      style: `--track-columns:${maxValue};`
    };
  }

  _resolveTrackMax(value, fallback = 5) {
    const numeric = Number(value);
    const base = Number.isFinite(numeric) ? numeric : fallback;
    return Math.min(Math.max(Math.floor(base), 1), 12);
  }

  _getPokemonTrackMaxConfig() {
    const settings = this.actor.system.sheetSettings?.trackMax?.attributes ?? {};
    const attributes = Object.fromEntries(
      ATTRIBUTE_DEFINITIONS.map((attribute) => [
        attribute.key,
        CORE_ATTRIBUTE_KEY_SET.has(attribute.key)
          ? this._resolveTrackMax(settings?.[attribute.key], 12)
          : 5
      ])
    );
    const skills = Object.fromEntries(
      SKILL_DEFINITIONS.map((skill) => [
        skill.key,
        5
      ])
    );
    const extra = 5;
    return { attributes, skills, extra };
  }

  _toTitleCaseKey(value) {
    if (!value || typeof value !== "string") return "Other";
    return `${value[0].toUpperCase()}${value.slice(1)}`;
  }

  _applyPokemonTabState(html, tabName) {
    const tab = this._normalizePokemonView(tabName);
    html.find("[data-action='switch-pokemon-tab']").removeClass("is-active");
    html.find(`.pokemon-view-button[data-tab='${tab}']`).addClass("is-active");
    html.find(".pokemon-view-panel").removeClass("is-active");
    html.find(`.pokemon-view-panel[data-tab='${tab}']`).addClass("is-active");
  }

  _normalizePokemonView(tabName) {
    if (tabName === "learned" || tabName === "inventory" || tabName === "settings" || tabName === "effects") return tabName;
    return "main";
  }

  _applyTrainerTabState(html, tabName) {
    const tab = this._normalizeTrainerView(tabName);
    html.find("[data-action='switch-trainer-tab']").removeClass("is-active");
    html.find(`.trainer-view-button[data-tab='${tab}']`).addClass("is-active");
    html.find(".trainer-view-panel").removeClass("is-active");
    html.find(`.trainer-view-panel[data-tab='${tab}']`).addClass("is-active");
  }

  _buildPartyMembers() {
    const partyIds = this.actor.system.party ?? [];
    const members = [];
    for (const actorId of partyIds) {
      const pokemon = game.actors.get(actorId);
      if (!pokemon || pokemon.type !== "pokemon") continue;
      const primaryType = pokemon.system.types?.primary ?? "normal";
      const secondaryType = pokemon.system.types?.secondary ?? "none";
      members.push({
        id: pokemon.id,
        name: pokemon.name,
        img: pokemon.img,
        species: pokemon.system.species ?? "",
        hp: pokemon.system.resources?.hp?.value ?? 0,
        hpMax: pokemon.system.resources?.hp?.max ?? 0,
        will: pokemon.system.resources?.will?.value ?? 0,
        willMax: pokemon.system.resources?.will?.max ?? 0,
        primaryTypeIcon: primaryType !== "none" ? getMoveTypeIcon(primaryType) : null,
        primaryTypeLabel: primaryType !== "none" ? game.i18n.localize(MOVE_TYPE_LABEL_BY_KEY[primaryType] ?? "") : "",
        secondaryTypeIcon: secondaryType !== "none" ? getMoveTypeIcon(secondaryType) : null,
        secondaryTypeLabel: secondaryType !== "none" ? game.i18n.localize(MOVE_TYPE_LABEL_BY_KEY[secondaryType] ?? "") : ""
      });
    }
    return members;
  }

  async _onAddPartyMember(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer") return;
    const currentParty = this.actor.system.party ?? [];
    if (currentParty.length >= 6) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Trainer.PartyFull"));
      return;
    }
    const trainerId = this.actor.id;
    const ownedPokemon = game.actors.filter((a) => {
      if (a.type !== "pokemon" || currentParty.includes(a.id)) return false;
      return a.system.currentTrainer === trainerId;
    });
    if (!ownedPokemon.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Trainer.PartyNoAvailable"));
      return;
    }
    const options = ownedPokemon.map(
      (p) => `<option value="${p.id}">${p.name}${p.system.species ? ` (${p.system.species})` : ""}</option>`
    ).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.Trainer.PartySelect")}</label>
          <select name="pokemonId">${options}</select>
        </div>
      </form>
    `;
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: game.i18n.localize("POKROLE.Trainer.PartyAdd") },
      content,
      buttons: [
        {
          action: "add",
          label: game.i18n.localize("POKROLE.Trainer.PartyAdd"),
          icon: "fas fa-plus",
          callback: (event, button) => {
            return button.form.elements.pokemonId?.value ?? null;
          }
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel")
        }
      ]
    });
    if (!result) return;
    const newParty = [...currentParty, result];
    await this.actor.update({ "system.party": newParty });
  }

  async _onRemovePartyMember(event) {
    event.preventDefault();
    if (this.actor.type !== "trainer") return;
    const actorId = event.currentTarget.dataset.actorId;
    if (!actorId) return;
    const currentParty = this.actor.system.party ?? [];
    const newParty = currentParty.filter((id) => id !== actorId);
    await this.actor.update({ "system.party": newParty });
  }

  _onOpenPartyMember(event) {
    event.preventDefault();
    const actorId = event.currentTarget.dataset.actorId;
    if (!actorId) return;
    const pokemon = game.actors.get(actorId);
    if (pokemon) pokemon.sheet.render(true);
  }

  async _onDrop(event) {
    // If dropped on a learnset zone, let _onDropLearnsetMove handle it exclusively
    const learnsetZone = event.target.closest(".learnset-rank-drop-zone");
    if (learnsetZone) return;

    // Handle battle item drop
    const battleItemDrop = event.target.closest("[data-action='drop-battle-item']");
    if (battleItemDrop && this.actor.type === "pokemon") {
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch {
        return;
      }
      if (data.type !== "Item") return;
      const item = await fromUuid(data.uuid);
      if (!item || item.type !== "gear") {
        ui.notifications.warn(game.i18n.localize("POKROLE.Pokemon.DropItemOnly"));
        return;
      }
      await this.actor.update({ "system.battleItem": item.id });
      return;
    }

    const dropTarget = event.target.closest("[data-action='drop-trainer']");
    if (dropTarget && this.actor.type === "pokemon") {
      if (!game.user.isGM) return;
      let data;
      try {
        data = JSON.parse(event.dataTransfer.getData("text/plain"));
      } catch {
        return;
      }
      if (data.type !== "Actor") return;
      const actor = await fromUuid(data.uuid);
      if (!actor || actor.type !== "trainer") {
        ui.notifications.warn(game.i18n.localize("POKROLE.Pokemon.DropTrainerOnly"));
        return;
      }
      const field = dropTarget.dataset.field;
      if (!field) return;
      await this.actor.update({ [field]: actor.id });
      if (field === "system.currentTrainer") {
        await this._syncOwnershipFromTrainer(actor);
      }
      return;
    }
    return super._onDrop(event);
  }

  async _onClearBattleItem(event) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;
    await this.actor.update({ "system.battleItem": "" });
  }

  async _onClearTrainerField(event) {
    event.preventDefault();
    if (this.actor.type !== "pokemon") return;
    if (!game.user.isGM) return;
    const field = event.currentTarget.dataset.field;
    if (!field) return;
    await this.actor.update({ [field]: "" });
  }

  async _syncOwnershipFromTrainer(trainerActor) {
    const trainerOwnership = trainerActor.ownership ?? {};
    const pokemonOwnership = foundry.utils.deepClone(this.actor.ownership ?? {});
    let changed = false;
    for (const [userId, level] of Object.entries(trainerOwnership)) {
      if (userId === "default") continue;
      if (level === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
        if (pokemonOwnership[userId] !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
          pokemonOwnership[userId] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
          changed = true;
        }
      }
    }
    if (changed) {
      await this.actor.update({ ownership: pokemonOwnership });
    }
  }

  _normalizeTrainerView(tabName) {
    if (tabName === "inventory" || tabName === "effects" || tabName === "bio" || tabName === "party") return tabName;
    return "main";
  }

  _localizeCoverLabel(coverKey) {
    const normalized = `${coverKey ?? "none"}`.trim().toLowerCase();
    const labelByKey = {
      none: "POKROLE.Common.None",
      quarter: "POKROLE.Combat.CoverQuarter",
      half: "POKROLE.Combat.CoverHalf",
      full: "POKROLE.Combat.CoverFull"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  _localizeWeatherLabel(weatherKey) {
    const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
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

  _buildPokemonMatchups() {
    const primary = this.actor.system.types?.primary;
    const secondary = this.actor.system.types?.secondary;
    const defenderTypes = [primary, secondary].filter((typeKey) => typeKey && typeKey !== "none");

    const matchupGroups = MATCHUP_GROUP_DEFINITIONS.map((group) => ({
      ...group,
      entries: []
    }));
    const groupByMultiplier = new Map(
      matchupGroups.map((group) => [group.multiplier, group])
    );

    for (const attackType of TYPE_OPTIONS) {
      if (attackType === "none") continue;
      const table = TYPE_EFFECTIVENESS[attackType];
      if (!table) continue;

      let multiplier = 1;
      for (const defenderType of defenderTypes) {
        if (table.immune.includes(defenderType)) {
          multiplier = 0;
          break;
        }
        if (table.double.includes(defenderType)) multiplier *= 2;
        if (table.half.includes(defenderType)) multiplier *= 0.5;
      }

      const group = groupByMultiplier.get(multiplier);
      if (!group) continue;

      group.entries.push({
        typeKey: attackType,
        labelPath: MOVE_TYPE_LABEL_BY_KEY[attackType] ?? "POKROLE.Common.Unknown",
        icon: getMoveTypeIcon(attackType)
      });
    }

    return matchupGroups;
  }

  _buildConditionChips() {
    const conditionFlags =
      typeof this.actor.getConditionFlags === "function" ? this.actor.getConditionFlags() : {};
    return AILMENT_DEFINITIONS.map((ailment) => ({
      ...ailment,
      key: ailment.key,
      fieldPath: `system.conditions.${ailment.key}`,
      active: Boolean(
        conditionFlags[ailment.key] ??
          this.actor.system.conditions?.[ailment.key] ??
          this.actor.getFlag(POKROLE.ID, `automation.conditions.${ailment.key}`)
      )
    }));
  }

  _buildTemporaryEffects() {
    const rawEntries = this.actor.getFlag(POKROLE.ID, "automation.temporaryEffects");
    const legacyEntries = Array.isArray(rawEntries)
      ? rawEntries
          .filter((entry) => entry && typeof entry === "object")
          .map((entry) => {
            const sourceMoveName = `${entry.sourceMoveName ?? ""}`.trim();
            const sourceActorName = `${entry.sourceActorName ?? ""}`.trim();

            let sourceLabel = game.i18n.localize("POKROLE.TemporaryEffects.SourceUnknown");
            if (sourceMoveName && sourceActorName) {
              sourceLabel = game.i18n.format("POKROLE.TemporaryEffects.SourceMoveActor", {
                move: sourceMoveName,
                actor: sourceActorName
              });
            } else if (sourceMoveName) {
              sourceLabel = game.i18n.format("POKROLE.TemporaryEffects.SourceMove", {
                move: sourceMoveName
              });
            }

            const durationMode = `${entry.durationMode ?? "manual"}`.trim().toLowerCase();
            let durationLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
            if (durationMode === "combat") {
              durationLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationCombat");
            } else if (durationMode === "rounds") {
              const rounds = Math.min(
                Math.max(Math.floor(Number(entry.remainingRounds ?? 1) || 1), 1),
                99
              );
              durationLabel = game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
                rounds
              });
            }
            return {
              id: `${entry.id ?? ""}`.trim(),
              label: `${entry.label ?? ""}`.trim() || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
              sourceLabel,
              durationLabel,
              createdAt: Number(entry.createdAt ?? 0)
            };
          })
      : [];

    return legacyEntries
      .filter((entry) => entry.id)
      .sort((left, right) => Number(right.createdAt ?? 0) - Number(left.createdAt ?? 0));
  }

  // ---------------------------------------------------------------------------
  // Point Distribution System
  // ---------------------------------------------------------------------------

  async _updateObject(event, formData) {
    if (this.actor.type === "trainer") {
      const ageChanged = ("system.age" in formData) &&
        Number(formData["system.age"]) !== Number(this.actor.system.age);
      const rankChanged = ("system.cardRank" in formData) &&
        formData["system.cardRank"] !== this.actor.system.cardRank;

      if (ageChanged || rankChanged) {
        const age = Number(formData["system.age"] ?? this.actor.system.age);
        const rank = formData["system.cardRank"] ?? this.actor.system.cardRank;
        const oldAge = Number(this.actor.system.age) || 0;
        const oldRank = this.actor.system.cardRank;

        const ageBonuses = this._getAgeBonuses(age);
        const rankBonuses = this._getRankBonuses(rank);

        if (ageChanged) {
          // Age changed: show dialog FIRST, only save if confirmed
          const totalAttr = ageBonuses.attr + rankBonuses.attr;
          const totalSocial = ageBonuses.social + rankBonuses.social;
          const totalSkill = rankBonuses.skill;
          const skillLimit = rankBonuses.skillLimit;

          if (totalAttr > 0 || totalSocial > 0 || totalSkill > 0) {
            // Only pass age/rank fields, not the entire form (which includes old attribute values)
            const ageRankData = {};
            if ("system.age" in formData) ageRankData["system.age"] = formData["system.age"];
            if ("system.cardRank" in formData) ageRankData["system.cardRank"] = formData["system.cardRank"];
            const confirmed = await this._showPointDistributionDialog(totalAttr, totalSocial, totalSkill, skillLimit, {
              trackRank: rank,
              pendingFormData: ageRankData
            });
            if (confirmed) {
              await this.actor.setFlag("pok-role-system", "rankDistributions", {});
            }
            // If cancelled, nothing changes
          } else {
            await this.actor.update(formData);
            await this.actor.setFlag("pok-role-system", "rankDistributions", {});
            const resetData = {};
            for (const { key } of CORE_ATTRIBUTE_DEFINITIONS) resetData[`system.attributes.${key}`] = 1;
            for (const { key } of SOCIAL_ATTRIBUTE_DEFINITIONS) resetData[`system.attributes.${key}`] = 1;
            for (const { key } of SKILL_DEFINITIONS) resetData[`system.skills.${key}`] = 0;
            await this.actor.update(resetData);
          }
        } else {
          // Only rank changed
          const rankOrder = ["none", "starter", "rookie", "standard", "advanced", "expert", "ace", "master", "champion"];
          const oldIdx = rankOrder.indexOf(oldRank);
          const newIdx = rankOrder.indexOf(rank);

          if (newIdx > oldIdx) {
            // Upgrade: show dialog FIRST, only save rank if confirmed
            const oldRankBonuses = this._getRankBonuses(oldRank);
            const diffAttr = rankBonuses.attr - oldRankBonuses.attr;
            const diffSocial = rankBonuses.social - oldRankBonuses.social;
            const diffSkill = rankBonuses.skill - oldRankBonuses.skill;
            const skillLimit = rankBonuses.skillLimit;

            if (diffAttr > 0 || diffSocial > 0 || diffSkill > 0) {
              const currentAttrBase = {};
              for (const { key } of CORE_ATTRIBUTE_DEFINITIONS) {
                currentAttrBase[key] = Number(this.actor.system.attributes?.[key] ?? 1);
              }
              const currentSocialBase = {};
              for (const { key } of SOCIAL_ATTRIBUTE_DEFINITIONS) {
                currentSocialBase[key] = Number(this.actor.system.attributes?.[key] ?? 1);
              }
              const currentSkillBase = {};
              for (const { key } of SKILL_DEFINITIONS) {
                currentSkillBase[key] = Number(this.actor.system.skills?.[key] ?? 0);
              }
              const currentExtraSkills = Array.isArray(this.actor.system.extraSkills)
                ? this.actor.system.extraSkills : [];
              for (let i = 0; i < currentExtraSkills.length; i++) {
                currentSkillBase[`extra_${i}`] = Number(currentExtraSkills[i].value ?? 0);
              }
              const confirmed = await this._showPointDistributionDialog(diffAttr, diffSocial, diffSkill, skillLimit, {
                attrBase: currentAttrBase,
                socialBase: currentSocialBase,
                skillBase: currentSkillBase,
                trackRank: rank,
                pendingFormData: { "system.cardRank": rank }
              });
              // If cancelled, rank stays at oldRank - nothing to revert
            } else {
              // No points to distribute, just save the rank
              await this.actor.update(formData);
            }
          } else if (newIdx < oldIdx) {
            // Downgrade: save rank change then remove points
            await this.actor.update(formData);
            await this._applyRankDowngrade(oldRank, rank, rankOrder);
          }
        }
        return;
      }
    }
    if (this.actor.type === "pokemon") {
      const tierChanged = ("system.tier" in formData) &&
        formData["system.tier"] !== this.actor.system.tier;

      if (tierChanged) {
        const newTier = formData["system.tier"];
        const oldTier = this.actor.system.tier;
        const tierOrder = POKEMON_TIER_KEYS;
        const oldIdx = tierOrder.indexOf(oldTier);
        const newIdx = tierOrder.indexOf(newTier);

        if (newIdx > oldIdx) {
          // Tier upgrade
          const newBonuses = this._getPokemonTierBonuses(newTier);
          const oldBonuses = this._getPokemonTierBonuses(oldTier);
          const diffAttr = newBonuses.attr - oldBonuses.attr;
          const diffSocial = newBonuses.social - oldBonuses.social;
          const diffSkill = newBonuses.skill - oldBonuses.skill;
          const skillLimit = newBonuses.skillLimit;

          if (diffAttr > 0 || diffSocial > 0 || diffSkill > 0) {
            const currentAttrBase = {};
            for (const { key } of CORE_ATTRIBUTE_DEFINITIONS) {
              currentAttrBase[key] = Number(this.actor.system.attributes?.[key] ?? 1);
            }
            const currentSocialBase = {};
            for (const { key } of SOCIAL_ATTRIBUTE_DEFINITIONS) {
              currentSocialBase[key] = Number(this.actor.system.attributes?.[key] ?? 1);
            }
            const currentSkillBase = {};
            for (const { key } of SKILL_DEFINITIONS) {
              currentSkillBase[key] = Number(this.actor.system.skills?.[key] ?? 0);
            }
            const currentExtraSkills = Array.isArray(this.actor.system.extraSkills)
              ? this.actor.system.extraSkills : [];
            for (let i = 0; i < currentExtraSkills.length; i++) {
              currentSkillBase[`extra_${i}`] = Number(currentExtraSkills[i].value ?? 0);
            }
            const confirmed = await this._showPointDistributionDialog(diffAttr, diffSocial, diffSkill, skillLimit, {
              attrBase: currentAttrBase,
              socialBase: currentSocialBase,
              skillBase: currentSkillBase,
              trackRank: newTier,
              pendingFormData: { "system.tier": newTier },
              attrMax: 12
            });
            // If cancelled, tier stays at oldTier
          } else {
            await this.actor.update(formData);
          }
        } else if (newIdx < oldIdx) {
          // Tier downgrade
          await this.actor.update(formData);
          await this._applyPokemonTierDowngrade(oldTier, newTier, tierOrder);
        }
        return;
      }
    }

    return super._updateObject(event, formData);
  }

  _getAgeBonuses(age) {
    const numAge = Number(age) || 0;
    if (numAge <= 12) return { attr: 0, social: 0 };
    if (numAge <= 19) return { attr: 2, social: 2 };
    if (numAge <= 59) return { attr: 4, social: 4 };
    return { attr: 3, social: 6 };
  }

  _getRankBonuses(rank) {
    const table = {
      none:     { attr: 0,  social: 0,  skill: 0,  skillLimit: 0 },
      starter:  { attr: 0,  social: 0,  skill: 5,  skillLimit: 1 },
      rookie:   { attr: 2,  social: 2,  skill: 10, skillLimit: 2 },
      standard: { attr: 4,  social: 4,  skill: 14, skillLimit: 3 },
      advanced: { attr: 6,  social: 6,  skill: 17, skillLimit: 4 },
      expert:   { attr: 8,  social: 8,  skill: 19, skillLimit: 5 },
      ace:      { attr: 10, social: 10, skill: 20, skillLimit: 5 },
      master:   { attr: 10, social: 10, skill: 22, skillLimit: 5 },
      champion: { attr: 14, social: 14, skill: 25, skillLimit: 5 }
    };
    return table[rank] ?? table.starter;
  }

  async _showPointDistributionDialog(totalAttrPoints, totalSocialPoints, totalSkillPoints, skillLimit, options = {}) {
    const { attrBase = {}, socialBase = {}, skillBase = {}, trackRank = null, pendingFormData = null, attrMax = 5 } = options;
    const loc = (key) => game.i18n.localize(key);

    const isTrainer = this.actor.type === "trainer";
    const filteredCoreAttrDefs = isTrainer
      ? CORE_ATTRIBUTE_DEFINITIONS.filter((a) => a.key !== "special")
      : CORE_ATTRIBUTE_DEFINITIONS;
    const trainerSkillOrder = [
      "brawl", "channel", "clash", "evasion",
      "alert", "athletic", "nature", "stealth",
      "empathy", "etiquette", "intimidate", "perform",
      "crafts", "lore", "medicine", "science"
    ];
    const pokemonSkillOrder = [
      "brawl", "channel", "clash", "evasion",
      "alert", "athletic", "nature", "stealth",
      "charm", "etiquette", "intimidate", "perform"
    ];
    const skillOrder = isTrainer ? trainerSkillOrder : pokemonSkillOrder;
    const filteredSkillDefs = skillOrder
      .map((key) => SKILL_DEFINITIONS.find((s) => s.key === key))
      .filter(Boolean);

    const coreAttrs = filteredCoreAttrDefs.map((a) => ({
      key: a.key, label: loc(a.label), value: attrBase[a.key] ?? 1
    }));
    const socialAttrs = SOCIAL_ATTRIBUTE_DEFINITIONS.map((a) => ({
      key: a.key, label: loc(a.label), value: socialBase[a.key] ?? 1
    }));
    const skills = filteredSkillDefs.map((s) => ({
      key: s.key, label: loc(s.label), value: skillBase[s.key] ?? 0
    }));

    // Include extra skills
    const extraSkills = Array.isArray(this.actor.system.extraSkills)
      ? this.actor.system.extraSkills : [];
    const extraSkillItems = extraSkills.map((es, idx) => ({
      key: `extra_${idx}`,
      label: es.name || `Extra ${idx + 1}`,
      value: skillBase[`extra_${idx}`] ?? es.value ?? 0
    }));

    const buildRows = (items, category) => items.map((item) =>
      `<div class="point-dist-row" data-category="${category}" data-key="${item.key}">
        <span class="point-dist-label">${item.label}</span>
        <button type="button" class="point-dist-btn point-dist-minus" data-dir="-1">-</button>
        <span class="point-dist-value">${item.value}</span>
        <button type="button" class="point-dist-btn point-dist-plus" data-dir="1">+</button>
      </div>`
    ).join("");

    const content = `
      <form class="point-distribution-dialog">
        <p style="margin-bottom:8px;font-style:italic;">
          ${loc("POKROLE.Dialog.SkillLimit")}: <strong>${skillLimit}</strong>
        </p>

        <div class="point-dist-section">
          <div class="point-dist-header">${loc("POKROLE.Dialog.AttributePoints")}
            &mdash; <span class="point-dist-remaining" data-pool="attr">${totalAttrPoints}</span> ${loc("POKROLE.Dialog.Remaining")}
          </div>
          ${buildRows(coreAttrs, "attr")}
        </div>

        <div class="point-dist-section">
          <div class="point-dist-header">${loc("POKROLE.Dialog.SocialPoints")}
            &mdash; <span class="point-dist-remaining" data-pool="social">${totalSocialPoints}</span> ${loc("POKROLE.Dialog.Remaining")}
          </div>
          ${buildRows(socialAttrs, "social")}
        </div>

        <div class="point-dist-section">
          <div class="point-dist-header">${loc("POKROLE.Dialog.SkillPoints")}
            &mdash; <span class="point-dist-remaining" data-pool="skill">${totalSkillPoints}</span> ${loc("POKROLE.Dialog.Remaining")}
          </div>
          ${buildRows(skills, "skill")}
          ${extraSkillItems.length > 0 ? buildRows(extraSkillItems, "skill") : ""}
        </div>
      </form>
    `;

    // Shared state object that the callback can read
    const state = {
      values: {},
      resolved: false
    };
    // Initialize with base values
    for (const a of filteredCoreAttrDefs) state.values[`attr:${a.key}`] = attrBase[a.key] ?? 1;
    for (const a of SOCIAL_ATTRIBUTE_DEFINITIONS) state.values[`social:${a.key}`] = socialBase[a.key] ?? 1;
    for (const s of filteredSkillDefs) state.values[`skill:${s.key}`] = skillBase[s.key] ?? 0;
    for (const es of extraSkillItems) state.values[`skill:${es.key}`] = es.value;

    return new Promise((resolve) => {
      const dlg = new Dialog({
        title: loc("POKROLE.Dialog.DistributePoints"),
        content,
        buttons: {
          confirm: {
            icon: '<i class="fas fa-check"></i>',
            label: loc("POKROLE.Common.Confirm"),
            callback: async () => {
              const updateData = {};
              const distributed = { attr: {}, social: {}, skill: {} };
              const updatedExtraSkills = foundry.utils.deepClone(extraSkills);
              for (const [compositeKey, val] of Object.entries(state.values)) {
                const [category, key] = compositeKey.split(":");
                const base = category === "attr" ? (attrBase[key] ?? 1)
                  : category === "social" ? (socialBase[key] ?? 1)
                  : (skillBase[key] ?? 0);
                if (category === "attr" || category === "social") {
                  updateData[`system.attributes.${key}`] = val;
                } else if (key.startsWith("extra_")) {
                  const idx = parseInt(key.replace("extra_", ""), 10);
                  if (updatedExtraSkills[idx]) updatedExtraSkills[idx].value = val;
                } else {
                  updateData[`system.skills.${key}`] = val;
                }
                const added = val - base;
                if (added > 0) distributed[category][key] = added;
              }
              if (extraSkills.length > 0) {
                updateData["system.extraSkills"] = updatedExtraSkills;
              }
              // Include pending form data (rank/age change) in the same update
              if (pendingFormData) {
                Object.assign(updateData, pendingFormData);
              }
              await this.actor.update(updateData);
              if (trackRank) {
                const allDist = this.actor.getFlag("pok-role-system", "rankDistributions") ?? {};
                allDist[trackRank] = distributed;
                await this.actor.setFlag("pok-role-system", "rankDistributions", allDist);
              }
              ui.notifications.info(loc("POKROLE.Dialog.PointsDistributed"));
              state.resolved = true;
              resolve(true);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: loc("POKROLE.Common.Cancel"),
            callback: () => { state.resolved = true; resolve(false); }
          }
        },
        default: "confirm",
        close: () => { if (!state.resolved) resolve(false); },
        render: (html) => {
          const pools = {
            attr: totalAttrPoints,
            social: totalSocialPoints,
            skill: totalSkillPoints
          };
          const maxByCategory = {
            attr: attrMax,
            social: 5,
            skill: skillLimit
          };
          const attrBaseByKey = {};
          for (const a of filteredCoreAttrDefs) attrBaseByKey[a.key] = attrBase[a.key] ?? 1;
          const socialBaseByKey = {};
          for (const a of SOCIAL_ATTRIBUTE_DEFINITIONS) socialBaseByKey[a.key] = socialBase[a.key] ?? 1;
          const skillBaseByKey = {};
          for (const s of filteredSkillDefs) skillBaseByKey[s.key] = skillBase[s.key] ?? 0;
          for (const es of extraSkillItems) skillBaseByKey[es.key] = es.value;

          const confirmBtn = html.closest(".dialog").find("button[data-button='confirm']");
          confirmBtn.prop("disabled", true);

          const updateConfirmButton = () => {
            const allSpent = pools.attr === 0 && pools.social === 0 && pools.skill === 0;
            confirmBtn.prop("disabled", !allSpent);
          };

          const updateRemaining = () => {
            for (const [pool, remaining] of Object.entries(pools)) {
              html.find(`.point-dist-remaining[data-pool="${pool}"]`).text(remaining);
            }
            updateConfirmButton();
          };

          html.find(".point-dist-btn").on("click", (event) => {
            event.preventDefault();
            const btn = $(event.currentTarget);
            const row = btn.closest(".point-dist-row");
            const category = row.data("category");
            const key = row.data("key");
            const dir = Number(btn.data("dir"));
            const valueEl = row.find(".point-dist-value");
            const current = Number(valueEl.text());
            const base = category === "attr" ? (attrBaseByKey[key] ?? 1)
              : category === "social" ? (socialBaseByKey[key] ?? 1)
              : (skillBaseByKey[key] ?? 0);
            const max = maxByCategory[category];
            const newVal = current + dir;

            if (newVal < base || newVal > max) return;
            if (dir > 0 && pools[category] <= 0) return;
            if (dir < 0 && current <= base) return;

            valueEl.text(newVal);
            pools[category] -= dir;
            state.values[`${category}:${key}`] = newVal;
            updateRemaining();
          });

          updateConfirmButton();
        }
      }, {
        width: 420,
        height: "auto",
        resizable: true,
        classes: ["pok-role", "point-distribution"]
      });
      dlg.render(true);
    });
  }

  _getPokemonTierBonuses(tier) {
    const table = {
      none:     { attr: 0,  social: 0,  skill: 0,  skillLimit: 0 },
      starter:  { attr: 0,  social: 0,  skill: 5,  skillLimit: 1 },
      rookie:   { attr: 2,  social: 2,  skill: 10, skillLimit: 2 },
      standard: { attr: 4,  social: 4,  skill: 14, skillLimit: 3 },
      advanced: { attr: 6,  social: 6,  skill: 17, skillLimit: 4 },
      expert:   { attr: 8,  social: 8,  skill: 19, skillLimit: 5 },
      ace:      { attr: 10, social: 10, skill: 20, skillLimit: 5 },
      master:   { attr: 10, social: 10, skill: 22, skillLimit: 5 },
      champion: { attr: 14, social: 14, skill: 25, skillLimit: 5 }
    };
    return table[tier] ?? table.none;
  }

  async _applyPokemonTierDowngrade(oldTier, newTier, tierOrder) {
    const allDist = this.actor.getFlag("pok-role-system", "rankDistributions") ?? {};
    const oldIdx = tierOrder.indexOf(oldTier);
    const newIdx = tierOrder.indexOf(newTier);

    const toRemove = { attr: {}, social: {}, skill: {} };
    for (let i = oldIdx; i > newIdx; i--) {
      const tierKey = tierOrder[i];
      const dist = allDist[tierKey];
      if (!dist) continue;
      for (const category of ["attr", "social", "skill"]) {
        if (!dist[category]) continue;
        for (const [key, val] of Object.entries(dist[category])) {
          toRemove[category][key] = (toRemove[category][key] ?? 0) + val;
        }
      }
    }

    const updateData = {};
    for (const { key } of CORE_ATTRIBUTE_DEFINITIONS) {
      const current = Number(this.actor.system.attributes?.[key] ?? 1);
      const remove = toRemove.attr[key] ?? 0;
      updateData[`system.attributes.${key}`] = Math.max(current - remove, 1);
    }
    for (const { key } of SOCIAL_ATTRIBUTE_DEFINITIONS) {
      const current = Number(this.actor.system.attributes?.[key] ?? 1);
      const remove = toRemove.social[key] ?? 0;
      updateData[`system.attributes.${key}`] = Math.max(current - remove, 1);
    }
    for (const { key } of SKILL_DEFINITIONS) {
      const current = Number(this.actor.system.skills?.[key] ?? 0);
      const remove = toRemove.skill[key] ?? 0;
      updateData[`system.skills.${key}`] = Math.max(current - remove, 0);
    }

    const currentExtraSkills = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills) : [];
    for (let i = 0; i < currentExtraSkills.length; i++) {
      const extraKey = `extra_${i}`;
      const remove = toRemove.skill[extraKey] ?? 0;
      if (remove > 0) {
        currentExtraSkills[i].value = Math.max((currentExtraSkills[i].value ?? 0) - remove, 0);
      }
    }

    const newSkillLimit = this._getPokemonTierBonuses(newTier).skillLimit;
    for (const { key } of SKILL_DEFINITIONS) {
      if (updateData[`system.skills.${key}`] > newSkillLimit) {
        updateData[`system.skills.${key}`] = newSkillLimit;
      }
    }
    for (const es of currentExtraSkills) {
      if (es.value > newSkillLimit) es.value = newSkillLimit;
    }

    updateData["system.extraSkills"] = currentExtraSkills;
    await this.actor.update(updateData);

    const newDist = { ...allDist };
    for (let i = oldIdx; i > newIdx; i--) {
      delete newDist[tierOrder[i]];
    }
    await this.actor.setFlag("pok-role-system", "rankDistributions", newDist);

    ui.notifications.info(game.i18n.localize("POKROLE.Dialog.PointsDistributed"));
  }

  async _applyRankDowngrade(oldRank, newRank, rankOrder) {
    const allDist = this.actor.getFlag("pok-role-system", "rankDistributions") ?? {};
    const oldIdx = rankOrder.indexOf(oldRank);
    const newIdx = rankOrder.indexOf(newRank);

    // Collect all points distributed for ranks that are being removed
    const toRemove = { attr: {}, social: {}, skill: {} };
    for (let i = oldIdx; i > newIdx; i--) {
      const rankKey = rankOrder[i];
      const dist = allDist[rankKey];
      if (!dist) continue;
      for (const category of ["attr", "social", "skill"]) {
        if (!dist[category]) continue;
        for (const [key, val] of Object.entries(dist[category])) {
          toRemove[category][key] = (toRemove[category][key] ?? 0) + val;
        }
      }
    }

    // Apply the removal to current values
    const updateData = {};
    for (const { key } of CORE_ATTRIBUTE_DEFINITIONS) {
      const current = Number(this.actor.system.attributes?.[key] ?? 1);
      const remove = toRemove.attr[key] ?? 0;
      updateData[`system.attributes.${key}`] = Math.max(current - remove, 1);
    }
    for (const { key } of SOCIAL_ATTRIBUTE_DEFINITIONS) {
      const current = Number(this.actor.system.attributes?.[key] ?? 1);
      const remove = toRemove.social[key] ?? 0;
      updateData[`system.attributes.${key}`] = Math.max(current - remove, 1);
    }
    for (const { key } of SKILL_DEFINITIONS) {
      const current = Number(this.actor.system.skills?.[key] ?? 0);
      const remove = toRemove.skill[key] ?? 0;
      updateData[`system.skills.${key}`] = Math.max(current - remove, 0);
    }

    // Handle extra skills
    const currentExtraSkills = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills) : [];
    for (let i = 0; i < currentExtraSkills.length; i++) {
      const extraKey = `extra_${i}`;
      const remove = toRemove.skill[extraKey] ?? 0;
      if (remove > 0) {
        currentExtraSkills[i].value = Math.max((currentExtraSkills[i].value ?? 0) - remove, 0);
      }
    }

    // Also enforce the new skill limit
    const newSkillLimit = this._getRankBonuses(newRank).skillLimit;
    for (const { key } of SKILL_DEFINITIONS) {
      if (updateData[`system.skills.${key}`] > newSkillLimit) {
        updateData[`system.skills.${key}`] = newSkillLimit;
      }
    }
    for (const es of currentExtraSkills) {
      if (es.value > newSkillLimit) es.value = newSkillLimit;
    }

    updateData["system.extraSkills"] = currentExtraSkills;
    await this.actor.update(updateData);

    // Remove distribution history for removed ranks
    const newDist = { ...allDist };
    for (let i = oldIdx; i > newIdx; i--) {
      delete newDist[rankOrder[i]];
    }
    await this.actor.setFlag("pok-role-system", "rankDistributions", newDist);

    ui.notifications.info(game.i18n.localize("POKROLE.Dialog.PointsDistributed"));
  }
}
