export default function LoadingState({
  rows = 5,
  variant = "table",
}) {
  if (variant === "card") {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-black/[0.06] bg-white p-5 dark:border-white/[0.08] dark:bg-[#101F21]"
          >
            <div className="h-10 w-10 rounded-xl bg-slate-200 dark:bg-white/[0.08]" />
            <div className="mt-5 h-3 w-20 rounded bg-slate-200 dark:bg-white/[0.08]" />
            <div className="mt-2 h-7 w-28 rounded bg-slate-200 dark:bg-white/[0.08]" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center gap-4 rounded-xl border border-black/[0.04] p-4 dark:border-white/[0.05]"
        >
          <div className="h-9 w-9 rounded-lg bg-slate-200 dark:bg-white/[0.08]" />

          <div className="flex-1">
            <div className="h-3 w-40 rounded bg-slate-200 dark:bg-white/[0.08]" />

            <div className="mt-2 h-2.5 w-24 rounded bg-slate-200 dark:bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}
