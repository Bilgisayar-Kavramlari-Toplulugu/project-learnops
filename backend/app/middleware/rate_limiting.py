import logging
from collections import defaultdict
from datetime import datetime
from typing import Dict, Tuple

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger(__name__)

_instance: "RateLimiterMiddleware | None" = None


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        global _instance
        _instance = self
        # IP -> route_pattern -> (timestamp, count)
        self.request_counts: Dict[str, Dict[str, Tuple[datetime, int]]] = defaultdict(
            lambda: defaultdict(lambda: (datetime.now(), 0))
        )

    def get_client_ip(self, request: Request) -> str:
        """Get client IP with X-Forwarded-For support"""
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()

        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip

        return request.client.host if request.client else "127.0.0.1"

    def get_rate_limit(self, path: str) -> Tuple[int, int]:
        """
        Returns: (max_requests, window_seconds)
        /auth/* -> 10 req/min
        other -> 100 req/min
        """
        if path.startswith("/auth/"):
            return (10, 60)
        return (100, 60)

    async def dispatch(self, request: Request, call_next):
        # Skip OPTIONS preflight requests
        if request.method == "OPTIONS":
            return await call_next(request)

        client_ip = self.get_client_ip(request)
        path = request.url.path

        # Skip health check
        if path in ["/", "/health", "/docs", "/redoc"]:
            return await call_next(request)

        max_requests, window_seconds = self.get_rate_limit(path)
        route_key = "/auth" if path.startswith("/auth/") else "/api"

        now = datetime.now()
        last_reset, count = self.request_counts[client_ip][route_key]

        # Check if window expired
        if (now - last_reset).total_seconds() >= window_seconds:
            self.request_counts[client_ip][route_key] = (now, 1)
        elif count >= max_requests:
            # Rate limit exceeded
            retry_after = int(window_seconds - (now - last_reset).total_seconds())
            logger.warning(f"Rate limit exceeded: {client_ip} on {path}")
            return JSONResponse(
                status_code=429,
                headers={"Retry-After": str(retry_after)},
                content={
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded. Please try again later.",
                    "retry_after_seconds": retry_after,
                },
            )
        else:
            # TODO: In-memory store is not shared across instances.
            # Replace with Redis-based solution in v2.0 for multi-instance correctness.
            self.request_counts[client_ip][route_key] = (last_reset, count + 1)

        response = await call_next(request)
        return response
