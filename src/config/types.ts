export interface AppConfig {
  siteName: string;
  siteDescription: string;
  apiKeys: string[];
  apiUrl?: string;
  countDays: number;
  showLink: boolean;
  defaultTheme: 'light' | 'dark' | 'system';
  defaultSort: 'name' | 'status' | 'uptime';
  defaultFilter: 'all' | 'ok' | 'down' | 'paused';
  // 缓存配置（单位：秒）
  refetchInterval: number;    // 自动刷新间隔
  staleTime: number;          // 数据新鲜时间
  cacheTime: number;          // 缓存保留时间
}
