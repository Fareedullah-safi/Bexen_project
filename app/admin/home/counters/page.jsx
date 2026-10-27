"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  LoaderCircle,
  MessageSquareQuote,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  highlightWord: translation("Stories"),
  headingLineOne: translation("Success Stories Fuel"),
  headingLineTwo: translation("our Innovation."),
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

// Create a new review before it has a MongoDB ID.
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

// Make sure every translated field has en, ps, and fa properties.
function getTranslation(value) {
  if (value && typeof value === "object") {
    return {
      en: value.en || "",
      ps: value.ps || "",
      fa: value.fa || "",
    };
  }

  // Support older records where a field was stored as a string.
  return {
    en: typeof value === "string" ? value : "",
    ps: "",
    fa: "",
  };
}

// Prepare a review returned by MongoDB for the frontend.
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

  const cloudinaryWidget = useRef(null);
  const uploadTarget = useRef("draft");

  // RTL for Pashto/Dari; LTR for English.
  const inputDirection = language === "en" ? "ltr" : "rtl";

  // Bexon styling.
  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0C1E21] outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-gray-500";

  const card =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#111B27]";

  const label =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#16212C] dark:text-gray-200";

  const primaryButton =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1E8A8A] to-[#176F6F] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50";

  // --------------------------------------------------
  // 1. GET: Load section, statistics, and reviews.
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);

      try {
        const response = await axios.get("/api/homepage/reviews-section");

        if (!response.data.success || !response.data.data) {
          throw new Error(response.data.message || "Failed to load reviews.");
        }

        if (cancelled) return;

        const data = response.data.data;

        setSection((previous) => ({
          ...previous,
          ...Object.fromEntries(
            Object.entries(data.section || {}).map(([key, value]) => [
              key,
              getTranslation(value),
            ]),
          ),
        }));

        // An empty array is valid when there are no statistics.
        if (Array.isArray(data.stats)) {
          setStats(
            data.stats.map((stat) => ({
              value: getTranslation(stat.value),
              label: getTranslation(stat.label),
            })),
          );
        }

        if (Array.isArray(data.reviews)) {
          setReviews(data.reviews.map(normalizeReview));
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Failed to load reviews.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // --------------------------------------------------
  // 2. Cloudinary image upload setup.
  // --------------------------------------------------

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
        cloudName,
        uploadPreset,
        folder: "bexon/images",
        sources: ["local", "camera", "url"],
        multiple: false,
        maxFileSize: 5 * 1024 * 1024,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        resourceType: "image",
        cropping: false,
        showSkipCropButton: true,
        theme: "minimal",
      },
      (error, result) => {
        if (error) {
          toast.error("Image upload failed.");
          return;
        }

        if (result?.event !== "success") return;

        const image = result.info.secure_url;
        const publicId = result.info.public_id;
        const target = uploadTarget.current;

        if (target === "draft") {
          setDraft((previous) => ({
            ...previous,
            image,
            publicId,
          }));
        } else {
          setReviews((previous) =>
            previous.map((review) =>
              review._id === target
                ? {
                    ...review,
                    image,
                    publicId,
                  }
                : review,
            ),
          );
        }

        toast.success("Image uploaded successfully.");
      },
    );

    setCloudinaryReady(true);
  }

  function openCloudinary(target) {
    if (!cloudinaryWidget.current) {
      toast.error("Image uploader is not ready.");
      return;
    }

    uploadTarget.current = target;
    cloudinaryWidget.current.open();
  }

  // --------------------------------------------------
  // 3. Update section content for the selected language.
  // --------------------------------------------------

  function updateSection(field, value) {
    setSection((previous) => ({
      ...previous,
      [field]: {
        ...getTranslation(previous[field]),
        [language]: value,
      },
    }));
  }

  // --------------------------------------------------
  // 4. Update a statistic.
  // --------------------------------------------------

  function updateStat(index, field, value) {
    setStats((previous) =>
      previous.map((stat, currentIndex) =>
        currentIndex === index
          ? {
              ...stat,
              [field]: {
                ...getTranslation(stat[field]),
                [language]: value,
              },
            }
          : stat,
      ),
    );
  }

  // --------------------------------------------------
  // 5. Update the new review form.
  // --------------------------------------------------

  function updateDraft(field, value) {
    setDraft((previous) => ({
      ...previous,
      [field]: {
        ...getTranslation(previous[field]),
        [language]: value,
      },
    }));
  }

  // --------------------------------------------------
  // 6. Update an existing review.
  // --------------------------------------------------

  function updateReview(reviewId, field, value) {
    setReviews((previous) =>
      previous.map((review) =>
        review._id === reviewId
          ? {
              ...review,
              [field]: {
                ...getTranslation(review[field]),
                [language]: value,
              },
            }
          : review,
      ),
    );
  }

  // --------------------------------------------------
  // 7. Add a review to the local list.
  // It is saved to MongoDB when Save Changes is clicked.
  // --------------------------------------------------

  function handleAddReview() {
    for (const lang of languages) {
      if (
        !draft.name[lang.code].trim() ||
        !draft.role[lang.code].trim() ||
        !draft.text[lang.code].trim()
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

    setReviews((previous) => [draft, ...previous]);
    setOpenReviewId(draft._id);
    setDraft(emptyReview());

    toast.success("Review added. Save changes to store it in Backend Storage.");
  }

  // --------------------------------------------------
  // 8. Validate all translations before saving.
  // --------------------------------------------------

  function validateTranslations() {
    for (const [field, value] of Object.entries(section)) {
      const translated = getTranslation(value);

      for (const lang of languages) {
        if (!translated[lang.code].trim()) {
          setLanguage(lang.code);
          toast.error(`Complete "${field}" in ${lang.label}.`);
          return false;
        }
      }
    }

    for (let index = 0; index < stats.length; index++) {
      for (const field of ["value", "label"]) {
        const translated = getTranslation(stats[index][field]);

        for (const lang of languages) {
          if (!translated[lang.code].trim()) {
            setLanguage(lang.code);

            toast.error(
              `Complete Statistic ${index + 1} ${field} in ${lang.label}.`,
            );

            return false;
          }
        }
      }
    }

    for (let index = 0; index < reviews.length; index++) {
      const review = reviews[index];

      if (!review.image) {
        setOpenReviewId(review._id);
        toast.error(`Review ${index + 1} needs an image.`);
        return false;
      }

      for (const field of ["name", "role", "text"]) {
        const translated = getTranslation(review[field]);

        for (const lang of languages) {
          if (!translated[lang.code].trim()) {
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

  // --------------------------------------------------
  // 9. Prepare data to send to the API.
  // Do not send temporary frontend IDs to MongoDB.
  // --------------------------------------------------

  function buildPayload() {
    return {
      section,

      stats: stats.map(({ value, label }) => ({
        value,
        label,
      })),

      reviews: reviews.map((review) => ({
        ...(review._id && !String(review._id).startsWith("new-")
          ? { _id: review._id }
          : {}),

        name: review.name,
        role: review.role,
        text: review.text,
        image: review.image,
        publicId: review.publicId || "",
      })),
    };
  }

  // --------------------------------------------------
  // 10. GET again after saving.
  // This retrieves the real MongoDB IDs.
  // --------------------------------------------------

  async function refreshData() {
    const response = await axios.get("/api/homepage/reviews-section");

    if (!response.data.success || !response.data.data) {
      throw new Error(
        response.data.message || "Failed to refresh saved reviews.",
      );
    }

    const data = response.data.data;

    setSection((previous) => ({
      ...previous,
      ...Object.fromEntries(
        Object.entries(data.section || {}).map(([key, value]) => [
          key,
          getTranslation(value),
        ]),
      ),
    }));

    setStats(
      (data.stats || []).map((stat) => ({
        value: getTranslation(stat.value),
        label: getTranslation(stat.label),
      })),
    );

    setReviews((data.reviews || []).map(normalizeReview));
    setOpenReviewId(null);
  }

  // --------------------------------------------------
  // 11. POST: Save all section data to MongoDB.
  // --------------------------------------------------

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

  // --------------------------------------------------
  // 12. DELETE: Remove an existing review.
  // Unsaved reviews are removed locally.
  // --------------------------------------------------

  async function handleDeleteReview(review) {
    if (saving) {
      toast.error("Please wait until saving is complete.");
      return;
    }

    if (String(review._id).startsWith("new-")) {
      setReviews((previous) =>
        previous.filter((item) => item._id !== review._id),
      );

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

      setReviews((previous) =>
        previous.filter((item) => item._id !== review._id),
      );

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

  // --------------------------------------------------
  // 13. Loading screen.
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  // --------------------------------------------------
  // 14. Frontend UI.
  // --------------------------------------------------

  return (
    <div className="min-h-screen space-y-6 bg-[var(--background)] text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={setupCloudinary}
        onError={() => toast.error("Could not load Cloudinary uploader.")}
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

          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  language === lang.code
                    ? "bg-[#1E8A8A] text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:border-[#1E8A8A] dark:border-white/10 dark:bg-[#16212C] dark:text-gray-300"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section content */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Section Content</h2>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["badgeText", "Badge Text"],
            ["highlightWord", "Highlighted Word"],
            ["headingLineOne", "Heading Line One"],
            ["headingLineTwo", "Heading Line Two"],
          ].map(([field, title]) => (
            <div key={field}>
              <label className={label}>{title}</label>

              <input
                dir={inputDirection}
                className={input}
                value={getTranslation(section[field])[language]}
                onChange={(event) => updateSection(field, event.target.value)}
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className={label}>Description</label>

            <textarea
              dir={inputDirection}
              className={input}
              rows={4}
              value={getTranslation(section.description)[language]}
              onChange={(event) =>
                updateSection("description", event.target.value)
              }
            />
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Statistics</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 p-4 dark:border-white/10"
            >
              <h3 className="mb-4 text-sm font-semibold">
                Statistic {index + 1}
              </h3>

              <label className={label}>Value</label>

              <input
                dir={inputDirection}
                className={input}
                value={getTranslation(stat.value)[language]}
                onChange={(event) =>
                  updateStat(index, "value", event.target.value)
                }
              />

              <label className={`${label} mt-4`}>Label</label>

              <input
                dir={inputDirection}
                className={input}
                value={getTranslation(stat.label)[language]}
                onChange={(event) =>
                  updateStat(index, "label", event.target.value)
                }
              />
            </div>
          ))}
        </div>
      </section>

      {/* Add review */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">Add Review</h2>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={label}>Client Name *</label>

            <input
              dir={inputDirection}
              className={input}
              value={draft.name[language]}
              onChange={(event) => updateDraft("name", event.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div>
            <label className={label}>Client Role *</label>

            <input
              dir={inputDirection}
              className={input}
              value={draft.role[language]}
              onChange={(event) => updateDraft("role", event.target.value)}
              placeholder="CEO, Founder, Manager..."
            />
          </div>

          <div className="md:col-span-2">
            <label className={label}>Review Text *</label>

            <textarea
              dir={inputDirection}
              className={input}
              rows={4}
              value={draft.text[language]}
              onChange={(event) => updateDraft("text", event.target.value)}
              placeholder="Enter client feedback"
            />
          </div>

          <div className="md:col-span-2">
            <label className={label}>Client Image *</label>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => openCloudinary("draft")}
                disabled={!cloudinaryReady}
                className={primaryButton}
              >
                <Upload size={18} />
                {cloudinaryReady
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
            disabled={saving}
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
            {reviews.map((review) => {
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
                            alt={review.name?.[language] || "Client"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImagePlus size={22} className="text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {review.name?.[language] || "Unnamed Client"}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                          {review.role?.[language] || "No role entered"}
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
                        onClick={() =>
                          setOpenReviewId(isOpen ? null : review._id)
                        }
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
                        onClick={() => handleDeleteReview(review)}
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

                          <input
                            dir={inputDirection}
                            className={input}
                            value={review.name?.[language] || ""}
                            onChange={(event) =>
                              updateReview(
                                review._id,
                                "name",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <label className={label}>Client Role *</label>

                          <input
                            dir={inputDirection}
                            className={input}
                            value={review.role?.[language] || ""}
                            onChange={(event) =>
                              updateReview(
                                review._id,
                                "role",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={label}>Review Text *</label>

                          <textarea
                            dir={inputDirection}
                            className={input}
                            rows={4}
                            value={review.text?.[language] || ""}
                            onChange={(event) =>
                              updateReview(
                                review._id,
                                "text",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={label}>Client Image</label>

                          <div className="flex flex-wrap items-center gap-4">
                            <button
                              type="button"
                              onClick={() => openCloudinary(review._id)}
                              disabled={!cloudinaryReady || saving}
                              className={secondaryButton}
                            >
                              <Upload size={17} />
                              Change Image
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

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className={primaryButton}
                        >
                          {saving ? (
                            <LoaderCircle size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}

                          {saving ? "Saving..." : "Save Changes"}
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

      {/* Save all changes */}
      <footer className="sticky bottom-4 z-10 flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center dark:border-white/10 dark:bg-[#111B27]/95">
        <div>
          <p className="text-sm font-semibold">Ready to save your changes?</p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Save section content, statistics, and all review translations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className={primaryButton}
        >
          {saving ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <Save size={18} />
          )}

          {saving ? "Saving..." : "Save Changes"}
        </button>
      </footer>

      {/* Reusable language selector */}
      <AdminLanguageBall language={language} onLanguageChange={setLanguage} />
    </div>
  );
}
