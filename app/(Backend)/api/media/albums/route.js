import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import GallerySection from "@/Models/Media/Albums/AblumsSection";
import { NextResponse } from "next/server";

// GET gallery
export async function GET() {
  try {
    await connectDB();
    let data = await GallerySection.findOne().lean();
    if (!data) data = await GallerySection.create({});
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

// POST: save gallery OR delete one image
export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();
    const body = await request.json();

    // ── Delete image (Cloudinary + DB) ─────────────────────────────
    if (body?.action === "deleteImage") {
      const { publicId } = body;

      if (!publicId || typeof publicId !== "string") {
        return NextResponse.json(
          { success: false, message: "publicId is required" },
          { status: 400 },
        );
      }

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary destroy:", err.message);
        // still remove from DB
      }

      const data = await GallerySection.findOneAndUpdate(
        {},
        { $pull: { images: { publicId } } },
        { new: true, upsert: true },
      );

      return NextResponse.json({
        success: true,
        message: "Image deleted",
        data,
      });
    }

    // ── Full save (titles + images order) ──────────────────────────
    const data = await GallerySection.findOneAndUpdate(
      {},
      {
        $set: {
          translations: body.translations,
          images: body.images || [],
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    return NextResponse.json({
      success: true,
      message: "Gallery updated successfully",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
