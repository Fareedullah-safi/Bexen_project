"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/* Helper to strip HTML tags for empty checks */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

const BRAND_LOGOS_STYLES = `
  .brand-title p { margin: 0; display: inline; }
  .brand-title strong, .brand-title b { font-weight: 700; }
  .brand-title em, .brand-title i { font-style: italic; }
  .brand-title mark.ql-hl {
    border-radius: 9999px;
    padding: 2px 8px;
    color: #ffffff !important;
  }
  .brand-title a { color: #1E8A8A; text-decoration: underline; }
`;

export default function BrandLogosView({ data, lang = "en" }) {
  if (!data) return null;

  const t = data.translations?.[lang] || data.translations?.en || {};
  const logos = (data.logos || [])
    .map((logo) => (typeof logo === "string" ? logo : logo?.url))
    .filter((url) => typeof url === "string" && url.trim());

  const title = t.title || "";
  const titleText = stripHtml(title);
  const isRTL = lang === "ps" || lang === "fa";

  if (logos.length === 0) return null;

  return (
    <section
      className="relative h-100 w-[96vw] max-w-full overflow-hidden bg-[#eef2f2] py-20"
      style={{ direction: "ltr" }}
    >
      <div className="relative z-0 mx-auto flex max-w-7xl flex-col items-center px-4">
        {/* Center circle title */}
        <div
          className="wow animate__animated animate__fadeIn pointer-events-none absolute top-1/2 left-1/2 z-9 mt-6 flex h-50 w-50 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-dashed border-gray-300 bg-white/20 px-4 text-center leading-loose backdrop-blur-md lg:h-80 lg:w-80"
          dir={isRTL ? "rtl" : "ltr"}
          data-wow-duration="1s"
        >
          <div className="brand-title max-w-80 text-center text-lg leading-7 font-semibold text-[#102124] lg:text-xl">
            {titleText ? (
              <div dangerouslySetInnerHTML={{ __html: title }} />
            ) : (
              <FormattedTitle text="" />
            )}
          </div>
        </div>

        {/* Infinite scroll track */}
        <div
          className="wow animate__animated animate__fadeInUp mt-14 w-full overflow-hidden"
          data-wow-duration="1s"
          data-wow-delay="0.3s"
          style={{ direction: "ltr" }}
        >
          <MarqueeTrack logos={logos} />
        </div>
      </div>

      {/* Global CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: BRAND_LOGOS_STYLES }} />
    </section>
  );
}

/* ==================== FALLBACK FORMATTED TITLE ==================== */

function FormattedTitle({ text }) {
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

  const normalizedText = text.replace(/\\n/g, "\n");
  const lines = normalizedText.split("\n");

  return lines.map((line, lineIdx) => (
    <span key={lineIdx} className="block">
      {line.split(/(\+?\d+\+?|Bexon|بکسون)/g).map((part, i) => {
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
}

/* ==================== MARQUEE TRACK ==================== */

function MarqueeTrack({ logos }) {
  const trackRef = useRef(null);
  const [groupWidth, setGroupWidth] = useState(0);

  useEffect(() => {
    if (logos.length > 0 && trackRef.current) {
      const firstGroup = trackRef.current.firstElementChild;
      if (firstGroup) {
        setGroupWidth(firstGroup.offsetWidth);
      }
    }
  }, [logos]);

  // Re-sync WOW.js after dynamic block mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).sync();
        } catch {
          // WOW.js not available
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const duration = Math.max(groupWidth / 60, 10);

  const logoSet = logos.map((logo, i) => (
    <LogoCard key={i} logo={logo} index={i} />
  ));

  return (
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
  );
}

/* ==================== LOGO CARD ==================== */

function LogoCard({ logo, index }) {
  return (
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
}
