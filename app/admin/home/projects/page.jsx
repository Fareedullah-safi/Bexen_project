"use client";

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
} from "lucide-react";
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
  "flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-6 text-sm font-semibold text-white hover:bg-[#167777] disabled:opacity-60";

const translation = () => ({ en: "", fa: "", ps: "" });

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
  tag:
    typeof project.tag === "string"
      ? { ...translation(), en: project.tag }
      : { ...translation(), ...project.tag },
  title:
    typeof project.title === "string"
      ? { ...translation(), en: project.title }
      : { ...translation(), ...project.title },
  image: project.image || "",
  publicId: project.publicId || "",
});

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
          className={`min-h-10 rounded-xl px-4 py-2 text-sm font-semibold transition ${
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
  onChange,
  onMove,
  onDelete,
}) {
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
        <div className="flex gap-2">
          <button
            type="button"
            title="Move up"
            disabled={busy || index === 0}
            onClick={() => onMove(index, -1)}
            className="rounded-xl border border-[var(--border)] p-2 disabled:opacity-40"
          >
            <ArrowUp size={16} />
          </button>
          <button
            type="button"
            title="Move down"
            disabled={busy || index === total - 1}
            onClick={() => onMove(index, 1)}
            className="rounded-xl border border-[var(--border)] p-2 disabled:opacity-40"
          >
            <ArrowDown size={16} />
          </button>
          <button
            type="button"
            title="Delete project"
            disabled={busy}
            onClick={() => onDelete(project)}
            className="rounded-xl p-2 text-red-500 hover:bg-red-500 hover:text-white disabled:opacity-40"
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
                  disabled={busy}
                  value={project[item.field][language] || ""}
                  onChange={(e) =>
                    onChange(project.clientKey, item.field, e.target.value)
                  }
                  placeholder={item.placeholder}
                  className={`${inputClass} resize-y`}
                />
              ) : (
                <input
                  disabled={busy}
                  value={project[item.field][language] || ""}
                  onChange={(e) =>
                    onChange(project.clientKey, item.field, e.target.value)
                  }
                  placeholder={item.placeholder}
                  className={inputClass}
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <label className={labelClass}>Project Cover Image</label>
          <div className="flex h-44 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            {project.image ? (
              <img
                src={project.image}
                alt={project.title[language] || "Project"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="text-center text-[var(--muted)]">
                <ImagePlus size={28} className="mx-auto text-[#1E8A8A]" />
                <p className="mt-2 text-xs">No image selected</p>
              </div>
            )}
          </div>
          <p className="mt-2 flex gap-1.5 text-xs text-[var(--muted)]">
            <Info size={13} /> Recommended 999 × 666.
          </p>
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

  const busy = saving || deleting;

  // Load data
  async function loadData() {
    setLoading(true);
    setLoadError(false);

    try {
      const { data } = await axios.get(API);
      const saved = data.data || {};

      setHeader({ ...emptyHeader(), ...saved.header });
      setProjects((saved.projects || []).map(formatProject));
    } catch (error) {
      console.error(error);
      setLoadError(true);
      toast.error("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update one header field
  function updateHeader(field, value) {
    setHeader((prev) => ({
      ...prev,
      [field]:
        field === "buttonLink" ? value : { ...prev[field], [language]: value },
    }));
  }

  // Update one project field
  function updateProject(key, field, value) {
    setProjects((prev) =>
      prev.map((project) =>
        project.clientKey === key
          ? { ...project, [field]: { ...project[field], [language]: value } }
          : project,
      ),
    );
  }

  // Change project order
  function moveProject(index, direction) {
    setProjects((prev) => {
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;

      const updated = [...prev];
      [updated[index], updated[next]] = [updated[next], updated[index]];
      return updated;
    });
  }

  // Save header and all projects together
  async function saveAll() {
    if (busy) return;

    const missingHeader = headerFields.some(
      (field) => !field.shared && !header[field.name]?.[language]?.trim(),
    );

    if (missingHeader) {
      toast.error("Fill in all header fields for the selected language.");
      return;
    }

    if (!/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(header.buttonLink.trim())) {
      toast.error("Enter a valid button path, such as /projects.");
      return;
    }

    if (!projects.length) {
      toast.error("Add at least one project.");
      return;
    }

    const invalid = projects.findIndex(
      (p) =>
        !p.tag[language]?.trim() ||
        !p.title[language]?.trim() ||
        !p.image.trim(),
    );

    if (invalid !== -1) {
      toast.error(
        `Complete the tag, title and image for project ${invalid + 1}.`,
      );
      return;
    }

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

      if (!data.success) throw new Error(data.message || "Save failed.");

      setHeader({ ...emptyHeader(), ...data.data.header });
      setProjects((data.data.projects || []).map(formatProject));
      toast.success("All changes saved.");
    } catch (error) {
      console.error("Save projects:", error);
      toast.error(
        error.response?.data?.message || error.message || "Save failed.",
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete a project
  async function deleteProject(project) {
    if (!project._id) {
      setProjects((prev) =>
        prev.filter((p) => p.clientKey !== project.clientKey),
      );
      return;
    }

    if (projects.length <= 1) {
      toast.error("Keep at least one project.");
      return;
    }

    setDeleting(true);

    try {
      await axios.delete(API, { params: { id: project._id } });
      setProjects((prev) =>
        prev.filter((p) => p.clientKey !== project.clientKey),
      );
      toast.success("Project deleted.");
    } catch (error) {
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
          onClick={loadData}
          className="mt-4 rounded-xl bg-[#1E8A8A] px-5 py-3 text-sm font-semibold text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
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
        <LanguageSelector
          language={language}
          setLanguage={setLanguage}
          disabled={busy}
        />
      </div>

      <div className="space-y-8">
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
                    value={header[field.name]?.[language] || ""}
                    onChange={(e) => updateHeader(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                ) : (
                  <input
                    value={
                      field.shared
                        ? header[field.name] || ""
                        : header[field.name]?.[language] || ""
                    }
                    onChange={(e) => updateHeader(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-6">
            <span className="rounded-lg bg-[var(--surface)] px-3 py-1 text-xs font-bold">
              {header.badgeText?.[language] || "PROUD PROJECTS"}
            </span>
            <p className="mt-3 text-2xl text-[var(--foreground)]">
              {header.headingLine?.[language] || "Breaking Boundaries,"}
              <br />
              <span className="text-[#1E8A8A]">
                {header.highlightWord?.[language] || "Dreams."}
              </span>
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {header.description?.[language] || "Section description preview"}
            </p>
          </div>
        </section>

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
                onChange={updateProject}
                onMove={moveProject}
                onDelete={deleteProject}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => setProjects((prev) => [...prev, newProject()])}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] py-4 text-sm font-semibold text-[var(--muted)] hover:border-[#1E8A8A] hover:text-[#1E8A8A]"
          >
            <Plus size={18} /> Add New Large Project
          </button>

          <footer className="sticky bottom-4 z-10 mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-[#111B27]/95">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                Ready to save your changes?
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Save the header and all projects together.
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
  );
}
