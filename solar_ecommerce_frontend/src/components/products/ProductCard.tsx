'use client';

import Link from 'next/link';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/cn';
import { formatPrice } from '@/lib/format';
import type { ProductListItem } from '@/types/product';

import { RatingStars } from '@/components/ui/RatingStars';
import { WishlistButton } from './WishlistButton';
import { useAddToCart } from '@/hooks/useCart';
import { useAuthStatus } from '@/store/auth';
import { useGuestCartStore } from '@/store/guestCart';

interface ProductCardProps {
  product: ProductListItem;
  className?: string;
}

function QuickAddButton({ product }: { product: ProductListItem }) {
  const status = useAuthStatus();
  const addToCart = useAddToCart();
  const guestAdd = useGuestCartStore((s) => s.add);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setError(null);
    if (status !== 'authenticated') {
      // Guest: store locally, no login required.
      guestAdd(product, 1, false);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      return;
    }
    try {
      await addToCart.mutateAsync({ product: product.id, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not add to cart. Please try again.';
      setError(detail);
      setTimeout(() => setError(null), 3000);
    }
  };

  if (!product.in_stock) {
    return (
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-400 w-full">
        Out of stock
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={addToCart.isPending || added}
        className={cn(
          'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold w-full transition-all duration-200',
          added
            ? 'bg-green-600 text-white'
            : 'bg-slate-900 text-white hover:bg-green-700 active:scale-95',
          (addToCart.isPending) && 'opacity-70 cursor-wait',
        )}
      >
        {addToCart.isPending ? (
          <Loader2 size={13} className="animate-spin" />
        ) : added ? (
          <Check size={13} />
        ) : (
          <ShoppingCart size={13} />
        )}
        {added ? 'Added!' : 'Add to Cart'}
      </button>
      {error ? (
        <p className="mt-1 text-center text-[11px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProductCard({ product, className }: ProductCardProps) {
  const original = Number(product.price);
  const discounted = Number(product.discounted_price);
  const hasDiscount = Number.isFinite(original) && Number.isFinite(discounted) && discounted < original;
  const discountPct = hasDiscount ? Math.round(((original - discounted) / original) * 100) : 0;

  return (
    <div className={cn(
      'group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
      'transition-all duration-200 hover:border-green-300 hover:shadow-lg hover:-translate-y-0.5',
      !product.in_stock && 'opacity-75',
      className
    )}>
      {/* Green accent top bar on hover */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10" />

      <Link
        href={`/products/${product.slug}`}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-inset"
        tabIndex={0}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          {product.primary_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primary_image}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-xs uppercase tracking-wide text-slate-400">
              No image
            </div>
          )}

          {/* Badges */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="rounded-full bg-green-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                -{discountPct}%
              </span>
            )}
            {!product.in_stock && (
              <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                Sold Out
              </span>
            )}
          </div>

          <WishlistButton
            productId={product.id}
            variant="icon"
            className="absolute right-2.5 top-2.5"
            redirectPath={`/products/${product.slug}`}
          />
        </div>

        <div className="flex flex-1 flex-col space-y-1.5 p-3">
          {(product.category_name || product.brand) && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {product.category_name || product.brand}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-green-700 transition-colors duration-200">
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5">
            <RatingStars value={Number(product.average_rating) || 0} size={12} />
            <span className="text-[11px] text-slate-400">
              {product.review_count > 0 ? `(${product.review_count})` : ''}
            </span>
          </div>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-bold text-slate-900">
              {formatPrice(hasDiscount ? discounted : original)}
            </span>
            {hasDiscount ? (
              <span className="text-xs text-slate-400 line-through">{formatPrice(original)}</span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <QuickAddButton product={product} />
      </div>
    </div>
  );
}
