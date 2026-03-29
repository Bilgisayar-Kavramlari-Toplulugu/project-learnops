"""Tests for GET /v1/users/me and PATCH /v1/users/me endpoints."""

import pytest
from httpx import AsyncClient

from app.models.users import User
from app.services.jwt_service import create_access_token


def _auth_cookies(user: User) -> dict:
    token = create_access_token(sub=str(user.id))
    return {"access_token": token}


# ==================== GET /users/me ====================


@pytest.mark.asyncio
async def test_get_me_without_token_returns_401(client: AsyncClient):
    resp = await client.get("/v1/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_me_returns_profile(client: AsyncClient, test_user: User):
    resp = await client.get("/v1/users/me", cookies=_auth_cookies(test_user))
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == str(test_user.id)
    assert data["email"] == test_user.email
    assert data["display_name"] == test_user.display_name


# ==================== GET /users/me/accounts ====================


@pytest.mark.asyncio
async def test_get_accounts_without_token_returns_401(client: AsyncClient):
    resp = await client.get("/v1/users/me/accounts")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_accounts_returns_linked_accounts(client: AsyncClient, test_user: User):
    resp = await client.get("/v1/users/me/accounts", cookies=_auth_cookies(test_user))
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    account = data[0]
    assert account["provider"] == "google"
    assert account["provider_email"] == test_user.email
    assert "id" in account
    assert "linked_at" in account


# ==================== PATCH /users/me ====================


@pytest.mark.asyncio
async def test_patch_me_invalid_avatar_type_returns_422(
    client: AsyncClient, test_user: User
):
    resp = await client.patch(
        "/v1/users/me",
        json={"avatar_type": "invalid_avatar"},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_patch_me_empty_display_name_returns_422(
    client: AsyncClient, test_user: User
):
    resp = await client.patch(
        "/v1/users/me",
        json={"display_name": "   "},
        cookies=_auth_cookies(test_user),
    )
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_patch_me_update_reflected_in_get(
    client: AsyncClient, test_user: User
):
    cookies = _auth_cookies(test_user)
    await client.patch(
        "/v1/users/me",
        json={"display_name": "Updated Name", "avatar_type": "system_3"},
        cookies=cookies,
    )

    resp = await client.get("/v1/users/me", cookies=cookies)
    assert resp.status_code == 200
    data = resp.json()
    assert data["display_name"] == "Updated Name"
    assert data["avatar_type"] == "system_3"
