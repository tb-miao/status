# 公共 API 使用文档

本站提供公共 API，允许其他网站获取监控状态数据。

## 部署 API 服务器

### 方式一：Cloudflare Workers（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Create Worker**
3. 将 `worker/public-api.js` 文件内容粘贴进去
4. 在 **Settings** → **Variables** 中配置环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `UPTIMEROBOT_API_KEY` | UptimeRobot API Key | `ur3205001-05db75e224a0309f16fd982c` |
| `ALLOWED_API_KEYS` | 允许的 API 密钥（逗号分隔） | `key1,key2,key3` |
| `REQUIRE_API_KEY` | 是否需要 API 密钥验证 | `true` 或 `false` |
| `ALLOWED_ORIGINS` | 允许的 CORS 源（逗号分隔） | `*,https://example.com` |
| `RATE_LIMIT` | 每分钟请求限制 | `60` |
| `CACHE_TIME` | 缓存时间（秒） | `300` |

5. 部署后获得 Worker URL，例如：`https://your-worker.workers.dev`

### 方式二：Vercel Serverless Function

1. 创建 `api/monitors.js` 文件
2. 将 `worker/public-api.js` 的内容复制进去
3. 在 `vercel.json` 中配置环境变量
4. 部署后访问：`https://your-domain.vercel.app/api/monitors`

### 方式三：自建 Node.js 服务器

```bash
npm install express cors
```

```javascript
const express = require('express');
const cors = require('cors');
const { fetchPublicMonitors } = require('./src/api/public');

const app = express();

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));

app.get('/api/monitors', async (req, res) => {
  const { days = 30 } = req.query;
  const result = await fetchPublicMonitors(parseInt(days));
  res.json(result);
});

app.listen(3000);
```

## API 端点

### 获取监控数据

**端点：** `GET /api/monitors`

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `days` | number | 否 | 30 | 获取天数（7, 30, 60, 90） |

**请求头：**

| 头名称 | 说明 | 必填 |
|--------|------|------|
| `X-API-Key` | API 密钥 | 根据配置 |

**响应示例：**

```json
{
  "success": true,
  "data": [
    {
      "id": 123456789,
      "name": "我的网站",
      "url": "https://example.com",
      "status": "ok",
      "average": 99.95,
      "daily": [
        {
          "date": "2024-01-15",
          "uptime": 100,
          "down": {
            "times": 0,
            "duration": 0
          }
        },
        {
          "date": "2024-01-14",
          "uptime": 99.8,
          "down": {
            "times": 1,
            "duration": 120
          }
        }
      ],
      "total": {
        "times": 5,
        "duration": 600
      },
      "avgResponseTime": 245.5
    }
  ],
  "timestamp": 1705334400000
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `success` | boolean | 请求是否成功 |
| `data` | array | 监控数据数组 |
| `error` | string | 错误信息（失败时） |
| `timestamp` | number | 响应时间戳 |

**Monitor 对象字段：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 监控项 ID |
| `name` | string | 监控项名称 |
| `url` | string | 监控 URL |
| `status` | string | 状态：`ok`, `down`, `paused`, `unknown` |
| `average` | number | 平均可用率（%） |
| `daily` | array | 每日数据 |
| `total` | object | 总计故障次数和时长 |
| `avgResponseTime` | number | 平均响应时间（毫秒） |

## 使用示例

### JavaScript / TypeScript

```javascript
// 使用 fetch
async function getMonitors() {
  const response = await fetch('https://your-api.workers.dev/api/monitors?days=30', {
    headers: {
      'X-API-Key': 'your-api-key', // 如果需要
    },
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('监控项数量:', data.data.length);
    data.data.forEach(monitor => {
      console.log(`${monitor.name}: ${monitor.status} (${monitor.average}%)`);
    });
  } else {
    console.error('获取失败:', data.error);
  }
}

getMonitors();
```

```javascript
// 使用 axios
import axios from 'axios';

async function getMonitors() {
  try {
    const response = await axios.get('https://your-api.workers.dev/api/monitors', {
      params: { days: 30 },
      headers: {
        'X-API-Key': 'your-api-key',
      },
    });
    
    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

### React 示例

```jsx
import { useEffect, useState } from 'react';

function MonitorStatus() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchMonitors() {
      try {
        const response = await fetch('https://your-api.workers.dev/api/monitors', {
          headers: {
            'X-API-Key': 'your-api-key',
          },
        });
        const data = await response.json();
        
        if (data.success) {
          setMonitors(data.data);
        }
      } catch (error) {
        console.error('获取失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMonitors();
  }, []);
  
  if (loading) return <div>加载中...</div>;
  
  return (
    <div>
      <h2>服务状态</h2>
      {monitors.map(monitor => (
        <div key={monitor.id}>
          <h3>{monitor.name}</h3>
          <p>状态: {monitor.status}</p>
          <p>可用率: {monitor.average}%</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue 示例

```vue
<template>
  <div>
    <h2>服务状态</h2>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="monitor in monitors" :key="monitor.id">
        <h3>{{ monitor.name }}</h3>
        <p>状态: {{ monitor.status }}</p>
        <p>可用率: {{ monitor.average }}%</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      monitors: [],
      loading: true,
    };
  },
  async mounted() {
    try {
      const response = await fetch('https://your-api.workers.dev/api/monitors', {
        headers: {
          'X-API-Key': 'your-api-key',
        },
      });
      const data = await response.json();
      
      if (data.success) {
        this.monitors = data.data;
      }
    } catch (error) {
      console.error('获取失败:', error);
    } finally {
      this.loading = false;
    }
  },
};
</script>
```

### Python 示例

```python
import requests

