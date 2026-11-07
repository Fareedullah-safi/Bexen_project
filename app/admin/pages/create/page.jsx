"use client";

import axios from "axios";
import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function CreatePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [mainNav, setMainNav] = useState([]);
  const [activeLanguage, setActiveLanguage] = useState("en");

  const [data, setData] = useState({
    translations: {
      en: "",
      ps: "",
      fa: "",
    },
    slug: "",
    showInNav: false,
    navParent: "none",
    showInFooter: false,
  });

  // ==========================================
  // 2. FETCH MAIN NAVBAR ITEMS
  // ==========================================
  useEffect(() => {
    async function loadMainNav() {
      try {
        const res = await axios.get("/api/navbar");

        const items =
          res.data?.items || (Array.isArray(res.data) ? res.data : []);

        setMainNav(items);
      } catch {
        toast.error("Could not load main navbar items.");
      }
    }

    loadMainNav();
  }, []);

  // ==========================================
  // 3. GENERATE ENGLISH SLUG
  // ==========================================
  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // ==========================================
  // 4. HANDLE LANGUAGE TITLE CHANGE
  // ==========================================
  const onTitleChange = (value) => {
    setData((prev) => ({
      ...prev,

      translations: {
        ...prev.translations,
        [activeLanguage]: value,
      },

      // Only English generates the URL.
      ...(activeLanguage === "en" ? { slug: generateSlug(value) } : {}),
    }));
  };

  // ==========================================
  // 5. CREATE PAGE
  // ==========================================
  const handleCreate = async () => {
    const englishTitle = data.translations.en.trim();
    const pashtoTitle = data.translations.ps.trim();
    const dariTitle = data.translations.fa.trim();

    // English validation
    if (!englishTitle) {
      setActiveLanguage("en");
      return toast.error(LANGUAGE_TEXT.en.required);
    }

    // Pashto validation
    if (!pashtoTitle) {
      setActiveLanguage("ps");
      return toast.error(LANGUAGE_TEXT.ps.required);
    }

    // Dari validation
    if (!dariTitle) {
      setActiveLanguage("fa");
      return toast.error(LANGUAGE_TEXT.fa.required);
    }

    if (!data.slug.trim()) {
      setActiveLanguage("en");
      return toast.error("Please enter a valid English page name.");
    }

    setLoading(true);

    try {
      // Check route availability
      const checkRes = await axios.get(
        `/api/admin/pages/check-route?slug=${encodeURIComponent(data.slug)}`,
      );

      if (!checkRes.data?.available) {
        toast.error(checkRes.data?.message || "This link is already used.");

        setLoading(false);
        return;
      }

      // Create page
      const createRes = await axios.post("/api/admin/pages", {
        // Preserve existing English title
        title: englishTitle,

        // Save all three language titles
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

        // One shared English-generated URL
        slug: data.slug.trim(),

        showInNav: data.showInNav,
        navParent: data.showInNav ? data.navParent : "none",
        showInFooter: data.showInFooter,

        status: "published",
        blocks: [],
      });

      const page = createRes.data?.page || createRes.data;

      if (!page?._id) {
        throw new Error("Page was created but its ID was not returned.");
      }

      toast.success("Page created successfully!");

      router.push(`/admin/pages/${page._id}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Failed to create page.",
      );

      setLoading(false);
    }
  };

  // ==========================================
  // 6. NAVBAR LABEL
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
  // 7. RENDER
  // ==========================================
  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[var(--background)] p-4 text-[var(--text-main)] sm:p-5">
      {/* Back Navigation */}
      <Link
        href="/admin/pages"
        className="mb-5 flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
      >
        <ArrowLeft size={16} />
        Back to Pages
      </Link>

      {/* Main Form */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
        <h1 className="mb-6 text-2xl font-bold">Setup New Page</h1>

        <div className="space-y-5">
          {/* ================================== */}
          {/* PAGE NAME + LANGUAGE TABS */}
          {/* ================================== */}
          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <label className="block text-sm font-medium">
                Page name
                <span className="ml-1 text-red-500">*</span>
              </label>

              {/* Language Tabs */}
              <div
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1"
                role="tablist"
                aria-label="Page name language"
              >
                {LANGUAGES.map((language) => {
                  const isActive = activeLanguage === language.id;

                  const isFilled = Boolean(
                    data.translations[language.id].trim(),
                  );

                  return (
                    <button
                      key={language.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`page-title-${language.id}`}
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
                            isActive ? "text-white" : "text-[var(--accent)]"
                          }
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Language Input */}
            <div
              id={`page-title-${activeLanguage}`}
              role="tabpanel"
              dir={activeLanguage === "en" ? "ltr" : "rtl"}
            >
              <input
                type="text"
                value={data.translations[activeLanguage]}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder={LANGUAGE_TEXT[activeLanguage].placeholder}
                autoComplete="off"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 transition-colors outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          {/* ================================== */}
          {/* PAGE LINK */}
          {/* ================================== */}
          <div>
            <label className="mb-1 block text-sm font-medium">Page link</label>

            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">/</span>

              <input
                type="text"
                dir="ltr"
                value={data.slug}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, "")
                      .replace(/-+/g, "-")
                      .replace(/^-|-$/g, ""),
                  }))
                }
                placeholder="main"
                autoComplete="off"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 transition-colors outline-none focus:border-[var(--accent)]"
              />
            </div>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Live URL: <strong>/{data.slug || "..."}</strong>
            </p>
          </div>

          {/* ================================== */}
          {/* NAVBAR OPTIONS */}
          {/* ================================== */}
          <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={data.showInNav}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    showInNav: e.target.checked,
                    navParent: "none",
                  }))
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Show in Navbar
            </label>

            {data.showInNav && (
              <div className="border-t border-[var(--border)] pt-3">
                <label className="mb-1 block text-sm font-medium">
                  Navbar Placement
                </label>

                <select
                  value={data.navParent}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      navParent: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm transition-colors outline-none focus:border-[var(--accent)]"
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
                checked={data.showInFooter}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    showInFooter: e.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Also show in Footer
            </label>
          </div>
        </div>

        {/* ================================== */}
        {/* CREATE BUTTON */}
        {/* ================================== */}
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="mt-7 w-full rounded-xl bg-[var(--accent)] py-3 font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create & Start Building"}
        </button>
      </div>
    </div>
  );
}
