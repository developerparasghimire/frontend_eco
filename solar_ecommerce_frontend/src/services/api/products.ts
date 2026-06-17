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

// ── Admin: categories CRUD ─────────────────────
export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parent?: string | null;
  is_active?: boolean;
}

export const adminCategoriesApi = {
  list: () =>
    request<Paginated<Category>>({ method: 'GET', url: '/api/products/categories/' }),
  create: (data: CategoryInput) =>
    request<Category>({ method: 'POST', url: '/api/products/categories/', data }),
  update: (slug: string, data: Partial<CategoryInput>) =>
    request<Category>({ method: 'PATCH', url: `/api/products/categories/${slug}/`, data }),
  remove: (slug: string) =>
    request<void>({ method: 'DELETE', url: `/api/products/categories/${slug}/` }),
};

// ── Admin: products CRUD ───────────────────────
export interface ProductCreateInput {
  name: string;
  slug?: string;
  sku: string;
  category: string;
  brand?: string;
  capacity?: string;
  price: string;
  discount_percent?: string;
  stock: number;
  description?: string;
  technical_description?: string;
  warranty_years?: number;
  lifespan_years?: number;
  delivery_days?: number;
  installation_available?: boolean;
  installation_fee?: string;
  tags?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export const adminProductsApi = {
  create: (data: ProductCreateInput) =>
    request<ProductDetail>({ method: 'POST', url: '/api/products/', data }),
  update: (slug: string, data: Partial<ProductCreateInput>) =>
    request<ProductDetail>({ method: 'PATCH', url: `/api/products/${slug}/`, data }),
  remove: (slug: string) =>
    request<void>({ method: 'DELETE', url: `/api/products/${slug}/` }),
  uploadImage: (slug: string, file: File, alt_text = '', is_primary = false) => {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('alt_text', alt_text);
    fd.append('is_primary', String(is_primary));
    return request<{ id: string; image: string; alt_text: string; is_primary: boolean }>({
      method: 'POST',
      url: `/api/products/${slug}/upload-image/`,
      data: fd,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
