'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ordersApi } from '@/services/api/orders';
import { useAuthStatus } from '@/store/auth';
import type { CheckoutInput } from '@/types/order';

export function useOrders() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list(),
    enabled: status === 'authenticated',
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.detail(id),
    enabled: Boolean(id),
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckoutInput) => ordersApi.checkout(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => ordersApi.cancel(id, reason),
    onSuccess: (order) => {
      qc.setQueryData(['order', order.id], order);
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
