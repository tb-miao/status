export function MonitorSkeleton() {
  return (
    <div className="p-4 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-3">
        <div className="skeleton h-5 w-32" />
        <div className="skeleton h-4 w-16" />
      </div>
      
      {/* 时间线 */}
      <div className="flex gap-[2px] mb-2">
        {[...Array(90)].map((_, i) => (
          <div key={i} className="skeleton flex-1 h-6 rounded" />
        ))}
      </div>
      
      {/* 摘要 */}
      <div className="flex justify-between">
        <div className="skeleton h-3 w-12" />
        <div className="skeleton h-3 w-48" />
        <div className="skeleton h-3 w-20" />
      </div>
    </div>
  );
}
