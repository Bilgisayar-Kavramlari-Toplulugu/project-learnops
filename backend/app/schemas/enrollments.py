"""Enrollment schemas (BE-17)

EnrollmentProgressOut  — GET /enrollments/{courseId}/progress response
SectionProgressOut     — Per-section completion detail within the above
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel


class SectionProgressOut(BaseModel):
    """Bir section'ın tamamlanma durumu.

    section_id_str: MDX frontmatter'daki kalıcı ID (dosya adı değişse de değişmez)
    completed: UserProgress.completed alanından — True ise kullanıcı bu section'ı
        bitirmiş
    """

    section_id_str: str
    title: str
    order_index: int
    completed: bool


class EnrollmentProgressOut(BaseModel):
    """GET /enrollments/{courseId}/progress endpoint response modeli.

    sections listesi her bir Section için kullanıcının tamamlama durumunu içerir.
    Eğer kullanıcının UserProgress kaydı yoksa completed=False varsayılır.
    """

    course_id: UUID
    progress_percent: float
    completed_at: Optional[datetime] = None
    sections: List[SectionProgressOut]
