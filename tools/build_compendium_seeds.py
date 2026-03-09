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
POKEMON_IMAGE_DIR = ROOT / "assets" / "pokemon" / "book" / "book"
POKEMON_IMAGE_ROOT = "systems/pok-role-module/assets/pokemon/book/book"
VALID_TYPE_KEYS = {
    "normal", "bug", "dark", "dragon", "electric", "fairy", "fighting", "fire", "flying",
    "ghost", "grass", "ground", "ice", "poison", "psychic", "rock", "steel", "water"
}
TYPE_FALLBACKS = {
    "shadow": "ghost",
    "unknown": "normal"
}
MOVE_TYPE_ICON_ROOT = "systems/pok-role-module/assets/types"
POKROLE_ATTRIBUTE_KEYS = [
    "strength",
    "dexterity",
    "vitality",
    "special",
    "insight",
    "tough",
    "beauty",
    "cool",
    "cute",
    "clever",
    "allure"
]
POKROLE_SKILL_KEYS = [
    "alert",
    "athletic",
    "brawl",
    "channel",
    "clash",
    "crafts",
    "empathy",
    "etiquette",
    "evasion",
    "intimidate",
    "lore",
    "medicine",
    "nature",
    "perform",
    "science",
    "stealth",
    "throw",
    "weapons"
]
POKEMON_TIER_KEYS = [
    "starter",
    "beginner",
    "amateur",
    "ace",
    "pro",
    "master",
    "champion"
]
MOVE_SECTION_START_PAGE = 346
MOVE_SECTION_END_PAGE = 430
ABILITY_SECTION_START_PAGE = 434
ABILITY_SECTION_END_PAGE = 471
COREBOOK_PDF_CANDIDATES = [
    ROOT / "POKEROLE COREBOOK 2.0.pdf",
    Path(r"C:\Users\Ricch\Downloads\POKEROLE COREBOOK 2.0.pdf")
]
MANUAL_TYPE_MAP = {
    "normal": "normal",
    "bug": "bug",
    "dark": "dark",
    "dragon": "dragon",
    "electric": "electric",
    "fairy": "fairy",
    "fight": "fighting",
    "fighting": "fighting",
    "fire": "fire",
    "flying": "flying",
    "ghost": "ghost",
    "grass": "grass",
    "ground": "ground",
    "ice": "ice",
    "poison": "poison",
    "psychic": "psychic",
    "rock": "rock",
    "steel": "steel",
    "water": "water"
}
MANUAL_MOVE_OVERRIDES = {
    # Ambiguous card extraction in OCR-heavy pages: force canonical values from Corebook cards.
    "bubble": {"page": 421, "type": "water", "power": 2},
    "whirlwind": {"page": 406, "type": "normal", "power": 0},
    "thunder": {"power": 5},
    "acid-armor": {"type": "poison", "power": 0},
    "refresh": {"page": 399, "type": "normal", "power": 0},
    "dragon-dance": {"type": "dragon", "power": 0},
    "incinerate": {"type": "fire", "power": 2},
    "head-charge": {"type": "normal", "power": 5},
    "fusion-flare": {"page": 371, "type": "fire", "power": 4},
    "strength": {"page": 403, "type": "normal", "power": 3}
}

_POKEMON_IMAGE_STEMS = None

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


def move_type_icon_path(type_key):
    normalized = type_key if type_key in VALID_TYPE_KEYS else "none"
    return f"{MOVE_TYPE_ICON_ROOT}/{normalized}.svg"


def load_pokemon_image_stems():
    if not POKEMON_IMAGE_DIR.exists():
        return set()
    return {
        image_path.stem.lower()
        for image_path in POKEMON_IMAGE_DIR.glob("*.png")
    }


def pokemon_image_path(*candidates):
    global _POKEMON_IMAGE_STEMS
    if _POKEMON_IMAGE_STEMS is None:
        _POKEMON_IMAGE_STEMS = load_pokemon_image_stems()

    if not _POKEMON_IMAGE_STEMS:
        return None

    expanded = []
    for candidate in candidates:
        if not candidate:
            continue
        normalized = slugify(str(candidate))
        if not normalized:
            continue
        expanded.append(normalized)
        expanded.append(normalized.replace("-form", ""))
        if normalized.endswith("-alola"):
            expanded.append(normalized.replace("-alola", "-alolan-form"))
        if normalized.endswith("-galar"):
            expanded.append(normalized.replace("-galar", "-galarian-form"))
        if normalized.endswith("-mega"):
            expanded.append(normalized.replace("-mega", "-mega-form"))
        if normalized.endswith("-primal"):
            expanded.append(normalized.replace("-primal", "-primal-form"))

    for stem in expanded:
        if stem in _POKEMON_IMAGE_STEMS:
            return f"{POKEMON_IMAGE_ROOT}/{stem}.png"

    return None


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