def get_monitors():
    url = 'https://your-api.workers.dev/api/monitors'
    headers = {
        'X-API-Key': 'your-api-key',
    }
    params = {
        'days': 30,
    }
    
    response = requests.get(url, headers=headers, params=params)
    data = response.json()
    
    if data['success']:
        for monitor in data['data']:
            print(f"{monitor['name']}: {monitor['status']} ({monitor['average']}%)")
    else:
        print(f"获取失败: {data['error']}")

get_monitors()
```

### PHP 示例

```php
<?php
function getMonitors() {
    $url = 'https://your-api.workers.dev/api/monitors?days=30';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-API-Key: your-api-key',
    ]);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($response, true);
    
    if ($data['success']) {
        foreach ($data['data'] as $monitor) {
            echo "{$monitor['name']}: {$monitor['status']} ({$monitor['average']}%)\n";
        }
    } else {
        echo "获取失败: {$data['error']}\n";
    }
}

getMonitors();
?>
```

### cURL 示例

```bash
# 基本请求
curl https://your-api.workers.dev/api/monitors

# 带参数
curl "https://your-api.workers.dev/api/monitors?days=30"

# 带 API 密钥
curl -H "X-API-Key: your-api-key" https://your-api.workers.dev/api/monitors

# 格式化输出
curl -s https://your-api.workers.dev/api/monitors | jq
```

## 在其他网站中嵌入状态徽章

### 简单状态徽章

```html
<!-- HTML -->
<div id="status-badge">加载中...</div>

<script>
async function loadStatus() {
  const response = await fetch('https://your-api.workers.dev/api/monitors');
  const data = await response.json();
  
  if (data.success) {
    const allOk = data.data.every(m => m.status === 'ok');
    const badge = document.getElementById('status-badge');
    badge.innerHTML = allOk 
      ? '<span style="color: green;">● 所有服务正常</span>'
      : '<span style="color: red;">● 部分服务异常</span>';
  }
}

loadStatus();
setInterval(loadStatus, 300000); // 每 5 分钟更新
</script>
```

### 状态卡片组件

```html
<div class="status-card">
  <h3>服务状态</h3>
  <div id="status-list"></div>
</div>

<style>
.status-card {
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
}
.status-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}
.status-ok { color: green; }
.status-down { color: red; }
.status-paused { color: orange; }
</style>

<script>
async function loadStatus() {
  const response = await fetch('https://your-api.workers.dev/api/monitors');
  const data = await response.json();
  
  if (data.success) {
    const list = document.getElementById('status-list');
    list.innerHTML = data.data.map(monitor => `
      <div class="status-item">
        <span>${monitor.name}</span>
        <span class="status-${monitor.status}">
          ${monitor.status === 'ok' ? '正常' : monitor.status}
        </span>
      </div>
    `).join('');
  }
}

loadStatus();
</script>
```

## 错误处理

API 可能返回以下错误：

| 状态码 | 错误信息 | 说明 |
|--------|----------|------|
| 401 | 无效的 API 密钥 | API 密钥不正确或未提供 |
| 403 | 不允许的源 | CORS 源不在允许列表中 |
| 429 | 请求过于频繁 | 超过速率限制 |
| 500 | 获取数据失败 | 服务器内部错误 |

## 速率限制

- 默认：每分钟 60 次请求
- 可通过环境变量 `RATE_LIMIT` 配置
- 超过限制会返回 429 状态码

## 缓存

- 默认缓存时间：300 秒（5 分钟）
- 可通过环境变量 `CACHE_TIME` 配置
- 响应头包含 `Cache-Control` 指令

## 安全建议

1. **启用 API 密钥验证**：在生产环境中务必启用 API 密钥验证
2. **限制 CORS 源**：只允许可信的域名访问 API
3. **使用 HTTPS**：确保 API 通过 HTTPS 访问
4. **定期轮换密钥**：定期更换 API 密钥
5. **监控使用情况**：监控 API 调用日志，发现异常及时处理

## 故障排查

### CORS 错误

如果遇到 CORS 错误，请检查：
1. `ALLOWED_ORIGINS` 配置是否包含你的域名
2. 是否使用了正确的协议（http/https）
3. 请求头是否正确

### 401 错误

如果收到 401 错误：
1. 确认 API 密钥是否正确
2. 检查 `X-API-Key` 请求头是否正确设置
3. 确认 `REQUIRE_API_KEY` 配置

### 429 错误

如果收到 429 错误：
1. 减少请求频率
2. 增加缓存时间
4. 考虑使用客户端缓存

## 联系支持

如有问题，请联系网站管理员或提交 Issue。
