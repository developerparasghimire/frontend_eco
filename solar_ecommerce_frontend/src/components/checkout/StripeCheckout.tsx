'use client';

/**
 * Stripe payment block.
 *
 * Wraps Stripe Elements and PaymentElement. The parent passes an
 * `Order`; we hit the backend to create a PaymentIntent, render the
 * Stripe form, then call `stripe_confirm` on success so the order is
 * marked paid (the webhook does the same out-of-band).
 */
import { useEffect, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/services/api/orders';
import { formatApiError } from '@/lib/errors';
import type { Order } from '@/types/order';

interface StripeCheckoutProps {
  order: Order;
  onPaid: () => void;
  /** For guest orders — the guest_access_token from the order URL */
  guestToken?: string;
}

let _stripePromise: Promise<Stripe | null> | null = null;
function getStripe(publishableKey: string) {
  if (!_stripePromise) _stripePromise = loadStripe(publishableKey);
  return _stripePromise;
}

function PaymentForm({ order, onPaid, guestToken }: StripeCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);
    try {
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders/${order.id}/confirmation`,
        },
        redirect: 'if_required',
      });
      if (stripeError) {
        setError(stripeError.message ?? 'Payment failed.');
        return;
      }
      // Tell our backend to verify intent status (webhook will also do this).
      if (guestToken) {
        await ordersApi.guestStripeConfirm(order.order_number, guestToken);
      } else {
        await ordersApi.stripeConfirm(order.id);
      }
      toast.success('Payment received');
      onPaid();
    } catch (err) {
      setError(formatApiError(err, 'Payment confirmation failed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" block size="lg" loading={submitting} disabled={!stripe}>
        Pay {order.grand_total}
      </Button>
    </form>
  );
}

export function StripeCheckout({ order, onPaid, guestToken }: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeP, setStripeP] = useState<Promise<Stripe | null> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = guestToken
          ? await ordersApi.guestStripeCreate(order.order_number, guestToken)
          : await ordersApi.stripeCreate(order.id);
        if (cancelled) return;
        setClientSecret(data.client_secret);
        setStripeP(getStripe(data.publishable_key));
      } catch (err) {
        setError(formatApiError(err, 'Could not initialise payment.'));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [order.id]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!clientSecret || !stripeP) {
    return <p className="text-sm text-slate-500">Loading secure payment form…</p>;
  }

  return (
    <Elements
      stripe={stripeP}
      options={{
        clientSecret,
        appearance: { theme: 'stripe' },
      }}
    >
      <PaymentForm order={order} onPaid={onPaid} guestToken={guestToken} />
    </Elements>
  );
}
