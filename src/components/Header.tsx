import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store';
import { getConfig } from '../config';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthGuard';

export function Header() {
  const { theme, setTheme } = useTheme();
  const embedMode = useAppStore((s) => s.embedMode);
  const config = getConfig();
  const [scrolled, setScrolled] = useState(false);
  
  // 获取认证相关功能（仅在密码保护启用时可用）
  const auth = config.enablePasswordProtection ? useAuth() : null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (embedMode) return null;

  return (
    <header 
      className={`relative z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 dark:bg-purple-900/30 backdrop-blur-xl shadow-lg border-b border-pink-200/50 dark:border-purple-700/30' 
          : 'bg-transparent'
      }`} 
      role="banner"
    >
      {/* 跳过链接 */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 
                   bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg z-50"
      >
        跳到主要内容
      </a>
      
      {/* 渐变背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-400/10 via-purple-500/10 to-blue-500/10 dark:from-pink-400/5 dark:via-purple-500/5 dark:to-blue-500/5"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-pink-400/5 via-transparent to-transparent"></div>
      </div>
      
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10" aria-label="主导航">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Logo图标 */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {config.siteName}V4.0
                </h1>
                <p className="text-sm text-purple-600 dark:text-purple-300 hidden sm:block">
                  {config.siteDescription}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 在线状态指示器 */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100/80 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium backdrop-blur-sm border border-green-200/50 dark:border-green-800/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              系统在线
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm font-medium backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30">
              <a href='https://tbmiao.dpdns.org' target='_blank' rel='noopener noreferrer' className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                回到主站
              </a>
            </div>
            
            {/* 退出登录按钮（仅在密码保护启用时显示） */}
            {auth && (
              <button
                onClick={auth.onLogout}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium backdrop-blur-sm border border-red-200/50 dark:border-red-800/30 hover:bg-red-200/80 dark:hover:bg-red-800/40"
                title="退出登录"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出登录
              </button>
            )}
            
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </nav>
    </header>
  );
}

function ThemeToggle({
  theme,
  setTheme,
}: {
  theme: string;
  setTheme: (t: 'light' | 'dark' | 'system') => void;
}) {
  const nextTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const themeLabel = theme === 'system' ? '跟随系统' : theme === 'dark' ? '深色模式' : '浅色模式';
  
  return (
    <button
      onClick={nextTheme}
      className="group relative p-2.5 rounded-xl bg-white/50 dark:bg-purple-800/50 backdrop-blur-sm 
                 border border-pink-200/50 dark:border-purple-700/30 
                 hover:bg-white/70 dark:hover:bg-purple-800/70"
      title={`当前: ${themeLabel}，点击切换`}
      aria-label={`切换主题，当前: ${themeLabel}`}
    >
      <div className="relative">
        {theme === 'light' && (
          <svg className="w-5 h-5 text-pink-500 group-hover:text-pink-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
        {theme === 'dark' && (
          <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
        {theme === 'system' && (
          <svg className="w-5 h-5 text-blue-500 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )}
        
        {/* 脉冲动画背景 */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400/20 to-purple-500/20 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
    </button>
  );
}