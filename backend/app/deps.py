from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.services.jwt_service import decode_token

# Optional=True so we can handle missing header manually with cookies
security = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    """
    Yetkilendirme sağlamak için hem Authorization: Bearer hem de 'access_token'
    çerezini kontrol eder. Geçersiz veya süresi dolmuş token → 401
    """
    token = None

    # 1. Başlık kontrolü (Bearer token)
    if credentials:
        token = credentials.credentials

    # 2. Çerez kontrolü (Eğer başlık yoksa)
    if not token:
        token = request.cookies.get("access_token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Oturum doğrulaması başarısız: Token eksik",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = decode_token(token)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz veya süresi dolmuş",
        )

    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token gerekli",
        )

    sub: str | None = payload.get("sub")
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token geçersiz",
        )

    return sub
