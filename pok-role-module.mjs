import {
  ATTRIBUTE_DEFINITIONS,
  COMBAT_FLAG_KEYS,
  EFFECT_PASSIVE_TRIGGER_KEYS,
  getSystemAssetPath,
  MOVE_SECONDARY_CONDITION_KEYS,
  MOVE_SECONDARY_SPECIAL_DURATION_KEYS,
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
import {
  PokRoleActor,
  PokRoleItem,
  clearCombatDelayedEffects,
  processCombatDelayedEffects
} from "./module/documents.mjs";
import {
  clearCombatMoveQueue,
  clearCombatMoveQueueLocal,
  enqueueCombatMoveDeclaration,
  enqueueCombatMoveDeclarationLocal,
  executeCombatMoveEntry,
  getCombatMoveQueue,
  moveCombatMoveEntry,
  moveCombatMoveEntryLocal,
  removeCombatMoveEntryLocal,
  removeCombatMoveEntry,
  renderMoveQueueOverlay
} from "./module/move-queue.mjs";
import { PokRoleActorSheet } from "./module/sheets/actor-sheet.mjs";
import { PokRoleMoveSheet } from "./module/sheets/item-sheet.mjs";

const COMBAT_MUTATION_SOCKET_EVENT = `system.${POKROLE.ID}`;

function getPrimaryActiveGm() {
  return game.users?.activeGM ?? game.users?.find?.((user) => user?.isGM && user?.active) ?? null;
}

function canUserRequestCombatMutation(user, requesterActor) {
  if (!user) return false;
  if (user.isGM) return true;
  if (!(requesterActor instanceof Actor)) return false;
  return requesterActor.testUserPermission?.(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) === true;
}

function getQueueEntryActor(entry, combat) {
  const combatantId = `${entry?.combatantId ?? ""}`.trim();
  if (combatantId) {
    const combatantActor = combat?.combatants?.get(combatantId)?.actor ?? null;
    if (combatantActor) return combatantActor;
  }
  const actorId = `${entry?.actorId ?? ""}`.trim();
  if (!actorId) return null;
  return game.actors?.get(actorId) ?? null;
}

async function handleCombatMutationSocketRequest(message = {}) {
  const operation = `${message?.operation ?? ""}`.trim();
  const payload = message?.payload ?? {};
  if (!operation) {
    return { ok: false, error: "Missing combat mutation operation." };
  }

  const combatId = `${payload?.combatId ?? ""}`.trim();
  const combat = combatId ? game.combats?.get(combatId) ?? null : null;
  const requesterUser = `${payload?.requesterUserId ?? ""}`.trim()
    ? game.users?.get(`${payload.requesterUserId}`.trim()) ?? null
    : null;
  const requesterActor = `${payload?.requesterActorId ?? ""}`.trim()
    ? game.actors?.get(`${payload.requesterActorId}`.trim()) ?? null
    : null;

  if (operation === "capturePokemon") {
    if (!canUserRequestCombatMutation(requesterUser, requesterActor)) {
      return { ok: false, error: "Requester lacks permission to resolve capture." };
    }
    const trainerActor =
      game.actors?.get(`${payload?.trainerActorId ?? ""}`.trim()) ??
      requesterActor ??
      null;
    const targetActor = game.actors?.get(`${payload?.targetActorId ?? ""}`.trim()) ?? null;
    const gearItem = trainerActor?.items?.get?.(`${payload?.gearItemId ?? ""}`.trim()) ?? null;
    const captureCombat = combatId ? game.combats?.get(combatId) ?? null : null;
    if (!(trainerActor instanceof PokRoleActor) || trainerActor.type !== "trainer") {
      return { ok: false, error: "Trainer actor not found for capture." };
    }
    if (!(targetActor instanceof PokRoleActor) || targetActor.type !== "pokemon") {
      return { ok: false, error: "Pokemon target not found for capture." };
    }
    if (!gearItem || gearItem.type !== "gear") {
      return { ok: false, error: "Pokeball item not found for capture." };
    }
    try {
      const result = await trainerActor._applyPokeballCaptureSuccessLocal(
        trainerActor,
        targetActor,
        gearItem,
        {
          ...(payload?.options ?? {}),
          combat: captureCombat
        }
      );
      return { ok: true, ...result };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : `${error ?? "Capture failed"}`
      };
    }
  }

  if (!combat) {
    return { ok: false, error: `Combat ${combatId} not found.` };
  }
  if (!canUserRequestCombatMutation(requesterUser, requesterActor)) {
    return { ok: false, error: "Requester lacks permission to mutate combat." };
  }

  const dispatcherActor =
    requesterActor ??
    combat.combatants?.find?.((entry) => entry.actor)?.actor ??
    null;
  if (!(dispatcherActor instanceof PokRoleActor)) {
    return { ok: false, error: "No dispatcher actor available for combat mutation." };
  }

  try {
    switch (operation) {
      case "switchCombatantToActor": {
        const outgoingCombatant = combat.combatants.get(`${payload?.outgoingCombatantId ?? ""}`.trim()) ?? null;
        const incomingActor = game.actors?.get(`${payload?.incomingActorId ?? ""}`.trim()) ?? null;
        const switched = await dispatcherActor._switchCombatantToActorLocal(
          combat,
          outgoingCombatant,
          incomingActor,
          payload?.options ?? {}
        );
        return { ok: true, combatantId: switched?.id ?? null };
      }
      case "removeCombatantFromBattle": {
        const combatant = combat.combatants.get(`${payload?.combatantId ?? ""}`.trim()) ?? null;
        const removed = await dispatcherActor._removeCombatantFromBattleLocal(combat, combatant);
        return { ok: true, removed: Boolean(removed) };
      }
      case "updateCombatantActor": {
        const combatant = combat.combatants.get(`${payload?.combatantId ?? ""}`.trim()) ?? null;
        const replacementActor = game.actors?.get(`${payload?.replacementActorId ?? ""}`.trim()) ?? null;
        const updated = await dispatcherActor._updateCombatantActorLocal(combatant, replacementActor);
        return { ok: true, updated: Boolean(updated) };
      }
      case "swapCombatantActors": {
        const firstCombatant = combat.combatants.get(`${payload?.firstCombatantId ?? ""}`.trim()) ?? null;
        const secondCombatant = combat.combatants.get(`${payload?.secondCombatantId ?? ""}`.trim()) ?? null;
        const swapped = await dispatcherActor._swapCombatantActorsLocal(firstCombatant, secondCombatant);
        return { ok: true, swapped: Boolean(swapped) };
      }
      case "enqueueCombatMoveDeclaration": {
        const entry = payload?.entry ?? {};
        const queueActor = getQueueEntryActor(entry, combat);
        if (!canUserRequestCombatMutation(requesterUser, queueActor)) {
          return { ok: false, error: "Requester lacks permission to queue that move." };
        }
        const queuedEntry = await enqueueCombatMoveDeclarationLocal(entry, combat);
        return { ok: true, entryId: queuedEntry?.id ?? null };
      }
      case "removeCombatMoveEntry": {
        const entryId = `${payload?.entryId ?? ""}`.trim();
        const queueEntry = getCombatMoveQueue(combat).find((entry) => entry.id === entryId) ?? null;
        if (!queueEntry) return { ok: true, removed: false };
        const queueActor = getQueueEntryActor(queueEntry, combat);
        if (!canUserRequestCombatMutation(requesterUser, queueActor)) {
          return { ok: false, error: "Requester lacks permission to remove that queue entry." };
        }
        await removeCombatMoveEntryLocal(combat, entryId);
        return { ok: true, removed: true };
      }
      case "moveCombatMoveEntry": {
        if (!requesterUser?.isGM) {
          return { ok: false, error: "Only the GM can reorder the move queue." };
        }
        const entryId = `${payload?.entryId ?? ""}`.trim();
        const targetIndex = Number(payload?.targetIndex ?? 0);
        await moveCombatMoveEntryLocal(combat, entryId, targetIndex);
        return { ok: true };
      }
      case "clearCombatMoveQueue": {
        if (!requesterUser?.isGM) {
          return { ok: false, error: "Only the GM can clear the move queue." };
        }
        await clearCombatMoveQueueLocal(combat);
        return { ok: true };
      }
      case "setDelayedEffectQueue": {
        const queue = Array.isArray(payload?.queue) ? payload.queue : [];
        if (queue.length > 0) {
          await combat.setFlag(POKROLE.ID, COMBAT_FLAG_KEYS.DELAYED_EFFECT_QUEUE, queue);
        } else {
          await combat.unsetFlag(POKROLE.ID, COMBAT_FLAG_KEYS.DELAYED_EFFECT_QUEUE);
        }
        return { ok: true, count: queue.length };
      }
      case "setCombatSideFieldEntries": {
        const entries = Array.isArray(payload?.entries) ? payload.entries : [];
        await combat.setFlag(POKROLE.ID, "combat.sideFieldEntries", entries);
        return { ok: true, count: entries.length };
      }
      default:
        return { ok: false, error: `Unknown combat mutation operation: ${operation}` };
    }
  } catch (error) {
    console.error(`${POKROLE.ID} | Combat mutation failed`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : `${error ?? "Unknown combat mutation error"}`
    };
  }
}

/**
 * Custom Combat class that overrides nextTurn() to loop back to the first
 * combatant without advancing the round. Use "Next Round" to advance rounds.
 */
class PokRoleCombat extends Combat {
  static MAX_CYCLES = 5;

  /** Tracks which rounds have already had their end-of-round effects processed. */
  static _processedRoundEnds = new Set();

  /** Current cycle (turno) within the round, 1-based. */
  get cycle() {
    return Math.max(Math.floor(Number(this.getFlag(POKROLE.ID, "cycle")) || 0), 1);
  }

  async previousTurn() {
    const turn = this.turn ?? 0;
    const skip = this.settings.skipDefeated;

    // Find the previous valid turn within the same round
    let prev = null;
    for (let i = 1; i <= this.turns.length; i++) {
      const idx = (turn - i + this.turns.length) % this.turns.length;
      // Stop if we've wrapped past the first combatant
      if (idx >= turn) break;
      if (skip && this.turns[idx]?.isDefeated) continue;
      prev = idx;
      break;
    }

    // If no valid previous turn, stay where we are (never go back a round)
    if (prev === null) return this;
    return this.update({ turn: prev });
  }

  async nextTurn() {
    const turn = this.turn ?? 0;
    const skip = this.settings.skipDefeated;

    // Find the next valid turn index (wrapping around)
    let next = null;
    for (let i = 1; i <= this.turns.length; i++) {
      const idx = (turn + i) % this.turns.length;
      if (skip && this.turns[idx]?.isDefeated) continue;
      next = idx;
      break;
    }

    // If no valid turn found, just stay
    if (next === null) return this;

    // Detect wrap-around: next index is <= current turn means we looped
    const wrapping = next <= turn;
    if (wrapping) {
      const currentCycle = this.cycle;
      if (currentCycle >= PokRoleCombat.MAX_CYCLES) {
        // Max cycles reached — stay on the last combatant
        return this;
      }
      await this.setFlag(POKROLE.ID, "cycle", currentCycle + 1);
    }

    return this.update({ turn: next });
  }

