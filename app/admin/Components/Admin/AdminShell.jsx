"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
} from "lucide-react";

const navGroups = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Pages",
        href: "/admin/pages",
        icon: FileText,
      },
      {
        label: "Services",
        href: "/admin/services",
        icon: ShieldCheck,
      },
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Messages",
        href: "/admin/messages",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  const toggleTheme = () => {
    setDarkMode((previous) => !previous);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div
      className={`min-h-screen ${darkMode ? "dark bg-[#071416]" : "bg-slate-50"}`}
    >
      <div className="flex min-h-screen text-slate-900 dark:text-white">
        {/* Mobile Backdrop */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white shadow-xl transition-all duration-300 dark:border-white/10 dark:bg-[#0C1E21] ${
            collapsed ? "w-[82px]" : "w-[270px]"
          } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        >
          {/* Brand Header */}
          <div
            className={`flex h-20 shrink-0 items-center border-b border-slate-200 px-4 dark:border-white/10 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <Link
              href="/admin"
              className="flex items-center gap-3"
              onClick={() => setMobileOpen(false)}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-white shadow-lg shadow-[#1E8A8A]/20">
                <ShieldCheck size={22} />
              </div>

              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold tracking-wide">
                    Universal Admin
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control Panel
                  </p>
                </div>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navGroups.map((group) => (
              <div key={group.title} className="mb-6">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-slate-400 uppercase dark:text-slate-500">
                    {group.title}
                  </p>
                )}

                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                          active
                            ? "bg-[#1E8A8A] text-white shadow-md shadow-[#1E8A8A]/20"
                            : "text-slate-600 hover:bg-slate-100 hover:text-[#1E8A8A] dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        <Icon
                          size={19}
                          className="shrink-0"
                          strokeWidth={active ? 2.4 : 2}
                        />

                        {!collapsed && (
                          <>
                            <span className="flex-1 truncate">
                              {item.label}
                            </span>
                            {active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Collapse Button */}
          <div className="hidden border-t border-slate-200 p-3 lg:block dark:border-white/10">
            <button
              type="button"
              onClick={() => setCollapsed((previous) => !previous)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-[#1E8A8A] dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {collapsed ? (
                <ChevronRight size={18} />
              ) : (
                <>
                  <ChevronLeft size={18} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* User Profile */}
          <div
            className={`border-t border-slate-200 p-3 dark:border-white/10 ${
              collapsed ? "flex justify-center" : ""
            }`}
          >
            {collapsed ? (
              <div
                title="Admin"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E8A8A] text-sm font-bold text-white"
              >
                A
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-white/5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E8A8A] text-sm font-bold text-white">
                  A
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">Admin</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    Administrator
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <div
          className={`flex min-h-screen min-w-0 flex-1 flex-col transition-all duration-300 ${
            collapsed ? "lg:ml-[82px]" : "lg:ml-[270px]"
          }`}
        >
          {/* Top Bar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#0C1E21]/90">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                aria-label="Open sidebar"
                className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-[#1E8A8A] lg:hidden dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Menu size={21} />
              </button>

              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Admin Panel
                </p>

                <h1 className="text-lg font-bold capitalize sm:text-xl">
                  {pathname === "/admin"
                    ? "Dashboard"
                    : pathname
                        .split("/")
                        .filter(Boolean)
                        .pop()
                        ?.replace(/-/g, " ")
                        .replace(/\b\w/g, (letter) => letter.toUpperCase()) ||
                      "Dashboard"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-100 hover:text-[#1E8A8A] dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:flex dark:border-white/10 dark:text-slate-300 dark:hover:border-red-500/20 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
