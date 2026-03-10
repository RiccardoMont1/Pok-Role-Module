import csv
import json
import re
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
REPORT_DIR = ROOT / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)

MOVE_SEED_PATH = ROOT / "module" / "seeds" / "generated" / "move-seeds.mjs"
ABILITY_SEED_PATH = ROOT / "module" / "seeds" / "generated" / "ability-seeds.mjs"

MOVE_START_PAGE = 346
MOVE_END_PAGE = 430
ABILITY_START_PAGE = 434
ABILITY_END_PAGE = 471

PDF_CANDIDATES = [
    ROOT / "POKEROLE COREBOOK 2.0.pdf",
    Path(r"C:\Users\Ricch\Downloads\POKEROLE COREBOOK 2.0.pdf")
]

TYPE_MAP = {
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


def norm(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.lower().replace("’", "'")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_ref_page(description: str) -> Optional[int]:
    match = re.search(r"Corebook p\.(\d+)", description or "")
    return int(match.group(1)) if match else None


def load_mjs_array(path: Path) -> List[dict]:
    text = path.read_text(encoding="utf-8")
    start = text.index("[")
    end = text.rindex("]") + 1
    return json.loads(text[start:end])


def find_pdf_path() -> Path:
    for path in PDF_CANDIDATES:
        if path.exists():
            return path
    raise FileNotFoundError("Corebook PDF not found in expected paths.")


@dataclass
class PageData:
    page: int
    raw_text: str
    norm_text: str
    raw_lines: List[str]
    norm_lines: List[str]


def load_page_range(reader: PdfReader, start_page: int, end_page: int) -> Dict[int, PageData]:
    data: Dict[int, PageData] = {}
    for page in range(start_page, end_page + 1):
        raw_text = reader.pages[page - 1].extract_text() or ""
        raw_lines = [line for line in raw_text.splitlines() if line.strip()]
        norm_lines = [norm(line) for line in raw_lines]
        data[page] = PageData(
            page=page,
            raw_text=raw_text,
            norm_text=f" {norm(raw_text)} ",
            raw_lines=raw_lines,
            norm_lines=norm_lines
        )
    return data


def find_pages_with_name(name: str, pages: Dict[int, PageData]) -> List[int]:
    needle = f" {norm(name)} "
    return [page for page, content in pages.items() if needle in content.norm_text]


def find_line_indices_with_name(name: str, content: PageData) -> List[int]:
    needle = norm(name)
    strict_indices = []
    loose_indices = []
    for index, line in enumerate(content.norm_lines):
        if not line:
            continue
        if needle == line or line.startswith(f"{needle} "):
            strict_indices.append(index)
            continue
        if f" {needle} " in f" {line} ":
            loose_indices.append(index)
    return strict_indices if strict_indices else loose_indices


def find_move_anchor_indices(name: str, content: PageData) -> List[int]:
    needle = norm(name)
    indices = []
    power_suffix_re = re.compile(r"^(-|\d+\*?|\*)($|\b)")
    for index, line in enumerate(content.norm_lines):
        if not line:
            continue
        if needle == line:
            indices.append(index)
            continue
        if not line.startswith(f"{needle} "):
            continue
        suffix = line[len(needle):].strip()
        if power_suffix_re.match(suffix):
            indices.append(index)
    return indices


def score_move_anchor(content: PageData, index: int, name: str) -> int:
    start = max(0, index - 12)
    end = min(len(content.norm_lines), index + 18)
    window = " ".join(content.norm_lines[start:end])
    line = content.norm_lines[index]
    raw_line = content.raw_lines[index]

    score = 0
    for keyword, weight in (
        ("power", 4),
        ("type", 3),
        ("accuracy", 2),
        ("damage pool", 2),
        ("added effect", 1)
    ):
        if keyword in window:
            score += weight

    if re.search(rf"{re.escape(name)}\s+(-|\d+\*?|\*)\s*$", raw_line, flags=re.IGNORECASE):
        score += 4
    if "move name" in line or "rank type move name" in line:
        score -= 5
    if line == norm(name):
        score += 3
    return score


def is_move_header_candidate(content: PageData, index: int, name: str) -> bool:
    line_norm = content.norm_lines[index]
    name_norm = norm(name)
    if line_norm != name_norm:
        if not line_norm.startswith(f"{name_norm} "):
            return False
        suffix = line_norm[len(name_norm):].strip()
        if not re.match(r"^(-|\d+\*?|\*)($|\b)", suffix):
            return False

    if not (line_norm == name_norm or line_norm.startswith(f"{name_norm} ")):
        return False

    context_start = max(0, index - 12)
    context_end = min(len(content.norm_lines), index + 14)
    context_window = " ".join(content.norm_lines[context_start:context_end])
    has_power = "power" in context_window
    has_type = "type" in context_window
    has_accuracy = "accuracy" in context_window
    has_damage_pool = "damage pool" in context_window

    # Card headers normally have at least POWER+TYPE nearby.
    if has_power and has_type and (has_accuracy or has_damage_pool):
        return True

    # Fallback: title line carrying trailing power token.
    raw_line = content.raw_lines[index]
    if re.search(rf"{re.escape(name)}\s+(-|\d+\*?|\*)\s*$", raw_line, flags=re.IGNORECASE):
        return True

    # Secondary fallback: POWER appears immediately before and TYPE after.
    before_start = max(0, index - 12)
    before_window = " ".join(content.norm_lines[before_start:index + 1])
    if "power" in before_window and has_type and (has_accuracy or has_damage_pool):
        return True

    return False


def select_best_move_anchor(name: str, content: PageData, indices: List[int]) -> Optional[int]:
    if not indices:
        return None
    candidates = [idx for idx in indices if is_move_header_candidate(content, idx, name)]
    if not candidates:
        return None
    scored = sorted(candidates, key=lambda idx: score_move_anchor(content, idx, name), reverse=True)
    return scored[0]


def map_type(value: str) -> Optional[str]:
    token = norm(value)
    if not token:
        return None
    token = token.split()[0]
    return TYPE_MAP.get(token)


def parse_manual_type(content: PageData, anchor_index: int) -> Optional[str]:
    start = max(0, anchor_index - 20)
    end = min(len(content.raw_lines), anchor_index + 30)

    candidates = []
    for i in range(start, end):
        raw = content.raw_lines[i]
        direct = re.search(r"Type\s*:?\s*([A-Za-z]+)", raw, flags=re.IGNORECASE)
        if direct:
            mapped = map_type(direct.group(1))
            if mapped:
                candidates.append((abs(i - anchor_index), 0 if i <= anchor_index else 1, i, mapped))

    for i in range(start, end):
        if norm(content.raw_lines[i]).startswith("type"):
            for j in range(i + 1, min(end, i + 8)):
                candidate = re.search(r"([A-Za-z]+)", content.raw_lines[j])
                if not candidate:
                    continue
                mapped = map_type(candidate.group(1))
                if mapped:
                    candidates.append((abs(j - anchor_index), 0 if j <= anchor_index else 1, j, mapped))

    if not candidates:
        return None
    candidates.sort(key=lambda item: (item[0], item[1], item[2]))
    return candidates[0][3]


def parse_power_token(token: str) -> Optional[int]:
    token = (token or "").strip()
    if not token:
        return None
    if token == "-":
        return 0
    if token == "*":
        return -1
    token = token.replace("*", "")
    if token.isdigit():
        return int(token)
    return None


def parse_manual_power(name: str, content: PageData, anchor_index: int) -> Optional[int]:
    name_re = re.compile(rf"{re.escape(name)}\s+(-|\d+\*?|\*)\s*$", flags=re.IGNORECASE)
    local_start = max(0, anchor_index - 2)
    local_end = min(len(content.raw_lines), anchor_index + 3)
    for i in range(local_start, local_end):
        raw = content.raw_lines[i].strip()
        if not raw:
            continue
        if norm(name) not in norm(raw):
            continue
        match = name_re.search(raw)
        if match:
            parsed = parse_power_token(match.group(1))
            if parsed is not None:
                return parsed

    search_start = anchor_index
    search_end = min(len(content.raw_lines), anchor_index + 14)

    for i in range(search_start, search_end):
        raw = content.raw_lines[i].strip()
        pool_match = re.search(r"Damage Pool:\s*[^\n]*?\+\s*(\d+\*?|\*)", raw, flags=re.IGNORECASE)
        if pool_match:
            parsed = parse_power_token(pool_match.group(1))
            if parsed is not None:
                return parsed

        no_pool_match = re.search(r"Damage Pool:\s*-", raw, flags=re.IGNORECASE)
        if no_pool_match:
            return 0

        if norm(raw).startswith("damage pool"):
            trailing_plus = bool(re.search(r"\+\s*$", raw))
            for j in range(i + 1, min(search_end, i + 12)):
                follow = content.raw_lines[j].strip()
                split_pool_match = re.search(r"\+\s*(\d+\*?|\*)", follow)
                if split_pool_match:
                    parsed = parse_power_token(split_pool_match.group(1))
                    if parsed is not None:
                        return parsed
                if trailing_plus:
                    standalone_num = re.match(r"^(\d+\*?|\*)$", follow)
                    if standalone_num:
                        parsed = parse_power_token(standalone_num.group(1))
                        if parsed is not None:
                            return parsed

    for i in range(anchor_index, search_end):
        raw = content.raw_lines[i].strip()
        merged = re.search(r"POWER\s*(-|\d+\*?|\*)", raw, flags=re.IGNORECASE)
        if merged:
            parsed = parse_power_token(merged.group(1))
            if parsed is not None:
                return parsed
        if norm(raw) == "power":
            for j in range(i + 1, min(search_end, i + 6)):
                token = content.raw_lines[j].strip()
                if re.search(r"(type|accuracy|damage pool|added effect)", token, flags=re.IGNORECASE):
                    continue
                parsed = parse_power_token(token)
                if parsed is not None:
                    return parsed

    window_norm = " ".join(norm(content.raw_lines[i]) for i in range(search_start, search_end))
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
        raw = content.raw_lines[i].strip()
        pool_match = re.search(r"Damage Pool:\s*[^\n]*?\+\s*(\d+\*?|\*)", raw, flags=re.IGNORECASE)
        if pool_match:
            parsed = parse_power_token(pool_match.group(1))
            if parsed is not None:
                return parsed

        if norm(raw).startswith("damage pool"):
            trailing_plus = bool(re.search(r"\+\s*$", raw))
            for j in range(i + 1, min(anchor_index, i + 12)):
                follow = content.raw_lines[j].strip()
                split_pool_match = re.search(r"\+\s*(\d+\*?|\*)", follow)
                if split_pool_match:
                    parsed = parse_power_token(split_pool_match.group(1))
                    if parsed is not None:
                        return parsed
                if trailing_plus:
                    standalone_num = re.match(r"^(\d+\*?|\*)$", follow)
                    if standalone_num:
                        parsed = parse_power_token(standalone_num.group(1))
                        if parsed is not None:
                            return parsed

        merged = re.search(r"POWER\s*(-|\d+\*?|\*)", raw, flags=re.IGNORECASE)
        if merged:
            parsed = parse_power_token(merged.group(1))
            if parsed is not None:
                return parsed

    return None


def token_overlap_ratio(a: str, b: str) -> float:
    ta = {token for token in norm(a).split() if len(token) > 2}
    tb = {token for token in norm(b).split() if len(token) > 2}
    if not ta:
        return 1.0
    return len(ta & tb) / len(ta)


def audit_moves(moves: List[dict], pages: Dict[int, PageData]) -> Tuple[List[dict], dict]:
    rows: List[dict] = []
    summary = {
        "total": len(moves),
        "pass": 0,
        "warn": 0,
        "fail": 0,
        "missing_any": 0,
        "missing_ref": 0,
        "type_mismatch": 0,
        "power_mismatch": 0,
        "parse_issue": 0
    }

    for move in moves:
        name = move["name"]
        seed_type = move["system"]["type"]
        seed_power = int(move["system"]["power"])
        ref_page = parse_ref_page(move["system"].get("description", ""))
        pages_with_name = find_pages_with_name(name, pages)
        on_ref_page = ref_page in pages_with_name
        in_any_page = len(pages_with_name) > 0

        extracted_type = None
        extracted_power = None
        anchor_count = 0
        if on_ref_page and ref_page in pages:
            content = pages[ref_page]
            indices = find_move_anchor_indices(name, content)
            anchor_count = len(indices)
            anchor = select_best_move_anchor(name, content, indices)
            if anchor is not None:
                extracted_type = parse_manual_type(content, anchor)
                extracted_power = parse_manual_power(name, content, anchor)

        type_match = extracted_type == seed_type if extracted_type is not None else False
        power_match = False
        if extracted_power is not None:
            power_match = True if extracted_power == -1 else extracted_power == seed_power

        status = "PASS"
        if not in_any_page or not on_ref_page:
            status = "FAIL"
        elif extracted_type is None or extracted_power is None:
            status = "WARN"
        elif not type_match or not power_match:
            status = "WARN"

        summary[status.lower()] += 1
        if not in_any_page:
            summary["missing_any"] += 1
        if not on_ref_page:
            summary["missing_ref"] += 1
        if extracted_type is None or extracted_power is None:
            summary["parse_issue"] += 1
        if extracted_type is not None and not type_match:
            summary["type_mismatch"] += 1
        if extracted_power is not None and not power_match:
            summary["power_mismatch"] += 1

        rows.append({
            "status": status,
            "name": name,
            "seed_id": move["flags"]["pok-role-system"]["seedId"],
            "ref_page": ref_page,
            "found_pages": ",".join(str(p) for p in pages_with_name),
            "found_on_ref_page": on_ref_page,
            "line_hits_on_ref_page": anchor_count,
            "seed_type": seed_type,
            "manual_type": extracted_type or "",
            "type_match": type_match if extracted_type is not None else "",
            "seed_power": seed_power,
            "manual_power": "*" if extracted_power == -1 else (extracted_power if extracted_power is not None else ""),
            "power_match": power_match if extracted_power is not None else ""
        })

    return rows, summary


def audit_abilities(abilities: List[dict], pages: Dict[int, PageData]) -> Tuple[List[dict], dict]:
    rows: List[dict] = []
    summary = {
        "total": len(abilities),
        "pass": 0,
        "warn": 0,
        "fail": 0,
        "missing_any": 0,
        "missing_ref": 0,
        "low_effect_overlap": 0
    }

    for ability in abilities:
        name = ability["name"]
        effect = ability["system"].get("effect", "")
        ref_page = parse_ref_page(ability["system"].get("description", ""))
        pages_with_name = find_pages_with_name(name, pages)
        on_ref_page = ref_page in pages_with_name
        in_any_page = len(pages_with_name) > 0

        overlap = 0.0
        anchor_count = 0
        if on_ref_page and ref_page in pages:
            content = pages[ref_page]
            indices = find_line_indices_with_name(name, content)
            anchor_count = len(indices)
            if indices:
                best_overlap = 0.0
                for anchor in indices:
                    start = max(0, anchor - 1)
                    end = min(len(content.raw_lines), anchor + 14)
                    window = " ".join(content.raw_lines[start:end])
                    candidate_overlap = token_overlap_ratio(effect, window)
                    if candidate_overlap > best_overlap:
                        best_overlap = candidate_overlap
                overlap = best_overlap

        status = "PASS"
        if not in_any_page or not on_ref_page:
            status = "FAIL"
        elif anchor_count == 0:
            status = "WARN"

        summary[status.lower()] += 1
        if not in_any_page:
            summary["missing_any"] += 1
        if not on_ref_page:
            summary["missing_ref"] += 1
        if on_ref_page and overlap < 0.18:
            summary["low_effect_overlap"] += 1

        rows.append({
            "status": status,
            "name": name,
            "seed_id": ability["flags"]["pok-role-system"]["seedId"],
            "ref_page": ref_page,
            "found_pages": ",".join(str(p) for p in pages_with_name),
            "found_on_ref_page": on_ref_page,
            "line_hits_on_ref_page": anchor_count,
            "ability_type": ability["system"].get("abilityType", ""),
            "effect_overlap_ratio": f"{overlap:.3f}"
        })

    return rows, summary


def write_csv(path: Path, rows: List[dict]) -> None:
    if not rows:
        return
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)


def main() -> None:
    pdf_path = find_pdf_path()
    reader = PdfReader(str(pdf_path))

    moves = load_mjs_array(MOVE_SEED_PATH)
    abilities = load_mjs_array(ABILITY_SEED_PATH)

    move_pages = load_page_range(reader, MOVE_START_PAGE, MOVE_END_PAGE)
    ability_pages = load_page_range(reader, ABILITY_START_PAGE, ABILITY_END_PAGE)

    move_rows, move_summary = audit_moves(moves, move_pages)
    ability_rows, ability_summary = audit_abilities(abilities, ability_pages)

    move_report = REPORT_DIR / "corebook_move_card_audit.csv"
    ability_report = REPORT_DIR / "corebook_ability_card_audit.csv"
    summary_report = REPORT_DIR / "corebook_card_audit_summary.json"

    write_csv(move_report, move_rows)
    write_csv(ability_report, ability_rows)
    summary_report.write_text(
        json.dumps(
            {
                "move_summary": move_summary,
                "ability_summary": ability_summary,
                "move_report": str(move_report),
                "ability_report": str(ability_report)
            },
            indent=2,
            ensure_ascii=True
        ),
        encoding="utf-8"
    )

    print(f"Move cards audited: {move_summary['total']}")
    print(f"Move PASS/WARN/FAIL: {move_summary['pass']}/{move_summary['warn']}/{move_summary['fail']}")
    print(f"Ability cards audited: {ability_summary['total']}")
    print(f"Ability PASS/WARN/FAIL: {ability_summary['pass']}/{ability_summary['warn']}/{ability_summary['fail']}")
    print(f"Reports written to: {REPORT_DIR}")


if __name__ == "__main__":
    main()
