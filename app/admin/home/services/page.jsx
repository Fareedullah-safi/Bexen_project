"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import { stripHtml } from "@/Lib/sanitizeText";
import {
  ArrowDown,
  ArrowUp,
  Box,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useState } from "react";
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

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fa", label: "دری" },
  { code: "ps", label: "پښتو" },
];

const createTranslation = (en = "") => ({
  en,
  fa: "",
  ps: "",
});

const normalizeTranslation = (value, fallback = "") => {
  if (typeof value === "string") {
    return {
      en: value || fallback,
      fa: "",
      ps: "",
    };
  }

  return {
    en: value?.en || fallback,
    fa: value?.fa || "",
    ps: value?.ps || "",
  };
};

function resolveLegacyTitle(data, lang) {
  if (data.title && data.title[lang]) {
    return data.title[lang];
  }
  const h1 = data.headingOne?.[lang] || "";
  const h2 = data.headingTwo?.[lang] || "";
  const hl = data.highlight?.[lang] || "";

  const parts = [];
  if (stripHtml(h1)) parts.push(h1);
  if (stripHtml(h2)) parts.push(h2);
  if (stripHtml(hl)) parts.push("<strong>" + hl + "</strong>");

  return parts.join(" ");
}

const createEmptySolution = () => ({
  id: "new-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
  title: createTranslation(),
  description: createTranslation(),
  image: "",
  publicId: "",
});

