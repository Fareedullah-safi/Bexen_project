"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}) {
  useEffect(() => {
    if (!open) return;

    const previous =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.body.style.overflow = previous;

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-[#0C1E21]/50 backdrop-blur-sm"
        aria-label="Close modal"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={`relative max-h-[calc(100vh-32px)] w-full overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#101F21] ${sizes[size]}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
          <div>
            <h2 className="text-sm font-bold text-[#0C1E21] dark:text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-180px)] overflow-y-auto px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="border-t border-black/[0.06] px-5 py-4 dark:border-white/[0.08]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
