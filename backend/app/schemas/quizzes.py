from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class QuestionOptionOut(BaseModel):
    index: int
    text: str


class QuestionOut(BaseModel):
    """
    Client'a dönülecek soru şeması.
    GÜVENLİK (NF-05): correct_index KESİNLİKLE DÖNÜLMEZ.
    """

    id: UUID
    text: str
    options: list[QuestionOptionOut]


class QuizAttemptResponse(BaseModel):
    """
    Quiz attempt başlatıldığında dönülecek response.
    Router plain dict döndürdüğü için from_attributes gerekmez.
    """

    id: UUID
    quiz_id: UUID
    started_at: datetime
    duration_seconds: int
    questions: list[QuestionOut]
