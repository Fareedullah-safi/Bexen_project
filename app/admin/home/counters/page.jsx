"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  LoaderCircle,
  MessageSquareQuote,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────
   Strip HTML for validation
   ────────────────────────────────────────────── */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* ──────────────────────────────────────────────
   Cloudinary permission check
   ────────────────────────────────────────────── */
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

/* ──────────────────────────────────────────────
   Unified Cloudinary widget theme
   ────────────────────────────────────────────── */
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

/* ────────────────────────────────────────────── */

const languages = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyTranslation = () => ({
  en: "",
  ps: "",
  fa: "",
});

const translation = (englishText = "") => ({
  en: englishText,
  ps: "",
  fa: "",
});

const initialSection = {
  badgeText: translation("CLIENTS FEEDBACK"),
  title: translation("Success Stories Fuel our Innovation."),
  description: translation(
    "Manage the stats and review cards for your testimonial section.",
  ),
};

const initialStats = [
  { value: translation("93%"), label: translation("Projects Completed") },
  { value: translation("20M"), label: translation("Reach Worldwide") },
  { value: translation("8.5X"), label: translation("Faster Growth") },
  { value: translation("100+"), label: translation("Awards Archived") },
];

function emptyReview() {
  return {
    _id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: emptyTranslation(),
    role: emptyTranslation(),
    text: emptyTranslation(),
    image: "",
    publicId: "",
  };
}

function getTranslation(value) {
  if (value && typeof value === "object") {
    return {
      en: value.en || "",
      ps: value.ps || "",
      fa: value.fa || "",
    };
  }

  return {
    en: typeof value === "string" ? value : "",
    ps: "",
    fa: "",
  };
}

function normalizeReview(review) {
  return {
    ...review,
    name: getTranslation(review.name),
    role: getTranslation(review.role),
    text: getTranslation(review.text),
    image: review.image || "",
    publicId: review.publicId || "",
  };
}

