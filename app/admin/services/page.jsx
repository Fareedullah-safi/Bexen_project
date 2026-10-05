import { BriefcaseBusiness } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
          Content Management
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Services
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Create and manage your website services.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <BriefcaseBusiness
            size={42}
            className="mb-4 text-[var(--accent)]"
          />
          <h2 className="text-xl font-bold">Service Management</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            Add, edit, organize, and manage your website services here.
          </p>
        </div>
      </div>
    </div>
  );
}
