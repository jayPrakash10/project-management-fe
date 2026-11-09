import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { buttonStyles } from './button-styles';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/** Page numbers to show, with null standing for a gap: 1 … 4 5 6 … 10 */
function getPageItems(page: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const items: (number | null)[] = [];
  sorted.forEach((value, index) => {
    if (index > 0 && value - sorted[index - 1] > 1) items.push(null);
    items.push(value);
  });
  return items;
}

export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  const items = getPageItems(page, totalPages);

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        className={buttonStyles({ variant: 'ghost', size: 'sm' })}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        <ChevronLeft aria-hidden className="size-4" />
        <span>Previous</span>
      </button>

      <ul className="hidden items-center gap-1 sm:flex">
        {items.map((item, index) =>
          item === null ? (
            <li key={`gap-${index}`} aria-hidden className="px-1 text-fg-subtle">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
                className={cn(
                  buttonStyles({ variant: 'ghost', size: 'sm', iconOnly: true }),
                  'tabular-nums',
                  item === page && 'bg-accent-soft text-accent-soft-fg hover:bg-accent-soft',
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>
      <span className="px-2 text-sm text-fg-muted tabular-nums sm:hidden">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        className={buttonStyles({ variant: 'ghost', size: 'sm' })}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        <span>Next</span>
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
