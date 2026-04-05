# Pok-Role-Module

<p align="center">
  <strong>Foundry VTT v13 system for PokeRole 3.0</strong><br>
  Custom sheets, prebuilt compendia, battle automation, capture flow, progression tools, and an arcade UI that players can theme per-user.
</p>

<p align="center">
  <img alt="Foundry VTT v13" src="https://img.shields.io/badge/Foundry-v13-f36f24?style=for-the-badge">
  <img alt="System version 1.3.0" src="https://img.shields.io/badge/System-1.3.0-2d7ff9?style=for-the-badge">
  <img alt="PokeRole 3.0" src="https://img.shields.io/badge/PokeRole-3.0-d94b3d?style=for-the-badge">
  <img alt="Languages EN and IT" src="https://img.shields.io/badge/Languages-EN%20%7C%20IT-00a7c4?style=for-the-badge">
</p>

---

## Overview

`Pok-Role-Module` is a Foundry VTT system built around the current PokeRole 3.0 data pipeline and a custom battle workflow.

It ships with:

- custom `trainer` and `pokemon` actor sheets
- custom sheets for `move`, `gear`, `ability`, `weather`, `status`, and `pokedex` items
- precompiled compendia grouped for gameplay use
- a large move automation layer with a generated coverage report
- held item runtime automation
- Pokeball capture flow
- training points, rank-up, retrain, and evolution support
- an arcade UI skin with 4 per-user color themes

## Highlights

| Area | What is already implemented |
| --- | --- |
| Sheets | Dedicated Trainer and Pokemon sheets, progression controls, learnset/evolution handling, held item slot, temporary effect visibility |
| Combat | Success-pool rolls, initiative, accuracy, pain, STAB, criticals, weakness/resistance/immunity, Evasion, Clash, holding back, multi-action penalties |
| Queue | Move declarations stored on actor flags to avoid Combat permission issues for players |
| Effects | Secondary effect engine, conditions, stat stages, weather, terrain, hazards, delayed effects, side-field interactions |
| Items | Battle gear, healing items, Pokeballs, and held item runtime behavior |
| Progression | Training Points, battle-training rewards, retrain, rank-up, form-aware evolution flow |
| Capture | Pokeball throw + seal flow, ball-specific behavior, caught-by/current-trainer updates, token friendliness updates |
| UI | Arcade skin, pause styling, themed directories, per-user palette selection |
| Content pipeline | Generated seeds, static compendium build, upstream Pokerole-Data integration |

## Included Compendia

The system currently ships with **10 precompiled packs** in `packs/`.

| Group | Packs |
| --- | --- |
| Trainer Gear | `trainer-items`, `healing-items`, `pokemon-care-items`, `evolutionary-items`, `held-items` |
| Battle Rules | `moves`, `abilities`, `weather-conditions`, `pokemon-status` |
| Pokemon | `pokemon-actors` |

The packs are defined in [system.json](system.json) and grouped into `packFolders` for a cleaner sidebar layout.

## Automation Snapshot

Current move automation report:

- total moves: `894`
- full automation: `869`
- partial automation: `4`
- manual handling still required: `21`

Source:

- [move-automation-report.json](module/seeds/generated/move-automation-report.json)
- [move-automation-report.md](module/seeds/generated/move-automation-report.md)

The remaining gaps are mostly concentrated in:

- Z-Moves
- Dynamax-specific rules
- a small set of external-rule or storyteller-driven edge cases

## UI And Themes

The system includes an arcade UI layer on top of Foundry.

Each user can select their own palette from Foundry client settings:

- `Celeste - Chiaro`
- `Celeste - Scuro`
- `Rosso - Chiaro`
- `Rosso - Scuro`

The theme is client-scoped, so one player can use a dark palette while another keeps the light version.

## Installation

### Manifest URL

Use this in Foundry's **Install System** dialog:

```text
https://raw.githubusercontent.com/RiccardoMont1/Pok-Role-Module/main/system.json
```

### Direct download

```text
https://github.com/RiccardoMont1/Pok-Role-Module/archive/refs/heads/main.zip
```

### Local development install

