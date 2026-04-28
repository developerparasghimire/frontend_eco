export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  parent: string | null;
  is_active: boolean;
  children?: Category[];
}

export interface ProductImage {
  id: string;
  image: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category_name: string;
  price: string;
  discount_percent: string;
  discounted_price: string;
  primary_image: string | null;
  capacity: string;
  brand: string;
  is_featured: boolean;
  in_stock: boolean;
  average_rating: number;
  review_count: number;
}

export interface ProductDetail extends ProductListItem {
  category: Category;
  description: string;
  technical_description: string;
  warranty_years: number;
  lifespan_years: number;
  stock: number;
  delivery_days: number;
  installation_available: boolean;
  installation_fee: string;
  tags: string;
  images: ProductImage[];
}
