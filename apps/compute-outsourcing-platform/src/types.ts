/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CriteriaOption {
  id: string;
  name: string;
  description: string;
  outputRequirements: string;
  scoringDimensions: { name: string; weight: number }[];
  passCondition: string;
  checklist: string[];
  auditPrompt: string;
  disputeTrigger: string;
}

export interface Evaluation {
  validatorAddress: string;
  validatorScore: number;
  validatorReason: string;
  aiScore: number;
  aiExplanation: string;
  finalScore: number;
  delta: number;
  reputationChange: number; // e.g., +3, -5, -15
  settled: boolean;
  payoutTx?: string;
}

export interface MinerSubmission {
  id: string;
  taskId: string;
  workerAddress: string;
  submittedAt: string;
  content: string;
  outputURI: string;
  outputHash: string;
  status: 'Unscored' | 'Scored' | 'Settled';
  evaluation?: Evaluation;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  deadline: string;
  rewardPool: number; // in ETH
  depositAmount: number; // in ETH
  aiAuditEnabled: boolean;
  aiThresholdLine: number; // e.g., 72
  status: 'Active' | 'Completed';
  criteriaName: string;
  criteriaOptions?: CriteriaOption[];
  selectedCriteriaOption?: CriteriaOption;
  outputFormat: string;
  taskURI: string;
  orderURI: string;
  criteriaHash: string;
  minerSubmissionsCount: number;
  minerSubmissions: MinerSubmission[];
}

export interface Activity {
  id: string;
  taskId: string;
  taskTitle: string;
  type: 'Mining' | 'Validation';
  status: 'Unscored' | 'Scored' | 'Settled';
  reward: number; // earned or potential
  timestamp: string;
  score?: number;
  reputationChange?: number;
  info: string;
  submissionId?: string;
}

export interface ApprovalItem {
  id: string;
  type: 'PactCreation' | 'RewardDistribution' | 'Stake';
  title: string;
  description: string;
  amount?: number;
  details?: any;
  createdAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface WalletState {
  connected: boolean;
  address: string;
  balance: number; // ETH
  pendingApprovalsList: ApprovalItem[];
}
