/**
 * Cloudflare Worker - UptimeRobot API 代理
 * 用于解决浏览器跨域问题
 * 
 * 部署步骤：
 * 1. 登录 Cloudflare Dashboard
 * 2. 进入 Workers & Pages → Create Worker
 * 3. 将此文件内容粘贴进去
 * 4. 部署后获得 Worker URL
 * 5. 在配置文件中设置 apiUrl 为 Worker URL + '/v2/getMonitors'
 */

const UPTIMEROBOT_API = 'https://api.uptimerobot.com';

// 允许的源（可根据需要修改）
const ALLOWED_ORIGINS = ['*'];

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 构建目标 URL
  const targetUrl = UPTIMEROBOT_API + url.pathname + url.search;

  // 转发请求
  const response = await fetch(targetUrl, {
    method: request.method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: request.method === 'POST' ? await request.text() : undefined,
  });

  // 获取响应内容
  const data = await response.text();

  // 返回带 CORS 头的响应
  return new Response(data, {
    status: response.status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function handleOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export default {
  async fetch(request) {
    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }

    try {
      return await handleRequest(request);
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      });
    }
  },
};
