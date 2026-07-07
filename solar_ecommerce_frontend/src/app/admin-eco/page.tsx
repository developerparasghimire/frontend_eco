'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  IndianRupee,
  Mail,
  Package,
  ShoppingBag,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { adminApi } from '@/services/api/admin';
import { formatPrice } from '@/lib/format';

export default function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.dashboard(),
    staleTime: 60_000,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Operational overview at a glance.</p>

      {isLoading ? (
        <p className="mt-8 text-sm text-slate-500">Loading…</p>
      ) : error ? (
        <p className="mt-8 text-sm text-red-600">Failed to load stats.</p>
      ) : data ? (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat
              label="Revenue (paid)"
              value={formatPrice(data.orders.total_revenue)}
              icon={IndianRupee}
              accent="emerald"
            />
            <Stat label="Orders" value={data.orders.total_orders} icon={ShoppingBag} accent="brand" />
            <Stat
              label="Pending"
              value={data.orders.pending_orders}
              icon={CheckCircle2}
              accent="amber"
            />
            <Stat label="Customers" value={data.customers.total_customers} icon={Users} accent="brand" />
            <Stat label="Products" value={data.products.total_products} icon={Package} accent="brand" />
            <Stat
              label="Low stock"
              value={data.products.low_stock}
              icon={AlertTriangle}
              accent="amber"
            />
            <Stat label="Out of stock" value={data.products.out_of_stock} icon={Package} accent="amber" />
            <Stat label="New messages" value={data.support.new_messages} icon={Mail} accent="brand" />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Card title="Last 30 days">
              <Row label="Orders" value={data.recent_30d.orders} />
              <Row label="Revenue" value={formatPrice(data.recent_30d.revenue)} />
              <Row label="New customers" value={data.customers.new_customers_30d} />
            </Card>
            <Card title="Catalogue">
              <Row label="Active products" value={data.products.active_products} />
              <Row label="Featured" value={data.products.featured_products} />
              <Row label="Categories" value={data.products.total_categories} />
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent: 'brand' | 'emerald' | 'amber';
}) {
  const tone = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
  }[accent];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <span className={`grid h-10 w-10 place-items-center rounded-full ${tone}`}>
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <dl className="mt-3 space-y-2 text-sm">{children}</dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-600">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
