"""Course, section, enrollment, and user progress models (MVP v1.2 compliant)"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BaseModel

if TYPE_CHECKING:
    from .quizzes import Quiz
    from .users import User


class Course(BaseModel):
    """Course model with metadata for display and progress tracking

    Fields:
    - slug: URL-friendly identifier (unique, used for course_detail URLs)
    - title: Course display name
    - description: Course overview text
    - category: Course category for filtering (e.g., 'programlama', 'web')
    - difficulty: Difficulty level for filtering
      ('beginner' | 'intermediate' | 'advanced')
    - duration_minutes: Estimated course duration in minutes (seeded from meta.json)
    - is_published: Whether course is visible to users (false = draft)

    Related: sections (1:N), quiz (1:1), enrollments (1:N)
    """

    __tablename__ = "courses"

    slug: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    category: Mapped[Optional[str]] = mapped_column(
        String(100), index=True, nullable=True
    )
    difficulty: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    sections: Mapped[list] = relationship(
        "Section", back_populates="course", cascade="all, delete-orphan"
    )
    quiz: Mapped[Optional["Quiz"]] = relationship(
        "Quiz", back_populates="course", uselist=False, cascade="all, delete-orphan"
    )
    enrollments: Mapped[list] = relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )


class Section(BaseModel):
    """Course section model with permanent ID for progress tracking

    CRITICAL: section_id_str is a PERMANENT unique identifier from MDX frontmatter.
    Even if the file is renamed, this ID never changes. This allows user_progress
    to persist across schema file refactoring.

    Fields:
    - course_id: Parent course (FK)
    - section_id_str: Permanent unique ID (e.g., "python-001-giris") from frontmatter
    - title: Section display name
    - order_index: Display order within course (1, 2, 3, ...)

    Constraints:
    - UNIQUE(section_id_str): Globally unique across all sections
    - UNIQUE(course_id, order_index): One section per order within a course
    """

    __tablename__ = "sections"

    __table_args__ = (
        UniqueConstraint("course_id", "order_index", name="uq_sections_course_order"),
    )

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE")
    )
    section_id_str: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="sections")
    user_progress: Mapped[list] = relationship(
        "UserProgress", back_populates="section", cascade="all, delete-orphan"
    )


class Enrollment(Base):
    """User course enrollment with progress tracking
    (NO created_at/updated_at per MVP v1.2)

    MVP SPEC: This table does NOT have created_at/updated_at fields.
    Timeline is tracked via enrolled_at timestamp only.

    Fields:
    - id: UUID primary key
    - user_id: User who enrolled (FK)
    - course_id: Enrolled course (FK)
    - enrolled_at: Enrollment timestamp (for timeline/history)
    - completed_at: Set when ALL sections marked completed (Requirement FR-13)
    - progress_percent: (completed_sections / total_sections) * 100
      Calculated as: count(user_progress.completed=true) / count(sections) * 100

    Constraint: UNIQUE(user_id, course_id) — One enrollment per user per course
    """

    __tablename__ = "enrollments"

    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_enrollments_user_course"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE")
    )
    enrolled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    progress_percent: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=0.00
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="enrollments")
    course: Mapped["Course"] = relationship("Course", back_populates="enrollments")


class UserProgress(Base):
    """Per-section completion tracking for a user
    (NO created_at/updated_at per MVP v1.2)

    MVP SPEC: This table does NOT have created_at/updated_at fields.
    Only tracking when section was completed via completed_at timestamp.

    Records whether a user has completed each section of a course.
    Dashboard query counts completed=true records and calculates progress.

    Fields:
    - id: UUID primary key
    - user_id: User (FK)
    - section_id: Section (FK)
    - completed: TRUE when user marks section done
    - completed_at: Timestamp when section was completed

    Constraint: UNIQUE(user_id, section_id) — One progress entry per user per section
    """

    __tablename__ = "user_progress"

    __table_args__ = (
        UniqueConstraint("user_id", "section_id", name="uq_progress_user_section"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    section_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("sections.id", ondelete="CASCADE")
    )
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="progress")
    section: Mapped["Section"] = relationship("Section", back_populates="user_progress")
