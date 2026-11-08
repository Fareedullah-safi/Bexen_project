"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  LoaderCircle,
  Play,
  Plus,
  Trash2,
  Type,
  Upload,
  Video,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import RichTextEditor from "../shared/RichTextEditor";

const isYouTube = (url = "") =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(
    url?.trim() || "",
  );

// Helper to strip HTML tags (for rich-text validation)
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ==========================================
// HELPERS: Permission check + unified theme
// ==========================================
async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data && data.success === true) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

function cloudinaryStyles(theme) {
  const palettes = {
    dark: {
      window: "#0b1117",
      windowBorder: "#1E8A8A",
      tabIcon: "#35B5B5",
      menuIcons: "#9CA3AF",
      textDark: "#FFFFFF",
      textLight: "#FFFFFF",
      link: "#35B5B5",
      action: "#1E8A8A",
      inactiveTabIcon: "#6B7280",
      error: "#EF4444",
      inProgress: "#35B5B5",
      complete: "#10B981",
      sourceBg: "#111a23",
    },
    light: {
      window: "#FFFFFF",
      windowBorder: "#1E8A8A",
      tabIcon: "#1E8A8A",
      menuIcons: "#4B5563",
      textDark: "#000000",
      textLight: "#FFFFFF",
      link: "#1E8A8A",
      action: "#1E8A8A",
      inactiveTabIcon: "#9CA3AF",
      error: "#EF4444",
      inProgress: "#1E8A8A",
      complete: "#10B981",
      sourceBg: "#F9FAFB",
    },
  };
  return { palette: palettes[theme] || palettes.light };
}

