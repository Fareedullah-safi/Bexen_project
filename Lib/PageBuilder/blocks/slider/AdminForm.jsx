"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import { CloudUpload, ImagePlus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function SliderAdminForm({ data, onChange }) {
  const slides = data?.slides || [];
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [replacingId, setReplacingId] = useState(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [widgetLoading, setWidgetLoading] = useState(true);

  // Load Cloudinary script
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.cloudinary) {
      setWidgetReady(true);
      setWidgetLoading(false);
      return;
    }

    let script = document.querySelector("script[data-cloudinary-widget]");

    const markReady = () => {
      setWidgetReady(true);
      setWidgetLoading(false);
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://upload-widget.cloudinary.com/global/all.js";
      script.async = true;
      script.setAttribute("data-cloudinary-widget", "true");
      document.head.appendChild(script);
    }

    if (window.cloudinary) {
      markReady();
    } else {
      script.addEventListener("load", markReady);
    }

    return () => {
      script?.removeEventListener("load", markReady);
    };
  }, []);

  // Helper: delete one image from Cloudinary
  const destroyCloudinaryImage = async (publicId) => {
    if (!publicId) return;

    try {
      await fetch("/api/admin/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
    } catch (err) {
      console.error("Failed to delete Cloudinary asset:", err);
    }
  };

  // ADD new slide
  const openCloudinary = () => {
    if (!widgetReady || !window.cloudinary) {
      toast.error("Cloudinary is still loading. Please wait a second.");
      return;
    }

    setUploading(true);

    window.cloudinary.openUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dch0v8syg",
        uploadPreset:
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cms_preset",
        sources: ["local", "url", "camera"],
        multiple: false,
        folder: "bexon/pages/sliders",
      },
      (error, result) => {
        if (error) {
          console.error("Upload Error:", error);
          toast.error("Upload failed.");
          setUploading(false);
          return;
        }

        if (result?.event === "success") {
          const newSlide = {
            id:
              typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : `slide_${Date.now()}`,
            image: {
              url: result.info.secure_url,
              publicId: result.info.public_id,
            },
          };

          onChange({ ...data, slides: [...slides, newSlide] });
          setPreview("");
          toast.success("Image added to slider!");
          setUploading(false);
        }

        if (result?.event === "close" || result?.event === "abort") {
          setUploading(false);
        }
      },
    );
  };

  // REPLACE existing slide image (also deletes OLD Cloudinary image)
  const replaceSlideImage = (slide) => {
    if (!widgetReady || !window.cloudinary) {
      toast.error("Cloudinary is still loading. Please wait a second.");
      return;
    }

    setReplacingId(slide.id);

    window.cloudinary.openUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dch0v8syg",
        uploadPreset:
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "cms_preset",
        sources: ["local", "url", "camera"],
        multiple: false,
        folder: "bexon/pages/sliders",
      },
      async (error, result) => {
        if (error) {
          console.error("Upload Error:", error);
          toast.error("Upload failed.");
          setReplacingId(null);
          return;
        }

        if (result?.event === "success") {
          const oldPublicId = slide.image?.publicId || slide.publicId;

          // 1. Delete OLD image from Cloudinary
          await destroyCloudinaryImage(oldPublicId);

          // 2. Save NEW image on this slide
          const updatedSlides = slides.map((s) =>
            s.id === slide.id
              ? {
                  ...s,
                  image: {
                    url: result.info.secure_url,
                    publicId: result.info.public_id,
                  },
                }
              : s,
          );

          onChange({ ...data, slides: updatedSlides });
          toast.success("Slide image replaced!");
          setReplacingId(null);
        }

        if (result?.event === "close" || result?.event === "abort") {
          setReplacingId(null);
        }
      },
    );
  };

  // DELETE slide from UI + Cloudinary
  const removeSlide = async (slide) => {
    if (deletingId) return;
    setDeletingId(slide.id);

    const publicId = slide.image?.publicId || slide.publicId;

    // 1. Destroy on Cloudinary
    await destroyCloudinaryImage(publicId);

    // 2. Remove from block state
    const updatedSlides = slides.filter((s) => s.id !== slide.id);
    onChange({ ...data, slides: updatedSlides });

    setDeletingId(null);
    toast.success("Image deleted successfully.");
  };

  const isBusy = uploading || widgetLoading;

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* HEADER */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">
          Page Builder
        </p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
          Hero Slider
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage your slider images here.
        </p>
      </div>

      {/* UPLOAD SECTION */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div>
          <h2 className="font-bold">Add New Slide</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Upload an image directly to Cloudinary.
          </p>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Left: Preview Box */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <div className="aspect-[16/8] min-h-[220px]">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <ImagePlus size={38} className="text-[var(--accent)]" />
                  <p className="mt-3 text-sm font-semibold">
                    No image selected
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Your image preview will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Cloudinary Button */}
          <div className="flex flex-col justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
              <CloudUpload size={24} />
            </div>
            <h3 className="mb-2 text-sm font-bold">Cloudinary Upload</h3>
            <p className="mb-6 text-xs text-[var(--muted)]">
              {widgetLoading
                ? "Loading Cloudinary widget..."
                : "Click below to open the secure upload widget."}
            </p>

            <button
              type="button"
              onClick={openCloudinary}
              disabled={isBusy}
              className="mt-auto flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {widgetLoading ? (
                <>
                  <Spinner size={17} color="white" />
                  Loading Widget...
                </>
              ) : uploading ? (
                <>
                  <Spinner size={17} color="white" />
                  Uploading...
                </>
              ) : (
                <>
                  <CloudUpload size={17} />
                  Upload Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* GALLERY SECTION */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Slider Images</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {slides.length} {slides.length === 1 ? "image" : "images"} added
            </p>
          </div>
        </div>

        {slides.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
              >
                <div className="flex aspect-video items-center justify-center overflow-hidden bg-[var(--background)]">
                  {slide.image?.url ? (
                    <img
                      src={slide.image.url}
                      alt={`Slide ${index + 1}`}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-xs text-[var(--muted)]">
                      <ImagePlus
                        size={28}
                        className="mb-1 text-[var(--accent)]"
                      />
                      No Image Available
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 p-3 sm:p-4">
                  <span className="text-sm font-semibold">
                    Slide {index + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* REPLACE = upload new + delete old from Cloudinary */}
                    <button
                      type="button"
                      onClick={() => replaceSlideImage(slide)}
                      disabled={
                        replacingId === slide.id || deletingId === slide.id
                      }
                      className="cursor-pointer rounded-lg border border-[var(--accent)]/30 px-2 py-1.5 text-xs font-semibold text-[var(--accent)] transition hover:bg-[var(--accent)]/10 disabled:opacity-50"
                    >
                      {replacingId === slide.id ? (
                        <Spinner size={14} color="teal" />
                      ) : (
                        "Replace"
                      )}
                    </button>

                    {/* DELETE = remove from UI + Cloudinary */}
                    <button
                      type="button"
                      onClick={() => removeSlide(slide)}
                      disabled={
                        deletingId === slide.id || replacingId === slide.id
                      }
                      className="cursor-pointer rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {deletingId === slide.id ? (
                        <Spinner size={15} color="red" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
            No images yet.
          </div>
        )}
      </div>
    </div>
  );
}