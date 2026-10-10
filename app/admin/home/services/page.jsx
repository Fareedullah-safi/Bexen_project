"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Plus,
  Save,
  Trash2,
  Upload,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

/* ==================== Image Picker Component ==================== */
function ImagePicker({ value, onChange, disabled }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      setError(false);
      return () => URL.revokeObjectURL(url);
    }

    if (typeof value === "string" && value) {
      setPreview(value);
      setError(false);
      return;
    }

    setPreview("");
    setError(false);
  }, [value]);

  function handleUrlChange(e) {
    onChange(e.target.value);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error("Only PNG, JPG and WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      e.target.value = "";
      return;
    }

    onChange(file);
  }

  function removeImage() {
    onChange("");
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111b1d]">
      {preview && !error ? (
        <div className="relative flex h-52 items-center justify-center bg-gray-50 p-4 dark:bg-[#0C1E21]">
          <img
            src={preview}
            alt="Solution preview"
            onError={() => setError(true)}
            className="h-full w-full rounded-xl object-cover"
          />

          <button
            type="button"
            onClick={removeImage}
            disabled={disabled}
            title="Remove image"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:opacity-40 dark:bg-[#111b1d]"
          >
            <Trash2 size={16} />
          </button>

          {value instanceof File && (
            <span className="absolute top-3 left-3 rounded-lg bg-[#1E8A8A] px-2.5 py-1 text-[11px] font-bold text-white">
              NEW UPLOAD
            </span>
          )}
        </div>
      ) : (
        <div className="flex h-52 flex-col items-center justify-center bg-gray-50 text-gray-400 dark:bg-[#0C1E21]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <ImagePlus size={28} />
          </div>
          <p className="mt-3 text-sm font-medium text-[#0C1E21] dark:text-white">
            {error ? "Unable to load image" : "No image selected"}
          </p>
        </div>
      )}

      <div className="space-y-3 p-4">
        <div className="relative">
          <LinkIcon
            size={15}
            className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
          />
          <input
            type="url"
            value={typeof value === "string" ? value : ""}
            onChange={handleUrlChange}
            disabled={disabled || value instanceof File}
            placeholder={
              value instanceof File
                ? "Remove file to use a URL"
                : "Paste image URL..."
            }
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pr-4 pl-10 text-sm text-[#0C1E21] transition outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
          <span className="text-[11px] font-bold tracking-wider text-gray-400">
            OR
          </span>
          <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-3 text-sm font-semibold text-white transition hover:bg-[#1E8A8A] disabled:opacity-40 dark:bg-white/10 dark:hover:bg-[#1E8A8A]"
        >
          <Upload size={16} />
          Upload from PC
        </button>
      </div>
    </div>
  );
}

/* ==================== Main Admin Page Component ==================== */
export default function SolutionsAdmin() {
  const [badge, setBadge] = useState("OUR SOLUTIONS");
  const [headingOne, setHeadingOne] = useState("Solutions to Transform");
  const [headingTwo, setHeadingTwo] = useState("Your");
  const [highlight, setHighlight] = useState("Business.");

  const [solutions, setSolutions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /* ---------------- 1. Load Data on Startup ---------------- */
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/homepage/services");
        const result = await res.json();

        if (res.ok && result.success && result.data) {
          const d = result.data;

          setBadge(d.badge || "OUR SOLUTIONS");
          setHeadingOne(d.headingOne || "Solutions to Transform");
          setHeadingTwo(d.headingTwo || "Your");
          setHighlight(d.highlight || "Business.");

          if (d.solutions?.length) {
            setSolutions(
              d.solutions.map((s, i) => ({
                id: s._id || `item-${i}-${Date.now()}`,
                title: s.title || "",
                description: s.description || "",
                image: s.image || "",
                publicId: s.publicId || "",
              })),
            );
          } else {
            addSolution();
          }
        } else {
          addSolution();
        }
      } catch (err) {
        console.error("Load error:", err);
        toast.error("Failed to load saved data");
        addSolution();
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  /* ---------------- 2. Card Helpers ---------------- */
  function updateSolution(id, field, value) {
    setSolutions((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function updateImage(id, value) {
    setSolutions((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const isSame = typeof value === "string" && value === item.image;
        return {
          ...item,
          image: value,
          publicId: isSame ? item.publicId : "",
        };
      }),
    );
  }

  function addSolution() {
    setSolutions((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        title: "",
        description: "",
        image: "",
        publicId: "",
      },
    ]);
  }

  function moveSolution(index, direction) {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= solutions.length) return;

    const list = [...solutions];
    [list[index], list[target]] = [list[target], list[index]];
    setSolutions(list);
  }

  /* ---------------- 3. Delete Using Only MongoDB _id ---------------- */
  async function handleDeleteCard(cardId) {
    if (deletingId) return;

    if (solutions.length === 1) {
      return toast.error("You must have at least one card");
    }

    // A: If it's a locally added card that was never saved to DB
    if (String(cardId).startsWith("new-")) {
      setSolutions((prev) => prev.filter((c) => c.id !== cardId));
      toast.success("Card removed");
      return;
    }

    // B: If it's saved in MongoDB -> send only cardId to DELETE API
    try {
      setDeletingId(cardId);

      const res = await fetch("/api/homepage/services", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to delete card");
      }

      setSolutions((prev) => prev.filter((c) => c.id !== cardId));
      toast.success("Card deleted successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete card");
    } finally {
      setDeletingId(null);
    }
  }

  /* ---------------- 4. Save Data (POST) ---------------- */
  async function handleSave(e) {
    e.preventDefault();
    if (isSaving || deletingId) return;

    if (!headingOne.trim()) return toast.error("Heading Line 1 is required");

    for (let i = 0; i < solutions.length; i++) {
      if (!solutions[i].title.trim())
        return toast.error(`Card ${i + 1}: Title is required`);
      if (!solutions[i].description.trim())
        return toast.error(`Card ${i + 1}: Description is required`);
      if (!solutions[i].image)
        return toast.error(`Card ${i + 1}: Image is required`);
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append("badge", badge);
      formData.append("headingOne", headingOne);
      formData.append("headingTwo", headingTwo);
      formData.append("highlight", highlight);

      solutions.forEach((item, index) => {
        formData.append("titles", item.title);
        formData.append("descriptions", item.description);

        if (item.image instanceof File) {
          formData.append(`hasFile_${index}`, "true");
          formData.append("files", item.image);
          formData.append("existingImages", "");
          formData.append("existingPublicIds", "");
        } else {
          formData.append(`hasFile_${index}`, "false");
          formData.append("existingImages", item.image || "");
          formData.append("existingPublicIds", item.publicId || "");
        }
      });

      const res = await fetch("/api/homepage/services", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to save");
      }

      toast.success("Solutions saved successfully");

      if (result.data?.solutions) {
        setSolutions(
          result.data.solutions.map((s, i) => ({
            id: s._id || `item-${i}-${Date.now()}`,
            title: s.title,
            description: s.description,
            image: s.image,
            publicId: s.publicId || "",
          })),
        );
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0C1E21] outline-none transition placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#0C1E21] dark:text-gray-200";

  if (isLoading) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#1E8A8A]" />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Loading solutions...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          <Box size={27} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0C1E21] dark:text-white">
            Solutions Slider
          </h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Manage Section Five — solutions cards and heading.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 01 Section Header */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
              01
            </span>
            <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
              Section Header
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Badge Text</label>
              <input
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                disabled={isSaving}
                placeholder="OUR SOLUTIONS"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Highlight Word</label>
              <input
                value={highlight}
                onChange={(e) => setHighlight(e.target.value)}
                disabled={isSaving}
                placeholder="Business."
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Heading Line 1</label>
              <input
                value={headingOne}
                onChange={(e) => setHeadingOne(e.target.value)}
                disabled={isSaving}
                placeholder="Solutions to Transform"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Heading Line 2</label>
              <input
                value={headingTwo}
                onChange={(e) => setHeadingTwo(e.target.value)}
                disabled={isSaving}
                placeholder="Your"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* 02 Solutions Cards */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                02
              </span>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Solutions Cards
              </h2>
            </div>

            <span className="w-fit rounded-full bg-[#1E8A8A]/10 px-4 py-2 text-sm font-semibold text-[#1E8A8A]">
              {solutions.length} cards
            </span>
          </div>

          <div className="space-y-5">
            {solutions.map((item, index) => (
              <div
                key={item.id}
                className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0C1E21]"
              >
                {/* Top Action Bar of Card */}
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="truncate text-sm font-semibold text-[#0C1E21] dark:text-white">
                      {item.title || `Solution ${index + 1}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moveSolution(index, "up")}
                      disabled={
                        index === 0 || isSaving || deletingId === item.id
                      }
                      title="Move up"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-30 dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                    >
                      <ArrowUp size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveSolution(index, "down")}
                      disabled={
                        index === solutions.length - 1 ||
                        isSaving ||
                        deletingId === item.id
                      }
                      title="Move down"
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-30 dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                    >
                      <ArrowDown size={16} />
                    </button>

                    {/* Single Item Delete Button - passing only item.id */}
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(item.id)}
                      disabled={isSaving || deletingId === item.id}
                      title="Delete card"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white disabled:opacity-40 dark:bg-[#111b1d]"
                    >
                      {deletingId === item.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin text-red-500"
                        />
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
                        value={item.title}
                        onChange={(e) =>
                          updateSolution(item.id, "title", e.target.value)
                        }
                        disabled={isSaving || deletingId === item.id}
                        placeholder="e.g. Business Strategy Development"
                        className={`${inputClass} !bg-white dark:!bg-[#111b1d]`}
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          updateSolution(item.id, "description", e.target.value)
                        }
                        disabled={isSaving || deletingId === item.id}
                        rows={5}
                        placeholder="Enter short card description..."
                        className={`${inputClass} resize-y !bg-white dark:!bg-[#111b1d]`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Card Image</label>
                    <ImagePicker
                      value={item.image}
                      disabled={isSaving || deletingId === item.id}
                      onChange={(val) => updateImage(item.id, val)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addSolution}
            disabled={isSaving || !!deletingId}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-40 dark:border-white/15 dark:text-gray-400"
          >
            <Plus size={18} />
            Add New Solution
          </button>
        </div>

        {/* Save Footer */}
        <div className="flex justify-end rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
          <button
            type="submit"
            disabled={isSaving || !!deletingId}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:bg-[#155F61] disabled:text-white/80 sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Solutions
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
