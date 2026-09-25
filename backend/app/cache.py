"""A tiny in-memory cache for repeated agent calls (same document + question).

Avoids a redundant Groq call — and its latency and cost — when the same
question is asked twice for the same document, which is common when a
person re-reads an answer or an evaluator re-runs a test case.
"""
from __future__ import annotations

from collections import OrderedDict

_MAX_ENTRIES = 200
_store: "OrderedDict[tuple, dict]" = OrderedDict()


def _key(*parts: str) -> tuple:
    """Normalize cache-key parts so lookups are case- and whitespace-insensitive."""
    return tuple(p.strip().lower() for p in parts)


def get(*parts: str) -> dict | None:
    """Return a cached result, or None on a miss."""
    key = _key(*parts)
    value = _store.get(key)
    if value is not None:
        _store.move_to_end(key)
    return value


def put(*parts: str, value: dict) -> None:
    """Store a result, evicting the least-recently-used entry if full."""
    key = _key(*parts)
    _store[key] = value
    _store.move_to_end(key)
    while len(_store) > _MAX_ENTRIES:
        _store.popitem(last=False)


def clear() -> None:
    """Empty the cache (used between test runs)."""
    _store.clear()
