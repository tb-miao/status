import { useAppStore } from '../store';
import { getConfig } from '../config';

export function Footer() {
  const embedMode = useAppStore((s) => s.embedMode);
  const config = getConfig();

  if (embedMode) return null;

  return (
    <footer className="py-8 text-center text-sm text-slate-500 dark:text-slate-400" role="contentinfo">
      <p>
        基于{' '}
        <a
          href="https://uptimerobot.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:underline"
        >
          UptimeRobot
        </a>
        {' '}接口，检测频率 {config.refetchInterval / 60} 分钟
      </p>
      <p className="mt-1">
        Powered by{' '}
        <a
          href="https://github.com/lyhxx/uptime-status"
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-500 hover:underline"
        >
          Uptime Status
        </a>
      </p>
      <p className="mt-3 flex items-center justify-center gap-4 text-xs">
        <span>
          今日访问 <span id="busuanzi_today_pv" className="text-green-500">-</span> 次
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span>
          总访问 <span id="busuanzi_site_pv" className="text-green-500">-</span> 次
        </span>
      </p>
    </footer>
  );
}
