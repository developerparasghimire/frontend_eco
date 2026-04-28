'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Shop error boundary caught:', error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-slate-900">We hit a snag</h2>
      <p className="mt-2 text-sm text-slate-500">
        Something went wrong while loading this page. Please try again.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Try again
        </button>
        <Link
          href="/products"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
