"use client";
import Spinner from "@/app/Components/Admin/Spinner";
import axios from "axios";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  async function loadPages() {
    try {
      const { data } = await axios.get("/api/admin/pages");
      setPages(Array.isArray(data) ? data : data.pages || []);
    } catch {
      toast.error("Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this page completely?")) return;
    try {
      await axios.delete(`/api/admin/pages/${id}`);
      toast.success("Page deleted.");
      loadPages();
    } catch {
      toast.error("Delete failed.");
    }
  }

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
              Manage your website pages.
            </p>
          </div>
        </div>
        <Link
          href="/admin/pages/create"
          className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          <Plus size={16} /> New Page
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        {pages.length === 0 ? (
          <div className="p-12 text-center text-[var(--text-muted)]">
            No pages yet.
          </div>
        ) : (
          pages.map((page) => (
            <div
              key={page._id}
              className="flex items-center justify-between border-b border-[var(--border)] p-4 hover:bg-[var(--background)]"
            >
              <div>
                <div className="font-semibold">{page.title}</div>
                <div className="text-xs text-[var(--text-muted)]">
                  /{page.slug} · {page.blocks?.length || 0} blocks ·{" "}
                  <span
                    className={
                      page.status === "published"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }
                  >
                    {page.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/pages/${page._id}`}
                  className="rounded-lg bg-[var(--background)] p-2 hover:bg-[var(--border)]"
                >
                  <Edit size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(page._id)}
                  className="rounded-lg bg-red-500/10 p-2 text-red-500 hover:bg-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
