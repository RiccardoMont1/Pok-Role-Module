import importlib.util
import csv
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "module" / "seeds" / "generated"
OUT_DIR.mkdir(parents=True, exist_ok=True)
MOVE_SEEDS_PATH = OUT_DIR / "move-seeds.mjs"
MOVE_REPORT_JSON_PATH = OUT_DIR / "move-automation-report.json"
MOVE_REPORT_MD_PATH = OUT_DIR / "move-automation-report.md"
MOVE_REPORT_BACKLOG_CSV_PATH = OUT_DIR / "move-automation-backlog.csv"
MOVE_REPORT_PARTIAL_CSV_PATH = OUT_DIR / "move-automation-partial.csv"
MOVE_REPORT_MANUAL_CSV_PATH = OUT_DIR / "move-automation-manual.csv"
HELPERS_PATH = ROOT / "tools" / "build_compendium_seeds.py"
EXTERNAL_MOVE_JSON_DIR_CANDIDATES = [
    ROOT.parent / "external-references" / "Pokerole-Data" / "v3.0" / "Moves",
]
MOVE_DB_CANDIDATES = [
    ROOT / "tools" / "sources" / "moves.db",
    ROOT / "_upstream" / "foundry-pokerole" / "packs" / "moves.db",
    Path(r"C:\Users\Ricch\Downloads\moves.db"),
]
MOVE_DB_FALLBACK_RELATIVE_PATH = ROOT / "moves.db"

MOVE_TARGET_TO_SECONDARY_TARGET = {
    "foe": "target",
    "random-foe": "target",
    "all-foes": "all-targets",
    "self": "self",
    "ally": "target",
    "all-allies": "all-allies",
    "area": "all-targets",
    "battlefield": "target",
    "foe-battlefield": "target",
    "ally-battlefield": "target",
    "battlefield-area": "all-targets",
}

UPSTREAM_AILMENT_TO_CONDITION = {
    "burn": "burn",
    "burn1": "burn",
    "burn2": "burn2",
    "burn3": "burn3",
    "paralyze": "paralyzed",
    "paralysis": "paralyzed",
    "poison": "poisoned",
    "badlypoison": "badly-poisoned",
    "badlypoisoned": "badly-poisoned",
    "freeze": "frozen",
    "frozen": "frozen",
    "sleep": "sleep",
    "flinch": "flinch",
    "confuse": "confused",
    "confused": "confused",
    "disable": "disabled",
    "disabled": "disabled",
    "infatuate": "infatuated",
    "infatuated": "infatuated",
    "fainted": "fainted",
}

WEATHER_KEY_ALIASES = {
    "sunny": "sunny",
    "sun": "sunny",
    "rain": "rain",
    "sandstorm": "sandstorm",
    "hail": "hail",
    "snowy": "hail",
    "snow": "hail",
    "typhoon": "typhoon",
    "harsh-sunlight": "harsh-sunlight",
    "harsh sunlight": "harsh-sunlight",
    "strong-winds": "strong-winds",
    "strong winds": "strong-winds",
}

TERRAIN_KEY_ALIASES = {
    "electric": "electric",
    "electric terrain": "electric",
    "grassy": "grassy",
    "grassy terrain": "grassy",
    "misty": "misty",
    "misty terrain": "misty",
    "psychic": "psychic",
    "psychic terrain": "psychic",
}

MOVE_PROPERTY_REASON_LABELS = {
    "charge": "charge-move",
    "mustRecharge": "must-recharge",
    "recoil": "recoil",
    "rampage": "rampage",
    "switcherMove": "switcher-move",
    "ignoreDefenses": "ignore-defenses",
    "destroyShield": "destroy-shield",
    "userFaints": "user-faints",
    "alwaysCrit": "always-crit",
    "resistedWithDefense": "special-defense-rule",
    "maneuver": "maneuver-rule",
}

CHARGE_MOVE_SPECIAL_CASE_SEED_IDS = set()
TERRAIN_SETTING_MOVE_SEED_IDS = {
    "move-electric-terrain",
    "move-grassy-terrain",
    "move-misty-terrain",
    "move-psychic-terrain",
    "move-max-lightning",
    "move-max-mindstorm",
    "move-max-overgrowth",
    "move-max-starfall",
}
HANDLED_TERRAIN_MOVE_SEED_IDS = {
    "move-court-change",
    "move-defog",
    "move-electric-terrain",
    "move-expanding-force",
    "move-floral-healing",
    "move-grassy-glide",
    "move-grassy-terrain",
    "move-max-lightning",
    "move-max-mindstorm",
    "move-max-overgrowth",
    "move-max-starfall",
    "move-misty-explosion",
    "move-misty-terrain",
    "move-mortal-spin",
    "move-psyblade",
    "move-psychic-terrain",
    "move-rapid-spin",
    "move-rising-voltage",
    "move-steel-roller",
    "move-terrain-pulse",
}
HANDLED_SWITCHER_MOVE_SEED_IDS = {
    "move-ally-switch",
    "move-baton-pass",
    "move-chilly-reception",
    "move-circle-throw",
    "move-dragon-tail",
    "move-flip-turn",
    "move-parting-shot",
    "move-roar",
    "move-shed-tail",
    "move-substitute",
    "move-teleport",
    "move-u-turn",
    "move-volt-switch",
    "move-whirlwind",
}
HANDLED_DELAYED_MOVE_SEED_IDS = {
    "move-doom-desire",
    "move-fire-pledge",
    "move-future-sight",
    "move-grudge",
    "move-malignant-chain",
    "move-sappy-seed",
    "move-wish",
    "move-yawn",
}
HANDLED_EXTERNAL_RULE_MOVE_SEED_IDS = {
    "move-bide",
    "move-clash",
    "move-evasion",
    "move-fling",
    "move-hidden-power",
    "move-judgment",
    "move-shed-tail",
    "move-snatch",
    "move-substitute",
}
HANDLED_DYNAMIC_POWER_MOVE_SEED_IDS = {
    "move-fickle-beam",
    "move-judgment",
    "move-magnitude",
}
HANDLED_DYNAMIC_TYPE_MOVE_SEED_IDS = {
    "move-hidden-power",
    "move-judgment",
}
HANDLED_USER_FAINTS_MOVE_SEED_IDS = {
    "move-destiny-bond",
    "move-healing-wish",
    "move-lunar-dance",
    "move-grudge",
    "move-memento",
}
HANDLED_COPY_MOVE_SEED_IDS = {
    "move-copycat",
    "move-instruct",
    "move-ivy-cudgel",
    "move-me-first",
    "move-mimic",
    "move-mirror-move",
    "move-raging-bull",
    "move-sketch",
}
HANDLED_DESTROY_SHIELD_MOVE_SEED_IDS = {
    "move-brick-break",
    "move-defog",
    "move-psychic-fangs",
}
HANDLED_STORED_DAMAGE_MOVE_SEED_IDS = {
    "move-bide",
}

