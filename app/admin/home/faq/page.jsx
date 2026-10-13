"use client";

import { useState } from "react";
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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#16212C] dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#38a3a3]";

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111B27] dark:shadow-black/20 sm:p-7";

const labelClass =
  "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300";

export default function FaqAdminPanel() {
  const [formData, setFormData] = useState({
    headingLineOne: "Need Help? Start",
    headingLineTwo: "Here...",
    imageURL: "",
    callHeadingLineOne: "Get Started",
    callHeadingLineTwo: "Free Call?",
    phoneNumber: "1-888-452-1505",
    phoneHref: "tel:18884521505",
    faqs: initialFaqs,
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const previewImage = previewUrl || formData.imageURL;

  const [uploading, setUploading] = useState(false);

  async function uploadImage() {
    if (!selectedImage && !formData.imageURL.trim()) {
      toast.error("Choose a file or enter an image URL.");
      return;
    }

    setUploading(true);

    try {
      let res;

      if (selectedImage) {
        const body = new FormData();
        body.append("file", selectedImage);
        res = await axios.post("/api/cloudinary-upload", body);
      } else {
        res = await axios.post("/api/cloudinary-upload", {
          imageUrl: formData.imageURL.trim(),
        });
      }

      const { url, publicId } = res.data;

      setFormData((current) => ({
        ...current,
        imageURL: url,
        imagePublicId: publicId,
      }));

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setSelectedImage(null);
      setPreviewUrl("");
      toast.success("Image uploaded to Cloudinary.");
      console.log("Cloudinary URL:", url);
    } catch (error) {
      toast.error(
        error.response?.data?.error || error.message || "Upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleImageSelect(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    event.target.value = "";
  }

  function handleImageUrlChange(event) {
    setFormData((current) => ({
      ...current,
      imageURL: event.target.value,
    }));

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedImage(null);
    setPreviewUrl("");
  }

  function handleAllUpdates() {
    console.log("Current form data:", {
      ...formData,
      imageFile: selectedImage,
    });
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
              <span className="px-2 text-slate-300 dark:text-slate-600">/</span>
              Homepage
              <span className="px-2 text-slate-300 dark:text-slate-600">/</span>
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
                  setFormData((current) => ({
                    ...current,
                    headingLineOne: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span className={labelClass}>Heading — line two</span>
              <input
                className={inputClass}
                value={formData.headingLineTwo}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    headingLineTwo: event.target.value,
                  }))
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
                      alt="Selected FAQ background"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="relative rounded-xl bg-black/15 px-5 py-4 backdrop-blur-sm">
                      <ImagePlus size={30} className="mx-auto mb-2" />
                      <p className="text-sm font-semibold">Image Preview</p>
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
                  setFormData((current) => ({
                    ...current,
                    callHeadingLineOne: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span className={labelClass}>Call card — line two</span>
              <input
                className={inputClass}
                value={formData.callHeadingLineTwo}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    callHeadingLineTwo: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span className={labelClass}>Phone number</span>
              <input
                className={inputClass}
                value={formData.phoneNumber}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    phoneNumber: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              <span className={labelClass}>Phone link</span>
              <input
                className={inputClass}
                value={formData.phoneHref}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    phoneHref: event.target.value,
                  }))
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
              Ready to review your changes?
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              For practice, this button logs your data in the browser console.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAllUpdates}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167575] focus-visible:ring-4 focus-visible:ring-[#1E8A8A]/20 focus-visible:outline-none"
          >
            <Save size={18} />
            Update Changes
          </button>
          <button type="button" onClick={uploadImage} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload to Cloudinary"}
          </button>
        </footer>
      </div>
    </main>
  );
}
