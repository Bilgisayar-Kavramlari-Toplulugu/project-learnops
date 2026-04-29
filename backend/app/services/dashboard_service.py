from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.courses import Course, Enrollment, Section, UserProgress
from app.models.quizzes import Quiz, QuizAttempt


class DashboardService:
    """
    Dashboard ile ilgili işlemler için servis sınıfı.
    Kullanıcıya özel dashboard verisi toplama ve optimizasyonunu yönetir.
    """

    @staticmethod
    async def get_summary(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """
        Kullanıcı için dashboard özetini alır.
        """
        # 1. Tamamlanan Kurs Sayısı
        completed_count_stmt = select(func.count(Enrollment.id)).where(
            Enrollment.user_id == user_id, Enrollment.completed_at.isnot(None)
        )
        completed_count = (await db.execute(completed_count_stmt)).scalar() or 0

        # 2. Devam Eden Kurslar
        enrollments_stmt = (
            select(Enrollment)
            .options(joinedload(Enrollment.course))
            .where(Enrollment.user_id == user_id, Enrollment.completed_at.is_(None))
        )
        enrollments = (await db.execute(enrollments_stmt)).scalars().all()

        in_progress_list: List[Dict[str, Any]] = []

        if enrollments:
            # Tamamlanmış bölümler
            completed_sections_stmt = select(UserProgress.section_id).where(
                UserProgress.user_id == user_id, UserProgress.completed.is_(True)
            )
            completed_sections_ids = (
                (await db.execute(completed_sections_stmt)).scalars().all()
            )

            for enc in enrollments:
                # Mypy hatasını çözen dinamik filtre yapısı
                filters = [Section.course_id == enc.course_id]
                if completed_sections_ids:
                    filters.append(~Section.id.in_(completed_sections_ids))

                # Sonraki bölümü bul
                next_sec_stmt = (
                    select(Section)
                    .where(and_(*filters))
                    .order_by(Section.order_index.asc())
                    .limit(1)
                )
                next_sec = (await db.execute(next_sec_stmt)).scalar_one_or_none()

                in_progress_list.append(
                    {
                        "course_id": enc.course_id,
                        "title": enc.course.title if enc.course else "Unknown",
                        "next_section": {
                            "id": next_sec.id,
                            "title": next_sec.title,
                            "order_index": next_sec.order_index,
                        }
                        if next_sec
                        else None,
                    }
                )

        # 3. Son Quiz
        last_attempt_stmt = (
            select(QuizAttempt)
            .join(Quiz, QuizAttempt.quiz_id == Quiz.id)
            .join(Course, Quiz.course_id == Course.id)
            .options(joinedload(QuizAttempt.quiz).joinedload(Quiz.course))
            .where(QuizAttempt.user_id == user_id, QuizAttempt.submitted_at.isnot(None))
            .order_by(QuizAttempt.submitted_at.desc())
            .limit(1)
        )
        last_attempt = (await db.execute(last_attempt_stmt)).scalar_one_or_none()

        last_quiz_data = None
        if last_attempt and last_attempt.quiz and last_attempt.quiz.course:
            last_quiz_data = {
                "quiz_name": last_attempt.quiz.course.title,
                "score": last_attempt.score,
                "completed_at": last_attempt.submitted_at,
            }

        return {
            "completed_courses_count": completed_count,
            "in_progress_courses": in_progress_list,
            "last_quiz": last_quiz_data,
        }
