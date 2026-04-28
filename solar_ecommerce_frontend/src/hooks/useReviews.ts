'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { reviewsApi } from '@/services/api/reviews';
import type { ReviewInput } from '@/types/review';

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.listForProduct(productId),
    enabled: Boolean(productId),
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewInput) => reviewsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['product'] });
    },
  });
}
