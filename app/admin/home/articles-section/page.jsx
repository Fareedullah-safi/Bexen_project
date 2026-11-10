"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────
   Cloudinary Configuration & Permission
   ────────────────────────────────────────────── */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    return res.ok && data?.success === true;
  } catch {
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

/* ==================== Image Picker ==================== */

function ImagePicker({
  value,
  publicId,
  onChange,
  disabled,
  cloudinaryReady,
  theme,
}) {
  const [imageError, setImageError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [value]);

  async function openCloudinaryWidget() {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error(
        "Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.",
      );
      return;
    }

    if (!cloudinaryReady || !window.cloudinary) {
      toast.error("Cloudinary is still loading. Try again shortly.");
      return;
    }

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: "homepage/articles",
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        maxFileSize: 5 * 1024 * 1024,
        showUploadMoreButton: false,
        cropping: false,
        theme: "minimal",
        styles: cloudinaryStyles(theme),
      },
      (error, result) => {
        if (error) {
          toast.error(error.message || "Cloudinary upload failed");
          return;
        }

        if (result?.event !== "success") return;

        const uploaded = result.info;

        if (
          !uploaded?.secure_url ||
          !uploaded?.public_id ||
          !uploaded.secure_url.startsWith("https://")
        ) {
          toast.error("Cloudinary did not return valid secure image details.");
          return;
        }

        onChange({
          image: uploaded.secure_url,
          publicId: uploaded.public_id,
        });

        setImageError(false);
        toast.success("Image uploaded successfully");
      },
    );

    widget.open();
  }

  function removeImage() {
    onChange({
      image: "",
      publicId: "",
    });

    setImageError(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {value && !imageError ? (
        <div className="relative flex h-52 items-center justify-center bg-[var(--background)] p-4">
          <div className="relative h-full w-full">
            <Image
              src={value}
              alt="Article preview"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
              onError={() => setImageError(true)}
              className="rounded-xl object-cover"
            />
          </div>

          <button
            type="button"
            onClick={removeImage}
            disabled={disabled}
            title="Remove image"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>

          {publicId && (
            <span className="absolute top-3 left-3 max-w-[75%] truncate rounded-lg bg-[#1E8A8A] px-2.5 py-1 text-[11px] font-bold text-white">
              CLOUDINARY IMAGE
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-52 flex-col items-center justify-center bg-[var(--background)] text-[var(--muted)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <ImagePlus size={28} />
          </div>

          <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
            {imageError ? "Unable to load image" : "No image selected"}
          </p>
        </div>
      )}

      <div className="p-4">
        <button
          type="button"
          onClick={openCloudinaryWidget}
          disabled={disabled || checking}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-3 text-sm font-semibold text-white transition hover:bg-[#1E8A8A] disabled:opacity-40"
        >
          {checking ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <Upload size={16} />
              {value && !imageError ? "Change Image" : "Upload with Cloudinary"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Constants & Configuration
   ────────────────────────────────────────────── */

const API = "/api/homepage/articles-section";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fa", label: "دری" },
  { code: "ps", label: "پښتو" },
];

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const inputClass =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm outline-none transition focus:border-[#1E8A8A]";

const labelClass = "mb-2 block text-sm font-semibold text-[var(--foreground)]";

const emptyTranslation = () => ({
  day: "",
  month: "",
  category: "",
  author: "",
  title: "",
});

const emptyArticle = () => ({
  image: "",
  publicId: "",
  link: "",
  translations: {
    en: emptyTranslation(),
    ps: emptyTranslation(),
    fa: emptyTranslation(),
  },
});

const emptyTitles = () => ({
  en: { title: "The Ultimate <strong>Resource.</strong>" },
  ps: { title: "" },
  fa: { title: "" },
});

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLocalizedNumber(value) {
  if (!value) return NaN;
  const str = String(value).trim();
  const map = {
    "۰": "0",
    "۱": "1",
    "۲": "2",
    "۳": "3",
    "۴": "4",
    "۵": "5",
    "۶": "6",
    "۷": "7",
    "۸": "8",
    "۹": "9",
    "٠": "0",
    "١": "1",
    "٢": "2",
    "٣": "3",
    "٤": "4",
    "٥": "5",
    "٦": "6",
    "٧": "7",
    "٨": "8",
    "٩": "9",
  };
  const converted = str.replace(/[۰-۹٠-٩]/g, (m) => map[m]);
  return Number(converted);
}

function normalizeArticle(item) {
  return {
    _id: item._id,
    image: item.image || "",
    publicId: item.publicId || "",
    link: item.link || "",
    translations: {
      en: { ...emptyTranslation(), ...item.translations?.en },
      ps: { ...emptyTranslation(), ...item.translations?.ps },
      fa: { ...emptyTranslation(), ...item.translations?.fa },
    },
  };
}

function normalizeTitles(value = {}) {
  const defaults = emptyTitles();

  if (!value) return defaults;

  const extract = (langObj, defaultTitle) => {
    if (langObj?.title) return langObj.title;

    if (langObj?.sectionTitle || langObj?.highlightedTitle) {
      return `${langObj.sectionTitle || ""} <strong>${langObj.highlightedTitle || ""}</strong>`.trim();
    }
    return defaultTitle;
  };

  return {
    en: {
      title:
        extract(value.en, defaults.en.title) ||
        extract(value, defaults.en.title),
    },
    ps: { title: extract(value.ps, "") },
    fa: { title: extract(value.fa, "") },
  };
}

function validateLink(value) {
  const link = String(value || "").trim();

  if (
    !link ||
    link.startsWith("//") ||
    link.includes("\\") ||
    /\s/.test(link)
  ) {
    return false;
  }

  if (link.startsWith("/")) return true;

  try {
    return ["http:", "https:"].includes(new URL(link).protocol);
  } catch {
    return false;
  }
}

/* ──────────────────────────────────────────────
   Main Component
   ────────────────────────────────────────────── */

export default function BlogSectionAdmin() {
  const [article, setArticle] = useState(emptyArticle);
  const [titles, setTitles] = useState(emptyTitles);
  const [articles, setArticles] = useState([]);
  const [language, setLanguage] = useState("en");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [theme, setTheme] = useState("light");

  const inputDirection = language === "en" ? "ltr" : "rtl";

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

  async function loadArticles() {
    setLoading(true);
    try {
      const response = await axios.get(API);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Could not load articles.");
      }

      const data = response.data.data || {};
      setArticles((data.posts || []).map(normalizeArticle));
      setTitles(normalizeTitles(data.Titles || {}));
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load articles.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  function changeLanguage(value) {
    const code =
      typeof value === "string"
        ? value
        : value?.language || value?.languageId || value?.code;

    if (!LANGUAGES.some((item) => item.code === code)) return;

    setLanguage(code);

    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  }

  function handleArticleChange(event) {
    const { name, value } = event.target;

    if (["link", "image", "publicId"].includes(name)) {
      setArticle((current) => ({ ...current, [name]: value }));
      return;
    }

    setArticle((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [language]: {
          ...current.translations[language],
          [name]: value,
        },
      },
    }));
  }

  function setArticleField(name, value) {
    if (["link", "image", "publicId"].includes(name)) {
      setArticle((current) => ({ ...current, [name]: value }));
      return;
    }

    setArticle((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [language]: {
          ...current.translations[language],
          [name]: value,
        },
      },
    }));
  }

  function setTitleField(name, value) {
    setTitles((current) => ({
      ...current,
      [language]: { ...current[language], [name]: value },
    }));
  }

  function handleExistingChange(id, name, value) {
    setArticles((current) =>
      current.map((item) => {
        if (item._id !== id) return item;

        if (["link", "image", "publicId"].includes(name)) {
          return { ...item, [name]: value };
        }

        return {
          ...item,
          translations: {
            ...item.translations,
            [language]: {
              ...item.translations[language],
              [name]: value,
            },
          },
        };
      }),
    );
  }

  function validateTitles() {
    for (const item of LANGUAGES) {
      const heading = titles[item.code];

      if (!stripHtml(heading.title)) {
        return {
          language: item.code,
          message: `Enter the Section Title in ${item.label}.`,
        };
      }
    }

    return null;
  }

  function validateArticle(item) {
    if (!item.image) {
      return { language, message: "Please upload an article image." };
    }

    for (const lang of LANGUAGES) {
      const fields = item.translations[lang.code];
      const parsedDay = parseLocalizedNumber(fields.day);

      if (
        !String(fields.day || "").trim() ||
        !Number.isInteger(parsedDay) ||
        parsedDay < 1 ||
        parsedDay > 31
      ) {
        return {
          language: lang.code,
          message: `Enter a valid day from 1 to 31 in ${lang.label}.`,
        };
      }

      if (!String(fields.month || "").trim()) {
        return {
          language: lang.code,
          message: `Please enter the article month in ${lang.label}.`,
        };
      }

      for (const field of ["category", "author", "title"]) {
        if (!stripHtml(fields[field] || "")) {
          return {
            language: lang.code,
            message: `Please enter the article ${field} in ${lang.label}.`,
          };
        }
      }
    }

    if (!validateLink(item.link)) {
      return { language, message: "Please enter a valid article link." };
    }

    return null;
  }

  function buildPayload(item) {
    const translations = {};

    for (const lang of LANGUAGES) {
      translations[lang.code] = {};

      for (const field of ["day", "month", "category", "author", "title"]) {
        translations[lang.code][field] = String(
          item.translations[lang.code][field] || "",
        ).trim();
      }
    }

    return {
      image: item.image,
      publicId: item.publicId || "",
      link: item.link.trim(),
      translations,
    };
  }

  function showValidationError(error) {
    setLanguage(error.language);
    toast.error(error.message);
  }

  async function handleSaveTitles() {
    const error = validateTitles();
    if (error) {
      showValidationError(error);
      return;
    }

    setSaving(true);
    try {
      const response = await axios.put(API, { Titles: titles });
      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to save headings.");
      }
      toast.success("Section headings saved.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save headings.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAddArticle() {
    const articleError = validateArticle(article);
    if (articleError) return showValidationError(articleError);

    const titleError = validateTitles();
    if (titleError) return showValidationError(titleError);

    setSaving(true);
    try {
      const response = await axios.post(API, {
        article: buildPayload(article),
        Titles: titles,
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to add article.");
      }

      toast.success("Article added successfully.");
      setArticle(emptyArticle());

      await loadArticles();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add article.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdateArticle(item) {
    const error = validateArticle(item);
    if (error) return showValidationError(error);

    setEditingId(item._id);
    try {
      const response = await axios.put(API, {
        _id: item._id,
        article: buildPayload(item),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to update article.");
      }

      toast.success("Article updated successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update article.",
      );
    } finally {
      setEditingId(null);
    }
  }

  async function handleSaveAll() {
    if (savingAll) return;

    const titleError = validateTitles();
    if (titleError) return showValidationError(titleError);

    for (const item of articles) {
      const err = validateArticle(item);
      if (err) return showValidationError(err);
    }

    setSavingAll(true);

    try {
      const titlesRes = await axios.put(API, { Titles: titles });
      if (!titlesRes.data?.success) {
        throw new Error(titlesRes.data?.message || "Failed to save headings.");
      }

      for (const item of articles) {
        const res = await axios.put(API, {
          _id: item._id,
          article: buildPayload(item),
        });
        if (!res.data?.success) {
          throw new Error(
            res.data?.message || `Failed to update article: ${item._id}`,
          );
        }
      }

      toast.success("All changes saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save all changes.",
      );
    } finally {
      setSavingAll(false);
    }
  }

  async function handleDeleteArticle(item) {
    if (deletingId) return;

    setDeletingId(item._id);

    try {
      const response = await axios.delete(API, {
        data: { _id: item._id, publicId: item.publicId },
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to delete article.");
      }

      setArticles((current) =>
        current.filter((entry) => entry._id !== item._id),
      );
      if (expandedId === item._id) setExpandedId(null);
      toast.success("Article deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete article.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-3 bg-[var(--background)]">
        <Spinner />
        <p className="text-sm font-medium text-[var(--muted)]">
          Loading articles...
        </p>
      </div>
    );
  }

  const currentTranslation = article.translations[language];
  const isBusy =
    saving || savingAll || Boolean(editingId) || Boolean(deletingId);
  const selectedLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  return (
    <div className="min-h-screen w-full bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => toast.error("Could not load Cloudinary widget.")}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <BookOpen size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Section</h1>

            <p className="mt-1 text-base text-[var(--muted)]">
              Manage your multilingual blog content.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                disabled={isBusy}
                onClick={() => changeLanguage(item.code)}
                aria-pressed={language === item.code}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  language === item.code
                    ? "bg-[#1E8A8A] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--background)] hover:text-[var(--foreground)]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <AdminLanguageBall
            language={language}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>

      <p className="-mt-5 mb-6 text-xs text-[var(--muted)]">
        Editing:{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {selectedLanguage.label}
        </span>{" "}
        · Other translations remain unchanged. All languages are required before
        saving.
      </p>

      <div className="space-y-6">
        {/* Section Heading */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                01
              </span>
              <h2 className="text-lg font-bold">Section Heading</h2>
            </div>

            <button
              type="button"
              onClick={handleSaveTitles}
              disabled={isBusy}
              className="flex items-center gap-2 rounded-xl bg-[#1E8A8A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#167575] disabled:opacity-60"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Headings
            </button>
          </div>

          <div>
            <label className={labelClass}>Section Title</label>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
              <RichTextEditor
                key={"title-heading-" + language}
                value={titles[language].title}
                onChange={(value) => setTitleField("title", value)}
                placeholder="The Ultimate Resource."
                dir={inputDirection}
              />
            </div>
          </div>
        </section>

        {/* Add New Article */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                02
              </span>
              <h2 className="text-lg font-bold">Add New Article</h2>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Article Title</label>
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                  <RichTextEditor
                    key={"new-article-title-" + language}
                    value={currentTranslation.title}
                    onChange={(value) => setArticleField("title", value)}
                    placeholder="Enter article title"
                    dir={inputDirection}
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Day Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-[var(--muted)]">
                      <CalendarDays size={16} />
                    </span>
                    <input
                      dir={inputDirection}
                      name="day"
                      type="text"
                      value={currentTranslation.day}
                      onChange={handleArticleChange}
                      placeholder="24 / ۲۴"
                      className={`pl-10 ${inputClass}`}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-[var(--muted)]">
                    Accepts 1–31
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Month</label>
                  <select
                    dir={inputDirection}
                    name="month"
                    value={currentTranslation.month}
                    onChange={handleArticleChange}
                    className={inputClass}
                  >
                    <option value="">Select month</option>
                    {MONTHS.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                  <RichTextEditor
                    key={"new-article-category-" + language}
                    value={currentTranslation.category}
                    onChange={(value) => setArticleField("category", value)}
                    placeholder="ENTER CATEGORY"
                    dir={inputDirection}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Author</label>
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                  <RichTextEditor
                    key={"new-article-author-" + language}
                    value={currentTranslation.author}
                    onChange={(value) => setArticleField("author", value)}
                    placeholder="Author Name"
                    dir={inputDirection}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Article Link (Global)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-[var(--muted)]">
                    <LinkIcon size={16} />
                  </span>
                  <input
                    dir="ltr"
                    name="link"
                    value={article.link}
                    onChange={handleArticleChange}
                    placeholder="/resources/my-article"
                    className={`pl-10 ${inputClass}`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Article Image</label>
              <ImagePicker
                value={article.image}
                publicId={article.publicId}
                disabled={isBusy}
                cloudinaryReady={cloudinaryReady}
                theme={theme}
                onChange={(uploaded) => {
                  setArticleField("image", uploaded.image);
                  setArticleField("publicId", uploaded.publicId);
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddArticle}
            disabled={isBusy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-40"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {saving ? "Saving..." : "Add New Article"}
          </button>
        </section>

        {/* Existing Articles */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                03
              </span>
              <h2 className="text-lg font-bold">Existing Articles</h2>
            </div>
            <span className="w-fit rounded-full bg-[#1E8A8A]/10 px-4 py-2 text-sm font-semibold text-[#1E8A8A]">
              {articles.length} articles
            </span>
          </div>

          {articles.length === 0 ? (
            <p className="py-8 text-center text-sm font-medium text-[var(--muted)]">
              No articles found. Add one above.
            </p>
          ) : (
            <div className="space-y-4">
              {articles.map((item) => {
                const fields = item.translations[language];
                const expanded = expandedId === item._id;
                const plainTitle =
                  stripHtml(fields.title) || "Untitled article";
                const plainCategory =
                  stripHtml(fields.category) || "No category";
                const plainAuthor = stripHtml(fields.author);

                return (
                  <div
                    key={item._id}
                    className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6"
                  >
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={plainTitle}
                          className="h-16 w-20 shrink-0 rounded-xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]">
                          <ImagePlus size={20} />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : item._id)
                        }
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-base font-semibold text-[var(--foreground)]">
                          {plainTitle}
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-[var(--muted)]">
                          {plainCategory} · {plainAuthor} · {fields.day}{" "}
                          {fields.month}
                        </p>
                      </button>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expanded ? null : item._id)
                          }
                          aria-label="Toggle article editor"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A]"
                        >
                          {expanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(item)}
                          disabled={isBusy}
                          aria-label="Delete article"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white disabled:opacity-40"
                        >
                          {deletingId === item._id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {expanded && (
                      <div className="mt-6 border-t border-[var(--border)] pt-6">
                        <div className="grid gap-6 lg:grid-cols-2">
                          <div className="space-y-5">
                            <div>
                              <label className={labelClass}>
                                Article Title
                              </label>
                              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                                <RichTextEditor
                                  key={
                                    "existing-title-" +
                                    item._id +
                                    "-" +
                                    language
                                  }
                                  value={fields.title}
                                  onChange={(value) =>
                                    handleExistingChange(
                                      item._id,
                                      "title",
                                      value,
                                    )
                                  }
                                  dir={inputDirection}
                                />
                              </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                              <div>
                                <label className={labelClass}>Day Number</label>
                                <input
                                  dir={inputDirection}
                                  type="text"
                                  value={fields.day}
                                  onChange={(event) =>
                                    handleExistingChange(
                                      item._id,
                                      "day",
                                      event.target.value,
                                    )
                                  }
                                  className={inputClass}
                                />
                              </div>

                              <div>
                                <label className={labelClass}>Month</label>
                                <select
                                  dir={inputDirection}
                                  value={fields.month}
                                  onChange={(event) =>
                                    handleExistingChange(
                                      item._id,
                                      "month",
                                      event.target.value,
                                    )
                                  }
                                  className={inputClass}
                                >
                                  <option value="">Select month</option>
                                  {MONTHS.map((month) => (
                                    <option key={month} value={month}>
                                      {month}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>Category</label>
                              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                                <RichTextEditor
                                  key={
                                    "existing-category-" +
                                    item._id +
                                    "-" +
                                    language
                                  }
                                  value={fields.category}
                                  onChange={(value) =>
                                    handleExistingChange(
                                      item._id,
                                      "category",
                                      value,
                                    )
                                  }
                                  dir={inputDirection}
                                />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>Author</label>
                              <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                                <RichTextEditor
                                  key={
                                    "existing-author-" +
                                    item._id +
                                    "-" +
                                    language
                                  }
                                  value={fields.author}
                                  onChange={(value) =>
                                    handleExistingChange(
                                      item._id,
                                      "author",
                                      value,
                                    )
                                  }
                                  dir={inputDirection}
                                />
                              </div>
                            </div>

                            <div>
                              <label className={labelClass}>Article Link</label>
                              <input
                                dir="ltr"
                                value={item.link}
                                onChange={(event) =>
                                  handleExistingChange(
                                    item._id,
                                    "link",
                                    event.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={labelClass}>Article Image</label>
                            <ImagePicker
                              value={item.image}
                              publicId={item.publicId}
                              disabled={isBusy}
                              cloudinaryReady={cloudinaryReady}
                              theme={theme}
                              onChange={(uploaded) => {
                                handleExistingChange(
                                  item._id,
                                  "image",
                                  uploaded.image,
                                );
                                handleExistingChange(
                                  item._id,
                                  "publicId",
                                  uploaded.publicId,
                                );
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleUpdateArticle(item)}
                            disabled={isBusy}
                            className="flex items-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#167575] disabled:opacity-60"
                          >
                            {editingId === item._id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Save size={17} />
                            )}
                            {editingId === item._id
                              ? "Saving..."
                              : "Save Article"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <AdminStickyFooter
        onReload={loadArticles}
        onSave={handleSaveAll}
        saving={savingAll}
        busy={isBusy}
        saveLabel="Save All Changes"
        savingLabel="Saving All..."
      />
    </div>
  );
}
