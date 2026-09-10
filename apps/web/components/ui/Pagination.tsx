"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(validCurrentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | "...")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "...")[] = [];
    const showLeftEllipsis = validCurrentPage > 4;
    const showRightEllipsis = validCurrentPage < totalPages - 3;

    pages.push(1);

    if (showLeftEllipsis) {
      pages.push("...");
    }

    const start = Math.max(2, validCurrentPage - 1);
    const end = Math.min(totalPages - 1, validCurrentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (showRightEllipsis) {
      pages.push("...");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-3 border-t border-slate-200/80 text-xs text-[var(--text-secondary)] ${className}`}
    >
      {/* Metrics Range & Page Size Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-medium text-[var(--text-tertiary)]">
          Showing <strong className="text-[var(--text-primary)] font-bold">{startItem}–{endItem}</strong> of{" "}
          <strong className="text-[var(--text-primary)] font-bold">{totalItems.toLocaleString()}</strong> results
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200/80">
            <span className="text-[11px] text-[var(--text-muted)]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-500)] cursor-pointer shadow-2xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Page Controls */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={validCurrentPage <= 1}
          aria-label="First page"
          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:text-[var(--text-primary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(validCurrentPage - 1)}
          disabled={validCurrentPage <= 1}
          aria-label="Previous page"
          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:text-[var(--text-primary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Numbered Page Buttons */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-slate-400 select-none font-bold"
                >
                  ...
                </span>
              );
            }

            const isActive = p === validCurrentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? "page" : undefined}
                className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[var(--brand-600)] text-white shadow-xs font-extrabold"
                    : "border border-slate-200/80 bg-white text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-50 shadow-2xs"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(validCurrentPage + 1)}
          disabled={validCurrentPage >= totalPages}
          aria-label="Next page"
          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:text-[var(--text-primary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={validCurrentPage >= totalPages}
          aria-label="Last page"
          className="p-1.5 rounded-lg border border-slate-200/80 bg-white text-slate-500 hover:text-[var(--text-primary)] hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-2xs"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
