# Pok-Role-Module

Foundry VTT v13 system scaffold aligned to PokeRole 2.0 core combat rules.

## Current MVP

- Actor types: `trainer`, `pokemon`
- Item types: `move`, `gear`, `ability`, `weather`, `status`, `pokedex`
- Compendia (configured):
  - `Trainer Items` (`Item`)
  - `Healing Items` (`Item`)
  - `Pokemon Care Items` (`Item`)
  - `Evolutionary Items` (`Item`)
  - `Held Items` (`Item`)
  - `Pokedex` (`Item`)
  - `Pokemon Actors` (`Actor`)
  - `Moves` (`Item`)
  - `Weather Conditions` (`Item`)
  - `Pokemon Status` (`Item`)
  - `Abilities` (`Item`)
- Compendium build model:
  - Compendium data is prepared externally via `tools/build_compendium_seeds.py` and stored in `module/seeds/generated/`.
  - Move compendium data can also be rebuilt from upstream `moves.db` via `tools/build_moves_from_db.py`.
  - Foundry packs are precompiled into `packs/*` (LevelDB) via `tools/build_static_compendia.mjs`.
  - No automatic seeding/generation runs at world startup.
  - Item seeds include all listed Corebook items from `Trainer's Basics`, `Healing Items`, `Items for Pokemon Care`, `Evolutionary Items`, and `Held Items` (p.76-85, 107 total item entries).
  - `Moves` compendium is rebuilt from upstream Pokerole move data (`moves.db`) into `888` static move items.
  - Move rebuilds generate `module/seeds/generated/move-automation-report.json` and `.md` with `full/partial/manual` automation coverage.
  - Move icons are auto-assigned by move type (`assets/types/*.svg`).
  - `Abilities` compendium is rebuilt from Corebook pages `434-471` (257 ability items), each with effect text and `Corebook p.X` in description.
  - `Pokedex` compendium is fully seeded with `#001-#890` plus supported regional/mega/primal forms (1022 pokedex items).
  - `Pokemon Actors` compendium is seeded as playable `Actor` entries (`type: pokemon`) from Corebook-aligned Pokédex data (HP/WILL, suggested rank, attributes, typing, learnset).
  - Pokemon actor moves are embedded by default and grouped into `learnsetByRank`; all imported moves start as `isUsable: false` (learned-only until selected).
  - Rank mapping now uses official manual tiers directly (1:1): `starter`, `rookie`, `standard`, `advanced`, `expert`, `ace`, `master`, `champion`.
  - `Pokedex` and `Pokemon Actors` entries auto-bind artwork from `assets/pokemon/book/book/*.png` (identifier/form-aware fallback matching).
  - Manual GM-only seed command remains available in browser console for maintenance/debug:
    - `await game.pokrole.seedCompendia()`
    - `await game.pokrole.seedCompendia({ force: true })` (rebuild from seed data)
- Bilingual UI: English + Italian (`lang/en.json`, `lang/it.json`)
- Custom sheets:
  - Trainer sheet
  - Pokemon sheet
  - Pokemon `Settings` tab for per-actor track maximums (saved on that actor only)
  - Pokemon attribute cap rules: `Strength/Dexterity/Vitality/Special/Insight` configurable per actor (up to `12`); social attributes fixed `0-5`, skills and `Extra` fixed `0-5`
  - Pokemon settings include per-actor `manual core base` fields and `learnable moves by rank` notes
  - Ailment quick toggles (Sleep, Burn, Frozen, Paralyzed, Poisoned, Fainted) on Trainer and Pokemon sheets, with icon chips
  - Pokemon matchup panel rendered with multiplier icons (`1/2`, `1/4`, `x2`, `x4`, `x0`) plus type icons
  - Move item sheet
    - `Target` field (manual move-card target definitions)
    - `Secondary Effects` editor (trigger/chance/target/type/stat/condition/amount)
  - Gear item sheet
  - Playable reference item sheets: `ability`, `weather`, `status`, `pokedex`
