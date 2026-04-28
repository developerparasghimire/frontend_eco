'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addressApi } from '@/services/api/auth';
import { useAuthStatus } from '@/store/auth';
import type { AddressInput } from '@/types/auth';

const KEY = ['addresses'] as const;

export function useAddresses() {
  const status = useAuthStatus();
  return useQuery({
    queryKey: KEY,
    queryFn: () => addressApi.list(),
    enabled: status === 'authenticated',
    staleTime: 60_000,
  });
}

export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddressInput) => addressApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AddressInput> }) =>
      addressApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
