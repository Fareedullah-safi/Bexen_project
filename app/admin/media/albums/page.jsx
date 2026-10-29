"use client";

import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  Image as ImageIcon,
  LayoutGrid,
  Loader2,
  Save,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";

const API_URL = "/api/media/albums";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو (Pashto)" },
  { code: "fa", label: "دری (Dari)" },
];

const emptyTranslation = () => ({ title: "", subtitle: "" });

export default function GallerySectionAdmin() {
  const widgetRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErrors, setLangErrors] = useState({
    en: false,
    ps: false,
    fa: false,
  });

  const [formData, setFormData] = useState({
    translations: {
      en: emptyTranslation(),
      ps: emptyTranslation(),
      fa: emptyTranslation(),
    },
    images: [],
  });

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        if (isMounted && res.data?.success && res.data?.data) {
          const d = res.data.data;
          setFormData({
            translations: {
              en: { ...emptyTranslation(), ...d.translations?.en },
              ps: { ...emptyTranslation(), ...d.translations?.ps },
              fa: { ...emptyTranslation(), ...d.translations?.fa },
            },
            images: d.images || [],
          });
        }
      } catch (error) {
        toast.error("Failed to load gallery data.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // FAQ-style language change — ball + tabs stay in sync
  const changeLanguage = (code) => {
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
  };

  const handleTranslationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: { ...prev.translations[language], [name]: value },
      },
    }));
    if (langErrors[language]) {
      setLangErrors((prev) => ({ ...prev, [language]: false }));
    }
  };

  const validateFields = () => {
    const newErrors = { en: false, ps: false, fa: false };
    let firstErrorLang = null;
    let isValid = true;

    LANGUAGES.forEach(({ code }) => {
      const t = formData.translations[code];
      if (!t.title?.trim() || !t.subtitle?.trim()) {
        newErrors[code] = true;
        isValid = false;
        if (!firstErrorLang) firstErrorLang = code;
      }
    });

    setLangErrors(newErrors);

    if (!isValid && firstErrorLang) {
      changeLanguage(firstErrorLang);
      toast.error(
        `Please fill all required fields in ${LANGUAGES.find((l) => l.code === firstErrorLang).label}`,
      );
    }

    return isValid;
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!validateFields()) return;

    setIsSaving(true);
    try {
      const res = await axios.post(API_URL, formData);
      if (res.data.success) toast.success("Gallery saved successfully!");
      else throw new Error(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save gallery.");
    } finally {
      setIsSaving(false);
    }
  };

  const moveImage = (index, direction) => {
    const newImages = [...formData.images];
    if (index + direction < 0 || index + direction >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[index + direction];
    newImages[index + direction] = temp;
    setFormData((p) => ({ ...p, images: newImages }));
  };

  const removeImage = async (index) => {
    const img = formData.images[index];

    if (
      !window.confirm(
        "Are you sure you want to permanently delete this image from Cloudinary?",
      )
    )
      return;

    setDeletingIndex(index);
    try {
      if (img.publicId) {
        await axios.post(API_URL, { publicId: img.publicId });
      }

      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData((p) => ({ ...p, images: newImages }));

      toast.success("Image permanently deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete image from Cloudinary.");
    } finally {
      setDeletingIndex(null);
    }
  };

  const openCloudinary = useCallback(() => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!widgetReady || !window.cloudinary)
      return toast.error("Cloudinary is loading...");
    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary keys missing.");

    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        sources: ["local", "url"],
        multiple: true,
        maxFiles: 20,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        folder: "bexon/gallery",
      },
      (error, result) => {
        if (error) {
          toast.error("Upload failed.");
          return;
        }
        if (result?.event === "success") {
          const newImg = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
          };
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImg],
          }));
        }
      },
    );
    widgetRef.current.open();
  }, [widgetReady]);

  if (isLoading)
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );

  const t = formData.translations[language];
  const inputDir = language === "en" ? "ltr" : "rtl";
  const hasError = langErrors[language];

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-all duration-300 placeholder:text-[var(--muted)] hover:border-[var(--accent)]/50 focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-4 focus:ring-[var(--accent)]/10";
  const labelClass =
    "mb-2 block text-sm font-semibold text-[var(--foreground)]";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        onReady={() => setWidgetReady(true)}
      />

      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-start lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[var(--accent)] uppercase">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
              Gallery Configuration
            </div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Image Gallery Admin
            </h1>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Manage the visual portfolio header and upload up to 20 images.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <AdminLanguageBall
              language={language}
              onLanguageChange={changeLanguage}
            />

            <div className="w-full min-w-0 sm:min-w-[320px]">
              <div
                className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-1.5 shadow-sm"
                role="group"
              >
                {LANGUAGES.map((item) => {
                  const isActive = language === item.code;
                  const hasErr = langErrors[item.code];
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => changeLanguage(item.code)}
                      disabled={isSaving}
                      className={`relative flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive
                          ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-md"
                          : "text-[var(--muted)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]"
                      }`}
                    >
                      {item.code === "en"
                        ? "English"
                        : item.code === "fa"
                          ? "دری"
                          : "پښتو"}
                      <span
                        className={`h-2 w-2 rounded-full ${hasErr ? "bg-red-400" : "bg-transparent"}`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <h2 className="flex items-center gap-2 font-semibold">
                <Type size={18} className="text-[var(--accent)]" />
                Presentation Text ({language.toUpperCase()})
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Editing:{" "}
                {LANGUAGES.find((item) => item.code === language)?.label}
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              <div>
                <label className={labelClass}>
                  Gallery Title <span className="text-red-500">*</span>
                </label>
                <input
                  dir={inputDir}
                  name="title"
                  value={t.title}
                  onChange={handleTranslationChange}
                  placeholder="e.g. Visual Portfolio"
                  className={`${inputClass} ${hasError && !t.title.trim() ? "border-red-500/50 hover:border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                />
                {hasError && !t.title.trim() && (
                  <p className="mt-1 text-xs text-red-500">
                    Title is required.
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Gallery Subtitle <span className="text-red-500">*</span>
                </label>
                <input
                  dir={inputDir}
                  name="subtitle"
                  value={t.subtitle}
                  onChange={handleTranslationChange}
                  placeholder="e.g. Explore our collection of premium images."
                  className={`${inputClass} ${hasError && !t.subtitle.trim() ? "border-red-500/50 hover:border-red-500 focus:border-red-500 focus:ring-red-500/10" : ""}`}
                />
                {hasError && !t.subtitle.trim() && (
                  <p className="mt-1 text-xs text-red-500">
                    Subtitle is required.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="flex items-center gap-2 font-semibold">
                    <LayoutGrid size={18} className="text-[var(--accent)]" />
                    Portfolio Images ({formData.images.length})
                  </h2>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Drag arrows to reorder. Images are shared across all
                    languages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openCloudinary}
                  disabled={!widgetReady || isSaving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#249b98] disabled:opacity-60 sm:w-auto"
                >
                  <Upload size={16} /> Upload Images
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              {formData.images.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] px-4 py-16 text-center">
                  <span className="mb-3 rounded-xl bg-[var(--accent)]/15 p-4 text-[var(--accent)]">
                    <ImageIcon size={27} />
                  </span>
                  <p className="text-sm font-medium">No images uploaded yet.</p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Click upload to add stunning photos to your portfolio.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {formData.images.map((img, idx) => (
                    <div
                      key={`${img.publicId}-${idx}`}
                      className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] shadow-sm"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery ${idx}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {deletingIndex === idx && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-2 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 lg:group-hover:opacity-100">
                        <div className="flex justify-between">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-xs font-bold text-white shadow-sm backdrop-blur-md">
                            {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            disabled={deletingIndex === idx}
                            className="rounded-full bg-red-500/90 p-2 text-white shadow-sm backdrop-blur-md transition-colors hover:bg-red-600 disabled:opacity-50"
                            title="Delete Image"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <div className="flex justify-center gap-2 pb-2">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            disabled={idx === 0 || deletingIndex === idx}
                            className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-[var(--accent)] disabled:opacity-30"
                            title="Move Left/Up"
                          >
                            <ArrowLeft size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            disabled={
                              idx === formData.images.length - 1 ||
                              deletingIndex === idx
                            }
                            className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition-colors hover:bg-[var(--accent)] disabled:opacity-30"
                            title="Move Right/Down"
                          >
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <footer className="sticky bottom-3 z-40 mt-8 flex flex-col justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs text-[var(--muted)]">
              Editing:{" "}
              <span className="font-semibold text-[var(--accent)]">
                {LANGUAGES.find((l) => l.code === language)?.label}
              </span>
              {" · "}
              {formData.images.length} images added. Make sure to save changes.
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Gallery
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
