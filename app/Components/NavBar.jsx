"use client";

import { ArrowRight, Check, ChevronDown, Globe, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import Hamburger from "@/app/Components/Hamburger";

// ==========================================
// CONSTANTS
// ==========================================
const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "fa", label: "دری", short: "دری" },
  { code: "ps", label: "پښتو", short: "پښتو" },
];

const TEAL = "text-[#1E8A8A]";

export const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [query, setQuery] = useState("");
  const lastY = useRef(0);

  const [navData, setNavData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isRTL = lang.code === "fa" || lang.code === "ps";

  // ==========================================
  // DATA FETCHING
  // ==========================================
  useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await fetch("/api/navbar");
        const data = await response.json();
        setNavData(data);
      } catch (error) {
        console.error("Failed to load navigation data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNavigation();
  }, []);

  // ==========================================
  // LANGUAGE INIT
  // ==========================================
  useEffect(() => {
    const savedLanguage = localStorage.getItem("site-language");
    const selectedLanguage =
      LANGUAGES.find((item) => item.code === savedLanguage) || LANGUAGES[0];
    setLang(selectedLanguage);
    document.documentElement.lang = selectedLanguage.code;
    document.documentElement.dir =
      selectedLanguage.code === "en" ? "ltr" : "rtl";
  }, []);

  // ==========================================
  // SCROLL
  // ==========================================
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);
      if (y > lastY.current && y > 120) {
        setHidden(true);
      } else if (y < lastY.current) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================
  const pickLanguage = (e, l) => {
    setLang(l);
    localStorage.setItem("site-language", l.code);
    document.documentElement.lang = l.code;
    document.documentElement.dir = l.code === "en" ? "ltr" : "rtl";
    window.dispatchEvent(
      new CustomEvent("site-language-change", { detail: { language: l.code } }),
    );
    e.currentTarget.blur();
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
  };

  // ==========================================
  // HELPERS
  // ==========================================
  const logoUrl =
    navData?.logo ||
    "https://themejunction.net/html/bexon/demo/assets/images/logos/logo.webp";

  const searchTexts = navData?.search?.translations?.[lang.code] || {};
  const searchHeading = searchTexts.heading || "What are you looking for?";
  const searchSubheading =
    searchTexts.subheading || "Search services, projects and articles.";
  const searchPlaceholder = searchTexts.placeholder || "Search...";

  const ctaLabel =
    navData?.cta?.translations?.[lang.code]?.label || "Let's Talk";
  const ctaHref = navData?.cta?.href || "/contact";
  const menuItems = navData?.items || [];

  // Shared dropdown classes
  const dropdownPanel =
    "invisible absolute top-full z-50 translate-y-1 pt-3 opacity-0 transition-all duration-200 ease-out group-hover:visible group-hover:translate-y-0 group-hover:opacity-100";

  const dropdownCard =
    "rounded-2xl bg-white p-2 shadow-2xl ring-1 ring-black/5 border border-gray-100/80";

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      className={`z-50 w-full transition-all duration-300 ${
        scrolled ? "fixed inset-x-0 top-0" : "relative"
      } ${scrolled && hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div
        className={`mx-2 flex h-20 items-center justify-between gap-3 rounded-b-2xl bg-white px-3 sm:mx-4 sm:px-5 lg:h-24 ${
          scrolled ? "shadow-lg shadow-black/5" : ""
        }`}
      >
        {/* LOGO */}
        <Link href="/" aria-label="Bexon Home" className="shrink-0">
          <Image
            src={logoUrl}
            alt="Bexon Logo"
            width={200}
            height={100}
            priority
            className="h-auto w-24 sm:w-28"
          />
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden items-center gap-5 lg:flex xl:gap-8">
          {!isLoading &&
            menuItems.map((item) => {
              const label =
                item.translations?.[lang.code]?.label ||
                item.translations?.en?.label ||
                "";
              const hasSubLinks = item.hasDropdown && item.children?.length > 0;
              const isActive = pathname === item.href;

              return (
                <li key={item.id} className="group relative">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 text-[15px] font-medium whitespace-nowrap transition-colors group-hover:text-[#1E8A8A] ${
                      isActive ? TEAL : "text-[#0C1E21]"
                    }`}
                  >
                    {label}
                    {hasSubLinks && (
                      <ChevronDown
                        size={16}
                        className="transition-transform duration-200 group-hover:rotate-180"
                      />
                    )}
                  </Link>

                  {/* Sub-links Dropdown (hover) */}
                  {hasSubLinks && (
                    <div
                      className={`${dropdownPanel} ${
                        isRTL
                          ? "right-0 left-auto text-right"
                          : "right-auto left-0 text-left"
                      } w-60`}
                    >
                      <div className={dropdownCard}>
                        <div
                          className={`absolute -top-1.5 h-3 w-3 rotate-45 border-t border-l border-gray-100 bg-white ${
                            isRTL ? "right-6" : "left-6"
                          }`}
                        />
                        {item.children.map((subItem) => {
                          const subLabel =
                            subItem.translations?.[lang.code]?.label ||
                            subItem.translations?.en?.label ||
                            "";
                          const isSubActive = pathname === subItem.href;
                          return (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              className={`group/sub relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                                isSubActive
                                  ? `bg-[#1E8A8A]/10 ${TEAL}`
                                  : "text-[#596366] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A]"
                              } ${isRTL ? "text-right" : "text-left"}`}
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={`h-1 w-1 rounded-full bg-[#1E8A8A] transition-all duration-200 ${
                                    isSubActive
                                      ? "opacity-100"
                                      : "opacity-0 group-hover/sub:opacity-100"
                                  }`}
                                />
                                {subLabel}
                              </span>
                              <ArrowRight
                                size={14}
                                className={`opacity-0 transition-all duration-200 group-hover/sub:opacity-100 ${
                                  isRTL
                                    ? "rotate-180 group-hover/sub:-translate-x-0.5"
                                    : "group-hover/sub:translate-x-0.5"
                                }`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
        </ul>

        {/* RIGHT CONTROLS */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* LANGUAGE PICKER (hover) */}
          <div className="group relative">
            <button
              type="button"
              aria-label={`Language: ${lang.label}`}
              aria-haspopup="true"
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 text-xs font-semibold text-[#0C1E21] transition-colors hover:bg-[#1E8A8A]/10 hover:text-[#1E8A8A] sm:text-sm"
            >
              <Globe size={15} className={TEAL} />
              {lang.short}
              <ChevronDown
                size={14}
                className="transition-transform duration-200 group-hover:rotate-180"
              />
            </button>

            <div
              className={`${dropdownPanel} ${
                isRTL ? "right-auto left-0" : "right-0 left-auto"
              } w-44`}
            >
              <div className={dropdownCard}>
                <div
                  className={`absolute -top-1.5 h-3 w-3 rotate-45 border-t border-l border-gray-100 bg-white ${
                    isRTL ? "left-6" : "right-6"
                  }`}
                />
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={(e) => pickLanguage(e, l)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      l.code === lang.code
                        ? `bg-[#1E8A8A]/10 ${TEAL}`
                        : "text-[#596366] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A]"
                    }`}
                  >
                    <span>{l.label}</span>
                    {l.code === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SEARCH BOX (hover) */}
          <div className="group relative hidden lg:block">
            <button
              type="button"
              aria-label="Open search"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-[#0C1E21] transition-colors hover:bg-[#1E8A8A] hover:text-white"
            >
              <Search size={18} />
            </button>

            <div
              className={`${dropdownPanel} ${
                isRTL ? "right-auto left-0" : "right-0 left-auto"
              } w-80 xl:w-96`}
            >
              <div className={`${dropdownCard} p-5`}>
                <div
                  className={`absolute -top-1.5 h-3 w-3 rotate-45 border-t border-l border-gray-100 bg-white ${
                    isRTL ? "left-6" : "right-6"
                  }`}
                />
                <h3
                  className={`font-bold text-[#0C1E21] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {searchHeading}
                </h3>
                <p
                  className={`mt-1 text-sm text-[#596366] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {searchSubheading}
                </p>
                <form onSubmit={submitSearch} className="mt-4 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    aria-label="Search"
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`h-11 w-full rounded-full border border-gray-200 px-5 text-sm transition-colors outline-none focus:border-[#1E8A8A] ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />
                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1E8A8A] text-white transition-all duration-200 hover:bg-[#167272] hover:shadow-lg hover:shadow-[#1E8A8A]/30"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* CTA BUTTON */}
          {!isLoading && (
            <Link
              href={ctaHref}
              className={`group/btn hidden h-12 items-center gap-3 rounded-full bg-[#1E8A8A] py-1 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1E8A8A]/20 lg:flex ${
                isRTL ? "pr-1 pl-5" : "pr-1 pl-5"
              }`}
            >
              {ctaLabel}
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C1E21]">
                <ArrowRight
                  size={18}
                  className={`transition-transform duration-300 group-hover/btn:rotate-0 ${
                    isRTL ? "rotate-45" : "-rotate-45"
                  }`}
                />
              </span>
            </Link>
          )}

          {/* MOBILE MENU TOGGLE */}
          <Hamburger />
        </div>
      </div>
    </nav>
  );
};
