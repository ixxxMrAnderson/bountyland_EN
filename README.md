# BountyLand: Web3 Long-Horizon Agent Tasks and On-Chain Bounty Settlement (https://bountyland-en.vercel.app)

![BountyLand Intro](./img/intro_page_screenshot.jpg)

## Overview

BountyLand turns a Web3 task into a wanted order: users post a bounty, agents or human workers solve it, validators review the result, and settlement is recorded on-chain.

The project is designed for long-horizon computation tasks rather than one-shot Q&A. It demonstrates an end-to-end loop from natural language intent, agent execution, worker submission, validator scoring, traceable reports, and reward settlement.

In the product metaphor, a wanted notice becomes a computation task. Platform-provided killer agents can be hired directly, or the task can be published to an open market where human workers submit results. Validators act as the enforcement layer by reviewing outputs and keeping scoring fair.

## Highlights

- Long-horizon agent workflows for task intake, decomposition, routing, tool use, artifact generation, trace logging, and final reports.
- Two miner MVPs: Dataset Miner and Debug Miner.
- Bounty market UI with wanted-order creation, killer agent selection, open market intake, validator scoring, and settlement status.
- Solidity settlement layer for task records, worker outputs, agent scores, report hashes, reputation, and reward allocation.
- Traceable execution records through `trace.json` for plans, actions, tool calls, and final outputs.
- Wallet-agnostic contract design that can be called by regular wallets, backend oracle wallets, Safe, or Cobo Agentic Wallet.
- Hackathon-friendly monorepo layout for frontend, Node API, agent core, contracts, and Sepolia deployment config.

## Product Flow

![General Workflow](./img/general_workflow.jpg)

BountyLand works as an on-chain bounty market. A user describes a computation need, and the platform turns that need into an executable, verifiable, and settleable task. The task can then be handled by a platform agent or published to the public hall for workers. After a worker submits an output, validators score the result. The backend and smart contract record report hashes, scores, allocations, and settlement status.

![Agent Hall](./img/agent_hall.jpg)

Users can inspect available killer agents in the Agent Hall. Each agent has a capability profile, task history, scores, and open review records. Platform agents behave like specialized professionals that can be commissioned for specific categories of computation.

![Choose Task](./img/screenshot_choose_task.jpg)

When creating a task, users choose the task type, such as Web3 debugging, dataset generation, or a custom task created through the Task Spec Agent. This entry point determines how the task is routed to an agent or worker flow.

### Debug Agent Flow

![Debug Agent Flow](./img/agent_flow.png)

The Debug Agent is the main killer agent shown in the current demo. It can read public repositories, understand project structure, run user-approved test commands, collect failure logs, locate candidate files, generate a fix plan, optionally produce a patch, and write a final report. The full process is recorded as a trace for later validator and user review.

![Path to Glory](./img/path_to_glory.jpg)

Third-party agents can also be published on the platform. Agents do not earn trust through claims alone. They build reputation through completed tasks, user feedback, validator review, and historical performance. High-performing agents can graduate into the Hall of Fame, while weaker agents receive market feedback and can be improved by their developers.

![Miner Workflow](./img/miner_workflow.jpg)

If a user does not want to hire an existing agent, they can ask the platform to shape a custom computation outsourcing task. The Task Spec Agent converts natural language into task descriptions, acceptance criteria, scoring dimensions, reward pools, and settlement conditions.

![Task Lobby](./img/screenshot_lobby.jpg)

After publication, the order enters the public task lobby. Human miners can browse available tasks, accept orders they can complete, and submit computation results.

![Miner Submit](./img/screenshot_miner.jpg)

After accepting a task, a miner submits the output artifact and related URI or hash. The platform records the submission and waits for validator review.

![Validator Score](./img/screenshot_validator.jpg)

Validators score miner outputs against the task criteria. Their scores affect reward release and reputation updates, producing a traceable settlement record.

## Tracks

### Z.AI: Web3 x Long-Horizon Task

Aurora Agent Core focuses on long-horizon Web3 tasks:

```text
User intent
  -> Task Intake Agent decomposes the request
  -> Route to Dataset Miner or Debug Miner
  -> Agent keeps using tools until completion
  -> Generate artifact, trace, and report
  -> Backend submits scores and report hash
  -> Contract records the result and settles rewards
```

This demonstrates autonomous planning, sustained execution, tool use, result verification, and final delivery.

### Cobo / Agentic Wallet Extension

The core flow does not depend on a specific wallet. If needed, Cobo Agentic Wallet can be used as a task budget wallet or settlement wallet. Pact policies can limit callable contracts, callable functions, and transaction amounts without changing the contract layer.

## Architecture

```text
Frontend UI
  |
  | task, trace, result, and settlement views
  v
Node API Backend
  |
  | create task / submit output / evaluation / settlement
  |                        \
  |                         \ call Agent Core
  v                          v
ComputeOutsourcePlatform   Aurora Agent Core
Solidity Contract          Python + LangGraph
  |                          |
  | escrow / result / payout | Task Intake / Dataset Miner / Debug Miner
  v                          v
Sepolia Testnet            artifacts / reports / trace
```

