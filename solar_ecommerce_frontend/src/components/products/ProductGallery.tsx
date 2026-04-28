'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { ProductImage } from '@/types/product';

interface ProductGalleryProps {
  images: ProductImage[];
  fallbackName: string;
}

export function ProductGallery({ images, fallbackName }: ProductGalleryProps) {
  const sorted = [...images].sort(
    (a, b) =>
      Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  );
  const [active, setActive] = useState(0);
  const current = sorted[active];

  if (sorted.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
        No images
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.image}
          alt={current.alt_text || fallbackName}
          className="aspect-square w-full object-cover"
        />
      </div>

      {sorted.length > 1 ? (
        <div className="grid grid-cols-5 gap-2">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(idx)}
              className={cn(
                'overflow-hidden rounded-lg border bg-white transition',
                idx === active
                  ? 'border-brand-500 ring-2 ring-brand-200'
                  : 'border-slate-200 hover:border-slate-400',
              )}
              aria-label={`View image ${idx + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image}
                alt={img.alt_text || `${fallbackName} ${idx + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
