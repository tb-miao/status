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
  // 密码保护配置
  enablePasswordProtection: boolean;
  password?: string;
  // hCaptcha 配置
  enableHCaptcha: boolean;
  hCaptchaSiteKey?: string;
  hCaptchaSecret?: string;
  // 公共 API 配置
  enablePublicApi: boolean;
  publicApiUrl?: string;
  publicApiKey?: string;
  publicApiAllowedOrigins?: string;
  publicApiRateLimit?: number;
  publicApiCacheTime?: number;
  // 缓存配置（单位：秒）
  refetchInterval: number;    // 自动刷新间隔
  staleTime: number;          // 数据新鲜时间
  cacheTime: number;          // 缓存保留时间
}