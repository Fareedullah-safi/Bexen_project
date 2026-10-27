"use client";

import AdminLanguageBall from "@/app/admin/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  FolderKanban,
  ImagePlus,
  Info,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const API = "/api/homepage/projects";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "fa", label: "Dari" },
  { code: "ps", label: "Pashto" },
];

const panelClass =
  "rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8";

const inputClass =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[var(--foreground)]";

const saveButtonClass =
  "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-6 text-sm font-semibold text-white transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:opacity-60";

const imageButtonClass =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:opacity-60";

const translation = () => ({
  en: "",
  fa: "",
  ps: "",
});

const normalizeTranslation = (value, fallback = "") => {
  if (typeof value === "string") {
    return {
      en: value || fallback,
      fa: "",
      ps: "",
    };
  }

  return {
    ...translation(),
    ...(value || {}),
    en: value?.en || fallback,
  };
};

const emptyHeader = () => ({
  badgeText: translation(),
  headingLine: translation(),
  highlightWord: translation(),
  description: translation(),
  buttonText: translation(),
  buttonLink: "/projects",
});

const newProject = () => ({
  clientKey: `draft-${Date.now()}-${Math.random()}`,
  tag: translation(),
  title: translation(),
  image: "",
  publicId: "",
});

const formatProject = (project) => ({
  ...newProject(),
  ...project,
  clientKey: project._id || `draft-${Date.now()}-${Math.random()}`,
  tag: normalizeTranslation(project.tag),
  title: normalizeTranslation(project.title),
  image: project.image || "",
  publicId: project.publicId || "",
});

const normalizeHeader = (savedHeader = {}) => ({
  ...emptyHeader(),
  ...savedHeader,
  badgeText: normalizeTranslation(savedHeader.badgeText, "PROUD PROJECTS"),
  headingLine: normalizeTranslation(savedHeader.headingLine),
  highlightWord: normalizeTranslation(savedHeader.highlightWord),
  description: normalizeTranslation(savedHeader.description),
  buttonText: normalizeTranslation(savedHeader.buttonText),
  buttonLink: savedHeader.buttonLink || "/projects",
});

const headerFields = [
  {
    name: "badgeText",
    label: "Badge Text",
    placeholder: "PROUD PROJECTS",
  },
  {
    name: "headingLine",
    label: "Heading Line",
    placeholder: "Breaking Boundaries,",
  },
  {
    name: "highlightWord",
    label: "Highlight Word",
    placeholder: "Dreams.",
  },
  {
    name: "description",
    label: "Description",
    placeholder: "We work closely with our clients...",
    textarea: true,
  },
  {
    name: "buttonText",
    label: "Button Text",
    placeholder: "More Projects",
  },
  {
    name: "buttonLink",
    label: "Button Link",
    placeholder: "/projects",
    shared: true,
  },
];

