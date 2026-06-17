'use client';

import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RatingStars } from '@/components/ui/RatingStars';
import { Skeleton } from '@/components/ui/Skeleton';
import { reviewsApi } from '@/services/api/reviews';
import { formatApiError } from '@/lib/errors';
import { formatDate } from '@/lib/format';

function ReviewsContent() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewsApi.mine(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => reviewsApi.remove(id),
    onSuccess: () => {
      toast.success('Review deleted');
      void qc.invalidateQueries({ queryKey: ['my-reviews'] });
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <div className="container max-w-4xl py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">My reviews</h1>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))
        ) : data?.results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-sm text-slate-500">
              You haven&apos;t written any reviews yet.
            </p>
          </div>
        ) : (
          data?.results.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <RatingStars value={r.rating} />
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {r.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Posted {formatDate(r.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this review?')) remove.mutate(r.id);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={12} /> Delete
                </button>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-slate-700">
                {r.comment}
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

export default function MyReviewsPage() {
  return (
    <ProtectedRoute>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
