'use client';

import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { ordersApi } from '@/services/api/orders';
import { formatApiError } from '@/lib/errors';
import { PAYPAL_CLIENT_ID, PAYPAL_CURRENCY } from '@/lib/paypal';
import type { Order } from '@/types/order';

interface Props {
  order: Order;
  onCaptured: (order: Order) => void;
}

/**
 * Renders the official PayPal Smart Buttons. On approval, calls our backend
 * capture endpoint which marks the order paid.
 */
export function PayPalCheckout({ order, onCaptured }: Props) {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <PayPalScriptProvider
        options={{
          clientId: PAYPAL_CLIENT_ID,
          currency: PAYPAL_CURRENCY,
          intent: 'capture',
        }}
      >
        <PayPalButtons
          style={{ layout: 'vertical', shape: 'rect', label: 'pay' }}
          createOrder={async () => {
            setError(null);
            try {
              const res = await ordersApi.paypalCreate(order.id);
              return res.paypal_order_id;
            } catch (err) {
              setError(formatApiError(err, 'Could not start PayPal checkout.'));
              throw err;
            }
          }}
          onApprove={async (data) => {
            try {
              const updated = await ordersApi.paypalCapture(order.id, data.orderID);
              qc.setQueryData(['order', updated.id], updated);
              onCaptured(updated);
            } catch (err) {
              setError(formatApiError(err, 'Payment capture failed.'));
            }
          }}
          onError={(err) => {
            setError((err as unknown as Error)?.message || 'PayPal error.');
          }}
        />
      </PayPalScriptProvider>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
