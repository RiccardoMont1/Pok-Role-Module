import {
  ATTRIBUTE_DEFINITIONS,
  getSystemAssetPath,
  POKROLE,
  SKILL_DEFINITIONS
} from "./module/constants.mjs";
import {
  seedCompendia
} from "./module/seeds/compendium-seed.mjs";
import {
  AbilityDataModel,
  GearDataModel,
  MoveDataModel,
  PokedexDataModel,
  PokemonDataModel,
  StatusDataModel,
  WeatherDataModel,
  TrainerDataModel
} from "./module/data-models.mjs";
import { PokRoleActor, PokRoleItem } from "./module/documents.mjs";
import { PokRoleActorSheet } from "./module/sheets/actor-sheet.mjs";
import { PokRoleMoveSheet } from "./module/sheets/item-sheet.mjs";

async function clearCombatScopedTemporaryEffects(combat) {
  if (!combat) return;
  const combatId = `${combat.id ?? ""}`.trim();
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor || typeof actor.clearCombatTemporaryEffects !== "function") continue;
    await actor.clearCombatTemporaryEffects(combatId);
  }
}

const LAST_COMBAT_TURN_STATE = new Map();

const HUD_CONDITION_DEFINITIONS = Object.freeze([
  { key: "sleep", label: "POKROLE.Conditions.Sleep", icon: getSystemAssetPath("assets/ailments/asleep.svg") },
  { key: "burn", label: "POKROLE.Conditions.Burn", icon: getSystemAssetPath("assets/ailments/burn.svg") },
  { key: "frozen", label: "POKROLE.Conditions.Frozen", icon: getSystemAssetPath("assets/ailments/frozen.svg") },
  { key: "paralyzed", label: "POKROLE.Conditions.Paralyzed", icon: getSystemAssetPath("assets/ailments/paralyzed.svg") },
  { key: "poisoned", label: "POKROLE.Conditions.Poisoned", icon: getSystemAssetPath("assets/ailments/poisoned.svg") },
  { key: "fainted", label: "POKROLE.Conditions.Fainted", icon: getSystemAssetPath("assets/ailments/fainted.svg") },
  { key: "confused", label: "POKROLE.Move.Secondary.Condition.Confused", icon: "icons/svg/daze.svg" },
  { key: "flinch", label: "POKROLE.Move.Secondary.Condition.Flinch", icon: "icons/svg/falling.svg" },
  { key: "disabled", label: "POKROLE.Move.Secondary.Condition.Disabled", icon: "icons/svg/cancel.svg" },
  { key: "infatuated", label: "POKROLE.Move.Secondary.Condition.Infatuated", icon: "icons/svg/heart.svg" },
  { key: "badly-poisoned", label: "POKROLE.Move.Secondary.Condition.BadlyPoisoned", icon: "icons/svg/skull.svg" }
]);
const HUD_CONDITION_KEY_BY_STATUS_ID = new Map(
  HUD_CONDITION_DEFINITIONS.map((entry) => [`pokrole-condition-${entry.key}`, entry.key])
);

function buildHudConditionStatuses() {
  return HUD_CONDITION_DEFINITIONS.map((entry) => ({
    id: `pokrole-condition-${entry.key}`,
    name: game.i18n?.localize?.(entry.label) ?? entry.label,
    img: entry.icon
  }));
}

function resolveConditionKeyFromStatus(statusId) {
  if (!statusId) return null;
  if (typeof statusId === "string") {
    return HUD_CONDITION_KEY_BY_STATUS_ID.get(statusId) ?? null;
  }
  if (typeof statusId === "object") {
    const candidates = [
      statusId.id,
      ...(Array.isArray(statusId.statuses) ? statusId.statuses : []),
      ...((statusId.statuses instanceof Set) ? [...statusId.statuses] : [])
    ];
    for (const candidate of candidates) {
      const resolved = HUD_CONDITION_KEY_BY_STATUS_ID.get(`${candidate ?? ""}`);
      if (resolved) return resolved;
    }
  }
  return null;
}

Hooks.once("init", () => {
  console.log(`${POKROLE.ID} | Initializing ${POKROLE.TITLE}`);

  // Replace Foundry's default token status effects with PokRole condition flags.
  CONFIG.statusEffects = buildHudConditionStatuses();
  try {
    CONFIG.specialStatusEffects = {};
  } catch (_error) {
    if (CONFIG.specialStatusEffects && typeof CONFIG.specialStatusEffects === "object") {
      for (const key of Object.keys(CONFIG.specialStatusEffects)) {
        delete CONFIG.specialStatusEffects[key];
      }
    }
  }

  CONFIG.Actor.documentClass = PokRoleActor;
  CONFIG.Item.documentClass = PokRoleItem;

  CONFIG.Actor.dataModels = {
    trainer: TrainerDataModel,
    pokemon: PokemonDataModel
  };

  CONFIG.Item.dataModels = {
    move: MoveDataModel,
    gear: GearDataModel,
    ability: AbilityDataModel,
    weather: WeatherDataModel,
    status: StatusDataModel,
    pokedex: PokedexDataModel
  };

  const sharedTrackableValues = [
    "resources.will.value",
    "combat.actionNumber",
    "combat.initiative",
    ...ATTRIBUTE_DEFINITIONS.map((attribute) => `attributes.${attribute.key}`),
    ...SKILL_DEFINITIONS.map((skill) => `skills.${skill.key}`)
  ];

  CONFIG.Actor.trackableAttributes = {
    trainer: {
      bar: ["resources.hp", "resources.will"],
      value: ["level", ...sharedTrackableValues]
    },
    pokemon: {
      bar: ["resources.hp", "resources.will"],
      value: sharedTrackableValues
    }
  };

  const sheetConfig = foundry.applications.apps.DocumentSheetConfig;
  try {
    sheetConfig.unregisterSheet(Actor, "core", foundry.appv1.sheets.ActorSheet);
    sheetConfig.unregisterSheet(Item, "core", foundry.appv1.sheets.ItemSheet);
  } catch (error) {
    console.debug(`${POKROLE.ID} | Core sheets already unregistered`, error);
  }

  sheetConfig.registerSheet(Actor, POKROLE.ID, PokRoleActorSheet, {
    types: ["trainer", "pokemon"],
    makeDefault: true,
    label: "POKROLE.Sheets.Actor"
  });

  sheetConfig.registerSheet(Item, POKROLE.ID, PokRoleMoveSheet, {
    types: ["move", "gear", "ability", "weather", "status", "pokedex"],
    makeDefault: true,
    label: "POKROLE.Sheets.Item"
  });

});

