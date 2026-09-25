"""Simple in-memory per-IP rate limiting (best-effort; resets on restart)."""
from __future__ import annotations

import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app import config

_WINDOW_SECONDS = 60
_hits: dict[str, deque] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    """Best-effort client IP, preferring the first hop of X-Forwarded-For."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


async def enforce_rate_limit(request: Request) -> None:
    """FastAPI dependency: reject a client once it exceeds the per-minute budget."""
    ip = _client_ip(request)
    now = time.monotonic()
    hits = _hits[ip]
    while hits and now - hits[0] > _WINDOW_SECONDS:
        hits.popleft()
    if len(hits) >= config.RATE_LIMIT_PER_MINUTE:
        raise HTTPException(429, "Too many requests. Please slow down and try again shortly.")
    hits.append(now)


def clear() -> None:
    """Reset all rate-limit state (used between test runs)."""
    _hits.clear()
