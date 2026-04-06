"""Tests for /v1/auth/refresh, /v1/auth/logout endpoints and get_current_user dep."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from jose import jwt
from starlette.middleware.sessions import SessionMiddleware

from app.config import settings
from app.routers import auth
from app.services.jwt_service import (
    ALGORITHM,
    _blacklisted_tokens,
    create_access_token,
    create_refresh_token,
)

# ---------- Test app (no DB needed for refresh/logout) ----------

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="test-secret")
app.include_router(auth.router, prefix="/v1")
client = TestClient(app)


@pytest.fixture(autouse=True)
def clear_blacklist():
    _blacklisted_tokens.clear()
    yield
    _blacklisted_tokens.clear()


def _make_refresh_token(
    sub: str = "user-123",
) -> str:  # ← tuple[str, str] değil, sadece str
    """Helper: create a refresh token."""
    return create_refresh_token(sub=sub)


def _make_access_token(sub: str = "user-123") -> str:
    return create_access_token(sub=sub)


# ==================== /refresh ====================


def test_refresh_returns_new_tokens():
    token = _make_refresh_token()
    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_rotates_token_blacklists_old():
    token = _make_refresh_token()

    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp.status_code == 200

    # Same token should be blacklisted now (rotation)
    resp2 = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp2.status_code == 401


def test_refresh_rejects_access_token():
    access = _make_access_token()
    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": access})
    assert resp.status_code == 401


def test_refresh_rejects_expired_token():
    payload = {
        "sub": "user-123",
        "type": "refresh",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
        "jti": str(uuid.uuid4()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)
    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp.status_code == 401


def test_refresh_rejects_invalid_signature():
    payload = {
        "sub": "user-123",
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "jti": str(uuid.uuid4()),
    }
    token = jwt.encode(
        payload, "wrong-secret-key-12345678901234567", algorithm=ALGORITHM
    )
    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp.status_code == 401


def test_refresh_rejects_token_without_sub():
    payload = {
        "type": "refresh",
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "jti": str(uuid.uuid4()),
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)
    resp = client.post("/v1/auth/refresh", cookies={"refresh_token": token})
    assert resp.status_code == 401


# ==================== /logout ====================


def test_logout_blacklists_refresh_token():
    refresh = _make_refresh_token()

    resp = client.post("/v1/auth/logout", cookies={"refresh_token": refresh})
    assert resp.status_code == 204

    # Token should now be blacklisted — refresh should fail
    resp2 = client.post("/v1/auth/refresh", cookies={"refresh_token": refresh})
    assert resp2.status_code == 401


def test_logout_without_cookie_still_succeeds():
    """Logout with no cookie should return 204 (idempotent)."""
    resp = client.post("/v1/auth/logout")
    assert resp.status_code == 204


def test_logout_with_invalid_refresh_token_still_succeeds():
    """Logout with already-invalid refresh token should return 204 (idempotent)."""
    resp = client.post(
        "/v1/auth/logout",
        cookies={"refresh_token": "garbage.token.value"},
    )
    assert resp.status_code == 204


def test_logout_with_access_token_as_refresh_cookie_still_succeeds():
    """Logout with access token in refresh cookie
    returns 204 (token not blacklisted)."""
    access = _make_access_token()
    resp = client.post("/v1/auth/logout", cookies={"refresh_token": access})
    assert resp.status_code == 204
