# Pok-Role-Module

Foundry VTT v13 system scaffold aligned to PokeRole 2.0 core combat rules.

## Current MVP

- Actor types: `trainer`, `pokemon`
- Item type: `move`
- Bilingual UI: English + Italian (`lang/en.json`, `lang/it.json`)
- Custom sheets:
  - Trainer sheet
  - Pokemon sheet
  - Move item sheet
- Automation:
  - Success-pool rolls (`Xd6`, success on `4+`)
  - Initiative roll (`1d6 + Dexterity + Alert`)
  - Evasion roll (`Dexterity + Evasion`)
  - Clash roll (`Strength/Special + Clash`, using move damage trait)
  - Move accuracy resolution:
    - Accuracy pool = `Accuracy Attribute + Accuracy Skill`
    - Reduced Accuracy + Pain penalization remove successes
    - Multiple Actions support via `Action Number` (`1..5`) as required successes
  - Move damage resolution:
    - Damage pool = `Damage Attribute + Power + STAB + Critical - Pain - DEF/S.DEF`
    - Physical moves use target `DEF` (`Vitality`)
    - Special moves use target `S.DEF` (`Insight`)
    - Minimum `1` damage on hit
  - Critical hit support:
    - `+3` net successes over requirement (`+2` if `High Critical`)
    - Adds `+2` dice to damage pool
  - Type effectiveness support:
    - Weakness: `+1` damage per weakness (only if damage roll has at least 1 success)
    - Resistance: `-1` damage per resistance
    - Immunity: `0` damage
  - Automatic HP subtraction on selected single target token

## Install (local dev)

1. Place this folder inside your Foundry `Data/systems/` directory.
2. Ensure the folder name is `pok-role-module`.
3. Start Foundry, create a world with system `Poke Role Module`.

## Install (manifest URL)

Use this URL in Foundry "Install System":

`https://raw.githubusercontent.com/RiccardoMont1/Pok-Role-Module/main/system.json`

Important: do not use the GitHub `.../blob/...` URL, because Foundry expects raw JSON and `blob` returns HTML.

## Project Structure

- `system.json`: Foundry system manifest
- `pok-role-module.mjs`: system bootstrap
- `module/`: data models, documents, sheets
- `templates/`: handlebars sheets/chat card
- `styles/`: sheet styles
- `lang/`: localization files

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

## Current Limits

- Chance Dice effects are not auto-resolved yet.
- Status condition application and durations are not fully automated yet.
- Priority/Low Priority does not reorder combat turns automatically yet.
- Move legality constraints (once per round, shield stack penalties, etc.) are currently manual.