  async nextRound() {
    // Process round-end effects BEFORE advancing the round
    // (done here instead of relying on the async updateCombat hook which Foundry does not await)
    const roundEndKey = `${this.id}:${this.round}`;
    if ((this.round ?? 0) >= 1) {
      PokRoleCombat._processedRoundEnds.add(roundEndKey);
      await processRoundEndCombatAutomation(this);
      await advanceCombatWeatherDuration(this);
      await advanceCombatTerrainDuration(this);
      const referenceActor = this.combatants?.find?.((c) => c.actor)?.actor ?? null;
      if (referenceActor && typeof referenceActor.synchronizeTerrainEffectsForCombat === "function") {
        await referenceActor.synchronizeTerrainEffectsForCombat(this);
      }
    }

    // Reset cycle counter for the new round
    await this.setFlag(POKROLE.ID, "cycle", 1);
    const result = await super.nextRound();

    // Re-roll initiative for all combatants at the start of each new round
    const initiativeUpdates = [];
    for (const combatant of this.combatants ?? []) {
      const actor = combatant.actor;
      if (!actor || typeof actor.rollInitiative !== "function") continue;
      try {
        const roll = await actor.rollInitiative({
          silent: true,
          updateCombatant: false,
          setTurnOnRoll: false,
          skipActionCheck: true
        });
        const score = Math.max(
          Number(actor.system?.combat?.initiative ?? roll?.total ?? 0) || 0,
          0
        );
        initiativeUpdates.push({ _id: combatant.id, initiative: score });
      } catch (err) {
        console.warn(`PokRole | Failed to re-roll initiative for ${actor.name}:`, err);
      }
    }

    if (initiativeUpdates.length > 0) {
      await this.updateEmbeddedDocuments("Combatant", initiativeUpdates);
      if (typeof this.setupTurns === "function") {
        await this.setupTurns();
      }
      // Set turn to highest initiative (first non-defeated)
      const rankedTurns = Array.from(this.turns ?? []);
      let highestIdx = rankedTurns.findIndex((c) => Boolean(c) && !c.defeated);
      if (highestIdx < 0 && rankedTurns.length > 0) highestIdx = 0;
      if (highestIdx >= 0 && this.turn !== highestIdx) {
        await this.update({ turn: highestIdx });
      }
    }

    return result;
  }
}

async function clearCombatScopedTemporaryEffects(combat) {
  if (!combat) return;
  const combatId = `${combat.id ?? ""}`.trim();
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor || typeof actor.clearCombatTemporaryEffects !== "function") continue;
    await actor.clearCombatTemporaryEffects(combatId);
  }
}

async function processCombatSpecialDurationEvent(combat, eventKey) {
  if (!combat) return;
  const combatId = `${combat.id ?? ""}`.trim();
  if (!combatId) return;
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor || typeof actor.processTemporaryEffectSpecialDuration !== "function") continue;
    await actor.processTemporaryEffectSpecialDuration(eventKey, { combatId });
  }
}

function normalizeCombatWeatherKey(weatherKey) {
  const normalized = `${weatherKey ?? "none"}`.trim().toLowerCase();
  const valid = new Set([
    "none",
    "sunny",
    "harsh-sunlight",
    "rain",
    "typhoon",
    "sandstorm",
    "strong-winds",
    "hail"
  ]);
  return valid.has(normalized) ? normalized : "none";
}

function normalizeCombatTerrainKey(terrainKey) {
  const normalized = `${terrainKey ?? "none"}`.trim().toLowerCase();
  const valid = new Set([
    "none",
    "electric",
    "grassy",
    "misty",
    "psychic"
  ]);
  return valid.has(normalized) ? normalized : "none";
}

function normalizeCombatTerrainScope(scope) {
  const normalized = `${scope ?? "battlefield"}`.trim().toLowerCase();
  return ["battlefield", "side"].includes(normalized) ? normalized : "battlefield";
}

function normalizeCombatTerrainEntry(entry) {
  const terrain = normalizeCombatTerrainKey(entry?.terrain ?? entry?.condition);
  if (terrain === "none") return null;
  const scope = normalizeCombatTerrainScope(entry?.scope);
  return {
    id: `${entry?.id ?? foundry.utils.randomID()}`.trim() || foundry.utils.randomID(),
    terrain,
    scope,
    sideKey:
      scope === "side"
        ? (`${entry?.sideKey ?? ""}`.trim() || null)
        : null,
    sideDisposition:
      scope === "side"
        ? Math.max(-1, Math.min(1, Math.sign(Math.trunc(Number(entry?.sideDisposition ?? 0) || 0))))
        : null,
    durationRounds: Math.max(Math.floor(Number(entry?.durationRounds ?? 0) || 0), 0),
    roundSet: Math.max(Math.floor(Number(entry?.roundSet ?? 0) || 0), 0),
    sourceActorId: `${entry?.sourceActorId ?? ""}`.trim() || null,
    sourceActorName: `${entry?.sourceActorName ?? ""}`.trim(),
    sourceMoveId: `${entry?.sourceMoveId ?? ""}`.trim() || null,
    sourceMoveName: `${entry?.sourceMoveName ?? ""}`.trim()
  };
}

function getCombatTerrainEntries(combat) {
  if (!combat) return [];
  const rawEntries = combat.getFlag(POKROLE.ID, "combat.terrainEntries");
  const normalizedEntries = Array.isArray(rawEntries)
    ? rawEntries.map((entry) => normalizeCombatTerrainEntry(entry)).filter(Boolean)
    : [];
  if (normalizedEntries.length > 0) return normalizedEntries;

  const terrainData = combat.getFlag(POKROLE.ID, "combat.terrain") ?? {};
  const terrainKey = normalizeCombatTerrainKey(terrainData?.condition);
  if (terrainKey === "none") return [];
  return [{
    id: "legacy-battlefield-terrain",
    terrain: terrainKey,
    scope: "battlefield",
    sideDisposition: null,
    durationRounds: Math.max(Math.floor(Number(terrainData?.durationRounds ?? 0) || 0), 0),
    roundSet: Math.max(Math.floor(Number(terrainData?.roundSet ?? 0) || 0), 0),
    sourceActorId: `${terrainData?.sourceActorId ?? ""}`.trim() || null,
    sourceActorName: `${terrainData?.sourceActorName ?? ""}`.trim(),
    sourceMoveId: `${terrainData?.sourceMoveId ?? ""}`.trim() || null,
    sourceMoveName: `${terrainData?.sourceMoveName ?? ""}`.trim()
  }];
}

async function setCombatTerrainEntries(combat, terrainEntries) {
  if (!combat) return [];
  const normalizedEntries = (Array.isArray(terrainEntries) ? terrainEntries : [])
    .map((entry) => normalizeCombatTerrainEntry(entry))
    .filter(Boolean);
  await combat.setFlag(POKROLE.ID, "combat.terrainEntries", normalizedEntries);

  const battlefieldEntry = normalizedEntries.find((entry) => entry.scope === "battlefield") ?? null;
  await combat.setFlag(POKROLE.ID, "combat.terrain", battlefieldEntry
    ? {
        condition: battlefieldEntry.terrain,
        durationRounds: battlefieldEntry.durationRounds,
        roundSet: battlefieldEntry.roundSet,
        sourceActorId: battlefieldEntry.sourceActorId ?? null,
        sourceActorName: battlefieldEntry.sourceActorName ?? "",
        sourceMoveId: battlefieldEntry.sourceMoveId ?? null
      }
    : {
        condition: "none",
        durationRounds: 0,
        roundSet: Math.max(Math.floor(Number(combat.round ?? 0) || 0), 0),
        sourceActorId: null,
        sourceActorName: "",
        sourceMoveId: null
      });
  return normalizedEntries;
}

async function processRoundEndCombatAutomation(combat) {
  if (!combat) return;
  const weatherData = combat.getFlag(POKROLE.ID, "combat.weather") ?? {};
  const weatherKey = normalizeCombatWeatherKey(weatherData?.condition);
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor || typeof actor.processRoundEndCombatAutomation !== "function") continue;
    await actor.processRoundEndCombatAutomation({ weatherKey, combatId: combat.id });
    // Ability round-end triggers (e.g. Rain Dish, Speed Boost, Bad Dreams)
    if (typeof actor.processAbilityTriggerEffects === "function") {
      await actor.processAbilityTriggerEffects("round-end", { combat });
    }
  }
}

async function clearCombatDelayedEffectQueue(combat) {
  if (!combat) return;
  const actor = combat.combatants?.find?.((combatant) => typeof combatant.actor?.clearDelayedEffectQueue === "function")?.actor ?? null;
  if (!actor) return;
  await actor.clearDelayedEffectQueue(combat);
}

async function processCombatDelayedEffectPhase(combat, phase, phaseRound = null) {
  if (!combat) return [];
  const actor = combat.combatants?.find?.((combatant) => typeof combatant.actor?.processDelayedEffectPhase === "function")?.actor ?? null;
  if (!actor) return [];
  return actor.processDelayedEffectPhase(phase, {
    combat,
    phaseRound
  });
}

async function advanceCombatWeatherDuration(combat) {
  if (!combat) return;
  const weatherData = combat.getFlag(POKROLE.ID, "combat.weather") ?? {};
  const weatherKey = normalizeCombatWeatherKey(weatherData?.condition);
  if (weatherKey === "none") return;
  const durationRounds = Math.max(Math.floor(Number(weatherData?.durationRounds ?? 0) || 0), 0);
  if (durationRounds <= 0) return;
  const nextDuration = durationRounds - 1;
  await combat.setFlag(POKROLE.ID, "combat.weather", {
    ...weatherData,
    condition: nextDuration <= 0 ? "none" : weatherKey,
    durationRounds: Math.max(nextDuration, 0)
  });
}

async function advanceCombatTerrainDuration(combat) {
  if (!combat) return;
  const terrainEntries = getCombatTerrainEntries(combat);
  if (terrainEntries.length <= 0) return;
  const nextEntries = [];
  for (const entry of terrainEntries) {
    const durationRounds = Math.max(Math.floor(Number(entry?.durationRounds ?? 0) || 0), 0);
    if (durationRounds <= 0) {
      nextEntries.push(entry);
      continue;
    }
    const nextDuration = durationRounds - 1;
    if (nextDuration <= 0) continue;
    nextEntries.push({
      ...entry,
      durationRounds: nextDuration
    });
  }
  await setCombatTerrainEntries(combat, nextEntries);
}

