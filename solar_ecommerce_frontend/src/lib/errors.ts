import { AxiosError } from 'axios';

import type { ApiErrorBody } from '@/types/api';

/**
 * Convert an axios error into a user-facing string.
 *
 * DRF returns either:
 *   - { detail: "..." }                              (plain errors)
 *   - { field_name: ["msg1", ...], non_field_errors: [...] }  (validation)
 */
export function formatApiError(err: unknown, fallback = 'Something went wrong.'): string {
  if (!(err instanceof AxiosError)) {
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }
  const body = err.response?.data as ApiErrorBody | undefined;
  if (!body) {
    return err.message || fallback;
  }
  if (typeof body.detail === 'string') return body.detail;

  // Pick the first field error
  for (const [field, value] of Object.entries(body)) {
    if (field === 'detail') continue;
    if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
      return field === 'non_field_errors' ? value[0] : `${field}: ${value[0]}`;
    }
    if (typeof value === 'string') {
      return field === 'non_field_errors' ? value : `${field}: ${value}`;
    }
  }
  return fallback;
}
