import {
  ATTRIBUTE_DEFINITIONS,
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

async function processRoundEndCombatAutomation(combat) {
  if (!combat) return;
  const weatherData = combat.getFlag(POKROLE.ID, "combat.weather") ?? {};
  const weatherKey = normalizeCombatWeatherKey(weatherData?.condition);
  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor || typeof actor.processRoundEndCombatAutomation !== "function") continue;
    await actor.processRoundEndCombatAutomation({ weatherKey, combatId: combat.id });
  }
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
  await synchronizeAllActorEffectTokenIcons();
  await clearSceneScopedMoveDisableEffects(canvas?.scene?.id ?? null);
  for (const actor of game.actors?.contents ?? []) {
    if (actor?.type !== "pokemon") continue;
    if (typeof actor.synchronizeConditionFlags === "function") {
      await actor.synchronizeConditionFlags();
    }
    if (typeof actor.synchronizeFaintedFromHp !== "function") continue;
    await actor.synchronizeFaintedFromHp();
  }
});

Hooks.on("canvasReady", async (canvasDocument) => {
  await clearSceneScopedMoveDisableEffects(canvasDocument?.scene?.id ?? canvas?.scene?.id ?? null);
});

Hooks.on("updateCombat", async (combat, changed) => {
  const hasCombatEnded =
    Object.prototype.hasOwnProperty.call(changed, "active") && changed.active === false;
  if (hasCombatEnded) {
    await processCombatSpecialDurationEvent(combat, "combat-end");
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
  const previousRound = Number.isInteger(combat?.previous?.round) ? combat.previous.round : null;
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
    if (
      currentActor &&
      currentActor.documentName === "Actor" &&
      typeof currentActor.processTurnStartStatusAutomation === "function"
    ) {
      await currentActor.processTurnStartStatusAutomation();
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
    await processCombatSpecialDurationEvent(combat, "round-end");
    await processRoundEndCombatAutomation(combat);
    await advanceCombatWeatherDuration(combat);
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

    if (typeof actor.synchronizeConditionalActiveEffects === "function") {
      await actor.synchronizeConditionalActiveEffects();
    }

    if (typeof actor.advanceTemporaryEffectsRound === "function") {
      await actor.advanceTemporaryEffectsRound(combat.id);
    }

    if (typeof actor.resetTurnState === "function") {
      await actor.resetTurnState({ roundKey, resetInitiative: false });
    }
    if (typeof actor.rollInitiative !== "function") continue;

    const initiativeRoll = await actor.rollInitiative({ silent: true });
    const rolledScore = Math.max(
      Number(actor.system?.combat?.initiative ?? initiativeRoll?.total ?? 0) || 0,
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
  await processCombatSpecialDurationEvent(combat, "combat-end");
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
