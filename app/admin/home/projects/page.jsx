import {
  FolderKanban,
  Plus,
  Save,
  Trash2,
  Upload,
  ImagePlus,
  ArrowUp,
  ArrowDown,
  Link as LinkIcon,
  Info,
} from "lucide-react";

export default function ProjectsAdmin() {
  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm text-[#0C1E21] outline-none transition placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#0C1E21] dark:text-gray-200";

  return (
    <div className="w-full">
      {/* Page Header */}
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
        {/* ====================================================== */}
        {/* SECTION 01 — Header & Text Content (Single Record)    */}
        {/* ====================================================== */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6 flex items-center justify-between">
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
            <div>
              <label className={labelClass}>Badge Text</label>
              <input placeholder="PROUD PROJECTS" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Heading Line</label>
              <input
                placeholder="Breaking Boundaries,"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Highlight Word</label>
              <input placeholder="Dreams." className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea
                rows={3}
                placeholder="We work closely with our clients to understand their unique needs..."
                className={`${inputClass} resize-y`}
              />
            </div>

            <div>
              <label className={labelClass}>Button Text</label>
              <input placeholder="More Projects" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Button Link</label>
              <input placeholder="/projects" className={inputClass} />
            </div>
          </div>

          {/* Header Preview */}
          <div className="mt-6 rounded-2xl bg-[#ECF0F0] p-6 text-[#102326] dark:bg-[#0C1E21] dark:text-white">
            <span className="inline-flex items-center gap-1.5 bg-[#ECF0F0] px-3 py-1 text-xs font-bold text-zinc-950 dark:bg-[#111b1d] dark:text-white">
              PROUD PROJECTS
            </span>
            <p className="mt-3 text-2xl leading-tight font-medium">
              Breaking Boundaries,
              <br />
              Building <span className="text-[#1E8A8A]">Dreams.</span>
            </p>
            <p className="mt-2 max-w-lg text-sm text-zinc-600 dark:text-gray-400">
              We work closely with our clients to understand their unique needs
              and craft tailored solutions that address challenges.
            </p>
          </div>

          {/* Change Button for Header */}
          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="button"
              className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777]"
            >
              <Save size={18} />
              Change Section Header
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SECTION 02 — Large Projects Box (Unlimited Entries)   */}
        {/* ====================================================== */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                02
              </span>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Large Projects
              </h2>
            </div>

            <span className="w-fit rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              Large Card (flex-1.7)
            </span>
          </div>

          <div className="space-y-6">
            {/* ---------- Single Large Card Template ---------- */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0C1E21]">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
                    01
                  </span>
                  <div>
                    <p className="truncate text-base font-bold text-[#0C1E21] dark:text-white">
                      Event Management Platform
                    </p>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Tag: Large
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    title="Move up"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                  >
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    title="Move down"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                  >
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    title="Delete project"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white dark:bg-[#111b1d]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Tag / Category</label>
                    <input
                      placeholder="e.g. Connect, Business"
                      className={`${inputClass} !bg-white dark:!bg-[#111b1d]`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Project Title</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Event Management Platform"
                      className={`${inputClass} resize-y !bg-white dark:!bg-[#111b1d]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Large Cover Image</label>

                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111b1d]">
                    <div className="flex h-44 flex-col items-center justify-center bg-gray-50 text-gray-400 dark:bg-[#0C1E21]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
                        <ImagePlus size={24} />
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#0C1E21] dark:text-white">
                        No large image selected
                      </p>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="relative">
                        <LinkIcon
                          size={15}
                          className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="url"
                          placeholder="Paste large image URL..."
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-xs text-[#0C1E21] transition outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                        <span className="text-[10px] font-bold tracking-wider text-gray-400">
                          OR
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                      </div>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E8A8A] dark:bg-white/10 dark:hover:bg-[#1E8A8A]"
                      >
                        <Upload size={14} />
                        Upload Large Image
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    Recommended: 999 × 666 — Large Display
                  </p>
                </div>
              </div>
            </div>
            {/* ---------- End Large Card Template ---------- */}
          </div>

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/15 dark:text-gray-400"
          >
            <Plus size={18} />
            Add New Large Project
          </button>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777] sm:w-auto"
            >
              <Save size={18} />
              Save Large Projects
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* SECTION 03 — Mini Projects Box (Unlimited Entries)    */}
        {/* ====================================================== */}
        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8 dark:border-white/10 dark:bg-[#111b1d]">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E8A8A]/10 text-sm font-bold text-[#1E8A8A]">
                03
              </span>
              <h2 className="text-lg font-bold text-[#0C1E21] dark:text-white">
                Mini Projects
              </h2>
            </div>

            <span className="w-fit rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
              Mini Card (flex-1)
            </span>
          </div>

          <div className="space-y-6">
            {/* ---------- Single Mini Card Template ---------- */}
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-5 sm:p-6 dark:border-white/10 dark:bg-[#0C1E21]">
              <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-white/10">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E8A8A] text-sm font-bold text-white">
                    01
                  </span>
                  <div>
                    <p className="truncate text-base font-bold text-[#0C1E21] dark:text-white">
                      Digital Marketing Campaign
                    </p>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Tag: Mini
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    title="Move up"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                  >
                    <ArrowUp size={16} />
                  </button>

                  <button
                    type="button"
                    title="Move down"
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/10 dark:bg-[#111b1d] dark:text-gray-400"
                  >
                    <ArrowDown size={16} />
                  </button>

                  <button
                    type="button"
                    title="Delete project"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white dark:bg-[#111b1d]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Tag / Category</label>
                    <input
                      placeholder="e.g. Empower, Support"
                      className={`${inputClass} !bg-white dark:!bg-[#111b1d]`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Project Title</label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Digital Marketing Campaign"
                      className={`${inputClass} resize-y !bg-white dark:!bg-[#111b1d]`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Mini Cover Image</label>

                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-[#111b1d]">
                    <div className="flex h-44 flex-col items-center justify-center bg-gray-50 text-gray-400 dark:bg-[#0C1E21]">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1E8A8A]/10 text-[#1E8A8A]">
                        <ImagePlus size={24} />
                      </div>
                      <p className="mt-2 text-xs font-medium text-[#0C1E21] dark:text-white">
                        No mini image selected
                      </p>
                    </div>

                    <div className="space-y-3 p-4">
                      <div className="relative">
                        <LinkIcon
                          size={15}
                          className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400"
                        />
                        <input
                          type="url"
                          placeholder="Paste mini image URL..."
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pr-4 pl-10 text-xs text-[#0C1E21] transition outline-none placeholder:text-gray-400 focus:border-[#1E8A8A] focus:ring-4 focus:ring-[#1E8A8A]/10 dark:border-white/10 dark:bg-[#0C1E21] dark:text-white"
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                        <span className="text-[10px] font-bold tracking-wider text-gray-400">
                          OR
                        </span>
                        <div className="h-px flex-1 bg-gray-200 dark:bg-white/10" />
                      </div>

                      <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C1E21] py-2.5 text-xs font-semibold text-white transition hover:bg-[#1E8A8A] dark:bg-white/10 dark:hover:bg-[#1E8A8A]"
                      >
                        <Upload size={14} />
                        Upload Mini Image
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <Info size={13} className="mt-0.5 shrink-0" />
                    Recommended: 600 × 400 — Compact Display
                  </p>
                </div>
              </div>
            </div>
            {/* ---------- End Mini Card Template ---------- */}
          </div>

          <button
            type="button"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-sm font-semibold text-gray-500 transition hover:border-[#1E8A8A] hover:text-[#1E8A8A] dark:border-white/15 dark:text-gray-400"
          >
            <Plus size={18} />
            Add New Mini Project
          </button>

          <div className="mt-6 flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E8A8A] px-8 text-sm font-semibold text-white shadow-sm transition hover:bg-[#167777] sm:w-auto"
            >
              <Save size={18} />
              Save Mini Projects
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
