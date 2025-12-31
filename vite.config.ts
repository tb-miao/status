import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => ({
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    ...(mode === 'production' ? [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png'],
        manifest: {
          name: '服务状态监控面板',
          short_name: '状态监控',
          description: '基于 UptimeRobot 的服务状态监控面板',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          icons: [
            {
              src: 'logo.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'logo.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ] : [])
  ],
  server: {
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        }
      }
    }
  }
}));
