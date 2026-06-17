'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/Skeleton';
import {
  contactsAdminApi,
  type ContactMessage,
  type ContactStatus,
} from '@/services/api/adminMore';
import { formatApiError } from '@/lib/errors';
import { formatDate } from '@/lib/format';

const STATUS_OPTIONS: ContactStatus[] = ['new', 'in_progress', 'resolved', 'spam'];

const STATUS_BADGE: Record<ContactStatus, string> = {
  new: 'bg-amber-100 text-amber-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  spam: 'bg-slate-200 text-slate-600',
};

export default function AdminMessagesPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<ContactStatus | ''>('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [notes, setNotes] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'messages', statusFilter, search],
    queryFn: () =>
      contactsAdminApi.list({
        status: statusFilter || undefined,
        search: search || undefined,
      }),
  });

  const update = useMutation({
    mutationFn: (vars: { id: string; data: Partial<ContactMessage> }) =>
      contactsAdminApi.update(vars.id, vars.data),
    onSuccess: (msg) => {
      toast.success('Message updated');
      setSelected(msg);
      void qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Update failed.')),
  });

  const remove = useMutation({
    mutationFn: (id: string) => contactsAdminApi.remove(id),
    onSuccess: () => {
      toast.success('Message deleted');
      setSelected(null);
      void qc.invalidateQueries({ queryKey: ['admin', 'messages'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Contact messages</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search name, email, subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-72 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ContactStatus | '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 3 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.results.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-slate-500" colSpan={3}>
                    No messages.
                  </td>
                </tr>
              ) : (
                data?.results.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => {
                      setSelected(m);
                      setNotes(m.admin_notes ?? '');
                    }}
                    className={`cursor-pointer hover:bg-slate-50 ${
                      selected?.id === m.id ? 'bg-brand-50/40' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{m.name}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <p className="line-clamp-1">{m.subject}</p>
                      <p className="text-xs text-slate-400">{formatDate(m.created_at)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[m.status]}`}
                      >
                        {m.status.replace('_', ' ')}
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
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.subject}</h2>
                  <p className="text-sm text-slate-500">
                    From <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                    {selected.phone ? ` · ${selected.phone}` : ''}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(selected.created_at)}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this message?')) remove.mutate(selected.id);
                  }}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="mt-4 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                {selected.message}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="font-medium text-slate-700">Status</span>
                  <select
                    value={selected.status}
                    onChange={(e) =>
                      update.mutate({
                        id: selected.id,
                        data: { status: e.target.value as ContactStatus },
                      })
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-4 flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Internal notes</span>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
                <button
                  type="button"
                  onClick={() =>
                    update.mutate({ id: selected.id, data: { admin_notes: notes } })
                  }
                  disabled={update.isPending}
                  className="mt-2 inline-flex w-fit items-center rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-60"
                >
                  Save notes
                </button>
              </label>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a message to view details.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
