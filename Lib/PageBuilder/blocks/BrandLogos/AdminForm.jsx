/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Plus,
  Text,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import RichTextEditor from "../shared/RichTextEditor";

// ==========================================
// 0. PERMISSION HELPER
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

// ==========================================
// 0b. CLOUDINARY WIDGET THEME
// ==========================================
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

const SCRIPT = "script[data-cloudinary-widget]";

// Helper to strip HTML tags (for rich-text validation)
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ONE list used for section inputs + validation
const SECTION_FIELDS = [
  {
    id: "title",
    label: "Section Title",
    placeholder: "e.g. Trusted by leading brands",
    minHeight: 80,
  },
];

// Helper: safely pull a section field value for a language
export const getSectionField = (data, langKey, fieldId) => {
  return data?.translations?.[langKey]?.[fieldId] || "";
};

// Check missing fields for a specific language (strip HTML first)
export const checkMissingFields = (data = {}, langKey = "en") => {
  const missing = [];

  SECTION_FIELDS.forEach((field) => {
    if (!stripHtml(getSectionField(data, langKey, field.id))) {
      missing.push(field.label);
    }
  });

  return missing;
};

// Check missing logos
export const checkMissingLogos = (data = {}) => {
  const logos = data?.logos || [];
  if (logos.length === 0) return ["At least one logo"];
  const missing = [];
  logos.forEach((logo, i) => {
    if (!logo?.url?.trim()) missing.push(`Logo ${i + 1} image`);
  });
  return missing;
};

// Complete Validation Function
export function validateBrandLogos(data = {}) {
  const missingLogos = checkMissingLogos(data);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");

  return {
    isValid:
      missingLogos.length === 0 &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0,
    missingLogos,
    enMissing,
    psMissing,
    faMissing,
  };
}

