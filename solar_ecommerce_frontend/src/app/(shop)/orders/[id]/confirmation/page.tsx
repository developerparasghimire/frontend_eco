'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Mail, Truck } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/lib/format';

function ConfirmationInner() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return <div className="container py-12 text-sm text-slate-500">Loading…</div>;
  }
  if (!order) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Order not found</h1>
        <Link
          href="/dashboard/orders"
          className="mt-4 inline-block text-sm text-brand-600 hover:underline"
        >
          Back to orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-16 text-center">
      <CheckCircle2 className="mx-auto text-emerald-500" size={64} />
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">Order confirmed!</h1>
      <p className="mt-2 text-sm text-slate-600">
        Thank you for shopping with us. Your order{' '}
        <span className="font-semibold text-slate-900">{order.order_number}</span> has been placed.
      </p>

      <dl className="mx-auto mt-8 max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-sm">
        <div className="flex justify-between border-b border-slate-100 pb-2">
          <dt className="text-slate-600">Order total</dt>
          <dd className="font-semibold text-slate-900">{formatPrice(order.grand_total)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-b border-slate-100 pb-2">
          <dt className="text-slate-600">Payment</dt>
          <dd className="font-medium uppercase text-slate-900">{order.payment_method}</dd>
        </div>
        <div className="mt-2 flex justify-between">
          <dt className="text-slate-600">Status</dt>
          <dd className="font-medium capitalize text-slate-900">{order.status}</dd>
        </div>
      </dl>

      <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-sm text-slate-600">
        <li className="flex gap-3">
          <Mail className="mt-0.5 shrink-0 text-slate-400" size={18} />
          <span>A confirmation email with your invoice is on its way.</span>
        </li>
        <li className="flex gap-3">
          <Truck className="mt-0.5 shrink-0 text-slate-400" size={18} />
          <span>We&apos;ll send tracking details once your order ships.</span>
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href={`/orders/${order.id}`}
          className="rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          View order details
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-slate-300 px-6 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <ProtectedRoute>
      <ConfirmationInner />
    </ProtectedRoute>
  );
}
