import {
  ATTRIBUTE_DEFINITIONS,
  CORE_ATTRIBUTE_DEFINITIONS,
  MOVE_TYPE_KEYS,
  POKEMON_TIER_KEYS,
  SKILL_DEFINITIONS,
  TYPE_OPTIONS
} from "./constants.mjs";

const { BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

function integerField(initial, options = {}) {
  return new NumberField({
    required: true,
    integer: true,
    initial,
    ...options
  });
}

function resourceField(initial) {
  return new SchemaField({
    value: integerField(initial, { min: 0 }),
    max: integerField(initial, { min: 1 })
  });
}

function valueSchema(definitions, initial = 1, options = {}) {
  const schema = {};
  for (const { key } of definitions) {
    schema[key] = integerField(initial, { min: 0, ...options });
  }
  return schema;
}

function trimmedStringField(initial = "") {
  return new StringField({ required: true, blank: true, trim: true, initial });
}

class BaseCharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      biography: trimmedStringField(""),
      resources: new SchemaField({
        hp: resourceField(10),
        will: resourceField(3)
      }),
      attributes: new SchemaField(valueSchema(ATTRIBUTE_DEFINITIONS, 1, { max: 5 })),
      skills: new SchemaField(valueSchema(SKILL_DEFINITIONS, 0, { max: 5 })),
      combat: new SchemaField({
        actionNumber: integerField(1, { min: 1, max: 5 }),
        initiative: integerField(0, { min: 0 })
      })
    };
  }
}

export class TrainerDataModel extends BaseCharacterDataModel {
  static defineSchema() {
    const base = super.defineSchema();
    return {
      ...base,
      level: integerField(1, { min: 1, max: 5 }),
      role: trimmedStringField(""),
      money: integerField(0, { min: 0, max: 5 }),
      badges: integerField(0, { min: 0, max: 5 }),
      inventory: new SchemaField({
        potion: integerField(0, { min: 0, max: 5 }),
        superPotion: integerField(0, { min: 0, max: 5 }),
        hyperPotion: integerField(0, { min: 0, max: 5 }),
        items: trimmedStringField(""),
        achievements: trimmedStringField("")
      })
    };
  }
}

export class PokemonDataModel extends BaseCharacterDataModel {
  static defineSchema() {
    const base = super.defineSchema();
    return {
      ...base,
      species: trimmedStringField(""),
      nature: trimmedStringField(""),
      types: new SchemaField({
        primary: new StringField({
          required: true,
          blank: false,
          initial: "normal",
          choices: MOVE_TYPE_KEYS
        }),
        secondary: new StringField({
          required: true,
          blank: false,
          initial: "none",
          choices: TYPE_OPTIONS
        })
      }),
      tier: new StringField({
        required: true,
        blank: false,
        initial: "starter",
        choices: POKEMON_TIER_KEYS
      }),
      loyalty: integerField(2, { min: 0, max: 5 }),
      happiness: integerField(2, { min: 0, max: 5 })
    };
  }
}

export class MoveDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const attributeChoices = ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key);
    const skillChoices = SKILL_DEFINITIONS.map((skill) => skill.key);
    const damageAttributeChoices = [
      "auto",
      ...CORE_ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key),
      "none"
    ];

    return {
      type: new StringField({
        required: true,
        blank: false,
        initial: "normal",
        choices: TYPE_OPTIONS
      }),
      category: new StringField({
        required: true,
        blank: false,
        initial: "physical",
        choices: ["physical", "special", "support"]
      }),
      accuracyAttribute: new StringField({
        required: true,
        blank: false,
        initial: "dexterity",
        choices: attributeChoices
      }),
      accuracySkill: new StringField({
        required: true,
        blank: false,
        initial: "brawl",
        choices: skillChoices
      }),
      power: integerField(0, { min: 0 }),
      reducedAccuracy: integerField(0, { min: 0, max: 6 }),
      damageAttribute: new StringField({
        required: true,
        blank: false,
        initial: "auto",
        choices: damageAttributeChoices
      }),
      priority: integerField(0, { min: -3, max: 5 }),
      highCritical: new BooleanField({ required: true, initial: false }),
      neverFail: new BooleanField({ required: true, initial: false }),
      lethal: new BooleanField({ required: true, initial: false }),
      description: trimmedStringField("")
    };
  }
}
