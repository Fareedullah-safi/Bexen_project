"use client";

import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Pagination({
  page = 1,
  totalPages = 1,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 border-t border-black/[0.06] px-4 py-4 dark:border-white/[0.08]">
      <p className="text-[11px] text-slate-400">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() =>
            onPageChange?.(page - 1)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/[0.06]"
        >
          <ChevronLeft size={15} />
        </button>

        {Array.from({
          length: totalPages,
        }).map((_, index) => {
          const current = index + 1;

          return (
            <button
              type="button"
              key={current}
              onClick={() =>
                onPageChange?.(current)
              }
              className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold ${
                page === current
                  ? "bg-[#1E8A8A] text-white"
                  : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/[0.06]"
              }`}
            >
              {current}
            </button>
          );
        })}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() =>
            onPageChange?.(page + 1)
          }
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-white/[0.06]"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}
