import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface PaginationProps {
  page: number;
  totalCount: number;
  pageSize?: number;
  hasNext: boolean;
  hasPrev: boolean;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalCount,
  pageSize = 20,
  hasNext,
  hasPrev,
  onChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      <p className="text-sm text-slate-500">
        Page <span className="font-medium text-slate-900">{page}</span> of {totalPages}
        <span className="ml-2 text-slate-400">({totalCount} items)</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
