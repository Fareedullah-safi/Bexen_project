"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Trash2, Loader2 } from "lucide-react";

export default function HomePage() {
  const fileRef = useRef(null);

  const [slides, setSlides] = useState([]);
  const [source, setSource] = useState("upload");
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [editId, setEditId] = useState(null);
  const [urlReady, setUrlReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/home-slider", { cache: "no-store" });
    const data = await res.json();
    setSlides(data.slides || []);
  };

  useEffect(() => {
    load();
  }, []);

  const reset = () => {
    setFile(null);
    setImageUrl("");
    setPreview("");
    setEditId(null);
    setUrlReady(false);
    setSource("upload");
    if (fileRef.current) fileRef.current.value = "";
  };

  const chooseFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/"))
      return alert("Please select an image.");

    if (selected.size > 10 * 1024 * 1024)
      return alert("Image must be under 10MB.");

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const chooseUrl = (value) => {
    setImageUrl(value);
    setPreview(value);
    setUrlReady(false);
  };

  const save = async () => {
    if (source === "upload" && !file) return alert("Choose an image.");

    if (source === "url" && !urlReady) return alert("Enter a valid image URL.");

    setLoading(true);

    try {
      const form = new FormData();

      if (source === "upload") form.append("image", file);
      else form.append("imageUrl", imageUrl.trim());

      const res = await fetch(
        editId ? `/api/home-slider/${editId}` : "/api/home-slider",
        {
          method: editId ? "PUT" : "POST",
          body: form,
        },
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Upload failed.");

      await load();
      reset();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const edit = (slide) => {
    setEditId(slide._id);
    setSource(slide.source || "url");
    setPreview(slide.image);

    if (slide.source === "url") {
      setImageUrl(slide.image);
      setUrlReady(true);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this slider image?")) return;

    await fetch(`/api/home-slider/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">Home Page</p>

        <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
          Home Slider
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage your homepage slider images.
        </p>
      </div>

      {/* Form */}
      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold">
              {editId ? "Edit Slider" : "Add Slider"}
            </h2>

            <p className="text-xs text-[var(--muted)]">
              Upload from PC or use an image URL.
            </p>
          </div>

          {editId && (
            <button
              onClick={reset}
              className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--accent)]"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          {/* Preview */}
          <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
            <div className="aspect-[16/8] min-h-[220px]">
              {preview ? (
                <img
                  src={preview}
                  alt="Slider preview"
                  onLoad={() => source === "url" && setUrlReady(true)}
                  onError={() => {
                    if (source === "url") {
                      setUrlReady(false);
                      setPreview("");
                    }
                  }}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <ImagePlus size={38} className="text-[var(--accent)]" />

                  <p className="mt-3 text-sm font-semibold">
                    No image selected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col">
            <div className="grid grid-cols-2 rounded-xl border border-[var(--border)] p-1">
              <button
                type="button"
                onClick={() => {
                  setSource("upload");
                  setUrlReady(false);
                }}
                className={`h-10 rounded-lg text-sm font-semibold ${
                  source === "upload"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                From PC
              </button>

              <button
                type="button"
                onClick={() => {
                  setSource("url");
                  setFile(null);
                  setUrlReady(false);
                }}
                className={`h-10 rounded-lg text-sm font-semibold ${
                  source === "url"
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)]"
                }`}
              >
                Image URL
              </button>
            </div>

            {source === "upload" ? (
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
                  className="mt-4 h-11 rounded-xl border border-[var(--border)] text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {file ? "Change Image" : "Choose Image"}
                </button>
              </>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => chooseUrl(e.target.value)}
                placeholder="https://example.com/image.webp"
                className="mt-4 h-11 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 text-sm outline-none focus:border-[var(--accent)]"
              />
            )}

            <button
              type="button"
              onClick={save}
              disabled={loading || (source === "upload" ? !file : !urlReady)}
              className="mt-auto flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ImagePlus size={17} />
                  {editId ? "Update Image" : "Upload Image"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slides */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="mb-5 font-bold">Slider Images</h2>

        {slides.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
              >
                <div className="aspect-video">
                  <img
                    src={slide.image}
                    alt={`Slider ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex items-center justify-between p-3 sm:p-4">
                  <span className="text-sm font-semibold">
                    Slide {index + 1}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => edit(slide)}
                      className="rounded-lg border border-[var(--border)] p-2 hover:text-[var(--accent)]"
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      onClick={() => remove(slide._id)}
                      className="rounded-lg border border-red-500/20 p-2 text-red-500"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
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
