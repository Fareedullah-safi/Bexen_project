"use client";

import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import Image from "next/image";
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
  data,
  lang: langProp = "en",
  pageTitle = "",
}) {
  const [lang, setLang] = useState(langProp);

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

  const bgImage =
    data?.[lang]?.url ||
    data?.en?.url ||
    data?.ps?.url ||
    data?.fa?.url ||
    DEFAULT_BG;

  const title = pageTitle || "Page";
  const home = HOME_LABEL[lang] || HOME_LABEL.en;
  const isRtl = lang === "ps" || lang === "fa";

  return (
    <section className="w-full px-4">
      <div className="xs:h-[260px] max-w-8xl relative mx-auto flex h-55 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl sm:h-82.5 md:h-100 lg:h-95">
        <Image
          src={bgImage}
          fill
          alt={title}
          className="object-cover object-center"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
          unoptimized
        />

        <Image
          src="https://res.cloudinary.com/dbz6ftcwo/image/upload/v1793615843/bexon/albums/m3ewvp3uohj5yd98zkj8.webp"
          fill
          alt="Header Overlay Shape"
          className="pointer-events-none object-cover object-center opacity-80"
          priority
          sizes="(max-width: 1280px) 100vw, 1280px"
        />

        <div className="pointer-events-none absolute h-40 w-40 rounded-full bg-[#1D8B8A]/30 blur-3xl sm:h-60 sm:w-60" />

        <div
          className="relative z-10 flex flex-col items-center justify-center px-4 text-center"
          dir={isRtl ? "rtl" : "ltr"}
        >
          <h1 className="xs:text-3xl mb-3 text-2xl font-bold tracking-tight text-white sm:mb-4 sm:text-4xl md:text-5xl lg:text-6xl">
            {title}
          </h1>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3.5 py-1.5 backdrop-blur-md sm:px-5 sm:py-2">
            <Home size={15} className="text-[#1D8B8A] sm:size-4.25" />
            <Link
              href="/"
              className="text-xs font-medium text-gray-200 transition-colors hover:text-[#1D8B8A] sm:text-sm"
            >
              {home}
            </Link>
            {isRtl ? (
              <ChevronLeft size={14} className="text-gray-400 sm:size-4" />
            ) : (
              <ChevronRight size={14} className="text-gray-400 sm:size-4" />
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
