"""Enrollment endpoints (BE-17)

GET /v1/enrollments/{course_id}/progress — Kullanıcının kurs ilerleme durumu

Auth: Bearer token gerekli (get_current_user)
Kullanım: Frontend section sidebar için section bazlı tamamlanma durumu
"""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.deps import get_current_user
from app.schemas.enrollments import EnrollmentProgressOut
from app.services.enrollment_service import get_enrollment_progress

router = APIRouter(prefix="/enrollments", tags=["enrollments"])
logger = logging.getLogger(__name__)


@router.get("/{course_id}/progress", response_model=EnrollmentProgressOut)
async def get_progress(
    course_id: uuid.UUID,
    current_user: str = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> EnrollmentProgressOut:
    """Kullanıcının bir kurs için enrollment ilerleme durumunu döner.

    Her section'ın completed durumu ve genel progress_percent içerir.
    Enrollment bulunamazsa 404 döner.

    Args:
        course_id: Kurs UUID'si (path parametresi)
        current_user: JWT'den çözümlenen kullanıcı ID'si (str)
        db: Async DB oturumu
    """
    progress = await get_enrollment_progress(db, current_user, course_id)

    if progress is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment bulunamadı",
        )

    return progress
