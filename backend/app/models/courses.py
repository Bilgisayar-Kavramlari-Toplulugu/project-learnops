from sqlalchemy import String, Integer, ForeignKey, Boolean, Float, DateTime
from sqlalchemy.orm import relationship, Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
import uuid
from datetime import datetime

class Course(BaseModel):
    __tablename__ = "courses"

    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False)
    
    sections = relationship("Section", back_populates="course", cascade="all, delete-orphan")
    quiz = relationship("Quiz", back_populates="course", uselist=False, cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course")

class Section(BaseModel):
    __tablename__ = "sections"

    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    # KRİTİK: section_id_str unique kısıtı
    section_id_str: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    
    course = relationship("Course", back_populates="sections")
    user_progress = relationship("UserProgress", back_populates="section")

class Enrollment(BaseModel):
    __tablename__ = "enrollments"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    course_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"))
    progress_percent: Mapped[float] = mapped_column(Float, default=0.0)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    
    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class UserProgress(BaseModel):
    __tablename__ = "user_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    section_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE"))
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    
    user = relationship("User", back_populates="progress")
    section = relationship("Section", back_populates="user_progress")