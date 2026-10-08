"use client";

import { useEffect, useState } from "react";
import { Box } from "lucide-react";
import { GoLightBulb } from "react-icons/go";
import Loader from "@/app/Components/Loader";

const FALLBACK_ICON = GoLightBulb;

export default function SectionTwoSectionTwo() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/homepage/features", {
          cache: "no-store",
        });

        const result = await res.json().catch(() => null);

        if (res.ok && result?.data) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to load features data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <section className="w-full">
      <main className="px-4 py-12 sm:px-6 lg:px-12">
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
              {tagline}
            </h3>
          </span>
        </div>

        <h1
          className="wow animate__animated animate__fadeInUp pt-6 pb-8 text-center text-4xl leading-tight font-medium text-gray-700 sm:text-5xl"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          {title}
        </h1>

        <div className="mx-auto grid w-full grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-3">
          {cards.map((card, index) => {
            const iconUrl = card.icon?.url || "";

            return (
              <div
                key={index}
                className="wow animate__animated animate__fadeInUp group w-full cursor-pointer rounded-2xl bg-white p-6 transition-all duration-500 hover:-translate-y-2 hover:bg-[#1E8A8A] hover:shadow-xl sm:p-8"
                data-wow-duration="0.9s"
                data-wow-delay={`${0.2 + index * 0.2}s`}
              >
                {iconUrl ? (
                  <img
                    src={iconUrl}
                    alt={card.title}
                    className="h-20 w-20 object-contain"
                  />
                ) : (
                  <FALLBACK_ICON className="h-20 w-20 text-[#1E8A8A] transition-all duration-500 group-hover:text-white" />
                )}

                <h2 className="mt-8 text-xl font-bold text-zinc-950 transition-colors duration-500 group-hover:text-white">
                  {card.title}
                </h2>

                <p className="mt-4 leading-7 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
                  {card.description}
                </p>
              </div>
            );
          })}
        </div>
      </main>
    </section>
  );
}
