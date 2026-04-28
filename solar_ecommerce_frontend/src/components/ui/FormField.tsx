import { ReactNode } from 'react';

import { cn } from '@/lib/cn';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Layout helper for a labelled input + inline validation message.
 * Pairs with `react-hook-form` (pass `formState.errors[name]?.message` as `error`).
 */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
