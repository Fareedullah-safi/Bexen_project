"use client";

import { ArrowRight, Check, ChevronDown, Globe, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import BlogDropDown from "@/app/Components/BlogDropDown";
import Hamburger from "@/app/Components/Hamburger";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "fa", label: "دری", short: "دری" },
  { code: "ps", label: "پښتو", short: "پښتو" },
];

const NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Service Details", href: "/service-details" },
  {
    label: "Portfolio",
    href: "/portfolio",
    children: [
      { label: "Portfolio", href: "/portfolio" },
      { label: "Portfolio Details", href: "/portfolio-details" },
    ],
  },
  { label: "Blog", href: "/blog", blog: true },
  { label: "Contact", href: "/contact" },
];

const DROP =
  "invisible absolute top-full z-50 translate-y-2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100";

const CARD = "rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5";
const TEAL = "text-[#1E8A8A]";

export const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [query, setQuery] = useState("");

  const lastY = useRef(0);

  const isRTL = lang.code === "fa" || lang.code === "ps";

  useEffect(() => {
    const savedLanguage = localStorage.getItem("site-language");
    const selectedLanguage =
      LANGUAGES.find((item) => item.code === savedLanguage) || LANGUAGES[0];

    setLang(selectedLanguage);

    document.documentElement.lang = selectedLanguage.code;
    document.documentElement.dir =
      selectedLanguage.code === "en" ? "ltr" : "rtl";
  }, []);

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

  const pickLanguage = (e, l) => {
    setLang(l);

    localStorage.setItem("site-language", l.code);

    document.documentElement.lang = l.code;
    document.documentElement.dir = l.code === "en" ? "ltr" : "rtl";

    window.dispatchEvent(
      new CustomEvent("site-language-change", {
        detail: { language: l.code },
      }),
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
        {/* Logo */}
        <Link href="/" aria-label="Bexon Home" className="shrink-0">
          <Image
            src="https://themejunction.net/html/bexon/demo/assets/images/logos/logo.webp"
            alt="Bexon Logo"
            width={200}
            height={100}
            priority
            className="h-auto w-24 sm:w-28"
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-5 lg:flex xl:gap-8">
          {NAV.map(({ label, href, children, blog }) => (
            <li key={label} className="group relative">
              <Link
                href={href}
                className={`flex items-center gap-1.5 text-[15px] font-medium whitespace-nowrap transition-colors group-hover:text-[#1E8A8A] ${
                  pathname === href ? TEAL : "text-[#0C1E21]"
                }`}
              >
                {label}

                {(children || blog) && (
                  <ChevronDown
                    size={16}
                    className="transition-transform group-hover:rotate-180"
                  />
                )}
              </Link>

              {/* Portfolio dropdown */}
              {children && (
                <div
                  className={`${DROP} ${
                    isRTL
                      ? "right-0 left-auto text-right"
                      : "right-auto left-0 text-left"
                  } w-52`}
                >
                  <div className={CARD}>
                    {children.map((c) => (
                      <Link
                        key={c.label}
                        href={c.href}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium text-[#596366] transition-colors hover:bg-gray-50 hover:text-[#1E8A8A] ${
                          isRTL ? "text-right" : "text-left"
                        }`}
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {blog && <BlogDropDown />}
            </li>
          ))}
        </ul>

        {/* Right controls */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Language */}
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
                className="transition-transform group-hover:rotate-180"
              />
            </button>

            <div
              className={`${DROP} ${
                isRTL ? "right-auto left-0" : "right-0 left-auto"
              } w-40`}
            >
              <div className={CARD}>
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={(e) => pickLanguage(e, l)}
                    className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                      l.code === lang.code
                        ? `bg-[#1E8A8A]/10 ${TEAL}`
                        : "text-[#596366]"
                    }`}
                  >
                    <span>{l.label}</span>
                    {l.code === lang.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="group relative hidden lg:block">
            <button
              type="button"
              aria-label="Open search"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-[#0C1E21] transition-colors hover:bg-[#1E8A8A] hover:text-white"
            >
              <Search size={18} />
            </button>

            <div
              className={`${DROP} ${
                isRTL ? "right-auto left-0" : "right-0 left-auto"
              } w-80 xl:w-96`}
            >
              <div className={`${CARD} p-5`}>
                <h3
                  className={`font-semibold text-[#0C1E21] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  What are you looking for?
                </h3>

                <p
                  className={`mt-1 text-sm text-[#596366] ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  Search services, projects and articles.
                </p>

                <form onSubmit={submitSearch} className="mt-4 flex gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    aria-label="Search"
                    dir={isRTL ? "rtl" : "ltr"}
                    className={`h-11 w-full rounded-full border border-gray-200 px-5 text-sm transition-colors outline-none focus:border-[#1E8A8A] ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  />

                  <button
                    type="submit"
                    aria-label="Submit search"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#1E8A8A] text-white transition-colors hover:bg-[#167272]"
                  >
                    <Search size={18} />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Let's Talk */}
          <Link
            href="/contact"
            className={`group/btn hidden h-12 items-center gap-3 rounded-full bg-[#1E8A8A] py-1 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#167575] hover:shadow-xl hover:shadow-[#1E8A8A]/20 lg:flex ${
              isRTL ? "pr-1 pl-5" : "pr-1 pl-5"
            }`}
          >
            Let's Talk
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0C1E21]">
              <ArrowRight
                size={18}
                className={`transition-transform duration-300 group-hover/btn:rotate-0 ${
                  isRTL ? "rotate-45" : "-rotate-45"
                }`}
              />
            </span>
          </Link>

          <Hamburger />
        </div>
      </div>
    </nav>
  );
};
