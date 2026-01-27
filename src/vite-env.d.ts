/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPTIME_API_KEYS: string
  readonly VITE_API_PROXY_URL: string
  readonly VITE_SITE_NAME: string
  readonly VITE_SITE_DESCRIPTION: string
  readonly VITE_ENABLE_PASSWORD_PROTECTION: string
  readonly VITE_PASSWORD: string
  readonly VITE_ENABLE_HCAPTCHA: string
  readonly VITE_HCAPTCHA_SITE_KEY: string
  readonly VITE_HCAPTCHA_SECRET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface Window {
  hcaptcha?: {
    render: (container: string | HTMLElement, options: {
      sitekey: string;
      theme?: 'light' | 'dark';
      callback?: (token: string) => void;
      'expired-callback'?: () => void;
      'error-callback'?: () => void;
    }) => string;
    reset: (widgetId?: string) => void;
    execute: (widgetId?: string, options?: { async?: boolean }) => Promise<string>;
    getResponse: (widgetId?: string) => string;
  };
}