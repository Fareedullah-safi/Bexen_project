import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import BlogSection from "@/Models/articles-section/BlogSection";
import { NextResponse } from "next/server";

const LANGUAGES = ["en", "ps", "fa"];
const ARTICLE_FIELDS = ["day", "month", "category", "author", "title"];

const defaultTitles = () => ({
  en: { sectionTitle: "The Ultimate", highlightedTitle: "Resource." },
  ps: { sectionTitle: "", highlightedTitle: "" },
  fa: { sectionTitle: "", highlightedTitle: "" },
});

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeTranslations(translations = {}) {
  const result = {};

  for (const lang of LANGUAGES) {
    const source = translations?.[lang] || {};

    result[lang] = {
      day: cleanText(source.day),
      month: cleanText(source.month).toUpperCase(),
      category: cleanText(source.category),
      author: cleanText(source.author),
      title: cleanText(source.title),
    };
  }

  return result;
}

function normalizeTitles(titles = {}) {
  const result = {};

  for (const lang of LANGUAGES) {
    result[lang] = {
      sectionTitle: cleanText(titles?.[lang]?.sectionTitle),
      highlightedTitle: cleanText(titles?.[lang]?.highlightedTitle),
    };
  }

  return result;
}

function validateTranslations(translations) {
  for (const lang of LANGUAGES) {
    const label = { en: "English", ps: "Pashto", fa: "Dari" }[lang];
    const item = translations[lang];

    for (const field of ARTICLE_FIELDS) {
      if (!item[field]) {
        return `${label}: please complete the ${field} field.`;
      }
    }

    const day = Number(item.day);

    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return `${label}: day must be a number between 1 and 31.`;
    }
  }

  return "";
}

function validateTitles(titles) {
  for (const lang of LANGUAGES) {
    const label = { en: "English", ps: "Pashto", fa: "Dari" }[lang];

    if (!titles[lang].sectionTitle) {
      return `${label}: please complete the main section title.`;
    }

    if (!titles[lang].highlightedTitle) {
      return `${label}: please complete the highlighted title.`;
    }
  }

  return "";
}

function validateLink(value) {
  const link = cleanText(value);

  if (!link) return "Please enter the article link.";
  if (link.startsWith("//") || link.includes("\\") || /\s/.test(link)) {
    return "Please enter a valid article link.";
  }

  if (link.startsWith("/")) return "";

  try {
    const url = new URL(link);
    if (!["http:", "https:"].includes(url.protocol)) {
      return "Article links must use HTTP or HTTPS.";
    }
  } catch {
    return "Please enter a valid article link.";
  }

  return "";
}

async function deleteFromCloudinary(publicId) {
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.warn(`Could not delete ${publicId}:`, error.message);
  }
}

function jsonError(message, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

// GET: Return every language in one request.
export async function GET() {
  try {
    await connectDB();

    const section = await BlogSection.findOne().lean();

    console.log("Blog section found:", Boolean(section));
    console.log("Posts count:", section?.posts?.length);
    console.log("Posts data:", JSON.stringify(section?.posts, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        Titles: normalizeTitles(section?.Titles || defaultTitles()),
        posts: (section?.posts || []).map((post) => ({
          ...post,
          _id: String(post._id),
          image: post.image || "",
          publicId: post.publicId || "",
          link: post.link || "",
          translations: normalizeTranslations(post.translations),
        })),
      },
    });
  } catch (error) {
    console.error("GET articles section error:", error);
    return jsonError("Failed to load articles.", 500);
  }
}

// POST: Create an article containing all three translations.
export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    const body = await request.json();
    const image = cleanText(body.article?.image);
    const publicId = cleanText(body.article?.publicId);
    const link = cleanText(body.article?.link);
    const translations = normalizeTranslations(body.article?.translations);
    const titles = normalizeTitles(body.Titles);

    if (!image) return jsonError("Please upload an article image.");

    const linkError = validateLink(link);
    if (linkError) return jsonError(linkError);

    const translationError = validateTranslations(translations);
    if (translationError) return jsonError(translationError);

    const titleError = validateTitles(titles);
    if (titleError) return jsonError(titleError);

    let section = await BlogSection.findOne();

    const newArticle = { image, publicId, link, translations };

    if (!section) {
      section = new BlogSection({
        Titles: titles,
        posts: [newArticle],
      });
    } else {
      section.Titles = titles;
      section.posts.push(newArticle);
    }

    await section.save();

    const savedPost = section.posts[section.posts.length - 1];

    return NextResponse.json(
      {
        success: true,
        message: "Article added successfully.",
        data: {
          _id: String(savedPost._id),
          image: savedPost.image,
          publicId: savedPost.publicId,
          link: savedPost.link,
          translations: normalizeTranslations(savedPost.translations),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST articles section error:", error);
    return jsonError(error.message || "Failed to add article.", 500);
  }
}

// PUT: Save all headings, or update all translations for one article.
export async function PUT(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    const body = await request.json();
    const section = await BlogSection.findOne();

    if (!section) {
      return jsonError("Section not found.", 404);
    }

    // Save section headings.
    if (!body._id && body.Titles) {
      const titles = normalizeTitles(body.Titles);
      const titleError = validateTitles(titles);

      if (titleError) return jsonError(titleError);

      section.Titles = titles;
      await section.save();

      return NextResponse.json({
        success: true,
        message: "Section headings saved successfully.",
        data: { Titles: normalizeTitles(section.Titles) },
      });
    }

    // Update an existing article.
    if (!body._id) return jsonError("Article ID is required.");

    const post = section.posts.id(body._id);

    if (!post) return jsonError("Article not found.", 404);

    const image = cleanText(body.article?.image);
    const publicId = cleanText(body.article?.publicId);
    const link = cleanText(body.article?.link);
    const translations = normalizeTranslations(body.article?.translations);

    if (!image) return jsonError("Please upload an article image.");

    const linkError = validateLink(link);
    if (linkError) return jsonError(linkError);

    const translationError = validateTranslations(translations);
    if (translationError) return jsonError(translationError);

    post.image = image;
    post.publicId = publicId;
    post.link = link;
    post.translations = translations;

    await section.save();

    return NextResponse.json({
      success: true,
      message: "Article updated successfully.",
      data: {
        _id: String(post._id),
        image: post.image,
        publicId: post.publicId,
        link: post.link,
        translations: normalizeTranslations(post.translations),
      },
    });
  } catch (error) {
    console.error("PUT articles section error:", error);
    return jsonError(error.message || "Failed to update article.", 500);
  }
}

// DELETE: Remove the article and its Cloudinary image.
export async function DELETE(request) {
  try {
    const permission = await requireDeletePermission();
    if (!permission.authorized) return permission.response;

    await connectDB();

    const { _id } = await request.json();

    if (!_id) return jsonError("Article ID is required.");

    const section = await BlogSection.findOne();

    if (!section) return jsonError("Section not found.", 404);

    const post = section.posts.id(_id);

    if (!post) return jsonError("Article not found.", 404);

    const publicId = post.publicId;

    post.deleteOne();
    await section.save();

    await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE articles section error:", error);
    return jsonError("Delete failed.", 500);
  }
}
