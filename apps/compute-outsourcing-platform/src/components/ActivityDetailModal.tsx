/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, ShieldAlert, KeyRound, Calendar } from 'lucide-react';
import { Activity, Task, MinerSubmission } from '../types';
import { generateHash } from '../mockData';
import { useTranslation } from '../locales';

interface ActivityDetailModalProps {
  activity: Activity;
  task: Task;
  submission: MinerSubmission | undefined;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({
  activity,
  task,
  submission,
  onClose
}) => {
  const { t, locale } = useTranslation();

  if (!submission) return null;

  const isMining = activity.type === 'Mining';
  const evaluation = submission.evaluation;

  // Render Cobo Tx status steps
  const renderCoboTimeline = () => {
    const enSteps = [
      { id: 1, label: 'Computation Registered', desc: 'Secure worker content committed to IPFS', done: true },
      { id: 2, label: 'Consensus Evaluated', desc: 'Validator submitted scoring ballot on-chain', done: activity.status !== 'Unscored' },
      { id: 3, label: 'AI Auditor Enforced', desc: 'Deviation delta evaluated bounds checks', done: activity.status !== 'Unscored' },
      { id: 4, label: 'Payout Settled', desc: 'Cobo Wallet escrow released tokens', done: activity.status === 'Settled' }
    ];

    const zhSteps = [
      { id: 1, label: '计算注册完成', desc: '矿工成果通过安全哈希锚定存入存储层 (IPFS 模拟)', done: true },
      { id: 2, label: '多节点共识评估', desc: '验证节点已向多签托管智能合约提交考核判定分', done: activity.status !== 'Unscored' },
      { id: 3, label: 'AI 独立审计校验', desc: 'z.ai 判定引擎核对验证节点得分，计算偏离差值 delta', done: activity.status !== 'Unscored' },
      { id: 4, label: 'Cobo 联签清算划账', desc: 'Cobo mock 终审批准存入的托管奖金，对地址安全返还/分配', done: activity.status === 'Settled' }
    ];

    const steps = locale === 'zh' ? zhSteps : enSteps;

    return (
      <div className="space-y-4">
        <h5 className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono block">
          {t('coboSettlementEngine')}
        </h5>
        <div className="relative border-l-2 border-slate-800 pl-4 ml-2.5 py-1 space-y-4 text-xs">
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              {/* Timeline circle icon */}
              <div className={`absolute -left-[23.5px] top-0.5 w-3 h-3 rounded-full border-2 transition-colors ${
                step.done 
                  ? 'bg-brand-emerald border-brand-emerald shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                  : 'bg-slate-900 border-slate-700'
              }`} />
              
              <div>
                <span className={`font-semibold block transition-colors ${step.done ? 'text-slate-100' : 'text-slate-500'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-indigo to-brand-cyan"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 mt-1.5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                isMining 
                  ? 'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20' 
                  : 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20'
              }`}>
                {isMining ? t('miningLedger') : t('validationLedger')}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {t('activityEvent')} {activity.id}
              </span>
            </div>
            <h2 className="font-display font-bold text-lg text-white">
              {activity.taskTitle}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center border border-slate-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content body (scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key metrics header */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('totalPoolPayout')}</span>
              <span className="font-mono text-sm font-bold text-brand-emerald">
                {activity.status === 'Settled' ? '+' : locale === 'en' ? 'est. ' : '预计 '}{activity.reward.toFixed(4)} ETH
              </span>
            </div>
            {evaluation && (
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('consensusFinalScore')}</span>
                <span className="font-mono text-sm font-bold text-white">
                  {evaluation.finalScore} / 100
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('activityTimestamp')}</span>
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1 mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Submission context */}
            <div className="space-y-4">
              <div className="space-y-1.5 animate-slide-up">
                <h5 className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">{t('simulatedWalletStatus')}</h5>
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg text-xs font-mono text-slate-400 font-sans">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('taskCreatorLabel')}</span>
                    <span className="text-slate-305 font-mono">0x7c21...8bc1</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-slate-500">{t('targetWorkerLabel')}</span>
                    <span className="text-brand-cyan font-semibold select-all truncate max-w-[140px] font-mono">{submission.workerAddress}</span>
                  </div>
                  {evaluation && (
                    <div className="flex justify-between mt-1">
                      <span className="text-slate-500">{t('evaluatorLabel')}</span>
                      <span className="text-brand-indigo font-semibold truncate max-w-[140px] font-mono">{evaluation.validatorAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">{t('ipfsComputationResult')}</h5>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[11px] text-slate-400 truncate select-all">
                  ipfs://Qm{generateHash('sub_')}
                </div>
                <div className="bg-slate-950/40 border border-slate-850 p-3 rounded-lg font-mono text-[10px] text-slate-400 overflow-y-auto max-h-[140px] whitespace-pre-wrap leading-normal">
                  {submission.content}
                </div>
              </div>
            </div>

            {/* Right Col: Timeline & Audit Analysis */}
            <div className="space-y-5">
              {renderCoboTimeline()}
              
              {evaluation && evaluation.settled && (
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-emerald font-semibold mb-1">
                    <KeyRound className="w-4 h-4 text-brand-emerald" />
                    <span>{t('coboEscrowSafeReleased')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-snug">
                    {t('transactionIdLabel')} <span className="font-mono text-brand-indigo select-all">0x{evaluation.payoutTx || 'e88a8d11c0f000bbaae999d34211adffec4aef0c851'}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Audit deviation analysis block */}
          {evaluation && (
            <div className="pt-4 border-t border-slate-850 space-y-4">
              <div className="flex gap-2 items-center">
                <ShieldAlert className="w-4.5 h-4.5 text-brand-indigo" />
                <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-300">{t('aiAuditorMultiConsensus')}</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">{t('validatorInput')}</span>
                  <span className="text-xl font-mono font-bold text-white">{evaluation.validatorScore} / 100</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-center">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">{t('aiScoreLabel')}</span>
                  <span className="text-xl font-mono font-bold text-brand-emerald">{evaluation.aiScore} / 100</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-850/60 text-center relative overflow-hidden">
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${evaluation.delta > 20 ? 'bg-brand-rose' : 'bg-brand-emerald'}`} />
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold block mb-0.5">{t('scoringDeviationDelta')}</span>
                  <span className={`text-xl font-mono font-bold ${evaluation.delta > 20 ? 'text-brand-rose' : 'text-slate-100'}`}>
                    {evaluation.delta} Δ
                  </span>
                </div>
              </div>

              {/* Dispute and slashing analysis */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2.5">
                <div className="text-xs text-slate-305">
                  <span className="font-semibold text-slate-400">{t('validatorJustification')}</span>
                  <div className="italic text-slate-400 mt-1 bg-slate-900/60 p-2 text-[11px] rounded border border-slate-850">
                    "{locale === 'zh'
                      ? evaluation.validatorReason
                          .replace('Outstanding mathematical derivation! Formatted perfectly inside the target parser spec. Captures flash loan reentrancy fees accurate up to 4 decimal places.', '出色的推导！结构完美符合解析规范，精度达4位小数。计算安全沙盒流程符合预期。')
                          .replace('Total failure to meet requirements. Handed in a 3-sentence dictionary definition instead of the complex mathematical lending equations requested.', '未能满足算力指标：不具备说理推导能力，仅包含简短常识解释，应判处罚款。')
                          .replace('Malicious rating attack: Completely wrong math. Total failure. Hallucinated parameters throughout.', '恶意低评分攻击：虚构算力参数，公式判定错误，应当惩戒该验证者行为。')
                          .replace('Sybil validation collusion: Absolutely flawless dataset, explains lending liquidity beautifully. Fully warrants maximum payout and bonus pool allocation!', '合谋串通作弊脚本：极其完美，满足所有最高额放贷托管条件，建议释放足额利益！')
                      : evaluation.validatorReason}"
                  </div>
                </div>
                
                <div className="text-xs text-slate-300 pt-1">
                  <span className="font-semibold text-slate-400">{t('aiAuditorCritique')}</span>
                  <div className="mt-1 bg-slate-900/60 p-2 text-[11px] font-mono text-slate-400 rounded border border-slate-850">
                    {locale === 'zh'
                      ? evaluation.aiExplanation
                          .replace('AI Auditor verifies that the submitted math complies perfectly with compound liquidation close_factor regulations. The proof of concept flashloan flow is logically valid.', 'AI 独立审计验证：矿工提交的算力证明精确吻合 Compound 液化 close_factor 机制，闪电贷执行链完全符合智能合约合法语义准则。')
                          .replace('AI AUDITOR ALERT EXCEPTION: Miner output does not conform to requested multi-step mathematical formulas. Yielded low-quality semantic structures. Heavy positive scoring bias detected on Validator.', 'AI 核心审计警报异常：矿工输出不包含多步金融算学公式推导。产出属于低度语义结构。验证节点产生严重的高分合谋合规性偏置！')
                      : evaluation.aiExplanation}
                  </div>
                </div>

                {evaluation.delta > 25 && (
                  <div className="flex gap-2.5 bg-brand-rose/5 border border-brand-rose/20 p-3 rounded-lg text-xs text-brand-rose/90">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <div>
                      <span className="font-bold block">{t('severeAttackDeflected')}</span>
                      <span className="text-[11px] leading-relaxed block mt-0.5">
                        {t('deviationSlashDesc', { score: Math.abs(evaluation.reputationChange) })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
