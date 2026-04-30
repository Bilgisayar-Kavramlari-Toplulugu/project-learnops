"""db_update.py — Cloud Run Job entrypoint for database migrations and content seeding.

Execution order:
  1. Apply Alembic migrations (upgrade to head)
  2. UPSERT courses + sections — reuses discover_courses() and
     upsert_courses_and_sections() from seed_content.py (no duplication)
  3. UPSERT quiz data — reuses seed_quizzes() from seed_quiz.py

This file owns only:
  - Engine creation (Cloud SQL Python Connector for Cloud Run, DATABASE_URL fallback)
  - Alembic migration step (not present in either seed script)
  - Orchestration of the three steps in the correct order

Connection:
  - When INSTANCE_CONNECTION_NAME is set (Cloud Run): uses Cloud SQL Python
    Connector with IAM auth over private IP.
  - Fallback: DATABASE_URL environment variable (local use).

Exit codes:
  0 = all steps completed successfully
  1 = any step failed
"""

import asyncio
import logging
import os
import sys
import traceback
from pathlib import Path

from alembic import command as alembic_command
from alembic.config import Config as AlembicConfig
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# ── Path setup ───────────────────────────────────────────────────────────────
# backend/scripts/db_update.py  →  SCRIPT_DIR = backend/scripts/
#                                   BACKEND_DIR = backend/
#                                   PROJECT_ROOT = <repo root>/
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
ALEMBIC_INI = BACKEND_DIR / "alembic.ini"

# Expose backend package and scripts dir for imports
sys.path.insert(0, str(BACKEND_DIR))
sys.path.insert(0, str(SCRIPT_DIR))

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("db_update")


# ── Engine factory ────────────────────────────────────────────────────────────
def _create_engine():
    """
    Create async SQLAlchemy engine.

    Cloud Run mode: INSTANCE_CONNECTION_NAME + DB_USER + DB_NAME env vars.
    Local mode:     DATABASE_URL env var.
    """
    instance_conn_name = os.environ.get("INSTANCE_CONNECTION_NAME")

    if instance_conn_name:
        db_password = os.environ.get("DB_PASSWORD", "")
        if db_password:
            logger.info(
                "Cloud Run mode: Cloud SQL Python Connector (private IP, password auth)"
            )
        else:
            logger.info(
                "Cloud Run mode: Cloud SQL Python Connector (private IP, IAM auth)"
            )

        from google.cloud.sql.connector import IPTypes, create_async_connector

        _connector = None
        _lock = asyncio.Lock()

        async def _get_connection():
            nonlocal _connector
            if _connector is None:
                async with _lock:
                    if _connector is None:
                        _connector = await create_async_connector()
            kwargs: dict = {
                "user": os.environ["DB_USER"],
                "db": os.environ["DB_NAME"],
                "ip_type": IPTypes.PRIVATE,
            }
            if db_password:
                kwargs["password"] = db_password
            else:
                kwargs["enable_iam_auth"] = True
            return await _connector.connect_async(
                instance_conn_name, "asyncpg", **kwargs
            )

        return create_async_engine(
            "postgresql+asyncpg://",
            async_creator=_get_connection,
            pool_pre_ping=True,
            poolclass=NullPool,
        )

    database_url = os.environ.get("DATABASE_URL", "")
    if not database_url:
        raise RuntimeError(
            "Either INSTANCE_CONNECTION_NAME or DATABASE_URL must be set."
        )

    # Ensure async driver prefix
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    logger.info("Local mode: connecting via DATABASE_URL")
    return create_async_engine(database_url, poolclass=NullPool)


# ── Step 1: Alembic migrations ────────────────────────────────────────────────
def _run_upgrade_sync(connection, cfg: AlembicConfig) -> None:
    """Synchronous callback invoked inside conn.run_sync() to apply migrations."""
    cfg.attributes["connection"] = connection
    alembic_command.upgrade(cfg, "head")


async def apply_migrations(engine) -> None:
    logger.info("=== Step 1: Applying Alembic migrations ===")
    alembic_cfg = AlembicConfig(str(ALEMBIC_INI))
    async with engine.begin() as conn:
        await conn.run_sync(_run_upgrade_sync, alembic_cfg)
    logger.info("Migrations applied successfully.")


