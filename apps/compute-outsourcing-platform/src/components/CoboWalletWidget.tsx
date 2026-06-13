/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, AlertCircle, ChevronRight, HelpCircle, LogOut, Wallet } from 'lucide-react';
import { WalletState } from '../types';
import { useTranslation } from '../locales';
import { isMetaMaskInstalled, getNetworkInfo } from '../services/walletService';

interface CoboWalletWidgetProps {
  walletState: WalletState;
  onApproveItem: (id: string) => void;
  onRejectItem: (id: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const CoboWalletWidget: React.FC<CoboWalletWidgetProps> = ({
  walletState,
  onApproveItem,
  onRejectItem,
  onConnect,
  onDisconnect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [networkName, setNetworkName] = useState<string>('');
  const { t, locale } = useTranslation();

  const pendingApprovals = walletState.pendingApprovalsList.filter(item => item.status === 'Pending');
  const hasMetaMask = isMetaMaskInstalled();

  // Fetch network info when connected
  useEffect(() => {
    if (walletState.connected) {
      getNetworkInfo()
        .then((info) => setNetworkName(info.name))
        .catch(() => setNetworkName(''));
    } else {
      setNetworkName('');
    }
  }, [walletState.connected, walletState.address]);

  // ── Not Connected State ──
  if (!walletState.connected) {
    return (
      <div className="bg-[#150f0c] border-2 border-[#4a3427] rounded px-4 py-3 shadow-md hover:border-[#8e5c3c] transition duration-300 relative outline outline-1 outline-offset-4 outline-[#4a3427]/20">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed border-[#4a3427]/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#2a1d15] flex items-center justify-center border border-[#4a3427] shadow-inner">
              <span className="text-[#dfab6c] font-serif font-black text-xs">🦊</span>
            </div>
            <div>
              <span className="font-serif font-black text-xs tracking-wide text-[#dfab6c] uppercase">
                {locale === 'zh' ? 'MetaMask 小狐狸' : 'MetaMask Wallet'}
              </span>
            </div>
          </div>
          <span className="text-[8.5px] font-mono text-[#8e7564] uppercase">
            {locale === 'zh' ? '未连接' : 'Disconnected'}
          </span>
        </div>

        {!hasMetaMask ? (
          <div className="text-center py-3 space-y-2">
            <p className="text-[10px] text-[#8e7564] font-mono">
              {locale === 'zh'
                ? '未检测到 MetaMask 扩展插件'
                : 'MetaMask extension not detected'}
            </p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[10px] text-[#dfab6c] hover:underline font-mono font-bold"
            >
              {locale === 'zh' ? '→ 前往安装 MetaMask' : '→ Install MetaMask'}
            </a>
          </div>
        ) : (
          <button
            onClick={onConnect}
            className="w-full py-2.5 bg-[#dfab6c] hover:bg-[#ebdcb9] text-[#150f0c] font-serif font-black text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 transition"
          >
            <Wallet className="w-4 h-4" />
            <span>{locale === 'zh' ? '连接 MetaMask 钱包' : 'CONNECT METAMASK WALLET'}</span>
          </button>
        )}

        <p className="text-[8px] text-[#8e7564]/60 font-mono text-center mt-2">
          Sepolia Testnet · {locale === 'zh' ? 'ETH 测试网' : 'ETH Testnet'}
        </p>
      </div>
    );
  }

  // ── Connected State ──
  return (
    <div className="bg-[#150f0c] border-[#4a3427] border-2 rounded px-4 py-3 shadow-md hover:border-[#8e5c3c] transition duration-300 relative outline outline-1 outline-offset-4 outline-[#4a3427]/20">
      {/* Wallet Status Header */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-dashed border-[#4a3427]/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2a1d15] flex items-center justify-center border border-[#4a3427] shadow-inner">
            <span className="text-[#dfab6c] font-serif font-black text-xs">🦊</span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-serif font-black text-xs tracking-wide text-[#dfab6c] uppercase">
                {locale === 'zh' ? 'MetaMask 小狐狸' : 'MetaMask Wallet'}
              </span>
              <div className="relative">
                <HelpCircle
                  className="w-3.5 h-3.5 text-[#8e5c3c] hover:text-[#dfab6c] cursor-pointer transition"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {showTooltip && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-52 p-2.5 bg-[#1a1310] border-2 border-[#4a3427] rounded shadow-xl text-[10px] text-[#ebdcb9] z-50 font-mono leading-relaxed select-text">
                    {locale === 'en'
                      ? 'MetaMask Wallet protects all compute rewards under secure smart contract escrow seals.'
                      : 'MetaMask 小狐狸安全托管层：通过以太坊智能合约安全保护所有链上算力预算与代扣资产。'}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#849c44] animate-pulse"></span>
              <span className="text-[8.5px] text-[#8e7564] font-mono tracking-wider uppercase font-bold">
                {networkName || (locale === 'en' ? 'Connected' : '已连接')}
              </span>
            </div>
          </div>
        </div>

        {/* Disconnect + pending gates badge */}
        <div className="flex items-center gap-2">
          {pendingApprovals.length > 0 && (
            <span className="bg-[#c3432b]/10 text-[#dfab6c] border border-[#c3432b]/20 text-[8.5px] font-mono font-bold px-1.5 py-0.5 rounded animate-bounce shrink-0">
              {locale === 'zh' ? `${pendingApprovals.length} 条待签` : `${pendingApprovals.length} PENDING`}
            </span>
          )}
          <button
            onClick={onDisconnect}
            className="text-[#8e7564] hover:text-[#bf311d] transition p-1"
            title={locale === 'zh' ? '断开钱包' : 'Disconnect'}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-[#1b120e] px-3 py-2 rounded border border-[#4a3427]/40 space-y-1">
        <div className="flex justify-between items-center text-[9.5px] font-mono">
          <span className="text-[#a58d7c]">{t('escrowAddress')}</span>
          <span className="text-[#dfab6c] hover:underline cursor-pointer select-all font-bold">
            {walletState.address.slice(0, 6)}...{walletState.address.slice(-6)}
          </span>
        </div>
        <div className="flex justify-between items-center text-[9.5px] font-mono">
          <span className="text-[#a58d7c]">{t('devFunds')}</span>
          <span className="font-bold text-[#dfab6c]">
            {walletState.balance.toFixed(4)} ETH
          </span>
        </div>
      </div>

      {/* Approvals section */}
      <div className="mt-3 pt-3 border-t border-dashed border-[#4a3427]/30">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#a58d7c] hover:text-[#dfab6c] transition group py-1"
        >
          <span className="font-bold flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#dfab6c]" />
            {t('pactGates', { count: pendingApprovals.length })}
          </span>
          <ChevronRight className={`w-4 h-4 text-[#a58d7c] group-hover:text-[#dfab6c] transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>

        {isExpanded && (
          <div className="mt-2.5 space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-3 bg-[#1b120e]/33 rounded border border-dashed border-[#4a3427]/40">
                <p className="text-[9.5px] text-[#8e7564] font-mono">{t('allPactsApproved')}</p>
                <p className="text-[9px] text-[#8e7564]/80 mt-0.5 font-mono">{t('readyNewOrders')}</p>
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1b120e] p-2.5 rounded border border-[#4a3427]/50 hover:border-[#8e5c3c]/40 transition flex flex-col gap-2 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#dfab6c]"></div>

                  <div>
                    <h5 className="text-[9.5px] font-bold text-[#dfab6c] flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5 text-[#dfab6c] shrink-0" />
                      {item.title}
                    </h5>
                    <p className="text-[9.5px] text-[#ebdcb9]/80 mt-0.5 leading-relaxed font-sans">
                      {item.description}
                    </p>
                  </div>

                  {item.amount && (
                    <div className="flex justify-between items-center bg-[#150f0c] px-1.5 py-1 rounded text-[9px] font-mono border border-[#4a3427]/30">
                      <span className="text-[#a58d7c]">{t('pactRequireDeposit')}</span>
                      <span className="text-[#dfab6c] font-bold">{item.amount} ETH</span>
                    </div>
                  )}

                  {item.details && (
                    <div className="text-[8.5px] font-mono p-1 bg-[#150f0c]/40 rounded border border-[#4a3427]/30 gap-0.5 grid grid-cols-2">
                      <div><span className="text-[#a58d7c]">Pass Score:</span> <span className="text-[#dfab6c] font-extrabold">{item.details.finalScore || 'N/A'}</span></div>
                      <div><span className="text-[#a58d7c]">Audited:</span> <span className="text-[#849c44] font-bold">Approved</span></div>
                      <div className="col-span-2"><span className="text-[#a58d7c]">{t('pactRuleLabel')}</span> <span className="text-[#ebdcb9]">{t('pactRuleDesc')}</span></div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => onApproveItem(item.id)}
                      className="flex-1 bg-[#dfab6c] hover:bg-[#ebdcb9] text-[#150f0c] font-serif font-black py-1 rounded text-[9px] transition flex items-center justify-center gap-1 uppercase"
                    >
                      <Check className="w-3 h-3 text-[#150f0c]" /> {locale === 'zh' ? '确认签署' : 'METAMASK SIGN'}
                    </button>
                    <button
                      onClick={() => onRejectItem(item.id)}
                      className="px-2 py-1 bg-transparent hover:bg-[#150f0c] text-[#a58d7c] hover:text-[#dfab6c] rounded text-[9px] border border-[#4a3427]/50 transition shrink-0 font-mono"
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
