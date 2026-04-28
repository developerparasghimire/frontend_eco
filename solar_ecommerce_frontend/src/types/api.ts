/** Shared paginated-response shape used by DRF's PageNumberPagination. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiErrorBody {
  detail?: string;
  [field: string]: unknown;
}
