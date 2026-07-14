'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

import { useAuthStore } from '@/store/auth';

/**
 * Admin-only guard. Redirects unauthenticated users to /login and
 * non-staff users to the home page.
 */
export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin-eco/login');
      return;
    }
    if (status === 'authenticated' && user && !user.is_staff) {
      router.replace('/');
    }
  }, [status, user, router]);

  if (status !== 'authenticated' || !user || !user.is_staff) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Loading…
      </div>
    );
  }
  return <>{children}</>;
}
