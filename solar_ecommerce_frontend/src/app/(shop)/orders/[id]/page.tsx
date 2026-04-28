'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PayPalCheckout } from '@/components/checkout/PayPalCheckout';
import { Button } from '@/components/ui/Button';
import { useOrder, useCancelOrder } from '@/hooks/useOrders';
import { formatApiError } from '@/lib/errors';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order, OrderStatus, PaymentStatus } from '@/types/order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-200 text-slate-700',
};

const PAYMENT_BADGE: Record<PaymentStatus, string> = {
  unpaid: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
  refunded: 'bg-slate-200 text-slate-700',
};

const TIMELINE: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function StatusTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        Order cancelled{order.cancelled_at ? ` on ${formatDate(order.cancelled_at)}` : ''}.
        {order.cancellation_reason ? ` Reason: ${order.cancellation_reason}` : ''}
      </div>
    );
  }
  const currentIdx = TIMELINE.indexOf(order.status);

  return (
    <ol className="flex flex-wrap gap-3 text-xs">
      {TIMELINE.map((step, idx) => {
        const reached = idx <= currentIdx;
        return (
          <li
            key={step}
            className={`flex items-center gap-2 rounded-full px-3 py-1 ${
              reached ? 'bg-brand-100 text-brand-800' : 'bg-slate-100 text-slate-500'
            }`}
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                reached ? 'bg-brand-500 text-white' : 'bg-slate-300 text-white'
              }`}
            >
              {idx + 1}
            </span>
            {STATUS_LABEL[step]}
          </li>
        );
      })}
    </ol>
  );
}

function OrderDetailInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const justPlaced = search.get('placed') === '1';
  const { data: order, isLoading, error: loadError, refetch } = useOrder(id);
  const cancel = useCancelOrder();
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return <div className="container py-12 text-sm text-slate-500">Loading order…</div>;
  }
  if (loadError || !order) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Order not found</h1>
        <Link href="/dashboard/orders" className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Back to orders
        </Link>
      </div>
    );
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this order? Stock will be restored.')) return;
    setActionError(null);
    try {
      await cancel.mutateAsync({ id: order.id, reason: 'Cancelled by customer' });
    } catch (err) {
      setActionError(formatApiError(err, 'Could not cancel order.'));
    }
  };

  const needsPayPal =
    order.payment_method === 'paypal' && order.payment_status === 'unpaid' && order.status !== 'cancelled';
  const isCod = order.payment_method === 'cod';

  return (
    <div className="container max-w-5xl py-10">
      {justPlaced ? (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle2 size={20} />
          <span>
            <strong>Thanks for your order!</strong> A confirmation email is on its way.
          </span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Order {order.order_number}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${PAYMENT_BADGE[order.payment_status]}`}>
            {order.payment_status === 'paid' ? 'Paid' : order.payment_status === 'refunded' ? 'Refunded' : 'Unpaid'}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <StatusTimeline order={order} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {needsPayPal ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-base font-semibold text-slate-900">Complete payment</h2>
              <p className="mt-1 text-sm text-slate-500">
                Approve via PayPal to finalize your order.
              </p>
              <div className="mt-4">
                <PayPalCheckout order={order} onCaptured={() => void refetch()} />
              </div>
            </section>
          ) : null}

          {isCod && order.payment_status === 'unpaid' && order.status !== 'cancelled' ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              You chose <strong>cash on delivery</strong>. Please have payment ready when your
              order arrives.
            </section>
          ) : null}

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
                <dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</dt>
                <dd className="font-medium">− {formatPrice(order.discount_amount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-semibold text-slate-900">{formatPrice(order.grand_total)}</dd>
            </div>
          </dl>

          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            <p>Payment: {order.payment_method.toUpperCase()}</p>
            {order.paid_at ? <p>Paid on {formatDate(order.paid_at)}</p> : null}
          </div>

          {order.status === 'pending' ? (
            <Button
              variant="outline"
              block
              onClick={handleCancel}
              loading={cancel.isPending}
            >
              Cancel order
            </Button>
          ) : null}
          {actionError ? <p className="text-sm text-red-600">{actionError}</p> : null}

          <Link
            href="/dashboard/orders"
            className="block text-center text-sm text-brand-600 hover:underline"
          >
            All orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute>
      <OrderDetailInner />
    </ProtectedRoute>
  );
}