async function ensureEffectIconDisplay(effectDocument) {
  if (!effectDocument) return;
  const automationFlags = effectDocument.getFlag?.(POKROLE.ID, "automation") ?? {};
  const showTokenIcon = Boolean(
    automationFlags?.showTokenIcon ??
      automationFlags?.alwaysShowIcon ??
      effectDocument?.getFlag?.("core", "overlay")
  );
  if (!showTokenIcon) return;
  const currentImage = `${effectDocument.img ?? ""}`.trim();
  if (currentImage) return;
  await effectDocument.update({ img: "icons/svg/aura.svg" });
}

function getManagedEffectStatusId(effectDocument) {
  const rawIdentifier = `${effectDocument?.uuid ?? effectDocument?.id ?? ""}`
    .trim()
    .toLowerCase();
  if (!rawIdentifier) return "";
  const slug = rawIdentifier
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug ? `pokrole-ae-${slug}` : "";
}

function upsertStatusEffectDefinition(statusEntry) {
  if (!statusEntry?.id) return;
  const nextList = Array.isArray(CONFIG.statusEffects) ? [...CONFIG.statusEffects] : [];
  const existingIndex = nextList.findIndex((entry) => `${entry?.id ?? ""}` === `${statusEntry.id}`);
  if (existingIndex >= 0) {
    nextList[existingIndex] = {
      ...nextList[existingIndex],
      ...statusEntry
    };
  } else {
    nextList.push(statusEntry);
  }
  CONFIG.statusEffects = nextList;
}

function removeStatusEffectDefinition(statusId) {
  const normalizedStatusId = `${statusId ?? ""}`.trim();
  if (!normalizedStatusId) return;
  const currentList = Array.isArray(CONFIG.statusEffects) ? CONFIG.statusEffects : [];
  CONFIG.statusEffects = currentList.filter(
    (entry) => `${entry?.id ?? ""}`.trim() !== normalizedStatusId
  );
}

function clearManagedStatusEffectDefinitions() {
  const currentList = Array.isArray(CONFIG.statusEffects) ? CONFIG.statusEffects : [];
  CONFIG.statusEffects = currentList.filter(
    (entry) => !`${entry?.id ?? ""}`.trim().toLowerCase().startsWith("pokrole-ae-")
  );
}

function resolveShowTokenIconFlag(effectDocument) {
  const automationFlags = effectDocument?.getFlag?.(POKROLE.ID, "automation") ?? {};
  if (Object.prototype.hasOwnProperty.call(automationFlags, "showTokenIcon")) {
    return Boolean(automationFlags.showTokenIcon);
  }
  if (Object.prototype.hasOwnProperty.call(automationFlags, "alwaysShowIcon")) {
    return Boolean(automationFlags.alwaysShowIcon);
  }
  const coreOverlay = effectDocument?.getFlag?.("core", "overlay");
  if (coreOverlay !== undefined && coreOverlay !== null) return Boolean(coreOverlay);
  return true;
}

const EFFECT_TOKEN_ICON_SYNC_LOCK = new Set();

async function synchronizeEffectTokenIcon(effectDocument) {
  if (!effectDocument || effectDocument.documentName !== "ActiveEffect") return;
  const parentActor = effectDocument.parent;
  if (!parentActor || parentActor.documentName !== "Actor") return;

  const statusId = getManagedEffectStatusId(effectDocument);
  if (!statusId) return;

  const lockKey = `${effectDocument.uuid ?? `${parentActor.uuid ?? parentActor.id}:${effectDocument.id}`}`;
  if (EFFECT_TOKEN_ICON_SYNC_LOCK.has(lockKey)) return;
  EFFECT_TOKEN_ICON_SYNC_LOCK.add(lockKey);
  try {
    const wantsTokenIcon = resolveShowTokenIconFlag(effectDocument);
    const shouldShowTokenIcon = wantsTokenIcon && !effectDocument.disabled;
    const currentStatuses = new Set(
      [...(effectDocument.statuses instanceof Set ? effectDocument.statuses : effectDocument?.statuses ?? [])]
        .map((status) => `${status ?? ""}`.trim())
        .filter(Boolean)
    );
    const managedPrefix = "pokrole-ae-";
    const hasExplicitStatus = [...currentStatuses].some(
      (statusEntry) => !statusEntry.toLowerCase().startsWith(managedPrefix)
    );
    const hasManagedStatus = currentStatuses.has(statusId);
    const currentImage = `${effectDocument.img ?? ""}`.trim();
    const updateData = {};

    if (hasExplicitStatus) {
      if (hasManagedStatus) {
        currentStatuses.delete(statusId);
        updateData.statuses = [...currentStatuses];
      }
      removeStatusEffectDefinition(statusId);
    } else if (shouldShowTokenIcon) {
      if (!currentImage) updateData.img = "icons/svg/aura.svg";
      if (!hasManagedStatus) {
        currentStatuses.add(statusId);
        updateData.statuses = [...currentStatuses];
      }
      upsertStatusEffectDefinition({
        id: statusId,
        name: `${effectDocument.name ?? game.i18n.localize("POKROLE.Effects.New")}`.trim() || game.i18n.localize("POKROLE.Effects.New"),
        img: `${updateData.img ?? currentImage ?? "icons/svg/aura.svg"}`
      });
    } else {
      if (hasManagedStatus) {
        currentStatuses.delete(statusId);
        updateData.statuses = [...currentStatuses];
      }
      removeStatusEffectDefinition(statusId);
    }

    if (Object.keys(updateData).length > 0) {
      await effectDocument.update(updateData);
    }
  } finally {
    EFFECT_TOKEN_ICON_SYNC_LOCK.delete(lockKey);
  }
}

async function synchronizeAllActorEffectTokenIcons() {
  if (!game) return;
  clearManagedStatusEffectDefinitions();
  const actorsByKey = new Map();
  const rememberActor = (actor) => {
    if (!actor || actor.documentName !== "Actor") return;
    const actorKey = `${actor.uuid ?? actor.id ?? ""}`.trim();
    if (!actorKey) return;
    actorsByKey.set(actorKey, actor);
  };

  for (const actor of game.actors?.contents ?? []) {
    rememberActor(actor);
  }

  for (const scene of game.scenes?.contents ?? []) {
    for (const tokenDocument of scene?.tokens?.contents ?? []) {
      rememberActor(tokenDocument?.actor ?? null);
    }
  }

  for (const actor of actorsByKey.values()) {
    for (const effectDocument of actor.effects?.contents ?? []) {
      await synchronizeEffectTokenIcon(effectDocument);
    }
  }
}

async function clearSceneScopedMoveDisableEffects(sceneId = null) {
  if (!game) return;
  const normalizedSceneId = `${sceneId ?? canvas?.scene?.id ?? ""}`.trim();
  if (!normalizedSceneId) return;

  const actorsByKey = new Map();
  const rememberActor = (actor) => {
    if (!actor || actor.documentName !== "Actor") return;
    const actorKey = `${actor.uuid ?? actor.id ?? ""}`.trim();
    if (!actorKey) return;
    actorsByKey.set(actorKey, actor);
  };

  for (const actor of game.actors?.contents ?? []) {
    rememberActor(actor);
  }

  for (const token of canvas?.tokens?.placeables ?? []) {
    rememberActor(token?.actor ?? null);
  }

  for (const actor of actorsByKey.values()) {
    if (typeof actor.clearSceneScopedMoveDisableEffects !== "function") continue;
    await actor.clearSceneScopedMoveDisableEffects(normalizedSceneId);
  }
}

async function clearSceneScopedCopiedMoves(sceneId = null) {
  if (!game) return;
  const normalizedSceneId = `${sceneId ?? canvas?.scene?.id ?? ""}`.trim();
  if (!normalizedSceneId) return;

  const actorsByKey = new Map();
  const rememberActor = (actor) => {
    if (!actor || actor.documentName !== "Actor") return;
    const actorKey = `${actor.uuid ?? actor.id ?? ""}`.trim();
    if (!actorKey) return;
    actorsByKey.set(actorKey, actor);
  };

  for (const actor of game.actors?.contents ?? []) {
    rememberActor(actor);
  }

  for (const token of canvas?.tokens?.placeables ?? []) {
    rememberActor(token?.actor ?? null);
  }

  for (const actor of actorsByKey.values()) {
    if (typeof actor.clearSceneScopedCopiedMoves !== "function") continue;
    await actor.clearSceneScopedCopiedMoves(normalizedSceneId);
  }
}

async function clearSceneScopedManagedEffects(sceneId = null) {
  if (!game) return;
  const normalizedSceneId = `${sceneId ?? canvas?.scene?.id ?? ""}`.trim();
  if (!normalizedSceneId) return;

  const actorsByKey = new Map();
  const rememberActor = (actor) => {
    if (!actor || actor.documentName !== "Actor") return;
    const actorKey = `${actor.uuid ?? actor.id ?? ""}`.trim();
    if (!actorKey) return;
    actorsByKey.set(actorKey, actor);
  };

  for (const actor of game.actors?.contents ?? []) {
    rememberActor(actor);
  }

  for (const token of canvas?.tokens?.placeables ?? []) {
    rememberActor(token?.actor ?? null);
  }

  for (const actor of actorsByKey.values()) {
    if (typeof actor.clearSceneScopedManagedEffects !== "function") continue;
    await actor.clearSceneScopedManagedEffects(normalizedSceneId);
  }
}