def scale_actor_attribute(base_stat):
    if base_stat <= 0:
        return 1
    return clamp(round(base_stat / 21), 1, 12)


def scale_actor_skill(attribute_value):
    return clamp(round((attribute_value - 1) / 2), 0, 5)


def format_meters_from_decimeters(value):
    meters = (value or 0) / 10
    if float(meters).is_integer():
        return f"{int(meters)} m"
    return f"{meters:.1f} m"


def format_kilograms_from_hectograms(value):
    kilograms = (value or 0) / 10
    if float(kilograms).is_integer():
        return f"{int(kilograms)} kg"
    return f"{kilograms:.1f} kg"


def scale_power(raw_power):
    if raw_power <= 0:
        return 0
    mapped = round(raw_power / 20)
    return clamp(mapped, 1, 7)


def empty_rank_learnset():
    return {key: "" for key in POKEMON_TIER_KEYS}


def write_module(path, const_name, payload):
    serialized = json.dumps(payload, indent=2, ensure_ascii=True)
    path.write_text(f"export const {const_name} = Object.freeze({serialized});\n", encoding="utf-8")


def clean_text(value):
    text = re.sub(r"\s+", " ", f"{value or ''}").strip()
    return text


def normalize_for_search(value):
    text = (value or "").lower()
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return f" {text} " if text else " "


def normalize_token(value):
    return normalize_for_search(value).strip()


def parse_manual_type(value):
    token = normalize_token(value)
    if not token:
        return None
    token = token.split(" ")[0]
    return MANUAL_TYPE_MAP.get(token)


def parse_manual_power_token(token):
    token = (token or "").strip()
    if not token:
        return None
    if token == "-":
        return 0
    if token == "*":
        return -1
    token = token.replace("*", "")
    return int(token) if token.isdigit() else None


def load_move_page_cache():
    pdf_path = find_corebook_pdf_path()
    if not pdf_path:
        return {}

    reader = PdfReader(str(pdf_path))
    cache = {}
    for page in range(MOVE_SECTION_START_PAGE, MOVE_SECTION_END_PAGE + 1):
        raw_text = reader.pages[page - 1].extract_text() or ""
        raw_lines = [line for line in raw_text.splitlines() if line.strip()]
        norm_lines = [normalize_token(line) for line in raw_lines]
        cache[page] = {
            "raw_lines": raw_lines,
            "norm_lines": norm_lines,
            "norm_text": f" {normalize_token(raw_text)} "
        }
    return cache


def find_move_anchor_indices(name, page_data):
    needle = normalize_token(name)
    indices = []
    power_suffix_re = re.compile(r"^(-|\d+\*?|\*)($|\b)")
    for index, line in enumerate(page_data["norm_lines"]):
        if line == needle:
            indices.append(index)
            continue
        if not line.startswith(f"{needle} "):
            continue
        suffix = line[len(needle):].strip()
        if power_suffix_re.match(suffix):
            indices.append(index)
    return indices


def score_move_anchor(page_data, index, name):
    norm_lines = page_data["norm_lines"]
    raw_lines = page_data["raw_lines"]
    start = max(0, index - 10)
    end = min(len(norm_lines), index + 18)
    window = " ".join(norm_lines[start:end])
    raw_line = raw_lines[index]

    score = 0
    if "power" in window:
        score += 4
    if "type" in window:
        score += 3
    if "accuracy" in window:
        score += 2
    if "damage pool" in window:
        score += 2
    if "added effect" in window:
        score += 1

    if re.search(rf"{re.escape(name)}\s+(-|\d+\*?)\s*$", raw_line, flags=re.IGNORECASE):
        score += 4
    return score


