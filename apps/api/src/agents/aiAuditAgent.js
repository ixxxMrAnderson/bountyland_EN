import { clampScore } from "../../../../packages/shared/src/scoring.js";

export function auditSubmission({ outputText = "", selectedCriteria }) {
  const text = String(outputText);
  const lowerText = text.toLowerCase();
  let score = 55;

  if (text.length > 500) {
    score += 10;
  }
  if (lowerText.includes("question") && lowerText.includes("answer")) {
    score += 10;
  }
  if (lowerText.includes("reasoning") || lowerText.includes("rationale")) {
    score += 10;
  }
  if (lowerText.includes("difficulty") || lowerText.includes("topic")) {
    score += 5;
  }
  if (lowerText.includes("duplicate") || lowerText.includes("placeholder")) {
    score -= 15;
  }

  const normalizedScore = clampScore(score);

  return {
    aiScore: normalizedScore,
    explanation:
      `Reference audit used ${selectedCriteria?.id || "selected"} criteria. ` +
      "Score is based on schema completeness, reasoning presence, and obvious quality signals.",
    model: "mock-ai-audit-agent-v0"
  };
}
