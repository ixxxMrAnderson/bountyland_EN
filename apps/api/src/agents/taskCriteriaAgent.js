import { criteriaTemplates, getCriteriaById } from "../../../../packages/shared/src/criteria.js";

export function generateCriteriaOptions(taskInput) {
  return {
    taskDescription: taskInput.description,
    taskType: taskInput.taskType || "reasoning_qa_dataset",
    options: criteriaTemplates.map((criteria) => ({
      ...criteria,
      minerOutputRequirements: [
        "Dataset contains question, answer, and reasoning fields.",
        "Records are provided as JSONL or CSV with stable schema.",
        "Each record is suitable for downstream model training or evaluation."
      ],
      rewardDistributionRule:
        "Worker reward is paid by audited final score; validator reward is reduced when validator score deviates from AI audit score."
    }))
  };
}

export function buildComputationOrder({ taskInput, selectedCriteriaId }) {
  const selectedCriteria = getCriteriaById(selectedCriteriaId);
  if (!selectedCriteria) {
    throw new Error(`Unknown criteria option: ${selectedCriteriaId}`);
  }

  return {
    taskSpec: {
      name: taskInput.name || "Reasoning QA dataset generation",
      description: taskInput.description,
      taskType: taskInput.taskType || "reasoning_qa_dataset",
      expectedRecords: taskInput.expectedRecords || 1000,
      minerOutputFormat: {
        format: "jsonl",
        fields: ["question", "answer", "reasoning", "difficulty", "topic"]
      }
    },
    selectedCriteria,
    deadline: taskInput.deadline || "48h",
    rewardBudgetEth: Number(taskInput.rewardBudgetEth || 0.1),
    aiAuditEnabled: taskInput.aiAuditEnabled !== false
  };
}
