'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Button } from '@/components/ui/Button';
import {
  adminCategoriesApi,
  adminProductsApi,
  type ProductCreateInput,
} from '@/services/api/products';
import type { ProductDetail } from '@/types/product';
import { formatApiError } from '@/lib/errors';

interface Props {
  initial?: ProductDetail;
}

const EMPTY: ProductCreateInput = {
  name: '',
  sku: '',
  category: '',
  brand: '',
  capacity: '',
  price: '0',
  discount_percent: '0',
  stock: 0,
  description: '',
  technical_description: '',
  warranty_years: 0,
  lifespan_years: 0,
  delivery_days: 0,
  installation_available: false,
  installation_fee: '0',
  tags: '',
  is_featured: false,
  is_active: true,
};

export function ProductForm({ initial }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const [data, setData] = useState<ProductCreateInput>(EMPTY);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (initial) {
      setData({
        name: initial.name,
        slug: initial.slug,
        sku: initial.sku,
        category: initial.category.id,
        brand: initial.brand,
        capacity: initial.capacity,
        price: initial.price,
        discount_percent: initial.discount_percent,
        stock: initial.stock,
        description: initial.description,
        technical_description: initial.technical_description,
        warranty_years: initial.warranty_years,
        lifespan_years: initial.lifespan_years,
        delivery_days: initial.delivery_days,
        installation_available: initial.installation_available,
        installation_fee: initial.installation_fee,
        tags: initial.tags,
        is_featured: initial.is_featured,
        is_active: true,
      });
    }
  }, [initial]);

  const { data: cats } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminCategoriesApi.list(),
  });

  const save = useMutation({
    mutationFn: async () => {
      const product = initial
        ? await adminProductsApi.update(initial.slug, data)
        : await adminProductsApi.create(data);
      if (imageFile) {
        await adminProductsApi.uploadImage(product.slug, imageFile, product.name, !initial);
      }
      return product;
    },
    onSuccess: (product) => {
      toast.success(initial ? 'Product updated' : 'Product created');
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push(`/ecoplanet-admin/products/${product.slug}/edit`);
    },
    onError: (e) => toast.error(formatApiError(e, 'Save failed.')),
  });

  const remove = useMutation({
    mutationFn: () => adminProductsApi.remove(initial!.slug),
    onSuccess: () => {
      toast.success('Product deleted');
      void qc.invalidateQueries({ queryKey: ['admin', 'products'] });
      router.push('/ecoplanet-admin/products');
    },
    onError: (e) => toast.error(formatApiError(e, 'Delete failed.')),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate();
      }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Basic information</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Name" required>
            <input
              required
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="SKU" required>
            <input
              required
              value={data.sku}
              onChange={(e) => setData({ ...data, sku: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Category" required>
            <select
              required
              value={data.category}
              onChange={(e) => setData({ ...data, category: e.target.value })}
              className="input"
            >
              <option value="">Select…</option>
              {cats?.results.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <input
              value={data.brand ?? ''}
              onChange={(e) => setData({ ...data, brand: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Capacity (e.g. 5kW)">
            <input
              value={data.capacity ?? ''}
              onChange={(e) => setData({ ...data, capacity: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Tags (comma-separated)">
            <input
              value={data.tags ?? ''}
              onChange={(e) => setData({ ...data, tags: e.target.value })}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Pricing & inventory</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Field label="Price (₹)" required>
            <input
              required
              type="number"
              step="0.01"
              value={data.price}
              onChange={(e) => setData({ ...data, price: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Discount %">
            <input
              type="number"
              step="0.01"
              value={data.discount_percent ?? '0'}
              onChange={(e) => setData({ ...data, discount_percent: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Stock" required>
            <input
              required
              type="number"
              value={data.stock}
              onChange={(e) => setData({ ...data, stock: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Delivery days">
            <input
              type="number"
              value={data.delivery_days ?? 0}
              onChange={(e) => setData({ ...data, delivery_days: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Warranty (years)">
            <input
              type="number"
              value={data.warranty_years ?? 0}
              onChange={(e) => setData({ ...data, warranty_years: Number(e.target.value) })}
              className="input"
            />
          </Field>
          <Field label="Lifespan (years)">
            <input
              type="number"
              value={data.lifespan_years ?? 0}
              onChange={(e) => setData({ ...data, lifespan_years: Number(e.target.value) })}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Installation</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.installation_available ?? false}
              onChange={(e) =>
                setData({ ...data, installation_available: e.target.checked })
              }
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Installation service available
          </label>
          <Field label="Installation fee (₹)">
            <input
              type="number"
              step="0.01"
              value={data.installation_fee ?? '0'}
              onChange={(e) => setData({ ...data, installation_fee: e.target.value })}
              className="input"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Description</h2>
        <div className="mt-4 grid gap-3">
          <Field label="Short description">
            <textarea
              rows={3}
              value={data.description ?? ''}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Technical specifications">
            <textarea
              rows={6}
              value={data.technical_description ?? ''}
              onChange={(e) =>
                setData({ ...data, technical_description: e.target.value })
              }
              className="input font-mono text-xs"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Image</h2>
        {initial?.images?.length ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {initial.images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-slate-200"
              >
                <Image
                  src={img.image}
                  alt={img.alt_text}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                {img.is_primary ? (
                  <span className="absolute left-1 top-1 rounded bg-brand-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Primary
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <Field label={initial ? 'Add another image' : 'Primary image'}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </Field>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-semibold text-slate-900">Visibility</h2>
        <div className="mt-3 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.is_active ?? true}
              onChange={(e) => setData({ ...data, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Active (visible in store)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.is_featured ?? false}
              onChange={(e) => setData({ ...data, is_featured: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600"
            />
            Featured on home
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          <Button type="submit" loading={save.isPending}>
            {initial ? 'Save changes' : 'Create product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/ecoplanet-admin/products')}
          >
            Cancel
          </Button>
        </div>
        {initial ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (confirm(`Delete “${initial.name}”? This cannot be undone.`)) {
                remove.mutate();
              }
            }}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Delete product
          </Button>
        ) : null}
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid rgb(203 213 225);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: rgb(20 184 166);
          box-shadow: 0 0 0 2px rgb(153 246 228 / 0.5);
        }
      `}</style>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
