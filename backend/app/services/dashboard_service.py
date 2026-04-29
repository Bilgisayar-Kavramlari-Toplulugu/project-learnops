from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Enrollment, Section, UserProgress
from app.models.quizzes import Quiz, QuizAttempt


class DashboardService:
    @staticmethod
    async def get_summary(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """
        Kullanıcı dashboard özeti.

        Performans Optimizasyonları:
        1. Subquery: Tamamlanmış bölümler Python belleğine çekilmeden
           DB içinde filtreleme için kullanıldı.
        2. Bulk Next Section: N+1 problemini çözmek için döngü içindeki
           sorgular tek bir 'DISTINCT ON' benzeri yapıya indirgendi.
        3. Eager Loading: selectinload ile asenkron performans optimize edildi.
        """

        # 1. Tamamlanan Kurs Sayısı
        completed_count_stmt = select(func.count(Enrollment.id)).where(
            Enrollment.user_id == user_id, Enrollment.completed_at.isnot(None)
        )
        completed_count = (await db.execute(completed_count_stmt)).scalar() or 0

        # 2. Devam Eden Kurslar ve 'Next Section' Bulma
        enrollments_stmt = (
            select(Enrollment)
            .options(selectinload(Enrollment.course))
            .where(Enrollment.user_id == user_id, Enrollment.completed_at.is_(None))
        )
        enrollments = (await db.execute(enrollments_stmt)).scalars().all()

        in_progress_list: List[Dict[str, Any]] = []

        if enrollments:
            course_ids = [enc.course_id for enc in enrollments]

            # ÇÖZÜM 3: Subquery DB içinde kalıyor
            completed_sections_subq = (
                select(UserProgress.section_id).where(
                    UserProgress.user_id == user_id,
                    UserProgress.completed.is_(True),
                )
            ).scalar_subquery()

            # ÇÖZÜM 4: N+1 Problemi Giderildi.
            next_sections_stmt = (
                select(Section)
                .where(
                    Section.course_id.in_(course_ids),
                    ~Section.id.in_(completed_sections_subq),
                )
                .distinct(Section.course_id)
                .order_by(Section.course_id, Section.order_index.asc())
            )

            next_sections_res = (await db.execute(next_sections_stmt)).scalars().all()

            # Hızlı erişim için kurs_id -> section eşlemesi
            next_sections_map = {s.course_id: s for s in next_sections_res}

            for enc in enrollments:
                next_sec = next_sections_map.get(enc.course_id)

                in_progress_list.append(
                    {
                        "course_id": enc.course_id,
                        "title": enc.course.title if enc.course else "Unknown",
                        "next_section": (
                            {
                                "id": next_sec.id,
                                "title": next_sec.title,
                                "order_index": next_sec.order_index,
                            }
                            if next_sec
                            else None
                        ),
                    }
                )

        # 3. Son Quiz (Tek Sorgu, selectinload)
        last_attempt_stmt = (
            select(QuizAttempt)
            .options(selectinload(QuizAttempt.quiz).selectinload(Quiz.course))
            .where(
                QuizAttempt.user_id == user_id,
                QuizAttempt.submitted_at.isnot(None),
            )
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