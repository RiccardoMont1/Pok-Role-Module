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
    confused: "POKROLE.Move.Secondary.Condition.Confused",
    flinch: "POKROLE.Move.Secondary.Condition.Flinch",
    disabled: "POKROLE.Move.Secondary.Condition.Disabled",
    infatuated: "POKROLE.Move.Secondary.Condition.Infatuated",
    "badly-poisoned": "POKROLE.Move.Secondary.Condition.BadlyPoisoned"
  };
  return labelByCondition[conditionKey] ?? "POKROLE.Common.Unknown";
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

function renderActiveEffectAutomationConfig(app, html) {
  const effectDocument = app?.object ?? null;
  const parentActor = effectDocument?.parent ?? null;
  if (!parentActor || parentActor.documentName !== "Actor") return;
  if (parentActor.type !== "trainer" && parentActor.type !== "pokemon") return;

  const root = html?.[0] ?? html;
  if (!root || typeof root.querySelector !== "function") return;
  if (typeof html?.addClass === "function") {
    html.addClass("pok-role-ae-config");
  } else {
    root.classList?.add?.("pok-role-ae-config");
  }

  const existingSection = root.querySelector(".pokrole-ae-automation");
  if (existingSection) existingSection.remove();

  const detailsTab =
    root.querySelector(".tab[data-tab='details']") ??
    root.querySelector(".tab[data-tab='duration']") ??
    root.querySelector("form");
  if (!detailsTab) return;

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

  const specialRowsHtml = (specialDuration.length > 0 ? specialDuration : [])
    .map((durationKey, index) => createAeSpecialDurationRow(index, durationKey))
    .join("");

  const section = document.createElement("fieldset");
  section.className = "pokrole-ae-automation";
  const passiveChecked = passiveEnabled ? " checked" : "";
  const thresholdRowClass = passiveTrigger.includes("threshold") ? "" : " is-hidden";
  const conditionRowClass = passiveTrigger.includes("condition") ? "" : " is-hidden";
  section.innerHTML = `
    <legend>${game.i18n.localize("POKROLE.Effects.Tab")}</legend>
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
    <hr />
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
  `;

  detailsTab.appendChild(section);
  const durationModeSelect = section.querySelector(`select[name="flags.${POKROLE.ID}.automation.durationMode"]`);
  const roundsRow = section.querySelector(".pokrole-ae-rounds-row");
  const passiveTriggerSelect = section.querySelector(`select[name="flags.${POKROLE.ID}.automation.passiveTrigger"]`);
  const thresholdRow = section.querySelector(".pokrole-ae-threshold-row");
  const conditionRow = section.querySelector(".pokrole-ae-condition-row");
  const addDurationButton = section.querySelector(".pokrole-ae-add-duration");
  const specialDurationList = section.querySelector(".pokrole-ae-special-duration-list");

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

  section.addEventListener("click", (event) => {
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

Hooks.on("updateActor", (actorDocument) => {
  if (!actorDocument || actorDocument.documentName !== "Actor") return;
  if (typeof actorDocument.synchronizeConditionalActiveEffects === "function") {
    void actorDocument.synchronizeConditionalActiveEffects();
  }
});

Hooks.on("createActiveEffect", (effectDocument) => {
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
