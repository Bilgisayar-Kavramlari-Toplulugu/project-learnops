"""
validate_content.py — Content validation script for LearnOps

Validates all course content under content/courses/:
- meta.json: required fields, slug uniqueness
- MDX frontmatter: required fields (id, title, order_index),
  global id uniqueness, per-course order_index collision check
- quiz.json: structural validation (if present)

Usage:
    cd project-learnops
    poetry run python scripts/validate_content.py

Exit codes:
    0 = All validations passed
    1 = One or more validation errors found

Note: This script does NOT connect to a database.
      It operates entirely on the filesystem.
"""

import json
import re
import sys
from pathlib import Path

# ── Resolve paths ──────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # backend/scripts -> backend -> project root
CONTENT_DIR = PROJECT_ROOT / "content" / "courses"

# ── Colour helpers (ANSI) ─────────────────────────────────────────
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"

# ── Required fields ───────────────────────────────────────────────
META_REQUIRED_FIELDS = [
    "slug",
    "title",
    "description",
    "category",
    "difficulty",
    "duration_minutes",
    "is_published",
]

MDX_REQUIRED_FIELDS = ["id", "title", "order_index"]

QUIZ_QUESTION_REQUIRED_FIELDS = ["order_index", "text", "options", "correct_index"]


def _parse_mdx_frontmatter(filepath: Path) -> dict | None:
    """Parse YAML-like frontmatter from MDX file (between --- delimiters).

    Returns a dict of key-value pairs, or None if no frontmatter found.
    Handles simple scalar values only (strings, ints, bools).
    """
    content = filepath.read_text(encoding="utf-8")
    # Match frontmatter block
    match = re.match(r"^---\s*\r?\n(.*?)\r?\n---", content, re.DOTALL)
    if not match:
        return None

    frontmatter: dict = {}
    for line in match.group(1).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"').strip("'")

        # Parse simple types
        if value.lower() in ("true", "false"):
            frontmatter[key] = value.lower() == "true"
        else:
            try:
                frontmatter[key] = int(value)
            except ValueError:
                frontmatter[key] = value

    return frontmatter


def validate_meta_json(course_dir: Path, errors: list[str]) -> dict | None:
    """Validate meta.json in a course directory.

    Returns parsed meta dict on success, None on failure.
    """
    meta_path = course_dir / "meta.json"
    if not meta_path.exists():
        errors.append(f"{RED}[META]{RESET} {course_dir.name}: meta.json bulunamadı")
        return None

    try:
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        errors.append(
            f"{RED}[META]{RESET} {course_dir.name}/meta.json: JSON parse hatası — {e}"
        )
        return None

    # Check required fields
    for field in META_REQUIRED_FIELDS:
        if field not in meta:
            errors.append(
                f"{RED}[META]{RESET} {course_dir.name}/meta.json: "
                f"zorunlu alan eksik — '{field}'"
            )

    return meta


def validate_mdx_sections(
    course_dir: Path,
    errors: list[str],
    global_section_ids: dict[str, str],
) -> None:
    """Validate all MDX section files in a course directory.

    Checks:
    - Frontmatter existence and required fields
    - Global uniqueness of section id
    - Per-course order_index collision
    """
    sections_dir = course_dir / "sections"
    if not sections_dir.exists():
        errors.append(
            f"{RED}[MDX]{RESET} {course_dir.name}: sections/ dizini bulunamadı"
        )
        return

    mdx_files = sorted(sections_dir.glob("*.mdx"))
    if not mdx_files:
        errors.append(
            f"{YELLOW}[MDX]{RESET} {course_dir.name}: "
            f"sections/ altında .mdx dosyası yok"
        )
        return

    order_indices: dict[int, str] = {}  # order_index -> filename

    for mdx_file in mdx_files:
        rel_path = f"{course_dir.name}/sections/{mdx_file.name}"
        frontmatter = _parse_mdx_frontmatter(mdx_file)

        if frontmatter is None:
            errors.append(
                f"{RED}[MDX]{RESET} {rel_path}: frontmatter bulunamadı (--- blok)"
            )
            continue

        # Check required fields
        for field in MDX_REQUIRED_FIELDS:
            # Accept 'order' as alias for 'order_index'
            if field == "order_index" and "order_index" not in frontmatter:
                if "order" in frontmatter:
                    frontmatter["order_index"] = frontmatter["order"]
                else:
                    errors.append(
                        f"{RED}[MDX]{RESET} {rel_path}: "
                        f"zorunlu alan eksik — 'order_index' (veya 'order')"
                    )
                    continue

            if field not in frontmatter:
                errors.append(
                    f"{RED}[MDX]{RESET} {rel_path}: zorunlu alan eksik — '{field}'"
                )

        # Global section id uniqueness
        section_id = frontmatter.get("id")
        if section_id:
            if section_id in global_section_ids:
                errors.append(
                    f"{RED}[MDX]{RESET} {rel_path}: "
                    f"section id '{section_id}' zaten kullanılıyor → "
                    f"{global_section_ids[section_id]}"
                )
            else:
                global_section_ids[section_id] = rel_path

        # Per-course order_index collision
        order_idx = frontmatter.get("order_index")
        if order_idx is not None:
            if order_idx in order_indices:
                errors.append(
                    f"{RED}[MDX]{RESET} {rel_path}: "
                    f"order_index={order_idx} çakışması → "
                    f"{order_indices[order_idx]}"
                )
            else:
                order_indices[order_idx] = rel_path


