"use client";

import Spinner from "@/app/admin/Components/Admin/Spinner";
import axios from "axios";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Link as LinkIcon,
  LoaderCircle,
  Plus,
  Save,
  Tag,
  Trash2,
  Type,
  UserRound,
} from "lucide-react";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const API_URL = "/api/homepage/articles-section";

const months = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
];

const emptyPost = {
  day: "",
  month: "OCT",
  image: "",
  publicId: "",
  category: "",
  author: "Admin",
  title: "",
  link: "",
};

/* ---------- styles ---------- */

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100";
const labelClass =
  "mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200";
const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]";
const primaryBtn =
  "flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60";
const outlineBtn =
  "flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] hover:bg-[#e7f5f5] disabled:opacity-60 dark:hover:bg-[#162c32]";

/* ---------- small components ---------- */

function ErrorText({ children }) {
  return children ? (
    <p className="mt-1 text-xs text-red-500">{children}</p>
  ) : null;
}

function ImagePreview({ src, alt }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    return (
      <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 sm:w-64 dark:border-[#263442] dark:bg-[#16212c]">
        <div className="text-center">
          <ImagePlus size={24} className="mx-auto mb-2" />
          Image preview unavailable
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="h-36 w-full rounded-xl border border-gray-200 object-cover sm:w-64 dark:border-[#263442]"
    />
  );
}

function Field({ label, icon: Icon, error, className = "", ...props }) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {Icon && <Icon size={15} />}
        {label}
      </label>
      <input className={inputClass} {...props} />
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function SelectField({ label, icon: Icon, error, options, ...props }) {
  return (
    <div>
      <label className={labelClass}>
        {Icon && <Icon size={15} />}
        {label}
      </label>
      <select className={inputClass} {...props}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function ArticleFields({ data, onChange, errors }) {
  const bind = (name) => ({
    value: data[name],
    error: errors[name],
    onChange: (e) => onChange(name, e.target.value),
  });

  return (
    <>
      <Field
        label="Day"
        icon={CalendarDays}
        type="number"
        min="1"
        max="31"
        placeholder="24"
        {...bind("day")}
      />
      <SelectField
        label="Month"
        icon={CalendarDays}
        options={months}
        {...bind("month")}
      />
      <Field
        label="Category"
        icon={Tag}
        maxLength={40}
        placeholder="BUSINESS"
        {...bind("category")}
      />
      <Field
        label="Author"
        icon={UserRound}
        maxLength={60}
        placeholder="Admin"
        {...bind("author")}
      />
      <Field
        label="Article Title"
        icon={Type}
        maxLength={120}
        placeholder="Enter article title"
        className="sm:col-span-2"
        {...bind("title")}
      />
      <Field
        label="Article Link"
        icon={LinkIcon}
        placeholder="/blog/my-article or https://example.com/article"
        className="sm:col-span-2"
        {...bind("link")}
      />
    </>
  );
}

/* Confirmation popup shown before deleting */
function ConfirmDialog({ article, deleting, onCancel, onConfirm }) {
  if (!article) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !deleting && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#111a23]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold">Delete article?</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          “{article.title || "Untitled"}” will be permanently removed.
          {article._id ? " This cannot be undone." : ""}
        </p>

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60 dark:border-[#263442] dark:hover:bg-[#16212c]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {deleting && <LoaderCircle size={16} className="animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function validLink(value = "") {
  const link = value.trim();
  if (link.startsWith("/")) return !link.startsWith("//") && !/\s/.test(link);

  try {
    return ["http:", "https:"].includes(new URL(link).protocol);
  } catch {
    return false;
  }
}

function validatePost(post) {
  const errors = {};
  const title = post.title.trim();
  const day = Number(post.day);

  if (title.length < 3 || title.length > 120)
    errors.title = "Title must be 3–120 characters.";
  if (!/^https?:\/\//i.test(post.image || ""))
    errors.image = "Please upload an image.";
  if (!Number.isInteger(day) || day < 1 || day > 31)
    errors.day = "Enter a day from 1 to 31.";
  if (!months.includes(String(post.month).toUpperCase()))
    errors.month = "Select a valid month.";
  if (!post.category.trim() || post.category.trim().length > 40)
    errors.category = "Category is required (max 40 characters).";
  if (!post.author.trim() || post.author.trim().length > 60)
    errors.author = "Author is required (max 60 characters).";
  if (!validLink(post.link)) errors.link = "Enter a valid article link.";

  return errors;
}

// Make every post from the API look the same in state
const normalizePost = (post) => ({
  ...post,
  _id: post._id ? String(post._id) : "",
  publicId: post.publicId || "",
});

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

/* ---------- main component ---------- */

export default function BlogSectionAdmin() {
  const [sectionTitle, setSectionTitle] = useState("");
  const [highlightedTitle, setHighlightedTitle] = useState("");
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState(emptyPost);

  const [openPosts, setOpenPosts] = useState([]);
  const [headingErrors, setHeadingErrors] = useState({});
  const [newPostErrors, setNewPostErrors] = useState({});
  const [postErrors, setPostErrors] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);

  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const widgetRef = useRef(null);
  const onUploadedRef = useRef(null);

  /* ----- load ----- */

  useEffect(() => {
    async function loadData() {
      try {
        const { data: res } = await axios.get(API_URL);
        if (!res.success) throw new Error(res.message);

        setSectionTitle(res.data?.sectionTitle || "The Ultimate");
        setHighlightedTitle(res.data?.highlightedTitle || "Resource.");
        setPosts((res.data?.posts || []).map(normalizePost));
      } catch (error) {
        toast.error(getErrorMessage(error, "Could not load blog section."));
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  /* ----- image upload ----- */

  function uploadImage(onUploaded) {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudinaryReady || !window.cloudinary) {
      return toast.error("Cloudinary is still loading. Try again.");
    }
    if (!cloudName || !uploadPreset) {
      return toast.error("Check your Cloudinary environment variables.");
    }

    onUploadedRef.current = onUploaded;

    if (!widgetRef.current) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName,
          uploadPreset,
          sources: ["local", "url", "camera"],
          multiple: false,
          maxFileSize: 5 * 1024 * 1024,
          clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "gif"],
          resourceType: "image",
          folder: "bexon/images",
        },
        (error, result) => {
          if (error) {
            setUploading(false);
            return toast.error("Image upload failed.");
          }

          if (result.event === "queues-start") setUploading(true);
          if (result.event === "queues-end" || result.event === "close")
            setUploading(false);

          if (result.event === "success" && result.info?.secure_url) {
            onUploadedRef.current?.({
              image: result.info.secure_url,
              publicId: result.info.public_id || "",
            });
            onUploadedRef.current = null;
            toast.success("Image uploaded successfully.");
          }
        },
      );
    }

    widgetRef.current.open();
  }

  /* ----- new article form ----- */

  function updateNewPost(changes) {
    setNewPost((current) => ({ ...current, ...changes }));
    setNewPostErrors((current) => {
      const next = { ...current };
      Object.keys(changes).forEach((key) => delete next[key]);
      return next;
    });
  }

  function addArticle() {
    const errors = validatePost(newPost);
    setNewPostErrors(errors);

    if (Object.keys(errors).length) {
      return toast.error("Please complete all required fields.");
    }

    const article = {
      ...newPost,
      id: Date.now(),
      day: String(newPost.day),
      _id: "",
    };

    setPosts((current) => [...current, article]);
    setOpenPosts((current) => [...current, article.id]);
    setNewPost(emptyPost);
    toast.success("Article added. Click Save Changes to store it.");
  }

  /* ----- existing articles ----- */

  function updatePost(id, changes) {
    setPosts((current) =>
      current.map((post) => (post.id === id ? { ...post, ...changes } : post)),
    );
    setPostErrors((current) => {
      const next = { ...(current[id] || {}) };
      Object.keys(changes).forEach((key) => delete next[key]);
      return { ...current, [id]: next };
    });
  }

  function togglePost(id) {
    setOpenPosts((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  }

  /* ----- delete ----- */

  // Remove an article from every piece of local state
  function removeFromState(id) {
    setPosts((current) => current.filter((p) => p.id !== id));
    setOpenPosts((current) => current.filter((x) => x !== id));
    setPostErrors(({ [id]: _removed, ...rest }) => rest);
  }

  async function confirmDelete() {
    const post = postToDelete;
    if (!post) return;

    // Not saved yet → nothing to delete on the server
    if (!post._id) {
      removeFromState(post.id);
      setPostToDelete(null);
      return toast.success("Article removed.");
    }

    setDeleting(true);
    try {
      const { data } = await axios.delete(API_URL, { data: { _id: post._id } });
      if (!data.success) throw new Error(data.message);

      // Only update the UI after the server confirms
      removeFromState(post.id);
      setPostToDelete(null);
      toast.success("Article deleted.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not delete the article."));
    } finally {
      setDeleting(false);
    }
  }

  /* ----- save ----- */

  async function saveData() {
    const headings = {};
    if (!sectionTitle.trim())
      headings.sectionTitle = "Enter the section title.";
    if (!highlightedTitle.trim())
      headings.highlightedTitle = "Enter the highlighted title.";

    const articleErrors = {};
    posts.forEach((post) => {
      const errors = validatePost(post);
      if (Object.keys(errors).length) articleErrors[post.id] = errors;
    });

    setHeadingErrors(headings);
    setPostErrors(articleErrors);

    if (Object.keys(headings).length || Object.keys(articleErrors).length) {
      return toast.error("Please fix the errors before saving.");
    }
    if (!posts.length) {
      return toast.error("Add at least one article before saving.");
    }

    setSaving(true);
    const toastId = toast.loading("Saving blog section...");

    try {
      const payload = {
        sectionTitle: sectionTitle.trim(),
        highlightedTitle: highlightedTitle.trim(),
        posts: posts.map((post) => ({
          ...(post._id ? { _id: post._id } : {}),
          id: post.id,
          day: String(post.day).trim(),
          month: post.month,
          image: post.image,
          publicId: post.publicId,
          category: post.category.trim(),
          author: post.author.trim(),
          title: post.title.trim(),
          link: post.link.trim(),
        })),
      };

      const { data: res } = await axios.post(API_URL, payload);
      if (!res.success) throw new Error(res.message);

      const saved = res.data || payload;
      setSectionTitle(saved.sectionTitle || payload.sectionTitle);
      setHighlightedTitle(saved.highlightedTitle || payload.highlightedTitle);
      setPosts((saved.posts || payload.posts).map(normalizePost));

      toast.success("Blog section saved successfully!", { id: toastId });
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not save blog section."), {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  }

  /* ----- render ----- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1117]">
        <LoaderCircle size={32} className="animate-spin text-[#1e8a8a]" />
      </div>
    );
  }

  const busy = saving || uploading || deleting;
  const saveLabel = saving ? "Saving..." : "Save Changes";
  const saveIcon = saving ? (
    <LoaderCircle size={17} className="animate-spin" />
  ) : (
    <Save size={17} />
  );

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] p-4 text-gray-900 sm:p-6 dark:bg-[#0b1117] dark:text-gray-100">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => toast.error("Could not load Cloudinary widget.")}
      />

      <ConfirmDialog
        article={postToDelete}
        deleting={deleting}
        onCancel={() => setPostToDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#e7f5f5] p-3 text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            <BookOpen size={23} />
          </div>
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">Blog Section</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your blog content.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={saveData}
          disabled={busy}
          className={primaryBtn}
        >
          {saveIcon}
          {saveLabel}
        </button>
      </div>

      {/* Section heading */}
      <section className={cardClass}>
        <h2 className="mb-4 font-bold">Section Heading</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Main Title"
            icon={Type}
            maxLength={80}
            placeholder="The Ultimate"
            value={sectionTitle}
            error={headingErrors.sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
          <Field
            label="Highlighted Title"
            icon={Type}
            maxLength={80}
            placeholder="Resource."
            value={highlightedTitle}
            error={headingErrors.highlightedTitle}
            onChange={(e) => setHighlightedTitle(e.target.value)}
          />
        </div>
      </section>

      {/* Add new article */}
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Add New Article</h2>
          <Plus size={19} className="text-[#1e8a8a]" />
        </div>

        <label className={labelClass}>
          <ImagePlus size={15} />
          Article Image
        </label>
        <button
          type="button"
          disabled={!cloudinaryReady || uploading}
          onClick={() => uploadImage((img) => updateNewPost(img))}
          className={outlineBtn}
        >
          <ImagePlus size={16} />
          {cloudinaryReady ? "Upload Image" : "Loading uploader..."}
        </button>
        <ErrorText>{newPostErrors.image}</ErrorText>

        {newPost.image && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              Image Preview
            </p>
            <ImagePreview src={newPost.image} alt="New article preview" />
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ArticleFields
            data={newPost}
            errors={newPostErrors}
            onChange={(field, value) => updateNewPost({ [field]: value })}
          />
        </div>

        <button
          type="button"
          onClick={addArticle}
          disabled={busy}
          className={`mt-5 ${primaryBtn}`}
        >
          {uploading ? <Spinner /> : <Plus size={17} />}
          Add Article
        </button>
      </section>

      {/* All articles */}
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">All Articles</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Click an article to edit its details.
            </p>
          </div>
          <span className="rounded-lg bg-[#e7f5f5] px-3 py-1.5 text-xs font-semibold text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            {posts.length} Articles
          </span>
        </div>

        {!posts.length ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No articles yet. Add one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, index) => {
              const isOpen = openPosts.includes(post.id);
              const errors = postErrors[post.id] || {};

              return (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]"
                >
                  <div className="flex items-center gap-3 p-3">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-14 w-16 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-[#16212c]">
                        <ImagePlus size={20} />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="text-xs font-semibold text-[#1e8a8a]">
                        {post.category || "UNCATEGORIZED"}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold">
                        {post.title || `Article ${index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {post.day} {post.month} · {post.author}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePost(post.id)}
                      aria-label={isOpen ? "Collapse article" : "Edit article"}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#16212c]"
                    >
                      {isOpen ? (
                        <ChevronUp size={19} />
                      ) : (
                        <ChevronDown size={19} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPostToDelete(post)}
                      disabled={busy}
                      aria-label="Delete article"
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2 dark:border-[#263442]">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Article Image</label>
                        <button
                          type="button"
                          disabled={!cloudinaryReady || uploading}
                          onClick={() =>
                            uploadImage((img) => updatePost(post.id, img))
                          }
                          className={outlineBtn}
                        >
                          <ImagePlus size={16} />
                          Replace Image
                        </button>
                        <ErrorText>{errors.image}</ErrorText>

                        {post.image && (
                          <div className="mt-3">
                            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                              Image Preview
                            </p>
                            <ImagePreview
                              src={post.image}
                              alt={post.title || "Article preview"}
                            />
                          </div>
                        )}
                      </div>

                      <ArticleFields
                        data={post}
                        errors={errors}
                        onChange={(field, value) =>
                          updatePost(post.id, { [field]: value })
                        }
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky save bar */}
      <div className="sticky bottom-3 flex justify-end rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-[#263442] dark:bg-[#111a23]/95">
        <button
          type="button"
          onClick={saveData}
          disabled={busy}
          className={`${primaryBtn} w-full justify-center sm:w-auto`}
        >
          {saveIcon}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
