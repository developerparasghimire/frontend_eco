/**
 * Admin-only API helpers for resources that don't have a public surface:
 * contact messages, newsletter subscribers, shipping zones, review moderation.
 */
import { request } from '@/services/http';
import type { Paginated } from '@/types/api';

// ── Contact messages ──────────────────────────
export type ContactStatus = 'new' | 'in_progress' | 'resolved' | 'spam';

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: ContactStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export const contactsAdminApi = {
  list: (params?: { status?: ContactStatus; search?: string; page?: number }) =>
    request<Paginated<ContactMessage>>({
      method: 'GET',
      url: '/api/contacts/admin/messages/',
      params,
    }),
  update: (
    id: string,
    data: Partial<Pick<ContactMessage, 'status' | 'admin_notes'>>,
  ) =>
    request<ContactMessage>({
      method: 'PATCH',
      url: `/api/contacts/admin/messages/${id}/`,
      data,
    }),
  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/contacts/admin/messages/${id}/` }),
};

// ── Newsletter ─────────────────────────────────
export interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const newsletterAdminApi = {
  list: (params?: { is_active?: boolean; search?: string; page?: number }) =>
    request<Paginated<NewsletterSubscriber>>({
      method: 'GET',
      url: '/api/contacts/admin/newsletter/',
      params,
    }),
  update: (id: string, data: { is_active: boolean }) =>
    request<NewsletterSubscriber>({
      method: 'PATCH',
      url: `/api/contacts/admin/newsletter/${id}/`,
      data,
    }),
  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/contacts/admin/newsletter/${id}/` }),
};

// ── Shipping zones ─────────────────────────────
export interface ShippingZone {
  id: string;
  name: string;
  states: string;
  country: string;
  rate: string;
  free_above: string | null;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type ShippingZoneInput = Omit<ShippingZone, 'id' | 'created_at' | 'updated_at'>;

export const shippingAdminApi = {
  list: () =>
    request<Paginated<ShippingZone>>({
      method: 'GET',
      url: '/api/shipping/admin/zones/',
    }),
  create: (data: Partial<ShippingZoneInput>) =>
    request<ShippingZone>({
      method: 'POST',
      url: '/api/shipping/admin/zones/',
      data,
    }),
  update: (id: string, data: Partial<ShippingZoneInput>) =>
    request<ShippingZone>({
      method: 'PATCH',
      url: `/api/shipping/admin/zones/${id}/`,
      data,
    }),
  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/shipping/admin/zones/${id}/` }),
};

// ── Review moderation ──────────────────────────
export interface AdminReview {
  id: string;
  product: string;
  product_name: string;
  product_slug: string;
  user: string;
  user_name: string;
  user_email: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export const reviewsAdminApi = {
  list: (params?: { rating?: number; product?: string; search?: string; page?: number }) =>
    request<Paginated<AdminReview>>({
      method: 'GET',
      url: '/api/reviews/admin/reviews/',
      params,
    }),
  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/reviews/admin/reviews/${id}/` }),
};
