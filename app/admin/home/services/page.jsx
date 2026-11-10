"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import { stripHtml } from "@/Lib/sanitizeText";
import axios from "axios";
import {
  Briefcase,
  GripVertical,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/homepage/services";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyHeaderTranslation = () => ({
  badgeText: "OUR SERVICES",
  title: "What We Do",
  description: "We provide modern digital solutions for your business.",
});

const emptyServiceTranslation = () => ({
  title: "",
  description: "",
});

const emptyData = () => ({
  translations: {
    en: emptyHeaderTranslation(),
    ps: emptyHeaderTranslation(),
    fa: emptyHeaderTranslation(),
  },
  services: [],
});

export default function ServicesAdmin() {
  const [data, setData] = useState(emptyData());
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputDirection = language === "en" ? "ltr" : "rtl";

  async function loadData() {
    setLoading(true);
    try {
      const response = await axios.get(API);
      if (response.data && response.data.success) {
        const fetched = response.data.data || {};
        const mergedTranslations = {
          en: { ...emptyHeaderTranslation(), ...(fetched.translations?.en || {}) },
          ps: { ...emptyHeaderTranslation(), ...(fetched.translations?.ps || {}) },
          fa: { ...emptyHeaderTranslation(), ...(fetched.translations?.fa || {}) },
        };
        
        const mergedServices = Array.isArray(fetched.services)
          ? fetched.services.map((s) => ({
              ...s,
              id: s.id || s._id || crypto.randomUUID(),
              translations: {
                en: { ...emptyServiceTranslation(), ...(s.translations?.en || {}) },
                ps: { ...emptyServiceTranslation(), ...(s.translations?.ps || {}) },
                fa: { ...emptyServiceTranslation(), ...(s.translations?.fa || {}) },
              },
            }))
          : [];

        setData({ translations: mergedTranslations, services: mergedServices });
      }
    } catch (error) {
      toast.error("Failed to load services data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function changeLanguage(code) {
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

  function handleHeaderChange(field, value) {
    setData((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [language]: {
          ...prev.translations[language],
          [field]: value,
        },
      },
    }));
  }

  function handleAddService() {
    const newService = {
      id: crypto.randomUUID(),
      icon: "",
      translations: {
        en: emptyServiceTranslation(),
        ps: emptyServiceTranslation(),
        fa: emptyServiceTranslation(),
      },
    };
    setData((prev) => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  }

  function handleRemoveService(id) {
    if (!window.confirm("Remove this service card?")) return;
    setData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
  }

  function handleServiceFieldChange(id, field, value) {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => {
        if (s.id !== id) return s;
        return { ...s, [field]: value };
      }),
    }));
  }

  function handleServiceTranslationChange(id, field, value) {
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          translations: {
            ...s.translations,
            [language]: {
              ...s.translations[language],
              [field]: value,
            },
          },
        };
      }),
    }));
  }

  function validateData() {
    // Basic validation to ensure title is present in current language
    const currentT = data.translations[language];
    if (!stripHtml(currentT.title)) {
      toast.error("Header Title cannot be empty.");
      return false;
    }
    
    for (let i = 0; i < data.services.length; i++) {
      const s = data.services[i];
      if (!stripHtml(s.translations[language].title)) {
        toast.error(`Service #${i + 1} is missing a title in ${language}.`);
        return false;
      }
    }
    return true;
  }

  async function handleSave() {
    if (!validateData()) return;
    setSaving(true);
    try {
      const response = await axios.post(API, data);
      if (response.data && response.data.success !== false) {
        toast.success("Services updated successfully.");
        loadData(); // Reload to sync IDs
      } else {
        throw new Error(response.data.message || "Failed to save");
      }
    } catch (error) {
      toast.error(error.message || "Failed to save services.");
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
  let editingLabel = "English";
  for (let i = 0; i < LANGUAGES.length; i++) {
    if (LANGUAGES[i].code === language) {
      editingLabel = LANGUAGES[i].label;
      break;
    }
  }

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] pb-28 text-gray-900 dark:bg-[#0b1117] dark:text-gray-100">
      {/* Header Area */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <Briefcase size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Services Section</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage the services presentation and feature cards.
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
              </button>
            ))}
          </div>
          <AdminLanguageBall language={language} onLanguageChange={changeLanguage} />
        </div>
      </div>

      {/* Main Section Header */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-4">
          <h2 className="font-bold">Presentation Text</h2>
          <p className="mt-1 text-xs text-gray-500">
            Editing text for: <span className="font-semibold text-[#1e8a8a]">{editingLabel}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Badge Text (Top Tagline)
            </label>
            <RichTextEditor
              key={"badgeText-" + language}
              value={currentT.badgeText}
              onChange={(val) => handleHeaderChange("badgeText", val)}
              dir={inputDirection}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Main Title
            </label>
            <RichTextEditor
              key={"title-" + language}
              value={currentT.title}
              onChange={(val) => handleHeaderChange("title", val)}
              dir={inputDirection}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
              Description
            </label>
            <RichTextEditor
              key={"description-" + language}
              value={currentT.description}
              onChange={(val) => handleHeaderChange("description", val)}
              dir={inputDirection}
            />
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Service Cards</h2>
            <p className="mt-1 text-xs text-gray-500">
              Manage individual service offerings below.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddService}
            className="flex items-center gap-1.5 rounded-xl bg-[#1e8a8a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#167878]"
          >
            <Plus size={16} /> Add Service
          </button>
        </div>

        {data.services.length === 0 ? (
          <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 dark:border-[#263442]">
            No services added yet. Click "Add Service" to begin.
          </div>
        ) : (
          <div className="space-y-4">
            {data.services.map((service, index) => {
              const sTrans = service.translations[language];
              return (
                <div
                  key={service.id}
                  className="flex gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-[#263442]/50 dark:bg-[#0b1117]"
                >
                  <div className="mt-2 text-gray-400">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        Service Card #{index + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
                        className="rounded-lg border border-red-500/20 p-1.5 text-red-500 transition hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                      <div>
                        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                          <ImageIcon size={14} /> Icon URL / Class
                        </label>
                        <input
                          dir="ltr"
                          value={service.icon || ""}
                          onChange={(e) =>
                            handleServiceFieldChange(service.id, "icon", e.target.value)
                          }
                          placeholder="Icon SVG, Class, or URL"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Service Title
                          </label>
                          <RichTextEditor
                            key={"service-" + service.id + "-title-" + language}
                            value={sTrans.title}
                            onChange={(val) =>
                              handleServiceTranslationChange(service.id, "title", val)
                            }
                            dir={inputDirection}
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-xs font-semibold text-gray-600 dark:text-gray-400">
                            Service Description
                          </label>
                          <RichTextEditor
                            key={"service-" + service.id + "-desc-" + language}
                            value={sTrans.description}
                            onChange={(val) =>
                              handleServiceTranslationChange(service.id, "description", val)
                            }
                            dir={inputDirection}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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