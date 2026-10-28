"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  AlertCircle,
  BarChart,
  Box,
  CheckCircle2,
  ChevronRight,
  Eye,
  ImagePlus,
  Link as LinkIcon,
  Save,
  Target,
  Type,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/aboutpage/mission-vision";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const sectionClass =
  "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-[#263442] dark:bg-[#111a23]";

// Helper function for dynamic input classes (Red border if error exists)
const getInputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition-colors dark:bg-[#16212c] dark:text-gray-100 ${
    hasError
      ? "border-red-400 focus:border-red-500 dark:border-red-500/80"
      : "border-gray-200 focus:border-[#1e8a8a] dark:border-[#263442]"
  }`;

// Component to show error text under inputs
const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
};

// --- DATA STRUCTURES ---
const emptyTranslation = () => ({
  topTag: "CHOOSE THE BEST",
  mainTitle:
    "Driving Innovation and Excellence for Sustainable Corporate Success",
  highlightedTitle: "Worldwide.",
  buttonText: "Learn More About Us",

  progressTitle: "Business Progress",
  progressLabel1: "Revenue",
  progressLabel2: "Satisfaction",

  missionTitle: "Our Mission",
  missionDesc:
    "Our mission is to empower businesses through innovative best solutions, exceptional service.",
  missionList: [
    "Innovation & Excellence",
    "Exceptional Customer",
    "Business Growth",
  ],

  visionTitle: "Our Vision",
  visionDesc:
    "Our vision is to become a global leader in providing transformative business solutions.",
  visionList: [
    "Global Leadership",
    "Transformative Impact",
    "Sustainable Success",
  ],
});

const emptyData = () => ({
  image: "",
  publicId: "",
  buttonLink: "/about",
  progressValue1: 82,
  progressValue2: 90,
  translations: {
    en: emptyTranslation(),
    ps: emptyTranslation(),
    fa: emptyTranslation(),
  },
});

export default function AboutSectionAdmin() {
  const [data, setData] = useState(emptyData);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  // Error tracking state
  const [errors, setErrors] = useState({ shared: {}, en: {}, ps: {}, fa: {} });

  const widgetRef = useRef(null);
  const inputDirection = language === "en" ? "ltr" : "rtl";

  // --- DATA LOADING ---
  useEffect(() => {
    async function loadData() {
      try {
        const response = await axios.get(API);
        if (response.data?.success && response.data?.data) {
          setData({
            ...emptyData(),
            ...response.data.data,
            translations: {
              en: {
                ...emptyTranslation(),
                ...response.data.data.translations?.en,
              },
              ps: {
                ...emptyTranslation(),
                ...response.data.data.translations?.ps,
              },
              fa: {
                ...emptyTranslation(),
                ...response.data.data.translations?.fa,
              },
            },
          });
        }
      } catch (error) {
        toast.error("Failed to load section data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- HANDLERS & ERROR CLEARING ---
  function changeLanguage(code) {
    if (!LANGUAGES.some((item) => item.code === code)) return;
    setLanguage(code);
    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}
  }

  function handleRootChange(e) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    // Clear error as user types
    setErrors((prev) => ({
      ...prev,
      shared: { ...prev.shared, [name]: null },
    }));
  }

  function handleTranslationChange(e) {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: { ...prev.translations[language], [name]: value },
      },
    }));
    // Clear error as user types
    setErrors((prev) => ({
      ...prev,
      [language]: { ...prev[language], [name]: null },
    }));
  }

  function handleListChange(listName, index, value) {
    setData((prev) => {
      const newList = [...prev.translations[language][listName]];
      newList[index] = value;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [language]: { ...prev.translations[language], [listName]: newList },
        },
      };
    });
    // Clear error for specific array item
    setErrors((prev) => ({
      ...prev,
      [language]: { ...prev[language], [`${listName}_${index}`]: null },
    }));
  }

  // --- IMAGE UPLOAD ---
  function uploadImage() {
    if (!cloudinaryReady || !window.cloudinary)
      return toast.error("Uploader not ready.");
    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: "bexon/about",
          multiple: false,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        },
        (error, result) => {
          if (error) return toast.error("Upload failed.");
          if (result?.event === "success") {
            setData((prev) => ({
              ...prev,
              image: result.info.secure_url,
              publicId: result.info.public_id || "",
            }));
            setErrors((prev) => ({
              ...prev,
              shared: { ...prev.shared, image: null },
            }));
            toast.success("Image uploaded!");
          }
        },
      );
    }
    widgetRef.current.open();
  }

  // --- STRUCTURED VALIDATION ---
  function validateForm() {
    const newErrors = { shared: {}, en: {}, ps: {}, fa: {} };
    let isValid = true;
    let firstErrorLanguage = null;

    // 1. Validate Shared Fields (Link & Image & Numbers)
    if (!data.image) {
      newErrors.shared.image = "Main image is required.";
      isValid = false;
    }

    const link = (data.buttonLink || "").trim();
    if (
      !link ||
      !link.startsWith("/") ||
      link.startsWith("//") ||
      link.includes(" ")
    ) {
      newErrors.shared.buttonLink =
        "Must start with a single '/' (e.g., /about)";
      isValid = false;
    }

    if (data.progressValue1 === "" || data.progressValue1 === null) {
      newErrors.shared.progressValue1 = "Required";
      isValid = false;
    }
    if (data.progressValue2 === "" || data.progressValue2 === null) {
      newErrors.shared.progressValue2 = "Required";
      isValid = false;
    }

    // 2. Validate Text Fields for ALL Languages
    const textFields = [
      "topTag",
      "mainTitle",
      "highlightedTitle",
      "buttonText",
      "progressTitle",
      "progressLabel1",
      "progressLabel2",
      "missionTitle",
      "missionDesc",
      "visionTitle",
      "visionDesc",
    ];

    for (const lang of LANGUAGES) {
      const trans = data.translations[lang.code];

      // Standard text strings
      for (const field of textFields) {
        if (!trans[field]?.trim()) {
          newErrors[lang.code][field] = "This field cannot be empty.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
      }

      // Arrays (Mission / Vision Bullet Points)
      for (let i = 0; i < 3; i++) {
        if (!trans.missionList[i]?.trim()) {
          newErrors[lang.code][`missionList_${i}`] = "Required";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
        if (!trans.visionList[i]?.trim()) {
          newErrors[lang.code][`visionList_${i}`] = "Required";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      if (firstErrorLanguage && firstErrorLanguage !== language) {
        setLanguage(firstErrorLanguage);
        const langName = LANGUAGES.find(
          (l) => l.code === firstErrorLanguage,
        )?.label;
        toast.error(`Please fix missing fields in ${langName}.`, {
          icon: "⚠️",
        });
      } else {
        toast.error("Please fill in all highlighted fields.", { icon: "⚠️" });
      }
    }

    return isValid;
  }

  // --- SAVE ---
  async function handleSave() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = { ...data, buttonLink: data.buttonLink.trim() };
      const response = await axios.post(API, payload);
      if (!response.data?.success) throw new Error("Failed to save");
      toast.success("Section updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to save section.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  const currentT = data.translations[language];
  const currentE = errors[language];

  return (
    <div className="relative min-h-screen space-y-6 bg-[#f7f9fc] pb-24 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        onLoad={() => setCloudinaryReady(true)}
      />

      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <Box size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">About Section</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage company presentation, mission, and vision cards.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-[#263442] dark:bg-[#111a23]">
            {LANGUAGES.map((item) => (
              <button
                key={item.code}
                onClick={() => changeLanguage(item.code)}
                className={`relative rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  language === item.code
                    ? "bg-[#1e8a8a] text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-[#16212c]"
                }`}
              >
                {item.label}
                {/* Tiny red dot if this language has hidden errors */}
                {Object.keys(errors[item.code]).some(
                  (k) => errors[item.code][k],
                ) && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
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

      {/* --- MEDIA & HEADINGS --- */}
      <section className={sectionClass}>
        <h2 className="mb-5 flex items-center gap-2 border-b pb-3 text-lg font-bold dark:border-gray-800">
          <Type size={18} className="text-[#1e8a8a]" /> Media & Headings
        </h2>

        <div className="grid gap-6 sm:grid-cols-12">
          {/* Image */}
          <div className="space-y-3 sm:col-span-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Main Image
            </label>
            {data.image ? (
              <img
                src={data.image}
                alt="Preview"
                className={`h-48 w-full rounded-xl border object-cover shadow-sm ${errors.shared.image ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              />
            ) : (
              <div
                className={`flex h-48 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50 dark:bg-gray-800 ${errors.shared.image ? "border-red-400 text-red-400" : "border-gray-300 dark:border-gray-700"}`}
              >
                <ImagePlus
                  size={24}
                  className={
                    errors.shared.image ? "text-red-400" : "text-gray-400"
                  }
                />
                <span className="text-sm">No image uploaded</span>
              </div>
            )}
            <FieldError message={errors.shared.image} />
            <button
              onClick={uploadImage}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] transition-all hover:bg-[#1e8a8a] hover:text-white"
            >
              <ImagePlus size={16} /> Replace Image
            </button>
          </div>

          {/* Texts */}
          <div className="space-y-5 sm:col-span-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Top Tagline
              </label>
              <input
                dir={inputDirection}
                name="topTag"
                value={currentT.topTag}
                onChange={handleTranslationChange}
                className={getInputClass(currentE.topTag)}
              />
              <FieldError message={currentE.topTag} />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Main Title
                </label>
                <textarea
                  dir={inputDirection}
                  name="mainTitle"
                  value={currentT.mainTitle}
                  onChange={handleTranslationChange}
                  rows="2"
                  className={getInputClass(currentE.mainTitle)}
                />
                <FieldError message={currentE.mainTitle} />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Highlighted Word
                </label>
                <input
                  dir={inputDirection}
                  name="highlightedTitle"
                  value={currentT.highlightedTitle}
                  onChange={handleTranslationChange}
                  className={getInputClass(currentE.highlightedTitle)}
                />
                <FieldError message={currentE.highlightedTitle} />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <ChevronRight size={16} className="text-gray-400" /> Button
                  Text
                </label>
                <input
                  dir={inputDirection}
                  name="buttonText"
                  value={currentT.buttonText}
                  onChange={handleTranslationChange}
                  className={getInputClass(currentE.buttonText)}
                />
                <FieldError message={currentE.buttonText} />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <LinkIcon size={16} className="text-gray-400" /> Button Link
                </label>
                <input
                  dir="ltr"
                  name="buttonLink"
                  value={data.buttonLink}
                  onChange={handleRootChange}
                  placeholder="/about"
                  className={getInputClass(errors.shared.buttonLink)}
                />
                <FieldError message={errors.shared.buttonLink} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- PROGRESS WIDGET --- */}
      <section className={sectionClass}>
        <h2 className="mb-5 flex items-center gap-2 border-b pb-3 text-lg font-bold dark:border-gray-800">
          <BarChart size={18} className="text-[#1e8a8a]" /> Floating Progress
          Widget
        </h2>
        <div className="grid gap-5 sm:grid-cols-5">
          <div className="sm:col-span-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Widget Title
            </label>
            <input
              dir={inputDirection}
              name="progressTitle"
              value={currentT.progressTitle}
              onChange={handleTranslationChange}
              className={getInputClass(currentE.progressTitle)}
            />
            <FieldError message={currentE.progressTitle} />
          </div>

          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress 1 Label
            </label>
            <input
              dir={inputDirection}
              name="progressLabel1"
              value={currentT.progressLabel1}
              onChange={handleTranslationChange}
              className={getInputClass(currentE.progressLabel1)}
            />
            <FieldError message={currentE.progressLabel1} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress 1 Value (%)
            </label>
            <input
              type="number"
              dir="ltr"
              name="progressValue1"
              value={data.progressValue1}
              onChange={handleRootChange}
              className={getInputClass(errors.shared.progressValue1)}
            />
            <FieldError message={errors.shared.progressValue1} />
          </div>

          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress 2 Label
            </label>
            <input
              dir={inputDirection}
              name="progressLabel2"
              value={currentT.progressLabel2}
              onChange={handleTranslationChange}
              className={getInputClass(currentE.progressLabel2)}
            />
            <FieldError message={currentE.progressLabel2} />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress 2 Value (%)
            </label>
            <input
              type="number"
              dir="ltr"
              name="progressValue2"
              value={data.progressValue2}
              onChange={handleRootChange}
              className={getInputClass(errors.shared.progressValue2)}
            />
            <FieldError message={errors.shared.progressValue2} />
          </div>
        </div>
      </section>

      {/* --- MISSION & VISION CARDS --- */}
      <div className="grid gap-6 sm:grid-cols-2">
        <section className={sectionClass}>
          <h2 className="mb-5 flex items-center gap-2 border-b pb-3 text-lg font-bold dark:border-gray-800">
            <Target size={18} className="text-[#1e8a8a]" /> Mission Card
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                dir={inputDirection}
                name="missionTitle"
                value={currentT.missionTitle}
                onChange={handleTranslationChange}
                className={getInputClass(currentE.missionTitle)}
              />
              <FieldError message={currentE.missionTitle} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                dir={inputDirection}
                name="missionDesc"
                value={currentT.missionDesc}
                onChange={handleTranslationChange}
                rows="3"
                className={getInputClass(currentE.missionDesc)}
              />
              <FieldError message={currentE.missionDesc} />
            </div>
            <div className="pt-2">
              <label className="mb-3 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                Checklist Items
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={`mission-${i}`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={18}
                        className="min-w-[18px] text-[#1e8a8a]"
                      />
                      <input
                        dir={inputDirection}
                        value={currentT.missionList[i]}
                        onChange={(e) =>
                          handleListChange("missionList", i, e.target.value)
                        }
                        className={getInputClass(currentE[`missionList_${i}`])}
                        placeholder={`Item ${i + 1}`}
                      />
                    </div>
                    <FieldError message={currentE[`missionList_${i}`]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="mb-5 flex items-center gap-2 border-b pb-3 text-lg font-bold dark:border-gray-800">
            <Eye size={18} className="text-[#1e8a8a]" /> Vision Card
          </h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Title
              </label>
              <input
                dir={inputDirection}
                name="visionTitle"
                value={currentT.visionTitle}
                onChange={handleTranslationChange}
                className={getInputClass(currentE.visionTitle)}
              />
              <FieldError message={currentE.visionTitle} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                dir={inputDirection}
                name="visionDesc"
                value={currentT.visionDesc}
                onChange={handleTranslationChange}
                rows="3"
                className={getInputClass(currentE.visionDesc)}
              />
              <FieldError message={currentE.visionDesc} />
            </div>
            <div className="pt-2">
              <label className="mb-3 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                Checklist Items
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={`vision-${i}`}>
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        size={18}
                        className="min-w-[18px] text-[#1e8a8a]"
                      />
                      <input
                        dir={inputDirection}
                        value={currentT.visionList[i]}
                        onChange={(e) =>
                          handleListChange("visionList", i, e.target.value)
                        }
                        className={getInputClass(currentE[`visionList_${i}`])}
                        placeholder={`Item ${i + 1}`}
                      />
                    </div>
                    <FieldError message={currentE[`visionList_${i}`]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- STICKY SAVE BAR --- */}
      <div className="sticky bottom-4 z-40 mt-8 flex items-center justify-between rounded-2xl border border-gray-200 bg-white/80 px-6 py-4 shadow-xl backdrop-blur-xl dark:border-[#263442] dark:bg-[#111a23]/80">
        <div className="hidden items-center gap-3 sm:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1e8a8a]/10 text-[#1e8a8a]">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Editing:{" "}
              <span className="text-[#1e8a8a]">
                {LANGUAGES.find((item) => item.code === language)?.label}
              </span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Button link must start with / · Fill all fields across languages
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#167070] hover:shadow-lg disabled:opacity-70 sm:w-auto"
        >
          <Save size={18} />
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
