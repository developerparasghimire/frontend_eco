'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { ProductForm } from '@/components/admin/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsApi } from '@/services/api/products';

export default function EditProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'product', slug],
    queryFn: () => productsApi.detail(slug),
    enabled: Boolean(slug),
  });

  return (
    <div>
      <Link
        href="/admin-eco/products"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
      >
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">
        {data ? `Edit · ${data.name}` : 'Edit product'}
      </h1>
      <div className="mt-6">
        {isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            <p className="font-semibold">Couldn&apos;t load this product.</p>
            <p className="mt-1">
              It may have been deleted, or the server is unreachable. Try refreshing the page.
            </p>
            <Link
              href="/admin-eco/products"
              className="mt-3 inline-block font-medium underline"
            >
              Back to products
            </Link>
          </div>
        ) : isLoading || !data ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : (
          <ProductForm initial={data} />
        )}
      </div>
    </div>
  );
}
