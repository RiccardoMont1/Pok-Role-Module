// Italian localization system for Pok-Role-Module
// Translates compendium entries (moves, items, abilities, weather, status) in the UI.
// Applies translations at render time so internal English keys are preserved.

import { MOVE_TRANSLATIONS_IT } from "./move-translations-it.mjs";
import { ITEM_TRANSLATIONS_IT } from "./item-translations-it.mjs";
import { ABILITY_TRANSLATIONS_IT } from "./ability-translations-it.mjs";

const EMPTY = Object.freeze({});

function getDictionaries() {
  const lang = game?.i18n?.lang;
  if (lang !== "it") return null;
  return {
    move: MOVE_TRANSLATIONS_IT,
    ability: ABILITY_TRANSLATIONS_IT,
    gear: ITEM_TRANSLATIONS_IT,
    weather: ITEM_TRANSLATIONS_IT,
    status: ITEM_TRANSLATIONS_IT
  };
}

/**
 * Translate a single name to Italian if locale is it.
 * @param {string} englishName
 * @param {string} [itemType] Optional item type hint ("move","gear","ability","weather","status")
 * @returns {string}
 */
export function translateName(englishName, itemType = null) {
  if (!englishName || typeof englishName !== "string") return englishName;
  const dicts = getDictionaries();
  if (!dicts) return englishName;
  if (itemType && dicts[itemType]) {
    const translated = dicts[itemType][englishName];
    if (translated) return translated;
  }
  // Fallback: try all dictionaries
  return (
    MOVE_TRANSLATIONS_IT[englishName] ??
    ABILITY_TRANSLATIONS_IT[englishName] ??
    ITEM_TRANSLATIONS_IT[englishName] ??
    englishName
  );
}

/**
 * Get original English name from a translated Italian name, or return input if not found.
 * @param {string} translatedName
 * @returns {string}
 */
export function detranslateName(translatedName) {
  if (!translatedName || typeof translatedName !== "string") return translatedName;
  const all = [MOVE_TRANSLATIONS_IT, ABILITY_TRANSLATIONS_IT, ITEM_TRANSLATIONS_IT];
  for (const dict of all) {
    for (const [en, it] of Object.entries(dict)) {
      if (it === translatedName) return en;
    }
  }
  return translatedName;
}

const COMPENDIUM_LABELS_IT = Object.freeze({
  "Moves": "Mosse",
  "Abilities": "Abilità",
  "Held Items": "Strumenti",
  "Trainer Items": "Oggetti Allenatore",
  "Healing Items": "Oggetti Curativi",
  "Pokemon Care Items": "Oggetti Cura Pokémon",
  "Evolutionary Items": "Oggetti Evolutivi",
  "Weather Conditions": "Condizioni Meteorologiche",
  "Pokemon Status": "Stati Alterati",
  "Pokemon Actors": "Pokémon",
  "PokeRole Compendia": "Compendi PokéRole",
  "Trainer Gear": "Equipaggiamento Allenatore",
  "Battle Rules": "Regole di Battaglia",
  "Pokemon": "Pokémon"
});

function translatePackLabel(label) {
  if (!label) return label;
  return COMPENDIUM_LABELS_IT[label] ?? label;
}

/**
 * Translate names inside a compendium index entries array in-place.
 * @param {Array<object>} entries
 * @param {string} [type]
 */
function translateIndexEntries(entries, type = null) {
  if (!Array.isArray(entries)) return;
  for (const entry of entries) {
    if (entry?.name) {
      entry.name = translateName(entry.name, type);
    }
  }
}

/**
 * Determine which item-type a pack corresponds to.
 */
function getPackType(pack) {
  if (!pack) return null;
  const id = `${pack.collection ?? pack.metadata?.id ?? ""}`;
  if (id.endsWith("moves")) return "move";
  if (id.endsWith("abilities")) return "ability";
  if (id.endsWith("weather-conditions")) return "weather";
  if (id.endsWith("pokemon-status")) return "status";
  if (id.includes("items")) return "gear";
  return null;
}

function translatePackFolderLabel(folder) {
  if (!folder?.name) return;
  const translated = COMPENDIUM_LABELS_IT[folder.name];
  if (translated) folder.name = translated;
}

/**
 * Hook into Foundry to translate compendium listings, item sheets, and chat.
 */
