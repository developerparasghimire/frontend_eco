'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { useAuthStore } from '@/store/auth';

/**
 * Wrap any client component / page that requires an authenticated user.
 * Redirects to /login while preserving the original path in `?next=`.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'unauthenticated') {
      const next = typeof window !== 'undefined'
        ? window.location.pathname + window.location.search
        : '/';
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    }
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
