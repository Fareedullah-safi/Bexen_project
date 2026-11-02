"use client";

import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mainNav, setMainNav] = useState([]);
  const [data, setData] = useState({
    title: "",
    slug: "",
    showInNav: false,
    navParent: "none", // Default to top-level main tab
    showInFooter: false,
  });

  // Fetch main navbar items
  useEffect(() => {
    async function loadMainNav() {
      try {
        const res = await axios.get("/api/navbar");
        const items =
          res.data?.items || (Array.isArray(res.data) ? res.data : []);
        setMainNav(items);
      } catch {
        toast.error("Could not load main navbar items.");
      }
    }
    loadMainNav();
  }, []);

  const onTitleChange = (value) => {
    const autoSlug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setData((prev) => ({ ...prev, title: value, slug: autoSlug }));
  };

  const handleCreate = async () => {
    if (!data.title.trim() || !data.slug.trim()) {
      return toast.error("Page name and link are required.");
    }

    setLoading(true);
    try {
      const checkRes = await axios.get(
        `/api/admin/pages/check-route?slug=${encodeURIComponent(data.slug)}`,
      );
      if (!checkRes.data?.available) {
        setLoading(false);
        return toast.error(
          checkRes.data?.message || "This link is already used.",
        );
      }

      const createRes = await axios.post("/api/admin/pages", {
        title: data.title.trim(),
        slug: data.slug.trim(),
        showInNav: data.showInNav,
        navParent: data.showInNav ? data.navParent : "none",
        showInFooter: data.showInFooter,
        status: "published", // Default to published so it shows on site immediately
        blocks: [],
      });

      const page = createRes.data?.page || createRes.data;
      toast.success("Page created successfully!");
      router.push(`/admin/pages/${page._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create page.");
      setLoading(false);
    }
  };

  const getNavLabel = (item) => {
    return (
      item?.translations?.en?.label ||
      item?.translations?.fa?.label ||
      item?.translations?.ps?.label ||
      item?.id ||
      "Main Nav"
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl bg-[var(--background)] p-6 text-[var(--text-main)]">
      <Link
        href="/admin/pages"
        className="mb-6 flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]"
      >
        <ArrowLeft size={16} /> Back to Pages
      </Link>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Setup New Page</h1>

        <div className="space-y-5">
          {/* Page Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">Page name</label>
            <input
              value={data.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="e.g. Main"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 outline-none focus:border-[var(--accent)]"
            />
          </div>

          {/* Page Link */}
          <div>
            <label className="mb-1 block text-sm font-medium">Page link</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-muted)]">/</span>
              <input
                dir="ltr"
                value={data.slug}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                placeholder="main"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 outline-none focus:border-[var(--accent)]"
              />
            </div>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Live URL: <strong>/{data.slug || "..."}</strong>
            </p>
          </div>

          {/* Navbar Options */}
          <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              <input
                type="checkbox"
                checked={data.showInNav}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    showInNav: e.target.checked,
                    navParent: "none",
                  }))
                }
                className="h-4 w-4"
              />
              Show in Navbar
            </label>

            {data.showInNav && (
              <div className="border-t border-[var(--border)] pt-3">
                <label className="mb-1 block text-sm font-medium">
                  Navbar Placement
                </label>
                <select
                  value={data.navParent}
                  onChange={(e) =>
                    setData((prev) => ({ ...prev, navParent: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
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
                checked={data.showInFooter}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    showInFooter: e.target.checked,
                  }))
                }
                className="h-4 w-4"
              />
              Also show in Footer
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-[var(--accent)] py-3 font-bold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create & Start Building"}
        </button>
      </div>
    </div>
  );
}
