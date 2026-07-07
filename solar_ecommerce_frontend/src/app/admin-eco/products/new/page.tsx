'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <Link
        href="/admin-eco/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">New product</h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
