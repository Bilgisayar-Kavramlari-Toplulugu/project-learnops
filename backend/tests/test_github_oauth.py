"""
Tests for GitHub OAuth flow — BE-06

Coverage:
- GET /auth/github/login  → JSON formatında URL döndürür
- GET /auth/github/callback → yeni kullanıcı oluşturur
- GET /auth/github/callback → mevcut GitHub kullanıcısını günceller
- GET /auth/github/callback → refresh_token_encrypted her zaman NULL
- GET /auth/github/callback → email gizliyse /user/emails fallback çalışır
- GET /auth/github/callback → CSRF (state) koruması çalışır
- GET /auth/github/callback → email çakışması → conflict response yönlendirmesi

GitHub refresh token SAĞLAMAZ — bu beklenen davranış, hata değil.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.middleware import rate_limiting
from app.models.users import OAuthAccount, User


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    if rate_limiting._instance is not None:
        rate_limiting._instance.request_counts.clear()
    yield
    if rate_limiting._instance is not None:
        rate_limiting._instance.request_counts.clear()


# ---------------------------------------------------------------------------
# Mock helpers
# ---------------------------------------------------------------------------

GITHUB_USER_ID = 12345678
GITHUB_USER_EMAIL = "ghuser@example.com"
GITHUB_LOGIN = "ghuser"


def _mock_response(status_code: int, json_data: dict) -> MagicMock:
    """Sahte httpx Response nesnesi üretir."""
    mock = MagicMock()
    mock.status_code = status_code
    mock.json.return_value = json_data
    return mock


def _mock_async_client(post_side_effect=None, get_side_effect=None) -> AsyncMock:
    """
    httpx.AsyncClient'ı async context manager olarak taklit eder.
    post_side_effect / get_side_effect: sırayla dönecek response listesi.
    """
    mock = AsyncMock()
    mock.__aenter__ = AsyncMock(return_value=mock)
    mock.__aexit__ = AsyncMock(return_value=False)
    if post_side_effect is not None:
        mock.post = AsyncMock(side_effect=post_side_effect)
    if get_side_effect is not None:
        mock.get = AsyncMock(side_effect=get_side_effect)
    return mock


def _token_client_mock() -> AsyncMock:
    """GitHub token exchange için mock client."""
    token_resp = _mock_response(
        200,
        {"access_token": "ghs_test_access_token", "token_type": "bearer"},
    )
    return _mock_async_client(post_side_effect=[token_resp])


def _user_client_mock(
    email: str | None = GITHUB_USER_EMAIL,
    extra_emails: list[dict] | None = None,
) -> AsyncMock:
    """
    GitHub /user ve opsiyonel /user/emails için mock client.
    email=None → kullanıcı emaili gizli senaryosu.
    """
    user_resp = _mock_response(
        200,
        {
            "id": GITHUB_USER_ID,
            "login": GITHUB_LOGIN,
            "name": "GH User",
            "email": email,
        },
    )
    get_responses = [user_resp]

    if email is None:
        # /user/emails fallback
        emails_data = extra_emails or [
            {"email": GITHUB_USER_EMAIL, "primary": True, "verified": True},
            {"email": "secondary@example.com", "primary": False, "verified": True},
        ]
        emails_resp = _mock_response(200, emails_data)
        get_responses.append(emails_resp)

    return _mock_async_client(get_side_effect=get_responses)


def _patch_github_clients(token_mock: AsyncMock, user_mock: AsyncMock):
    """
    httpx.AsyncClient class'ını patch eder.
    İlk çağrı token exchange client'ı, ikinci çağrı user info client'ı döner.
    """
    return patch(
        "app.routers.auth.httpx.AsyncClient",
        side_effect=[token_mock, user_mock],
    )


# ---------------------------------------------------------------------------
# GET /auth/github/login
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_login_returns_json_url(client: AsyncClient):
    """?format=json parametresi ile login_url JSON olarak dönmeli."""
    with patch("app.routers.auth.settings") as mock_settings:
        mock_settings.github_client_id = "fake-client-id"
        mock_settings.github_client_secret = "fake-client-secret"
        response = await client.get("/v1/auth/github/login?format=json")
    assert response.status_code == 200

    data = response.json()
    assert "login_url" in data
    assert "github.com/login/oauth/authorize" in data["login_url"]
    assert (
        "scope=user%3Aemail" in data["login_url"]
        or "scope=user:email" in data["login_url"]
    )
    assert "state=" in data["login_url"]


@pytest.mark.asyncio
async def test_github_login_sets_state_cookie(client: AsyncClient):
    """Login endpoint'i oauth_state cookie'si set etmeli."""
    with patch("app.routers.auth.settings") as mock_settings:
        mock_settings.github_client_id = "fake-client-id"
        mock_settings.github_client_secret = "fake-client-secret"
        response = await client.get("/v1/auth/github/login?format=json")
    assert response.status_code == 200
    assert "oauth_state" in response.cookies


# ---------------------------------------------------------------------------
# GET /auth/github/callback — yeni kullanıcı
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_creates_new_user(
    client: AsyncClient, db_session: AsyncSession
):
    """Yeni GitHub kullanıcısı → User + OAuthAccount oluşturulmalı."""
    token_mock = _token_client_mock()
    user_mock = _user_client_mock(email=GITHUB_USER_EMAIL)

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=test_code&state=test_state",
            cookies={"oauth_state": "test_state"},
            follow_redirects=False,
        )

    # Başarılı akış dashboard'a redirect eder
    assert response.status_code == 302
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

    result = await db_session.execute(
        select(User).where(User.email == GITHUB_USER_EMAIL)
    )
    user = result.scalar_one_or_none()
    assert user is not None

    oauth_result = await db_session.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "github",
            OAuthAccount.provider_user_id == str(GITHUB_USER_ID),
        )
    )
    oauth_account = oauth_result.scalar_one_or_none()
    assert oauth_account is not None
    assert oauth_account.user_id == user.id


# ---------------------------------------------------------------------------
# GET /auth/github/callback — refresh_token_encrypted her zaman NULL
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_refresh_token_is_null(
    client: AsyncClient, db_session: AsyncSession
):
    """
    GitHub refresh token sağlamaz.
    OAuthAccount.refresh_token_encrypted = NULL olmalı, hata üretmemeli.
    Bu kabul kriterinin doğrudan testidir.
    """
    token_mock = _token_client_mock()
    user_mock = _user_client_mock(email="nulltoken@example.com")

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=test_code&state=s1",
            cookies={"oauth_state": "s1"},
            follow_redirects=False,
        )

    assert response.status_code == 302  # hata yok

    oauth_result = await db_session.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "github",
            OAuthAccount.provider_user_id == str(GITHUB_USER_ID),
        )
    )
    oauth_account = oauth_result.scalar_one_or_none()
    assert oauth_account is not None
    assert oauth_account.refresh_token_encrypted is None  # ← kabul kriteri


# ---------------------------------------------------------------------------
# GET /auth/github/callback — mevcut kullanıcı
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_updates_existing_oauth_account(
    client: AsyncClient, db_session: AsyncSession
):
    """Mevcut GitHub hesabıyla tekrar giriş → OAuthAccount güncellenir,
    duplicate oluşmaz."""
    # Önceden kayıtlı kullanıcı ve OAuth hesabı oluştur
    existing_user = User(
        email=GITHUB_USER_EMAIL,
        display_name="Existing GH User",
    )
    db_session.add(existing_user)
    await db_session.flush()

    existing_oauth = OAuthAccount(
        user_id=existing_user.id,
        provider="github",
        provider_user_id=str(GITHUB_USER_ID),
        provider_email=GITHUB_USER_EMAIL,
        refresh_token_encrypted=None,
    )
    db_session.add(existing_oauth)
    await db_session.flush()

    token_mock = _token_client_mock()
    user_mock = _user_client_mock(email=GITHUB_USER_EMAIL)

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=test_code&state=s2",
            cookies={"oauth_state": "s2"},
            follow_redirects=False,
        )

    assert response.status_code == 302

    # Duplicate OAuthAccount oluşmamalı
    result = await db_session.execute(
        select(OAuthAccount).where(
            OAuthAccount.provider == "github",
            OAuthAccount.provider_user_id == str(GITHUB_USER_ID),
        )
    )
    accounts = result.scalars().all()
    assert len(accounts) == 1


# ---------------------------------------------------------------------------
# GET /auth/github/callback — gizli email (private email) fallback
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_uses_emails_endpoint_for_private_email(
    client: AsyncClient, db_session: AsyncSession
):
    """
    /user email'i boşsa → /user/emails endpoint'inden primary+verified email alınmalı.
    """
    token_mock = _token_client_mock()
    # email=None → user_client_mock /user/emails çağrısını da ekler
    user_mock = _user_client_mock(email=None)

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=test_code&state=s3",
            cookies={"oauth_state": "s3"},
            follow_redirects=False,
        )

    assert response.status_code == 302

    result = await db_session.execute(
        select(User).where(User.email == GITHUB_USER_EMAIL)
    )
    user = result.scalar_one_or_none()
    assert user is not None, "Private email fallback çalışmadı"


# ---------------------------------------------------------------------------
# GET /auth/github/callback — CSRF (state) koruması
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_rejects_invalid_state(client: AsyncClient):
    """Yanlış state → 400 dönmeli (CSRF koruması)."""
    response = await client.get(
        "/v1/auth/github/callback?code=test_code&state=WRONG_STATE",
        cookies={"oauth_state": "CORRECT_STATE"},
        follow_redirects=False,
    )
    assert response.status_code == 400
    assert "state" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_github_callback_rejects_missing_state_cookie(client: AsyncClient):
    """oauth_state cookie yoksa → 400 dönmeli."""
    response = await client.get(
        "/v1/auth/github/callback?code=test_code&state=some_state",
        follow_redirects=False,
    )
    assert response.status_code == 400


# ---------------------------------------------------------------------------
# GET /auth/github/callback — eksik code
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_rejects_missing_code(client: AsyncClient):
    """code parametresi yoksa → 400 dönmeli."""
    response = await client.get(
        "/v1/auth/github/callback?state=s4",
        cookies={"oauth_state": "s4"},
        follow_redirects=False,
    )
    assert response.status_code == 400
    assert "code" in response.json()["detail"].lower()


# ---------------------------------------------------------------------------
# GET /auth/github/callback — GitHub token hatası
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_handles_token_error(client: AsyncClient):
    """GitHub token exchange hata dönerse → 400 dönmeli."""
    error_resp = _mock_response(
        200,
        {"error": "bad_verification_code", "error_description": "The code is expired."},
    )
    token_mock = _mock_async_client(post_side_effect=[error_resp])
    # user_mock'a gerek yok — token hatasında erken dönülür
    user_mock = _mock_async_client()

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=bad_code&state=s5",
            cookies={"oauth_state": "s5"},
            follow_redirects=False,
        )

    assert response.status_code == 400


# ---------------------------------------------------------------------------
# Email çakışması — farklı provider ile aynı email
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_github_callback_existing_email_different_provider(
    client: AsyncClient, db_session: AsyncSession
):
    """
    Aynı email Google ile kayıtlıyken GitHub ile giriş →
    yeni OAuthAccount oluşur, aynı User'a bağlanır.
    """
    # Google ile kayıtlı mevcut kullanıcı
    existing_user = User(
        email=GITHUB_USER_EMAIL,
        display_name="Google User",
    )
    db_session.add(existing_user)
    await db_session.flush()

    google_oauth = OAuthAccount(
        user_id=existing_user.id,
        provider="google",
        provider_user_id="google-id-999",
        provider_email=GITHUB_USER_EMAIL,
        refresh_token_encrypted="encrypted_google_refresh",
    )
    db_session.add(google_oauth)
    await db_session.flush()

    token_mock = _token_client_mock()
    user_mock = _user_client_mock(email=GITHUB_USER_EMAIL)

    with _patch_github_clients(token_mock, user_mock):
        response = await client.get(
            "/v1/auth/github/callback?code=test_code&state=s6",
            cookies={"oauth_state": "s6"},
            follow_redirects=False,
        )

    assert response.status_code == 302

    # Aynı kullanıcıya iki farklı provider bağlı olmalı
    result = await db_session.execute(
        select(OAuthAccount).where(OAuthAccount.user_id == existing_user.id)
    )
    accounts = result.scalars().all()
    assert len(accounts) == 2

    providers = {a.provider for a in accounts}
    assert providers == {"google", "github"}

    # GitHub'ınki NULL, Google'ınki dolu
    github_acc = next(a for a in accounts if a.provider == "github")
    google_acc = next(a for a in accounts if a.provider == "google")
    assert github_acc.refresh_token_encrypted is None
    assert google_acc.refresh_token_encrypted is not None
