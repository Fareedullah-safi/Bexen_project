
"use client";

import axios from "axios";
import {
  ArrowDown,
  ArrowUp,
  FolderKanban,
  ImagePlus,
  Info,
  Link as LinkIcon,
  LoaderCircle,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Spinner from "@/app/admin/Components/Admin/Spinner";

/* =========================================================
1. STYLES
========================================================= */

const panelClass =
  "rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-7 shadow-sm sm:p-8";

const inputClass =
  "w-full rounded-2xl border border-[var(--border)] bg-[var(--background)] px-4 py-3.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10";

const labelClass = "mb-2 block text-sm font-semibold text-[var(--foreground)]";

const saveButtonClass =
  "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:opacity-60";

const moveButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-40";

/* =========================================================
2. CONSTANTS
========================================================= */

const PROJECTS_API = "/api/homepage/projects/cards";
const HEADER_API = "/api/homepage/projects/header";

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
  },
];

/* =========================================================
3. HELPERS
========================================================= */

function createEmptyProject() {
  return {
    clientKey: `draft-${Date.now()}-${Math.random()}`,
    _id: null,
    tag: "",
    title: "",
    image: "",
    publicId: "",
    imageFile: null,
    imagePreview: "",
  };
}

function formatProjectFromApi(project) {
  return {
    clientKey: project._id,
    _id: project._id,
    tag: project.tag || "",
    title: project.title || "",
    image: project.image || "",
    publicId: project.publicId || "",
    imageFile: null,
    imagePreview: "",
  };
}

/* =========================================================
4. IMAGE PREVIEW
========================================================= */

function ProjectImage({ source, alt }) {
  const [failedSource, setFailedSource] = useState("");

  useEffect(() => {
    setFailedSource("");
  }, [source]);

  const showImage = Boolean(source) && failedSource !== source;

  return (
    <div className="flex h-44 items-center justify-center overflow-hidden bg-[var(--background)]">
      {showImage ? (
        <img
          src={source}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <div className="flex flex-col items-center text-[var(--muted)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <ImagePlus size={24} />
          </div>

          <p className="mt-2 text-xs font-medium text-[var(--foreground)]">
            {source
              ? "Could not load image. Check the URL."
              : "No image selected"}
          </p>
        </div>
      )}
    </div>
  );
}

/* =========================================================
5. PROJECT CARD
========================================================= */

