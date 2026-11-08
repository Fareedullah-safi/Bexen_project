// src/Lib/PageBuilder/blocks/Banner/AdminForm.jsx
"use client";

import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const SCRIPT = "script[data-cloudinary-widget]";

const emptyImage = () => ({ url: "", publicId: "" });

// ==========================================
// 1. STATIC VALIDATION (Parent reads .isValid)
// ==========================================
export function validateBanner(data = {}) {
  const url = data?.image?.url || data?.url || "";
  const hasImage = Boolean(String(url).trim());

  return {
    isValid: hasImage,
    missingImage: !hasImage,
  };
}

// ==========================================
// 2. MAIN COMPONENT
// ==========================================
export default function BannerAdminForm({
  data = {},
  lang = "en", // kept for API parity with other blocks (banner is image-only)
  onChange = () => {},
  showErrors = false,
}) {
  const [dark, setDark] = useState(true);
  const [ready, setReady] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const widgetRef = useRef(null);
  const openingRef = useRef(false);

  // Fresh data for late Cloudinary callbacks
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // StrictMode-safe mount flag
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Normalize shape: always { image: { url, publicId } }
  const currentData = useMemo(() => {
    const raw = data?.image ?? data;
    const url = raw?.url || "";
    const publicId = raw?.publicId || raw?.public_id || "";
    return {
      image: url || publicId ? { url, publicId } : emptyImage(),
    };
  }, [data]);

  const image = currentData.image;
  const hasImage = Boolean(image.url);
  const valResult = validateBanner(currentData);
  const hasAnyError = showErrors && !valResult.isValid;
  const imageError = showErrors && valResult.missingImage;

  const emit = (next) => {
    onChange(next);
  };

  /* ---------- Dark mode observer (Cloudinary palette) ---------- */
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

  /* ---------- Cloudinary script loader ---------- */
  useEffect(() => {
    isMountedRef.current = true;
    let script = document.querySelector(SCRIPT);

    const handleLoad = () => {
      if (isMountedRef.current) {
        setReady(!!window.cloudinary?.createUploadWidget);
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
        document.head.appendChild(script);
      }
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", () => {
        if (isMountedRef.current) toast.error("Could not load Cloudinary.");
      });
    }

    return () => {
      isMountedRef.current = false;
      script?.removeEventListener("load", handleLoad);
      try {
        widgetRef.current?.close?.();
        widgetRef.current?.destroy?.();
      } catch {}
      widgetRef.current = null;
      openingRef.current = false;
    };
  }, []);

  /* ---------- Delete helper ---------- */
  const deleteRemote = (publicId) => {
    if (!publicId) return;
    fetch("/api/admin/cloudinary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    }).catch(() => {});
  };

  /* ---------- Upload widget ---------- */
  const openWidget = () => {
    if (openingRef.current || uploading || deleting) return;

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset || !window.cloudinary?.createUploadWidget) {
      toast.error("Check your Cloudinary configuration.");
      return;
    }

    openingRef.current = true;
    setUploading(true);

    try {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url"],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 5_000_000,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
          resourceType: "image",
          folder: "bexon/banners",
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
          if (error) {
            toast.error(error.message || "Image upload failed.");
            if (isMountedRef.current) {
              setUploading(false);
              openingRef.current = false;
            }
            return;
          }

          if (result?.event === "success") {
            const url = result.info?.secure_url;
            const publicId = result.info?.public_id;

            if (!url || !publicId) {
              toast.error("Invalid image returned by Cloudinary.");
              return;
            }

            // Replace against FRESH data — never stale closure
            const fresh = dataRef.current || {};
            const prevPublicId =
              fresh?.image?.publicId || fresh?.publicId || "";

            // Delete previous asset after successful replace
            if (prevPublicId && prevPublicId !== publicId) {
              deleteRemote(prevPublicId);
            }

            emit({
              ...fresh,
              image: { url, publicId },
            });

            toast.success("Banner image uploaded.");
          }

          if (["close", "abort", "queues-end"].includes(result?.event)) {
            if (isMountedRef.current) {
              setUploading(false);
              openingRef.current = false;
            }
            widgetRef.current = null;
          }
        },
      );

      widgetRef.current.open();
    } catch (err) {
      console.error("Cloudinary widget error:", err);
      toast.error("Could not open Cloudinary.");
      if (isMountedRef.current) {
        setUploading(false);
        openingRef.current = false;
      }
      widgetRef.current = null;
    }
  };

  /* ---------- Remove banner ---------- */
  const removeBanner = () => {
    if (uploading || deleting) return;
    if (!confirm("Remove this banner image?")) return;

    setDeleting(true);
    const fresh = dataRef.current || {};
    const publicId = fresh?.image?.publicId || fresh?.publicId || "";

    deleteRemote(publicId);

    emit({
      ...fresh,
      image: emptyImage(),
    });

    if (isMountedRef.current) setDeleting(false);
    toast.success("Banner removed.");
  };

  return (
    <div className="space-y-6">
      {/* ==================== STATUS BANNER ==================== */}
      <div
        className={`rounded-2xl border p-4 transition-colors ${
          hasAnyError
            ? "border-red-500/40 bg-red-500/10"
            : "border-[var(--border)] bg-[var(--surface)]"
        }`}
      >
        <h3 className="mb-2 text-xs font-bold tracking-wider text-[var(--text-muted)] uppercase">
          Completion Status
        </h3>
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${
              hasImage
                ? "bg-emerald-500/10 text-emerald-600"
                : showErrors
                  ? "bg-red-500/20 text-red-500"
                  : "bg-[var(--border)] text-[var(--text-muted)]"
            }`}
          >
            {hasImage ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            Banner Image
          </span>
        </div>
      </div>

      {/* ==================== PREVIEW CARD ==================== */}
      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Banner Preview
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {hasImage ? "Current banner" : "No banner uploaded"}
            </p>
          </div>

          {hasImage && (
            <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-emerald-500">
              <CheckCircle2 size={15} />
              Ready
            </span>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div
            className={`flex min-h-48 w-full items-center justify-center overflow-hidden rounded-xl border sm:min-h-64 ${
              imageError
                ? "border-red-500/50 bg-red-500/5"
                : "border-[var(--border)] bg-[var(--surface-soft)]"
            }`}
          >
            {hasImage ? (
              <img
                src={image.url}
                alt="Banner"
                className="block h-auto max-h-[70vh] w-full object-contain"
              />
            ) : (
              <div className="px-5 py-12 text-center">
                <ImagePlus
                  size={34}
                  className={`mx-auto mb-3 ${
                    imageError ? "text-red-500" : "text-[var(--accent)]"
                  }`}
                />
                <p
                  className={`text-sm font-semibold ${
                    imageError ? "text-red-500" : "text-[var(--foreground)]"
                  }`}
                >
                  {imageError
                    ? "Banner image is required."
                    : "No banner uploaded"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  JPG, PNG, WebP · Max 5 MB
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={openWidget}
              disabled={!ready || uploading || deleting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#187777] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <UploadCloud size={18} />
              )}
              {uploading
                ? "Uploading..."
                : hasImage
                  ? "Replace Banner"
                  : ready
                    ? "Upload Banner"
                    : "Loading Cloudinary..."}
            </button>

            {hasImage && (
              <button
                type="button"
                onClick={removeBanner}
                disabled={uploading || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Trash2 size={18} />
                )}
                Remove
              </button>
            )}
          </div>

          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            JPG, PNG, WebP · Maximum 5 MB
          </p>
        </div>
      </section>
    </div>
  );
}

// Attach static validator for parent FlatEditorPage
BannerAdminForm.validate = validateBanner;
