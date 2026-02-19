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
    react({
      // 启用快速刷新
      fastRefresh: true,
      // 启用自动导入 React
      jsxRuntime: 'automatic'
    }),
    ...(mode === 'production' ? [
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png'],
        manifest: {
          name: '服务状态监控面板',
          short_name: '状态监控',
          description: '基于 UptimeRobot 的服务状态监控面板',
          theme_color: '#ff77aa',
          background_color: '#fff7ff',
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
    port: 3000,
    // 启用 gzip 压缩
    compress: true
  },
  build: {
    // 启用源码映射
    sourcemap: false,
    // 优化大小
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 增加 chunk 大小警告阈值
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
          axios: ['axios'],
          dayjs: ['dayjs'],
          zustand: ['zustand']
        },
        // 优化输出
        compact: true,
        // 启用代码分割
        codeSplitting: true
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query', 'recharts'],
    // 禁用依赖预构建缓存
    // 仅在需要时启用
    // cacheDir: false
  }
}));
