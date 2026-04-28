'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { useAddresses } from '@/hooks/useAddresses';
import { AddressForm } from '@/components/account/AddressForm';
import type { Address } from '@/types/auth';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AddressPicker({ selectedId, onSelect }: Props) {
  const { data, isLoading } = useAddresses();
  const [adding, setAdding] = useState(false);

  if (isLoading) return <p className="text-sm text-slate-500">Loading addresses…</p>;

  const addresses = data?.results ?? [];

  return (
    <div className="space-y-3">
      {addresses.length === 0 && !adding ? (
        <p className="text-sm text-slate-500">
          You have no saved addresses. Add one to continue.
        </p>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {addresses.map((addr) => (
          <li key={addr.id}>
            <label
              className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 text-sm transition ${
                selectedId === addr.id
                  ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-200'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-2">
                <input
                  type="radio"
                  name="address"
                  className="mt-1 h-4 w-4 text-brand-600"
                  checked={selectedId === addr.id}
                  onChange={() => onSelect(addr.id)}
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">
                    {addr.label}
                    {addr.is_default ? (
                      <span className="ml-2 text-xs font-normal text-brand-700">(default)</span>
                    ) : null}
                  </p>
                  <p className="text-slate-700">{addr.full_name} · {addr.phone}</p>
                  <p className="text-slate-600">{addr.address_line1}</p>
                  {addr.address_line2 ? <p className="text-slate-600">{addr.address_line2}</p> : null}
                  <p className="text-slate-600">
                    {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                  </p>
                </div>
              </div>
            </label>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Add a new address</h4>
          <AddressForm
            onSuccess={(addr: Address) => {
              setAdding(false);
              onSelect(addr.id);
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          + Add a new address
        </button>
      )}
    </div>
  );
}
