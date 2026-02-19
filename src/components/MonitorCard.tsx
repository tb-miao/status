import { useState, useEffect } from 'react';
import type { ProcessedMonitor } from '../types';
import {
  formatDuration,
  formatNumber,
  getStatusText,
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
  const [animatedUptime, setAnimatedUptime] = useState(0);
  const countDays = useAppStore((s) => s.countDays);

  useEffect(() => {
    // 动画效果：数字递增到实际值
    const timer = setTimeout(() => {
      const duration = 800;
      const steps = 40;
      const increment = monitor.average / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= monitor.average) {
          setAnimatedUptime(monitor.average);
          clearInterval(counter);
        } else {
          setAnimatedUptime(Math.floor(current));
        }
      }, duration / steps);
    }, 100);

    return () => clearTimeout(timer);
  }, [monitor.average]);

  return (
    <article className="anime-card mb-4 overflow-hidden">
      <div 
        className="p-6 cursor-pointer"
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 状态指示器 */}
            <div className={`w-4 h-4 rounded-full ${
              monitor.status === 'ok' ? 'bg-anime-green shadow-lg shadow-anime-green/50' :
              monitor.status === 'down' ? 'bg-anime-red shadow-lg shadow-anime-red/50' :
              monitor.status === 'paused' ? 'bg-anime-yellow shadow-lg shadow-anime-yellow/50' :
              'bg-slate-500 shadow-lg shadow-slate-500/50'
            }`}></div>
            <span className="font-semibold text-purple-900 dark:text-purple-100 text-lg group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
              {monitor.name}
            </span>
            {showLink && (
              <a
                href={monitor.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400"
                aria-label={`访问 ${monitor.name} 网站`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {/* 状态标签 */}
            <div className={`status-indicator ${
              monitor.status === 'ok' ? 'status-up' :
              monitor.status === 'down' ? 'status-down' :
              monitor.status === 'paused' ? 'status-paused' :
              'status-unknown'
            }`}>
              {getStatusText(monitor.status)}
            </div>
            <div className="flex items-center gap-1 text-purple-500 dark:text-purple-300 text-sm">
              <span className="font-medium anime-gradient-text">{animatedUptime}%</span>
              <span className={`${expanded ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </div>
        </div>

        {/* 时间线 - 更现代化的设计 */}
        <div className="flex gap-1 mb-4 p-2 rounded-xl bg-pink-100/50 dark:bg-purple-800/30">
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

        {/* 摘要信息 */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-purple-500 dark:text-purple-400">最近{countDays}天</span>
            <div className="h-1 w-1 rounded-full bg-purple-400"></div>
            <span className="text-purple-700 dark:text-purple-300 font-medium">
              {monitor.total.times > 0
                ? `故障 ${monitor.total.times} 次`
                : '无故障记录'}
            </span>
          </div>
          <div className="text-purple-500 dark:text-purple-400">
            {monitor.daily[monitor.daily.length - 1]?.date.format('MM-DD')}
          </div>
        </div>
      </div>

      {/* 展开详情 */}
      <div className={`${expanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
        {expanded && <MonitorDetail monitor={monitor} />}
      </div>
    </article>
  );
}