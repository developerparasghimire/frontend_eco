'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  FolderTree,
  MessageSquare,
  Package,
  RotateCcw,
  Send,
  ShoppingBag,
  Star,
  Tag,
  Truck,
  Users,
} from 'lucide-react';
import type { ReactNode } from 'react';

import { AdminGuard } from '@/components/auth/AdminGuard';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/admin-eco', label: 'Dashboard', icon: BarChart3, exact: true },
  { href: '/admin-eco/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin-eco/products', label: 'Products', icon: Package },
  { href: '/admin-eco/categories', label: 'Categories', icon: FolderTree },
  { href: '/admin-eco/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin-eco/customers', label: 'Customers', icon: Users },
  { href: '/admin-eco/returns', label: 'Returns', icon: RotateCcw },
  { href: '/admin-eco/reviews', label: 'Reviews', icon: Star },
  { href: '/admin-eco/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin-eco/newsletter', label: 'Newsletter', icon: Send },
  { href: '/admin-eco/shipping', label: 'Shipping', icon: Truck },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin-eco/login') {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="px-6 py-5 border-b border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <Link href="/">
              <img src="/logoonly.png" alt="Eco Planet Solar" style={{ height: 32, width: 'auto', marginBottom: 8 }} />
            </Link>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Panel</p>
          </div>
          <nav className="px-3 pb-6">
            <Sidebar />
          </nav>
        </aside>
        <main className="flex-1 px-4 py-6 lg:px-10">{children}</main>
      </div>
    </AdminGuard>
  );
}

function Sidebar() {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                active
                  ? 'bg-slate-900 font-medium text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
