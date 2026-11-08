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
  if (theme === "dark") return { palette: palettes.dark };
  return { palette: palettes.light };
}

const SCRIPT = "script[data-cloudinary-widget]";

// Helper to strip HTML tags (for rich-text validation)
function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ==========================================
// FIELD DEFINITIONS
// ==========================================
const SECTION_FIELDS = [
  {
    id: "tagline",
    label: "Tagline",
    placeholder: "e.g. Our Features",
    minHeight: 80,
  },
  {
    id: "title",
    label: "Section Heading",
    placeholder: "e.g. Why choose us",
    minHeight: 80,
  },
];

const CARD_FIELDS = [
  {
    id: "title",
    label: "Card Title",
    placeholder: "e.g. Fast Delivery",
    minHeight: 80,
  },
  {
    id: "description",
    label: "Card Description",
    placeholder: "Short description...",
    minHeight: 120,
  },
];

// ==========================================
// HELPERS
// ==========================================
export function getCardField(card, langKey, fieldId) {
  if (!card) return "";
  if (!card.translations) return "";
  if (!card.translations[langKey]) return "";
  return card.translations[langKey][fieldId] || "";
}

// Check missing translated fields (section + cards) for one language
// Strips HTML first since all fields are rich text now
export function checkMissingFields(data = {}, langKey = "en") {
  const missing = [];

  // Section fields
  let content = {};
  if (data.translations && data.translations[langKey]) {
    content = data.translations[langKey];
  }

  for (let i = 0; i < SECTION_FIELDS.length; i++) {
    const field = SECTION_FIELDS[i];
    const value = content[field.id] || "";
    if (!stripHtml(value)) {
      missing.push(field.label);
    }
  }

  // Card fields
  const cards = data.cards || [];
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    for (let j = 0; j < CARD_FIELDS.length; j++) {
      const field = CARD_FIELDS[j];
      const value = getCardField(card, langKey, field.id);
      if (!stripHtml(value)) {
        missing.push(`Card ${i + 1} ${field.label}`);
      }
    }
  }

  return missing;
}

// Check which cards are missing icons
export function checkMissingIcons(data = {}) {
  const missing = [];
  const cards = data.cards || [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const iconUrl = card && card.icon && card.icon.url ? card.icon.url : "";
    if (!iconUrl.trim()) {
      missing.push(`Card ${i + 1} icon`);
    }
  }

  return missing;
}

// Main validation
export function validateFeatures(data = {}) {
  const cards = data.cards || [];
  const noCards = cards.length === 0;
  const missingIcons = checkMissingIcons(data);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");

  let isValid = true;
  if (noCards) isValid = false;
  if (missingIcons.length > 0) isValid = false;
  if (enMissing.length > 0) isValid = false;
  if (psMissing.length > 0) isValid = false;
  if (faMissing.length > 0) isValid = false;

  return {
    isValid,
    noCards,
    missingIcons,
    enMissing,
    psMissing,
    faMissing,
  };
}

