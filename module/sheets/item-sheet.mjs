import {
  ATTRIBUTE_DEFINITIONS,
  getSystemAssetPath,
  HEALING_CATEGORY_KEYS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_MODE_KEYS,
  MOVE_SECONDARY_HEAL_PROFILE_KEYS,
  MOVE_SECONDARY_WEATHER_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_PRIMARY_MODE_KEYS,
  MOVE_TARGET_LABEL_BY_KEY,
  MOVE_TARGET_KEYS,
  MOVE_TYPE_LABEL_BY_KEY,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
  TRAIT_LABEL_BY_KEY,
  TYPE_OPTIONS
} from "../constants.mjs";
import { getMoveTypeIcon } from "../move-type-icons.mjs";

function normalizeLegacyChancePercentToDiceCount(percent, maxDice = 20) {
  const numericPercent = Math.min(Math.max(Math.floor(Number(percent) || 0), 1), 99);
  const probability = numericPercent / 100;
  const estimatedDice = Math.round(Math.log(1 - probability) / Math.log(5 / 6));
  return Math.min(Math.max(Number.isFinite(estimatedDice) ? estimatedDice : 1, 1), maxDice);
}

export class PokRoleMoveSheet extends foundry.appv1.sheets.ItemSheet {
  constructor(...args) {
    super(...args);
    this._moveActiveTab = "description";
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pok-role", "sheet", "item"],
      width: 860,
      height: 820,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });
  }

  get template() {
    if (this.item.type === "gear") {
      return getSystemAssetPath("templates/item/gear-sheet.hbs");
    }
    if (this.item.type === "ability") {
      return getSystemAssetPath("templates/item/ability-sheet.hbs");
    }
    if (this.item.type === "weather") {
      return getSystemAssetPath("templates/item/weather-sheet.hbs");
    }
    if (this.item.type === "status") {
      return getSystemAssetPath("templates/item/status-sheet.hbs");
    }
    if (this.item.type === "pokedex") {
      return getSystemAssetPath("templates/item/pokedex-sheet.hbs");
    }
    return getSystemAssetPath("templates/item/move-sheet.hbs");
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.item.system;
    context.actionTagOptions ??= {};
    context.typeOptions ??= {};
    context.categoryOptions ??= {};
    context.targetOptions ??= {};
    context.accuracyAttributeOptions ??= {};
    context.accuracySkillOptions ??= {};
    context.damageAttributeOptions ??= {};
    context.primaryModeOptions ??= {};
    context.secondaryTriggerOptions ??= {};
    context.secondaryTargetOptions ??= {};
    context.secondaryEffectTypeOptions ??= {};
    context.secondaryEffectTypeOptionsExtra ??= {};
    context.secondaryDurationModeOptions ??= {};
    context.secondaryHealModeOptions ??= {};
    context.secondaryHealingCategoryOptions ??= {};
    context.secondaryConditionOptions ??= {};
    context.secondaryStatOptions ??= {};
    context.secondaryWeatherOptions ??= {};
    const typeOptions = Object.fromEntries(
      TYPE_OPTIONS.map((typeKey) => [
        typeKey,
        typeKey === "none"
          ? "POKROLE.Types.None"
          : MOVE_TYPE_LABEL_BY_KEY[typeKey] ?? "POKROLE.Common.Unknown"
      ])
    );

    if (this.item.type === "gear") {
      const normalizedPocket = `${this.item.system?.pocket ?? "main"}`.toLowerCase() === "held"
        ? "main"
        : `${this.item.system?.pocket ?? "main"}`.toLowerCase();
      context.system = foundry.utils.mergeObject(
        foundry.utils.deepClone(this.item.system ?? {}),
        { pocket: normalizedPocket },
        { inplace: false }
      );
      context.gearCategoryOptions = {
        healing: "POKROLE.Gear.Category.Healing",
        status: "POKROLE.Gear.Category.Status",
        revive: "POKROLE.Gear.Category.Revive",
        drink: "POKROLE.Gear.Category.Drink",
        pokeball: "POKROLE.Gear.Category.Pokeball",
        battle: "POKROLE.Gear.Category.Battle",
        travel: "POKROLE.Gear.Category.Travel",
        protective: "POKROLE.Gear.Category.Protective",
        care: "POKROLE.Gear.Category.Care",
        vitamin: "POKROLE.Gear.Category.Vitamin",
        grooming: "POKROLE.Gear.Category.Grooming",
        evolution: "POKROLE.Gear.Category.Evolution",
        held: "POKROLE.Gear.Category.Held",
        key: "POKROLE.Gear.Category.Key",
        other: "POKROLE.Gear.Category.Other"
      };
      context.gearPocketOptions = {
        potions: "POKROLE.Gear.Pocket.Potions",
        small: "POKROLE.Gear.Pocket.Small",
        main: "POKROLE.Gear.Pocket.Main",
        badge: "POKROLE.Gear.Pocket.Badge"
      };
      context.gearTargetOptions = {
        pokemon: "POKROLE.Gear.Target.Pokemon",
        trainer: "POKROLE.Gear.Target.Trainer",
        any: "POKROLE.Gear.Target.Any"
      };
      context.gearHealingCategoryOptions = {
        standard: "POKROLE.Healing.Category.Standard",
        complete: "POKROLE.Healing.Category.Complete",
        unlimited: "POKROLE.Healing.Category.Unlimited"
      };
      context.system.heal ??= {};
      context.system.heal.battleHealingCategory = this._getGearBattleHealingCategory(this.item);
      return context;
    }

    if (this.item.type === "ability") {
      context.abilityTypeOptions = {
        passive: "POKROLE.Playable.Ability.Type.Passive",
        active: "POKROLE.Playable.Ability.Type.Active",
        hidden: "POKROLE.Playable.Ability.Type.Hidden"
      };
      return context;
    }

    if (this.item.type === "weather") {
      context.weatherCategoryOptions = {
        climate: "POKROLE.Playable.Weather.Category.Climate",
        terrain: "POKROLE.Playable.Weather.Category.Terrain",
        hazard: "POKROLE.Playable.Weather.Category.Hazard",
        other: "POKROLE.Playable.Weather.Category.Other"
      };
      return context;
    }

    if (this.item.type === "status") {
      context.statusSeverityOptions = {
        minor: "POKROLE.Playable.Status.Severity.Minor",
        major: "POKROLE.Playable.Status.Severity.Major",
        critical: "POKROLE.Playable.Status.Severity.Critical"
      };
      context.statusTargetOptions = {
        pokemon: "POKROLE.Gear.Target.Pokemon",
        trainer: "POKROLE.Gear.Target.Trainer",
        any: "POKROLE.Gear.Target.Any"
      };
      return context;
    }

    if (this.item.type === "pokedex") {
      context.typeOptions = typeOptions;
      context.rankOptions = Object.fromEntries(
        Object.entries(POKEMON_TIER_LABEL_BY_KEY).map(([rankKey, label]) => [rankKey, label])
      );
      return context;
    }

    context.categoryOptions = Object.fromEntries(
      Object.entries(MOVE_CATEGORY_LABEL_BY_KEY).map(([categoryKey, label]) => [
        categoryKey,
        label
      ])
    );
    context.actionTagOptions = {
      "1A": "POKROLE.Move.ActionTagValues.1A",
      "2A": "POKROLE.Move.ActionTagValues.2A",
      "5A": "POKROLE.Move.ActionTagValues.5A"
    };
    context.targetOptions = Object.fromEntries(
      MOVE_TARGET_KEYS.map((targetKey) => [
        targetKey,
        MOVE_TARGET_LABEL_BY_KEY[targetKey] ?? "POKROLE.Common.Unknown"
      ])
    );
    context.typeOptions = typeOptions;
    context.accuracyAttributeOptions = Object.fromEntries(
      ATTRIBUTE_DEFINITIONS.map((attribute) => [attribute.key, attribute.label])
    );
    context.accuracySkillOptions = Object.fromEntries(
      SKILL_DEFINITIONS.map((skill) => [skill.key, skill.label])
    );
    context.damageAttributeOptions = {
      auto: "POKROLE.Move.DamageAttributeAuto",
      strength: "POKROLE.Attributes.Strength",
      dexterity: "POKROLE.Attributes.Dexterity",
      vitality: "POKROLE.Attributes.Vitality",
      special: "POKROLE.Attributes.Special",
      insight: "POKROLE.Attributes.Insight",
      none: "POKROLE.Move.NoStat"
    };
    context.primaryModeOptions = {
      damage: "POKROLE.Move.PrimaryMode.Damage",
      "effect-only": "POKROLE.Move.PrimaryMode.EffectOnly"
    };
    context.rangeModeOptions = {
      self: "POKROLE.Move.RangeMode.Self",
      melee: "POKROLE.Move.RangeMode.Melee",
      meters: "POKROLE.Move.RangeMode.Meters",
      scene: "POKROLE.Move.RangeMode.Scene",
      battlefield: "POKROLE.Move.RangeMode.Battlefield",
      custom: "POKROLE.Move.RangeMode.Custom"
    };
    const moveRangeMode = this._normalizeMoveRangeMode(context.system?.rangeMode);
    context.moveRangeUsesValue = moveRangeMode === "meters";
    context.moveRangeUsesText = moveRangeMode === "custom";
    context.system.rangeMode = moveRangeMode;
    context.system.rangeValue = this._normalizeMoveRangeValue(context.system?.rangeValue);
    context.system.rangeText = `${context.system?.rangeText ?? ""}`.trim();
    const durationType = `${context.system?.durationType ?? "instant"}`.trim().toLowerCase();
    const buildDurationOption = (value, label) => ({
      value,
      label,
      selected: value === durationType
    });
    context.moveDurationOptions = {
      direct: [
        buildDurationOption("instant", "POKROLE.Move.Duration.Values.Instant"),
        buildDurationOption("manual", "POKROLE.Move.Duration.Values.Manual")
      ],
      time: [
        buildDurationOption("time-turns", "POKROLE.Move.Duration.Values.TimeTurns"),
        buildDurationOption("time-rounds", "POKROLE.Move.Duration.Values.TimeRounds"),
        buildDurationOption("time-minutes", "POKROLE.Move.Duration.Values.TimeMinutes"),
        buildDurationOption("time-hours", "POKROLE.Move.Duration.Values.TimeHours"),
        buildDurationOption("time-days", "POKROLE.Move.Duration.Values.TimeDays"),
        buildDurationOption("time-months", "POKROLE.Move.Duration.Values.TimeMonths"),
        buildDurationOption("time-years", "POKROLE.Move.Duration.Values.TimeYears")
      ],
      permanent: [
        buildDurationOption(
          "permanent-until-dissolved",
          "POKROLE.Move.Duration.Values.PermanentUntilDissolved"
        ),
        buildDurationOption("permanent", "POKROLE.Move.Duration.Values.Permanent")
      ]
    };
    context.moveDurationUsesValue = durationType.startsWith("time-");
    context.system.primaryMode = this._normalizeMovePrimaryMode(context.system?.primaryMode);
    context.moveUsesPrimaryDamage = this._moveUsesPrimaryDamage(context.system);
    context.secondaryEffects = this._getMoveSecondaryEffectsForDisplay();
    context.moveEffectSections = this._buildMoveEffectSections(context.secondaryEffects);
    context.secondaryTriggerOptions = {
      "on-hit": "POKROLE.Move.Secondary.Trigger.OnHit",
      "on-hit-damage": "POKROLE.Move.Secondary.Trigger.OnHitDamage",
      "on-miss": "POKROLE.Move.Secondary.Trigger.OnMiss",
      always: "POKROLE.Move.Secondary.Trigger.Always"
    };
    context.secondaryTargetOptions = {
      target: "POKROLE.Move.Secondary.Target.Target",
      self: "POKROLE.Move.Secondary.Target.Self",
      "all-targets": "POKROLE.Move.Secondary.Target.AllTargets",
      "all-allies": "POKROLE.Move.Secondary.Target.AllAllies",
      "all-foes": "POKROLE.Move.Secondary.Target.AllFoes"
    };
    context.secondaryEffectTypeOptions = {
      condition: "POKROLE.Move.Secondary.Type.Condition",
      "active-effect": "POKROLE.Move.Secondary.Type.ActiveEffect",
      stat: "POKROLE.Move.Secondary.Type.Stat",
      weather: "POKROLE.Move.Secondary.Type.Weather",
      damage: "POKROLE.Move.Secondary.Type.Damage",
      heal: "POKROLE.Move.Secondary.Type.Heal",
      will: "POKROLE.Move.Secondary.Type.Will",
      custom: "POKROLE.Move.Secondary.Type.Custom"
    };
    context.secondaryEffectTypeOptionsExtra = {
      "active-effect": "POKROLE.Move.Secondary.Type.ActiveEffect",
      weather: "POKROLE.Move.Secondary.Type.Weather",
      damage: "POKROLE.Move.Secondary.Type.Damage",
      heal: "POKROLE.Move.Secondary.Type.Heal",
      will: "POKROLE.Move.Secondary.Type.Will",
      custom: "POKROLE.Move.Secondary.Type.Custom"
    };
    context.secondaryDurationModeOptions = {
      manual: "POKROLE.Move.Secondary.Duration.Mode.Manual",
      rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds"
    };
    context.secondaryHealModeOptions = {
      fixed: "POKROLE.Move.Secondary.HealMode.Fixed",
      "max-hp-percent": "POKROLE.Move.Secondary.HealMode.MaxHpPercent",
      "damage-percent": "POKROLE.Move.Secondary.HealMode.DamagePercent"
    };
    context.secondaryHealProfileOptions = {
      standard: "POKROLE.Move.Secondary.HealProfile.Standard",
      "sunlight-restoration": "POKROLE.Move.Secondary.HealProfile.SunlightRestoration"
    };
    context.secondaryHealingCategoryOptions = {
      standard: "POKROLE.Move.Secondary.HealingCategory.Basic",
      complete: "POKROLE.Move.Secondary.HealingCategory.Complete"
    };
    context.secondarySpecialDurationOptions = {
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
    context.secondaryConditionOptions = Object.fromEntries(
      MOVE_SECONDARY_CONDITION_KEYS.map((conditionKey) => [
        conditionKey,
        this._getSecondaryConditionLabelPath(conditionKey)
      ])
    );
    context.secondaryStatOptions = Object.fromEntries(
      MOVE_SECONDARY_STAT_KEYS.map((statKey) => [statKey, this._getSecondaryStatLabelPath(statKey)])
    );
    context.secondaryWeatherOptions = Object.fromEntries(
      MOVE_SECONDARY_WEATHER_KEYS.map((weatherKey) => [
        weatherKey,
        this._getSecondaryWeatherLabelPath(weatherKey)
      ])
    );
    const activeMoveTab = this._moveActiveTab === "details" ? "details" : "description";
    context.moveTabDescriptionActive = activeMoveTab === "description";
    context.moveTabDetailsActive = activeMoveTab === "details";
    const resolveLabel = (labelPath) => game.i18n.localize(labelPath ?? "POKROLE.Common.Unknown");
    context.moveSidebarSummary = {
      type: resolveLabel(typeOptions[context.system?.type] ?? "POKROLE.Common.Unknown"),
      category: resolveLabel(
        MOVE_CATEGORY_LABEL_BY_KEY[context.system?.category] ?? "POKROLE.Common.Unknown"
      ),
      power: context.moveUsesPrimaryDamage
        ? Math.max(Math.floor(Number(context.system?.power ?? 0) || 0), 0)
        : game.i18n.localize("POKROLE.Move.NoDirectDamage"),
      willCost: Math.max(Math.floor(Number(context.system?.willCost ?? 0) || 0), 0),
      properties: [
        context.system?.highCritical ? "POKROLE.Move.HighCritical" : null,
        context.system?.neverFail ? "POKROLE.Move.NeverFail" : null,
        context.system?.shieldMove ? "POKROLE.Move.ShieldMove" : null
      ].filter((entry) => entry)
    };
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.item.type !== "move") return;

    html.find("[data-action='switch-move-tab']").on("click", (event) =>
      this._onSwitchMoveTab(event, html)
    );
    html.find("select[name='system.type']").on("change", (event) => {
      const typeKey = event.currentTarget.value || "none";
      const iconPath = getMoveTypeIcon(typeKey);
      const imageElement = html.find(".profile-img");
      imageElement.attr("src", iconPath);
    });
    html.find("select[name='system.durationType']").on("change", (event) =>
      this._onDurationTypeChanged(event, html)
    );
    html.find("select[name='system.primaryMode'], select[name='system.category']").on("change", () =>
      this._onPrimaryDamageModeChanged(html)
    );
    html.find("select[name='system.rangeMode']").on("change", (event) =>
      this._onRangeModeChanged(event, html)
    );
    html.find("[data-action='add-secondary-effect']").on("click", (event) =>
      this._onAddSecondaryEffect(event)
    );
    html.find("[data-action='add-secondary-effect-section']").on("click", (event) =>
      this._onAddSecondaryEffectSection(event)
    );
    html.find("[data-action='remove-secondary-effect-section']").on("click", (event) =>
      this._onRemoveSecondaryEffectSection(event)
    );
    html.find("[data-action='remove-secondary-effect']").on("click", (event) =>
      this._onRemoveSecondaryEffect(event)
    );
    html.find("[data-action='configure-secondary-active-effect']").on("click", (event) =>
      this._onConfigureSecondaryActiveEffect(event)
    );
    html.find("[data-action='unlink-secondary-active-effect']").on("click", (event) =>
      this._onUnlinkSecondaryActiveEffect(event)
    );
    html.find("[data-action='add-secondary-special-duration']").on("click", (event) =>
      this._onAddSecondarySpecialDuration(event)
    );
    html.find("[data-action='remove-secondary-special-duration']").on("click", (event) =>
      this._onRemoveSecondarySpecialDuration(event)
    );
    html.find(".move-secondary-effect-row select[name$='.effectType']").on("change", (event) =>
      this._onSecondaryEffectTypeChanged(event)
    );
    html.find(".move-secondary-effect-row").each((_index, row) =>
      this._refreshSecondaryEffectRowVisibility(row)
    );
    this._applyMoveTabState(html, this._moveActiveTab);
    this._onDurationTypeChanged(null, html);
    this._onPrimaryDamageModeChanged(html);
    this._onRangeModeChanged(null, html);
  }

  async _updateObject(event, formData) {
    if (this.item.type === "move") {
      const typeKey = formData["system.type"] || this.item.system?.type || "none";
      formData.img = getMoveTypeIcon(typeKey);

      const expanded = foundry.utils.expandObject(formData);
      const moveSystem = expanded.system ?? {};
      const secondaryEffects = this._normalizeSecondaryEffects(moveSystem.secondaryEffects);
      for (const key of Object.keys(formData)) {
        if (key.startsWith("system.secondaryEffects.")) {
          delete formData[key];
        }
      }
      formData["system.target"] = this._normalizeMoveTarget(moveSystem.target);
      formData["system.primaryMode"] = this._normalizeMovePrimaryMode(moveSystem.primaryMode);
      formData["system.rangeMode"] = this._normalizeMoveRangeMode(moveSystem.rangeMode);
      formData["system.rangeValue"] = this._normalizeMoveRangeValue(moveSystem.rangeValue);
      formData["system.rangeText"] = `${moveSystem.rangeText ?? ""}`.trim();
      formData["system.range"] = this._buildRangeLabel({
        rangeMode: formData["system.rangeMode"],
        rangeValue: formData["system.rangeValue"],
        rangeText: formData["system.rangeText"]
      });
      formData["system.durationType"] = this._normalizeMoveDurationType(moveSystem.durationType);
      formData["system.durationValue"] = this._normalizeMoveDurationValue(moveSystem.durationValue);
      formData["system.willCost"] = Math.min(
        Math.max(Math.floor(Number(moveSystem.willCost ?? 0) || 0), 0),
        99
      );
      formData["system.accuracyDiceModifier"] = Math.min(
        Math.max(Math.floor(Number(moveSystem.accuracyDiceModifier ?? 0) || 0), -99),
        99
      );
      formData["system.accuracyFlatModifier"] = Math.min(
        Math.max(Math.floor(Number(moveSystem.accuracyFlatModifier ?? 0) || 0), -99),
        99
      );
      formData["system.secondaryEffects"] = secondaryEffects;
    }
    if (this.item.type === "gear") {
      const pocket = `${formData["system.pocket"] ?? "main"}`.trim().toLowerCase();
      if (pocket === "held") {
        formData["system.pocket"] = "main";
      }
    }
    return super._updateObject(event, formData);
  }

  _getMoveSecondaryEffectsForDisplay() {
    const rawEffects = Array.isArray(this.item.system?.secondaryEffects)
      ? this.item.system.secondaryEffects
      : [];
    const normalizedEffects = this._normalizeSecondaryEffects(rawEffects);
    return normalizedEffects.map((effect, index) => ({
      index,
      ...this._decorateSecondaryEffectForDisplay(effect)
    }));
  }

  _buildMoveEffectSections(secondaryEffects = []) {
    const effects = Array.isArray(secondaryEffects) ? secondaryEffects : [];
    const maxSectionIndex = effects.reduce(
      (maxValue, effect) => Math.max(maxValue, Number(effect?.section ?? 0)),
      0
    );
    const sections = [];
    for (let sectionIndex = 0; sectionIndex <= maxSectionIndex; sectionIndex += 1) {
      const sectionEffects = effects.filter((effect) => Number(effect?.section ?? 0) === sectionIndex);
      sections.push({
        index: sectionIndex,
        displayIndex: sectionIndex + 1,
        isExtra: sectionIndex > 0,
        canRemove: sectionIndex > 0,
        showAddSectionButton: sectionIndex === maxSectionIndex,
        effects: sectionEffects
      });
    }
    if (sections.length === 0) {
      sections.push({
        index: 0,
        displayIndex: 1,
        isExtra: false,
        canRemove: false,
        showAddSectionButton: true,
        effects: []
      });
    }
    return sections;
  }

  _createDefaultSecondaryEffect(section = 0) {
    const normalizedSection = Math.max(Math.floor(Number(section) || 0), 0);
    const defaultPrimaryType = this._moveUsesPrimaryDamage(this.item.system) ? "condition" : "heal";
    return {
      section: normalizedSection,
      label: "",
      trigger: "on-hit",
      chance: 0,
      target: "target",
      effectType: normalizedSection > 0 ? "active-effect" : defaultPrimaryType,
      durationMode: "manual",
      durationRounds: 1,
      specialDuration: [],
      condition: "none",
      weather: "none",
      stat: "none",
      amount: 0,
      healMode: "fixed",
      healProfile: "standard",
      healingCategory: "standard",
      notes: "",
      linkedEffectId: ""
    };
  }

  _normalizeHealingCategory(value) {
    const normalized = `${value ?? "standard"}`.trim().toLowerCase();
    return HEALING_CATEGORY_KEYS.includes(normalized) ? normalized : "standard";
  }

  _getGearBattleHealingCategory(item) {
    const explicitValue = item?._source?.system?.heal?.battleHealingCategory;
    const normalizedExplicit = this._normalizeHealingCategory(explicitValue);
    if (`${explicitValue ?? ""}`.trim()) return normalizedExplicit;

    const itemName = `${item?.name ?? ""}`.trim().toLowerCase();
    if (itemName === "max potion" || itemName === "full restore") {
      return "unlimited";
    }
    return "standard";
  }

  _normalizeMoveTarget(value) {
    if (MOVE_TARGET_KEYS.includes(value)) return value;
    return "foe";
  }

  _normalizeMoveRangeMode(value) {
    const normalized = `${value ?? "melee"}`.trim().toLowerCase();
    const allowed = new Set(["self", "melee", "meters", "scene", "battlefield", "custom"]);
    return allowed.has(normalized) ? normalized : "melee";
  }

  _normalizeMoveRangeValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 1;
    return Math.min(Math.max(Math.floor(numericValue), 0), 999);
  }

  _normalizeMovePrimaryMode(value) {
    const normalized = `${value ?? "damage"}`.trim().toLowerCase();
    return MOVE_PRIMARY_MODE_KEYS.includes(normalized) ? normalized : "damage";
  }

  _moveUsesPrimaryDamage(moveSystem) {
    const normalizedCategory = `${moveSystem?.category ?? "physical"}`.trim().toLowerCase();
    if (normalizedCategory === "support") return false;
    return this._normalizeMovePrimaryMode(moveSystem?.primaryMode) === "damage";
  }

  _buildRangeLabel({ rangeMode = "melee", rangeValue = 1, rangeText = "" } = {}) {
    const normalizedMode = this._normalizeMoveRangeMode(rangeMode);
    const normalizedValue = this._normalizeMoveRangeValue(rangeValue);
    const normalizedText = `${rangeText ?? ""}`.trim();
    if (normalizedMode === "meters") return `${normalizedValue}m`;
    if (normalizedMode === "custom") return normalizedText || game.i18n.localize("POKROLE.Move.RangeMode.Custom");
    const labelMap = {
      self: "POKROLE.Move.RangeMode.Self",
      melee: "POKROLE.Move.RangeMode.Melee",
      scene: "POKROLE.Move.RangeMode.Scene",
      battlefield: "POKROLE.Move.RangeMode.Battlefield"
    };
    return game.i18n.localize(labelMap[normalizedMode] ?? "POKROLE.Common.Unknown");
  }

  _normalizeMoveDurationType(value) {
    const normalized = `${value ?? "instant"}`.trim().toLowerCase();
    const allowedValues = new Set([
      "instant",
      "manual",
      "time-turns",
      "time-rounds",
      "time-minutes",
      "time-hours",
      "time-days",
      "time-months",
      "time-years",
      "permanent-until-dissolved",
      "permanent"
    ]);
    return allowedValues.has(normalized) ? normalized : "instant";
  }

  _normalizeMoveDurationValue(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return 1;
    return Math.min(Math.max(Math.floor(numericValue), 1), 999);
  }

  _normalizeSecondaryEffects(value) {
    const rawList = Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? Object.values(value)
        : [];
    const normalized = rawList.map((effect) => this._normalizeSecondaryEffect(effect));
    const knownSections = [...new Set(normalized.map((entry) => Math.max(Number(entry.section ?? 0), 0)))].sort(
      (left, right) => left - right
    );
    const sectionMap = new Map(knownSections.map((sectionKey, index) => [sectionKey, index]));
    return normalized.map((entry) => ({
      ...entry,
      section: sectionMap.get(Math.max(Number(entry.section ?? 0), 0)) ?? 0
    }));
  }

  _normalizeSecondaryEffect(effect) {
    const normalizedEffect = effect && typeof effect === "object" ? effect : {};
    const section = Math.max(Math.floor(Number(normalizedEffect.section ?? 0) || 0), 0);
    const trigger = MOVE_SECONDARY_TRIGGER_KEYS.includes(normalizedEffect.trigger)
      ? normalizedEffect.trigger
      : "on-hit";
    const target = MOVE_SECONDARY_TARGET_KEYS.includes(normalizedEffect.target)
      ? normalizedEffect.target
      : "target";
    const effectType = this._normalizeEffectType(normalizedEffect.effectType);
    const normalizedEffectType =
      section > 0 && ["condition", "stat"].includes(effectType) ? "active-effect" : effectType;
    const durationMode = MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalizedEffect.durationMode)
      ? normalizedEffect.durationMode
      : "manual";
    const condition = this._normalizeConditionVariantKey(normalizedEffect.condition);
    const weather = MOVE_SECONDARY_WEATHER_KEYS.includes(normalizedEffect.weather)
      ? normalizedEffect.weather
      : "none";
    const stat = MOVE_SECONDARY_STAT_KEYS.includes(normalizedEffect.stat)
      ? normalizedEffect.stat
      : "none";
    const specialDuration = this._normalizeSpecialDurationList(normalizedEffect.specialDuration);
    const healMode = this._normalizeHealMode(
      normalizedEffect.healMode,
      effectType,
      normalizedEffect.amount
    );
    const healProfile = this._normalizeHealProfile(normalizedEffect.healProfile);
    let healingCategory = this._normalizeHealingCategory(normalizedEffect.healingCategory);
    if (normalizedEffectType === "heal" && healingCategory === "unlimited") {
      healingCategory = "complete";
    }

    const chance = Number(normalizedEffect.chance);
    const rawAmount = Number(normalizedEffect.amount);
    const durationRounds = Number(normalizedEffect.durationRounds);
    const normalizedAmount = Number.isFinite(rawAmount)
      ? Math.min(Math.max(Math.floor(rawAmount), -999), 999)
      : 0;
    const amount =
      effectType === "heal" && healMode !== "fixed"
        ? Math.abs(normalizedAmount)
        : normalizedAmount;

    return {
      section,
      label: `${normalizedEffect.label ?? ""}`.trim(),
      trigger,
      chance: this._normalizeChanceDiceValue(chance),
      target,
      effectType: normalizedEffectType,
      durationMode,
      durationRounds:
        Number.isFinite(durationRounds)
          ? Math.min(Math.max(Math.floor(durationRounds), 1), 99)
          : 1,
      specialDuration,
      condition,
      weather,
      stat,
      amount,
      healMode,
      healProfile,
      healingCategory,
      notes: `${normalizedEffect.notes ?? ""}`.trim(),
      linkedEffectId: `${normalizedEffect.linkedEffectId ?? ""}`.trim()
    };
  }

  _normalizeChanceDiceValue(value, fallback = 0) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    const normalizedValue = Math.floor(numericValue);
    if (normalizedValue <= 0) return 0;
    if (normalizedValue >= 100) return 0;
    if (normalizedValue <= 20) return normalizedValue;
    return normalizeLegacyChancePercentToDiceCount(normalizedValue, 20);
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

  _normalizeEffectType(effectType) {
    const normalizedType = `${effectType ?? "condition"}`.trim().toLowerCase();
    if (normalizedType === "activeeffect" || normalizedType === "active_effect") {
      return "active-effect";
    }
    if (normalizedType === "combat-stat") return "stat";
    if (MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(normalizedType)) return normalizedType;
    return "condition";
  }

  _normalizeConditionVariantKey(conditionKey) {
    const normalized = `${conditionKey ?? "none"}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    const alias = {
      burn1: "burn",
      burn2: "burn2",
      burn3: "burn3"
    }[normalized] ?? normalized;
    return MOVE_SECONDARY_CONDITION_KEYS.includes(alias) ? alias : "none";
  }

  _normalizeHealMode(healMode, effectType = "custom", amount = 0) {
    const normalizedType = this._normalizeEffectType(effectType);
    if (normalizedType !== "heal") return "fixed";
    const normalizedMode = `${healMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_HEAL_MODE_KEYS.includes(normalizedMode)) return normalizedMode;
    return Number(amount) < 0 ? "max-hp-percent" : "fixed";
  }

  _normalizeHealProfile(healProfile) {
    const normalized = `${healProfile ?? "standard"}`.trim().toLowerCase();
    return MOVE_SECONDARY_HEAL_PROFILE_KEYS.includes(normalized) ? normalized : "standard";
  }

  _decorateSecondaryEffectForDisplay(effect) {
    const effectType = this._normalizeEffectType(effect.effectType);
    const specialDurationSelections = this._normalizeSpecialDurationList(effect.specialDuration);
    const specialDurationRows = specialDurationSelections.map((durationKey, index) => ({
      index,
      value: durationKey,
      options: this._buildSecondarySpecialDurationOptions(durationKey)
    }));
    const linkedEffectId = `${effect.linkedEffectId ?? ""}`.trim();
    const linkedEffect = linkedEffectId ? this.item.effects?.get(linkedEffectId) ?? null : null;
    return {
      ...effect,
      effectType,
      linkedEffectId,
      hasLinkedEffect: Boolean(linkedEffect),
      linkedEffectName: linkedEffect?.name ?? game.i18n.localize("POKROLE.Move.Secondary.ActiveEffect.Unconfigured"),
      specialDuration: specialDurationSelections,
      specialDurationRows,
      showConditionField: effectType === "condition",
      showWeatherField: effectType === "weather",
      showActiveEffectField: effectType === "active-effect",
      showStatField: effectType === "stat",
      showAmountField: ["stat", "damage", "heal", "will"].includes(effectType),
      showHealModeField: effectType === "heal",
      showHealProfileField: effectType === "heal",
      showHealingCategoryField: effectType === "heal",
      showDurationField: effectType === "condition" || effectType === "stat" || effectType === "weather",
      showNotesField: effectType === "custom"
    };
  }

  async _onAddSecondaryEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;
    const section = Math.max(Math.floor(Number(event.currentTarget.dataset.sectionIndex ?? 0) || 0), 0);
    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    current.push(this._createDefaultSecondaryEffect(section));
    await this.item.update({ "system.secondaryEffects": current });
    this.render(false);
  }

  async _onAddSecondaryEffectSection(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;
    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    const highestSection = current.reduce(
      (maxSection, effect) => Math.max(maxSection, Number(effect?.section ?? 0)),
      0
    );
    current.push(this._createDefaultSecondaryEffect(highestSection + 1));
    await this.item.update({ "system.secondaryEffects": current });
    this.render(false);
  }

  async _onRemoveSecondaryEffectSection(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const sectionIndex = Number(event.currentTarget.dataset.sectionIndex);
    if (!Number.isInteger(sectionIndex) || sectionIndex <= 0) return;

    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    const effectsToRemove = current.filter((effect) => Number(effect?.section ?? 0) === sectionIndex);
    const nextEffects = current.filter((effect) => Number(effect?.section ?? 0) !== sectionIndex);
    for (const effect of effectsToRemove) {
      const linkedEffectId = `${effect?.linkedEffectId ?? ""}`.trim();
      if (!linkedEffectId) continue;
      const linkedEffect = this.item.effects?.get(linkedEffectId);
      if (linkedEffect) {
        await linkedEffect.delete();
      }
    }
    await this.item.update({ "system.secondaryEffects": nextEffects });
    this.render(false);
  }

  async _onRemoveSecondaryEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const index = Number(event.currentTarget.dataset.secondaryIndex);
    if (!Number.isInteger(index) || index < 0) return;

    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (index >= current.length) return;
    const [removedEffect] = current.splice(index, 1);
    const linkedEffectId = `${removedEffect?.linkedEffectId ?? ""}`.trim();
    if (linkedEffectId) {
      const linkedEffect = this.item.effects?.get(linkedEffectId);
      if (linkedEffect) {
        await linkedEffect.delete();
      }
    }
    await this.item.update({ "system.secondaryEffects": current });
    this.render(false);
  }

  async _onConfigureSecondaryActiveEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const secondaryIndex = Number(event.currentTarget.dataset.secondaryIndex);
    if (!Number.isInteger(secondaryIndex) || secondaryIndex < 0) return;

    const effects = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (secondaryIndex >= effects.length) return;
    const effect = effects[secondaryIndex];
    let linkedEffect = effect.linkedEffectId ? this.item.effects?.get(effect.linkedEffectId) ?? null : null;

    if (!linkedEffect) {
      const [createdEffect] = await this.item.createEmbeddedDocuments("ActiveEffect", [
        {
          name: effect.label || `${this.item.name} - ${game.i18n.localize("POKROLE.Move.Secondary.Label")} ${secondaryIndex + 1}`,
          img: this.item.img || "icons/svg/aura.svg",
          origin: this.item.uuid ?? null,
          transfer: false,
          disabled: false,
          statuses: [],
          changes: [],
          flags: {
            core: { overlay: false }
          }
        }
      ]);
      if (!createdEffect) return;
      linkedEffect = createdEffect;
      effect.linkedEffectId = createdEffect.id;
      effects.splice(secondaryIndex, 1, effect);
      await this.item.update({ "system.secondaryEffects": effects });
    }

    linkedEffect.sheet?.render(true);
    this.render(false);
  }

  async _onUnlinkSecondaryActiveEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const secondaryIndex = Number(event.currentTarget.dataset.secondaryIndex);
    if (!Number.isInteger(secondaryIndex) || secondaryIndex < 0) return;

    const effects = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (secondaryIndex >= effects.length) return;
    const effect = effects[secondaryIndex];
    const linkedEffectId = `${effect?.linkedEffectId ?? ""}`.trim();
    if (linkedEffectId) {
      const linkedEffect = this.item.effects?.get(linkedEffectId);
      if (linkedEffect) await linkedEffect.delete();
    }
    effect.linkedEffectId = "";
    effects.splice(secondaryIndex, 1, effect);
    await this.item.update({ "system.secondaryEffects": effects });
    this.render(false);
  }

  _buildSecondarySpecialDurationOptions(selectedKey = "") {
    const normalizedSelected = `${selectedKey ?? ""}`.trim().toLowerCase();
    const labelByDurationKey = {
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
    return MOVE_SECONDARY_SPECIAL_DURATION_KEYS.filter((key) => key !== "none").map((key) => ({
      value: key,
      selected: key === normalizedSelected,
      label: labelByDurationKey[key] ?? "POKROLE.Common.Unknown"
    }));
  }

  async _onAddSecondarySpecialDuration(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const secondaryIndex = Number(event.currentTarget.dataset.secondaryIndex);
    if (!Number.isInteger(secondaryIndex) || secondaryIndex < 0) return;

    const effects = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (secondaryIndex >= effects.length) return;

    const effect = effects[secondaryIndex];
    const current = this._normalizeSpecialDurationList(effect.specialDuration);
    const nextDuration =
      MOVE_SECONDARY_SPECIAL_DURATION_KEYS.find(
        (durationKey) => durationKey !== "none" && !current.includes(durationKey)
      ) ?? "turn-start";
    current.push(nextDuration);
    effect.specialDuration = current;
    effects.splice(secondaryIndex, 1, effect);
    await this.item.update({ "system.secondaryEffects": effects });
    this.render(false);
  }

  async _onRemoveSecondarySpecialDuration(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const secondaryIndex = Number(event.currentTarget.dataset.secondaryIndex);
    const durationIndex = Number(event.currentTarget.dataset.durationIndex);
    if (
      !Number.isInteger(secondaryIndex) ||
      secondaryIndex < 0 ||
      !Number.isInteger(durationIndex) ||
      durationIndex < 0
    ) {
      return;
    }

    const effects = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (secondaryIndex >= effects.length) return;

    const effect = effects[secondaryIndex];
    const current = this._normalizeSpecialDurationList(effect.specialDuration);
    if (durationIndex >= current.length) return;

    current.splice(durationIndex, 1);
    effect.specialDuration = current;
    effects.splice(secondaryIndex, 1, effect);
    await this.item.update({ "system.secondaryEffects": effects });
    this.render(false);
  }

  _onSwitchMoveTab(event, html) {
    event.preventDefault();
    const targetTab = `${event.currentTarget.dataset.tab ?? ""}`.trim().toLowerCase();
    if (!targetTab) return;
    this._moveActiveTab = targetTab === "details" ? "details" : "description";
    this._applyMoveTabState(html, this._moveActiveTab);
  }

  _applyMoveTabState(html, tabKey = "description") {
    const normalizedTab = tabKey === "details" ? "details" : "description";
    html.find("[data-action='switch-move-tab']").removeClass("is-active");
    html.find(`[data-action='switch-move-tab'][data-tab='${normalizedTab}']`).addClass("is-active");
    html.find(".move-tab-panel").removeClass("is-active");
    html.find(`.move-tab-panel[data-tab='${normalizedTab}']`).addClass("is-active");
  }

  _onDurationTypeChanged(_event, html) {
    const durationType = `${html.find("select[name='system.durationType']").val() ?? "instant"}`
      .trim()
      .toLowerCase();
    const showValueField = durationType.startsWith("time-");
    html.find(".move-duration-value-row").toggleClass("is-hidden", !showValueField);
  }

  _onPrimaryDamageModeChanged(html) {
    const moveSystem = {
      category: `${html.find("select[name='system.category']").val() ?? "physical"}`.trim().toLowerCase(),
      primaryMode: `${html.find("select[name='system.primaryMode']").val() ?? "damage"}`.trim().toLowerCase()
    };
    const showPrimaryDamageFields = this._moveUsesPrimaryDamage(moveSystem);
    html.find(".move-primary-damage-field").toggleClass("is-hidden", !showPrimaryDamageFields);
  }

  _onRangeModeChanged(_event, html) {
    const rangeMode = `${html.find("select[name='system.rangeMode']").val() ?? "melee"}`
      .trim()
      .toLowerCase();
    html.find(".move-range-value-row").toggleClass("is-hidden", rangeMode !== "meters");
    html.find(".move-range-text-row").toggleClass("is-hidden", rangeMode !== "custom");
  }

  _onSecondaryEffectTypeChanged(event) {
    const row = event.currentTarget.closest(".move-secondary-effect-row");
    if (!row) return;
    this._refreshSecondaryEffectRowVisibility(row);
  }

  _refreshSecondaryEffectRowVisibility(row) {
    const effectTypeSelect = row.querySelector("select[name$='.effectType']");
    const effectType = this._normalizeEffectType(effectTypeSelect?.value ?? "condition");

    const toggleSection = (sectionKey, visible) => {
      const sectionElement = row.querySelector(`[data-effect-visible='${sectionKey}']`);
      if (!sectionElement) return;
      sectionElement.classList.toggle("is-hidden", !visible);
    };

    toggleSection("condition", effectType === "condition");
    toggleSection("weather", effectType === "weather");
    toggleSection("active-effect", effectType === "active-effect");
    toggleSection("stat", effectType === "stat");
    toggleSection("amount", ["stat", "damage", "heal", "will"].includes(effectType));
    toggleSection("heal-mode", effectType === "heal");
    toggleSection("heal-profile", effectType === "heal");
    toggleSection("heal-category", effectType === "heal");
    toggleSection("duration", effectType === "condition" || effectType === "stat" || effectType === "weather");
    toggleSection("notes", effectType === "custom");
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

  _getSecondaryWeatherLabelPath(weatherKey) {
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
    return labelByWeather[weatherKey] ?? "POKROLE.Common.None";
  }
}
