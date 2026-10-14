"use client";

import { useRef, useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  ImagePlus,
  Save,
  Type,
  CalendarDays,
  UserRound,
  Tag,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import Spinner from "@/app/admin/Components/Admin/Spinner";

/* ============ CONSTANTS ============ */

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
  category: "",
  author: "Admin",
  title: "",
  link: "",
};

/* ============ SHARED TAILWIND STYLES ============ */

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100";

const labelClass =
  "mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200";

const cardClass =
  "rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]";

/* ============ PURE HELPER FUNCTIONS ============ */

function validLink(value = "") {
  const link = value.trim();
  if (link.startsWith("/")) return !link.startsWith("//") && !/\s/.test(link);
  try {
    const url = new URL(link);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validImageUrl(value = "") {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidImageFile(file) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type))
    return "Choose a JPG, PNG, WEBP, or GIF image.";
  if (file.size > 5 * 1024 * 1024) return "Image must be smaller than 5 MB.";
  return null;
}

function validatePost(post, hasSelectedFile = false) {
  const result = {};
  if (post.title.trim().length < 3 || post.title.trim().length > 120)
    result.title = "Title must be 3–120 characters.";
  if (!hasSelectedFile && !validImageUrl(post.image))
    result.image = "Choose an image or enter a valid image URL.";
  if (!/^\d{1,2}$/.test(post.day) || +post.day < 1 || +post.day > 31)
    result.day = "Enter a day from 1 to 31.";
  if (!months.includes(post.month.toUpperCase().trim()))
    result.month = "Select a valid month.";
  if (!post.category.trim() || post.category.trim().length > 40)
    result.category = "Category is required (max 40 characters).";
  if (!post.author.trim() || post.author.trim().length > 60)
    result.author = "Author is required (max 60 characters).";
  if (!validLink(post.link)) result.link = "Enter a valid article link.";
  return result;
}

async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/homepage/articles-section/upload", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  if (!response.ok || !data.url) {
    throw new Error(data.message || "Image upload failed.");
  }
  return data.url;
}

async function saveBlogSection(payload) {
  const response = await fetch("/api/homepage/articles-section", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to save blog section.");
  }
  return result.data || payload;
}

// Fetch existing data from backend
async function fetchBlogSection() {
  const response = await fetch("/api/homepage/articles-section");
  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to load blog section.");
  }
  return result.data;
}

/* ============ SMALL REUSABLE UI PIECES ============ */

function ErrorText({ children }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-red-500">{children}</p>;
}

