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
    return "systems/pok-role-module/templates/item/move-sheet.hbs";
  }

  async getData(options = {}) {
    const context = await super.getData(options);
    context.system = this.item.system;
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
