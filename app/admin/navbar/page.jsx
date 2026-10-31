"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Link as LinkIcon,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ==========================================
// 1. HELPER VARIABLES
// ==========================================
const API = "/api/navbar";
const LANGS = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

// Helper to create an empty translation object
const emptyLabel = () => ({ label: "" });
const emptySearch = () => ({ heading: "", subheading: "", placeholder: "" });

// Helper to create a unique ID for new links
const generateId = () =>
  `nav_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// The default empty structure for our navigation
const defaultConfig = () => ({
  logo: "",
  logoPublicId: "",
  cta: {
    href: "/contact",
    translations: { en: emptyLabel(), ps: emptyLabel(), fa: emptyLabel() },
  },
  search: {
    translations: {
      en: emptySearch(),
      ps: emptySearch(),
      fa: emptySearch(),
    },
  },
  items: [],
});

export default function NavigationAdmin() {
  // ==========================================
  // 2. COMPONENT STATE (Variables that update the screen)
  // ==========================================
  const [loading, setLoading] = useState(true); // Shows the loading spinner at the start
  const [saving, setSaving] = useState(false); // Shows "Saving..." on the button
  const [lang, setLang] = useState("en"); // Keeps track of the current language being edited
  const [config, setConfig] = useState(defaultConfig); // Holds all the navigation data

  // Check if the current language is Right-To-Left (Pashto or Dari)
  // We will only use this for text inputs!
  const isRTL = lang === "ps" || lang === "fa";
  const inputDirection = isRTL ? "rtl" : "ltr";

  const currentLangName = LANGS.find((l) => l.code === lang)?.label || lang;

  // ==========================================
  // 3. LOAD DATA FROM DATABASE
  // ==========================================
  useEffect(() => {
    // When the page first opens, fetch the navigation data from our API
    axios
      .get(API)
      .then((res) => {
        if (res.data) {
          // Merge default empty config with the data from the database
          setConfig({ ...defaultConfig(), ...res.data });
        }
      })
      .catch(() => toast.error("Failed to load navigation configuration"))
      .finally(() => setLoading(false)); // Stop the loading spinner
  }, []);

  // ==========================================
  // 4. HELPER FUNCTIONS
  // ==========================================

  // This helper makes it easier to update just one part of our config
  const updateConfig = (key, value) => {
    setConfig((prevConfig) => {
      return { ...prevConfig, [key]: value };
    });
  };

  // This cleans up URLs to make sure they start with a "/" and have no spaces
  const cleanPath = (value) => {
    let text = String(value || "")
      .trim()
      .replace(/[\s\\]/g, "");
    if (!text) return "";

    // If it's an external link like https://google.com, leave it alone
    if (text.match(/^(http|https|mailto|tel):/)) return text;

    // Otherwise, make sure it starts with a slash
    if (!text.startsWith("/") && !text.startsWith("#")) {
      text = `/${text}`;
    }

    // Remove double slashes like "//about"
    return text.replace(/\/\/+/g, "/");
  };

  // Changes the language we are currently editing
  const setLangAndStore = (code) => {
    setLang(code);
    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}
    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  };

  // ==========================================
  // 5. VALIDATION (Check for errors before saving)
  // ==========================================
  const validateConfig = () => {
    // Check if CTA has a label but no URL
    const ctaLabel = config.cta?.translations?.[lang]?.label?.trim();
    if (ctaLabel && !config.cta?.href?.trim()) {
      toast.error("Error: CTA Button is missing a URL.");
      return false;
    }

    // Check all Navigation Items
    for (let i = 0; i < config.items.length; i++) {
      const item = config.items[i];
      const itemLabel = item.translations?.[lang]?.label?.trim();

      if (!itemLabel) {
        toast.error(
          `Error: Link #${i + 1} is missing a name in ${currentLangName}.`,
        );
        return false;
      }

      if (!item.href?.trim()) {
        toast.error(`Error: Link #${i + 1} ("${itemLabel}") is missing a URL.`);
        return false;
      }

      // If dropdown is checked, check all its sub-links too
      if (item.hasDropdown && item.children?.length > 0) {
        for (let j = 0; j < item.children.length; j++) {
          const sub = item.children[j];
          const subLabel = sub.translations?.[lang]?.label?.trim();

          if (!subLabel) {
            toast.error(
              `Error: Sub-link #${j + 1} under "${itemLabel}" is missing a name.`,
            );
            return false;
          }
          if (!sub.href?.trim()) {
            toast.error(
              `Error: Sub-link #${j + 1} under "${itemLabel}" is missing a URL.`,
            );
            return false;
          }
        }
      }
    }

    return true; // Everything is good!
  };

  // ==========================================
  // 6. SAVE FUNCTION
  // ==========================================
  const save = async () => {
    if (!validateConfig()) return; // Stop if validation failed

    setSaving(true);
    try {
      await axios.post(API, config);
      toast.success("Navigation saved successfully");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save navigation");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // 7. IMAGE UPLOAD FUNCTIONS
  // ==========================================
  const uploadLogo = () => {
    if (!window.cloudinary)
      return toast.error("Cloudinary is still loading...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    window.cloudinary
      .createUploadWidget(
        {
          cloudName,
          uploadPreset,
          folder: "bexon/logo",
          multiple: false,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
        },
        (err, result) => {
          if (err) return toast.error("Upload failed");
          if (result?.event === "success") {
            // If there's an old logo, delete it from Cloudinary
            if (config.logoPublicId) {
              axios
                .post(API, { publicId: config.logoPublicId })
                .catch(() => {});
            }

            // Save the new logo URL to state
            setConfig((prev) => ({
              ...prev,
              logo: result.info.secure_url,
              logoPublicId: result.info.public_id,
            }));
            toast.success("Logo uploaded successfully");
          }
        },
      )
      .open();
  };

  const removeLogo = async () => {
    if (!confirm("Are you sure you want to remove the logo?")) return;
    if (config.logoPublicId) {
      try {
        await axios.post(API, { publicId: config.logoPublicId });
      } catch {}
    }
    setConfig((prev) => ({ ...prev, logo: "", logoPublicId: "" }));
    toast.success("Logo removed");
  };

  // ==========================================
  // 8. TEXT INPUT HANDLERS
  // ==========================================
  const setCtaLabel = (value) => {
    updateConfig("cta", {
      ...config.cta,
      translations: {
        ...config.cta.translations,
        [lang]: { label: value },
      },
    });
  };

  const setSearchField = (field, value) => {
    updateConfig("search", {
      ...config.search,
      translations: {
        ...config.search.translations,
        [lang]: {
          ...emptySearch(),
          ...config.search.translations?.[lang],
          [field]: value,
        },
      },
    });
  };

  // ==========================================
  // 9. LINK MANAGEMENT HANDLERS
  // ==========================================

  // Add a new main link
  const addLink = () => {
    const newLink = {
      id: generateId(),
      href: "/",
      hasDropdown: false,
      translations: { en: emptyLabel(), ps: emptyLabel(), fa: emptyLabel() },
      children: [],
    };
    updateConfig("items", [...config.items, newLink]);
  };

  // Add a sub-link inside a main link
  const addSub = (index) => {
    const allItems = [...config.items];
    const newSubLink = {
      id: generateId(),
      href: "/",
      translations: { en: emptyLabel(), ps: emptyLabel(), fa: emptyLabel() },
    };
    allItems[index].children.push(newSubLink);
    updateConfig("items", allItems);
  };

  // Delete a link or sub-link
  const remove = (index, isSub = false, parentIndex = null) => {
    if (!confirm("Delete this link?")) return;
    const allItems = [...config.items];

    if (isSub) {
      allItems[parentIndex].children.splice(index, 1);
    } else {
      allItems.splice(index, 1);
    }
    updateConfig("items", allItems);
  };

  // Move links up or down
  const move = (index, direction, isSub = false, parentIndex = null) => {
    const allItems = [...config.items];
    const list = isSub ? allItems[parentIndex].children : allItems;

    const newIndex = index + direction;
    // Prevent moving out of bounds
    if (newIndex < 0 || newIndex >= list.length) return;

    // Swap the items
    [list[index], list[newIndex]] = [list[newIndex], list[index]];
    updateConfig("items", allItems);
  };

  // Update Main Link Text
  const setItemLabel = (index, value) => {
    const allItems = [...config.items];
    allItems[index].translations[lang].label = value;
    updateConfig("items", allItems);
  };

  // Update Main Link URL
  const setItemHref = (index, value) => {
    const allItems = [...config.items];
    allItems[index].href = cleanPath(value);
    updateConfig("items", allItems);
  };

  // Turn dropdown on/off
  const setDropdown = (index, isChecked) => {
    const allItems = [...config.items];
    allItems[index].hasDropdown = isChecked;
    updateConfig("items", allItems);
  };

  // Update Sub-Link Text
  const setSubLabel = (mainIndex, subIndex, value) => {
    const allItems = [...config.items];
    allItems[mainIndex].children[subIndex].translations[lang].label = value;
    updateConfig("items", allItems);
  };

  // Update Sub-Link URL
  const setSubHref = (mainIndex, subIndex, value) => {
    const allItems = [...config.items];
    allItems[mainIndex].children[subIndex].href = cleanPath(value);
    updateConfig("items", allItems);
  };

  // ==========================================
  // 10. RENDER UI
  // ==========================================

  // Reusable classes for our inputs to keep HTML clean
  const inputCls =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";
  const labelCls = "mb-2 block text-sm font-semibold";

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const ctaLabel = config.cta?.translations?.[lang]?.label || "";
  const search = { ...emptySearch(), ...config.search?.translations?.[lang] };

  return (
    // Note: Removed dir={dir} here! The admin layout stays LTR always.
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Cloudinary Script */}
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-6xl space-y-5">
        {/* PAGE HEADER */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Site Structure
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Navigation & Header
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Logo, CTA, search text, and menu links
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <AdminLanguageBall
              language={lang}
              onLanguageChange={setLangAndStore}
            />
            <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-1.5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLangAndStore(l.code)}
                  className={`min-h-10 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                    lang === l.code
                      ? "bg-[var(--accent)] text-white shadow-md"
                      : "text-[var(--muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* GLOBAL SETTINGS (Logo, CTA, Search) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <Settings size={18} className="text-[var(--accent)]" />
              Global Settings ({lang.toUpperCase()})
            </h2>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2">
            {/* Logo Upload Section */}
            <div className="md:col-span-2">
              <label className={labelCls}>Site Logo</label>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-3">
                  {config.logo ? (
                    <img
                      src={config.logo}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[var(--muted)]">No logo</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={uploadLogo}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#249b98]"
                  >
                    <Upload size={16} />
                    {config.logo ? "Replace Logo" : "Upload Logo"}
                  </button>
                  {config.logo && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Button Editor */}
            <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <h3 className="text-sm font-bold text-[var(--accent)]">
                CTA Button
              </h3>
              <div>
                <label className={labelCls}>Label / Name</label>
                <input
                  dir={inputDirection} // This changes rtl/ltr based on language!
                  className={inputCls}
                  value={ctaLabel}
                  onChange={(e) => setCtaLabel(e.target.value)}
                  placeholder="Let's Talk"
                />
              </div>
              <div>
                <label className={labelCls}>Link URL</label>
                <input
                  dir="ltr" // URLs should ALWAYS be LTR!
                  className={inputCls}
                  value={config.cta?.href || ""}
                  onChange={(e) =>
                    updateConfig("cta", {
                      ...config.cta,
                      href: cleanPath(e.target.value),
                    })
                  }
                  placeholder="/contact"
                />
              </div>
            </div>

            {/* Search Box Editor */}
            <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
              <h3 className="text-sm font-bold text-[var(--accent)]">
                Search Box text
              </h3>
              {["heading", "subheading", "placeholder"].map((field) => (
                <div key={field}>
                  <label className={labelCls}>
                    {field[0].toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    dir={inputDirection} // Changes based on language
                    className={inputCls}
                    value={search[field] || ""}
                    onChange={(e) => setSearchField(field, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NAVIGATION LINKS SECTION */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <LinkIcon size={18} className="text-[var(--accent)]" />
              Menu Links ({config.items.length})
            </h2>
            <button
              type="button"
              onClick={addLink}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#249b98]"
            >
              <Plus size={16} /> Add Link
            </button>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            {/* If there are no links, show a friendly message */}
            {config.items.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-[var(--border)] py-14 text-center">
                <LayoutGrid
                  className="mx-auto mb-3 text-[var(--muted)] opacity-50"
                  size={40}
                />
                <p className="text-sm text-[var(--muted)]">
                  No menu links added yet
                </p>
              </div>
            ) : (
              /* Otherwise, map through all links and display them */
              config.items.map((item, index) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-[var(--border)] shadow-sm"
                >
                  {/* Top bar of the Link Card (Title and Move/Delete buttons) */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                    <span className="text-sm font-bold text-[var(--accent)]">
                      Link #{index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 disabled:opacity-30"
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={index === config.items.length - 1}
                        onClick={() => move(index, 1)}
                        className="rounded-lg border border-[var(--border)] p-1.5 disabled:opacity-30"
                      >
                        <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 p-4 sm:p-5">
                    {/* Link Label and URL Inputs */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>
                          Label ({lang.toUpperCase()})
                        </label>
                        <input
                          dir={inputDirection} // Changes based on language
                          className={inputCls}
                          value={item.translations?.[lang]?.label || ""}
                          onChange={(e) => setItemLabel(index, e.target.value)}
                          placeholder="Example: About Us"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>URL</label>
                        <input
                          dir="ltr" // Always LTR
                          className={inputCls}
                          value={item.href || ""}
                          onChange={(e) => setItemHref(index, e.target.value)}
                          placeholder="/about"
                        />
                      </div>
                    </div>

                    {/* Checkbox for Dropdown */}
                    <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                      <input
                        type="checkbox"
                        className="accent-[var(--accent)]"
                        checked={!!item.hasDropdown}
                        onChange={(e) => setDropdown(index, e.target.checked)}
                      />
                      Enable Dropdown (Sub-links)
                    </label>

                    {/* Sub-links Section (Only shows if Dropdown is checked) */}
                    {item.hasDropdown && (
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-[var(--muted)]">
                            Sub-links ({item.children?.length || 0})
                          </span>
                          <button
                            type="button"
                            onClick={() => addSub(index)}
                            className="inline-flex items-center gap-1 rounded-lg bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
                          >
                            <Plus size={14} /> Add sub-link
                          </button>
                        </div>

                        {(item.children || []).length === 0 ? (
                          <p className="rounded-xl border border-dashed border-[var(--border)] p-4 text-center text-xs text-[var(--muted)]">
                            No sub-links added yet
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {item.children.map((sub, subIndex) => (
                              <div
                                key={sub.id}
                                className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-2"
                              >
                                {/* Move Sub-link buttons */}
                                <div className="flex flex-col">
                                  <button
                                    type="button"
                                    disabled={subIndex === 0}
                                    onClick={() =>
                                      move(subIndex, -1, true, index)
                                    }
                                    className="disabled:opacity-30"
                                  >
                                    <ArrowLeft
                                      size={14}
                                      className="rotate-90"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={
                                      subIndex === item.children.length - 1
                                    }
                                    onClick={() =>
                                      move(subIndex, 1, true, index)
                                    }
                                    className="disabled:opacity-30"
                                  >
                                    <ArrowRight
                                      size={14}
                                      className="rotate-90"
                                    />
                                  </button>
                                </div>

                                {/* Sub-link Inputs */}
                                <input
                                  dir={inputDirection} // Changes based on language
                                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                                  placeholder="Sub-link Name"
                                  value={sub.translations?.[lang]?.label || ""}
                                  onChange={(e) =>
                                    setSubLabel(index, subIndex, e.target.value)
                                  }
                                />
                                <input
                                  dir="ltr" // Always LTR
                                  className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                                  placeholder="/path"
                                  value={sub.href || ""}
                                  onChange={(e) =>
                                    setSubHref(index, subIndex, e.target.value)
                                  }
                                />

                                {/* Delete Sub-link Button */}
                                <button
                                  type="button"
                                  onClick={() => remove(subIndex, true, index)}
                                  className="rounded-lg p-2 text-red-500 hover:bg-red-500/10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}

            {/* Bottom Button to add another link */}
            <button
              type="button"
              onClick={addLink}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--accent)]/30 bg-[var(--accent)]/5 py-4 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white"
            >
              <Plus size={18} /> Add another link
            </button>
          </div>
        </section>

        {/* BOTTOM STICKY SAVE BAR */}
        <footer className="sticky bottom-3 z-40 flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center">
          <p className="text-xs text-[var(--muted)]">
            Editing Language:{" "}
            <span className="font-semibold text-[var(--accent)]">
              {currentLangName}
            </span>
            {" · "}
            Total Links: {config.items.length}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={17} className="animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save size={17} /> Save Changes
              </>
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}
