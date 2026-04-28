'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAddresses, useDeleteAddress } from '@/hooks/useAddresses';
import { AddressForm } from './AddressForm';
import type { Address } from '@/types/auth';

export function AddressList() {
  const { data, isLoading } = useAddresses();
  const remove = useDeleteAddress();
  const [editing, setEditing] = useState<Address | null>(null);
  const [adding, setAdding] = useState(false);

  if (isLoading) return <p className="text-sm text-slate-500">Loading addresses…</p>;

  const addresses = data?.results ?? [];

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !adding ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-500">You haven&apos;t saved any addresses yet.</p>
          <Button className="mt-4" onClick={() => setAdding(true)}>
            Add your first address
          </Button>
        </div>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((addr) => (
          <li
            key={addr.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 text-sm"
          >
            {editing?.id === addr.id ? (
              <AddressForm
                initial={editing}
                onSuccess={() => setEditing(null)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {addr.label}
                      {addr.is_default ? (
                        <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                          Default
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {addr.address_type}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setEditing(addr)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
                      aria-label="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Delete this address?')) remove.mutate(addr.id);
                      }}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5 text-slate-700">
                  <p>{addr.full_name}</p>
                  <p>{addr.phone}</p>
                  <p>{addr.address_line1}</p>
                  {addr.address_line2 ? <p>{addr.address_line2}</p> : null}
                  <p>
                    {addr.city}, {addr.state} {addr.postal_code}
                  </p>
                  <p>{addr.country}</p>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">New address</h3>
          <AddressForm
            onSuccess={() => setAdding(false)}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : addresses.length > 0 ? (
        <div>
          <Button variant="outline" onClick={() => setAdding(true)}>
            + Add new address
          </Button>
        </div>
      ) : null}
    </div>
  );
}
