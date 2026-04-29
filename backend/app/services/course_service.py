from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Course


async def get_courses(
    db: AsyncSession,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    q: Optional[str] = None,
    page: int = 1,
    limit: int = 10,
) -> Tuple[List[Course], int]:

    base_query = select(Course).where(Course.is_published == True)  # noqa: E712

    if category:
        base_query = base_query.where(Course.category == category)

    if difficulty:
        base_query = base_query.where(Course.difficulty == difficulty)

    if q:
        base_query = base_query.where(Course.title.ilike(f"%{q}%"))

    # count (order yok)
    total = await db.scalar(select(func.count()).select_from(base_query.subquery()))

    # data query — display_order ASC NULLS LAST (BE-14 kabul kriteri)
    query = (
        base_query.order_by(Course.display_order.asc().nulls_last())
        .offset((page - 1) * limit)
        .limit(limit)
    )

    result = await db.scalars(query)
    courses = list(result.all())

    return courses, total or 0


async def get_course_by_slug(
    db: AsyncSession,
    slug: str,
) -> Optional[Course]:

    query = (
        select(Course)
        .options(selectinload(Course.sections))
        .where(
            Course.slug == slug,
            Course.is_published == True,  # noqa: E712
        )
    )

    return await db.scalar(query)