- Pokemon progression:
  - Uses `Tier` (Starter, Beginner, Amateur, Ace, Pro, Master, Champion)
- Automation:
  - Success-pool rolls (`Xd6`, success on `4+`)
  - Initiative roll (`1d6 + Dexterity + Alert`)
  - Evasion roll (`Dexterity + Evasion`)
  - Clash roll (`Strength/Special + Clash`, using move damage trait)
  - Combined Roll button (multi-select attributes/skills on Trainer and Pokemon sheet)
  - Inventory by embedded `gear` items:
    - Backpack pocket model (`potions`, `small`, `main`, `badge`, `held`)
    - Item categories for healing/status/revive/pokeball/travel/battle/etc.
    - Battle usage restrictions (main pocket items blocked in combat)
    - Consumable stock handling with optional per-item units (Potion Unit style)
    - One-click use from trainer sheet with chat summary
  - Successive action tracking per round:
    - each new action by the same actor in the same round requires `+1` success (Action Number `1..5`)
    - the same move can be used multiple times in the same round
    - manual reset button available on sheets (`Reset Actions`)
    - at each new combat round, all combatants reset `Action Number` and reroll initiative
  - Move accuracy resolution:
    - Accuracy pool = `Accuracy Attribute + Accuracy Skill`
    - Reduced Accuracy + Pain penalization remove successes
    - Required successes are automatically taken from current `Action Number`
  - Move target definitions (p.347-348):
    - supports `Foe`, `Random Foe`, `All Foes`, `Self`, `Ally`, `User and Allies`, `Area`, `Battlefield`, `Foe's Battlefield`, `Ally's Battlefield`, `Battlefield and Area`
  - Defensive reaction flow (Step 2.5):
    - prompts optional target reaction on hit
    - Evasion/Clash once per round each
    - social-attribute accuracy moves cannot be evaded/clashed
    - never-fail moves cannot be evaded (but can be clashed)
    - clash can only use damaging moves
    - clash success replaces normal damage with clash damage rules
  - Move damage resolution:
    - Damage pool = `Damage Attribute + Power + STAB + Critical - Pain - DEF/S.DEF`
    - Physical moves use target `DEF` (`Vitality`)
    - Special moves use target `S.DEF` (`Insight`)
    - Minimum `1` damage on hit if the target is not immune, including resisted hits
  - Holding Back support (p.53):
    - choose before resolving a damaging move
    - option to deal half damage (rounded down)
    - lethal moves can be restrained to deal regular (non-lethal) damage
  - Critical hit support:
    - `+3` net successes over requirement (`+2` if `High Critical`)
    - Adds `+2` dice to damage pool
  - Type effectiveness support:
    - Weakness: `+1` damage per weakness (only if damage roll has at least 1 success)
    - Resistance: `-1` damage per resistance
    - Immunity: `0` damage
  - Automatic HP subtraction on selected target token(s) based on move target mode
  - Secondary effects automation:
    - executes configured secondary effects after move resolution (conditions, stat changes, combat-profile changes, HP heal/damage, Will change, custom notes)
    - supports chance-dice based effects (`Xd6`, effect triggers if any die shows `6`) and trigger modes (`on-hit`, `on-hit-damage`, `on-miss`, `always`)
    - supports multi-target secondary effects (`target`, `self`, `all-targets`, `all-allies`, `all-foes`)
    - supports conditional secondary effects with expressions such as `weather=sunny or weather=harsh-sunlight`
    - supports weather activation and simplified terrain activation as first-class secondary effect types
    - fallback inference from move description text for common patterns (status chance, stat stage up/down, half-max HP heal, fraction-of-max HP damage)
    - legacy upstream `effectGroups` are converted into this format during seed generation/import
    - optional ability automation hook: embedded `ability` items can run the same effect engine when `system.effect` contains JSON effect payload(s)

## Install (local dev)

