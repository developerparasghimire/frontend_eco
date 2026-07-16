'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { adminApi } from '@/services/api/admin';
import { productsApi } from '@/services/api/products';
import { formatApiError } from '@/lib/errors';
import { formatPrice } from '@/lib/format';

export default function AdminProductsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => productsApi.list({ page }),
  });

  const handleExport = async () => {
    setBusy(true);
    try {
      const blob = await adminApi.exportProductsCsv();
      const url = URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(formatApiError(e, 'Export failed.'));
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (file: File) => {
    setBusy(true);
    try {
      const result = await adminApi.importProductsCsv(file);
      toast.success(
        `Imported: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`,
      );
      if (result.errors.length) {
        toast.message(`Errors: ${result.errors.slice(0, 3).join('; ')}`);
      }
      void refetch();
    } catch (e) {
      toast.error(formatApiError(e, 'Import failed.'));
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImport(f);
            }}
          />
          <Link
            href="/admin-eco/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            <Plus size={14} /> New product
          </Link>
          <Button variant="outline" onClick={() => fileRef.current?.click()} loading={busy}>
            <Upload size={14} className="mr-1.5" /> Import CSV
          </Button>
          <Button variant="outline" onClick={handleExport} loading={busy}>
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                  Failed to load products. Please try again.
                </td>
              </tr>
            ) : (
              data?.results.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.category_name}</td>
                  <td className="px-4 py-3">{formatPrice(p.discounted_price ?? p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={p.in_stock ? 'text-emerald-700' : 'text-red-600 font-medium'}
                    >
                      {p.in_stock ? 'In stock' : 'Out of stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin-eco/products/${p.slug}/edit`}
                      className="text-xs font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && (data.previous || data.next) ? (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <button
            disabled={!data.previous}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            disabled={!data.next}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}
