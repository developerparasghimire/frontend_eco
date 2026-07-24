'use client';

import { SolariseSectionHeader } from '@/components/SolariseSite';
import { useProducts } from '@/hooks/useProducts';

import { ProductCard } from './ProductCard';

export function FeaturedProductsSection() {
  const { data, isLoading } = useProducts({ ordering: '-created_at', page: 1 });
  const items = (data?.results ?? []).slice(0, 3);

  if (!isLoading && items.length === 0) return null;

  return (
    <section className="solar-container solar-featured-products">
      <SolariseSectionHeader
        eyebrow="SOLAR SHOP"
        title="Featured Solar Products"
        buttonHref="/products"
        buttonLabel="View All"
      />
      <div className="solar-featured-products__grid">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
              />
            ))
          : items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
