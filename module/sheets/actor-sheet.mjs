import {
  ATTRIBUTE_DEFINITIONS,
  CORE_ATTRIBUTE_DEFINITIONS,
  getSystemAssetPath,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_TARGET_LABEL_BY_KEY,
  MOVE_TYPE_LABEL_BY_KEY,
  POKROLE,
  POKEMON_TIER_KEYS,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
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
    icon: "icons/svg/heart.svg"
  },
  {
    key: "badly-poisoned",
    labelPath: "POKROLE.Move.Secondary.Condition.BadlyPoisoned",
    icon: "icons/svg/skull.svg"
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
    context.initiativeScore = Number(this.actor.system.combat?.initiative ?? 0);
    context.baseInitiativeScore = this.actor.getInitiativeScore();
    context.defense = this.actor.getDefense("physical");
    context.specialDefense = this.actor.getDefense("special");
    context.painPenalty = this.actor.getPainPenalty();
    context.actionTrack = this._buildTrack(this.actor.system.combat?.actionNumber, 5, 1);
    context.badgesTrack = this._buildTrack(this.actor.system.badges, 8, 0);
    context.trainerRankOptions = TRAINER_CARD_RANK_LABEL_BY_KEY;
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
      damage: "POKROLE.Move.Secondary.Type.Damage",
      heal: "POKROLE.Move.Secondary.Type.Heal",
      will: "POKROLE.Move.Secondary.Type.Will",
      custom: "POKROLE.Move.Secondary.Type.Custom"
    };
    context.effectDurationModeOptions = {
      manual: "POKROLE.Move.Secondary.Duration.Mode.Manual",
      rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds",
      combat: "POKROLE.Move.Secondary.Duration.Mode.Combat"
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
      context.trainerPhysicalMentalAttributes = this._buildAttributeRows([
        "strength",
        "vitality",
        "dexterity",
        "insight",
        "special"
      ]);
      context.trainerSocialAttributes = this._buildAttributeRows([
        "tough",
        "beauty",
        "cool",
        "cute",
        "clever",
        "allure"
      ]);
    }
    if (this.actor.type === "pokemon") {
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
        "clever",
        "allure"
      ], trackMax.attributes, 1);
      context.pokemonSkillRows = this._buildSkillRows(pokemonSkillKeys, trackMax.skills, 0);
      context.pokemonExtraTrack = this._buildTrack(this.actor.system.extra, trackMax.extra, 0);
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
      context.pokemonLearnsetByRankRows = POKEMON_TIER_KEYS.map((rankKey) => ({
        key: rankKey,
        label: POKEMON_TIER_LABEL_BY_KEY[rankKey] ?? "POKROLE.Common.Unknown",
        fieldPath: `system.learnsetByRank.${rankKey}`,
        value: `${this.actor.system.learnsetByRank?.[rankKey] ?? ""}`
      }));
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
    }
    const moves = this.actor.items
      .filter((item) => item.type === "move")
      .sort((a, b) => a.sort - b.sort)
      .map((move) => this._prepareMoveData(move));
    context.moves = moves;
    if (this.actor.type === "pokemon") {
      const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
      context.maxUsableMoves = insightValue + 2;
      context.usableMoves = moves.filter((move) => move.isUsable);
      context.learnedMoves = moves;
      context.usableMovesCount = context.usableMoves.length;
      context.pokemonView = this._normalizePokemonView(this._pokemonActiveView ?? "main");
    }
    const pocketOrder = {
      potions: 0,
      small: 1,
      main: 2,
      badge: 3,
      held: 4
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
    context.embeddedEffects = this._buildEmbeddedEffects();
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
    html.find("[data-action='roll-evasion']").on("click", () => this.actor.rollEvasion());
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
    html.find("[data-action='delete-embedded-effect']").on("click", (event) =>
      this._onDeleteEmbeddedEffect(event)
    );
    html.find("[data-action='add-extra-skill']").on("click", (event) =>
      this._onAddExtraSkill(event)
    );
    html.find("[data-action='delete-extra-skill']").on("click", (event) =>
      this._onDeleteExtraSkill(event)
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

  async _onCreateMove(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "pokemon") return;
    const insightValue = Math.max(Number(this.actor.system.attributes?.insight ?? 0), 0);
    const maxUsableMoves = insightValue + 2;
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
          reducedAccuracy: 0,
          power: 2,
          damageAttribute: "auto",
          priority: 0,
          highCritical: false,
          neverFail: false,
          lethal: false,
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
    await this.actor.rollMove(itemId);
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
      const maxUsableMoves = insightValue + 2;
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
    if (!this.isEditable || this.actor.type !== "trainer") return;

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
            restoreAwareness: false
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
    if (!this.isEditable || this.actor.type !== "trainer") return;
    const current = Array.isArray(this.actor.system.extraSkills)
      ? foundry.utils.deepClone(this.actor.system.extraSkills)
      : [];
    current.push({ name: "", value: 0 });
    await this.actor.update({ "system.extraSkills": current });
  }

  async _onDeleteExtraSkill(event) {
    event.preventDefault();
    if (!this.isEditable || this.actor.type !== "trainer") return;
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
    if (!this.isEditable || typeof this.actor.addConfiguredEffect !== "function") return;
    await this.actor.addConfiguredEffect({
      label: game.i18n.localize("POKROLE.Effects.New"),
      trigger: "always",
      chance: 100,
      target: "self",
      effectType: "custom",
      durationMode: "manual",
      durationRounds: 1,
      condition: "none",
      stat: "none",
      amount: 0,
      notes: "",
      passive: false,
      passiveTrigger: "always",
      passiveCondition: "none",
      passiveThreshold: 50
    });
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
    if (!this.isEditable || typeof this.actor.setConfiguredEffects !== "function") return;
    const effects = this._collectActorEffectsFromSheet(html);
    await this.actor.setConfiguredEffects(effects);
    ui.notifications.info(game.i18n.localize("POKROLE.Effects.SaveSuccess"));
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
    for (const conditionKey of conditionKeys) {
      if (typeof this.actor.toggleQuickCondition === "function") {
        await this.actor.toggleQuickCondition(conditionKey, { active: false });
      }
    }
    await effect.delete();
  }

  _buildEmbeddedEffects() {
    const effects = this.actor.effects?.contents ?? [];
    return effects
      .slice()
      .sort((left, right) => `${left.name ?? ""}`.localeCompare(`${right.name ?? ""}`))
      .map((effect) => {
        const statusList = [...(effect.statuses ?? [])];
        const statusLabel =
          statusList.length > 0
            ? statusList.join(", ")
            : game.i18n.localize("POKROLE.Common.None");
        const durationRounds = Number(effect.duration?.remaining ?? Number.NaN);
        const durationLabel = Number.isFinite(durationRounds)
          ? game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: Math.max(Math.floor(durationRounds), 0)
          })
          : game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");

        return {
          id: effect.id,
          name: effect.name || game.i18n.localize("POKROLE.Common.Unknown"),
          icon: effect.img || "icons/svg/aura.svg",
          disabled: Boolean(effect.disabled),
          origin: `${effect.origin ?? ""}`.trim() || game.i18n.localize("POKROLE.Common.None"),
          statuses: statusLabel,
          durationLabel
        };
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

    const damageAttribute = this._resolveDamageAttributeForDisplay(move.system);
    const damageSummary =
      category === "support"
        ? game.i18n.localize("POKROLE.Move.SupportNoDamage")
        : `${this._localizeTrait(damageAttribute)} + ${Number(move.system.power ?? 0)}`;

    const flags = [];
    if (move.system.highCritical) flags.push(game.i18n.localize("POKROLE.Move.HighCritical"));
    if (move.system.neverFail) flags.push(game.i18n.localize("POKROLE.Move.NeverFail"));
    if (move.system.lethal) flags.push(game.i18n.localize("POKROLE.Move.Lethal"));
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

  _prepareGearData(gear) {
    const pocketKey = `${gear.system.pocket ?? "main"}`.toLowerCase();
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
          stat: "Stat",
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
    const rawEffects =
      typeof this.actor.getConfiguredEffects === "function" ? this.actor.getConfiguredEffects() : [];

    return rawEffects.map((effect) => {
      const effectType = this._normalizeSheetEffectType(effect.effectType);
      const passiveTrigger = `${effect?.passiveTrigger ?? "always"}`;
      const showPassiveConditionField = [
        "self-has-condition",
        "self-missing-condition",
        "target-has-condition",
        "target-missing-condition"
      ].includes(passiveTrigger);
      const showPassiveThresholdField = [
        "self-hp-below-threshold",
        "target-hp-below-threshold"
      ].includes(passiveTrigger);
      const showConditionField = effectType === "condition";
      const showStatField = effectType === "stat";
      const showAmountField = ["stat", "damage", "heal", "will"].includes(effectType);
      const showDurationField = effectType === "condition" || effectType === "stat";
      const showNotesField = effectType === "custom";

      return {
        ...effect,
        effectType,
        passiveTrigger,
        passiveCondition: `${effect?.passiveCondition ?? "none"}`,
        passiveThreshold: Number(effect?.passiveThreshold ?? 50) || 50,
        showConditionField,
        showStatField,
        showAmountField,
        showDurationField,
        showNotesField,
        showPassiveConditionField,
        showPassiveThresholdField
      };
    });
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
        : effectType === "stat"
          ? "combat"
          : "manual";
      const passiveTrigger = [
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
      ].includes(readValue("passiveTrigger", "always"))
        ? readValue("passiveTrigger", "always")
        : "always";

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
    toggleSection("notes", effectType === "custom");
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
      burn: "POKROLE.Conditions.Burn",
      frozen: "POKROLE.Conditions.Frozen",
      paralyzed: "POKROLE.Conditions.Paralyzed",
      poisoned: "POKROLE.Conditions.Poisoned",
      fainted: "POKROLE.Conditions.Fainted",
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
    if (tabName === "learned" || tabName === "settings" || tabName === "effects") return tabName;
    return "main";
  }

  _applyTrainerTabState(html, tabName) {
    const tab = this._normalizeTrainerView(tabName);
    html.find("[data-action='switch-trainer-tab']").removeClass("is-active");
    html.find(`.trainer-view-button[data-tab='${tab}']`).addClass("is-active");
    html.find(".trainer-view-panel").removeClass("is-active");
    html.find(`.trainer-view-panel[data-tab='${tab}']`).addClass("is-active");
  }

  _normalizeTrainerView(tabName) {
    if (tabName === "effects" || tabName === "bio") return tabName;
    return "main";
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
    if (!Array.isArray(rawEntries)) return [];

    return rawEntries
      .filter((entry) => entry && typeof entry === "object")
      .sort((left, right) => {
        const leftTime = Number(left.createdAt ?? 0);
        const rightTime = Number(right.createdAt ?? 0);
        return rightTime - leftTime;
      })
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
          durationLabel
        };
      })
      .filter((entry) => entry.id);
  }
}
