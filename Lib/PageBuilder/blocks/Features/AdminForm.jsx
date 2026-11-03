/* eslint-disable @next/next/no-img-element */
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Plus,
  Sparkles,
  Text,
  Trash2,
  Type,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SCRIPT = "script[data-cloudinary-widget]";

// ONE list used for section inputs + validation
const SECTION_FIELDS = [
  { id: "tagline", label: "Tagline", placeholder: "e.g. Our Features" },
  {
    id: "title",
    label: "Section Heading",
    placeholder: "e.g. Why choose us",
  },
];

// ONE list used for card inputs + validation
const CARD_FIELDS = [
  { id: "title", label: "Card Title", placeholder: "e.g. Fast Delivery" },
  {
    id: "description",
    label: "Card Description",
    type: "textarea",
    placeholder: "Short description...",
  },
];

// Helper: safely pull a card field value for a language
export const getCardField = (card, langKey, fieldId) => {
  if (!card) return "";
  return card?.translations?.[langKey]?.[fieldId] || "";
};

// Check missing fields for a specific language
export const checkMissingFields = (data = {}, langKey = "en") => {
  const content = data?.translations?.[langKey] || {};
  const cards = data?.cards || [];
  const missing = [];

  SECTION_FIELDS.forEach((field) => {
    if (!String(content[field.id] || "").trim()) {
      missing.push(field.label);
    }
  });

  cards.forEach((card, index) => {
    CARD_FIELDS.forEach((field) => {
      if (!String(getCardField(card, langKey, field.id)).trim()) {
        missing.push(`Card ${index + 1} ${field.label}`);
      }
    });
  });

  return missing;
};

// Check missing icons across all cards
export const checkMissingIcons = (data = {}) => {
  const cards = data?.cards || [];
  const missing = [];
  cards.forEach((card, i) => {
    if (!card?.icon?.url?.trim()) missing.push(`Card ${i + 1} icon`);
  });
  return missing;
};

// Complete Validation Function
export function validateFeatures(data = {}) {
  const noCards = (data?.cards || []).length === 0;
  const missingIcons = checkMissingIcons(data);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");

  return {
    isValid:
      !noCards &&
      missingIcons.length === 0 &&
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0,
    noCards,
    missingIcons,
    enMissing,
    psMissing,
    faMissing,
  };
}

