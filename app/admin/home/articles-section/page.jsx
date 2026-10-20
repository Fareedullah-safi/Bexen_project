"use client";

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
import { useRef, useState } from "react";

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

export default function BlogSectionAdmin() {
  const [article, setArticle] = useState(emptyArticle);
  const [Titles, setTitles] = useState({
    sectionTitle: "The Ultimate",
    highlightedTitle: "Resource.",
  });
  const [cloudinaryReady, setCloudinaryReady] = useState(false);
  const widgetRef = useRef(null);
  const [previewImgage, setPreviewImage] = useState("")

  // Update one field of the new article
  function handleChange(e) {
    const { name, value } = e.target;
    setArticle((current) => ({ ...current, [name]: value }));
    setTitles((current) => ({ ...current, [name]: value }));
  }
  function handleTitleChange(e) {
    const { name, value } = e.target;
    setTitles((current) => ({ ...current, [name]: value }));
  }

  // Open the Cloudinary upload widget
  function uploadImage() {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!window.cloudinary) {
      return console.error("Cloudinary widget is still loading.");
    }
    if (!cloudName || !uploadPreset) {
      return console.error("Check your Cloudinary environment variables.");
    }

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
          if (error) return console.error("Image upload failed.", error);

          if (result.event === "success" && result.info?.secure_url) {
            setArticle((current) => ({
              ...current,
              image: result.info.secure_url,
              publicId: result.info.public_id || "",
            }));
          }
        },
      );
    }

    widgetRef.current.open();
  }

  // Get the data out (console only for now)
  function handleAddArticle() {
    console.log("New article data:", article);
    console.log("newTitles also", Titles);
  }

  return (
    <div className="min-h-screen space-y-5 bg-[#f7f9fc] p-4 text-gray-900 sm:p-6 dark:bg-[#0b1117] dark:text-gray-100">
      <Script
        src="https://upload-widget.cloudinary.com/global/all.js"
        strategy="afterInteractive"
        onLoad={() => setCloudinaryReady(true)}
        onError={() => console.error("Could not load Cloudinary widget.")}
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
          className="flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>

      {/* Section heading */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <h2 className="mb-4 font-bold">Section Heading</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Type size={15} />
              Main Title
            </label>
            <input
              name="sectionTitle"
              value={Titles.sectionTitle}
              onChange={handleTitleChange}
              maxLength={80}
              placeholder="The Ultimate"
              defaultValue="The Ultimate"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Type size={15} />
              Highlighted Title
            </label>
            <input
              name="highlightedTitle"
              value={Titles.highlightedTitle}
              onChange={handleTitleChange}
              maxLength={80}
              placeholder="Resource."
              defaultValue="Resource."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>
        </div>
      </section>

      {/* Add new article */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Add New Article</h2>
          <Plus size={19} className="text-[#1e8a8a] dark:text-[#35b5b5]" />
        </div>

        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <ImagePlus size={15} />
          Article Image
        </label>
        <button
          type="button"
          onClick={uploadImage}
          disabled={!cloudinaryReady}
          className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] hover:bg-[#e7f5f5] disabled:opacity-60 dark:border-[#35b5b5] dark:text-[#35b5b5] dark:hover:bg-[#162c32]"
        >
          <ImagePlus size={16} />
          {cloudinaryReady ? "Upload Image" : "Loading uploader..."}
        </button>

        {/* Image preview */}
        <div className="mt-3">
          <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
            Image Preview
          </p>
          {article.image ? (
            <img
              src={article.image}
              alt="New article preview"
              className="h-36 w-full rounded-xl border border-gray-200 object-cover sm:w-64 dark:border-[#263442]"
            />
          ) : (
            <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 sm:w-64 dark:border-[#263442] dark:bg-[#16212c]">
              <div className="text-center">
                <ImagePlus size={24} className="mx-auto mb-2" />
                Image preview unavailable
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <CalendarDays size={15} />
              Day
            </label>
            <input
              name="day"
              type="number"
              min="1"
              max="31"
              placeholder="24"
              value={article.day}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <CalendarDays size={15} />
              Month
            </label>
            <select
              name="month"
              value={article.month}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            >
              <option value="JAN">JAN</option>
              <option value="FEB">FEB</option>
              <option value="MAR">MAR</option>
              <option value="APR">APR</option>
              <option value="MAY">MAY</option>
              <option value="JUN">JUN</option>
              <option value="JUL">JUL</option>
              <option value="AUG">AUG</option>
              <option value="SEP">SEP</option>
              <option value="OCT">OCT</option>
              <option value="NOV">NOV</option>
              <option value="DEC">DEC</option>
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Tag size={15} />
              Category
            </label>
            <input
              name="category"
              maxLength={40}
              placeholder="BUSINESS"
              value={article.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <UserRound size={15} />
              Author
            </label>
            <input
              name="author"
              maxLength={60}
              placeholder="Admin"
              value={article.author}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <Type size={15} />
              Article Title
            </label>
            <input
              name="title"
              maxLength={120}
              placeholder="Enter article title"
              value={article.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              <LinkIcon size={15} />
              Article Link
            </label>
            <input
              name="link"
              placeholder="/blog/my-article or https://example.com/article"
              value={article.link}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddArticle}
          className="mt-5 flex items-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60"
        >
          <Plus size={17} />
          Add Article
        </button>
      </section>

      {/* All articles */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-[#263442] dark:bg-[#111a23]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold">All Articles</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Click an article to edit its details.
            </p>
          </div>
          <span className="rounded-lg bg-[#e7f5f5] px-3 py-1.5 text-xs font-semibold text-[#1e8a8a] dark:bg-[#162c32] dark:text-[#35b5b5]">
            2 Articles
          </span>
        </div>

        <div className="space-y-3">
          {/* Article 1 — collapsed */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]">
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-[#16212c] dark:text-gray-500">
                <ImagePlus size={20} />
              </div>

              <button type="button" className="min-w-0 flex-1 text-left">
                <p className="text-xs font-semibold text-[#1e8a8a] dark:text-[#35b5b5]">
                  BUSINESS
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  How to grow your business
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  24 OCT · Admin
                </p>
              </button>

              <button
                type="button"
                aria-label="Edit article"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#16212c]"
              >
                <ChevronDown size={19} />
              </button>

              <button
                type="button"
                aria-label="Delete article"
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>

          {/* Article 2 — expanded */}
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-[#263442]">
            <div className="flex items-center gap-3 p-3">
              <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-[#16212c] dark:text-gray-500">
                <ImagePlus size={20} />
              </div>

              <button type="button" className="min-w-0 flex-1 text-left">
                <p className="text-xs font-semibold text-[#1e8a8a] dark:text-[#35b5b5]">
                  DESIGN
                </p>
                <p className="mt-1 truncate text-sm font-semibold">
                  Ten tips for better design
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  12 NOV · Admin
                </p>
              </button>

              <button
                type="button"
                aria-label="Collapse article"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-[#16212c]"
              >
                <ChevronUp size={19} />
              </button>

              <button
                type="button"
                aria-label="Delete article"
                className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <Trash2 size={17} />
              </button>
            </div>

            <div className="grid gap-4 border-t border-gray-200 p-4 sm:grid-cols-2 dark:border-[#263442]">
              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Article Image
                </label>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-[#1e8a8a] px-4 py-2.5 text-sm font-semibold text-[#1e8a8a] hover:bg-[#e7f5f5] disabled:opacity-60 dark:border-[#35b5b5] dark:text-[#35b5b5] dark:hover:bg-[#162c32]"
                >
                  <ImagePlus size={16} />
                  Replace Image
                </button>

                <div className="mt-3">
                  <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                    Image Preview
                  </p>
                  <div className="flex h-36 w-full items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400 sm:w-64 dark:border-[#263442] dark:bg-[#16212c]">
                    <div className="text-center">
                      <ImagePlus size={24} className="mx-auto mb-2" />
                      Image preview unavailable
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <CalendarDays size={15} />
                  Day
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="24"
                  defaultValue="12"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <CalendarDays size={15} />
                  Month
                </label>
                <select
                  defaultValue="NOV"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                >
                  <option value="JAN">JAN</option>
                  <option value="FEB">FEB</option>
                  <option value="MAR">MAR</option>
                  <option value="APR">APR</option>
                  <option value="MAY">MAY</option>
                  <option value="JUN">JUN</option>
                  <option value="JUL">JUL</option>
                  <option value="AUG">AUG</option>
                  <option value="SEP">SEP</option>
                  <option value="OCT">OCT</option>
                  <option value="NOV">NOV</option>
                  <option value="DEC">DEC</option>
                </select>
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Tag size={15} />
                  Category
                </label>
                <input
                  maxLength={40}
                  placeholder="BUSINESS"
                  defaultValue="DESIGN"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <UserRound size={15} />
                  Author
                </label>
                <input
                  maxLength={60}
                  placeholder="Admin"
                  defaultValue="Admin"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <Type size={15} />
                  Article Title
                </label>
                <input
                  maxLength={120}
                  placeholder="Enter article title"
                  defaultValue="Ten tips for better design"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <LinkIcon size={15} />
                  Article Link
                </label>
                <input
                  placeholder="/blog/my-article or https://example.com/article"
                  defaultValue="/blog/ten-tips"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-[#1e8a8a] dark:border-[#263442] dark:bg-[#16212c] dark:text-gray-100 dark:[color-scheme:dark] dark:placeholder:text-gray-500 dark:focus:border-[#35b5b5]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky save bar */}
      <div className="sticky bottom-3 flex justify-end rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur dark:border-[#263442] dark:bg-[#111a23]/95">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e8a8a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#176f6f] disabled:opacity-60 sm:w-auto"
        >
          <Save size={17} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
