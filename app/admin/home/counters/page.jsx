"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  MessageSquareQuote,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

export default function ReviewsAdminPanel() {
  const input =
    "w-full rounded-xl border border-white/10 bg-[#16212C] px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10";

  const button =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#167575] disabled:cursor-not-allowed disabled:opacity-50";

  const smallButton =
    "inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#16212C] px-4 py-2.5 text-sm text-gray-300 transition hover:border-[#1E8A8A] hover:text-white disabled:opacity-30";

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
  });

  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [visible, setVisible] = useState(20);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* Load Data */

  const loadData = async () => {
    try {
      setLoading(true);

      const { data } = await axios.get("/api/homepage/reviews-section");

      if (!data.success) {
        throw new Error(data.message || "Failed to load data");
      }

      if (data.data.section) {
        setSection((prev) => ({ ...prev, ...data.data.section }));
      }

      if (Array.isArray(data.data.stats)) {
        setStats(
          data.data.stats.map((item, index) => ({
            ...item,
            id: item.id || index + 1,
            publicId: item.publicId || "",
            value: item.value || "",
            label: item.label || "",
          })),
        );
      }

      if (Array.isArray(data.data.reviews)) {
        setReviews(
          data.data.reviews.map((item) => ({
            ...item,
            id: item.id || Date.now() + Math.random(),
            name: item.name || "",
            role: item.role || "",
            text: item.text || "",
            image: item.image || "",
            imageFile: null,
            imagePreview: "",
          })),
        );
      }
    } catch (error) {
      console.error("Load data error:", error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* Upload Image */

  const uploadImage = async (fileOrUrl) => {
    const formData = new FormData();

    if (fileOrUrl instanceof File) {
      formData.append("file", fileOrUrl);
    } else {
      formData.append("imageUrl", fileOrUrl);
    }

    const { data } = await axios.post(
      "/api/homepage/reviews-section/upload",
      formData,
    );

    if (!data.success || !data.url) {
      throw new Error(data.message || "Image upload failed");
    }

    return data.url;
  };

  /* Add Review */

  const addReview = () => {
    if (!draft.name.trim() || !draft.role.trim() || !draft.text.trim()) {
      toast.error("Please fill Name, Role and Review Text");
      return;
    }

    const review = { ...draft, id: Date.now() + Math.random() };

    setReviews((prev) => [review, ...prev]);

    setDraft({
      id: Date.now() + Math.random(),
      name: "",
      role: "",
      text: "",
      image: "",
      imageFile: null,
      imagePreview: "",
    });

    setOpenId(review.id);
    toast.success("Review added. Click Save All Changes to save it.");
  };

  /* Save All */

  const saveAll = async () => {
    try {
      setSaving(true);

      const finalReviews = await Promise.all(
        reviews.map(async (review) => ({
          id: review.id,
          name: review.name,
          role: review.role,
          text: review.text,
          image: review.imageFile
            ? await uploadImage(review.imageFile)
            : review.image?.trim()
              ? await uploadImage(review.image.trim())
              : "",
        })),
      );

      const { data } = await axios.post("/api/homepage/reviews-section", {
        section,
        stats: stats.map(({ value, label, publicId }) => ({
          value,
          label,
          publicId,
        })),
        reviews: finalReviews,
      });

      if (!data.success) {
        throw new Error(data.message || "Save failed");
      }

      setReviews((prev) =>
        prev.map((review) => {
          const saved = finalReviews.find((item) => item.id === review.id);

          return saved
            ? {
                ...review,
                image: saved.image,
                imageFile: null,
                imagePreview: "",
              }
            : review;
        }),
      );

      toast.success("Saved successfully");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save reviews",
      );
    } finally {
      setSaving(false);
    }
  };

  /* Search Reviews */

  const filteredReviews = reviews.filter(
    (review) =>
      review.name.toLowerCase().includes(search.toLowerCase()) ||
      review.role.toLowerCase().includes(search.toLowerCase()) ||
      review.text.toLowerCase().includes(search.toLowerCase()),
  );

  /* Loading Screen */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#16212C]">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#1E8A8A]/20 border-t-[#1E8A8A]" />
          <p className="mt-4 text-sm text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#16212C] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}

        <div className="rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#48C5C5]">
                <MessageSquareQuote size={27} />
              </div>

              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Reviews Manager
                </h1>
                <p className="mt-2 text-sm text-gray-400">
                  Manage testimonials, statistics and client reviews.
                </p>
              </div>
            </div>

            <button onClick={saveAll} disabled={saving} className={button}>
              <Save size={18} />
              {saving ? "Saving..." : "Save All Changes"}
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div className="rounded-xl bg-[#16212C] p-4">
              <p className="text-xs text-gray-400">Total Reviews</p>
              <p className="mt-2 text-2xl font-bold">{reviews.length}</p>
            </div>

            <div className="rounded-xl bg-[#16212C] p-4">
              <p className="text-xs text-gray-400">Statistics</p>
              <p className="mt-2 text-2xl font-bold">{stats.length}</p>
            </div>

            <div className="col-span-2 rounded-xl bg-[#16212C] p-4 sm:col-span-1">
              <p className="text-xs text-gray-400">Search Results</p>
              <p className="mt-2 text-2xl font-bold">
                {filteredReviews.length}
              </p>
            </div>
          </div>
        </div>

        {/* Section Content */}

        <section className="rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">01. Section Content</h2>
              <p className="mt-1 text-sm text-gray-400">
                Edit the testimonial section text.
              </p>
            </div>

            <button
              onClick={loadData}
              disabled={saving || loading}
              className={smallButton}
            >
              Reload
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className={input}
              value={section.badgeText}
              onChange={(e) =>
                setSection({ ...section, badgeText: e.target.value })
              }
              placeholder="Badge Text"
            />

            <input
              className={input}
              value={section.highlightWord}
              onChange={(e) =>
                setSection({ ...section, highlightWord: e.target.value })
              }
              placeholder="Highlight Word"
            />

            <input
              className={input}
              value={section.headingLineOne}
              onChange={(e) =>
                setSection({ ...section, headingLineOne: e.target.value })
              }
              placeholder="Heading Line 1"
            />

            <input
              className={input}
              value={section.headingLineTwo}
              onChange={(e) =>
                setSection({ ...section, headingLineTwo: e.target.value })
              }
              placeholder="Heading Line 2"
            />

            <textarea
              className={`${input} resize-y md:col-span-2`}
              rows={4}
              value={section.description}
              onChange={(e) =>
                setSection({ ...section, description: e.target.value })
              }
              placeholder="Section Description"
            />
          </div>
        </section>

        {/* Statistics */}

        <section className="rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">02. Top Statistics</h2>
              <p className="mt-1 text-sm text-gray-400">
                Edit, reorder and delete statistics.
              </p>
            </div>

            <button
              onClick={() =>
                setStats([
                  ...stats,
                  { id: Date.now(), publicId: "", value: "", label: "" },
                ])
              }
              className={smallButton}
            >
              <Plus size={16} />
              Add Statistic
            </button>
          </div>

          <div className="space-y-4">
            {stats.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-white/10 bg-[#16212C] p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">Statistic {index + 1}</h3>

                  <div className="flex gap-2">
                    <button
                      disabled={index === 0}
                      onClick={() => {
                        const updated = [...stats];
                        [updated[index - 1], updated[index]] = [
                          updated[index],
                          updated[index - 1],
                        ];
                        setStats(updated);
                      }}
                      className={smallButton}
                      aria-label="Move statistic up"
                    >
                      <ArrowUp size={16} />
                    </button>

                    <button
                      disabled={index === stats.length - 1}
                      onClick={() => {
                        const updated = [...stats];
                        [updated[index + 1], updated[index]] = [
                          updated[index],
                          updated[index + 1],
                        ];
                        setStats(updated);
                      }}
                      className={smallButton}
                      aria-label="Move statistic down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    className={input}
                    value={item.value}
                    onChange={(e) =>
                      setStats(
                        stats.map((stat) =>
                          stat.id === item.id
                            ? { ...stat, value: e.target.value }
                            : stat,
                        ),
                      )
                    }
                    placeholder="Value"
                  />

                  <input
                    className={input}
                    value={item.label}
                    onChange={(e) =>
                      setStats(
                        stats.map((stat) =>
                          stat.id === item.id
                            ? { ...stat, label: e.target.value }
                            : stat,
                        ),
                      )
                    }
                    placeholder="Label"
                  />
                </div>
              </div>
            ))}

            {stats.length === 0 && (
              <p className="py-6 text-center text-sm text-gray-400">
                No statistics added yet.
              </p>
            )}
          </div>
        </section>

        {/* Add Review */}

        <section className="rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:p-7">
          <h2 className="mb-2 text-xl font-bold">03. Add New Review</h2>
          <p className="mb-6 text-sm text-gray-400">
            Add a client testimonial and optional profile image.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className={input}
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Client Name"
            />

            <input
              className={input}
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              placeholder="Client Role"
            />

            <textarea
              className={`${input} resize-y md:col-span-2`}
              rows={4}
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              placeholder="Review Text"
            />

            <div className="rounded-xl border border-white/10 bg-[#16212C] p-4 md:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#111B27]">
                  {draft.imagePreview || draft.image ? (
                    <img
                      src={draft.imagePreview || draft.image}
                      alt="Review"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="text-gray-500" size={24} />
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                  <input
                    className={input}
                    value={draft.image}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        image: e.target.value,
                        imageFile: null,
                        imagePreview: "",
                      })
                    }
                    placeholder="Image URL (optional)"
                  />

                  <label className={`${smallButton} cursor-pointer`}>
                    <Upload size={16} />
                    Upload from PC
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        if (!file.type.startsWith("image/")) {
                          toast.error("Please select an image file");
                          e.target.value = "";
                          return;
                        }

                        const reader = new FileReader();

                        reader.onload = () =>
                          setDraft({
                            ...draft,
                            image: "",
                            imageFile: file,
                            imagePreview: reader.result || "",
                          });

                        reader.onerror = () =>
                          toast.error("Failed to preview image");

                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button onClick={addReview} className={button}>
              <Plus size={17} />
              Add Review
            </button>
          </div>
        </section>

        {/* Reviews List */}

        <section className="rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold">04. Reviews List</h2>
            <p className="mt-1 text-sm text-gray-400">
              Search, edit, reorder and delete reviews.
            </p>
          </div>

          <div className="relative mb-5">
            <Search
              size={17}
              className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500"
            />

            <input
              className={`${input} pl-11`}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisible(20);
              }}
              placeholder="Search reviews..."
            />
          </div>

          <div className="space-y-4">
            {filteredReviews.slice(0, visible).map((item) => {
              const isOpen = openId === item.id;
              const index = reviews.findIndex(
                (review) => review.id === item.id,
              );

              return (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-[#16212C]"
                >
                  <div className="flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#111B27]">
                        {item.imagePreview || item.image ? (
                          <img
                            src={item.imagePreview || item.image}
                            alt={item.name || "Client"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <MessageSquareQuote
                            size={20}
                            className="text-[#48C5C5]"
                          />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {item.name || "Untitled Review"}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {item.role || "No role"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                          {item.text}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setOpenId(isOpen ? null : item.id)}
                        className={smallButton}
                      >
                        {isOpen ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        {isOpen ? "Close" : "Edit"}
                      </button>

                      <button
                        disabled={index === 0}
                        onClick={() => {
                          const updated = [...reviews];
                          [updated[index - 1], updated[index]] = [
                            updated[index],
                            updated[index - 1],
                          ];
                          setReviews(updated);
                        }}
                        className={smallButton}
                        aria-label="Move review up"
                      >
                        <ArrowUp size={16} />
                      </button>

                      <button
                        disabled={index === reviews.length - 1}
                        onClick={() => {
                          const updated = [...reviews];
                          [updated[index + 1], updated[index]] = [
                            updated[index],
                            updated[index + 1],
                          ];
                          setReviews(updated);
                        }}
                        className={smallButton}
                        aria-label="Move review down"
                      >
                        <ArrowDown size={16} />
                      </button>

                      <button
                        onClick={() => {
                          setReviews((prev) =>
                            prev.filter((review) => review.id !== item.id),
                          );
                          if (openId === item.id) setOpenId(null);
                          toast.success(
                            "Review removed. Save to apply changes.",
                          );
                        }}
                        className="rounded-xl border border-red-500/20 bg-red-500/5 p-2.5 text-red-400 hover:bg-red-500 hover:text-white"
                        aria-label="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="border-t border-white/10 bg-[#111B27] p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <input
                          className={input}
                          value={item.name}
                          onChange={(e) =>
                            setReviews((prev) =>
                              prev.map((review) =>
                                review.id === item.id
                                  ? { ...review, name: e.target.value }
                                  : review,
                              ),
                            )
                          }
                          placeholder="Client Name"
                        />

                        <input
                          className={input}
                          value={item.role}
                          onChange={(e) =>
                            setReviews((prev) =>
                              prev.map((review) =>
                                review.id === item.id
                                  ? { ...review, role: e.target.value }
                                  : review,
                              ),
                            )
                          }
                          placeholder="Client Role"
                        />

                        <textarea
                          className={`${input} resize-y md:col-span-2`}
                          rows={4}
                          value={item.text}
                          onChange={(e) =>
                            setReviews((prev) =>
                              prev.map((review) =>
                                review.id === item.id
                                  ? { ...review, text: e.target.value }
                                  : review,
                              ),
                            )
                          }
                          placeholder="Review Text"
                        />

                        <div className="rounded-xl border border-white/10 bg-[#16212C] p-4 md:col-span-2">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#111B27]">
                              {item.imagePreview || item.image ? (
                                <img
                                  src={item.imagePreview || item.image}
                                  alt={item.name || "Client"}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <ImagePlus
                                  className="text-gray-500"
                                  size={24}
                                />
                              )}
                            </div>

                            <div className="min-w-0 flex-1 space-y-3">
                              <input
                                className={input}
                                value={item.image}
                                onChange={(e) =>
                                  setReviews((prev) =>
                                    prev.map((review) =>
                                      review.id === item.id
                                        ? {
                                            ...review,
                                            image: e.target.value,
                                            imageFile: null,
                                            imagePreview: "",
                                          }
                                        : review,
                                    ),
                                  )
                                }
                                placeholder="Image URL"
                              />

                              <label
                                className={`${smallButton} cursor-pointer`}
                              >
                                <Upload size={16} />
                                Upload from PC
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    if (!file.type.startsWith("image/")) {
                                      toast.error(
                                        "Please select an image file",
                                      );
                                      e.target.value = "";
                                      return;
                                    }

                                    const reader = new FileReader();

                                    reader.onload = () =>
                                      setReviews((prev) =>
                                        prev.map((review) =>
                                          review.id === item.id
                                            ? {
                                                ...review,
                                                image: "",
                                                imageFile: file,
                                                imagePreview:
                                                  reader.result || "",
                                              }
                                            : review,
                                        ),
                                      );

                                    reader.onerror = () =>
                                      toast.error("Failed to preview image");

                                    reader.readAsDataURL(file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredReviews.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/10 py-12 text-center">
                <Search className="mx-auto text-gray-500" size={26} />
                <p className="mt-3 font-medium">No reviews found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try another search or add a review.
                </p>
              </div>
            )}
          </div>

          {visible < filteredReviews.length && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => setVisible(visible + 20)}
                className={smallButton}
              >
                Load More Reviews
                <ChevronDown size={16} />
              </button>
            </div>
          )}
        </section>

        {/* Save All */}

        <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-[#111B27] p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h3 className="font-semibold">Save your changes</h3>
            <p className="mt-1 text-sm text-gray-400">
              Save section content, statistics and reviews together.
            </p>
          </div>

          <button onClick={saveAll} disabled={saving} className={button}>
            <Save size={18} />
            {saving ? "Saving Changes..." : "Save All Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
