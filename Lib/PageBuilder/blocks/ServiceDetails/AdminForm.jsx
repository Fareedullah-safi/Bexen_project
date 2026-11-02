"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Layout,
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

const SCRIPT = "script[data-cloudinary-widget]";

// Safely extract label from any DB structure (translations.lang.label OR label.lang)
const getServiceLabel = (svc, langKey) => {
  if (!svc) return "";
  if (svc.translations?.[langKey]?.label !== undefined) {
    return svc.translations[langKey].label;
  }
  if (typeof svc.translations?.[langKey] === "string") {
    return svc.translations[langKey];
  }
  if (svc.label?.[langKey] !== undefined) {
    return svc.label[langKey];
  }
  if (typeof svc.label === "string") {
    return svc.label;
  }
  return "";
};

// Check missing fields for a given language
const checkMissingFields = (data, langKey) => {
  const content = data[langKey] || {};
  const services = data.services || [];
  const missing = [];

  if (!content.mainTitle?.trim()) missing.push("Main Title");
  if (!content.highlightedTitle?.trim()) missing.push("Highlighted Title");
  if (!content.description1?.trim()) missing.push("Paragraph 1");
  if (!content.description2?.trim()) missing.push("Paragraph 2");
  if (!content.description3?.trim()) missing.push("Paragraph 3");
  if (!content.sidebarTag?.trim()) missing.push("Sidebar Tag");
  if (!content.sidebarTitle?.trim()) missing.push("Sidebar Title");

  services.forEach((svc, index) => {
    const lbl = getServiceLabel(svc, langKey);
    if (!lbl?.trim()) missing.push(`Link ${index + 1} Label`);
    if (!svc.href?.trim()) missing.push(`Link ${index + 1} URL`);
  });

  return missing;
};