SPECIAL_MOVE_EFFECT_OVERRIDES = {
    "move-electro-shot": [
        {
            "section": 0,
            "label": "",
            "trigger": "on-hit",
            "chance": 0,
            "target": "self",
            "effectType": "stat",
            "condition": "none",
            "weather": "none",
            "terrain": "none",
            "stat": "special",
            "amount": 1,
            "healType": "basic",
            "healMode": "fixed",
            "conditional": False,
            "activationCondition": "",
            "notes": "",
        }
    ],
    "move-geomancy": [
        {
            "section": 0,
            "label": "",
            "trigger": "on-hit",
            "chance": 0,
            "target": "self",
            "effectType": "stat",
            "condition": "none",
            "weather": "none",
            "terrain": "none",
            "stat": "dexterity",
            "amount": 2,
            "healType": "basic",
            "healMode": "fixed",
            "conditional": False,
            "activationCondition": "",
            "notes": "",
        },
        {
            "section": 0,
            "label": "",
            "trigger": "on-hit",
            "chance": 0,
            "target": "self",
            "effectType": "stat",
            "condition": "none",
            "weather": "none",
            "terrain": "none",
            "stat": "special",
            "amount": 2,
            "healType": "basic",
            "healMode": "fixed",
            "conditional": False,
            "activationCondition": "",
            "notes": "",
        },
        {
            "section": 0,
            "label": "",
            "trigger": "on-hit",
            "chance": 0,
            "target": "self",
            "effectType": "stat",
            "condition": "none",
            "weather": "none",
            "terrain": "none",
            "stat": "specialDefense",
            "amount": 2,
            "healType": "basic",
            "healMode": "fixed",
            "conditional": False,
            "activationCondition": "",
            "notes": "",
        },
    ],
    "move-sky-drop": [
        {
            "section": 0,
            "label": "",
            "trigger": "on-hit-damage",
            "chance": 0,
            "target": "target",
            "effectType": "condition",
            "condition": "flinch",
            "weather": "none",
            "terrain": "none",
            "stat": "none",
            "amount": 0,
            "healType": "basic",
            "healMode": "fixed",
            "conditional": False,
            "activationCondition": "",
            "notes": "",
        }
    ],
}

MANUAL_REASON_KEYS = {
    "suggested-effects",
    "external-rule-reference",
    "copied-move-dependent",
    "dynamic-power-formula",
    "dynamic-type",
    "manual-terrain-resolution",
    "delayed-effect",
    "stored-damage-formula",
}


