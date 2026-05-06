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
import { cn } from "@/lib/utils";

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

import { useBackground } from "@/components/providers/BackgroundProvider";

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
  const { currentBackground } = useBackground();
  // Logic to calculate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 7; // Increased to show more context

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logic for ellipsis
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, 'ellipsis', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, 'ellipsis', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  // Calculate range for "Showing x-y of z"
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0);

  return (
    <div className={cn(
      "flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-4 border-t", 
      currentBackground ? "bg-white/5 border-white/10" : "bg-white border-slate-100",
      className
    )}>
      {/* Left side: Total items info */}
      <div className="flex items-center gap-4">
        {showTotal && totalItems !== undefined && (
          <div className={cn("text-[11px] font-medium italic whitespace-nowrap", currentBackground ? "text-white/60" : "text-slate-500")}>
            Hiển thị <span className={cn("font-bold", currentBackground ? "text-white" : "text-slate-900")}>{startItem}-{endItem}</span> trên <span className={cn("font-bold", currentBackground ? "text-white" : "text-slate-900")}>{totalItems}</span> bản ghi
          </div>
        )}

        {/* Page size select */}
        {onItemsPerPageChange && (
          <div className={cn("flex items-center gap-2 border-l pl-4", currentBackground ? "border-white/10" : "border-slate-100")}>
            <span className={cn("text-[11px] font-medium", currentBackground ? "text-white/40" : "text-slate-400")}>Hiển thị:</span>
            <select 
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className={cn(
                "border text-[11px] font-bold rounded-lg block p-1 transition-all outline-none cursor-pointer",
                currentBackground 
                  ? "bg-white/10 border-white/20 text-white focus:ring-white/30 focus:border-white/40" 
                  : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-500 focus:border-blue-500"
              )}
            >
              {pageSizeOptions.map(option => (
                <option key={option} value={option} className={currentBackground ? "bg-slate-900" : ""}>{option} / trang</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Right side: Pagination controls */}
      <Pagination className="w-auto mx-0 justify-end">
        <PaginationContent className="gap-1">
          <PaginationItem>
            <PaginationPrevious 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              href="#"
              className={cn(
                "h-8 px-3 text-[11px] font-bold transition-all cursor-pointer",
                currentBackground
                  ? "border-white/10 text-white hover:bg-white/10 hover:text-white"
                  : "border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100",
                currentPage === 1 && "pointer-events-none opacity-40 grayscale"
              )}
            />
          </PaginationItem>

          {pages.map((page, index) => (
            <PaginationItem key={index}>
              {page === 'ellipsis' ? (
                <PaginationEllipsis className={cn("h-8 w-8", currentBackground ? "text-white/40" : "text-slate-400")} />
              ) : (
                <PaginationLink
                  href="#"
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page as number);
                  }}
                  className={cn(
                    "h-8 w-8 min-w-8 text-[11px] font-bold transition-all cursor-pointer",
                    currentPage === page 
                      ? (currentBackground 
                          ? "bg-white text-black border-white shadow-lg" 
                          : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white shadow-sm shadow-blue-100")
                      : (currentBackground
                          ? "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                          : "border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100")
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
                "h-8 px-3 text-[11px] font-bold transition-all cursor-pointer",
                currentBackground
                  ? "border-white/10 text-white hover:bg-white/10 hover:text-white"
                  : "border-slate-200 text-slate-900 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100",
                currentPage === totalPages && "pointer-events-none opacity-40 grayscale"
              )}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
