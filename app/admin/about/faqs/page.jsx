"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Info,
  Link as LinkIcon,
  Save,
  Type,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/aboutpage/faqs";
const HOME_FAQ_ADMIN = "/admin/home/faq";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyTranslation = () => ({
  topTag: "COMMON QUESTIONS",
  mainTitle: "Need Help? Start Here...",
  highlightedTitle: "Help?",
  description:
    "We stay ahead of the curve, leveraging cutting-edge technologies and strategies to keep you competitive.",
  buttonText: "Request a Call",
});

const emptyData = () => ({
  buttonLink: "/contact",
  translations: {
    en: emptyTranslation(),
    ps: emptyTranslation(),
    fa: emptyTranslation(),
  },
});

const initializeErrors = () => {
  return {
    shared: {},
    en: {},
    ps: {},
    fa: {},
  };
};

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

export default function FAQSectionAdmin() {
  const [data, setData] = useState(emptyData());
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState(initializeErrors());

  const inputDirection = language === "en" ? "ltr" : "rtl";

  // --- DATA LOADING ---
  useEffect(() => {
    async function loadData() {
      try {
        const response = await axios.get(API);
        if (response.data?.success && response.data?.data) {
          const fetched = response.data.data;

          setData({
            ...emptyData(),
            ...fetched,
            translations: {
              en: { ...emptyTranslation(), ...fetched.translations?.en },
              ps: { ...emptyTranslation(), ...fetched.translations?.ps },
              fa: { ...emptyTranslation(), ...fetched.translations?.fa },
            },
          });
        }
      } catch (error) {
        toast.error("Failed to load FAQ header data.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- HANDLERS ---
  const changeLanguage = (code) => {
    if (!LANGUAGES.some((item) => item.code === code)) return;
    setLanguage(code);
    try {
      localStorage.setItem("admin-content-language", code);
    } catch {}

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  };

  const handleRootChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      shared: { ...prev.shared, [name]: null },
    }));
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

  // --- VALIDATION ---
  const validateForm = () => {
    const newErrors = initializeErrors();
    let isValid = true;
    let firstErrorLanguage = null;

    const link = String(data.buttonLink || "").trim();
    if (
      !link ||
      !link.startsWith("/") ||
      link.startsWith("//") ||
      /\s/.test(link)
    ) {
      newErrors.shared.buttonLink =
        "Must start with a single '/' (e.g., /contact)";
      isValid = false;
    }

    const headerFields = [
      "topTag",
      "mainTitle",
      "highlightedTitle",
      "description",
      "buttonText",
    ];

    LANGUAGES.forEach((lang) => {
      const trans = data.translations[lang.code];

      headerFields.forEach((field) => {
        // Highlighted title is optional in most designs, but if you want it strict, keep it here
        if (
          !String(trans[field] || "").trim() &&
          field !== "highlightedTitle"
        ) {
          newErrors[lang.code][field] = "This field cannot be empty.";
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
        buttonLink: String(data.buttonLink || "").trim(),
      };
      const response = await axios.post(API, payload);

      if (!response.data?.success) throw new Error("Failed to save");
      toast.success("FAQ Section updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to save section.");
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
    return Object.values(errors[code] || {}).some(Boolean);
  };

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] pb-24 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      {/* Header and language selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <HelpCircle size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">
              FAQ Section Header
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the presentation block and button.
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

      {/* INFO BANNER: Q&A are from Home */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#1e8a8a]/20 bg-[#1e8a8a]/5 px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#1e8a8a]/30 dark:bg-[#1e8a8a]/10">
        <div className="flex items-start gap-3">
          <Info size={20} className="mt-0.5 shrink-0 text-[#1e8a8a]" />
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Questions & answers are shared with the Home Page
            </p>
            <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">
              This page only controls the header and button. Edit the actual FAQ
              list directly in the Home FAQ admin.
            </p>
          </div>
        </div>
        <Link
          href={HOME_FAQ_ADMIN}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#167878]"
        >
          <ExternalLink size={16} />
          Go to Home FAQ
        </Link>
      </div>

      {/* Presentation Text */}
      <section className={sectionClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Presentation Text</h2>
            <p className="mt-1 text-xs text-gray-500">
              Editing: {LANGUAGES.find((item) => item.code === language)?.label}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Top Tagline
            </label>
            <input
              dir={inputDirection}
              name="topTag"
              value={currentT.topTag}
              onChange={handleTranslationChange}
              placeholder="e.g. COMMON QUESTIONS"
              className={currentE.topTag ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.topTag} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Type size={15} />
                Main Title
              </label>
              <input
                dir={inputDirection}
                name="mainTitle"
                value={currentT.mainTitle}
                onChange={handleTranslationChange}
                placeholder="e.g. Need Help? Start Here..."
                className={currentE.mainTitle ? inputErrorClass : inputClass}
              />
              <FieldError message={currentE.mainTitle} />
            </div>

            <div className="sm:col-span-1">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Type size={15} />
                Highlighted Word
              </label>
              <input
                dir={inputDirection}
                name="highlightedTitle"
                value={currentT.highlightedTitle}
                onChange={handleTranslationChange}
                placeholder="e.g. Help?"
                className={
                  currentE.highlightedTitle ? inputErrorClass : inputClass
                }
              />
              <FieldError message={currentE.highlightedTitle} />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Description
            </label>
            <textarea
              dir={inputDirection}
              name="description"
              value={currentT.description}
              onChange={handleTranslationChange}
              rows="3"
              placeholder="Write description..."
              className={currentE.description ? inputErrorClass : inputClass}
            />
            <FieldError message={currentE.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ChevronRight size={15} />
                Button Text
              </label>
              <input
                dir={inputDirection}
                name="buttonText"
                value={currentT.buttonText}
                onChange={handleTranslationChange}
                placeholder="e.g. Request a Call"
                className={currentE.buttonText ? inputErrorClass : inputClass}
              />
              <FieldError message={currentE.buttonText} />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LinkIcon size={15} />
                Button Link
              </label>
              <input
                dir="ltr"
                name="buttonLink"
                value={data.buttonLink}
                onChange={handleRootChange}
                placeholder="/contact"
                className={
                  errors.shared.buttonLink ? inputErrorClass : inputClass
                }
              />
              <FieldError message={errors.shared.buttonLink} />
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Save Bar */}
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
              Button link must start with / · Fill all fields in EN, PS, FA
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save Header"}
        </button>
      </div>
    </div>
  );
}
