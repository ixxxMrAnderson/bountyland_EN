export const MAX_REPUTATION = 100;

export function clampScore(score) {
  const value = Number(score);
  if (Number.isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateDeviation(validatorScore, aiScore) {
  return Math.abs(clampScore(validatorScore) - clampScore(aiScore));
}

export function classifyDeviation(delta) {
  if (delta <= 20) {
    return "aligned";
  }
  if (delta <= 40) {
    return "medium_deviation";
  }
  return "high_deviation";
}

export function calculateFinalEvaluation({
  validatorScore,
  aiScore,
  validatorReputation = 70
}) {
  const normalizedValidatorScore = clampScore(validatorScore);
  const normalizedAiScore = clampScore(aiScore);
  const reputation = clampScore(validatorReputation);
  const delta = calculateDeviation(normalizedValidatorScore, normalizedAiScore);
  const deviationClass = classifyDeviation(delta);
  const validatorTrust = reputation / MAX_REPUTATION;
  const finalScore = clampScore(
    validatorTrust * normalizedValidatorScore +
      (1 - validatorTrust) * normalizedAiScore
  );

  const reputationDelta =
    deviationClass === "aligned" ? 3 : deviationClass === "medium_deviation" ? -5 : -15;
  const validatorRewardMultiplier =
    deviationClass === "aligned" ? 1 : deviationClass === "medium_deviation" ? 0.6 : 0.2;

  return {
    validatorScore: normalizedValidatorScore,
    aiScore: normalizedAiScore,
    delta,
    deviationClass,
    finalScore,
    reputationDelta,
    validatorRewardMultiplier
  };
}
