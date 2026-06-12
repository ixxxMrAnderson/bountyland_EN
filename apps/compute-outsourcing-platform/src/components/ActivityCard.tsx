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
          <span className="flex items-center gap-1 text-[9px] uppercase font-mono font-bold bg-[#849c44]/10 text-[#849c44] border border-[#849c44]/30 px-2 py-0.5 rounded-sm">
            <ShieldCheck className="w-3 h-3" /> {t('statusSettled')}
          </span>
        );
      case 'Scored':
        return (
          <span className="flex items-center gap-1 text-[9px] uppercase font-mono font-bold bg-[#dfab6c]/10 text-[#dfab6c] border border-[#dfab6c]/30 px-2 py-0.5 rounded-sm animate-pulse">
            <Milestone className="w-3 h-3" /> {t('statusScored')}
          </span>
        );
      case 'Unscored':
      default:
        return (
          <span className="flex items-center gap-1 text-[9px] uppercase font-mono font-bold bg-[#0c0806] text-[#8e5c3c] border border-[#4a3427]/50 px-2 py-0.5 rounded-sm">
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
      className={`bg-[#150f0c] border-2 rounded-lg p-4.5 hover:border-[#dfab6c]/60 hover:bg-[#1a1310] hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group ${
        isReputationDamaged ? 'border-[#d63d27]/40 hover:border-[#d63d27]/70' : 'border-[#4a3427]'
      }`}
    >
      {/* Decorative vertical band */}
      <div className={`absolute top-0 bottom-0 left-0 w-1 transition-all ${
        isMining ? 'bg-[#8e5c3c]' : 'bg-[#dfab6c]'
      }`}></div>

      {/* Left items: Title and description fields */}
      <div className="flex items-start gap-3.5 pl-1.5">
        <div className={`w-9.5 h-9.5 rounded-md flex items-center justify-center shrink-0 border mt-0.5 ${
          isMining 
            ? 'bg-[#8e5c3c]/10 border-[#8e5c3c]/30 text-[#ebdcb9]' 
            : 'bg-[#dfab6c]/10 border-[#dfab6c]/30 text-[#dfab6c]'
        }`}>
          {isMining ? <Cpu className="w-5 h-5 text-[#8e5c3c]" /> : <Scale className="w-5 h-5 text-[#dfab6c]" />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-serif font-black text-xs uppercase tracking-wider text-[#ebdcb9] group-hover:text-[#dfab6c] transition duration-150">
              {getLocalizedTaskTitle(activity.taskTitle, locale)}
            </h4>
            {getStatusBadge()}
          </div>
          
          <div className="flex items-center gap-3 text-xs text-[#a58d7c] flex-wrap">
            <span className="font-bold text-[#8e5c3c] font-mono text-[10px] uppercase tracking-wide">
              {isMining ? t('miningActivityTitle') : t('validationActivityTitle')}
            </span>
            <span className="text-[#4a3427] font-bold">•</span>
            <span className="text-[11px] font-mono leading-none">{displayInfo}</span>
          </div>
        </div>
      </div>

      {/* Right items: Rewards cash stream ledger */}
      <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 border-t sm:border-0 pt-2.5 sm:pt-0 border-[#4a3427]/40">
        
        {/* Reputation Penalty or reward highlights */}
        {activity.reputationChange !== undefined && (
          <div className="text-right flex flex-col pr-1">
            <span className="text-[9px] text-[#8e5c3c] uppercase font-mono font-bold tracking-wide">{t('reputation')}</span>
            <span className={`font-mono text-xs font-black leading-tight ${
              activity.reputationChange >= 0 ? 'text-[#849c44]' : 'text-[#d63d27]'
            }`}>
              {activity.reputationChange >= 0 ? '+' : ''}{activity.reputationChange} {locale === 'en' ? 'Rep' : '绩分'}
            </span>
          </div>
        )}

        {/* Currency Payout */}
        <div className="text-right">
          <span className="text-[9px] text-[#8e5c3c] uppercase font-mono font-bold tracking-wide block">{t('awardPayout')}</span>
          <div className="flex items-center gap-1 justify-end font-mono">
            <Coins className="w-3.5 h-3.5 text-[#dfab6c]" />
            <span className={`text-xs font-black uppercase ${
              activity.status === 'Settled' 
                ? 'text-[#849c44]' 
                : 'text-[#8e5c3c] font-bold'
            }`}>
              {activity.status === 'Settled' ? '+' : locale === 'en' ? 'est. ' : '预计 '}{activity.reward.toFixed(4)} ETH
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
