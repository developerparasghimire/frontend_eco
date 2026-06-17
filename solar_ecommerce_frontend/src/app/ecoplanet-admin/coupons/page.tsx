'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { couponsApi, type AdminCouponInput } from '@/services/api/coupons';
import { formatApiError } from '@/lib/errors';
import { formatDate } from '@/lib/format';

const EMPTY: Partial<AdminCouponInput> = {
  code: '',
  description: '',
  discount_type: 'percentage',
  discount_value: '10',
  min_order_amount: '0',
  per_user_limit: 1,
  valid_from: new Date().toISOString().slice(0, 10),
  valid_until: new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10),
  is_active: true,
};

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<AdminCouponInput>>(EMPTY);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => couponsApi.list(),
  });

  const create = useMutation({
    mutationFn: () => couponsApi.create(draft),
    onSuccess: () => {
      toast.success('Coupon created');
      setDraft(EMPTY);
      void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Could not create coupon.')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => couponsApi.remove(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Coupons</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">New coupon</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Code">
            <input
              value={draft.code ?? ''}
              onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
              className="input"
            />
          </Field>
          <Field label="Type">
            <select
              value={draft.discount_type}
              onChange={(e) => setDraft({ ...draft, discount_type: e.target.value as 'percentage' | 'fixed' })}
              className="input"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </Field>
          <Field label="Value">
            <input
              type="number"
              step="0.01"
              value={draft.discount_value ?? ''}
              onChange={(e) => setDraft({ ...draft, discount_value: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Min order">
            <input
              type="number"
              step="0.01"
              value={draft.min_order_amount ?? ''}
              onChange={(e) => setDraft({ ...draft, min_order_amount: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Per-user limit">
            <input
              type="number"
              value={draft.per_user_limit ?? 1}
              onChange={(e) => setDraft({ ...draft, per_user_limit: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Valid from">
            <input
              type="date"
              value={draft.valid_from ?? ''}
              onChange={(e) => setDraft({ ...draft, valid_from: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Valid until">
            <input
              type="date"
              value={draft.valid_until ?? ''}
              onChange={(e) => setDraft({ ...draft, valid_until: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Description">
            <input
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              className="input"
            />
          </Field>
        </div>
        <Button className="mt-4" loading={create.isPending} onClick={() => create.mutate()}>
          Create coupon
        </Button>
      </section>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Used</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              data?.results.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                  <td className="px-4 py-3">
                    {c.discount_type === 'percentage'
                      ? `${Number(c.discount_value)}%`
                      : `₹${Number(c.discount_value)}`}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {c.used_count}
                    {c.usage_limit ? ` / ${c.usage_limit}` : ''}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(c.valid_until)}</td>
                  <td className="px-4 py-3">
                    {c.is_valid ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        if (confirm(`Delete coupon ${c.code}?`)) remove.mutate(c.id);
                      }}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          background: white;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
      {children}
    </label>
  );
}
