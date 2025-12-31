import type dayjs from 'dayjs';

// UptimeRobot API 类型
export interface UptimeLog {
  type: number; // 1=down, 2=up, 98=started, 99=paused
  datetime: number;
  duration: number;
  reason?: {
    code: string;
    detail: string;
  };
}

export interface ResponseTime {
  datetime: number;
  value: number;
}

export interface UptimeMonitor {
  id: number;
  friendly_name: string;
  url: string;
  type: number;
  status: number; // 0=paused, 1=not checked, 2=up, 8=seems down, 9=down
  custom_uptime_ranges: string;
  logs: UptimeLog[];
  response_times?: ResponseTime[];
  average_response_time?: string;
}

export interface UptimeApiResponse {
  stat: string;
  error?: {
    type: string;
    message: string;
  };
  monitors: UptimeMonitor[];
}

// 处理后的数据类型
export type MonitorStatus = 'ok' | 'down' | 'paused' | 'unknown';

export interface DailyData {
  date: dayjs.Dayjs;
  uptime: number;
  down: {
    times: number;
    duration: number;
  };
}

export interface IncidentEvent {
  id: string;
  monitorId: number;
  monitorName: string;
  type: 'down' | 'up';
  datetime: number;
  duration: number;
  reason?: string;
}

export interface ProcessedMonitor {
  id: number;
  name: string;
  url: string;
  status: MonitorStatus;
  average: number;
  daily: DailyData[];
  total: {
    times: number;
    duration: number;
  };
  logs: UptimeLog[];
  responseTimes?: ResponseTime[];
  avgResponseTime?: number;
}
