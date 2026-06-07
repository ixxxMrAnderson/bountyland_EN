/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, Scale, Coins, ShieldCheck, Clock, Milestone } from 'lucide-react';
import { Activity } from '../types';
import { useTranslation, getLocalizedTaskTitle } from '../locales';

interface ActivityCardProps {
  activity: Activity;
  onClick: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onClick
}) => {
  const isMining = activity.type === 'Mining';
  const { t, locale } = useTranslation();
  
  const getStatusBadge = () => {
    switch (activity.status) {
      case 'Settled':
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> {t('statusSettled')}
          </span>
        );
      case 'Scored':
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-mono font-bold bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 px-2 py-0.5 rounded animate-pulse">
            <Milestone className="w-3 h-3" /> {t('statusScored')}
          </span>
        );
      case 'Unscored':
      default:
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3" /> {t('statusUnscored')}
          </span>
        );
    }
  };

  const isReputationDamaged = activity.reputationChange !== undefined && activity.reputationChange < 0;

  // Let's translate basic log activity descriptions if possible
  let displayInfo = activity.info;
  if (locale === 'zh') {
    if (activity.info.includes('Waiting for validator review')) {
      displayInfo = '等待验证节点与对账 AI 进行评估监督';
    } else if (activity.info.includes('Waiting settlement')) {
      displayInfo = '已打分，正等待多签智能合约清算划账';
    } else if (activity.info.includes('Settle complete')) {
      displayInfo = '多签清算结束，佣金已安全释放';
    } else if (activity.info.includes('Distributed!')) {
      displayInfo = '托管资金已成功结转至计算节点地址';
    } else {
      displayInfo = activity.info
        .replace('Mining activity', '计算挖矿')
        .replace('Validation activity', '验证评估')
        .replace('Settled', '已结算')
        .replace('Scored', '已打分')
        .replace('Final score', '共识最终得分')
        .replace('Final AI adjusted score', '经过 AI 工具套保校准后得分')
        .replace('Submitted just now', '刚刚提交')
        .replace('Validator delta', '验证偏离值')
        .replace('Reputation', '信誉绩分');
    }
  }

  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900/85 border rounded-xl p-4 hover:border-slate-700 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group ${
        isReputationDamaged ? 'border-brand-rose/20 hover:border-brand-rose/40' : 'border-slate-800/80'
      }`}
    >
      {/* Decorative vertical band */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 transition-all ${
        isMining ? 'bg-brand-indigo' : 'bg-brand-cyan'
      }`}></div>

      {/* Left items: Title and description fields */}
      <div className="flex items-start gap-3 pl-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
          isMining 
            ? 'bg-brand-indigo/10 border-brand-indigo/20 text-brand-indigo' 
            : 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan'
        }`}>
          {isMining ? <Cpu className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-bold text-sm text-white group-hover:text-brand-cyan transition duration-150">
              {getLocalizedTaskTitle(activity.taskTitle, locale)}
            </h4>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="font-semibold text-slate-500 font-mono text-[11px] uppercase">
              {isMining ? t('miningActivityTitle') : t('validationActivityTitle')}
            </span>
            <span className="text-slate-600 font-bold">•</span>
            <span className="text-[11px] font-mono">{displayInfo}</span>
          </div>
        </div>
      </div>

      {/* Right items: Rewards cash stream ledger */}
      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-850">
        
        {/* Reputation Penalty or reward highlights */}
        {activity.reputationChange !== undefined && (
          <div className="text-right flex flex-col pr-1">
            <span className="text-[9px] text-slate-500 uppercase font-mono font-medium">{t('reputation')}</span>
            <span className={`font-mono text-xs font-bold leading-tight ${
              activity.reputationChange >= 0 ? 'text-brand-emerald' : 'text-brand-rose'
            }`}>
              {activity.reputationChange >= 0 ? '+' : ''}{activity.reputationChange} {locale === 'en' ? 'Rep' : '绩分'}
            </span>
          </div>
        )}

        {/* Currency Payout */}
        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase font-mono font-medium block">{t('awardPayout')}</span>
          <div className="flex items-center gap-1 justify-end font-mono">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className={`text-sm font-bold uppercase ${
              activity.status === 'Settled' 
                ? 'text-brand-emerald' 
                : 'text-slate-400 font-medium'
            }`}>
              {activity.status === 'Settled' ? '+' : locale === 'en' ? 'est. ' : '预计 '}{activity.reward.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
