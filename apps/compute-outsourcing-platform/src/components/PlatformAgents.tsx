/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Cpu, 
  Activity, 
  Zap, 
  Terminal, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Sliders,
  ChevronRight,
  Sparkles,
  Lock,
  Scale
} from 'lucide-react';
import { useTranslation } from '../locales';

interface AgentProfile {
  id: string;
  name: { en: string; zh: string };
  version: string;
  model: string;
  role: { en: string; zh: string };
  mission: { en: string; zh: string };
  sla: string;
  performance: {
    invocations: number;
    speed: string;
    accuracy: string;
  };
  state: 'idle' | 'working' | 'armed';
  tags: string[];
}

export const PlatformAgents: React.FC = () => {
  const { locale } = useTranslation();
  const [activeAgentId, setActiveAgentId] = useState<string>('spec-agent');
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('');
  const [sandboxSelectedAgent, setSandboxSelectedAgent] = useState<string>('spec-agent');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [metricsPulse, setMetricsPulse] = useState<boolean>(false);
  const [telemetryLogs, setTelemetryLogs] = useState<Array<{ time: string; text: string; type: string }>>([]);
  
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Specialist Agents Profiles
  const agents: AgentProfile[] = [
    {
      id: 'spec-agent',
      name: { en: 'z.ai Platform Spec Agent', zh: 'z.ai 规格定义设计代理' },
      version: 'v2.5',
      model: 'gemini-2.5-flash',
      role: { en: 'Validator Criteria Synthesis', zh: '验收规则与契约生成' },
      mission: {
        en: 'Parses natural language requirements into strict on-chain validation criteria, standard formatting tests, scoring weights, and Cobo Pact refund thresholds.',
        zh: '解析人类自然语言计算定义，自动构建具备高可验证性的校验规程、权重占比及 Cobo Pact 保证金归底算法阈值。'
      },
      sla: '99.98% SLA',
      performance: { invocations: 14852, speed: '0.85s', accuracy: '100% Structural Match' },
      state: 'idle',
      tags: ['Criteria Design', 'Rule compiler', 'Cobo Pact Architect']
    },
    {
      id: 'audit-agent',
      name: { en: 'z.ai AI Auditor Node', zh: 'z.ai 智能审计评估代理' },
      version: 'v2.5-pro',
      model: 'gemini-2.5-pro',
      role: { en: 'Autonomous Submission Evaluation', zh: '算力反馈智能审计' },
      mission: {
        en: 'Acts as the cryptographic benchmark. Scrutinizes miner output docs, fuzzy-scores complex text elements, and automatically exposes biased or lazy human validators.',
        zh: '作为核心去中心化审计基准点。高通量审查矿工输出文档，进行关联模糊评测，并对存在共谋或低质量评分的验证者执行强制惩戒。'
      },
      sla: '99.95% SLA',
      performance: { invocations: 24901, speed: '1.42s', accuracy: '98.6% Expert Alignment' },
      state: 'working',
      tags: ['Semantic Score', 'Fuzzy Matcher', 'Cheat Detector']
    },
    {
      id: 'dispute-arbitrator',
      name: { en: 'z.ai Arbitration Sentinel', zh: 'z.ai 去中心化仲裁哨兵' },
      version: 'v2.0-thinking',
      model: 'gemini-2.0-flash-thinking-exp',
      role: { en: 'SLA Deviation Enforcement', zh: '算流偏差仲裁与惩戒' },
      mission: {
        en: 'Enforces consensus integrity. Triggered on high scoring deviations (Delta > 20) between human validators and the AI Auditor. Executes slashed stake and reputation math.',
        zh: '系统信赖共识终结者。捕获验证者评分与智能审计间的高偏离度事件（Delta > 20），强制进行仲裁划转并触发保证金罚没指令。'
      },
      sla: '100.0% Security SLA',
      performance: { invocations: 824, speed: '2.10s', accuracy: '99.87% Zero-Bias Verdict' },
      state: 'armed',
      tags: ['Game-Theoretic Arb', 'Slashing Engine', 'Reputation Settlement']
    }
  ];

  // Live Telemetry Logs Simulator
  useEffect(() => {
    const liveActions = [
      { text: { en: '[Spec Agent] Parsed job input parameters for Decentralized Medical Dataset.', zh: '[规格设计] 成功为“医疗图景识别任务”合成了包含21组校验维度的元数据规则' }, type: 'info' },
      { text: { en: '[AI Auditor] Score computed for Submission sub-12a9 - Rating: 94% alignment.', zh: '[智能审计] 完成矿工 0x71a2 递交输出的拟合评估，评定偏差率 1.2%' }, type: 'success' },
      { text: { en: '[Sentinel] Dispute triggered: validator delta exceeded tolerance (Delta: 34) on Order #42.', zh: '[仲裁哨兵] 警告：捕捉到 Order #42 中人类验证者 0xef22 出现恶意评分偏差（Delta: 34）' }, type: 'alert' },
      { text: { en: '[Sentinel] Enforced SLA penalty: Slashed 15 Rep and deferred 0.05 ETH reward on validator.', zh: '[仲裁哨兵] 裁决：冻结该验证者质押，执行声誉声望罚扣 -15 Rep' }, type: 'success' },
      { text: { en: '[Spec Agent] Deployed raw criteriaHash [0x3ef91...bb1] to Arbitrum Nova successfully.', zh: '[规格设计] 成功向 Arbitrum Nova 广播了契约签名 hash [0x3ef91...bb1]' }, type: 'info' },
      { text: { en: '[AI Auditor] Cross-referencing 200 medical bounding boxes with Fuzzy-match engine.', zh: '[智能审计] 调用 Levenstein 字符匹配器交叉核验 200 个医学标签精度' }, type: 'info' }
    ];

    // Initial log generation
    const initialLogs = Array.from({ length: 4 }).map((_, i) => {
      const log = liveActions[Math.floor(Math.random() * liveActions.length)];
      return {
        time: new Date(Date.now() - (4 - i) * 60 * 1000).toLocaleTimeString(),
        text: locale === 'zh' ? log.text.zh : log.text.en,
        type: log.type
      };
    });
    setTelemetryLogs(initialLogs);

    // Periodically fluctuate logs and metrics
    const interval = setInterval(() => {
      setMetricsPulse(true);
      setTimeout(() => setMetricsPulse(false), 800);

      const logCandidate = liveActions[Math.floor(Math.random() * liveActions.length)];
      setTelemetryLogs(prev => [
        ...prev.slice(-9), // Keep last 10 logs
        {
          time: new Date().toLocaleTimeString(),
          text: locale === 'zh' ? logCandidate.text.zh : logCandidate.text.en,
          type: logCandidate.type
        }
      ]);
    }, 5500);

    return () => clearInterval(interval);
  }, [locale]);

  // Handle Sandbox testing preset loads
  const handlePresetLoad = (text: string) => {
    setSandboxPrompt(text);
  };

  // Run mock Agent intelligence simulation with staggered log feed
  const runSandboxSimulation = () => {
    if (!sandboxPrompt.trim() || isSimulating) return;

    setIsSimulating(true);
    setSimulationResult(null);
    setSimulationLogs([]);

    const steps = [
      { t: 400, text: locale === 'zh' ? '🤖 正在唤醒指定 AI 代理模型... 已绑定 ' + agents.find(a => a.id === sandboxSelectedAgent)?.model : '🤖 Awakening target AI Agent model... Binded with ' + agents.find(a => a.id === sandboxSelectedAgent)?.model },
      { t: 1200, text: locale === 'zh' ? '🔍 文本元数据分析中: 正在理解提示词关键词和约束...' : '🔍 Parsing prompt metadata: Extracting intent taxonomy and execution constraints...' },
      { t: 2200, text: locale === 'zh' ? '⚙️ 规则策略组装中: 正在构建多维度的评测权重及校验 Checklist...' : '⚙️ Policy compilation: Structuring evaluation dimensions and checkmarks...' },
      { t: 3250, text: locale === 'zh' ? '🔒 安全层介入: 正在生成智能合约 criteriaHash 并构造 Cobo Pact 托管契约...' : '🔒 Security Layer check: Generating criteriaHash signature & framing Cobo Pact escrow terms...' },
      { t: 4200, text: locale === 'zh' ? '🎉 任务完成！模型逻辑全路径验证通过。输出 JSON 数据。' : '🎉 Synthesis complete! All logical paths successfully verified. Outputting JSON Spec.' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setSimulationLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step.text}`]);

        // Finish step
        if (index === steps.length - 1) {
          setIsSimulating(false);
          generateSandboxResult();
        }
      }, step.t);
    });
  };

  // Generate deterministic premium results based on selected parameters
  const generateSandboxResult = () => {
    const isSpec = sandboxSelectedAgent === 'spec-agent';
    const isAudit = sandboxSelectedAgent === 'audit-agent';
    
    if (isSpec) {
      setSimulationResult({
        title: sandboxPrompt.length > 25 ? sandboxPrompt.substring(0, 25) + '...' : sandboxPrompt,
        dimensions: [
          { name: locale === 'zh' ? '核心任务完整度 (Fact Check)' : 'Task Integrity & Completion', weight: 45 },
          { name: locale === 'zh' ? '输入输出协议拟合率' : 'Output Protocol Layout Alignment', weight: 35 },
          { name: locale === 'zh' ? '异常鲁棒边缘边界' : 'Out-Of-Distribution Edge Cases Resilience', weight: 20 }
        ],
        checklist: [
          locale === 'zh' ? '分析输入是否满足用户明确表达的所有参数和意图' : 'Verify if the model output strictly addresses all requested variables in prompt',
          locale === 'zh' ? '评估 JSON 或 Markdown 的数据完整性与解析兼容性' : 'Inspect JSON structural integrity and parse compatibility under web targets',
          locale === 'zh' ? '确保长尾分布中无胡说八道的中间过渡幻觉' : 'Confirm reasoning contains zero synthetic hallucinated logic variables'
        ],
        pactDraft: {
          deposit: '0.10 ETH',
          refundLine: '72/100',
          rule: 'ComputeEscrowOnly'
        }
      });
    } else if (isAudit) {
      setSimulationResult({
        title: sandboxPrompt.length > 25 ? sandboxPrompt.substring(0, 25) + '...' : sandboxPrompt,
        evaluation: {
          scrutinyStatus: locale === 'zh' ? '扫描完成 - character accuracy 99.4%' : 'Scan completed - Character accuracy 99.4%',
          aiScore: 86,
          explanation: locale === 'zh' 
            ? '智能审计引擎核准：未检索到结构性幻觉或恶意偏见。主要扣分项在于边缘文本中存在轻微的缩写不一致，已按比例下调 4.2%。整体评定完全跨越 72 分基准，属于优良资产。'
            : 'AI Auditor approval: Zero critical semantic drift or collusive bias discovered. Slashing occurred on terminal bounding boxes where shorthand abbreviations drifted slightly (-4.2%). Overall quality highly exceeds the 72 threshold.',
          payoutAction: locale === 'zh' ? '安全释放：算力订单激活通过，推荐执行 full settlement 到 0x3a4c...' : 'Authorized: computation verified, safe to execute full settlement pay-out to 0x3a4c...'
        }
      });
    } else {
      setSimulationResult({
        title: sandboxPrompt.length > 25 ? sandboxPrompt.substring(0, 25) + '...' : sandboxPrompt,
        arbitration: {
          flaggedDiff: 'Delta score deviation: 42 (Vali: 92 vs AI: 50)',
          sentinelVerdict: locale === 'zh' ? '判定恶意刷分：检测到高度相似语法，判定该验证者存在作假协同共谋、直接扣减 ' : 'Verdict: Collation attack detected. Positive bias on trivial definitions. Enforcing penalty: Slashed ',
          reputationSlash: '-15 Rep',
          depositSlash: locale === 'zh' ? '扣押 100% 质押保证金，不予分配收益' : 'Slashed 100% stake rewards'
        }
      });
    }
  };

  // Scroll simulation console down automatically
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simulationLogs]);

  return (
    <div className="space-y-6 animate-scale-up p-5 pb-12 max-w-7xl mx-auto">
      
      {/* 1. Header Area with live SLA metrics banner */}
      <div className="relative overflow-hidden bg-slate-900 border border-slate-850/60 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-indigo/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-[10px] uppercase tracking-widest font-bold">
            <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
            {locale === 'zh' ? 'AI 共识审计机制中心' : 'On-Chain AI-Consensus Node Engine'}
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-brand-purple shrink-0" />
            {locale === 'zh' ? 'Platform Agents 平台智能代理' : 'Platform Agents Directory'}
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            {locale === 'zh' 
              ? '为了摆脱对单一验证中枢的信任依附，z.ai 平台部署了多名独立的专职、全天候代理。从规格草拟设计到智能审计、自动纠纷仲裁，全部以去中心化智能代码驱动。'
              : 'z.ai leverages specialized, autonomous agent layers to specify testing criteria, run fuzzy AI audits, and resolve consensus disputes instantly, preventing collusive attacks.'}
          </p>
        </div>

        {/* Global Agent Stats Panel */}
        <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-slate-950 p-4 rounded-xl border border-slate-850/60 relative z-10 font-mono shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">{locale === 'zh' ? '运行节点数' : 'Active Nodes'}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-sm font-bold text-white transition-all duration-300 ${metricsPulse ? 'text-brand-cyan scale-110' : ''}`}>3</span>
              <span className="text-[9px] text-slate-500 uppercase">{locale === 'zh' ? '代理' : 'Agents'}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">{locale === 'zh' ? '共识配准度' : 'SLA Alignment'}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-brand-cyan">98.64%</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">{locale === 'zh' ? '平均响应' : 'Speed Response'}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-brand-purple">1.4s</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">{locale === 'zh' ? '在线守护率' : 'Uptime SLA'}</span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-brand-emerald">100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top-tier Agent Cards Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {agents.map((agent) => {
          const isActive = activeAgentId === agent.id;
          return (
            <div 
              key={agent.id}
              onClick={() => setActiveAgentId(agent.id)}
              className={`cursor-pointer rounded-xl p-5 border transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isActive 
                  ? 'bg-slate-900 border-indigo-500/50 shadow-lg shadow-indigo-600/5' 
                  : 'bg-slate-950 hover:bg-slate-900/60 border-slate-850 hover:border-slate-800'
              }`}
            >
              {/* State lighting dot absolute */}
              <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-850/60">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  agent.state === 'idle' ? 'bg-slate-500' :
                  agent.state === 'working' ? 'bg-brand-emerald animate-pulse' : 'bg-brand-rose animate-pulse'
                }`}></span>
                <span className="text-[8px] font-mono text-slate-400 capitalize font-bold">
                  {agent.state === 'idle' ? (locale === 'zh' ? '冷却待命' : 'Idle') :
                   agent.state === 'working' ? (locale === 'zh' ? '扫描核验' : 'Active') : (locale === 'zh' ? '防御武装' : 'Armed')}
                </span>
              </div>

              <div className="space-y-4">
                {/* Header Profile with Icons */}
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    agent.id === 'spec-agent' ? 'bg-brand-purple/10 border-brand-purple/20 text-brand-purple' :
                    agent.id === 'audit-agent' ? 'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan' :
                    'bg-brand-rose/10 border-brand-rose/20 text-brand-rose'
                  }`}>
                    {agent.id === 'spec-agent' ? <Sparkles className="w-5 h-5" /> :
                     agent.id === 'audit-agent' ? <Cpu className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm text-white group-hover:text-white">
                      {locale === 'zh' ? agent.name.zh : agent.name.en}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[9px] text-slate-500 font-bold">
                      <span className="text-slate-350 bg-slate-900 px-1 rounded border border-slate-850">{agent.version}</span>
                      <span>•</span>
                      <span>{agent.model}</span>
                    </div>
                  </div>
                </div>

                {/* Role Description */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block font-mono">
                    {locale === 'zh' ? '角色分工' : 'Specialist Role'}
                  </span>
                  <p className="text-white font-medium">
                    {locale === 'zh' ? agent.role.zh : agent.role.en}
                  </p>
                </div>

                {/* Core Mission */}
                <p className="text-xs text-slate-400 leading-relaxed min-h-[64px]">
                  {locale === 'zh' ? agent.mission.zh : agent.mission.en}
                </p>

                {/* Sub Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {agent.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-slate-850/60 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Performance Indicator Footer */}
              <div className="mt-5 pt-4 border-t border-slate-850/60 grid grid-cols-3 gap-1 grid-flow-row leading-tight font-mono text-center">
                <div className="text-[9px]">
                  <span className="text-slate-500 uppercase block font-semibold scale-90">{locale === 'zh' ? '调用频次' : 'Invocations'}</span>
                  <span className="text-slate-300 font-bold mt-1 block">{agent.performance.invocations.toLocaleString()}</span>
                </div>
                <div className="text-[9px]">
                  <span className="text-slate-500 uppercase block font-semibold scale-90">{locale === 'zh' ? '响应延迟' : 'Latency'}</span>
                  <span className="text-brand-purple font-bold mt-1 block">{agent.performance.speed}</span>
                </div>
                <div className="text-[9px]">
                  <span className="text-slate-500 uppercase block font-semibold scale-90">{locale === 'zh' ? '评判精度SLA' : 'SLA Target'}</span>
                  <span className="text-brand-emerald font-bold mt-1 block">{agent.performance.accuracy}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Columns: Live Telemetry logs & Sandbox suite */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Sandbox Playground (7/12) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-850/60 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-brand-purple" />
              <h2 className="font-display font-semibold text-sm text-white">
                {locale === 'zh' ? 'Agent Spec Sandbox 代理测试沙盒' : 'Agent Playground Sandbox'}
              </h2>
            </div>
            <div className="text-[9px] font-mono text-slate-550 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded">
              {locale === 'zh' ? '💡 安全隔离调试环境' : '💡 Isolated Safe Playground'}
            </div>
          </div>

          {/* Selector Tabs Inside SandBox */}
          <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 border border-slate-850/80 rounded-lg">
            {agents.map(a => (
              <button
                key={a.id}
                onClick={() => setSandboxSelectedAgent(a.id)}
                disabled={isSimulating}
                className={`py-2 text-[11px] font-mono rounded font-bold uppercase transition ${
                  sandboxSelectedAgent === a.id
                    ? 'bg-slate-900 text-white border border-slate-800 shadow'
                    : 'text-slate-500 hover:text-slate-350'
                }`}
              >
                {a.id === 'spec-agent' ? (locale === 'zh' ? '规格设计代理' : 'Spec Agent') :
                 a.id === 'audit-agent' ? (locale === 'zh' ? '智能审计代理' : 'AI Auditor') : (locale === 'zh' ? '去中心判定' : 'Arbitrator')}
              </button>
            ))}
          </div>

          {/* Quick presets helper bubbles */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-500 uppercase block font-bold">
              {locale === 'zh' ? '选择测试用例预设' : 'Quick Demo Prompt Presets'}
            </label>
            <div className="flex flex-wrap gap-2">
              {sandboxSelectedAgent === 'spec-agent' ? (
                <>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '设计一个识别胸透诊断病情的图像分类器验收规范' : 'Image classifier for chest pneumonia scans with bounding weights')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # Chest XRay Scan Model
                  </button>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '提取100个德语法律合同的关键实体与违约金解析' : 'German Legal Contract intent transcription for penalty fine items')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # German Legal Entities
                  </button>
                </>
              ) : sandboxSelectedAgent === 'audit-agent' ? (
                <>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '审计矿工提交的 Solidity 智能合约漏洞报告 (sub_sec_42)' : 'Verify vulnerability assertions in Solidity security audit logs')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # Solidity Audit Check
                  </button>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '扫描并模糊校验古籍OCR识别输出的宋代碑文翻译段落' : 'OCR Transcript fuzzy diff match validation for ancient text scans')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # OCR Chinese Translation
                  </button>
                </>
              ) : (
                <>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '对 Vali-Malicious (0x9999) 刷分异常行为(共谋评分 92/AI判定 30)执行声誉裁扣' : 'Enforce slash judgment on Vali-Malicious (0x9999) collusion on sub-2')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # Sybil Collusion Slash
                  </button>
                  <button 
                    disabled={isSimulating}
                    onClick={() => handlePresetLoad(locale === 'zh' ? '争议仲裁：矿工申诉验证者故意打低分的情况 (sub-39b)' : 'Appeal arbitration: miner appeal on unfair evaluation rating on sub-39b')}
                    className="text-[9px] bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 font-mono px-2 py-1 rounded transition"
                  >
                    # Miner Low Rate Dispute
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Sandbox interactive prompt input */}
          <div className="space-y-1.5 relative">
            <textarea
              rows={3}
              value={sandboxPrompt}
              disabled={isSimulating}
              onChange={(e) => setSandboxPrompt(e.target.value)}
              placeholder={locale === 'zh' ? '在这里输入模拟提示词或挑选预设进行代理测试...' : 'Input prompt simulation text here or load presets ...'}
              className="w-full text-xs bg-slate-950 border border-slate-850/80 hover:border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-white transition outline-none resize-none font-sans"
            />
            <button
              onClick={runSandboxSimulation}
              disabled={!sandboxPrompt.trim() || isSimulating}
              className={`absolute right-3.5 bottom-4 py-1.5 px-4 rounded-lg text-xs font-bold font-mono transition flex items-center gap-1.5 border ${
                sandboxPrompt.trim() && !isSimulating
                  ? 'bg-brand-indigo/10 hover:bg-brand-indigo/20 text-indigo-400 border-brand-indigo/30'
                  : 'bg-slate-950 text-slate-650 border-slate-900 cursor-not-allowed'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {locale === 'zh' ? '执行决策中' : 'Synthesizing...'}
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition" />
                  {locale === 'zh' ? '唤醒决策' : 'Awake Node'}
                </>
              )}
            </button>
          </div>

          {/* Simulation console console screen */}
          {simulationLogs.length > 0 && (
            <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 font-mono text-[10px] space-y-2.5 overflow-hidden">
              <div className="flex items-center gap-1.5 text-indigo-400 border-b border-slate-900 pb-2">
                <Terminal className="w-3.5 h-3.5 shrink-0" />
                <span>SANDBOX TELEMETRY COMPILE LOGS</span>
              </div>
              <div className="h-32 overflow-y-auto space-y-1.5 leading-snug font-medium select-text">
                {simulationLogs.map((logStr, i) => (
                  <div key={i} className="text-slate-400">
                    <span className="text-slate-650 mr-1.5">›</span>
                    {logStr}
                  </div>
                ))}
                {isSimulating && (
                  <div className="text-brand-magenta animate-pulse flex items-center gap-1 text-[10px] text-indigo-400 font-bold">
                    <span className="w-1 h-3.5 bg-indigo-400 inline-block animate-pulse duration-300"></span>
                    <span>AI reasoning and assembling schemas dynamically...</span>
                  </div>
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          )}

          {/* Dynamic Sandbox Result Payload (Outputted strictly with precision) */}
          {simulationResult && !isSimulating && (
            <div className="bg-slate-950 border border-brand-indigo/30 rounded-xl p-5 shadow-2xl relative overflow-hidden animate-scale-up border-dashed select-text">
              <div className="absolute top-0 right-0 py-1 px-3 bg-brand-indigo/10 border-b border-l border-indigo-500/20 text-[8px] font-mono rounded-bl text-indigo-400 uppercase font-bold tracking-widest">
                VERIFIED BY {sandboxSelectedAgent.toUpperCase()}
              </div>

              {/* IF SPEC AGENT RESULT */}
              {sandboxSelectedAgent === 'spec-agent' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '检测用例' : 'Target Use Case Title'}</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{simulationResult.title}</span>
                  </div>

                  {/* Multi-hop weighting */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '评分权重标准 (Scoring Schema)' : 'Scoring Dimensions Schema'}</span>
                    <div className="grid grid-cols-1 gap-2">
                      {simulationResult.dimensions.map((dim: any, dIdx: number) => (
                        <div key={dIdx} className="bg-slate-900/60 p-2.5 rounded border border-slate-850 flex justify-between items-center text-xs">
                          <span className="text-slate-300 truncate pr-3">{dim.name}</span>
                          <span className="text-indigo-400 font-mono font-bold shrink-0">{dim.weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="space-y-1.5 pb-2">
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '验证者审查要素 Checklist' : 'Validator Verification Checklist'}</span>
                    <ul className="space-y-1.5 text-xs text-slate-400">
                      {simulationResult.checklist.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-brand-emerald shrink-0 mt-0.5" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pact policies draft snippet */}
                  <div className="pt-3.5 border-t border-slate-900 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-900/55 p-2 rounded">
                      <span className="text-[8px] uppercase font-mono text-slate-500 block">{locale === 'zh' ? '放款最低分 (SLA)' : 'Pass Threshold'}</span>
                      <span className="text-white font-mono font-bold block mt-1">{simulationResult.pactDraft.refundLine}</span>
                    </div>
                    <div className="bg-slate-900/55 p-2 rounded">
                      <span className="text-[8px] uppercase font-mono text-slate-500 block">{locale === 'zh' ? 'Pact 托管押金' : 'Escrow Deposit'}</span>
                      <span className="text-brand-cyan font-mono font-bold block mt-1">{simulationResult.pactDraft.deposit}</span>
                    </div>
                    <div className="bg-slate-900/55 p-2 rounded">
                      <span className="text-[8px] uppercase font-mono text-slate-500 block">{locale === 'zh' ? '策略契约守门人' : 'Policy Handler'}</span>
                      <span className="text-brand-purple font-mono font-bold block mt-1">{simulationResult.pactDraft.rule}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* IF AUDITOR NODE RESULT */}
              {sandboxSelectedAgent === 'audit-agent' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '提交测试上下文' : 'Scrutiny Submission context'}</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{simulationResult.title}</span>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-850 grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase font-mono text-slate-500 block">{locale === 'zh' ? '审计引擎自检状态' : 'Scan Output Health'}</span>
                      <span className="text-brand-emerald text-xs font-mono font-bold block">{simulationResult.evaluation.scrutinyStatus}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[8px] uppercase font-mono text-slate-500 block">{locale === 'zh' ? 'AI 审计参考基准分' : 'AI Reference Score'}</span>
                      <span className="text-brand-cyan text-xs font-mono font-bold block">{simulationResult.evaluation.aiScore} / 100</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '自然语言审计推演' : 'Reasoning & Discrepancy Breakdown'}</span>
                    <p className="text-slate-400 leading-relaxed bg-slate-900/40 p-3 rounded border border-slate-850">
                      {simulationResult.evaluation.explanation}
                    </p>
                  </div>

                  <div className="p-2.5 bg-indigo-950/20 border border-indigo-500/20 rounded-md text-[10px] font-mono text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-cyan shrink-0" />
                    <span>{simulationResult.evaluation.payoutAction}</span>
                  </div>
                </div>
              )}

              {/* IF ARBITRATOR RESULT */}
              {sandboxSelectedAgent === 'dispute-arbitrator' && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '纠纷申诉背景' : 'Appealing / Consensal Context'}</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{simulationResult.title}</span>
                  </div>

                  <div className="p-3 bg-red-950/20 border border-red-500/20 text-brand-rose rounded-lg text-xs font-mono font-bold space-y-1">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{locale === 'zh' ? '偏差触发严重告警' : 'CRITICAL INTEGRITY OUTLIER DETECTED'}</span>
                    </div>
                    <span className="text-slate-400 text-[10px] block font-light mt-1 pl-5">{simulationResult.arbitration.flaggedDiff}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
                    <span className="text-[9px] uppercase font-mono text-slate-500 font-bold block">{locale === 'zh' ? '仲裁判定与罚扣结算' : 'Arbitration Ruling'}</span>
                    <div className="bg-slate-900/60 p-3.5 rounded border border-slate-850/80 space-y-2">
                      <p>
                        {simulationResult.arbitration.sentinelVerdict}
                        <span className="text-brand-rose font-mono font-bold">{simulationResult.arbitration.reputationSlash}</span>
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">
                        {locale === 'zh' ? '执行结果：' : 'Result Enforcement: '}
                        <span className="text-slate-350">{simulationResult.arbitration.depositSlash}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Telemetry monitor frame (5/12) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-850/60 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand-cyan" />
              <h2 className="font-display font-semibold text-sm text-white">
                {locale === 'zh' ? 'Agents Live Telemetry 代理指令执行流' : 'Agents Live Telemetry Feed'}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping"></span>
              <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {locale === 'zh' ? '全时监听' : 'SENSORS LIVE'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            {locale === 'zh' 
              ? '实时打印去中心化智能自治层（SLA Arbitrum Nova Devnet）广播的各智算代理日志，通过密码学评估保障整个评分清退与放款链条的防谋抗性。'
              : 'Real-time cryptographic telemetry logs parsed from computing pools. All decisions, rating checks, and slashes are auditable.'}
          </p>

          <div className="bg-slate-950 rounded-xl p-3 border border-slate-850/90 h-[470px] overflow-y-auto space-y-3.5 select-text font-mono text-[10px]">
            {telemetryLogs.map((log, index) => (
              <div 
                key={index}
                className="p-2.5 rounded-lg border bg-slate-900/40 relative overflow-hidden flex flex-col gap-1.5 transition duration-150 border-slate-900 hover:border-slate-800"
              >
                {/* Horizontal status border indicator */}
                <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
                  log.type === 'success' ? 'bg-brand-emerald' :
                  log.type === 'alert' ? 'bg-brand-rose animate-pulse' : 'bg-brand-indigo'
                }`}></div>

                <div className="flex justify-between items-center pl-1 text-[9px] text-slate-500 font-bold">
                  <span className={`uppercase tracking-wider ${
                    log.type === 'success' ? 'text-brand-emerald' :
                    log.type === 'alert' ? 'text-brand-rose' : 'text-indigo-400'
                  }`}>
                    {log.type === 'success' ? '✔️ Consensus OK' :
                     log.type === 'alert' ? '⚠️ Violation Guard' : 'ℹ️ System State'}
                  </span>
                  <span>{log.time}</span>
                </div>

                <p className="pl-1 text-slate-350 leading-relaxed font-sans font-medium text-[11px]">
                  {log.text}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>{locale === 'zh' ? '全网累计触发审计数:' : 'Total Audits Triggered:'}</span>
            <span className="text-slate-300 font-bold">40,172 {locale === 'zh' ? '次' : 'runs'}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