function normalizeSolution(item, index) {
  return {
    id: String(item._id || item.id || "item-" + index + "-" + Date.now()),
    title: normalizeTranslation(item.title),
    description: normalizeTranslation(item.description),
    image: item.image || "",
    publicId: item.publicId || "",
  };
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
        folder: "homepage/services",
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
        maxFileSize: 5 * 1024 * 1024,
        sources: ["local", "camera", "url"],
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
              alt="Solution preview"
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

/* ==================== Main Admin Page ==================== */

export default function SolutionsAdmin() {
  const [language, setLanguage] = useState("en");
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [theme, setTheme] = useState("light");

  const [badge, setBadge] = useState(() => createTranslation("OUR SOLUTIONS"));
  const [title, setTitle] = useState(() =>
    createTranslation("Solutions to Transform Your <strong>Business.</strong>"),
  );

  const [solutions, setSolutions] = useState([createEmptySolution()]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];
  const inputDirection = language === "en" ? "ltr" : "rtl";
  const busy = isSaving || !!deletingId;

  /* Theme watcher — same as Blog admin */
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/homepage/services");
      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.success === false) {
        throw new Error(
          result.message || result.error || "Failed to load saved data",
        );
      }

      if (!result.data) {
        setSolutions([createEmptySolution()]);
        return;
      }

      const data = result.data;

      setBadge(normalizeTranslation(data.badge, "OUR SOLUTIONS"));
      setTitle({
        en:
          resolveLegacyTitle(data, "en") ||
          "Solutions to Transform Your <strong>Business.</strong>",
        fa: resolveLegacyTitle(data, "fa"),
        ps: resolveLegacyTitle(data, "ps"),
      });

      setSolutions(
        Array.isArray(data.solutions) && data.solutions.length
          ? data.solutions.map(normalizeSolution)
          : [createEmptySolution()],
      );
    } catch (error) {
      toast.error(error.message || "Failed to load saved data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function changeLanguage(code) {
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

  function updateTranslation(setter, value) {
    setter((previous) => ({
      ...previous,
      [language]: value,
    }));
  }

  function updateSolutionTranslation(id, field, value) {
    setSolutions((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: {
                ...normalizeTranslation(item[field]),
                [language]: value,
              },
            }
          : item,
      ),
    );
  }

  function updateImage(id, uploaded) {
    setSolutions((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              image: uploaded.image,
              publicId: uploaded.publicId,
            }
          : item,
      ),
    );
  }

  function addSolution() {
    setSolutions((previous) => [...previous, createEmptySolution()]);
  }

  function moveSolution(index, direction) {
    if (busy) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= solutions.length) return;

    setSolutions((previous) => {
      const updated = [...previous];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      return updated;
    });
  }

  function validateAllLanguages() {
    const translatedFields = [
      { name: "Badge Text", value: badge },
      { name: "Main Title", value: title },
    ];

    if (!solutions.length) {
      toast.error("Add at least one solution card.");
      return false;
    }

    for (const lang of LANGUAGES) {
      for (const field of translatedFields) {
        if (!stripHtml(field.value?.[lang.code] || "")) {
          changeLanguage(lang.code);
          toast.error(
            field.name +
              " is required in " +
              lang.label +
              ". Complete all language tabs before saving.",
          );
          return false;
        }
      }

      for (let index = 0; index < solutions.length; index++) {
        const item = solutions[index];

        if (!stripHtml(item.title?.[lang.code] || "")) {
          changeLanguage(lang.code);
          toast.error(
            "Solution " +
              (index + 1) +
              ": Title is required in " +
              lang.label +
              ".",
          );
          return false;
        }

        if (!stripHtml(item.description?.[lang.code] || "")) {
          changeLanguage(lang.code);
          toast.error(
            "Solution " +
              (index + 1) +
              ": Description is required in " +
              lang.label +
              ".",
          );
          return false;
        }
      }
    }

    for (let index = 0; index < solutions.length; index++) {
      const item = solutions[index];

      if (!item.image?.trim()) {
        toast.error("Solution " + (index + 1) + ": Image is required.");
        return false;
      }

      if (!item.publicId?.trim()) {
        toast.error(
          "Solution " +
            (index + 1) +
            ": Please upload its image using Cloudinary.",
        );
        return false;
      }
    }

    return true;
  }

  async function handleDeleteCard(cardId) {
    if (busy) return;

    if (solutions.length === 1) {
      toast.error("You must have at least one card");
      return;
    }

    if (String(cardId).startsWith("new-")) {
      setSolutions((previous) => previous.filter((item) => item.id !== cardId));
      toast.success("Card removed");
      return;
    }

    try {
      setDeletingId(cardId);

      const res = await fetch("/api/homepage/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.success === false) {
        throw new Error(
          result.message || result.error || "Failed to delete card",
        );
      }

      setSolutions((previous) => previous.filter((item) => item.id !== cardId));
      toast.success("Card deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete card");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSave() {
    if (busy) return;
    if (!validateAllLanguages()) return;

    try {
      setIsSaving(true);

      const payload = {
        badge,
        title,
        solutions: solutions.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          image: item.image,
          publicId: item.publicId,
        })),
      };

      const res = await fetch("/api/homepage/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.success === false) {
        throw new Error(
          result.message || result.error || "Failed to save solutions",
        );
      }

      toast.success("Solutions saved successfully");
      loadData();
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--foreground)]";

  if (isLoading) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-3 bg-[var(--background)]">
        <Spinner />
        <p className="text-sm font-medium text-[var(--muted)]">
          Loading solutions...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => {
          setCloudinaryReady(false);
          toast.error("Unable to load Cloudinary widget");
        }}
      />

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <Box size={27} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Solutions Slider
            </h1>
            <p className="mt-1 text-base text-[var(--muted)]">
              Manage section five — solutions cards and heading.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                disabled={busy}
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
        · Other translations remain unchanged. All three languages are required
        before saving.
      </p>

      <div className="space-y-6">
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
              01
            </span>
            <h2 className="text-lg font-bold">Section Header</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Badge Text</label>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <RichTextEditor
                  key={"badge-" + language}
                  value={badge[language]}
                  onChange={(val) => updateTranslation(setBadge, val)}
                  dir={inputDirection}
                  placeholder="OUR SOLUTIONS"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>
                Main Title (Includes Highlights)
              </label>
              <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                <RichTextEditor
                  key={"title-" + language}
                  value={title[language]}
                  onChange={(val) => updateTranslation(setTitle, val)}
                  dir={inputDirection}
                  placeholder="Solutions to Transform Your Business"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                02
              </span>
              <h2 className="text-lg font-bold">Solutions Cards</h2>
            </div>
            <span className="w-fit rounded-full bg-[#1E8A8A]/10 px-4 py-2 text-sm font-semibold text-[#1E8A8A]">
              {solutions.length} cards
            </span>
          </div>

          <div className="space-y-5">
            {solutions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="truncate text-sm font-semibold">
                      {stripHtml(item.title[language]) ||
                        selectedLanguage.label + " — Solution " + (index + 1)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveSolution(index, "up")}
                      disabled={index === 0 || busy}
                      title="Move up"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-30"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSolution(index, "down")}
                      disabled={index === solutions.length - 1 || busy}
                      title="Move down"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-30"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(item.id)}
                      disabled={busy}
                      title="Delete card"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white disabled:opacity-40"
                    >
                      {deletingId === item.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Card Title</label>
                      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                        <RichTextEditor
                          key={"card-title-" + item.id + "-" + language}
                          value={item.title[language]}
                          onChange={(val) =>
                            updateSolutionTranslation(item.id, "title", val)
                          }
                          dir={inputDirection}
                          placeholder="e.g. Business Strategy Development"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                        <RichTextEditor
                          key={"card-desc-" + item.id + "-" + language}
                          value={item.description[language]}
                          onChange={(val) =>
                            updateSolutionTranslation(
                              item.id,
                              "description",
                              val,
                            )
                          }
                          dir={inputDirection}
                          placeholder="Enter short card description..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Card Image</label>
                    <ImagePicker
                      value={item.image}
                      publicId={item.publicId}
                      disabled={busy}
                      cloudinaryReady={cloudinaryReady}
                      theme={theme}
                      onChange={(uploaded) => updateImage(item.id, uploaded)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSolution}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-40"
          >
            <Plus size={18} />
            Add New Solution
          </button>
        </section>

        <AdminStickyFooter
          onReload={loadData}
          onSave={handleSave}
          saving={isSaving}
          busy={busy}
        />
      </div>
    </div>
  );
}
