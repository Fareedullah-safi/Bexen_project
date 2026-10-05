"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Trash2, LoaderCircle, Link } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const fileRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [preview, setPreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState("file");

  // Fetch slider images
  useEffect(() => {
    const getSlides = async () => {
      try {
        const res = await fetch("/api/homepage");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to load slides.");
        }

        setSlides(data.slides || []);
      } catch (error) {
        console.error("Fetch slides:", error);
        toast.error(error.message || "Failed to load slides.");
      }
    };

    getSlides();
  }, []);

  // Select and preview local image
  const chooseFile = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
  };

  // Preview image URL
  const handleUrlChange = (e) => {
    const value = e.target.value;

    setImageUrl(value);
    setPreview(value.trim());
  };

  // Upload image to API
  const addImage = async () => {
    const formData = new FormData();

    if (uploadType === "file") {
      const file = fileRef.current?.files?.[0];

      if (!file) {
        toast.error("Choose an image first.");
        return;
      }

      formData.append("image", file);
    }

    if (uploadType === "url") {
      const url = imageUrl.trim();

      if (!url) {
        toast.error("Enter an image URL first.");
        return;
      }

      formData.append("imageUrl", url);
    }

    setUploading(true);

    try {
      const res = await fetch("/api/homepage", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Upload failed.");
      }

      // Add new image to the list
      setSlides((prev) => [...prev, data]);

      // Reset form
      setPreview("");
      setImageUrl("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }

      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload image:", error);
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Remove image from current UI
 const removeImage = async (id) => {
  try {
    console.log("ID:", id);

    const res = await fetch("/api/homepage", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to delete image");
    }

    setSlides((prev) => prev.filter((slide) => slide._id !== id));

    toast.success("Image deleted successfully.");
  } catch (error) {
    console.error("Delete error:", error);
    toast.error(error.message || "Failed to delete image");
  }
};
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* Page header */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">Home Page</p>

        <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
          Home Slider
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage your homepage slider images.
        </p>
      </div>

      {/* Upload card */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div>
          <h2 className="font-bold">Add Slider</h2>

          <p className="mt-1 text-xs text-[var(--muted)]">
            Upload an image from your device or use an image URL.
          </p>
        </div>

        {/* Upload method */}
        <div className="mt-5 flex w-full rounded-xl border border-[var(--border)] p-1">
          <button
            type="button"
            onClick={() => {
              setUploadType("file");
              setPreview("");
              setImageUrl("");
            }}
            disabled={uploading}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
              uploadType === "file"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
            }`}
          >
            <ImagePlus size={16} />
            Upload Image
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadType("url");
              setPreview("");

              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }}
            disabled={uploading}
            className={`flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${
              uploadType === "url"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--muted)] hover:text-[var(--accent)]"
            }`}
          >
            <Link size={16} />
            Image URL
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Image preview */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <div className="aspect-[16/8] min-h-[220px]">
              {preview ? (
                <img
                  src={preview}
                  alt="Slider preview"
                  className="h-full w-full object-cover"
                  onError={() => setPreview("")}
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

          {/* Upload controls */}
          <div className="flex flex-col">
            {uploadType === "file" ? (
              <>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={chooseFile}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="h-11 rounded-xl border border-[var(--border)] text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Choose Image
                </button>
              </>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/image.jpg"
                disabled={uploading}
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] disabled:opacity-50"
              />
            )}

            {/* Upload button */}
            <button
              type="button"
              onClick={addImage}
              disabled={uploading}
              className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {uploading ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImagePlus size={17} />
                  Upload Slider Image
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slider images */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Slider Images</h2>

            <p className="mt-1 text-xs text-[var(--muted)]">
              {slides.length} {slides.length === 1 ? "image" : "images"}
            </p>
          </div>
        </div>

        {slides.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
              >
                {/* Slider image */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={slide.image}
                    alt={`Slider ${index + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4">
                  <div>
                    <span className="text-sm font-semibold">
                      Slide {index + 1}
                    </span>

                    {slide.source && (
                      <p className="mt-1 text-xs text-[var(--muted)] capitalize">
                        Source: {slide.source}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeImage(slide._id)}
                    disabled={uploading}
                    className="rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-sm text-[var(--muted)]">
            No slider images yet.
          </div>
        )}
      </div>
    </div>
  );
}
