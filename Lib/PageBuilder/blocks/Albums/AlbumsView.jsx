"use client";

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

export default function AlbumsView({ data, lang }) {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const pageT = data?.translations?.[lang] || data?.translations?.en || {};
  const isRtl = lang === "ps" || lang === "fa";
  const albums = Array.isArray(data?.albums) ? data.albums : [];
  const currentAlbumImages = selectedAlbum ? selectedAlbum.images || [] : [];

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
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIdx]);

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[var(--background,#f9fafb)] px-4 pt-6 pb-8 transition-colors duration-300 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[90rem]">
        {/* Header — matches screenshot type */}
        <header className="mb-12 text-center sm:mb-14">
          {selectedAlbum ? (
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedAlbum(null);
                  setLightboxIdx(null);
                }}
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--border,#e5e7eb)] bg-[var(--surface,#ffffff)] px-4 py-2 text-sm font-semibold text-[var(--accent,#1e8a8a)] shadow-sm transition hover:bg-[var(--accent,#1e8a8a)] hover:text-white"
              >
                <ArrowLeft size={16} className={isRtl ? "rotate-180" : ""} />
                {isRtl ? "بیرته ټول البومونه" : "Back to All Albums"}
              </button>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--foreground,#0f172a)] sm:text-4xl md:text-5xl">
                {selectedAlbum.translations?.[lang]?.title ||
                  selectedAlbum.translations?.en?.title ||
                  "Album"}
              </h2>
              <p className="mx-auto max-w-2xl text-base text-[var(--muted,#64748b)] sm:text-lg">
                {selectedAlbum.translations?.[lang]?.subtitle ||
                  selectedAlbum.translations?.en?.subtitle ||
                  ""}
              </p>
            </div>
          ) : (
            <div>
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[var(--foreground,#0f172a)] sm:text-4xl md:text-5xl">
                {pageT.title || "Photo Albums"}
              </h2>
              <p className="mx-auto max-w-2xl text-base text-[var(--muted,#64748b)] sm:text-lg">
                {pageT.subtitle ||
                  "Explore our curated photo collections and event highlights."}
              </p>
            </div>
          )}
        </header>

        {!selectedAlbum ? (
          albums.length === 0 ? (
            <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center dark:border-gray-800">
              <Folder className="mb-3 h-12 w-12 text-[var(--muted)] opacity-40" />
              <h3 className="text-lg font-bold text-[var(--foreground)]">
                {isRtl ? "هیڅ البوم شتون نلري" : "No albums available"}
              </h3>
            </div>
          ) : (
            /* Album cards — screenshot type */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
              {albums.map((album, idx) => {
                const albT =
                  album.translations?.[lang] || album.translations?.en || {};
                const cover =
                  album.coverImage?.url ||
                  album.coverImage ||
                  album.images?.[0]?.url ||
                  "";
                const photoCount = album.images?.length || 0;

                return (
                  <article
                    key={album._uid || album.id || idx}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAlbum(album)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedAlbum(album);
                      }
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-[1.35rem] border border-black/5 bg-[var(--surface,#fff)] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgb(0,0,0,0.1)] dark:border-white/10"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                      {cover && (
                        <img
                          src={cover}
                          alt=""
                          aria-hidden
                          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-50 blur-2xl transition-all duration-700 group-hover:scale-150 group-hover:opacity-70"
                        />
                      )}

                      {cover ? (
                        <img
                          src={cover}
                          alt={albT.title || "Album"}
                          className="relative z-10 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/40">
                          No Cover Image
                        </div>
                      )}

                      <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                      {/* Photo count pill */}
                      <div className="absolute top-4 right-4 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        <Layers
                          size={13}
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

                      {/* Title overlay */}
                      <div className="absolute inset-x-0 bottom-0 z-30 p-5 sm:p-6">
                        <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-md sm:text-2xl">
                          {albT.title || "Untitled Album"}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/80">
                          {albT.subtitle || ""}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )
        ) : currentAlbumImages.length === 0 ? (
          <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 p-10 text-center dark:border-gray-800">
            <ImageIcon className="mb-3 h-12 w-12 text-[var(--muted)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">
              {isRtl ? "په دې البوم کې عکسونه نشته" : "No photos in this album"}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
            {currentAlbumImages.map((img, i) => (
              <button
                type="button"
                key={img._uid || img.publicId || i}
                onClick={() => setLightboxIdx(i)}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-100 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:bg-gray-800"
              >
                <img
                  src={img.url}
                  loading="lazy"
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ZoomIn
                    className="h-10 w-10 scale-75 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-100"
                    strokeWidth={1.5}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIdx !== null && currentAlbumImages[lightboxIdx] && (
        <div
          dir="ltr"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setLightboxIdx(null)}
            className="absolute top-6 right-6 z-20 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X size={32} />
          </button>

          {currentAlbumImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nav(isRtl ? 1 : -1);
                }}
                className="absolute left-2 z-20 rounded-full p-3 text-white/60 transition hover:scale-110 hover:bg-white/10 hover:text-white lg:left-8"
                aria-label="Previous"
              >
                <ChevronLeft size={44} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nav(isRtl ? -1 : 1);
                }}
                className="absolute right-2 z-20 rounded-full p-3 text-white/60 transition hover:scale-110 hover:bg-white/10 hover:text-white lg:right-8"
                aria-label="Next"
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
              alt=""
              className="max-h-full max-w-full rounded-xl object-contain shadow-[0_0_40px_rgba(0,0,0,0.5)] select-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="absolute bottom-6 text-sm font-semibold tracking-[0.2em] text-white/70">
            {lightboxIdx + 1} / {currentAlbumImages.length}
          </div>
        </div>
      )}
    </section>
  );
}
