"""LexIQ FastAPI application."""
from __future__ import annotations

from typing import Awaitable, Callable

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app import config
from app.agents import compare_documents, run_agent
from app.llm import LLMError
from app.store import Document, extract_text, store

app = FastAPI(title="LexIQ API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_origin_regex=config.ALLOWED_ORIGIN_REGEX,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    """Body of a POST /query request."""

    query: str = Field(default="", max_length=2000)
    agent_type: str = Field(default="qa", max_length=40)
    doc_id: str | None = Field(default=None, max_length=32)


async def _read_upload(file: UploadFile) -> tuple[str, bytes]:
    """Read an upload, enforcing the size limit."""
    limit = config.MAX_UPLOAD_MB * 1024 * 1024
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(413, f"File exceeds {config.MAX_UPLOAD_MB} MB limit.")
    return file.filename or "document", data


def _resolve_doc(doc_id: str | None) -> Document:
    """Find the document for this request: by id if given, else the latest upload."""
    doc = store.get(doc_id) if doc_id else store.latest()
    if doc is not None:
        return doc
    if doc_id:
        raise HTTPException(400, "Document not found. It may have expired — please upload it again.")
    raise HTTPException(400, "Upload a document first.")


async def _run_agent_call(call: Callable[[], Awaitable[dict]]) -> dict:
    """Run an agent call, translating known failures into HTTP errors."""
    try:
        return await call()
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except LLMError as exc:
        raise HTTPException(502, str(exc)) from exc


@app.get("/health")
async def health() -> dict:
    """Liveness check used by uptime monitors and the hosting platform."""
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> dict:
    """Parse and index a PDF or TXT file, returning its doc_id for later requests."""
    filename, data = await _read_upload(file)
    try:
        doc = store.add(filename, data)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return {
        "doc_id": doc.doc_id,
        "filename": doc.filename,
        "chunks": len(doc.chunks),
        "characters": len(doc.text),
    }


@app.post("/query")
async def query(req: QueryRequest) -> dict:
    """Run one of the five agents (qa, clause, risk, summary) over a stored document."""
    doc = _resolve_doc(req.doc_id)

    async def call() -> dict:
        name, result = await run_agent(req.agent_type, doc, req.query)
        return {"agent_type": name, **result}

    return await _run_agent_call(call)


@app.post("/compare")
async def compare(
    file_a: UploadFile = File(...), file_b: UploadFile = File(...)
) -> dict:
    """Compare two freshly uploaded documents and return their key differences."""
    name_a, data_a = await _read_upload(file_a)
    name_b, data_b = await _read_upload(file_b)

    async def call() -> dict:
        text_a, text_b = extract_text(name_a, data_a), extract_text(name_b, data_b)
        result = await compare_documents(name_a, text_a, name_b, text_b)
        return {"agent_type": "compare", **result}

    return await _run_agent_call(call)


@app.get("/stats")
async def stats(doc_id: str | None = None) -> dict:
    """Report server status and, optionally, the state of one specific document."""
    doc = store.get(doc_id) if doc_id else store.latest()
    return {
        "documents_loaded": len(store),
        "active_document": doc.filename if doc else None,
        "doc_id": doc.doc_id if doc else None,
        "chunks": len(doc.chunks) if doc else 0,
        "model": config.GROQ_MODEL,
    }
