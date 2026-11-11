"use client";

import Loader from "@/app/Components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

/* Strip HTML tags — used for empty checks and image alt text */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

const SLIDER_STYLES = `
  .slider-title p { margin: 0; display: inline; }
  .slider-title p:last-child { margin-bottom: 0; }
  .slider-title strong, .slider-title b { color: #ffffff; font-weight: 800; }
  .slider-title em, .slider-title i { font-style: italic; }
  .slider-title a { color: #5eead4; text-decoration: underline; text-underline-offset: 2px; }
  .slider-title a:hover { color: #99f6e4; }
  .slider-title span { color: inherit; }

  .slider-desc p { margin: 0 0 0.4em 0; }
  .slider-desc p:last-child { margin-bottom: 0; }
  .slider-desc strong, .slider-desc b { color: #ffffff; font-weight: 700; }
  .slider-desc em, .slider-desc i { font-style: italic; }
  .slider-desc a { color: #5eead4; text-decoration: underline; text-underline-offset: 2px; }
  .slider-desc a:hover { color: #99f6e4; }
  .slider-desc ul, .slider-desc ol { margin: 0.3em 0; padding-inline-start: 1.2em; }
  .slider-desc li { margin-bottom: 0.2em; }
  .slider-desc span { color: inherit; }
`;

export default function SliderFrontendView({ data, lang: propLang = "en" }) {
  const [activeLang, setActiveLang] = useState(propLang);

  /* 1) Sync with incoming propLang from parent */
  useEffect(() => {
    if (propLang) {
      setActiveLang(propLang);
    }
  }, [propLang]);

  /* 2) Listen for custom event from NavBar for instant client update */
  useEffect(() => {
    function handleLanguageChange(event) {
      const selectedLanguage = event?.detail?.language;
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

  const images =
    data?.slides
      ?.map((slide) => slide?.image?.url)
      .filter((src) => typeof src === "string" && src.trim().length > 0) || [];

  const validSlides = (data?.slides || []).filter(
    (s) => typeof s?.image?.url === "string" && s.image.url.trim().length > 0,
  );

  const [image, setImage] = useState(images[0] || null);
  const [imageKey, setImageKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    setImage(images[0] || null);
    setImageKey(0);
    setLoading(false);
  }, [data]);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImage((current) => {
        const currentIndex = images.indexOf(current);
        const nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
      setImageKey((key) => key + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleImageChange = (img) => {
    if (!img) return;
    setImage(img);
    setImageKey((key) => key + 1);
    setShowControls(true);
  };

  const handlePrevious = () => {
    if (images.length <= 1) return;
    const currentIndex = images.indexOf(image);
    const previousIndex = (currentIndex - 1 + images.length) % images.length;
    handleImageChange(images[previousIndex]);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    const currentIndex = images.indexOf(image);
    const nextIndex = (currentIndex + 1) % images.length;
    handleImageChange(images[nextIndex]);
  };

  const handleMouseEnter = () => {
    if (!loading && images.length > 1) setShowControls(true);
  };

  const handleMouseLeave = () => setShowControls(false);

  const currentSlideIndex = Math.max(images.indexOf(image), 0);
  const currentSlide = validSlides[currentSlideIndex];

  /* Fallback to active language translation, or default to English */
  const slideT =
    currentSlide?.translations?.[activeLang] ||
    currentSlide?.translations?.en ||
    {};
  const slideTitle = slideT.title || "";
  const slideDesc = slideT.description || "";

  // Strip HTML before checking if text is really empty
  const titleText = stripHtml(slideTitle);
  const descText = stripHtml(slideDesc);
  const hasText = titleText.length > 0 || descText.length > 0;

  return (
    <main className="z-7 h-full w-full px-4 py-3" dir={isRtl ? "rtl" : "ltr"}>
      <div
        className="relative mx-auto h-125 w-full overflow-hidden rounded-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {image && (
          <div
            key={imageKey}
            className="wow animate__animated animate__fadeIn relative h-full w-full"
            data-wow-duration="1.2s"
          >
            <Image
              src={image}
              alt={titleText || "Slider Image"}
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 32px), calc(100vw - 32px)"
              className="rounded-lg object-cover"
            />

            {/* =====================================================
    OPTIONAL PREMIUM SLIDER MASK
    Remove this entire block if you don't like the effect.
===================================================== */}

            <div
              className="pointer-events-none absolute inset-0 z-[1] rounded-lg"
              style={{
                background: `
      linear-gradient(
        to bottom,
        rgba(4, 20, 22, 0.18) 0%,
        transparent 22%,
        transparent 55%,
        rgba(4, 20, 22, 0.35) 100%
      ),
      radial-gradient(
        ellipse at center,
        transparent 45%,
        rgba(3, 18, 20, 0.30) 100%
      ),
      linear-gradient(
        110deg,
        rgba(10, 75, 72, 0.12),
        transparent 45%,
        rgba(5, 40, 43, 0.12)
      )
    `,
              }}
            />

            {/* END OPTIONAL PREMIUM SLIDER MASK */}
          </div>
        )}

        {image && hasText && (
          <div
            key={`text-${imageKey}-${activeLang}`}
            className="animate__animated animate__fadeInUp absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end rounded-b-lg px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-20 md:px-12"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 100%)",
              animationDuration: "0.8s",
            }}
            dir={isRtl ? "rtl" : "ltr"}
          >
            {titleText.length > 0 && (
              <div
                role="heading"
                aria-level={2}
                className="slider-title mb-2 max-w-3xl text-xl leading-tight font-extrabold tracking-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl lg:text-4xl"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
                dangerouslySetInnerHTML={{ __html: slideTitle }}
              />
            )}

            {descText.length > 0 && (
              <div
                className="slider-desc max-w-2xl text-sm leading-relaxed text-white/90 drop-shadow-md sm:text-base md:text-lg"
                style={{ textShadow: "0 1px 6px rgba(0,0,0,0.4)" }}
                dangerouslySetInnerHTML={{ __html: slideDesc }}
              />
            )}
          </div>
        )}

        {loading && !image && <Loader />}

        {!loading && !image && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#F7F9FC] text-sm text-[var(--muted)]">
            No slider images available.
          </div>
        )}

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
              {Math.max(images.indexOf(image), 0) + 1} / {images.length}
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
