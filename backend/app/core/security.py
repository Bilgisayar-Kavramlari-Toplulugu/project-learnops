import base64

from cryptography.fernet import Fernet

from app.config import settings


def _get_fernet() -> Fernet:
    """Create Fernet instance from env key.

    Accepts either::
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