1. Place the repository inside your Foundry `Data/systems/` directory.
2. Ensure the folder name matches the system id in [system.json](system.json): `pok-role-system`.
3. Launch Foundry and create or open a world using `Poke Role System`.

## Current Feature Scope

### Actors and items

- Actor types:
  - `trainer`
  - `pokemon`
- Item types:
  - `move`
  - `gear`
  - `ability`
  - `weather`
  - `status`
  - `pokedex`

### Combat and battle flow

Implemented battle workflow includes:

- success-pool rolls (`Xd6`, success on `4+`)
- initiative formula from [system.json](system.json)
- accuracy resolution with pain and reduced-accuracy handling
- STAB, critical hits, and type effectiveness
- Evasion and Clash reactions
- holding back / non-lethal resolution
- side-field effects, hazards, terrain, weather, and delayed effects
- player-side move declaration queue without direct Combat writes

### Progression and management

Implemented progression systems include:

- Training Points
- battle-training rewards
- rank-up and retrain dialogs
- evolution flow and form-aware updates
- learnset / move usability management
- obedience checks for training and battle

### Capture and Pokeballs

Capture flow includes:

- Pokeball throw + seal resolution using Foundry rolls
- ball-specific effects
- trainer ownership updates on successful capture
- current trainer / caught-by data updates
- scene token friendliness updates on capture

### Held items

Held items are not just static data.

The runtime currently supports:

- stat bonuses
- damage modifiers
- high-critical overrides
- on-enter behavior
- hazard immunity and similar protections
- many standard held item reactions and effects

The system also uses Active Effects to reflect held-item-derived stat changes in the Pokemon sheet.

## Development Pipeline

The project uses generated seeds plus static pack compilation.

### Main scripts

- [build_compendium_seeds.py](tools/build_compendium_seeds.py)
- [build_moves_from_db.py](tools/build_moves_from_db.py)
- [build_held_items_from_external.mjs](tools/build_held_items_from_external.mjs)
- [build_static_compendia.mjs](tools/build_static_compendia.mjs)

### Typical rebuild flow

```bash
python tools/build_compendium_seeds.py
python tools/build_moves_from_db.py
node tools/build_held_items_from_external.mjs
node tools/build_static_compendia.mjs
```

### Seeded/generated data lives in

- [module/seeds/generated](module/seeds/generated)

### Static packs live in

- [packs](packs)

### Auto-update behavior

On GM startup, the system checks the current seed version in [compendium-seed.mjs](module/seeds/compendium-seed.mjs) and updates compendia when the seed version changes.

There is also a manual API for maintenance/debug:

```js
await game.pokrole.seedCompendia()
await game.pokrole.seedCompendia({ force: true })
```

## Repository Layout

| Path | Purpose |
| --- | --- |
| [system.json](system.json) | Foundry manifest |
| [pok-role-module.mjs](pok-role-module.mjs) | bootstrap, hooks, socket/relay flow, startup tasks |
| [module](module) | data models, documents, sheets, automation logic |
| [templates](templates) | Handlebars sheets and chat cards |
| [styles](styles) | system and UI theming |
| [lang](lang) | English and Italian localization |
| [assets](assets) | icons, sprites, banners, UI visuals |
| [tools](tools) | data builders and audit utilities |
| [reports](reports) | analysis output and supporting reports |

## Known Boundaries

This README is intentionally honest about what is still incomplete.

Current boundaries include:

- Z-Moves are not fully automated yet
- Dynamax handling is still partial
- some storyteller-driven or external-rule moves remain manual by design
- the project does not ship an automated test suite yet

## Credits

Data and assets are derived from the broader Pokerole ecosystem and the project-specific import/build pipeline in this repository.

Notable sources referenced in code and build flow include:

- Pokerole-Data v3.0 move and item sources
- upstream Pokerole image/sprite repositories used by the compendium builders
- Foundry VTT v13

## License / project state

This repository is currently best read as an actively developed system project rather than a finished, frozen release line.

If you want to contribute or open issues:

- repo: `https://github.com/RiccardoMont1/Pok-Role-Module`
- issues: `https://github.com/RiccardoMont1/Pok-Role-Module/issues`
