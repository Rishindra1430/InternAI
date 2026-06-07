import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return start + index;
  });

  return (
    <div className="flex items-center justify-center gap-2">
      <button type="button" className="btn-outline px-3" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <HiOutlineChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((item) => (
        <button
          key={item}
          type="button"
          className={item === page ? 'btn-primary min-w-10' : 'btn-outline min-w-10'}
          onClick={() => onPageChange(item)}
        >
          {item}
        </button>
      ))}
      <button type="button" className="btn-outline px-3" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <HiOutlineChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
