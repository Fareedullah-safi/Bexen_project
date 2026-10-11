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

/* =========================================================
   1. STYLES AND SETTINGS
   ========================================================= */

const panelClass =
  "rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]";

const inputClass =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0C1E21] outline-none transition placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white";

const labelClass =
  "mb-2 block text-sm font-semibold text-[#0C1E21] dark:text-gray-200";

const saveButtonClass =
  "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white transition hover:bg-[#167777] disabled:cursor-not-allowed disabled:opacity-60";

const moveButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-40 dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400";

const projectSettings = {
  large: {
    label: "Large",
    title: "Large Projects",
    endpoint: "/api/homepage/projects/large",
    badge: "Large Card (flex-1.7)",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    tagClass: "text-emerald-600 dark:text-emerald-400",
    tagPlaceholder: "e.g. Connect, Business",
    titlePlaceholder: "e.g. Event Management Platform",
    recommendedSize: "999 × 666 — Large Display",
  },
  mini: {
    label: "Mini",
    title: "Mini Projects",
    endpoint: "/api/homepage/projects/mini",
    badge: "Mini Card (flex-1)",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    tagClass: "text-amber-600 dark:text-amber-400",
    tagPlaceholder: "e.g. Empower, Support",
    titlePlaceholder: "e.g. Digital Marketing Campaign",
    recommendedSize: "600 × 400 — Compact Display",
  },
};

const headerFields = [
  { name: "badgeText", label: "Badge Text", placeholder: "PROUD PROJECTS" },
  {
    name: "headingLine",
    label: "Heading Line",
    placeholder: "Breaking Boundaries,",
  },
  { name: "highlightWord", label: "Highlight Word", placeholder: "Dreams." },
  {
    name: "description",
    label: "Description",
    placeholder: "We work closely with our clients...",
    textarea: true,
  },
  { name: "buttonText", label: "Button Text", placeholder: "More Projects" },
  { name: "buttonLink", label: "Button Link", placeholder: "/projects" },
];

/* =========================================================
   2. PROJECT DATA HELPERS
   ========================================================= */

// A new card has no database ID until it is saved.
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

