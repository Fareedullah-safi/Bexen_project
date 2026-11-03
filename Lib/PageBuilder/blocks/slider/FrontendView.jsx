"use client";

import Loader from "@/app/Components/Loader";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SliderFrontendView({ data }) {
  // Extract image URLs from CMS block data
  const images =
    data?.slides
      ?.map((slide) => slide?.image?.url)
      .filter((src) => typeof src === "string" && src.trim().length > 0) || [];

  const [image, setImage] = useState(images[0] || null);
  const [imageKey, setImageKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(false);

  // Sync when block data changes
  useEffect(() => {
    setImage(images[0] || null);
    setImageKey(0);
    setLoading(false);
  }, [data]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setImage((current) => {
        const currentIndex = images.indexOf(current);
        const nextIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % images.length;
        return images[nextIndex];
      });
      setImageKey((key) => key + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [images]);

  // Hide controls after 5s of inactivity
  useEffect(() => {
    if (!showControls) return;
    const timeout = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timeout);
  }, [showControls]);

  const handleImageChange = (img) => {
    if (!img) return;
    setImage(img);
    setImageKey((key) => key + 1);
    setShowControls(true);
  };

  const handlePrevious = () => {
    if (images.length <= 1) return;
    const currentIndex = images.indexOf(image);
    const previousIndex = (currentIndex - 1 + images.length) % images.length;
    handleImageChange(images[previousIndex]);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    const currentIndex = images.indexOf(image);
    const nextIndex = (currentIndex + 1) % images.length;
    handleImageChange(images[nextIndex]);
  };

  const handleMouseEnter = () => {
    if (!loading && images.length > 1) setShowControls(true);
  };

  const handleMouseLeave = () => setShowControls(false);

  return (
    <main className="z-7 h-full w-full px-4 py-3">
      <div
        className="relative mx-auto h-125 w-full overflow-hidden rounded-lg"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {image && (
          <div
            key={imageKey}
            className="wow animate__animated animate__fadeIn relative h-full w-full"
            data-wow-duration="1.2s"
          >
            <Image
              src={image}
              alt="Slider Image"
              fill
              priority
              sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1280px) calc(100vw - 32px), calc(100vw - 32px)"
              className="rounded-lg object-cover"
            />
          </div>
        )}

        {loading && !image && <Loader />}

        {!loading && !image && (
          <div className="flex h-full w-full items-center justify-center rounded-lg bg-[#F7F9FC] text-sm text-[var(--muted)]">
            No slider images available.
          </div>
        )}

        {images.length > 1 && (
          <div
            className={`absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/25 bg-black/20 p-1.5 shadow-lg backdrop-blur-md transition-all duration-500 ${
              showControls
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-3 opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous image"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:bg-white/25 active:scale-95 sm:h-10 sm:w-10"
            >
              <ChevronLeft
                size={19}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
            </button>

            <span className="min-w-12 px-1 text-center text-xs font-semibold tracking-wide text-white">
              {Math.max(images.indexOf(image), 0) + 1} / {images.length}
            </span>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next image"
              className="group flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-300 hover:scale-105 hover:bg-white/25 active:scale-95 sm:h-10 sm:w-10"
            >
              <ChevronRight
                size={19}
                strokeWidth={2}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
