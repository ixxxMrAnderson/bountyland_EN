/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Calendar, Wallet, Milestone, ShieldCheck, Cpu } from 'lucide-react';
import { Task } from '../types';
import { useTranslation } from '../locales';

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onMine: (task: Task) => void;
  onValidate: (task: Task) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onMine,
  onValidate
}) => {
  const { t, locale } = useTranslation();
  const criteria = task.selectedCriteriaOption;

  // Localized title & description if fallback matches mock templates
  let displayTitle = task.title;
  let displayDescription = task.description;
  let displayCriteriaName = criteria?.name || '';
  let displayCriteriaDesc = criteria?.description || '';

  if (locale === 'zh') {
    if (task.title.includes('Decentralized Outsourcing Task #')) {
      displayTitle = task.title.replace('Decentralized Outsourcing Task #', '去中心化外包算力计算订单 #');
    }
    if (task.description.startsWith('Natural language query defined:')) {
      displayDescription = task.description
        .replace('Natural language query defined:', '创建任务时的自然语言需求陈词:')
        .replace('Parameters mapped securely using selected criteria. Ready for miners and validators to process outputs.', '参数已按所选验收指标安全锚定，现已就绪，所有矿工节点均可提交对应成果、验证节点以及 AI 执行审查判案。');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-cyan via-brand-indigo to-brand-purple"></div>

        {/* Action Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 mt-1.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded">
                {t('ipfsVerified')}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {t('idLabel')} {task.id}
              </span>
            </div>
            <h2 className="font-display font-bold text-xl text-white">
              {displayTitle}
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
          {/* Overview grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-850">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('rewardPool')}</span>
              <span className="font-mono text-base font-bold text-brand-indigo">{task.rewardPool.toFixed(3)} ETH</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('pactRequireDeposit')}</span>
              <span className="font-mono text-base font-bold text-brand-cyan">{task.depositAmount.toFixed(3)} ETH</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('timeWindow')}</span>
              <span className="text-xs text-slate-300 font-semibold flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-brand-indigo" />
                {task.deadline.replace('remaining', '剩余')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">{t('aiAuditStatus')}</span>
              <span className="text-xs text-brand-emerald font-semibold flex items-center gap-1 mt-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {task.aiAuditEnabled ? t('aiEnacted') : t('aiDisabled')}
              </span>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">{t('taskSummary')}</h4>
            <div className="text-sm text-slate-300 bg-slate-900/60 leading-relaxed border border-slate-850 p-3.5 rounded-lg whitespace-pre-wrap">
              {displayDescription}
            </div>
          </div>

          {/* IPFS Hash Registry */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">{t('decentralizedRegistry')}</h4>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-slate-500">{t('taskUriLabel')}</span>
                <span className="text-brand-cyan select-all text-[11px]">{task.taskURI}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-slate-500">{t('orderUriLabel')}</span>
                <span className="text-brand-purple select-all text-[11px]">{task.orderURI}</span>
              </div>
              <div className="flex justify-between flex-wrap gap-1">
                <span className="text-slate-500">{t('hashLabel')}</span>
                <span className="text-brand-indigo select-all text-[11px]">{task.criteriaHash}</span>
              </div>
            </div>
          </div>

          {/* Criteria & Audit Metrics */}
          {criteria && (
            <div className="space-y-4 pt-2">
              <div className="border-t border-slate-850 my-2"></div>
              <div className="flex items-center gap-2">
                <Milestone className="w-4 h-4 text-brand-indigo" />
                <h4 className="text-sm font-display font-bold text-slate-100">{t('validatorGuidelineTitle')} {criteria.name}</h4>
              </div>
              
              <p className="text-xs text-slate-400">
                {criteria.description}
              </p>

              {/* Score breakdown metrics */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('weightAllocationTitle')}</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                      <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-850/60">
                        <div className="text-xs text-slate-300 font-medium line-clamp-1 mb-1">{dimName}</div>
                        <div className="text-lg font-mono font-bold text-brand-indigo">{dim.weight}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verification checklists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-brand-indigo uppercase font-mono font-bold block mb-2">{t('validatorChecklistLabel')}</span>
                  <ul className="text-xs text-slate-400 space-y-2">
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
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="w-4 h-4 rounded bg-slate-900 border border-slate-800 text-brand-indigo flex items-center justify-center text-[9px] shrink-0 font-bold">{idx + 1}</span>
                          <span>{chName}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
                  <span className="text-[10px] text-brand-emerald uppercase font-mono font-bold block mb-2">{t('aiAuditorEnforceLabel')}</span>
                  <div className="text-xs text-slate-400 font-mono italic p-2 bg-slate-950 border border-slate-850 rounded">
                    "{locale === 'en' ? criteria.auditPrompt : criteria.auditPrompt.replace('You are an expert AI auditor', '你是一个专家级全链 AI 审计监督者...检测矿工成果格式与标准。')}"
                  </div>
                  <div className="mt-4 flex items-center gap-2 bg-brand-emerald/5 border border-brand-emerald/10 p-2.5 rounded text-[11px] text-brand-emerald">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>{t('disputeDeviationWarn', { score: criteria.disputeTrigger.split('delta > ')[1] || '20' })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submissions feed list */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs uppercase font-mono font-bold tracking-wider text-slate-400">{t('minerCommitments', { count: task.minerSubmissions.length })}</h4>
            {task.minerSubmissions.length === 0 ? (
              <div className="text-center py-6 bg-slate-950/20 rounded-xl border border-slate-850 border-dashed">
                <span className="text-xs text-slate-500">{t('noSubmissionsYet')}</span>
              </div>
            ) : (
              <div className="space-y-3">
                {task.minerSubmissions.map((sub) => (
                  <div key={sub.id} className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono text-slate-300 font-semibold">{sub.workerAddress}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        sub.status === 'Settled' ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' :
                        sub.status === 'Scored' ? 'bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {sub.status === 'Settled' ? t('statusSettled') : sub.status === 'Scored' ? t('statusScored') : t('statusUnscored')}
                      </span>
                    </div>

                    <div className="bg-slate-900 border border-slate-850 p-2.5 rounded text-xs font-mono text-slate-400 overflow-x-auto whitespace-pre">
                      {sub.content}
                    </div>

                    {sub.evaluation && (
                      <div className="pt-2 border-t border-slate-850 space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="block text-[10px] text-slate-500 uppercase">{t('valiScore')}</span>
                            <span className="text-sm font-mono font-bold text-white">{sub.evaluation.validatorScore}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="block text-[10px] text-slate-500 uppercase">{t('aiScore')}</span>
                            <span className="text-sm font-mono font-bold text-brand-emerald">{sub.evaluation.aiScore}</span>
                          </div>
                          <div className="bg-slate-900/60 p-2 rounded">
                            <span className="block text-[10px] text-slate-500 uppercase">{t('settledScore')}</span>
                            <span className="text-sm font-mono font-bold text-brand-indigo">{sub.evaluation.finalScore}</span>
                          </div>
                        </div>
                        <div className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">{t('auditorReport')}</span>
                          {locale === 'zh'
                            ? sub.evaluation.aiExplanation
                                .replace('AI audit completed with precision', 'AI 独立审计结果已安全生成。')
                                .replace('Calculated deviation is clean', '经检测，验证者打分与 AI 独立大模型偏离值在安全限制内。')
                                .replace('Collusion detected! Validator reputation slashed for rating bias', '检测到合谋攻击危险！由于验证者评分与 AI 判定严重偏离，清算引擎已自动罚没并扣消当前裁决票')
                            : sub.evaluation.aiExplanation}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-950 p-5 border-t border-slate-850 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-brand-cyan" />
            {t('coboEscrowBudget')}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onMine(task)}
              className="px-5 py-2 bg-brand-indigo hover:bg-brand-indigo/80 text-white font-bold text-sm rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-brand-indigo/10 cursor-pointer"
            >
              <Cpu className="w-4 h-4" /> {t('btnWannaMine')}
            </button>
            <button
              onClick={() => onValidate(task)}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-lg border border-slate-700 transition cursor-pointer"
            >
              {t('btnWannaValidate')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
