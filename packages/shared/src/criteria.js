export const criteriaTemplates = [
  {
    id: "answer-correctness-first",
    title: "Answer correctness first",
    description: "Prioritize whether each QA item has a correct standard answer.",
    scoringDimensions: [
      { name: "answer_correctness", weight: 50 },
      { name: "question_quality", weight: 20 },
      { name: "reasoning_validity", weight: 20 },
      { name: "format_completeness", weight: 10 }
    ],
    passCondition: "Final audited score must be >= 75 and fewer than 5% of sampled answers can be materially wrong.",
    validatorChecklist: [
      "Sample questions across easy, medium, and hard buckets.",
      "Check that each answer directly resolves the question.",
      "Reject items where reasoning contradicts the final answer.",
      "Verify every item has question, answer, and reasoning fields."
    ],
    aiAuditPrompt:
      "Evaluate sampled reasoning QA records for answer correctness, reasoning validity, and field completeness. Return a 0-100 score and concise explanation.",
    disputeTrigger: "validator_score and ai_score delta > 40"
  },
  {
    id: "reasoning-consistency-first",
    title: "Reasoning consistency first",
    description: "Prioritize logically consistent reasoning traces over surface-level answer matching.",
    scoringDimensions: [
      { name: "reasoning_consistency", weight: 45 },
      { name: "answer_correctness", weight: 30 },
      { name: "edge_case_coverage", weight: 15 },
      { name: "format_completeness", weight: 10 }
    ],
    passCondition: "Final audited score must be >= 70 and sampled reasoning chains must not contain major logical gaps.",
    validatorChecklist: [
      "Check that reasoning steps support the answer.",
      "Flag circular, missing, or contradictory reasoning.",
      "Confirm answers are not copied duplicates with minor wording changes.",
      "Verify all required fields exist in the output file."
    ],
    aiAuditPrompt:
      "Score whether the reasoning chain for each sampled QA item is coherent, faithful to the answer, and complete enough for model training.",
    disputeTrigger: "validator_score and ai_score delta > 40"
  },
  {
    id: "dataset-quality-and-diversity-first",
    title: "Dataset quality and diversity first",
    description: "Prioritize dataset-level diversity, deduplication, and usefulness for training or evaluation.",
    scoringDimensions: [
      { name: "topic_diversity", weight: 30 },
      { name: "deduplication", weight: 25 },
      { name: "answer_correctness", weight: 25 },
      { name: "format_completeness", weight: 20 }
    ],
    passCondition: "Final audited score must be >= 72, duplicate rate must be below 8%, and all records must follow the schema.",
    validatorChecklist: [
      "Estimate duplicate and near-duplicate rate.",
      "Check distribution across topic and difficulty buckets.",
      "Verify JSON/CSV schema consistency.",
      "Review sampled records for answer quality."
    ],
    aiAuditPrompt:
      "Evaluate the dataset as a training/evaluation asset. Score diversity, duplicate rate, schema completeness, answer quality, and reasoning quality.",
    disputeTrigger: "validator_score and ai_score delta > 40"
  }
];

export function getCriteriaById(criteriaId) {
  return criteriaTemplates.find((criteria) => criteria.id === criteriaId);
}
