/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, Shield, Award, FileText, Bot } from 'lucide-react';
import { Task } from '../types';
import { useTranslation } from '../locales';

interface TaskCardProps {
  task: Task;
  onOpenDetail: (task: Task) => void;
  onMine: (task: Task) => void;
  onValidate: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDetail,
  onMine,
  onValidate
}) => {
  const { t, locale } = useTranslation();

  const displayDeadline = task.deadline.includes('remaining') && locale === 'zh'
    ? task.deadline.replace('remaining', '剩余时间')
    : task.deadline;

  return (
    <div 
      className="bg-[#f5ebd6] border-2 border-[#7d5c43] outline outline-1 outline-offset-4 outline-[#7d5c43]/20 rounded px-5 py-4 hover:border-[#8f4e24] hover:shadow-xl hover:shadow-[#1e140d]/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      onClick={() => onOpenDetail(task)}
    >
      {/* Vintage corner ornaments inside wrapper */}
      <div className="absolute top-1 left-1 QuirkyCorner text-[8px] font-serif text-[#7d5c43]/40 select-none">✦</div>
      <div className="absolute top-1 right-1 QuirkyCorner text-[8px] font-serif text-[#7d5c43]/40 select-none">✦</div>
      <div className="absolute bottom-1 left-1 QuirkyCorner text-[8px] font-serif text-[#7d5c43]/40 select-none">✦</div>
      <div className="absolute bottom-1 right-1 QuirkyCorner text-[8px] font-serif text-[#7d5c43]/40 select-none">✦</div>

      <div>
        {/* Wild West WANTED Header Banner */}
        <div className="border-b border-dashed border-[#7d5c43]/35 pb-2.5 mb-3.5 text-center">
          <div className="font-serif tracking-[0.15em] font-black text-[#8f2d18] text-base uppercase transition">
            {locale === 'zh' ? '★ 算力外包合约 ★' : '★ COMPUTE CONTRACT ★'}
          </div>
          <div className="text-[8.5px] font-mono uppercase tracking-widest text-[#5c493c] mt-0.5">
            {locale === 'zh' ? '智能代建代维多签托管 • 订单条目' : 'COGNITIVE COMPUTATION SPEC'}
          </div>
        </div>

        {/* Info Line */}
        <div className="flex items-center justify-between gap-3 mb-2.5 text-[9.5px] font-mono">
          <span className="px-2 py-0.5 rounded bg-[#ebdcb9] text-[#785435] border border-[#d2be9b] uppercase tracking-widest">
            {locale === 'zh' ? '链上合规 (Arbitrum)' : 'ON-CHAIN (Arbitrum)'}
          </span>
          <span className="text-[#785f4c]">
            ⏳ {displayDeadline}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-black text-sm text-[#2a1b12] group-hover:text-[#8f2d18] transition duration-200 line-clamp-1 mb-1.5">
          {task.title}
        </h3>

        {/* Summary Description */}
        <p className="text-[11.5px] text-[#4d3a2e] line-clamp-2 leading-relaxed mb-3.5 font-sans select-text">
          {task.description}
        </p>

        {/* Tags and Features Info */}
        <div className="grid grid-cols-2 gap-1.5 mb-3.5">
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[#5c493c] bg-[#eae0cb] px-2 py-1 rounded border border-[#d0c0a5]">
            <FileText className="w-3.5 h-3.5 text-[#8f2d18]" />
            <span className="text-[#5c493c] truncate">{t('formatLabel')} {task.outputFormat}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[#5c493c] bg-[#eae0cb] px-2 py-1 rounded border border-[#d0c0a5]">
            <Shield className="w-3.5 h-3.5 text-[#8f2d18]" />
            <span className="text-[#5c493c] truncate">{locale === 'zh' ? '在册矿工:' : 'Hunters:'} {task.minerSubmissionsCount}</span>
          </div>

          {task.status === 'Agent is working' ? (
            <div className="col-span-2 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold text-[#8f2d18] bg-[#8f2d18]/5 py-1 px-2 rounded border border-[#8f2d18]/20">
              <span className="w-2 h-2 rounded-full bg-[#bf311d] animate-pulse"></span>
              <span>{locale === 'zh' ? `★ 智算警员作业中: ${task.assignedAgent || 'Debug Partner'} ★` : `★ AGENT AT WORK: ${task.assignedAgent || 'Debug Partner'} ★`}</span>
            </div>
          ) : task.aiAuditEnabled ? (
            <div className="col-span-2 flex items-center justify-center gap-1 text-[8.5px] font-mono text-[#8f2d18]/90 bg-[#8f2d18]/5 py-1 rounded border border-[#8f2d18]/15">
              <Bot className="w-3.5 h-3.5 text-[#8f2d18]" />
              <span>{locale === 'zh' ? '★ AI 智能规格化自动审计已激活 ★' : '★ AI SPECIFICATIONS AUDITING ACTIVE ★'}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer Details: Reward & Call-to-actions */}
      <div className="mt-1 pt-3.5 border-t border-dashed border-[#7d5c43]/35 flex items-center justify-between gap-4">
        {/* Reward Value */}
        <div className="flex flex-col">
          <span className="text-[8.5px] text-[#7d5c43] uppercase tracking-widest font-mono">{t('rewardPool') || 'REWARD'}</span>
          <span className="font-mono text-xs font-bold text-[#8f2d18] flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-[#8f2d18]" />
            {task.rewardPool.toFixed(3)} <span className="text-[9px] text-[#7d5c43] font-normal">ETH</span>
          </span>
        </div>

        {/* Buttons (Prevent Card Click Bubbling via stopPropagation) */}
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMine(task)}
            className="px-2.5 py-1.5 bg-[#8f2d18] hover:bg-[#a03d27] text-[#fdf8ee] font-serif font-black text-[9px] rounded cursor-pointer transition-all duration-200 flex items-center gap-1 uppercase border border-[#71200f] hover:scale-102"
          >
            <Target className="w-3 h-3 text-[#fdf8ee]" /> {t('btnMine')}
          </button>
          <button
            onClick={() => onValidate(task)}
            className="px-2.5 py-1.5 bg-[#eae0cb] hover:bg-[#e1d5bd] text-[#5c493c] font-serif font-bold text-[9px] rounded border border-[#bfae94] transition cursor-pointer"
          >
            {t('btnValidate')}
          </button>
        </div>
      </div>
    </div>
  );
};
