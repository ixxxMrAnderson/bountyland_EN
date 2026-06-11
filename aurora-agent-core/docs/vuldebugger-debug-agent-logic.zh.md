# VulDebugger 论文到 Debug Agent 的逻辑映射

论文：Zhengyao Liu 等，`Agent That Debugs: Dynamic State-Guided Vulnerability Repair`，arXiv:2504.07634  
来源：[https://arxiv.org/pdf/2504.07634](https://arxiv.org/pdf/2504.07634)

## 1. 是否能看全貌

可以。论文 PDF 能读取到完整方法、实现评估和限制部分。它提出的 VulDebugger 不是普通“读代码然后猜 patch”的 agent，而是一个动态状态引导的漏洞修复 agent。

核心思想可以可靠抽象为：

```text
POC 触发漏洞
  -> 获取 crash 信息
  -> 抽取 crash-free constraint 作为期望状态
  -> 调试器采集实际运行状态
  -> LLM 比较期望状态和实际状态
  -> 迭代定位根因和修复位置
  -> 独立 patch agent 生成补丁
  -> 编译和复现验证
```

## 2. 论文里可迁移的关键点

### 2.1 静态上下文不够

论文明确指出，仅靠静态检索代码、函数、变量信息，对复杂漏洞修复不够。Agent 需要看到程序在触发漏洞时的真实状态。

对我们的 Debug Miner 的启发：

- 不要只做 repo search + LLM patch
- 要把复现、日志、测试、运行时变量、断点状态纳入工作流
- 对 bug/debug 任务，把“复现证据”当成核心输入资产

### 2.2 期望状态与实际状态比较

VulDebugger 的核心是两种状态：

- expected state：根据 crash-free constraint 推导出的漏洞不应发生时的约束
- actual state：调试器在断点处采集到的真实程序状态

Agent 不只是问“哪里错了”，而是循环问：

```text
在这个程序位置，变量/内存/分支实际是什么？
如果漏洞要被消除，这里应该满足什么约束？
两者哪里不一致？
不一致能否解释 crash 或错误行为？
```

这非常适合作为 Debug Miner 的主循环。

### 2.3 patch 生成要和调试对话分离

论文中 patch generation 使用新的 agent/conversation，输入是调试阶段总结出的 root cause 和 fix location。原因是调试过程上下文长，容易干扰补丁生成。

对我们的实现建议：

- Debug Miner 分成 `analysis graph` 和 `patch graph`
- `analysis graph` 输出简洁结构化摘要
- `patch graph` 只吃 root cause、fix location、相关代码片段和验证失败信息

### 2.4 验证是闭环，不是附录

论文会编译 patched project，并重新运行触发漏洞的 POC。如果仍触发，则把失败信息反馈给 patch agent；多次失败后回到调试阶段重新定位。

对我们的实现建议：

- 每个 patch 必须带 verification plan
- 能跑测试就跑测试
- 不能跑测试也要输出最小复现命令和人工验证步骤
- patch 失败信息应作为下一轮输入，而不是直接结束

## 3. 映射成我们的 Debug Miner 节点

当前 `src/miners/debugMiner.js` 中只放了 planned nodes。建议后续实现为：

```text
issue_interpreter
  -> reproduction_oracle_builder
  -> repo_context_inspector
  -> expected_state_extractor
  -> runtime_state_collector
  -> state_divergence_analyzer
  -> root_cause_localizer
  -> fix_planner
  -> patch_generator
  -> verification_runner
```

### 3.1 issue_interpreter

输入：

- `TaskSpec`
- `repo_path`
- `bug_description`
- logs / stack trace / failing test

输出：

- 标准化 bug 描述
- 可能的触发条件
- 是否有足够复现信息

### 3.2 reproduction_oracle_builder

对应 VulDebugger 的 POC。

输出：

- failing command
- expected failure signal
- crash/log/test assertion
- 可重复运行的验证入口

如果没有复现入口，Debug Miner 应进入 `needs_confirmation`，要求用户补充日志、测试或运行方式。

### 3.3 repo_context_inspector

对应论文里的静态上下文工具。

能力：

- 搜索相关文件
- 读取函数体
- 查调用链
- 查类型定义
- 查配置和测试入口

输出：

- candidate files
- candidate functions
- suspicious call path

### 3.4 expected_state_extractor

对应 crash-free constraint。

在 C/C++ 漏洞场景里可以来自 sanitizer/crash constraint。普通业务 bug 场景里可以泛化为：

- 测试断言应该满足的条件
- API contract
- schema invariant
- 状态机合法转移
- 用户可见正确行为

输出结构：

```json
{
  "location": "file:line or function",
  "expected_constraints": [
    "index must be less than buffer length",
    "task state should be refreshed after create succeeds"
  ],
  "source": "poc|test|log|contract|user_requirement"
}
```

### 3.5 runtime_state_collector

对应调试器采集实际状态。

MVP 可以先用：

- test output
- console log
- stack trace
- command exit code
- request/response payload

高级版本再接：

- LLDB/GDB
- Node inspector
- Python pdb
- browser trace

### 3.6 state_divergence_analyzer

比较 expected vs actual：

```json
{
  "expected": "task list includes newly created task",
  "actual": "create API succeeds but local task state is unchanged",
  "divergence": "frontend state refresh missing after task creation",
  "confidence": "high"
}
```

### 3.7 root_cause_localizer

把多轮 divergence 汇总为：

- root cause
- fix location
- supporting evidence
- uncertainty

### 3.8 fix_planner

输出修复策略，不直接改代码：

- 修改文件
- 修改函数
- 风险点
- 回归测试范围

### 3.9 patch_generator

新的上下文中执行，只输入必要摘要和代码片段，避免长调试历史污染 patch。

输出：

- patch diff
- changed files
- rationale

### 3.10 verification_runner

执行：

- syntax check
- unit/integration tests
- reproduction command

失败时：

- 记录失败日志
- 回到 patch generator，最多重试 N 次
- 多次失败后回到 root cause localization

## 4. 和本项目 Debug Agent 的差异化取舍

论文主要验证 C 项目漏洞修复，依赖 POC、sanitizer、LLDB/GDB 等动态能力。我们的平台要支持更宽的代码 Debug 任务，所以需要泛化：

```text
crash-free constraint
  -> expected behavior constraint

debugger actual state
  -> runtime evidence

POC
  -> reproduction oracle
```

这样既保留论文的核心价值，也不会把系统锁死在 C/C++ 漏洞修复。

## 5. 必须承认的边界

根据论文内容，VulDebugger 的强项依赖：

- 有 POC 或可复现输入
- 错误能通过 crash/sanitizer/test 暴露
- 可以运行项目并采集动态状态
- 原实验实现主要面向 C 项目

所以我们的 Debug Miner 不应该承诺：

- 没有复现信息也能稳定修好
- 纯线上黑盒问题能自动定位
- 任意语言都能立刻做 debugger 级动态分析
- 所有 patch 都能一次生成正确

## 6. 建议的 MVP 实现顺序

1. 先实现 repo static inspector + failing command runner
2. 再实现 expected/actual state schema
3. 再实现 divergence analyzer 和 root cause report
4. 再实现 patch generator
5. 最后接语言专用 debugger adapter

这个顺序最适合我们当前平台：先拿到可演示、可验证的 Debug 结果包，再逐步补强动态调试能力。