// ==========================================
// MAIN COMPONENT
// ==========================================
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
  const [checking, setChecking] = useState(false);
  const widget = useRef(null);

  // Read current data safely
  const translations = data.translations || {};
  const content = translations[lang] || {};
  const cards = data.cards || [];

  let isRtl = false;
  if (lang === "ps" || lang === "fa") isRtl = true;

  // Validation results
  const currentMissing = checkMissingFields(data, lang);
  const enMissing = checkMissingFields(data, "en");
  const psMissing = checkMissingFields(data, "ps");
  const faMissing = checkMissingFields(data, "fa");
  const missingIcons = checkMissingIcons(data);
  const noCards = cards.length === 0;

  // Helper: is this value empty when we should show errors?
  // Strips HTML first since all fields are rich text now
  function isErr(val) {
    if (!showErrors) return false;
    if (!stripHtml(val)) return true;
    return false;
  }

  /* ---------- Dark mode detection ---------- */
  useEffect(() => {
    function updateTheme() {
      const isDark = document.documentElement.classList.contains("dark");
      setDark(isDark);
    }
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

    function checkReady() {
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        setReady(true);
      }
    }

    if (window.cloudinary && window.cloudinary.createUploadWidget) {
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
      if (script) script.removeEventListener("load", checkReady);
    };
  }, []);

  /* ---------- Section text update ---------- */
  function updateSectionText(fieldId, value) {
    const newContent = { ...content };
    newContent[fieldId] = value;

    const newTranslations = { ...translations };
    newTranslations[lang] = newContent;

    onChange({ ...data, translations: newTranslations });
  }

  /* ---------- Card text update ---------- */
  function updateCardText(cardIndex, fieldId, value) {
    const newCards = [...cards];
    const target = { ...newCards[cardIndex] };

    const transObj = target.translations || {};
    const langObj = transObj[lang] || {};

    const newLangObj = { ...langObj };
    newLangObj[fieldId] = value;

    const newTransObj = { ...transObj };
    newTransObj[lang] = newLangObj;

    target.translations = newTransObj;
    newCards[cardIndex] = target;

    onChange({ ...data, cards: newCards });
  }

  /* ---------- Card icon update ---------- */
  function updateCardIcon(cardIndex, url, publicId) {
    const newCards = [...cards];
    const target = { ...newCards[cardIndex] };
    target.icon = { url: url, publicId: publicId };
    newCards[cardIndex] = target;

    onChange({ ...data, cards: newCards });
  }

  /* ---------- Add new card ---------- */
  function addCard() {
    const newCard = {
      id: crypto.randomUUID(),
      icon: { url: "", publicId: "" },
      translations: {
        en: { title: "", description: "" },
        ps: { title: "", description: "" },
        fa: { title: "", description: "" },
      },
    };

    const newCards = [...cards, newCard];
    onChange({ ...data, cards: newCards });
  }

  /* ---------- Remove whole card (UI only) ---------- */
  function removeCard(index) {
    if (deletingIndex !== null) return;
    if (uploadingIndex !== null) return;

    // Only remove from UI — do NOT delete from Cloudinary
    // Image stays in Cloudinary so backup/restore works
    const newCards = cards.filter(function (_, i) {
      return i !== index;
    });

    onChange({ ...data, cards: newCards });
    toast.success("Card removed from view.");
  }

  /* ---------- Remove icon only (UI only) ---------- */
  function removeCardIcon(index) {
    if (deletingIndex !== null) return;
    if (uploadingIndex !== null) return;

    // Only clear from UI — do NOT delete from Cloudinary
    updateCardIcon(index, "", "");
    toast.success("Icon removed from view.");
  }

  /* ---------- Open Cloudinary widget ---------- */
  async function openWidget(cardIndex) {
    if (uploadingIndex !== null) return;
    if (deletingIndex !== null) return;
    if (checking) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Check your Cloudinary environment variables.");
      return;
    }
    if (!window.cloudinary || !window.cloudinary.createUploadWidget) {
      toast.error("Cloudinary widget is still loading. Please wait.");
      return;
    }

    // Permission check BEFORE opening widget
    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    setUploadingIndex(cardIndex);

    // Build theme
    let themeName = "light";
    if (dark) themeName = "dark";

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/pages/features",
          cropping: false,
          styles: cloudinaryStyles(themeName),
        },
        function (error, result) {
          if (error) {
            toast.error(error.message || "Image upload failed.");
            setUploadingIndex(null);
            return;
          }

          if (result && result.event === "success") {
            const newPublicId = result.info.public_id;
            const newUrl = result.info.secure_url;

            // Old image stays in Cloudinary for backup/restore safety
            updateCardIcon(cardIndex, newUrl, newPublicId);
            toast.success("Icon uploaded!");
          }

          if (
            result &&
            (result.event === "close" || result.event === "abort")
          ) {
            setUploadingIndex(null);
          }
        },
      );

      widget.current.open();
    } catch (err) {
      toast.error("Could not open Cloudinary widget.");
      setUploadingIndex(null);
    }
  }

  /* ---------- Rich text wrapper class ---------- */
  function richWrapperClass(hasError) {
    if (hasError) {
      return "overflow-hidden rounded-xl border border-red-500 bg-red-500/5 transition-colors";
    }
    return "overflow-hidden rounded-xl border border-[var(--border)] transition-colors";
  }

  const sectionClass =
    "mb-4 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5";

  // Should we highlight the main status banner as error?
  let hasAnyError = false;
  if (showErrors) {
    if (noCards) hasAnyError = true;
    if (missingIcons.length > 0) hasAnyError = true;
    if (currentMissing.length > 0) hasAnyError = true;
  }

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
          {/* Cards count chip */}
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

          {/* Icons chip */}
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
          ].map(function (entry) {
            const code = entry[0];
            const missing = entry[1];
            return (
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
                {missing.length === 0
                  ? "Complete"
                  : `${missing.length} missing`}
                )
              </span>
            );
          })}
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
          {SECTION_FIELDS.map(function (field) {
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
                    onChange={function (html) {
                      updateSectionText(field.id, html);
                    }}
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
          {cards.map(function (card, i) {
            let iconUrl = "";
            if (card && card.icon && card.icon.url) iconUrl = card.icon.url;

            const iconMissing = !iconUrl.trim();
            const isUploading = uploadingIndex === i;
            const isDeleting = deletingIndex === i;

            // Pick a stable key
            let cardKey = i;
            if (card.id) cardKey = card.id;
            else if (card._id) cardKey = card._id;

            return (
              <div
                key={cardKey}
                className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Card {i + 1}</span>
                  <button
                    type="button"
                    onClick={function () {
                      removeCard(i);
                    }}
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

                {/* Icon preview area */}
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

                {/* Upload / Remove icon buttons */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={function () {
                      openWidget(i);
                    }}
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
                        : iconUrl
                          ? "Replace Icon"
                          : ready
                            ? "Upload Icon"
                            : "Loading..."}
                  </button>

                  {iconUrl && (
                    <button
                      type="button"
                      onClick={function () {
                        removeCardIcon(i);
                      }}
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

                {/* Card text fields (Rich Text) */}
                {CARD_FIELDS.map(function (field) {
                  const val = getCardField(card, lang, field.id);
                  const hasError = isErr(val);

                  return (
                    <div key={field.id}>
                      <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
                        <Type size={12} /> {field.label} ({lang.toUpperCase()})
                      </label>
                      <div className={richWrapperClass(hasError)}>
                        <RichTextEditor
                          value={val}
                          onChange={function (html) {
                            updateCardText(i, field.id, html);
                          }}
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
            );
          })}
        </div>
      </section>
    </div>
  );
}

// Attach static validate method directly to component so FlatEditorPage finds it
FeaturesAdminForm.validate = validateFeatures;
