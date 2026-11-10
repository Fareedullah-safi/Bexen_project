"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import AdminStickyFooter from "@/app/Components/Admin/AdminStickyFooter";
import Spinner from "@/app/Components/Admin/Spinner";
import RichTextEditor from "@/Lib/PageBuilder/blocks/shared/RichTextEditor";
import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  FolderKanban,
  ImagePlus,
  Info,
  LoaderCircle,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/* ──────────────────────────────────────────────
   Helper to strip HTML tags for validation
   ────────────────────────────────────────────── */
function stripHtml(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>?/gm, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/* ──────────────────────────────────────────────
   Cloudinary permission check
   ────────────────────────────────────────────── */
async function verifyUploadPermission() {
  try {
    const res = await fetch("/api/admin/cloudinary/verify", {
      cache: "no-store",
    });
    const data = await res.json();
    return res.ok && data.success === true;
  } catch (error) {
    return false;
  }
}

/* ──────────────────────────────────────────────
   Unified Cloudinary widget theme
   ────────────────────────────────────────────── */
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

  if (theme === "dark") {
    return { palette: palettes.dark };
  }

  return { palette: palettes.light };
}

/* ────────────────────────────────────────────── */

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

const imageButtonClass =
  "flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:opacity-60";

function translation() {
  return {
    en: "",
    fa: "",
    ps: "",
  };
}

function normalizeTranslation(value, fallback) {
  if (!fallback) {
    fallback = "";
  }

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
    en: value && value.en ? value.en : fallback,
  };
}

function emptyHeader() {
  return {
    badgeText: translation(),
    title: translation(),
    description: translation(),
    buttonText: translation(),
    buttonLink: "/projects",
  };
}

function newProject() {
  return {
    clientKey: "draft-" + Date.now() + "-" + Math.random(),
    tag: translation(),
    title: translation(),
    image: "",
    publicId: "",
  };
}

function formatProject(project) {
  return {
    ...newProject(),
    ...project,
    clientKey: project._id || "draft-" + Date.now() + "-" + Math.random(),
    tag: normalizeTranslation(project.tag),
    title: normalizeTranslation(project.title),
    image: project.image || "",
    publicId: project.publicId || "",
  };
}

function normalizeHeader(savedHeader) {
  if (!savedHeader) {
    savedHeader = {};
  }

  return {
    ...emptyHeader(),
    ...savedHeader,
    badgeText: normalizeTranslation(savedHeader.badgeText, "PROUD PROJECTS"),
    title: normalizeTranslation(savedHeader.title || savedHeader.headingLine),
    description: normalizeTranslation(savedHeader.description),
    buttonText: normalizeTranslation(savedHeader.buttonText),
    buttonLink: savedHeader.buttonLink || "/projects",
  };
}

const headerFields = [
  {
    name: "badgeText",
    label: "Badge Text",
    placeholder: "PROUD PROJECTS",
    rich: true,
  },
  {
    name: "title",
    label: "Section Title",
    placeholder: "Breaking Boundaries, Dreams.",
    rich: true,
  },
  {
    name: "description",
    label: "Description",
    placeholder: "We work closely with our clients...",
    rich: true,
  },
  {
    name: "buttonText",
    label: "Button Text",
    placeholder: "More Projects",
    rich: false,
  },
  {
    name: "buttonLink",
    label: "Button Link",
    placeholder: "/projects",
    shared: true,
    rich: false,
  },
];

