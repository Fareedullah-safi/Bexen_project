// src/Lib/PageBuilder/blocks/ServiceDetails/AdminForm.jsx
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LinkIcon,
  LoaderCircle,
  Plus,
  Text,
  Trash2,
  Type,
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
const stripHtml = (val) =>
  String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();

// ONE list used for inputs + validation
// All are rich text now
const TEXT_FIELDS = [
  {
    id: "mainTitle",
    label: "Main Title",
    placeholder: "e.g. Transforming Customer:",
    minHeight: 80,
  },
  { id: "description1", label: "Paragraph 1", minHeight: 150 },
  { id: "description2", label: "Paragraph 2", minHeight: 150 },
  { id: "description3", label: "Paragraph 3", minHeight: 150 },
  { id: "sidebarTag", label: "Sidebar Tag", minHeight: 80 },
  { id: "sidebarTitle", label: "Sidebar Title", minHeight: 80 },
];

export const getServiceLabel = (svc, langKey) => {
  if (!svc) return "";
  if (svc.translations?.[langKey]?.label !== undefined)
    return svc.translations[langKey].label;
  if (typeof svc.translations?.[langKey] === "string")
    return svc.translations[langKey];
  if (svc.label?.[langKey] !== undefined) return svc.label[langKey];
  if (typeof svc.label === "string") return svc.label;
  return "";
};

// Check missing fields for a language (strip HTML first since all are rich text)
export const checkMissingFields = (data = {}, langKey = "en") => {
  const content = data?.[langKey] || {};
  const services = data?.services || [];
  const missing = [];

  TEXT_FIELDS.forEach((field) => {
    if (!stripHtml(content[field.id])) {
      missing.push(field.label);
    }
  });

  services.forEach((svc, index) => {
    const label = getServiceLabel(svc, langKey);
    if (!stripHtml(label)) missing.push(`Link ${index + 1} Label`);
    if (!svc.href?.trim()) missing.push(`Link ${index + 1} URL`);
  });

  return missing;
};

// Complete Validation Function
export function validateServiceDetails(data = {}) {
  const missingHero = !data?.heroImage?.url?.trim();
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");

  return {
    isValid:
      !missingHero &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0,
    missingHero,
    enMissing,
    psMissing,
    faMissing,
  };
}

