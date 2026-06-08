/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AgentFlowDraft,
  StrategyQuestion,
  ZAiModelConfig,
  ZAiStrategyResponse
} from './types';

export const zAiModelConfig: ZAiModelConfig = {
  provider: 'z.ai',
  model: 'z.ai-spec-agent-mock-v0',
  mode: 'mock'
};

export async function callZAiModelMock<T>(label: string, payload: T): Promise<T> {
  // Framework placeholder: swap this function with the real z.ai API call later.
  console.info(`[z.ai mock] ${label}`, payload);
  return payload;
}

export async function requestZAiStrategyQuestions(
  draft: AgentFlowDraft,
  locale: 'en' | 'zh',
  phase: 'methodology' | 'strategy' = 'strategy'
): Promise<ZAiStrategyResponse> {
  try {
    const response = await fetch('/api/zai/agent-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locale,
        phase,
        draft
      })
    });

    if (!response.ok) {
      throw new Error(`Z.AI bridge returned ${response.status}`);
    }

    return await response.json() as ZAiStrategyResponse;
  } catch (error) {
    return createLocalStrategyResponse(draft, locale, phase, error instanceof Error ? error.message : 'Unknown error');
  }
}

function createLocalStrategyResponse(
  draft: AgentFlowDraft,
  locale: 'en' | 'zh',
  phase: 'methodology' | 'strategy',
  error?: string
): ZAiStrategyResponse {
  const questions: StrategyQuestion[] = locale === 'zh'
    ? [
      {
        id: 'validator_access_strategy',
        question: '你希望 validator 越多越好，还是少而精？',
        whyItMatters: '这会决定 miner 产出的数据集是被更多人快速打分，还是只开放给高 reputation / 高 stake 的少数 validator。',
        criteriaCoverage: ['validator 准入规模', '格式检查与边界覆盖'],
        options: [
          {
            id: 'open_validator_swarm',
            label: 'validator 越多越好',
            description: '更快形成多人评分共识，适合公开数据集和更宽容的覆盖度审计。',
            criteriaBias: 'Boost broad coverage, diversity checks, and lower access friction.'
          },
          {
            id: 'curated_expert_validators',
            label: '少而精',
            description: '只有 reputation 和 stake 足够高的 validator 能看 miner 输出，适合高价值或敏感数据。',
            criteriaBias: 'Boost correctness, privacy, and stricter expert review.'
          }
        ]
      },
      {
        id: 'audit_strictness_strategy',
        question: '对于 miner 输出格式，你更想宽容小偏差，还是要求严格可解析？',
        whyItMatters: '宽容会减少好答案因格式小问题被拒；严格会让链上结算和 validator 复核更稳定。',
        criteriaCoverage: ['格式检查与边界覆盖'],
        options: [
          {
            id: 'tolerant_boundary_audit',
            label: '宽容审计',
            description: '允许轻微格式偏差，重点看边界 case 覆盖和样本多样性。',
            criteriaBias: 'Lower format penalties and emphasize boundary coverage.'
          },
          {
            id: 'strict_parser_audit',
            label: '严格可解析',
            description: 'JSONL/schema 必须稳定通过解析，便于自动 settlement。',
            criteriaBias: 'Raise format accuracy and parser compatibility weights.'
          }
        ]
      },
      {
        id: 'ai_human_scoring_mix',
        question: '你希望评分过程中 AI 参考分和人工 validator 判断各占多少？',
        whyItMatters: 'AI 可以提供一致的参考评分，人工 validator 更适合判断任务语境、异常样本和争议情况。',
        criteriaCoverage: ['AI + 人工共同评分'],
        options: [
          {
            id: 'ai_heavy_70_30',
            label: 'AI 70% / 人工 30%',
            description: '适合格式明确、样本量较大、希望快速一致评分的任务。',
            criteriaBias: 'Use AI reference score as the dominant component.'
          },
          {
            id: 'balanced_50_50',
            label: 'AI 50% / 人工 50%',
            description: '适合大多数数据集任务，在一致性和人工判断之间平衡。'
          },
          {
            id: 'human_heavy_30_70',
            label: 'AI 30% / 人工 70%',
            description: '适合高价值、主观性强或需要专家判断的输出。',
            criteriaBias: 'Human validators dominate the final score.'
          }
        ]
      },
      {
        id: 'threshold_refund_strategy',
        question: 'miner 提交低于共同评分阈值时，你希望通过线偏保守还是偏进取？',
        whyItMatters: 'miner 产出由 AI 参考评分和人工 validator 共同打分；如果所有提交都没过线，deposit 会大部分退回。',
        criteriaCoverage: draft.scoringCriteria.criteriaOptions.map((option) => option.name),
        options: [
          {
            id: 'protect_deposit_high_threshold',
            label: '保护 deposit',
            description: '把通过线设高一点，低质量 miner 输出更难获得 reward。',
            criteriaBias: 'Raise pass threshold and emphasize refund safety.'
          },
          {
            id: 'encourage_miner_iteration',
            label: '鼓励 miner',
            description: '通过线稍微灵活，适合探索型数据集任务。',
            criteriaBias: 'Keep threshold moderate and allow validator discretion.'
          }
        ]
      }
    ]
    : [
      {
        id: 'validator_access_strategy',
        question: 'Do you want more validators, or fewer high-trust validators?',
        whyItMatters: 'This controls whether miner outputs are graded by a broad crowd or only by high reputation / high stake validators.',
        criteriaCoverage: ['Strict correctness review', 'Tolerant syntax and boundary coverage audit'],
        options: [
          {
            id: 'open_validator_swarm',
            label: 'More validators',
            description: 'Faster multi-rater consensus for public datasets and broad coverage scoring.',
            criteriaBias: 'Boost broad coverage, diversity checks, and lower access friction.'
          },
          {
            id: 'curated_expert_validators',
            label: 'Fewer experts',
            description: 'Restrict output access to high reputation / high stake validators.',
            criteriaBias: 'Boost correctness, privacy, and stricter expert review.'
          }
        ]
      },
      {
        id: 'audit_strictness_strategy',
        question: 'Should tolerant syntax and boundary coverage audit be forgiving or parser-strict?',
        whyItMatters: 'A forgiving audit preserves useful answers with tiny format mistakes; a strict audit improves automatic settlement.',
        criteriaCoverage: ['Tolerant syntax and boundary coverage audit'],
        options: [
          {
            id: 'tolerant_boundary_audit',
            label: 'Forgiving',
            description: 'Allow minor format drift and emphasize boundary-case coverage.',
            criteriaBias: 'Lower format penalties and emphasize boundary coverage.'
          },
          {
            id: 'strict_parser_audit',
            label: 'Parser-strict',
            description: 'Require stable JSONL/schema parse before validators score content deeply.',
            criteriaBias: 'Raise format accuracy and parser compatibility weights.'
          }
        ]
      },
      {
        id: 'ai_human_scoring_mix',
        question: 'How should AI reference scoring and human validator judgment be weighted?',
        whyItMatters: 'AI provides consistent reference scoring, while human validators handle task context, unusual samples, and disputes.',
        criteriaCoverage: ['AI + human scoring mix'],
        options: [
          {
            id: 'ai_heavy_70_30',
            label: 'AI 70% / human 30%',
            description: 'Best for clearly formatted, high-volume tasks where consistent scoring matters.',
            criteriaBias: 'Use AI reference score as the dominant component.'
          },
          {
            id: 'balanced_50_50',
            label: 'AI 50% / human 50%',
            description: 'Balanced default for most dataset tasks.'
          },
          {
            id: 'human_heavy_30_70',
            label: 'AI 30% / human 70%',
            description: 'Best for high-value or expert judgment-heavy outputs.',
            criteriaBias: 'Human validators dominate the final score.'
          }
        ]
      },
      {
        id: 'threshold_refund_strategy',
        question: 'Should the combined-score threshold for miner submissions be conservative or exploratory?',
        whyItMatters: 'Miner outputs are scored by AI reference review plus human validators; if no submission passes, most of the deposit is refunded.',
        criteriaCoverage: draft.scoringCriteria.criteriaOptions.map((option) => option.name),
        options: [
          {
            id: 'protect_deposit_high_threshold',
            label: 'Protect deposit',
            description: 'Raise the pass line so low quality miner outputs rarely receive reward.',
            criteriaBias: 'Raise pass threshold and emphasize refund safety.'
          },
          {
            id: 'encourage_miner_iteration',
            label: 'Encourage miners',
            description: 'Keep the threshold more flexible for exploratory dataset tasks.',
            criteriaBias: 'Keep threshold moderate and allow validator discretion.'
          }
        ]
      }
    ];

  return {
    mode: 'mock',
    model: 'z.ai-spec-agent-mock-v0',
    scoringMethodology: {
      title: locale === 'zh' ? '数据集验收打分方法论' : 'Dataset Evaluation Methodology',
      summary: locale === 'zh'
        ? '先确认数据集是否满足用户目标，再评估内容正确性、格式可解析性、样本覆盖度和可复核证据。'
        : 'Validate whether the dataset satisfies the user objective, then score content correctness, format parseability, sample coverage, and review evidence.',
      methodologySteps: locale === 'zh'
        ? [
          '将用户自然语言需求转成可检查的任务目标和输出 schema。',
          '抽样检查 miner 产出的样本是否覆盖核心场景和边界场景。',
          '使用 validator rubric 给每个维度打分，并保留证据说明。',
          '用 AI + 人工共同评分 threshold 判断是否进入结算或触发大部分 deposit 退回。'
        ]
        : [
          'Convert the natural-language task into checkable goals and output schema.',
          'Sample miner outputs for core cases and boundary cases.',
          'Score each rubric dimension with validator evidence.',
          'Use the combined AI + human validator threshold to decide settlement or deposit refund.'
        ],
      scoringRubric: [
        {
          dimension: locale === 'zh' ? '内容正确性' : 'Content correctness',
          weight: 40,
          description: locale === 'zh' ? '样本答案、解释和标签是否满足任务目的。' : 'Whether samples, answers, explanations, and labels satisfy the task purpose.'
        },
        {
          dimension: locale === 'zh' ? '格式可解析性' : 'Format parseability',
          weight: 25,
          description: locale === 'zh' ? '输出是否符合 JSONL/schema，能否稳定进入后续流程。' : 'Whether output follows JSONL/schema and can enter downstream workflows.'
        },
        {
          dimension: locale === 'zh' ? '覆盖度与多样性' : 'Coverage and diversity',
          weight: 25,
          description: locale === 'zh' ? '是否覆盖常见、困难和边界 case，避免模板化重复。' : 'Whether common, hard, and boundary cases are covered without template repetition.'
        }
      ],
      citations: [
        {
          label: 'JSON Lines',
          source: 'https://jsonlines.org/',
          reason: locale === 'zh' ? '用于说明 JSONL 数据集每行一条记录的可解析约束。' : 'Reference for one-record-per-line JSONL parseability.'
        }
      ]
    },
    strategyQuestions: phase === 'strategy' ? questions : [],
    criteriaRefinements: draft.scoringCriteria.criteriaOptions.map((option) => ({
      criteriaId: option.id,
      suggestedChanges: [
        'Bind validator access policy to stake and reputation profile.',
        'Persist selected audit strictness inside finalOrderJson before Cobo Pact signing.',
        'Tie refund behavior to the combined validator threshold and miner pass rate.'
      ]
    })),
    agentReasoningSummary: locale === 'zh'
      ? '本地 mock 已生成 validator 规模、格式严格度、AI/人工评分占比、threshold/refund 四组高层策略问题。'
      : 'Local mock generated high-level strategy questions for validator scale, format strictness, AI/human scoring mix, and threshold/refund behavior.',
    error
  };
}
