'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

import { InvoiceDownloadButton } from '@/components/orders/InvoiceDownloadButton';
import { StripeCheckout } from '@/components/checkout/StripeCheckout';
import { ordersApi } from '@/services/api/orders';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order } from '@/types/order';

export default function GuestOrderPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const search = useSearchParams();
  const justPlaced = search.get('placed') === '1';
  // Token may come from URL or sessionStorage (set by guest checkout flow).
  const tokenFromUrl = search.get('token') ?? '';
  const [token, setToken] = useState(tokenFromUrl);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = sessionStorage.getItem(`guest_order_${orderNumber}`);
      if (stored) setToken(stored);
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (!token || !orderNumber) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    ordersApi
      .guestDetail(orderNumber, token)
      .then((o) => {
        if (!cancelled) {
          setOrder(o);
          setError(null);
        }
      })
      .catch(() => {
        if (!cancelled) setError('Order not found or access link expired.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

  if (!token) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Access link required</h1>
        <p className="mt-2 text-sm text-slate-500">
          Open the confirmation link from your order email to view this order.
        </p>
      </div>
    );
  }
  if (loading) {
    return <div className="container py-12 text-sm text-slate-500">Loading order…</div>;
  }
  if (error || !order) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Order not found</h1>
        <p className="mt-2 text-sm text-slate-500">{error}</p>
        <Link
          href="/products"
          className="mt-6 inline-block text-sm text-brand-600 hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-10">
      {justPlaced ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={20} />
          <span>
            <strong>Thanks for your order!</strong> A confirmation email has been sent to{' '}
            <strong>{order.customer_email ?? order.guest_email ?? ''}</strong>. Bookmark this
            page — you&apos;ll need the access link to come back.
          </span>
        </div>
      ) : null}

      <h1 className="text-2xl font-semibold text-slate-900">Order {order.order_number}</h1>
      <p className="mt-1 text-sm text-slate-500">Placed on {formatDate(order.created_at)}</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">Items</h2>
            <ul className="mt-3 divide-y divide-slate-100">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between gap-3 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900">{it.product_name}</p>
                    <p className="text-xs text-slate-500">
                      SKU {it.sku} · qty {it.quantity}
                      {it.include_installation ? ' · with installation' : ''}
                    </p>
                  </div>
                  <p className="font-medium text-slate-900">{formatPrice(it.line_total)}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm">
            <h2 className="text-base font-semibold text-slate-900">Shipping</h2>
            <div className="mt-2 space-y-0.5 text-slate-700">
              <p>{order.shipping_full_name}</p>
              <p>{order.shipping_phone}</p>
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm">
          <h2 className="text-base font-semibold text-slate-900">Summary</h2>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Installation</dt>
              <dd className="font-medium text-slate-900">{formatPrice(order.installation_total)}</dd>
            </div>
            {Number(order.discount_amount) > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount</dt>
                <dd className="font-medium">− {formatPrice(order.discount_amount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="text-slate-600">Shipping</dt>
              <dd className="font-medium text-slate-900">
                {Number(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}
              </dd>
            </div>
            {Number(order.tax_amount) > 0 ? (
              <div className="flex justify-between">
                <dt className="text-slate-600">Tax</dt>
                <dd className="font-medium text-slate-900">{formatPrice(order.tax_amount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900">{formatPrice(order.grand_total)}</dd>
            </div>
          </dl>
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            <p>Payment: {order.payment_method.toUpperCase()}</p>
            <p>Status: {order.payment_status}</p>
          </div>

          {(order.payment_method === 'stripe' || order.payment_method === 'card') &&
           order.payment_status === 'unpaid' && order.status !== 'cancelled' ? (
            <div className="border-t border-slate-200 pt-4">
              <p className="mb-3 text-sm font-medium text-slate-900">Complete your payment</p>
              <StripeCheckout
                order={order}
                guestToken={token}
                onPaid={() => {
                  ordersApi.guestDetail(order.order_number, token).then(setOrder).catch(() => {});
                }}
              />
            </div>
          ) : null}

          <InvoiceDownloadButton orderNumber={order.order_number} guestToken={token} />
          <p className="text-center text-xs text-slate-500">
            Want to track returns and reorder easily?{' '}
            <Link href="/register" className="text-brand-600 hover:underline">
              Create an account
            </Link>
          </p>
        </aside>
      </div>
    </div>
  );
}
