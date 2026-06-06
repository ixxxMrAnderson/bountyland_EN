export function draftCoboPactPolicy({ order, contractParams }) {
  return {
    policyName: `compute-task-${contractParams.criteriaHash.slice(2, 10)}`,
    walletPurpose: "Task reward escrow and settlement approval",
    chainType: "ETH",
    maxTaskFundingEth: order.rewardBudgetEth,
    allowedContract: "ComputeOutsourcePlatform",
    allowedFunctions: ["createTask", "fundTask", "finalizeEvaluation", "claimReward"],
    alwaysReviewFunctions: ["slashValidator", "withdraw", "changeOracleSigner"],
    dailyTransactionLimit: 20,
    humanApprovalRequired: true
  };
}
