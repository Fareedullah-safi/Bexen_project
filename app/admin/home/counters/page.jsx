"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  LoaderCircle,
  MessageSquareQuote,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ReviewsAdminPanel() {
  const input =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#0C1E21] outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-gray-500";

  // ─── PROFESSIONAL BUTTON STYLES ───

  // Primary action button (Save, Add)
  const button =
    "group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#1E8A8A] to-[#176F6F] px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-[#1E8A8A]/20 transition-all duration-200 hover:shadow-md hover:shadow-[#1E8A8A]/30 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm disabled:hover:brightness-100 disabled:active:scale-100";

  // Secondary button (Choose, Edit, Move, Add Statistic)
  const smallButton =
    "group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A] hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:shadow-sm disabled:active:scale-100 dark:border-white/10 dark:bg-[#16212C] dark:text-gray-300 dark:hover:border-[#1E8A8A]/60 dark:hover:bg-[#1E8A8A]/10 dark:hover:text-white";

  // Danger button (Delete)
  const dangerButton =
    "group inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-100 hover:shadow-md hover:shadow-red-100 active:scale-[0.97] dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-300 dark:hover:border-red-400/40 dark:hover:bg-red-500/20 dark:hover:shadow-red-900/30";

  const card =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7 dark:border-white/10 dark:bg-[#111B27]";

  const innerBox =
    "rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#16212C]";

  const label =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const muted = "text-gray-500 dark:text-gray-400";

  const [section, setSection] = useState({
    badgeText: "CLIENTS FEEDBACK",
    highlightWord: "Stories",
    headingLineOne: "Success Stories Fuel",
    headingLineTwo: "our Innovation.",
    description:
      "Manage the stats and review cards for your testimonial section.",
  });

  const [stats, setStats] = useState([
    { id: 1, publicId: "", value: "93%", label: "Projects Completed" },
    { id: 2, publicId: "", value: "20M", label: "Reach Worldwide" },
    { id: 3, publicId: "", value: "8.5X", label: "Faster Growth" },
    { id: 4, publicId: "", value: "100+", label: "Awards Archived" },
  ]);

  const [reviews, setReviews] = useState([]);

  const [draft, setDraft] = useState({
    id: Date.now(),
    name: "",
    role: "",
    text: "",
    image: "",
    imageFile: null,
    imagePreview: "",
    publicId: "",
  });

  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [visible, setVisible] = useState(20);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingDraft, setUploadingDraft] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/homepage/reviews-section");

      if (res.data.success && res.data.data) {
        const data = res.data.data;

        if (data.section) {
          setSection((previous) => ({ ...previous, ...data.section }));
        }

        if (Array.isArray(data.stats) && data.stats.length > 0) {
          setStats(
            data.stats.map((item, index) => ({
              ...item,
              id: item.id || item._id || index + 1,
              value: item.value || "",
              label: item.label || "",
              publicId: item.publicId || "",
            })),
          );
        }

        if (Array.isArray(data.reviews)) {
          setReviews(
            data.reviews.map((item, index) => ({
              ...item,
              id: item.id || item._id || Date.now() + index,
              name: item.name || "",
              role: item.role || "",
              text: item.text || "",
              image: item.image || "",
              publicId: item.publicId || "",
              imageFile: null,
              imagePreview: "",
            })),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadImage = async (fileOrUrl) => {
    try {
      const formData = new FormData();

      if (fileOrUrl instanceof File) {
        formData.append("file", fileOrUrl);
      } else {
        formData.append("imageUrl", fileOrUrl);
      }

      const res = await axios.post(
        "/api/homepage/reviews-section/upload",
        formData,
      );

      if (res.data.success && res.data.url) {
        return { image: res.data.url, publicId: res.data.publicId || "" };
      }

      throw new Error(res.data.message || "Image upload failed.");
    } catch (error) {
      console.error("Image upload failed:", error);
      throw error;
    }
  };

  const saveAll = async (reviewsToSave = reviews) => {
    try {
      setSaving(true);
      const finalReviews = [];

      for (const review of reviewsToSave) {
        let image = review.image || "";
        let publicId = review.publicId || "";

        if (review.imageFile) {
          const uploaded = await uploadImage(review.imageFile);
          image = uploaded.image;
          publicId = uploaded.publicId;
        } else if (image && !publicId && image.startsWith("http")) {
          const uploaded = await uploadImage(image);
          image = uploaded.image;
          publicId = uploaded.publicId;
        }

        finalReviews.push({
          id: review.id,
          name: review.name,
          role: review.role,
          text: review.text,
          image,
          publicId,
        });
      }

      const finalStats = stats.map((item) => ({
        value: item.value,
        label: item.label,
        publicId: item.publicId || "",
      }));

      const res = await axios.post("/api/homepage/reviews-section", {
        section,
        stats: finalStats,
        reviews: finalReviews,
      });

      if (res.data.success) {
        setReviews((previous) =>
          finalReviews.map((review, index) => ({
            ...review,
            id: previous[index]?.id || review.id || Date.now() + index,
            imageFile: null,
            imagePreview: "",
          })),
        );

        setDraft((previous) => ({
          ...previous,
          imageFile: null,
          imagePreview: "",
        }));

        toast.success("All changes saved successfully.");
      } else {
        toast.error(res.data.message || "Failed to save changes.");
      }
    } catch (error) {
      console.error("Failed to save reviews:", error);
      toast.error(error.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const addReview = async () => {
    if (!draft.name.trim() || !draft.role.trim() || !draft.text.trim()) {
      toast.error("Please enter the client's name, role, and review.");
      return;
    }

    const newReview = { ...draft, id: Date.now() };
    const updatedReviews = [newReview, ...reviews];

    setReviews(updatedReviews);
    setOpenId(newReview.id);

    setDraft({
      id: Date.now() + 1,
      name: "",
      role: "",
      text: "",
      image: "",
      imageFile: null,
      imagePreview: "",
      publicId: "",
    });

    toast.success("Review added. Saving changes...");
    await saveAll(updatedReviews);
  };

  const chooseDraftImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft((previous) => ({
        ...previous,
        imageFile: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const chooseReviewImage = (event, reviewId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setReviews((previous) =>
        previous.map((item) =>
          item.id === reviewId
            ? { ...item, imageFile: file, imagePreview: reader.result }
            : item,
        ),
      );
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const updateReview = (reviewId, field, value) => {
    setReviews((previous) =>
      previous.map((item) =>
        item.id === reviewId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const moveReview = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= reviews.length) return;

    const updatedReviews = [...reviews];
    const current = updatedReviews[index];
    updatedReviews[index] = updatedReviews[nextIndex];
    updatedReviews[nextIndex] = current;
    setReviews(updatedReviews);
  };

  const deleteReview = async (reviewId) => {
    try {
      const review = reviews.find(
        (item) => item._id === reviewId || item.id === reviewId,
      );

      if (!review) {
        toast.error("Review not found");
        return;
      }

      const response = await axios.delete("/api/homepage/reviews-section", {
        data: {
          reviewId: review._id || review.id,
          publicId: review.publicId,
        },
      });

      if (!response.data?.success) {
        toast.error(
          response.data?.message ||
            response.data?.error ||
            "Failed to delete review",
        );
        return;
      }

      const updatedReviews = reviews.filter(
        (item) => item._id !== reviewId && item.id !== reviewId,
      );

      setReviews(updatedReviews);

      if (openId === reviewId) {
        setOpenId(null);
      }

      toast.success(response.data.message || "Review deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "You do not have permission to delete this review",
      );
    }
  };

  const addStat = () => {
    setStats((previous) => [
      ...previous,
      { id: Date.now(), publicId: "", value: "", label: "" },
    ]);
  };

  const updateStat = (statId, field, value) => {
    setStats((previous) =>
      previous.map((item) =>
        item.id === statId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const moveStat = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= stats.length) return;

    const updatedStats = [...stats];
    const current = updatedStats[index];
    updatedStats[index] = updatedStats[nextIndex];
    updatedStats[nextIndex] = current;
    setStats(updatedStats);
  };

  const filteredReviews = reviews.filter((item) => {
    const searchText = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchText) ||
      item.role.toLowerCase().includes(searchText) ||
      item.text.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="sticky top-3 z-30 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg backdrop-blur-md sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
              <MessageSquareQuote size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">Reviews Manager</h1>
              <p className={`mt-1 text-sm ${muted}`}>
                Manage testimonials and client feedback.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => saveAll()}
            disabled={saving}
            className={button}
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save
                size={18}
                className="transition-transform group-hover:scale-110"
              />
            )}
            {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={card}>
            <p className={`text-sm ${muted}`}>Total Reviews</p>
            <h2 className="mt-2 text-3xl font-bold">{reviews.length}</h2>
            <p className={`mt-1 text-xs ${muted}`}>Client testimonials</p>
          </div>

          <div className={card}>
            <p className={`text-sm ${muted}`}>Statistics</p>
            <h2 className="mt-2 text-3xl font-bold">{stats.length}</h2>
            <p className={`mt-1 text-xs ${muted}`}>Testimonial section stats</p>
          </div>

          <div className={card}>
            <p className={`text-sm ${muted}`}>Filtered Reviews</p>
            <h2 className="mt-2 text-3xl font-bold">
              {filteredReviews.length}
            </h2>
            <p className={`mt-1 text-xs ${muted}`}>
              Results matching your search
            </p>
          </div>
        </div>

        {/* Section Content */}
        <section className={card}>
          <div className="mb-6">
            <h2 className="text-lg font-bold">Section Content</h2>
            <p className={`mt-1 text-sm ${muted}`}>
              Edit the heading and description displayed on your website.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={label}>Badge Text</label>
              <input
                className={input}
                value={section.badgeText}
                onChange={(event) =>
                  setSection({ ...section, badgeText: event.target.value })
                }
                placeholder="CLIENTS FEEDBACK"
              />
            </div>

            <div>
              <label className={label}>Highlighted Word</label>
              <input
                className={input}
                value={section.highlightWord}
                onChange={(event) =>
                  setSection({ ...section, highlightWord: event.target.value })
                }
                placeholder="Stories"
              />
            </div>

            <div>
              <label className={label}>Heading Line One</label>
              <input
                className={input}
                value={section.headingLineOne}
                onChange={(event) =>
                  setSection({ ...section, headingLineOne: event.target.value })
                }
                placeholder="Success Stories Fuel"
              />
            </div>

            <div>
              <label className={label}>Heading Line Two</label>
              <input
                className={input}
                value={section.headingLineTwo}
                onChange={(event) =>
                  setSection({ ...section, headingLineTwo: event.target.value })
                }
                placeholder="our Innovation."
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Description</label>
              <textarea
                className={`${input} min-h-28 resize-y`}
                value={section.description}
                onChange={(event) =>
                  setSection({ ...section, description: event.target.value })
                }
                placeholder="Enter section description..."
                rows={4}
              />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className={card}>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Statistics</h2>
              <p className={`mt-1 text-sm ${muted}`}>
                Manage the statistics shown in your testimonial section.
              </p>
            </div>

            <button type="button" onClick={addStat} className={smallButton}>
              <Plus
                size={17}
                className="transition-transform group-hover:rotate-90"
              />
              Add Statistic
            </button>
          </div>

          <div className="space-y-4">
            {stats.map((item, index) => (
              <div key={item.id} className={innerBox}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">
                    Statistic {index + 1}
                  </span>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className={smallButton}
                      onClick={() => moveStat(index, -1)}
                      disabled={index === 0}
                      aria-label="Move statistic up"
                    >
                      <ArrowUp
                        size={16}
                        className="transition-transform group-hover:-translate-y-0.5"
                      />
                    </button>

                    <button
                      type="button"
                      className={smallButton}
                      onClick={() => moveStat(index, 1)}
                      disabled={index === stats.length - 1}
                      aria-label="Move statistic down"
                    >
                      <ArrowDown
                        size={16}
                        className="transition-transform group-hover:translate-y-0.5"
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={label}>Value</label>
                    <input
                      className={input}
                      value={item.value}
                      onChange={(event) =>
                        updateStat(item.id, "value", event.target.value)
                      }
                      placeholder="93%"
                    />
                  </div>

                  <div>
                    <label className={label}>Label</label>
                    <input
                      className={input}
                      value={item.label}
                      onChange={(event) =>
                        updateStat(item.id, "label", event.target.value)
                      }
                      placeholder="Projects Completed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Add Review */}
        <section className={card}>
          <div className="mb-6">
            <h2 className="text-lg font-bold">Add New Review</h2>
            <p className={`mt-1 text-sm ${muted}`}>
              Add a client testimonial and optionally upload a client image.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className={label}>Client Name *</label>
              <input
                className={input}
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className={label}>Client Role *</label>
              <input
                className={input}
                value={draft.role}
                onChange={(event) =>
                  setDraft({ ...draft, role: event.target.value })
                }
                placeholder="CEO, Founder, Manager..."
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Review Text *</label>
              <textarea
                className={`${input} min-h-32 resize-y`}
                value={draft.text}
                onChange={(event) =>
                  setDraft({ ...draft, text: event.target.value })
                }
                placeholder="Enter the client's feedback..."
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Client Image URL</label>
              <input
                className={input}
                value={draft.image}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    image: event.target.value,
                    imageFile: null,
                    imagePreview: "",
                  })
                }
                placeholder="https://example.com/client.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className={label}>Upload Image From Your Computer</label>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#16212C]">
                  {draft.imagePreview || draft.image ? (
                    <img
                      src={draft.imagePreview || draft.image}
                      alt="Review preview"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      onLoad={(event) => {
                        event.currentTarget.style.display = "block";
                      }}
                    />
                  ) : (
                    <ImagePlus size={25} className={muted} />
                  )}
                </div>

                <div>
                  <label className={`${smallButton} cursor-pointer`}>
                    <Upload
                      size={17}
                      className="transition-transform group-hover:-translate-y-0.5"
                    />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={chooseDraftImage}
                    />
                  </label>

                  <p className={`mt-2 text-xs ${muted}`}>
                    Images only. Maximum file size: 5MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={addReview}
              disabled={saving || uploadingDraft}
              className={button}
            >
              {saving ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Plus
                  size={18}
                  className="transition-transform group-hover:rotate-90"
                />
              )}
              {saving ? "Saving..." : "Add Review & Save"}
            </button>
          </div>
        </section>

        {/* Existing Reviews */}
        <section className={card}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Manage Reviews</h2>
              <p className={`mt-1 text-sm ${muted}`}>
                Edit, reorder, or remove existing client reviews.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className={`absolute top-1/2 left-3 -translate-y-1/2 ${muted}`}
              />

              <input
                className={`${input} pl-10`}
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setVisible(20);
                }}
                placeholder="Search reviews..."
              />
            </div>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 px-5 py-12 text-center dark:border-white/10">
              <MessageSquareQuote
                size={32}
                className={`mx-auto mb-3 ${muted}`}
              />
              <p className="font-medium">No reviews found</p>
              <p className={`mt-1 text-sm ${muted}`}>
                Add a review or try a different search.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.slice(0, visible).map((item, index) => {
                const isOpen = openId === item.id;
                const imageSource = item.imagePreview || item.image;

                return (
                  <div
                    key={item.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-white/10 dark:bg-[#16212C]"
                  >
                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#111B27]">
                          {imageSource ? (
                            <img
                              src={imageSource}
                              alt={item.name || "Client"}
                              className="h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                              onLoad={(event) => {
                                event.currentTarget.style.display = "block";
                              }}
                            />
                          ) : (
                            <ImagePlus size={19} className={muted} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate font-semibold">
                            {item.name || "Unnamed Client"}
                          </h3>
                          <p className={`mt-1 truncate text-sm ${muted}`}>
                            {item.role || "No role provided"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className={smallButton}
                          onClick={() => moveReview(index, -1)}
                          disabled={index === 0}
                          aria-label="Move review up"
                        >
                          <ArrowUp
                            size={16}
                            className="transition-transform group-hover:-translate-y-0.5"
                          />
                        </button>

                        <button
                          type="button"
                          className={smallButton}
                          onClick={() => moveReview(index, 1)}
                          disabled={index === filteredReviews.length - 1}
                          aria-label="Move review down"
                        >
                          <ArrowDown
                            size={16}
                            className="transition-transform group-hover:translate-y-0.5"
                          />
                        </button>

                        <button
                          type="button"
                          className={smallButton}
                          onClick={() => setOpenId(isOpen ? null : item.id)}
                          aria-label={
                            isOpen ? "Collapse review" : "Edit review"
                          }
                        >
                          {isOpen ? (
                            <ChevronUp size={17} />
                          ) : (
                            <ChevronDown size={17} />
                          )}
                          {isOpen ? "Close" : "Edit"}
                        </button>

                        <button
                          type="button"
                          className={dangerButton}
                          onClick={() => deleteReview(item.id)}
                        >
                          <Trash2
                            size={16}
                            className="transition-transform group-hover:scale-110"
                          />
                          Delete
                        </button>
                      </div>
                    </div>

                    {!isOpen && (
                      <div className="border-t border-gray-200 px-4 py-3 dark:border-white/10">
                        <p className={`line-clamp-2 text-sm ${muted}`}>
                          {item.text || "No review text provided."}
                        </p>
                      </div>
                    )}

                    {isOpen && (
                      <div className="space-y-5 border-t border-gray-200 p-4 dark:border-white/10">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div>
                            <label className={label}>Client Name</label>
                            <input
                              className={input}
                              value={item.name}
                              onChange={(event) =>
                                updateReview(
                                  item.id,
                                  "name",
                                  event.target.value,
                                )
                              }
                              placeholder="Client name"
                            />
                          </div>

                          <div>
                            <label className={label}>Client Role</label>
                            <input
                              className={input}
                              value={item.role}
                              onChange={(event) =>
                                updateReview(
                                  item.id,
                                  "role",
                                  event.target.value,
                                )
                              }
                              placeholder="Client role"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={label}>Review Text</label>
                            <textarea
                              className={`${input} min-h-32 resize-y`}
                              value={item.text}
                              onChange={(event) =>
                                updateReview(
                                  item.id,
                                  "text",
                                  event.target.value,
                                )
                              }
                              placeholder="Client feedback..."
                              rows={4}
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={label}>Image URL</label>
                            <input
                              className={input}
                              value={item.image}
                              onChange={(event) =>
                                setReviews((previous) =>
                                  previous.map((review) =>
                                    review.id === item.id
                                      ? {
                                          ...review,
                                          image: event.target.value,
                                          imageFile: null,
                                          imagePreview: "",
                                        }
                                      : review,
                                  ),
                                )
                              }
                              placeholder="https://example.com/client.jpg"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className={label}>Change Client Image</label>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                              <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-[#111B27]">
                                {item.imagePreview || item.image ? (
                                  <img
                                    src={item.imagePreview || item.image}
                                    alt={item.name || "Client"}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                      event.currentTarget.style.display =
                                        "none";
                                    }}
                                    onLoad={(event) => {
                                      event.currentTarget.style.display =
                                        "block";
                                    }}
                                  />
                                ) : (
                                  <ImagePlus size={25} className={muted} />
                                )}
                              </div>

                              <div>
                                <label
                                  className={`${smallButton} cursor-pointer`}
                                >
                                  <Upload
                                    size={17}
                                    className="transition-transform group-hover:-translate-y-0.5"
                                  />
                                  Choose Image
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(event) =>
                                      chooseReviewImage(event, item.id)
                                    }
                                  />
                                </label>

                                <p className={`mt-2 text-xs ${muted}`}>
                                  Images only. Maximum file size: 5MB.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            className={button}
                            onClick={() => saveAll()}
                            disabled={saving}
                          >
                            {saving ? (
                              <LoaderCircle
                                size={17}
                                className="animate-spin"
                              />
                            ) : (
                              <Save
                                size={17}
                                className="transition-transform group-hover:scale-110"
                              />
                            )}
                            {saving ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {visible < filteredReviews.length && (
                <div className="flex justify-center pt-3">
                  <button
                    type="button"
                    className={smallButton}
                    onClick={() => setVisible((previous) => previous + 20)}
                  >
                    <ChevronDown
                      size={16}
                      className="transition-transform group-hover:translate-y-0.5"
                    />
                    Load More Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom Save */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]">
          <div>
            <h3 className="font-semibold">Ready to save your changes?</h3>
            <p className={`mt-1 text-sm ${muted}`}>
              Save the section content, statistics, and reviews together.
            </p>
          </div>

          <button
            type="button"
            className={button}
            onClick={() => saveAll()}
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Save
                size={18}
                className="transition-transform group-hover:scale-110"
              />
            )}
            {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
