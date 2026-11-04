"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import RichTextEditor from "../shared/RichTextEditor";

/* ─────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────── */
const LANGUAGES = ["en", "ps", "fa"];
const RTL_LANGUAGES = new Set(["ps", "fa"]);

const SECTION_FIELDS = [
  {
    key: "sectionTitle",
    label: "Section Title",
    type: "input",
    required: true,
    maxLength: 120,
  },
  {
    key: "sectionSubtitle",
    label: "Section Subtitle",
    type: "textarea",
    required: true,
    maxLength: 240,
  },
];

const ITEM_FIELDS = [
  {
    key: "title",
    label: "Title",
    type: "input",
    required: true,
    maxLength: 140,
  },
  {
    key: "subtitle",
    label: "Subtitle",
    type: "input",
    required: true,
    maxLength: 200,
  },
  {
    key: "description",
    label: "Description",
    type: "rich",
    required: true,
    maxLength: 3000,
  },
];

const CLOUDINARY_SCRIPT_SELECTOR = "script[data-cloudinary-widget]";
const CLOUDINARY_SCRIPT_SRC =
  "https://upload-widget.cloudinary.com/global/all.js";
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_FOLDER = "bexon/pages/news";
const ALLOWED_FORMATS = ["jpg", "jpeg", "png", "webp"];
const MAX_FILE_SIZE = 5_000_000;

/* ─────────────────────────────────────────────
   Stable unique id
   ───────────────────────────────────────────── */
