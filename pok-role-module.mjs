import {
  ATTRIBUTE_DEFINITIONS,
  getSystemAssetPath,
  MOVE_SECONDARY_DURATION_MODE_KEYS,
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
    rounds: "POKROLE.Move.Secondary.Duration.Mode.Rounds",
    combat: "POKROLE.Move.Secondary.Duration.Mode.Combat"
  };
  return labelByMode[durationMode] ?? "POKROLE.Common.Unknown";
}

function getSpecialDurationLabelPath(durationKey) {
  const labelByDuration = {
    "turn-start": "POKROLE.Move.Secondary.Duration.Special.TurnStart",
    "turn-end": "POKROLE.Move.Secondary.Duration.Special.TurnEnd",
    "next-action": "POKROLE.Move.Secondary.Duration.Special.NextAction",
    "next-attack": "POKROLE.Move.Secondary.Duration.Special.NextAttack",
    "next-hit": "POKROLE.Move.Secondary.Duration.Special.NextHit",
    "is-attacked": "POKROLE.Move.Secondary.Duration.Special.IsAttacked",
    "is-damaged": "POKROLE.Move.Secondary.Duration.Special.IsDamaged",
    "is-hit": "POKROLE.Move.Secondary.Duration.Special.IsHit"
  };
  return labelByDuration[durationKey] ?? "POKROLE.Common.Unknown";
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
  const durationMode = MOVE_SECONDARY_DURATION_MODE_KEYS.includes(rawDurationMode)
    ? rawDurationMode
    : "manual";
  const rawRounds = Number(automationFlags?.durationRounds);
  const durationRounds = Number.isFinite(rawRounds) ? Math.min(Math.max(Math.floor(rawRounds), 1), 99) : 1;
  const specialDuration = normalizeSpecialDurationList(automationFlags?.specialDuration);
  const selectedSpecialDuration = new Set(specialDuration);

  const modeOptionsHtml = MOVE_SECONDARY_DURATION_MODE_KEYS.map((modeKey) => {
    const selected = modeKey === durationMode ? " selected" : "";
    const label = game.i18n.localize(getDurationModeLabelPath(modeKey));
    return `<option value="${modeKey}"${selected}>${label}</option>`;
  }).join("");

  const specialOptionsHtml = MOVE_SECONDARY_SPECIAL_DURATION_KEYS
    .filter((durationKey) => durationKey !== "none")
    .map((durationKey) => {
      const selected = selectedSpecialDuration.has(durationKey) ? " selected" : "";
      const label = game.i18n.localize(getSpecialDurationLabelPath(durationKey));
      return `<option value="${durationKey}"${selected}>${label}</option>`;
    })
    .join("");

  const section = document.createElement("fieldset");
  section.className = "pokrole-ae-automation";
  section.innerHTML = `
    <legend>${game.i18n.localize("POKROLE.Effects.Tab")}</legend>
    <p class="hint">${game.i18n.localize("POKROLE.Move.Secondary.Duration.Special.Label")}</p>
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
        <select
          name="flags.${POKROLE.ID}.automation.specialDuration"
          multiple
          size="6"
        >
          ${specialOptionsHtml}
        </select>
      </div>
    </div>
  `;

  detailsTab.appendChild(section);
  const durationModeSelect = section.querySelector(`select[name="flags.${POKROLE.ID}.automation.durationMode"]`);
  const roundsRow = section.querySelector(".pokrole-ae-rounds-row");
  const refreshRoundVisibility = () => {
    const mode = `${durationModeSelect?.value ?? "manual"}`.trim().toLowerCase();
    if (roundsRow) roundsRow.classList.toggle("is-hidden", mode !== "rounds");
  };
  durationModeSelect?.addEventListener("change", refreshRoundVisibility);
  refreshRoundVisibility();
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
  if (typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
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
  if (!hasConditionStatuses && !updatesStatuses && !updatesDisabled) return;
  if (typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
  }
});

Hooks.on("deleteActiveEffect", (effectDocument) => {
  const actor = effectDocument?.parent ?? null;
  if (!actor || actor.documentName !== "Actor") return;

  const conditionKey = resolveConditionKeyFromStatus(effectDocument);
  if (!conditionKey) return;
  if (typeof actor.synchronizeConditionFlags === "function") {
    void actor.synchronizeConditionFlags();
  }
});

Hooks.on("renderActiveEffectConfig", (app, html) => {
  renderActiveEffectAutomationConfig(app, html);
});
