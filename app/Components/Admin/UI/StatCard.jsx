export default function StatCard({
  title,
  value,
  change,
  description,
  icon,
  trend = "up",
}) {
  return (
    <div className="group rounded-2xl border border-black/[0.06] bg-white p-5 shadow-[0_4px_20px_rgba(12,30,33,0.03)] transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/[0.08] dark:bg-[#101F21]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          {icon}
        </div>

        {change && (
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              trend === "up"
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-[#0C1E21] dark:text-white">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-[10px] text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
