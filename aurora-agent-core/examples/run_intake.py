from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from aurora_agent_core import TaskIntakeGraph


DEFAULT_USER_INPUT = "帮我构建 100 条 Web3 漏洞数据集，覆盖重入和权限控制，仅公开来源，输出 jsonl，来源包括 github 和博客"


def main() -> None:
    args = [arg for arg in sys.argv[1:] if arg != "--use-llm"]
    use_llm = len(args) != len(sys.argv[1:])
    user_input = " ".join(args).strip() or DEFAULT_USER_INPUT
    agent = TaskIntakeGraph()
    payload = {"user_input": user_input, "use_llm": use_llm}
    result = agent.run(payload)

    print_agent_turn(result)

    if result["status"] == "awaiting_price_confirmation":
        try:
            answer = input("确认这个价格请输入 y；修改预算请输入数字；取消请输入 n：").strip()
        except EOFError:
            print(json.dumps({"status": "paused", "agent_message": "等待用户确认价格。"}, ensure_ascii=False, indent=2))
            return
        if answer.lower() in {"y", "yes", "确认", "同意", "ok"}:
            result = agent.run({**payload, "price_confirmed": True})
            print_agent_turn(result)
        elif is_number(answer):
            result = agent.run({**payload, "user_budget": float(answer), "price_confirmed": True})
            print_agent_turn(result)
        else:
            print(json.dumps({"status": "cancelled", "agent_message": "已取消任务确认。"}, ensure_ascii=False, indent=2))


def print_agent_turn(result: dict) -> None:
    visible = {
        "status": result["status"],
        "agent_message": result["agent_message"],
        "suggested_price": result.get("suggested_price"),
        "user_budget": result.get("user_budget"),
        "ready": result.get("ready", False),
    }
    if result.get("missing_fields"):
        visible["missing_fields"] = result["missing_fields"]
    if result.get("task_spec"):
        visible["task_spec"] = result["task_spec"]
    print(json.dumps(visible, ensure_ascii=False, indent=2))


def is_number(value: str) -> bool:
    try:
        float(value)
        return True
    except ValueError:
        return False


if __name__ == "__main__":
    main()
