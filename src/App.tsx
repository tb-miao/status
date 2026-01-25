import { useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StatsOverview } from './components/StatsOverview';
import { Toolbar } from './components/Toolbar';
import { MonitorList } from './components/MonitorList';
import { IncidentList } from './components/IncidentList';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useMonitors } from './hooks/useMonitors';
import { useNotification } from './hooks/useNotification';
import { useTheme } from './hooks/useTheme';
import { useAppStore } from './store';
import { getConfig } from './config';

function App() {
  useTheme();

  const config = getConfig();
  const embedMode = useAppStore((s) => s.embedMode);
  const setEmbedMode = useAppStore((s) => s.setEmbedMode);

  // 初始化：设置页面标题、描述、检查嵌入模式
  useEffect(() => {
    document.title = config.siteName;

    // 设置 meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', config.siteDescription);
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('embed') === '1') {
      setEmbedMode(true);
    }
  }, [config.siteName, config.siteDescription, setEmbedMode]);

  const {
    monitors,
    allMonitors,
    isLoading,
    isFetching,
    isError,
    error,
    stats,
    incidents,
    lastUpdated,
    refetch,
  } = useMonitors();

  // 状态变化通知
  useNotification(allMonitors);

  const showLink = config.showLink;

  // 检查是否配置了 API Key
  const hasApiKey = config.apiKeys && config.apiKeys.length > 0 && 
    config.apiKeys.some(key => key && key !== 'your-api-key');

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="glass-card p-8 max-w-md text-center animate-bounce-in">
          <div className="text-6xl mb-6 animate-slow-spin">⚙️</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            请配置 API Key
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            请在 <code className="bg-slate-100/50 dark:bg-slate-700/50 px-2 py-1 rounded-lg font-mono text-sm backdrop-blur-sm">src/config/config.ts</code> 中配置 UptimeRobot API Key
          </p>
          <a
            href="https://uptimerobot.com/dashboard#mySettings"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            获取 API Key
          </a>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" role="alert">
        <div className="glass-card p-8 max-w-md text-center animate-bounce-in">
          <div className="text-6xl mb-6 animate-bounce">😢</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-red-600 to-red-400 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent">
            加载失败
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
            {error instanceof Error ? error.message : '无法获取监控数据'}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            已自动重试 2 次，请检查网络连接或 API 配置
          </p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 ${embedMode ? 'p-4' : ''}`}>
        <Header />
        
        <main id="main-content" className={`max-w-7xl mx-auto px-4 ${embedMode ? '' : 'pt-6'} pb-8`} role="main">
          {!embedMode && (
            <>
              <StatsOverview {...stats} isLoading={isLoading} />
              <Toolbar onRefresh={refetch} isLoading={isFetching} lastUpdated={lastUpdated} />
            </>
          )}
          
          {/* 嵌入模式简易工具栏 */}
          {embedMode && (
            <div className="flex items-center justify-end gap-2 mb-4">
              <span className="text-xs text-slate-400" aria-live="polite">
                {lastUpdated && `更新于 ${new Date(lastUpdated).toLocaleTimeString('zh-CN')}`}
              </span>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 
                           text-slate-500 hover:text-slate-700 dark:hover:text-slate-300
                           transition-colors disabled:opacity-50"
                title="刷新数据"
                aria-label="刷新监控数据"
              >
                <svg className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          )}

          <div className={`grid ${embedMode ? '' : 'lg:grid-cols-3'} gap-8`}>
            <div className={embedMode ? '' : 'lg:col-span-2'}>
              <MonitorList 
                monitors={monitors} 
                isLoading={isLoading}
                showLink={showLink}
              />
            </div>
            
            {!embedMode && (
              <div className="space-y-6">
                <IncidentList incidents={incidents} isLoading={isLoading} />
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;