"use client";

import { Search, X } from "lucide-react";

export default function SearchInput({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
}) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="h-10 w-full rounded-xl border border-black/[0.07] bg-slate-50 pl-10 pr-9 text-sm text-[#0C1E21] outline-none transition placeholder:text-slate-400 focus:border-[#1E8A8A]/40 focus:bg-white focus:ring-4 focus:ring-[#1E8A8A]/[0.07] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.06]"
      />

      {value && (
        <button
          type="button"
          onClick={() =>
            onChange?.({
              target: {
                value: "",
              },
            })
          }
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.08]"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
