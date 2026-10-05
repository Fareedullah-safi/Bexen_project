import {
  Users,
  FileText,
  BriefcaseBusiness,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Plus,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "2,847",
    change: "+12.5%",
    positive: true,
    icon: Users,
  },
  {
    title: "Total Pages",
    value: "24",
    change: "+8.2%",
    positive: true,
    icon: FileText,
  },
  {
    title: "Services",
    value: "18",
    change: "+4.6%",
    positive: true,
    icon: BriefcaseBusiness,
  },
  {
    title: "Messages",
    value: "126",
    change: "-2.4%",
    positive: false,
    icon: MessageSquare,
  },
];

export default function Dashboard() {
  return (
    <div className="mx-auto max-w-[1600px]">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
            Welcome back, Administrator
          </p>
          <h1 className="text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Here's what's happening with your website today.
          </p>
        </div>

        <button className="flex w-fit items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[var(--accent)]/20 transition hover:-translate-y-0.5 hover:shadow-xl">
          <Plus size={18} />
          Quick Action
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={21} />
                </div>

                <span
                  className={`flex items-center gap-1 text-xs font-bold ${
                    stat.positive ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {stat.positive ? (
                    <ArrowUpRight size={14} />
                  ) : (
                    <ArrowDownRight size={14} />
                  )}
                  {stat.change}
                </span>
              </div>

              <p className="text-sm font-medium text-[var(--muted)]">
                {stat.title}
              </p>

              <h2 className="mt-1 text-3xl font-black text-[var(--foreground)]">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Website Overview</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Performance during the last 30 days
              </p>
            </div>

            <Activity className="text-[var(--accent)]" size={21} />
          </div>

          <div className="flex h-[250px] items-end gap-2 sm:gap-3">
            {[35, 48, 42, 65, 58, 74, 62, 81, 70, 88, 76, 94].map(
              (height, index) => (
                <div
                  key={index}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full rounded-t-lg bg-[var(--accent)] opacity-70 transition-all duration-300 group-hover:opacity-100"
                  />
                </div>
              ),
            )}
          </div>

          <div className="mt-4 flex justify-between text-xs text-[var(--muted)]">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
          <h2 className="text-lg font-bold">Quick Actions</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Frequently used admin actions
          </p>

          <div className="mt-6 space-y-3">
            {[
              ["Create New Page", FileText],
              ["Add New Service", BriefcaseBusiness],
              ["Manage Users", Users],
              ["View Messages", MessageSquare],
            ].map(([name, Icon]) => (
              <button
                key={name}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
              >
                <span className="flex items-center gap-3 text-sm font-semibold">
                  <Icon size={18} className="text-[var(--accent)]" />
                  {name}
                </span>

                <ArrowUpRight size={17} className="text-[var(--muted)]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
