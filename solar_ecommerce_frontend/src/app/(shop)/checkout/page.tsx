'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddressPicker } from '@/components/checkout/AddressPicker';
import { CouponInput } from '@/components/checkout/CouponInput';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useOrders';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import type { CouponPreview } from '@/types/coupon';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: 'paypal', label: 'PayPal', hint: 'Pay securely with PayPal Checkout' },
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay when your order arrives' },
];

function CheckoutInner() {
  const router = useRouter();
  const cart = useCart();
  const { data: addrPage } = useAddresses();
  const checkout = useCheckout();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('paypal');
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!addressId && addrPage?.results.length) {
      const def = addrPage.results.find((a) => a.is_default) ?? addrPage.results[0];
      setAddressId(def.id);
    }
  }, [addrPage, addressId]);

  const totals = useMemo(() => {
    const c = cart.data;
    if (!c) return null;
    const subtotal = Number(c.subtotal);
    const installation = Number(c.installation_total);
    const discount = coupon ? Number(coupon.discount_amount) : 0;
    const grand = Math.max(0, subtotal + installation - discount);
    return { subtotal, installation, discount, grand };
  }, [cart.data, coupon]);

  if (cart.isLoading) {
    return <div className="container py-12 text-sm text-slate-500">Loading…</div>;
  }

  if (!cart.data || cart.data.items.length === 0) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add items to your cart before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const placeOrder = async () => {
    if (!addressId) {
      setError('Please select a shipping address.');
      return;
    }
    setError(null);
    try {
      const order = await checkout.mutateAsync({
        address_id: addressId,
        payment_method: paymentMethod,
        coupon_code: coupon?.coupon || undefined,
        note: note || undefined,
      });
      router.push(`/orders/${order.id}?placed=1`);
    } catch (err) {
      setError(formatApiError(err, 'Could not place order.'));
    }
  };

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Shipping address</h2>
            <AddressPicker selectedId={addressId} onSelect={setAddressId} />
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Payment method</h2>
            <ul className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm ${
                      paymentMethod === opt.value
                        ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-200'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="mt-0.5 h-4 w-4 text-brand-600"
                    />
                    <div>
                      <p className="font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.hint}</p>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Order note (optional)</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Delivery instructions, gate code, etc."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>

          <ul className="space-y-2 text-sm">
            {cart.data.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3">
                <span className="text-slate-600">
                  {it.product_detail.name}
                  <span className="text-slate-400"> × {it.quantity}</span>
                </span>
                <span className="font-medium text-slate-900">{formatPrice(it.line_total)}</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-200 pt-4">
            <CouponInput applied={coupon} onApply={setCoupon} onClear={() => setCoupon(null)} />
          </div>

          {totals ? (
            <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Installation</dt>
                <dd className="font-medium text-slate-900">{formatPrice(totals.installation)}</dd>
              </div>
              {totals.discount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>Discount</dt>
                  <dd className="font-medium">− {formatPrice(totals.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="font-semibold text-slate-900">{formatPrice(totals.grand)}</dd>
              </div>
            </dl>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <Button
            block
            size="lg"
            loading={checkout.isPending}
            disabled={!addressId}
            onClick={placeOrder}
          >
            {paymentMethod === 'paypal' ? 'Continue to PayPal' : 'Place order'}
          </Button>
          <p className="text-center text-xs text-slate-500">
            You&apos;ll review and confirm payment on the next step.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutInner />
    </ProtectedRoute>
  );
}
