"use client";

import Loader from "@/app/Components/Loader";
import axios from "axios";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Folder,
  ImageIcon,
  Layers,
  X,
  ZoomIn,
} from "lucide-react";
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
        title: "Photo Albums",
        subtitle: "Select an album to explore photo collections.",
      },
      ps: {
        title: "د انځورونو البومونه",
        subtitle: "د انځورونو د لیدلو لپاره یو البوم وټاکئ.",
      },
      fa: {
        title: "آلبوم‌های عکس",
        subtitle: "برای مشاهده تصاویر، یک آلبوم را انتخاب کنید.",
      },
    },
    albums: [],
  });

  const [loading, setLoading] = useState(true);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [language, setLanguage] = useState("en");

  // Sync language with site-language / admin storage
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
                title: d.translations?.en?.title || "Photo Albums",
                subtitle:
                  d.translations?.en?.subtitle ||
                  "Select an album to explore photo collections.",
              },
              ps: {
                title: d.translations?.ps?.title || "د انځورونو البومونه",
                subtitle:
                  d.translations?.ps?.subtitle ||
                  "د انځورونو د لیدلو لپاره یو البوم وټاکئ.",
              },
              fa: {
                title: d.translations?.fa?.title || "آلبوم‌های عکس",
                subtitle:
                  d.translations?.fa?.subtitle ||
                  "برای مشاهده تصاویر، یک آلبوم را انتخاب کنید.",
              },
            },
            albums: Array.isArray(d.albums) ? d.albums : [],
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

  const pageT = data.translations[language] || data.translations.en;
  const isRtl = language === "ps" || language === "fa";
  const albums = data.albums || [];

  const currentAlbumImages = selectedAlbum ? selectedAlbum.images || [] : [];

  // Lightbox Navigation
  const nav = useCallback(
    (step) => {
      setLightboxIdx((prev) =>
        prev === null || currentAlbumImages.length === 0
          ? null
          : (prev + step + currentAlbumImages.length) %
            currentAlbumImages.length,
      );
    },
    [currentAlbumImages.length],
  );

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

  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [lightboxIdx]);

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--background,#f9fafb)] px-4 pt-6 pb-20 transition-colors duration-300 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header */}
        <header className="mb-10 text-center">
          {selectedAlbum ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="mb-4 inline-flex items-center gap-2 rounded-xl border border-[var(--border,#e5e7eb)] bg-[var(--surface,#ffffff)] px-4 py-2 text-sm font-semibold text-[var(--accent,#1e8a8a)] shadow-sm transition hover:bg-[var(--accent,#1e8a8a)] hover:text-white"
              >
                <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} />
                {isRtl ? "بیرته ټول البومونه" : "Back to All Albums"}
              </button>
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-[var(--foreground,#111827)] sm:text-4xl md:text-5xl">
                {selectedAlbum.translations?.[language]?.title ||
                  selectedAlbum.translations?.en?.title}
              </h1>
              <p className="mx-auto max-w-2xl font-medium text-[var(--muted,#6b7280)]">
                {selectedAlbum.translations?.[language]?.subtitle ||
                  selectedAlbum.translations?.en?.subtitle}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--foreground,#111827)] sm:text-4xl md:text-5xl">
                {pageT.title}
              </h1>
              <p className="mx-auto max-w-2xl font-medium text-[var(--muted,#6b7280)]">
                {pageT.subtitle}
              </p>
            </div>
          )}
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader />
          </div>
        ) : !selectedAlbum ? (
          /* ALBUMS GRID (1 Blurred Ambient Cover Photo Per Album) */
          albums.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
              <Folder className="mb-3 h-12 w-12 text-[var(--muted,#6b7280)] opacity-40" />
              <h3 className="text-lg font-bold text-[var(--foreground,#111827)]">
                {isRtl ? "هیڅ البوم شتون نلري" : "No albums available"}
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {albums.map((album, idx) => {
                const albT =
                  album.translations?.[language] ||
                  album.translations?.en ||
                  {};
                const cover = album.coverImage || album.images?.[0]?.url;
                const photoCount = album.images?.length || 0;

                return (
                  <article
                    key={album.id || idx}
                    onClick={() => setSelectedAlbum(album)}
                    className="group relative cursor-pointer overflow-hidden rounded-3xl border border-[var(--border,#e5e7eb)] bg-[var(--surface,#ffffff)] shadow-md transition-all duration-500 hover:-translate-y-2 hover:border-[var(--accent,#1e8a8a)]/50 hover:shadow-2xl dark:border-gray-800"
                  >
                    {/* Cover Container with Blurred Ambient Mirror */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/90">
                      {/* 1. Blurred Background Image */}
                      {cover && (
                        <img
                          src={cover}
                          alt=""
                          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-60 blur-xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-80"
                        />
                      )}

                      {/* 2. Main Sharp Cover Photo */}
                      {cover ? (
                        <img
                          src={cover}
                          alt={albT.title || "Album"}
                          className="relative z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/50">
                          No Cover Image
                        </div>
                      )}

                      {/* Dark Gradient */}
                      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                      {/* Photo Count Badge */}
                      <div className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        <Layers
                          size={14}
                          className="text-[var(--accent,#1e8a8a)]"
                        />
                        <span>
                          {photoCount}{" "}
                          {isRtl
                            ? "عکسونه"
                            : photoCount === 1
                              ? "Photo"
                              : "Photos"}
                        </span>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute right-0 bottom-0 left-0 z-30 p-6 text-white">
                        <h3 className="text-2xl font-bold tracking-tight text-white drop-shadow-md transition-colors group-hover:text-[var(--accent,#1e8a8a)]">
                          {albT.title || "Untitled Album"}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-xs text-white/80 drop-shadow">
                          {albT.subtitle || "Click to view full photo gallery."}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : /* INSIDE OPENED ALBUM (Grid of Photos) */
        currentAlbumImages.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
            <ImageIcon className="mb-3 h-12 w-12 text-[var(--muted,#6b7280)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--foreground,#111827)]">
              {isRtl ? "په دې البوم کې عکسونه نشته" : "No photos in this album"}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
            {currentAlbumImages.map((img, i) => (
              <div
                key={img.publicId || i}
                onClick={() => setLightboxIdx(i)}
                className="group relative aspect-[4/5] cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl dark:bg-gray-800"
              >
                <img
                  src={img.url}
                  loading="lazy"
                  alt={`Photo ${i + 1}`}
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

      {/* LIGHTBOX MODAL */}
      {lightboxIdx !== null && currentAlbumImages[lightboxIdx] && (
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

          {currentAlbumImages.length > 1 && (
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
              src={currentAlbumImages[lightboxIdx].url}
              className="animate-in fade-in zoom-in-95 max-h-full max-w-full rounded-xl object-contain shadow-[0_0_40px_rgba(0,0,0,0.5)] duration-300 ease-out select-none"
              alt={`Expanded Photo ${lightboxIdx + 1}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-6 text-sm font-semibold tracking-[0.2em] text-white/70">
            {lightboxIdx + 1} / {currentAlbumImages.length}
          </div>
        </div>
      )}
    </main>
  );
}
