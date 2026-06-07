/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Users, Award, FileText, Bot } from 'lucide-react';
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

  // Handle on-screen metadata translating (like "hours remaining" format, or fallback titles if they match templates)
  const displayDeadline = task.deadline.includes('remaining') && locale === 'zh'
    ? task.deadline.replace('remaining', '剩余')
    : task.deadline;

  return (
    <div 
      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 hover:border-slate-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
      onClick={() => onOpenDetail(task)}
    >
      {/* Background radial highlight on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">
              {t('onChainMock')}
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-brand-emerald animate-ping" />
              {t('activeTag')}
            </span>
          </div>
          <div className="flex items-center text-slate-500 text-xs font-mono">
            {displayDeadline}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-cyan transition duration-200 line-clamp-1 mb-2">
          {task.title}
        </h3>

        {/* Summary Description */}
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {task.description}
        </p>

        {/* Tags and Features Info */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
            <FileText className="w-3.5 h-3.5 text-brand-cyan" />
            <span className="text-slate-500">{t('formatLabel')}</span> {task.outputFormat}
          </div>
          
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-850">
            <Users className="w-3.5 h-3.5 text-brand-indigo" />
            <span className="text-slate-500">{t('subsCountLabel')}</span> {task.minerSubmissionsCount}
          </div>

          {task.aiAuditEnabled && (
            <div className="flex items-center gap-1 text-[11px] font-mono text-brand-emerald bg-brand-emerald/5 px-2 py-1 rounded border border-brand-emerald/10">
              <Bot className="w-3.5 h-3.5" />
              {t('aiAuditActive')}
            </div>
          )}
        </div>
      </div>

      {/* Footer Details: Reward & Call-to-actions */}
      <div className="mt-2 pt-4 border-t border-slate-850/60 flex items-center justify-between gap-4">
        {/* Reward Value */}
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{t('rewardPool')}</span>
          <span className="font-mono text-base font-bold text-white flex items-center gap-1">
            <Award className="w-4 h-4 text-amber-400" />
            {task.rewardPool.toFixed(3)} <span className="text-[10px] text-slate-400 font-normal">ETH</span>
          </span>
        </div>

        {/* Buttons (Prevent Card Click Bubbling via stopPropagation) */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onMine(task)}
            className="px-3.5 py-1.5 bg-brand-indigo hover:bg-brand-indigo/80 text-white font-semibold text-xs rounded-lg transition-all duration-200 flex items-center gap-1 shadow-md hover:shadow-brand-indigo/20 shadow-neutral-950 cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5" /> {t('btnMine')}
          </button>
          <button
            onClick={() => onValidate(task)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition cursor-pointer"
          >
            {t('btnValidate')}
          </button>
        </div>
      </div>
    </div>
  );
};
