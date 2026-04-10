"""seed_content.py — Seed courses and sections from content/ directory.

Reads meta.json for course metadata and MDX frontmatter for sections.
UPSERT logic based on slug (courses) and section_id_str (sections).

Usage:
    poetry run python scripts/seed_content.py --env development
    poetry run python scripts/seed_content.py --env production
    poetry run python scripts/seed_content.py --env development --dry-run
"""

import argparse
import json
import logging
import os
import re
import sys
from pathlib import Path

import sqlalchemy as sa
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
CONTENT_DIR = PROJECT_ROOT / "content" / "courses"

# Add backend to sys.path so we can import app modules
sys.path.insert(0, str(BACKEND_DIR))

from app.models.courses import Course, Section  # noqa: E402

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("seed_content")

# ---------------------------------------------------------------------------
# meta.json schema — required / optional fields
# ---------------------------------------------------------------------------
META_REQUIRED = {"title", "slug"}
META_OPTIONAL = {
    "description": None,
    "category": None,
    "difficulty": None,
    "duration_minutes": None,
    "is_published": False,
    "recommended_order": None,
}
VALID_DIFFICULTIES = {"beginner", "intermediate", "advanced"}

# ---------------------------------------------------------------------------
# Frontmatter parser (lightweight — no extra dependency)
# ---------------------------------------------------------------------------
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)


def parse_frontmatter(text: str) -> dict:
    """Extract YAML-like frontmatter from MDX content.

    Supports simple key: value and key: "quoted value" pairs.

    Limitations: only scalar values (no lists, multiline, or booleans).
    Boolean/nested fields should come from meta.json (native JSON types).
    """
    match = FRONTMATTER_RE.match(text)
    if not match:
        return {}
    result = {}
    for line in match.group(1).splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        # Try to parse numeric values
        if value.isdigit():
            value = int(value)
        result[key] = value
    return result


# ---------------------------------------------------------------------------
# Validation helpers
# ---------------------------------------------------------------------------
def validate_meta(meta: dict, course_dir: str) -> list[str]:
    """Validate a meta.json dict. Returns list of error messages."""
    errors = []
    for field in META_REQUIRED:
        if field not in meta or not meta[field]:
            errors.append(f"{course_dir}/meta.json: missing required field '{field}'")

    if "difficulty" in meta and meta["difficulty"] not in VALID_DIFFICULTIES:
        errors.append(
            f"{course_dir}/meta.json: invalid difficulty '{meta['difficulty']}' "
            f"(expected one of {VALID_DIFFICULTIES})"
        )

    if "duration_minutes" in meta and meta["duration_minutes"] is not None:
        dur = meta["duration_minutes"]
        if not isinstance(dur, int) or dur <= 0:
            errors.append(
                f"{course_dir}/meta.json: duration_minutes must be a positive integer"
            )

    if "recommended_order" in meta and meta["recommended_order"] is not None:
        if not isinstance(meta["recommended_order"], int):
            errors.append(
                f"{course_dir}/meta.json: recommended_order must be an integer"
            )

    return errors


def validate_section(fm: dict, mdx_path: str) -> list[str]:
    """Validate MDX frontmatter. Returns list of error messages."""
    errors = []
    if "id" not in fm or not fm["id"]:
        errors.append(f"{mdx_path}: missing required frontmatter field 'id'")
    if "title" not in fm or not fm["title"]:
        errors.append(f"{mdx_path}: missing required frontmatter field 'title'")
    if "order" not in fm:
        errors.append(f"{mdx_path}: missing required frontmatter field 'order'")
    elif not isinstance(fm["order"], int):
        errors.append(f"{mdx_path}: 'order' must be an integer")
    return errors


# ---------------------------------------------------------------------------
# Content discovery
# ---------------------------------------------------------------------------
def discover_courses() -> list[dict]:
    """Discover all courses with meta.json and their sections."""
    courses = []

    if not CONTENT_DIR.exists():
        logger.error(f"Content directory not found: {CONTENT_DIR}")
        sys.exit(1)

    for course_dir in sorted(CONTENT_DIR.iterdir()):
        if not course_dir.is_dir():
            continue

        meta_path = course_dir / "meta.json"
        if not meta_path.exists():
            logger.warning(f"Skipping {course_dir.name}: no meta.json")
            continue

        with open(meta_path, encoding="utf-8") as f:
            meta = json.load(f)

        # Discover sections
        sections_dir = course_dir / "sections"
        sections = []
        if sections_dir.exists():
            for mdx_file in sorted(sections_dir.glob("*.mdx")):
                content = mdx_file.read_text(encoding="utf-8")
                fm = parse_frontmatter(content)
                sections.append({"frontmatter": fm, "path": str(mdx_file)})

        courses.append(
            {
                "meta": meta,
                "dir": course_dir.name,
                "sections": sections,
            }
        )

    return courses


# ---------------------------------------------------------------------------
# Database operations
# ---------------------------------------------------------------------------
def get_database_url() -> str:
    """Resolve database URL from DATABASE_URL environment variable."""
    url = os.getenv("DATABASE_URL", "")
    if not url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Set it in .env or pass it directly."
        )
    # Convert async URL to sync for this script
    return url.replace("postgresql+asyncpg://", "postgresql://")