function LanguageSelector({ language, setLanguage, disabled }) {
  return (
    <div className="inline-flex flex-wrap gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-1.5">
      {LANGUAGES.map(function (item) {
        return (
          <button
            key={item.code}
            type="button"
            disabled={disabled}
            onClick={function () {
              setLanguage(item.code);
            }}
            aria-pressed={language === item.code}
            className={
              "min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 " +
              (language === item.code
                ? "bg-[#1E8A8A] text-white"
                : "text-[var(--muted)] hover:bg-[var(--accent-soft)]")
            }
          >
            {item.label}
          </button>
        );
      })}
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
  checking,
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
            {index + 1}.{" "}
            {stripHtml(project.title[language]) || "Untitled Project"}
          </p>

          <p className="text-xs text-[var(--muted)]">
            {
              LANGUAGES.find(function (item) {
                return item.code === language;
              })?.label
            }{" "}
            content
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            title="Move up"
            aria-label="Move project up"
            disabled={busy || index === 0}
            onClick={function () {
              onMove(index, -1);
            }}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:border-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowUp size={16} />
          </button>

          <button
            type="button"
            title="Move down"
            aria-label="Move project down"
            disabled={busy || index === total - 1}
            onClick={function () {
              onMove(index, 1);
            }}
            className="rounded-xl border border-[var(--border)] p-2 transition hover:border-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            title="Delete project"
            aria-label="Delete project"
            disabled={busy}
            onClick={function () {
              onDelete(project);
            }}
            className="rounded-xl p-2 text-red-500 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tag / Category</label>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <RichTextEditor
                key={"tag-" + project.clientKey + "-" + language}
                value={project.tag[language] || ""}
                onChange={function (val) {
                  onChange(project.clientKey, "tag", val);
                }}
                placeholder="e.g. Business"
                dir={inputDirection}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Project Title</label>
            <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <RichTextEditor
                key={"title-" + project.clientKey + "-" + language}
                value={project.title[language] || ""}
                onChange={function (val) {
                  onChange(project.clientKey, "title", val);
                }}
                placeholder="Project title in selected language"
                dir={inputDirection}
              />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass}>Project Cover Image</label>

          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {project.image ? (
              <img
                src={project.image}
                alt={stripHtml(project.title[language]) || "Project cover"}
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
            disabled={busy || !cloudinaryReady || checking}
            onClick={function () {
              onUploadImage(project);
            }}
            className={imageButtonClass + " mt-4"}
          >
            {checking ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Upload size={17} />
            )}

            {checking
              ? "Checking..."
              : project.image
                ? "Change Image"
                : "Upload Image"}
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
  const [checking, setChecking] = useState(false);
  const [theme, setTheme] = useState("light");

  const busy = saving || deleting;
  const inputDirection = language === "en" ? "ltr" : "rtl";

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(function () {
    function update() {
      if (document.documentElement.classList.contains("dark")) {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadError(false);

    try {
      const response = await axios.get(API);
      const saved = response.data.data || {};

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

  useEffect(function () {
    loadData();
  }, []);

  useEffect(function () {
    if (typeof window !== "undefined" && window.cloudinary) {
      setCloudinaryReady(true);
    }
  }, []);

  function updateHeader(field, value) {
    setHeader(function (previous) {
      if (field === "buttonLink") {
        return {
          ...previous,
          [field]: value,
        };
      }

      return {
        ...previous,
        [field]: {
          ...previous[field],
          [language]: value,
        },
      };
    });
  }

  function updateProject(key, field, value) {
    setProjects(function (previous) {
      return previous.map(function (project) {
        if (project.clientKey === key) {
          return {
            ...project,
            [field]: {
              ...project[field],
              [language]: value,
            },
          };
        }

        return project;
      });
    });
  }

  function moveProject(index, direction) {
    setProjects(function (previous) {
      const nextIndex = index + direction;

      if (nextIndex < 0 || nextIndex >= previous.length) {
        return previous;
      }

      const updated = [...previous];
      const temp = updated[index];
      updated[index] = updated[nextIndex];
      updated[nextIndex] = temp;

      return updated;
    });
  }

  async function uploadProjectImage(project) {
    if (busy || checking) return;

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

    setChecking(true);
    const allowed = await verifyUploadPermission();
    setChecking(false);

    if (!allowed) {
      toast.error("You don't have permission to upload images.");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudName,
        uploadPreset: uploadPreset,
        folder: "homepage/projects",
        multiple: false,
        maxFiles: 1,
        resourceType: "image",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
        maxFileSize: 5000000,
        showAdvancedOptions: false,
        cropping: false,
        styles: cloudinaryStyles(theme),
      },
      function (error, result) {
        if (error) {
          console.error("Cloudinary upload:", error);
          toast.error("Image upload failed. Please try again.");
          return;
        }

        if (!result || result.event !== "success") return;

        const imageUrl = result.info && result.info.secure_url;
        const publicId = result.info && result.info.public_id;

        if (!imageUrl || !publicId || !imageUrl.startsWith("https://")) {
          toast.error("Cloudinary did not return a valid image.");
          return;
        }

        setProjects(function (previous) {
          return previous.map(function (item) {
            if (item.clientKey === project.clientKey) {
              return {
                ...item,
                image: imageUrl,
                publicId: publicId,
              };
            }

            return item;
          });
        });

        toast.success(
          "Image uploaded. Click Save All Changes to save the project.",
        );
      },
    );

    widget.open();
  }

  function validateAllLanguages() {
    for (let i = 0; i < LANGUAGES.length; i += 1) {
      const lang = LANGUAGES[i];

      for (let j = 0; j < headerFields.length; j += 1) {
        const field = headerFields[j];

        if (field.shared) continue;

        const val = header[field.name] && header[field.name][lang.code];
        let isEmpty = false;

        if (field.rich) {
          isEmpty = !stripHtml(val);
        } else {
          isEmpty = !val || !val.trim();
        }

        if (isEmpty) {
          setLanguage(lang.code);
          toast.error(field.label + " is required in " + lang.label + ".");
          return false;
        }
      }
    }

    if (!projects.length) {
      toast.error("Add at least one project.");
      return false;
    }

    for (let i = 0; i < LANGUAGES.length; i += 1) {
      const lang = LANGUAGES[i];

      for (let index = 0; index < projects.length; index += 1) {
        const project = projects[index];

        if (!stripHtml(project.tag && project.tag[lang.code])) {
          setLanguage(lang.code);
          toast.error(
            "Project " +
              (index + 1) +
              ": Tag / Category is required in " +
              lang.label +
              ".",
          );
          return false;
        }

        if (!stripHtml(project.title && project.title[lang.code])) {
          setLanguage(lang.code);
          toast.error(
            "Project " +
              (index + 1) +
              ": Project Title is required in " +
              lang.label +
              ".",
          );
          return false;
        }
      }
    }

    if (
      typeof header.buttonLink !== "string" ||
      !/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(header.buttonLink.trim())
    ) {
      toast.error("Enter a valid button path, such as /projects.");
      return false;
    }

    for (let index = 0; index < projects.length; index += 1) {
      const project = projects[index];

      if (
        !project.image ||
        !project.image.startsWith("https://") ||
        !project.publicId ||
        !project.publicId.trim()
      ) {
        toast.error(
          "Upload a valid cover image for project " + (index + 1) + ".",
        );
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
      const response = await axios.post(API, {
        header: header,
        projects: projects.map(function (project, index) {
          const payload = {
            tag: project.tag,
            title: project.title,
            image: project.image,
            publicId: project.publicId,
            order: index,
          };

          if (project._id) {
            payload._id = project._id;
          }

          return payload;
        }),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Save failed.");
      }

      const saved = response.data.data || {};

      setHeader(normalizeHeader(saved.header || header));
      setProjects((saved.projects || []).map(formatProject));

      toast.success("All changes saved.");
    } catch (error) {
      console.error("Save projects:", error);

      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        "Failed to save projects.";

      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProject(project) {
    if (busy) return;

    if (!project._id) {
      setProjects(function (previous) {
        return previous.filter(function (item) {
          return item.clientKey !== project.clientKey;
        });
      });

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

      setProjects(function (previous) {
        return previous.filter(function (item) {
          return item.clientKey !== project.clientKey;
        });
      });

      toast.success("Project deleted.");
    } catch (error) {
      console.error("Delete project:", error);

      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Failed to delete project.";

      toast.error(message);
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
        onLoad={function () {
          setCloudinaryReady(true);
        }}
        onError={function () {
          setCloudinaryReady(false);
          toast.error("Could not load the Cloudinary image uploader.");
        }}
      />

      <div className="w-full pb-28">
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
              {headerFields.map(function (field) {
                return (
                  <div
                    key={field.name}
                    className={
                      field.name === "description" || field.name === "title"
                        ? "md:col-span-2"
                        : ""
                    }
                  >
                    <label className={labelClass}>
                      {field.label}

                      {field.shared && (
                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                          Shared across languages
                        </span>
                      )}
                    </label>

                    {field.rich ? (
                      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)]">
                        <RichTextEditor
                          key={field.name + "-" + language}
                          value={
                            (header[field.name] &&
                              header[field.name][language]) ||
                            ""
                          }
                          onChange={function (val) {
                            updateHeader(field.name, val);
                          }}
                          placeholder={field.placeholder}
                          dir={inputDirection}
                        />
                      </div>
                    ) : (
                      <input
                        dir={field.shared ? "ltr" : inputDirection}
                        value={
                          field.shared
                            ? header[field.name] || ""
                            : (header[field.name] &&
                                header[field.name][language]) ||
                              ""
                        }
                        onChange={function (event) {
                          updateHeader(field.name, event.target.value);
                        }}
                        placeholder={field.placeholder}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live preview */}
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
              <span
                className="inline-block rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-bold"
                dangerouslySetInnerHTML={{
                  __html:
                    (header.badgeText && header.badgeText[language]) ||
                    "PROUD PROJECTS",
                }}
              />

              <div
                dir={inputDirection}
                className="mt-3 text-2xl font-bold text-[var(--foreground)]"
                dangerouslySetInnerHTML={{
                  __html:
                    (header.title && header.title[language]) ||
                    "Breaking Boundaries, Dreams.",
                }}
              />

              <div
                dir={inputDirection}
                className="mt-2 text-sm text-[var(--muted)]"
                dangerouslySetInnerHTML={{
                  __html:
                    (header.description && header.description[language]) ||
                    "Section description preview",
                }}
              />
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
              {projects.map(function (project, index) {
                return (
                  <ProjectCard
                    key={project.clientKey}
                    project={project}
                    index={index}
                    total={projects.length}
                    language={language}
                    busy={busy}
                    cloudinaryReady={cloudinaryReady}
                    checking={checking}
                    onChange={updateProject}
                    onMove={moveProject}
                    onDelete={deleteProject}
                    onUploadImage={uploadProjectImage}
                  />
                );
              })}
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={function () {
                setProjects(function (previous) {
                  return [...previous, newProject()];
                });
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus size={18} />
              Add New Large Project
            </button>
          </section>
        </div>
      </div>

      <AdminStickyFooter
        onReload={loadData}
        onSave={saveAll}
        saving={saving}
        busy={busy}
        saveLabel="Save All Changes"
        savingLabel="Saving All..."
        reloadLabel="Reload Saved Data"
      />
    </>
  );
}
