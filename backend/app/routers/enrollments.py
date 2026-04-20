import uuid


from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

from app.deps import get_current_user

from app.models.courses import Course
from app.models.users import User
from app.schemas.enrollments import (
    EnrollmentCourseSummary,
    EnrollmentCreateRequest,
    EnrollmentListResponse,
    EnrollmentResponse,
    EnrollmentProgressOut,
)
from app.services.enrollment_service import (
    create_enrollment,
    get_published_course_by_id,
    get_user_enrollment_for_course,
    list_user_enrollments,
    get_enrollment_progress,
)

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


def _build_course_summary(course: Course) -> EnrollmentCourseSummary:
    return EnrollmentCourseSummary.model_validate(course)


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    body: EnrollmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EnrollmentResponse:
    course = await get_published_course_by_id(db, body.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    existing = await get_user_enrollment_for_course(db, current_user.id, body.course_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already enrolled in this course",
        )

    try:
        enrollment = await create_enrollment(db, current_user.id, body.course_id)
    except ValueError as exc:
        if str(exc) == "duplicate_enrollment":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already enrolled in this course",
            )
        raise

    return EnrollmentResponse(
        id=enrollment.id,
        course_id=enrollment.course_id,
        enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at,
        progress_percent=float(enrollment.progress_percent),
        course=_build_course_summary(enrollment.course),
    )


@router.get("", response_model=EnrollmentListResponse)
async def get_my_enrollments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EnrollmentListResponse:
    enrollments = await list_user_enrollments(db, current_user.id)

    return EnrollmentListResponse(
        items=[
            EnrollmentResponse(
                id=enrollment.id,
                course_id=enrollment.course_id,
                enrolled_at=enrollment.enrolled_at,
                completed_at=enrollment.completed_at,
                progress_percent=float(enrollment.progress_percent),
                course=_build_course_summary(enrollment.course),
            )
            for enrollment in enrollments
        ]
    )




def _build_course_summary(course: Course) -> EnrollmentCourseSummary:
    return EnrollmentCourseSummary.model_validate(course)


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
async def enroll_in_course(
    body: EnrollmentCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EnrollmentResponse:
    course = await get_published_course_by_id(db, body.course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found",
        )

    existing = await get_user_enrollment_for_course(db, current_user.id, body.course_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already enrolled in this course",
        )

    try:
        enrollment = await create_enrollment(db, current_user.id, body.course_id)
    except ValueError as exc:
        if str(exc) == "duplicate_enrollment":
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User is already enrolled in this course",
            )
        raise

    return EnrollmentResponse(
        id=enrollment.id,
        course_id=enrollment.course_id,
        enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at,
        progress_percent=float(enrollment.progress_percent),
        course=_build_course_summary(enrollment.course),
    )


@router.get("", response_model=EnrollmentListResponse)
async def get_my_enrollments(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> EnrollmentListResponse:
    enrollments = await list_user_enrollments(db, current_user.id)

    return EnrollmentListResponse(
        items=[
            EnrollmentResponse(
                id=enrollment.id,
                course_id=enrollment.course_id,
                enrolled_at=enrollment.enrolled_at,
                completed_at=enrollment.completed_at,
                progress_percent=float(enrollment.progress_percent),
                course=_build_course_summary(enrollment.course),
            )
            for enrollment in enrollments
        ]
    )


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
    try:
        progress = await get_enrollment_progress(db, current_user, course_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )

    if progress is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment bulunamadı",
        )

    return progress