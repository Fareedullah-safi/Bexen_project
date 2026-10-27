"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import { ImagePlus, Link, Trash2Icon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

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
  const fileRefs = useRef({});
  const previewUrls = useRef(new Set());

  // Only one logo can be added through this form.
  const [logos, setLogos] = useState([
    { id: 1, preview: "", file: null, url: "" },
  ]);

  const [titleDrafts, setTitleDrafts] = useState(EMPTY_TITLES);
  const [titleLanguage, setTitleLanguage] = useState("en");
  const [savedData, setSavedData] = useState([]);
  const [deletingLogo, setDeletingLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isChangingTitle, setIsChangingTitle] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  const revokePreview = (url) => {
    if (url && previewUrls.current.has(url)) {
      URL.revokeObjectURL(url);
      previewUrls.current.delete(url);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrls.current.clear();
    };
  }, []);

  // Validate and select the single logo image.
  const handleLogo = (id, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp", "image/svg+xml"].includes(
        file.type,
      )
    ) {
      toast.error("Only JPG, PNG, WEBP, and SVG images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    const currentLogo = logos.find((logo) => logo.id === id);

    if (currentLogo?.url) {
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    previewUrls.current.add(preview);

    setLogos((prev) =>
      prev.map((logo) => {
        if (logo.id !== id) return logo;

        revokePreview(logo.preview);

        return {
          ...logo,
          file,
          url: "",
          preview,
        };
      }),
    );

    setImageErrors((prev) => ({
      ...prev,
      [id]: false,
    }));

    e.target.value = "";
  };

  const handleUrl = (id, e) => {
    const url = e.target.value;
    const currentLogo = logos.find((logo) => logo.id === id);

    if (currentLogo?.file) return;

    revokePreview(currentLogo?.preview);

    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id ? { ...logo, file: null, url, preview: url } : logo,
      ),
    );

    setImageErrors((prev) => ({
      ...prev,
      [id]: false,
    }));
  };

  const handleRemove = (id) => {
    const currentLogo = logos.find((logo) => logo.id === id);

    revokePreview(currentLogo?.preview);

    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id ? { ...logo, file: null, url: "", preview: "" } : logo,
      ),
    );

    setImageErrors((prev) => ({
      ...prev,
      [id]: false,
    }));

    if (fileRefs.current[id]) {
      fileRefs.current[id].value = "";
    }
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

  // Save exactly one image.
  const handleSubmit = async () => {
    if (isSaving) return;

    const logo = logos[0];

    if (!logo?.file && !logo?.url?.trim()) {
      toast.error("Please upload one brand logo or enter an image URL");
      return;
    }

    if (logo.url.trim()) {
      try {
        const parsedUrl = new URL(logo.url.trim());

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          toast.error("Please enter a valid HTTP or HTTPS image URL");
          return;
        }
      } catch {
        toast.error("Please enter a valid image URL");
        return;
      }
    }

    try {
      setIsSaving(true);

      const formData = new FormData();

      // The API receives only one logo ID and one image.
      formData.append("ids", "1");

      if (logo.file) {
        formData.append("file_1", logo.file);
      }

      formData.append("url_1", logo.url || "");

      const { data: uploadResult } = await axios.post(
        "/api/homepage/brand-logos/upload",
        formData,
      );

      if (!uploadResult?.success) {
        throw new Error(uploadResult?.message || "Logo upload failed");
      }

      const { data: saveResult } = await axios.post(
        "/api/homepage/brand-logos",
        {
          logos: uploadResult.logos,
        },
      );

      if (!saveResult?.success) {
        throw new Error(
          saveResult?.message || "Failed to save logos to the database",
        );
      }

      Object.values(fileRefs.current).forEach((input) => {
        if (input) input.value = "";
      });

      logos.forEach((item) => revokePreview(item.preview));

      setLogos([{ id: 1, preview: "", file: null, url: "" }]);

      setImageErrors({});

      toast.success("Brand logo saved successfully");

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

  // All three language titles are required.
  const handleTitleSubmit = async () => {
    if (isChangingTitle || isFetchingTitle) return;

    const translations = {
      en: titleDrafts.en ?? "",
      ps: titleDrafts.ps ?? "",
      fa: titleDrafts.fa ?? "",
    };

    const missingLanguage = LANGUAGES.find(
      ({ code }) => !translations[code].trim(),
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
              : (savedTranslations.en?.title ?? translations.en),

          ps:
            typeof savedTranslations.ps === "string"
              ? savedTranslations.ps
              : (savedTranslations.ps?.title ?? translations.ps),

          fa:
            typeof savedTranslations.fa === "string"
              ? savedTranslations.fa
              : (savedTranslations.fa?.title ?? translations.fa),
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
    <div className="w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
          <ImagePlus size={27} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brand Logos</h1>

          <p className="mt-1 text-base text-[var(--muted)]">
            Manage the brand logo displayed on your homepage.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        {/* Section title editor */}
        <div className="border-b border-[var(--border)] p-7 sm:p-8">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <label className="block text-base font-semibold">
                Section Title
              </label>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Select a language and enter its required title.
              </p>
            </div>

            <div
              className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5 shadow-sm"
              aria-label="Title language"
            >
              {LANGUAGES.map((language) => {
                const isActive = titleLanguage === language.code;

                const isRTL = titleLanguage === "ps" || titleLanguage === "fa";

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

          <input
            dir={titleLanguage === "en" ? "ltr" : "rtl"}
            type="text"
            required
            value={titleDrafts[titleLanguage] ?? ""}
            onChange={(e) =>
              setTitleDrafts((prev) => ({
                ...prev,
                [titleLanguage]: e.target.value,
              }))
            }
            placeholder={`Enter ${
              LANGUAGES.find((language) => language.code === titleLanguage)
                ?.label
            } title`}
            disabled={isChangingTitle}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-base text-[var(--foreground)] transition outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

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

        {/* Single-logo editor */}
        <div className="p-7 sm:p-8">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Brand Logo</h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Add one company logo. Only one image is allowed in this form.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
              One logo allowed
            </span>
          </div>

          <div className="space-y-5">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="relative flex flex-col gap-6 rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 transition hover:border-[var(--accent)]/40 hover:shadow-lg sm:p-6 lg:flex-row lg:items-center"
              >
                {logo.preview && (
                  <button
                    type="button"
                    onClick={() => handleRemove(logo.id)}
                    disabled={isSaving}
                    title="Remove logo"
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2Icon size={17} />
                  </button>
                )}

                <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:h-40 lg:w-56">
                  {logo.preview && !imageErrors[logo.id] ? (
                    <img
                      src={logo.preview}
                      alt="Brand logo preview"
                      className="h-full w-full object-contain"
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [logo.id]: true,
                        }))
                      }
                      onLoad={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [logo.id]: false,
                        }))
                      }
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-[var(--muted)]">
                      {imageErrors[logo.id] ? (
                        <p className="text-center text-sm">
                          Image unavailable. Check the URL.
                        </p>
                      ) : (
                        <>
                          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                            <ImagePlus size={29} />
                          </div>

                          <span className="mt-3 text-sm font-medium">
                            Brand Logo
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-0 lg:pr-12">
                  <div className="mb-4">
                    <p className="text-lg font-bold">Brand Logo</p>

                    <p className="mt-1 text-sm text-[var(--muted)]">
                      Required brand logo · Maximum 5 MB
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <label
                      htmlFor={`logo-${logo.id}`}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold transition ${
                        isSaving || logo.url
                          ? "cursor-not-allowed border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
                          : "cursor-pointer bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] hover:text-white"
                      }`}
                    >
                      <Upload size={18} />
                      Upload Logo
                    </label>

                    <input
                      ref={(element) => {
                        fileRefs.current[logo.id] = element;
                      }}
                      id={`logo-${logo.id}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={isSaving || !!logo.url}
                      onChange={(e) => handleLogo(logo.id, e)}
                    />

                    <div className="relative flex-1">
                      <Link
                        size={17}
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--muted)]"
                      />

                      <input
                        type="url"
                        value={logo.url}
                        disabled={isSaving || !!logo.file}
                        placeholder="Paste image URL"
                        onChange={(e) => handleUrl(logo.id, e)}
                        className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] py-3 pr-4 pl-11 text-sm text-[var(--foreground)] transition outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex justify-end border-t border-[var(--border)] pt-7">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
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
                  Save Brand Logo
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Previously saved logos remain visible and deletable. */}
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
