import type { IncidentEvent } from '../types';
import { formatDuration, formatRelativeTime } from '../utils/format';

interface IncidentListProps {
  incidents: IncidentEvent[];
  isLoading: boolean;
}

export function IncidentList({ incidents, isLoading }: IncidentListProps) {
  if (isLoading) {
    return (
      <div className="card p-4">
        <div className="skeleton h-5 w-32 mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="py-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
            <div className="skeleton h-4 w-32 mb-2" />
            <div className="skeleton h-3 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <div className="card p-6 text-center">
        <p className="text-green-500 font-medium">🎉 最近没有故障事件</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          所有服务运行稳定
        </p>
      </div>
    );
  }

  return (
    <section className="card overflow-hidden" aria-labelledby="incidents-heading">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <h2 id="incidents-heading" className="font-medium text-slate-900 dark:text-white">
          最近故障事件
        </h2>
        <span className="text-xs text-slate-400" aria-label={`共 ${incidents.length} 条故障记录`}>{incidents.length} 条</span>
      </div>
      <ul className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[400px] overflow-y-auto" role="list">
        {incidents.map((incident) => (
          <li 
            key={incident.id} 
            className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            {/* 服务名称 + 持续时间 */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-red-500 text-xs">●</span>
                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">
                  {incident.monitorName}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatDuration(incident.duration)}
              </span>
            </div>
            {/* 时间 + 原因 */}
            <div className="flex items-center justify-between gap-2 pl-4">
              <span className="text-xs text-slate-400">
                {formatRelativeTime(incident.datetime)}
              </span>
              {incident.reason && (
                <span className="text-xs text-red-400 text-right" title={incident.reason}>
                  {incident.reason}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {incidents.length >= 20 && (
        <div className="p-2 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-700">
          仅显示最近 20 条
        </div>
      )}
    </section>
  );
}
