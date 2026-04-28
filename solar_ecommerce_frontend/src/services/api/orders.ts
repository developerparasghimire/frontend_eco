import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { Cart, CheckoutInput, Order } from '@/types/order';

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

  cancel: (id: string, reason?: string) =>
    request<Order>({ method: 'POST', url: `/api/orders/list/${id}/cancel/`, data: { reason } }),

  // Payments
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
};
