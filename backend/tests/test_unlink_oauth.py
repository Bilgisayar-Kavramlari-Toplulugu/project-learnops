"""
Tests for /v1/users/me/accounts endpoints — BE-12

Coverage:
  DELETE /v1/users/me/accounts/{id}:
  - 2 OAuth hesabı olan kullanıcı birini siler → 204, DB'de 1 hesap kalır
  - Son OAuth hesabını silmeye çalışır → 400
  - Var olmayan UUID ile silme → 404
  - Başka kullanıcının hesabını silme (IDOR kontrolü) → 404
  - Auth header olmadan çağrı → 401/403

  GET /v1/users/me/accounts:
  - 2 hesaplı kullanıcı → 200, 2 account döner
  - Auth yok → 401/403
  - Unlink sonrası → 1 account döner
"""

import uuid

import pytest

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.users import OAuthAccount, User
from app.services.jwt_service import create_access_token


@pytest_asyncio.fixture
async def test_user_with_two_accounts(db_session: AsyncSession) -> User:
    """
    Persisted User with two linked OAuth accounts (Google + GitHub).
    Visible within session via flush(). Rolled back after test.
    """
    user = User(
        email="multi-oauth@example.com",
        display_name="Multi OAuth User",
    )
    db_session.add(user)
    await db_session.flush()

    google_oauth = OAuthAccount(
        user_id=user.id,
        provider="google",
        provider_user_id="google-multi-123",
        provider_email="multi-oauth@example.com",
    )
    github_oauth = OAuthAccount(
        user_id=user.id,
        provider="github",
        provider_user_id="github-multi-456",
        provider_email="multi-oauth@example.com",
    )
    db_session.add_all([google_oauth, github_oauth])
    await db_session.flush()

    # Refresh to load oauth_accounts relationship & get generated IDs
    await db_session.refresh(user, attribute_names=["oauth_accounts"])
    return user


# ---------------------------------------------------------------------------
# DELETE /v1/users/me/accounts/{id} — Success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unlink_oauth_success(
    client: AsyncClient,
    test_user_with_two_accounts: User,
    db_session: AsyncSession,
):
    """2 OAuth hesabı olan kullanıcı birini siler → 204, DB'de 1 hesap kalır."""
    user = test_user_with_two_accounts
    account_to_delete = user.oauth_accounts[0]

    access_token = create_access_token(sub=str(user.id))
    response = await client.delete(
        f"/v1/users/me/accounts/{account_to_delete.id}",
        cookies={"access_token": access_token},
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # DB'de 1 hesap kaldığını doğrula
    result = await db_session.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == user.id)
    )
    remaining = result.scalars().all()
    assert len(remaining) == 1
    assert remaining[0].id != account_to_delete.id


# ---------------------------------------------------------------------------
# DELETE /v1/users/me/accounts/{id} — Last account (400)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unlink_last_account_blocked(
    client: AsyncClient,
    test_user_with_two_accounts: User,
    db_session: AsyncSession,
):
    """Tek kalan hesabı silmeye çalışır → 400."""
    user = test_user_with_two_accounts
    accounts = user.oauth_accounts

    access_token = create_access_token(sub=str(user.id))
    cookies = {"access_token": access_token}

    # İlk hesabı sil (2 → 1)
    resp1 = await client.delete(
        f"/v1/users/me/accounts/{accounts[0].id}",
        cookies=cookies,
    )
    assert resp1.status_code == status.HTTP_204_NO_CONTENT

    # Son kalan hesabı silmeye çalış (1 → 0 engellenmeli)
    resp2 = await client.delete(
        f"/v1/users/me/accounts/{accounts[1].id}",
        cookies=cookies,
    )
    assert resp2.status_code == status.HTTP_400_BAD_REQUEST
    assert "En az bir OAuth hesabı" in resp2.json()["detail"]


