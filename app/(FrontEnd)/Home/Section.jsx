"use client";

import Loader from "@/app/Components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function getSlideImageUrl(slide) {
  if (!slide) return "";

  if (typeof slide.image === "string") {
    return slide.image.trim();
  }

  if (slide.image && typeof slide.image.url === "string") {
    return slide.image.url.trim();
  }

  return "";
}

const SLIDER_STYLES = `
  .slider-title, .slider-desc {
    overflow-wrap: break-word !important;
    word-break: normal !important;
  }

  .slider-title p { margin: 0; display: inline; }
  .slider-title p:last-child { margin-bottom: 0; }
  .slider-title strong, .slider-title b {
    color: #ffffff;
    font-weight: 800;
  }
  .slider-title em, .slider-title i { font-style: italic; }
  .slider-title a {
    color: #5eead4;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .slider-title a:hover { color: #99f6e4; }
  .slider-title span { color: inherit; }

  .slider-desc p { margin: 0 0 0.4em 0; }
  .slider-desc p:last-child { margin-bottom: 0; }
  .slider-desc strong, .slider-desc b {
    color: #ffffff;
    font-weight: 700;
  }
  .slider-desc em, .slider-desc i { font-style: italic; }
  .slider-desc a {
    color: #5eead4;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .slider-desc a:hover { color: #99f6e4; }
  .slider-desc ul, .slider-desc ol {
    margin: 0.3em 0;
    padding-inline-start: 1.2em;
  }
  .slider-desc li { margin-bottom: 0.2em; }
  .slider-desc span { color: inherit; }
`;

