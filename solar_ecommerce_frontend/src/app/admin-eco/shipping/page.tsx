'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  shippingAdminApi,
  type ShippingZone,
  type ShippingZoneInput,
} from '@/services/api/adminMore';
import { formatApiError } from '@/lib/errors';

const EMPTY: Partial<ShippingZoneInput> = {
  name: '',
  states: '',
  country: 'India',
  rate: '0',
  free_above: null,
  estimated_days_min: 3,
  estimated_days_max: 7,
  is_active: true,
};

export default function AdminShippingPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<ShippingZoneInput>>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'shipping-zones'],
    queryFn: () => shippingAdminApi.list(),
  });

  const save = useMutation({
    mutationFn: () =>
      editingId
        ? shippingAdminApi.update(editingId, draft)
        : shippingAdminApi.create(draft),
    onSuccess: () => {
      toast.success(editingId ? 'Zone updated' : 'Zone created');
      setDraft(EMPTY);
      setEditingId(null);
      void qc.invalidateQueries({ queryKey: ['admin', 'shipping-zones'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Save failed.')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => shippingAdminApi.remove(id),
    onSuccess: () => {
      toast.success('Zone deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'shipping-zones'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  const startEdit = (z: ShippingZone) => {
    setEditingId(z.id);
    setDraft({
      name: z.name,
      states: z.states,
      country: z.country,
      rate: z.rate,
      free_above: z.free_above,
      estimated_days_min: z.estimated_days_min,
      estimated_days_max: z.estimated_days_max,
      is_active: z.is_active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Shipping zones</h1>
      <p className="mt-1 text-sm text-slate-500">
        Configure per-region shipping rates, free-shipping thresholds, and ETAs.
      </p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          {editingId ? 'Edit zone' : 'New zone'}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Name">
            <input
              value={draft.name ?? ''}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Country">
            <input
              value={draft.country ?? ''}
              onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Rate (₹)">
            <input
              type="number"
              step="0.01"
              value={draft.rate ?? ''}
              onChange={(e) => setDraft({ ...draft, rate: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Free above (₹) – optional">
            <input
              type="number"
              step="0.01"
              value={draft.free_above ?? ''}
              onChange={(e) =>
                setDraft({ ...draft, free_above: e.target.value || null })
              }
              className="input"
            />
          </Field>
          <Field label="ETA min (days)">
            <input
              type="number"
              value={draft.estimated_days_min ?? 3}
              onChange={(e) =>
                setDraft({ ...draft, estimated_days_min: Number(e.target.value) })
              }
              className="input"
            />
          </Field>
          <Field label="ETA max (days)">
            <input
              type="number"
              value={draft.estimated_days_max ?? 7}
              onChange={(e) =>
                setDraft({ ...draft, estimated_days_max: Number(e.target.value) })
              }
              className="input"
            />
          </Field>
          <Field label="States (comma-separated)" full>
            <textarea
              value={draft.states ?? ''}
              onChange={(e) => setDraft({ ...draft, states: e.target.value })}
              rows={2}
              placeholder="Maharashtra, Karnataka, Tamil Nadu"
              className="input"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={draft.is_active ?? true}
              onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Active
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button loading={save.isPending} onClick={() => save.mutate()}>
            {editingId ? 'Save changes' : 'Create zone'}
          </Button>
          {editingId ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditingId(null);
                setDraft(EMPTY);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Zone</th>
              <th className="px-4 py-3">States</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.results.map((z) => (
                  <tr key={z.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {z.name}
                      <p className="text-xs text-slate-400">{z.country}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 line-clamp-2 max-w-xs">
                      {z.states}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      ₹{Number(z.rate).toFixed(2)}
                      {z.free_above ? (
                        <p className="text-xs text-emerald-700">
                          Free above ₹{Number(z.free_above).toFixed(0)}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {z.estimated_days_min}–{z.estimated_days_max} days
                    </td>
                    <td className="px-4 py-3">
                      {z.is_active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => startEdit(z)}
                        className="mr-3 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete zone “${z.name}”?`)) remove.mutate(z.id);
                        }}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 2px rgb(153 246 228 / 0.5);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  full,
  children,
}: {
  label: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${full ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
      <span className="font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
