"use client";

import { useEffect, useState } from "react";
import { HelpCircle, ImagePlus, Moon, Save, Upload } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const initialFaqs = [
  {
    id: "faq-1",
    question: "What services does Bexon offer to clients?",
    answer:
      "Getting started is easy! Simply reach out to us through our contact form or give us a call, and we'll schedule a consultation to discuss your project and how we can best assist you.",
  },
  {
    id: "faq-2",
    question: "How do I get started with Corporate Business?",
    answer: "",
  },
  {
    id: "faq-3",
    question: "How do you ensure the success of a project?",
    answer: "",
  },
  {
    id: "faq-4",
    question: "How long will it take to complete my project?",
    answer: "",
  },
  {
    id: "faq-5",
    question: "Can I track the progress of my project?",
    answer: "",
  },
];

const defaultFormData = {
  headingLineOne: "Need Help? Start",
  headingLineTwo: "Here...",
  imageURL: "",
  imagePublicId: "",
  callHeadingLineOne: "Get Started",
  callHeadingLineTwo: "Free Call?",
  phoneNumber: "1-888-452-1505",
  phoneHref: "tel:18884521505",
  faqs: initialFaqs,
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38a3a3]";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111B27] dark:shadow-black/20 sm:p-7";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function FaqAdminPanel() {
  const [formData, setFormData] = useState(defaultFormData);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [savedImageURL, setSavedImageURL] = useState("");
  const [savedImagePublicId, setSavedImagePublicId] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const previewImage = previewUrl || formData.imageURL;

  useEffect(() => {
    async function getFaqData() {
      try {
        const res = await axios.get("/api/homepage/faq");

        if (res.data.success && res.data.data) {
          const data = res.data.data;

          const loadedData = {
            ...defaultFormData,
            ...data,
            faqs:
              Array.isArray(data.faqs) && data.faqs.length > 0
                ? data.faqs
                : initialFaqs,
          };

          setFormData(loadedData);
          setSavedImageURL(loadedData.imageURL || "");
          setSavedImagePublicId(loadedData.imagePublicId || "");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load FAQ data.",
        );
      } finally {
        setIsFetching(false);
      }
    }

    getFaqData();
  }, []);

  function updateField(field, value) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleImageSelect(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      event.target.value = "";
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    event.target.value = "";
  }

  function handleImageUrlChange(event) {
    const value = event.target.value;

    setFormData((current) => ({
      ...current,
      imageURL: value,
    }));

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedImage(null);
    setPreviewUrl("");
  }

  async function handleAllUpdates() {
    if (isSaving) return;

    setIsSaving(true);

    try {
      let updatedData = { ...formData };

      const imageUrlChanged =
        formData.imageURL.trim() !== savedImageURL;

      // Upload the selected image or a newly entered image URL.
      if (selectedImage || imageUrlChanged) {
        if (!selectedImage && !formData.imageURL.trim()) {
          updatedData.imageURL = "";
          updatedData.imagePublicId = "";
        } else {
          const body = selectedImage
            ? (() => {
                const form = new FormData();
                form.append("file", selectedImage);
                return form;
              })()
            : { imageUrl: formData.imageURL.trim() };

          const uploadResponse = await axios.post(
            "/api/homepage/faq/upload",
            body,
          );

          const result = uploadResponse.data;
          const secureUrl = result.secure_url || result.url;
          const publicId = result.publicId || result.public_id;

          if (!secureUrl || !publicId) {
            throw new Error(
              "Image upload succeeded without returning its secure URL and public ID.",
            );
          }

          updatedData = {
            ...updatedData,
            imageURL: secureUrl,
            imagePublicId: publicId,
          };
        }
      }

      // Save the FAQ data after the image upload succeeds.
      const saveResponse = await axios.put(
        "/api/homepage/faq",
        updatedData,
      );

      if (!saveResponse.data.success) {
        throw new Error(
          saveResponse.data.message || "Failed to save FAQ data.",
        );
      }

      const savedData = saveResponse.data.data || updatedData;

      setFormData((current) => ({
        ...current,
        ...savedData,
      }));

      setSavedImageURL(savedData.imageURL || updatedData.imageURL || "");
      setSavedImagePublicId(
        savedData.imagePublicId || updatedData.imagePublicId || "",
      );

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setPreviewUrl("");
      setSelectedImage(null);

      toast.success("FAQ updated successfully.");

      // Delete the previous Cloudinary image after saving its replacement.
      const newPublicId = savedData.imagePublicId || updatedData.imagePublicId;

      if (
        savedImagePublicId &&
        newPublicId !== savedImagePublicId
      ) {
        try {
          await axios.delete("/api/homepage/faq/delete-image", {
            data: { publicId: savedImagePublicId },
          });
        } catch {
          toast.warning(
            "FAQ saved, but the previous Cloudinary image could not be deleted.",
          );
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to update FAQ.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F7F7] px-4 py-8 text-slate-900 sm:px-6 lg:px-8 dark:bg-[#0C1420] dark:text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header
          className={`${cardClass} flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between`}
        >
          <div>
            <nav
              className="mb-3 text-sm text-slate-500 dark:text-slate-400"
              aria-label="Breadcrumb"
            >
              Admin
              <span className="px-2 text-slate-300 dark:text-slate-600">
                /
              </span>
              Homepage
              <span className="px-2 text-slate-300 dark:text-slate-600">
                /
              </span>
              <span className="text-slate-700 dark:text-slate-200">
                FAQ Section
              </span>
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A]/10 text-[#1E8A8A] dark:bg-[#1E8A8A]/20 dark:text-[#62cccc]">
                <HelpCircle size={22} />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  FAQ Section
                </h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Edit the section content and existing questions.
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 dark:border-white/10 dark:bg-[#16212C] dark:text-slate-300">
            <Moon size={16} className="text-[#1E8A8A] dark:text-[#62cccc]" />
            Dark theme
          </div>
        </header>

        {isFetching ? (
          <section className={`${cardClass} py-12 text-center`}>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#1E8A8A]/20 border-t-[#1E8A8A]" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading FAQ data...
            </p>
          </section>
        ) : (
          <>
            <section className={cardClass}>
              <div className="mb-6 border-b border-slate-100 pb-5 dark:border-white/10">
                <p className="mb-1 text-xs font-semibold tracking-wider text-[#1E8A8A] uppercase dark:text-[#62cccc]">
                  Section settings
                </p>
                <h2 className="text-lg font-bold tracking-tight">
                  Content and contact
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Edit the heading, background image, and call card.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Heading — line one</span>
                  <input
                    className={inputClass}
                    value={formData.headingLineOne}
                    onChange={(event) =>
                      updateField("headingLineOne", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Heading — line two</span>
                  <input
                    className={inputClass}
                    value={formData.headingLineTwo}
                    onChange={(event) =>
                      updateField("headingLineTwo", event.target.value)
                    }
                  />
                </label>

                <div className="sm:col-span-2">
                  <span className={labelClass}>Background image</span>

                  <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 sm:items-center dark:border-white/10 dark:bg-[#16212C]">
                    <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-gradient-to-br from-[#dce8e4] via-[#aabdb6] to-[#607b73] p-6 text-center text-white dark:border-white/10 dark:from-[#304541] dark:via-[#273a38] dark:to-[#172522]">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="FAQ background preview"
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="relative rounded-xl bg-black/15 px-5 py-4 backdrop-blur-sm">
                          <ImagePlus size={30} className="mx-auto mb-2" />
                          <p className="text-sm font-semibold">
                            Image Preview
                          </p>
                          <p className="mt-1 text-xs text-white/85">
                            Choose an image to preview it here
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className={labelClass}>Image URL</span>
                        <input
                          className={inputClass}
                          placeholder="https://... or /images/help.jpg"
                          value={formData.imageURL}
                          onChange={handleImageUrlChange}
                        />
                      </label>

                      <label className="inline-flex min-h-11 w-fit cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111B27] dark:text-slate-300 dark:hover:border-[#38a3a3] dark:hover:text-[#62cccc]">
                        <Upload size={17} />
                        Choose Image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageSelect}
                        />
                      </label>

                      {selectedImage && (
                        <p className="text-xs break-all text-slate-500 dark:text-slate-400">
                          Selected: {selectedImage.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <label>
                  <span className={labelClass}>Call card — line one</span>
                  <input
                    className={inputClass}
                    value={formData.callHeadingLineOne}
                    onChange={(event) =>
                      updateField("callHeadingLineOne", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Call card — line two</span>
                  <input
                    className={inputClass}
                    value={formData.callHeadingLineTwo}
                    onChange={(event) =>
                      updateField("callHeadingLineTwo", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Phone number</span>
                  <input
                    className={inputClass}
                    value={formData.phoneNumber}
                    onChange={(event) =>
                      updateField("phoneNumber", event.target.value)
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Phone link</span>
                  <input
                    className={inputClass}
                    value={formData.phoneHref}
                    onChange={(event) =>
                      updateField("phoneHref", event.target.value)
                    }
                  />
                </label>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-6 border-b border-slate-100 pb-5 dark:border-white/10">
                <p className="mb-1 text-xs font-semibold tracking-wider text-[#1E8A8A] uppercase dark:text-[#62cccc]">
                  Existing content
                </p>
                <h2 className="text-lg font-bold tracking-tight">FAQ Items</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Edit the questions and answers already on your website.
                </p>
              </div>

              <div className="space-y-4">
                {formData.faqs.map((faq, index) => (
                  <article
                    key={faq.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-[#16212C]"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-semibold text-[#1E8A8A] dark:bg-[#1E8A8A]/20 dark:text-[#62cccc]">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        FAQ Item {index + 1}
                      </h3>
                    </div>

                    <div className="space-y-4">
                      <label className="block">
                        <span className={labelClass}>Question</span>
                        <input
                          className={inputClass}
                          value={faq.question}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              faqs: current.faqs.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, question: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </label>

                      <label className="block">
                        <span className={labelClass}>Answer</span>
                        <textarea
                          className={`${inputClass} min-h-24 resize-y`}
                          value={faq.answer}
                          placeholder="Write an answer..."
                          rows={3}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              faqs: current.faqs.map((item, itemIndex) =>
                                itemIndex === index
                                  ? { ...item, answer: event.target.value }
                                  : item,
                              ),
                            }))
                          }
                        />
                      </label>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <footer className="sticky bottom-4 z-10 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Ready to save your changes?
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Images upload automatically when you update.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAllUpdates}
                disabled={isSaving}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167575] focus-visible:ring-4 focus-visible:ring-[#1E8A8A]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />
                {isSaving ? "Saving Changes..." : "Update Changes"}
              </button>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
