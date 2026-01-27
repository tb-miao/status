import React, { useState, useEffect, createContext, useContext } from 'react';
import { getConfig } from '../config';
import HCaptchaWrapper from './HCaptchaWrapper';

interface AuthGuardProps {
  children: React.ReactNode;
}

// 创建认证上下文
interface AuthContextType {
  onLogout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 自定义hook使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthGuard');
  }
  return context;
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const config = getConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // 检查是否已经通过认证（使用 sessionStorage）
  useEffect(() => {
    const authStatus = sessionStorage.getItem('uptime-status-authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  // 监听主题变化
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark') ||
                     (document.documentElement.classList.contains('system') && 
                      window.matchMedia('(prefers-color-scheme: dark)').matches);
      setCurrentTheme(isDark ? 'dark' : 'light');
    };

    updateTheme();
    
    // 监听class变化
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', updateTheme);
    };
  }, []);

  // 如果密码保护未启用，直接允许访问
  if (!config.enablePasswordProtection) {
    return <>{children}</>;
  }

  // 处理密码验证
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    // 如果启用了hCaptcha，检查验证码
    if (config.enableHCaptcha && !captchaToken) {
      setError('请完成人机验证');
      return;
    }

    setIsVerifying(true);

    try {
      // 如果启用了hCaptcha，先验证验证码
      if (config.enableHCaptcha && captchaToken) {
        // 这里可以添加服务端验证逻辑
        // 由于是纯前端应用，我们只做基本的客户端验证
        console.log('hCaptcha token:', captchaToken);
      }

      // 验证密码
      if (password === config.password) {
        setIsAuthenticated(true);
        sessionStorage.setItem('uptime-status-authenticated', 'true');
      } else {
        setError('密码错误，请重试');
        setPassword('');
        // 重置hCaptcha
        setCaptchaToken('');
      }
    } catch (error) {
      setError('验证失败，请重试');
      console.error('Verification error:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // 处理退出登录
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('uptime-status-authenticated');
    setPassword('');
    setError('');
    setCaptchaToken('');
  };

  // 处理hCaptcha验证
  const handleCaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    setError(''); // 清除之前的错误
  };

  // 处理hCaptcha过期
  const handleCaptchaExpire = () => {
    setCaptchaToken('');
  };

  // 如果已通过认证，显示内容
  if (isAuthenticated) {
    return (
      <AuthContext.Provider value={{ onLogout: handleLogout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⚙️</div>
          <p className="text-slate-500 dark:text-slate-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 显示密码输入界面
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="glass-card p-8 max-w-md w-full mx-4 animate-bounce-in">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            需要密码访问
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            请输入访问密码以继续
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              placeholder="请输入访问密码"
              autoComplete="current-password"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* hCaptcha 人机验证 */}
          {config.enableHCaptcha && config.hCaptchaSiteKey && (
            <div className="flex justify-center">
              <HCaptchaWrapper
                sitekey={config.hCaptchaSiteKey}
                onVerify={handleCaptchaVerify}
                onExpire={handleCaptchaExpire}
                theme={currentTheme}
                languageOverride="zh-CN"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!password.trim() || (config.enableHCaptcha && !captchaToken) || isVerifying}
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                验证中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                验证并进入
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            忘记密码？请联系网站管理员
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGuard;