class DomainError(Exception):
    """
    Tüm domain (iş mantığı) hataları için temel sınıf.

    Bu sınıf doğrudan fırlatılmamalı, alt sınıflar tarafından miras alınmalıdır.
    """

    pass
