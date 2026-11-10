"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import { stripHtml } from "@/Lib/sanitizeText";
import axios from "axios";
import {
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Info,
  Link as LinkIcon,
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
  title: "Need Help? Start Here...",
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

function resolveTitle(trans) {
  if (!trans) return "";
  if (trans.title && stripHtml(trans.title)) return trans.title;
  const line1 = trans.headingLineOne || trans.mainTitle || "";
  const line2 = trans.headingLineTwo || trans.highlightedTitle || "";
  const t1 = stripHtml(line1);
  const t2 = stripHtml(line2);
  if (t1 && t2) return line1 + " " + line2;
  if (t1) return line1;
  if (t2) return line2;
  return trans.title || "";
}

export default function FAQSectionAdmin() {
  const [data, setData] = useState(emptyData());
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState(initializeErrors());

  const inputDirection = language === "en" ? "ltr" : "rtl";

  async function loadData() {
    setLoading(true);
    try {
      const response = await axios.get(API);
      if (response.data && response.data.success && response.data.data) {
        const fetched = response.data.data;

        function mergeLang(code) {
          const raw =
            fetched.translations && fetched.translations[code]
              ? fetched.translations[code]
              : {};
          return {
            ...emptyTranslation(),
            ...raw,
            title: resolveTitle(raw) || emptyTranslation().title,
          };
        }

        setData({
          ...emptyData(),
          ...fetched,
          translations: {
            en: mergeLang("en"),
            ps: mergeLang("ps"),
            fa: mergeLang("fa"),
          },
        });
        setErrors(initializeErrors());
      }
    } catch (error) {
      toast.error("Failed to load FAQ header data.");
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

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  }

  function handleRootChange(e) {
    const name = e.target.name;
    const value = e.target.value;
    setData(function (prev) {
      return { ...prev, [name]: value };
    });
    setErrors(function (prev) {
      return {
        ...prev,
        shared: { ...prev.shared, [name]: null },
      };
    });
  }

  function handleRichTextChange(name, value) {
    setData(function (prev) {
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [language]: { ...prev.translations[language], [name]: value },
        },
      };
    });
    setErrors(function (prev) {
      return {
        ...prev,
        [language]: { ...prev[language], [name]: null },
      };
    });
  }

  function validateForm() {
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

    const headerFields = ["topTag", "title", "description", "buttonText"];

    for (let l = 0; l < LANGUAGES.length; l++) {
      const lang = LANGUAGES[l].code;
      const trans = data.translations[lang];

      for (let i = 0; i < headerFields.length; i++) {
        const field = headerFields[i];
        if (!stripHtml(trans[field] || "")) {
          newErrors[lang][field] = "This field cannot be empty.";
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
        toast.error("Please fix missing fields in " + langName + ".");
      } else {
        toast.error("Please fill in all highlighted fields.");
      }
    }

    return isValid;
  }

  async function handleSave() {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        buttonLink: String(data.buttonLink || "").trim(),
        translations: {
          en: {
            topTag: data.translations.en.topTag,
            title: data.translations.en.title,
            description: data.translations.en.description,
            buttonText: data.translations.en.buttonText,
          },
          ps: {
            topTag: data.translations.ps.topTag,
            title: data.translations.ps.title,
            description: data.translations.ps.description,
            buttonText: data.translations.ps.buttonText,
          },
          fa: {
            topTag: data.translations.fa.topTag,
            title: data.translations.fa.title,
            description: data.translations.fa.description,
            buttonText: data.translations.fa.buttonText,
          },
        },
      };
      const response = await axios.post(API, payload);

      if (!response.data || !response.data.success) {
        throw new Error("Failed to save");
      }
      toast.success("FAQ Section updated successfully.");
    } catch (error) {
      toast.error(error.message || "Failed to save section.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  const currentT = data.translations[language];
  const currentE = errors[language];

  function hasLanguageErrors(code) {
    const vals = Object.values(errors[code] || {});
    for (let i = 0; i < vals.length; i++) {
      if (vals[i]) return true;
    }
    return false;
  }

  let editingLabel = "English";
  for (let i = 0; i < LANGUAGES.length; i++) {
    if (LANGUAGES[i].code === language) {
      editingLabel = LANGUAGES[i].label;
      break;
    }
  }

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] pb-28 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
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
            {LANGUAGES.map(function (item) {
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={function () {
                    changeLanguage(item.code);
                  }}
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
              );
            })}
          </div>

          <AdminLanguageBall
            language={language}
            onLanguageChange={changeLanguage}
          />
        </div>
      </div>

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

      <section className={sectionClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">Presentation Text</h2>
            <p className="mt-1 text-xs text-gray-500">
              Editing: {editingLabel}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
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
                onChange={function (val) {
                  handleRichTextChange("topTag", val);
                }}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.topTag} />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
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
                onChange={function (val) {
                  handleRichTextChange("title", val);
                }}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.title} />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Description
            </label>
            <div
              className={
                currentE.description ? "rounded-md border border-red-500" : ""
              }
            >
              <RichTextEditor
                key={"description-" + language}
                value={currentT.description}
                onChange={function (val) {
                  handleRichTextChange("description", val);
                }}
                dir={inputDirection}
              />
            </div>
            <FieldError message={currentE.description} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                <ChevronRight size={15} />
                Button Text
              </label>
              <div
                className={
                  currentE.buttonText ? "rounded-md border border-red-500" : ""
                }
              >
                <RichTextEditor
                  key={"buttonText-" + language}
                  value={currentT.buttonText}
                  onChange={function (val) {
                    handleRichTextChange("buttonText", val);
                  }}
                  dir={inputDirection}
                />
              </div>
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

      <AdminStickyFooter
        onReload={loadData}
        onSave={handleSave}
        saving={saving}
        busy={saving}
      />
    </div>
  );
}
