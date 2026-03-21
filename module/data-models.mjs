import {
  ATTRIBUTE_DEFINITIONS,
  CORE_ATTRIBUTE_DEFINITIONS,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  HEALING_CATEGORY_KEYS,
  MOVE_SECONDARY_HEAL_MODE_KEYS,
  MOVE_SECONDARY_HEAL_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_PROFILE_KEYS,
  MOVE_SECONDARY_TERRAIN_KEYS,
  MOVE_SECONDARY_WEATHER_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_PRIMARY_MODE_KEYS,
  MOVE_TARGET_KEYS,
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

function pokemonAttributeSchema() {
  const coreKeys = new Set(CORE_ATTRIBUTE_DEFINITIONS.map((attribute) => attribute.key));
  const schema = {};
  for (const { key } of ATTRIBUTE_DEFINITIONS) {
    const maxValue = coreKeys.has(key) ? 12 : 5;
    schema[key] = integerField(1, { min: 1, max: maxValue });
  }
  return schema;
}

function rankLearnsetSchema() {
  const schema = {};
  for (const rankKey of POKEMON_TIER_KEYS) {
    schema[rankKey] = trimmedStringField("");
  }
  return new SchemaField(schema);
}

function trimmedStringField(initial = "") {
  return new StringField({ required: true, blank: true, trim: true, initial });
}

function conditionSchemaField() {
  return new SchemaField({
    sleep: new BooleanField({ required: true, initial: false }),
    burn: new BooleanField({ required: true, initial: false }),
    frozen: new BooleanField({ required: true, initial: false }),
    paralyzed: new BooleanField({ required: true, initial: false }),
    poisoned: new BooleanField({ required: true, initial: false }),
    fainted: new BooleanField({ required: true, initial: false })
  });
}

class BaseCharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      biography: trimmedStringField(""),
      conditions: conditionSchemaField(),
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
      gender: new StringField({
        required: true,
        blank: false,
        initial: "male",
        choices: ["male", "female"]
      }),
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
      ),
      party: new ArrayField(
        new StringField({ required: true, blank: false }),
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
      attributes: new SchemaField(pokemonAttributeSchema()),
      skills: new SchemaField(valueSchema(SKILL_DEFINITIONS, 0, { min: 0, max: 5 })),
      caughtBy: trimmedStringField(""),
      currentTrainer: trimmedStringField(""),
      species: trimmedStringField(""),
      gender: new StringField({
        required: true,
        blank: false,
        initial: "unknown",
        choices: ["male", "female", "genderless", "unknown"]
      }),
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
      extraSkills: new ArrayField(
        new SchemaField({
          name: trimmedStringField(""),
          value: integerField(0, { min: 0, max: 5 })
        }),
        {
          required: true,
          initial: () => []
        }
      ),
      manualCoreBase: new SchemaField(
        valueSchema(CORE_ATTRIBUTE_DEFINITIONS, 1, { min: 1, max: 12 })
      ),
      sheetSettings: new SchemaField({
        trackMax: new SchemaField({
          attributes: new SchemaField(
            valueSchema(CORE_ATTRIBUTE_DEFINITIONS, 12, { min: 1, max: 12 })
          )
        })
      }),
      learnsetByRank: rankLearnsetSchema(),
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
    const moveDurationChoices = [
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
    ];
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
      target: new StringField({
        required: true,
        blank: false,
        initial: "foe",
        choices: MOVE_TARGET_KEYS
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
      primaryMode: new StringField({
        required: true,
        blank: false,
        initial: "damage",
        choices: MOVE_PRIMARY_MODE_KEYS
      }),
      accuracyFormula: trimmedStringField(""),
      power: integerField(0, { min: 0 }),
      powerFormula: trimmedStringField(""),
      reducedAccuracy: integerField(0, { min: 0, max: 6 }),
      accuracyDiceModifier: integerField(0, { min: -99, max: 99 }),
      accuracyFlatModifier: integerField(0, { min: -99, max: 99 }),
      damageAttribute: new StringField({
        required: true,
        blank: false,
        initial: "auto",
        choices: damageAttributeChoices
      }),
      damageBaseFormula: trimmedStringField(""),
      willCost: integerField(0, { min: 0, max: 99 }),
      durationType: new StringField({
        required: true,
        blank: false,
        initial: "instant",
        choices: moveDurationChoices
      }),
      durationValue: integerField(1, { min: 1, max: 999 }),
      priority: integerField(0, { min: -3, max: 5 }),
      highCritical: new BooleanField({ required: true, initial: false }),
      neverFail: new BooleanField({ required: true, initial: false }),
      lethal: new BooleanField({ required: true, initial: false }),
      shieldMove: new BooleanField({ required: true, initial: false }),
      isRanged: new BooleanField({ required: true, initial: false }),
      isUsable: new BooleanField({ required: true, initial: true }),
      secondaryEffects: new ArrayField(
        new SchemaField({
          section: integerField(0, { min: 0, max: 99 }),
          label: trimmedStringField(""),
          trigger: new StringField({
            required: true,
            blank: false,
            initial: "on-hit",
            choices: MOVE_SECONDARY_TRIGGER_KEYS
          }),
          chance: integerField(0, { min: 0, max: 100 }),
          target: new StringField({
            required: true,
            blank: false,
            initial: "target",
            choices: MOVE_SECONDARY_TARGET_KEYS
          }),
          effectType: new StringField({
            required: true,
            blank: false,
            initial: "condition",
            choices: MOVE_SECONDARY_EFFECT_TYPE_KEYS
          }),
          durationMode: new StringField({
            required: true,
            blank: false,
            initial: "manual",
            choices: MOVE_SECONDARY_DURATION_MODE_KEYS
          }),
          durationRounds: integerField(1, { min: 1, max: 99 }),
          specialDuration: new ArrayField(
            new StringField({
              required: true,
              blank: false,
              initial: "none",
              choices: MOVE_SECONDARY_SPECIAL_DURATION_KEYS
            }),
            {
              required: true,
              initial: () => []
            }
          ),
          conditional: new BooleanField({ required: true, initial: false }),
          activationCondition: trimmedStringField(""),
          condition: new StringField({
            required: true,
            blank: false,
            initial: "none",
            choices: MOVE_SECONDARY_CONDITION_KEYS
          }),
          weather: new StringField({
            required: true,
            blank: false,
            initial: "none",
            choices: MOVE_SECONDARY_WEATHER_KEYS
          }),
          terrain: new StringField({
            required: true,
            blank: false,
            initial: "none",
            choices: MOVE_SECONDARY_TERRAIN_KEYS
          }),
          stat: new StringField({
            required: true,
            blank: false,
            initial: "none",
            choices: MOVE_SECONDARY_STAT_KEYS
          }),
          amount: integerField(0, { min: -999, max: 999 }),
          healType: new StringField({
            required: true,
            blank: false,
            initial: "basic",
            choices: MOVE_SECONDARY_HEAL_TYPE_KEYS
          }),
          healMode: new StringField({
            required: true,
            blank: false,
            initial: "fixed",
            choices: MOVE_SECONDARY_HEAL_MODE_KEYS
          }),
          healProfile: new StringField({
            required: true,
            blank: false,
            initial: "standard",
            choices: MOVE_SECONDARY_HEAL_PROFILE_KEYS
          }),
          healingCategory: new StringField({
            required: true,
            blank: false,
            initial: "standard",
            choices: HEALING_CATEGORY_KEYS
          }),
          notes: trimmedStringField(""),
          linkedEffectId: trimmedStringField("")
        }),
        {
          required: true,
          initial: () => []
        }
      ),
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
          "travel",
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
        restoreAwareness: new BooleanField({ required: true, initial: false }),
        battleHealingCategory: new StringField({
          required: true,
          blank: false,
          initial: "standard",
          choices: HEALING_CATEGORY_KEYS
        })
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
      // Pokéball fields
      pokeball: new SchemaField({
        sealPower: integerField(0, { min: 0, max: 20 }),
        specialEffect: new StringField({
          required: true,
          blank: false,
          initial: "none",
          choices: ["none", "quick", "net", "heal", "dusk", "fast", "heavy", "luxury", "old"]
        }),
        healsOnCapture: new BooleanField({ required: true, initial: false })
      }),
      // Held item fields
      held: new SchemaField({
        passiveEffect: trimmedStringField(""),
        compatiblePokemon: trimmedStringField(""),
        isZCrystal: new BooleanField({ required: true, initial: false }),
        zMoveType: new StringField({
          required: true,
          blank: false,
          initial: "none",
          choices: TYPE_OPTIONS
        }),
        isMegaStone: new BooleanField({ required: true, initial: false }),
        // Automation: damage bonus conditional on move type
        damageBonusType: new StringField({
          required: true,
          blank: false,
          initial: "none",
          choices: TYPE_OPTIONS
        }),
        damageBonusDice: integerField(0, { min: 0, max: 10 }),
        // Automation: damage bonus conditional on move category
        damageBonusCategory: new StringField({
          required: true,
          blank: true,
          initial: ""
        }),
        // Automation: high critical effect
        highCritical: new BooleanField({ required: true, initial: false }),
        highCriticalCategory: new StringField({
          required: true,
          blank: true,
          initial: ""
        }),
        statBonuses: new SchemaField({
          strength: integerField(0, { min: -10, max: 10 }),
          dexterity: integerField(0, { min: -10, max: 10 }),
          vitality: integerField(0, { min: -10, max: 10 }),
          special: integerField(0, { min: -10, max: 10 }),
          insight: integerField(0, { min: -10, max: 10 }),
          def: integerField(0, { min: -10, max: 10 }),
          spDef: integerField(0, { min: -10, max: 10 }),
          initiative: integerField(0, { min: -10, max: 10 })
        }),
        // Accuracy modifiers
        accuracyBonusDice: integerField(0, { min: -10, max: 10 }),
        accuracyPenaltyToAttacker: integerField(0, { min: 0, max: 10 }),
        reducedLowAccuracy: integerField(0, { min: 0, max: 10 }),
        // Super-effective bonus
        superEffectiveBonusDice: integerField(0, { min: 0, max: 10 }),
        // Life Orb
        lifeOrb: new BooleanField({ required: true, initial: false }),
        // Loaded Dice
        loadedDice: new BooleanField({ required: true, initial: false }),
        // Metronome (multi-action bonus)
        metronomeBonus: new BooleanField({ required: true, initial: false }),
        // Focus Sash
        focusSash: new BooleanField({ required: true, initial: false }),
        // Choice items
        choiceType: new StringField({ required: true, blank: true, initial: "" }),
        choicePowerBonus: integerField(0, { min: 0, max: 10 }),
        choicePowerPenalty: integerField(0, { min: 0, max: 10 }),
        choiceInitiativeBonus: integerField(0, { min: 0, max: 10 }),
        choicePriorityBonus: integerField(0, { min: 0, max: 10 }),
        // On-enter-battle status
        onEnterBattleStatus: new StringField({ required: true, blank: true, initial: "" }),
        // Passive immunities/flags
        immuneToStatReduction: new BooleanField({ required: true, initial: false }),
        destinyKnot: new BooleanField({ required: true, initial: false }),
        ejectButton: new BooleanField({ required: true, initial: false }),
        redCard: new BooleanField({ required: true, initial: false }),
        removeTypeImmunities: new BooleanField({ required: true, initial: false }),
        immuneToHazards: new BooleanField({ required: true, initial: false }),
        immuneToWeather: new BooleanField({ required: true, initial: false }),
        immuneToSpore: new BooleanField({ required: true, initial: false }),
        rockyHelmet: new BooleanField({ required: true, initial: false }),
        stickyBarb: new BooleanField({ required: true, initial: false }),
        powerHerb: new BooleanField({ required: true, initial: false }),
        throatSpray: new BooleanField({ required: true, initial: false }),
        weaknessPolicy: new BooleanField({ required: true, initial: false }),
        whiteHerb: new BooleanField({ required: true, initial: false }),
        flinchOnHit: new BooleanField({ required: true, initial: false }),
        // End of round effects
        endOfRoundHeal: integerField(0, { min: 0, max: 10 }),
        endOfRoundMaxUses: integerField(0, { min: 0, max: 10 }),
        endOfRoundDamage: integerField(0, { min: 0, max: 10 })
      }),
      // Vitamin fields
      vitamin: new SchemaField({
        stat: new StringField({
          required: true,
          blank: false,
          initial: "none",
          choices: ["none", "hp", "will", "strength", "dexterity", "vitality", "special", "insight"]
        })
      }),
      // Evolution item fields
      evolution: new SchemaField({
        compatiblePokemon: trimmedStringField("")
      }),
      description: trimmedStringField("")
    };
  }
}

