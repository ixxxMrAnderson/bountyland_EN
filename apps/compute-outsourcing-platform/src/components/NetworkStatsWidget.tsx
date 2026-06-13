/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Target, RefreshCw } from 'lucide-react';
import { useTranslation } from '../locales';

export const NetworkStatsWidget: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t, locale } = useTranslation();
  
  // Real-time fluctuating state variable representing bounty hunters saddled up
  const [activeMiners, setActiveMiners] = useState(1424);   
  const [isRotatingRing, setIsRotatingRing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMiners((prev) => {
        const change = Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(1418, Math.min(prev + change, 1432));
      });
      
      setIsRotatingRing(true);
      setTimeout(() => setIsRotatingRing(false), 800);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  if (compact) {
    return (
      <div
        className="flex flex-col items-center gap-1 select-none"
        title={locale === 'zh' ? `${activeMiners} 个活跃计算节点` : `${activeMiners} active nodes`}
      >
        <div className="relative w-10 h-10 rounded-full bg-[#150f0c] border border-[#4a3427] flex items-center justify-center shadow-md">
          <Target className="w-4 h-4 text-[#dfab6c]" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#849c44] animate-pulse border border-[#0f0a08]"></span>
        </div>
        <span className="text-[10px] font-serif font-black text-[#dfab6c] leading-none tracking-tight">
          {activeMiners}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#150f0c] border-[#4a3427] border-2 rounded px-4 py-3 shadow-md hover:border-[#8e5c3c] transition duration-300 relative overflow-hidden select-none outline outline-1 outline-offset-4 outline-[#4a3427]/20">
      
      {/* Widget Header with live status beacon */}
      <div className="flex items-center justify-between relative z-10 border-b border-dashed border-[#4a3427]/30 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#2a1d15] flex items-center justify-center border border-[#4a3427]">
            <Target className="w-4 h-4 text-[#dfab6c] shrink-0" />
          </div>
          <div>
            <h4 className="font-serif font-black text-xs tracking-wide text-[#dfab6c] uppercase">
              {locale === 'zh' ? '算力节点同步率' : 'Decentralized Miners'}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-[#849c44] animate-pulse shrink-0"></span>
              <span className="text-[8.5px] text-[#8e7564] font-mono uppercase tracking-wider font-bold">
                {locale === 'zh' ? '去中心化网络算力同步中' : 'DECENTRALIZED SYNCED'}
              </span>
            </div>
          </div>
        </div>
        
        <button 
          title="Sync Compute Network" 
          className="text-[#8e7564] hover:text-[#dfab6c] transition duration-150 p-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRotatingRing ? 'animate-spin text-[#dfab6c]' : ''}`} />
        </button>
      </div>

      {/* Hero layout of the Metric */}
      <div className="mt-2 flex items-baseline gap-1.5 relative z-10 pl-1">
        <span className="text-2xl font-serif font-black text-[#dfab6c] tracking-tight">
          {activeMiners}
        </span>
        <span className="text-[8.5px] text-[#8e7564] uppercase font-bold font-mono">
          {locale === 'zh' ? '个活跃外部计算节点' : 'Active Nodes Registered'}
        </span>
      </div>

    </div>
  );
};
