from typing import Any, Dict, List
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.courses import Enrollment, Section, UserProgress
from app.models.quizzes import Quiz, QuizAttempt
from app.models.users import User


class DashboardService:
    @staticmethod
    async def get_summary(db: AsyncSession, user_id: UUID) -> Dict[str, Any]:
        """
        Kullanıcı dashboard özeti — MVP §5.6 contract.

        Performans Optimizasyonları:
        1. Subquery: Tamamlanmış bölümler Python belleğine çekilmeden
           DB içinde filtreleme için kullanıldı.
        2. Bulk Next Section: N+1 problemini çözmek için döngü içindeki
           sorgular tek bir 'DISTINCT ON' benzeri yapıya indirgendi.
        3. Eager Loading: selectinload ile asenkron performans optimize edildi.
        """

        # 1. Kullanıcı bilgileri (display_name, avatar_type)
        user_stmt = select(User).where(User.id == user_id)
        user = (await db.execute(user_stmt)).scalar_one_or_none()

        # 2. Tamamlanan Kurs Sayısı
        completed_count_stmt = select(func.count(Enrollment.id)).where(
            Enrollment.user_id == user_id, Enrollment.completed_at.isnot(None)
        )
        completed_count = (await db.execute(completed_count_stmt)).scalar() or 0

        # 3. Devam Eden Kurslar ve 'Next Section' Bulma
        enrollments_stmt = (
            select(Enrollment)
            .options(selectinload(Enrollment.course))
            .where(Enrollment.user_id == user_id, Enrollment.completed_at.is_(None))
        )
        enrollments = (await db.execute(enrollments_stmt)).scalars().all()

        in_progress_list: List[Dict[str, Any]] = []

        if enrollments:
            course_ids = [enc.course_id for enc in enrollments]

            # Tamamlanmış bölümler subquery olarak DB'de filtrelenir
            # Python belleğine çekilmez
            completed_sections_subq = (
                select(UserProgress.section_id).where(
                    UserProgress.user_id == user_id,
                    UserProgress.completed.is_(True),
                )
            ).scalar_subquery()

            # Tüm kursların sonraki bölümü tek sorguda
            # DISTINCT ON ile alınır
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
                        "title": enc.course.title,
                        "slug": enc.course.slug,
                        "progress_percent": float(enc.progress_percent),
                        "last_section_id_str": next_sec.section_id_str if next_sec else None,
                        "last_section_title": next_sec.title if next_sec else None,
                    }
                )

        # 4. Son Quiz (Tek Sorgu, selectinload)
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

        last_quiz_result = None
        if last_attempt and last_attempt.quiz and last_attempt.quiz.course:
            last_quiz_result = {
                "quiz_id": last_attempt.quiz_id,
                "course_title": last_attempt.quiz.course.title,
                "score": last_attempt.score,
                "total": last_attempt.total_questions,
                "passed": last_attempt.passed,
                "submitted_at": last_attempt.submitted_at,
            }

        return {
            "display_name": user.display_name if user else "Öğrenci",
            "avatar_type": user.avatar_type if user else "initials",
            "completed_course_count": completed_count,
            "in_progress_courses": in_progress_list,
            "last_quiz_result": last_quiz_result,
        }