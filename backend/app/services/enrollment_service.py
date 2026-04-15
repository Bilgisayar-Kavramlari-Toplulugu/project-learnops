from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Course, Enrollment


async def get_published_course_by_id(
    db: AsyncSession,
    course_id: UUID,
) -> Optional[Course]:
    query = select(Course).where(
        Course.id == course_id,
        Course.is_published == True,  # noqa: E712
    )
    return await db.scalar(query)


async def get_user_enrollment_for_course(
    db: AsyncSession,
    user_id: UUID,
    course_id: UUID,
) -> Optional[Enrollment]:
    query = select(Enrollment).where(
        Enrollment.user_id == user_id,
        Enrollment.course_id == course_id,
    )
    return await db.scalar(query)


async def create_enrollment(
    db: AsyncSession,
    user_id: UUID,
    course_id: UUID,
) -> Enrollment:
    enrollment = Enrollment(
        user_id=user_id,
        course_id=course_id,
        progress_percent=0.00,
    )
    db.add(enrollment)

    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise ValueError("duplicate_enrollment")

    await db.refresh(enrollment)
    enrollment_with_course = await db.scalar(
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .where(Enrollment.id == enrollment.id)
    )
    return enrollment_with_course or enrollment


async def list_user_enrollments(
    db: AsyncSession,
    user_id: UUID,
) -> List[Enrollment]:
    query = (
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .join(Course, Enrollment.course_id == Course.id)
        .where(
            Enrollment.user_id == user_id,
            Course.is_published == True,  # noqa: E712
        )
        .order_by(Enrollment.enrolled_at.desc())
    )

    result = await db.scalars(query)
    return list(result.all())
