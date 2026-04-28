'use client';

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { useCategories, useProducts } from '@/hooks/useProducts';
import type { ProductListParams } from '@/services/api/products';

const PAGE_SIZE = 20;
type Sort = NonNullable<ProductListParams['ordering']>;

const SORT_OPTIONS: Array<{ value: Sort; label: string }> = [
  { value: '-created_at', label: 'Newest' },
  { value: 'created_at', label: 'Oldest' },
  { value: 'price', label: 'Price: low → high' },
  { value: '-price', label: 'Price: high → low' },
];

function useDebounced<T>(value: T, ms = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

function ProductsView() {
  const router = useRouter();
  const search = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [query, setQuery] = useState(search.get('search') ?? '');
  const debouncedQuery = useDebounced(query);
  const category = search.get('category') ?? '';
  const ordering = (search.get('ordering') as Sort) ?? '-created_at';
  const page = Number(search.get('page') ?? '1') || 1;

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(search.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    router.replace(`/products${params.toString() ? `?${params}` : ''}`, { scroll: false });
  };

  useEffect(() => {
    const current = search.get('search') ?? '';
    if (debouncedQuery === current) return;
    updateParams({ search: debouncedQuery || undefined, page: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const params: ProductListParams = useMemo(
    () => ({
      search: debouncedQuery || undefined,
      category__slug: category || undefined,
      ordering,
      page,
    }),
    [debouncedQuery, category, ordering, page],
  );

  const productsQuery = useProducts(params);
  const categoriesQuery = useCategories();

  const data = productsQuery.data;
  const items = data?.results ?? [];
  const totalResults = data?.count ?? 0;

  const activeFilterCount = [debouncedQuery, category].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      {/* Page header */}
      <div className="mb-6 flex flex-col gap-1 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Solar Shop</h1>
        <p className="text-sm text-slate-500">
          Panels, batteries &amp; inverters — engineered for the long haul.
          {totalResults > 0 && <span className="ml-2 font-medium text-slate-700">{totalResults} products</span>}
        </p>
      </div>

      {/* Mobile filter bar */}
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>
        <Select
          value={ordering}
          onChange={(e) => updateParams({ ordering: e.target.value, page: undefined })}
          className="flex-1 !py-2.5 rounded-xl border-slate-200 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Filters</span>
            <button onClick={() => setFiltersOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Search</label>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Category</label>
              <Select value={category} onChange={(e) => updateParams({ category: e.target.value || undefined, page: undefined })}>
                <option value="">All categories</option>
                {categoriesQuery.data?.results?.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </Select>
            </div>
            {(query || category) && (
              <button
                onClick={() => { setQuery(''); updateParams({ search: undefined, category: undefined, page: undefined }); setFiltersOpen(false); }}
                className="text-xs font-medium text-red-500 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Search</h2>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" />

            <h2 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Category</h2>
            <Select value={category} onChange={(e) => updateParams({ category: e.target.value || undefined, page: undefined })}>
              <option value="">All categories</option>
              {categoriesQuery.data?.results?.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </Select>

            <h2 className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">Sort by</h2>
            <Select value={ordering} onChange={(e) => updateParams({ ordering: e.target.value, page: undefined })}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>

            {(query || category) && (
              <button
                onClick={() => { setQuery(''); updateParams({ search: undefined, category: undefined, page: undefined }); }}
                className="mt-4 text-xs font-medium text-red-500 hover:text-red-700"
              >
                Clear all filters
              </button>
            )}
          </div>
        </aside>

        {/* Results */}
        <section className="space-y-5">
          {productsQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              Couldn&apos;t load products. Please try again.
            </div>
          ) : null}

          {productsQuery.isLoading ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-base font-medium text-slate-700">No products match your filters.</p>
              <p className="mt-1 text-sm text-slate-500">Try a different search term or category.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 grid-cols-2 sm:gap-4 md:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              {data ? (
                <Pagination
                  page={page}
                  totalCount={data.count}
                  pageSize={PAGE_SIZE}
                  hasNext={Boolean(data.next)}
                  hasPrev={Boolean(data.previous)}
                  onChange={(p) => updateParams({ page: p > 1 ? String(p) : undefined })}
                />
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
