import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from jwt.exceptions import PyJWTError as JWTError

from app.config import settings
from app.services.jwt_service import (
    ALGORITHM,
    _blacklisted_tokens,
    blacklist_token,
    create_access_token,
    create_refresh_token,
    decode_token,
    is_blacklisted,
)


@pytest.fixture(autouse=True)
def clear_blacklist():
    _blacklisted_tokens.clear()
    yield
    _blacklisted_tokens.clear()


# ---------- 1. Token doğrulama başarılı ----------


def test_access_token_valid():
    """Access token üretilir ve decode edilir — sub doğru döner."""
    token = create_access_token(sub="user-123")
    payload = decode_token(token)

    assert payload["sub"] == "user-123"
    assert payload["type"] == "access"


def test_refresh_token_valid():
    """Refresh token üretilir ve decode edilir — sub ve jti doğru döner."""
    token = create_refresh_token(sub="user-456")
    payload = decode_token(token)

    assert payload["sub"] == "user-456"
    assert payload["type"] == "refresh"


def test_access_token_has_correct_expiry():
    """Access token'ın exp süresi ~15 dakika olmalı."""
    token = create_access_token(sub="user-789")
    payload = decode_token(token)

    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = exp - now

    assert timedelta(minutes=14) < diff <= timedelta(minutes=15)


def test_refresh_token_has_correct_expiry():
    """Refresh token'ın exp süresi ~7 gün olmalı."""
    token = create_refresh_token(sub="user-789")
    payload = decode_token(token)

    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    now = datetime.now(timezone.utc)
    diff = exp - now

    assert timedelta(days=6, hours=23) < diff <= timedelta(days=7)


# ---------- 2. Süresi dolmuş token → JWTError ----------


def test_expired_access_token_raises():
    """Süresi dolmuş access token decode edilince JWTError fırlatır."""
    expired_payload = {
        "sub": "user-123",
        "type": "access",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }
    token = jwt.encode(expired_payload, settings.JWT_SECRET, algorithm=ALGORITHM)

    with pytest.raises(JWTError):
        decode_token(token)


def test_invalid_signature_raises():
    """Yanlış secret ile imzalanmış token reddedilir."""
    payload = {
        "sub": "user-123",
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    token = jwt.encode(
        payload, "wrong-secret-key-12345678901234567", algorithm=ALGORITHM
    )

    with pytest.raises(JWTError):
        decode_token(token)


# ---------- 3. Blacklist — logout sonrası çalışır ----------


def test_blacklist_token():
    """Token blacklist'e eklenir ve kontrol edilir."""
    jti = str(uuid.uuid4())

    assert is_blacklisted(jti) is False

    blacklist_token(jti)

    assert is_blacklisted(jti) is True


def test_blacklist_does_not_affect_other_tokens():
    """Bir token blacklist'e eklenmesi diğerlerini etkilemez."""
    jti_1 = str(uuid.uuid4())
    jti_2 = str(uuid.uuid4())

    blacklist_token(jti_1)

    assert is_blacklisted(jti_1) is True
    assert is_blacklisted(jti_2) is False