def is_move_header_candidate(page_data, index, name):
    line = page_data["norm_lines"][index]
    name_norm = normalize_token(name)
    if line != name_norm:
        if not line.startswith(f"{name_norm} "):
            return False
        suffix = line[len(name_norm):].strip()
        if not re.match(r"^(-|\d+\*?|\*)($|\b)", suffix):
            return False

    if not (line == name_norm or line.startswith(f"{name_norm} ")):
        return False

    norm_lines = page_data["norm_lines"]
    context_start = max(0, index - 12)
    context_end = min(len(norm_lines), index + 14)
    context_window = " ".join(norm_lines[context_start:context_end])
    window_before = " ".join(norm_lines[context_start:index + 1])

    raw_line = page_data["raw_lines"][index]
    if re.search(rf"{re.escape(name)}\s+(-|\d+\*?|\*)\s*$", raw_line, flags=re.IGNORECASE):
        return True

    if "power" in context_window and "type" in context_window and (
        "accuracy" in context_window or "damage pool" in context_window
    ):
        return True

    if "power" in window_before and "type" in context_window and (
        "accuracy" in context_window or "damage pool" in context_window
    ):
        return True

    return False


def select_move_anchor(name, page_data):
    indices = find_move_anchor_indices(name, page_data)
    if not indices:
        return None
    candidates = [index for index in indices if is_move_header_candidate(page_data, index, name)]
    if not candidates:
        return None
    candidates.sort(key=lambda idx: score_move_anchor(page_data, idx, name), reverse=True)
    return candidates[0]


def extract_manual_move_type(page_data, anchor_index):
    raw_lines = page_data["raw_lines"]
    start = max(0, anchor_index - 20)
    end = min(len(raw_lines), anchor_index + 30)

    candidates = []
    for i in range(start, end):
        direct = re.search(r"Type\s*:?\s*([A-Za-z]+)", raw_lines[i], flags=re.IGNORECASE)
        if direct:
            mapped = parse_manual_type(direct.group(1))
            if mapped:
                candidates.append((abs(i - anchor_index), 0 if i <= anchor_index else 1, i, mapped))

    norm_lines = page_data["norm_lines"]
    for i in range(start, end):
        if norm_lines[i].startswith("type"):
            for j in range(i + 1, min(end, i + 8)):
                match = re.search(r"([A-Za-z]+)", raw_lines[j])
                if not match:
                    continue
                mapped = parse_manual_type(match.group(1))
                if mapped:
                    candidates.append((abs(j - anchor_index), 0 if j <= anchor_index else 1, j, mapped))

    if not candidates:
        return None

    candidates.sort(key=lambda item: (item[0], item[1], item[2]))
    return candidates[0][3]


