'use client';

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Package, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Truck, X, Zap } from 'lucide-react';

import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/Input';
import { Pagination } from '@/components/ui/Pagination';
import { Select } from '@/components/ui/Select';
import { useCategories, useProducts } from '@/hooks/useProducts';
import type { ProductListParams } from '@/services/api/products';

const PAGE_SIZE = 20;
type Sort = NonNullable<ProductListParams['ordering']>;

const SORT_OPTIONS: Array<{ value: Sort; label: string }> = [
  { value: '-created_at', label: 'Newest first' },
  { value: 'created_at', label: 'Oldest first' },
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

  const categoryName = categoriesQuery.data?.results?.find((c) => c.slug === category)?.name;

  return (
    <>
      {/* Page Banner */}
      <div className="shop-page-banner">
        <div className="shop-page-banner__inner">
          <p className="shop-page-banner__eyebrow">ECO PLANET SOLAR</p>
          <h1>{category && categoryName ? categoryName : 'Solar Shop'}</h1>
          <p className="shop-page-banner__sub">
            Premium solar panels, batteries &amp; inverters — engineered for Australian conditions.
            {!productsQuery.isLoading && totalResults > 0 && (
              <span className="ml-2 font-semibold text-white/80">{totalResults} products</span>
            )}
          </p>
        </div>
      </div>

      {/* Trust Strip */}
      <div className="shop-trust-strip">
        <div className="shop-trust-strip__inner">
          <span className="shop-trust-item"><Truck size={15} />Free shipping over $500</span>
          <span className="shop-trust-item"><ShieldCheck size={15} />CEC Approved Installer</span>
          <span className="shop-trust-item"><Zap size={15} />Expert solar advice</span>
          <span className="shop-trust-item"><RotateCcw size={15} />Easy returns</span>
          <span className="shop-trust-item"><Package size={15} />Genuine products</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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

        {/* Active filter chips */}
        {activeFilterCount > 0 && (
          <div className="shop-filter-chips mb-4">
            {debouncedQuery && (
              <button
                type="button"
                className="shop-filter-chip"
                onClick={() => { setQuery(''); updateParams({ search: undefined, page: undefined }); }}
              >
                Search: &ldquo;{debouncedQuery}&rdquo;
                <X size={12} />
              </button>
            )}
            {category && (
              <button
                type="button"
                className="shop-filter-chip"
                onClick={() => updateParams({ category: undefined, page: undefined })}
              >
                {categoryName || category}
                <X size={12} />
              </button>
            )}
            <button
              type="button"
              className="text-xs font-medium text-slate-400 hover:text-red-500 ml-1 transition-colors"
              onClick={() => { setQuery(''); updateParams({ search: undefined, category: undefined, page: undefined }); }}
            >
              Clear all
            </button>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block space-y-4">
            <div className="sticky top-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">Search</h2>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="!pl-8"
                />
              </div>

              <h2 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Category</h2>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => updateParams({ category: undefined, page: undefined })}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${!category ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  All products
                  {!category && totalResults > 0 && <span className="ml-auto float-right text-xs text-green-600">{totalResults}</span>}
                </button>
                {categoriesQuery.data?.results?.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => updateParams({ category: c.slug, page: undefined })}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm font-medium transition-colors ${category === c.slug ? 'bg-green-50 text-green-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <h2 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">Sort by</h2>
              <Select value={ordering} onChange={(e) => updateParams({ ordering: e.target.value, page: undefined })}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>

              {(query || category) && (
                <button
                  onClick={() => { setQuery(''); updateParams({ search: undefined, category: undefined, page: undefined }); }}
                  className="mt-4 text-xs font-medium text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={11} /> Clear all filters
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
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                <Search size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-base font-semibold text-slate-700">No products match your filters</p>
                <p className="mt-1 text-sm text-slate-500">Try a different search term or category.</p>
                <button
                  onClick={() => { setQuery(''); updateParams({ search: undefined, category: undefined, page: undefined }); }}
                  className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition"
                >
                  View all products
                </button>
              </div>
            ) : (
              <>
                {/* Result count */}
                <div className="flex items-center justify-between">
                  <p className="shop-result-count">
                    <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'} found
                  </p>
                  <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
                    <span>Sort:</span>
                    <Select
                      value={ordering}
                      onChange={(e) => updateParams({ ordering: e.target.value, page: undefined })}
                      className="!py-1 !text-xs border-slate-200"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </Select>
                  </div>
                </div>
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
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
