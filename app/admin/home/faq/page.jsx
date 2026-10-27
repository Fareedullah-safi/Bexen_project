"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import { ImagePlus, Save, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

const emptyTranslation = {
  en: "",
  ps: "",
  fa: "",
};

const defaultFormData = {
  headingLineOne: { ...emptyTranslation },
  headingLineTwo: { ...emptyTranslation },
  imageURL: "",
  imagePublicId: "",
  callHeadingLineOne: { ...emptyTranslation },
  callHeadingLineTwo: { ...emptyTranslation },
  phoneNumber: { ...emptyTranslation },
  phoneHref: { ...emptyTranslation },
  faqs: [],
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38a3a3]";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111B27] dark:shadow-black/20 sm:p-7";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

const toTranslation = (value) => {
  if (typeof value === "string") {
    return { en: value, ps: "", fa: "" };
  }

  return {
    en: value?.en || "",
    ps: value?.ps || "",
    fa: value?.fa || "",
  };
};

const formatFaqData = (data) => ({
  ...defaultFormData,
  ...data,
  headingLineOne: toTranslation(data?.headingLineOne),
  headingLineTwo: toTranslation(data?.headingLineTwo),
  callHeadingLineOne: toTranslation(data?.callHeadingLineOne),
  callHeadingLineTwo: toTranslation(data?.callHeadingLineTwo),
  phoneNumber: toTranslation(data?.phoneNumber),
  phoneHref: toTranslation(data?.phoneHref),
  imageURL: data?.imageURL || "",
  imagePublicId: data?.imagePublicId || "",
  faqs: Array.isArray(data?.faqs)
    ? data.faqs.map((faq, index) => ({
        ...faq,
        id: faq.id || String(index + 1),
        question: toTranslation(faq.question),
        answer: toTranslation(faq.answer),
      }))
    : [],
});

// Validate a telephone link in international or local digit format.
const isValidPhoneHref = (value) => {
  return /^tel:\+?[0-9]{7,15}$/.test(value.trim());
};

