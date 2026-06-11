from __future__ import annotations

import pytest

from aurora_agent_core.llm.zai_client import DEFAULT_ZAI_BASE_URL, DEFAULT_ZAI_MODEL, ZaiChatConfig, extract_usage


def test_zai_config_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("ZAI_API_KEY", "test-key")
    monkeypatch.delenv("AURORA_MODEL", raising=False)
    monkeypatch.delenv("AURORA_BASE_URL", raising=False)
    config = ZaiChatConfig.from_env()
    assert config.api_key == "test-key"
    assert config.model == DEFAULT_ZAI_MODEL
    assert config.base_url == DEFAULT_ZAI_BASE_URL


def test_zai_config_requires_api_key(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("ZAI_API_KEY", raising=False)
    with pytest.raises(RuntimeError):
        ZaiChatConfig.from_env()


def test_zai_usage_extraction() -> None:
    class Usage:
        prompt_tokens = 11
        completion_tokens = 7
        total_tokens = 18

    class Response:
        model = "glm-test"
        usage = Usage()

    config = ZaiChatConfig(api_key="test-key", model="glm-fallback", base_url="https://example.test")
    usage = extract_usage(Response(), config)
    assert usage["provider"] == "zai"
    assert usage["model"] == "glm-test"
    assert usage["prompt_tokens"] == 11
    assert usage["completion_tokens"] == 7
    assert usage["total_tokens"] == 18
