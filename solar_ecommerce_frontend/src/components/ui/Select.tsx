import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          'block w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm',
          'shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200',
          'disabled:cursor-not-allowed disabled:bg-slate-50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
