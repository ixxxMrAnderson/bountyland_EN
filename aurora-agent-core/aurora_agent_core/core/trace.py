from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def new_run_id(prefix: str = "run") -> str:
    return f"{prefix}_{uuid4().hex[:12]}"


def trace_event(stage: str, status: str, detail: dict[str, Any] | None = None) -> dict[str, Any]:
    return {
        "stage": stage,
        "status": status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "detail": detail or {},
    }


def append_trace(state: dict[str, Any], stage: str, status: str, detail: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    return [*state.get("trace", []), trace_event(stage, status, detail)]

