"use client";

import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const SCRIPT = "script[data-cloudinary-widget]";

export default function BannerAdminForm({ data, onChange }) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const widget = useRef(null);
  const opening = useRef(false);

  const image = data?.en || {};

  useEffect(() => {
    const updateTheme = () =>
      setDark(document.documentElement.classList.contains("dark"));
    updateTheme();
    const obs = new MutationObserver(updateTheme);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    let script = document.querySelector(SCRIPT);

    const handleLoad = () => {
      if (active) setReady(!!window.cloudinary?.createUploadWidget);
    };
    const handleError = () => {
      if (active) toast.error("Could not load Cloudinary.");
    };

    if (window.cloudinary?.createUploadWidget) {
      setReady(true);
    } else {
      if (!script) {
        script = document.createElement("script");
        script.src = "https://upload-widget.cloudinary.com/global/all.js";
        script.async = true;
        script.dataset.cloudinaryWidget = "true";
      }
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", handleError);
      if (!script.isConnected) document.head.appendChild(script);
    }

    return () => {
      active = false;
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
      widget.current?.destroy?.();
      widget.current = null;
    };
  }, []);

  const saveImage = (url, publicId) => {
    onChange({
      en: { url, publicId },
      ps: { url, publicId },
      fa: { url, publicId },
    });
  };

  function openWidget() {
    if (opening.current || uploading) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || !window.cloudinary?.createUploadWidget) {
      toast.error("Check your Cloudinary configuration.");
      return;
    }

    opening.current = true;
    setUploading(true);

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/pages/banner",
          cropping: false,
          styles: {
            palette: {
              window: dark ? "#111a23" : "#ffffff",
              windowBorder: dark ? "#263442" : "#e4e7ec",
              tabIcon: "#1e8a8a",
              action: "#1e8a8a",
              link: "#1e8a8a",
              textDark: dark ? "#f2f4f7" : "#101828",
              textLight: dark ? "#98a2b3" : "#667085",
              sourceBg: dark ? "#16212c" : "#f7f9fc",
            },
          },
        },
        (error, result) => {
          if (error) toast.error(error.message || "Image upload failed.");

          if (result?.event === "success") {
            const { secure_url: url, public_id: publicId } = result.info || {};
            if (!url || !publicId) {
              toast.error("Invalid image returned by Cloudinary.");
              return;
            }
            saveImage(url, publicId);
            toast.success("Banner uploaded.");
          }

          if (["close", "abort"].includes(result?.event)) {
            setUploading(false);
            opening.current = false;
            widget.current = null;
          }
        },
      );

      widget.current.open();
    } catch {
      toast.error("Could not open Cloudinary.");
      setUploading(false);
      opening.current = false;
      widget.current = null;
    }
  }

  const muted = dark ? "text-[#98a2b3]" : "text-[#667085]";
  const boxBg = dark
    ? "border-[#263442] bg-[#16212c]"
    : "border-[#e4e7ec] bg-[#f7f9fc]";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Banner image</p>
          <p className={`mt-1 text-xs ${muted}`}>
            Title on the website = page name (navbar / route). Upload image
            only.
          </p>
        </div>
        {image?.url && (
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
            <CheckCircle2 size={15} /> Ready
          </span>
        )}
      </div>

      <div
        className={`flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border sm:min-h-56 ${boxBg}`}
      >
        {image?.url ? (
          <img
            src={image.url}
            alt="Banner"
            className="block h-auto max-h-[50vh] w-full object-contain"
          />
        ) : (
          <div className="px-5 py-12 text-center">
            <ImagePlus size={34} className="mx-auto mb-3 text-[#1e8a8a]" />
            <p className="text-sm font-semibold">No banner uploaded</p>
            <p className={`mt-1 text-xs ${muted}`}>
              Choose an image to preview.
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={openWidget}
        disabled={!ready || uploading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#187777] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {uploading ? (
          <LoaderCircle size={18} className="animate-spin" />
        ) : (
          <UploadCloud size={18} />
        )}
        {uploading
          ? "Uploading..."
          : image?.url
            ? "Replace Banner"
            : ready
              ? "Upload Banner"
              : "Loading Cloudinary..."}
      </button>

      {image?.url && (
        <button
          type="button"
          onClick={() => {
            saveImage("", "");
            toast.success("Banner removed.");
          }}
          className="w-full rounded-xl border border-red-500/30 py-2 text-sm font-semibold text-red-500 hover:bg-red-500/10"
        >
          Remove image
        </button>
      )}

      <p className={`text-center text-xs ${muted}`}>
        JPG, PNG, WebP · Maximum 5 MB
      </p>
    </div>
  );
}
