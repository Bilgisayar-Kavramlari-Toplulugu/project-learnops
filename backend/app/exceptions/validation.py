from .base import DomainError


class ValidationError(DomainError):
    """
    İş mantığı kuralları ihlal edildiğinde veya geçersiz veri gönderildiğinde
    fırlatılır.

    HTTP Karşılığı: 400 Bad Request
    Örnek: Halen devam eden bir sınavın sonuçlarını talep etmek veya
    yanlış formatta veri göndermek.
    """

    pass
