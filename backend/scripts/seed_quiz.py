"""
seed_quiz.py — Quiz seeding script for LearnOps

Reads quiz.json files from content/courses/*/quiz.json and UPSERTs
quiz + question data into the database.

Usage:
    # Dry-run (no DB writes)
    poetry run python scripts/seed_quiz.py --env development --dry-run

    # Actual run
    poetry run python scripts/seed_quiz.py --env development

Exit codes:
    0 = Seed completed successfully
    1 = Error (missing slug, invalid data, DB error)

Requirements:
    - courses must already exist in DB (run seed_content.py first)
    - Database must be accessible
"""

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# ── Resolve paths ──────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent  # backend/scripts -> backend -> project root
BACKEND_DIR = SCRIPT_DIR.parent
CONTENT_DIR = PROJECT_ROOT / "content" / "courses"

# Add backend to path so we can import app modules
sys.path.insert(0, str(BACKEND_DIR))

# ── Colour helpers (ANSI) ─────────────────────────────────────────
RED = "\033[91m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
RESET = "\033[0m"


def parse_args() -> argparse.Namespace:
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Seed quiz data from content/courses/*/quiz.json into database"
    )
    parser.add_argument(
        "--env",
        default="development",
        choices=["development", "staging", "testing"],
        help="Environment to use (default: development)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be done without writing to DB",
    )
    return parser.parse_args()


def collect_quiz_files() -> list[Path]:
    """Find all quiz.json files in content/courses/.

    Skips directories starting with _ (template directories).
    """
    if not CONTENT_DIR.exists():
        return []

    quiz_files = []
    for course_dir in sorted(CONTENT_DIR.iterdir()):
        if not course_dir.is_dir() or course_dir.name.startswith("_"):
            continue
        quiz_path = course_dir / "quiz.json"
        if quiz_path.exists():
            quiz_files.append(quiz_path)

    return quiz_files


def parse_quiz_file(quiz_path: Path) -> dict | None:
    """Parse and validate a quiz.json file. Returns dict or None on error."""
    try:
        data = json.loads(quiz_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        print(f"  {RED}✗{RESET} {quiz_path}: JSON parse hatası — {e}")
        return None

    course_slug = data.get("course_slug")
    if not course_slug:
        print(f"  {RED}✗{RESET} {quiz_path}: 'course_slug' alanı eksik")
        return None

    questions = data.get("questions")
    if not isinstance(questions, list) or len(questions) == 0:
        print(f"  {RED}✗{RESET} {quiz_path}: 'questions' alanı eksik veya boş liste")
        return None

    return data


async def seed_quizzes(
    quiz_data_list: list[dict],
    session: AsyncSession,
    dry_run: bool,
) -> bool:
    """UPSERT quiz and question records into database.

    Returns True on success, False on error.
    """
    # Import models here to avoid import-time DB connection issues
    from app.models.courses import Course
    from app.models.quizzes import Question, Quiz

    has_error = False

    for quiz_data in quiz_data_list:
        course_slug = quiz_data["course_slug"]
        pass_threshold = quiz_data.get("pass_threshold", 0.70)
        duration_seconds = quiz_data.get("duration_seconds", 1200)
        questions = quiz_data["questions"]

        # Find course by slug
        result = await session.execute(select(Course).where(Course.slug == course_slug))
        course = result.scalar_one_or_none()

        if course is None:
            print(
                f"  {RED}✗{RESET} slug '{course_slug}' DB'de bulunamadı. "
                f"Önce seed_content.py çalıştırın."
            )
            has_error = True
            continue

        if dry_run:
            print(f"  {CYAN}[DRY-RUN]{RESET} Kurs: {course_slug} (id: {course.id})")
            print(
                f"    → Quiz UPSERT: pass_threshold={pass_threshold}, "
                f"duration_seconds={duration_seconds}"
            )
            print(f"    → {len(questions)} soru UPSERT edilecek")
            for q in questions:
                is_active = q.get("is_active", True)
                active_label = "" if is_active else f" {YELLOW}[DEVRE DIŞI]{RESET}"
                print(
                    f"      • soru #{q.get('order_index', '?')}: "
                    f"{q.get('text', '?')[:60]}...{active_label}"
                )
            continue

        # ── UPSERT Quiz ──
        result = await session.execute(select(Quiz).where(Quiz.course_id == course.id))
        quiz = result.scalar_one_or_none()

        if quiz is None:
            quiz = Quiz(
                course_id=course.id,
                pass_threshold=pass_threshold,
                duration_seconds=duration_seconds,
            )
            session.add(quiz)
            await session.flush()
            print(f"  {GREEN}+{RESET} Quiz oluşturuldu: {course_slug} (id: {quiz.id})")
        else:
            quiz.pass_threshold = pass_threshold  # type: ignore[assignment]
            quiz.duration_seconds = duration_seconds  # type: ignore[assignment]
            await session.flush()
            print(f"  {YELLOW}~{RESET} Quiz güncellendi: {course_slug} (id: {quiz.id})")

        # ── UPSERT Questions ──
        # Get existing questions for this quiz
        result = await session.execute(
            select(Question).where(Question.quiz_id == quiz.id)
        )
        existing_questions = {q.order_index: q for q in result.scalars().all()}

        for q_data in questions:
            order_index = q_data["order_index"]
            q_text = q_data["text"]
            q_options = q_data["options"]
            q_correct_index = q_data["correct_index"]
            q_explanation = q_data.get("explanation", "")
            q_is_active = q_data.get("is_active", True)

            if order_index in existing_questions:
                # Update existing
                existing_q = existing_questions[order_index]
                existing_q.text = q_text  # type: ignore[assignment]
                existing_q.options = q_options  # type: ignore[assignment]
                existing_q.correct_index = q_correct_index  # type: ignore[assignment]
                existing_q.explanation = q_explanation  # type: ignore[assignment]
                existing_q.is_active = q_is_active  # type: ignore[assignment]
                print(f"    {YELLOW}~{RESET} Soru #{order_index} güncellendi")
            else:
                # Create new question
                new_q = Question(
                    quiz_id=quiz.id,
                    text=q_text,
                    options=q_options,
                    correct_index=q_correct_index,
                    explanation=q_explanation,
                    order_index=order_index,
                    is_active=q_is_active,
                )
                session.add(new_q)
                print(f"    {GREEN}+{RESET} Soru #{order_index} oluşturuldu")

        await session.flush()

    return not has_error


async def run(args: argparse.Namespace) -> int:
    """Main async entry point."""
    print(f"\n{CYAN}═══ LearnOps Quiz Seeder ═══{RESET}\n")

    if args.dry_run:
        print(f"{YELLOW}▶ DRY-RUN modu — DB'ye yazma yapılmayacak{RESET}\n")

    # Collect quiz files
    quiz_files = collect_quiz_files()
    if not quiz_files:
        print(
            f"{YELLOW}UYARI:{RESET} content/courses/ altında "
            f"quiz.json dosyası bulunamadı"
        )
        return 0

    # Parse all quiz files
    quiz_data_list: list[dict] = []
    parse_errors = False
    for qf in quiz_files:
        data = parse_quiz_file(qf)
        if data is None:
            parse_errors = True
        else:
            quiz_data_list.append(data)

    if parse_errors:
        print(f"\n{RED}✗ Quiz dosyası parse hataları var, iptal ediliyor.{RESET}\n")
        return 1

    if not quiz_data_list:
        print(f"{YELLOW}UYARI:{RESET} İşlenecek quiz verisi bulunamadı")
        return 0

    # ── Dry-run mode: no DB needed ──
    if args.dry_run:
        # Still need DB to check if slugs exist — connect read only
        database_url = os.environ.get("DATABASE_URL", "")
        if not database_url:
            # If no DB URL, just show what would be done without slug validation
            print(
                f"{YELLOW}UYARI:{RESET} DATABASE_URL ayarlanmamış. "
                f"Slug doğrulaması atlanıyor.\n"
            )
            for quiz_data in quiz_data_list:
                course_slug = quiz_data["course_slug"]
                questions = quiz_data["questions"]
                print(f"  {CYAN}[DRY-RUN]{RESET} Kurs: {course_slug}")
                print(
                    f"    → Quiz UPSERT: "
                    f"pass_threshold={quiz_data.get('pass_threshold', 0.70)}, "
                    f"duration_seconds={quiz_data.get('duration_seconds', 1200)}"
                )
                print(f"    → {len(questions)} soru UPSERT edilecek")
            print(f"\n{GREEN}✓ Dry-run tamamlandı (DB bağlantısı olmadan){RESET}\n")
            return 0

        engine = create_async_engine(database_url, pool_pre_ping=True)
        session_factory = async_sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        async with session_factory() as session:
            success = await seed_quizzes(quiz_data_list, session, dry_run=True)
        await engine.dispose()

        if not success:
            print(f"\n{RED}✗ Dry-run başarısız (slug hataları).{RESET}\n")
            return 1

        print(
            f"\n{GREEN}✓ Dry-run tamamlandı. Yukarıdaki işlemler uygulanacak.{RESET}\n"
        )
        return 0

    # ── Real run: connect to DB and UPSERT ──
    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        print(f"{RED}HATA:{RESET} DATABASE_URL environment variable ayarlanmamış")
        return 1

    engine = create_async_engine(database_url, pool_pre_ping=True)
    session_factory = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with session_factory() as session:
        async with session.begin():
            success = await seed_quizzes(quiz_data_list, session, dry_run=False)

            if not success:
                print(
                    f"\n{RED}✗ Seed başarısız — hatalar var, "
                    f"DB değişiklikleri geri alınıyor.{RESET}\n"
                )
                await session.rollback()
                await engine.dispose()
                return 1

    await engine.dispose()
    print(f"\n{GREEN}✓ Quiz seed işlemi başarıyla tamamlandı!{RESET}\n")
    return 0


def main() -> int:
    """Sync entry point."""
    args = parse_args()

    # Set environment
    os.environ.setdefault("ENVIRONMENT", args.env)

    return asyncio.run(run(args))


if __name__ == "__main__":
    sys.exit(main())
