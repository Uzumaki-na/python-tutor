interface EnvConfig {
  API_URL: string;
  APP_NAME: string;
  APP_VERSION: string;
  NODE_ENV: 'development' | 'production' | 'test';
}

export const env: EnvConfig = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  APP_NAME: import.meta.env.VITE_APP_NAME || "Taanya's Python Learning",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  NODE_ENV: import.meta.env.MODE as EnvConfig['NODE_ENV'],
};

export function isDev(): boolean {
  return env.NODE_ENV === 'development';
}

export function isProd(): boolean {
  return env.NODE_ENV === 'production';
}

export function isTest(): boolean {
  return env.NODE_ENV === 'test';
}
