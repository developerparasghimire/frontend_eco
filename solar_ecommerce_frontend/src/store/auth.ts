/**
 * Auth store (Zustand).
 *
 * Holds the current user and provides high-level actions (login, register,
 * logout, hydrate). JWT tokens themselves live in `tokenStore` (localStorage);
 * this store exposes the *user* and *status* derived from those tokens.
 */
import { create } from 'zustand';

import { authApi, type LoginInput, type RegisterInput } from '@/services/api/auth';
import { tokenStore } from '@/lib/tokens';
import type { User } from '@/types/auth';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;

  hydrate: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<{ detail: string; email: string }>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'idle',

  hydrate: async () => {
    const token = tokenStore.getAccess() ?? tokenStore.getRefresh();
    if (!token) {
      set({ status: 'unauthenticated' });
      return;
    }
    set({ status: 'loading' });
    try {
      const user = await authApi.me();
      set({ user, status: 'authenticated' });
    } catch {
      tokenStore.clear();
      set({ user: null, status: 'unauthenticated' });
    }
  },

  login: async (input) => {
    const tokens = await authApi.login(input);
    tokenStore.set(tokens.access, tokens.refresh);
    const user = await authApi.me();
    set({ user, status: 'authenticated' });
  },

  googleLogin: async (credential) => {
    const res = await authApi.googleLogin(credential);
    tokenStore.set(res.access, res.refresh);
    const user = res.user ?? await authApi.me();
    set({ user, status: 'authenticated' });
  },

  register: async (input) => {
    // Backend creates the account inactive and emails an activation link.
    // No tokens are issued until the user verifies their email.
    const res = await authApi.register(input);
    set({ user: null, status: 'unauthenticated' });
    return res;
  },

  logout: async () => {
    const refresh = tokenStore.getRefresh();
    if (refresh) {
      try {
        await authApi.logout(refresh);
      } catch {
        // Even if blacklist fails, clear local state.
      }
    }
    tokenStore.clear();
    set({ user: null, status: 'unauthenticated' });
  },

  setUser: (user) => set({ user, status: user ? 'authenticated' : 'unauthenticated' }),
}));

/** Convenience selector hooks. */
export const useUser = () => useAuthStore((s) => s.user);
export const useAuthStatus = () => useAuthStore((s) => s.status);