// Convert a project returned by the API into editable form state.
function fromApi(project) {
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
   3. ONE HOOK FOR BOTH LARGE AND MINI PROJECTS
   ========================================================= */

function useProjectList({ endpoint, label }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingKey, setDeletingKey] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Prevent a save and a delete from running at the same time.
  const requestInProgress = useRef(false);
  const busy = saving || deletingKey !== null;

  // Load saved projects when the page opens.
  useEffect(() => {
    let active = true;

    setLoading(true);
    setLoadError(false);

    axios
      .get(endpoint)
      .then(({ data }) => {
        if (!active) return;

        if (!Array.isArray(data?.projects)) {
          throw new Error("Invalid projects response");
        }

        // Also set an empty array when the database has no projects.
        setProjects(data.projects.map(fromApi));
      })
      .catch((error) => {
        if (!active) return;

        console.error(`Load ${label} projects error:`, error);
        setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [endpoint, label, reloadCount]);

  function addProject() {
    if (requestInProgress.current) return;

    setProjects((current) => [...current, createEmptyProject()]);
  }

  function updateProject(clientKey, changes) {
    if (requestInProgress.current) return;

    setProjects((current) =>
      current.map((project) =>
        project.clientKey === clientKey ? { ...project, ...changes } : project,
      ),
    );
  }

  function setImageUrl(clientKey, url) {
    updateProject(clientKey, {
      image: url,
      imageFile: null,
      imagePreview: "",
    });
  }

  function setImageFile(clientKey, file) {
    if (!file || requestInProgress.current) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      toast.error("Image must be larger than 0 bytes and no more than 5MB.");
      return;
    }

    // Store the file for uploading.
    updateProject(clientKey, {
      image: "",
      imageFile: file,
      imagePreview: "",
    });

    // FileReader is only for showing a preview before saving.
    const reader = new FileReader();

    reader.onload = () => {
      setProjects((current) =>
        current.map((project) =>
          project.clientKey === clientKey && project.imageFile === file
            ? { ...project, imagePreview: reader.result }
            : project,
        ),
      );
    };

    reader.onerror = () => toast.error("Could not preview this image.");
    reader.readAsDataURL(file);
  }

  function moveProject(clientKey, direction) {
    if (requestInProgress.current) return;

    setProjects((current) => {
      const index = current.findIndex(
        (project) => project.clientKey === clientKey,
      );
      const target = index + direction;

      if (index < 0 || target < 0 || target >= current.length) {
        return current;
      }

      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];

      return next;
    });
  }

  async function deleteProject(project) {
    if (requestInProgress.current) return;

    // A new, unsaved card only exists in the browser.
    if (!project._id) {
      setProjects((current) =>
        current.filter((item) => item.clientKey !== project.clientKey),
      );
      return;
    }

    requestInProgress.current = true;
    setDeletingKey(project.clientKey);

    try {
      await axios.delete(endpoint, {
        params: { id: project._id },
      });

      setProjects((current) =>
        current.filter((item) => item.clientKey !== project.clientKey),
      );

      toast.success(`${label} project deleted.`);
    } catch (error) {
      console.error(`Delete ${label} project error:`, error);
      toast.error(error.response?.data?.message || "Failed to delete project.");
    } finally {
      requestInProgress.current = false;
      setDeletingKey(null);
    }
  }

  async function saveProjects() {
    if (requestInProgress.current || loading || loadError) return;

    if (projects.length === 0) {
      toast.error(`Add at least one ${label.toLowerCase()} project.`);
      return;
    }

    // Check every card before sending anything to the API.
    for (const [index, project] of projects.entries()) {
      if (!project.tag.trim() || !project.title.trim()) {
        toast.error(`Add a tag and title to project ${index + 1}.`);
        return;
      }

      if (!project.image.trim() && !project.imageFile) {
        toast.error(`Add an image to project ${index + 1}.`);
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
    setSaving(true);

    try {
      const { data } = await axios.post(endpoint, formData);

      if (!Array.isArray(data?.projects)) {
        throw new Error("Invalid save response");
      }

      // The API returns the new database IDs and uploaded image URLs.
      setProjects(data.projects.map(fromApi));
      toast.success(data.message || `${label} projects saved.`);
    } catch (error) {
      console.error(`Save ${label} projects error:`, error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          `Failed to save ${label.toLowerCase()} projects.`,
      );
    } finally {
      requestInProgress.current = false;
      setSaving(false);
    }
  }

  return {
    projects,
    loading,
    loadError,
    busy,
    saving,
    deletingKey,
    addProject,
    updateProject,
    setImageUrl,
    setImageFile,
    moveProject,
    deleteProject,
    saveProjects,
    retry: () => setReloadCount((count) => count + 1),
  };
}

/* =========================================================
   4. PROJECT CARD UI
   ========================================================= */

function ProjectImage({ source, alt, label }) {
  const [failedSource, setFailedSource] = useState("");
  const showImage = Boolean(source) && failedSource !== source;

  return (
    <div className="flex h-44 items-center justify-center overflow-hidden bg-gray-50 dark:bg-[#0C1E21]">
      {showImage ? (
        <img
          src={source}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <div className="flex flex-col items-center text-gray-400">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
            <ImagePlus size={24} />
          </div>
          <p className="mt-2 text-xs font-medium text-[#0C1E21] dark:text-white">
            {source
              ? "Could not load image. Check the URL."
              : `No ${label.toLowerCase()} image selected`}
          </p>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index, total, settings, list }) {
  const key = project.clientKey;
  const imageSource = project.imagePreview || project.image;
  const isDeleting = list.deletingKey === key;

  return (
    <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0C1E21]">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
            {String(index + 1).padStart(2, "0")}
          </span>

          <div className="min-w-0">
            <p className="truncate text-base font-bold text-[#0C1E21] dark:text-white">
              {project.title || "Untitled Project"}
            </p>
            <span className={`text-xs font-semibold ${settings.tagClass}`}>
              Tag: {project.tag || settings.label}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            title="Move up"
            disabled={index === 0 || list.busy}
            onClick={() => list.moveProject(key, -1)}
            className={moveButtonClass}
          >
            <ArrowUp size={16} />
          </button>

          <button
            type="button"
            title="Move down"
            disabled={index === total - 1 || list.busy}
            onClick={() => list.moveProject(key, 1)}
            className={moveButtonClass}
          >
            <ArrowDown size={16} />
          </button>

          <button
            type="button"
            title="Delete project"
            disabled={list.busy}
            onClick={() => list.deleteProject(project)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 transition hover:bg-red-500 hover:text-white disabled:opacity-60 dark:bg-[#111b1d]"
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
              disabled={list.busy}
              onChange={(event) =>
                list.updateProject(key, { tag: event.target.value })
              }
              placeholder={settings.tagPlaceholder}
              className={`${inputClass} !bg-white dark:!bg-[#111b1d]`}
            />
          </div>

          <div>
            <label className={labelClass}>Project Title</label>
            <textarea
              value={project.title}
              disabled={list.busy}
              onChange={(event) =>
                list.updateProject(key, { title: event.target.value })
              }
              rows={3}
              placeholder={settings.titlePlaceholder}
              className={`${inputClass} resize-y !bg-white dark:!bg-[#111b1d]`}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{settings.label} Cover Image</label>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111b1d]">
            <ProjectImage
              source={imageSource}
              alt={project.title || settings.label}
              label={settings.label}
            />

            <div className="space-y-3 p-4">
              <div className="relative">
                <LinkIcon
                  size={15}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="url"
                  value={project.image}
                  disabled={list.busy}
                  onChange={(event) =>
                    list.setImageUrl(key, event.target.value)
                  }
                  placeholder={`Paste ${settings.label.toLowerCase()} image URL...`}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-xs text-[#0C1E21] outline-none focus:border-[#1E8A8A] dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                <span className="text-[10px] font-bold text-gray-400">OR</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
              </div>

              <label
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E8A8A] dark:bg-white/10 dark:hover:bg-[#1E8A8A] ${
                  list.busy ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                <Upload size={14} />
                Upload {settings.label} Image
                <input
                  type="file"
                  accept="image/*"
                  disabled={list.busy}
                  className="hidden"
                  onChange={(event) => {
                    list.setImageFile(key, event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Info size={13} className="mt-0.5 shrink-0" />
            Recommended: {settings.recommendedSize} · Max 5MB
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   5. PROJECT SECTION UI
   ========================================================= */

function ProjectSection({ number, settings, list }) {
  return (
    <section className={panelClass}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
            {number}
          </span>
          <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
            {settings.title}
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${settings.badgeClass}`}
        >
          {settings.badge}
        </span>
      </div>

      {list.loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
          <LoaderCircle size={18} className="animate-spin" />
          Loading {settings.label.toLowerCase()} projects...
        </div>
      ) : list.loadError ? (
        <div className="rounded-2xl bg-gray-50 p-6 text-center dark:bg-[#0C1E21]">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Could not load {settings.label.toLowerCase()} projects.
          </p>
          <button
            type="button"
            onClick={list.retry}
            className="mt-3 text-sm font-semibold text-[#1E8A8A]"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {list.projects.length === 0 && (
            <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500 dark:bg-[#0C1E21] dark:text-gray-400">
              No {settings.label.toLowerCase()} projects yet. Add one below.
            </p>
          )}

          <div className="space-y-6">
            {list.projects.map((project, index) => (
              <ProjectCard
                key={project.clientKey}
                project={project}
                index={index}
                total={list.projects.length}
                settings={settings}
                list={list}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={list.busy}
            onClick={list.addProject}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] disabled:opacity-60 dark:border-white/15 dark:text-gray-400"
          >
            <Plus size={18} />
            Add New {settings.label} Project
          </button>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="button"
              disabled={list.busy || list.projects.length === 0}
              onClick={list.saveProjects}
              className={`${saveButtonClass} w-full sm:w-auto`}
            >
              {list.saving ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save {settings.label} Projects
                </>
              )}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

/* =========================================================
   6. PAGE: HEADER + LARGE + MINI
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

  const [savingHeader, setSavingHeader] = useState(false);
  const [headerCooldown, setHeaderCooldown] = useState(false);
  const cooldownTimer = useRef(null);

  // Each list uses the same logic but has its own API endpoint and state.
  const largeProjects = useProjectList(projectSettings.large);
  const miniProjects = useProjectList(projectSettings.mini);

  useEffect(() => {
    return () => clearTimeout(cooldownTimer.current);
  }, []);

  function updateHeader(event) {
    const { name, value } = event.target;
    setHeader((current) => ({ ...current, [name]: value }));
  }

  async function saveHeader() {
    if (savingHeader || headerCooldown) return;

    if (Object.values(header).some((value) => !value.trim())) {
      toast.error("Please fill in all header fields.");
      return;
    }

    const link = header.buttonLink.trim();

    if (!/^\/[a-zA-Z0-9/_-]*$/.test(link) || link.startsWith("//")) {
      toast.error(
        "Button Link must start with / and contain only letters, numbers, /, - or _.",
      );
      return;
    }

    setSavingHeader(true);
    setHeaderCooldown(true);

    try {
      await axios.post("/api/homepage/projects/header", {
        ...header,
        buttonLink: link,
      });

      toast.success("Header updated successfully.");
    } catch (error) {
      console.error("Save header error:", error);
      toast.error(error.response?.data?.message || "Failed to save header.");
    } finally {
      setSavingHeader(false);
      cooldownTimer.current = setTimeout(() => setHeaderCooldown(false), 10000);
    }
  }

  return (
    <div className="w-full">
      <div className="mb-10 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
          <FolderKanban size={27} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0C1E21] dark:text-white">
            Proud Projects
          </h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Manage the project showcase section on your homepage.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* 01 — HEADER */}
        <section className={panelClass}>
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                01
              </span>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Section Header Content
              </h2>
            </div>

            <span className="rounded-full bg-[#1E8A8A]/10 px-3 py-1.5 text-xs font-semibold text-[#1E8A8A]">
              Single Settings
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {headerFields.map((field) => (
              <div
                key={field.name}
                className={field.textarea ? "md:col-span-2" : ""}
              >
                <label htmlFor={field.name} className={labelClass}>
                  {field.label}
                </label>

                {field.textarea ? (
                  <textarea
                    id={field.name}
                    name={field.name}
                    value={header[field.name]}
                    onChange={updateHeader}
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
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-[#ECF0F0] p-6 text-[#102326] dark:bg-[#0C1E21] dark:text-white">
            <span className="inline-flex bg-[#ECF0F0] px-3 py-1 text-xs font-bold text-zinc-950 dark:bg-[#111b1d] dark:text-white">
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

            <p className="mt-2 max-w-lg text-sm text-zinc-600 dark:text-gray-400">
              {header.description ||
                "We work closely with our clients to understand their unique needs and craft tailored solutions."}
            </p>
          </div>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="button"
              disabled={savingHeader || headerCooldown}
              onClick={saveHeader}
              className={saveButtonClass}
            >
              {savingHeader ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {headerCooldown ? "Please wait..." : "Change Section Header"}
                </>
              )}
            </button>
          </div>
        </section>

        {/* 02 — LARGE PROJECTS */}
        <ProjectSection
          number="02"
          settings={projectSettings.large}
          list={largeProjects}
        />

        {/* 03 — MINI PROJECTS */}
        <ProjectSection
          number="03"
          settings={projectSettings.mini}
          list={miniProjects}
        />
      </div>
    </div>
  );
}
