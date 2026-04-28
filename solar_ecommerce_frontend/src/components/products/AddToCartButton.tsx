'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useCart';
import { formatApiError } from '@/lib/errors';
import { useAuthStatus } from '@/store/auth';
import type { ProductDetail } from '@/types/product';

interface AddToCartButtonProps {
  product: ProductDetail;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const status = useAuthStatus();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const [withInstall, setWithInstall] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onAdd = async () => {
    setError(null);
    if (status !== 'authenticated') {
      router.push(`/login?next=/products/${product.slug}`);
      return;
    }
    try {
      await addToCart.mutateAsync({
        product: product.id,
        quantity: qty,
        include_installation: withInstall,
      });
    } catch (err) {
      setError(formatApiError(err, 'Could not add to cart.'));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label htmlFor="qty" className="text-sm text-slate-600">
          Quantity
        </label>
        <input
          id="qty"
          type="number"
          min={1}
          max={Math.max(1, product.stock)}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
          className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {product.installation_available ? (
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={withInstall}
            onChange={(e) => setWithInstall(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-300"
          />
          Add installation (+${Number(product.installation_fee).toFixed(2)} per unit)
        </label>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          size="lg"
          disabled={!product.in_stock}
          loading={addToCart.isPending}
          onClick={onAdd}
        >
          Add to cart
        </Button>
        {addToCart.isSuccess && !error ? (
          <span className="text-sm font-medium text-emerald-600">Added!</span>
        ) : null}
      </div>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
