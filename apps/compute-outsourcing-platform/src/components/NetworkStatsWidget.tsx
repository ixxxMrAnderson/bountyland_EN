/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Users, Activity, Gauge, RefreshCw, Layers } from 'lucide-react';
import { useTranslation } from '../locales';

interface ClusterInfo {
  id: string;
  name: { en: string; zh: string };
  load: number;
  status: 'active' | 'busy' | 'idle';
}

export const NetworkStatsWidget: React.FC = () => {
  const { t, locale } = useTranslation();
  
  // Real-time fluctuating state variables
  const [totalCompute, setTotalCompute] = useState(852.48); // TFLOPS
  const [activeMiners, setActiveMiners] = useState(1424);   // Nodes count
  const [clusterLoad, setClusterLoad] = useState(82.4);     // Load Percentage
  const [totalTasksSolved, setTotalTasksSolved] = useState(45284);
  const [isRotatingRing, setIsRotatingRing] = useState(false);

  // Blinking states for virtual GPU cluster grid
  const [clusters, setClusters] = useState<ClusterInfo[]>([
    { id: 'asia-01', name: { en: 'GPU Cluster CN-East', zh: 'GPU华东一算力节点' }, load: 88, status: 'busy' },
    { id: 'us-02', name: { en: 'GPU Cluster US-West', zh: 'GPU美西二及微调集群' }, load: 74, status: 'active' },
    { id: 'eu-03', name: { en: 'Tensor Cluster EU-Central', zh: 'EUMC张量高性能节点' }, load: 92, status: 'busy' },
    { id: 'asia-04', name: { en: 'Node Pool Singapore', zh: '新加坡混合自治算网' }, load: 15, status: 'idle' },
    { id: 'sa-05', name: { en: 'GPU Core Sao Paulo', zh: '圣保罗零抗性物理节点' }, load: 81, status: 'active' },
    { id: 'au-06', name: { en: 'ASIC Array Sydney', zh: '悉尼密码学共识阵列' }, load: 85, status: 'active' },
    { id: 'oceania-07', name: { en: 'Edge Node Mix', zh: '全球边缘轻量节点汇聚' }, load: 56, status: 'active' },
    { id: 'us-08', name: { en: 'GPU Cluster US-East', zh: '美东训练集和解中枢' }, load: 0, status: 'idle' }
  ]);

  useEffect(() => {
    // Minute changes to simulate live network data breathing rhythmically
    const interval = setInterval(() => {
      // 1. Total Compute Power fluctuations (TFLOPS)
      setTotalCompute((prev) => {
        const delta = (Math.random() - 0.5) * 0.44; // ±0.22 TFLOPS
        const next = prev + delta;
        return Number(Math.max(851.50, Math.min(next, 853.80)).toFixed(2));
      });

      // 2. Active workers connecting/disconnecting
      setActiveMiners((prev) => {
        const change = Math.random() > 0.65 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        return Math.max(1418, Math.min(prev + change, 1432));
      });

      // 3. Cluster general load fluctuation
      setClusterLoad((prev) => {
        const delta = (Math.random() - 0.5) * 1.8; // ±0.9%
        const next = Math.max(79.5, Math.min(prev + delta, 85.5));
        return Number(next.toFixed(1));
      });

      // 4. Tasks solved occasionally increments
      setTotalTasksSolved((prev) => {
        return Math.random() > 0.90 ? prev + 1 : prev;
      });

      // 5. Blinkenlights update of cluster nodes load
      setClusters((prevClusters) => 
        prevClusters.map(cl => {
          let nextLoad = cl.load;
          if (cl.status !== 'idle') {
            const loadDelta = Math.floor((Math.random() - 0.5) * 8);
            nextLoad = Math.max(40, Math.min(cl.load + loadDelta, 96));
          } else {
            // Idle node slight micro-sleep load
            nextLoad = Math.floor(Math.random() * 8);
          }
          
          let nextStatus = cl.status;
          if (nextLoad > 85) nextStatus = 'busy';
          else if (nextLoad > 0) nextStatus = 'active';
          else nextStatus = 'idle';

          return { ...cl, load: nextLoad, status: nextStatus };
        })
      );
      
      // Trigger a brief rotate animation to show active network status query
      setIsRotatingRing(true);
      setTimeout(() => setIsRotatingRing(false), 800);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl hover:border-slate-705 transition duration-300 relative overflow-hidden select-none">
      
      {/* Background cyber grid decorations */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px] opacity-10 pointer-events-none"></div>
      
      {/* Widget Header with live beacon */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Gauge className="w-4 h-4 text-brand-emerald" />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs tracking-wide text-white">
              {t('platformStatsTitle') || 'Network Strength Indicators'}
            </h4>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping shrink-0"></span>
              <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">
                {locale === 'zh' ? '实时算网同步中' : 'GLOBAL SYNC LIVE'}
              </span>
            </div>
          </div>
        </div>
        <button 
          title="Manual Sync Grid" 
          className="text-slate-500 hover:text-slate-300 transition duration-150 p-1"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRotatingRing ? 'animate-spin text-brand-emerald' : ''}`} />
        </button>
      </div>

      {/* Main Core Strength Indicators (2 Cols) */}
      <div className="grid grid-cols-2 gap-2 pb-3.5 border-b border-slate-850 relative z-10">
        
        {/* Computing Power Card */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 hover:border-slate-800 transition duration-150">
          <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-mono font-semibold uppercase">
            <Cpu className="w-3.5 h-3.5 text-brand-cyan shrink-0 animate-pulse" />
            <span className="truncate">{t('platformTotalCompute') || 'Total Hashrate'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold font-mono text-white tracking-tight">
              {totalCompute}
            </span>
            <span className="text-[9px] text-slate-500 font-bold font-mono">TFLOPS</span>
          </div>
        </div>

        {/* Online Miners Card */}
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 hover:border-slate-800 transition duration-150">
          <div className="flex items-center gap-1.5 text-slate-500 text-[9px] font-mono font-semibold uppercase">
            <Users className="w-3.5 h-3.5 text-brand-indigo shrink-0" />
            <span className="truncate">{t('platformActiveMiners') || 'Active Workers'}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm font-bold font-mono text-brand-cyan tracking-tight">
              {activeMiners}
            </span>
            <span className="text-[9px] text-slate-500 font-bold font-mono">{locale === 'zh' ? '节点' : 'Nodes'}</span>
          </div>
        </div>

      </div>

      {/* Embedded Live CPU/Node Load progress indicator */}
      <div className="py-3 border-b border-slate-850 relative z-10">
        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mb-1.5">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-brand-indigo" />
            {t('platformNetworkLoad') || 'Compute Cluster Load'}
          </span>
          <span className="text-white font-bold">{clusterLoad}%</span>
        </div>
        
        {/* Custom progress tracker container */}
        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850 flex p-[1px]">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-brand-indigo to-brand-cyan shadow-sm"
            style={{ width: `${clusterLoad}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-2">
          <span>{t('platformActiveTasksSolved') || 'Cumulative Settled'} :</span>
          <span className="text-slate-300 font-bold font-mono">{totalTasksSolved.toLocaleString()}</span>
        </div>
      </div>

      {/* GPU Clusters Active Map (The supreme visual showcase of Platform Strength) */}
      <div className="mt-3 relative z-10">
        <h5 className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider mb-2 flex items-center gap-1">
          <Layers className="w-3 h-3 text-brand-cyan" />
          {locale === 'zh' ? '全球智算物理阵列热度图' : 'GPU Clusters Terminals Status'}
        </h5>
        
        {/* Mini indicator boxes representing live nodes */}
        <div className="grid grid-cols-4 gap-1.5">
          {clusters.map((cluster) => (
            <div 
              key={cluster.id} 
              className="group relative cursor-pointer"
            >
              <div className={`h-4.5 rounded border flex items-center justify-center text-[9px] font-mono leading-none font-bold transition-all duration-300 ${
                cluster.status === 'busy' 
                  ? 'bg-brand-rose/10 border-brand-rose/30 text-brand-rose animate-pulse'
                  : cluster.status === 'active'
                    ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald'
                    : 'bg-slate-950/85 border-slate-850 text-slate-650'
              }`}>
                {cluster.load > 0 ? `${cluster.load}%` : 'OFF'}
              </div>

              {/* High-fidelity hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-40 p-2 bg-slate-950 border border-slate-800 rounded shadow-xl text-[9px] text-slate-300 scale-0 group-hover:scale-100 origin-bottom transition-all duration-150 z-50 pointer-events-none text-center">
                <span className="font-bold text-white block mb-0.5">
                  {locale === 'zh' ? cluster.name.zh : cluster.name.en}
                </span>
                <span className="text-slate-500 capitalize font-mono text-[8px]">
                  {cluster.status === 'busy' ? (locale === 'zh' ? '🔥 高度满负荷' : '🔥 Busy Peak') : 
                   cluster.status === 'active' ? (locale === 'zh' ? '🟢 协同运行中' : '🟢 Operational') : 
                   (locale === 'zh' ? '❄️ 冷却待机中' : '❄️ Idle Standby')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
