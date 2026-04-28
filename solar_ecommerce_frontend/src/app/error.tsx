'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('Root error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Something went wrong</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        An unexpected error occurred. You can try again, or head back to the homepage.
      </p>
      {error.digest ? (
        <p className="mt-2 text-[11px] uppercase tracking-wider text-slate-400">
          Error ref: {error.digest}
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
