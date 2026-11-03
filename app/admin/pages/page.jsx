"use client";

import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import {
  Check,
  Edit,
  FileText,
  LoaderCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [mainNav, setMainNav] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Edit states
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editShowInNav, setEditShowInNav] = useState(false);
  const [editNavParent, setEditNavParent] = useState("none");
  const [editShowInFooter, setEditShowInFooter] = useState(false);
  const [saving, setSaving] = useState(false);
  const [originalSlug, setOriginalSlug] = useState("");

  useEffect(() => {
    loadPages();
    loadMainNav();
  }, []);

  async function loadPages() {
    try {
      const { data } = await axios.get("/api/admin/pages");
      setPages(Array.isArray(data) ? data : data.pages || []);
    } catch {
      toast.error("Failed to load pages.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMainNav() {
    try {
      const res = await axios.get("/api/navbar");
      const items =
        res.data?.items || (Array.isArray(res.data) ? res.data : []);
      setMainNav(items);
    } catch {
      console.error("Could not load main navbar items.");
    }
  }

  const getNavLabel = (item) => {
    return (
      item?.translations?.en?.label ||
      item?.translations?.fa?.label ||
      item?.translations?.ps?.label ||
      item?.id ||
      "Main Nav"
    );
  };

  function startEdit(page) {
    setEditId(page._id);
    setEditTitle(page.title || "");
    setEditSlug(page.slug || "");
    setOriginalSlug(page.slug || "");
    setEditShowInNav(page.showInNav || false);
    setEditNavParent(page.navParent || "none");
    setEditShowInFooter(page.showInFooter || false);
  }

  function cancelEdit() {
    setEditId(null);
    setEditTitle("");
    setEditSlug("");
    setOriginalSlug("");
    setEditShowInNav(false);
    setEditNavParent("none");
    setEditShowInFooter(false);
  }

  // Title change → auto-write slug
  function onTitleChange(value) {
    setEditTitle(value);
    setEditSlug(makeSlug(value));
  }

  async function saveEdit(id) {
    const title = editTitle.trim();
    const slug = makeSlug(editSlug);

    if (!title || !slug) {
      toast.error("Page name and route are required.");
      return;
    }

    setSaving(true);
    try {
      // Only check route if it actually changed
      if (slug !== originalSlug) {
        const checkRes = await axios.get(
          `/api/admin/pages/check-route?slug=${encodeURIComponent(slug)}`,
        );
        if (!checkRes.data?.available) {
          toast.error(
            checkRes.data?.message ||
              "This route is already used in a page or navbar.",
          );
          setSaving(false);
          return;
        }
      }

      await axios.put(`/api/admin/pages/${id}`, {
        title,
        slug,
        showInNav: editShowInNav,
        navParent: editShowInNav ? editNavParent : "none",
        showInFooter: editShowInFooter,
      });
      toast.success("Page updated successfully.");
      setEditId(null);
      loadPages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update page.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this page completely?")) return;
    if (deletingId) return;

    setDeletingId(id);
    try {
      const { data } = await axios.delete(`/api/admin/pages/${id}`);
      toast.success(
        data?.deletedImages
          ? `Page deleted (${data.deletedImages} images removed).`
          : "Page deleted.",
      );
      if (editId === id) cancelEdit();
      await loadPages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
      // Refresh anyway in case server deleted but returned error afterwards
      await loadPages();
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors";
  const labelClass =
    "mb-1.5 block text-xs font-medium text-[var(--text-muted)]";

  if (loading)
    return (
      <div className="flex min-h-96 items-center justify-center">
        <Spinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 text-[var(--text-main)]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-[var(--accent)]">
            <FileText size={23} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pages</h1>
            <p className="text-sm text-[var(--text-muted)]">
              Manage your website pages and routes.
            </p>
          </div>
        </div>
        <Link
          href="/admin/pages/create"
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            No pages yet. Click "New Page" to start building.
          </div>
        ) : (
          pages.map((page) => {
            const isEditing = editId === page._id;
            const isDeleting = deletingId === page._id;

            return (
              <div
                key={page._id}
                className="flex flex-col gap-4 border-b border-[var(--border)] p-4 transition-colors hover:bg-[var(--background)] sm:flex-row sm:items-start sm:justify-between"
              >
                {isEditing ? (
                  <div className="flex w-full flex-col gap-4">
                    {/* Title + auto slug */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass}>Page name</label>
                        <input
                          value={editTitle}
                          onChange={(e) => onTitleChange(e.target.value)}
                          className={inputClass}
                          placeholder="e.g. About Us"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>Route (auto)</label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[var(--text-muted)]">
                            /
                          </span>
                          <input
                            dir="ltr"
                            value={editSlug}
                            onChange={(e) =>
                              setEditSlug(makeSlug(e.target.value))
                            }
                            className={inputClass}
                            placeholder="about-us"
                          />
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          Live URL: <strong>/{editSlug || "..."}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Navbar / Footer options */}
                    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                        <input
                          type="checkbox"
                          checked={editShowInNav}
                          onChange={(e) => {
                            setEditShowInNav(e.target.checked);
                            if (!e.target.checked) setEditNavParent("none");
                          }}
                          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                        />
                        Show in Navbar
                      </label>

                      {editShowInNav && (
                        <div className="border-t border-[var(--border)] pt-3">
                          <label className="mb-1 block text-sm font-medium">
                            Navbar Placement
                          </label>
                          <select
                            value={editNavParent}
                            onChange={(e) => setEditNavParent(e.target.value)}
                            className={inputClass}
                          >
                            <option value="none">
                              Main Top-Level Tab (Homepage Navbar)
                            </option>
                            {mainNav.map((item) => (
                              <option key={item.id} value={item.id}>
                                Dropdown Child under "{getNavLabel(item)}"
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={editShowInFooter}
                          onChange={(e) =>
                            setEditShowInFooter(e.target.checked)
                          }
                          className="h-4 w-4 cursor-pointer accent-[var(--accent)]"
                        />
                        Also show in Footer
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="text-base font-semibold">{page.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-muted)]">
                      <span>/{page.slug}</span>
                      <span>•</span>
                      <span>{page.blocks?.length || 0} blocks</span>
                      <span>•</span>
                      <span
                        className={
                          page.status === "published"
                            ? "font-medium text-emerald-500"
                            : "font-medium text-amber-500"
                        }
                      >
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>
                      {(page.showInNav || page.showInFooter) && (
                        <>
                          <span>•</span>
                          <span className="text-[var(--accent)]">
                            Shows in:{" "}
                            {[
                              page.showInNav &&
                                (page.navParent === "none"
                                  ? "Main Navbar"
                                  : "Navbar Dropdown"),
                              page.showInFooter && "Footer",
                            ]
                              .filter(Boolean)
                              .join(" & ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-start gap-2 sm:mt-0">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => saveEdit(page._id)}
                        disabled={saving}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-500 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Save Changes"
                      >
                        <Check size={16} /> {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={saving}
                        className="cursor-pointer rounded-lg bg-[var(--background)] p-2 transition-colors hover:bg-[var(--border)] disabled:opacity-50"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(page)}
                        className="cursor-pointer rounded-lg bg-[var(--background)] p-2 transition-colors hover:bg-[var(--border)]"
                        title="Edit Page Settings"
                      >
                        <Edit size={16} />
                      </button>
                      <Link
                        href={`/admin/pages/${page._id}`}
                        className="cursor-pointer rounded-lg bg-[var(--accent)]/10 p-2 text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
                        title="Edit Page Content (Blocks)"
                      >
                        <FileText size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(page._id)}
                        disabled={isDeleting}
                        className="cursor-pointer rounded-lg bg-red-500/10 p-2 text-red-500 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete Page"
                      >
                        {isDeleting ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
