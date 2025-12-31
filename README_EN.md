# Service Status Monitor

[中文文档](./README.md) | English

A modern service status monitoring panel based on UptimeRobot API.

Demo: [https://status.javai.cn](https://status.javai.cn)

![Preview](docs/images/preview.png)

## Features

- 🚀 **Modern Tech Stack** - Vite + React 18 + TypeScript + TailwindCSS
- 📊 **Data Visualization** - Uptime trend charts, response time graphs (dynamic Y-axis, theme-adaptive tooltips)
- 🔔 **Real-time Notifications** - Browser notifications (toggleable), page title status
- 🌓 **Theme Switching** - Dark/Light/System modes
- 📱 **Responsive Design** - Perfect mobile adaptation
- 🔍 **Search & Filter** - Search by name, filter by status (including paused), multiple sorting options
- 📅 **Time Range** - Support 30/60/90 days
- 📋 **Incident History** - Recent incidents with reasons (responsive layout)
- 🖼️ **Embed Mode** - Support iframe embedding
- 📲 **PWA Support** - Add to home screen
- 🔤 **Font Adaptation** - Auto-adapt to platform fonts
- 📈 **Visit Statistics** - Integrated Busuanzi analytics
- ♿ **Accessibility** - Keyboard navigation, screen reader support, skip links
- 🔄 **Smart Refresh** - Last update time, loading state, auto retry

## Quick Start

### EdgeOne Pages Deployment (Recommended)

1. Visit [EdgeOne Pages](https://edgeone.ai), login/register account
2. Go to EdgeOne Pages console, click "New Site"
3. Select "Import from Git", connect your GitHub account
4. Select this repository `uptime-status`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node version**: 18.x or higher
6. Configure environment variables:
   - `VITE_UPTIME_API_KEYS`: Your UptimeRobot API Key (**Required**, [Get it here](https://uptimerobot.com/dashboard#mySettings))
   - `VITE_API_PROXY_URL`: API proxy URL (**Optional**, leave empty to call official API directly, may have CORS issues)
   - `VITE_SITE_NAME`: Site name (**Optional**)
   - `VITE_SITE_DESCRIPTION`: Site description (**Optional**)
7. Click "Deploy" and wait for build to complete
8. Access your deployed site via the assigned domain

> **Tip**: If you encounter CORS issues and cannot load data, configure `VITE_API_PROXY_URL`. See "API Proxy Configuration" section below.

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables config
cp .env.example .env

# Edit .env file, configure the following variables:
# VITE_UPTIME_API_KEYS=your-api-key (Required)
# VITE_API_PROXY_URL= (Optional, leave empty to call official API directly, may have CORS issues)
# VITE_SITE_NAME= (Optional)
# VITE_SITE_DESCRIPTION= (Optional)

# Start dev server
npm run dev

# Build for production
npm run build
```

> **Tip**: If you encounter CORS issues during local development, configure `VITE_API_PROXY_URL`. See "API Proxy Configuration" section below.

## Get API Key

1. Register at [UptimeRobot](https://uptimerobot.com/)
2. Add websites/services to monitor
3. Go to **My Settings** page
4. Find **API Settings** section
5. Click **Create Read-only API Key**
6. Copy the generated key (starts with `ur`)

> Note: Use Read-only API Key, not Main API Key, to prevent malicious operations if leaked.




## Embed Mode

Add `?embed=1` parameter to URL for minimal embed mode:

```html
<iframe src="https://your-domain.com/?embed=1" width="100%" height="600"></iframe>
```

## API Proxy Configuration

Due to browser CORS restrictions, direct UptimeRobot API calls may fail. If you encounter this issue, configure an API proxy.

### Option 1: Use Public Proxy

If you don't want to set up your own proxy, you can use this public proxy:

```bash
# Local development: Configure in .env file
VITE_API_PROXY_URL=https://javai.cn/api/uptimerobot/v2/getMonitors

# EdgeOne Pages deployment: Add to environment variables
VITE_API_PROXY_URL=https://javai.cn/api/uptimerobot/v2/getMonitors
```

> ⚠️ **Warning**: This is a public proxy service. Stability is not guaranteed. Self-hosted proxy is recommended for more stable service.

### Option 2: Cloudflare Worker (Recommended for Self-hosting)

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to Workers & Pages → Create Worker
3. Paste the content of `worker/uptimerobot-proxy.js`
4. Deploy and get Worker URL (e.g., `https://your-worker.workers.dev`)
5. Configure environment variable:
   ```bash
   # Local development: Configure in .env file
   VITE_API_PROXY_URL=https://your-worker.workers.dev/v2/getMonitors
   
   # EdgeOne Pages deployment: Add to environment variables
   VITE_API_PROXY_URL=https://your-worker.workers.dev/v2/getMonitors
   ```
6. Rebuild/redeploy the project

### Option 3: Nginx Proxy

If using your own server, configure Nginx reverse proxy:

```nginx
location /api/uptimerobot/ {
  proxy_pass https://api.uptimerobot.com/;
  proxy_ssl_server_name on;

  proxy_hide_header Access-Control-Allow-Origin;
  proxy_hide_header Access-Control-Allow-Methods;
  proxy_hide_header Access-Control-Allow-Headers;

  add_header Access-Control-Allow-Origin * always;
  add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS' always;
  add_header Access-Control-Allow-Headers 'Content-Type' always;

  if ($request_method = 'OPTIONS') {
    return 204;
  }
}
```

Then configure environment variable:
```bash
# Local development: Configure in .env file
VITE_API_PROXY_URL=https://your-domain.com/api/uptimerobot/v2/getMonitors

# EdgeOne Pages deployment: Add to environment variables
VITE_API_PROXY_URL=https://your-domain.com/api/uptimerobot/v2/getMonitors
```

## Tech Stack

- [Vite](https://vitejs.dev/) - Build tool
- [React 18](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - CSS framework
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Recharts](https://recharts.org/) - Charts

## FAQ

**Q: Page shows "Failed to load data"?**

A: Usually a CORS issue. Configure API proxy as described above.

**Q: Data not updating?**

A: Default refresh is 5 minutes. Adjust `refetchInterval` in config. UptimeRobot free tier also checks every 5 minutes.

**Q: How to monitor multiple accounts?**

A: Add multiple API Keys to `apiKeys` array. Data will be merged automatically.

**Q: How to hide certain monitors?**

A: Create Monitor-Specific API Key in UptimeRobot dashboard. It will only return that monitor's data.

**Q: How to disable browser notifications?**

A: Click the notification icon in toolbar to toggle. Settings are saved automatically.

**Q: Page shows "Please configure API Key"?**

A: For EdgeOne Pages deployment, configure `VITE_UPTIME_API_KEYS` in environment variables. For local development, configure in `src/config/config.ts`.

**Q: EdgeOne Pages deployment failed?**

A: Check if environment variables are correctly configured, especially `VITE_UPTIME_API_KEYS` must have a valid API Key.

**Q: API proxy not working?**

A: Ensure environment variable `VITE_API_PROXY_URL` is set to `/api/uptimerobot/v2/getMonitors`, EdgeOne will automatically use edge functions for proxy.

## License

MIT
