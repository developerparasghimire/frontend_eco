import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { User } from '@/types/auth';

export interface AdminDashboardStats {
  orders: {
    total_orders: number;
    total_revenue: string;
    pending_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
  };
  recent_30d: { orders: number; revenue: string };
  products: {
    total_products: number;
    active_products: number;
    out_of_stock: number;
    low_stock: number;
    featured_products: number;
    total_categories: number;
  };
  customers: { total_customers: number; new_customers_30d: number };
  support: { new_messages: number; newsletter_subscribers: number };
}

export const adminApi = {
  dashboard: () =>
    request<AdminDashboardStats>({ method: 'GET', url: '/api/auth/admin/dashboard/' }),

  exportProductsCsv: () =>
    request<Blob>({
      method: 'GET',
      url: '/api/products/export-csv/',
      responseType: 'blob',
    }),

  importProductsCsv: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return request<{ created: number; updated: number; skipped: number; errors: string[] }>({
      method: 'POST',
      url: '/api/products/import-csv/',
      data: fd,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  customers: (params?: { search?: string; page?: number }) =>
    request<Paginated<User>>({ method: 'GET', url: '/api/auth/admin/customers/', params }),
};