def extract_manual_move_power(name, page_data, anchor_index):
    raw_lines = page_data["raw_lines"]
    name_re = re.compile(rf"{re.escape(name)}\s+(-|\d+\*?|\*)\s*$", flags=re.IGNORECASE)

    local_start = max(0, anchor_index - 2)
    local_end = min(len(raw_lines), anchor_index + 3)
    for i in range(local_start, local_end):
        line = raw_lines[i].strip()
        if not line:
            continue
        match = name_re.search(line)
        if match:
            parsed = parse_manual_power_token(match.group(1))
            if parsed is not None:
                return parsed

    search_start = anchor_index
    search_end = min(len(raw_lines), anchor_index + 14)

    for i in range(search_start, search_end):
        line = raw_lines[i].strip()
        pool_match = re.search(r"Damage Pool:\s*[^\n]*?\+\s*(\d+\*?|\*)", line, flags=re.IGNORECASE)
        if pool_match:
            parsed = parse_manual_power_token(pool_match.group(1))
            if parsed is not None:
                return parsed

        no_pool_match = re.search(r"Damage Pool:\s*-", line, flags=re.IGNORECASE)
        if no_pool_match:
            return 0

        if normalize_token(line).startswith("damage pool"):
            trailing_plus = bool(re.search(r"\+\s*$", line))
            for j in range(i + 1, min(search_end, i + 12)):
                follow = raw_lines[j].strip()
                split_pool_match = re.search(r"\+\s*(\d+\*?|\*)", follow)
                if split_pool_match:
                    parsed = parse_manual_power_token(split_pool_match.group(1))
                    if parsed is not None:
                        return parsed
                if trailing_plus:
                    standalone_num = re.match(r"^(\d+\*?|\*)$", follow)
                    if standalone_num:
                        parsed = parse_manual_power_token(standalone_num.group(1))
                        if parsed is not None:
                            return parsed

    for i in range(anchor_index, search_end):
        line = raw_lines[i].strip()
        merged = re.search(r"POWER\s*(-|\d+\*?|\*)", line, flags=re.IGNORECASE)
        if merged:
            parsed = parse_manual_power_token(merged.group(1))
            if parsed is not None:
                return parsed
        if normalize_token(line) == "power":
            for j in range(i + 1, min(search_end, i + 6)):
                token = raw_lines[j].strip()
                if re.search(r"(type|accuracy|damage pool|added effect)", token, flags=re.IGNORECASE):
                    continue
                parsed = parse_manual_power_token(token)
                if parsed is not None:
                    return parsed

    window_norm = " ".join(normalize_token(raw_lines[i]) for i in range(search_start, search_end))
    variable_markers = (
        "move s power",
        "moves power",
        "same as base move",
        "damage pool varies",
        "power varies"
    )
    if any(marker in window_norm for marker in variable_markers):
        return -1

    fallback_start = max(0, anchor_index - 12)
    for i in range(fallback_start, anchor_index):
        line = raw_lines[i].strip()
        pool_match = re.search(r"Damage Pool:\s*[^\n]*?\+\s*(\d+\*?|\*)", line, flags=re.IGNORECASE)
        if pool_match:
            parsed = parse_manual_power_token(pool_match.group(1))
            if parsed is not None:
                return parsed

        if normalize_token(line).startswith("damage pool"):
            trailing_plus = bool(re.search(r"\+\s*$", line))
            for j in range(i + 1, min(anchor_index, i + 12)):
                follow = raw_lines[j].strip()
                split_pool_match = re.search(r"\+\s*(\d+\*?|\*)", follow)
                if split_pool_match:
                    parsed = parse_manual_power_token(split_pool_match.group(1))
                    if parsed is not None:
                        return parsed
                if trailing_plus:
                    standalone_num = re.match(r"^(\d+\*?|\*)$", follow)
                    if standalone_num:
                        parsed = parse_manual_power_token(standalone_num.group(1))
                        if parsed is not None:
                            return parsed

        merged = re.search(r"POWER\s*(-|\d+\*?|\*)", line, flags=re.IGNORECASE)
        if merged:
            parsed = parse_manual_power_token(merged.group(1))
            if parsed is not None:
                return parsed

    return None


def extract_manual_move_fields(name, page, move_page_cache):
    page_data = move_page_cache.get(page)
    if not page_data:
        return None, None
    anchor = select_move_anchor(name, page_data)
    if anchor is None:
        return None, None
    manual_type = extract_manual_move_type(page_data, anchor)
    manual_power = extract_manual_move_power(name, page_data, anchor)
    return manual_type, manual_power


def find_corebook_pdf_path():
    for candidate in COREBOOK_PDF_CANDIDATES:
        if candidate.exists():
            return candidate
    return None


def extract_move_pages(move_name_by_id, move_page_cache=None):
    page_cache = move_page_cache or load_move_page_cache()
    if not page_cache:
        return {}

    page_by_move_id = {}
    for move_id, name in move_name_by_id.items():
        best_page = None
        best_score = -10_000

        # Prefer pages where we can detect a real move-card header anchor.
        for page, page_data in page_cache.items():
            indices = find_move_anchor_indices(name, page_data)
            if not indices:
                continue
            anchor = select_move_anchor(name, page_data)
            if anchor is None:
                continue
            score = score_move_anchor(page_data, anchor, name)
            if score > best_score:
                best_score = score
                best_page = page

        if best_page is not None:
            page_by_move_id[move_id] = best_page

    return page_by_move_id


