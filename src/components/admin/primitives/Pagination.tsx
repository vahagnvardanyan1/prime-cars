"use client";

import { memo, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
};

// Extract default value to prevent broken memoization (rule 5.3)
const DEFAULT_PAGE_SIZE_OPTIONS = [25, 50, 100];

export const Pagination = memo(function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const t = useTranslations("admin.pagination");

  // Memoize derived values
  const { startItem, endItem, canGoPrevious, canGoNext } = useMemo(() => ({
    startItem: totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1,
    endItem: Math.min(currentPage * pageSize, totalItems),
    canGoPrevious: currentPage > 1,
    canGoNext: currentPage < totalPages,
  }), [currentPage, pageSize, totalItems, totalPages]);

  // Stable callbacks
  const handlePrevPage = useCallback(() => onPageChange(currentPage - 1), [onPageChange, currentPage]);
  const handleNextPage = useCallback(() => onPageChange(currentPage + 1), [onPageChange, currentPage]);
  const handlePageSizeChange = useCallback((value: string) => onPageSizeChange(parseInt(value, 10)), [onPageSizeChange]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 dark:border-white/10">
      {/* Items info and page size selector */}
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>
          {t("showing")} {startItem}-{endItem} {t("of")} {totalItems}
        </span>
        <div className="flex items-center gap-2">
          <span>{t("itemsPerPage")}:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[80px] bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#161b22] border-gray-200 dark:border-white/10">
              {pageSizeOptions.map((size) => (
                <SelectItem 
                  key={size} 
                  value={size.toString()}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevPage}
          disabled={!canGoPrevious}
          className="h-8 w-8 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-1">
          {/* Show page numbers */}
          {totalPages <= 7 ? (
            // Show all pages if 7 or fewer
            Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page)}
                className={`h-8 min-w-[32px] px-2 ${
                  page === currentPage
                    ? 'bg-[#429de6] text-white border-[#429de6] hover:bg-[#3a8dd6] hover:text-white'
                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {page}
              </Button>
            ))
          ) : (
            // Show ellipsis for many pages
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                className={`h-8 min-w-[32px] px-2 ${
                  1 === currentPage
                    ? 'bg-[#429de6] text-white border-[#429de6] hover:bg-[#3a8dd6] hover:text-white'
                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                1
              </Button>
              
              {currentPage > 3 && <span className="px-2 text-gray-400">...</span>}
              
              {currentPage > 2 && currentPage < totalPages - 1 && (
                <>
                  {currentPage > 3 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage - 1)}
                      className="h-8 min-w-[32px] px-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      {currentPage - 1}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(currentPage)}
                    className="h-8 min-w-[32px] px-2 bg-[#429de6] text-white border-[#429de6] hover:bg-[#3a8dd6] hover:text-white"
                  >
                    {currentPage}
                  </Button>
                  {currentPage < totalPages - 2 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(currentPage + 1)}
                      className="h-8 min-w-[32px] px-2 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      {currentPage + 1}
                    </Button>
                  )}
                </>
              )}
              
              {currentPage < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className={`h-8 min-w-[32px] px-2 ${
                  totalPages === currentPage
                    ? 'bg-[#429de6] text-white border-[#429de6] hover:bg-[#3a8dd6] hover:text-white'
                    : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNextPage}
          disabled={!canGoNext}
          className="h-8 w-8 border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});