export default function FaqAdminPanel() {
  const [formData, setFormData] = useState(defaultFormData);
  const [language, setLanguage] = useState("en");

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savedImageURL, setSavedImageURL] = useState("");
  const [savedImagePublicId, setSavedImagePublicId] = useState("");

  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageError, setImageError] = useState("");

  // Synchronize with the admin language selector.
  useEffect(() => {
    const savedLanguage = localStorage.getItem("admin-content-language");

    if (validationOrder.includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    const handleLanguageChange = (event) => {
      const nextLanguage =
        typeof event.detail === "string"
          ? event.detail
          : event.detail?.language;

      if (validationOrder.includes(nextLanguage)) {
        setLanguage(nextLanguage);
      }
    };

    window.addEventListener("admin-language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("admin-language-change", handleLanguageChange);
    };
  }, []);

  // Load FAQ data.
  useEffect(() => {
    const fetchFaqData = async () => {
      try {
        setIsFetching(true);

        const response = await axios.get("/api/homepage/faq");

        if (response.data?.success && response.data?.data) {
          const data = formatFaqData(response.data.data);

          setFormData(data);
          setSavedImageURL(data.imageURL);
          setSavedImagePublicId(data.imagePublicId);
        }
      } catch (error) {
        console.error("Failed to load FAQ:", error);
        toast.error("Failed to load FAQ section.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchFaqData();
  }, []);

  // Change language and notify other admin components.
  const changeLanguage = (code) => {
    if (!validationOrder.includes(code)) return;

    setLanguage(code);
    localStorage.setItem("admin-content-language", code);

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { language: code },
      }),
    );
  };

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: {
        ...previous[field],
        [language]: value,
      },
    }));
  };

  const updateFaq = (index, field, value) => {
    setFormData((previous) => ({
      ...previous,
      faqs: previous.faqs.map((faq, faqIndex) =>
        faqIndex === index
          ? {
              ...faq,
              [field]: {
                ...faq[field],
                [language]: value,
              },
            }
          : faq,
      ),
    }));
  };

  // Validate selected image.
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image file.");
      toast.error("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be less than 5MB.");
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    setImageError("");
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));

    setFormData((previous) => ({
      ...previous,
      imageURL: "",
      imagePublicId: "",
    }));
  };

  const handleImageUrlChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      imageURL: value,
      imagePublicId: "",
    }));

    setSelectedImage(null);
    setPreviewUrl("");
    setImageError("");
  };

  // Validate all languages in order: English -> Pashto -> Dari.
  const validateForm = () => {
    const requiredFields = [
      {
        value: formData.headingLineOne,
        label: "First headline",
      },
      {
        value: formData.headingLineTwo,
        label: "Second headline",
      },
      {
        value: formData.callHeadingLineOne,
        label: "First call heading",
      },
      {
        value: formData.callHeadingLineTwo,
        label: "Second call heading",
      },
      {
        value: formData.phoneNumber,
        label: "Phone number",
      },
      {
        value: formData.phoneHref,
        label: "Phone link",
      },
    ];

    for (const lang of validationOrder) {
      for (const field of requiredFields) {
        const value = field.value?.[lang]?.trim() || "";

        if (!value) {
          toast.error(
            `Please complete the ${languageNames[lang]} — ${field.label} field.`,
          );
          return false;
        }

        if (field.label === "Phone link" && !isValidPhoneHref(value)) {
          toast.error(
            `Please enter a valid ${languageNames[lang]} phone link, e.g. tel:+93700123456.`,
          );
          return false;
        }
      }

      for (let index = 0; index < formData.faqs.length; index++) {
        const faq = formData.faqs[index];

        if (!faq.id) {
          toast.error(`FAQ ${index + 1} is missing its ID.`);
          return false;
        }

        if (!faq.question?.[lang]?.trim()) {
          toast.error(
            `Please complete the ${languageNames[lang]} — FAQ ${index + 1} question field.`,
          );
          return false;
        }

        if (!faq.answer?.[lang]?.trim()) {
          toast.error(
            `Please complete the ${languageNames[lang]} — FAQ ${index + 1} answer field.`,
          );
          return false;
        }
      }
    }

    if (!selectedImage && !formData.imageURL?.trim() && !savedImageURL) {
      toast.error("Please select or enter an FAQ background image.");
      return false;
    }

    return true;
  };

  // Upload image and save FAQ data.
  const handleAllUpdates = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      let updatedData = { ...formData };

      const imageUrlChanged = formData.imageURL.trim() !== savedImageURL;

      if (selectedImage || imageUrlChanged) {
        let uploadResponse;

        if (selectedImage) {
          const uploadData = new FormData();
          uploadData.append("file", selectedImage);

          uploadResponse = await axios.post(
            "/api/homepage/faq/upload",
            uploadData,
          );
        } else {
          // The API expects JSON when uploading an image from a URL.
          uploadResponse = await axios.post(
            "/api/homepage/faq/upload",
            { imageUrl: formData.imageURL.trim() },
            { headers: { "Content-Type": "application/json" } },
          );
        }

        // The upload API returns { url, publicId } directly.
        const imageURL = uploadResponse.data?.url;
        const imagePublicId = uploadResponse.data?.publicId;

        if (!imageURL) {
          throw new Error(
            uploadResponse.data?.error ||
              "Image upload failed: image URL is missing.",
          );
        }

        updatedData = {
          ...updatedData,
          imageURL,
          imagePublicId: imagePublicId || "",
        };
      }

      const response = await axios.put("/api/homepage/faq", updatedData);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to update FAQ.");
      }

      const savedData = formatFaqData(response.data?.data || updatedData);

      setFormData(savedData);
      setSavedImageURL(savedData.imageURL);
      setSavedImagePublicId(savedData.imagePublicId);

      setSelectedImage(null);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl("");
      setImageError("");

      if (
        savedImagePublicId &&
        savedImagePublicId !== savedData.imagePublicId
      ) {
        try {
          await axios.delete("/api/homepage/faq/delete-image", {
            data: { publicId: savedImagePublicId },
          });
        } catch (deleteError) {
          console.error("Failed to delete previous FAQ image:", deleteError);
        }
      }

      toast.success("FAQ updated successfully.");
    } catch (error) {
      console.error("Failed to update FAQ:", error);

      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update FAQ.",
      );
    } finally {
      setIsSaving(false);
    }
  };

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
      className="-m-4 space-y-6 bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6"
    >
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

            {languages.map((item) => (
              <button
                key={item.code}
                type="button"
                onClick={() => changeLanguage(item.code)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                  language === item.code
                    ? "border-[#1E8A8A] bg-[#1E8A8A] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-[#1E8A8A] dark:border-white/10 dark:bg-[#16212C] dark:text-slate-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Section Settings */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Section Settings</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update the FAQ section headings.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              First Headline ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.headingLineOne[language]}
              onChange={(event) =>
                updateField("headingLineOne", event.target.value)
              }
              placeholder="Enter first headline"
              dir={language === "en" ? "ltr" : "rtl"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Second Headline ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.headingLineTwo[language]}
              onChange={(event) =>
                updateField("headingLineTwo", event.target.value)
              }
              placeholder="Enter second headline"
              dir={language === "en" ? "ltr" : "rtl"}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Background Image */}
      <section className={cardClass}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Background Image</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Upload an image or provide an image URL.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 dark:border-white/10 dark:bg-[#16212C]">
            {previewUrl || formData.imageURL || savedImageURL ? (
              <img
                src={previewUrl || formData.imageURL || savedImageURL}
                alt="FAQ background preview"
                className="h-64 w-full object-cover"
                onError={() => setImageError("Unable to load image preview.")}
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
                onChange={(event) => handleImageUrlChange(event.target.value)}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Upload Image</label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#16212C] dark:text-slate-300">
                <Upload size={18} />
                {selectedImage ? selectedImage.name : "Choose Image"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </label>

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
            Manage the contact headings and phone details.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              First Call Heading ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.callHeadingLineOne[language]}
              onChange={(event) =>
                updateField("callHeadingLineOne", event.target.value)
              }
              placeholder="Enter first call heading"
              dir={language === "en" ? "ltr" : "rtl"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Second Call Heading ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.callHeadingLineTwo[language]}
              onChange={(event) =>
                updateField("callHeadingLineTwo", event.target.value)
              }
              placeholder="Enter second call heading"
              dir={language === "en" ? "ltr" : "rtl"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Phone Number ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.phoneNumber[language]}
              onChange={(event) =>
                updateField("phoneNumber", event.target.value)
              }
              placeholder="Enter phone number"
              dir={language === "en" ? "ltr" : "rtl"}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Phone Link ({languageNames[language]})
            </label>
            <input
              type="text"
              value={formData.phoneHref[language]}
              onChange={(event) => updateField("phoneHref", event.target.value)}
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
            {formData.faqs.map((faq, index) => (
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
                    <input
                      type="text"
                      value={faq.question[language]}
                      onChange={(event) =>
                        updateFaq(index, "question", event.target.value)
                      }
                      placeholder="Enter FAQ question"
                      dir={language === "en" ? "ltr" : "rtl"}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Answer ({languageNames[language]})
                    </label>
                    <textarea
                      value={faq.answer[language]}
                      onChange={(event) =>
                        updateFaq(index, "answer", event.target.value)
                      }
                      placeholder="Enter FAQ answer"
                      rows={4}
                      dir={language === "en" ? "ltr" : "rtl"}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Save Changes */}
      <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-[#111B27]/95">
        <button
          type="button"
          onClick={handleAllUpdates}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176f6f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Spinner />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={18} />
              Update Changes
            </>
          )}
        </button>
      </div>
    </main>
  );
}
