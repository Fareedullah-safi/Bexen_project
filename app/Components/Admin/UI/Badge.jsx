export default function Badge({
  children,
  status,
  variant,
  dot = true,
  className = "",
}) {
  const styles = {
    success:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",

    published:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",

    active:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",

    warning:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",

    pending:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",

    draft:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",

    danger:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

    failed:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

    inactive:
      "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",

    info:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",

    neutral:
      "bg-slate-100 text-slate-600 dark:bg-white/[0.07] dark:text-slate-300",
  };

  const dots = {
    success: "bg-emerald-500",
    published: "bg-emerald-500",
    active: "bg-emerald-500",

    warning: "bg-amber-500",
    pending: "bg-amber-500",
    draft: "bg-amber-500",

    danger: "bg-red-500",
    failed: "bg-red-500",
    inactive: "bg-red-500",

    info: "bg-blue-500",

    neutral: "bg-slate-400",
  };

  const normalized =
    variant ||
    String(status || "neutral")
      .toLowerCase()
      .replaceAll(" ", "-");

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
        styles[normalized] || styles.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            dots[normalized] || dots.neutral
          }`}
        />
      )}

      {children}
    </span>
  );
}
