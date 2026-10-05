import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
          System
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Configure your universal admin panel.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <Settings size={42} className="mb-4 text-[var(--accent)]" />
          <h2 className="text-xl font-bold">System Settings</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            Configure website and administrator settings here.
          </p>
        </div>
      </div>
    </div>
  );
}
