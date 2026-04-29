from .base import DomainError


class AccessDeniedError(DomainError):
    """
    Kullanıcı yetkisi olmayan bir işleme erişmeye çalıştığında fırlatılır.

    HTTP Karşılığı: 403 Forbidden
    Örnek: Bir kullanıcının başka bir kullanıcının sınav sonuçlarını görmeye çalışması.
    """

    pass
