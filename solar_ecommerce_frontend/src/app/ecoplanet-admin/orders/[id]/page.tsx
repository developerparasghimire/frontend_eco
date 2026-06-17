'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/services/api/orders';
import { formatApiError } from '@/lib/errors';
import { formatDate, formatPrice } from '@/lib/format';
import type { Order, OrderStatus } from '@/types/order';

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'order', id],
    queryFn: () => ordersApi.detail(id),
    enabled: !!id,
  });

  const invalidate = () => {
    void refetch();
    void qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
  };

  const statusMut = useMutation({
    mutationFn: (status: OrderStatus) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      invalidate();
    },
    onError: (e) => toast.error(formatApiError(e, 'Could not update status.')),
  });

  if (isLoading) return <p className="text-sm text-slate-500">Loading…</p>;
  if (!order) return <p className="text-sm text-red-600">Order not found.</p>;

  return (
    <div>
      <Link href="/ecoplanet-admin/orders" className="text-sm text-brand-600 hover:underline">
        ← All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold text-slate-900">{order.order_number}</h1>
          <p className="text-sm text-slate-500">Placed {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-medium uppercase text-slate-500">Status</label>
          <select
            value={order.status}
            disabled={statusMut.isPending}
            onChange={(e) => statusMut.mutate(e.target.value as OrderStatus)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm capitalize"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title="Items">
            <ul className="divide-y divide-slate-100 text-sm">
              {order.items.map((it) => (
                <li key={it.id} className="flex justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-900">{it.product_name}</p>
                    <p className="text-xs text-slate-500">
                      {it.quantity} × {formatPrice(it.unit_price)}
                      {it.include_installation
                        ? ` · install ${formatPrice(it.installation_fee)}`
                        : ''}
                    </p>
                  </div>
                  <span className="font-medium text-slate-900">{formatPrice(it.line_total)}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Shipping address">
            <p className="text-sm text-slate-700">
              {order.shipping_full_name}
              <br />
              {order.shipping_address}
              <br />
              {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
              <br />
              {order.shipping_country}
              <br />
              <span className="text-slate-500">{order.shipping_phone}</span>
            </p>
          </Section>

          <TrackingForm order={order} onDone={invalidate} />
          <RefundForm order={order} onDone={invalidate} />
        </div>

        <div className="space-y-6">
          <Section title="Summary">
            <Totals order={order} />
          </Section>
          <Section title="Payment">
            <dl className="space-y-1 text-sm">
              <Row label="Method" value={order.payment_method.toUpperCase()} />
              <Row label="Status" value={order.payment_status} />
              {order.payment_id ? <Row label="Reference" value={order.payment_id} mono /> : null}
              {order.paid_at ? <Row label="Paid" value={formatDate(order.paid_at)} /> : null}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className={`font-medium text-slate-900 ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

function Totals({ order }: { order: Order }) {
  return (
    <dl className="space-y-1 text-sm">
      <Row label="Subtotal" value={formatPrice(order.subtotal)} />
      <Row label="Installation" value={formatPrice(order.installation_total)} />
      {Number(order.discount_amount) > 0 ? (
        <Row label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}`} value={`− ${formatPrice(order.discount_amount)}`} />
      ) : null}
      <Row
        label="Shipping"
        value={Number(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}
      />
      {Number(order.tax_amount) > 0 ? (
        <Row label={`Tax (${Number(order.tax_rate)}%)`} value={formatPrice(order.tax_amount)} />
      ) : null}
      <div className="mt-2 border-t border-slate-100 pt-2">
        <Row label="Total" value={formatPrice(order.grand_total)} />
      </div>
      {order.payment_status === 'refunded' && Number(order.refund_amount) > 0 ? (
        <Row label="Refunded" value={formatPrice(order.refund_amount)} />
      ) : null}
    </dl>
  );
}

function TrackingForm({ order, onDone }: { order: Order; onDone: () => void }) {
  const [tracking_number, setTn] = useState(order.tracking_number || '');
  const [courier_name, setCourier] = useState(order.courier_name || '');
  const [tracking_url, setUrl] = useState(order.tracking_url || '');
  const [estimated_delivery_date, setEta] = useState(order.estimated_delivery_date || '');

  const mut = useMutation({
    mutationFn: () =>
      ordersApi.setTracking(order.id, {
        tracking_number,
        courier_name: courier_name || undefined,
        tracking_url: tracking_url || undefined,
        estimated_delivery_date: estimated_delivery_date || undefined,
      }),
    onSuccess: () => {
      toast.success('Tracking saved');
      onDone();
    },
    onError: (e) => toast.error(formatApiError(e, 'Could not save tracking.')),
  });

  return (
    <Section title="Tracking & shipment">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Tracking #" value={tracking_number} onChange={setTn} />
        <Input label="Courier" value={courier_name} onChange={setCourier} />
        <Input label="Tracking URL" value={tracking_url} onChange={setUrl} />
        <Input label="ETA" type="date" value={estimated_delivery_date} onChange={setEta} />
      </div>
      <Button
        className="mt-4"
        loading={mut.isPending}
        disabled={!tracking_number}
        onClick={() => mut.mutate()}
      >
        Save tracking & mark shipped
      </Button>
    </Section>
  );
}

function RefundForm({ order, onDone }: { order: Order; onDone: () => void }) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const refundable =
    order.payment_status === 'paid' && order.payment_method !== 'cod';
  const mut = useMutation({
    mutationFn: () =>
      ordersApi.refund(order.id, {
        amount: amount || undefined,
        reason: reason || undefined,
      }),
    onSuccess: () => {
      toast.success('Refund processed');
      setAmount('');
      setReason('');
      onDone();
    },
    onError: (e) => toast.error(formatApiError(e, 'Refund failed.')),
  });

  if (!refundable) return null;
  return (
    <Section title="Refund">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label={`Amount (blank = full ${formatPrice(order.grand_total)})`} value={amount} onChange={setAmount} />
        <Input label="Reason" value={reason} onChange={setReason} />
      </div>
      <Button variant="outline" className="mt-4" loading={mut.isPending} onClick={() => mut.mutate()}>
        Process refund
      </Button>
    </Section>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal normal-case text-slate-900"
      />
    </label>
  );
}
