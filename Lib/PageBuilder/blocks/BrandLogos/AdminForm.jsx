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

const SCRIPT = "script[data-cloudinary-widget]";

// ONE list used for section inputs + validation
const SECTION_FIELDS = [
  {
    id: "title",
    label: "Section Title",
    placeholder: "e.g. Trusted by leading brands",
  },
];

// Helper: safely pull a section field value for a language
export const getSectionField = (data, langKey, fieldId) => {
  return data?.translations?.[langKey]?.[fieldId] || "";
};

// Check missing fields for a specific language
export const checkMissingFields = (data = {}, langKey = "en") => {
  const missing = [];

  SECTION_FIELDS.forEach((field) => {
    if (!String(getSectionField(data, langKey, field.id)).trim()) {
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
  const widget = useRef(null);

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

  const isErr = (val) => showErrors && !String(val || "").trim();

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

  const destroyCloudinaryImage = async (publicId) => {
    if (!publicId) return;
    try {
      await fetch("/api/admin/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
    } catch (e) {
      console.error("Failed to delete image from Cloudinary:", e);
    }
  };

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

  /* ---------- Add / remove logo ---------- */
  const addLogo = () => {
    onChange({
      ...data,
      logos: [...logos, { url: "", publicId: "" }],
    });
  };

  const removeLogo = async (index) => {
    if (deletingIndex !== null || uploadingIndex !== null) return;
    const publicId = logos[index]?.publicId;
    if (publicId) {
      setDeletingIndex(index);
      await destroyCloudinaryImage(publicId);
      setDeletingIndex(null);
    }
    onChange({ ...data, logos: logos.filter((_, i) => i !== index) });
    toast.success("Logo removed.");
  };

  /* ---------- Open Cloudinary widget for a logo ---------- */
  const openWidget = (logoIndex) => {
    if (uploadingIndex !== null || deletingIndex !== null) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return toast.error("Check your Cloudinary environment variables.");
    }
    if (!window.cloudinary?.createUploadWidget) {
      return toast.error("Cloudinary widget is still loading. Please wait.");
    }

    const oldPublicId = logos[logoIndex]?.publicId || "";
    setUploadingIndex(logoIndex);

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
          resourceType: "image",
          folder: "bexon/pages/brand-logos",
          cropping: false,
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
        async (error, result) => {
          if (error) {
            toast.error(error.message || "Image upload failed.");
            setUploadingIndex(null);
            return;
          }

          if (result?.event === "success") {
            const newPublicId = result.info.public_id;
            const newUrl = result.info.secure_url;

            if (oldPublicId && oldPublicId !== newPublicId) {
              await destroyCloudinaryImage(oldPublicId);
            }

            const nextLogos = [...logos];
            nextLogos[logoIndex] = { url: newUrl, publicId: newPublicId };
            onChange({ ...data, logos: nextLogos });
            toast.success(oldPublicId ? "Logo replaced!" : "Logo uploaded!");
          }

          if (["close", "abort"].includes(result?.event)) {
            setUploadingIndex(null);
          }
        },
      );

      widget.current.open();
    } catch {
      toast.error("Could not open Cloudinary widget.");
      setUploadingIndex(null);
    }
  };

  /* ---------- Shared classes ---------- */
  const getInputClass = (hasError) =>
    `w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)] ${
      hasError
        ? "border-red-500 bg-red-500/10 focus:border-red-500"
        : "border-[var(--border)]"
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
          return (
            <div key={field.id}>
              <label className="mb-1.5 block text-sm font-medium">
                {field.label}
              </label>
              <input
                dir={isRtl ? "rtl" : "ltr"}
                value={val}
                onChange={(e) => updateSectionText(field.id, e.target.value)}
                className={getInputClass(isErr(val))}
                placeholder={field.placeholder || ""}
              />
              {isErr(val) && (
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
            onClick={addLogo}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            <Plus size={14} /> Add Logo
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
              : 'No logos yet. Click "Add Logo" to upload one.'}
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
                key={logo._id || i}
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
                    disabled={!ready || isUploading || isDeleting}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isUploading ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                    {isUploading
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
