'use client';

import Link from 'next/link';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

import { ProductForm } from '@/components/admin/ProductForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { productsApi } from '@/services/api/products';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'product', slug],
    queryFn: () => productsApi.detail(slug),
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
        {isLoading || !data ? (
          <Skeleton className="h-96 w-full rounded-2xl" />
        ) : (
          <ProductForm initial={data} />
        )}
      </div>
    </div>
  );
}
