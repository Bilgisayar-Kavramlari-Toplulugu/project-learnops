from pydantic import BaseModel
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class NextSectionSchema(BaseModel):
    """Devam eden bir kurstaki sonraki bölüm için şema."""
    id: UUID
    title: str
    order_index: int

class InProgressCourseSchema(BaseModel):
    """Şu anda devam eden kurslar için şema."""
    course_id: UUID
    title: str
    next_section: Optional[NextSectionSchema]

class LastQuizSchema(BaseModel):
    """Kullanıcının son tamamlanan quiz'i için şema."""
    quiz_name: str
    score: float
    completed_at: datetime

class DashboardSummarySchema(BaseModel):
    """
    Ana dashboard özet şeması.
    
    Kullanıcının dashboard görünümü için toplanmış verileri içerir.
    """
    completed_courses_count: int
    in_progress_courses: List[InProgressCourseSchema]
    last_quiz: Optional[LastQuizSchema]