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
