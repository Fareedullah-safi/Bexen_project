"use client";

import { Play, Video, X } from "lucide-react";
import { useEffect, useState } from "react";

/* Helper to strip HTML tags for empty checks & image alt text */
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

const VIDEO_GALLERY_STYLES = `
  .rt-inline p { display: inline; margin: 0; }
  .rt-desc p { margin: 0 0 0.5em 0; }
  .rt-desc p:last-child { margin-bottom: 0; }
  .rt-desc strong, .rt-desc b { font-weight: 700; color: inherit; }
  .rt-desc em, .rt-desc i { font-style: italic; }
  .rt-desc a { color: #1e8a8a; text-decoration: underline; text-underline-offset: 2px; }
  .rt-desc ul, .rt-desc ol { margin: 0.4em 0; padding-inline-start: 1.2em; }
  .rt-desc li { margin-bottom: 0.2em; }
`;

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

export default function VideoGalleryView({ data, lang }) {
  const [activeVideo, setActiveVideo] = useState(null);

  // Load data from CMS props
  const pageT = data?.translations?.[lang] || data?.translations?.en || {};
  const isRtl = lang === "ps" || lang === "fa";
  const videos = Array.isArray(data?.videos) ? data.videos : [];

  const tagRaw = pageT.tag || "Media Library";
  const titleRaw = pageT.title || "Video Gallery";
  const subtitleRaw = pageT.subtitle || "Explore our curated videos.";

  const tagText = stripHtml(tagRaw);
  const titleText = stripHtml(titleRaw);
  const subtitleText = stripHtml(subtitleRaw);

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

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="relative bg-[var(--background)] pb-24 text-[var(--foreground)] sm:pt-8 sm:pb-6"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[var(--accent,#1e8a8a)]/10 blur-[100px]"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-12 text-center sm:mb-16">
          {tagText && (
            <div
              className="rt-inline mb-3 text-xs font-bold tracking-[0.2em] text-[var(--accent,#1e8a8a)] uppercase"
              dangerouslySetInnerHTML={{ __html: tagRaw }}
            />
          )}
          {titleText && (
            <div
              role="heading"
              aria-level={1}
              className="rt-inline mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              dangerouslySetInnerHTML={{ __html: titleRaw }}
            />
          )}
          {subtitleText && (
            <div
              className="rt-desc mx-auto max-w-2xl text-base text-[var(--muted,#6b7280)] sm:text-lg"
              dangerouslySetInnerHTML={{ __html: subtitleRaw }}
            />
          )}
        </header>

        {videos.length === 0 ? (
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
                video.translations?.[lang] || video.translations?.en || {};
              const titleHtml = vidText.title || "Untitled Video";
              const subtitleHtml = vidText.subtitle || "";

              const titlePlain = stripHtml(titleHtml);
              const subtitlePlain = stripHtml(subtitleHtml);

              const thumbUrl = video.thumbnail?.url || yt.fallbackThumb;

              return (
                <article
                  key={video._uid || video.id || idx}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    setActiveVideo({
                      embedUrl: yt.embedUrl,
                      titleHtml,
                      subtitleHtml,
                      titlePlain,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveVideo({
                        embedUrl: yt.embedUrl,
                        titleHtml,
                        subtitleHtml,
                        titlePlain,
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
                        alt={titlePlain || "Video thumbnail"}
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
                    {titlePlain && (
                      <div
                        className="rt-inline mb-1.5 line-clamp-1 text-lg font-bold transition-colors group-hover:text-[var(--accent,#1e8a8a)]"
                        dangerouslySetInnerHTML={{ __html: titleHtml }}
                      />
                    )}
                    {subtitlePlain && (
                      <div
                        className="rt-desc line-clamp-2 text-sm leading-relaxed text-[var(--muted,#6b7280)]"
                        dangerouslySetInnerHTML={{ __html: subtitleHtml }}
                      />
                    )}
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
                  title={activeVideo.titlePlain || "YouTube Video"}
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
              <div
                className="rt-inline text-xl font-bold sm:text-2xl"
                dangerouslySetInnerHTML={{ __html: activeVideo.titleHtml }}
              />
              {activeVideo.subtitleHtml && (
                <div
                  className="rt-desc mt-1 text-sm text-white/70 sm:text-base"
                  dangerouslySetInnerHTML={{
                    __html: activeVideo.subtitleHtml,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS styles */}
      <style dangerouslySetInnerHTML={{ __html: VIDEO_GALLERY_STYLES }} />
    </section>
  );
}