def extract_ability_pages(ability_name_by_id):
    pdf_path = find_corebook_pdf_path()
    if not pdf_path:
        return {}

    reader = PdfReader(str(pdf_path))
    ability_norm_by_id = {
        ability_id: normalize_for_search(name)
        for ability_id, name in ability_name_by_id.items()
    }
    unresolved_ids = set(ability_name_by_id.keys())
    page_by_ability_id = {}

    for page_index in range(ABILITY_SECTION_START_PAGE - 1, ABILITY_SECTION_END_PAGE):
        page_text = reader.pages[page_index].extract_text() or ""
        page_norm = normalize_for_search(page_text)
        if len(page_norm) <= 2:
            continue

        for ability_id in sorted(unresolved_ids, key=lambda item: len(ability_norm_by_id[item]), reverse=True):
            if ability_norm_by_id[ability_id] in page_norm:
                page_by_ability_id[ability_id] = page_index + 1

        unresolved_ids = {ability_id for ability_id in unresolved_ids if ability_id not in page_by_ability_id}
        if not unresolved_ids:
            break

    return page_by_ability_id


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
    move_page_cache = load_move_page_cache()
    page_by_move_id = extract_move_pages(english_move_name, move_page_cache=move_page_cache)
    manual_type_overrides = 0
    manual_power_overrides = 0
    manual_page_overrides = 0

    entries = []
    for row in sorted(moves, key=lambda item: int(item["id"])):
        generation_id = int(row["generation_id"])
        if generation_id > 8:
            continue

        move_id = int(row["id"])
        identifier = row["identifier"]
        manual_override = MANUAL_MOVE_OVERRIDES.get(identifier, {})
        override_page = manual_override.get("page")
        if move_id not in page_by_move_id and not isinstance(override_page, int):
            continue

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

        page = page_by_move_id.get(move_id)
        if page is None and isinstance(override_page, int):
            page = override_page
            manual_page_overrides += 1
        elif isinstance(override_page, int) and override_page != page:
            page = override_page
            manual_page_overrides += 1

        manual_type, manual_power = extract_manual_move_fields(name, page, move_page_cache)
        if manual_type in VALID_TYPE_KEYS:
            if manual_type != type_key:
                manual_type_overrides += 1
            type_key = manual_type
        if manual_power is not None and manual_power >= 0:
            if manual_power != power:
                manual_power_overrides += 1
            power = manual_power

        override_type = manual_override.get("type")
        if override_type in VALID_TYPE_KEYS and override_type != type_key:
            manual_type_overrides += 1
            type_key = override_type

        override_power = manual_override.get("power")
        if isinstance(override_power, int) and override_power != power:
            manual_power_overrides += 1
            power = override_power

        effect_id = int(row["effect_id"]) if row["effect_id"] else 0
        effect_chance = int(row["effect_chance"]) if row["effect_chance"] else None
        effect_text = resolve_effect_text(short_effect_by_effect_id.get(effect_id, ""), effect_chance)
        page_text = f"Corebook p.{page}"
        if effect_text:
            description = f"{page_text}. {effect_text}"
        else:
            description = f"{page_text}. Move description available in the move section."

        entries.append({
            "name": name,
            "type": "move",
            "img": move_type_icon_path(type_key),
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

    print(
        "Moves manual overrides -> "
        f"page: {manual_page_overrides}, type: {manual_type_overrides}, power: {manual_power_overrides}"
    )
    return entries


def build_abilities():
    abilities = load_csv("abilities.csv")
    ability_names = load_csv("ability_names.csv")
    ability_prose = load_csv("ability_prose.csv")
    ability_flavor_text = load_csv("ability_flavor_text.csv")
    pokemon_abilities = load_csv("pokemon_abilities.csv")

    english_ability_name = {
        int(row["ability_id"]): row["name"]
        for row in ability_names
        if row["local_language_id"] == "9"
    }

    prose_by_ability_id = {
        int(row["ability_id"]): row
        for row in ability_prose
        if row["local_language_id"] == "9"
    }

    flavor_by_ability_id = {}
    for row in ability_flavor_text:
        if row["language_id"] != "9":
            continue
        ability_id = int(row["ability_id"])
        version_group_id = int(row["version_group_id"])
        current = flavor_by_ability_id.get(ability_id)
        if current is None or version_group_id > current["version_group_id"]:
            flavor_by_ability_id[ability_id] = {
                "version_group_id": version_group_id,
                "flavor_text": row["flavor_text"]
            }

    visibility_by_ability_id = {}
    for row in pokemon_abilities:
        ability_id = int(row["ability_id"])
        tracker = visibility_by_ability_id.setdefault(ability_id, {"hidden": False, "shown": False})
        if row["is_hidden"] == "1":
            tracker["hidden"] = True
        else:
            tracker["shown"] = True

    page_by_ability_id = extract_ability_pages(english_ability_name)

    entries = []
    for row in sorted(abilities, key=lambda item: int(item["id"])):
        if row["is_main_series"] != "1":
            continue

        generation_id = int(row["generation_id"])
        if generation_id > 8:
            continue

        ability_id = int(row["id"])
        if ability_id not in page_by_ability_id:
            continue

        identifier = row["identifier"]
        name = english_ability_name.get(ability_id) or format_identifier(identifier)

        prose = prose_by_ability_id.get(ability_id, {})
        short_effect = clean_text(prose.get("short_effect", ""))
        long_effect = clean_text(prose.get("effect", ""))
        effect = short_effect or long_effect or "See corebook ability entry."

        flavor_info = flavor_by_ability_id.get(ability_id)
        flavor_text = clean_text(flavor_info["flavor_text"]) if flavor_info else ""

        page = page_by_ability_id[ability_id]
        description = f"Corebook p.{page}. {flavor_text or effect}"

        visibility = visibility_by_ability_id.get(ability_id, {"hidden": False, "shown": True})
        is_hidden_only = visibility["hidden"] and not visibility["shown"]
        ability_type = "hidden" if is_hidden_only else "passive"
        trigger = "Storyteller Discovery" if is_hidden_only else "Always On / Species Rule"
        frequency = "Conditional" if is_hidden_only else "Persistent"
        target = "Species-specific" if is_hidden_only else "Self / Scene"

        entries.append({
            "name": name,
            "type": "ability",
            "img": "icons/svg/aura.svg",
            "system": {
                "abilityType": ability_type,
                "trigger": trigger,
                "frequency": frequency,
                "target": target,
                "effect": effect,
                "description": description
            },
            "flags": {
                "pok-role-module": {
                    "seedId": f"ability-{slugify(identifier)}"
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

    def build_entry(species_id, pokemon_id, name, seed_suffix, species_identifier, pokemon_identifier):
        primary, secondary = get_types_for_pokemon(pokemon_id)
        bst = bst_by_pokemon.get(pokemon_id, 350)
        rank = rank_from_bst(bst)
        pokemon_img = pokemon_image_path(
            pokemon_identifier,
            species_identifier,
            seed_suffix,
            name
        ) or "icons/svg/book.svg"

        species_row = species_row_by_id.get(species_id)
        habitat_value = ""
        if species_row and species_row.get("habitat_id"):
            habitat_id = int(species_row["habitat_id"])
            habitat_value = habitat_name_en.get(habitat_id) or format_identifier(habitat_identifier_by_id.get(habitat_id, ""))

        return {
            "name": name,
            "type": "pokedex",
            "img": pokemon_img,
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
        species_identifier = row["identifier"]
        pokemon_identifier = pokemon_by_id.get(pokemon_id, {}).get("identifier", "")
        base_name = species_name_en.get(species_id) or format_identifier(species_identifier)
        entries.append(
            build_entry(
                species_id,
                pokemon_id,
                base_name,
                slugify(species_identifier),
                species_identifier,
                pokemon_identifier
            )
        )

    for pokemon_id in sorted(forms):
        row = pokemon_by_id.get(pokemon_id)
        if not row:
            continue
        species_id = int(row["species_id"])
        species_row = species_row_by_id.get(species_id, {})
        species_identifier = species_row.get("identifier", "")
        pokemon_identifier = row["identifier"]
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
        entries.append(
            build_entry(
                species_id,
                pokemon_id,
                form_name,
                slugify(identifier),
                species_identifier,
                pokemon_identifier
            )
        )

    unique_entries = {}
    for entry in entries:
        unique_entries[entry["flags"]["pok-role-module"]["seedId"]] = entry
    return list(unique_entries.values())


def build_pokemon_actors():
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
    stat_values_by_pokemon = {}
    for row in pokemon_stats:
        pokemon_id = int(row["pokemon_id"])
        stat_id = int(row["stat_id"])
        base_stat = int(row["base_stat"])
        bst_by_pokemon[pokemon_id] = bst_by_pokemon.get(pokemon_id, 0) + base_stat
        stat_values_by_pokemon.setdefault(pokemon_id, {})[stat_id] = base_stat

    abilities_by_pokemon = {}
    for row in pokemon_abilities:
        pokemon_id = int(row["pokemon_id"])
        abilities_by_pokemon.setdefault(pokemon_id, []).append((int(row["slot"]), int(row["ability_id"]), row["is_hidden"] == "1"))

    species_rows = [row for row in species if int(row["id"]) <= 890]
    species_rows.sort(key=lambda row: int(row["id"]))
    species_row_by_id = {int(row["id"]): row for row in species_rows}

    def normalize_type_identifier(identifier):
        type_key = TYPE_FALLBACKS.get(identifier, identifier)
        return type_key if type_key in VALID_TYPE_KEYS else "normal"

    def get_types_for_pokemon(pokemon_id):
        rows = sorted(type_rows_by_pokemon.get(pokemon_id, []), key=lambda item: item[0])
        keys = [normalize_type_identifier(type_by_id.get(type_id, "normal")) for _, type_id in rows]
        if not keys:
            return "normal", "none"
        if len(keys) == 1:
            return keys[0], "none"
        return keys[0], keys[1]

    def get_primary_ability_for_pokemon(pokemon_id):
        rows = sorted(abilities_by_pokemon.get(pokemon_id, []), key=lambda item: item[0])
        if not rows:
            return ""
        non_hidden = [row for row in rows if not row[2]]
        _, ability_id, _ = non_hidden[0] if non_hidden else rows[0]
        return ability_name_en.get(ability_id) or format_identifier(ability_identifier_by_id.get(ability_id, ""))

    def get_habitat_for_species(species_id):
        species_row = species_row_by_id.get(species_id)
        if not species_row or not species_row.get("habitat_id"):
            return ""
        habitat_id = int(species_row["habitat_id"])
        return habitat_name_en.get(habitat_id) or format_identifier(habitat_identifier_by_id.get(habitat_id, ""))

    def evolution_time_from_species(species_id):
        species_row = species_row_by_id.get(species_id)
        growth_rate_id = int(species_row.get("growth_rate_id") or 0) if species_row else 0
        if growth_rate_id in {3, 5}:
            return "fast"
        if growth_rate_id in {1, 6}:
            return "slow"
        return "medium"

    def build_entry(species_id, pokemon_id, name, seed_suffix, species_identifier, pokemon_identifier):
        pokemon_row = pokemon_by_id.get(pokemon_id, {})
        stat_values = stat_values_by_pokemon.get(pokemon_id, {})
        pokemon_img = pokemon_image_path(
            pokemon_identifier,
            species_identifier,
            seed_suffix,
            name
        ) or "icons/svg/mystery-man.svg"
        hp_base = int(stat_values.get(1, 50))
        attack_base = int(stat_values.get(2, 50))
        defense_base = int(stat_values.get(3, 50))
        sp_attack_base = int(stat_values.get(4, 50))
        sp_defense_base = int(stat_values.get(5, 50))
        speed_base = int(stat_values.get(6, 50))

        core_attributes = {
            "strength": scale_actor_attribute(attack_base),
            "dexterity": scale_actor_attribute(speed_base),
            "vitality": scale_actor_attribute(hp_base),
            "special": scale_actor_attribute(round((sp_attack_base + sp_defense_base) / 2)),
            "insight": scale_actor_attribute(sp_defense_base)
        }

        attributes = {key: 1 for key in POKROLE_ATTRIBUTE_KEYS}
        attributes.update(core_attributes)

        skills = {key: 1 for key in POKROLE_SKILL_KEYS}
        skills.update({
            "brawl": max(1, scale_actor_skill(core_attributes["strength"])),
            "channel": max(1, scale_actor_skill(core_attributes["special"])),
            "clash": max(1, scale_actor_skill(core_attributes["vitality"])),
            "evasion": max(1, scale_actor_skill(core_attributes["dexterity"])),
            "alert": max(1, scale_actor_skill(core_attributes["insight"])),
            "athletic": max(1, scale_actor_skill(core_attributes["vitality"])),
            "nature": max(1, scale_actor_skill(core_attributes["insight"]))
        })

        hp_max = clamp(5 + core_attributes["vitality"], 6, 24)
        will_max = clamp(1 + round(core_attributes["insight"] / 4), 1, 6)

        primary_type, secondary_type = get_types_for_pokemon(pokemon_id)
        ability = get_primary_ability_for_pokemon(pokemon_id)
        habitat = get_habitat_for_species(species_id)
        bst = bst_by_pokemon.get(pokemon_id, 350)
        tier = rank_from_bst(bst)

        biography = f"Corebook Pokedex import #{species_id:03d}."
        if habitat:
            biography = f"{biography} Habitat: {habitat}."
        if ability:
            biography = f"{biography} Ability: {ability}."

        return {
            "name": name,
            "type": "pokemon",
            "img": pokemon_img,
            "system": {
                "biography": biography,
                "resources": {
                    "hp": {
                        "value": hp_max,
                        "max": hp_max
                    },
                    "will": {
                        "value": will_max,
                        "max": will_max
                    }
                },
                "attributes": attributes,
                "skills": skills,
                "combat": {
                    "actionNumber": 1,
                    "initiative": core_attributes["dexterity"]
                },
                "species": name,
                "ability": ability,
                "nature": "",
                "battleItem": "",
                "accessory": "",
                "size": format_meters_from_decimeters(int(pokemon_row.get("height") or 0)),
                "weight": format_kilograms_from_hectograms(int(pokemon_row.get("weight") or 0)),
                "types": {
                    "primary": primary_type,
                    "secondary": secondary_type
                },
                "tier": tier,
                "evolutionTime": evolution_time_from_species(species_id),
                "confidence": 2,
                "loyalty": 2,
                "happiness": 2,
                "battles": 0,
                "victories": 0,
                "extra": 1,
                "manualCoreBase": core_attributes,
                "sheetSettings": {
                    "trackMax": {
                        "attributes": {key: 12 for key in core_attributes.keys()}
                    }
                },
                "learnsetByRank": empty_rank_learnset(),
                "combatProfile": {
                    "accuracy": core_attributes["dexterity"],
                    "damage": core_attributes["strength"],
                    "evasion": core_attributes["dexterity"],
                    "clash": core_attributes["vitality"]
                }
            },
            "prototypeToken": {
                "name": name,
                "randomImg": False
            },
            "flags": {
                "pok-role-module": {
                    "seedId": f"actor-pokemon-{species_id:03d}-{seed_suffix}"
                }
            }
        }

    entries = []

    for row in species_rows:
        species_id = int(row["id"])
        pokemon_id = default_pokemon_by_species.get(species_id)
        if not pokemon_id:
            continue
        species_identifier = row["identifier"]
        pokemon_identifier = pokemon_by_id.get(pokemon_id, {}).get("identifier", "")
        base_name = species_name_en.get(species_id) or format_identifier(row["identifier"])
        entries.append(
            build_entry(
                species_id,
                pokemon_id,
                base_name,
                slugify(species_identifier),
                species_identifier,
                pokemon_identifier
            )
        )

    for pokemon_id in sorted(forms):
        row = pokemon_by_id.get(pokemon_id)
        if not row:
            continue
        species_id = int(row["species_id"])
        species_row = species_row_by_id.get(species_id, {})
        species_identifier = species_row.get("identifier", "")
        pokemon_identifier = row["identifier"]
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
        entries.append(
            build_entry(
                species_id,
                pokemon_id,
                form_name,
                slugify(identifier),
                species_identifier,
                pokemon_identifier
            )
        )

    unique_entries = {}
    for entry in entries:
        unique_entries[entry["flags"]["pok-role-module"]["seedId"]] = entry
    return list(unique_entries.values())


def main():
    moves = build_moves()
    ability_entries = build_abilities()
    pokedex = build_pokedex()
    pokemon_actor_entries = build_pokemon_actors()
    write_module(OUT_DIR / "move-seeds.mjs", "MOVE_COMPENDIUM_ENTRIES", moves)
    write_module(OUT_DIR / "ability-seeds.mjs", "ABILITY_COMPENDIUM_ENTRIES", ability_entries)
    write_module(OUT_DIR / "pokedex-seeds.mjs", "POKEDEX_COMPENDIUM_ENTRIES", pokedex)
    write_module(
        OUT_DIR / "pokemon-actor-seeds.mjs",
        "POKEMON_ACTOR_COMPENDIUM_ENTRIES",
        pokemon_actor_entries
    )
    print(f"Generated moves: {len(moves)}")
    print(f"Generated abilities: {len(ability_entries)}")
    print(f"Generated pokedex entries: {len(pokedex)}")
    print(f"Generated pokemon actor entries: {len(pokemon_actor_entries)}")


if __name__ == "__main__":
    main()
