# Zai Agent-Audited Compute Outsourcing Platform

Development scaffold for an agent-audited compute outsourcing platform with Cobo Wallet policy control.

The current framework follows the flow before Sec 3 in `agent_audited_compute_outsourcing_platform.md`:

```text
User defines task
  -> Task Criteria Agent returns validator acceptance criteria
  -> User selects criteria
  -> Backend creates computation order + contract params
  -> Worker submits output
  -> Validator scores completion
  -> AI Audit Agent returns reference score
  -> Scoring logic calculates deviation / final score / reward multiplier
  -> Cobo Pact draft controls funding and settlement approval
```

## Repo Layout

```text
apps/api                Dependency-free Node API and mock orchestration services
apps/web                Dependency-free browser UI for the task flow
contracts/src           Solidity settlement/reputation scaffold
packages/shared/src     Shared criteria templates and scoring logic
docs                    Architecture notes
tools                   Local dev runner
```

## Run

No package install is required for the current scaffold. If Node/npm is available:

```bash
npm run check
npm run dev
```

If this environment does not have Node/npm, use the Python standard-library fallback:

```bash
python3 tools/dev.py
```

Open:

```text
http://localhost:5173
```

API health:

```text
http://localhost:8787/health
```

## API Endpoints

```text
POST /tasks/criteria
POST /tasks
GET  /tasks
GET  /tasks/:taskId
POST /tasks/:taskId/submissions
POST /tasks/:taskId/evaluations
```

## Contract

`contracts/src/ComputeOutsourcePlatform.sol` includes the Sec 2 contract surface:

```text
createTask(taskURI, orderURI, criteriaHash, deadline, aiAuditEnabled)
registerWorker()
registerValidator()
submitWorkerOutput()
submitValidatorScore()
submitAIScore()
finalizeEvaluation()
claimReward()
```

## Next Steps

1. Replace in-memory state with a database.
2. Store task specs and computation orders in IPFS/S3/content-addressed storage.
3. Replace mock AI audit scoring with a real evaluator.
4. Wire Cobo Agentic Wallet API for real Pact creation and approval.
5. Add Foundry or Hardhat tests for the contract.
