from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# Submit Request Şemaları
# ---------------------------------------------------------------------------


class SubmitAnswerItem(BaseModel):
    """Tek bir soruya verilen cevabı temsil eder.
    selected_index=None → soru cevapsız bırakıldı (süre doldu vb.)
    Alt sınır (>= 0) bu şema tarafından (ge=0), üst sınır (< options uzunluğu)
    servis katmanında kontrol edilir.
    """

    question_id: UUID
    selected_index: int | None = Field(default=None, ge=0)


class QuizSubmitRequest(BaseModel):
    """POST /quiz-attempts/{id}/submit request body."""

    answers: list[SubmitAnswerItem]


# ---------------------------------------------------------------------------
# Submit Response Şemaları
# ---------------------------------------------------------------------------


class AnswerResultItem(BaseModel):
    """Submit sonrası her soru için döndürülen sonuç.
    GÜVENLİK (NF-05): correct_index YALNIZCA submit sonrası açılır.
    """

    question_id: UUID
    selected_index: int | None
    correct_index: int
    is_correct: bool
    explanation: str | None = None


class QuizSubmitResponse(BaseModel):
    """POST /quiz-attempts/{id}/submit response body."""

    attempt_id: UUID
    score: int
    total_questions: int
    passed: bool
    time_spent_secs: int
    answers: list[AnswerResultItem]


# ---------------------------------------------------------------------------
# Attempt Response Şemaları
# ---------------------------------------------------------------------------


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
