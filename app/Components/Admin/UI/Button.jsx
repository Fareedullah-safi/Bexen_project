"use client";

import { Loader2 } from "lucide-react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  type = "button",
  className = "",
  onClick,
}) {
  const variants = {
    primary:
      "bg-[#1E8A8A] text-white hover:bg-[#187575] shadow-sm hover:shadow-md",
    secondary:
      "border border-black/[0.08] bg-white text-[#0C1E21] hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]",
    soft:
      "bg-[#1E8A8A]/10 text-[#1E8A8A] hover:bg-[#1E8A8A]/15",
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-[#0C1E21] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
    danger:
      "bg-red-500 text-white hover:bg-red-600 shadow-sm",
    dangerSoft:
      "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400",
    outline:
      "border border-[#1E8A8A]/30 bg-transparent text-[#1E8A8A] hover:bg-[#1E8A8A]/5",
  };

  const sizes = {
    sm: "h-8 rounded-lg px-3 text-xs",
    md: "h-10 rounded-xl px-4 text-sm",
    lg: "h-11 rounded-xl px-5 text-sm",
    xl: "h-12 rounded-xl px-6 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        iconPosition === "left" && icon
      )}

      {children}

      {!loading && iconPosition === "right" && icon}
    </button>
  );
}
