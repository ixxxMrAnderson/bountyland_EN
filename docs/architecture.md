# Development Architecture

This repo mirrors the product flow from sections 1 and 2 of `agent_audited_compute_outsourcing_platform.md`.

```text
apps/compute-outsourcing-platform
  Fancy React/Vite UI
    -> Cobo wallet widget
    -> agent workflow pages
    -> task/order/demo surfaces

apps/api
  Task Criteria Agent
    -> returns validator acceptance criteria
  Task Service
    -> creates orderURI / taskURI / criteriaHash
    -> drafts Cobo Pact policy
  Worker Submission
    -> stores outputURI / outputHash
  Validator Evaluation
    -> records validator score
  AI Audit Agent
    -> returns mock reference score
  Scoring
    -> computes deviation, final score, reward multiplier

contracts
  ComputeOutsourcePlatform.sol
    -> settlement and reputation logic scaffold
```

The current implementation is deliberately dependency-free so it can run before package installation. Replace the mock services with real integrations in this order:

1. Persist task/order/submission state in a database.
2. Store task artifacts in IPFS, S3, or another content-addressed store.
3. Replace `mock-ai-audit-agent-v0` with a model-backed evaluator.
4. Replace the Cobo Pact draft with real Cobo Agentic Wallet API calls.
5. Add Foundry or Hardhat tests for the Solidity contract.
