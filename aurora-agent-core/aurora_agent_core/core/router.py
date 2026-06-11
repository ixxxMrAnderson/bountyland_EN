from __future__ import annotations

from aurora_agent_core.registry import get_registry_entry


def route_task(task_spec: dict) -> dict:
    task_type = task_spec.get("task_type")
    entry = get_registry_entry(task_type)
    if not entry:
        return {
            "supported": False,
            "assigned_agent": None,
            "reason": f"Unsupported task_type: {task_type or 'unknown'}",
        }
    assigned_agent = entry["routing"]["assigned_agent"]
    return {
        "supported": True,
        "assigned_agent": assigned_agent,
        "miner_id": entry["miner_id"],
        "entrypoint": entry["execution"]["entrypoint"],
        "reason": f"Task routed to {assigned_agent}.",
    }
