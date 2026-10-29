"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  LayoutGrid,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/media/albums";
const LANGS = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyText = () => ({ title: "", subtitle: "" });
const newAlbum = () => ({
  id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
  coverImage: "",
  translations: { en: emptyText(), ps: emptyText(), fa: emptyText() },
  images: [],
});

export default function GalleryAlbumsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErr, setLangErr] = useState({ en: false, ps: false, fa: false });
  const [data, setData] = useState({
    translations: { en: emptyText(), ps: emptyText(), fa: emptyText() },
    albums: [],
  });

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const d = res.data?.data;
        if (!d) return;
        setData({
          translations: {
            en: { ...emptyText(), ...d.translations?.en },
            ps: { ...emptyText(), ...d.translations?.ps },
            fa: { ...emptyText(), ...d.translations?.fa },
          },
          albums: Array.isArray(d.albums) ? d.albums : [],
        });
      })
      .catch(() => toast.error("Failed to load album data."))
      .finally(() => setLoading(false));
  }, []);

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

  const setAlbumText = (albumIdx, name, value) => {
    setData((p) => {
      const albums = [...p.albums];
      albums[albumIdx] = {
        ...albums[albumIdx],
        translations: {
          ...albums[albumIdx].translations,
          [language]: {
            ...albums[albumIdx].translations[language],
            [name]: value,
          },
        },
      };
      return { ...p, albums };
    });
  };

  const addAlbum = () => {
    setData((p) => ({ ...p, albums: [...p.albums, newAlbum()] }));
  };

  const moveAlbum = (idx, dir) => {
    setData((p) => {
      const albums = [...p.albums];
      const j = idx + dir;
      if (j < 0 || j >= albums.length) return p;
      [albums[idx], albums[j]] = [albums[j], albums[idx]];
      return { ...p, albums };
    });
  };

  const removeAlbum = async (idx) => {
    if (
      !confirm("Are you sure you want to delete this album and all its photos?")
    )
      return;
    setData((p) => ({
      ...p,
      albums: p.albums.filter((_, i) => i !== idx),
    }));
    toast.success("Album removed.");
  };

  const uploadAlbumImages = (albumIdx) => {
    if (!window.cloudinary) return toast.error("Cloudinary widget loading...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary keys missing.");

    window.cloudinary
      .createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: true,
          folder: "bexon/albums",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        },
        (err, result) => {
          if (err) return toast.error("Upload error.");
          if (result?.event === "success") {
            const newImg = {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            };
            setData((p) => {
              const albums = [...p.albums];
              const target = albums[albumIdx];
              const updatedImages = [...target.images, newImg];
              albums[albumIdx] = {
                ...target,
                coverImage: target.coverImage || newImg.url,
                images: updatedImages,
              };
              return { ...p, albums };
            });
            toast.success("Image added to album.");
          }
        },
      )
      .open();
  };

  const removeImageFromAlbum = async (albumIdx, imgIdx) => {
    const img = data.albums[albumIdx].images[imgIdx];
    if (img.publicId) {
      axios.post(API_URL, { publicId: img.publicId }).catch(() => {});
    }
    setData((p) => {
      const albums = [...p.albums];
      const updatedImages = albums[albumIdx].images.filter(
        (_, i) => i !== imgIdx,
      );
      albums[albumIdx] = {
        ...albums[albumIdx],
        coverImage: updatedImages[0]?.url || "",
        images: updatedImages,
      };
      return { ...p, albums };
    });
  };

  const handleSave = async () => {
    const errs = { en: false, ps: false, fa: false };
    let firstBad = null;

    for (const { code } of LANGS) {
      const t = data.translations[code];
      if (!t.title?.trim() || !t.subtitle?.trim()) {
        errs[code] = true;
        if (!firstBad) firstBad = code;
      }
    }

    setLangErr(errs);
    if (firstBad) {
      changeLanguage(firstBad);
      return toast.error(
        `Please fill Page Title & Subtitle in ${firstBad.toUpperCase()}`,
      );
    }

    for (let i = 0; i < data.albums.length; i++) {
      const alb = data.albums[i];
      for (const { code } of LANGS) {
        if (!alb.translations?.[code]?.title?.trim()) {
          changeLanguage(code);
          return toast.error(
            `Album #${i + 1}: Title required in ${code.toUpperCase()}`,
          );
        }
      }
      if (alb.images.length === 0) {
        return toast.error(`Album #${i + 1}: At least 1 image is required.`);
      }
    }

    setSaving(true);
    try {
      const res = await axios.post(API_URL, data);
      if (!res.data?.success)
        throw new Error(res.data?.message || "Save failed");
      toast.success("Albums gallery updated successfully!");
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
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10";
  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--foreground)]";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      {/* tighter main — old admin style, less top/left padding */}
      <div className="mx-auto max-w-6xl space-y-5">
        {/* HEADER */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start lg:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Media Library
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Photo Albums Admin
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Organize photos into titled albums with ambient cover blurs.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <AdminLanguageBall
              language={language}
              onLanguageChange={changeLanguage}
            />
            <div className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-1.5 shadow-sm sm:w-auto">
              {LANGS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => changeLanguage(item.code)}
                  disabled={saving}
                  className={`relative flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-60 sm:flex-none ${
                    language === item.code
                      ? "bg-[var(--accent)] text-white shadow-md"
                      : "text-[var(--muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                  }`}
                >
                  {item.label}
                  {langErr[item.code] && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* PAGE PRESENTATION */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Type size={18} className="text-[var(--accent)]" />
              Main Gallery Title ({language.toUpperCase()})
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Editing: {LANGS.find((l) => l.code === language)?.label}
            </p>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className={labelClass}>
                Page Title <span className="text-red-500">*</span>
              </label>
              <input
                dir={dir}
                value={t.title}
                onChange={(e) => setPageField("title", e.target.value)}
                className={inputClass}
                placeholder="e.g. Photo Albums"
              />
            </div>
            <div>
              <label className={labelClass}>
                Page Subtitle <span className="text-red-500">*</span>
              </label>
              <input
                dir={dir}
                value={t.subtitle}
                onChange={(e) => setPageField("subtitle", e.target.value)}
                className={inputClass}
                placeholder="e.g. Select an album to explore photo collections."
              />
            </div>
          </div>
        </section>

        {/* ALBUMS LIST */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <FolderPlus size={18} className="text-[var(--accent)]" />
              <h2 className="font-semibold">Albums ({data.albums.length})</h2>
            </div>
            <button
              type="button"
              onClick={addAlbum}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#249b98]"
            >
              <Plus size={16} /> Add Album
            </button>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {data.albums.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-14 text-center">
                <LayoutGrid
                  className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                  size={40}
                />
                <p className="text-sm text-[var(--muted)]">
                  No albums created yet.
                </p>
              </div>
            ) : (
              data.albums.map((album, albumIdx) => {
                const albT = album.translations?.[language] || {};
                return (
                  <article
                    key={album.id}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 sm:px-5">
                      <span className="text-sm font-bold text-[var(--accent)]">
                        Album #{albumIdx + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={albumIdx === 0}
                          onClick={() => moveAlbum(albumIdx, -1)}
                          className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <button
                          type="button"
                          disabled={albumIdx === data.albums.length - 1}
                          onClick={() => moveAlbum(albumIdx, 1)}
                          className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                        >
                          <ArrowRight size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAlbum(albumIdx)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 p-4 sm:p-5">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                            Album Title ({language.toUpperCase()}) *
                          </label>
                          <input
                            dir={dir}
                            value={albT.title || ""}
                            onChange={(e) =>
                              setAlbumText(albumIdx, "title", e.target.value)
                            }
                            className={inputClass}
                            placeholder="e.g. Nature & Landscapes"
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                            Album Subtitle ({language.toUpperCase()})
                          </label>
                          <input
                            dir={dir}
                            value={albT.subtitle || ""}
                            onChange={(e) =>
                              setAlbumText(albumIdx, "subtitle", e.target.value)
                            }
                            className={inputClass}
                            placeholder="e.g. Breathtaking views."
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <label className="text-xs font-semibold text-[var(--muted)]">
                            Photos ({album.images.length})
                          </label>
                          <button
                            type="button"
                            onClick={() => uploadAlbumImages(albumIdx)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
                          >
                            <Upload size={14} /> Add Photos
                          </button>
                        </div>

                        {album.images.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-[var(--border)] p-5 text-center text-xs text-[var(--muted)]">
                            No photos yet. Click &quot;Add Photos&quot;.
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                            {album.images.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
                                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border)] bg-black"
                              >
                                <img
                                  src={img.url}
                                  alt=""
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                                {imgIdx === 0 && (
                                  <span className="absolute top-1 left-1 rounded bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-bold text-white">
                                    Cover
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeImageFromAlbum(albumIdx, imgIdx)
                                  }
                                  className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}

            <button
              type="button"
              onClick={addAlbum}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-4 text-sm font-bold text-[var(--accent)] transition-all hover:bg-[var(--accent)] hover:text-white"
            >
              <Plus size={18} />
              Add Another Album
            </button>
          </div>
        </section>

        {/* STICKY SAVE — same pattern as Image Gallery Admin */}
        <footer className="sticky bottom-3 z-40 mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-5">
          <p className="text-xs text-[var(--muted)]">
            Editing:{" "}
            <span className="font-semibold text-[var(--accent)]">
              {LANGS.find((l) => l.code === language)?.label}
            </span>
            {" · "}
            {data.albums.length} album{data.albums.length === 1 ? "" : "s"}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={17} />
                Save All Albums
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
