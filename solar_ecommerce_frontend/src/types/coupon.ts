export type DiscountType = 'percentage' | 'fixed';

/** What `/api/coupons/apply/` returns when a coupon is valid for the cart. */
export interface CouponPreview {
  coupon: string;
  discount_type: DiscountType;
  discount_value: string;
  discount_amount: string;
  subtotal_before: string;
  subtotal_after: string;
}
