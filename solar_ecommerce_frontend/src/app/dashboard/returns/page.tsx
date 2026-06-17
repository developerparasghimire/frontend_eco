'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Skeleton } from '@/components/ui/Skeleton';
import { returnsApi, type ReturnStatus } from '@/services/api/returns';
import { formatDate, formatPrice } from '@/lib/format';

const STATUS_BADGE: Record<ReturnStatus, string> = {
  requested: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  received: 'bg-purple-100 text-purple-800',
  refunded: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
};

function ReturnsContent() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-returns'],
    queryFn: () => returnsApi.list(),
  });

  return (
    <div className="container max-w-4xl py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">My returns</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : data?.results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              You haven&apos;t requested any returns yet.
            </p>
            <Link
              href="/dashboard/orders"
              className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              View your orders →
            </Link>
          </div>
        ) : (
          data?.results.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-medium text-slate-900">
                    {r.rma_number}
                  </p>
                  <p className="text-xs text-slate-500">
                    Requested {formatDate(r.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                >
                  {r.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-700 line-clamp-2">{r.reason}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {r.items.length} item(s)
                </span>
                <span className="font-semibold text-slate-900">
                  Refund: {formatPrice(r.refund_amount)}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default function MyReturnsPage() {
  return (
    <ProtectedRoute>
      <ReturnsContent />
    </ProtectedRoute>
  );
}
