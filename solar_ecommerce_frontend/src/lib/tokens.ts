/**
 * Token storage helpers.
 *
 * Tokens are kept in localStorage for simplicity (typical SPA pattern).
 * If you need stricter security against XSS, switch to httpOnly cookies on
 * the Django side and remove these helpers.
 */
const ACCESS_KEY = 'solar.auth.access';
const REFRESH_KEY = 'solar.auth.refresh';

const isBrowser = () => typeof window !== 'undefined';

export const tokenStore = {
  getAccess(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear(): void {
    if (!isBrowser()) return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};
