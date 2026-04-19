"""Tests for GET /v1/enrollments/{course_id}/progress (BE-17)

Acceptance criteria covered:
- Auth gerekli: token olmadan 401 döner
- Enrollment yoksa 404 döner
- Başarılı istek: 200, doğru response shape
- sections sırası order_index'e göre ASC olmalı
- UserProgress kaydı yokken completed=False varsayılmalı
- UserProgress kaydı varken completed değeri doğru yansıtılmalı
- Kısmi tamamlama: sadece bazı section'lar completed=True
- progress_percent enrollment kaydındaki değeri döndürmeli
- completed_at None ve dolu her iki durumda da çalışmalı
"""

import uuid
from datetime import datetime, timezone
from typing import NamedTuple

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.deps import get_current_user
from app.main import app
from app.models.courses import Course, Enrollment, Section, UserProgress
from app.models.users import User


class CourseWithSections(NamedTuple):
    """two_section_course fixture'ının döndürdüğü veri kapsülü."""

    course: Course
    section1: Section
    section2: Section


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_FAKE_USER_ID = str(uuid.uuid4())


def _auth_header(user_id: str = _FAKE_USER_ID) -> dict:
    """get_current_user override ile uyumlu; header değeri önemli değil."""
    return {"Authorization": f"Bearer fake-token-for-{user_id}"}


def _override_auth(user_id: str = _FAKE_USER_ID):
    """get_current_user bağımlılığını verilen user_id döndürecek şekilde
    override eder."""

    def _dep() -> str:
        return user_id

    return _dep


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
async def enrolled_user(db_session: AsyncSession) -> User:
    """Enrollment testleri için ayrı bir kullanıcı — test_user ile çakışmasın."""
    user = User(
        email=f"enroll-{uuid.uuid4().hex[:8]}@example.com",
        display_name="Enrollment Test User",
    )
    db_session.add(user)
    await db_session.flush()
    return user


@pytest.fixture
async def two_section_course(db_session: AsyncSession) -> CourseWithSections:
    """İki section'lı yayınlanmış test kursu + section nesneleri.

    Relationship yerine explicit Section nesneleri döndürür;
    async lazy-load hatasını önler.
    """
    course = Course(
        slug=f"enrollment-test-{uuid.uuid4().hex[:6]}",
        title="Enrollment Test Kursu",
        category="test",
        difficulty="beginner",
        duration_minutes=60,
        display_order=99,
        is_published=True,
    )
    db_session.add(course)
    await db_session.flush()

    s1 = Section(
        course_id=course.id,
        section_id_str=f"enroll-s1-{course.id.hex[:6]}",
        title="Bölüm 1",
        order_index=1,
    )
    s2 = Section(
        course_id=course.id,
        section_id_str=f"enroll-s2-{course.id.hex[:6]}",
        title="Bölüm 2",
        order_index=2,
    )
    db_session.add_all([s1, s2])
    await db_session.flush()

    return CourseWithSections(course=course, section1=s1, section2=s2)


@pytest.fixture
async def enrollment(
    db_session: AsyncSession,
    enrolled_user: User,
    two_section_course: CourseWithSections,
) -> Enrollment:
    """enrolled_user için two_section_course.course'a enrollment kaydı."""
    enr = Enrollment(
        user_id=enrolled_user.id,
        course_id=two_section_course.course.id,
        progress_percent=0.00,
    )
    db_session.add(enr)
    await db_session.flush()
    return enr


