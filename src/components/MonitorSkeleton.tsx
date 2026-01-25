export function MonitorSkeleton() {
  return (
    <div className="p-6 border-b border-slate-100 dark:border-slate-700/30 last:border-b-0 animate-pulse">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-6 w-40 rounded-lg" />
        <div className="skeleton h-5 w-20 rounded-lg" />
      </div>
      
      {/* 时间线 */}
      <div className="flex gap-[3px] mb-4">
        {[...Array(90)].map((_, i) => (
          <div key={i} className="skeleton flex-1 h-8 rounded-lg" style={{ animationDelay: `${i * 20}ms` }} />
        ))}
      </div>
      
      {/* 摘要 */}
      <div className="flex justify-between items-center">
        <div className="skeleton h-4 w-16 rounded-lg" />
        <div className="skeleton h-4 w-56 rounded-lg" />
        <div className="skeleton h-4 w-24 rounded-lg" />
      </div>
    </div>
  );
}