def upsert_courses_and_sections(session: Session, courses: list[dict]) -> None:
    """UPSERT courses by slug and sections by section_id_str.

    Sections are handled with delete-then-insert per course to avoid
    UniqueViolation on the (course_id, order_index) constraint
    (uq_sections_course_order) that would occur when order values change
    during one-by-one UPSERTs.  user_progress rows cascade-delete via FK,
    so this is safe only because the seed script runs before users exist.
    """
    for course_data in courses:
        meta = course_data["meta"]

        # UPSERT course by slug
        course_values = {
            "slug": meta["slug"],
            "title": meta["title"],
            "description": meta.get("description"),
            "category": meta.get("category"),
            "difficulty": meta.get("difficulty"),
            "duration_minutes": meta.get("duration_minutes"),
            "is_published": meta.get("is_published", False),
            "display_order": meta.get("recommended_order"),
        }

        stmt = pg_insert(Course.__table__).values(**course_values)
        stmt = stmt.on_conflict_do_update(
            constraint="uq_courses_slug",
            set_={
                "title": stmt.excluded.title,
                "description": stmt.excluded.description,
                "category": stmt.excluded.category,
                "difficulty": stmt.excluded.difficulty,
                "duration_minutes": stmt.excluded.duration_minutes,
                "is_published": stmt.excluded.is_published,
                "display_order": stmt.excluded.display_order,
                "updated_at": sa.func.now(),
            },
        )
        session.execute(stmt)
        logger.info(f"UPSERT course: {meta['slug']}")

        # Get course ID for sections
        course_row = session.execute(
            sa.select(Course.__table__.c.id).where(
                Course.__table__.c.slug == meta["slug"]
            )
        ).first()
        course_id = course_row[0]

        # Delete existing sections for this course, then re-insert.
        # This avoids UniqueViolation on uq_sections_course_order when
        # order_index values are reassigned between sections.
        session.execute(
            sa.delete(Section.__table__).where(
                Section.__table__.c.course_id == course_id
            )
        )
        logger.info(f"  Deleted existing sections for course {meta['slug']}")

        for section_data in course_data["sections"]:
            fm = section_data["frontmatter"]
            session.execute(
                sa.insert(Section.__table__).values(
                    course_id=course_id,
                    section_id_str=fm["id"],
                    title=fm["title"],
                    order_index=fm["order"],
                )
            )
            logger.info(f"  INSERT section: {fm['id']}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def load_env_file(env: str) -> None:
    """Load the appropriate .env file for the given environment."""
    env_file = BACKEND_DIR / ".env"
    if env_file.exists():
        logger.info(f"Loading environment from {env_file}")
        with open(env_file, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key not in os.environ:
                    os.environ[key] = value
    os.environ["ENVIRONMENT"] = env


def main():
    parser = argparse.ArgumentParser(
        description="Seed courses and sections from content/"
    )
    parser.add_argument(
        "--env",
        choices=["development", "staging", "production"],
        default="development",
        help="Target environment (default: development)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate without writing to DB. Exit 1 on errors.",
    )
    args = parser.parse_args()

    load_env_file(args.env)

    logger.info(f"Content directory: {CONTENT_DIR}")
    logger.info(f"Environment: {args.env}")
    logger.info(f"Dry run: {args.dry_run}")

    # --- Discover ---
    courses = discover_courses()
    if not courses:
        logger.error("No courses found in content directory")
        sys.exit(1)

    logger.info(f"Found {len(courses)} course(s)")

    # --- Validate ---
    all_errors: list[str] = []
    slugs: set[str] = set()
    section_ids: set[str] = set()

    for course_data in courses:
        meta = course_data["meta"]
        all_errors.extend(validate_meta(meta, course_data["dir"]))

        # Check for duplicate slugs
        slug = meta.get("slug", "")
        if slug in slugs:
            all_errors.append(
                f"{course_data['dir']}/meta.json: duplicate slug '{slug}'"
            )
        slugs.add(slug)

        for section_data in course_data["sections"]:
            fm = section_data["frontmatter"]
            all_errors.extend(validate_section(fm, section_data["path"]))

            # Check for duplicate section IDs
            sid = fm.get("id", "")
            if sid in section_ids:
                all_errors.append(
                    f"{section_data['path']}: duplicate section_id_str '{sid}'"
                )
            section_ids.add(sid)

    if all_errors:
        logger.error("Validation failed:")
        for err in all_errors:
            logger.error(f"  - {err}")
        sys.exit(1)

    logger.info("Validation passed")

    # --- Dry run summary ---
    for course_data in courses:
        meta = course_data["meta"]
        n_sections = len(course_data["sections"])
        order = meta.get("recommended_order", "NULL")
        logger.info(
            f"  [{meta['slug']}] {meta['title']} "
            f"({n_sections} sections, display_order={order})"
        )

    if args.dry_run:
        logger.info("Dry run complete — no database writes.")
        sys.exit(0)

    # --- Seed ---
    db_url = get_database_url()
    engine = create_engine(db_url)

    with Session(engine) as session:
        upsert_courses_and_sections(session, courses)
        session.commit()

    logger.info("Seed complete.")


if __name__ == "__main__":
    main()
