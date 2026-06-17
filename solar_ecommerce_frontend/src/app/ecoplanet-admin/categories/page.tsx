'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminCategoriesApi, type CategoryInput } from '@/services/api/products';
import { formatApiError } from '@/lib/errors';

const EMPTY: Partial<CategoryInput> = {
  name: '',
  description: '',
  is_active: true,
};

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState<Partial<CategoryInput>>(EMPTY);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminCategoriesApi.list(),
  });

  const save = useMutation({
    mutationFn: () =>
      editingSlug
        ? adminCategoriesApi.update(editingSlug, draft)
        : adminCategoriesApi.create(draft as CategoryInput),
    onSuccess: () => {
      toast.success(editingSlug ? 'Category updated' : 'Category created');
      setDraft(EMPTY);
      setEditingSlug(null);
      void qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Save failed.')),
  });

  const remove = useMutation({
    mutationFn: (slug: string) => adminCategoriesApi.remove(slug),
    onSuccess: () => {
      toast.success('Category deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">
          {editingSlug ? `Edit category: ${editingSlug}` : 'New category'}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Name</span>
            <input
              value={draft.name ?? ''}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-slate-700">Slug (auto if blank)</span>
            <input
              value={draft.slug ?? ''}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              disabled={!!editingSlug}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-slate-50"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-slate-700">Description</span>
            <textarea
              value={draft.description ?? ''}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={3}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </label>
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
            {editingSlug ? 'Save changes' : 'Create category'}
          </Button>
          {editingSlug ? (
            <Button
              variant="outline"
              onClick={() => {
                setEditingSlug(null);
                setDraft(EMPTY);
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </section>

      <section className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-24" />
                      </td>
                    ))}
                  </tr>
                ))
              : data?.results.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{c.slug}</td>
                    <td className="px-4 py-3">
                      {c.is_active ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          Hidden
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingSlug(c.slug);
                          setDraft({
                            name: c.name,
                            slug: c.slug,
                            description: c.description,
                            is_active: c.is_active,
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="mr-3 text-xs font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete category “${c.name}”?`)) remove.mutate(c.slug);
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
