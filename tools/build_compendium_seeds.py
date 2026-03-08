import csv
import io
import json
import re
from pathlib import Path

import requests
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "module" / "seeds" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)
BASE = "https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv"
VALID_TYPE_KEYS = {
    "normal", "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying",
    "ghost", "grass", "ground", "ice", "poison", "psychic", "rock", "steel", "water"
}
TYPE_FALLBACKS = {
    "shadow": "ghost",
    "unknown": "normal"
}
MOVE_SECTION_START_PAGE = 349
MOVE_SECTION_END_PAGE = 423
COREBOOK_PDF_CANDIDATES = [
    ROOT / "POKEROLE COREBOOK 2.0.pdf",
    Path(r"C:\Users\Ricch\Downloads\POKEROLE COREBOOK 2.0.pdf")
]
TYPE_SECTION_START_PAGE = {
    "bug": 349,
    "dark": 352,
    "dragon": 356,
    "electric": 358,
    "fairy": 362,
    "fighting": 365,
    "fire": 369,
    "flying": 373,
    "ghost": 376,
    "grass": 379,
    "ground": 383,
    "ice": 386,
    "normal": 389,
    "poison": 407,
    "psychic": 410,
    "rock": 416,
    "steel": 418,
    "water": 421
}


def load_csv(filename):
    response = requests.get(f"{BASE}/{filename}", timeout=120)
    response.raise_for_status()
    return list(csv.DictReader(io.StringIO(response.text)))


def slugify(value):
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-")


def clamp(value, minimum, maximum):
    return max(minimum, min(maximum, value))


def reduced_accuracy_from_percent(percent):
    if percent is None or percent >= 100:
        return 0
    if percent >= 95:
        return 1
    if percent >= 85:
        return 2
    if percent >= 75:
        return 3
    if percent >= 65:
        return 4
    if percent >= 55:
        return 5
    return 6


def format_identifier(identifier):
    text = identifier.replace("-", " ").strip()
    if not text:
        return identifier
    words = []
    for word in text.split():
        if word in {"x", "y", "z"}:
            words.append(word.upper())
        elif word in {"mr", "mrs", "jr", "sr"}:
            words.append(word.capitalize() + ".")
        else:
            words.append(word.capitalize())
    return " ".join(words)


def rank_from_bst(bst):
    if bst <= 300:
        return "starter"
    if bst <= 380:
        return "beginner"
    if bst <= 460:
        return "amateur"
    if bst <= 540:
        return "ace"
    if bst <= 620:
        return "pro"
    if bst <= 700:
        return "master"
    return "champion"


def scale_power(raw_power):
    if raw_power <= 0:
        return 0
    mapped = round(raw_power / 20)
    return clamp(mapped, 1, 7)


def write_module(path, const_name, payload):
    serialized = json.dumps(payload, indent=2, ensure_ascii=True)
    path.write_text(f"export const {const_name} = Object.freeze({serialized});\n", encoding="utf-8")


def clean_text(value):
    text = re.sub(r"\s+", " ", f"{value or ''}").strip()
    return text


def normalize_for_search(value):
    text = (value or "").lower().replace("’", "'")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return f" {text} " if text else " "


def find_corebook_pdf_path():
    for candidate in COREBOOK_PDF_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def extract_move_pages(move_name_by_id):
    pdf_path = find_corebook_pdf_path()
    if not pdf_path:
        return {}

    reader = PdfReader(str(pdf_path))
    move_norm_by_id = {
        move_id: normalize_for_search(name)
        for move_id, name in move_name_by_id.items()
    }
    unresolved_ids = set(move_name_by_id.keys())
    page_by_move_id = {}

    for page_index in range(MOVE_SECTION_START_PAGE - 1, MOVE_SECTION_END_PAGE):
        page_text = reader.pages[page_index].extract_text() or ""
        page_norm = normalize_for_search(page_text)
        if len(page_norm) <= 2:
            continue

        # Check longest names first to reduce accidental short-name matches.
        for move_id in sorted(unresolved_ids, key=lambda item: len(move_norm_by_id[item]), reverse=True):
            if move_norm_by_id[move_id] in page_norm:
                page_by_move_id[move_id] = page_index + 1

        unresolved_ids = {move_id for move_id in unresolved_ids if move_id not in page_by_move_id}
        if not unresolved_ids:
            break

    return page_by_move_id


def resolve_effect_text(effect_template, effect_chance):
    text = clean_text(effect_template)
    if "$effect_chance" in text:
        chance_text = str(effect_chance) if effect_chance else "X"
        text = text.replace("$effect_chance", chance_text)
    return text