function makeUid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `n_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */
function textValueEmpty(field, value) {
  if (field.type === "rich") return RichTextEditor.isEmpty(value);
  return !String(value ?? "").trim();
}

function buildEmptyTranslations(fields) {
  return LANGUAGES.reduce((acc, lang) => {
    acc[lang] = fields.reduce((obj, f) => {
      obj[f.key] = "";
      return obj;
    }, {});
    return acc;
  }, {});
}

function buildEmptyItem(nextOrder = 1) {
  return {
    _uid: makeUid(),
    image: { url: "", publicId: "" },
    date: "",
    order: nextOrder,
    translations: buildEmptyTranslations(ITEM_FIELDS),
  };
}

function formatDateHuman(iso, lang) {
  if (!iso) return "—";
  try {
    const localeMap = { en: "en-US", ps: "ps-AF", fa: "fa-IR" };
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(localeMap[lang] || "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ─────────────────────────────────────────────
   Validation
   ───────────────────────────────────────────── */
function collectMissingForLang(data, langKey) {
  const missing = [];
  const sectionT = data?.translations?.[langKey] || {};
  SECTION_FIELDS.forEach((f) => {
    if (f.required && textValueEmpty(f, sectionT[f.key])) missing.push(f.label);
  });

  (data?.items || []).forEach((item, i) => {
    const itemT = item?.translations?.[langKey] || {};
    ITEM_FIELDS.forEach((f) => {
      if (f.required && textValueEmpty(f, itemT[f.key])) {
        missing.push(`News ${i + 1} ${f.label}`);
      }
    });
  });

  return missing;
}

function validateNews(data) {
  const enMissing = collectMissingForLang(data, "en");
  const psMissing = collectMissingForLang(data, "ps");
  const faMissing = collectMissingForLang(data, "fa");

  const imageMissing = [];
  const dateMissing = [];
  (data?.items || []).forEach((n, i) => {
    if (!n?.image?.url) imageMissing.push(`News ${i + 1} Image`);
    if (!n?.date) dateMissing.push(`News ${i + 1} Date`);
  });

  return {
    isValid:
      enMissing.length === 0 &&
      psMissing.length === 0 &&
      faMissing.length === 0 &&
      imageMissing.length === 0 &&
      dateMissing.length === 0 &&
      (data?.items || []).length > 0,
    enMissing,
    psMissing,
    faMissing,
    imageMissing,
    dateMissing,
  };
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

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export default function NewsAdminForm({
  data,
  lang = "en",
  onChange,
  showErrors = false,
}) {
  const isRtl = RTL_LANGUAGES.has(lang);

  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [uploadingUid, setUploadingUid] = useState(null);
  const [deletingUid, setDeletingUid] = useState(null);
  const [removingUid, setRemovingUid] = useState(null);
  const [theme, setTheme] = useState("light");

  const widgetRef = useRef(null);
  const isMountedRef = useRef(true);

  /* ── Mount tracker (Strict Mode safe) ── */
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
    const onError = () => toast.error("Could not load image uploader.");
    if (!script) {
      script = document.createElement("script");
      script.src = CLOUDINARY_SCRIPT_SRC;
      script.async = true;
      script.dataset.cloudinaryWidget = "true";
      document.head.appendChild(script);
    }
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);
    return () => {
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
    };
  }, []);

  /* ── Normalized data ── */
  const normalized = useMemo(() => {
    const safe = data || {};
    return {
      translations: {
        en: {
          ...buildEmptyTranslations(SECTION_FIELDS).en,
          ...(safe.translations?.en || {}),
        },
        ps: {
          ...buildEmptyTranslations(SECTION_FIELDS).ps,
          ...(safe.translations?.ps || {}),
        },
        fa: {
          ...buildEmptyTranslations(SECTION_FIELDS).fa,
          ...(safe.translations?.fa || {}),
        },
      },
      items: Array.isArray(safe.items)
        ? safe.items.map((n) => (n?._uid ? n : { ...n, _uid: makeUid() }))
        : [],
    };
  }, [data]);

  /* ── Mutators ── */
  const emit = useCallback((next) => onChange?.(next), [onChange]);

  const updateSectionTranslation = useCallback(
    (key, value) => {
      emit({
        ...normalized,
        translations: {
          ...normalized.translations,
          [lang]: { ...normalized.translations[lang], [key]: value },
        },
      });
    },
    [normalized, lang, emit],
  );

  const updateItemByUid = useCallback(
    (uid, patch) => {
      const items = normalized.items.map((n) =>
        n._uid === uid ? { ...n, ...patch } : n,
      );
      emit({ ...normalized, items });
    },
    [normalized, emit],
  );

  const updateItemTranslationByUid = useCallback(
    (uid, key, value) => {
      const items = normalized.items.map((n) => {
        if (n._uid !== uid) return n;
        return {
          ...n,
          translations: {
            ...n.translations,
            [lang]: { ...(n.translations?.[lang] || {}), [key]: value },
          },
        };
      });
      emit({ ...normalized, items });
    },
    [normalized, lang, emit],
  );

  const addItem = useCallback(() => {
    const nextOrder =
      normalized.items.reduce(
        (max, n) => Math.max(max, Number(n.order) || 0),
        0,
      ) + 1;
    emit({
      ...normalized,
      items: [...normalized.items, buildEmptyItem(nextOrder)],
    });
  }, [normalized, emit]);

  const deleteCloudinaryAsset = async (publicId) => {
    if (!publicId) return;
    try {
      await fetch("/api/admin/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
    } catch (err) {
      console.warn("Cloudinary delete failed:", publicId, err);
    }
  };

  const removeItemByUid = useCallback(
    async (uid) => {
      const item = normalized.items.find((n) => n._uid === uid);
      if (!item) return;
      const confirmed = window.confirm(
        "Remove this news item? This cannot be undone.",
      );
      if (!confirmed) return;

      setRemovingUid(uid);
      try {
        if (item.image?.publicId)
          await deleteCloudinaryAsset(item.image.publicId);
        const items = normalized.items.filter((n) => n._uid !== uid);
        emit({ ...normalized, items });
        toast.success("News removed");
      } finally {
        if (isMountedRef.current) setRemovingUid(null);
      }
    },
    [normalized, emit],
  );

  /* ── Image upload ── */
  const openUpload = useCallback(
    (uid) => {
      if (!CLOUD_NAME || !UPLOAD_PRESET) {
        toast.error("Cloudinary is not configured.");
        return;
      }
      if (!cloudinaryReady || !window.cloudinary?.createUploadWidget) {
        toast.message("Uploader is still loading…");
        return;
      }

      const item = normalized.items.find((n) => n._uid === uid);
      const oldPublicId = item?.image?.publicId || "";
      setUploadingUid(uid);

      try {
        widgetRef.current?.destroy?.();
      } catch {}

      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: UPLOAD_PRESET,
          folder: UPLOAD_FOLDER,
          multiple: false,
          sources: ["local", "url", "camera"],
          clientAllowedFormats: ALLOWED_FORMATS,
          maxFileSize: MAX_FILE_SIZE,
          styles: cloudinaryStyles(theme),
        },
        async (err, res) => {
          // Always clear spinner on terminal events — even if unmounted
          const clear = () => setUploadingUid(null);

          if (err) {
            console.error("Cloudinary error:", err);
            clear();
            toast.error(err?.statusText || "Upload failed");
            return;
          }

          if (!res?.event) return;

          if (res.event === "success" && res.info?.secure_url) {
            if (isMountedRef.current) {
              updateItemByUid(uid, {
                image: {
                  url: res.info.secure_url,
                  publicId: res.info.public_id,
                },
              });
              if (oldPublicId && oldPublicId !== res.info.public_id) {
                deleteCloudinaryAsset(oldPublicId);
              }
              toast.success("Image uploaded");
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
        setUploadingUid(null);
        toast.error("Could not open uploader");
      }
    },
    [cloudinaryReady, normalized, theme, updateItemByUid],
  );

  const removeImageByUid = useCallback(
    async (uid) => {
      const item = normalized.items.find((n) => n._uid === uid);
      if (!item?.image?.url) return;
      setDeletingUid(uid);
      try {
        await deleteCloudinaryAsset(item.image.publicId);
        updateItemByUid(uid, { image: { url: "", publicId: "" } });
        toast.success("Image removed");
      } catch {
        toast.error("Failed to remove image");
      } finally {
        if (isMountedRef.current) setDeletingUid(null);
      }
    },
    [normalized, updateItemByUid],
  );

  /* ── Validation summary ── */
  const summary = useMemo(() => {
    const enMissing = collectMissingForLang(normalized, "en");
    const psMissing = collectMissingForLang(normalized, "ps");
    const faMissing = collectMissingForLang(normalized, "fa");
    const imageMissing = normalized.items.filter((n) => !n?.image?.url).length;
    const dateMissing = normalized.items.filter((n) => !n?.date).length;
    return { enMissing, psMissing, faMissing, imageMissing, dateMissing };
  }, [normalized]);

  const StatusChip = ({ label, count }) => {
    const ok = count === 0;
    const Icon = ok ? CheckCircle2 : AlertCircle;
    const color = !showErrors
      ? "text-[var(--muted)]"
      : ok
        ? "text-emerald-500"
        : "text-red-500";
    return (
      <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
        <Icon size={14} />
        <span>
          {label}: {ok ? "complete" : `${count} missing`}
        </span>
      </div>
    );
  };

  const isFieldError = (field, value) =>
    showErrors && field.required && textValueEmpty(field, value);
  const isImageError = (url) => showErrors && !url;
  const isDateError = (date) => showErrors && !date;

  return (
    <div className="space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      {/* STATUS BANNER */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <StatusChip label="English" count={summary.enMissing.length} />
          <StatusChip label="Pashto" count={summary.psMissing.length} />
          <StatusChip label="Farsi" count={summary.faMissing.length} />
          <StatusChip label="Images" count={summary.imageMissing} />
          <StatusChip label="Dates" count={summary.dateMissing} />
        </div>
      </div>

      {/* SECTION HEADING */}
      <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)]">
          Section Heading ({lang.toUpperCase()})
        </h3>

        {SECTION_FIELDS.map((field) => {
          const val = normalized.translations[lang]?.[field.key] ?? "";
          const err = isFieldError(field, val);
          const borderClass = err ? "border-red-500" : "border-[var(--border)]";

          return (
            <div key={field.key}>
              <label
                className="mb-1.5 block text-sm font-medium"
                htmlFor={`section-${field.key}`}
              >
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={`section-${field.key}`}
                  value={val}
                  onChange={(e) =>
                    updateSectionTranslation(field.key, e.target.value)
                  }
                  rows={2}
                  maxLength={field.maxLength}
                  aria-invalid={err}
                  className={`w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)] ${borderClass}`}
                />
              ) : (
                <input
                  id={`section-${field.key}`}
                  type="text"
                  value={val}
                  onChange={(e) =>
                    updateSectionTranslation(field.key, e.target.value)
                  }
                  maxLength={field.maxLength}
                  aria-invalid={err}
                  className={`w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)] ${borderClass}`}
                />
              )}
              {err && (
                <p className="mt-1 text-xs text-red-500">
                  {field.label} is required
                </p>
              )}
            </div>
          );
        })}
      </section>

      {/* NEWS ITEMS LIST */}
      <div className="space-y-4">
        {normalized.items.map((item, index) => {
          const uid = item._uid;
          const itemT = item.translations?.[lang] || {};
          const imgUrl = item.image?.url || "";
          const imgErr = isImageError(imgUrl);
          const dateErr = isDateError(item.date);

          return (
            <section
              key={uid}
              className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--muted)]">
                  News {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeItemByUid(uid)}
                  disabled={removingUid === uid}
                  className="flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingUid === uid ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />{" "}
                      Removing
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} /> Remove
                    </>
                  )}
                </button>
              </div>

              {/* IMAGE */}
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Cover Image
                </label>
                <div
                  className={`flex items-center gap-3 rounded-xl border p-3 ${imgErr ? "border-red-500" : "border-[var(--border)]"}`}
                >
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-[var(--surface)]">
                    {imgUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={imgUrl}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openUpload(uid)}
                      disabled={uploadingUid === uid || !cloudinaryReady}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingUid === uid ? (
                        <>
                          <LoaderCircle size={14} className="animate-spin" />{" "}
                          Uploading
                        </>
                      ) : (
                        <>
                          <Upload size={14} /> {imgUrl ? "Replace" : "Upload"}
                        </>
                      )}
                    </button>
                    {imgUrl && (
                      <button
                        type="button"
                        onClick={() => removeImageByUid(uid)}
                        disabled={deletingUid === uid}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingUid === uid ? (
                          <>
                            <LoaderCircle size={14} className="animate-spin" />{" "}
                            Removing
                          </>
                        ) : (
                          <>
                            <X size={14} /> Remove
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  JPG, PNG or WEBP. Max 5 MB.
                </p>
                {imgErr && (
                  <p className="mt-1 text-xs text-red-500">Image is required</p>
                )}
              </div>

              {/* DATE + ORDER row */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    htmlFor={`date-${uid}`}
                  >
                    Publish Date
                  </label>
                  <div
                    className={`flex items-center gap-2 rounded-xl border bg-[var(--background)] px-3 py-2 transition-colors focus-within:border-[var(--accent)] ${dateErr ? "border-red-500" : "border-[var(--border)]"}`}
                  >
                    <Calendar size={16} className="text-[var(--muted)]" />
                    <input
                      id={`date-${uid}`}
                      type="date"
                      value={item.date || ""}
                      onChange={(e) =>
                        updateItemByUid(uid, { date: e.target.value })
                      }
                      aria-invalid={dateErr}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                  {dateErr && (
                    <p className="mt-1 text-xs text-red-500">
                      Date is required
                    </p>
                  )}
                </div>

                <div>
                  <label
                    className="mb-1.5 block text-sm font-medium"
                    htmlFor={`order-${uid}`}
                  >
                    Display Order
                  </label>
                  <input
                    id={`order-${uid}`}
                    type="number"
                    min={1}
                    step={1}
                    value={Number.isFinite(item.order) ? item.order : index + 1}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      updateItemByUid(uid, {
                        order:
                          Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
                      });
                    }}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>

              {/* TRANSLATED FIELDS */}
              {ITEM_FIELDS.map((field) => {
                const val = itemT[field.key] ?? "";
                const err = isFieldError(field, val);
                const borderClass = err
                  ? "border-red-500"
                  : "border-[var(--border)]";
                const inputId = `item-${uid}-${field.key}`;

                return (
                  <div key={field.key}>
                    <label
                      className="mb-1.5 block text-sm font-medium"
                      htmlFor={inputId}
                    >
                      {field.label} ({lang.toUpperCase()})
                    </label>

                    {field.type === "rich" ? (
                      <RichTextEditor
                        value={val}
                        onChange={(html) =>
                          updateItemTranslationByUid(uid, field.key, html)
                        }
                        isRtl={isRtl}
                        error={err}
                        placeholder={`Write ${field.label.toLowerCase()}…`}
                        minHeight={200}
                      />
                    ) : field.type === "textarea" ? (
                      <textarea
                        id={inputId}
                        value={val}
                        onChange={(e) =>
                          updateItemTranslationByUid(
                            uid,
                            field.key,
                            e.target.value,
                          )
                        }
                        rows={3}
                        maxLength={field.maxLength}
                        aria-invalid={err}
                        className={`w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)] ${borderClass}`}
                      />
                    ) : (
                      <input
                        id={inputId}
                        type="text"
                        value={val}
                        onChange={(e) =>
                          updateItemTranslationByUid(
                            uid,
                            field.key,
                            e.target.value,
                          )
                        }
                        maxLength={field.maxLength}
                        aria-invalid={err}
                        className={`w-full rounded-xl border bg-[var(--background)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)] ${borderClass}`}
                      />
                    )}

                    {err && (
                      <p className="mt-1 text-xs text-red-500">
                        {field.label} is required
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>

      {/* ADD BUTTON */}
      <button
        type="button"
        onClick={addItem}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        <Plus size={16} /> Add News Item
      </button>

      {/* LIVE PREVIEW */}
      <div className="mt-6 space-y-4">
        <h3 className="text-sm font-semibold text-[var(--muted)]">
          Live Preview ({lang.toUpperCase()})
        </h3>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-center">
          <h2 className="text-xl font-bold text-[var(--foreground)]">
            {normalized.translations[lang]?.sectionTitle || "—"}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {normalized.translations[lang]?.sectionSubtitle || "—"}
          </p>
        </div>

        {normalized.items.length > 0 && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {[...normalized.items]
              .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0))
              .map((n) => {
                const t = n.translations?.[lang] || {};
                const desc = t.description || "";
                return (
                  <article
                    key={n._uid}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] transition-shadow hover:shadow-lg"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-[var(--background)]">
                      {n.image?.url && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={n.image.url}
                          alt={t.title || "News"}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="space-y-2 p-4">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--accent)]">
                        <Calendar size={12} />
                        <span>{formatDateHuman(n.date, lang)}</span>
                      </div>
                      <h4 className="text-base font-bold text-[var(--foreground)]">
                        {t.title || "—"}
                      </h4>
                      <p className="text-sm text-[var(--muted)]">
                        {t.subtitle || "—"}
                      </p>
                      {desc ? (
                        <div
                          className="rt-preview text-sm text-[var(--foreground)]"
                          dir={isRtl ? "rtl" : "ltr"}
                          dangerouslySetInnerHTML={{ __html: desc }}
                        />
                      ) : (
                        <p className="text-xs text-[var(--muted)]">
                          No description yet.
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

/* Attach static validator */
NewsAdminForm.validate = validateNews;
