"""
Tests for OAuth account conflict detection and merge flow — BE-08

Coverage:
- conflict-check: no existing user → None
- conflict-check: existing user → AccountConflictResponse with merge token
- merge: valid token → new OAuthAccount created, providers updated
- merge: invalid token → 400
- merge: consumed token → 400 (single-use enforcement)
"""

import pytest
from fastapi import status
from httpx import AsyncClient

from app.services.jwt_service import create_access_token

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _conflict_payload(
    email: str,
    provider: str = "github",
    provider_user_id: str = "gh-999",
) -> dict:
    return {
        "email": email,
        "provider": provider,
        "provider_user_id": provider_user_id,
        "provider_email": email,
    }


# ---------------------------------------------------------------------------
# POST /auth/conflict-check
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_conflict_check_no_existing_user(client: AsyncClient):
    """Unknown email → no conflict → None response."""
    response = await client.post(
        "/v1/auth/conflict-check",
        json=_conflict_payload("newcomer@example.com"),
    )
    assert response.status_code == status.HTTP_200_OK
    assert response.json() is None


@pytest.mark.asyncio
async def test_conflict_check_existing_user(client: AsyncClient, test_user):
    """Known email → conflict detected → AccountConflictResponse with merge token."""
    response = await client.post(
        "/v1/auth/conflict-check",
        json=_conflict_payload(test_user.email),
    )
    assert response.status_code == status.HTTP_200_OK

    data = response.json()
    assert data["conflict"] is True
    assert data["email"] == test_user.email
    assert "merge_token" in data
    assert len(data["merge_token"]) > 0


# ---------------------------------------------------------------------------
# POST /auth/merge
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_merge_valid_token(client: AsyncClient, test_user):
    """Valid merge token → new OAuthAccount created."""
    # 1. Conflict check (auth gerekmez)
    conflict_res = await client.post(
        "/v1/auth/conflict-check",
        json=_conflict_payload(
            test_user.email,
            provider="github",
            provider_user_id="gh-new-789",
        ),
    )
    merge_token = conflict_res.json()["merge_token"]

    # 2. Merge (auth gerekir)
    access_token = create_access_token(sub=str(test_user.id))
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    response = await client.post(
        "/v1/auth/merge",
        json={"merge_token": merge_token},
        headers=auth_headers,
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user.email
    assert "github" in data["providers"]


@pytest.mark.asyncio
async def test_merge_invalid_token(client: AsyncClient, test_user):
    """Unknown token → 400."""
    access_token = create_access_token(sub=str(test_user.id))
    auth_headers = {"Authorization": f"Bearer {access_token}"}
    response = await client.post(
        "/v1/auth/merge",
        json={"merge_token": "invalid-token-xyz"},
        headers=auth_headers,
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


@pytest.mark.asyncio
async def test_merge_token_consumed(client: AsyncClient, test_user):
    """Merge token is single-use — second attempt returns 400."""
    conflict_res = await client.post(
        "/v1/auth/conflict-check",
        json=_conflict_payload(
            test_user.email,
            provider="linkedin",
            provider_user_id="li-555",
        ),
    )
    merge_token = conflict_res.json()["merge_token"]

    access_token = create_access_token(sub=str(test_user.id))
    auth_headers = {"Authorization": f"Bearer {access_token}"}

    first = await client.post(
        "/v1/auth/merge",
        json={"merge_token": merge_token},
        headers=auth_headers,
    )
    assert first.status_code == status.HTTP_200_OK

    second = await client.post(
        "/v1/auth/merge",
        json={"merge_token": merge_token},
        headers=auth_headers,
    )
    assert second.status_code == status.HTTP_400_BAD_REQUEST
    assert "daha önce kullanılmış" in second.json()["detail"]
