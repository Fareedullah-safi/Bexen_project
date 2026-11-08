/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LinkIcon,
  LoaderCircle,
  PlayCircle,
  Text,
  Trash2,
  Type,
  UploadCloud,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import RichTextEditor from "../shared/RichTextEditor";

const SCRIPT = "script[data-cloudinary-widget]";

// Helper to strip HTML tags (for rich-text validation)
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ONE list used for translated inputs + validation (all rich text now)
const TEXT_FIELDS = [
  {
    id: "experienceNumber",
    label: "Experience Number",
    placeholder: "e.g. 13+",
    minHeight: 80,
  },
  {
    id: "experienceLabel",
    label: "Experience Label",
    placeholder: "e.g. Years of Experience",
    minHeight: 80,
  },
  {
    id: "experienceText",
    label: "Experience Text",
    placeholder: "e.g. Decades of Experience...",
    minHeight: 100,
  },
  {
    id: "sectionLabel",
    label: "Section Label",
    placeholder: "e.g. Get to Know Us",
    minHeight: 80,
  },
  {
    id: "title",
    label: "Title",
    placeholder: "Enter section title",
    minHeight: 80,
  },
  {
    id: "description",
    label: "Description",
    placeholder: "Write your About Us description...",
    minHeight: 150,
  },
  {
    id: "buttonText",
    label: "Button Text",
    placeholder: "e.g. Learn More",
    minHeight: 80,
  },
  {
    id: "clientName",
    label: "Client Name",
    placeholder: "Enter client name",
    minHeight: 80,
  },
  {
    id: "clientRole",
    label: "Client Role",
    placeholder: "Enter client role",
    minHeight: 80,
  },
];

// Shared (non-translated) fields — URLs stay as plain inputs
const SHARED_FIELDS = [
  { id: "buttonLink", label: "Button Link", placeholder: "/about" },
  {
    id: "videoLink",
    label: "YouTube Video Link",
    placeholder: "https://www.youtube.com/watch?v=...",
  },
];

// Image fields
const IMAGE_FIELDS = [
  { id: "mainImage", label: "Main Image" },
  { id: "thumbnailImage", label: "Video Thumbnail" },
];

// Helpers
export const getTranslatedField = (data, langKey, fieldId) => {
  return data?.translations?.[langKey]?.[fieldId] || "";
};

// Check missing translated fields for a specific language (strip HTML first)
export const checkMissingFields = (data = {}, langKey = "en") => {
  const missing = [];
  TEXT_FIELDS.forEach((field) => {
    if (!stripHtml(getTranslatedField(data, langKey, field.id))) {
      missing.push(field.label);
    }
  });
  return missing;
};

// Check missing shared fields (plain text, no HTML stripping needed)
export const checkMissingShared = (data = {}) => {
  const missing = [];
  SHARED_FIELDS.forEach((field) => {
    if (!String(data?.[field.id] || "").trim()) {
      missing.push(field.label);
    }
  });
  return missing;
};

// Check missing images
export const checkMissingImages = (data = {}) => {
  const missing = [];
  IMAGE_FIELDS.forEach((field) => {
    if (!data?.[field.id]?.url?.trim()) missing.push(field.label);
  });
  return missing;
};