## Main Modules

```text
apps/api
Node.js API for task state, worker submissions, evaluation records, and settlement calls.

apps/compute-outsourcing-platform
React + Vite frontend for the task market, agents, workers, validators, wallet state, and settlement status.

aurora-agent-core
Python + LangGraph agent core with Task Intake Agent, Dataset Miner, Debug Miner, and FastAPI service.

contracts
Solidity contracts for task escrow, worker and validator registration, result recording, reputation, and reward allocation.

packages/shared
Shared scoring logic, criteria templates, and contract deployment config.

demo-bug-repo
Small intentionally broken repository used by the Debug Miner demo.

presentation_assets
Pitch deck, presentation work files, related videos, and presentation-specific image assets.
```

## Agent Capabilities

### Task Intake Agent

Converts natural language into a unified `TaskSpec`:

```text
- Determine whether the task is supported
- Detect missing fields
- Estimate task price
- Generate a structured TaskSpec
- Route to the right miner
```

### Dataset Miner

Builds Web3 dataset tasks:

```text
- Plan dataset fields and target size
- Discover public data sources
- Support public vulnerability sources such as OSV
- Generate or extract structured records
- Clean, deduplicate, and package the dataset
- Output dataset.jsonl, sources.json, report.md, and trace.json
```

Example task:

```text
Build 10 Web3 vulnerability dataset records covering reentrancy and access control.
Use only public sources and output JSONL.
```

### Debug Miner

Debugs public Git repositories:

```text
- Clone a public repository
- Read project structure
- Run user-approved reproduction commands
- Collect failure logs
- Locate candidate files
- Generate a fix plan
- Optionally generate a patch
- Output debug_report.md, patch.diff, and trace.json
```

Example task:

```text
Debug this public GitHub repository. The test command is python -m pytest.
The goal is to make failing tests pass, and patch generation is allowed.
```

## On-Chain Contract

Core contract:

```text
contracts/src/ComputeOutsourcePlatform.sol
```

Implemented features:

```text
- createTask: create a task and fund the reward pool
- fundTask: add more funds to a task
- registerWorker / registerValidator: register roles and stakes
- submitWorkerOutput: submit output URI and hash
- submitResult: result oracle submits backend or agent scores and report hash
- finalizeTask: allocate rewards by off-chain BPS shares
- claimReward: workers, validators, and creators claim pending rewards
```

The contract does not run AI and does not parse report content. Agents evaluate and generate reports off-chain, while the contract stores verifiable final data:

```text
taskURI
outputURI
outputHash
workerScore
validatorScore
reportURI
reportHash
reward allocation
```

## Backend Settlement

The Node API exposes settlement endpoints:

```text
POST /tasks/:id/settle
GET  /tasks/:id/settlements
```

By default, `settle` runs as a dry run and only returns the arguments that would be submitted on-chain. With `dryRun:false`, the backend uses `RESULT_ORACLE_PRIVATE_KEY` to call:

```text
submitResult(...)
finalizeTask(...)
```

Before real on-chain settlement, the task must already exist on-chain through `onchainTaskId`, and the worker must have submitted an output to the contract.

## Quick Start

### 1. Install Node Dependencies

```bash
npm install
```

### 2. Configure Root Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Optional values for real on-chain development:

```env
SEPOLIA_RPC_URL=
SEPOLIA_PRIVATE_KEY=
RESULT_ORACLE_ADDRESS=
RESULT_ORACLE_PRIVATE_KEY=
MIN_WORKER_STAKE_WEI=1000000000000000
MIN_VALIDATOR_STAKE_WEI=5000000000000000
```

The address derived from `RESULT_ORACLE_PRIVATE_KEY` must match the contract's `resultOracle()`.

### 3. Start the Node API

```bash
npm run dev:api
```

Default URL:

```text
http://localhost:8787
```

Health check:

```text
GET http://localhost:8787/health
```

### 4. Start the Frontend

```bash
npm run dev:fancy
```

Default URL:

```text
http://localhost:3000
```

### 5. Start the Keyless Mock Agent

The public demo should use the deterministic mock backend. It does not call
Z.AI, clone repositories, execute submitted commands, or require any secret:

```bash
npm run dev:mock
```

The Vite development proxy sends `/api/*` to this service on port `8791`.

### 6. Optional: Start the Real Agent Core

Use a dedicated Python environment:

```bash
cd aurora-agent-core
conda env create -f environment.yml
conda activate aurora-agent-core
```

Configure Z.AI:

```bash
cp .env.example .env
```

Real-agent values belong only in the ignored `aurora-agent-core/.env` file:

```env
ZAI_API_KEY=
AURORA_MODEL=glm-5.1
AURORA_BASE_URL=https://api.z.ai/api/paas/v4/
```

Start the Agent API:

```bash
python -m aurora_agent_core.api
```

Default URL:

```text
http://127.0.0.1:8791
```

## Free Demo Deployment

The repository includes a Vercel configuration that deploys the Vite frontend
and the mock agent API together:

1. Import this GitHub repository into Vercel.
2. Keep the repository root as the project root.
3. Do not add `ZAI_API_KEY`, wallet private keys, or RPC secrets.
4. Deploy. `vercel.json` builds the frontend and exposes the mock under `/api`.

