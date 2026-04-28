'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { wishlistApi } from '@/services/api/wishlist';
import { useAuthStatus } from '@/store/auth';

const WISHLIST_KEY = ['wishlist'] as const;

export function useWishlist() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: WISHLIST_KEY,
    queryFn: () => wishlistApi.list(),
    enabled: status === 'authenticated',
    staleTime: 30_000,
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistApi.add(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wishlistApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: WISHLIST_KEY }),
  });
}