// Complete Validation Function
export function validateAboutUs(data = {}) {
  const missingImages = checkMissingImages(data);
  const missingShared = checkMissingShared(data);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");

  return {
    isValid:
      missingImages.length === 0 &&
      missingShared.length === 0 &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0,
    missingImages,
    missingShared,
    enMissing,
    psMissing,
    faMissing,
  };
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

export default function AboutUsAdminForm({
  data = {},
  lang = "en",
  onChange = () => {},
  showErrors = false,
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploadingField, setUploadingField] = useState("");
  const [deletingField, setDeletingField] = useState("");
  const [checking, setChecking] = useState(false);
  const widget = useRef(null);

  // --- Safe Refs for Data & Mounting ---
  const dataRef = useRef(data);
  const isMountedRef = useRef(true);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      try {
        widget.current?.close?.();
        widget.current?.destroy?.();
      } catch {}
    };
  }, []);

  const translations = data?.translations || {};
  const content = translations[lang] || {};
  const isRtl = lang === "ps" || lang === "fa";

  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const missingImages = checkMissingImages(data);
  const missingShared = checkMissingShared(data);

  // Error check for rich text (strips HTML first)
  const isErr = (val) => showErrors && !stripHtml(val);

  // Error check for plain inputs (URLs, no HTML stripping)
  const isPlainErr = (val) => showErrors && !String(val || "").trim();

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

  /* ---------- Cloudinary script loader ---------- */
  useEffect(() => {
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
    return () => script?.removeEventListener("load", checkReady);
  }, []);

  /* ---------- Translated text update (SAFE) ---------- */
  const updateTranslatedField = (fieldId, value) => {
    const fresh = dataRef.current || {};
    const freshTranslations = fresh.translations || {};
    const freshContent = freshTranslations[lang] || {};
    onChange({
      ...fresh,
      translations: {
        ...freshTranslations,
        [lang]: { ...freshContent, [fieldId]: value },
      },
    });
  };

  /* ---------- Shared text update (SAFE) ---------- */
  const updateSharedField = (fieldId, value) => {
    const fresh = dataRef.current || {};
    onChange({ ...fresh, [fieldId]: value });
  };

  /* ---------- Image update (SAFE) ---------- */
  const updateImage = (field, url, publicId) => {
    const fresh = dataRef.current || {};
    onChange({ ...fresh, [field]: { url, publicId } });
  };

  /* ---------- Remove image (SAFE — keeps image in Cloudinary) ---------- */
  const removeImage = (field) => {
    if (deletingField || uploadingField) return;

    setDeletingField(field);

    // Only clear from UI — do NOT delete from Cloudinary
    onChange({ ...dataRef.current, [field]: { url: "", publicId: "" } });

    if (isMountedRef.current) setDeletingField("");
    toast.success("Image removed from view.");
  };

  /* ---------- Open Cloudinary widget (permission-gated + unified theme) ---------- */
  const openWidget = async (field) => {
    if (uploadingField || deletingField) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return toast.error("Check your Cloudinary environment variables.");
    }
    if (!window.cloudinary?.createUploadWidget) {
      return toast.error("Cloudinary widget is still loading. Please wait.");
    }

    // --- Permission check before opening widget ---
    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    const fresh = dataRef.current || {};
    const oldPublicId = fresh?.[field]?.publicId || "";
    setUploadingField(field);

    try {
      widget.current?.destroy?.();
    } catch {}

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/pages/about-us",
          cropping: false,
          styles: cloudinaryStyles(dark ? "dark" : "light"),
        },
        (error, result) => {
          const clear = () => {
            if (isMountedRef.current) setUploadingField("");
          };

          if (error) {
            toast.error(error.message || "Image upload failed.");
            clear();
            return;
          }

          if (!result?.event) return;

          if (result.event === "success") {
            const newPublicId = result.info.public_id;
            const newUrl = result.info.secure_url;

            // Write against LATEST data — other fields never wiped
            const latest = dataRef.current || {};
            onChange({
              ...latest,
              [field]: { url: newUrl, publicId: newPublicId },
            });

            // Old image stays in Cloudinary for backup/restore safety

            if (isMountedRef.current) {
              toast.success(
                oldPublicId ? "Image replaced!" : "Image uploaded!",
              );
            }
            clear();
            try {
              widget.current?.close?.();
            } catch {}
            return;
          }

          // Spinner never sticks
          if (["close", "abort", "queues-end"].includes(result.event)) {
            clear();
          }
        },
      );

      widget.current.open();
    } catch {
      toast.error("Could not open Cloudinary widget.");
      setUploadingField("");
    }
  };

  /* ---------- Shared classes ---------- */
  // For plain inputs (URLs)
  const getInputClass = (hasError) =>
    `w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] ${
      hasError
        ? "border-red-500 bg-red-500/10 focus:border-red-500"
        : "border-[var(--border)]"
    }`;

  // For rich text editors
  const richWrapperClass = (hasError) =>
    `overflow-hidden rounded-xl border transition-colors ${
      hasError ? "border-red-500 bg-red-500/5" : "border-[var(--border)]"
    }`;

  const sectionClass =
    "mb-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5";

  const hasAnyError =
    showErrors &&
    (missingImages.length > 0 ||
      missingShared.length > 0 ||
      currentMissing.length > 0);

  return (
    <div>
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
          {/* Images */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              missingImages.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {missingImages.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Images (
            {missingImages.length === 0
              ? "Complete"
              : `${missingImages.length} missing`}
            )
          </span>

          {/* Shared fields */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              missingShared.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {missingShared.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Links (
            {missingShared.length === 0
              ? "Complete"
              : `${missingShared.length} missing`}
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
            Please upload both images, fill the shared links, and complete all
            fields in EN, PS, FA before publishing.
          </p>
        )}
      </div>

      {/* ==================== IMAGES (Shared) ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <ImagePlus size={18} className="text-[var(--accent)]" /> Section
          Images (Shared)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {IMAGE_FIELDS.map((field) => {
            const img = data?.[field.id] || {};
            const imgUrl = img?.url || "";
            const imgMissing = !imgUrl.trim();
            const isUploading = uploadingField === field.id;
            const isDeleting = deletingField === field.id;

            return (
              <div key={field.id}>
                <label className="mb-1.5 block text-sm font-medium">
                  {field.label}
                </label>

                <div
                  className={`flex min-h-48 items-center justify-center overflow-hidden rounded-xl border bg-[var(--surface)] ${
                    showErrors && imgMissing
                      ? "border-red-500 bg-red-500/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={field.label}
                      className="max-h-56 w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`py-8 text-center ${
                        showErrors && imgMissing
                          ? "text-red-500"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      <ImagePlus
                        size={32}
                        className="mx-auto mb-2 opacity-50"
                      />
                      <p className="text-sm font-semibold">
                        {showErrors && imgMissing
                          ? `${field.label} is required`
                          : `No ${field.label.toLowerCase()}`}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openWidget(field.id)}
                    disabled={!ready || isUploading || isDeleting || checking}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {checking || isUploading ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <UploadCloud size={16} />
                    )}
                    {checking
                      ? "Checking..."
                      : isUploading
                        ? "Uploading..."
                        : imgUrl
                          ? "Replace Image"
                          : ready
                            ? "Upload Image"
                            : "Loading..."}
                  </button>

                  {imgUrl && (
                    <button
                      type="button"
                      onClick={() => removeImage(field.id)}
                      disabled={isDeleting || isUploading}
                      className="flex cursor-pointer items-center gap-1 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== SHARED LINKS (plain inputs — URLs) ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <LinkIcon size={18} className="text-[var(--accent)]" /> Links (Shared)
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {SHARED_FIELDS.map((field) => {
            const val = data?.[field.id] || "";
            const Icon = field.id === "videoLink" ? PlayCircle : LinkIcon;
            const hasError = isPlainErr(val);

            return (
              <div key={field.id}>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <Icon
                    size={14}
                    className={
                      field.id === "videoLink"
                        ? "text-red-500"
                        : "text-[var(--accent)]"
                    }
                  />
                  {field.label}
                </label>
                <input
                  dir="ltr"
                  value={val}
                  onChange={(e) => updateSharedField(field.id, e.target.value)}
                  className={getInputClass(hasError)}
                  placeholder={field.placeholder}
                />
                {hasError && (
                  <p className="mt-1 text-xs text-red-500">
                    {field.label} is required
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== TRANSLATED CONTENT (Rich Text) ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Text size={18} className="text-[var(--accent)]" /> Section Content (
          {lang.toUpperCase()})
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.filter(
            (f) => f.id !== "clientName" && f.id !== "clientRole",
          ).map((field) => {
            const val = content[field.id] || "";
            const hasError = isErr(val);
            // Description takes full width
            const isFullWidth = field.id === "description";

            return (
              <div
                key={field.id}
                className={isFullWidth ? "sm:col-span-2" : ""}
              >
                <label className="mb-1.5 block text-sm font-medium">
                  {field.label}
                </label>
                <div className={richWrapperClass(hasError)}>
                  <RichTextEditor
                    value={val}
                    onChange={(html) => updateTranslatedField(field.id, html)}
                    isRtl={isRtl}
                    error={hasError}
                    placeholder={field.placeholder || ""}
                    minHeight={field.minHeight || 80}
                  />
                </div>
                {hasError && (
                  <p className="mt-1 text-xs text-red-500">
                    {field.label} is required in {lang.toUpperCase()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== CLIENT INFO (Rich Text) ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <User size={18} className="text-[var(--accent)]" /> Client Information
          ({lang.toUpperCase()})
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.filter(
            (f) => f.id === "clientName" || f.id === "clientRole",
          ).map((field) => {
            const val = content[field.id] || "";
            const hasError = isErr(val);

            return (
              <div key={field.id}>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium">
                  <Type size={12} /> {field.label}
                </label>
                <div className={richWrapperClass(hasError)}>
                  <RichTextEditor
                    value={val}
                    onChange={(html) => updateTranslatedField(field.id, html)}
                    isRtl={isRtl}
                    error={hasError}
                    placeholder={field.placeholder || ""}
                    minHeight={field.minHeight || 80}
                  />
                </div>
                {hasError && (
                  <p className="mt-1 text-xs text-red-500">
                    {field.label} is required in {lang.toUpperCase()}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage can find it automatically!
AboutUsAdminForm.validate = validateAboutUs;
