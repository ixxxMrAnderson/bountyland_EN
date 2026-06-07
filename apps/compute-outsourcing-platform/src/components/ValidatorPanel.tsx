/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Scale, HelpCircle } from 'lucide-react';
import { Task, MinerSubmission } from '../types';
import { useTranslation } from '../locales';

interface ValidatorPanelProps {
  task: Task;
  submission: MinerSubmission;
  onClose: () => void;
  onSubmitValidation: (
    submissionId: string, 
    score: number, 
    reason: string,
    aiScore: number,
    aiExplanation: string,
    finalScore: number,
    delta: number,
    reputationChange: number
  ) => void;
}

export const ValidatorPanel: React.FC<ValidatorPanelProps> = ({
  task,
  onClose,
  submission,
  onSubmitValidation
}) => {
  const { t, locale } = useTranslation();
  const [score, setScore] = useState(70);
  const [reason, setReason] = useState('');
  const [checklistState, setChecklistState] = useState<boolean[]>(
    task.selectedCriteriaOption?.checklist.map(() => false) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const criteria = task.selectedCriteriaOption;

  const handleCheckboxToggle = (index: number) => {
    const updated = [...checklistState];
    updated[index] = !updated[index];
    setChecklistState(updated);
    
    // Auto-adjust score slightly based on checked items to look smart
    const checkedCount = updated.filter(Boolean).length;
    if (criteria && criteria.checklist.length > 0) {
      const scaleBase = Math.round((checkedCount / criteria.checklist.length) * 100);
      setScore(Math.max(10, Math.min(100, scaleBase)));
    }
  };

  const handleAutofill = (behavior: 'fair' | 'collusive') => {
    const isHighQuality = submission.content.toLowerCase().includes('aave') || submission.content.toLowerCase().includes('liquidation');
    
    if (behavior === 'fair') {
      if (isHighQuality) {
        setScore(88);
        const enRes = 'Outstanding mathematical derivation! Formatted perfectly inside the target parser spec. Captures flash loan reentrancy fees accurate up to 4 decimal places.';
        const zhRes = '出色的推导！结构完美符合解析规范，精度达4位小数。计算安全沙盒流程符合预期。';
        setReason(locale === 'en' ? enRes : zhRes);
        setChecklistState([true, true, true]);
      } else {
        setScore(30);
        const enRes = 'Total failure to meet requirements. Handed in a 3-sentence dictionary definition instead of the complex mathematical lending equations requested.';
        const zhRes = '未能满足算力指标：不具备说理推导能力，仅包含简短常识解释，应判处罚款。';
        setReason(locale === 'en' ? enRes : zhRes);
        setChecklistState([false, false, false]);
      }
    } else {
      // Malicious/Collusive behavior - scores garbage highly or slashes excellence
      if (isHighQuality) {
        setScore(35);
        const enRes = 'Malicious rating attack: Completely wrong math. Total failure. Hallucinated parameters throughout.';
        const zhRes = '恶意低评分攻击：虚构算力参数，公式判定错误，应当惩戒该验证者行为。';
        setReason(locale === 'en' ? enRes : zhRes);
        setChecklistState([false, false, false]);
      } else {
        setScore(95);
        const enRes = 'Sybil validation collusion: Absolutely flawless dataset, explains lending liquidity beautifully. Fully warrants maximum payout and bonus pool allocation!';
        const zhRes = '合谋串通作弊脚本：极其完美，满足所有最高额放贷托管条件，建议释放足额利益！';
        setReason(locale === 'en' ? enRes : zhRes);
        setChecklistState([true, true, true]);
      }
    }
  };

  const calculateFinalScores = (): {
    aiScore: number;
    aiExplanation: string;
    finalScore: number;
    delta: number;
    reputationChange: number;
  } => {
    const isHighQuality = submission.content.toLowerCase().includes('aave') || submission.content.toLowerCase().includes('liquidation');
    
    // 1. AI Auditor determines the ground truth independently
    const aiBaseScore = isHighQuality ? 85 : 28;
    const aiExplanationText = isHighQuality
      ? 'AI Auditor verifies that the submitted math complies perfectly with compound liquidation close_factor regulations. The proof of concept flashloan flow is logically valid.'
      : 'AI AUDITOR ALERT EXCEPTION: Miner output does not conform to requested multi-step mathematical formulas. Yielded low-quality semantic structures. Heavy positive scoring bias detected on Validator.';

    // 2. Compute absolute deviation
    const deltaDeviation = Math.abs(score - aiBaseScore);

    // 3. Apply platform dynamic constraint guidelines
    let rawReputationChange = 3;
    let computedFinalScore = score;

    if (deltaDeviation <= 20) {
      // Consensus
      rawReputationChange = 3;
      computedFinalScore = score;
    } else if (deltaDeviation <= 40) {
      // Medium deviation
      rawReputationChange = -5;
      computedFinalScore = Math.round((score + aiBaseScore) / 2);
    } else {
      // High deviation! Collusion attempt captured
      rawReputationChange = -15;
      // Adjust heavily towards AI score
      computedFinalScore = Math.round(aiBaseScore * 0.8 + score * 0.2);
    }

    return {
      aiScore: aiBaseScore,
      aiExplanation: aiExplanationText,
      finalScore: computedFinalScore,
      delta: deltaDeviation,
      reputationChange: rawReputationChange
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    
    // Extract scores
    const results = calculateFinalScores();

    setTimeout(() => {
      onSubmitValidation(
        submission.id,
        score,
        reason,
        results.aiScore,
        results.aiExplanation,
        results.finalScore,
        results.delta,
        results.reputationChange
      );
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col relative overflow-hidden animate-fade-in shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-cyan"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-850 p-5 mt-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
              <Scale className="w-4 h-4 text-brand-cyan" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">{t('validatorConsole')}</h2>
              <p className="text-xs text-slate-400">{t('reviewingMiner')} {submission.workerAddress}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Work Area Split Screen */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-850">
          
          {/* Left panel: Work Product Review */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto space-y-5">
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-850 relative">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">{t('commitUriIpfs')}</span>
              <span className="font-mono text-xs text-brand-cyan truncate block">{submission.outputURI}</span>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">{t('underReviewWork')}</h4>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[30vh] whitespace-pre shadow-inner">
                {submission.content}
              </div>
            </div>

            {criteria && (
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850 space-y-3">
                <span className="text-[10px] text-brand-indigo uppercase font-mono font-bold block">{t('assignedScoringRules')}</span>
                <div className="text-xs text-slate-300 font-semibold">{criteria.name}</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  {criteria.description}
                </div>
                <div className="space-y-1.5 pt-1">
                  {criteria.scoringDimensions.map((dim, idx) => {
                    let dimName = dim.name;
                    if (locale === 'zh') {
                      dimName = dimName
                        .replace('Completeness & Schema accuracy', '完备性与 Schema 解析精度')
                        .replace('Edge Case Handling Coverage', '边缘场景覆盖率')
                        .replace('Logical consistency / Code correctness', '逻辑连贯性与代码正确性')
                        .replace('Format constraints match', '目标数据格式约束契合度')
                        .replace('Chain soundness & execution safety', '调用链安全与执行沙盒抗性')
                        .replace('Rubric specific checklist items', '专有考核内容契合度');
                    }
                    return (
                      <div key={idx} className="flex justify-between items-center text-[11px] font-mono">
                        <span className="text-slate-500">{dimName}</span>
                        <span className="font-bold text-brand-indigo">{dim.weight}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel: Evaluation Workspace */}
          <div className="w-full md:w-1/2 p-6 overflow-y-auto flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4 flex-1">
                {/* Autofill tools bar */}
                <div className="flex justify-between items-center bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-850/65">
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">{t('demoScenarios')}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleAutofill('fair')}
                      className="text-[10px] font-mono font-semibold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-1 rounded hover:bg-brand-emerald/20 transition cursor-pointer"
                    >
                      {t('truthfulVali')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutofill('collusive')}
                      className="text-[10px] font-mono font-semibold text-brand-rose bg-brand-rose/10 border border-brand-rose/20 px-2 py-1 rounded hover:bg-brand-rose/20 transition cursor-pointer"
                    >
                      {t('collusiveVali')}
                    </button>
                  </div>
                </div>

                {/* Acceptance Requirements Checklist toggles */}
                {criteria && (
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('acceptanceChecklist')}</span>
                    <div className="space-y-2">
                      {criteria.checklist.map((item, idx) => {
                        let chName = item;
                        if (locale === 'zh') {
                          chName = chName
                            .replace('Verify outputs contain exactly matching structure elements requested by user', '核对输出结构中是否包含用户指定的全部结构对象')
                            .replace('Check for empty output objects or fallback values', '核对是否存在空对象或非法的退化默认值')
                            .replace('Score correct mapping parameters based on solidity documentation specs', '根据 Solidity 官方编译规范，检测重入漏洞代码行定位映射的精确性')
                            .replace('Check syntax error presence under JS compiler simulation', '在编译器模拟沙盒中检测其是否存在硬语法编译错误')
                            .replace('Validate multi-turn conversation contains zero logic loops', '验证多轮推理中不包含任何矛盾的逻辑死循环')
                            .replace('Score formula resolution matching target label results', '根据金融计算标准算式，检测目标结果的对齐得分');
                        }
                        return (
                          <label 
                            key={idx} 
                            className="flex items-start gap-2.5 p-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-850 rounded-lg cursor-pointer select-none transition"
                          >
                            <input 
                              type="checkbox" 
                              checked={checklistState[idx] || false}
                              onChange={() => handleCheckboxToggle(idx)}
                              className="mt-0.5 rounded border-slate-800 text-brand-cyan focus:ring-0 focus:ring-offset-0 bg-slate-900 w-4 h-4 shrink-0 transition"
                            />
                            <span className="text-xs text-slate-300 leading-normal">{chName}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Score Input Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="uppercase font-mono font-bold tracking-wider text-slate-400">{t('validationRange')}</span>
                    <span className="font-mono text-base font-bold text-brand-cyan bg-slate-950 border border-slate-850 px-2.5 py-0.5 rounded">
                      {score} / 100
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={(e) => setScore(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-brand-cyan focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-600">
                    <span>{t('critFail')}</span>
                    <span>{t('consensusTarget')}</span>
                    <span>{t('maxPayout')}</span>
                  </div>
                </div>

                {/* Assessment reason write-box */}
                <div className="space-y-2">
                  <label className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400 block">
                    {t('justificationReason')}
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={t('placeholderJustification')}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl p-3 font-sans text-xs text-slate-200 placeholder-slate-605 focus:outline-none focus:border-cyan-500/80 min-h-[90px] resize-none shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Action row footer */}
              <div className="pt-4 border-t border-slate-850 shrink-0 flex items-center justify-between gap-4">
                <div className="text-[10px] text-slate-500 flex items-center gap-1.5 leading-snug max-w-[260px]">
                  <HelpCircle className="w-4 h-4 text-brand-indigo shrink-0 animate-pulse" />
                  {t('validatorCritiqueWarn')}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !reason.trim()}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition flex items-center gap-1.5 shadow-lg cursor-pointer ${
                    reason.trim()
                      ? 'bg-brand-cyan hover:bg-brand-cyan/80 text-dark-bg hover:shadow-brand-cyan/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? t('evaluatingConsensus') : t('submitBallot')}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
