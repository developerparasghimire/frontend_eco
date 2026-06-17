'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'solar.cookies.consent.v1';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.localStorage.getItem(STORAGE_KEY)) {
      setShow(true);
    }
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'accepted');
    setShow(false);
  };

  const decline = () => {
    window.localStorage.setItem(STORAGE_KEY, 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur md:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
        <p className="text-slate-700">
          We use cookies to enhance your browsing experience and analyse traffic. By accepting,
          you agree to our{' '}
          <Link href="/privacy" className="font-medium underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={decline}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-slate-700 hover:bg-slate-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-slate-900 px-4 py-1.5 text-white hover:bg-slate-700"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
