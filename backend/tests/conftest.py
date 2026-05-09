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
from datetime import datetime, timezone

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

settings.ENVIRONMENT = "testing"  # Force testing environment

from app.database import get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.models.courses import Course, Enrollment, Section, UserProgress  # noqa: E402
from app.models.quizzes import Quiz, QuizAttempt  # noqa: E402
from app.models.users import OAuthAccount, User  # noqa: E402
from app.services.jwt_service import create_access_token  # noqa: E402

_db_url: str = settings.DATABASE_URL
TEST_DATABASE_URL: str = os.getenv("TEST_DATABASE_URL", _db_url)

# Safety guard: prevent accidental runs against production DB
assert any(host in TEST_DATABASE_URL for host in ("localhost", "test", "db:")), (
    f"Refusing to run tests against non-test database: {TEST_DATABASE_URL}"
)


# ---------------------------------------------------------------------------
# Function-scoped connection with nested transaction (SAVEPOINT)
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


@pytest_asyncio.fixture(autouse=True)
async def setup_db_override(db_session: AsyncSession):
    """
    Tüm testler için get_db bağımlılığını db_session ile override eder.
    Bu sayede her fixture kendi AsyncClient'ını oluşturabilir.
    """

    async def _override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    yield
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    """Genel amaçlı AsyncClient."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    ) as ac:
        yield ac


# ---------------------------------------------------------------------------
# Test data & Auth
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
async def token_cookies(test_user: User) -> dict[str, str]:
    """
    Merkezi auth fixture'ı — Cookie bazlı (BE-26).

    Kullanım:
        resp = await client.get("/v1/endpoint", cookies=token_cookies)

    conftest içinde olduğu için db_session ile aynı transaction'ı paylaşır.
    """

    token = create_access_token(sub=str(test_user.id))
    return {settings.ACCESS_TOKEN_COOKIE_NAME: token}


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


# ---------------------------------------------------------------------------
# ADIM 1 Fixtures (BE-27)
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def user_a(db_session: AsyncSession) -> AsyncClient:
    """DB'ye kayıtlı kullanıcı A; httpOnly cookie'li client döner."""
    from app.services.jwt_service import create_access_token

    user = User(
        email="user_a@example.com",
        display_name="User A",
    )
    db_session.add(user)
    await db_session.flush()

    token = create_access_token(sub=str(user.id))
    client = AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    )
    client.cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}
    client.user = user  # Attach user for easy access in dependent fixtures/tests
    return client


@pytest_asyncio.fixture
async def user_b(db_session: AsyncSession) -> AsyncClient:
    """DB'ye kayıtlı kullanıcı B; FARKLI user_id, email, JWT."""
    from app.services.jwt_service import create_access_token

    user = User(
        email="user_b@example.com",
        display_name="User B",
    )
    db_session.add(user)
    await db_session.flush()

    token = create_access_token(sub=str(user.id))
    client = AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver",
    )
    client.cookies = {settings.ACCESS_TOKEN_COOKIE_NAME: token}
    client.user = user
    return client


@pytest_asyncio.fixture
async def course_a(db_session: AsyncSession, user_a: AsyncClient) -> Course:
    """user_a'nın kayıtlı kursu (enrollment + progress var)."""
    course = Course(
        slug="course-a",
        title="Course A",
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    # Enrollment
    enrollment = Enrollment(user_id=user_a.user.id, course_id=course.id)
    db_session.add(enrollment)

    # Progress (one section completed)
    section = Section(
        course_id=course.id,
        section_id_str="section-a-1",
        title="Section A1",
        order_index=1,
    )
    db_session.add(section)
    await db_session.flush()

    progress = UserProgress(
        user_id=user_a.user.id,
        section_id=section.id,
        completed=True,
    )
    db_session.add(progress)
    await db_session.flush()

    return course


@pytest_asyncio.fixture
async def course_b(db_session: AsyncSession, user_b: AsyncClient) -> Course:
    """user_b'nin kayıtlı kursu (user_a kayıtsız)."""
    course = Course(
        slug="course-b",
        title="Course B",
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    # Enrollment for user_b
    enrollment = Enrollment(user_id=user_b.user.id, course_id=course.id)
    db_session.add(enrollment)
    await db_session.flush()

    return course


@pytest_asyncio.fixture
async def enrollment_b(
    db_session: AsyncSession, user_b: AsyncClient, course_b: Course
) -> Enrollment:
    """user_b -> course_b enrollment kaydı."""
    # Enrollment is already created in course_b fixture, but we might need to return it
    result = await db_session.execute(
        select(Enrollment).where(
            Enrollment.user_id == user_b.user.id, Enrollment.course_id == course_b.id
        )
    )
    return result.scalar_one()


@pytest_asyncio.fixture
async def section_b(
    db_session: AsyncSession, user_b: AsyncClient, course_b: Course
) -> Section:
    """course_b'nin bir section'ı; user_b tamamladı."""
    section = Section(
        course_id=course_b.id,
        section_id_str="section-b-1",
        title="Section B1",
        order_index=1,
    )
    db_session.add(section)
    await db_session.flush()

    progress = UserProgress(
        user_id=user_b.user.id,
        section_id=section.id,
        completed=True,
    )
    db_session.add(progress)
    await db_session.flush()

    return section


@pytest_asyncio.fixture
async def quiz_b(db_session: AsyncSession, course_b: Course) -> Quiz:
    """course_b'ye ait quiz (quizzes tablosunda)."""
    from app.models.quizzes import Question

    quiz = Quiz(
        course_id=course_b.id,
        duration_seconds=1800,
    )
    db_session.add(quiz)
    await db_session.flush()

    # Add at least one active question to make the quiz valid for attempts
    question = Question(
        quiz_id=quiz.id,
        text="Sample Question?",
        options=[{"index": 0, "text": "Option A"}, {"index": 1, "text": "Option B"}],
        correct_index=0,
        order_index=1,
        is_active=True,
    )
    db_session.add(question)
    await db_session.flush()

    return quiz


@pytest_asyncio.fixture
async def attempt_b_open(
    db_session: AsyncSession, user_b: AsyncClient, quiz_b: Quiz
) -> QuizAttempt:
    """user_b'nin tamamlanmamış attempt'i (submitted_at=NULL)."""
    attempt = QuizAttempt(
        user_id=user_b.user.id,
        quiz_id=quiz_b.id,
        started_at=datetime.now(timezone.utc),
        submitted_at=None,
    )
    db_session.add(attempt)
    await db_session.flush()
    return attempt


@pytest_asyncio.fixture
async def oauth_account_b(
    db_session: AsyncSession, user_b: AsyncClient
) -> OAuthAccount:
    """user_b'ye ait oauth_accounts kaydı."""
    oauth = OAuthAccount(
        user_id=user_b.user.id,
        provider="google",
        provider_user_id="google-user-b",
        provider_email=user_b.user.email,
    )
    db_session.add(oauth)
    await db_session.flush()
    return oauth
