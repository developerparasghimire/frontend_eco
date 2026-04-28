'use client';

import Link from 'next/link';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useOrders } from '@/hooks/useOrders';
import { formatDate, formatPrice } from '@/lib/format';
import type { OrderStatus } from '@/types/order';

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-200 text-slate-700',
};

function OrdersList() {
  const { data, isLoading } = useOrders();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  if (isLoading) return <p className="text-sm text-slate-500">Loading orders…</p>;

  const all = data?.results ?? [];
  const filtered = filter === 'all' ? all : all.filter((o) => o.status === filter);

  if (all.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-slate-900">No orders yet</h2>
        <p className="mt-1 text-sm text-slate-500">
          When you place an order, it will show up here.
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filter === f.value
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500">No orders match this filter.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {o.order_number}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(o.created_at)} · {o.items.length} item
                      {o.items.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[o.status]}`}>
                      {o.status}
                    </span>
                    <p className="text-base font-semibold text-slate-900">
                      {formatPrice(o.grand_total)}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-5xl py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Your orders</h1>
        <div className="mt-6">
          <OrdersList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
