"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Link as LinkIcon,
  LoaderCircle,
  PlayCircle,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const languages = [
  { code: "en", label: "English" },
  { code: "fa", label: "دری (Dari)" },
  { code: "ps", label: "پښتو (Pashto)" },
];

const fields = [
  "experienceNumber",
  "experienceLabel",
  "experienceText",
  "sectionLabel",
  "title",
  "description",
  "buttonText",
  "clientName",
  "clientRole",
];

const initialData = {
  experienceNumber: { en: "13+", fa: "", ps: "" },
  experienceLabel: {
    en: "Years of Experience",
    fa: "",
    ps: "",
  },
  experienceText: {
    en: "Decades of Experience, Endless Innovation",
    fa: "",
    ps: "",
  },
  sectionLabel: { en: "Get to Know Us", fa: "", ps: "" },
  title: { en: "", fa: "", ps: "" },
  description: { en: "", fa: "", ps: "" },
  buttonText: { en: "Learn More", fa: "", ps: "" },
  buttonLink: "/about",
  mainImage: "",
  thumbnailImage: "",
  videoLink: "",
  clientName: { en: "", fa: "", ps: "" },
  clientRole: { en: "", fa: "", ps: "" },
};

export default function AboutUsAdmin() {
  const [formData, setFormData] = useState(initialData);
  const [language, setLanguage] = useState("en");
  const [imageIds, setImageIds] = useState({
    mainImage: "",
    thumbnailImage: "",
  });
  const [previews, setPreviews] = useState({
    mainImage: "",
    thumbnailImage: "",
  });
  const [imageErrors, setImageErrors] = useState({
    mainImage: false,
    thumbnailImage: false,
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const fileInputRefs = useRef({});
  const previewUrls = useRef(new Set());

  // Load the current theme.
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Load About Us data from MongoDB.
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/homepage/about-us", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load About Us.");
        }

        if (!result.data) return;

        const data = result.data;

        // Support old string values and new translated objects.
        fields.forEach((field) => {
          const value = data[field];

          data[field] =
            typeof value === "string"
              ? { en: value, fa: "", ps: "" }
              : {
                  en: value?.en || "",
                  fa: value?.fa || "",
                  ps: value?.ps || "",
                };
        });

        const mainImage = data.mainImage || {};
        const thumbnailImage = data.thumbnailImage || {};

        setFormData({
          ...initialData,
          ...data,
          mainImage: mainImage.url || "",
          thumbnailImage: thumbnailImage.url || "",
        });

        setImageIds({
          mainImage: mainImage.publicId || "",
          thumbnailImage: thumbnailImage.publicId || "",
        });

        setPreviews({
          mainImage: mainImage.url || "",
          thumbnailImage: thumbnailImage.url || "",
        });
      } catch (error) {
        console.error("About Us GET Error:", error);
        toast.error(error.message || "Failed to load About Us.");
      } finally {
        setIsFetching(false);
      }
    }

    loadData();
  }, []);

  // Clean up temporary image previews.
  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));

      previewUrls.current.clear();
    };
  }, []);

  // Update a text field in the selected language only.
  function handleChange(event) {
    const { name, value } = event.target;

    if (fields.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: {
          ...prev[name],
          [language]: value,
        },
      }));
    } else {
      // Links are shared between languages.
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  // Select an image from the computer.
  function handleImageChange(event, field) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previews[field] && previewUrls.current.has(previews[field])) {
      URL.revokeObjectURL(previews[field]);
      previewUrls.current.delete(previews[field]);
    }

    const preview = URL.createObjectURL(file);
    previewUrls.current.add(preview);

    setFormData((prev) => ({ ...prev, [field]: file }));
    setPreviews((prev) => ({ ...prev, [field]: preview }));
    setImageIds((prev) => ({ ...prev, [field]: "" }));
    setImageErrors((prev) => ({ ...prev, [field]: false }));

    event.target.value = "";
  }

  // Use an image URL instead of selecting a file.
  function handleImageUrl(field, value) {
    if (previews[field] && previewUrls.current.has(previews[field])) {
      URL.revokeObjectURL(previews[field]);
      previewUrls.current.delete(previews[field]);
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    setPreviews((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));
    setImageIds((prev) => ({ ...prev, [field]: "" }));
    setImageErrors((prev) => ({ ...prev, [field]: false }));
  }

  // Remove the selected image.
  function removeImage(field) {
    if (previews[field] && previewUrls.current.has(previews[field])) {
      URL.revokeObjectURL(previews[field]);
      previewUrls.current.delete(previews[field]);
    }

    setFormData((prev) => ({ ...prev, [field]: "" }));
    setPreviews((prev) => ({ ...prev, [field]: "" }));
    setImageIds((prev) => ({ ...prev, [field]: "" }));
    setImageErrors((prev) => ({ ...prev, [field]: false }));

    if (fileInputRefs.current[field]) {
      fileInputRefs.current[field].value = "";
    }
  }

  // Check the form before saving.
  function validateForm() {
    for (const field of fields) {
      if (!formData[field]?.[language]?.trim()) {
        toast.error(
          `${field.replace(/([A-Z])/g, " $1")} is required in ${
            languages.find((item) => item.code === language)?.label
          }.`,
        );

        return false;
      }
    }

    if (!formData.buttonLink.trim()) {
      toast.error("Button Link is required.");
      return false;
    }

    if (!formData.videoLink.trim()) {
      toast.error("YouTube Video Link is required.");
      return false;
    }

    try {
      const url = new URL(formData.videoLink.trim());

      if (
        ![
          "youtube.com",
          "www.youtube.com",
          "m.youtube.com",
          "youtu.be",
        ].includes(url.hostname)
      ) {
        throw new Error();
      }
    } catch {
      toast.error("Enter a valid YouTube URL.");
      return false;
    }

    for (const field of ["mainImage", "thumbnailImage"]) {
      if (!formData[field]) {
        toast.error(
          field === "mainImage"
            ? "Main Image is required."
            : "Video Thumbnail is required.",
        );

        return false;
      }
    }

    return true;
  }

  // Save translations and upload any new images.
  async function handleSave(event) {
    event.preventDefault();

    if (isSaving || !validateForm()) return;

    setIsSaving(true);

    try {
      const images = {
        mainImage: {
          url:
            typeof formData.mainImage === "string"
              ? formData.mainImage.trim()
              : "",
          publicId: imageIds.mainImage,
        },
        thumbnailImage: {
          url:
            typeof formData.thumbnailImage === "string"
              ? formData.thumbnailImage.trim()
              : "",
          publicId: imageIds.thumbnailImage,
        },
      };

      // Upload new files or external image URLs to Cloudinary.
      const uploadData = new FormData();
      let hasImagesToUpload = false;

      for (const field of ["mainImage", "thumbnailImage"]) {
        const value = formData[field];

        if (typeof File !== "undefined" && value instanceof File) {
          uploadData.append(field, value);
          hasImagesToUpload = true;
        } else if (
          typeof value === "string" &&
          value.trim() &&
          !imageIds[field]
        ) {
          uploadData.append(`${field}Url`, value.trim());
          hasImagesToUpload = true;
        }
      }

      if (hasImagesToUpload) {
        const uploadResponse = await fetch(
          "/api/homepage/about-us/upload-images",
          {
            method: "POST",
            body: uploadData,
          },
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || "Image upload failed.");
        }

        for (const field of ["mainImage", "thumbnailImage"]) {
          const value = formData[field];

          const needsUpload =
            (typeof File !== "undefined" && value instanceof File) ||
            (typeof value === "string" && value.trim() && !imageIds[field]);

          if (!needsUpload) continue;

          const uploaded = uploadResult.images?.[field];

          if (!uploaded?.url || !uploaded?.publicId) {
            throw new Error(`Cloudinary upload failed for ${field}.`);
          }

          images[field] = {
            url: uploaded.url,
            publicId: uploaded.publicId,
          };
        }
      }

      // Send every language so the other translations are preserved.
      const payload = {
        ...Object.fromEntries(fields.map((field) => [field, formData[field]])),
        buttonLink: formData.buttonLink.trim(),
        videoLink: formData.videoLink.trim(),
        mainImage: images.mainImage,
        thumbnailImage: images.thumbnailImage,
      };

      const response = await fetch("/api/homepage/about-us", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save About Us.");
      }

      const saved = result.data;

      setFormData((prev) => ({
        ...prev,
        ...saved,
        mainImage: saved.mainImage?.url || images.mainImage.url,
        thumbnailImage: saved.thumbnailImage?.url || images.thumbnailImage.url,
      }));

      setImageIds({
        mainImage: saved.mainImage?.publicId || images.mainImage.publicId,
        thumbnailImage:
          saved.thumbnailImage?.publicId || images.thumbnailImage.publicId,
      });

      setPreviews({
        mainImage: saved.mainImage?.url || images.mainImage.url,
        thumbnailImage: saved.thumbnailImage?.url || images.thumbnailImage.url,
      });

      toast.success("About Us saved successfully.");
    } catch (error) {
      console.error("About Us Save Error:", error);
      toast.error(error.message || "Failed to save About Us.");
    } finally {
      setIsSaving(false);
    }
  }

  const pageClass = isDark
    ? "bg-[#0b1117] text-[#f2f4f7]"
    : "bg-[#f7f9fc] text-[#101828]";

  const cardClass = isDark
    ? "border-[#263442] bg-[#111a23]"
    : "border-[#e4e7ec] bg-white";

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-[#35B5B5] focus:ring-2 focus:ring-[#1E8A8A]/20 ${
    isDark
      ? "border-[#263442] bg-[#16212c] text-[#f2f4f7] placeholder:text-gray-500"
      : "border-[#e4e7ec] bg-white text-[#101828] placeholder:text-gray-400"
  }`;

  const labelClass = `mb-2 block text-sm font-medium ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-500";

  function renderInput(label, name, placeholder, type = "text") {
    return (
      <div key={name}>
        <label htmlFor={name} className={labelClass}>
          {label} <span className="text-red-400">*</span>
        </label>

        <input
          id={name}
          name={name}
          type={type}
          value={
            fields.includes(name)
              ? formData[name]?.[language] || ""
              : formData[name] || ""
          }
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
          required
          dir={language === "en" ? "ltr" : "auto"}
        />
      </div>
    );
  }

  function renderImageField(label, field) {
    return (
      <div key={field} className="min-w-0">
        <label className={labelClass}>{label}</label>

        {previews[field] ? (
          <div
            className={`relative rounded-xl border p-3 ${
              isDark
                ? "border-[#263442] bg-[#16212c]"
                : "border-[#e4e7ec] bg-[#f8fafc]"
            }`}
          >
            <div className="flex h-52 items-center justify-center overflow-hidden rounded-lg">
              {imageErrors[field] ? (
                <div className="text-center">
                  <AlertCircle className="mx-auto mb-2 text-amber-500" />
                  Image could not be loaded
                </div>
              ) : (
                <img
                  src={previews[field]}
                  alt={label}
                  className="h-full w-full object-contain"
                  onError={() =>
                    setImageErrors((prev) => ({
                      ...prev,
                      [field]: true,
                    }))
                  }
                  onLoad={() =>
                    setImageErrors((prev) => ({
                      ...prev,
                      [field]: false,
                    }))
                  }
                />
              )}
            </div>

            <button
              type="button"
              onClick={() => removeImage(field)}
              className="absolute top-5 right-5 rounded-lg bg-red-500 p-2 text-white hover:bg-red-600"
              aria-label={`Remove ${label}`}
            >
              <Trash2 size={17} />
            </button>

            <p className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
              <CheckCircle2 size={15} />
              Image selected
            </p>
          </div>
        ) : (
          <label
            className={`flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center hover:border-[#1E8A8A] ${
              isDark
                ? "border-[#263442] bg-[#16212c]"
                : "border-[#d0d5dd] bg-[#f8fafc]"
            }`}
          >
            <span className="mb-3 rounded-xl bg-[#1E8A8A]/15 p-4 text-[#35B5B5]">
              <ImagePlus size={27} />
            </span>

            <span className="text-sm font-medium">Upload {label}</span>

            <span className={`mt-2 text-xs ${mutedTextClass}`}>
              JPG, PNG or WEBP · Maximum 5 MB
            </span>

            <input
              ref={(node) => {
                fileInputRefs.current[field] = node;
              }}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => handleImageChange(event, field)}
            />
          </label>
        )}

        <div className="relative mt-3">
          <LinkIcon
            size={16}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
          />

          <input
            type="url"
            value={typeof formData[field] === "string" ? formData[field] : ""}
            onChange={(event) => handleImageUrl(field, event.target.value)}
            placeholder="Or paste an image URL"
            className={`${inputClass} pl-10`}
          />
        </div>

        <p className={`mt-2 text-xs ${mutedTextClass}`}>
          New images and external URLs are uploaded to Cloudinary when saved.
        </p>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-2 ${pageClass}`}>
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#35B5B5] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#1E8A8A]" />
              Homepage Management
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">About Us Section</h1>

            <p className={`mt-2 text-sm ${mutedTextClass}`}>
              Manage your translated content and section images.
            </p>
          </div>

          {/* Three teal language-selection buttons */}
          <div className="min-w-0 sm:min-w-[320px]">
            <label className={`${labelClass} mb-3`}>Content Language</label>

            <div
              className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[#1E8A8A]/20 bg-[#1E8A8A]/5 p-1.5 shadow-sm"
              role="group"
              aria-label="Content language"
            >
              {languages.map((item) => {
                const isActive = language === item.code;

                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code)}
                    disabled={isSaving}
                    aria-pressed={isActive}
                    className={`relative flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#1E8A8A] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "bg-[#1E8A8A] text-white shadow-md shadow-[#1E8A8A]/20"
                        : isDark
                          ? "text-gray-400 hover:bg-[#1E8A8A]/15 hover:text-[#35B5B5]"
                          : "text-gray-600 hover:bg-[#1E8A8A]/10 hover:text-[#1E8A8A]"
                    }`}
                  >
                    {item.code === "en"
                      ? "English"
                      : item.code === "fa"
                        ? "دری"
                        : "پښتو"}

                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>

            <p className={`mt-2 text-xs ${mutedTextClass}`}>
              Select a language to edit its content.
            </p>
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <section
            className={`overflow-hidden rounded-2xl border shadow-xl ${cardClass}`}
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <h2 className="font-semibold">Section Content</h2>

              <p className={`mt-1 text-xs ${mutedTextClass}`}>
                Editing:{" "}
                {languages.find((item) => item.code === language)?.label}
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {renderInput("Experience Number", "experienceNumber", "13+")}

              {renderInput(
                "Experience Label",
                "experienceLabel",
                "Years of Experience",
              )}

              {renderInput(
                "Experience Text",
                "experienceText",
                "Our experience",
              )}

              {renderInput("Section Label", "sectionLabel", "Get to Know Us")}

              {renderInput("Title", "title", "Enter section title")}

              {renderInput("Button Text", "buttonText", "Learn More")}

              {renderInput("Button Link", "buttonLink", "/about")}

              <div className="sm:col-span-2">
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-red-400">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description?.[language] || ""}
                  onChange={handleChange}
                  placeholder="Write your About Us description..."
                  required
                  dir={language === "en" ? "ltr" : "auto"}
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className={`mt-2 text-right text-xs ${mutedTextClass}`}>
                  {(formData.description?.[language] || "").length} characters
                </p>
              </div>
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border shadow-xl ${cardClass}`}
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <h2 className="font-semibold">Section Images</h2>

              <p className={`mt-1 text-xs ${mutedTextClass}`}>
                Images are shared across all languages.
              </p>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
              {renderImageField("Main Image", "mainImage")}

              {renderImageField("Video Thumbnail", "thumbnailImage")}

              <div className="sm:col-span-2">
                <label htmlFor="videoLink" className={labelClass}>
                  YouTube Video Link
                </label>

                <div className="relative">
                  <PlayCircle
                    size={18}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-red-500"
                  />

                  <input
                    id="videoLink"
                    name="videoLink"
                    type="url"
                    value={formData.videoLink}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border shadow-xl ${cardClass}`}
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <h2 className="font-semibold">Client Information</h2>

              <p className={`mt-1 text-xs ${mutedTextClass}`}>
                These text fields also support each language.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {renderInput("Client Name", "clientName", "Enter client name")}

              {renderInput("Client Role", "clientRole", "Enter client role")}
            </div>
          </section>

          <footer
            className={`sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-6 ${
              isDark
                ? "border-[#263442] bg-[#111a23]/95"
                : "border-[#e4e7ec] bg-white/95"
            }`}
          >
            <p className={`text-xs ${mutedTextClass}`}>
              Save your changes in the selected language.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isSaving}
                className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium ${
                  isDark
                    ? "border-[#263442] text-gray-300"
                    : "border-[#e4e7ec] text-gray-700"
                }`}
              >
                <RotateCcw size={16} />
                Reload Saved Data
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
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
