import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { getConfig } from './config';
import './index.css';

// 设置页面标题和描述
const config = getConfig();
document.title = config.siteName;
document.querySelector('meta[name="description"]')?.setAttribute('content', config.siteDescription);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: config.refetchInterval * 1000,
      staleTime: config.staleTime * 1000,
      gcTime: config.cacheTime * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
);
