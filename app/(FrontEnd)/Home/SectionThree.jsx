"use client";

import Loader from "@/app/Components/Loader";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function BrandLogos() {
  const [dbLogos, setDbLogos] = useState([]);
  const [dbTitle, setDbTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("en");
  const trackRef = useRef(null);
  const [groupWidth, setGroupWidth] = useState(0);

  useEffect(() => {
    let active = true;

    const dataLogos = async (language) => {
      try {
        setLang(language);

        const [logosRes, titleRes] = await Promise.all([
          fetch(
            `/api/homepage/brand-logos?lang=${encodeURIComponent(language)}`,
            { cache: "no-store" },
          ),
          fetch(
            `/api/homepage/brand-logos/title?lang=${encodeURIComponent(language)}`,
            {
              cache: "no-store",
            },
          ),
        ]);

        const logosData = await logosRes.json();
        const titleData = await titleRes.json().catch(() => null);

        if (!active) return;

        if (logosRes.ok && logosData.success) {
          setDbLogos(
            (Array.isArray(logosData.data) ? logosData.data : []).flatMap(
              (item) =>
                (item.logos || [])
                  .map((logo) => (typeof logo === "string" ? logo : logo.url))
                  .filter((url) => typeof url === "string" && url.trim()),
            ),
          );
        } else {
          setDbLogos([]);
        }

        if (titleData) {
          const title =
            titleData?.data?.translations?.[language]?.title ||
            titleData?.data?.title ||
            titleData?.title ||
            "";
          setDbTitle(typeof title === "string" ? title : "");
        }
      } catch (error) {
        console.error("Failed to load brand section data:", error);

        if (active) {
          setDbLogos([]);
          setDbTitle("");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    const savedLanguage = localStorage.getItem("site-language") || "en";

    dataLogos(savedLanguage);

    const handleLanguageChange = (event) => {
      const language =
        event.detail?.language || localStorage.getItem("site-language") || "en";

      dataLogos(language);
    };

    window.addEventListener("site-language-change", handleLanguageChange);

    return () => {
      active = false;

      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    if (dbLogos.length > 0 && trackRef.current) {
      const firstGroup = trackRef.current.firstElementChild;

      if (firstGroup) {
        setGroupWidth(firstGroup.offsetWidth);
      }
    }
  }, [dbLogos]);

  if (loading) {
    return (
      <section className="relative h-100 w-[96vw] overflow-hidden bg-[#eef2f2] py-20">
        <Loader />
      </section>
    );
  }

  if (dbLogos.length === 0) return null;

  const isRTL = lang === "ps" || lang === "fa";

  const LogoCard = ({ logo, index }) => (
    <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-xl bg-white px-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-30 sm:w-40 sm:px-5 md:h-35 md:w-44 md:px-5 lg:h-40 lg:w-48 lg:px-6">
      <div className="relative h-full max-h-12 w-full sm:max-h-14 md:max-h-16 lg:max-h-20">
        <Image
          src={logo}
          alt={`Company logo ${index + 1}`}
          fill
          sizes="(max-width: 640px) 96px, (max-width: 768px) 120px, (max-width: 1024px) 140px, 160px"
          className="object-contain opacity-60 transition-all duration-300 hover:opacity-100"
        />
      </div>
    </div>
  );

  const logoSet = dbLogos.map((logo, i) => (
    <LogoCard key={i} logo={logo} index={i} />
  ));

  const duration = Math.max(groupWidth / 60, 10);

  // --- FIXED MULTI-LANGUAGE LINE BREAK FORMATTER ---
  const renderFormattedTitle = (text) => {
    if (!text) {
      return (
        <>
          <span className="block">
            Join Over{" "}
            <span className="rounded-full bg-[#1E8A8A] px-2 py-0.5 text-white">
              1000+
            </span>
          </span>
          <span className="block">Companies with</span>
          <span className="block">
            <span className="text-gray-500 underline">Bexon</span> Here
          </span>
        </>
      );
    }

    // 1. Converts literal '\n' string from DB to actual line breaks
    const normalizedText = text.replace(/\\n/g, "\n");

    // 2. Split by newlines so every line becomes its own block element
    const lines = normalizedText.split("\n");

    return lines.map((line, lineIdx) => (
      <span key={lineIdx} className="block">
        {line.split(/(\+?\d+\+?|Bexon|بکسون)/g).map((part, i) => {
          // Numbers like 1000+ or +1000 -> Teal Pill
          if (/^\+?\d+\+?$/.test(part)) {
            return (
              <span
                key={i}
                className="mx-1 inline-block rounded-full bg-[#1E8A8A] px-2 py-0.5 text-white"
              >
                {part}
              </span>
            );
          }
          // Brand name -> Underlined
          if (part === "Bexon" || part === "بکسون") {
            return (
              <span key={i} className="text-gray-500 underline">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    ));
  };

  return (
    <section
      className="relative h-100 w-[96vw] max-w-full overflow-hidden bg-[#eef2f2] py-20"
      style={{ direction: "ltr" }}
    >
      <div className="relative z-0 mx-auto flex max-w-7xl flex-col items-center px-4">
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 z-9 mt-6 flex h-50 w-50 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white/20 leading-loose backdrop-blur-md lg:h-80 lg:w-80"
          dir={isRTL ? "rtl" : "ltr"}
        >
          <h2 className="max-w-80 text-center text-lg leading-7 font-semibold text-[#102124] lg:text-xl">
            {renderFormattedTitle(dbTitle)}
          </h2>
        </div>

        <div
          className="mt-14 w-full overflow-hidden"
          dir="ltr"
          style={{ direction: "ltr" }}
        >
          <div
            ref={trackRef}
            className="logo-track flex w-max hover:[animation-play-state:paused]"
            style={
              groupWidth
                ? {
                    animationDuration: `${duration}s`,
                    "--scroll-distance": `-${groupWidth}px`,
                  }
                : undefined
            }
          >
            <div className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4 md:gap-5 md:pr-5 lg:gap-6 lg:pr-6">
              {logoSet}
            </div>

            <div
              className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4 md:gap-5 md:pr-5 lg:gap-6 lg:pr-6"
              aria-hidden="true"
            >
              {logoSet}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .logo-track {
          animation: logoScroll 20s linear infinite;
        }

        @keyframes logoScroll {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(var(--scroll-distance, -50%), 0, 0);
          }
        }
      `}</style>
    </section>
  );
}
