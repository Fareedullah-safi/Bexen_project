"use client";

import Loader from "@/app/Components/Loader";
import { fixData } from "@/Lib/fixText";
import { Box } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

const FEATURES_STYLES = `
  .rt-inline, .rt-desc { overflow-wrap: break-word !important; word-break: normal !important; }
  .rt-inline p { display: inline; margin: 0; padding: 0; }
  .rt-desc p { margin: 0 0 0.5em 0; }
  .rt-desc p:last-child { margin-bottom: 0; }
  .rt-desc strong, .rt-desc b,
  .rt-inline strong, .rt-inline b { font-weight: 700; color: inherit; }
  .rt-desc em, .rt-desc i,
  .rt-inline em, .rt-inline i { font-style: italic; }
  .rt-desc a, .rt-inline a { color: #1E8A8A; text-decoration: underline; text-underline-offset: 2px; }
  .rt-desc ul, .rt-desc ol { margin: 0.4em 0; padding-inline-start: 1.2em; }
  .rt-desc li { margin-bottom: 0.2em; }
  .rt-tight p { margin: 0 !important; padding: 0 !important; }
`;

export default function SectionTwo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadData = async (language = "en") => {
      try {
        const res = await fetch(
          `/api/homepage/features?lang=${encodeURIComponent(language)}`,
          {
            cache: "no-store",
          },
        );

        const result = await res.json().catch(() => null);

        if (active && res.ok && result?.data) {
          setData(fixData(result.data));
        }
      } catch (err) {
        console.error("Failed to load features data:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData(localStorage.getItem("site-language") || "en");

    const handleLanguageChange = (event) => {
      const language =
        event.detail?.language || localStorage.getItem("site-language") || "en";
      loadData(language);
    };

    window.addEventListener("site-language-change", handleLanguageChange);

    return () => {
      active = false;
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.WOW) {
        new window.WOW({ live: false }).sync();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [data]);

  if (loading) {
    return (
      <section className="w-full">
        <main className="flex min-h-100 w-full items-center justify-center px-4 py-12 sm:px-6 lg:px-12">
          <Loader />
        </main>
      </section>
    );
  }

  if (!data) return null;

  const { tagline, title, cards = [] } = data;

  const taglineText = stripHtml(tagline);
  const titleText = stripHtml(title);

  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">
        {taglineText && (
          <div className="flex justify-center">
            <div
              className="wow animate__animated animate__fadeIn group inline-flex items-center gap-2 border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
              data-wow-duration="0.8s"
            >
              <Box
                size={18}
                className="shrink-0 text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
              />
              <div
                role="heading"
                aria-level={3}
                className="rt-inline text-sm font-bold tracking-wide text-zinc-950 sm:text-base"
                dangerouslySetInnerHTML={{ __html: tagline }}
              />
            </div>
          </div>
        )}

        {titleText && (
          <div className="wow animate__animated animate__fadeInUp pt-6 pb-8">
            <div
              role="heading"
              aria-level={1}
              className="rt-desc rt-tight text-center text-4xl leading-tight font-medium text-gray-700 sm:text-5xl"
              data-wow-duration="1s"
              data-wow-delay="0.2s"
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </div>
        )}

        <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
          {cards.map((card, index) => {
            const iconUrl = card.icon?.url || "";
            const cardTitleText = stripHtml(card.title);
            const cardDescText = stripHtml(card.description);

            return (
              <div
                key={card._id || index}
                className="wow animate__animated animate__fadeInUp group w-full cursor-pointer rounded-2xl bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-[#1E8A8A] hover:shadow-xl sm:p-8"
                data-wow-duration="0.9s"
                data-wow-delay={`${0.2 + index * 0.2}s`}
              >
                {iconUrl && (
                  <div className="relative h-20 w-20">
                    <Image
                      src={iconUrl}
                      alt={cardTitleText || "Feature icon"}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                )}

                {cardTitleText && (
                  <div
                    role="heading"
                    aria-level={2}
                    className="rt-desc rt-tight mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white"
                    dangerouslySetInnerHTML={{ __html: card.title }}
                  />
                )}

                {cardDescText && (
                  <div
                    className="rt-desc mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90"
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: FEATURES_STYLES }} />
    </section>
  );
}
