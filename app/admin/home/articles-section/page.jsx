"use client";

import axios from "axios";
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Link as LinkIcon,
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
import Swal from "sweetalert2";

const API = "/api/homepage/articles-section";

const emptyArticle = {
  day: "",
  month: "OCT",
  image: "",
  publicId: "",
  category: "",
  author: "Admin",
  title: "",
  link: "",
};

const emptyTitles = {
  sectionTitle: "The Ultimate",
  highlightedTitle: "Resource.",
};

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]";

export default function BlogSectionAdmin() {
  const [article, setArticle] = useState(emptyArticle);
  const [titles, setTitles] = useState(emptyTitles);
  const [articles, setArticles] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const cloudinaryWidget = useRef(null);
  const uploadArticleId = useRef(null);

  // Load articles and headings
  const loadArticles = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API);

      if (response.data.success) {
        const section = response.data.data;

        setArticles(
          (section?.posts || []).map((item) => ({
            ...item,
            _id: item._id?.toString(),
            day: item.day || "",
            month: item.month || "OCT",
            image: item.image || "",
            publicId: item.publicId || "",
            category: item.category || "",
            author: item.author || "",
            title: item.title || "",
            link: item.link || "",
          })),
        );

        if (section) {
          setTitles((previous) => ({
            ...previous,
            sectionTitle: section.sectionTitle || "",
            highlightedTitle: section.highlightedTitle || "",
          }));
        }
      } else {
        toast.error(response.data.message || "Failed to load articles.");
      }
    } catch (error) {
      console.error("Load articles error:", error.response?.data || error);
      toast.error("Failed to load articles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  // New article inputs
  function handleArticleChange(event) {
    const { name, value } = event.target;

    setArticle((currentArticle) => ({
      ...currentArticle,
      [name]: value,
    }));
  }

  // Section heading inputs
  function handleTitleChange(event) {
    const { name, value } = event.target;

    setTitles((currentTitles) => ({
      ...currentTitles,
      [name]: value,
    }));
  }

  // Existing article inputs
  function handleExistingArticleChange(articleId, fieldName, value) {
    setArticles((currentArticles) =>
      currentArticles.map((item) =>
        item._id === articleId ? { ...item, [fieldName]: value } : item,
      ),
    );
  }

  // Open or close article
  function toggleArticle(articleId) {
    setExpandedId((currentId) => (currentId === articleId ? null : articleId));
  }

  // Cloudinary image upload
  function uploadImage(articleId = null) {
    if (!cloudinaryReady || !window.cloudinary) {
      toast.error("Image uploader is not ready.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Check your Cloudinary environment variables.");
      return;
    }

    uploadArticleId.current = articleId;

    if (!cloudinaryWidget.current) {
      cloudinaryWidget.current = window.cloudinary.createUploadWidget(
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
        function (error, result) {
          if (error) {
            toast.error("Image upload failed.");
            return;
          }

          if (result.event !== "success") return;

          const uploadedImage = result.info.secure_url;
          const uploadedPublicId = result.info.public_id || "";
          const targetId = uploadArticleId.current;

          if (targetId) {
            setArticles((currentArticles) =>
              currentArticles.map((item) =>
                item._id === targetId
                  ? {
                      ...item,
                      image: uploadedImage,
                      publicId: uploadedPublicId,
                    }
                  : item,
              ),
            );
          } else {
            setArticle((currentArticle) => ({
              ...currentArticle,
              image: uploadedImage,
              publicId: uploadedPublicId,
            }));
          }

          toast.success("Image uploaded successfully.");
        },
      );
    }

    cloudinaryWidget.current.open();
  }

  // Validate new article using toast.error()
  async function handleAddArticle() {
    if (!article.image) {
      toast.error("Please upload an image first.");
      return;
    }

    if (!article.day.trim()) {
      toast.error("Please enter the article day.");
      return;
    }

    if (
      Number(article.day) < 1 ||
      Number(article.day) > 31 ||
      !Number.isInteger(Number(article.day))
    ) {
      toast.error("Day must be between 1 and 31.");
      return;
    }

    if (!article.month.trim()) {
      toast.error("Please select a month.");
      return;
    }

    if (!article.category.trim()) {
      toast.error("Please enter the article category.");
      return;
    }

    if (!article.author.trim()) {
      toast.error("Please enter the article author.");
      return;
    }

    if (!article.title.trim()) {
      toast.error("Please enter an article title.");
      return;
    }

    if (!article.link.trim()) {
      toast.error("Please enter the article link.");
      return;
    }

    const link = article.link.trim();

    if (link.startsWith("//") || link.includes("\\") || /\s/.test(link)) {
      toast.error("Please enter a valid article link.");
      return;
    }

    if (link.startsWith("/")) {
      // Valid local route
    } else {
      try {
        const url = new URL(link);

        if (!["http:", "https:"].includes(url.protocol)) {
          toast.error("Article link must use HTTP or HTTPS.");
          return;
        }
      } catch {
        toast.error("Please enter a valid article link.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await axios.post(API, {
        article: {
          ...article,
          day: article.day.trim(),
          category: article.category.trim(),
          author: article.author.trim(),
          title: article.title.trim(),
          link: link,
        },
        Titles: titles,
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to add article.");
        return;
      }

      toast.success(response.data.message || "Article added.");

      setArticle({ ...emptyArticle });

      await loadArticles();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add article.");
    } finally {
      setSaving(false);
    }
  }

  // Update existing article
  async function handleUpdateArticle(item) {
    if (!item._id) {
      toast.error("Article ID is missing.");
      return;
    }

    if (!item.image) {
      toast.error("Please upload an article image.");
      return;
    }

    if (!String(item.day).trim()) {
      toast.error("Please enter the article day.");
      return;
    }

    if (
      Number(item.day) < 1 ||
      Number(item.day) > 31 ||
      !Number.isInteger(Number(item.day))
    ) {
      toast.error("Day must be between 1 and 31.");
      return;
    }

    if (!String(item.month || "").trim()) {
      toast.error("Please select a month.");
      return;
    }

    if (!item.category?.trim()) {
      toast.error("Please enter the article category.");
      return;
    }

    if (!item.author?.trim()) {
      toast.error("Please enter the article author.");
      return;
    }

    if (!item.title?.trim()) {
      toast.error("Please enter an article title.");
      return;
    }

    if (!item.link?.trim()) {
      toast.error("Please enter the article link.");
      return;
    }

    const link = item.link.trim();

    if (link.startsWith("//") || link.includes("\\") || /\s/.test(link)) {
      toast.error("Please enter a valid article link.");
      return;
    }

    if (!link.startsWith("/")) {
      try {
        const url = new URL(link);

        if (!["http:", "https:"].includes(url.protocol)) {
          toast.error("Article link must use HTTP or HTTPS.");
          return;
        }
      } catch {
        toast.error("Please enter a valid article link.");
        return;
      }
    }

    setEditingId(item._id);

    try {
      const response = await axios.put(API, {
        _id: item._id,
        article: {
          day: item.day,
          month: item.month,
          image: item.image,
          publicId: item.publicId,
          category: item.category.trim(),
          author: item.author.trim(),
          title: item.title.trim(),
          link,
        },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to update article.");
        return;
      }

      toast.success(response.data.message || "Article updated.");

      await loadArticles();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Update failed. Check your PUT API.",
      );
    } finally {
      setEditingId(null);
    }
  }

  // Save section headings
  async function handleSaveTitles() {
    if (!titles.sectionTitle.trim()) {
      toast.error("Please enter the main section title.");
      return;
    }

    if (!titles.highlightedTitle.trim()) {
      toast.error("Please enter the highlighted title.");
      return;
    }

    setSaving(true);

    try {
      const response = await axios.put(API, {
        Titles: {
          sectionTitle: titles.sectionTitle.trim(),
          highlightedTitle: titles.highlightedTitle.trim(),
        },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to save headings.");
        return;
      }

      toast.success(response.data.message || "Headings saved.");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Heading save failed. Check your PUT API.",
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete article
  async function handleDeleteArticle(item) {
    if (deletingId) return;

    const result = await Swal.fire({
      title: "Delete this article?",
      text: `"${item.title || "Untitled article"}" will be permanently deleted.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Keep article",
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      allowOutsideClick: false,
      customClass: {
        popup: "rounded-2xl p-6",
        title: "text-xl font-semibold",
        htmlContainer: "text-sm",
        actions: "gap-3",
        confirmButton:
          "rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700",
        cancelButton:
          "rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold hover:bg-gray-100",
      },
    });

    if (!result.isConfirmed) return;

    setDeletingId(item._id);

    try {
      const response = await axios.delete(API, {
        data: {
          _id: item._id,
          publicId: item.publicId,
        },
      });

      if (!response.data.success) {
        toast.error(response.data.message || "Failed to delete article.");
        return;
      }

      setArticles((currentArticles) =>
        currentArticles.filter((articleItem) => articleItem._id !== item._id),
      );

      if (expandedId === item._id) {
        setExpandedId(null);
      }

      toast.success(response.data.message || "Article deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete article.");
    } finally {
      setDeletingId(null);
    }
  }

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

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] p-4 text-gray-900 sm:p-6 dark:bg-[#0b1117] dark:text-gray-100">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => toast.error("Could not load Cloudinary.")}
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
      </div>

      {/* Section Heading */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <h2 className="mb-4 font-bold">Section Heading</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Main Title
            </label>

            <input
              name="sectionTitle"
              value={titles.sectionTitle}
              onChange={handleTitleChange}
              placeholder="The Ultimate"
              maxLength={80}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Highlighted Title
            </label>

            <input
              name="highlightedTitle"
              value={titles.highlightedTitle}
              onChange={handleTitleChange}
              placeholder="Resource."
              maxLength={80}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Add New Article */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Add New Article</h2>
          <Plus size={19} className="text-[#1e8a8a]" />
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <ImagePlus size={15} />
          Article Image
        </label>

        <button
          type="button"
          onClick={() => uploadImage()}
          disabled={!cloudinaryReady}
          className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] disabled:opacity-60 dark:border-[#35b5b5] dark:text-[#35b5b5]"
        >
          <ImagePlus size={16} />
          {cloudinaryReady ? "Upload Image" : "Loading uploader..."}
        </button>

        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500">Image Preview</p>

          {article.image ? (
            <img
              src={article.image}
              alt="New article"
              className="h-36 w-full rounded-xl border object-cover sm:w-64"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 text-sm text-gray-400 sm:w-64">
              <ImagePlus size={24} />
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays size={15} />
              Day
            </label>

            <input
              name="day"
              type="number"
              min="1"
              max="31"
              value={article.day}
              onChange={handleArticleChange}
              placeholder="24"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <CalendarDays size={15} />
              Month
            </label>

            <select
              name="month"
              value={article.month}
              onChange={handleArticleChange}
              className={inputClass}
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Tag size={15} />
              Category
            </label>

            <input
              name="category"
              value={article.category}
              onChange={handleArticleChange}
              placeholder="BUSINESS"
              maxLength={40}
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserRound size={15} />
              Author
            </label>

            <input
              name="author"
              value={article.author}
              onChange={handleArticleChange}
              placeholder="Admin"
              maxLength={60}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Type size={15} />
              Article Title
            </label>

            <input
              name="title"
              value={article.title}
              onChange={handleArticleChange}
              placeholder="Enter article title"
              maxLength={120}
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium">
              <LinkIcon size={15} />
              Article Link
            </label>

            <input
              name="link"
              value={article.link}
              onChange={handleArticleChange}
              placeholder="/blog/my-article"
              className={inputClass}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddArticle}
          disabled={saving}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          <Plus size={17} />
          {saving ? "Saving..." : "Add Article"}
        </button>
      </section>

      {/* All Articles */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">All Articles</h2>
            <p className="mt-1 text-xs text-gray-500">
              Click an article to edit its details.
            </p>
          </div>

          <span className="rounded-lg bg-[#e7f5f5] px-3 py-1.5 text-xs font-semibold text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            {articles.length} Articles
          </span>
        </div>

        <div className="space-y-3">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Loading articles...
            </p>
          ) : articles.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No articles found.
            </p>
          ) : (
            articles.map((item) => (
              <div
                key={item._id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]"
              >
                {/* Article Row */}
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 dark:bg-[#16212c]">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus size={20} />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleArticle(item._id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="text-xs font-semibold text-[#1e8a8a] dark:text-[#35b5b5]">
                      {item.category || "UNCATEGORIZED"}
                    </p>

                    <p className="mt-1 truncate text-sm font-semibold">
                      {item.title || "Untitled article"}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {item.day} {item.month} · {item.author}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleArticle(item._id)}
                    aria-label="Toggle article editor"
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-[#16212c]"
                  >
                    {expandedId === item._id ? (
                      <ChevronUp size={19} />
                    ) : (
                      <ChevronDown size={19} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteArticle(item)}
                    disabled={deletingId === item._id}
                    aria-label="Delete article"
                    className="rounded-lg p-2 text-red-500 disabled:opacity-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                {/* Editable Article Fields */}
                {expandedId === item._id && (
                  <div className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2 dark:border-[#263442]">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Article Image
                      </label>

                      <button
                        type="button"
                        onClick={() => uploadImage(item._id)}
                        disabled={!cloudinaryReady}
                        className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] disabled:opacity-60 dark:border-[#35b5b5] dark:text-[#35b5b5]"
                      >
                        <ImagePlus size={16} />
                        Replace Image
                      </button>

                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="mt-3 h-36 w-full rounded-xl border object-cover sm:w-64"
                        />
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Day
                      </label>

                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={item.day}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "day",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Month
                      </label>

                      <select
                        value={item.month}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "month",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      >
                        {months.map((month) => (
                          <option key={month} value={month}>
                            {month}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Category
                      </label>

                      <input
                        value={item.category}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "category",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Author
                      </label>

                      <input
                        value={item.author}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "author",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Article Title
                      </label>

                      <input
                        value={item.title}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "title",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-medium">
                        Article Link
                      </label>

                      <input
                        value={item.link}
                        onChange={(event) =>
                          handleExistingArticleChange(
                            item._id,
                            "link",
                            event.target.value,
                          )
                        }
                        className={inputClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateArticle(item)}
                        disabled={editingId === item._id}
                        className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        <Save size={17} />
                        {editingId === item._id ? "Saving..." : "Save Article"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
