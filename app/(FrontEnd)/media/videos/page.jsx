"use client";

import Loader from "@/app/Components/Loader";
import axios from "axios";
import { Play, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

const API_URL = "/api/media/videos";

// Get saved language from localStorage (Navbar site-language first)
const getSavedLang = () => {
  if (typeof window === "undefined") return "en";
  return (
    localStorage.getItem("site-language") ||
    localStorage.getItem("admin-content-language") ||
    localStorage.getItem("admin-language") ||
    "en"
  );
};

// Extract YouTube ID and generate embed URL & fallback thumbnail
const parseYouTube = (url = "") => {
  if (!url) return { videoId: "", embedUrl: "", fallbackThumb: "" };
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  const videoId = match ? match[1] : "";
  return {
    videoId,
    embedUrl: videoId
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
      : "",
    fallbackThumb: videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : "",
  };
};

export default function VideosPage() {
  const [data, setData] = useState({
    translations: {
      en: {
        tag: "Media Library",
        title: "Video Gallery",
        subtitle: "Explore our curated videos.",
      },
      ps: {
        tag: "د رسنیو کتابتون",
        title: "د ویدیوګانو ګالري",
        subtitle: "زموږ وېډیوګانې وګورئ.",
      },
      fa: {
        tag: "کتابخانه رسانه",
        title: "گالری ویدیوها",
        subtitle: "ویدیوهای برگزیده ما را تماشا کنید.",
      },
    },
    videos: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [language, setLanguage] = useState("en");

  // Sync language with navbar (site-language) & custom events
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
                tag: d.translations?.en?.tag || "",
                title: d.translations?.en?.title || "",
                subtitle: d.translations?.en?.subtitle || "",
              },
              ps: {
                tag: d.translations?.ps?.tag || "",
                title: d.translations?.ps?.title || "",
                subtitle: d.translations?.ps?.subtitle || "",
              },
              fa: {
                tag: d.translations?.fa?.tag || "",
                title: d.translations?.fa?.title || "",
                subtitle: d.translations?.fa?.subtitle || "",
              },
            },
            videos: Array.isArray(d.videos) ? d.videos : [],
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

  // Lock scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = activeVideo ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeVideo]);

  // ESC closes modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActiveVideo(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pageT = data.translations[language] || data.translations.en;
  const isRtl = language === "ps" || language === "fa";
  const videos = data.videos || [];

  return (
    <main
      dir={isRtl ? "rtl" : "ltr"}
      className="relative min-h-screen bg-[var(--background)] pb-24 text-[var(--foreground)] sm:pt-8 sm:pb-6"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--accent,#1e8a8a)]/10 blur-[100px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center sm:mb-16">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[var(--accent,#1e8a8a)] uppercase">
            {pageT.tag || "Media Library"}
          </p>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            {pageT.title || "Video Gallery"}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-[var(--muted,#6b7280)] sm:text-lg">
            {pageT.subtitle || "Explore our curated videos."}
          </p>
        </header>

        {/* Loading State */}
        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <Loader />
          </div>
        ) : videos.length === 0 ? (
          /* Empty State */
          <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center dark:border-gray-800">
            <Video className="mb-3 h-12 w-12 text-[var(--muted,#6b7280)] opacity-40" />
            <h3 className="text-lg font-bold text-[var(--foreground,#111827)]">
              {isRtl ? "هیچ ویدیویی موجود نیست" : "No videos available"}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted,#6b7280)]">
              {isRtl
                ? "ویدیوهای اضافه شده در پنل مدیریت اینجا نمایش داده می‌شوند."
                : "Videos added in the admin dashboard will appear here."}
            </p>
          </div>
        ) : (
          /* Video Grid */
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            {videos.map((video, idx) => {
              const yt = parseYouTube(video.youtubeUrl);
              const vidText =
                video.translations?.[language] || video.translations?.en || {};
              const title = vidText.title || "Untitled Video";
              const subtitle = vidText.subtitle || "";
              const thumbUrl = video.thumbnail?.url || yt.fallbackThumb;

              return (
                <article
                  key={video.id || idx}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveVideo({
                      embedUrl: yt.embedUrl,
                      title,
                      subtitle,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveVideo({
                        embedUrl: yt.embedUrl,
                        title,
                        subtitle,
                      });
                    }
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:border-[var(--accent,#1e8a8a)]/40 hover:shadow-[var(--accent,#1e8a8a)]/10 hover:shadow-xl"
                >
                  {/* Thumbnail 16:9 */}
                  <div className="relative aspect-video w-full overflow-hidden bg-black">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          if (yt.videoId) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${yt.videoId}/hqdefault.jpg`;
                          }
                        }}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/50">
                        No Thumbnail
                      </div>
                    )}

                    {/* Dark Gradient */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

                    {/* Glassmorphism Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-transparent group-hover:bg-[var(--accent,#1e8a8a)] sm:h-16 sm:w-16">
                        <Play className="ml-0.5 h-6 w-6 fill-current sm:h-7 sm:w-7" />
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="relative p-5">
                    <div className="absolute top-0 left-5 h-0.5 w-10 bg-[var(--accent,#1e8a8a)] transition-all duration-300 group-hover:w-16" />
                    <h3 className="mb-1.5 line-clamp-1 text-lg font-bold transition-colors group-hover:text-[var(--accent,#1e8a8a)]">
                      {title}
                    </h3>
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--muted,#6b7280)]">
                      {subtitle}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeVideo && (
        <div
          dir="ltr"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveVideo(null)}
          />

          <button
            type="button"
            onClick={() => setActiveVideo(null)}
            className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/20 hover:text-[var(--accent,#1e8a8a)] sm:top-8 sm:right-8"
            aria-label="Close video"
          >
            <X size={22} />
          </button>

          <div
            className="animate-in fade-in zoom-in-95 relative z-10 w-full max-w-5xl duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              {activeVideo.embedUrl ? (
                <iframe
                  src={activeVideo.embedUrl}
                  title={activeVideo.title}
                  className="h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full items-center justify-center text-white/70">
                  Invalid YouTube URL
                </div>
              )}
            </div>

            <div dir={isRtl ? "rtl" : "ltr"} className="mt-4 px-1 text-white">
              <h2 className="text-xl font-bold sm:text-2xl">
                {activeVideo.title}
              </h2>
              {activeVideo.subtitle && (
                <p className="mt-1 text-sm text-white/70 sm:text-base">
                  {activeVideo.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