export default function Section({ data: propData, lang: propLang = "en" }) {
  const [data, setData] = useState(propData || null);
  const [activeLang, setActiveLang] = useState(propLang);
  const [loading, setLoading] = useState(!propData);
  const [showControls, setShowControls] = useState(false);
  const [currentImageIndex, setCurrentIndex] = useState(0);
  const [imageKey, setImageKey] = useState(0);

  {
    /* 1. Fetch data internally if propData is missing */
  }
  useEffect(() => {
    if (propData) {
      setData(propData);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchSlides() {
      try {
        const res = await fetch("/api/homepage/slides", {
          cache: "no-store",
          signal: controller.signal,
        });

        const result = await res.json();

        if (res.ok && result) {
          setData(result);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to load slides:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSlides();

    return () => controller.abort();
  }, [propData]);

  {
    /* 2. Language Synchronization */
  }
  useEffect(() => {
    if (propLang) {
      setActiveLang(propLang);
    }
  }, [propLang]);

  useEffect(() => {
    function handleLanguageChange(event) {
      const selectedLanguage =
        event?.detail?.language || event?.detail?.languageId;

      if (
        selectedLanguage === "en" ||
        selectedLanguage === "ps" ||
        selectedLanguage === "fa"
      ) {
        setActiveLang(selectedLanguage);
      }
    }

    window.addEventListener("site-language-change", handleLanguageChange);

    return function () {
      window.removeEventListener("site-language-change", handleLanguageChange);
    };
  }, []);

  const isRtl = activeLang === "ps" || activeLang === "fa";

  {
    /* 3. Extract Valid Slides */
  }
  const rawSlides = Array.isArray(data?.slides)
    ? data.slides
    : Array.isArray(data)
      ? data
      : [];

  const validSlides = rawSlides.filter(function (slide) {
    return getSlideImageUrl(slide).length > 0;
  });

  const images = validSlides.map(getSlideImageUrl);

  {
    /* 4. Auto Slide Timer */
  }
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);

      setImageKey((key) => key + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  {
    /* 5. Hide Controls Timer */
  }
  useEffect(() => {
    if (!showControls) return;

    const timeout = setTimeout(() => setShowControls(false), 5000);

    return () => clearTimeout(timeout);
  }, [showControls]);

  function handlePrevious() {
    if (images.length <= 1) return;

    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

    setImageKey((k) => k + 1);
    setShowControls(true);
  }

  function handleNext() {
    if (images.length <= 1) return;

    setCurrentIndex((prev) => (prev + 1) % images.length);

    setImageKey((k) => k + 1);
    setShowControls(true);
  }

  const currentImage = images[currentImageIndex] || null;

  const currentSlide = validSlides[currentImageIndex] || null;

  {
    /* Translation resolve: current lang -> fallback English -> empty */
  }
  const slideT =
    currentSlide?.translations?.[activeLang] ||
    currentSlide?.translations?.en ||
    {};

  const slideTitle = slideT.title || "";
  const slideDesc = slideT.description || "";

  const titleText = stripHtml(slideTitle);
  const descText = stripHtml(slideDesc);

  const hasText = titleText.length > 0 || descText.length > 0;

  return (
    <main className="z-7 h-full w-full px-4 py-3" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="relative mx-auto h-125 w-full overflow-hidden rounded-lg"
        onMouseEnter={() =>
          !loading && images.length > 1 && setShowControls(true)
        }
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Background Image */}
        {currentImage && (
          <div
            key={imageKey}
            className="wow animate__animated animate__fadeIn relative z-0 h-full w-full"
            data-wow-duration="1.2s"
          >
            <Image
              src={currentImage}
              alt={titleText || "Hero Slider Image"}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 32px), calc(100vw - 32px)"
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {/* =====================================================
            OPTIONAL BEXON PREMIUM DARK TEAL OVERLAY

            - Original Cloudinary images preserved.
            - Subtle teal ambient glow.
            - Professional dark cinematic appearance.
            - Improves image and text contrast.
            - Remove this entire block to disable.
        ===================================================== */}

        {currentImage && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[1] rounded-lg"
            style={{
              background: `
                linear-gradient(
                  110deg,
                  rgba(8, 39, 40, 0.48) 0%,
                  rgba(8, 30, 32, 0.44) 50%,
                  rgba(5, 22, 25, 0.55) 100%
                ),
                radial-gradient(
                  ellipse at 12% 38%,
                  rgba(20, 105, 101, 0.20) 0%,
                  transparent 55%
                ),
                radial-gradient(
                  ellipse at 90% 100%,
                  rgba(12, 75, 73, 0.13) 0%,
                  transparent 55%
                )
              `,
            }}
          />
        )}

        {/* END OPTIONAL BEXON DARK TEAL OVERLAY */}

        {/* Text Overlay */}
        {currentImage && hasText && (
          <div
            key={`text-${imageKey}-${activeLang}`}
            className="animate__animated animate__fadeInUp absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end rounded-b-lg px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20 md:px-12"
            style={{
              background: `
                linear-gradient(
                  to top,
                  rgba(2, 13, 15, 0.90) 0%,
                  rgba(3, 20, 22, 0.72) 30%,
                  rgba(4, 25, 27, 0.35) 65%,
                  transparent 100%
                )
              `,
              animationDuration: "0.8s",
            }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {titleText.length > 0 && (
              <div
                role="heading"
                aria-level={2}
                className="slider-title mb-2 max-w-3xl text-xl leading-tight font-extrabold tracking-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl lg:text-4xl"
                style={{
                  textShadow: "0 2px 12px rgba(0,0,0,0.5)",
                }}
                dangerouslySetInnerHTML={{
                  __html: slideTitle,
                }}
              />
            )}

            {descText.length > 0 && (
              <div
                className="slider-desc max-w-2xl text-sm leading-relaxed text-white/90 drop-shadow-md sm:text-base md:text-lg"
                style={{
                  textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                }}
                dangerouslySetInnerHTML={{
                  __html: slideDesc,
                }}
              />
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !currentImage && <Loader />}

        {/* Empty State */}
        {!loading && !currentImage && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#F7F9FC] text-sm text-[var(--muted)] dark:bg-[#111a23]">
            No slider images available.
          </div>
        )}

        {/* Slider Navigation Bar */}
        {images.length > 1 && (
          <div
            className={`absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/25 bg-black/20 p-1.5 shadow-lg backdrop-blur-md transition-all duration-500 ${
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous image"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:bg-white/25 active:scale-95 sm:h-10 sm:w-10"
            >
              <ChevronLeft
                size={19}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </button>

            <span className="min-w-12 px-1 text-center text-xs font-semibold tracking-wide text-white">
              {currentImageIndex + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:bg-white/25 active:scale-95 sm:h-10 sm:w-10"
            >
              <ChevronRight
                size={19}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}
      </div>

      {/* Global CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: SLIDER_STYLES }} />
    </main>
  );
}
