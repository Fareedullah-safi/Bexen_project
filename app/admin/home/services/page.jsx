"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import {
  ArrowDown,
  ArrowUp,
  Box,
  ImagePlus,
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

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

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

const createEmptySolution = () => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: createTranslation(),
  description: createTranslation(),
  image: "",
  publicId: "",
});

/* ==================== Image Picker ==================== */

function ImagePicker({ value, publicId, onChange, disabled, cloudinaryReady }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [value]);

  function openCloudinaryWidget() {
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
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#1E8A8A",
            tabIcon: "#1E8A8A",
            menuIcons: "#1E8A8A",
            textDark: "#101828",
            textLight: "#FFFFFF",
            link: "#1E8A8A",
            action: "#1E8A8A",
            inactiveTabIcon: "#667085",
            error: "#D92D20",
            inProgress: "#1E8A8A",
            complete: "#12B76A",
            sourceBg: "#F7F9FC",
          },
        },
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
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-3 text-sm font-semibold text-white transition hover:bg-[#1E8A8A] disabled:opacity-40"
        >
          <Upload size={16} />
          {value && !imageError ? "Change Image" : "Upload with Cloudinary"}
        </button>
      </div>
    </div>
  );
}

/* ==================== Main Admin Page ==================== */

export default function SolutionsAdmin() {
  const [language, setLanguage] = useState("en");
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  const [badge, setBadge] = useState(() => createTranslation("OUR SOLUTIONS"));
  const [headingOne, setHeadingOne] = useState(() =>
    createTranslation("Solutions to Transform"),
  );
  const [headingTwo, setHeadingTwo] = useState(() => createTranslation("Your"));
  const [highlight, setHighlight] = useState(() =>
    createTranslation("Business."),
  );

  const [solutions, setSolutions] = useState([createEmptySolution()]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const selectedLanguage =
    LANGUAGES.find((item) => item.code === language) || LANGUAGES[0];

  const inputDirection = language === "en" ? "ltr" : "rtl";
  const busy = isSaving || !!deletingId;

  /* ==================== Load Data ==================== */

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const res = await fetch("/api/homepage/services");
        const result = await res.json().catch(() => ({}));

        if (!res.ok || result.success === false) {
          throw new Error(
            result.message || result.error || "Failed to load saved data",
          );
        }

        if (cancelled) return;

        if (!result.data) {
          setSolutions([createEmptySolution()]);
          return;
        }

        const data = result.data;

        setBadge(normalizeTranslation(data.badge, "OUR SOLUTIONS"));
        setHeadingOne(
          normalizeTranslation(data.headingOne, "Solutions to Transform"),
        );
        setHeadingTwo(normalizeTranslation(data.headingTwo, "Your"));
        setHighlight(normalizeTranslation(data.highlight, "Business."));

        setSolutions(
          Array.isArray(data.solutions) && data.solutions.length
            ? data.solutions.map(normalizeSolution)
            : [createEmptySolution()],
        );
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || "Failed to load saved data");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==================== Translation Helpers ==================== */

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

  /* ==================== Validation ==================== */

  function validateAllLanguages() {
    const translatedFields = [
      { name: "Badge Text", value: badge },
      { name: "Heading Line 1", value: headingOne },
      { name: "Heading Line 2", value: headingTwo },
      { name: "Highlight Word", value: highlight },
    ];

    if (!solutions.length) {
      toast.error("Add at least one solution card.");
      return false;
    }

    for (const lang of LANGUAGES) {
      for (const field of translatedFields) {
        if (!field.value?.[lang.code]?.trim()) {
          setLanguage(lang.code);
          toast.error(
            `${field.name} is required in ${lang.label}. Complete all language tabs before saving.`,
          );
          return false;
        }
      }

      for (let index = 0; index < solutions.length; index++) {
        const item = solutions[index];

        if (!item.title?.[lang.code]?.trim()) {
          setLanguage(lang.code);
          toast.error(
            `Solution ${index + 1}: Title is required in ${lang.label}.`,
          );
          return false;
        }

        if (!item.description?.[lang.code]?.trim()) {
          setLanguage(lang.code);
          toast.error(
            `Solution ${index + 1}: Description is required in ${lang.label}.`,
          );
          return false;
        }
      }
    }

    for (let index = 0; index < solutions.length; index++) {
      const item = solutions[index];

      if (!item.image?.trim()) {
        toast.error(`Solution ${index + 1}: Image is required.`);
        return false;
      }

      if (!item.publicId?.trim()) {
        toast.error(
          `Solution ${index + 1}: Please upload its image using Cloudinary.`,
        );
        return false;
      }

      if (!item.image.startsWith("https://")) {
        toast.error(
          `Solution ${index + 1}: The image must be a valid HTTPS image URL.`,
        );
        return false;
      }
    }

    return true;
  }

  /* ==================== Delete Solution ==================== */

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
        headers: {
          "Content-Type": "application/json",
        },
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

  /* ==================== Save Solutions ==================== */

  async function handleSave(event) {
    event.preventDefault();

    if (busy) return;
    if (!validateAllLanguages()) return;

    try {
      setIsSaving(true);

      const payload = {
        badge,
        headingOne,
        headingTwo,
        highlight,
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json().catch(() => ({}));

      if (!res.ok || result.success === false) {
        throw new Error(
          result.message || result.error || "Failed to save solutions",
        );
      }

      if (result.data) {
        setBadge(normalizeTranslation(result.data.badge));
        setHeadingOne(normalizeTranslation(result.data.headingOne));
        setHeadingTwo(normalizeTranslation(result.data.headingTwo));
        setHighlight(normalizeTranslation(result.data.highlight));

        if (Array.isArray(result.data.solutions)) {
          setSolutions(result.data.solutions.map(normalizeSolution));
        }
      }

      toast.success("Solutions saved successfully");
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  /* ==================== Styles ==================== */

  const inputClass =
    "w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60";

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
    <div className="min-h-screen w-full bg-[var(--background)] text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => {
          setCloudinaryReady(false);
          toast.error("Unable to load Cloudinary widget");
        }}
      />

      {/* Heading, three language buttons, and language ball */}
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
                onClick={() => setLanguage(item.code)}
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
            onLanguageChange={setLanguage}
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section Header */}
        <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
              01
            </span>
            <h2 className="text-lg font-bold">Section Header</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {[
              {
                label: "Badge Text",
                value: badge,
                setter: setBadge,
                placeholder: "OUR SOLUTIONS",
              },
              {
                label: "Highlight Word",
                value: highlight,
                setter: setHighlight,
                placeholder: "Business.",
              },
              {
                label: "Heading Line 1",
                value: headingOne,
                setter: setHeadingOne,
                placeholder: "Solutions to Transform",
              },
              {
                label: "Heading Line 2",
                value: headingTwo,
                setter: setHeadingTwo,
                placeholder: "Your",
              },
            ].map((field) => (
              <div key={field.label}>
                <label className={labelClass}>{field.label}</label>
                <input
                  value={field.value[language] || ""}
                  onChange={(event) =>
                    updateTranslation(field.setter, event.target.value)
                  }
                  disabled={busy}
                  placeholder={field.placeholder}
                  dir={inputDirection}
                  className={inputClass}
                  required
                />
              </div>
            ))}
          </div>
        </section>

        {/* Solutions Cards */}
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
                      {item.title[language] ||
                        `${selectedLanguage.label} — Solution ${index + 1}`}
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
                      <input
                        value={item.title[language] || ""}
                        onChange={(event) =>
                          updateSolutionTranslation(
                            item.id,
                            "title",
                            event.target.value,
                          )
                        }
                        disabled={busy}
                        placeholder="e.g. Business Strategy Development"
                        dir={inputDirection}
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={item.description[language] || ""}
                        onChange={(event) =>
                          updateSolutionTranslation(
                            item.id,
                            "description",
                            event.target.value,
                          )
                        }
                        disabled={busy}
                        rows={5}
                        placeholder="Enter short card description..."
                        dir={inputDirection}
                        className={`${inputClass} resize-y`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Card Image</label>
                    <ImagePicker
                      value={item.image}
                      publicId={item.publicId}
                      disabled={busy}
                      cloudinaryReady={cloudinaryReady}
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

        {/* Save Footer */}
        <footer className="sticky bottom-4 z-10 mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Ready to save your changes?
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Save translations and image references to MongoDB.
            </p>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167575] focus-visible:ring-4 focus-visible:ring-[#1E8A8A]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? <Spinner /> : <Save size={18} />}
            {isSaving ? "Saving Solutions..." : "Save Solutions"}
          </button>
        </footer>
      </form>
    </div>
  );
}

/* ==================== Solution Normalizer ==================== */

function normalizeSolution(item, index) {
  return {
    id: String(item._id || item.id || `item-${index}-${Date.now()}`),
    title: normalizeTranslation(item.title),
    description: normalizeTranslation(item.description),
    image: item.image || "",
    publicId: item.publicId || "",
  };
}