export default function ServiceDetailsAdminForm({ data, lang, onChange }) {
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const widget = useRef(null);

  const content = data[lang] || {};
  const services = data.services || [];
  const heroImage = data.heroImage || {};
  const isRtl = lang === "ps" || lang === "fa";

  // Check missing fields for active tab & all languages
  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const isHeroMissing = !heroImage?.url;

  useEffect(() => {
    let script = document.querySelector(SCRIPT);
    const checkReady = () => {
      if (window.cloudinary) setReady(true);
    };

    if (window.cloudinary) {
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

  const updateText = (field, value) =>
    onChange({ ...data, [lang]: { ...content, [field]: value } });

  const updateImage = (url, publicId) =>
    onChange({ ...data, heroImage: { url, publicId } });

  const addService = () =>
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

  const updateService = (index, field, value, isTranslation = false) => {
    const newServices = [...services];
    const target = { ...newServices[index] };

    if (isTranslation) {
      const transObj = target.translations || {};
      const langObj = transObj[lang] || {};

      target.translations = {
        ...transObj,
        [lang]: {
          ...langObj,
          label: value,
        },
      };

      const labelObj = typeof target.label === "object" ? target.label : {};
      target.label = {
        ...labelObj,
        [lang]: value,
      };
    } else {
      target[field] = value;
    }

    newServices[index] = target;
    onChange({ ...data, services: newServices });
  };

  const removeService = (index) =>
    onChange({ ...data, services: services.filter((_, i) => i !== index) });

  const openWidget = () => {
    if (uploading) return;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary not configured.");

    setUploading(true);
    widget.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local"],
        multiple: false,
        maxFileSize: 5_000_000,
        folder: "bexon/pages/services",
      },
      (err, result) => {
        if (err) toast.error("Upload failed.");
        if (result?.event === "success") {
          updateImage(result.info.secure_url, result.info.public_id);
          toast.success("Image uploaded!");
        }
        if (["close", "abort"].includes(result?.event)) setUploading(false);
      },
    );
    widget.current.open();
  };

  const getInputClass = (val) =>
    `w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors ${
      !val?.trim() ? "border-red-500 bg-red-500/5" : "border-[var(--border)]"
    }`;

  const sectionClass =
    "rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 space-y-4 mb-4";

  return (
    <div>
      {/* VALIDATION STATUS BANNER */}
      <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <h3 className="mb-2 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
          Multi-Language Completeness Status
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              !isHeroMissing
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {!isHeroMissing ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Hero Image
          </span>

          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              enMissing.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {enMissing.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            EN (
            {enMissing.length === 0
              ? "Complete"
              : `${enMissing.length} missing`}
            )
          </span>

          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              psMissing.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {psMissing.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            PS (
            {psMissing.length === 0
              ? "Complete"
              : `${psMissing.length} missing`}
            )
          </span>

          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              faMissing.length === 0
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {faMissing.length === 0 ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            FA (
            {faMissing.length === 0
              ? "Complete"
              : `${faMissing.length} missing`}
            )
          </span>
        </div>

        {currentMissing.length > 0 && (
          <div className="mt-3 text-xs text-red-500">
            ⚠️ Missing in current language ({lang.toUpperCase()}):{" "}
            <span className="font-semibold">{currentMissing.join(", ")}</span>
          </div>
        )}
      </div>

      {/* HERO IMAGE */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <ImagePlus size={18} className="text-[var(--accent)]" /> Hero Image
          (Shared) <span className="text-red-500">*</span>
        </h2>
        <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {heroImage.url ? (
            <img
              src={heroImage.url}
              alt="Hero"
              className="max-h-56 w-full object-cover"
            />
          ) : (
            <div className="py-8 text-center text-red-500">
              <ImagePlus size={32} className="mx-auto mb-2" />
              <p className="text-sm font-semibold">Hero image is required</p>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={openWidget}
            disabled={!ready || uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            {uploading ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <UploadCloud size={16} />
            )}
            {heroImage.url ? "Change Image" : "Upload Image"}
          </button>
          {heroImage.url && (
            <button
              type="button"
              onClick={() => updateImage("", "")}
              className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </section>

      {/* TEXT CONTENT */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Text size={18} className="text-[var(--accent)]" /> Content (
          {lang.toUpperCase()})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Main Title <span className="text-red-500">*</span>
            </label>
            <input
              dir={isRtl ? "rtl" : "ltr"}
              value={content.mainTitle || ""}
              onChange={(e) => updateText("mainTitle", e.target.value)}
              className={getInputClass(content.mainTitle)}
              placeholder="e.g. Transforming Customer:"
            />
            {!content.mainTitle?.trim() && (
              <p className="mt-1 text-xs text-red-500">
                Main Title is required in {lang.toUpperCase()}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Highlighted Title <span className="text-red-500">*</span>
            </label>
            <input
              dir={isRtl ? "rtl" : "ltr"}
              value={content.highlightedTitle || ""}
              onChange={(e) => updateText("highlightedTitle", e.target.value)}
              className={getInputClass(content.highlightedTitle)}
              placeholder="e.g. Tailored Solutions..."
            />
            {!content.highlightedTitle?.trim() && (
              <p className="mt-1 text-xs text-red-500">
                Highlighted Title is required in {lang.toUpperCase()}
              </p>
            )}
          </div>
        </div>

        {[1, 2, 3].map((num) => {
          const val = content[`description${num}`];
          return (
            <div key={num}>
              <label className="mb-1.5 block text-sm font-medium">
                Paragraph {num} <span className="text-red-500">*</span>
              </label>
              <textarea
                rows="3"
                dir={isRtl ? "rtl" : "ltr"}
                value={val || ""}
                onChange={(e) =>
                  updateText(`description${num}`, e.target.value)
                }
                className={getInputClass(val)}
              />
              {!val?.trim() && (
                <p className="mt-1 text-xs text-red-500">
                  Paragraph {num} is required in {lang.toUpperCase()}
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* SIDEBAR & SERVICES */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Layout size={18} className="text-[var(--accent)]" /> Sidebar & Links
          ({lang.toUpperCase()})
        </h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Sidebar Tag <span className="text-red-500">*</span>
            </label>
            <input
              dir={isRtl ? "rtl" : "ltr"}
              value={content.sidebarTag || ""}
              onChange={(e) => updateText("sidebarTag", e.target.value)}
              className={getInputClass(content.sidebarTag)}
            />
            {!content.sidebarTag?.trim() && (
              <p className="mt-1 text-xs text-red-500">
                Sidebar Tag is required in {lang.toUpperCase()}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Sidebar Title <span className="text-red-500">*</span>
            </label>
            <input
              dir={isRtl ? "rtl" : "ltr"}
              value={content.sidebarTitle || ""}
              onChange={(e) => updateText("sidebarTitle", e.target.value)}
              className={getInputClass(content.sidebarTitle)}
            />
            {!content.sidebarTitle?.trim() && (
              <p className="mt-1 text-xs text-red-500">
                Sidebar Title is required in {lang.toUpperCase()}
              </p>
            )}
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <h3 className="text-sm font-bold">More Services Links</h3>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>

        <div className="space-y-3">
          {services.length === 0 && (
            <p className="py-2 text-center text-xs text-[var(--text-muted)]">
              No links added.
            </p>
          )}
          {services.map((svc, i) => {
            const labelValue = getServiceLabel(svc, lang);
            const isLabelMissing = !labelValue?.trim();
            const isHrefMissing = !svc.href?.trim();

            return (
              <div
                key={svc.id || i}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:flex-row sm:items-start"
              >
                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <Type size={12} /> Label ({lang.toUpperCase()}){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    dir={isRtl ? "rtl" : "ltr"}
                    value={labelValue}
                    onChange={(e) =>
                      updateService(i, "label", e.target.value, true)
                    }
                    className={getInputClass(labelValue)}
                  />
                  {isLabelMissing && (
                    <p className="mt-1 text-xs text-red-500">
                      Label required in {lang.toUpperCase()}
                    </p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                    <LinkIcon size={12} /> URL{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    dir="ltr"
                    value={svc.href || ""}
                    onChange={(e) =>
                      updateService(i, "href", e.target.value, false)
                    }
                    className={getInputClass(svc.href)}
                  />
                  {isHrefMissing && (
                    <p className="mt-1 text-xs text-red-500">URL is required</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeService(i)}
                  className="mt-6 rounded-lg p-2 text-red-500 hover:bg-red-500/10 sm:mt-7"
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