# ── Step 1b: Grant runtime privileges ────────────────────────────────────────
async def grant_runtime_privileges(engine) -> None:
    """Grant DML privileges on all tables/sequences to the backend IAM user.

    This job connects as 'postgres' (password auth) to run Alembic migrations,
    so all tables are owned by 'postgres'.  PostgreSQL does not auto-grant DML
    to other roles on objects they do not own, so the backend app user
    ('backend-runtime-sa@<project>.iam', Cloud SQL IAM auth) needs explicit
    grants to SELECT/INSERT/UPDATE/DELETE.

    This step is idempotent and correct for both fresh environments (tables
    just created by Alembic) and existing environments (tables already owned
    by postgres from a prior run).

    RUNTIME_IAM_DB_USER is set by the content-deploy workflow to:
      backend-runtime-sa@<GCP_PROJECT_ID>.iam
    """
    from sqlalchemy import text

    iam_user = os.environ.get("RUNTIME_IAM_DB_USER", "").strip()
    if not iam_user:
        logger.info("RUNTIME_IAM_DB_USER not set — skipping privilege grant.")
        return

    logger.info(f"=== Step 1b: Granting runtime privileges to '{iam_user}' ===")
    async with engine.begin() as conn:
        await conn.execute(
            text(
                f"GRANT SELECT, INSERT, UPDATE, DELETE "
                f'ON ALL TABLES IN SCHEMA public TO "{iam_user}"'
            )
        )
        await conn.execute(
            text(
                f'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO "{iam_user}"'
            )
        )
        # Ensure future tables/sequences created by postgres also get the grants.
        await conn.execute(
            text(
                f"ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public "
                f'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "{iam_user}"'
            )
        )
        await conn.execute(
            text(
                f"ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public "
                f'GRANT USAGE, SELECT ON SEQUENCES TO "{iam_user}"'
            )
        )
    logger.info(f"Runtime privileges granted to '{iam_user}'.")


# ── Step 2: Seed courses + sections ──────────────────────────────────────────
async def seed_courses(session: AsyncSession) -> None:
    """Reuses discover_courses() and upsert_courses_and_sections() from seed_content.py.

    seed_content.py uses a sync SQLAlchemy Session, so we execute it via
    run_sync on the underlying async connection to stay within the same
    transaction managed by the async session.
    """
    logger.info("=== Step 2: Seeding courses and sections ===")

    # Import functions from the existing seed_content.py — no logic duplicated here.
    from seed_content import discover_courses, upsert_courses_and_sections
    from sqlalchemy.orm import Session as SyncSession

    courses = discover_courses()
    if not courses:
        logger.warning("No courses found — nothing to seed.")
        return

    def _upsert_sync(connection) -> None:
        with SyncSession(bind=connection) as sync_session:
            upsert_courses_and_sections(sync_session, courses)

    # run_sync bridges the async connection to the sync Session expected by seed_content
    conn = await session.connection()
    await conn.run_sync(_upsert_sync)

    logger.info(f"Seeded {len(courses)} course(s).")


# ── Step 3: Seed quizzes ──────────────────────────────────────────────────────
async def seed_quizzes(session: AsyncSession) -> None:
    logger.info("=== Step 3: Seeding quizzes ===")

    # Import from seed_quiz.py (same directory, already in sys.path)
    from seed_quiz import collect_quiz_files, parse_quiz_file
    from seed_quiz import seed_quizzes as _seed_quizzes

    quiz_files = collect_quiz_files()
    if not quiz_files:
        logger.warning("No quiz.json files found — skipping quiz seed.")
        return

    quiz_data_list: list[dict] = []
    for qf in quiz_files:
        data = parse_quiz_file(qf)
        if data is None:
            raise RuntimeError(f"Failed to parse quiz file: {qf}")
        quiz_data_list.append(data)

    success = await _seed_quizzes(quiz_data_list, session, dry_run=False)
    if not success:
        raise RuntimeError("Quiz seeding failed — check slug errors above.")

    logger.info(f"Seeded {len(quiz_data_list)} quiz file(s).")


# ── Main ──────────────────────────────────────────────────────────────────────
async def main() -> None:
    engine = _create_engine()
    try:
        # Migrations run outside a session (need raw connection)
        await apply_migrations(engine)
        await grant_runtime_privileges(engine)

        session_factory = async_sessionmaker(engine, expire_on_commit=False)

        # Content seeding — single transaction
        async with session_factory() as session:
            async with session.begin():
                await seed_courses(session)

        # Quiz seeding — separate transaction (requires courses to exist)
        async with session_factory() as session:
            async with session.begin():
                await seed_quizzes(session)

        logger.info("=== DB update completed successfully ===")

    except BaseException:
        # Use print+traceback as fallback: alembic's fileConfig() call in env.py
        # reconfigures logging with disable_existing_loggers=True, silencing our
        # logger after migrations start. stderr is always visible in Cloud Run logs.
        print("DB update failed:", file=sys.stderr, flush=True)
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        sys.exit(1)
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
