"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import axios from "axios";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ExternalLink,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Newspaper,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  X,
  UserRound,
} from "lucide-react";

/* ============ MENU LINKS ============ */

const navigation = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Website Content",
    items: [
      {
        name: "Home Page",
        icon: FileText,
        children: [
          { name: "Hero", href: "/admin/home" },
          { name: "Features", href: "/admin/home/features" },
          { name: "Brand Logos", href: "/admin/home/brand-logos" },
          { name: "About Us", href: "/admin/home/about-us" },
          { name: "Services", href: "/admin/home/services" },
          { name: "Projects", href: "/admin/home/projects" },
          { name: "Counters", href: "/admin/home/counters" },
          { name: "FAQ", href: "/admin/home/faq" },
          { name: "Articles Section", href: "/admin/home/articles-section" },
        ],
      },
      {
        name: "About Us Page",
        icon: Info,
        children: [
          { name: "Banner", href: "/admin/about/banner" },
          { name: "Our Story", href: "/admin/about/our-story" },
          { name: "Recognitions", href: "/admin/about/recognitions" },
        ],
      },
      {
        name: "Services",
        icon: BriefcaseBusiness,
        children: [
          {
            name: "Business Strategy Development",
            href: "/admin/services/business-strategy-development",
          },
          {
            name: "Customer Experience Solutions",
            href: "/admin/services/customer-experience-solutions",
          },
          {
            name: "Sustainability and ESG Consulting",
            href: "/admin/services/sustainability-esg-consulting",
          },
          {
            name: "Training and Development Programs",
            href: "/admin/services/training-development-programs",
          },
        ],
      },
      {
        name: "Resources",
        icon: Newspaper,
        children: [
          { name: "Team Members", href: "/admin/resources/team" },
          { name: "Careers", href: "/admin/resources/careers" },
          { name: "News", href: "/admin/resources/news" },
          { name: "Feedback", href: "/admin/resources/feedback" },
          { name: "Contact Page", href: "/admin/resources/contact" },
        ],
      },
      {
        name: "Footer and Contact Info",
        href: "/admin/site/footer",
        icon: Phone,
      },
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
    items: [{ name: "Settings", href: "/admin/settings", icon: Settings }],
  },
];

