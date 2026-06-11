from __future__ import annotations

from fastapi.testclient import TestClient

from aurora_agent_core.api import app


client = TestClient(app)


DATASET_REQUEST = "帮我构建 10 条 Web3 漏洞数据集，覆盖重入和权限控制，仅公开来源，输出 jsonl，来源包括 github 和博客"


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_intake_waits_for_price_confirmation() -> None:
    response = client.post("/v1/intake", json={"user_input": DATASET_REQUEST})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "awaiting_price_confirmation"
    assert data["ready"] is False
    assert data["suggested_price"] is not None
    assert "task_spec" not in data


def test_intake_confirms_budget() -> None:
    response = client.post(
        "/v1/intake",
        json={"user_input": DATASET_REQUEST, "price_confirmed": True, "user_budget": 0.2},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["ready"] is True
    assert data["task_spec"]["assigned_agent"] == "dataset_miner"
    assert data["task_spec"]["user_budget"] == 0.2


def test_execute_dataset(tmp_path) -> None:
    response = client.post(
        "/v1/execute",
        json={
            "user_input": DATASET_REQUEST,
            "price_confirmed": True,
            "output_dir": str(tmp_path / "dataset"),
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["intake"]["status"] == "ready"
    assert data["execution"]["status"] == "completed"
    assert data["execution"]["summary"]["records"] == 10
    assert data["execution"]["usage"]["miner"] == "dataset_miner"
    assert data["execution"]["usage"]["records_output"] == 10
    assert (tmp_path / "dataset" / "dataset.jsonl").exists()


def test_intake_accepts_use_llm_flag_with_rule_fallback(monkeypatch) -> None:
    def fail_llm(*args, **kwargs):
        raise RuntimeError("mock llm failure")

    monkeypatch.setattr("aurora_agent_core.agents.task_intake_graph.call_zai_chat_with_usage", fail_llm)
    response = client.post("/v1/intake", json={"user_input": DATASET_REQUEST, "use_llm": True})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "awaiting_price_confirmation"
    decompose_events = [event for event in data["trace"]["events"] if event["stage"] == "decompose_task"]
    assert any(event["status"] == "fallback" for event in decompose_events)