export default function ServiceDetailsAdminForm({
  data = {},
  lang = "en",
  onChange = () => {},
  showErrors = false,
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [checking, setChecking] = useState(false);
  const widget = useRef(null);

  const content = data[lang] || {};
  const services = data.services || [];
  const heroImage = data.heroImage || {};
  const isRtl = lang === "ps" || lang === "fa";

  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const isHeroMissing = !heroImage?.url?.trim();

  // Error check for rich text (strips HTML first)
  const isErr = (val) => showErrors && !stripHtml(val);

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

  const updateText = (field, value) => {
    onChange({
      ...data,
      [lang]: { ...content, [field]: value },
    });
  };

  const updateImage = (url, publicId) => {
    onChange({
      ...data,
      heroImage: { url, publicId },
    });
  };

  const removeHeroImage = () => {
    if (deleting) return;
    setDeleting(true);
    // Only clear from UI — do NOT delete from Cloudinary
    // Image stays in Cloudinary so backup/restore always works
    updateImage("", "");
    setDeleting(false);
    toast.success("Hero image removed from view.");
  };

  const addService = () => {
    onChange({
      ...data,
      services: [
        ...services,
        {
          id: crypto.randomUUID(),
          href: "/",
          translations: {
            en: { label: "" },
            ps: { label: "" },
            fa: { label: "" },
          },
          label: { en: "", ps: "", fa: "" },
        },
      ],
    });
  };

  const updateService = (index, field, value, isTranslation = false) => {
    const newServices = [...services];
    const target = { ...newServices[index] };

    if (isTranslation) {
      const transObj = target.translations || {};
      const langObj = transObj[lang] || {};
      target.translations = {
        ...transObj,
        [lang]: { ...langObj, label: value },
      };
      const labelObj = typeof target.label === "object" ? target.label : {};
      target.label = { ...labelObj, [lang]: value };
    } else {
      target[field] = value;
    }

    newServices[index] = target;
    onChange({ ...data, services: newServices });
  };

  const removeService = (index) => {
    onChange({
      ...data,
      services: services.filter((_, i) => i !== index),
    });
  };

  const openWidget = async () => {
    if (uploading || deleting || checking) return;

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

    const oldPublicId = heroImage?.publicId || "";
    setUploading(true);

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
          folder: "bexon/pages/services",
          cropping: false,
          styles: cloudinaryStyles(dark ? "dark" : "light"),
        },
        (error, result) => {
          if (error) {
            toast.error(error.message || "Image upload failed.");
            setUploading(false);
            return;
          }

          if (result?.event === "success") {
            const newPublicId = result.info.public_id;
            const newUrl = result.info.secure_url;

            // Old image stays in Cloudinary for backup/restore safety
            updateImage(newUrl, newPublicId);
            toast.success(oldPublicId ? "Image replaced!" : "Image uploaded!");
          }

          if (["close", "abort"].includes(result?.event)) {
            setUploading(false);
          }
        },
      );

      widget.current.open();
    } catch {
      toast.error("Could not open Cloudinary widget.");
      setUploading(false);
    }
  };

  // Border wrapper class for rich text editors
  const richWrapperClass = (hasError) =>
    `overflow-hidden rounded-xl border transition-colors ${
      hasError ? "border-red-500 bg-red-500/5" : "border-[var(--border)]"
    }`;

  const sectionClass =
    "mb-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5";

  return (
    <div>
      {/* STATUS BANNER */}
      <div
        className={`mb-4 rounded-2xl border p-4 transition-colors ${
          showErrors && (isHeroMissing || currentMissing.length > 0)
            ? "border-red-500/40 bg-red-500/10"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        <h3 className="mb-2 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
          Completion Status
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              !isHeroMissing
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {!isHeroMissing ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Hero Image
          </span>

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

        {showErrors && (isHeroMissing || currentMissing.length > 0) && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-500">
            <AlertCircle size={14} />
            Please fill all highlighted required fields in EN, PS, FA and upload
            a hero image before publishing.
          </p>
        )}
      </div>

      {/* HERO IMAGE */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <ImagePlus size={18} className="text-[var(--accent)]" /> Hero Image
          (Shared)
        </h2>

        <div
          className={`flex min-h-48 items-center justify-center overflow-hidden rounded-xl border bg-[var(--surface)] ${
            showErrors && isHeroMissing
              ? "border-red-500 bg-red-500/5"
              : "border-[var(--border)]"
          }`}
        >
          {heroImage.url ? (
            <img
              src={heroImage.url}
              alt="Hero Preview"
              className="max-h-56 w-full object-cover"
            />
          ) : (
            <div
              className={`py-8 text-center ${showErrors && isHeroMissing ? "text-red-500" : "text-[var(--text-muted)]"}`}
            >
              <ImagePlus size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">
                {showErrors && isHeroMissing
                  ? "Hero image is required"
                  : "No hero image uploaded"}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={openWidget}
            disabled={!ready || uploading || deleting || checking}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading || checking ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {checking
              ? "Checking..."
              : uploading
                ? "Uploading..."
                : heroImage.url
                  ? "Replace Image"
                  : ready
                    ? "Upload Image"
                    : "Loading Cloudinary..."}
          </button>

          {heroImage.url && (
            <button
              type="button"
              onClick={removeHeroImage}
              disabled={deleting || uploading}
              className="flex cursor-pointer items-center gap-1 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          )}
        </div>
      </section>

      {/* ALL TEXT INPUTS (Rich Text) */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Text size={18} className="text-[var(--accent)]" /> Content & Sidebar
          ({lang.toUpperCase()})
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {TEXT_FIELDS.map((field) => {
            const val = content[field.id] || "";
            const hasError = isErr(val);
            // Paragraphs (description1, 2, 3) take full width
            const isFullWidth = field.id.startsWith("description");

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
                    onChange={(html) => updateText(field.id, html)}
                    isRtl={isRtl}
                    error={hasError}
                    placeholder={field.placeholder || ""}
                    minHeight={field.minHeight || 100}
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

        {/* SERVICE LINKS */}
        <div className="mt-4 mb-2 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <h3 className="text-sm font-bold">More Services Links</h3>
          <button
            type="button"
            onClick={addService}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {services.length === 0 && (
            <p className="py-2 text-center text-xs text-[var(--text-muted)]">
              No links added. Click "Add Link" to create one.
            </p>
          )}

          {services.map((svc, i) => {
            const labelValue = getServiceLabel(svc, lang);
            const labelErr = isErr(labelValue);
            const urlErr = showErrors && !String(svc.href || "").trim();

            return (
              <div
                key={svc.id || i}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-start"
              >
                {/* Label — Rich Text */}
                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <Type size={12} /> Label ({lang.toUpperCase()})
                  </label>
                  <div className={richWrapperClass(labelErr)}>
                    <RichTextEditor
                      value={labelValue}
                      onChange={(html) => updateService(i, "label", html, true)}
                      isRtl={isRtl}
                      error={labelErr}
                      placeholder="Link label…"
                      minHeight={70}
                    />
                  </div>
                  {labelErr && (
                    <p className="mt-1 text-xs text-red-500">
                      Label required in {lang.toUpperCase()}
                    </p>
                  )}
                </div>

                {/* URL — stays as plain input (URLs are not rich text) */}
                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <LinkIcon size={12} /> URL
                  </label>
                  <input
                    dir="ltr"
                    value={svc.href || ""}
                    onChange={(e) =>
                      updateService(i, "href", e.target.value, false)
                    }
                    className={`w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)] ${
                      urlErr
                        ? "border-red-500 bg-red-500/10 focus:border-red-500"
                        : "border-[var(--border)]"
                    }`}
                  />
                  {urlErr && (
                    <p className="mt-1 text-xs text-red-500">URL is required</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="mt-6 cursor-pointer rounded-lg p-2 text-red-500 hover:bg-red-500/10 sm:mt-7"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage can find it automatically!
ServiceDetailsAdminForm.validate = validateServiceDetails;
