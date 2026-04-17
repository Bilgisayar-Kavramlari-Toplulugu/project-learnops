from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class QuestionOptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    index: int
    text: str


class QuestionOut(BaseModel):
    """
    Client'a dönülecek soru şeması.
    GÜVENLİK (NF-05): correct_index KESİNLİKLE DÖNÜLMEZ.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    options: List[QuestionOptionOut]


class QuizAttemptResponse(BaseModel):
    """
    Quiz attempt başlatıldığında dönülecek response.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    quiz_id: UUID
    started_at: datetime
    duration_seconds: int
    questions: List[QuestionOut]
