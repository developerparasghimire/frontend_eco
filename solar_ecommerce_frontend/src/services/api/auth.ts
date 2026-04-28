/**
 * Auth API service.
 * One function per endpoint. Components call these via TanStack Query
 * mutations / queries — never directly, so caches stay coherent.
 */
import { request } from '@/services/http';
import type {
  Address,
  AddressInput,
  AuthResponse,
  AuthTokens,
  User,
} from '@/types/auth';
import type { Paginated } from '@/types/api';

export interface RegisterInput {
  email: string;
  username: string;
  phone_number?: string;
  password: string;
  password2: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterInput) =>
    request<AuthResponse>({ method: 'POST', url: '/api/auth/register/', data }),

  login: (data: LoginInput) =>
    request<AuthTokens>({ method: 'POST', url: '/api/auth/login/', data }),

  logout: (refresh: string) =>
    request<{ detail: string }>({ method: 'POST', url: '/api/auth/logout/', data: { refresh } }),

  me: () => request<User>({ method: 'GET', url: '/api/auth/profile/' }),

  updateProfile: (data: Partial<Pick<User, 'first_name' | 'last_name' | 'username' | 'phone_number' | 'is_installer'>>) =>
    request<User>({ method: 'PATCH', url: '/api/auth/profile/', data }),

  changePassword: (data: { old_password: string; new_password: string }) =>
    request<{ detail: string }>({ method: 'PUT', url: '/api/auth/change-password/', data }),

  forgotPassword: (email: string) =>
    request<{ detail: string }>({ method: 'POST', url: '/api/auth/forgot-password/', data: { email } }),

  resetPassword: (data: { uid: string; token: string; new_password: string }) =>
    request<{ detail: string }>({ method: 'POST', url: '/api/auth/reset-password/', data }),
};

export const addressApi = {
  list: () => request<Paginated<Address>>({ method: 'GET', url: '/api/auth/addresses/' }),
  create: (data: AddressInput) =>
    request<Address>({ method: 'POST', url: '/api/auth/addresses/', data }),
  update: (id: string, data: Partial<AddressInput>) =>
    request<Address>({ method: 'PATCH', url: `/api/auth/addresses/${id}/`, data }),
  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/auth/addresses/${id}/` }),
};