async function clearSceneScopedTransformState(sceneId = null) {
  if (!game) return;
  const normalizedSceneId = `${sceneId ?? canvas?.scene?.id ?? ""}`.trim();
  if (!normalizedSceneId) return;

  const actorsByKey = new Map();
  const rememberActor = (actor) => {
    if (!actor || actor.documentName !== "Actor") return;
    const actorKey = `${actor.uuid ?? actor.id ?? ""}`.trim();
    if (!actorKey) return;
    actorsByKey.set(actorKey, actor);
  };

  for (const actor of game.actors?.contents ?? []) {
    rememberActor(actor);
  }

  for (const token of canvas?.tokens?.placeables ?? []) {
    rememberActor(token?.actor ?? null);
  }

  for (const actor of actorsByKey.values()) {
    if (typeof actor.clearSceneScopedTransformState !== "function") continue;
    await actor.clearSceneScopedTransformState(normalizedSceneId);
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
  { key: "dead", label: "POKROLE.Conditions.Dead", icon: "icons/svg/skull.svg" },
  { key: "confused", label: "POKROLE.Move.Secondary.Condition.Confused", icon: "icons/svg/daze.svg" },
  { key: "flinch", label: "POKROLE.Move.Secondary.Condition.Flinch", icon: "icons/svg/falling.svg" },
  { key: "disabled", label: "POKROLE.Move.Secondary.Condition.Disabled", icon: "icons/svg/cancel.svg" },
  { key: "infatuated", label: "POKROLE.Move.Secondary.Condition.Infatuated", icon: "icons/svg/heal.svg" },
  { key: "badly-poisoned", label: "POKROLE.Move.Secondary.Condition.BadlyPoisoned", icon: getSystemAssetPath("assets/ailments/poisoned.svg") }
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

function normalizeSpecialDurationList(value) {
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

function getDurationModeLabelPath(durationMode) {
  const labelByMode = {
    manual: "POKROLE.Move.Secondary.Duration.Mode.Manual",
    rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds"
  };
  return labelByMode[durationMode] ?? "POKROLE.Common.Unknown";
}

function getSpecialDurationLabelPath(durationKey) {
  const labelByDuration = {
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
  return labelByDuration[durationKey] ?? "POKROLE.Common.Unknown";
}

function getPassiveTriggerLabelPath(triggerKey) {
  const labelByTrigger = {
    always: "POKROLE.Effects.PassiveTrigger.Always",
    "in-combat": "POKROLE.Effects.PassiveTrigger.InCombat",
    "out-of-combat": "POKROLE.Effects.PassiveTrigger.OutOfCombat",
    "self-hp-half-or-less": "POKROLE.Effects.PassiveTrigger.SelfHpHalfOrLess",
    "self-hp-quarter-or-less": "POKROLE.Effects.PassiveTrigger.SelfHpQuarterOrLess",
    "self-hp-below-threshold": "POKROLE.Effects.PassiveTrigger.SelfHpBelowThreshold",
    "target-hp-half-or-less": "POKROLE.Effects.PassiveTrigger.TargetHpHalfOrLess",
    "target-hp-quarter-or-less": "POKROLE.Effects.PassiveTrigger.TargetHpQuarterOrLess",
    "target-hp-below-threshold": "POKROLE.Effects.PassiveTrigger.TargetHpBelowThreshold",
    "self-has-condition": "POKROLE.Effects.PassiveTrigger.SelfHasCondition",
    "self-missing-condition": "POKROLE.Effects.PassiveTrigger.SelfMissingCondition",
    "target-has-condition": "POKROLE.Effects.PassiveTrigger.TargetHasCondition",
    "target-missing-condition": "POKROLE.Effects.PassiveTrigger.TargetMissingCondition"
  };
  return labelByTrigger[triggerKey] ?? "POKROLE.Common.Unknown";
}

function getConditionLabelPath(conditionKey) {
  const labelByCondition = {
    none: "POKROLE.Common.None",
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
  return labelByCondition[conditionKey] ?? "POKROLE.Common.Unknown";
}

function registerTemplateHelpers() {
  const handlebars = globalThis.Handlebars;
  if (!handlebars || handlebars.helpers?.safeSelectOptions) return;

  handlebars.registerHelper("safeSelectOptions", function safeSelectOptions(choices, helperOptions) {
    const sourceChoices = choices && typeof choices === "object" ? choices : {};
    const optionsHash = helperOptions?.hash ?? {};
    const selectOptionsHelper = handlebars.helpers?.selectOptions;
    if (typeof selectOptionsHelper !== "function") return "";
    return selectOptionsHelper.call(this, sourceChoices, {
      hash: optionsHash,
      data: helperOptions?.data,
      fn: helperOptions?.fn,
      inverse: helperOptions?.inverse
    });
  });
}

function getStackModeLabelPath(stackModeKey) {
  const labelByStackMode = {
    "name-origin": "POKROLE.Effects.StackMode.NameOrigin",
    name: "POKROLE.Effects.StackMode.Name",
    origin: "POKROLE.Effects.StackMode.Origin",
    multiple: "POKROLE.Effects.StackMode.Multiple"
  };
  return labelByStackMode[stackModeKey] ?? "POKROLE.Common.Unknown";
}

function createAeSpecialDurationRow(index, selectedKey = "") {
  const normalizedSelected = `${selectedKey ?? ""}`.trim().toLowerCase();
  const optionsHtml = MOVE_SECONDARY_SPECIAL_DURATION_KEYS
    .filter((durationKey) => durationKey !== "none")
    .map((durationKey) => {
      const selected = durationKey === normalizedSelected ? " selected" : "";
      const label = game.i18n.localize(getSpecialDurationLabelPath(durationKey));
      return `<option value="${durationKey}"${selected}>${label}</option>`;
    })
    .join("");
  return `
    <div class="pokrole-ae-special-duration-row" data-special-index="${index}">
      <select name="flags.${POKROLE.ID}.automation.specialDuration.${index}">
        ${optionsHtml}
      </select>
      <button
        type="button"
        class="pokrole-ae-remove-duration icon-button danger"
        data-special-index="${index}"
        title="${game.i18n.localize("POKROLE.Actions.Delete")}"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;
}

function resolveRenderedRootElement(rendered) {
  if (!rendered) return null;
  if (rendered instanceof HTMLElement) return rendered;
  if (Array.isArray(rendered) && rendered[0] instanceof HTMLElement) return rendered[0];
  if (rendered[0] instanceof HTMLElement) return rendered[0];
  if (rendered.element instanceof HTMLElement) return rendered.element;
  if (typeof rendered.querySelector === "function") return rendered;
  return null;
}

function resolveEffectConfigForm(rootElement) {
  if (!rootElement) return null;
  if (rootElement.matches?.("form")) return rootElement;
  return rootElement.querySelector?.("form") ?? rootElement;
}

function isNavigationTabNode(node) {
  if (!node) return true;
  const tagName = `${node.tagName ?? ""}`.toLowerCase();
  if (tagName === "a" || tagName === "button" || tagName === "nav") return true;
  if (node.classList?.contains("item")) return true;
  if (node.getAttribute?.("role") === "tab") return true;
  const parent = node.parentElement;
  if (!parent) return false;
  if (parent.classList?.contains("tabs")) return true;
  if (parent.getAttribute?.("role") === "tablist") return true;
  return false;
}

function resolveTabPane(rootElement, tabKey) {
  if (!rootElement) return null;
  const selectors = [
    `.tab[data-tab='${tabKey}']`,
    `section[data-tab='${tabKey}']`,
    `div[data-tab='${tabKey}']`,
    `[data-application-part='${tabKey}']`,
    `[data-panel='${tabKey}']`,
    `[data-tab-content='${tabKey}']`,
    `[data-tab='${tabKey}']`
  ];

  for (const selector of selectors) {
    const candidates = [...rootElement.querySelectorAll(selector)];
    for (const candidate of candidates) {
      if (isNavigationTabNode(candidate)) continue;
      return candidate;
    }
  }

  const tabControls = [...rootElement.querySelectorAll(`[data-tab='${tabKey}'], [data-action='tab'][data-tab='${tabKey}']`)];
  for (const control of tabControls) {
    const controlTargetId = `${control.getAttribute?.("aria-controls") ?? ""}`.trim();
    if (!controlTargetId) continue;
    const escapedId = typeof globalThis.CSS?.escape === "function"
      ? globalThis.CSS.escape(controlTargetId)
      : controlTargetId;
    const panelNode = rootElement.querySelector(`#${escapedId}`);
    if (!panelNode || isNavigationTabNode(panelNode)) continue;
    return panelNode;
  }

  return null;
}

function isActiveEffectConfigApp(app) {
  if (!app) return false;
  const targetDocument = app?.object ?? app?.document ?? null;
  if (`${targetDocument?.documentName ?? ""}` === "ActiveEffect") return true;
  const className = `${app?.constructor?.name ?? ""}`.trim().toLowerCase();
  const appId = `${app?.id ?? ""}`.trim().toLowerCase();
  return className.includes("activeeffect") || appId.includes("active-effect");
}

function renderActiveEffectAutomationConfig(app, html) {
  if (!isActiveEffectConfigApp(app)) return;
  const effectDocument = app?.object ?? app?.document ?? null;
  const parentActor = effectDocument?.parent ?? null;
  if (!parentActor || parentActor.documentName !== "Actor") return;
  if (parentActor.type !== "trainer" && parentActor.type !== "pokemon") return;

  const root = resolveRenderedRootElement(html);
  if (!root || typeof root.querySelector !== "function") return;

  const formRoot = resolveEffectConfigForm(root);
  root.classList?.add?.("pok-role-ae-config");
  formRoot?.classList?.add?.("pok-role-ae-config");

  root.querySelectorAll(".pokrole-ae-details-panel, .pokrole-ae-duration-panel").forEach((node) => node.remove());
  formRoot?.querySelectorAll?.(".pokrole-ae-details-panel, .pokrole-ae-duration-panel")?.forEach?.((node) => node.remove());

  const detailsTab =
    resolveTabPane(formRoot, "details") ??
    resolveTabPane(root, "details") ??
    formRoot ??
    root;
  const durationTab =
    resolveTabPane(formRoot, "duration") ??
    resolveTabPane(root, "duration") ??
    detailsTab;

  const automationFlags = effectDocument.getFlag(POKROLE.ID, "automation") ?? {};
  const rawDurationMode = `${automationFlags?.durationMode ?? "manual"}`
    .trim()
    .toLowerCase();
  const durationMode = ["manual", "rounds"].includes(rawDurationMode)
    ? rawDurationMode
    : "manual";
  const rawRounds = Number(automationFlags?.durationRounds);
  const durationRounds = Number.isFinite(rawRounds)
    ? Math.min(Math.max(Math.floor(rawRounds), 1), 99)
    : 1;
  const specialDuration = normalizeSpecialDurationList(automationFlags?.specialDuration);
  const passiveEnabled = Boolean(automationFlags?.passive);
  const passiveTrigger = EFFECT_PASSIVE_TRIGGER_KEYS.includes(`${automationFlags?.passiveTrigger ?? ""}`)
    ? `${automationFlags.passiveTrigger}`
    : "always";
  const passiveCondition = MOVE_SECONDARY_CONDITION_KEYS.includes(`${automationFlags?.passiveCondition ?? ""}`)
    ? `${automationFlags.passiveCondition}`
    : "none";
  const passiveThreshold = Number.isFinite(Number(automationFlags?.passiveThreshold))
    ? Math.min(Math.max(Math.floor(Number(automationFlags.passiveThreshold)), 1), 99)
    : 50;
  const rawStackMode = `${automationFlags?.stackMode ?? "name-origin"}`.trim().toLowerCase();
  const stackMode = ["name-origin", "name", "origin", "multiple"].includes(rawStackMode)
    ? rawStackMode
    : "name-origin";
  const showTokenIcon = resolveShowTokenIconFlag(effectDocument);

  const modeOptionsHtml = ["manual", "rounds"].map((modeKey) => {
    const selected = modeKey === durationMode ? " selected" : "";
    const label = game.i18n.localize(getDurationModeLabelPath(modeKey));
    return `<option value="${modeKey}"${selected}>${label}</option>`;
  }).join("");

  const passiveTriggerOptionsHtml = EFFECT_PASSIVE_TRIGGER_KEYS.map((triggerKey) => {
    const selected = triggerKey === passiveTrigger ? " selected" : "";
    const label = game.i18n.localize(getPassiveTriggerLabelPath(triggerKey));
    return `<option value="${triggerKey}"${selected}>${label}</option>`;
  }).join("");

  const passiveConditionOptionsHtml = MOVE_SECONDARY_CONDITION_KEYS.map((conditionKey) => {
    const selected = conditionKey === passiveCondition ? " selected" : "";
    const label = game.i18n.localize(getConditionLabelPath(conditionKey));
    return `<option value="${conditionKey}"${selected}>${label}</option>`;
  }).join("");
  const stackModeOptionsHtml = ["name-origin", "name", "origin", "multiple"]
    .map((stackModeKey) => {
      const selected = stackModeKey === stackMode ? " selected" : "";
      const label = game.i18n.localize(getStackModeLabelPath(stackModeKey));
      return `<option value="${stackModeKey}"${selected}>${label}</option>`;
    })
    .join("");

  const specialRowsHtml = (specialDuration.length > 0 ? specialDuration : [])
    .map((durationKey, index) => createAeSpecialDurationRow(index, durationKey))
    .join("");

  const passiveChecked = passiveEnabled ? " checked" : "";
  const showTokenIconChecked = showTokenIcon ? " checked" : "";
  const thresholdRowClass = passiveTrigger.includes("threshold") ? "" : " is-hidden";
  const conditionRowClass = passiveTrigger.includes("condition") ? "" : " is-hidden";

  const detailsSection = document.createElement("fieldset");
  detailsSection.className = "pokrole-ae-automation pokrole-ae-details-panel";
  detailsSection.innerHTML = `
    <legend>${game.i18n.localize("POKROLE.Effects.Passive")}</legend>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Effects.Passive")}</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.${POKROLE.ID}.automation.passive" ${passiveChecked} />
      </div>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Effects.PassiveTrigger.Label")}</label>
      <div class="form-fields">
        <select name="flags.${POKROLE.ID}.automation.passiveTrigger">
          ${passiveTriggerOptionsHtml}
        </select>
      </div>
    </div>
    <div class="form-group pokrole-ae-condition-row${conditionRowClass}">
      <label>${game.i18n.localize("POKROLE.Effects.PassiveTrigger.Condition")}</label>
      <div class="form-fields">
        <select name="flags.${POKROLE.ID}.automation.passiveCondition">
          ${passiveConditionOptionsHtml}
        </select>
      </div>
    </div>
    <div class="form-group pokrole-ae-threshold-row${thresholdRowClass}">
      <label>${game.i18n.localize("POKROLE.Effects.PassiveTrigger.Threshold")}</label>
      <div class="form-fields">
        <input
          type="number"
          name="flags.${POKROLE.ID}.automation.passiveThreshold"
          value="${passiveThreshold}"
          min="1"
          max="99"
          data-dtype="Number"
        />
      </div>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Effects.StackMode.Label")}</label>
      <div class="form-fields">
        <select name="flags.${POKROLE.ID}.automation.stackMode">
          ${stackModeOptionsHtml}
        </select>
      </div>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Effects.ShowTokenIcon")}</label>
      <div class="form-fields">
        <input type="checkbox" name="flags.${POKROLE.ID}.automation.showTokenIcon" ${showTokenIconChecked} />
      </div>
    </div>
  `;

  const durationSection = document.createElement("fieldset");
  durationSection.className = "pokrole-ae-automation pokrole-ae-duration-panel";
  durationSection.innerHTML = `
    <legend>${game.i18n.localize("POKROLE.Move.Secondary.Duration.Mode.Label")}</legend>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Move.Secondary.Duration.Mode.Label")}</label>
      <div class="form-fields">
        <select name="flags.${POKROLE.ID}.automation.durationMode">
          ${modeOptionsHtml}
        </select>
      </div>
    </div>
    <div class="form-group pokrole-ae-rounds-row">
      <label>${game.i18n.localize("POKROLE.Move.Secondary.Duration.Rounds")}</label>
      <div class="form-fields">
        <input
          type="number"
          name="flags.${POKROLE.ID}.automation.durationRounds"
          value="${durationRounds}"
          min="1"
          max="99"
          data-dtype="Number"
        />
      </div>
    </div>
    <div class="form-group">
      <label>${game.i18n.localize("POKROLE.Move.Secondary.Duration.Special.Label")}</label>
      <div class="form-fields">
        <input type="hidden" name="flags.${POKROLE.ID}.automation.specialDuration.__empty" value="" />
        <div class="pokrole-ae-special-duration-list" data-next-index="${specialDuration.length}">
          ${specialRowsHtml}
        </div>
      </div>
    </div>
    <div class="form-group">
      <div class="form-fields">
        <button type="button" class="pokrole-ae-add-duration">
          <i class="fas fa-plus"></i>
          ${game.i18n.localize("POKROLE.Move.Secondary.Duration.Special.Add")}
        </button>
      </div>
    </div>
  `;

  detailsTab.appendChild(detailsSection);
  durationTab.appendChild(durationSection);

  const durationModeSelect = durationSection.querySelector(`select[name="flags.${POKROLE.ID}.automation.durationMode"]`);
  const roundsRow = durationSection.querySelector(".pokrole-ae-rounds-row");
  const passiveTriggerSelect = detailsSection.querySelector(`select[name="flags.${POKROLE.ID}.automation.passiveTrigger"]`);
  const thresholdRow = detailsSection.querySelector(".pokrole-ae-threshold-row");
  const conditionRow = detailsSection.querySelector(".pokrole-ae-condition-row");
  const addDurationButton = durationSection.querySelector(".pokrole-ae-add-duration");
  const specialDurationList = durationSection.querySelector(".pokrole-ae-special-duration-list");

  const refreshRoundVisibility = () => {
    const mode = `${durationModeSelect?.value ?? "manual"}`.trim().toLowerCase();
    if (roundsRow) roundsRow.classList.toggle("is-hidden", mode !== "rounds");
  };
  const refreshPassiveVisibility = () => {
    const trigger = `${passiveTriggerSelect?.value ?? "always"}`.trim().toLowerCase();
    if (thresholdRow) thresholdRow.classList.toggle("is-hidden", !trigger.includes("threshold"));
    if (conditionRow) conditionRow.classList.toggle("is-hidden", !trigger.includes("condition"));
  };

  const getNextSpecialDurationIndex = () => {
    const rawNext = Number(specialDurationList?.dataset?.nextIndex ?? 0);
    const current = Number.isFinite(rawNext) && rawNext >= 0 ? Math.floor(rawNext) : 0;
    if (specialDurationList) specialDurationList.dataset.nextIndex = `${current + 1}`;
    return current;
  };

  addDurationButton?.addEventListener("click", (event) => {
    event.preventDefault();
    if (!specialDurationList) return;
    const index = getNextSpecialDurationIndex();
    specialDurationList.insertAdjacentHTML("beforeend", createAeSpecialDurationRow(index, "turn-start"));
  });

  durationSection.addEventListener("click", (event) => {
    const removeButton = event.target.closest(".pokrole-ae-remove-duration");
    if (!removeButton) return;
    event.preventDefault();
    removeButton.closest(".pokrole-ae-special-duration-row")?.remove();
  });

  durationModeSelect?.addEventListener("change", refreshRoundVisibility);
  passiveTriggerSelect?.addEventListener("change", refreshPassiveVisibility);
  refreshRoundVisibility();
  refreshPassiveVisibility();
}

// Force actorLink=true by default on all new actors so token data stays in sync
Hooks.on("preCreateActor", (actor) => {
  actor.updateSource({ "prototypeToken.actorLink": true });
});

Hooks.once("init", () => {
  console.log(`${POKROLE.ID} | Initializing ${POKROLE.TITLE}`);
  registerTemplateHelpers();

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
  CONFIG.Combat.documentClass = PokRoleCombat;

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
  // Pending mutation responses keyed by requestId
  const _pendingMutationRequests = new Map();

  game.pokrole.requestCombatMutation = async (operation, payload = {}) => {
    if (game.user?.isGM) {
      const directResult = await handleCombatMutationSocketRequest({
        operation,
        payload: {
          ...payload,
          requesterUserId: payload?.requesterUserId ?? game.user?.id ?? null
        }
      });
      if (!directResult?.ok) {
        throw new Error(directResult?.error ?? "Combat mutation failed.");
      }
      return directResult;
    }
    const activeGm = getPrimaryActiveGm();
    if (!activeGm) {
      throw new Error("No active GM is available to process the combat mutation.");
    }
    const requestId = `${game.user?.id ?? "anon"}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        _pendingMutationRequests.delete(requestId);
        reject(new Error("Combat mutation timed out (no GM response after 15s)."));
      }, 15000);
      _pendingMutationRequests.set(requestId, { resolve, reject, timeout });
      console.log(`PokRole | [player socket] Emitting combat-mutation: op=${operation}, requestId=${requestId}, event=${COMBAT_MUTATION_SOCKET_EVENT}`);
      game.socket.emit(
        COMBAT_MUTATION_SOCKET_EVENT,
        {
          type: "combat-mutation",
          operation,
          requestId,
          payload: {
            ...payload,
            requesterUserId: payload?.requesterUserId ?? game.user?.id ?? null
          }
        }
      );
    });
  };

  // Single unified socket listener for all combat mutation messages
  // (handles both GM-side requests AND player-side responses)
  game.pokrole.seedCompendia = async (options = {}) => seedCompendia(options);

  // Auto-update compendia images when system version changes
  if (game.user?.isGM) {
    const SEED_VERSION_KEY = "pok-role-system.lastSeededVersion";
    const currentVersion = `${game.system?.version ?? ""}`.trim();
    const lastSeeded = game.settings.storage?.get("world")?.getItem(SEED_VERSION_KEY) ?? "";
    if (currentVersion && currentVersion !== lastSeeded) {
      console.log(`PokRole | System version changed (${lastSeeded || "none"} -> ${currentVersion}), updating compendia...`);
      try {
        await seedCompendia({ force: false, notify: false });
        game.settings.storage?.get("world")?.setItem(SEED_VERSION_KEY, currentVersion);
        console.log(`PokRole | Compendia updated for version ${currentVersion}`);
      } catch (e) {
        console.error(`PokRole | Failed to update compendia:`, e);
      }
    }
  }

  game.pokrole.renderMoveQueueOverlay = async () => renderMoveQueueOverlay();
  game.pokrole.enqueueCombatMoveDeclaration = async (entry, combat = game.combat ?? null) =>
    enqueueCombatMoveDeclaration(entry, combat);
  game.pokrole.clearCombatMoveQueue = async (combat = game.combat ?? null) =>
    clearCombatMoveQueue(combat);
  game.pokrole.removeCombatMoveEntry = async (entryId, combat = game.combat ?? null) =>
    removeCombatMoveEntry(combat, entryId);
  game.pokrole.moveCombatMoveEntry = async (entryId, targetIndex, combat = game.combat ?? null) =>
    moveCombatMoveEntry(combat, entryId, targetIndex);
  game.pokrole.executeCombatMoveEntry = async (entryId, combat = game.combat ?? null) =>
    executeCombatMoveEntry(combat, entryId);
  game.socket.on(COMBAT_MUTATION_SOCKET_EVENT, async (message = {}) => {
    const msgType = `${message?.type ?? ""}`.trim();
    console.log(`PokRole | [socket] Received message: type=${msgType}, isGM=${game.user?.isGM}, data=`, message);

    // Player receives GM response
    if (msgType === "combat-mutation-response") {
      const requestId = `${message?.requestId ?? ""}`.trim();
      if (!requestId) return;
      const pending = _pendingMutationRequests.get(requestId);
      if (!pending) return;
      _pendingMutationRequests.delete(requestId);
      clearTimeout(pending.timeout);
      if (!message?.ok) {
        pending.reject(new Error(message?.error ?? "Combat mutation failed."));
      } else {
        pending.resolve(message);
      }
      return;
    }

    // GM receives player request
    if (msgType === "combat-mutation") {
      if (!game.user?.isGM) return;
      const activeGm = getPrimaryActiveGm();
      if (activeGm?.id && activeGm.id !== game.user.id) return;
      const requestId = `${message?.requestId ?? ""}`.trim();
      console.log(`PokRole | [GM socket] Processing mutation: op=${message?.operation}, requestId=${requestId}`);
      const response = await handleCombatMutationSocketRequest(message);
      console.log(`PokRole | [GM socket] Sending response:`, response);
      if (requestId) {
        game.socket.emit(COMBAT_MUTATION_SOCKET_EVENT, {
          type: "combat-mutation-response",
          requestId,
          ...response
        });
      }
      return;
    }
  });
  await synchronizeAllActorEffectTokenIcons();
  await clearSceneScopedMoveDisableEffects(canvas?.scene?.id ?? null);
  await clearSceneScopedCopiedMoves(canvas?.scene?.id ?? null);
  await clearSceneScopedManagedEffects(canvas?.scene?.id ?? null);
  await clearSceneScopedTransformState(canvas?.scene?.id ?? null);
  for (const actor of game.actors?.contents ?? []) {
    if (actor?.type !== "pokemon") continue;
    if (typeof actor.synchronizeConditionFlags === "function") {
      await actor.synchronizeConditionFlags();
    }
    if (typeof actor.synchronizeFaintedFromHp !== "function") continue;
    await actor.synchronizeFaintedFromHp();
  }
  await renderMoveQueueOverlay();

  // Migration: set isRanged on known physical ranged moves
  if (game.user.isGM) {
    const PHYSICAL_RANGED_MOVES = new Set([
      "Attack Order", "Bullet Seed", "Pay Day", "Pin Missile",
      "Razor Leaf", "Rock Slide", "Smack Down", "Thousand Arrows"
    ]);

    // Update moves on all actor sheets
    for (const actor of game.actors?.contents ?? []) {
      const updates = [];
      for (const item of actor.items) {
        if (item.type !== "move") continue;
        if (PHYSICAL_RANGED_MOVES.has(item.name) && !item.system.isRanged) {
          updates.push({ _id: item.id, "system.isRanged": true });
        }
      }
      if (updates.length > 0) {
        await actor.updateEmbeddedDocuments("Item", updates);
      }
    }

    // Update moves in the compendium
    const movesPack = game.packs.get("pok-role-system.moves");
    if (movesPack) {
      const wasLocked = movesPack.locked;
      if (wasLocked) await movesPack.configure({ locked: false });
      const index = await movesPack.getIndex({ fields: ["name", "system.isRanged", "system.category"] });
      for (const entry of index) {
        if (PHYSICAL_RANGED_MOVES.has(entry.name)) {
          const doc = await movesPack.getDocument(entry._id);
          if (doc && !doc.system.isRanged) {
            await doc.update({ "system.isRanged": true });
          }
        }
      }
      if (wasLocked) await movesPack.configure({ locked: true });
    }
  }
});

Hooks.on("canvasReady", async (canvasDocument) => {
  await clearSceneScopedMoveDisableEffects(canvasDocument?.scene?.id ?? canvas?.scene?.id ?? null);
  await clearSceneScopedCopiedMoves(canvasDocument?.scene?.id ?? canvas?.scene?.id ?? null);
  await clearSceneScopedManagedEffects(canvasDocument?.scene?.id ?? canvas?.scene?.id ?? null);
  await clearSceneScopedTransformState(canvasDocument?.scene?.id ?? canvas?.scene?.id ?? null);
});

Hooks.on("updateCombat", async (combat, changed) => {
  const hasCombatEnded =
    Object.prototype.hasOwnProperty.call(changed, "active") && changed.active === false;
  if (hasCombatEnded) {
    await clearCombatMoveQueue(combat);
    await clearCombatDelayedEffectQueue(combat);
    await processCombatSpecialDurationEvent(combat, "combat-end");
    await clearCombatScopedTemporaryEffects(combat);
    await combat.unsetFlag?.(POKROLE.ID, "combat.sideFieldEntries");
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant?.actor ?? null;
      if (!actor) continue;
      if (typeof actor._clearBideState === "function") {
        await actor._clearBideState();
      }
    }
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
  const previousRound = Number.isInteger(combat?.previous?.round) ? combat.previous.round : null;
  const shouldProcessTurnState = hasTurnChange || hasRoundChange;
  if (shouldProcessTurnState) {
    const previousActor = previousTurn !== null ? combat.turns?.[previousTurn]?.actor ?? null : null;
    if (
      previousActor &&
      previousActor.documentName === "Actor" &&
      previousTurn !== currentTurn &&
      typeof previousActor.processTemporaryEffectSpecialDuration === "function"
    ) {
      await previousActor.processTemporaryEffectSpecialDuration("turn-end", { combatId });
    }
    // Ability turn-end triggers
    if (
      previousActor &&
      previousActor.documentName === "Actor" &&
      previousTurn !== currentTurn &&
      typeof previousActor.processAbilityTriggerEffects === "function"
    ) {
      await previousActor.processAbilityTriggerEffects("turn-end", { combat });
    }

    const currentActor = currentTurn !== null ? combat.turns?.[currentTurn]?.actor ?? null : null;
    if (
      !hasRoundChange &&
      currentActor &&
      currentActor.documentName === "Actor" &&
      previousTurn !== currentTurn &&
      typeof currentActor.processTemporaryEffectSpecialDuration === "function"
    ) {
      await currentActor.processTemporaryEffectSpecialDuration("turn-start", { combatId });
    }
    if (
      !hasRoundChange &&
      currentActor &&
      currentActor.documentName === "Actor" &&
      previousTurn !== currentTurn &&
      typeof currentActor.processTurnStartStatusAutomation === "function"
    ) {
      await currentActor.processTurnStartStatusAutomation();
    }
    // Ability turn-start triggers
    if (
      !hasRoundChange &&
      currentActor &&
      currentActor.documentName === "Actor" &&
      previousTurn !== currentTurn &&
      typeof currentActor.processAbilityTriggerEffects === "function"
    ) {
      await currentActor.processAbilityTriggerEffects("turn-start", { combat });
    }
  }

  if (!hasRoundChange) {
    LAST_COMBAT_TURN_STATE.set(combatId, {
      turn: Number.isInteger(combat.turn) ? combat.turn : null,
      round: Number.isInteger(combat.round) ? combat.round : null
    });
    return;
  }
  if (Number.isFinite(previousRound) && previousRound >= 1) {
    const roundEndKey = `${combatId}:${previousRound}`;
    const alreadyProcessed = PokRoleCombat._processedRoundEnds.has(roundEndKey);
    if (alreadyProcessed) {
      PokRoleCombat._processedRoundEnds.delete(roundEndKey);
    }
    await processCombatSpecialDurationEvent(combat, "round-end");
    await processCombatDelayedEffectPhase(combat, "round-end", previousRound);
    if (!alreadyProcessed) {
      await processRoundEndCombatAutomation(combat);
      await advanceCombatWeatherDuration(combat);
      await advanceCombatTerrainDuration(combat);
      const referenceActor = combat.combatants?.find?.((combatant) => combatant.actor)?.actor ?? null;
      if (referenceActor && typeof referenceActor.synchronizeTerrainEffectsForCombat === "function") {
        await referenceActor.synchronizeTerrainEffectsForCombat(combat);
      }
    }
  }
  await clearCombatMoveQueue(combat);
  if ((combat.round ?? 0) <= 0) {
    LAST_COMBAT_TURN_STATE.set(combatId, {
      turn: Number.isInteger(combat.turn) ? combat.turn : null,
      round: Number.isInteger(combat.round) ? combat.round : null
    });
    return;
  }
  const roundKey = `${combat.id}:${combat.round ?? 0}`;

  // Enter-battle ability triggers when combat first starts (round 1)
  if ((combat.round ?? 0) === 1 && previousRound === 0) {
    for (const combatant of combat.combatants ?? []) {
      const actor = combatant.actor;
      if (!actor || typeof actor.processAbilityTriggerEffects !== "function") continue;
      try {
        await actor.processAbilityTriggerEffects("enter-battle", { combat });
      } catch (err) {
        console.warn(`PokRole | Enter-battle ability processing failed for ${actor.name}:`, err);
      }
    }
  }

  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor) continue;

    try {
      if (typeof actor.synchronizeConditionalActiveEffects === "function") {
        await actor.synchronizeConditionalActiveEffects();
      }

      if (typeof actor.advanceManagedAutomationEffectsRound === "function") {
        await actor.advanceManagedAutomationEffectsRound(combat.id);
      }

      if (typeof actor.advanceTemporaryEffectsRound === "function") {
        await actor.advanceTemporaryEffectsRound(combat.id);
      }

      if (typeof actor.resetTurnState === "function") {
        await actor.resetTurnState({ roundKey, resetInitiative: false });
      }

      // Ability round-start triggers
      if (typeof actor.processAbilityTriggerEffects === "function") {
        await actor.processAbilityTriggerEffects("round-start", { combat });
      }
    } catch (err) {
      console.warn(`PokRole | Round-start processing failed for ${actor.name}:`, err);
    }
  }

  // Initiative re-roll is handled by PokRoleCombat.nextRound()

  await processCombatDelayedEffectPhase(combat, "round-start", combat.round ?? 0);

  const currentActor = combat.turns?.[combat.turn ?? 0]?.actor ?? null;
  if (
    currentActor &&
    currentActor.documentName === "Actor" &&
    typeof currentActor.processTemporaryEffectSpecialDuration === "function"
  ) {
    await currentActor.processTemporaryEffectSpecialDuration("turn-start", { combatId });
  }
  if (
    currentActor &&
    currentActor.documentName === "Actor" &&
    typeof currentActor.processTurnStartStatusAutomation === "function"
  ) {
    await currentActor.processTurnStartStatusAutomation();
  }
  // Ability turn-start triggers for the first combatant of the new round
  if (
    currentActor &&
    currentActor.documentName === "Actor" &&
    typeof currentActor.processAbilityTriggerEffects === "function"
  ) {
    await currentActor.processAbilityTriggerEffects("turn-start", { combat });
  }

  LAST_COMBAT_TURN_STATE.set(combatId, {
    turn: Number.isInteger(combat.turn) ? combat.turn : null,
    round: Number.isInteger(combat.round) ? combat.round : null
  });
});

// Cache combatant actors before combat deletion (combatants may be empty after delete)
const COMBAT_ACTOR_CACHE = new Map();
Hooks.on("preDeleteCombat", (combat) => {
  const actors = [];
  for (const combatant of combat?.combatants ?? []) {
    const actor = combatant?.actor ?? null;
    if (actor) actors.push(actor);
  }
  if (actors.length > 0) COMBAT_ACTOR_CACHE.set(combat.id, actors);
});

Hooks.on("deleteCombat", async (combat) => {
  const combatId = `${combat?.id ?? ""}`.trim();
  const cachedActors = COMBAT_ACTOR_CACHE.get(combatId) ?? [];
  COMBAT_ACTOR_CACHE.delete(combatId);

  try { await clearCombatDelayedEffectQueue(combat); } catch (_e) { /* combat already deleted */ }

  // Collect ALL actors that might have combat-scoped effects:
  // 1) cached combatant actors (from preDeleteCombat)
  // 2) all game actors (linked tokens)
  // 3) all scene token actors (unlinked/synthetic tokens)
  const actorsToClean = new Map();
  for (const actor of cachedActors) {
    if (actor?.id) actorsToClean.set(actor.id, actor);
  }
  for (const actor of game.actors ?? []) {
    if (actor?.id && !actorsToClean.has(actor.id)) {
      actorsToClean.set(actor.id, actor);
    }
  }
  // Include unlinked token actors from ALL scenes
  for (const scene of game.scenes ?? []) {
    for (const token of scene.tokens ?? []) {
      const tokenActor = token?.actor;
      if (tokenActor?.id && !actorsToClean.has(tokenActor.id)) {
        actorsToClean.set(tokenActor.id, tokenActor);
      }
    }
  }

  console.log(`PokRole | Combat ended (${combatId}), cleaning up ${actorsToClean.size} actors (${cachedActors.length} cached)`);

  for (const actor of actorsToClean.values()) {
    const allEffects = actor.effects?.contents ?? [];

    // Debug: log ALL effects and their automation flags
    for (const e of allEffects) {
      const flags = e.getFlag?.("pok-role-system", "automation") ?? {};
      const hasManagedFlag = Boolean(flags?.managed);
      const hasExpireFlag = Boolean(flags?.expiresWithCombat);
      const sourceType = flags?.sourceItemType ?? "none";
      const effectType = flags?.effectType ?? "unknown";
      console.log(`PokRole | ${actor.name} effect "${e.name}" [id=${e.id}]: managed=${hasManagedFlag}, expiresWithCombat=${hasExpireFlag}, sourceItemType=${sourceType}, effectType=${effectType}, durationMode=${flags?.durationMode ?? "?"}, combatId=${flags?.combatId ?? "?"}`);
    }

    // Find effects to remove: expiresWithCombat OR ability-sourced managed effects
    const combatEffectIds = allEffects
      .filter((e) => {
        const flags = e.getFlag?.("pok-role-system", "automation") ?? {};
        if (!flags || typeof flags !== "object") return false;
        // Remove if expiresWithCombat
        if (flags.expiresWithCombat) return true;
        // Remove any managed ability-sourced effect (abilities are always combat-scoped)
        if (flags.managed && flags.sourceItemType === "ability") return true;
        // Remove any managed modifier with matching combatId
        if (flags.managed && flags.combatId === combatId) return true;
        return false;
      })
      .map((e) => e.id)
      .filter(Boolean);

    if (combatEffectIds.length > 0) {
      console.log(`PokRole | ${actor.name}: removing ${combatEffectIds.length} combat-scoped effects`);
      try {
        await actor.deleteEmbeddedDocuments("ActiveEffect", combatEffectIds);
      } catch (e) {
        console.warn(`PokRole | Failed to remove combat effects for ${actor.name}:`, e);
      }
    }

    // Always run cleanup methods (not conditional on finding effects above)
    if (typeof actor.processTemporaryEffectSpecialDuration === "function") {
      try { await actor.processTemporaryEffectSpecialDuration("combat-end", { combatId }); } catch (_e) { /* */ }
    }
    if (typeof actor.clearCombatTemporaryEffects === "function") {
      try { await actor.clearCombatTemporaryEffects(combatId); } catch (e) { console.warn(`PokRole | clearCombatTemporaryEffects failed for ${actor.name}:`, e); }
    }
    if (typeof actor.clearMultiTurnState === "function") {
      try { await actor.clearMultiTurnState(); } catch (_e) { /* */ }
    }
    if (typeof actor._clearHeldItemCombatRuntimeState === "function") {
      try { await actor._clearHeldItemCombatRuntimeState(combatId); } catch (_e) { /* */ }
    }
    if (typeof actor._clearBideState === "function") {
      try { await actor._clearBideState(); } catch (_e) { /* */ }
    }

    // Protean / Libero: restore original types at combat end
    try {
      const proteanOriginal = actor.getFlag?.("pok-role-system", "proteanOriginalTypes");
      console.log(`PokRole | [deleteCombat] ${actor.name}: proteanOriginalTypes =`, proteanOriginal);
      if (proteanOriginal) {
        const restorePrimary = proteanOriginal.primary || "none";
        const restoreSecondary = proteanOriginal.secondary || "none";
        console.log(`PokRole | [deleteCombat] Restoring ${actor.name} types to ${restorePrimary}/${restoreSecondary}`);
        await actor.update({
          "system.types.primary": restorePrimary,
          "system.types.secondary": restoreSecondary
        });
        await actor.unsetFlag("pok-role-system", "proteanOriginalTypes");
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          content: `<strong>${actor.name}'s</strong> types were restored to <strong>${restorePrimary}</strong>/<strong>${restoreSecondary}</strong>.`
        });
      }
    } catch (e) {
      console.warn(`PokRole | Protean type restore failed for ${actor.name}:`, e);
    }

    // Trace: restore original ability
    try {
      const traceOriginal = actor.getFlag?.("pok-role-system", "traceOriginalAbility");
      if (traceOriginal) {
        await actor.update({ "system.ability": traceOriginal });
        await actor.unsetFlag("pok-role-system", "traceOriginalAbility");
      }
    } catch (e) {
      console.warn(`PokRole | Trace ability restore failed for ${actor.name}:`, e);
    }

    // Neutralizing Gas: clear flag
    try {
      const ngActive = actor.getFlag?.("pok-role-system", "neutralizingGasActive");
      if (ngActive) await actor.unsetFlag("pok-role-system", "neutralizingGasActive");
    } catch (e) {
      console.warn(`PokRole | Neutralizing Gas cleanup failed for ${actor.name}:`, e);
    }

    // Illusion: clear disguise
    try {
      const illusionDisguise = actor.getFlag?.("pok-role-system", "illusionDisguise");
      if (illusionDisguise) {
        const restoreImg = actor.img || "icons/svg/mystery-man.svg";
        const restoreName = actor.name;
        await actor.unsetFlag("pok-role-system", "illusionDisguise");
        // Restore all scene tokens using actor.img (species image)
        for (const scene of game.scenes ?? []) {
          for (const tokenDoc of (scene.tokens?.filter(t => t.actorId === actor.id) ?? [])) {
            try {
              await tokenDoc.update({ "texture.src": restoreImg, "name": restoreName }, { animate: false });
            } catch (_e) { /* */ }
          }
        }
      }
    } catch (e) {
      console.warn(`PokRole | Illusion cleanup failed for ${actor.name}:`, e);
    }

    // Disguise / Ice Face: clear shield flags
    try {
      if (actor.getFlag?.("pok-role-system", "disguiseActive") != null) await actor.unsetFlag("pok-role-system", "disguiseActive");
      if (actor.getFlag?.("pok-role-system", "iceFaceActive") != null) await actor.unsetFlag("pok-role-system", "iceFaceActive");
    } catch (e) {
      console.warn(`PokRole | Disguise/Ice Face cleanup failed for ${actor.name}:`, e);
    }

    // Form changes: restore original form
    try {
      const originalForm = actor.getFlag?.("pok-role-system", "originalForm");
      if (originalForm) {
        await actor.update({ "system.form": originalForm });
        await actor.unsetFlag("pok-role-system", "originalForm");
      }
    } catch (e) {
      console.warn(`PokRole | Form restore failed for ${actor.name}:`, e);
    }

    // Sync condition flags after cleanup
    if (typeof actor._synchronizeConditionFlagsFromTemporaryEffects === "function") {
      try { await actor._synchronizeConditionFlagsFromTemporaryEffects(actor); } catch (_e) { /* */ }
    }

    if (actor.sheet?.rendered) actor.sheet.render(false);
  }

  LAST_COMBAT_TURN_STATE.delete(combatId);
});

