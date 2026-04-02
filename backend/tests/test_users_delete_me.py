import uuid
from datetime import datetime, timezone

import pytest
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import User
from app.services.jwt_service import create_access_token


async def _seed_user_related_data(db_session: AsyncSession, user: User):
    course_id = uuid.uuid4()
    section_id = uuid.uuid4()
    quiz_id = uuid.uuid4()
    question_id = uuid.uuid4()
    attempt_id = uuid.uuid4()

    # NOTE: We intentionally seed these rows with raw SQL because current
    # ORM models include updated_at for some tables, while the DB schema
    # used in tests does not.
    await db_session.execute(
        text(
            """
            INSERT INTO courses (id, slug, title, is_published, created_at)
            VALUES (:id, :slug, :title, true, NOW())
            """
        ),
        {
            "id": str(course_id),
            "slug": f"delete-test-course-{course_id}",
            "title": "Delete Test Course",
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO sections (
                id, course_id, section_id_str, title, order_index, created_at
            )
            VALUES (:id, :course_id, :section_id_str, :title, :order_index, NOW())
            """
        ),
        {
            "id": str(section_id),
            "course_id": str(course_id),
            "section_id_str": f"delete-test-section-{section_id}",
            "title": "Delete Test Section",
            "order_index": 1,
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO enrollments (
                id, user_id, course_id, enrolled_at, progress_percent
            )
            VALUES (:id, :user_id, :course_id, NOW(), 0.00)
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "user_id": str(user.id),
            "course_id": str(course_id),
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO user_progress (id, user_id, section_id, completed, completed_at)
            VALUES (:id, :user_id, :section_id, true, NOW())
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "user_id": str(user.id),
            "section_id": str(section_id),
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO quizzes (
                id, course_id, pass_threshold, duration_seconds, created_at
            )
            VALUES (:id, :course_id, 0.70, 1200, NOW())
            """
        ),
        {
            "id": str(quiz_id),
            "course_id": str(course_id),
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO questions (
                id, quiz_id, text, options, correct_index, explanation, order_index
            )
            VALUES (:id, :quiz_id, :text, CAST(:options AS jsonb), 0, NULL, 1)
            """
        ),
        {
            "id": str(question_id),
            "quiz_id": str(quiz_id),
            "text": "Test question?",
            "options": '[{"index": 0, "text": "A"}, {"index": 1, "text": "B"}]',
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO quiz_attempts (id, user_id, quiz_id, started_at)
            VALUES (:id, :user_id, :quiz_id, :started_at)
            """
        ),
        {
            "id": str(attempt_id),
            "user_id": str(user.id),
            "quiz_id": str(quiz_id),
            "started_at": datetime.now(timezone.utc),
        },
    )
    await db_session.execute(
        text(
            """
            INSERT INTO quiz_attempt_answers (
                id, attempt_id, question_id, selected_index, is_correct
            )
            VALUES (:id, :attempt_id, :question_id, 0, true)
            """
        ),
        {
            "id": str(uuid.uuid4()),
            "attempt_id": str(attempt_id),
            "question_id": str(question_id),
        },
    )

    return {
        "attempt_id": attempt_id,
    }


@pytest.mark.asyncio
async def test_delete_me_wrong_confirmation_returns_400(
    client: AsyncClient, test_user: User
):
    access_token = create_access_token(sub=str(test_user.id))
    headers = {"Authorization": f"Bearer {access_token}"}

    response = await client.request(
        "DELETE",
        "/v1/users/me",
        json={"confirmation": "WRONG TEXT"},
        headers=headers,
    )

    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_delete_me_success_hard_deletes_and_audit_logs(
    client: AsyncClient,
    db_session: AsyncSession,
    test_user: User,
):
    seeded = await _seed_user_related_data(db_session, test_user)

    access_token = create_access_token(sub=str(test_user.id))
    headers = {"Authorization": f"Bearer {access_token}"}

    response = await client.request(
        "DELETE",
        "/v1/users/me",
        json={"confirmation": "HESABIMI SİL"},
        headers=headers,
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    users_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM users WHERE id = :user_id"),
        {"user_id": str(test_user.id)},
    )
    oauth_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM oauth_accounts WHERE user_id = :user_id"),
        {"user_id": str(test_user.id)},
    )
    enrollments_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM enrollments WHERE user_id = :user_id"),
        {"user_id": str(test_user.id)},
    )
    progress_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM user_progress WHERE user_id = :user_id"),
        {"user_id": str(test_user.id)},
    )
    attempts_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM quiz_attempts WHERE user_id = :user_id"),
        {"user_id": str(test_user.id)},
    )
    answers_count = await db_session.scalar(
        text(
            "SELECT COUNT(*) FROM quiz_attempt_answers "
            "WHERE attempt_id = :attempt_id"
        ),
        {"attempt_id": str(seeded["attempt_id"])},
    )
    audit_count = await db_session.scalar(
        text("SELECT COUNT(*) FROM deleted_accounts WHERE user_id = :user_id"),
        {"user_id": str(test_user.id)},
    )

    assert users_count == 0
    assert oauth_count == 0
    assert enrollments_count == 0
    assert progress_count == 0
    assert attempts_count == 0
    assert answers_count == 0
    assert audit_count == 1
