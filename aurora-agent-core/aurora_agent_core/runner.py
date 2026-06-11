from __future__ import annotations

import importlib
import inspect
from pathlib import Path
from typing import Any

from aurora_agent_core.agents.task_intake_graph import TaskIntakeGraph
from aurora_agent_core.core.router import route_task


def run_aurora_task(input_payload: str | dict[str, Any], output_dir: str | Path | None = None) -> dict[str, Any]:
    intake = TaskIntakeGraph().run(input_payload)
    if not intake.get("ready"):
        return {"intake": intake, "execution": None}

    route = route_task(intake["task_spec"])
    if not route["supported"]:
        return {"intake": intake, "execution": {"status": "rejected", "reason": route["reason"]}}

    miner = load_miner(route["entrypoint"])
    execution = run_miner(miner, intake["task_spec"], output_dir=output_dir)
    return {"intake": intake, "execution": execution}


def load_miner(entrypoint: str) -> Any:
    module_name, separator, class_name = entrypoint.partition(":")
    if not separator:
        raise ValueError(f"Invalid miner entrypoint: {entrypoint}")
    module = importlib.import_module(module_name)
    miner_class = getattr(module, class_name)
    return miner_class()


def run_miner(miner: Any, task_spec: dict[str, Any], output_dir: str | Path | None = None) -> dict[str, Any]:
    run_method = getattr(miner, "run")
    signature = inspect.signature(run_method)
    if "output_dir" in signature.parameters:
        return run_method(task_spec, output_dir=output_dir)
    return run_method(task_spec)
