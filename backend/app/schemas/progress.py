from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SectionProgressResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    course_id: UUID
    section_id_str: str
    progress_percent: float = Field(..., ge=0, le=100)
    completed: bool
    course_completed_at: Optional[datetime] = None

