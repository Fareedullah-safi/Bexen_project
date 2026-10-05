export default function PageHeader({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1E8A8A]">
              {eyebrow}
            </p>
          )}

          <h1 className="text-2xl font-bold tracking-tight text-[#0C1E21] dark:text-white sm:text-3xl">
            {title}
          </h1>

          {description && (
            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
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
    </div>
  );
}
