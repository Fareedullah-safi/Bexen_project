"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Image as ImageIcon,
  Layout,
  Link as LinkIcon,
  Plus,
  Save,
  Text,
  Trash2,
  Type,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/servicespage/services-details";
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyTranslation = () => ({
  mainTitle: "",
  highlightedTitle: "",
  description1: "",
  description2: "",
  description3: "",
  sidebarTag: "",
  sidebarTitle: "",
});

const emptyData = () => ({
  heroImage: { url: "", publicId: "" },
  translations: {
    en: emptyTranslation(),
    ps: emptyTranslation(),
    fa: emptyTranslation(),
  },
  services: [],
});

const initializeErrors = () => ({
  shared: { heroImage: null, services: [] },
  en: { services: [] },
  ps: { services: [] },
  fa: { services: [] },
});

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100";
const inputErrorClass =
  "w-full rounded-xl border border-red-400 bg-white px-3 py-2.5 text-sm outline-none focus:border-red-500 dark:border-red-500/80 dark:bg-[#16212c] dark:text-gray-100";
const sectionClass =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]";

const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
};

export default function ServiceDetailsAdmin() {
  const [data, setData] = useState(emptyData());
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState(initializeErrors());

  const fileInputRef = useRef(null);
  const inputDirection = language === "en" ? "ltr" : "rtl";

  // --- DATA LOADING ---
  useEffect(() => {
    async function loadData() {
      try {
        const response = await axios.get(API);
        if (response.data?.success && response.data?.data) {
          const fetched = response.data.data;
          setData({
            heroImage: fetched.heroImage || { url: "", publicId: "" },
            translations: {
              en: { ...emptyTranslation(), ...fetched.translations?.en },
              ps: { ...emptyTranslation(), ...fetched.translations?.ps },
              fa: { ...emptyTranslation(), ...fetched.translations?.fa },
            },
            services: fetched.services || [],
          });
        }
      } catch (error) {
        toast.error("Failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- CLOUDINARY DIRECT REST UPLOAD ---
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary environment variables are missing.");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
      );

      if (res.data?.secure_url) {
        setData((prev) => ({
          ...prev,
          heroImage: {
            url: res.data.secure_url,
            publicId: res.data.public_id || "",
          },
        }));
        setErrors((prev) => ({
          ...prev,
          shared: { ...prev.shared, heroImage: null },
        }));
        toast.success("Image uploaded successfully.");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Failed to upload image.",
      );
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- HANDLERS ---
  const changeLanguage = (code) => {
    setLanguage(code);
    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  };

  const handleTranslationChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: { ...prev.translations[language], [name]: value },
      },
    }));
    setErrors((prev) => ({
      ...prev,
      [language]: { ...prev[language], [name]: null },
    }));
  };

  // --- SERVICES HANDLERS ---
  const addService = () => {
    setData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          id: crypto.randomUUID(),
          href: "/service-details",
          translations: {
            en: { label: "" },
            ps: { label: "" },
            fa: { label: "" },
          },
        },
      ],
    }));
  };

  const removeService = (index) => {
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleServiceChange = (index, field, value, isShared = false) => {
    setData((prev) => {
      const newServices = [...prev.services];
      if (isShared) {
        newServices[index][field] = value;
      } else {
        newServices[index].translations[language][field] = value;
      }
      return { ...prev, services: newServices };
    });

    setErrors((prev) => {
      const next = { ...prev };
      if (isShared) next.shared.services[index] = null;
      else if (next[language]?.services?.[index])
        next[language].services[index] = null;
      return next;
    });
  };

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = initializeErrors();
    let isValid = true;
    let firstErrorLanguage = null;

    if (!data.heroImage.url) {
      newErrors.shared.heroImage = "Hero Image is required.";
      isValid = false;
    }

    data.services.forEach((svc, i) => {
      const link = String(svc.href || "").trim();
      if (!link.startsWith("/") || link.startsWith("//") || /\s/.test(link)) {
        newErrors.shared.services[i] =
          "Link must start with '/' (e.g., /service-details)";
        isValid = false;
      }
    });

    const textFields = [
      "mainTitle",
      "highlightedTitle",
      "description1",
      "description2",
      "description3",
      "sidebarTag",
      "sidebarTitle",
    ];

    LANGUAGES.forEach((lang) => {
      const trans = data.translations[lang.code];

      textFields.forEach((field) => {
        if (!String(trans[field] || "").trim()) {
          newErrors[lang.code][field] = "This field cannot be empty.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
      });

      data.services.forEach((svc, i) => {
        if (!String(svc.translations[lang.code]?.label || "").trim()) {
          newErrors[lang.code].services[i] = "Service label required.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
      });
    });

    setErrors(newErrors);

    if (!isValid) {
      if (firstErrorLanguage && firstErrorLanguage !== language) {
        setLanguage(firstErrorLanguage);
        toast.error(
          `Please fix missing fields in ${
            LANGUAGES.find((l) => l.code === firstErrorLanguage)?.label
          }.`,
        );
      } else {
        toast.error("Please fill in all highlighted fields.");
      }
    }
    return isValid;
  };

  // --- SAVE ---
  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        ...data,
        services: data.services.map((s) => ({
          ...s,
          href: String(s.href || "").trim(),
        })),
      };
      const response = await axios.post(API, payload);
      if (!response.data?.success) throw new Error("Failed to save");
      toast.success("Service Details updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to save data.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  const currentT = data.translations[language];
  const currentE = errors[language];

  const hasLanguageErrors = (code) => {
    const errs = errors[code];
    return (
      Object.keys(errs).some((k) => k !== "services" && errs[k]) ||
      errs.services?.some(Boolean)
    );
  };

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] pb-24 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        id="hero-image-upload-input"
      />

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <Layout size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Service Details</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage hero image, text, and sidebar links.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 dark:border-[#263442] dark:bg-[#111a23]">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeLanguage(item.code)}
                className={`relative rounded-lg px-3 py-2 text-xs font-semibold ${
                  language === item.code
                    ? "bg-[#1e8a8a] text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#16212c]"
                }`}
              >
                {item.label}
                {hasLanguageErrors(item.code) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            ))}
          </div>
          <AdminLanguageBall
            language={language}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>

      {/* HERO IMAGE */}
      <section className={sectionClass}>
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <ImageIcon size={18} className="text-[#1e8a8a]" /> Hero Image
        </h2>
        <div
          className={`overflow-hidden rounded-xl border ${
            errors.shared.heroImage
              ? "border-red-400 bg-red-50/50 dark:border-red-500/50"
              : "border-gray-200 dark:border-[#263442]"
          }`}
        >
          {data.heroImage.url ? (
            <div className="relative h-64 w-full bg-gray-100 dark:bg-gray-800">
              <Image
                src={data.heroImage.url}
                alt="Hero"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/40 opacity-0 transition-opacity hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-md transition hover:bg-gray-100 disabled:opacity-50"
                >
                  {uploadingImage ? "Uploading..." : "Change Image"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      heroImage: { url: "", publicId: "" },
                    }))
                  }
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <UploadCloud size={40} className="mb-3 text-gray-400" />
              <p className="mb-4 text-sm text-gray-500">
                Upload the main service presentation image (PNG, JPG, WEBP, max
                5MB).
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className="rounded-lg bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#167575] disabled:opacity-50"
              >
                {uploadingImage ? "Uploading..." : "Choose Image"}
              </button>
            </div>
          )}
        </div>
        <FieldError message={errors.shared.heroImage} />
      </section>

      {/* MAIN TEXT */}
      <section className={sectionClass}>
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Text size={18} className="text-[#1e8a8a]" /> Presentation Text
        </h2>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Main Title
              </label>
              <input
                dir={inputDirection}
                name="mainTitle"
                value={currentT.mainTitle}
                onChange={handleTranslationChange}
                placeholder="e.g. Transforming Customer:"
                className={currentE.mainTitle ? inputErrorClass : inputClass}
              />
              <FieldError message={currentE.mainTitle} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Highlighted Title
              </label>
              <input
                dir={inputDirection}
                name="highlightedTitle"
                value={currentT.highlightedTitle}
                onChange={handleTranslationChange}
                placeholder="e.g. Tailored Solutions for Experiences."
                className={
                  currentE.highlightedTitle ? inputErrorClass : inputClass
                }
              />
              <FieldError message={currentE.highlightedTitle} />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Paragraph 1
            </label>
            <textarea
              dir={inputDirection}
              name="description1"
              rows="2"
              value={currentT.description1}
              onChange={handleTranslationChange}
              className={currentE.description1 ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.description1} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Paragraph 2
            </label>
            <textarea
              dir={inputDirection}
              name="description2"
              rows="2"
              value={currentT.description2}
              onChange={handleTranslationChange}
              className={currentE.description2 ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.description2} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Paragraph 3
            </label>
            <textarea
              dir={inputDirection}
              name="description3"
              rows="2"
              value={currentT.description3}
              onChange={handleTranslationChange}
              className={currentE.description3 ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.description3} />
          </div>
        </div>
      </section>

      {/* SIDEBAR */}
      <section className={sectionClass}>
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Layout size={18} className="text-[#1e8a8a]" /> Sidebar Info
        </h2>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Sidebar Tag
            </label>
            <input
              dir={inputDirection}
              name="sidebarTag"
              value={currentT.sidebarTag}
              onChange={handleTranslationChange}
              placeholder="e.g. SERVICES"
              className={currentE.sidebarTag ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.sidebarTag} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Sidebar Title
            </label>
            <input
              dir={inputDirection}
              name="sidebarTitle"
              value={currentT.sidebarTitle}
              onChange={handleTranslationChange}
              placeholder="e.g. More services"
              className={currentE.sidebarTitle ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.sidebarTitle} />
          </div>
        </div>

        <div className="mt-8 mb-4 flex items-center justify-between border-t pt-6 dark:border-[#263442]">
          <h3 className="font-bold">More Services Links</h3>
          <button
            type="button"
            onClick={addService}
            className="flex items-center gap-1 rounded-lg bg-[#e7f5f5] px-3 py-1.5 text-xs font-semibold text-[#1e8a8a] transition hover:bg-[#d4f0f0]"
          >
            <Plus size={14} /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {data.services.map((svc, i) => (
            <div
              key={svc.id}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 sm:flex-row sm:items-center dark:border-[#1e2a35] dark:bg-[#111a23]/50"
            >
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <Type size={12} /> Label
                </div>
                <input
                  dir={inputDirection}
                  value={svc.translations[language]?.label || ""}
                  onChange={(e) =>
                    handleServiceChange(i, "label", e.target.value, false)
                  }
                  placeholder="e.g. Customer Experience"
                  className={
                    currentE.services?.[i] ? inputErrorClass : inputClass
                  }
                />
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <LinkIcon size={12} /> Link (URL)
                </div>
                <input
                  dir="ltr"
                  value={svc.href}
                  onChange={(e) =>
                    handleServiceChange(i, "href", e.target.value, true)
                  }
                  placeholder="/service-details"
                  className={
                    errors.shared.services[i] ? inputErrorClass : inputClass
                  }
                />
                <FieldError message={errors.shared.services[i]} />
              </div>
              <button
                type="button"
                onClick={() => removeService(i)}
                className="mt-6 p-2 text-gray-400 hover:text-red-500 sm:mt-0"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* STICKY SAVE BAR */}
      <div className="sticky bottom-4 z-40 mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white/90 px-5 py-4 shadow-lg backdrop-blur dark:border-[#263442] dark:bg-[#111a23]/90">
        <div className="hidden items-center gap-3 sm:flex">
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Editing:{" "}
              <span className="text-[#1e8a8a]">
                {LANGUAGES.find((item) => item.code === language)?.label}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Validate all languages before saving.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || uploadingImage}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Details"}
        </button>
      </div>
    </div>
  );
}
