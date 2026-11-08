"use client";

import RichText from "@/app/Components/RichText";
// import RichText from "@/Components/RichText"; // <-- IMPORT IT HERE
import { Box } from "lucide-react";
import Image from "next/image";

/* Helper just for checking if whole sections are empty or extracting alt text */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export default function FeaturesFrontendView({ data, lang = "en" }) {
  if (!data) return null;

  const t = data.translations?.[lang] || data.translations?.en || {};
  const cards = data.cards || [];

  const taglineText = stripHtml(t.tagline);
  const titleText = stripHtml(t.title);

  if (!taglineText && !titleText && cards.length === 0) return null;

  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">
        {/* Tagline badge (Inline) */}
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
              <RichText
                content={t.tagline}
                inline={true}
                asHeading={true}
                headingLevel={3}
                className="text-sm font-bold tracking-wide text-zinc-950 sm:text-base"
              />
            </div>
          </div>
        )}

        {/* Section Main Title (Block with Center Align support) */}
        {titleText && (
          <RichText
            content={t.title}
            asHeading={true}
            headingLevel={1}
            className="wow animate__animated animate__fadeInUp pt-6 text-center text-4xl leading-tight font-medium text-gray-700 sm:text-5xl"
          />
        )}

        {/* Cards grid */}
        {cards.length > 0 && (
          <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
            {cards.map((card, index) => {
              const ct =
                card.translations?.[lang] || card.translations?.en || {};
              const iconUrl = card.icon?.url || "";

              const cardTitleText = stripHtml(ct.title);

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

                  <RichText
                    content={ct.title}
                    asHeading={true}
                    headingLevel={2}
                    className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white"
                  />

                  <RichText
                    content={ct.description}
                    className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90"
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </section>
  );
}
