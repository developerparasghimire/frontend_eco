'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import { AddToCartButton } from '@/components/products/AddToCartButton';
import { ProductCard } from '@/components/products/ProductCard';
import { ProductGallery } from '@/components/products/ProductGallery';
import { RecentlyViewed } from '@/components/products/RecentlyViewed';
import { ReviewsSection } from '@/components/products/ReviewsSection';
import { WishlistButton } from '@/components/products/WishlistButton';
import { Button } from '@/components/ui/Button';
import { RatingStars } from '@/components/ui/RatingStars';
import { useProduct, useRelatedProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/lib/format';
import { recentlyViewed } from '@/lib/recently-viewed';

interface PageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const slug = params.slug;
  const productQuery = useProduct(slug);
  const relatedQuery = useRelatedProducts(slug);

  // Track view in localStorage when load succeeds.
  useEffect(() => {
    if (productQuery.data) recentlyViewed.add(slug);
  }, [productQuery.data, slug]);

  const recentSlugs = useMemo(() => recentlyViewed.get(slug), [slug, productQuery.data]);

  if (productQuery.isLoading) {
    return (
      <div className="container py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-slate-100" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" />
            <div className="h-24 w-full animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Product not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The product you&apos;re looking for doesn&apos;t exist or is no longer available.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          ← Back to shop
        </Link>
      </div>
    );
  }

  const product = productQuery.data;
  const original = Number(product.price);
  const discounted = Number(product.discounted_price);
  const hasDiscount = Number.isFinite(original) && Number.isFinite(discounted) && discounted < original;
  const related = relatedQuery.data ?? [];

  return (
    <div className="container py-10">
      <nav className="mb-6 text-sm text-slate-500">
        <Link href="/products" className="hover:text-slate-900">Shop</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-slate-900"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} fallbackName={product.name} />

        <div className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {product.brand}
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <RatingStars value={Number(product.average_rating) || 0} />
            <span className="text-sm text-slate-500">
              {product.review_count > 0
                ? `${product.average_rating} (${product.review_count} reviews)`
                : 'No reviews yet'}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-semibold text-slate-900">
              {formatPrice(hasDiscount ? discounted : original)}
            </span>
            {hasDiscount ? (
              <>
                <span className="text-base text-slate-400 line-through">{formatPrice(original)}</span>
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
                  Save {Math.round(((original - discounted) / original) * 100)}%
                </span>
              </>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {product.in_stock ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                In stock ({product.stock} available)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                Out of stock
              </span>
            )}
            {product.installation_available ? (
              <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
                Installation available
              </span>
            ) : null}
          </div>

          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {product.description}
          </p>

          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
            {product.capacity ? (
              <>
                <dt className="text-slate-500">Capacity</dt>
                <dd className="text-slate-900">{product.capacity}</dd>
              </>
            ) : null}
            <dt className="text-slate-500">Warranty</dt>
            <dd className="text-slate-900">{product.warranty_years} years</dd>
            <dt className="text-slate-500">Lifespan</dt>
            <dd className="text-slate-900">{product.lifespan_years} years</dd>
            <dt className="text-slate-500">Delivery</dt>
            <dd className="text-slate-900">~{product.delivery_days} days</dd>
            <dt className="text-slate-500">SKU</dt>
            <dd className="font-mono text-xs text-slate-700">{product.sku}</dd>
          </dl>

          <div className="space-y-4 pt-2">
            <AddToCartButton product={product} />
            <WishlistButton productId={product.id} redirectPath={`/products/${product.slug}`} />
          </div>
        </div>
      </div>

      {product.technical_description ? (
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Technical details</h2>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {product.technical_description}
          </p>
        </section>
      ) : null}

      <ReviewsSection productId={product.id} />

      {related.length > 0 ? (
        <section className="mt-12 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-semibold text-slate-900">Related products</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {related.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      {recentSlugs.length > 0 ? <RecentlyViewed slugs={recentSlugs} /> : null}
    </div>
  );
}
