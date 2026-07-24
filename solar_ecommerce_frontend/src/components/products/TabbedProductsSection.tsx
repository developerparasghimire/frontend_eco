'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useCategories, useProducts } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';

export function TabbedProductsSection() {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data?.results ?? [];
  const [activeSlug, setActiveSlug] = useState<string>('');

  const productsQuery = useProducts({
    category__slug: activeSlug || undefined,
    ordering: '-created_at',
    page: 1,
  });

  const items = (productsQuery.data?.results ?? []).slice(0, 6);
  const isLoading = productsQuery.isLoading;

  return (
    <section className="solar-top-picks">
      <div className="solar-top-picks__inner">
        <div className="solar-top-picks__header">
          <div className="solar-top-picks__title-wrap">
            <p className="solar-top-picks__eyebrow">SOLAR SHOP</p>
            <h2 className="solar-top-picks__title">Top Picks for You</h2>
          </div>

          {/* Category tabs */}
          {categories.length > 0 && (
            <div className="solar-top-picks__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeSlug === ''}
                onClick={() => setActiveSlug('')}
                className={`solar-top-picks__tab${activeSlug === '' ? ' solar-top-picks__tab--active' : ''}`}
              >
                All
              </button>
              {categories.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={activeSlug === c.slug}
                  onClick={() => setActiveSlug(c.slug)}
                  className={`solar-top-picks__tab${activeSlug === c.slug ? ' solar-top-picks__tab--active' : ''}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product grid */}
        <div className="solar-top-picks__grid">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-slate-100" />
              ))
            : items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>

        {/* View all */}
        <div className="solar-top-picks__view-all">
          <Link
            href={activeSlug ? `/products?category=${activeSlug}` : '/products'}
            className="solar-hero-v2__btn-outline"
            style={{ borderColor: 'var(--solar-navy)', color: 'var(--solar-navy)', height: 48, padding: '0 32px' }}
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
}
