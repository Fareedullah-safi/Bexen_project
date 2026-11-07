"use client";

import axios from "axios";
import {
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API = "/api/aboutpage/banner";
const SCRIPT = "script[data-cloudinary-widget]";

// --- Theme helper for Cloudinary widget (dark / light) ---
function cloudinaryStyles(theme) {
  const palettes = {
    dark: {
      window: "#0b1117",
      windowBorder: "#1E8A8A",
      tabIcon: "#35B5B5",
      menuIcons: "#9CA3AF",
      textDark: "#FFFFFF",
      textLight: "#FFFFFF",
      link: "#35B5B5",
      action: "#1E8A8A",
      inactiveTabIcon: "#6B7280",
      error: "#EF4444",
      inProgress: "#35B5B5",
      complete: "#10B981",
      sourceBg: "#111a23",
    },
    light: {
      window: "#FFFFFF",
      windowBorder: "#1E8A8A",
      tabIcon: "#1E8A8A",
      menuIcons: "#4B5563",
      textDark: "#000000",
      textLight: "#FFFFFF",
      link: "#1E8A8A",
      action: "#1E8A8A",
      inactiveTabIcon: "#9CA3AF",
      error: "#EF4444",
      inProgress: "#1E8A8A",
      complete: "#10B981",
      sourceBg: "#F9FAFB",
    },
  };
  return { palette: palettes[theme] || palettes.light };
}

// --- Permission check helper ---
async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    return res.ok && data?.success === true;
  } catch {
    return false;
  }
}

export default function AboutUsBannerPage() {
  const [dark, setDark] = useState(true);
  const [theme, setTheme] = useState("light");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [image, setImage] = useState(null);

  const widget = useRef(null);
  const opening = useRef(false);

  const card = `rounded-2xl border ${
    dark ? "border-[#263442] bg-[#111a23]" : "border-[#e4e7ec] bg-white"
  }`;

  const muted = dark ? "text-[#98a2b3]" : "text-[#667085]";

  // Detect admin theme changes (updates both dark and theme)
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setDark(isDark);
      setTheme(isDark ? "dark" : "light");
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Load saved banner and Cloudinary widget
  useEffect(() => {
    let active = true;

    axios
      .get(API)
      .then(({ data }) => {
        if (!data.success) {
          throw new Error(data.message || "Failed to load banner.");
        }

        if (active) {
          setImage(data.data || null);
        }
      })
      .catch(() => {
        if (active) {
          toast.error("Could not load the saved banner.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    let script = document.querySelector(SCRIPT);

    const handleLoad = () => {
      if (active) {
        setReady(!!window.cloudinary?.createUploadWidget);
      }
    };

    const handleError = () => {
      if (active) {
        toast.error("Could not load Cloudinary.");
      }
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

      if (!script.isConnected) {
        document.head.appendChild(script);
      }
    }

    return () => {
      active = false;

      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);

      widget.current?.destroy?.();
      widget.current = null;
    };
  }, []);

  // Open Cloudinary upload widget
  async function openWidget() {
    if (opening.current || uploading || loading || checking) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || !window.cloudinary?.createUploadWidget) {
      toast.error("Check your Cloudinary configuration.");
      return;
    }

    // --- Permission check before opening widget ---
    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);
    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    opening.current = true;
    setUploading(true);

    try {
      widget.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          // sources: ["local"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/about-us",
          cropping: false,
          styles: cloudinaryStyles(theme),
        },
        async (error, result) => {
          if (error) {
            toast.error(error.message || "Image upload failed.");
          }

          if (result?.event === "success") {
            const { secure_url: url, public_id: publicId } = result.info || {};

            if (!url || !publicId) {
              toast.error("Invalid image returned by Cloudinary.");
              return;
            }

            try {
              const { data } = await axios.post(API, {
                url,
                publicId,
              });

              if (!data.success) {
                throw new Error(data.message || "Save failed.");
              }

              setImage(data.data);
              toast.success("Banner saved successfully.");
            } catch (err) {
              toast.error(
                err.response?.data?.message ||
                  err.message ||
                  "Could not save banner.",
              );
            }
          }

          if (["close", "abort"].includes(result?.event)) {
            setUploading(false);
            opening.current = false;
            widget.current = null;
          }
        },
      );

      widget.current.open();
    } catch (error) {
      console.error("Cloudinary widget error:", error);

      toast.error("Could not open Cloudinary.");

      setUploading(false);
      opening.current = false;
      widget.current = null;
    }
  }

  return (
    <main
      className={`min-h-screen w-full ${
        dark ? "bg-[#0b1117] text-[#f2f4f7]" : "bg-[#f7f9fc] text-[#101828]"
      }`}
    >
      {/* Full-width container: no outer margin or padding */}
      <div className="w-full">
        {/* Page heading */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold sm:text-3xl">About Us Banner</h1>

          <p className={`mt-2 text-sm ${muted}`}>
            Upload and preview your banner image.
          </p>
        </header>

        {/* Banner card */}
        <section className={`${card} w-full overflow-hidden`}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold">Banner Preview</h2>

              <p className={`mt-1 text-xs ${muted}`}>
                {loading
                  ? "Loading banner..."
                  : image?.url
                    ? "Current banner"
                    : "No banner uploaded"}
              </p>
            </div>

            {image?.url && !loading && (
              <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-500">
                <CheckCircle2 size={15} />
                Saved
              </span>
            )}
          </div>

          {/* Image preview */}
          <div className="p-4 sm:p-6">
            <div
              className={`flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border sm:min-h-64 ${
                dark
                  ? "border-[#263442] bg-[#16212c]"
                  : "border-[#e4e7ec] bg-[#f7f9fc]"
              }`}
            >
              {loading ? (
                <LoaderCircle
                  size={30}
                  className="animate-spin text-[#1e8a8a]"
                />
              ) : image?.url ? (
                <img
                  src={image.url}
                  alt="About Us banner"
                  className="block h-auto max-h-[70vh] w-full object-contain"
                />
              ) : (
                <div className="px-5 py-12 text-center">
                  <ImagePlus
                    size={34}
                    className="mx-auto mb-3 text-[#1e8a8a]"
                  />

                  <p className="text-sm font-semibold">No banner uploaded</p>

                  <p className={`mt-1 text-xs ${muted}`}>
                    Choose an image to preview it here.
                  </p>
                </div>
              )}
            </div>

            {/* Upload button */}
            <button
              type="button"
              onClick={openWidget}
              disabled={!ready || uploading || loading || checking}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#187777] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {checking || uploading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <UploadCloud size={18} />
              )}

              {checking
                ? "Checking..."
                : uploading
                  ? "Uploading..."
                  : image?.url
                    ? "Replace Banner"
                    : ready
                      ? "Upload Banner"
                      : "Loading Cloudinary..."}
            </button>

            <p className={`mt-3 text-center text-xs ${muted}`}>
              JPG, PNG, WebP · Maximum 5 MB
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
