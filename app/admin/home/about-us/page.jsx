"use client";

import { useEffect, useState } from "react";
import {
  ImagePlus,
  Link as LinkIcon,
  Trash2,
  Save,
  LoaderCircle,
  RotateCcw,
  CheckCircle2,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";

const initialData = {
  experienceNumber: "13+",
  experienceLabel: "Years of Experience",
  experienceText: "Decades of Experience, Endless Innovation",
  sectionLabel: "Get to Know Us",
  title: "",
  description: "",
  buttonText: "Learn More",
  buttonLink: "/about",
  mainImage: "",
  clientImage: "",
  clientName: "",
  clientRole: "",
};

const getImageUrl = (image) =>
  typeof image === "string" ? image : image?.url || "";

const requiredFields = [
  ["experienceNumber", "Experience Number"],
  ["experienceLabel", "Experience Label"],
  ["experienceText", "Experience Text"],
  ["sectionLabel", "Section Label"],
  ["title", "Title"],
  ["description", "Description"],
  ["buttonText", "Button Text"],
  ["buttonLink", "Button Link"],
  ["clientName", "Client Name"],
  ["clientRole", "Client Role"],
];

export default function AboutUs() {
  const [formData, setFormData] = useState(initialData);
  const [imageIds, setImageIds] = useState({
    mainImage: "",
    clientImage: "",
  });
  const [previews, setPreviews] = useState({
    mainImage: "",
    clientImage: "",
  });
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedData, setHasSavedData] = useState(false);

  useEffect(() => {
    let active = true;

    const getAboutUsData = async () => {
      try {
        const response = await fetch("/api/homepage/about-us", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load About Us data");
        }

        if (!active) return;

        if (result.data) {
          const data = result.data;

          setFormData({
            ...initialData,
            ...data,
            mainImage: getImageUrl(data.mainImage),
            clientImage: getImageUrl(data.clientImage),
          });

          setImageIds({
            mainImage: data.mainImage?.publicId || "",
            clientImage: data.clientImage?.publicId || "",
          });

          setPreviews({
            mainImage: getImageUrl(data.mainImage),
            clientImage: getImageUrl(data.clientImage),
          });

          setHasSavedData(true);
        }
      } catch (error) {
        console.error("About Us GET Error:", error);
        if (active) toast.error("Failed to load saved About Us data");
      } finally {
        if (active) setIsFetching(false);
      }
    };

    getAboutUsData();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e, field) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPG, PNG, and WEBP images are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: URL.createObjectURL(file),
    }));

    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const handleImageUrl = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: value,
    }));

    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const removeImage = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: "",
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: "",
    }));

    setImageIds((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const validateForm = () => {
    for (const [field, label] of requiredFields) {
      if (!String(formData[field] ?? "").trim()) {
        toast.error(`${label} is required`);
        return false;
      }
    }

    for (const field of ["mainImage", "clientImage"]) {
      const image = formData[field];

      if (!image) {
        toast.error(
          `${field === "mainImage" ? "Main Image" : "Client Image"} is required`,
        );
        return false;
      }

      if (typeof image === "string") {
        try {
          const url = new URL(image);

          if (!["http:", "https:"].includes(url.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          toast.error(
            `Enter a valid URL or upload the ${field === "mainImage" ? "Main Image" : "Client Image"} from your PC`,
          );
          return false;
        }
      }
    }

    const link = formData.buttonLink.trim();

    if (link.startsWith("//")) {
      toast.error("Button Link must be an internal path or HTTP/HTTPS URL");
      return false;
    }

    if (!link.startsWith("/")) {
      try {
        const url = new URL(link);

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid protocol");
        }
      } catch {
        toast.error("Enter a valid button link, such as /about");
        return false;
      }
    }

    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const images = {
        mainImage: {
          url: typeof formData.mainImage === "string" ? formData.mainImage : "",
          publicId: imageIds.mainImage,
        },
        clientImage: {
          url:
            typeof formData.clientImage === "string"
              ? formData.clientImage
              : "",
          publicId: imageIds.clientImage,
        },
      };

      const uploadData = new FormData();
      let hasFiles = false;

      if (formData.mainImage instanceof File) {
        uploadData.append("mainImage", formData.mainImage);
        hasFiles = true;
      }

      if (formData.clientImage instanceof File) {
        uploadData.append("clientImage", formData.clientImage);
        hasFiles = true;
      }

      if (hasFiles) {
        const uploadResponse = await fetch(
          "/api/homepage/about-us/upload-images",
          {
            method: "POST",
            body: uploadData,
          },
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || "Image upload failed");
        }

        if (formData.mainImage instanceof File) {
          images.mainImage = uploadResult.images?.mainImage;
        }

        if (formData.clientImage instanceof File) {
          images.clientImage = uploadResult.images?.clientImage;
        }

        if (formData.mainImage instanceof File && !images.mainImage?.url) {
          throw new Error("Main Image upload did not return a URL");
        }

        if (formData.clientImage instanceof File && !images.clientImage?.url) {
          throw new Error("Client Image upload did not return a URL");
        }
      }

      const payload = {
        experienceNumber: formData.experienceNumber.trim(),
        experienceLabel: formData.experienceLabel.trim(),
        experienceText: formData.experienceText.trim(),
        sectionLabel: formData.sectionLabel.trim(),
        title: formData.title.trim(),
        description: formData.description.trim(),
        buttonText: formData.buttonText.trim(),
        buttonLink: formData.buttonLink.trim(),
        clientName: formData.clientName.trim(),
        clientRole: formData.clientRole.trim(),
        mainImage: images.mainImage,
        clientImage: images.clientImage,
      };

      const response = await fetch("/api/homepage/about-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log(result);

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save About Us data");
      }

      const savedData = result.data || payload;

      setFormData({
        ...initialData,
        ...savedData,
        mainImage: getImageUrl(savedData.mainImage),
        clientImage: getImageUrl(savedData.clientImage),
      });

      setImageIds({
        mainImage: savedData.mainImage?.publicId || "",
        clientImage: savedData.clientImage?.publicId || "",
      });

      setPreviews({
        mainImage: getImageUrl(savedData.mainImage),
        clientImage: getImageUrl(savedData.clientImage),
      });

      setHasSavedData(true);
      toast.success("About Us saved successfully!");
    } catch (error) {
      console.error("About Us Save Error:", error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0C1E21] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-[#1E8A8A] focus:ring-2 focus:ring-[#1E8A8A]/20";

  const labelClass = "mb-2 block text-sm font-medium text-gray-300";

  const renderInput = (
    label,
    name,
    placeholder,
    required = true,
    type = "text",
  ) => (
    <div key={name}>
      <label htmlFor={name} className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={formData[name] ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        className={inputClass}
        required={required}
      />
    </div>
  );

  const renderImageField = (label, field) => (
    <div key={field} className="min-w-0">
      <label className={labelClass}>
        {label} <span className="text-red-400">*</span>
      </label>

      {previews[field] ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0C1E21] p-3">
          <img
            src={previews[field]}
            alt={label}
            className="h-52 w-full rounded-lg object-contain"
          />

          <button
            type="button"
            onClick={() => removeImage(field)}
            className="absolute top-5 right-5 rounded-lg border border-red-400/20 bg-red-500/90 p-2 text-white transition hover:bg-red-600"
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={17} />
          </button>

          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 size={15} />
            Image selected
          </div>
        </div>
      ) : (
        <label className="flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#0C1E21] px-4 text-center transition hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5">
          <span className="mb-3 rounded-xl bg-[#1E8A8A]/15 p-4 text-[#39b5b2]">
            <ImagePlus size={27} />
          </span>

          <span className="text-sm font-medium text-gray-200">
            Upload {label}
          </span>

          <span className="mt-2 text-xs text-gray-500">
            JPG, PNG or WEBP · Maximum 5 MB
          </span>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleImageChange(e, field)}
          />
        </label>
      )}

      <div className="relative mt-3">
        <LinkIcon
          size={16}
          className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500"
        />

        <input
          type="url"
          value={typeof formData[field] === "string" ? formData[field] : ""}
          onChange={(e) => handleImageUrl(field, e.target.value)}
          placeholder="Or paste an image URL"
          className={`${inputClass} pl-10`}
        />
      </div>
    </div>
  );

  if (isFetching) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[#0C1E21]">
        <LoaderCircle size={34} className="animate-spin text-[#1E8A8A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C1E21] p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#36aaa7] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#1E8A8A]" />
              Homepage Management
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              About Us Section
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
              Manage the content, images and client information displayed on
              your website.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-full border border-white/10 bg-[#132629] px-4 py-2 text-xs text-gray-300">
            {hasSavedData ? (
              <>
                <CheckCircle2 size={15} className="text-emerald-400" />
                Saved data loaded
              </>
            ) : (
              <>
                <FileImage size={15} className="text-gray-400" />
                New section
              </>
            )}
          </div>
        </header>

        <form onSubmit={handleSave} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#132629] shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#1E8A8A]/15 p-3 text-[#36aaa7]">
                  <FileImage size={21} />
                </span>

                <div>
                  <h2 className="font-semibold text-white">Section Content</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    All fields are required.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {renderInput("Experience Number", "experienceNumber", "13+")}
              {renderInput(
                "Experience Label",
                "experienceLabel",
                "Years of Experience",
              )}
              {renderInput(
                "Experience Text",
                "experienceText",
                "Decades of Experience, Endless Innovation",
              )}
              {renderInput("Section Label", "sectionLabel", "Get to Know Us")}
              {renderInput("Title", "title", "Enter section title")}
              {renderInput("Button Text", "buttonText", "Learn More")}
              {renderInput("Button Link", "buttonLink", "/about")}

              <div className="sm:col-span-2">
                <label htmlFor="description" className={labelClass}>
                  Description <span className="text-red-400">*</span>
                </label>

                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write your About Us description..."
                  rows={5}
                  required
                  className={`${inputClass} resize-y leading-6`}
                />

                <p className="mt-2 text-right text-xs text-gray-500">
                  {formData.description.length} characters
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#132629] shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-[#1E8A8A]/15 p-3 text-[#36aaa7]">
                  <ImagePlus size={21} />
                </span>

                <div>
                  <h2 className="font-semibold text-white">Section Images</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Both images are required. Upload a file or provide a URL.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-7">
              {renderImageField("Main Image", "mainImage")}
              {renderImageField("Client Image", "clientImage")}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#132629] shadow-xl shadow-black/10">
            <div className="border-b border-white/10 px-5 py-5 sm:px-7">
              <div>
                <h2 className="font-semibold text-white">Client Information</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the client details displayed in your section.
                </p>
              </div>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
              {renderInput("Client Name", "clientName", "Enter client name")}
              {renderInput("Client Role", "clientRole", "Enter client role")}
            </div>
          </section>

          <footer className="sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-[#132629]/95 p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-6">
            <p className="text-xs text-gray-400">
              <span className="text-red-400">*</span> All fields are required.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => window.location.reload()}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Reload Saved Data
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#1E8A8A]/10 transition hover:bg-[#249b98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}
