'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/Skeleton';
import { returnsApi, type ReturnRequest, type ReturnStatus } from '@/services/api/returns';
import { formatApiError } from '@/lib/errors';
import { formatDate, formatPrice } from '@/lib/format';

const STATUS_OPTIONS: ReturnStatus[] = [
  'requested',
  'approved',
  'rejected',
  'in_transit',
  'received',
  'refunded',
  'completed',
];

const STATUS_BADGE: Record<ReturnStatus, string> = {
  requested: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  in_transit: 'bg-indigo-100 text-indigo-800',
  received: 'bg-purple-100 text-purple-800',
  refunded: 'bg-emerald-100 text-emerald-800',
  completed: 'bg-slate-200 text-slate-700',
};

export default function AdminReturnsPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'returns'],
    queryFn: () => returnsApi.list(),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; status: ReturnStatus; notes?: string }) =>
      returnsApi.updateStatus(vars.id, vars.status, vars.notes),
    onSuccess: (rma) => {
      toast.success(`Return ${rma.rma_number} updated`);
      setSelected(rma);
      void qc.invalidateQueries({ queryKey: ['admin', 'returns'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Update failed.')),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Returns / RMAs</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">RMA</th>
                <th className="px-4 py-3">Refund</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 3 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.results.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={3}>
                    No return requests yet.
                  </td>
                </tr>
              ) : (
                data?.results.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => {
                      setSelected(r);
                      setNotes(r.admin_notes ?? '');
                    }}
                    className={`cursor-pointer hover:bg-slate-50 ${
                      selected?.id === r.id ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-medium text-slate-900">
                        {r.rma_number}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(r.created_at)}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatPrice(r.refund_amount)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[r.status]}`}
                      >
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {selected.rma_number}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Order {selected.order} · {formatDate(selected.created_at)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_BADGE[selected.status]}`}
                >
                  {selected.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Reason</p>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  {selected.reason}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">Items</p>
                <ul className="mt-1 space-y-1 text-sm text-slate-700">
                  {selected.items.map((it) => (
                    <li key={it.id} className="flex justify-between">
                      <span>
                        Item {it.order_item.slice(0, 8)}… × {it.quantity}
                      </span>
                      <span className="font-medium">{formatPrice(it.refund_amount)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-right text-sm font-semibold text-slate-900">
                  Refund total: {formatPrice(selected.refund_amount)}
                </p>
              </div>

              <label className="mt-4 flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Internal notes</span>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </label>

              <div className="mt-4 flex flex-wrap gap-2">
                {STATUS_OPTIONS.filter((s) => s !== selected.status).map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      update.mutate({ id: selected.id, status: s, notes })
                    }
                    disabled={update.isPending}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                  >
                    Mark {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select an RMA to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
