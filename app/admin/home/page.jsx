"use client";

import { ImagePlus, Pencil, Trash2 } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "/images/slider-1.webp",
  },
  {
    id: 2,
    image: "/images/slider-2.webp",
  },
  {
    id: 3,
    image: "/images/slider-3.webp",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1400px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold text-[var(--accent)]">
          Home Page
        </p>

        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Home Slider
        </h1>

        <p className="mt-2 text-sm text-[var(--muted)]">
          Manage the images displayed in the homepage slider.
        </p>
      </div>

      {/* Slider Management */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        {/* Top */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Slider Images</h2>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Add, replace, or remove homepage slider images.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
          >
            <ImagePlus size={17} />
            Add Image
          </button>
        </div>

        {/* Images */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              className="group overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={slide.image}
                  alt={`Homepage slider ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Slide Number */}
                <div className="absolute top-3 left-3 flex h-8 min-w-8 items-center justify-center rounded-lg bg-black/60 px-2 text-xs font-bold text-white backdrop-blur-sm">
                  {String(index + 1).padStart(2, "0")}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#0C1E21] shadow-lg transition-transform duration-200 hover:scale-105"
                    title="Edit image"
                  >
                    <Pencil size={17} />
                  </button>

                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg transition-transform duration-200 hover:scale-105"
                    title="Delete image"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Bottom */}
              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-sm font-semibold">Slide {index + 1}</p>

                <span className="text-xs text-[var(--muted)]">Image</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {SLIDES.length === 0 && (
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] text-center">
            <ImagePlus size={40} className="mb-4 text-[var(--accent)]" />

            <h3 className="text-lg font-bold">No slider images</h3>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Add your first image to the homepage slider.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
