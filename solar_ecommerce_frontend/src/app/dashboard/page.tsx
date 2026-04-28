'use client';

import Link from 'next/link';
import { Heart, KeyRound, MapPin, Package, ShoppingBag, UserRound } from 'lucide-react';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useUser } from '@/store/auth';

const TILES = [
  { href: '/dashboard/orders', title: 'Orders', desc: 'Track, review, and manage purchases.', Icon: Package },
  { href: '/dashboard/addresses', title: 'Addresses', desc: 'Saved shipping & billing addresses.', Icon: MapPin },
  { href: '/wishlist', title: 'Wishlist', desc: 'Items you saved for later.', Icon: Heart },
  { href: '/cart', title: 'Cart', desc: 'Review items currently in your cart.', Icon: ShoppingBag },
  { href: '/dashboard/change-password', title: 'Change password', desc: 'Update your account password.', Icon: KeyRound },
];

function DashboardContent() {
  const user = useUser();
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
            <UserRound size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Hi{user?.first_name ? `, ${user.first_name}` : ''}!
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Signed in as <span className="font-medium text-slate-900">{user?.email}</span>
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          Sign out
        </Button>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, title, desc, Icon }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 transition group-hover:bg-brand-100">
              <Icon size={20} />
            </div>
            <h2 className="mt-4 text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
