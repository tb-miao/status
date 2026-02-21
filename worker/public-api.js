/**
 * 公共 API 服务器
 * 允许其他网站通过 API 获取监控数据
 * 
 * 部署方式：
 * 1. Cloudflare Workers: 直接部署此文件
 * 2. Vercel/Netlify: 作为 serverless 函数
 * 3. 自建服务器: 使用 Node.js 运行
 */

const UPTIMEROBOT_API = 'https://api.uptimerobot.com/v2/getMonitors';

// 内存缓存（全局）
let cache = {
  data: null,
  timestamp: 0,
};

// 速率限制存储（全局）
const rateLimits = new Map();

// 从 env 获取配置
function getConfig(env) {
  return {
    // UptimeRobot API Key
    API_KEY: env?.UPTIMEROBOT_API_KEY || '',
    
    // 允许的 API 密钥（多个用逗号分隔）
    API_KEYS: env?.ALLOWED_API_KEYS ? env.ALLOWED_API_KEYS.split(',').filter(k => k.trim()) : [],
    
    // 是否启用 API 密钥验证
    REQUIRE_API_KEY: env?.REQUIRE_API_KEY === 'true' || false,
    
    // 允许的 CORS 源（* 表示允许所有）
    ALLOWED_ORIGINS: env?.ALLOWED_ORIGINS ? env.ALLOWED_ORIGINS.split(',').filter(o => o.trim()) : ['*'],
    
    // 速率限制（每分钟请求数）
    RATE_LIMIT: env?.RATE_LIMIT && !isNaN(parseInt(env.RATE_LIMIT)) ? parseInt(env.RATE_LIMIT) : 60,
    
    // 缓存时间（秒）
    CACHE_TIME: env?.CACHE_TIME && !isNaN(parseInt(env.CACHE_TIME)) ? parseInt(env.CACHE_TIME) : 300,
  };
}

