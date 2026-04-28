export interface Review {
  id: string;
  product: string;
  user: string;
  user_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

export interface ReviewInput {
  product: string;
  rating: number;
  title: string;
  comment: string;
}
