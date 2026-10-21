"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import {
  AlertCircle,
  CheckCircle2,
  FileImage,
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

const initialData = {
  experienceNumber: "13+",
  experienceLabel: "Years of Experience",
  experienceText: "Decades of Experience, Endless Innovation",
  sectionLabel: "Get to Know Us",
  title: "",
  description: "",
  buttonText: "Learn More",
  buttonLink: "/about",
  mainImage: "",
  thumbnailImage: "",
  clientName: "",
  clientRole: "",
  videoLink: "",
};

const getImageUrl = (image) =>
  typeof image === "string" ? image : image?.url || "";

const requiredFields = [
  ["experienceNumber", "Experience Number"],
  ["experienceLabel", "Experience Label"],
  ["experienceText", "Experience Text"],
  ["sectionLabel", "Section Label"],
  ["title", "Title"],
  ["description", "Description"],
  ["buttonText", "Button Text"],
  ["buttonLink", "Button Link"],
  ["clientName", "Client Name"],
  ["clientRole", "Client Role"],
];

const isFile = (value) => typeof File !== "undefined" && value instanceof File;

const isSupportedImage = (file) =>
  ["image/jpeg", "image/png", "image/webp"].includes(file.type);

const isValidYouTubeUrl = (value) => {
  try {
    const url = new URL(value.trim());
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");

    let videoId = "";

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || "";
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v") || "";
      } else {
        const parts = url.pathname.split("/").filter(Boolean);

        if (["embed", "shorts", "live", "v"].includes(parts[0])) {
          videoId = parts[1] || "";
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  } catch {
    return false;
  }
};

export default function page() {
  const [formData, setFormData] = useState(initialData);

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
  const [hasSavedData, setHasSavedData] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const fileInputRefs = useRef({});
  const previewUrls = useRef(new Set());

  const revokePreview = (url) => {
    if (url && previewUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      previewUrls.current.delete(url);
    }
  };

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

  // Load saved MongoDB data into every input.
  useEffect(() => {
    let active = true;

    const getAboutUsData = async () => {
      try {
        const response = await fetch("/api/homepage/about-us", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load About Us data.");
        }

        if (!active) return;

        if (result.data) {
          const data = result.data;

          const thumbnailData = data.thumbnailImage ?? data.clientImage ?? "";

          const mainImageUrl = getImageUrl(data.mainImage);
          const thumbnailImageUrl = getImageUrl(thumbnailData);

          setFormData({
            ...initialData,
            ...data,
            mainImage: mainImageUrl,
            thumbnailImage: thumbnailImageUrl,
            videoLink: data.videoLink || "",
          });

          setImageIds({
            mainImage: data.mainImage?.publicId || "",
            thumbnailImage: thumbnailData?.publicId || "",
          });

          setPreviews({
            mainImage: mainImageUrl,
            thumbnailImage: thumbnailImageUrl,
          });

          setImageErrors({
            mainImage: false,
            thumbnailImage: false,
          });

          setHasSavedData(true);
        }
      } catch (error) {
        console.error("About Us GET Error:", error);

        if (active) {
          toast.error(error.message || "Failed to load saved About Us data.");
        }
      } finally {
        if (active) setIsFetching(false);
      }
    };

    getAboutUsData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });

      previewUrls.current.clear();
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!isSupportedImage(file)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      e.target.value = "";
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    previewUrls.current.add(previewUrl);
    revokePreview(previews[field]);

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: previewUrl,
    }));

    setImageErrors((prev) => ({
      ...prev,
      [field]: false,
    }));

    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));

    e.target.value = "";
  };

  const handleImageUrl = (field, value) => {
    revokePreview(previews[field]);

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: value.trim(),
    }));

    setImageErrors((prev) => ({
      ...prev,
      [field]: false,
    }));

    // A changed URL must be uploaded to Cloudinary before saving.
    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const removeImage = (field) => {
    revokePreview(previews[field]);

    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: "",
    }));

    setImageErrors((prev) => ({
      ...prev,
      [field]: false,
    }));

    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));

    if (fileInputRefs.current[field]) {
      fileInputRefs.current[field].value = "";
    }
  };

  const validateForm = () => {
    const videoLink = String(formData.videoLink || "").trim();

    if (!videoLink) {
      toast.error("YouTube Video Link is required.");
      return false;
    }

    if (!isValidYouTubeUrl(videoLink)) {
      toast.error("Enter a valid YouTube video URL.");
      return false;
    }

    for (const [field, label] of requiredFields) {
      if (!String(formData[field] ?? "").trim()) {
        toast.error(`${label} is required.`);
        return false;
      }
    }

    for (const field of ["mainImage", "thumbnailImage"]) {
      const image = formData[field];
      const label = field === "mainImage" ? "Main Image" : "Video Thumbnail";

      if (!image) {
        toast.error(`${label} is required.`);
        return false;
      }

      if (typeof image === "string") {
        try {
          const url = new URL(image.trim());

          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid URL protocol.");
          }
        } catch {
          toast.error(
            `Enter a valid image URL or upload the ${label} from your PC.`,
          );
          return false;
        }
      }
    }

    const link = formData.buttonLink.trim();

    if (link.startsWith("//")) {
      toast.error("Button Link must be an internal path or HTTP/HTTPS URL.");
      return false;
    }

    if (!link.startsWith("/")) {
      try {
        const url = new URL(link);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL protocol.");
        }
      } catch {
        toast.error("Enter a valid button link, such as /about.");
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (isSaving || !validateForm()) return;

    setIsSaving(true);

    try {
      // Preserve existing images until they are changed.
      const images = {
        mainImage: {
          url:
            typeof formData.mainImage === "string"
              ? formData.mainImage.trim()
              : previews.mainImage,
          publicId: imageIds.mainImage,
        },
        thumbnailImage: {
          url:
            typeof formData.thumbnailImage === "string"
              ? formData.thumbnailImage.trim()
              : previews.thumbnailImage,
          publicId: imageIds.thumbnailImage,
        },
      };

      const uploadData = new FormData();
      let hasImagesToUpload = false;

      for (const field of ["mainImage", "thumbnailImage"]) {
        const image = formData[field];

        if (isFile(image)) {
          uploadData.append(field, image);
          hasImagesToUpload = true;
        } else if (
          typeof image === "string" &&
          image.trim() &&
          !imageIds[field]
        ) {
          // Pasted external URLs are also uploaded to Cloudinary.
          uploadData.append(`${field}Url`, image.trim());
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
          const image = formData[field];

          const needsUpload =
            isFile(image) ||
            (typeof image === "string" && image.trim() && !imageIds[field]);

          if (!needsUpload) continue;

          const uploadedImage = uploadResult.images?.[field];

          if (!uploadedImage?.url || !uploadedImage?.publicId) {
            throw new Error(
              `Cloudinary did not return a valid ${field} URL and public ID.`,
            );
          }

          images[field] = {
            url: uploadedImage.url,
            publicId: uploadedImage.publicId,
          };
        }
      }

      const payload = {
        experienceNumber: formData.experienceNumber.trim(),
        experienceLabel: formData.experienceLabel.trim(),
        experienceText: formData.experienceText.trim(),
        sectionLabel: formData.sectionLabel.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),
        clientName: formData.clientName.trim(),
        clientRole: formData.clientRole.trim(),
        videoLink: formData.videoLink.trim(),
        mainImage: images.mainImage,
        thumbnailImage: images.thumbnailImage,
      };

      const response = await fetch("/api/homepage/about-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save About Us data.");
      }

      const savedData = result.data || payload;

      const savedThumbnail =
        savedData.thumbnailImage ?? savedData.clientImage ?? "";

      const mainImageUrl = getImageUrl(savedData.mainImage);
      const thumbnailImageUrl = getImageUrl(savedThumbnail);

      revokePreview(previews.mainImage);
      revokePreview(previews.thumbnailImage);

      setFormData({
        ...initialData,
        ...savedData,
        mainImage: mainImageUrl,
        thumbnailImage: thumbnailImageUrl,
        videoLink: savedData.videoLink || "",
      });

      setImageIds({
        mainImage: savedData.mainImage?.publicId || "",
        thumbnailImage: savedThumbnail?.publicId || "",
      });

      setPreviews({
        mainImage: mainImageUrl,
        thumbnailImage: thumbnailImageUrl,
      });

      setImageErrors({
        mainImage: false,
        thumbnailImage: false,
      });

      setHasSavedData(true);

      toast.success("About Us saved successfully!");
    } catch (error) {
      console.error("About Us Save Error:", error);
      toast.error(error.message || "Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const pageClass = isDark
    ? "bg-[#0b1117] text-[#f2f4f7]"
    : "bg-[#f7f9fc] text-[#101828]";

  const cardClass = isDark
    ? "border-[#263442] bg-[#111a23]"
    : "border-[#e4e7ec] bg-white";

  const inputClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-[#35B5B5] focus:ring-2 focus:ring-[#1E8A8A]/20 ${
    isDark
      ? "border-[#263442] bg-[#16212c] text-[#f2f4f7] placeholder:text-gray-500"
      : "border-[#e4e7ec] bg-white text-[#101828] placeholder:text-gray-400"
  }`;

  const labelClass = `mb-2 block text-sm font-medium ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-500";

  const renderInput = (
    label,
    name,
    placeholder,
    required = true,
    type = "text",
  ) => (
    <div key={name}>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClass}
        required={required}
      />
    </div>
  );

  const renderImageField = (label, field) => (
    <div key={field} className="min-w-0">
      <label className={labelClass}>
        {label} <span className="text-red-400">*</span>
      </label>

      {previews[field] ? (
        <div
          className={`relative overflow-hidden rounded-xl border p-3 ${
            isDark
              ? "border-[#263442] bg-[#16212c]"
              : "border-[#e4e7ec] bg-[#f8fafc]"
          }`}
        >
          <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-lg">
            {imageErrors[field] ? (
              <div className="flex flex-col items-center gap-2 px-4 text-center">
                <AlertCircle size={30} className="text-amber-500" />

                <p className="text-sm font-medium">Image could not be loaded</p>

                <p className={`text-xs ${mutedTextClass}`}>
                  Check the URL or choose another image.
                </p>
              </div>
            ) : (
              <img
                src={previews[field]}
                alt={label}
                className="h-full w-full object-contain"
                onError={() => {
                  setImageErrors((prev) => ({
                    ...prev,
                    [field]: true,
                  }));
                }}
                onLoad={() => {
                  setImageErrors((prev) => ({
                    ...prev,
                    [field]: false,
                  }));
                }}
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => removeImage(field)}
            className="absolute top-5 right-5 rounded-lg border border-red-400/20 bg-red-500/90 p-2 text-white transition hover:bg-red-600"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={17} />
          </button>

          <div
            className={`mt-3 flex items-center gap-2 text-xs ${
              imageErrors[field] ? "text-amber-500" : "text-emerald-500"
            }`}
          >
            {imageErrors[field] ? (
              <AlertCircle size={15} />
            ) : (
              <CheckCircle2 size={15} />
            )}

            {imageErrors[field] ? "Image unavailable" : "Image selected"}
          </div>
        </div>
      ) : (
        <label
          className={`flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center transition hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5 ${
            isDark
              ? "border-[#263442] bg-[#16212c]"
              : "border-[#d0d5dd] bg-[#f8fafc]"
          }`}
        >
          <span className="mb-3 rounded-xl bg-[#1E8A8A]/15 p-4 text-[#35B5B5]">
            <ImagePlus size={27} />
          </span>

          <span
            className={`text-sm font-medium ${
              isDark ? "text-gray-200" : "text-gray-700"
            }`}
          >
            Upload {label}
          </span>

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
            onChange={(e) => handleImageChange(e, field)}
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
          onChange={(e) => handleImageUrl(field, e.target.value)}
          placeholder="Or paste an image URL"
          className={`${inputClass} pl-10`}
        />
      </div>

      <p className={`mt-2 text-xs ${mutedTextClass}`}>
        Saving uploads this image to Cloudinary and stores its Cloudinary URL.
      </p>
    </div>
  );

  if (isFetching) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-3 bg-[var(--background)]">
        <Spinner />
        <p className="text-sm font-medium text-[var(--muted)]">
          Loading About Us...
        </p>
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

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              About Us Section
            </h1>

            <p className={`mt-2 max-w-xl text-sm leading-6 ${mutedTextClass}`}>
              Manage the content, images and client information displayed on
              your website.
            </p>
          </div>

          <div
            className={`flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs ${
              isDark
                ? "border-[#263442] bg-[#16212c] text-gray-300"
                : "border-[#e4e7ec] bg-white text-gray-600"
            }`}
          >
            {hasSavedData ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-500" />
                Saved data loaded
              </>
            ) : (
              <>
                <FileImage size={15} className={mutedTextClass} />
                New section
              </>
            )}
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <section
            className={`overflow-hidden rounded-2xl border shadow-xl shadow-black/5 ${cardClass}`}
          >
            <div
              className={`border-b px-5 py-5 sm:px-7 ${
                isDark ? "border-[#263442]" : "border-[#e4e7ec]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#1E8A8A]/15 p-3 text-[#35B5B5]">
                  <FileImage size={21} />
                </span>

                <div>
                  <h2 className="font-semibold">Section Content</h2>
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>
                    All fields are required.
                  </p>
                </div>
              </div>
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
                "Decades of Experience, Endless Innovation",
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write your About Us description..."
                  rows={5}
                  required
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className={`mt-2 text-right text-xs ${mutedTextClass}`}>
                  {formData.description.length} characters
                </p>
              </div>
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border shadow-xl shadow-black/5 ${cardClass}`}
          >
            <div
              className={`border-b px-5 py-5 sm:px-7 ${
                isDark ? "border-[#263442]" : "border-[#e4e7ec]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#1E8A8A]/15 p-3 text-[#35B5B5]">
                  <ImagePlus size={21} />
                </span>

                <div>
                  <h2 className="font-semibold">Section Images</h2>

                  <p className={`mt-1 text-xs ${mutedTextClass}`}>
                    Upload the main image and video thumbnail, or provide image
                    URLs. Images are saved to Cloudinary.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
              {renderImageField("Main Image", "mainImage")}

              {renderImageField("Video Thumbnail", "thumbnailImage")}

              <div className="sm:col-span-2">
                <label htmlFor="videoLink" className={labelClass}>
                  YouTube Video Link <span className="text-red-400">*</span>
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
                    className={`${inputClass} pl-10`}
                    required
                    aria-describedby="videoLinkHelp"
                  />
                </div>

                <p
                  id="videoLinkHelp"
                  className={`mt-2 text-xs ${mutedTextClass}`}
                >
                  Enter a valid YouTube video URL. YouTube watch, Shorts, embed,
                  and youtu.be links are supported.
                </p>

                {formData.videoLink.trim() &&
                  isValidYouTubeUrl(formData.videoLink) && (
                    <p className="mt-2 flex items-center gap-2 text-xs text-emerald-500">
                      <CheckCircle2 size={14} />
                      Valid YouTube video link
                    </p>
                  )}
              </div>
            </div>
          </section>

          <section
            className={`overflow-hidden rounded-2xl border shadow-xl shadow-black/5 ${cardClass}`}
          >
            <div
              className={`border-b px-5 py-5 sm:px-7 ${
                isDark ? "border-[#263442]" : "border-[#e4e7ec]"
              }`}
            >
              <div>
                <h2 className="font-semibold">Client Information</h2>

                <p className={`mt-1 text-xs ${mutedTextClass}`}>
                  Enter the client details displayed in your section.
                </p>
              </div>
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
              <span className="text-red-400">*</span> All fields are required.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isSaving}
                className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${
                  isDark
                    ? "border-[#263442] text-gray-300 hover:bg-white/5"
                    : "border-[#e4e7ec] text-gray-700 hover:bg-gray-50"
                }`}
              >
                <RotateCcw size={16} />
                Reload Saved Data
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1E8A8A]/10 transition hover:bg-[#249b98] disabled:cursor-not-allowed disabled:opacity-60"
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
