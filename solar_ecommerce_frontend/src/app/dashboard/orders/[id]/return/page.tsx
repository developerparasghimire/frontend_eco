'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useOrder } from '@/hooks/useOrders';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { returnsApi } from '@/services/api/returns';

const REASONS = [
  { value: 'defective', label: 'Defective / damaged item' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'not_as_described', label: 'Not as described' },
  { value: 'no_longer_needed', label: 'No longer needed' },
  { value: 'other', label: 'Other' },
];

function ReturnInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const [reason, setReason] = useState(REASONS[0].value);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const createReturn = useMutation({
    mutationFn: () => {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([order_item, quantity]) => ({ order_item, quantity }));
      if (!items.length) {
        throw new Error('Select at least one item to return.');
      }
      return returnsApi.create({ order: id, reason, items });
    },
    onSuccess: (data) => {
      toast.success(`Return ${data.rma_number} submitted`);
      router.push('/dashboard/orders');
    },
    onError: (err) => setError(formatApiError(err, 'Could not submit return.')),
  });

  if (isLoading) return <div className="container py-12 text-sm text-slate-500">Loading…</div>;
  if (!order) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Order not found</h1>
      </div>
    );
  }
  if (order.status !== 'delivered') {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Returns are only available for delivered orders.
        </h1>
        <Link href={`/orders/${id}`} className="mt-4 inline-block text-sm text-brand-600 hover:underline">
          Back to order
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <Link href={`/orders/${id}`} className="text-sm text-brand-600 hover:underline">
        ← Back to order
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">Request a return</h1>
      <p className="mt-1 text-sm text-slate-600">
        Order <span className="font-mono">{order.order_number}</span>
      </p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Items to return</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {order.items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="font-medium text-slate-900">{it.product_name}</p>
                <p className="text-xs text-slate-500">
                  Ordered {it.quantity} · {formatPrice(it.unit_price)} each
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                Qty to return
                <input
                  type="number"
                  min={0}
                  max={it.quantity}
                  value={quantities[it.id] ?? 0}
                  onChange={(e) =>
                    setQuantities((q) => ({
                      ...q,
                      [it.id]: Math.max(0, Math.min(it.quantity, Number(e.target.value))),
                    }))
                  }
                  className="w-20 rounded-md border border-slate-300 px-2 py-1 text-right"
                />
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Reason for return</h2>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-sm"
        >
          {REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </section>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      <Button
        size="lg"
        block
        loading={createReturn.isPending}
        onClick={() => {
          setError(null);
          createReturn.mutate();
        }}
        className="mt-6"
      >
        Submit return request
      </Button>
    </div>
  );
}

export default function ReturnRequestPage() {
  return (
    <ProtectedRoute>
      <ReturnInner />
    </ProtectedRoute>
  );
}
