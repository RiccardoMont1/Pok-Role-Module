import {
  ABILITY_TRIGGER_KEYS,
  ABILITY_TARGET_KEYS,
  COMBAT_FLAG_KEYS,
  getSystemAssetPath,
  HEALING_CATEGORY_KEYS,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
  MOVE_SECONDARY_EFFECT_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_MODE_KEYS,
  MOVE_SECONDARY_HEAL_TYPE_KEYS,
  MOVE_SECONDARY_HEAL_PROFILE_KEYS,
  MOVE_SECONDARY_TERRAIN_KEYS,
  MOVE_SECONDARY_WEATHER_KEYS,
  MOVE_SECONDARY_STAT_KEYS,
  MOVE_SECONDARY_TARGET_KEYS,
  MOVE_SECONDARY_TRIGGER_KEYS,
  MOVE_TARGET_KEYS,
  EFFECT_PASSIVE_TRIGGER_KEYS,
  POKROLE,
  SOCIAL_ATTRIBUTE_KEYS,
  TRAIT_LABEL_BY_KEY,
  TYPE_EFFECTIVENESS
} from "./constants.mjs";
import { evaluateNumericFormula } from "./formula-engine.mjs";

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function legacyChancePercentToDiceCount(percent, maxDice = 20) {
  const normalizedPercent = clamp(Math.floor(toNumber(percent, 0)), 1, 99);
  const probability = normalizedPercent / 100;
  const estimatedDice = Math.round(Math.log(1 - probability) / Math.log(5 / 6));
  return clamp(Number.isFinite(estimatedDice) ? estimatedDice : 1, 1, maxDice);
}

function successPoolFormula(dicePool) {
  const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
  return `${normalizedDicePool}d6cs>=${POKROLE.SUCCESS_TARGET}`;
}

const DELAYED_EFFECT_PROCESS_LOCKS = new Set();

const TYPE_KEY_ALIASES = Object.freeze({
  normale: "normal",
  normal: "normal",
  lotta: "fighting",
  fighting: "fighting",
  volante: "flying",
  flying: "flying",
  veleno: "poison",
  poison: "poison",
  terra: "ground",
  ground: "ground",
  roccia: "rock",
  rock: "rock",
  coleottero: "bug",
  bug: "bug",
  spettro: "ghost",
  ghost: "ghost",
  acciaio: "steel",
  steel: "steel",
  fuoco: "fire",
  fire: "fire",
  acqua: "water",
  water: "water",
  erba: "grass",
  grass: "grass",
  elettrico: "electric",
  electric: "electric",
  psico: "psychic",
  psychic: "psychic",
  ghiaccio: "ice",
  ice: "ice",
  drago: "dragon",
  dragon: "dragon",
  buio: "dark",
  dark: "dark",
  folletto: "fairy",
  fairy: "fairy",
  none: "none",
  nessuno: "none"
});

function hasPainPenaltyException(primaryTraitKey, secondaryTraitKey) {
  return primaryTraitKey === "vitality" || secondaryTraitKey === "vitality";
}

function getTargetActorFromUserSelection() {
  const targets = [...(game.user?.targets ?? [])];
  if (targets.length !== 1) return null;
  return targets[0].actor ?? null;
}

function getCurrentCombatRoundKey() {
  const combat = game.combat;
  if (!combat) return null;
  return `${combat.id}:${combat.round ?? 0}`;
}

const LEGACY_MOVE_TARGET_MAP = Object.freeze({
  foe: "foe",
  "random foe": "random-foe",
  "all foes": "all-foes",
  self: "self",
  user: "self",
  ally: "ally",
  "one ally": "ally",
  "all allies": "all-allies",
  "user and allies": "all-allies",
  area: "area",
  battlefield: "battlefield",
  "foe's battlefield": "foe-battlefield",
  "ally's battlefield": "ally-battlefield",
  "battlefield and area": "battlefield-area",
  "battlefield (foes)": "foe-battlefield"
});

const LEGACY_EFFECT_STAT_MAP = Object.freeze({
  def: "defense",
  defense: "defense",
  spdef: "specialDefense",
  "sp def": "specialDefense",
  "special defense": "specialDefense",
  spec: "special",
  dex: "dexterity",
  attack: "strength",
  "special attack": "special",
  speed: "dexterity",
  accuracy: "accuracy",
  evasion: "evasion",
  clash: "clash"
});

const CONDITION_ALIASES = Object.freeze({
  burn1: "burn",
  burn2: "burn",
  burn3: "burn",
  paralysis: "paralyzed",
  poison: "poisoned",
  badlypoisoned: "badly-poisoned",
  badly_poisoned: "badly-poisoned",
  freeze: "frozen",
  frozen: "frozen",
  confused: "confused",
  dead: "dead",
  morto: "dead"
});

const TEMPORARY_EFFECTS_FLAG = "automation.temporaryEffects";
const CONFIGURED_EFFECTS_FLAG = "automation.configuredEffects";
const CONDITION_FLAGS_FLAG = "automation.conditionFlags";
const CONDITION_KEYS = Object.freeze([
  ...MOVE_SECONDARY_CONDITION_KEYS.filter(
    (conditionKey) => !["none", "burn2", "burn3"].includes(conditionKey)
  ),
  "dead"
]);
const DEFAULT_CLEANSE_CONDITION_KEYS = Object.freeze([
  "burn",
  "frozen",
  "paralyzed",
  "poisoned",
  "badly-poisoned",
  "sleep",
  "confused",
  "disabled",
  "infatuated",
  "flinch"
]);
const CONDITION_FIELD_BY_KEY = Object.freeze({
  sleep: "sleep",
  burn: "burn",
  frozen: "frozen",
  paralyzed: "paralyzed",
  poisoned: "poisoned",
  fainted: "fainted"
});
const CONDITION_ICON_BY_KEY = Object.freeze({
  sleep: getSystemAssetPath("assets/ailments/asleep.svg"),
  burn: getSystemAssetPath("assets/ailments/burn.svg"),
  frozen: getSystemAssetPath("assets/ailments/frozen.svg"),
  paralyzed: getSystemAssetPath("assets/ailments/paralyzed.svg"),
  poisoned: getSystemAssetPath("assets/ailments/poisoned.svg"),
  fainted: getSystemAssetPath("assets/ailments/fainted.svg"),
  dead: "icons/svg/skull.svg",
  confused: "icons/svg/daze.svg",
  flinch: "icons/svg/falling.svg",
  disabled: "icons/svg/cancel.svg",
  infatuated: "icons/svg/heal.svg",
  "badly-poisoned": getSystemAssetPath("assets/ailments/poisoned.svg")
});
const ACTIVE_EFFECT_STACK_MODE_KEYS = Object.freeze([
  "name-origin",
  "name",
  "origin",
  "multiple"
]);
const WEATHER_KEYS = Object.freeze([
  "none",
  "sunny",
  "harsh-sunlight",
  "rain",
  "typhoon",
  "sandstorm",
  "strong-winds",
  "hail"
]);
const TERRAIN_KEYS = Object.freeze([
  "none",
  "electric",
  "grassy",
  "misty",
  "psychic"
]);
const WEATHER_FLAG_KEY = "combat.weather";
const TERRAIN_FLAG_KEY = "combat.terrain";
const TERRAIN_ENTRIES_FLAG_KEY = "combat.terrainEntries";
const TRAINER_STATE_FLAG_KEY = "combat.trainerState";
const HEALING_TRACK_FLAG_KEY = "combat.healingTrack";
const TREATMENT_BLOCK_FLAG_KEY = "combat.treatmentBlockedRound";
const SHIELD_STREAK_FLAG_KEY = "combat.shieldStreak";
const ACTIVE_SHIELDS_FLAG_KEY = "combat.activeShields";
const SIDE_FIELD_ENTRIES_FLAG_KEY = "combat.sideFieldEntries";
const SLEEP_RESIST_TRACK_FLAG_KEY = "combat.sleepResistTrack";
const BURN_TRACK_FLAG_KEY = "combat.burnTrack";
const PARALYSIS_TURN_CHECK_FLAG_KEY = "combat.paralysisTurnCheck";
const CONFUSION_BYPASS_FLAG_KEY = "combat.confusionBypassRound";
const INFATUATION_BYPASS_FLAG_KEY = "combat.infatuationBypassRound";
const FROZEN_SHELL_FLAG_KEY = "combat.frozenShell";
const ROOST_GROUNDED_ROUND_FLAG_KEY = "combat.roostGroundedRound";
const LAST_USED_MOVE_FLAG_KEY = "combat.lastUsedMove";
const LAST_MOVE_RESOLUTION_FLAG_KEY = "combat.lastMoveResolution";
const LAST_RECEIVED_ATTACK_FLAG_KEY = "combat.lastReceivedAttack";
const MULTI_TURN_STATE_FLAG_KEY = "combat.multiTurnState";
const SPECIAL_DAMAGE_UNIQUE_TARGETS_FLAG_KEY = "combat.specialDamageUniqueTargets";
const CHOICE_LOCKED_MOVE_FLAG = "combat.choiceLockedMove";
const BATTLE_SLOT_FLAG_KEY = "combat.battleSlotId";
const SUBSTITUTE_DECOY_FLAG_KEY = "combat.substituteDecoy";
const DESTINY_BOND_STATE_FLAG_KEY = "combat.destinyBond";
const BIDE_STATE_FLAG_KEY = "combat.bideState";
const TRANSFORM_STATE_FLAG_KEY = "combat.transformState";
const CONVERSION_STATE_FLAG_KEY = "combat.conversionState";
const TEMPORARY_COPIED_MOVE_FLAG_KEY = "automation.temporaryCopiedMove";
const SUPPORT_USER_FAINT_MOVE_SEED_IDS = new Set([
  "move-healing-wish",
  "move-lunar-dance",
  "move-memento"
]);
const BATON_PASS_LOCK_FLAG_KEY = "combat.batonPassLock";
const ENTRY_REACTION_BONUS_FLAG_KEY = "combat.entryReactionBonusRound";
const DELAYED_EFFECTS_FLAG_KEY = "combat.delayedEffects";
const SPECIAL_WEATHER_KEYS = Object.freeze(["harsh-sunlight", "typhoon", "strong-winds"]);
const BASIC_WEATHER_KEYS = Object.freeze(["sunny", "rain", "sandstorm", "hail"]);
const TERRAIN_ENTRY_SCOPE_KEYS = Object.freeze(["battlefield", "side"]);
const RAMPAGE_MAX_USES = 3;
const HEALING_BLOCK_FLAG_KEY = "effects.healingBlockedUntil";
const STRENGTH_LIFTING_CAPACITY_KG = Object.freeze([
  0,
  18,
  45,
  113,
  181,
  294,
  362,
  408,
  453,
  544,
  680
]);
const RANK_DAMAGE_DICE_BY_TIER = Object.freeze({
  starter: 1,
  rookie: 2,
  standard: 3,
  advanced: 4,
  expert: 6,
  ace: 8,
  master: 10,
  champion: 10
});
const SPECIAL_DAMAGE_MOVE_RULES = Object.freeze({
  "move-chip-away": Object.freeze({
    ignoresCover: true,
    ignoresSubstitute: true
  }),
  "move-doom-desire": Object.freeze({
    ignoresCover: true,
    ignoresShield: true,
    ignoresSubstitute: true
  }),
  "move-future-sight": Object.freeze({
    ignoresCover: true,
    ignoresShield: true,
    ignoresSubstitute: true
  }),
  "move-hidden-power": Object.freeze({
    forceSuperEffective: true
  }),
  "move-hyperspace-hole": Object.freeze({
    ignoresShield: true,
    ignoresSubstitute: true
  }),
  "move-sonic-boom": Object.freeze({
    ignoresCover: true,
    ignoresShield: true,
    ignoreTypeInteraction: true,
    fixedFinalDamage: 1
  }),
  "move-counter": Object.freeze({
    retaliationCategories: Object.freeze(["physical"])
  }),
  "move-mirror-coat": Object.freeze({
    forcesDamageMode: true,
    retaliationCategories: Object.freeze(["special"])
  }),
  "move-metal-burst": Object.freeze({
    retaliationCategories: Object.freeze(["physical", "special"])
  }),
  "move-comeuppance": Object.freeze({
    retaliationCategories: Object.freeze(["physical", "special"])
  }),
  "move-endeavor": Object.freeze({
    minimumTargetHpSourceCurrent: true
  }),
  "move-ruination": Object.freeze({
    uniqueTargetPerCombat: true
  })
});
const SWITCHER_MOVE_RULES = Object.freeze({
  "move-ally-switch": Object.freeze({
    mode: "ally-switch",
    targetMode: "self",
    refundAction: true,
    grantEntryReaction: true
  }),
  "move-baton-pass": Object.freeze({
    mode: "self-switch",
    targetMode: "self",
    batonPass: true,
    transferPositiveModifiers: true
  }),
  "move-chilly-reception": Object.freeze({
    mode: "self-switch",
    targetMode: "self"
  }),
  "move-circle-throw": Object.freeze({
    mode: "forced-foe-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-dragon-tail": Object.freeze({
    mode: "forced-foe-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-flip-turn": Object.freeze({
    mode: "self-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-parting-shot": Object.freeze({
    mode: "self-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-roar": Object.freeze({
    mode: "forced-foe-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-shed-tail": Object.freeze({
    mode: "self-switch",
    targetMode: "self",
    createDecoy: true,
    selfDamage: 2
  }),
  "move-substitute": Object.freeze({
    mode: "decoy",
    targetMode: "self",
    createDecoy: true,
    selfDamage: 2
  }),
  "move-teleport": Object.freeze({
    mode: "self-switch",
    targetMode: "self"
  }),
  "move-u-turn": Object.freeze({
    mode: "self-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-volt-switch": Object.freeze({
    mode: "self-switch",
    targetMode: "foe",
    requiresHit: true
  }),
  "move-whirlwind": Object.freeze({
    mode: "forced-foe-switch",
    targetMode: "foe",
    requiresHit: true
  })
});
const SPECIAL_CHARGE_MOVE_RULES = Object.freeze({
  "move-beak-blast": Object.freeze({
    outOfRange: false,
    chargeState: "heated",
    punishOnHit: Object.freeze({
      requiresDamagingMove: true,
      requiresPhysicalContact: true,
      condition: "burn2"
    })
  }),
  "move-bounce": Object.freeze({
    outOfRange: true,
    chargeState: "air",
    vulnerableTo: Object.freeze([
      "move-thunder",
      "move-twister",
      "move-sky-uppercut",
      "move-gust",
      "move-hurricane",
      "move-smack-down"
    ])
  }),
  "move-dig": Object.freeze({
    outOfRange: true,
    chargeState: "underground",
    vulnerableTo: Object.freeze([
      "move-earth-power",
      "move-earthquake",
      "move-fissure",
      "move-magnitude",
      "move-stomping-tantrum"
    ])
  }),
  "move-dive": Object.freeze({
    outOfRange: true,
    chargeState: "underwater",
    vulnerableTo: Object.freeze([
      "move-scald",
      "move-surf",
      "move-whirlpool",
      "move-freeze-dry",
      "move-sheer-cold"
    ])
  }),
  "move-fly": Object.freeze({
    outOfRange: true,
    chargeState: "air",
    vulnerableTo: Object.freeze([
      "move-thunder",
      "move-twister",
      "move-sky-uppercut",
      "move-gust",
      "move-hurricane",
      "move-smack-down"
    ])
  }),
  "move-focus-punch": Object.freeze({
    outOfRange: false,
    chargeState: "focus",
    interruptOnHit: Object.freeze({
      requiresDamagingMove: true,
      condition: "flinch"
    })
  }),
  "move-phantom-force": Object.freeze({
    outOfRange: true,
    chargeState: "shadow",
    ignoresCover: true,
    ignoresShield: true
  }),
  "move-shadow-force": Object.freeze({
    outOfRange: true,
    chargeState: "shadow",
    ignoresCover: true,
    ignoresShield: true,
    ignoresDefenses: true,
    healingBlockHours: 24
  }),
  "move-sky-drop": Object.freeze({
    outOfRange: true,
    chargeState: "air",
    carriesTargets: true,
    vulnerableTo: Object.freeze([
      "move-thunder",
      "move-twister",
      "move-sky-uppercut",
      "move-gust",
      "move-hurricane",
      "move-smack-down"
    ])
  })
});
const TERRAIN_RUNTIME_MOVE_RULES = Object.freeze({
  "move-court-change": Object.freeze({
    swapSideTerrain: true
  }),
  "move-defog": Object.freeze({
    clearAllTerrainsOnHit: true
  }),
  "move-electric-terrain": Object.freeze({
    terrain: "electric",
    terrainScope: "battlefield"
  }),
  "move-expanding-force": Object.freeze({
    requiredTerrain: "psychic",
    bonusDamageDice: 2,
    bonusTargetCount: 1
  }),
  "move-grassy-glide": Object.freeze({
    conditionalPriority: Object.freeze({
      terrain: "grassy",
      active: 1,
      inactive: 0
    })
  }),
  "move-grassy-terrain": Object.freeze({
    terrain: "grassy",
    terrainScope: "side"
  }),
  "move-max-lightning": Object.freeze({
    terrain: "electric",
    terrainScope: "battlefield"
  }),
  "move-max-mindstorm": Object.freeze({
    terrain: "psychic",
    terrainScope: "battlefield"
  }),
  "move-max-overgrowth": Object.freeze({
    terrain: "grassy",
    terrainScope: "side"
  }),
  "move-max-starfall": Object.freeze({
    terrain: "misty",
    terrainScope: "battlefield"
  }),
  "move-misty-terrain": Object.freeze({
    terrain: "misty",
    terrainScope: "battlefield"
  }),
  "move-misty-explosion": Object.freeze({
    requiredTerrain: "misty",
    bonusDamageDice: 4
  }),
  "move-mortal-spin": Object.freeze({
    clearActorSideTerrainsOnHit: true,
    clearBattlefieldTerrainsOnHit: true
  }),
  "move-psyblade": Object.freeze({
    requiredTerrain: "electric",
    bonusDamageDice: 2
  }),
  "move-psychic-terrain": Object.freeze({
    terrain: "psychic",
    terrainScope: "battlefield"
  }),
  "move-rapid-spin": Object.freeze({
    clearActorSideTerrainsOnHit: true,
    clearBattlefieldTerrainsOnHit: true
  }),
  "move-rising-voltage": Object.freeze({
    requiredTerrain: "electric",
    bonusDamageDice: 3
  }),
  "move-steel-roller": Object.freeze({
    requiresAnyTerrain: true,
    clearAllTerrainsOnHit: true
  }),
  "move-terrain-pulse": Object.freeze({
    typeMatchesPreferredTerrain: true,
    bonusDamageDiceIfAnyTerrain: 2
  })
});
const SWITCHER_MOVE_RUNTIME_RULES = Object.freeze({
  "move-ally-switch": Object.freeze({
    kind: "ally-swap",
    refundAction: true,
    grantEntryReaction: true
  }),
  "move-baton-pass": Object.freeze({
    kind: "self-switch",
    passBuffs: true
  }),
  "move-chilly-reception": Object.freeze({
    kind: "self-switch"
  }),
  "move-circle-throw": Object.freeze({
    kind: "force-foe-switch",
    requiresHit: true
  }),
  "move-dragon-tail": Object.freeze({
    kind: "force-foe-switch",
    requiresHit: true
  }),
  "move-flip-turn": Object.freeze({
    kind: "self-switch",
    requiresHit: true
  }),
  "move-parting-shot": Object.freeze({
    kind: "self-switch",
    requiresHit: true
  }),
  "move-roar": Object.freeze({
    kind: "force-foe-switch",
    requiresHit: true
  }),
  "move-shed-tail": Object.freeze({
    kind: "shed-tail"
  }),
  "move-substitute": Object.freeze({
    kind: "substitute"
  }),
  "move-teleport": Object.freeze({
    kind: "self-switch"
  }),
  "move-u-turn": Object.freeze({
    kind: "self-switch",
    requiresHit: true
  }),
  "move-volt-switch": Object.freeze({
    kind: "self-switch",
    requiresHit: true
  }),
  "move-whirlwind": Object.freeze({
    kind: "force-foe-switch",
    requiresHit: true
  })
});
const DELAYED_MOVE_RUNTIME_RULES = Object.freeze({
  "move-doom-desire": Object.freeze({
    kind: "delayed-hit",
    triggerPhase: "round-start",
    delayRounds: 1,
    retargetSide: "target"
  }),
  "move-fire-pledge": Object.freeze({
    kind: "round-end-field-damage",
    triggerPhase: "round-end",
    delayRounds: 0,
    repeatRounds: 4,
    damageDice: 2,
    damageType: "fire",
    ignoreDefenses: true
  }),
  "move-future-sight": Object.freeze({
    kind: "delayed-hit",
    triggerPhase: "round-start",
    delayRounds: 1,
    retargetSide: "target"
  }),
  "move-grudge": Object.freeze({
    kind: "grudge",
    triggerPhase: "round-end",
    delayRounds: 0,
    repeat: true
  }),
  "move-malignant-chain": Object.freeze({
    kind: "malignant-chain",
    triggerPhase: "round-end",
    delayRounds: 0,
    repeat: true
  }),
  "move-sappy-seed": Object.freeze({
    kind: "seed-drain",
    triggerPhase: "round-end",
    delayRounds: 0,
    repeat: true,
    damageDice: 2
  }),
  "move-wish": Object.freeze({
    kind: "wish",
    triggerPhase: "round-start",
    delayRounds: 1
  }),
  "move-yawn": Object.freeze({
    kind: "yawn",
    triggerPhase: "round-start",
    delayRounds: 1
  })
});
const COPY_MOVE_RUNTIME_RULES = Object.freeze({
  "move-copycat": Object.freeze({
    kind: "copy-last-used-target"
  }),
  "move-instruct": Object.freeze({
    kind: "repeat-last-used-target"
  }),
  "move-me-first": Object.freeze({
    kind: "copy-queued-target",
    disallowSupport: true
  }),
  "move-mimic": Object.freeze({
    kind: "replace-self-with-last-used-target",
    temporarySceneScoped: true
  }),
  "move-mirror-move": Object.freeze({
    kind: "copy-last-used-target"
  }),
  "move-sketch": Object.freeze({
    kind: "replace-self-with-last-used-target",
    permanent: true
  })
});
const MOVE_DYNAMIC_TYPE_RUNTIME_RULES = Object.freeze({
  "move-hidden-power": Object.freeze({
    mode: "best-against-target"
  }),
  "move-ivy-cudgel": Object.freeze({
    mode: "secondary-else-primary"
  }),
  "move-judgment": Object.freeze({
    mode: "prompted"
  }),
  "move-raging-bull": Object.freeze({
    mode: "secondary-else-primary"
  })
});
const MOVE_DYNAMIC_POWER_RUNTIME_RULES = Object.freeze({
  "move-fickle-beam": Object.freeze({
    mode: "d6-table",
    table: Object.freeze({
      1: 3,
      2: 3,
      3: 3,
      4: 3,
      5: 3,
      6: 6
    })
  }),
  "move-judgment": Object.freeze({
    mode: "prompt"
  }),
  "move-magnitude": Object.freeze({
    mode: "d6-table",
    table: Object.freeze({
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6
    })
  })
});
const SIDE_FIELD_MOVE_RUNTIME_RULES = Object.freeze({
  "move-aurora-veil": Object.freeze({
    create: Object.freeze([
      { kind: "force-field", side: "source", protection: "physical-special", durationRounds: 4 }
    ])
  }),
  "move-baddy-bad": Object.freeze({
    requiresHit: true,
    create: Object.freeze([
      { kind: "force-field", side: "source", protection: "physical", durationRounds: 4 }
    ])
  }),
  "move-court-change": Object.freeze({
    swapSideFields: true
  }),
  "move-defog": Object.freeze({
    clearForceFields: "all",
    clearHazards: "all"
  }),
  "move-glitzy-glow": Object.freeze({
    requiresHit: true,
    create: Object.freeze([
      { kind: "force-field", side: "source", protection: "special", durationRounds: 4 }
    ])
  }),
  "move-grass-pledge": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "grass-pledge", durationRounds: 4 }
    ])
  }),
  "move-light-screen": Object.freeze({
    create: Object.freeze([
      { kind: "force-field", side: "source", protection: "special", durationRounds: 4 }
    ])
  }),
  "move-mortal-spin": Object.freeze({
    clearHazards: "source-side"
  }),
  "move-rapid-spin": Object.freeze({
    clearHazards: "source-side"
  }),
  "move-reflect": Object.freeze({
    create: Object.freeze([
      { kind: "force-field", side: "source", protection: "physical", durationRounds: 4 }
    ])
  }),
  "move-spider-web": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "spider-web", durationRounds: 0 }
    ])
  }),
  "move-spikes": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "spikes", durationRounds: 0 }
    ])
  }),
  "move-stealth-rock": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "stealth-rock", durationRounds: 0 }
    ])
  }),
  "move-toxic-spikes": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "toxic-spikes", durationRounds: 0 }
    ])
  }),
  "move-sticky-web": Object.freeze({
    create: Object.freeze([
      { kind: "hazard", side: "foe", hazard: "sticky-web", durationRounds: 0 }
    ])
  })
});
const LOCKING_MOVE_RUNTIME_RULES = Object.freeze({
  "move-anchor-shot": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-bind": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-block": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-ceaseless-edge": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    ongoingDamageDice: 2
  }),
  "move-clamp": Object.freeze({
    targets: Object.freeze(["self", "target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-fire-spin": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-grapple": Object.freeze({
    targets: Object.freeze(["self", "target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true,
    grappling: true
  }),
  "move-infestation": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-jaw-lock": Object.freeze({
    targets: Object.freeze(["self", "target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-mean-look": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-salt-cure": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    ongoingDamageDice: 2,
    extraDamageVsTypes: Object.freeze(["water", "steel"])
  }),
  "move-sand-tomb": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-snap-trap": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-spirit-shackle": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-stone-axe": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    ongoingDamageDice: 2
  }),
  "move-thousand-waves": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "manual",
    sceneScoped: true,
    blocksSwitch: true
  }),
  "move-thunder-cage": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-whirlpool": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  }),
  "move-wrap": Object.freeze({
    targets: Object.freeze(["target"]),
    durationMode: "rounds",
    durationRounds: 4,
    blocksSwitch: true,
    ongoingDamageDice: 2
  })
});
const CHARGE_MOVE_PROFILE_OVERRIDES = Object.freeze({
  "move-electro-shot": {
    skipChargeWeather: ["rain", "typhoon"]
  },
  "move-solar-beam": {
    skipChargeWeather: ["sunny", "harsh-sunlight"],
    extraChargeWeather: ["rain", "typhoon", "sandstorm", "hail"],
    extraChargeActions: 2
  },
  "move-solar-blade": {
    skipChargeWeather: ["sunny", "harsh-sunlight"],
    extraChargeWeather: ["rain", "typhoon", "sandstorm", "hail"],
    extraChargeActions: 2
  }
});
const CHARGE_START_EFFECT_SEED_IDS = Object.freeze(new Set([
  "move-meteor-beam",
  "move-skull-bash"
]));
const FROZEN_SHELL_DEFAULTS = Object.freeze({
  hp: 5,
  defense: 2,
  specialDefense: 2
});
const SECONDARY_EFFECT_CHANCE_DICE_MAX = 20;
const SHIELD_MOVE_PROFILE_OVERRIDES = Object.freeze({
  "move-baneful-bunker": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "condition", condition: "poisoned" }
  },
  "move-burning-bulwark": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "condition", condition: "burn" }
  },
  "move-crafty-shield": {
    damageReduction: 0,
    protectsCategories: [],
    blocksAddedEffects: true
  },
  "move-detect": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-endure": {
    damageReduction: 0,
    protectsCategories: ["physical", "special"],
    endureAtOne: true
  },
  "move-king-s-shield": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "strength", amount: -2 }
  },
  "move-mat-block": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"]
  },
  "move-max-guard": {
    damageReduction: 5,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-obstruct": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "defense", amount: -2 }
  },
  "move-protect": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  },
  "move-quick-guard": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    requiresPriority: true,
    blocksAddedEffects: true,
    blockEffectsRequiresPriority: true
  },
  "move-silk-trap": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "stat", stat: "dexterity", amount: -2 }
  },
  "move-spiky-shield": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    retaliation: { mode: "damage", amount: 2, ignoreDefenses: true }
  },
  "move-wide-guard": {
    damageReduction: 3,
    protectsCategories: ["physical", "special"],
    blocksAddedEffects: true
  }
});

export class PokRoleActor extends Actor {
  getRollData() {
    const rollData = super.getRollData();
    rollData.system = foundry.utils.deepClone(this.system);
    return rollData;
  }

  getTraitValue(traitKey) {
    if (!traitKey || traitKey === "none") return 0;
    const base = toNumber(this.system.attributes?.[traitKey], Number.NaN);
    const heldBonus = this._getHeldItemStatBonus(traitKey);
    return isNaN(base) ? base : base + heldBonus;
  }

  getInitiativeScore() {
    const dexterity = this.getTraitValue("dexterity");
    const alert = this.getSkillValue("alert");
    return Math.max(toNumber(dexterity, 0) + toNumber(alert, 0), 0);
  }

  getDefense(category = "physical") {
    const base = category === "special"
      ? Math.max(this.getTraitValue("insight"), 0)
      : Math.max(this.getTraitValue("vitality"), 0);
    const weather = this.getActiveWeatherKey?.() ?? "none";
    const weatherBonus = this._getWeatherDefenseBonusForStat(category, weather);
    const defKey = category === "special" ? "spDef" : "def";
    const heldDefBonus = this._getHeldItemStatBonus(defKey);
    return base + weatherBonus + heldDefBonus;
  }

  _getWeatherDefenseBonusForStat(category, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    if (weather === "none" || this.type !== "pokemon") return 0;
    if (weather === "sandstorm" && category === "special" && this.hasType?.("rock")) {
      return 1;
    }
    if (weather === "hail" && category !== "special" && this.hasType?.("ice")) {
      return 1;
    }
    return 0;
  }

  _localizeWeatherName(weatherKey) {
    const normalized = this._normalizeWeatherKey(weatherKey);
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

  _localizeTerrainName(terrainKey) {
    const normalized = this._normalizeTerrainKey(terrainKey);
    const labelByKey = {
      none: "POKROLE.Common.None",
      electric: "POKROLE.Combat.TerrainValues.Electric",
      grassy: "POKROLE.Combat.TerrainValues.Grassy",
      misty: "POKROLE.Combat.TerrainValues.Misty",
      psychic: "POKROLE.Combat.TerrainValues.Psychic"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  _localizeCoverLevel(levelKey) {
    const normalized = `${levelKey ?? "none"}`.trim().toLowerCase();
    const labelByKey = {
      none: "POKROLE.Common.None",
      quarter: "POKROLE.Combat.CoverQuarter",
      half: "POKROLE.Combat.CoverHalf",
      full: "POKROLE.Combat.CoverFull"
    };
    return game.i18n.localize(labelByKey[normalized] ?? "POKROLE.Common.None");
  }

  async restPokemon() {
    if (this.type !== "pokemon") return null;
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system.resources?.hp?.max, 1), 1);
    const willValue = Math.max(toNumber(this.system.resources?.will?.value, 0), 0);
    const willMax = Math.max(toNumber(this.system.resources?.will?.max, 1), 1);
    const updatePayload = {};
    if (hpValue !== hpMax) updatePayload["system.resources.hp.value"] = hpMax;
    if (willValue !== willMax) updatePayload["system.resources.will.value"] = willMax;
    if (Object.keys(updatePayload).length > 0) {
      await this.update(updatePayload);
    }
    await this.resetTurnState({ resetInitiative: true });
    await this.toggleQuickCondition("fainted", { active: false });
    await this.toggleQuickCondition("flinch", { active: false });
    await this.toggleQuickCondition("sleep", { active: false });
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.PokemonRested", { actor: this.name })
    );
    return {
      hpBefore: hpValue,
      hpAfter: hpMax,
      willBefore: willValue,
      willAfter: willMax
    };
  }

  _normalizeWeatherKey(weatherKey) {
    const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
    return WEATHER_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeTerrainKey(terrainKey) {
    const normalized = `${terrainKey ?? "none"}`.trim().toLowerCase();
    return TERRAIN_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeTerrainScope(scope) {
    const normalized = `${scope ?? "battlefield"}`.trim().toLowerCase();
    return TERRAIN_ENTRY_SCOPE_KEYS.includes(normalized) ? normalized : "battlefield";
  }

  _normalizeTerrainSideDisposition(value, fallback = 0) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return clamp(Math.sign(Math.trunc(numericValue)), -1, 1);
  }

  _normalizeCombatSideKey(value) {
    const normalized = `${value ?? ""}`.trim();
    return normalized || null;
  }

  _normalizeTerrainEntry(entry) {
    const normalizedTerrain = this._normalizeTerrainKey(entry?.terrain ?? entry?.condition);
    if (normalizedTerrain === "none") return null;
    const scope = this._normalizeTerrainScope(entry?.scope);
    const normalizedEntry = {
      id: `${entry?.id ?? foundry.utils.randomID()}`.trim() || foundry.utils.randomID(),
      terrain: normalizedTerrain,
      scope,
      sideKey:
        scope === "side"
          ? this._normalizeCombatSideKey(entry?.sideKey)
          : null,
      sideDisposition:
        scope === "side"
          ? this._normalizeTerrainSideDisposition(entry?.sideDisposition, 0)
          : null,
      durationRounds: Math.max(Math.floor(toNumber(entry?.durationRounds, 0)), 0),
      roundSet: Math.max(Math.floor(toNumber(entry?.roundSet, 0)), 0),
      sourceActorId: `${entry?.sourceActorId ?? ""}`.trim() || null,
      sourceActorName: `${entry?.sourceActorName ?? ""}`.trim(),
      sourceMoveId: `${entry?.sourceMoveId ?? ""}`.trim() || null,
      sourceMoveName: `${entry?.sourceMoveName ?? ""}`.trim()
    };
    return normalizedEntry;
  }

  _getLegacyTerrainEntry(combat = game.combat) {
    if (!combat) return null;
    const terrainData = combat.getFlag(POKROLE.ID, TERRAIN_FLAG_KEY) ?? {};
    const terrainKey = this._normalizeTerrainKey(terrainData?.condition);
    if (terrainKey === "none") return null;
    return this._normalizeTerrainEntry({
      id: "legacy-battlefield-terrain",
      terrain: terrainKey,
      scope: "battlefield",
      durationRounds: terrainData?.durationRounds ?? 0,
      roundSet: terrainData?.roundSet ?? 0,
      sourceActorId: terrainData?.sourceActorId ?? null,
      sourceActorName: terrainData?.sourceActorName ?? "",
      sourceMoveId: terrainData?.sourceMoveId ?? null
    });
  }

  _getCombatTerrainEntries(combat = game.combat) {
    if (!combat) return [];
    const rawEntries = combat.getFlag(POKROLE.ID, TERRAIN_ENTRIES_FLAG_KEY);
    const normalizedEntries = Array.isArray(rawEntries)
      ? rawEntries
          .map((entry) => this._normalizeTerrainEntry(entry))
          .filter(Boolean)
      : [];
    if (normalizedEntries.length > 0) {
      return normalizedEntries;
    }
    const legacyEntry = this._getLegacyTerrainEntry(combat);
    return legacyEntry ? [legacyEntry] : [];
  }

  async _syncLegacyTerrainFlag(combat, terrainEntries = [], options = {}) {
    if (!combat) return null;
    const normalizedEntries = Array.isArray(terrainEntries)
      ? terrainEntries.map((entry) => this._normalizeTerrainEntry(entry)).filter(Boolean)
      : [];
    const battlefieldEntry =
      normalizedEntries.find((entry) => entry.scope === "battlefield") ?? null;
    const payload = battlefieldEntry
      ? {
          condition: battlefieldEntry.terrain,
          durationRounds: battlefieldEntry.durationRounds,
          roundSet: battlefieldEntry.roundSet,
          sourceActorId: battlefieldEntry.sourceActorId ?? options.sourceActorId ?? this.id ?? null,
          sourceActorName: battlefieldEntry.sourceActorName || options.sourceActorName || this.name || "",
          sourceMoveId: battlefieldEntry.sourceMoveId ?? options.sourceMoveId ?? null
        }
      : {
          condition: "none",
          durationRounds: 0,
          roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
          sourceActorId: options.sourceActorId ?? this.id ?? null,
          sourceActorName: options.sourceActorName ?? this.name ?? "",
          sourceMoveId: options.sourceMoveId ?? null
        };
    await combat.setFlag(POKROLE.ID, TERRAIN_FLAG_KEY, payload);
    return payload;
  }

  async _setCombatTerrainEntries(combat, terrainEntries = [], options = {}) {
    if (!combat) return [];
    const normalizedEntries = (Array.isArray(terrainEntries) ? terrainEntries : [])
      .map((entry) => this._normalizeTerrainEntry(entry))
      .filter(Boolean);
    await combat.setFlag(POKROLE.ID, TERRAIN_ENTRIES_FLAG_KEY, normalizedEntries);
    await this._syncLegacyTerrainFlag(combat, normalizedEntries, options);
    await this._syncTerrainTrackerEffectsForCombat(combat, normalizedEntries);
    return normalizedEntries;
  }

  _getActorCombatSideDisposition(actor = this, combat = game.combat) {
    const normalizedActor = actor ?? null;
    if (!combat || !normalizedActor) return 0;
    const delayedSideOverride = Number(normalizedActor.getFlag?.(POKROLE.ID, "combat.sideDispositionOverride"));
    if (Number.isFinite(delayedSideOverride) && delayedSideOverride !== 0) {
      return clamp(Math.sign(Math.trunc(delayedSideOverride)), -1, 1);
    }
    const trainerActor =
      normalizedActor.type === "pokemon"
        ? this._getPokemonTrainerActor(normalizedActor)
        : null;
    const trainerCombatant =
      trainerActor
        ? combat.combatants?.find?.((entry) => entry.actor?.id === trainerActor.id) ?? null
        : null;
    const combatant =
      combat.combatants?.find?.((entry) => entry.actor?.id === normalizedActor.id) ?? null;
    const possibleDispositions = [
      combatant?.getFlag?.(POKROLE.ID, "forcedDisposition"),
      combatant?.token?.disposition,
      combatant?.token?.document?.disposition,
      normalizedActor.getActiveTokens?.(true)?.[0]?.document?.disposition,
      normalizedActor.getActiveTokens?.()?.[0]?.document?.disposition,
      trainerCombatant?.getFlag?.(POKROLE.ID, "forcedDisposition"),
      trainerCombatant?.token?.disposition,
      trainerCombatant?.token?.document?.disposition,
      trainerActor?.getActiveTokens?.(true)?.[0]?.document?.disposition,
      trainerActor?.getActiveTokens?.()?.[0]?.document?.disposition
    ];
    for (const rawDisposition of possibleDispositions) {
      const numericValue = Number(rawDisposition);
      if (!Number.isFinite(numericValue)) continue;
      return clamp(Math.sign(Math.trunc(numericValue)), -1, 1);
    }
    if (trainerActor?.id) {
      const alliedDisposition = (combat.combatants ?? [])
        .filter((entry) => entry?.actor?.id && entry.actor.id !== normalizedActor.id)
        .filter((entry) => `${entry.actor?.system?.currentTrainer ?? ""}`.trim() === trainerActor.id)
        .map((entry) => [
          entry?.getFlag?.(POKROLE.ID, "forcedDisposition"),
          entry?.token?.disposition,
          entry?.token?.document?.disposition
        ])
        .flat()
        .map((rawDisposition) => Number(rawDisposition))
        .filter((numericValue) => Number.isFinite(numericValue))
        .map((numericValue) => clamp(Math.sign(Math.trunc(numericValue)), -1, 1))
        .find((value) => value !== 0);
      if (alliedDisposition) return alliedDisposition;
    }
    return 0;
  }

  _getOpposingCombatSideDisposition(actor = this, combat = game.combat) {
    if (!combat) return 0;
    const ownDisposition = this._getActorCombatSideDisposition(actor, combat);
    if (ownDisposition !== 0) return ownDisposition * -1;
    const knownDispositions = [...new Set(
      (combat.combatants ?? [])
        .map((entry) => this._getActorCombatSideDisposition(entry?.actor ?? null, combat))
        .filter((value) => value !== 0)
    )];
    if (knownDispositions.length === 1) return knownDispositions[0] * -1;
    if (knownDispositions.length >= 2) return knownDispositions[0] * -1;
    return 0;
  }

  _hasReliableCombatDispositionSplit(combat = game.combat) {
    if (!combat) return false;
    const knownDispositions = new Set(
      (combat.combatants ?? [])
        .map((entry) => this._getActorCombatSideDisposition(entry?.actor ?? null, combat))
        .filter((value) => value !== 0)
    );
    return knownDispositions.size >= 2;
  }

  _getActorTrainerSideKey(actor = this) {
    const normalizedActor = actor ?? null;
    if (!normalizedActor) return null;
    if (normalizedActor.type === "trainer" && normalizedActor.id) {
      return this._normalizeCombatSideKey(`trainer:${normalizedActor.id}`);
    }
    const trainerActor = this._getTrainerActorForPokemon(normalizedActor);
    if (trainerActor?.id) {
      return this._normalizeCombatSideKey(`trainer:${trainerActor.id}`);
    }
    const trainerId = `${normalizedActor?.system?.currentTrainer ?? ""}`.trim();
    if (trainerId) {
      return this._normalizeCombatSideKey(`trainer:${trainerId}`);
    }
    return null;
  }

  _getActorCombatSideKey(actor = this, combat = game.combat) {
    const normalizedActor = actor ?? null;
    if (!normalizedActor) return null;

    const overrideKey = this._normalizeCombatSideKey(
      normalizedActor.getFlag?.(POKROLE.ID, "combat.sideKeyOverride")
    );
    if (overrideKey) return overrideKey;

    if (this._hasReliableCombatDispositionSplit(combat)) {
      const disposition = this._getActorCombatSideDisposition(normalizedActor, combat);
      if (disposition !== 0) {
        return this._normalizeCombatSideKey(`disposition:${disposition}`);
      }
    }

    const trainerSideKey = this._getActorTrainerSideKey(normalizedActor);
    if (trainerSideKey) return trainerSideKey;

    const disposition = this._getActorCombatSideDisposition(normalizedActor, combat);
    if (disposition !== 0) {
      return this._normalizeCombatSideKey(`disposition:${disposition}`);
    }

    const combatant = this._getCombatantForActor(normalizedActor, combat);
    if (combatant?.id) {
      return this._normalizeCombatSideKey(`combatant:${combatant.id}`);
    }

    if (normalizedActor.id) {
      return this._normalizeCombatSideKey(`actor:${normalizedActor.id}`);
    }
    return null;
  }

  _getActorCombatSideReference(actor = this, combat = game.combat) {
    return {
      sideKey: this._getActorCombatSideKey(actor, combat),
      sideDisposition: this._getActorCombatSideDisposition(actor, combat)
    };
  }

  _doesCombatSideEntryMatchReference(entry, sideReference = {}) {
    const entrySideKey = this._normalizeCombatSideKey(entry?.sideKey);
    const entrySideDisposition = this._normalizeTerrainSideDisposition(entry?.sideDisposition, 0);
    const referenceSideKey = this._normalizeCombatSideKey(sideReference?.sideKey);
    const referenceSideDisposition = this._normalizeTerrainSideDisposition(
      sideReference?.sideDisposition,
      0
    );
    if (entrySideKey && referenceSideKey) {
      return entrySideKey === referenceSideKey;
    }
    if (entrySideDisposition !== 0 && referenceSideDisposition !== 0) {
      return entrySideDisposition === referenceSideDisposition;
    }
    if (entrySideKey && !referenceSideKey) return false;
    if (!entrySideKey && referenceSideKey) return false;
    return false;
  }

  _getOpposingCombatSideReference(actor = this, combat = game.combat) {
    if (!combat) {
      return { sideKey: null, sideDisposition: 0 };
    }
    const ownReference = this._getActorCombatSideReference(actor, combat);
    const opposingReferences = [];
    for (const combatant of combat.combatants ?? []) {
      const combatantActor = combatant?.actor ?? null;
      if (!combatantActor || combatantActor.id === actor?.id) continue;
      const sideReference = this._getActorCombatSideReference(combatantActor, combat);
      if (sideReference.sideKey && ownReference.sideKey && sideReference.sideKey === ownReference.sideKey) {
        continue;
      }
      if (
        !sideReference.sideKey &&
        !ownReference.sideKey &&
        sideReference.sideDisposition !== 0 &&
        sideReference.sideDisposition === ownReference.sideDisposition
      ) {
        continue;
      }
      opposingReferences.push(sideReference);
    }
    const uniqueReferences = opposingReferences.filter((candidate, index, entries) =>
      entries.findIndex((entry) =>
        this._normalizeCombatSideKey(entry?.sideKey) === this._normalizeCombatSideKey(candidate?.sideKey) &&
        this._normalizeTerrainSideDisposition(entry?.sideDisposition, 0) ===
          this._normalizeTerrainSideDisposition(candidate?.sideDisposition, 0)
      ) === index
    );
    if (uniqueReferences.length > 0) return uniqueReferences[0];

    const ownDisposition = this._getActorCombatSideDisposition(actor, combat);
    if (ownDisposition !== 0) {
      return {
        sideKey: this._normalizeCombatSideKey(`disposition:${ownDisposition * -1}`),
        sideDisposition: ownDisposition * -1
      };
    }
    return { sideKey: null, sideDisposition: 0 };
  }

  _getCombatantForActor(actor = this, combat = game.combat) {
    if (!combat || !actor) return null;
    return combat.combatants?.find?.((entry) => entry.actor?.id === actor.id) ?? null;
  }

  _getCombatantBattleSlotId(combatant) {
    if (!combatant) return "";
    const flagValue = `${combatant.getFlag?.(POKROLE.ID, BATTLE_SLOT_FLAG_KEY) ?? ""}`.trim();
    return flagValue || `${combatant.id ?? ""}`.trim();
  }

  async _ensureCombatantBattleSlotId(combatant) {
    if (!combatant) return "";
    const slotId = this._getCombatantBattleSlotId(combatant) || foundry.utils.randomID();
    if (`${combatant.getFlag?.(POKROLE.ID, BATTLE_SLOT_FLAG_KEY) ?? ""}`.trim() !== slotId) {
      await combatant.setFlag(POKROLE.ID, BATTLE_SLOT_FLAG_KEY, slotId);
    }
    return slotId;
  }

  _getTrainerActorForPokemon(pokemonActor = this) {
    const trainerId = `${pokemonActor?.system?.currentTrainer ?? ""}`.trim();
    if (!trainerId) return null;
    const trainer = game.actors.get(trainerId);
    return trainer?.type === "trainer" ? trainer : null;
  }

  _getActiveManagedMarkerEffects(actor = this, effectTypes = [], options = {}) {
    const targetActor = actor ?? this;
    const requestedTypes = new Set(
      (Array.isArray(effectTypes) ? effectTypes : [effectTypes])
        .map((value) => `${value ?? ""}`.trim().toLowerCase())
        .filter(Boolean)
    );
    const currentCombatId = `${options?.combatId ?? game.combat?.id ?? ""}`.trim();
    const currentSceneId = `${options?.sceneId ?? canvas?.scene?.id ?? ""}`.trim();
    return this._getManagedAutomationEffects(targetActor).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      const effectType = `${automationFlags?.effectType ?? ""}`.trim().toLowerCase();
      if (requestedTypes.size > 0 && !requestedTypes.has(effectType)) return false;
      if (automationFlags?.sceneScoped) {
        const effectSceneId = `${automationFlags?.sceneId ?? ""}`.trim();
        if (effectSceneId && currentSceneId && effectSceneId !== currentSceneId) return false;
      }
      if (automationFlags?.expiresWithCombat) {
        const effectCombatId = `${automationFlags?.combatId ?? ""}`.trim();
        if (effectCombatId && currentCombatId && effectCombatId !== currentCombatId) return false;
      }
      return true;
    });
  }

  _getActiveSwitchLockEffects(actor = this, options = {}) {
    const combat = options?.combat ?? game.combat ?? null;
    const actorToCheck = actor ?? this;
    return this._getActiveManagedMarkerEffects(actorToCheck, "switch-lock", options).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      const sourceActorId = `${automationFlags?.anchorActorId ?? automationFlags?.sourceActorId ?? ""}`.trim();
      if (sourceActorId) {
        const sourceActor = game.actors?.get?.(sourceActorId) ?? null;
        if (
          !sourceActor ||
          sourceActor._isConditionActive?.("dead") ||
          sourceActor._isConditionActive?.("fainted") ||
          Math.max(toNumber(sourceActor.system?.resources?.hp?.value, 0), 0) <= 0
        ) {
          return false;
        }
      }
      if (automationFlags?.grappling && sourceActorId && `${actorToCheck?.id ?? ""}`.trim() === sourceActorId) {
        const linkedActorId = `${automationFlags?.linkedActorId ?? ""}`.trim();
        const linkedActor = linkedActorId ? game.actors?.get?.(linkedActorId) ?? null : null;
        if (
          !linkedActor ||
          linkedActor._isConditionActive?.("dead") ||
          linkedActor._isConditionActive?.("fainted") ||
          Math.max(toNumber(linkedActor.system?.resources?.hp?.value, 0), 0) <= 0
        ) {
          return false;
        }
      }
      if (combat && actorToCheck?.type === "pokemon") {
        const combatant = this._getCombatantForActor(actorToCheck, combat);
        const sourceCombatant = sourceActorId
          ? combat.combatants?.find?.((entry) => entry.actor?.id === sourceActorId) ?? null
          : null;
        if (automationFlags?.expiresWithCombat && sourceActorId && sourceCombatant === null) {
          return false;
        }
        if (combatant === null && automationFlags?.expiresWithCombat) {
          return false;
        }
      }
      return true;
    });
  }

  _isActorSwitchLocked(actor = this, options = {}) {
    const includeForced = options?.includeForced === true;
    const effects = this._getActiveSwitchLockEffects(actor, options);
    return effects.some((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (includeForced) return automationFlags?.blocksForcedSwitch !== false;
      return automationFlags?.blocksSwitch !== false;
    });
  }

  async _releaseGrappleState(actor = this) {
    const grapplingEffects = this._getActiveSwitchLockEffects(actor, { combat: game.combat }).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      return automationFlags?.grappling === true && `${automationFlags?.anchorActorId ?? ""}`.trim() === `${actor?.id ?? ""}`.trim();
    });
    if (grapplingEffects.length <= 0) return 0;
    const linkedActorIds = new Set();
    for (const effectDocument of grapplingEffects) {
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      const linkedActorId = `${automationFlags?.linkedActorId ?? ""}`.trim();
      if (linkedActorId) linkedActorIds.add(linkedActorId);
    }
    const ownEffectIds = grapplingEffects.map((effectDocument) => effectDocument.id).filter(Boolean);
    if (ownEffectIds.length > 0) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", ownEffectIds);
    }
    let removed = ownEffectIds.length;
    for (const linkedActorId of linkedActorIds) {
      const linkedActor = game.actors?.get?.(linkedActorId) ?? null;
      if (!(linkedActor instanceof PokRoleActor)) continue;
      removed += await this._removeManagedEffectsByType(linkedActor, "switch-lock", (effectDocument) => {
        const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
        return `${automationFlags?.anchorActorId ?? ""}`.trim() === `${actor?.id ?? ""}`.trim() || `${automationFlags?.linkedActorId ?? ""}`.trim() === `${actor?.id ?? ""}`.trim();
      });
    }
    return removed;
  }

  _isMoveImprisoned(move, actor = this, combat = game.combat) {
    if (!move || move.type !== "move" || !combat) return false;
    const moveSeedId = this._getMoveSeedId(move);
    const actorSide = this._getActorCombatSideDisposition(actor, combat);
    return (combat.combatants ?? []).some((combatant) => {
      const combatantActor = combatant?.actor ?? null;
      if (!combatantActor || combatantActor.id === actor?.id) return false;
      if (this._getActorCombatSideDisposition(combatantActor, combat) === actorSide) return false;
      if (combatantActor._isConditionActive?.("dead") || combatantActor._isConditionActive?.("fainted")) return false;
      const imprisonEffects = combatantActor._getActiveManagedMarkerEffects?.(combatantActor, "imprison", { combat }) ?? [];
      if (imprisonEffects.length <= 0) return false;
      return (combatantActor.items?.contents ?? []).some((item) =>
        item?.type === "move" && this._getMoveSeedId(item) === moveSeedId
      );
    });
  }

  _isUproarActive(combat = game.combat) {
    if (!combat) return false;
    return (combat.combatants ?? []).some((combatant) => {
      const actor = combatant?.actor ?? null;
      if (!actor || actor._isConditionActive?.("dead") || actor._isConditionActive?.("fainted")) return false;
      const effects = actor._getActiveManagedMarkerEffects?.(actor, "uproar", { combat }) ?? [];
      return effects.length > 0;
    });
  }

  _hasLuckyChantProtection(actor = this, options = {}) {
    const effects = this._getActiveManagedMarkerEffects(actor, "lucky-chant", options);
    return effects.length > 0;
  }

  _isSwitchCandidateValid(actor, combat = game.combat) {
    if (!actor || actor.type !== "pokemon") return false;
    if (actor._isConditionActive?.("dead") || actor._isConditionActive?.("fainted")) return false;
    const hpValue = Math.max(toNumber(actor.system?.resources?.hp?.value, 0), 0);
    if (hpValue <= 0) return false;
    const existingCombatant = this._getCombatantForActor(actor, combat);
    return !existingCombatant;
  }

  _getReserveSwitchCandidates(actor = this, combat = game.combat) {
    const trainer = actor?.type === "trainer" ? actor : this._getTrainerActorForPokemon(actor);
    if (!trainer) return [];
    const partyIds = Array.isArray(trainer.system?.party) ? trainer.system.party : [];
    return partyIds
      .map((actorId) => game.actors.get(actorId))
      .filter((candidate) => this._isSwitchCandidateValid(candidate, combat));
  }

  async _promptActorChoice(title, actors = [], options = {}) {
    const candidates = Array.isArray(actors) ? actors.filter(Boolean) : [];
    if (!candidates.length) return null;
    const optionMarkup = candidates.map((actor) =>
      `<option value="${actor.id}">${actor.name}${actor.system?.species ? ` (${actor.system.species})` : ""}</option>`
    ).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>${options.label ?? game.i18n.localize("POKROLE.Trainer.PartySelect")}</label>
          <select name="actorId">${optionMarkup}</select>
        </div>
      </form>
    `;
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title },
      content,
      buttons: [
        {
          action: "select",
          label: options.confirmLabel ?? game.i18n.localize("POKROLE.Common.Submit"),
          callback: (event, button) => button.form?.elements?.actorId?.value ?? null
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel")
        }
      ]
    });
    return result ? game.actors.get(result) ?? null : null;
  }

  async _promptMoveChoice(title, choices = [], options = {}) {
    const candidates = Array.isArray(choices) ? choices.filter(Boolean) : [];
    if (!candidates.length) return null;
    const optionMarkup = candidates.map((choice, index) => {
      const label = `${choice?.label ?? choice?.move?.name ?? choice?.name ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim();
      return `<option value="${index}">${Handlebars.escapeExpression(label)}</option>`;
    }).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>${options.label ?? game.i18n.localize("POKROLE.Common.Select")}</label>
          <select name="choiceIndex">${optionMarkup}</select>
        </div>
      </form>
    `;
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title },
      content,
      buttons: [
        {
          action: "select",
          label: options.confirmLabel ?? game.i18n.localize("POKROLE.Common.Submit"),
          callback: (event, button) => button.form?.elements?.choiceIndex?.value ?? null
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel")
        }
      ]
    });
    const selectedIndex = Number.parseInt(`${result ?? ""}`.trim(), 10);
    if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= candidates.length) {
      return null;
    }
    return candidates[selectedIndex] ?? null;
  }

  _buildCombatantCreateData(actor, slotId = "", initiative = 0, options = {}) {
    const tokenDoc = actor?.getActiveTokens?.(true)?.[0]?.document ?? actor?.getActiveTokens?.()?.[0]?.document ?? null;
    const data = tokenDoc
      ? { tokenId: tokenDoc.id, sceneId: tokenDoc.parent?.id, actorId: actor.id }
      : { actorId: actor.id };
    data.initiative = Math.max(toNumber(initiative, 0), 0);
    const forcedDisposition = clamp(
      Math.sign(Math.trunc(toNumber(options?.forcedDisposition, 0))),
      -1,
      1
    );
    data.flags = {
      [POKROLE.ID]: {
        [BATTLE_SLOT_FLAG_KEY]: `${slotId ?? ""}`.trim() || foundry.utils.randomID(),
        ...(forcedDisposition !== 0 ? { forcedDisposition } : {})
      }
    };
    return data;
  }

  async _requestCombatMutation(operation, payload = {}) {
    const requestMutation = game.pokrole?.requestCombatMutation;
    if (typeof requestMutation !== "function") {
      throw new Error(`${POKROLE.ID} | Combat mutation relay is not available.`);
    }
    return requestMutation(operation, {
      ...payload,
      requesterActorId: this.id ?? null,
      requesterUserId: game.user?.id ?? null
    });
  }

  async _switchCombatantToActor(combat, outgoingCombatant, incomingActor, options = {}) {
    if (!combat || !outgoingCombatant || !incomingActor) return null;
    if (!game.user?.isGM) {
      const response = await this._requestCombatMutation("switchCombatantToActor", {
        combatId: combat.id ?? null,
        outgoingCombatantId: outgoingCombatant.id ?? null,
        incomingActorId: incomingActor.id ?? null,
        options
      });
      const createdCombatantId = `${response?.combatantId ?? ""}`.trim();
      return createdCombatantId ? combat.combatants.get(createdCombatantId) ?? null : null;
    }
    return this._switchCombatantToActorLocal(combat, outgoingCombatant, incomingActor, options);
  }

  async _switchCombatantToActorLocal(combat, outgoingCombatant, incomingActor, options = {}) {
    if (!combat || !outgoingCombatant || !incomingActor) return null;
    const outgoingActor = outgoingCombatant.actor ?? null;
    const slotId = await this._ensureCombatantBattleSlotId(outgoingCombatant);
    const outgoingCombatantId = `${outgoingCombatant?.id ?? ""}`.trim();
    const outgoingSideDisposition = this._getActorCombatSideDisposition(outgoingActor ?? this, combat);
    const currentTurnIndex = Number.isInteger(combat.turn) ? combat.turn : null;
    const outgoingIsCurrent = currentTurnIndex !== null && combat.turns?.[currentTurnIndex]?.id === outgoingCombatant.id;

    // 1. Clear volatile conditions on outgoing Pokémon
    if (outgoingActor && options.skipVolatileClear !== true) {
      await this._clearVolatileConditions(outgoingActor);
    }

    // 2. Token replacement on the map
    const tokenResult = await this._performTokenSwitch(outgoingActor, incomingActor);

    // 3. Combat tracker: create new combatant, delete old
    const initiative = Math.max(toNumber(options.initiative ?? outgoingCombatant.initiative, 0), 0);
    await combat.createEmbeddedDocuments("Combatant", [
      this._buildCombatantCreateData(incomingActor, slotId, initiative, {
        forcedDisposition: outgoingSideDisposition
      })
    ]);
    const createdCombatant = combat.combatants.find((entry) =>
      entry.actor?.id === incomingActor.id &&
      this._getCombatantBattleSlotId(entry) === slotId
    ) ?? null;
    const existingOutgoingCombatant =
      outgoingCombatantId
        ? combat.combatants.get(outgoingCombatantId) ??
          combat.combatants.find((entry) => `${entry?.id ?? ""}`.trim() === outgoingCombatantId) ??
          null
        : null;
    if (existingOutgoingCombatant) {
      await combat.deleteEmbeddedDocuments("Combatant", [outgoingCombatantId]);
    }
    if (typeof combat.setupTurns === "function") {
      await combat.setupTurns();
    }
    if (outgoingIsCurrent && createdCombatant) {
      const nextTurnIndex = combat.turns?.findIndex?.((entry) => entry?.id === createdCombatant.id) ?? -1;
      if (nextTurnIndex >= 0 && combat.turn !== nextTurnIndex) {
        await combat.update({ turn: nextTurnIndex });
      }
    }

    // 4. Roll initiative for incoming Pokémon
    if (typeof incomingActor.rollInitiative === "function") {
      try {
        await incomingActor.rollInitiative({ silent: true, skipActionCheck: true });
      } catch (err) {
        console.warn(`${POKROLE.ID} | Failed to roll initiative for ${incomingActor.name}:`, err);
      }
    }

    // 5. Reset action counter for incoming Pokémon
    if (typeof incomingActor.resetActionCounter === "function") {
      await incomingActor.resetActionCounter({ resetInitiative: false });
    }

    await this._applyEntryHazardsForActor(incomingActor, { combat });

    // 6. Chat notification
    const trainerActor = this._getPokemonTrainerActor(incomingActor) ?? this._getPokemonTrainerActor(outgoingActor) ?? null;
    const trainerName = trainerActor?.name ?? game.i18n.localize("POKROLE.Common.Unknown");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: trainerActor ?? incomingActor }),
      content: `<strong>${trainerName}</strong> ${game.i18n.format("POKROLE.Chat.SwitchedTo", { name: incomingActor.name })}`
    });

    return createdCombatant;
  }

  async _clearVolatileConditions(actor) {
    if (!actor) return;
    const volatileConditions = ["confused", "flinch", "infatuated", "disabled"];
    for (const condition of volatileConditions) {
      if (typeof actor._isConditionActive === "function" && actor._isConditionActive(condition)) {
        try {
          await actor.toggleQuickCondition(condition, { active: false });
        } catch (err) {
          console.warn(`${POKROLE.ID} | Failed to clear ${condition} on ${actor.name}:`, err);
        }
      }
    }
    // Remove non-persistent temporary Active Effects
    const persistentConditions = new Set([
      "sleep", "burn", "burn2", "burn3", "frozen", "paralyzed",
      "poisoned", "badly-poisoned", "fainted", "dead"
    ]);
    const effectsToRemove = (actor.effects?.contents ?? []).filter((effect) => {
      if (!effect || effect.disabled) return false;
      const automationFlags = effect.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (!automationFlags?.managed) return false;
      const conditionKey = `${automationFlags?.conditionKey ?? ""}`.trim().toLowerCase();
      if (persistentConditions.has(conditionKey)) return false;
      const effectType = `${automationFlags?.effectType ?? ""}`.trim().toLowerCase();
      return effectType === "modifier" || effectType === "condition" || effectType === "move-disabled";
    });
    if (effectsToRemove.length > 0) {
      const ids = effectsToRemove.map((e) => e.id).filter(Boolean);
      if (ids.length > 0) {
        try {
          await actor.deleteEmbeddedDocuments("ActiveEffect", ids);
        } catch (err) {
          console.warn(`${POKROLE.ID} | Failed to remove volatile effects from ${actor.name}:`, err);
        }
      }
    }
  }

  async _performTokenSwitch(outgoingActor, incomingActor) {
    if (!outgoingActor || !incomingActor) return { success: false };
    const scene = canvas?.scene ?? null;
    if (!scene) return { success: false };
    const outgoingToken = outgoingActor.getActiveTokens?.(true)?.[0] ?? null;
    if (!outgoingToken) return { success: false };
    const outgoingTokenDoc = outgoingToken.document ?? outgoingToken;
    const position = { x: outgoingTokenDoc.x, y: outgoingTokenDoc.y };

    // Check if incoming actor already has a token on the scene
    const existingIncomingToken = incomingActor.getActiveTokens?.(true)?.[0] ?? null;

    if (existingIncomingToken) {
      // Swap positions between existing tokens
      const existingDoc = existingIncomingToken.document ?? existingIncomingToken;
      const incomingPos = { x: existingDoc.x, y: existingDoc.y };
      try {
        await outgoingTokenDoc.update({ x: incomingPos.x, y: incomingPos.y });
        await existingDoc.update({ x: position.x, y: position.y });
        return { success: true, tokenDoc: existingDoc };
      } catch (err) {
        console.warn(`${POKROLE.ID} | Failed to swap tokens:`, err);
        return { success: false };
      }
    }

    // Delete outgoing token and create new one at same position
    try {
      await outgoingTokenDoc.delete();
      const newTokenData = await incomingActor.getTokenDocument?.({
        x: position.x,
        y: position.y,
        actorLink: true
      }) ?? { actorId: incomingActor.id, x: position.x, y: position.y, actorLink: true };
      const tokenObj = newTokenData instanceof foundry.abstract.Document
        ? newTokenData.toObject()
        : newTokenData;
      tokenObj.x = position.x;
      tokenObj.y = position.y;
      const created = await scene.createEmbeddedDocuments("Token", [tokenObj]);
      return { success: true, tokenDoc: created?.[0] ?? null };
    } catch (err) {
      console.warn(`${POKROLE.ID} | Failed to perform token switch:`, err);
      return { success: false };
    }
  }

  async _refundActionCounter(actionNumber = 1) {
    const normalizedAction = clamp(toNumber(actionNumber, 1), 1, 5);
    const currentActionNumber = clamp(toNumber(this.system?.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== normalizedAction) {
      await this.update({ "system.combat.actionNumber": normalizedAction });
    }
  }

  async _grantEntryReactionBonus(actor, roundKey = null) {
    const targetActor = actor ?? null;
    if (!targetActor || !roundKey) return false;
    await targetActor.setFlag(POKROLE.ID, ENTRY_REACTION_BONUS_FLAG_KEY, roundKey);
    return true;
  }

  _getSubstituteDecoyState(actor = this) {
    const rawState = actor?.getFlag?.(POKROLE.ID, SUBSTITUTE_DECOY_FLAG_KEY) ?? null;
    if (!rawState || typeof rawState !== "object") return null;
    const hp = Math.max(Math.floor(toNumber(rawState.hp, 0)), 0);
    if (hp <= 0) return null;
    return {
      id: `${rawState.id ?? ""}`.trim() || foundry.utils.randomID(),
      hp,
      defense: Math.max(Math.floor(toNumber(rawState.defense, 0)), 0),
      specialDefense: Math.max(Math.floor(toNumber(rawState.specialDefense, 0)), 0),
      createdRound: Math.max(Math.floor(toNumber(rawState.createdRound, 0)), 0),
      sourceMoveId: `${rawState.sourceMoveId ?? ""}`.trim() || null,
      sourceMoveName: `${rawState.sourceMoveName ?? ""}`.trim()
    };
  }

  async _clearSubstituteDecoy(actor = this) {
    if (!actor) return false;
    await actor.unsetFlag(POKROLE.ID, SUBSTITUTE_DECOY_FLAG_KEY);
    return true;
  }

  async _createSubstituteDecoy(actor = this, sourceMove = null) {
    if (!actor) return null;
    const payload = {
      id: foundry.utils.randomID(),
      hp: 2,
      defense: actor._getTargetDefense?.(actor, "physical") ?? Math.max(toNumber(actor.system?.attributes?.vitality, 0), 0),
      specialDefense: actor._getTargetDefense?.(actor, "special") ?? Math.max(toNumber(actor.system?.attributes?.insight, 0), 0),
      createdRound: Math.max(Math.floor(toNumber(game.combat?.round, 0)), 0),
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? ""
    };
    await actor.setFlag(POKROLE.ID, SUBSTITUTE_DECOY_FLAG_KEY, payload);
    return payload;
  }

  async _applyDamageToSubstituteDecoy(actor = this, damage = 0) {
    const targetActor = actor ?? null;
    const normalizedDamage = Math.max(Math.floor(toNumber(damage, 0)), 0);
    if (!targetActor || normalizedDamage <= 0) {
      return { intercepted: false, destroyed: false, hpBefore: 0, hpAfter: 0 };
    }
    const state = this._getSubstituteDecoyState(targetActor);
    if (!state) {
      return { intercepted: false, destroyed: false, hpBefore: 0, hpAfter: 0 };
    }
    const hpBefore = state.hp;
    const hpAfter = Math.max(hpBefore - normalizedDamage, 0);
    if (hpAfter <= 0) {
      await this._clearSubstituteDecoy(targetActor);
    } else {
      await targetActor.setFlag(POKROLE.ID, SUBSTITUTE_DECOY_FLAG_KEY, {
        ...state,
        hp: hpAfter
      });
    }
    return {
      intercepted: true,
      destroyed: hpAfter <= 0,
      hpBefore,
      hpAfter
    };
  }

  _getBatonPassLock(actor = this) {
    const rawLock = actor?.getFlag?.(POKROLE.ID, BATON_PASS_LOCK_FLAG_KEY) ?? null;
    if (!rawLock || typeof rawLock !== "object") return null;
    return {
      recipientActorId: `${rawLock.recipientActorId ?? ""}`.trim() || null,
      roundKey: `${rawLock.roundKey ?? ""}`.trim(),
      sceneScoped: rawLock.sceneScoped !== false
    };
  }

  async _clearExpiredBatonPassLock(actor = this) {
    const lock = this._getBatonPassLock(actor);
    if (!lock?.recipientActorId) return null;
    const recipient = game.actors.get(lock.recipientActorId);
    const recipientInvalid =
      !recipient ||
      recipient.type !== "pokemon" ||
      recipient._isConditionActive?.("dead") ||
      recipient._isConditionActive?.("fainted") ||
      Math.max(toNumber(recipient.system?.resources?.hp?.value, 0), 0) <= 0;
    if (recipientInvalid) {
      await actor.unsetFlag(POKROLE.ID, BATON_PASS_LOCK_FLAG_KEY);
      return null;
    }
    return lock;
  }

  _normalizeSideFieldKind(value = "hazard") {
    const normalized = `${value ?? "hazard"}`.trim().toLowerCase();
    return ["force-field", "hazard"].includes(normalized) ? normalized : "hazard";
  }

  _normalizeForceFieldProtection(value = "physical") {
    const normalized = `${value ?? "physical"}`.trim().toLowerCase();
    if (["physical", "special", "physical-special"].includes(normalized)) return normalized;
    return "physical";
  }

  _normalizeSideFieldEntry(entry = {}) {
    const kind = this._normalizeSideFieldKind(entry?.kind);
    const sideDisposition = this._normalizeTerrainSideDisposition(entry?.sideDisposition, 0);
    const sideKey = this._normalizeCombatSideKey(entry?.sideKey);
    if (sideDisposition === 0 && !sideKey) return null;
    return {
      id: `${entry?.id ?? foundry.utils.randomID()}`.trim() || foundry.utils.randomID(),
      kind,
      sideKey,
      sideDisposition,
      protection: kind === "force-field" ? this._normalizeForceFieldProtection(entry?.protection) : "physical",
      hazard: kind === "hazard" ? `${entry?.hazard ?? "generic"}`.trim().toLowerCase() || "generic" : "",
      durationRounds: Math.max(Math.floor(toNumber(entry?.durationRounds, 0)), 0),
      roundSet: Math.max(Math.floor(toNumber(entry?.roundSet, 0)), 0),
      sourceActorId: `${entry?.sourceActorId ?? ""}`.trim() || null,
      sourceActorName: `${entry?.sourceActorName ?? ""}`.trim(),
      sourceMoveId: `${entry?.sourceMoveId ?? ""}`.trim() || null,
      sourceMoveName: `${entry?.sourceMoveName ?? ""}`.trim()
    };
  }

  _getCombatSideFieldEntries(combat = game.combat) {
    if (!combat) return [];
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    const rawEntries = combat.getFlag(POKROLE.ID, SIDE_FIELD_ENTRIES_FLAG_KEY);
    return (Array.isArray(rawEntries) ? rawEntries : [])
      .map((entry) => this._normalizeSideFieldEntry(entry))
      .filter((entry) => {
        if (!entry) return false;
        if (entry.durationRounds <= 0) return true;
        return entry.roundSet + entry.durationRounds - 1 >= currentRound;
      });
  }

  async _setCombatSideFieldEntries(combat = game.combat, entries = []) {
    if (!combat) return [];
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
      .map((entry) => this._normalizeSideFieldEntry(entry))
      .filter(Boolean);
    if (!game.user?.isGM) {
      await this._requestCombatMutation("setCombatSideFieldEntries", {
        combatId: combat.id ?? null,
        entries: normalizedEntries
      });
      return normalizedEntries;
    }
    await combat.setFlag(POKROLE.ID, SIDE_FIELD_ENTRIES_FLAG_KEY, normalizedEntries);
    return normalizedEntries;
  }

  getActiveSideFieldEntries(actor = this, options = {}) {
    const combat = options.combat ?? game.combat;
    if (!combat) return [];
    const sideReference =
      options.all === true
        ? null
        : {
            sideKey: this._normalizeCombatSideKey(
              options.sideKey ?? this._getActorCombatSideKey(actor, combat)
            ),
            sideDisposition: this._normalizeTerrainSideDisposition(
              options.sideDisposition,
              this._getActorCombatSideDisposition(actor, combat)
            )
          };
    const kindFilter = `${options.kind ?? ""}`.trim().toLowerCase();
    return this._getCombatSideFieldEntries(combat).filter((entry) => {
      if (sideReference !== null && !this._doesCombatSideEntryMatchReference(entry, sideReference)) return false;
      if (kindFilter && entry.kind !== kindFilter) return false;
      return true;
    });
  }

  async registerSideFieldEntry(entry = {}, combat = game.combat) {
    if (!combat) return null;
    const normalizedEntry = this._normalizeSideFieldEntry({
      ...entry,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: entry?.sourceActorId ?? this.id ?? null,
      sourceActorName: entry?.sourceActorName ?? this.name ?? ""
    });
    if (!normalizedEntry) return null;
    const currentEntries = this._getCombatSideFieldEntries(combat).filter((candidate) => {
      if (candidate.kind !== normalizedEntry.kind) return true;
      if (!this._doesCombatSideEntryMatchReference(candidate, normalizedEntry)) return true;
      if (normalizedEntry.kind === "force-field") {
        return candidate.protection !== normalizedEntry.protection;
      }
      return candidate.hazard !== normalizedEntry.hazard;
    });
    currentEntries.push(normalizedEntry);
    await this._setCombatSideFieldEntries(combat, currentEntries);
    return normalizedEntry;
  }

  async clearSideFieldEntries(options = {}, combat = game.combat) {
    if (!combat) return 0;
    const clearAll = options.all === true;
    const sideReference =
      clearAll
        ? null
        : {
            sideKey: this._normalizeCombatSideKey(
              options.sideKey ?? this._getActorCombatSideKey(this, combat)
            ),
            sideDisposition: this._normalizeTerrainSideDisposition(
              options.sideDisposition,
              this._getActorCombatSideDisposition(this, combat)
            )
          };
    const clearKind = `${options.kind ?? ""}`.trim().toLowerCase();
    const hazardKey = `${options.hazard ?? ""}`.trim().toLowerCase();
    const protection = this._normalizeForceFieldProtection(options.protection ?? "");
    const currentEntries = this._getCombatSideFieldEntries(combat);
    const nextEntries = currentEntries.filter((entry) => {
      if (sideReference !== null && !this._doesCombatSideEntryMatchReference(entry, sideReference)) return true;
      if (clearKind && entry.kind !== clearKind) return true;
      if (entry.kind === "hazard" && hazardKey && entry.hazard !== hazardKey) return true;
      if (entry.kind === "force-field" && options.protection && entry.protection !== protection) return true;
      return false;
    });
    const clearedCount = currentEntries.length - nextEntries.length;
    if (clearedCount > 0) {
      await this._setCombatSideFieldEntries(combat, nextEntries);
    }
    return clearedCount;
  }

  async clearSideFieldsForActorSide(actor = this, options = {}) {
    const combat = game.combat;
    if (!combat) return 0;
    const sideReference = this._getActorCombatSideReference(actor, combat);
    return this.clearSideFieldEntries({
      sideKey: sideReference.sideKey,
      sideDisposition: sideReference.sideDisposition,
      kind: options.kind ?? "",
      all: false
    }, combat);
  }

  async swapSideFieldEntries(actor = this, combat = game.combat) {
    if (!combat) return false;
    const sourceSide = this._getActorCombatSideReference(actor, combat);
    const foeSide = this._getOpposingCombatSideReference(actor, combat);
    if (!sourceSide.sideKey && sourceSide.sideDisposition === 0) return false;
    if (!foeSide.sideKey && foeSide.sideDisposition === 0) return false;
    let changed = false;
    const nextEntries = this._getCombatSideFieldEntries(combat).map((entry) => {
      if (this._doesCombatSideEntryMatchReference(entry, sourceSide)) {
        changed = true;
        return { ...entry, sideKey: foeSide.sideKey, sideDisposition: foeSide.sideDisposition };
      }
      if (this._doesCombatSideEntryMatchReference(entry, foeSide)) {
        changed = true;
        return { ...entry, sideKey: sourceSide.sideKey, sideDisposition: sourceSide.sideDisposition };
      }
      return entry;
    });
    if (!changed) return false;
    await this._setCombatSideFieldEntries(combat, nextEntries);
    return true;
  }

  _isGroundHazardImmune(actor = this) {
    if (!actor || actor.type !== "pokemon") return false;
    return Boolean(this._evaluateTypeInteraction("ground", actor)?.immune);
  }

  async _createEntryHazardChatMessage(actor, hazardResults = []) {
    const results = Array.isArray(hazardResults) ? hazardResults.filter(Boolean) : [];
    if (!actor || results.length <= 0) return;
    const content = [
      `<strong>${actor.name}</strong> triggered entry hazards:`,
      "<ul>",
      ...results.map((result) => `<li>${result}</li>`),
      "</ul>"
    ].join("");
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor }),
      content
    });
  }

  async _applyEntryHazardsForActor(actor = this, options = {}) {
    const combat = options.combat ?? game.combat;
    if (!combat || !actor || actor.type !== "pokemon") return [];
    const sideEntries = this.getActiveSideFieldEntries(actor, {
      combat,
      kind: "hazard"
    });
    if (!sideEntries.length) return [];

    const results = [];
    const groundImmune = this._isGroundHazardImmune(actor);
    for (const entry of sideEntries) {
      const hazardKey = `${entry?.hazard ?? ""}`.trim().toLowerCase();
      if (!hazardKey) continue;

      if (hazardKey === "spikes") {
        if (groundImmune) {
          results.push(`${actor.name} ignored Spikes due to Ground immunity.`);
          continue;
        }
        const hpChange = await this._safeApplyDamage(actor, 1, {
          applyDeadOnZero: false,
          sourceActor: this,
          sourceActorId: this.id ?? "",
          sourceCategory: "hazard"
        });
        if (hpChange) {
          results.push(`Spikes dealt 1 damage (${hpChange.hpBefore} -> ${hpChange.hpAfter}).`);
        }
        continue;
      }

      if (hazardKey === "stealth-rock") {
        const damage = this._computeClashDamage("rock", actor);
        if (damage <= 0) {
          results.push(`${actor.name} ignored Stealth Rock.`);
          continue;
        }
        const hpChange = await this._safeApplyDamage(actor, damage, {
          applyDeadOnZero: false,
          sourceActor: this,
          sourceActorId: this.id ?? "",
          sourceCategory: "hazard"
        });
        if (hpChange) {
          results.push(`Stealth Rock dealt ${damage} damage (${hpChange.hpBefore} -> ${hpChange.hpAfter}).`);
        }
        continue;
      }

      if (hazardKey === "sticky-web") {
        if (groundImmune) {
          results.push(`${actor.name} ignored Sticky Web due to Ground immunity.`);
          continue;
        }
        const modifierResult = await this._applyTemporaryTrackedModifier({
          targetActor: actor,
          path: "system.attributes.dexterity",
          amount: -1,
          min: 0,
          max: 99,
          label: "Sticky Web",
          sourceMove: null,
          detailLabel: "Dexterity",
          durationMode: "combat",
          durationRounds: 1
        });
        results.push(
          modifierResult?.applied
            ? `Sticky Web lowered Dexterity by 1.`
            : `Sticky Web had no effect.`
        );
        continue;
      }

      if (hazardKey === "grass-pledge") {
        if (groundImmune) {
          results.push(`${actor.name} ignored Grass Pledge due to Ground immunity.`);
          continue;
        }
        const modifierResult = await this._applyTemporaryTrackedModifier({
          targetActor: actor,
          path: "system.attributes.dexterity",
          amount: -1,
          min: 0,
          max: 99,
          label: "Grass Pledge",
          sourceMove: null,
          detailLabel: "Dexterity",
          durationMode: "combat",
          durationRounds: 1
        });
        results.push(
          modifierResult?.applied
            ? `Grass Pledge lowered Dexterity by 1.`
            : `Grass Pledge had no effect.`
        );
        continue;
      }

      if (hazardKey === "spider-web") {
        if (groundImmune) {
          results.push(`${actor.name} ignored Spider Web due to Ground immunity.`);
          continue;
        }
        await this._removeManagedEffectsByType(actor, "switch-lock", (effectDocument) => {
          const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
          return automationFlags?.entryHazard === "spider-web";
        });
        const marker = await this._createManagedMarkerEffect({
          targetActor: actor,
          name: "Spider Web",
          img: "icons/svg/net.svg",
          sourceMove: null,
          effectType: "switch-lock",
          durationMode: "manual",
          durationRounds: 1,
          extraAutomationFlags: {
            blocksSwitch: true,
            blocksForcedSwitch: false,
            sceneScoped: true,
            sceneId: `${canvas?.scene?.id ?? ""}`.trim(),
            anchorActorId: `${entry?.sourceActorId ?? ""}`.trim() || null,
            linkedActorId: actor.id ?? null,
            entryHazard: "spider-web"
          }
        });
        results.push(
          marker
            ? `Spider Web trapped ${actor.name}.`
            : `Spider Web had no effect.`
        );
        continue;
      }

      if (hazardKey === "toxic-spikes") {
        if (groundImmune) {
          results.push(`${actor.name} ignored Toxic Spikes due to Ground immunity.`);
          continue;
        }
        const toxicRoll = await new Roll("1d6").evaluate();
        const conditionKey = Math.max(toNumber(toxicRoll.total, 0), 0) >= 6 ? "badly-poisoned" : "poisoned";
        const applyResult = await this._applyConditionEffectToActor(
          {
            condition: conditionKey,
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          actor,
          null
        );
        results.push(
          applyResult?.applied
            ? `Toxic Spikes inflicted ${conditionKey === "badly-poisoned" ? "Badly Poisoned" : "Poisoned"} (${Math.max(toNumber(toxicRoll.total, 0), 0)}).`
            : `Toxic Spikes had no effect.`
        );
      }
    }

    if (results.length > 0) {
      await this._createEntryHazardChatMessage(actor, results);
    }
    return results;
  }

  getActiveTerrainEntries(options = {}) {
    const combat = options.combat ?? game.combat;
    return this._getCombatTerrainEntries(combat);
  }

  getActiveTerrainKeysForActor(actor = this, options = {}) {
    const combat = options.combat ?? game.combat;
    const terrainEntries = this._getCombatTerrainEntries(combat);
    const sideReference = this._getActorCombatSideReference(actor, combat);
    const keys = [];
    for (const entry of terrainEntries) {
      if (entry.scope === "battlefield") {
        keys.push(entry.terrain);
        continue;
      }
      if (entry.scope === "side" && this._doesCombatSideEntryMatchReference(entry, sideReference)) {
        keys.push(entry.terrain);
      }
    }
    return [...new Set(keys.filter((key) => key && key !== "none"))];
  }

  getPreferredTerrainKeyForActor(actor = this, options = {}) {
    const combat = options.combat ?? game.combat;
    const terrainEntries = this._getCombatTerrainEntries(combat);
    const sideReference = this._getActorCombatSideReference(actor, combat);
    const preferBattlefield = options.preferBattlefield !== false;
    const battlefieldEntry =
      terrainEntries.find((entry) => entry.scope === "battlefield") ?? null;
    const sideEntry =
      terrainEntries.find(
        (entry) => entry.scope === "side" && this._doesCombatSideEntryMatchReference(entry, sideReference)
      ) ?? null;
    const preferredEntry = preferBattlefield
      ? battlefieldEntry ?? sideEntry
      : sideEntry ?? battlefieldEntry;
    return preferredEntry?.terrain ?? "none";
  }

  hasActiveTerrainForActor(actor = this, terrainKey = "none", options = {}) {
    const normalizedTerrain = this._normalizeTerrainKey(terrainKey);
    if (normalizedTerrain === "none") return false;
    return this.getActiveTerrainKeysForActor(actor, options).includes(normalizedTerrain);
  }

  _normalizeTypeKey(typeKey) {
    const normalized = `${typeKey ?? "none"}`.trim().toLowerCase();
    return TYPE_KEY_ALIASES[normalized] ?? normalized;
  }

  getActiveWeatherKey() {
    const combat = game.combat;
    if (!combat) return "none";
    const weatherData = combat.getFlag(POKROLE.ID, WEATHER_FLAG_KEY) ?? {};
    return this._normalizeWeatherKey(weatherData?.condition);
  }

  getActiveTerrainKey() {
    const combat = game.combat;
    if (!combat) return "none";
    const battlefieldEntry =
      this._getCombatTerrainEntries(combat).find((entry) => entry.scope === "battlefield") ?? null;
    return battlefieldEntry?.terrain ?? "none";
  }

  async setActiveWeather(weatherKey = "none", options = {}) {
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const normalized = this._normalizeWeatherKey(weatherKey);
    const currentWeather = this._normalizeWeatherKey(
      (combat.getFlag(POKROLE.ID, WEATHER_FLAG_KEY) ?? {})?.condition
    );
    if (
      BASIC_WEATHER_KEYS.includes(normalized) &&
      SPECIAL_WEATHER_KEYS.includes(currentWeather) &&
      normalized !== currentWeather
    ) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.WeatherBlockedByExtreme", {
          weather: this._localizeWeatherName(currentWeather)
        })
      );
      return null;
    }
    const durationRounds = Math.max(Math.floor(toNumber(options.durationRounds, 0)), 0);
    const payload = {
      condition: normalized,
      durationRounds,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    };
    await combat.setFlag(POKROLE.ID, WEATHER_FLAG_KEY, payload);
    return payload;
  }

  async clearActiveWeather() {
    const combat = game.combat;
    if (!combat) return false;
    await combat.setFlag(POKROLE.ID, WEATHER_FLAG_KEY, {
      condition: "none",
      durationRounds: 0,
      roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  async setActiveTerrain(terrainKey = "none", options = {}) {
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const normalized = this._normalizeTerrainKey(terrainKey);
    const durationRounds = Math.max(Math.floor(toNumber(options.durationRounds, 0)), 0);
    const scope = this._normalizeTerrainScope(options.scope ?? "battlefield");
    const sideReference =
      scope === "side"
        ? {
            sideKey: this._normalizeCombatSideKey(
              options.sideKey ?? this._getActorCombatSideKey(this, combat)
            ),
            sideDisposition: this._normalizeTerrainSideDisposition(
              options.sideDisposition,
              this._getActorCombatSideDisposition(this, combat)
            )
          }
        : null;
    let terrainEntries = this._getCombatTerrainEntries(combat).filter((entry) => {
      if (scope === "battlefield") return entry.scope !== "battlefield";
      if (scope === "side") {
        return !(entry.scope === "side" && this._doesCombatSideEntryMatchReference(entry, sideReference));
      }
      return true;
    });

    const payload =
      normalized === "none"
        ? null
        : this._normalizeTerrainEntry({
            id: options.id ?? foundry.utils.randomID(),
            terrain: normalized,
            scope,
            sideKey: sideReference?.sideKey ?? null,
            sideDisposition: sideReference?.sideDisposition ?? null,
            durationRounds,
            roundSet: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
            sourceActorId: this.id ?? null,
            sourceActorName: this.name ?? "",
            sourceMoveId: options.sourceMoveId ?? null,
            sourceMoveName: options.sourceMoveName ?? ""
          });
    if (payload) {
      terrainEntries.push(payload);
    }
    await this._setCombatTerrainEntries(combat, terrainEntries, {
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      sourceMoveId: options.sourceMoveId ?? null
    });
    return payload;
  }

  async clearActiveTerrain(options = {}) {
    const combat = game.combat;
    if (!combat) return false;
    const clearAll = options.all === true;
    const scope = this._normalizeTerrainScope(options.scope ?? "battlefield");
    const sideReference =
      scope === "side"
        ? {
            sideKey: this._normalizeCombatSideKey(
              options.sideKey ?? this._getActorCombatSideKey(this, combat)
            ),
            sideDisposition: this._normalizeTerrainSideDisposition(
              options.sideDisposition,
              this._getActorCombatSideDisposition(this, combat)
            )
          }
        : null;
    const terrainKey = this._normalizeTerrainKey(options.terrain);
    const currentEntries = this._getCombatTerrainEntries(combat);
    const nextEntries = clearAll
      ? []
      : currentEntries.filter((entry) => {
          if (scope === "battlefield" && entry.scope !== "battlefield") return true;
          if (scope === "side") {
            if (entry.scope !== "side") return true;
            if (!this._doesCombatSideEntryMatchReference(entry, sideReference)) return true;
          }
          if (terrainKey !== "none" && entry.terrain !== terrainKey) return true;
          return false;
        });
    if (nextEntries.length === currentEntries.length) return false;
    await this._setCombatTerrainEntries(combat, nextEntries, {
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  async clearTerrainsForActorSide(actor = this, options = {}) {
    const combat = game.combat;
    if (!combat) return false;
    const sideReference = this._getActorCombatSideReference(actor, combat);
    const includeBattlefield = options.includeBattlefield === true;
    const currentEntries = this._getCombatTerrainEntries(combat);
    const nextEntries = currentEntries.filter((entry) => {
      if (entry.scope === "side" && this._doesCombatSideEntryMatchReference(entry, sideReference)) return false;
      if (includeBattlefield && entry.scope === "battlefield") return false;
      return true;
    });
    if (nextEntries.length === currentEntries.length) return false;
    await this._setCombatTerrainEntries(combat, nextEntries, {
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  async clearAllActiveTerrains() {
    return this.clearActiveTerrain({ all: true });
  }

  async swapTerrainSides(actor = this) {
    const combat = game.combat;
    if (!combat) return false;
    const sourceSide = this._getActorCombatSideReference(actor, combat);
    const foeSide = this._getOpposingCombatSideReference(actor, combat);
    if (!sourceSide.sideKey && sourceSide.sideDisposition === 0) return false;
    if (!foeSide.sideKey && foeSide.sideDisposition === 0) return false;
    const currentEntries = this._getCombatTerrainEntries(combat);
    let changed = false;
    const nextEntries = currentEntries.map((entry) => {
      if (entry.scope !== "side") return entry;
      if (this._doesCombatSideEntryMatchReference(entry, sourceSide)) {
        changed = true;
        return { ...entry, sideKey: foeSide.sideKey, sideDisposition: foeSide.sideDisposition };
      }
      if (this._doesCombatSideEntryMatchReference(entry, foeSide)) {
        changed = true;
        return { ...entry, sideKey: sourceSide.sideKey, sideDisposition: sourceSide.sideDisposition };
      }
      return entry;
    });
    if (!changed) return false;
    await this._setCombatTerrainEntries(combat, nextEntries, {
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? ""
    });
    return true;
  }

  async synchronizeTerrainEffectsForCombat(combat = game.combat) {
    if (!combat) return 0;
    let updates = 0;

    updates += await this._syncTerrainTrackerEffectsForCombat(combat);

    for (const combatant of combat.combatants ?? []) {
      const actor = combatant.actor;
      if (!actor || actor.documentName !== "Actor") continue;

      if (
        this.hasActiveTerrainForActor(actor, "electric", { combat }) &&
        actor.type === "pokemon" &&
        actor._isConditionActive?.("sleep") &&
        actor._isActorGroundedForTerrain?.(actor)
      ) {
        await actor.toggleQuickCondition("sleep", { active: false });
        updates += 1;
      }
    }

    return updates;
  }

  _getTrainerState() {
    const rawState = this.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    return {
      inFray: Boolean(rawState?.inFray),
      cover: ["none", "quarter", "half", "full"].includes(`${rawState?.cover ?? "none"}`.trim().toLowerCase())
        ? `${rawState.cover}`.trim().toLowerCase()
        : "none"
    };
  }

  async setTrainerCover(cover = "none") {
    const normalizedCover = ["none", "quarter", "half", "full"].includes(`${cover ?? "none"}`.trim().toLowerCase())
      ? `${cover}`.trim().toLowerCase()
      : "none";
    const state = this._getTrainerState();
    state.cover = normalizedCover;
    await this.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, state);
    return normalizedCover;
  }

  async takeCover(level = "half") {
    const normalizedLevel = ["none", "quarter", "half", "full"].includes(`${level ?? "half"}`.trim().toLowerCase())
      ? `${level}`.trim().toLowerCase()
      : "half";
    const appliedLevel = await this.setTrainerCover(normalizedLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(appliedLevel)
      })
    );
    return appliedLevel;
  }

  getTrainerCover() {
    return this._getTrainerState().cover;
  }

  async _degradeCoverOnHit(targetActor) {
    if (!targetActor) return "none";
    const state = targetActor.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    const cover = `${state?.cover ?? "none"}`.trim().toLowerCase();
    let nextCover = cover;
    if (cover === "full") nextCover = "half";
    else if (cover === "half" || cover === "quarter") nextCover = "none";
    else return cover;
    const nextState = {
      inFray: Boolean(state?.inFray),
      cover: nextCover
    };
    await targetActor.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, nextState);
    return nextCover;
  }

  async setTrainerInFray(active) {
    const state = this._getTrainerState();
    state.inFray = Boolean(active);
    await this.setFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY, state);
    return state.inFray;
  }

  isTrainerInFray() {
    return this._getTrainerState().inFray;
  }

  _getCoverDefenseBonus(actor, move = null) {
    if (!actor || !move) return 0;
    if (!this._isMoveRanged(move)) return 0;

    const state = actor.getFlag(POKROLE.ID, TRAINER_STATE_FLAG_KEY) ?? {};
    const cover = `${state?.cover ?? "none"}`.trim().toLowerCase();
    if (cover === "quarter") return 1;
    if (cover === "half") return 2;
    return 0;
  }

  _getWeatherDamageBonusDice(moveType, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    if (weather === "sunny" || weather === "harsh-sunlight") {
      return normalizedMoveType === "fire" ? 1 : 0;
    }
    if (weather === "rain" || weather === "typhoon") {
      return normalizedMoveType === "water" ? 1 : 0;
    }
    if (weather === "strong-winds") {
      return normalizedMoveType === "flying" ? 1 : 0;
    }
    return 0;
  }

  /**
   * Get a stat bonus from the held battle item (e.g. Light Ball gives +1 Str/Spe to Pikachu).
   */
  _getHeldItemStatBonus(statKey) {
    if (this.type !== "pokemon") return 0;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return 0;
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return 0;
    const held = item.system.held ?? {};
    // Check compatible pokemon
    const compatiblePokemon = (held.compatiblePokemon || "").toLowerCase().trim();
    if (compatiblePokemon) {
      const species = (this.system.species || this.name || "").toLowerCase().trim();
      if (!species.includes(compatiblePokemon) && !compatiblePokemon.includes(species)) return 0;
    }
    const bonuses = held.statBonuses ?? {};
    return toNumber(bonuses[statKey], 0);
  }

  /**
   * Get held item damage bonus dice for the attacking pokemon.
   * Checks the pokemon's equipped battle item and returns bonus dice
   * if the move type/category matches the item's conditions.
   */
  _getHeldItemDamageBonus(moveType, moveCategory) {
    if (this.type !== "pokemon") return 0;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return 0;
    // Try world items first, then actor's owned items
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return 0;
    const held = item.system.held ?? {};
    const bonusDice = held.damageBonusDice ?? 0;
    if (bonusDice <= 0) return 0;
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    // Check type condition
    const requiredType = this._normalizeTypeKey(held.damageBonusType || "none");
    if (requiredType && requiredType !== "none" && requiredType !== normalizedMoveType) return 0;
    // Check category condition (if specified)
    const requiredCategory = (held.damageBonusCategory || "").toLowerCase();
    if (requiredCategory && requiredCategory !== moveCategory.toLowerCase()) return 0;
    // Check compatible pokemon (if specified)
    const compatiblePokemon = (held.compatiblePokemon || "").toLowerCase().trim();
    if (compatiblePokemon) {
      const species = (this.system.species || this.name || "").toLowerCase().trim();
      if (!species.includes(compatiblePokemon) && !compatiblePokemon.includes(species)) return 0;
    }
    return bonusDice;
  }

  /**
   * Get the held item data object for this pokemon's equipped battle item.
   * Returns null if no valid held item is equipped.
   */
  _getHeldItemData() {
    if (this.type !== "pokemon") return null;
    const battleItemId = this.system.battleItem || "";
    if (!battleItemId) return null;
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return null;
    return item.system.held ?? null;
  }

  /**
   * Check if the held item grants High Critical for the given move.
   */
  _checkHeldItemHighCritical(move) {
    const held = this._getHeldItemData();
    if (!held?.highCritical) return false;
    const category = (move.system?.category || "physical").toLowerCase();
    const requiredCategory = (held.highCriticalCategory || "").toLowerCase();
    if (requiredCategory && requiredCategory !== category) return false;
    return true;
  }

  _getWeatherFlatDamageReduction(moveType, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    if ((weather === "sunny" || weather === "harsh-sunlight") && normalizedMoveType === "water") return 1;
    if ((weather === "rain" || weather === "typhoon") && normalizedMoveType === "fire") return 1;
    return 0;
  }

  _applyWeatherDamageReduction(finalDamage, weatherFlatReduction, options = {}) {
    const normalizedDamage = Math.max(toNumber(finalDamage, 0), 0);
    const normalizedReduction = Math.max(toNumber(weatherFlatReduction, 0), 0);
    const immune = Boolean(options?.immune);
    if (immune || normalizedDamage <= 0 || normalizedReduction <= 0) {
      return normalizedDamage;
    }
    return Math.max(normalizedDamage - normalizedReduction, 1);
  }


  _getMoveSourceAttributes(move) {
    return (
      move?.getFlag?.(POKROLE.ID, "sourceAttributes") ??
      foundry.utils.getProperty(move, `flags.${POKROLE.ID}.sourceAttributes`) ??
      {}
    );
  }

  _getMoveSeedId(move) {
    return `${move?.getFlag?.(POKROLE.ID, "seedId") ?? foundry.utils.getProperty(move, `flags.${POKROLE.ID}.seedId`) ?? ""}`
      .trim()
      .toLowerCase();
  }

  _getMoveSpecialDamageRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? SPECIAL_DAMAGE_MOVE_RULES[seedId] ?? null : null;
  }

  _getSwitcherMoveRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? SWITCHER_MOVE_RULES[seedId] ?? null : null;
  }

  _resolveMoveTargetKeyForMove(move) {
    const switcherRule = this._getSwitcherMoveRule(move);
    if (switcherRule?.targetMode) {
      return this._normalizeMoveTargetKey(switcherRule.targetMode);
    }
    return this._normalizeMoveTargetKey(move?.system?.target);
  }

  _getPokemonTrainerActor(actor = this) {
    if (!actor || actor.type !== "pokemon") return null;
    const trainerId = `${actor.system?.currentTrainer ?? ""}`.trim();
    if (!trainerId) return null;
    return game.actors?.get?.(trainerId) ?? null;
  }

  _getTrainerPartyPokemon(trainerActor = null, combat = game.combat) {
    if (!trainerActor || trainerActor.type !== "trainer") return [];
    const partyIds = Array.isArray(trainerActor.system?.party) ? trainerActor.system.party : [];
    const activeCombatantActorIds = new Set(
      (combat?.combatants ?? [])
        .map((combatant) => combatant?.actor?.id ?? "")
        .filter(Boolean)
    );
    return partyIds
      .map((actorId) => game.actors?.get?.(`${actorId ?? ""}`.trim()) ?? null)
      .filter((actor) => {
        if (!actor || actor.type !== "pokemon") return false;
        if (activeCombatantActorIds.has(actor.id)) return false;
        // Exclude fainted or 0 HP Pokémon
        const hp = Math.max(toNumber(actor.system?.resources?.hp?.value, 0), 0);
        if (hp <= 0) return false;
        if (actor._isConditionActive?.("dead") || actor._isConditionActive?.("fainted")) return false;
        return true;
      });
  }

  _getCombatantForActor(actor = this, combat = game.combat) {
    if (!combat || !actor) return null;
    return (
      combat.combatants?.find?.((entry) => entry.actor?.id === actor.id) ??
      combat.combatants?.find?.((entry) => `${entry.actorId ?? ""}`.trim() === `${actor.id ?? ""}`.trim()) ??
      null
    );
  }

  _getCombatantActorsForSide(actor = this, combat = game.combat) {
    const normalizedSide = this._getActorCombatSideDisposition(actor, combat);
    if (!combat) return [];
    return (combat.combatants ?? [])
      .map((combatant) => combatant?.actor ?? null)
      .filter((combatantActor) => {
        if (!combatantActor || combatantActor.id === actor?.id) return false;
        return this._getActorCombatSideDisposition(combatantActor, combat) === normalizedSide;
      });
  }

  _moveIgnoresSubstitute(move) {
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    const specialDamageRule = this._getMoveSpecialDamageRule(move);
    return Boolean(
      moveSourceAttributes?.ignoreSubstitute ||
      specialDamageRule?.ignoresSubstitute ||
      specialDamageRule?.bypassesSubstitute
    );
  }

  _isMoveRanged(move) {
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    return Boolean(moveSourceAttributes?.physicalRanged);
  }

  _getTerrainRuntimeMoveRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? TERRAIN_RUNTIME_MOVE_RULES[seedId] ?? null : null;
  }

  _getLockingMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? LOCKING_MOVE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getSwitcherMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? SWITCHER_MOVE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getDelayedMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? DELAYED_MOVE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getCopyMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? COPY_MOVE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getDynamicTypeMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? MOVE_DYNAMIC_TYPE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getDynamicPowerMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? MOVE_DYNAMIC_POWER_RUNTIME_RULES[seedId] ?? null : null;
  }

  _getSideFieldMoveRuntimeRule(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId ? SIDE_FIELD_MOVE_RUNTIME_RULES[seedId] ?? null : null;
  }

  _isRoostGroundedThisRound(targetActor) {
    const actor = targetActor ?? null;
    if (!(actor instanceof PokRoleActor)) return false;
    const activeRoundKey = getCurrentCombatRoundKey();
    if (!activeRoundKey) return false;
    const storedRoundKey = `${actor.getFlag(POKROLE.ID, ROOST_GROUNDED_ROUND_FLAG_KEY) ?? ""}`.trim();
    return Boolean(storedRoundKey) && storedRoundKey === activeRoundKey;
  }

  _getEffectiveDefenderTypesForInteraction(targetActor, moveType = "none") {
    let defenderTypes = [
      targetActor?.system?.types?.primary,
      targetActor?.system?.types?.secondary
    ].filter((typeKey) => typeKey && typeKey !== "none");
    if (this._normalizeTypeKey(moveType) === "ground" && this._isRoostGroundedThisRound(targetActor)) {
      defenderTypes = defenderTypes.filter((typeKey) => this._normalizeTypeKey(typeKey) !== "flying");
    }
    return defenderTypes;
  }

  _getGroundImmunityInteraction(targetActor) {
    if (!targetActor) {
      return { immune: false, weaknessBonus: 0, resistancePenalty: 0, label: "POKROLE.Chat.TypeEffect.Neutral" };
    }
    return this._evaluateTypeInteractionAgainstTypes(
      "ground",
      this._getEffectiveDefenderTypesForInteraction(targetActor, "ground")
    );
  }

  _isActorGroundedForTerrain(actor = this) {
    if (!actor || actor.type !== "pokemon") return true;
    const interaction = this._getGroundImmunityInteraction(actor);
    return !interaction.immune;
  }

  _isTerrainMoveRequirementMet(move, actor = this) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    if (!runtimeRule?.requiredTerrain) return true;
    return this.hasActiveTerrainForActor(actor, runtimeRule.requiredTerrain);
  }

  _hasAnyActiveTerrainForActor(actor = this) {
    return this.getActiveTerrainKeysForActor(actor).length > 0;
  }

  _resolveEffectiveMovePriority(move, actor = this) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    if (runtimeRule?.conditionalPriority) {
      const requiredTerrain = this._normalizeTerrainKey(runtimeRule.conditionalPriority.terrain);
      const isActive = this.hasActiveTerrainForActor(actor, requiredTerrain);
      const resolvedPriority = isActive
        ? runtimeRule.conditionalPriority.active
        : runtimeRule.conditionalPriority.inactive;
      return clamp(Math.floor(toNumber(resolvedPriority, 0)), -99, 99);
    }
    return clamp(Math.floor(toNumber(move?.system?.priority, 0)), -99, 99);
  }

  _getWeatherBlockedMoveTypes(weatherKey = this.getActiveWeatherKey()) {
    const activeWeather = `${weatherKey ?? ""}`.trim().toLowerCase();
    if (activeWeather === "harsh-sunlight") return new Set(["water"]);
    if (activeWeather === "typhoon") return new Set(["fire"]);
    return new Set();
  }

  _isMoveTypeBlockedByWeather(moveType, weatherKey = this.getActiveWeatherKey()) {
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    if (!normalizedMoveType || normalizedMoveType === "none") return false;
    return this._getWeatherBlockedMoveTypes(weatherKey).has(normalizedMoveType);
  }

  _getBestOffensiveTypeAgainstTarget(targetActor, options = {}) {
    if (!(targetActor instanceof PokRoleActor)) {
      return this._normalizeTypeKey(options.fallbackType || "normal");
    }

    const blockedTypes = options.blockedTypes instanceof Set
      ? new Set([...options.blockedTypes].map((typeKey) => this._normalizeTypeKey(typeKey)))
      : new Set();
    const fallbackType = this._normalizeTypeKey(options.fallbackType || "normal");
    const candidateTypes = Object.keys(TYPE_EFFECTIVENESS).filter((typeKey) => !blockedTypes.has(typeKey));

    let bestType = "";
    let bestScore = Number.NEGATIVE_INFINITY;
    let bestWeaknessBonus = -1;
    let bestResistancePenalty = Number.POSITIVE_INFINITY;

    for (const candidateType of candidateTypes) {
      const interaction = this._evaluateTypeInteraction(candidateType, targetActor);
      if (interaction.immune) continue;
      const score = interaction.weaknessBonus - interaction.resistancePenalty;
      if (score > bestScore) {
        bestType = candidateType;
        bestScore = score;
        bestWeaknessBonus = interaction.weaknessBonus;
        bestResistancePenalty = interaction.resistancePenalty;
        continue;
      }
      if (score !== bestScore) continue;
      if (interaction.weaknessBonus > bestWeaknessBonus) {
        bestType = candidateType;
        bestWeaknessBonus = interaction.weaknessBonus;
        bestResistancePenalty = interaction.resistancePenalty;
        continue;
      }
      if (
        interaction.weaknessBonus === bestWeaknessBonus &&
        interaction.resistancePenalty < bestResistancePenalty
      ) {
        bestType = candidateType;
        bestResistancePenalty = interaction.resistancePenalty;
      }
    }

    return bestType || fallbackType || "normal";
  }

  async _promptDynamicMoveRuntimeConfiguration(move, options = {}) {
    const availableTypes = Object.keys(TYPE_EFFECTIVENESS)
      .filter((typeKey) => typeKey !== "none")
      .map((typeKey) => ({ key: typeKey, label: this.localizeTrait(typeKey) }));
    const selectedType = this._normalizeTypeKey(
      options.defaultType ||
      this._resolveEffectiveMoveType(move, this)
    );
    const selectedPower = clamp(Math.floor(toNumber(options.defaultPower, 5)), 0, 10);
    const typeOptions = availableTypes.map((entry) =>
      `<option value="${entry.key}" ${entry.key === selectedType ? "selected" : ""}>${entry.label}</option>`
    ).join("");
    const content = `
      <form>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.Move.Type")}</label>
          <select name="moveType">${typeOptions}</select>
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.Move.Power")}</label>
          <input type="number" name="movePower" min="0" max="10" step="1" value="${selectedPower}">
        </div>
      </form>
    `;
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: game.i18n.format("POKROLE.Chat.DynamicMove.ConfigureTitle", {
          move: move?.name ?? game.i18n.localize("POKROLE.Common.Unknown")
        })
      },
      content,
      buttons: [
        {
          action: "confirm",
          label: game.i18n.localize("POKROLE.Common.Submit"),
          callback: (event, button) => ({
            moveType: button.form?.elements?.moveType?.value ?? selectedType,
            power: button.form?.elements?.movePower?.value ?? selectedPower
          })
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel")
        }
      ]
    });
    if (!result) return null;
    return {
      moveType: this._normalizeTypeKey(result.moveType || selectedType || "normal"),
      power: clamp(Math.floor(toNumber(result.power, selectedPower)), 0, 10)
    };
  }

  async _prepareDynamicMoveRuntime(move, options = {}) {
    const runtime = {
      moveType: "",
      power: null,
      results: []
    };
    const targetActor = options.targetActor instanceof PokRoleActor ? options.targetActor : null;
    const activeWeather = `${options.activeWeather ?? this.getActiveWeatherKey() ?? ""}`.trim().toLowerCase();
    const dynamicTypeRule = this._getDynamicTypeMoveRuntimeRule(move);
    const dynamicPowerRule = this._getDynamicPowerMoveRuntimeRule(move);

    if (dynamicTypeRule?.mode === "best-against-target") {
      runtime.moveType = this._getBestOffensiveTypeAgainstTarget(targetActor, {
        blockedTypes: this._getWeatherBlockedMoveTypes(activeWeather),
        fallbackType: this._normalizeTypeKey(move?.system?.type || "normal")
      });
      runtime.results.push({
        label: game.i18n.localize("POKROLE.Chat.DynamicMove.Label"),
        targetName: this.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Chat.DynamicMove.TypeResolved", {
          type: this.localizeTrait(runtime.moveType)
        })
      });
    }

    if (dynamicTypeRule?.mode === "prompted" || dynamicPowerRule?.mode === "prompt") {
      const configuredRuntime = await this._promptDynamicMoveRuntimeConfiguration(move, {
        defaultType: runtime.moveType || this._normalizeTypeKey(move?.system?.type || "normal"),
        defaultPower: runtime.power ?? 5
      });
      if (!configuredRuntime) return null;
      runtime.moveType = configuredRuntime.moveType;
      runtime.power = configuredRuntime.power;
      runtime.results.push({
        label: game.i18n.localize("POKROLE.Chat.DynamicMove.Label"),
        targetName: this.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Chat.DynamicMove.TypeAndPowerResolved", {
          type: this.localizeTrait(runtime.moveType),
          power: runtime.power
        })
      });
    }

    if (dynamicPowerRule?.mode === "d6-table") {
      const powerRoll = await new Roll("1d6").evaluate();
      const rolledValue = Math.max(Math.floor(toNumber(powerRoll.total, 0)), 1);
      await powerRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: game.i18n.format("POKROLE.Chat.DynamicMove.PowerRollFlavor", {
          actor: this.name,
          move: move?.name ?? game.i18n.localize("POKROLE.Common.Unknown")
        })
      });
      runtime.power = Math.max(
        Math.floor(toNumber(dynamicPowerRule.table?.[rolledValue], move?.system?.power ?? 0)),
        0
      );
      runtime.results.push({
        label: game.i18n.localize("POKROLE.Chat.DynamicMove.Label"),
        targetName: this.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Chat.DynamicMove.PowerResolved", {
          roll: rolledValue,
          power: runtime.power
        })
      });
    }

    return runtime;
  }

  _resolveEffectiveMoveType(move, actor = this, options = {}) {
    const runtimeOverrideType = `${options?.runtimeOverride?.moveType ?? ""}`.trim();
    if (runtimeOverrideType) {
      return this._normalizeTypeKey(runtimeOverrideType);
    }
    const dynamicTypeRule = this._getDynamicTypeMoveRuntimeRule(move);
    if (dynamicTypeRule?.mode === "secondary-else-primary") {
      const secondaryType = this._normalizeTypeKey(actor?.system?.types?.secondary || "none");
      const primaryType = this._normalizeTypeKey(actor?.system?.types?.primary || "normal");
      if (secondaryType && secondaryType !== "none") {
        return secondaryType;
      }
      return primaryType;
    }
    if (dynamicTypeRule?.mode === "best-against-target") {
      const targetActor = options?.targetActor ?? null;
      const activeWeather = options?.activeWeather ?? this.getActiveWeatherKey();
      return this._getBestOffensiveTypeAgainstTarget(targetActor, {
        blockedTypes: this._getWeatherBlockedMoveTypes(activeWeather),
        fallbackType: move?.system?.type || "normal"
      });
    }
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    if (runtimeRule?.typeMatchesPreferredTerrain) {
      const preferredTerrain = this.getPreferredTerrainKeyForActor(actor, {
        preferBattlefield: true
      });
      if (preferredTerrain !== "none") {
        return preferredTerrain;
      }
    }
    return this._normalizeTypeKey(move?.system?.type || "normal");
  }

  _getTerrainDamageBonusDice(move, actor = this) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    const effectiveType = this._resolveEffectiveMoveType(move, actor);
    const moveCategory = this._normalizeMoveCombatCategory(move?.system?.category);
    let bonusDice = 0;

    if (["physical", "special"].includes(moveCategory)) {
      if (effectiveType === "electric" && this.hasActiveTerrainForActor(actor, "electric")) bonusDice += 1;
      if (effectiveType === "psychic" && this.hasActiveTerrainForActor(actor, "psychic")) bonusDice += 1;
      if (effectiveType === "grass" && this.hasActiveTerrainForActor(actor, "grassy")) bonusDice += 1;
    }

    if (runtimeRule?.requiredTerrain && this.hasActiveTerrainForActor(actor, runtimeRule.requiredTerrain)) {
      bonusDice += Math.max(Math.floor(toNumber(runtimeRule.bonusDamageDice, 0)), 0);
    }
    if (runtimeRule?.bonusDamageDiceIfAnyTerrain && this._hasAnyActiveTerrainForActor(actor)) {
      bonusDice += Math.max(Math.floor(toNumber(runtimeRule.bonusDamageDiceIfAnyTerrain, 0)), 0);
    }
    return bonusDice;
  }

  _getTerrainPowerOverride(move, actor = this, targetActor = null) {
    const effectiveType = this._resolveEffectiveMoveType(move, actor);
    if (
      effectiveType === "dragon" &&
      targetActor &&
      this.hasActiveTerrainForActor(targetActor, "misty") &&
      this._isActorGroundedForTerrain(targetActor)
    ) {
      return 0;
    }
    return null;
  }

  _getAdditionalDamageTargetsFromTerrain(move, targetActors = [], actor = this) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    const bonusTargetCount = Math.max(Math.floor(toNumber(runtimeRule?.bonusTargetCount, 0)), 0);
    if (bonusTargetCount <= 0) return [];
    if (runtimeRule?.requiredTerrain && !this.hasActiveTerrainForActor(actor, runtimeRule.requiredTerrain)) {
      return [];
    }
    return [...(Array.isArray(targetActors) ? targetActors : [])].slice(1, 1 + bonusTargetCount);
  }

  _getTerrainRuntimeFailureDetail(move) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    if (runtimeRule?.requiresAnyTerrain && !this._hasAnyActiveTerrainForActor(this)) {
      return game.i18n.localize("POKROLE.Errors.MoveRequiresActiveTerrain");
    }
    const effectivePriority = this._resolveEffectiveMovePriority(move, this);
    if (
      effectivePriority !== 0 &&
      this.hasActiveTerrainForActor(this, "psychic") &&
      this.type === "pokemon" &&
      this._isActorGroundedForTerrain(this)
    ) {
      return game.i18n.format("POKROLE.Errors.MoveBlockedByTerrain", {
        terrain: this._localizeTerrainName("psychic")
      });
    }
    return "";
  }

  _canUseMoveUnderTerrain(move) {
    return !Boolean(this._getTerrainRuntimeFailureDetail(move));
  }

  _normalizeMoveCombatCategory(value) {
    const normalized = `${value ?? ""}`.trim().toLowerCase();
    if (normalized === "physical" || normalized === "special" || normalized === "support") {
      return normalized;
    }
    return "support";
  }

  _isConditionActive(conditionKey) {
    const normalized = this._normalizeConditionKey(conditionKey);
    if (normalized === "none") return false;
    const flags = this._getConditionFlagEntries(this);
    return Boolean(flags?.[normalized]);
  }

  _getCurrentRoundKey(roundOffset = 0) {
    const combat = game.combat;
    if (!combat?.id) return null;
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    return `${combat.id}:${Math.max(currentRound + roundOffset, 0)}`;
  }

  _getCurrentTurnKey() {
    const combat = game.combat;
    if (!combat?.id || !Number.isInteger(combat.turn)) return null;
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    return `${combat.id}:${currentRound}:${combat.turn}`;
  }

  _isCurrentCombatTurn() {
    const combat = game.combat;
    if (!combat || !Number.isInteger(combat.turn)) return false;
    const currentActor = combat.turns?.[combat.turn]?.actor ?? null;
    return Boolean(currentActor && currentActor.id === this.id);
  }

  _getConditionResistFlagKey(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    return `combat.conditionResist.${normalizedCondition}`;
  }

  async _attemptConditionResistThisRound(conditionKey, threshold = 2) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none" || !game.combat) {
      return { resisted: false, rolled: false, netSuccesses: 0 };
    }

    const roundKey = this._getCurrentRoundKey(0);
    const flagKey = this._getConditionResistFlagKey(normalizedCondition);
    const currentFlag = this.getFlag(POKROLE.ID, flagKey) ?? {};
    if (`${currentFlag?.roundKey ?? ""}`.trim() === `${roundKey ?? ""}`.trim()) {
      return {
        resisted: Boolean(currentFlag?.resisted),
        rolled: false,
        netSuccesses: Math.max(Math.floor(toNumber(currentFlag?.netSuccesses, 0)), 0)
      };
    }

    const dicePool = Math.max(this.getTraitValue("insight"), 1);
    const roll = await new Roll(successPoolFormula(dicePool)).evaluate();
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const removedSuccesses = this.getPainPenalty();
    const netSuccesses = Math.max(rawSuccesses - removedSuccesses, 0);
    const resisted = netSuccesses >= Math.max(Math.floor(toNumber(threshold, 2)), 1);

    await this.setFlag(POKROLE.ID, flagKey, {
      roundKey: `${roundKey ?? ""}`.trim(),
      resisted,
      netSuccesses
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.ConditionResistRoll", {
        actor: this.name,
        condition: this._localizeConditionName(normalizedCondition),
        required: threshold
      })
    });

    return { resisted, rolled: true, netSuccesses };
  }

  _getParalysisTurnCheckState() {
    const state = this.getFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY) ?? {};
    return {
      turnKey: `${state?.turnKey ?? ""}`.trim(),
      rawSuccesses: Math.max(Math.floor(toNumber(state?.rawSuccesses, 0)), 0),
      canAct: Boolean(state?.canAct)
    };
  }

  async _clearParalysisTurnCheck() {
    await this.unsetFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY);
  }

  async _resolveParalysisTurnCheckThisTurn() {
    if (!game.combat || !this._isConditionActive("paralyzed") || !this._isCurrentCombatTurn()) {
      return { canAct: true, rolled: false, rawSuccesses: 1 };
    }

    const currentTurnKey = this._getCurrentTurnKey();
    const currentState = this._getParalysisTurnCheckState();
    if (currentTurnKey && currentState.turnKey === currentTurnKey) {
      return {
        canAct: currentState.canAct,
        rolled: false,
        rawSuccesses: currentState.rawSuccesses
      };
    }

    const roll = await new Roll(successPoolFormula(2)).evaluate();
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const canAct = rawSuccesses > 0;

    await this.setFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY, {
      turnKey: `${currentTurnKey ?? ""}`.trim(),
      rawSuccesses,
      canAct
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.ParalysisTurnRoll", {
        actor: this.name
      })
    });

    ui.notifications[canAct ? "info" : "warn"](
      game.i18n.format(
        canAct ? "POKROLE.Chat.ParalysisTurnPassed" : "POKROLE.Chat.ParalysisTurnFailed",
        { actor: this.name }
      )
    );

    return { canAct, rolled: true, rawSuccesses };
  }

  _getConfusionBypassRoundKey() {
    return `${this.getFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY) ?? ""}`.trim();
  }

  _isConfusionSuppressedThisRound() {
    const currentRoundKey = this._getCurrentRoundKey(0);
    return Boolean(currentRoundKey && this._getConfusionBypassRoundKey() === currentRoundKey);
  }

  async _clearConfusionSuppression() {
    await this.unsetFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY);
  }

  async _resolveConfusionSuppressionThisRound() {
    if (!game.combat || !this._isConditionActive("confused") || !this._isCurrentCombatTurn()) {
      return { suppressed: false, rolled: false, netSuccesses: 0 };
    }

    const currentRoundKey = this._getCurrentRoundKey(0);
    if (currentRoundKey && this._getConfusionBypassRoundKey() === currentRoundKey) {
      return { suppressed: true, rolled: false, netSuccesses: 0 };
    }

    const resistResult = await this._attemptConditionResistThisRound("confused", 2);
    if (resistResult?.resisted && currentRoundKey) {
      await this.setFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY, currentRoundKey);
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.ConfusionSuppressedRound", {
          actor: this.name
        })
      );
    }

    return {
      suppressed: Boolean(resistResult?.resisted),
      rolled: Boolean(resistResult?.rolled),
      netSuccesses: Math.max(Math.floor(toNumber(resistResult?.netSuccesses, 0)), 0)
    };
  }

  _hasConfusionPenaltyThisRound() {
    return this._isConditionActive("confused") && !this._isConfusionSuppressedThisRound();
  }

  _getInfatuationBypassRoundKey() {
    return `${this.getFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY) ?? ""}`.trim();
  }

  _isInfatuationSuppressedThisRound() {
    const currentRoundKey = this._getCurrentRoundKey(0);
    return Boolean(currentRoundKey && this._getInfatuationBypassRoundKey() === currentRoundKey);
  }

  async _clearInfatuationSuppression() {
    await this.unsetFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY);
  }

  async _resolveInfatuationSuppressionThisRound() {
    if (!game.combat || !this._isConditionActive("infatuated") || !this._isCurrentCombatTurn()) {
      return { suppressed: false, rolled: false, netSuccesses: 0 };
    }

    const currentRoundKey = this._getCurrentRoundKey(0);
    if (currentRoundKey && this._getInfatuationBypassRoundKey() === currentRoundKey) {
      return { suppressed: true, rolled: false, netSuccesses: 0 };
    }

    const resistResult = await this._attemptConditionResistThisRound("infatuated", 2);
    if (resistResult?.resisted && currentRoundKey) {
      await this.setFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY, currentRoundKey);
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.InfatuationSuppressedRound", {
          actor: this.name
        })
      );
    }

    return {
      suppressed: Boolean(resistResult?.resisted),
      rolled: Boolean(resistResult?.rolled),
      netSuccesses: Math.max(Math.floor(toNumber(resistResult?.netSuccesses, 0)), 0)
    };
  }

  _hasInfatuationPenaltyThisRound() {
    return this._isConditionActive("infatuated") && !this._isInfatuationSuppressedThisRound();
  }

  async _attemptSleepWakeResistance() {
    if (!game.combat) return { wokeUp: false, totalSuccesses: 0, gainedSuccesses: 0 };

    const currentTrack = this.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY) ?? {};
    const previousTotal = Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0);
    const currentRoundKey = this._getCurrentRoundKey(0);
    if (`${currentTrack?.roundKey ?? ""}`.trim() === `${currentRoundKey ?? ""}`.trim()) {
      return { wokeUp: previousTotal >= 5, totalSuccesses: previousTotal, gainedSuccesses: 0 };
    }
    const dicePool = Math.max(this.getTraitValue("insight"), 1);
    const roll = await new Roll(successPoolFormula(dicePool)).evaluate();
    const rawSuccesses = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
    const removedSuccesses = this.getPainPenalty();
    const gainedSuccesses = Math.max(rawSuccesses - removedSuccesses, 0);
    const totalSuccesses = previousTotal + gainedSuccesses;

    await this.setFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY, {
      totalSuccesses,
      roundKey: currentRoundKey
    });

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.SleepResistanceRoll", {
        actor: this.name,
        gained: gainedSuccesses,
        total: totalSuccesses
      })
    });

    if (totalSuccesses >= 5) {
      await this.toggleQuickCondition("sleep", { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.SleepWokeUp", { actor: this.name })
      );
      return { wokeUp: true, totalSuccesses, gainedSuccesses };
    }

    return { wokeUp: false, totalSuccesses, gainedSuccesses };
  }

  async _clearSleepResistanceTrack() {
    await this.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
  }

  async _initializeSleepResistanceTrack() {
    const currentTrack = this.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY) ?? {};
    const totalSuccesses = Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0);
    if (totalSuccesses <= 0) {
      await this.setFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY, {
        totalSuccesses: 0,
        roundKey: this._getCurrentRoundKey(0)
      });
    }
  }

  _getFrozenShellState() {
    const state = this.getFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY) ?? {};
    return {
      hp: clamp(
        Math.floor(toNumber(state?.hp, FROZEN_SHELL_DEFAULTS.hp)),
        0,
        FROZEN_SHELL_DEFAULTS.hp
      ),
      defense: FROZEN_SHELL_DEFAULTS.defense,
      specialDefense: FROZEN_SHELL_DEFAULTS.specialDefense
    };
  }

  async _setFrozenShellState(state = {}) {
    const normalizedState = {
      hp: clamp(
        Math.floor(toNumber(state?.hp, FROZEN_SHELL_DEFAULTS.hp)),
        0,
        FROZEN_SHELL_DEFAULTS.hp
      ),
      defense: FROZEN_SHELL_DEFAULTS.defense,
      specialDefense: FROZEN_SHELL_DEFAULTS.specialDefense
    };
    await this.setFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY, normalizedState);
    return normalizedState;
  }

  async _initializeFrozenShell(force = false) {
    const currentState = this._getFrozenShellState();
    if (!force && currentState.hp > 0) return currentState;
    return this._setFrozenShellState(FROZEN_SHELL_DEFAULTS);
  }

  async _clearFrozenShellState() {
    await this.unsetFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY);
  }

  _normalizeBurnStage(stage, fallback = 1) {
    const numericStage = Math.floor(toNumber(stage, fallback));
    return clamp(numericStage, 1, 3);
  }

  _getBurnRemovalThreshold(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    return {
      1: 4,
      2: 6,
      3: 8
    }[normalizedStage] ?? 4;
  }

  _getBurnRoundDamage(stage = 1) {
    return this._normalizeBurnStage(stage, 1);
  }

  _getBurnConditionVariant(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    if (normalizedStage === 3) return "burn3";
    if (normalizedStage === 2) return "burn2";
    return "burn";
  }

  _statusDamageCanKill(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "burn") {
      return this._normalizeBurnStage(this._getBurnTrack().stage, 1) >= 3;
    }
    return false;
  }

  _localizeBurnStageName(stage = 1) {
    const normalizedStage = this._normalizeBurnStage(stage, 1);
    const localizationKey = {
      1: "POKROLE.Move.Secondary.Condition.Burn1",
      2: "POKROLE.Move.Secondary.Condition.Burn2",
      3: "POKROLE.Move.Secondary.Condition.Burn3"
    }[normalizedStage] ?? "POKROLE.Conditions.Burn";
    return game.i18n.localize(localizationKey);
  }

  _normalizeBurnConditionVariant(conditionKey) {
    const normalized = `${conditionKey ?? "burn"}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (normalized === "burn3") return "burn3";
    if (normalized === "burn2") return "burn2";
    return "burn";
  }

  _resolveBurnStageFromCondition(conditionKey) {
    const variantKey = this._normalizeBurnConditionVariant(conditionKey);
    if (variantKey === "burn3") return 3;
    if (variantKey === "burn2") return 2;
    return 1;
  }

  _getCurrentCombatTurnKey() {
    const combat = game.combat;
    if (!combat) return null;
    return `${combat.id}:${combat.round ?? 0}:${combat.turn ?? 0}`;
  }

  _getBurnTrack() {
    const rawTrack = this.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY) ?? {};
    return {
      stage: this._normalizeBurnStage(rawTrack?.stage, 1),
      totalSuccesses: Math.max(Math.floor(toNumber(rawTrack?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey: `${rawTrack?.lastAttemptTurnKey ?? ""}`.trim()
    };
  }

  async _setBurnTrack(track = {}) {
    await this.setFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY, {
      stage: this._normalizeBurnStage(track?.stage, 1),
      totalSuccesses: Math.max(Math.floor(toNumber(track?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey: `${track?.lastAttemptTurnKey ?? ""}`.trim()
    });
  }

  async _clearBurnTrack() {
    await this.unsetFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY);
  }

  _extractBurnStageFromEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    if (automationFlags?.conditionKey && this._normalizeConditionKey(automationFlags.conditionKey) === "burn") {
      return this._normalizeBurnStage(automationFlags?.burnStage, 1);
    }
    const name = `${effectDocument?.name ?? ""}`.trim().toLowerCase();
    if (/\bburn\s*3\b/.test(name)) return 3;
    if (/\bburn\s*2\b/.test(name)) return 2;
    return 1;
  }

  async _applyBurnStage(stage = 1, options = {}) {
    const currentTrack = this.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY) ?? {};
    const nextStage = Math.max(
      this._normalizeBurnStage(currentTrack?.stage, 1),
      this._normalizeBurnStage(stage, 1)
    );
    await this.setFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY, {
      stage: nextStage,
      totalSuccesses: Math.max(Math.floor(toNumber(currentTrack?.totalSuccesses, 0)), 0),
      lastAttemptTurnKey:
        options.resetAttempt === true ? "" : `${currentTrack?.lastAttemptTurnKey ?? ""}`.trim()
    });
    return nextStage;
  }

  async _synchronizeManagedBurnConditionEffect(targetActor, stage = 1) {
    if (!targetActor) return false;
    const managedBurnEffect = (targetActor.effects?.contents ?? []).find(
      (effectDocument) =>
        !effectDocument?.disabled &&
        this._isManagedAutomationEffect(effectDocument) &&
        this._extractConditionKeyFromEffect(effectDocument) === "burn"
    );
    if (!managedBurnEffect) return false;

    const normalizedStage = this._normalizeBurnStage(stage, 1);
    const desiredName = this._localizeBurnStageName(normalizedStage);
    const automationFlags = foundry.utils.deepClone(
      managedBurnEffect.getFlag(POKROLE.ID, "automation") ?? {}
    );
    const needsUpdate =
      this._normalizeBurnStage(automationFlags?.burnStage, 1) !== normalizedStage ||
      this._normalizeConditionKey(automationFlags?.conditionKey) !== "burn" ||
      `${managedBurnEffect.name ?? ""}`.trim() !== desiredName;
    if (!needsUpdate) return false;

    automationFlags.conditionKey = "burn";
    automationFlags.burnStage = normalizedStage;
    await managedBurnEffect.update({
      name: desiredName,
      [`flags.${POKROLE.ID}.automation`]: automationFlags
    });
    return true;
  }

  async _promptBurnStageSelection() {
    return new Promise((resolve) => {
      new Dialog(
        {
          title: game.i18n.localize("POKROLE.Chat.BurnSelection.Title"),
          content: `
            <div class="pok-role-dialog-content">
              <p>${game.i18n.localize("POKROLE.Chat.BurnSelection.Prompt")}</p>
            </div>
          `,
          buttons: {
            burn1: {
              label: this._localizeBurnStageName(1),
              callback: () => resolve(1)
            },
            burn2: {
              label: this._localizeBurnStageName(2),
              callback: () => resolve(2)
            },
            burn3: {
              label: this._localizeBurnStageName(3),
              callback: () => resolve(3)
            },
            cancel: {
              label: game.i18n.localize("POKROLE.Common.Cancel"),
              callback: () => resolve(null)
            }
          },
          default: "burn1",
          close: () => resolve(null)
        },
        { classes: ["pok-role-dialog"] }
      ).render(true);
    });
  }

  async _attemptBurnRecovery() {
    if (!game.combat || this.type !== "pokemon" || !this._isConditionActive("burn")) {
      return { attempted: false, recovered: false, totalSuccesses: 0, stage: 1 };
    }

    const turnKey = this._getCurrentCombatTurnKey();
    const burnTrack = this._getBurnTrack();
    if (burnTrack.lastAttemptTurnKey && burnTrack.lastAttemptTurnKey === `${turnKey ?? ""}`.trim()) {
      return {
        attempted: false,
        recovered: false,
        totalSuccesses: burnTrack.totalSuccesses,
        stage: burnTrack.stage
      };
    }

    const threshold = this._getBurnRemovalThreshold(burnTrack.stage);
    const spendAction = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Chat.BurnRecovery.Title"),
        content: `
          <div class="pok-role-dialog-content">
            <p>${game.i18n.format("POKROLE.Chat.BurnRecovery.Prompt", {
              actor: this.name,
              stage: this._localizeBurnStageName(burnTrack.stage),
              current: burnTrack.totalSuccesses,
              required: threshold
            })}</p>
          </div>
        `,
        buttons: {
          yes: {
            icon: "<i class='fas fa-fire-extinguisher'></i>",
            label: game.i18n.localize("POKROLE.Chat.BurnRecovery.UseAction"),
            callback: () => resolve(true)
          },
          no: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(false)
          }
        },
        default: "yes",
        close: () => resolve(false)
      }, { classes: ["pok-role-dialog"] }).render(true);
    });

    if (!spendAction) {
      await this._setBurnTrack({
        ...burnTrack,
        lastAttemptTurnKey: `${turnKey ?? ""}`.trim()
      });
      return {
        attempted: false,
        recovered: false,
        totalSuccesses: burnTrack.totalSuccesses,
        stage: burnTrack.stage
      };
    }

    const roundKey = this._getCurrentRoundKey(0);
    const currentActionNumber = await this._resolveActionRequirement(null, roundKey);
    const rollResult = await this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("athletic"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.BurnRecovery.Flavor", {
        actor: this.name,
        stage: this._localizeBurnStageName(burnTrack.stage)
      })
    });
    await this._advanceActionCounter(currentActionNumber, roundKey);

    const gainedSuccesses = Math.max(Math.floor(toNumber(rollResult?.netSuccesses, 0)), 0);
    const totalSuccesses = burnTrack.totalSuccesses + gainedSuccesses;
    const recovered = totalSuccesses >= threshold;

    if (recovered) {
      await this.toggleQuickCondition("burn", { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.BurnRecovery.Cleared", {
          actor: this.name,
          condition: this._localizeBurnStageName(burnTrack.stage)
        })
      );
      return {
        attempted: true,
        recovered: true,
        gainedSuccesses,
        totalSuccesses,
        stage: burnTrack.stage
      };
    }

    await this._setBurnTrack({
      stage: burnTrack.stage,
      totalSuccesses,
      lastAttemptTurnKey: `${turnKey ?? ""}`.trim()
    });
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.BurnRecovery.Progress", {
        actor: this.name,
        stage: this._localizeBurnStageName(burnTrack.stage),
        gained: gainedSuccesses,
        total: totalSuccesses,
        required: threshold
      })
    );
    return {
      attempted: true,
      recovered: false,
      gainedSuccesses,
      totalSuccesses,
      stage: burnTrack.stage
    };
  }

  async processTurnStartStatusAutomation() {
    if (!game.combat) return { processed: false, results: [] };

    const results = [];
    const multiTurnResult = await this._processMultiTurnTurnStart();
    if (multiTurnResult?.processed) {
      results.push({
        condition: "multi-turn",
        resolved: true,
        moveName: multiTurnResult.moveName ?? ""
      });
    }
    let paralysisBlocksTurn = false;
    const clearConditionWithNotice = async (conditionKey) => {
      await this.toggleQuickCondition(conditionKey, { active: false });
      ui.notifications.info(
        game.i18n.format("POKROLE.Chat.ConditionCleared", {
          condition: this._localizeConditionName(conditionKey)
        })
      );
    };

    if (this._isConditionActive("sleep")) {
      const sleepResist = await this._attemptSleepWakeResistance();
      if (sleepResist?.wokeUp && this._isConditionActive("sleep")) {
        await clearConditionWithNotice("sleep");
      }
      results.push({ condition: "sleep", resolved: Boolean(sleepResist?.wokeUp) });
    }

    if (this._isConditionActive("frozen")) {
      const frozenShell = await this._initializeFrozenShell();
      results.push({
        condition: "frozen",
        resolved: false,
        shellHp: frozenShell.hp
      });
    }

    if (this._isConditionActive("paralyzed")) {
      const paralysisCheck = await this._resolveParalysisTurnCheckThisTurn();
      paralysisBlocksTurn = !Boolean(paralysisCheck?.canAct);
      results.push({
        condition: "paralyzed",
        resolved: Boolean(paralysisCheck?.canAct),
        blocked: paralysisBlocksTurn
      });
    }

    if (this._isConditionActive("infatuated")) {
      const infatuationResult = await this._resolveInfatuationSuppressionThisRound();
      results.push({
        condition: "infatuated",
        resolved: Boolean(infatuationResult?.suppressed)
      });
    }

    if (this._isConditionActive("confused")) {
      const confusionResult = await this._resolveConfusionSuppressionThisRound();
      results.push({
        condition: "confused",
        resolved: Boolean(confusionResult?.suppressed)
      });
    }

    if (
      this._isConditionActive("burn") &&
      !paralysisBlocksTurn &&
      !this._isConditionActive("dead") &&
      !this._isConditionActive("fainted") &&
      !this._isConditionActive("sleep") &&
      !this._isConditionActive("frozen")
    ) {
      const burnRecovery = await this._attemptBurnRecovery();
      results.push({
        condition: "burn",
        attempted: Boolean(burnRecovery?.attempted),
        resolved: Boolean(burnRecovery?.recovered),
        stage: burnRecovery?.stage ?? this._getBurnTrack().stage,
        totalSuccesses: burnRecovery?.totalSuccesses ?? this._getBurnTrack().totalSuccesses
      });
    }

    return { processed: true, results };
  }

  async _assertCanAct(actionType = "generic", options = {}) {
    const requestedMove =
      actionType === "move" && `${options?.moveId ?? ""}`.trim()
        ? this.items?.get?.(`${options.moveId}`.trim()) ?? null
        : null;
    const requestedMoveSeedId = requestedMove ? this._getMoveSeedId(requestedMove) : "";
    if (!game.combat) {
      if (actionType === "move") {
        const moveId = `${options?.moveId ?? ""}`.trim();
        const disabledMoveLock = this._getDisabledMoveRestriction();
        if (moveId && disabledMoveLock?.moveId === moveId) {
          return {
            allowed: false,
            reason: game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
              move:
                disabledMoveLock.moveName ||
                options?.moveName ||
                game.i18n.localize("POKROLE.Common.Unknown")
            })
          };
        }
      }
      return { allowed: true, reason: "" };
    }

    if (this._isConditionActive("dead")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorDead") };
    }

    if (this._isConditionActive("fainted")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFainted") };
    }

    if (this._isConditionActive("sleep")) {
      if (actionType === "move" && (options?.allowWhileSleeping === true || requestedMoveSeedId === "move-sleep-talk")) {
        // Sleep Talk bypasses the wake-up gate; Uproar still clears sleep elsewhere.
      } else {
      const sleepResist = await this._attemptSleepWakeResistance();
      if (sleepResist?.wokeUp) {
        if (this._isConditionActive("sleep")) {
          await this.toggleQuickCondition("sleep", { active: false });
        }
      } else {
        return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorSleeping") };
      }
      }
    }

    if (this._isConditionActive("frozen")) {
      if (actionType === "move") {
        await this._initializeFrozenShell();
      } else {
        return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFrozen") };
      }
    }

    if (this._isConditionActive("infatuated")) {
      await this._resolveInfatuationSuppressionThisRound();
    }

    if (this._isConditionActive("confused")) {
      await this._resolveConfusionSuppressionThisRound();
    }

    if (this._isConditionActive("sleep")) {
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorSleeping") };
    }

    if (this._isConditionActive("flinch")) {
      await this.toggleQuickCondition("flinch", { active: false });
      return { allowed: false, reason: game.i18n.localize("POKROLE.Errors.ActorFlinched") };
    }

    if (actionType === "move" && requestedMove && this._isMoveImprisoned(requestedMove, this, game.combat)) {
      return {
        allowed: false,
        reason: `${requestedMove.name} is sealed by Imprison.`
      };
    }

    const activeGrappleEffects = this._getActiveSwitchLockEffects(this, { combat: game.combat }).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      return automationFlags?.grappling === true && `${automationFlags?.anchorActorId ?? ""}`.trim() === `${this.id ?? ""}`.trim();
    });
    if (activeGrappleEffects.length > 0 && actionType === "move") {
      await this._releaseGrappleState(this);
    }

    const blockedRound = `${this.getFlag(POKROLE.ID, TREATMENT_BLOCK_FLAG_KEY) ?? ""}`.trim();
    const currentRoundKey = this._getCurrentRoundKey(0);
    if (blockedRound && currentRoundKey && blockedRound === currentRoundKey) {
      return {
        allowed: false,
        reason: game.i18n.localize("POKROLE.Errors.ActorBusyWithItemTreatment")
      };
    }

    const multiTurnState = this._getMultiTurnState();
    if (multiTurnState.mode === "recharge") {
      const rechargeResult = await this._consumePendingRechargeAction();
      if (rechargeResult?.processed || this._getMultiTurnState().mode === "recharge") {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorRecharging", {
            move:
              multiTurnState.moveName ||
              options?.moveName ||
              game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
    }

    if (multiTurnState.mode === "charge") {
      if (actionType !== "move") {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorChargingMoveLocked", {
            move: multiTurnState.moveName || game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
      const moveId = `${options?.moveId ?? ""}`.trim();
      if (moveId && moveId !== multiTurnState.moveId) {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorChargingMoveLocked", {
            move: multiTurnState.moveName || game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
    }

    if (multiTurnState.mode === "rampage") {
      if (actionType === "evasion" || actionType === "clash") {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorRampagingNoReaction", {
            move: multiTurnState.moveName || game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
      if (actionType !== "move") {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorRampagingMoveLocked", {
            move: multiTurnState.moveName || game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
      const moveId = `${options?.moveId ?? ""}`.trim();
      if (moveId && moveId !== multiTurnState.moveId) {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorRampagingMoveLocked", {
            move: multiTurnState.moveName || game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
    }

    const skyDropCarrierState = this._getSkyDropCarrierState();
    if (skyDropCarrierState) {
      return {
        allowed: false,
        reason: game.i18n.format("POKROLE.Errors.ActorSkyDropCarried", {
          carrier: skyDropCarrierState.carrier?.name ?? game.i18n.localize("POKROLE.Common.Unknown")
        })
      };
    }

    if (actionType !== "initiative" && this._isConditionActive("paralyzed") && this._isCurrentCombatTurn()) {
      const paralysisCheck = await this._resolveParalysisTurnCheckThisTurn();
      if (!paralysisCheck?.canAct) {
        return {
          allowed: false,
          reason: game.i18n.localize("POKROLE.Errors.ActorParalyzedTurn")
        };
      }
    }

    if (actionType === "move") {
      const moveId = `${options?.moveId ?? ""}`.trim();
      const disabledMoveLock = this._getDisabledMoveRestriction();
      if (moveId && disabledMoveLock?.moveId === moveId) {
        return {
          allowed: false,
          reason: game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
            move:
              disabledMoveLock.moveName ||
              options?.moveName ||
              game.i18n.localize("POKROLE.Common.Unknown")
          })
        };
      }
    }

    return { allowed: true, reason: "" };
  }

  _getHealingTrack() {
    const combat = game.combat;
    const currentRoundKey = this._getCurrentRoundKey(0);
    const track = this.getFlag(POKROLE.ID, HEALING_TRACK_FLAG_KEY) ?? {};
    if (!combat || !currentRoundKey) {
      return {
        roundKey: "",
        healedThisRound: 0,
        completeHealedThisRound: 0
      };
    }
    if (`${track?.roundKey ?? ""}`.trim() !== currentRoundKey) {
      return {
        roundKey: currentRoundKey,
        healedThisRound: 0,
        completeHealedThisRound: 0
      };
    }
    return {
      roundKey: currentRoundKey,
      healedThisRound: Math.max(Math.floor(toNumber(track?.healedThisRound, 0)), 0),
      completeHealedThisRound: Math.max(Math.floor(toNumber(track?.completeHealedThisRound, 0)), 0)
    };
  }

  async _setHealingTrack(track) {
    await this.setFlag(POKROLE.ID, HEALING_TRACK_FLAG_KEY, {
      roundKey: `${track?.roundKey ?? ""}`.trim(),
      healedThisRound: Math.max(Math.floor(toNumber(track?.healedThisRound, 0)), 0),
      completeHealedThisRound: Math.max(
        Math.floor(toNumber(track?.completeHealedThisRound, 0)),
        0
      )
    });
  }

  _normalizeHealingCategory(value) {
    const normalized = `${value ?? "standard"}`.trim().toLowerCase();
    return HEALING_CATEGORY_KEYS.includes(normalized) ? normalized : "standard";
  }

  _getHealingRoundLimit(healingCategory = "standard") {
    const normalizedCategory = this._normalizeHealingCategory(healingCategory);
    if (normalizedCategory === "unlimited") return Number.POSITIVE_INFINITY;
    if (normalizedCategory === "complete") return 5;
    return 3;
  }

  _resolveGearHealingCategory(gearItem) {
    const sourceValue = gearItem?._source?.system?.heal?.battleHealingCategory;
    if (`${sourceValue ?? ""}`.trim()) {
      return this._normalizeHealingCategory(sourceValue);
    }

    const itemName = `${gearItem?.name ?? ""}`.trim().toLowerCase();
    if (itemName === "max potion" || itemName === "full restore") {
      return "unlimited";
    }
    return "standard";
  }

  getPainPenalty() {
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system.resources?.hp?.max, 1), 1);

    if (hpValue <= 1) return 2;
    if (hpValue <= Math.floor(hpMax / 2)) return 1;
    return 0;
  }

  getSkillValue(skillKey) {
    if (!skillKey || skillKey === "none") return 0;
    return toNumber(this.system.skills?.[skillKey], Number.NaN);
  }

  getTraitOrSkillValue(traitKey) {
    const attributeValue = this.getTraitValue(traitKey);
    if (!Number.isNaN(attributeValue)) return attributeValue;

    const skillValue = this.getSkillValue(traitKey);
    if (!Number.isNaN(skillValue)) return skillValue;

    return Number.NaN;
  }

  async rollCombinedDialog() {
    await this.synchronizeConditionalActiveEffects();
    const attributes = Object.keys(this.system.attributes ?? {}).map((key) => ({
      key,
      label: this.localizeTrait(key),
      value: this.getTraitValue(key)
    }));
    const physicalMentalAttributes = attributes.filter(
      (trait) => !SOCIAL_ATTRIBUTE_KEYS.includes(trait.key) &&
        !(this.type === "trainer" && trait.key === "special")
    );
    const socialAttributes = attributes.filter((trait) =>
      SOCIAL_ATTRIBUTE_KEYS.includes(trait.key)
    );
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
    const skillOrder = this.type === "trainer" ? trainerSkillOrder : pokemonSkillOrder;
    const skills = skillOrder
      .filter((key) => key in (this.system.skills ?? {}))
      .map((key) => ({
        key,
        label: this.localizeTrait(key),
        value: this.getSkillValue(key)
      }));
    const renderTraitOptions = (traits) =>
      traits
        .map(
          (trait) => `
            <label class="trait-option">
              <input type="checkbox" name="trait" value="${trait.key}" />
              <span>${trait.label} (${trait.value})</span>
            </label>
          `
        )
        .join("");

    const content = `
      <form class="pok-role-combined-roll">
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.CustomLabel")}</label>
          <input type="text" name="label" value="" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RequiredSuccesses")}</label>
          <input type="number" name="requiredSuccesses" min="1" max="5" value="${clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5)}" />
        </div>
        <div class="form-group">
          <label>${game.i18n.localize("POKROLE.CombinedRoll.RemovedSuccesses")}</label>
          <input type="number" name="manualRemovedSuccesses" min="0" value="0" />
        </div>
        <label class="form-group trait-option compact">
            <input type="checkbox" name="applyPainPenalty" checked />
            <span>${game.i18n.localize("POKROLE.CombinedRoll.ApplyPainPenalty")}</span>
        </label>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.PhysicalMental")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(physicalMentalAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Attributes.Social")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(socialAttributes)}
          </div>
        </fieldset>
        <fieldset>
          <legend>${game.i18n.localize("POKROLE.Skills.Title")}</legend>
          <div class="trait-grid">
            ${renderTraitOptions(skills)}
          </div>
        </fieldset>
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.CombinedRoll.Title"),
        content,
        buttons: {
          roll: {
            icon: "<i class='fas fa-dice-d20'></i>",
            label: game.i18n.localize("POKROLE.CombinedRoll.Roll"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          cancel: {
            icon: "<i class='fas fa-times'></i>",
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "roll",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-combined-dialog"] }).render(true);
    });

    if (!html) return null;

    const form = html[0]?.querySelector("form");
    if (!form) return null;

    const selectedTraits = [...form.querySelectorAll("input[name='trait']:checked")].map(
      (checkbox) => checkbox.value
    );
    if (!selectedTraits.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.NoTraitsSelected"));
      return null;
    }

    const requiredSuccesses = clamp(
      toNumber(form.querySelector("input[name='requiredSuccesses']")?.value, 1),
      1,
      5
    );
    const manualRemovedSuccesses = Math.max(
      toNumber(form.querySelector("input[name='manualRemovedSuccesses']")?.value, 0),
      0
    );
    const applyPainPenalty =
      form.querySelector("input[name='applyPainPenalty']")?.checked ?? true;
    const removedSuccesses =
      manualRemovedSuccesses + (applyPainPenalty ? this.getPainPenalty() : 0);

    const breakdown = selectedTraits.map((traitKey) => {
      const value = this.getTraitOrSkillValue(traitKey);
      return {
        key: traitKey,
        value: Number.isNaN(value) ? 0 : value
      };
    });
    const dicePool = breakdown.reduce((total, entry) => total + entry.value, 0);
    const customLabel =
      form.querySelector("input[name='label']")?.value?.trim() ?? "";
    const breakdownLabel = breakdown
      .map((entry) => `${this.localizeTrait(entry.key)} ${entry.value}`)
      .join(" + ");

    return this._rollSuccessPool({
      dicePool,
      removedSuccesses,
      requiredSuccesses,
      flavor: game.i18n.format("POKROLE.Chat.CombinedFlavor", {
        actor: this.name,
        label: customLabel || game.i18n.localize("POKROLE.CombinedRoll.DefaultLabel"),
        breakdown: breakdownLabel
      })
    });
  }

  async rollAttribute(attributeKey) {
    await this.synchronizeConditionalActiveEffects();
    const traitValue = this.getTraitValue(attributeKey);
    if (Number.isNaN(traitValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownAttribute"));
      return null;
    }

    const painPenalty = attributeKey === "vitality" ? 0 : this.getPainPenalty();
    return this._rollSuccessPool({
      dicePool: traitValue,
      removedSuccesses: painPenalty,
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.AttributeFlavor", {
        actor: this.name,
        trait: this.localizeTrait(attributeKey)
      })
    });
  }

  async rollSkill(skillKey) {
    await this.synchronizeConditionalActiveEffects();
    const skillValue = this.getSkillValue(skillKey);
    if (Number.isNaN(skillValue)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownSkill"));
      return null;
    }

    return this._rollSuccessPool({
      dicePool: skillValue,
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.SkillFlavor", {
        actor: this.name,
        trait: this.localizeTrait(skillKey)
      })
    });
  }

  _getLastUsedMoveRecord() {
    const record = this.getFlag(POKROLE.ID, LAST_USED_MOVE_FLAG_KEY) ?? {};
    return {
      moveId: `${record?.moveId ?? ""}`.trim(),
      moveName: `${record?.moveName ?? ""}`.trim(),
      moveUuid: `${record?.moveUuid ?? ""}`.trim(),
      moveSeedId: `${record?.moveSeedId ?? ""}`.trim().toLowerCase(),
      sceneId: `${record?.sceneId ?? ""}`.trim(),
      roundKey: `${record?.roundKey ?? ""}`.trim(),
      targetActorIds: Array.isArray(record?.targetActorIds)
        ? [...new Set(record.targetActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      targetMode: this._normalizeMoveTargetKey(record?.targetMode),
      usedAt: Math.max(toNumber(record?.usedAt, 0), 0)
    };
  }

  async _recordLastUsedMove(move, context = {}) {
    if (!move?.id) return;
    await this.setFlag(POKROLE.ID, LAST_USED_MOVE_FLAG_KEY, {
      moveId: move.id,
      moveName: move.name ?? "",
      moveUuid: move.uuid ?? "",
      moveSeedId: this._getMoveSeedId(move),
      sceneId: canvas?.scene?.id ?? "",
      roundKey: this._getCurrentRoundKey(0) ?? "",
      targetActorIds: Array.isArray(context?.targetActors)
        ? context.targetActors.map((actor) => `${actor?.id ?? ""}`.trim()).filter(Boolean)
        : [],
      targetMode: this._normalizeMoveTargetKey(context?.moveTargetKey),
      usedAt: Date.now()
    });
  }

  _getLastMoveResolutionRecord() {
    const record = this.getFlag(POKROLE.ID, LAST_MOVE_RESOLUTION_FLAG_KEY) ?? {};
    return {
      combatId: `${record?.combatId ?? ""}`.trim(),
      roundKey: `${record?.roundKey ?? ""}`.trim(),
      moveId: `${record?.moveId ?? ""}`.trim(),
      moveSeedId: `${record?.moveSeedId ?? ""}`.trim().toLowerCase(),
      failedAccuracyRoll: record?.failedAccuracyRoll === true,
      resolvedAt: Math.max(toNumber(record?.resolvedAt, 0), 0)
    };
  }

  async _recordLastMoveResolution(move, context = {}) {
    if (!move?.id) return;
    await this.setFlag(POKROLE.ID, LAST_MOVE_RESOLUTION_FLAG_KEY, {
      combatId: `${game.combat?.id ?? ""}`.trim(),
      roundKey: `${context?.roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim(),
      moveId: move.id,
      moveSeedId: this._getMoveSeedId(move),
      failedAccuracyRoll: context?.failedAccuracyRoll === true,
      resolvedAt: Date.now()
    });
  }

  _didLastMoveFailAccuracyRoll() {
    const record = this._getLastMoveResolutionRecord();
    const combatId = `${game.combat?.id ?? ""}`.trim();
    if (!record?.moveId) return false;
    if (record.combatId && combatId && record.combatId !== combatId) return false;
    return record.failedAccuracyRoll === true;
  }

  _usedMoveInPreviousRound(move) {
    if (!move || !game.combat) return false;
    const lastUsedMove = this._getLastUsedMoveRecord();
    if (!lastUsedMove?.moveId) return false;
    if (lastUsedMove.moveSeedId !== this._getMoveSeedId(move)) return false;
    const previousRound = Math.max(Math.floor(toNumber(game.combat.round, 0)), 0) - 1;
    const lastRound = Number.parseInt(`${lastUsedMove.roundKey ?? ""}`.split(":").pop() ?? "0", 10);
    return Number.isInteger(lastRound) && lastRound === previousRound;
  }

  _getLastReceivedAttackRecord() {
    const record = this.getFlag(POKROLE.ID, LAST_RECEIVED_ATTACK_FLAG_KEY) ?? {};
    return {
      combatId: `${record?.combatId ?? ""}`.trim(),
      roundKey: `${record?.roundKey ?? ""}`.trim(),
      sourceActorId: `${record?.sourceActorId ?? ""}`.trim(),
      sourceActorName: `${record?.sourceActorName ?? ""}`.trim(),
      moveId: `${record?.moveId ?? ""}`.trim(),
      moveName: `${record?.moveName ?? ""}`.trim(),
      moveSeedId: `${record?.moveSeedId ?? ""}`.trim().toLowerCase(),
      category: this._normalizeMoveCombatCategory(record?.category),
      damagePool: Math.max(toNumber(record?.damagePool, 0), 0),
      recordedAt: Math.max(toNumber(record?.recordedAt, 0), 0)
    };
  }

  async _recordLastReceivedAttack({
    sourceActor = null,
    move = null,
    category = "support",
    damagePool = 0,
    roundKey = null
  } = {}) {
    if (!(this instanceof PokRoleActor)) return;
    const combatId = `${game.combat?.id ?? ""}`.trim();
    if (!combatId) return;
    await this.setFlag(POKROLE.ID, LAST_RECEIVED_ATTACK_FLAG_KEY, {
      combatId,
      roundKey: `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim(),
      sourceActorId: `${sourceActor?.id ?? ""}`.trim(),
      sourceActorName: `${sourceActor?.name ?? ""}`.trim(),
      moveId: `${move?.id ?? ""}`.trim(),
      moveName: `${move?.name ?? ""}`.trim(),
      moveSeedId: this._getMoveSeedId(move),
      category: this._normalizeMoveCombatCategory(category),
      damagePool: Math.max(toNumber(damagePool, 0), 0),
      recordedAt: Date.now()
    });
  }

  _getBideState() {
    const rawState = this.getFlag(POKROLE.ID, BIDE_STATE_FLAG_KEY) ?? {};
    const combatId = `${rawState?.combatId ?? ""}`.trim();
    const activeCombatId = `${game.combat?.id ?? ""}`.trim();
    if (!combatId || !activeCombatId || combatId !== activeCombatId) {
      return {
        combatId: activeCombatId,
        targetActorId: "",
        targetActorName: "",
        moveId: "",
        moveName: "",
        remainingHits: 0,
        storedDamage: 0,
        roundKey: ""
      };
    }
    return {
      combatId,
      targetActorId: `${rawState?.targetActorId ?? ""}`.trim(),
      targetActorName: `${rawState?.targetActorName ?? ""}`.trim(),
      moveId: `${rawState?.moveId ?? ""}`.trim(),
      moveName: `${rawState?.moveName ?? ""}`.trim(),
      remainingHits: Math.max(Math.floor(toNumber(rawState?.remainingHits, 0)), 0),
      storedDamage: Math.max(Math.floor(toNumber(rawState?.storedDamage, 0)), 0),
      roundKey: `${rawState?.roundKey ?? ""}`.trim()
    };
  }

  _hasActiveBideState() {
    return this._getBideState().remainingHits > 0;
  }

  async _setBideState(state = {}) {
    const combatId = `${game.combat?.id ?? ""}`.trim();
    if (!combatId) return null;
    const nextState = {
      combatId,
      targetActorId: `${state?.targetActorId ?? ""}`.trim(),
      targetActorName: `${state?.targetActorName ?? ""}`.trim(),
      moveId: `${state?.moveId ?? ""}`.trim(),
      moveName: `${state?.moveName ?? ""}`.trim(),
      remainingHits: Math.max(Math.floor(toNumber(state?.remainingHits, 0)), 0),
      storedDamage: Math.max(Math.floor(toNumber(state?.storedDamage, 0)), 0),
      roundKey: `${state?.roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim()
    };
    await this.setFlag(POKROLE.ID, BIDE_STATE_FLAG_KEY, nextState);
    return nextState;
  }

  async _clearBideState() {
    await this.unsetFlag(POKROLE.ID, BIDE_STATE_FLAG_KEY);
  }

  _getSpecialDamageUniqueTargetsState() {
    const rawState = this.getFlag(POKROLE.ID, SPECIAL_DAMAGE_UNIQUE_TARGETS_FLAG_KEY) ?? {};
    const combatId = `${rawState?.combatId ?? ""}`.trim();
    const activeCombatId = `${game.combat?.id ?? ""}`.trim();
    if (!combatId || !activeCombatId || combatId !== activeCombatId) {
      return {
        combatId: activeCombatId,
        targetsByMove: {}
      };
    }
    return {
      combatId,
      targetsByMove: foundry.utils.deepClone(rawState?.targetsByMove ?? {})
    };
  }

  _hasSpecialDamageMoveAlreadyHitTarget(move, targetActor) {
    const seedId = this._getMoveSeedId(move);
    const targetId = `${targetActor?.id ?? ""}`.trim();
    if (!seedId || !targetId) return false;
    const state = this._getSpecialDamageUniqueTargetsState();
    const targetIds = Array.isArray(state.targetsByMove?.[seedId]) ? state.targetsByMove[seedId] : [];
    return targetIds.includes(targetId);
  }

  async _markSpecialDamageMoveHitTarget(move, targetActor) {
    const seedId = this._getMoveSeedId(move);
    const targetId = `${targetActor?.id ?? ""}`.trim();
    if (!seedId || !targetId) return;
    const state = this._getSpecialDamageUniqueTargetsState();
    const nextTargets = Array.isArray(state.targetsByMove?.[seedId]) ? [...state.targetsByMove[seedId]] : [];
    if (!nextTargets.includes(targetId)) {
      nextTargets.push(targetId);
    }
    state.targetsByMove[seedId] = nextTargets;
    await this.setFlag(POKROLE.ID, SPECIAL_DAMAGE_UNIQUE_TARGETS_FLAG_KEY, state);
  }

  _normalizeMultiTurnMode(value) {
    const normalized = `${value ?? ""}`.trim().toLowerCase();
    if (["charge", "recharge", "rampage"].includes(normalized)) return normalized;
    return "none";
  }

  _getMultiTurnState() {
    const rawState = this.getFlag(POKROLE.ID, MULTI_TURN_STATE_FLAG_KEY) ?? {};
    const mode = this._normalizeMultiTurnMode(rawState?.mode);
    const activeCombatId = `${game.combat?.id ?? ""}`.trim();
    const storedCombatId = `${rawState?.combatId ?? ""}`.trim();

    if (mode === "none" || !activeCombatId || !storedCombatId || storedCombatId !== activeCombatId) {
      return {
        mode: "none",
        combatId: activeCombatId,
        moveId: "",
        moveName: "",
        moveUuid: "",
        moveSeedId: "",
        targetMode: "foe",
        targetActorIds: [],
        carriedTargetIds: [],
        specialChargeState: "none",
        outOfRange: false,
        vulnerableMoveSeedIds: [],
        chargeActionsRemaining: 0,
        chargeStartEffectSignatures: [],
        rechargeRound: 0,
        rampageUses: 0,
        rampageMaxUses: RAMPAGE_MAX_USES
      };
    }

    return {
      mode,
      combatId: storedCombatId,
      moveId: `${rawState?.moveId ?? ""}`.trim(),
      moveName: `${rawState?.moveName ?? ""}`.trim(),
      moveUuid: `${rawState?.moveUuid ?? ""}`.trim(),
      moveSeedId: `${rawState?.moveSeedId ?? ""}`.trim().toLowerCase(),
      targetMode: this._normalizeMoveTargetKey(rawState?.targetMode),
      targetActorIds: Array.isArray(rawState?.targetActorIds)
        ? [...new Set(rawState.targetActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      carriedTargetIds: Array.isArray(rawState?.carriedTargetIds)
        ? [...new Set(rawState.carriedTargetIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      specialChargeState: `${rawState?.specialChargeState ?? "none"}`.trim().toLowerCase() || "none",
      outOfRange: Boolean(rawState?.outOfRange),
      vulnerableMoveSeedIds: Array.isArray(rawState?.vulnerableMoveSeedIds)
        ? [...new Set(rawState.vulnerableMoveSeedIds.map((value) => `${value ?? ""}`.trim().toLowerCase()).filter(Boolean))]
        : [],
      chargeActionsRemaining: Math.max(Math.floor(toNumber(rawState?.chargeActionsRemaining, 0)), 0),
      chargeStartEffectSignatures: Array.isArray(rawState?.chargeStartEffectSignatures)
        ? [...new Set(rawState.chargeStartEffectSignatures.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      rechargeRound: Math.max(Math.floor(toNumber(rawState?.rechargeRound, 0)), 0),
      rampageUses: Math.max(Math.floor(toNumber(rawState?.rampageUses, 0)), 0),
      rampageMaxUses: Math.max(
        Math.floor(toNumber(rawState?.rampageMaxUses, RAMPAGE_MAX_USES)),
        1
      )
    };
  }

  async _setMultiTurnState(state = {}) {
    const mode = this._normalizeMultiTurnMode(state?.mode);
    if (mode === "none") {
      await this.unsetFlag(POKROLE.ID, MULTI_TURN_STATE_FLAG_KEY);
      return this._getMultiTurnState();
    }

    const combatId = `${game.combat?.id ?? state?.combatId ?? ""}`.trim();
    if (!combatId) {
      await this.unsetFlag(POKROLE.ID, MULTI_TURN_STATE_FLAG_KEY);
      return this._getMultiTurnState();
    }

    await this.setFlag(POKROLE.ID, MULTI_TURN_STATE_FLAG_KEY, {
      mode,
      combatId,
      moveId: `${state?.moveId ?? ""}`.trim(),
      moveName: `${state?.moveName ?? ""}`.trim(),
      moveUuid: `${state?.moveUuid ?? ""}`.trim(),
      moveSeedId: `${state?.moveSeedId ?? ""}`.trim().toLowerCase(),
      targetMode: this._normalizeMoveTargetKey(state?.targetMode),
      targetActorIds: Array.isArray(state?.targetActorIds)
        ? [...new Set(state.targetActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      carriedTargetIds: Array.isArray(state?.carriedTargetIds)
        ? [...new Set(state.carriedTargetIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      specialChargeState: `${state?.specialChargeState ?? "none"}`.trim().toLowerCase() || "none",
      outOfRange: Boolean(state?.outOfRange),
      vulnerableMoveSeedIds: Array.isArray(state?.vulnerableMoveSeedIds)
        ? [...new Set(state.vulnerableMoveSeedIds.map((value) => `${value ?? ""}`.trim().toLowerCase()).filter(Boolean))]
        : [],
      chargeActionsRemaining: Math.max(Math.floor(toNumber(state?.chargeActionsRemaining, 0)), 0),
      chargeStartEffectSignatures: Array.isArray(state?.chargeStartEffectSignatures)
        ? [...new Set(state.chargeStartEffectSignatures.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      rechargeRound: Math.max(Math.floor(toNumber(state?.rechargeRound, 0)), 0),
      rampageUses: Math.max(Math.floor(toNumber(state?.rampageUses, 0)), 0),
      rampageMaxUses: Math.max(
        Math.floor(toNumber(state?.rampageMaxUses, RAMPAGE_MAX_USES)),
        1
      )
    });

    return this._getMultiTurnState();
  }

  async clearMultiTurnState() {
    await this.unsetFlag(POKROLE.ID, MULTI_TURN_STATE_FLAG_KEY);
  }

  _normalizeDelayedEffectPhase(phase) {
    const normalized = `${phase ?? ""}`.trim().toLowerCase();
    return ["round-start", "round-end"].includes(normalized) ? normalized : "";
  }

  _normalizeDelayedEffectEntry(entry = {}, index = 0) {
    const phase = this._normalizeDelayedEffectPhase(entry?.phase ?? entry?.triggerPhase);
    if (!phase) return null;
    const fallbackId = foundry.utils.randomID?.() ?? `${Date.now()}-${index}`;
    const remainingTriggersRaw = Number(entry?.remainingTriggers);
    const remainingTriggers = Number.isFinite(remainingTriggersRaw)
      ? Math.trunc(remainingTriggersRaw)
      : 1;
    return {
      id: `${entry?.id ?? fallbackId}`.trim() || fallbackId,
      kind: `${entry?.kind ?? "generic"}`.trim().toLowerCase() || "generic",
      phase,
      triggerRound: Math.max(Math.floor(toNumber(entry?.triggerRound, 0)), 0),
      repeatEveryRounds: Math.max(Math.floor(toNumber(entry?.repeatEveryRounds, 0)), 0),
      remainingTriggers,
      createdRound: Math.max(Math.floor(toNumber(entry?.createdRound, 0)), 0),
      createdTurn: Math.max(Math.floor(toNumber(entry?.createdTurn, 0)), 0),
      createdAt: Math.max(Math.floor(toNumber(entry?.createdAt, Date.now() + index)), 0),
      sourceActorId: `${entry?.sourceActorId ?? ""}`.trim(),
      sourceCombatantId: `${entry?.sourceCombatantId ?? ""}`.trim(),
      sourceSlotId: `${entry?.sourceSlotId ?? ""}`.trim(),
      sourceSideDisposition: clamp(Math.sign(Math.trunc(toNumber(entry?.sourceSideDisposition, 0))), -1, 1),
      targetActorId: `${entry?.targetActorId ?? ""}`.trim(),
      targetCombatantId: `${entry?.targetCombatantId ?? ""}`.trim(),
      targetSlotId: `${entry?.targetSlotId ?? ""}`.trim(),
      targetSideDisposition: clamp(Math.sign(Math.trunc(toNumber(entry?.targetSideDisposition, 0))), -1, 1),
      moveId: `${entry?.moveId ?? ""}`.trim(),
      moveSeedId: `${entry?.moveSeedId ?? ""}`.trim().toLowerCase(),
      moveName: `${entry?.moveName ?? ""}`.trim(),
      payload: foundry.utils.deepClone(entry?.payload ?? {})
    };
  }

  _getDelayedEffectQueue(combat = game.combat) {
    if (!combat) return [];
    const queue = combat.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.DELAYED_EFFECT_QUEUE);
    if (!Array.isArray(queue)) return [];
    return queue.map((entry, index) => this._normalizeDelayedEffectEntry(entry, index)).filter(Boolean);
  }

  async _setDelayedEffectQueue(combat = game.combat, queue = []) {
    if (!combat) return [];
    const normalizedQueue = (Array.isArray(queue) ? queue : [])
      .map((entry, index) => this._normalizeDelayedEffectEntry(entry, index))
      .filter(Boolean);
    if (!game.user?.isGM) {
      await this._requestCombatMutation("setDelayedEffectQueue", {
        combatId: combat.id ?? null,
        queue: normalizedQueue
      });
      return normalizedQueue;
    }
    if (normalizedQueue.length > 0) {
      await combat.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.DELAYED_EFFECT_QUEUE, normalizedQueue);
    } else {
      await combat.unsetFlag(POKROLE.ID, COMBAT_FLAG_KEYS.DELAYED_EFFECT_QUEUE);
    }
    return normalizedQueue;
  }

  async clearDelayedEffectQueue(combat = game.combat) {
    if (!combat) return [];
    const cleared = await this._setDelayedEffectQueue(combat, []);
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant?.actor ?? null;
      if (!actor?.unsetFlag) continue;
      if (actor.getFlag?.(POKROLE.ID, "combat.sideDispositionOverride") !== undefined) {
        await actor.unsetFlag(POKROLE.ID, "combat.sideDispositionOverride");
      }
    }
    return cleared;
  }

  async _scheduleDelayedEffect(combat = game.combat, entry = {}) {
    if (!combat) return null;
    const normalized = this._normalizeDelayedEffectEntry(entry);
    if (!normalized) return null;
    const queue = this._getDelayedEffectQueue(combat);
    queue.push(normalized);
    queue.sort((left, right) => {
      if (left.triggerRound !== right.triggerRound) return left.triggerRound - right.triggerRound;
      if (left.phase !== right.phase) return left.phase === "round-start" ? -1 : 1;
      return left.createdAt - right.createdAt;
    });
    await this._setDelayedEffectQueue(combat, queue);
    return normalized;
  }

  async _prepareDelayedMoveAutomation(move, context = {}) {
    const moveSeedId = this._getMoveSeedId(move);
    const delayedMoveSeedIds = new Set([
      "move-doom-desire",
      "move-fire-pledge",
      "move-future-sight",
      "move-grudge",
      "move-malignant-chain",
      "move-sappy-seed",
      "move-wish",
      "move-yawn"
    ]);
    if (!delayedMoveSeedIds.has(moveSeedId) || !game.combat) {
      return {
        skipImmediateDamage: false,
        skipMoveSecondaryEffectSignatures: new Set(),
        results: []
      };
    }
    if (context?.hit === false) {
      return {
        skipImmediateDamage: false,
        skipMoveSecondaryEffectSignatures: new Set(),
        results: []
      };
    }

    const round = Math.max(Math.floor(toNumber(game.combat.round, 0)), 0);
    const sourceCombatant = game.combat.combatants?.find?.((combatant) => combatant.actor?.id === this.id) ?? null;
    const targetActors = Array.isArray(context.targetActors) ? context.targetActors.filter(Boolean) : [];
    const moveTargetKey = this._normalizeMoveTargetKey(context.moveTargetKey ?? move?.system?.target);
    const primaryTarget =
      context.targetActor ??
      targetActors[0] ??
      (moveTargetKey === "self" || this._getMoveSeedId(move) === "move-wish" ? this : null);
    const sourceSideDisposition = this._getActorCombatSideDisposition(this, game.combat);
    const targetSideDisposition = primaryTarget
      ? this._getActorCombatSideDisposition(primaryTarget, game.combat)
      : clamp(Math.sign(Math.trunc(toNumber(context.targetSideDisposition, 0))), -1, 1);
    const delayedPayload = {
      id: foundry.utils.randomID?.() ?? `${Date.now()}`,
      kind: "generic",
      phase: "round-start",
      triggerRound: round + 1,
      repeatEveryRounds: 0,
      remainingTriggers: 1,
      createdRound: round,
      createdTurn: Math.max(Math.floor(toNumber(game.combat.turn, 0)), 0),
      createdAt: Date.now(),
      sourceActorId: this.id ?? null,
      sourceCombatantId: sourceCombatant?.id ?? null,
      sourceSlotId: sourceCombatant ? await this._ensureCombatantBattleSlotId(sourceCombatant) : null,
      sourceSideDisposition,
      targetActorId: primaryTarget?.id ?? null,
      targetCombatantId: primaryTarget ? (game.combat.combatants?.find?.((combatant) => combatant.actor?.id === primaryTarget.id)?.id ?? null) : null,
      targetSlotId:
        primaryTarget
          ? await this._ensureCombatantBattleSlotId(
              game.combat.combatants?.find?.((combatant) => combatant.actor?.id === primaryTarget.id) ?? null
            )
          : null,
      targetSideDisposition,
      moveId: move?.id ?? null,
      moveSeedId,
      moveName: move?.name ?? "",
      payload: {}
    };
    const results = [];
    const skipMoveSecondaryEffectSignatures = new Set();
    for (const effect of this._normalizeSecondaryEffectDefinitions(move?.system?.secondaryEffects)) {
      skipMoveSecondaryEffectSignatures.add(this._getSecondaryEffectSignature(effect));
    }

    if (moveSeedId === "move-future-sight" || moveSeedId === "move-doom-desire") {
      delayedPayload.kind = "delayed-damage";
      delayedPayload.phase = "round-start";
      delayedPayload.triggerRound = round + 1;
      delayedPayload.payload = {
        ignoreShield: true,
        ignoreCover: true,
        ignoreDefenses: false
      };
      await this._scheduleDelayedEffect(game.combat, delayedPayload);
      results.push({
        label: game.i18n.localize("POKROLE.Chat.DelayedEffect.Title"),
        targetName: primaryTarget?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        applied: true,
        detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
      });
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-wish") {
      if (!primaryTarget) {
        return {
          skipImmediateDamage: false,
          skipMoveSecondaryEffectSignatures,
          results
        };
      }
      delayedPayload.kind = "wish";
      delayedPayload.payload = {
        healAmount: 3,
        healingCategory: "basic"
      };
      await this._scheduleDelayedEffect(game.combat, delayedPayload);
      results.push({
        label: this._localizeSecondaryEffectTypeLabel("heal"),
        targetName: primaryTarget.name,
        applied: true,
        detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
      });
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-yawn") {
      if (!primaryTarget) {
        return {
          skipImmediateDamage: true,
          skipMoveSecondaryEffectSignatures,
          results
        };
      }
      delayedPayload.kind = "yawn";
      delayedPayload.phase = "round-start";
      delayedPayload.triggerRound = round + 1;
      delayedPayload.payload = {
        conditionKey: "sleep"
      };
      await this._scheduleDelayedEffect(game.combat, delayedPayload);
      results.push({
        label: this._localizeSecondaryEffectTypeLabel("condition"),
        targetName: primaryTarget.name,
        applied: true,
        detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
      });
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-fire-pledge") {
      delayedPayload.kind = "fire-pledge";
      delayedPayload.phase = "round-end";
      delayedPayload.triggerRound = round;
      delayedPayload.repeatEveryRounds = 1;
      delayedPayload.remainingTriggers = 4;
      delayedPayload.payload = {
        ignoreShield: true,
        ignoreCover: true,
        ignoreDefenses: true,
        fixedDamagePool: 2,
        moveType: "fire",
        category: "special"
      };
      await this._scheduleDelayedEffect(game.combat, delayedPayload);
      results.push({
        label: game.i18n.localize("POKROLE.Chat.DelayedEffect.Title"),
        targetName: game.i18n.localize("POKROLE.Move.TargetValues.Battlefield"),
        applied: true,
        detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
      });
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-sappy-seed") {
      if (!primaryTarget) {
        return {
          skipImmediateDamage: true,
          skipMoveSecondaryEffectSignatures,
          results
        };
      }
      delayedPayload.kind = "sappy-seed";
      delayedPayload.phase = "round-end";
      delayedPayload.triggerRound = round;
      delayedPayload.repeatEveryRounds = 1;
      delayedPayload.remainingTriggers = -1;
      delayedPayload.payload = {
        ignoreShield: true,
        ignoreCover: true,
        ignoreDefenses: true,
        fixedDamagePool: 2,
        moveType: "none",
        category: "special",
        healingCategory: "basic"
      };
      await this._scheduleDelayedEffect(game.combat, delayedPayload);
      results.push({
        label: game.i18n.localize("POKROLE.Chat.DelayedEffect.Title"),
        targetName: primaryTarget.name,
        applied: true,
        detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
      });
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-malignant-chain") {
      if (!primaryTarget) {
        return {
          skipImmediateDamage: true,
          skipMoveSecondaryEffectSignatures,
          results
        };
      }
      const chanceRoll = await new Roll("5d6").evaluate();
      const rolledValues = chanceRoll.dice.flatMap((die) =>
        Array.isArray(die?.results)
          ? die.results.map((result) => Math.floor(toNumber(result?.result, 0)))
          : []
      );
      const success = rolledValues.some((value) => value === 6);
      results.push({
        label: this._localizeSecondaryEffectTypeLabel("condition"),
        targetName: primaryTarget.name,
        applied: success,
        detail: success
          ? game.i18n.localize("POKROLE.Chat.SecondaryEffectApplied")
          : game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
              rolls: rolledValues.join(", "),
              dice: 5
            })
      });
      if (success) {
        const applyResult = await this._applyConditionEffectToActor(
          {
            effectType: "condition",
            condition: "badly-poisoned",
            chance: 0,
            target: "target",
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          primaryTarget,
          move
        );
        if (applyResult?.applied) {
          delayedPayload.kind = "malignant-chain";
          delayedPayload.phase = "round-end";
          delayedPayload.triggerRound = round;
          delayedPayload.remainingTriggers = 1;
          delayedPayload.payload = {
            markerId: foundry.utils.randomID?.() ?? `${Date.now()}`,
            sourceSideDisposition
          };
          await primaryTarget.setFlag(POKROLE.ID, "delayed.malignantChainMarker", `${delayedPayload.payload.markerId}`);
          await this._scheduleDelayedEffect(game.combat, delayedPayload);
          results.push({
            label: game.i18n.localize("POKROLE.Chat.DelayedEffect.Title"),
            targetName: primaryTarget.name,
            applied: true,
            detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
          });
        }
      }
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    if (moveSeedId === "move-grudge") {
      if (this.system?.resources?.hp?.value > 0) {
        await this._safeApplyDamage(this, this.system.resources.hp.value, { applyDeadOnZero: false });
      }
      if (primaryTarget) {
        await primaryTarget.update({ "system.resources.will.value": 0 });
        delayedPayload.kind = "grudge";
        delayedPayload.phase = "round-end";
        delayedPayload.triggerRound = round;
        delayedPayload.repeatEveryRounds = 1;
        delayedPayload.remainingTriggers = -1;
        delayedPayload.payload = {
          difficulty: 3
        };
        await this._scheduleDelayedEffect(game.combat, delayedPayload);
        results.push({
          label: game.i18n.localize("POKROLE.Chat.DelayedEffect.Title"),
          targetName: primaryTarget.name,
          applied: true,
          detail: game.i18n.localize("POKROLE.Chat.DelayedEffect.Scheduled")
        });
      }
      return {
        skipImmediateDamage: true,
        skipMoveSecondaryEffectSignatures,
        results
      };
    }

    return {
      skipImmediateDamage: false,
      skipMoveSecondaryEffectSignatures,
      results
    };
  }

  async _selectDelayedRetargetActor(combat, sideDisposition = 0, options = {}) {
    const normalizedSide = clamp(Math.sign(Math.trunc(toNumber(sideDisposition, 0))), -1, 1);
    if (!combat || normalizedSide === 0) return null;
    const excludeActorIds = new Set(
      Array.isArray(options.excludeActorIds)
        ? options.excludeActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean)
        : []
    );
    const candidates = (combat.combatants?.contents ?? combat.combatants ?? [])
      .map((combatant) => combatant?.actor ?? null)
      .filter((actor) => actor?.type === "pokemon")
      .filter((actor) => !excludeActorIds.has(actor.id))
      .filter((actor) => this._getActorCombatSideDisposition(actor, combat) === normalizedSide);
    if (candidates.length <= 0) return null;
    if (candidates.length === 1 || !game.user?.isGM) return candidates[0];

    const optionsHtml = candidates
      .map((actor, index) => `<option value="${actor.id}"${index === 0 ? " selected" : ""}>${actor.name}</option>`)
      .join("");
    return new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.Delayed.Retarget.Title"),
        content: `
          <form class="pok-role-delayed-retarget-dialog">
            <p>${options.prompt ?? game.i18n.localize("POKROLE.Combat.Delayed.Retarget.DefaultPrompt")}</p>
            <div class="form-group">
              <label>${game.i18n.localize("POKROLE.Common.Target")}</label>
              <div class="form-fields">
                <select name="targetId">${optionsHtml}</select>
              </div>
            </div>
          </form>
        `,
        buttons: {
          choose: {
            label: game.i18n.localize("POKROLE.Common.Confirm"),
            callback: (html) => {
              const selectedId = `${html.find('[name="targetId"]').val() ?? ""}`.trim();
              resolve(candidates.find((actor) => actor.id === selectedId) ?? candidates[0] ?? null);
            }
          },
          cancel: {
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "choose",
        close: () => resolve(null)
      }).render(true);
    });
  }

  async _resolveDelayedEffectEntry(entry, phaseRound = 0) {
    const combat = game.combat ?? null;
    const sourceCombatant =
      `${entry.sourceCombatantId ?? ""}`.trim() && combat
        ? combat.combatants?.get?.(`${entry.sourceCombatantId}`.trim()) ??
          combat.combatants?.find?.((combatant) => `${combatant?.id ?? ""}`.trim() === `${entry.sourceCombatantId}`.trim()) ??
          null
        : null;
    const targetCombatant =
      `${entry.targetCombatantId ?? ""}`.trim() && combat
        ? combat.combatants?.get?.(`${entry.targetCombatantId}`.trim()) ??
          combat.combatants?.find?.((combatant) => `${combatant?.id ?? ""}`.trim() === `${entry.targetCombatantId}`.trim()) ??
          null
        : null;
    const sourceActor =
      sourceCombatant?.actor ??
      game.actors?.get?.(entry.sourceActorId) ??
      null;
    let sourceMove = sourceActor?.items?.get?.(entry.moveId) ?? null;
    if (!sourceMove && sourceActor) {
      const delayedSeedId = `${entry.moveSeedId ?? ""}`.trim().toLowerCase();
      if (delayedSeedId) {
        sourceMove =
          sourceActor.items?.find?.((item) => item?.type === "move" && this._getMoveSeedId(item) === delayedSeedId) ??
          null;
      }
    }
    const baseTargetActor =
      targetCombatant?.actor ??
      game.actors?.get?.(entry.targetActorId) ??
      null;
    const targetSideDisposition = clamp(Math.sign(Math.trunc(toNumber(entry.targetSideDisposition, 0))), -1, 1);
    const payload = entry.payload ?? {};
    const result = {
      resolved: false,
      keepEntry: false,
      detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    };

    const resolveMissingTarget = async (promptKey = "POKROLE.Combat.Delayed.Retarget.DefaultPrompt") => {
      if (baseTargetActor) return baseTargetActor;
      if (!combat) return null;
      return this._selectDelayedRetargetActor(combat, targetSideDisposition, {
        prompt: game.i18n.localize(promptKey),
        excludeActorIds: [entry.sourceActorId]
      });
    };

    if (!sourceActor || !sourceMove) {
      return result;
    }

    if (entry.kind === "delayed-damage" || entry.moveSeedId === "move-future-sight" || entry.moveSeedId === "move-doom-desire") {
      const targetActor = await resolveMissingTarget("POKROLE.Combat.Delayed.Retarget.Damage");
      if (!targetActor) return result;
      const damageResult = await sourceActor._resolveMoveDamageAgainstTarget({
        move: sourceMove,
        targetActor,
        painPenalty: 0,
        critical: false,
        isHoldingBackHalf: false,
        canInflictDeathOnKo: false,
        actionNumber: 1,
        roundKey: `${combat?.id ?? ""}:${phaseRound}`,
        attackOverrides: {
          ignoreShield: Boolean(payload.ignoreShield),
          ignoreCover: Boolean(payload.ignoreCover),
          ignoreDefenses: Boolean(payload.ignoreDefenses),
          fixedDamagePool: Number.isFinite(Number(payload.fixedDamagePool))
            ? Math.max(Math.floor(toNumber(payload.fixedDamagePool, 0)), 0)
            : null,
          moveType: payload.moveType ?? sourceMove.system?.type ?? "normal",
          category: payload.category ?? sourceMove.system?.category ?? "special"
        }
      });
      return {
        resolved: Boolean(damageResult),
        keepEntry: false,
        detail: damageResult
          ? game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
              before: damageResult.hpBefore,
              after: damageResult.hpAfter
            })
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    if (entry.kind === "wish" || entry.moveSeedId === "move-wish") {
      const slotCombatant = `${entry.targetSlotId ?? ""}`.trim()
        ? combat?.combatants?.find?.((combatant) => this._getCombatantBattleSlotId(combatant) === `${entry.targetSlotId}`.trim()) ?? null
        : null;
      const targetActor =
        slotCombatant?.actor instanceof PokRoleActor
          ? slotCombatant.actor
          : await resolveMissingTarget("POKROLE.Combat.Delayed.Retarget.Wish");
      if (!targetActor) return result;
      const healAmount = Math.max(Math.floor(toNumber(payload.healAmount, 3)), 0);
      const healResult = await sourceActor._safeApplyHeal(targetActor, healAmount, {
        healingCategory: `${payload.healingCategory ?? "basic"}`.trim().toLowerCase()
      });
      return {
        resolved: Boolean(healResult),
        keepEntry: false,
        detail: healResult
          ? game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
              before: healResult.hpBefore,
              after: healResult.hpAfter
            })
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    if (entry.kind === "yawn" || entry.moveSeedId === "move-yawn") {
      const targetActor = await resolveMissingTarget("POKROLE.Combat.Delayed.Retarget.Yawn");
      if (!targetActor) return result;
      const applyResult = await sourceActor._applyConditionEffectToActor(
        {
          effectType: "condition",
          condition: "sleep",
          chance: 0,
          target: "target",
          durationMode: "manual",
          durationRounds: 1,
          specialDuration: []
        },
        targetActor,
        sourceMove
      );
      return {
        resolved: Boolean(applyResult?.applied),
        keepEntry: false,
        detail: applyResult?.detail ?? game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    if (entry.kind === "ongoing-damage") {
      if (!combat || !baseTargetActor || !(baseTargetActor instanceof PokRoleActor)) {
        return result;
      }
      const targetCombatant = this._getCombatantForActor(baseTargetActor, combat);
      if (!targetCombatant) {
        return {
          resolved: false,
          keepEntry: false,
          detail: game.i18n.localize("POKROLE.Common.None")
        };
      }
      if (
        baseTargetActor._isConditionActive?.("dead") ||
        baseTargetActor._isConditionActive?.("fainted") ||
        Math.max(toNumber(baseTargetActor.system?.resources?.hp?.value, 0), 0) <= 0
      ) {
        return {
          resolved: false,
          keepEntry: false,
          detail: game.i18n.localize("POKROLE.Common.None")
        };
      }
      const extraDamageVsTypes = Array.isArray(payload.extraDamageVsTypes)
        ? payload.extraDamageVsTypes.map((value) => this._normalizeTypeKey(value)).filter((value) => value && value !== "none")
        : [];
      const defenderTypes = this._getEffectiveDefenderTypesForInteraction(baseTargetActor, payload.moveType ?? sourceMove.system?.type ?? "normal");
      const extraDamageDice = extraDamageVsTypes.some((typeKey) => defenderTypes.includes(typeKey)) ? 1 : 0;
      const damageDice = Math.max(Math.floor(toNumber(payload.damageDice, 0)), 0) + extraDamageDice;
      if (damageDice <= 0) {
        return {
          resolved: false,
          keepEntry: false,
          detail: game.i18n.localize("POKROLE.Common.None")
        };
      }
      const damageResult = await sourceActor._resolveMoveDamageAgainstTarget({
        move: sourceMove,
        targetActor: baseTargetActor,
        painPenalty: 0,
        critical: false,
        isHoldingBackHalf: false,
        canInflictDeathOnKo: false,
        actionNumber: 1,
        roundKey: `${combat?.id ?? ""}:${phaseRound}`,
        attackOverrides: {
          ignoreShield: true,
          ignoreCover: true,
          fixedDamagePool: damageDice,
          moveType: payload.moveType ?? sourceMove.system?.type ?? "normal",
          category: payload.category ?? sourceMove.system?.category ?? "physical"
        }
      });
      return {
        resolved: Boolean(damageResult),
        keepEntry: true,
        detail: damageResult
          ? `${baseTargetActor.name} suffered ongoing damage (${damageResult.hpBefore} -> ${damageResult.hpAfter}).`
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    if (entry.kind === "fire-pledge" || entry.moveSeedId === "move-fire-pledge") {
      const targets = (combat?.combatants?.contents ?? combat?.combatants ?? [])
        .map((combatant) => combatant?.actor ?? null)
        .filter((actor) => actor?.type === "pokemon" && actor._isActorGroundedForTerrain?.(actor));
      const results = [];
      for (const targetActor of targets) {
        const damageResult = await sourceActor._resolveMoveDamageAgainstTarget({
          move: sourceMove,
          targetActor,
          painPenalty: 0,
          critical: false,
          isHoldingBackHalf: false,
          canInflictDeathOnKo: false,
          actionNumber: 1,
          roundKey: `${combat?.id ?? ""}:${phaseRound}`,
          attackOverrides: {
            ignoreShield: true,
            ignoreCover: true,
            ignoreDefenses: true,
            fixedDamagePool: 2,
            moveType: "fire",
            category: "special"
          }
        });
        results.push({
          targetName: targetActor.name,
          applied: Boolean(damageResult),
          detail: damageResult
            ? game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
                before: damageResult.hpBefore,
                after: damageResult.hpAfter
              })
            : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
        });
      }
      return {
        resolved: true,
        keepEntry: true,
        detail: results.length > 0 ? game.i18n.localize("POKROLE.Chat.SecondaryEffectApplied") : game.i18n.localize("POKROLE.Common.None"),
        results
      };
    }

    if (entry.kind === "sappy-seed" || entry.moveSeedId === "move-sappy-seed") {
      const targetActor = await resolveMissingTarget("POKROLE.Combat.Delayed.Retarget.Damage");
      if (!targetActor) return result;
      const damageResult = await sourceActor._resolveMoveDamageAgainstTarget({
        move: sourceMove,
        targetActor,
        painPenalty: 0,
        critical: false,
        isHoldingBackHalf: false,
        canInflictDeathOnKo: false,
        actionNumber: 1,
        roundKey: `${combat?.id ?? ""}:${phaseRound}`,
        attackOverrides: {
          ignoreShield: true,
          ignoreCover: true,
          ignoreDefenses: true,
          fixedDamagePool: 2,
          moveType: "none",
          category: "special"
        }
      });
      const damageDealt = Math.max(toNumber(damageResult?.finalDamage, 0), 0);
      if (damageDealt > 0) {
        await sourceActor._safeApplyHeal(sourceActor, damageDealt, {
          healingCategory: `${payload.healingCategory ?? "basic"}`.trim().toLowerCase()
        });
      }
      return {
        resolved: Boolean(damageResult),
        keepEntry: true,
        detail: damageResult
          ? game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
              before: damageResult.hpBefore,
              after: damageResult.hpAfter
            })
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    if (entry.kind === "malignant-chain" || entry.moveSeedId === "move-malignant-chain") {
      const markerId = `${payload.markerId ?? ""}`.trim();
      if (!markerId || !baseTargetActor) return result;
      const activeMarker = `${baseTargetActor.getFlag?.(POKROLE.ID, "delayed.malignantChainMarker") ?? ""}`.trim();
      if (activeMarker !== markerId || !baseTargetActor._isConditionActive?.("badly-poisoned")) {
        return {
          resolved: false,
          keepEntry: false,
          detail: game.i18n.localize("POKROLE.Common.None")
        };
      }
      const loyaltyValue = Math.max(Math.floor(toNumber(baseTargetActor.system?.loyalty, 0)), 0);
      const roll = await new Roll(`${Math.max(loyaltyValue, 1)}d6cs>=${POKROLE.SUCCESS_TARGET}`).evaluate();
      const successes = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
      const success = successes >= 3;
      if (!success) {
        await baseTargetActor.setFlag(POKROLE.ID, "combat.sideDispositionOverride", payload.sourceSideDisposition ?? 0);
      }
      await baseTargetActor.unsetFlag(POKROLE.ID, "delayed.malignantChainMarker");
      return {
        resolved: true,
        keepEntry: false,
        detail: success
          ? game.i18n.localize("POKROLE.Chat.DelayedEffect.LoyaltySuccess")
          : game.i18n.localize("POKROLE.Chat.DelayedEffect.LoyaltyFailure")
      };
    }

    if (entry.kind === "grudge" || entry.moveSeedId === "move-grudge") {
      const targetActor = await resolveMissingTarget("POKROLE.Combat.Delayed.Retarget.Damage");
      if (!targetActor) return result;
      const loyaltyValue = Math.max(Math.floor(toNumber(targetActor.system?.loyalty, 0)), 0);
      const difficulty = Math.max(Math.floor(toNumber(payload.difficulty, 3)), 1);
      const roll = await new Roll(`${Math.max(loyaltyValue, 1)}d6cs>=${POKROLE.SUCCESS_TARGET}`).evaluate();
      const successes = Math.max(Math.floor(toNumber(roll.total, 0)), 0);
      const failed = successes < difficulty;
      if (failed) {
        await targetActor.toggleQuickCondition?.("fainted", { active: true });
      }
      const nextDifficulty = difficulty + 1;
      return {
        resolved: true,
        keepEntry: !failed,
        detail: failed
          ? game.i18n.localize("POKROLE.Chat.DelayedEffect.LoyaltyFailure")
          : game.i18n.localize("POKROLE.Chat.DelayedEffect.LoyaltySuccess"),
        nextEntry: failed
          ? null
          : {
              ...entry,
              payload: {
                ...payload,
                difficulty: nextDifficulty
              }
            }
      };
    }

    return result;
  }

  async processDelayedEffectPhase(phase, options = {}) {
    const normalizedPhase = this._normalizeDelayedEffectPhase(phase);
    if (!normalizedPhase) return [];
    const combat = options.combat ?? game.combat ?? null;
    if (!combat) return [];
    const fallbackRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    const phaseRound = Math.max(Math.floor(toNumber(options.phaseRound, fallbackRound)), 0);
    if (phaseRound <= 0) return [];
    const lockKey = `${combat.id}:${normalizedPhase}:${phaseRound}`;
    if (DELAYED_EFFECT_PROCESS_LOCKS.has(lockKey)) return [];
    DELAYED_EFFECT_PROCESS_LOCKS.add(lockKey);
    try {
      const queue = this._getDelayedEffectQueue(combat);
      if (queue.length <= 0) return [];

      const remainingQueue = [];
      const resolvedEntries = [];
      for (const rawEntry of queue) {
        const entry = this._normalizeDelayedEffectEntry(rawEntry);
        if (!entry) continue;
        if (entry.phase !== normalizedPhase || entry.triggerRound > phaseRound) {
          remainingQueue.push(entry);
          continue;
        }

        const resolution = await this._resolveDelayedEffectEntry(entry, phaseRound);
        resolvedEntries.push({ entry, resolution });

        if (resolution?.nextEntry) {
          remainingQueue.push(this._normalizeDelayedEffectEntry(resolution.nextEntry));
          continue;
        }
        if (resolution?.keepEntry) {
          const nextRemaining =
            entry.remainingTriggers < 0 ? -1 : Math.max(entry.remainingTriggers - 1, 0);
          const nextTriggerRound =
            entry.repeatEveryRounds > 0 ? phaseRound + entry.repeatEveryRounds : entry.triggerRound;
          if (nextRemaining !== 0) {
            remainingQueue.push({
              ...entry,
              triggerRound: nextTriggerRound,
              remainingTriggers: nextRemaining
            });
          }
        }
      }

      await this._setDelayedEffectQueue(combat, remainingQueue);

      const renderedLines = resolvedEntries
        .map(({ entry, resolution }) => {
          if (!resolution) return "";
          const detail = `${resolution.detail ?? ""}`.trim() || game.i18n.localize("POKROLE.Common.None");
          return `<strong>${entry.moveName || entry.kind}</strong>: ${detail}`;
        })
        .filter(Boolean);
      if (renderedLines.length > 0) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: null }),
          content: `
            <div class="pok-role-chat-card arcade-red">
              <header class="chat-card-header">
                <h3>${
                  normalizedPhase === "round-start"
                    ? game.i18n.localize("POKROLE.Chat.DelayedEffect.RoundStart")
                    : game.i18n.localize("POKROLE.Chat.DelayedEffect.RoundEnd")
                }</h3>
              </header>
              <section class="chat-card-section">
                ${renderedLines.map((line) => `<p>${line}</p>`).join("")}
              </section>
            </div>
          `
        });
      }
      return resolvedEntries;
    } finally {
      DELAYED_EFFECT_PROCESS_LOCKS.delete(lockKey);
    }
  }

  _getSecondaryEffectSignature(effect = {}) {
    return JSON.stringify([
      Math.max(Math.floor(toNumber(effect?.section, 0)), 0),
      `${effect?.label ?? ""}`.trim(),
      `${effect?.trigger ?? "on-hit"}`.trim().toLowerCase(),
      Math.max(Math.floor(toNumber(effect?.chance, 0)), 0),
      `${effect?.target ?? "target"}`.trim().toLowerCase(),
      `${effect?.effectType ?? "custom"}`.trim().toLowerCase(),
      `${effect?.condition ?? "none"}`.trim().toLowerCase(),
      `${effect?.weather ?? "none"}`.trim().toLowerCase(),
      `${effect?.terrain ?? "none"}`.trim().toLowerCase(),
      `${effect?.stat ?? "none"}`.trim().toLowerCase(),
      Math.floor(toNumber(effect?.amount, 0)),
      `${effect?.durationMode ?? "manual"}`.trim().toLowerCase(),
      Math.max(Math.floor(toNumber(effect?.durationRounds, 1)), 1),
      Array.isArray(effect?.specialDuration)
        ? effect.specialDuration.map((value) => `${value ?? ""}`.trim().toLowerCase()).filter(Boolean)
        : [],
      Boolean(effect?.conditional),
      `${effect?.activationCondition ?? ""}`.trim().toLowerCase(),
      `${effect?.notes ?? ""}`.trim()
    ]);
  }

  async _postMultiTurnNotice(title, lines = []) {
    const contentLines = (Array.isArray(lines) ? lines : []).filter(Boolean);
    if (!title || contentLines.length <= 0) return;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card arcade-red">
          <header class="chat-card-header">
            <h3>${title}</h3>
          </header>
          <section class="chat-card-section">
            ${contentLines.map((line) => `<p>${line}</p>`).join("")}
          </section>
        </div>
      `
    });
  }

  _resolveChargeMoveProfile(move) {
    const seedId = this._getMoveSeedId(move);
    const override = CHARGE_MOVE_PROFILE_OVERRIDES[seedId] ?? {};
    const activeWeather = this.getActiveWeatherKey();
    const heldItem = this._getHeldItemData();
    let totalChargeActions = Math.max(Math.floor(toNumber(override.baseChargeActions, 1)), 1);
    let skipReason = "";

    if (
      Array.isArray(override.skipChargeWeather) &&
      override.skipChargeWeather.includes(activeWeather)
    ) {
      totalChargeActions = 0;
      skipReason = "weather";
    } else if (
      Array.isArray(override.extraChargeWeather) &&
      override.extraChargeWeather.includes(activeWeather)
    ) {
      totalChargeActions = Math.max(
        Math.floor(toNumber(override.extraChargeActions, totalChargeActions + 1)),
        totalChargeActions
      );
    }

    const consumesPowerHerb = !skipReason && Boolean(heldItem?.powerHerb);
    if (consumesPowerHerb) {
      totalChargeActions = 0;
      skipReason = "power-herb";
    }

    return {
      seedId,
      activeWeather,
      totalChargeActions,
      skipReason,
      consumesPowerHerb
    };
  }

  _getSpecialChargeMoveRule(move) {
    const seedId = typeof move === "string" ? `${move}`.trim().toLowerCase() : this._getMoveSeedId(move);
    return SPECIAL_CHARGE_MOVE_RULES[seedId] ?? null;
  }

  _parseWeightKg(value) {
    const normalized = `${value ?? ""}`.replace(",", ".").trim();
    const match = normalized.match(/-?\d+(?:\.\d+)?/);
    return match ? Math.max(toNumber(match[0], 0), 0) : 0;
  }

  _getLiftingCapacityKg() {
    const strength = clamp(Math.floor(toNumber(this.getTraitValue("strength"), 0)), 0, STRENGTH_LIFTING_CAPACITY_KG.length - 1);
    const athletic = Math.max(Math.floor(toNumber(this.getTraitValue("athletic"), 0)), 0);
    const baseCapacity = STRENGTH_LIFTING_CAPACITY_KG[strength] ?? STRENGTH_LIFTING_CAPACITY_KG.at(-1) ?? 0;
    return baseCapacity + (athletic * 4);
  }

  _canCarryTargetWithSkyDrop(targetActor) {
    if (!(targetActor instanceof PokRoleActor)) return true;
    if (targetActor.hasType("flying")) return false;
    const targetWeight = this._parseWeightKg(targetActor.system?.weight);
    if (targetWeight <= 0) return true;
    return targetWeight <= this._getLiftingCapacityKg();
  }

  _getSkyDropCarrierState() {
    if (!game.combat || !this.id) return null;
    for (const combatant of game.combat.combatants ?? []) {
      const carrier = combatant?.actor;
      if (!(carrier instanceof PokRoleActor) || carrier.id === this.id) continue;
      const state = carrier._getMultiTurnState();
      if (state.mode !== "charge" || !state.outOfRange) continue;
      const rule = carrier._getSpecialChargeMoveRule(state.moveSeedId);
      if (!rule?.carriesTargets) continue;
      if (!Array.isArray(state.carriedTargetIds) || !state.carriedTargetIds.includes(this.id)) continue;
      return {
        carrier,
        state,
        rule
      };
    }
    return null;
  }

  _getChargeRangeProtectionState() {
    const ownState = this._getMultiTurnState();
    if (ownState.mode === "charge" && ownState.outOfRange) {
      const ownRule = this._getSpecialChargeMoveRule(ownState.moveSeedId);
      if (ownRule?.outOfRange) {
        return {
          ownerActor: this,
          sourceActor: this,
          state: ownState,
          rule: ownRule
        };
      }
    }

    const carrierState = this._getSkyDropCarrierState();
    if (carrierState) {
      return {
        ownerActor: carrierState.carrier,
        sourceActor: carrierState.carrier,
        state: carrierState.state,
        rule: carrierState.rule
      };
    }

    return null;
  }

  _canMoveHitOutOfRangeTarget(move, protectionState = null, attackerActor = null) {
    if (!protectionState?.rule?.outOfRange) return true;

    const attackSeedId = this._getMoveSeedId(move);
    if (!attackSeedId) return false;

    const sourceActor = protectionState.sourceActor ?? null;
    const protectedState = protectionState.state ?? {};
    if (
      attackerActor &&
      sourceActor &&
      attackerActor.id === sourceActor.id &&
      protectedState.moveId &&
      protectedState.moveId === move?.id
    ) {
      return true;
    }

    const vulnerableMoveSeedIds = Array.isArray(protectionState.state?.vulnerableMoveSeedIds)
      ? protectionState.state.vulnerableMoveSeedIds
      : Array.isArray(protectionState.rule?.vulnerableTo)
        ? protectionState.rule.vulnerableTo
        : [];
    return vulnerableMoveSeedIds.includes(attackSeedId);
  }

  _partitionTargetsByChargeRange(move, targetActors = []) {
    const reachableTargets = [];
    const blockedTargets = [];

    for (const actor of Array.isArray(targetActors) ? targetActors : []) {
      if (!(actor instanceof PokRoleActor)) {
        reachableTargets.push(actor);
        continue;
      }

      const protectionState = actor._getChargeRangeProtectionState();
      if (!protectionState || actor._canMoveHitOutOfRangeTarget(move, protectionState, this)) {
        reachableTargets.push(actor);
        continue;
      }

      blockedTargets.push({
        actor,
        moveName: protectionState.state?.moveName || game.i18n.localize("POKROLE.Common.Unknown"),
        sourceName: protectionState.sourceActor?.name || actor.name
      });
    }

    return {
      reachableTargets,
      blockedTargets
    };
  }

  async _applyShadowForceHealingBlock(targetActor, move) {
    const specialRule = this._getSpecialChargeMoveRule(move);
    const healingBlockHours = Math.max(toNumber(specialRule?.healingBlockHours, 0), 0);
    if (!(targetActor instanceof PokRoleActor) || healingBlockHours <= 0) return;
    await targetActor.setFlag(POKROLE.ID, HEALING_BLOCK_FLAG_KEY, Date.now() + (healingBlockHours * 60 * 60 * 1000));
  }

  _getHealingBlockExpiration() {
    const expiration = toNumber(this.getFlag(POKROLE.ID, HEALING_BLOCK_FLAG_KEY), 0);
    if (!Number.isFinite(expiration) || expiration <= 0) return 0;
    if (Date.now() >= expiration) return 0;
    return expiration;
  }

  async _clearHealingBlockIfExpired() {
    const expiration = toNumber(this.getFlag(POKROLE.ID, HEALING_BLOCK_FLAG_KEY), 0);
    if (Number.isFinite(expiration) && expiration > 0 && Date.now() >= expiration) {
      await this.unsetFlag(POKROLE.ID, HEALING_BLOCK_FLAG_KEY);
      return 0;
    }
    return expiration > 0 ? expiration : 0;
  }

  async _handleChargeMoveHitWhileCharging({ attackMove, attackerActor, isDamagingMove = false, landed = false } = {}) {
    if (!landed) return null;
    const state = this._getMultiTurnState();
    if (state.mode !== "charge") return null;

    const rule = this._getSpecialChargeMoveRule(state.moveSeedId);
    if (!rule) return null;

    const attackCategory = this._normalizeMoveCombatCategory(attackMove?.system?.category);
    const isRangedAttack = this._isMoveRanged(attackMove);
    const results = [];

    if (
      rule.punishOnHit &&
      (!rule.punishOnHit.requiresDamagingMove || isDamagingMove) &&
      (!rule.punishOnHit.requiresPhysicalContact || (attackCategory === "physical" && !isRangedAttack))
    ) {
      await attackerActor?.toggleQuickCondition?.(rule.punishOnHit.condition, { active: true });
      results.push({
        type: "punish",
        detail: game.i18n.format("POKROLE.Chat.MultiTurn.BeakBlastPunish", {
          attacker: attackerActor?.name ?? game.i18n.localize("POKROLE.Common.Unknown"),
          target: this.name
        })
      });
    }

    if (
      rule.interruptOnHit &&
      (!rule.interruptOnHit.requiresDamagingMove || isDamagingMove)
    ) {
      await this.toggleQuickCondition(rule.interruptOnHit.condition, { active: true });
      await this.clearMultiTurnState();
      results.push({
        type: "interrupt",
        detail: game.i18n.format("POKROLE.Chat.MultiTurn.FocusPunchInterrupted", {
          actor: this.name
        })
      });
    }

    return results;
  }

  _getChargeStartSecondaryEffects(move, effectList = []) {
    const seedId = this._getMoveSeedId(move);
    if (!CHARGE_START_EFFECT_SEED_IDS.has(seedId)) return [];
    return (Array.isArray(effectList) ? effectList : []).filter((effect) => {
      const effectType = this._normalizeSecondaryEffectType(effect?.effectType);
      const targetMode = `${effect?.target ?? "target"}`.trim().toLowerCase();
      return targetMode === "self" && ["stat", "combat-stat"].includes(effectType);
    });
  }

  async _applyChargeStartEffects(move, effectList = [], roundKey = null) {
    const chargeStartEffects = this._getChargeStartSecondaryEffects(move, effectList);
    if (chargeStartEffects.length <= 0) {
      return {
        results: [],
        skipSignatures: []
      };
    }

    const effectResults = await this._applyMoveSecondaryEffects({
      move,
      moveTargetKey: "self",
      secondaryEffects: chargeStartEffects,
      targetActors: [this],
      hit: true,
      isDamagingMove: false,
      finalDamage: 0,
      damageTargetResults: [],
      roundKey
    });

    return {
      results: effectResults,
      skipSignatures: chargeStartEffects.map((effect) => this._getSecondaryEffectSignature(effect))
    };
  }

  async _consumePendingRechargeAction() {
    const state = this._getMultiTurnState();
    const currentRound = Math.max(Math.floor(toNumber(game.combat?.round, 0)), 0);
    if (
      state.mode !== "recharge" ||
      !game.combat ||
      !this._isCurrentCombatTurn() ||
      state.rechargeRound !== currentRound
    ) {
      return { processed: false };
    }

    const roundKey = this._getCurrentRoundKey(0);
    const currentActionNumber = await this._resolveActionRequirement(null, roundKey);
    if (currentActionNumber > 1) {
      await this.clearMultiTurnState();
      return { processed: false };
    }

    await this._advanceActionCounter(currentActionNumber, roundKey);
    await this.clearMultiTurnState();
    await this._postMultiTurnNotice(
      game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
      [
        game.i18n.format("POKROLE.Chat.MultiTurn.RechargeConsumed", {
          actor: this.name,
          move: state.moveName || game.i18n.localize("POKROLE.Common.Unknown")
        })
      ]
    );

    return { processed: true, moveName: state.moveName };
  }

  async _processMultiTurnTurnStart() {
    if (!game.combat || !this._isCurrentCombatTurn()) {
      return { processed: false };
    }

    return this._consumePendingRechargeAction();
  }

  async _resolveMultiTurnMovePreparation(move, context = {}) {
    const roundKey = context.roundKey ?? getCurrentCombatRoundKey();
    const actionNumber = clamp(toNumber(context.actionNumber, 1), 1, 5);
    const targetActors = Array.isArray(context.targetActors) ? context.targetActors : [];
    const moveTargetKey = this._normalizeMoveTargetKey(context.moveTargetKey ?? move?.system?.target);
    const secondaryEffects = Array.isArray(context.secondaryEffects)
      ? context.secondaryEffects
      : this._collectMoveSecondaryEffects(move);
    const activeState = this._getMultiTurnState();

    if (activeState.mode === "charge" && activeState.moveId === move?.id) {
      if (activeState.chargeActionsRemaining > 0) {
        const nextRemaining = Math.max(activeState.chargeActionsRemaining - 1, 0);
        await this._setMultiTurnState({
          ...activeState,
          chargeActionsRemaining: nextRemaining
        });
        if (context.advanceAction !== false) {
          await this._advanceActionCounter(actionNumber, roundKey);
        }
        await this._recordLastUsedMove(move);
        await this._postMultiTurnNotice(
          game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
          [
            game.i18n.format("POKROLE.Chat.MultiTurn.ChargeContinues", {
              actor: this.name,
              move: move.name,
              remaining: nextRemaining + 1
            })
          ]
        );
        return {
          handled: true,
          result: {
            charging: true,
            move,
            remainingChargeActions: nextRemaining
          }
        };
      }

      await this.clearMultiTurnState();
      return {
        handled: false,
        bypassLines: [
          game.i18n.format("POKROLE.Chat.MultiTurn.ChargeReleased", {
            actor: this.name,
            move: move.name
          })
        ],
        skipSecondaryEffectSignatures: new Set(activeState.chargeStartEffectSignatures)
      };
    }

    const sourceAttributes = this._getMoveSourceAttributes(move);
    if (!sourceAttributes?.charge) {
      return {
        handled: false,
        bypassLines: [],
        skipSecondaryEffectSignatures: new Set()
      };
    }

    const specialChargeRule = this._getSpecialChargeMoveRule(move);
    if (specialChargeRule?.carriesTargets) {
      const primaryTarget = targetActors[0] ?? null;
      if (primaryTarget instanceof PokRoleActor) {
        if (primaryTarget.hasType("flying")) {
          if (context.advanceAction !== false) {
            await this._advanceActionCounter(actionNumber, roundKey);
          }
          await this._recordLastUsedMove(move);
          await this._postMultiTurnNotice(
            game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
            [
              game.i18n.format("POKROLE.Chat.MultiTurn.SkyDropFailedFlying", {
                actor: this.name,
                target: primaryTarget.name
              })
            ]
          );
          return {
            handled: true,
            result: {
              failed: true,
              reason: "sky-drop-flying"
            }
          };
        }

        if (!this._canCarryTargetWithSkyDrop(primaryTarget)) {
          if (context.advanceAction !== false) {
            await this._advanceActionCounter(actionNumber, roundKey);
          }
          await this._recordLastUsedMove(move);
          await this._postMultiTurnNotice(
            game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
            [
              game.i18n.format("POKROLE.Chat.MultiTurn.SkyDropFailedHeavy", {
                actor: this.name,
                target: primaryTarget.name
              })
            ]
          );
          return {
            handled: true,
            result: {
              failed: true,
              reason: "sky-drop-heavy"
            }
          };
        }
      }
    }

    const chargeProfile = this._resolveChargeMoveProfile(move);
    const bypassLines = [];
    if (chargeProfile.skipReason === "weather") {
      bypassLines.push(
        game.i18n.format("POKROLE.Chat.MultiTurn.ChargeSkippedWeather", {
          actor: this.name,
          move: move.name,
          weather: this._localizeWeatherName(chargeProfile.activeWeather)
        })
      );
    }
    if (chargeProfile.skipReason === "power-herb") {
      await this.update({ "system.battleItem": "" });
      bypassLines.push(
        game.i18n.format("POKROLE.Chat.MultiTurn.ChargeSkippedPowerHerb", {
          actor: this.name,
          move: move.name
        })
      );
    }
    if (chargeProfile.totalChargeActions <= 0) {
      return {
        handled: false,
        bypassLines,
        skipSecondaryEffectSignatures: new Set()
      };
    }

    const chargeStartResult = await this._applyChargeStartEffects(move, secondaryEffects, roundKey);
    await this._setMultiTurnState({
      mode: "charge",
      moveId: move.id,
      moveName: move.name ?? "",
      moveUuid: move.uuid ?? "",
      moveSeedId: this._getMoveSeedId(move),
      targetMode: moveTargetKey,
      targetActorIds: targetActors.map((actor) => actor.id).filter(Boolean),
      carriedTargetIds: specialChargeRule?.carriesTargets ? targetActors.map((actor) => actor.id).filter(Boolean) : [],
      specialChargeState: `${specialChargeRule?.chargeState ?? "none"}`.trim().toLowerCase() || "none",
      outOfRange: Boolean(specialChargeRule?.outOfRange),
      vulnerableMoveSeedIds: Array.isArray(specialChargeRule?.vulnerableTo) ? specialChargeRule.vulnerableTo : [],
      chargeActionsRemaining: Math.max(chargeProfile.totalChargeActions - 1, 0),
      chargeStartEffectSignatures: chargeStartResult.skipSignatures,
      rampageUses: 0,
      rampageMaxUses: RAMPAGE_MAX_USES
    });
    if (context.advanceAction !== false) {
      await this._advanceActionCounter(actionNumber, roundKey);
    }
    if (options.skipLastUsedRecord !== true) {
      await this._recordLastUsedMove(move, {
        targetActors,
        moveTargetKey
      });
    }

    const chargeLines = [
      game.i18n.format("POKROLE.Chat.MultiTurn.ChargeStarted", {
        actor: this.name,
        move: move.name,
        actions: chargeProfile.totalChargeActions
      }),
      ...chargeStartResult.results
        .filter((entry) => entry?.detail)
        .map((entry) =>
          game.i18n.format("POKROLE.Chat.MultiTurn.ChargeStartEffect", {
            label: entry.label,
            detail: entry.detail
          })
        )
    ];
    await this._postMultiTurnNotice(
      game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
      chargeLines
    );

    return {
      handled: true,
      result: {
        charging: true,
        move,
        remainingChargeActions: Math.max(chargeProfile.totalChargeActions - 1, 0)
      }
    };
  }

  async _finalizeMultiTurnMoveResolution(move, result = {}, context = {}) {
    if (!game.combat || !move) return;

    const sourceAttributes = this._getMoveSourceAttributes(move);
    const currentRound = Math.max(Math.floor(toNumber(game.combat?.round, 0)), 0);
    const targetActorIds = Array.isArray(context?.targetActors)
      ? context.targetActors.map((actor) => actor?.id).filter(Boolean)
      : [];
    const moveTargetKey = this._normalizeMoveTargetKey(context?.moveTargetKey ?? move.system?.target);

    if (sourceAttributes?.mustRecharge && result?.hit) {
      await this._setMultiTurnState({
        mode: "recharge",
        moveId: move.id,
        moveName: move.name ?? "",
        moveUuid: move.uuid ?? "",
        targetMode: moveTargetKey,
        targetActorIds,
        rechargeRound: currentRound + 1
      });
      await this._postMultiTurnNotice(
        game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
        [
          game.i18n.format("POKROLE.Chat.MultiTurn.RechargeQueued", {
            actor: this.name,
            move: move.name
          })
        ]
      );
    }

    if (!sourceAttributes?.rampage) return;

    const activeState = this._getMultiTurnState();
    const nextUses =
      activeState.mode === "rampage" && activeState.moveId === move.id
        ? activeState.rampageUses + 1
        : 1;
    const maxUses =
      activeState.mode === "rampage" && activeState.moveId === move.id
        ? activeState.rampageMaxUses
        : RAMPAGE_MAX_USES;

    if (nextUses >= maxUses) {
      await this.clearMultiTurnState();
      await this.toggleQuickCondition("confused", { active: true });
      await this._postMultiTurnNotice(
        game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
        [
          game.i18n.format("POKROLE.Chat.MultiTurn.RampageEnded", {
            actor: this.name,
            move: move.name
          })
        ]
      );
      return;
    }

    await this._setMultiTurnState({
      mode: "rampage",
      moveId: move.id,
      moveName: move.name ?? "",
      moveUuid: move.uuid ?? "",
      targetMode: moveTargetKey,
      targetActorIds,
      rampageUses: nextUses,
      rampageMaxUses: maxUses
    });
    await this._postMultiTurnNotice(
      game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
      [
        game.i18n.format(
          nextUses <= 1
            ? "POKROLE.Chat.MultiTurn.RampageStarted"
            : "POKROLE.Chat.MultiTurn.RampageContinues",
          {
            actor: this.name,
            move: move.name,
            remaining: Math.max(maxUses - nextUses, 0)
          }
        )
      ]
    );
  }

  _getDisabledMoveRestriction(targetActor = this) {
    const actor = targetActor ?? this;
    const effectDocument = (actor?.effects?.contents ?? []).find((activeEffect) => {
      if (!activeEffect || activeEffect.disabled) return false;
      const automationFlags = activeEffect.getFlag?.(POKROLE.ID, "automation") ?? {};
      const effectType = `${automationFlags?.effectType ?? ""}`.trim().toLowerCase();
      const conditionKey = this._normalizeConditionKey(automationFlags?.conditionKey);
      return effectType === "move-disabled" || conditionKey === "disabled";
    });
    if (!effectDocument) return null;

    const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
    return {
      effectDocument,
      moveId: `${automationFlags?.disabledMoveId ?? ""}`.trim(),
      moveName:
        `${automationFlags?.disabledMoveName ?? ""}`.trim() || `${effectDocument?.name ?? ""}`.trim()
    };
  }

  async rollInitiative(options = {}) {
    if (!options.skipActionCheck) {
      await this.synchronizeConditionalActiveEffects();
      const actionCheck = await this._assertCanAct("initiative");
      if (!actionCheck.allowed) {
        ui.notifications.warn(actionCheck.reason);
        return null;
      }
    }
    const roll = await new Roll(POKROLE.INITIATIVE_FORMULA, {
      dexterity: this.getTraitValue("dexterity"),
      alert: this.getSkillValue("alert")
    }).evaluate();
    const baseInitiative = Math.max(toNumber(roll.total, 0), 0);
    const rolledInitiative = this._isConditionActive("paralyzed")
      ? Math.floor(baseInitiative / 2)
      : baseInitiative;
    await this.update({ "system.combat.initiative": rolledInitiative });

    const combat = game.combat ?? null;
    const combatant = combat?.combatants?.find?.((entry) => entry.actor?.id === this.id) ?? null;
    if (combatant && options.updateCombatant !== false) {
      await combatant.update({ initiative: rolledInitiative });
      if (typeof combat?.setupTurns === "function") {
        await combat.setupTurns();
      }
      if (options.setTurnOnRoll !== false) {
        const rankedTurns = Array.from(combat?.turns ?? []);
        let highestTurnIndex = rankedTurns.findIndex(
          (entry) => Boolean(entry) && !entry.defeated
        );
        if (highestTurnIndex < 0 && rankedTurns.length > 0) {
          highestTurnIndex = 0;
        }
        if (highestTurnIndex >= 0 && combat.turn !== highestTurnIndex) {
          await combat.update({ turn: highestTurnIndex });
        }
      }
    }

    if (!options.silent) {
      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: game.i18n.format("POKROLE.Chat.InitiativeFlavor", {
          actor: this.name,
          score: rolledInitiative
        })
      });
    }

    return roll;
  }

  async rollEvasion(actionNumber = null, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this._hasActiveBideState()) {
      ui.notifications.warn("Bide prevents Evasion and Clash until it resolves.");
      return null;
    }
    const actionCheck = await this._assertCanAct("evasion");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("evasion", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.EvasionAlreadyUsedThisRound"));
      return null;
    }

    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("dexterity") + this.getSkillValue("evasion"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.EvasionFlavor", {
        actor: this.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("evasion", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    return result;
  }

  async rollClash(moveId, actionNumber = null, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    if (this._hasActiveBideState()) {
      ui.notifications.warn("Bide prevents Evasion and Clash until it resolves.");
      return null;
    }
    const actionCheck = await this._assertCanAct("clash");
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }

    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!options.ignoreRoundLimit && !this._canUseReactionThisRound("clash", roundKey)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashAlreadyUsedThisRound"));
      return null;
    }

    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    const disabledMoveLock = this._getDisabledMoveRestriction();
    if (disabledMoveLock?.moveId && disabledMoveLock.moveId === move.id) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.ActorMoveDisabledSpecific", {
          move: disabledMoveLock.moveName || move.name
        })
      );
      return null;
    }
    if (!this._moveUsesPrimaryDamage(move)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.ClashNeedsDamagingMove"));
      return null;
    }
    const expectedCategory = this._normalizeMoveCombatCategory(options.expectedCategory);
    const moveCategory = this._normalizeMoveCombatCategory(move.system?.category);
    if (
      expectedCategory !== "support" &&
      moveCategory !== expectedCategory
    ) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.ClashNeedsMatchingCategory", {
          expected: game.i18n.localize(
            expectedCategory === "physical"
              ? "POKROLE.Move.Category.Physical"
              : "POKROLE.Move.Category.Special"
          ),
          actual: game.i18n.localize(
            moveCategory === "physical"
              ? "POKROLE.Move.Category.Physical"
              : moveCategory === "special"
                ? "POKROLE.Move.Category.Special"
                : "POKROLE.Move.Category.Support"
          )
        })
      );
      return null;
    }

    const normalizedAction = await this._resolveActionRequirement(actionNumber, roundKey);
    const damageBaseSetup = this._resolveMoveDamageBase(move, null, normalizedAction);
    const removedSuccesses = damageBaseSetup.ignoresPainPenalty ? 0 : this.getPainPenalty();

    const result = await this._rollSuccessPool({
      dicePool: damageBaseSetup.value + this.getSkillValue("clash"),
      removedSuccesses,
      requiredSuccesses: normalizedAction,
      flavor: game.i18n.format("POKROLE.Chat.ClashFlavor", {
        actor: this.name,
        move: move.name,
        required: normalizedAction
      })
    });

    if (!options.ignoreRoundLimit) {
      await this._markReactionUsedThisRound("clash", roundKey);
    }
    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    await this._recordLastUsedMove(move);

    return {
      ...result,
      move
    };
  }

  async _removeCombatantFromBattle(combat, combatant) {
    if (!combat || !combatant) return false;
    if (!game.user?.isGM) {
      const response = await this._requestCombatMutation("removeCombatantFromBattle", {
        combatId: combat.id ?? null,
        combatantId: combatant.id ?? null
      });
      return Boolean(response?.removed);
    }
    return this._removeCombatantFromBattleLocal(combat, combatant);
  }

  async _removeCombatantFromBattleLocal(combat, combatant) {
    if (!combat || !combatant) return false;
    const combatantId = `${combatant.id ?? ""}`.trim();
    if (!combatantId) return false;
    const wasCurrent =
      Number.isInteger(combat.turn) &&
      combat.turns?.[combat.turn]?.id === combatantId;
    await combat.deleteEmbeddedDocuments("Combatant", [combatantId]);
    if (typeof combat.setupTurns === "function") {
      await combat.setupTurns();
    }
    if (wasCurrent && (combat.turns?.length ?? 0) > 0) {
      const nextTurn = clamp(toNumber(combat.turn, 0), 0, Math.max((combat.turns?.length ?? 1) - 1, 0));
      await combat.update({ turn: nextTurn });
    }
    const dispositions = new Set(
      (combat.combatants ?? [])
        .map((entry) => this._getActorCombatSideDisposition(entry.actor, combat))
        .filter((value) => value !== 0)
    );
    if (dispositions.size <= 1 && combat.active !== false) {
      await combat.update({ active: false });
    }
    return true;
  }

  async _chooseReservePokemonForActor(actor = this, options = {}) {
    const combat = options.combat ?? game.combat;
    const candidates = this._getReserveSwitchCandidates(actor, combat);
    if (!candidates.length) return null;
    return this._promptActorChoice(
      options.title ?? `${game.i18n.localize("POKROLE.Trainer.PartySelect")}`,
      candidates,
      {
        label: options.label ?? game.i18n.localize("POKROLE.Trainer.PartySelect"),
        confirmLabel: options.confirmLabel ?? game.i18n.localize("POKROLE.Common.Submit")
      }
    );
  }

  async _transferBatonPassEffects(recipientActor) {
    const targetActor = recipientActor ?? null;
    if (!targetActor) return 0;
    const transferableEffects = (this.effects?.contents ?? []).filter((effectDocument) => {
      if (!effectDocument || effectDocument.disabled) return false;
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "modifier") return false;
      return Math.floor(toNumber(automationFlags?.amountApplied, 0)) > 0;
    });
    if (!transferableEffects.length) return 0;

    const clonedEffects = transferableEffects.map((effectDocument) => {
      const source = effectDocument.toObject();
      delete source._id;
      return source;
    });
    await targetActor.createEmbeddedDocuments("ActiveEffect", clonedEffects);
    const transferredIds = transferableEffects.map((effectDocument) => effectDocument.id).filter(Boolean);
    if (transferredIds.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", transferredIds);
    }
    await this.setFlag(POKROLE.ID, BATON_PASS_LOCK_FLAG_KEY, {
      recipientActorId: targetActor.id,
      roundKey: getCurrentCombatRoundKey(),
      sceneScoped: true
    });
    return clonedEffects.length;
  }

  async _applySelfSwitchRuntime(move, options = {}) {
    const combat = options.combat ?? game.combat;
    const runtimeRule = this._getSwitcherMoveRuntimeRule(move);
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!combat || !runtimeRule) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Errors.CombatRequired") };
    }
    const combatant = this._getCombatantForActor(this, combat);
    if (!combatant) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Errors.CombatRequired") };
    }
    const hpValue = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
    if (hpValue <= 0) {
      return { applied: false, detail: `${this.name} can not switch after fainting.` };
    }
    if (this._isActorSwitchLocked(this, { combat, includeForced: false })) {
      return { applied: false, detail: `${this.name} is trapped and can not switch.` };
    }
    const replacement = await this._chooseReservePokemonForActor(this, {
      combat,
      title: `${move.name}: choose replacement`
    });
    if (!replacement) {
      return { applied: false, detail: "No valid reserve Pokémon available." };
    }
    const newCombatant = await this._switchCombatantToActor(combat, combatant, replacement, {
      initiative: combatant.initiative
    });
    if (runtimeRule.passBuffs) {
      await this._transferBatonPassEffects(replacement);
    }
    if (runtimeRule.grantEntryReaction) {
      await this._grantEntryReactionBonus(replacement, roundKey);
    }
    return {
      applied: Boolean(newCombatant),
      detail: `${this.name} switched out for ${replacement.name}.`
    };
  }

  async _applyForcedSwitchRuntime(move, targetActor, options = {}) {
    const combat = options.combat ?? game.combat;
    if (!combat || !(targetActor instanceof PokRoleActor)) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Errors.CombatRequired") };
    }
    const targetCombatant = this._getCombatantForActor(targetActor, combat);
    if (!targetCombatant) {
      return { applied: false, detail: `${targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget")} is not active.` };
    }
    if (targetActor._isActorSwitchLocked?.(targetActor, { combat, includeForced: true })) {
      return { applied: false, detail: `${targetActor.name} is trapped and can not be forced out.` };
    }
    const replacement = await this._chooseReservePokemonForActor(targetActor, {
      combat,
      title: `${move.name}: choose replacement for ${targetActor.name}`
    });
    if (!replacement) {
      const removed = await this._removeCombatantFromBattle(combat, targetCombatant);
      return {
        applied: removed,
        detail: removed
          ? `${targetActor.name} was removed from battle.`
          : `No replacement available for ${targetActor.name}.`
      };
    }
    const newCombatant = await this._switchCombatantToActor(combat, targetCombatant, replacement, {
      initiative: targetCombatant.initiative
    });
    return {
      applied: Boolean(newCombatant),
      detail: `${targetActor.name} was forced out for ${replacement.name}.`
    };
  }

  async _applyAllySwitchRuntime(move, options = {}) {
    const combat = options.combat ?? game.combat;
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    if (!combat) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Errors.CombatRequired") };
    }
    const selfCombatant = this._getCombatantForActor(this, combat);
    if (!selfCombatant) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Errors.CombatRequired") };
    }
    const sideDisposition = this._getActorCombatSideDisposition(this, combat);
    const allyCombatants = (combat.combatants ?? []).filter((entry) =>
      entry.actor &&
      entry.actor.id !== this.id &&
      entry.actor.type === "pokemon" &&
      this._getActorCombatSideDisposition(entry.actor, combat) === sideDisposition
    );
    if (!allyCombatants.length) {
      return { applied: false, detail: "No active ally available to switch with." };
    }
    const allyActor = await this._promptActorChoice(`${move.name}: choose ally`, allyCombatants.map((entry) => entry.actor));
    if (!allyActor) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Cancel") };
    }
    const allyCombatant = this._getCombatantForActor(allyActor, combat);
    if (!allyCombatant) {
      return { applied: false, detail: `${allyActor.name} is not active.` };
    }
    const selfSlotId = await this._ensureCombatantBattleSlotId(selfCombatant);
    const allySlotId = await this._ensureCombatantBattleSlotId(allyCombatant);
    await selfCombatant.setFlag(POKROLE.ID, BATTLE_SLOT_FLAG_KEY, allySlotId);
    await allyCombatant.setFlag(POKROLE.ID, BATTLE_SLOT_FLAG_KEY, selfSlotId);
    const selfToken = selfCombatant.token?.object ?? selfCombatant.actor?.getActiveTokens?.(true)?.[0] ?? null;
    const allyToken = allyCombatant.token?.object ?? allyCombatant.actor?.getActiveTokens?.(true)?.[0] ?? null;
    if (selfToken?.document && allyToken?.document) {
      const selfPos = { x: selfToken.document.x, y: selfToken.document.y };
      const allyPos = { x: allyToken.document.x, y: allyToken.document.y };
      await selfToken.document.update(allyPos);
      await allyToken.document.update(selfPos);
    }
    await this._refundActionCounter(options.actionNumber ?? 1);
    await this._grantEntryReactionBonus(allyActor, roundKey);
    return {
      applied: true,
      detail: `${this.name} swapped places with ${allyActor.name}.`
    };
  }

  async _applySwitcherMoveRuntime(move, options = {}) {
    const runtimeRule = this._getSwitcherMoveRuntimeRule(move);
    if (!runtimeRule) return [];
    const hit = options.hit !== false;
    if (!hit) return [];
    if (runtimeRule.requiresHit && !hit) {
      return [{
        label: "Switch",
        targetName: game.i18n.localize("POKROLE.Common.None"),
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      }];
    }

    let applyResult = { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    switch (runtimeRule.kind) {
      case "ally-swap":
        applyResult = await this._applyAllySwitchRuntime(move, options);
        break;
      case "self-switch":
        applyResult = await this._applySelfSwitchRuntime(move, options);
        break;
      case "force-foe-switch":
        applyResult = await this._applyForcedSwitchRuntime(move, options.primaryTarget ?? null, options);
        break;
      case "substitute": {
        const selfDamage = await this._safeApplyDamage(this, 2, { applyDeadOnZero: false });
        const decoy = await this._createSubstituteDecoy(this, move);
        applyResult = {
          applied: Boolean(decoy),
          detail: decoy
            ? `${this.name} created a Substitute decoy after taking ${Math.max(toNumber(selfDamage?.hpBefore, 0) - toNumber(selfDamage?.hpAfter, 0), 0)} damage.`
            : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
        };
        break;
      }
      case "shed-tail": {
        const selfDamage = await this._safeApplyDamage(this, 2, { applyDeadOnZero: false });
        await this._createSubstituteDecoy(this, move);
        const switchResult = await this._applySelfSwitchRuntime(move, options);
        applyResult = {
          applied: switchResult.applied,
          detail: `${this.name} shed its tail for a decoy and took ${Math.max(toNumber(selfDamage?.hpBefore, 0) - toNumber(selfDamage?.hpAfter, 0), 0)} damage. ${switchResult.detail}`.trim()
        };
        break;
      }
      default:
        break;
    }

    return [{
      label: "Switch",
      targetName:
        options.primaryTarget?.name ??
        (runtimeRule.kind === "self-switch" || runtimeRule.kind === "substitute" || runtimeRule.kind === "shed-tail"
          ? this.name
          : game.i18n.localize("POKROLE.Common.None")),
      applied: Boolean(applyResult?.applied),
      detail: `${applyResult?.detail ?? game.i18n.localize("POKROLE.Common.None")}`.trim()
    }];
  }

  _getCombatDelayedEntries(combat = game.combat) {
    if (!combat) return [];
    const rawEntries = combat.getFlag(POKROLE.ID, DELAYED_EFFECTS_FLAG_KEY);
    return Array.isArray(rawEntries) ? rawEntries.filter((entry) => entry && typeof entry === "object") : [];
  }

  async _setCombatDelayedEntries(combat = game.combat, entries = []) {
    if (!combat) return [];
    const normalizedEntries = Array.isArray(entries) ? entries.filter((entry) => entry && typeof entry === "object") : [];
    await combat.setFlag(POKROLE.ID, DELAYED_EFFECTS_FLAG_KEY, normalizedEntries);
    return normalizedEntries;
  }

  _getCombatantForSlotId(slotId, combat = game.combat) {
    const normalizedSlotId = `${slotId ?? ""}`.trim();
    if (!combat || !normalizedSlotId) return null;
    return combat.combatants.find((entry) => this._getCombatantBattleSlotId(entry) === normalizedSlotId) ?? null;
  }

  _getActiveCombatantsForDisposition(disposition, combat = game.combat) {
    const normalizedDisposition = clamp(Math.sign(Math.trunc(toNumber(disposition, 0))), -1, 1);
    if (!combat || normalizedDisposition === 0) return [];
    return (combat.combatants ?? []).filter((entry) => {
      const actor = entry.actor;
      if (!actor || actor.type !== "pokemon") return false;
      if (actor._isConditionActive?.("dead") || actor._isConditionActive?.("fainted")) return false;
      return this._getActorCombatSideDisposition(actor, combat) === normalizedDisposition;
    });
  }

  async _scheduleDelayedEffectEntry(entry, combat = game.combat) {
    if (!combat || !entry || typeof entry !== "object") return null;
    const currentEntries = this._getCombatDelayedEntries(combat);
    const payload = {
      id: `${entry.id ?? foundry.utils.randomID()}`.trim() || foundry.utils.randomID(),
      ...entry
    };
    currentEntries.push(payload);
    await this._setCombatDelayedEntries(combat, currentEntries);
    return payload;
  }

  async _resolveDelayedEntryTargetActor(entry, combat = game.combat) {
    if (!combat || !entry) return null;
    const slotCombatant = this._getCombatantForSlotId(entry.targetSlotId, combat);
    if (slotCombatant?.actor) return slotCombatant.actor;
    const actorId = `${entry.targetActorId ?? ""}`.trim();
    if (actorId) {
      const actorCombatant = combat.combatants.find((candidate) => candidate.actor?.id === actorId) ?? null;
      if (actorCombatant?.actor) return actorCombatant.actor;
    }
    return null;
  }

  async _resolveDelayedRetargetActor(entry, combat = game.combat) {
    const candidates = this._getActiveCombatantsForDisposition(entry.targetSideDisposition, combat)
      .map((combatant) => combatant.actor)
      .filter((actor) => actor && actor.id !== `${entry.sourceActorId ?? ""}`.trim());
    if (!candidates.length) return null;
    return this._promptActorChoice(`${entry.moveName ?? "Delayed Effect"}: choose new target`, candidates);
  }

  async _queueDelayedMoveRuntime(move, options = {}) {
    const combat = options.combat ?? game.combat;
    const rule = this._getDelayedMoveRuntimeRule(move);
    if (!combat || !rule) return [];

    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    const sourceCombatant = this._getCombatantForActor(this, combat);
    const primaryTarget = options.primaryTarget ?? null;
    const targetCombatant = primaryTarget ? this._getCombatantForActor(primaryTarget, combat) : null;
    const sourceSlotId = sourceCombatant ? await this._ensureCombatantBattleSlotId(sourceCombatant) : null;
    const targetSlotId = targetCombatant ? await this._ensureCombatantBattleSlotId(targetCombatant) : null;
    const targetDisposition = primaryTarget ? this._getActorCombatSideDisposition(primaryTarget, combat) : 0;
    const baseEntry = {
      id: foundry.utils.randomID(),
      kind: rule.kind,
      moveId: move.id,
      moveSeedId: this._getMoveSeedId(move),
      moveName: move.name ?? "",
      sourceActorId: this.id,
      sourceCombatantId: sourceCombatant?.id ?? null,
      sourceSlotId,
      sourceSideDisposition: this._getActorCombatSideDisposition(this, combat),
      targetActorId: primaryTarget?.id ?? null,
      targetSlotId,
      targetSideDisposition: targetDisposition,
      triggerPhase: rule.triggerPhase,
      triggerRound: currentRound + Math.max(toNumber(rule.delayRounds, 0), 0),
      repeat: Boolean(rule.repeat),
      remainingTriggers: Number.isFinite(Number(rule.repeatRounds)) ? Math.max(Math.floor(toNumber(rule.repeatRounds, 0)), 0) : null,
      payload: {}
    };

    let resultDetail = "";
    switch (rule.kind) {
      case "delayed-hit":
        await this._scheduleDelayedEffectEntry(baseEntry, combat);
        resultDetail = `${move.name} will strike at the beginning of the next round.`;
        break;
      case "wish":
        await this._scheduleDelayedEffectEntry(baseEntry, combat);
        resultDetail = `${move.name} was scheduled for the beginning of the next round.`;
        break;
      case "yawn":
        await this._scheduleDelayedEffectEntry(baseEntry, combat);
        resultDetail = `${primaryTarget?.name ?? "Target"} will fall asleep next round if it remains in battle.`;
        break;
      case "round-end-field-damage":
        await this._scheduleDelayedEffectEntry({
          ...baseEntry,
          payload: {
            damageDice: rule.damageDice,
            damageType: rule.damageType,
            ignoreDefenses: Boolean(rule.ignoreDefenses)
          }
        }, combat);
        resultDetail = `${move.name} created a battlefield effect for ${Math.max(toNumber(rule.repeatRounds, 0), 0)} rounds.`;
        break;
      case "seed-drain":
        await this._scheduleDelayedEffectEntry({
          ...baseEntry,
          payload: {
            damageDice: rule.damageDice
          }
        }, combat);
        resultDetail = `${primaryTarget?.name ?? "Target"} was seeded for round-end damage.`;
        break;
      case "malignant-chain": {
        const targetActor = primaryTarget instanceof PokRoleActor ? primaryTarget : null;
        let poisonApplied = false;
        let poisonDetail = game.i18n.localize("POKROLE.Common.None");
        if (targetActor) {
          const chanceRoll = await new Roll("5d6").evaluate();
          const chanceResults = chanceRoll.dice.flatMap((die) =>
            Array.isArray(die?.results) ? die.results.map((result) => Math.floor(toNumber(result?.result, 0))) : []
          );
          poisonApplied = chanceResults.some((result) => result === 6);
          poisonDetail = poisonApplied
            ? `Badly Poisoned (${chanceResults.join(", ")})`
            : `Chance failed (${chanceResults.join(", ")})`;
          if (poisonApplied) {
            await targetActor.toggleQuickCondition("badly-poisoned", { active: true });
            await this._scheduleDelayedEffectEntry(baseEntry, combat);
          }
        }
        resultDetail = poisonDetail;
        break;
      }
      case "grudge": {
        if (primaryTarget instanceof PokRoleActor) {
          await primaryTarget.update({ "system.resources.will.value": 0 });
          const selfHp = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
          if (selfHp > 0) {
            await this._safeApplyDamage(this, selfHp, { applyDeadOnZero: false });
          }
          await this._scheduleDelayedEffectEntry({
            ...baseEntry,
            payload: {
              difficulty: 1
            }
          }, combat);
          resultDetail = `${primaryTarget.name}'s Will dropped to 0 and the grudge will check at round end.`;
        }
        break;
      }
      default:
        break;
    }

    return [{
      label: "Delayed",
      targetName: primaryTarget?.name ?? this.name,
      applied: Boolean(resultDetail),
      detail: resultDetail || game.i18n.localize("POKROLE.Common.None")
    }];
  }

  async _executeDelayedHitEntry(entry, combat = game.combat) {
    const move = this.items.get(entry.moveId) ?? game.items.get(entry.moveId) ?? null;
    if (!move) {
      return { keep: false, detail: `${entry.moveName ?? "Delayed move"} could not be resolved.` };
    }
    let targetActor = await this._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor)) {
      targetActor = await this._resolveDelayedRetargetActor(entry, combat);
      if (!targetActor) {
        return { keep: false, detail: `${entry.moveName ?? "Delayed move"} lost its target.` };
      }
      entry.targetActorId = targetActor.id;
      const retargetCombatant = this._getCombatantForActor(targetActor, combat);
      entry.targetSlotId = retargetCombatant ? await this._ensureCombatantBattleSlotId(retargetCombatant) : null;
    }

    const damageResult = await this._resolveMoveDamageAgainstTarget({
      move,
      targetActor,
      painPenalty: this.getPainPenalty(),
      critical: false,
      isHoldingBackHalf: false,
      canInflictDeathOnKo: false,
      actionNumber: 1,
      roundKey: getCurrentCombatRoundKey(),
      attackOverrides: {
        ignoreShield: true,
        ignoreCover: true,
        ignoreSubstitute: true
      }
    });
    return {
      keep: false,
      detail: `${entry.moveName} hit ${targetActor.name} for ${Math.max(toNumber(damageResult?.finalDamage, 0), 0)} damage.`
    };
  }

  async _executeWishEntry(entry, combat = game.combat) {
    const targetActor = await this._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor)) {
      return { keep: false, detail: "Wish had no valid target." };
    }
    const healAmount = 3;
    const healResult = await this._safeApplyHeal(targetActor, healAmount, {
      healingCategory: "basic"
    });
    return {
      keep: false,
      detail: `Wish healed ${targetActor.name} for ${Math.max(toNumber(healResult?.healedApplied, 0), 0)} HP.`
    };
  }

  async _executeYawnEntry(entry, combat = game.combat) {
    const targetActor = await this._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor) || targetActor.id !== `${entry.targetActorId ?? ""}`.trim()) {
      return { keep: false, detail: "Yawn failed because the original target left battle." };
    }
    await targetActor.toggleQuickCondition("sleep", { active: true });
    return {
      keep: false,
      detail: `${targetActor.name} fell asleep.`
    };
  }

  async _executeFirePledgeEntry(entry, combat = game.combat) {
    const damageDice = Math.max(Math.floor(toNumber(entry?.payload?.damageDice, 2)), 0);
    const damageType = this._normalizeTypeKey(entry?.payload?.damageType || "fire");
    const summaries = [];
    for (const combatant of combat?.combatants ?? []) {
      const targetActor = combatant.actor;
      if (!(targetActor instanceof PokRoleActor)) continue;
      if (targetActor._isConditionActive?.("dead") || targetActor._isConditionActive?.("fainted")) continue;
      const interaction = this._evaluateTypeInteraction(damageType, targetActor);
      if (interaction.immune) continue;
      const damageRoll = await new Roll(successPoolFormula(damageDice)).evaluate();
      const damage = Math.max(toNumber(damageRoll.total, 0), 0);
      if (damage > 0) {
        await this._safeApplyDamage(targetActor, damage, { applyDeadOnZero: false });
      }
      summaries.push(`${targetActor.name} -${damage}`);
    }
    const remainingTriggers = entry.remainingTriggers === null ? null : Math.max(toNumber(entry.remainingTriggers, 0) - 1, 0);
    return {
      keep: remainingTriggers === null ? true : remainingTriggers > 0,
      entry: {
        ...entry,
        remainingTriggers
      },
      detail: summaries.join(" | ") || game.i18n.localize("POKROLE.Common.None")
    };
  }

  async _executeSeedDrainEntry(entry, combat = game.combat) {
    const sourceActor = game.actors.get(`${entry.sourceActorId ?? ""}`.trim()) ?? this;
    const targetActor = await sourceActor._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor) || !(sourceActor instanceof PokRoleActor)) {
      return { keep: false, detail: "Sappy Seed ended because source or target left battle." };
    }
    const damageDice = Math.max(Math.floor(toNumber(entry?.payload?.damageDice, 2)), 0);
    const roll = await new Roll(successPoolFormula(damageDice)).evaluate();
    const damage = Math.max(toNumber(roll.total, 0), 0);
    if (damage > 0) {
      await sourceActor._safeApplyDamage(targetActor, damage, { applyDeadOnZero: false });
      await sourceActor._safeApplyHeal(sourceActor, damage, { healingCategory: "basic" });
    }
    return {
      keep: true,
      entry,
      detail: `${targetActor.name} lost ${damage} HP and ${sourceActor.name} recovered ${damage} HP.`
    };
  }

  async _executeMalignantChainEntry(entry, combat = game.combat) {
    const targetActor = await this._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor)) {
      return { keep: false, detail: "Malignant Chain ended because the target left battle." };
    }
    if (!targetActor._isConditionActive?.("badly-poisoned")) {
      const targetCombatant = this._getCombatantForActor(targetActor, combat);
      if (targetCombatant) {
        await targetCombatant.unsetFlag(POKROLE.ID, "forcedDisposition");
      }
      return { keep: false, detail: "Malignant Chain ended because the poison was healed." };
    }
    const loyaltyDice = Math.max(toNumber(targetActor.system?.loyalty, 0), 0);
    const roll = await new Roll(successPoolFormula(Math.max(loyaltyDice, 1))).evaluate();
    const successes = Math.max(toNumber(roll.total, 0), 0);
    const targetCombatant = this._getCombatantForActor(targetActor, combat);
    if (successes < 3 && targetCombatant) {
      await targetCombatant.setFlag(POKROLE.ID, "forcedDisposition", entry.sourceSideDisposition);
      return {
        keep: true,
        entry,
        detail: `${targetActor.name} failed the Malignant Chain loyalty check and changed sides.`
      };
    }
    return {
      keep: true,
      entry,
      detail: `${targetActor.name} resisted Malignant Chain (${successes} successes).`
    };
  }

  async _executeGrudgeEntry(entry, combat = game.combat) {
    const targetActor = await this._resolveDelayedEntryTargetActor(entry, combat);
    if (!(targetActor instanceof PokRoleActor)) {
      return { keep: false, detail: "Grudge ended because the target left battle." };
    }
    const difficulty = Math.max(Math.floor(toNumber(entry?.payload?.difficulty, 1)), 1);
    const loyaltyDice = Math.max(Math.floor(toNumber(targetActor.system?.loyalty, 0)), 1);
    const roll = await new Roll(successPoolFormula(loyaltyDice)).evaluate();
    const successes = Math.max(toNumber(roll.total, 0), 0);
    if (successes < difficulty) {
      const hpValue = Math.max(toNumber(targetActor.system?.resources?.hp?.value, 0), 0);
      if (hpValue > 0) {
        await this._safeApplyDamage(targetActor, hpValue, { applyDeadOnZero: false });
      }
      return {
        keep: false,
        detail: `${targetActor.name} succumbed to Grudge.`
      };
    }
    return {
      keep: true,
      entry: {
        ...entry,
        payload: {
          ...(entry.payload ?? {}),
          difficulty: difficulty + 1
        }
      },
      detail: `${targetActor.name} endured the Grudge check (${successes} successes).`
    };
  }

  async _processDelayedEffectEntry(entry, phase, combat = game.combat) {
    const normalizedPhase = `${phase ?? ""}`.trim().toLowerCase();
    if (!entry || `${entry.triggerPhase ?? ""}`.trim().toLowerCase() !== normalizedPhase) {
      return { keep: true, entry };
    }
    const currentRound = Math.max(Math.floor(toNumber(combat?.round, 0)), 0);
    if (currentRound < Math.max(Math.floor(toNumber(entry?.triggerRound, 0)), 0)) {
      return { keep: true, entry };
    }
    switch (`${entry.kind ?? ""}`.trim().toLowerCase()) {
      case "delayed-hit":
        return this._executeDelayedHitEntry(entry, combat);
      case "wish":
        return this._executeWishEntry(entry, combat);
      case "yawn":
        return this._executeYawnEntry(entry, combat);
      case "round-end-field-damage":
        return this._executeFirePledgeEntry(entry, combat);
      case "seed-drain":
        return this._executeSeedDrainEntry(entry, combat);
      case "malignant-chain":
        return this._executeMalignantChainEntry(entry, combat);
      case "grudge":
        return this._executeGrudgeEntry(entry, combat);
      default:
        return { keep: false, detail: `${entry.moveName ?? "Delayed effect"} is unsupported.` };
    }
  }

  _getCombatMoveQueueEntries(combat = game.combat) {
    if (!combat) return [];
    const rawQueue = combat.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.MOVE_QUEUE);
    return (Array.isArray(rawQueue) ? rawQueue : []).map((entry, index) => ({
      id: `${entry?.id ?? foundry.utils.randomID()}`.trim() || foundry.utils.randomID(),
      actorId: `${entry?.actorId ?? ""}`.trim(),
      combatantId: `${entry?.combatantId ?? ""}`.trim(),
      moveId: `${entry?.moveId ?? ""}`.trim(),
      moveName: `${entry?.moveName ?? ""}`.trim(),
      targetActorIds: Array.isArray(entry?.targetActorIds)
        ? [...new Set(entry.targetActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
        : [],
      targetMode: this._normalizeMoveTargetKey(entry?.targetMode),
      declaredRound: Math.max(Math.floor(toNumber(entry?.declaredRound, Math.floor(toNumber(combat.round, 0)))), 0),
      declaredAt: Math.max(Math.floor(toNumber(entry?.declaredAt, Date.now() + index)), 0)
    }));
  }

  _getQueuedMoveEntryForActor(actor, combat = game.combat) {
    const actorId = `${actor?.id ?? ""}`.trim();
    if (!combat || !actorId) return null;
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    return this._getCombatMoveQueueEntries(combat)
      .filter((entry) => entry.actorId === actorId && entry.declaredRound === currentRound && entry.moveId)
      .sort((left, right) => left.declaredAt - right.declaredAt)[0] ?? null;
  }

  _getRecordedMoveDocument(actor, record = {}) {
    const moveId = `${record?.moveId ?? ""}`.trim();
    if (!actor || !moveId) return null;
    const directItem = actor.items?.get(moveId) ?? null;
    if (directItem?.type === "move") return directItem;
    return null;
  }

  _canResolveCopiedMoveDocument(moveDocument, options = {}) {
    if (!moveDocument || moveDocument.type !== "move") {
      return game.i18n.localize("POKROLE.Errors.UnknownMove");
    }
    const sourceAttributes = this._getMoveSourceAttributes(moveDocument);
    if (sourceAttributes?.unique) {
      return "Unique moves cannot be copied.";
    }
    if (sourceAttributes?.copyMove) {
      return "Moves that copy other moves cannot be copied again.";
    }
    if (options.disallowSupport && this._normalizeMoveCombatCategory(moveDocument.system?.category) === "support") {
      return "Support moves cannot be copied here.";
    }
    return "";
  }

  async _executeTemporaryCopiedMove(copiedMove, options = {}) {
    if (!copiedMove || copiedMove.type !== "move") return null;
    const tempData = copiedMove.toObject();
    delete tempData._id;
    tempData.name = copiedMove.name;
    tempData.img = copiedMove.img;
    tempData.flags ??= {};
    tempData.flags[POKROLE.ID] = {
      ...(tempData.flags?.[POKROLE.ID] ?? {}),
      temporaryCopiedMoveExecution: true
    };
    const [temporaryMove] = await this.createEmbeddedDocuments("Item", [tempData]);
    if (!temporaryMove) return null;
    try {
      return await this.rollMove(temporaryMove.id, {
        targetActorIds: Array.isArray(options?.targetActorIds) ? options.targetActorIds : [],
        roundKey: options?.roundKey ?? getCurrentCombatRoundKey(),
        actionNumber: options?.actionNumber ?? null,
        advanceAction: false,
        skipActionCheck: true,
        skipLastUsedRecord: true,
        executeFromCopy: true
      });
    } finally {
      await this.deleteEmbeddedDocuments("Item", [temporaryMove.id]);
    }
  }

  async _replaceMoveWithCopiedMove(sourceMove, copiedMove, options = {}) {
    if (!sourceMove?.id || !copiedMove || copiedMove.type !== "move") return false;
    const copiedData = copiedMove.toObject();
    const updateData = {
      name: copiedData.name,
      img: copiedData.img,
      system: copiedData.system,
      [`flags.${POKROLE.ID}.seedId`]: this._getMoveSeedId(copiedMove),
      [`flags.${POKROLE.ID}.sourceDbId`]:
        foundry.utils.getProperty(copiedData, `flags.${POKROLE.ID}.sourceDbId`) ?? null,
      [`flags.${POKROLE.ID}.automationStatus`]:
        foundry.utils.getProperty(copiedData, `flags.${POKROLE.ID}.automationStatus`) ?? null,
      [`flags.${POKROLE.ID}.automationReasons`]:
        foundry.utils.getProperty(copiedData, `flags.${POKROLE.ID}.automationReasons`) ?? [],
      [`flags.${POKROLE.ID}.sourceAttributes`]:
        foundry.utils.getProperty(copiedData, `flags.${POKROLE.ID}.sourceAttributes`) ?? {}
    };
    if (options.temporarySceneScoped) {
      updateData[`flags.${POKROLE.ID}.${TEMPORARY_COPIED_MOVE_FLAG_KEY}`] = {
        sceneId: `${canvas?.scene?.id ?? ""}`.trim(),
        originalData: sourceMove.toObject()
      };
    } else {
      updateData[`flags.${POKROLE.ID}.${TEMPORARY_COPIED_MOVE_FLAG_KEY}`] = null;
    }
    await sourceMove.update(updateData);
    return true;
  }

  async clearSceneScopedCopiedMoves(currentSceneId = null) {
    const normalizedSceneId = `${currentSceneId ?? canvas?.scene?.id ?? ""}`.trim();
    if (!normalizedSceneId) return 0;
    let restored = 0;
    for (const move of this.items?.contents ?? []) {
      if (move?.type !== "move") continue;
      const temporaryCopy = move.getFlag?.(POKROLE.ID, TEMPORARY_COPIED_MOVE_FLAG_KEY) ?? null;
      const storedSceneId = `${temporaryCopy?.sceneId ?? ""}`.trim();
      const originalData = temporaryCopy?.originalData ?? null;
      if (!storedSceneId || storedSceneId === normalizedSceneId || !originalData || typeof originalData !== "object") {
        continue;
      }
      const restoredData = foundry.utils.deepClone(originalData);
      delete restoredData._id;
      await move.update({
        name: restoredData.name,
        img: restoredData.img,
        system: restoredData.system,
        flags: restoredData.flags ?? {}
      });
      restored += 1;
    }
    return restored;
  }

  _getHealingWishCandidates(options = {}) {
    const includeFainted = options.includeFainted === true;
    const trainer = this._getTrainerActorForPokemon(this);
    if (!trainer) return [];
    const partyIds = Array.isArray(trainer.system?.party) ? trainer.system.party : [];
    return partyIds
      .map((actorId) => game.actors.get(actorId))
      .filter((actor) => {
        if (!actor || actor.type !== "pokemon" || actor.id === this.id) return false;
        if (actor._isConditionActive?.("dead")) return false;
        if (!includeFainted && actor._isConditionActive?.("fainted")) return false;
        return true;
      });
  }

  _getDestinyBondState() {
    const rawState = this.getFlag(POKROLE.ID, DESTINY_BOND_STATE_FLAG_KEY) ?? {};
    return {
      activeRound: Math.max(Math.floor(toNumber(rawState?.activeRound, 0)), 0),
      lastUsedRound: Math.max(Math.floor(toNumber(rawState?.lastUsedRound, 0)), 0)
    };
  }

  async _setDestinyBondState(state = {}) {
    await this.setFlag(POKROLE.ID, DESTINY_BOND_STATE_FLAG_KEY, {
      activeRound: Math.max(Math.floor(toNumber(state?.activeRound, 0)), 0),
      lastUsedRound: Math.max(Math.floor(toNumber(state?.lastUsedRound, 0)), 0)
    });
  }

  _getSpecialSupportMoveFailureReason(move) {
    const seedId = this._getMoveSeedId(move);
    if (seedId === "move-destiny-bond" && game.combat) {
      const currentRound = Math.max(Math.floor(toNumber(game.combat.round, 0)), 0);
      const state = this._getDestinyBondState();
      if (state.lastUsedRound > 0 && state.lastUsedRound === currentRound - 1) {
        return "Destiny Bond fails if it was used in the previous round.";
      }
    }
    return "";
  }

  _isDedicatedReactionMove(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId === "move-clash" || seedId === "move-evasion";
  }

  _moveCanBeClashed(move) {
    const seedId = this._getMoveSeedId(move);
    return seedId !== "move-judgment";
  }

  _moveIgnoresDamagePrevention(move) {
    return this._getMoveSeedId(move) === "move-judgment";
  }

  async _promptFlingBonusDice(move, heldItemName = "") {
    const defaultBonus = clamp(
      Math.max(Math.floor(toNumber(this._getHeldItemData()?.damageBonusDice, 0)), 0),
      0,
      4
    );
    const result = await foundry.applications.api.DialogV2.wait({
      window: {
        title: `${move?.name ?? game.i18n.localize("POKROLE.Common.Unknown")}`
      },
      content: `
        <form>
          <div class="form-group">
            <label>Held Item</label>
            <div class="form-fields">
              <span>${heldItemName || game.i18n.localize("POKROLE.Common.None")}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Bonus damage dice (0-4)</label>
            <div class="form-fields">
              <input type="number" name="bonusDice" min="0" max="4" step="1" value="${defaultBonus}" />
            </div>
          </div>
        </form>
      `,
      buttons: [
        {
          action: "confirm",
          label: game.i18n.localize("POKROLE.Common.Submit"),
          callback: (event, button) => button.form?.elements?.bonusDice?.value ?? `${defaultBonus}`
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel")
        }
      ]
    });
    if (result === null || result === undefined) return null;
    return clamp(Math.floor(toNumber(result, defaultBonus)), 0, 4);
  }

  async _consumeHeldBattleItem() {
    if (this.type !== "pokemon") return false;
    const battleItemId = `${this.system?.battleItem ?? ""}`.trim();
    if (!battleItemId) return false;
    let item = game.items.get(battleItemId);
    if (!item) item = this.items.get(battleItemId);
    if (!item || item.type !== "gear") return false;
    const currentQty = Math.max(Math.floor(toNumber(item.system?.quantity, 1)), 1);
    if (currentQty > 1) {
      await item.update({ "system.quantity": currentQty - 1 });
    } else {
      await this.update({ "system.battleItem": "" });
    }
    return true;
  }

  async _prepareExternalMoveRuntime(move, context = {}) {
    const moveSeedId = this._getMoveSeedId(move);
    const runtime = {
      skipImmediateDamage: false,
      attackOverrides: {},
      results: [],
      consumeHeldItem: false
    };

    if (moveSeedId === "move-bide") {
      const targetActor = context?.targetActor instanceof PokRoleActor ? context.targetActor : null;
      if (targetActor) {
        await this._setBideState({
          targetActorId: targetActor.id,
          targetActorName: targetActor.name ?? "",
          moveId: move.id ?? "",
          moveName: move.name ?? "",
          remainingHits: 2,
          storedDamage: 0,
          roundKey: `${context?.roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim()
        });
        runtime.results.push({
          label: "Bide",
          targetName: targetActor.name,
          applied: true,
          detail: `${this.name} is storing damage for the next 2 damaging hits.`
        });
      } else {
        runtime.results.push({
          label: "Bide",
          targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
        });
      }
      runtime.skipImmediateDamage = true;
      return runtime;
    }

    if (moveSeedId === "move-fling") {
      const battleItemId = `${this.system?.battleItem ?? ""}`.trim();
      let heldItem = battleItemId ? game.items.get(battleItemId) ?? this.items.get(battleItemId) ?? null : null;
      if (heldItem?.type !== "gear") heldItem = null;
      if (heldItem) {
        const bonusDice = await this._promptFlingBonusDice(move, heldItem.name ?? "");
        if (bonusDice === null) return null;
        runtime.attackOverrides.extraDamageDice = bonusDice;
        runtime.consumeHeldItem = true;
        runtime.results.push({
          label: "Fling",
          targetName: heldItem.name ?? game.i18n.localize("POKROLE.Common.Unknown"),
          applied: true,
          detail: `${heldItem.name} was thrown${bonusDice > 0 ? ` (+${bonusDice} dice)` : ""}.`
        });
      } else {
        runtime.results.push({
          label: "Fling",
          targetName: this.name,
          applied: false,
          detail: "No held item: Fling gains no extra damage."
        });
      }
      return runtime;
    }

    if (moveSeedId === "move-stomping-tantrum" || moveSeedId === "move-temper-flare") {
      if (this._didLastMoveFailAccuracyRoll()) {
        runtime.attackOverrides.extraDamageDice = Math.max(
          Math.floor(toNumber(runtime.attackOverrides.extraDamageDice, 0)),
          0
        ) + 2;
        runtime.results.push({
          label: "Damage",
          targetName: this.name,
          applied: true,
          detail: `${move.name} gains +2 damage dice because the previous move missed.`
        });
      }
      return runtime;
    }

    if (moveSeedId === "move-judgment") {
      runtime.attackOverrides = {
        ignoreCover: true,
        ignoreShield: true,
        ignoreSubstitute: true,
        ignoreWeather: true,
        ignoreTypeImmunity: true
      };
      return runtime;
    }

    return runtime;
  }

  async _applyHealingWishStyleRuntime(move, options = {}) {
    const includeFainted = options.includeFainted === true;
    const candidates = this._getHealingWishCandidates({ includeFainted });
    if (candidates.length <= 0) {
      return [{
        label: "Support",
        targetName: this.name,
        applied: false,
        detail: "No valid allied target is available."
      }];
    }
    const chosenTarget = await this._promptActorChoice(move?.name ?? "Support", candidates, {
      label: "Choose the allied target"
    });
    if (!(chosenTarget instanceof PokRoleActor)) {
      return [{
        label: "Support",
        targetName: this.name,
        applied: false,
        detail: game.i18n.localize("POKROLE.Common.Cancel")
      }];
    }

    const hpMax = Math.max(Math.floor(toNumber(chosenTarget.system?.resources?.hp?.max, 1)), 1);
    const hpCurrent = Math.max(Math.floor(toNumber(chosenTarget.system?.resources?.hp?.value, 0)), 0);
    const healResult = await this._safeApplyHeal(chosenTarget, Math.max(hpMax - hpCurrent, 0), {
      healingCategory: "unlimited",
      restoreAwareness: includeFainted,
      ignoreBattleLimit: true
    });
    await this._applyCleanseEffectToActor({ notes: "all" }, chosenTarget);
    if (includeFainted) {
      const willMax = Math.max(Math.floor(toNumber(chosenTarget.system?.resources?.will?.max, 0)), 0);
      if (willMax > 0) {
        await chosenTarget.update({ "system.resources.will.value": willMax });
      }
    }

    const combat = game.combat;
    const targetCombatant = this._getCombatantForActor(chosenTarget, combat);
    const selfCombatant = this._getCombatantForActor(this, combat);
    if (!targetCombatant && selfCombatant) {
      const switched = await this._switchCombatantToActor(combat, selfCombatant, chosenTarget, {
        initiative: selfCombatant.initiative,
        skipVolatileClear: true
      });
      if (switched) {
        await chosenTarget.update({
          "system.combat.actionNumber": clamp(Math.floor(toNumber(options?.actionNumber, 1)) + 1, 1, 5)
        });
      }
    }

    const selfHp = Math.max(Math.floor(toNumber(this.system?.resources?.hp?.value, 0)), 0);
    if (selfHp > 0) {
      await this._safeApplyDamage(this, selfHp, { applyDeadOnZero: false });
    }

    return [{
      label: "Support",
      targetName: chosenTarget.name,
      applied: true,
      detail: `${chosenTarget.name} recovered ${Math.max(toNumber(healResult?.healedApplied, 0), 0)} HP${includeFainted ? " and all Will" : ""}; ${this.name} fainted.`
    }];
  }

  async _transferSnatchableModifierEffects(targetActor) {
    if (!(targetActor instanceof PokRoleActor)) return 0;
    const modifierEffects = (targetActor.effects?.contents ?? []).filter((effectDocument) => {
      if (!effectDocument || effectDocument.disabled) return false;
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (!automationFlags?.managed) return false;
      if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "modifier") return false;
      const path = `${automationFlags?.path ?? ""}`.trim();
      return path.startsWith("system.attributes.");
    });
    if (modifierEffects.length <= 0) return 0;

    const clonedEffects = modifierEffects.map((effectDocument) => {
      const effectData = effectDocument.toObject();
      delete effectData._id;
      delete effectData.id;
      effectData.transfer = false;
      effectData.disabled = false;
      return effectData;
    });
    await this.createEmbeddedDocuments("ActiveEffect", clonedEffects);
    await targetActor.deleteEmbeddedDocuments("ActiveEffect", modifierEffects.map((effectDocument) => effectDocument.id).filter(Boolean));
    return clonedEffects.length;
  }

  async _transferSnatchableShieldEffects(targetActor, roundKey = null) {
    if (!(targetActor instanceof PokRoleActor)) return 0;
    const currentRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey) return 0;
    const targetEntries = targetActor._getActiveShieldEntries(currentRoundKey);
    if (targetEntries.length <= 0) return 0;

    const sourceEntries = this._getActiveShieldEntries();
    const preservedTargetEntries = targetActor._getActiveShieldEntries().filter((entry) => entry.roundKey !== currentRoundKey);
    const incomingEntries = targetEntries.map((entry) => ({
      ...foundry.utils.deepClone(entry),
      id: foundry.utils.randomID(),
      sourceActorId: this.id,
      sourceActorName: this.name ?? entry.sourceActorName ?? ""
    }));
    await this._setActiveShieldEntries([...sourceEntries, ...incomingEntries]);
    await targetActor._setActiveShieldEntries(preservedTargetEntries);
    return incomingEntries.length;
  }

  async _transferSnatchableSideFieldEffects(targetActor) {
    const combat = game.combat;
    if (!(targetActor instanceof PokRoleActor) || !combat) return 0;
    const targetSide = this._getActorCombatSideReference(targetActor, combat);
    const sourceSide = this._getActorCombatSideReference(this, combat);
    if (
      (!targetSide.sideKey && targetSide.sideDisposition === 0) ||
      (!sourceSide.sideKey && sourceSide.sideDisposition === 0) ||
      this._doesCombatSideEntryMatchReference(targetSide, sourceSide)
    ) {
      return 0;
    }
    const entries = this._getCombatSideFieldEntries(combat);
    let transferred = 0;
    const nextEntries = entries.map((entry) => {
      if (!this._doesCombatSideEntryMatchReference(entry, targetSide)) return entry;
      transferred += 1;
      return {
        ...entry,
        sideKey: sourceSide.sideKey,
        sideDisposition: sourceSide.sideDisposition,
        sourceActorId: this.id ?? entry.sourceActorId ?? null,
        sourceActorName: this.name ?? entry.sourceActorName ?? ""
      };
    });
    if (transferred > 0) {
      await this._setCombatSideFieldEntries(combat, nextEntries);
    }
    return transferred;
  }

  async _transferSnatchableHealingEffects(targetActor) {
    const combat = game.combat;
    if (!(targetActor instanceof PokRoleActor) || !combat) return 0;
    const queue = this._getDelayedEffectQueue(combat);
    if (queue.length <= 0) return 0;
    const sourceCombatant = this._getCombatantForActor(this, combat);
    const sourceSideDisposition = this._getActorCombatSideDisposition(this, combat);
    let moved = 0;
    const nextQueue = queue.map((entry) => {
      if (entry.kind !== "wish") return entry;
      if (`${entry.targetActorId ?? ""}`.trim() !== `${targetActor.id ?? ""}`.trim()) return entry;
      moved += 1;
      return {
        ...entry,
        targetActorId: this.id ?? null,
        targetCombatantId: sourceCombatant?.id ?? null,
        targetSideDisposition: sourceSideDisposition
      };
    });
    if (moved > 0) {
      await this._setDelayedEffectQueue(combat, nextQueue);
    }
    return moved;
  }

  async _applySnatchRuntime(targetActor, move = null, options = {}) {
    if (!(targetActor instanceof PokRoleActor)) {
      return [{
        label: "Snatch",
        targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
      }];
    }
    const modifierCount = await this._transferSnatchableModifierEffects(targetActor);
    const shieldCount = await this._transferSnatchableShieldEffects(targetActor, options?.roundKey ?? null);
    const sideFieldCount = await this._transferSnatchableSideFieldEffects(targetActor);
    const healingCount = await this._transferSnatchableHealingEffects(targetActor);
    const totalTransferred = modifierCount + shieldCount + sideFieldCount + healingCount;

    return [{
      label: "Snatch",
      targetName: targetActor.name,
      applied: totalTransferred > 0,
      detail:
        totalTransferred > 0
          ? `${this.name} stole ${totalTransferred} effect(s) from ${targetActor.name}.`
          : `${targetActor.name} had nothing snatchable.`
    }];
  }

  async _handleBideIncomingAttack({
    attackerActor = null,
    attackMove = null,
    category = "support",
    finalDamage = 0,
    roundKey = null
  } = {}) {
    const bideState = this._getBideState();
    if (bideState.remainingHits <= 0) return [];
    const normalizedCategory = this._normalizeMoveCombatCategory(category);
    if (!["physical", "special"].includes(normalizedCategory)) return [];

    const nextState = {
      ...bideState,
      remainingHits: Math.max(bideState.remainingHits - 1, 0),
      storedDamage: Math.max(bideState.storedDamage + Math.max(Math.floor(toNumber(finalDamage, 0)), 0), 0)
    };
    if (nextState.remainingHits > 0) {
      await this._setBideState(nextState);
      return [{
        label: "Bide",
        targetName: this.name,
        applied: true,
        detail: `${this.name} is still biding (${nextState.remainingHits} hit(s) left).`
      }];
    }

    await this._clearBideState();
    const retaliateTarget =
      game.actors.get(nextState.targetActorId) ??
      game.combat?.combatants?.find?.((entry) => entry.actor?.id === nextState.targetActorId)?.actor ??
      null;
    if (!(retaliateTarget instanceof PokRoleActor)) {
      return [{
        label: "Bide",
        targetName: nextState.targetActorName || game.i18n.localize("POKROLE.Chat.NoTarget"),
        applied: false,
        detail: `${this.name} released Bide, but the original target is no longer available.`
      }];
    }
    if (Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0) <= 0) {
      return [{
        label: "Bide",
        targetName: retaliateTarget.name,
        applied: false,
        detail: `${this.name} fainted before releasing Bide.`
      }];
    }

    const retaliateDice = Math.max(nextState.storedDamage * 2, 0);
    if (retaliateDice <= 0) {
      return [{
        label: "Bide",
        targetName: retaliateTarget.name,
        applied: false,
        detail: `${this.name} stored no damage for Bide.`
      }];
    }

    const bideMove = nextState.moveId ? this.items.get(nextState.moveId) ?? null : null;
    if (!bideMove) {
      return [{
        label: "Bide",
        targetName: retaliateTarget.name,
        applied: false,
        detail: `${this.name} can not find Bide on its sheet.`
      }];
    }

    const damageResult = await this._resolveMoveDamageAgainstTarget({
      move: bideMove,
      targetActor: retaliateTarget,
      painPenalty: this.getPainPenalty(),
      critical: false,
      isHoldingBackHalf: false,
      canInflictDeathOnKo: false,
      actionNumber: 1,
      roundKey,
      attackOverrides: {
        moveType: "normal",
        category: "physical",
        fixedDamagePool: retaliateDice,
        ignoreDefenses: true,
        ignoreStab: true,
        ignoreWeather: false,
        ignoreTerrain: false
      }
    });

    return [{
      label: "Bide",
      targetName: retaliateTarget.name,
      applied: true,
      detail: `${this.name} released Bide for ${retaliateDice} damage dice${damageResult?.hpBefore !== null && damageResult?.hpAfter !== null ? ` (${damageResult.hpBefore} -> ${damageResult.hpAfter})` : ""}.`
    }];
  }

  async _removeManagedEffectsByType(targetActor, effectType, predicate = null) {
    const actor = targetActor ?? this;
    if (!(actor instanceof PokRoleActor)) return 0;
    const effectIds = this._getManagedAutomationEffectsByType(actor, effectType)
      .filter((effectDocument) => (typeof predicate === "function" ? predicate(effectDocument) : true))
      .map((effectDocument) => effectDocument.id)
      .filter(Boolean);
    if (effectIds.length > 0) {
      await actor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
    }
    return effectIds.length;
  }

  async _scheduleOngoingDamageMoveRuntime(move, targetActor, rule = {}, options = {}) {
    const combat = options?.combat ?? game.combat ?? null;
    if (!combat || !(targetActor instanceof PokRoleActor)) return null;
    const targetCombatant = this._getCombatantForActor(targetActor, combat);
    const sourceCombatant = this._getCombatantForActor(this, combat);
    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    const extraDamageVsTypes = Array.isArray(rule?.extraDamageVsTypes)
      ? rule.extraDamageVsTypes.map((value) => this._normalizeTypeKey(value)).filter((value) => value && value !== "none")
      : [];
    const damageDiceBase =
      Number.isFinite(Number(rule?.ongoingDamageDice))
        ? Math.max(Math.floor(toNumber(rule.ongoingDamageDice, 0)), 0)
        : Math.max(Math.floor(toNumber(this._getMoveSourceAttributes(move)?.blockDamagePool, 0)), 0);
    if (damageDiceBase <= 0) return null;
    const durationMode = `${rule?.durationMode ?? "rounds"}`.trim().toLowerCase();
    const durationRounds = Math.max(Math.floor(toNumber(rule?.durationRounds, 4)), 1);
    const repeatEntry =
      durationMode === "rounds"
        ? { repeatEveryRounds: 1, remainingTriggers: durationRounds }
        : { repeatEveryRounds: 1, remainingTriggers: -1 };
    return this._scheduleDelayedEffect(combat, {
      kind: "ongoing-damage",
      phase: "round-end",
      triggerRound: currentRound,
      createdRound: currentRound,
      createdTurn: Math.max(Math.floor(toNumber(combat.turn, 0)), 0),
      createdAt: Date.now(),
      sourceActorId: this.id ?? null,
      sourceCombatantId: sourceCombatant?.id ?? null,
      sourceSlotId: sourceCombatant ? await this._ensureCombatantBattleSlotId(sourceCombatant) : null,
      sourceSideDisposition: this._getActorCombatSideDisposition(this, combat),
      targetActorId: targetActor.id ?? null,
      targetCombatantId: targetCombatant?.id ?? null,
      targetSlotId: targetCombatant ? await this._ensureCombatantBattleSlotId(targetCombatant) : null,
      targetSideDisposition: this._getActorCombatSideDisposition(targetActor, combat),
      moveId: move?.id ?? null,
      moveSeedId: this._getMoveSeedId(move),
      moveName: move?.name ?? "",
      payload: {
        damageDice: damageDiceBase,
        moveType: this._resolveEffectiveMoveType(move, this),
        category: this._normalizeMoveCombatCategory(move?.system?.category),
        extraDamageVsTypes
      },
      ...repeatEntry
    });
  }

  async _applyLockingMoveRuntime(move, options = {}) {
    const rule = this._getLockingMoveRuntimeRule(move);
    if (!rule || options?.hit === false) return [];
    const combat = options?.combat ?? game.combat ?? null;
    const roundKey = `${options?.roundKey ?? getCurrentCombatRoundKey() ?? ""}`.trim();
    const primaryTarget = options?.targetActor instanceof PokRoleActor ? options.targetActor : null;
    const targets = [];
    if ((rule.targets ?? []).includes("self")) targets.push(this);
    if ((rule.targets ?? []).includes("target")) {
      targets.push(...(Array.isArray(options?.targetActors) ? options.targetActors.filter(Boolean) : []));
    }
    const uniqueTargets = [...new Map(targets.map((actor) => [actor?.id ?? foundry.utils.randomID(), actor])).values()]
      .filter((actor) => actor instanceof PokRoleActor);
    if (uniqueTargets.length <= 0) return [];

    const results = [];
    for (const targetActor of uniqueTargets) {
      if (rule.grappling && targetActor.id !== this.id) {
        const grappleResistance = await targetActor._rollSuccessPool({
          dicePool: Math.max(targetActor.getTraitValue("strength"), targetActor.getTraitValue("dexterity"), 1),
          removedSuccesses: targetActor.getPainPenalty(),
          requiredSuccesses: Math.max(Math.floor(toNumber(options?.netAccuracySuccesses, 1)), 1),
          flavor: `${targetActor.name} resists Grapple.`
        });
        if (grappleResistance?.success) {
          results.push({
            label: "Lock",
            targetName: targetActor.name,
            applied: false,
            detail: `${targetActor.name} resisted Grapple.`
          });
          continue;
        }
      }

      await this._removeManagedEffectsByType(targetActor, "switch-lock", (effectDocument) => {
        const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
        return `${automationFlags?.sourceMoveId ?? ""}`.trim() === `${move?.id ?? ""}`.trim();
      });
      const marker = await this._createManagedMarkerEffect({
        targetActor,
        name: move?.name ?? "Lock",
        img: move?.img ?? "",
        sourceMove: move,
        effectType: "switch-lock",
        durationMode: rule.durationMode ?? "manual",
        durationRounds: rule.durationRounds ?? 1,
        statuses: [],
        extraAutomationFlags: {
          blocksSwitch: rule.blocksSwitch !== false,
          blocksForcedSwitch: rule.blocksForcedSwitch !== false,
          grappling: rule.grappling === true,
          anchorActorId: this.id ?? null,
          linkedActorId: targetActor.id === this.id ? primaryTarget?.id ?? null : targetActor.id ?? null,
          sceneScoped: rule.sceneScoped === true,
          sceneId: `${canvas?.scene?.id ?? ""}`.trim(),
          roundKeyApplied: roundKey
        }
      });
      if (rule.ongoingDamageDice && targetActor.id !== this.id) {
        await this._scheduleOngoingDamageMoveRuntime(move, targetActor, rule, options);
      }
      results.push({
        label: "Lock",
        targetName: targetActor.name,
        applied: Boolean(marker),
        detail:
          Boolean(marker)
            ? `${targetActor.name} is trapped by ${move.name}.`
            : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      });
    }
    return results;
  }

  _getRandomMoveTypeKey(excludedTypes = []) {
    const excluded = new Set((Array.isArray(excludedTypes) ? excludedTypes : [excludedTypes])
      .map((value) => this._normalizeTypeKey(value))
      .filter((value) => value && value !== "none"));
    const candidates = MOVE_TYPE_KEYS.filter((typeKey) => typeKey !== "none" && !excluded.has(typeKey));
    if (candidates.length <= 0) return "normal";
    return candidates[Math.floor(Math.random() * candidates.length)] ?? "normal";
  }

  async _applyAcupressureRuntime(move) {
    const acupressureChoices = [
      { path: "system.attributes.strength", label: this.localizeTrait("strength") },
      { path: "system.attributes.dexterity", label: this.localizeTrait("dexterity") },
      { path: "system.attributes.special", label: this.localizeTrait("special") },
      { path: "system.attributes.vitality", label: this.localizeTrait("vitality") },
      { path: "system.attributes.insight", label: this.localizeTrait("insight") },
      { path: "system.attributes.accuracy", label: this.localizeTrait("accuracy") },
      { path: "system.attributes.evasion", label: this.localizeTrait("evasion") }
    ];
    await this._removeManagedEffectsByType(this, "modifier", (effectDocument) => {
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      return automationFlags?.acupressure === true;
    });
    const choice = acupressureChoices[Math.floor(Math.random() * acupressureChoices.length)] ?? acupressureChoices[0];
    const modifierResult = await this._applyTemporaryTrackedModifier({
      targetActor: this,
      path: choice.path,
      amount: 1,
      min: 0,
      max: 99,
      label: move?.name ?? "Acupressure",
      sourceMove: move,
      detailLabel: choice.label,
      durationMode: "manual",
      durationRounds: 1,
      specialDuration: [],
      automationOverrides: {
        acupressure: true,
        sceneScoped: true,
        sceneId: `${canvas?.scene?.id ?? ""}`.trim()
      }
    });
    return [{
      label: "Support",
      targetName: this.name,
      applied: Boolean(modifierResult?.applied),
      detail: modifierResult?.detail ?? game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  async _clearSleepOnBattlefield(combat = game.combat) {
    if (!combat) return 0;
    let cleared = 0;
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant?.actor ?? null;
      if (!(actor instanceof PokRoleActor)) continue;
      if (!actor._isConditionActive?.("sleep")) continue;
      await actor.toggleQuickCondition("sleep", { active: false });
      cleared += 1;
    }
    return cleared;
  }

  async _applyLuckyChantRuntime(move, options = {}) {
    const combat = game.combat ?? null;
    const allies = combat
      ? (combat.combatants ?? [])
          .map((combatant) => combatant?.actor ?? null)
          .filter((actor) =>
            actor instanceof PokRoleActor &&
            this._getActorCombatSideDisposition(actor, combat) === this._getActorCombatSideDisposition(this, combat)
          )
      : [this];
    const uniqueAllies = [...new Map(allies.map((actor) => [actor.id, actor])).values()];
    const results = [];
    for (const ally of uniqueAllies) {
      await this._removeManagedEffectsByType(ally, "lucky-chant", (effectDocument) => {
        const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
        return `${automationFlags?.sourceMoveId ?? ""}`.trim() === `${move?.id ?? ""}`.trim();
      });
      const marker = await this._createManagedMarkerEffect({
        targetActor: ally,
        name: move?.name ?? "Lucky Chant",
        img: move?.img ?? "",
        sourceMove: move,
        effectType: "lucky-chant",
        durationMode: "manual",
        extraAutomationFlags: {
          sceneScoped: true,
          sceneId: `${canvas?.scene?.id ?? ""}`.trim()
        }
      });
      results.push({
        label: "Support",
        targetName: ally.name,
        applied: Boolean(marker),
        detail: marker ? `${ally.name} is protected by Lucky Chant.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      });
    }
    return results;
  }

  async _applyImprisonRuntime(move) {
    await this._removeManagedEffectsByType(this, "imprison");
    const marker = await this._createManagedMarkerEffect({
      targetActor: this,
      name: move?.name ?? "Imprison",
      img: move?.img ?? "icons/svg/padlock.svg",
      sourceMove: move,
      effectType: "imprison",
      durationMode: "manual",
      durationRounds: 1,
      extraAutomationFlags: {
        sceneScoped: true,
        sceneId: `${canvas?.scene?.id ?? ""}`.trim()
      }
    });
    return [{
      label: "Support",
      targetName: this.name,
      applied: Boolean(marker),
      detail: marker
        ? `${this.name} sealed matching moves with Imprison.`
        : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  async _applyUproarRuntime(move) {
    const cleared = await this._clearSleepOnBattlefield(game.combat);
    await this._removeManagedEffectsByType(this, "uproar", null);
    await this._createManagedMarkerEffect({
      targetActor: this,
      name: move?.name ?? "Uproar",
      img: move?.img ?? "",
      sourceMove: move,
      effectType: "uproar",
      durationMode: "rounds",
      durationRounds: 1
    });
    return [{
      label: "Support",
      targetName: game.i18n.localize("POKROLE.Move.TargetValues.Battlefield"),
      applied: true,
      detail: `${move.name} caused an uproar and cleared Sleep from ${cleared} Pok\u00e9mon.`
    }];
  }

  async _applyConversionRuntime(move) {
    const transformState = this.getFlag?.(POKROLE.ID, CONVERSION_STATE_FLAG_KEY) ?? null;
    if (!transformState?.originalPrimaryType) {
      await this.setFlag(POKROLE.ID, CONVERSION_STATE_FLAG_KEY, {
        sceneId: `${canvas?.scene?.id ?? ""}`.trim(),
        originalPrimaryType: this._normalizeTypeKey(this.system?.types?.primary || "normal")
      });
    }
    const nextType = this._getRandomMoveTypeKey([
      this.system?.types?.primary ?? "normal",
      this.system?.types?.secondary ?? "none"
    ]);
    await this.update({ "system.types.primary": nextType });
    return [{
      label: "Support",
      targetName: this.name,
      applied: true,
      detail: `${this.name} changed its main type to ${this.localizeTrait(nextType)}.`
    }];
  }

  _getMoveCompendiumCollection() {
    return game.packs?.get?.(`${POKROLE.ID}.moves`) ?? null;
  }

  async _getMetronomeMoveDocument() {
    const movesPack = this._getMoveCompendiumCollection();
    if (!movesPack) return null;
    const categoryRoll = await new Roll("1d6").evaluate();
    const powerRoll = await new Roll("1d6").evaluate();
    const desiredCategory = Math.max(toNumber(categoryRoll.total, 0), 0) >= 4 ? "special" : "physical";
    const desiredPower = Math.max(Math.floor(toNumber(powerRoll.total, 0)), 1);
    const index = await movesPack.getIndex({
      fields: [
        "name",
        "system.category",
        "system.power",
        `flags.${POKROLE.ID}.seedId`,
        `flags.${POKROLE.ID}.sourceAttributes`
      ]
    });
    const candidates = index.filter((entry) => {
      const category = this._normalizeMoveCombatCategory(entry.system?.category);
      const power = Math.max(Math.floor(toNumber(entry.system?.power, 0)), 0);
      const seedId = `${entry.flags?.[POKROLE.ID]?.seedId ?? ""}`.trim().toLowerCase();
      const sourceAttributes = entry.flags?.[POKROLE.ID]?.sourceAttributes ?? {};
      if (category !== desiredCategory) return false;
      if (power !== desiredPower) return false;
      if (!seedId || seedId === "move-metronome") return false;
      if (sourceAttributes?.unique || sourceAttributes?.copyMove || sourceAttributes?.zMove || sourceAttributes?.maxMove) return false;
      return true;
    });
    if (candidates.length <= 0) return null;
    const chosen = candidates[Math.floor(Math.random() * candidates.length)] ?? null;
    return chosen?._id ? await movesPack.getDocument(chosen._id) : null;
  }

  _getAssistMoveChoices() {
    const combat = game.combat ?? null;
    const trainer = this._getTrainerActorForPokemon(this);
    const candidateActors = trainer
      ? [
          ...new Set([
            ...((trainer.system?.party ?? []).map((actorId) => `${actorId ?? ""}`.trim()).filter(Boolean)),
            ...(combat?.combatants ?? []).map((combatant) => `${combatant?.actor?.id ?? ""}`.trim()).filter(Boolean)
          ])
        ].map((actorId) => game.actors?.get?.(actorId) ?? null)
      : this._getCombatantActorsForSide(this, combat);
    const choices = [];
    for (const actor of candidateActors) {
      if (!(actor instanceof PokRoleActor) || actor.id === this.id) continue;
      for (const move of actor.items?.contents ?? []) {
        if (move?.type !== "move") continue;
        const validationError = this._canResolveCopiedMoveDocument(move);
        if (validationError) continue;
        choices.push({
          ownerActor: actor,
          move,
          label: `${actor.name}: ${move.name}`
        });
      }
    }
    return choices;
  }

  async _applyAssistRuntime(move, options = {}) {
    const choices = this._getAssistMoveChoices();
    const selected = await this._promptMoveChoice(`${move.name}: choose party move`, choices, {
      label: "Available moves"
    });
    if (!selected?.move) {
      return [{
        label: "Copy",
        targetName: this.name,
        applied: false,
        detail: game.i18n.localize("POKROLE.Common.Cancel")
      }];
    }
    const copiedResult = await this._executeTemporaryCopiedMove(selected.move, {
      targetActorIds: Array.isArray(options?.targetActors) ? options.targetActors.map((actor) => actor?.id).filter(Boolean) : [],
      roundKey: options?.roundKey ?? getCurrentCombatRoundKey()
    });
    return [{
      label: "Copy",
      targetName: selected.ownerActor?.name ?? this.name,
      applied: Boolean(copiedResult),
      detail: copiedResult ? `${this.name} used ${selected.move.name} through Assist.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  async _applyMetronomeRuntime(move, options = {}) {
    const metronomeMove = await this._getMetronomeMoveDocument();
    if (!metronomeMove) {
      return [{
        label: "Copy",
        targetName: this.name,
        applied: false,
        detail: "No valid Metronome move was found."
      }];
    }
    const copiedResult = await this._executeTemporaryCopiedMove(metronomeMove, {
      targetActorIds: Array.isArray(options?.targetActors) ? options.targetActors.map((actor) => actor?.id).filter(Boolean) : [],
      roundKey: options?.roundKey ?? getCurrentCombatRoundKey()
    });
    return [{
      label: "Copy",
      targetName: this.name,
      applied: Boolean(copiedResult),
      detail: copiedResult ? `${this.name} used ${metronomeMove.name} through Metronome.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  async _applySleepTalkRuntime(move, options = {}) {
    if (!this._isConditionActive("sleep")) {
      return [{
        label: "Copy",
        targetName: this.name,
        applied: false,
        detail: `${move.name} fails because ${this.name} is not asleep.`
      }];
    }
    const candidateMoves = (this.items?.contents ?? []).filter((item) =>
      item?.type === "move" &&
      item.id !== move.id &&
      this._getMoveSeedId(item) !== "move-sleep-talk"
    );
    if (candidateMoves.length <= 0) {
      return [{
        label: "Copy",
        targetName: this.name,
        applied: false,
        detail: `${this.name} has no valid move to use with Sleep Talk.`
      }];
    }
    const chosenMove = candidateMoves[Math.floor(Math.random() * candidateMoves.length)] ?? null;
    if (!chosenMove) {
      return [{
        label: "Copy",
        targetName: this.name,
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      }];
    }
    const randomFoe = game.combat
      ? (() => {
          const foes = (game.combat.combatants ?? [])
            .map((combatant) => combatant?.actor ?? null)
            .filter((actor) =>
              actor instanceof PokRoleActor &&
              actor.id !== this.id &&
              this._getActorCombatSideDisposition(actor, game.combat) !== this._getActorCombatSideDisposition(this, game.combat) &&
              !actor._isConditionActive?.("dead") &&
              !actor._isConditionActive?.("fainted")
            );
          if (foes.length <= 0) return null;
          return foes[Math.floor(Math.random() * foes.length)] ?? null;
        })()
      : null;
    const sleepTalkResult = await this.rollMove(chosenMove.id, {
      targetActorIds: randomFoe ? [randomFoe.id] : [],
      roundKey: options?.roundKey ?? getCurrentCombatRoundKey(),
      actionNumber: options?.actionNumber ?? null,
      advanceAction: false,
      skipActionCheck: true,
      executeFromCopy: true
    });
    return [{
      label: "Copy",
      targetName: this.name,
      applied: Boolean(sleepTalkResult),
      detail: sleepTalkResult ? `${this.name} used ${chosenMove.name} through Sleep Talk.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  _getTransformState() {
    const state = this.getFlag?.(POKROLE.ID, TRANSFORM_STATE_FLAG_KEY) ?? null;
    if (!state || typeof state !== "object") return null;
    return {
      sceneId: `${state?.sceneId ?? ""}`.trim(),
      targetActorId: `${state?.targetActorId ?? ""}`.trim(),
      originalAbility: `${state?.originalAbility ?? ""}`.trim(),
      originalTypes: foundry.utils.deepClone(state?.originalTypes ?? {}),
      originalAttributes: foundry.utils.deepClone(state?.originalAttributes ?? {}),
      originalSkills: foundry.utils.deepClone(state?.originalSkills ?? {}),
      originalMoves: Array.isArray(state?.originalMoves) ? foundry.utils.deepClone(state.originalMoves) : []
    };
  }

  async _restoreTransformState() {
    const transformState = this._getTransformState();
    if (!transformState) return false;
    const currentMoveIds = (this.items?.contents ?? [])
      .filter((item) => item?.type === "move" && this._getMoveSeedId(item) !== "move-transform")
      .map((item) => item.id)
      .filter(Boolean);
    if (currentMoveIds.length > 0) {
      await this.deleteEmbeddedDocuments("Item", currentMoveIds);
    }
    const restoredMoves = (transformState.originalMoves ?? []).map((moveData) => {
      const cloned = foundry.utils.deepClone(moveData);
      delete cloned._id;
      return cloned;
    });
    if (restoredMoves.length > 0) {
      await this.createEmbeddedDocuments("Item", restoredMoves);
    }
    await this.update({
      "system.ability": transformState.originalAbility ?? "",
      "system.types.primary": transformState.originalTypes?.primary ?? this.system?.types?.primary ?? "normal",
      "system.types.secondary": transformState.originalTypes?.secondary ?? this.system?.types?.secondary ?? "none",
      "system.attributes": transformState.originalAttributes ?? this.system?.attributes ?? {},
      "system.skills": transformState.originalSkills ?? this.system?.skills ?? {}
    });
    await this.unsetFlag(POKROLE.ID, TRANSFORM_STATE_FLAG_KEY);
    return true;
  }

  async clearSceneScopedTransformState(currentSceneId = null) {
    const transformState = this._getTransformState();
    if (!transformState?.sceneId) return false;
    const normalizedSceneId = `${currentSceneId ?? canvas?.scene?.id ?? ""}`.trim();
    if (!normalizedSceneId || transformState.sceneId === normalizedSceneId) return false;
    return this._restoreTransformState();
  }

  async _applyTransformRuntime(move, options = {}) {
    let targetActor = options?.targetActor instanceof PokRoleActor ? options.targetActor : null;
    if (!targetActor || targetActor.id === this.id) {
      const combat = game.combat ?? null;
      const candidates = combat
        ? (combat.combatants ?? [])
            .map((combatant) => combatant?.actor ?? null)
            .filter((actor) => actor instanceof PokRoleActor && actor.id !== this.id)
        : [];
      targetActor = await this._promptActorChoice(`${move.name}: choose target`, candidates);
    }
    if (!(targetActor instanceof PokRoleActor) || targetActor.id === this.id) {
      return [{
        label: "Support",
        targetName: this.name,
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
      }];
    }
    if (this._getTransformState()) {
      await this._restoreTransformState();
    }
    const originalMoves = (this.items?.contents ?? [])
      .filter((item) => item?.type === "move" && this._getMoveSeedId(item) !== "move-transform")
      .map((item) => item.toObject());
    await this.setFlag(POKROLE.ID, TRANSFORM_STATE_FLAG_KEY, {
      sceneId: `${canvas?.scene?.id ?? ""}`.trim(),
      targetActorId: targetActor.id,
      originalAbility: `${this.system?.ability ?? ""}`.trim(),
      originalTypes: foundry.utils.deepClone(this.system?.types ?? {}),
      originalAttributes: foundry.utils.deepClone(this.system?.attributes ?? {}),
      originalSkills: foundry.utils.deepClone(this.system?.skills ?? {}),
      originalMoves
    });
    const currentMoveIds = (this.items?.contents ?? [])
      .filter((item) => item?.type === "move" && this._getMoveSeedId(item) !== "move-transform")
      .map((item) => item.id)
      .filter(Boolean);
    if (currentMoveIds.length > 0) {
      await this.deleteEmbeddedDocuments("Item", currentMoveIds);
    }
    const copiedMoves = (targetActor.items?.contents ?? [])
      .filter((item) => item?.type === "move" && this._getMoveSeedId(item) !== "move-transform")
      .map((item) => {
        const data = item.toObject();
        delete data._id;
        return data;
      });
    if (copiedMoves.length > 0) {
      await this.createEmbeddedDocuments("Item", copiedMoves);
    }
    await this.update({
      "system.ability": `${targetActor.system?.ability ?? ""}`.trim(),
      "system.types.primary": this._normalizeTypeKey(targetActor.system?.types?.primary || "normal"),
      "system.types.secondary": this._normalizeTypeKey(targetActor.system?.types?.secondary || "none"),
      "system.attributes": foundry.utils.deepClone(targetActor.system?.attributes ?? {}),
      "system.skills": foundry.utils.deepClone(targetActor.system?.skills ?? {})
    });
    return [{
      label: "Support",
      targetName: targetActor.name,
      applied: true,
      detail: `${this.name} transformed into ${targetActor.name}.`
    }];
  }

  async _applySpecialSupportMoveRuntime(move, options = {}) {
    const seedId = this._getMoveSeedId(move);
    const hit = options.hit !== false;
    if (!hit) return [];
    if (seedId === "move-acupressure") {
      return this._applyAcupressureRuntime(move);
    }
    if (seedId === "move-assist") {
      return this._applyAssistRuntime(move, options);
    }
    if (seedId === "move-conversion") {
      return this._applyConversionRuntime(move);
    }
    if (seedId === "move-destiny-bond" && game.combat) {
      const currentRound = Math.max(Math.floor(toNumber(game.combat.round, 0)), 0);
      await this._setDestinyBondState({
        activeRound: currentRound,
        lastUsedRound: currentRound
      });
      return [{
        label: "Support",
        targetName: this.name,
        applied: true,
        detail: `${this.name} is bound by Destiny Bond until the end of the round.`
      }];
    }
    if (seedId === "move-healing-wish") {
      return this._applyHealingWishStyleRuntime(move, {
        actionNumber: options?.actionNumber ?? 1,
        includeFainted: false
      });
    }
    if (seedId === "move-lunar-dance") {
      return this._applyHealingWishStyleRuntime(move, {
        actionNumber: options?.actionNumber ?? 1,
        includeFainted: true
      });
    }
    if (seedId === "move-lucky-chant") {
      return this._applyLuckyChantRuntime(move, options);
    }
    if (seedId === "move-imprison") {
      return this._applyImprisonRuntime(move);
    }
    if (seedId === "move-metronome") {
      return this._applyMetronomeRuntime(move, options);
    }
    if (seedId === "move-snatch") {
      return this._applySnatchRuntime(options?.targetActor ?? options?.targetActors?.[0] ?? null, move, {
        roundKey: options?.roundKey ?? null
      });
    }
    if (seedId === "move-sleep-talk") {
      return this._applySleepTalkRuntime(move, options);
    }
    if (seedId === "move-transform") {
      return this._applyTransformRuntime(move, options);
    }
    if (seedId === "move-uproar") {
      return this._applyUproarRuntime(move);
    }
    return [];
  }

  async _applyCopyMoveRuntime(move, options = {}) {
    const rule = this._getCopyMoveRuntimeRule(move);
    if (!rule || options.hit === false) return [];
    const primaryTarget = options.primaryTarget instanceof PokRoleActor ? options.primaryTarget : null;
    const roundKey = `${options?.roundKey ?? getCurrentCombatRoundKey() ?? ""}`.trim();
    let copiedMove = null;
    let copiedMoveOwner = null;
    let copiedTargetIds = [];

    if (rule.kind === "copy-last-used-target" || rule.kind === "replace-self-with-last-used-target") {
      const lastUsedRecord = primaryTarget?._getLastUsedMoveRecord?.() ?? {};
      copiedMoveOwner = primaryTarget;
      copiedMove = this._getRecordedMoveDocument(primaryTarget, lastUsedRecord);
      copiedTargetIds = Array.isArray(lastUsedRecord?.targetActorIds) ? lastUsedRecord.targetActorIds : [];
    } else if (rule.kind === "copy-queued-target") {
      const queueEntry = this._getQueuedMoveEntryForActor(primaryTarget, game.combat);
      copiedMoveOwner = primaryTarget;
      copiedMove = queueEntry?.moveId ? primaryTarget?.items?.get(queueEntry.moveId) ?? null : null;
      copiedTargetIds = Array.isArray(queueEntry?.targetActorIds) ? queueEntry.targetActorIds : [];
    } else if (rule.kind === "repeat-last-used-target") {
      const lastUsedRecord = primaryTarget?._getLastUsedMoveRecord?.() ?? {};
      copiedMoveOwner = primaryTarget;
      copiedMove = this._getRecordedMoveDocument(primaryTarget, lastUsedRecord);
      copiedTargetIds = Array.isArray(lastUsedRecord?.targetActorIds) ? lastUsedRecord.targetActorIds : [];
      const validationError = this._canResolveCopiedMoveDocument(copiedMove, rule);
      if (validationError) {
        return [{
          label: "Copy",
          targetName: primaryTarget?.name ?? game.i18n.localize("POKROLE.Common.None"),
          applied: false,
          detail: validationError
        }];
      }
      const repeated = await primaryTarget.rollMove(copiedMove.id, {
        targetActorIds: copiedTargetIds,
        roundKey,
        advanceAction: false,
        skipActionCheck: true,
        executeFromCopy: true
      });
      return [{
        label: "Copy",
        targetName: primaryTarget?.name ?? game.i18n.localize("POKROLE.Common.None"),
        applied: Boolean(repeated),
        detail: repeated ? `${primaryTarget.name} repeated ${copiedMove.name}.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      }];
    }

    const validationError = this._canResolveCopiedMoveDocument(copiedMove, rule);
    if (validationError) {
      return [{
        label: "Copy",
        targetName: primaryTarget?.name ?? game.i18n.localize("POKROLE.Common.None"),
        applied: false,
        detail: validationError
      }];
    }

    if (rule.kind === "replace-self-with-last-used-target") {
      const replaced = await this._replaceMoveWithCopiedMove(move, copiedMove, {
        temporarySceneScoped: rule.temporarySceneScoped === true
      });
      return [{
        label: "Copy",
        targetName: this.name,
        applied: replaced,
        detail: replaced
          ? `${move.name} became ${copiedMove.name}${rule.permanent ? " permanently" : " for this scene"}.`
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      }];
    }

    const copiedResult = await this._executeTemporaryCopiedMove(copiedMove, {
      targetActorIds: copiedTargetIds,
      roundKey
    });
    return [{
      label: "Copy",
      targetName: copiedMoveOwner?.name ?? game.i18n.localize("POKROLE.Common.None"),
      applied: Boolean(copiedResult),
      detail: copiedResult ? `${this.name} copied ${copiedMove.name}.` : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
    }];
  }

  async _applySideFieldMoveRuntime(move, options = {}) {
    const rule = this._getSideFieldMoveRuntimeRule(move);
    if (!rule) return [];
    if (options?.hit === false) return [];
    const hit = options.hit !== false;
    if (rule.requiresHit && !hit) return [];
    const combat = game.combat;
    if (!combat) return [];
    const results = [];
    const ownSideReference = this._getActorCombatSideReference(this, combat);
    for (const entry of rule.create ?? []) {
      const sideReference =
        entry.side === "foe" && options.primaryTarget instanceof PokRoleActor
          ? this._getActorCombatSideReference(options.primaryTarget, combat)
          : entry.side === "foe"
            ? this._getOpposingCombatSideReference(this, combat)
            : ownSideReference;
      const payload = await this.registerSideFieldEntry({
        kind: entry.kind,
        sideKey: sideReference?.sideKey ?? null,
        sideDisposition: sideReference?.sideDisposition ?? 0,
        protection: entry.protection,
        hazard: entry.hazard,
        durationRounds: Math.max(Math.floor(toNumber(entry.durationRounds, 0)), 0),
        sourceMoveId: move?.id ?? null,
        sourceMoveName: move?.name ?? ""
      }, combat);
      results.push({
        label: "Field",
        targetName:
          this._doesCombatSideEntryMatchReference(sideReference, ownSideReference)
            ? this.name
            : options.primaryTarget?.name ?? "Opposing Side",
        applied: Boolean(payload),
        detail: payload
          ? payload.kind === "force-field"
            ? `${move.name} created a ${payload.protection} force field.`
            : `${move.name} created the ${payload.hazard} hazard.`
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      });
    }

    if (rule.swapSideFields) {
      const swapped = await this.swapSideFieldEntries(this, combat);
      results.push({
        label: "Field",
        targetName: game.i18n.localize("POKROLE.Move.TargetValues.Battlefield"),
        applied: swapped,
        detail: swapped ? `${move.name} swapped side field effects.` : game.i18n.localize("POKROLE.Common.None")
      });
    }

    if (rule.clearForceFields || rule.clearHazards) {
      let cleared = 0;
      if (rule.clearForceFields === "all") {
        cleared += await this.clearSideFieldEntries({ all: true, kind: "force-field" }, combat);
      } else if (rule.clearForceFields === "source-side") {
        cleared += await this.clearSideFieldsForActorSide(this, { kind: "force-field" });
      }
      if (rule.clearHazards === "all") {
        cleared += await this.clearSideFieldEntries({ all: true, kind: "hazard" }, combat);
      } else if (rule.clearHazards === "source-side") {
        cleared += await this.clearSideFieldsForActorSide(this, { kind: "hazard" });
      }
      results.push({
        label: "Field",
        targetName: game.i18n.localize("POKROLE.Move.TargetValues.Battlefield"),
        applied: cleared > 0,
        detail: cleared > 0 ? `${move.name} cleared ${cleared} field effect(s).` : game.i18n.localize("POKROLE.Common.None")
      });
    }

    return results;
  }

  async queueMove(moveId, options = {}) {
    const combat = game.combat ?? null;
    if (!combat) {
      return this.rollMove(moveId, options);
    }

    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    if (this._isDedicatedReactionMove(move)) {
      ui.notifications.warn("Use Clash and Evasion only through the reaction prompt.");
      return null;
    }
    if (this._getMoveSeedId(move) === "move-gigaton-hammer" && this._usedMoveInPreviousRound(move)) {
      ui.notifications.warn(`${move.name} fails because it was used in the previous round.`);
      return null;
    }

    if (!options.skipActionCheck) {
      const actionCheck = await this._assertCanAct("move", {
        moveId: move.id,
        moveName: move.name,
        allowWhileSleeping: this._getMoveSeedId(move) === "move-sleep-talk"
      });
      if (!actionCheck.allowed) {
        ui.notifications.warn(actionCheck.reason);
        return null;
      }
    }

    const currentCombatantActorId = `${combat.combatant?.actor?.id ?? ""}`.trim();
    if (currentCombatantActorId && currentCombatantActorId !== this.id) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.MoveQueueOnlyCurrentTurn"));
      return null;
    }

    const combatant = combat.combatants.find((entry) => entry.actor?.id === this.id) ?? null;
    if (!combatant) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }

    const selectedTargetActors = Array.isArray(options.targetActorIds)
      ? this._resolveActorsFromIds(options.targetActorIds)
      : this._getSelectedTargetActors();
    const moveTargetKey = this._resolveMoveTargetKeyForMove(move);
    const targetActors = this._resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors);
    const targetValidation = this._validateMoveTargetSelection(
      moveTargetKey,
      selectedTargetActors,
      targetActors
    );
    if (!targetValidation.valid) {
      ui.notifications.warn(targetValidation.message);
      return null;
    }

    const terrainFailureDetail = this._getTerrainRuntimeFailureDetail(move);
    if (terrainFailureDetail) {
      ui.notifications.warn(terrainFailureDetail);
      return null;
    }

    const enqueueMove = game.pokrole?.enqueueCombatMoveDeclaration;
    if (typeof enqueueMove !== "function") {
      return this.rollMove(moveId, options);
    }

    const priority = this._resolveEffectiveMovePriority(move, this);
    const initiative = Math.max(
      toNumber(combatant.initiative, toNumber(this.system?.combat?.initiative, 0)),
      0
    );

    const queueEntry = await enqueueMove(
      {
        actorId: this.id,
        combatantId: `${combatant.id ?? ""}`.trim(),
        userId: `${game.user?.id ?? ""}`.trim(),
        moveId: move.id,
        moveName: `${move.name ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim(),
        moveImg: `${move.img ?? ""}`.trim(),
        priority,
        initiative,
        targetActorIds: targetActors.map((actor) => actor.id).filter(Boolean),
        targetMode: moveTargetKey,
        declaredAt: Date.now(),
        declaredRound: Math.max(Math.floor(toNumber(combat.round, 0)), 0),
        declaredTurn: Number.isInteger(combat.turn) ? combat.turn : 0
      },
      combat
    );

    ui.notifications.info(
      game.i18n.format("POKROLE.Combat.MoveQueued", {
        actor: this.name,
        move: move.name
      })
    );

    return {
      queued: true,
      move,
      queueEntry
    };
  }

  async rollMove(moveId, options = {}) {
    await this.synchronizeConditionalActiveEffects();
    if (this.type !== "pokemon") return null;
    const move = this.items.get(moveId);
    if (!move || move.type !== "move") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMove"));
      return null;
    }
    if (this._isDedicatedReactionMove(move)) {
      ui.notifications.warn("Use Clash and Evasion only through the reaction prompt.");
      return null;
    }
    if (this._getMoveSeedId(move) === "move-gigaton-hammer" && this._usedMoveInPreviousRound(move)) {
      ui.notifications.warn(`${move.name} fails because it was used in the previous round.`);
      return null;
    }
    const actionCheck = await this._assertCanAct("move", {
      moveId: move.id,
      moveName: move.name,
      allowWhileSleeping: this._getMoveSeedId(move) === "move-sleep-talk"
    });
    if (!actionCheck.allowed) {
      ui.notifications.warn(actionCheck.reason);
      return null;
    }
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const frozenBreakoutActive = this._isConditionActive("frozen");
    const moveTargetKey = this._resolveMoveTargetKeyForMove(move);
    const infatuated =
      !frozenBreakoutActive &&
      this._hasInfatuationPenaltyThisRound() &&
      this._moveUsesPrimaryDamage(move) &&
      this._moveShouldAutoHoldBackFromInfatuation(moveTargetKey);
    let holdingBackMode = "none";
    if (frozenBreakoutActive) {
      holdingBackMode = "none";
    } else if (infatuated) {
      holdingBackMode = "half";
    } else {
      holdingBackMode = await this._resolveHoldingBackChoice(move, options);
      if (holdingBackMode === null) return null;
    }
    const isHoldingBackHalf = holdingBackMode === "half";
    const inflictLethalDamage = holdingBackMode === "lethal";
    const canInflictDeathOnKo = inflictLethalDamage && !isHoldingBackHalf;
    const actionNumber = await this._resolveActionRequirement(options.actionNumber, roundKey);
    const activeWeather = this.getActiveWeatherKey();
    // Choice Band / Choice Specs / Choice Scarf: lock to one move
    const choiceHeldData = this._getHeldItemData();
    if (choiceHeldData?.choiceType) {
      const lockedMoveId = this.getFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG) ?? null;
      if (lockedMoveId && lockedMoveId !== move.id) {
        const lockedMove = this.items.get(lockedMoveId);
        const lockedMoveName = lockedMove?.name ?? "a locked move";
        ui.notifications.warn(`${this.name} is locked to ${lockedMoveName} by its Choice item!`);
        return null;
      }
      if (!lockedMoveId) {
        await this.setFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG, move.id);
      }
    }
    const isShieldMove = Boolean(move.system?.shieldMove);
    if (isShieldMove && roundKey) {
      const shieldState = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
      const lastShieldRound = `${shieldState?.lastRoundKey ?? ""}`.trim();
      if (lastShieldRound && lastShieldRound === `${roundKey}`.trim()) {
        ui.notifications.warn(
          game.i18n.localize("POKROLE.Errors.ShieldMoveAlreadyUsedThisRound")
        );
        return null;
      }
    }
    const shieldPenalty = isShieldMove ? this._getShieldMoveAccuracyPenalty(roundKey) : 0;
    const willCost = Math.max(Math.floor(toNumber(move.system?.willCost, 0)), 0);
    const painPenalty = this.getPainPenalty();
    const multiTurnState = this._getMultiTurnState();
    const explicitTargetActorIds =
      Array.isArray(options.targetActorIds) && options.targetActorIds.length > 0
        ? options.targetActorIds
        : null;
    const liveSelectedTargetActors = explicitTargetActorIds
      ? this._resolveActorsFromIds(explicitTargetActorIds)
      : this._getSelectedTargetActors();
    const selectedTargetActors =
      liveSelectedTargetActors.length > 0
        ? liveSelectedTargetActors
        : multiTurnState.moveId === move.id && Array.isArray(multiTurnState.targetActorIds)
          ? this._resolveActorsFromIds(multiTurnState.targetActorIds)
          : [];
    const targetActors = this._resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors);
    const targetValidation = this._validateMoveTargetSelection(
      moveTargetKey,
      selectedTargetActors,
      targetActors
    );
    if (!targetValidation.valid) {
      ui.notifications.warn(targetValidation.message);
      return null;
    }
    const specialSupportFailureReason = this._getSpecialSupportMoveFailureReason(move);
    if (specialSupportFailureReason) {
      ui.notifications.warn(specialSupportFailureReason);
      return null;
    }
    const specialDamageFailureReason = this._getSpecialDamageMoveFailureReason(move, targetActors);
    if (specialDamageFailureReason) {
      ui.notifications.warn(specialDamageFailureReason);
      return null;
    }
    const primaryTargetActor = targetActors[0] ?? null;
    const externalMoveRuntime = await this._prepareExternalMoveRuntime(move, {
      targetActors,
      targetActor: primaryTargetActor,
      roundKey,
      actionNumber
    });
    if (externalMoveRuntime === null) {
      return null;
    }
    const dynamicMoveRuntime = await this._prepareDynamicMoveRuntime(move, {
      targetActors,
      targetActor: primaryTargetActor,
      actionNumber,
      activeWeather
    });
    if (dynamicMoveRuntime === null) {
      return null;
    }
    const moveType = this._resolveEffectiveMoveType(move, this, {
      targetActor: primaryTargetActor,
      activeWeather,
      runtimeOverride: dynamicMoveRuntime
    });
    if (!this._moveIgnoresDamagePrevention(move) && this._isMoveTypeBlockedByWeather(moveType, activeWeather)) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.MoveBlockedByWeather", {
          weather: this._localizeWeatherName(activeWeather)
        })
      );
      return null;
    }

    if (this._isConditionActive("frozen")) {
      return this._resolveFrozenBreakoutMove(move, {
        roundKey,
        actionNumber,
        willCost,
        willBefore: Math.max(Math.floor(toNumber(this.system?.resources?.will?.value, 0)), 0),
        willAfter: Math.max(Math.floor(toNumber(this.system?.resources?.will?.value, 0)), 0),
        runtimeOverride: dynamicMoveRuntime,
        advanceAction: options.advanceAction !== false
      });
    }

    const secondaryEffects = this._collectMoveSecondaryEffects(move);
    const multiTurnPreparation = await this._resolveMultiTurnMovePreparation(move, {
      roundKey,
      actionNumber,
      targetActors,
      moveTargetKey,
      secondaryEffects,
      advanceAction: options.advanceAction
    });
    if (multiTurnPreparation?.handled) {
      return multiTurnPreparation.result ?? null;
    }

    if (Array.isArray(multiTurnPreparation?.bypassLines) && multiTurnPreparation.bypassLines.length > 0) {
      await this._postMultiTurnNotice(
        game.i18n.localize("POKROLE.Chat.MultiTurn.Title"),
        multiTurnPreparation.bypassLines
      );
    }
    const skippedSecondaryEffectSignatures =
      multiTurnPreparation?.skipSecondaryEffectSignatures instanceof Set
        ? multiTurnPreparation.skipSecondaryEffectSignatures
        : new Set();

    const formulaTargetActor = targetActors[0] ?? null;
    const accuracySetup = this._resolveMoveAccuracySetup(move, formulaTargetActor, actionNumber);
    const accuracyDicePoolBase = accuracySetup.accuracyDicePoolBase;
    const accuracyAttributeKey = accuracySetup.accuracyAttributeKey;
    const accuracySkillKey = accuracySetup.accuracySkillKey;
    const accuracyDiceModifier = clamp(
      Math.floor(toNumber(move.system?.accuracyDiceModifier, 0)),
      -99,
      99
    );
    const accuracyFlatModifier = clamp(
      Math.floor(toNumber(move.system?.accuracyFlatModifier, 0)),
      -99,
      99
    );
    const heldAccuracyBonus = this._getHeldItemData()?.accuracyBonusDice ?? 0;
    const accuracyDicePool = Math.max(accuracyDicePoolBase + accuracyDiceModifier + heldAccuracyBonus, 1);

    if (!Number.isFinite(accuracyDicePoolBase)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownMoveTraits"));
      return null;
    }
    const currentWill = Math.max(Math.floor(toNumber(this.system?.resources?.will?.value, 0)), 0);
    if (willCost > currentWill) {
      ui.notifications.warn(
        game.i18n.format("POKROLE.Errors.NotEnoughWill", { current: currentWill, required: willCost })
      );
      return null;
    }
    const terrainFailureDetail = this._getTerrainRuntimeFailureDetail(move);
    if (terrainFailureDetail) {
      ui.notifications.warn(terrainFailureDetail);
      return null;
    }
    let willBefore = currentWill;
    let willAfter = currentWill;
    let appliedWillCost = 0;

    const confusionPenalty = this._hasConfusionPenaltyThisRound() ? 1 : 0;
    const heldReducedLowAccuracy = this._getHeldItemData()?.reducedLowAccuracy ?? 0;
    const reducedAccuracy = Math.max(toNumber(move.system.reducedAccuracy, 0) - heldReducedLowAccuracy, 0) + shieldPenalty;
    const targetBrightPowder = targetActors[0]?._getHeldItemData?.()?.accuracyPenaltyToAttacker ?? 0;
    const requiredSuccesses = actionNumber;
    const accuracyRoll = await new Roll(successPoolFormula(accuracyDicePool)).evaluate();
    let rawAccuracySuccesses = toNumber(accuracyRoll.total, 0);
    const luckyChantAccuracyReroll = await this._applyLuckyChantReroll(
      rawAccuracySuccesses,
      accuracyDicePool,
      game.i18n.format("POKROLE.Chat.MoveAccuracyFlavor", {
        actor: this.name,
        move: move.name,
        required: requiredSuccesses
      })
    );
    rawAccuracySuccesses += luckyChantAccuracyReroll.bonusSuccesses;
    const modifiedAccuracySuccesses = rawAccuracySuccesses + accuracyFlatModifier;
    const removedAccuracySuccesses = reducedAccuracy + painPenalty + confusionPenalty + targetBrightPowder;
    const netAccuracySuccesses = modifiedAccuracySuccesses - removedAccuracySuccesses;
    const passedAccuracyRoll = netAccuracySuccesses >= requiredSuccesses;
    let hit = passedAccuracyRoll;
    const heldHighCritical = this._checkHeldItemHighCritical(move);
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    const criticalThreshold = requiredSuccesses + ((move.system.highCritical || heldHighCritical) ? 2 : 3);
    let critical =
      hit &&
      (Boolean(moveSourceAttributes?.alwaysCrit) || netAccuracySuccesses >= criticalThreshold);

    await accuracyRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.MoveAccuracyFlavor", {
        actor: this.name,
        move: move.name,
        required: requiredSuccesses
      })
    });

    const targetPartition = this._partitionTargetsByChargeRange(move, targetActors);
    const blockedTargetResults = targetPartition.blockedTargets.map((entry) => ({
      targetName: entry.actor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
      detail: game.i18n.format("POKROLE.Chat.MultiTurn.OutOfRangeBlocked", {
        target: entry.actor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        move: entry.moveName
      })
    }));
    if (targetPartition.blockedTargets.length > 0) {
      targetActors = targetPartition.reachableTargets;
      if (targetActors.length <= 0) {
        hit = false;
        critical = false;
      }
    }

    const targetActor = targetActors[0] ?? null;
    const category = move.system.category || "physical";
    const isDamagingMove = this._moveUsesPrimaryDamage(move);
    const delayedMoveAutomation = await this._prepareDelayedMoveAutomation(move, {
      targetActors,
      targetActor,
      moveTargetKey,
      hit
    });
    if (delayedMoveAutomation.skipMoveSecondaryEffectSignatures instanceof Set) {
      for (const signature of delayedMoveAutomation.skipMoveSecondaryEffectSignatures) {
        skippedSecondaryEffectSignatures.add(signature);
      }
    }
    const skipImmediateDamage =
      Boolean(delayedMoveAutomation.skipImmediateDamage) ||
      Boolean(externalMoveRuntime.skipImmediateDamage);
    let reaction = {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };
    let recoilResult = null;

    const canUseDefensiveReaction =
      hit &&
      isDamagingMove &&
      targetActor &&
      targetActor !== this &&
      targetActors.length === 1;

    if (canUseDefensiveReaction) {
      reaction = await this._resolveDefensiveReaction({
        targetActor,
        move,
        roundKey,
        netAccuracySuccesses
      });

      if (reaction.evaded) {
        hit = false;
      }
    }

    if (hit && willCost > 0) {
      appliedWillCost = willCost;
      willAfter = Math.max(currentWill - willCost, 0);
      try {
        await this.update({ "system.resources.will.value": willAfter });
      } catch (error) {
        console.error(`${POKROLE.ID} | Failed to apply Will cost`, error);
        ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
        willAfter = currentWill;
        appliedWillCost = 0;
      }
    }

    let damageRoll = null;
    let damageSuccesses = 0;
    let finalDamage = reaction.targetDamage ?? 0;
    let hpAfter = null;
    let hpBefore = null;
    let defense = 0;
    let poolBeforeDefense = 0;
    let damagePool = 0;
    let shieldDetail = "";
    let typeInteraction = {
      immune: false,
      weaknessBonus: 0,
      resistancePenalty: 0,
      label: "POKROLE.Chat.TypeEffect.Neutral"
    };
    let stabDice = 0;
    let heldItemBonus = 0;
    let criticalDice = critical ? 2 : 0;
    let movePower = Math.max(Math.floor(toNumber(move.system?.power, 0)), 0);
    let damageBaseValue = 0;
    let damageAttributeLabel = this.localizeTrait("none");
    const damageTargetResults = [];
    let firstDamageResult = null;

    if (
      hit &&
      isDamagingMove &&
      !reaction.clashResolved &&
      !skipImmediateDamage
    ) {
      const damageTargets = this._resolveDamageTargets(moveTargetKey, targetActors, move);
      const targetsToDamage = damageTargets.length > 0 ? damageTargets : targetActor ? [targetActor] : [];

      for (const actorTarget of targetsToDamage) {
        const damageResult = await this._resolveMoveDamageAgainstTarget({
          move,
          targetActor: actorTarget,
          painPenalty,
          critical,
          isHoldingBackHalf,
          canInflictDeathOnKo,
          actionNumber,
          roundKey,
          attackOverrides: {
            moveType,
            runtimeOverride: dynamicMoveRuntime,
            ...(externalMoveRuntime.attackOverrides ?? {})
          }
        });
        damageTargetResults.push(damageResult);
      }

      firstDamageResult = damageTargetResults[0];
      if (firstDamageResult) {
        damageRoll = firstDamageResult.damageRoll;
        damageSuccesses = firstDamageResult.damageSuccesses;
        finalDamage = firstDamageResult.finalDamage;
        hpBefore = firstDamageResult.hpBefore;
        hpAfter = firstDamageResult.hpAfter;
        defense = firstDamageResult.defense;
        poolBeforeDefense = firstDamageResult.poolBeforeDefense;
        damagePool = firstDamageResult.damagePool;
        shieldDetail = firstDamageResult.shieldDetail ?? "";
        typeInteraction = firstDamageResult.typeInteraction;
        stabDice = firstDamageResult.stabDice;
        heldItemBonus = firstDamageResult.heldItemBonus ?? 0;
        criticalDice = firstDamageResult.criticalDice;
        critical = firstDamageResult.effectiveCritical === true;
        movePower = Math.max(Math.floor(toNumber(firstDamageResult.movePower, movePower)), 0);
        damageBaseValue = Math.max(Math.floor(toNumber(firstDamageResult.damageAttributeValue, 0)), 0);
        damageAttributeLabel = firstDamageResult.damageAttributeLabel;
      }

    }

    recoilResult = await this._applyMoveRecoilDamage(move, damageTargetResults);

    let confusionSelfDamage = null;
    if (confusionPenalty > 0 && !hit) {
      confusionSelfDamage = await this._safeApplyDamage(this, 1);
    }

    const blockedTargetIds = new Set(
      damageTargetResults
        .filter((entry) => Boolean(entry?.substituteBlocked) && entry?.targetActor?.id)
        .map((entry) => entry.targetActor.id)
    );

    const moveSecondaryEffectResults = await this._applyMoveSecondaryEffects({
      move,
      moveTargetKey,
      secondaryEffects,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage,
      damageTargetResults,
      roundKey,
      skipEffectSignatures: skippedSecondaryEffectSignatures,
      blockedTargetIds
    });
    const abilitySecondaryEffectResults = await this._applyAbilityAutomationEffects({
      move,
      moveTargetKey,
      targetActors,
      hit,
      isDamagingMove,
      finalDamage,
      damageTargetResults,
      roundKey,
      blockedTargetIds
    });
    // Defender ability effects (e.g. Flame Body, Static, Poison Point on being hit)
    const defenderAbilityResults = [];
    if (hit && isDamagingMove) {
      for (const damageResult of damageTargetResults) {
        const defenderActor = damageResult?.targetActor;
        if (
          defenderActor instanceof PokRoleActor &&
          defenderActor.id !== this.id &&
          typeof defenderActor._applyDefenderAbilityEffects === "function"
        ) {
          const defResults = await defenderActor._applyDefenderAbilityEffects({
            attackerActor: this,
            move,
            moveTargetKey,
            hit,
            isDamagingMove,
            finalDamage: toNumber(damageResult?.finalDamage, 0),
            damageTargetResults,
            roundKey,
            critical: damageResult?.effectiveCritical === true
          });
          defenderAbilityResults.push(...defResults);
        }
      }
    }
    const secondaryEffectResults = [
      ...(recoilResult ? [recoilResult] : []),
      ...(Array.isArray(externalMoveRuntime?.results) ? externalMoveRuntime.results : []),
      ...(Array.isArray(dynamicMoveRuntime?.results) ? dynamicMoveRuntime.results : []),
      ...(Array.isArray(delayedMoveAutomation.results) ? delayedMoveAutomation.results : []),
      ...moveSecondaryEffectResults,
      ...abilitySecondaryEffectResults,
      ...defenderAbilityResults
    ];
    const terrainFieldMoveResults = await this._applyTerrainFieldMoveRuntime({
      move,
      hit
    });
    secondaryEffectResults.push(...terrainFieldMoveResults);
    const sideFieldMoveResults = await this._applySideFieldMoveRuntime(move, {
      hit,
      primaryTarget: targetActor
    });
    secondaryEffectResults.push(...sideFieldMoveResults);
    const lockingMoveResults = await this._applyLockingMoveRuntime(move, {
      hit,
      targetActors,
      targetActor,
      combat: game.combat,
      roundKey,
      netAccuracySuccesses
    });
    secondaryEffectResults.push(...lockingMoveResults);
    const switcherMoveResults = await this._executeSwitcherMoveRuntime({
      move,
      moveTargetKey,
      targetActors,
      hit,
      roundKey
    });
    secondaryEffectResults.push(...switcherMoveResults);
    const supportMoveRuntimeResults = await this._applySpecialSupportMoveRuntime(move, {
      hit,
      targetActors,
      targetActor,
      actionNumber,
      roundKey
    });
    secondaryEffectResults.push(...supportMoveRuntimeResults);
    const copyMoveRuntimeResults = await this._applyCopyMoveRuntime(move, {
      hit,
      primaryTarget: targetActor,
      targetActors,
      roundKey
    });
    secondaryEffectResults.push(...copyMoveRuntimeResults);
    const accuracyDiceModifierLabel =
      accuracyDiceModifier > 0 ? `+${accuracyDiceModifier}` : `${accuracyDiceModifier}`;
    const accuracyFlatModifierLabel =
      accuracyFlatModifier > 0 ? `+${accuracyFlatModifier}` : `${accuracyFlatModifier}`;

    const summaryHtml = await renderTemplate(
      getSystemAssetPath("templates/chat/move-roll.hbs"),
      {
        actorName: this.name,
        moveName: move.name,
        moveTypeLabel: this.localizeTrait(moveType),
        moveTargetLabel: this._localizeMoveTarget(moveTargetKey),
        categoryLabel: game.i18n.localize(
          MOVE_CATEGORY_LABEL_BY_KEY[category] ?? "POKROLE.Common.Unknown"
        ),
        willCost: appliedWillCost,
        willBefore,
        willAfter,
        accuracyDicePoolBase,
        accuracyDiceModifier,
        accuracyDiceModifierLabel,
        accuracyFlatModifier,
        accuracyFlatModifierLabel,
        accuracyAttributeLabel: accuracySetup.accuracyAttributeLabel,
        accuracySkillLabel: accuracySetup.accuracySkillLabel,
        accuracySummaryLabel: accuracySetup.accuracySummaryLabel,
        actionNumber,
        requiredSuccesses,
        rawAccuracySuccesses,
        modifiedAccuracySuccesses,
        removedAccuracySuccesses,
        netAccuracySuccesses,
        hit,
        critical,
        reactionAttempted: reaction.attempted,
        reactionTypeLabel: game.i18n.localize(reaction.label),
        reactionSuccess: reaction.success,
        reactionNetSuccesses: reaction.netSuccesses,
        reactionClashMoveName: reaction.clashMoveName,
        reactionAttackerDamage: reaction.attackerDamage,
        reactionTargetDamage: reaction.targetDamage,
        holdingBackActive: holdingBackMode !== "none",
        holdingBackLabel:
          holdingBackMode === "half"
            ? game.i18n.localize("POKROLE.Chat.HoldingBack.HalfDamage")
            : holdingBackMode === "lethal"
              ? game.i18n.localize("POKROLE.Chat.HoldingBack.Lethal")
              : game.i18n.localize("POKROLE.Chat.HoldingBack.None"),
        infatuated,
        activeWeather,
        isDamagingMove,
        showDamageSection: hit && isDamagingMove && !reaction.clashResolved && !skipImmediateDamage,
        damageAttributeLabel,
        damageBaseValue,
        movePower,
        poolBeforeDefense,
        defense,
        damagePool,
        damageSuccesses,
        stabDice,
        heldItemBonus,
        terrainBonusDice: firstDamageResult?.terrainBonusDice ?? 0,
        weatherBonusDice: firstDamageResult?.weatherBonusDice ?? 0,
        expertBeltBonus: firstDamageResult?.expertBeltBonus ?? 0,
        destroyShieldBonusDice: firstDamageResult?.destroyShieldBonusDice ?? 0,
        metronomeBonus: firstDamageResult?.metronomeBonus ?? 0,
        damagePainPenalty: firstDamageResult?.damagePainPenalty ?? 0,
        criticalDice,
        typeLabel: game.i18n.localize(typeInteraction.label),
        finalDamage,
        shieldDetail,
        targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
        additionalTargetResults: damageTargetResults.slice(1).map((entry) => ({
          targetName: entry.targetName,
          finalDamage: entry.finalDamage,
          hpBefore: entry.hpBefore,
          hpAfter: entry.hpAfter,
          hasHpUpdate: entry.hpBefore !== null && entry.hpAfter !== null,
          shieldDetail: entry.shieldDetail ?? ""
        })),
        blockedTargetResults,
        hasBlockedTargets: blockedTargetResults.length > 0,
        secondaryEffectResults,
        hasSecondaryEffects: secondaryEffectResults.length > 0,
        hasHpUpdate: hpAfter !== null && hpBefore !== null,
        hpBefore,
        hpAfter,
        confusionPenalty,
        confusionSelfDamage
      }
    );

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: summaryHtml
    });

    if (externalMoveRuntime.consumeHeldItem) {
      await this._consumeHeldBattleItem();
    }

    await this._applyPostMoveRuntimeState(move, { hit, roundKey });
    await this._recordLastMoveResolution(move, {
      roundKey,
      failedAccuracyRoll: !passedAccuracyRoll
    });

    if (this._shouldFaintAfterMoveUse(move, { isDamagingMove, hit, damageTargetResults })) {
      const selfHp = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
      if (selfHp > 0) {
        await this._safeApplyDamage(this, selfHp, { applyDeadOnZero: false });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: game.i18n.format("POKROLE.Chat.SpecialDamage.UserFainted", {
            actor: this.name,
            move: move.name
          })
        });
      }
    }

    await this._recordLastUsedMove(move);

    // Throat Spray: +1 special after using a sound-based move
    const postMoveHeldData = this._getHeldItemData();
    if (postMoveHeldData?.throatSpray && hit) {
      const SOUND_KEYWORDS = ["sound", "cry", "voice", "sing", "roar", "screech", "growl", "howl",
        "chatter", "echo", "hyper voice", "boomburst", "uproar", "snore", "round", "relic song",
        "snarl", "disarming voice", "bug buzz", "grass whistle", "metal sound", "perish song",
        "noble roar", "parting shot", "sparkling aria", "clangorous", "overdrive", "eerie spell"];
      const moveDesc = `${move.system?.description ?? ""}`.toLowerCase();
      const moveName = `${move.name ?? ""}`.toLowerCase();
      const isSoundMove = SOUND_KEYWORDS.some((kw) => moveDesc.includes(kw) || moveName.includes(kw));
      if (isSoundMove) {
        await this._applyStatEffectToActor(
          { stat: "special", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
          this,
          move
        );
        await this.update({ "system.battleItem": "" });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: `<strong>${this.name}'s</strong> Throat Spray activated! Special increased by 1.`
        });
      }
    }

    const result = {
      accuracyRoll,
      damageRoll,
      hit,
      critical,
      reaction,
      finalDamage,
      secondaryEffectResults,
      damageTargetResults,
      blockedTargetResults
    };

    await this._finalizeMultiTurnMoveResolution(move, result, {
      moveTargetKey,
      targetActors
    });

    await this.processTemporaryEffectSpecialDuration("next-attack", {
      combatId: game.combat?.id ?? null
    });
    if (hit) {
      await this.processTemporaryEffectSpecialDuration("next-hit", {
        combatId: game.combat?.id ?? null
      });
    }
    if (hit) {
      const hitTargets =
        damageTargetResults.length > 0
          ? damageTargetResults
          : targetActors.map((actor) => ({ targetActor: actor, finalDamage: 0 }));
      for (const targetEntry of hitTargets) {
        const target = targetEntry?.targetActor ?? null;
        if (!target || typeof target.processTemporaryEffectSpecialDuration !== "function") continue;
        await target.processTemporaryEffectSpecialDuration("is-hit", {
          combatId: game.combat?.id ?? null
        });
        await target.processTemporaryEffectSpecialDuration("is-attacked", {
          combatId: game.combat?.id ?? null
        });
        if (toNumber(targetEntry?.finalDamage, 0) > 0) {
          await target.processTemporaryEffectSpecialDuration("is-damaged", {
            combatId: game.combat?.id ?? null
          });
        }
      }
    }

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(actionNumber, roundKey);
    }
    if (isShieldMove) {
      await this._registerShieldMoveUsage(roundKey);
      await this._registerShieldProtectionFromMove(move, targetActors, roundKey);
    }

    return result;
  }

  _shouldFaintAfterMoveUse(move, context = {}) {
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    if (!moveSourceAttributes?.userFaints) return false;
    const seedId = this._getMoveSeedId(move);
    if (SUPPORT_USER_FAINT_MOVE_SEED_IDS.has(seedId)) {
      if (["move-healing-wish", "move-lunar-dance"].includes(seedId)) {
        return false;
      }
      return Boolean(context?.hit);
    }
    return Boolean(context?.isDamagingMove) &&
      (Array.isArray(context?.damageTargetResults)
        ? context.damageTargetResults.some((entry) => Math.max(toNumber(entry?.finalDamage, 0), 0) > 0)
        : false);
  }

  async _applyPostMoveRuntimeState(move, context = {}) {
    const seedId = this._getMoveSeedId(move);
    if (seedId !== "move-roost" || !game.combat || !context?.hit) return false;
    const roundKey = `${context?.roundKey ?? getCurrentCombatRoundKey() ?? ""}`.trim();
    if (!roundKey) return false;
    await this.setFlag(POKROLE.ID, ROOST_GROUNDED_ROUND_FLAG_KEY, roundKey);
    return true;
  }

  _normalizeMoveTargetKey(targetKey) {
    const normalized = `${targetKey ?? "foe"}`.trim().toLowerCase();
    if (MOVE_TARGET_KEYS.includes(normalized)) return normalized;
    return LEGACY_MOVE_TARGET_MAP[normalized] ?? "foe";
  }

  _localizeMoveTarget(targetKey) {
    const normalized = this._normalizeMoveTargetKey(targetKey);
    const labelByTarget = {
      foe: "POKROLE.Move.TargetValues.Foe",
      "random-foe": "POKROLE.Move.TargetValues.RandomFoe",
      "all-foes": "POKROLE.Move.TargetValues.AllFoes",
      self: "POKROLE.Move.TargetValues.Self",
      ally: "POKROLE.Move.TargetValues.Ally",
      "all-allies": "POKROLE.Move.TargetValues.AllAllies",
      area: "POKROLE.Move.TargetValues.Area",
      battlefield: "POKROLE.Move.TargetValues.Battlefield",
      "foe-battlefield": "POKROLE.Move.TargetValues.FoeBattlefield",
      "ally-battlefield": "POKROLE.Move.TargetValues.AllyBattlefield",
      "battlefield-area": "POKROLE.Move.TargetValues.BattlefieldArea"
    };
    return game.i18n.localize(labelByTarget[normalized] ?? "POKROLE.Common.Unknown");
  }

  _getSelectedTargetActors() {
    return [...(game.user?.targets ?? [])].map((token) => token.actor).filter(Boolean);
  }

  _resolveActorsFromIds(actorIds = []) {
    const ids = Array.isArray(actorIds) ? actorIds : [];
    const uniqueActors = new Map();
    for (const actorId of ids) {
      const normalizedId = `${actorId ?? ""}`.trim();
      if (!normalizedId) continue;
      const actor = game.actors?.get(normalizedId) ?? null;
      if (!actor) continue;
      uniqueActors.set(actor.id, actor);
    }
    return [...uniqueActors.values()];
  }

  _resolveActorsForMoveTarget(moveTargetKey, selectedTargetActors = []) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const actorKey = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(actorKey)) uniqueActors.set(actorKey, actor);
    };

    if (normalizedTarget === "self") {
      addActor(this);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "all-allies") {
      addActor(this);
      for (const actor of selectedTargetActors) addActor(actor);
      return [...uniqueActors.values()];
    }

    if (normalizedTarget === "ally") {
      if (selectedTargetActors.length > 0) addActor(selectedTargetActors[0]);
      else addActor(this);
      return [...uniqueActors.values()];
    }

    for (const actor of selectedTargetActors) addActor(actor);
    return [...uniqueActors.values()];
  }

  _validateMoveTargetSelection(moveTargetKey, selectedTargetActors = [], resolvedTargetActors = []) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const requiresSelection = new Set([
      "foe",
      "random-foe",
      "ally",
      "all-foes",
      "all-allies",
      "area",
      "battlefield-area"
    ]);
    if (!requiresSelection.has(normalizedTarget)) {
      return { valid: true, message: "" };
    }
    if ((selectedTargetActors ?? []).length > 0 || (resolvedTargetActors ?? []).length > 0) {
      return { valid: true, message: "" };
    }
    return {
      valid: false,
      message: game.i18n.localize("POKROLE.Errors.InvalidMoveTargetSelection")
    };
  }

  _resolveDamageTargets(moveTargetKey, targetActors, move = null) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    if (!Array.isArray(targetActors) || targetActors.length === 0) {
      if (normalizedTarget === "self") return [this];
      return [];
    }

    if (["all-foes", "area", "battlefield-area"].includes(normalizedTarget)) {
      return targetActors;
    }
    const primaryTargets = [targetActors[0]];
    const extraTargets = this._getAdditionalDamageTargetsFromTerrain(move, targetActors, this);
    return [...primaryTargets, ...extraTargets];
  }

  async _resolveMoveDamageAgainstTarget({
    move,
    targetActor,
    painPenalty,
    critical,
    isHoldingBackHalf,
    canInflictDeathOnKo = false,
    actionNumber = 1,
    roundKey = null,
    attackOverrides = {}
  }) {
    const category = `${attackOverrides?.category ?? ""}`.trim().toLowerCase() || move.system.category || "physical";
    const moveType = `${attackOverrides?.moveType ?? ""}`.trim()
      ? this._normalizeTypeKey(attackOverrides.moveType)
      : this._resolveEffectiveMoveType(move, this);
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    const specialChargeRule = this._getSpecialChargeMoveRule(move);
    const specialDamageRule = this._getMoveSpecialDamageRule(move);
    const damageBaseSetup = this._resolveMoveDamageBase(move, targetActor, actionNumber);
    const damageAttributeLabel = damageBaseSetup.label;
    const damageAttributeValue = Math.max(Math.floor(toNumber(damageBaseSetup.value, 0)), 0);
    const terrainPowerOverride = this._getTerrainPowerOverride(move, this, targetActor);
    const power =
      terrainPowerOverride === null
        ? this._resolveMovePower(move, targetActor, actionNumber, {
            runtimeOverride: attackOverrides?.runtimeOverride ?? null
          })
        : terrainPowerOverride;
    const movePower = Math.max(Math.floor(toNumber(power, 0)), 0);
    const damagePainPenalty = damageBaseSetup.ignoresPainPenalty ? 0 : painPenalty;
    const targetProtectedByLuckyChant =
      targetActor instanceof PokRoleActor && targetActor._hasLuckyChantProtection?.(targetActor, { combatId: game.combat?.id ?? null });
    const effectiveCritical = Boolean(critical) && !targetProtectedByLuckyChant;
    const criticalDice = effectiveCritical ? 2 : 0;
    const stabDice = attackOverrides?.ignoreStab ? 0 : (this.hasType(moveType) ? 1 : 0);
    const heldItemBonus =
      this._getHeldItemDamageBonus(moveType, category) +
      Math.max(Math.floor(toNumber(attackOverrides?.extraDamageDice, 0)), 0);
    const activeWeather = this.getActiveWeatherKey();
    const weatherBonusDice = attackOverrides?.ignoreWeather
      ? 0
      : this._getWeatherDamageBonusDice(moveType, activeWeather);
    const weatherFlatReduction = attackOverrides?.ignoreWeather
      ? 0
      : this._getWeatherFlatDamageReduction(moveType, activeWeather);
    const terrainBonusDice = attackOverrides?.ignoreTerrain
      ? 0
      : this._getTerrainDamageBonusDice(move, this);
    const ignoresCover = Boolean(
      attackOverrides?.ignoreCover ??
        (specialChargeRule?.ignoresCover || specialDamageRule?.ignoresCover)
    );
    const ignoresShield = Boolean(
      attackOverrides?.ignoreShield ??
        (specialChargeRule?.ignoresShield || specialDamageRule?.ignoresShield)
    );
    const ignoresSubstitute = Boolean(
      attackOverrides?.ignoreSubstitute ?? specialDamageRule?.ignoresSubstitute
    );
    const ignoresDefenses = Boolean(
      attackOverrides?.ignoreDefenses ??
        (specialChargeRule?.ignoresDefenses ||
          specialDamageRule?.ignoresDefenses ||
          moveSourceAttributes?.ignoreDefenses)
    );
    const defenseCategory = moveSourceAttributes?.resistedWithDefense ? "physical" : category;
    const coverDefenseBonus = (targetActor && !ignoresCover) ? this._getCoverDefenseBonus(targetActor, move) : 0;
    const weatherDefenseBonus = targetActor?.type === "pokemon"
      ? targetActor._getWeatherDefenseBonusForStat(defenseCategory, activeWeather)
      : 0;
    const defense = targetActor
      ? (ignoresDefenses ? 0 : this._getTargetDefense(targetActor, defenseCategory)) + coverDefenseBonus
      : 0;
    let typeInteraction = targetActor
      ? this._evaluateTypeInteraction(moveType, targetActor)
      : {
          immune: false,
          weaknessBonus: 0,
          resistancePenalty: 0,
          label: "POKROLE.Chat.TypeEffect.Neutral"
        };
    if (specialDamageRule?.ignoreTypeInteraction) {
      typeInteraction = {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }
    if (attackOverrides?.ignoreTypeImmunity && typeInteraction.immune) {
      let label = "POKROLE.Chat.TypeEffect.Neutral";
      if (typeInteraction.weaknessBonus > typeInteraction.resistancePenalty) {
        label = "POKROLE.Chat.TypeEffect.Super";
      } else if (typeInteraction.resistancePenalty > typeInteraction.weaknessBonus) {
        label = "POKROLE.Chat.TypeEffect.Resist";
      }
      typeInteraction = {
        ...typeInteraction,
        immune: false,
        label
      };
    }
    if (
      specialDamageRule?.forceSuperEffective &&
      !typeInteraction.immune &&
      typeInteraction.weaknessBonus <= typeInteraction.resistancePenalty
    ) {
      typeInteraction = {
        ...typeInteraction,
        weaknessBonus: Math.max(typeInteraction.resistancePenalty + 1, 1),
        label: "POKROLE.Chat.TypeEffect.Super"
      };
    }
    const moveSeedId = this._getMoveSeedId(move);
    let destroyedForceFieldCount = 0;
    let destroyShieldBonusDice = 0;
    if (
      targetActor instanceof PokRoleActor &&
      moveSourceAttributes?.destroyShield &&
      ["move-brick-break", "move-psychic-fangs"].includes(moveSeedId)
    ) {
      destroyedForceFieldCount = await this.clearSideFieldEntries({
        sideDisposition: this._getActorCombatSideDisposition(targetActor, game.combat),
        kind: "force-field"
      });
      if (destroyedForceFieldCount > 0 && moveSeedId === "move-brick-break") {
        destroyShieldBonusDice = 2;
      }
    }
    const expertBeltBonus = (!typeInteraction.immune && typeInteraction.weaknessBonus > 0)
      ? (this._getHeldItemData()?.superEffectiveBonusDice ?? 0)
      : 0;
    const metronomeBonus = (this._getHeldItemData()?.metronomeBonus && actionNumber > 1) ? 1 : 0;
    const fixedDamagePool = Number.isFinite(Number(attackOverrides?.fixedDamagePool))
      ? Math.max(Math.floor(toNumber(attackOverrides.fixedDamagePool, 0)), 0)
      : null;
    const rawPoolBeforeDefense =
      fixedDamagePool !== null
        ? fixedDamagePool
        :
      damageAttributeValue +
      movePower +
      stabDice +
      criticalDice +
      heldItemBonus +
      terrainBonusDice +
      weatherBonusDice +
      expertBeltBonus +
      destroyShieldBonusDice +
      metronomeBonus -
      damagePainPenalty;
    const fixedFinalDamage =
      fixedDamagePool !== null
        ? 0
        : Math.max(toNumber(specialDamageRule?.fixedFinalDamage, 0), 0);
    const poolBeforeDefense = fixedFinalDamage > 0 ? 0 : rawPoolBeforeDefense;
    const damagePool = fixedFinalDamage > 0 ? 0 : Math.max(poolBeforeDefense - defense, 0);

    let damageRoll = null;
    let damageSuccesses = 0;
    if (fixedFinalDamage > 0) {
      damageSuccesses = fixedFinalDamage;
    } else if (damagePool > 0) {
      damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate();
      damageSuccesses = toNumber(damageRoll.total, 0);
      await damageRoll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        flavor: `${game.i18n.format("POKROLE.Chat.MoveDamageFlavor", {
          actor: this.name,
          move: move.name
        })} (${targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget")})`
      });
    }

    const baseDamage = fixedFinalDamage > 0 ? fixedFinalDamage : Math.max(damageSuccesses, 1);
    let finalDamage = 0;
    let shieldPreventedDamage = false;
    let shieldDamageReduction = 0;
    let shieldAddedEffectsBlocked = false;
    let shieldDetail =
      destroyedForceFieldCount > 0
        ? `${move.name} shattered ${destroyedForceFieldCount} Force Field effect(s).${destroyShieldBonusDice > 0 ? ` +${destroyShieldBonusDice} damage dice.` : ""}`
        : "";
    let coverAbsorbedDamage = false;
    let shieldResponse =
      targetActor instanceof PokRoleActor
        ? await targetActor._resolveShieldResponseForAttack(
            this._buildShieldAttackContext(move, this, roundKey, true)
          )
        : {
            entries: [],
            damageReduction: 0,
            blocksAddedEffects: false,
            endureEntry: null,
            retaliationEntries: [],
            shieldRemoved: false
          };
    if (ignoresShield) {
      shieldResponse = {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }
    shieldAddedEffectsBlocked = Boolean(shieldResponse?.blocksAddedEffects);
    if (!typeInteraction.immune) {
      const weaknessBonus = damageSuccesses >= 1 ? typeInteraction.weaknessBonus : 0;
      const resolvedDamage = Math.max(
        baseDamage + weaknessBonus - typeInteraction.resistancePenalty,
        1
      );
      finalDamage = isHoldingBackHalf
        ? Math.max(Math.floor(resolvedDamage / 2), 1)
        : resolvedDamage;
      finalDamage = this._applyWeatherDamageReduction(finalDamage, weatherFlatReduction, {
        immune: typeInteraction.immune
      });
    }

    const rangedAttack = this._isMoveRanged(move);
    const targetCover = `${targetActor?.getTrainerCover?.() ?? "none"}`.trim().toLowerCase();
    if (!ignoresCover && rangedAttack && targetCover === "full" && finalDamage > 0) {
      finalDamage = 0;
      coverAbsorbedDamage = true;
      await this._degradeCoverOnHit(targetActor);
    }

    const hpValue = Math.max(toNumber(targetActor?.system?.resources?.hp?.value, 0), 0);
    if (finalDamage > 0 && shieldResponse?.damageReduction > 0) {
      const reducedDamage = Math.max(finalDamage - shieldResponse.damageReduction, 0);
      shieldDamageReduction = Math.max(finalDamage - reducedDamage, 0);
      finalDamage = reducedDamage;
      shieldPreventedDamage = shieldDamageReduction > 0;
    }
    if (finalDamage > 0 && shieldResponse?.endureEntry && hpValue > 0 && finalDamage >= hpValue) {
      finalDamage = Math.max(hpValue - 1, 0);
      shieldPreventedDamage = true;
      await targetActor._markShieldEndureSpent(shieldResponse.endureEntry.id, roundKey);
      shieldDetail = game.i18n.format("POKROLE.Chat.ShieldMoveEndureTriggered", {
        shield: shieldResponse.endureEntry.moveName,
        target: targetActor.name
      });
    }

    // Focus Sash: survive lethal damage at 1 HP (once)
    const targetHeldData = targetActor?._getHeldItemData?.() ?? null;
    if (finalDamage > 0 && targetHeldData?.focusSash && hpValue > 0 && finalDamage >= hpValue) {
      finalDamage = Math.max(hpValue - 1, 0);
      // Consume the Focus Sash
      const targetBattleItemId = targetActor.system.battleItem || "";
      if (targetBattleItemId) {
        let sashItem = game.items.get(targetBattleItemId);
        if (!sashItem) sashItem = targetActor.items.get(targetBattleItemId);
        if (sashItem) {
          const currentQty = toNumber(sashItem.system?.quantity, 1);
          if (currentQty > 1) {
            await sashItem.update({ "system.quantity": currentQty - 1 });
          } else {
            await targetActor.update({ "system.battleItem": "" });
          }
        }
      }
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}</strong> held on with Focus Sash!`
      });
    }

    // Sturdy: survive lethal damage at 1 HP when at full HP
    if (finalDamage > 0 && hpValue > 0 && finalDamage >= hpValue) {
      const hpMax = Math.max(toNumber(targetActor.system?.resources?.hp?.max, 1), 1);
      if (hpValue >= hpMax) {
        const activeAbilityName = `${targetActor.system?.ability ?? ""}`.trim().toLowerCase();
        if (activeAbilityName === "sturdy") {
          finalDamage = Math.max(hpValue - 1, 0);
          await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: targetActor }),
            content: `<strong>${targetActor.name}'s</strong> Sturdy prevented it from fainting!`
          });
        }
      }
    }

    let substituteBlocked = false;
    let substituteDamageAbsorbed = 0;
    if (
      targetActor instanceof PokRoleActor &&
      finalDamage > 0 &&
      !this._moveIgnoresSubstitute(move)
    ) {
      const substituteEffect = targetActor._getActiveSubstituteDecoyEffect(targetActor);
      if (substituteEffect) {
        const substituteFlags = substituteEffect.getFlag(POKROLE.ID, "automation") ?? {};
        const substituteHpBefore = Math.max(toNumber(substituteFlags?.hpRemaining, 2), 0);
        substituteDamageAbsorbed = finalDamage;
        const substituteHpAfter = Math.max(substituteHpBefore - finalDamage, 0);
        finalDamage = 0;
        substituteBlocked = true;
        const absorbDetail = game.i18n.format("POKROLE.Combat.Switcher.DecoyAbsorbedDamage", {
          decoy: substituteEffect.name,
          target: targetActor.name,
          damage: substituteDamageAbsorbed,
          hpBefore: substituteHpBefore,
          hpAfter: substituteHpAfter
        });
        shieldDetail = [shieldDetail, absorbDetail].filter(Boolean).join(" | ");
        if (substituteHpAfter <= 0) {
          await targetActor._removeSubstituteDecoyEffect(targetActor, substituteEffect);
        } else {
          await targetActor._updateSubstituteDecoyHp(targetActor, substituteEffect, substituteHpAfter);
        }
      }
    }

    let hpBefore = null;
    let hpAfter = null;
    if (targetActor && finalDamage > 0) {
      if (specialDamageRule?.minimumTargetHpSourceCurrent) {
        const sourceHpFloor = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
        finalDamage = Math.min(finalDamage, Math.max(hpValue - sourceHpFloor, 0));
      }
    }
    if (targetActor instanceof PokRoleActor && finalDamage > 0 && !ignoresSubstitute) {
      const decoyResult = await targetActor._applyDamageToSubstituteDecoy(targetActor, finalDamage);
      if (decoyResult?.intercepted) {
        finalDamage = 0;
        shieldDetail = [
          shieldDetail,
          `${targetActor.name}'s Substitute took the hit (${decoyResult.hpBefore} -> ${decoyResult.hpAfter})${decoyResult.destroyed ? " and broke" : ""}.`
        ].filter(Boolean).join(" | ");
      }
    }
    if (targetActor && finalDamage > 0) {
      const hpChange = await this._safeApplyDamage(targetActor, finalDamage, {
        applyDeadOnZero: Boolean(canInflictDeathOnKo),
        sourceMove: move,
        sourceActor: this,
        sourceActorId: this.id,
        sourceCategory: category
      });
      hpBefore = hpChange?.hpBefore ?? null;
      hpAfter = hpChange?.hpAfter ?? null;
      if (rangedAttack && !ignoresCover) {
        await this._degradeCoverOnHit(targetActor);
      }
    }

    const attackLandedOnTarget = !typeInteraction.immune && Boolean(targetActor) && !substituteBlocked;
    if (targetActor instanceof PokRoleActor && attackLandedOnTarget && damagePool > 0) {
      await targetActor._recordLastReceivedAttack({
        sourceActor: this,
        move,
        category,
        damagePool,
        roundKey
      });
    }
    if (
      targetActor instanceof PokRoleActor &&
      finalDamage > 0 &&
      specialDamageRule?.uniqueTargetPerCombat
    ) {
      await this._markSpecialDamageMoveHitTarget(move, targetActor);
    }
    if (targetActor instanceof PokRoleActor && attackLandedOnTarget) {
      const chargeHitResults = await targetActor._handleChargeMoveHitWhileCharging({
        attackMove: move,
        attackerActor: this,
        isDamagingMove: true,
        landed: true
      });
      if (Array.isArray(chargeHitResults) && chargeHitResults.length > 0) {
        shieldDetail = [shieldDetail, ...chargeHitResults.map((entry) => entry?.detail).filter(Boolean)]
          .filter(Boolean)
          .join(" | ");
      }
      const bideResults = await targetActor._handleBideIncomingAttack({
        attackerActor: this,
        attackMove: move,
        category,
        finalDamage,
        roundKey
      });
      if (Array.isArray(bideResults) && bideResults.length > 0) {
        shieldDetail = [shieldDetail, ...bideResults.map((entry) => entry?.detail).filter(Boolean)]
          .filter(Boolean)
          .join(" | ");
      }
    }

    if (targetActor instanceof PokRoleActor && finalDamage > 0 && specialChargeRule?.healingBlockHours) {
      await this._applyShadowForceHealingBlock(targetActor, move);
      shieldDetail = [
        shieldDetail,
        game.i18n.format("POKROLE.Chat.MultiTurn.ShadowForceWound", {
          target: targetActor.name,
          hours: Math.max(toNumber(specialChargeRule.healingBlockHours, 0), 0)
        })
      ].filter(Boolean).join(" | ");
    }

    // Life Orb recoil: deal recoil damage to attacker after dealing damage
    const attackerHeldData = this._getHeldItemData();
    if (attackerHeldData?.lifeOrb && damageSuccesses > 0) {
      const recoilRoll = await new Roll(successPoolFormula(damageSuccesses)).evaluate();
      const recoilDamage = toNumber(recoilRoll.total, 0);
      if (recoilDamage > 0) {
        await this._safeApplyDamage(this, recoilDamage, { applyDeadOnZero: false });
        await recoilRoll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: `${this.name} took ${recoilDamage} recoil damage from Life Orb!`
        });
      }
    }

    // Rocky Helmet: deal 1 damage to attacker on non-ranged physical contact
    if (targetHeldData?.rockyHelmet && finalDamage > 0 && !this._isMoveRanged(move) && category === "physical") {
      await this._safeApplyDamage(this, 1, { applyDeadOnZero: false });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Rocky Helmet dealt 1 damage to <strong>${this.name}</strong>!`
      });
    }

    // Sticky Barb: transfer to attacker on non-ranged physical contact
    if (targetHeldData?.stickyBarb && finalDamage > 0 && !this._isMoveRanged(move) && category === "physical") {
      const targetBattleItemId = targetActor.system.battleItem || "";
      if (targetBattleItemId) {
        await targetActor.update({ "system.battleItem": "" });
        await this.update({ "system.battleItem": targetBattleItemId });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> Sticky Barb transferred to <strong>${this.name}</strong>!`
        });
      }
    }

    // King's Rock: chance to flinch on any damaging hit
    if (attackerHeldData?.flinchOnHit && finalDamage > 0 && targetActor) {
      const flinchRoll = await new Roll("1d6").evaluate();
      const flinchResult = toNumber(flinchRoll.total, 0);
      if (flinchResult >= 6) {
        await targetActor.toggleQuickCondition("flinch", { active: true });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          content: `<strong>${this.name}'s</strong> King's Rock caused <strong>${targetActor.name}</strong> to flinch! (rolled ${flinchResult})`
        });
      }
    }

    // Weakness Policy: +1 strength and +1 special after taking super-effective damage
    if (targetHeldData?.weaknessPolicy && finalDamage > 0 && typeInteraction.weaknessBonus > 0 && targetActor) {
      await this._applyStatEffectToActor(
        { stat: "strength", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
        targetActor,
        move
      );
      await this._applyStatEffectToActor(
        { stat: "special", amount: 1, effectType: "stat", durationMode: "combat", durationRounds: 0, specialDuration: [] },
        targetActor,
        move
      );
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Weakness Policy activated! Strength and Special increased by 1.`
      });
    }

    // Eject Button: switch out the holder after taking damage
    if (targetHeldData?.ejectButton && finalDamage > 0 && targetActor) {
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Eject Button activated!`
      });
      const ejectCombat = game.combat;
      if (ejectCombat) {
        const ejectCombatant = this._getCombatantForActor(targetActor, ejectCombat);
        if (ejectCombatant) {
          const ejectReplacement = await this._chooseReservePokemonForActor(targetActor, {
            combat: ejectCombat,
            title: game.i18n.localize("POKROLE.Combat.Switcher.EjectButtonTitle")
          });
          if (ejectReplacement) {
            await this._switchCombatantToActor(ejectCombat, ejectCombatant, ejectReplacement, {
              initiative: ejectCombatant.initiative
            });
          }
        }
      }
    }

    // Red Card: force the attacker to switch out after damage
    if (targetHeldData?.redCard && finalDamage > 0 && targetActor) {
      await targetActor.update({ "system.battleItem": "" });
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Red Card activated! <strong>${this.name}</strong> is forced out!`
      });
      const redCardCombat = game.combat;
      if (redCardCombat) {
        const redCardCombatant = this._getCombatantForActor(this, redCardCombat);
        if (redCardCombatant) {
          const redCardReplacement = await this._chooseReservePokemonForActor(this, {
            combat: redCardCombat,
            title: game.i18n.localize("POKROLE.Combat.Switcher.RedCardTitle")
          });
          if (redCardReplacement) {
            await this._switchCombatantToActor(redCardCombat, redCardCombatant, redCardReplacement, {
              initiative: redCardCombatant.initiative
            });
          } else {
            await this._removeCombatantFromBattle(redCardCombat, redCardCombatant);
          }
        }
      }
    }

    const retaliationResults =
      shieldResponse?.retaliationEntries?.length > 0
        ? await targetActor._applyShieldRetaliations(shieldResponse, {
            ...this._buildShieldAttackContext(move, this, roundKey, true),
            targetActor
          })
        : [];
    const retaliationDetail = retaliationResults
      .map((entry) =>
        game.i18n.format("POKROLE.Chat.ShieldMoveRetaliation", {
          shield: entry.shieldName,
          target: entry.targetName,
          detail: entry.detail
        })
      )
      .join(" | ");
    if (!shieldDetail && shieldDamageReduction > 0) {
      shieldDetail = game.i18n.format("POKROLE.Chat.ShieldMoveDamageReduced", {
        shield: this._formatShieldEntryNameList(shieldResponse?.entries),
        amount: shieldDamageReduction
      });
    }
    if (retaliationDetail) {
      shieldDetail = [shieldDetail, retaliationDetail].filter(Boolean).join(" | ");
    }

    return {
      targetActor,
      targetName: targetActor?.name ?? game.i18n.localize("POKROLE.Chat.NoTarget"),
      damageRoll,
      damageSuccesses,
      finalDamage,
      hpBefore,
      hpAfter,
      defense,
      poolBeforeDefense,
      damagePool,
      typeInteraction,
      shieldPreventedDamage,
      shieldDamageReduction,
      shieldAddedEffectsBlocked,
      shieldDetail,
      shieldRemoved: Boolean(shieldResponse?.shieldRemoved),
      coverAbsorbedDamage,
      substituteBlocked,
      substituteDamageAbsorbed,
      terrainBonusDice,
      weatherBonusDice,
      weatherFlatReduction,
      coverDefenseBonus,
      weatherDefenseBonus,
      stabDice,
      criticalDice,
      effectiveCritical,
      heldItemBonus,
      expertBeltBonus,
      destroyShieldBonusDice,
      metronomeBonus,
      damagePainPenalty,
      movePower,
      damageAttributeValue,
      damageAttributeLabel
    };
  }

  _collectMoveSecondaryEffects(move) {
    const explicitEffects = this._normalizeSecondaryEffectDefinitions(move.system?.secondaryEffects);
    const legacyEffects = this._convertLegacyEffectGroupsToSecondaryEffects(
      move.system?.effectGroups,
      move.system?.target
    );
    const inferredEffects = this._inferSecondaryEffectsFromDescription(
      move.system?.description,
      move.system?.target,
      move
    );

    const combined = [];
    const signatures = new Set();
    const makeSignature = (effect) =>
      JSON.stringify([
        effect?.section ?? 0,
        effect?.trigger ?? "on-hit",
        effect?.chance ?? 0,
        effect?.target ?? "target",
        effect?.effectType ?? "custom",
        effect?.condition ?? "none",
        effect?.weather ?? "none",
        effect?.terrain ?? "none",
        effect?.stat ?? "none",
        effect?.amount ?? 0,
        effect?.healType ?? "basic",
        effect?.healMode ?? "fixed",
        effect?.conditional ?? false,
        `${effect?.activationCondition ?? ""}`.trim().toLowerCase(),
        `${effect?.linkedEffectId ?? ""}`.trim()
      ]);

    for (const effect of [...explicitEffects, ...legacyEffects, ...inferredEffects]) {
      const normalizedEffect = this._normalizeSecondaryEffectDefinition(effect);
      const signature = makeSignature(normalizedEffect);
      if (signatures.has(signature)) continue;
      signatures.add(signature);
      combined.push(normalizedEffect);
    }

    return this._sanitizeRuntimeHandledSecondaryEffects(
      move,
      this._sanitizeShieldMoveSecondaryEffects(move, combined)
    );
  }

  _sanitizeRuntimeHandledSecondaryEffects(move, effectList = []) {
    const effects = Array.isArray(effectList) ? [...effectList] : [];
    const terrainRule = this._getTerrainRuntimeMoveRule(move);
    if (terrainRule?.terrainScope && terrainRule?.terrain) {
      return effects.filter(
        (effect) => this._normalizeSecondaryEffectType(effect?.effectType) !== "terrain"
      );
    }
    return effects;
  }

  _normalizeSecondaryEffectDefinitions(effectList) {
    const rawList = Array.isArray(effectList)
      ? effectList
      : effectList && typeof effectList === "object"
        ? Object.values(effectList)
        : [];
    return rawList.map((effect) => this._normalizeSecondaryEffectDefinition(effect));
  }

  _normalizeSecondaryEffectDefinition(effect) {
    const rawEffect = effect && typeof effect === "object" ? effect : {};
    const section = Math.max(Math.floor(toNumber(rawEffect.section, 0)), 0);
    const trigger = MOVE_SECONDARY_TRIGGER_KEYS.includes(rawEffect.trigger)
      ? rawEffect.trigger
      : "on-hit";
    const target = MOVE_SECONDARY_TARGET_KEYS.includes(rawEffect.target)
      ? rawEffect.target
      : "target";
    const effectType = this._normalizeSecondaryEffectType(rawEffect.effectType);
    const normalizedEffectType =
      section > 0 && ["condition", "stat"].includes(effectType) ? "active-effect" : effectType;
    const durationMode = this._normalizeSecondaryDurationMode(
      rawEffect.durationMode,
      normalizedEffectType
    );
    const durationRounds = this._normalizeSecondaryDurationRounds(rawEffect.durationRounds);
    const specialDuration = this._normalizeSpecialDurationList(rawEffect.specialDuration);
    const condition =
      normalizedEffectType === "condition"
        ? this._normalizeConditionVariantKey(rawEffect.condition)
        : this._normalizeConditionKey(rawEffect.condition);
    const weather = this._normalizeSecondaryWeatherKey(rawEffect.weather);
    const terrain = this._normalizeSecondaryTerrainKey(rawEffect.terrain);
    const stat = this._normalizeSecondaryStatKey(rawEffect.stat);
    const chance = this._normalizeSecondaryChanceDice(rawEffect.chance);
    const healMode = this._normalizeSecondaryHealMode(
      rawEffect.healMode,
      normalizedEffectType,
      rawEffect.amount
    );
    const healType = this._normalizeSecondaryHealType(rawEffect.healType, normalizedEffectType, {
      healMode: rawEffect.healMode,
      healingCategory: rawEffect.healingCategory,
      amount: rawEffect.amount
    });
    const healProfile = this._normalizeSecondaryHealProfile(rawEffect.healProfile);
    const healingCategory = this._normalizeHealingCategory(rawEffect.healingCategory);
    const rawAmount = clamp(Math.floor(toNumber(rawEffect.amount, 0)), -999, 999);
    const amount =
      normalizedEffectType === "heal" && healMode !== "fixed"
        ? Math.abs(rawAmount)
        : rawAmount;
    const normalizedHealConfiguration = this._coerceSecondaryHealConfiguration({
      effectType: normalizedEffectType,
      healType,
      healMode,
      healingCategory,
      amount
    });

    return {
      label: `${rawEffect.label ?? ""}`.trim(),
      section,
      trigger,
      chance,
      target,
      effectType: normalizedEffectType,
      durationMode,
      durationRounds,
      specialDuration,
      conditional: Boolean(rawEffect.conditional),
      activationCondition: `${rawEffect.activationCondition ?? ""}`.trim(),
      condition,
      weather,
      terrain,
      stat,
      amount: normalizedHealConfiguration.amount,
      healType: normalizedHealConfiguration.healType,
      healMode: normalizedHealConfiguration.healMode,
      healProfile,
      healingCategory: normalizedHealConfiguration.healingCategory,
      notes: `${rawEffect.notes ?? ""}`.trim(),
      maxStacks: Math.max(Math.floor(toNumber(rawEffect.maxStacks, 0)), 0),
      linkedEffectId: `${rawEffect.linkedEffectId ?? ""}`.trim()
    };
  }

  _normalizeSecondaryEffectType(effectType) {
    const normalizedType = `${effectType ?? "condition"}`.trim().toLowerCase();
    if (normalizedType === "activeeffect" || normalizedType === "active_effect") {
      return "active-effect";
    }
    if (normalizedType === "combat-stat") return "stat";
    if (MOVE_SECONDARY_EFFECT_TYPE_KEYS.includes(normalizedType)) return normalizedType;
    return "condition";
  }

  _normalizeSecondaryHealMode(healMode, effectType = "custom", amount = 0) {
    const normalizedType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedType !== "heal") return "fixed";
    const normalizedMode = `${healMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_HEAL_MODE_KEYS.includes(normalizedMode)) return normalizedMode;
    return Number(amount) < 0 ? "max-hp-percent" : "fixed";
  }

  _normalizeSecondaryHealType(healType, effectType = "custom", effect = {}) {
    const normalizedType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedType !== "heal") return "basic";
    const normalized = `${healType ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_HEAL_TYPE_KEYS.includes(normalized)) return normalized;
    if (this._normalizeSecondaryHealProfile(effect?.healProfile) !== "standard") return "basic";

    const inferredCategory = this._normalizeHealingCategory(effect?.healingCategory);
    const inferredMode = this._normalizeSecondaryHealMode(
      effect?.healMode,
      normalizedType,
      effect?.amount
    );
    const inferredAmount = Math.abs(Math.floor(toNumber(effect?.amount, 0)));

    if (inferredCategory === "complete") {
      if (inferredMode === "fixed" && inferredAmount === 5) return "complete";
      return "complete-numeric";
    }

    if (inferredMode === "fixed" && inferredAmount === 3) return "basic";
    return "basic-numeric";
  }

  _normalizeSecondaryHealProfile(healProfile) {
    const normalized = `${healProfile ?? "standard"}`.trim().toLowerCase();
    return MOVE_SECONDARY_HEAL_PROFILE_KEYS.includes(normalized) ? normalized : "standard";
  }

  _coerceSecondaryHealConfiguration({ effectType, healType, healMode, healingCategory, amount }) {
    const normalizedEffectType = this._normalizeSecondaryEffectType(effectType);
    if (normalizedEffectType !== "heal") {
      return {
        healType: "basic",
        healMode: "fixed",
        healingCategory: "standard",
        amount: Math.floor(toNumber(amount, 0))
      };
    }

    const normalizedHealType = this._normalizeSecondaryHealType(healType, normalizedEffectType, {
      healMode,
      healingCategory,
      amount
    });
    const normalizedHealMode = this._normalizeSecondaryHealMode(
      healMode,
      normalizedEffectType,
      amount
    );
    const normalizedHealingCategory = this._normalizeHealingCategory(healingCategory);
    const normalizedAmount = Math.abs(Math.floor(toNumber(amount, 0)));

    switch (normalizedHealType) {
      case "basic":
        return {
          healType: normalizedHealType,
          healMode: "fixed",
          healingCategory: "standard",
          amount: 3
        };
      case "complete":
        return {
          healType: normalizedHealType,
          healMode: "fixed",
          healingCategory: "complete",
          amount: 5
        };
      case "complete-numeric":
        return {
          healType: normalizedHealType,
          healMode: normalizedHealMode,
          healingCategory: "complete",
          amount: normalizedAmount
        };
      case "basic-numeric":
      default:
        return {
          healType: "basic-numeric",
          healMode: normalizedHealMode,
          healingCategory:
            normalizedHealingCategory === "complete" ? "standard" : normalizedHealingCategory,
          amount: normalizedAmount
        };
    }
  }

  _inferHealProfileFromMove(move, descriptionText = "") {
    return "standard";
  }

  _getSceneHealingContext() {
    const scene = canvas?.scene ?? null;
    const rawContext = scene?.getFlag?.(POKROLE.ID, "healingContext") ?? {};
    const rawTimeOfDay = `${rawContext?.timeOfDay ?? ""}`.trim().toLowerCase();
    const darkness = Number(scene?.darkness ?? 0);
    const timeOfDay = ["day", "night"].includes(rawTimeOfDay)
      ? rawTimeOfDay
      : darkness >= 0.75
        ? "night"
        : "day";

    const rawLocation = `${rawContext?.location ?? ""}`.trim().toLowerCase();
    const location = ["outdoors", "indoors", "underground"].includes(rawLocation)
      ? rawLocation
      : "outdoors";
    const activeTerrain = this.getActiveTerrainKey();
    const rawTerrain = `${rawContext?.terrain ?? activeTerrain ?? scene?.getFlag?.(POKROLE.ID, "terrain") ?? ""}`
      .trim()
      .toLowerCase();
    const terrain = this._normalizeTerrainKey(rawTerrain);

    return {
      timeOfDay,
      location,
      terrain
    };
  }

  _localizeHealingContextReason(reasonKey) {
    const labelByReason = {
      night: "POKROLE.Chat.SecondaryEffectHealReason.Night",
      indoors: "POKROLE.Chat.SecondaryEffectHealReason.Indoors",
      underground: "POKROLE.Chat.SecondaryEffectHealReason.Underground"
    };
    return game.i18n.localize(labelByReason[reasonKey] ?? "POKROLE.Common.Unknown");
  }

  _getSecondaryConditionActorContext(actor) {
    const normalizedActor = actor ?? null;
    const primaryType = this._normalizeTypeKey(normalizedActor?.system?.types?.primary || "none");
    const secondaryType = this._normalizeTypeKey(normalizedActor?.system?.types?.secondary || "none");
    const activeTerrains = normalizedActor ? this.getActiveTerrainKeysForActor(normalizedActor) : [];
    return {
      name: `${normalizedActor?.name ?? ""}`.trim().toLowerCase(),
      gender: `${normalizedActor?.system?.gender ?? "unknown"}`.trim().toLowerCase(),
      primaryType,
      secondaryType,
      types: [primaryType, secondaryType].filter((typeKey) => typeKey && typeKey !== "none"),
      terrains: activeTerrains
    };
  }

  _buildSecondaryActivationContext(effect, targetActor = null, sourceMove = null, context = {}) {
    const sceneContext = this._getSceneHealingContext();
    const sourceTerrainKeys = this.getActiveTerrainKeysForActor(this);
    const targetTerrainKeys = targetActor ? this.getActiveTerrainKeysForActor(targetActor) : [];
    const terrainKeys =
      sourceTerrainKeys.length > 0
        ? sourceTerrainKeys
        : sceneContext.terrain && sceneContext.terrain !== "none"
          ? [sceneContext.terrain]
          : [];
    return {
      weather: this.getActiveWeatherKey(),
      timeOfDay: sceneContext.timeOfDay,
      location: sceneContext.location,
      terrain: terrainKeys,
      battlefieldTerrain: this.getActiveTerrainKey(),
      combat: Boolean(game.combat),
      hit: Boolean(context?.hit),
      damagingMove: Boolean(context?.isDamagingMove),
      finalDamage: Math.max(toNumber(context?.finalDamage, 0), 0),
      totalDamageDealt: Math.max(toNumber(context?.totalDamageDealt, 0), 0),
      source: this._getSecondaryConditionActorContext(this),
      target: {
        ...this._getSecondaryConditionActorContext(targetActor),
        terrains: targetTerrainKeys
      },
      move: {
        name: `${sourceMove?.name ?? ""}`.trim().toLowerCase(),
        type: this._resolveEffectiveMoveType(sourceMove, this),
        category: `${sourceMove?.system?.category ?? "support"}`.trim().toLowerCase(),
        target: this._normalizeMoveTargetKey(context?.moveTargetKey ?? sourceMove?.system?.target),
        actionTag: `${sourceMove?.system?.actionTag ?? ""}`.trim().toLowerCase()
      },
      effect: {
        type: this._normalizeSecondaryEffectType(effect?.effectType),
        target: `${effect?.target ?? ""}`.trim().toLowerCase(),
        condition: this._normalizeConditionKey(effect?.condition ?? "none")
      }
    };
  }

  _resolveSecondaryActivationOperand(activationContext, rawKey) {
    const normalizedKey = `${rawKey ?? ""}`.trim();
    if (!normalizedKey) return undefined;

    const aliasKey = {
      time: "timeOfDay",
      timeofday: "timeOfDay",
      "source.type": "source.types",
      "target.type": "target.types",
      "source.terrain": "source.terrains",
      "target.terrain": "target.terrains"
    }[normalizedKey.toLowerCase()] ?? normalizedKey;

    return foundry.utils.getProperty(activationContext, aliasKey);
  }

  _normalizeSecondaryActivationValue(value) {
    if (Array.isArray(value)) {
      return value
        .map((entry) => `${entry ?? ""}`.trim().toLowerCase())
        .filter(Boolean);
    }
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return `${value}`;
    return `${value ?? ""}`.trim().toLowerCase();
  }

  _evaluateSecondaryActivationClause(rawClause, activationContext) {
    const clause = `${rawClause ?? ""}`.trim();
    if (!clause) return { valid: false, matched: false };

    const comparisonMatch = clause.match(/^([a-z0-9._-]+)\s*(==|=|!=)\s*(.+)$/i);
    if (!comparisonMatch) {
      return { valid: false, matched: false };
    }

    const operandKey = comparisonMatch[1];
    const operator = comparisonMatch[2];
    const expectedRaw = comparisonMatch[3]
      .trim()
      .replace(/^['"]|['"]$/g, "")
      .toLowerCase();
    const actualValue = this._resolveSecondaryActivationOperand(activationContext, operandKey);
    if (typeof actualValue === "undefined") {
      return { valid: false, matched: false };
    }

    const normalizedActual = this._normalizeSecondaryActivationValue(actualValue);
    const matches =
      Array.isArray(normalizedActual)
        ? normalizedActual.includes(expectedRaw)
        : normalizedActual === expectedRaw;

    return {
      valid: true,
      matched: operator === "!=" ? !matches : matches
    };
  }

  _evaluateSecondaryActivationCondition(effect, targetActor = null, sourceMove = null, context = {}) {
    const isConditional = Boolean(effect?.conditional);
    const expression = `${effect?.activationCondition ?? ""}`.trim();
    if (!isConditional) {
      return { passed: true, detail: "" };
    }
    if (!expression) {
      return {
        passed: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionInvalid")
      };
    }

    const activationContext = this._buildSecondaryActivationContext(
      effect,
      targetActor,
      sourceMove,
      context
    );
    const orClauses = expression
      .split(/\s+or\s+/i)
      .map((entry) => entry.trim())
      .filter(Boolean);

    if (!orClauses.length) {
      return {
        passed: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionInvalid")
      };
    }

    let hasInvalidClause = false;
    for (const orClause of orClauses) {
      const andClauses = orClause
        .split(/\s+and\s+/i)
        .map((entry) => entry.trim().replace(/^\(+|\)+$/g, ""))
        .filter(Boolean);
      if (!andClauses.length) continue;

      let branchValid = true;
      let branchMatched = true;
      for (const andClause of andClauses) {
        const clauseResult = this._evaluateSecondaryActivationClause(andClause, activationContext);
        if (!clauseResult.valid) {
          branchValid = false;
          branchMatched = false;
          hasInvalidClause = true;
          break;
        }
        if (!clauseResult.matched) {
          branchMatched = false;
          break;
        }
      }

      if (branchValid && branchMatched) {
        return { passed: true, detail: "" };
      }
    }

    if (hasInvalidClause) {
      return {
        passed: false,
        detail: game.i18n.format("POKROLE.Chat.SecondaryEffectConditionInvalidExpression", {
          condition: expression
        })
      };
    }

    return {
      passed: false,
      detail: game.i18n.format("POKROLE.Chat.SecondaryEffectConditionNotMet", {
        condition: expression
      })
    };
  }

  _resolveSecondaryHealConfiguration(effect, sourceMove = null) {
    const healType = this._normalizeSecondaryHealType(effect?.healType, effect?.effectType, effect);
    const healConfiguration = this._coerceSecondaryHealConfiguration({
      effectType: effect?.effectType,
      healType,
      healMode: effect?.healMode,
      healingCategory: effect?.healingCategory,
      amount: effect?.amount
    });
    const healProfile = this._normalizeSecondaryHealProfile(effect?.healProfile);

    const resolved = {
      effectType: "heal",
      healType: healConfiguration.healType,
      healMode: healConfiguration.healMode,
      healProfile,
      healingCategory: healConfiguration.healingCategory,
      amount: healConfiguration.amount,
      adjustmentDetail: ""
    };
    return resolved;
  }

  _normalizeSecondaryDurationMode(durationMode, effectType = "custom") {
    const normalized = `${durationMode ?? ""}`.trim().toLowerCase();
    if (MOVE_SECONDARY_DURATION_MODE_KEYS.includes(normalized)) {
      return normalized;
    }
    return "manual";
  }

  _normalizeSecondaryChanceDice(chanceValue, fallback = 0) {
    const numericChance = Number(chanceValue);
    if (!Number.isFinite(numericChance)) return fallback;
    const normalizedChance = Math.floor(numericChance);
    if (normalizedChance <= 0) return 0;
    if (normalizedChance >= 100) return 0;
    if (normalizedChance <= SECONDARY_EFFECT_CHANCE_DICE_MAX) {
      return normalizedChance;
    }
    return legacyChancePercentToDiceCount(normalizedChance, SECONDARY_EFFECT_CHANCE_DICE_MAX);
  }

  _getWeatherSecondaryChanceDiceBonus(effect, move, weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const moveType = this._normalizeTypeKey(move?.system?.type ?? "none");
    const normalizedEffectType = this._normalizeSecondaryEffectType(effect?.effectType);
    const conditionVariant = this._normalizeConditionVariantKey(effect?.condition);
    const isBurnEffect = conditionVariant === "burn" || conditionVariant === "burn2" || conditionVariant === "burn3";

    if (
      weather === "harsh-sunlight" &&
      moveType === "fire" &&
      normalizedEffectType === "condition" &&
      isBurnEffect
    ) {
      return 2;
    }

    return 0;
  }

  _normalizeSecondaryDurationRounds(durationRounds) {
    return clamp(Math.floor(toNumber(durationRounds, 1)), 1, 99);
  }

  _normalizeSpecialDurationList(value) {
    const rawValues = Array.isArray(value)
      ? value
      : typeof value === "string" && value.trim()
        ? value.split(",")
        : value && typeof value === "object"
          ? Object.values(value)
          : [];
    const normalized = [];
    for (const rawEntry of rawValues) {
      const durationKey = `${rawEntry ?? ""}`.trim().toLowerCase();
      if (!durationKey || durationKey === "none") continue;
      if (!MOVE_SECONDARY_SPECIAL_DURATION_KEYS.includes(durationKey)) continue;
      if (!normalized.includes(durationKey)) normalized.push(durationKey);
    }
    return normalized;
  }

  _normalizeConditionVariantKey(conditionKey) {
    const normalized = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (!normalized) return "none";
    if (normalized === "burn3") return "burn3";
    if (normalized === "burn2") return "burn2";
    if (normalized === "burn1" || normalized === "burn") return "burn";
    const alias = CONDITION_ALIASES[normalized] ?? normalized;
    if (alias === "dead") return "dead";
    return MOVE_SECONDARY_CONDITION_KEYS.includes(alias) ? alias : "none";
  }

  _normalizeConditionKey(conditionKey) {
    const normalized = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    const alias = CONDITION_ALIASES[normalized] ?? normalized;
    if (MOVE_SECONDARY_CONDITION_KEYS.includes(alias)) return alias;
    if (alias.includes("paraly")) return "paralyzed";
    if (alias.includes("poison")) return "poisoned";
    if (alias.includes("sleep")) return "sleep";
    if (alias.includes("burn")) return "burn";
    if (alias.includes("freez")) return "frozen";
    if (alias.includes("confus")) return "confused";
    if (alias.includes("flinch")) return "flinch";
    if (alias.includes("disable")) return "disabled";
    if (alias.includes("infatuat")) return "infatuated";
    if (alias.includes("faint")) return "fainted";
    if (alias.includes("dead") || alias.includes("mort")) return "dead";
    return "none";
  }

  _normalizeSecondaryWeatherKey(weatherKey) {
    const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
    return MOVE_SECONDARY_WEATHER_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizeSecondaryTerrainKey(terrainKey) {
    const normalized = `${terrainKey ?? "none"}`.trim().toLowerCase();
    return MOVE_SECONDARY_TERRAIN_KEYS.includes(normalized) ? normalized : "none";
  }

  _normalizePokemonGenderKey(actor) {
    const rawGender = `${actor?.system?.gender ?? "unknown"}`.trim().toLowerCase();
    return ["male", "female", "genderless", "unknown"].includes(rawGender)
      ? rawGender
      : "unknown";
  }

  _validateInfatuationGenderRule(sourceActor, targetActor, options = {}) {
    if (options.allowManualOverride === true) {
      return { valid: true, detail: "" };
    }
    if (!targetActor || targetActor.type !== "pokemon") {
      return { valid: true, detail: "" };
    }

    const targetGender = this._normalizePokemonGenderKey(targetActor);
    if (!["male", "female"].includes(targetGender)) {
      return {
        valid: false,
        detail: game.i18n.localize("POKROLE.Chat.InfatuationInvalidTargetGender")
      };
    }

    if (!sourceActor || sourceActor.id === targetActor.id || sourceActor.type !== "pokemon") {
      return { valid: true, detail: "" };
    }

    const sourceGender = this._normalizePokemonGenderKey(sourceActor);
    if (!["male", "female"].includes(sourceGender) || sourceGender === targetGender) {
      return {
        valid: false,
        detail: game.i18n.localize("POKROLE.Chat.InfatuationRequiresOppositeGender")
      };
    }

    return { valid: true, detail: "" };
  }

  _getConditionBlockedDetail(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return "";

    const weather = this.getActiveWeatherKey();
    const localizedCondition = `${this._localizeConditionName(normalizedCondition)}`.toLowerCase();
    if ((weather === "sunny" || weather === "harsh-sunlight") && normalizedCondition === "frozen") {
      return game.i18n.format("POKROLE.Chat.ConditionBlockedByWeather", {
        condition: localizedCondition,
        weather: this._localizeWeatherName(weather)
      });
    }
    if (weather === "typhoon" && normalizedCondition === "burn") {
      return game.i18n.format("POKROLE.Chat.ConditionBlockedByWeather", {
        condition: localizedCondition,
        weather: this._localizeWeatherName(weather)
      });
    }

    if (
      this.hasActiveTerrainForActor(targetActor, "misty") &&
      targetActor.type === "pokemon" &&
      this._isActorGroundedForTerrain(targetActor) &&
      !["dead", "fainted"].includes(normalizedCondition)
    ) {
      return game.i18n.format("POKROLE.Chat.ConditionBlockedByTerrain", {
        condition: localizedCondition,
        terrain: this._localizeTerrainName("misty")
      });
    }
    if (normalizedCondition === "sleep" && this._isUproarActive(game.combat)) {
      return "Uproar prevents sleep while it lasts.";
    }

    if (normalizedCondition === "burn" && targetActor.hasType?.("fire")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "frozen" && targetActor.hasType?.("ice")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "paralyzed" && targetActor.hasType?.("electric")) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (
      ["poisoned", "badly-poisoned"].includes(normalizedCondition) &&
      (targetActor.hasType?.("poison") || targetActor.hasType?.("steel"))
    ) {
      return game.i18n.localize("POKROLE.Chat.ConditionImmune");
    }
    if (normalizedCondition === "infatuated" && targetActor.type === "pokemon") {
      const gender = `${targetActor.system?.gender ?? "unknown"}`.trim().toLowerCase();
      if (["genderless", "unknown", "none", "null", ""].includes(gender)) {
        return game.i18n.localize("POKROLE.Chat.ConditionImmune");
      }
    }

    // Ability-based condition immunity
    const abilityImmunityDetail = this._getAbilityConditionImmunityDetail(targetActor, normalizedCondition);
    if (abilityImmunityDetail) return abilityImmunityDetail;

    return "";
  }

  _isConditionImmune(targetActor, conditionKey) {
    return Boolean(this._getConditionBlockedDetail(targetActor, conditionKey));
  }

  _getAbilityConditionImmunityDetail(targetActor, conditionKey) {
    if (!targetActor || targetActor.type !== "pokemon") return "";
    const activeAbilityName = `${targetActor.system?.ability ?? ""}`.trim().toLowerCase();
    if (!activeAbilityName) return "";
    const ABILITY_CONDITION_IMMUNITY = {
      "insomnia": ["sleep"],
      "vital-spirit": ["sleep"],
      "vital spirit": ["sleep"],
      "sweet-veil": ["sleep"],
      "sweet veil": ["sleep"],
      "limber": ["paralyzed"],
      "magma-armor": ["frozen"],
      "magma armor": ["frozen"],
      "water-veil": ["burn"],
      "water veil": ["burn"],
      "immunity": ["poisoned", "badly-poisoned"],
      "pastel-veil": ["poisoned", "badly-poisoned"],
      "pastel veil": ["poisoned", "badly-poisoned"],
      "oblivious": ["infatuated"],
      "own-tempo": ["confused"],
      "own tempo": ["confused"],
      "inner-focus": ["flinch"],
      "inner focus": ["flinch"],
      "shield-dust": ["flinch"],
      "shield dust": ["flinch"],
      "quick-feet": ["paralyzed"],
      "quick feet": ["paralyzed"],
      "comatose": ["burn", "frozen", "paralyzed", "sleep", "poisoned", "badly-poisoned"],
      "purifying-salt": ["burn", "frozen", "paralyzed", "sleep", "poisoned", "badly-poisoned"],
      "purifying salt": ["burn", "frozen", "paralyzed", "sleep", "poisoned", "badly-poisoned"]
    };
    const immuneConditions = ABILITY_CONDITION_IMMUNITY[activeAbilityName] ?? [];
    if (immuneConditions.includes(conditionKey)) {
      const abilityDisplay = `${targetActor.system?.ability ?? activeAbilityName}`;
      return `${targetActor.name}'s ${abilityDisplay} prevents ${this._localizeConditionName(conditionKey)}!`;
    }
    return "";
  }

  async _removeConditionByAbilityImmunity(targetActor, conditionKey) {
    if (!targetActor) return;
    const statusId = `pokrole-condition-${conditionKey}`;
    const conditionEffect = (targetActor.effects?.contents ?? []).find((e) => {
      if (e?.disabled) return false;
      const statuses = [...(e.statuses ?? [])].map((s) => `${s ?? ""}`.trim().toLowerCase());
      if (statuses.includes(statusId)) return true;
      const flags = e.getFlag?.(POKROLE.ID, "automation") ?? {};
      return `${flags.conditionKey ?? ""}`.trim().toLowerCase() === conditionKey;
    });
    if (conditionEffect) {
      try {
        await targetActor.deleteEmbeddedDocuments("ActiveEffect", [conditionEffect.id]);
        await this._setConditionFlagState(targetActor, conditionKey, false);
        const abilityName = `${targetActor.system?.ability ?? ""}`.trim();
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}</strong>'s <strong>${abilityName}</strong> removed ${this._localizeConditionName(conditionKey)}!`
        });
      } catch (err) {
        console.warn(`PokRole | Failed to remove ${conditionKey} by ability immunity:`, err);
      }
    }
  }

  async cleanseAbilityImmuneConditions() {
    if (!this || this.type !== "pokemon") return;
    const activeAbilityName = `${this.system?.ability ?? ""}`.trim().toLowerCase();
    if (!activeAbilityName) return;
    const detail = this._getAbilityConditionImmunityDetail(this, "sleep");
    const ABILITY_CONDITION_IMMUNITY = {
      "insomnia": ["sleep"],
      "vital-spirit": ["sleep"], "vital spirit": ["sleep"],
      "sweet-veil": ["sleep"], "sweet veil": ["sleep"],
      "limber": ["paralyzed"],
      "magma-armor": ["frozen"], "magma armor": ["frozen"],
      "water-veil": ["burn"], "water veil": ["burn"],
      "immunity": ["poisoned", "badly-poisoned"],
      "pastel-veil": ["poisoned", "badly-poisoned"], "pastel veil": ["poisoned", "badly-poisoned"],
      "oblivious": ["infatuated"],
      "own-tempo": ["confused"], "own tempo": ["confused"],
      "inner-focus": ["flinch"], "inner focus": ["flinch"]
    };
    const immuneConditions = ABILITY_CONDITION_IMMUNITY[activeAbilityName] ?? [];
    for (const conditionKey of immuneConditions) {
      await this._removeConditionByAbilityImmunity(this, conditionKey);
    }
  }

  _normalizeSecondaryStatKey(statKey) {
    const normalized = `${statKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[_\s]+/g, "")
      .replace(/[^a-z0-9]+/g, "");
    const mapped = LEGACY_EFFECT_STAT_MAP[normalized] ?? normalized;
    if (MOVE_SECONDARY_STAT_KEYS.includes(mapped)) return mapped;
    if (mapped.includes("specialdef")) return "specialDefense";
    if (mapped.includes("def")) return "defense";
    if (mapped.includes("attack")) return "strength";
    if (mapped.includes("speed")) return "dexterity";
    if (mapped.includes("accuracy")) return "accuracy";
    if (mapped.includes("evasion")) return "evasion";
    if (mapped.includes("clash")) return "clash";
    if (mapped.includes("special")) return "special";
    return "none";
  }

  _convertLegacyEffectGroupsToSecondaryEffects(effectGroups, moveTargetKey) {
    if (!Array.isArray(effectGroups) || effectGroups.length === 0) return [];
    const normalizedMoveTarget = this._normalizeMoveTargetKey(moveTargetKey);
    const secondaryEffects = [];

    for (const group of effectGroups) {
      if (!group || typeof group !== "object") continue;
      let chance = 100;
      const conditionType = `${group.condition?.type ?? "none"}`.trim().toLowerCase();
      if (conditionType === "chancedice") {
        const chanceDice = Math.max(toNumber(group.condition?.amount, 1), 1);
        chance = clamp(Math.round((1 - Math.pow(2 / 3, chanceDice)) * 100), 1, 100);
      }

      const effects = Array.isArray(group.effects) ? group.effects : [];
      for (const effect of effects) {
        if (!effect || typeof effect !== "object") continue;
        const type = `${effect.type ?? "custom"}`.trim().toLowerCase();
        const target =
          effect.affects === "user"
            ? "self"
            : ["all-foes", "area", "battlefield-area"].includes(normalizedMoveTarget)
              ? "all-targets"
              : "target";
        secondaryEffects.push(
          this._normalizeSecondaryEffectDefinition({
            label: "",
            trigger: "on-hit",
            chance,
            target,
            effectType:
              type === "ailment"
                ? "condition"
                : type === "statchange"
                  ? "stat"
                  : "custom",
            condition: effect.ailment ?? "none",
            stat: effect.stat ?? "none",
            amount: toNumber(effect.amount, 0),
            notes: ""
          })
        );
      }
    }

    return secondaryEffects;
  }

  _inferSecondaryEffectsFromDescription(description, moveTargetKey, move = null) {
    const descriptionText = `${description ?? ""}`.replace(/\s+/g, " ").trim();
    if (!descriptionText) return [];
    const lowerDescription = descriptionText.toLowerCase();
    const inferredEffects = [];
    const signatures = new Set();
    const defaultTarget =
      this._normalizeMoveTargetKey(moveTargetKey) === "self" ? "self" : "target";

    const addEffect = (effect) => {
      const normalized = this._normalizeSecondaryEffectDefinition(effect);
      const signature = JSON.stringify([
        normalized.trigger,
        normalized.chance,
        normalized.target,
        normalized.effectType,
        normalized.condition,
        normalized.stat,
        normalized.amount
      ]);
      if (signatures.has(signature)) return;
      signatures.add(signature);
      inferredEffects.push(normalized);
    };

    const mechanicPattern = /\{mechanic:([a-z-]+)\}/gi;
    let mechanicMatch = mechanicPattern.exec(descriptionText);
    while (mechanicMatch) {
      const conditionKey = this._normalizeConditionKey(mechanicMatch[1]);
      if (conditionKey !== "none") {
        const chance = this._extractChanceBeforeIndex(lowerDescription, mechanicMatch.index);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target: defaultTarget,
          effectType: "condition",
          condition: conditionKey,
          stat: "none",
          amount: 0,
          notes: ""
        });
      }
      mechanicMatch = mechanicPattern.exec(descriptionText);
    }

    const statusMatchers = [
      { condition: "burn", regex: /(\d{1,3})%\s+chance[^.]*\bburn/i },
      { condition: "frozen", regex: /(\d{1,3})%\s+chance[^.]*\bfreez/i },
      { condition: "paralyzed", regex: /(\d{1,3})%\s+chance[^.]*\bparaly/i },
      { condition: "poisoned", regex: /(\d{1,3})%\s+chance[^.]*\bpoison/i },
      { condition: "sleep", regex: /(\d{1,3})%\s+chance[^.]*\bsleep/i },
      { condition: "confused", regex: /(\d{1,3})%\s+chance[^.]*\bconfus/i },
      { condition: "flinch", regex: /(\d{1,3})%\s+chance[^.]*\bflinch/i }
    ];
    for (const matcher of statusMatchers) {
      const match = matcher.regex.exec(descriptionText);
      if (!match) continue;
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: clamp(toNumber(match[1], 100), 0, 100),
        target: defaultTarget,
        effectType: "condition",
        condition: matcher.condition,
        stat: "none",
        amount: 0,
        notes: ""
      });
    }

    const stageRegex =
      /(?:(\d{1,3})%\s+chance\s+to\s+)?(raise|raises|increase|increases|lower|lowers|decrease|decreases)\s+(?:the\s+)?(user|target|foe|ally|its|their)(?:'s)?\s+([a-z\/\.\s-]+?)\s+by\s+(one|two|three|four|five|six|\d+)\s+stages?/gi;
    let stageMatch = stageRegex.exec(descriptionText);
    while (stageMatch) {
      const chance = stageMatch[1] ? clamp(toNumber(stageMatch[1], 100), 0, 100) : 100;
      const directionWord = `${stageMatch[2] ?? ""}`.toLowerCase();
      const targetWord = `${stageMatch[3] ?? ""}`.toLowerCase();
      const statWord = `${stageMatch[4] ?? ""}`.toLowerCase();
      const amount = this._parseStageAmount(stageMatch[5], directionWord);
      const target = ["user", "its", "their"].includes(targetWord) ? "self" : "target";
      const stat = this._normalizeSecondaryStatKey(statWord);
      if (stat !== "none" && amount !== 0) {
        addEffect({
          label: "",
          trigger: "on-hit",
          chance,
          target,
          effectType: "stat",
          condition: "none",
          stat,
          amount,
          notes: ""
        });
      }
      stageMatch = stageRegex.exec(descriptionText);
    }

    const halfHealRegex =
      /heals?\s+(?:the\s+)?(user|itself|self|target|ally)?[^.]*half[^.]*max hp/i;
    const halfHealMatch = halfHealRegex.exec(descriptionText);
    if (halfHealMatch) {
      const targetWord = `${halfHealMatch[1] ?? ""}`.toLowerCase();
      const target = ["user", "itself", "self"].includes(targetWord) ? "self" : "target";
      const healProfile = this._inferHealProfileFromMove(move, descriptionText);
      addEffect({
        label: "",
        trigger: "on-hit",
        chance: 100,
        target,
        effectType: "heal",
        condition: "none",
        stat: "none",
        amount: -50,
        healProfile,
        notes: ""
      });
    }

    const fractionDamageRegex = /(\d+)\s*\/\s*(\d+)\s+(?:of\s+)?(?:the\s+)?target'?s?\s+max hp/i;
    const fractionDamageMatch = fractionDamageRegex.exec(descriptionText);
    if (fractionDamageMatch) {
      const numerator = Math.max(toNumber(fractionDamageMatch[1], 0), 0);
      const denominator = Math.max(toNumber(fractionDamageMatch[2], 1), 1);
      if (numerator > 0) {
        const percent = clamp(Math.round((numerator / denominator) * 100), 1, 100);
        addEffect({
          label: "",
          trigger: "on-hit",
          chance: 100,
          target: defaultTarget,
          effectType: "damage",
          condition: "none",
          stat: "none",
          amount: -percent,
          notes: ""
        });
      }
    }

    return inferredEffects;
  }

  _extractChanceBeforeIndex(text, index) {
    const start = Math.max(index - 140, 0);
    const window = text.slice(start, index + 1);
    const pattern = /(\d{1,3})%\s+chance/gi;
    let chance = null;
    let match = pattern.exec(window);
    while (match) {
      chance = clamp(toNumber(match[1], 100), 0, 100);
      match = pattern.exec(window);
    }
    return chance ?? 100;
  }

  _parseStageAmount(value, directionWord) {
    const text = `${value ?? ""}`.trim().toLowerCase();
    const numberMap = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 };
    const numericValue = numberMap[text] ?? toNumber(text, 0);
    const sign = ["lower", "lowers", "decrease", "decreases"].includes(directionWord) ? -1 : 1;
    return clamp(sign * Math.max(Math.floor(numericValue), 0), -6, 6);
  }

  async _applyMoveSecondaryEffects({
    move,
    sourceItem = null,
    moveTargetKey,
    secondaryEffects,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage,
    damageTargetResults = [],
    roundKey = null,
    skipEffectSignatures = null,
    blockedTargetIds = null
  }) {
    if (!Array.isArray(secondaryEffects) || secondaryEffects.length === 0) {
      return [];
    }

    const effectSourceItem = sourceItem ?? move ?? null;
    const activeWeather = this.getActiveWeatherKey();
    const results = [];
    const totalDamageDealt = (Array.isArray(damageTargetResults) ? damageTargetResults : []).reduce(
      (sum, result) => sum + Math.max(toNumber(result?.finalDamage, 0), 0),
      0
    );
    const skippedSignatureSet =
      skipEffectSignatures instanceof Set
        ? skipEffectSignatures
        : new Set(Array.isArray(skipEffectSignatures) ? skipEffectSignatures : []);
    const blockedTargetIdSet =
      blockedTargetIds instanceof Set
        ? blockedTargetIds
        : new Set(Array.isArray(blockedTargetIds) ? blockedTargetIds : []);
    for (const effect of secondaryEffects) {
      if (skippedSignatureSet.has(this._getSecondaryEffectSignature(effect))) {
        continue;
      }
      const normalizedEffectType = this._normalizeSecondaryEffectType(effect.effectType);
      if (!this._secondaryTriggerMatches(effect.trigger, { hit, isDamagingMove, finalDamage })) {
        continue;
      }

      const baseChanceDice = this._normalizeSecondaryChanceDice(effect.chance);
      const weatherChanceBonusDice = this._getWeatherSecondaryChanceDiceBonus(
        effect,
        move,
        activeWeather
      );
      // Loaded Dice: +2 chance dice for secondary effects
      const loadedDiceBonus = this._getHeldItemData()?.loadedDice ? 2 : 0;
      const chanceDice = Math.max(baseChanceDice + weatherChanceBonusDice + loadedDiceBonus, 0);
      let chanceRollResults = [];
      let chanceSucceeded = true;
      if (chanceDice > 0 && baseChanceDice > 0) {
        const chanceRoll = await new Roll(`${chanceDice}d6`).evaluate();
        chanceRollResults = chanceRoll.dice.flatMap((die) =>
          Array.isArray(die?.results)
            ? die.results.map((result) => Math.floor(toNumber(result?.result, 0)))
            : []
        );
        chanceSucceeded = chanceRollResults.some((result) => result === 6);
      }

      if (!chanceSucceeded) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Common.None"),
          applied: false,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
            rolls: chanceRollResults.join(", "),
            dice: chanceDice
          })
        });
        continue;
      }

      if (normalizedEffectType === "weather") {
        const applyResult = await this._applySecondaryEffectToActor(
          { ...effect, effectType: "weather" },
          this,
          effectSourceItem,
          { moveTargetKey, hit, isDamagingMove, finalDamage, totalDamageDealt, damageTargetResults }
        );
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: this._localizeMoveTarget("battlefield"),
          applied: applyResult.applied,
          detail: applyResult.applied
            ? applyResult.detail
            : this._resolveSecondaryEffectFailureDetail(effect, this, applyResult, {
                finalDamage,
                totalDamageDealt,
                damageTargetResults
              })
        });
        continue;
      }

      if (normalizedEffectType === "terrain") {
        const applyResult = await this._applySecondaryEffectToActor(
          { ...effect, effectType: "terrain" },
          this,
          effectSourceItem,
          { moveTargetKey, hit, isDamagingMove, finalDamage, totalDamageDealt, damageTargetResults }
        );
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: this._localizeMoveTarget(moveTargetKey),
          applied: applyResult.applied,
          detail: applyResult.applied
            ? applyResult.detail
            : this._resolveSecondaryEffectFailureDetail(effect, this, applyResult, {
                finalDamage,
                totalDamageDealt,
                damageTargetResults
              })
        });
        continue;
      }

      const effectTargets = this._resolveActorsForSecondaryTarget(effect.target, {
        moveTargetKey,
        targetActors
      });
      if (!effectTargets.length) {
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
          applied: false,
          detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoTarget")
        });
        continue;
      }

      for (const targetActor of effectTargets) {
        if (
          targetActor instanceof PokRoleActor &&
          targetActor.id !== this.id &&
          blockedTargetIdSet.has(targetActor.id) &&
          !this._moveIgnoresSubstitute(move)
        ) {
          results.push({
            label: this._formatSecondaryEffectLabel(effect),
            targetName: targetActor.name,
            applied: false,
            detail: game.i18n.format("POKROLE.Combat.Switcher.DecoyBlockedEffect", {
              target: targetActor.name
            })
          });
          continue;
        }
        const shieldResponse =
          targetActor instanceof PokRoleActor
            ? await targetActor._resolveShieldResponseForAttack(
                this._buildShieldAttackContext(move, this, roundKey, isDamagingMove)
              )
            : null;
        if (shieldResponse?.blocksAddedEffects) {
          results.push({
            label: this._formatSecondaryEffectLabel(effect),
            targetName: targetActor.name,
            applied: false,
            detail: game.i18n.format("POKROLE.Chat.SecondaryEffectBlockedByShield", {
              shield: this._formatShieldEntryNameList(shieldResponse.entries)
            })
          });
          continue;
        }

        const hasConditionalTrigger =
          Boolean(effect?.passive) ||
          `${effect?.passiveTrigger ?? ""}`.trim().length > 0;
        if (hasConditionalTrigger) {
          const triggerCheckEffect = {
            ...effect,
            passive: true
          };
          if (!this._checkPassiveTrigger(triggerCheckEffect, targetActor)) {
            results.push({
              label: this._formatSecondaryEffectLabel(effect),
              targetName: targetActor.name,
              applied: false,
              detail: game.i18n.localize("POKROLE.Chat.PassiveTriggerNotMet")
            });
            continue;
          }
        }
        const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, effectSourceItem, {
          moveTargetKey,
          hit,
          isDamagingMove,
          finalDamage,
          totalDamageDealt,
          damageTargetResults
        });
        results.push({
          label: this._formatSecondaryEffectLabel(effect),
          targetName: targetActor.name,
          applied: applyResult.applied,
          detail: applyResult.applied
            ? applyResult.detail
            : this._resolveSecondaryEffectFailureDetail(effect, targetActor, applyResult, {
                finalDamage,
                totalDamageDealt,
                damageTargetResults
              })
        });
      }
    }

    return results;
  }

  async _applyMoveRecoilDamage(move, damageTargetResults = []) {
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    if (!moveSourceAttributes?.recoil) return null;

    const totalDamageDealt = (Array.isArray(damageTargetResults) ? damageTargetResults : []).reduce(
      (sum, result) => sum + Math.max(toNumber(result?.finalDamage, 0), 0),
      0
    );
    if (totalDamageDealt <= 0) {
      return {
        label: game.i18n.localize("POKROLE.Chat.Recoil"),
        targetName: this.name ?? game.i18n.localize("POKROLE.Chat.Actor"),
        applied: false,
        damage: 0,
        dice: 0,
        detail: game.i18n.localize("POKROLE.Common.None")
      };
    }

    const recoilRoll = await new Roll(successPoolFormula(totalDamageDealt)).evaluate();
    const recoilDamage = Math.max(toNumber(recoilRoll.total, 0), 0);
    if (recoilDamage > 0) {
      await this._safeApplyDamage(this, recoilDamage, { applyDeadOnZero: false });
    }

    await recoilRoll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: game.i18n.format("POKROLE.Chat.MoveRecoilFlavor", {
        actor: this.name,
        move: move?.name ?? game.i18n.localize("POKROLE.Common.Unknown"),
        dice: totalDamageDealt,
        damage: recoilDamage
      })
    });

    return {
      label: game.i18n.localize("POKROLE.Chat.Recoil"),
      targetName: this.name ?? game.i18n.localize("POKROLE.Chat.Actor"),
      applied: recoilDamage > 0,
      damage: recoilDamage,
      dice: totalDamageDealt,
      detail: `${recoilDamage} (${totalDamageDealt}d6)`
    };
  }

  _getActiveSubstituteDecoyEffect(targetActor = this) {
    const actor = targetActor ?? this;
    if (!actor) return null;
    return (
      (actor.effects?.contents ?? []).find((effectDocument) => {
        const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
        if (!automationFlags?.managed) return false;
        if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "substitute-decoy") {
          return false;
        }
        if (effectDocument.disabled) return false;
        return Math.max(toNumber(automationFlags?.hpRemaining, 0), 0) > 0;
      }) ?? null
    );
  }

  async _removeSubstituteDecoyEffect(targetActor = this, effectDocument = null) {
    const actor = targetActor ?? this;
    const decoyEffect = effectDocument ?? this._getActiveSubstituteDecoyEffect(actor);
    if (!actor || !decoyEffect) return false;
    await actor.deleteEmbeddedDocuments("ActiveEffect", [decoyEffect.id].filter(Boolean));
    return true;
  }

  async _createSubstituteDecoyEffect(targetActor = this, sourceMove = null) {
    const actor = targetActor ?? this;
    if (!actor) return null;
    if (this._getActiveSubstituteDecoyEffect(actor)) {
      return null;
    }

    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "substitute-decoy",
      durationMode: "combat",
      durationRounds: 0,
      specialDuration: [],
      sourceMove
    });
    automationFlags.hpRemaining = 2;
    automationFlags.decoyDefense = {
      physical: Math.max(toNumber(actor.getDefense?.("physical"), 0), 0),
      special: Math.max(toNumber(actor.getDefense?.("special"), 0), 0)
    };
    const [createdEffect] = await actor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: game.i18n.localize("POKROLE.Combat.Switcher.SubstituteDecoy"),
        img: sourceMove?.img || "icons/svg/mystery-man.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: [],
        duration: {},
        changes: [],
        flags: {
          [POKROLE.ID]: {
            automation: automationFlags
          }
        }
      }
    ]);
    return createdEffect ?? null;
  }

  async _updateSubstituteDecoyHp(targetActor, effectDocument, hpRemaining) {
    const actor = targetActor ?? this;
    if (!actor || !effectDocument) return false;
    const normalizedHp = Math.max(Math.floor(toNumber(hpRemaining, 0)), 0);
    if (normalizedHp <= 0) {
      return this._removeSubstituteDecoyEffect(actor, effectDocument);
    }
    await effectDocument.update({
      [`flags.${POKROLE.ID}.automation.hpRemaining`]: normalizedHp
    });
    return true;
  }

  _getSwitcherMoveCandidates(move, { sourceActor = this, targetActor = null, combat = game.combat } = {}) {
    const rule = this._getSwitcherMoveRule(move);
    if (!rule) return [];

    const toChoice = (actor) => {
      if (!actor) return null;
      return {
        id: actor.id,
        actor,
        label: `${actor.name ?? ""}`.trim() || game.i18n.localize("POKROLE.Common.Unknown"),
        detail: `${actor.system?.species ?? ""}`.trim()
      };
    };

    if (rule.mode === "ally-switch") {
      return this._getCombatantActorsForSide(sourceActor, combat)
        .filter((actor) => actor?.type === "pokemon")
        .map(toChoice)
        .filter(Boolean);
    }

    if (rule.mode === "self-switch" || rule.mode === "decoy") {
      const trainerActor = this._getPokemonTrainerActor(sourceActor);
      return this._getTrainerPartyPokemon(trainerActor, combat).map(toChoice).filter(Boolean);
    }

    if (rule.mode === "forced-foe-switch") {
      const trainerActor = this._getPokemonTrainerActor(targetActor);
      return this._getTrainerPartyPokemon(trainerActor, combat).map(toChoice).filter(Boolean);
    }

    return [];
  }

  async _promptSwitchCandidateSelection({
    title,
    prompt,
    choices = []
  } = {}) {
    const normalizedChoices = Array.isArray(choices) ? choices.filter((choice) => choice?.actor) : [];
    if (normalizedChoices.length <= 0) return null;
    if (normalizedChoices.length === 1) {
      return normalizedChoices[0].actor ?? null;
    }

    const optionsHtml = normalizedChoices
      .map((choice) => {
        const label = foundry.utils.escapeHTML(choice.label ?? choice.actor?.name ?? "");
        const detail = `${choice.detail ?? ""}`.trim();
        const detailSuffix = detail ? ` <small>(${foundry.utils.escapeHTML(detail)})</small>` : "";
        return `<option value="${choice.id}">${label}${detailSuffix}</option>`;
      })
      .join("");

    const content = `
      <form class="pok-role-switch-dialog">
        <div class="form-group">
          <label>${foundry.utils.escapeHTML(prompt ?? game.i18n.localize("POKROLE.Combat.Switcher.SelectReplacement"))}</label>
          <select name="switchCandidateId">${optionsHtml}</select>
        </div>
      </form>
    `;
    const result = await foundry.applications.api.DialogV2.wait({
      window: { title: title ?? game.i18n.localize("POKROLE.Combat.Switcher.SelectTitle") },
      content,
      buttons: [
        {
          action: "confirm",
          label: game.i18n.localize("POKROLE.Common.Confirm"),
          icon: "fas fa-check",
          callback: (event, button) => button.form.elements.switchCandidateId?.value ?? null
        },
        {
          action: "cancel",
          label: game.i18n.localize("POKROLE.Common.Cancel"),
          icon: "fas fa-times"
        }
      ]
    });
    if (!result) return null;
    return normalizedChoices.find((choice) => choice.id === result)?.actor ?? null;
  }

  async _updateCombatantActor(combatant, replacementActor) {
    const combat = game.combat;
    if (!combat || !combatant || !replacementActor) return false;
    if (!game.user?.isGM) {
      const response = await this._requestCombatMutation("updateCombatantActor", {
        combatId: combat.id ?? null,
        combatantId: combatant.id ?? null,
        replacementActorId: replacementActor.id ?? null
      });
      return Boolean(response?.updated);
    }
    return this._updateCombatantActorLocal(combatant, replacementActor);
  }

  async _updateCombatantActorLocal(combatant, replacementActor) {
    const combat = game.combat;
    if (!combat || !combatant || !replacementActor) return false;
    const replacementToken = replacementActor.getActiveTokens?.(true)?.[0]?.document ?? null;
    const updateData = {
      _id: combatant.id,
      actorId: replacementActor.id,
      tokenId: replacementToken?.id ?? null,
      sceneId: replacementToken?.parent?.id ?? null
    };
    try {
      await combat.updateEmbeddedDocuments("Combatant", [updateData]);
      await this._applyEntryHazardsForActor(replacementActor, { combat });
      return true;
    } catch (error) {
      console.warn(`${POKROLE.ID} | Failed to update combatant actor`, error);
      return false;
    }
  }

  async _swapCombatantActors(firstCombatant, secondCombatant) {
    const combat = game.combat;
    if (!combat || !firstCombatant || !secondCombatant) return false;
    if (!game.user?.isGM) {
      const response = await this._requestCombatMutation("swapCombatantActors", {
        combatId: combat.id ?? null,
        firstCombatantId: firstCombatant.id ?? null,
        secondCombatantId: secondCombatant.id ?? null
      });
      return Boolean(response?.swapped);
    }
    return this._swapCombatantActorsLocal(firstCombatant, secondCombatant);
  }

  async _swapCombatantActorsLocal(firstCombatant, secondCombatant) {
    const combat = game.combat;
    if (!combat || !firstCombatant || !secondCombatant) return false;
    const firstActor = firstCombatant.actor ?? null;
    const secondActor = secondCombatant.actor ?? null;
    if (!firstActor || !secondActor || firstActor.id === secondActor.id) return false;
    const firstToken = firstActor.getActiveTokens?.(true)?.[0]?.document ?? null;
    const secondToken = secondActor.getActiveTokens?.(true)?.[0]?.document ?? null;
    try {
      await combat.updateEmbeddedDocuments("Combatant", [
        {
          _id: firstCombatant.id,
          actorId: secondActor.id,
          tokenId: secondToken?.id ?? null,
          sceneId: secondToken?.parent?.id ?? null
        },
        {
          _id: secondCombatant.id,
          actorId: firstActor.id,
          tokenId: firstToken?.id ?? null,
          sceneId: firstToken?.parent?.id ?? null
        }
      ]);
      return true;
    } catch (error) {
      console.warn(`${POKROLE.ID} | Failed to swap combatants`, error);
      return false;
    }
  }

  async _transferBatonPassModifiers(sourceActor, targetActor, move = null) {
    if (!sourceActor || !targetActor) return 0;
    const transferableEffects = (sourceActor.effects?.contents ?? []).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (!automationFlags?.managed) return false;
      if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "modifier") return false;
      const amountApplied = Math.floor(toNumber(automationFlags?.amountApplied, 0));
      if (amountApplied <= 0) return false;
      const path = `${automationFlags?.path ?? ""}`.trim();
      return path.startsWith("system.attributes.");
    });
    if (!transferableEffects.length) return 0;

    const createdEffects = transferableEffects.map((effectDocument) => {
      const effectData = effectDocument.toObject();
      delete effectData._id;
      delete effectData.id;
      effectData.origin = move?.uuid ?? effectData.origin ?? null;
      effectData.transfer = false;
      effectData.disabled = false;
      effectData.flags ??= {};
      effectData.flags[POKROLE.ID] ??= {};
      const automationFlags = effectData.flags[POKROLE.ID].automation ?? {};
      automationFlags.managed = true;
      automationFlags.sourceType = "automation";
      automationFlags.effectType = "modifier";
      automationFlags.sourceItemType = "transfer";
      automationFlags.sourceItemId = move?.id ?? null;
      automationFlags.sourceItemName = move?.name ?? "";
      automationFlags.sourceMoveId = move?.id ?? null;
      automationFlags.sourceMoveName = move?.name ?? "";
      automationFlags.sourceActorId = sourceActor.id ?? null;
      automationFlags.sourceActorName = sourceActor.name ?? "";
      automationFlags.batonPassTransferred = true;
      effectData.flags[POKROLE.ID].automation = automationFlags;
      return effectData;
    });

    await targetActor.createEmbeddedDocuments("ActiveEffect", createdEffects);
    return createdEffects.length;
  }

  async _executeSwitcherMoveRuntime({
    move,
    moveTargetKey,
    targetActors = [],
    hit = false,
    roundKey = null
  } = {}) {
    const rule = this._getSwitcherMoveRule(move);
    if (!rule) return [];

  const results = [];
    const moveName = `${move?.name ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim();
    const sourceCombatant = this._getCombatantForActor(this, game.combat);
    const sourceTrainer = this._getPokemonTrainerActor(this);

    if (rule.mode === "decoy") {
      const selfHpBefore = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
      const selfDamage = Math.max(Math.floor(toNumber(rule.selfDamage, 0)), 0);
      let selfDamageApplied = null;
      if (selfDamage > 0) {
        selfDamageApplied = await this._safeApplyDamage(this, selfDamage, { applyDeadOnZero: false });
      }
      if (Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0) <= 0) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.Decoy"),
          targetName: this.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed")
        });
        return results;
      }
      const decoyEffect = await this._createSubstituteDecoyEffect(this, move);
      results.push({
        label: game.i18n.localize("POKROLE.Combat.Switcher.Decoy"),
        targetName: this.name,
        applied: Boolean(decoyEffect),
        detail: decoyEffect
          ? game.i18n.format("POKROLE.Combat.Switcher.DecoyCreated", {
              actor: this.name,
              hp: 2
            })
          : game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      });
      if (selfDamageApplied) {
        results.unshift({
          label: game.i18n.localize("POKROLE.Chat.Damage"),
          targetName: this.name,
          applied: true,
          detail: `${selfHpBefore} -> ${Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0)}`
        });
      }
      return results;
    }

    if (!hit && rule.requiresHit) {
      return results;
    }

    if (rule.mode === "ally-switch") {
      const allyCandidates = this._getSwitcherMoveCandidates(move, {
        sourceActor: this,
        combat: game.combat
      }).filter((choice) => choice.actor && choice.actor.id !== this.id);
      const chosenAlly = await this._promptSwitchCandidateSelection({
        title: game.i18n.localize("POKROLE.Combat.Switcher.AllySwitch"),
        prompt: game.i18n.localize("POKROLE.Combat.Switcher.SelectAlly"),
        choices: allyCandidates
      });
      if (!chosenAlly) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.AllySwitch"),
          targetName: this.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const chosenCombatant = this._getCombatantForActor(chosenAlly, game.combat);
      if (!chosenCombatant || !sourceCombatant) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.AllySwitch"),
          targetName: chosenAlly.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const swapped = await this._swapCombatantActors(sourceCombatant, chosenCombatant);
      if (!swapped) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.AllySwitch"),
          targetName: chosenAlly.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.CombatantSwapFailed")
        });
        return results;
      }

      if (rule.refundAction) {
        await this.resetActionCounter({ resetInitiative: false });
      }
      if (rule.grantEntryReaction) {
        await chosenAlly.setFlag(
          POKROLE.ID,
          ENTRY_REACTION_BONUS_FLAG_KEY,
          roundKey ?? getCurrentCombatRoundKey()
        );
      }

      results.push({
        label: game.i18n.localize("POKROLE.Combat.Switcher.AllySwitch"),
        targetName: chosenAlly.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Combat.Switcher.AllySwapped", {
          source: this.name,
          target: chosenAlly.name
        })
      });
      return results;
    }

    if (rule.batonPass) {
      const chosenReplacement = await this._promptSwitchCandidateSelection({
        title: game.i18n.localize("POKROLE.Combat.Switcher.SelectTitle"),
        prompt: game.i18n.localize("POKROLE.Combat.Switcher.SelectReplacement"),
        choices: this._getSwitcherMoveCandidates(move, {
          sourceActor: this,
          combat: game.combat
        })
      });
      if (!chosenReplacement) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.BatonPass"),
          targetName: this.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const transferred = await this._transferBatonPassModifiers(this, chosenReplacement, move);
      if (!sourceCombatant) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.BatonPass"),
          targetName: chosenReplacement.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const switched = await this._switchCombatantToActor(game.combat, sourceCombatant, chosenReplacement);
      if (!switched) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.BatonPass"),
          targetName: chosenReplacement.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.CombatantUpdateFailed")
        });
        return results;
      }

      results.push({
        label: game.i18n.localize("POKROLE.Combat.Switcher.BatonPass"),
        targetName: chosenReplacement.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Combat.Switcher.BatonPassTransferred", {
          source: this.name,
          target: chosenReplacement.name,
          count: transferred
        })
      });
      return results;
    }

    if (rule.mode === "self-switch") {
      const selfDamage = Math.max(Math.floor(toNumber(rule.selfDamage, 0)), 0);
      if (selfDamage > 0) {
        await this._safeApplyDamage(this, selfDamage, { applyDeadOnZero: false });
      }

      if (rule.createDecoy) {
        const decoyEffect = await this._createSubstituteDecoyEffect(this, move);
        if (!decoyEffect) {
          results.push({
            label: game.i18n.localize("POKROLE.Combat.Switcher.Decoy"),
            targetName: this.name,
            applied: false,
            detail: game.i18n.localize("POKROLE.Combat.Switcher.DecoyAlreadyPresent")
          });
        } else {
          results.push({
            label: game.i18n.localize("POKROLE.Combat.Switcher.Decoy"),
            targetName: this.name,
            applied: true,
            detail: game.i18n.format("POKROLE.Combat.Switcher.DecoyCreated", {
              actor: this.name,
              hp: 2
            })
          });
        }
      }

      const chosenReplacement = await this._promptSwitchCandidateSelection({
        title: game.i18n.localize("POKROLE.Combat.Switcher.SelectTitle"),
        prompt: game.i18n.localize("POKROLE.Combat.Switcher.SelectReplacement"),
        choices: this._getSwitcherMoveCandidates(move, {
          sourceActor: this,
          combat: game.combat
        })
      });
      if (!chosenReplacement) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.SelfSwitch"),
          targetName: this.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      if (!sourceCombatant) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.SelfSwitch"),
          targetName: chosenReplacement.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const switched = await this._switchCombatantToActor(game.combat, sourceCombatant, chosenReplacement);
      if (!switched) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.SelfSwitch"),
          targetName: chosenReplacement.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.CombatantUpdateFailed")
        });
        return results;
      }

      results.push({
        label: game.i18n.localize("POKROLE.Combat.Switcher.SelfSwitch"),
        targetName: chosenReplacement.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Combat.Switcher.SelfSwitched", {
          source: this.name,
          target: chosenReplacement.name
        })
      });
      return results;
    }

    if (rule.mode === "forced-foe-switch") {
      const targetActor = targetActors[0] ?? null;
      if (!targetActor) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.ForcedSwitch"),
          targetName: game.i18n.localize("POKROLE.Chat.NoTarget"),
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const chosenReplacement = await this._promptSwitchCandidateSelection({
        title: game.i18n.localize("POKROLE.Combat.Switcher.SelectTitle"),
        prompt: game.i18n.localize("POKROLE.Combat.Switcher.SelectReplacement"),
        choices: this._getSwitcherMoveCandidates(move, {
          sourceActor: this,
          targetActor,
          combat: game.combat
        })
      });
      if (!chosenReplacement) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.ForcedSwitch"),
          targetName: targetActor.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const targetCombatant = this._getCombatantForActor(targetActor, game.combat);
      if (!targetCombatant) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.ForcedSwitch"),
          targetName: targetActor.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.NoValidSwitchCandidate")
        });
        return results;
      }

      const switched = await this._switchCombatantToActor(game.combat, targetCombatant, chosenReplacement);
      if (!switched) {
        results.push({
          label: game.i18n.localize("POKROLE.Combat.Switcher.ForcedSwitch"),
          targetName: targetActor.name,
          applied: false,
          detail: game.i18n.localize("POKROLE.Errors.CombatantUpdateFailed")
        });
        return results;
      }

      results.push({
        label: game.i18n.localize("POKROLE.Combat.Switcher.ForcedSwitch"),
        targetName: targetActor.name,
        applied: true,
        detail: game.i18n.format("POKROLE.Combat.Switcher.ForcedSwitched", {
          target: targetActor.name,
          replacement: chosenReplacement.name
        })
      });
      return results;
    }

    return results;
  }

  // ── Ability Runtime ──────────────────────────────────────────────────

  /**
   * Get all ability items on this actor that have automation (secondaryEffects).
   */
  _getAbilityItemsWithAutomation() {
    return this.items.filter((item) => {
      if (item.type !== "ability") return false;
      const effects = item.system?.secondaryEffects;
      return Array.isArray(effects) && effects.length > 0;
    });
  }

  /**
   * Get the active ability items for this actor.
   * Returns only the ability matching system.ability (the currently selected ability).
   * Looks first in embedded items, then falls back to searching the abilities compendium.
   */
  async _getActiveAbilityItems() {
    const activeAbilityName = `${this.system?.ability ?? ""}`.trim();
    if (!activeAbilityName) return [];

    // Always prefer compendium version — it has the latest automation data.
    // Embedded items may be stale (imported before trigger/effect updates).
    for (const pack of game.packs.filter((p) => p.documentName === "Item")) {
      const index = await pack.getIndex();
      const entry = index.find(
        (e) => e.type === "ability" && e.name === activeAbilityName
      );
      if (entry) {
        const doc = await pack.getDocument(entry._id);
        if (doc) return [doc];
      }
    }

    // Fallback: use embedded item if compendium doesn't have it
    const embeddedMatch = this.items.find(
      (item) => item.type === "ability" && item.name === activeAbilityName
    );
    if (embeddedMatch) return [embeddedMatch];

    return [];
  }

  /**
   * Get the secondary effects for an ability item.
   * Prefers the new structured secondaryEffects array; falls back to legacy JSON payload in effect text.
   */
  _getAbilitySecondaryEffects(abilityItem) {
    const structuredEffects = abilityItem.system?.secondaryEffects;
    if (Array.isArray(structuredEffects) && structuredEffects.length > 0) {
      return structuredEffects.map((effect) =>
        this._normalizeSecondaryEffectDefinition({
          ...effect,
          label: `${effect?.label ?? ""}`.trim() || abilityItem.name
        })
      );
    }
    // Legacy fallback: parse JSON payload from effect text
    const payloadEffects = this._parseAbilityAutomationPayload(abilityItem.system?.effect);
    if (payloadEffects.length > 0) {
      return payloadEffects.map((effect) =>
        this._normalizeSecondaryEffectDefinition({
          ...effect,
          label: `${effect?.label ?? ""}`.trim() || abilityItem.name
        })
      );
    }
    return [];
  }

  /**
   * Runtime maxStacks lookup for abilities with stacking stat caps.
   * Used as fallback when embedded item data doesn't include maxStacks.
   */
  _getAbilityRuntimeMaxStacks(abilityItem) {
    const name = `${abilityItem?.name ?? ""}`.trim().toLowerCase();
    const ABILITY_MAX_STACKS = {
      "speed boost": 3,
      "moxie": 3,
      "chilling neigh": 3,
      "grim neigh": 3,
      "soul heart": 3,
      "beast boost": 3,
      "supreme overlord": 3,
      "justified": 3,
      "rattled": 3
    };
    return ABILITY_MAX_STACKS[name] ?? 0;
  }

  /**
   * Check if an ability trigger matches a given trigger key.
   */
  _abilityTriggerMatches(abilityItem, triggerKey, context = {}) {
    const abilityTrigger = `${abilityItem.system?.abilityTrigger ?? "always"}`.trim().toLowerCase();

    // Legacy: if ability uses old trigger field instead of abilityTrigger
    if (!ABILITY_TRIGGER_KEYS.includes(abilityTrigger)) {
      const legacyTrigger = `${abilityItem.system?.trigger ?? ""}`.trim().toLowerCase();
      return !legacyTrigger ||
        legacyTrigger.includes("always") ||
        (context.hit && legacyTrigger.includes("hit")) ||
        (!context.hit && legacyTrigger.includes("miss"));
    }

    switch (abilityTrigger) {
      case "always":
        // "always" abilities fire on enter-battle (to apply initial effects)
        // and during move resolution (attacker ability context where triggerKey is "always")
        return triggerKey === "enter-battle" || triggerKey === "always";
      case "enter-battle":
        return triggerKey === "enter-battle";
      case "round-start":
        return triggerKey === "round-start";
      case "round-end":
        return triggerKey === "round-end";
      case "turn-start":
        return triggerKey === "turn-start";
      case "turn-end":
        return triggerKey === "turn-end";
      case "on-hit-by-physical":
        return triggerKey === "on-hit-by" && context.moveCategory === "physical";
      case "on-hit-by-special":
        return triggerKey === "on-hit-by" && context.moveCategory === "special";
      case "on-hit-by-any":
        return triggerKey === "on-hit-by";
      case "on-hit-by-contact":
        return triggerKey === "on-hit-by" && context.moveCategory === "physical";
      case "on-hit-by-type": {
        // Also triggers on stat-lowered for abilities like Rattled (Intimidate interaction)
        if (triggerKey === "on-stat-lowered") {
          const abilityNotes = `${abilityItem.getFlag?.("pok-role-system", "automationNotes") ?? ""}`.trim().toLowerCase();
          return abilityNotes.includes("intimidate");
        }
        if (triggerKey !== "on-hit-by") return false;
        const condType = `${abilityItem.system?.triggerConditionType ?? ""}`.trim().toLowerCase();
        if (!condType) return true;
        const moveType = `${context.moveType ?? ""}`.trim().toLowerCase();
        return condType.split(",").map((t) => t.trim()).filter(Boolean).includes(moveType);
      }
      case "on-deal-damage":
        return triggerKey === "on-deal-damage" && context.hit && toNumber(context.finalDamage, 0) > 0;
      case "on-critical-hit-received":
        return triggerKey === "on-hit-by" && context.critical === true;
      case "on-critical-hit-dealt":
        return triggerKey === "on-deal-damage" && context.critical === true;
      case "on-foe-faint":
        return triggerKey === "on-foe-faint";
      case "on-ally-faint":
        return triggerKey === "on-ally-faint";
      case "on-self-faint":
        return triggerKey === "on-self-faint";
      case "self-hp-half-or-less": {
        if (!["enter-battle", "round-start", "on-hit-by", "always"].includes(triggerKey)) return false;
        const hp = toNumber(this.system?.resources?.hp?.value, 0);
        const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 1), 1);
        return hp > 0 && hp <= Math.floor(hpMax / 2);
      }
      case "self-hp-quarter-or-less": {
        if (!["enter-battle", "round-start", "on-hit-by", "always"].includes(triggerKey)) return false;
        const hp = toNumber(this.system?.resources?.hp?.value, 0);
        const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 1), 1);
        return hp > 0 && hp <= Math.floor(hpMax / 4);
      }
      case "self-hp-full": {
        if (!["enter-battle", "round-start", "always"].includes(triggerKey)) return false;
        const hp = toNumber(this.system?.resources?.hp?.value, 0);
        const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 1), 1);
        return hp >= hpMax;
      }
      case "self-has-condition": {
        if (!["enter-battle", "round-start", "round-end", "turn-start", "always", "condition-applied"].includes(triggerKey)) return false;
        const condKeys = `${abilityItem.system?.triggerConditionType ?? ""}`.trim().toLowerCase()
          .split(",").map((k) => k.trim()).filter(Boolean);
        const condActiveResults = condKeys.map((k) => ({ key: k, active: this._isConditionActive(k) }));
        console.log(`PokRole | [triggerMatch] self-has-condition: triggerKey="${triggerKey}" condKeys=${JSON.stringify(condKeys)} activeResults=${JSON.stringify(condActiveResults)}`);
        return condKeys.length > 0 ? condActiveResults.some((r) => r.active) : false;
      }
      case "self-missing-condition": {
        if (!["enter-battle", "round-start", "round-end", "turn-start", "always"].includes(triggerKey)) return false;
        const condKeys = `${abilityItem.system?.triggerConditionType ?? ""}`.trim().toLowerCase()
          .split(",").map((k) => k.trim()).filter(Boolean);
        return condKeys.length > 0 ? condKeys.every((k) => !this._isConditionActive(k)) : true;
      }
      case "target-has-condition": {
        if (!["enter-battle", "round-start", "round-end", "always"].includes(triggerKey)) return false;
        const condKey = `${abilityItem.system?.triggerConditionType ?? ""}`.trim().toLowerCase();
        const target = context.targetActor ?? null;
        return condKey && target ? target._isConditionActive?.(condKey) : false;
      }
      case "weather-active": {
        if (!["enter-battle", "round-start", "always"].includes(triggerKey)) return false;
        const condWeather = `${abilityItem.system?.triggerConditionWeather ?? ""}`.trim().toLowerCase();
        if (!condWeather) return false;
        const currentWeather = `${this.getActiveWeatherKey?.() ?? ""}`.trim().toLowerCase();
        return condWeather.split(",").map((w) => w.trim()).filter(Boolean).includes(currentWeather);
      }
      case "terrain-active": {
        if (!["enter-battle", "round-start", "always"].includes(triggerKey)) return false;
        const condTerrain = `${abilityItem.system?.triggerConditionTerrain ?? ""}`.trim().toLowerCase();
        if (!condTerrain) return false;
        const activeTerrain = this.getActiveTerrainKey?.() ?? "";
        return condTerrain.split(",").map((t) => t.trim()).filter(Boolean).includes(activeTerrain);
      }
      case "on-stat-lowered":
        return triggerKey === "on-stat-lowered";
      case "custom":
        return triggerKey === "custom";
      default:
        return false;
    }
  }

  /**
   * Resolve target actors for an ability based on its abilityTarget field.
   * Unlike move secondary targets, abilities need to resolve foes/allies from combat context.
   */
  _resolveAbilityTargetActors(abilityItem, context = {}) {
    const abilityTarget = `${abilityItem.system?.abilityTarget ?? "self"}`.trim().toLowerCase();
    const combat = context.combat ?? game.combat ?? null;
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const key = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(key)) uniqueActors.set(key, actor);
    };

    // If context provides explicit target actors, use them
    if (context.targetActors?.length > 0 && ["foe", "attacker"].includes(abilityTarget)) {
      for (const actor of context.targetActors) addActor(actor);
      return [...uniqueActors.values()];
    }

    switch (abilityTarget) {
      case "self":
        addActor(this);
        break;
      case "attacker":
        if (context.attackerActor) addActor(context.attackerActor);
        break;
      case "foe":
        if (context.attackerActor) {
          addActor(context.attackerActor);
        } else if (combat) {
          const foes = this._getCombatActorsByDisposition(combat, "opposing");
          if (foes.length > 0) addActor(foes[0]);
        }
        break;
      case "all-foes":
        if (combat) {
          for (const foe of this._getCombatActorsByDisposition(combat, "opposing")) addActor(foe);
        }
        break;
      case "ally":
        addActor(this);
        break;
      case "all-allies":
        if (combat) {
          for (const ally of this._getCombatActorsByDisposition(combat, "same")) addActor(ally);
        } else {
          addActor(this);
        }
        break;
      case "all-in-range":
        if (combat) {
          for (const combatant of combat.combatants ?? []) {
            if (combatant.actor && !combatant.actor._isConditionActive?.("fainted")) {
              addActor(combatant.actor);
            }
          }
        } else {
          addActor(this);
        }
        break;
      default:
        addActor(this);
        break;
    }

    return [...uniqueActors.values()];
  }

  /**
   * Get combat actors by disposition relative to this actor.
   * @param {Combat} combat
   * @param {"same"|"opposing"} side
   * @returns {Actor[]}
   */
  _getCombatActorsByDisposition(combat, side = "opposing") {
    if (!combat) return [];
    const ownDisposition = this._getActorCombatSideDisposition(this, combat);
    const actors = [];
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant.actor;
      if (!actor || actor.id === this.id) continue;
      if (actor._isConditionActive?.("fainted") || actor._isConditionActive?.("dead")) continue;
      const actorDisposition = this._getActorCombatSideDisposition(actor, combat);
      if (side === "opposing" && actorDisposition !== ownDisposition && actorDisposition !== 0) {
        actors.push(actor);
      } else if (side === "same" && (actorDisposition === ownDisposition || actorDisposition === 0)) {
        actors.push(actor);
      }
    }
    return actors;
  }

  /**
   * Apply ability secondary effects from the ATTACKER's abilities during move resolution.
   * Called from rollMove() after damage and move secondary effects.
   */
  async _applyAbilityAutomationEffects({
    move,
    moveTargetKey,
    targetActors,
    hit,
    isDamagingMove,
    finalDamage,
    damageTargetResults = [],
    roundKey = null,
    blockedTargetIds = null
  }) {
    const abilityItems = await this._getActiveAbilityItems();
    if (!abilityItems.length) return [];

    const results = [];
    const category = `${move?.system?.category ?? "physical"}`.trim().toLowerCase();
    const moveType = `${move?.system?.type ?? ""}`.trim().toLowerCase();

    for (const abilityItem of abilityItems) {
      // Check for "always" trigger or on-deal-damage trigger for attacker abilities
      const triggerKey = hit && isDamagingMove && toNumber(finalDamage, 0) > 0 ? "on-deal-damage" : "always";
      const matchesAlways = this._abilityTriggerMatches(abilityItem, "always", { hit, moveCategory: category, moveType });
      const matchesDealDamage = triggerKey === "on-deal-damage" && this._abilityTriggerMatches(abilityItem, "on-deal-damage", {
        hit, moveCategory: category, moveType, finalDamage, critical: damageTargetResults[0]?.effectiveCritical === true
      });

      if (!matchesAlways && !matchesDealDamage) continue;

      const normalizedEffects = this._getAbilitySecondaryEffects(abilityItem);
      if (!normalizedEffects.length) continue;

      const abilityTargets = this._resolveAbilityTargetActors(abilityItem, {
        targetActors,
        combat: game.combat
      });

      const effectResults = await this._applyMoveSecondaryEffects({
        move,
        sourceItem: abilityItem,
        moveTargetKey,
        secondaryEffects: normalizedEffects,
        targetActors: abilityTargets,
        hit: true,
        isDamagingMove,
        finalDamage,
        damageTargetResults,
        roundKey,
        blockedTargetIds
      });
      results.push(...effectResults);
    }

    return results;
  }

  /**
   * Apply DEFENDER's ability effects when this actor is hit by a move.
   * Called from rollMove() on each target actor after damage resolution.
   */
  async _applyDefenderAbilityEffects({
    attackerActor,
    move,
    moveTargetKey,
    hit,
    isDamagingMove,
    finalDamage,
    damageTargetResults = [],
    roundKey = null,
    critical = false
  }) {
    if (!hit || !isDamagingMove) return [];
    const abilityItems = await this._getActiveAbilityItems();
    if (!abilityItems.length) return [];

    const results = [];
    const category = `${move?.system?.category ?? "physical"}`.trim().toLowerCase();
    const moveType = `${move?.system?.type ?? ""}`.trim().toLowerCase();

    for (const abilityItem of abilityItems) {
      const triggerMatches = this._abilityTriggerMatches(abilityItem, "on-hit-by", {
        hit: true,
        moveCategory: category,
        moveType,
        critical
      });
      console.log(`PokRole | [defenderAbility] Ability="${abilityItem.name}" trigger="${abilityItem.system?.abilityTrigger}" vs "on-hit-by" => matches=${triggerMatches}`);
      if (!triggerMatches) continue;

      const normalizedEffects = this._getAbilitySecondaryEffects(abilityItem);
      if (!normalizedEffects.length) continue;

      // Inject runtime maxStacks for abilities with stacking caps (e.g. Justified)
      const runtimeMaxStacks = this._getAbilityRuntimeMaxStacks(abilityItem);
      if (runtimeMaxStacks > 0) {
        for (const eff of normalizedEffects) {
          if (eff.effectType === "stat" && (eff.maxStacks ?? 0) === 0) {
            eff.maxStacks = runtimeMaxStacks;
          }
        }
      }

      const abilityTargets = this._resolveAbilityTargetActors(abilityItem, {
        attackerActor,
        targetActors: attackerActor ? [attackerActor] : [],
        combat: game.combat
      });

      for (const effect of normalizedEffects) {
        // Roll chance dice for the effect
        const baseChanceDice = this._normalizeSecondaryChanceDice(effect.chance);
        let chanceSucceeded = true;
        let chanceRollResults = [];
        if (baseChanceDice > 0) {
          const chanceRoll = await new Roll(`${baseChanceDice}d6`).evaluate();
          chanceRollResults = chanceRoll.dice.flatMap((die) =>
            Array.isArray(die?.results)
              ? die.results.map((r) => Math.floor(toNumber(r?.result, 0)))
              : []
          );
          chanceSucceeded = chanceRollResults.some((r) => r === 6);
        }

        if (!chanceSucceeded) {
          results.push({
            label: `${abilityItem.name}`,
            targetName: game.i18n.localize("POKROLE.Common.None"),
            applied: false,
            detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
              rolls: chanceRollResults.join(", "),
              dice: baseChanceDice
            })
          });
          continue;
        }

        for (const targetActor of abilityTargets) {
          const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, abilityItem, {
            moveTargetKey,
            hit: true,
            isDamagingMove,
            finalDamage,
            totalDamageDealt: toNumber(finalDamage, 0),
            damageTargetResults
          });
          results.push({
            label: `${abilityItem.name}`,
            targetName: targetActor.name,
            applied: applyResult.applied,
            detail: applyResult.applied
              ? applyResult.detail
              : this._resolveSecondaryEffectFailureDetail(effect, targetActor, applyResult, {
                  finalDamage,
                  totalDamageDealt: toNumber(finalDamage, 0),
                  damageTargetResults
                })
          });
        }
      }
    }

    return results;
  }

  /**
   * Process ability effects for a given combat trigger phase.
   * Called from combat hooks for enter-battle, round-start/end, turn-start/end, foe-faint, etc.
   * @param {string} triggerKey - One of ABILITY_TRIGGER_KEYS
   * @param {object} context - Additional context for trigger evaluation
   * @returns {Array} Array of result objects
   */
  async processAbilityTriggerEffects(triggerKey, context = {}) {
    console.log(`PokRole | [processAbilityTrigger] Actor="${this.name}" triggerKey="${triggerKey}"`);
    // Allow on-self-faint to fire even when fainted (e.g. Aftermath)
    if (triggerKey !== "on-self-faint") {
      const isFainted = this._isConditionActive?.("fainted");
      const isDead = this._isConditionActive?.("dead");
      if (isFainted || isDead) {
        console.log(`PokRole | [processAbilityTrigger] EARLY RETURN: fainted=${isFainted} dead=${isDead}`);
        return [];
      }
    }

    // On enter-battle, cleanse conditions the active ability is immune to (e.g. Insomnia removes sleep)
    if (triggerKey === "enter-battle" && typeof this.cleanseAbilityImmuneConditions === "function") {
      try { await this.cleanseAbilityImmuneConditions(); } catch (e) { console.warn("PokRole | cleanseAbilityImmuneConditions failed:", e); }
    }

    const abilityItems = await this._getActiveAbilityItems();
    console.log(`PokRole | [processAbilityTrigger] Found ${abilityItems.length} active ability items: [${abilityItems.map((a) => `${a.name} (trigger=${a.system?.abilityTrigger})`).join(", ")}]`);
    if (!abilityItems.length) return [];

    const results = [];
    for (const abilityItem of abilityItems) {
      const triggerMatches = this._abilityTriggerMatches(abilityItem, triggerKey, context);
      console.log(`PokRole | [processAbilityTrigger] Ability="${abilityItem.name}" abilityTrigger="${abilityItem.system?.abilityTrigger}" vs triggerKey="${triggerKey}" => matches=${triggerMatches}`);
      if (!triggerMatches) continue;

      const normalizedEffects = this._getAbilitySecondaryEffects(abilityItem);
      console.log(`PokRole | [processAbilityTrigger] Ability="${abilityItem.name}" has ${normalizedEffects.length} secondary effects`);
      if (!normalizedEffects.length) continue;

      // Moody-style: remove previous round's effects from the same ability before applying new ones
      const abilityNotes = `${abilityItem.getFlag?.("pok-role-system", "automationNotes") ?? ""}`.trim().toLowerCase();
      if (abilityNotes.includes("reset previous") || abilityNotes.includes("moody")) {
        const abilityName = `${abilityItem.name ?? ""}`.trim();
        const previousEffectIds = (this.effects?.contents ?? [])
          .filter((e) => {
            const flags = e.getFlag?.("pok-role-system", "automation") ?? {};
            return flags?.managed && flags?.sourceItemName === abilityName && flags?.sourceItemType === "ability";
          })
          .map((e) => e.id)
          .filter(Boolean);
        if (previousEffectIds.length > 0) {
          await this.deleteEmbeddedDocuments("ActiveEffect", previousEffectIds);
        }
      }

      // Inject runtime maxStacks for abilities with stacking caps.
      // Ensures the cap works even if the embedded item is a stale copy without maxStacks.
      const runtimeMaxStacks = this._getAbilityRuntimeMaxStacks(abilityItem);
      if (runtimeMaxStacks > 0) {
        for (const eff of normalizedEffects) {
          if (eff.effectType === "stat" && (eff.maxStacks ?? 0) === 0) {
            eff.maxStacks = runtimeMaxStacks;
          }
        }
      }

      const abilityTargets = this._resolveAbilityTargetActors(abilityItem, {
        combat: context.combat ?? game.combat,
        attackerActor: context.attackerActor ?? null,
        targetActors: context.targetActors ?? []
      });

      for (const effect of normalizedEffects) {
        const baseChanceDice = this._normalizeSecondaryChanceDice(effect.chance);
        let chanceSucceeded = true;
        let chanceRollResults = [];
        if (baseChanceDice > 0) {
          const chanceRoll = await new Roll(`${baseChanceDice}d6`).evaluate();
          chanceRollResults = chanceRoll.dice.flatMap((die) =>
            Array.isArray(die?.results)
              ? die.results.map((r) => Math.floor(toNumber(r?.result, 0)))
              : []
          );
          chanceSucceeded = chanceRollResults.some((r) => r === 6);
        }

        if (!chanceSucceeded) {
          results.push({
            label: `${abilityItem.name}`,
            targetName: game.i18n.localize("POKROLE.Common.None"),
            applied: false,
            detail: game.i18n.format("POKROLE.Chat.SecondaryEffectChanceFailed", {
              rolls: chanceRollResults.join(", "),
              dice: baseChanceDice
            })
          });
          continue;
        }

        for (const targetActor of abilityTargets) {
          const applyResult = await this._applySecondaryEffectToActor(effect, targetActor, abilityItem, {
            moveTargetKey: "self",
            hit: true,
            isDamagingMove: false,
            finalDamage: 0,
            totalDamageDealt: 0,
            damageTargetResults: []
          });
          results.push({
            label: `${abilityItem.name}`,
            targetName: targetActor.name,
            applied: applyResult.applied,
            detail: applyResult.applied
              ? applyResult.detail
              : this._resolveSecondaryEffectFailureDetail(effect, targetActor, applyResult, {
                  finalDamage: 0,
                  totalDamageDealt: 0,
                  damageTargetResults: []
                })
          });
        }
      }
    }

    if (results.length > 0 && results.some((r) => r.applied)) {
      await this._postAbilityTriggerChatMessage(triggerKey, results);
    }

    return results;
  }

  /**
   * Post a chat message summarizing ability trigger effects.
   */
  async _postAbilityTriggerChatMessage(triggerKey, results = []) {
    const appliedResults = results.filter((r) => r.applied);
    if (!appliedResults.length) return;

    const triggerLabel = game.i18n.localize(`POKROLE.Ability.Trigger.${triggerKey}`) || triggerKey;
    const sections = appliedResults.map((r) =>
      `<p><strong>${r.label}</strong> → ${r.targetName}: ${r.detail}</p>`
    ).join("");

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card arcade-blue">
          <header class="chat-card-header">
            <h3>${game.i18n.localize("POKROLE.Chat.AbilityTrigger")}: ${triggerLabel}</h3>
          </header>
          <section class="chat-card-section">
            <p><strong>${this.name}</strong></p>
            ${sections}
          </section>
        </div>
      `
    });
  }

  _parseAbilityAutomationPayload(effectText) {
    const text = `${effectText ?? ""}`.trim();
    if (!text) return [];
    if (!(text.startsWith("{") || text.startsWith("["))) {
      return [];
    }

    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") return [parsed];
    } catch (error) {
      console.warn(`${POKROLE.ID} | Invalid ability automation JSON payload`, error);
    }
    return [];
  }

  _secondaryTriggerMatches(trigger, { hit, isDamagingMove, finalDamage }) {
    switch (`${trigger ?? "on-hit"}`.toLowerCase()) {
      case "always":
        return true;
      case "on-miss":
        return !hit;
      case "on-hit-damage":
        return hit && isDamagingMove && toNumber(finalDamage, 0) > 0;
      case "on-hit":
      default:
        return hit;
    }
  }

  _resolveActorsForSecondaryTarget(targetMode, context) {
    const { moveTargetKey, targetActors } = context;
    const normalizedTarget =
      MOVE_SECONDARY_TARGET_KEYS.includes(targetMode) ? targetMode : "target";
    const uniqueActors = new Map();
    const addActor = (actor) => {
      if (!actor) return;
      const key = actor.id ?? actor.uuid ?? actor.name;
      if (!uniqueActors.has(key)) uniqueActors.set(key, actor);
    };

    switch (normalizedTarget) {
      case "self":
        addActor(this);
        break;
      case "all-targets":
      case "all-foes":
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "all-allies":
        addActor(this);
        for (const actor of targetActors ?? []) addActor(actor);
        break;
      case "target":
      default:
        if ((targetActors ?? []).length > 0) {
          addActor(targetActors[0]);
        } else if (this._normalizeMoveTargetKey(moveTargetKey) === "self") {
          addActor(this);
        }
        break;
    }

    return [...uniqueActors.values()];
  }

  _formatSecondaryEffectLabel(effect) {
    if (effect.label) return effect.label;
    const normalizedType = this._normalizeSecondaryEffectType(effect.effectType);

    const effectTypeLabel = this._localizeSecondaryEffectTypeLabel(normalizedType);
    if (normalizedType === "condition" && effect.condition !== "none") {
      const conditionLabel =
        this._normalizeConditionKey(effect.condition) === "burn"
          ? this._localizeBurnStageName(this._resolveBurnStageFromCondition(effect.condition))
          : this._localizeConditionName(effect.condition);
      return `${effectTypeLabel}: ${conditionLabel}`;
    }
    if (normalizedType === "weather") {
      return `${effectTypeLabel}: ${this._localizeSecondaryWeatherName(effect.weather)}`;
    }
    if (normalizedType === "terrain") {
      return `${effectTypeLabel}: ${this._localizeSecondaryTerrainName(effect.terrain)}`;
    }
    if (normalizedType === "stat" && effect.stat !== "none" && effect.amount !== 0) {
      const amountText = effect.amount > 0 ? `+${effect.amount}` : `${effect.amount}`;
      return `${effectTypeLabel}: ${this._localizeSecondaryStatName(effect.stat)} ${amountText}`;
    }
    if (normalizedType === "cleanse") {
      const cleanseConditionKeys = this._getCleanseConditionKeys(effect);
      if (cleanseConditionKeys.length <= 0) return effectTypeLabel;
      return `${effectTypeLabel}: ${cleanseConditionKeys
        .map((conditionKey) => this._localizeConditionName(conditionKey))
        .join(", ")}`;
    }
    if (normalizedType === "heal") {
      const healMode = this._normalizeSecondaryHealMode(
        effect.healMode,
        normalizedType,
        effect.amount
      );
      if (healMode === "damage-percent") {
        return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}% ${game.i18n.localize("POKROLE.Move.Secondary.HealMode.OfDamageDealt")}`;
      }
      if (healMode === "max-hp-percent") {
        return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}% ${game.i18n.localize("POKROLE.Move.Secondary.HealMode.OfMaxHp")}`;
      }
      return `${effectTypeLabel}: ${Math.abs(toNumber(effect.amount, 0))}`;
    }
    if (["damage", "will"].includes(normalizedType)) {
      return `${effectTypeLabel}: ${effect.amount}`;
    }
    return effectTypeLabel;
  }

  _toSecondaryTypeLabelSuffix(effectType) {
    const suffixByType = {
      condition: "Condition",
      "active-effect": "ActiveEffect",
      stat: "Stat",
      cleanse: "Cleanse",
      weather: "Weather",
      terrain: "Terrain",
      damage: "Damage",
      heal: "Heal",
      will: "Will",
      custom: "Custom"
    };
    return suffixByType[effectType] ?? "Custom";
  }

  _localizeSecondaryEffectTypeLabel(effectType) {
    const suffix = this._toSecondaryTypeLabelSuffix(effectType);
    const labelKey = `POKROLE.Move.Secondary.Type.${suffix}.Label`;
    if (game.i18n.has?.(labelKey)) {
      return game.i18n.localize(labelKey);
    }
    return game.i18n.localize(`POKROLE.Move.Secondary.Type.${suffix}`);
  }

  _localizeConditionName(conditionKey) {
    const normalizedCondition = `${conditionKey ?? ""}`
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "");
    if (normalizedCondition === "burn1") return this._localizeBurnStageName(1);
    if (normalizedCondition === "burn2") return this._localizeBurnStageName(2);
    if (normalizedCondition === "burn3") return this._localizeBurnStageName(3);
    const knownConditionLabels = {
      sleep: "POKROLE.Conditions.Sleep",
      burn: "POKROLE.Conditions.Burn",
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
    return game.i18n.localize(knownConditionLabels[conditionKey] ?? "POKROLE.Common.Unknown");
  }

  _localizeSecondaryStatName(statKey) {
    const combatStatLabels = {
      accuracy: "POKROLE.Pokemon.Accuracy",
      damage: "POKROLE.Pokemon.Damage",
      evasion: "POKROLE.Pokemon.Evasion",
      clash: "POKROLE.Pokemon.Clash",
      defense: "POKROLE.Combat.Defense",
      specialDefense: "POKROLE.Combat.SpecialDefense"
    };
    if (combatStatLabels[statKey]) {
      return game.i18n.localize(combatStatLabels[statKey]);
    }
    return this.localizeTrait(statKey);
  }

  _localizeSecondaryWeatherName(weatherKey) {
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
    const normalizedWeather = this._normalizeSecondaryWeatherKey(weatherKey);
    return game.i18n.localize(labelByWeather[normalizedWeather] ?? "POKROLE.Common.None");
  }

  _localizeSecondaryTerrainName(terrainKey) {
    const labelByTerrain = {
      none: "POKROLE.Common.None",
      electric: "POKROLE.Combat.TerrainValues.Electric",
      grassy: "POKROLE.Combat.TerrainValues.Grassy",
      misty: "POKROLE.Combat.TerrainValues.Misty",
      psychic: "POKROLE.Combat.TerrainValues.Psychic"
    };
    const normalizedTerrain = this._normalizeSecondaryTerrainKey(terrainKey);
    return game.i18n.localize(labelByTerrain[normalizedTerrain] ?? "POKROLE.Common.None");
  }

  _resolveSecondaryEffectFailureDetail(effect, targetActor = null, applyResult = {}, context = {}) {
    const rawDetail = `${applyResult?.detail ?? ""}`.trim();
    const noneLabel = game.i18n.localize("POKROLE.Common.None");
    const unknownLabel = game.i18n.localize("POKROLE.Common.Unknown");
    if (rawDetail && ![noneLabel, unknownLabel].includes(rawDetail)) return rawDetail;

    const normalizedType = this._normalizeSecondaryEffectType(effect?.effectType);
    switch (normalizedType) {
      case "heal": {
        const resolvedHeal = this._resolveSecondaryHealConfiguration(effect, context?.sourceMove ?? null);
        const healMode = resolvedHeal.healMode;
        if (applyResult?.healingBlocked) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectHealingBlocked");
        }
        if (resolvedHeal.adjustmentDetail && Math.max(toNumber(resolvedHeal.amount, 0), 0) <= 0) {
          return resolvedHeal.adjustmentDetail;
        }
        if (healMode === "damage-percent" && Math.max(toNumber(context?.totalDamageDealt, 0), 0) <= 0) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoDamageToDrain");
        }
        if (targetActor) {
          const hpValue = Math.max(toNumber(targetActor.system?.resources?.hp?.value, 0), 0);
          const hpMax = Math.max(toNumber(targetActor.system?.resources?.hp?.max, 1), 1);
          if (hpValue >= hpMax) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyFullHp");
          }
          if (game.combat && targetActor instanceof PokRoleActor) {
            const limit = this._getHealingRoundLimit(resolvedHeal.healingCategory);
            if (Number.isFinite(limit)) {
              const track = targetActor._getHealingTrack();
              if (Math.max(toNumber(track?.healedThisRound, 0), 0) >= limit) {
                return game.i18n.format("POKROLE.Chat.SecondaryEffectHealingLimitReached", { limit });
              }
            }
          }
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoHealConfigured");
      }
      case "damage":
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoDamageConfigured");
      case "stat": {
        const statKey = this._normalizeSecondaryStatKey(effect?.stat);
        if (statKey === "none" || rawDetail === unknownLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectInvalidStat");
        }
        if (Math.floor(toNumber(effect?.amount, 0)) === 0 || rawDetail === noneLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatConfigured");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange");
      }
      case "will": {
        const amount = Math.floor(toNumber(effect?.amount, 0));
        if (amount === 0 || rawDetail === noneLabel) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWillConfigured");
        }
        if (targetActor) {
          const currentWill = Math.max(toNumber(targetActor.system?.resources?.will?.value, 0), 0);
          const maxWill = Math.max(toNumber(targetActor.system?.resources?.will?.max, 1), 1);
          if (amount > 0 && currentWill >= maxWill) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyFullWill");
          }
          if (amount < 0 && currentWill <= 0) {
            return game.i18n.localize("POKROLE.Chat.SecondaryEffectTargetAlreadyEmptyWill");
          }
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWillChange");
      }
      case "condition":
        if (this._normalizeConditionKey(effect?.condition) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoConditionConfigured");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "cleanse":
        if (this._getCleanseConditionKeys(effect).length <= 0) {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoCleanseConfigured");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoRemovableCondition");
      case "weather":
        if (this._normalizeSecondaryWeatherKey(effect?.weather) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoWeatherConfigured");
        }
        if (!game.combat) {
          return game.i18n.localize("POKROLE.Errors.CombatRequired");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "terrain":
        if (this._normalizeSecondaryTerrainKey(effect?.terrain) === "none") {
          return game.i18n.localize("POKROLE.Chat.SecondaryEffectNoTerrainConfigured");
        }
        if (!game.combat) {
          return game.i18n.localize("POKROLE.Errors.CombatRequired");
        }
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      case "active-effect":
        return game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration");
      case "custom":
        return `${effect?.notes ?? ""}`.trim() || game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
      default:
        return game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed");
    }
  }

  async _applySecondaryEffectToActor(effect, targetActor, sourceMove = null, context = {}) {
    const activationCheck = this._evaluateSecondaryActivationCondition(
      effect,
      targetActor,
      sourceMove,
      context
    );
    if (!activationCheck.passed) {
      return {
        applied: false,
        detail: activationCheck.detail || game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionNotMet")
      };
    }

    const normalizedType = this._normalizeSecondaryEffectType(effect.effectType);
    switch (normalizedType) {
      case "condition":
        return this._applyConditionEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "active-effect":
        return this._applySecondaryActiveEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "stat":
        return this._applyStatEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor,
          sourceMove
        );
      case "cleanse":
        return this._applyCleanseEffectToActor(
          { ...effect, effectType: normalizedType },
          targetActor
        );
      case "weather":
        return this._applyWeatherEffect({ ...effect, effectType: normalizedType }, sourceMove);
      case "terrain":
        return this._applyTerrainEffect({ ...effect, effectType: normalizedType }, sourceMove);
      case "damage": {
        const damageValue = this._resolveEffectAmountValue(
          toNumber(targetActor.system?.resources?.hp?.max, 1),
          effect.amount
        );
        if (damageValue <= 0) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
        }
        const hpChange = await this._safeApplyDamage(targetActor, damageValue);
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        return {
          applied: true,
          detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
            before: hpChange.hpBefore,
            after: hpChange.hpAfter
          })
        };
      }
      case "heal": {
        const resolvedHeal = this._resolveSecondaryHealConfiguration(effect, sourceMove);
        const healValue = this._resolveHealEffectAmountValue(resolvedHeal, targetActor, context);
        if (healValue <= 0) {
          return {
            applied: false,
            detail: resolvedHeal.adjustmentDetail || game.i18n.localize("POKROLE.Common.None")
          };
        }
        const hpChange = await this._safeApplyHeal(targetActor, healValue, {
          healingCategory: resolvedHeal.healingCategory
        });
        if (!hpChange) {
          return { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
        }
        if (toNumber(hpChange?.hpAfter, 0) === toNumber(hpChange?.hpBefore, 0)) {
          return {
            applied: false,
            detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
          };
        }
        return {
          applied: true,
          detail: [
            game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
              before: hpChange.hpBefore,
              after: hpChange.hpAfter
            }),
            `${resolvedHeal.adjustmentDetail ?? ""}`.trim()
          ].filter(Boolean).join(" | ")
        };
      }
      case "will":
        return this._applyWillEffectToActor(effect, targetActor);
      case "custom":
      default:
        return {
          applied: true,
          detail: effect.notes || game.i18n.localize("POKROLE.Chat.SecondaryEffectApplied")
        };
    }
  }

  _resolveEffectAmountValue(maxValue, amount) {
    const numericAmount = toNumber(amount, 0);
    if (numericAmount === 0) return 0;
    if (numericAmount > 0) return Math.floor(numericAmount);
    return Math.max(Math.floor((Math.max(maxValue, 1) * Math.abs(numericAmount)) / 100), 1);
  }

  _resolveHealEffectAmountValue(effect, targetActor, context = {}) {
    const healMode = this._normalizeSecondaryHealMode(
      effect?.healMode,
      effect?.effectType,
      effect?.amount
    );
    const numericAmount = Math.abs(Math.floor(toNumber(effect?.amount, 0)));
    if (numericAmount <= 0) return 0;

    if (healMode === "damage-percent") {
      const totalDamageDealt = Math.max(Math.floor(toNumber(context?.totalDamageDealt, 0)), 0);
      if (totalDamageDealt <= 0) return 0;
      return Math.max(Math.floor((totalDamageDealt * numericAmount) / 100), 1);
    }

    if (healMode === "max-hp-percent") {
      const maxHp = Math.max(toNumber(targetActor?.system?.resources?.hp?.max, 1), 1);
      return Math.max(Math.floor((maxHp * numericAmount) / 100), 1);
    }

    return Math.max(numericAmount, 0);
  }

  _getCleanseConditionKeys(effect = {}) {
    const rawNotes = `${effect?.notes ?? ""}`.trim().toLowerCase();
    if (!rawNotes || rawNotes === "all") {
      return [...DEFAULT_CLEANSE_CONDITION_KEYS];
    }

    const rawTokens = rawNotes
      .split(/[|,]/)
      .map((token) => `${token ?? ""}`.trim())
      .filter(Boolean);
    const normalizedKeys = [];
    for (const token of rawTokens) {
      const normalizedCondition = this._normalizeConditionKey(token);
      if (normalizedCondition === "none") continue;
      if (!normalizedKeys.includes(normalizedCondition)) normalizedKeys.push(normalizedCondition);
    }
    return normalizedKeys;
  }

  async _applyCleanseEffectToActor(effect, targetActor) {
    const cleanseConditionKeys = this._getCleanseConditionKeys(effect);
    if (cleanseConditionKeys.length <= 0) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoCleanseConfigured")
      };
    }

    const clearedConditionLabels = [];
    for (const conditionKey of cleanseConditionKeys) {
      if (!targetActor?._isConditionActive?.(conditionKey)) continue;
      const clearResult = await targetActor.toggleQuickCondition(conditionKey, { active: false });
      if (!clearResult?.applied) continue;
      clearedConditionLabels.push(this._localizeConditionName(conditionKey));
    }

    if (clearedConditionLabels.length <= 0) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoRemovableCondition")
      };
    }

    return {
      applied: true,
      detail: clearedConditionLabels.join(", ")
    };
  }

  async _resolveFrozenBreakoutMove(move, options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const normalizedAction = clamp(toNumber(options.actionNumber, 1), 1, 5);
    const runtimeOverride = options.runtimeOverride ?? null;
    const frozenShellBefore = await this._initializeFrozenShell();
    const shellDefense =
      move.system.category === "special"
        ? frozenShellBefore.specialDefense
        : frozenShellBefore.defense;
    const effectiveMoveType = this._resolveEffectiveMoveType(move, this, {
      targetActor: this,
      activeWeather: this.getActiveWeatherKey(),
      runtimeOverride
    });
    const typeInteraction = this._evaluateTypeInteractionAgainstTypes(effectiveMoveType || "normal", [
      "ice"
    ]);
    const superEffective = !typeInteraction.immune && typeInteraction.weaknessBonus > 0;
    const isDamagingMove = this._moveUsesPrimaryDamage(move);
    const damageBaseSetup = this._resolveMoveDamageBase(move, this, normalizedAction);
    const damageAttributeValue = damageBaseSetup.value;
    const terrainPowerOverride = this._getTerrainPowerOverride(move, this);
    const movePower =
      terrainPowerOverride === null
        ? this._resolveMovePower(move, this, normalizedAction, {
            runtimeOverride
          })
        : terrainPowerOverride;
    const stabDice = this.hasType(effectiveMoveType) ? 1 : 0;
    const terrainBonusDice = this._getTerrainDamageBonusDice(move, this);
    const poolBeforeDefense = Math.max(movePower + damageAttributeValue + stabDice + terrainBonusDice, 0);
    const damagePool = Math.max(poolBeforeDefense - shellDefense, 0);

    let damageSuccesses = 0;
    let shellDamage = 0;
    let shellDestroyed = superEffective;

    if (!shellDestroyed && isDamagingMove && !typeInteraction.immune) {
      if (damagePool > 0) {
        const damageRoll = await new Roll(successPoolFormula(damagePool)).evaluate();
        damageSuccesses = Math.max(Math.floor(toNumber(damageRoll.total, 0)), 0);
        await damageRoll.toMessage({
          speaker: ChatMessage.getSpeaker({ actor: this }),
          flavor: game.i18n.format("POKROLE.Chat.FrozenShellDamageRoll", {
            actor: this.name,
            move: move.name
          })
        });
      }
      shellDamage = Math.max(damageSuccesses, 1);
      shellDestroyed = shellDamage >= frozenShellBefore.hp;
    }

    const shellHpAfter = shellDestroyed
      ? 0
      : Math.max(frozenShellBefore.hp - Math.max(shellDamage, 0), 0);

    if (shellDestroyed) {
      await this.toggleQuickCondition("frozen", { active: false });
    } else {
      await this._setFrozenShellState({
        ...frozenShellBefore,
        hp: shellHpAfter
      });
    }

    const resultLabel = shellDestroyed
      ? game.i18n.format("POKROLE.Chat.FrozenShellBroken", {
          actor: this.name,
          move: move.name
        })
      : shellDamage > 0
        ? game.i18n.format("POKROLE.Chat.FrozenShellDamaged", {
            actor: this.name,
            move: move.name,
            damage: shellDamage,
            hp: shellHpAfter
          })
        : game.i18n.format("POKROLE.Chat.FrozenShellHeld", {
            actor: this.name,
            move: move.name,
            hp: shellHpAfter
          });

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card arcade-red">
          <header class="chat-card-header">
            <h3>${game.i18n.localize("POKROLE.Conditions.Frozen")}</h3>
          </header>
          <section class="chat-card-section">
            <p><strong>${this.name}</strong></p>
            <p>${resultLabel}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.TypeEffect.Label")}:</strong> ${game.i18n.localize(typeInteraction.label)}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.PoolBeforeDefense")}:</strong> ${poolBeforeDefense}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.TargetDefense")}:</strong> ${shellDefense}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.FinalPool")}:</strong> ${damagePool}</p>
            <p><strong>${game.i18n.localize("POKROLE.Chat.FinalDamage")}:</strong> ${shellDamage}</p>
          </section>
        </div>
      `
    });

    if (options.advanceAction !== false) {
      await this._advanceActionCounter(normalizedAction, roundKey);
    }
    await this._recordLastUsedMove(move);

    return {
      frozenBreakout: true,
      shellDestroyed,
      shellDamage,
      shellHpBefore: frozenShellBefore.hp,
      shellHpAfter,
      move
    };
  }

  async _applyDisabledMoveEffectToActor(targetActor, sourceMove = null) {
    const lastUsedMove = targetActor?._getLastUsedMoveRecord?.() ?? {};
    const disabledMoveId = `${lastUsedMove?.moveId ?? ""}`.trim();
    const moveDocument =
      disabledMoveId && targetActor?.items ? targetActor.items.get(disabledMoveId) ?? null : null;
    if (!targetActor || !moveDocument || moveDocument.type !== "move") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.DisabledMoveNoLastMove")
      };
    }

    const existingRestriction = this._getDisabledMoveRestriction(targetActor);
    if (existingRestriction?.moveId && existingRestriction.moveId === moveDocument.id) {
      await this._setConditionFlagState(targetActor, "disabled", true);
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    await this._removeTrackedConditionEffects(targetActor, "disabled", { revert: false });

    const inCombat = Boolean(game.combat);
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "move-disabled",
      conditionKey: "disabled",
      durationMode: inCombat ? "rounds" : "manual",
      durationRounds: 5,
      specialDuration: [],
      sourceMove
    });
    automationFlags.disabledMoveId = moveDocument.id;
    automationFlags.disabledMoveName = moveDocument.name ?? "";
    automationFlags.sceneScoped = !inCombat;
    automationFlags.sceneId = !inCombat ? canvas?.scene?.id ?? null : null;

    const durationData = this._buildManagedEffectDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds
    );
    const durationLabel = inCombat
      ? this._localizeTemporaryDuration("rounds", 5, [])
      : game.i18n.localize("POKROLE.Chat.DisabledMoveSceneDuration");

    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: game.i18n.format("POKROLE.Chat.DisabledMoveLabel", {
          move: moveDocument.name
        }),
        img: this._getConditionIconPath("disabled") || sourceMove?.img || "icons/svg/cancel.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: ["pokrole-condition-disabled"],
        changes: [],
        duration: durationData,
        flags: {
          [POKROLE.ID]: {
            automation: automationFlags
          }
        }
      }
    ]);

    await this._setConditionFlagState(targetActor, "disabled", true);
    return {
      applied: true,
      detail: `${moveDocument.name} (${durationLabel})`
    };
  }

  async _applyConditionEffectToActor(effect, targetActor, sourceMove = null, options = {}) {
    const conditionVariant = this._normalizeConditionVariantKey(effect.condition);
    const conditionKey = this._normalizeConditionKey(conditionVariant);
    const burnStage =
      conditionKey === "burn" ? this._resolveBurnStageFromCondition(conditionVariant) : 1;
    if (conditionKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }
    if (conditionKey === "infatuated") {
      const genderRule = this._validateInfatuationGenderRule(
        options?.sourceActor ?? this,
        targetActor,
        { allowManualOverride: options?.allowManualOverride === true }
      );
      if (!genderRule.valid) {
        return {
          applied: false,
          detail: genderRule.detail || game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
        };
      }
    }
    if (this._isConditionImmune(targetActor, conditionKey)) {
      // Also remove the condition if it already exists (e.g. Insomnia removes existing sleep)
      await this._removeConditionByAbilityImmunity(targetActor, conditionKey);
      return {
        applied: false,
        detail: this._getConditionBlockedDetail(targetActor, conditionKey)
      };
    }
    if (conditionKey === "disabled") {
      return this._applyDisabledMoveEffectToActor(targetActor, sourceMove);
    }

    const statusId = `pokrole-condition-${conditionKey}`;
    const existingConditionEffect = (targetActor?.effects?.contents ?? []).find((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
        `${entry ?? ""}`.trim().toLowerCase()
      );
      if (statusEntries.includes(statusId)) return true;
      return this._extractConditionKeyFromEffect(effectDocument) === conditionKey;
    });
    if (existingConditionEffect) {
      await this._setConditionFlagState(targetActor, conditionKey, true);
      if (conditionKey === "burn") {
        if (typeof targetActor._applyBurnStage === "function") {
          const resolvedStage = await targetActor._applyBurnStage(burnStage);
          await this._synchronizeManagedBurnConditionEffect(targetActor, resolvedStage);
          return {
            applied: true,
            detail: this._localizeBurnStageName(resolvedStage)
          };
        }
        return {
          applied: false,
          detail: this._localizeBurnStageName(burnStage)
        };
      }
      if (conditionKey === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
        await targetActor._initializeFrozenShell();
      }
      if (conditionKey === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
        await targetActor._clearConfusionSuppression();
      }
      if (conditionKey === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
        await targetActor._clearInfatuationSuppression();
      }
      if (conditionKey === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
        await targetActor._clearParalysisTurnCheck();
      }
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    let normalizedDurationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "condition");
    let normalizedDurationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    let normalizedSpecialDuration = this._normalizeSpecialDurationList(effect.specialDuration);
    if (["confused", "infatuated"].includes(conditionKey)) {
      normalizedDurationMode = "rounds";
      normalizedDurationRounds = 5;
      normalizedSpecialDuration = [];
    }
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "condition",
      conditionKey,
      durationMode: normalizedDurationMode,
      durationRounds: normalizedDurationRounds,
      specialDuration: normalizedSpecialDuration,
      sourceMove
    });
    if (conditionKey === "burn") {
      automationFlags.burnStage = burnStage;
    }
    const effectLabel =
      conditionKey === "burn"
        ? this._localizeBurnStageName(burnStage)
        : this._formatSecondaryEffectLabel(effect) || this._localizeConditionName(conditionKey);
    const conditionPath = CONDITION_FIELD_BY_KEY[conditionKey]
      ? `system.conditions.${CONDITION_FIELD_BY_KEY[conditionKey]}`
      : null;
    const effectChanges = [];
    if (conditionPath) {
      effectChanges.push({
        key: conditionPath,
        mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
        value: "true",
        priority: 50
      });
    }
    if (conditionKey === "paralyzed") {
      effectChanges.push({
        key: "system.attributes.dexterity",
        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        value: "-2",
        priority: 60
      });
    }

    const durationData = this._buildManagedEffectDuration(
      automationFlags.durationMode,
      automationFlags.durationRounds
    );
    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: effectLabel,
        img: this._getConditionIconPath(conditionKey) || sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: [statusId],
        changes: effectChanges,
        duration: durationData,
        flags: {
          [POKROLE.ID]: {
            automation: automationFlags
          }
        }
      }
    ]);

    await this._setConditionFlagState(targetActor, conditionKey, true);
    if (conditionKey === "burn" && typeof targetActor._applyBurnStage === "function") {
      await targetActor._applyBurnStage(burnStage);
    }
    if (conditionKey === "sleep" && typeof targetActor._initializeSleepResistanceTrack === "function") {
      await targetActor._initializeSleepResistanceTrack();
    }
    if (conditionKey === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
      await targetActor._initializeFrozenShell(true);
    }
    if (conditionKey === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
      await targetActor._clearConfusionSuppression();
    }
    if (conditionKey === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
      await targetActor._clearInfatuationSuppression();
    }
    if (conditionKey === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
      await targetActor._clearParalysisTurnCheck();
    }
    // Destiny Knot: if infatuation was applied and target has Destiny Knot, mirror infatuation back to attacker
    if (conditionKey === "infatuated" && targetActor?._getHeldItemData?.()?.destinyKnot) {
      const sourceActor = options?.sourceActor ?? this;
      if (sourceActor && sourceActor !== targetActor && !sourceActor._isConditionActive?.("infatuated")) {
        await sourceActor.toggleQuickCondition("infatuated", { active: true });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> Destiny Knot infatuated <strong>${sourceActor.name}</strong> in return!`
        });
      }
    }
    const conditionLabel =
      conditionKey === "burn"
        ? this._localizeBurnStageName(burnStage)
        : this._localizeConditionName(conditionKey);
    return {
      applied: true,
      detail: `${conditionLabel} (${this._localizeTemporaryDuration(
        automationFlags.durationMode,
        automationFlags.durationRounds,
        automationFlags.specialDuration
      )})`
    };
  }

  _getConditionIconPath(conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    return CONDITION_ICON_BY_KEY[normalizedCondition] ?? null;
  }

  _normalizeActiveEffectStackMode(value) {
    const normalized = `${value ?? "name-origin"}`.trim().toLowerCase();
    return ACTIVE_EFFECT_STACK_MODE_KEYS.includes(normalized) ? normalized : "name-origin";
  }

  _findStackConflictActiveEffect(targetActor, effectData) {
    if (!targetActor || !effectData) return null;
    const effectName = `${effectData.name ?? ""}`.trim().toLowerCase();
    const effectOrigin = `${effectData.origin ?? ""}`.trim().toLowerCase();
    const automationFlags = effectData.flags?.[POKROLE.ID]?.automation ?? {};
    const stackMode = this._normalizeActiveEffectStackMode(automationFlags?.stackMode);
    if (stackMode === "multiple") return null;

    return (targetActor.effects?.contents ?? []).find((existingEffect) => {
      const existingName = `${existingEffect?.name ?? ""}`.trim().toLowerCase();
      const existingOrigin = `${existingEffect?.origin ?? ""}`.trim().toLowerCase();
      if (stackMode === "name") {
        return Boolean(effectName) && existingName === effectName;
      }
      if (stackMode === "origin") {
        return Boolean(effectOrigin) && existingOrigin === effectOrigin;
      }
      return Boolean(effectName) && existingName === effectName && effectOrigin === existingOrigin;
    }) ?? null;
  }

  async _applySecondaryActiveEffectToActor(effect, targetActor, sourceMove = null) {
    const linkedEffectId = `${effect?.linkedEffectId ?? ""}`.trim();
    if (!linkedEffectId || sourceMove?.type !== "move") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }

    const templateEffect = sourceMove.effects?.get(linkedEffectId) ?? null;
    if (!templateEffect) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }

    const templateData = templateEffect.toObject();
    const conflictEffect = this._findStackConflictActiveEffect(targetActor, templateData);
    if (conflictEffect) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectAlreadyActive")
      };
    }

    const [createdEffect] = await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `${templateData?.name ?? ""}`.trim() || this._formatSecondaryEffectLabel(effect),
        img: templateData?.img || sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? templateData?.origin ?? null,
        transfer: false,
        disabled: false,
        statuses: Array.isArray(templateData?.statuses) ? templateData.statuses : [],
        tint: templateData?.tint ?? null,
        description: templateData?.description ?? "",
        duration: templateData?.duration ?? {},
        changes: Array.isArray(templateData?.changes) ? templateData.changes : [],
        flags: templateData?.flags ?? {}
      }
    ]);

    if (createdEffect && typeof targetActor.synchronizeConditionFlags === "function") {
      await targetActor.synchronizeConditionFlags();
    }

    return {
      applied: true,
      detail: `${createdEffect?.name ?? this._formatSecondaryEffectLabel(effect)}`
    };
  }

  async _applyStatEffectToActor(effect, targetActor, sourceMove = null) {
    let amount = Math.floor(toNumber(effect.amount, 0));
    // Rank-based scaling: double the amount for Expert rank and above
    const effectNotes = `${effect.notes ?? ""}`.trim().toLowerCase();
    if (effectNotes.includes("rank-expert-double") && targetActor) {
      const EXPERT_RANKS = new Set(["expert", "ace", "master", "champion"]);
      const rank = `${targetActor.system?.tier ?? ""}`.trim().toLowerCase();
      if (EXPERT_RANKS.has(rank)) {
        amount = amount * 2;
      }
    }
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    if (targetActor === this && amount > 0) {
      const batonPassLock = await this._clearExpiredBatonPassLock(this);
      if (batonPassLock?.recipientActorId) {
        return {
          applied: false,
          detail: `${this.name} cannot increase its own Attributes again until the Baton Pass target faints or the scene ends.`
        };
      }
    }

    // Clear Amulet: immune to stat reduction from enemies
    if (amount < 0 && targetActor !== this && targetActor?._getHeldItemData?.()?.immuneToStatReduction) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: targetActor }),
        content: `<strong>${targetActor.name}'s</strong> Clear Amulet prevented a stat reduction!`
      });
      return { applied: false, detail: `${targetActor.name}'s Clear Amulet blocked the stat reduction.` };
    }

    let statKey = this._normalizeSecondaryStatKey(effect.stat);
    // Random stat selection for abilities like Moody
    if (statKey === "none" && targetActor) {
      const coreStats = ["strength", "dexterity", "vitality", "special", "insight"];
      const availableStats = coreStats.filter((s) =>
        Object.prototype.hasOwnProperty.call(targetActor.system.attributes ?? {}, s)
      );
      if (availableStats.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableStats.length);
        statKey = availableStats[randomIndex];
      }
    }
    if (statKey === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    if (["accuracy", "damage", "evasion", "clash"].includes(statKey)) {
      return this._applyCombatStatEffectToActor(
        { ...effect, effectType: "stat", stat: statKey, amount },
        targetActor,
        sourceMove
      );
    }

    let resolvedKey = statKey;
    if (statKey === "defense") resolvedKey = "vitality";
    if (statKey === "specialDefense") resolvedKey = "insight";

    let statResult = null;
    if (Object.prototype.hasOwnProperty.call(targetActor.system.attributes ?? {}, resolvedKey)) {
      const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
        resolvedKey
      );
      const configuredMax = this._resolveAttributeMaximum(targetActor, resolvedKey);
      const baseMaxValue = isCoreAttribute ? Math.min(configuredMax, 10) : configuredMax;
      const minValue = isCoreAttribute ? 1 : 0;
      // Ability buffs with maxStacks can temporarily exceed the attribute cap
      const abilityMaxStacks = effect.maxStacks ?? 0;
      const maxValue = abilityMaxStacks > 0 ? baseMaxValue + abilityMaxStacks : baseMaxValue;
      statResult = await this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.attributes.${resolvedKey}`,
        amount,
        min: minValue,
        max: maxValue,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds,
        specialDuration: effect.specialDuration,
        maxStacks: abilityMaxStacks
      });
    } else if (Object.prototype.hasOwnProperty.call(targetActor.system.skills ?? {}, resolvedKey)) {
      statResult = await this._applyTemporaryTrackedModifier({
        targetActor,
        path: `system.skills.${resolvedKey}`,
        amount,
        min: 0,
        max: 5,
        label: this._formatSecondaryEffectLabel(effect),
        sourceMove,
        detailLabel: this.localizeTrait(resolvedKey),
        durationMode: effect.durationMode,
        durationRounds: effect.durationRounds,
        specialDuration: effect.specialDuration,
        maxStacks: effect.maxStacks ?? 0
      });
    }

    // White Herb: restore all negative stat modifiers after a stat reduction is applied
    if (statResult?.applied && amount < 0 && targetActor?._getHeldItemData?.()?.whiteHerb) {
      const negativeEffects = this._getManagedModifierEffectsForPath(targetActor, `system.attributes.${resolvedKey}`)
        .concat(this._getManagedModifierEffectsForPath(targetActor, `system.skills.${resolvedKey}`))
        .filter((effectDocument) => {
          const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
          return Math.floor(toNumber(flags?.amountApplied, 0)) < 0;
        });
      if (negativeEffects.length > 0) {
        const effectIds = negativeEffects.map((e) => e.id).filter(Boolean);
        if (effectIds.length > 0) {
          await targetActor.deleteEmbeddedDocuments("ActiveEffect", effectIds);
        }
        await targetActor.update({ "system.battleItem": "" });
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor: targetActor }),
          content: `<strong>${targetActor.name}'s</strong> White Herb restored its lowered stats!`
        });
      }
      return statResult;
    }

    if (statResult) return statResult;

    return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
  }

  _resolveAttributeMaximum(targetActor, attributeKey) {
    const isCoreAttribute = ["strength", "dexterity", "vitality", "special", "insight"].includes(
      attributeKey
    );
    if (targetActor.type === "pokemon" && isCoreAttribute) {
      return clamp(
        toNumber(targetActor.system.sheetSettings?.trackMax?.attributes?.[attributeKey], 12),
        1,
        12
      );
    }
    return 5;
  }

  getConditionFlags() {
    return this._getConditionFlagEntries(this);
  }

  getTemporaryEffects() {
    return this._getTemporaryEffectEntries(this);
  }

  getConfiguredEffects() {
    return this._getConfiguredEffectEntries(this);
  }

  async synchronizeConditionFlags() {
    await this._synchronizeConditionFlagsFromTemporaryEffects(this);
  }

  async synchronizeFaintedFromHp() {
    if (this.type !== "pokemon") return false;
    if (this.__pokrolePendingDeadSync) return false;
    const hpValue = Math.max(toNumber(this.system.resources?.hp?.value, 0), 0);
    const shouldBeFainted = hpValue <= 0 && !this._isConditionActive("dead");
    const isFainted = this._isConditionActive("fainted");
    if (shouldBeFainted === isFainted) return false;
    await this.toggleQuickCondition("fainted", { active: shouldBeFainted });
    return true;
  }

  async clearSceneScopedMoveDisableEffects(currentSceneId = null) {
    const normalizedSceneId = `${currentSceneId ?? canvas?.scene?.id ?? ""}`.trim();
    if (!normalizedSceneId) return 0;
    const effectIds = (this.effects?.contents ?? [])
      .filter((effectDocument) => {
        const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
        if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "move-disabled") return false;
        if (!automationFlags?.sceneScoped) return false;
        const effectSceneId = `${automationFlags?.sceneId ?? ""}`.trim();
        return Boolean(effectSceneId) && effectSceneId !== normalizedSceneId;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (effectIds.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", effectIds);
    }
    return effectIds.length;
  }

  async _clearConditionAuxiliaryState(targetActor, conditionKey) {
    const actor = targetActor ?? this;
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!actor || normalizedCondition === "none") return;

    if (normalizedCondition === "sleep") {
      await actor.unsetFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY);
    }
    if (normalizedCondition === "burn" && typeof actor._clearBurnTrack === "function") {
      await actor._clearBurnTrack();
    }
    if (normalizedCondition === "frozen" && typeof actor._clearFrozenShellState === "function") {
      await actor._clearFrozenShellState();
    }
    if (normalizedCondition === "paralyzed" && typeof actor._clearParalysisTurnCheck === "function") {
      await actor._clearParalysisTurnCheck();
    }
    if (normalizedCondition === "confused" && typeof actor._clearConfusionSuppression === "function") {
      await actor._clearConfusionSuppression();
    }
    if (normalizedCondition === "infatuated" && typeof actor._clearInfatuationSuppression === "function") {
      await actor._clearInfatuationSuppression();
    }
  }

  _hasConditionAuxiliaryState(targetActor, conditionKey) {
    const actor = targetActor ?? this;
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!actor || normalizedCondition === "none") return false;

    if (normalizedCondition === "sleep") {
      return Boolean(actor.getFlag(POKROLE.ID, SLEEP_RESIST_TRACK_FLAG_KEY));
    }
    if (normalizedCondition === "burn") {
      return Boolean(actor.getFlag(POKROLE.ID, BURN_TRACK_FLAG_KEY));
    }
    if (normalizedCondition === "frozen") {
      return Boolean(actor.getFlag(POKROLE.ID, FROZEN_SHELL_FLAG_KEY));
    }
    if (normalizedCondition === "paralyzed") {
      return Boolean(actor.getFlag(POKROLE.ID, PARALYSIS_TURN_CHECK_FLAG_KEY));
    }
    if (normalizedCondition === "confused") {
      return Boolean(actor.getFlag(POKROLE.ID, CONFUSION_BYPASS_FLAG_KEY));
    }
    if (normalizedCondition === "infatuated") {
      return Boolean(actor.getFlag(POKROLE.ID, INFATUATION_BYPASS_FLAG_KEY));
    }
    return false;
  }

  _isConditionalAutomationEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    const hasPassiveToggle = automationFlags?.passive === true;
    const passiveTriggerKey = `${automationFlags?.passiveTrigger ?? ""}`.trim().toLowerCase();
    return hasPassiveToggle || passiveTriggerKey.length > 0;
  }

  _isConditionalAutomationEffectActive(effectDocument, targetActor = this) {
    if (!this._isConditionalAutomationEffect(effectDocument)) return true;
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation") ?? {};
    const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${automationFlags?.passiveTrigger ?? ""}`)
      ? `${automationFlags.passiveTrigger}`
      : "always";
    const passiveCondition = this._normalizeConditionKey(automationFlags?.passiveCondition);
    const passiveThreshold = clamp(Math.floor(toNumber(automationFlags?.passiveThreshold, 50)), 1, 99);
    return this._checkPassiveTrigger(
      {
        passive: true,
        passiveTrigger,
        passiveCondition,
        passiveThreshold
      },
      targetActor ?? this
    );
  }

  async synchronizeConditionalActiveEffects(options = {}) {
    const targetActor = options.targetActor ?? this;
    const updates = [];

    for (const effectDocument of this.effects?.contents ?? []) {
      if (!this._isConditionalAutomationEffect(effectDocument)) continue;

      const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const autoDisabledByCondition = Boolean(automationFlags?.autoDisabledByCondition);
      const shouldBeActive = this._isConditionalAutomationEffectActive(effectDocument, targetActor);

      if (!shouldBeActive && !effectDocument.disabled) {
        const updatePayload = { _id: effectDocument.id, disabled: true };
        updatePayload[`flags.${POKROLE.ID}.automation.autoDisabledByCondition`] = true;
        updates.push(updatePayload);
        continue;
      }

      if (shouldBeActive && effectDocument.disabled && autoDisabledByCondition) {
        const updatePayload = { _id: effectDocument.id, disabled: false };
        updatePayload[`flags.${POKROLE.ID}.automation.autoDisabledByCondition`] = false;
        updates.push(updatePayload);
      }
    }

    if (updates.length > 0) {
      await this.updateEmbeddedDocuments("ActiveEffect", updates);
    }
    return updates.length;
  }

  async setConfiguredEffects(effects = []) {
    await this._setConfiguredEffectEntries(this, effects);
    return this.getConfiguredEffects();
  }

  async addConfiguredEffect(initialEffect = {}) {
    const currentEffects = this.getConfiguredEffects();
    currentEffects.push(this._normalizeConfiguredEffect(initialEffect));
    await this._setConfiguredEffectEntries(this, currentEffects);
    return currentEffects[currentEffects.length - 1] ?? null;
  }

  async updateConfiguredEffect(effectId, updates = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return null;

    const currentEffects = this.getConfiguredEffects();
    const effectIndex = currentEffects.findIndex((entry) => entry.id === normalizedEffectId);
    if (effectIndex < 0) return null;

    const nextEffect = this._normalizeConfiguredEffect({
      ...currentEffects[effectIndex],
      ...updates,
      id: normalizedEffectId
    });
    currentEffects.splice(effectIndex, 1, nextEffect);
    await this._setConfiguredEffectEntries(this, currentEffects);
    return nextEffect;
  }

  async deleteConfiguredEffect(effectId) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return false;

    const currentEffects = this.getConfiguredEffects();
    const nextEffects = currentEffects.filter((entry) => entry.id !== normalizedEffectId);
    if (nextEffects.length === currentEffects.length) return false;
    await this._setConfiguredEffectEntries(this, nextEffects);
    return true;
  }

  async applyConfiguredEffect(effectId, options = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const configuredEffect = this.getConfiguredEffects().find(
      (entry) => entry.id === normalizedEffectId
    );
    if (!configuredEffect) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    return this._applyConfiguredEffectData(configuredEffect, options);
  }

  async toggleQuickCondition(conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const currentFlags = this._getConditionFlagEntries(this);
    const currentState = Boolean(currentFlags[normalizedCondition]);
    const nextState = options.active === undefined ? !currentState : Boolean(options.active);

    if (nextState) {
      if (normalizedCondition === "fainted" && this._isConditionActive("dead")) {
        return {
          applied: false,
          detail: this._localizeConditionName("dead")
        };
      }
      if (normalizedCondition === "dead" && this._isConditionActive("fainted")) {
        await this.toggleQuickCondition("fainted", { active: false });
      }
      if (normalizedCondition === "disabled") {
        return this._applyDisabledMoveEffectToActor(this, null);
      }
      let burnStage = 1;
      if (normalizedCondition === "burn") {
        const hasExplicitBurnStage = Object.prototype.hasOwnProperty.call(options, "burnStage");
        if (hasExplicitBurnStage) {
          burnStage = this._normalizeBurnStage(options.burnStage, 1);
        } else {
          const selectedStage = await this._promptBurnStageSelection();
          if (!selectedStage) {
            return { applied: false, detail: game.i18n.localize("POKROLE.Common.Cancel") };
          }
          burnStage = this._normalizeBurnStage(selectedStage, 1);
        }
      }
      if (this._isConditionImmune(this, normalizedCondition)) {
        await this._purgeImmuneConditionState(this, normalizedCondition);
        return {
          applied: false,
          detail: this._getConditionBlockedDetail(this, normalizedCondition)
        };
      }
      await this._setConditionFlagState(this, normalizedCondition, true);
      if (normalizedCondition === "sleep") {
        await this._initializeSleepResistanceTrack();
      }
      const condResult = await this._ensureConditionEffectFromFlag(this, normalizedCondition, { burnStage });
      // Trigger condition-based abilities (Guts, Quick Feet, etc.)
      console.log(`PokRole | [condition-applied] Condition "${normalizedCondition}" applied on ${this.name}. game.combat=${!!game.combat}, hasMethod=${typeof this.processAbilityTriggerEffects === "function"}`);
      if (typeof this.processAbilityTriggerEffects === "function") {
        try {
          const condTriggerResults = await this.processAbilityTriggerEffects("condition-applied", { combat: game.combat ?? null });
          console.log(`PokRole | [condition-applied] Results for ${this.name}:`, condTriggerResults);
        } catch (_e) {
          console.warn(`PokRole | [condition-applied] Failed for ${this.name}:`, _e);
        }
      }
      return condResult;
    }

    await this._setConditionFlagState(this, normalizedCondition, false);
    await this._clearConditionAuxiliaryState(this, normalizedCondition);
    await this._removeTrackedConditionEffects(this, normalizedCondition, { revert: false });

    // Remove ability effects that were triggered by condition-based abilities (Guts, Quick Feet, etc.)
    // If this actor's ability has trigger "self-has-condition" and the condition is no longer active,
    // clean up the stat modifiers that were applied by that ability.
    await this._cleanupConditionTriggeredAbilityEffects();

    return {
      applied: true,
      detail: game.i18n.format("POKROLE.Chat.ConditionCleared", {
        condition: this._localizeConditionName(normalizedCondition)
      })
    };
  }

  async _cleanupConditionTriggeredAbilityEffects() {
    // Find the active ability and check if it's condition-triggered
    const abilityItems = await this._getActiveAbilityItems();
    if (!abilityItems.length) return;

    for (const abilityItem of abilityItems) {
      const abilityTrigger = `${abilityItem.system?.abilityTrigger ?? ""}`.trim().toLowerCase();
      if (abilityTrigger !== "self-has-condition") continue;

      // Check if any of the ability's trigger conditions are still active
      const condKeys = `${abilityItem.system?.triggerConditionType ?? ""}`.trim().toLowerCase()
        .split(",").map((k) => k.trim()).filter(Boolean);
      const anyConditionStillActive = condKeys.some((k) => this._isConditionActive(k));

      if (!anyConditionStillActive) {
        // Remove all managed modifier effects from this ability
        const abilityName = `${abilityItem.name ?? ""}`.trim();
        const effectIdsToRemove = (this.effects?.contents ?? [])
          .filter((e) => {
            const flags = e.getFlag?.(POKROLE.ID, "automation") ?? {};
            return flags?.managed &&
              `${flags?.sourceItemName ?? ""}`.trim() === abilityName &&
              `${flags?.sourceItemType ?? ""}`.trim().toLowerCase() === "ability";
          })
          .map((e) => e.id)
          .filter(Boolean);

        if (effectIdsToRemove.length > 0) {
          console.log(`PokRole | Removing ${effectIdsToRemove.length} ability effects from "${abilityName}" (condition no longer active)`);
          await this.deleteEmbeddedDocuments("ActiveEffect", effectIdsToRemove);
        }
      }
    }
  }

  async removeTemporaryEffect(effectId, options = {}) {
    const normalizedEffectId = `${effectId ?? ""}`.trim();
    if (!normalizedEffectId) return false;

    const embeddedEffect = this.effects?.get(normalizedEffectId);
    if (embeddedEffect && this._isManagedAutomationEffect(embeddedEffect)) {
      await embeddedEffect.delete();
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      return true;
    }

    const shouldRevert = options.revert !== false;
    const currentEntries = this._getTemporaryEffectEntries(this);
    const effectIndex = currentEntries.findIndex(
      (entry) => `${entry?.id ?? ""}`.trim() === normalizedEffectId
    );
    if (effectIndex < 0) return false;

    const [entryToRemove] = currentEntries.splice(effectIndex, 1);
    if (shouldRevert) {
      await this._revertTemporaryEffectEntry(entryToRemove);
    }
    await this._setTemporaryEffectEntries(this, currentEntries);
    await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    return true;
  }

  _getConditionFlagEntries(targetActor) {
    const rawFlags = targetActor?.getFlag(POKROLE.ID, CONDITION_FLAGS_FLAG);
    const normalizedFlags = {};

    for (const conditionKey of CONDITION_KEYS) {
      let isActive = false;

      if (rawFlags && typeof rawFlags === "object" && Object.prototype.hasOwnProperty.call(rawFlags, conditionKey)) {
        isActive = Boolean(rawFlags[conditionKey]);
      } else {
        const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
        if (systemField) {
          isActive = Boolean(targetActor?.system?.conditions?.[systemField]);
        } else {
          isActive = Boolean(targetActor?.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`));
        }
      }

      normalizedFlags[conditionKey] = isActive;
    }

    return normalizedFlags;
  }

  async _setConditionFlagState(targetActor, conditionKey, isActive) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return;

    const nextFlags = this._getConditionFlagEntries(targetActor);
    nextFlags[normalizedCondition] = Boolean(isActive);
    await targetActor.setFlag(POKROLE.ID, CONDITION_FLAGS_FLAG, nextFlags);

    const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
    if (systemField) {
      await targetActor.update({ [`system.conditions.${systemField}`]: Boolean(isActive) });
    } else {
      await targetActor.setFlag(
        POKROLE.ID,
        `automation.conditions.${normalizedCondition}`,
        Boolean(isActive)
      );
    }
  }

  async _disableConditionEffectForImmunity(targetActor, effectDocument, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || !effectDocument || normalizedCondition === "none") return false;

    const statusId = `pokrole-condition-${normalizedCondition}`;
    const currentStatuses = [...(effectDocument.statuses ?? [])]
      .map((entry) => `${entry ?? ""}`.trim())
      .filter(Boolean);
    const nextStatuses = currentStatuses.filter(
      (entry) => entry.toLowerCase() !== statusId
    );
    const updateData = {};
    if (!effectDocument.disabled) updateData.disabled = true;
    if (nextStatuses.length !== currentStatuses.length) {
      updateData.statuses = nextStatuses;
    }
    if (Object.keys(updateData).length === 0) return false;
    await effectDocument.update(updateData);
    return true;
  }

  async _purgeImmuneConditionTemporaryEntries(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return false;

    const currentEntries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = currentEntries.filter((entry) => {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      return !changes.some(
        (change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition
      );
    });
    if (remainingEntries.length === currentEntries.length) return false;
    await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    return true;
  }

  async _purgeImmuneConditionState(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (!targetActor || normalizedCondition === "none") return false;

    let changed = false;
    const effects = [...(targetActor.effects?.contents ?? [])];
    for (const effectDocument of effects) {
      if (this._extractConditionKeyFromEffect(effectDocument) !== normalizedCondition) continue;
      const wasChanged = await this._disableConditionEffectForImmunity(
        targetActor,
        effectDocument,
        normalizedCondition
      );
      changed ||= wasChanged;
    }

    const removedTemporaryEntries = await this._purgeImmuneConditionTemporaryEntries(
      targetActor,
      normalizedCondition
    );
    changed ||= removedTemporaryEntries;

    const currentFlags = this._getConditionFlagEntries(targetActor);
    if (currentFlags[normalizedCondition]) {
      await this._setConditionFlagState(targetActor, normalizedCondition, false);
      changed = true;
    } else {
      const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
      if (systemField && targetActor.system?.conditions?.[systemField]) {
        await targetActor.update({ [`system.conditions.${systemField}`]: false });
        changed = true;
      }
      if (!systemField) {
        const currentState = Boolean(
          targetActor.getFlag(POKROLE.ID, `automation.conditions.${normalizedCondition}`)
        );
        if (currentState) {
          await targetActor.setFlag(
            POKROLE.ID,
            `automation.conditions.${normalizedCondition}`,
            false
          );
          changed = true;
        }
      }
    }

    await this._clearConditionAuxiliaryState(targetActor, normalizedCondition);

    return changed;
  }

  _hasTrackedConditionEffect(targetActor, conditionKey) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return false;
    const statusId = `pokrole-condition-${normalizedCondition}`;
    const hasManagedActiveEffect = (targetActor?.effects?.contents ?? []).some((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
        `${entry ?? ""}`.trim().toLowerCase()
      );
      if (statusEntries.includes(statusId)) return true;
      return this._extractConditionKeyFromEffect(effectDocument) === normalizedCondition;
    });
    if (hasManagedActiveEffect) return true;
    return this._getTemporaryEffectEntries(targetActor).some((entry) => {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      return changes.some((change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition);
    });
  }

  _buildConditionFlagEffectConfig(conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    const burnStage =
      normalizedCondition === "burn" ? this._normalizeBurnStage(options?.burnStage, 1) : 1;
    const conditionNotes = {
      sleep: "Sleep: cannot act until awakened according to the CoreBook.",
      burn: "Burn: apply burn penalties/effects according to the CoreBook.",
      frozen: "Frozen: follow thaw and action restrictions from the CoreBook.",
      paralyzed: "Paralyzed: apply action/speed penalties according to the CoreBook.",
      poisoned: "Poisoned: apply poison progression according to the CoreBook.",
      fainted: "Fainted: actor is unable to act until recovered.",
      dead: "Dead: actor is dead and cannot act until manually restored by the table.",
      confused: "Confused: apply confusion behavior from the CoreBook.",
      flinch: "Flinch: actor may lose action per CoreBook timing.",
      disabled: "Disabled: selected move/action cannot be used as per CoreBook.",
      infatuated: "Infatuated: apply infatuation checks per CoreBook.",
      "badly-poisoned": "Badly Poisoned: escalating poison effects per CoreBook."
    };

    return {
      label:
        normalizedCondition === "burn"
          ? this._localizeBurnStageName(burnStage)
          : this._localizeConditionName(normalizedCondition),
      trigger: "always",
      chance: 100,
      target: "self",
      effectType: "condition",
      durationMode: ["confused", "infatuated"].includes(normalizedCondition) ? "rounds" : "manual",
      durationRounds: ["confused", "infatuated"].includes(normalizedCondition) ? 5 : 1,
      specialDuration: [],
      condition:
        normalizedCondition === "burn"
          ? this._getBurnConditionVariant(burnStage)
          : normalizedCondition,
      stat: "none",
      amount: 0,
      notes: conditionNotes[normalizedCondition] ?? ""
    };
  }

  async _ensureConditionEffectFromFlag(targetActor, conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }
    const burnStage =
      normalizedCondition === "burn" ? this._normalizeBurnStage(options?.burnStage, 1) : 1;

    if (normalizedCondition === "disabled") {
      return this._applyDisabledMoveEffectToActor(targetActor, null);
    }
    if (normalizedCondition === "dead" && targetActor?._isConditionActive?.("fainted")) {
      await targetActor.toggleQuickCondition("fainted", { active: false });
    }

    if (this._isConditionImmune(targetActor, normalizedCondition)) {
      await this._purgeImmuneConditionState(targetActor, normalizedCondition);
      return {
        applied: false,
        detail: this._getConditionBlockedDetail(targetActor, normalizedCondition)
      };
    }

    const systemField = CONDITION_FIELD_BY_KEY[normalizedCondition];
    if (systemField && !targetActor.system?.conditions?.[systemField]) {
      await targetActor.update({ [`system.conditions.${systemField}`]: true });
    }

    if (!systemField) {
      await targetActor.setFlag(POKROLE.ID, `automation.conditions.${normalizedCondition}`, true);
    }

    if (!this._hasTrackedConditionEffect(targetActor, normalizedCondition)) {
      const effectConfig = this._buildConditionFlagEffectConfig(normalizedCondition, { burnStage });
      return this._applyConditionEffectToActor(effectConfig, targetActor, null);
    }

    if (normalizedCondition === "burn") {
      if (typeof targetActor._applyBurnStage === "function") {
        const resolvedStage = await targetActor._applyBurnStage(burnStage);
        await this._synchronizeManagedBurnConditionEffect(targetActor, resolvedStage);
        return {
          applied: true,
          detail: this._localizeBurnStageName(resolvedStage)
        };
      }
      return {
        applied: true,
        detail: this._localizeBurnStageName(burnStage)
      };
    }

    if (normalizedCondition === "frozen" && typeof targetActor._initializeFrozenShell === "function") {
      await targetActor._initializeFrozenShell();
    }
    if (normalizedCondition === "confused" && typeof targetActor._clearConfusionSuppression === "function") {
      await targetActor._clearConfusionSuppression();
    }
    if (normalizedCondition === "infatuated" && typeof targetActor._clearInfatuationSuppression === "function") {
      await targetActor._clearInfatuationSuppression();
    }
    if (normalizedCondition === "paralyzed" && typeof targetActor._clearParalysisTurnCheck === "function") {
      await targetActor._clearParalysisTurnCheck();
    }

    return {
      applied: true,
      detail: this._localizeConditionName(normalizedCondition)
    };
  }

  async _removeTrackedConditionEffects(targetActor, conditionKey, options = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    if (normalizedCondition === "none") return 0;

    const shouldRevert = options.revert !== false;
    const statusId = `pokrole-condition-${normalizedCondition}`;
    const effectIdsToDelete = (targetActor?.effects?.contents ?? [])
      .filter((effectDocument) => {
        const statusEntries = [...(effectDocument.statuses ?? [])].map((entry) =>
          `${entry ?? ""}`.trim().toLowerCase()
        );
        if (statusEntries.includes(statusId)) return true;
        return this._extractConditionKeyFromEffect(effectDocument) === normalizedCondition;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (effectIdsToDelete.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", effectIdsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = [];
    let removedCount = 0;

    for (const entry of currentEntries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      const isConditionMatch = changes.some(
        (change) => this._normalizeConditionKey(change?.conditionKey) === normalizedCondition
      );
      if (!isConditionMatch) {
        remainingEntries.push(entry);
        continue;
      }

      if (shouldRevert) {
        await this._revertTemporaryEffectEntry(entry);
      }
      removedCount += 1;
    }

    if (removedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    }
    await this._clearConditionAuxiliaryState(targetActor, normalizedCondition);

    return removedCount + effectIdsToDelete.length;
  }

  async _synchronizeConditionFlagsFromTemporaryEffects(targetActor) {
    const activeConditionKeys = new Set();
    let activeBurnStage = 1;
    for (const effectDocument of [...(targetActor?.effects?.contents ?? [])]) {
      const conditionFromEffect = this._extractConditionKeyFromEffect(effectDocument);
      if (conditionFromEffect === "none") continue;
      if (this._isConditionImmune(targetActor, conditionFromEffect)) {
        await this._disableConditionEffectForImmunity(
          targetActor,
          effectDocument,
          conditionFromEffect
        );
        continue;
      }
      if (effectDocument?.disabled) continue;
      if (conditionFromEffect === "burn") {
        activeBurnStage = Math.max(activeBurnStage, this._extractBurnStageFromEffect(effectDocument));
      }
      activeConditionKeys.add(conditionFromEffect);
    }
    const entries = this._getTemporaryEffectEntries(targetActor);
    const remainingEntries = [];
    let entriesChanged = false;
    for (const entry of entries) {
      const changes = Array.isArray(entry?.changes) ? entry.changes : [];
      let keepEntry = true;
      for (const change of changes) {
        const normalizedCondition = this._normalizeConditionKey(change?.conditionKey);
        if (normalizedCondition !== "none") {
          if (this._isConditionImmune(targetActor, normalizedCondition)) {
            keepEntry = false;
            entriesChanged = true;
            continue;
          }
          if (normalizedCondition === "burn") {
            activeBurnStage = Math.max(
              activeBurnStage,
              this._resolveBurnStageFromCondition(change?.conditionKey)
            );
          }
          activeConditionKeys.add(normalizedCondition);
        }
      }
      if (keepEntry) remainingEntries.push(entry);
    }

    if (entriesChanged) {
      await this._setTemporaryEffectEntries(targetActor, remainingEntries);
    }

    const nextFlags = this._getConditionFlagEntries(targetActor);
    let hasChanges = false;
    for (const conditionKey of CONDITION_KEYS) {
      const shouldBeActive =
        activeConditionKeys.has(conditionKey) &&
        !this._isConditionImmune(targetActor, conditionKey);
      if (nextFlags[conditionKey] !== shouldBeActive) {
        nextFlags[conditionKey] = shouldBeActive;
        hasChanges = true;
      }

      const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
      if (systemField && Boolean(targetActor.system?.conditions?.[systemField]) !== shouldBeActive) {
        await targetActor.update({ [`system.conditions.${systemField}`]: shouldBeActive });
      }
      if (!systemField) {
        const currentState = Boolean(
          targetActor.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`)
        );
        if (currentState !== shouldBeActive) {
          await targetActor.setFlag(
            POKROLE.ID,
            `automation.conditions.${conditionKey}`,
            shouldBeActive
          );
        }
      }

      if (!shouldBeActive && (nextFlags[conditionKey] !== shouldBeActive || this._hasConditionAuxiliaryState(targetActor, conditionKey))) {
        await this._clearConditionAuxiliaryState(targetActor, conditionKey);
      }
    }

    if (hasChanges) {
      await targetActor.setFlag(POKROLE.ID, CONDITION_FLAGS_FLAG, nextFlags);
    }
    if (activeConditionKeys.has("burn") && !this._isConditionImmune(targetActor, "burn")) {
      if (typeof targetActor._applyBurnStage === "function") {
        await targetActor._applyBurnStage(activeBurnStage);
      }
    } else if (this._hasConditionAuxiliaryState(targetActor, "burn") && typeof targetActor._clearBurnTrack === "function") {
      await targetActor._clearBurnTrack();
    }
    if (!activeConditionKeys.has("frozen") && this._hasConditionAuxiliaryState(targetActor, "frozen")) {
      await targetActor._clearFrozenShellState();
    }
    if (!activeConditionKeys.has("paralyzed") && this._hasConditionAuxiliaryState(targetActor, "paralyzed")) {
      await targetActor._clearParalysisTurnCheck();
    }
    if (!activeConditionKeys.has("confused") && this._hasConditionAuxiliaryState(targetActor, "confused")) {
      await targetActor._clearConfusionSuppression();
    }
    if (!activeConditionKeys.has("infatuated") && this._hasConditionAuxiliaryState(targetActor, "infatuated")) {
      await targetActor._clearInfatuationSuppression();
    }
    const activeBadlyPoisoned =
      activeConditionKeys.has("badly-poisoned") &&
      !this._isConditionImmune(targetActor, "badly-poisoned");
    if (
      !activeBadlyPoisoned &&
      targetActor.getFlag?.(POKROLE.ID, "combat.sideDispositionOverride") !== undefined
    ) {
      await targetActor.unsetFlag(POKROLE.ID, "combat.sideDispositionOverride");
    }
    if (
      !activeBadlyPoisoned &&
      targetActor.getFlag?.(POKROLE.ID, "delayed.malignantChainMarker") !== undefined
    ) {
      await targetActor.unsetFlag(POKROLE.ID, "delayed.malignantChainMarker");
    }
  }

  _normalizeConfiguredEffect(effect) {
    const normalizedBase = this._normalizeSecondaryEffectDefinition(effect);
    const normalizedId = `${effect?.id ?? foundry.utils.randomID?.() ?? `${Date.now()}`}`.trim();
    const passive = Boolean(effect?.passive ?? false);
    const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${effect?.passiveTrigger ?? ""}`)
      ? `${effect.passiveTrigger}`
      : "always";
    const passiveCondition = this._normalizeConditionKey(effect?.passiveCondition);
    const passiveThreshold = clamp(Math.floor(toNumber(effect?.passiveThreshold, 50)), 1, 99);

    return {
      ...normalizedBase,
      id: normalizedId,
      passive,
      passiveTrigger,
      passiveCondition,
      passiveThreshold
    };
  }

  _normalizeConfiguredEffects(effectList) {
    const rawList = Array.isArray(effectList)
      ? effectList
      : effectList && typeof effectList === "object"
        ? Object.values(effectList)
        : [];
    return rawList.map((effect) => this._normalizeConfiguredEffect(effect));
  }

  _getConfiguredEffectEntries(targetActor) {
    const rawEntries = targetActor?.getFlag(POKROLE.ID, CONFIGURED_EFFECTS_FLAG);
    return this._normalizeConfiguredEffects(rawEntries);
  }

  async _setConfiguredEffectEntries(targetActor, entries) {
    const normalizedEntries = this._normalizeConfiguredEffects(entries);
    await targetActor.setFlag(POKROLE.ID, CONFIGURED_EFFECTS_FLAG, normalizedEntries);
  }

  _checkPassiveTrigger(effect, targetActor) {
    if (!effect.passive) return true;

    const triggerKey = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${effect.passiveTrigger ?? ""}`)
      ? `${effect.passiveTrigger}`
      : "always";
    const normalizedCondition = this._normalizeConditionKey(effect?.passiveCondition);
    const hpThresholdPercent = clamp(Math.floor(toNumber(effect?.passiveThreshold, 50)), 1, 99);
    const resolveHpPercent = (actor) => {
      const currentHp = Math.max(toNumber(actor?.system?.resources?.hp?.value, 0), 0);
      const maxHp = Math.max(toNumber(actor?.system?.resources?.hp?.max, 1), 1);
      return Math.floor((currentHp / maxHp) * 100);
    };
    const hasCondition = (actor, conditionKey) => {
      if (conditionKey === "none") return false;
      const conditionFlags =
        typeof actor?.getConditionFlags === "function" ? actor.getConditionFlags() : {};
      if (Object.prototype.hasOwnProperty.call(conditionFlags, conditionKey)) {
        return Boolean(conditionFlags[conditionKey]);
      }
      const systemField = CONDITION_FIELD_BY_KEY[conditionKey];
      if (systemField) {
        return Boolean(actor?.system?.conditions?.[systemField]);
      }
      return Boolean(actor?.getFlag(POKROLE.ID, `automation.conditions.${conditionKey}`));
    };

    switch (triggerKey) {
      case "always":
        return true;
      case "in-combat":
        return Boolean(game.combat);
      case "out-of-combat":
        return !game.combat;
      case "self-hp-half-or-less":
        return resolveHpPercent(this) <= 50;
      case "self-hp-quarter-or-less":
        return resolveHpPercent(this) <= 25;
      case "self-hp-below-threshold":
        return resolveHpPercent(this) <= hpThresholdPercent;
      case "target-hp-half-or-less":
        return resolveHpPercent(targetActor) <= 50;
      case "target-hp-quarter-or-less":
        return resolveHpPercent(targetActor) <= 25;
      case "target-hp-below-threshold":
        return resolveHpPercent(targetActor) <= hpThresholdPercent;
      case "self-has-condition":
        return hasCondition(this, normalizedCondition);
      case "self-missing-condition":
        return !hasCondition(this, normalizedCondition);
      case "target-has-condition":
        return hasCondition(targetActor, normalizedCondition);
      case "target-missing-condition":
        return !hasCondition(targetActor, normalizedCondition);
      default:
        return true;
    }
  }

  async _applyConfiguredEffectData(effect, options = {}) {
    const targetActor = options.targetActor ?? this;
    if (!targetActor) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    const normalizedEffect = this._normalizeConfiguredEffect(effect);
    const normalizedType = this._normalizeSecondaryEffectType(normalizedEffect.effectType);
    if (normalizedType === "condition" && this._normalizeConditionKey(normalizedEffect.condition) === "none") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (normalizedType === "stat" && this._normalizeSecondaryStatKey(normalizedEffect.stat) === "none") {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (normalizedType === "active-effect" && !`${normalizedEffect.linkedEffectId ?? ""}`.trim()) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.InvalidEffectConfiguration")
      };
    }
    if (!this._checkPassiveTrigger(normalizedEffect, targetActor)) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.PassiveTriggerNotMet")
      };
    }

    return this._applySecondaryEffectToActor(normalizedEffect, targetActor, null);
  }

  async clearCombatTemporaryEffects(combatId = null) {
    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const managedEffectsToDelete = this._getManagedAutomationEffects(this)
      .filter((effectDocument) => {
        const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
        const isCombatScoped = Boolean(automationFlags?.expiresWithCombat);
        if (!isCombatScoped) return false;
        const effectCombatId = `${automationFlags?.combatId ?? ""}`.trim();
        const matchesCombat =
          !normalizedCombatId || !effectCombatId || effectCombatId === normalizedCombatId;
        return matchesCombat;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (managedEffectsToDelete.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", managedEffectsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) {
      if (managedEffectsToDelete.length > 0) {
        await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      }
      return managedEffectsToDelete.length;
    }
    const remainingEntries = [];
    let clearedCount = 0;

    for (const entry of currentEntries) {
      const isCombatScoped = Boolean(entry?.expiresWithCombat);
      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!isCombatScoped || !matchesCombat) {
        remainingEntries.push(entry);
        continue;
      }

      await this._revertTemporaryEffectEntry(entry);
      clearedCount += 1;
    }

    if (clearedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, remainingEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    return clearedCount + managedEffectsToDelete.length;
  }

  async advanceTemporaryEffectsRound(combatId = null) {
    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) return 0;

    const normalizedCombatId = `${combatId ?? ""}`.trim();
    const nextEntries = [];
    let expiredCount = 0;
    let changed = false;

    for (const entry of currentEntries) {
      const durationMode = `${entry?.durationMode ?? "manual"}`.trim().toLowerCase();
      if (durationMode !== "rounds") {
        nextEntries.push(entry);
        continue;
      }

      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const matchesCombat =
        !normalizedCombatId || !entryCombatId || entryCombatId === normalizedCombatId;
      if (!matchesCombat) {
        nextEntries.push(entry);
        continue;
      }

      const remainingRounds = this._normalizeSecondaryDurationRounds(entry?.remainingRounds ?? 1);
      const nextRounds = remainingRounds - 1;
      if (nextRounds <= 0) {
        await this._revertTemporaryEffectEntry(entry);
        expiredCount += 1;
        changed = true;
        continue;
      }

      nextEntries.push({
        ...entry,
        remainingRounds: nextRounds
      });
      changed = changed || nextRounds !== remainingRounds;
    }

    if (changed || nextEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, nextEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    const expiredManagedEffects = await this._cleanupExpiredManagedRoundEffects(this, normalizedCombatId);
    if (expiredManagedEffects > 0) {
      return expiredCount + expiredManagedEffects;
    }

    return expiredCount;
  }

  async prepareAutomationEffectRoundTracking(effectDocument) {
    const effect = effectDocument ?? null;
    const targetActor = effect?.parent ?? this;
    if (!effect || !targetActor || targetActor.documentName !== "Actor") return false;

    const automationFlags = effect.getFlag?.(POKROLE.ID, "automation") ?? {};
    const durationMode = `${automationFlags?.durationMode ?? "manual"}`.trim().toLowerCase();
    if (durationMode !== "rounds") return false;

    const combat = game.combat ?? null;
    const combatId = `${automationFlags?.combatId ?? effect?.duration?.combat ?? combat?.id ?? ""}`.trim();
    const totalRounds = this._normalizeSecondaryDurationRounds(
      automationFlags?.durationRounds ?? effect?.duration?.rounds ?? 1
    );

    let appliedRound = Math.floor(toNumber(automationFlags?.appliedRound, Number.NaN));
    if (!Number.isFinite(appliedRound)) {
      const durationStartRound = Math.floor(toNumber(effect?.duration?.startRound, Number.NaN));
      const combatRound = Math.floor(toNumber(combat?.round, Number.NaN));
      appliedRound = Number.isFinite(durationStartRound)
        ? durationStartRound
        : Number.isFinite(combatRound)
          ? combatRound
          : Number.NaN;
    }

    let appliedTurn = Math.floor(toNumber(automationFlags?.appliedTurn, Number.NaN));
    if (!Number.isFinite(appliedTurn)) {
      const durationStartTurn = Math.floor(toNumber(effect?.duration?.startTurn, Number.NaN));
      const combatTurn = Math.floor(toNumber(combat?.turn, Number.NaN));
      appliedTurn = Number.isFinite(durationStartTurn)
        ? durationStartTurn
        : Number.isFinite(combatTurn)
          ? combatTurn
          : 0;
    }

    const currentRound = Math.floor(toNumber(combat?.round, Number.NaN));
    const elapsedRounds =
      Number.isFinite(currentRound) && Number.isFinite(appliedRound)
        ? Math.max(currentRound - appliedRound, 0)
        : 0;
    const remainingRounds = Math.max(totalRounds - elapsedRounds, 0);

    const updateData = {};
    if (combatId && `${automationFlags?.combatId ?? ""}`.trim() !== combatId) {
      updateData[`flags.${POKROLE.ID}.automation.combatId`] = combatId;
    }
    if (
      Number.isFinite(appliedRound) &&
      Math.floor(toNumber(automationFlags?.appliedRound, Number.NaN)) !== appliedRound
    ) {
      updateData[`flags.${POKROLE.ID}.automation.appliedRound`] = appliedRound;
    }
    if (
      Number.isFinite(appliedTurn) &&
      Math.floor(toNumber(automationFlags?.appliedTurn, Number.NaN)) !== appliedTurn
    ) {
      updateData[`flags.${POKROLE.ID}.automation.appliedTurn`] = appliedTurn;
    }
    if (Math.floor(toNumber(automationFlags?.durationRounds, Number.NaN)) !== totalRounds) {
      updateData[`flags.${POKROLE.ID}.automation.durationRounds`] = totalRounds;
    }
    if (Math.floor(toNumber(automationFlags?.remainingRounds, Number.NaN)) !== remainingRounds) {
      updateData[`flags.${POKROLE.ID}.automation.remainingRounds`] = remainingRounds;
    }

    if (
      combatId &&
      Number.isFinite(appliedRound) &&
      (Math.floor(toNumber(effect?.duration?.rounds, Number.NaN)) !== totalRounds ||
        Math.floor(toNumber(effect?.duration?.startRound, Number.NaN)) !== appliedRound ||
        Math.floor(toNumber(effect?.duration?.startTurn, Number.NaN)) !== appliedTurn ||
        `${effect?.duration?.combat ?? ""}`.trim() !== combatId)
    ) {
      updateData.duration = {
        rounds: totalRounds,
        startRound: appliedRound,
        startTurn: Number.isFinite(appliedTurn) ? appliedTurn : 0,
        combat: combatId
      };
    }

    if (!Object.keys(updateData).length) return false;
    await effect.update(updateData);
    return true;
  }

  async advanceManagedAutomationEffectsRound(combatId = null) {
    const targetActor = this;
    if (!targetActor || targetActor.documentName !== "Actor") return 0;

    const normalizedCombatId = `${combatId ?? game.combat?.id ?? ""}`.trim();
    const currentRound = Math.max(Math.floor(toNumber(game.combat?.round, 0)), 0);
    if (!normalizedCombatId || currentRound <= 0) return 0;

    const effectUpdates = [];
    const effectIdsToDelete = [];

    for (const effectDocument of targetActor.effects?.contents ?? []) {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      const durationMode = `${automationFlags?.durationMode ?? "manual"}`.trim().toLowerCase();
      if (durationMode !== "rounds") continue;

      const effectCombatId = `${automationFlags?.combatId ?? effectDocument?.duration?.combat ?? ""}`.trim();
      if (effectCombatId && effectCombatId !== normalizedCombatId) continue;

      const totalRounds = this._normalizeSecondaryDurationRounds(
        automationFlags?.durationRounds ?? effectDocument?.duration?.rounds ?? 1
      );
      let appliedRound = Math.floor(toNumber(automationFlags?.appliedRound, Number.NaN));
      if (!Number.isFinite(appliedRound)) {
        const nativeStartRound = Math.floor(toNumber(effectDocument?.duration?.startRound, Number.NaN));
        appliedRound = Number.isFinite(nativeStartRound) ? nativeStartRound : currentRound;
      }

      const elapsedRounds = Math.max(currentRound - appliedRound, 0);
      const remainingRounds = Math.max(totalRounds - elapsedRounds, 0);
      if (remainingRounds <= 0) {
        if (effectDocument.id) effectIdsToDelete.push(effectDocument.id);
        continue;
      }

      const currentTrackedRemaining = Math.floor(toNumber(automationFlags?.remainingRounds, Number.NaN));
      const currentTrackedRound = Math.floor(toNumber(automationFlags?.appliedRound, Number.NaN));
      const needsMetadataUpdate =
        currentTrackedRemaining !== remainingRounds ||
        currentTrackedRound !== appliedRound ||
        `${automationFlags?.combatId ?? ""}`.trim() !== (effectCombatId || normalizedCombatId);

      if (!needsMetadataUpdate) continue;

      effectUpdates.push({
        _id: effectDocument.id,
        [`flags.${POKROLE.ID}.automation.remainingRounds`]: remainingRounds,
        [`flags.${POKROLE.ID}.automation.appliedRound`]: appliedRound,
        [`flags.${POKROLE.ID}.automation.durationRounds`]: totalRounds,
        [`flags.${POKROLE.ID}.automation.combatId`]: effectCombatId || normalizedCombatId
      });
    }

    if (effectUpdates.length > 0) {
      await targetActor.updateEmbeddedDocuments("ActiveEffect", effectUpdates);
    }
    if (effectIdsToDelete.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", effectIdsToDelete);
    }

    return effectIdsToDelete.length;
  }

  async processTemporaryEffectSpecialDuration(eventKey, options = {}) {
    const normalizedEventKey = `${eventKey ?? ""}`.trim().toLowerCase();
    if (!normalizedEventKey) return 0;

    const eventAliases = {
      turnstart: "turn-start",
      "turn-start": "turn-start",
      turnend: "turn-end",
      "turn-end": "turn-end",
      roundend: "round-end",
      "round-end": "round-end",
      combatend: "combat-end",
      "combat-end": "combat-end",
      nextaction: "next-action",
      "next-action": "next-action",
      nextattack: "next-attack",
      "next-attack": "next-attack",
      nexthit: "next-hit",
      "next-hit": "next-hit",
      isattacked: "is-attacked",
      "is-attacked": "is-attacked",
      isdamaged: "is-damaged",
      "is-damaged": "is-damaged",
      ishit: "is-hit",
      "is-hit": "is-hit"
    };
    const resolvedEvent = eventAliases[normalizedEventKey] ?? normalizedEventKey;

    const normalizedCombatId = `${options.combatId ?? game.combat?.id ?? ""}`.trim();
    const managedEffectsToDelete = this._getManagedAutomationEffects(this)
      .filter((effectDocument) => {
        const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
        const specialDurationList = this._normalizeSpecialDurationList(automationFlags?.specialDuration);
        if (!specialDurationList.length || !specialDurationList.includes(resolvedEvent)) {
          return false;
        }
        const effectCombatId = `${automationFlags?.combatId ?? ""}`.trim();
        const requiresCombatMatch = ["turn-start", "turn-end", "round-end", "combat-end"].includes(resolvedEvent);
        if (!requiresCombatMatch) return true;
        return !normalizedCombatId || !effectCombatId || effectCombatId === normalizedCombatId;
      })
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (managedEffectsToDelete.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", managedEffectsToDelete);
    }

    const currentEntries = this._getTemporaryEffectEntries(this);
    if (!currentEntries.length) {
      if (managedEffectsToDelete.length > 0) {
        await this._synchronizeConditionFlagsFromTemporaryEffects(this);
      }
      return managedEffectsToDelete.length;
    }

    const remainingEntries = [];
    let removedCount = managedEffectsToDelete.length;

    for (const entry of currentEntries) {
      const specialDurationList = this._normalizeSpecialDurationList(entry?.specialDuration);
      if (!specialDurationList.length || !specialDurationList.includes(resolvedEvent)) {
        remainingEntries.push(entry);
        continue;
      }

      const entryCombatId = `${entry?.combatId ?? ""}`.trim();
      const requiresCombatMatch = ["turn-start", "turn-end", "round-end", "combat-end"].includes(resolvedEvent);
      const matchesCombat =
        !requiresCombatMatch ||
        !normalizedCombatId ||
        !entryCombatId ||
        entryCombatId === normalizedCombatId;
      if (!matchesCombat) {
        remainingEntries.push(entry);
        continue;
      }

      await this._revertTemporaryEffectEntry(entry);
      removedCount += 1;
    }

    if (removedCount > 0 || remainingEntries.length !== currentEntries.length) {
      await this._setTemporaryEffectEntries(this, remainingEntries);
      await this._synchronizeConditionFlagsFromTemporaryEffects(this);
    }

    return removedCount;
  }

  async processRoundEndCombatAutomation(options = {}) {
    const weatherKey = this._normalizeWeatherKey(options.weatherKey ?? this.getActiveWeatherKey());
    const statusDamage = await this._applyRoundEndStatusDamage();
    const weatherDamage = await this._applyRoundEndWeatherDamage(weatherKey);
    const terrainEffect = await this._applyRoundEndTerrainEffects();
    const heldItemResult = await this._applyRoundEndHeldItemEffects();
    const hasAnyEffect =
      statusDamage.totalDamage > 0 ||
      weatherDamage.totalDamage > 0 ||
      Boolean(terrainEffect.label) ||
      Boolean(heldItemResult.label);
    if (!hasAnyEffect) {
      return { totalDamage: 0, statusDamage, weatherDamage, terrainEffect };
    }

    const sections = [statusDamage.label, weatherDamage.label, terrainEffect.label, heldItemResult.label]
      .filter((label) => label && label !== game.i18n.localize("POKROLE.Common.None"))
      .map((label) => `<p>${label}</p>`)
      .join("");
    if (sections) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: this }),
        content: `
          <div class="pok-role-chat-card arcade-red">
            <header class="chat-card-header">
              <h3>${game.i18n.localize("POKROLE.Chat.RoundEndAutomation")}</h3>
            </header>
            <section class="chat-card-section">
              <p><strong>${this.name}</strong></p>
              ${sections}
            </section>
          </div>
        `
      });
    }
    return {
      totalDamage: statusDamage.totalDamage + weatherDamage.totalDamage + (heldItemResult.totalDamage ?? 0),
      statusDamage,
      weatherDamage,
      terrainEffect
    };
  }

  async _applyRoundEndTerrainEffects() {
    if (!this.hasActiveTerrainForActor(this, "grassy")) {
      return { label: "", totalHealing: 0 };
    }

    const hpValue = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 0), 0);
    if (hpMax <= 0 || hpValue >= hpMax) {
      return { label: game.i18n.localize("POKROLE.Common.None"), totalHealing: 0 };
    }

    const healResult = await this._safeApplyHeal(this, 1, {
      healingCategory: "unlimited"
    });
    const healedApplied = Math.max(toNumber(healResult?.healedApplied, 0), 0);
    if (healedApplied <= 0) {
      return { label: game.i18n.localize("POKROLE.Common.None"), totalHealing: 0 };
    }

    return {
      label: game.i18n.format("POKROLE.Chat.TerrainRoundHeal", {
        terrain: this._localizeTerrainName("grassy"),
        healing: healedApplied
      }),
      totalHealing: healedApplied
    };
  }

  async _applyTerrainFieldMoveRuntime({ move, hit }) {
    const runtimeRule = this._getTerrainRuntimeMoveRule(move);
    if (!runtimeRule || !game.combat) return [];
    if (hit === false) return [];

    const moveCategory = this._normalizeMoveCombatCategory(move?.system?.category);
    const movePrimaryMode = this._normalizeMovePrimaryMode(move?.system?.primaryMode);
    const requiresHit = moveCategory !== "support" && movePrimaryMode !== "effect-only";
    if (requiresHit && !hit) return [];

    const results = [];
    const effectLabel = this._localizeSecondaryEffectTypeLabel("terrain");
    const targetLabel = this._localizeMoveTarget(move?.system?.target);

    if (runtimeRule.terrainScope && runtimeRule.terrain) {
      const terrainKey = this._normalizeTerrainKey(runtimeRule.terrain);
      const durationRounds = 4;
      const payload = await this.setActiveTerrain(terrainKey, {
        durationRounds,
        scope: runtimeRule.terrainScope,
        sourceMoveId: move?.id ?? null,
        sourceMoveName: move?.name ?? ""
      });
      results.push({
        label: effectLabel,
        targetName:
          runtimeRule.terrainScope === "side"
            ? game.i18n.localize("POKROLE.Chat.TerrainScopeSide")
            : game.i18n.localize("POKROLE.Chat.TerrainScopeBattlefield"),
        applied: Boolean(payload),
        detail: payload
          ? `${this._localizeTerrainName(terrainKey)} (${game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
              rounds: durationRounds
            })})`
          : game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      });
      await this.synchronizeTerrainEffectsForCombat();
    }

    if (runtimeRule.swapSideTerrain) {
      const swapped = await this.swapTerrainSides(this);
      results.push({
        label: effectLabel,
        targetName: targetLabel,
        applied: swapped,
        detail: swapped
          ? game.i18n.localize("POKROLE.Chat.TerrainSwapped")
          : game.i18n.localize("POKROLE.Chat.TerrainNoSwap")
      });
    }

    if (runtimeRule.clearAllTerrainsOnHit) {
      const cleared = await this.clearAllActiveTerrains();
      results.push({
        label: effectLabel,
        targetName: game.i18n.localize("POKROLE.Move.TargetValues.Battlefield"),
        applied: cleared,
        detail: cleared
          ? game.i18n.localize("POKROLE.Chat.TerrainClearedAll")
          : game.i18n.localize("POKROLE.Chat.TerrainNoActive")
      });
    } else if (runtimeRule.clearActorSideTerrainsOnHit || runtimeRule.clearBattlefieldTerrainsOnHit) {
      const cleared = await this.clearTerrainsForActorSide(this, {
        includeBattlefield: runtimeRule.clearBattlefieldTerrainsOnHit === true
      });
      results.push({
        label: effectLabel,
        targetName: targetLabel,
        applied: cleared,
        detail: cleared
          ? game.i18n.localize("POKROLE.Chat.TerrainClearedSide")
          : game.i18n.localize("POKROLE.Chat.TerrainNoActive")
      });
    }

    return results;
  }

  async _applyRoundEndHeldItemEffects() {
    const held = this._getHeldItemData();
    if (!held) return { label: "", totalDamage: 0 };
    const parts = [];
    let totalDamage = 0;

    // Leftovers: heal HP at end of round (limited uses)
    if (held.endOfRoundHeal > 0) {
      const flagKey = "combat.leftoversUses";
      const currentUses = toNumber(this.getFlag(POKROLE.ID, flagKey), 0);
      const maxUses = toNumber(held.endOfRoundMaxUses, 3);
      if (currentUses < maxUses) {
        const hpValue = Math.max(toNumber(this.system?.resources?.hp?.value, 0), 0);
        const hpMax = Math.max(toNumber(this.system?.resources?.hp?.max, 1), 1);
        if (hpValue < hpMax) {
          const healAmount = Math.min(held.endOfRoundHeal, hpMax - hpValue);
          await this.update({ "system.resources.hp.value": hpValue + healAmount });
          await this.setFlag(POKROLE.ID, flagKey, currentUses + 1);
          parts.push(`Leftovers healed ${healAmount} HP (use ${currentUses + 1}/${maxUses})`);
        }
        if (currentUses + 1 >= maxUses) {
          await this.update({ "system.battleItem": "" });
          parts.push("Leftovers consumed!");
        }
      }
    }

    // Sticky Barb: deal damage to self at end of round
    if (held.stickyBarb && held.endOfRoundDamage > 0) {
      const damage = held.endOfRoundDamage;
      await this._safeApplyDamage(this, damage, { applyDeadOnZero: false });
      totalDamage += damage;
      parts.push(`Sticky Barb dealt ${damage} damage`);
    }

    // Flame Orb / Toxic Orb: apply status on first round
    if (held.onEnterBattleStatus) {
      const flagKey = "combat.orbStatusApplied";
      const alreadyApplied = this.getFlag(POKROLE.ID, flagKey);
      if (!alreadyApplied) {
        await this.setFlag(POKROLE.ID, flagKey, true);
        const statusToApply = held.onEnterBattleStatus.toLowerCase().trim();
        if (statusToApply === "burn" && !this._isConditionActive("burn")) {
          await this.toggleQuickCondition("burn", { active: true });
          parts.push("Flame Orb inflicted burn!");
        } else if (statusToApply === "poison" && !this._isConditionActive("poisoned")) {
          await this.toggleQuickCondition("poisoned", { active: true });
          parts.push("Toxic Orb inflicted poison!");
        }
      }
    }

    return {
      label: parts.length > 0 ? parts.join(" | ") : "",
      totalDamage
    };
  }

  async _applyRoundEndStatusDamage() {
    const conditionFlags = this.getConditionFlags();
    let totalDamage = 0;
    const statusParts = [];

    const applyDamage = async (conditionKey, amount) => {
      if (!conditionFlags?.[conditionKey]) return;
      const hpResult = await this._safeApplyDamage(this, amount, {
        applyDeadOnZero: this._statusDamageCanKill(conditionKey)
      });
      if (!hpResult) return;
      totalDamage += amount;
      const label =
        conditionKey === "burn"
          ? this._localizeBurnStageName(this._getBurnTrack().stage)
          : this._localizeConditionName(conditionKey);
      statusParts.push(`${label} -${amount}`);
    };

    await applyDamage("burn", this._getBurnRoundDamage(this._getBurnTrack().stage));
    await applyDamage("poisoned", 1);
    await applyDamage("badly-poisoned", 1);

    if (!statusParts.length) {
      return { totalDamage: 0, label: game.i18n.localize("POKROLE.Common.None") };
    }
    return { totalDamage, label: statusParts.join(" | ") };
  }

  async _applyRoundEndWeatherDamage(weatherKey) {
    const weather = this._normalizeWeatherKey(weatherKey);
    const localizedWeather = this._localizeWeatherName(weather);
    if (weather === "none") {
      return { totalDamage: 0, label: game.i18n.localize("POKROLE.Common.None") };
    }
    // Umbrella: immune to weather damage
    if (this._getHeldItemData()?.immuneToWeather) {
      return {
        totalDamage: 0,
        label: game.i18n.format("POKROLE.Chat.WeatherNoDamage", { weather: localizedWeather })
      };
    }
    const isPokemon = this.type === "pokemon";
    let damage = 0;
    if (weather === "sandstorm" && isPokemon && !this.hasType("rock") && !this.hasType("ground") && !this.hasType("steel")) {
      damage = 1;
    }
    if (weather === "hail" && isPokemon && !this.hasType("ice")) {
      damage = 1;
    }
    if (damage <= 0) {
      return {
        totalDamage: 0,
        label: game.i18n.format("POKROLE.Chat.WeatherNoDamage", { weather: localizedWeather })
      };
    }
    await this._safeApplyDamage(this, damage);
    return {
      totalDamage: damage,
      label: game.i18n.format("POKROLE.Chat.WeatherRoundDamage", {
        weather: localizedWeather,
        damage
      })
    };
  }

  _getTemporaryEffectEntries(targetActor) {
    const rawEntries = targetActor?.getFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG);
    if (!Array.isArray(rawEntries)) return [];
    return rawEntries.filter((entry) => entry && typeof entry === "object");
  }

  async _setTemporaryEffectEntries(targetActor, entries) {
    const normalizedEntries = Array.isArray(entries)
      ? entries.filter((entry) => entry && typeof entry === "object")
      : [];
    await targetActor.setFlag(POKROLE.ID, TEMPORARY_EFFECTS_FLAG, normalizedEntries);
  }

  _isTerrainTrackerTemporaryEntry(entry, combatId = game.combat?.id ?? null) {
    const effectType = `${entry?.effectType ?? ""}`.trim().toLowerCase();
    const isTracker = entry?.terrainTracker === true || effectType === "terrain-track";
    if (!isTracker) return false;
    const normalizedCombatId = `${combatId ?? ""}`.trim();
    if (!normalizedCombatId) return true;
    const entryCombatId = `${entry?.combatId ?? ""}`.trim();
    return !entryCombatId || entryCombatId === normalizedCombatId;
  }

  _buildTerrainTrackerTemporaryEntry(terrainEntry, existingEntry = null) {
    const combat = game.combat ?? null;
    const terrainKey = this._normalizeTerrainKey(terrainEntry?.terrain);
    if (terrainKey === "none") return null;

    const durationRounds = Math.max(Math.floor(toNumber(terrainEntry?.durationRounds, 0)), 0);
    const durationMode = durationRounds > 0 ? "rounds" : "combat";
    const scope = this._normalizeTerrainScope(terrainEntry?.scope ?? "battlefield");
    const scopeLabel =
      scope === "side"
        ? game.i18n.localize("POKROLE.Chat.TerrainScopeSide")
        : game.i18n.localize("POKROLE.Chat.TerrainScopeBattlefield");
    const effectLabel = this._localizeSecondaryEffectTypeLabel("terrain");

    return {
      id:
        `${existingEntry?.id ?? ""}`.trim() ||
        `terrain-tracker-${`${terrainEntry?.id ?? ""}`.trim() || foundry.utils.randomID()}`,
      label: `${effectLabel}: ${this._localizeTerrainName(terrainKey)} (${scopeLabel})`,
      effectType: "terrain-track",
      terrainTracker: true,
      terrainKey,
      terrainScope: scope,
      terrainEntryId: `${terrainEntry?.id ?? ""}`.trim() || null,
      sourceMoveId: terrainEntry?.sourceMoveId ?? null,
      sourceMoveName: terrainEntry?.sourceMoveName ?? "",
      sourceActorId: terrainEntry?.sourceActorId ?? this.id ?? null,
      sourceActorName: terrainEntry?.sourceActorName ?? this.name ?? "",
      durationMode,
      remainingRounds: durationMode === "rounds" ? durationRounds : null,
      specialDuration: [],
      expiresWithCombat: true,
      combatId: combat?.id ?? null,
      appliedRound: Math.max(Math.floor(toNumber(terrainEntry?.roundSet, combat?.round ?? 0)), 0),
      createdAt: Number(existingEntry?.createdAt ?? Date.now()),
      changes: []
    };
  }

  async _syncTerrainTrackerEffectsForCombat(
    combat = game.combat,
    terrainEntries = this._getCombatTerrainEntries(combat)
  ) {
    if (!combat) return 0;

    const normalizedCombatId = `${combat.id ?? ""}`.trim();
    const normalizedEntries = (Array.isArray(terrainEntries) ? terrainEntries : [])
      .map((entry) => this._normalizeTerrainEntry(entry))
      .filter((entry) => entry && this._normalizeTerrainKey(entry.terrain) !== "none");

    const candidateActors = new Map();
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant?.actor ?? null;
      if (!actor?.id) continue;
      candidateActors.set(actor.id, actor);
    }
    for (const entry of normalizedEntries) {
      const sourceActorId = `${entry?.sourceActorId ?? ""}`.trim();
      if (!sourceActorId || candidateActors.has(sourceActorId)) continue;
      const sourceActor = game.actors?.get?.(sourceActorId) ?? null;
      if (sourceActor?.id) candidateActors.set(sourceActor.id, sourceActor);
    }

    let updates = 0;
    for (const actor of candidateActors.values()) {
      if (!actor) continue;
      if (!game.user?.isGM && !actor.isOwner) continue;

      const currentEntries = this._getTemporaryEffectEntries(actor);
      const currentTrackersByTerrainEntryId = new Map(
        currentEntries
          .filter((entry) => this._isTerrainTrackerTemporaryEntry(entry, normalizedCombatId))
          .map((entry) => [`${entry?.terrainEntryId ?? entry?.id ?? ""}`.trim(), entry])
      );
      const preservedEntries = currentEntries.filter(
        (entry) => !this._isTerrainTrackerTemporaryEntry(entry, normalizedCombatId)
      );
      const desiredEntries = normalizedEntries
        .filter((entry) => `${entry?.sourceActorId ?? ""}`.trim() === actor.id)
        .map((entry) =>
          this._buildTerrainTrackerTemporaryEntry(
            entry,
            currentTrackersByTerrainEntryId.get(`${entry?.id ?? ""}`.trim()) ?? null
          )
        )
        .filter(Boolean);
      const nextEntries = [...preservedEntries, ...desiredEntries];

      if (JSON.stringify(nextEntries) === JSON.stringify(currentEntries)) continue;
      await this._setTemporaryEffectEntries(actor, nextEntries);
      updates += 1;
    }

    return updates;
  }

  async _trackTemporaryConditionEffect({
    targetActor,
    conditionKey = "none",
    conditionPath,
    label = "",
    sourceMove = null,
    durationMode = "manual",
    durationRounds = 1,
    specialDuration = []
  }) {
    if (!targetActor) {
      return { durationMode: "manual", durationRounds: 1 };
    }

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "condition");
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const combatId = game.combat?.id ?? null;
    const combatRound = game.combat?.round ?? null;
    const effectiveMode =
      (requestedMode === "combat" || requestedMode === "rounds") && !combatId
        ? "manual"
        : requestedMode;
    const isCombatScoped = effectiveMode === "combat" || effectiveMode === "rounds";

    const effectEntries = this._getTemporaryEffectEntries(targetActor);
    const effectId =
      foundry.utils.randomID?.() ??
      `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    effectEntries.push({
      id: effectId,
      label: `${label ?? ""}`.trim() || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
      effectType: "condition",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      durationMode: effectiveMode,
      remainingRounds: effectiveMode === "rounds" ? normalizedRounds : null,
      specialDuration: normalizedSpecialDuration,
      expiresWithCombat: isCombatScoped,
      combatId: isCombatScoped ? combatId : null,
      appliedRound: isCombatScoped ? combatRound : null,
      createdAt: Date.now(),
      changes: [
        {
          kind: "boolean",
          path: conditionPath ?? "",
          conditionKey: this._normalizeConditionKey(conditionKey),
          previousValue: false
        }
      ]
    });
    await this._setTemporaryEffectEntries(targetActor, effectEntries);
    return {
      durationMode: effectiveMode,
      durationRounds: normalizedRounds,
      specialDuration: normalizedSpecialDuration
    };
  }

  _getManagedModifierEffectsForPath(targetActor, path) {
    const normalizedPath = `${path ?? ""}`.trim();
    if (!targetActor || !normalizedPath) return [];
    const effects = targetActor.effects?.contents ?? [];
    return effects.filter((effectDocument) => {
      if (effectDocument?.disabled) return false;
      const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
      if (!automationFlags?.managed) return false;
      if (`${automationFlags?.effectType ?? ""}`.trim().toLowerCase() !== "modifier") return false;
      if (`${automationFlags?.path ?? ""}`.trim() !== normalizedPath) return false;
      const amountApplied = Math.floor(toNumber(automationFlags?.amountApplied, 0));
      return amountApplied !== 0;
    });
  }

  async _applyTemporaryTrackedModifier({
    targetActor,
    path,
    amount,
    min = 0,
    max = 99,
    label = "",
    sourceMove = null,
    detailLabel = "",
    durationMode = "combat",
    durationRounds = 1,
    specialDuration = [],
    automationOverrides = {},
    maxStacks = 0
  }) {
    const numericAmount = Math.floor(toNumber(amount, 0));
    if (!targetActor || !path || numericAmount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const existingPathModifiers = this._getManagedModifierEffectsForPath(targetActor, path);
    const incomingSourceType = this._getAutomationSourceItemType({
      sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase(),
      sourceMoveId: sourceMove?.type === "move" ? sourceMove?.id ?? null : null
    });
    const sameDirectionModifiers = existingPathModifiers.filter((effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const applied = Math.floor(toNumber(flags?.amountApplied, 0));
      if (applied === 0) return false;
      return Math.sign(applied) === Math.sign(numericAmount);
    });
    const nonStackableSameDirectionModifiers = sameDirectionModifiers.filter((effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const existingSourceType = this._getAutomationSourceItemType(flags);
      return !this._canStackTrackedModifierSources(incomingSourceType, existingSourceType);
    });
    const strongestSameDirection = nonStackableSameDirectionModifiers.reduce((maxAmount, effectDocument) => {
      const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const applied = Math.floor(toNumber(flags?.amountApplied, 0));
      return Math.max(maxAmount, Math.abs(applied));
    }, 0);
    if (strongestSameDirection >= Math.abs(numericAmount)) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }
    const weakerSameDirectionIds = nonStackableSameDirectionModifiers
      .map((effectDocument) => effectDocument.id)
      .filter((effectId) => effectId);
    if (weakerSameDirectionIds.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", weakerSameDirectionIds);
    }

    // Enforce maxStacks for same-ability stacking (e.g. Speed Boost caps at 3)
    if (maxStacks > 0) {
      const sourceItemName = `${sourceMove?.name ?? ""}`.trim().toLowerCase();
      // Re-query current effects (after any deletions above) to get accurate count
      const currentPathModifiers = this._getManagedModifierEffectsForPath(targetActor, path);
      const existingSameSourceCount = currentPathModifiers.filter((effectDocument) => {
        const flags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
        const flagName = `${flags.sourceItemName ?? ""}`.trim().toLowerCase();
        return flagName === sourceItemName && `${flags.sourceItemType ?? ""}`.trim().toLowerCase() === "ability";
      }).length;
      console.log(`PokRole | maxStacks check: ${sourceMove?.name} has ${existingSameSourceCount}/${maxStacks} stacks on ${path}`);
      if (existingSameSourceCount >= maxStacks) {
        return {
          applied: false,
          detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
        };
      }
    }

    const currentValue = toNumber(foundry.utils.getProperty(targetActor, path), 0);
    const nextValue = clamp(currentValue + numericAmount, min, max);
    const appliedAmount = nextValue - currentValue;
    if (appliedAmount === 0) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }

    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const requestedMode = this._normalizeSecondaryDurationMode(durationMode, "stat");
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType: "modifier",
      conditionKey: "none",
      durationMode: requestedMode,
      durationRounds: normalizedRounds,
      specialDuration: normalizedSpecialDuration,
      sourceMove
    });
    const mergedAutomationFlags = {
      ...automationFlags,
      ...(automationOverrides && typeof automationOverrides === "object"
        ? foundry.utils.deepClone(automationOverrides)
        : {})
    };
    const durationData = this._buildManagedEffectDuration(
      mergedAutomationFlags.durationMode,
      mergedAutomationFlags.durationRounds
    );
    await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `${label ?? ""}`.trim() || detailLabel || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
        img: sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: [],
        duration: durationData,
        changes: [
          {
            key: path,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            value: `${appliedAmount}`,
            priority: 20
          }
        ],
        flags: {
          [POKROLE.ID]: {
            automation: {
              ...mergedAutomationFlags,
              path,
              amountApplied: appliedAmount,
              sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase() || null,
              sourceItemId: sourceMove?.id ?? null,
              sourceItemName: sourceMove?.name ?? "",
              min,
              max
            }
          }
        }
      }
    ]);

    // Trigger on-stat-lowered for abilities like Defiant/Competitive
    if (appliedAmount < 0 && typeof targetActor.processAbilityTriggerEffects === "function") {
      console.log(`PokRole | Stat lowered on ${targetActor.name} (${path} ${appliedAmount}), firing on-stat-lowered`);
      try {
        const statLowerResults = await targetActor.processAbilityTriggerEffects("on-stat-lowered", {
          combat: game.combat,
          attackerActor: this
        });
        console.log(`PokRole | on-stat-lowered results for ${targetActor.name}:`, statLowerResults);
      } catch (e) {
        console.warn(`PokRole | on-stat-lowered ability processing failed for ${targetActor.name}:`, e);
      }
    }

    const durationLabel = this._localizeTemporaryDuration(
      mergedAutomationFlags.durationMode,
      mergedAutomationFlags.durationRounds,
      mergedAutomationFlags.specialDuration
    );
    return {
      applied: true,
      detail: `${detailLabel || path} ${currentValue} -> ${nextValue} (${durationLabel})`
    };
  }

  _getAutomationSourceItemType(automationFlags = {}) {
    const explicitType = `${automationFlags?.sourceItemType ?? ""}`.trim().toLowerCase();
    if (["move", "ability"].includes(explicitType)) return explicitType;
    const legacyMoveId = `${automationFlags?.sourceMoveId ?? ""}`.trim();
    if (legacyMoveId) return "move";
    return "";
  }

  _canStackTrackedModifierSources(leftSourceType, rightSourceType) {
    if (leftSourceType === "transfer" || rightSourceType === "transfer") {
      return true;
    }
    // Abilities stack with moves and with other ability applications (e.g. Speed Boost each round)
    if (leftSourceType === "ability" || rightSourceType === "ability") {
      return true;
    }
    return false;
  }

  _localizeTemporaryDuration(durationMode, rounds = 1, specialDuration = []) {
    const normalizedMode = `${durationMode ?? "manual"}`.trim().toLowerCase();
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const specialDurationLabel = this._localizeSpecialDurationList(normalizedSpecialDuration);
    if (normalizedMode === "combat") {
      const baseLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationCombat");
      return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
    }
    if (normalizedMode === "rounds") {
      const normalizedRounds = this._normalizeSecondaryDurationRounds(rounds);
      const baseLabel = game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
        rounds: normalizedRounds
      });
      return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
    }
    const baseLabel = game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return specialDurationLabel ? `${baseLabel} + ${specialDurationLabel}` : baseLabel;
  }

  _localizeSpecialDurationList(specialDurationList = []) {
    if (!Array.isArray(specialDurationList) || specialDurationList.length === 0) return "";
    const labelByKey = {
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
    const labels = specialDurationList.map((durationKey) =>
      game.i18n.localize(labelByKey[durationKey] ?? "POKROLE.Common.Unknown")
    );
    return labels.join(", ");
  }

  _buildManagedEffectDuration(durationMode, durationRounds) {
    const normalizedMode = `${durationMode ?? "manual"}`.trim().toLowerCase();
    if (normalizedMode !== "rounds") return {};
    const normalizedRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const combat = game.combat;
    const duration = { rounds: normalizedRounds };
    if (combat) {
      duration.startRound = Number.isFinite(Number(combat.round)) ? Number(combat.round) : 0;
      duration.startTurn = Number.isFinite(Number(combat.turn)) ? Number(combat.turn) : 0;
      duration.combat = combat.id ?? null;
    }
    return duration;
  }

  _buildManagedAutomationFlagPayload({
    effectType = "custom",
    conditionKey = "none",
    durationMode = "manual",
    durationRounds = 1,
    specialDuration = [],
    sourceMove = null
  } = {}) {
    const normalizedCondition = this._normalizeConditionKey(conditionKey);
    const normalizedDurationMode = this._normalizeSecondaryDurationMode(durationMode, effectType);
    const normalizedDurationRounds = this._normalizeSecondaryDurationRounds(durationRounds);
    const normalizedSpecialDuration = this._normalizeSpecialDurationList(specialDuration);
    const combatId = game.combat?.id ?? null;
    const effectiveMode =
      (normalizedDurationMode === "combat" || normalizedDurationMode === "rounds") && !combatId
        ? "manual"
        : normalizedDurationMode;
    const expiresWithCombat = effectiveMode === "combat" || effectiveMode === "rounds";

    return {
      managed: true,
      sourceType: "automation",
      effectType,
      conditionKey: normalizedCondition,
      durationMode: effectiveMode,
      durationRounds: normalizedDurationRounds,
      remainingRounds: effectiveMode === "rounds" ? normalizedDurationRounds : null,
      specialDuration: normalizedSpecialDuration,
      expiresWithCombat,
      combatId: expiresWithCombat ? combatId : null,
      appliedRound: expiresWithCombat ? game.combat?.round ?? null : null,
      appliedTurn: expiresWithCombat ? game.combat?.turn ?? null : null,
      sourceItemType: `${sourceMove?.type ?? ""}`.trim().toLowerCase() || null,
      sourceItemId: sourceMove?.id ?? null,
      sourceItemName: sourceMove?.name ?? "",
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? "",
      sourceActorId: this.id ?? null,
      sourceActorName: this.name ?? "",
      createdAt: Date.now()
    };
  }

  _isManagedAutomationEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation");
    return Boolean(automationFlags?.managed);
  }

  _extractConditionKeyFromEffect(effectDocument) {
    const automationFlags = effectDocument?.getFlag(POKROLE.ID, "automation");
    const fromFlags = this._normalizeConditionKey(automationFlags?.conditionKey);
    if (fromFlags !== "none") return fromFlags;
    const statusEntries = [...(effectDocument?.statuses ?? [])];
    for (const statusEntry of statusEntries) {
      const normalizedStatus = `${statusEntry ?? ""}`.trim().toLowerCase();
      if (!normalizedStatus.startsWith("pokrole-condition-")) continue;
      const conditionKey = this._normalizeConditionKey(
        normalizedStatus.replace(/^pokrole-condition-/, "")
      );
      if (conditionKey !== "none") return conditionKey;
    }
    return "none";
  }

  _getManagedAutomationEffects(targetActor) {
    const actor = targetActor ?? this;
    const effects = actor?.effects?.contents ?? [];
    return effects.filter((effectDocument) => this._isManagedAutomationEffect(effectDocument));
  }

  _getManagedAutomationEffectsByType(targetActor, effectType) {
    const normalizedType = `${effectType ?? ""}`.trim().toLowerCase();
    if (!normalizedType) return [];
    return this._getManagedAutomationEffects(targetActor).filter((effectDocument) => {
      const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
      return `${automationFlags?.effectType ?? ""}`.trim().toLowerCase() === normalizedType;
    });
  }

  async _createManagedMarkerEffect({
    targetActor = this,
    name = "",
    img = "",
    sourceMove = null,
    effectType = "custom",
    durationMode = "manual",
    durationRounds = 1,
    specialDuration = [],
    statuses = [],
    changes = [],
    extraAutomationFlags = {}
  } = {}) {
    if (!(targetActor instanceof PokRoleActor)) return null;
    const automationFlags = this._buildManagedAutomationFlagPayload({
      effectType,
      conditionKey: "none",
      durationMode,
      durationRounds,
      specialDuration,
      sourceMove
    });
    const mergedAutomationFlags = {
      ...automationFlags,
      ...(extraAutomationFlags && typeof extraAutomationFlags === "object"
        ? foundry.utils.deepClone(extraAutomationFlags)
        : {})
    };
    if (mergedAutomationFlags.sceneScoped) {
      mergedAutomationFlags.sceneId = `${mergedAutomationFlags.sceneId ?? canvas?.scene?.id ?? ""}`.trim();
    }
    const durationData = this._buildManagedEffectDuration(
      mergedAutomationFlags.durationMode,
      mergedAutomationFlags.durationRounds
    );
    const [createdEffect] = await targetActor.createEmbeddedDocuments("ActiveEffect", [
      {
        name: `${name ?? ""}`.trim() || sourceMove?.name || game.i18n.localize("POKROLE.TemporaryEffects.Title"),
        img: `${img ?? ""}`.trim() || sourceMove?.img || "icons/svg/aura.svg",
        origin: sourceMove?.uuid ?? null,
        transfer: false,
        disabled: false,
        statuses: Array.isArray(statuses) ? statuses.filter(Boolean) : [],
        duration: durationData,
        changes: Array.isArray(changes) ? changes : [],
        flags: {
          [POKROLE.ID]: {
            automation: mergedAutomationFlags
          }
        }
      }
    ]);
    return createdEffect ?? null;
  }

  async clearSceneScopedManagedEffects(currentSceneId = null) {
    const normalizedSceneId = `${currentSceneId ?? canvas?.scene?.id ?? ""}`.trim();
    if (!normalizedSceneId) return 0;
    const effectIds = this._getManagedAutomationEffects(this)
      .filter((effectDocument) => {
        const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
        if (!automationFlags?.sceneScoped) return false;
        const effectSceneId = `${automationFlags?.sceneId ?? ""}`.trim();
        return Boolean(effectSceneId) && effectSceneId !== normalizedSceneId;
      })
      .map((effectDocument) => effectDocument.id)
      .filter(Boolean);
    if (effectIds.length > 0) {
      await this.deleteEmbeddedDocuments("ActiveEffect", effectIds);
    }
    return effectIds.length;
  }

  async _cleanupExpiredManagedRoundEffects(targetActor, combatId = null) {
    const combat = game.combat;
    if (!targetActor || !combat) return 0;

    const normalizedCombatId = `${combatId ?? combat.id ?? ""}`.trim();
    if (!normalizedCombatId) return 0;

    const currentRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0);
    const expiredEffectIds = [];

    for (const effectDocument of this._getManagedAutomationEffects(targetActor)) {
      const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
      const durationMode = this._normalizeSecondaryDurationMode(
        automationFlags?.durationMode,
        automationFlags?.effectType ?? "custom"
      );
      if (durationMode !== "rounds") continue;

      const effectCombatId = `${automationFlags?.combatId ?? effectDocument?.duration?.combat ?? ""}`.trim();
      if (effectCombatId && effectCombatId !== normalizedCombatId) continue;

      const durationRounds = this._normalizeSecondaryDurationRounds(
        effectDocument?.duration?.rounds ?? automationFlags?.durationRounds ?? 1
      );
      const startRound = Math.max(
        Math.floor(
          toNumber(
            effectDocument?.duration?.startRound ?? automationFlags?.appliedRound ?? currentRound,
            currentRound
          )
        ),
        0
      );
      if (currentRound > startRound + durationRounds - 1) {
        expiredEffectIds.push(effectDocument.id);
      }
    }

    if (expiredEffectIds.length > 0) {
      await targetActor.deleteEmbeddedDocuments("ActiveEffect", expiredEffectIds);
      await this._synchronizeConditionFlagsFromTemporaryEffects(targetActor);
    }

    return expiredEffectIds.length;
  }

  async _revertTemporaryEffectEntry(entry) {
    const effectChanges = Array.isArray(entry?.changes) ? entry.changes : [];
    if (!effectChanges.length) return;

    const updates = {};
    for (const change of effectChanges) {
      const path = `${change?.path ?? ""}`.trim();
      if (!path.startsWith("system.")) continue;

      const changeKind = `${change?.kind ?? "number"}`.trim().toLowerCase();
      if (changeKind === "boolean") {
        updates[path] = Boolean(change?.previousValue);
        continue;
      }

      const amountApplied = toNumber(change?.amountApplied, 0);
      if (amountApplied === 0) continue;

      const minValue = Number(change?.min);
      const maxValue = Number(change?.max);
      const min = Number.isFinite(minValue) ? minValue : 0;
      const max = Number.isFinite(maxValue) ? maxValue : 999;
      const currentValue = toNumber(foundry.utils.getProperty(this, path), 0);
      const nextValue = clamp(currentValue - amountApplied, min, max);
      if (nextValue === currentValue) continue;
      updates[path] = nextValue;
    }

    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
  }

  async _applyCombatStatEffectToActor(effect, targetActor, sourceMove = null) {
    const amount = Math.floor(toNumber(effect.amount, 0));
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const validCombatStats = ["accuracy", "damage", "evasion", "clash"];
    const statKey = `${effect.stat ?? ""}`.trim();
    if (!validCombatStats.includes(statKey)) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
    }

    return this._applyTemporaryTrackedModifier({
      targetActor,
      path: `system.combatProfile.${statKey}`,
      amount,
      min: 0,
      max: 99,
      label: this._formatSecondaryEffectLabel(effect),
      sourceMove,
      detailLabel: this._localizeSecondaryStatName(statKey),
      durationMode: effect.durationMode,
      durationRounds: effect.durationRounds,
      specialDuration: effect.specialDuration
    });
  }

  async _applyWillEffectToActor(effect, targetActor) {
    const maxWill = Math.max(toNumber(targetActor.system.resources?.will?.max, 1), 1);
    const currentWill = Math.max(toNumber(targetActor.system.resources?.will?.value, 0), 0);
    const rawAmount = Math.floor(toNumber(effect.amount, 0));
    // Negative values <= -2 are treated as percentage reduction (e.g. -50 = lose 50% of current will)
    const amount = rawAmount <= -2
      ? -Math.ceil(currentWill * Math.abs(rawAmount) / 100)
      : rawAmount;
    if (amount === 0) {
      return { applied: false, detail: game.i18n.localize("POKROLE.Common.None") };
    }

    const nextWill = clamp(currentWill + amount, 0, maxWill);
    if (nextWill === currentWill) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectNoStatChange")
      };
    }
    await targetActor.update({ "system.resources.will.value": nextWill });
    return {
      applied: true,
      detail: `${currentWill} -> ${nextWill}`
    };
  }

  async _applyWeatherEffect(effect, sourceMove = null) {
    const weatherKey = this._normalizeSecondaryWeatherKey(effect.weather);
    if (!game.combat) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.CombatRequired")
      };
    }

    const durationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "weather");
    const durationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    const weatherDurationRounds = durationMode === "rounds" ? durationRounds : 0;
    const payload = await this.setActiveWeather(weatherKey, {
      durationRounds: weatherDurationRounds,
      sourceMoveId: sourceMove?.id ?? null
    });
    if (!payload) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }

    const durationLabel =
      durationMode === "rounds"
        ? game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: weatherDurationRounds
          })
        : game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return {
      applied: true,
      detail: `${this._localizeSecondaryWeatherName(weatherKey)} (${durationLabel})`
    };
  }

  async _applyTerrainEffect(effect, sourceMove = null) {
    const terrainKey = this._normalizeSecondaryTerrainKey(effect.terrain);
    if (!game.combat) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Errors.CombatRequired")
      };
    }

    // Abilities can always set terrain (no move validation needed)
    const isAbilitySource = `${sourceMove?.type ?? ""}`.trim().toLowerCase() === "ability";
    const runtimeRule = this._getTerrainRuntimeMoveRule(sourceMove);
    const moveTargetKey = this._normalizeMoveTargetKey(sourceMove?.system?.target);
    const movePrimaryMode = this._normalizeMovePrimaryMode(sourceMove?.system?.primaryMode);
    const canCreateTerrain =
      isAbilitySource ||
      Boolean(runtimeRule?.terrainScope) ||
      ["battlefield", "ally-battlefield", "foe-battlefield", "battlefield-area"].includes(moveTargetKey) ||
      movePrimaryMode === "effect-only";
    if (!canCreateTerrain) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectConditionNotMet")
      };
    }
    const durationMode = this._normalizeSecondaryDurationMode(effect.durationMode, "terrain");
    const durationRounds = this._normalizeSecondaryDurationRounds(effect.durationRounds);
    const terrainDurationRounds = durationMode === "rounds" ? durationRounds : 0;
    const terrainTargetReference =
      moveTargetKey === "foe-battlefield"
        ? this._getOpposingCombatSideReference(this, game.combat)
        : this._getActorCombatSideReference(this, game.combat);
    const terrainScope = this._normalizeTerrainScope(
      runtimeRule?.terrainScope ??
        (["ally-battlefield", "foe-battlefield"].includes(moveTargetKey)
          ? "side"
          : "battlefield")
    );
    const payload = await this.setActiveTerrain(terrainKey, {
      durationRounds: terrainDurationRounds,
      scope: terrainScope,
      sideKey: terrainScope === "side" ? terrainTargetReference.sideKey : null,
      sideDisposition: terrainScope === "side" ? terrainTargetReference.sideDisposition : null,
      sourceMoveId: sourceMove?.id ?? null,
      sourceMoveName: sourceMove?.name ?? ""
    });
    if (!payload) {
      return {
        applied: false,
        detail: game.i18n.localize("POKROLE.Chat.SecondaryEffectFailed")
      };
    }
    await this.synchronizeTerrainEffectsForCombat();

    const durationLabel =
      durationMode === "rounds"
        ? game.i18n.format("POKROLE.TemporaryEffects.DurationRoundsWithValue", {
            rounds: terrainDurationRounds
          })
        : game.i18n.localize("POKROLE.TemporaryEffects.DurationManual");
    return {
      applied: true,
      detail: `${this._localizeSecondaryTerrainName(terrainKey)} (${durationLabel})${
        terrainScope === "side"
          ? ` - ${game.i18n.localize("POKROLE.Chat.TerrainScopeSide")}`
          : ` - ${game.i18n.localize("POKROLE.Chat.TerrainScopeBattlefield")}`
      }`
    };
  }

  async _safeApplyHeal(targetActor, healAmount, options = {}) {
    const normalizedHeal = Math.max(toNumber(healAmount, 0), 0);
    if (!targetActor || normalizedHeal <= 0) {
      return null;
    }

    if (targetActor instanceof PokRoleActor) {
      const healingBlockExpiration = await targetActor._clearHealingBlockIfExpired();
      if (healingBlockExpiration > 0) {
        return { hpBefore: Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0), hpAfter: Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0), healedApplied: 0, healingBlocked: true };
      }
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healingCategory = this._normalizeHealingCategory(options?.healingCategory);
    let allowedHeal = normalizedHeal;
    let track = null;
    if (game.combat && targetActor instanceof PokRoleActor && options?.ignoreBattleLimit !== true) {
      track = targetActor._getHealingTrack();
      const perRoundLimit = this._getHealingRoundLimit(healingCategory);
      const remainingHeal = Math.max(perRoundLimit - track.healedThisRound, 0);
      allowedHeal = Number.isFinite(perRoundLimit)
        ? Math.min(allowedHeal, remainingHeal)
        : allowedHeal;
    }

    const hpAfter = Math.min(hpValue + allowedHeal, hpMax);
    const healedApplied = Math.max(hpAfter - hpValue, 0);
    if (hpAfter === hpValue) {
      return { hpBefore: hpValue, hpAfter, healedApplied: 0 };
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
      if (track && healedApplied > 0) {
        track.healedThisRound += healedApplied;
        if (healingCategory !== "standard") {
          track.completeHealedThisRound += healedApplied;
        }
        await targetActor._setHealingTrack(track);
      }
      if (options?.restoreAwareness && hpAfter > 0 && typeof targetActor.toggleQuickCondition === "function") {
        await targetActor.toggleQuickCondition("fainted", { active: false });
      }
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply heal`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    }

    return {
      hpBefore: hpValue,
      hpAfter,
      healedApplied
    };
  }

  async useGearItem(itemId, options = {}) {
    const gearItem = this.items.get(itemId);
    if (!gearItem || gearItem.type !== "gear") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.UnknownGear"));
      return null;
    }

    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const pocket = `${gearItem.system.pocket ?? "main"}`.toLowerCase();
    const pocketUsableInBattle = pocket === "potions" || pocket === "small";
    if (game.combat && (!pocketUsableInBattle || !gearItem.system.canUseInBattle)) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearNotUsableInBattle"));
      return null;
    }

    const targetActor = options.targetActor ?? getTargetActorFromUserSelection() ?? this;
    if (gearItem.system.target === "trainer" && targetActor.type !== "trainer") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }
    if (gearItem.system.target === "pokemon" && targetActor.type !== "pokemon") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearWrongTarget"));
      return null;
    }

    const hpBefore = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpMax = Math.max(toNumber(targetActor.system.resources?.hp?.max, 1), 1);
    const healsFullHp = gearItem.system.heal?.fullHp ?? false;
    const healHpValue = Math.max(toNumber(gearItem.system.heal?.hp, 0), 0);
    const healingAmount = healsFullHp ? Math.max(hpMax - hpBefore, 0) : healHpValue;
    const healingCategory = this._resolveGearHealingCategory(gearItem);
    const healResult = await this._safeApplyHeal(targetActor, healingAmount, {
      healingCategory,
      restoreAwareness: Boolean(gearItem.system.heal?.restoreAwareness)
    });
    const hpAfter = Math.max(toNumber(healResult?.hpAfter, hpBefore), hpBefore);
    const healedAmount = Math.max(toNumber(healResult?.healedApplied, hpAfter - hpBefore), 0);

    const statusCures = [];
    const clearCondition = async (conditionKey) => {
      if (typeof targetActor.toggleQuickCondition !== "function") return;
      if (!targetActor._isConditionActive?.(conditionKey)) return;
      await targetActor.toggleQuickCondition(conditionKey, { active: false });
      statusCures.push(conditionKey);
    };
    if (gearItem.system.status?.all) {
      for (const conditionKey of CONDITION_KEYS) {
        await clearCondition(conditionKey);
      }
    } else {
      const statusMap = [
        ["poison", "poisoned"],
        ["sleep", "sleep"],
        ["burn", "burn"],
        ["frozen", "frozen"],
        ["paralysis", "paralyzed"],
        ["confusion", "confused"]
      ];
      for (const [fieldKey, conditionKey] of statusMap) {
        if (!gearItem.system.status?.[fieldKey]) continue;
        await clearCondition(conditionKey);
      }
    }

    const consumeResult = gearItem.system.consumable ? await this._consumeGearItem(gearItem) : null;
    const statusEffects = this._getGearStatusEffects(gearItem).map((statusKey) =>
      game.i18n.localize(`POKROLE.Gear.Status.${statusKey}`)
    );

    const notes = [];
    const healLethalValue = Math.max(toNumber(gearItem.system.heal?.lethal, 0), 0);
    if (healLethalValue > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearLethalHealNote", {
          value: healLethalValue
        })
      );
    }
    if (gearItem.system.heal?.restoreAwareness) {
      notes.push(game.i18n.localize("POKROLE.Chat.GearAwarenessNote"));
    }
    if (statusEffects.length > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearStatusNote", {
          value: statusEffects.join(", ")
        })
      );
    }
    if (statusCures.length > 0) {
      notes.push(
        game.i18n.format("POKROLE.Chat.GearStatusCured", {
          value: statusCures.map((key) => this._localizeConditionName(key)).join(", ")
        })
      );
    }

    const stockLabel = consumeResult
      ? consumeResult.unitsMax > 0
        ? `${consumeResult.quantity} x (${consumeResult.unitsValue}/${consumeResult.unitsMax})`
        : `${consumeResult.quantity}`
      : game.i18n.localize("POKROLE.Common.None");

    const content = `
      <div class="pok-role-chat-card">
        <h3>${game.i18n.localize("POKROLE.Chat.GearUsed")}: ${gearItem.name}</h3>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Actor")}:</strong> ${this.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.Target")}:</strong> ${targetActor.name}</p>
        <p><strong>${game.i18n.localize("POKROLE.Gear.HealHp")}:</strong> +${healedAmount}</p>
        <p><strong>${game.i18n.localize("POKROLE.Chat.TargetHP")}:</strong> ${hpBefore} -> ${hpAfter}</p>
        ${
          consumeResult
            ? `<p><strong>${game.i18n.localize("POKROLE.Gear.Stock")}:</strong> ${stockLabel}</p>`
            : ""
        }
        ${
          notes.length > 0
            ? `<hr /><p>${notes.join("<br />")}</p>`
            : ""
        }
      </div>
    `;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content
    });

    return {
      targetActor,
      hpBefore,
      hpAfter,
      healedAmount,
      consumeResult
    };
  }

  async trainerUseItemOnPokemon(options = {}) {
    if (this.type !== "trainer") return null;
    const targetActor = options.targetActor ?? getTargetActorFromUserSelection();
    if (!targetActor || targetActor.type !== "pokemon") {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerItemNeedsPokemonTarget"));
      return null;
    }

    const candidateItems = this.items
      .filter((item) => item.type === "gear")
      .filter((item) => Boolean(item.system?.canUseInBattle))
      .filter((item) => Math.max(toNumber(item.system?.quantity, 0), 0) > 0);
    if (!candidateItems.length) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerNoBattleItems"));
      return null;
    }

    let selectedItemId = `${options.itemId ?? ""}`.trim();
    if (!selectedItemId) {
      const chosen = await new Promise((resolve) => {
        new Dialog({
          title: game.i18n.localize("POKROLE.Combat.TrainerActions.UseItemOnPokemon"),
          content: `
            <form class="pok-role-combined-roll">
              <div class="form-group">
                <label>${game.i18n.localize("POKROLE.Fields.Name")}</label>
                <select name="itemId">
                  ${candidateItems
                    .map((item) => `<option value="${item.id}">${item.name}</option>`)
                    .join("")}
                </select>
              </div>
            </form>
          `,
          buttons: {
            confirm: {
              icon: "<i class='fas fa-check'></i>",
              label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
              callback: (dialogHtml) => resolve(dialogHtml?.[0]?.querySelector("select[name='itemId']")?.value ?? "")
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
      selectedItemId = `${chosen ?? ""}`.trim();
    }
    if (!selectedItemId) return null;

    const medicineRoll = await this._rollSuccessPool({
      dicePool: this.getTraitValue("clever") + this.getSkillValue("medicine"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.TrainerUseItemRoll", { actor: this.name })
    });
    if (!medicineRoll?.success) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerItemCheckFailed"));
      return null;
    }

    const result = await this.useGearItem(selectedItemId, { targetActor });
    if (!result) return null;

    if (game.combat && !this.isTrainerInFray()) {
      const blockedRoundKey = this._getCurrentRoundKey(1);
      if (blockedRoundKey) {
        await targetActor.setFlag(POKROLE.ID, TREATMENT_BLOCK_FLAG_KEY, blockedRoundKey);
      }
    }
    return result;
  }

  async trainerSearchForCover() {
    if (this.type !== "trainer") return null;
    if (this.isTrainerInFray()) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.TrainerCannotSearchCoverInFray"));
      return null;
    }

    // Step 1: Roll Insight + Alert with 1 required success to find cover
    const result = await this._rollSuccessPool({
      dicePool: this.getTraitValue("insight") + this.getSkillValue("alert"),
      removedSuccesses: this.getPainPenalty(),
      requiredSuccesses: 1,
      flavor: game.i18n.format("POKROLE.Chat.TrainerSearchCoverRoll", { actor: this.name })
    });
    if (!result?.success) return result;

    // Step 2: If roll succeeded, show dialog to choose cover level
    const coverLevel = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.TrainerActions.SearchForCover"),
        content: `
          <form class="pok-role-combined-roll">
            <div class="form-group">
              <label>${game.i18n.localize("POKROLE.Combat.SearchCoverLevel")}</label>
              <select name="coverLevel">
                <option value="quarter">${game.i18n.localize("POKROLE.Combat.CoverQuarter")} (+1 DEF/SDEF vs ranged)</option>
                <option value="half">${game.i18n.localize("POKROLE.Combat.CoverHalf")} (+2 DEF/SDEF vs ranged)</option>
                <option value="full">${game.i18n.localize("POKROLE.Combat.CoverFull")} (${game.i18n.localize("POKROLE.Combat.CoverFullDesc")})</option>
              </select>
            </div>
          </form>
        `,
        buttons: {
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("POKROLE.Common.Confirm"),
            callback: (html) => resolve(html.find("[name='coverLevel']").val())
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("POKROLE.Common.Cancel"),
            callback: () => resolve(null)
          }
        },
        default: "ok"
      }).render(true);
    });

    if (!coverLevel) return null;

    await this.setTrainerCover(coverLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(coverLevel)
      })
    );
    return result;
  }

  async trainerTakeCover(level = "half") {
    if (this.type !== "trainer") return null;
    const resolvedLevel = `${level ?? "half"}`.trim().toLowerCase();
    const targetLevel = ["full", "half", "quarter", "none"].includes(resolvedLevel)
      ? resolvedLevel
      : "half";
    await this.setTrainerCover(targetLevel);
    ui.notifications.info(
      game.i18n.format("POKROLE.Chat.CoverSet", {
        level: this._localizeCoverLevel(targetLevel)
      })
    );
    return targetLevel;
  }

  async trainerEnterFray(options = {}) {
    if (this.type !== "trainer") return null;
    const active = options.active === undefined ? !this.isTrainerInFray() : Boolean(options.active);
    await this.setTrainerInFray(active);

    if (active) {
      const combat = game.combat;
      if (combat) {
        const existingCombatant = combat.combatants.find((c) => c.actor?.id === this.id);
        if (!existingCombatant) {
          const tokenDoc = this.getActiveTokens(true)?.[0]?.document ?? null;
          const combatantData = tokenDoc
            ? { tokenId: tokenDoc.id, sceneId: tokenDoc.parent?.id, actorId: this.id }
            : { actorId: this.id };
          await combat.createEmbeddedDocuments("Combatant", [combatantData]);
        }
        await this.rollInitiative();
      }
    } else {
      const combat = game.combat;
      if (combat) {
        const existingCombatant = combat.combatants.find((c) => c.actor?.id === this.id);
        if (existingCombatant) {
          await combat.deleteEmbeddedDocuments("Combatant", [existingCombatant.id]);
        }
      }
    }

    ui.notifications.info(
      game.i18n.localize(
        active ? "POKROLE.Chat.TrainerEnteredFray" : "POKROLE.Chat.TrainerLeftFray"
      )
    );
    return active;
  }

  async trainerRunAwayFromBattle(options = {}) {
    if (this.type !== "trainer") return null;
    const combat = game.combat;
    if (!combat) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.CombatRequired"));
      return null;
    }
    const foeActor = options.foeActor ?? this._resolveRunAwayFoeActor();
    if (!foeActor) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.NoRunAwayOpponent"));
      return null;
    }

    const selfRoll = await new Roll(
      successPoolFormula(this.getTraitValue("dexterity") + this.getSkillValue("athletic"))
    ).evaluate();
    const foeRoll = await new Roll(
      successPoolFormula(foeActor.getTraitValue("dexterity") + foeActor.getSkillValue("athletic"))
    ).evaluate();
    const selfNet = toNumber(selfRoll.total, 0) - this.getPainPenalty();
    const foeNet = toNumber(foeRoll.total, 0) - foeActor.getPainPenalty();
    const escaped = selfNet > foeNet;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      content: `
        <div class="pok-role-chat-card">
          <h3>${game.i18n.localize("POKROLE.Combat.TrainerActions.RunAway")}</h3>
          <p><strong>${this.name}</strong>: ${selfNet}</p>
          <p><strong>${foeActor.name}</strong>: ${foeNet}</p>
          <p><strong>${game.i18n.localize("POKROLE.Chat.Result")}:</strong> ${
            escaped
              ? game.i18n.localize("POKROLE.Chat.RunAwaySuccess")
              : game.i18n.localize("POKROLE.Chat.RunAwayFailed")
          }</p>
        </div>
      `
    });

    if (escaped && game.user?.isGM) {
      const partyPokemonIds = this.system.party ?? [];
      const combatantIdsToRemove = [];
      for (const combatant of combat.combatants) {
        if (!combatant.actor) continue;
        if (combatant.actor.id === this.id || partyPokemonIds.includes(combatant.actor.id)) {
          combatantIdsToRemove.push(combatant.id);
        }
      }
      if (combatantIdsToRemove.length > 0) {
        await combat.deleteEmbeddedDocuments("Combatant", combatantIdsToRemove);
      }

      const remainingCombatants = combat.combatants.size;
      if (remainingCombatants <= 1) {
        await combat.update({ active: false });
      }
    }

    return { escaped, selfNet, foeNet, foeActor };
  }

  _resolveRunAwayFoeActor() {
    const target = getTargetActorFromUserSelection();
    if (target && target.id !== this.id) return target;
    const combatants = game.combat?.combatants ?? [];
    for (const combatant of combatants) {
      const actor = combatant.actor;
      if (!actor || actor.id === this.id) continue;
      return actor;
    }
    return null;
  }

  hasType(typeKey) {
    const normalizedType = this._normalizeTypeKey(typeKey);
    const primary = this._normalizeTypeKey(this.system.types?.primary || "none");
    const secondary = this._normalizeTypeKey(this.system.types?.secondary || "none");
    return normalizedType === primary || normalizedType === secondary;
  }

  localizeTrait(traitKey) {
    const labelPath = TRAIT_LABEL_BY_KEY[traitKey] || "POKROLE.Common.Unknown";
    return game.i18n.localize(labelPath);
  }

  async _resolveDefensiveReaction({
    targetActor,
    move,
    roundKey,
    netAccuracySuccesses
  }) {
    const socialAccuracyMove = this._isSocialAccuracyMove(move);
    const moveCanBeEvaded = !socialAccuracyMove && !move.system.neverFail;
    const moveCanBeClashed = !socialAccuracyMove && this._moveCanBeClashed(move);
    const incomingMoveCategory = this._normalizeMoveCombatCategory(move?.system?.category);
    if (
      targetActor instanceof PokRoleActor &&
      targetActor._hasActiveBideState?.() &&
      ["physical", "special"].includes(incomingMoveCategory)
    ) {
      return {
        attempted: false,
        type: "none",
        success: false,
        evaded: false,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: 0,
        attackerDamage: 0,
        targetDamage: 0,
        label: "POKROLE.Chat.Reaction.None"
      };
    }

    const choice = await this._promptDefensiveReaction({
      targetActor,
      move,
      roundKey,
      moveCanBeEvaded,
      moveCanBeClashed,
      incomingMoveCategory
    });

    if (!choice || choice.type === "none") {
      return {
        attempted: false,
        type: "none",
        success: false,
        evaded: false,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: 0,
        attackerDamage: 0,
        targetDamage: 0,
        label: "POKROLE.Chat.Reaction.None"
      };
    }

    if (choice.type === "evasion") {
      const evasionResult = await targetActor.rollEvasion(null, { roundKey });
      if (!evasionResult) {
        return {
          attempted: true,
          type: "evasion",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.EvasionFailed"
        };
      }

      const success = evasionResult.netSuccesses >= netAccuracySuccesses;
      return {
        attempted: true,
        type: "evasion",
        success,
        evaded: success,
        clashResolved: false,
        clashMoveName: "",
        netSuccesses: evasionResult.netSuccesses,
        attackerDamage: 0,
        targetDamage: 0,
        label: success
          ? "POKROLE.Chat.Reaction.EvasionSuccess"
          : "POKROLE.Chat.Reaction.EvasionFailed"
      };
    }

    if (choice.type === "clash") {
      const clashResult = await targetActor.rollClash(choice.clashMoveId, null, {
        roundKey,
        expectedCategory: incomingMoveCategory
      });
      if (!clashResult) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: "",
          netSuccesses: 0,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const success = clashResult.netSuccesses >= netAccuracySuccesses;
      if (!success) {
        return {
          attempted: true,
          type: "clash",
          success: false,
          evaded: false,
          clashResolved: false,
          clashMoveName: clashResult.move?.name ?? "",
          netSuccesses: clashResult.netSuccesses,
          attackerDamage: 0,
          targetDamage: 0,
          label: "POKROLE.Chat.Reaction.ClashFailed"
        };
      }

      const defenderDamage = this._computeClashDamage(move.system.type, targetActor);
      const attackerDamage = this._computeClashDamage(
        clashResult.move?.system?.type ?? "normal",
        this
      );
      await this._safeApplyDamage(targetActor, defenderDamage);
      await this._safeApplyDamage(this, attackerDamage);

      return {
        attempted: true,
        type: "clash",
        success: true,
        evaded: false,
        clashResolved: true,
        clashMoveName: clashResult.move?.name ?? "",
        netSuccesses: clashResult.netSuccesses,
        attackerDamage,
        targetDamage: defenderDamage,
        label: "POKROLE.Chat.Reaction.ClashSuccess"
      };
    }

    return {
      attempted: false,
      type: "none",
      success: false,
      evaded: false,
      clashResolved: false,
      clashMoveName: "",
      netSuccesses: 0,
      attackerDamage: 0,
      targetDamage: 0,
      label: "POKROLE.Chat.Reaction.None"
    };
  }

  async _promptDefensiveReaction({
    targetActor,
    move,
    roundKey,
    moveCanBeEvaded,
    moveCanBeClashed,
    incomingMoveCategory = "support"
  }) {
    const canUseEvasion =
      moveCanBeEvaded && targetActor._canUseReactionThisRound("evasion", roundKey);
    const requiredClashCategory = this._normalizeMoveCombatCategory(incomingMoveCategory);
    const clashMoves = targetActor.items
      .filter((item) => {
        if (item.type !== "move") return false;
        if (!targetActor._moveUsesPrimaryDamage(item)) return false;
        return this._normalizeMoveCombatCategory(item.system?.category) === requiredClashCategory;
      });
    const canUseClash =
      moveCanBeClashed &&
      (requiredClashCategory === "physical" || requiredClashCategory === "special") &&
      targetActor._canUseReactionThisRound("clash", roundKey) &&
      clashMoves.length > 0;

    if (!canUseEvasion && !canUseClash) {
      return { type: "none" };
    }

    const content = `
      <form class="pok-role-reaction-dialog">
        <p class="dialog-intro">
          ${game.i18n.format("POKROLE.Combat.ReactionPrompt", {
            target: targetActor.name,
            move: move.name
          })}
        </p>
        <label class="trait-option compact">
          <input type="radio" name="reactionType" value="none" checked />
          <span>${game.i18n.localize("POKROLE.Chat.Reaction.None")}</span>
        </label>
        ${
          canUseEvasion
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="evasion" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseEvasion")}</span>
          </label>
        `
            : ""
        }
        ${
          canUseClash
            ? `
          <label class="trait-option compact">
            <input type="radio" name="reactionType" value="clash" />
            <span>${game.i18n.localize("POKROLE.Chat.Reaction.UseClash")}</span>
          </label>
          <div class="form-group nested">
            <label>${game.i18n.localize("POKROLE.Combat.ClashMove")}</label>
            <select name="clashMoveId">
              ${clashMoves
                .map((clashMove) => `<option value="${clashMove.id}">${clashMove.name}</option>`)
                .join("")}
            </select>
          </div>
        `
            : ""
        }
      </form>
    `;

    const html = await new Promise((resolve) => {
      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.ReactionTitle"),
        content,
        buttons: {
          confirm: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
            callback: (dialogHtml) => resolve(dialogHtml)
          },
          skip: {
            icon: "<i class='fas fa-forward'></i>",
            label: game.i18n.localize("POKROLE.Combat.SkipReaction"),
            callback: () => resolve(null)
          }
        },
        default: "confirm",
        close: () => resolve(null)
      }, { classes: ["pok-role-dialog", "pok-role-reaction-app"] }).render(true);
    });

    if (!html) return { type: "none" };
    const form = html[0]?.querySelector("form");
    if (!form) return { type: "none" };

    const type = form.querySelector("input[name='reactionType']:checked")?.value ?? "none";
    const clashMoveId = form.querySelector("select[name='clashMoveId']")?.value ?? "";
    return { type, clashMoveId };
  }

  async _resolveHoldingBackChoice(move, options = {}) {
    if (!move || move.type !== "move" || !this._moveUsesPrimaryDamage(move)) {
      return "none";
    }

    const normalizedOption = `${options.holdingBack ?? ""}`.trim().toLowerCase();
    if (normalizedOption === "none" || normalizedOption === "half" || normalizedOption === "lethal") {
      return normalizedOption;
    }

    if (options.promptHoldingBack === false) {
      return "none";
    }

    return new Promise((resolve) => {
      const buttons = {
        normal: {
          icon: "<i class='fas fa-check'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackNormal"),
          callback: () => resolve("none")
        },
        half: {
          icon: "<i class='fas fa-hand-paper'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackHalf"),
          callback: () => resolve("half")
        },
        lethal: {
          icon: "<i class='fas fa-skull'></i>",
          label: game.i18n.localize("POKROLE.Combat.HoldingBackLethal"),
          callback: () => resolve("lethal")
        }
      };

      new Dialog({
        title: game.i18n.localize("POKROLE.Combat.HoldingBackTitle"),
        content: `
          <div class="pok-role-holding-back-dialog">
            <p class="dialog-intro">${game.i18n.format("POKROLE.Combat.HoldingBackPrompt", {
              move: move.name
            })}</p>
          </div>
        `,
        buttons,
        default: "normal",
        close: () => resolve("none")
      }, { classes: ["pok-role-dialog", "pok-role-holding-back-app"] }).render(true);
    });
  }

  _getShieldMoveAccuracyPenalty(roundKey = null) {
    const state = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
    const currentRoundKey = roundKey ?? this._getCurrentRoundKey(0);
    if (!currentRoundKey) return 0;
    const lastRoundKey = `${state?.lastRoundKey ?? ""}`.trim();
    const streak = Math.max(Math.floor(toNumber(state?.streak, 0)), 0);
    if (!lastRoundKey || !streak) return 0;
    const [combatId, roundText] = currentRoundKey.split(":");
    const [lastCombatId, lastRoundText] = lastRoundKey.split(":");
    if (!combatId || !lastCombatId || combatId !== lastCombatId) return 0;
    const currentRound = Math.floor(toNumber(roundText, 0));
    const lastRound = Math.floor(toNumber(lastRoundText, 0));
    if (currentRound - lastRound !== 1) return 0;
    return Math.max(streak, 0) * 2;
  }

  async _registerShieldMoveUsage(roundKey = null) {
    const currentRoundKey = roundKey ?? this._getCurrentRoundKey(0);
    if (!currentRoundKey) return;
    const state = this.getFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY) ?? {};
    const lastRoundKey = `${state?.lastRoundKey ?? ""}`.trim();
    let nextStreak = 1;
    const [combatId, roundText] = currentRoundKey.split(":");
    const [lastCombatId, lastRoundText] = lastRoundKey.split(":");
    if (combatId && lastCombatId && combatId === lastCombatId) {
      const currentRound = Math.floor(toNumber(roundText, 0));
      const lastRound = Math.floor(toNumber(lastRoundText, 0));
      if (currentRound - lastRound === 1) {
        nextStreak = Math.max(Math.floor(toNumber(state?.streak, 0)), 0) + 1;
      }
    }
    await this.setFlag(POKROLE.ID, SHIELD_STREAK_FLAG_KEY, {
      lastRoundKey: currentRoundKey,
      streak: nextStreak
    });
  }

  _normalizeShieldMoveProfile(profile = {}) {
    const normalizedCategories = Array.isArray(profile?.protectsCategories)
      ? profile.protectsCategories
          .map((entry) => this._normalizeMoveCombatCategory(entry))
          .filter((entry) => entry === "physical" || entry === "special")
      : [];
    const retaliation = profile?.retaliation && typeof profile.retaliation === "object"
      ? {
          mode: ["condition", "stat", "damage"].includes(`${profile.retaliation.mode ?? ""}`.trim().toLowerCase())
            ? `${profile.retaliation.mode}`.trim().toLowerCase()
            : "damage",
          condition: this._normalizeConditionVariantKey(profile.retaliation.condition),
          stat: this._normalizeSecondaryStatKey(profile.retaliation.stat),
          amount: Math.floor(toNumber(profile.retaliation.amount, 0)),
          ignoreDefenses: Boolean(profile.retaliation.ignoreDefenses)
        }
      : null;
    return {
      damageReduction: Math.max(Math.floor(toNumber(profile?.damageReduction, 0)), 0),
      protectsCategories: [...new Set(normalizedCategories)],
      requiresPriority: Boolean(profile?.requiresPriority),
      blocksAddedEffects: Boolean(profile?.blocksAddedEffects),
      blockEffectsRequiresPriority: Boolean(profile?.blockEffectsRequiresPriority),
      endureAtOne: Boolean(profile?.endureAtOne),
      retaliation
    };
  }

  _buildShieldMoveProfile(move) {
    if (!move || !move.system?.shieldMove) return null;

    const seedId = this._getMoveSeedId(move);
    const rawDescription = `${move.system?.description ?? ""}`.trim();
    const lowerDescription = rawDescription.toLowerCase();
    const overrideProfile = seedId ? SHIELD_MOVE_PROFILE_OVERRIDES[seedId] ?? null : null;
    const genericProfile = {
      damageReduction: 0,
      protectsCategories: [],
      requiresPriority: false,
      blocksAddedEffects: false,
      blockEffectsRequiresPriority: false,
      endureAtOne: false,
      retaliation: null
    };

    const reductionMatch = /reduce\s+(\d+)\s+damage/i.exec(rawDescription);
    if (reductionMatch) {
      genericProfile.damageReduction = Math.max(Math.floor(toNumber(reductionMatch[1], 0)), 0);
    } else if (lowerDescription.includes("shield move")) {
      genericProfile.damageReduction = 3;
    }

    if (
      lowerDescription.includes("physical or special move") ||
      lowerDescription.includes("damaging move")
    ) {
      genericProfile.protectsCategories = ["physical", "special"];
    }

    if (lowerDescription.includes("with priority")) {
      genericProfile.requiresPriority = true;
    }

    if (lowerDescription.includes("negate the added effects")) {
      genericProfile.blocksAddedEffects = true;
      genericProfile.blockEffectsRequiresPriority = lowerDescription.includes("reaction and late reaction");
    }

    if (lowerDescription.includes("remain at 1 hp")) {
      genericProfile.endureAtOne = true;
    }

    return this._normalizeShieldMoveProfile({
      ...genericProfile,
      ...(overrideProfile ?? {})
    });
  }

  _normalizeShieldEntry(entry = {}) {
    const roundKey = `${entry?.roundKey ?? ""}`.trim();
    return {
      id: `${entry?.id ?? foundry.utils.randomID()}`.trim(),
      roundKey,
      sourceActorId: `${entry?.sourceActorId ?? ""}`.trim(),
      sourceActorName: `${entry?.sourceActorName ?? ""}`.trim(),
      moveId: `${entry?.moveId ?? ""}`.trim(),
      moveName: `${entry?.moveName ?? ""}`.trim(),
      moveSeedId: `${entry?.moveSeedId ?? ""}`.trim().toLowerCase(),
      damageReduction: Math.max(Math.floor(toNumber(entry?.damageReduction, 0)), 0),
      protectsCategories: Array.isArray(entry?.protectsCategories)
        ? [...new Set(entry.protectsCategories
            .map((value) => this._normalizeMoveCombatCategory(value))
            .filter((value) => value === "physical" || value === "special"))]
        : [],
      requiresPriority: Boolean(entry?.requiresPriority),
      blocksAddedEffects: Boolean(entry?.blocksAddedEffects),
      blockEffectsRequiresPriority: Boolean(entry?.blockEffectsRequiresPriority),
      endureAtOne: Boolean(entry?.endureAtOne),
      endureSpent: Boolean(entry?.endureSpent),
      retaliation:
        entry?.retaliation && typeof entry.retaliation === "object"
          ? {
              mode: ["condition", "stat", "damage"].includes(`${entry.retaliation.mode ?? ""}`.trim().toLowerCase())
                ? `${entry.retaliation.mode}`.trim().toLowerCase()
                : "damage",
              condition: this._normalizeConditionVariantKey(entry.retaliation.condition),
              stat: this._normalizeSecondaryStatKey(entry.retaliation.stat),
              amount: Math.floor(toNumber(entry.retaliation.amount, 0)),
              ignoreDefenses: Boolean(entry.retaliation.ignoreDefenses)
            }
          : null
    };
  }

  _getActiveShieldEntries(roundKey = null) {
    const targetRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    const rawEntries = this.getFlag(POKROLE.ID, ACTIVE_SHIELDS_FLAG_KEY) ?? [];
    const normalizedEntries = (Array.isArray(rawEntries) ? rawEntries : [])
      .map((entry) => this._normalizeShieldEntry(entry))
      .filter((entry) => entry.roundKey);
    if (!targetRoundKey) return normalizedEntries;
    return normalizedEntries.filter((entry) => entry.roundKey === targetRoundKey);
  }

  async _setActiveShieldEntries(entries = []) {
    const normalizedEntries = (Array.isArray(entries) ? entries : [])
      .map((entry) => this._normalizeShieldEntry(entry))
      .filter((entry) => entry.roundKey);
    await this.setFlag(POKROLE.ID, ACTIVE_SHIELDS_FLAG_KEY, normalizedEntries);
  }

  async _registerShieldProtectionFromMove(move, protectedActors = [], roundKey = null) {
    const currentRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey || !move?.system?.shieldMove) return null;

    const shieldProfile = this._buildShieldMoveProfile(move);
    const hasProtection =
      shieldProfile &&
      (shieldProfile.damageReduction > 0 ||
        shieldProfile.blocksAddedEffects ||
        shieldProfile.endureAtOne ||
        shieldProfile.retaliation);
    if (!hasProtection) return shieldProfile;

    const uniqueTargets = new Map();
    for (const actor of protectedActors ?? []) {
      const actorId = `${actor?.id ?? ""}`.trim();
      if (!actorId) continue;
      if (!uniqueTargets.has(actorId)) uniqueTargets.set(actorId, actor);
    }

    const entryPayload = {
      roundKey: currentRoundKey,
      sourceActorId: this.id,
      sourceActorName: this.name ?? "",
      moveId: move.id ?? "",
      moveName: move.name ?? "",
      moveSeedId: this._getMoveSeedId(move),
      damageReduction: shieldProfile.damageReduction,
      protectsCategories: shieldProfile.protectsCategories,
      requiresPriority: shieldProfile.requiresPriority,
      blocksAddedEffects: shieldProfile.blocksAddedEffects,
      blockEffectsRequiresPriority: shieldProfile.blockEffectsRequiresPriority,
      endureAtOne: shieldProfile.endureAtOne,
      retaliation: shieldProfile.retaliation
    };

    for (const protectedActor of uniqueTargets.values()) {
      if (!(protectedActor instanceof PokRoleActor)) continue;
      const currentEntries = protectedActor._getActiveShieldEntries(currentRoundKey).filter((entry) => {
        if (entry.moveId !== entryPayload.moveId) return true;
        return entry.sourceActorId !== entryPayload.sourceActorId;
      });
      currentEntries.push({
        ...entryPayload,
        id: foundry.utils.randomID()
      });
      await protectedActor._setActiveShieldEntries(currentEntries);
    }

    await this.unsetFlag(POKROLE.ID, "combat.shieldActiveRound");
    return shieldProfile;
  }

  _buildShieldAttackContext(move, attackerActor, roundKey = null, isDamagingMove = false) {
    const moveCategory = this._normalizeMoveCombatCategory(move?.system?.category);
    const movePriority = this._resolveEffectiveMovePriority(move, attackerActor ?? this);
    const moveSourceAttributes = this._getMoveSourceAttributes(move);
    const specialChargeRule = this._getSpecialChargeMoveRule(move);
    return {
      move,
      attackerActor,
      roundKey: `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim(),
      category: moveCategory,
      isDamagingMove: Boolean(isDamagingMove),
      isRanged: this._isMoveRanged(move),
      priority: movePriority,
      hasPriority: movePriority !== 0,
      destroysShield: Boolean(moveSourceAttributes?.destroyShield),
      ignoresShield: Boolean(specialChargeRule?.ignoresShield)
    };
  }

  _shieldEntryMatchesDamage(entry, attackContext) {
    if (!entry || !attackContext?.isDamagingMove) return false;
    if (!(attackContext.category === "physical" || attackContext.category === "special")) return false;
    if (!entry.protectsCategories.includes(attackContext.category)) return false;
    if (entry.requiresPriority && !attackContext.hasPriority) return false;
    return true;
  }

  _shieldEntryBlocksEffects(entry, attackContext) {
    if (!entry?.blocksAddedEffects) return false;
    if (entry.blockEffectsRequiresPriority && !attackContext?.hasPriority) return false;
    return true;
  }

  _shieldEntryCanRetaliate(entry, attackContext) {
    if (!entry?.retaliation) return false;
    if (!attackContext?.isDamagingMove) return false;
    if (attackContext.category !== "physical") return false;
    return !attackContext.isRanged;
  }

  async _resolveShieldResponseForAttack(attackContext = {}) {
    const currentRoundKey = `${attackContext?.roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey) {
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }

    const activeEntries = this._getActiveShieldEntries(currentRoundKey);
    if (!activeEntries.length) {
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }

    if (attackContext?.ignoresShield) {
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: false
      };
    }

    if (attackContext?.destroysShield) {
      await this._setActiveShieldEntries([]);
      return {
        entries: [],
        damageReduction: 0,
        blocksAddedEffects: false,
        endureEntry: null,
        retaliationEntries: [],
        shieldRemoved: true
      };
    }

    const damageEntries = activeEntries.filter((entry) => this._shieldEntryMatchesDamage(entry, attackContext));
    const effectEntries = activeEntries.filter((entry) => this._shieldEntryBlocksEffects(entry, attackContext));
    const endureEntry =
      damageEntries.find((entry) => entry.endureAtOne && !entry.endureSpent) ?? null;
    const retaliationEntries = damageEntries.filter((entry) => this._shieldEntryCanRetaliate(entry, attackContext));
    return {
      entries: [...new Set([...damageEntries, ...effectEntries])],
      damageReduction: damageEntries.reduce(
        (highest, entry) => Math.max(highest, Math.max(toNumber(entry.damageReduction, 0), 0)),
        0
      ),
      blocksAddedEffects: effectEntries.length > 0,
      endureEntry,
      retaliationEntries,
      shieldRemoved: false
    };
  }

  async _markShieldEndureSpent(entryId, roundKey = null) {
    const currentRoundKey = `${roundKey ?? this._getCurrentRoundKey(0) ?? ""}`.trim();
    if (!currentRoundKey || !entryId) return;
    const activeEntries = this._getActiveShieldEntries(currentRoundKey);
    const nextEntries = activeEntries.map((entry) =>
      entry.id === entryId ? { ...entry, endureSpent: true } : entry
    );
    await this._setActiveShieldEntries(nextEntries);
  }

  async _applyShieldRetaliations(response = {}, attackContext = {}) {
    const retaliationEntries = Array.isArray(response?.retaliationEntries)
      ? response.retaliationEntries
      : [];
    if (!retaliationEntries.length) return [];

    const attackerActor = attackContext?.attackerActor ?? null;
    if (!(attackerActor instanceof PokRoleActor)) return [];

    const retaliationDetails = [];
    for (const entry of retaliationEntries) {
      const retaliation = entry?.retaliation ?? null;
      if (!retaliation) continue;
      const shieldMoveDocument =
        entry.sourceActorId === this.id && this.items
          ? this.items.get(entry.moveId) ?? attackContext?.move
          : attackContext?.move;

      let applyResult = { applied: false, detail: game.i18n.localize("POKROLE.Common.Unknown") };
      if (retaliation.mode === "condition") {
        applyResult = await this._applyConditionEffectToActor(
          {
            effectType: "condition",
            condition: retaliation.condition,
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          attackerActor,
          shieldMoveDocument,
          {
            sourceActor: this
          }
        );
      } else if (retaliation.mode === "stat") {
        applyResult = await this._applyStatEffectToActor(
          {
            effectType: "stat",
            stat: retaliation.stat,
            amount: retaliation.amount,
            durationMode: "manual",
            durationRounds: 1,
            specialDuration: []
          },
          attackerActor,
          shieldMoveDocument
        );
      } else if (retaliation.mode === "damage") {
        const hpChange = await this._safeApplyDamage(
          attackerActor,
          Math.max(Math.floor(toNumber(retaliation.amount, 0)), 0)
        );
        applyResult = hpChange
          ? {
              applied: true,
              detail: game.i18n.format("POKROLE.Chat.SecondaryEffectHpChange", {
                before: hpChange.hpBefore,
                after: hpChange.hpAfter
              })
            }
          : { applied: false, detail: game.i18n.localize("POKROLE.Errors.HPUpdateFailed") };
      }

      retaliationDetails.push({
        shieldName: entry.moveName,
        targetName: attackerActor.name,
        applied: applyResult.applied,
        detail: applyResult.detail
      });
    }
    return retaliationDetails;
  }

  async _triggerDestinyBondOnKo(targetActor, options = {}) {
    if (!(targetActor instanceof PokRoleActor) || !game.combat) return false;
    const currentRound = Math.max(Math.floor(toNumber(game.combat.round, 0)), 0);
    const state = targetActor._getDestinyBondState?.() ?? { activeRound: 0, lastUsedRound: 0 };
    if (state.activeRound !== currentRound) return false;
    const sourceCategory = `${options?.sourceCategory ?? ""}`.trim().toLowerCase();
    if (!["physical", "special"].includes(sourceCategory)) return false;
    const sourceActor =
      options?.sourceActor instanceof PokRoleActor
        ? options.sourceActor
        : game.actors.get(`${options?.sourceActorId ?? ""}`.trim()) ?? null;
    if (!(sourceActor instanceof PokRoleActor)) return false;
    const sourceHp = Math.max(Math.floor(toNumber(sourceActor.system?.resources?.hp?.value, 0)), 0);
    if (sourceHp <= 0) return false;
    await this._safeApplyDamage(sourceActor, sourceHp, { applyDeadOnZero: false });
    await targetActor._setDestinyBondState({
      activeRound: 0,
      lastUsedRound: state.lastUsedRound
    });
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: targetActor }),
      content: `${targetActor.name}'s Destiny Bond brought down ${sourceActor.name}.`
    });
    return true;
  }

  _sanitizeShieldMoveSecondaryEffects(move, effectList = []) {
    if (!move?.system?.shieldMove || !Array.isArray(effectList) || effectList.length === 0) {
      return effectList;
    }
    const shieldProfile = this._buildShieldMoveProfile(move);
    const retaliation = shieldProfile?.retaliation ?? null;
    if (!retaliation) return effectList;

    return effectList.filter((effect) => {
      const targetMode = `${effect?.target ?? "target"}`.trim().toLowerCase();
      if (targetMode !== "self") return true;
      const effectType = this._normalizeSecondaryEffectType(effect?.effectType);
      if (retaliation.mode === "condition") {
        return !(effectType === "condition" && this._normalizeConditionVariantKey(effect?.condition) === retaliation.condition);
      }
      if (retaliation.mode === "stat") {
        return !(
          effectType === "stat" &&
          this._normalizeSecondaryStatKey(effect?.stat) === retaliation.stat &&
          Math.floor(toNumber(effect?.amount, 0)) === retaliation.amount
        );
      }
      if (retaliation.mode === "damage") {
        return !(effectType === "damage" && Math.floor(toNumber(effect?.amount, 0)) === retaliation.amount);
      }
      return true;
    });
  }

  _formatShieldEntryNameList(entries = []) {
    const names = [...new Set(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => `${entry?.moveName ?? ""}`.trim())
        .filter(Boolean)
    )];
    return names.join(", ");
  }

  _computeClashDamage(moveType, targetActor) {
    const interaction = this._evaluateTypeInteraction(moveType, targetActor);
    if (interaction.immune) return 0;
    return Math.max(1 + interaction.weaknessBonus - interaction.resistancePenalty, 1);
  }

  _isSocialAccuracyMove(move) {
    return SOCIAL_ATTRIBUTE_KEYS.includes(move.system.accuracyAttribute);
  }

  _getGearStatusEffects(gearItem) {
    if (gearItem.system.status?.all) {
      return ["All"];
    }

    const statusKeys = [
      ["poison", "Poison"],
      ["sleep", "Sleep"],
      ["burn", "Burn"],
      ["frozen", "Frozen"],
      ["paralysis", "Paralysis"],
      ["confusion", "Confusion"]
    ];
    return statusKeys
      .filter(([statusKey]) => gearItem.system.status?.[statusKey])
      .map(([, labelKey]) => labelKey);
  }

  async _consumeGearItem(gearItem) {
    const quantity = Math.max(toNumber(gearItem.system.quantity, 0), 0);
    const unitsMax = Math.max(toNumber(gearItem.system.units?.max, 0), 0);
    let unitsValue = Math.max(toNumber(gearItem.system.units?.value, 0), 0);

    if (quantity <= 0) {
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.GearOutOfStock"));
      return null;
    }

    const updates = {};
    let nextQuantity = quantity;
    let nextUnitsValue = unitsValue;

    if (unitsMax > 0) {
      if (nextUnitsValue <= 0 && nextQuantity > 0) {
        nextUnitsValue = unitsMax;
      }
      nextUnitsValue = Math.max(nextUnitsValue - 1, 0);
      if (nextUnitsValue === 0) {
        nextQuantity = Math.max(nextQuantity - 1, 0);
        if (nextQuantity > 0) {
          nextUnitsValue = unitsMax;
        }
      }
      updates["system.units.value"] = nextUnitsValue;
      updates["system.quantity"] = nextQuantity;
    } else {
      nextQuantity = Math.max(nextQuantity - 1, 0);
      updates["system.quantity"] = nextQuantity;
    }

    await gearItem.update(updates);

    return {
      quantity: nextQuantity,
      unitsValue: nextUnitsValue,
      unitsMax
    };
  }

  async resetActionCounter(options = {}) {
    await this.resetTurnState({ ...options, resetInitiative: false });
  }

  async resetTurnState(options = {}) {
    const roundKey = options.roundKey ?? getCurrentCombatRoundKey();
    const updates = {};
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      updates["system.combat.actionNumber"] = 1;
    }
    if (options.resetInitiative !== false) {
      const currentInitiative = Math.max(toNumber(this.system.combat?.initiative, 0), 0);
      if (currentInitiative !== 0) {
        updates["system.combat.initiative"] = 0;
      }
    }
    if (Object.keys(updates).length > 0) {
      await this.update(updates);
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
  }

  async _resolveActionRequirement(actionNumber, roundKey) {
    await this._resetActionCounterForRound(roundKey);
    if (actionNumber !== null && actionNumber !== undefined) {
      return clamp(toNumber(actionNumber, 1), 1, 5);
    }
    return clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
  }

  async _resetActionCounterForRound(roundKey) {
    if (!roundKey) return;
    const lastActionRound = this.getFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND);
    if (lastActionRound === roundKey) return;

    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (currentActionNumber !== 1) {
      await this.update({ "system.combat.actionNumber": 1 });
    }
    await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
  }

  async _advanceActionCounter(actionNumber, roundKey) {
    const nextActionNumber = clamp(toNumber(actionNumber, 1) + 1, 1, 5);
    const currentActionNumber = clamp(toNumber(this.system.combat?.actionNumber, 1), 1, 5);
    if (nextActionNumber !== currentActionNumber) {
      await this.update({ "system.combat.actionNumber": nextActionNumber });
    }
    if (roundKey) {
      await this.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.LAST_ACTION_ROUND, roundKey);
    }
    await this.processTemporaryEffectSpecialDuration("next-action", {
      combatId: game.combat?.id ?? null
    });
  }

  _canUseReactionThisRound(reactionType, roundKey) {
    if (!roundKey) return true;
    const entryReactionBonusRound = `${this.getFlag(POKROLE.ID, ENTRY_REACTION_BONUS_FLAG_KEY) ?? ""}`.trim();
    if (entryReactionBonusRound && entryReactionBonusRound === `${roundKey}`.trim()) {
      return true;
    }
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    const usedRound = this.getFlag(POKROLE.ID, flagKey);
    return usedRound !== roundKey;
  }

  async _markReactionUsedThisRound(reactionType, roundKey) {
    if (!roundKey) return;
    const flagKey =
      reactionType === "clash"
        ? COMBAT_FLAG_KEYS.LAST_CLASH_ROUND
        : COMBAT_FLAG_KEYS.LAST_EVASION_ROUND;
    await this.setFlag(POKROLE.ID, flagKey, roundKey);
    const entryReactionBonusRound = `${this.getFlag(POKROLE.ID, ENTRY_REACTION_BONUS_FLAG_KEY) ?? ""}`.trim();
    if (entryReactionBonusRound && entryReactionBonusRound === `${roundKey}`.trim()) {
      await this.unsetFlag(POKROLE.ID, ENTRY_REACTION_BONUS_FLAG_KEY);
    }
  }

  async _safeApplyDamage(targetActor, damage, options = {}) {
    const normalizedDamage = Math.max(toNumber(damage, 0), 0);
    if (!targetActor || normalizedDamage <= 0) {
      return null;
    }

    const hpValue = Math.max(toNumber(targetActor.system.resources?.hp?.value, 0), 0);
    const hpAfter = Math.max(hpValue - normalizedDamage, 0);
    const applyDeadOnZero = Boolean(options?.applyDeadOnZero);
    const isLethalKo = applyDeadOnZero && hpAfter <= 0;
    if (isLethalKo) {
      targetActor.__pokrolePendingDeadSync = true;
    }
    try {
      await targetActor.update({ "system.resources.hp.value": hpAfter });
      if (hpAfter <= 0 && typeof targetActor.clearMultiTurnState === "function") {
        await targetActor.clearMultiTurnState();
      }
      if (hpAfter <= 0 && typeof targetActor._clearBideState === "function") {
        await targetActor._clearBideState();
      }
      if (isLethalKo) {
        if (
          typeof targetActor._setConditionFlagState === "function" &&
          typeof targetActor._ensureConditionEffectFromFlag === "function"
        ) {
          await targetActor._setConditionFlagState(targetActor, "dead", true);
          await targetActor._ensureConditionEffectFromFlag(targetActor, "dead");
        } else if (typeof targetActor.toggleQuickCondition === "function") {
          await targetActor.toggleQuickCondition("dead", { active: true });
        }
        if (typeof targetActor.toggleQuickCondition === "function" && targetActor._isConditionActive?.("fainted")) {
          await targetActor.toggleQuickCondition("fainted", { active: false });
        }
      }
      if (hpAfter <= 0) {
        await this._triggerDestinyBondOnKo(targetActor, {
          sourceActor: options?.sourceActor ?? null,
          sourceActorId: options?.sourceActorId ?? "",
          sourceCategory: options?.sourceCategory ?? ""
        });
        // Ability faint triggers: on-foe-faint for the attacker, on-self-faint for the target
        await this._processAbilityFaintTriggers(targetActor, options);
      }
    } catch (error) {
      console.error(`${POKROLE.ID} | Failed to apply damage`, error);
      ui.notifications.warn(game.i18n.localize("POKROLE.Errors.HPUpdateFailed"));
    } finally {
      if (isLethalKo) {
        delete targetActor.__pokrolePendingDeadSync;
      }
    }

    return {
      hpBefore: hpValue,
      hpAfter
    };
  }

  /**
   * Process ability faint triggers when a Pokémon is KO'd.
   * Triggers on-foe-faint for the source actor, on-self-faint for the target, on-ally-faint for allies.
   */
  async _processAbilityFaintTriggers(faintedActor, options = {}) {
    const combat = game.combat ?? null;
    if (!combat) return;

    const sourceActor = options?.sourceActor ?? null;

    // on-foe-faint for the attacker
    if (sourceActor && typeof sourceActor.processAbilityTriggerEffects === "function") {
      try {
        await sourceActor.processAbilityTriggerEffects("on-foe-faint", { combat });
      } catch (err) {
        console.warn(`PokRole | on-foe-faint ability processing failed for ${sourceActor.name}:`, err);
      }
    }

    // on-self-faint for the fainted actor (pass attacker for target resolution)
    if (faintedActor && typeof faintedActor.processAbilityTriggerEffects === "function") {
      try {
        await faintedActor.processAbilityTriggerEffects("on-self-faint", {
          combat,
          attackerActor: sourceActor
        });
      } catch (err) {
        console.warn(`PokRole | on-self-faint ability processing failed for ${faintedActor.name}:`, err);
      }
    }

    // on-ally-faint for allies of the fainted actor
    if (faintedActor && combat) {
      const faintedDisposition = this._getActorCombatSideDisposition(faintedActor, combat);
      for (const combatant of combat.combatants ?? []) {
        const allyActor = combatant.actor;
        if (!allyActor || allyActor.id === faintedActor.id) continue;
        if (allyActor._isConditionActive?.("fainted") || allyActor._isConditionActive?.("dead")) continue;
        const allyDisposition = this._getActorCombatSideDisposition(allyActor, combat);
        if (allyDisposition !== faintedDisposition) continue;
        if (typeof allyActor.processAbilityTriggerEffects === "function") {
          try {
            await allyActor.processAbilityTriggerEffects("on-ally-faint", { combat });
          } catch (err) {
            console.warn(`PokRole | on-ally-faint ability processing failed for ${allyActor.name}:`, err);
          }
        }
      }
    }
  }

  _evaluateTypeInteractionAgainstTypes(moveType, defenderTypes = []) {
    const normalizedMoveType = this._normalizeTypeKey(moveType);
    const normalizedDefenderTypes = defenderTypes.map((entry) => this._normalizeTypeKey(entry));
    if (!normalizedMoveType || normalizedMoveType === "none") {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    const table = TYPE_EFFECTIVENESS[normalizedMoveType];
    if (!table) {
      return {
        immune: false,
        weaknessBonus: 0,
        resistancePenalty: 0,
        label: "POKROLE.Chat.TypeEffect.Neutral"
      };
    }

    let weaknessBonus = 0;
    let resistancePenalty = 0;
    let immune = false;

    for (const defenderType of normalizedDefenderTypes) {
      if (table.immune.includes(defenderType)) immune = true;
      if (table.double.includes(defenderType)) weaknessBonus += 1;
      if (table.half.includes(defenderType)) resistancePenalty += 1;
    }

    const activeWeather = this.getActiveWeatherKey();
    if (
      activeWeather === "strong-winds" &&
      normalizedDefenderTypes.includes("flying") &&
      ["electric", "ice", "rock"].includes(normalizedMoveType)
    ) {
      weaknessBonus = Math.max(weaknessBonus - 1, 0);
      resistancePenalty = Math.max(resistancePenalty - 1, 0);
    }

    let label = "POKROLE.Chat.TypeEffect.Neutral";
    if (immune) {
      label = "POKROLE.Chat.TypeEffect.Immune";
    } else if (weaknessBonus > resistancePenalty) {
      label = "POKROLE.Chat.TypeEffect.Super";
    } else if (resistancePenalty > weaknessBonus) {
      label = "POKROLE.Chat.TypeEffect.Resisted";
    }

    return {
      immune,
      weaknessBonus,
      resistancePenalty,
      label
    };
  }

  _evaluateTypeInteraction(moveType, targetActor) {
    const defenderTypes = this._getEffectiveDefenderTypesForInteraction(targetActor, moveType);
    const interaction = this._evaluateTypeInteractionAgainstTypes(moveType, defenderTypes);
    // Ring Target: remove type immunities from the defender
    if (interaction.immune && targetActor?._getHeldItemData?.()?.removeTypeImmunities) {
      interaction.immune = false;
      interaction.label = interaction.weaknessBonus > interaction.resistancePenalty
        ? "POKROLE.Chat.TypeEffect.Super"
        : interaction.resistancePenalty > interaction.weaknessBonus
          ? "POKROLE.Chat.TypeEffect.Resisted"
          : "POKROLE.Chat.TypeEffect.Neutral";
    }
    return interaction;
  }

  _getTargetDefense(targetActor, category) {
    const normalizedCategory = this._normalizeMoveCombatCategory(category);
    if (targetActor instanceof PokRoleActor) {
      return targetActor.getDefense(normalizedCategory);
    }

    const fallbackDefense =
      normalizedCategory === "special"
        ? toNumber(targetActor.system?.attributes?.insight, 0)
        : toNumber(targetActor.system?.attributes?.vitality, 0);
    return Math.max(fallbackDefense, 0);
  }

  _normalizeMovePrimaryMode(value) {
    const normalized = `${value ?? "damage"}`.trim().toLowerCase();
    return normalized === "effect-only" ? "effect-only" : "damage";
  }

  _moveUsesPrimaryDamage(move) {
    const moveSystem = move?.system ?? move ?? {};
    const specialDamageRule = this._getMoveSpecialDamageRule(move);
    if (specialDamageRule?.forcesDamageMode) return true;
    const normalizedCategory = `${moveSystem?.category ?? "physical"}`.trim().toLowerCase();
    if (normalizedCategory === "support") return false;
    return this._normalizeMovePrimaryMode(moveSystem?.primaryMode) === "damage";
  }

  _getSpecialDamageMoveFailureReason(move, targetActors = []) {
    const rule = this._getMoveSpecialDamageRule(move);
    if (!rule) return null;
    const primaryTarget = targetActors[0] ?? null;
    const seedId = this._getMoveSeedId(move);

    if (Array.isArray(rule.retaliationCategories) && rule.retaliationCategories.length > 0) {
      if (!(primaryTarget instanceof PokRoleActor)) {
        return game.i18n.localize("POKROLE.Errors.SpecialDamageNeedsTarget");
      }
      const lastAttack = this._getLastReceivedAttackRecord();
      const activeCombatId = `${game.combat?.id ?? ""}`.trim();
      if (
        !activeCombatId ||
        !lastAttack.combatId ||
        lastAttack.combatId !== activeCombatId ||
        !lastAttack.sourceActorId ||
        lastAttack.sourceActorId !== primaryTarget.id ||
        lastAttack.damagePool <= 0
      ) {
        return game.i18n.format("POKROLE.Errors.SpecialDamageNeedsRetaliationTarget", {
          move: move.name,
          actor: this.name
        });
      }
      if (!rule.retaliationCategories.includes(lastAttack.category)) {
        const categoryLabel =
          rule.retaliationCategories.length > 1
            ? game.i18n.localize("POKROLE.Move.Category.Damaging")
            : game.i18n.localize(
                rule.retaliationCategories[0] === "physical"
                  ? "POKROLE.Move.Category.Physical"
                  : "POKROLE.Move.Category.Special"
              );
        return game.i18n.format("POKROLE.Errors.SpecialDamageNeedsRetaliationCategory", {
          move: move.name,
          actor: this.name,
          category: categoryLabel
        });
      }
    }

    if (seedId === "move-nature-s-madness" && primaryTarget instanceof PokRoleActor) {
      const targetHp = Math.max(toNumber(primaryTarget.system?.resources?.hp?.value, 0), 0);
      if (targetHp <= 1) {
        return game.i18n.format("POKROLE.Errors.SpecialDamageTargetTooWeak", {
          move: move.name,
          target: primaryTarget.name
        });
      }
    }

    if (rule.uniqueTargetPerCombat && primaryTarget instanceof PokRoleActor) {
      if (this._hasSpecialDamageMoveAlreadyHitTarget(move, primaryTarget)) {
        return game.i18n.format("POKROLE.Errors.SpecialDamageAlreadyHitTarget", {
          move: move.name,
          target: primaryTarget.name
        });
      }
    }

    return null;
  }

  _moveShouldAutoHoldBackFromInfatuation(moveTargetKey) {
    const normalizedTarget = this._normalizeMoveTargetKey(moveTargetKey);
    return [
      "foe",
      "random-foe",
      "all-foes",
      "area",
      "foe-battlefield",
      "battlefield-area"
    ].includes(normalizedTarget);
  }

  _buildFormulaEntityContext(actor = null) {
    const entity = actor ?? null;
    const lastReceivedAttack = actor instanceof PokRoleActor ? actor._getLastReceivedAttackRecord() : {};
    const normalizedTier = `${entity?.system?.tier ?? ""}`.trim().toLowerCase();
    const context = {
      hpCurrent: Math.max(toNumber(entity?.system?.resources?.hp?.value, 0), 0),
      hpMax: Math.max(toNumber(entity?.system?.resources?.hp?.max, 0), 0),
      willCurrent: Math.max(toNumber(entity?.system?.resources?.will?.value, 0), 0),
      willMax: Math.max(toNumber(entity?.system?.resources?.will?.max, 0), 0),
      hp: Math.max(toNumber(entity?.system?.resources?.hp?.value, 0), 0),
      will: Math.max(toNumber(entity?.system?.resources?.will?.value, 0), 0),
      happiness: Math.max(toNumber(entity?.system?.happiness, 0), 0),
      loyalty: Math.max(toNumber(entity?.system?.loyalty, 0), 0),
      confidence: Math.max(toNumber(entity?.system?.confidence, 0), 0),
      battles: Math.max(toNumber(entity?.system?.battles, 0), 0),
      victories: Math.max(toNumber(entity?.system?.victories, 0), 0),
      rankDamageDice: Math.max(toNumber(RANK_DAMAGE_DICE_BY_TIER[normalizedTier], 0), 0),
      lastDamagePoolTaken: Math.max(toNumber(lastReceivedAttack?.damagePool, 0), 0),
      primaryType: this._normalizeTypeKey(entity?.system?.types?.primary || "none"),
      secondaryType: this._normalizeTypeKey(entity?.system?.types?.secondary || "none")
    };

    for (const [key, value] of Object.entries(entity?.system?.attributes ?? {})) {
      context[key] = Math.max(toNumber(value, 0), 0);
    }
    for (const [key, value] of Object.entries(entity?.system?.skills ?? {})) {
      context[key] = Math.max(toNumber(value, 0), 0);
    }

    return context;
  }

  _buildMoveFormulaContext(move, targetActor = null, extras = {}) {
    const combat = game.combat ?? null;
    return {
      source: this._buildFormulaEntityContext(this),
      target: this._buildFormulaEntityContext(targetActor),
      move: {
        power: Math.max(toNumber(move?.system?.power, 0), 0),
        willCost: Math.max(toNumber(move?.system?.willCost, 0), 0),
        priority: this._resolveEffectiveMovePriority(move, this),
        category: `${move?.system?.category ?? ""}`.trim().toLowerCase(),
        type: this._resolveEffectiveMoveType(move, this)
      },
      action: {
        number: Math.max(toNumber(extras?.actionNumber, 1), 1)
      },
      combat: {
        round: Math.max(toNumber(combat?.round, 0), 0),
        turn: Math.max(toNumber(combat?.turn, 0), 0)
      }
    };
  }

  _resolveMoveAccuracySetup(move, targetActor = null, actionNumber = 1) {
    const accuracyFormula = `${move?.system?.accuracyFormula ?? ""}`.trim();
    if (accuracyFormula) {
      const accuracyDicePoolBase = Math.max(
        Math.floor(
          evaluateNumericFormula(
            accuracyFormula,
            this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
            0
          )
        ),
        0
      );
      return {
        accuracyAttributeKey: "",
        accuracySkillKey: "",
        accuracyDicePoolBase,
        accuracyAttributeLabel: game.i18n.localize("POKROLE.Move.Formula.Label"),
        accuracySkillLabel: accuracyFormula,
        accuracySummaryLabel: accuracyFormula
      };
    }

    const accuracyAttributeKey = move?.system?.accuracyAttribute || "dexterity";
    const accuracySkillKey = move?.system?.accuracySkill || "brawl";
    return {
      accuracyAttributeKey,
      accuracySkillKey,
      accuracyDicePoolBase:
        this.getTraitValue(accuracyAttributeKey) + this.getSkillValue(accuracySkillKey),
      accuracyAttributeLabel: this.localizeTrait(accuracyAttributeKey),
      accuracySkillLabel: this.localizeTrait(accuracySkillKey),
      accuracySummaryLabel: `${this.localizeTrait(accuracyAttributeKey)} + ${this.localizeTrait(
        accuracySkillKey
      )}`
    };
  }

  _resolveMovePower(move, targetActor = null, actionNumber = 1, options = {}) {
    let basePower;
    const runtimeOverridePower = options?.runtimeOverride && options.runtimeOverride.power != null && Number.isFinite(Number(options.runtimeOverride.power))
      ? Math.max(Math.floor(toNumber(options.runtimeOverride.power, 0)), 0)
      : null;
    const powerFormula = `${move?.system?.powerFormula ?? ""}`.trim();
    if (runtimeOverridePower !== null) {
      basePower = runtimeOverridePower;
    } else if (powerFormula) {
      basePower = Math.max(
        Math.floor(
          evaluateNumericFormula(
            powerFormula,
            this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
            move?.system?.power ?? 0
          )
        ),
        0
      );
    } else {
      basePower = Math.max(toNumber(move?.system?.power, 0), 0);
    }
    // Choice Band / Choice Specs / Choice Scarf: power bonus/penalty
    const choiceHeld = this._getHeldItemData();
    if (choiceHeld?.choiceType) {
      const lockedMoveId = this.getFlag(POKROLE.ID, CHOICE_LOCKED_MOVE_FLAG) ?? null;
      if (lockedMoveId === move?.id) {
        basePower += toNumber(choiceHeld.choicePowerBonus, 3);
      } else if (lockedMoveId) {
        basePower = Math.max(basePower + toNumber(choiceHeld.choicePowerPenalty, -3), 0);
      }
    }
    return basePower;
  }

  _resolveMoveDamageBase(move, targetActor = null, actionNumber = 1) {
    const damageBaseFormula = `${move?.system?.damageBaseFormula ?? ""}`.trim();
    if (damageBaseFormula) {
      return {
        value: Math.max(
          Math.floor(
            evaluateNumericFormula(
              damageBaseFormula,
              this._buildMoveFormulaContext(move, targetActor, { actionNumber }),
              0
            )
          ),
          0
        ),
        label: game.i18n.localize("POKROLE.Move.Formula.Label"),
        ignoresPainPenalty: false
      };
    }

    const damageAttributeKey = this._resolveDamageAttributeKey(move);
    return {
      value: Math.max(this.getTraitValue(damageAttributeKey), 0),
      label: this.localizeTrait(damageAttributeKey),
      ignoresPainPenalty: damageAttributeKey === "vitality"
    };
  }

  _resolveDamageAttributeKey(move) {
    const configuredAttribute = move.system.damageAttribute || "auto";
    if (configuredAttribute !== "auto") return configuredAttribute;
    return move.system.category === "special" ? "special" : "strength";
  }

  async _applyLuckyChantReroll(rawSuccesses, dicePool, flavor = "") {
    if (!this._hasLuckyChantProtection(this)) {
      return { bonusSuccesses: 0, reroll: null };
    }
    const normalizedPool = Math.max(Math.floor(toNumber(dicePool, 0)), 1);
    const normalizedSuccesses = Math.max(Math.floor(toNumber(rawSuccesses, 0)), 0);
    if (normalizedSuccesses >= normalizedPool) {
      return { bonusSuccesses: 0, reroll: null };
    }
    const reroll = await new Roll(`1d6cs>=${POKROLE.SUCCESS_TARGET}`).evaluate();
    const bonusSuccesses = Math.max(Math.floor(toNumber(reroll.total, 0)), 0);
    await reroll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor:
        flavor ||
        `${this.name} re-rolls one unsuccessful die thanks to Lucky Chant.`
    });
    return { bonusSuccesses, reroll };
  }

  async _rollSuccessPool({
    dicePool,
    removedSuccesses = 0,
    requiredSuccesses = 1,
    flavor
  }) {
    const normalizedDicePool = Math.max(toNumber(dicePool, 0), 1);
    const resolvedFlavor =
      flavor ??
      game.i18n.format("POKROLE.Chat.GenericRollFlavor", {
        actor: this.name
      });
    const roll = await new Roll(successPoolFormula(normalizedDicePool)).evaluate();
    let rawSuccesses = toNumber(roll.total, 0);
    const luckyChantReroll = await this._applyLuckyChantReroll(
      rawSuccesses,
      normalizedDicePool,
      `${resolvedFlavor} (Lucky Chant)`
    );
    rawSuccesses += luckyChantReroll.bonusSuccesses;
    const netSuccesses = rawSuccesses - Math.max(toNumber(removedSuccesses, 0), 0);
    const success = netSuccesses >= Math.max(toNumber(requiredSuccesses, 1), 1);

    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: `${resolvedFlavor}<br><small>${game.i18n.format(
        "POKROLE.Chat.RollBreakdown",
        {
          raw: rawSuccesses,
          removed: removedSuccesses,
          net: netSuccesses,
          required: requiredSuccesses
        }
      )} (${success ? game.i18n.localize("POKROLE.Common.Hit") : game.i18n.localize("POKROLE.Common.Miss")})</small>`
    });

    return {
      roll,
      rawSuccesses,
      netSuccesses,
      requiredSuccesses,
      success
    };
  }
}

export class PokRoleItem extends Item {}

export async function clearCombatDelayedEffects(combat) {
  if (!combat) return 0;
  await combat.unsetFlag(POKROLE.ID, DELAYED_EFFECTS_FLAG_KEY);
  return 0;
}

export async function processCombatDelayedEffects(combat, phase) {
  if (!combat) return 0;
  const anchorActor =
    combat.combatants?.find?.((entry) => entry.actor instanceof PokRoleActor)?.actor ??
    game.actors?.find?.((actor) => actor instanceof PokRoleActor) ??
    null;
  if (!(anchorActor instanceof PokRoleActor)) return 0;

  const currentEntries = anchorActor._getCombatDelayedEntries(combat);
  if (!currentEntries.length) return 0;

  const nextEntries = [];
  const messages = [];
  for (const entry of currentEntries) {
    const sourceActor =
      game.actors.get(`${entry?.sourceActorId ?? ""}`.trim()) instanceof PokRoleActor
        ? game.actors.get(`${entry?.sourceActorId ?? ""}`.trim())
        : anchorActor;
    const result = await sourceActor._processDelayedEffectEntry(entry, phase, combat);
    if (result?.detail) messages.push(`<p>${result.detail}</p>`);
    if (result?.keep && result?.entry) {
      const entryToKeep = { ...result.entry };
      if (`${entryToKeep.triggerPhase ?? ""}`.trim().toLowerCase() === `${phase ?? ""}`.trim().toLowerCase()) {
        entryToKeep.triggerRound = Math.max(Math.floor(toNumber(combat.round, 0)), 0) + 1;
      }
      nextEntries.push(entryToKeep);
      continue;
    }
    if (result?.keep) {
      nextEntries.push(entry);
    }
  }

  await anchorActor._setCombatDelayedEntries(combat, nextEntries);
  if (messages.length > 0) {
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: anchorActor }),
      content: `
        <div class="pok-role-chat-card arcade-red">
          <header class="chat-card-header">
            <h3>${phase === "round-start" ? "Delayed Effects - Round Start" : "Delayed Effects - Round End"}</h3>
          </header>
          <section class="chat-card-section">
            ${messages.join("")}
          </section>
        </div>
      `
    });
  }
  return currentEntries.length - nextEntries.length;
}
