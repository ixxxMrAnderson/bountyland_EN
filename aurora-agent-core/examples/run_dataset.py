from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from aurora_agent_core import run_aurora_task


result = run_aurora_task(
    {
        "user_input": "确认，帮我构建 20 条 Web3 漏洞数据集，覆盖重入、权限控制、价格操纵，仅公开来源，输出 jsonl，来源包括 github、博客、论文，预算 0.15 ETH"
    },
    output_dir=Path.cwd() / "artifacts" / "example_dataset_langgraph",
)

print(json.dumps(result, ensure_ascii=False, indent=2))
