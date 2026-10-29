import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import VideoGallery from "@/Models/Media/Videos/Videos";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    let data = await VideoGallery.findOne().lean();
    if (!data) data = await VideoGallery.create({}); // Create default if missing
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    await connectDB();
    const body = await request.json();

    // --- Action: Delete a single video & destroy its thumbnail ---
    if (body?.action === "deleteVideo") {
      const { videoId, publicId } = body;

      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Cloudinary destroy failed:", err.message);
        }
      }

      const data = await VideoGallery.findOneAndUpdate(
        {},
        { $pull: { videos: { id: videoId } } },
        { new: true, upsert: true },
      );

      return NextResponse.json({
        success: true,
        message: "Video deleted",
        data,
      });
    }

    // --- Action: Full Save (Update page text & array order/edits) ---
    const data = await VideoGallery.findOneAndUpdate(
      {},
      {
        $set: {
          translations: body.translations,
          videos: body.videos || [],
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
      message: "Gallery updated",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
