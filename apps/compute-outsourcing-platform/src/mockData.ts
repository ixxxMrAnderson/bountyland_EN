/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, Activity, CriteriaOption, MinerSubmission } from './types';

// Helper to generate a random hash
export function generateHash(prefix: string): string {
  const chars = '0123456789abcdef';
  let result = prefix;
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// Generate Criteria options based on user text keywords
export function getCriteriaOptionsForTask(taskDescription: string): CriteriaOption[] {
  const lowercase = taskDescription.toLowerCase();

  // 1. Security / Audit task type
  if (lowercase.includes('contract') || lowercase.includes('security') || lowercase.includes('audit') || lowercase.includes('bug')) {
    return [
      {
        id: 'sec-heavy',
        name: 'Vulnerability Coverage & Exploit Depth',
        description: 'Prioritizes finding high/medium risk vulnerabilities with verifiable proofs of concept and clear remediation steps.',
        outputRequirements: 'Markdown audit report featuring vulnerability tables, threat severity levels, attack vectors, and proposed code fixes.',
        scoringDimensions: [
          { name: 'Vulnerability Accuracy & Severity Classification', weight: 40 },
          { name: 'Proof of Concept & Attack Path Explanation', weight: 35 },
          { name: 'Mitigation Feasibility & Code Remediation Quality', weight: 25 }
        ],
        passCondition: 'Weighted aggregate score >= 75 / 100 on verified critical items.',
        checklist: [
          'Verify if standard vulnerabilities (reentrancy, overflow, access control) are caught.',
          'Check if remediation code compiles and prevents the identified exploit.',
          'Assess whether severity ratings are justified with clear impacts.'
        ],
        auditPrompt: `Evaluate the smart contract audit report. Verify if critical vectors of the target protocol were correctly audited. Reference vulnerabilities score higher only if accompanied by correct mitigation paths.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 30.'
      },
      {
        id: 'test-coverage',
        name: 'Exploit Test Harness Implementation',
        description: 'Focuses on writing custom Foundry or Hardhat test scripts that successfully exploit the specified vulnerabilities.',
        outputRequirements: 'Runnable Solidity/TypeScript exploit test cases, terminal log captures, and explanatory comments.',
        scoringDimensions: [
          { name: 'Exploit Reproducibility & Test Execution', weight: 45 },
          { name: 'Edge Case Scenario Planning', weight: 35 },
          { name: 'Code Quality and Assertion Rigor', weight: 20 }
        ],
        passCondition: 'All exploit tests pass successfully (asserting transaction failure on malicious calls) with > 80% contract coverage.',
        checklist: [
          'Run tests locally to check if the exploit successfully reverts target state assertions.',
          'Verify test setup uses realistic fork or network state.',
          'Inspect code against clean assertion best practices.'
        ],
        auditPrompt: `Check script structure. Penalize mock test helpers or fake assertions. AI Auditor must run a simulated assertion check.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 25.'
      }
    ];
  }

  // 2. Dataset / QA generation
  if (lowercase.includes('dataset') || lowercase.includes('qa') || lowercase.includes('question') || lowercase.includes('reasoning') || lowercase.includes('dataset')) {
    return [
      {
        id: 'reasoning-heavy',
        name: 'Reasoning Coherence & Chain-of-Thought',
        description: 'Emphasizes complex reasoning steps, multi-hop logic flow, and detailed step-by-step rationales behind standard answers.',
        outputRequirements: 'JSONL records consisting of: question, step_by_step_reasoning, standard_answer, difficulty_rating, and tag_taxonomy.',
        scoringDimensions: [
          { name: 'Multi-Hop Logic Verifiability & Step Coherence', weight: 50 },
          { name: 'Standard Answer Correctness & Rigor', weight: 30 },
          { name: 'Tagging and Difficulty Taxonomy Accuracy', weight: 20 }
        ],
        passCondition: 'Average logical consistency assessment score >= 80 / 100.',
        checklist: [
          'Check that standard answers match mathematically or factually.',
          'Verify chain of thought does not contain hallucinated interim steps.',
          'Ensure the question requires genuine reasoning rather than simple lookups.'
        ],
        auditPrompt: `Act as a senior logician. Scan the submitted QA pairs for hallucinated logic or generic templates. Score highly only if complex multi-turn logic applies.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 20.'
      },
      {
        id: 'diversity-heavy',
        name: 'Dataset Diversity & High Out-of-Distribution Coverage',
        description: 'Focuses on building atypical, corner-case reasoning examples to test AI robustness, avoiding repeated templates.',
        outputRequirements: 'Structured files containing at least 200 distinct topic fields with zero lexical overlap.',
        scoringDimensions: [
          { name: 'Out-Of-Distribution Variety & Semantic Novelty', weight: 45 },
          { name: 'Fringe/Corner Case Formatting Detail', weight: 35 },
          { name: 'Token Length & Explanation Completeness', weight: 20 }
        ],
        passCondition: 'Semantic diversity score >= 72 / 100 (using low overlap heuristics).',
        checklist: [
          'Assess semantic cluster diversity using diverse subject headings.',
          'Ensure formatting complies with parse constraints.',
          'Audit the submission for duplicate patterns and lazy variations.'
        ],
        auditPrompt: `Analyze semantic diversity. Filter against template reuse. Highly penalize similar syntactic constructs.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 30.'
      }
    ];
  }

  // 3. OCR / Translation / Processing
  if (lowercase.includes('ocr') || lowercase.includes('translation') || lowercase.includes('transcribe') || lowercase.includes('text') || lowercase.includes('medical')) {
    return [
      {
        id: 'char-correctness',
        name: 'Extreme Character Precision & Accuracy',
        description: 'Requires near-100% character matching on complex jargon (medical prescriptions, ancient manuscripts, or financial receipts).',
        outputRequirements: 'Plain text correction output aligned with source bounding boxes, annotated list of illegible strings.',
        scoringDimensions: [
          { name: 'Character-Level Transcription Accuracy (Levenstein)', weight: 60 },
          { name: 'Structure preservation (tables, metadata)', weight: 25 },
          { name: 'Unclear symbol annotations/heuristics', weight: 15 }
        ],
        passCondition: 'Character match threshold >= 98.7% with precise symbol labeling.',
        checklist: [
          'Perform diff analysis against baseline ground truth samples.',
          'Validate nested markdown table alignment.',
          'Confirm illegible token mapping matches image markers.'
        ],
        auditPrompt: `Compare string sequences closely. Conduct fuzzy matching and detect missed terms or misread shorthand words.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 15.'
      },
      {
        id: 'contextual-interpretation',
        name: 'Semantic Localization & Technical Intent Preservation',
        description: 'Translates jargon while preserving domain-specific nuances, slang, and legal/regulatory definitions.',
        outputRequirements: 'Dual-column translation markdown table, glossary index, and translator footnotes.',
        scoringDimensions: [
          { name: 'Domain Terminology Precision (Niche Glossary Check)', weight: 45 },
          { name: 'Grammatical Nuance & Technical Intent', weight: 35 },
          { name: 'Annotation Exhaustiveness', weight: 20 }
        ],
        passCondition: 'Glossary adherence rate = 100%, flow readability check exceeds 85/100.',
        checklist: [
          'Verify mandatory glossary mappings were strictly adhered to.',
          'Read technical definitions to ensure no business critical context is flipped.',
          'Double check footnotes for proper professional attribution.'
        ],
        auditPrompt: `Review translated text. Inspect compliance with specific vocabulary list. Check for literal translation errors or context mismatches.`,
        disputeTrigger: 'Validator score and AI reference score deviate by delta > 20.'
      }
    ];
  }

  // 4. Default Fallback
  return [
    {
      id: 'default-coherence',
      name: 'Functional Completeness & Quality',
      description: 'Standard evaluation framework ensuring all prompt requirements are fully met, readable, and structurally sound.',
      outputRequirements: 'Completed task submission file matching requested fields and formats.',
      scoringDimensions: [
        { name: 'Completeness against Prompt Spec', weight: 50 },
        { name: 'Technical Clarity and Depth of Detail', weight: 35 },
        { name: 'Adherence to Output Formatting Rules', weight: 15 }
      ],
      passCondition: 'Overall validation score >= 70 / 100.',
      checklist: [
        'Confirm every instruction in the task description is addressed.',
        'Check output formatting matches parser requirements.',
        'Read text for clear, professional logical flow.'
      ],
      auditPrompt: `Systematically audit the compute output. Rate completeness and adherence to the layout structure. Score fairly as a baseline evaluator.`,
      disputeTrigger: 'Validator score and AI reference score deviate by delta > 20.'
    },
    {
      id: 'default-rigor',
      name: 'Analytical Rigor & Verifiability',
      description: 'Focuses on deep, rigorous logical analysis and data corroboration with verifiable links or formulas.',
      outputRequirements: 'Exhaustive analysis text with technical citations, mathematical reasoning, and error estimation.',
      scoringDimensions: [
        { name: 'Mathematical Factuality & Formula Accuracy', weight: 50 },
        { name: 'Source Triangulation & Verification Depth', weight: 30 },
        { name: 'Structure and Schema Precision', weight: 20 }
      ],
      passCondition: 'Zero factual/mathematical errors with all sources linked correctly.',
      checklist: [
        'Check numerical calculations are calculated with correct precedence.',
        'Verify references are active or verifiable logically.',
        'Validate compliance with markdown equations formatting.'
      ],
      auditPrompt: `Double check formulas, mathematical steps, and code blocks. Identify bugs or incorrect math assumptions and deduct score severely.`,
      disputeTrigger: 'Validator score and AI reference score deviate by delta > 25.'
    }
  ];
}

// Pre-packaged tasks
export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Reasoning QA Dataset Generation for Crypto Protocol Testing',
    description: 'We need high-quality multi-hop reasoning QA pairs focusing on DeFi lending mechanism exploits under volatile liquidation events. The dataset should contain 50 detailed cases describing exact math steps, liquidation pools, Oracle price dynamics, and safety proofs.',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(), // 36 hours ago
    deadline: '48h remaining',
    rewardPool: 0.150,
    depositAmount: 0.150,
    aiAuditEnabled: true,
    aiThresholdLine: 75,
    status: 'Active',
    criteriaName: 'Reasoning Coherence & Chain-of-Thought',
    selectedCriteriaOption: {
      id: 't1-crit',
      name: 'Reasoning Coherence & Chain-of-Thought',
      description: 'Emphasizes complex reasoning steps, multi-hop logic flow, and detailed step-by-step rationales behind standard answers.',
      outputRequirements: 'JSONL records consisting of: question, step_by_step_reasoning, standard_answer, difficulty_rating, and tag_taxonomy.',
      scoringDimensions: [
        { name: 'Multi-Hop Logic Verifiability & Step Coherence', weight: 50 },
        { name: 'Standard Answer Correctness & Rigor', weight: 30 },
        { name: 'Tagging and Difficulty Taxonomy Accuracy', weight: 20 }
      ],
      passCondition: 'Average logical consistency assessment score >= 75 / 100.',
      checklist: [
        'Check that standard answers match mathematically or factually.',
        'Verify chain of thought does not contain hallucinated interim steps.',
        'Ensure the question requires genuine reasoning rather than simple lookups.'
      ],
      auditPrompt: `Act as a senior logician. Scan the submitted QA pairs for hallucinated logic or generic templates. Score highly only if complex multi-turn logic applies.`,
      disputeTrigger: 'Validator score and AI reference score deviate by delta > 20.'
    },
    outputFormat: 'JSONL Dataset',
    taskURI: 'ipfs://QmYwAPJzs.../task_spec.json',
    orderURI: 'ipfs://QmT5Kvx.../order_spec.json',
    criteriaHash: '0x81b7dc...ce391b',
    minerSubmissionsCount: 2,
    minerSubmissions: [
      {
        id: 'sub-1',
        taskId: 'task-1',
        workerAddress: '0x9486...88b2 (Worker Alpha)',
        submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(), // 24 hours ago
        content: `{\n  "question": "If price drops 30% instantly in lending pool A, triggering liquidation with close_factor 0.5, calculate the remaining debt if collateral is valued at 120% of debt before drop?",\n  "step_by_step_reasoning": "1. Debt before drop = D. Collateral = 1.2D. \\n2. Price drops 30%: Collateral value is now 1.2D * 0.7 = 0.84D.\\n3. This falls below liquidation threshold (typically 1.1). Collateral ratio is now 0.84.\\n4. Liquidator can repay close_factor * D = 0.5D.\\n5. Liquidator receives close_factor * D * (1 + liquidator_incentive of 0.1) in collateral = 0.55D of collateral.\\n6. Remaining collateral = 0.84 - 0.55 = 0.29D.\\n7. Remaining debt = 1D - 0.5D = 0.5D.",\n  "standard_answer": "Remaining debt is 0.5D, remaining collateral is 0.29D, liquidation transaction succeeded under volatile state.",\n  "difficulty_rating": "Hard",\n  "tag_taxonomy": "liquidation-math, lending-pool-A"\n}`,
        outputURI: 'ipfs://QmRx32F.../worker_alpha_output.jsonl',
        outputHash: '0x49f3e0c000...5a8df233',
        status: 'Settled',
        evaluation: {
          validatorAddress: '0xfefe...c0b0 (Vali-Core)',
          validatorScore: 88,
          validatorReason: 'Excellent math modeling! Detailed step-by-step logic perfectly matches protocol parameters. The tag taxonomy is accurate and difficult rating is correct.',
          aiScore: 85,
          aiExplanation: 'AI Auditor confirms the liquidated liquidation close_factor debt remaining matches standard EVM execution constraints exactly. Multi-hop equations are fully verified.',
          finalScore: 88,
          delta: 3,
          reputationChange: 3,
          settled: true,
          payoutTx: '0xe88a8d11c0f000bbaae999d34211adffec4aef0c851'
        }
      },
      {
        id: 'sub-2',
        taskId: 'task-1',
        workerAddress: '0x71a2...7cba (Worker Sybil)',
        submittedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(), // 12 hours ago
        content: `{\n  "question": "What is liqudation?",\n  "step_by_step_reasoning": "When bad things happen, assets get liquidated quickly. The protocol does it auto. It is very simple.",\n  "standard_answer": "Liquidation means selling of collateral assets",\n  "difficulty_rating": "Easy",\n  "tag_taxonomy": "general-info"\n}`,
        outputURI: 'ipfs://QmTrsh.../miner_sybil_output.jsonl',
        outputHash: '0xfba1200233...9d83ac2',
        status: 'Settled',
        evaluation: {
          validatorAddress: '0x9999...a8f4 (Vali-Collusive)',
          validatorScore: 92, // High score given maliciously!
          validatorReason: 'This dataset is extremely direct, user-friendly, and simple to parse. Explains core concepts in beautiful plain English. Fully deserves top score!',
          aiScore: 30, // Extremely low score by AI!
          aiExplanation: 'CRITICAL AUDIT EXCEPTION: Miner output does not conform to the required mathematical multi-step liquidation scenarios. It provides simple definitions instead of math models. Validator exhibits severe positive rating bias.',
          finalScore: 42.4, // Automatically adjusted down by contract!
          delta: 62, // Great deviation!
          reputationChange: -15, // Severe penalty!
          settled: true,
          payoutTx: '0xa77ba3a3eead991bcdd0cd93a4049fc118adff435'
        }
      }
    ]
  },
  {
    id: 'task-2',
    title: 'Financial Document Synthesizer & Intent Classifier',
    description: 'Provide 15 complex synthetic customer transcripts for AI banking assistants. Each transcript must contain multiple user actions (e.g., query refund, move savings, dispute overdraft fee, set transaction alert) with labeled entity extraction tags.',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(), // 10 hours ago
    deadline: '24h remaining',
    rewardPool: 0.080,
    depositAmount: 0.080,
    aiAuditEnabled: true,
    aiThresholdLine: 72,
    status: 'Active',
    criteriaName: 'Dataset Diversity & High Out-of-Distribution Coverage',
    selectedCriteriaOption: {
      id: 't2-crit',
      name: 'Dataset Diversity & High Out-of-Distribution Coverage',
      description: 'Focuses on building atypical, corner-case reasoning examples to test AI banking assistants, avoiding repeated templates.',
      outputRequirements: 'Structured JSON files containing custom multi-intent dialogues and labeled entities.',
      scoringDimensions: [
        { name: 'Out-Of-Distribution Variety & Semantic Novelty', weight: 45 },
        { name: 'Fringe/Corner Case Formatting Detail', weight: 35 },
        { name: 'Token Length & Explanation Completeness', weight: 20 }
      ],
      passCondition: 'Semantic diversity score >= 72 / 100 (using low overlap heuristics).',
      checklist: [
        'Assess semantic cluster diversity using diverse banks and slang terms.',
        'Ensure formatting complies with standard JSON parse constraints.',
        'Audit the submission for duplicated templates.'
      ],
      auditPrompt: `Analyze semantic diversity. Filter against template reuse. Highly penalize similar syntactic constructs.`,
      disputeTrigger: 'Validator score and AI reference score deviate by delta > 30.'
    },
    outputFormat: 'JSON File',
    taskURI: 'ipfs://QmPx22B.../banking_intent_spec.json',
    orderURI: 'ipfs://QmTo88Wp.../order_spec.json',
    criteriaHash: '0x7cf189...8f9e0a',
    minerSubmissionsCount: 1,
    minerSubmissions: [
      {
        id: 'sub-3',
        taskId: 'task-2',
        workerAddress: '0x3a4c...1d23 (Worker Bravo)',
        submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        content: `[\n  {\n    "id": "tx_trans_01",\n    "text": "Hey, I need to check why my mortgage payment of $1200 failed yesterday, can you move $1500 from my savings wallet 0x33 to checking wallet 0x12 and retry that payment immediately?",\n    "intents": ["query_payment_failure", "transfer_funds", "retry_payment"],\n    "entities": [\n      {"type": "category", "value": "mortgage"},\n      {"type": "amount", "value": "$1200"},\n      {"type": "source_wallet", "value": "0x33"},\n      {"type": "target_wallet", "value": "0x12"}\n    ]\n  }\n]`,
        outputURI: 'ipfs://QmX9z7G.../bravo_banking_transcript.json',
        outputHash: '0xf783b99912...222e9f0',
        status: 'Unscored'
      }
    ]
  },
  {
    id: 'task-3',
    title: 'Medical OCR Text Correction Batch: Clinical Trials Logs',
    description: 'Review and transcribe 20 ancient scanned handwriting records of patient vitals logs in clinical phase 1 records. Crucial data includes drug code names (e.g. TR-204, KB-10), precise timestamp alignments, dosages, and clinician remarks. Extreme accuracy is essential.',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(), // 2 hours ago
    deadline: '46h remaining',
    rewardPool: 0.050,
    depositAmount: 0.050,
    aiAuditEnabled: true,
    aiThresholdLine: 80,
    status: 'Active',
    criteriaName: 'Extreme Character Precision & Accuracy',
    selectedCriteriaOption: {
      id: 't3-crit',
      name: 'Extreme Character Precision & Accuracy',
      description: 'Requires near-100% character matching on complex medical prescriptions and vitals logs.',
      outputRequirements: 'Plain text correction output aligned with source bounding boxes, annotated list of illegible strings.',
      scoringDimensions: [
        { name: 'Character-Level Transcription Accuracy (Levenstein)', weight: 60 },
        { name: 'Structure preservation (tables, metadata)', weight: 25 },
        { name: 'Unclear symbol annotations/heuristics', weight: 15 }
      ],
      passCondition: 'Character match threshold >= 98.7% with precise symbol labeling.',
      checklist: [
        'Perform diff analysis against baseline ground truth samples.',
        'Validate nested markdown table alignment.',
        'Confirm illegible token mapping matches image markers.'
      ],
      auditPrompt: `Compare string sequences closely. Conduct fuzzy matching and detect missed terms or misread shorthand words.`,
      disputeTrigger: 'Validator score and AI reference score deviate by delta > 15.'
    },
    outputFormat: 'Preformatted Markdown Bounding Table',
    taskURI: 'ipfs://QmY788C.../vitallog_spec.json',
    orderURI: 'ipfs://QmZ9f99.../order_spec.json',
    criteriaHash: '0x992ff1...349282',
    minerSubmissionsCount: 0,
    minerSubmissions: []
  }
];

// Combine initial tasks into aggregate user work history
export function getInitialActivities(): Activity[] {
  return [
    {
      id: 'act-1',
      taskId: 'task-1',
      taskTitle: 'Reasoning QA Dataset Generation for Crypto Protocol Testing',
      type: 'Mining',
      status: 'Settled',
      reward: 0.134, // (Final score: 88, got a portion of reward pool)
      timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      score: 88,
      info: 'Mining activity | Settled | Final score: 88 | Submitted 1d ago',
      submissionId: 'sub-1'
    },
    {
      id: 'act-2',
      taskId: 'task-1',
      taskTitle: 'Reasoning QA Dataset Generation for Crypto Protocol Testing',
      type: 'Validation',
      status: 'Settled',
      reward: 0.003,
      timestamp: new Date(Date.now() - 11.5 * 3600 * 1000).toISOString(),
      score: 92, // validator submitted 92
      reputationChange: -15, // got slashed!
      info: 'Validation activity | Settled | Validator delta: 62 (Flagged!) | Reputation -15',
      submissionId: 'sub-2'
    }
  ];
}
