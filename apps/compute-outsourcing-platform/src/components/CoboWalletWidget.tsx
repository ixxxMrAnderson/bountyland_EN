/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Wallet, ShieldCheck, Check, AlertCircle, ChevronRight, HelpCircle } from 'lucide-react';
import { WalletState } from '../types';
import { useTranslation } from '../locales';

interface CoboWalletWidgetProps {
  walletState: WalletState;
  onApproveItem: (id: string) => void;
  onRejectItem: (id: string) => void;
}

export const CoboWalletWidget: React.FC<CoboWalletWidgetProps> = ({
  walletState,
  onApproveItem,
  onRejectItem
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { t, locale } = useTranslation();

  const pendingApprovals = walletState.pendingApprovalsList.filter(item => item.status === 'Pending');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl hover:border-slate-700 transition duration-300">
      {/* Wallet Status Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <Wallet className="w-4 h-4 text-brand-indigo" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-sm tracking-wide text-white">Cobo Wallet</span>
              <div className="relative">
                <HelpCircle 
                  className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-pointer transition"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2.5 bg-slate-950 border border-slate-800 rounded-lg shadow-xl text-xs text-slate-300 z-50">
                    {locale === 'en' 
                      ? 'Cobo Wallet acts as the platform escrow, protecting payouts. High-risk operations (e.g., funding or slashing) trigger Cobo Pact reviews.'
                      : 'Cobo 智能钱包充当了全链算力平台的资产托管层。高风险操作（例如存款、罚没或对账清算）将触发 Cobo Pact 的安全检查。'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-mono">
                {locale === 'en' ? 'Mock Connected' : '模拟已连接'}
              </span>
            </div>
          </div>
        </div>
        
        {pendingApprovals.length > 0 && (
          <span className="bg-brand-rose/10 text-brand-rose border border-brand-rose/20 text-[10px] font-semibold px-2 py-0.5 rounded-full animate-bounce">
            {t('pendingPacts', { count: pendingApprovals.length })}
          </span>
        )}
      </div>

      {/* Account Info */}
      <div className="bg-slate-950 px-3 py-2.5 rounded-lg border border-slate-850 space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">{t('escrowAddress')}</span>
          <span className="font-mono text-brand-cyan hover:underline cursor-pointer select-all font-medium">
            {walletState.address.slice(0, 6)}...{walletState.address.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">{t('devFunds')}</span>
          <span className="font-mono font-bold text-white text-sm">
            {walletState.balance.toFixed(3)} ETH
          </span>
        </div>
      </div>

      {/* Approvals section */}
      <div className="mt-4 pt-4 border-t border-slate-850">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-slate-300 hover:text-white transition group py-1"
        >
          <span className="font-medium flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-cyan" />
            {t('pactGates', { count: pendingApprovals.length })}
          </span>
          <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-3 max-h-72 overflow-y-auto pr-1">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-4 bg-slate-950/40 rounded-lg border border-dashed border-slate-850">
                <p className="text-xs text-slate-500">{t('allPactsApproved')}</p>
                <p className="text-[9px] text-slate-600 mt-1">{t('readyNewOrders')}</p>
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-slate-950 p-2.5 rounded-lg border border-brand-indigo/10 hover:border-brand-indigo/30 transition flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-indigo"></div>
                  
                  <div>
                    <h5 className="text-[11px] font-bold text-slate-200 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
                      {item.title}
                    </h5>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.amount && (
                    <div className="flex justify-between items-center bg-slate-900/60 px-1.5 py-1 rounded text-[10px]">
                      <span className="text-slate-500">{t('pactRequireDeposit')}</span>
                      <span className="font-mono text-brand-indigo font-bold">{item.amount} ETH</span>
                    </div>
                  )}

                  {item.details && (
                    <div className="text-[9px] font-mono p-1 bg-slate-900/80 rounded border border-slate-850 gap-0.5 grid grid-cols-2">
                      <div><span className="text-slate-500">Threshold:</span> <span className="text-slate-300">{item.details.threshold || 'N/A'}</span></div>
                      <div><span className="text-slate-500">Can Slash:</span> <span className="text-brand-rose">Yes</span></div>
                      <div className="col-span-2"><span className="text-slate-500">{t('pactRuleLabel')}</span> <span className="text-slate-300">{t('pactRuleDesc')}</span></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => onApproveItem(item.id)}
                      className="flex-1 bg-brand-indigo hover:bg-brand-indigo/80 text-white font-semibold py-1 rounded text-[10px] transition flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Check className="w-3 h-3" /> {t('pactBtnApprove')}
                    </button>
                    <button
                      onClick={() => onRejectItem(item.id)}
                      className="px-2 py-1 bg-slate-900 hover:bg-brand-rose/20 text-slate-400 hover:text-brand-rose rounded text-[10px] border border-slate-800 hover:border-brand-rose/30 transition shrink-0"
                    >
                      {t('pactBtnReject')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