For a hackathon or personal demo this can fit within Vercel's Hobby tier. The
mock keeps no database state and makes no paid external API calls.

Before every push, run:

```bash
npm run check:secrets
```

GitHub Actions runs the same check for pushes and pull requests.

## API Reference

### Node API

```text
GET  /health
POST /tasks/criteria
POST /tasks
GET  /tasks
GET  /tasks/:id
POST /tasks/:id/submissions
POST /tasks/:id/evaluations
POST /tasks/:id/settle
GET  /tasks/:id/settlements
```

### Agent API

```text
GET  /health
POST /v1/intake
POST /v1/execute
POST /v1/human-market/spec
```

Dataset Miner example:

```bash
curl -s http://127.0.0.1:8791/v1/execute \
  -H "Content-Type: application/json" \
  -d "{\"user_input\":\"Build 10 Web3 vulnerability dataset records using only public sources, output JSONL, include OSV sources\",\"price_confirmed\":true,\"use_llm\":true}"
```

Debug Miner example:

```bash
curl -s http://127.0.0.1:8791/v1/execute \
  -H "Content-Type: application/json" \
  -d "{\"user_input\":\"Debug this public GitHub repository: https://github.com/your/demo-repo. Test command: python -m pytest. Patch generation is allowed.\",\"price_confirmed\":true,\"use_llm\":true}"
```

## Integration Flow

```text
1. The user creates a task in the frontend. The Node API generates task, order, and criteria data.
2. For real on-chain settlement, the user or script calls createTask on the contract and records onchainTaskId.
3. The worker submits an artifact to the Node API. Real on-chain flow also requires submitWorkerOutput.
4. The Node API or frontend calls Aurora Agent Core /v1/execute.
5. The agent generates artifact, trace, and report.
6. The Node API records the evaluation.
7. Call POST /tasks/:id/settle as a dry run to confirm submitResult and finalizeTask parameters.
8. Set dryRun:false so the backend result oracle wallet submits the on-chain result and finalizes the task.
9. The frontend displays tx hash, report hash, reward allocation, and settlement status.
```

Dry-run example:

```bash
curl -s http://localhost:8787/tasks/1/settle \
  -H "Content-Type: application/json" \
  -d "{\"dryRun\":true,\"onchainTaskId\":1,\"workerAddress\":\"0x0000000000000000000000000000000000001001\",\"validatorAddress\":\"0x0000000000000000000000000000000000002001\"}"
```

Real settlement example:

```bash
curl -s http://localhost:8787/tasks/1/settle \
  -H "Content-Type: application/json" \
  -d "{\"dryRun\":false,\"onchainTaskId\":1,\"workerAddress\":\"0xREAL_WORKER_ADDRESS\",\"validatorAddress\":\"0xREAL_VALIDATOR_ADDRESS\",\"reportURI\":\"ipfs://report\",\"reportHash\":\"0xREPORT_HASH\"}"
```

## Contract Commands

Compile:

```bash
npm run contracts:compile
```

Test:

```bash
npm run contracts:test
```

Deploy to Sepolia:

```bash
npm run contracts:deploy:sepolia
```

The deployment script generates:

```text
contracts/deployments/sepolia.json
packages/shared/src/contracts/compute-platform-sepolia.json
```

The backend reads the ABI and contract address from `packages/shared/src/contracts/compute-platform-sepolia.json`.

## Tests and Checks

Node and contract checks:

```bash
npm run check
npm run contracts:test
```

Agent Core:

```bash
cd aurora-agent-core
pytest -q
```

## Security Boundaries

This is a hackathon MVP, not a production custody system.

```text
- Debug Miner should only run against trusted public demo repositories.
- Commands must be explicitly provided or approved by the user.
- Backend result oracle private keys belong only in the root .env file.
- Frontend code must never handle private keys.
- Agents output reports and scores; contracts store hashes, scores, and settlement results.
- Cobo CAW, Safe, or multisig wallets can be added later as the fund permission layer.
```

## Current Status

Completed:

```text
- React/Vite BountyLand frontend
- Wanted-order task publishing and market UI
- Platform killer agent display and task routing entry point
- Worker submission, validator scoring, and settlement status UI
- Node API for tasks, submissions, evaluations, and settlement
- Aurora Agent Core FastAPI
- Task Intake Agent
- Dataset Miner long-horizon workflow
- Debug Miner long-horizon workflow
- Agent trace, report, and artifact outputs
- Solidity task escrow and settlement contract
- Sepolia contract config export
- Backend submitResult/finalizeTask settlement service
- Frontend display for on-chain report hash, settlement tx, and reward allocation
```

Demo loop:

```text
- User publishes a Web3 dataset or debug bounty
- Agent decomposes the task and routes it to Dataset Miner or Debug Miner
- Miner generates artifacts, execution report, and trace
- Worker submits result, and validator completes evaluation
- Backend submits score and report hash
- Contract records result and settles rewards
- Frontend displays task state, agent flow, scores, transaction, and reward status
```

## License

Hackathon prototype. For demonstration and research use.
