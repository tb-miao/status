/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_UPTIME_API_KEYS: string
  readonly VITE_API_PROXY_URL: string
  readonly VITE_SITE_NAME: string
  readonly VITE_SITE_DESCRIPTION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
