import { useState } from 'react';
import type { ProcessedMonitor } from '../types';
import {
  formatDuration,
  formatNumber,
  getStatusText,
  getStatusColor,
  getStatusBgColor,
} from '../utils/format';
import { MonitorDetail } from './MonitorDetail';
import { useAppStore } from '../store';

interface MonitorCardProps {
  monitor: ProcessedMonitor;
  showLink: boolean;
}

export function MonitorCard({ monitor, showLink }: MonitorCardProps) {
  const [expanded, setExpanded] = useState(false);
  const countDays = useAppStore((s) => s.countDays);

  return (
    <article className="border-b border-slate-100 dark:border-slate-700 last:border-b-0">
      <div 
        className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`${monitor.name} - ${getStatusText(monitor.status)}，点击${expanded ? '收起' : '展开'}详情`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(!expanded);
          }
        }}
      >
        {/* 头部信息 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-900 dark:text-white">
              {monitor.name}
            </span>
            {showLink && (
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-green-500 transition-colors"
                aria-label={`访问 ${monitor.name} 网站`}
              >
                <span aria-hidden="true">🔗</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${getStatusColor(monitor.status)}`}>
              {monitor.status === 'ok' && <span className="inline-block animate-pulse">●</span>}
              {monitor.status === 'down' && <span>●</span>}
              {monitor.status === 'paused' && <span>●</span>}
              {monitor.status === 'unknown' && <span>●</span>}
              {' '}{getStatusText(monitor.status)}
            </span>
            <span className="text-slate-400 text-sm">
              {expanded ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* 时间线 */}
        <div className="flex gap-[2px] mb-2">
          {monitor.daily.map((day, idx) => {
            let status = 'none';
            if (day.uptime >= 100) status = 'ok';
            else if (day.uptime > 0 || day.down.times > 0) status = 'down';

            const tooltip = `${day.date.format('YYYY-MM-DD')}\n可用率: ${formatNumber(day.uptime)}%${
              day.down.times > 0 
                ? `\n故障: ${day.down.times}次, ${formatDuration(day.down.duration)}` 
                : ''
            }`;

            return (
              <div
                key={idx}
                className={`status-bar ${getStatusBgColor(status)}`}
                title={tooltip}
              />
            );
          })}
        </div>

        {/* 摘要 */}
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>今天</span>
          <span>
            {monitor.total.times > 0
              ? `最近 ${countDays} 天故障 ${monitor.total.times} 次，累计 ${formatDuration(monitor.total.duration)}，平均可用率 ${monitor.average}%`
              : `最近 ${countDays} 天可用率 ${monitor.average}%`}
          </span>
          <span>{monitor.daily[monitor.daily.length - 1]?.date.format('YYYY-MM-DD')}</span>
        </div>
      </div>

      {/* 展开详情 */}
      {expanded && <MonitorDetail monitor={monitor} />}
    </article>
  );
}
