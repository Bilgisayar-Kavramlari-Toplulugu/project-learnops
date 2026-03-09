"""
Rate Limiting Middleware Tests
BE-09: Tests for rate limiting implementation

Tests real middleware behavior without mocks.
"""

import pytest
from datetime import datetime,timedelta
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.fixture
def client_ip():
    return "203.0.113.1"


@pytest.fixture(autouse=True)
def reset_rate_limiter():
    """Reset rate limiter before each test."""

    from app.middleware.rate_limiting import _instance

    if _instance is not None:
        _instance.request_counts.clear()
    yield



@pytest.mark.asyncio
async def test_auth_rate_limit_exceeded():
    """11. istekte /auth/* 429 dönmeli."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # İlk 10 istek geçmeli
        for i in range(10):
            r = await ac.post(
                "/auth/login",  # Endpoint olmasa da middleware çalışır
                headers={"X-Forwarded-For": "203.0.113.1"}
            )
            # 404 OK - endpoint yok ama rate limit geçti
            assert r.status_code != 429, f"Request {i + 1} should not be rate limited"

        # 11. istek 429 dönmeli
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "203.0.113.1"}
        )
        assert r.status_code == 429, "11th request should return 429"
        assert r.json()["error"] == "Too Many Requests"
        assert "retry_after_seconds" in r.json()


@pytest.mark.asyncio
async def test_api_rate_limit_exceeded():
    """101. istekte genel API 429 dönmeli."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # İlk 100 istek geçmeli
        for i in range(100):
            r = await ac.get(
                "/api/users",
                headers={"X-Forwarded-For": "203.0.113.2"}
            )
            assert r.status_code != 429, f"Request {i + 1} should not be rate limited"

        # 101. istek 429 dönmeli
        r = await ac.get(
            "/api/users",
            headers={"X-Forwarded-For": "203.0.113.2"}
        )
        assert r.status_code == 429, "101st request should return 429"


@pytest.mark.asyncio
async def test_health_endpoint_exempt():
    """/health endpoint rate limit'ten muaf olmalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # 200 istek gönder - hiçbiri rate limited olmamalı
        for _ in range(200):
            r = await ac.get(
                "/health",
                headers={"X-Forwarded-For": "203.0.113.3"}
            )
            assert r.status_code != 429, "/health should never be rate limited"


@pytest.mark.asyncio
async def test_retry_after_seconds_positive():
    """retry_after_seconds > 0 ve <= window_seconds (60) olmalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # Limit'e ulaş
        for _ in range(10):
            await ac.post(
                "/auth/login",
                headers={"X-Forwarded-For": "203.0.113.4"}
            )

        # 11. istek
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "203.0.113.4"}
        )

        assert r.status_code == 429
        retry_after = r.json()["retry_after_seconds"]
        assert 0 < retry_after <= 60, f"retry_after should be between 0 and 60, got {retry_after}"


@pytest.mark.asyncio
async def test_retry_after_header_present():
    """RFC 6585: 429 response'unda Retry-After header olmalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # Limit'e ulaş
        for _ in range(10):
            await ac.post(
                "/auth/login",
                headers={"X-Forwarded-For": "203.0.113.5"}
            )

        # 11. istek - 429 al
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "203.0.113.5"}
        )

        assert r.status_code == 429
        assert "Retry-After" in r.headers, "Retry-After header missing"
        assert int(r.headers["Retry-After"]) > 0


@pytest.mark.asyncio
async def test_different_ips_independent_counters():
    """Farklı IP'lerin sayacı birbirini etkilememeli."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # IP 1: Limit doldur
        for _ in range(10):
            await ac.post(
                "/auth/login",
                headers={"X-Forwarded-For": "1.1.1.1"}
            )

        # IP 1: 11. istek - 429
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "1.1.1.1"}
        )
        assert r.status_code == 429, "IP 1.1.1.1 should be rate limited"

        # IP 2: İlk istek - geçmeli
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "2.2.2.2"}
        )
        assert r.status_code != 429, "IP 2.2.2.2 should not be rate limited"


@pytest.mark.asyncio
async def test_independent_endpoint_patterns():
    """Auth ve API endpoint'leri bağımsız sayaçlara sahip olmalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # Auth limit doldur
        for _ in range(10):
            await ac.post(
                "/auth/login",
                headers={"X-Forwarded-For": "203.0.113.6"}
            )

        # Auth rate limited
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "203.0.113.6"}
        )
        assert r.status_code == 429, "Auth should be rate limited"

        # API hala çalışmalı (aynı IP!)
        r = await ac.get(
            "/api/users",
            headers={"X-Forwarded-For": "203.0.113.6"}
        )
        assert r.status_code != 429, "API should not be rate limited (independent counter)"


@pytest.mark.asyncio
async def test_options_preflight_exempt():
    """OPTIONS preflight istekleri sayaca dahil olmamalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        # 150 OPTIONS isteği
        for _ in range(150):
            r = await ac.options(
                "/auth/login",
                headers={"X-Forwarded-For": "203.0.113.7"}
            )
            # OPTIONS istekleri rate limited olmamalı
            assert r.status_code != 429, "OPTIONS requests should not be rate limited"

        # POST isteği hala çalışmalı (OPTIONS sayılmadı)
        r = await ac.post(
            "/auth/login",
            headers={"X-Forwarded-For": "203.0.113.7"}
        )
        assert r.status_code != 429, "First POST should work (OPTIONS not counted)"


@pytest.mark.asyncio
async def test_window_reset_allows_new_requests():
    """Window süresi geçtikçe sayaç sıfırlanmalı, yeni istekler geçmeli."""
    from app.middleware.rate_limiting import _instance

    test_ip = "203.0.113.99"

    # 61 saniye öncesine set et — window dolmuş gibi davransın
    past_time = datetime.now() - timedelta(seconds=61)
    _instance.request_counts[test_ip]["/auth"] = (past_time, 10)

    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        r = await ac.post("/auth/login", headers={"X-Forwarded-For": test_ip})
        assert r.status_code != 429  # Window reset — geçmeli


@pytest.mark.asyncio
async def test_docs_endpoint_exempt():
    """/docs endpoint rate limit'ten muaf olmalı."""
    async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        for _ in range(200):
            r = await ac.get(
                "/docs",
                headers={"X-Forwarded-For": "203.0.113.8"}
            )
            assert r.status_code != 429, "/docs should never be rate limited"