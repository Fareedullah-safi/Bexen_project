/* eslint-disable @next/next/no-img-element */
"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import { ImagePlus, Plus, Save, Trash2 } from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  { id: "en", label: "English" },
  { id: "ps", label: "پښتو" },
  { id: "fa", label: "دری" },
];

const emptySectionTranslation = () => ({
  tagline: "",
  title: "",
});

const emptyCardTranslation = () => ({
  title: "",
  description: "",
});

const createEmptyTranslations = () => ({
  en: emptySectionTranslation(),
  ps: emptySectionTranslation(),
  fa: emptySectionTranslation(),
});

/* ==================== ICON PICKER ==================== */

function IconPicker({ icon, onChange, cloudinaryReady }) {
  const [imageError, setImageError] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    setImageError(false);
  }, [icon.preview]);

  useEffect(() => {
    return () => {
      widgetRef.current = null;
    };
  }, []);

  const openCloudinaryWidget = () => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Please configure your Cloudinary environment variables.");
      return;
    }

    if (!cloudinaryReady || !window.cloudinary?.createUploadWidget) {
      toast.error("Cloudinary uploader is still loading.");
      return;
    }

    if (widgetRef.current) {
      widgetRef.current.open();
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: "bexon/images",
        resourceType: "image",
        sources: ["local", "url"],
        multiple: false,
        maxFiles: 1,
        maxFileSize: 5 * 1024 * 1024,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "svg"],
        showAdvancedOptions: false,
        cropping: false,
        singleUploadAutoClose: true,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#E4E7EC",
            tabIcon: "#1E8A8A",
            menuIcons: "#1E8A8A",
            textDark: "#101828",
            textLight: "#FFFFFF",
            link: "#1E8A8A",
            action: "#1E8A8A",
            inactiveTabIcon: "#667085",
            error: "#D92D20",
            inProgress: "#1E8A8A",
            complete: "#12B76A",
            sourceBg: "#F7F9FC",
          },
        },
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          toast.error("Image upload failed. Please try again.");
          return;
        }

        if (result?.event === "success") {
          const uploaded = result.info;

          if (!uploaded?.secure_url || !uploaded?.public_id) {
            toast.error("Cloudinary did not return a valid image.");
            return;
          }

          onChange({
            mode: "cloudinary",
            file: null,
            preview: uploaded.secure_url,
            url: uploaded.secure_url,
            publicId: uploaded.public_id,
            clear: false,
          });

          toast.success("Image uploaded successfully.");
        }

        if (result?.event === "close") {
          widgetRef.current = null;
        }
      },
    );

    widgetRef.current = widget;
    widget.open();
  };

  const clearIcon = () => {
    onChange({
      mode: "cloudinary",
      file: null,
      preview: "",
      url: "",
      publicId: "",
      clear: true,
    });
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
        Icon
      </label>

      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {icon.preview && !imageError ? (
            <img
              src={icon.preview}
              alt="Icon preview"
              className="h-full w-full object-contain p-2"
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <ImagePlus size={22} className="text-[var(--accent)]" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={openCloudinaryWidget}
            disabled={!cloudinaryReady}
            className="h-11 w-full rounded-xl border border-[var(--border)] text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {icon.publicId ? "Change Icon" : "Upload Icon"}
          </button>

          <p className="mt-1 truncate text-xs text-[var(--muted)]">
            {icon.publicId
              ? "Cloudinary image selected"
              : cloudinaryReady
                ? "Upload from PC or enter an image URL"
                : "Loading uploader..."}
          </p>
        </div>

        {icon.preview && (
          <button
            type="button"
            onClick={clearIcon}
            aria-label="Clear icon"
            className="rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {icon.clear && (
        <p className="mt-1 text-xs text-[var(--muted)]">
          Icon removal will be applied when you save.
        </p>
      )}
    </div>
  );
}

/* ==================== HELPERS ==================== */

const createEmptyIcon = () => ({
  mode: "cloudinary",
  file: null,
  preview: "",
  url: "",
  publicId: "",
  clear: false,
});

const createEmptyCard = () => ({
  _id: "",
  clientId: `${Date.now()}-${Math.random()}`,
  translations: {
    en: emptyCardTranslation(),
    ps: emptyCardTranslation(),
    fa: emptyCardTranslation(),
  },
  icon: createEmptyIcon(),
});

const normalizeIcon = (icon) => {
  const url = icon?.url || "";
  const publicId = icon?.publicId || "";

  return {
    mode: "cloudinary",
    file: null,
    preview: url,
    url,
    publicId,
    clear: false,
  };
};

const normalizeSavedCards = (cards = []) =>
  cards.map((card) => ({
    _id: card._id || "",
    clientId: card._id || `${Date.now()}-${Math.random()}`,
    translations: {
      en: {
        title: card.translations?.en?.title || "",
        description: card.translations?.en?.description || "",
      },
      ps: {
        title: card.translations?.ps?.title || "",
        description: card.translations?.ps?.description || "",
      },
      fa: {
        title: card.translations?.fa?.title || "",
        description: card.translations?.fa?.description || "",
      },
    },
    icon: normalizeIcon(card.icon),
  }));

/* ==================== FEATURES ==================== */

export default function Features() {
  const [language, setLanguage] = useState("en");
  const [translations, setTranslations] = useState(createEmptyTranslations);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [languageReady, setLanguageReady] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  const currentTranslation =
    translations[language] || emptySectionTranslation();

  /* ==================== LOAD ALL LANGUAGE DRAFTS ==================== */

  useEffect(() => {
    let cancelled = false;

    const loadFeatures = async () => {
      setFetching(true);

      try {
        const [enResponse, psResponse, faResponse, languageResponse] =
          await Promise.all([
            fetch("/api/homepage/features?lang=en", {
              cache: "no-store",
            }),
            fetch("/api/homepage/features?lang=ps", {
              cache: "no-store",
            }),
            fetch("/api/homepage/features?lang=fa", {
              cache: "no-store",
            }),
            fetch("/api/admin/adminusers/language", {
              cache: "no-store",
            }),
          ]);

        const [enResult, psResult, faResult, languageResult] =
          await Promise.all([
            enResponse.json(),
            psResponse.json(),
            faResponse.json(),
            languageResponse.json(),
          ]);

        if (
          !enResponse.ok ||
          !psResponse.ok ||
          !faResponse.ok ||
          !enResult.success ||
          !psResult.success ||
          !faResult.success
        ) {
          throw new Error("Failed to load feature translations");
        }

        if (cancelled) return;

        const languageData = {
          en: enResult.data || {},
          ps: psResult.data || {},
          fa: faResult.data || {},
        };

        const nextTranslations = createEmptyTranslations();

        for (const lang of ["en", "ps", "fa"]) {
          nextTranslations[lang] = {
            tagline: languageData[lang].tagline || "",
            title: languageData[lang].title || "",
          };
        }

        const englishCards = languageData.en.cards || [];

        const nextCards = englishCards.map((card, index) => {
          const getTranslation = (lang) => {
            const matchingCard = (languageData[lang].cards || []).find(
              (item) => item._id === card._id,
            );

            const fallbackCard = (languageData[lang].cards || [])[index];
            const item = matchingCard || fallbackCard;

            return {
              title: item?.title || "",
              description: item?.description || "",
            };
          };

          return {
            _id: card._id || "",
            clientId: card._id || `loaded-${index}`,
            translations: {
              en: getTranslation("en"),
              ps: getTranslation("ps"),
              fa: getTranslation("fa"),
            },
            icon: normalizeIcon(card.icon),
          };
        });

        setTranslations(nextTranslations);
        setCards(nextCards);

        const savedLanguage = languageResult?.success
          ? languageResult.language
          : "en";

        setLanguage(
          ["en", "ps", "fa"].includes(savedLanguage) ? savedLanguage : "en",
        );
      } catch (error) {
        console.error("Load features error:", error);

        if (!cancelled) {
          toast.error(error.message || "Failed to load features");
        }
      } finally {
        if (!cancelled) {
          setFetching(false);
          setLanguageReady(true);
        }
      }
    };

    loadFeatures();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ==================== LANGUAGE SELECTOR ==================== */
  /* ==================== LANGUAGE SELECTOR ==================== */

  useEffect(() => {
    const handleLanguageChange = (event) => {
      const nextLanguage = event.detail?.language;

      if (["en", "ps", "fa"].includes(nextLanguage)) {
        setLanguage(nextLanguage);
      }
    };

    window.addEventListener("admin-language-change", handleLanguageChange);

    return () => {
      window.removeEventListener("admin-language-change", handleLanguageChange);
    };
  }, []);

  /* ==================== FORM HANDLERS ==================== */

  const setField = (name, value) => {
    setTranslations((prev) => ({
      ...prev,
      [language]: {
        ...prev[language],
        [name]: value,
      },
    }));
  };

  const setCardTranslation = (index, name, value) => {
    setCards((prev) =>
      prev.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              translations: {
                ...card.translations,
                [language]: {
                  ...card.translations[language],
                  [name]: value,
                },
              },
            }
          : card,
      ),
    );
  };

  const setCardIcon = (index, icon) => {
    setCards((prev) =>
      prev.map((card, cardIndex) =>
        cardIndex === index ? { ...card, icon } : card,
      ),
    );
  };

  const addCard = () => {
    setCards((prev) => [...prev, createEmptyCard()]);
  };

  /* ==================== DELETE CARD ==================== */

  const removeCard = async (cardId, index) => {
    if (loading) return;

    if (!cardId) {
      setCards((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    try {
      const response = await fetch("/api/homepage/features", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to delete card");
      }

      setCards((prev) => prev.filter((card) => card._id !== cardId));

      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error(error.message || "Failed to delete card");
    }
  };

  /* ==================== SAVE ALL LANGUAGES ONCE ==================== */

  const handleSubmit = async () => {
    if (loading) return;

    const languageNames = {
      en: "English",
      ps: "Pashto",
      fa: "Dari",
    };

    const requiredSectionFields = [
      { key: "tagline", label: "Section tagline" },
      { key: "title", label: "Section heading" },
    ];

    // Validate every card icon.
    for (let index = 0; index < cards.length; index += 1) {
      const icon = cards[index]?.icon;

      if (!icon?.url?.trim() || !icon?.publicId?.trim()) {
        toast.error(`Please upload an icon for Card ${index + 1}.`);
        return;
      }
    }

    // Validate all required text fields in all languages.
    for (const lang of ["en", "ps", "fa"]) {
      for (const field of requiredSectionFields) {
        if (!translations[lang]?.[field.key]?.trim()) {
          toast.error(
            `Please fill in ${field.label} in the ${languageNames[lang]} tab.`,
          );

          setLanguage(lang);
          return;
        }
      }

      for (let index = 0; index < cards.length; index += 1) {
        const cardTranslation = cards[index]?.translations?.[lang];

        if (!cardTranslation?.title?.trim()) {
          toast.error(
            `Please fill in Card ${index + 1} title in the ${languageNames[lang]} tab.`,
          );

          setLanguage(lang);
          return;
        }

        if (!cardTranslation?.description?.trim()) {
          toast.error(
            `Please fill in Card ${index + 1} description in the ${languageNames[lang]} tab.`,
          );

          setLanguage(lang);
          return;
        }
      }
    }

    // Only save after every required field passes validation.
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("translations", JSON.stringify(translations));

      const submittedCards = cards.map((card) => ({
        _id: card._id || "",
        translations: {
          en: {
            title: card.translations.en.title.trim(),
            description: card.translations.en.description.trim(),
          },
          ps: {
            title: card.translations.ps.title.trim(),
            description: card.translations.ps.description.trim(),
          },
          fa: {
            title: card.translations.fa.title.trim(),
            description: card.translations.fa.description.trim(),
          },
        },
        iconMode: card.icon.mode,
        iconUrl: card.icon.url.trim(),
        iconPublicId: card.icon.publicId || "",
        clearIcon: Boolean(card.icon.clear),
      }));

      formData.append("cards", JSON.stringify(submittedCards));

      const response = await fetch("/api/homepage/features", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "Failed to save features");
      }

      if (result?.data) {
        setTranslations({
          en: {
            ...emptySectionTranslation(),
            ...result.data.translations?.en,
          },
          ps: {
            ...emptySectionTranslation(),
            ...result.data.translations?.ps,
          },
          fa: {
            ...emptySectionTranslation(),
            ...result.data.translations?.fa,
          },
        });

        setCards(normalizeSavedCards(result.data.cards || []));
      }

      toast.success("All language changes saved successfully!");
    } catch (error) {
      console.error("Save features error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  /* ==================== LOADING ==================== */

  if (fetching || !languageReady) {
    return (
      <div className="flex min-h-96 w-full flex-col items-center justify-center gap-3 bg-[var(--background)]">
        <Spinner />
        <p className="text-sm font-medium text-[var(--muted)]">
          Loading Features...
        </p>
      </div>
    );
  }

  /* ==================== UI ==================== */

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <AdminLanguageBall language={language} onLanguageChange={setLanguage} />

      <Script
        src="https://upload-widget.cloudinary.com/latest/global/all.js"
        strategy="afterInteractive"
        onReady={() => setCloudinaryReady(true)}
      />

      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--accent)]">
              Home Page
            </p>

            <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
              Features
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Edit the heading and the feature cards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {LANGUAGES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLanguage(item.id)}
                className={`rounded-xl border px-5 py-2.5 text-sm font-semibold transition ${
                  language === item.id
                    ? "border-[#1E8A8A] bg-[#1E8A8A] text-white shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[#1E8A8A] hover:text-[#1E8A8A]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-2 text-xs text-[var(--muted)]">
          Editing: {LANGUAGES.find((item) => item.id === language)?.label}
          {" · "}Your drafts in other languages are preserved.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="font-bold">Section Heading</h2>

        <p className="mt-1 text-xs text-[var(--muted)]">
          The small text and big title above the cards.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Tagline
            </label>

            <input
              dir={language === "en" ? "ltr" : "rtl"}
              type="text"
              value={currentTranslation.tagline}
              onChange={(e) => setField("tagline", e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Heading
            </label>

            <input
              dir={language === "en" ? "ltr" : "rtl"}
              type="text"
              value={currentTranslation.title}
              onChange={(e) => setField("title", e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Feature Cards</h2>

            <p className="mt-1 text-sm font-medium text-[var(--muted)]">
              {cards.length} Card
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {cards.map((card, index) => {
            const cardTranslation =
              card.translations[language] || emptyCardTranslation();

            return (
              <div
                key={card._id || card.clientId}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    Card {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeCard(card._id, index)}
                    className="rounded-lg border border-red-500/20 p-1.5 text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="mt-3 space-y-4">
                  <IconPicker
                    icon={card.icon}
                    onChange={(icon) => setCardIcon(index, icon)}
                    cloudinaryReady={cloudinaryReady}
                  />

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                      Title
                    </label>

                    <input
                      dir={language === "en" ? "ltr" : "rtl"}
                      type="text"
                      value={cardTranslation.title}
                      onChange={(e) =>
                        setCardTranslation(index, "title", e.target.value)
                      }
                      placeholder="Card title"
                      className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                      Description
                    </label>

                    <textarea
                      dir={language === "en" ? "ltr" : "rtl"}
                      rows={5}
                      value={cardTranslation.description}
                      onChange={(e) =>
                        setCardTranslation(index, "description", e.target.value)
                      }
                      placeholder="Card description"
                      className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {cards.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">
              No cards yet. Click "Add Card" to create one.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={addCard}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-60"
        >
          <Plus size={18} />
          Add Card
        </button>

        <footer className="sticky bottom-4 z-10 mt-4 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Ready to save your changes?
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Save all three language drafts and the selected Cloudinary image
              references.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167575] focus-visible:ring-4 focus-visible:ring-[#1E8A8A]/20 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Spinner /> : <Save size={18} />}
            {loading ? "Saving Features Changes..." : "Save Features Changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
