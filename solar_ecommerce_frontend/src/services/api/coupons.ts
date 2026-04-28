import { request } from '@/services/http';
import type { CouponPreview } from '@/types/coupon';

export const couponsApi = {
  apply: (code: string) =>
    request<CouponPreview>({
      method: 'POST',
      url: '/api/coupons/apply/',
      data: { code },
    }),
};
