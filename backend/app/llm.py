"""Thin async wrapper around the Groq chat API returning JSON."""
from __future__ import annotations

import json

import groq
from groq import AsyncGroq

from app import config

_client: AsyncGroq | None = None


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
    """Call the model in JSON mode and return the parsed object."""
    try:
        resp = await _get_client().chat.completions.create(
            model=config.GROQ_MODEL,
            temperature=0.1,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
    except groq.APIError as exc:
        raise LLMError("The AI service is temporarily unavailable.") from exc
    raw = resp.choices[0].message.content or "{}"
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"answer": raw}
