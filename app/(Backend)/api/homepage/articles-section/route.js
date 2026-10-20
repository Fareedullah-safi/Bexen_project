import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import BlogSection from "@/Models/articles-section/BlogSection";
import { NextResponse } from "next/server";

// Helper: delete an image from Cloudinary by its public ID
async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.warn(`Could not delete ${publicId}:`, err.message);
  }
}

// ── GET: Load blog data ──

export async function GET() {
  try {
    await connectDB();
    const data = await BlogSection.findOne();

    if (!data) {
      return NextResponse.json({
        success: true,
        data: { sectionTitle: "", highlightedTitle: "", posts: [] },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load data." },
      { status: 500 },
    );
  }
}

// ── POST: Save all data + delete removed images ──

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { sectionTitle, highlightedTitle, posts } = body;

    if (!sectionTitle || !highlightedTitle) {
      return NextResponse.json(
        { success: false, message: "Section titles are required." },
        { status: 400 },
      );
    }

    if (!Array.isArray(posts)) {
      return NextResponse.json(
        { success: false, message: "Posts must be an array." },
        { status: 400 },
      );
    }

    // ── Step 1: Get old posts from MongoDB ──
    const existing = await BlogSection.findOne();
    const oldPublicIds = existing
      ? (existing.posts || []).map((p) => p.publicId).filter(Boolean) // Remove empty strings
      : [];

    // ── Step 2: Get new public IDs from incoming posts ──
    const newPublicIds = posts.map((p) => p.publicId).filter(Boolean);

    // ── Step 3: Find which images were removed ──
    const removedPublicIds = oldPublicIds.filter(
      (id) => !newPublicIds.includes(id),
    );

    // ── Step 4: Delete removed images from Cloudinary ──
    if (removedPublicIds.length > 0) {
      // Delete all removed images in parallel
      await Promise.all(removedPublicIds.map(deleteFromCloudinary));
    }

    // ── Step 5: Save updated data to MongoDB ──
    const saved = await BlogSection.findOneAndUpdate(
      {},
      { sectionTitle, highlightedTitle, posts },
      { new: true, upsert: true, runValidators: true },
    );

    return NextResponse.json({
      success: true,
      message: "Saved successfully.",
      deletedImages: removedPublicIds.length,
      data: saved,
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save." },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    await connectDB();

    const { _id } = await req.json();

    const section = await BlogSection.findOne();
    const article = section?.posts.id(_id);

    if (!article) {
      return NextResponse.json(
        { success: false, message: "Article not found." },
        { status: 404 },
      );
    }

    if (article.publicId) {
      await cloudinary.uploader.destroy(article.publicId);
    }

    article.deleteOne();
    await section.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete article error:", error);

    return NextResponse.json(
      { success: false, message: "Delete failed." },
      { status: 500 },
    );
  }
}