Hooks.once("ready", async () => {
  game.pokrole ??= {};
  game.pokrole.seedCompendia = async (options = {}) => seedCompendia(options);
});

Hooks.on("updateCombat", async (combat, changed) => {
  const hasCombatEnded =
    Object.prototype.hasOwnProperty.call(changed, "active") && changed.active === false;
  if (hasCombatEnded) {
    await clearCombatScopedTemporaryEffects(combat);
    LAST_COMBAT_TURN_STATE.delete(`${combat?.id ?? ""}`);
    return;
  }

  const combatId = `${combat?.id ?? ""}`.trim();
  const previousTurnState = LAST_COMBAT_TURN_STATE.get(combatId) ?? {};
  const previousTurn = Number.isInteger(previousTurnState.turn)
    ? previousTurnState.turn
    : Number.isInteger(combat?.previous?.turn)
      ? combat.previous.turn
      : null;
  const currentTurn = Number.isInteger(combat.turn) ? combat.turn : null;
  const hasTurnChange = Object.prototype.hasOwnProperty.call(changed, "turn");
  const hasRoundChange = Object.prototype.hasOwnProperty.call(changed, "round");
  const shouldProcessTurnState = hasTurnChange || hasRoundChange;
  if (shouldProcessTurnState) {
    const previousActor = previousTurn !== null ? combat.turns?.[previousTurn]?.actor ?? null : null;
    if (
      previousActor &&
      previousActor.documentName === "Actor" &&
      typeof previousActor.processTemporaryEffectSpecialDuration === "function"
    ) {
      await previousActor.processTemporaryEffectSpecialDuration("turn-end", { combatId });
    }

    const currentActor = currentTurn !== null ? combat.turns?.[currentTurn]?.actor ?? null : null;
    if (
      currentActor &&
      currentActor.documentName === "Actor" &&
      typeof currentActor.processTemporaryEffectSpecialDuration === "function"
    ) {
      await currentActor.processTemporaryEffectSpecialDuration("turn-start", { combatId });
    }
  }

  if (!hasRoundChange) {
    LAST_COMBAT_TURN_STATE.set(combatId, {
      turn: Number.isInteger(combat.turn) ? combat.turn : null,
      round: Number.isInteger(combat.round) ? combat.round : null
    });
    return;
  }
  if ((combat.round ?? 0) <= 0) {
    LAST_COMBAT_TURN_STATE.set(combatId, {
      turn: Number.isInteger(combat.turn) ? combat.turn : null,
      round: Number.isInteger(combat.round) ? combat.round : null
    });
    return;
  }
  const roundKey = `${combat.id}:${combat.round ?? 0}`;
  const initiativeUpdates = [];

  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor) continue;

    if (typeof actor.advanceTemporaryEffectsRound === "function") {
      await actor.advanceTemporaryEffectsRound(combat.id);
    }

    if (typeof actor.resetTurnState === "function") {
      await actor.resetTurnState({ roundKey, resetInitiative: false });
    }
    if (typeof actor.rollInitiative !== "function") continue;

    const initiativeRoll = await actor.rollInitiative({ silent: true });
    const rolledScore = Math.max(
      Number(initiativeRoll?.total ?? actor.system?.combat?.initiative ?? 0) || 0,
      0
    );
    initiativeUpdates.push({ _id: combatant.id, initiative: rolledScore });
  }

  if (initiativeUpdates.length > 0) {
    await combat.updateEmbeddedDocuments("Combatant", initiativeUpdates);
  }
  LAST_COMBAT_TURN_STATE.set(combatId, {
    turn: Number.isInteger(combat.turn) ? combat.turn : null,
    round: Number.isInteger(combat.round) ? combat.round : null
  });
});

Hooks.on("deleteCombat", async (combat) => {
  await clearCombatScopedTemporaryEffects(combat);
  LAST_COMBAT_TURN_STATE.delete(`${combat?.id ?? ""}`);
});

Hooks.on("applyTokenStatusEffect", (token, statusId, isActive) => {
  const conditionKey = resolveConditionKeyFromStatus(statusId);
  if (!conditionKey) return;

  const actor = token?.actor ?? null;
  if (!actor || typeof actor.toggleQuickCondition !== "function") return;
  void actor.toggleQuickCondition(conditionKey, { active: Boolean(isActive) });
});

Hooks.on("createActiveEffect", (effectDocument) => {
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  const conditionKey = resolveConditionKeyFromStatus(effectDocument);
  if (!conditionKey) return;
  if (typeof actor.toggleQuickCondition === "function") {
    void actor.toggleQuickCondition(conditionKey, { active: true });
  }
});

Hooks.on("deleteActiveEffect", (effectDocument) => {
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  const conditionKey = resolveConditionKeyFromStatus(effectDocument);
  if (!conditionKey) return;
  if (typeof actor.toggleQuickCondition === "function") {
    void actor.toggleQuickCondition(conditionKey, { active: false });
  }
});