export default function VideoGalleryAdminForm({
  data,
  lang,
  onChange,
  showErrors,
}) {
  const [dark, setDark] = useState(true);
  const [checking, setChecking] = useState(false);

  const currentData = data || {};
  const translations = currentData.translations || {};
  const t = translations[lang] || {};
  const videos = currentData.videos || [];

  const isRtl = lang === "ps" || lang === "fa";
  const dir = isRtl ? "rtl" : "ltr";

  /* ---------- Dark mode detection ---------- */
  useEffect(() => {
    const updateTheme = () =>
      setDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const obs = new MutationObserver(updateTheme);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  // Helpers
  const updatePageField = (field, value) => {
    onChange({
      ...currentData,
      translations: {
        ...translations,
        [lang]: { ...(translations[lang] || {}), [field]: value },
      },
    });
  };

  const updateVideo = (idx, patch) => {
    const newVideos = [...videos];
    newVideos[idx] = { ...newVideos[idx], ...patch };
    onChange({ ...currentData, videos: newVideos });
  };

  const updateVideoText = (idx, field, value) => {
    const newVideos = [...videos];
    const vidTrans = newVideos[idx].translations || {};
    newVideos[idx] = {
      ...newVideos[idx],
      translations: {
        ...vidTrans,
        [lang]: { ...(vidTrans[lang] || {}), [field]: value },
      },
    };
    onChange({ ...currentData, videos: newVideos });
  };

  const addVideo = () => {
    onChange({
      ...currentData,
      videos: [
        ...videos,
        {
          _uid: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          youtubeUrl: "",
          thumbnail: null,
          translations: {},
        },
      ],
    });
  };

  const removeVideo = (idx) => {
    if (!confirm("Remove this video?")) return;
    // Only remove from UI — do NOT delete from Cloudinary
    // Thumbnail stays in Cloudinary so backup/restore always works
    const newVideos = [...videos];
    newVideos.splice(idx, 1);
    onChange({ ...currentData, videos: newVideos });
    toast.success("Video removed from view.");
  };

  const moveVideo = (idx, direction) => {
    const newVideos = [...videos];
    const target = idx + direction;
    if (target < 0 || target >= newVideos.length) return;
    [newVideos[idx], newVideos[target]] = [newVideos[target], newVideos[idx]];
    onChange({ ...currentData, videos: newVideos });
  };

  /* ---------- Upload thumbnail (permission-gated + unified theme) ---------- */
  const uploadThumb = async (idx) => {
    if (!window.cloudinary)
      return toast.error("Cloudinary script not loaded yet.");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return toast.error("Cloudinary environment variables missing.");
    }

    // --- Permission check before opening widget ---
    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    window.cloudinary
      .createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: false,
          folder: "bexon/pages/video-gallery",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5000000,
          styles: cloudinaryStyles(dark ? "dark" : "light"),
        },
        (error, result) => {
          if (error) {
            console.error("Upload Error:", error);
            return;
          }
          if (result.event === "success") {
            // Old thumbnail stays in Cloudinary for backup/restore safety
            updateVideo(idx, {
              thumbnail: {
                url: result.info.secure_url,
                publicId: result.info.public_id,
              },
            });
            toast.success("Thumbnail uploaded successfully.");
          }
        },
      )
      .open();
  };

  // Status Banner validation prep
  const { enMissing, psMissing, faMissing, invalidVideos } =
    VideoGalleryAdminForm.validate(currentData);
  const langStatus = [
    { code: "en", label: "English", hasErr: enMissing },
    { code: "ps", label: "Pashto", hasErr: psMissing },
    { code: "fa", label: "Farsi", hasErr: faMissing },
  ];

  // For plain inputs (YouTube URL)
  const inputClass = (isInvalid) =>
    `w-full rounded-xl border bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:ring-4 ${
      showErrors && isInvalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
        : "border-[var(--border)] focus:border-[var(--accent)] focus:ring-[var(--accent)]/10"
    }`;

  // For rich text editors
  const richWrapperClass = (hasError) =>
    `overflow-hidden rounded-xl border transition focus-within:ring-4 ${
      showErrors && hasError
        ? "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/10"
        : "border-[var(--border)] focus-within:border-[var(--accent)] focus-within:ring-[var(--accent)]/10"
    }`;

  return (
    <div className="space-y-6">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      {/* STATUS BANNER */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 sm:px-6">
        <h3 className="text-sm font-bold text-[var(--foreground)]">
          Completion Status:
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {langStatus.map((l) => (
            <div
              key={l.code}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                l.hasErr
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {l.hasErr ? (
                <AlertCircle size={14} />
              ) : (
                <CheckCircle2 size={14} />
              )}
              {l.label}
            </div>
          ))}
          <div
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              invalidVideos
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {invalidVideos ? (
              <AlertCircle size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            Videos Configuration
          </div>
        </div>
      </div>

      {/* PAGE PRESENTATION TEXT (Rich Text) */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <Type size={18} className="text-[var(--accent)]" />
          <h2 className="font-bold">
            Presentation Text ({lang.toUpperCase()})
          </h2>
        </div>
        <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
              Top Tag
            </label>
            <div className={richWrapperClass(!stripHtml(t.tag))}>
              <RichTextEditor
                value={t.tag || ""}
                onChange={(html) => updatePageField("tag", html)}
                isRtl={isRtl}
                error={showErrors && !stripHtml(t.tag)}
                placeholder="e.g. Media Library"
                minHeight={80}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
              Page Title
            </label>
            <div className={richWrapperClass(!stripHtml(t.title))}>
              <RichTextEditor
                value={t.title || ""}
                onChange={(html) => updatePageField("title", html)}
                isRtl={isRtl}
                error={showErrors && !stripHtml(t.title)}
                placeholder="e.g. Video Gallery"
                minHeight={80}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--foreground)]">
              Page Subtitle
            </label>
            <div className={richWrapperClass(!stripHtml(t.subtitle))}>
              <RichTextEditor
                value={t.subtitle || ""}
                onChange={(html) => updatePageField("subtitle", html)}
                isRtl={isRtl}
                error={showErrors && !stripHtml(t.subtitle)}
                placeholder="Short description..."
                minHeight={80}
              />
            </div>
          </div>
        </div>
      </section>

      {/* VIDEOS */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Videos ({videos.length})</h2>
          </div>
          <button
            type="button"
            onClick={addVideo}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus size={16} /> Add Video
          </button>
        </div>

        <div className="bg-[var(--surface-soft)]/50 p-4 sm:p-6">
          {videos.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-16 text-center">
              <Video
                className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                size={40}
              />
              <p className="text-base text-[var(--muted)]">
                No videos added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              {videos.map((vid, idx) => {
                const vidT = vid.translations?.[lang] || {};

                return (
                  <article
                    key={vid._uid || vid.id || idx}
                    className={`group overflow-hidden rounded-2xl border bg-[var(--surface)] shadow-sm transition hover:shadow-md ${
                      showErrors &&
                      (!vid.youtubeUrl ||
                        !isYouTube(vid.youtubeUrl) ||
                        !vid.thumbnail?.url)
                        ? "border-red-500"
                        : "border-[var(--border)] hover:border-[var(--accent)]/40"
                    }`}
                  >
                    {/* 16:9 THUMBNAIL */}
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {vid.thumbnail?.url ? (
                        <img
                          src={vid.thumbnail.url}
                          alt=""
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-white/50">
                          {showErrors ? (
                            <span className="font-bold text-red-400">
                              Thumbnail Required
                            </span>
                          ) : (
                            "No thumbnail"
                          )}
                        </div>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
                          <Play className="ml-1 h-5 w-5 fill-current" />
                        </div>
                      </div>
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        <Play size={12} className="fill-current" /> YouTube
                      </span>
                      <button
                        type="button"
                        onClick={() => uploadThumb(idx)}
                        disabled={checking}
                        className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-[var(--accent)] disabled:opacity-50"
                      >
                        {checking ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {checking
                          ? "Checking..."
                          : vid.thumbnail?.url
                            ? "Change"
                            : "Upload Image"}
                      </button>
                      <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      {/* YouTube URL — stays as plain input */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          YouTube URL
                        </label>
                        <input
                          dir="ltr"
                          value={vid.youtubeUrl || ""}
                          onChange={(e) =>
                            updateVideo(idx, { youtubeUrl: e.target.value })
                          }
                          className={inputClass(
                            !vid.youtubeUrl || !isYouTube(vid.youtubeUrl),
                          )}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      {/* Video Title (Rich Text) */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Title ({lang.toUpperCase()})
                        </label>
                        <div
                          className={richWrapperClass(!stripHtml(vidT.title))}
                        >
                          <RichTextEditor
                            value={vidT.title || ""}
                            onChange={(html) =>
                              updateVideoText(idx, "title", html)
                            }
                            isRtl={isRtl}
                            error={showErrors && !stripHtml(vidT.title)}
                            placeholder="Video title"
                            minHeight={80}
                          />
                        </div>
                      </div>

                      {/* Video Description (Rich Text) */}
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Description ({lang.toUpperCase()})
                        </label>
                        <div
                          className={richWrapperClass(
                            !stripHtml(vidT.subtitle),
                          )}
                        >
                          <RichTextEditor
                            value={vidT.subtitle || ""}
                            onChange={(html) =>
                              updateVideoText(idx, "subtitle", html)
                            }
                            isRtl={isRtl}
                            error={showErrors && !stripHtml(vidT.subtitle)}
                            placeholder="Detailed description..."
                            minHeight={120}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveVideo(idx, -1)}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                          >
                            <ArrowLeft size={16} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === videos.length - 1}
                            onClick={() => moveVideo(idx, 1)}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVideo(idx)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={addVideo}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-3 text-base font-bold text-[var(--accent)] backdrop-blur-sm transition-all hover:bg-[var(--accent)] hover:text-white"
          >
            <Plus size={22} />
            Add Another Video
          </button>
        </div>
      </section>
    </div>
  );
}

// Static validator for the parent builder (strip HTML first)
VideoGalleryAdminForm.validate = function (data = {}) {
  const translations = data.translations || {};
  const videos = data.videos || [];

  const checkLang = (code) => {
    const t = translations[code] || {};
    if (!stripHtml(t.tag) || !stripHtml(t.title) || !stripHtml(t.subtitle))
      return true;

    for (const v of videos) {
      const vt = v.translations?.[code] || {};
      if (!stripHtml(vt.title) || !stripHtml(vt.subtitle)) return true;
    }
    return false;
  };

  const enMissing = checkLang("en");
  const psMissing = checkLang("ps");
  const faMissing = checkLang("fa");

  let invalidVideos = false;
  for (const v of videos) {
    if (!v.youtubeUrl || !isYouTube(v.youtubeUrl) || !v.thumbnail?.url) {
      invalidVideos = true;
      break;
    }
  }

  const isValid = !enMissing && !psMissing && !faMissing && !invalidVideos;
  return { isValid, enMissing, psMissing, faMissing, invalidVideos };
};
