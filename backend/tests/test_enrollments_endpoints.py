import pytest
from httpx import AsyncClient
from sqlalchemy import select

from app.models.courses import Enrollment
from app.services.jwt_service import create_access_token


def _auth_cookies(user_id: str) -> dict[str, str]:
    token = create_access_token(sub=user_id)
    return {"access_token": token}


@pytest.mark.asyncio
async def test_post_enrollments_creates_enrollment(
    client: AsyncClient,
    db_session,
    test_user,
    test_course,
):
    resp = await client.post(
        "/v1/enrollments",
        json={"course_id": str(test_course.id)},
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 201
    data = resp.json()
    assert data["course_id"] == str(test_course.id)
    assert data["progress_percent"] == 0.0
    assert data["course"]["slug"] == test_course.slug
    assert data["course"]["title"] == test_course.title

    enrollment = await db_session.scalar(
        select(Enrollment).where(
            Enrollment.user_id == test_user.id,
            Enrollment.course_id == test_course.id,
        )
    )
    assert enrollment is not None


@pytest.mark.asyncio
async def test_post_enrollments_duplicate_returns_409(
    client: AsyncClient,
    db_session,
    test_user,
    test_course,
):
    db_session.add(
        Enrollment(
            user_id=test_user.id,
            course_id=test_course.id,
            progress_percent=0.00,
        )
    )
    await db_session.flush()

    resp = await client.post(
        "/v1/enrollments",
        json={"course_id": str(test_course.id)},
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 409
    assert resp.json()["detail"] == "User is already enrolled in this course"


@pytest.mark.asyncio
async def test_post_enrollments_course_not_found_returns_404(
    client: AsyncClient,
    test_user,
):
    resp = await client.post(
        "/v1/enrollments",
        json={"course_id": "11111111-1111-1111-1111-111111111111"},
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Course not found"


@pytest.mark.asyncio
async def test_post_enrollments_unpublished_course_returns_404(
    client: AsyncClient,
    test_user,
    test_unpublished_course,
):
    resp = await client.post(
        "/v1/enrollments",
        json={"course_id": str(test_unpublished_course.id)},
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 404
    assert resp.json()["detail"] == "Course not found"


@pytest.mark.asyncio
async def test_get_enrollments_returns_user_enrollments(
    client: AsyncClient,
    db_session,
    test_user,
    test_course,
):
    db_session.add(
        Enrollment(
            user_id=test_user.id,
            course_id=test_course.id,
            progress_percent=25.00,
        )
    )
    await db_session.flush()

    resp = await client.get(
        "/v1/enrollments",
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert len(data["items"]) == 1
    assert data["items"][0]["course_id"] == str(test_course.id)
    assert data["items"][0]["progress_percent"] == 25.0
    assert data["items"][0]["course"]["slug"] == test_course.slug


@pytest.mark.asyncio
async def test_get_enrollments_returns_empty_list(
    client: AsyncClient,
    test_user,
):
    resp = await client.get(
        "/v1/enrollments",
        cookies=_auth_cookies(str(test_user.id)),
    )

    assert resp.status_code == 200
    assert resp.json() == {"items": []}


@pytest.mark.asyncio
async def test_get_enrollments_requires_auth(client: AsyncClient):
    resp = await client.get("/v1/enrollments")
    assert resp.status_code == 401