export default function FeaturesAdminForm({
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
  const cards = data?.cards || [];
  const isRtl = lang === "ps" || lang === "fa";

  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const missingIcons = checkMissingIcons(data);
  const noCards = cards.length === 0;

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

  /* ---------- Card text update ---------- */
  const updateCardText = (cardIndex, fieldId, value) => {
    const nextCards = [...cards];
    const target = { ...nextCards[cardIndex] };
    const transObj = target.translations || {};
    const langObj = transObj[lang] || {};
    target.translations = {
      ...transObj,
      [lang]: { ...langObj, [fieldId]: value },
    };
    nextCards[cardIndex] = target;
    onChange({ ...data, cards: nextCards });
  };

  /* ---------- Card icon update ---------- */
  const updateCardIcon = (cardIndex, url, publicId) => {
    const nextCards = [...cards];
    nextCards[cardIndex] = {
      ...nextCards[cardIndex],
      icon: { url, publicId },
    };
    onChange({ ...data, cards: nextCards });
  };

  /* ---------- Add / remove card ---------- */
  const addCard = () => {
    onChange({
      ...data,
      cards: [
        ...cards,
        {
          id: crypto.randomUUID(),
          icon: { url: "", publicId: "" },
          translations: {
            en: { title: "", description: "" },
            ps: { title: "", description: "" },
            fa: { title: "", description: "" },
          },
        },
      ],
    });
  };

  const removeCard = async (index) => {
    if (deletingIndex !== null || uploadingIndex !== null) return;
    const publicId = cards[index]?.icon?.publicId;
    if (publicId) {
      setDeletingIndex(index);
      await destroyCloudinaryImage(publicId);
      setDeletingIndex(null);
    }
    onChange({ ...data, cards: cards.filter((_, i) => i !== index) });
    toast.success("Card removed.");
  };

  /* ---------- Remove icon only ---------- */
  const removeCardIcon = async (index) => {
    if (deletingIndex !== null || uploadingIndex !== null) return;
    const publicId = cards[index]?.icon?.publicId;
    setDeletingIndex(index);
    if (publicId) await destroyCloudinaryImage(publicId);
    updateCardIcon(index, "", "");
    setDeletingIndex(null);
    toast.success("Icon removed.");
  };

  /* ---------- Open Cloudinary widget for a card ---------- */
  const openWidget = (cardIndex) => {
    if (uploadingIndex !== null || deletingIndex !== null) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return toast.error("Check your Cloudinary environment variables.");
    }
    if (!window.cloudinary?.createUploadWidget) {
      return toast.error("Cloudinary widget is still loading. Please wait.");
    }

    const oldPublicId = cards[cardIndex]?.icon?.publicId || "";
    setUploadingIndex(cardIndex);

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/pages/features",
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

            updateCardIcon(cardIndex, newUrl, newPublicId);
            toast.success(oldPublicId ? "Icon replaced!" : "Icon uploaded!");
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
    (noCards || missingIcons.length > 0 || currentMissing.length > 0);

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
          {/* Cards exist */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              !noCards
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {!noCards ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {cards.length} Card{cards.length === 1 ? "" : "s"}
          </span>

          {/* Icons */}
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              missingIcons.length === 0 && !noCards
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {missingIcons.length === 0 && !noCards ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            Icons (
            {missingIcons.length === 0
              ? "Complete"
              : `${missingIcons.length} missing`}
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
            Please add at least one card, upload all icons, and fill required
            fields in EN, PS, FA before publishing.
          </p>
        )}
      </div>

      {/* ==================== SECTION HEADING ==================== */}
      <section className={sectionClass}>
        <h2 className="flex items-center gap-2 font-bold">
          <Text size={18} className="text-[var(--accent)]" /> Section Heading (
          {lang.toUpperCase()})
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>
      </section>

      {/* ==================== FEATURE CARDS ==================== */}
      <section className={sectionClass}>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <Sparkles size={18} className="text-[var(--accent)]" /> Feature
            Cards ({cards.length})
          </h2>
          <button
            type="button"
            onClick={addCard}
            className="flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            <Plus size={14} /> Add Card
          </button>
        </div>

        {noCards && (
          <p
            className={`py-6 text-center text-sm ${
              showErrors ? "text-red-500" : "text-[var(--text-muted)]"
            }`}
          >
            {showErrors
              ? "At least one card is required."
              : 'No cards yet. Click "Add Card" to create one.'}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {cards.map((card, i) => {
            const iconUrl = card?.icon?.url || "";
            const iconMissing = !iconUrl.trim();
            const isUploading = uploadingIndex === i;
            const isDeleting = deletingIndex === i;

            return (
              <div
                key={card.id || card._id || i}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Card {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeCard(i)}
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

                {/* Icon area */}
                <div
                  className={`flex min-h-28 items-center justify-center overflow-hidden rounded-xl border bg-[var(--background)] ${
                    showErrors && iconMissing
                      ? "border-red-500 bg-red-500/5"
                      : "border-[var(--border)]"
                  }`}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={`Card ${i + 1} icon`}
                      className="max-h-24 object-contain p-3"
                    />
                  ) : (
                    <div
                      className={`py-4 text-center ${
                        showErrors && iconMissing
                          ? "text-red-500"
                          : "text-[var(--text-muted)]"
                      }`}
                    >
                      <ImagePlus
                        size={24}
                        className="mx-auto mb-1 opacity-60"
                      />
                      <p className="text-xs font-semibold">
                        {showErrors && iconMissing
                          ? "Icon required"
                          : "No icon uploaded"}
                      </p>
                    </div>
                  )}
                </div>

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
                      : iconUrl
                        ? "Replace Icon"
                        : ready
                          ? "Upload Icon"
                          : "Loading..."}
                  </button>

                  {iconUrl && (
                    <button
                      type="button"
                      onClick={() => removeCardIcon(i)}
                      disabled={isDeleting || isUploading}
                      className="cursor-pointer rounded-xl bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  )}
                </div>

                {/* Card text fields (DRY map) */}
                {CARD_FIELDS.map((field) => {
                  const val = getCardField(card, lang, field.id);
                  const isTextarea = field.type === "textarea";
                  const InputTag = isTextarea ? "textarea" : "input";

                  return (
                    <div key={field.id}>
                      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                        <Type size={12} /> {field.label} ({lang.toUpperCase()})
                      </label>
                      <InputTag
                        rows={isTextarea ? 3 : undefined}
                        dir={isRtl ? "rtl" : "ltr"}
                        value={val}
                        onChange={(e) =>
                          updateCardText(i, field.id, e.target.value)
                        }
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
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage can find it automatically!
FeaturesAdminForm.validate = validateFeatures;