export class AbilityDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      abilityType: new StringField({
        required: true,
        blank: false,
        initial: "passive",
        choices: ["passive", "active", "hidden"]
      }),
      trigger: trimmedStringField(""),
      frequency: trimmedStringField(""),
      target: trimmedStringField(""),
      effect: trimmedStringField(""),
      description: trimmedStringField("")
    };
  }
}

export class WeatherDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      category: new StringField({
        required: true,
        blank: false,
        initial: "climate",
        choices: ["climate", "terrain", "hazard", "other"]
      }),
      duration: integerField(0, { min: 0, max: 999 }),
      accuracyModifier: integerField(0, { min: -6, max: 6 }),
      damageModifier: integerField(0, { min: -6, max: 6 }),
      endOfRoundDamage: integerField(0, { min: 0, max: 20 }),
      affectedTypes: trimmedStringField(""),
      effect: trimmedStringField(""),
      description: trimmedStringField("")
    };
  }
}

export class StatusDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      severity: new StringField({
        required: true,
        blank: false,
        initial: "minor",
        choices: ["minor", "major", "critical"]
      }),
      target: new StringField({
        required: true,
        blank: false,
        initial: "pokemon",
        choices: ["pokemon", "trainer", "any"]
      }),
      endOfRoundDamage: integerField(0, { min: 0, max: 20 }),
      removedSuccesses: integerField(0, { min: 0, max: 6 }),
      blocksAction: new BooleanField({ required: true, initial: false }),
      recovery: trimmedStringField(""),
      effect: trimmedStringField(""),
      description: trimmedStringField("")
    };
  }
}

export class PokedexDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      dexNumber: integerField(0, { min: 0, max: 9999 }),
      rank: new StringField({
        required: true,
        blank: false,
        initial: "starter",
        choices: POKEMON_TIER_KEYS
      }),
      primaryType: new StringField({
        required: true,
        blank: false,
        initial: "normal",
        choices: MOVE_TYPE_KEYS
      }),
      secondaryType: new StringField({
        required: true,
        blank: false,
        initial: "none",
        choices: TYPE_OPTIONS
      }),
      habitats: trimmedStringField(""),
      abilities: trimmedStringField(""),
      commonMoves: trimmedStringField(""),
      evolutionNotes: trimmedStringField(""),
      description: trimmedStringField("")
    };
  }
}
