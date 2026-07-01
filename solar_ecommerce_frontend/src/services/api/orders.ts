import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { Cart, CheckoutInput, CheckoutQuote, GuestCheckoutInput, Order } from '@/types/order';

export interface AddToCartInput {
  product: string;
  quantity?: number;
  include_installation?: boolean;
}

export const cartApi = {
  get: () => request<Cart>({ method: 'GET', url: '/api/orders/cart/' }),

  add: (data: AddToCartInput) =>
    request<Cart>({ method: 'POST', url: '/api/orders/cart/add/', data }),

  update: (itemId: string, data: { quantity?: number; include_installation?: boolean }) =>
    request<Cart>({ method: 'PATCH', url: `/api/orders/cart/items/${itemId}/`, data }),

  remove: (itemId: string) =>
    request<Cart>({ method: 'DELETE', url: `/api/orders/cart/items/${itemId}/` }),

  clear: () =>
    request<Cart>({ method: 'DELETE', url: '/api/orders/cart/clear/' }),
};

export const ordersApi = {
  list: () => request<Paginated<Order>>({ method: 'GET', url: '/api/orders/list/' }),

  detail: (id: string) =>
    request<Order>({ method: 'GET', url: `/api/orders/list/${id}/` }),

  checkout: (data: CheckoutInput) =>
    request<Order>({ method: 'POST', url: '/api/orders/checkout/', data }),

  quote: (data: { address_id: string; coupon_code?: string }) =>
    request<CheckoutQuote>({ method: 'POST', url: '/api/orders/checkout/quote/', data }),

  cancel: (id: string, reason?: string) =>
    request<Order>({ method: 'POST', url: `/api/orders/list/${id}/cancel/`, data: { reason } }),

  // ── PayPal ─────────────────────────────────
  paypalCreate: (id: string) =>
    request<{ paypal_order_id: string; status: string; links: Array<{ href: string; rel: string }> }>({
      method: 'POST',
      url: `/api/orders/list/${id}/payments/paypal/create/`,
    }),

  paypalCapture: (id: string, paypal_order_id: string) =>
    request<Order>({
      method: 'POST',
      url: `/api/orders/list/${id}/payments/paypal/capture/`,
      data: { paypal_order_id },
    }),

  // ── Stripe ─────────────────────────────────
  stripeCreate: (id: string) =>
    request<{ client_secret: string; payment_intent_id: string; publishable_key: string }>({
      method: 'POST',
      url: `/api/orders/list/${id}/payments/stripe/create/`,
    }),

  stripeConfirm: (id: string) =>
    request<Order>({
      method: 'POST',
      url: `/api/orders/list/${id}/payments/stripe/confirm/`,
    }),

  // ── Admin actions ──────────────────────────
  refund: (id: string, data: { amount?: string; reason?: string; note?: string }) =>
    request<Order>({ method: 'POST', url: `/api/orders/list/${id}/refund/`, data }),

  setTracking: (
    id: string,
    data: { tracking_number: string; courier_name?: string; tracking_url?: string; estimated_delivery_date?: string },
  ) => request<Order>({ method: 'POST', url: `/api/orders/list/${id}/tracking/`, data }),

  updateStatus: (id: string, status: Order['status']) =>
    request<Order>({ method: 'POST', url: `/api/orders/list/${id}/update-status/`, data: { status } }),

  // ── Guest checkout ─────────────────────────
  guestCheckout: (data: GuestCheckoutInput) =>
    request<Order & { guest_access_token: string }>({
      method: 'POST',
      url: '/api/orders/checkout/guest/',
      data,
    }),

  guestDetail: (orderNumber: string, token: string) =>
    request<Order & { guest_access_token: string }>({
      method: 'GET',
      url: `/api/orders/guest/${orderNumber}/`,
      params: { token },
    }),

  guestStripeCreate: (orderNumber: string, token: string) =>
    request<{ client_secret: string; payment_intent_id: string; publishable_key: string }>({
      method: 'POST',
      url: `/api/orders/guest/${orderNumber}/stripe/create/`,
      params: { token },
    }),

  guestStripeConfirm: (orderNumber: string, token: string) =>
    request<Order>({
      method: 'POST',
      url: `/api/orders/guest/${orderNumber}/stripe/confirm/`,
      params: { token },
    }),

  // ── Invoice PDF ────────────────────────────
  // Download invoice as a Blob (uses axios interceptor for JWT). For guest
  // orders pass the access token; the backend treats it as proof of access.
  invoiceBlob: (orderNumber: string, token?: string): Promise<Blob> =>
    request<Blob>({
      method: 'GET',
      url: `/api/orders/${encodeURIComponent(orderNumber)}/invoice.pdf`,
      params: token ? { token } : undefined,
      responseType: 'blob',
    }),
};

