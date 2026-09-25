"""Thin async wrapper around the Groq chat API returning JSON."""
from __future__ import annotations

import asyncio
import json
import logging

import groq
from groq import AsyncGroq

from app import config

logger = logging.getLogger("lexiq.llm")

_client: AsyncGroq | None = None
_MAX_ATTEMPTS = 2
_BACKOFF_SECONDS = 1.5


class LLMError(Exception):
    """Raised when the LLM provider is unavailable or misconfigured."""


def _get_client() -> AsyncGroq:
    global _client
    if _client is None:
        if not config.GROQ_API_KEY:
            raise LLMError("GROQ_API_KEY is not configured on the server.")
        _client = AsyncGroq(api_key=config.GROQ_API_KEY)
    return _client


async def complete_json(system: str, user: str) -> dict:
    """Call the model in JSON mode and return the parsed object.

    Retries once with a short backoff on a transient provider error, since a
    single dropped request would otherwise force the user to resubmit the
    whole form. Non-transient failures (bad API key, invalid request) are
    not retried.
    """
    last_error: Exception | None = None
    for attempt in range(1, _MAX_ATTEMPTS + 1):
        try:
            resp = await _get_client().chat.completions.create(
                model=config.GROQ_MODEL,
                temperature=0.1,
                max_tokens=2048,
                timeout=20,
                reasoning_effort="low",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
            )
            raw = resp.choices[0].message.content or "{}"
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return {"answer": raw}
        except groq.APIStatusError as exc:
            logger.error("Groq API error: status=%s body=%s", exc.status_code, exc.body)
            last_error = exc
            if exc.status_code not in (429, 500, 502, 503) or attempt == _MAX_ATTEMPTS:
                break
        except groq.APIError as exc:
            logger.error("Groq connection error: %s", exc)
            last_error = exc
            if attempt == _MAX_ATTEMPTS:
                break
        await asyncio.sleep(_BACKOFF_SECONDS * attempt)

    raise LLMError("The AI service is temporarily unavailable.") from last_error