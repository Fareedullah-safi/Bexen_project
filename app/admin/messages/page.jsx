import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
          Management
        </p>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Messages
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Review and manage incoming messages.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8">
        <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
          <MessageSquare size={42} className="mb-4 text-[var(--accent)]" />
          <h2 className="text-xl font-bold">Message Management</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--muted)]">
            Customer and website messages will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
