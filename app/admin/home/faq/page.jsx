"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import { ImagePlus, LoaderCircle, Upload } from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────
   Cloudinary permission check
   ────────────────────────────────────────────── */
async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    return res.ok && data && data.success === true;
  } catch (error) {
    return false;
  }
}

/* ──────────────────────────────────────────────
   Unified Cloudinary widget theme
   ────────────────────────────────────────────── */
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

  if (palettes[theme]) {
    return { palette: palettes[theme] };
  }

  return { palette: palettes.light };
}

/* ────────────────────────────────────────────── */

const languages = [
  { code: "en", label: "English" },
  { code: "ps", label: "Pashto" },
  { code: "fa", label: "Dari" },
];

const validationOrder = ["en", "ps", "fa"];

const languageNames = {
  en: "English",
  ps: "Pashto",
  fa: "Dari",
};

function emptyTranslation() {
  return {
    en: "",
    ps: "",
    fa: "",
  };
}

const defaultFormData = {
  title: emptyTranslation(),
  imageURL: "",
  imagePublicId: "",
  callTitle: emptyTranslation(),
  phoneNumber: emptyTranslation(),
  phoneHref: emptyTranslation(),
  faqs: [],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38a3a3]";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111B27] dark:shadow-black/20 sm:p-7";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTranslation(value) {
  if (typeof value === "string") {
    return { en: value, ps: "", fa: "" };
  }

  return {
    en: (value && value.en) || "",
    ps: (value && value.ps) || "",
    fa: (value && value.fa) || "",
  };
}

function combineLegacyLines(lineOne, lineTwo) {
  const result = emptyTranslation();
  const one = toTranslation(lineOne);
  const two = toTranslation(lineTwo);
  const langs = ["en", "ps", "fa"];

  for (let i = 0; i < langs.length; i += 1) {
    const lang = langs[i];
    const parts = [];

    if (one[lang] && stripHtml(one[lang])) {
      parts.push(one[lang]);
    }

    if (two[lang] && stripHtml(two[lang])) {
      parts.push(two[lang]);
    }

    if (parts.length === 1) {
      result[lang] = parts[0];
    } else if (parts.length === 2) {
      result[lang] = parts[0] + " " + parts[1];
    }
  }

  return result;
}

function resolveTitle(data) {
  if (!data) {
    return emptyTranslation();
  }

  if (data.title) {
    const title = toTranslation(data.title);
    if (stripHtml(title.en) || stripHtml(title.ps) || stripHtml(title.fa)) {
      return title;
    }
  }

  return combineLegacyLines(data.headingLineOne, data.headingLineTwo);
}

function resolveCallTitle(data) {
  if (!data) {
    return emptyTranslation();
  }

  if (data.callTitle) {
    const title = toTranslation(data.callTitle);
    if (stripHtml(title.en) || stripHtml(title.ps) || stripHtml(title.fa)) {
      return title;
    }
  }

  return combineLegacyLines(data.callHeadingLineOne, data.callHeadingLineTwo);
}

function formatFaqData(data) {
  if (!data) {
    data = {};
  }

  return {
    ...defaultFormData,
    ...data,
    title: resolveTitle(data),
    callTitle: resolveCallTitle(data),
    phoneNumber: toTranslation(data.phoneNumber),
    phoneHref: toTranslation(data.phoneHref),
    imageURL: data.imageURL || "",
    imagePublicId: data.imagePublicId || "",
    faqs: Array.isArray(data.faqs)
      ? data.faqs.map(function (faq, index) {
          return {
            ...faq,
            id: faq.id || String(index + 1),
            question: toTranslation(faq.question),
            answer: toTranslation(faq.answer),
          };
        })
      : [],
  };
}

function isValidPhoneHref(value) {
  return /^tel:\+?[0-9]{7,15}$/.test(String(value).trim());
}

