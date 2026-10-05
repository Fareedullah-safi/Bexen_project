"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function Dropdown({
  label,
  trigger,
  children,
  align = "right",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2"
        aria-expanded={open}
      >
        {trigger || (
          <span className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-3.5 text-sm font-medium text-[#0C1E21] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white">
            {label}
          </span>
        )}

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] z-[100] min-w-[190px] overflow-hidden rounded-xl border border-black/[0.07] bg-white p-1.5 shadow-xl dark:border-white/[0.08] dark:bg-[#111E20] ${
            align === "left"
              ? "left-0"
              : "right-0"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  children,
  icon,
  danger = false,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${
        danger
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/[0.05]"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
