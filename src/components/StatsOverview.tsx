interface StatsProps {
  total: number;
  up: number;
  down: number;
  paused: number;
  avgUptime: number;
  isLoading: boolean;
}

export function StatsOverview({ total, up, down, paused, avgUptime, isLoading }: StatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-4 animate-fade-in">
            <div className="skeleton h-4 w-20 mb-2" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const allOk = down === 0;
  const uptimePercentage = avgUptime / 100;

  return (
    <div className="mb-8 animate-fade-in">
      {/* 整体状态横幅 - Glassmorphism风格 */}
      <div
        className={`glass-card p-6 mb-6 flex items-center gap-4 backdrop-blur-xl ${
          allOk 
            ? 'border-green-200/50 dark:border-green-800/30' 
            : 'border-red-200/50 dark:border-red-800/30'
        }`}
        role="status"
        aria-live="polite"
      >
        <div className={`relative ${allOk ? 'animate-heartbeat' : ''}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
            allOk 
              ? 'bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/25' 
              : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/25'
          }`}>
            {allOk ? '💚' : '🔴'}
          </div>
          {allOk && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
          )}
        </div>
        <div className="flex-1">
          <p className={`text-xl font-bold mb-1 ${
            allOk ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
          }`}>
            {allOk ? '🎉 所有服务运行正常' : `⚠️ ${down} 个服务出现故障`}
          </p>
          <div className="flex items-center gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              平均可用率 <span className="font-semibold">{avgUptime}%</span>
            </p>
            {/* 进度条 */}
            <div className="flex-1 max-w-32">
              <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-1000 ease-out`}
                  style={{ width: `${avgUptime}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 - 玻璃拟态风格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard 
          label="总服务数" 
          value={total} 
          icon="📊" 
          color="from-blue-400 to-blue-600"
          delay={0}
        />
        <StatCard 
          label="正常运行" 
          value={up} 
          icon="✅" 
          color="from-green-400 to-green-600"
          delay={100}
        />
        <StatCard 
          label="故障中" 
          value={down} 
          icon="❌" 
          color="from-red-400 to-red-600"
          delay={200}
        />
        <StatCard 
          label="已暂停" 
          value={paused} 
          icon="⏸️" 
          color="from-yellow-400 to-yellow-600"
          delay={300}
        />
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon, 
  color = 'from-slate-400 to-slate-600',
  delay = 0
}: { 
  label: string; 
  value: number; 
  icon: string;
  color?: string;
  delay?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(current));
        }
      }, duration / steps);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div 
      className="glass-card p-5 hover-lift group cursor-pointer backdrop-blur-xl" 
      role="group" 
      aria-label={`${label}: ${value}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <span aria-hidden="true" className="text-lg">{icon}</span>
          <span>{label}</span>
        </div>
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
      </div>
      <div className="flex items-end gap-2">
        <p className={`text-3xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`} aria-hidden="true">
          {displayValue}
        </p>
        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${color} mb-2 animate-pulse`}></div>
      </div>
      <div className="mt-2 h-1 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}