import {
  getSystemAssetPath,
  MOVE_CATEGORY_LABEL_BY_KEY,
  MOVE_TARGET_LABEL_BY_KEY,
  POKROLE
} from "./constants.mjs";

const MOVE_QUEUE_TEMPLATE = getSystemAssetPath("templates/apps/move-queue.hbs");
const MOVE_QUEUE_ROOT_ID = "pok-role-move-queue";
const MOVE_QUEUE_STATE = {
  minimized: false,
  dragEntryId: ""
};
const MOVE_QUEUE_ACTOR_FLAG = "combat.moveQueueEntry";

function toNumber(value, fallback = 0) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function isActiveCombat(combat) {
  return Boolean(combat && combat.active !== false && (combat.started || combat.combatants?.size));
}

function getCurrentCombat() {
  const combat = game.combat ?? null;
  return isActiveCombat(combat) ? combat : null;
}

function getCombatantForQueueEntry(entry, combat = getCurrentCombat()) {
  if (!combat) return null;
  const combatantId = `${entry?.combatantId ?? ""}`.trim();
  if (!combatantId) return null;
  return combat.combatants?.get?.(combatantId) ?? combat.combatants?.find?.((candidate) => candidate.id === combatantId) ?? null;
}

function getQueueActorFlagKey() {
  return MOVE_QUEUE_ACTOR_FLAG;
}

function getCombatQueueActors(combat = getCurrentCombat()) {
  if (!isActiveCombat(combat)) return [];
  const seen = new Set();
  const actors = [];
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant?.actor ?? null;
    const actorId = `${actor?.id ?? ""}`.trim();
    if (!actor || !actorId || seen.has(actorId)) continue;
    seen.add(actorId);
    actors.push(actor);
  }
  return actors;
}

function getActorQueueEntry(actor, combat = getCurrentCombat()) {
  if (!actor || !isActiveCombat(combat)) return null;
  const rawEntry = actor.getFlag?.(POKROLE.ID, getQueueActorFlagKey()) ?? null;
  if (!rawEntry || typeof rawEntry !== "object") return null;
  const normalized = normalizeQueueEntry(rawEntry);
  if (`${normalized.declaredCombatId ?? ""}`.trim() !== `${combat?.id ?? ""}`.trim()) return null;
  if (normalized.actorId && normalized.actorId !== actor.id) return null;
  return normalized;
}

function normalizeQueueEntry(entry = {}, index = 0) {
  const fallbackId = foundry.utils.randomID();
  const normalizedId = `${entry.id ?? fallbackId}`.trim() || fallbackId;
  const targetActorIds = Array.isArray(entry.targetActorIds)
    ? [...new Set(entry.targetActorIds.map((value) => `${value ?? ""}`.trim()).filter(Boolean))]
    : [];
  return {
    id: normalizedId,
    actorId: `${entry.actorId ?? ""}`.trim(),
    combatantId: `${entry.combatantId ?? ""}`.trim(),
    userId: `${entry.userId ?? ""}`.trim(),
    moveId: `${entry.moveId ?? ""}`.trim(),
    moveName: `${entry.moveName ?? ""}`.trim(),
    moveImg: `${entry.moveImg ?? ""}`.trim(),
    priority: Math.min(Math.max(Math.floor(toNumber(entry.priority, 0)), -99), 99),
    initiative: toNumber(entry.initiative, 0),
    targetActorIds,
    targetMode: `${entry.targetMode ?? "foe"}`.trim().toLowerCase() || "foe",
    declaredAt: Math.max(Math.floor(toNumber(entry.declaredAt, Date.now() + index)), 0),
    declaredRound: Math.max(Math.floor(toNumber(entry.declaredRound, 0)), 0),
    declaredTurn: Math.max(Math.floor(toNumber(entry.declaredTurn, 0)), 0),
    declaredCombatId: `${entry.declaredCombatId ?? ""}`.trim(),
    sortOrder: Number.isFinite(Number(entry.sortOrder)) ? Number(entry.sortOrder) : null
  };
}