def build_moves():
    moves = load_csv("moves.csv")
    move_names = load_csv("move_names.csv")
    move_effect_prose = load_csv("move_effect_prose.csv")
    move_meta = load_csv("move_meta.csv")
    types = load_csv("types.csv")

    type_by_id = {int(row["id"]): row["identifier"] for row in types}
    english_move_name = {
        int(row["move_id"]): row["name"]
        for row in move_names
        if row["local_language_id"] == "9"
    }
    short_effect_by_effect_id = {
        int(row["move_effect_id"]): row["short_effect"]
        for row in move_effect_prose
        if row["local_language_id"] == "9"
    }
    meta_by_move_id = {int(row["move_id"]): row for row in move_meta}
    page_by_move_id = extract_move_pages(english_move_name)

    entries = []
    for row in sorted(moves, key=lambda item: int(item["id"])):
        generation_id = int(row["generation_id"])
        if generation_id > 8:
            continue

        move_id = int(row["id"])
        identifier = row["identifier"]
        name = english_move_name.get(move_id) or format_identifier(identifier)
        type_key = type_by_id.get(int(row["type_id"]), "normal")
        type_key = TYPE_FALLBACKS.get(type_key, type_key)
        if type_key not in VALID_TYPE_KEYS:
            type_key = "normal"

        damage_class_id = int(row["damage_class_id"])
        category = "support" if damage_class_id == 1 else ("physical" if damage_class_id == 2 else "special")

        raw_power = int(row["power"]) if row["power"] else 0
        power = scale_power(raw_power)
        accuracy_percent = int(row["accuracy"]) if row["accuracy"] else None
        priority = clamp(int(row["priority"] or 0), -3, 5)
        reduced_accuracy = reduced_accuracy_from_percent(accuracy_percent)

        meta = meta_by_move_id.get(move_id, {})
        max_hits = int(meta["max_hits"]) if meta.get("max_hits") else 0
        max_turns = int(meta["max_turns"]) if meta.get("max_turns") else 0
        crit_rate = int(meta["crit_rate"]) if meta.get("crit_rate") else 0

        if max_hits >= 5 or max_turns >= 5:
            action_tag = "5A"
        elif max_hits >= 2 or max_turns >= 2:
            action_tag = "2A"
        else:
            action_tag = "1A"

        if category == "support":
            accuracy_attribute = "insight"
            accuracy_skill = "alert"
            damage_attribute = "none"
        elif category == "special":
            accuracy_attribute = "special"
            accuracy_skill = "channel"
            damage_attribute = "special"
        else:
            accuracy_attribute = "dexterity"
            accuracy_skill = "brawl"
            damage_attribute = "strength"

        effect_id = int(row["effect_id"]) if row["effect_id"] else 0
        effect_chance = int(row["effect_chance"]) if row["effect_chance"] else None
        effect_text = resolve_effect_text(short_effect_by_effect_id.get(effect_id, ""), effect_chance)
        page = page_by_move_id.get(move_id, TYPE_SECTION_START_PAGE.get(type_key, MOVE_SECTION_START_PAGE))
        page_text = f"Corebook p.{page}"
        if effect_text:
            description = f"{page_text}. {effect_text}"
        else:
            description = f"{page_text}. Move description available in the move section."

        entries.append({
            "name": name,
            "type": "move",
            "img": "icons/svg/sword.svg",
            "system": {
                "type": type_key,
                "category": category,
                "actionTag": action_tag,
                "accuracyAttribute": accuracy_attribute,
                "accuracySkill": accuracy_skill,
                "power": power,
                "reducedAccuracy": reduced_accuracy,
                "damageAttribute": damage_attribute,
                "priority": priority,
                "highCritical": crit_rate > 0,
                "neverFail": accuracy_percent is None,
                "lethal": category != "support" and power >= 6,
                "isUsable": True,
                "description": description
            },
            "flags": {
                "pok-role-module": {
                    "seedId": f"move-{slugify(identifier)}"
                }
            }
        })

    return entries


