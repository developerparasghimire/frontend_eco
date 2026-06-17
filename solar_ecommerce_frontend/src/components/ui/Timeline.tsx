import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface TimelineItem {
  key: string;
  label: string;
  description?: string;
  timestamp?: string | null;
  state: 'done' | 'current' | 'upcoming';
  icon?: ReactNode;
}

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative space-y-6 border-l border-slate-200 pl-6">
      {items.map((item) => {
        const dot =
          item.state === 'done'
            ? 'bg-emerald-500 ring-emerald-100'
            : item.state === 'current'
            ? 'bg-amber-500 ring-amber-100'
            : 'bg-slate-300 ring-slate-100';
        const text =
          item.state === 'upcoming' ? 'text-slate-400' : 'text-slate-900';
        return (
          <li key={item.key} className="relative">
            <span
              className={clsx(
                'absolute -left-[33px] top-1 h-4 w-4 rounded-full ring-4',
                dot,
              )}
              aria-hidden="true"
            />
            <p className={clsx('text-sm font-medium', text)}>{item.label}</p>
            {item.description ? (
              <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
            ) : null}
            {item.timestamp ? (
              <p className="mt-0.5 text-xs text-slate-400">
                {new Date(item.timestamp).toLocaleString()}
              </p>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
