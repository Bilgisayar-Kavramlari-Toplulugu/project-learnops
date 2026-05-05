"""
Tests for the canonical authentication dependency — BE-26 (ADIM 8).

Covers:
- test_valid_cookie_returns_user: geçerli cookie → User ORM döner
- test_missing_cookie_returns_401: cookie yok → 401
- test_expired_token_returns_401: süresi dolmuş → 401
- test_wrong_type_refresh_returns_401: type="refresh" → 401
- test_invalid_signature_returns_401: yanlış secret → 401
- test_nonexistent_user_returns_404: UUID DB'de yok → 404
- test_authorization_header_ignored: cookie yok, header var → 401
- test_no_extra_db_query: user için yalnızca 1 DB sorgusu atılır
"""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import jwt
import pytest
from httpx import AsyncClient

from app.config import settings
from app.dependencies.auth import get_current_user
from app.models.users import User
from app.services.jwt_service import (
    ALGORITHM,
    create_access_token,
    create_refresh_token,
)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _make_expired_access_token(sub: str) -> str:
    """Süresi dolmuş access token üretir."""
    payload = {
        "sub": sub,
        "type": "access",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=5),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def _make_token_wrong_secret(sub: str) -> str:
    """Yanlış secret ile imzalanmış access token üretir."""
    payload = {
        "sub": sub,
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(
        payload, "wrong-secret-key-12345678901234567", algorithm=ALGORITHM
    )


def _make_token_no_sub() -> str:
    """sub alanı olmayan access token üretir."""
    payload = {
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_valid_cookie_returns_user(client: AsyncClient, test_user: User):
    """Geçerli access_token cookie → 200 + User verileri döner."""
    token = create_access_token(sub=str(test_user.id))

    resp = await client.get("/v1/users/me", cookies={"access_token": token})

    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(test_user.id)
    assert data["email"] == test_user.email


@pytest.mark.asyncio
async def test_missing_cookie_returns_401(client: AsyncClient):
    """Cookie yok → 401 'Kimlik doğrulama gerekli'."""
    resp = await client.get("/v1/users/me")

    assert resp.status_code == 401
    assert "Kimlik doğrulama gerekli" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_expired_token_returns_401(client: AsyncClient, test_user: User):
    """Süresi dolmuş token → 401 'Token geçersiz veya süresi dolmuş'."""
    token = _make_expired_access_token(sub=str(test_user.id))

    resp = await client.get("/v1/users/me", cookies={"access_token": token})

    assert resp.status_code == 401
    assert "Token geçersiz veya süresi dolmuş" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_wrong_type_refresh_returns_401(client: AsyncClient, test_user: User):
    """type='refresh' token → 401 'Access token gerekli'."""
    refresh_token = create_refresh_token(sub=str(test_user.id))

    resp = await client.get("/v1/users/me", cookies={"access_token": refresh_token})

    assert resp.status_code == 401
    assert "Access token gerekli" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_invalid_signature_returns_401(client: AsyncClient, test_user: User):
    """Yanlış secret ile imzalanmış token → 401."""
    token = _make_token_wrong_secret(sub=str(test_user.id))

    resp = await client.get("/v1/users/me", cookies={"access_token": token})

    assert resp.status_code == 401
    assert "Token geçersiz veya süresi dolmuş" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_nonexistent_user_returns_404(client: AsyncClient):
    """Geçerli token ama DB'de olmayan user_id → 404 'Kullanıcı bulunamadı'."""
    fake_user_id = str(uuid.uuid4())
    token = create_access_token(sub=fake_user_id)

    resp = await client.get("/v1/users/me", cookies={"access_token": token})

    assert resp.status_code == 404
    assert "Kullanıcı bulunamadı" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_authorization_header_ignored(client: AsyncClient, test_user: User):
    """Cookie yok, Authorization header var → 401.
    Header tabanlı auth'un tamamen devre dışı olduğunu kanıtlar."""
    token = create_access_token(sub=str(test_user.id))

    resp = await client.get(
        "/v1/users/me",
        headers={"Authorization": f"Bearer {token}"},
        # cookie yok — sadece header
    )

    assert resp.status_code == 401
    assert "Kimlik doğrulama gerekli" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_no_extra_db_query(test_user: User):
    """
    User çekmek için yalnızca 1 DB sorgusu atıldığını doğrular (Performance/BE-26).
    """
    token = create_access_token(sub=str(test_user.id))

    # Mock DB Session
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = test_user
    mock_db.execute.return_value = mock_result

    # Dependency'i doğrudan çağır
    user = await get_current_user(token=token, db=mock_db)

    assert user == test_user
    # execute() tam olarak 1 kez çağrılmış olmalı
    assert mock_db.execute.call_count == 1


@pytest.mark.asyncio
async def test_token_without_sub_returns_401(client: AsyncClient):
    """sub alanı olmayan token → 401 'Token geçersiz'."""
    token = _make_token_no_sub()

    resp = await client.get("/v1/users/me", cookies={"access_token": token})

    assert resp.status_code == 401
    assert "Token geçersiz" in resp.json()["detail"]
