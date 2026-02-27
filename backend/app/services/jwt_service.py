from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import settings

ALGORITHM = "HS256"

# ---------- Blacklist (in-memory set) ----------
_blacklisted_tokens: set[str] = set()


def blacklist_token(jti: str) -> None:
    """Logout olan token'ın jti'sini blacklist'e ekler."""
    _blacklisted_tokens.add(jti)


def is_blacklisted(jti: str) -> bool:
    """Token blacklist'te mi kontrol eder."""
    return jti in _blacklisted_tokens


# ---------- Token üretimi ----------
def create_access_token(sub: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": sub,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def create_refresh_token(sub: str, jti: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    payload = {
        "sub": sub,
        "type": "refresh",
        "exp": expire,
        "jti": jti,
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


# ---------- Token doğrulama ----------
def decode_token(token: str) -> dict:
    """Token'ı decode eder. Geçersiz veya süresi dolmuşsa JWTError fırlatır."""
    return jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
