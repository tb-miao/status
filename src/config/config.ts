import type { AppConfig } from './types';

/**
 * 从环境变量读取配置
 * EdgeOne Pages 部署时通过环境变量配置
 */
function getApiKeys(): string[] {
  // 优先使用环境变量
  const envKeys = import.meta.env.VITE_UPTIME_API_KEYS;
  if (envKeys) {
    return envKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
  }
  // 开发环境默认值（示例 Key）
  return ['ur3205001-05db75e224a0309f16fd982c'];
}

function getApiUrl(): string {
  return import.meta.env.VITE_API_PROXY_URL || '';
}

function getSiteName(): string {
  return import.meta.env.VITE_SITE_NAME || '服务状态监控面板';
}

function getSiteDescription(): string {
  return import.meta.env.VITE_SITE_DESCRIPTION || '实时监控服务运行状态，查看历史可用性数据';
}

/**
 * 应用配置文件
 * EdgeOne Pages 部署时通过环境变量配置
 * 本地开发时可直接修改此文件
 */
const config: AppConfig = {
  // ===== 基础配置 =====

  // 网站标题（支持环境变量）
  siteName: getSiteName(),

  // 网站描述（支持环境变量）
  siteDescription: getSiteDescription(),

  // UptimeRobot API Keys（支持环境变量）
  // 支持 Monitor-Specific 和 Read-Only API Key
  // 可以配置多个 key，会合并显示所有监控项
  apiKeys: getApiKeys(),

  // 自定义 API 代理地址（支持环境变量）
  // 留空则使用官方 API: https://api.uptimerobot.com/v2/getMonitors
  apiUrl: getApiUrl(),

  // ===== 显示配置 =====

  // 默认显示天数 (30, 60, 90)
  countDays: 30,

  // 是否显示站点链接
  showLink: true,

  // 默认主题 ('light' | 'dark' | 'system')
  defaultTheme: 'system',

  // 默认排序方式 ('name' | 'status' | 'uptime')
  defaultSort: 'name',

  // 默认状态筛选 ('all' | 'ok' | 'down')
  defaultFilter: 'all',

  // ===== 缓存配置（单位：秒）=====

  // 自动刷新间隔（默认 5 分钟）
  refetchInterval: 300,

  // 数据新鲜时间，此时间内不会重新请求（默认 2 分钟）
  staleTime: 120,

  // 缓存保留时间（默认 10 分钟）
  cacheTime: 600,
};

export default config;
