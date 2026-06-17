'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Input } from '@/components/ui/Input';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import { ordersApi } from '@/services/api/orders';
import { useGuestCartStore } from '@/store/guestCart';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_OPTIONS: Array<{ value: PaymentMethod; label: string; hint: string }> = [
  { value: 'stripe', label: 'Card (Stripe)', hint: 'Visa, Mastercard, RuPay, UPI via Stripe' },
  { value: 'cod', label: 'Cash on delivery', hint: 'Pay when your order arrives' },
];

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  full_name: z.string().min(2, 'Required').max(120),
  phone: z.string().min(7, 'Required').max(15),
  address_line1: z.string().min(3, 'Required').max(255),
  address_line2: z.string().max(255).optional().or(z.literal('')),
  city: z.string().min(2, 'Required').max(100),
  state: z.string().min(2, 'Required').max(100),
  postal_code: z.string().min(3, 'Required').max(20),
  country: z.string().min(2).max(100),
  note: z.string().max(500).optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

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
    defaultValues: { country: 'India' },
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
        country: values.country || 'India',
        payment_method: paymentMethod,
        note: values.note || undefined,
        items: lines.map((l) => ({
          product: l.product,
          quantity: l.quantity,
          include_installation: l.include_installation,
        })),
      });
      // Persist the guest token in sessionStorage so the confirmation
      // page can load the order detail.
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
        <h1 className="text-2xl font-semibold text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-sm text-slate-500">Add items before checking out.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Guest checkout</h1>
      <p className="mt-1 text-sm text-slate-500">
        No account required. We&apos;ll email your invoice and order updates.{' '}
        <Link href="/login?next=/checkout" className="text-brand-600 hover:underline">
          Have an account? Sign in
        </Link>
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Contact</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Email" htmlFor="g_email" error={errors.email?.message}>
                <Input id="g_email" type="email" autoComplete="email" {...register('email')} />
              </FormField>
              <FormField label="Phone" htmlFor="g_phone" error={errors.phone?.message}>
                <Input id="g_phone" autoComplete="tel" {...register('phone')} />
              </FormField>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-slate-900">Shipping address</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" htmlFor="g_name" error={errors.full_name?.message}>
                <Input id="g_name" autoComplete="name" {...register('full_name')} />
              </FormField>
              <FormField label="Country" htmlFor="g_country" error={errors.country?.message}>
                <Input id="g_country" {...register('country')} />
              </FormField>
              <FormField
                label="Address line 1"
                htmlFor="g_addr1"
                error={errors.address_line1?.message}
              >
                <Input id="g_addr1" autoComplete="address-line1" {...register('address_line1')} />
              </FormField>
              <FormField label="Address line 2 (optional)" htmlFor="g_addr2">
                <Input id="g_addr2" autoComplete="address-line2" {...register('address_line2')} />
              </FormField>
              <FormField label="City" htmlFor="g_city" error={errors.city?.message}>
                <Input id="g_city" autoComplete="address-level2" {...register('city')} />
              </FormField>
              <FormField label="State" htmlFor="g_state" error={errors.state?.message}>
                <Input id="g_state" autoComplete="address-level1" {...register('state')} />
              </FormField>
              <FormField label="Postal code" htmlFor="g_zip" error={errors.postal_code?.message}>
                <Input id="g_zip" autoComplete="postal-code" {...register('postal_code')} />
              </FormField>
            </div>
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
                      name="g_payment"
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
              {...register('note')}
              rows={3}
              placeholder="Delivery instructions, gate code, etc."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </section>
        </div>

        <aside className="h-fit space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
          <ul className="space-y-2 text-sm">
            {lines.map((l) => (
              <li key={l.product} className="flex justify-between gap-3">
                <span className="text-slate-600">
                  {l.snapshot.name}
                  <span className="text-slate-400"> × {l.quantity}</span>
                </span>
                <span className="font-medium text-slate-900">
                  {formatPrice(Number(l.snapshot.discounted_price) * l.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal</dt>
              <dd className="font-medium text-slate-900">{formatPrice(summary.subtotal)}</dd>
            </div>
            {summary.installation > 0 ? (
              <div className="flex justify-between">
                <dt className="text-slate-600">Installation</dt>
                <dd className="font-medium text-slate-900">{formatPrice(summary.installation)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Estimated total</dt>
              <dd className="font-semibold text-slate-900">{formatPrice(summary.grand)}</dd>
            </div>
            <p className="text-xs text-slate-500">
              Tax and shipping calculated on the next step.
            </p>
          </dl>

          {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}

          <Button type="submit" block size="lg" loading={isSubmitting}>
            {paymentMethod === 'stripe' ? 'Continue to payment' : 'Place order'}
          </Button>
        </aside>
      </form>
    </div>
  );
}
