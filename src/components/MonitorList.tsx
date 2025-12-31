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
      <div className="card overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <MonitorSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (monitors.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400">
          没有找到匹配的服务
        </p>
      </div>
    );
  }

  return (
    <section className="card overflow-hidden" aria-label="服务监控列表">
      <ul role="list">
        {monitors.map((monitor) => (
          <li key={monitor.id}>
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
