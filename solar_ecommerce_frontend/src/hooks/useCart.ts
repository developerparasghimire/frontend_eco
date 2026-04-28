'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartApi, type AddToCartInput } from '@/services/api/orders';
import { useAuthStatus } from '@/store/auth';

const CART_KEY = ['cart'] as const;

export function useCart() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => cartApi.get(),
    enabled: status === 'authenticated',
    staleTime: 10_000,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddToCartInput) => cartApi.add(data),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity, include_installation }: { itemId: string; quantity?: number; include_installation?: boolean }) =>
      cartApi.update(itemId, { quantity, include_installation }),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartApi.remove(itemId),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: (cart) => qc.setQueryData(CART_KEY, cart),
  });
}
