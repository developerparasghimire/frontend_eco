/**
 * PayPal SDK loader. Reads the public client id from env;
 * falls back to PayPal's sandbox demo id so dev keeps working
 * without configuration.
 */
export const PAYPAL_CLIENT_ID =
  process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';
export const PAYPAL_CURRENCY =
  process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || 'USD';
