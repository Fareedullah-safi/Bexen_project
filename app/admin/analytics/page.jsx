import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
          Universal Admin
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Monitor website performance, traffic, and growth.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <BarChart3 size={42} className="mb-4 text-[var(--accent)]" />
          <h2 className="text-xl font-bold">Analytics Management</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            Analytics tools and website performance data will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
