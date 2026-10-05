"use client";

export default function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  disabled = false,
  className = "",
  onClick,
}) {
  const variants = {
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-[#0C1E21] dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white",
    primary:
      "bg-[#1E8A8A] text-white hover:bg-[#187575]",
    danger:
      "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10",
    soft:
      "bg-[#1E8A8A]/10 text-[#1E8A8A] hover:bg-[#1E8A8A]/15",
  };

  const sizes = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-9 w-9 rounded-xl",
    lg: "h-10 w-10 rounded-xl",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`inline-flex shrink-0 items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
    </button>
  );
}
