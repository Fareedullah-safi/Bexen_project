"use client";

import { ImagePlus, Link, Trash2Icon, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BrandLogos() {
  const [logos, setLogos] = useState([
    { id: 1, preview: "", file: null, url: "" },
    { id: 2, preview: "", file: null, url: "" },
    { id: 3, preview: "", file: null, url: "" },
  ]);

  const [sectionTitle, setSectionTitle] = useState(
    "Join Over 1000+ Companies with Bexon Here",
  );

  const [savedData, setSavedData] = useState([]);

  // PC upload
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

  // URL upload
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

  // Remove selected image
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
  };

  // Upload to Cloudinary and save to MongoDB
  const handleSubmit = async () => {
    const data = {
      title: sectionTitle.trim(),
      logos: logos.map((logo) => ({
        id: logo.id,
        file: logo.file,
        url: logo.url,
      })),
    };

    if (!data.title) {
      return toast.error("Please enter a section title");
    }

    if (!data.logos[0].file && !data.logos[0].url) {
      return toast.error("Please add Logo 1");
    }

    try {
      const formData = new FormData();

      formData.append("title", data.title);

      data.logos.forEach((logo) => {
        formData.append("ids", String(logo.id));

        if (logo.file) {
          formData.append("files", logo.file);
        }

        formData.append("urls", logo.url || "");
      });

      // Cloudinary API
      const response = await fetch("/api/homepage/brand-logos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      console.log("Secure URL api", result);

      if (!response.ok || !result.success) {
        return toast.error(result.error || "Cloudinary upload failed");
      }

      // MongoDB API
      const postResponse = await fetch("/api/homepage/brand-logos/postlogoDB", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: result.title,
          logos: result.logos,
        }),
      });
      console.log("SENDING TO MONGODB:", result.logos);

      const postResult = await postResponse.json();

      console.log("MongoDB API:", postResult);

      if (!postResponse.ok || !postResult.success) {
        return toast.error(postResult.error || "Failed to save data");
      }

      toast.success("Brand logos saved successfully");

      // Get latest data
      allBoxData();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong");
    }
  };

  // Get saved logos from MongoDB
  const allBoxData = async () => {
    try {
      const response = await fetch("/api/homepage/brand-logos/postlogoDB");

      const data = await response.json();

      console.log("MongoDB GET:", data);

      if (!response.ok || !data.success) {
        console.error("GET error:", data.error);
        return;
      }
      console.log(data.data);
      setSavedData(data.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    allBoxData();
  }, []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0C1E21] dark:text-white">
          Brand Logos
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage the brand logos displayed on your homepage.
        </p>
      </div>

      <div className="space-y-6">
        {/* Section Title */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
          <label className="mb-2 block text-sm font-semibold text-[#0C1E21] dark:text-white">
            Section Title
          </label>

          <input
            type="text"
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            placeholder="Enter section title"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
          />
        </div>

        {/* Upload Logos */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0C1E21] dark:text-white">
              Brand Logos
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Logo 1 is required. Logo 2 and Logo 3 are optional.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-[#0C1E21]"
              >
                <div className="mb-3">
                  <span className="text-sm font-semibold text-[#0C1E21] dark:text-white">
                    Logo {logo.id}
                  </span>

                  <span
                    className={`ml-2 text-xs ${
                      logo.id === 1 ? "text-red-500" : "text-gray-400"
                    }`}
                  >
                    {logo.id === 1 ? "Required" : "Optional"}
                  </span>
                </div>

                {/* Preview */}
                <div
                  className={`mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 ${
                    logo.id === 1
                      ? "border-red-300 bg-red-50/30 dark:border-red-500/30 dark:bg-red-500/5"
                      : "border-gray-300 bg-white dark:border-white/10 dark:bg-[#111b1d]"
                  }`}
                >
                  {logo.preview ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => handleRemove(logo.id)}
                        className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2Icon size={16} />
                      </button>

                      <img
                        src={logo.preview}
                        alt={`Logo ${logo.id}`}
                        className="max-h-20 w-auto object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <ImagePlus size={28} />

                      <span className="mt-2 text-xs">
                        {logo.id === 1 ? "Required Logo" : "Optional Logo"}
                      </span>
                    </div>
                  )}
                </div>

                {/* PC Upload */}
                <label
                  htmlFor={`logo-${logo.id}`}
                  className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    logo.url
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                      : "cursor-pointer border-gray-200 bg-white text-[#0C1E21] hover:border-[#1E8A8A] hover:text-[#1E8A8A]"
                  }`}
                >
                  <Upload size={17} />
                  Upload from PC
                </label>

                <input
                  id={`logo-${logo.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={!!logo.url}
                  onChange={(e) => handleLogo(logo.id, e)}
                />

                {/* URL */}
                <div className="relative">
                  <Link
                    size={16}
                    className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="url"
                    value={logo.url}
                    disabled={!!logo.file}
                    placeholder="Paste image URL"
                    onChange={(e) => handleUrl(logo.id, e)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3 pl-10 text-sm outline-none focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#111b1d] dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="mt-6 flex justify-end border-t border-gray-200 pt-5 dark:border-white/10">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777]"
            >
              <Upload size={18} />
              Upload Logos
            </button>
          </div>
        </div>

        {/* Saved MongoDB Data */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#0C1E21] dark:text-white">
              Saved Brand Logos
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Logos currently saved in MongoDB.
            </p>
          </div>

          {savedData.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400 dark:border-white/10">
              No saved logos found.
            </div>
          ) : (
            <div className="space-y-6">
              {savedData.map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-5 dark:border-white/10 dark:bg-[#0C1E21]"
                >
                  <h3 className="mb-4 text-base font-semibold text-[#0C1E21] dark:text-white">
                    {item.title}
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {item.logos?.map((logo) => (
                      <div
                        key={logo.id}
                        className="rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#111b1d]"
                      >
                        <div className="mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Logo {logo.id}
                        </div>

                        <div className="flex h-28 items-center justify-center overflow-hidden rounded-lg bg-gray-50 p-4 dark:bg-[#0C1E21]">
                          {logo.url ? (
                            <img
                              src={logo.url}
                              alt={`Logo ${logo.id}`}
                              className="max-h-20 max-w-full object-contain"
                              onError={() =>
                                console.error("Image failed:", logo.url)
                              }
                            />
                          ) : (
                            <span className="text-xs text-gray-400">
                              No image URL
                            </span>
                          )}
                        </div>

                        <p className="mt-3 truncate text-xs text-gray-400">
                          {logo.publicId}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
