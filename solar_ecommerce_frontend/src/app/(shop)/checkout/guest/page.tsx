'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Truck, ChevronRight, ShoppingCart, MapPin, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { ordersApi } from '@/services/api/orders';
import { useGuestCartStore } from '@/store/guestCart';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string; icon: React.ReactNode }> = [
  {
    value: 'stripe',
    label: 'Card / Stripe',
    hint: 'Visa, Mastercard, RuPay, UPI',
    icon: <CreditCard size={18} className="text-brand-600" />,
  },
  {
    value: 'cod',
    label: 'Cash on delivery',
    hint: 'Pay when your order arrives',
    icon: <Truck size={18} className="text-slate-500" />,
  },
];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  full_name: z.string().min(2, 'Required').max(120),
  phone: z.string().min(7, 'Required').max(20),
  address_line1: z.string().min(3, 'Required').max(255),
  address_line2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().min(2, 'Required').max(100),
  state: z.string().min(2, 'Required').max(100),
  postal_code: z.string().min(3, 'Required').max(20),
  country: z.string().min(2).max(100),
  note: z.string().max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

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

export default function GuestCheckoutPage() {
  const router = useRouter();
  const lines = useGuestCartStore((s) => s.lines);
  const subtotal = useGuestCartStore((s) => s.subtotal());
  const installation = useGuestCartStore((s) => s.installationTotal());
  const clear = useGuestCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Australia' },
  });

  const summary = useMemo(
    () => ({ subtotal, installation, grand: subtotal + installation }),
    [subtotal, installation],
  );

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    if (lines.length === 0) {
      setSubmitError('Your cart is empty.');
      return;
    }
    try {
      const order = await ordersApi.guestCheckout({
        email: values.email,
        full_name: values.full_name,
        phone: values.phone,
        address_line1: values.address_line1,
        address_line2: values.address_line2 || undefined,
        city: values.city,
        state: values.state,
        postal_code: values.postal_code,
        country: values.country || 'Australia',
        payment_method: paymentMethod,
        note: values.note || undefined,
        items: lines.map((l) => ({
          product: l.product,
          quantity: l.quantity,
          include_installation: l.include_installation,
        })),
      });
      try {
        sessionStorage.setItem(
          `guest_order_${order.order_number}`,
          order.guest_access_token,
        );
      } catch {
        /* ignore quota errors */
      }
      clear();
      router.push(
        `/orders/guest/${order.order_number}?token=${encodeURIComponent(
          order.guest_access_token,
        )}&placed=1`,
      );
    } catch (err) {
      setSubmitError(formatApiError(err, 'Could not place order.'));
    }
  });

  if (lines.length === 0) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto">
          <ShoppingCart size={28} className="text-slate-400" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add items before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 sm:py-10">
      <CheckoutSteps current={2} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            No account needed.{' '}
            <Link href="/login?next=/checkout" className="text-brand-600 hover:underline font-medium">
              Sign in for faster checkout
            </Link>
          </p>
        </div>
        <Link
          href="/cart"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ChevronRight size={14} className="rotate-180" />
          Back to cart
        </Link>
      </div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* Section 1: Contact */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">1</span>
              Contact information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Email address" htmlFor="g_email" error={errors.email?.message}>
                  <Input id="g_email" type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
                </FormField>
              </div>
              <FormField label="Full name" htmlFor="g_name" error={errors.full_name?.message}>
                <Input id="g_name" autoComplete="name" placeholder="John Doe" {...register('full_name')} />
              </FormField>
              <FormField label="Phone number" htmlFor="g_phone" error={errors.phone?.message}>
                <Input id="g_phone" autoComplete="tel" placeholder="+1 (555) 000-0000" {...register('phone')} />
              </FormField>
            </div>
          </section>

          {/* Section 2: Shipping address */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">2</span>
              Shipping address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <FormField label="Address line 1" htmlFor="g_addr1" error={errors.address_line1?.message}>
                  <Input id="g_addr1" autoComplete="address-line1" placeholder="Street address, building, apt…" {...register('address_line1')} />
                </FormField>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Address line 2 (optional)" htmlFor="g_addr2">
                  <Input id="g_addr2" autoComplete="address-line2" placeholder="Floor, suite, landmark…" {...register('address_line2')} />
                </FormField>
              </div>
              <FormField label="City" htmlFor="g_city" error={errors.city?.message}>
                <Input id="g_city" autoComplete="address-level2" placeholder="City" {...register('city')} />
              </FormField>
              <FormField label="State / Province" htmlFor="g_state" error={errors.state?.message}>
                <Input id="g_state" autoComplete="address-level1" placeholder="State" {...register('state')} />
              </FormField>
              <FormField label="Postal code" htmlFor="g_zip" error={errors.postal_code?.message}>
                <Input id="g_zip" autoComplete="postal-code" placeholder="PIN / ZIP" {...register('postal_code')} />
              </FormField>
              <FormField label="Country" htmlFor="g_country" error={errors.country?.message}>
                <Input id="g_country" autoComplete="country-name" {...register('country')} />
              </FormField>
            </div>
          </section>

          {/* Section 3: Payment method */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">3</span>
              Payment method
            </h2>
            <ul className="grid gap-3 sm:grid-cols-2">
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
                      name="g_payment"
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
                      <p className="font-semibold text-slate-900">{opt.label}</p>
                      <p className="text-xs text-slate-500 leading-snug">{opt.hint}</p>
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

          {/* Section 4: Order note */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Order note (optional)</h2>
            <textarea
              {...register('note')}
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
              {lines.map((l) => {
                const lineTotal =
                  Number(l.snapshot.discounted_price) * l.quantity +
                  (l.include_installation ? Number(l.snapshot.installation_fee) * l.quantity : 0);
                return (
                  <li key={l.product} className="flex items-center gap-3 text-sm">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {l.snapshot.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={l.snapshot.image} alt={l.snapshot.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 line-clamp-1">{l.snapshot.name}</p>
                      <p className="text-xs text-slate-400">
                        Qty {l.quantity}
                        {l.include_installation ? ' · incl. install' : ''}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium text-slate-900">{formatPrice(lineTotal)}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-6 space-y-2">
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(summary.subtotal)}</dd>
              </div>
              {summary.installation > 0 ? (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Installation</dt>
                  <dd className="font-medium text-slate-900">{formatPrice(summary.installation)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between text-xs text-slate-400">
                <dt>Shipping &amp; tax</dt>
                <dd>Calculated at next step</dd>
              </div>
            </dl>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold">
              <span className="text-slate-900">Estimated total</span>
              <span className="text-slate-900">{formatPrice(summary.grand)}</span>
            </div>
          </div>

          <div className="px-5 py-4 sm:px-6 space-y-3">
            {submitError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}
            <Button type="submit" block size="lg" loading={isSubmitting}>
              {paymentMethod === 'stripe' ? 'Continue to payment →' : 'Place order →'}
            </Button>
            <p className="text-center text-xs text-slate-400">
              By ordering you agree to our{' '}
              <Link href="/terms" className="underline hover:text-slate-600">terms of service</Link>
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
