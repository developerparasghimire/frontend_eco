/**
 * Recently-viewed product slugs, persisted in localStorage.
 * Most-recent first. Capped at 10 entries.
 */
const KEY = 'solar.recentlyViewed';
const MAX = 10;

function read(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(slugs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(slugs.slice(0, MAX)));
  } catch {
    /* ignore quota errors */
  }
}

export const recentlyViewed = {
  get: (excludeSlug?: string): string[] =>
    read().filter((s) => s !== excludeSlug),

  add: (slug: string) => {
    const current = read().filter((s) => s !== slug);
    current.unshift(slug);
    write(current);
  },

  clear: () => write([]),
};
