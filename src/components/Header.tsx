import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store';
import { getConfig } from '../config';

export function Header() {
  const { theme, setTheme } = useTheme();
  const embedMode = useAppStore((s) => s.embedMode);
  const config = getConfig();

  if (embedMode) return null;

  return (
    <header className="bg-slate-900 text-white relative z-10" role="banner">
      {/* 跳过链接 */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 
                   bg-green-500 text-white px-4 py-2 rounded-lg z-50"
      >
        跳到主要内容
      </a>
      <nav className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between" aria-label="主导航">
        <h1 className="text-xl font-bold text-green-400">{config.siteName}</h1>

        <ThemeToggle theme={theme} setTheme={setTheme} />
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
      className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
      title={`当前: ${themeLabel}，点击切换`}
      aria-label={`切换主题，当前: ${themeLabel}`}
    >
      {theme === 'light' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
      {theme === 'dark' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
      {theme === 'system' && (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}
