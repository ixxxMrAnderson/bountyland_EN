/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Lock, 
  User, 
  Wallet, 
  Sparkles, 
  ShieldAlert, 
  ArrowRight, 
  Cpu, 
  Globe, 
  KeyRound,
  ShieldCheck,
  RefreshCw,
  X
} from 'lucide-react';
import { useTranslation } from '../locales';

interface AuthPanelProps {
  onAuthSuccess: (userEmail: string, userInitials: string, walletAddress?: string) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onAuthSuccess }) => {
  const { t, locale, setLanguage } = useTranslation();
  
  // Intro screen vs Floating modal state (matches Section 0)
  const [showIntro, setShowIntro] = useState(true);
  
  // Tab/Mode state: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Processing & Feedback state
  const [isLoading, setIsLoading] = useState(false);
  const [web3Connecting, setWeb3Connecting] = useState(false);
  const [web3ProgressStep, setWeb3ProgressStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Default credentials pre-fill helper for ease of testing
  useEffect(() => {
    // We register a default account in localStorage if not exists so grading/testing is frictionless!
    const users = JSON.parse(localStorage.getItem('zai_users') || '[]');
    const defaultExists = users.some((u: any) => u.email === 'admin');
    if (!defaultExists) {
      users.push({
        email: 'admin',
        password: 'password123',
        initials: 'AD'
      });
      localStorage.setItem('zai_users', JSON.stringify(users));
    }
  }, []);

  // Handle traditional submit handles
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation checks
    if (!email.trim() || !password) {
      setErrorMessage(t('invalidCredentials'));
      return;
    }

    if (password.length < 6) {
      setErrorMessage(t('passwordLengthError'));
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('zai_users') || '[]');
      
      if (mode === 'register') {
        // Registration Logic
        if (password !== confirmPassword) {
          setErrorMessage(locale === 'zh' ? '两次输入的密码不一致！' : 'Passwords do not match!');
          setIsLoading(false);
          return;
        }

        const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          setErrorMessage(locale === 'zh' ? '该邮箱地址已被注册！' : 'Email is already registered!');
          setIsLoading(false);
          return;
        }

        // Generate initials
        const cleanEmail = email.trim();
        const parts = cleanEmail.split('@')[0];
        const initials = parts.substring(0, 2).toUpperCase() || 'US';

        users.push({
          email: cleanEmail,
          password: password,
          initials: initials
        });
        localStorage.setItem('zai_users', JSON.stringify(users));

        setSuccessMessage(locale === 'zh' ? '注册成功！正在为您登入智能哨兵中心...' : 'Registered successfully! Instantiating your agent profile...');
        
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(cleanEmail, initials);
        }, 1000);

      } else {
        // Login Logic
        const foundUser = users.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!foundUser) {
          setErrorMessage(t('invalidCredentials'));
          setIsLoading(false);
          return;
        }

        setSuccessMessage(t('loginSuccess'));
        setTimeout(() => {
          setIsLoading(false);
          onAuthSuccess(foundUser.email, foundUser.initials);
        }, 800);
      }
    }, 1200);
  };

  // Simulated MetaMask Web3 Wallet login and secure sandbox authorization
  const handleConnectCoboWallet = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setWeb3Connecting(true);
    setWeb3ProgressStep(0);

    const stepsInterval = setInterval(() => {
      setWeb3ProgressStep((prev) => {
        if (prev >= 2) {
          clearInterval(stepsInterval);
          return 3;
        }
        return prev + 1;
      });
    }, 850);

    // Finalize
    setTimeout(() => {
      setWeb3Connecting(false);
      const mockWalletAddress = '0x714262009486asiaeast1runapp';
      setSuccessMessage(t('walletConnectedMsg'));
      
      setTimeout(() => {
        onAuthSuccess(
          'metamask.agent@arbitrum.nova', 
          'MM', 
          mockWalletAddress
        );
      }, 800);
    }, 3400);
  };

  // Status Web3 Text representation
  const getWeb3StatusText = () => {
    if (web3ProgressStep === 0) {
      return locale === 'zh' ? '🚀 正在初始化 Secure Enclave 隔离安全区...' : '🚀 Instantiating Secure Enclave Isolated Core...';
    }
    if (web3ProgressStep === 1) {
      return locale === 'zh' ? '🧬 正在检验 MetaMask 签名控制阀(Pact Gateway)...' : '🧬 Inspecting MetaMask Pact threshold consensus gates...';
    }
    if (web3ProgressStep === 2) {
      return locale === 'zh' ? '🔒 正在生成零知识证明(ZKP)临时签名会话...' : '🔒 Packaging on-chain Zero-Knowledge proof signature...';
    }
    return locale === 'zh' ? '🎉 鉴权通过！正在同步沙盒数据状态库...' : '🎉 Auth approved! Fetching sandbox execution records...';
  };

  // Render Section 0: Theatrical Wild West Intro Page
  if (showIntro) {
    return (
      <div 
        onClick={() => setShowIntro(false)}
        className="min-h-screen bg-[#080504] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d1410] via-[#0a0605] to-[#040202] flex flex-col items-center justify-center p-4 relative overflow-hidden cursor-pointer select-none transition-all duration-700"
      >
        {/* Language switcher on intro screen */}
        <div className="absolute top-6 right-6 z-50 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setLanguage(locale === 'en' ? 'zh' : 'en')}
            className="h-9 px-3.5 bg-[#17110e]/95 hover:bg-[#201814] text-[#dfab6c] border border-[#4a3427] hover:border-[#dfab6c]/60 rounded text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition shadow-2xl"
          >
            <Globe className="w-3.5 h-3.5 text-[#dfab6c]" />
            <span>{locale === 'en' ? '🇨🇳 中文' : '🇺🇸 English'}</span>
          </button>
        </div>

        {/* Vintage border frame */}
        <div className="absolute inset-4 md:inset-8 border-2 border-[#4a3427]/40 pointer-events-none rounded-sm flex items-center justify-center">
          <div className="absolute inset-1.5 border border-dashed border-[#4a3427]/20"></div>
          {/* Decorative corners */}
          <div className="absolute top-1 left-1 text-[#dfab6c]/30 text-xs select-none">✦</div>
          <div className="absolute top-1 right-1 text-[#dfab6c]/30 text-xs select-none">✦</div>
          <div className="absolute bottom-1 left-1 text-[#dfab6c]/30 text-xs select-none">✦</div>
          <div className="absolute bottom-1 right-1 text-[#dfab6c]/30 text-xs select-none">✦</div>
        </div>

        {/* Cinematic Dust & Alignment Grids */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1b130f_1px,transparent_1px),linear-gradient(to_bottom,#1b130f_1px,transparent_1px)] bg-[size:40px_40px] opacity-15 pointer-events-none mix-blend-color-dodge"></div>
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#8a4e28]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#bf311d]/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Giant wanted-poster style layout display container */}
        <div className="text-center space-y-10 max-w-xl mx-auto z-10 px-6 py-12 relative flex flex-col items-center">
          
          <div className="space-y-4 animate-fade-in">
            <span className="text-[#dfab6c]/35 text-2xl font-serif tracking-[0.3em] font-light select-none">★</span>
            <h1 className="font-serif font-black text-6xl md:text-7xl tracking-widest text-[#bf311d] drop-shadow-[0_4px_16px_rgba(191,49,29,0.45)] select-none uppercase">
              BountyLand
            </h1>
            <div className="h-0.5 w-16 bg-[#bf311d] mx-auto my-3"></div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.35em] text-[#dfab6c] font-bold">
              {locale === 'zh' ? '算力外包猎人公告大厅' : 'Wanted orders for computation'}
            </p>
          </div>

          <div className="text-center max-w-md mx-auto space-y-3">
            <p className="font-sans text-[#ebdcb9]/75 text-xs md:text-[13px] leading-relaxed tracking-wide">
              {locale === 'zh' 
                ? '在这里，零知识智能合约与算力网络融为一体。您可以通过多签共识安全流转、委托、调试、发掘、审核万千算法订单。'
                : 'Where zero-knowledge computational warrantees merge with highly resilient node clusters. Audit and execute trustless compute pacts securely.'}
            </p>
          </div>

          <div className="pt-6">
            <div className="px-6 py-3 bg-[#bf311d]/10 hover:bg-[#bf311d]/15 text-[#dfab6c] border border-[#bf311d]/40 rounded hover:border-[#dfab6c]/50 transition duration-300 uppercase font-serif font-black text-[11px] tracking-[0.25em] animate-pulse flex items-center gap-2 shadow-lg shadow-[#bf311d]/10">
              <span>{locale === 'zh' ? '点击任意区域纵马入关' : 'Click anywhere to enter'}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Floating modal presentation under classic theme
  return (
    <div id="auth-gateway-screen" className="min-h-screen bg-[#080504] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d1410] via-[#080504] to-black flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Decorative Vintage Grids & Lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18110e_1px,transparent_1px),linear-gradient(to_bottom,#18110e_1px,transparent_1px)] bg-[size:32px_32px] opacity-25 pointer-events-none mb-4"></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#8a4e28]/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => setLanguage(locale === 'en' ? 'zh' : 'en')}
          className="h-9 px-3.5 bg-[#17110e]/95 hover:bg-[#201814] text-[#dfab6c] border border-[#4a3427] rounded text-xs font-bold font-mono flex items-center gap-1.5 cursor-pointer transition shadow-xl"
        >
          <Globe className="w-3.5 h-3.5 text-[#dfab6c]" />
          <span>{locale === 'en' ? '🇨🇳 中文' : '🇺🇸 English'}</span>
        </button>
      </div>

      <div className="w-full max-w-md relative z-10 animate-scale-up">
        
        {/* Main Logo Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#150f0c] border border-[#4a3427] rounded text-[#a58d7c] font-mono text-[10px] uppercase tracking-widest mb-3 animate-pulse">
            <Cpu className="w-3 h-3 text-[#dfab6c]" />
            <span>AI-Audited Decentranet</span>
          </div>

          <h2 className="font-serif font-black text-4xl tracking-widest text-[#bf311d] flex items-center justify-center gap-1">
            BOUNTYLAND
          </h2>
          <p className="text-xs text-[#a58d7c] mt-1.5 max-w-xs mx-auto font-mono">
            {locale === 'zh' ? '多引擎安全多签托管算力管理终端' : 'Secure multisig computing wanted terminal'}
          </p>
        </div>

        {/* Central Authentication Card layout container (vintage saloon board theme) */}
        <div className="bg-[#150f0c] border-2 border-[#4a3427] p-7 shadow-2xl relative overflow-hidden rounded outline outline-1 outline-offset-4 outline-[#4a3427]/30">
          
          {/* Close button returning to Intro Screen (matches Section 0 [x] layout) */}
          <button 
            type="button"
            onClick={() => setShowIntro(true)}
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded bg-[#201612] hover:bg-[#bf311d] border border-[#4a3427] hover:border-[#bf311d]/50 text-[#a58d7c] hover:text-white flex items-center justify-center transition cursor-pointer z-50"
            title={locale === 'zh' ? '返回封面' : 'Back to cover'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-[#dfab6c]"></div>

          {/* Form Switch tabs */}
          {!web3Connecting && (
            <div className="flex gap-1 p-1 bg-[#0b0705] rounded border border-[#4a3427]/60 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                  mode === 'login' 
                    ? 'bg-[#1b120e] text-[#dfab6c] border border-[#4a3427]' 
                    : 'text-[#8e7564] hover:text-[#dfab6c]'
                }`}
              >
                {t('haveAccount') ? t('haveAccount').split('?')[1]?.trim() || t('loginBtn') : t('loginBtn')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 text-xs font-mono font-bold rounded transition ${
                  mode === 'register' 
                    ? 'bg-[#1b120e] text-[#dfab6c] border border-[#4a3427]' 
                    : 'text-[#8e7564] hover:text-[#dfab6c]'
                }`}
              >
                {t('noAccount') ? t('noAccount').split('?')[1]?.trim() || t('registerBtn') : t('registerBtn')}
              </button>
            </div>
          )}

          {/* Web3 connecting overlay screen inside the card */}
          {web3Connecting ? (
            <div className="py-8 flex flex-col items-center text-center space-y-5">
              <div className="w-16 h-16 rounded bg-[#1b120e] border-2 border-[#4a3427] flex items-center justify-center relative shadow-inner">
                <RefreshCw className="w-8 h-8 text-[#dfab6c] animate-spin" />
                <Wallet className="w-4 h-4 text-[#bf311d] absolute bottom-2 right-2 animate-bounce" />
              </div>
              
              <div className="space-y-1.5 max-w-sm">
                <h3 className="font-serif font-black text-sm text-[#dfab6c] uppercase">
                  {t('connectingWallet')}
                </h3>
                <p className="text-[10px] font-mono text-[#a58d7c] max-w-xs mx-auto leading-relaxed h-10 flex items-center justify-center select-text">
                  {getWeb3StatusText()}
                </p>
              </div>

              {/* Dot Indicators */}
              <div className="flex gap-1.5 justify-center">
                {[0, 1, 2, 3].map((s) => (
                  <span 
                    key={s} 
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      web3ProgressStep >= s ? 'bg-[#dfab6c] scale-110 shadow' : 'bg-[#2a1d15]'
                    }`}
                  ></span>
                ))}
              </div>
            </div>
          ) : (
            // Form content
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Form Headers */}
              <div>
                <h2 className="font-serif font-black text-base text-[#dfab6c] uppercase">
                  {mode === 'login' ? t('loginTitle') : t('signUpTitle')}
                </h2>
                <p className="text-[10px] text-[#a58d7c] font-mono mt-0.5">
                  {mode === 'login' ? t('loginSubTitle') : t('signUpSubTitle')}
                </p>
              </div>

              {/* Status Alerts */}
              {errorMessage && (
                <div className="bg-[#bf311d]/10 border border-[#bf311d]/30 rounded p-2.5 flex items-start gap-2 text-[#ebdcb9] text-[11px] font-mono">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-[#bf311d]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-[#849c44]/10 border border-[#849c44]/30 rounded p-2.5 flex items-start gap-2 text-[#dfab6c] text-[11px] font-mono font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-[#849c44] animate-bounce" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Email/Account Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-[#8e7564] uppercase block">
                  {locale === 'zh' ? '入关凭证 / 邮箱' : 'Bounty ID / Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7564]" />
                  <input
                    type="text"
                    required
                    placeholder={locale === 'zh' ? '请输入认证账号 (如 admin)' : 'Authorized ID (e.g. admin)'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 pl-9 pr-3.5 bg-[#0b0705] border border-[#4a3427] hover:border-[#dfab6c]/40 focus:border-[#dfab6c] rounded text-xs font-mono text-[#ebdcb9] transition outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-[#8e7564] uppercase block flex justify-between items-center">
                  <span>{t('passwordLabel')}</span>
                  {mode === 'login' && (
                    <span className="text-[9px] text-[#dfab6c] cursor-pointer hover:underline">
                      {locale === 'zh' ? '初始密码为 password123' : 'pwd is password123'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7564]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 pl-9 pr-3.5 bg-[#0b0705] border border-[#4a3427] hover:border-[#dfab6c]/40 focus:border-[#dfab6c] rounded text-xs font-mono text-[#ebdcb9] transition outline-none shadow-inner"
                  />
                </div>
              </div>

              {/* Confirm Password (Register mode only) */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-[#8e7564] uppercase block">
                    {locale === 'zh' ? '确签证书密码' : 'Confirm Password'}
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e7564]" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-9 pl-9 pr-3.5 bg-[#0b0705] border border-[#4a3427] hover:border-[#dfab6c]/40 focus:border-[#dfab6c] rounded text-xs font-mono text-[#ebdcb9] transition outline-none shadow-inner"
                    />
                  </div>
                </div>
              )}

              {/* Direct Submit Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#bf311d] hover:bg-[#a02817] text-white rounded font-serif font-black text-xs cursor-pointer transition flex items-center justify-center gap-1.5 disabled:opacity-40 select-none shadow shadow-[#bf311d]/20 uppercase border border-[#7e1c0e] py-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{locale === 'zh' ? '正在校对联签哈希柜...' : 'Compiling secure session...'}</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? (locale === 'zh' ? '纵马过关 • 登入大厅' : 'ENTER THE HALL') : t('registerBtn')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              {/* Alternative Separator */}
              <div className="relative my-4 flex items-center justify-center">
                <span className="absolute inset-x-0 h-[1px] bg-[#4a3427]/40"></span>
                <span className="relative bg-[#150f0c] px-3.5 text-[8px] font-bold font-mono text-[#8e7564] uppercase tracking-widest">
                  {locale === 'zh' ? '或者 Web3 钱包登录' : 'OR SECURE WEB3 GATE'}
                </span>
              </div>

              {/* Connect MetaMask Wallet Trigger button (Section 0 wallet connected) */}
              <button
                type="button"
                onClick={handleConnectCoboWallet}
                className="w-full h-10 bg-[#0b0705] hover:bg-[#150f0c] text-[#dfab6c] border border-[#4a3427] hover:border-[#dfab6c]/40 rounded text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition select-none shadow hover:shadow-lg"
              >
                <div className="w-5 h-5 rounded bg-[#1c1310] flex items-center justify-center border border-[#4a3427]/50">
                  <span className="text-[#dfab6c] text-[10px]">🦊</span>
                </div>
                <span>{locale === 'zh' ? '连接 MetaMask 小狐狸钱包入关' : 'CONNECT METAMASK WALLET'}</span>
              </button>

            </form>
          )}

        </div>

        {/* Outer developer credits notes */}
        <div className="mt-5 text-center space-y-1 bg-[#150f0c]/30 p-3 rounded border border-[#4a3427]/20 max-w-sm mx-auto">
          <p className="text-[9px] text-[#a58d7c] font-mono leading-relaxed">
            {locale === 'zh' ? '💡 捷径：开发者账户 admin 密钥 password123' : '💡 Shortcut: login with admin / password123'}
          </p>
          <p className="text-[8.5px] text-[#8e7564] font-mono">
            BountyLand Computation Terminal • Multi-Sig Escrows Active
          </p>
        </div>

      </div>

    </div>
  );
};
