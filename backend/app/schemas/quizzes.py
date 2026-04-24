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
