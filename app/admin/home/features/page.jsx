/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Link, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/app/admin/Components/Admin/Spinner";

function IconPicker({ icon, onChange }) {
  const fileRef = useRef(null);

  const chooseFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange({
      mode: "file",
      file,
      preview: URL.createObjectURL(file),
      url: "",
      publicId: "",
    });
  };

  const changeUrl = (e) => {
    const value = e.target.value;
    onChange({
      mode: "url",
      file: null,
      preview: value.trim(),
      url: value,
      publicId: "",
    });
  };

  const switchMode = (mode) => {
    if (fileRef.current) fileRef.current.value = "";
    onChange({ mode, file: null, preview: "", url: "", publicId: "" });
  };

  const clearIcon = () => {
    if (fileRef.current) fileRef.current.value = "";
    onChange({ mode: "file", file: null, preview: "", url: "", publicId: "" });
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
        Icon
      </label>
      <div className="flex w-full rounded-xl border border-[var(--border)] p-1">
        <button
          type="button"
          onClick={() => switchMode("file")}
          className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition ${
            icon.mode === "file"
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--accent)]"
          }`}
        >
          <ImagePlus size={14} />
          From PC
        </button>
        <button
          type="button"
          onClick={() => switchMode("url")}
          className={`flex h-9 flex-1 items-center justify-center gap-2 rounded-lg text-xs font-semibold transition ${
            icon.mode === "url"
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--muted)] hover:text-[var(--accent)]"
          }`}
        >
          <Link size={14} />
          URL
        </button>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
          {icon.preview ? (
            <img
              src={icon.preview}
              alt="Icon preview"
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <ImagePlus size={22} className="text-[var(--accent)]" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {icon.mode === "file" ? (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={chooseFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="h-11 w-full rounded-xl border border-[var(--border)] text-sm font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {icon.file ? "Change Icon" : "Choose Icon"}
              </button>
              {icon.file && (
                <p className="mt-1 truncate text-xs text-[var(--muted)]">
                  {icon.file.name}
                </p>
              )}
            </>
          ) : (
            <input
              type="url"
              value={icon.url}
              onChange={changeUrl}
              placeholder="https://example.com/icon.svg"
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          )}
        </div>
        {icon.preview && (
          <button
            type="button"
            onClick={clearIcon}
            className="rounded-lg border border-red-500/20 p-2 text-red-500 transition hover:bg-red-500/10"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

const createEmptyIcon = () => ({
  mode: "file",
  file: null,
  preview: "",
  url: "",
  publicId: "",
});

const createEmptyCard = () => ({
  title: "",
  description: "",
  icon: createEmptyIcon(),
});

const normalizeFormData = (data) => ({
  tagline: data?.tagline || "",
  title: data?.title || "",
  cards: (data?.cards || []).map((card) => {
    const { url = "", publicId = "" } = card.icon || {};
    return {
      title: card.title || "",
      description: card.description || "",
      icon: { mode: "url", file: null, preview: url, url, publicId },
    };
  }),
});

export default function Features() {
  const [form, setForm] = useState({ tagline: "", title: "", cards: [] });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/api/homepage/features", {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok)
          throw new Error(result?.error || "Failed to load data");
        if (result?.data) setForm(normalizeFormData(result.data));
      } catch (error) {
        console.error(error);
        toast.error(error.message || "Failed to load features data");
      } finally {
        setFetching(false);
      }
    };
    loadData();
  }, []);

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const setCard = (index, name, value) => {
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.map((card, i) =>
        i === index ? { ...card, [name]: value } : card,
      ),
    }));
  };

  const addCard = () => {
    setForm((prev) => ({
      ...prev,
      cards: [...prev.cards, createEmptyCard()],
    }));
  };

  const removeCard = (index) => {
    setForm((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tagline", form.tagline.trim());
      formData.append("title", form.title.trim());

      const cards = form.cards.map((card, index) => {
        if (card.icon.mode === "file" && card.icon.file) {
          formData.append(`icon_${index}`, card.icon.file);
        }
        return {
          title: card.title.trim(),
          description: card.description.trim(),
          iconMode: card.icon.mode,
          iconUrl: card.icon.mode === "url" ? card.icon.url.trim() : "",
          iconPublicId:
            card.icon.mode === "url" ? card.icon.publicId || "" : "",
        };
      });

      formData.append("cards", JSON.stringify(cards));

      const response = await fetch("/api/homepage/features", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.error || "Failed to save features");
      if (result?.data) setForm(normalizeFormData(result.data));

      toast.success("Changes saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-6">
        <p className="text-sm font-semibold text-[var(--accent)]">Home Page</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl lg:text-4xl">
          Features
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Edit the heading and the feature cards.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <h2 className="font-bold">Section Heading</h2>
        <p className="mt-1 text-xs text-[var(--muted)]">
          The small text and big title above the cards.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Tagline
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setField("tagline", e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">
              Heading
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField("title", e.target.value)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold">Feature Cards</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {form.cards.length} cards
            </p>
          </div>

          <button
            type="button"
            onClick={addCard}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 text-xs font-semibold transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <Plus size={14} />
            Add Card
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {form.cards.map((card, index) => (
            <div
              key={index}
              className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Card {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeCard(index)}
                  className="rounded-lg border border-red-500/20 p-1.5 text-red-500 transition hover:bg-red-500/10"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3 space-y-4">
                <IconPicker
                  icon={card.icon}
                  onChange={(icon) => setCard(index, "icon", icon)}
                />
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                    Title
                  </label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => setCard(index, "title", e.target.value)}
                    placeholder="Card title"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-[var(--muted)]">
                    Description
                  </label>
                  <textarea
                    rows={5}
                    value={card.description}
                    onChange={(e) =>
                      setCard(index, "description", e.target.value)
                    }
                    placeholder="Card description"
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm outline-none focus:border-[var(--accent)]"
                  />
                </div>
              </div>
            </div>
          ))}

          {form.cards.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-[var(--muted)]">
              No cards yet. Click &quot;Add Card&quot; to create one.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-8 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner size={16} />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
