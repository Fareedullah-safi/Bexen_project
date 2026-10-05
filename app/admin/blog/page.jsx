export default function Page() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="rounded-2xl border border-black/[0.06] bg-white p-8 shadow-[0_4px_20px_rgba(12,30,33,0.03)] dark:border-white/[0.08] dark:bg-[#101F21]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1E8A8A]">
            Admin
          </p>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#0C1E21] dark:text-white">
            Blog
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            This module is ready for the next development step.
          </p>
        </div>
      </div>
    </div>
  );
}
