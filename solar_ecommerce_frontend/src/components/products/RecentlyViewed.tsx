'use client';

import { useQueries } from '@tanstack/react-query';

import { ProductCard } from '@/components/products/ProductCard';
import { productsApi } from '@/services/api/products';

interface RecentlyViewedProps {
  slugs: string[];
}

/**
 * Renders product cards for slugs found in localStorage. Each slug is fetched
 * individually (cached by react-query) so navigating between products is fast.
 */
export function RecentlyViewed({ slugs }: RecentlyViewedProps) {
  const queries = useQueries({
    queries: slugs.slice(0, 6).map((slug) => ({
      queryKey: ['product', slug],
      queryFn: () => productsApi.detail(slug),
      staleTime: 60_000,
    })),
  });

  const products = queries
    .map((q) => q.data)
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-10">
      <h2 className="text-2xl font-semibold text-slate-900">Recently viewed</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
