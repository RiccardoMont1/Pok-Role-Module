import {
  ATTRIBUTE_DEFINITIONS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_TYPE_LABEL_BY_KEY,
  SKILL_DEFINITIONS,
  TYPE_OPTIONS
} from "../constants.mjs";

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
    return "systems/pok-role-module/templates/item/move-sheet.hbs";
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.item.system;

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

    context.categoryOptions = Object.fromEntries(
      Object.entries(MOVE_CATEGORY_LABEL_BY_KEY).map(([categoryKey, label]) => [
        categoryKey,
        label
      ])
    );
    context.typeOptions = Object.fromEntries(
      TYPE_OPTIONS.map((typeKey) => [
        typeKey,
        typeKey === "none"
          ? "POKROLE.Types.None"
          : MOVE_TYPE_LABEL_BY_KEY[typeKey] ?? "POKROLE.Common.Unknown"
      ])
    );
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
}
