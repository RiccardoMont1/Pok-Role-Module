import {
  ATTRIBUTE_DEFINITIONS,
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
  const hasRoundChange = Object.prototype.hasOwnProperty.call(changed, "round");
  if (!hasRoundChange) return;
  if ((combat.round ?? 0) <= 0) return;
  const roundKey = `${combat.id}:${combat.round ?? 0}`;
  const initiativeUpdates = [];

  for (const combatant of combat.combatants ?? []) {
    const actor = combatant.actor;
    if (!actor) continue;

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
});
