"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import {
  Image as ImageIcon,
  Link as LinkIcon,
  Loader2,
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

function emptyText() {
  return { en: "", ps: "", fa: "" };
}

function stripHtml(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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

function normalizeTranslation(value) {
  const base = emptyText();

  if (!value) {
    return base;
  }

  if (typeof value === "string") {
    base.en = value;
    return base;
  }

  base.en = value.en || "";
  base.ps = value.ps || "";
  base.fa = value.fa || "";

  return base;
}

export default function CtaBannerAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErr, setLangErr] = useState({ en: false, ps: false, fa: false });
  const [theme, setTheme] = useState("light");
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [data, setData] = useState({
    title: emptyText(),
    buttonText: emptyText(),
    buttonLink: "/contact",
    image: "",
    imagePublicId: "",
  });

  const busy = saving || checking;

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

  async function loadData() {
    setLoading(true);

    try {
      const res = await axios.get(API_URL);
      const d = res.data && res.data.data;

      if (d) {
        setData({
          title: normalizeTranslation(d.title),
          buttonText: normalizeTranslation(d.buttonText),
          buttonLink: d.buttonLink || "/contact",
          image: d.image || "",
          imagePublicId: d.imagePublicId || "",
        });
        setLangErr({ en: false, ps: false, fa: false });
      }
    } catch (error) {
      toast.error("Failed to load CTA Banner data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(function () {
    loadData();
  }, []);

  function changeLanguage(code) {
    let valid = false;

    for (let i = 0; i < LANGS.length; i += 1) {
      if (LANGS[i].code === code) {
        valid = true;
        break;
      }
    }

    if (!valid) return;

    setLanguage(code);

    try {
      localStorage.setItem("admin-content-language", code);
    } catch (error) {}

    window.dispatchEvent(
      new CustomEvent("admin-language-change", {
        detail: { languageId: code },
      }),
    );
  }

  function setField(field, value) {
    setData(function (previous) {
      const fieldObj = previous[field] || emptyText();

      return {
        ...previous,
        [field]: {
          ...fieldObj,
          [language]: value,
        },
      };
    });

    setLangErr(function (previous) {
      return {
        ...previous,
        [language]: false,
      };
    });
  }

  async function uploadImage() {
    if (busy) return;

    if (!window.cloudinary) {
      toast.error("Cloudinary is loading...");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary keys missing.");
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
        multiple: false,
        folder: "bexon/cta_banner",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5 * 1024 * 1024,
        styles: cloudinaryStyles(theme),
      },
      function (err, result) {
        if (err) {
          toast.error("Upload failed.");
          return;
        }

        if (!result || result.event !== "success") return;

        const imageUrl = result.info && result.info.secure_url;
        const publicId = result.info && result.info.public_id;

        if (!imageUrl || !publicId) {
          toast.error("Cloudinary did not return a valid image.");
          return;
        }

        // Only update references in state. Do not delete old Cloudinary assets here.
        setData(function (previous) {
          return {
            ...previous,
            image: imageUrl,
            imagePublicId: publicId,
          };
        });

        toast.success("Image uploaded. Click Save All Changes to persist it.");
      },
    );

    widget.open();
  }

  function removeImage() {
    if (!confirm("Remove this image?")) return;

    // Only clear references in state. Do not delete from Cloudinary here.
    setData(function (previous) {
      return {
        ...previous,
        image: "",
        imagePublicId: "",
      };
    });

    toast.success("Image removed from form. Save to persist.");
  }

  async function saveAll() {
    if (busy) return;

    const errs = { en: false, ps: false, fa: false };
    let firstBad = null;

    for (let i = 0; i < LANGS.length; i += 1) {
      const code = LANGS[i].code;
      const titleValue = stripHtml((data.title && data.title[code]) || "");
      const buttonValue = stripHtml(
        (data.buttonText && data.buttonText[code]) || "",
      );

      if (!titleValue || !buttonValue) {
        errs[code] = true;
        if (!firstBad) {
          firstBad = code;
        }
      }
    }

    setLangErr(errs);

    if (firstBad) {
      changeLanguage(firstBad);
      toast.error(
        "Please fill Title and Button Text in " + firstBad.toUpperCase(),
      );
      return;
    }

    if (!data.buttonLink || !String(data.buttonLink).trim()) {
      toast.error("Button Link URL is required.");
      return;
    }

    setSaving(true);

    try {
      const res = await axios.post(API_URL, {
        title: data.title,
        buttonText: data.buttonText,
        buttonLink: data.buttonLink,
        image: data.image,
        imagePublicId: data.imagePublicId,
      });

      if (!res.data || !res.data.success) {
        throw new Error((res.data && res.data.message) || "Save failed");
      }

      const saved = res.data.data;
      if (saved) {
        setData({
          title: normalizeTranslation(saved.title),
          buttonText: normalizeTranslation(saved.buttonText),
          buttonLink: saved.buttonLink || "/contact",
          image: saved.image || "",
          imagePublicId: saved.imagePublicId || "",
        });
      }

      toast.success("CTA Banner saved successfully.");
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "Failed to save.";

      toast.error(message);
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

  const dir = language === "en" ? "ltr" : "rtl";
  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";

  return (
    <div className="min-h-screen bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
        onLoad={function () {
          setCloudinaryReady(true);
        }}
        onError={function () {
          setCloudinaryReady(false);
          toast.error("Could not load the Cloudinary image uploader.");
        }}
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
              {LANGS.map(function (item) {
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={function () {
                      changeLanguage(item.code);
                    }}
                    className={
                      "relative rounded-lg px-3 py-2 text-xs font-semibold transition " +
                      (language === item.code
                        ? "bg-[var(--accent)] text-white shadow"
                        : "text-[var(--muted)] hover:bg-[var(--accent)]/10")
                    }
                  >
                    {item.label}
                    {langErr[item.code] && (
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
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <RichTextEditor
                  key={"title-" + language}
                  value={(data.title && data.title[language]) || ""}
                  onChange={function (value) {
                    setField("title", value);
                  }}
                  placeholder="Let's Build Future Together."
                  dir={dir}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Button Text *
              </label>
              <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                <RichTextEditor
                  key={"buttonText-" + language}
                  value={(data.buttonText && data.buttonText[language]) || ""}
                  onChange={function (value) {
                    setField("buttonText", value);
                  }}
                  placeholder="Get Started Now"
                  dir={dir}
                />
              </div>
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
              onChange={function (e) {
                const value = e.target.value;
                setData(function (previous) {
                  return {
                    ...previous,
                    buttonLink: value,
                  };
                });
              }}
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
                  disabled={busy || !cloudinaryReady}
                  className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
                >
                  {checking ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Upload size={16} />
                  )}
                  {checking ? "Checking..." : "Change Image"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={uploadImage}
                disabled={busy || !cloudinaryReady}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[var(--border)] py-16 text-[var(--muted)] transition-all hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 hover:text-[var(--accent)] disabled:opacity-50"
              >
                {checking ? (
                  <Loader2 size={32} className="animate-spin opacity-50" />
                ) : (
                  <Upload size={32} className="opacity-50" />
                )}
                <span className="font-semibold">
                  {checking ? "Checking..." : "Upload Feature Image"}
                </span>
              </button>
            )}
          </div>
        </section>
      </div>

      <AdminStickyFooter
        onReload={loadData}
        onSave={saveAll}
        saving={saving}
        busy={busy}
        saveLabel="Save All Changes"
        savingLabel="Saving All..."
        reloadLabel="Reload Saved Data"
      />
    </div>
  );
}
