'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import { CreditCard, Wallet, Truck, ChevronRight, ShoppingCart, MapPin } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddressPicker } from '@/components/checkout/AddressPicker';
import { CouponInput } from '@/components/checkout/CouponInput';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { useAddresses } from '@/hooks/useAddresses';
import { useCheckout } from '@/hooks/useOrders';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { ordersApi } from '@/services/api/orders';
import type { CheckoutQuote, PaymentMethod } from '@/types/order';
import type { CouponPreview } from '@/types/coupon';

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string; icon: React.ReactNode }> = [
  {
    value: 'stripe',
    label: 'Card / Stripe',
    hint: 'Visa, Mastercard, RuPay, UPI',
    icon: <CreditCard size={18} className="text-brand-600" />,
  },
  {
    value: 'paypal',
    label: 'PayPal',
    hint: 'Secure checkout with PayPal',
    icon: <Wallet size={18} className="text-blue-500" />,
  },
  {
    value: 'cod',
    label: 'Cash on delivery',
    hint: 'Pay when your order arrives',
    icon: <Truck size={18} className="text-slate-500" />,
  },
];

function CheckoutSteps({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Cart', icon: <ShoppingCart size={14} /> },
    { n: 2, label: 'Details', icon: <MapPin size={14} /> },
    { n: 3, label: 'Payment', icon: <Wallet size={14} /> },
  ];
  return (
    <nav className="flex items-center gap-1 text-xs font-medium mb-8">
      {steps.map((s, i) => (
        <span key={s.n} className="flex items-center gap-1">
          <span
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 ${
              s.n < current
                ? 'bg-emerald-100 text-emerald-700'
                : s.n === current
                ? 'bg-brand-600 text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {s.icon}
            {s.label}
          </span>
          {i < steps.length - 1 ? (
            <ChevronRight size={12} className="text-slate-300 shrink-0" />
          ) : null}
        </span>
      ))}
    </nav>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const cart = useCart();
  const { data: addrPage } = useAddresses();
  const checkout = useCheckout();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [coupon, setCoupon] = useState<CouponPreview | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!addressId && addrPage?.results.length) {
      const def = addrPage.results.find((a) => a.is_default) ?? addrPage.results[0];
      setAddressId(def.id);
    }
  }, [addrPage, addressId]);

  useEffect(() => {
    if (!addressId) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoteLoading(true);
    const t = setTimeout(async () => {
      try {
        const q = await ordersApi.quote({
          address_id: addressId,
          coupon_code: coupon?.coupon || undefined,
        });
        if (!cancelled) setQuote(q);
      } catch {
        if (!cancelled) setQuote(null);
      } finally {
        if (!cancelled) setQuoteLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [addressId, coupon]);

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
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto">
          <ShoppingCart size={28} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add items to your cart before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
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
    <div className="container max-w-6xl py-8 sm:py-10">
      <CheckoutSteps current={2} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronRight size={14} className="rotate-180" />
          Back to cart
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Section 1: Shipping address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
              Shipping address
            </h2>
            <AddressPicker selectedId={addressId} onSelect={setAddressId} />
          </section>

          {/* Section 2: Payment method */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
              Payment method
            </h2>
            <ul className="grid gap-3 sm:grid-cols-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <li key={opt.value}>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 text-sm transition-all ${
                      paymentMethod === opt.value
                        ? 'border-brand-500 bg-brand-50/60 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="sr-only"
                    />
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        paymentMethod === opt.value ? 'bg-brand-100' : 'bg-slate-100'
                      }`}
                    >
                      {opt.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-500 leading-snug hidden sm:block">{opt.hint}</p>
                    </div>
                    <span
                      className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === opt.value ? 'border-brand-600' : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === opt.value ? (
                        <span className="h-2 w-2 rounded-full bg-brand-600" />
                      ) : null}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3: Order note */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Order note (optional)</h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Delivery instructions, gate code, special requests…"
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 resize-none"
            />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="h-fit space-y-0 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="p-5 sm:p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Order summary</h2>
            <ul className="space-y-3">
              {cart.data.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 text-sm">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {it.product_detail.primary_image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product_detail.primary_image}
                        alt={it.product_detail.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 line-clamp-1">{it.product_detail.name}</p>
                    <p className="text-xs text-slate-400">Qty {it.quantity}</p>
                  </div>
                  <p className="shrink-0 font-medium text-slate-900">{formatPrice(it.line_total)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4">
              <CouponInput applied={coupon} onApply={setCoupon} onClear={() => setCoupon(null)} />
            </div>
          </div>

          {totals ? (
            <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-medium text-slate-900">{formatPrice(totals.subtotal)}</dd>
                </div>
                {totals.installation > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Installation</dt>
                    <dd className="font-medium text-slate-900">{formatPrice(totals.installation)}</dd>
                  </div>
                ) : null}
                {totals.discount > 0 ? (
                  <div className="flex justify-between text-emerald-700">
                    <dt>Discount</dt>
                    <dd className="font-medium">− {formatPrice(totals.discount)}</dd>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <dt className="text-slate-500">
                    Shipping
                    {quote?.shipping_eta_min && quote?.shipping_eta_max ? (
                      <span className="ml-1 text-xs text-slate-400">
                        ({quote.shipping_eta_min}–{quote.shipping_eta_max} days)
                      </span>
                    ) : null}
                  </dt>
                  <dd className="font-medium text-slate-900">
                    {quote
                      ? Number(quote.shipping_cost) === 0
                        ? 'Free'
                        : formatPrice(quote.shipping_cost)
                      : quoteLoading
                      ? '…'
                      : '—'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tax{quote ? ` (${Number(quote.tax_rate)}%)` : ''}</dt>
                  <dd className="font-medium text-slate-900">
                    {quote ? formatPrice(quote.tax_amount) : quoteLoading ? '…' : '—'}
                  </dd>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
                  <dt className="text-slate-900">Total</dt>
                  <dd className="text-slate-900">
                    {quoteLoading ? '…' : quote ? formatPrice(quote.grand_total) : formatPrice(totals.grand)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}

          <div className="px-5 py-4 sm:px-6 space-y-3">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            <Button
              block
              size="lg"
              loading={checkout.isPending}
              disabled={!addressId || quoteLoading}
              onClick={placeOrder}
            >
              {paymentMethod === 'paypal'
                ? 'Continue to PayPal →'
                : paymentMethod === 'stripe'
                ? 'Continue to payment →'
                : 'Place order →'}
            </Button>
            <p className="text-center text-xs text-slate-400">
              By ordering you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate-600">terms of service</Link>
            </p>
          </div>
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