function compareQueueEntries(left, right) {
  const leftSort = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : null;
  const rightSort = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : null;
  if (leftSort !== null && rightSort !== null && leftSort !== rightSort) return leftSort - rightSort;
  if (leftSort !== null && rightSort === null) return -1;
  if (leftSort === null && rightSort !== null) return 1;

  const leftPriority = toNumber(left?.priority, 0);
  const rightPriority = toNumber(right?.priority, 0);
  if (leftPriority !== rightPriority) return rightPriority - leftPriority;

  const leftInitiative = toNumber(left?.initiative, 0);
  const rightInitiative = toNumber(right?.initiative, 0);
  if (leftInitiative !== rightInitiative) return rightInitiative - leftInitiative;

  return toNumber(left?.declaredAt, 0) - toNumber(right?.declaredAt, 0);
}

function resolveInsertedSortOrder(queue = [], insertIndex = 0) {
  const previous = insertIndex > 0 ? queue[insertIndex - 1] ?? null : null;
  const next = insertIndex < queue.length ? queue[insertIndex] ?? null : null;
  const previousSort = Number.isFinite(previous?.sortOrder) ? Number(previous.sortOrder) : null;
  const nextSort = Number.isFinite(next?.sortOrder) ? Number(next.sortOrder) : null;
  if (previousSort !== null && nextSort !== null) return (previousSort + nextSort) / 2;
  if (previousSort !== null) return previousSort + 1;
  if (nextSort !== null) return nextSort - 1;
  return insertIndex;
}

function getActorForQueueEntry(entry, combat = getCurrentCombat()) {
  const combatant = getCombatantForQueueEntry(entry, combat);
  if (combatant?.actor) return combatant.actor;
  const actorId = `${entry?.actorId ?? ""}`.trim();
  if (!actorId) return null;
  return game.actors?.get(actorId) ?? null;
}

function getMoveForQueueEntry(entry, actor = null, combat = getCurrentCombat()) {
  const parentActor = actor ?? getActorForQueueEntry(entry, combat);
  const moveId = `${entry?.moveId ?? ""}`.trim();
  if (!parentActor || !moveId) return null;
  return parentActor.items?.get(moveId) ?? null;
}

function canManageQueueEntry(entry, combat = getCurrentCombat()) {
  const actor = getActorForQueueEntry(entry, combat);
  return Boolean(game.user?.isGM || actor?.isOwner);
}

function canReorderQueue() {
  return Boolean(game.user?.isGM);
}

function shouldEntryComeBefore(candidate, existing) {
  const candidatePriority = toNumber(candidate?.priority, 0);
  const existingPriority = toNumber(existing?.priority, 0);
  if (candidatePriority !== existingPriority) return candidatePriority > existingPriority;

  const candidateInitiative = toNumber(candidate?.initiative, 0);
  const existingInitiative = toNumber(existing?.initiative, 0);
  if (candidateInitiative !== existingInitiative) return candidateInitiative > existingInitiative;

  return toNumber(candidate?.declaredAt, 0) < toNumber(existing?.declaredAt, 0);
}

function localizeMoveCategory(categoryKey) {
  const labelPath = MOVE_CATEGORY_LABEL_BY_KEY[`${categoryKey ?? ""}`.trim().toLowerCase()];
  return game.i18n.localize(labelPath ?? "POKROLE.Common.Unknown");
}

function localizeMoveTarget(targetKey) {
  const labelPath = MOVE_TARGET_LABEL_BY_KEY[`${targetKey ?? ""}`.trim().toLowerCase()];
  return game.i18n.localize(labelPath ?? "POKROLE.Common.Unknown");
}

function getQueueTargetSummary(entry) {
  const targetActorIds = Array.isArray(entry?.targetActorIds) ? entry.targetActorIds : [];
  const targetNames = targetActorIds
    .map((actorId) => game.actors?.get(`${actorId ?? ""}`.trim())?.name ?? "")
    .filter(Boolean);
  if (targetNames.length > 0) return targetNames.join(", ");
  return localizeMoveTarget(entry?.targetMode);
}

