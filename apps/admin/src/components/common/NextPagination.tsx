'use client';

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface NextPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage: number;
  onItemsPerPageChange?: (size: number) => void;
  className?: string;
  showTotal?: boolean;
  pageSizeOptions?: number[];
}

export const NextPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  className,
  showTotal = true,
  pageSizeOptions = [10, 20, 50, 100],
}: NextPaginationProps) => {
  // Logic to calculate page numbers to show (Smart Pagination)
  const getPageNumbers = () => {
    const current = currentPage;
    const last = totalPages;
    const delta = 1; // Number of pages to show around the current page
    const boundary = 2; // Number of pages to show at the start and end

    const range = [];
    for (let i = 1; i <= last; i++) {
      if (
        i <= boundary || // Start boundaries
        i > last - boundary || // End boundaries
        (i >= current - delta && i <= current + delta) // Around current page
      ) {
        range.push(i);
      }
    }

    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (const i of range) {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('ellipsis');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  // Calculate range for "Showing x-y of z"
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);
  const actualStartItem = Math.min(startItem, totalItems || 0);

  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center justify-between gap-4 px-5 py-3.5 bg-slate-100 border border-slate-300/80 shadow-md rounded-2xl transition-all",
      className
    )}>
      {/* Left side: Total items info */}
      <div className="flex items-center gap-4">
        {showTotal && totalItems !== undefined && (
          <div className="text-[11px] font-medium italic whitespace-nowrap text-slate-500">
            Hiển thị <span className="font-bold text-slate-900">{actualStartItem}-{endItem}</span> trên <span className="font-bold text-slate-900">{totalItems}</span> bản ghi
          </div>
        )}

        {/* Page size select */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 border-l pl-4 border-slate-200/80">
            <span className="text-[11px] font-medium text-slate-400">Hiển thị:</span>
            <Select 
              value={String(itemsPerPage)}
              onValueChange={(value) => onItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-[115px] text-[11px] font-semibold bg-white border border-slate-200/90 rounded-xl shadow-xs text-slate-700 hover:border-blue-300 transition-all">
                <SelectValue placeholder={`${itemsPerPage} / trang`} />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                {pageSizeOptions.map(option => (
                  <SelectItem key={option} value={String(option)} className="text-[11px] font-bold rounded-lg">
                    {option} / trang
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      {/* Right side: Pagination controls */}
      <Pagination className="w-auto mx-0 justify-end">
        <PaginationContent className="gap-1.5">
          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(1);
              }}
              className={cn(
                "h-8 w-8 p-0 text-[11px] font-bold transition-all duration-150 cursor-pointer rounded-xl bg-white border border-slate-200/90 border-b-2 border-b-slate-300 text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-slate-200",
                currentPage === 1 && "pointer-events-none opacity-40 grayscale"
              )}
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
          
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              href="#"
              className={cn(
                "h-8 w-8 text-[11px] font-bold transition-all duration-150 cursor-pointer rounded-xl bg-white border border-slate-200/90 border-b-2 border-b-slate-300 text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-slate-200",
                currentPage === 1 && "pointer-events-none opacity-40 grayscale"
              )}
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis className="h-8 w-8 text-slate-400" />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page as number);
                  }}
                  className={cn(
                    "h-8 w-8 min-w-8 text-[11px] font-bold transition-all duration-150 cursor-pointer rounded-xl",
                    currentPage === page 
                      ? "bg-blue-600 text-white border-b-2 border-blue-800 shadow-md shadow-blue-500/30 font-extrabold hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-0"
                      : "bg-white border border-slate-200/90 border-b-2 border-b-slate-300 text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-slate-200"
                  )}
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(currentPage + 1);
              }}
              href="#"
              className={cn(
                "h-8 w-8 text-[11px] font-bold transition-all duration-150 cursor-pointer rounded-xl bg-white border border-slate-200/90 border-b-2 border-b-slate-300 text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-slate-200",
                currentPage === totalPages && "pointer-events-none opacity-40 grayscale"
              )}
            />
          </PaginationItem>

          <PaginationItem>
            <PaginationLink
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) onPageChange(totalPages);
              }}
              className={cn(
                "h-8 w-8 p-0 text-[11px] font-bold transition-all duration-150 cursor-pointer rounded-xl bg-white border border-slate-200/90 border-b-2 border-b-slate-300 text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-slate-200",
                currentPage === totalPages && "pointer-events-none opacity-40 grayscale"
              )}
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