def build_pokedex():
    species = load_csv("pokemon_species.csv")
    species_names = load_csv("pokemon_species_names.csv")
    pokemon = load_csv("pokemon.csv")
    pokemon_types = load_csv("pokemon_types.csv")
    pokemon_stats = load_csv("pokemon_stats.csv")
    pokemon_abilities = load_csv("pokemon_abilities.csv")
    abilities = load_csv("abilities.csv")
    ability_names = load_csv("ability_names.csv")
    types = load_csv("types.csv")
    habitats = load_csv("pokemon_habitats.csv")
    habitat_names = load_csv("pokemon_habitat_names.csv")

    type_by_id = {int(row["id"]): row["identifier"] for row in types}
    species_name_en = {
        int(row["pokemon_species_id"]): row["name"]
        for row in species_names
        if row["local_language_id"] == "9"
    }
    ability_identifier_by_id = {int(row["id"]): row["identifier"] for row in abilities}
    ability_name_en = {
        int(row["ability_id"]): row["name"]
        for row in ability_names
        if row["local_language_id"] == "9"
    }
    habitat_identifier_by_id = {int(row["id"]): row["identifier"] for row in habitats}
    habitat_name_en = {
        int(row["pokemon_habitat_id"]): row["name"]
        for row in habitat_names
        if row["local_language_id"] == "9"
    }

    pokemon_by_id = {int(row["id"]): row for row in pokemon}

    default_pokemon_by_species = {}
    forms = []
    for row in pokemon:
        species_id = int(row["species_id"])
        if species_id > 890:
            continue
        if row["is_default"] == "1":
            default_pokemon_by_species[species_id] = int(row["id"])
        else:
            identifier = row["identifier"]
            if any(tag in identifier for tag in ("-alola", "-galar", "-mega", "-primal")):
                forms.append(int(row["id"]))

    type_rows_by_pokemon = {}
    for row in pokemon_types:
        pokemon_id = int(row["pokemon_id"])
        type_rows_by_pokemon.setdefault(pokemon_id, []).append((int(row["slot"]), int(row["type_id"])))

    bst_by_pokemon = {}
    for row in pokemon_stats:
        pokemon_id = int(row["pokemon_id"])
        bst_by_pokemon[pokemon_id] = bst_by_pokemon.get(pokemon_id, 0) + int(row["base_stat"])

    abilities_by_pokemon = {}
    for row in pokemon_abilities:
        pokemon_id = int(row["pokemon_id"])
        abilities_by_pokemon.setdefault(pokemon_id, []).append((int(row["slot"]), int(row["ability_id"]), row["is_hidden"] == "1"))

    species_rows = [row for row in species if int(row["id"]) <= 890]
    species_rows.sort(key=lambda row: int(row["id"]))
    species_row_by_id = {int(row["id"]): row for row in species_rows}

    def get_types_for_pokemon(pokemon_id):
        rows = sorted(type_rows_by_pokemon.get(pokemon_id, []), key=lambda item: item[0])
        keys = [type_by_id.get(type_id, "normal") for _, type_id in rows]
        if not keys:
            return "normal", "none"
        if len(keys) == 1:
            return keys[0], "none"
        return keys[0], keys[1]

    def get_abilities_for_pokemon(pokemon_id):
        rows = sorted(abilities_by_pokemon.get(pokemon_id, []), key=lambda item: item[0])
        names = []
        for _, ability_id, is_hidden in rows:
            base_name = ability_name_en.get(ability_id) or format_identifier(ability_identifier_by_id.get(ability_id, "unknown"))
            names.append(f"{base_name} (Hidden)" if is_hidden else base_name)
        return ", ".join(names)

    def build_entry(species_id, pokemon_id, name, seed_suffix):
        primary, secondary = get_types_for_pokemon(pokemon_id)
        bst = bst_by_pokemon.get(pokemon_id, 350)
        rank = rank_from_bst(bst)

        species_row = species_row_by_id.get(species_id)
        habitat_value = ""
        if species_row and species_row.get("habitat_id"):
            habitat_id = int(species_row["habitat_id"])
            habitat_value = habitat_name_en.get(habitat_id) or format_identifier(habitat_identifier_by_id.get(habitat_id, ""))

        return {
            "name": name,
            "type": "pokedex",
            "img": "icons/svg/book.svg",
            "system": {
                "dexNumber": species_id,
                "rank": rank,
                "primaryType": primary,
                "secondaryType": secondary,
                "habitats": habitat_value,
                "abilities": get_abilities_for_pokemon(pokemon_id),
                "commonMoves": "",
                "evolutionNotes": "",
                "description": "Imported from the PokeRole Corebook Pokedex roster (#001-#890 and supported forms)."
            },
            "flags": {
                "pok-role-module": {
                    "seedId": f"pokedex-{species_id:03d}-{seed_suffix}"
                }
            }
        }

    entries = []

    for row in species_rows:
        species_id = int(row["id"])
        pokemon_id = default_pokemon_by_species.get(species_id)
        if not pokemon_id:
            continue
        base_name = species_name_en.get(species_id) or format_identifier(row["identifier"])
        entries.append(build_entry(species_id, pokemon_id, base_name, slugify(row["identifier"])))

    for pokemon_id in sorted(forms):
        row = pokemon_by_id.get(pokemon_id)
        if not row:
            continue
        species_id = int(row["species_id"])
        species_name = species_name_en.get(species_id) or format_identifier(row["identifier"])
        identifier = row["identifier"]
        if identifier.endswith("-alola"):
            form_name = f"{species_name} (Alola)"
        elif identifier.endswith("-galar"):
            form_name = f"{species_name} (Galar)"
        elif identifier.endswith("-mega-x"):
            form_name = f"Mega {species_name} X"
        elif identifier.endswith("-mega-y"):
            form_name = f"Mega {species_name} Y"
        elif identifier.endswith("-mega"):
            form_name = f"Mega {species_name}"
        elif identifier.endswith("-primal"):
            form_name = f"{species_name} (Primal)"
        else:
            form_name = format_identifier(identifier)
        entries.append(build_entry(species_id, pokemon_id, form_name, slugify(identifier)))

    unique_entries = {}
    for entry in entries:
        unique_entries[entry["flags"]["pok-role-module"]["seedId"]] = entry
    return list(unique_entries.values())


def main():
    moves = build_moves()
    pokedex = build_pokedex()
    write_module(OUT_DIR / "move-seeds.mjs", "MOVE_COMPENDIUM_ENTRIES", moves)
    write_module(OUT_DIR / "pokedex-seeds.mjs", "POKEDEX_COMPENDIUM_ENTRIES", pokedex)
    print(f"Generated moves: {len(moves)}")
    print(f"Generated pokedex entries: {len(pokedex)}")


if __name__ == "__main__":
    main()
