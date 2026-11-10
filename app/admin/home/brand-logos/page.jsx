"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import { ImagePlus, Trash2Icon, Upload, X } from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok && data && data.success === true) {
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
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
  return { palette: palettes[theme] || palettes.light };
}

function stripHtml(val) {
  return String(val || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .trim();
}

function richWrapperClass() {
  return "overflow-hidden rounded-2xl border border-[var(--border)] transition-colors";
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ps", label: "پښتو" },
  { code: "fa", label: "دری" },
];

const EMPTY_TITLES = {
  en: "",
  ps: "",
  fa: "",
};

export default function BrandLogos() {
  const [pickedLogos, setPickedLogos] = useState([]);
  const [titleDrafts, setTitleDrafts] = useState(EMPTY_TITLES);
  const [titleLanguage, setTitleLanguage] = useState("en");
  const [savedData, setSavedData] = useState([]);
  const [deletingLogo, setDeletingLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isChangingTitle, setIsChangingTitle] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(true);
  const [theme, setTheme] = useState("light");
  const [checking, setChecking] = useState(false);
  const [widgetReady, setWidgetReady] = useState(false);

  const isRtl = titleLanguage === "ps" || titleLanguage === "fa";

  useEffect(() => {
    const update = () => {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const handleRemovePicked = (publicId) => {
    const filtered = [];
    for (let i = 0; i < pickedLogos.length; i++) {
      if (pickedLogos[i].publicId !== publicId) {
        filtered.push(pickedLogos[i]);
      }
    }
    setPickedLogos(filtered);
  };

  const handleClearAll = () => {
    setPickedLogos([]);
  };

  const allBoxData = async () => {
    try {
      setIsFetching(true);
      const { data } = await axios.get("/api/homepage/brand-logos", {
        headers: { "Cache-Control": "no-cache" },
        params: { _t: Date.now() },
      });
      if (!data?.success) {
        throw new Error(data?.message || "Failed to load saved logos");
      }
      setSavedData(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error("Fetch brand logos error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load saved logos",
      );
    } finally {
      setIsFetching(false);
    }
  };

  const getSectionTitles = async () => {
    try {
      setIsFetchingTitle(true);
      const results = await Promise.all(
        LANGUAGES.map(async ({ code }) => {
          const { data } = await axios.get("/api/homepage/brand-logos/title", {
            params: { lang: code, _t: Date.now() },
            headers: { "Cache-Control": "no-cache" },
          });
          if (!data?.success) {
            throw new Error(data?.message || `Failed to load ${code} title`);
          }
          return [code, typeof data.title === "string" ? data.title : ""];
        }),
      );
      setTitleDrafts({
        ...EMPTY_TITLES,
        ...Object.fromEntries(results),
      });
    } catch (error) {
      console.error("Fetch language titles error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load language titles",
      );
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const openCloudinary = async () => {
    if (!widgetReady || !window.cloudinary) {
      toast.error("Cloudinary is still loading...");
      return;
    }
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing.");
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
        cloudName,
        uploadPreset,
        folder: "bexon/brand-logos",
        multiple: true,
        maxFileSize: 5 * 1024 * 1024,
        sources: ["local", "url", "camera"],
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
        styles: cloudinaryStyles(theme),
      },
      (err, result) => {
        if (err) {
          toast.error("Upload failed");
          return;
        }
        if (result?.event === "success") {
          const newLogo = {
            url: result.info.secure_url,
            publicId: result.info.public_id,
          };
          setPickedLogos((prev) => {
            for (let i = 0; i < prev.length; i++) {
              if (prev[i].publicId === newLogo.publicId) {
                return prev;
              }
            }
            return [...prev, newLogo];
          });
          toast.success("Logo added. Upload more or click Save.");
        }
      },
    );
    widget.open();
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    if (pickedLogos.length === 0) {
      toast.error("Please upload at least one brand logo first.");
      return;
    }
    try {
      setIsSaving(true);
      const logosPayload = [];
      for (let i = 0; i < pickedLogos.length; i++) {
        logosPayload.push({
          url: pickedLogos[i].url,
          publicId: pickedLogos[i].publicId,
        });
      }
      const { data: saveResult } = await axios.post(
        "/api/homepage/brand-logos",
        { logos: logosPayload },
      );
      if (!saveResult?.success) {
        throw new Error(
          saveResult?.message || "Failed to save logos to the database",
        );
      }
      setPickedLogos([]);
      toast.success("All brand logos saved successfully");
      await allBoxData();
    } catch (error) {
      console.error("Brand logos save error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleSubmit = async () => {
    if (isChangingTitle || isFetchingTitle) return;

    const translations = {
      en: titleDrafts.en || "",
      ps: titleDrafts.ps || "",
      fa: titleDrafts.fa || "",
    };

    const missingLanguage = LANGUAGES.find(
      ({ code }) => !stripHtml(translations[code]),
    );

    if (missingLanguage) {
      setTitleLanguage(missingLanguage.code);
      toast.error(`Please enter the section title in ${missingLanguage.label}`);
      return;
    }

    try {
      setIsChangingTitle(true);
      const { data } = await axios.post("/api/homepage/brand-logos/title", {
        translations,
      });
      if (!data?.success) {
        throw new Error(data?.message || "Failed to update language titles");
      }
      const savedTranslations = data?.translations;
      if (savedTranslations) {
        setTitleDrafts({
          en:
            typeof savedTranslations.en === "string"
              ? savedTranslations.en
              : savedTranslations.en?.title || translations.en,
          ps:
            typeof savedTranslations.ps === "string"
              ? savedTranslations.ps
              : savedTranslations.ps?.title || translations.ps,
          fa:
            typeof savedTranslations.fa === "string"
              ? savedTranslations.fa
              : savedTranslations.fa?.title || translations.fa,
        });
      } else {
        setTitleDrafts(translations);
      }
      toast.success("All language titles updated successfully");
    } catch (error) {
      console.error("Update language titles error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setIsChangingTitle(false);
    }
  };

  const handleDeleteSavedLogo = async (publicId, _id) => {
    if (deletingLogo) return;
    try {
      setDeletingLogo(publicId);
      const { data } = await axios.delete("/api/homepage/brand-logos", {
        data: { publicId, logoId: _id },
      });
      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete logo");
      }
      toast.success("Logo deleted successfully");
      await allBoxData();
    } catch (error) {
      console.error("Delete logo error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setDeletingLogo(null);
    }
  };

  useEffect(() => {
    allBoxData();
    getSectionTitles();
  }, []);

  const savedLogoCount = savedData.reduce(
    (total, item) => total + (item.logos?.length || 0),
    0,
  );

  if (isFetchingTitle || isFetching) {
    return (
      <div className="flex min-h-[300px] w-full items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--background)] pb-28 text-[var(--foreground)]">
      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="lazyOnload"
        onReady={() => setWidgetReady(true)}
        onError={() => toast.error("Unable to load Cloudinary.")}
      />

      <AdminLanguageBall
        language={titleLanguage}
        onLanguageChange={setTitleLanguage}
      />

      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <ImagePlus size={27} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Logos</h1>
          <p className="mt-1 text-base text-[var(--muted)]">
            Manage the brand logos displayed on your homepage.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <div className="border-b border-[var(--border)] p-7 sm:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label className="block text-base font-semibold">
                Section Title
              </label>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Select a language and enter its required title. Use the editor
                for bold, color, and line breaks.
              </p>
            </div>
            <div
              className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-sm"
              aria-label="Title language"
            >
              {LANGUAGES.map((language) => {
                const isActive = titleLanguage === language.code;
                return (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => setTitleLanguage(language.code)}
                    disabled={isChangingTitle}
                    aria-pressed={isActive}
                    className={`relative flex min-h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? "bg-[var(--accent)] text-white shadow-[var(--accent)]/20 shadow-md"
                        : "text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                    }`}
                  >
                    {language.label}
                    {isActive && (
                      <span className="ml-2 h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={richWrapperClass()}>
            <RichTextEditor
              key={"title-" + titleLanguage}
              value={titleDrafts[titleLanguage] || ""}
              onChange={(html) =>
                setTitleDrafts((prev) => ({
                  ...prev,
                  [titleLanguage]: html,
                }))
              }
              isRtl={isRtl}
              placeholder={`Enter ${
                LANGUAGES.find((language) => language.code === titleLanguage)
                  ?.label
              } title`}
              minHeight={120}
            />
          </div>

          <button
            type="button"
            onClick={handleTitleSubmit}
            disabled={isChangingTitle || isFetchingTitle}
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChangingTitle ? (
              <>
                <Spinner />
                Updating All...
              </>
            ) : (
              "Update Title All Languages"
            )}
          </button>
        </div>

        {/* Logo uploader */}
        <div className="p-7 sm:p-8">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Brand Logos</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Upload as many brand logos as you need via Cloudinary.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
              {pickedLogos.length} picked
            </span>
          </div>

          {pickedLogos.length > 0 && (
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Ready to save ({pickedLogos.length})
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={isSaving}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <X size={14} /> Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-4">
                {pickedLogos.map((logo) => (
                  <div
                    key={logo.publicId}
                    className="group relative flex h-28 w-36 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemovePicked(logo.publicId)}
                      disabled={isSaving}
                      title="Remove"
                      className="absolute top-1.5 right-1.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition group-hover:opacity-100 disabled:opacity-50"
                    >
                      <X size={14} />
                    </button>
                    <img
                      src={logo.url}
                      alt="Picked logo"
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-[var(--border)] bg-[var(--background)] p-8 transition hover:border-[var(--accent)]/40">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <ImagePlus size={29} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {pickedLogos.length === 0
                  ? "No logos picked yet"
                  : `${pickedLogos.length} logo${pickedLogos.length > 1 ? "s" : ""} ready`}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                JPG, PNG, WEBP or SVG · Maximum 5 MB each · Unlimited uploads
              </p>
            </div>
            <button
              type="button"
              onClick={openCloudinary}
              disabled={isSaving || checking || !widgetReady}
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {checking ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Upload size={18} />
              )}
              {checking
                ? "Checking..."
                : pickedLogos.length > 0
                  ? "Add More Logos"
                  : "Upload Logos"}
            </button>
          </div>

          <div className="mt-7 flex justify-end border-t border-[var(--border)] pt-7">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || pickedLogos.length === 0}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-7 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Spinner />
                  Saving...
                </>
              ) : (
                <>
                  <Upload size={18} />
                  Save {pickedLogos.length > 0 ? `${pickedLogos.length} ` : ""}
                  Logo{pickedLogos.length !== 1 ? "s" : ""}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {savedData.length > 0 && (
        <div className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Saved Brand Logos</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Logos currently saved in your database.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
              {savedLogoCount} saved
            </span>
          </div>
          {isFetching ? (
            <div className="flex min-h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="flex flex-wrap gap-5">
              {savedData.flatMap((item) =>
                item.logos?.map((logo) => {
                  const deleteKey = `${item._id}-${logo._id}`;
                  return (
                    <div
                      key={deleteKey}
                      className="relative flex h-36 w-48 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5 shadow-sm transition hover:border-[var(--accent)]/40 hover:shadow-md"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteSavedLogo(logo.publicId, logo._id)
                        }
                        disabled={
                          deletingLogo === logo.publicId || !!deletingLogo
                        }
                        title="Delete saved logo"
                        className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {deletingLogo === logo.publicId ? (
                          <Spinner />
                        ) : (
                          <Trash2Icon size={16} />
                        )}
                      </button>
                      {logo.url ? (
                        <img
                          src={logo.url}
                          alt="Saved brand logo"
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <ImagePlus size={27} className="text-[var(--muted)]" />
                      )}
                    </div>
                  );
                }),
              )}
            </div>
          )}
        </div>
      )}

      {isFetching && savedData.length === 0 && (
        <div className="mt-8 flex min-h-32 items-center justify-center rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
          <Spinner />
        </div>
      )}
    </div>
  );
}