export function registerItalianLocalization() {
  if (game?.i18n?.lang !== "it") return;

  // Translate compendium pack labels
  try {
    for (const pack of game.packs) {
      if (pack.metadata?.packageName !== "pok-role-system") continue;
      const original = pack.metadata.label;
      const translated = translatePackLabel(original);
      if (translated && translated !== original) {
        pack.metadata.label = translated;
      }
    }
  } catch (e) {
    console.warn("Pok-Role | Failed to translate pack labels", e);
  }

  // Translate compendium index rendering (sidebar/compendium app)
  Hooks.on("renderCompendium", (app, html) => {
    try {
      const pack = app.collection ?? app.pack;
      const type = getPackType(pack);
      if (!type) return;
      const root = html instanceof jQuery ? html[0] : html;
      if (!root) return;
      const entries = root.querySelectorAll(".directory-item, li[data-document-id], li[data-entry-id]");
      entries.forEach((el) => {
        const nameEl = el.querySelector(".document-name, .entry-name, h4, .name");
        if (!nameEl) return;
        // Only translate if text node matches English original
        const original = nameEl.textContent?.trim();
        if (!original) return;
        const translated = translateName(original, type);
        if (translated && translated !== original) {
          nameEl.textContent = translated;
        }
      });
    } catch (e) {
      console.warn("Pok-Role | renderCompendium translation failed", e);
    }
  });

  // Translate item sheet window titles and internal name fields
  Hooks.on("renderItemSheet", (sheet, html) => {
    try {
      const item = sheet.object ?? sheet.document;
      if (!item) return;
      const type = item.type === "move" ? "move"
        : item.type === "ability" ? "ability"
        : item.type === "gear" ? "gear"
        : item.type === "weather" ? "weather"
        : item.type === "status" ? "status"
        : null;
      if (!type) return;
      const original = item.name;
      const translated = translateName(original, type);
      if (!translated || translated === original) return;

      const root = html instanceof jQuery ? html[0] : html;
      if (!root) return;

      // Window title
      const titleEl = root.closest(".app")?.querySelector(".window-title") ?? root.querySelector(".window-title");
      if (titleEl && titleEl.textContent?.includes(original)) {
        titleEl.textContent = titleEl.textContent.replace(original, translated);
      }

      // Display-only name field (read-only labels). Avoid overwriting active <input name=\"name\"> value.
      const nameInputs = root.querySelectorAll('input[name="name"]');
      // Do not modify actual input values - user is editing raw data
    } catch (e) {
      console.warn("Pok-Role | renderItemSheet translation failed", e);
    }
  });

  // Translate actor sheet move/item listings
  Hooks.on("renderActorSheet", (sheet, html) => {
    try {
      const root = html instanceof jQuery ? html[0] : html;
      if (!root) return;
      const rows = root.querySelectorAll("[data-item-id]");
      rows.forEach((row) => {
        const itemId = row.dataset.itemId;
        const item = sheet.actor?.items?.get(itemId);
        if (!item) return;
        const type = item.type === "move" ? "move"
          : item.type === "ability" ? "ability"
          : item.type === "gear" ? "gear"
          : item.type === "weather" ? "weather"
          : item.type === "status" ? "status"
          : null;
        if (!type) return;
        const translated = translateName(item.name, type);
        if (!translated || translated === item.name) return;
        const nameEl = row.querySelector(".item-name, .move-name, .ability-name, h4, .name");
        if (nameEl) {
          const textNode = [...nameEl.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue?.trim() === item.name);
          if (textNode) {
            textNode.nodeValue = textNode.nodeValue.replace(item.name, translated);
          } else if (nameEl.textContent?.trim() === item.name) {
            nameEl.textContent = translated;
          } else if (nameEl.textContent?.includes(item.name)) {
            nameEl.textContent = nameEl.textContent.replace(item.name, translated);
          }
        }
      });
    } catch (e) {
      console.warn("Pok-Role | renderActorSheet translation failed", e);
    }
  });

  // Translate chat messages (move names, item names in rolls)
  Hooks.on("renderChatMessage", (msg, html) => {
    try {
      const root = html instanceof jQuery ? html[0] : html;
      if (!root) return;
      const headers = root.querySelectorAll(".flavor-text, .message-header h4, .pokrole-chat-card .card-title, .card-title");
      headers.forEach((el) => {
        const text = el.textContent;
        if (!text) return;
        for (const [en, it] of Object.entries(MOVE_TRANSLATIONS_IT)) {
          if (text.includes(en)) {
            el.textContent = el.textContent.replace(en, it);
          }
        }
        for (const [en, it] of Object.entries(ABILITY_TRANSLATIONS_IT)) {
          if (text.includes(en)) {
            el.textContent = el.textContent.replace(en, it);
          }
        }
        for (const [en, it] of Object.entries(ITEM_TRANSLATIONS_IT)) {
          if (text.includes(en)) {
            el.textContent = el.textContent.replace(en, it);
          }
        }
      });
    } catch (e) {
      // silent - chat translations are best-effort
    }
  });

  // Translate compendium folder names in sidebar
  Hooks.on("renderCompendiumDirectory", (app, html) => {
    try {
      const root = html instanceof jQuery ? html[0] : html;
      if (!root) return;
      const folderNames = root.querySelectorAll(".folder-header h3, .folder-header .folder-name, h3");
      folderNames.forEach((el) => {
        const original = el.textContent?.trim();
        if (!original) return;
        const translated = COMPENDIUM_LABELS_IT[original];
        if (translated && translated !== original) {
          el.textContent = translated;
        }
      });
      // Pack labels inside directory
      const packLabels = root.querySelectorAll(".compendium-pack a, .pack-title");
      packLabels.forEach((el) => {
        const original = el.textContent?.trim();
        if (!original) return;
        const translated = COMPENDIUM_LABELS_IT[original];
        if (translated && translated !== original) {
          el.textContent = translated;
        }
      });
    } catch (e) {
      // silent
    }
  });

  console.log(`Pok-Role | Italian localization registered (${Object.keys(MOVE_TRANSLATIONS_IT).length} moves, ${Object.keys(ITEM_TRANSLATIONS_IT).length} items, ${Object.keys(ABILITY_TRANSLATIONS_IT).length} abilities)`);
}
