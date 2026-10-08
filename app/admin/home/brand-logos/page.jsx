"use client";

import { ImagePlus, Link, Trash2Icon, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/app/admin/Components/Admin/Spinner";

export default function BrandLogos() {
  const fileRefs = useRef({});

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

  const handleLogo = (id, e) => {
    const file = e.target.files[0];

    if (!file) return;

    const currentLogo = logos.find((logo) => logo.id === id);

    if (currentLogo?.url) {
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id
          ? {
              ...logo,
              file,
              url: "",
              preview,
            }
          : logo,
      ),
    );
  };

  const handleUrl = (id, e) => {
    const url = e.target.value;

    const currentLogo = logos.find((logo) => logo.id === id);

    if (currentLogo?.file) return;

    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id
          ? {
              ...logo,
              file: null,
              url,
              preview: url,
            }
          : logo,
      ),
    );
  };

  const handleRemove = (id) => {
    setLogos((prev) =>
      prev.map((logo) =>
        logo.id === id
          ? {
              ...logo,
              file: null,
              url: "",
              preview: "",
            }
          : logo,
      ),
    );

    if (fileRefs.current[id]) {
      fileRefs.current[id].value = "";
    }
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

    if (!data.logos[0].file && !data.logos[0].url) {
      return toast.error("Please add Logo 1");
    }

    try {
      setIsSaving(true);

      const formData = new FormData();

      data.logos.forEach((logo) => {
        formData.append("ids", String(logo.id));

        if (logo.file) {
          formData.append("files", logo.file);
        }

        formData.append("urls", logo.url || "");
      });

      const response = await fetch("/api/homepage/brand-logos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        return toast.error(result.error || "Cloudinary upload failed");
      }

      const postResponse = await fetch("/api/homepage/brand-logos/postlogoDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logos: result.logos,
        }),
      });

      const postResult = await postResponse.json();

      if (!postResponse.ok || !postResult.success) {
        return toast.error(
          postResult.error || "Failed to upload logos. Check your logo links.",
        );
      }

      Object.values(fileRefs.current).forEach((input) => {
        if (input) {
          input.value = "";
        }
      });

      toast.success("Brand logos saved successfully");

      setLogos((prev) =>
        prev.map((logo) => ({
          ...logo,
          file: null,
          url: "",
          preview: "",
        })),
      );

      await allBoxData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const allBoxData = async () => {
    if (isFetching) return;

    try {
      setIsFetching(true);

      const response = await fetch("/api/homepage/brand-logos/postlogoDB");

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("GET error:", data.error);
        return;
      }

      setSavedData(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
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
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        console.error("Title GET error:", data.error);
        return;
      }

      setSectionTitle(data.data?.title || "");
    } catch (error) {
      console.error("Title fetch error:", error);
    } finally {
      setIsFetchingTitle(false);
    }
  };

  const handleTitleSubmit = async () => {
    if (isChangingTitle) return;

    if (!sectionTitle.trim()) {
      return toast.error("Please enter a section title");
    }

    try {
      setIsChangingTitle(true);

      const response = await fetch(
        "/api/homepage/brand-logos/postlogoDB/title",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: sectionTitle.trim(),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return toast.error(data.error || "Failed to change title");
      }

      toast.success("Title changed successfully");
    } catch (error) {
      console.error("Title change error:", error);
      toast.error("Something went wrong");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicId,
          logoId: _id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return toast.error(data.error || "Failed to delete logo");
      }

      toast.success("Logo deleted successfully");

      await allBoxData();
    } catch (error) {
      console.error("Delete logo error:", error);
      toast.error("Something went wrong");
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
    <div className="w-full">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          <ImagePlus size={27} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0C1E21] dark:text-white">
            Brand Logos
          </h1>

          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Manage the brand logos displayed on your homepage.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
        <div className="border-b border-gray-200 p-7 sm:p-8 dark:border-white/10">
          <label className="mb-3 block text-base font-semibold text-[#0C1E21] dark:text-white">
            Section Title
          </label>

          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Enter section title"
            disabled={isChangingTitle || isFetchingTitle}
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-base text-[#0C1E21] transition outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:cursor-not-allowed disabled:border-[#1E8A8A]/20 disabled:bg-[#E8F2F2] disabled:text-[#6B8585] disabled:placeholder:text-[#8FA5A5] dark:border-white/10 dark:bg-[#0C1E21] dark:text-white dark:disabled:border-[#1E8A8A]/20 dark:disabled:bg-[#122A2D] dark:disabled:text-[#789494]"
          />

          <button
            type="button"
            onClick={handleTitleSubmit}
            disabled={isChangingTitle || isFetchingTitle}
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:bg-[#155F61] disabled:text-white/80 disabled:shadow-none"
          >
            {isChangingTitle ? (
              <>
                <Spinner />
                Changing...
              </>
            ) : (
              "Change Title"
            )}
          </button>
        </div>

        <div className="p-7 sm:p-8">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Brand Logos
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Add your company logos.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#1E8A8A]/10 px-4 py-2 text-sm font-semibold text-[#1E8A8A]">
              Logo 1 required
            </span>
          </div>

          <div className="space-y-5">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="relative flex flex-col gap-6 rounded-3xl border border-gray-200 bg-gray-50 p-5 transition hover:border-[#1E8A8A]/40 hover:shadow-lg sm:p-6 lg:flex-row lg:items-center dark:border-white/10 dark:bg-[#0C1E21]"
              >
                {logo.preview && (
                  <button
                    type="button"
                    onClick={() => handleRemove(logo.id)}
                    disabled={isSaving}
                    title="Remove logo"
                    className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:bg-[#E8F2F2] disabled:text-[#789494] disabled:opacity-100 dark:bg-[#111b1d] dark:disabled:bg-[#122A2D] dark:disabled:text-[#789494]"
                  >
                    <Trash2Icon size={17} />
                  </button>
                )}

                <div className="flex h-36 w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 sm:h-40 lg:w-56 dark:border-white/10 dark:bg-[#111b1d]">
                  {logo.preview ? (
                    <img
                      src={logo.preview}
                      alt={`Logo ${logo.id}`}
                      className="max-h-28 max-w-[85%] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
                        <ImagePlus size={29} />
                      </div>

                      <span className="mt-3 text-sm font-medium">
                        Logo {logo.id}
                      </span>
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 pr-0 lg:pr-12">
                  <div className="mb-4">
                    <p className="text-lg font-bold text-[#0C1E21] dark:text-white">
                      Logo {logo.id}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
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
                          ? "cursor-not-allowed border border-[#1E8A8A]/20 bg-[#E8F2F2] text-[#789494] dark:bg-[#122A2D] dark:text-[#789494]"
                          : "cursor-pointer bg-[#0C1E21] text-white hover:bg-[#1E8A8A]"
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
                      accept="image/*"
                      className="hidden"
                      disabled={isSaving || !!logo.url}
                      onChange={(e) => handleLogo(logo.id, e)}
                    />

                    <div className="relative flex-1">
                      <Link
                        size={17}
                        className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="url"
                        value={logo.url}
                        disabled={isSaving || !!logo.file}
                        placeholder="Paste image URL"
                        onChange={(e) => handleUrl(logo.id, e)}
                        className="min-h-12 w-full rounded-2xl border border-gray-200 bg-white py-3 pr-4 pl-11 text-sm transition outline-none focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 disabled:cursor-not-allowed disabled:border-[#1E8A8A]/20 disabled:bg-[#E8F2F2] disabled:text-[#789494] disabled:placeholder:text-[#9AB0B0] dark:border-white/10 dark:bg-[#111b1d] dark:text-white dark:disabled:border-[#1E8A8A]/20 dark:disabled:bg-[#122A2D] dark:disabled:text-[#789494]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-7 flex justify-end border-t border-gray-200 pt-7 dark:border-white/10">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:bg-[#155F61] disabled:text-white/80 disabled:opacity-100 disabled:shadow-none sm:w-auto"
            >
              {isSaving ? (
                <>
                  <Spinner />
                  Saving...
                </>
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
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Saved Brand Logos
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Logos currently saved in your database.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#1E8A8A]/10 px-4 py-2 text-sm font-semibold text-[#1E8A8A]">
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
                      className="relative flex h-36 w-48 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-5 shadow-sm transition hover:border-[#1E8A8A]/40 hover:shadow-md dark:border-white/10 dark:bg-[#0C1E21]"
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
                        className="absolute top-2 right-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:bg-[#E8F2F2] disabled:text-[#789494] disabled:opacity-100 dark:bg-[#111b1d] dark:disabled:bg-[#122A2D] dark:disabled:text-[#789494]"
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
                          className="max-h-20 max-w-[85%] object-contain"
                        />
                      ) : (
                        <ImagePlus size={27} className="text-gray-400" />
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
        <div className="mt-8 flex min-h-32 items-center justify-center rounded-3xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111b1d]">
          <Spinner />
        </div>
      )}
    </div>
  );
}