export default function ReviewsAdminPanel() {
  const [language, setLanguage] = useState("en");

  const [section, setSection] = useState(initialSection);
  const [stats, setStats] = useState(initialStats);
  const [reviews, setReviews] = useState([]);
  const [draft, setDraft] = useState(emptyReview());
  const [openReviewId, setOpenReviewId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [theme, setTheme] = useState("light");

  const cloudinaryWidget = useRef(null);
  const uploadTarget = useRef("draft");

  const busy = saving || checking;
  const inputDirection = language === "en" ? "ltr" : "rtl";

  const card =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#111B27]";

  const label =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#16212C] dark:text-gray-200";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1E8A8A] to-[#176F6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50";

  useEffect(() => {
    function update() {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light",
      );
    }

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      const response = await axios.get("/api/homepage/reviews-section");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Failed to load reviews.");
      }

      const data = response.data.data;

      setSection(function (previous) {
        return {
          ...previous,
          ...Object.fromEntries(
            Object.entries(data.section || {}).map(function ([key, value]) {
              return [key, getTranslation(value)];
            }),
          ),
        };
      });

      if (Array.isArray(data.stats)) {
        setStats(
          data.stats.map(function (stat) {
            return {
              value: getTranslation(stat.value),
              label: getTranslation(stat.label),
            };
          }),
        );
      }

      if (Array.isArray(data.reviews)) {
        setReviews(data.reviews.map(normalizeReview));
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load reviews.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function setupCloudinary() {
    if (!window.cloudinary || cloudinaryWidget.current) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary environment variables are missing.");
      return;
    }

    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: "bexon/images",
        multiple: false,
        maxFileSize: 5 * 1024 * 1024,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        resourceType: "image",
        cropping: false,
        showSkipCropButton: true,
        styles: cloudinaryStyles(theme),
      },
      function (error, result) {
        if (error) {
          toast.error("Image upload failed.");
          return;
        }

        if (!result || result.event !== "success") return;

        const image = result.info.secure_url;
        const publicId = result.info.public_id;
        const target = uploadTarget.current;

        if (target === "draft") {
          setDraft(function (previous) {
            return {
              ...previous,
              image: image,
              publicId: publicId,
            };
          });
        } else {
          setReviews(function (previous) {
            return previous.map(function (review) {
              if (review._id === target) {
                return {
                  ...review,
                  image: image,
                  publicId: publicId,
                };
              }
              return review;
            });
          });
        }

        toast.success("Image uploaded successfully.");
      },
    );

    setCloudinaryReady(true);
  }

  useEffect(() => {
    if (typeof window === "undefined" || !window.cloudinary) return;

    cloudinaryWidget.current = null;
    setupCloudinary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  async function openCloudinary(target) {
    if (!cloudinaryWidget.current) {
      toast.error("Image uploader is not ready.");
      return;
    }

    if (checking) return;

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    uploadTarget.current = target;
    cloudinaryWidget.current.open();
  }

  function updateSection(field, value) {
    setSection(function (previous) {
      return {
        ...previous,
        [field]: {
          ...getTranslation(previous[field]),
          [language]: value,
        },
      };
    });
  }

  function updateStat(index, field, value) {
    setStats(function (previous) {
      return previous.map(function (stat, currentIndex) {
        if (currentIndex === index) {
          return {
            ...stat,
            [field]: {
              ...getTranslation(stat[field]),
              [language]: value,
            },
          };
        }
        return stat;
      });
    });
  }

  function updateDraft(field, value) {
    setDraft(function (previous) {
      return {
        ...previous,
        [field]: {
          ...getTranslation(previous[field]),
          [language]: value,
        },
      };
    });
  }

  function updateReview(reviewId, field, value) {
    setReviews(function (previous) {
      return previous.map(function (review) {
        if (review._id === reviewId) {
          return {
            ...review,
            [field]: {
              ...getTranslation(review[field]),
              [language]: value,
            },
          };
        }
        return review;
      });
    });
  }

  function handleAddReview() {
    for (let i = 0; i < languages.length; i += 1) {
      const lang = languages[i];

      if (
        !stripHtml(draft.name[lang.code]) ||
        !stripHtml(draft.role[lang.code]) ||
        !stripHtml(draft.text[lang.code])
      ) {
        setLanguage(lang.code);
        toast.error(
          `Complete the name, role, and review text in ${lang.label}.`,
        );
        return;
      }
    }

    if (!draft.image) {
      toast.error("Please upload a client image.");
      return;
    }

    setReviews(function (previous) {
      return [draft, ...previous];
    });
    setOpenReviewId(draft._id);
    setDraft(emptyReview());

    toast.success("Review added. Save changes to store it in Backend Storage.");
  }

  function validateTranslations() {
    const sectionEntries = Object.entries(section);

    for (let i = 0; i < sectionEntries.length; i += 1) {
      const field = sectionEntries[i][0];
      const value = sectionEntries[i][1];
      const translated = getTranslation(value);

      for (let j = 0; j < languages.length; j += 1) {
        const lang = languages[j];

        if (!stripHtml(translated[lang.code])) {
          setLanguage(lang.code);
          toast.error(`Complete "${field}" in ${lang.label}.`);
          return false;
        }
      }
    }

    for (let index = 0; index < stats.length; index += 1) {
      const fields = ["value", "label"];

      for (let f = 0; f < fields.length; f += 1) {
        const field = fields[f];
        const translated = getTranslation(stats[index][field]);

        for (let j = 0; j < languages.length; j += 1) {
          const lang = languages[j];

          if (!stripHtml(translated[lang.code])) {
            setLanguage(lang.code);
            toast.error(
              `Complete Statistic ${index + 1} ${field} in ${lang.label}.`,
            );
            return false;
          }
        }
      }
    }

    for (let index = 0; index < reviews.length; index += 1) {
      const review = reviews[index];

      if (!review.image) {
        setOpenReviewId(review._id);
        toast.error(`Review ${index + 1} needs an image.`);
        return false;
      }

      const fields = ["name", "role", "text"];

      for (let f = 0; f < fields.length; f += 1) {
        const field = fields[f];
        const translated = getTranslation(review[field]);

        for (let j = 0; j < languages.length; j += 1) {
          const lang = languages[j];

          if (!stripHtml(translated[lang.code])) {
            setLanguage(lang.code);
            setOpenReviewId(review._id);
            toast.error(
              `Complete Review ${index + 1} ${field} in ${lang.label}.`,
            );
            return false;
          }
        }
      }
    }

    return true;
  }

  function buildPayload() {
    return {
      section: section,
      stats: stats.map(function (item) {
        return {
          value: item.value,
          label: item.label,
        };
      }),
      reviews: reviews.map(function (review) {
        return {
          ...(review._id && !String(review._id).startsWith("new-")
            ? { _id: review._id }
            : {}),
          name: review.name,
          role: review.role,
          text: review.text,
          image: review.image,
          publicId: review.publicId || "",
        };
      }),
    };
  }

  async function refreshData() {
    const response = await axios.get("/api/homepage/reviews-section");

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to refresh saved reviews.",
      );
    }

    const data = response.data.data;

    setSection(function (previous) {
      return {
        ...previous,
        ...Object.fromEntries(
          Object.entries(data.section || {}).map(function ([key, value]) {
            return [key, getTranslation(value)];
          }),
        ),
      };
    });

    setStats(
      (data.stats || []).map(function (stat) {
        return {
          value: getTranslation(stat.value),
          label: getTranslation(stat.label),
        };
      }),
    );

    setReviews((data.reviews || []).map(normalizeReview));
    setOpenReviewId(null);
  }

  async function handleSave() {
    if (saving) return;
    if (!validateTranslations()) return;

    setSaving(true);

    try {
      const response = await axios.post(
        "/api/homepage/reviews-section",
        buildPayload(),
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to save reviews.");
      }

      await refreshData();
      toast.success("Reviews section saved successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save changes.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteReview(review) {
    if (saving) {
      toast.error("Please wait until saving is complete.");
      return;
    }

    if (String(review._id).startsWith("new-")) {
      setReviews(function (previous) {
        return previous.filter(function (item) {
          return item._id !== review._id;
        });
      });

      if (openReviewId === review._id) {
        setOpenReviewId(null);
      }

      toast.success("Unsaved review removed.");
      return;
    }

    try {
      const response = await axios.delete("/api/homepage/reviews-section", {
        data: {
          reviewId: review._id,
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to delete review.");
      }

      setReviews(function (previous) {
        return previous.filter(function (item) {
          return item._id !== review._id;
        });
      });

      if (openReviewId === review._id) {
        setOpenReviewId(null);
      }

      toast.success("Review deleted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete review.",
      );
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={setupCloudinary}
        onError={function () {
          toast.error("Could not load Cloudinary uploader.");
        }}
      />

      {/* Header */}
      <section className={card}>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
              <MessageSquareQuote size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Reviews Manager</h1>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage testimonials and translations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {languages.map(function (lang) {
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={function () {
                      setLanguage(lang.code);
                    }}
                    disabled={busy}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      language === lang.code
                        ? "bg-[#1E8A8A] text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-600 hover:border-[#1E8A8A] dark:border-white/10 dark:bg-[#16212C] dark:text-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>

            <AdminLanguageBall
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>
      </section>

      {/* Section content */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Section Content</h2>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["badgeText", "Badge Text"],
            ["title", "Section Title"],
          ].map(function ([field, fieldTitle]) {
            return (
              <div key={field}>
                <label className={label}>{fieldTitle}</label>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <RichTextEditor
                    key={field + "-" + language}
                    value={getTranslation(section[field])[language]}
                    onChange={function (val) {
                      updateSection(field, val);
                    }}
                    dir={inputDirection}
                    placeholder={fieldTitle}
                  />
                </div>
              </div>
            );
          })}

          <div className="md:col-span-2">
            <label className={label}>Description</label>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
              <RichTextEditor
                key={"description-" + language}
                value={getTranslation(section.description)[language]}
                onChange={function (val) {
                  updateSection("description", val);
                }}
                dir={inputDirection}
                placeholder="Section description"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Statistics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map(function (stat, index) {
            return (
              <div
                key={index}
                className="rounded-xl border border-gray-200 p-4 dark:border-white/10"
              >
                <h3 className="mb-4 text-sm font-semibold">
                  Statistic {index + 1}
                </h3>

                <label className={label}>Value</label>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <RichTextEditor
                    key={"stat-value-" + index + "-" + language}
                    value={getTranslation(stat.value)[language]}
                    onChange={function (val) {
                      updateStat(index, "value", val);
                    }}
                    dir={inputDirection}
                    placeholder="e.g. 93%"
                  />
                </div>

                <label className={`${label} mt-4`}>Label</label>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                  <RichTextEditor
                    key={"stat-label-" + index + "-" + language}
                    value={getTranslation(stat.label)[language]}
                    onChange={function (val) {
                      updateStat(index, "label", val);
                    }}
                    dir={inputDirection}
                    placeholder="e.g. Projects Completed"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add review */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Add Review</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>Client Name *</label>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
              <RichTextEditor
                key={"draft-name-" + language}
                value={draft.name[language]}
                onChange={function (val) {
                  updateDraft("name", val);
                }}
                dir={inputDirection}
                placeholder="Enter client name"
              />
            </div>
          </div>

          <div>
            <label className={label}>Client Role *</label>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
              <RichTextEditor
                key={"draft-role-" + language}
                value={draft.role[language]}
                onChange={function (val) {
                  updateDraft("role", val);
                }}
                dir={inputDirection}
                placeholder="CEO, Founder, Manager..."
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={label}>Review Text *</label>
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
              <RichTextEditor
                key={"draft-text-" + language}
                value={draft.text[language]}
                onChange={function (val) {
                  updateDraft("text", val);
                }}
                dir={inputDirection}
                placeholder="Enter client feedback"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className={label}>Client Image *</label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={function () {
                  openCloudinary("draft");
                }}
                disabled={!cloudinaryReady || checking || saving}
                className={primaryButton}
              >
                {checking ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {checking
                  ? "Checking..."
                  : cloudinaryReady
                    ? "Choose Client Image"
                    : "Loading Uploader..."}
              </button>

              {draft.image ? (
                <img
                  src={draft.image}
                  alt="Client preview"
                  className="h-20 w-20 rounded-xl border border-gray-200 object-cover dark:border-white/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400 dark:border-white/20">
                  <ImagePlus size={24} />
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG or WebP. Maximum 5MB.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAddReview}
            disabled={busy}
            className={primaryButton}
          >
            <Plus size={18} />
            Add Review
          </button>
        </div>
      </section>

      {/* Existing reviews */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Manage Reviews</h2>

        {reviews.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No reviews yet. Add your first review above.
          </p>
        ) : (
          <div className="space-y-4">
            {reviews.map(function (review) {
              const isOpen = openReviewId === review._id;

              return (
                <div
                  key={review._id}
                  className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#16212C]"
                >
                  <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#111B27]">
                        {review.image ? (
                          <img
                            src={review.image}
                            alt={stripHtml(review.name?.[language]) || "Client"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlus size={22} className="text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {stripHtml(review.name?.[language]) ||
                            "Unnamed Client"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                          {stripHtml(review.role?.[language]) ||
                            "No role entered"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {String(review._id).startsWith("new-")
                            ? "Unsaved review"
                            : "Saved in Backend Storage"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={function () {
                          setOpenReviewId(isOpen ? null : review._id);
                        }}
                        className={secondaryButton}
                      >
                        {isOpen ? "Close" : "View & Edit"}

                        {isOpen ? (
                          <ChevronUp size={17} />
                        ) : (
                          <ChevronDown size={17} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={function () {
                          handleDeleteReview(review);
                        }}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300"
                        aria-label="Delete review"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="space-y-5 border-t border-gray-200 p-4 dark:border-white/10">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label className={label}>Client Name *</label>
                          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                            <RichTextEditor
                              key={"review-name-" + review._id + "-" + language}
                              value={review.name?.[language] || ""}
                              onChange={function (val) {
                                updateReview(review._id, "name", val);
                              }}
                              dir={inputDirection}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={label}>Client Role *</label>
                          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                            <RichTextEditor
                              key={"review-role-" + review._id + "-" + language}
                              value={review.role?.[language] || ""}
                              onChange={function (val) {
                                updateReview(review._id, "role", val);
                              }}
                              dir={inputDirection}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className={label}>Review Text *</label>
                          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-white/10">
                            <RichTextEditor
                              key={"review-text-" + review._id + "-" + language}
                              value={review.text?.[language] || ""}
                              onChange={function (val) {
                                updateReview(review._id, "text", val);
                              }}
                              dir={inputDirection}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className={label}>Client Image</label>

                          <div className="flex flex-wrap items-center gap-4">
                            <button
                              type="button"
                              onClick={function () {
                                openCloudinary(review._id);
                              }}
                              disabled={!cloudinaryReady || saving || checking}
                              className={secondaryButton}
                            >
                              {checking ? (
                                <LoaderCircle
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Upload size={17} />
                              )}
                              {checking ? "Checking..." : "Change Image"}
                            </button>

                            {review.image && (
                              <img
                                src={review.image}
                                alt="Client preview"
                                className="h-20 w-20 rounded-xl border border-gray-200 object-cover dark:border-white/10"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky footer */}
      <AdminStickyFooter
        onReload={loadData}
        onSave={handleSave}
        saving={saving}
        busy={busy}
        saveLabel="Save All Changes"
        savingLabel="Saving All..."
      />
    </div>
  );
}
