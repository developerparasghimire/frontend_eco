'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Heart, ShoppingCart, User, Menu, X, Home, Search, GitCompare } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthStatus, useAuthStore } from '@/store/auth';
import { useCompareStore } from '@/store/compare';
import { useGuestCartStore } from '@/store/guestCart';

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-green-600 px-1 text-[10px] font-semibold text-white">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function ShopHeader() {
  const router = useRouter();
  const status = useAuthStatus();
  const user = useAuthStore((s) => s.user);
  const cart = useCart();
  const wishlist = useWishlist();
  const compareCount = useCompareStore((s) => s.slugs.length);
  const guestCartCount = useGuestCartStore((s) => s.lines.reduce((sum, l) => sum + l.quantity, 0));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  const cartCount = status === 'authenticated' ? cart.data?.total_items ?? 0 : guestCartCount;
  const wishCount = wishlist.data?.count ?? 0;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      {/* Main bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors" aria-label="Back to home">
            <Home size={16} />
            <span className="hidden sm:inline text-xs">Home</span>
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/products" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">S</span>
            <span className="text-sm font-semibold tracking-tight text-slate-900">Solar Shop</span>
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">
          <form onSubmit={submitSearch} className="mr-2 hidden md:flex items-center">
            <label className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="h-8 w-56 rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none"
              />
            </label>
          </form>
          <Link href="/products" className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            Products
          </Link>
          <Link href="/compare" aria-label="Compare" className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <GitCompare size={18} />
            <Badge count={compareCount} />
          </Link>
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <Heart size={18} />
            <Badge count={wishCount} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <ShoppingCart size={18} />
            <Badge count={cartCount} />
          </Link>
          <Link href={status === 'authenticated' ? '/dashboard' : '/login'} aria-label="Account" className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <User size={18} />
          </Link>
          {user?.is_staff ? (
            <Link href="/ecoplanet-admin" className="ml-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700">
              Admin
            </Link>
          ) : null}
        </nav>

        {/* Mobile: icons + hamburger */}
        <div className="flex sm:hidden items-center gap-1">
          <Link href="/wishlist" aria-label="Wishlist" className="relative rounded-md p-2 text-slate-600">
            <Heart size={18} />
            <Badge count={wishCount} />
          </Link>
          <Link href="/cart" aria-label="Cart" className="relative rounded-md p-2 text-slate-600">
            <ShoppingCart size={18} />
            <Badge count={cartCount} />
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-1">
          <form onSubmit={submitSearch} className="px-1 pb-2">
            <label className="relative block">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                aria-label="Search products"
                className="h-9 w-full rounded-full border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm"
              />
            </label>
          </form>
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Home size={15} /> Back to main site
          </Link>
          <Link href="/products" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Browse Products
          </Link>
          <Link href="/compare" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <GitCompare size={15} /> Compare ({compareCount})
          </Link>
          <Link href={status === 'authenticated' ? '/dashboard' : '/login'} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <User size={15} /> {status === 'authenticated' ? 'Dashboard' : 'Login'}
          </Link>
          {user?.is_staff ? (
            <Link href="/ecoplanet-admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white">
              Admin dashboard
            </Link>
          ) : null}
        </div>
      )}
    </header>
  );
}
