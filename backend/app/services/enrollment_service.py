from typing import List, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import uuid
from app.models.courses import Course, Enrollment, Section, UserProgress
from app.schemas.enrollments import EnrollmentProgressOut, SectionProgressOut

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

    enrollment_with_course = await db.scalar(
        select(Enrollment)
        .options(selectinload(Enrollment.course))
        .where(Enrollment.id == enrollment.id)
    )
    if enrollment_with_course is None:
        raise RuntimeError("Enrollment not found after flush")

    return enrollment_with_course


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



async def get_enrollment_progress(
    db: AsyncSession,
    user_id: str,
    course_id: uuid.UUID,
) -> Optional[EnrollmentProgressOut]:
    """Kullanıcının enrollment kaydını ve tüm section'ların tamamlanma durumunu döner.

    Akış:
    1. Kullanıcının bu kursa enrollment'ı var mı kontrol et (yoksa None döner → 404)
    2. Kursun tüm section'larını order_index sırasıyla çek
    3. Kullanıcının bu section'lar için UserProgress kayıtlarını çek
    4. Her section için completed durumunu UserProgress'ten lookup et
       (eğer kayıt yoksa completed=False varsayılır)
    5. EnrollmentProgressOut oluşturup döndür

    Args:
        db: Async veritabanı oturumu
        user_id: JWT'den gelen kullanıcı ID'si (str UUID)
        course_id: URL path parametresinden gelen kurs UUID'si

    Returns:
        EnrollmentProgressOut or None (enrollment bulunamazsa)
    """
    try:
        parsed_user_id = uuid.UUID(user_id)
    except ValueError:
        raise ValueError("Geçersiz kullanıcı kimliği")

    # 1. Enrollment'ı bul
    enrollment_result = await db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == parsed_user_id,
            Enrollment.course_id == course_id,
        )
    )

    if enrollment_result is None:
        return None

    # 2. Kursun tüm section'larını çek (order_index sıralı)
    sections_result = await db.scalars(
        select(Section)
        .where(Section.course_id == course_id)
        .order_by(Section.order_index.asc())
    )
    sections = list(sections_result.all())

    # 3. Kullanıcının bu kurs section'larına ait UserProgress kayıtlarını çek
    section_ids = [s.id for s in sections]

    progress_result = await db.scalars(
        select(UserProgress).where(
            UserProgress.user_id == parsed_user_id,
            UserProgress.section_id.in_(section_ids),
        )
    )
    # section_id → completed lookup tablosu
    progress_map: dict[uuid.UUID, bool] = {
        p.section_id: p.completed for p in progress_result.all()
    }

    # 4. Her section için SectionProgressOut oluştur
    section_progress = [
        SectionProgressOut(
            section_id_str=s.section_id_str,
            title=s.title,
            order_index=s.order_index,
            completed=progress_map.get(s.id, False),
        )
        for s in sections
    ]

    # 5. Sonucu döndür
    return EnrollmentProgressOut(
        course_id=course_id,
        progress_percent=float(enrollment_result.progress_percent),
        completed_at=enrollment_result.completed_at,
        sections=section_progress,
    )
