import crypto from "node:crypto";

const REPORT = `# BountyLand Mock Debug Report

## Summary

The demo agent reproduced a representative smart-contract test failure, traced it to an unchecked authorization branch, and prepared a conservative patch.

## Findings

- The privileged write path did not consistently validate the caller.
- A guard was added before state mutation.
- Regression coverage was added for unauthorized and authorized callers.

## Verification

The mock run reports all checks as passing. No repository was cloned, no command was executed, and no external AI service was called.

> Demo mode: this artifact is deterministic sample output and must not be treated as a real security audit.
`;

const PATCH = `diff --git a/contracts/Vault.sol b/contracts/Vault.sol
index 1111111..2222222 100644
--- a/contracts/Vault.sol
+++ b/contracts/Vault.sol
@@ -18,6 +18,7 @@ contract Vault {
     function updateRecipient(address nextRecipient) external {
+        require(msg.sender == owner, "not authorized");
         recipient = nextRecipient;
     }
 }
`;

export function routeMockRequest({ method, path, query = {}, body = {} }) {
  if (method === "GET" && path === "/health") {
    return json(200, {
      status: "ok",
      service: "bountyland-mock-agent",
      mode: "mock",
      external_api_calls: false
    });
  }

  if (method === "POST" && path === "/v1/intake") {
    return json(200, buildIntake(body, false));
  }

  if (method === "POST" && path === "/v1/execute") {
    const taskId = `task_mock_${crypto.randomUUID().replaceAll("-", "").slice(0, 12)}`;
    return json(200, {
      intake: buildIntake(body, true),
      execution: {
        task_id: taskId,
        status: "diagnosed",
        summary: {
          repo_url: extractRepoUrl(body.user_input),
          test_command: "mock verification suite",
          reproduced: true,
          returncode: 1,
          candidate_files: 2,
          patch_generated: true,
          verification_returncode: 0,
          patch_iterations: 1,
          cleanup_repo: true
        },
        artifacts: [
          { type: "debug_report", path: `artifacts/${taskId}/debug_report.md` },
          { type: "patch", path: `artifacts/${taskId}/patch.diff` },
          { type: "trace", path: `artifacts/${taskId}/trace.json` }
        ],
        usage: {
          miner: "mock-debug-miner",
          repo_cloned: false,
          commands_run: 0,
          patch_iterations: 1,
          patch_generated: true,
          files_modified: 1,
          verification_returncode: 0,
          cleanup_repo: true,
          llm: {
            provider: "mock",
            model: "bountyland-demo-v1",
            calls: 0,
            total_tokens: 0
          },
          llm_total_tokens: 0
        }
      }
    });
  }

  if (method === "GET" && path === "/v1/artifacts/download") {
    const filename = String(query.filename || "");
    if (filename === "debug_report.md") {
      return text(200, REPORT, "text/markdown; charset=utf-8");
    }
    if (filename === "patch.diff") {
      return text(200, PATCH, "text/x-diff; charset=utf-8");
    }
    if (filename === "trace.json") {
      return text(200, JSON.stringify({
        mode: "mock",
        external_api_calls: false,
        repository_cloned: false,
        commands_executed: 0,
        events: [
          { step: "intake", status: "completed" },
          { step: "diagnosis", status: "simulated" },
          { step: "patch", status: "simulated" },
          { step: "verification", status: "simulated" }
        ]
      }, null, 2), "application/json; charset=utf-8");
    }
    return json(404, { error: "Mock artifact not found" });
  }

  if (method === "POST" && path === "/v1/human-market/spec") {
    return json(200, {
      status: "ready",
      ready: true,
      mode: "mock",
      task_definition: {
        title: "Mock computation bounty",
        description: String(body.user_input || "Demo task")
      },
      validator_criteria: {
        pass_score: 80,
        dimensions: ["correctness", "reproducibility", "artifact quality"]
      },
      reward_rule: { strategy: "winner_takes_all" }
    });
  }

  return json(404, { error: "Mock route not found", method, path });
}

function buildIntake(body, confirmed) {
  const userInput = String(body.user_input || "");
  return {
    status: confirmed ? "ready" : "awaiting_price_confirmation",
    ready: confirmed,
    agent_message: "Demo mode: task parsed locally. No API key or external model is being used.",
    missing_fields: [],
    suggested_price: 0.15,
    user_budget: body.user_budget ?? null,
    draft_task: {
      task_type: "code_debug",
      title: "Mock Web3 debugging task",
      goal: userInput
    },
    ...(confirmed ? {
      task_spec: {
        task_type: "code_debug",
        title: "Mock Web3 debugging task",
        goal: userInput,
        output_format: "debug_report"
      }
    } : {}),
    usage: {
      agent: "mock-task-intake",
      llm: {
        provider: "mock",
        model: "bountyland-demo-v1",
        total_tokens: 0
      },
      pricing: {
        suggested_price: 0.15,
        user_budget: body.user_budget ?? null,
        currency: "ETH"
      }
    }
  };
}

function extractRepoUrl(value) {
  const match = String(value || "").match(/https:\/\/github\.com\/[^\s]+/i);
  return match?.[0] || "https://github.com/example/mock-repository";
}

function json(status, body) {
  return {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body)
  };
}

function text(status, body, contentType) {
  return {
    status,
    headers: { "content-type": contentType },
    body
  };
}
