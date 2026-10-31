"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Globe,
  Loader2,
  Mail,
  Phone,
  Save,
  Settings,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// ==========================================
// 1. CONSTANTS
// ==========================================
const API_URL = "/api/footerandprofile";

const LANGS = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const SOCIAL_PLATFORMS = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "x", label: "X (Twitter)" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "github", label: "GitHub" },
  { id: "whatsapp", label: "WhatsApp" },
];

const emptyText3 = () => ({ en: "", ps: "", fa: "" });

const defaultData = () => ({
  logo: "",
  logoPublicId: "",
  projectName: "Bexon",
  description: emptyText3(),
  contact: { phone: "", email: "" },
  socials: {
    facebook: "",
    instagram: "",
    x: "",
    linkedin: "",
    youtube: "",
    github: "",
    whatsapp: "",
  },
  newsletter: {
    heading: emptyText3(),
    placeholder: emptyText3(),
    terms: emptyText3(),
  },
});

export default function FooterAdmin() {
  // ==========================================
  // 2. STATE
  // ==========================================
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState("en");
  const [langErr, setLangErr] = useState({ en: false, ps: false, fa: false });
  const [data, setData] = useState(defaultData());

  // ==========================================
  // 3. LOAD DATA
  // ==========================================
  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const d = res.data;
        if (!d) return;
        setData({
          ...defaultData(),
          ...d,
          description: { ...emptyText3(), ...d.description },
          contact: { phone: "", email: "", ...d.contact },
          socials: { ...defaultData().socials, ...d.socials },
          newsletter: {
            heading: { ...emptyText3(), ...d.newsletter?.heading },
            placeholder: { ...emptyText3(), ...d.newsletter?.placeholder },
            terms: { ...emptyText3(), ...d.newsletter?.terms },
          },
        });
      })
      .catch(() => toast.error("Failed to load footer."))
      .finally(() => setLoading(false));
  }, []);

  // ==========================================
  // 4. LANGUAGE (same pattern as Video admin)
  // ==========================================
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

  // ==========================================
  // 5. FIELD HELPERS
  // ==========================================
  const setField = (key, value) => {
    setData((p) => ({ ...p, [key]: value }));
  };

  const setContact = (key, value) => {
    setData((p) => ({ ...p, contact: { ...p.contact, [key]: value } }));
  };

  const setSocial = (key, value) => {
    setData((p) => ({ ...p, socials: { ...p.socials, [key]: value } }));
  };

  const setDescription = (value) => {
    setData((p) => ({
      ...p,
      description: { ...p.description, [language]: value },
    }));
    setLangErr((p) => ({ ...p, [language]: false }));
  };

  const setNewsletter = (field, value) => {
    setData((p) => ({
      ...p,
      newsletter: {
        ...p.newsletter,
        [field]: { ...p.newsletter[field], [language]: value },
      },
    }));
    setLangErr((p) => ({ ...p, [language]: false }));
  };

  // ==========================================
  // 6. VALIDATION
  // ==========================================
  const validate = () => {
    const errs = { en: false, ps: false, fa: false };
    let firstBad = null;

    if (!data.projectName?.trim()) {
      toast.error("Project Name is required.");
      return false;
    }

    // Required translated fields in EVERY language
    for (const { code } of LANGS) {
      const desc = data.description?.[code]?.trim();
      const heading = data.newsletter?.heading?.[code]?.trim();
      const placeholder = data.newsletter?.placeholder?.[code]?.trim();

      if (!desc || !heading || !placeholder) {
        errs[code] = true;
        if (!firstBad) firstBad = code;
      }
    }

    setLangErr(errs);

    if (firstBad) {
      changeLanguage(firstBad);
      toast.error(
        `Fill Description, Newsletter Heading & Placeholder in ${firstBad.toUpperCase()}`,
      );
      return false;
    }

    // Soft email check (optional field)
    if (data.contact?.email?.trim()) {
      const email = data.contact.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Email format looks invalid.");
        return false;
      }
    }

    // Social URLs are SAME for all languages
    // empty or "#" = hide on frontend
    // otherwise must start with http/https
    for (const platform of SOCIAL_PLATFORMS) {
      const url = String(data.socials?.[platform.id] || "").trim();
      if (!url || url === "#") continue;
      if (!/^https?:\/\//i.test(url)) {
        toast.error(
          `${platform.label} URL must start with http:// or https:// (or leave blank / #)`,
        );
        return false;
      }
    }

    return true;
  };

  // ==========================================
  // 7. SAVE
  // ==========================================
  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      await axios.post(API_URL, data);
      toast.success("Footer saved successfully.");
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // 8. LOGO UPLOAD / REMOVE
  // ==========================================
  const uploadLogo = () => {
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
          folder: "bexon/footer",
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
          maxFileSize: 5 * 1024 * 1024,
        },
        (err, result) => {
          if (err) return toast.error("Upload failed.");
          if (result?.event !== "success") return;

          // destroy old logo if exists
          if (data.logoPublicId) {
            axios
              .post(API_URL, { publicId: data.logoPublicId })
              .catch(() => {});
          }

          setData((p) => ({
            ...p,
            logo: result.info.secure_url,
            logoPublicId: result.info.public_id,
          }));
          toast.success("Logo uploaded.");
        },
      )
      .open();
  };

  const removeLogo = async () => {
    if (!confirm("Remove footer logo?")) return;
    setSaving(true);
    try {
      if (data.logoPublicId) {
        await axios.post(API_URL, { publicId: data.logoPublicId });
      }
      setData((p) => ({ ...p, logo: "", logoPublicId: "" }));
      toast.success("Logo removed.");
    } catch {
      toast.error("Failed to remove logo.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // 9. RENDER
  // ==========================================
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
    <div className="min-h-screen bg-[var(--background)] p-3 text-[var(--foreground)] sm:p-5 lg:p-8">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
      />

      <div className="mx-auto max-w-6xl space-y-6">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold tracking-[0.2em] text-[var(--accent)] uppercase">
              Site Structure
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Footer & Profile Admin
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Logo, project name, contact, social URLs, and newsletter copy.
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

        {/* LOGO + PROJECT NAME */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Settings size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Brand / Project</h2>
          </div>

          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            {/* Logo */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Footer Logo
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface-soft)]">
                  {data.logo ? (
                    <img
                      src={data.logo}
                      alt="Footer logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[var(--muted)]">None</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={uploadLogo}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <Upload size={16} />
                    {data.logo ? "Replace Logo" : "Upload Logo"}
                  </button>

                  {data.logo && (
                    <button
                      type="button"
                      disabled={saving}
                      onClick={removeLogo}
                      className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 size={16} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Project name (same in all languages) */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Project / Company Name *
              </label>
              <input
                dir="ltr"
                value={data.projectName || ""}
                onChange={(e) => setField("projectName", e.target.value)}
                className={inputClass}
                placeholder="e.g. Bexon"
              />
            </div>
          </div>
        </section>

        {/* DESCRIPTION (per language) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Type size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">
              Description ({language.toUpperCase()})
            </h2>
          </div>
          <div className="p-4 sm:p-6">
            <label className="mb-1.5 block text-sm font-semibold">
              About text *
            </label>
            <textarea
              dir={dir}
              rows={4}
              value={data.description?.[language] || ""}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} min-h-[110px] resize-y`}
              placeholder="Developing personalized customer journeys..."
            />
          </div>
        </section>

        {/* CONTACT (same in all languages) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Phone size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Contact Info</h2>
          </div>
          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Phone Number
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  dir="ltr"
                  value={data.contact?.phone || ""}
                  onChange={(e) => setContact("phone", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="+1 (009) 544-7818"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--muted)]"
                />
                <input
                  dir="ltr"
                  value={data.contact?.email || ""}
                  onChange={(e) => setContact("email", e.target.value)}
                  className={`${inputClass} pl-10`}
                  placeholder="info@bexon.com"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SOCIALS (same URLs for every language) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Globe size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Social Links</h2>
          </div>

          <div className="p-4 sm:p-6">
            <p className="mb-4 text-sm text-[var(--muted)]">
              Same URLs for all languages. Leave blank or enter <b>#</b> to hide
              icon on website. Otherwise use full URL starting with{" "}
              <b>https://</b>
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {SOCIAL_PLATFORMS.map((social) => (
                <div key={social.id}>
                  <label className="mb-1.5 block text-sm font-semibold">
                    {social.label}
                  </label>
                  <input
                    dir="ltr"
                    value={data.socials?.[social.id] || ""}
                    onChange={(e) => setSocial(social.id, e.target.value)}
                    className={inputClass}
                    placeholder={
                      social.id === "whatsapp"
                        ? "https://wa.me/1234567890"
                        : "https://..."
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* NEWSLETTER (per language) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Mail size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Newsletter ({language.toUpperCase()})</h2>
          </div>

          <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-semibold">
                Heading *
              </label>
              <input
                dir={dir}
                value={data.newsletter?.heading?.[language] || ""}
                onChange={(e) => setNewsletter("heading", e.target.value)}
                className={inputClass}
                placeholder="Subscribe to Our Newsletter."
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Email Placeholder *
              </label>
              <input
                dir={dir}
                value={data.newsletter?.placeholder?.[language] || ""}
                onChange={(e) => setNewsletter("placeholder", e.target.value)}
                className={inputClass}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold">
                Terms Checkbox Text
              </label>
              <input
                dir={dir}
                value={data.newsletter?.terms?.[language] || ""}
                onChange={(e) => setNewsletter("terms", e.target.value)}
                className={inputClass}
                placeholder="Agree to our Terms & Condition?"
              />
            </div>
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
            Socials configured:{" "}
            {
              SOCIAL_PLATFORMS.filter((s) => {
                const v = String(data.socials?.[s.id] || "").trim();
                return v && v !== "#";
              }).length
            }
            /{SOCIAL_PLATFORMS.length}
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
