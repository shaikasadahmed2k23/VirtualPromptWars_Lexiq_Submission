import pytest
from fastapi.testclient import TestClient

from app import config
from app.main import app
from app.store import store

client = TestClient(app)
SAMPLE = b"This lease runs for 12 months. Rent is 10000 per month. Tenant pays a deposit."


@pytest.fixture(autouse=True)
def _reset(monkeypatch):
    store.clear()

    async def fake_llm(system, user):
        return {"answer": "ok"}

    monkeypatch.setattr("app.agents.complete_json", fake_llm)


def _upload(name="lease.txt", data=SAMPLE):
    return client.post("/upload", files={"file": (name, data)})


def test_health():
    assert client.get("/health").json() == {"status": "ok"}


def test_upload_txt_ok():
    res = _upload()
    assert res.status_code == 200
    assert res.json()["filename"] == "lease.txt"


def test_upload_rejects_unsupported_type():
    assert _upload("evil.exe", b"x").status_code == 400


def test_upload_rejects_empty_text():
    assert _upload("empty.txt", b"   ").status_code == 400


def test_upload_rejects_large_file(monkeypatch):
    monkeypatch.setattr(config, "MAX_UPLOAD_MB", 0)
    assert _upload().status_code == 413


def test_query_requires_document():
    res = client.post("/query", json={"query": "rent?", "agent_type": "qa"})
    assert res.status_code == 400


def test_query_success_includes_disclaimer():
    _upload()
    res = client.post("/query", json={"query": "What is the rent?", "agent_type": "qa"})
    assert res.status_code == 200
    body = res.json()
    assert body["agent_type"] == "qa" and "disclaimer" in body


def test_query_unknown_agent():
    _upload()
    res = client.post("/query", json={"query": "x", "agent_type": "hack"})
    assert res.status_code == 400


def test_qa_needs_question():
    _upload()
    res = client.post("/query", json={"query": "  ", "agent_type": "qa"})
    assert res.status_code == 400


def test_summary_needs_no_question():
    _upload()
    res = client.post("/query", json={"query": "", "agent_type": "summary"})
    assert res.status_code == 200


def test_compare_two_documents():
    res = client.post(
        "/compare",
        files={"file_a": ("a.txt", SAMPLE), "file_b": ("b.txt", SAMPLE + b" Extra clause.")},
    )
    assert res.status_code == 200
    assert res.json()["agent_type"] == "compare"


def test_stats_reflects_upload():
    _upload()
    assert client.get("/stats").json()["documents_loaded"] == 1


def test_query_uses_doc_id_not_latest_upload():
    """Two 'sessions' upload different docs; each must query its own, not whichever came last."""
    doc_a = _upload("a.txt", b"The rent for unit A is 5000 per month.").json()
    doc_b = _upload("b.txt", b"The rent for unit B is 9000 per month.").json()

    res_a = client.post(
        "/query", json={"query": "What is the rent?", "agent_type": "qa", "doc_id": doc_a["doc_id"]}
    )
    res_b = client.post(
        "/query", json={"query": "What is the rent?", "agent_type": "qa", "doc_id": doc_b["doc_id"]}
    )
    assert res_a.status_code == 200 and res_b.status_code == 200


def test_query_unknown_doc_id_rejected():
    _upload()
    res = client.post(
        "/query", json={"query": "x", "agent_type": "qa", "doc_id": "doesnotexist"}
    )
    assert res.status_code == 400


def test_stats_with_doc_id_returns_that_document():
    doc_a = _upload("a.txt", SAMPLE).json()
    _upload("b.txt", SAMPLE)
    res = client.get(f"/stats?doc_id={doc_a['doc_id']}")
    assert res.json()["active_document"] == "a.txt"
