# Aurora Agent Core 架构说明

## 1. 定位

Aurora Agent Core 是当前项目的 Python + LangGraph MVP Agent Backend 原型，对应 `AGENT_ARCHITECTURE_PLAN_ZH.md` 中的核心建议：

```text
用户输入
  -> 任务受理与拆解 Agent
  -> 任务类型路由
  -> Dataset Miner / Debug Miner
  -> 结构化产物 + trace
```

当前主实现基于 LangGraph `StateGraph`。节点函数保持轻量，方便后续接真实 LLM、工具调用和长任务执行。

## 2. 已实现模块

### 2.1 Task Intake Agent

文件：`aurora_agent_core/agents/task_intake_graph.py`

职责：

- 判断任务是否在 MVP 支持范围内
- 将用户自然语言拆成任务草稿
- 检测缺失字段
- 估算建议价格
- 等待用户确认或修改预算
- 生成统一 `TaskSpec`

状态输出：

- `rejected`：当前不支持
- `needs_confirmation`：缺少必要信息
- `awaiting_price_confirmation`：信息足够，但还没确认预算
- `ready`：可进入执行阶段

### 2.2 TaskSpec

文件：`aurora_agent_core/schemas/task_spec.py`

核心字段：

```json
{
  "task_id": "task_xxx",
  "task_type": "dataset_generation",
  "title": "数据集生成任务",
  "goal": "用户目标",
  "requirements": [],
  "constraints": [],
  "output_format": "jsonl",
  "target_size": 100,
  "source_scope": ["github", "blogs"],
  "suggested_price": 0.15,
  "user_budget": 0.15,
  "assigned_agent": "dataset_miner"
}
```

### 2.3 Router

文件：`aurora_agent_core/core/router.py`

当前支持：

- `dataset_generation` -> `dataset_miner`
- `code_debug` -> `debug_miner`

### 2.4 Dataset Miner

文件：`aurora_agent_core/miners/dataset_miner_graph.py`

节点：

```text
dataset_planner
  -> source_finder
  -> extractor
  -> cleaner
  -> packager
```

输出：

- `dataset.jsonl` 或 `dataset.json`
- `sources.json`
- `report.md`
- `trace.json`
- `result.json`

当前 Dataset Miner 是 MVP 级别的数据集生产工作流：会生成 schema 合法、带 provenance 的 demo 数据，但不会承诺真实大规模爬取或人工标注质量。

### 2.5 Debug Miner

文件：`aurora_agent_core/miners/debug_miner_graph.py`

当前实现公开 Git 仓库诊断 MVP：

```text
issue_interpreter
  -> workspace_preparer
  -> repo_context_inspector
  -> reproduction_oracle_builder
  -> runtime_state_collector
  -> state_divergence_analyzer
  -> root_cause_localizer
  -> fix_planner
  -> debug_packager
```

能力边界：

- 支持从 `TaskSpec.debug.code_source.repo_url` clone 公开 Git 仓库
- 支持运行 `TaskSpec.debug.reproduction.test_command`
- 采集 stdout/stderr、return code、timeout 信息
- 提取失败信号和日志中的仓库文件路径
- 输出候选文件、修复建议、复现报告和 trace
- 默认遵守 `cleanup_repo=true`，报告打包后清理临时 clone
- 当前不自动修改仓库，不生成 patch

## 3. Trace

文件：`aurora_agent_core/core/trace.py`

每个 workflow node 都会记录：

- `stage`
- `status`
- `timestamp`
- `duration_ms`
- `output_keys`
- 错误信息

这对应计划文档里的“可视化执行 trace”，未来前端可以直接把 `trace.events` 渲染为时间线。

## 4. 后续升级路径

### 接 LLM

把 `TaskIntakeAgent` 中的规则抽取替换为结构化 LLM 输出，保留：

- 输入格式
- 状态机
- `TaskSpec`
- trace

### 接更完整的 LangGraph 能力

当前已经使用 `StateGraph`。下一步可以接：

- checkpoint / memory
- streaming events
- human-in-the-loop approval
- tool calling
- LangSmith trace

### 接真实数据源

在 Dataset Miner 中替换：

- `source_finder`
- `extractor`

保留：

- `dataset_planner`
- `cleaner`
- `packager`
- artifact contract

### 接真实 Debug Agent

以 `docs/vuldebugger-debug-agent-logic.zh.md` 的流程为主线，逐步实现：

- repo/context tools
- test/reproduction runner
- debugger/sanitizer adapter
- expected-vs-actual state loop
- patch generation and validation
