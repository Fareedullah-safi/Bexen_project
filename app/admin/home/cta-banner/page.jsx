"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
  Save,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/footerandprofile/cta-banner";
const LANGS = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const emptyText = () => ({ en: "", ps: "", fa: "" });

export default function CtaBannerAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErr, setLangErr] = useState({ en: false, ps: false, fa: false });
  const [data, setData] = useState({
    title: emptyText(),
    buttonText: emptyText(),
    buttonLink: "/contact",
    image: "",
    imagePublicId: "",
  });

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const d = res.data?.data;
        if (!d) return;
        setData({
          title: { ...emptyText(), ...d.title },
          buttonText: { ...emptyText(), ...d.buttonText },
          buttonLink: d.buttonLink || "/contact",
          image: d.image || "",
          imagePublicId: d.imagePublicId || "",
        });
      })
      .catch(() => toast.error("Failed to load CTA Banner data."))
      .finally(() => setLoading(false));
  }, []);

  // Standardized language synchronization
  const changeLanguage = (code) => {
    if (!LANGS.some((l) => l.code === code)) return;
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

  const setField = (field, value) => {
    setData((p) => ({
      ...p,
      [field]: { ...p[field], [language]: value },
    }));
    setLangErr((p) => ({ ...p, [language]: false }));
  };

  const uploadImage = () => {
    if (!window.cloudinary) return toast.error("Cloudinary is loading...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset)
      return toast.error("Cloudinary keys missing.");

    window.cloudinary
      .createUploadWidget(
        {
          cloudName,
          uploadPreset,
          multiple: false,
          folder: "bexon/cta_banner",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          maxFileSize: 5 * 1024 * 1024,
        },
        async (err, result) => {
          if (err) return toast.error("Upload failed.");
          if (result?.event === "success") {
            // Delete old image if it exists
            if (data.imagePublicId) {
              try {
                await axios.post(API_URL, {
                  action: "destroy_image",
                  publicId: data.imagePublicId,
                });
              } catch (e) {}
            }
            setData((p) => ({
              ...p,
              image: result.info.secure_url,
              imagePublicId: result.info.public_id,
            }));
            toast.success("Image uploaded successfully.");
          }
        },
      )
      .open();
  };

  const removeImage = async () => {
    if (!confirm("Remove this image?")) return;
    if (data.imagePublicId) {
      try {
        await axios.post(API_URL, {
          action: "destroy_image",
          publicId: data.imagePublicId,
        });
      } catch (e) {
        return toast.error("Failed to remove image from cloud.");
      }
    }
    setData((p) => ({ ...p, image: "", imagePublicId: "" }));
    toast.success("Image removed.");
  };

  const handleSave = async () => {
    const errs = { en: false, ps: false, fa: false };
    let firstBad = null;

    // Validate required fields across all languages
    for (const { code } of LANGS) {
      if (!data.title[code]?.trim() || !data.buttonText[code]?.trim()) {
        errs[code] = true;
        if (!firstBad) firstBad = code;
      }
    }

    setLangErr(errs);

    if (firstBad) {
      changeLanguage(firstBad);
      return toast.error(
        `Please fill Title and Button Text in ${firstBad.toUpperCase()}`,
      );
    }

    if (!data.buttonLink?.trim()) {
      return toast.error("Button Link URL is required.");
    }

    setSaving(true);
    try {
      const res = await axios.post(API_URL, data);
      if (!res.data?.success)
        throw new Error(res.data?.message || "Save failed");
      toast.success("CTA Banner saved successfully.");
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "Failed to save.");
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

  const dir = language === "en" ? "ltr" : "rtl";
  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Homepage Elements
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">CTA Banner Admin</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Curate the call-to-action title, button link, and feature image.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
              {LANGS.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => changeLanguage(item.code)}
                  className={`relative rounded-lg px-3 py-2 text-xs font-semibold transition ${
                    language === item.code
                      ? "bg-[var(--accent)] text-white shadow"
                      : "text-[var(--muted)] hover:bg-[var(--accent)]/10"
                  }`}
                >
                  {item.label}
                  {langErr[item.code] && (
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
        </header>

        {/* TEXT CONTENT */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Type size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">
              Text Content ({language.toUpperCase()})
            </h2>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Banner Title *
              </label>
              <textarea
                dir={dir}
                rows={2}
                value={data.title[language] || ""}
                onChange={(e) => setField("title", e.target.value)}
                className={`${inputClass} resize-y`}
                placeholder="Let's Build Future Together."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Button Text *
              </label>
              <input
                dir={dir}
                value={data.buttonText[language] || ""}
                onChange={(e) => setField("buttonText", e.target.value)}
                className={inputClass}
                placeholder="Get Started Now"
              />
            </div>
          </div>
        </section>

        {/* DESTINATION LINK */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <LinkIcon size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Button Destination Link</h2>
          </div>
          <div className="p-4 sm:p-6">
            <label className="mb-1.5 block text-sm font-semibold">
              Global URL / Path *
            </label>
            <input
              dir="ltr"
              value={data.buttonLink}
              onChange={(e) =>
                setData((p) => ({ ...p, buttonLink: e.target.value }))
              }
              className={inputClass}
              placeholder="/contact  or  https://example.com"
            />
          </div>
        </section>

        {/* IMAGE UPLOAD */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <ImageIcon size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Feature Image</h2>
          </div>
          <div className="bg-[var(--surface-soft)]/50 p-4 sm:p-6">
            {data.image ? (
              <div className="flex flex-col items-start gap-4 sm:flex-row">
                <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2">
                  <img
                    src={data.image}
                    alt="CTA Preview"
                    className="h-40 w-auto rounded-lg object-cover shadow-sm sm:h-48"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md transition hover:bg-red-700"
                    title="Delete Image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={uploadImage}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  <Upload size={16} /> Change Image
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={uploadImage}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] py-16 text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)]"
              >
                <Upload size={32} className="opacity-50" />
                <span className="font-semibold">Upload Feature Image</span>
              </button>
            )}
          </div>
        </section>

        {/* STICKY SAVE */}
        <div className="sticky bottom-3 z-40 flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">
            Editing:{" "}
            <span className="font-semibold text-[var(--accent)]">
              {LANGS.find((l) => l.code === language)?.label}
            </span>
            {" · "}
            Ensure all languages are completed before saving.
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 py-3.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Save All Changes
          </button>
        </div>
      </div>
    </div>
  );
}
