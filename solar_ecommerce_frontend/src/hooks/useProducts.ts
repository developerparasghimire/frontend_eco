'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { productsApi, type ProductListParams } from '@/services/api/products';

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.detail(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}

export function useRelatedProducts(slug: string) {
  return useQuery({
    queryKey: ['product', slug, 'related'],
    queryFn: () => productsApi.related(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories(),
    staleTime: 10 * 60_000,
  });
}
