"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  Bell,
  ChevronDown,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
  X,
  BriefcaseBusiness,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Home Page", href: "/admin/home", icon: FileText },
      { name: "Services", href: "/admin/services", icon: BriefcaseBusiness },
    ],
  },
  {
    label: "Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "Messages", href: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isDark = mounted && theme === "dark";

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20">
              <ShieldCheck size={22} />
            </div>

            <div>
              <p className="text-sm font-black tracking-wide text-[var(--foreground)]">
                UNIVERSAL
              </p>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[var(--muted)]">
                ADMIN PANEL
              </p>
            </div>
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
                        active
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                      }`}
                    >
                      <Icon size={19} />
                      <span>{item.name}</span>

                      {active && (
                        <span className="ml-auto h-2 w-2 rounded-full bg-[var(--accent)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] p-4">
          <div className="rounded-2xl bg-[var(--surface-soft)] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-white">
                A
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--foreground)]">
                  Administrator
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  admin@website.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--foreground)] hover:bg-[var(--surface-soft)] lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-3 md:flex md:w-[280px] lg:w-[340px]">
              <Search size={18} className="text-[var(--muted)]" />
              <input
                placeholder="Search anything..."
                className="h-10 w-full bg-transparent text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              <span className="rounded-md border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">
                /
              </span>
            </div>

            <p className="text-sm font-bold text-[var(--foreground)] md:hidden">
              Universal Admin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] sm:flex"
            >
              <ExternalLink size={17} />
              View Site
            </Link>

            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              title="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              >
                <Bell size={19} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-14 w-[300px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-bold">Notifications</p>
                    <span className="rounded-full bg-[var(--accent-soft)] px-2 py-1 text-[10px] font-bold text-[var(--accent)]">
                      3 New
                    </span>
                  </div>

                  <div className="space-y-2">
                    {[
                      "New user registered",
                      "New message received",
                      "Website analytics updated",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-[var(--surface-soft)] p-3 text-sm text-[var(--muted)]"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1.5 pr-2.5 hover:bg-[var(--surface-soft)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-white">
                  A
                </div>

                <span className="hidden text-sm font-bold sm:block">
                  Admin
                </span>

                <ChevronDown
                  size={15}
                  className="hidden text-[var(--muted)] sm:block"
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
                  <div className="border-b border-[var(--border)] px-3 py-3">
                    <p className="font-bold">Administrator</p>
                    <p className="text-xs text-[var(--muted)]">
                      admin@website.com
                    </p>
                  </div>

                  <button className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]">
                    <Settings size={17} />
                    Account Settings
                  </button>

                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10">
                    <LogOut size={17} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