export default function FaqAdminPanel() {
  const [formData, setFormData] = useState(defaultFormData);
  const [language, setLanguage] = useState("en");

  const [savedImageURL, setSavedImageURL] = useState("");
  const [savedImagePublicId, setSavedImagePublicId] = useState("");

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState("");

  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [checking, setChecking] = useState(false);
  const [theme, setTheme] = useState("light");

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const busy = isSaving || checking;
  const inputDirection = language === "en" ? "ltr" : "rtl";

  useEffect(function () {
    function update() {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  useEffect(function () {
    if (typeof window !== "undefined" && window.cloudinary) {
      setCloudinaryReady(true);
    }
  }, []);

  useEffect(function () {
    const savedLanguage = localStorage.getItem("admin-content-language");

    if (validationOrder.indexOf(savedLanguage) !== -1) {
      setLanguage(savedLanguage);
    }

    function handleLanguageChange(event) {
      let nextLanguage = null;

      if (typeof event.detail === "string") {
        nextLanguage = event.detail;
      } else if (event.detail && event.detail.language) {
        nextLanguage = event.detail.language;
      }

      if (validationOrder.indexOf(nextLanguage) !== -1) {
        setLanguage(nextLanguage);
      }
    }

    window.addEventListener("admin-language-change", handleLanguageChange);

    return function () {
      window.removeEventListener("admin-language-change", handleLanguageChange);
    };
  }, []);

  async function loadFaqData() {
    try {
      setIsFetching(true);

      const response = await axios.get("/api/homepage/faq");

      if (response.data && response.data.success && response.data.data) {
        const data = formatFaqData(response.data.data);

        setFormData(data);
        setSavedImageURL(data.imageURL);
        setSavedImagePublicId(data.imagePublicId);
        setImageError("");
      }
    } catch (error) {
      console.error("Failed to load FAQ:", error);
      toast.error("Failed to load FAQ section.");
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(function () {
    loadFaqData();
  }, []);

  function changeLanguage(code) {
    if (validationOrder.indexOf(code) === -1) return;

    setLanguage(code);
    localStorage.setItem("admin-content-language", code);

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { language: code },
      }),
    );
  }

  function updateField(field, value) {
    setFormData(function (previous) {
      const fieldObj = previous[field] || emptyTranslation();

      return {
        ...previous,
        [field]: {
          ...fieldObj,
          [language]: value,
        },
      };
    });
  }

  function updateFaq(index, field, value) {
    setFormData(function (previous) {
      return {
        ...previous,
        faqs: previous.faqs.map(function (faq, faqIndex) {
          if (faqIndex === index) {
            const fieldObj = faq[field] || emptyTranslation();

            return {
              ...faq,
              [field]: {
                ...fieldObj,
                [language]: value,
              },
            };
          }

          return faq;
        }),
      };
    });
  }

  function handleImageUrlChange(value) {
    setFormData(function (previous) {
      return {
        ...previous,
        imageURL: value,
        imagePublicId: "",
      };
    });

    setImageError("");
  }

  async function openCloudinaryWidget() {
    if (busy) return;

    if (!cloudName || !uploadPreset) {
      toast.error(
        "Cloudinary configuration is missing. Check your public environment variables.",
      );
      return;
    }

    if (!window.cloudinary) {
      toast.error("Image uploader is not ready. Please try again.");
      return;
    }

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: "bexon/images",
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5 * 1024 * 1024,
        cropping: false,
        showAdvancedOptions: false,
        styles: cloudinaryStyles(theme),
      },
      function (error, result) {
        if (error) {
          console.error("Cloudinary upload:", error);
          toast.error("Image upload failed. Please try again.");
          return;
        }

        if (!result || result.event !== "success") return;

        const imageUrl = result.info && result.info.secure_url;
        const publicId = result.info && result.info.public_id;

        if (!imageUrl || !publicId || !imageUrl.startsWith("https://")) {
          toast.error("Cloudinary did not return a valid image.");
          return;
        }

        setFormData(function (previous) {
          return {
            ...previous,
            imageURL: imageUrl,
            imagePublicId: publicId,
          };
        });

        setImageError("");
        toast.success("Image uploaded. Click Save All Changes to save it.");
      },
    );

    widget.open();
  }

  function validateForm() {
    const requiredFields = [
      {
        value: formData.title,
        label: "Section title",
        rich: true,
      },
      {
        value: formData.callTitle,
        label: "Call title",
        rich: true,
      },
      {
        value: formData.phoneNumber,
        label: "Phone number",
        rich: true,
      },
      {
        value: formData.phoneHref,
        label: "Phone link",
        rich: false,
      },
    ];

    for (let i = 0; i < validationOrder.length; i += 1) {
      const lang = validationOrder[i];

      for (let j = 0; j < requiredFields.length; j += 1) {
        const field = requiredFields[j];
        const raw = (field.value && field.value[lang]) || "";
        let value = "";

        if (field.rich) {
          value = stripHtml(raw);
        } else {
          value = String(raw).trim();
        }

        if (!value) {
          setLanguage(lang);
          toast.error(
            "Please complete the " +
              languageNames[lang] +
              " — " +
              field.label +
              " field.",
          );
          return false;
        }

        if (field.label === "Phone link" && !isValidPhoneHref(value)) {
          setLanguage(lang);
          toast.error(
            "Please enter a valid " +
              languageNames[lang] +
              " phone link, e.g. tel:+93700123456.",
          );
          return false;
        }
      }

      for (let index = 0; index < formData.faqs.length; index += 1) {
        const faq = formData.faqs[index];

        if (!faq.id) {
          toast.error("FAQ " + (index + 1) + " is missing its ID.");
          return false;
        }

        if (!stripHtml((faq.question && faq.question[lang]) || "")) {
          setLanguage(lang);
          toast.error(
            "Please complete the " +
              languageNames[lang] +
              " — FAQ " +
              (index + 1) +
              " question field.",
          );
          return false;
        }

        if (!stripHtml((faq.answer && faq.answer[lang]) || "")) {
          setLanguage(lang);
          toast.error(
            "Please complete the " +
              languageNames[lang] +
              " — FAQ " +
              (index + 1) +
              " answer field.",
          );
          return false;
        }
      }
    }

    if (!(formData.imageURL && formData.imageURL.trim()) && !savedImageURL) {
      toast.error("Please upload or enter an FAQ background image.");
      return false;
    }

    return true;
  }

  async function handleAllUpdates() {
    if (busy) return;
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const payload = {
        title: formData.title,
        callTitle: formData.callTitle,
        phoneNumber: formData.phoneNumber,
        phoneHref: formData.phoneHref,
        imageURL: formData.imageURL,
        imagePublicId: formData.imagePublicId,
        faqs: formData.faqs,
      };

      const response = await axios.put("/api/homepage/faq", payload);

      if (!response.data || !response.data.success) {
        throw new Error(
          (response.data && response.data.message) || "Failed to update FAQ.",
        );
      }

      const savedData = formatFaqData(response.data.data || formData);

      setFormData(savedData);
      setSavedImageURL(savedData.imageURL);
      setSavedImagePublicId(savedData.imagePublicId);
      setImageError("");

      toast.success("FAQ updated successfully.");
    } catch (error) {
      console.error("Failed to update FAQ:", error);

      const message =
        (error.response &&
          error.response.data &&
          (error.response.data.message || error.response.data.error)) ||
        error.message ||
        "Failed to update FAQ.";

      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <main
      dir="ltr"
      className="-m-4 space-y-6 bg-[var(--background)] p-4 pb-28 text-[var(--foreground)] sm:p-6"
    >
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={function () {
          setCloudinaryReady(true);
        }}
        onError={function () {
          setCloudinaryReady(false);
          toast.error("Could not load the Cloudinary image uploader.");
        }}
      />

      {/* Header */}
      <section className={cardClass}>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">FAQ Section</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Manage your FAQ headings, contact details, image, and questions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AdminLanguageBall
              language={language}
              selectedLanguage={language}
              onLanguageChange={changeLanguage}
            />

            {languages.map(function (item) {
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={function () {
                    changeLanguage(item.code);
                  }}
                  className={
                    "rounded-xl border px-4 py-2 text-sm font-medium transition " +
                    (language === item.code
                      ? "border-[#1E8A8A] bg-[#1E8A8A] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#1E8A8A] dark:border-white/10 dark:bg-[#16212C] dark:text-slate-300")
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section Settings */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Section Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update the FAQ section title. Use Quill highlight/color for
            emphasis.
          </p>
        </div>

        <div>
          <label className={labelClass}>
            Section Title ({languageNames[language]})
          </label>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <RichTextEditor
              key={"title-" + language}
              value={(formData.title && formData.title[language]) || ""}
              onChange={function (value) {
                updateField("title", value);
              }}
              placeholder="Enter section title"
              dir={inputDirection}
            />
          </div>
        </div>
      </section>

      {/* Background Image */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Background Image</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload an image through Cloudinary, or paste an existing image URL.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-[#16212C]">
            {formData.imageURL || savedImageURL ? (
              <img
                src={formData.imageURL || savedImageURL}
                alt="FAQ background preview"
                className="h-64 w-full object-cover"
                onError={function () {
                  setImageError("Unable to load image preview.");
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-3 p-6 text-center">
                <ImagePlus size={36} className="text-slate-400" />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No image selected
                </p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="url"
                value={formData.imageURL}
                onChange={function (event) {
                  handleImageUrlChange(event.target.value);
                }}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Paste an existing image URL, or upload a new one below.
              </p>
            </div>

            <div>
              <label className={labelClass}>Upload Image</label>

              <button
                type="button"
                onClick={openCloudinaryWidget}
                disabled={!cloudinaryReady || busy}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#176f6f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checking ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Upload size={18} />
                )}
                {checking
                  ? "Checking..."
                  : formData.imageURL
                    ? "Change Image"
                    : "Upload Image"}
              </button>

              {!cloudinaryReady && (
                <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                  Loading image uploader...
                </p>
              )}

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WEBP. Maximum size: 5MB.
              </p>

              {imageError && (
                <p className="mt-2 text-sm text-red-500">{imageError}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Contact Section</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage the call title and phone details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass}>
              Call Title ({languageNames[language]})
            </label>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <RichTextEditor
                key={"callTitle-" + language}
                value={
                  (formData.callTitle && formData.callTitle[language]) || ""
                }
                onChange={function (value) {
                  updateField("callTitle", value);
                }}
                placeholder="Enter call title"
                dir={inputDirection}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Phone Number ({languageNames[language]})
            </label>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
              <RichTextEditor
                key={"phoneNumber-" + language}
                value={
                  (formData.phoneNumber && formData.phoneNumber[language]) || ""
                }
                onChange={function (value) {
                  updateField("phoneNumber", value);
                }}
                placeholder="Enter phone number"
                dir={inputDirection}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Phone Link ({languageNames[language]})
            </label>
            <input
              type="text"
              value={(formData.phoneHref && formData.phoneHref[language]) || ""}
              onChange={function (event) {
                updateField("phoneHref", event.target.value);
              }}
              placeholder="tel:+93700123456"
              dir="ltr"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Use tel: followed by the phone number, e.g. tel:+93700123456.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Items */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">FAQ Items</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Edit each question and answer in {languageNames[language]}.
          </p>
        </div>

        {formData.faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-white/10">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No FAQ items found.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {formData.faqs.map(function (faq, index) {
              return (
                <div
                  key={faq.id || index}
                  className="rounded-xl border border-slate-200 p-4 sm:p-5 dark:border-white/10"
                >
                  <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    FAQ {index + 1}
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>
                        Question ({languageNames[language]})
                      </label>
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                        <RichTextEditor
                          key={
                            "faq-question-" + (faq.id || index) + "-" + language
                          }
                          value={(faq.question && faq.question[language]) || ""}
                          onChange={function (value) {
                            updateFaq(index, "question", value);
                          }}
                          placeholder="Enter FAQ question"
                          dir={inputDirection}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Answer ({languageNames[language]})
                      </label>
                      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
                        <RichTextEditor
                          key={
                            "faq-answer-" + (faq.id || index) + "-" + language
                          }
                          value={(faq.answer && faq.answer[language]) || ""}
                          onChange={function (value) {
                            updateFaq(index, "answer", value);
                          }}
                          placeholder="Enter FAQ answer"
                          dir={inputDirection}
                        />
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
        onReload={loadFaqData}
        onSave={handleAllUpdates}
        saving={isSaving}
        busy={busy}
        saveLabel="Save All Changes"
        savingLabel="Saving Changes..."
        reloadLabel="Reload Saved Data"
      />
    </main>
  );
}