function LanguageSelector({ language, setLanguage, disabled }) {
  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5">
      {LANGUAGES.map((item) => (
        <button
          key={item.code}
          type="button"
          disabled={disabled}
          onClick={() => setLanguage(item.code)}
          aria-pressed={language === item.code}
          className={`min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            language === item.code
              ? "bg-[#1E8A8A] text-white"
              : "text-[var(--muted)] hover:bg-[var(--accent-soft)]"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function ProjectCard({
  project,
  index,
  total,
  language,
  busy,
  cloudinaryReady,
  onChange,
  onMove,
  onDelete,
  onUploadImage,
}) {
  const inputDirection = language === "en" ? "ltr" : "rtl";

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="min-w-0">
          <p className="truncate font-bold text-[var(--foreground)]">
            {index + 1}. {project.title[language] || "Untitled Project"}
          </p>

          <p className="text-xs text-[var(--muted)]">
            {LANGUAGES.find((item) => item.code === language)?.label} content
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            title="Move up"
            aria-label="Move project up"
            disabled={busy || index === 0}
            onClick={() => onMove(index, -1)}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:border-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={16} />
          </button>

          <button
            type="button"
            title="Move down"
            aria-label="Move project down"
            disabled={busy || index === total - 1}
            onClick={() => onMove(index, 1)}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:border-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            title="Delete project"
            aria-label="Delete project"
            disabled={busy}
            onClick={() => onDelete(project)}
            className="rounded-xl p-2 text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          {[
            {
              field: "tag",
              label: "Tag / Category",
              placeholder: "e.g. Business",
            },
            {
              field: "title",
              label: "Project Title",
              placeholder: "Project title in selected language",
              textarea: true,
            },
          ].map((item) => (
            <div key={item.field}>
              <label className={labelClass}>{item.label}</label>

              {item.textarea ? (
                <textarea
                  rows={3}
                  dir={inputDirection}
                  disabled={busy}
                  value={project[item.field][language] || ""}
                  onChange={(event) =>
                    onChange(project.clientKey, item.field, event.target.value)
                  }
                  placeholder={item.placeholder}
                  className={`${inputClass} resize-y`}
                />
              ) : (
                <input
                  dir={inputDirection}
                  disabled={busy}
                  value={project[item.field][language] || ""}
                  onChange={(event) =>
                    onChange(project.clientKey, item.field, event.target.value)
                  }
                  placeholder={item.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Project Cover Image</label>

          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {project.image ? (
              <img
                src={project.image}
                alt={project.title[language] || "Project cover"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center text-[var(--muted)]">
                <ImagePlus size={28} className="mx-auto text-[#1E8A8A]" />
                <p className="mt-2 text-xs">No image selected</p>
              </div>
            )}
          </div>

          <p className="mt-2 flex items-center gap-1.5 text-xs text-[var(--muted)]">
            <Info size={13} />
            Recommended 999 × 666. JPG, PNG or WebP, max 5 MB.
          </p>

          <button
            type="button"
            disabled={busy || !cloudinaryReady}
            onClick={() => onUploadImage(project)}
            className={`${imageButtonClass} mt-4`}
          >
            <Upload size={17} />

            {project.image ? "Change Image" : "Upload Image"}
          </button>

          {!cloudinaryReady && (
            <p className="mt-2 text-center text-xs text-[var(--muted)]">
              Loading image uploader...
            </p>
          )}

          {project.image && (
            <p className="mt-2 text-xs break-all text-[var(--muted)]">
              Image uploaded. Save all changes to persist it.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProjectsAdmin() {
  const [language, setLanguage] = useState("en");
  const [header, setHeader] = useState(emptyHeader);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  const busy = saving || deleting;
  const inputDirection = language === "en" ? "ltr" : "rtl";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  async function loadData() {
    setLoading(true);
    setLoadError(false);

    try {
      const { data } = await axios.get(API);
      const saved = data.data || {};

      setHeader(normalizeHeader(saved.header));
      setProjects((saved.projects || []).map(formatProject));
    } catch (error) {
      console.error("Load projects:", error);
      setLoadError(true);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.cloudinary) {
      setCloudinaryReady(true);
    }
  }, []);

  function updateHeader(field, value) {
    setHeader((previous) => ({
      ...previous,
      [field]:
        field === "buttonLink"
          ? value
          : {
              ...previous[field],
              [language]: value,
            },
    }));
  }

  function updateProject(key, field, value) {
    setProjects((previous) =>
      previous.map((project) =>
        project.clientKey === key
          ? {
              ...project,
              [field]: {
                ...project[field],
                [language]: value,
              },
            }
          : project,
      ),
    );
  }

  function moveProject(index, direction) {
    setProjects((previous) => {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= previous.length) {
        return previous;
      }

      const updated = [...previous];

      [updated[index], updated[nextIndex]] = [
        updated[nextIndex],
        updated[index],
      ];

      return updated;
    });
  }

  function uploadProjectImage(project) {
    if (busy) return;

    if (!cloudName || !uploadPreset) {
      toast.error(
        "Cloudinary configuration is missing. Check your public environment variables.",
      );
      return;
    }

    if (!window.cloudinary) {
      toast.error("Image uploader is not ready. Please try again.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: "homepage/projects",
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000,
        sources: ["local", "url"],
        showAdvancedOptions: false,
        cropping: false,
        styles: {
          palette: {
            window: "#FFFFFF",
            windowBorder: "#1E8A8A",
            tabIcon: "#1E8A8A",
            menuIcons: "#1E8A8A",
            textDark: "#101828",
            textLight: "#FFFFFF",
            link: "#1E8A8A",
            action: "#1E8A8A",
            inactiveTabIcon: "#667085",
            error: "#D92D20",
            inProgress: "#1E8A8A",
            complete: "#12B76A",
            sourceBg: "#F7F9FC",
          },
          fonts: {
            default: null,
            "'Mona Sans', sans-serif": {
              url: null,
              active: true,
            },
          },
        },
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload:", error);
          toast.error("Image upload failed. Please try again.");
          return;
        }

        if (result?.event !== "success") return;

        const imageUrl = result.info?.secure_url;
        const publicId = result.info?.public_id;

        if (!imageUrl || !publicId || !imageUrl.startsWith("https://")) {
          toast.error("Cloudinary did not return a valid image.");
          return;
        }

        setProjects((previous) =>
          previous.map((item) =>
            item.clientKey === project.clientKey
              ? {
                  ...item,
                  image: imageUrl,
                  publicId,
                }
              : item,
          ),
        );

        toast.success(
          "Image uploaded. Click Save All Changes to save the project.",
        );
      },
    );

    widget.open();
  }

  function validateAllLanguages() {
    // Validate all translated header fields in all languages.
    for (const lang of LANGUAGES) {
      for (const field of headerFields) {
        if (field.shared) continue;

        if (!header[field.name]?.[lang.code]?.trim()) {
          setLanguage(lang.code);

          toast.error(`${field.label} is required in ${lang.label}.`);

          return false;
        }
      }
    }

    // Validate all project translations in all languages.
    if (!projects.length) {
      toast.error("Add at least one project.");
      return false;
    }

    for (const lang of LANGUAGES) {
      for (let index = 0; index < projects.length; index += 1) {
        const project = projects[index];

        if (!project.tag?.[lang.code]?.trim()) {
          setLanguage(lang.code);

          toast.error(
            `Project ${index + 1}: Tag / Category is required in ${lang.label}.`,
          );

          return false;
        }

        if (!project.title?.[lang.code]?.trim()) {
          setLanguage(lang.code);

          toast.error(
            `Project ${index + 1}: Project Title is required in ${lang.label}.`,
          );

          return false;
        }
      }
    }

    // Validate the shared button link.
    if (
      typeof header.buttonLink !== "string" ||
      !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(header.buttonLink.trim())
    ) {
      toast.error("Enter a valid button path, such as /projects.");
      return false;
    }

    // Validate the uploaded image and its Cloudinary public ID.
    for (let index = 0; index < projects.length; index += 1) {
      const project = projects[index];

      if (!project.image?.startsWith("https://") || !project.publicId?.trim()) {
        toast.error(`Upload a valid cover image for project ${index + 1}.`);

        return false;
      }
    }

    return true;
  }

  async function saveAll() {
    if (busy) return;

    if (!validateAllLanguages()) return;

    setSaving(true);

    try {
      const { data } = await axios.post(API, {
        header,
        projects: projects.map((project, index) => ({
          ...(project._id ? { _id: project._id } : {}),
          tag: project.tag,
          title: project.title,
          image: project.image,
          publicId: project.publicId,
          order: index,
        })),
      });

      if (!data.success) {
        throw new Error(data.message || "Save failed.");
      }

      const saved = data.data || {};

      setHeader(normalizeHeader(saved.header || header));
      setProjects((saved.projects || []).map(formatProject));

      toast.success("All changes saved.");
    } catch (error) {
      console.error("Save projects:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save projects.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    if (busy) return;

    if (!project._id) {
      setProjects((previous) =>
        previous.filter((item) => item.clientKey !== project.clientKey),
      );

      toast.success("Unsaved project removed.");
      return;
    }

    if (projects.length <= 1) {
      toast.error("Keep at least one project.");
      return;
    }

    setDeleting(true);

    try {
      await axios.delete(API, {
        params: { id: project._id },
      });

      setProjects((previous) =>
        previous.filter((item) => item.clientKey !== project.clientKey),
      );

      toast.success("Project deleted.");
    } catch (error) {
      console.error("Delete project:", error);

      toast.error(error.response?.data?.message || "Failed to delete project.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-3">
        <Spinner />
        <p className="text-sm text-[var(--muted)]">Loading Projects...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--muted)]">Could not load projects.</p>

        <button
          type="button"
          onClick={loadData}
          className="mt-4 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#167777]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => {
          setCloudinaryReady(false);
          toast.error("Could not load the Cloudinary image uploader.");
        }}
      />

      <div className="w-full">
        {/* Heading followed by all three language buttons and the language ball. */}
        <div className="mb-10 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
              <FolderKanban size={27} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                Proud Projects
              </h1>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Manage your homepage project showcase.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelector
              language={language}
              setLanguage={setLanguage}
              disabled={busy}
            />

            <AdminLanguageBall
              language={language}
              onLanguageChange={setLanguage}
            />
          </div>
        </div>

        <div className="space-y-8">
          {/* Section Header */}
          <section className={panelClass}>
            <h2 className="mb-6 text-lg font-bold text-[var(--foreground)]">
              01 · Section Header Content
            </h2>

            <div className="grid gap-5 md:grid-cols-2">
              {headerFields.map((field) => (
                <div
                  key={field.name}
                  className={field.textarea ? "md:col-span-2" : ""}
                >
                  <label className={labelClass}>
                    {field.label}

                    {field.shared && (
                      <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                        Shared across languages
                      </span>
                    )}
                  </label>

                  {field.textarea ? (
                    <textarea
                      rows={3}
                      dir={inputDirection}
                      value={header[field.name]?.[language] || ""}
                      onChange={(event) =>
                        updateHeader(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      className={`${inputClass} resize-y`}
                    />
                  ) : (
                    <input
                      dir={field.shared ? "ltr" : inputDirection}
                      value={
                        field.shared
                          ? header[field.name] || ""
                          : header[field.name]?.[language] || ""
                      }
                      onChange={(event) =>
                        updateHeader(field.name, event.target.value)
                      }
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Live preview */}
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <span className="rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-bold">
                {header.badgeText?.[language] || "PROUD PROJECTS"}
              </span>

              <p
                dir={inputDirection}
                className="mt-3 text-2xl text-[var(--foreground)]"
              >
                {header.headingLine?.[language] || "Breaking Boundaries,"}

                <br />

                <span className="text-[#1E8A8A]">
                  {header.highlightWord?.[language] || "Dreams."}
                </span>
              </p>

              <p
                dir={inputDirection}
                className="mt-2 text-sm text-[var(--muted)]"
              >
                {header.description?.[language] ||
                  "Section description preview"}
              </p>
            </div>
          </section>

          {/* Projects */}
          <section className={panelClass}>
            <h2 className="mb-6 text-lg font-bold text-[var(--foreground)]">
              02 · Large Projects
            </h2>

            {!projects.length && (
              <p className="rounded-2xl bg-[var(--background)] p-6 text-center text-sm text-[var(--muted)]">
                No projects yet. Add one below.
              </p>
            )}

            <div className="space-y-6">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.clientKey}
                  project={project}
                  index={index}
                  total={projects.length}
                  language={language}
                  busy={busy}
                  cloudinaryReady={cloudinaryReady}
                  onChange={updateProject}
                  onMove={moveProject}
                  onDelete={deleteProject}
                  onUploadImage={uploadProjectImage}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={() =>
                setProjects((previous) => [...previous, newProject()])
              }
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              Add New Large Project
            </button>

            {/* Save bar */}
            <footer className="sticky bottom-4 z-10 mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Ready to save your changes?
                </p>

                <p className="mt-1 text-xs text-[var(--muted)]">
                  All three languages, the section header, project order, and
                  uploaded images will be saved together.
                </p>
              </div>

              <button
                type="button"
                onClick={saveAll}
                disabled={busy}
                className={saveButtonClass}
              >
                {saving ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}

                {saving ? "Saving All..." : "Save All Changes"}
              </button>
            </footer>
          </section>
        </div>
      </div>
    </>
  );
}
