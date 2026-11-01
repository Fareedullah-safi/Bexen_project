"use client";

import { ArrowLeft, Home, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const TRANSLATIONS = {
  en: {
    code: "404",
    badge: "Page Not Found",
    title: "Lost in the digital void?",
    description:
      "The page you're looking for doesn't exist, was moved, or the URL was typed incorrectly. Let's get you back on track.",
    homeBtn: "Back to Home",
    backBtn: "Go Back",
    helpText: "Need help? Visit our",
    contactLink: "Contact page",
  },
  ps: {
    code: "404",
    badge: "پاڼه ونه موندل شوه",
    title: "په ډیجیټل تشه کې ورک شوي یاست؟",
    description:
      "هغه پاڼه چې تاسو یې لټوئ شتون نلري، لیږدول شوې، یا پته ناسمه لیکل شوې ده. راځئ تاسو بیرته سمې لارې ته راولو.",
    homeBtn: "بیرته کور ته",
    backBtn: "شاته لاړ شه",
    helpText: "مرستې ته اړتیا لرئ؟ زموږ",
    contactLink: "د اړیکې پاڼه وګورئ",
  },
  fa: {
    code: "404",
    badge: "صفحه یافت نشد",
    title: "در فضای دیجیتال گم شده‌اید؟",
    description:
      "صفحه‌ای که به دنبال آن هستید وجود ندارد، منتقل شده یا آدرس به اشتباه وارد شده است. بیایید شما را به مسیر درست بازگردانیم.",
    homeBtn: "بازگشت به خانه",
    backBtn: "بازگشت",
    helpText: "نیاز به کمک دارید؟ از",
    contactLink: "صفحه تماس دیدن کنید",
  },
};

export default function NotFound() {
  const [lang, setLang] = useState("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const syncLanguage = () => {
      const stored = localStorage.getItem("site-language") || "en";
      setLang(stored);
    };

    syncLanguage();

    window.addEventListener("storage", syncLanguage);
    window.addEventListener("languageChange", syncLanguage);
    window.addEventListener("site-language-change", syncLanguage);
    window.addEventListener("focus", syncLanguage);

    return () => {
      window.removeEventListener("storage", syncLanguage);
      window.removeEventListener("languageChange", syncLanguage);
      window.removeEventListener("site-language-change", syncLanguage);
      window.removeEventListener("focus", syncLanguage);
    };
  }, []);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isRtl = lang === "ps" || lang === "fa";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="fixed inset-0 z-[99999] flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#070F10] px-4"
    >
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1D8B8A08_1px,transparent_1px),linear-gradient(to_bottom,#1D8B8A08_1px,transparent_1px)] bg-size-[48px_48px]" />

      {/* Soft glow orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1D8B8A]/20 blur-[100px]" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-80 w-80 translate-x-1/3 translate-y-1/3 rounded-full bg-[#1D8B8A]/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[60px]" />

      {/* Content */}
      <div
        className={`relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center text-center transition-all duration-700 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
        }`}
      >
        {/* Floating badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1D8B8A]/30 bg-[#1D8B8A]/10 px-4 py-1.5 backdrop-blur-md">
          <Sparkles size={14} className="text-[#1D8B8A]" />
          <span className="text-xs font-bold tracking-[0.2em] text-[#1D8B8A] uppercase">
            {t.badge}
          </span>
        </div>

        {/* Giant 404 with gradient + stroke effect */}
        <div className="relative mb-2 select-none">
          <h1 className="bg-linear-to-b from-[#1D8B8A] via-[#2BB5B3] to-[#0C1E21] bg-clip-text text-[7.5rem] leading-none font-black tracking-tighter text-transparent sm:text-[10rem] md:text-[12rem]">
            {t.code}
          </h1>
          {/* Soft reflection under number */}
          <div className="pointer-events-none absolute inset-x-0 -bottom-4 h-16 bg-linear-to-b from-[#1D8B8A]/20 to-transparent blur-xl" />
        </div>

        {/* Title */}
        <h2 className="mt-2 max-w-lg text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {t.title}
        </h2>

        {/* Description */}
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
          {t.description}
        </p>

        {/* Action buttons */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/"
            className="group inline-flex h-12 min-w-[170px] items-center justify-center gap-2 rounded-full bg-[#1D8B8A] px-6 text-sm font-semibold text-white shadow-[0_10px_40px_rgba(29,139,138,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#167575] hover:shadow-[0_16px_50px_rgba(29,139,138,0.45)]"
          >
            <Home
              size={16}
              className="transition-transform duration-300 group-hover:scale-110"
            />
            {t.homeBtn}
          </Link>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            className="group inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-white/90 backdrop-blur-md transition-all duration-300 hover:border-[#1D8B8A]/50 hover:bg-[#1D8B8A]/10 hover:text-white"
          >
            <ArrowLeft
              size={16}
              className={`transition-transform duration-300 ${
                isRtl
                  ? "rotate-180 group-hover:translate-x-0.5"
                  : "group-hover:-translate-x-0.5"
              }`}
            />
            {t.backBtn}
          </button>
        </div>

        {/* Bottom help line */}
        <div className="mt-12 flex items-center gap-2 text-xs text-white/35 sm:text-sm">
          <Search size={14} className="opacity-60" />
          <span>
            {t.helpText}{" "}
            <Link
              href="/contact"
              className="font-medium text-[#1D8B8A] underline-offset-4 transition-colors hover:text-[#2BB5B3] hover:underline"
            >
              {t.contactLink}
            </Link>
          </span>
        </div>

        {/* Decorative bottom line */}
        <div className="mt-10 h-px w-24 bg-linear-to-r from-transparent via-[#1D8B8A]/50 to-transparent" />
      </div>

      {/* Corner accents */}
      <div className="pointer-events-none absolute top-6 left-6 h-16 w-16 rounded-tl-2xl border-t border-l border-[#1D8B8A]/20" />
      <div className="pointer-events-none absolute top-6 right-6 h-16 w-16 rounded-tr-2xl border-t border-r border-[#1D8B8A]/20" />
      <div className="pointer-events-none absolute bottom-6 left-6 h-16 w-16 rounded-bl-2xl border-b border-l border-[#1D8B8A]/20" />
      <div className="pointer-events-none absolute right-6 bottom-6 h-16 w-16 rounded-br-2xl border-r border-b border-[#1D8B8A]/20" />
    </div>
  );
}