Hooks.on("createCombat", () => {
  void renderMoveQueueOverlay();
});

// Enter-battle ability triggers when a combatant is added to combat
Hooks.on("createCombatant", async (combatant) => {
  const combat = combatant?.combat ?? game.combat;
  if (!combat || !combat.active) return;
  const actor = combatant?.actor ?? null;
  if (!actor || actor.documentName !== "Actor") return;
  if ((combat.round ?? 0) < 1 && typeof actor._applyHeldItemEntryEffects === "function") {
    try {
      await actor._applyHeldItemEntryEffects({ combat });
    } catch (err) {
      console.warn(`PokRole | Held item entry processing failed for ${actor.name}:`, err);
    }
  }
  if ((combat.round ?? 0) < 1) return;
  if (typeof actor.processAbilityTriggerEffects !== "function") return;
  try {
    await actor.processAbilityTriggerEffects("enter-battle", { combat });
  } catch (err) {
    console.warn(`PokRole | Enter-battle ability processing failed for ${actor.name}:`, err);
  }
});

Hooks.on("updateCombat", () => {
  void renderMoveQueueOverlay();
});

Hooks.on("deleteCombat", () => {
  void renderMoveQueueOverlay();
});

// Display "(Ciclo X/Y)" next to "Round N" in the combat tracker header
Hooks.on("renderCombatTracker", (app, html) => {
  const combat = game.combat;
  if (!combat || !(combat instanceof PokRoleCombat)) return;
  const cycle = combat.cycle;
  const maxCycles = PokRoleCombat.MAX_CYCLES;
  const roundEl = html instanceof HTMLElement
    ? html.querySelector(".encounter-title .round") ?? html.querySelector(".encounter-title")
    : html.find?.(".encounter-title .round")?.[0] ?? html.find?.(".encounter-title")?.[0];
  if (!roundEl) return;
  const currentTitle = `${roundEl.textContent ?? ""}`.trim();
  if (!currentTitle) return;
  const baseTitle = currentTitle
    .replace(/\s*\((?:Turno\s+\d+|Ciclo\s+\d+\/\d+|Cycle\s+\d+\/\d+)\)\s*$/i, "")
    .trim();
  if (!baseTitle) return;
  roundEl.textContent = game.i18n.format("POKROLE.Combat.TrackerCycleTitle", {
    round: baseTitle,
    cycle,
    max: maxCycles
  });

  // Illusion: mask combatant name and image in the combat tracker
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant?.actor;
    if (!actor) continue;
    const disguise = actor.getFlag?.("pok-role-system", "illusionDisguise");
    if (!disguise) continue;

    // Find the combatant's list item in the tracker DOM
    const combatantEl = html instanceof HTMLElement
      ? html.querySelector(`[data-combatant-id="${combatant.id}"]`)
      : html.find?.(`[data-combatant-id="${combatant.id}"]`)?.[0];
    if (!combatantEl) continue;

    // Replace the name text
    const nameEl = combatantEl.querySelector(".token-name h4")
      ?? combatantEl.querySelector(".token-name .name")
      ?? combatantEl.querySelector(".combatant-name")
      ?? combatantEl.querySelector("h4");
    if (nameEl) nameEl.textContent = disguise.name;

    // Replace the token image
    const imgEl = combatantEl.querySelector(".token-image img")
      ?? combatantEl.querySelector("img.token-image")
      ?? combatantEl.querySelector("img");
    if (imgEl && disguise.img) imgEl.src = disguise.img;
  }
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!controls.tokens) return;
  controls.tokens.tools["pokrole-set-weather"] = {
    name: "pokrole-set-weather",
    title: "POKROLE.Combat.WeatherSetButton",
    icon: "fa-solid fa-cloud-sun-rain",
    order: Object.keys(controls.tokens.tools).length,
    button: true,
    visible: game.user.isGM,
    onChange: () => {
      const weatherOptions = [
        "none", "sunny", "harsh-sunlight", "rain",
        "typhoon", "sandstorm", "strong-winds", "hail"
      ];
      const weatherLabelKeys = {
        none: "POKROLE.Common.None",
        sunny: "POKROLE.Combat.WeatherValues.Sunny",
        "harsh-sunlight": "POKROLE.Combat.WeatherValues.HarshSunlight",
        rain: "POKROLE.Combat.WeatherValues.Rain",
        typhoon: "POKROLE.Combat.WeatherValues.Typhoon",
        sandstorm: "POKROLE.Combat.WeatherValues.Sandstorm",
        "strong-winds": "POKROLE.Combat.WeatherValues.StrongWinds",
        hail: "POKROLE.Combat.WeatherValues.Hail"
      };
      const weatherOptionsMarkup = weatherOptions
        .map(
          (key) =>
            `<option value="${key}">${game.i18n.localize(weatherLabelKeys[key] ?? "POKROLE.Common.None")}</option>`
        )
        .join("");
      new Dialog(
        {
          title: game.i18n.localize("POKROLE.Combat.WeatherSetTitle"),
          content: `
            <form class="pok-role-combined-roll">
              <div class="form-group">
                <label>${game.i18n.localize("POKROLE.Combat.WeatherLabel")}</label>
                <select name="weather">${weatherOptionsMarkup}</select>
              </div>
            </form>
          `,
          buttons: {
            confirm: {
              icon: "<i class='fas fa-check'></i>",
              label: game.i18n.localize("POKROLE.Combat.ConfirmReaction"),
              callback: async (dialogHtml) => {
                const selected =
                  dialogHtml?.[0]?.querySelector("select[name='weather']")?.value ?? "none";
                if (!selected) return;
                const actor =
                  canvas?.tokens?.controlled?.[0]?.actor ??
                  game.user?.character ??
                  game.actors?.find((a) => a.type === "trainer" && a.isOwner) ??
                  null;
                if (!actor || typeof actor.setActiveWeather !== "function") {
                  ui.notifications.warn(
                    game.i18n.localize("POKROLE.Errors.NoTrainerActor")
                  );
                  return;
                }
                await actor.setActiveWeather(selected);
              }
            },
            cancel: {
              icon: "<i class='fas fa-times'></i>",
              label: game.i18n.localize("POKROLE.Common.Cancel")
            }
          },
          default: "confirm"
        },
        { classes: ["pok-role-dialog"] }
      ).render(true);
    }
  };
});

