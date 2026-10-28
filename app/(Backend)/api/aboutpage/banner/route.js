import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import connectDB from "@/Lib/mongoDB";
import AboutUsBanner from "@/Models/About-Page-Models/Banner/Banner";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const banner = await AboutUsBanner.findOne().lean();

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to load banner." },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const permission = await requireEditPermission();
    if (!permission.authorized) return permission.response;

    const { url, publicId } = await request.json();

    if (!url || !publicId) {
      return NextResponse.json(
        { success: false, message: "Image URL and public ID are required." },
        { status: 400 },
      );
    }

    const imageUrl = new URL(url);

    if (
      imageUrl.protocol !== "https:" ||
      imageUrl.hostname !== "res.cloudinary.com" ||
      !imageUrl.pathname.includes("/image/upload/") ||
      !publicId.startsWith("bexon/about-us/")
    ) {
      return NextResponse.json(
        { success: false, message: "Invalid Cloudinary image." },
        { status: 400 },
      );
    }

    await connectDB();

    const oldBanner = await AboutUsBanner.findOne();

    const banner = await AboutUsBanner.findOneAndUpdate(
      {},
      { url: imageUrl.href, publicId },
      { new: true, upsert: true, runValidators: true },
    );

    if (oldBanner?.publicId && oldBanner.publicId !== publicId) {
      try {
        await cloudinary.uploader.destroy(oldBanner.publicId, {
          invalidate: true,
        });
      } catch (error) {
        console.error("Old Cloudinary image cleanup failed:", error);
      }
    }

    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error("About Us banner POST:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save banner." },
      { status: 500 },
    );
  }
}