function ImagePreview({ src, alt }) {
  const [failed, setFailed] = useState(false);

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

function SelectField({
  label,
  icon: Icon,
  error,
  options,
  className = "",
  ...props
}) {
  return (
    <div className={className}>
      <label className={labelClass}>
        {Icon && <Icon size={15} />}
        {label}
      </label>
      <select className={inputClass} {...props}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function ArticleFields({ data, onChange, errors }) {
  return (
    <>
      <Field
        label="Day"
        icon={CalendarDays}
        type="number"
        min="1"
        max="31"
        placeholder="24"
        value={data.day}
        error={errors.day}
        onChange={(e) => onChange("day", e.target.value)}
      />
      <SelectField
        label="Month"
        icon={CalendarDays}
        value={data.month}
        options={months}
        error={errors.month}
        onChange={(e) => onChange("month", e.target.value)}
      />
      <Field
        label="Category"
        icon={Tag}
        maxLength={40}
        placeholder="BUSINESS"
        value={data.category}
        error={errors.category}
        onChange={(e) => onChange("category", e.target.value)}
      />
      <Field
        label="Author"
        icon={UserRound}
        maxLength={60}
        placeholder="Admin"
        value={data.author}
        error={errors.author}
        onChange={(e) => onChange("author", e.target.value)}
      />
      <Field
        label="Article Title"
        icon={Type}
        maxLength={120}
        placeholder="Enter article title"
        className="sm:col-span-2"
        value={data.title}
        error={errors.title}
        onChange={(e) => onChange("title", e.target.value)}
      />
      <Field
        label="Article Link"
        icon={LinkIcon}
        placeholder="/blog/my-article or https://example.com/article"
        className="sm:col-span-2"
        value={data.link}
        error={errors.link}
        onChange={(e) => onChange("link", e.target.value)}
      />
    </>
  );
}

/* ============ MAIN COMPONENT ============ */

export default function BlogSectionAdmin() {
  // Start with empty state — data comes from backend
  const [sectionTitle, setSectionTitle] = useState("");
  const [highlightedTitle, setHighlightedTitle] = useState("");
  const [posts, setPosts] = useState([]);

  const [newPost, setNewPost] = useState(emptyPost);
  const [newPreview, setNewPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [openPosts, setOpenPosts] = useState([]);
  const [errors, setErrors] = useState({});
  const [postErrors, setPostErrors] = useState({});

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fileRef = useRef(null);

  /* ---------- LOAD DATA FROM BACKEND ON MOUNT ---------- */

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await fetchBlogSection();

      if (data) {
        setSectionTitle(data.sectionTitle || "");
        setHighlightedTitle(data.highlightedTitle || "");
        setPosts(
          (data.posts || []).map((post) => ({
            ...post,
            id: post.id || Date.now() + Math.random(),
          })),
        );
      }
    } catch (error) {
      toast.error(error.message || "Could not load blog section.");
    } finally {
      setIsLoading(false);
    }
  }

  /* ---------- small state updates ---------- */

  const updateNewPost = (field, value) =>
    setNewPost((current) => ({ ...current, [field]: value }));

  const updatePost = (id, field, value) =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? { ...post, [field]: value } : post,
      ),
    );

  const togglePost = (id) =>
    setOpenPosts((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  /* ---------- image selection (new article: preview only) ---------- */

  function chooseImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = isValidImageFile(file);
    if (error) return toast.error(error);

    if (newPreview) URL.revokeObjectURL(newPreview);

    setSelectedFile(file);
    setNewPreview(URL.createObjectURL(file));
    updateNewPost("image", "");
    setErrors((current) => ({ ...current, image: "" }));
  }

  /* ---------- image replacement (uploads immediately) ---------- */

  async function replaceArticleImage(event, postId) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const error = isValidImageFile(file);
    if (error) return toast.error(error);

    setIsUploading(true);
    const toastId = toast.loading("Uploading replacement image...");

    try {
      const imageUrl = await uploadImage(file);
      updatePost(postId, "image", imageUrl);
      toast.success("Article image updated.", { id: toastId });
    } catch (err) {
      toast.error(err.message || "Image upload failed.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  }

  /* ---------- add / remove articles ---------- */

  async function addArticle() {
    const result = validatePost(newPost, Boolean(selectedFile));
    setErrors(result);

    if (Object.keys(result).length > 0) {
      toast.error("Please complete the required fields.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(
      selectedFile
        ? "Uploading image and adding article..."
        : "Adding article...",
    );

    try {
      const imageUrl = selectedFile
        ? await uploadImage(selectedFile)
        : newPost.image.trim();
      const article = { ...newPost, id: Date.now(), image: imageUrl };

      setPosts((current) => [...current, article]);
      setOpenPosts((current) => [...current, article.id]);

      if (newPreview) URL.revokeObjectURL(newPreview);

      setNewPost({ ...emptyPost });
      setSelectedFile(null);
      setNewPreview("");
      setErrors({});

      toast.success("Article added successfully.", { id: toastId });
      saveData();
    } catch (error) {
      toast.error(error.message || "Could not add article.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  }

  function removeArticle(id) {
    setPosts((current) => current.filter((post) => post.id !== id));
    setOpenPosts((current) => current.filter((item) => item !== id));
    setPostErrors((current) => {
      const updated = { ...current };
      delete updated[id];
      return updated;
    });
    toast.success("Article removed.");
    saveData();
  }

  /* ---------- validate + save everything ---------- */

  async function saveData() {
    const headingErrors = {};
    if (!sectionTitle.trim())
      headingErrors.sectionTitle = "Enter the section title.";
    if (!highlightedTitle.trim())
      headingErrors.highlightedTitle = "Enter the highlighted title.";

    const articleErrors = {};
    posts.forEach((post) => {
      const result = validatePost(post);
      if (Object.keys(result).length > 0) articleErrors[post.id] = result;
    });

    setErrors(headingErrors);
    setPostErrors(articleErrors);

    if (
      Object.keys(headingErrors).length > 0 ||
      Object.keys(articleErrors).length > 0
    ) {
      toast.error("Please fix the errors before continuing.");
      return;
    }

    if (posts.length === 0) {
      toast.error("Add at least one article before saving.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading("Saving blog section...");

    try {
      const payload = {
        sectionTitle: sectionTitle.trim(),
        highlightedTitle: highlightedTitle.trim(),
        posts: posts.map((post) => ({
          id: post.id,
          day: post.day.trim ? post.day.trim() : post.day,
          month: post.month,
          image: post.image.trim(),
          category: post.category.trim(),
          author: post.author.trim(),
          title: post.title.trim(),
          link: post.link.trim(),
        })),
      };

      const saved = await saveBlogSection(payload);

      if (saved?.sectionTitle) setSectionTitle(saved.sectionTitle);
      if (saved?.highlightedTitle) setHighlightedTitle(saved.highlightedTitle);
      if (Array.isArray(saved?.posts)) setPosts(saved.posts);

      toast.success("Blog section saved successfully!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Something went wrong while saving.", {
        id: toastId,
      });
    } finally {
      setIsSaving(false);
    }
  }

  /* ============ LOADING SCREEN ============ */

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f9fc] dark:bg-[#0b1117]">
        <div className="flex flex-col items-center gap-3">
          <LoaderCircle size={32} className="animate-spin text-[#1e8a8a]" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Loading blog section...
          </p>
        </div>
      </div>
    );
  }

  /* ============ UI ============ */

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] p-4 text-gray-900 sm:p-6 dark:bg-[#0b1117] dark:text-gray-100">
      {/* HEADER */}
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
          disabled={isUploading || isSaving}
          className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176f6f] disabled:opacity-60"
        >
          {isSaving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* SECTION HEADING */}
      <section className={cardClass}>
        <h2 className="mb-4 font-bold">Section Heading</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Main Title"
            icon={Type}
            maxLength={80}
            placeholder="The Ultimate"
            value={sectionTitle}
            error={errors.sectionTitle}
            onChange={(e) => setSectionTitle(e.target.value)}
          />
          <Field
            label="Highlighted Title"
            icon={Type}
            maxLength={80}
            placeholder="Resource."
            value={highlightedTitle}
            error={errors.highlightedTitle}
            onChange={(e) => setHighlightedTitle(e.target.value)}
          />
        </div>
      </section>

      {/* ADD NEW ARTICLE */}
      <section className={cardClass}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Add New Article</h2>
          <Plus size={19} className="text-[#1e8a8a]" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>
              <ImagePlus size={15} />
              Article Image — Add Working URL
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                className={inputClass}
                value={newPost.image}
                placeholder="Paste image URL or choose a file"
                onChange={(event) => {
                  if (newPreview) URL.revokeObjectURL(newPreview);
                  setNewPreview("");
                  setSelectedFile(null);
                  updateNewPost("image", event.target.value);
                }}
              />

              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={chooseImage}
              />

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] hover:bg-[#e7f5f5] disabled:opacity-60 dark:hover:bg-[#162c32]"
              >
                <ImagePlus size={16} />
                Choose Image
              </button>
            </div>

            <ErrorText>{errors.image}</ErrorText>

            {(newPreview || validImageUrl(newPost.image)) && (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Image Preview — upload happens when you add the article
                </p>
                <ImagePreview
                  src={newPreview || newPost.image}
                  alt="New article preview"
                />
              </div>
            )}
          </div>

          <ArticleFields
            data={newPost}
            errors={errors}
            onChange={updateNewPost}
          />
        </div>

        <button
          type="button"
          onClick={addArticle}
          disabled={isUploading}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60"
        >
          {isUploading ? <Spinner /> : <Plus size={17} />}
          {isUploading ? "Adding Article..." : "Add Article"}
        </button>
      </section>

      {/* ALL ARTICLES */}
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

        {posts.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No articles yet. Add one above to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, index) => {
              const isOpen = openPosts.includes(post.id);
              const articleErrors = postErrors[post.id] || {};

              return (
                <div
                  key={post.id}
                  className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]"
                >
                  <div className="flex items-center gap-3 p-3">
                    {validImageUrl(post.image) ? (
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
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#16212c]"
                      aria-label={isOpen ? "Collapse article" : "Edit article"}
                    >
                      {isOpen ? (
                        <ChevronUp size={19} />
                      ) : (
                        <ChevronDown size={19} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeArticle(post.id)}
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label="Delete article"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {isOpen && (
                    <div className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2 dark:border-[#263442]">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>Article Image</label>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input
                            className={inputClass}
                            value={post.image}
                            placeholder="Image URL"
                            onChange={(event) =>
                              updatePost(post.id, "image", event.target.value)
                            }
                          />

                          <label className="flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2 text-sm font-medium text-[#1e8a8a] hover:bg-[#e7f5f5] dark:hover:bg-[#162c32]">
                            <ImagePlus size={16} />
                            Replace Image
                            <input
                              type="file"
                              className="hidden"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              onChange={(event) =>
                                replaceArticleImage(event, post.id)
                              }
                            />
                          </label>
                        </div>

                        <ErrorText>{articleErrors.image}</ErrorText>

                        {validImageUrl(post.image) && (
                          <div className="mt-3">
                            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
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
                        errors={articleErrors}
                        onChange={(field, value) =>
                          updatePost(post.id, field, value)
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

      {/* BOTTOM ACTION */}
      <div className="sticky bottom-3 flex justify-end rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-[#263442] dark:bg-[#111a23]/95">
        <button
          type="button"
          onClick={saveData}
          disabled={isUploading || isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60 sm:w-auto"
        >
          {isSaving ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
