/**
 * Format a numeric/string price as USD.
 * Backend serializes DecimalField as a string ("1234.50").
 */
export function formatPrice(value: string | number, currency = 'USD'): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function discountPercent(original: string | number, discounted: string | number): number {
  const o = typeof original === 'string' ? Number(original) : original;
  const d = typeof discounted === 'string' ? Number(discounted) : discounted;
  if (!o || o <= 0 || !Number.isFinite(o) || !Number.isFinite(d)) return 0;
  return Math.max(0, Math.round(((o - d) / o) * 100));
}