def load_helper_module():
    spec = importlib.util.spec_from_file_location("build_compendium_seeds", HELPERS_PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


HELPERS = load_helper_module()


def find_moves_db_path():
    for candidate in EXTERNAL_MOVE_JSON_DIR_CANDIDATES:
        if candidate.is_dir() and any(candidate.glob("*.json")):
            return candidate
    for candidate in [*MOVE_DB_CANDIDATES, MOVE_DB_FALLBACK_RELATIVE_PATH]:
        if candidate.exists():
            return candidate
    return None


def load_move_rows(db_path):
    if db_path.is_dir():
        return load_external_move_rows(db_path)

    rows = []
    with db_path.open("r", encoding="utf-8") as handle:
        for line_number, raw_line in enumerate(handle, 1):
            line = raw_line.strip()
            if not line:
                continue
            try:
                rows.append(json.loads(line))
            except json.JSONDecodeError as error:
                raise ValueError(f"Invalid JSON in {db_path} on line {line_number}: {error}") from error
    return rows


def split_dual_field(value):
    parts = [clean_text(part) for part in str(value or "").split("/")]
    parts = [part for part in parts if part]
    if not parts:
        return "", ""
    if len(parts) == 1:
        return parts[0], ""
    return parts[0], parts[1]


def normalize_external_attributes(raw_attributes, raw_category="", effect_text=""):
    attributes = raw_attributes if isinstance(raw_attributes, dict) else {}
    normalized = {}

    def raw_bool(key):
        return bool(attributes.get(key, False))

    normalized["accuracyReduction"] = abs(parse_number(attributes.get("AccuracyReduction"), 0))
    normalized["reactionMove"] = parse_number(attributes.get("Reaction"), 0)
    normalized["lateReactionMove"] = parse_number(attributes.get("LateReaction"), 0)
    if not normalized["reactionMove"] and attributes.get("Priority") is not None:
        normalized["reactionMove"] = parse_number(attributes.get("Priority"), 0)

    raw_switcher_move = attributes.get("SwitcherMove")
    if isinstance(raw_switcher_move, str):
        switcher_value = slugify(raw_switcher_move) or True
    elif raw_switcher_move:
        switcher_value = "foe" if attributes.get("SwitcherMoveForFoe") else "user"
    elif attributes.get("SwitcherMoveForFoe"):
        switcher_value = "foe"
    else:
        switcher_value = False

    normalized["highCritical"] = raw_bool("HighCritical")
    normalized["neverFail"] = raw_bool("NeverMiss")
    normalized["shieldMove"] = raw_bool("ShieldMove")
    normalized["charge"] = raw_bool("Charge")
    normalized["mustRecharge"] = raw_bool("MustRecharge")
    normalized["rampage"] = raw_bool("Rampage")
    normalized["recoil"] = raw_bool("Recoil")
    normalized["switcherMove"] = switcher_value
    normalized["ignoreDefenses"] = raw_bool("IgnoreDefenses")
    normalized["destroyShield"] = raw_bool("DestroyShield")
    normalized["userFaints"] = raw_bool("UserFaints")
    normalized["alwaysCrit"] = raw_bool("AlwaysCrit")
    normalized["resistedWithDefense"] = raw_bool("ResistedWithDefense")
    normalized["physicalRanged"] = raw_bool("PhysicalRanged") or (
        normalize_move_category(raw_category) == "physical"
        and (raw_bool("Ranged") or raw_bool("ProjectileMove"))
    )
    normalized["soundBased"] = raw_bool("SoundMove")
    normalized["biteMove"] = raw_bool("BiteMove")
    normalized["cutterMove"] = raw_bool("CutterMove")
    normalized["fistBased"] = raw_bool("FistMove")
    normalized["powderMove"] = raw_bool("PowderMove")
    normalized["windMove"] = raw_bool("WindMove")
    normalized["projectileMove"] = raw_bool("ProjectileMove")
    normalized["ignoreShield"] = raw_bool("IgnoreShield")
    normalized["forceField"] = raw_bool("ForceField")
    normalized["blockDamagePool"] = parse_number(attributes.get("BlockDamagePool"), 0)
    normalized["entryHazard"] = raw_bool("EntryHazard")
    normalized["ongoingDamage"] = raw_bool("OngoingDamage")
    normalized["resetTerrain"] = raw_bool("ResetTerrain")
    normalized["copyMove"] = raw_bool("CopyMove")
    normalized["doubleAction"] = raw_bool("DoubleAction")
    normalized["tripleAction"] = raw_bool("TripleAction")
    normalized["successiveActions"] = raw_bool("SuccessiveActions")
    normalized["unique"] = raw_bool("Unique")
    normalized["zMove"] = raw_bool("ZMove")
    normalized["maxMove"] = raw_bool("MaxMove")
    normalized["lethal"] = raw_bool("Lethal")
    normalized["duration"] = parse_number(attributes.get("Duration"), 0)
    normalized["vulnerable"] = clean_text(attributes.get("Vulnerable"))
    normalized["abilityChange"] = clean_text(attributes.get("AbilityChange"))
    normalized["blocks"] = clean_text(attributes.get("Blocks"))
    normalized["hurtBonus"] = parse_number(attributes.get("HurtBonus"), 0)
    normalized["hurtPenalty"] = parse_number(attributes.get("HurtPenalty"), 0)
    normalized["hateBonus"] = parse_number(attributes.get("HateBonus"), 0)

    effect_text_lower = clean_text(effect_text).lower()
    if not normalized["highCritical"] and "high critical" in effect_text_lower:
        normalized["highCritical"] = True
    if not normalized["neverFail"] and ("never miss" in effect_text_lower or "never fails" in effect_text_lower):
        normalized["neverFail"] = True
    if not normalized["shieldMove"] and "shield move" in effect_text_lower:
        normalized["shieldMove"] = True

    return {key: value for key, value in normalized.items() if value not in {"", None, False}}


def normalize_external_effect_groups(added_effects):
    if not isinstance(added_effects, dict):
        return []

    groups = []

    def build_condition_group(chance_dice):
        chance_value = max(parse_number(chance_dice, 0), 0)
        if chance_value > 0:
            return {"type": "chanceDice", "amount": chance_value}
        return {"type": "none"}

    for stat_change in added_effects.get("StatChanges", []) or []:
        if not isinstance(stat_change, dict):
            continue
        stats = [
            clean_text(stat)
            for stat in stat_change.get("Stats", []) or []
            if clean_text(stat)
        ]
        effects = []
        for stat in stats:
            effects.append({
                "type": "statChange",
                "affects": slugify(stat_change.get("Affects", "targets")) or "targets",
                "stat": stat,
                "amount": parse_number(stat_change.get("Stages"), 0),
            })
        if effects:
            groups.append({
                "condition": build_condition_group(stat_change.get("ChanceDice")),
                "effects": effects,
            })

    for ailment in added_effects.get("Ailments", []) or []:
        if not isinstance(ailment, dict):
            continue
        ailment_type = clean_text(ailment.get("Type"))
        if normalize_upstream_condition(ailment_type) == "none":
            continue
        groups.append({
            "condition": build_condition_group(ailment.get("ChanceDice")),
            "effects": [{
                "type": "ailment",
                "affects": slugify(ailment.get("Affects", "targets")) or "targets",
                "ailment": ailment_type,
                "amount": 0,
            }],
        })

    return groups


def normalize_external_heal(added_effects):
    if not isinstance(added_effects, dict):
        return {}
    heal = added_effects.get("Heal")
    if not isinstance(heal, dict) or not heal:
        return {}

    normalized = {
        "type": slugify(heal.get("Type", "none")),
        "target": slugify(heal.get("Target", "targets")) or "targets",
        "willPointCost": parse_number(heal.get("WillPointCost"), 0),
    }
    if heal.get("Percentage") is not None:
        normalized["amount"] = heal.get("Percentage")
    return normalized


def normalize_external_ailment_heal(added_effects):
    if not isinstance(added_effects, dict):
        return []

    normalized = []
    for raw_entry in added_effects.get("AilmentHeal", []) or []:
        entry_text = clean_text(raw_entry)
        if not entry_text:
            continue
        if entry_text.lower() == "all":
            if "all" not in normalized:
                normalized.append("all")
            continue
        condition_key = normalize_upstream_condition(entry_text)
        if condition_key == "none":
            continue
        if condition_key not in normalized:
            normalized.append(condition_key)
    return normalized


def normalize_external_move_row(move_data):
    if not isinstance(move_data, dict):
        return None

    accuracy_attr_1, accuracy_attr_2 = split_dual_field(move_data.get("Accuracy1"))
    accuracy_skill_1, accuracy_skill_2 = split_dual_field(move_data.get("Accuracy2"))

    system = {
        "type": clean_text(move_data.get("Type")),
        "power": move_data.get("Power"),
        "dmgMod1": clean_text(move_data.get("Damage1")),
        "dmgMod1var": clean_text(move_data.get("Damage2")),
        "accAttr1": accuracy_attr_1,
        "accAttr1var": accuracy_attr_2,
        "accSkill1": accuracy_skill_1,
        "accSkill1var": accuracy_skill_2,
        "target": clean_text(move_data.get("Target")),
        "effect": clean_text(move_data.get("Effect")),
        "description": clean_text(move_data.get("Description")),
        "source": "Pokerole-Data v3.0",
        "category": clean_text(move_data.get("Category")),
        "attributes": normalize_external_attributes(
            move_data.get("Attributes"),
            move_data.get("Category"),
            move_data.get("Effect"),
        ),
        "effectGroups": normalize_external_effect_groups(move_data.get("AddedEffects")),
        "heal": normalize_external_heal(move_data.get("AddedEffects")),
        "ailmentHeal": normalize_external_ailment_heal(move_data.get("AddedEffects")),
    }

    return {
        "name": clean_text(move_data.get("Name")),
        "_id": clean_text(move_data.get("_id")),
        "system": system,
    }


def load_external_move_rows(source_dir):
    rows = []
    for path in sorted(source_dir.glob("*.json"), key=lambda item: item.name.lower()):
        try:
            move_data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as error:
            raise ValueError(f"Invalid JSON in {path}: {error}") from error
        row = normalize_external_move_row(move_data)
        if row:
            rows.append(row)
    return rows


def clean_text(value):
    return HELPERS.clean_text(value)


def slugify(value):
    return HELPERS.slugify(value)


def clamp(value, minimum, maximum):
    return HELPERS.clamp(value, minimum, maximum)


def parse_number(value, fallback=0):
    return HELPERS.parse_number(value, fallback)


def move_type_icon_path(type_key):
    return HELPERS.move_type_icon_path(type_key)


def normalize_name_key(value):
    return HELPERS.normalize_name_key(value)


def normalize_move_type(value):
    return HELPERS.normalize_upstream_move_type(value)


def normalize_move_category(value):
    return HELPERS.normalize_upstream_move_category(value)


def normalize_move_target(value):
    return HELPERS.normalize_upstream_move_target(value)


def normalize_accuracy_attribute(category_key, value):
    return HELPERS.normalize_accuracy_attribute(category_key, value)


def normalize_accuracy_skill(category_key, value):
    return HELPERS.normalize_accuracy_skill(category_key, value)


def normalize_damage_attribute(category_key, value):
    return HELPERS.normalize_damage_attribute(category_key, value)


def normalize_effect_stat(value):
    return HELPERS.normalize_upstream_effect_stat(value)


def parse_priority_from_effect(effect_text):
    return HELPERS.parse_priority_from_effect(effect_text)


def resolve_move_priority(move_system, effect_text="", seed_id=""):
    normalized_seed_id = clean_text(seed_id).lower()
    if normalized_seed_id == "move-grassy-glide":
        return 0
    system = move_system or {}
    attributes = system.get("attributes", {}) or {}
    reaction_priority = parse_number(attributes.get("reactionMove"), 0)
    if reaction_priority:
        return clamp(int(reaction_priority), -99, 99)

    late_reaction_priority = parse_number(attributes.get("lateReactionMove"), 0)
    if late_reaction_priority:
        return clamp(-int(late_reaction_priority), -99, 99)

    return clamp(parse_priority_from_effect(effect_text), -99, 99)


def infer_action_tag(effect_text, attributes):
    return HELPERS.infer_action_tag(effect_text, attributes)


def write_module(path, const_name, payload):
    return HELPERS.write_module(path, const_name, payload)


def make_secondary_target(move_target_key, affects="targets"):
    if affects == "user":
        return "self"
    return MOVE_TARGET_TO_SECONDARY_TARGET.get(move_target_key, "target")


def make_secondary_signature(effect):
    return json.dumps([
        effect.get("section", 0),
        effect.get("trigger", "on-hit"),
        effect.get("chance", 0),
        effect.get("target", "target"),
        effect.get("effectType", "custom"),
        effect.get("condition", "none"),
        effect.get("weather", "none"),
        effect.get("terrain", "none"),
        effect.get("stat", "none"),
        effect.get("amount", 0),
        effect.get("healType", "basic"),
        effect.get("healMode", "fixed"),
        effect.get("conditional", False),
        effect.get("activationCondition", "").strip().lower(),
        effect.get("notes", "").strip().lower(),
    ], ensure_ascii=True)


def dedupe_secondary_effects(effects):
    unique = []
    seen = set()
    for effect in effects:
        signature = make_secondary_signature(effect)
        if signature in seen:
            continue
        seen.add(signature)
        unique.append(effect)
    return unique


def normalize_upstream_condition(value):
    normalized = re.sub(r"[^a-z0-9-]+", "", str(value or "").lower())
    return UPSTREAM_AILMENT_TO_CONDITION.get(normalized, "none")


def build_move_description(move_system):
    description_parts = [
        clean_text(move_system.get("source", "")),
        clean_text(move_system.get("description", "")),
        clean_text(move_system.get("effect", "")),
    ]
    description = " ".join(part for part in description_parts if part)
    return description or "Corebook move entry."


def infer_duration_config(effect_text):
    lower_effect = (effect_text or "").lower()
    round_match = re.search(r"duration\s+(\d+)\s+round", lower_effect)
    if round_match:
        return {"durationType": "time-rounds", "durationValue": int(round_match.group(1))}
    turn_match = re.search(r"duration\s+(\d+)\s+turn", lower_effect)
    if turn_match:
        return {"durationType": "time-turns", "durationValue": int(turn_match.group(1))}
    if "whole scene duration" in lower_effect or "for the rest of the scene" in lower_effect:
        return {"durationType": "manual", "durationValue": 1}
    return {"durationType": "instant", "durationValue": 1}


def infer_will_cost(move_system, effect_text):
    heal = move_system.get("heal", {}) or {}
    will_cost = parse_number(heal.get("willPointCost"), None)
    if will_cost is not None:
        return clamp(int(will_cost), 0, 99)
    match = re.search(r"spend\s+(\d+)\s+will\s+point", str(effect_text or ""), flags=re.IGNORECASE)
    if match:
        return clamp(int(match.group(1)), 0, 99)
    return 0


def resolve_damage_attribute_formula_key(category_key, damage_key):
    normalized = str(damage_key or "").strip().lower()
    if normalized in {"strength", "dexterity", "vitality", "special", "insight"}:
        return normalized
    if normalized == "auto":
        return "special" if category_key == "special" else "strength"
    return ""


def build_move_formula_config(move_system, category_key, effect_text="", description_text=""):
    combined_text = f"{clean_text(effect_text)} {clean_text(description_text)}".lower()
    acc_attr_1 = normalize_accuracy_attribute(category_key, move_system.get("accAttr1"))
    acc_skill_1 = normalize_accuracy_skill(category_key, move_system.get("accSkill1"))
    acc_attr_2 = clean_text(move_system.get("accAttr1var", ""))
    acc_skill_2 = clean_text(move_system.get("accSkill1var", ""))
    dmg_attr_1 = resolve_damage_attribute_formula_key(
        category_key,
        normalize_damage_attribute(category_key, move_system.get("dmgMod1")),
    )
    dmg_attr_2 = resolve_damage_attribute_formula_key(
        category_key,
        normalize_damage_attribute(category_key, move_system.get("dmgMod1var")),
    )

    accuracy_formula = ""
    damage_base_formula = ""
    power_formula = ""

    if "if the user's strength score is higher than their special" in combined_text:
        accuracy_formula = (
            f"if(gt(source.strength, source.special), source.{acc_attr_2 or 'strength'} + "
            f"source.{normalize_accuracy_skill(category_key, acc_skill_2 or 'brawl')}, "
            f"source.{acc_attr_1} + source.{acc_skill_1})"
        )
        damage_base_formula = (
            f"if(gt(source.strength, source.special), source.{dmg_attr_2 or 'strength'}, "
            f"source.{dmg_attr_1 or 'special'})"
        )
    else:
        resolved_acc_attr_2 = normalize_accuracy_attribute(category_key, acc_attr_2) if acc_attr_2 else acc_attr_1
        resolved_acc_skill_2 = normalize_accuracy_skill(category_key, acc_skill_2) if acc_skill_2 else acc_skill_1
        combo_1 = f"source.{acc_attr_1} + source.{acc_skill_1}"
        combo_2 = f"source.{resolved_acc_attr_2} + source.{resolved_acc_skill_2}"
        if combo_1 != combo_2 and (acc_attr_2 or acc_skill_2):
            accuracy_formula = f"max({combo_1}, {combo_2})"

        if dmg_attr_1 and dmg_attr_2 and dmg_attr_1 != dmg_attr_2:
            damage_base_formula = f"max(source.{dmg_attr_1}, source.{dmg_attr_2})"

    raw_power = clean_text(move_system.get("power", ""))
    normalized_power = raw_power.lower()
    if normalized_power == "happiness + loyalty":
        power_formula = "source.happiness + source.loyalty"
    elif clean_text(move_system.get("dmgMod1var", "")).lower() == "happiness":
        power_formula = "move.power + min(source.happiness, 5)"
    elif clean_text(move_system.get("dmgMod1var", "")).lower() == "missing happiness":
        power_formula = "move.power + min(max(5 - source.happiness, 0), 5)"
    elif re.search(r"last damage pool rolled against the user plus 2", combined_text):
        damage_base_formula = "source.lastDamagePoolTaken + 2"
    elif re.search(r"according to the user's rank", combined_text):
        damage_base_formula = "source.rankDamageDice"
    elif re.search(r"always inflict 1 typeless damage", combined_text):
        damage_base_formula = "1"
    elif re.search(r"difference between the user's current hp and the target's max hp", combined_text):
        damage_base_formula = "min(10, max(target.hpMax - source.hpCurrent, 0))"
    elif re.search(
        r"(damage roll is half of the target's remaining hp|roll [a-z-]+-type damage dice equal to half of the target's remaining hp)",
        combined_text,
    ):
        damage_base_formula = "min(10, floor(target.hpCurrent / 2))"
    elif re.search(r"damage dice equal to the target's total hp", combined_text):
        damage_base_formula = "target.hpMax"
    elif clean_text(move_system.get("dmgMod1", "")).lower() == "target'sremaininghp":
        damage_base_formula = "source.hpCurrent"

    return {
        "accuracyFormula": accuracy_formula,
        "damageBaseFormula": damage_base_formula,
        "powerFormula": power_formula,
    }


def convert_effect_groups(effect_groups, move_target_key):
    converted = []
    if not isinstance(effect_groups, list):
        return converted

    for group in effect_groups:
        if not isinstance(group, dict):
            continue
        condition = group.get("condition", {}) or {}
        condition_type = str(condition.get("type", "none")).strip().lower()
        chance = 0
        if condition_type == "chancedice":
            chance = max(parse_number(condition.get("amount"), 1), 1)

        for effect in group.get("effects", []) or []:
            if not isinstance(effect, dict):
                continue
            effect_type_raw = str(effect.get("type", "custom")).strip().lower()
            effect_type = "custom"
            if effect_type_raw == "ailment":
                effect_type = "condition"
            elif effect_type_raw == "statchange":
                effect_type = "stat"

            converted.append({
                "section": 0,
                "label": "",
                "trigger": "on-hit",
                "chance": chance,
                "target": make_secondary_target(move_target_key, effect.get("affects", "targets")),
                "effectType": effect_type,
                "condition": normalize_upstream_condition(effect.get("ailment")),
                "weather": "none",
                "terrain": "none",
                "stat": normalize_effect_stat(effect.get("stat")),
                "amount": clamp(parse_number(effect.get("amount"), 0), -99, 99),
                "healType": "basic",
                "healMode": "fixed",
                "conditional": False,
                "activationCondition": "",
                "notes": "",
            })
    return converted


def make_heal_effect(target, heal_type="basic", heal_mode="fixed", amount=0, conditional_expression=""):
    is_conditional = bool(conditional_expression.strip())
    effect = {
        "section": 0,
        "label": "",
        "trigger": "on-hit",
        "chance": 0,
        "target": target,
        "effectType": "heal",
        "condition": "none",
        "weather": "none",
        "terrain": "none",
        "stat": "none",
        "amount": amount,
        "healType": heal_type,
        "healMode": heal_mode,
        "conditional": is_conditional,
        "activationCondition": conditional_expression.strip(),
        "notes": "",
    }
    return effect


def build_cleanse_effect(target, ailment_tokens):
    normalized_tokens = []
    for token in ailment_tokens:
        cleaned = clean_text(token).lower()
        if not cleaned:
            continue
        if cleaned == "all":
            normalized_tokens = ["all"]
            break
        normalized_condition = normalize_upstream_condition(cleaned)
        if normalized_condition == "none":
            continue
        if normalized_condition not in normalized_tokens:
            normalized_tokens.append(normalized_condition)
    if not normalized_tokens:
        return None
    return {
        "section": 0,
        "label": "",
        "trigger": "on-hit",
        "chance": 0,
        "target": target,
        "effectType": "cleanse",
        "condition": "none",
        "weather": "none",
        "terrain": "none",
        "stat": "none",
        "amount": 0,
        "healType": "basic",
        "healMode": "fixed",
        "conditional": False,
        "activationCondition": "",
        "notes": "|".join(normalized_tokens),
    }


def split_condition_tokens(expression):
    parts = []
    for raw_part in re.split(r"\s+or\s+", expression, flags=re.IGNORECASE):
        token = raw_part.strip().strip("()")
        if token:
            parts.append(token)
    return parts


def negate_expression(expression):
    negated_parts = []
    for token in split_condition_tokens(expression):
        match = re.match(r"^([a-z0-9._-]+)\s*(==|=|!=)\s*(.+)$", token, flags=re.IGNORECASE)
        if not match:
            continue
        key = match.group(1).strip()
        operator = match.group(2)
        value = match.group(3).strip()
        if operator == "!=":
            negated_parts.append(f"{key}={value}")
        else:
            negated_parts.append(f"{key}!={value}")
    return " and ".join(negated_parts)


def join_conditions_with_or(conditions):
    unique_conditions = []
    seen = set()
    for condition in conditions:
        cleaned = condition.strip()
        if not cleaned or cleaned in seen:
            continue
        seen.add(cleaned)
        unique_conditions.append(cleaned)
    return " or ".join(unique_conditions)


def extract_weather_condition_terms(lower_text):
    conditions = []
    if re.search(r"\bsunny weather\b", lower_text):
        conditions.append("weather=sunny")
        conditions.append("weather=harsh-sunlight")
    if re.search(r"\bharsh sunlight\b", lower_text):
        conditions.append("weather=harsh-sunlight")
    if re.search(r"\brain\b", lower_text):
        conditions.append("weather=rain")
    if re.search(r"\bsandstorm\b", lower_text):
        conditions.append("weather=sandstorm")
    if re.search(r"\bhail\b", lower_text) or re.search(r"\bsnowy weather\b", lower_text) or re.search(r"\bsnow weather\b", lower_text):
        conditions.append("weather=hail")
    if re.search(r"\btyphoon\b", lower_text):
        conditions.append("weather=typhoon")
    return conditions


def build_heal_effects(move_name, move_system, move_target_key, report_reasons):
    heal = move_system.get("heal", {}) or {}
    heal_type = slugify(str(heal.get("type", "none")))
    effect_text = clean_text(move_system.get("effect", ""))
    lower_effect = effect_text.lower()
    if heal_type == "none":
        if "basic heal" in lower_effect:
            heal_type = "basic"
        elif "complete heal" in lower_effect:
            heal_type = "complete"
        else:
            return []
    target = "self" if move_target_key == "self" else make_secondary_target(move_target_key, heal.get("target", "targets"))

    if heal_type == "leech":
        amount = heal.get("amount", 0.5)
        try:
            numeric_amount = float(amount)
        except (TypeError, ValueError):
            numeric_amount = 0.5
            report_reasons.add("dynamic-heal-formula")
        drain_percent = clamp(round(numeric_amount * 100), 1, 999)
        return [make_heal_effect("self", "basic-numeric", "damage-percent", drain_percent)]

    if heal_type not in {"basic", "complete"}:
        report_reasons.add("unknown-heal-type")
        return []

    base_heal_type = "complete" if heal_type == "complete" else "basic"
    complete_conditions = []
    reduced_conditions = []
    nullified_conditions = []

    sentences = [
        sentence.strip().lower()
        for sentence in re.split(r"(?<=[.!?])\s+", effect_text)
        if sentence.strip()
    ]

    for sentence in sentences:
        if "complete heal" in sentence:
            complete_conditions.extend(extract_weather_condition_terms(sentence))
            if "night time" in sentence or "night " in sentence:
                complete_conditions.append("timeOfDay=night")
            if "grassy terrain" in sentence:
                complete_conditions.append("terrain=grassy")

        if "minor heal" in sentence or "only heals 1 hp" in sentence or "reduced to 1 hp" in sentence:
            reduced_conditions.extend(extract_weather_condition_terms(sentence))
            if "night" in sentence:
                reduced_conditions.append("timeOfDay=night")
            if "indoors" in sentence or "indoor" in sentence:
                reduced_conditions.append("location=indoors")
            if "underground" in sentence:
                reduced_conditions.append("location=underground")

        if "heals 0 hp" in sentence or "reduced to 0 hp" in sentence:
            nullified_conditions.extend(extract_weather_condition_terms(sentence))

    conditional_effects = []
    override_expressions = []

    complete_expression = join_conditions_with_or(complete_conditions)
    if complete_expression:
        conditional_effects.append(make_heal_effect(target, "complete", "fixed", 5, complete_expression))
        override_expressions.append(complete_expression)

    reduced_expression = join_conditions_with_or(reduced_conditions)
    if reduced_expression:
        conditional_effects.append(make_heal_effect(target, "basic-numeric", "fixed", 1, reduced_expression))
        override_expressions.append(reduced_expression)

    nullified_expression = join_conditions_with_or(nullified_conditions)
    if nullified_expression:
        conditional_effects.append(make_heal_effect(target, "basic-numeric", "fixed", 0, nullified_expression))
        override_expressions.append(nullified_expression)

    base_condition = " and ".join(
        part for part in [negate_expression(expression) for expression in override_expressions] if part
    )
    conditional_effects.append(
        make_heal_effect(target, base_heal_type, "fixed", 5 if base_heal_type == "complete" else 3, base_condition)
    )

    if any("terrain=" in expression for expression in override_expressions):
        report_reasons.add("terrain-field-effect")

    if "beginning of the next round" in lower_effect or "beginning of the next round" in lower_effect.replace("rund", "round"):
        report_reasons.add("delayed-effect")

    return dedupe_secondary_effects(conditional_effects)


def build_status_cleanse_effects(move_name, move_system, move_target_key, report_reasons):
    move_seed_id = f"move-{slugify(move_name)}"
    if move_seed_id in {"move-healing-wish"}:
        return []

    ailment_tokens = list(move_system.get("ailmentHeal", []) or [])
    effect_text = clean_text(move_system.get("effect", ""))
    lower_effect = effect_text.lower()
    if not ailment_tokens and re.search(r"(heal|cure).+status ailment", lower_effect):
        ailment_tokens = ["all"]

    if not ailment_tokens:
        return []

    target = make_secondary_target(move_target_key, "targets")
    cleanse_effect = build_cleanse_effect(target, ailment_tokens)
    if not cleanse_effect:
        return []

    report_reasons.discard("status-cleanse")
    return [cleanse_effect]


def parse_weather_key(effect_text):
    normalized = (effect_text or "").lower()
    for raw_key, weather_key in WEATHER_KEY_ALIASES.items():
        if raw_key in normalized and "weather" in normalized:
            return weather_key
    return None


def build_weather_effects(move_system):
    effect_text = clean_text(move_system.get("effect", ""))
    lower_effect = effect_text.lower()
    if "activate" not in lower_effect or "weather" not in lower_effect:
        return []

    weather_key = parse_weather_key(lower_effect)
    if not weather_key:
        return []

    duration_mode = "manual"
    duration_rounds = 1
    round_match = re.search(r"duration\s+(\d+)\s+round", lower_effect)
    if round_match:
        duration_mode = "rounds"
        duration_rounds = clamp(int(round_match.group(1)), 1, 99)

    return [{
        "section": 0,
        "label": "",
        "trigger": "on-hit",
        "chance": 0,
        "target": "self",
        "effectType": "weather",
        "condition": "none",
        "weather": weather_key,
        "terrain": "none",
        "stat": "none",
        "amount": 0,
        "durationMode": duration_mode,
        "durationRounds": duration_rounds,
        "healType": "basic",
        "healMode": "fixed",
        "conditional": False,
        "activationCondition": "",
        "notes": "",
    }]


def parse_terrain_key(effect_text, move_name=""):
    normalized = f"{move_name} {effect_text}".lower()
    for raw_key, terrain_key in TERRAIN_KEY_ALIASES.items():
        if raw_key in normalized and "terrain" in normalized:
            return terrain_key
    return None


def build_terrain_effects(move_name, move_system, report_reasons):
    move_seed_id = f"move-{slugify(move_name)}"
    if move_seed_id not in TERRAIN_SETTING_MOVE_SEED_IDS:
        return []
    effect_text = clean_text(move_system.get("effect", ""))
    lower_effect = effect_text.lower()
    if "terrain" not in lower_effect and "terrain" not in move_name.lower():
        return []

    terrain_key = parse_terrain_key(lower_effect, move_name)
    if not terrain_key:
        return []

    duration_mode = "manual"
    duration_rounds = 1
    round_match = re.search(r"duration\s+(\d+)\s+round", lower_effect)
    if round_match:
        duration_mode = "rounds"
        duration_rounds = clamp(int(round_match.group(1)), 1, 99)

    report_reasons.add("terrain-field-effect")
    if move_seed_id == "move-grassy-terrain":
        report_reasons.add("manual-terrain-resolution")

    return [{
        "section": 0,
        "label": "",
        "trigger": "on-hit",
        "chance": 0,
        "target": "self",
        "effectType": "terrain",
        "condition": "none",
        "weather": "none",
        "terrain": terrain_key,
        "stat": "none",
        "amount": 0,
        "durationMode": duration_mode,
        "durationRounds": duration_rounds,
        "healType": "basic",
        "healMode": "fixed",
        "conditional": False,
        "activationCondition": "",
        "notes": "",
    }]


def infer_automation_reasons(row, target_key, formula_config=None):
    system = row.get("system", {}) or {}
    attributes = system.get("attributes", {}) or {}
    effect_text = clean_text(system.get("effect", ""))
    description_text = clean_text(system.get("description", ""))
    combined_text = f"{effect_text} {description_text}".lower()
    reasons = set()
    formula_config = formula_config or {}
    seed_id = get_move_seed_id(row)

    power_value = system.get("power")
    try:
        float(power_value)
    except (TypeError, ValueError):
        if not clean_text(formula_config.get("powerFormula", "")):
            reasons.add("dynamic-power-formula")

    primary_acc_attr = normalize_accuracy_attribute(normalize_move_category(system.get("category")), system.get("accAttr1"))
    primary_acc_skill = normalize_accuracy_skill(normalize_move_category(system.get("category")), system.get("accSkill1"))
    alt_acc_attr_raw = clean_text(system.get("accAttr1var", ""))
    alt_acc_skill_raw = clean_text(system.get("accSkill1var", ""))
    resolved_alt_acc_attr = (
        normalize_accuracy_attribute(normalize_move_category(system.get("category")), alt_acc_attr_raw)
        if alt_acc_attr_raw else primary_acc_attr
    )
    resolved_alt_acc_skill = (
        normalize_accuracy_skill(normalize_move_category(system.get("category")), alt_acc_skill_raw)
        if alt_acc_skill_raw else primary_acc_skill
    )
    primary_acc_combo = f"{primary_acc_attr}:{primary_acc_skill}"
    alt_acc_combo = f"{resolved_alt_acc_attr}:{resolved_alt_acc_skill}"
    needs_accuracy_formula = (
        bool(alt_acc_attr_raw or alt_acc_skill_raw) and
        primary_acc_combo != alt_acc_combo and
        not clean_text(formula_config.get("accuracyFormula", ""))
    )
    primary_damage_attr = resolve_damage_attribute_formula_key(
        normalize_move_category(system.get("category")),
        normalize_damage_attribute(normalize_move_category(system.get("category")), system.get("dmgMod1"))
    )
    alt_damage_raw = clean_text(system.get("dmgMod1var", ""))
    alt_damage_attr = resolve_damage_attribute_formula_key(
        normalize_move_category(system.get("category")),
        normalize_damage_attribute(normalize_move_category(system.get("category")), alt_damage_raw)
    )
    needs_damage_formula = (
        bool(primary_damage_attr and alt_damage_attr and primary_damage_attr != alt_damage_attr) and
        not clean_text(formula_config.get("damageBaseFormula", ""))
    )
    needs_power_variant_formula = (
        bool(alt_damage_raw and not alt_damage_attr) and
        not clean_text(formula_config.get("powerFormula", "")) and
        not clean_text(formula_config.get("damageBaseFormula", ""))
    )
    if needs_accuracy_formula or needs_damage_formula or needs_power_variant_formula:
        reasons.add("alternative-trait-formula")

    if normalize_move_type(system.get("type")) == "none":
        reasons.add("dynamic-type")

    if normalize_move_category(system.get("category")) == "support" and str(system.get("category", "")).lower() not in {"support", ""}:
        reasons.add("mixed-category")

    for attribute_key, reason_label in MOVE_PROPERTY_REASON_LABELS.items():
        if not attributes.get(attribute_key):
            continue
        if attribute_key == "charge":
            if seed_id in CHARGE_MOVE_SPECIAL_CASE_SEED_IDS:
                reasons.add(reason_label)
            continue
        if attribute_key in {"mustRecharge", "rampage"}:
            continue
        reasons.add(reason_label)

    if "at the end of the round" in combined_text:
        reasons.add("delayed-effect")
    if "suggested effects" in combined_text:
        reasons.add("suggested-effects")
    if re.search(r"\bsee p\.", combined_text):
        reasons.add("external-rule-reference")
    if "beginning of the next round" in combined_text or "dealt at the beginning of the next round" in combined_text or "next rund" in combined_text:
        reasons.add("delayed-effect")
    if "twice the total amount of damage" in combined_text or "equal to twice the total amount of damage" in combined_text:
        reasons.add("stored-damage-formula")
    if "same as the user's secondary type" in combined_text or "same as base move" in combined_text or "copied move" in combined_text:
        reasons.add("copied-move-dependent")
    if "depends upon the terrain" in combined_text or "depending on the terrain" in combined_text:
        reasons.add("manual-terrain-resolution")
    if target_key in {"battlefield", "ally-battlefield", "foe-battlefield"} and "terrain" in combined_text:
        reasons.add("terrain-field-effect")
    if "dynamax" in combined_text or "gigantamax" in combined_text or "max pokemon" in combined_text:
        reasons.add("dynamax-rule")
    if "switch" in combined_text and attributes.get("switcherMove"):
        reasons.add("switcher-move")
    if "remove the user's immunity to ground-type moves" in combined_text:
        reasons.add("temporary-type-immunity-change")
    if "heal any status ailment" in combined_text or "all status ailments and conditions are cured" in combined_text:
        reasons.add("status-cleanse")
    if "type, power and extra added effects are decided by storyteller" in combined_text:
        reasons.add("dynamic-type")
        reasons.add("dynamic-power-formula")
        reasons.add("external-rule-reference")
    if seed_id == "move-hold-hands":
        reasons.add("external-rule-reference")
    if seed_id in {"move-tera-blast", "move-tera-starstorm"}:
        reasons.add("dynamic-type")
        reasons.add("external-rule-reference")
    if clean_text(system.get("dmgMod1", "")).lower() == "target'sremaininghp" and not clean_text(
        formula_config.get("damageBaseFormula", "")
    ):
        reasons.add("dynamic-power-formula")

    if seed_id in HANDLED_TERRAIN_MOVE_SEED_IDS:
        reasons.discard("terrain-field-effect")
        reasons.discard("manual-terrain-resolution")
    if seed_id in HANDLED_SWITCHER_MOVE_SEED_IDS:
        reasons.discard("switcher-move")
    if seed_id in HANDLED_DELAYED_MOVE_SEED_IDS:
        reasons.discard("delayed-effect")
    if seed_id in HANDLED_EXTERNAL_RULE_MOVE_SEED_IDS:
        reasons.discard("external-rule-reference")
    if seed_id in HANDLED_DYNAMIC_POWER_MOVE_SEED_IDS:
        reasons.discard("dynamic-power-formula")
    if seed_id in HANDLED_DYNAMIC_TYPE_MOVE_SEED_IDS:
        reasons.discard("dynamic-type")
    if seed_id in HANDLED_USER_FAINTS_MOVE_SEED_IDS:
        reasons.discard("user-faints")
    if seed_id in HANDLED_COPY_MOVE_SEED_IDS:
        reasons.discard("copied-move-dependent")
    if seed_id in HANDLED_DESTROY_SHIELD_MOVE_SEED_IDS:
        reasons.discard("destroy-shield")
    if seed_id in HANDLED_STORED_DAMAGE_MOVE_SEED_IDS:
        reasons.discard("stored-damage-formula")
    if seed_id in {"move-misty-terrain", "move-max-starfall"}:
        reasons.discard("status-cleanse")
    if attributes.get("alwaysCrit"):
        reasons.discard("always-crit")
    if attributes.get("ignoreDefenses"):
        reasons.discard("ignore-defenses")
    if attributes.get("resistedWithDefense"):
        reasons.discard("special-defense-rule")
    if attributes.get("recoil"):
        reasons.discard("recoil")
    if attributes.get("userFaints") and normalize_move_category(system.get("category")) != "support":
        reasons.discard("user-faints")

    return reasons


def build_flags(system_id, row, automation_status, automation_reasons):
    return {
        system_id: {
            "seedId": f"move-{slugify(row.get('name', 'move'))}",
            "sourceDbId": row.get("_id"),
            "automationStatus": automation_status,
            "automationReasons": sorted(automation_reasons),
            "sourceAttributes": row.get("system", {}).get("attributes", {}) or {},
        }
    }


def get_move_seed_id(row):
    return f"move-{slugify(row.get('name', 'move'))}"


def build_special_move_effects(row):
    return SPECIAL_MOVE_EFFECT_OVERRIDES.get(get_move_seed_id(row), [])


def build_move_entry(row):
    system = row.get("system", {}) or {}
    attributes = system.get("attributes", {}) or {}
    effect_text = clean_text(system.get("effect", ""))
    description = build_move_description(system)

    type_key = normalize_move_type(system.get("type"))
    category_key = normalize_move_category(system.get("category"))
    target_key = normalize_move_target(system.get("target"))
    duration_config = infer_duration_config(effect_text)
    will_cost = infer_will_cost(system, effect_text)
    formula_config = build_move_formula_config(system, category_key, effect_text, description)

    automation_reasons = infer_automation_reasons(row, target_key, formula_config)

    power_value = parse_number(system.get("power"), 0)
    if isinstance(power_value, float):
        power_value = round(power_value)
    if not isinstance(power_value, int):
        power_value = 0
    power_value = max(power_value, 0)

    secondary_effects = []
    secondary_effects.extend(convert_effect_groups(system.get("effectGroups", []), target_key))
    secondary_effects.extend(build_special_move_effects(row))
    secondary_effects.extend(build_heal_effects(row.get("name", ""), system, target_key, automation_reasons))
    secondary_effects.extend(build_status_cleanse_effects(row.get("name", ""), system, target_key, automation_reasons))
    secondary_effects.extend(build_weather_effects(system))
    secondary_effects.extend(build_terrain_effects(row.get("name", ""), system, automation_reasons))
    secondary_effects = dedupe_secondary_effects(secondary_effects)

    seed_id = get_move_seed_id(row)
    if seed_id in HANDLED_TERRAIN_MOVE_SEED_IDS:
        automation_reasons.discard("terrain-field-effect")
        automation_reasons.discard("manual-terrain-resolution")
    if seed_id in HANDLED_SWITCHER_MOVE_SEED_IDS:
        automation_reasons.discard("switcher-move")
    if seed_id in HANDLED_DELAYED_MOVE_SEED_IDS:
        automation_reasons.discard("delayed-effect")
    if seed_id in HANDLED_EXTERNAL_RULE_MOVE_SEED_IDS:
        automation_reasons.discard("external-rule-reference")
    if seed_id in HANDLED_DYNAMIC_POWER_MOVE_SEED_IDS:
        automation_reasons.discard("dynamic-power-formula")
    if seed_id in HANDLED_DYNAMIC_TYPE_MOVE_SEED_IDS:
        automation_reasons.discard("dynamic-type")
    if seed_id in HANDLED_USER_FAINTS_MOVE_SEED_IDS:
        automation_reasons.discard("user-faints")
    if seed_id in HANDLED_COPY_MOVE_SEED_IDS:
        automation_reasons.discard("copied-move-dependent")
    if seed_id in HANDLED_DESTROY_SHIELD_MOVE_SEED_IDS:
        automation_reasons.discard("destroy-shield")
    if seed_id == "move-roost":
        automation_reasons.discard("temporary-type-immunity-change")
    if seed_id in {"move-misty-terrain", "move-max-starfall"}:
        automation_reasons.discard("status-cleanse")
    if any(effect.get("effectType") == "cleanse" for effect in secondary_effects):
        automation_reasons.discard("status-cleanse")

    has_primary_damage_definition = (
        power_value > 0 or
        bool(clean_text(formula_config.get("powerFormula", ""))) or
        bool(clean_text(formula_config.get("damageBaseFormula", "")))
    )
    primary_mode = "damage"
    if category_key == "support" and not has_primary_damage_definition:
        primary_mode = "effect-only"
    if not secondary_effects and category_key == "support" and not has_primary_damage_definition:
        primary_mode = "effect-only"

    automation_status = "full"
    if automation_reasons & MANUAL_REASON_KEYS:
        automation_status = "manual"
    elif automation_reasons:
        automation_status = "partial"

    entry = {
        "name": clean_text(row.get("name", "")) or "Move",
        "type": "move",
        "img": move_type_icon_path(type_key),
        "system": {
            "type": type_key,
            "category": category_key,
            "target": target_key,
            "actionTag": infer_action_tag(effect_text, attributes),
            "accuracyAttribute": normalize_accuracy_attribute(category_key, system.get("accAttr1")),
            "accuracySkill": normalize_accuracy_skill(category_key, system.get("accSkill1")),
            "accuracyFormula": formula_config["accuracyFormula"],
            "primaryMode": primary_mode,
            "power": power_value,
            "powerFormula": formula_config["powerFormula"],
            "reducedAccuracy": clamp(parse_number(attributes.get("accuracyReduction"), 0), 0, 6),
            "accuracyDiceModifier": 0,
            "accuracyFlatModifier": 0,
            "damageAttribute": normalize_damage_attribute(category_key, system.get("dmgMod1")),
            "damageBaseFormula": formula_config["damageBaseFormula"],
            "willCost": will_cost,
            "durationType": duration_config["durationType"],
            "durationValue": duration_config["durationValue"],
            "priority": resolve_move_priority(system, effect_text, get_move_seed_id(row)),
            "highCritical": bool(attributes.get("highCritical", False)),
            "neverFail": bool(attributes.get("neverFail", False)),
            "lethal": False,
            "shieldMove": bool(attributes.get("shieldMove", False)),
            "isUsable": True,
            "secondaryEffects": secondary_effects,
            "description": description,
        },
        "flags": build_flags(HELPERS.SYSTEM_ID, row, automation_status, automation_reasons),
    }

    return entry, {
        "name": entry["name"],
        "seedId": entry["flags"][HELPERS.SYSTEM_ID]["seedId"],
        "status": automation_status,
        "reasons": sorted(automation_reasons),
        "type": type_key,
        "category": category_key,
        "target": target_key,
        "secondaryEffects": len(secondary_effects),
    }


def write_report(report_rows, db_path):
    totals = Counter(row["status"] for row in report_rows)
    reason_counter = Counter()
    grouped = defaultdict(list)
    for row in report_rows:
        for reason in row["reasons"]:
            reason_counter[reason] += 1
        grouped[row["status"]].append(row)

    payload = {
        "source": str(db_path),
        "totalMoves": len(report_rows),
        "statusTotals": dict(totals),
        "reasonTotals": dict(reason_counter),
        "moves": report_rows,
    }
    MOVE_REPORT_JSON_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=True), encoding="utf-8")

    lines = [
        "# Move Automation Report",
        "",
        f"Source: `{db_path}`",
        "",
        f"Total moves: **{len(report_rows)}**",
        "",
        "## Status Totals",
        "",
    ]
    for status in ("full", "partial", "manual"):
        lines.append(f"- `{status}`: {totals.get(status, 0)}")
    lines.extend(["", "## Reason Totals", ""])
    for reason, count in sorted(reason_counter.items(), key=lambda item: (-item[1], item[0])):
        lines.append(f"- `{reason}`: {count}")

    for status in ("manual", "partial"):
        lines.extend(["", f"## {status.title()} Moves", ""])
        for row in sorted(grouped.get(status, []), key=lambda item: item["name"].lower()):
            reason_text = ", ".join(row["reasons"]) if row["reasons"] else "none"
            lines.append(f"- **{row['name']}**: {reason_text}")

    MOVE_REPORT_MD_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")

    csv_rows = []
    for row in report_rows:
        csv_rows.append({
            "name": row["name"],
            "seedId": row["seedId"],
            "status": row["status"],
            "reasons": ", ".join(row["reasons"]),
            "reasonsCount": len(row["reasons"]),
            "type": row["type"],
            "category": row["category"],
            "target": row["target"],
            "secondaryEffects": row["secondaryEffects"],
        })

    fieldnames = [
        "name",
        "seedId",
        "status",
        "reasons",
        "reasonsCount",
        "type",
        "category",
        "target",
        "secondaryEffects",
    ]

    def write_csv(path, rows):
        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)

    backlog_rows = [row for row in csv_rows if row["status"] in {"partial", "manual"}]
    partial_rows = [row for row in csv_rows if row["status"] == "partial"]
    manual_rows = [row for row in csv_rows if row["status"] == "manual"]

    write_csv(MOVE_REPORT_BACKLOG_CSV_PATH, backlog_rows)
    write_csv(MOVE_REPORT_PARTIAL_CSV_PATH, partial_rows)
    write_csv(MOVE_REPORT_MANUAL_CSV_PATH, manual_rows)


