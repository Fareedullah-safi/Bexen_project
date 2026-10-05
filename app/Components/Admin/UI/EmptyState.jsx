export default function EmptyState({
  icon,
  title = "Nothing here yet",
  description = "There is no data to display.",
  action,
}) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center px-6 py-10 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-bold text-[#0C1E21] dark:text-white">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>

      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  );
}