# ---------------------------------------------------------------------------
# DELETE /v1/users/me/accounts/{id} — Not found (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unlink_nonexistent_account_returns_404(
    client: AsyncClient,
    test_user: User,
):
    """Var olmayan UUID ile silme → 404."""
    access_token = create_access_token(sub=str(test_user.id))
    fake_id = uuid.uuid4()

    response = await client.delete(
        f"/v1/users/me/accounts/{fake_id}",
        cookies={"access_token": access_token},
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND
    assert "bulunamadı" in response.json()["detail"]


# ---------------------------------------------------------------------------
# DELETE /v1/users/me/accounts/{id} — IDOR protection (404)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unlink_other_users_account_returns_404(
    client: AsyncClient,
    test_user_with_two_accounts: User,
    db_session: AsyncSession,
):
    """Başka kullanıcının hesabını silme (IDOR kontrolü) → 404."""
    # Saldırgan kullanıcı oluştur
    attacker = User(
        email="attacker@example.com",
        display_name="Attacker",
    )
    db_session.add(attacker)
    await db_session.flush()

    attacker_oauth = OAuthAccount(
        user_id=attacker.id,
        provider="google",
        provider_user_id="google-attacker-999",
        provider_email="attacker@example.com",
    )
    db_session.add(attacker_oauth)
    await db_session.flush()

    # Saldırgan, kurbanın hesabını silmeye çalışır
    victim_account_id = test_user_with_two_accounts.oauth_accounts[0].id
    attacker_token = create_access_token(sub=str(attacker.id))

    response = await client.delete(
        f"/v1/users/me/accounts/{victim_account_id}",
        cookies={"access_token": attacker_token},
    )

    assert response.status_code == status.HTTP_404_NOT_FOUND


# ---------------------------------------------------------------------------
# DELETE /v1/users/me/accounts/{id} — No auth (401/403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_unlink_without_auth_returns_401_or_403(
    client: AsyncClient,
):
    """Auth header olmadan çağrı → 401 veya 403."""
    fake_id = uuid.uuid4()

    response = await client.delete(
        f"/v1/users/me/accounts/{fake_id}",
    )

    assert response.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )


# ---------------------------------------------------------------------------
# GET /v1/users/me/accounts — Success
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_accounts_success(
    client: AsyncClient,
    test_user_with_two_accounts: User,
):
    """2 OAuth hesabı olan kullanıcı → 200, 2 account döner."""
    user = test_user_with_two_accounts
    access_token = create_access_token(sub=str(user.id))

    response = await client.get(
        "/v1/users/me/accounts",
        cookies={"access_token": access_token},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["accounts"]) == 2

    providers = {acc["provider"] for acc in data["accounts"]}
    assert providers == {"google", "github"}

    # Her account'ta gerekli alanlar var
    for acc in data["accounts"]:
        assert "id" in acc
        assert "provider" in acc
        assert "provider_email" in acc
        assert "linked_at" in acc


# ---------------------------------------------------------------------------
# GET /v1/users/me/accounts — No auth (401/403)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_accounts_without_auth_returns_401_or_403(
    client: AsyncClient,
):
    """Auth header olmadan GET → 401 veya 403."""
    response = await client.get("/v1/users/me/accounts")

    assert response.status_code in (
        status.HTTP_401_UNAUTHORIZED,
        status.HTTP_403_FORBIDDEN,
    )


# ---------------------------------------------------------------------------
# GET /v1/users/me/accounts — After unlink
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_list_accounts_after_unlink(
    client: AsyncClient,
    test_user_with_two_accounts: User,
):
    """Unlink sonrası GET → 1 account döner."""
    user = test_user_with_two_accounts
    access_token = create_access_token(sub=str(user.id))
    cookies = {"access_token": access_token}

    # İlk hesabı sil
    account_to_delete = user.oauth_accounts[0]
    delete_resp = await client.delete(
        f"/v1/users/me/accounts/{account_to_delete.id}",
        cookies=cookies,
    )
    assert delete_resp.status_code == status.HTTP_204_NO_CONTENT

    # Listele — 1 hesap kalmış olmalı
    list_resp = await client.get("/v1/users/me/accounts", cookies=cookies)
    assert list_resp.status_code == status.HTTP_200_OK
    data = list_resp.json()
    assert len(data["accounts"]) == 1
    assert data["accounts"][0]["id"] != str(account_to_delete.id)
