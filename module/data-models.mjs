import {
  ATTRIBUTE_DEFINITIONS,
  CORE_ATTRIBUTE_DEFINITIONS,
  MOVE_TYPE_KEYS,
  POKEMON_TIER_KEYS,
  SKILL_DEFINITIONS,
  TRAINER_CARD_RANK_KEYS,
  TYPE_OPTIONS
} from "./constants.mjs";

const { ArrayField, BooleanField, NumberField, SchemaField, StringField } = foundry.data.fields;

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
      level: integerField(1, { min: 1 }),
      cardRank: new StringField({
        required: true,
        blank: false,
        initial: "starter",
        choices: TRAINER_CARD_RANK_KEYS
      }),
      age: integerField(10, { min: 0, max: 120 }),
      player: trimmedStringField(""),
      concept: trimmedStringField(""),
      nature: trimmedStringField(""),
      role: trimmedStringField(""),
      money: integerField(0, { min: 0 }),
      activeEffects: trimmedStringField(""),
      badges: integerField(0, { min: 0, max: 8 }),
      pokedex: new SchemaField({
        seen: integerField(0, { min: 0 }),
        caught: integerField(0, { min: 0 })
      }),
      extraSkills: new ArrayField(
        new SchemaField({
          name: trimmedStringField(""),
          value: integerField(0, { min: 0, max: 5 })
        }),
        {
          required: true,
          initial: () => []
        }
      )
    };
  }
}

export class PokemonDataModel extends BaseCharacterDataModel {
  static defineSchema() {
    const base = super.defineSchema();
    return {
      ...base,
      species: trimmedStringField(""),
      ability: trimmedStringField(""),
      nature: trimmedStringField(""),
      battleItem: trimmedStringField(""),
      accessory: trimmedStringField(""),
      size: trimmedStringField(""),
      weight: trimmedStringField(""),
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
      evolutionTime: new StringField({
        required: true,
        blank: false,
        initial: "medium",
        choices: ["fast", "medium", "slow"]
      }),
      confidence: integerField(2, { min: 0, max: 5 }),
      loyalty: integerField(2, { min: 0, max: 5 }),
      happiness: integerField(2, { min: 0, max: 5 }),
      battles: integerField(0, { min: 0 }),
      victories: integerField(0, { min: 0 }),
      extra: integerField(0, { min: 0, max: 5 }),
      combatProfile: new SchemaField({
        accuracy: integerField(0, { min: 0, max: 99 }),
        damage: integerField(0, { min: 0, max: 99 }),
        evasion: integerField(0, { min: 0, max: 99 }),
        clash: integerField(0, { min: 0, max: 99 })
      })
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
      actionTag: new StringField({
        required: true,
        blank: false,
        initial: "1A",
        choices: ["1A", "2A", "5A"]
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
      isUsable: new BooleanField({ required: true, initial: true }),
      description: trimmedStringField("")
    };
  }
}

export class GearDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      category: new StringField({
        required: true,
        blank: false,
        initial: "healing",
        choices: [
          "healing",
          "status",
          "revive",
          "drink",
          "pokeball",
          "battle",
          "travel",
          "protective",
          "care",
          "vitamin",
          "grooming",
          "evolution",
          "held",
          "key",
          "other"
        ]
      }),
      pocket: new StringField({
        required: true,
        blank: false,
        initial: "main",
        choices: ["potions", "small", "main", "badge", "held"]
      }),
      consumable: new BooleanField({ required: true, initial: true }),
      canUseInBattle: new BooleanField({ required: true, initial: false }),
      target: new StringField({
        required: true,
        blank: false,
        initial: "pokemon",
        choices: ["pokemon", "trainer", "any"]
      }),
      quantity: integerField(1, { min: 0, max: 999 }),
      units: new SchemaField({
        value: integerField(0, { min: 0, max: 99 }),
        max: integerField(0, { min: 0, max: 99 })
      }),
      heal: new SchemaField({
        hp: integerField(0, { min: 0, max: 50 }),
        lethal: integerField(0, { min: 0, max: 50 }),
        fullHp: new BooleanField({ required: true, initial: false }),
        restoreAwareness: new BooleanField({ required: true, initial: false })
      }),
      status: new SchemaField({
        all: new BooleanField({ required: true, initial: false }),
        poison: new BooleanField({ required: true, initial: false }),
        sleep: new BooleanField({ required: true, initial: false }),
        burn: new BooleanField({ required: true, initial: false }),
        frozen: new BooleanField({ required: true, initial: false }),
        paralysis: new BooleanField({ required: true, initial: false }),
        confusion: new BooleanField({ required: true, initial: false })
      }),
      description: trimmedStringField("")
    };
  }
}
