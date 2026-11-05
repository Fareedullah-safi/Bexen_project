/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FolderPlus,
  LayoutGrid,
  LoaderCircle,
  Plus,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SCRIPT = "script[data-cloudinary-widget]";

const emptyText = () => ({ title: "", subtitle: "" });

const newAlbum = () => ({
  _uid: `alb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, // stable key
  coverImage: "",
  translations: { en: emptyText(), ps: emptyText(), fa: emptyText() },
  images: [],
});

// ==========================================
// 1. STATIC VALIDATION (Exported for Parent)
// ==========================================
export function validateAlbums(data = {}) {
  const albums = data?.albums || [];
  const noAlbums = albums.length === 0;

  const checkLang = (code) => {
    const missing = [];
    const t = data?.translations?.[code] || {};
    if (!t.title?.trim()) missing.push("Page Title");
    if (!t.subtitle?.trim()) missing.push("Page Subtitle");

    albums.forEach((alb, i) => {
      if (!alb.translations?.[code]?.title?.trim())
        missing.push(`Album #${i + 1} Title`);
    });
    return missing;
  };

  const enMissing = checkLang("en");
  const psMissing = checkLang("ps");
  const faMissing = checkLang("fa");

  const missingImages = [];
  albums.forEach((alb, i) => {
    if (!alb.images || alb.images.length === 0)
      missingImages.push(`Album #${i + 1} Photos`);
  });

  return {
    isValid:
      !noAlbums &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0 &&
      missingImages.length === 0,
    noAlbums,
    enMissing,
    psMissing,
    faMissing,
    missingImages,
  };
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function AlbumsAdminForm({
  data = {},
  lang = "en",
  onChange = () => {},
  showErrors = false,
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploadingAlbumIdx, setUploadingAlbumIdx] = useState(null);
  const [deletingAlbumIdx, setDeletingAlbumIdx] = useState(null);
  const widgetRef = useRef(null);

  // Fresh data ref for Cloudinary callbacks
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Ensure data structure exists
  const currentData = {
    translations: {
      en: emptyText(),
      ps: emptyText(),
      fa: emptyText(),
      ...(data.translations || {}),
    },
    albums: Array.isArray(data.albums) ? data.albums : [],
  };

  const t = currentData.translations[lang] || emptyText();
  const dir = lang === "en" ? "ltr" : "rtl";
  const valResult = validateAlbums(data);
  const hasAnyError = showErrors && !valResult.isValid;

  const isErr = (val) => showErrors && !String(val || "").trim();

  /* ---------- Dark Mode & Script Loader ---------- */
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

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    let script = document.querySelector(SCRIPT);
    const checkReady = () => {
      if (window.cloudinary?.createUploadWidget) setReady(true);
    };

    if (window.cloudinary?.createUploadWidget) {
      setReady(true);
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        script.dataset.cloudinaryWidget = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", checkReady);
    }
    return () => {
      isMountedRef.current = false;
      script?.removeEventListener("load", checkReady);
      try {
        widgetRef.current?.close?.();
        widgetRef.current?.destroy?.();
      } catch {}
    };
  }, []);

  /* ---------- Handlers (Exact match to your snippet) ---------- */
  const setPageField = (name, value) => {
    onChange({
      ...currentData,
      translations: {
        ...currentData.translations,
        [lang]: { ...currentData.translations[lang], [name]: value },
      },
    });
  };

  const setAlbumText = (albumIdx, name, value) => {
    const albums = [...currentData.albums];
    albums[albumIdx] = {
      ...albums[albumIdx],
      translations: {
        ...albums[albumIdx].translations,
        [lang]: {
          ...(albums[albumIdx].translations?.[lang] || emptyText()),
          [name]: value,
        },
      },
    };
    onChange({ ...currentData, albums });
  };

  const addAlbum = () => {
    onChange({ ...currentData, albums: [...currentData.albums, newAlbum()] });
  };

  const moveAlbum = (idx, direction) => {
    const albums = [...currentData.albums];
    const j = idx + direction;
    if (j < 0 || j >= albums.length) return;
    [albums[idx], albums[j]] = [albums[j], albums[idx]];
    onChange({ ...currentData, albums });
  };

  const removeAlbum = async (idx) => {
    if (deletingAlbumIdx !== null || uploadingAlbumIdx !== null) return;
    if (
      !confirm("Are you sure you want to delete this album and all its photos?")
    )
      return;

    setDeletingAlbumIdx(idx);
    const albumToRemove = currentData.albums[idx];

    // Cleanup images from Cloudinary
    if (albumToRemove?.images?.length) {
      for (const img of albumToRemove.images) {
        if (img.publicId) {
          fetch("/api/admin/cloudinary/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: img.publicId }),
          }).catch(() => {});
        }
      }
    }

    onChange({
      ...currentData,
      albums: currentData.albums.filter((_, i) => i !== idx),
    });
    setDeletingAlbumIdx(null);
    toast.success("Album removed.");
  };

  /* ---------- Cloudinary Widget (Exact match to your snippet behavior) ---------- */
  const uploadAlbumImages = (albumIdx) => {
    if (!window.cloudinary) return toast.error("Cloudinary widget loading...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary keys missing.");

    setUploadingAlbumIdx(albumIdx);
    let newlyUploaded = [];

    try {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: true,
          folder: "bexon/albums",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          styles: {
            palette: {
              window: dark ? "#111a23" : "#ffffff",
              windowBorder: dark ? "#263442" : "#e4e7ec",
              tabIcon: "#1e8a8a",
              action: "#1e8a8a",
              link: "#1e8a8a",
              textDark: dark ? "#f2f4f7" : "#101828",
              textLight: dark ? "#98a2b3" : "#667085",
              sourceBg: dark ? "#16212c" : "#f7f9fc",
            },
          },
        },
        (err, result) => {
          if (err) {
            toast.error("Upload error.");
            setUploadingAlbumIdx(null);
            return;
          }
          if (result?.event === "success") {
            newlyUploaded.push({
              url: result.info.secure_url,
              publicId: result.info.public_id,
            });
          }
          if (["close", "abort", "queues-end"].includes(result?.event)) {
            if (newlyUploaded.length > 0) {
              const freshData = dataRef.current;
              const albums = [...(freshData.albums || [])];
              const target = { ...albums[albumIdx] };

              target.images = [...(target.images || []), ...newlyUploaded];
              target.coverImage = target.coverImage || newlyUploaded[0]?.url;
              albums[albumIdx] = target;

              onChange({ ...freshData, albums });
              toast.success("Image(s) added to album.");
              newlyUploaded = [];
            }
            if (isMountedRef.current) setUploadingAlbumIdx(null);
          }
        },
      );
      widgetRef.current.open();
    } catch {
      toast.error("Could not open Cloudinary widget.");
      setUploadingAlbumIdx(null);
    }
  };

  const removeImageFromAlbum = async (albumIdx, imgIdx) => {
    if (deletingAlbumIdx !== null || uploadingAlbumIdx !== null) return;
    const freshData = dataRef.current;
    const img = freshData.albums[albumIdx].images[imgIdx];

    setDeletingAlbumIdx(albumIdx);

    if (img.publicId) {
      fetch("/api/admin/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId: img.publicId }),
      }).catch(() => {});
    }

    const albums = [...freshData.albums];
    const updatedImages = albums[albumIdx].images.filter(
      (_, i) => i !== imgIdx,
    );
    albums[albumIdx] = {
      ...albums[albumIdx],
      coverImage: updatedImages[0]?.url || "",
      images: updatedImages,
    };

    onChange({ ...freshData, albums });
    setDeletingAlbumIdx(null);
  };

  /* ---------- Styles (Exact match to your snippet) ---------- */
  const getInputClass = (hasError) =>
    `w-full rounded-xl border bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10 ${
      hasError
        ? "border-red-500 hover:border-red-500 focus:border-red-500 bg-red-500/5"
        : "border-[var(--border)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)]"
    }`;

  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--foreground)]";

  return (
    <div className="space-y-6">
      {/* ==================== STATUS BANNER ==================== */}
      <div
        className={`rounded-2xl border p-4 transition-colors ${hasAnyError ? "border-red-500/40 bg-red-500/10" : "border-[var(--border)] bg-[var(--surface)]"}`}
      >
        <h3 className="mb-2 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
          Completion Status
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${!valResult.noAlbums ? "bg-emerald-500/10 text-emerald-600" : showErrors ? "bg-red-500/20 text-red-500" : "bg-[var(--border)] text-[var(--text-muted)]"}`}
          >
            {!valResult.noAlbums ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}{" "}
            {currentData.albums.length} Album(s)
          </span>

          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${valResult.missingImages.length === 0 && !valResult.noAlbums ? "bg-emerald-500/10 text-emerald-600" : showErrors ? "bg-red-500/20 text-red-500" : "bg-[var(--border)] text-[var(--text-muted)]"}`}
          >
            {valResult.missingImages.length === 0 && !valResult.noAlbums ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}{" "}
            Photos
          </span>

          {[
            ["EN", valResult.enMissing],
            ["PS", valResult.psMissing],
            ["FA", valResult.faMissing],
          ].map(([code, missing]) => (
            <span
              key={code}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${missing.length === 0 ? "bg-emerald-500/10 text-emerald-600" : showErrors ? "bg-red-500/20 text-red-500" : "bg-[var(--border)] text-[var(--text-muted)]"}`}
            >
              {missing.length === 0 ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}{" "}
              {code}
            </span>
          ))}
        </div>
      </div>

      {/* ==================== PAGE PRESENTATION ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Type size={18} className="text-[var(--accent)]" />
            Main Gallery Title ({lang.toUpperCase()})
          </h2>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <label className={labelClass}>
              Page Title <span className="text-red-500">*</span>
            </label>
            <input
              dir={dir}
              value={t.title || ""}
              onChange={(e) => setPageField("title", e.target.value)}
              className={getInputClass(isErr(t.title))}
              placeholder="e.g. Photo Albums"
            />
            {isErr(t.title) && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>
          <div>
            <label className={labelClass}>
              Page Subtitle <span className="text-red-500">*</span>
            </label>
            <input
              dir={dir}
              value={t.subtitle || ""}
              onChange={(e) => setPageField("subtitle", e.target.value)}
              className={getInputClass(isErr(t.subtitle))}
              placeholder="e.g. Select an album to explore photo collections."
            />
            {isErr(t.subtitle) && (
              <p className="mt-1 text-xs text-red-500">Required</p>
            )}
          </div>
        </div>
      </section>

      {/* ==================== ALBUMS LIST ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2">
            <FolderPlus size={18} className="text-[var(--accent)]" />
            <h2 className="font-semibold">
              Albums ({currentData.albums.length})
            </h2>
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
          {currentData.albums.length === 0 ? (
            <div
              className={`rounded-2xl border-2 border-dashed py-14 text-center ${showErrors ? "border-red-500/50 bg-red-500/5" : "border-[var(--border)]"}`}
            >
              <LayoutGrid
                className={`mx-auto mb-3 opacity-50 ${showErrors ? "text-red-500" : "text-[var(--muted)]"}`}
                size={40}
              />
              <p
                className={`text-sm ${showErrors ? "font-semibold text-red-500" : "text-[var(--muted)]"}`}
              >
                {showErrors
                  ? "At least one album is required."
                  : "No albums created yet."}
              </p>
            </div>
          ) : (
            currentData.albums.map((album, albumIdx) => {
              const albT = album.translations?.[lang] || {};
              const isUploading = uploadingAlbumIdx === albumIdx;
              const isDeleting = deletingAlbumIdx === albumIdx;

              return (
                <article
                  key={album._uid || album.id || albumIdx}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 sm:px-5">
                    <span className="text-sm font-bold text-[var(--accent)]">
                      Album #{albumIdx + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={albumIdx === 0 || isDeleting || isUploading}
                        onClick={() => moveAlbum(albumIdx, -1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={
                          albumIdx === currentData.albums.length - 1 ||
                          isDeleting ||
                          isUploading
                        }
                        onClick={() => moveAlbum(albumIdx, 1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting || isUploading}
                        onClick={() => removeAlbum(albumIdx)}
                        className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <LoaderCircle size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}{" "}
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Album Title ({lang.toUpperCase()}) *
                        </label>
                        <input
                          dir={dir}
                          value={albT.title || ""}
                          onChange={(e) =>
                            setAlbumText(albumIdx, "title", e.target.value)
                          }
                          className={getInputClass(isErr(albT.title))}
                          placeholder="e.g. Nature & Landscapes"
                        />
                        {isErr(albT.title) && (
                          <p className="mt-1 text-xs text-red-500">Required</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                          Album Subtitle ({lang.toUpperCase()})
                        </label>
                        <input
                          dir={dir}
                          value={albT.subtitle || ""}
                          onChange={(e) =>
                            setAlbumText(albumIdx, "subtitle", e.target.value)
                          }
                          className={getInputClass(false)}
                          placeholder="e.g. Breathtaking views."
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <label className="text-xs font-semibold text-[var(--muted)]">
                          Photos ({(album.images || []).length})
                        </label>
                        <button
                          type="button"
                          disabled={!ready || isUploading || isDeleting}
                          onClick={() => uploadAlbumImages(albumIdx)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white disabled:opacity-50"
                        >
                          {isUploading ? (
                            <LoaderCircle size={14} className="animate-spin" />
                          ) : (
                            <Upload size={14} />
                          )}{" "}
                          Add Photos
                        </button>
                      </div>

                      {!(album.images || []).length ? (
                        <div
                          className={`rounded-xl border border-dashed p-5 text-center text-xs ${showErrors ? "border-red-500/50 bg-red-500/5 text-red-500" : "border-[var(--border)] text-[var(--muted)]"}`}
                        >
                          No photos yet. Click &quot;Add Photos&quot;.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2 min-[480px]:grid-cols-3 sm:grid-cols-4 md:grid-cols-6">
                          {album.images.map((img, imgIdx) => (
                            <div
                              key={img.publicId || imgIdx}
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
                                disabled={isDeleting || isUploading}
                                onClick={() =>
                                  removeImageFromAlbum(albumIdx, imgIdx)
                                }
                                className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition group-hover:opacity-100 disabled:opacity-0"
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
            <Plus size={18} /> Add Another Album
          </button>
        </div>
      </section>
    </div>
  );
}

// Attach static validator directly to component
AlbumsAdminForm.validate = validateAlbums;
