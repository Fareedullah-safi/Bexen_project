/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const DEFAULT_BG =
  "https://res.cloudinary.com/dbz6ftcwo/image/upload/v1793615843/bexon/albums/m3ewvp3uohj5yd98zkj8.webp";

const HOME_LABEL = {
  en: "Home",
  ps: "کور",
  fa: "خانه",
};

export default function BannerFrontendView({
  data = {},
  lang: langProp = "en",
  pageTitle = "",
}) {
  const [lang, setLang] = useState(langProp);

  useEffect(() => {
    setLang(langProp);
  }, [langProp]);

  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("site-language") || langProp || "en";
      setLang(stored);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("languageChange", sync);
    window.addEventListener("site-language-change", sync);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("languageChange", sync);
      window.removeEventListener("site-language-change", sync);
      window.removeEventListener("focus", sync);
    };
  }, [langProp]);

  // Supports all banner data shapes: { image: { url } }, { url }, or { en: { url } }
  const bgImage =
    data?.image?.url ||
    data?.url ||
    data?.[lang]?.url ||
    data?.en?.url ||
    data?.ps?.url ||
    data?.fa?.url ||
    DEFAULT_BG;

  const title = pageTitle || "Page";
  const home = HOME_LABEL[lang] || HOME_LABEL.en;
  const isRtl = lang === "ps" || lang === "fa";

  return (
    <section className="w-full px-4 py-4 sm:py-6">
      <div className="relative mx-auto flex h-[220px] w-full max-w-7xl items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-[330px] md:h-[400px] lg:h-[380px]">
        {/* Background Image */}
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        {/* Dark Overlay Gradient for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

        {/* Ambient Cyan Glow */}
        <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-[#1D8B8A]/30 blur-3xl sm:h-60 sm:w-60" />

        {/* Content Container */}
        <div
          className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-white sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3.5 py-1.5 backdrop-blur-md sm:px-5 sm:py-2">
            <Home size={15} className="text-[#1D8B8A]" />
            <Link
              href="/"
              className="text-xs font-medium text-gray-200 transition-colors hover:text-[#1D8B8A] sm:text-sm"
            >
              {home}
            </Link>
            {isRtl ? (
              <ChevronLeft size={14} className="text-gray-400" />
            ) : (
              <ChevronRight size={14} className="text-gray-400" />
            )}
            <span className="text-xs font-semibold text-[#1D8B8A] sm:text-sm">
              {title}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
