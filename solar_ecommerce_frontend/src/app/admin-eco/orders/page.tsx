'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { Skeleton } from '@/components/ui/Skeleton';
import { ordersApi } from '@/services/api/orders';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order, OrderStatus } from '@/types/order';

const STATUSES: Array<OrderStatus | 'all'> = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

const STATUS_TONE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'orders', filter, page],
    queryFn: () =>
      ordersApi.list({
        status: filter === 'all' ? undefined : filter,
        page,
      }),
    staleTime: 30_000,
  });

  const orders: Order[] = data?.results ?? [];

  const handleFilterChange = (s: OrderStatus | 'all') => {
    setFilter(s);
    setPage(1);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Orders</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleFilterChange(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition ${
              filter === s
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                  Failed to load orders. Please try again.
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin-eco/orders/${o.id}`}
                      className="font-mono text-brand-600 hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {o.shipping_full_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(o.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {formatPrice(o.grand_total)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        STATUS_TONE[o.status] ?? 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-slate-600">
                    {o.payment_method} · {o.payment_status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (data.previous || data.next) ? (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