/* ============ COMPONENT ============ */

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openName, setOpenName] = useState(null);

  // Logged-in administrator profile
  const [adminUid, setAdminUid] = useState("");
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminImage, setAdminImage] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  /* ============ LOAD SESSION ============ */

  useEffect(() => {
    setMounted(true);

    const loadSession = async () => {
      try {
        const res = await axios.get("/api/admin/adminusers/session", {
          withCredentials: true,
        });

        if (res.data.success && res.data.admin) {
          const admin = res.data.admin;

          setAdminUid(admin.uid || "");
          setAdminEmail(admin.email || "");
        }
      } catch (error) {
        console.error(
          "Unable to load admin session:",
          error.response?.data || error.message,
        );
      }
    };

    loadSession();
  }, []);
  //handle signout
  const handleSignOut = async () => {
    try {
      await axios.post(
        "/api/admin/adminusers/logout",
        {},
        { withCredentials: true },
      );
    } catch (error) {
      console.log("Sign out failed:", error);
    }
  };

  /* ============ LOAD SAVED PROFILE ============ */

  useEffect(() => {
    if (!adminUid) {
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);

      try {
        const res = await axios.get("/api/admin/adminusers/profile", {
          params: { UID: adminUid },
          withCredentials: true,
        });

        if (cancelled) return;

        if (res.data.success) {
          const profile = res.data.profile || res.data.data;

          if (profile) {
            setAdminName(profile.name || "Administrator");
            setAdminImage(profile.imageUrl || "");
          }
        }
      } catch (error) {
        console.log(
          "Unable to load admin profile:",
          error.response?.data || error.message,
        );
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [adminUid]);

  /* ============ PROFILE HELPERS ============ */

  const initials =
    adminName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("") || "A";

  const isDark = mounted && theme === "dark";

  const isActive = (href) => {
    if (href === "/admin") return pathname === "/admin";

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isChildActive = (href) => pathname === href;

  const activeGroupName =
    navigation
      .flatMap((group) => group.items)
      .find((item) => item.children?.some((child) => isChildActive(child.href)))
      ?.name ?? null;

  useEffect(() => {
    setMobileOpen(false);

    if (activeGroupName) {
      setOpenName(activeGroupName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  /* ============ AVATAR ============ */

  const renderAvatar = (size = "h-10 w-10", textSize = "text-sm") => (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--accent)]/20 bg-[var(--accent-soft)] font-bold text-[var(--accent)]`}
    >
      {adminImage ? (
        <img
          src={adminImage}
          alt={`${adminName} profile`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <span className={textSize}>{initials}</span>
      )}
    </div>
  );

  /* ============ NORMAL LINK ============ */

  const renderLink = (item) => {
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
  };

  /* ============ DROPDOWN ============ */

  const renderDropdown = (item) => {
    const Icon = item.icon;
    const open = openName === item.name;
    const groupActive = item.name === activeGroupName;

    return (
      <div key={item.name}>
        <button
          type="button"
          onClick={() => setOpenName(open ? null : item.name)}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all ${
            groupActive
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
          }`}
        >
          <Icon size={19} />
          <span className="flex-1 text-left">{item.name}</span>

          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <div className="mt-1 ml-6 space-y-0.5 border-l border-[var(--border)] pl-3">
            {item.children.map((child) => {
              const active = isChildActive(child.href);

              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-all ${
                    active
                      ? "bg-[var(--accent)] text-white"
                      : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      active ? "bg-white" : "bg-[var(--muted)]/50"
                    }`}
                  />
                  <span className="truncate">{child.name}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  /* ============ PAGE LAYOUT ============ */

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {mobileOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-[var(--border)] px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-lg">
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
            type="button"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-soft)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navigation.map((group) => (
            <div key={group.label} className="mb-6">
              <p className="mb-2 px-3 text-[10px] font-bold tracking-[0.18em] text-[var(--muted)] uppercase">
                {group.label}
              </p>

              <div className="space-y-1">
                {group.items.map((item) =>
                  item.children ? renderDropdown(item) : renderLink(item),
                )}
              </div>
            </div>
          ))}
        </div>

        {/* SIDEBAR PROFILE */}
        <div className="border-t border-[var(--border)] p-4">
          <Link
            href="/admin/users"
            className="block rounded-2xl bg-[var(--surface-soft)] p-3 transition-colors hover:bg-[var(--accent-soft)]"
          >
            <div className="flex items-center gap-3">
              {renderAvatar()}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--foreground)]">
                  {isProfileLoading ? "Loading profile..." : adminName}
                </p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {adminEmail || "Administrator"}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* RIGHT SIDE */}
      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
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

            {/* THEME TOGGLE */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              title="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* NOTIFICATIONS */}
            <div className="relative">
              <button
                type="button"
                aria-label="Toggle notifications"
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              >
                <Bell size={19} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
              </button>

              {notificationsOpen && (
                <div className="absolute top-14 right-0 w-[300px] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl">
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

            {/* TOP-RIGHT PROFILE */}
            <div className="relative">
              <button
                type="button"
                aria-label="Toggle admin profile menu"
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1.5 pr-2.5 hover:bg-[var(--surface-soft)]"
              >
                {renderAvatar("h-8 w-8", "text-xs")}

                <span className="hidden max-w-28 truncate text-sm font-bold sm:block">
                  {adminName}
                </span>

                <ChevronDown
                  size={15}
                  className="hidden text-[var(--muted)] sm:block"
                />
              </button>

              {profileOpen && (
                <div className="absolute top-14 right-0 z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
                  <div className="flex items-center gap-3 border-b border-[var(--border)] px-3 py-3">
                    {renderAvatar()}

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{adminName}</p>
                      <p className="truncate text-xs text-[var(--muted)]">
                        {adminEmail || "Administrator"}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/admin/adminusers"
                    onClick={() => setProfileOpen(false)}
                    className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  >
                    <UserRound size={17} />
                    My Profile
                  </Link>

                  <Link
                    href="/admin/adminusers"
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                  >
                    <Settings size={17} />
                    Account Settings
                  </Link>

                  <div className="my-2 border-t border-[var(--border)]" />
                  <Link href={"/adminLogin"}>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-76px)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
