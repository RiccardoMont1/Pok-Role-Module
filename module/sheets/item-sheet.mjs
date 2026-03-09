import {
  ATTRIBUTE_DEFINITIONS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_TYPE_LABEL_BY_KEY,
  POKEMON_TIER_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
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
  }

  async _updateObject(event, formData) {
    if (this.item.type === "move") {
      const typeKey = formData["system.type"] || this.item.system?.type || "none";
      formData.img = getMoveTypeIcon(typeKey);
    }
    return super._updateObject(event, formData);
  }
}
