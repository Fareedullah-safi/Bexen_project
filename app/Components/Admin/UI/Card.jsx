export default function Card({
  children,
  title,
  description,
  action,
  padding = true,
  className = "",
}) {
  return (
    <section
      className={`rounded-2xl border border-black/[0.06] bg-white shadow-[0_4px_20px_rgba(12,30,33,0.03)] dark:border-white/[0.08] dark:bg-[#101F21] ${
        padding ? "p-5 sm:p-6" : ""
      } ${className}`}
    >
      {(title || description || action) && (
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && (
              <h2 className="text-sm font-bold text-[#0C1E21] dark:text-white">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-xs text-slate-400">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="shrink-0">
              {action}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}
