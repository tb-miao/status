import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export function formatDuration(seconds: number): string {
  let s = Math.floor(seconds);
  let m = 0;
  let h = 0;
  let d = 0;

  if (s >= 60) {
    m = Math.floor(s / 60);
    s = s % 60;
    if (m >= 60) {
      h = Math.floor(m / 60);
      m = m % 60;
      if (h >= 24) {
        d = Math.floor(h / 24);
        h = h % 24;
      }
    }
  }

  const parts: string[] = [];
  if (d > 0) parts.push(`${d}天`);
  if (h > 0) parts.push(`${h}小时`);
  if (m > 0) parts.push(`${m}分`);
  if (s > 0 || parts.length === 0) parts.push(`${s}秒`);

  return parts.join(' ');
}

export function formatNumber(value: number, decimals = 2): string {
  return (Math.floor(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toString();
}

export function formatDate(timestamp: number): string {
  return dayjs.unix(timestamp).format('YYYY-MM-DD HH:mm:ss');
}

export function formatRelativeTime(timestamp: number): string {
  return dayjs.unix(timestamp).fromNow();
}

export function formatResponseTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusText(status: string): string {
  const map: Record<string, string> = {
    ok: '正常',
    down: '故障',
    paused: '已暂停',
    unknown: '未知',
  };
  return map[status] || '未知';
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ok: 'text-green-500',
    down: 'text-red-500',
    paused: 'text-yellow-500',
    unknown: 'text-gray-500',
  };
  return map[status] || 'text-gray-500';
}

export function getStatusBgColor(status: string): string {
  const map: Record<string, string> = {
    ok: 'bg-green-500',
    down: 'bg-red-500',
    paused: 'bg-yellow-500',
    unknown: 'bg-gray-400',
    none: 'bg-gray-200 dark:bg-gray-700',
  };
  return map[status] || 'bg-gray-400';
}
