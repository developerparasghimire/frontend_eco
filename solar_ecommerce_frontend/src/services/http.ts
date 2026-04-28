/**
 * HTTP client.
 *
 * - Single axios instance with base URL from env
 * - Request interceptor injects the JWT access token
 * - Response interceptor handles 401 by attempting a single token refresh
 *   then replays the original request. Concurrent refreshes are deduped.
 */
import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/lib/env';
import { tokenStore } from '@/lib/tokens';

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const http = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

http.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// ─── Refresh-token coordination ─────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh();
  if (!refresh) return null;
  try {
    const resp = await axios.post(
      `${env.apiUrl}/api/auth/token/refresh/`,
      { refresh },
      { headers: { 'Content-Type': 'application/json' } },
    );
    const data = resp.data as { access: string; refresh?: string };
    tokenStore.set(data.access, data.refresh ?? refresh);
    return data.access;
  } catch {
    tokenStore.clear();
    return null;
  }
}

http.interceptors.response.use(
  (resp) => resp,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;

    if (status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    // Don't try to refresh while calling auth endpoints themselves
    const url = original.url ?? '';
    if (url.includes('/api/auth/login') || url.includes('/api/auth/token/refresh') ||
        url.includes('/api/auth/register')) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const newAccess = await refreshPromise;
    if (!newAccess) {
      // Refresh failed → propagate so caller can redirect to login
      return Promise.reject(error);
    }

    original.headers.set('Authorization', `Bearer ${newAccess}`);
    return http.request(original);
  },
);

/** Helper that unwraps `response.data` for callers using TanStack Query. */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const resp = await http.request<T>(config);
  return resp.data;
}
