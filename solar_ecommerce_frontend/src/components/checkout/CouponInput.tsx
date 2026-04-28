'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { couponsApi } from '@/services/api/coupons';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';
import type { CouponPreview } from '@/types/coupon';

interface Props {
  applied: CouponPreview | null;
  onApply: (preview: CouponPreview) => void;
  onClear: () => void;
}

export function CouponInput({ applied, onApply, onClear }: Props) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const preview = await couponsApi.apply(code.trim().toUpperCase());
      onApply(preview);
      setCode('');
    } catch (err) {
      setError(formatApiError(err, 'Invalid coupon.'));
    } finally {
      setLoading(false);
    }
  };

  if (applied) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <span>
          <span className="font-semibold text-emerald-700">{applied.coupon}</span> applied —
          you save {formatPrice(applied.discount_amount)}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-emerald-700 hover:underline"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Promo code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="uppercase"
        />
        <Button type="submit" variant="outline" loading={loading} disabled={!code.trim()}>
          Apply
        </Button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
