from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class InProgressCourseSchema(BaseModel):
    """MVP 5.6 — Devam eden kurs özeti."""

    course_id: UUID
    title: str
    slug: str
    progress_percent: float
    last_section_id_str: Optional[str]
    last_section_title: Optional[str]


class LastQuizResultSchema(BaseModel):
    """MVP 5.6 — Son quiz sonucu."""

    quiz_id: UUID
    course_title: str
    score: int
    total: int
    passed: bool
    submitted_at: datetime


class DashboardSummarySchema(BaseModel):
    """MVP 5.6 — Dashboard özet şeması."""

    display_name: str
    avatar_type: str
    completed_course_count: int
    in_progress_courses: List[InProgressCourseSchema]
    last_quiz_result: Optional[LastQuizResultSchema]
