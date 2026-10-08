"use client";

import { ImagePlus, Link, Trash2, Trash2Icon, Upload } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function BrandLogos() {
  const [logos, setLogos] = useState([
    { id: 1, preview: "", file: null, url: "" },
    { id: 2, preview: "", file: null, url: "" },
    { id: 3, preview: "", file: null, url: "" },
  ]);
  const [sectionTitle, setSectionTitle] = useState(
    "Join Over 1000+ Companies with Bexon Here",
  );

  const handleLogo = (id, e) => {
    const file = e.target.files[0];
    const currentLogo = logos.find((logo) => logo.id === id);
    if (currentLogo?.url) {
      e.target.value = "";
      return;
    }

    if (!file) return;
    const preview = URL.createObjectURL(file);
    setLogos(
      logos.map((logo) =>
        logo.id === id ? { ...logo, file, url: "", preview } : logo,
      ),
    );
  };

  // url handling

  const handleUrl = (id, e) => {
    const url = e.target.value;
    const currentLogo = logos.find((logo) => logo.id === id);

    if (currentLogo?.file) return;
    setLogos(
      logos.map((logo) =>
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
  // handle remove instate of reload to change the image
  const handleRemove = (id) => {
    console.log(id);

    setLogos(
      logos.map((logo) =>
        logo.id === id
          ? {
              ...logo,
              file: null,
              preview: "",
              url: "",
            }
          : logo,
      ),
    );
  };

  //send image to cloudinary

  // handling all data
  const handleSubmit = async () => {
    const Data = {
      title: sectionTitle.trim(),
      logos: logos.map((logo) => ({
        id: logo.id,
        file: logo.file,
        url: logo.url,
      })),
    };

    if (!Data.title) {
      return toast.error("Please enter a section title");
    }

    if (!Data.logos[0].file && !Data.logos[0].url) {
      return toast.error("Please add Logo 1");
    }

    const formData = new FormData();

    formData.append("title", Data.title);

    Data.logos.forEach((logo) => {
      formData.append("ids", logo.id);

      if (logo.file) {
        formData.append("files", logo.file);
      }

      formData.append("urls", logo.url);
    });

    const response = await fetch("/api/homepage/brand-logos", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    const postRes = await fetch("/api/homepage/brand-logos/postlogoDB", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: result.title,
        logos: result.logos,
      }),
    });
    console.log(postRes);

    console.log("API:", result);
  };

  ////
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0C1E21] dark:text-white">
          Brand Logos
        </h1>

        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage the brand logos displayed on your homepage.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#111b1d]">
          <label className="mb-2 block text-sm font-semibold text-[#0C1E21] dark:text-white">
            Section Title
          </label>

          <input
            value={sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
            type="text"
            placeholder="Enter section title"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm transition outline-none focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
          />
        </div>

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

                <div
                  className={`mb-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-dashed p-4 ${
                    logo.id === 1
                      ? "border-red-300 bg-red-50/30 dark:border-red-500/30 dark:bg-red-500/5"
                      : "border-gray-300 bg-white dark:border-white/10 dark:bg-[#111b1d]"
                  }`}
                >
                  <div className="flex flex-col items-center text-gray-400">
                    {logo.preview ? (
                      <div className="relative flex flex-col items-center">
                        <button
                          type="button"
                          onClick={() => handleRemove(logo.id)}
                          className="absolute -top-3 -right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                        >
                          <Trash2Icon size={16} />
                        </button>

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={logo.preview}
                          alt={`Logo ${logo.id}`}
                          className="max-h-20 w-auto object-contain"
                        />
                      </div>
                    ) : (
                      <ImagePlus size={28} />
                    )}
                    <span className="mt-2 text-xs">
                      {logo.id === 1 ? "Required Logo" : "Optional Logo"}
                    </span>
                  </div>
                </div>
                <label
                  htmlFor={`logo-${logo.id}`}
                  className={`mb-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                    logo.url
                      ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 opacity-60 dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-500"
                      : "cursor-pointer border-gray-200 bg-white text-[#0C1E21] hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111b1d] dark:text-white"
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
                    className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-3 pl-10 text-sm transition outline-none focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#111b1d] dark:text-white"
                    onChange={(e) => handleUrl(logo.id, e)}
                  />
                </div>
              </div>
            ))}
          </div>

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
      </div>
    </div>
  );
}