# ---------------------------------------------------------------------------
# Auth tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_requires_auth(
    client: AsyncClient, two_section_course: CourseWithSections
):
    """Token olmadan istek → 401."""
    resp = await client.get(f"/v1/enrollments/{two_section_course.course.id}/progress")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_progress_invalid_token_returns_401(
    client: AsyncClient, two_section_course: CourseWithSections
):
    """Geçersiz/sahte token → 401 (gerçek auth akışı)."""
    resp = await client.get(
        f"/v1/enrollments/{two_section_course.course.id}/progress",
        headers={"Authorization": "Bearer invalid.token.here"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_progress_accessible_via_cookie(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """access_token çerezi ile Bearer header olmadan ilerleme alınabilmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
            # Authorization header yok, sadece çerez
            cookies={"access_token": "fake-cookie-token"},
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)
    assert resp.status_code == 200


# ---------------------------------------------------------------------------
# 404 tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_no_enrollment_returns_404(
    client: AsyncClient,
    two_section_course: CourseWithSections,
    enrolled_user: User,
):
    """Kullanıcının enrollment kaydı yoksa → 404."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 404
    assert "bulunamadı" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_progress_nonexistent_course_returns_404(
    client: AsyncClient,
    enrolled_user: User,
):
    """Var olmayan course_id → enrollment bulunamaz → 404."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    fake_id = uuid.uuid4()
    try:
        resp = await client.get(f"/v1/enrollments/{fake_id}/progress")
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# Happy path — response shape
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_returns_200_with_enrollment(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Enrollment varsa → 200."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_progress_response_shape(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Response body beklenen alanları içermeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    data = resp.json()
    assert "course_id" in data
    assert "progress_percent" in data
    assert "completed_at" in data
    assert "sections" in data
    assert isinstance(data["sections"], list)


@pytest.mark.asyncio
async def test_progress_sections_count(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """sections listesi kursun section sayısıyla eşleşmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert len(resp.json()["sections"]) == 2


@pytest.mark.asyncio
async def test_progress_section_fields(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Her section öğesi section_id_str, title, order_index, completed içermeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    section = resp.json()["sections"][0]
    assert "section_id_str" in section
    assert "title" in section
    assert "order_index" in section
    assert "completed" in section


# ---------------------------------------------------------------------------
# Ordering
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_sections_ordered_by_order_index(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """sections listesi order_index ASC sıralı gelmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    order_indices = [s["order_index"] for s in resp.json()["sections"]]
    assert order_indices == sorted(order_indices)


# ---------------------------------------------------------------------------
# Completion logic
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_no_user_progress_all_false(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """UserProgress kaydı olmayan section'lar completed=False dönmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert all(s["completed"] is False for s in resp.json()["sections"])


@pytest.mark.asyncio
async def test_progress_completed_section_returns_true(
    client: AsyncClient,
    db_session: AsyncSession,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """completed=True olan UserProgress kaydı varsa o section True dönmeli."""
    user_prog = UserProgress(
        user_id=enrolled_user.id,
        section_id=two_section_course.section1.id,
        completed=True,
        completed_at=datetime.now(timezone.utc),
    )
    db_session.add(user_prog)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    sections = resp.json()["sections"]
    # order_index=1 → completed True, order_index=2 → completed False
    s1 = next(s for s in sections if s["order_index"] == 1)
    s2 = next(s for s in sections if s["order_index"] == 2)
    assert s1["completed"] is True
    assert s2["completed"] is False


@pytest.mark.asyncio
async def test_progress_all_sections_completed(
    client: AsyncClient,
    db_session: AsyncSession,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Tüm section'lar tamamlanmışsa hepsinin completed=True dönmeli."""
    now = datetime.now(timezone.utc)
    for section in (two_section_course.section1, two_section_course.section2):
        db_session.add(
            UserProgress(
                user_id=enrolled_user.id,
                section_id=section.id,
                completed=True,
                completed_at=now,
            )
        )
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert all(s["completed"] is True for s in resp.json()["sections"])


@pytest.mark.asyncio
async def test_progress_incomplete_user_progress_record(
    client: AsyncClient,
    db_session: AsyncSession,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """completed=False olan UserProgress kaydı da False dönmeli (logic doğrulama)."""
    db_session.add(
        UserProgress(
            user_id=enrolled_user.id,
            section_id=two_section_course.section1.id,
            completed=False,  # kayıt var ama tamamlanmamış
        )
    )
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    s1 = next(s for s in resp.json()["sections"] if s["order_index"] == 1)
    assert s1["completed"] is False


# ---------------------------------------------------------------------------
# progress_percent & completed_at
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_percent_reflects_enrollment(
    client: AsyncClient,
    db_session: AsyncSession,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """progress_percent enrollment kaydındaki değeri döndürmeli."""
    enr = Enrollment(
        user_id=enrolled_user.id,
        course_id=two_section_course.course.id,
        progress_percent=50.00,
    )
    db_session.add(enr)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert resp.json()["progress_percent"] == pytest.approx(50.0)


@pytest.mark.asyncio
async def test_progress_completed_at_none_when_not_finished(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Kurs bitmemişse completed_at None dönmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert resp.json()["completed_at"] is None


@pytest.mark.asyncio
async def test_progress_completed_at_set_when_finished(
    client: AsyncClient,
    db_session: AsyncSession,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """completed_at set edilmişse response'da dolu gelmelidir."""
    finish_time = datetime(2026, 1, 15, 10, 30, 0, tzinfo=timezone.utc)
    enr = Enrollment(
        user_id=enrolled_user.id,
        course_id=two_section_course.course.id,
        progress_percent=100.00,
        completed_at=finish_time,
    )
    db_session.add(enr)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert resp.json()["completed_at"] is not None


@pytest.mark.asyncio
async def test_progress_course_id_in_response(
    client: AsyncClient,
    enrollment: Enrollment,
    enrolled_user: User,
    two_section_course: CourseWithSections,
):
    """Response'daki course_id path parametresindeki kurs ID'siyle eşleşmeli."""
    app.dependency_overrides[get_current_user] = _override_auth(str(enrolled_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 200
    assert resp.json()["course_id"] == str(two_section_course.course.id)


# ---------------------------------------------------------------------------
# Isolation: başka kullanıcının enrollment'ı görünmemeli
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_progress_other_user_cannot_see_enrollment(
    client: AsyncClient,
    db_session: AsyncSession,
    enrollment: Enrollment,  # enrolled_user'ın enrollment'ı
    two_section_course: CourseWithSections,
):
    """Başka bir kullanıcı aynı kursu sorgulasa → enrollment bulunamaz → 404."""
    other_user = User(
        email=f"other-{uuid.uuid4().hex[:8]}@example.com",
        display_name="Other User",
    )
    db_session.add(other_user)
    await db_session.flush()

    app.dependency_overrides[get_current_user] = _override_auth(str(other_user.id))
    try:
        resp = await client.get(
            f"/v1/enrollments/{two_section_course.course.id}/progress",
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert resp.status_code == 404
