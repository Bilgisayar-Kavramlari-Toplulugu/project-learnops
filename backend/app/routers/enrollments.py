from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.models.users import User
from app.schemas.enrollments import (
    EnrollmentCreateRequest,
    EnrollmentCourseSummary,
    EnrollmentListResponse,
    EnrollmentResponse,
)
from app.services.enrollment_service import (
    create_enrollment,
    get_published_course_by_id,
    get_user_enrollment_for_course,
    list_user_enrollments,
)

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


def _build_course_summary(course) -> EnrollmentCourseSummary:
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
