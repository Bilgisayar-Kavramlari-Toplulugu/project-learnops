"""Tests for progress endpoints and service."""

from datetime import datetime

import pytest

from app.models.courses import Course, Enrollment, Section
from app.services.jwt_service import create_access_token


def _auth_cookies(user) -> dict:
    token = create_access_token(sub=str(user.id))
    return {"access_token": token}


@pytest.fixture
async def test_course(db_session):
    """Create a test course with sections."""
    course = Course(
        slug="test-course-123",
        title="Test Course",
        description="A test course",
    )
    db_session.add(course)
    await db_session.flush()

    # Create 3 sections
    sections = []
    for i in range(1, 4):
        section = Section(
            course_id=course.id,
            section_id_str=f"section-{i}",
            title=f"Section {i}",
            order_index=i,
        )
        db_session.add(section)
        sections.append(section)
    await db_session.flush()

    return course, sections


@pytest.fixture
async def enrolled_user(db_session, test_user, test_course):
    """Enroll test user in test course."""
    course, sections = test_course
    enrollment = Enrollment(
        user_id=test_user.id,
        course_id=course.id,
        progress_percent=0.0,
    )
    db_session.add(enrollment)
    await db_session.flush()
    return test_user, course, sections, enrollment


@pytest.mark.asyncio
class TestProgressEndpoints:
    """Test progress-related endpoints."""

    async def test_complete_section_success(self, client, enrolled_user):
        """Test completing a section successfully."""
        user, course, sections, enrollment = enrolled_user

        # Complete first section
        response = await client.post(
            f"/v1/progress/sections/{sections[0].section_id_str}/complete",
            cookies=_auth_cookies(user),
        )

        assert response.status_code == 200
        data = response.json()
        assert data["course_id"] == str(course.id)
        assert data["section_id_str"] == sections[0].section_id_str
        assert data["progress_percent"] == 33.33  # 1/3 completed
        assert data["completed"] is True
        assert data["course_completed_at"] is None

    async def test_complete_section_idempotent(self, client, enrolled_user):
        """Test completing the same section twice is idempotent."""
        user, course, sections, enrollment = enrolled_user

        # Complete section first time
        response1 = await client.post(
            f"/v1/progress/sections/{sections[0].section_id_str}/complete",
            cookies=_auth_cookies(user),
        )
        assert response1.status_code == 200

        # Complete same section second time
        response2 = await client.post(
            f"/v1/progress/sections/{sections[0].section_id_str}/complete",
            cookies=_auth_cookies(user),
        )
        assert response2.status_code == 200

        # Should be the same result
        assert response1.json() == response2.json()

    async def test_complete_section_not_enrolled(self, client, test_user, test_course):
        """Test completing section when user is not enrolled."""
        course, sections = test_course

        response = await client.post(
            f"/v1/progress/sections/{sections[0].section_id_str}/complete",
            cookies=_auth_cookies(test_user),
        )

        assert response.status_code == 400
        assert "kayıtlı değil" in response.json()["detail"].lower()

    async def test_complete_section_not_found(self, client, enrolled_user):
        """Test completing a non-existent section."""
        user, course, sections, enrollment = enrolled_user

        response = await client.post(
            "/v1/progress/sections/non-existent-section/complete",
            cookies=_auth_cookies(user),
        )

        assert response.status_code == 404
        assert "bulunamadı" in response.json()["detail"].lower()

    async def test_complete_all_sections_course_completion(
        self, client, enrolled_user, db_session
    ):
        """Test that completing all sections marks course as completed."""
        user, course, sections, enrollment = enrolled_user

        # Complete all sections
        for section in sections:
            response = await client.post(
                f"/v1/progress/sections/{section.section_id_str}/complete",
                cookies=_auth_cookies(user),
            )
            assert response.status_code == 200

        # Check final response
        final_data = response.json()
        assert final_data["progress_percent"] == 100.0
        assert final_data["course_completed_at"] is not None

        # Verify in database
        await db_session.refresh(enrollment)
        assert enrollment.completed_at is not None
        assert isinstance(enrollment.completed_at, datetime)
        assert enrollment.progress_percent == 100.0