import { NextResponse } from "next/server";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/lib/mongoDB";
import BlogSection from "@/Models/articles-section/BlogSection";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
