import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { CouponPreview } from '@/types/coupon';

export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  max_discount_amount: string | null;
  min_order_amount: string;
  usage_limit: number | null;
  used_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  is_valid: boolean;
}

export type AdminCouponInput = Omit<AdminCoupon, 'id' | 'used_count' | 'is_valid'>;

export const couponsApi = {
  apply: (code: string) =>
    request<CouponPreview>({
      method: 'POST',
      url: '/api/coupons/apply/',
      data: { code },
    }),

  // Admin
  list: () => request<Paginated<AdminCoupon>>({ method: 'GET', url: '/api/coupons/' }),
  create: (data: Partial<AdminCouponInput>) =>
    request<AdminCoupon>({ method: 'POST', url: '/api/coupons/', data }),
  update: (code: string, data: Partial<AdminCouponInput>) =>
    request<AdminCoupon>({ method: 'PATCH', url: `/api/coupons/${code}/`, data }),
  remove: (code: string) =>
    request<void>({ method: 'DELETE', url: `/api/coupons/${code}/` }),
};
