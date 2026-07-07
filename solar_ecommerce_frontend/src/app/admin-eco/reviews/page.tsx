'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Skeleton } from '@/components/ui/Skeleton';
import { reviewsAdminApi } from '@/services/api/adminMore';
import { formatApiError } from '@/lib/errors';
import { formatDate } from '@/lib/format';
import { RatingStars } from '@/components/ui/RatingStars';

export default function AdminReviewsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | ''>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', search, ratingFilter],
    queryFn: () =>
      reviewsAdminApi.list({
        search: search || undefined,
        rating: ratingFilter || undefined,
      }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => reviewsAdminApi.remove(id),
    onSuccess: () => {
      toast.success('Review deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Review moderation</h1>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          placeholder="Search title, comment, user, product…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value ? Number(e.target.value) : '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>
              {r} stars
            </option>
          ))}
        </select>
      </div>

      <section className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))
        ) : data?.results.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No reviews match your filters.
          </p>
        ) : (
          data?.results.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.product_name}</p>
                  <p className="text-xs text-slate-500">
                    by {r.user_name || r.user_email} · {formatDate(r.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RatingStars value={r.rating} />
                  <button
                    onClick={() => {
                      if (confirm('Delete this review? This cannot be undone.')) {
                        remove.mutate(r.id);
                      }
                    }}
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {r.title ? (
                <p className="mt-2 text-sm font-semibold text-slate-800">{r.title}</p>
              ) : null}
              {r.comment ? (
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{r.comment}</p>
              ) : null}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
