/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  ImagePlus,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import RichTextEditor from "../shared/RichTextEditor";

const CLOUDINARY_SCRIPT_SELECTOR = "script[data-cloudinary-widget]";
const CLOUDINARY_SCRIPT_SRC =
  "https://upload-widget.cloudinary.com/global/all.js";
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_FOLDER = "bexon/pages/sliders";
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 5_000_000;

const RTL_LANGUAGES = new Set(["ps", "fa"]);
const ALL_LANGS = ["en", "ps", "fa"];

// Translated text fields for each slide
const SLIDE_TEXT_FIELDS = [
  { id: "title", label: "Title" },
  { id: "description", label: "Description" },
];

/* ─────────────────────────────────────────────
   HELPERS: get value + check missing fields
   ───────────────────────────────────────────── */

// Get a translated field value from a slide
export const getSlideField = (slide, langKey, fieldId) => {
  const val = slide?.translations?.[langKey]?.[fieldId] || "";
  // Strip HTML tags before checking (title and description are both rich text now)
  return String(val)
    .replace(/<[^>]*>/g, "")
    .trim();
};

// Check missing translated fields across ALL slides for one language
export const checkMissingSlideFields = (data = {}, langKey = "en") => {
  const missing = [];
  const slides = data?.slides || [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    // Skip broken slides (no id or image)
    if (!slide.id || (!slide.image?.url && !slide.image?.publicId)) continue;

    for (let j = 0; j < SLIDE_TEXT_FIELDS.length; j++) {
      const field = SLIDE_TEXT_FIELDS[j];
      const val = getSlideField(slide, langKey, field.id);
      if (!val) {
        missing.push(`Slide ${i + 1} — ${field.label}`);
      }
    }
  }
  return missing;
};

// Check if there is at least one slide with an image
export const checkMissingSlides = (data = {}) => {
  const slides = (data?.slides || []).filter(
    (s) => s.id && (s.image?.url || s.image?.publicId),
  );
  if (slides.length === 0) return ["At least one slide image is required"];
  return [];
};

// Complete Validation Function
export function validateSlider(data = {}) {
  const missingSlides = checkMissingSlides(data);
  const enMissing = checkMissingSlideFields(data, "en");
  const psMissing = checkMissingSlideFields(data, "ps");
  const faMissing = checkMissingSlideFields(data, "fa");

  return {
    isValid:
      missingSlides.length === 0 &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0,
    missingSlides,
    enMissing,
    psMissing,
    faMissing,
  };
}

/* ─────────────────────────────────────────────
   Permission check helper
   ───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Cloudinary theme
   ───────────────────────────────────────────── */
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

