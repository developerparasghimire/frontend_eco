import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { Category, ProductDetail, ProductListItem } from '@/types/product';

export interface ProductListParams {
  search?: string;
  category__slug?: string;
  is_featured?: boolean;
  ordering?: 'price' | '-price' | 'created_at' | '-created_at';
  page?: number;
}

export const productsApi = {
  list: (params?: ProductListParams) =>
    request<Paginated<ProductListItem>>({ method: 'GET', url: '/api/products/', params }),

  detail: (slug: string) =>
    request<ProductDetail>({ method: 'GET', url: `/api/products/${slug}/` }),

  related: (slug: string) =>
    request<ProductListItem[]>({ method: 'GET', url: `/api/products/${slug}/related/` }),

  featured: () =>
    request<ProductListItem[]>({ method: 'GET', url: '/api/products/featured/' }),

  categories: () =>
    request<Paginated<Category>>({ method: 'GET', url: '/api/products/categories/' }),
};
