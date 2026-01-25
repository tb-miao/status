import type { ProcessedMonitor } from '../types';
import { MonitorCard } from './MonitorCard';
import { MonitorSkeleton } from './MonitorSkeleton';

interface MonitorListProps {
  monitors: ProcessedMonitor[];
  isLoading: boolean;
  showLink: boolean;
}

export function MonitorList({ monitors, isLoading, showLink }: MonitorListProps) {
  if (isLoading) {
    return (
      <div className="glass-card overflow-hidden animate-fade-in">
        {[...Array(4)].map((_, i) => (
          <MonitorSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="glass-card p-8 text-center animate-fade-in">
        <div className="text-4xl mb-4 animate-bounce">🔍</div>
        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
          没有找到匹配的服务
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">
          尝试调整搜索条件或筛选选项
        </p>
      </div>
    );
  }

  return (
    <section className="glass-card overflow-hidden animate-fade-in" aria-label="服务监控列表">
      <ul role="list" className="divide-y divide-slate-100 dark:divide-slate-700/30">
        {monitors.map((monitor, index) => (
          <li key={monitor.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <MonitorCard 
              monitor={monitor} 
              showLink={showLink}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}