// Capture: when a chat message with a capture flag is created, the GM auto-processes it
Hooks.on("createChatMessage", async (chatMessage) => {
  if (!game.user?.isGM) return;
  const captureRequest = chatMessage.getFlag?.(POKROLE.ID, "captureRequest");
  if (!captureRequest) return;
  const { trainerActorId, targetActorId, gearItemId, caughtWhileFainted, combatId } = captureRequest;
  const trainerActor = game.actors?.get(trainerActorId);
  const targetActor = game.actors?.get(targetActorId);
  const gearItem = trainerActor?.items?.get(gearItemId);
  if (!(trainerActor instanceof PokRoleActor) || trainerActor.type !== "trainer") return;
  if (!(targetActor instanceof PokRoleActor) || targetActor.type !== "pokemon") return;
  try {
    const combat = combatId ? game.combats?.get(combatId) ?? null : null;
    await trainerActor._applyPokeballCaptureSuccessLocal(trainerActor, targetActor, gearItem, {
      caughtWhileFainted: Boolean(caughtWhileFainted),
      combat
    });
    // Remove captured pokemon tokens from the scene
    for (const scene of game.scenes ?? []) {
      const capturedTokens = scene.tokens?.filter(t => t.actorId === targetActor.id) ?? [];
      for (const tokenDoc of capturedTokens) {
        try {
          await tokenDoc.delete();
        } catch (e) {
          console.warn(`PokRole | [GM capture hook] Failed to remove token:`, e);
        }
      }
    }
    console.log(`PokRole | [GM capture hook] Successfully processed capture of ${targetActor.name} by ${trainerActor.name}`);
  } catch (e) {
    console.error(`PokRole | [GM capture hook] Failed to process capture:`, e);
  }
});

