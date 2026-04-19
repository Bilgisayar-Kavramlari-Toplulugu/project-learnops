
from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict



class EnrollmentCreateRequest(BaseModel):
    course_id: UUID


class EnrollmentCourseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    display_order: Optional[int] = None


class EnrollmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress_percent: float
    course: EnrollmentCourseSummary


class EnrollmentListResponse(BaseModel):
    items: List[EnrollmentResponse]

class EnrollmentCreateRequest(BaseModel):
    course_id: UUID


class EnrollmentCourseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    slug: str
    title: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    display_order: Optional[int] = None


class EnrollmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    enrolled_at: datetime
    completed_at: Optional[datetime] = None
    progress_percent: float
    course: EnrollmentCourseSummary


class EnrollmentListResponse(BaseModel):
    items: List[EnrollmentResponse]

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
