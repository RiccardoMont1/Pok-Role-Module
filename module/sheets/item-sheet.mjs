import {
  ATTRIBUTE_DEFINITIONS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_TARGET_LABEL_BY_KEY,
  MOVE_TARGET_KEYS,
  MOVE_TYPE_LABEL_BY_KEY,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
  TRAIT_LABEL_BY_KEY,
  TYPE_OPTIONS
} from "../constants.mjs";
import { getMoveTypeIcon } from "../move-type-icons.mjs";

export class PokRoleMoveSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pok-role", "sheet", "item"],
      width: 620,
      height: 720,
      submitOnClose: true,
      submitOnChange: true,
      resizable: true
    });
  }

  get template() {
    if (this.item.type === "gear") {
      return "systems/pok-role-module/templates/item/gear-sheet.hbs";
    }
    if (this.item.type === "ability") {
      return "systems/pok-role-module/templates/item/ability-sheet.hbs";
    }
    if (this.item.type === "weather") {
      return "systems/pok-role-module/templates/item/weather-sheet.hbs";
    }
    if (this.item.type === "status") {
      return "systems/pok-role-module/templates/item/status-sheet.hbs";
    }
    if (this.item.type === "pokedex") {
      return "systems/pok-role-module/templates/item/pokedex-sheet.hbs";
    }
    return "systems/pok-role-module/templates/item/move-sheet.hbs";
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.item.system;
    const typeOptions = Object.fromEntries(
      TYPE_OPTIONS.map((typeKey) => [
        typeKey,
        typeKey === "none"
          ? "POKROLE.Types.None"
          : MOVE_TYPE_LABEL_BY_KEY[typeKey] ?? "POKROLE.Common.Unknown"
      ])
    );

    if (this.item.type === "gear") {
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
        badge: "POKROLE.Gear.Pocket.Badge",
        held: "POKROLE.Gear.Pocket.Held"
      };
      context.gearTargetOptions = {
        pokemon: "POKROLE.Gear.Target.Pokemon",
        trainer: "POKROLE.Gear.Target.Trainer",
        any: "POKROLE.Gear.Target.Any"
      };
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
    context.secondaryEffects = this._getMoveSecondaryEffectsForDisplay();
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
      stat: "POKROLE.Move.Secondary.Type.Stat",
      "combat-stat": "POKROLE.Move.Secondary.Type.CombatStat",
      damage: "POKROLE.Move.Secondary.Type.Damage",
      heal: "POKROLE.Move.Secondary.Type.Heal",
      will: "POKROLE.Move.Secondary.Type.Will",
      custom: "POKROLE.Move.Secondary.Type.Custom"
    };
    context.secondaryDurationModeOptions = {
      manual: "POKROLE.Move.Secondary.Duration.Mode.Manual",
      rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds",
      combat: "POKROLE.Move.Secondary.Duration.Mode.Combat"
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
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    if (this.item.type !== "move") return;

    html.find("select[name='system.type']").on("change", (event) => {
      const typeKey = event.currentTarget.value || "none";
      const iconPath = getMoveTypeIcon(typeKey);
      const imageElement = html.find(".profile-img");
      imageElement.attr("src", iconPath);
    });
    html.find("[data-action='add-secondary-effect']").on("click", (event) =>
      this._onAddSecondaryEffect(event)
    );
    html.find("[data-action='remove-secondary-effect']").on("click", (event) =>
      this._onRemoveSecondaryEffect(event)
    );
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
      formData["system.secondaryEffects"] = secondaryEffects;
    }
    return super._updateObject(event, formData);
  }

  _getMoveSecondaryEffectsForDisplay() {
    const rawEffects = Array.isArray(this.item.system?.secondaryEffects)
      ? this.item.system.secondaryEffects
      : [];
    return rawEffects.map((effect, index) => ({
      index,
      ...this._normalizeSecondaryEffect(effect)
    }));
  }

  _createDefaultSecondaryEffect() {
    return {
      label: "",
      trigger: "on-hit",
      chance: 100,
      target: "target",
      effectType: "condition",
      durationMode: "manual",
      durationRounds: 1,
      condition: "none",
      stat: "none",
      amount: 0,
      notes: ""
    };
  }

  _normalizeMoveTarget(value) {
    if (MOVE_TARGET_KEYS.includes(value)) return value;
    return "foe";
  }

  _normalizeSecondaryEffects(value) {
    const rawList = Array.isArray(value)
      ? value
      : value && typeof value === "object"
        ? Object.values(value)
        : [];
    return rawList.map((effect) => this._normalizeSecondaryEffect(effect));
  }

  _normalizeSecondaryEffect(effect) {
    const normalizedEffect = effect && typeof effect === "object" ? effect : {};
    const trigger = MOVE_SECONDARY_TRIGGER_KEYS.includes(normalizedEffect.trigger)
      ? normalizedEffect.trigger
      : "on-hit";
    const target = MOVE_SECONDARY_TARGET_KEYS.includes(normalizedEffect.target)
      ? normalizedEffect.target
      : "target";
    const effectType = MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(normalizedEffect.effectType)
      ? normalizedEffect.effectType
      : "condition";
    const durationMode = MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalizedEffect.durationMode)
      ? normalizedEffect.durationMode
      : (effectType === "stat" || effectType === "combat-stat")
        ? "combat"
        : "manual";
    const condition = MOVE_SECONDARY_CONDITION_KEYS.includes(normalizedEffect.condition)
      ? normalizedEffect.condition
      : "none";
    const stat = MOVE_SECONDARY_STAT_KEYS.includes(normalizedEffect.stat)
      ? normalizedEffect.stat
      : "none";

    const chance = Number(normalizedEffect.chance);
    const amount = Number(normalizedEffect.amount);
    const durationRounds = Number(normalizedEffect.durationRounds);

    return {
      label: `${normalizedEffect.label ?? ""}`.trim(),
      trigger,
      chance: Number.isFinite(chance) ? Math.min(Math.max(Math.floor(chance), 0), 100) : 100,
      target,
      effectType,
      durationMode,
      durationRounds:
        Number.isFinite(durationRounds)
          ? Math.min(Math.max(Math.floor(durationRounds), 1), 99)
          : 1,
      condition,
      stat,
      amount: Number.isFinite(amount) ? Math.min(Math.max(Math.floor(amount), -99), 99) : 0,
      notes: `${normalizedEffect.notes ?? ""}`.trim()
    };
  }

  async _onAddSecondaryEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;
    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    current.push(this._createDefaultSecondaryEffect());
    await this.item.update({ "system.secondaryEffects": current });
    this.render(false);
  }

  async _onRemoveSecondaryEffect(event) {
    event.preventDefault();
    if (!this.isEditable || this.item.type !== "move") return;

    const index = Number(event.currentTarget.dataset.secondaryIndex);
    if (!Number.isInteger(index) || index < 0) return;

    const current = this._normalizeSecondaryEffects(this.item.system?.secondaryEffects);
    if (index >= current.length) return;
    current.splice(index, 1);
    await this.item.update({ "system.secondaryEffects": current });
    this.render(false);
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
}
