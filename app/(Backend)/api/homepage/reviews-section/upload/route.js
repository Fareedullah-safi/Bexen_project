import { requireEditPermission } from "@/Lib/AdminPermission/adminPermissions";
import cloudinary from "@/Lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const permission = await requireEditPermission();

    if (!permission.authorized) {
      return permission.response;
    }
    const formData = await req.formData();
    const file = formData.get("file");
    const imageUrl = formData.get("imageUrl");

    let uploaded;

    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const base64String = `data:${file.type};base64,${buffer.toString("base64")}`;

      uploaded = await cloudinary.uploader.upload(base64String, {
        folder: "reviews",
      });
    } else if (typeof imageUrl === "string" && imageUrl.trim()) {
      let parsedUrl;

      try {
        parsedUrl = new URL(imageUrl.trim());
      } catch {
        return NextResponse.json(
          { success: false, message: "Invalid image URL" },
          { status: 400 },
        );
      }

      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { success: false, message: "Invalid image URL protocol" },
          { status: 400 },
        );
      }

      uploaded = await cloudinary.uploader.upload(parsedUrl.href, {
        folder: "reviews",
        resource_type: "image",
      });
    } else {
      return NextResponse.json(
        { success: false, message: "No file or image URL provided" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
  } catch (error) {
    console.error("Upload failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
        error: error.message,
      },
      { status: 500 },
    );
  }
}
