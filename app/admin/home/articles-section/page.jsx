"use client";

import { useRef, useState } from "react";
import {
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
} from "lucide-react";

const emptyPost = {
  day: "",
  month: "",
  image: "",
  category: "",
  author: "",
  title: "",
  link: "",
};

const defaults = [
  {
    id: 1,
    day: "24",
    month: "OCT",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
    category: "BUSINESS",
    author: "Admin",
    title: "How to Build a Successful Business Strategy",
    link: "/blog/business-strategy",
  },
  {
    id: 2,
    day: "18",
    month: "OCT",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80",
    category: "MARKETING",
    author: "Admin",
    title: "Digital Marketing Strategies for Modern Brands",
    link: "/blog/digital-marketing",
  },
  {
    id: 3,
    day: "12",
    month: "OCT",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80",
    category: "TECHNOLOGY",
    author: "Admin",
    title: "The Future of Technology in Business",
    link: "/blog/future-technology",
  },
];

export default function BlogSectionAdmin() {
  const [sectionTitle, setSectionTitle] = useState("The Ultimate");
  const [highlightedTitle, setHighlightedTitle] = useState("Resource.");
  const [posts, setPosts] = useState(defaults);
  const [newPost, setNewPost] = useState(emptyPost);
  const [newPreview, setNewPreview] = useState("");
  const [openPosts, setOpenPosts] = useState([1]);

  const fileRef = useRef(null);

  const input =
    "w-full rounded-xl border border-[var(--border,#e4e7ec)] bg-[var(--surface,#fff)] px-4 py-3 text-sm text-[var(--foreground,#101828)] outline-none focus:border-[#1e8a8a]";
  const label =
    "mb-2 flex items-center gap-2 text-sm font-medium text-[var(--foreground,#101828)]";
  const card =
    "rounded-2xl border border-[var(--border,#e4e7ec)] bg-[var(--surface,#fff)] p-5 sm:p-6";

  function changeNew(field, value) {
    setNewPost((prev) => ({ ...prev, [field]: value }));
  }

  function changePost(id, field, value) {
    setPosts((prev) =>
      prev.map((post) => (post.id === id ? { ...post, [field]: value } : post)),
    );
  }

  function changeImageUrl(value) {
    if (newPreview.startsWith("blob:")) {
      URL.revokeObjectURL(newPreview);
    }

    setNewPreview("");
    changeNew("image", value);
  }

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Choose a valid image up to 5MB.");
      event.target.value = "";
      return;
    }

    if (newPreview.startsWith("blob:")) {
      URL.revokeObjectURL(newPreview);
    }

    setNewPreview(URL.createObjectURL(file));
    changeNew("image", "");
    event.target.value = "";
  }

  function addArticle() {
    if (!newPost.title.trim()) {
      alert("Please enter an article title.");
      return;
    }

    if (!newPost.image.trim() && !newPreview) {
      alert("Please add an image URL or choose an image.");
      return;
    }

    const id = Date.now();

    setPosts((prev) => [
      { ...newPost, id, image: newPreview || newPost.image },
      ...prev,
    ]);

    setOpenPosts((prev) => [id, ...prev]);
    setNewPost(emptyPost);
    setNewPreview("");
  }

  function deleteArticle(id) {
    if (!confirm("Delete this article?")) return;

    setPosts((prev) => prev.filter((post) => post.id !== id));
    setOpenPosts((prev) => prev.filter((postId) => postId !== id));
  }

  function togglePost(id) {
    setOpenPosts((prev) =>
      prev.includes(id)
        ? prev.filter((postId) => postId !== id)
        : [...prev, id],
    );
  }

  function getData() {
    console.log({ sectionTitle, highlightedTitle, posts });
    alert("Data logged to the browser console.");
  }

  return (
    <main className="min-h-screen space-y-6 bg-[var(--background,#f7f9fc)] p-4 pb-28 text-[var(--foreground,#101828)] sm:p-6 sm:pb-28 lg:p-8 lg:pb-28">
      {/* PAGE HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Blog Section</h1>
          <p className="mt-1 text-sm text-[var(--muted,#667085)]">
            Manage your heading and articles.
          </p>
        </div>

        <span className="rounded-full bg-[#1e8a8a]/10 px-3 py-2 text-sm font-semibold text-[#1e8a8a]">
          {posts.length} Articles
        </span>
      </header>

      {/* 1. SECTION HEADING */}
      <section className={card}>
        <h2 className="mb-5 text-lg font-bold">01. Section Heading</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label}>
              <Type size={16} /> Main Title
            </label>
            <input
              className={input}
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Main title"
            />
          </div>

          <div>
            <label className={label}>
              <Type size={16} /> Highlighted Title
            </label>
            <input
              className={input}
              value={highlightedTitle}
              onChange={(e) => setHighlightedTitle(e.target.value)}
              placeholder="Highlighted title"
            />
          </div>
        </div>
      </section>

      {/* 2. ADD ARTICLE */}
      <section className={`${card} border-dashed`}>
        <h2 className="text-lg font-bold">02. Add Article</h2>
        <p className="mt-1 mb-5 text-sm text-[var(--muted,#667085)]">
          Create a new article using this form.
        </p>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <label className={label}>
              <ImagePlus size={16} /> Image Preview
            </label>

            <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-[var(--border,#e4e7ec)] bg-[var(--background,#f7f9fc)]">
              {newPreview || newPost.image ? (
                <img
                  src={newPreview || newPost.image}
                  alt="New article preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <ImagePlus size={38} className="text-[var(--muted,#667085)]" />
              )}
            </div>

            <label className={`${label} mt-4`}>
              <LinkIcon size={16} /> Image URL
            </label>

            <input
              className={input}
              value={newPost.image}
              onChange={(e) => changeImageUrl(e.target.value)}
              placeholder="Paste image URL"
            />

            <label className={`${label} mt-4`}>Upload from PC</label>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={chooseImage}
            />

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#1e8a8a] px-4 py-3 text-sm font-semibold text-[#1e8a8a] transition hover:bg-[#1e8a8a]/5"
            >
              <ImagePlus size={18} />
              Choose Image
            </button>

            <p className="mt-2 text-xs text-[var(--muted,#667085)]">
              Select an image up to 5MB. Local preview only.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={label}>
                <Type size={16} /> Article Title
              </label>
              <input
                className={input}
                value={newPost.title}
                onChange={(e) => changeNew("title", e.target.value)}
                placeholder="Enter article title"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={label}>
                  <CalendarDays size={16} /> Day
                </label>
                <input
                  className={input}
                  value={newPost.day}
                  onChange={(e) => changeNew("day", e.target.value)}
                  placeholder="24"
                />
              </div>

              <div>
                <label className={label}>
                  <CalendarDays size={16} /> Month
                </label>
                <input
                  className={input}
                  value={newPost.month}
                  onChange={(e) => changeNew("month", e.target.value)}
                  placeholder="OCT"
                />
              </div>
            </div>

            <div>
              <label className={label}>
                <Tag size={16} /> Category
              </label>
              <input
                className={input}
                value={newPost.category}
                onChange={(e) => changeNew("category", e.target.value)}
                placeholder="BUSINESS"
              />
            </div>

            <div>
              <label className={label}>
                <UserRound size={16} /> Author
              </label>
              <input
                className={input}
                value={newPost.author}
                onChange={(e) => changeNew("author", e.target.value)}
                placeholder="Author name"
              />
            </div>

            <div>
              <label className={label}>
                <LinkIcon size={16} /> Article Link
              </label>
              <input
                className={input}
                value={newPost.link}
                onChange={(e) => changeNew("link", e.target.value)}
                placeholder="/blog/article-name"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-[var(--border,#e4e7ec)] pt-5">
          <button
            type="button"
            onClick={addArticle}
            className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#176f6f]"
          >
            <Plus size={17} /> Add Article
          </button>
        </div>
      </section>

      {/* 3. ALL ARTICLES */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">03. All Articles</h2>
          <p className="mt-1 text-sm text-[var(--muted,#667085)]">
            Edit and manage existing articles.
          </p>
        </div>

        {posts.map((post, index) => {
          const isOpen = openPosts.includes(post.id);

          return (
            <article key={post.id} className={`${card} overflow-hidden !p-0`}>
              <div className="flex items-center gap-3 p-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-16 w-20 rounded-lg object-cover"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#1e8a8a]">
                    ARTICLE {index + 1}
                  </p>
                  <h3 className="truncate font-semibold">
                    {post.title || "Untitled Article"}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--muted,#667085)]">
                    {post.category} · {post.author}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label={isOpen ? "Collapse article" : "Edit article"}
                  className="rounded-lg border border-[var(--border,#e4e7ec)] p-2"
                  onClick={() => togglePost(post.id)}
                >
                  {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                <button
                  type="button"
                  aria-label="Delete article"
                  className="rounded-lg border border-red-200 p-2 text-red-500 transition hover:bg-red-50"
                  onClick={() => deleteArticle(post.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {isOpen && (
                <div className="grid gap-4 border-t border-[var(--border,#e4e7ec)] p-4 sm:grid-cols-2">
                  {[
                    ["title", "Article Title"],
                    ["image", "Image URL"],
                    ["day", "Day"],
                    ["month", "Month"],
                    ["category", "Category"],
                    ["author", "Author"],
                    ["link", "Article Link"],
                  ].map(([field, title]) => (
                    <div key={field}>
                      <label className={label}>{title}</label>
                      <input
                        className={input}
                        value={post[field] || ""}
                        onChange={(e) =>
                          changePost(post.id, field, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </section>

      {/* STICKY BOTTOM ACTION BAR */}
      <div className="sticky bottom-0 z-40 -mx-4 mt-8 border-t border-[var(--border,#e4e7ec)] bg-[var(--surface,#ffffff)]/95 px-4 py-4 shadow-[0_-8px_25px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[var(--foreground,#101828)]">
              Blog Section Settings
            </p>
            <p className="mt-1 text-xs text-[var(--muted,#667085)]">
              {posts.length} articles · Review your changes
            </p>
          </div>

          <button
            type="button"
            onClick={getData}
            className="ml-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1e8a8a]/20 transition duration-200 hover:-translate-y-0.5 hover:bg-[#176f6f] active:translate-y-0 sm:w-auto"
          >
            <Save size={18} />
            Get New Data
          </button>
        </div>
      </div>
    </main>
  );
}