// CORS 响应头
function getCorsHeaders(origin, config) {
  const allowedOrigins = config.ALLOWED_ORIGINS;
  let allowOrigin = '*';
  
  if (!allowedOrigins.includes('*')) {
    if (allowedOrigins.includes(origin)) {
      allowOrigin = origin;
    } else {
      return null;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
    'Access-Control-Max-Age': '86400',
  };
}

// 检查速率限制
function checkRateLimit(ip, config) {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${ip}:${minute}`;
  
  const count = rateLimits.get(key) || 0;
  
  if (count >= config.RATE_LIMIT) {
    return false;
  }
  
  rateLimits.set(key, count + 1);
  
  // 清理旧数据
  rateLimits.forEach((value, k) => {
    const [_, m] = k.split(':');
    if (parseInt(m) < minute - 1) {
      rateLimits.delete(k);
    }
  });
  
  return true;
}

// 验证 API 密钥
function validateApiKey(apiKey, config) {
  if (!config.REQUIRE_API_KEY) {
    return true;
  }
  
  if (!apiKey) {
    return false;
  }
  
  return config.API_KEYS.includes(apiKey);
}

// 获取客户端 IP
function getClientIp(request) {
  const cfConnectingIp = request.headers.get('CF-Connecting-IP');
  if (cfConnectingIp) return cfConnectingIp;
  
  const xForwardedFor = request.headers.get('X-Forwarded-For');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  
  return 'unknown';
}

// 获取监控数据
async function fetchMonitors(days = 30, config) {
  const now = Date.now();
  
  // 检查 UptimeRobot API Key 是否配置
  if (!config.API_KEY) {
    throw new Error('UptimeRobot API Key 未配置，请在环境变量中设置 UPTIMEROBOT_API_KEY');
  }
  
  // 检查缓存
  if (cache.data && (now - cache.timestamp) < config.CACHE_TIME * 1000) {
    return cache.data;
  }
  
  const today = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  const start = today - (days * dayInSeconds);
  const end = today + dayInSeconds;
  
  // 生成日期范围
  const ranges = [];
  for (let i = 0; i < days; i++) {
    const rangeStart = start + (i * dayInSeconds);
    const rangeEnd = rangeStart + dayInSeconds;
    ranges.push(`${rangeStart}_${rangeEnd}`);
  }
  ranges.push(`${start}_${end}`);
  
  const postdata = {
    api_key: config.API_KEY,
    format: 'json',
    logs: 1,
    log_types: '1-2',
    logs_start_date: start,
    logs_end_date: end,
    custom_uptime_ranges: ranges.join('-'),
    response_times: 1,
    response_times_limit: 12,
  };
  
  const formData = new URLSearchParams();
  Object.entries(postdata).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  
  const response = await fetch(UPTIMEROBOT_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (data.stat !== 'ok') {
    throw new Error(data.error?.message || 'API 请求失败');
  }
  
  // 处理数据
  const monitors = data.monitors.map((monitor) => {
    const rangeValues = monitor.custom_uptime_ranges.split('-').map(Number);
    const average = Math.floor((rangeValues.pop() || 0) * 100) / 100;
    
    const daily = [];
    const dateMap = {};
    
    for (let i = 0; i < days; i++) {
      const date = new Date((start + i * dayInSeconds) * 1000);
      const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
      dateMap[dateKey] = i;
      daily[i] = {
        date: date.toISOString().split('T')[0],
        uptime: Math.floor((rangeValues[i] || 0) * 100) / 100,
        down: { times: 0, duration: 0 },
      };
    }
    
    const total = monitor.logs.reduce(
      (acc, log) => {
        if (log.type === 1) {
          const date = new Date(log.datetime * 1000);
          const dateKey = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
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
    
    let status = 'unknown';
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
      avgResponseTime: monitor.average_response_time
        ? parseFloat(monitor.average_response_time)
        : undefined,
    };
  });
  
  // 更新缓存
  cache = {
    data: {
      success: true,
      data: monitors,
      timestamp: now,
    },
    timestamp: now,
  };
  
  return cache.data;
}

// 处理 API 请求
async function handleApiRequest(request, config) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin, config);
  
  if (!corsHeaders) {
    return new Response(
      JSON.stringify({ success: false, error: '不允许的源' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // 检查速率限制
  const ip = getClientIp(request);
  if (!checkRateLimit(ip, config)) {
    return new Response(
      JSON.stringify({ success: false, error: '请求过于频繁，请稍后再试' }),
      { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // 验证 API 密钥
  const apiKey = request.headers.get('X-API-Key');
  if (!validateApiKey(apiKey, config)) {
    let errorMsg = '无效的 API 密钥';
    
    if (!apiKey) {
      if (config.REQUIRE_API_KEY) {
        errorMsg = '缺少 API 密钥，请在请求头中添加 X-API-Key';
      } else {
        errorMsg = 'API 密钥验证已禁用，但仍需提供密钥';
      }
    } else if (config.API_KEYS.length === 0) {
      errorMsg = '服务器未配置允许的 API 密钥，请联系管理员';
    }
    
    return new Response(
      JSON.stringify({ success: false, error: errorMsg }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
  
  // 获取查询参数
  const days = parseInt(url.searchParams.get('days') || '30');
  const validDays = [7, 30, 60, 90];
  const queryDays = validDays.includes(days) ? days : 30;
  
  try {
    const data = await fetchMonitors(queryDays, config);
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${config.CACHE_TIME}`,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || '获取数据失败',
        timestamp: Date.now(),
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}

// 处理 OPTIONS 请求
function handleOptions(request, config) {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin, config);
  
  if (!corsHeaders) {
    return new Response(null, { status: 403 });
  }
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 处理根路径请求（返回 API 文档）
function handleRoot(request, config) {
  const origin = request.headers.get('Origin');
  const corsHeaders = getCorsHeaders(origin, config);
  
  const docs = {
    name: 'Uptime Status Public API',
    version: '1.0.0',
    description: '提供公开的监控状态数据 API',
    endpoints: {
      '/api/monitors': {
        method: 'GET',
        description: '获取所有监控项的状态数据',
        parameters: {
          days: {
            type: 'number',
            description: '获取天数（7, 30, 60, 90）',
            default: 30,
          },
        },
        headers: {
          'X-API-Key': {
            description: 'API 密钥（如果启用）',
            required: config.REQUIRE_API_KEY,
          },
        },
        response: {
          success: 'boolean',
          data: 'Array<Monitor>',
          timestamp: 'number',
        },
      },
    },
    monitor: {
      id: 'number',
      name: 'string',
      url: 'string',
      status: "'ok' | 'down' | 'paused' | 'unknown'",
      average: 'number',
      daily: 'Array<{ date, uptime, down }>',
      total: '{ times, duration }',
      avgResponseTime: 'number | undefined',
    },
    authentication: config.REQUIRE_API_KEY 
      ? '需要 API 密钥，请在请求头中添加 X-API-Key'
      : '无需认证',
    rateLimit: `每分钟 ${config.RATE_LIMIT} 次请求`,
    cache: `缓存时间 ${config.CACHE_TIME} 秒`,
  };
  
  return new Response(JSON.stringify(docs, null, 2), {
    status: 200,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

// 主处理函数
export default {
  async fetch(request, env, ctx) {
    const config = getConfig(env);
    const url = new URL(request.url);
    
    // 处理 OPTIONS 预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions(request, config);
    }
    
    // 处理根路径
    if (url.pathname === '/' || url.pathname === '') {
      return handleRoot(request, config);
    }
    
    // 处理 API 端点
    if (url.pathname === '/api/monitors') {
      if (request.method !== 'GET') {
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin, config);
        return new Response(
          JSON.stringify({ success: false, error: '方法不允许' }),
          { 
            status: 405, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      return handleApiRequest(request, config);
    }
    
    // 404
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin, config);
    return new Response(
      JSON.stringify({ success: false, error: '未找到端点' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  },
};
