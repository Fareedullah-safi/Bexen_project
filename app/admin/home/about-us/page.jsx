"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  PlayCircle,
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

const imageFields = ["mainImage", "thumbnailImage"];

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

function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

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
  const [isCloudinaryReady, setIsCloudinaryReady] = useState(false);
  const [uploadingImage, setUploadingImage] = useState("");

  const cloudinaryWidgetRef = useRef(null);
  const activeUploadRef = useRef("");

  useEffect(() => {
    function updateTheme() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let script = document.querySelector(
      'script[data-cloudinary-upload-widget="true"]',
    );

    let createdScript = false;

    function handleLoad() {
      if (window.cloudinary && window.cloudinary.createUploadWidget) {
        setIsCloudinaryReady(true);
      } else {
        toast.error("Cloudinary Upload Widget failed to initialize.");
      }
    }

    function handleError() {
      toast.error("Could not load the Cloudinary Upload Widget.");
    }

    if (window.cloudinary && window.cloudinary.createUploadWidget) {
      setIsCloudinaryReady(true);
      return;
    }

    if (!script) {
      script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.dataset.cloudinaryUploadWidget = "true";
      createdScript = true;
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (createdScript) {
      document.head.appendChild(script);
    }

    return function () {
      if (script) {
        script.removeEventListener("load", handleLoad);
        script.removeEventListener("error", handleError);
      }
    };
  }, []);

  async function loadData() {
    setIsFetching(true);
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

      fields.forEach(function (field) {
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

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    const name = event.target.name;
    const value = event.target.value;

    if (fields.includes(name)) {
      setFormData(function (prev) {
        return {
          ...prev,
          [name]: {
            ...prev[name],
            [language]: value,
          },
        };
      });
    } else {
      setFormData(function (prev) {
        return {
          ...prev,
          [name]: value,
        };
      });
    }
  }

  function handleRichTextChange(name, value) {
    setFormData(function (prev) {
      return {
        ...prev,
        [name]: {
          ...prev[name],
          [language]: value,
        },
      };
    });
  }

  function getMissingFieldsForLanguage(languageCode) {
    return fields.filter(function (field) {
      const value = formData[field] ? formData[field][languageCode] : "";
      return !stripHtml(value);
    });
  }

  function isLanguageComplete(languageCode) {
    return getMissingFieldsForLanguage(languageCode).length === 0;
  }

  function getFieldLabel(field) {
    return field.replace(/([A-Z])/g, " $1").replace(/^./, function (character) {
      return character.toUpperCase();
    });
  }

  async function openCloudinaryWidget(field) {
    if (isSaving || uploadingImage) return;

    if (
      !isCloudinaryReady ||
      !window.cloudinary ||
      !window.cloudinary.createUploadWidget
    ) {
      toast.error("Cloudinary is still loading. Please try again.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error(
        "Cloudinary configuration is missing. Check your environment variables.",
      );
      return;
    }

    setUploadingImage(field);
    activeUploadRef.current = field;

    const allowed = await verifyUploadPermission();

    if (!allowed) {
      setUploadingImage("");
      activeUploadRef.current = "";
      toast.error("You don't have permission to upload images.");
      return;
    }

    try {
      if (cloudinaryWidgetRef.current) {
        cloudinaryWidgetRef.current.close();
        cloudinaryWidgetRef.current = null;
      }

      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          multiple: false,
          maxFileSize: 5 * 1024 * 1024,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          folder: "bexon/images",
          cropping: false,
          showAdvancedOptions: false,
          showCompletedButton: true,
          resourceType: "image",
          styles: cloudinaryStyles(isDark ? "dark" : "light"),
        },
        function (error, result) {
          if (error) {
            console.error("Cloudinary Widget Error:", error);
            toast.error(error.message || "Cloudinary image upload failed.");
            setUploadingImage("");
            activeUploadRef.current = "";
            cloudinaryWidgetRef.current = null;
            return;
          }

          if (!result) return;

          if (result.event === "success") {
            const uploaded = result.info;
            const targetField = activeUploadRef.current || field;

            if (!uploaded || !uploaded.secure_url || !uploaded.public_id) {
              toast.error("Cloudinary did not return a valid image.");
              return;
            }

            setFormData(function (prev) {
              return {
                ...prev,
                [targetField]: uploaded.secure_url,
              };
            });

            setImageIds(function (prev) {
              return {
                ...prev,
                [targetField]: uploaded.public_id,
              };
            });

            setPreviews(function (prev) {
              return {
                ...prev,
                [targetField]: uploaded.secure_url,
              };
            });

            setImageErrors(function (prev) {
              return {
                ...prev,
                [targetField]: false,
              };
            });

            toast.success(
              targetField === "mainImage"
                ? "Main image uploaded to Cloudinary."
                : "Video thumbnail uploaded to Cloudinary.",
            );
          }

          if (result.event === "close" || result.event === "abort") {
            setUploadingImage("");
            activeUploadRef.current = "";
            cloudinaryWidgetRef.current = null;
          }
        },
      );

      cloudinaryWidgetRef.current = widget;
      widget.open();
    } catch (error) {
      console.error("Cloudinary Widget Initialization Error:", error);
      toast.error("Could not open the Cloudinary Upload Widget.");
      setUploadingImage("");
      activeUploadRef.current = "";
      cloudinaryWidgetRef.current = null;
    }
  }

  function removeImage(field) {
    setFormData(function (prev) {
      return { ...prev, [field]: "" };
    });
    setPreviews(function (prev) {
      return { ...prev, [field]: "" };
    });
    setImageIds(function (prev) {
      return { ...prev, [field]: "" };
    });
    setImageErrors(function (prev) {
      return { ...prev, [field]: false };
    });
  }

  function validateForm() {
    for (let i = 0; i < languages.length; i += 1) {
      const item = languages[i];
      const missingFields = getMissingFieldsForLanguage(item.code);

      if (missingFields.length > 0) {
        const firstMissingField = getFieldLabel(missingFields[0]);

        toast.error(`${firstMissingField} is required in ${item.label}.`, {
          description: `${missingFields.length} translated field(s) still need content in ${item.label}.`,
        });

        setLanguage(item.code);
        return false;
      }
    }

    if (
      typeof formData.buttonLink !== "string" ||
      !formData.buttonLink.trim()
    ) {
      toast.error("Button Link is required.");
      return false;
    }

    const buttonLink = formData.buttonLink.trim();

    if (!buttonLink.startsWith("/") || buttonLink.startsWith("//")) {
      toast.error(
        "Button Link must be a valid internal path starting with '/'.",
      );
      return false;
    }

    if (typeof formData.videoLink !== "string" || !formData.videoLink.trim()) {
      toast.error("YouTube Video Link is required.");
      return false;
    }

    try {
      const url = new URL(formData.videoLink.trim());

      const validHosts = [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
      ];

      if (
        (url.protocol !== "http:" && url.protocol !== "https:") ||
        !validHosts.includes(url.hostname)
      ) {
        throw new Error("Invalid YouTube URL");
      }
    } catch (err) {
      toast.error("Enter a valid YouTube URL.");
      return false;
    }

    for (let j = 0; j < imageFields.length; j += 1) {
      const field = imageFields[j];
      const value = formData[field];
      const publicId = imageIds[field];

      if (!value || typeof value !== "string" || !value.trim()) {
        toast.error(
          field === "mainImage"
            ? "Main Image is required. Upload it using Cloudinary."
            : "Video Thumbnail is required. Upload it using Cloudinary.",
        );

        return false;
      }

      try {
        const imageUrl = new URL(value.trim());

        if (
          imageUrl.protocol !== "https:" ||
          imageUrl.hostname !== "res.cloudinary.com"
        ) {
          throw new Error("Image must be hosted on Cloudinary.");
        }
      } catch (err) {
        toast.error(
          `${getFieldLabel(field)} must be a valid Cloudinary image URL.`,
        );
        return false;
      }

      if (!publicId || typeof publicId !== "string") {
        toast.error(
          `${getFieldLabel(field)} is missing its Cloudinary public ID. Please upload the image again.`,
        );
        return false;
      }
    }

    return true;
  }

  async function handleSave(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    if (isSaving || uploadingImage || !validateForm()) return;

    setIsSaving(true);

    try {
      const payload = {
        ...Object.fromEntries(
          fields.map(function (field) {
            return [field, formData[field]];
          }),
        ),
        buttonLink: formData.buttonLink.trim(),
        videoLink: formData.videoLink.trim(),
        mainImage: {
          url: formData.mainImage.trim(),
          publicId: imageIds.mainImage,
        },
        thumbnailImage: {
          url: formData.thumbnailImage.trim(),
          publicId: imageIds.thumbnailImage,
        },
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

      setFormData(function (prev) {
        return {
          ...prev,
          ...saved,
          mainImage: saved.mainImage?.url || payload.mainImage.url,
          thumbnailImage:
            saved.thumbnailImage?.url || payload.thumbnailImage.url,
        };
      });

      setImageIds({
        mainImage: saved.mainImage?.publicId || payload.mainImage.publicId,
        thumbnailImage:
          saved.thumbnailImage?.publicId || payload.thumbnailImage.publicId,
      });

      setPreviews({
        mainImage: saved.mainImage?.url || payload.mainImage.url,
        thumbnailImage: saved.thumbnailImage?.url || payload.thumbnailImage.url,
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
    const isTranslatedField = fields.includes(name);

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
            isTranslatedField
              ? formData[name]?.[language] || ""
              : formData[name] || ""
          }
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClass}
          dir={isTranslatedField ? (language === "en" ? "ltr" : "rtl") : "ltr"}
        />
      </div>
    );
  }

  function renderRichInput(label, name, placeholder) {
    return (
      <div key={name}>
        <label htmlFor={name} className={labelClass}>
          {label} <span className="text-red-400">*</span>
        </label>
        <div
          className={`overflow-hidden rounded-xl border ${
            isDark ? "border-[#263442]" : "border-[#e4e7ec]"
          }`}
        >
          <RichTextEditor
            key={name + "-" + language}
            value={formData[name]?.[language] || ""}
            onChange={function (val) {
              handleRichTextChange(name, val);
            }}
            placeholder={placeholder}
            dir={language === "en" ? "ltr" : "rtl"}
          />
        </div>
      </div>
    );
  }

  function renderImageField(label, field) {
    const isUploading = uploadingImage === field;

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
                  onError={function () {
                    setImageErrors(function (prev) {
                      return { ...prev, [field]: true };
                    });
                  }}
                  onLoad={function () {
                    setImageErrors(function (prev) {
                      return { ...prev, [field]: false };
                    });
                  }}
                />
              )}
            </div>

            <button
              type="button"
              onClick={function () {
                removeImage(field);
              }}
              disabled={isSaving || Boolean(uploadingImage)}
              className="absolute top-5 right-5 rounded-lg bg-red-500 p-2 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div
            className={`flex h-52 flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center ${
              isDark
                ? "border-[#263442] bg-[#16212c]"
                : "border-[#d0d5dd] bg-[#f8fafc]"
            }`}
          >
            <span className="mb-3 rounded-xl bg-[#1E8A8A]/15 p-4 text-[#35B5B5]">
              {isUploading ? (
                <LoaderCircle size={27} className="animate-spin" />
              ) : (
                <ImagePlus size={27} />
              )}
            </span>

            <span className="text-sm font-medium">
              {isUploading ? "Uploading..." : `Upload ${label}`}
            </span>

            <span className={`mt-2 text-xs ${mutedTextClass}`}>
              JPG, PNG or WEBP · Maximum 5 MB
            </span>

            <button
              type="button"
              onClick={function () {
                openCloudinaryWidget(field);
              }}
              disabled={
                !isCloudinaryReady || isSaving || Boolean(uploadingImage)
              }
              className="mt-3 rounded-lg bg-[#1E8A8A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#249b98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading
                ? "Uploading..."
                : isCloudinaryReady
                  ? "Choose Image"
                  : "Loading Cloudinary..."}
            </button>
          </div>
        )}

        <p className={`mt-2 text-xs ${mutedTextClass}`}>
          Images are uploaded directly to Cloudinary.
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
    <div className={`min-h-screen w-full p-2 pb-28 ${pageClass}`}>
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

          <div className="flex items-center gap-3">
            <div className="min-w-0 sm:min-w-[320px]">
              <label className={`${labelClass} mb-3`}>Content Language</label>

              <div
                className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[#1E8A8A]/20 bg-[#1E8A8A]/5 p-1.5 shadow-sm"
                role="group"
                aria-label="Content language"
              >
                {languages.map(function (item) {
                  const isActive = language === item.code;
                  const isComplete = isLanguageComplete(item.code);
                  const missingCount = getMissingFieldsForLanguage(
                    item.code,
                  ).length;

                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={function () {
                        setLanguage(item.code);
                      }}
                      disabled={isSaving || Boolean(uploadingImage)}
                      aria-pressed={isActive}
                      aria-label={`${item.label}: ${
                        isComplete
                          ? "all translated fields complete"
                          : `${missingCount} translated fields missing`
                      }`}
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

                      <span
                        className={`h-2 w-2 rounded-full ${
                          isComplete ? "bg-emerald-400" : "bg-red-400"
                        }`}
                        title={
                          isComplete
                            ? `${item.label} is complete`
                            : `${missingCount} translated fields missing`
                        }
                      />

                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <AdminLanguageBall
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </header>

        <form onSubmit={handleSave} noValidate className="space-y-6">
          <section
            className={`overflow-hidden rounded-2xl border shadow-xl ${cardClass}`}
          >
            <div className="border-b border-[var(--border)] px-5 py-5 sm:px-7">
              <h2 className="font-semibold">Section Content</h2>

              <p className={`mt-1 text-xs ${mutedTextClass}`}>
                Editing:{" "}
                {
                  languages.find(function (item) {
                    return item.code === language;
                  })?.label
                }
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {renderRichInput("Experience Number", "experienceNumber", "13+")}

              {renderRichInput(
                "Experience Label",
                "experienceLabel",
                "Years of Experience",
              )}

              {renderRichInput(
                "Experience Text",
                "experienceText",
                "Our experience",
              )}

              {renderRichInput(
                "Section Label",
                "sectionLabel",
                "Get to Know Us",
              )}

              {renderRichInput("Title", "title", "Enter section title")}

              {renderInput("Button Text", "buttonText", "Learn More")}

              {renderInput("Button Link", "buttonLink", "/about")}

              <div className="sm:col-span-2">
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-red-400">*</span>
                </label>

                <div
                  className={`overflow-hidden rounded-xl border ${
                    isDark ? "border-[#263442]" : "border-[#e4e7ec]"
                  }`}
                >
                  <RichTextEditor
                    key={"description-" + language}
                    value={formData.description?.[language] || ""}
                    onChange={function (val) {
                      handleRichTextChange("description", val);
                    }}
                    placeholder="Write your About Us description..."
                    dir={language === "en" ? "ltr" : "rtl"}
                  />
                </div>

                <p className={`mt-2 text-right text-xs ${mutedTextClass}`}>
                  {stripHtml(formData.description?.[language] || "").length}{" "}
                  characters
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
                    className={`${inputClass} pl-10`}
                    dir="ltr"
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
              {renderRichInput(
                "Client Name",
                "clientName",
                "Enter client name",
              )}

              {renderRichInput(
                "Client Role",
                "clientRole",
                "Enter client role",
              )}
            </div>
          </section>

          <AdminStickyFooter
            onReload={loadData}
            onSave={handleSave}
            saving={isSaving}
            busy={isSaving || Boolean(uploadingImage)}
            saveLabel="Save Changes"
            savingLabel="Saving Changes..."
          />
        </form>
      </div>
    </div>
  );
}
