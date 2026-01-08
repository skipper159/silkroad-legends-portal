import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface RankingPaginationProps {
  currentPage: number;
  totalPages?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
  className?: string;
}

const RankingPagination: React.FC<RankingPaginationProps> = ({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  itemsPerPage = 50,
  totalItems,
  className = '',
}) => {
  // Calculate approximate total pages if not provided
  const calculatedTotalPages =
    totalPages || (totalItems ? Math.ceil(totalItems / itemsPerPage) : currentPage + (hasMore ? 1 : 0));

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const totalPageCount = calculatedTotalPages;

    if (totalPageCount <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPageCount; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= Math.min(4, totalPageCount); i++) {
          pages.push(i);
        }
        if (totalPageCount > 4) {
          pages.push('...');
          pages.push(totalPageCount);
        }
      } else if (currentPage >= totalPageCount - 2) {
        // Near the end
        pages.push(1);
        if (totalPageCount > 4) {
          pages.push('...');
        }
        for (let i = Math.max(totalPageCount - 3, 2); i <= totalPageCount; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPageCount);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col items-center gap-4 mt-6 ${className}`}>
      {/* Main pagination controls */}
      <div className='flex items-center justify-center gap-2'>
        {/* Previous Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className='bg-theme-surface/20 border-theme-primary/30 text-theme-text hover:bg-theme-primary/20 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className='flex items-center gap-1'>
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <div key={`ellipsis-${index}`} className='px-2 py-1 text-theme-text-muted'>
                  <MoreHorizontal className='h-4 w-4' />
                </div>
              );
            }

            const pageNum = page as number;
            const isCurrentPage = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrentPage ? 'default' : 'outline'}
                size='sm'
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[40px] ${
                  isCurrentPage
                    ? 'bg-theme-primary text-theme-text-muted font-semibold hover:bg-theme-primary/90'
                    : 'bg-theme-surface/20 border-theme-primary/30 text-theme-text hover:bg-theme-primary/20'
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore || currentPage >= calculatedTotalPages}
          className='bg-theme-surface/20 border-theme-primary/30 text-theme-text hover:bg-theme-primary/20 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          Next
          <ChevronRight className='h-4 w-4 ml-1' />
        </Button>
      </div>

      {/* Page Info and Stats */}
      <div className='flex items-center gap-4 text-sm text-theme-text-muted'>
        <span>
          Page {currentPage} of {calculatedTotalPages}
        </span>
        {totalItems && (
          <>
            <span>•</span>
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of{' '}
              {totalItems.toLocaleString()} players
            </span>
          </>
        )}
        {!totalItems && (
          <>
            <span>•</span>
            <span>Showing {itemsPerPage} players per page</span>
          </>
        )}
      </div>
    </div>
  );
};

export default RankingPagination;
