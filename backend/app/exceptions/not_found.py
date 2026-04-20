from .base import DomainError


class EntityNotFoundError(DomainError):
    """
    Bir kaynak veritabanında bulunamadığında fırlatılır.

    HTTP Karşılığı: 404 Not Found
    Örnek: Kurs, Kullanıcı veya Sınav denemesi bulunamadığında kullanılır.
    """

    pass
