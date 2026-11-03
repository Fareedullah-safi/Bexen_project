"use client";

import AdminLanguageBall from "@/app/Components/Admin/AdminLanguageBall";
import Spinner from "@/app/Components/Admin/Spinner";
import { BLOCKS_LIST, BLOCK_REGISTRY } from "@/Lib/PageBuilder/blocks";
import axios from "axios";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const languages = [
  { code: "en", label: "English" },
  { code: "fa", label: "دری (Dari)" },
  { code: "ps", label: "پښتو (Pashto)" },
];

// Safe clone helper that NEVER throws JSON SyntaxError
const cloneData = (data) => {
  if (!data) return {};
  try {
    if (typeof structuredClone === "function") {
      return structuredClone(data);
    }
    return JSON.parse(JSON.stringify(data));
  } catch (err) {
    console.error("Failed to deep clone block defaultData:", err);
    return {};
  }
};

// Helper: Deeply extract EVERY publicId from ANY block data structure
const extractPublicIds = (obj, acc = []) => {
  if (!obj || typeof obj !== "object") return acc;

  if (Array.isArray(obj)) {
    for (const item of obj) extractPublicIds(item, acc);
  } else {
    for (const [key, value] of Object.entries(obj)) {
      if (
        (key === "publicId" || key === "public_id") &&
        typeof value === "string" &&
        value.trim()
      ) {
        acc.push(value.trim());
      } else if (typeof value === "object" && value !== null) {
        extractPublicIds(value, acc);
      }
    }
  }
  return acc;
};