export default function SliderAdminForm({
  data,
  lang = "en",
  onChange,
  showErrors = false,
}) {
  const isRtl = RTL_LANGUAGES.has(lang);

  const slides = (data?.slides || []).filter(
    (s) => s.id && (s.image?.url || s.image?.publicId),
  );

  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [theme, setTheme] = useState("light");

  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [checking, setChecking] = useState(false);

  const widgetRef = useRef(null);
  const isMountedRef = useRef(true);
  const pendingUploadsRef = useRef([]);

  // ── Validation checks ──
  const missingSlides = checkMissingSlides(data);
  const enMissing = checkMissingSlideFields(data, "en");
  const psMissing = checkMissingSlideFields(data, "ps");
  const faMissing = checkMissingSlideFields(data, "fa");

  const hasAnyError =
    showErrors &&
    (missingSlides.length > 0 ||
      enMissing.length > 0 ||
      psMissing.length > 0 ||
      faMissing.length > 0);

  /* ── Mount tracker ── */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      try {
        widgetRef.current?.close?.();
        widgetRef.current?.destroy?.();
      } catch {}
    };
  }, []);

  /* ── Theme watcher ── */
  useEffect(() => {
    const update = () =>
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  /* ── Cloudinary script loader ── */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.cloudinary?.createUploadWidget) {
      setCloudinaryReady(true);
      return;
    }
    let script = document.querySelector(CLOUDINARY_SCRIPT_SELECTOR);
    const onLoad = () => {
      if (window.cloudinary?.createUploadWidget) setCloudinaryReady(true);
    };
    if (!script) {
      script = document.createElement("script");
      script.src = CLOUDINARY_SCRIPT_SRC;
      script.async = true;
      script.dataset.cloudinaryWidget = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    return () => {
      script.removeEventListener("load", onLoad);
    };
  }, []);

  /* ── Slide text update helper ── */
  const updateSlideText = useCallback(
    (slideId, field, value) => {
      const allSlides = data?.slides || [];
      const updatedSlides = allSlides.map((s) => {
        if (s.id !== slideId) return s;
        const translations = s.translations || {};
        const langData = translations[lang] || {};
        return {
          ...s,
          translations: {
            ...translations,
            [lang]: { ...langData, [field]: value },
          },
        };
      });
      onChange({ ...data, slides: updatedSlides });
    },
    [data, lang, onChange],
  );

  /* ── ADD NEW SLIDES ── */
  const handleAddSlide = useCallback(async () => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary is not configured.");
      return;
    }
    if (!cloudinaryReady || !window.cloudinary?.createUploadWidget) {
      toast.message("Uploader is still loading…");
      return;
    }

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    setUploading(true);
    pendingUploadsRef.current = [];

    try {
      widgetRef.current?.destroy?.();
    } catch {}

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: UPLOAD_FOLDER,
        multiple: true,
        clientAllowedFormats: ALLOWED_FORMATS,
        maxFileSize: MAX_FILE_SIZE,
        styles: cloudinaryStyles(theme),
      },
      (err, res) => {
        if (err) {
          setUploading(false);
          toast.error(err?.statusText || "Upload failed");
          return;
        }

        if (!res?.event) return;

        if (res.event === "success" && res.info?.secure_url) {
          pendingUploadsRef.current.push({
            url: res.info.secure_url,
            publicId: res.info.public_id,
          });
        }

        if (
          res.event === "close" ||
          res.event === "abort" ||
          res.event === "queues-end"
        ) {
          const uploaded = pendingUploadsRef.current;

          if (uploaded.length > 0 && isMountedRef.current) {
            const newSlides = uploaded.map((img) => ({
              id:
                typeof crypto !== "undefined" && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `slide_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              image: {
                url: img.url,
                publicId: img.publicId,
              },
              translations: {
                en: { title: "", description: "" },
                ps: { title: "", description: "" },
                fa: { title: "", description: "" },
              },
            }));

            const allSlides = data?.slides || [];
            onChange({ ...data, slides: [...allSlides, ...newSlides] });
            toast.success(
              `${uploaded.length} slide${uploaded.length > 1 ? "s" : ""} added!`,
            );
          }

          pendingUploadsRef.current = [];
          setUploading(false);
        }
      },
    );

    try {
      widgetRef.current.open();
    } catch {
      setUploading(false);
      toast.error("Could not open uploader");
    }
  }, [cloudinaryReady, theme, data, onChange]);

  /* ── REPLACE SLIDE ── */
  const handleReplaceSlide = useCallback(
    async (slide) => {
      if (!cloudinaryReady || !window.cloudinary?.createUploadWidget) {
        toast.message("Uploader is still loading…");
        return;
      }

      setChecking(true);
      const allowed = await verifyUploadPermission();
      setChecking(false);

      if (!allowed) {
        toast.error("You don't have permission to upload images.");
        return;
      }

      setReplacingId(slide.id);

      try {
        widgetRef.current?.destroy?.();
      } catch {}

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          folder: UPLOAD_FOLDER,
          multiple: false,
          clientAllowedFormats: ALLOWED_FORMATS,
          maxFileSize: MAX_FILE_SIZE,
          styles: cloudinaryStyles(theme),
        },
        (err, res) => {
          const clear = () => setReplacingId(null);

          if (err) {
            clear();
            toast.error(err?.statusText || "Upload failed");
            return;
          }

          if (!res?.event) return;

          if (res.event === "success" && res.info?.secure_url) {
            if (isMountedRef.current) {
              const allSlides = data?.slides || [];
              const updatedSlides = allSlides.map((s) =>
                s.id === slide.id
                  ? {
                      ...s,
                      image: {
                        url: res.info.secure_url,
                        publicId: res.info.public_id,
                      },
                    }
                  : s,
              );
              onChange({ ...data, slides: updatedSlides });

              // Old image stays in Cloudinary for backup/restore safety
              toast.success("Slide replaced!");
            }
            clear();
            try {
              widgetRef.current?.close?.();
            } catch {}
            return;
          }

          if (
            res.event === "close" ||
            res.event === "abort" ||
            res.event === "queues-end"
          ) {
            clear();
          }
        },
      );

      try {
        widgetRef.current.open();
      } catch {
        setReplacingId(null);
        toast.error("Could not open uploader");
      }
    },
    [cloudinaryReady, theme, data, onChange],
  );

  /* ── REMOVE SLIDE ── */
  const handleRemoveSlide = (slide) => {
    if (deletingId) return;
    const confirmed = window.confirm(
      "Delete this slide? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(slide.id);
    // Only remove from UI — do NOT delete from Cloudinary
    // Images stay in Cloudinary so backup/restore always works
    const allSlides = data?.slides || [];
    const updatedSlides = allSlides.filter((s) => s.id !== slide.id);
    onChange({ ...data, slides: updatedSlides });
    toast.success("Slide removed from view.");
    if (isMountedRef.current) setDeletingId(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]" dir={isRtl ? "rtl" : "ltr"}>
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">
          Page Builder
        </p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
          Hero Slider
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage your slider images, titles, and descriptions here. (
          {lang.toUpperCase()})
        </p>
      </div>

      {/* ==================== STATUS BANNER ==================== */}
      <div
        className={`mb-4 rounded-2xl border p-4 transition-colors ${
          hasAnyError
            ? "border-red-500/40 bg-red-500/10"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        <h3 className="mb-2 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
          Completion Status
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          {/* Slides */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              missingSlides.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {missingSlides.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Slides (
            {missingSlides.length === 0
              ? `${slides.length} added`
              : "none added"}
            )
          </span>

          {/* Per-language chips */}
          {[
            ["EN", enMissing],
            ["PS", psMissing],
            ["FA", faMissing],
          ].map(([code, missing]) => (
            <span
              key={code}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
                missing.length === 0
                  ? "bg-emerald-500/10 text-emerald-600"
                  : showErrors
                    ? "bg-red-500/20 text-red-500"
                    : "bg-[var(--border)] text-[var(--text-muted)]"
              }`}
            >
              {missing.length === 0 ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {code} (
              {missing.length === 0 ? "Complete" : `${missing.length} missing`})
            </span>
          ))}
        </div>

        {hasAnyError && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <AlertCircle size={14} />
            Please add at least one slide and fill title + description in EN,
            PS, FA for every slide before publishing.
          </p>
        )}
      </div>

      {/* UPLOAD SECTION */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
            <CloudUpload size={28} />
          </div>
          <h3 className="mb-2 text-base font-bold text-[var(--foreground)]">
            Add New Slides
          </h3>
          <p className="mb-6 max-w-md text-sm text-[var(--muted)]">
            Upload one or more images directly to Cloudinary. They will
            instantly appear in the gallery below.
          </p>

          <button
            type="button"
            onClick={handleAddSlide}
            disabled={uploading || !cloudinaryReady || checking}
            className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {checking ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Checking...
              </>
            ) : uploading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Uploading...
              </>
            ) : !cloudinaryReady ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Loading Widget...
              </>
            ) : (
              <>
                <Plus size={18} />
                Upload Images
              </>
            )}
          </button>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Slider Images</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {slides.length} {slides.length === 1 ? "image" : "images"} added
            </p>
          </div>
        </div>

        {slides.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {slides.map((slide, index) => {
              const slideT = slide.translations?.[lang] || {};
              const titleVal = slideT.title || "";
              const descVal = slideT.description || "";

              // ── Validation: check ALL languages (en, ps, fa) ──
              let titleMissingLangs = [];
              let descMissingLangs = [];

              if (showErrors) {
                for (let i = 0; i < ALL_LANGS.length; i++) {
                  const l = ALL_LANGS[i];
                  const t = slide.translations?.[l] || {};
                  const tTitle = (t.title || "").replace(/<[^>]*>/g, "").trim();
                  const tDesc = (t.description || "")
                    .replace(/<[^>]*>/g, "")
                    .trim();

                  if (!tTitle) titleMissingLangs.push(l.toUpperCase());
                  if (!tDesc) descMissingLangs.push(l.toUpperCase());
                }
              }

              const titleErr = titleMissingLangs.length > 0;
              const descErr = descMissingLangs.length > 0;

              return (
                <div
                  key={slide.id}
                  className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden bg-[var(--background)]">
                    {slide.image?.url ? (
                      <img
                        src={slide.image.url}
                        alt={`Slide ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-[var(--muted)]">
                        <ImagePlus
                          size={28}
                          className="mb-1 text-[var(--accent)]"
                        />
                        No Image Available
                      </div>
                    )}
                  </div>

                  {/* TITLE + DESCRIPTION FIELDS */}
                  <div className="space-y-3 border-t border-[var(--border)] p-3 sm:p-4">
                    {/* ── Title (Rich Text) ── */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
                        Title ({lang.toUpperCase()})
                      </label>
                      <div
                        className={`overflow-hidden rounded-xl border transition-colors ${
                          titleErr
                            ? "border-red-500 bg-red-500/5"
                            : "border-[var(--border)]"
                        }`}
                      >
                        <RichTextEditor
                          value={titleVal}
                          onChange={(html) =>
                            updateSlideText(slide.id, "title", html)
                          }
                          isRtl={isRtl}
                          error={titleErr}
                          placeholder="e.g. Welcome to Bexon"
                          minHeight={80}
                        />
                      </div>
                      {titleErr && (
                        <p className="mt-1 text-xs text-red-500">
                          Title is required in: {titleMissingLangs.join(", ")}
                        </p>
                      )}
                    </div>

                    {/* ── Description (Rich Text) ── */}
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[var(--muted)]">
                        Description ({lang.toUpperCase()})
                      </label>
                      <div
                        className={`overflow-hidden rounded-xl border transition-colors ${
                          descErr
                            ? "border-red-500 bg-red-500/5"
                            : "border-[var(--border)]"
                        }`}
                      >
                        <RichTextEditor
                          value={descVal}
                          onChange={(html) =>
                            updateSlideText(slide.id, "description", html)
                          }
                          isRtl={isRtl}
                          placeholder="Write slide description…"
                          minHeight={100}
                        />
                      </div>
                      {descErr && (
                        <p className="mt-1 text-xs text-red-500">
                          Description is required in:{" "}
                          {descMissingLangs.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border)] p-3 sm:p-4">
                    <span className="text-sm font-semibold">
                      Slide {index + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleReplaceSlide(slide)}
                        disabled={
                          replacingId === slide.id ||
                          deletingId === slide.id ||
                          checking
                        }
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--accent)]/30 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {replacingId === slide.id ? (
                          <>
                            <LoaderCircle size={14} className="animate-spin" />
                            Replacing
                          </>
                        ) : (
                          <>
                            <Upload size={14} /> Replace
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(slide)}
                        disabled={
                          deletingId === slide.id || replacingId === slide.id
                        }
                        className="flex cursor-pointer items-center justify-center rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === slide.id ? (
                          <LoaderCircle size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`flex min-h-[220px] items-center justify-center rounded-xl border border-dashed text-sm ${
              showErrors && missingSlides.length > 0
                ? "border-red-500 bg-red-500/5 text-red-500"
                : "border-[var(--border)] text-[var(--muted)]"
            }`}
          >
            {showErrors && missingSlides.length > 0
              ? "At least one slide is required before publishing."
              : "No images yet. Click the upload button above to add your first slides."}
          </div>
        )}
      </div>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage can find it automatically!
SliderAdminForm.validate = validateSlider;
