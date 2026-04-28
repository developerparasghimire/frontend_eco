'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useCart';
import { useRemoveFromWishlist, useWishlist } from '@/hooks/useWishlist';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';

function WishlistView() {
  const wishlist = useWishlist();
  const remove = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  if (wishlist.isLoading) {
    return <div className="container py-12 text-sm text-slate-500">Loading wishlist…</div>;
  }

  const items = wishlist.data?.results ?? [];

  if (items.length === 0) {
    return (
      <div className="container max-w-3xl py-16 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-slate-500">
          Tap the heart on any product to save it here for later.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse products
        </Link>
      </div>
    );
  }

  const moveToCart = async (productId: string, wishItemId: string) => {
    setError(null);
    setBusyId(wishItemId);
    try {
      await addToCart.mutateAsync({ product: productId, quantity: 1 });
      await remove.mutateAsync(wishItemId);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container max-w-6xl py-10">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Your wishlist</h1>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const p = item.product_detail;
          const original = Number(p.price);
          const discounted = Number(p.discounted_price);
          const showDiscount = Number.isFinite(discounted) && discounted < original;

          return (
            <li
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <Link href={`/products/${p.slug}`} className="block aspect-[4/3] bg-slate-100">
                {p.primary_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.primary_image} alt={p.name} className="h-full w-full object-cover" />
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {p.category_name || p.brand}
                </p>
                <Link
                  href={`/products/${p.slug}`}
                  className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-brand-600"
                >
                  {p.name}
                </Link>
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-base font-semibold text-slate-900">
                    {formatPrice(showDiscount ? discounted : original)}
                  </span>
                  {showDiscount ? (
                    <span className="text-xs text-slate-400 line-through">{formatPrice(original)}</span>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    disabled={!p.in_stock || busyId === item.id}
                    loading={busyId === item.id}
                    onClick={() => moveToCart(item.product, item.id)}
                  >
                    {p.in_stock ? 'Move to cart' : 'Out of stock'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => remove.mutate(item.id)}
                    disabled={remove.isPending}
                    className="ml-auto inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function WishlistPage() {
  return (
    <ProtectedRoute>
      <WishlistView />
    </ProtectedRoute>
  );
}
