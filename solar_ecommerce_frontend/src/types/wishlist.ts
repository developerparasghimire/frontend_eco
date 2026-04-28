import type { ProductListItem } from './product';

export interface WishlistItem {
  id: string;
  product: string;
  product_detail: ProductListItem;
  created_at: string;
}
