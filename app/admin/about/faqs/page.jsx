"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ChevronRight,
  HelpCircle,
  Link as LinkIcon,
  MessageCircleQuestion,
  Save,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/aboutpage/faqs";

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

const emptyFAQTranslation = () => ({
  question: "",
  answer: "",
});

const defaultFaqs = () =>
  Array.from({ length: 5 }, (_, i) => ({
    id: String(i + 1),
    translations: {
      en: emptyFAQTranslation(),
      ps: emptyFAQTranslation(),
      fa: emptyFAQTranslation(),
    },
  }));

const emptyData = () => ({
  buttonLink: "/contact",
  translations: {
    en: emptyTranslation(),
    ps: emptyTranslation(),
    fa: emptyTranslation(),
  },
  faqs: defaultFaqs(),
});

const initializeErrors = () => {
  const errs = {
    shared: {},
    en: { faqs: [] },
    ps: { faqs: [] },
    fa: { faqs: [] },
  };
  LANGUAGES.forEach((l) => {
    errs[l.code].faqs = Array(5)
      .fill(null)
      .map(() => ({}));
  });
  return errs;
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

          const incomingFaqs = Array.isArray(fetched.faqs) ? fetched.faqs : [];
          const mergedFaqs = defaultFaqs().map((def, i) => {
            const item = incomingFaqs[i] || {};
            return {
              id: def.id,
              translations: {
                en: { ...def.translations.en, ...item.translations?.en },
                ps: { ...def.translations.ps, ...item.translations?.ps },
                fa: { ...def.translations.fa, ...item.translations?.fa },
              },
            };
          });

          setData({
            ...emptyData(),
            ...fetched,
            faqs: mergedFaqs,
            translations: {
              en: { ...emptyTranslation(), ...fetched.translations?.en },
              ps: { ...emptyTranslation(), ...fetched.translations?.ps },
              fa: { ...emptyTranslation(), ...fetched.translations?.fa },
            },
          });
        }
      } catch (error) {
        toast.error("Failed to load FAQ data.");
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

  const handleFAQChange = (index, field, value) => {
    setData((prev) => {
      const newFaqs = [...prev.faqs];
      newFaqs[index] = {
        ...newFaqs[index],
        translations: {
          ...newFaqs[index].translations,
          [language]: {
            ...newFaqs[index].translations[language],
            [field]: value,
          },
        },
      };
      return { ...prev, faqs: newFaqs };
    });

    setErrors((prev) => {
      const next = { ...prev };
      if (next[language]?.faqs?.[index]) {
        next[language].faqs[index][field] = null;
      }
      return next;
    });
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
        if (!String(trans[field] || "").trim()) {
          newErrors[lang.code][field] = "This field cannot be empty.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
      });

      data.faqs.forEach((faq, index) => {
        const faqTrans = faq.translations[lang.code];
        if (!String(faqTrans.question || "").trim()) {
          newErrors[lang.code].faqs[index].question = "Question is required.";
          isValid = false;
          if (!firstErrorLanguage) firstErrorLanguage = lang.code;
        }
        if (!String(faqTrans.answer || "").trim()) {
          newErrors[lang.code].faqs[index].answer = "Answer is required.";
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
    const errs = errors[code];
    const hasHeaderError = Object.keys(errs).some(
      (k) => k !== "faqs" && errs[k],
    );
    const hasFaqError = errs.faqs.some((faqErr) =>
      Object.values(faqErr).some(Boolean),
    );
    return hasHeaderError || hasFaqError;
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
            <h1 className="text-xl font-bold sm:text-2xl">FAQ Section</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update the help block and frequently asked questions.
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

      {/* Questions and Answers */}
      <section className={sectionClass}>
        <h2 className="mb-4 flex items-center justify-between font-bold">
          Questions & Answers (5)
          <MessageCircleQuestion size={19} className="text-[#1e8a8a]" />
        </h2>

        <div className="space-y-4">
          {data.faqs.map((faq, index) => {
            const faqT = faq.translations[language];
            const faqE = currentE.faqs[index] || {};

            return (
              <div
                key={index}
                className="overflow-hidden rounded-xl border border-gray-200 p-4 dark:border-[#263442]"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1e8a8a] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold">FAQ {index + 1}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Question
                    </label>
                    <input
                      dir={inputDirection}
                      value={faqT.question}
                      onChange={(e) =>
                        handleFAQChange(index, "question", e.target.value)
                      }
                      placeholder="Enter the question here..."
                      className={faqE.question ? inputErrorClass : inputClass}
                    />
                    <FieldError message={faqE.question} />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Full Answer
                    </label>
                    <textarea
                      dir={inputDirection}
                      value={faqT.answer}
                      onChange={(e) =>
                        handleFAQChange(index, "answer", e.target.value)
                      }
                      rows="6"
                      placeholder="Write a comprehensive answer..."
                      className={`${
                        faqE.answer ? inputErrorClass : inputClass
                      } min-h-[160px] resize-y leading-relaxed`}
                    />
                    <FieldError message={faqE.answer} />
                  </div>
                </div>
              </div>
            );
          })}
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
          {saving ? "Saving..." : "Save FAQ Section"}
        </button>
      </div>
    </div>
  );
}
