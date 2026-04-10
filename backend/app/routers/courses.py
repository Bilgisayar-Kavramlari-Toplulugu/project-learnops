"""Course public endpoints (BE-14)

GET /v1/courses        — paginated list with optional filters
GET /v1/courses/{slug} — course detail with sections

Auth: not required (SSG-friendly public endpoints)
Order: display_order ASC NULLS LAST
"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.courses import CourseDetail, CourseListItem, CourseListResponse
from app.services.course_service import get_course_by_slug, get_courses

router = APIRouter(prefix="/courses", tags=["courses"])
logger = logging.getLogger(__name__)


@router.get("", response_model=CourseListResponse)
async def list_courses(
    category: Optional[str] = Query(
        None, description="Kategori filtresi (ör. 'programlama', 'web')"
    ),
    difficulty: Optional[str] = Query(
        None, description="Zorluk filtresi: beginner | intermediate | advanced"
    ),
    q: Optional[str] = Query(
        None, description="Başlıkta arama (büyük/küçük harf duyarsız)"
    ),
    page: int = Query(1, ge=1, description="Sayfa numarası"),
    limit: int = Query(10, ge=1, le=100, description="Sayfa başına kayıt sayısı"),
    db: AsyncSession = Depends(get_db),
) -> CourseListResponse:
    courses, total = await get_courses(
        db,
        category=category,
        difficulty=difficulty,
        q=q,
        page=page,
        limit=limit,
    )
    return CourseListResponse(
        items=[CourseListItem.model_validate(c) for c in courses],
        page=page,
        limit=limit,
        total=total,
    )


@router.get("/{slug}", response_model=CourseDetail)
async def get_course(
    slug: str,
    db: AsyncSession = Depends(get_db),
) -> CourseDetail:
    course = await get_course_by_slug(db, slug)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )
    return CourseDetail.model_validate(course)
