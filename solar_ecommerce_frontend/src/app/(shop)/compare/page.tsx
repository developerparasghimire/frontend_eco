'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { productsApi } from '@/services/api/products';
import { formatPrice } from '@/lib/format';
import { useCompareStore } from '@/store/compare';
import type { ProductDetail } from '@/types/product';

export default function ComparePage() {
  const slugs = useCompareStore((s) => s.slugs);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!slugs.length) {
      setProducts([]);
      return;
    }
    setLoading(true);
    Promise.all(slugs.map((slug) => productsApi.detail(slug).catch(() => null)))
      .then((results) => {
        if (cancelled) return;
        setProducts(results.filter((p): p is ProductDetail => !!p));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  if (!slugs.length) {
    return (
      <div className="container max-w-3xl py-16">
        <EmptyState
          title="Nothing to compare yet"
          description="Add up to 4 products from the catalogue to compare specs side-by-side."
          actionLabel="Browse products"
          actionHref="/products"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Compare products</h1>
        <Button variant="outline" onClick={clear}>
          Clear all
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-slate-500">Loading…</p>
      ) : (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="w-40 px-4 py-3 text-left font-medium text-slate-500">Attribute</th>
                {products.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-left">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${p.slug}`} className="font-semibold text-slate-900 hover:underline">
                        {p.name}
                      </Link>
                      <button
                        type="button"
                        onClick={() => remove(p.slug)}
                        aria-label={`Remove ${p.name}`}
                        className="text-slate-400 hover:text-slate-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <Row label="Price">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3 font-semibold text-slate-900">
                    {formatPrice(p.discounted_price ?? p.price)}
                  </td>
                ))}
              </Row>
              <Row label="Brand">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3">{p.brand || '—'}</td>
                ))}
              </Row>
              <Row label="Capacity">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3">{p.capacity || '—'}</td>
                ))}
              </Row>
              <Row label="Warranty">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    {p.warranty_years ? `${p.warranty_years} years` : '—'}
                  </td>
                ))}
              </Row>
              <Row label="Installation">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    {p.installation_available
                      ? `Available (${formatPrice(p.installation_fee)})`
                      : 'Not available'}
                  </td>
                ))}
              </Row>
              <Row label="Stock">
                {products.map((p) => (
                  <td key={p.id} className="px-4 py-3">
                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                  </td>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </th>
      {children}
    </tr>
  );
}
