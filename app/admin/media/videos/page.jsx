"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Loader2,
  Play,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
  Video,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/media/videos";
const LANGS = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyPage = () => ({ tag: "", title: "", subtitle: "" });
const emptyVidText = () => ({ title: "", subtitle: "" });

const newVideo = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
  youtubeUrl: "",
  thumbnail: { url: "", publicId: "" },
  translations: {
    en: emptyVidText(),
    ps: emptyVidText(),
    fa: emptyVidText(),
  },
});

const isYouTube = (url = "") =>
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i.test(url.trim());

export default function VideoGalleryAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErr, setLangErr] = useState({ en: false, ps: false, fa: false });
  const [data, setData] = useState({
    translations: { en: emptyPage(), ps: emptyPage(), fa: emptyPage() },
    videos: [],
  });

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const d = res.data?.data;
        if (!d) return;
        setData({
          translations: {
            en: { ...emptyPage(), ...d.translations?.en },
            ps: { ...emptyPage(), ...d.translations?.ps },
            fa: { ...emptyPage(), ...d.translations?.fa },
          },
          videos: Array.isArray(d.videos) ? d.videos : [],
        });
      })
      .catch(() => toast.error("Failed to load videos."))
      .finally(() => setLoading(false));
  }, []);

  // Same pattern as FAQSectionAdmin — ball + tabs stay in sync
  const changeLanguage = (code) => {
    if (!LANGS.some((l) => l.code === code)) return;
    setLanguage(code);
    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}
    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  };

  const setPageField = (name, value) => {
    setData((p) => ({
      ...p,
      translations: {
        ...p.translations,
        [language]: { ...p.translations[language], [name]: value },
      },
    }));
    setLangErr((p) => ({ ...p, [language]: false }));
  };

  const setVideo = (idx, patch) => {
    setData((p) => {
      const videos = [...p.videos];
      videos[idx] = { ...videos[idx], ...patch };
      return { ...p, videos };
    });
  };

  const setVideoText = (idx, name, value) => {
    setData((p) => {
      const videos = [...p.videos];
      videos[idx] = {
        ...videos[idx],
        translations: {
          ...videos[idx].translations,
          [language]: {
            ...videos[idx].translations[language],
            [name]: value,
          },
        },
      };
      return { ...p, videos };
    });
  };

  const moveVideo = (idx, dir) => {
    setData((p) => {
      const videos = [...p.videos];
      const j = idx + dir;
      if (j < 0 || j >= videos.length) return p;
      [videos[idx], videos[j]] = [videos[j], videos[idx]];
      return { ...p, videos };
    });
  };

  const addNewVideo = () => {
    setData((p) => ({ ...p, videos: [...p.videos, newVideo()] }));
  };

  const removeVideo = async (idx) => {
    if (!confirm("Permanently delete this video?")) return;
    const vid = data.videos[idx];
    setSaving(true);
    try {
      if (vid.id && vid.id.length > 15) {
        const res = await axios.post(API_URL, {
          action: "deleteVideo",
          videoId: vid.id,
          publicId: vid.thumbnail?.publicId,
        });
        if (!res.data?.success) throw new Error("Delete failed");
        setData((p) => ({ ...p, videos: res.data.data.videos || [] }));
      } else {
        setData((p) => ({
          ...p,
          videos: p.videos.filter((_, i) => i !== idx),
        }));
      }
      toast.success("Video deleted.");
    } catch {
      toast.error("Failed to delete video.");
    } finally {
      setSaving(false);
    }
  };

  const uploadThumb = (idx) => {
    if (!window.cloudinary) return toast.error("Cloudinary is loading...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary keys missing.");

    window.cloudinary
      .createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: false,
          folder: "bexon/videos",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5 * 1024 * 1024,
        },
        (err, result) => {
          if (err) return toast.error("Upload failed.");
          if (result?.event === "success") {
            setVideo(idx, {
              thumbnail: {
                url: result.info.secure_url,
                publicId: result.info.public_id,
              },
            });
            toast.success("Thumbnail uploaded.");
          }
        },
      )
      .open();
  };

  const handleSave = async () => {
    const errs = { en: false, ps: false, fa: false };
    let firstBad = null;

    for (const { code } of LANGS) {
      const t = data.translations[code];
      if (!t.tag?.trim() || !t.title?.trim() || !t.subtitle?.trim()) {
        errs[code] = true;
        if (!firstBad) firstBad = code;
      }
    }
    setLangErr(errs);
    if (firstBad) {
      changeLanguage(firstBad);
      return toast.error(
        `Fill page Tag, Title & Subtitle in ${firstBad.toUpperCase()}`,
      );
    }

    for (let i = 0; i < data.videos.length; i++) {
      const v = data.videos[i];
      if (!v.youtubeUrl?.trim() || !isYouTube(v.youtubeUrl)) {
        return toast.error(`Video #${i + 1}: valid YouTube URL required.`);
      }
      if (!v.thumbnail?.url) {
        return toast.error(`Video #${i + 1}: thumbnail required.`);
      }
      for (const { code } of LANGS) {
        if (!v.translations?.[code]?.title?.trim()) {
          changeLanguage(code);
          return toast.error(
            `Video #${i + 1}: title required in ${code.toUpperCase()}`,
          );
        }
        if (!v.translations?.[code]?.subtitle?.trim()) {
          changeLanguage(code);
          return toast.error(
            `Video #${i + 1}: description required in ${code.toUpperCase()}`,
          );
        }
      }
    }

    setSaving(true);
    try {
      const res = await axios.post(API_URL, data);
      if (!res.data?.success)
        throw new Error(res.data?.message || "Save failed");
      toast.success("Video gallery saved successfully.");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  const t = data.translations[language];
  const dir = language === "en" ? "ltr" : "rtl";
  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";

  return (
    <div className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5 lg:p-8">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Media Library
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Video Gallery Admin
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Curate page copy, YouTube links, and Cloudinary thumbnails.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              {LANGS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => changeLanguage(item.code)}
                  className={`relative rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    language === item.code
                      ? "bg-[var(--accent)] text-white shadow"
                      : "text-[var(--muted)] hover:bg-[var(--accent)]/10"
                  }`}
                >
                  {item.label}
                  {langErr[item.code] && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>

            <AdminLanguageBall
              language={language}
              onLanguageChange={changeLanguage}
            />
          </div>
        </header>

        {/* PAGE PRESENTATION */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Type size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">
              Presentation Text ({language.toUpperCase()})
            </h2>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Top Tag *
              </label>
              <input
                dir={dir}
                value={t.tag}
                onChange={(e) => setPageField("tag", e.target.value)}
                className={inputClass}
                placeholder="e.g. Media Library"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Page Title *
              </label>
              <input
                dir={dir}
                value={t.title}
                onChange={(e) => setPageField("title", e.target.value)}
                className={inputClass}
                placeholder="e.g. Video Gallery"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Page Subtitle *
              </label>
              <input
                dir={dir}
                value={t.subtitle}
                onChange={(e) => setPageField("subtitle", e.target.value)}
                className={inputClass}
                placeholder="Short description..."
              />
            </div>
          </div>
        </section>

        {/* VIDEOS */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <LayoutGrid size={18} className="text-[var(--accent)]" />
              <h2 className="font-bold">Videos ({data.videos.length})</h2>
            </div>
            <button
              type="button"
              onClick={addNewVideo}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Plus size={16} /> Add Video
            </button>
          </div>

          <div className="bg-[var(--surface-soft)]/50 p-4 sm:p-6">
            {data.videos.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-16 text-center">
                <Video
                  className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                  size={40}
                />
                <p className="text-base text-[var(--muted)]">No videos yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {data.videos.map((vid, idx) => (
                  <article
                    key={vid.id}
                    className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md"
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
                          No thumbnail
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
                        className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-[var(--accent)]"
                      >
                        <Upload size={14} />
                        {vid.thumbnail?.url ? "Change" : "Upload Image"}
                      </button>
                      <span className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="space-y-4 p-5">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          YouTube URL *
                        </label>
                        <input
                          dir="ltr"
                          value={vid.youtubeUrl}
                          onChange={(e) =>
                            setVideo(idx, { youtubeUrl: e.target.value })
                          }
                          className={inputClass}
                          placeholder="https://www.youtube.com/watch?v=..."
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Title ({language.toUpperCase()}) *
                        </label>
                        <input
                          dir={dir}
                          value={vid.translations?.[language]?.title || ""}
                          onChange={(e) =>
                            setVideoText(idx, "title", e.target.value)
                          }
                          className={inputClass}
                          placeholder="Video title"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Description ({language.toUpperCase()}) *
                        </label>
                        <textarea
                          dir={dir}
                          rows={3}
                          value={vid.translations?.[language]?.subtitle || ""}
                          onChange={(e) =>
                            setVideoText(idx, "subtitle", e.target.value)
                          }
                          className={`${inputClass} min-h-[90px] resize-y`}
                          placeholder="Detailed description..."
                        />
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
                            disabled={idx === data.videos.length - 1}
                            onClick={() => moveVideo(idx, 1)}
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => removeVideo(idx)}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addNewVideo}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-3 text-base font-bold text-[var(--accent)] backdrop-blur-sm transition-all hover:bg-[var(--accent)] hover:text-white"
            >
              <Plus size={22} />
              Add Another Video
            </button>
          </div>
        </section>

        {/* STICKY SAVE */}
        <div className="sticky bottom-3 z-40 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Editing:{" "}
            <span className="font-semibold text-[var(--accent)]">
              {LANGS.find((l) => l.code === language)?.label}
            </span>
            {" · "}
            {data.videos.length} video{data.videos.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}
