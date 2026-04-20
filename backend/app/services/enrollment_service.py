"""Enrollment service (BE-17)

get_enrollment_progress — Kullanıcının bir kurs için enrollment + section bazlı
ilerleme verisini döner.
"""

import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.courses import Enrollment, Section, UserProgress
from app.schemas.enrollments import EnrollmentProgressOut, SectionProgressOut


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