function getDecoratedQueueEntries(combat) {
  const rawQueue = getCombatMoveQueue(combat);
  return rawQueue.map((entry, index) => {
    const actor = getActorForQueueEntry(entry, combat);
    const move = getMoveForQueueEntry(entry, actor, combat);
    const categoryKey = `${move?.system?.category ?? "support"}`.trim().toLowerCase();
    const canManage = canManageQueueEntry(entry, combat);
    return {
      ...entry,
      actorName: `${actor?.name ?? entry.actorId ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim(),
      moveName: `${move?.name ?? entry.moveName ?? game.i18n.localize("POKROLE.Common.Unknown")}`.trim(),
      moveImg: `${move?.img ?? entry.moveImg ?? "icons/svg/dice-target.svg"}`.trim(),
      categoryLabel: localizeMoveCategory(categoryKey),
      priorityLabel: toNumber(entry.priority, 0) > 0 ? `+${entry.priority}` : `${entry.priority}`,
      initiativeLabel: `${toNumber(entry.initiative, 0)}`,
      targetSummary: getQueueTargetSummary(entry),
      queueIndex: index,
      canExecute: canManage && Boolean(actor) && Boolean(move),
      canRemove: canManage,
      canDrag: canReorderQueue(),
      isBroken: !actor || !move
    };
  });
}

export function getCombatMoveQueue(combat = getCurrentCombat()) {
  if (!isActiveCombat(combat)) return [];
  return getCombatQueueActors(combat)
    .map((actor) => getActorQueueEntry(actor, combat))
    .filter(Boolean)
    .sort(compareQueueEntries);
}

export async function setCombatMoveQueueLocal(combat, queue = []) {
  if (!combat) return [];
  const normalizedQueue = Array.isArray(queue)
    ? queue.map((entry, index) => normalizeQueueEntry({
      ...entry,
      declaredCombatId: `${combat?.id ?? ""}`.trim(),
      sortOrder: index
    }, index))
    : [];
  const queueByActorId = new Map(
    normalizedQueue
      .map((entry) => [`${entry.actorId ?? ""}`.trim(), entry])
      .filter(([actorId]) => Boolean(actorId))
  );
  for (const actor of getCombatQueueActors(combat)) {
    const nextEntry = queueByActorId.get(actor.id) ?? null;
    if (nextEntry) {
      await actor.setFlag(POKROLE.ID, getQueueActorFlagKey(), nextEntry);
    } else {
      await actor.unsetFlag(POKROLE.ID, getQueueActorFlagKey()).catch(() => null);
    }
  }
  await renderMoveQueueOverlay();
  return getCombatMoveQueue(combat);
}

export async function setCombatMoveQueue(combat, queue = []) {
  if (!combat) return [];
  if (!game.user?.isGM) return getCombatMoveQueue(combat);
  return setCombatMoveQueueLocal(combat, queue);
}

export async function clearCombatMoveQueueLocal(combat = getCurrentCombat()) {
  if (!combat) return [];
  return setCombatMoveQueueLocal(combat, []);
}

export async function clearCombatMoveQueue(combat = getCurrentCombat()) {
  if (!combat) return [];
  if (!game.user?.isGM) return getCombatMoveQueue(combat);
  return clearCombatMoveQueueLocal(combat);
}

export async function enqueueCombatMoveDeclarationLocal(entry, combat = getCurrentCombat()) {
  if (!combat) return null;
  const normalizedEntry = normalizeQueueEntry(entry);
  const actor = getActorForQueueEntry(normalizedEntry, combat);
  if (!actor) return null;
  const queue = getCombatMoveQueue(combat).filter((existing) => existing.actorId !== normalizedEntry.actorId);
  const insertIndex = queue.findIndex((existing) => shouldEntryComeBefore(normalizedEntry, existing));
  const boundedInsertIndex = insertIndex === -1 ? queue.length : insertIndex;
  const queuedEntry = normalizeQueueEntry({
    ...normalizedEntry,
    declaredCombatId: `${combat?.id ?? ""}`.trim(),
    sortOrder: resolveInsertedSortOrder(queue, boundedInsertIndex)
  });
  await actor.setFlag(POKROLE.ID, getQueueActorFlagKey(), queuedEntry);
  await renderMoveQueueOverlay();
  return queuedEntry;
}

export async function enqueueCombatMoveDeclaration(entry, combat = getCurrentCombat()) {
  if (!combat) return null;
  const normalizedEntry = normalizeQueueEntry(entry);
  const actor = getActorForQueueEntry(normalizedEntry, combat);
  if (!actor || !(game.user?.isGM || actor.isOwner)) return null;
  return enqueueCombatMoveDeclarationLocal(normalizedEntry, combat);
}

export async function removeCombatMoveEntryLocal(combat, entryId) {
  if (!combat) return [];
  const normalizedEntryId = `${entryId ?? ""}`.trim();
  if (!normalizedEntryId) return getCombatMoveQueue(combat);
  const entry = getCombatMoveQueue(combat).find((candidate) => candidate.id === normalizedEntryId) ?? null;
  if (!entry) return getCombatMoveQueue(combat);
  const actor = getActorForQueueEntry(entry, combat);
  if (!actor) return getCombatMoveQueue(combat);
  await actor.unsetFlag(POKROLE.ID, getQueueActorFlagKey()).catch(() => null);
  await renderMoveQueueOverlay();
  return getCombatMoveQueue(combat);
}

export async function removeCombatMoveEntry(combat, entryId) {
  if (!combat) return [];
  const normalizedEntryId = `${entryId ?? ""}`.trim();
  if (!normalizedEntryId) return getCombatMoveQueue(combat);
  const queue = getCombatMoveQueue(combat);
  const entry = queue.find((candidate) => candidate.id === normalizedEntryId);
  if (!entry || !canManageQueueEntry(entry, combat)) return queue;
  return removeCombatMoveEntryLocal(combat, normalizedEntryId);
}

export async function moveCombatMoveEntryLocal(combat, entryId, targetIndex) {
  if (!combat) return getCombatMoveQueue(combat);
  const normalizedEntryId = `${entryId ?? ""}`.trim();
  const queue = getCombatMoveQueue(combat);
  const currentIndex = queue.findIndex((entry) => entry.id === normalizedEntryId);
  if (currentIndex === -1) return queue;

  const boundedIndex = Math.min(
    Math.max(Math.floor(toNumber(targetIndex, currentIndex)), 0),
    Math.max(queue.length, 0)
  );
  if (boundedIndex === currentIndex) return queue;

  const [entry] = queue.splice(currentIndex, 1);
  const insertionIndex = currentIndex < boundedIndex ? boundedIndex - 1 : boundedIndex;
  queue.splice(insertionIndex, 0, entry);
  return setCombatMoveQueueLocal(combat, queue);
}

export async function moveCombatMoveEntry(combat, entryId, targetIndex) {
  if (!combat || !canReorderQueue()) return getCombatMoveQueue(combat);
  return moveCombatMoveEntryLocal(combat, entryId, targetIndex);
}

export async function executeCombatMoveEntry(combat, entryId) {
  if (!combat) return null;
  const normalizedEntryId = `${entryId ?? ""}`.trim();
  const queue = getCombatMoveQueue(combat);
  const entry = queue.find((candidate) => candidate.id === normalizedEntryId);
  if (!entry || !canManageQueueEntry(entry, combat)) return null;

  const actor = getActorForQueueEntry(entry, combat);
  if (!actor || typeof actor.rollMove !== "function") {
    ui.notifications.warn(game.i18n.localize("POKROLE.Combat.MoveQueueBrokenEntry"));
    return null;
  }

  const move = getMoveForQueueEntry(entry, actor, combat);
  if (!move) {
    ui.notifications.warn(game.i18n.localize("POKROLE.Combat.MoveQueueBrokenEntry"));
    return null;
  }

  // Remove the entry from the queue BEFORE executing the move.
  // Switch moves (U-Turn, Volt Switch, etc.) delete the old combatant during
  // execution, which makes post-execution removal unreliable.
  await removeCombatMoveEntry(combat, normalizedEntryId);

  const result = await actor.rollMove(move.id, {
    targetActorIds: entry.targetActorIds,
    executeFromQueue: true
  });

  return result ?? null;
}

function clearDropClasses(root) {
  root
    .querySelectorAll(".pok-role-move-queue-entry.is-drop-before, .pok-role-move-queue-entry.is-drop-after")
    .forEach((card) => {
      card.classList.remove("is-drop-before", "is-drop-after");
    });
}

function activateMoveQueueOverlayListeners(root, combat) {
  root.querySelector("[data-action='toggle-queue']")?.addEventListener("click", async (event) => {
    event.preventDefault();
    MOVE_QUEUE_STATE.minimized = !MOVE_QUEUE_STATE.minimized;
    await renderMoveQueueOverlay();
  });

  root.querySelector("[data-action='clear-queue']")?.addEventListener("click", async (event) => {
    event.preventDefault();
    await clearCombatMoveQueue(combat);
  });

  root.querySelectorAll("[data-action='execute-entry']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const entryId = `${button.dataset.entryId ?? ""}`.trim();
      if (!entryId) return;
      await executeCombatMoveEntry(combat, entryId);
    });
  });

  root.querySelectorAll("[data-action='remove-entry']").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.preventDefault();
      const entryId = `${button.dataset.entryId ?? ""}`.trim();
      if (!entryId) return;
      await removeCombatMoveEntry(combat, entryId);
    });
  });

  if (!canReorderQueue()) return;

  root.querySelectorAll(".pok-role-move-queue-entry[data-entry-id]").forEach((card) => {
    const entryId = `${card.dataset.entryId ?? ""}`.trim();
    if (!entryId) return;

    card.addEventListener("dragstart", (event) => {
      MOVE_QUEUE_STATE.dragEntryId = entryId;
      card.classList.add("is-dragging");
      event.dataTransfer?.setData("text/plain", entryId);
      event.dataTransfer?.setDragImage(card, card.clientWidth / 2, card.clientHeight / 2);
    });

    card.addEventListener("dragend", () => {
      MOVE_QUEUE_STATE.dragEntryId = "";
      card.classList.remove("is-dragging");
      clearDropClasses(root);
    });

    card.addEventListener("dragover", (event) => {
      if (!MOVE_QUEUE_STATE.dragEntryId || MOVE_QUEUE_STATE.dragEntryId === entryId) return;
      event.preventDefault();
      clearDropClasses(root);
      const bounds = card.getBoundingClientRect();
      const before = event.clientX < bounds.left + bounds.width / 2;
      card.classList.add(before ? "is-drop-before" : "is-drop-after");
    });

    card.addEventListener("dragleave", () => {
      card.classList.remove("is-drop-before", "is-drop-after");
    });

    card.addEventListener("drop", async (event) => {
      event.preventDefault();
      const sourceEntryId =
        `${event.dataTransfer?.getData("text/plain") ?? ""}`.trim() || MOVE_QUEUE_STATE.dragEntryId;
      if (!sourceEntryId || sourceEntryId === entryId) return;

      const queue = getCombatMoveQueue(combat);
      const targetIndex = queue.findIndex((entry) => entry.id === entryId);
      if (targetIndex === -1) return;

      const bounds = card.getBoundingClientRect();
      const before = event.clientX < bounds.left + bounds.width / 2;
      const insertionIndex = before ? targetIndex : targetIndex + 1;
      await moveCombatMoveEntry(combat, sourceEntryId, insertionIndex);
    });
  });
}

export async function renderMoveQueueOverlay() {
  const existingRoot = document.getElementById(MOVE_QUEUE_ROOT_ID);
  const combat = getCurrentCombat();
  if (!combat) {
    existingRoot?.remove();
    return null;
  }

  const entries = getDecoratedQueueEntries(combat);
  const html = await renderTemplate(MOVE_QUEUE_TEMPLATE, {
    rootId: MOVE_QUEUE_ROOT_ID,
    minimized: MOVE_QUEUE_STATE.minimized,
    queueCount: entries.length,
    entries,
    hasEntries: entries.length > 0,
    canClear: game.user?.isGM ?? false
  });

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html.trim();
  const nextRoot = wrapper.firstElementChild;
  if (!nextRoot) return null;

  if (existingRoot) existingRoot.replaceWith(nextRoot);
  else document.body.appendChild(nextRoot);

  activateMoveQueueOverlayListeners(nextRoot, combat);
  return nextRoot;
}
