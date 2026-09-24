"""LexIQ FastAPI application."""
from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app import config
from app.agents import compare_documents, run_agent
from app.llm import LLMError
from app.store import extract_text, store

app = FastAPI(title="LexIQ API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(default="", max_length=2000)
    agent_type: str = Field(default="qa", max_length=40)


async def _read_upload(file: UploadFile) -> tuple[str, bytes]:
    """Read an upload, enforcing the size limit."""
    limit = config.MAX_UPLOAD_MB * 1024 * 1024
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise HTTPException(413, f"File exceeds {config.MAX_UPLOAD_MB} MB limit.")
    return file.filename or "document", data


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> dict:
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
    doc = store.latest()
    if doc is None:
        raise HTTPException(400, "Upload a document first.")
    try:
        name, result = await run_agent(req.agent_type, doc, req.query)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except LLMError as exc:
        raise HTTPException(502, str(exc)) from exc
    return {"agent_type": name, **result}


@app.post("/compare")
async def compare(
    file_a: UploadFile = File(...), file_b: UploadFile = File(...)
) -> dict:
    try:
        name_a, data_a = await _read_upload(file_a)
        name_b, data_b = await _read_upload(file_b)
        text_a, text_b = extract_text(name_a, data_a), extract_text(name_b, data_b)
        result = await compare_documents(name_a, text_a, name_b, text_b)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    except LLMError as exc:
        raise HTTPException(502, str(exc)) from exc
    return {"agent_type": "compare", **result}


@app.get("/stats")
async def stats() -> dict:
    doc = store.latest()
    return {
        "documents_loaded": len(store),
        "active_document": doc.filename if doc else None,
        "chunks": len(doc.chunks) if doc else 0,
        "model": config.GROQ_MODEL,
    }
