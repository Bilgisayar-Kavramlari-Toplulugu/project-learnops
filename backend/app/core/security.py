from cryptography.fernet import Fernet
from app.config import settings
from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
import base64


def _get_fernet() -> Fernet:
    """Create Fernet instance from env key.

    Accepts either:
    - Standard Fernet key (32 url-safe base64-encoded bytes)
    - 64-char hex key (legacy format), converted to Fernet format
    """
    key = (settings.TOKEN_ENCRYPTION_KEY or "").strip()
    if not key:
        raise ValueError("TOKEN_ENCRYPTION_KEY not configured")

    try:
        return Fernet(key.encode())
    except Exception:
        pass

    # Backward compatibility: allow 32-byte hex secret in env
    try:
        raw = bytes.fromhex(key)
        if len(raw) != 32:
            raise ValueError
        fernet_key = base64.urlsafe_b64encode(raw)
        return Fernet(fernet_key)
    except Exception as exc:
        raise ValueError(
            "Invalid TOKEN_ENCRYPTION_KEY. Use Fernet key or 64-char hex key."
        ) from exc

def encrypt_token(token: str) -> str:
    """Encrypt sensitive tokens using Fernet (for refresh tokens)"""
    fernet = _get_fernet()
    encrypted = fernet.encrypt(token.encode())
    return encrypted.decode()

def decrypt_token(encrypted_token: str) -> str:
    """Decrypt sensitive tokens"""
    fernet = _get_fernet()
    decrypted = fernet.decrypt(encrypted_token.encode())
    return decrypted.decode()

def create_access_token(data: dict) -> str:
    """Create JWT access token (15 dk)"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def create_refresh_token(data: dict) -> str:
    """Create JWT refresh token (7 gün)"""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

def verify_token(token: str, expected_type: str = "access") -> dict:
    """Verify JWT token and enforce token type."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        token_type = payload.get("type")
        if token_type != expected_type:
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
