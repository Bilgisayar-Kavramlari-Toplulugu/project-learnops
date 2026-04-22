from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class QuestionBasic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    options: list
    correct_index: int
    explanation: Optional[str] = None
    order_index: int


class QuizAttemptAnswerDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    question_id: UUID
    selected_index: Optional[int] = None
    is_correct: bool
    question: QuestionBasic


class QuizAttemptDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_id: UUID
    started_at: datetime
    submitted_at: datetime
    score: int
    total_questions: int
    passed: bool
    time_spent_secs: int
    answers: List[QuizAttemptAnswerDetail]


class QuizAttemptListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_id: UUID
    started_at: datetime
    submitted_at: datetime
    score: int
    total_questions: int
    passed: bool
    time_spent_secs: int
