"""
Pytest test infrastructure — LearnOps Backend

Transaction isolation strategy:
- Each test runs inside a SAVEPOINT (nested transaction).
- The outer transaction is never committed — rolled back after each test.
- This means router-level db.commit() calls are neutralized:
  SQLAlchemy translates commit() to RELEASE SAVEPOINT inside a nested transaction,
  which does NOT actually commit to DB. The outer rollback cleans everything up.
+ Tests are safe to run in parallel thanks to SAVEPOINT isolation.
+ Using unique IDs (_random_user_id()) adds an additional safety layer.

No separate test DB needed — SAVEPOINT isolation handles cleanup.
Tests run against the same DB as development (see strategy above).

Run tests:
     docker compose exec backend poetry run pytest
     docker compose exec backend poetry run pytest -n auto  # Parallel run
"""

import os

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings
from app.database import get_db
from app.main import app
from app.models.courses import Course, Section
from app.models.users import OAuthAccount, User

_db_url: str = settings.DATABASE_URL
TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", _db_url)

# Safety guard: prevent accidental runs against production DB
assert any(host in TEST_DATABASE_URL for host in ("localhost", "test", "db:")), (
    f"Refusing to run tests against non-test database: {TEST_DATABASE_URL}"
)


# ---------------------------------------------------------------------------
# Function-scoped connection with nested transaction (SAVEPOINT)
# Rollback after each test — commit() in router becomes RELEASE SAVEPOINT,
# which does NOT persist. Outer rollback cleans all test data.
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def connection():
    engine = create_async_engine(TEST_DATABASE_URL)
    async with engine.connect() as conn:
        await conn.begin()
        yield conn
        await conn.rollback()
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(connection: AsyncConnection) -> AsyncSession:
    """
    Session bound to the outer transaction connection.
    Uses nested=True so that commit() inside service/router
    becomes SAVEPOINT RELEASE (no actual DB commit).
    """
    session_factory = async_sessionmaker(
        bind=connection,
        class_=AsyncSession,
        expire_on_commit=False,
        join_transaction_mode="create_savepoint",
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Test data
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """
    Persisted User with one linked Google OAuth account.
    Visible within session via flush(). Rolled back after test.
    """
    user = User(
        email="testuser@example.com",
        display_name="Test User",
    )
    db_session.add(user)
    await db_session.flush()

    oauth = OAuthAccount(
        user_id=user.id,
        provider="google",
        provider_user_id="google-existing-123",
        provider_email="testuser@example.com",
    )
    db_session.add(oauth)
    await db_session.flush()

    return user


@pytest_asyncio.fixture
async def test_course(db_session: AsyncSession) -> Course:
    """Published course with two sections. Rolled back after test."""
    course = Course(
        slug="python-temelleri",
        title="Python Temelleri",
        category="programlama",
        difficulty="beginner",
        duration_minutes=120,
        display_order=1,
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    sections = [
        Section(
            course_id=course.id,
            section_id_str="python-001-giris",
            title="Giriş",
            order_index=1,
        ),
        Section(
            course_id=course.id,
            section_id_str="python-002-degiskenler",
            title="Değişkenler",
            order_index=2,
        ),
    ]
    db_session.add_all(sections)
    await db_session.flush()

    return course


@pytest_asyncio.fixture
async def test_unpublished_course(db_session: AsyncSession) -> Course:
    """Draft (is_published=False) course — must not appear in public API."""
    course = Course(
        slug="gizli-kurs",
        title="Gizli Kurs",
        category="programlama",
        difficulty="beginner",
        is_published=False,
    )
    db_session.add(course)
    await db_session.flush()

    return course
