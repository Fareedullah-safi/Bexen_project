import {
  requireDeletePermission,
  requireEditPermission,
} from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import BlogSection from "@/Models/articles-section/BlogSection";
import { NextResponse } from "next/server";

// Delete an image from Cloudinary
async function deleteFromCloudinary(publicId) {
  //USER ADMIN CHECKS
  const permission = await requireDeletePermission();
  if (!permission.authorized) {
    return permission.response;
  }
  //USER ADMIN CHECKS
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Could not delete ${publicId}:`, err.message);
  }
}

// GET: Load blog section
export async function GET() {
  try {
    await connectDB();

    const data = await BlogSection.findOne();

    return NextResponse.json({
      success: true,
      data: data || {
        sectionTitle: "",
        highlightedTitle: "",
        posts: [],
      },
    });
  } catch (error) {
    console.error("GET Error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load data." },
      { status: 500 },
    );
  }
}

// POST: Add one article OR save the complete section
export async function POST(request) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }

    await connectDB();

    const { article, Titles } = await request.json();

    const newArticle = {
      day: Number(article.day || ""),
      month: String(article.month || "OCT").toUpperCase(),
      image: String(article.image || "").trim(),
      publicId: String(article.publicId || ""),
      category: String(article.category || "").trim(),
      author: String(article.author || "Admin").trim(),
      title: String(article.title || "").trim(),
      link: String(article.link || "").trim(),
    };

    if (
      !newArticle.day ||
      !newArticle.image ||
      !newArticle.category ||
      !newArticle.title ||
      !newArticle.link
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please fill all article fields and upload an image.",
        },
        { status: 400 },
      );
    }

    let section = await BlogSection.findOne();

    if (!section) {
      section = new BlogSection({
        sectionTitle: Titles?.sectionTitle || "The Ultimate",
        highlightedTitle: Titles?.highlightedTitle || "Resource.",
        posts: [newArticle],
      });
    } else {
      section.sectionTitle = Titles?.sectionTitle || section.sectionTitle;
      section.highlightedTitle =
        Titles?.highlightedTitle || section.highlightedTitle;

      section.posts.push(newArticle);
    }

    await section.save();

    return NextResponse.json(
      {
        success: true,
        message: "Article added successfully!",
        data: section,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Add article API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to add article.",
      },
      { status: 500 },
    );
  }
}
// DELETE: Remove one article using its MongoDB subdocument _id
export async function DELETE(req) {
  try {
    const permission = await requireDeletePermission();

    if (!permission.authorized) {
      return permission.response;
    }
    //USER ADMIN CHECKS

    await connectDB();

    const { _id } = await req.json();

    const section = await BlogSection.findOne();

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Section not found." },
        { status: 404 },
      );
    }

    const article = section.posts.id(_id);

    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found." },
        { status: 404 },
      );
    }

    const publicId = article.publicId;

    article.deleteOne();
    await section.save();

    if (publicId) {
      await deleteFromCloudinary(publicId);
    }

    return NextResponse.json({
      success: true,
      message: "Article deleted successfully.",
    });
  } catch (error) {
    console.error("Delete article error:", error);

    return NextResponse.json(
      { success: false, message: "Delete failed." },
      { status: 500 },
    );
  }
}

// PUT: Update one existing article
export async function PUT(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
    await connectDB();

    const { _id, article } = await req.json();

    // Find the section
    const section = await BlogSection.findOne();

    if (!section) {
      return NextResponse.json(
        { success: false, message: "Section not found." },
        { status: 404 },
      );
    }

    // Find the article by its _id
    const post = section.posts.id(_id);

    if (!post) {
      return NextResponse.json(
        { success: false, message: "Article not found." },
        { status: 404 },
      );
    }

    // Update the article fields
    post.day = Number(article.day);
    post.month = String(article.month || "OCT").toUpperCase();
    post.image = article.image;
    post.publicId = article.publicId;
    post.category = article.category;
    post.author = article.author;
    post.title = article.title;
    post.link = article.link;

    // Save changes
    await section.save();

    return NextResponse.json({
      success: true,
      message: "Article updated successfully!",
      data: post,
    });
  } catch (error) {
    console.error("Update article error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update article.",
      },
      { status: 500 },
    );
  }
}
