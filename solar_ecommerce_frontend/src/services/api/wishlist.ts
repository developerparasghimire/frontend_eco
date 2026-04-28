import { request } from '@/services/http';
import type { Paginated } from '@/types/api';
import type { WishlistItem } from '@/types/wishlist';

export const wishlistApi = {
  list: () => request<Paginated<WishlistItem>>({ method: 'GET', url: '/api/wishlists/' }),

  add: (productId: string) =>
    request<WishlistItem>({ method: 'POST', url: '/api/wishlists/', data: { product: productId } }),

  remove: (id: string) =>
    request<void>({ method: 'DELETE', url: `/api/wishlists/${id}/` }),
};
