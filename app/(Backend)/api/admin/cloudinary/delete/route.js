// app/api/admin/cloudinary/delete/route.js
import cloudinary from "@/Lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { message: "No publicId provided" },
        { status: 400 },
      );
    }

    // Destroy image in Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary Destroy Error:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
