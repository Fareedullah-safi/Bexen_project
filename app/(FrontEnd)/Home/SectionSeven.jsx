"use client";

import { fixData } from "@/Lib/fixText";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";

const SECTION_SEVEN_STYLES = `
  .section-seven-rt .rt-inline p,
  .section-seven-rt .rt-inline h1,
  .section-seven-rt .rt-inline h2,
  .section-seven-rt .rt-inline h3,
  .section-seven-rt .rt-inline h4,
  .section-seven-rt .rt-inline h5,
  .section-seven-rt .rt-inline h6 {
    display: inline;
    margin: 0 !important;
    padding: 0 !important;
  }
  .section-seven-rt .rt-inline br {
    display: none;
  }
  .section-seven-rt .rt-desc p {
    margin: 0.25em 0;
  }
  .section-seven-rt .rt-desc p:first-child {
    margin-top: 0;
  }
  .section-seven-rt .rt-desc p:last-child {
    margin-bottom: 0;
  }
  .section-seven-rt .rt-inline,
  .section-seven-rt .rt-desc {
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }
  .section-seven-rt a {
    color: inherit;
    text-decoration: underline;
  }
  .section-seven-rt ul,
  .section-seven-rt ol {
    margin: 0.25em 0;
    padding-left: 1.25em;
  }
  .section-seven-rt strong,
  .section-seven-rt b {
    font-weight: 700;
  }
`;

export default function SectionSeven() {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getLocalizedText = (value, language = "en") => {
    if (typeof value === "string") return value;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value[language] || value.en || value.fa || value.ps || "";
    }

    return "";
  };

  useEffect(() => {
    let active = true;
    let requestId = 0;

    const loadStats = async (language) => {
      const currentRequestId = ++requestId;

      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/homepage/reviews-section?lang=${encodeURIComponent(language)}`,
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load stats");
        }

        const result = await response.json();

        if (!active || currentRequestId !== requestId) {
          return;
        }

        const data = fixData(result.data);

        if (result.success && data && Array.isArray(data.stats)) {
          setStats(
            data.stats
              .map((stat) => ({
                value: getLocalizedText(stat.value, language),
                title: getLocalizedText(stat.label, language),
              }))
              .filter((stat) => stat.value || stat.title),
          );
        } else {
          setStats([]);
        }
      } catch (error) {
        if (active && currentRequestId === requestId) {
          console.error("Failed to load stats:", error);
          setStats([]);
        }
      } finally {
        if (active && currentRequestId === requestId) {
          setIsLoading(false);
        }
      }
    };

    const initialLanguage = localStorage.getItem("site-language") || "en";

    loadStats(initialLanguage);

    const handleLanguageChange = (event) => {
      const nextLanguage =
        event.detail?.language || localStorage.getItem("site-language") || "en";

      loadStats(nextLanguage);
    };

    window.addEventListener("site-language-change", handleLanguageChange);

    return () => {
      active = false;

      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  if (isLoading) {
    return (
      <section className="relative z-20 -mt-20 w-full px-4 py-16 sm:px-6 md:px-10 lg:px-12 xl:px-16">
        <div className="mx-auto flex min-h-52 w-full max-w-7xl items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1E8A8A]/20 border-t-[#1E8A8A]" />
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section className="section-seven-rt relative z-20 -mt-20 w-full px-4 py-16 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-7xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-white/15 bg-[#1E8A8A] shadow-2xl sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={`${stat.title}-${index}`}
              data-wow-duration="0.8s"
              data-wow-delay={`${index * 0.12}s`}
              className="wow animate__animated animate__fadeInUp group relative flex min-h-52 cursor-pointer flex-col justify-between overflow-hidden border-b border-white/15 px-6 py-7 transition-all duration-500 hover:bg-[#0C1E21]/15 sm:px-8 lg:min-h-60 lg:border-r lg:border-b-0 lg:last:border-r-0"
            >
              {/* Soft glow */}
              <div className="pointer-events-none absolute -top-16 -right-16 h-32 w-32 rounded-full bg-white/10 blur-3xl transition-all duration-500 group-hover:bg-white/20" />

              {/* Top */}
              <div className="relative flex items-start justify-between">
                <span className="text-sm font-semibold tracking-wider text-white/70">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 transition-all duration-500 group-hover:rotate-45 group-hover:bg-white/20">
                  <ArrowUpRight
                    size={18}
                    className="text-white transition-transform duration-500"
                  />
                </span>
              </div>

              {/* Bottom */}
              <div className="relative mt-6">
                <div className="flex items-end gap-2">
                  <div
                    className="rt-inline text-5xl leading-none font-medium tracking-tight text-white sm:text-7xl"
                    dangerouslySetInnerHTML={{ __html: stat.value || "" }}
                  />
                </div>

                <div className="mt-4 h-px w-10 bg-white/30 transition-all duration-500 group-hover:w-16 group-hover:bg-white/60" />

                <div
                  className="rt-desc mt-3 text-sm font-medium tracking-wide text-white/75 sm:text-base"
                  dangerouslySetInnerHTML={{ __html: stat.title || "" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: SECTION_SEVEN_STYLES }} />
    </section>
  );
}
