"""Tests for GET /v1/courses and GET /v1/courses/{slug} endpoints (BE-14)

Acceptance criteria covered:
- is_published=False courses are not listed
- Filtering by category, difficulty, q works
- Response is ordered by display_order ASC NULLS LAST
- Slug not found returns 404
- Endpoints are public (no auth required)
"""

import pytest
from httpx import AsyncClient

from app.models.courses import Course

# ==================== GET /v1/courses ====================


@pytest.mark.asyncio
async def test_list_courses_no_auth_required(client: AsyncClient, test_course: Course):
    """Public endpoint — token olmadan erişilebilmeli."""
    resp = await client.get("/v1/courses")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_list_courses_returns_published_only(
    client: AsyncClient,
    test_course: Course,
    test_unpublished_course: Course,
):
    """is_published=False kurslar listelenmemeli."""
    resp = await client.get("/v1/courses")
    assert resp.status_code == 200
    slugs = [item["slug"] for item in resp.json()["items"]]
    assert test_course.slug in slugs
    assert test_unpublished_course.slug not in slugs


@pytest.mark.asyncio
async def test_list_courses_response_shape(client: AsyncClient, test_course: Course):
    """Response body items, page, limit, total alanlarını içermeli."""
    resp = await client.get("/v1/courses")
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "page" in data
    assert "limit" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_list_courses_item_fields(client: AsyncClient, test_course: Course):
    """Her item slug, title, category, difficulty, duration_minutes içermeli."""
    resp = await client.get("/v1/courses")
    assert resp.status_code == 200
    item = next(i for i in resp.json()["items"] if i["slug"] == test_course.slug)
    assert item["slug"] == test_course.slug
    assert item["title"] == test_course.title
    assert item["category"] == test_course.category
    assert item["difficulty"] == test_course.difficulty
    assert item["duration_minutes"] == test_course.duration_minutes


@pytest.mark.asyncio
async def test_list_courses_filter_by_category(
    client: AsyncClient, test_course: Course, db_session
):
    """category filtresi yalnızca eşleşen kursları döndürmeli."""
    other = Course(
        slug="web-giris",
        title="Web Girişi",
        category="web",
        difficulty="beginner",
        is_published=True,
    )
    db_session.add(other)
    await db_session.flush()

    resp = await client.get("/v1/courses", params={"category": "programlama"})
    assert resp.status_code == 200
    slugs = [i["slug"] for i in resp.json()["items"]]
    assert test_course.slug in slugs
    assert other.slug not in slugs


@pytest.mark.asyncio
async def test_list_courses_filter_by_difficulty(
    client: AsyncClient, test_course: Course, db_session
):
    """difficulty filtresi yalnızca eşleşen kursları döndürmeli."""
    advanced = Course(
        slug="ileri-python",
        title="İleri Python",
        category="programlama",
        difficulty="advanced",
        is_published=True,
    )
    db_session.add(advanced)
    await db_session.flush()

    resp = await client.get("/v1/courses", params={"difficulty": "beginner"})
    assert resp.status_code == 200
    slugs = [i["slug"] for i in resp.json()["items"]]
    assert test_course.slug in slugs
    assert advanced.slug not in slugs


@pytest.mark.asyncio
async def test_list_courses_filter_by_q(client: AsyncClient, test_course: Course):
    """q parametresi başlıkta büyük/küçük harf duyarsız arama yapmalı."""
    resp = await client.get("/v1/courses", params={"q": "python"})
    assert resp.status_code == 200
    slugs = [i["slug"] for i in resp.json()["items"]]
    assert test_course.slug in slugs


@pytest.mark.asyncio
async def test_list_courses_q_no_match_returns_empty(
    client: AsyncClient, test_course: Course
):
    """Eşleşmeyen q parametresi boş liste döndürmeli."""
    resp = await client.get("/v1/courses", params={"q": "zzznomatch"})
    assert resp.status_code == 200
    assert resp.json()["items"] == []
    assert resp.json()["total"] == 0


@pytest.mark.asyncio
async def test_list_courses_pagination(client: AsyncClient, db_session):
    """limit ve page parametreleri doğru çalışmalı."""
    for i in range(5):
        db_session.add(
            Course(
                slug=f"kurs-{i}",
                title=f"Kurs {i}",
                is_published=True,
                display_order=i + 1,
            )
        )
    await db_session.flush()

    resp = await client.get("/v1/courses", params={"limit": 2, "page": 1})
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["limit"] == 2
    assert data["total"] >= 5


@pytest.mark.asyncio
async def test_list_courses_display_order_asc_nulls_last(
    client: AsyncClient, db_session
):
    """Kurslar display_order ASC sıralı gelmeli; NULL'lar sona düşmeli."""
    db_session.add_all(
        [
            Course(
                slug="order-null",
                title="NULL Order",
                is_published=True,
                display_order=None,
            ),
            Course(slug="order-2", title="Order 2", is_published=True, display_order=2),
            Course(slug="order-1", title="Order 1", is_published=True, display_order=1),
        ]
    )
    await db_session.flush()

    resp = await client.get("/v1/courses", params={"limit": 100})
    assert resp.status_code == 200
    items = resp.json()["items"]

    slugs_with_order = [
        i["slug"] for i in items if i["slug"] in ("order-1", "order-2", "order-null")
    ]
    assert slugs_with_order == ["order-1", "order-2", "order-null"]


# ==================== GET /v1/courses/{slug} ====================


@pytest.mark.asyncio
async def test_get_course_no_auth_required(client: AsyncClient, test_course: Course):
    """Public endpoint — token olmadan erişilebilmeli."""
    resp = await client.get(f"/v1/courses/{test_course.slug}")
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_course_returns_detail(client: AsyncClient, test_course: Course):
    """Geçerli slug → 200 ve kurs detayı dönmeli."""
    resp = await client.get(f"/v1/courses/{test_course.slug}")
    assert resp.status_code == 200
    data = resp.json()
    assert data["slug"] == test_course.slug
    assert data["title"] == test_course.title
    assert data["category"] == test_course.category
    assert data["difficulty"] == test_course.difficulty


@pytest.mark.asyncio
async def test_get_course_includes_sections(client: AsyncClient, test_course: Course):
    """Kurs detayı sections listesini içermeli."""
    resp = await client.get(f"/v1/courses/{test_course.slug}")
    assert resp.status_code == 200
    data = resp.json()
    assert "sections" in data
    assert len(data["sections"]) == 2
    assert data["sections"][0]["order_index"] == 1
    assert data["sections"][1]["order_index"] == 2


@pytest.mark.asyncio
async def test_get_course_invalid_slug_returns_404(client: AsyncClient):
    """Geçersiz slug → 404 dönmeli."""
    resp = await client.get("/v1/courses/var-olmayan-kurs")
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_get_course_unpublished_returns_404(
    client: AsyncClient, test_unpublished_course: Course
):
    """is_published=False kurs slug ile aransın → 404 dönmeli."""
    resp = await client.get(f"/v1/courses/{test_unpublished_course.slug}")
    assert resp.status_code == 404
