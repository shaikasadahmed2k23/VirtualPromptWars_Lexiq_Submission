"""Document parsing, chunking and BM25 retrieval (in-memory store)."""
from __future__ import annotations

import io
import re
import uuid

from pypdf import PdfReader
from pypdf.errors import PyPdfError
from rank_bm25 import BM25Okapi

from app import config

_TOKEN = re.compile(r"\w+")


def tokenize(text: str) -> list[str]:
    """Lowercase word tokens used for BM25."""
    return _TOKEN.findall(text.lower())


def extract_text(filename: str, data: bytes) -> str:
    """Extract plain text from a PDF or TXT upload."""
    name = filename.lower()
    if name.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(data))
            text = "\n".join((page.extract_text() or "") for page in reader.pages)
        except PyPdfError as exc:
            raise ValueError("Could not read this PDF file.") from exc
    elif name.endswith(".txt"):
        text = data.decode("utf-8", errors="ignore")
    else:
        raise ValueError("Unsupported file type. Upload a PDF or TXT file.")
    if not text.strip():
        raise ValueError("No extractable text found (scanned PDFs are not supported).")
    return text


def chunk_text(text: str, size: int, overlap: int) -> list[str]:
    """Split text into overlapping word windows."""
    words = text.split()
    step = max(size - overlap, 1)
    return [" ".join(words[i : i + size]) for i in range(0, len(words), step)]


class Document:
    """A parsed document with a BM25 index over its chunks."""

    def __init__(self, filename: str, text: str) -> None:
        self.doc_id = uuid.uuid4().hex[:12]
        self.filename = filename
        self.text = text
        self.chunks = chunk_text(text, config.CHUNK_WORDS, config.CHUNK_OVERLAP)
        self._bm25 = BM25Okapi([tokenize(c) for c in self.chunks])

    def search(self, query: str, k: int) -> list[str]:
        """Return the k most relevant chunks, in document order."""
        tokens = tokenize(query)
        if not tokens:
            return self.chunks[:k]
        scores = self._bm25.get_scores(tokens)
        ranked = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:k]
        if not ranked or scores[ranked[0]] <= 0:
            return self.chunks[:k]
        return [self.chunks[i] for i in sorted(ranked)]


class DocumentStore:
    """Keeps recent documents; queries use the most recent upload."""

    MAX_DOCS = 20

    def __init__(self) -> None:
        self._docs: dict[str, Document] = {}
        self._latest: str | None = None

    def add(self, filename: str, data: bytes) -> Document:
        """Parse, index and store a new document as the most recent upload."""
        doc = Document(filename, extract_text(filename, data))
        self._docs[doc.doc_id] = doc
        self._latest = doc.doc_id
        while len(self._docs) > self.MAX_DOCS:
            self._docs.pop(next(iter(self._docs)))
        return doc

    def get(self, doc_id: str) -> Document | None:
        """Fetch a document by id, or None if it has been evicted."""
        return self._docs.get(doc_id)

    def latest(self) -> Document | None:
        """Return the most recently uploaded document, if any."""
        return self._docs.get(self._latest) if self._latest else None

    def clear(self) -> None:
        """Remove all documents (used between test runs)."""
        self._docs.clear()
        self._latest = None

    def __len__(self) -> int:
        return len(self._docs)


store = DocumentStore()
