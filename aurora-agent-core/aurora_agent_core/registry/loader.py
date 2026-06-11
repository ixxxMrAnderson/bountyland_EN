from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


REQUIRED_REGISTRY_KEYS = {
    "schema_version",
    "task_type",
    "miner_id",
    "display_name",
    "description",
    "intent",
    "input_contract",
    "routing",
    "execution",
}


def registry_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "registry"


@lru_cache(maxsize=1)
def load_miner_registry() -> dict[str, dict[str, Any]]:
    entries: dict[str, dict[str, Any]] = {}
    for path in sorted(registry_dir().glob("*.json")):
        entry = json.loads(path.read_text(encoding="utf-8"))
        validate_registry_entry(entry, source_path=path)
        task_type = entry["task_type"]
        if task_type in entries:
            raise ValueError(f"Duplicate registry task_type: {task_type}")
        entries[task_type] = entry
    return entries


def get_registry_entry(task_type: str | None) -> dict[str, Any] | None:
    if not task_type:
        return None
    return load_miner_registry().get(task_type)


def validate_registry_entry(entry: dict[str, Any], source_path: Path | None = None) -> None:
    missing = sorted(REQUIRED_REGISTRY_KEYS - set(entry))
    label = str(source_path or entry.get("miner_id") or "unknown registry")
    if missing:
        raise ValueError(f"{label} missing registry keys: {', '.join(missing)}")
    if not isinstance(entry.get("input_contract"), dict):
        raise ValueError(f"{label} input_contract must be an object.")
    if not get_by_path(entry, "routing.assigned_agent"):
        raise ValueError(f"{label} routing.assigned_agent is required.")
    if not get_by_path(entry, "execution.entrypoint"):
        raise ValueError(f"{label} execution.entrypoint is required.")


def apply_registry_defaults(task_spec: dict[str, Any]) -> dict[str, Any]:
    entry = get_registry_entry(task_spec.get("task_type"))
    if not entry:
        return task_spec
    defaults = entry.get("default_payload") or {}
    return deep_merge(defaults, task_spec)


def check_required_fields(task_spec: dict[str, Any], entry: dict[str, Any] | None = None) -> list[str]:
    task_type = task_spec.get("task_type")
    if task_type and entry is None:
        entry = get_registry_entry(task_type)

    missing: list[str] = []
    if not task_type:
        missing.append("task_type")
    if not entry:
        return missing

    contract = entry.get("input_contract") or {}
    for field_path in contract.get("required_fields") or []:
        if not has_value(get_by_path(task_spec, field_path)):
            missing.append(field_path)

    for group in contract.get("field_groups") or []:
        fields = group.get("fields") or []
        mode = group.get("mode", "any_of")
        if mode == "any_of" and not any(has_value(get_by_path(task_spec, field)) for field in fields):
            missing.append(group.get("name") or group.get("message") or "field_group")

    return unique_missing(missing)


def get_by_path(data: dict[str, Any], path: str) -> Any:
    current: Any = data
    for part in path.split("."):
        if not isinstance(current, dict) or part not in current:
            return None
        current = current[part]
    return current


def has_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict, set, tuple)):
        return bool(value)
    return True


def deep_merge(base: dict[str, Any], override: dict[str, Any]) -> dict[str, Any]:
    result: dict[str, Any] = dict(base)
    for key, value in override.items():
        if isinstance(result.get(key), dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        elif has_value(value) or key not in result:
            result[key] = value
    return result


def unique_missing(values: list[str]) -> list[str]:
    result: list[str] = []
    seen: set[str] = set()
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result
