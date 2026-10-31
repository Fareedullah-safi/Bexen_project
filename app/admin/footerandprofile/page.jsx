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
  Type,
} from "lucide-react";
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
        const d = res.data?.data || res.data;
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
  // 4. LANGUAGE
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

    if (data.contact?.email?.trim()) {
      const email = data.contact.email.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error("Email format looks invalid.");
        return false;
      }
    }

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
      // Do not send logo fields from this admin
      const { logo, logoPublicId, _id, ...payload } = data;
      await axios.post(API_URL, payload);
      toast.success("Footer saved successfully.");
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // 8. RENDER
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
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
              Project name, contact, social URLs, and newsletter copy.
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

        {/* PROJECT NAME ONLY (no logo upload) */}
        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <Settings size={18} className="text-[var(--accent)]" />
            <h2 className="font-bold">Brand / Project</h2>
          </div>

          <div className="p-4 sm:p-6">
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
            <p className="mt-2 text-xs text-[var(--muted)]">
              Logo is managed in Navbar Admin and reused in Footer / Hamburger.
            </p>
          </div>
        </section>

        {/* DESCRIPTION */}
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

        {/* CONTACT */}
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

        {/* SOCIALS */}
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

        {/* NEWSLETTER */}
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
