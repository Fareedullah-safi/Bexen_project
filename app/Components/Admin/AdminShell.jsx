"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Info,
  Languages,
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
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

const languages = [
  { value: "en", label: "English", native: "English", direction: "ltr" },
  { value: "ps", label: "Pashto", native: "پښتو", direction: "rtl" },
  { value: "fa", label: "Dari", native: "دری", direction: "rtl" },
];

/* ============ COMPONENT ============ */

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openName, setOpenName] = useState(null);

  const [language, setLanguage] = useState(null);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);

  const languageRef = useRef(null);
  const languageRequestRef = useRef(0);

  const [adminUid, setAdminUid] = useState("");
  const [adminName, setAdminName] = useState("Administrator");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminImage, setAdminImage] = useState("");
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

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
      } finally {
        setIsSessionLoading(false);
      }
    };

    loadSession();
  }, []);

  /* ============ LOAD SAVED LANGUAGE ============ */

  useEffect(() => {
    let cancelled = false;

    const loadLanguage = async () => {
      try {
        const res = await axios.get("/api/admin/adminusers/language", {
          withCredentials: true,
        });

        if (cancelled) return;

        if (!res.data.success) {
          throw new Error(res.data.message || "Unable to load saved language.");
        }

        const savedLanguage = res.data.language;

        if (!languages.some((item) => item.value === savedLanguage)) {
          throw new Error(
            `Invalid language returned by API: ${String(savedLanguage)}`,
          );
        }

        setLanguage(savedLanguage);
        localStorage.setItem("admin-language", savedLanguage);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Unable to load language from database:",
          error.response?.data || error.message,
        );

        // Use the previously saved browser preference only if the API fails.
        const localLanguage = localStorage.getItem("admin-language");

        if (languages.some((item) => item.value === localLanguage)) {
          setLanguage(localLanguage);
        } else {
          setLanguage("en");
        }
      }
    };

    loadLanguage();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ============ SAVE LANGUAGE ============ */

  const handleLanguageChange = async (selectedLanguage) => {
    if (
      isLanguageSaving ||
      !languages.some((item) => item.value === selectedLanguage) ||
      selectedLanguage === language
    ) {
      setLanguageOpen(false);
      return;
    }

    const previousLanguage = language;
    const requestId = ++languageRequestRef.current;

    setLanguage(selectedLanguage);
    setLanguageOpen(false);
    setIsLanguageSaving(true);

    try {
      const res = await axios.post(
        "/api/admin/adminusers/language",
        { language: selectedLanguage },
        { withCredentials: true },
      );

      if (requestId !== languageRequestRef.current) return;

      if (!res.data.success) {
        throw new Error(res.data.message || "Unable to save language.");
      }

      const savedLanguage = res.data.language;

      if (!languages.some((item) => item.value === savedLanguage)) {
        throw new Error("The server returned an invalid language.");
      }

      setLanguage(savedLanguage);
      localStorage.setItem("admin-language", savedLanguage);
    } catch (error) {
      if (requestId !== languageRequestRef.current) return;

      setLanguage(previousLanguage);

      console.error(
        "Unable to save language:",
        error.response?.data?.message || error.message,
      );
    } finally {
      if (requestId === languageRequestRef.current) {
        setIsLanguageSaving(false);
      }
    }
  };

  /* ============ CLOSE LANGUAGE DROPDOWN ============ */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!languageRef.current?.contains(event.target)) {
        setLanguageOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setLanguageOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ============ SIGN OUT ============ */

  const handleSignOut = async () => {
    try {
      await axios.post(
        "/api/admin/adminusers/logout",
        {},
        { withCredentials: true },
      );

      window.location.replace("/adminLogin");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  /* ============ LOAD SAVED PROFILE ============ */

  useEffect(() => {
    if (!adminUid) return;

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
        if (!cancelled) setIsProfileLoading(false);
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

  const selectedLanguage = languages.find((item) => item.value === language);

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
          onError={(event) => {
            event.currentTarget.style.display = "none";
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

  if (isSessionLoading || (adminUid && isProfileLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

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
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[var(--border)] bg-[var(--surface)]/90 px-3 backdrop-blur-xl sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setMobileOpen(true)}
              className="shrink-0 rounded-xl border border-[var(--border)] p-2.5 text-[var(--foreground)] hover:bg-[var(--surface-soft)] lg:hidden"
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

            <p className="truncate text-sm font-bold text-[var(--foreground)] md:hidden">
              Universal Admin
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* VIEW SITE */}
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:flex"
            >
              <ExternalLink size={17} />
              View Site
            </Link>

            {/* ANIMATED LANGUAGE SELECTOR */}
            <div ref={languageRef} className="relative shrink-0">
              <button
                type="button"
                aria-label="Select dashboard language"
                aria-haspopup="listbox"
                aria-expanded={languageOpen}
                disabled={isLanguageSaving || language === null}
                onClick={() => setLanguageOpen((open) => !open)}
                className="group relative flex h-10 min-w-[132px] items-center gap-2 overflow-hidden rounded-xl border border-white/15 bg-gradient-to-r from-[#1E8A8A] to-[#187777] px-3 text-white shadow-md shadow-teal-900/10 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-900/20 focus-visible:ring-2 focus-visible:ring-[#35B5B5]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] focus-visible:outline-none active:translate-y-0 disabled:cursor-wait disabled:opacity-70"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <Languages size={17} className="relative shrink-0" />

                <span className="relative flex-1 text-left text-sm font-semibold">
                  {selectedLanguage?.native || "Loading..."}
                </span>

                {isLanguageSaving ? (
                  <span className="relative h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <ChevronDown
                    size={15}
                    className={`relative shrink-0 transition-transform duration-300 ${
                      languageOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>

              <div
                className={`absolute top-[calc(100%+10px)] right-0 z-[60] w-[190px] origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-xl shadow-black/10 transition-all duration-200 ease-out ${
                  languageOpen
                    ? "visible translate-y-0 scale-100 opacity-100"
                    : "invisible -translate-y-2 scale-95 opacity-0"
                }`}
                role="listbox"
                aria-label="Available languages"
                aria-hidden={!languageOpen}
              >
                <div className="px-3 pt-2 pb-2">
                  <p className="text-[10px] font-bold tracking-[0.16em] text-[var(--muted)] uppercase">
                    Choose language
                  </p>
                </div>

                {languages.map((item) => {
                  const active = language === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      tabIndex={languageOpen ? 0 : -1}
                      disabled={isLanguageSaving}
                      onClick={() => handleLanguageChange(item.value)}
                      className={`group/option relative mb-1 flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-left transition-all duration-200 ease-out last:mb-0 hover:translate-x-0.5 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none ${
                        active
                          ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                          : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"
                      } disabled:cursor-wait disabled:opacity-60`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 group-hover/option:scale-105 ${
                          active
                            ? "bg-[var(--accent)] text-white shadow-sm"
                            : "bg-[var(--surface-soft)] text-[var(--muted)] group-hover/option:bg-[var(--accent-soft)] group-hover/option:text-[var(--accent)]"
                        }`}
                      >
                        {item.value.toUpperCase()}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">
                          {item.native}
                        </span>
                        <span
                          className={`mt-0.5 block text-[11px] ${
                            active
                              ? "text-[var(--accent)]/80"
                              : "text-[var(--muted)]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>

                      <Check
                        size={16}
                        className={`shrink-0 transition-all duration-200 ${
                          active
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0"
                        }`}
                      />

                      <span
                        className={`absolute top-2 bottom-2 left-0 w-[3px] rounded-r-full bg-[var(--accent)] transition-opacity duration-200 ${
                          active
                            ? "opacity-100"
                            : "opacity-0 group-hover/option:opacity-50"
                        }`}
                      />
                    </button>
                  );
                })}

                <div className="mt-1 border-t border-[var(--border)] px-3 py-2">
                  <p className="text-[10px] text-[var(--muted)]">
                    Language preference is saved to your account.
                  </p>
                </div>
              </div>
            </div>

            {/* THEME TOGGLE */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="shrink-0 rounded-xl border border-[var(--border)] p-2.5 text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              title="Toggle theme"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* TOP-RIGHT PROFILE */}
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="Toggle admin profile menu"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-1.5 pr-2.5 transition-colors hover:bg-[var(--surface-soft)]"
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

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <LogOut size={17} />
                    Sign Out
                  </button>
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