export default function FlatEditorPage() {
  const { id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("en");
  const [saving, setSaving] = useState(false);
  const [showBlockPicker, setShowBlockPicker] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!document.querySelector("script[data-cloudinary-widget]")) {
      const s = document.createElement("script");
      s.src = "https://upload-widget.cloudinary.com/global/all.js";
      s.async = true;
      document.head.appendChild(s);
    }

    axios
      .get(`/api/admin/pages/${id}`)
      .then((res) => {
        const rawPage = res.data.page || res.data;
        setFormData({
          ...rawPage,
          blocks: rawPage?.blocks || [],
        });
      })
      .catch(() => {
        toast.error("Failed to load page");
        router.push("/admin/pages");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  // Bulletproof addBlock handler
  const addBlock = (type) => {
    const block = BLOCK_REGISTRY?.[type];

    if (!block) {
      toast.error(`Block type "${type}" is not registered.`);
      return;
    }

    const currentBlocks = formData?.blocks || [];
    const defaultData = block.defaultData ?? {};

    const newBlock = {
      blockId:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      order: currentBlocks.length,
      data: cloneData(defaultData),
    };

    setFormData((prev) => ({
      ...prev,
      blocks: [...(prev?.blocks || []), newBlock],
    }));
    setShowBlockPicker(false);
  };

  const updateBlock = (blockId, newData) =>
    setFormData((prev) => ({
      ...prev,
      blocks: (prev?.blocks || []).map((b) =>
        b.blockId === blockId ? { ...b, data: newData } : b,
      ),
    }));

  // REMOVE BLOCK & AUTOMATICALLY DESTROY ITS IMAGES ON CLOUDINARY
  const removeBlock = async (blockId) => {
    const blockToRemove = (formData?.blocks || []).find(
      (b) => b.blockId === blockId,
    );

    // 1. Destroy all Cloudinary images inside this block template
    if (blockToRemove) {
      const publicIds = [...new Set(extractPublicIds(blockToRemove.data))];

      for (const publicId of publicIds) {
        try {
          await axios.post("/api/admin/cloudinary/delete", { publicId });
          console.log("Destroyed Cloudinary image on block delete:", publicId);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      }
    }

    // 2. Remove block template from state
    setFormData((prev) => ({
      ...prev,
      blocks: (prev?.blocks || []).filter((b) => b.blockId !== blockId),
    }));

    toast.success("Block template & Cloudinary images removed!");
  };

  const moveBlock = (idx, dir) => {
    const blocks = [...(formData?.blocks || [])];
    const target = idx + dir;
    if (target < 0 || target >= blocks.length) return;
    [blocks[idx], blocks[target]] = [blocks[target], blocks[idx]];
    blocks.forEach((b, i) => (b.order = i));
    setFormData({ ...formData, blocks });
  };

  const handleSave = async (status) => {
    const blocksList = formData?.blocks || [];

    // VALIDATION: Block publishing if there are no templates/blocks
    if (status === "published" && blocksList.length === 0) {
      return toast.error(
        "Cannot publish an empty page. Please add at least one block template.",
      );
    }

    setSaving(true);
    try {
      await axios.put(`/api/admin/pages/${id}`, { ...formData, status });
      toast.success(
        status === "published" ? "Published Live!" : "Saved as Draft",
      );
      if (status === "published") router.push("/admin/pages");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleReload = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/admin/pages/${id}`);
      const rawPage = res.data.page || res.data;
      setFormData({
        ...rawPage,
        blocks: rawPage?.blocks || [],
      });
      toast.success("Reloaded saved data");
    } catch {
      toast.error("Failed to reload");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center bg-[var(--background)]">
        <Spinner />
      </div>
    );
  }

  if (!formData) return null;

  const blocks = formData.blocks || [];

  const pageClass = isDark
    ? "bg-[#0b1117] text-[#f2f4f7]"
    : "bg-[#f7f9fc] text-[#101828]";

  const cardClass = isDark
    ? "border-[#263442] bg-[#111a23]"
    : "border-[#e4e7ec] bg-white";

  const labelClass = `mb-2 block text-sm font-medium ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;

  const mutedTextClass = isDark ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`min-h-screen p-2 ${pageClass}`}>
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/admin/pages"
              className={`mb-4 flex w-fit items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? "border-[#263442] bg-[#111a23] text-gray-300 hover:bg-[#263442]"
                  : "border-[#e4e7ec] bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ArrowLeft size={14} /> Back to Pages
            </Link>

            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#35B5B5] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#1E8A8A]" />
              Page Builder
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">{formData.title}</h1>
            <p className={`mt-2 font-mono text-sm ${mutedTextClass}`}>
              /{formData.slug}
            </p>
          </div>

          {/* Language tabs + ball */}
          <div className="min-w-0 sm:min-w-[320px]">
            <label className={`${labelClass} mb-3`}>Content Language</label>

            <div className="flex items-center gap-3">
              <div
                className="inline-flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-[#1E8A8A]/20 bg-[#1E8A8A]/5 p-1.5 shadow-sm"
                role="group"
              >
                {languages.map((item) => {
                  const isActive = activeTab === item.code;
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => setActiveTab(item.code)}
                      disabled={saving}
                      className={`relative flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive
                          ? "bg-[#1E8A8A] text-white shadow-md shadow-[#1E8A8A]/20"
                          : isDark
                            ? "text-gray-400 hover:bg-[#1E8A8A]/15 hover:text-[#35B5B5]"
                            : "text-gray-600 hover:bg-[#1E8A8A]/10 hover:text-[#1E8A8A]"
                      }`}
                    >
                      {item.code === "en"
                        ? "English"
                        : item.code === "fa"
                          ? "دری"
                          : "پښتو"}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Working language ball */}
              <AdminLanguageBall
                language={activeTab}
                onLanguageChange={setActiveTab}
              />
            </div>

            <p className={`mt-2 text-xs ${mutedTextClass}`}>
              Select a language to edit block content.
            </p>
          </div>
        </header>

        {/* BLOCKS */}
        <div className="space-y-6 pb-28">
          {blocks.length === 0 ? (
            <div
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 text-center ${
                isDark
                  ? "border-[#263442] bg-[#111a23]/50"
                  : "border-[#e4e7ec] bg-white/50"
              }`}
            >
              <div className="mb-3 rounded-full bg-[#1E8A8A]/15 p-4 text-[#35B5B5]">
                <LayoutTemplate size={28} />
              </div>
              <h3 className="text-base font-bold">No blocks yet</h3>
              <p className={`mt-1 mb-5 text-sm ${mutedTextClass}`}>
                Start building your page by adding a block template.
              </p>
              <button
                onClick={() => setShowBlockPicker(true)}
                className="flex items-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#249b98]"
              >
                <Plus size={16} /> Add First Block
              </button>
            </div>
          ) : (
            blocks.map((block, index) => {
              const BlockDef = BLOCK_REGISTRY?.[block.type];
              if (!BlockDef) return null;
              const AdminForm = BlockDef.AdminForm;

              return (
                <section
                  key={block.blockId || index}
                  className={`overflow-hidden rounded-2xl border shadow-xl ${cardClass}`}
                >
                  <div
                    className={`flex items-center justify-between border-b px-5 py-4 sm:px-7 ${
                      isDark ? "border-[#263442]" : "border-[#e4e7ec]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${
                          isDark
                            ? "border-[#263442] bg-[#16212c]"
                            : "border-[#e4e7ec] bg-[#f8fafc]"
                        }`}
                      >
                        {BlockDef.icon}
                      </span>
                      <div>
                        <h2 className="font-semibold">{BlockDef.name}</h2>
                        <p className={`mt-0.5 text-xs ${mutedTextClass}`}>
                          Block {index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveBlock(index, -1)}
                        disabled={index === 0}
                        className={`rounded-lg p-2 transition disabled:opacity-30 ${
                          isDark ? "hover:bg-[#263442]" : "hover:bg-gray-100"
                        }`}
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveBlock(index, 1)}
                        disabled={index === blocks.length - 1}
                        className={`rounded-lg p-2 transition disabled:opacity-30 ${
                          isDark ? "hover:bg-[#263442]" : "hover:bg-gray-100"
                        }`}
                      >
                        <ChevronDown size={16} />
                      </button>
                      <div
                        className={`mx-1 h-4 w-px ${
                          isDark ? "bg-[#263442]" : "bg-[#e4e7ec]"
                        }`}
                      />
                      <button
                        onClick={() => removeBlock(block.blockId)}
                        className="rounded-lg p-2 text-red-500 transition hover:bg-red-500/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 sm:p-7">
                    {AdminForm ? (
                      <AdminForm
                        data={block.data || {}}
                        lang={activeTab}
                        onChange={(newData) =>
                          updateBlock(block.blockId, newData)
                        }
                      />
                    ) : (
                      <div className="text-xs text-amber-400">
                        Admin editor component missing for block type:{" "}
                        {block.type}
                      </div>
                    )}
                  </div>
                </section>
              );
            })
          )}

          {blocks.length > 0 && (
            <button
              onClick={() => setShowBlockPicker(true)}
              className={`flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-5 text-sm font-bold transition-all hover:border-[#1E8A8A] hover:bg-[#1E8A8A]/5 hover:text-[#1E8A8A] ${
                isDark
                  ? "border-[#263442] bg-[#111a23]/50 text-gray-400"
                  : "border-[#e4e7ec] bg-white/50 text-gray-500"
              }`}
            >
              <Plus size={16} /> Add New Block
            </button>
          )}
        </div>

        {/* STICKY FOOTER */}
        <footer
          className={`sticky bottom-3 z-10 flex flex-col justify-between gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:px-6 ${
            isDark
              ? "border-[#263442] bg-[#111a23]/95"
              : "border-[#e4e7ec] bg-white/95"
          }`}
        >
          {/* LEFT SIDE: Reload Button */}
          <div>
            <button
              type="button"
              onClick={handleReload}
              disabled={saving}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium sm:w-auto ${
                isDark
                  ? "border-[#263442] text-gray-300 hover:bg-[#16212c]"
                  : "border-[#e4e7ec] text-gray-700 hover:bg-gray-50"
              }`}
            >
              <RotateCcw size={16} />
              Reload Saved Data
            </button>
          </div>

          {/* RIGHT SIDE: Save Draft & Publish Live Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className={`flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium disabled:opacity-60 ${
                isDark
                  ? "border-[#263442] text-gray-300 hover:bg-[#16212c]"
                  : "border-[#e4e7ec] text-gray-700 hover:bg-gray-50"
              }`}
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#1E8A8A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#249b98] disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save size={17} />
                  Publish Live
                </>
              )}
            </button>
          </div>
        </footer>

        {/* BLOCK PICKER OVERLAY */}
        {showBlockPicker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowBlockPicker(false)}
          >
            <div
              className={`animate-in fade-in zoom-in-95 w-full max-w-2xl rounded-2xl border p-6 shadow-2xl duration-200 ${cardClass}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">Block Library</h2>
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>
                    Select a template to add to your page
                  </p>
                </div>
                <button
                  onClick={() => setShowBlockPicker(false)}
                  className={`rounded-full border p-1.5 transition ${
                    isDark
                      ? "border-[#263442] hover:bg-[#263442]"
                      : "border-[#e4e7ec] hover:bg-gray-100"
                  }`}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(BLOCKS_LIST || []).map((b) => (
                  <button
                    key={b.type}
                    onClick={() => addBlock(b.type)}
                    className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all hover:border-[#1E8A8A] hover:shadow-md ${
                      isDark
                        ? "border-[#263442] bg-[#16212c]"
                        : "border-[#e4e7ec] bg-[#f8fafc]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-xl ${
                        isDark ? "border-[#263442]" : "border-[#e4e7ec]"
                      }`}
                    >
                      {b.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{b.name}</div>
                      <div
                        className={`mt-0.5 text-xs leading-relaxed ${mutedTextClass}`}
                      >
                        {b.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
