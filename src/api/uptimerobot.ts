import axios from 'axios';
import dayjs from 'dayjs';
import { getConfig } from '../config';
import type {
  UptimeApiResponse,
  ProcessedMonitor,
  DailyData,
  MonitorStatus,
} from '../types';

export async function fetchMonitors(
  apikey: string,
  days: number
): Promise<ProcessedMonitor[]> {
  const config = getConfig();
  const API_URL = config.apiUrl || 'https://api.uptimerobot.com/v2/getMonitors';

  const dates: dayjs.Dayjs[] = [];
  const today = dayjs(new Date().setHours(0, 0, 0, 0));

  for (let d = 0; d < days; d++) {
    dates.push(today.subtract(d, 'day'));
  }

  const ranges = dates.map(
    (date) => `${date.unix()}_${date.add(1, 'day').unix()}`
  );
  const start = dates[dates.length - 1].unix();
  const end = dates[0].add(1, 'day').unix();
  ranges.push(`${start}_${end}`);

  const postdata = {
    api_key: apikey,
    format: 'json',
    logs: 1,
    log_types: '1-2',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
    // 响应时间数据量大，减少请求数量
    response_times: 1,
    response_times_limit: 12,
  };

  // 转换为 URL 编码格式
  const formData = new URLSearchParams();
  Object.entries(postdata).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  const response = await axios.post<UptimeApiResponse>(API_URL, formData, {
    timeout: 15000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  if (response.data.stat !== 'ok') {
    throw new Error(response.data.error?.message || 'API 请求失败');
  }

  return response.data.monitors.map((monitor) => {
    const rangeValues = monitor.custom_uptime_ranges.split('-').map(Number);
    const average = formatNumber(rangeValues.pop() || 0);

    const daily: DailyData[] = [];
    const dateMap: Record<string, number> = {};

    dates.forEach((date, index) => {
      dateMap[date.format('YYYYMMDD')] = index;
      daily[index] = {
        date,
        uptime: formatNumber(rangeValues[index] || 0),
        down: { times: 0, duration: 0 },
      };
    });

    const total = monitor.logs.reduce(
      (acc, log) => {
        if (log.type === 1) {
          const dateKey = dayjs.unix(log.datetime).format('YYYYMMDD');
          const idx = dateMap[dateKey];
          if (idx !== undefined) {
            daily[idx].down.duration += log.duration;
            daily[idx].down.times += 1;
          }
          acc.duration += log.duration;
          acc.times += 1;
        }
        return acc;
      },
      { times: 0, duration: 0 }
    );

    let status: MonitorStatus = 'unknown';
    if (monitor.status === 2) status = 'ok';
    else if (monitor.status === 9 || monitor.status === 8) status = 'down';
    else if (monitor.status === 0) status = 'paused';

    return {
      id: monitor.id,
      name: monitor.friendly_name,
      url: monitor.url,
      status,
      average,
      daily,
      total,
      logs: monitor.logs,
      responseTimes: monitor.response_times,
      avgResponseTime: monitor.average_response_time
        ? parseFloat(monitor.average_response_time)
        : undefined,
    };
  });
}

function formatNumber(value: number): number {
  return Math.floor(value * 100) / 100;
}
