import { request } from '@/services/http';
import type { Paginated } from '@/types/api';

export type ReturnStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_transit'
  | 'received'
  | 'refunded'
  | 'completed';

export interface ReturnItemPayload {
  order_item: string;
  quantity: number;
  refund_amount?: string;
}

export interface ReturnRequest {
  id: string;
  rma_number: string;
  order: string;
  user: string;
  status: ReturnStatus;
  reason: string;
  refund_amount: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  refunded_at: string | null;
  completed_at: string | null;
  items: Array<{
    id: string;
    order_item: string;
    quantity: number;
    refund_amount: string;
  }>;
}

export interface CreateReturnInput {
  order: string;
  reason: string;
  items: ReturnItemPayload[];
}

export const returnsApi = {
  list: () => request<Paginated<ReturnRequest>>({ method: 'GET', url: '/api/returns/' }),

  detail: (id: string) =>
    request<ReturnRequest>({ method: 'GET', url: `/api/returns/${id}/` }),

  create: (data: CreateReturnInput) =>
    request<ReturnRequest>({ method: 'POST', url: '/api/returns/', data }),

  updateStatus: (id: string, status: ReturnStatus, admin_notes?: string) =>
    request<ReturnRequest>({
      method: 'POST',
      url: `/api/returns/${id}/update-status/`,
      data: { status, admin_notes },
    }),
};
