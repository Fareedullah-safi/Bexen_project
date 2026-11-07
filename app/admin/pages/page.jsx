"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Check,
  Edit,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ==========================================
// 1. LANGUAGES
// ==========================================
const LANGUAGES = [
  { id: "en", label: "EN", native: "English" },
  { id: "ps", label: "PS", native: "پښتو" },
  { id: "fa", label: "FA", native: "دری" },
];

const LANGUAGE_TEXT = {
  en: {
    placeholder: "e.g. About Us",
    required: "Please enter the English page name.",
  },
  ps: {
    placeholder: "د بېلګې په توګه: زموږ په اړه",
    required: "مهرباني وکړئ د پاڼې پښتو نوم ولیکئ.",
  },
  fa: {
    placeholder: "مثلاً: درباره ما",
    required: "لطفاً نام صفحه را به زبان دری وارد کنید.",
  },
};

// ==========================================
// 2. HELPERS
// ==========================================
function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Supports both new translations and old pages.
function getPageTranslation(page, language) {
  const translation = page?.translations?.[language];

  if (typeof translation === "string") {
    return translation;
  }

  return translation?.title || (language === "en" ? page?.title : "") || "";
}

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [mainNav, setMainNav] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // ==========================================
  // EDIT STATES
  // ==========================================
  const [editId, setEditId] = useState(null);

  const [translations, setTranslations] = useState({
    en: "",
    ps: "",
    fa: "",
  });

  const [activeLanguage, setActiveLanguage] = useState("en");

  const [editSlug, setEditSlug] = useState("");
  const [originalSlug, setOriginalSlug] = useState("");

  const [editShowInNav, setEditShowInNav] = useState(false);
  const [editNavParent, setEditNavParent] = useState("none");
  const [editShowInFooter, setEditShowInFooter] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================
  // 3. INITIAL LOAD
  // ==========================================
  useEffect(() => {
    loadPages();
    loadMainNav();
  }, []);

  async function loadPages() {
    try {
      const { data } = await axios.get("/api/admin/pages");

      setPages(
        Array.isArray(data)
          ? data
          : Array.isArray(data.pages)
            ? data.pages
            : [],
      );
    } catch {
      toast.error("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMainNav() {
    try {
      const res = await axios.get("/api/navbar");

      const items =
        res.data?.items || (Array.isArray(res.data) ? res.data : []);

      setMainNav(items);
    } catch {
      console.error("Could not load main navbar items.");
    }
  }

  // ==========================================
  // 4. NAVBAR LABEL
  // ==========================================
  const getNavLabel = (item) => {
    return (
      item?.translations?.en?.label ||
      item?.translations?.fa?.label ||
      item?.translations?.ps?.label ||
      item?.id ||
      "Main Nav"
    );
  };

  // ==========================================
  // 5. START EDIT
  // ==========================================
  function startEdit(page) {
    setEditId(page._id);

    // Load all three languages from MongoDB.
    // Old pages without translations use their English title.
    setTranslations({
      en: getPageTranslation(page, "en"),
      ps: getPageTranslation(page, "ps"),
      fa: getPageTranslation(page, "fa"),
    });

    setActiveLanguage("en");

    setEditSlug(page.slug || "");
    setOriginalSlug(page.slug || "");

    setEditShowInNav(page.showInNav || false);
    setEditNavParent(page.navParent || "none");
    setEditShowInFooter(page.showInFooter || false);
  }

  // ==========================================
  // 6. CANCEL EDIT
  // ==========================================
  function cancelEdit() {
    setEditId(null);

    setTranslations({
      en: "",
      ps: "",
      fa: "",
    });

    setActiveLanguage("en");

    setEditSlug("");
    setOriginalSlug("");

    setEditShowInNav(false);
    setEditNavParent("none");
    setEditShowInFooter(false);
  }

  // ==========================================
  // 7. HANDLE TRANSLATION CHANGE
  // ==========================================
  function onTitleChange(value) {
    setTranslations((prev) => ({
      ...prev,
      [activeLanguage]: value,
    }));

    // Only English generates the URL.
    if (activeLanguage === "en") {
      setEditSlug(makeSlug(value));
    }
  }

  // ==========================================
  // 8. SAVE EDIT
  // ==========================================
  async function saveEdit(id) {
    const englishTitle = translations.en.trim();
    const pashtoTitle = translations.ps.trim();
    const dariTitle = translations.fa.trim();

    const slug = makeSlug(editSlug);

    // English validation
    if (!englishTitle) {
      setActiveLanguage("en");
      toast.error(LANGUAGE_TEXT.en.required);
      return;
    }

    // Pashto validation
    if (!pashtoTitle) {
      setActiveLanguage("ps");
      toast.error(LANGUAGE_TEXT.ps.required);
      return;
    }

    // Dari validation
    if (!dariTitle) {
      setActiveLanguage("fa");
      toast.error(LANGUAGE_TEXT.fa.required);
      return;
    }

    if (!slug) {
      setActiveLanguage("en");
      toast.error("Please enter a valid English page route.");
      return;
    }

    if (saving) return;

    setSaving(true);

    try {
      // ======================================
      // CHECK ROUTE ONLY IF CHANGED
      // ======================================
      if (slug !== originalSlug) {
        const checkRes = await axios.get(
          `/api/admin/pages/check-route?slug=${encodeURIComponent(slug)}`,
        );

        if (!checkRes.data?.available) {
          toast.error(
            checkRes.data?.message ||
              "This route is already used in a page or navbar.",
          );

          return;
        }
      }

      // ======================================
      // UPDATE PAGE
      // ======================================
      await axios.put(`/api/admin/pages/${id}`, {
        // Preserve existing English title field.
        title: englishTitle,

        // Save all three translations.
        translations: {
          en: {
            title: englishTitle,
          },
          ps: {
            title: pashtoTitle,
          },
          fa: {
            title: dariTitle,
          },
        },

        // One shared English-generated URL.
        slug,

        showInNav: editShowInNav,
        navParent: editShowInNav ? editNavParent : "none",
        showInFooter: editShowInFooter,
      });

      toast.success("Page updated successfully.");

      cancelEdit();

      await loadPages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update page.");
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // 9. DELETE PAGE
  // ==========================================
  async function handleDelete(id) {
    if (!confirm("Delete this page completely?")) return;

    if (deletingId) return;

    setDeletingId(id);

    try {
      const { data } = await axios.delete(`/api/admin/pages/${id}`);

      toast.success(
        data?.deletedImages
          ? `Page deleted (${data.deletedImages} images removed).`
          : "Page deleted.",
      );

      if (editId === id) {
        cancelEdit();
      }

      await loadPages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");

      await loadPages();
    } finally {
      setDeletingId(null);
    }
  }

  // ==========================================
  // 10. STYLING
  // ==========================================
  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

  // ==========================================
  // 11. LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // ==========================================
  // 12. RENDER
  // ==========================================
  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--text-main)]">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <FileText size={23} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Pages</h1>

            <p className="text-sm text-[var(--text-muted)]">
              Manage your website pages and routes.
            </p>
          </div>
        </div>

        <Link
          href="/admin/pages/create"
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New Page
        </Link>
      </div>

      {/* PAGES LIST */}
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            No pages yet. Click "New Page" to start building.
          </div>
        ) : (
          pages.map((page) => {
            const isEditing = editId === page._id;
            const isDeleting = deletingId === page._id;

            return (
              <div
                key={page._id}
                className="flex flex-col gap-4 border-b border-[var(--border)] p-4 transition-colors hover:bg-[var(--background)] sm:flex-row sm:items-start sm:justify-between"
              >
                {isEditing ? (
                  <div className="flex w-full flex-col gap-4">
                    {/* ================================== */}
                    {/* PAGE NAME + LANGUAGE TABS */}
                    {/* ================================== */}
                    <div>
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <label className="block text-sm font-medium">
                          Page name
                          <span className="ml-1 text-red-500">*</span>
                        </label>

                        {/* LANGUAGE TABS */}
                        <div
                          className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1"
                          role="tablist"
                          aria-label="Page name language"
                        >
                          {LANGUAGES.map((language) => {
                            const isActive = activeLanguage === language.id;

                            const isFilled = Boolean(
                              translations[language.id].trim(),
                            );

                            return (
                              <button
                                key={language.id}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`page-title-${page._id}-${language.id}`}
                                onClick={() => setActiveLanguage(language.id)}
                                className={`relative inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                  isActive
                                    ? "bg-[var(--accent)] text-white shadow-sm"
                                    : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]"
                                }`}
                              >
                                {language.label}

                                {isFilled && (
                                  <Check
                                    size={12}
                                    strokeWidth={3}
                                    className={
                                      isActive
                                        ? "text-white"
                                        : "text-[var(--accent)]"
                                    }
                                  />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ACTIVE LANGUAGE INPUT */}
                      <div
                        id={`page-title-${page._id}-${activeLanguage}`}
                        role="tabpanel"
                        dir={activeLanguage === "en" ? "ltr" : "rtl"}
                      >
                        <input
                          type="text"
                          value={translations[activeLanguage]}
                          onChange={(e) => onTitleChange(e.target.value)}
                          placeholder={
                            LANGUAGE_TEXT[activeLanguage].placeholder
                          }
                          autoComplete="off"
                          className={inputClass}
                        />
                      </div>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Editing:{" "}
                        {
                          LANGUAGES.find((lang) => lang.id === activeLanguage)
                            ?.native
                        }
                      </p>
                    </div>

                    {/* ================================== */}
                    {/* PAGE ROUTE */}
                    {/* ================================== */}
                    <div>
                      <label className={labelClass}>
                        Page link (English URL)
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[var(--text-muted)]">
                          /
                        </span>

                        <input
                          type="text"
                          dir="ltr"
                          value={editSlug}
                          onChange={(e) =>
                            setEditSlug(makeSlug(e.target.value))
                          }
                          className={inputClass}
                          placeholder="about-us"
                        />
                      </div>

                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        Live URL: <strong>/{editSlug || "..."}</strong>
                      </p>
                    </div>

                    {/* ================================== */}
                    {/* NAVBAR / FOOTER OPTIONS */}
                    {/* ================================== */}
                    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editShowInNav}
                          onChange={(e) => {
                            setEditShowInNav(e.target.checked);

                            if (!e.target.checked) {
                              setEditNavParent("none");
                            }
                          }}
                          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                        />
                        Show in Navbar
                      </label>

                      {editShowInNav && (
                        <div className="border-t border-[var(--border)] pt-3">
                          <label className="mb-1 block text-sm font-medium">
                            Navbar Placement
                          </label>

                          <select
                            value={editNavParent}
                            onChange={(e) => setEditNavParent(e.target.value)}
                            className={inputClass}
                          >
                            <option value="none">
                              Main Top-Level Tab (Homepage Navbar)
                            </option>

                            {mainNav.map((item) => (
                              <option
                                key={item.id || item._id}
                                value={item.id || item._id}
                              >
                                Dropdown Child under "{getNavLabel(item)}"
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={editShowInFooter}
                          onChange={(e) =>
                            setEditShowInFooter(e.target.checked)
                          }
                          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                        />
                        Also show in Footer
                      </label>
                    </div>
                  </div>
                ) : (
                  /* ================================== */
                  /* PAGE INFORMATION */
                  /* ================================== */
                  <div className="flex-1">
                    <div className="text-base font-semibold">{page.title}</div>

                    {/* TRANSLATION STATUS */}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {LANGUAGES.map((language) => (
                        <span
                          key={language.id}
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                            getPageTranslation(page, language.id).trim()
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-amber-500/10 text-amber-500"
                          }`}
                        >
                          {language.label}
                          {getPageTranslation(page, language.id).trim()
                            ? " ✓"
                            : " Missing"}
                        </span>
                      ))}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span>/{page.slug}</span>

                      <span>•</span>

                      <span>{page.blocks?.length || 0} blocks</span>

                      <span>•</span>

                      <span
                        className={
                          page.status === "published"
                            ? "font-medium text-emerald-500"
                            : "font-medium text-amber-500"
                        }
                      >
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>

                      {(page.showInNav || page.showInFooter) && (
                        <>
                          <span>•</span>

                          <span className="text-[var(--accent)]">
                            Shows in:{" "}
                            {[
                              page.showInNav &&
                                (page.navParent === "none"
                                  ? "Main Navbar"
                                  : "Navbar Dropdown"),

                              page.showInFooter && "Footer",
                            ]
                              .filter(Boolean)
                              .join(" & ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* ================================== */}
                {/* ACTIONS */}
                {/* ================================== */}
                <div className="flex items-start gap-2 sm:mt-0">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(page._id)}
                        disabled={saving}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Save Changes"
                      >
                        {saving ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}

                        {saving ? "Saving..." : "Save"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-[var(--background)] p-2 transition-colors hover:bg-[var(--border)] disabled:opacity-50"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(page)}
                        className="cursor-pointer rounded-lg bg-[var(--background)] p-2 transition-colors hover:bg-[var(--border)]"
                        title="Edit Page Settings"
                      >
                        <Edit size={16} />
                      </button>

                      <Link
                        href={`/admin/pages/${page._id}`}
                        className="cursor-pointer rounded-lg bg-[var(--accent)]/10 p-2 text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                        title="Edit Page Content (Blocks)"
                      >
                        <FileText size={16} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(page._id)}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete Page"
                      >
                        {isDeleting ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
