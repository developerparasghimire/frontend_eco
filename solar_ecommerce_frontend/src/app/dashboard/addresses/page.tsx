'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AddressList } from '@/components/account/AddressList';

export default function AddressesPage() {
  return (
    <ProtectedRoute>
      <div className="container max-w-5xl py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Saved addresses</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage shipping and billing addresses used at checkout.
        </p>
        <div className="mt-8">
          <AddressList />
        </div>
      </div>
    </ProtectedRoute>
  );
}