function ProjectCard({
  project,
  index,
  totalProjects,
  busy,
  deletingKey,
  onChange,
  onMove,
  onDelete,
  onImageUrlChange,
  onImageFileChange,
}) {
  const isDeleting = deletingKey === project.clientKey;
  const imageSource = project.imagePreview || project.image;

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--background)] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[var(--foreground)]">
              {project.title || "Untitled Project"}
            </p>

            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Tag: {project.tag || "Large"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            title="Move up"
            disabled={index === 0 || busy}
            onClick={() => onMove(project.clientKey, -1)}
            className={moveButtonClass}
          >
            <ArrowUp size={16} />
          </button>

          <button
            type="button"
            title="Move down"
            disabled={index === totalProjects - 1 || busy}
            onClick={() => onMove(project.clientKey, 1)}
            className={moveButtonClass}
          >
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            title="Delete project"
            disabled={busy}
            onClick={() => onDelete(project)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface)] text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-60"
          >
            {isDeleting ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Tag / Category</label>

            <input
              value={project.tag}
              disabled={busy}
              onChange={(e) =>
                onChange(project.clientKey, { tag: e.target.value })
              }
              placeholder="e.g. Connect, Business"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Project Title</label>

            <textarea
              value={project.title}
              disabled={busy}
              onChange={(e) =>
                onChange(project.clientKey, { title: e.target.value })
              }
              rows={3}
              placeholder="e.g. Event Management Platform"
              className={`${inputClass} resize-y`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Large Cover Image</label>

          <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <ProjectImage
              source={imageSource}
              alt={project.title || "Large project"}
            />

            <div className="space-y-3 p-4">
              <div className="relative">
                <LinkIcon
                  size={15}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--muted)]"
                />

                <input
                  type="url"
                  value={project.image}
                  disabled={busy}
                  onChange={(e) =>
                    onImageUrlChange(project.clientKey, e.target.value)
                  }
                  placeholder="Paste image URL..."
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pr-4 pl-10 text-xs text-[var(--foreground)] outline-none focus:border-[#1E8A8A]"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--border)]" />
                <span className="text-[10px] font-bold text-[var(--muted)]">
                  OR
                </span>
                <div className="h-px flex-1 bg-[var(--border)]" />
              </div>

              <label
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E8A8A] ${
                  busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                <Upload size={14} />
                Upload Image

                <input
                  type="file"
                  accept="image/*"
                  disabled={busy}
                  className="hidden"
                  onChange={(e) => {
                    onImageFileChange(
                      project.clientKey,
                      e.target.files?.[0],
                    );
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--muted)]">
            <Info size={13} className="mt-0.5 shrink-0" />
            Recommended: 999 × 666 — Large Display · Max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
6. MAIN PAGE
========================================================= */

export default function ProjectsAdmin() {
  const [header, setHeader] = useState({
    badgeText: "",
    headingLine: "",
    highlightWord: "",
    description: "",
    buttonText: "",
    buttonLink: "/",
  });

  const [loadingHeader, setLoadingHeader] = useState(true);
  const [headerError, setHeaderError] = useState(false);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState(false);
  const [savingProjects, setSavingProjects] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [reloadProjects, setReloadProjects] = useState(0);

  const [savingHeader, setSavingHeader] = useState(false);
  const [headerCooldown, setHeaderCooldown] = useState(false);

  const requestInProgress = useRef(false);
  const cooldownTimer = useRef(null);

  const busy = savingProjects || deletingKey !== null;

  /* =========================================================
  LOAD SAVED HEADER DATA INTO ALL INPUTS
  ========================================================= */

  useEffect(() => {
    let active = true;

    async function loadHeader() {
      setLoadingHeader(true);
      setHeaderError(false);

      try {
        const { data } = await axios.get(HEADER_API);

        if (!active) return;

        // Handle common API response formats.
        const savedHeader =
          data?.header ??
          data?.data?.header ??
          data?.data ??
          data;

        setHeader({
          badgeText: savedHeader?.badgeText ?? "",
          headingLine: savedHeader?.headingLine ?? "",
          highlightWord: savedHeader?.highlightWord ?? "",
          description: savedHeader?.description ?? "",
          buttonText: savedHeader?.buttonText ?? "",
          buttonLink: savedHeader?.buttonLink ?? "/",
        });
      } catch (error) {
        console.error("Load project header error:", error);

        if (active) {
          setHeaderError(true);
          toast.error(
            error.response?.data?.message ||
              "Failed to load project header.",
          );
        }
      } finally {
        if (active) {
          setLoadingHeader(false);
        }
      }
    }

    loadHeader();

    return () => {
      active = false;
    };
  }, []);

  /* =========================================================
  LOAD PROJECT CARDS
  ========================================================= */

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setLoadingProjects(true);
      setProjectsError(false);

      try {
        const { data } = await axios.get(PROJECTS_API);

        if (!Array.isArray(data?.projects)) {
          throw new Error("Invalid projects response");
        }

        if (active) {
          setProjects(data.projects.map(formatProjectFromApi));
        }
      } catch (error) {
        console.error("Load large projects error:", error);

        if (active) {
          setProjectsError(true);
        }
      } finally {
        if (active) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, [reloadProjects]);

  useEffect(() => {
    return () => clearTimeout(cooldownTimer.current);
  }, []);

  /* =========================================================
  HEADER FUNCTIONS
  ========================================================= */

  function updateHeader(e) {
    const { name, value } = e.target;

    setHeader((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function saveHeader() {
    if (savingHeader || headerCooldown) return;

    const hasEmptyField = Object.values(header).some(
      (value) => !value.trim(),
    );

    if (hasEmptyField) {
      toast.error("Please fill in all header fields.");
      return;
    }

    const link = header.buttonLink.trim();

    const validLink =
      /^\/[a-zA-Z0-9/_-]*$/.test(link) && !link.startsWith("//");

    if (!validLink) {
      toast.error(
        "Button Link must start with / and contain only letters, numbers, /, - or _.",
      );
      return;
    }

    setSavingHeader(true);
    setHeaderCooldown(true);

    try {
      await axios.post(HEADER_API, {
        ...header,
        buttonLink: link,
      });

      toast.success("Header updated successfully.");
    } catch (error) {
      console.error("Save header error:", error);

      toast.error(
        error.response?.data?.message || "Failed to save header.",
      );
    } finally {
      setSavingHeader(false);

      cooldownTimer.current = setTimeout(() => {
        setHeaderCooldown(false);
      }, 10000);
    }
  }

  async function retryLoadHeader() {
    setLoadingHeader(true);
    setHeaderError(false);

    try {
      const { data } = await axios.get(HEADER_API);

      const savedHeader =
        data?.header ??
        data?.data?.header ??
        data?.data ??
        data;

      setHeader({
        badgeText: savedHeader?.badgeText ?? "",
        headingLine: savedHeader?.headingLine ?? "",
        highlightWord: savedHeader?.highlightWord ?? "",
        description: savedHeader?.description ?? "",
        buttonText: savedHeader?.buttonText ?? "",
        buttonLink: savedHeader?.buttonLink ?? "/",
      });
    } catch (error) {
      console.error("Retry header load error:", error);
      setHeaderError(true);

      toast.error(
        error.response?.data?.message ||
          "Failed to load project header.",
      );
    } finally {
      setLoadingHeader(false);
    }
  }

  /* =========================================================
  PROJECT FUNCTIONS
  ========================================================= */

  function addProject() {
    if (requestInProgress.current) return;

    setProjects((prev) => [...prev, createEmptyProject()]);
  }

  function updateProject(clientKey, changes) {
    if (requestInProgress.current) return;

    setProjects((prev) =>
      prev.map((project) =>
        project.clientKey === clientKey
          ? { ...project, ...changes }
          : project,
      ),
    );
  }

  function changeImageUrl(clientKey, url) {
    updateProject(clientKey, {
      image: url,
      imageFile: null,
      imagePreview: "",
    });
  }

  function changeImageFile(clientKey, file) {
    if (!file || requestInProgress.current) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image must be larger than 0 bytes and no more than 5MB.",
      );
      return;
    }

    updateProject(clientKey, {
      image: "",
      imageFile: file,
      imagePreview: "",
    });

    const reader = new FileReader();

    reader.onload = () => {
      setProjects((prev) =>
        prev.map((project) =>
          project.clientKey === clientKey &&
          project.imageFile === file
            ? {
                ...project,
                imagePreview: reader.result || "",
              }
            : project,
        ),
      );
    };

    reader.onerror = () => {
      toast.error("Could not preview this image.");
    };

    reader.readAsDataURL(file);
  }

  function moveProject(clientKey, direction) {
    if (requestInProgress.current) return;

    setProjects((prev) => {
      const index = prev.findIndex(
        (item) => item.clientKey === clientKey,
      );

      const newIndex = index + direction;

      if (index < 0 || newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];

      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];

      return updated;
    });
  }

  async function deleteProject(project) {
    if (requestInProgress.current) return;

    if (!project._id) {
      setProjects((prev) =>
        prev.filter(
          (item) => item.clientKey !== project.clientKey,
        ),
      );
      return;
    }

    requestInProgress.current = true;
    setDeletingKey(project.clientKey);

    try {
      await axios.delete(PROJECTS_API, {
        params: { id: project._id },
      });

      setProjects((prev) =>
        prev.filter(
          (item) => item.clientKey !== project.clientKey,
        ),
      );

      toast.success("Project deleted.");
    } catch (error) {
      console.error("Delete project error:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete project.",
      );
    } finally {
      requestInProgress.current = false;
      setDeletingKey(null);
    }
  }

  async function saveProjects() {
    if (
      requestInProgress.current ||
      loadingProjects ||
      projectsError
    ) {
      return;
    }

    if (projects.length === 0) {
      toast.error("Add at least one project.");
      return;
    }

    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];

      if (!project.tag.trim() || !project.title.trim()) {
        toast.error(`Add a tag and title to project ${i + 1}.`);
        return;
      }

      if (!project.image.trim() && !project.imageFile) {
        toast.error(`Add an image to project ${i + 1}.`);
        return;
      }
    }

    const formData = new FormData();

    formData.append(
      "projects",
      JSON.stringify(
        projects.map((project, index) => ({
          tag: project.tag.trim(),
          title: project.title.trim(),
          image: project.image.trim(),
          publicId: project.publicId,
          order: index,
        })),
      ),
    );

    projects.forEach((project, index) => {
      if (project.imageFile) {
        formData.append(`image_${index}`, project.imageFile);
      }
    });

    requestInProgress.current = true;
    setSavingProjects(true);

    try {
      const { data } = await axios.post(
        PROJECTS_API,
        formData,
      );

      if (!Array.isArray(data?.projects)) {
        throw new Error("Invalid save response");
      }

      setProjects(data.projects.map(formatProjectFromApi));

      toast.success(data.message || "Projects saved.");
    } catch (error) {
      console.error("Save projects error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to save projects.",
      );
    } finally {
      requestInProgress.current = false;
      setSavingProjects(false);
    }
  }

  /* =========================================================
  UI
  ========================================================= */

  return (
    <div className="w-full">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          <FolderKanban size={27} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Proud Projects
          </h1>

          <p className="mt-1 text-base text-[var(--muted)]">
            Manage the project showcase section on your homepage.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* HEADER SECTION */}

        <section className={panelClass}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                01
              </span>

              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Section Header Content
              </h2>
            </div>

            <span className="rounded-full bg-[#1E8A8A]/10 px-3 py-1.5 text-xs font-semibold text-[#1E8A8A]">
              Single Settings
            </span>
          </div>

          {headerError && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-sm text-red-500">
                Could not load saved header data.
              </p>

              <button
                type="button"
                onClick={retryLoadHeader}
                disabled={loadingHeader}
                className="text-sm font-semibold text-[#1E8A8A] disabled:opacity-50"
              >
                {loadingHeader ? "Loading..." : "Try again"}
              </button>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            {headerFields.map((field) => (
              <div
                key={field.name}
                className={field.textarea ? "md:col-span-2" : ""}
              >
                <label
                  htmlFor={field.name}
                  className={labelClass}
                >
                  {field.label}
                </label>

                {field.textarea ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={header[field.name]}
                    onChange={updateHeader}
                    disabled={loadingHeader}
                    placeholder={field.placeholder}
                    rows={3}
                    className={`${inputClass} resize-y`}
                  />
                ) : (
                  <input
                    id={field.name}
                    name={field.name}
                    value={header[field.name]}
                    onChange={updateHeader}
                    disabled={loadingHeader}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6 text-[var(--foreground)]">
            <span className="inline-flex rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
              {header.badgeText || "PROUD PROJECTS"}
            </span>

            <p className="mt-3 text-2xl leading-tight font-medium">
              {header.headingLine || "Breaking Boundaries,"}
              <br />
              Building{" "}
              <span className="text-[#1E8A8A]">
                {header.highlightWord || "Dreams."}
              </span>
            </p>

            <p className="mt-2 max-w-lg text-sm text-[var(--muted)]">
              {header.description ||
                "We work closely with our clients to understand their unique needs and craft tailored solutions."}
            </p>
          </div>

          <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-6">
            <button
              type="button"
              disabled={
                loadingHeader ||
                headerError ||
                savingHeader ||
                headerCooldown
              }
              onClick={saveHeader}
              className={saveButtonClass}
            >
              {savingHeader ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {loadingHeader
                    ? "Loading..."
                    : headerCooldown
                      ? "Please wait..."
                      : "Change Section Header"}
                </>
              )}
            </button>
          </div>
        </section>

        {/* LARGE PROJECTS SECTION */}

        <section className={panelClass}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                02
              </span>

              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Large Projects
              </h2>
            </div>

            <span className="w-fit rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Large Card
            </span>
          </div>

          {loadingProjects ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : projectsError ? (
            <div className="rounded-2xl bg-[var(--background)] p-6 text-center">
              <p className="text-sm text-[var(--muted)]">
                Could not load projects.
              </p>

              <button
                type="button"
                onClick={() =>
                  setReloadProjects((prev) => prev + 1)
                }
                className="mt-3 text-sm font-semibold text-[#1E8A8A]"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              {projects.length === 0 && (
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
                    totalProjects={projects.length}
                    busy={busy}
                    deletingKey={deletingKey}
                    onChange={updateProject}
                    onMove={moveProject}
                    onDelete={deleteProject}
                    onImageUrlChange={changeImageUrl}
                    onImageFileChange={changeImageFile}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={addProject}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-60"
              >
                <Plus size={18} />
                Add New Large Project
              </button>

              <div className="mt-6 flex justify-end border-t border-[var(--border)] pt-6">
                <button
                  type="button"
                  disabled={
                    busy ||
                    loadingProjects ||
                    projectsError ||
                    projects.length === 0
                  }
                  onClick={saveProjects}
                  className={`${saveButtonClass} w-full sm:w-auto`}
                >
                  {savingProjects ? (
                    <>
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Projects
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
