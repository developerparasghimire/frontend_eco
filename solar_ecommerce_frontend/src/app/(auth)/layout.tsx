import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Solar
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">
            Back to site
          </Link>
        </div>
      </header>
      <main className="container py-12">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
