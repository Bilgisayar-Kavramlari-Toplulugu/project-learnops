from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict

class QuestionOptionOut(BaseModel):
    index: int
    text: str


class QuestionOut(BaseModel):
    """
    Client'a dönülecek soru şeması.
    GÜVENLİK (NF-05): correct_index KESİNLİKLE DÖNÜLMEZ.

    NOT — MVP §9.1 ile bilinçli sapma:
    Spec'te response'un 'order' alanı içereceği belirtilmiştir.
    Ancak sorular randomize sırayla döndüğünden order_index açıklanırsa
    client orijinal sıraya geri döndürebilir ve randomization anlamsız hale gelir.
    Bu nedenle order_index response'a dahil edilmemiştir. MVP §9.1 güncellenmelidir.
    """

    id: UUID
    text: str
    options: list[QuestionOptionOut]


class QuizAttemptResponse(BaseModel):
    """
    Quiz attempt başlatıldığında dönülecek response.
    Router doğrudan QuizAttemptResponse(...) instance'ı döndürür;
    ORM nesnesi commit öncesi Pydantic modeline alındığından
    from_attributes gerekmez.
    """

    id: UUID
    quiz_id: UUID
    started_at: datetime
    duration_seconds: int
    questions: list[QuestionOut]



class QuestionBasic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    text: str
    options: list[QuestionOptionOut]
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
