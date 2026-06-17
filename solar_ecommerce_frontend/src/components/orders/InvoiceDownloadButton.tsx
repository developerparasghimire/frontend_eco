'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { ordersApi } from '@/services/api/orders';

interface InvoiceDownloadButtonProps {
  orderNumber: string;
  /** Pass the guest access token for unauthenticated guest orders. */
  guestToken?: string;
  variant?: 'button' | 'link';
  className?: string;
}

export function InvoiceDownloadButton({
  orderNumber,
  guestToken,
  variant = 'link',
  className,
}: InvoiceDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await ordersApi.invoiceBlob(orderNumber, guestToken);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      // Revoke after a short delay so the click has time to register.
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Could not download invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'button') {
    return (
      <div className={className}>
        <Button variant="outline" block loading={loading} onClick={handleDownload}>
          Download invoice (PDF)
        </Button>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="block w-full text-center text-sm font-medium text-brand-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Preparing PDF…' : 'Download invoice (PDF)'}
      </button>
      {error ? <p className="mt-1 text-center text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
