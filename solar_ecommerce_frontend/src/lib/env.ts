/** Centralised runtime config — typed access to public env vars.
 *
 * Validation runs on import. In production we fail fast on missing critical
 * variables; in development we accept localhost fallbacks for a smooth DX.
 */
function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const rawPaypalId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID?.trim() ?? '';
const rawCurrency = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY?.trim() || 'USD';
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  if (!rawApiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is required in production.');
  }
  if (!/^https?:\/\//.test(rawApiUrl)) {
    throw new Error('NEXT_PUBLIC_API_URL must be a valid http(s) URL.');
  }
  if (!rawPaypalId) {
    // eslint-disable-next-line no-console
    console.warn(
      '[env] NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set — PayPal checkout will be disabled.',
    );
  }
}

export const env = {
  apiUrl: stripTrailingSlash(rawApiUrl ?? 'http://localhost:8000'),
  paypalClientId: rawPaypalId,
  paypalCurrency: rawCurrency,
  isProd,
} as const;
