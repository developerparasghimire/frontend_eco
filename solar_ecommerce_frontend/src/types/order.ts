import type { ProductListItem } from './product';

export interface CartItem {
  id: string;
  product: string;
  product_detail: ProductListItem;
  quantity: number;
  include_installation: boolean;
  unit_price: string;
  line_total: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_items: number;
  subtotal: string;
  installation_total: string;
  grand_total: string;
  updated_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cod' | 'paypal' | 'upi' | 'card' | 'netbanking';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  product: string;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  include_installation: boolean;
  installation_fee: string;
  line_total: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  subtotal: string;
  installation_total: string;
  discount_amount: string;
  coupon_code: string;
  grand_total: string;
  payment_status: PaymentStatus;
  payment_id: string;
  paid_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string;
  note: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface CheckoutInput {
  address_id: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
  note?: string;
}
