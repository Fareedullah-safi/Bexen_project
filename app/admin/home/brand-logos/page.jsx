"use client";

import { ImagePlus, Link, Trash2Icon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/app/admin/Components/Admin/Spinner";

export default function BrandLogos() {
  const fileRefs = useRef({});
  const previewUrls = useRef(new Set());

  const [logos, setLogos] = useState([
    { id: 1, preview: "", file: null, url: "" },
    { id: 2, preview: "", file: null, url: "" },
    { id: 3, preview: "", file: null, url: "" },
  ]);

  const [sectionTitle, setSectionTitle] = useState("");
  const [savedData, setSavedData] = useState([]);
  const [deletingLogo, setDeletingLogo] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isChangingTitle, setIsChangingTitle] = useState(false);
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
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
        return { ...logo, file, url: "", preview };
      }),
    );

    setImageErrors((prev) => ({ ...prev, [id]: false }));
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
    setImageErrors((prev) => ({ ...prev, [id]: false }));
  };

  const handleRemove = (id) => {
    const currentLogo = logos.find((logo) => logo.id === id);
    revokePreview(currentLogo?.preview);

    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id ? { ...logo, file: null, url: "", preview: "" } : logo,
      ),
    );

    setImageErrors((prev) => ({ ...prev, [id]: false }));
    if (fileRefs.current[id]) fileRefs.current[id].value = "";
  };

  const handleSubmit = async () => {
    if (isSaving) return;

    const data = {
      logos: logos.map((logo) => ({
        id: logo.id,
        file: logo.file,
        url: logo.url,
      })),
    };

    if (!data.logos[0].file && !data.logos[0].url.trim()) {
      return toast.error("Please add Logo 1");
    }

    try {
      setIsSaving(true);

      const formData = new FormData();
      data.logos.forEach((logo) => {
        formData.append("ids", String(logo.id));
        if (logo.file) formData.append("files", logo.file);
        formData.append("urls", logo.url || "");
      });

      const response = await fetch("/api/homepage/brand-logos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Cloudinary upload failed");
      }

      const postResponse = await fetch("/api/homepage/brand-logos/postlogoDB", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logos: result.logos }),
      });

      const postResult = await postResponse.json();
      if (!postResponse.ok || !postResult.success) {
        throw new Error(
          postResult.error || "Failed to save logos. Check your logo links.",
        );
      }

      Object.values(fileRefs.current).forEach((input) => {
        if (input) input.value = "";
      });

      logos.forEach((logo) => revokePreview(logo.preview));
      setLogos((prev) =>
        prev.map((logo) => ({ ...logo, file: null, url: "", preview: "" })),
      );
      setImageErrors({});
      toast.success("Brand logos saved successfully");
      await allBoxData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const allBoxData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);
      const response = await fetch("/api/homepage/brand-logos/postlogoDB", {
        cache: "no-store",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load saved logos");
      }

      setSavedData(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(error.message || "Failed to load saved logos");
    } finally {
      setIsFetching(false);
    }
  };

  const getSectionTitle = async () => {
    if (isFetchingTitle) return;

    try {
      setIsFetchingTitle(true);
      const response = await fetch(
        "/api/homepage/brand-logos/postlogoDB/title",
        { cache: "no-store" },
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to load section title");
      }

      setSectionTitle(data.data?.title || "");
    } catch (error) {
      console.error("Title fetch error:", error);
      toast.error(error.message || "Failed to load section title");
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const handleTitleSubmit = async () => {
    if (isChangingTitle) return;
    if (!sectionTitle.trim())
      return toast.error("Please enter a section title");

    try {
      setIsChangingTitle(true);
      const response = await fetch(
        "/api/homepage/brand-logos/postlogoDB/title",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: sectionTitle.trim() }),
        },
      );

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to change title");
      }

      toast.success("Title changed successfully");
    } catch (error) {
      console.error("Title change error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsChangingTitle(false);
    }
  };

  const handleDeleteSavedLogo = async (publicId, _id) => {
    if (deletingLogo) return;

    try {
      setDeletingLogo(publicId);
      const response = await fetch("/api/homepage/brand-logos/postlogoDB", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId, logoId: _id }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete logo");
      }

      toast.success("Logo deleted successfully");
      await allBoxData();
    } catch (error) {
      console.error("Delete logo error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setDeletingLogo(null);
    }
  };

  useEffect(() => {
    allBoxData();
    getSectionTitle();
  }, []);

  const savedLogoCount = savedData.reduce(
    (total, item) => total + (item.logos?.length || 0),
    0,
  );

  return (
    <div className="w-full bg-[var(--background)] text-[var(--foreground)]">
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
          <label className="mb-3 block text-base font-semibold">
            Section Title
          </label>
          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Enter section title"
            disabled={isChangingTitle || isFetchingTitle}
            className="w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-5 py-4 text-base text-[var(--foreground)] transition outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleTitleSubmit}
            disabled={isChangingTitle || isFetchingTitle}
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-6 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isChangingTitle ? <Spinner /> : "Change Title"}
          </button>
        </div>

        <div className="p-7 sm:p-8">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">Brand Logos</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Add your company logos.
              </p>
            </div>
            <span className="w-fit rounded-full bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)]">
              Logo 1 required
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
                      alt={`Logo ${logo.id}`}
                      className="h-full w-full object-contain"
                      onError={() => {
                        setImageErrors((prev) => ({
                          ...prev,
                          [logo.id]: true,
                        }));
                      }}
                      onLoad={() => {
                        setImageErrors((prev) => ({
                          ...prev,
                          [logo.id]: false,
                        }));
                      }}
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
                            Logo {logo.id}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-0 lg:pr-12">
                  <div className="mb-4">
                    <p className="text-lg font-bold">Logo {logo.id}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {logo.id === 1
                        ? "Required brand logo"
                        : "Optional brand logo"}
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
                <Spinner />
              ) : (
                <>
                  <Upload size={18} />
                  Save Brand Logos
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
                          alt={`Logo ${logo.id}`}
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