def validate_quiz_json(course_dir: Path, errors: list[str]) -> None:
    """Validate quiz.json in a course directory (if present).

    Checks:
    - course_slug presence
    - questions array existence
    - Each question has required fields
    - correct_index within options range
    - order_index uniqueness within quiz
    """
    quiz_path = course_dir / "quiz.json"
    if not quiz_path.exists():
        return  # quiz.json is optional

    try:
        quiz = json.loads(quiz_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        errors.append(
            f"{RED}[QUIZ]{RESET} {course_dir.name}/quiz.json: JSON parse hatası — {e}"
        )
        return

    # course_slug required
    if "course_slug" not in quiz:
        errors.append(
            f"{RED}[QUIZ]{RESET} {course_dir.name}/quiz.json: "
            f"zorunlu alan eksik — 'course_slug'"
        )

    # questions array
    questions = quiz.get("questions")
    if not isinstance(questions, list):
        errors.append(
            f"{RED}[QUIZ]{RESET} {course_dir.name}/quiz.json: "
            f"'questions' alanı eksik veya liste değil"
        )
        return

    if len(questions) == 0:
        errors.append(
            f"{YELLOW}[QUIZ]{RESET} {course_dir.name}/quiz.json: questions listesi boş"
        )
        return

    quiz_order_indices: dict[int, int] = {}  # order_index -> question number

    for i, question in enumerate(questions, start=1):
        q_prefix = f"{course_dir.name}/quiz.json soru #{i}"

        for field in QUIZ_QUESTION_REQUIRED_FIELDS:
            if field not in question:
                errors.append(
                    f"{RED}[QUIZ]{RESET} {q_prefix}: zorunlu alan eksik — '{field}'"
                )

        # correct_index range check
        options = question.get("options", [])
        correct_idx = question.get("correct_index")
        if (
            isinstance(correct_idx, int)
            and isinstance(options, list)
            and len(options) > 0
        ):
            if correct_idx < 0 or correct_idx >= len(options):
                errors.append(
                    f"{RED}[QUIZ]{RESET} {q_prefix}: "
                    f"correct_index={correct_idx} options aralığı dışında "
                    f"(0-{len(options) - 1})"
                )

        # order_index uniqueness
        q_order = question.get("order_index")
        if q_order is not None:
            if q_order in quiz_order_indices:
                errors.append(
                    f"{RED}[QUIZ]{RESET} {q_prefix}: "
                    f"order_index={q_order} çakışması → "
                    f"soru #{quiz_order_indices[q_order]}"
                )
            else:
                quiz_order_indices[q_order] = i

        # explanation check (warning only)
        if "explanation" not in question or not question.get("explanation", "").strip():
            errors.append(
                f"{YELLOW}[QUIZ]{RESET} {q_prefix}: "
                f"'explanation' alanı eksik veya boş (önerilir)"
            )


def main() -> int:
    """Run all content validations. Returns exit code."""
    print(f"\n{CYAN}═══ LearnOps Content Validator ═══{RESET}\n")

    if not CONTENT_DIR.exists():
        print(f"{RED}HATA:{RESET} content/courses/ dizini bulunamadı: {CONTENT_DIR}")
        return 1

    # Find all course directories (skip _ prefixed = template dirs)
    course_dirs = sorted(
        d for d in CONTENT_DIR.iterdir() if d.is_dir() and not d.name.startswith("_")
    )

    # Also validate template dirs but just with warnings
    template_dirs = sorted(
        d for d in CONTENT_DIR.iterdir() if d.is_dir() and d.name.startswith("_")
    )

    if not course_dirs and not template_dirs:
        print(
            f"{YELLOW}UYARI:{RESET} content/courses/ altında hiç kurs dizini bulunamadı"
        )
        return 0

    errors: list[str] = []
    slugs: dict[str, str] = {}  # slug -> course_dir_name
    global_section_ids: dict[str, str] = {}  # section_id -> rel_path

    # ── Validate regular courses ──
    for course_dir in course_dirs:
        print(f"  📁 {course_dir.name}")

        meta = validate_meta_json(course_dir, errors)

        # Slug uniqueness
        if meta and "slug" in meta:
            slug = meta["slug"]
            if slug in slugs:
                errors.append(
                    f"{RED}[META]{RESET} {course_dir.name}: "
                    f"slug '{slug}' zaten kullanılıyor → {slugs[slug]}"
                )
            else:
                slugs[slug] = course_dir.name

        validate_mdx_sections(course_dir, errors, global_section_ids)
        validate_quiz_json(course_dir, errors)

    # ── Info about skipped template dirs ──
    for tmpl_dir in template_dirs:
        print(f"  📁 {tmpl_dir.name} {YELLOW}(şablon — atlandı){RESET}")

    # ── Results ──
    print()

    # Separate errors from warnings (yellow = warning)
    real_errors = [e for e in errors if RED in e]
    warning_msgs = [e for e in errors if YELLOW in e and RED not in e]

    if warning_msgs:
        print(f"{YELLOW}⚠ Uyarılar ({len(warning_msgs)}):{RESET}")
        for w in warning_msgs:
            print(f"  {w}")
        print()

    if real_errors:
        print(f"{RED}✗ {len(real_errors)} hata bulundu:{RESET}")
        for err in real_errors:
            print(f"  {err}")
        print()
        return 1

    print(
        f"{GREEN}✓ Tüm doğrulamalar başarılı! "
        f"({len(course_dirs)} kurs, {len(global_section_ids)} section){RESET}\n"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
