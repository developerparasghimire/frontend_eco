import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { Review, ReviewInput } from '@/types/review';

export const reviewsApi = {
  listForProduct: (productId: string) =>
    request<Paginated<Review>>({
      method: 'GET',
      url: '/api/reviews/',
      params: { product: productId },
    }),

  create: (data: ReviewInput) =>
    request<Review>({ method: 'POST', url: '/api/reviews/', data }),

  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/reviews/${id}/` }),
};
