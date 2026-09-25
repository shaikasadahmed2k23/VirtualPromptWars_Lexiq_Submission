
- **Frontend:** React 18 + Vite, no UI framework — plain CSS with design
  tokens (`src/index.css`). Chat-style Q&A with persistent history per
  document; per-page state for the other four agents.
- **Backend:** FastAPI. `store.py` handles upload parsing (PDF/TXT), chunking
  and BM25 search. `agents.py` holds the five agent prompts and the JSON
  contract each returns. `llm.py` wraps the Groq client.
- **Sessions:** each upload gets a `doc_id`. The frontend sends it with every
  request and keeps it in `sessionStorage`, so two people (or two tabs) using
  the app at the same time never see each other's documents.
- **Storage:** in-memory only (last 20 documents), no database — documents
  are not persisted across a backend restart.

## Tech stack

- Backend: Python 3.11, FastAPI, `rank-bm25`, `pypdf`, Groq SDK
- Frontend: React 18, Vite 5
- Hosting: Render (backend), Vercel (frontend)

## Running locally

**Backend**
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # then add your GROQ_API_KEY
uvicorn app.main:app --reload
```

**Frontend**
```bash
npm install
npm run dev
```
By default the frontend talks to `http://127.0.0.1:8000`. To point it at a
deployed backend instead, set `VITE_API_URL` in a `.env` file.

## Testing

```bash
cd backend
python -m pytest -q
```
15 tests cover upload validation, all five agents, CORS-safe error handling,
and — most importantly — that two documents in two sessions never answer
each other's questions.

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/upload` | POST | Upload a PDF/TXT file (≤10 MB), returns `doc_id` |
| `/query` | POST | `{query, agent_type, doc_id}` → one of the five agents |
| `/compare` | POST | Two files → structured diff |
| `/stats` | GET | `?doc_id=` → status of that document |
| `/health` | GET | Liveness check |

## Try it

A sample rent agreement with intentionally one-sided clauses is bundled at
`/samples/sample_rent_agreement.txt` and one click away from the Upload page
("Try a sample rent agreement") — useful for testing Risk Analysis and Key
Clauses without finding your own document.

## Known limitations

- In-memory storage only; a backend restart clears all uploaded documents.
- Scanned (image-only) PDFs are not supported — text must be extractable.
- Free-tier hosting means the first request after idling is slow.

## Disclaimer

LexIQ provides general information to help you read and understand legal
documents. It is not a substitute for advice from a qualified lawyer.