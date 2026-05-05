"""
Canonical dependency injection modülü — LearnOps Backend.

Tüm authenticated endpoint'ler YALNIZCA bu paketteki get_current_user
bağımlılığını kullanmalıdır.

Kullanım:
    from app.dependencies.auth import get_current_user
    # veya
    from app.dependencies import get_current_user
"""

from app.dependencies.auth import get_current_user  # noqa: F401

__all__ = ["get_current_user"]
