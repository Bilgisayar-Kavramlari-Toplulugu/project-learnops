import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config import settings

ALGORITHM = "HS256"

# ---------- Blacklist (in-memory set) ----------
# TODO: Bu in-memory implementasyon single-instance geliştirme içindir.
# Production'da Cloud Run multi-instance çalıştığından Redis veya DB-backed
# blacklist'e migrate edilmeli.
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
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": sub,
        "type": "access",
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def create_refresh_token(sub: str) -> str:

    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )

    payload = {
        "sub": sub,
        "type": "refresh",
        "exp": expire,
        "jti": jti,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


# ---------- Token doğrulama ----------
def decode_token(token: str) -> dict:
    """Token'ı decode eder. Geçersiz veya süresi dolmuşsa JWTError fırlatır."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])


# ---------- Merge Token  ----------
def create_merge_token(
    user_id: str, new_provider: str, provider_user_id: str, provider_email: str
) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    payload = {
        "user_id": user_id,
        "new_provider": new_provider,
        "provider_user_id": provider_user_id,
        "provider_email": provider_email,
        "type": "merge",
        "exp": expire,
        "jti": str(uuid.uuid4()),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_merge_token(token: str) -> dict:
    payload = decode_token(token)

    if payload.get("type") != "merge":
        raise JWTError("Invalid token type")

    return payload
