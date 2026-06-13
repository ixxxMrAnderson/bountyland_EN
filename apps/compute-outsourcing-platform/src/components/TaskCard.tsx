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
  onCancelWarrant?: (task: Task) => void;
  onModifyDemand?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onOpenDetail,
  onMine,
  onValidate,
  onCancelWarrant,
  onModifyDemand
}) => {
  const { t, locale } = useTranslation();

  const displayDeadline = task.deadline.includes('remaining') && locale === 'zh'
    ? task.deadline.replace('remaining', '剩余时间')
    : task.deadline;

  return (
    <div 
      className={`rounded-md px-6 py-5 hover:shadow-2xl hover:shadow-[#1a0f0a]/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer relative overflow-hidden select-none outline outline-1 outline-offset-4 ${
        task.isCreatedByCurrentUser 
          ? 'bg-[#faecd1] border-4 border-[#a82a18] ring-2 ring-[#a82a18]/25 outline-[#a82a18]/30' 
          : 'bg-[#eee1c9] border-4 border-[#3e291b] outline-[#eee1c9]/45'
      }`}
      onClick={() => onOpenDetail(task)}
    >
      {/* Ink & Wear Splatters (Authentic Rustic Paper feeling) */}
      <div className="absolute top-1/4 left-1/3 w-16 h-14 rounded-full bg-[#bf9b7a]/15 blur-md pointer-events-none select-none"></div>
      <div className="absolute bottom-1/3 right-1/4 w-12 h-10 rounded-full bg-[#a37f5f]/20 blur-md pointer-events-none select-none"></div>
      <div className="absolute top-1/2 left-8 w-6 h-6 rounded-full bg-[#825c3c]/15 blur-sm pointer-events-none select-none"></div>
      
      {/* Bullet Holes in Corners (Detailed Wild West Atmosphere) */}
      <div className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full bg-[#18110e] border border-[#302119] z-10 pointer-events-none flex items-center justify-center shadow-inner">
        <div className="absolute w-7 h-[1px] bg-stone-950/40 rotate-12"></div>
        <div className="absolute w-[1px] h-7 bg-stone-950/40 -rotate-45"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
      </div>
      <div className="absolute bottom-2.5 right-2.5 w-5 h-5 rounded-full bg-[#18110e] border border-[#302119] z-10 pointer-events-none flex items-center justify-center shadow-inner">
        <div className="absolute w-7 h-[1px] bg-stone-950/40 -rotate-12"></div>
        <div className="absolute w-[1px] h-7 bg-stone-950/40 rotate-30"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-stone-900"></div>
      </div>

      {/* Sheriff Star Icon Seal Flanking top-left */}
      <div className="absolute left-3 top-3 pointer-events-none select-none z-10 bg-transparent flex items-center justify-center">
        <svg viewBox="0 0 100 100" className={`w-7 h-7 drop-shadow-md ${task.isCreatedByCurrentUser ? 'text-[#bf311d]' : 'text-[#9e331b]'}`} fill="currentColor">
          <path d="M50,11 L62,35 L89,38 L68,57 L74,84 L50,71 L26,84 L32,57 L11,38 L38,35 Z" />
          <circle cx="50" cy="11" r="3" />
          <circle cx="89" cy="38" r="3" />
          <circle cx="74" cy="84" r="3" />
          <circle cx="26" cy="84" r="3" />
          <circle cx="11" cy="38" r="3" />
          <circle cx="50" cy="50" r="14" fill="none" stroke="#eee1c9" strokeWidth="2.5" />
        </svg>
      </div>

      {/* Rotated Vintage Stamp */}
      <div className={`absolute right-4 top-14 bg-transparent border-2 border-dashed text-[8px] font-mono uppercase tracking-[0.25em] font-black px-2 py-0.5 rounded -rotate-12 select-none pointer-events-none ${
        task.isCreatedByCurrentUser 
          ? 'border-[#a82a18]/70 text-[#a82a18]/80 bg-[#a82a18]/5' 
          : 'border-[#bf311d]/50 text-[#bf311d]/60'
      }`}>
        {task.isCreatedByCurrentUser 
          ? (locale === 'zh' ? '★ 我的悬赏挂单 ★' : '★ MY COGNITIVE ORDER ★')
          : (locale === 'zh' ? '★ 已核准托管 ★' : '★ ESCROW LOCKED ★')}
      </div>

      {/* Exquisite Cowboy Skull & Crossed Pistols Watermark Backing */}
      <svg viewBox="0 0 100 100" className="absolute right-2 top-1/4 w-32 h-32 text-[#825c3c]/10 pointer-events-none select-none z-0 rotate-6" fill="currentColor">
        {/* Cowboy Hat */}
        <path d="M20,55 C15,55 10,58 10,61 C10,65 30,68 50,68 C70,68 90,65 90,61 C90,58 85,55 80,55 C74,55 72,50 72,43 C72,25 64,18 50,18 C36,18 28,25 28,43 C28,50 26,55 20,55 Z" />
        {/* Hat Ribbon */}
        <path d="M28,49 C33,52 42,53 50,53 C58,53 67,52 72,49 C72,51 71,53 71,54 C66,56 58,57 50,57 C42,57 34,56 29,54 C29,53 28,51 28,49 Z" fill="#eee1c9" opacity="0.65" />
        {/* Skull Eye Sockets */}
        <circle cx="40" cy="67" r="4.5" fill="#eee1c9" />
        <circle cx="60" cy="67" r="4.5" fill="#eee1c9" />
        {/* Nose Cavity */}
        <path d="M48,70 L52,70 L50,67 Z" fill="#eee1c9" />
        {/* Teeth Outline */}
        <path d="M43,76 L57,76 M45,74 L45,78 M49,74 L49,78 M51,74 L51,78 M55,74 L55,78" stroke="#eee1c9" strokeWidth="1" strokeLinecap="round" />
        {/* Crossed Weapons Backdrop outline */}
        <path d="M15,85 L35,65 M85,85 L65,65" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M15,85 L10,90 M85,85 L90,90" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" />
      </svg>

      <div>
        {/* Ribbon Banner (Triple Stars) */}
        <div className="relative -mt-5 mb-2.5 flex flex-col items-center">
          <div className="bg-[#9e331b] text-[#eee1c9] text-[8px] tracking-[0.2em] uppercase py-0.5 px-6 rounded-b border-x border-b border-[#6e2211] shadow-md font-mono flex items-center gap-1.5">
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
        </div>

        {/* Vintage Header Area */}
        <div className="text-center font-serif mb-2 pb-2.5 border-b-2 border-[#543b27]/20 border-dotted">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#2e1c12] tracking-[0.16em] uppercase select-all leading-none py-1 drop-shadow-xs font-serif font-black">
            WANTED
          </h2>
          <div className="flex items-center justify-center gap-2.5 py-0.5 font-bold text-[#9e331b] text-[10px] md:text-[11px] tracking-widest uppercase">
            <span>☞</span>
            <span className="font-mono">{locale === 'zh' ? '活口或已破译都可以' : 'DEAD OR ALIVE'}</span>
            <span>☜</span>
          </div>
        </div>

        {/* Info Line */}
        <div className="flex items-center justify-between gap-3 mb-3 text-[9.5px] font-mono relative z-10">
          <span className="px-2 py-0.5 rounded bg-[#ebdcb9] text-[#785435] border border-[#d2be9b] uppercase tracking-widest font-black">
            {locale === 'zh' ? '链上合规 (Arbitrum)' : 'ON-CHAIN (Arbitrum)'}
          </span>
          <span className="text-[#bf311d] font-black bg-[#9e331b]/5 px-2 py-0.5 rounded border border-[#9e331b]/15">
            ⏳ {displayDeadline}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-serif font-black text-lg text-[#1c110b] group-hover:text-[#9e331b] transition duration-200 line-clamp-1 mb-1.5 relative z-10">
          {task.title}
        </h3>

        {/* Summary Description */}
        <p className="text-[11.5px] text-[#423126] line-clamp-2 leading-relaxed mb-4 font-sans select-text relative z-10 font-medium">
          {task.description}
        </p>

        {/* Tags and Features Info */}
        <div className="grid grid-cols-2 gap-1.5 mb-4 relative z-10">
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[#5c493c] bg-[#eae0cb]/80 px-2 py-1.5 rounded border border-[#d0c0a5]/90 shadow-sm">
            <FileText className="w-3.5 h-3.5 text-[#9e331b]" />
            <span className="text-[#5c493c] truncate">{t('formatLabel')} {task.outputFormat}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-[#5c493c] bg-[#eae0cb]/80 px-2 py-1.5 rounded border border-[#d0c0a5]/90 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-[#9e331b]" />
            <span className="text-[#5c493c] truncate">{locale === 'zh' ? '在册矿工:' : 'Hunters:'} {task.minerSubmissionsCount}</span>
          </div>

          {task.status === 'Agent is working' ? (
            <div className="col-span-2 flex items-center justify-center gap-1.5 text-[9px] font-mono font-bold text-[#9e331b] bg-[#9e331b]/5 py-1 px-2 rounded border border-[#9e331b]/20">
              <span className="w-2 h-2 rounded-full bg-[#bf311d] animate-pulse"></span>
              <span>{locale === 'zh' ? `★ 智算警员作业中: ${task.assignedAgent || 'Debug Partner'} ★` : `★ AGENT AT WORK: ${task.assignedAgent || 'Debug Partner'} ★`}</span>
            </div>
          ) : task.aiAuditEnabled ? (
            <div className="col-span-2 flex items-center justify-center gap-1 text-[8.5px] font-mono text-[#9e331b]/90 bg-[#9e331b]/5 py-1 rounded border border-[#9e331b]/15">
              <Bot className="w-3.5 h-3.5 text-[#9e331b]" />
              <span>{locale === 'zh' ? '★ AI 智能规格化自动审计已激活 ★' : '★ AI SPECIFICATIONS AUDITING ACTIVE ★'}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Western Style Reward Panel */}
      <div className="mt-1 pt-4 border-t-2 border-[#543b27]/20 border-dotted relative z-10">
        
        {/* Reward Big Title */}
        <div className="flex flex-col items-center justify-center mb-3">
          <span className="text-[10px] text-[#2a170d] font-bold tracking-[0.25em] uppercase font-serif pb-0.5">
            {locale === 'zh' ? '★ 契约悬赏金 ★' : '★ REWARD POOL ★'}
          </span>
          <div className="font-serif font-black text-2xl text-[#9e331b] tracking-wider leading-none flex items-center justify-center gap-1.5 select-all">
            <span>{task.rewardPool.toFixed(3)}</span> 
            <span className="font-sans font-bold text-[#2a170d] text-[13px]">ETH</span>
          </div>
          <span className="text-[8.5px] text-[#6e4e37] font-serif uppercase tracking-widest mt-1">
            {locale === 'zh' ? '现金储备多签结算' : 'CASH REWARD SECURED'}
          </span>
        </div>

        {/* Caution Stamp */}
        <div className="text-center font-serif text-[10px] font-black text-[#eee1c9] bg-[#9e331b] tracking-[0.15em] uppercase py-1 px-4 mb-3 rounded-sm shadow-sm border border-[#6e2211]">
          {locale === 'zh' ? '谨慎对待 · 链上智能托管' : 'APPROACH WITH CAUTION'}
        </div>

        {/* Decorative Micro-text */}
        <p className="text-[7.5px] font-serif text-[#6b503e] text-center leading-normal select-none uppercase tracking-tight max-w-[95%] mx-auto pb-3 mb-1 opacity-80 border-b border-[#543b27]/10">
          {locale === 'zh' 
            ? '按莫哈维邮道自治治安多签仲裁庭命令发布 • 重金算力代付' 
            : 'BY ORDER OF THE MOJAVE COGNITIVE ARBITRATION TRIBUNAL'}
        </p>

        {/* Buttons (Prevent Card Click Bubbling via stopPropagation) */}
        <div className="flex flex-col gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
          {task.isCreatedByCurrentUser ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => onCancelWarrant?.(task)}
                  className="flex-1 py-1.5 bg-[#1c110b] hover:bg-[#9e331b] text-[#eee1c9] hover:text-[#eee1c9] font-serif font-black text-[9.5px] rounded shadow-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-1 uppercase border border-stone-800 active:translate-y-0.5 select-none"
                >
                  <span>{locale === 'zh' ? '✕ 撤销挂单' : '✕ Cancel Warrant'}</span>
                </button>
                
                <button
                  onClick={() => onModifyDemand?.(task)}
                  className="flex-1 py-1.5 bg-[#dfab6c] hover:bg-[#ebdcb9] text-[#1c110b] font-serif font-black text-[9.5px] rounded border border-[#dfab6c] transition cursor-pointer active:translate-y-0.5 select-none text-center"
                >
                  <span>{locale === 'zh' ? '✎ 需求修改' : '✎ Modify Demand'}</span>
                </button>
              </div>

              <button
                onClick={() => onOpenDetail(task)}
                className="w-full py-1 bg-transparent hover:bg-[#1c110b]/10 text-[#423126] font-mono text-[9px] uppercase tracking-wider font-bold rounded border border-[#423126]/30 transition"
              >
                {locale === 'zh' ? '▎ 查看详情' : '▎ VIEW DETAILED WARRANT'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onMine(task)}
                className="flex-1 py-1.5 bg-[#9e331b] hover:bg-[#b03d27] text-[#eee1c9] font-serif font-black text-[10px] rounded shadow-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-1.5 uppercase border border-[#6e2211] active:translate-y-0.5 select-none"
              >
                <Target className="w-3.5 h-3.5 text-[#eee1c9]" /> 
                <span>{t('btnMine')}</span>
              </button>
              
              <button
                onClick={() => onValidate(task)}
                className="px-3 py-1.5 bg-[#eae0cb] hover:bg-[#e1d5bd] text-[#5c493c] font-serif font-bold text-[10px] rounded border border-[#bfae94] transition cursor-pointer active:translate-y-0.5 select-none"
              >
                {t('btnValidate')}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
