"""
Canonical authentication dependency — LearnOps Backend (BE-26).

Tüm authenticated endpoint'ler bu modüldeki get_current_user fonksiyonunu
kullanır. Authorization header tabanlı auth KULLANILMAZ; access_token yalnızca
httpOnly cookie üzerinden okunur.

Hata hiyerarşisi (öncelik sırasına göre):
  1. Cookie yoksa            → 401 "Kimlik doğrulama gerekli"
  2. Token decode hatası     → 401 "Token geçersiz veya süresi dolmuş"
  3. type != "access"        → 401 "Access token gerekli"
  4. sub (user_id) yoksa     → 401 "Token geçersiz"
  5. DB'de user bulunamazsa  → 404 "Kullanıcı bulunamadı"
  6. Başarı                  → User ORM nesnesi döner
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyCookie
from jwt.exceptions import PyJWTError as JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.users import User
from app.services.jwt_service import decode_token

# Canonical Cookie Scheme (BE-26)
# auto_error=False is mandatory to allow custom 401 messages instead of default 403.
cookie_scheme = APIKeyCookie(name=settings.ACCESS_TOKEN_COOKIE_NAME, auto_error=False)


async def get_current_user(
    token: str = Depends(cookie_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Cookie tabanlı authentication dependency.

    access_token httpOnly cookie'den okunur; Authorization header
    kasıtlı olarak görmezden gelinir (browser httpOnly cookie'yi
    header'a ekleyemez).

    Returns:
        User ORM nesnesi (user_id değil, tam nesne).
    """
    # 1. Cookie kontrolü
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kimlik doğrulama gerekli",
        )

    # 2. Token decode
    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz veya süresi dolmuş",
        )

    # 3. Token type kontrolü
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token gerekli",
        )

    # 4. sub (user_id) kontrolü
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz",
        )

    # 5. DB'den user çek (tek sorgu)
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Kullanıcı bulunamadı",
        )

    # 6. Başarı
    return user
