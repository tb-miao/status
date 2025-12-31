import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProcessedMonitor } from '../types';
import { formatDate, formatDuration, formatRelativeTime, formatResponseTime } from '../utils/format';

interface MonitorDetailProps {
  monitor: ProcessedMonitor;
}

// 自定义 Tooltip 组件
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  valueFormatter: (value: number) => string;
  labelText: string;
  color: string;
}

function CustomTooltip({ active, payload, label, valueFormatter, labelText, color }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-medium" style={{ color }}>
        {labelText}：{valueFormatter(payload[0].value)}
      </p>
    </div>
  );
}

export function MonitorDetail({ monitor }: MonitorDetailProps) {
  // 可用率趋势数据
  const uptimeData = [...monitor.daily].reverse().map((d) => ({
    date: d.date.format('MM-DD'),
    uptime: d.uptime,
  }));

  // 动态计算 Y 轴范围
  const minUptime = Math.min(...uptimeData.map((d) => d.uptime));
  const yAxisMin = Math.max(0, Math.floor(minUptime / 5) * 5 - 5); // 向下取整到5的倍数，再减5

  // 响应时间数据
  const responseData = monitor.responseTimes?.map((rt) => ({
    time: new Date(rt.datetime * 1000).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    value: rt.value,
  })) || [];

  // 故障日志
  const downLogs = monitor.logs.filter((log) => log.type === 1);

  return (
    <div className="px-4 pb-4 space-y-4 bg-slate-50 dark:bg-slate-800/30">
      {/* 图表区域 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 可用率趋势 */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            可用率趋势
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uptimeData}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  stroke="#94a3b8"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  domain={[yAxisMin, 100]} 
                  tick={{ fontSize: 10 }} 
                  stroke="#94a3b8"
                  width={35}
                />
                <Tooltip 
                  content={
                    <CustomTooltip 
                      valueFormatter={(v) => `${v}%`}
                      labelText="可用率"
                      color="#22c55e"
                    />
                  }
                />
                <Line 
                  type="monotone" 
                  dataKey="uptime" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 响应时间 */}
        {responseData.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              响应时间 {monitor.avgResponseTime && (
                <span className="text-slate-500 font-normal">
                  (平均 {formatResponseTime(monitor.avgResponseTime)})
                </span>
              )}
            </h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={responseData}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10 }} 
                    stroke="#94a3b8"
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    stroke="#94a3b8"
                    width={45}
                    tickFormatter={(v) => `${v}ms`}
                  />
                  <Tooltip 
                    content={
                      <CustomTooltip 
                        valueFormatter={(v) => `${v}ms`}
                        labelText="响应时间"
                        color="#3b82f6"
                      />
                    }
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 故障历史 */}
      {downLogs.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            故障历史 ({downLogs.length} 次)
          </h4>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {downLogs.slice(0, 10).map((log, idx) => (
              <div 
                key={idx}
                className="text-sm py-2 border-b border-slate-100 dark:border-slate-700 last:border-0"
              >
                {/* 时间行 */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-red-500 flex-shrink-0">●</span>
                    <span className="text-slate-600 dark:text-slate-400 truncate">
                      {formatDate(log.datetime)}
                    </span>
                    <span className="text-slate-400 text-xs whitespace-nowrap">
                      ({formatRelativeTime(log.datetime)})
                    </span>
                  </div>
                  {/* PC端：持续时间在右边 */}
                  <span className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDuration(log.duration)}
                  </span>
                </div>
                {/* 移动端：持续时间在下面 */}
                <div className="sm:hidden ml-4 text-xs text-slate-500 dark:text-slate-400">
                  持续 {formatDuration(log.duration)}
                </div>
                {/* 原因 */}
                {log.reason?.detail && (
                  <p className="ml-4 text-xs text-red-400">
                    原因：{log.reason.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