def main():
    db_path = find_moves_db_path()
    if not db_path:
        raise FileNotFoundError("No external move JSON source or moves.db found in any known location.")

    rows = load_move_rows(db_path)
    entries = []
    report_rows = []
    seen_names = set()

    for row in rows:
        move_name = clean_text(row.get("name", ""))
        if not move_name:
            continue
        normalized_name = normalize_name_key(move_name)
        if normalized_name in seen_names:
            continue
        seen_names.add(normalized_name)

        entry, report_row = build_move_entry(row)
        entries.append(entry)
        report_rows.append(report_row)

    entries.sort(key=lambda item: item["name"].lower())
    report_rows.sort(key=lambda item: item["name"].lower())

    write_module(MOVE_SEEDS_PATH, "MOVE_COMPENDIUM_ENTRIES", entries)
    write_report(report_rows, db_path)

    status_counter = Counter(row["status"] for row in report_rows)
    print(f"Generated {len(entries)} move entries from {db_path}.")
    print(
        "Automation status -> "
        f"full: {status_counter.get('full', 0)}, "
        f"partial: {status_counter.get('partial', 0)}, "
        f"manual: {status_counter.get('manual', 0)}"
    )
    print(f"Wrote seeds to {MOVE_SEEDS_PATH}")
    print(f"Wrote report to {MOVE_REPORT_MD_PATH}")


if __name__ == "__main__":
    main()
