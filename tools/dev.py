from functools import partial
from http.server import BaseHTTPRequestHandler, SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import hashlib
import json
import time

ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = ROOT / "apps" / "web"

TASKS = {}
SUBMISSIONS = {}
EVALUATIONS = {}
NEXT_TASK_ID = 1

CRITERIA_TEMPLATES = [
    {
        "id": "answer-correctness-first",
        "title": "Answer correctness first",
        "description": "Prioritize whether each QA item has a correct standard answer.",
        "scoringDimensions": [
            {"name": "answer_correctness", "weight": 50},
            {"name": "question_quality", "weight": 20},
            {"name": "reasoning_validity", "weight": 20},
            {"name": "format_completeness", "weight": 10},
        ],
        "passCondition": "Final audited score must be >= 75 and fewer than 5% of sampled answers can be materially wrong.",
        "validatorChecklist": [
            "Sample questions across easy, medium, and hard buckets.",
            "Check that each answer directly resolves the question.",
            "Reject items where reasoning contradicts the final answer.",
            "Verify every item has question, answer, and reasoning fields.",
        ],
        "aiAuditPrompt": "Evaluate sampled reasoning QA records for answer correctness, reasoning validity, and field completeness. Return a 0-100 score and concise explanation.",
        "disputeTrigger": "validator_score and ai_score delta > 40",
    },
    {
        "id": "reasoning-consistency-first",
        "title": "Reasoning consistency first",
        "description": "Prioritize logically consistent reasoning traces over surface-level answer matching.",
        "scoringDimensions": [
            {"name": "reasoning_consistency", "weight": 45},
            {"name": "answer_correctness", "weight": 30},
            {"name": "edge_case_coverage", "weight": 15},
            {"name": "format_completeness", "weight": 10},
        ],
        "passCondition": "Final audited score must be >= 70 and sampled reasoning chains must not contain major logical gaps.",
        "validatorChecklist": [
            "Check that reasoning steps support the answer.",
            "Flag circular, missing, or contradictory reasoning.",
            "Confirm answers are not copied duplicates with minor wording changes.",
            "Verify all required fields exist in the output file.",
        ],
        "aiAuditPrompt": "Score whether the reasoning chain for each sampled QA item is coherent, faithful to the answer, and complete enough for model training.",
        "disputeTrigger": "validator_score and ai_score delta > 40",
    },
    {
        "id": "dataset-quality-and-diversity-first",
        "title": "Dataset quality and diversity first",
        "description": "Prioritize dataset-level diversity, deduplication, and usefulness for training or evaluation.",
        "scoringDimensions": [
            {"name": "topic_diversity", "weight": 30},
            {"name": "deduplication", "weight": 25},
            {"name": "answer_correctness", "weight": 25},
            {"name": "format_completeness", "weight": 20},
        ],
        "passCondition": "Final audited score must be >= 72, duplicate rate must be below 8%, and all records must follow the schema.",
        "validatorChecklist": [
            "Estimate duplicate and near-duplicate rate.",
            "Check distribution across topic and difficulty buckets.",
            "Verify JSON/CSV schema consistency.",
            "Review sampled records for answer quality.",
        ],
        "aiAuditPrompt": "Evaluate the dataset as a training/evaluation asset. Score diversity, duplicate rate, schema completeness, answer quality, and reasoning quality.",
        "disputeTrigger": "validator_score and ai_score delta > 40",
    },
]


class ApiHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        try:
            if self.path == "/health":
                return self._json(200, {"status": "ok", "service": "zai-api-python"})
            if self.path == "/tasks":
                return self._json(200, {"tasks": [with_children(task) for task in TASKS.values()]})
            if self.path.startswith("/tasks/"):
                task_id = int(self.path.split("/")[2])
                task = TASKS.get(task_id)
                return self._json(200, with_children(task)) if task else self._json(404, {"error": "Not found"})
            return self._json(404, {"error": "Not found"})
        except Exception as error:
            return self._json(400, {"error": str(error)})

    def do_POST(self):
        try:
            body = self._read_json()
            if self.path == "/tasks/criteria":
                return self._json(200, propose_criteria(body))
            if self.path == "/tasks":
                return self._json(201, create_task(body))
            if self.path.endswith("/submissions"):
                task_id = int(self.path.split("/")[2])
                return self._json(201, submit_output(task_id, body))
            if self.path.endswith("/evaluations"):
                task_id = int(self.path.split("/")[2])
                return self._json(201, submit_evaluation(task_id, body))
            return self._json(404, {"error": "Not found"})
        except Exception as error:
            return self._json(400, {"error": str(error)})

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        if length == 0:
            return {}
        return json.loads(self.rfile.read(length).decode("utf-8"))

    def _json(self, status, payload):
        encoded = json.dumps(payload, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def log_message(self, format, *args):
        return


def propose_criteria(task_input):
    options = []
    for criteria in CRITERIA_TEMPLATES:
        enriched = dict(criteria)
        enriched["minerOutputRequirements"] = [
            "Dataset contains question, answer, and reasoning fields.",
            "Records are provided as JSONL or CSV with stable schema.",
            "Each record is suitable for downstream model training or evaluation.",
        ]
        enriched["rewardDistributionRule"] = (
            "Worker reward is paid by audited final score; validator reward is reduced when "
            "validator score deviates from AI audit score."
        )
        options.append(enriched)
    return {
        "taskDescription": task_input.get("description"),
        "taskType": task_input.get("taskType", "reasoning_qa_dataset"),
        "options": options,
    }


def create_task(body):
    global NEXT_TASK_ID
    task_input = body["taskInput"]
    criteria = get_criteria(body["selectedCriteriaId"])
    order = {
        "taskSpec": {
            "name": task_input.get("name", "Reasoning QA dataset generation"),
            "description": task_input["description"],
            "taskType": task_input.get("taskType", "reasoning_qa_dataset"),
            "expectedRecords": task_input.get("expectedRecords", 1000),
            "minerOutputFormat": {
                "format": "jsonl",
                "fields": ["question", "answer", "reasoning", "difficulty", "topic"],
            },
        },
        "selectedCriteria": criteria,
        "deadline": task_input.get("deadline", "48h"),
        "rewardBudgetEth": float(task_input.get("rewardBudgetEth", 0.1)),
        "aiAuditEnabled": task_input.get("aiAuditEnabled", True),
    }
    task_hash = digest(order["taskSpec"])
    order_hash = digest(order)
    criteria_hash = digest(criteria)
    contract_params = {
        "taskURI": f"memory://tasks/{task_hash}",
        "orderURI": f"memory://orders/{order_hash}",
        "criteriaHash": f"0x{criteria_hash}",
        "deadline": order["deadline"],
        "aiAuditEnabled": order["aiAuditEnabled"],
        "rewardBudgetEth": order["rewardBudgetEth"],
    }
    task = {
        "id": NEXT_TASK_ID,
        "status": "created",
        "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "order": order,
        "artifacts": {
            "taskURI": contract_params["taskURI"],
            "orderURI": contract_params["orderURI"],
            "criteriaHash": contract_params["criteriaHash"],
            "serializedOrder": json.dumps(order, ensure_ascii=False, sort_keys=True),
        },
        "contractParams": contract_params,
        "coboPactDraft": draft_cobo_pact(order, contract_params),
    }
    TASKS[NEXT_TASK_ID] = task
    SUBMISSIONS[NEXT_TASK_ID] = []
    EVALUATIONS[NEXT_TASK_ID] = []
    NEXT_TASK_ID += 1
    return task


def submit_output(task_id, body):
    task = TASKS.get(task_id)
    if not task:
        raise ValueError(f"Task {task_id} not found")
    output_text = body.get("outputText", "")
    submission = {
        "id": len(SUBMISSIONS[task_id]) + 1,
        "taskId": task_id,
        "submittedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "workerAddress": body.get("workerAddress", "0xworker"),
        "outputURI": body.get("outputURI", f"memory://outputs/{digest(output_text)}"),
        "outputHash": f"0x{digest(output_text or body.get('outputURI', ''))}",
        "outputText": output_text,
    }
    SUBMISSIONS[task_id].append(submission)
    task["status"] = "worker_submitted"
    return submission


def submit_evaluation(task_id, body):
    task = TASKS.get(task_id)
    if not task:
        raise ValueError(f"Task {task_id} not found")
    submissions = SUBMISSIONS.get(task_id, [])
    if not submissions:
        raise ValueError("No worker submission exists for this task")
    submission = submissions[-1]
    ai_audit = audit_submission(submission["outputText"], task["order"]["selectedCriteria"])
    final = calculate_final_evaluation(
        body.get("validatorScore", 0),
        ai_audit["aiScore"],
        body.get("validatorReputation", 70),
    )
    evaluation = {
        "id": len(EVALUATIONS[task_id]) + 1,
        "taskId": task_id,
        "evaluatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "submissionId": submission["id"],
        "workerAddress": submission["workerAddress"],
        "validatorAddress": body.get("validatorAddress", "0xvalidator"),
        "validatorReason": body.get("reason", ""),
        "aiAudit": ai_audit,
        **final,
    }
    EVALUATIONS[task_id].append(evaluation)
    task["status"] = "evaluated"
    return evaluation


def audit_submission(output_text, selected_criteria):
    lower_text = output_text.lower()
    score = 55
    if len(output_text) > 500:
        score += 10
    if "question" in lower_text and "answer" in lower_text:
        score += 10
    if "reasoning" in lower_text or "rationale" in lower_text:
        score += 10
    if "difficulty" in lower_text or "topic" in lower_text:
        score += 5
    if "duplicate" in lower_text or "placeholder" in lower_text:
        score -= 15
    return {
        "aiScore": clamp_score(score),
        "explanation": (
            f"Reference audit used {selected_criteria['id']} criteria. "
            "Score is based on schema completeness, reasoning presence, and obvious quality signals."
        ),
        "model": "mock-ai-audit-agent-v0",
    }


def calculate_final_evaluation(validator_score, ai_score, validator_reputation):
    validator_score = clamp_score(validator_score)
    ai_score = clamp_score(ai_score)
    validator_reputation = clamp_score(validator_reputation)
    delta = abs(validator_score - ai_score)
    if delta <= 20:
        deviation_class = "aligned"
        reputation_delta = 3
        reward_multiplier = 1
    elif delta <= 40:
        deviation_class = "medium_deviation"
        reputation_delta = -5
        reward_multiplier = 0.6
    else:
        deviation_class = "high_deviation"
        reputation_delta = -15
        reward_multiplier = 0.2
    validator_trust = validator_reputation / 100
    final_score = clamp_score((validator_trust * validator_score) + ((1 - validator_trust) * ai_score))
    return {
        "validatorScore": validator_score,
        "aiScore": ai_score,
        "delta": delta,
        "deviationClass": deviation_class,
        "finalScore": final_score,
        "reputationDelta": reputation_delta,
        "validatorRewardMultiplier": reward_multiplier,
    }


def draft_cobo_pact(order, contract_params):
    return {
        "policyName": f"compute-task-{contract_params['criteriaHash'][2:10]}",
        "walletPurpose": "Task reward escrow and settlement approval",
        "chainType": "ETH",
        "maxTaskFundingEth": order["rewardBudgetEth"],
        "allowedContract": "ComputeOutsourcePlatform",
        "allowedFunctions": ["createTask", "fundTask", "finalizeEvaluation", "claimReward"],
        "alwaysReviewFunctions": ["slashValidator", "withdraw", "changeOracleSigner"],
        "dailyTransactionLimit": 20,
        "humanApprovalRequired": True,
    }


def with_children(task):
    if not task:
        return None
    return {
        **task,
        "submissions": SUBMISSIONS.get(task["id"], []),
        "evaluations": EVALUATIONS.get(task["id"], []),
    }


def get_criteria(criteria_id):
    for criteria in CRITERIA_TEMPLATES:
        if criteria["id"] == criteria_id:
            return criteria
    raise ValueError(f"Unknown criteria option: {criteria_id}")


def digest(value):
    encoded = json.dumps(value, ensure_ascii=False, sort_keys=True).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def clamp_score(value):
    try:
        numeric = round(float(value))
    except (TypeError, ValueError):
        numeric = 0
    return max(0, min(100, numeric))


class ReusableHTTPServer(ThreadingHTTPServer):
    allow_reuse_address = True


if __name__ == "__main__":
    api_server = ReusableHTTPServer(("127.0.0.1", 8787), ApiHandler)
    web_handler = partial(SimpleHTTPRequestHandler, directory=WEB_ROOT)
    web_server = ReusableHTTPServer(("127.0.0.1", 5173), web_handler)

    Thread(target=api_server.serve_forever, daemon=True).start()
    Thread(target=web_server.serve_forever, daemon=True).start()
    print("API listening on http://127.0.0.1:8787", flush=True)
    print("Web listening on http://127.0.0.1:5173", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        api_server.shutdown()
        web_server.shutdown()
        print("\nStopped.")
