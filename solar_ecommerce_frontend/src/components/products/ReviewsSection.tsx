'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { RatingStars } from '@/components/ui/RatingStars';
import { useCreateReview, useProductReviews } from '@/hooks/useReviews';
import { formatDate } from '@/lib/format';
import { formatApiError } from '@/lib/errors';
import { useAuthStatus } from '@/store/auth';

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1, 'Required').max(120),
  comment: z.string().min(1, 'Required').max(2000),
});
type FormValues = z.infer<typeof schema>;

interface ReviewsSectionProps {
  productId: string;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const status = useAuthStatus();
  const reviewsQuery = useProductReviews(productId);
  const createReview = useCreateReview(productId);
  const [rating, setRating] = useState(5);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 5, title: '', comment: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createReview.mutateAsync({ ...values, rating, product: productId });
      reset({ rating: 5, title: '', comment: '' });
      setRating(5);
    } catch (err) {
      setSubmitError(formatApiError(err));
    }
  });

  const reviews = reviewsQuery.data?.results ?? [];

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-semibold text-slate-900">Reviews</h2>

      {reviewsQuery.isLoading ? (
        <p className="mt-4 text-sm text-slate-500">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No reviews yet. Be the first!</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{r.user_name || 'Customer'}</p>
                  <p className="text-xs text-slate-500">{formatDate(r.created_at)}</p>
                </div>
                <RatingStars value={r.rating} />
              </div>
              <h3 className="mt-3 text-base font-medium text-slate-900">{r.title}</h3>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900">Write a review</h3>
        {status !== 'authenticated' ? (
          <p className="mt-2 text-sm text-slate-500">
            Please <a href="/login" className="text-brand-600 hover:underline">sign in</a> to leave a review.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <span className="block text-sm font-medium text-slate-700">Rating</span>
              <div className="mt-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`Rate ${n} stars`}
                    className="rounded p-1 hover:bg-slate-100"
                  >
                    <RatingStars value={n <= rating ? 1 : 0} outOf={1} size={22} />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-600">{rating} / 5</span>
              </div>
            </div>

            <FormField label="Title" htmlFor="rev-title" error={errors.title?.message}>
              <Input id="rev-title" {...register('title')} />
            </FormField>

            <FormField label="Comment" htmlFor="rev-comment" error={errors.comment?.message}>
              <textarea
                id="rev-comment"
                rows={4}
                className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                {...register('comment')}
              />
            </FormField>

            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <Button type="submit" loading={isSubmitting}>
              Submit review
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
