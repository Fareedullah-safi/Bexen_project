"use client";

import { Box } from "lucide-react";
import Image from "next/image";

export default function FrontendView({ data, lang = "en" }) {
  if (!data) return null;

  const t = data.translations?.[lang] || data.translations?.en || {};
  const cards = data.cards || [];

  if (!t.tagline && !t.title && cards.length === 0) return null;

  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">
        {/* Tagline badge — same style as SectionTwo */}
        {t.tagline && (
          <div className="flex justify-center">
            <span
              className="wow animate__animated animate__fadeIn group inline-flex items-center gap-2 border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
              data-wow-duration="0.8s"
            >
              <Box
                size={18}
                className="text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
              />
              <h3 className="sm:text-md text-sm font-bold tracking-wide text-zinc-950">
                {t.tagline}
              </h3>
            </span>
          </div>
        )}

        {/* Title — same style as SectionTwo */}
        {t.title && (
          <h1
            className="wow animate__animated animate__fadeInUp pt-6 pb-8 text-center text-4xl leading-tight font-medium text-gray-700 sm:text-5xl"
            data-wow-duration="1s"
            data-wow-delay="0.2s"
          >
            {t.title}
          </h1>
        )}

        {/* Cards grid — same hover + layout as SectionTwo */}
        {cards.length > 0 && (
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
            {cards.map((card, index) => {
              const ct =
                card.translations?.[lang] || card.translations?.en || {};
              const iconUrl = card.icon?.url || "";

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
                        alt={ct.title || "Feature icon"}
                        fill
                        sizes="80px"
                        className="object-contain"
                      />
                    </div>
                  )}

                  {ct.title && (
                    <h2 className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white">
                      {ct.title}
                    </h2>
                  )}

                  {ct.description && (
                    <p className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
                      {ct.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </section>
  );
}
