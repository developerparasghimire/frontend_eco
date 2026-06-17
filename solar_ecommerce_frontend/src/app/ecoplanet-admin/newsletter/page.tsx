'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/Skeleton';
import { newsletterAdminApi } from '@/services/api/adminMore';
import { formatApiError } from '@/lib/errors';
import { formatDate } from '@/lib/format';

export default function AdminNewsletterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'' | 'active' | 'inactive'>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'newsletter', search, activeFilter],
    queryFn: () =>
      newsletterAdminApi.list({
        search: search || undefined,
        is_active: activeFilter === '' ? undefined : activeFilter === 'active',
      }),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; is_active: boolean }) =>
      newsletterAdminApi.update(vars.id, { is_active: vars.is_active }),
    onSuccess: () => {
      toast.success('Subscriber updated');
      void qc.invalidateQueries({ queryKey: ['admin', 'newsletter'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Update failed.')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => newsletterAdminApi.remove(id),
    onSuccess: () => {
      toast.success('Subscriber removed');
      void qc.invalidateQueries({ queryKey: ['admin', 'newsletter'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  const exportCsv = () => {
    const rows = data?.results ?? [];
    const csv = [
      'email,is_active,created_at',
      ...rows.map((r) =>
        [r.email, r.is_active, r.created_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${Date.now()}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Newsletter subscribers</h1>
        <button
          onClick={exportCsv}
          disabled={!data?.results?.length}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Export CSV
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value as typeof activeFilter)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Unsubscribed</option>
        </select>
      </div>

      <section className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Subscribed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.results.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{s.email}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      {s.is_active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          update.mutate({ id: s.id, is_active: !s.is_active })
                        }
                        className="mr-3 text-xs font-medium text-brand-600 hover:underline"
                      >
                        {s.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete subscriber ${s.email}?`)) remove.mutate(s.id);
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
    </div>
  );
}
