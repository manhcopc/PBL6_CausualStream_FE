const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';
const apiBaseUrl = rawApiBaseUrl.replace(/\/$/, '');
const wsBaseUrl = apiBaseUrl.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

export const appConfig = {
  apiBaseUrl,
  wsBaseUrl,
  requestTimeoutMs: 10_000,
} as const;
