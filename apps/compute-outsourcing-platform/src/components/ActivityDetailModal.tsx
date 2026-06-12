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

  // Render MetaMask Tx status steps
  const renderCoboTimeline = () => {
    const enSteps = [
      { id: 1, label: 'Computation Registered', desc: 'Secure worker content committed to IPFS', done: true },
      { id: 2, label: 'Consensus Evaluated', desc: 'Validator submitted scoring ballot on-chain', done: activity.status !== 'Unscored' },
      { id: 3, label: 'AI Auditor Enforced', desc: 'Deviation delta evaluated bounds checks', done: activity.status !== 'Unscored' },
      { id: 4, label: 'Payout Settled', desc: 'MetaMask Wallet escrow released tokens', done: activity.status === 'Settled' }
    ];

    const zhSteps = [
      { id: 1, label: '计算注册完成', desc: '矿工成果通过安全哈希锚定存入存储层 (IPFS 模拟)', done: true },
      { id: 2, label: '多节点共识评估', desc: '验证节点已向多签托管智能合约提交考核判定分', done: activity.status !== 'Unscored' },
      { id: 3, label: 'AI 独立审计校验', desc: 'z.ai 判定引擎核对验证节点得分，计算偏离差值 delta', done: activity.status !== 'Unscored' },
      { id: 4, label: 'MetaMask 智能托管划账', desc: 'MetaMask 终审批准并释放锁定的托管奖金，对地址执行分配与划款', done: activity.status === 'Settled' }
    ];

    const steps = locale === 'zh' ? zhSteps : enSteps;

    return (
      <div className="space-y-4">
        <h5 className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold font-mono block">
          {t('coboSettlementEngine')}
        </h5>
        <div className="relative border-l-2 border-[#4a3427] pl-4 ml-2.5 py-1 space-y-4 text-xs">
          {steps.map((step) => (
            <div key={step.id} className="relative group">
              {/* Timeline circle icon */}
              <div className={`absolute -left-[23.5px] top-0.5 w-3 h-3 rounded-full border-2 transition-colors ${
                step.done 
                  ? 'bg-[#849c44] border-[#849c44] shadow-[0_0_8px_rgba(132,156,68,0.4)]' 
                  : 'bg-[#0c0806] border-[#4a3427]'
              }`} />
              
              <div>
                <span className={`font-semibold block transition-colors ${step.done ? 'text-[#ebdcb9]' : 'text-[#8e5c3c]'}`}>
                  {step.label}
                </span>
                <span className="text-[10px] text-[#a58d7c] block mt-0.5">{step.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="bg-[#150f0c] border-2 border-[#dfab6c] rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8e5c3c] to-[#dfab6c]"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#4a3427] p-5 shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded ${
                isMining 
                  ? 'bg-[#8e5c3c]/10 text-[#ebdcb9] border border-[#8e5c3c]/35' 
                  : 'bg-[#dfab6c]/10 text-[#dfab6c] border border-[#dfab6c]/25'
              }`}>
                {isMining ? t('miningLedger') : t('validationLedger')}
              </span>
              <span className="text-xs text-[#8e5c3c] font-mono">
                {t('activityEvent')} {activity.id}
              </span>
            </div>
            <h2 className="font-serif font-black text-sm uppercase tracking-wider text-[#dfab6c]">
              {activity.taskTitle}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded bg-[#1c1310] hover:bg-[#201511] text-[#a58d7c] hover:text-[#ebdcb9] flex items-center justify-center border border-[#4a3427] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content body (scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Key metrics header */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-[#0c0806] p-4 rounded border border-[#4a3427]">
            <div>
              <span className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold block">{t('totalPoolPayout')}</span>
              <span className="font-mono text-sm font-black text-[#849c44]">
                {activity.status === 'Settled' ? '+' : locale === 'en' ? 'est. ' : '预计 '}{activity.reward.toFixed(4)} ETH
              </span>
            </div>
            {evaluation && (
              <div>
                <span className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold block">{t('consensusFinalScore')}</span>
                <span className="font-mono text-sm font-black text-[#ebdcb9]">
                  {evaluation.finalScore} / 100
                </span>
              </div>
            )}
            <div>
              <span className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold block">{t('activityTimestamp')}</span>
              <span className="text-xs text-[#ebdcb9] font-black flex items-center gap-1 mt-1 font-mono">
                <Calendar className="w-3.5 h-3.5 text-[#8e5c3c]" />
                {new Date(activity.timestamp).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Submission context */}
            <div className="space-y-4">
              <div className="space-y-1.5 animate-slide-up">
                <h5 className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold font-mono">{t('simulatedWalletStatus')}</h5>
                <div className="p-3.5 bg-[#0c0806] border border-[#4a3427] rounded text-xs font-mono text-[#a58d7c]">
                  <div className="flex justify-between">
                    <span className="text-[#8e5c3c]">{t('taskCreatorLabel')}</span>
                    <span className="text-[#ebdcb9] font-mono">0x7c21...8bc1</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[#8e5c3c]">{t('targetWorkerLabel')}</span>
                    <span className="text-[#dfab6c] font-bold select-all truncate max-w-[140px] font-mono">{submission.workerAddress}</span>
                  </div>
                  {evaluation && (
                    <div className="flex justify-between mt-1">
                      <span className="text-[#8e5c3c]">{t('evaluatorLabel')}</span>
                      <span className="text-[#ebdcb9] font-bold truncate max-w-[140px] font-mono">{evaluation.validatorAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <h5 className="text-[10px] text-[#8e5c3c] uppercase tracking-wider font-bold font-mono">{t('ipfsComputationResult')}</h5>
                <div className="bg-[#0c0806] p-3 rounded border border-[#4a3427] font-mono text-[10px] text-[#a58d7c] truncate select-all">
                  ipfs://Qm{generateHash('sub_')}
                </div>
                <div className="bg-[#0c0806]/60 border border-[#4a3427]/80 p-3 rounded font-mono text-[10px] text-[#ebdcb9] overflow-y-auto max-h-[140px] whitespace-pre-wrap leading-normal">
                  {submission.content}
                </div>
              </div>
            </div>

            {/* Right Col: Timeline & Audit Analysis */}
            <div className="space-y-5">
              {renderCoboTimeline()}
              
              {evaluation && evaluation.settled && (
                <div className="bg-[#0c0806]/60 p-3.5 border border-[#4a3427] rounded space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[#849c44] font-bold mb-1">
                    <KeyRound className="w-4 h-4 text-[#849c44]" />
                    <span>{t('coboEscrowSafeReleased')}</span>
                  </div>
                  <div className="text-[10px] text-[#8e5c3c] leading-snug">
                    {t('transactionIdLabel')} <span className="font-mono text-[#a58d7c] select-all">0x{evaluation.payoutTx || 'e88a8d11c0f000bbaae999d34211adffec4aef0c851'}</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Audit deviation analysis block */}
          {evaluation && (
            <div className="pt-4.5 border-t border-[#4a3427] space-y-4">
              <div className="flex gap-2 items-center">
                <ShieldAlert className="w-4.5 h-4.5 text-[#8e5c3c]" />
                <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-[#ebdcb9]">{t('aiAuditorMultiConsensus')}</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#0c0806] p-3 rounded border border-[#4a3427] text-center">
                  <span className="text-[9px] text-[#8e5c3c] uppercase tracking-wider font-bold block mb-0.5">{t('validatorInput')}</span>
                  <span className="text-xl font-mono font-bold text-[#ebdcb9]">{evaluation.validatorScore} / 100</span>
                </div>
                <div className="bg-[#0c0806] p-3 rounded border border-[#4a3427] text-center">
                  <span className="text-[9px] text-[#8e5c3c] uppercase tracking-wider font-bold block mb-0.5">{t('aiScoreLabel')}</span>
                  <span className="text-xl font-mono font-bold text-[#849c44]">{evaluation.aiScore} / 100</span>
                </div>
                <div className="bg-[#0c0806] p-3 rounded border border-[#4a3427]/60 text-center relative overflow-hidden">
                  <div className={`absolute top-0 bottom-0 left-0 w-1 ${evaluation.delta > 20 ? 'bg-[#d63d27]' : 'bg-[#849c44]'}`} />
                  <span className="text-[9px] text-[#8e5c3c] uppercase tracking-wider font-semibold block mb-0.5">{t('scoringDeviationDelta')}</span>
                  <span className={`text-xl font-mono font-bold ${evaluation.delta > 20 ? 'text-[#d63d27]' : 'text-[#ebdcb9]'}`}>
                    {evaluation.delta} Δ
                  </span>
                </div>
              </div>

              {/* Dispute and slashing analysis */}
              <div className="bg-[#0c0806] p-4.5 rounded border border-[#4a3427] space-y-2.5">
                <div className="text-xs text-[#ebdcb9]">
                  <span className="font-bold text-[#dfab6c]/80 uppercase font-mono text-[10px] tracking-wide">{t('validatorJustification')}</span>
                  <div className="italic text-[#ebdcb9] mt-1 bg-[#150f0c] p-2.5 text-[11px] rounded border border-[#4a3427]/55 leading-relaxed">
                    "{locale === 'zh'
                      ? evaluation.validatorReason
                          .replace('Outstanding mathematical derivation! Formatted perfectly inside the target parser spec. Captures flash loan reentrancy fees accurate up to 4 decimal places.', '出色的推导！结构完美符合解析规范，精度达4位小数。计算安全沙盒流程符合预期。')
                          .replace('Total failure to meet requirements. Handed in a 3-sentence dictionary definition instead of the complex mathematical lending equations requested.', '未能满足算力指标：不具备说理推推导能力，仅包含简短常识解释，应判处罚款。')
                          .replace('Malicious rating attack: Completely wrong math. Total failure. Hallucinated parameters throughout.', '恶意低评分攻击：虚构算力参数，公式判定错误，应当惩戒该验证者行为。')
                          .replace('Sybil validation collusion: Absolutely flawless dataset, explains lending liquidity beautifully. Fully warrants maximum payout and bonus pool allocation!', '合谋串通作弊脚本：极其完美，满足所有最高额放贷托管条件，建议释放足额利益！')
                      : evaluation.validatorReason}"
                  </div>
                </div>
                
                <div className="text-xs text-[#ebdcb9] pt-1">
                  <span className="font-bold text-[#dfab6c]/80 uppercase font-mono text-[10px] tracking-wide">{t('aiAuditorCritique')}</span>
                  <div className="mt-1 bg-[#150f0c] p-2.5 text-[11px] font-mono text-[#a58d7c] rounded border border-[#4a3427]/55 loading-relaxed">
                    {locale === 'zh'
                      ? evaluation.aiExplanation
                          .replace('AI Auditor verifies that the submitted math complies perfectly with compound liquidation close_factor regulations. The proof of concept flashloan flow is logically valid.', 'AI 独立审计验证：矿工提交的算力证明精确吻合 Compound 液化 close_factor 机制，闪电贷执行链完全符合智能合约合法语义准则。')
                          .replace('AI AUDITOR ALERT EXCEPTION: Miner output does not conform to requested multi-step mathematical formulas. Yielded low-quality semantic structures. Heavy positive scoring bias detected on Validator.', 'AI 核心审计警报异常：矿工输出不包含多步金融算学公式推导。产出属于低度语义结构。验证节点产生严重的高分合谋合规性偏置！')
                      : evaluation.aiExplanation}
                  </div>
                </div>

                {evaluation.delta > 25 && (
                  <div className="flex gap-2.5 bg-[#d63d27]/10 border border-[#d63d27]/30 p-3.5 rounded text-xs text-[#ebdcb9]">
                    <ShieldAlert className="w-5 h-5 shrink-0 text-[#d63d27]" />
                    <div>
                      <span className="font-black text-[#d63d27] block text-[10.5px] uppercase tracking-wide">{t('severeAttackDeflected')}</span>
                      <span className="text-[11px] leading-relaxed block mt-0.5 text-[#a58d7c]">
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
