'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/hooks/useCart';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import type { CartItem } from '@/types/order';

function QuantityInput({ item }: { item: CartItem }) {
  const update = useUpdateCartItem();
  const [value, setValue] = useState(item.quantity);
  const max = Math.max(1, item.product_detail.in_stock ? 99 : item.quantity);

  const commit = (next: number) => {
    const clamped = Math.max(1, Math.min(max, Math.floor(next) || 1));
    setValue(clamped);
    if (clamped !== item.quantity) {
      update.mutate({ itemId: item.id, quantity: clamped });
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
      <button
        type="button"
        onClick={() => commit(value - 1)}
        disabled={value <= 1 || update.isPending}
        className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value) || 1)}
        onBlur={() => commit(value)}
        className="w-12 border-x border-slate-200 bg-transparent py-1 text-center text-sm focus:outline-none"
      />
      <button
        type="button"
        onClick={() => commit(value + 1)}
        disabled={update.isPending}
        className="px-2 py-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

function CartView() {
  const cart = useCart();
  const remove = useRemoveCartItem();
  const clear = useClearCart();
  const update = useUpdateCartItem();
  const [error, setError] = useState<string | null>(null);

  if (cart.isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-12 text-sm text-slate-500">Loading cart…</div>;
  }

  const items = cart.data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6">
        <div className="mx-auto max-w-xs">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="mt-2 text-sm text-slate-500">
            Browse the shop to find solar gear you&apos;ll love.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
          >
            Shop Now →
          </Link>
        </div>
      </div>
    );
  }

  const handleRemove = async (id: string) => {
    setError(null);
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const handleClear = async () => {
    setError(null);
    try {
      await clear.mutateAsync();
    } catch (err) {
      setError(formatApiError(err));
    }
  };

  const handleInstallToggle = (item: CartItem, checked: boolean) => {
    update.mutate({ itemId: item.id, quantity: item.quantity, include_installation: checked });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">Your Cart</h1>
        <button
          type="button"
          onClick={handleClear}
          disabled={clear.isPending}
          className="text-xs text-slate-400 hover:text-red-600 disabled:opacity-50 transition-colors"
        >
          Clear all
        </button>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-3">
          {items.map((item) => {
            const p = item.product_detail;
            return (
              <li
                key={item.id}
                className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 sm:gap-4 sm:p-4"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                  {p.primary_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.primary_image} alt={p.name} className="h-full w-full object-cover" />
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link
                      href={`/products/${p.slug}`}
                      className="text-sm font-semibold text-slate-900 hover:text-green-700 leading-snug line-clamp-2 transition-colors"
                    >
                      {p.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      disabled={remove.isPending}
                      className="ml-auto shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                      aria-label="Remove from cart"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{p.brand || p.category_name}</p>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
                    <div className="space-y-1">
                      <QuantityInput item={item} />
                      {item.include_installation !== undefined && (
                        <label className="flex items-center gap-1.5 text-xs text-slate-500">
                          <input
                            type="checkbox"
                            checked={item.include_installation}
                            onChange={(e) => handleInstallToggle(item, e.target.checked)}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-green-600"
                          />
                          + Installation
                        </label>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{formatPrice(item.unit_price)} each</p>
                      <p className="text-base font-bold text-slate-900">
                        {formatPrice(item.line_total)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-600">Subtotal ({cart.data!.total_items} item{cart.data!.total_items !== 1 ? 's' : ''})</dt>
              <dd className="font-medium text-slate-900">{formatPrice(cart.data!.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-600">Installation</dt>
              <dd className="font-medium text-slate-900">{formatPrice(cart.data!.installation_total)}</dd>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="font-bold text-green-700">{formatPrice(cart.data!.grand_total)}</dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-green-600 px-6 text-base font-semibold text-white transition-colors hover:bg-green-700 shadow-sm"
          >
            Proceed to Checkout →
          </Link>
          <Link
            href="/products"
            className="block text-center text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartView />
    </ProtectedRoute>
  );
}
