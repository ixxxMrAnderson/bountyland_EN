from __future__ import annotations

import argparse
import json
from pathlib import Path

from aurora_agent_core.agents.task_intake_graph import TaskIntakeGraph
from aurora_agent_core.runner import run_aurora_task


DEFAULT_INPUT = "确认，帮我构建 12 条 Web3 漏洞数据集，覆盖重入、权限控制、价格操纵，仅公开来源，输出 jsonl，来源包括 github、博客、论文，预算 0.15 ETH"


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Aurora LangGraph agent workflows.")
    parser.add_argument("user_input", nargs="*", help="Natural language task request.")
    parser.add_argument("--demo", action="store_true", help="Run intake + routed executor.")
    parser.add_argument("--intake-only", action="store_true", help="Only run the task intake graph.")
    parser.add_argument("--output-dir", default=None, help="Dataset artifact output directory.")
    parser.add_argument("--use-llm", action="store_true", help="Use Z.ai for task decomposition and eligible miner loops.")
    parser.add_argument("--price-confirmed", action="store_true", help="Skip the price confirmation gate.")
    parser.add_argument("--user-budget", type=float, default=None, help="User confirmed budget in ETH.")
    args = parser.parse_args()

    user_input = " ".join(args.user_input).strip() or DEFAULT_INPUT
    payload = {
        "user_input": user_input,
        "price_confirmed": args.price_confirmed,
        "user_budget": args.user_budget,
        "use_llm": args.use_llm,
    }

    if args.intake_only:
        result = TaskIntakeGraph().run(payload)
    else:
        output_dir = Path(args.output_dir) if args.output_dir else Path.cwd() / "artifacts" / "demo_dataset_langgraph"
        result = run_aurora_task(payload, output_dir=output_dir)

    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