export default function BrandLogosAdminForm({
  data = {},
  lang = "en",
  onChange = () => {},
  showErrors = false,
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [checking, setChecking] = useState(false);
  const widget = useRef(null);

  // Ref to always have the freshest logos inside Cloudinary callbacks
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const translations = data?.translations || {};
  const content = translations[lang] || {};
  const logos = data?.logos || [];
  const isRtl = lang === "ps" || lang === "fa";

  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const missingLogos = checkMissingLogos(data);
  const noLogos = logos.length === 0;

  // Error check for rich text (strips HTML first)
  const isErr = (val) => showErrors && !stripHtml(val);

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

  /* ---------- Section text update ---------- */
  const updateSectionText = (fieldId, value) => {
    onChange({
      ...data,
      translations: {
        ...translations,
        [lang]: { ...content, [fieldId]: value },
      },
    });
  };

  /* ---------- Remove logo ---------- */
  const removeLogo = (index) => {
    if (deletingIndex !== null || uploadingIndex !== null) return;

    setDeletingIndex(index);

    // Only remove from UI — do NOT delete from Cloudinary
    onChange({ ...data, logos: logos.filter((_, i) => i !== index) });

    setDeletingIndex(null);
    toast.success("Logo removed from view.");
  };

  /* ---------- Open Cloudinary widget ---------- */
  // logoIndex = number → replace that specific logo
  // logoIndex = null  → add new logos (multiple)
  const openWidget = async (logoIndex = null) => {
    if (uploadingIndex !== null || deletingIndex !== null || checking) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return toast.error("Check your Cloudinary environment variables.");
    }
    if (!window.cloudinary?.createUploadWidget) {
      return toast.error("Cloudinary widget is still loading. Please wait.");
    }

    // Permission check BEFORE opening widget
    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);
    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    const isReplace = logoIndex !== null;
    const oldPublicId = isReplace ? logos[logoIndex]?.publicId || "" : "";

    if (isReplace) {
      setUploadingIndex(logoIndex);
    }

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: true,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
          resourceType: "image",
          folder: "bexon/pages/brand-logos",
          cropping: false,
          styles: cloudinaryStyles(dark ? "dark" : "light"),
        },
        (error, result) => {
          if (error) {
            toast.error(error.message || "Image upload failed.");
            if (isReplace) setUploadingIndex(null);
            return;
          }

          if (result?.event === "success") {
            const newPublicId = result.info.public_id;
            const newUrl = result.info.secure_url;

            // Always read the freshest data to avoid stale closures
            const fresh = dataRef.current || {};
            const freshLogos = fresh?.logos || [];

            if (isReplace) {
              // Replace mode: old image stays in Cloudinary for backup/restore
              const nextLogos = [...freshLogos];
              nextLogos[logoIndex] = { url: newUrl, publicId: newPublicId };
              onChange({ ...fresh, logos: nextLogos });
              toast.success(oldPublicId ? "Logo replaced!" : "Logo uploaded!");
            } else {
              // Add mode: append each uploaded file as a new logo
              const nextLogos = [
                ...freshLogos,
                { url: newUrl, publicId: newPublicId },
              ];
              onChange({ ...fresh, logos: nextLogos });
              toast.success("Logo added!");
            }
          }

          if (["close", "abort"].includes(result?.event)) {
            if (isReplace) setUploadingIndex(null);
          }
        },
      );

      widget.current.open();
    } catch {
      toast.error("Could not open Cloudinary widget.");
      if (isReplace) setUploadingIndex(null);
    }
  };

  /* ---------- Rich text wrapper class ---------- */
  const richWrapperClass = (hasError) =>
    `overflow-hidden rounded-xl border transition-colors ${
      hasError ? "border-red-500 bg-red-500/5" : "border-[var(--border)]"
    }`;

  const sectionClass =
    "mb-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5";

  const hasAnyError =
    showErrors &&
    (noLogos || missingLogos.length > 0 || currentMissing.length > 0);

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
          {/* Logos count */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              !noLogos && missingLogos.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {!noLogos && missingLogos.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {logos.length} Logo{logos.length === 1 ? "" : "s"}
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
            Please add at least one logo and fill the section title in EN, PS,
            FA before publishing.
          </p>
        )}
      </div>

      {/* ==================== SECTION TITLE ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Text size={18} className="text-[var(--accent)]" /> Section Title (
          {lang.toUpperCase()})
        </h2>

        {SECTION_FIELDS.map((field) => {
          const val = content[field.id] || "";
          const hasError = isErr(val);

          return (
            <div key={field.id}>
              <label className="mb-1.5 block text-sm font-medium">
                {field.label}
              </label>
              <div className={richWrapperClass(hasError)}>
                <RichTextEditor
                  value={val}
                  onChange={(html) => updateSectionText(field.id, html)}
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
      </section>

      {/* ==================== BRAND LOGOS ==================== */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <ImagePlus size={18} className="text-[var(--accent)]" /> Brand Logos
            ({logos.length})
          </h2>
          <button
            type="button"
            onClick={() => openWidget(null)}
            disabled={!ready || checking}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checking ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {checking ? "Checking..." : "Add Logos"}
          </button>
        </div>

        {noLogos && (
          <p
            className={`py-6 text-center text-sm ${
              showErrors ? "text-red-500" : "text-[var(--text-muted)]"
            }`}
          >
            {showErrors
              ? "At least one logo is required."
              : 'No logos yet. Click "Add Logos" to upload.'}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {logos.map((logo, i) => {
            const logoUrl = logo?.url || "";
            const logoMissing = !logoUrl.trim();
            const isUploading = uploadingIndex === i;
            const isDeleting = deletingIndex === i;

            return (
              <div
                key={logo._id || logo.publicId || i}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                {/* Logo header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Logo {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeLogo(i)}
                    disabled={isDeleting || isUploading}
                    className="cursor-pointer rounded-lg p-2 text-red-500 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Logo preview area */}
                <div
                  className={`flex h-32 items-center justify-center overflow-hidden rounded-xl border bg-[var(--background)] ${
                    showErrors && logoMissing
                      ? "border-red-500 bg-red-500/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt={`Brand logo ${i + 1}`}
                      className="max-h-full max-w-full object-contain p-3"
                    />
                  ) : (
                    <div
                      className={`py-4 text-center ${
                        showErrors && logoMissing
                          ? "text-red-500"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      <ImagePlus
                        size={24}
                        className="mx-auto mb-1 opacity-60"
                      />
                      <p className="text-xs font-semibold">
                        {showErrors && logoMissing
                          ? "Logo required"
                          : "No logo uploaded"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload / Replace button */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openWidget(i)}
                    disabled={!ready || isUploading || isDeleting || checking}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading || checking ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                    {checking
                      ? "Checking..."
                      : isUploading
                        ? "Uploading..."
                        : logoUrl
                          ? "Replace Logo"
                          : ready
                            ? "Upload Logo"
                            : "Loading..."}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage can find it automatically!
BrandLogosAdminForm.validate = validateBrandLogos;
