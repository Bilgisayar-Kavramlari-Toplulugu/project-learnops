from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class SectionProgressResponse(BaseModel):
    course_id: UUID
    section_id_str: str
    progress_percent: float = Field(..., ge=0, le=100)
    completed: bool
    course_completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True