// Illusion: when a token with the Illusion ability is placed on the scene, apply disguise
Hooks.on("createToken", async (tokenDocument) => {
  const actor = tokenDocument?.actor ?? null;
  if (!actor || actor.type !== "pokemon") return;
  const ability = `${actor.system?.ability ?? ""}`.trim().toLowerCase();
  if (ability !== "illusion") return;
  // Don't re-apply if already disguised
  const existing = actor.getFlag?.("pok-role-system", "illusionDisguise");
  if (existing) return;
  if (typeof actor._applyIllusionAbility !== "function") return;
  try {
    await actor._applyIllusionAbility({ tokenDocument });
  } catch (e) {
    console.warn(`PokRole | [Illusion] createToken hook failed for ${actor.name}:`, e);
  }
});

Hooks.on("applyTokenStatusEffect", (token, statusId, isActive) => {
  const conditionKey = resolveConditionKeyFromStatus(statusId);
  if (!conditionKey) return;

  const actor = token?.actor ?? null;
  if (!actor || typeof actor.toggleQuickCondition !== "function") return;
  void actor.toggleQuickCondition(conditionKey, { active: Boolean(isActive) });
});

Hooks.on("updateActor", (actorDocument, changedData) => {
  if (!actorDocument || actorDocument.documentName !== "Actor") return;
  const hpWasUpdated =
    foundry.utils.hasProperty(changedData ?? {}, "system.resources.hp") ||
    foundry.utils.hasProperty(changedData ?? {}, "system.resources.hp.value");
  if (
    actorDocument.type === "pokemon" &&
    hpWasUpdated &&
    typeof actorDocument.synchronizeFaintedFromHp === "function"
  ) {
    void actorDocument.synchronizeFaintedFromHp();
  }
  if (typeof actorDocument.synchronizeConditionalActiveEffects === "function") {
    void actorDocument.synchronizeConditionalActiveEffects();
  }
});

