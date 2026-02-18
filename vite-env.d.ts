// Manually define types to avoid missing vite/client error

declare var process: {
  env: {
    API_KEY: string;
    [key: string]: any;
  }
};

interface Window {
  process: any;
}

interface Navigator {
  standalone?: boolean;
}

// Add PWA specific events to WindowEventMap
interface WindowEventMap {
  'beforeinstallprompt': any;
  'appinstalled': any;
}

// Add simple ImportMeta definitions usually provided by vite/client
interface ImportMetaEnv {
  [key: string]: any
  BASE_URL: string
  MODE: string
  DEV: boolean
  PROD: boolean
  SSR: boolean
}

interface ImportMeta {
  url: string
  readonly env: ImportMetaEnv
}
