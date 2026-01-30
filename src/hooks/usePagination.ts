type UsePaginationProps = {
  currentPage: number;
  totalPages: number;
  paginationItemsToDisplay: number;
};

type UsePaginationReturn = {
  pages: number[];
  showLeftEllipsis: boolean;
  showRightEllipsis: boolean;
};

/**
 * Pagination range calculator.
 *
 * Generates a stable page window centered around the current page
 * while keeping the total number of visible items bounded.
 * Ellipsis flags are exposed to allow the UI to indicate skipped ranges.
 */
export function usePagination({
  currentPage,
  totalPages,
  paginationItemsToDisplay
}: UsePaginationProps): UsePaginationReturn {
  // Determines whether there are hidden pages before or after
  // the visible pagination window
  const showLeftEllipsis = currentPage - 1 > paginationItemsToDisplay / 2;
  const showRightEllipsis = totalPages - currentPage + 1 > paginationItemsToDisplay / 2;

  function calculatePaginationRange(): number[] {
    // If all pages fit, avoid ellipsis and range logic
    if (totalPages <= paginationItemsToDisplay) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Centers the range around the current page
    const halfDisplay = Math.floor(paginationItemsToDisplay / 2);
    const initialRange = {
      start: currentPage - halfDisplay,
      end: currentPage + halfDisplay
    };

    // Clamps the range to valid page boundaries
    const adjustedRange = {
      start: Math.max(1, initialRange.start),
      end: Math.min(totalPages, initialRange.end)
    };

    // Keeps a consistent window size when near edges
    if (adjustedRange.start === 1) {
      adjustedRange.end = paginationItemsToDisplay;
    }

    if (adjustedRange.end === totalPages) {
      adjustedRange.start = totalPages - paginationItemsToDisplay + 1;
    }

    // Leaves space for ellipsis indicators in the UI
    if (showLeftEllipsis) adjustedRange.start++;
    if (showRightEllipsis) adjustedRange.end--;

    return Array.from({ length: adjustedRange.end - adjustedRange.start + 1 }, (_, i) => adjustedRange.start + i);
  }

  const pages = calculatePaginationRange();

  return {
    pages,
    showLeftEllipsis,
    showRightEllipsis
  };
}
