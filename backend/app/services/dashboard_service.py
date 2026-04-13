from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from typing import Any
from app.models.courses import Course, Enrollment, Section, UserProgress
from app.models.quizzes import QuizAttempt


class DashboardService:
    """
    Dashboard ile ilgili işlemler için servis sınıfı.
    
    Kullanıcıya özel dashboard verisi toplama ve optimizasyonunu yönetir.
    """
    
    @staticmethod
    def get_summary(db: Session, user_id: Any) -> dict:
        """
        Kullanıcı için dashboard özetini alır.
        
        Args:
            db: Veritabanı oturumu
            user_id: Kullanıcı ID'si (UUID veya string)
            
        Returns:
            Sözlük içeren:
            - completed_courses_count: Tamamlanan kurs sayısı
            - in_progress_courses: Sonraki bölüm ile kurs listesi
            - last_quiz: Son tamamlanan quiz bilgisi
            
        Not: Tek subquery yaklaşımı ile performans için optimize edilmiştir.
        """
        user_uuid = user_id if isinstance(user_id, UUID) else UUID(str(user_id))
        
        # 1. Tamamlanan Kurs Sayısı - completed_at set edilmiş enrollment'ları say
        completed_count = db.query(Enrollment).filter(
            Enrollment.user_id == user_uuid,
            Enrollment.completed_at.isnot(None)
        ).count()

        # 2. Devam Eden Kurslar - Devam eden enrollment'ları ve sonraki bölümlerini al
        enrollments = db.query(Enrollment).filter(
            Enrollment.user_id == user_uuid,
            Enrollment.completed_at.is_(None)
        ).all()

        in_progress_list = []
        if enrollments:
            # N+1 sorguları önlemek için tamamlanmış bölümler için subquery
            completed_sections_ids = db.query(UserProgress.section_id).filter(
                UserProgress.user_id == user_uuid,
                UserProgress.completed == True
            ).subquery()
            
            # Her enrollment için sonraki tamamlanmamış bölümü bul (en düşük order_index)
            for enc in enrollments:
                # Sonraki bölüm en düşük order_index'li tamamlanmamış bölüm
                next_sec = db.query(Section).filter(
                    Section.course_id == enc.course_id,
                    ~Section.id.in_(completed_sections_ids)
                ).order_by(Section.order_index.asc()).first()
                
                next_section_data = None
                if next_sec:
                    next_section_data = {
                        "id": next_sec.id,
                        "title": next_sec.title,
                        "order_index": next_sec.order_index
                    }

                in_progress_list.append({
                    "course_id": enc.course_id,
                    "title": enc.course.title,
                    "next_section": next_section_data
                })

        # 3. Son Quiz - Son gönderilen quiz denemesini al
        last_attempt = db.query(QuizAttempt).join(QuizAttempt.quiz).join(QuizAttempt.quiz.course).filter(
            QuizAttempt.user_id == user_uuid,
            QuizAttempt.submitted_at.isnot(None)
        ).order_by(QuizAttempt.submitted_at.desc()).first()

        last_quiz_data = None
        if last_attempt:
            last_quiz_data = {
                "quiz_name": last_attempt.quiz.course.title,  # Quiz adı olarak kurs başlığını kullan
                "score": float(last_attempt.score) if last_attempt.score is not None else 0.0,
                "completed_at": last_attempt.submitted_at
            }

        return {
            "completed_courses_count": completed_count,
            "in_progress_courses": in_progress_list,
            "last_quiz": last_quiz_data
        }