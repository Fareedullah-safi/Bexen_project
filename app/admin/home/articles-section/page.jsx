"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Link as LinkIcon,
  Plus,
  Save,
  Tag,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

const API = "/api/homepage/articles-section";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
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
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100";

const sectionClass =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]";

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
  en: { sectionTitle: "The Ultimate", highlightedTitle: "Resource." },
  ps: { sectionTitle: "", highlightedTitle: "" },
  fa: { sectionTitle: "", highlightedTitle: "" },
});

// Prepare an article returned by the API.
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

  // Also supports the old flat heading format.
  if (value.sectionTitle || value.highlightedTitle) {
    defaults.en.sectionTitle = value.sectionTitle || defaults.en.sectionTitle;
    defaults.en.highlightedTitle =
      value.highlightedTitle || defaults.en.highlightedTitle;
    return defaults;
  }

  return {
    en: { ...defaults.en, ...value.en },
    ps: { ...defaults.ps, ...value.ps },
    fa: { ...defaults.fa, ...value.fa },
  };
}

// Check that the link is a local path or a valid HTTP/HTTPS URL.
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

export default function BlogSectionAdmin() {
  const [article, setArticle] = useState(emptyArticle);
  const [titles, setTitles] = useState(emptyTitles);
  const [articles, setArticles] = useState([]);
  const [language, setLanguage] = useState("en");
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  const widgetRef = useRef(null);
  const uploadTarget = useRef(null);

  // RTL for Pashto/Dari; LTR for English.
  const inputDirection = language === "en" ? "ltr" : "rtl";

  // Load all translations once. Switching languages does not reload the page.
  useEffect(() => {
    async function loadArticles() {
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

    loadArticles();
  }, []);

  // Keep the ball and this component's language selection synchronized.
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

  // Update the new article's shared fields or selected translation.
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

  // Update section headings for the selected language.
  function handleTitleChange(event) {
    const { name, value } = event.target;

    setTitles((current) => ({
      ...current,
      [language]: { ...current[language], [name]: value },
    }));
  }

  // Update an existing article.
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

  // Upload or replace an article image using Cloudinary.
  function uploadImage(articleId = null) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudinaryReady || !window.cloudinary) {
      toast.error("Image uploader is not ready.");
      return;
    }

    if (!cloudName || !uploadPreset) {
      toast.error("Check your Cloudinary environment variables.");
      return;
    }

    uploadTarget.current = articleId;

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder: "bexon/images",
          multiple: false,
          maxFileSize: 5 * 1024 * 1024,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
        },
        (error, result) => {
          if (error) {
            toast.error("Image upload failed.");
            return;
          }

          if (result?.event !== "success") return;

          const image = result.info.secure_url;
          const publicId = result.info.public_id || "";
          const id = uploadTarget.current;

          if (id) {
            setArticles((current) =>
              current.map((item) =>
                item._id === id ? { ...item, image, publicId } : item,
              ),
            );
          } else {
            setArticle((current) => ({ ...current, image, publicId }));
          }

          toast.success("Image uploaded successfully.");
        },
      );
    }

    widgetRef.current.open();
  }

  // Validate both headings in all three languages.
  function validateTitles() {
    for (const item of LANGUAGES) {
      const heading = titles[item.code];

      if (!heading.sectionTitle.trim()) {
        return {
          language: item.code,
          message: `Enter the Main Title in ${item.label}.`,
        };
      }

      if (!heading.highlightedTitle.trim()) {
        return {
          language: item.code,
          message: `Enter the Highlighted Title in ${item.label}.`,
        };
      }
    }

    return null;
  }

  // Validate all fields in all three translations.
  function validateArticle(item) {
    if (!item.image) {
      return { language, message: "Please upload an article image." };
    }

    for (const lang of LANGUAGES) {
      const fields = item.translations[lang.code];

      if (
        !fields.day.trim() ||
        !Number.isInteger(Number(fields.day)) ||
        Number(fields.day) < 1 ||
        Number(fields.day) > 31
      ) {
        return {
          language: lang.code,
          message: `Enter a valid day from 1 to 31 in ${lang.label}.`,
        };
      }

      for (const field of ["month", "category", "author", "title"]) {
        if (!String(fields[field] || "").trim()) {
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

  // Build the data shape expected by the multilingual API.
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

  // Save all section headings.
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

  // Add a new article.
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

      const data = await axios.get(API);
      if (data.data?.success) {
        setArticles((data.data.data.posts || []).map(normalizeArticle));
        setTitles(normalizeTitles(data.data.data.Titles || {}));
      }
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

  // Update an existing article.
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

  // Delete an article after confirmation.
  async function handleDeleteArticle(item) {
    if (deletingId) return;

    const result = await Swal.fire({
      title: "Delete this article?",
      text: "This article will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Keep article",
      reverseButtons: true,
      buttonsStyling: false,
      customClass: {
        popup: "rounded-2xl p-6",
        confirmButton:
          "rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white",
        cancelButton:
          "rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold",
        actions: "gap-3",
      },
    });

    if (!result.isConfirmed) return;

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
      setExpandedId(null);
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
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  const currentTranslation = article.translations[language];

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => toast.error("Could not load Cloudinary.")}
      />

      {/* Header and language selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <BookOpen size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Blog Section</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your multilingual blog content.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-[#263442] dark:bg-[#111a23]">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeLanguage(item.code)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  language === item.code
                    ? "bg-[#1e8a8a] text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#16212c]"
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

      {/* Section headings */}
      <section className={sectionClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Section Heading</h2>
            <p className="mt-1 text-xs text-gray-500">
              Editing: {LANGUAGES.find((item) => item.code === language)?.label}
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveTitles}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} />
            Save Headings
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["sectionTitle", "Main Title", "The Ultimate"],
            ["highlightedTitle", "Highlighted Title", "Resource."],
          ].map(([name, label, placeholder]) => (
            <div key={name}>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Type size={15} />
                {label}
              </label>
              <input
                dir={inputDirection}
                name={name}
                value={titles[language][name]}
                onChange={handleTitleChange}
                placeholder={placeholder}
                maxLength={80}
                className={inputClass}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Add article */}
      <section className={sectionClass}>
        <h2 className="mb-4 flex items-center justify-between font-bold">
          Add New Article
          <Plus size={19} className="text-[#1e8a8a]" />
        </h2>

        <button
          type="button"
          onClick={() => uploadImage()}
          disabled={!cloudinaryReady}
          className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] disabled:opacity-60"
        >
          <ImagePlus size={16} />
          {cloudinaryReady ? "Upload Image" : "Loading uploader..."}
        </button>

        {article.image && (
          <img
            src={article.image}
            alt="New article"
            className="mt-3 h-36 w-full rounded-xl border object-cover sm:w-64"
          />
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            ["day", "Day", "24"],
            ["category", "Category", "BUSINESS"],
            ["author", "Author", "Admin"],
            ["title", "Article Title", "Enter article title"],
          ].map(([name, label, placeholder]) => (
            <div key={name} className={name === "title" ? "sm:col-span-2" : ""}>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                {name === "day" ? (
                  <CalendarDays size={15} />
                ) : name === "category" ? (
                  <Tag size={15} />
                ) : name === "author" ? (
                  <UserRound size={15} />
                ) : (
                  <Type size={15} />
                )}
                {label}
              </label>
              <input
                dir={inputDirection}
                name={name}
                type={name === "day" ? "number" : "text"}
                min={name === "day" ? 1 : undefined}
                max={name === "day" ? 31 : undefined}
                value={currentTranslation[name]}
                onChange={handleArticleChange}
                placeholder={placeholder}
                className={inputClass}
              />
            </div>
          ))}

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays size={15} />
              Month
            </label>
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

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <LinkIcon size={15} />
              Article Link (shared across languages)
            </label>
            <input
              dir="ltr"
              name="link"
              value={article.link}
              onChange={handleArticleChange}
              placeholder="/resources/my-article"
              className={inputClass}
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Complete English, Pashto, and Dari using the language selector above.
        </p>

        <button
          type="button"
          onClick={handleAddArticle}
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={17} />
          {saving ? "Saving..." : "Add Article"}
        </button>
      </section>

      {/* Existing articles */}
      <section className={sectionClass}>
        <h2 className="mb-4 font-bold">
          Existing Articles ({articles.length})
        </h2>

        {articles.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            No articles found.
          </p>
        ) : (
          <div className="space-y-3">
            {articles.map((item) => {
              const fields = item.translations[language];
              const expanded = expandedId === item._id;

              return (
                <div
                  key={item._id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]"
                >
                  <div className="flex items-center gap-3 p-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={fields.title || "Article"}
                        className="h-14 w-16 rounded-lg object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : item._id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-sm font-semibold">
                        {fields.title || "Untitled article"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {fields.category || "No category"} · {fields.author}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : item._id)}
                      aria-label="Toggle article editor"
                    >
                      {expanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteArticle(item)}
                      disabled={deletingId === item._id}
                      aria-label="Delete article"
                      className="p-2 text-red-500 disabled:opacity-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {expanded && (
                    <div className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2 dark:border-[#263442]">
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => uploadImage(item._id)}
                          disabled={!cloudinaryReady}
                          className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] disabled:opacity-60"
                        >
                          <ImagePlus size={16} />
                          Replace Image
                        </button>
                      </div>

                      {["day", "month", "category", "author", "title"].map(
                        (field) => (
                          <div
                            key={field}
                            className={field === "title" ? "sm:col-span-2" : ""}
                          >
                            <label className="mb-2 block text-sm font-medium">
                              {field === "day"
                                ? "Day"
                                : field === "month"
                                  ? "Month"
                                  : field === "category"
                                    ? "Category"
                                    : field === "author"
                                      ? "Author"
                                      : "Article Title"}
                            </label>

                            {field === "month" ? (
                              <select
                                dir={inputDirection}
                                value={fields.month}
                                onChange={(event) =>
                                  handleExistingChange(
                                    item._id,
                                    field,
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
                            ) : (
                              <input
                                dir={inputDirection}
                                type={field === "day" ? "number" : "text"}
                                value={fields[field]}
                                onChange={(event) =>
                                  handleExistingChange(
                                    item._id,
                                    field,
                                    event.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            )}
                          </div>
                        ),
                      )}

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium">
                          Article Link
                        </label>
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

                      <div className="flex justify-end sm:col-span-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateArticle(item)}
                          disabled={editingId === item._id}
                          className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                        >
                          <Save size={17} />
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
  );
}