1. Place this folder inside your Foundry `Data/systems/` directory.
2. Ensure the folder name matches your system id (default: `pok-role-system`).
3. Start Foundry, create a world with system `Poké Role System`.

## Install (manifest URL)

Use this URL in Foundry "Install System":

`https://raw.githubusercontent.com/RiccardoMont1/Pok-Role-Module/main/system.json`

Important: do not use the GitHub `.../blob/...` URL, because Foundry expects raw JSON and `blob` returns HTML.

## Project Structure

- `system.json`: Foundry system manifest
- `pok-role-module.mjs`: system bootstrap
- `module/`: data models, documents, sheets
- `assets/`: static assets (Pokeball pattern, move type icons, ailments, generic icon set)
- `module/seeds/generated/`: generated datasets for `moves`, `abilities`, `pokedex`, and `pokemon actor` compendia
- `module/seeds/generated/move-automation-report.json` / `.md`: move import coverage report from `moves.db`
- `packs/`: compendium pack databases (v13 LevelDB folders)
- `templates/`: handlebars sheets/chat card
- `styles/`: sheet styles
- `lang/`: localization files
- `tools/build_compendium_seeds.py`: regenerates `moves`, `abilities`, `pokedex`, and `pokemon actor` seed modules
- `tools/build_moves_from_db.py`: rebuilds the `moves` seed module from upstream `moves.db` and writes an automation coverage report
- `tools/build_static_compendia.mjs`: compiles hard-coded seed data into static `packs/*` LevelDB compendia

Asset source:
- `assets/types`, `assets/ailments`, `assets/icons` are sourced from `Pokerole-Software-Development/foundry-pokerole` (`images/` at commit `2aa9834587ff02a91789fb2ff61e8472d18d31c6`).

## Compendia Usage

- The system now defines 11 compendium packs in `system.json`.
- Packs are shipped precompiled and populated by default.
- If you regenerate data:
  1. Run `python tools/build_compendium_seeds.py` for items/abilities/pokedex/pokemon actors.
  2. Run `python tools/build_moves_from_db.py` for the move compendium rebuild from `moves.db`.
  3. Run `node tools/build_static_compendia.mjs`.
  4. Publish the updated `packs/*` content in your release/zip.

Compendium grouping and rules mapping (PokeRole 2.0 PDF):
- Trainer/Travel/Healing Items: p.76-80
- Pokemon Care Items: p.81-82
- Evolutionary and Held Items: p.83-85
- Pokedex roster: p.90-345
- Moves roster: p.349-423
- Weather conditions: p.56-57
- Pokemon status conditions: p.58-59
- Move reference/icons: p.347-348
- Abilities roster: p.434-471

## Rules Mapping (PokeRole 2.0 PDF)

- Core action roll and successes: p.29
- Type interaction damage modifiers: p.42-43
- Battle flow, initiative, accuracy, damage, evasion/clash: p.44-45
- Pain penalizations: p.47
- Multiple Actions required successes: p.49
- Evasion/Clash details: p.50
- STAB and low accuracy moves: p.51
- Critical hit threshold and bonus dice: p.52
- Priority/Low Priority semantics: p.53
- Move card structure and icons: p.346-348
- Backpack layout and inventory pockets: p.20
- Item inventory categories and item effects: p.76-85

## Current Limits

- Some moves still require manual handling or custom overrides; see `module/seeds/generated/move-automation-report.md`.
- Delayed / future-resolution moves (`Wish`, `Future Sight`, `Doom Desire`, etc.) are not fully automated yet.
- Terrain support is simplified to a single active combat terrain and does not yet model side-specific battlefield ownership.
- Extra conditions not present in `system.conditions` (for example `Flinch`, `Disabled`, `Infatuated`) are tracked as actor flags.
- Priority/Low Priority does not reorder combat turns automatically yet.
- Shield-chain penalty (`-2` each consecutive round) is not auto-tracked yet.
- Rampage specialized move logic is not fully automated yet.
