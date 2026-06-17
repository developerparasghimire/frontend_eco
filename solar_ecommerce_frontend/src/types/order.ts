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

export type PaymentMethod = 'cod' | 'paypal' | 'stripe' | 'upi' | 'card' | 'netbanking';
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
  guest_email?: string;
  guest_access_token?: string;
  customer_email?: string;
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
  tax_rate: string;
  tax_amount: string;
  shipping_cost: string;
  grand_total: string;
  payment_status: PaymentStatus;
  payment_id: string;
  paid_at: string | null;
  tracking_number: string;
  tracking_url: string;
  courier_name: string;
  estimated_delivery_date: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  refund_amount: string;
  refunded_at: string | null;
  refund_reference: string;
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

export interface CheckoutQuote {
  subtotal: string;
  installation_total: string;
  discount_amount: string;
  tax_rate: string;
  tax_amount: string;
  shipping_cost: string;
  shipping_zone: string | null;
  shipping_eta_min: number | null;
  shipping_eta_max: number | null;
  grand_total: string;
  currency: string;
}

export interface GuestCheckoutItemInput {
  product: string;
  quantity: number;
  include_installation: boolean;
}

export interface GuestCheckoutInput {
  email: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  payment_method: PaymentMethod;
  coupon_code?: string;
  note?: string;
  items: GuestCheckoutItemInput[];
}
