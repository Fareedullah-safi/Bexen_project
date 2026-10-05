export default function Toolbar({
  search,
  filters,
  actions,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-black/[0.06] pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/[0.08]">
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        {search}
        {filters}
      </div>

      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