Hooks.on("createActiveEffect", (effectDocument) => {
  void ensureEffectIconDisplay(effectDocument);
  void synchronizeEffectTokenIcon(effectDocument);
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  if (typeof actor.prepareAutomationEffectRoundTracking === "function") {
    void actor.prepareAutomationEffectRoundTracking(effectDocument);
  }

  const conditionKey = resolveConditionKeyFromStatus(effectDocument);
  if (conditionKey && typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
  }
  if (typeof actor.synchronizeConditionalActiveEffects === "function") {
    void actor.synchronizeConditionalActiveEffects();
  }
});

Hooks.on("updateActiveEffect", (effectDocument, changedData) => {
  void ensureEffectIconDisplay(effectDocument);
  void synchronizeEffectTokenIcon(effectDocument);
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  if (typeof actor.prepareAutomationEffectRoundTracking === "function") {
    void actor.prepareAutomationEffectRoundTracking(effectDocument);
  }

  const hasConditionStatuses = [...(effectDocument?.statuses ?? [])].some((statusId) =>
    `${statusId ?? ""}`.trim().toLowerCase().startsWith("pokrole-condition-")
  );
  const updatesDisabled = Object.prototype.hasOwnProperty.call(changedData ?? {}, "disabled");
  const updatesStatuses = Object.prototype.hasOwnProperty.call(changedData ?? {}, "statuses");
  if ((hasConditionStatuses || updatesStatuses || updatesDisabled) && typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
  }
  if (typeof actor.synchronizeConditionalActiveEffects === "function") {
    void actor.synchronizeConditionalActiveEffects();
  }
});

Hooks.on("deleteActiveEffect", (effectDocument) => {
  const statusId = getManagedEffectStatusId(effectDocument);
  if (statusId) removeStatusEffectDefinition(statusId);
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  const conditionKey = resolveConditionKeyFromStatus(effectDocument);
  if (conditionKey && typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
  }
  if (typeof actor.synchronizeConditionalActiveEffects === "function") {
    void actor.synchronizeConditionalActiveEffects();
  }
});

Hooks.on("renderActiveEffectConfig", (app, html) => {
  renderActiveEffectAutomationConfig(app, html);
});

Hooks.on("renderApplicationV2", (app, element) => {
  if (!isActiveEffectConfigApp(app)) return;
  renderActiveEffectAutomationConfig(app, element);
});
