"use client";

import { ArrowRight, Box, Play, Star } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

const ABOUT_US_STYLES = `
  .rt-inline p { display: inline; margin: 0; }
  .rt-desc p { margin: 0 0 0.5em 0; }
  .rt-desc p:last-child { margin-bottom: 0; }
  .rt-desc strong, .rt-desc b { font-weight: 700; color: inherit; }
  .rt-desc em, .rt-desc i { font-style: italic; }
  .rt-desc a { color: #1E8A8A; text-decoration: underline; text-underline-offset: 2px; }
  .rt-desc ul, .rt-desc ol { margin: 0.4em 0; padding-inline-start: 1.2em; }
  .rt-desc li { margin-bottom: 0.2em; }
`;

export default function AboutUsView({ data, lang: langProp = "en" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [lang, setLang] = useState(langProp);

  /* Sync with incoming langProp */
  useEffect(() => {
    if (langProp) {
      setLang(langProp);
    }
  }, [langProp]);

  /* Listen for language changes from NavBar */
  useEffect(() => {
    function handleLanguageChange(event) {
      let selectedLanguage = "en";
      if (event && event.detail && event.detail.language) {
        selectedLanguage = event.detail.language;
      } else {
        selectedLanguage = localStorage.getItem("site-language") || "en";
      }

      if (
        selectedLanguage === "en" ||
        selectedLanguage === "ps" ||
        selectedLanguage === "fa"
      ) {
        setLang(selectedLanguage);
      }
    }

    window.addEventListener("site-language-change", handleLanguageChange);
    return function () {
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

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

  const isRtl = lang === "ps" || lang === "fa";

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full overflow-x-hidden bg-[#eef2f2] px-4 py-8 sm:px-6 sm:py-10 md:px-10 lg:px-12 xl:px-16"
    >
      <div className="mx-auto grid w-full max-w-400 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
        {/* LEFT SIDE
            - mobile/tablet: image keeps an aspect ratio
            - desktop: image stretches to match the height of the right column */}
        <div
          className="wow animate__animated animate__fadeInLeft relative aspect-4/5 w-full min-w-0 sm:aspect-4/3 lg:aspect-auto lg:min-h-155"
          data-wow-duration="1s"
          data-wow-delay="0.1s"
        >
          {mainImage && (
            <Image
              src={mainImage}
              alt="About us"
              fill
              sizes="(max-width: 1024px) calc(100vw - 32px), 50vw"
              className="rounded-2xl object-cover"
            />
          )}

          {/* Experience Card */}
          <div
            className="wow animate__animated animate__fadeInUp absolute start-0 bottom-0 max-w-[90%] bg-[#eef2f2] pe-3 pt-3 sm:pe-4 sm:pt-4"
            data-wow-duration="0.8s"
            data-wow-delay="0.5s"
          >
            <div className="w-44 max-w-full rounded-se-2xl bg-white p-4 min-[400px]:w-52.5 sm:w-62.5 sm:p-6 md:w-70 md:p-7">
              {t.experienceLabel && (
                <div
                  className="rt-inline text-sm font-medium text-[#229393] sm:text-base md:text-lg"
                  dangerouslySetInnerHTML={{ __html: t.experienceLabel }}
                />
              )}

              {t.experienceNumber && (
                <div
                  role="heading"
                  aria-level={2}
                  className="rt-inline mt-4 text-4xl leading-none font-bold text-[#102326] sm:mt-8 sm:text-5xl md:mt-10 md:text-6xl"
                  dangerouslySetInnerHTML={{ __html: t.experienceNumber }}
                />
              )}

              {t.experienceText && (
                <div
                  className="rt-desc mt-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 md:text-lg"
                  dangerouslySetInnerHTML={{ __html: t.experienceText }}
                />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="wow animate__animated animate__fadeInRight flex w-full min-w-0 flex-col gap-4 sm:gap-5"
          data-wow-duration="1s"
          data-wow-delay="0.2s"
        >
          {/* MAIN CONTENT CARD */}
          <div className="rounded-2xl bg-white p-4 sm:p-5 md:p-6 lg:p-7">
            {/* Badge */}
            {t.sectionLabel && (
              <div
                className="wow animate__animated animate__fadeIn group inline-flex max-w-full items-center gap-2 border border-cyan-100 bg-cyan-50/30 px-3 py-1.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:bg-cyan-100 hover:shadow-md sm:px-4"
                data-wow-duration="0.8s"
                data-wow-delay="0.4s"
              >
                <Box
                  size={18}
                  className="shrink-0 text-[#1E8A8A] transition-transform duration-300 group-hover:rotate-180"
                />

                <div
                  className="rt-inline text-xs font-bold tracking-wide wrap-break-word text-zinc-950 sm:text-sm"
                  dangerouslySetInnerHTML={{ __html: t.sectionLabel }}
                />
              </div>
            )}

            {/* Heading */}
            {t.title && (
              <div
                role="heading"
                aria-level={1}
                className="wow animate__animated animate__fadeInUp rt-inline mt-4 text-xl leading-[1.2] font-medium wrap-break-word text-[#102326] sm:mt-5 sm:text-2xl md:text-3xl lg:text-[32px] xl:text-[38px] 2xl:text-[42px]"
                data-wow-duration="1s"
                data-wow-delay="0.5s"
                dangerouslySetInnerHTML={{ __html: t.title }}
              />
            )}

            {/* Button */}
            <div
              className="wow animate__animated animate__fadeInUp mt-5"
              data-wow-duration="0.8s"
              data-wow-delay="0.7s"
            >
              {t.buttonText && data?.buttonLink && (
                <a
                  href={data.buttonLink}
                  className="group/button inline-flex max-w-full min-w-35 cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-full bg-[#0C1E21] py-1 ps-4 pe-1 text-xs font-semibold text-white transition-colors duration-300 hover:bg-[#1E8A8A]"
                >
                  <span className="overflow-hidden leading-none">
                    <div
                      className="rt-inline block transition-transform duration-400 ease-in-out [text-shadow:0_30px_0_currentColor] group-hover/button:-translate-y-7.5"
                      dangerouslySetInnerHTML={{ __html: t.buttonText }}
                    />
                  </span>

                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white">
                    <ArrowRight
                      size={16}
                      className="-rotate-45 text-[#0C1E21] transition-transform duration-300 group-hover/button:rotate-0 rtl:-scale-x-100"
                    />
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* BOTTOM CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
            {/* TESTIMONIAL CARD */}
            <div
              className="wow animate__animated animate__fadeInUp flex min-h-47.5 min-w-0 flex-col justify-between rounded-2xl bg-[#1E8A8A] p-5 text-white sm:min-h-52.5 md:p-6"
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
              {t.description && (
                <div
                  className="rt-desc mt-5 max-w-full text-sm leading-6 wrap-break-word text-white/90 sm:text-base"
                  dangerouslySetInnerHTML={{ __html: t.description }}
                />
              )}

              {/* Person */}
              <div className="mt-5">
                {t.clientName && (
                  <div
                    className="rt-inline text-sm font-semibold"
                    dangerouslySetInnerHTML={{ __html: t.clientName }}
                  />
                )}
                <br />
                {t.clientRole && (
                  <div
                    className="rt-inline mt-1 text-xs text-white/70"
                    dangerouslySetInnerHTML={{ __html: t.clientRole }}
                  />
                )}
              </div>
            </div>

            {/* VIDEO CARD */}
            <div
              className="wow animate__animated animate__fadeInUp relative aspect-video min-h-47.5 min-w-0 overflow-hidden rounded-2xl bg-[#102326] sm:aspect-auto sm:min-h-52.5"
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
                    className="absolute top-1/2 left-1/2 z-10 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white shadow-xl transition-transform duration-300 hover:scale-110 sm:h-14 sm:w-14"
                  >
                    <Play
                      size={20}
                      fill="currentColor"
                      className="ms-1 text-[#1E8A8A] rtl:-scale-x-100"
                    />
                  </button>

                  <div className="absolute start-4 bottom-4 z-10 max-w-[calc(100%-2rem)]">
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

      {/* Local styles for Quill reset */}
      <style dangerouslySetInnerHTML={{ __html: ABOUT_US_STYLES }} />
    </main>
  );
}
