import {
  ATTRIBUTE_DEFINITIONS,
  POKROLE,
  SKILL_DEFINITIONS
} from "./module/constants.mjs";
import {
  GearDataModel,
  MoveDataModel,
  PokemonDataModel,
  TrainerDataModel
} from "./module/data-models.mjs";
import { PokRoleActor, PokRoleItem } from "./module/documents.mjs";
import { PokRoleActorSheet } from "./module/sheets/actor-sheet.mjs";
import { PokRoleMoveSheet } from "./module/sheets/item-sheet.mjs";

function getActiveCombatActor(combat) {
  if (!combat) return null;
  const turnIndex = Number(combat.turn);
  if (Number.isInteger(turnIndex) && turnIndex >= 0) {
    return combat.turns?.[turnIndex]?.actor ?? null;
  }
  return combat.combatant?.actor ?? null;
}

Hooks.once("init", () => {
  console.log(`${POKROLE.ID} | Initializing ${POKROLE.TITLE}`);

  CONFIG.Actor.documentClass = PokRoleActor;
  CONFIG.Item.documentClass = PokRoleItem;

  CONFIG.Actor.dataModels = {
    trainer: TrainerDataModel,
    pokemon: PokemonDataModel
  };

  CONFIG.Item.dataModels = {
    move: MoveDataModel,
    gear: GearDataModel
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
    types: ["move", "gear"],
    makeDefault: true,
    label: "POKROLE.Sheets.Item"
  });
});

Hooks.on("updateCombat", async (combat, changed) => {
  const hasRoundChange = Object.prototype.hasOwnProperty.call(changed, "round");
  const hasTurnChange = Object.prototype.hasOwnProperty.call(changed, "turn");
  if (!hasRoundChange && !hasTurnChange) return;

  const actor = getActiveCombatActor(combat);
  if (typeof actor?.resetTurnState !== "function") return;

  const roundKey = `${combat.id}:${combat.round ?? 0}`;
  await actor.resetTurnState({ roundKey, resetInitiative: true });
});
