"use client";

import Loader from "@/app/Components/Loader";
import axios from "axios";
import { ChevronLeft, ChevronRight, ImageIcon, X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const API_URL = "/api/media/albums";

const getSavedLang = () => {
  if (typeof window === "undefined") return "en";
  return (
    localStorage.getItem("site-language") ||
    localStorage.getItem("admin-content-language") ||
    localStorage.getItem("admin-language") ||
    "en"
  );
};

export default function ImagesPage() {
  const [data, setData] = useState({
    translations: {
      en: {
        title: "Visual Portfolio",
        subtitle: "Explore our collection of images.",
      },
      ps: {
        title: "انځوریز پورټفولیو",
        subtitle: "زموږ د انځورونو ټولګه وګورئ.",
      },
      fa: {
        title: "پورتفولیو تصویری",
        subtitle: "مجموعه تصاویر ما را مشاهده کنید.",
      },
    },
    images: [],
  });

  const [loading, setLoading] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [language, setLanguage] = useState("en");

  // Sync language with navbar (site-language) + admin events
  useEffect(() => {
    setLanguage(getSavedLang());

    const handleLangChange = (e) => {
      const next = e.detail?.languageId || e.detail?.language || getSavedLang();
      setLanguage(next);
    };

    const handleStorage = (e) => {
      if (
        e.key === "site-language" ||
        e.key === "admin-content-language" ||
        e.key === "admin-language"
      ) {
        setLanguage(e.newValue || "en");
      }
    };

    window.addEventListener("admin-language-change", handleLangChange);
    window.addEventListener("site-language-change", handleLangChange);
    window.addEventListener("language-change", handleLangChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("admin-language-change", handleLangChange);
      window.removeEventListener("site-language-change", handleLangChange);
      window.removeEventListener("language-change", handleLangChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  // Fetch API Data
  useEffect(() => {
    let isMounted = true;
    axios
      .get(API_URL)
      .then((res) => {
        if (isMounted && res.data?.success && res.data?.data) {
          const d = res.data.data;
          setData({
            translations: {
              en: {
                title: d.translations?.en?.title || "",
                subtitle: d.translations?.en?.subtitle || "",
              },
              ps: {
                title: d.translations?.ps?.title || "",
                subtitle: d.translations?.ps?.subtitle || "",
              },
              fa: {
                title: d.translations?.fa?.title || "",
                subtitle: d.translations?.fa?.subtitle || "",
              },
            },
            images: Array.isArray(d.images) ? d.images : [],
          });
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const images = data.images || [];
  const currentT = data.translations[language] || data.translations.en;
  const isRtl = language === "ps" || language === "fa";

  // Lightbox Navigation Controls
  const nav = useCallback(
    (step) => {
      setLightboxIdx((prev) =>
        prev === null || images.length === 0
          ? null
          : (prev + step + images.length) % images.length,
      );
    },
    [images.length],
  );

  // Keyboard Navigation
  useEffect(() => {
    if (lightboxIdx === null) return;
    const keyHandler = (e) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") nav(isRtl ? -1 : 1);
      if (e.key === "ArrowLeft") nav(isRtl ? 1 : -1);
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, [lightboxIdx, nav, isRtl]);

  // Lock body scroll when Lightbox is open
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [lightboxIdx]);

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--background,#f9fafb)] px-4 pt-6 transition-colors duration-300 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header Section */}
        <header className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--foreground,#111827)] sm:text-4xl md:text-5xl">
            {currentT.title || "Visual Portfolio"}
          </h1>
          <p className="mx-auto max-w-2xl font-medium text-[var(--muted,#6b7280)]">
            {currentT.subtitle || "Explore our gallery collection."}
          </p>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader />
          </div>
        ) : images.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
            <ImageIcon className="mb-3 h-12 w-12 text-[var(--muted,#6b7280)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--foreground,#111827)]">
              {isRtl ? "تصویری موجود نیست" : "No images available"}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted,#6b7280)]">
              {isRtl
                ? "تصاویر اضافه شده در پنل مدیریت اینجا نمایش داده می‌شوند."
                : "Images added in the admin dashboard will appear here."}
            </p>
          </div>
        ) : (
          /* Images Grid: 2 cols on mobile, 3 on tablet, 5 on desktop */
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-6">
            {images.map((img, i) => (
              <div
                key={img.publicId || i}
                onClick={() => setLightboxIdx(i)}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800"
              >
                <img
                  src={img.url}
                  loading="lazy"
                  alt={`Gallery Image ${i + 1}`}
                  className="h-full w-full transform object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn
                    className="h-10 w-10 scale-50 transform text-white drop-shadow-lg transition-transform duration-300 ease-out group-hover:scale-100"
                    strokeWidth={1.5}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxIdx !== null && images[lightboxIdx] && (
        <div
          dir="ltr"
          className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md duration-300"
        >
          <button
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 z-20 rounded-full p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white focus:outline-none"
            aria-label="Close modal"
          >
            <X size={32} />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nav(isRtl ? 1 : -1);
                }}
                className="absolute left-2 z-20 rounded-full p-3 text-white/60 transition-all hover:scale-110 hover:bg-white/10 hover:text-white focus:outline-none lg:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft size={44} strokeWidth={1.5} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nav(isRtl ? -1 : 1);
                }}
                className="absolute right-2 z-20 rounded-full p-3 text-white/60 transition-all hover:scale-110 hover:bg-white/10 hover:text-white focus:outline-none lg:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={44} strokeWidth={1.5} />
              </button>
            </>
          )}

          <div
            className="relative flex h-full max-h-[85vh] w-full max-w-[90vw] items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            <img
              key={lightboxIdx}
              src={images[lightboxIdx].url}
              className="animate-in fade-in zoom-in-95 max-h-full max-w-full rounded-xl object-contain shadow-[0_0_40px_rgba(0,0,0,0.5)] duration-300 ease-out select-none"
              alt={`Expanded Image ${lightboxIdx + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-6 text-sm font-semibold tracking-[0.2em] text-white/70">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </main>
  );
}
