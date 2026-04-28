"""Quiz, question, attempt, and answer models (MVP v1.2 compliant)"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    Text,
    UniqueConstraint,
)
from sqlalchemy import (
    text as sql_text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, BaseModel

if TYPE_CHECKING:
    from .courses import Course
    from .users import User


class Quiz(BaseModel):
    """Quiz model with per-course configuration

    Requirement FR-14: One quiz per course (1:1 relationship)
    Each quiz can have unique pass_threshold and duration_seconds.

    Fields:
    - course_id: Parent course (FK, UNIQUE)
    - pass_threshold: NUMERIC(3,2) decimal (e.g., 0.70 = %70 required to pass)
      Requirement FR-17: %70 geçme notu varsayılan
    - duration_seconds: Quiz time limit in seconds (no DB default — value always
      written explicitly by seed_quiz.py: beginner=1500, intermediate=2000,
      advanced=2500)
      Requirement FR-15: Backend verifies submitted_at - started_at <=
      duration_seconds + 30s tolerance
    """

    __tablename__ = "quizzes"

    course_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), unique=True
    )
    pass_threshold: Mapped[Decimal] = mapped_column(
        Numeric(3, 2), nullable=False, default=Decimal("0.70")
    )
    duration_seconds: Mapped[int] = mapped_column(Integer, nullable=False)

    # Relationships
    course: Mapped["Course"] = relationship("Course", back_populates="quiz")
    questions: Mapped[list["Question"]] = relationship(
        "Question", back_populates="quiz", cascade="all, delete-orphan"
    )
    attempts: Mapped[list["QuizAttempt"]] = relationship(
        "QuizAttempt", back_populates="quiz", cascade="all, delete-orphan"
    )


class Question(BaseModel):
    """Quiz question model with explanation and options

    Fields:
    - quiz_id: Parent quiz (FK)
    - text: Question text
    - options: JSONB array of answer options
      Format: [{"index": 0, "text": "Answer A"}, {"index": 1, "text": "Answer B"}, ...]
    - correct_index: 0-based index of correct answer
      CRITICAL (Requirement NF-05): NEVER sent to client before submit
      Only returned in submit response showing correct answer to user
    - explanation: Why this answer is correct (shown on result review page)
    - order_index: Question sequence within quiz
    - is_active: Whether question is active (K-2: faulty questions set to false)
    """

    __tablename__ = "questions"

    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE")
    )
    text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[list] = mapped_column(JSONB, nullable=False)
    correct_index: Mapped[int] = mapped_column(Integer, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, nullable=False)
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=sql_text("true")
    )

    # Relationships
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    """User's quiz attempt with timing and scoring
    (NO created_at/updated_at per MVP v1.2)

    Requirement FR-14: Each quiz start creates an attempt record
    Requirement FR-15: Backend duration validation using started_at and submitted_at
    Requirement FR-16: Backend calculates score and passed status on submit

    MVP SPEC: This table does NOT have created_at/updated_at fields.
    Timing is tracked via started_at and submitted_at only.

    Fields:
    - id: UUID primary key
    - user_id: User attempting quiz (FK)
    - quiz_id: Quiz being attempted (FK)
    - started_at: Attempt start timestamp (used for duration validation)
    - submitted_at: When user submitted (NULL until submit,
      used for time_spent_seconds calculation)
      Security: Backend verifies submitted_at - started_at <=
      duration_seconds + 30s tolerance
    - score: Number of correct answers (NULL until submitted)
    - total_questions: Total questions in quiz (NULL until submitted,
      used for % calculation)
    - passed: TRUE if (score / total_questions) >= pass_threshold
      (NULL until submitted)
    - time_spent_secs: submitted_at - started_at in seconds (displayed on result card)
    """

    __tablename__ = "quiz_attempts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sql_text("gen_random_uuid()"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE")
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quizzes.id", ondelete="CASCADE")
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    submitted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    score: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    total_questions: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    passed: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    time_spent_secs: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="quiz_attempts")
    quiz: Mapped["Quiz"] = relationship("Quiz", back_populates="attempts")
    answers: Mapped[list["QuizAttemptAnswer"]] = relationship(
        "QuizAttemptAnswer", back_populates="attempt", cascade="all, delete-orphan"
    )


class QuizAttemptAnswer(Base):
    """Individual question answer in a quiz attempt
    (NO created_at/updated_at per MVP v1.2)

    Requirement FR-14: Records user's selected answer for each question
    Requirement FR-16: After submit, backend checks correctness and calculates score

    MVP SPEC: This table does NOT have created_at/updated_at fields.

    Fields:
    - id: UUID primary key
    - attempt_id: Parent attempt (FK)
    - question_id: Question being answered (FK)
    - selected_index: 0-based index of selected answer
      CRITICAL (MVP 1.3): NULL = unanswered
      (time limit reached before answer submission)
    - is_correct: TRUE if selected_index == correct_index
    """

    __tablename__ = "quiz_attempt_answers"
    __table_args__ = (
        UniqueConstraint("attempt_id", "question_id", name="uq_attempt_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=sql_text("gen_random_uuid()"),
        nullable=False,
    )
    attempt_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quiz_attempts.id", ondelete="CASCADE")
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("questions.id", ondelete="CASCADE")
    )
    selected_index: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_correct: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Relationships
    attempt: Mapped["QuizAttempt"] = relationship(
        "QuizAttempt", back_populates="answers"
    )
    question: Mapped["Question"] = relationship("Question")
