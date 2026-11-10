"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import { stripHtml } from "@/Lib/sanitizeText";
import axios from "axios";
import {
  CloudUpload,
  ImagePlus,
  Images,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/homepage/slides"; // The API should accept a POST/PUT with { slides: [...] }
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_SCRIPT_SRC =
  "https://upload-widget.cloudinary.com/global/all.js";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyTranslation = () => ({
  title: "",
  description: "",
});

export default function HeroSliderAdmin() {
  const [slides, setSlides] = useState([]);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replacingId, setReplacingId] = useState(null);

  const widgetRef = useRef(null);
  const isMountedRef = useRef(true);

  const inputDirection = language === "en" ? "ltr" : "rtl";

  // Load Data
  async function loadData() {
    setLoading(true);
    try {
      const response = await axios.get(API);
      const fetchedSlides = response.data?.slides || response.data || [];
      console.log(fetchedSlides);

      const normalizedSlides = fetchedSlides.map(function (slide) {
        return {
          id: slide.id || slide._id || crypto.randomUUID(),
          image: slide.image || "",
          publicId: slide.publicId || slide.imagePublicId || "",
          translations: {
            en: { ...emptyTranslation(), ...(slide.translations?.en || {}) },
            ps: { ...emptyTranslation(), ...(slide.translations?.ps || {}) },
            fa: { ...emptyTranslation(), ...(slide.translations?.fa || {}) },
          },
        };
      });

      setSlides(normalizedSlides);
    } catch (error) {
      toast.error("Failed to load slides.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    isMountedRef.current = true;
    loadData();
    return () => {
      isMountedRef.current = false;
      try {
        widgetRef.current?.destroy?.();
      } catch {}
    };
  }, []);

  // Load Cloudinary Script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.cloudinary?.createUploadWidget) {
      setCloudinaryReady(true);
      return;
    }

    let script = document.querySelector(
      'script[src="' + CLOUDINARY_SCRIPT_SRC + '"]',
    );
    if (!script) {
      script = document.createElement("script");
      script.src = CLOUDINARY_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    const handleLoad = () => setCloudinaryReady(true);
    script.addEventListener("load", handleLoad);

    return () => script.removeEventListener("load", handleLoad);
  }, []);

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

  function handleRichTextChange(slideId, field, value) {
    setSlides(function (prev) {
      return prev.map(function (s) {
        if (s.id !== slideId) return s;
        return {
          ...s,
          translations: {
            ...s.translations,
            [language]: { ...s.translations[language], [field]: value },
          },
        };
      });
    });
  }

  // Cloudinary: Add Multiple Slides
  function handleAddSlides() {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      return toast.error("Cloudinary config missing.");
    }
    setUploading(true);

    try {
      widgetRef.current?.destroy?.();
    } catch {}

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        multiple: true,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      },
      function (err, res) {
        if (err) {
          setUploading(false);
          return toast.error("Upload failed");
        }
        if (res.event === "success" && res.info?.secure_url) {
          const newSlide = {
            id: crypto.randomUUID(),
            image: res.info.secure_url,
            publicId: res.info.public_id,
            translations: {
              en: emptyTranslation(),
              ps: emptyTranslation(),
              fa: emptyTranslation(),
            },
          };
          if (isMountedRef.current) {
            setSlides(function (prev) {
              return [...prev, newSlide];
            });
          }
        }
        if (res.event === "close" || res.event === "abort") {
          setUploading(false);
        }
      },
    );
    widgetRef.current.open();
  }

  // Cloudinary: Replace Single Slide Image
  function handleReplaceSlide(slideId) {
    if (!CLOUD_NAME || !UPLOAD_PRESET) return;
    setReplacingId(slideId);

    try {
      widgetRef.current?.destroy?.();
    } catch {}

    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        multiple: false,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      },
      function (err, res) {
        if (err) {
          setReplacingId(null);
          return toast.error("Replacement failed");
        }
        if (res.event === "success" && res.info?.secure_url) {
          if (isMountedRef.current) {
            setSlides(function (prev) {
              return prev.map(function (s) {
                if (s.id !== slideId) return s;
                return {
                  ...s,
                  image: res.info.secure_url,
                  publicId: res.info.public_id,
                };
              });
            });
            toast.success("Image replaced!");
          }
        }
        if (res.event === "close" || res.event === "abort") {
          setReplacingId(null);
        }
      },
    );
    widgetRef.current.open();
  }

  function handleRemoveSlide(slideId) {
    const confirmDelete = window.confirm("Remove this slide?");
    if (!confirmDelete) return;
    setSlides(function (prev) {
      return prev.filter(function (s) {
        return s.id !== slideId;
      });
    });
  }

  function validateSlides() {
    if (slides.length === 0) {
      toast.error("Please add at least one slide.");
      return false;
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      for (let j = 0; j < LANGUAGES.length; j++) {
        const lang = LANGUAGES[j].code;
        const t = slide.translations[lang];
        if (!stripHtml(t.title) || !stripHtml(t.description)) {
          toast.error(
            "Slide " +
              (i + 1) +
              " is missing title/description in " +
              LANGUAGES[j].label +
              ".",
          );
          setLanguage(lang);
          return false;
        }
      }
    }
    return true;
  }

  async function handleSave() {
    if (!validateSlides()) return;
    setSaving(true);

    try {
      const payload = { slides };
      // Note: Make sure your backend POST/PUT route handles this JSON payload
      const response = await axios.post(API, payload);

      if (response.data && response.data.success !== false) {
        toast.success("Slider updated successfully.");
        loadData(); // refresh _id mapping from db
      } else {
        throw new Error(response.data.message || "Save failed");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save slider.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  let editingLabel = "English";
  for (let i = 0; i < LANGUAGES.length; i++) {
    if (LANGUAGES[i].code === language) {
      editingLabel = LANGUAGES[i].label;
      break;
    }
  }

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] pb-28 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <Images size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Hero Slider</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage home page slider images and translations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-[#263442] dark:bg-[#111a23]">
            {LANGUAGES.map(function (item) {
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={function () {
                    changeLanguage(item.code);
                  }}
                  className={`relative rounded-lg px-3 py-2 text-xs font-semibold ${
                    language === item.code
                      ? "bg-[#1e8a8a] text-white"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#16212c]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <AdminLanguageBall
            language={language}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>

      {/* Cloudinary Dropzone */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center dark:border-[#263442] dark:bg-[#0b1117]">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e8a8a]/10 text-[#1e8a8a]">
            <CloudUpload size={28} />
          </div>
          <h3 className="mb-2 text-base font-bold">Add New Slides</h3>
          <p className="mb-6 max-w-md text-sm text-gray-500 dark:text-gray-400">
            Upload images via Cloudinary. They will be added to the gallery
            below.
          </p>

          <button
            type="button"
            onClick={handleAddSlides}
            disabled={uploading || !cloudinaryReady}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-6 text-sm font-semibold text-white transition hover:bg-[#167878] disabled:opacity-60"
          >
            {uploading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Uploading...
              </>
            ) : !cloudinaryReady ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Loading Widget...
              </>
            ) : (
              <>
                <Plus size={18} />
                Upload Images
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Slider Entries</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Editing text for:{" "}
              <span className="font-semibold text-[#1e8a8a]">
                {editingLabel}
              </span>
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Total: {slides.length}
          </p>
        </div>

        {slides.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 dark:border-[#263442] dark:text-gray-400">
            No slides yet. Upload images to begin.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {slides.map(function (slide, index) {
              const trans = slide.translations[language];

              return (
                <div
                  key={slide.id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-[#263442] dark:bg-[#0b1117]"
                >
                  {/* Image Block */}
                  <div className="group relative flex aspect-[16/7] items-center justify-center overflow-hidden bg-gray-100 dark:bg-gray-800">
                    {slide.image ? (
                      <img
                        src={slide.image}
                        alt={`Slide ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-xs text-gray-400">
                        <ImagePlus size={28} className="mb-1 text-[#1e8a8a]" />
                        No Image
                      </div>
                    )}

                    {/* Floating Slide Number */}
                    <div className="absolute top-3 left-3 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-white backdrop-blur">
                      #{index + 1}
                    </div>
                  </div>

                  {/* HTML Content Editors */}
                  <div className="space-y-4 p-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Slide Title
                      </label>
                      <RichTextEditor
                        key={"slide-" + slide.id + "-title-" + language}
                        value={trans.title}
                        onChange={function (val) {
                          handleRichTextChange(slide.id, "title", val);
                        }}
                        dir={inputDirection}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Slide Description
                      </label>
                      <RichTextEditor
                        key={"slide-" + slide.id + "-desc-" + language}
                        value={trans.description}
                        onChange={function (val) {
                          handleRichTextChange(slide.id, "description", val);
                        }}
                        dir={inputDirection}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 border-t border-gray-200 p-3 dark:border-[#263442]">
                    <button
                      type="button"
                      onClick={function () {
                        handleReplaceSlide(slide.id);
                      }}
                      disabled={replacingId === slide.id}
                      className="flex items-center gap-1.5 rounded-lg border border-[#1e8a8a]/30 px-3 py-1.5 text-xs font-semibold text-[#1e8a8a] transition hover:bg-[#1e8a8a]/10 disabled:opacity-50"
                    >
                      {replacingId === slide.id ? (
                        <LoaderCircle size={14} className="animate-spin" />
                      ) : (
                        <Upload size={14} />
                      )}
                      Replace Image
                    </button>

                    <button
                      type="button"
                      onClick={function () {
                        handleRemoveSlide(slide.id);
                      }}
                      className="flex rounded-lg border border-red-500/20 p-1.5 text-red-500 transition hover:bg-red-500/10"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AdminStickyFooter
        onReload={loadData}
        onSave={handleSave}
        saving={saving}
        busy={saving || uploading || replacingId !== null}
      />
    </div>
  );
}
