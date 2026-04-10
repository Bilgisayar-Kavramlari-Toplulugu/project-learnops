from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SectionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    section_id_str: str
    title: str
    order_index: int


class CourseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    title: str
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    display_order: Optional[int] = None


class CourseDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    slug: str
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[str] = None
    duration_minutes: Optional[int] = None
    display_order: Optional[int] = None
    sections: List[SectionOut] = Field(default_factory=list)


class CourseListResponse(BaseModel):
    items: List[CourseListItem]
    page: int
    limit: int
    total: int
