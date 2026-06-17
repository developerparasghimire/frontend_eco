/**
 * Compare store — keeps up to 4 product slugs in localStorage.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_COMPARE = 4;

interface CompareState {
  slugs: string[];
  add: (slug: string) => boolean;
  remove: (slug: string) => void;
  toggle: (slug: string) => boolean;
  clear: () => void;
  has: (slug: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      add: (slug) => {
        const { slugs } = get();
        if (slugs.includes(slug)) return true;
        if (slugs.length >= MAX_COMPARE) return false;
        set({ slugs: [...slugs, slug] });
        return true;
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
      toggle: (slug) => {
        const has = get().slugs.includes(slug);
        if (has) {
          get().remove(slug);
          return false;
        }
        return get().add(slug);
      },
      clear: () => set({ slugs: [] }),
      has: (slug) => get().slugs.includes(slug),
    }),
    { name: 'solar.compare.v1' },
  ),
);

export const COMPARE_LIMIT = MAX_COMPARE;
