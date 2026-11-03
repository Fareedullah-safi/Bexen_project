"use client";

import { ArrowRight, Box, Play, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function AboutUsView({ data, lang = "en" }) {
  const [isPlaying, setIsPlaying] = useState(false);

  /* Re-trigger WOW.js after dynamic mount */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined" && window.WOW) {
        try {
          new window.WOW({ live: false }).sync();
        } catch {}
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  /* ── helpers ── */
  const t = data?.translations?.[lang] || data?.translations?.en || {};

  const getImageUrl = (image) => {
    if (typeof image === "string" && image)
      return image.replace(/^http:\/\//, "https://");
    if (image?.url) return String(image.url).replace(/^http:\/\//, "https://");
    return "";
  };

  const mainImage = getImageUrl(data?.mainImage);
  const clientImage = getImageUrl(data?.thumbnailImage);

  const videoId =
    (data?.videoLink || "").match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&/]+)/,
    )?.[1] || "";

  return (
    <main className="w-full bg-[#eef2f2] px-4 py-10 sm:px-6 md:px-10 lg:px-12 xl:px-16">
      <div className="mx-auto grid w-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {/* LEFT SIDE */}
        <div
          className="wow animate__animated animate__fadeInLeft relative w-full"
          data-wow-duration="1s"
          data-wow-delay="0.1s"
        >
          {mainImage && (
            <Image
              src={mainImage}
              alt="About us"
              fill
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 40px), 50vw"
              className="!relative h-112.5 w-full rounded-2xl object-cover sm:h-130 md:h-150 lg:h-155"
            />
          )}

          {/* Experience Card */}
          <div
            className="wow animate__animated animate__fadeInUp absolute bottom-0 left-0 bg-[#eef2f2] pt-3 pr-3 sm:pt-4 sm:pr-4"
            data-wow-duration="0.8s"
            data-wow-delay="0.5s"
          >
            <div className="w-52.5 rounded-tr-2xl bg-white p-5 sm:w-62.5 sm:p-6 md:w-70 md:p-7">
              <p className="text-sm font-medium text-[#229393] sm:text-base md:text-lg">
                {t.experienceLabel}
              </p>

              <h2 className="mt-6 text-4xl leading-none font-bold text-[#102326] sm:mt-8 sm:text-5xl md:mt-10 md:text-6xl">
                {t.experienceNumber}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 md:text-lg">
                {t.experienceText}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="wow animate__animated animate__fadeInRight flex w-full flex-col gap-5"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          {/* MAIN CONTENT CARD */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 md:p-6 lg:p-7">
            {/* Badge */}
            <span
              className="wow animate__animated animate__fadeIn group inline-flex items-center gap-2 border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
              data-wow-duration="0.8s"
              data-wow-delay="0.4s"
            >
              <Box
                size={18}
                className="text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
              />

              <span className="text-sm font-bold tracking-wide text-zinc-950">
                {t.sectionLabel}
              </span>
            </span>

            {/* Heading */}
            <h1
              className="wow animate__animated animate__fadeInUp mt-5 text-xl leading-[1.15] font-medium text-[#102326] sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[42px]"
              data-wow-duration="1s"
              data-wow-delay="0.5s"
            >
              {t.title}
            </h1>

            {/* Button */}
            <div
              className="wow animate__animated animate__fadeInUp mt-5"
              data-wow-duration="0.8s"
              data-wow-delay="0.7s"
            >
              {t.buttonText && data?.buttonLink && (
                <a
                  href={data.buttonLink}
                  className="group/button inline-flex w-35 cursor-pointer items-center justify-between overflow-hidden rounded-full bg-[#0C1E21] py-1 pr-1 pl-4 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#1E8A8A]"
                >
                  <span className="overflow-hidden leading-none">
                    <span className="block transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5">
                      {t.buttonText}
                    </span>
                  </span>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                    <ArrowRight
                      size={16}
                      className="-rotate-45 text-[#0C1E21] transition-transform duration-300 group-hover/button:rotate-0"
                    />
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* BOTTOM CARDS */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* TESTIMONIAL CARD */}
            <div
              className="wow animate__animated animate__fadeInUp flex min-h-47.5 flex-col justify-between rounded-2xl bg-[#1E8A8A] p-5 text-white sm:min-h-52.5 md:p-6"
              data-wow-duration="0.9s"
              data-wow-delay="0.3s"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    fill="currentColor"
                    className="text-white"
                  />
                ))}
              </div>

              {/* Testimonial */}
              <p className="mt-5 text-sm leading-6 text-white/90 sm:text-base">
                {t.description}
              </p>

              {/* Person */}
              <div className="mt-5">
                <p className="text-sm font-semibold">{t.clientName}</p>
                <p className="mt-1 text-xs text-white/70">{t.clientRole}</p>
              </div>
            </div>

            {/* VIDEO CARD */}
            <div
              className="wow animate__animated animate__fadeInUp relative min-h-47.5 overflow-hidden rounded-2xl bg-[#102326] sm:min-h-52.5"
              data-wow-duration="0.9s"
              data-wow-delay="0.5s"
            >
              {!isPlaying ? (
                <>
                  {clientImage && (
                    <Image
                      src={clientImage}
                      alt="Discover Our Story"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  )}

                  <div className="absolute inset-0 bg-black/30" />

                  <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    aria-label="Play video"
                    className="absolute top-1/2 left-1/2 z-10 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 hover:scale-110"
                  >
                    <Play
                      size={20}
                      fill="currentColor"
                      className="ml-1 text-[#1E8A8A]"
                    />
                  </button>

                  <div className="absolute bottom-4 left-4 z-10">
                    <p className="text-sm font-medium text-white">
                      Discover Our Story
                    </p>
                  </div>
                </>
              ) : (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${videoId || "bAhM3td5PzY"}?autoplay=1`}
                  title="Discover Our Story"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
