"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import { stripHtml } from "@/Lib/sanitizeText";
import axios from "axios";
import {
  BarChart,
  Box,
  CheckCircle2,
  ChevronRight,
  Eye,
  ImagePlus,
  Link as LinkIcon,
  Loader2,
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

const getInputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition-colors dark:bg-[#16212c] dark:text-gray-100 ${
    hasError
      ? "border-red-400 focus:border-red-500 dark:border-red-500/80"
      : "border-gray-200 focus:border-[#1e8a8a] dark:border-[#263442]"
  }`;

const FieldError = ({ message }) => {
  if (!message) return null;
  return <p className="mt-1.5 text-xs font-medium text-red-500">{message}</p>;
};

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

async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data && data.success === true) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

const emptyTranslation = () => ({
  topTag: "CHOOSE THE BEST",
  title:
    'Driving Innovation and Excellence for Sustainable Corporate Success <span style="color:#1E8A8A">Worldwide.</span>',
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
  const [checking, setChecking] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [theme, setTheme] = useState("light");

  const [errors, setErrors] = useState({ shared: {}, en: {}, ps: {}, fa: {} });

  const widgetRef = useRef(null);
  const uploadLockRef = useRef(false);
  const inputDirection = language === "en" ? "ltr" : "rtl";
  const busy = saving || checking || uploading;

  useEffect(() => {
    const update = () => {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (widgetRef.current) {
      if (typeof widgetRef.current.destroy === "function") {
        widgetRef.current.destroy();
      }
      widgetRef.current = null;
    }
  }, [theme]);

  async function loadData() {
    setLoading(true);
    try {
      const response = await axios.get(API);
      if (response.data && response.data.success && response.data.data) {
        setData({
          ...emptyData(),
          ...response.data.data,
          translations: {
            en: {
              ...emptyTranslation(),
              ...(response.data.data.translations &&
                response.data.data.translations.en),
            },
            ps: {
              ...emptyTranslation(),
              ...(response.data.data.translations &&
                response.data.data.translations.ps),
            },
            fa: {
              ...emptyTranslation(),
              ...(response.data.data.translations &&
                response.data.data.translations.fa),
            },
          },
        });
        setErrors({ shared: {}, en: {}, ps: {}, fa: {} });
      }
    } catch (error) {
      toast.error("Failed to load section data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function changeLanguage(code) {
    let exists = false;
    for (let i = 0; i < LANGUAGES.length; i++) {
      if (LANGUAGES[i].code === code) {
        exists = true;
        break;
      }
    }
    if (!exists) return;
    setLanguage(code);
    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}
  }

  function handleRootChange(e) {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      shared: { ...prev.shared, [name]: null },
    }));
  }

  function handleRichTextChange(name, value) {
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
  }

  function handleListRichTextChange(listName, index, value) {
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
    setErrors((prev) => ({
      ...prev,
      [language]: { ...prev[language], [`${listName}_${index}`]: null },
    }));
  }

  async function uploadImage() {
    if (uploadLockRef.current) return;
    if (busy) return;
    uploadLockRef.current = true;

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);
    if (!allowed) {
      uploadLockRef.current = false;
      toast.error("You don't have permission to upload images.");
      return;
    }

    if (!window.cloudinary) {
      uploadLockRef.current = false;
      toast.error("Image uploader is not ready. Please try again.");
      return;
    }

    setUploading(true);

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: "bexon/about",
          multiple: false,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          styles: cloudinaryStyles(theme),
        },
        (error, result) => {
          if (error) {
            setUploading(false);
            uploadLockRef.current = false;
            return toast.error("Upload failed.");
          }
          if (result && result.event === "success") {
            setData((prev) => ({
              ...prev,
              image: result.info.secure_url,
              publicId: result.info.public_id || "",
            }));
            setErrors((prev) => ({
              ...prev,
              shared: { ...prev.shared, image: null },
            }));
            toast.success(
              "Image uploaded. Click Save All Changes to persist it.",
            );
          }
          if (
            result &&
            (result.event === "close" ||
              result.event === "abort" ||
              result.event === "queues-end")
          ) {
            setUploading(false);
            uploadLockRef.current = false;
          }
        },
      );
    }
    widgetRef.current.open();
  }

  function validateForm() {
    const newErrors = { shared: {}, en: {}, ps: {}, fa: {} };
    let isValid = true;
    let firstErrorLanguage = null;

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

    const textFields = [
      "topTag",
      "title",
      "buttonText",
      "progressTitle",
      "progressLabel1",
      "progressLabel2",
      "missionTitle",
      "missionDesc",
      "visionTitle",
      "visionDesc",
    ];

    for (let l = 0; l < LANGUAGES.length; l++) {
      const lang = LANGUAGES[l].code;
      const trans = data.translations[lang];

      for (let i = 0; i < textFields.length; i++) {
        const field = textFields[i];
        if (!stripHtml(trans[field] || "")) {
          newErrors[lang][field] = "This field cannot be empty.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang;
        }
      }

      for (let i = 0; i < 3; i++) {
        if (!stripHtml(trans.missionList[i] || "")) {
          newErrors[lang][`missionList_${i}`] = "Required";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang;
        }
        if (!stripHtml(trans.visionList[i] || "")) {
          newErrors[lang][`visionList_${i}`] = "Required";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang;
        }
      }
    }

    setErrors(newErrors);

    if (!isValid) {
      if (firstErrorLanguage && firstErrorLanguage !== language) {
        setLanguage(firstErrorLanguage);
        let langName = "Language";
        for (let i = 0; i < LANGUAGES.length; i++) {
          if (LANGUAGES[i].code === firstErrorLanguage) {
            langName = LANGUAGES[i].label;
            break;
          }
        }
        toast.error(`Please fix missing fields in ${langName}.`, {
          icon: "⚠️",
        });
      } else {
        toast.error("Please fill in all highlighted fields.", { icon: "⚠️" });
      }
    }

    return isValid;
  }

  async function handleSave() {
    if (busy) return;
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = { ...data, buttonLink: data.buttonLink.trim() };
      const response = await axios.post(API, payload);
      if (!response.data || !response.data.success) {
        throw new Error("Failed to save");
      }
      toast.success("Section updated successfully.");
    } catch (error) {
      toast.error(error.message ? error.message : "Failed to save section.");
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

  const uploadBtnLabel = checking
    ? "Checking..."
    : uploading
      ? "Uploading..."
      : "Replace Image";

  return (
    <div className="relative min-h-screen space-y-6 bg-[#f7f9fc] pb-28 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      <Script src="https://upload-widget.cloudinary.com/global/all.js" />

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
            {LANGUAGES.map((item) => {
              let hasErr = false;
              const keys = Object.keys(errors[item.code]);
              for (let i = 0; i < keys.length; i++) {
                if (errors[item.code][keys[i]]) {
                  hasErr = true;
                  break;
                }
              }
              return (
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
                  {hasErr && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
                  )}
                </button>
              );
            })}
          </div>
          <AdminLanguageBall
            language={language}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>

      <section className={sectionClass}>
        <h2 className="mb-5 flex items-center gap-2 border-b pb-3 text-lg font-bold dark:border-gray-800">
          <Type size={18} className="text-[#1e8a8a]" /> Media & Headings
        </h2>

        <div className="space-y-5">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Main Image
            </label>
            {data.image ? (
              <img
                src={data.image}
                alt="Preview"
                className={`h-64 w-full rounded-xl border object-cover shadow-sm ${errors.shared.image ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              />
            ) : (
              <div
                className={`flex h-64 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-gray-50 dark:bg-gray-800 ${errors.shared.image ? "border-red-400 text-red-400" : "border-gray-300 dark:border-gray-700"}`}
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
              type="button"
              onClick={uploadImage}
              disabled={busy}
              aria-busy={busy}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] transition-all hover:bg-[#1e8a8a] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking || uploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              {uploadBtnLabel}
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Top Tagline
            </label>
            <div
              className={
                currentE.topTag ? "rounded-md border border-red-500" : ""
              }
            >
              <RichTextEditor
                key={"topTag-" + language}
                value={currentT.topTag}
                onChange={(val) => handleRichTextChange("topTag", val)}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.topTag} />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Main Title
            </label>
            <div
              className={
                currentE.title ? "rounded-md border border-red-500" : ""
              }
            >
              <RichTextEditor
                key={"title-" + language}
                value={currentT.title}
                onChange={(val) => handleRichTextChange("title", val)}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.title} />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <ChevronRight size={16} className="text-gray-400" /> Button Text
            </label>
            <div
              className={
                currentE.buttonText ? "rounded-md border border-red-500" : ""
              }
            >
              <RichTextEditor
                key={"buttonText-" + language}
                value={currentT.buttonText}
                onChange={(val) => handleRichTextChange("buttonText", val)}
                dir={inputDirection}
              />
            </div>
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
      </section>

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
            <div
              className={
                currentE.progressTitle ? "rounded-md border border-red-500" : ""
              }
            >
              <RichTextEditor
                key={"progressTitle-" + language}
                value={currentT.progressTitle}
                onChange={(val) => handleRichTextChange("progressTitle", val)}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.progressTitle} />
          </div>

          <div className="sm:col-span-3">
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Progress 1 Label
            </label>
            <div
              className={
                currentE.progressLabel1
                  ? "rounded-md border border-red-500"
                  : ""
              }
            >
              <RichTextEditor
                key={"progressLabel1-" + language}
                value={currentT.progressLabel1}
                onChange={(val) => handleRichTextChange("progressLabel1", val)}
                dir={inputDirection}
              />
            </div>
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
            <div
              className={
                currentE.progressLabel2
                  ? "rounded-md border border-red-500"
                  : ""
              }
            >
              <RichTextEditor
                key={"progressLabel2-" + language}
                value={currentT.progressLabel2}
                onChange={(val) => handleRichTextChange("progressLabel2", val)}
                dir={inputDirection}
              />
            </div>
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
              <div
                className={
                  currentE.missionTitle
                    ? "rounded-md border border-red-500"
                    : ""
                }
              >
                <RichTextEditor
                  key={"missionTitle-" + language}
                  value={currentT.missionTitle}
                  onChange={(val) => handleRichTextChange("missionTitle", val)}
                  dir={inputDirection}
                />
              </div>
              <FieldError message={currentE.missionTitle} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <div
                className={
                  currentE.missionDesc ? "rounded-md border border-red-500" : ""
                }
              >
                <RichTextEditor
                  key={"missionDesc-" + language}
                  value={currentT.missionDesc}
                  onChange={(val) => handleRichTextChange("missionDesc", val)}
                  dir={inputDirection}
                />
              </div>
              <FieldError message={currentE.missionDesc} />
            </div>
            <div className="pt-2">
              <label className="mb-3 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                Checklist Items
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={`mission-${i}`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-3 min-w-[18px] text-[#1e8a8a]"
                      />
                      <div
                        className={`flex-1 ${
                          currentE[`missionList_${i}`]
                            ? "rounded-md border border-red-500"
                            : ""
                        }`}
                      >
                        <RichTextEditor
                          key={"missionList-" + language + "-" + i}
                          value={currentT.missionList[i]}
                          onChange={(val) =>
                            handleListRichTextChange("missionList", i, val)
                          }
                          dir={inputDirection}
                        />
                      </div>
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
              <div
                className={
                  currentE.visionTitle ? "rounded-md border border-red-500" : ""
                }
              >
                <RichTextEditor
                  key={"visionTitle-" + language}
                  value={currentT.visionTitle}
                  onChange={(val) => handleRichTextChange("visionTitle", val)}
                  dir={inputDirection}
                />
              </div>
              <FieldError message={currentE.visionTitle} />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Description
              </label>
              <div
                className={
                  currentE.visionDesc ? "rounded-md border border-red-500" : ""
                }
              >
                <RichTextEditor
                  key={"visionDesc-" + language}
                  value={currentT.visionDesc}
                  onChange={(val) => handleRichTextChange("visionDesc", val)}
                  dir={inputDirection}
                />
              </div>
              <FieldError message={currentE.visionDesc} />
            </div>
            <div className="pt-2">
              <label className="mb-3 block border-b border-gray-100 pb-2 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300">
                Checklist Items
              </label>
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={`vision-${i}`}>
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-3 min-w-[18px] text-[#1e8a8a]"
                      />
                      <div
                        className={`flex-1 ${
                          currentE[`visionList_${i}`]
                            ? "rounded-md border border-red-500"
                            : ""
                        }`}
                      >
                        <RichTextEditor
                          key={"visionList-" + language + "-" + i}
                          value={currentT.visionList[i]}
                          onChange={(val) =>
                            handleListRichTextChange("visionList", i, val)
                          }
                          dir={inputDirection}
                        />
                      </div>
                    </div>
                    <FieldError message={currentE[`visionList_${i}`]} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <AdminStickyFooter
        onReload={loadData}
        onSave={handleSave}
        saving={saving}
        busy={busy}
        saveLabel="Save All Changes"
        savingLabel="Saving Changes..."
        reloadLabel="Reload Saved Data"
      />
    </div>
  );
}
